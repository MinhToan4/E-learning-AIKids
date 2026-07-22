import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  advancePhase,
  assemblePrompt,
  assertArtStyleId,
  buildCharacterLabel,
  buildQuestStatuses,
  can,
  getArtStyle,
  isCharacterShapeId,
  isCharacterVibeId,
  isCourseCreatedAsset,
  isUsableImageReference,
  isPromptComplete,
  parseCourseSketchDataUrl,
  resolveStations,
  scoreStars,
  validateChildText,
  xpForStars,
  type PromptParts,
  type QuestStatus,
} from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'
import {
  generatePracticeImage,
  generatePracticeVideo,
} from '../../infrastructure/generation/vidtory.adapter.js'
import { resolveStudentQuestStatus } from '../../shared/access/quest-access.js'
import { requireRole, requireUser } from '../../infrastructure/session/session.js'
import {
  bumpStreakOnActivity,
  evaluateAndUnlockAchievements,
} from '../gamification/achievement.service.js'
import { assertStudentCanEnroll } from '../parent/family.service.js'
import {
  inspectPracticePayload,
  practiceKindMatchesQuest,
} from './practice-policy.js'

const gameEvidenceSchema = z.object({
  gameType: z.enum(['match', 'drag', 'spin', 'sort', 'order', 'detective', 'pick']),
  choices: z.array(z.string().min(1).max(80)).max(8),
  attempts: z.number().int().min(1).max(100),
  durationMs: z.number().int().min(0).max(10 * 60 * 1000),
})

function mergeProgressData(
  current: string | null,
  patch: Record<string, unknown>,
): string {
  let base: Record<string, unknown> = {}
  try {
    const parsed = current ? JSON.parse(current) : null
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      base = parsed as Record<string, unknown>
    }
  } catch {
    base = {}
  }
  return JSON.stringify({ ...base, ...patch })
}

export async function progressRoutes(app: FastifyInstance) {
  app.post('/api/enrollments', async (request, reply) => {
    const user = requireRole(request, ['student'])
    if (!can(user.role, 'progress:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z.object({ courseId: z.string().min(1) }).parse(request.body)
    const course = await prisma.course.findUnique({
      where: { id: body.courseId },
      include: { quests: { orderBy: { order: 'asc' } } },
    })
    if (!course || course.status === 'soon') {
      return reply.code(400).send({ error: 'Khóa học chưa mở' })
    }

    // Household plan gate via parent entitlement
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: user.id, courseId: course.id },
      },
    })
    if (!existing) {
      try {
        await assertStudentCanEnroll(user.id)
      } catch (e) {
        const err = e as Error & { statusCode?: number; logCode?: string }
        request.log.warn(
          {
            userId: user.id,
            courseId: course.id,
            logCode: err.logCode,
            err: err.message,
          },
          'progress.enroll denied',
        )
        throw e
      }
    }

    await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: user.id, courseId: course.id },
      },
      create: { userId: user.id, courseId: course.id },
      update: {},
    })

    for (const q of course.quests) {
      const status = q.order === 1 ? 'available' : 'locked'
      await prisma.questProgress.upsert({
        where: {
          userId_questId: { userId: user.id, questId: q.id },
        },
        create: {
          userId: user.id,
          questId: q.id,
          status,
          phase: 'learn',
        },
        update: {},
      })
    }

    return reply.code(201).send({ ok: true, courseId: course.id })
  })

  app.get('/api/progress/:courseId', async (request) => {
    const user = requireUser(request)
    if (!can(user.role, 'progress:read')) {
      const err = new Error('Forbidden') as Error & { statusCode: number }
      err.statusCode = 403
      throw err
    }
    const { courseId } = request.params as { courseId: string }

    let studentId = user.id
    if (user.role === 'parent') {
      const q = request.query as { childId?: string }
      if (!q.childId) {
        const err = new Error('childId required') as Error & { statusCode: number }
        err.statusCode = 400
        throw err
      }
      const child = await prisma.user.findFirst({
        where: { id: q.childId, parentId: user.id, role: 'student' },
      })
      if (!child) {
        const err = new Error('Forbidden') as Error & { statusCode: number }
        err.statusCode = 403
        throw err
      }
      studentId = child.id
    } else if (user.role === 'teacher') {
      const q = request.query as { childId?: string }
      if (!q.childId) {
        const err = new Error('childId required') as Error & { statusCode: number }
        err.statusCode = 400
        throw err
      }
      // IDOR guard: child must be in a class taught by this teacher
      const classroom = await prisma.classRoom.findFirst({
        where: {
          teacherId: user.id,
          students: { some: { id: q.childId, role: 'student' } },
        },
      })
      if (!classroom) {
        const err = new Error('Forbidden') as Error & { statusCode: number }
        err.statusCode = 403
        throw err
      }
      studentId = q.childId
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { quests: { orderBy: { order: 'asc' } } },
    })
    if (!course) {
      const err = new Error('Not found') as Error & { statusCode: number }
      err.statusCode = 404
      throw err
    }

    const rows = await prisma.questProgress.findMany({
      where: {
        userId: studentId,
        questId: { in: course.quests.map((q) => q.id) },
      },
    })
    const progressMap = new Map(
      rows.map((r) => [
        r.questId,
        {
          questId: r.questId,
          status: r.status as QuestStatus,
          phase: r.phase as 'learn' | 'practice' | 'check',
          stars: r.stars,
          xpEarned: r.xpEarned,
        },
      ]),
    )

    const statuses = buildQuestStatuses(
      course.quests.map((q) => ({ id: q.id, order: q.order })),
      progressMap,
    )

    if (user.role === 'student' && studentId === user.id) {
      for (const q of course.quests) {
        const computed = statuses.get(q.id)!
        const existing = progressMap.get(q.id)
        if (!existing) {
          await prisma.questProgress.create({
            data: {
              userId: studentId,
              questId: q.id,
              status: computed,
              phase: 'learn',
            },
          })
          progressMap.set(q.id, {
            questId: q.id,
            status: computed,
            phase: 'learn',
            stars: 0,
            xpEarned: 0,
          })
        } else if (existing.status === 'locked' && computed === 'available') {
          await prisma.questProgress.update({
            where: {
              userId_questId: { userId: studentId, questId: q.id },
            },
            data: { status: 'available' },
          })
          existing.status = 'available'
        }
      }
    }

    const quests = course.quests.map((q) => {
      const p = progressMap.get(q.id)
      const status = (
        p?.status === 'completed' ? 'completed' : statuses.get(q.id)
      ) as QuestStatus
      return {
        id: q.id,
        order: q.order,
        title: q.title,
        skill: q.skill,
        reward: q.reward,
        duration: q.duration,
        hook: q.hook,
        accent: q.accent,
        practiceKind: q.practiceKind,
        status,
        phase: p?.phase ?? 'learn',
        stars: p?.stars ?? 0,
        xpEarned: p?.xpEarned ?? 0,
      }
    })

    return {
      courseId,
      totalStars: quests.reduce((s, q) => s + q.stars, 0),
      totalXp: quests.reduce((s, q) => s + q.xpEarned, 0),
      completedCount: quests.filter((q) => q.status === 'completed').length,
      quests,
    }
  })

  app.post('/api/progress/:questId/start', async (request, reply) => {
    const user = requireRole(request, ['student'])
    const { questId } = request.params as { questId: string }
    const access = await resolveStudentQuestStatus(user.id, questId)
    if (!access.ok) {
      if (access.reason === 'not_found') {
        return reply.code(404).send({ error: 'Not found' })
      }
      return reply
        .code(403)
        .send({ error: 'Trạm này chưa mở. Hoàn thành trạm trước nhé!' })
    }

    await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: user.id, courseId: access.courseId },
      },
      create: { userId: user.id, courseId: access.courseId },
      update: {},
    })

    const status = access.status
    const row = await prisma.questProgress.upsert({
      where: { userId_questId: { userId: user.id, questId } },
      create: {
        userId: user.id,
        questId,
        status: status === 'completed' ? 'completed' : 'in_progress',
        phase: status === 'completed' ? 'check' : 'learn',
      },
      update: {
        status: status === 'completed' ? 'completed' : 'in_progress',
      },
    })

    return {
      progress: {
        questId: row.questId,
        status: row.status,
        phase: row.phase,
        stars: row.stars,
        xpEarned: row.xpEarned,
      },
    }
  })

  app.post('/api/progress/:questId/advance', async (request, reply) => {
    const user = requireRole(request, ['student'])
    const { questId } = request.params as { questId: string }
    const access = await resolveStudentQuestStatus(user.id, questId)
    if (!access.ok) {
      if (access.reason === 'not_found') {
        return reply.code(404).send({ error: 'Not found' })
      }
      return reply
        .code(403)
        .send({ error: 'Trạm này chưa mở. Hoàn thành trạm trước nhé!' })
    }

    const body = z
      .object({
        fromPhase: z.enum(['learn', 'game', 'practice', 'check']).optional(),
        gameEvidence: gameEvidenceSchema.optional(),
      })
      .parse(request.body ?? {})

    const row = await prisma.questProgress.findUnique({
      where: { userId_questId: { userId: user.id, questId } },
    })
    if (!row) return reply.code(404).send({ error: 'Chưa bắt đầu trạm' })

    if (body.fromPhase && body.fromPhase !== row.phase) {
      return reply.code(409).send({
        error: 'Bài học vừa được cập nhật. Mình tiếp tục ở phần đang làm nhé!',
        reason: 'phase_mismatch',
        currentPhase: row.phase,
      })
    }

    const current = row.phase as
      | 'learn'
      | 'game'
      | 'practice'
      | 'check'
    const { phase, complete } = advancePhase(current)

    if (complete) {
      await prisma.questProgress.update({
        where: { id: row.id },
        data: { phase: 'check' },
      })
      return { phase: 'check', complete: false, needCheck: true }
    }

    const gameData =
      current === 'game' && body.gameEvidence
        ? mergeProgressData(row.dataJson, { game: body.gameEvidence })
        : undefined
    const updated = await prisma.questProgress.update({
      where: { id: row.id },
      data: { phase, status: 'in_progress', dataJson: gameData },
    })
    return {
      phase: updated.phase,
      complete: false,
      gameRecorded: Boolean(gameData),
      progress: {
        questId: updated.questId,
        status: updated.status,
        phase: updated.phase,
        stars: updated.stars,
        xpEarned: updated.xpEarned,
      },
    }
  })

  app.post('/api/progress/:questId/practice', async (request, reply) => {
    const user = requireRole(request, ['student'])
    const { questId } = request.params as { questId: string }
    const access = await resolveStudentQuestStatus(user.id, questId)
    if (!access.ok) {
      if (access.reason === 'not_found') {
        return reply.code(404).send({ error: 'Not found' })
      }
      return reply
        .code(403)
        .send({ error: 'Trạm này chưa mở. Hoàn thành trạm trước nhé!' })
    }

    const body = z
      .object({
        kind: z.string(),
        payload: z.record(z.unknown()),
      })
      .parse(request.body)

    const quest = await prisma.quest.findUnique({ where: { id: questId } })
    if (!quest) return reply.code(404).send({ error: 'Not found' })

    const progress = await prisma.questProgress.findUnique({
      where: { userId_questId: { userId: user.id, questId } },
      select: { phase: true, status: true, dataJson: true },
    })
    if (!progress || progress.phase !== 'practice') {
      return reply.code(409).send({
        error: 'Con hãy hoàn thành phần Học và Game trước khi thực hành.',
        reason: 'phase_mismatch',
        currentPhase: progress?.phase ?? 'not_started',
      })
    }

    if (!practiceKindMatchesQuest(body.kind, quest.practiceKind)) {
      return reply.code(400).send({
        error: 'Loại thực hành không khớp với bài học.',
        reason: 'practice_kind_mismatch',
      })
    }

    const payloadInspection = inspectPracticePayload(body.payload)
    if (!payloadInspection.ok) {
      return reply.code(400).send({
        error: payloadInspection.message,
        reason: payloadInspection.safetyReason ?? payloadInspection.reason,
      })
    }

    const freeText = body.payload.freeText
    if (typeof freeText === 'string' && freeText.trim()) {
      const safe = validateChildText(freeText)
      if (!safe.ok) {
        return reply.code(400).send({ error: safe.message, reason: safe.reason })
      }
    }
    const nickname = body.payload.nickname
    if (typeof nickname === 'string' && nickname.trim()) {
      const safe = validateChildText(nickname)
      if (!safe.ok) {
        return reply.code(400).send({ error: safe.message, reason: safe.reason })
      }
    }

    let result: Record<string, unknown> = { saved: true }

    async function resolveRefUrls(
      payload: Record<string, unknown>,
    ): Promise<string[]> {
      const out: string[] = []
      // Raw arbitrary URLs from client are IGNORED for safety — only owned course assets
      const assetIds = payload.assetIds
      if (Array.isArray(assetIds) && assetIds.length > 0) {
        const ids = assetIds.filter((x): x is string => typeof x === 'string')
        if (ids.length) {
          const owned = await prisma.asset.findMany({
            where: { userId: user.id, id: { in: ids } },
          })
          for (const a of owned) {
            let meta: Record<string, unknown> = {}
            try {
              meta = a.metaJson ? JSON.parse(a.metaJson) : {}
            } catch {
              meta = {}
            }
            if (
              !isCourseCreatedAsset({
                questId: a.questId,
                type: a.type,
                meta,
              })
            ) {
              continue
            }
            if (isUsableImageReference(a.thumbnail)) out.push(a.thumbnail)
          }
        }
      }
      return [...new Set(out)]
    }

    if (body.kind === 'prompt' || body.kind === 'chips') {
      const parts = body.payload.parts as PromptParts | undefined
      if (parts) {
        const promptText = assemblePrompt(parts)
        const complete = isPromptComplete(parts)
        const refUrls = await resolveRefUrls(body.payload)
        const generated = complete
          ? await generatePracticeImage(promptText, user.id, { refUrls })
          : null
        result = {
          promptText,
          complete,
          generated: generated
            ? {
                id: generated.id,
                title: generated.title,
                imageDataUrl: generated.imageUrl,
                imageUrl: generated.imageUrl,
              }
            : null,
          hint: complete ? null : 'Ghép đủ 5 thẻ để AI vẽ nhé!',
        }
        if (generated) {
          await prisma.asset.create({
            data: {
              userId: user.id,
              type: 'panel',
              name: generated.title,
              questId,
              thumbnail: generated.imageUrl,
              private: true,
              metaJson: JSON.stringify({
                prompt: promptText,
                generationMode: generated.mode,
                modelId: generated.modelId,
                refStrategy: generated.refStrategy,
                storageBackend: generated.storageBackend ?? 'vidtory_cdn',
                aikids_user_id: user.id,
                refUrls,
              }),
            },
          })
        }
      }
    }

    if (body.kind === 'character') {
      const name = String(body.payload.name ?? 'Bạn mới').trim()
      const nameSafe = validateChildText(name)
      if (!nameSafe.ok) {
        return reply.code(400).send({ error: nameSafe.message })
      }
      const shapeId = String(body.payload.shapeId ?? 'animal')
      const vibeId = String(body.payload.vibeId ?? 'cute')
      if (!isCharacterShapeId(shapeId) || !isCharacterVibeId(vibeId)) {
        return reply.code(400).send({ error: 'Hình dạng hoặc tính cách chưa hợp lệ' })
      }
      const label = buildCharacterLabel({ name, shapeId, vibeId })
      const traits = { shapeId, vibeId, ...(body.payload.traits as object) }
      const thumb = await generatePracticeImage(
        `nhân vật clay soft ${label}`,
        user.id,
      )
      const asset = await prisma.asset.create({
        data: {
          userId: user.id,
          type: 'character',
          name: label,
          questId,
          thumbnail: thumb.imageUrl,
          private: true,
          metaJson: JSON.stringify({
            ...traits,
            generationMode: thumb.mode,
          }),
        },
      })
      result = {
        asset: {
          id: asset.id,
          name: asset.name,
          type: asset.type,
          url: asset.thumbnail,
        },
        label,
      }
    }

    if (body.kind === 'sketch') {
      const sketchRaw =
        body.payload.sketchDataUrl ??
        body.payload.imageDataUrl ??
        body.payload.dataUrl
      const parsed = parseCourseSketchDataUrl(sketchRaw)
      if (!parsed.ok) {
        return reply.code(400).send({ error: parsed.message })
      }
      const note =
        typeof body.payload.text === 'string'
          ? body.payload.text.trim().slice(0, 200)
          : ''
      if (note) {
        const safe = validateChildText(note)
        if (!safe.ok) {
          return reply.code(400).send({ error: safe.message, reason: safe.reason })
        }
      }
      const asset = await prisma.asset.create({
        data: {
          userId: user.id,
          type: 'panel',
          name: note || `Bản vẽ · ${quest.title}`.slice(0, 80),
          questId,
          thumbnail: parsed.dataUrl,
          private: true,
          metaJson: JSON.stringify({
            kind: 'sketch',
            purpose: 'course_sketch',
            courseCreated: true,
            mime: parsed.mime,
            approxBytes: parsed.approxBytes,
            note: note || null,
            aikids_user_id: user.id,
            // Storage: data URL in DB until promote / private cloud (documented)
            storageBackend: 'inline_data_url',
          }),
        },
      })
      result = {
        saved: true,
        kind: 'sketch',
        asset: {
          id: asset.id,
          url: asset.thumbnail,
          questId: asset.questId,
          courseCreated: true,
        },
        message: 'Đã lưu bản vẽ vào ba lô (sản phẩm khóa học — dùng làm ref sau).',
      }
    }

    if (body.kind === 'ai_pick' || body.kind === 'journal' || body.kind === 'palette' || body.kind === 'spin' || body.kind === 'match' || body.kind === 'drag' || body.kind === 'reflect') {
      const free =
        typeof body.payload.text === 'string'
          ? body.payload.text
          : typeof body.payload.freeText === 'string'
            ? body.payload.freeText
            : ''
      if (free.trim()) {
        const safe = validateChildText(free)
        if (!safe.ok) {
          return reply.code(400).send({ error: safe.message, reason: safe.reason })
        }
      }
      let generated = null as null | Record<string, unknown>
      if (body.kind === 'ai_pick') {
        const prompt = String(
          body.payload.prompt ?? (free || 'thế giới clay dễ thương'),
        )
        const refUrls = await resolveRefUrls(body.payload)
        const img = await generatePracticeImage(prompt, user.id, { refUrls })
        generated = {
          id: img.id,
          title: img.title,
          imageDataUrl: img.imageUrl,
          imageUrl: img.imageUrl,
        }
        await prisma.asset.create({
          data: {
            userId: user.id,
            type: 'panel',
            name: img.title,
            questId,
            thumbnail: img.imageUrl,
            private: true,
            metaJson: JSON.stringify({
              prompt,
              generationMode: img.mode,
              kind: 'ai_pick',
              courseCreated: true,
              modelId: img.modelId,
              refStrategy: img.refStrategy,
              storageBackend: img.storageBackend ?? 'vidtory_cdn',
              aikids_user_id: user.id,
              refUrls,
            }),
          },
        })
      }
      result = {
        saved: true,
        kind: body.kind,
        payload: body.payload,
        generated,
      }
    }

    if (body.kind === 'style') {
      const styleIdRaw = String(body.payload.styleId ?? '')
      let styleId
      try {
        styleId = assertArtStyleId(styleIdRaw)
      } catch (e) {
        return reply.code(400).send({
          error: e instanceof Error ? e.message : 'Phong cách không hợp lệ',
        })
      }
      const style = getArtStyle(styleId)
      // Designer pack path — warm Soft Clay cards, not neon SaaS chrome
      const thumbnail = `/assets/designer/styles/art-style-${
        styleId === '3d' ? '3D' : styleId === 'fabric' ? 'farbic' : styleId
      }.jpeg`
      const asset = await prisma.asset.create({
        data: {
          userId: user.id,
          type: 'sticker',
          name: `Style · ${style.labelVi}`,
          questId,
          thumbnail,
          private: true,
          metaJson: JSON.stringify({ styleId, tip: style.tip }),
        },
      })
      result = {
        asset: {
          id: asset.id,
          name: asset.name,
          type: asset.type,
          url: asset.thumbnail,
        },
        style: { id: style.id, labelVi: style.labelVi, tip: style.tip },
      }
    }

    if (body.kind === 'story') {
      result = { outline: body.payload, saved: true }
    }

    if (body.kind === 'comic') {
      const title = String(body.payload.title ?? 'Truyện của con')
      const project = await prisma.project.create({
        data: {
          userId: user.id,
          title,
          kind: 'comic',
          // Designer art-comic card — consistent with AIkid lobby
          thumbnail: '/assets/designer/lobby/art-comic.jpeg',
          private: true,
          shareStatus: 'private',
          dataJson: JSON.stringify(body.payload),
        },
      })
      const newAchievements = await evaluateAndUnlockAchievements(user.id)
      result = {
        project: {
          id: project.id,
          title: project.title,
          kind: project.kind,
          thumbnail: project.thumbnail,
        },
        newAchievements,
      }
    }

    if (body.kind === 'video') {
      const title = String(body.payload.title ?? 'Video của con')
      const prompt = String(
        body.payload.prompt ??
          body.payload.freeText ??
          title ??
          'clip soft clay dễ thương cho trẻ em',
      )
      let refUrls = await resolveRefUrls(body.payload)
      // Fallback: latest COURSE-created assets only (never free uploads)
      if (refUrls.length === 0) {
        const lastImgs = await prisma.asset.findMany({
          where: {
            userId: user.id,
            type: { in: ['panel', 'character'] },
            private: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 12,
        })
        refUrls = lastImgs
          .filter((a) => {
            let meta: Record<string, unknown> = {}
            try {
              meta = a.metaJson ? JSON.parse(a.metaJson) : {}
            } catch {
              meta = {}
            }
            return isCourseCreatedAsset({
              questId: a.questId,
              type: a.type,
              meta,
            })
          })
          .slice(0, 4)
          .map((a) => a.thumbnail)
          .filter(isUsableImageReference)
      }
      const generatedVideo = await generatePracticeVideo(prompt, user.id, {
        refUrls,
      })
      const project = await prisma.project.create({
        data: {
          userId: user.id,
          title,
          kind: 'video',
          thumbnail: generatedVideo.videoUrl || '/assets/story-workshop.jpg',
          private: true,
          shareStatus: 'private',
          dataJson: JSON.stringify({
            ...body.payload,
            prompt,
            videoUrl: generatedVideo.videoUrl || null,
            generationMode: generatedVideo.mode,
            generationSource: generatedVideo.source,
            modelId: generatedVideo.modelId,
            videoMode: generatedVideo.videoMode,
            refStrategy: generatedVideo.refStrategy,
            storageBackend: generatedVideo.storageBackend ?? 'vidtory_cdn',
            aikids_user_id: user.id,
            refUrls,
          }),
        },
      })
      const newAchievements = await evaluateAndUnlockAchievements(user.id)
      result = {
        project: {
          id: project.id,
          title: project.title,
          kind: project.kind,
          thumbnail: project.thumbnail,
        },
        generated: {
          id: generatedVideo.id,
          title: generatedVideo.title,
          videoUrl: generatedVideo.videoUrl,
        },
        newAchievements,
      }
    }

    if (body.kind === 'detective') {
      result = {
        correct: Boolean(body.payload.pickedCorrect),
        message: body.payload.pickedCorrect
          ? 'Giỏi quá! Con đã kiểm tra AI rất tinh mắt.'
          : 'Gần đúng rồi — thử nhìn kỹ chi tiết hơn nhé!',
      }
    }

    await prisma.questProgress.upsert({
      where: { userId_questId: { userId: user.id, questId } },
      create: {
        userId: user.id,
        questId,
        status: 'in_progress',
        phase: 'practice',
        dataJson: mergeProgressData(null, { practice: body.payload }),
      },
      update: {
        status: 'in_progress',
        phase: 'practice',
        dataJson: mergeProgressData(progress.dataJson, { practice: body.payload }),
      },
    })

    return { ok: true, result }
  })

  app.post('/api/progress/:questId/check', async (request, reply) => {
    const user = requireRole(request, ['student'])
    const { questId } = request.params as { questId: string }
    const access = await resolveStudentQuestStatus(user.id, questId)
    if (!access.ok) {
      if (access.reason === 'not_found') {
        return reply.code(404).send({ error: 'Not found' })
      }
      return reply
        .code(403)
        .send({ error: 'Trạm này chưa mở. Hoàn thành trạm trước nhé!' })
    }

    const body = z
      .object({
        answers: z.array(
          z.object({
            questionId: z.string(),
            optionIndex: z.number().int().min(0),
          }),
        ),
      })
      .parse(request.body)

    const quest = await prisma.quest.findUnique({ where: { id: questId } })
    if (!quest) return reply.code(404).send({ error: 'Not found' })

    const progress = await prisma.questProgress.findUnique({
      where: { userId_questId: { userId: user.id, questId } },
      select: { phase: true, status: true },
    })
    if (!progress || progress.phase !== 'check') {
      return reply.code(409).send({
        error: 'Con hãy hoàn thành phần thực hành trước khi làm Check.',
        reason: 'phase_mismatch',
        currentPhase: progress?.phase ?? 'not_started',
      })
    }

    const questions = JSON.parse(quest.checkJson) as Array<{
      id: string
      question: string
      options: string[]
      correctIndex: number
      explain: string
    }>

    // Require an explicit answer for every question (no silent default to 0)
    for (const q of questions) {
      const ans = body.answers.find((a) => a.questionId === q.id)
      if (ans === undefined) {
        return reply.code(400).send({
          error: 'Hãy chọn đáp án cho mọi câu hỏi nhé!',
        })
      }
      if (ans.optionIndex < 0 || ans.optionIndex >= q.options.length) {
        return reply.code(400).send({ error: 'Đáp án không hợp lệ' })
      }
    }

    let correct = 0
    const details = questions.map((q) => {
      const ans = body.answers.find((a) => a.questionId === q.id)!
      const isCorrect = ans.optionIndex === q.correctIndex
      if (isCorrect) correct += 1
      return {
        questionId: q.id,
        correct: isCorrect,
        explain: q.explain,
        correctIndex: q.correctIndex,
      }
    })

    const stars = scoreStars(correct, questions.length)
    const xp = xpForStars(stars)
    const next = await prisma.quest.findFirst({
      where: { courseId: quest.courseId, order: quest.order + 1 },
    })
    const isCurrentCurriculumFinal =
      !next && /^(l1|l2)-k[1-6]-/.test(quest.courseId)
    if (isCurrentCurriculumFinal && correct < questions.length) {
      return reply.code(400).send({
        error:
          'Sản phẩm cuối khóa còn tiêu chí cần hoàn thiện. Con chỉnh lại rồi kiểm tra lần nữa nhé!',
        correct,
        total: questions.length,
        details,
      })
    }

    const prev = await prisma.questProgress.findUnique({
      where: { userId_questId: { userId: user.id, questId } },
    })
    const alreadyDone = prev?.status === 'completed'
    const xpGain = alreadyDone ? 0 : xp
    const starsFinal = alreadyDone ? Math.max(prev?.stars ?? 0, stars) : stars

    await prisma.questProgress.upsert({
      where: { userId_questId: { userId: user.id, questId } },
      create: {
        userId: user.id,
        questId,
        status: 'completed',
        phase: 'check',
        stars: starsFinal,
        xpEarned: xp,
      },
      update: {
        status: 'completed',
        phase: 'check',
        stars: starsFinal,
        xpEarned: alreadyDone ? prev!.xpEarned : xp,
      },
    })

    if (xpGain > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          xp: { increment: xpGain },
          level: {
            set: Math.max(1, Math.floor((user.xp + xpGain) / 100) + 1),
          },
        },
      })
    }

    if (next) {
      await prisma.questProgress.upsert({
        where: { userId_questId: { userId: user.id, questId: next.id } },
        create: {
          userId: user.id,
          questId: next.id,
          status: 'available',
          phase: 'learn',
        },
        update: {},
      })
      await prisma.questProgress.updateMany({
        where: {
          userId: user.id,
          questId: next.id,
          status: 'locked',
        },
        data: { status: 'available' },
      })
    }

    if (!alreadyDone) {
      await prisma.asset.create({
        data: {
          userId: user.id,
          type: 'badge',
          name: quest.reward,
          questId,
          thumbnail: '/assets/ui-badges.jpg',
          private: true,
          metaJson: JSON.stringify({ stars: starsFinal }),
        },
      })
      await bumpStreakOnActivity(user.id)
    }

    let courseCredential: string | null = null
    if (!next && !alreadyDone) {
      const course = await prisma.course.findUnique({
        where: { id: quest.courseId },
        select: { id: true, title: true, recognitionJson: true },
      })
      if (course) {
        try {
          const recognition = JSON.parse(course.recognitionJson) as {
            issuer?: string
            credential?: string
            finalAssessment?: string
          }
          const credential = recognition.credential
          const issuer = recognition.issuer
          if (credential && issuer) {
            const achievementType = `course_complete:${course.id}`
            await prisma.$transaction(async (tx) => {
              await tx.achievement.create({
                data: { userId: user.id, type: achievementType },
              })
              await tx.asset.create({
                data: {
                  userId: user.id,
                  type: 'badge',
                  name: credential,
                  questId,
                  thumbnail: '/assets/ui-badges.jpg',
                  private: true,
                  metaJson: JSON.stringify({
                    courseId: course.id,
                    courseCompletion: true,
                    issuer,
                    finalAssessment: recognition.finalAssessment ?? null,
                  }),
                },
              })
              await tx.notification.create({
                data: {
                  userId: user.id,
                  type: 'course_completion',
                  title: '🎓 Hoàn thành khóa học',
                  body: `${credential} · ${issuer}`,
                  data: JSON.stringify({
                    courseId: course.id,
                    achievementType,
                  }),
                },
              })
            })
            courseCredential = credential
          }
        } catch {
          // Invalid/duplicate recognition data must not block lesson completion.
        }
      }
    }

    const newAchievements = alreadyDone
      ? []
      : await evaluateAndUnlockAchievements(user.id)

    return {
      correct,
      total: questions.length,
      stars: starsFinal,
      xpEarned: alreadyDone ? prev!.xpEarned : xp,
      xpGain,
      details,
      nextQuestId: next?.id ?? null,
      newAchievements,
      courseCredential,
      message:
        starsFinal >= 3
          ? 'Xuất sắc! Con đã chinh phục trạm này!'
          : starsFinal >= 2
            ? 'Tuyệt vời! Con làm tốt lắm!'
            : 'Con đã hoàn thành! Thử lại sau để lấy thêm sao nhé!',
    }
  })
}
