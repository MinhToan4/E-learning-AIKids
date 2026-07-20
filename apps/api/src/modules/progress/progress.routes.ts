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
  isPromptComplete,
  scoreStars,
  validateChildText,
  xpForStars,
  type PromptParts,
  type QuestStatus,
} from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'
import { mockGenerateImage } from '../../shared/generation/mock-image.js'
import { resolveStudentQuestStatus } from '../../shared/access/quest-access.js'
import { requireRole, requireUser } from '../../infrastructure/session/session.js'

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
        fromPhase: z.enum(['learn', 'practice', 'check']).optional(),
      })
      .parse(request.body ?? {})

    const row = await prisma.questProgress.findUnique({
      where: { userId_questId: { userId: user.id, questId } },
    })
    if (!row) return reply.code(404).send({ error: 'Chưa bắt đầu trạm' })

    const current = (body.fromPhase ?? row.phase) as
      | 'learn'
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

    const updated = await prisma.questProgress.update({
      where: { id: row.id },
      data: { phase, status: 'in_progress' },
    })
    return {
      phase: updated.phase,
      complete: false,
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

    if (body.kind === 'prompt' || body.kind === 'chips') {
      const parts = body.payload.parts as PromptParts | undefined
      if (parts) {
        const promptText = assemblePrompt(parts)
        const complete = isPromptComplete(parts)
        const generated = complete
          ? mockGenerateImage(promptText, user.id)
          : null
        result = {
          promptText,
          complete,
          generated,
          hint: complete ? null : 'Ghép đủ 5 thẻ để AI vẽ nhé!',
        }
        if (generated) {
          await prisma.asset.create({
            data: {
              userId: user.id,
              type: 'panel',
              name: generated.title,
              questId,
              thumbnail: generated.imageDataUrl,
              private: true,
              metaJson: JSON.stringify({ prompt: promptText }),
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
      // Prefer designer hub character still; mock image is soft placeholder only
      const thumb = mockGenerateImage(`nhân vật clay soft ${label}`, user.id)
      const asset = await prisma.asset.create({
        data: {
          userId: user.id,
          type: 'character',
          name: label,
          questId,
          thumbnail: thumb.imageDataUrl,
          private: true,
          metaJson: JSON.stringify(traits),
        },
      })
      result = { asset, label }
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
      result = { asset, style }
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
      result = { project }
    }

    if (body.kind === 'video') {
      const title = String(body.payload.title ?? 'Video của con')
      const project = await prisma.project.create({
        data: {
          userId: user.id,
          title,
          kind: 'video',
          thumbnail: '/assets/story-workshop.jpg',
          private: true,
          shareStatus: 'private',
          dataJson: JSON.stringify(body.payload),
        },
      })
      result = { project }
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
        dataJson: JSON.stringify(body.payload),
      },
      update: {
        status: 'in_progress',
        phase: 'practice',
        dataJson: JSON.stringify(body.payload),
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

    const next = await prisma.quest.findFirst({
      where: { courseId: quest.courseId, order: quest.order + 1 },
    })
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
    }

    return {
      correct,
      total: questions.length,
      stars: starsFinal,
      xpEarned: alreadyDone ? prev!.xpEarned : xp,
      xpGain,
      details,
      nextQuestId: next?.id ?? null,
      message:
        starsFinal >= 3
          ? 'Xuất sắc! Con đã chinh phục trạm này!'
          : starsFinal >= 2
            ? 'Tuyệt vời! Con làm tốt lắm!'
            : 'Con đã hoàn thành! Thử lại sau để lấy thêm sao nhé!',
    }
  })
}
