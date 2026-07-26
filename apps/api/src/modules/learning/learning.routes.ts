import { randomUUID } from 'node:crypto'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  buildCoursePathway,
  can,
  mergeLearningResume,
  parentOwnsChild,
  validateChildText,
  type AgeBand,
} from '@aikids/domain'
import { Prisma } from '../../generated/prisma/index.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import {
  requireRole,
  requireUser,
  type AuthUser,
} from '../../infrastructure/session/session.js'
import { resolveStudentQuestStatus } from '../../shared/access/quest-access.js'
import {
  buildOfflineManifest,
  searchQuestContent,
} from './learning-content.js'
import {
  ageAssessmentPolicySchema,
  ageCopyPolicySchema,
  agePermissionPolicySchema,
  ageUiPolicySchema,
  parsePublishedAgePolicy,
} from './age-policy.js'

const ageBandSchema = z.enum(['6_8', '9_11', '11_plus'])
const anchorSchema = z.object({
  anchorType: z.enum(['video', 'section', 'slide', 'activity']),
  anchorValue: z.string().min(1).max(160),
})
const deviceIdSchema = z
  .string()
  .min(8)
  .max(100)
  .regex(/^[A-Za-z0-9._-]+$/)

function httpError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode })
}

async function resolveStudentForAdult(
  request: FastifyRequest,
  user: AuthUser,
  studentId: string,
) {
  const student = await prisma.user.findFirst({
    where: { id: studentId, role: 'student', active: true },
  })
  if (!student) throw httpError(404, 'Không tìm thấy học viên.')
  if (user.role === 'parent' && !parentOwnsChild(user.id, student.parentId)) {
    request.log.warn(
      { actorId: user.id, studentId },
      'learning.student_scope parent_forbidden',
    )
    throw httpError(403, 'Bạn chưa được phép xem hồ sơ này.')
  }
  if (user.role === 'teacher') {
    const membership = await prisma.classMembership.findFirst({
      where: {
        studentId: student.id,
        status: 'active',
        classroom: { teacherId: user.id },
      },
      select: { id: true },
    })
    if (!membership) {
      request.log.warn(
        { actorId: user.id, studentId },
        'learning.student_scope teacher_forbidden',
      )
      throw httpError(403, 'Học viên không thuộc lớp của bạn.')
    }
  }
  return student
}

async function pathwayStudent(request: FastifyRequest) {
  const user = requireUser(request)
  if (!can(user.role, 'pathway:read')) throw httpError(403, 'Forbidden')
  if (user.role === 'student') {
    const student = await prisma.user.findUnique({ where: { id: user.id } })
    if (!student) throw httpError(404, 'Không tìm thấy hồ sơ.')
    return { user, student }
  }
  const { studentId } = z
    .object({ studentId: z.string().uuid() })
    .parse(request.query)
  const student = await resolveStudentForAdult(request, user, studentId)
  return { user, student }
}

async function assertQuestAccess(studentId: string, questId: string) {
  const access = await resolveStudentQuestStatus(studentId, questId)
  if (!access.ok) {
    throw httpError(
      access.reason === 'not_found' ? 404 : 403,
      access.reason === 'not_found'
        ? 'Không tìm thấy bài học.'
        : 'Bài học này chưa được mở.',
    )
  }
}

async function serializable<T>(work: () => Promise<T>): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await work()
    } catch (error) {
      lastError = error
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== 'P2034'
      ) {
        throw error
      }
    }
  }
  throw lastError
}

export async function learningRoutes(app: FastifyInstance) {
  app.get('/api/admin/learning/config', async (request) => {
    const user = requireRole(request, ['admin'])
    if (
      !can(user.role, 'age-policy:write') ||
      !can(user.role, 'pathway:write')
    ) {
      throw httpError(403, 'Forbidden')
    }
    const [agePolicies, pathRules] = await prisma.$transaction([
      prisma.ageExperiencePolicy.findMany({
        orderBy: { ageBand: 'asc' },
      }),
      prisma.coursePathRule.findMany({
        orderBy: [{ courseId: 'asc' }, { version: 'desc' }],
        include: {
          course: {
            select: { id: true, title: true, shortTitle: true },
          },
        },
      }),
    ])
    return { agePolicies, pathRules }
  })

  app.get('/api/learning/age-policy', async (request) => {
    const { student } = await pathwayStudent(request)
    const policy = await prisma.ageExperiencePolicy.findFirst({
      where: { ageBand: student.ageBand, status: 'published' },
      orderBy: { version: 'desc' },
    })
    const experience = policy ? parsePublishedAgePolicy(policy) : null
    return {
      ageBand: student.ageBand,
      birthDate: student.birthDate,
      status: experience ? 'ready' : 'configuration_required',
      policy: experience && policy ? { ...policy, ...experience } : null,
    }
  })

  app.get('/api/learning/pathway', async (request) => {
    const { student } = await pathwayStudent(request)
    const parsedAgeBand = ageBandSchema.safeParse(student.ageBand)
    if (!parsedAgeBand.success) {
      return {
        student: {
          id: student.id,
          nickname: student.nickname,
          ageBand: student.ageBand,
        },
        policy: null,
        ageExperienceStatus: 'configuration_required',
        configurationReason: 'BIRTH_DATE_REQUIRED',
        recommendedCourseId: null,
        courses: [],
      }
    }
    const ageBand = parsedAgeBand.data
    const [courses, enrollments, progressRows, rules, overrides, policy] =
      await prisma.$transaction([
        prisma.course.findMany({
          where: { status: { not: 'soon' } },
          orderBy: { sortOrder: 'asc' },
          include: {
            quests: {
              where: { archived: false },
              select: { id: true },
            },
          },
        }),
        prisma.enrollment.findMany({
          where: { userId: student.id },
          select: { courseId: true },
        }),
        prisma.questProgress.findMany({
          where: { userId: student.id, status: 'completed' },
          select: { quest: { select: { courseId: true } } },
        }),
        prisma.coursePathRule.findMany({
          where: { status: 'published' },
          orderBy: [{ courseId: 'asc' }, { version: 'desc' }],
        }),
        prisma.courseUnlockOverride.findMany({
          where: {
            studentId: student.id,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        }),
        prisma.ageExperiencePolicy.findFirst({
          where: { ageBand: student.ageBand, status: 'published' },
          orderBy: { version: 'desc' },
        }),
      ])

    const enrolled = new Set(enrollments.map((row) => row.courseId))
    const completedByCourse = new Map<string, number>()
    progressRows.forEach((row) => {
      completedByCourse.set(
        row.quest.courseId,
        (completedByCourse.get(row.quest.courseId) ?? 0) + 1,
      )
    })
    const ruleByCourse = new Map<
      string,
      (typeof rules)[number]
    >()
    rules.forEach((rule) => {
      if (!ruleByCourse.has(rule.courseId)) ruleByCourse.set(rule.courseId, rule)
    })
    const overrideByCourse = new Map(
      overrides.map((override) => [override.courseId, override]),
    )
    const experience = policy ? parsePublishedAgePolicy(policy) : null
    const allowedTracks = new Set(
      experience ? policy?.allowedCourseTracks ?? [] : [],
    )

    const pathway = buildCoursePathway(
      courses.map((course) => {
        const rule = ruleByCourse.get(course.id)
        const total = course.quests.length
        const completed = completedByCourse.get(course.id) ?? 0
        return {
          id: course.id,
          title: course.title,
          entitled: enrolled.has(course.id),
          completionPercent:
            total > 0 ? Math.round((completed / total) * 100) : 0,
          allowedAgeBands: (
            rule?.allowedAgeBands.length
              ? rule.allowedAgeBands
              : allowedTracks.has(course.ageTrack)
                ? [ageBand]
                : []
          ) as AgeBand[],
          prerequisites: rule?.prerequisiteCourseIds ?? [],
          availableFrom: rule?.availableFrom ?? null,
          manuallyAllowed: overrideByCourse.get(course.id)?.allowed ?? null,
        }
      }),
      { ageBand },
    )

    const courseById = new Map(courses.map((course) => [course.id, course]))
    const rows = pathway.map((item) => {
      const course = courseById.get(item.id)!
      const rule = ruleByCourse.get(item.id)
      return {
        ...item,
        shortTitle: course.shortTitle,
        ageTrack: course.ageTrack,
        courseKey: course.courseKey,
        coverImage: course.coverImage,
        nextCourseId: rule?.nextCourseId ?? null,
      }
    })
    const recommended =
      rows.find((row) => row.status === 'active') ??
      rows.find((row) => row.status === 'available') ??
      null

    return {
      student: {
        id: student.id,
        nickname: student.nickname,
        ageBand,
      },
      policy: experience && policy ? { ...policy, ...experience } : null,
      ageExperienceStatus: experience ? 'ready' : 'configuration_required',
      recommendedCourseId: recommended?.id ?? null,
      courses: rows,
    }
  })

  app.post('/api/learning/pathway/overrides', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'pathway:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        studentId: z.string().uuid(),
        courseId: z.string().min(1).max(120),
        allowed: z.boolean(),
        reason: z.string().min(5).max(500),
        expiresAt: z.coerce.date().nullable().optional(),
      })
      .parse(request.body)
    await resolveStudentForAdult(request, user, body.studentId)

    const before = await prisma.courseUnlockOverride.findUnique({
      where: {
        studentId_courseId: {
          studentId: body.studentId,
          courseId: body.courseId,
        },
      },
    })
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.courseUnlockOverride.upsert({
        where: {
          studentId_courseId: {
            studentId: body.studentId,
            courseId: body.courseId,
          },
        },
        create: { ...body, actorId: user.id },
        update: { ...body, actorId: user.id },
      })
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'pathway.override_changed',
          targetType: 'course_unlock_override',
          targetId: row.id,
          reason: body.reason,
          beforeJson: before
            ? {
                allowed: before.allowed,
                expiresAt: before.expiresAt?.toISOString() ?? null,
              }
            : Prisma.JsonNull,
          afterJson: {
            allowed: row.allowed,
            expiresAt: row.expiresAt?.toISOString() ?? null,
          },
          requestId: request.id,
          ipAddress: request.ip,
        },
      })
      return row
    })
    return reply.code(before ? 200 : 201).send({ override: updated })
  })

  app.put('/api/admin/learning/age-policies/:ageBand', async (request) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'age-policy:write')) throw httpError(403, 'Forbidden')
    const { ageBand } = z
      .object({ ageBand: ageBandSchema })
      .parse(request.params)
    const body = z
      .object({
        label: z.string().min(1).max(80),
        allowedCourseTracks: z.array(z.string().min(1).max(20)).max(20),
        uiPolicy: ageUiPolicySchema,
        copyPolicy: ageCopyPolicySchema,
        permissionPolicy: agePermissionPolicySchema,
        assessmentPolicy: ageAssessmentPolicySchema,
        status: z.enum(['draft', 'published', 'archived']),
        reason: z.string().min(5).max(500),
      })
      .parse(request.body)
    const updated = await serializable(() =>
      prisma.$transaction(
        async (tx) => {
          const before = await tx.ageExperiencePolicy.findFirst({
            where: { ageBand },
            orderBy: { version: 'desc' },
          })
          if (body.status === 'published') {
            await tx.ageExperiencePolicy.updateMany({
              where: { ageBand, status: 'published' },
              data: { status: 'archived' },
            })
          }
          const row = await tx.ageExperiencePolicy.create({
            data: {
              ageBand,
              version: (before?.version ?? 0) + 1,
              label: body.label,
              allowedCourseTracks: body.allowedCourseTracks,
              uiPolicyJson: body.uiPolicy as Prisma.InputJsonValue,
              copyPolicyJson: body.copyPolicy as Prisma.InputJsonValue,
              permissionPolicyJson:
                body.permissionPolicy as Prisma.InputJsonValue,
              assessmentPolicyJson:
                body.assessmentPolicy as Prisma.InputJsonValue,
              status: body.status,
              publishedAt: body.status === 'published' ? new Date() : null,
            },
          })
          await tx.auditEvent.create({
            data: {
              actorId: user.id,
              action: 'age_policy.changed',
              targetType: 'age_experience_policy',
              targetId: row.id,
              reason: body.reason,
              beforeJson: before
                ? {
                    version: before.version,
                    status: before.status,
                  }
                : Prisma.JsonNull,
              afterJson: { version: row.version, status: row.status },
              requestId: request.id,
              ipAddress: request.ip,
            },
          })
          return row
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      ),
    )
    return { policy: updated }
  })

  app.post('/api/admin/learning/path-rules', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'pathway:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        courseId: z.string().min(1).max(120),
        prerequisiteCourseIds: z
          .array(z.string().min(1).max(120))
          .max(20)
          .default([]),
        minCompletionPercent: z.number().int().min(0).max(100).default(100),
        minFinalScore: z.number().min(0).max(100).nullable().optional(),
        allowedAgeBands: z.array(ageBandSchema).min(1).max(3),
        availableFrom: z.coerce.date().nullable().optional(),
        nextCourseId: z.string().min(1).max(120).nullable().optional(),
        status: z.enum(['draft', 'published']).default('draft'),
        reason: z.string().min(5).max(500),
      })
      .parse(request.body)
    const latest = await prisma.coursePathRule.findFirst({
      where: { courseId: body.courseId },
      orderBy: { version: 'desc' },
    })
    const row = await prisma.$transaction(async (tx) => {
      if (body.status === 'published') {
        await tx.coursePathRule.updateMany({
          where: { courseId: body.courseId, status: 'published' },
          data: { status: 'archived' },
        })
      }
      const created = await tx.coursePathRule.create({
        data: {
          courseId: body.courseId,
          version: (latest?.version ?? 0) + 1,
          prerequisiteCourseIds: body.prerequisiteCourseIds,
          minCompletionPercent: body.minCompletionPercent,
          minFinalScore: body.minFinalScore,
          allowedAgeBands: body.allowedAgeBands,
          availableFrom: body.availableFrom,
          nextCourseId: body.nextCourseId,
          status: body.status,
          publishedAt: body.status === 'published' ? new Date() : null,
          createdById: user.id,
        },
      })
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'pathway.rule_version_created',
          targetType: 'course_path_rule',
          targetId: created.id,
          reason: body.reason,
          afterJson: {
            courseId: created.courseId,
            version: created.version,
            status: created.status,
          },
          requestId: request.id,
          ipAddress: request.ip,
        },
      })
      return created
    })
    return reply.code(201).send({ rule: row })
  })

  app.get('/api/learning/quests/:questId/notes', async (request) => {
    const user = requireRole(request, ['student'])
    if (!can(user.role, 'learning:annotate')) throw httpError(403, 'Forbidden')
    const { questId } = request.params as { questId: string }
    await assertQuestAccess(user.id, questId)
    const [notes, bookmarks] = await prisma.$transaction([
      prisma.lessonNote.findMany({
        where: { userId: user.id, questId },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.lessonBookmark.findMany({
        where: { userId: user.id, questId },
        orderBy: { createdAt: 'desc' },
      }),
    ])
    return { notes, bookmarks }
  })

  app.post('/api/learning/quests/:questId/notes', async (request, reply) => {
    const user = requireRole(request, ['student'])
    if (!can(user.role, 'learning:annotate')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { questId } = request.params as { questId: string }
    await assertQuestAccess(user.id, questId)
    const body = anchorSchema
      .extend({ body: z.string().min(1).max(2000) })
      .parse(request.body)
    const safe = validateChildText(body.body)
    if (!safe.ok) return reply.code(400).send({ error: safe.message })
    const note = await prisma.lessonNote.create({
      data: { ...body, body: body.body.trim(), userId: user.id, questId },
    })
    return reply.code(201).send({ note })
  })

  app.patch('/api/learning/notes/:noteId', async (request, reply) => {
    const user = requireRole(request, ['student'])
    if (!can(user.role, 'learning:annotate')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { noteId } = z
      .object({ noteId: z.string().uuid() })
      .parse(request.params)
    const body = anchorSchema
      .partial()
      .extend({
        body: z.string().min(1).max(2000).optional(),
        version: z.number().int().positive(),
      })
      .parse(request.body)
    if (body.body) {
      const safe = validateChildText(body.body)
      if (!safe.ok) return reply.code(400).send({ error: safe.message })
    }
    const { version, ...changes } = body
    const updated = await prisma.lessonNote.updateMany({
      where: { id: noteId, userId: user.id, version },
      data: {
        ...changes,
        body: changes.body?.trim(),
        version: { increment: 1 },
      },
    })
    if (updated.count === 0) {
      return reply.code(409).send({
        error: 'Ghi chú đã thay đổi ở thiết bị khác. Tải lại trước khi sửa.',
      })
    }
    return {
      note: await prisma.lessonNote.findUniqueOrThrow({ where: { id: noteId } }),
    }
  })

  app.delete('/api/learning/notes/:noteId', async (request, reply) => {
    const user = requireRole(request, ['student'])
    const { noteId } = z
      .object({ noteId: z.string().uuid() })
      .parse(request.params)
    const deleted = await prisma.lessonNote.deleteMany({
      where: { id: noteId, userId: user.id },
    })
    if (!deleted.count) return reply.code(404).send({ error: 'Not found' })
    return reply.code(204).send()
  })

  app.post('/api/learning/quests/:questId/bookmarks', async (request, reply) => {
    const user = requireRole(request, ['student'])
    if (!can(user.role, 'learning:annotate')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { questId } = request.params as { questId: string }
    await assertQuestAccess(user.id, questId)
    const body = anchorSchema
      .extend({ label: z.string().max(120).nullable().optional() })
      .parse(request.body)
    if (body.label) {
      const safe = validateChildText(body.label)
      if (!safe.ok) return reply.code(400).send({ error: safe.message })
    }
    const bookmark = await prisma.lessonBookmark.upsert({
      where: {
        userId_questId_anchorType_anchorValue: {
          userId: user.id,
          questId,
          anchorType: body.anchorType,
          anchorValue: body.anchorValue,
        },
      },
      create: { ...body, userId: user.id, questId },
      update: { label: body.label },
    })
    return reply.code(201).send({ bookmark })
  })

  app.delete('/api/learning/bookmarks/:bookmarkId', async (request, reply) => {
    const user = requireRole(request, ['student'])
    const { bookmarkId } = z
      .object({ bookmarkId: z.string().uuid() })
      .parse(request.params)
    const deleted = await prisma.lessonBookmark.deleteMany({
      where: { id: bookmarkId, userId: user.id },
    })
    if (!deleted.count) return reply.code(404).send({ error: 'Not found' })
    return reply.code(204).send()
  })

  app.get('/api/learning/quests/:questId/search', async (request) => {
    const user = requireRole(request, ['student'])
    const { questId } = request.params as { questId: string }
    const { q } = z.object({ q: z.string().min(2).max(100) }).parse(request.query)
    await assertQuestAccess(user.id, questId)
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: {
        id: true,
        title: true,
        hook: true,
        skill: true,
        videoUrl: true,
        contentVersion: true,
        learnCardsJson: true,
        stationsJson: true,
      },
    })
    if (!quest) throw httpError(404, 'Không tìm thấy bài học.')
    return { results: searchQuestContent(quest, q) }
  })

  app.put('/api/learning/quests/:questId/resume', async (request) => {
    const user = requireRole(request, ['student'])
    if (!can(user.role, 'learning:annotate')) throw httpError(403, 'Forbidden')
    const { questId } = request.params as { questId: string }
    const body = z
      .object({
        percent: z.number().min(0).max(100),
        positionSeconds: z.number().int().min(0).max(24 * 60 * 60),
        sectionId: z.string().max(160).nullable().optional(),
        occurredAt: z.coerce.date(),
      })
      .parse(request.body)
    if (body.occurredAt.getTime() > Date.now() + 5 * 60 * 1000) {
      throw httpError(400, 'Thời gian thiết bị chưa chính xác.')
    }
    await assertQuestAccess(user.id, questId)
    const resume = await serializable(() =>
      prisma.$transaction(
        async (tx) => {
          const current = await tx.lessonResume.findUnique({
            where: { userId_questId: { userId: user.id, questId } },
          })
          const merged = mergeLearningResume(
            current
              ? {
                  percent: current.percent,
                  positionSeconds: current.positionSeconds,
                  sectionId: current.sectionId,
                  occurredAt: current.lastOccurredAt,
                }
              : null,
            {
              percent: body.percent,
              positionSeconds: body.positionSeconds,
              sectionId: body.sectionId ?? null,
              occurredAt: body.occurredAt,
            },
          )
          return tx.lessonResume.upsert({
            where: { userId_questId: { userId: user.id, questId } },
            create: {
              userId: user.id,
              questId,
              percent: merged.percent,
              positionSeconds: merged.positionSeconds,
              sectionId: merged.sectionId,
              lastOccurredAt: merged.occurredAt,
            },
            update: {
              percent: merged.percent,
              positionSeconds: merged.positionSeconds,
              sectionId: merged.sectionId,
              lastOccurredAt: merged.occurredAt,
              version: { increment: 1 },
            },
          })
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      ),
    )
    return { resume }
  })

  app.post('/api/learning/quests/:questId/offline-manifest', async (request, reply) => {
    const user = requireRole(request, ['student'])
    if (!can(user.role, 'learning:offline')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { questId } = request.params as { questId: string }
    const { deviceId } = z
      .object({ deviceId: deviceIdSchema })
      .parse(request.body)
    await assertQuestAccess(user.id, questId)
    const learner = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { ageBand: true },
    })
    const agePolicy = await prisma.ageExperiencePolicy.findFirst({
      where: { ageBand: learner.ageBand, status: 'published' },
      orderBy: { version: 'desc' },
    })
    const experience = agePolicy ? parsePublishedAgePolicy(agePolicy) : null
    if (!experience) {
      return reply.code(409).send({
        error: 'Customer-approved age experience policy is required.',
        reason: 'age_policy_required',
      })
    }
    if (!experience.permissionPolicy.canDownloadLessons) {
      return reply.code(403).send({
        error: 'Offline lesson download is disabled for this age group.',
        reason: 'age_permission_denied',
      })
    }
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: {
        id: true,
        title: true,
        hook: true,
        skill: true,
        videoUrl: true,
        contentVersion: true,
        offlineAllowed: true,
        offlineMaxAgeHours: true,
        learnCardsJson: true,
        stationsJson: true,
      },
    })
    if (!quest) return reply.code(404).send({ error: 'Not found' })
    if (!quest.offlineAllowed) {
      return reply.code(403).send({
        error: 'Bài học này chưa được phép tải để học ngoại tuyến.',
      })
    }
    const grantId = randomUUID()
    const expiresAt = new Date(
      Date.now() + quest.offlineMaxAgeHours * 60 * 60 * 1000,
    )
    const manifest = buildOfflineManifest(quest, { grantId, expiresAt })
    const grant = await prisma.offlineGrant.upsert({
      where: {
        userId_questId_deviceId: {
          userId: user.id,
          questId,
          deviceId,
        },
      },
      create: {
        id: grantId,
        userId: user.id,
        questId,
        deviceId,
        contentVersion: quest.contentVersion,
        manifestJson: manifest as Prisma.InputJsonValue,
        status: 'active',
        expiresAt,
      },
      update: {
        contentVersion: quest.contentVersion,
        manifestJson: manifest as Prisma.InputJsonValue,
        status: 'active',
        expiresAt,
        revokedAt: null,
      },
    })
    return reply.code(201).send({
      grant: {
        id: grant.id,
        status: grant.status,
        expiresAt: grant.expiresAt,
        contentVersion: grant.contentVersion,
      },
      manifest,
    })
  })

  app.post('/api/learning/quests/:questId/offline-sync', async (request, reply) => {
    const user = requireRole(request, ['student'])
    if (!can(user.role, 'learning:offline')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { questId } = request.params as { questId: string }
    const body = z
      .object({
        grantId: z.string().uuid(),
        deviceId: deviceIdSchema,
        contentVersion: z.number().int().positive(),
        events: z
          .array(
            z.object({
              clientEventId: z.string().min(8).max(100),
              percent: z.number().min(0).max(100),
              positionSeconds: z.number().int().min(0).max(24 * 60 * 60),
              sectionId: z.string().max(160).nullable().optional(),
              occurredAt: z.coerce.date(),
            }),
          )
          .min(1)
          .max(100),
      })
      .parse(request.body)
    const grant = await prisma.offlineGrant.findFirst({
      where: {
        id: body.grantId,
        userId: user.id,
        questId,
        deviceId: body.deviceId,
      },
    })
    if (!grant) return reply.code(403).send({ error: 'Offline grant invalid' })
    if (
      grant.status !== 'active' ||
      grant.expiresAt.getTime() <= Date.now() ||
      grant.contentVersion !== body.contentVersion
    ) {
      return reply.code(409).send({
        error: 'Bản tải ngoại tuyến đã hết hạn hoặc có phiên bản mới.',
        reason: 'offline_grant_stale',
      })
    }
    const futureLimit = Date.now() + 5 * 60 * 1000
    if (body.events.some((event) => event.occurredAt.getTime() > futureLimit)) {
      return reply.code(400).send({ error: 'Thời gian thiết bị chưa chính xác.' })
    }

    const result = await serializable(() =>
      prisma.$transaction(
        async (tx) => {
          const existing = await tx.offlineProgressEvent.findMany({
            where: {
              userId: user.id,
              deviceId: body.deviceId,
              clientEventId: {
                in: body.events.map((event) => event.clientEventId),
              },
            },
            select: { clientEventId: true },
          })
          const existingIds = new Set(existing.map((row) => row.clientEventId))
          const fresh = body.events
            .filter((event) => !existingIds.has(event.clientEventId))
            .sort(
              (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime(),
            )
          const current = await tx.lessonResume.findUnique({
            where: { userId_questId: { userId: user.id, questId } },
          })
          let merged = current
            ? {
                percent: current.percent,
                positionSeconds: current.positionSeconds,
                sectionId: current.sectionId,
                occurredAt: current.lastOccurredAt,
              }
            : null
          fresh.forEach((event) => {
            merged = mergeLearningResume(merged, {
              percent: event.percent,
              positionSeconds: event.positionSeconds,
              sectionId: event.sectionId ?? null,
              occurredAt: event.occurredAt,
            })
          })
          if (fresh.length > 0) {
            await tx.offlineProgressEvent.createMany({
              data: fresh.map((event) => ({
                userId: user.id,
                questId,
                deviceId: body.deviceId,
                clientEventId: event.clientEventId,
                percent: event.percent,
                positionSeconds: event.positionSeconds,
                sectionId: event.sectionId,
                occurredAt: event.occurredAt,
              })),
              skipDuplicates: true,
            })
          }
          const resume = merged
            ? await tx.lessonResume.upsert({
                where: { userId_questId: { userId: user.id, questId } },
                create: {
                  userId: user.id,
                  questId,
                  percent: merged.percent,
                  positionSeconds: merged.positionSeconds,
                  sectionId: merged.sectionId,
                  lastOccurredAt: merged.occurredAt,
                },
                update: {
                  percent: merged.percent,
                  positionSeconds: merged.positionSeconds,
                  sectionId: merged.sectionId,
                  lastOccurredAt: merged.occurredAt,
                  version: { increment: fresh.length > 0 ? 1 : 0 },
                },
              })
            : null
          return { accepted: fresh.length, duplicate: existing.length, resume }
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      ),
    )
    return { sync: result }
  })

  app.get('/api/admin/audit-events', async (request) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'audit:read')) throw httpError(403, 'Forbidden')
    const query = z
      .object({
        action: z.string().min(1).max(120).optional(),
        targetType: z.string().min(1).max(120).optional(),
        actorId: z.string().uuid().optional(),
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional(),
        cursor: z.string().uuid().optional(),
        limit: z.coerce.number().int().min(1).max(100).default(50),
      })
      .refine((value) => !value.from || !value.to || value.from <= value.to, {
        message: 'Khoảng thời gian không hợp lệ.',
      })
      .parse(request.query)
    const events = await prisma.auditEvent.findMany({
      where: {
        action: query.action,
        targetType: query.targetType,
        actorId: query.actorId,
        createdAt:
          query.from || query.to
            ? { gte: query.from, lte: query.to }
            : undefined,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: query.limit + 1,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      skip: query.cursor ? 1 : 0,
      include: {
        actor: { select: { id: true, role: true, nickname: true } },
      },
    })
    const hasMore = events.length > query.limit
    const page = hasMore ? events.slice(0, query.limit) : events
    return {
      events: page,
      nextCursor: hasMore ? page.at(-1)?.id ?? null : null,
    }
  })
}
