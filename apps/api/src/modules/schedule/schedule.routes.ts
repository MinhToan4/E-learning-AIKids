import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  can,
  detectScheduleConflicts,
  evaluatePlacementCompatibility,
  parentOwnsChild,
  teacherOwnsClass,
  validateChildText,
  type AgeBand,
} from '@aikids/domain'
import { Prisma } from '../../generated/prisma/index.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import { emailService } from '../../infrastructure/email/email.service.js'
import {
  requireRole,
  requireUser,
  type AuthUser,
} from '../../infrastructure/session/session.js'
import { enqueueNotificationPush } from '../notification/push.queue.js'
import { parsePublishedAgePolicy } from '../learning/age-policy.js'
import { recordPublishedTeacherObservationEvidence } from '../competency/competency.service.js'

const ageBandSchema = z.enum(['6_8', '9_11', '11_plus'])
const channelSchema = z.enum(['in_app', 'push', 'email', 'zalo'])
const attendanceStatusSchema = z.enum([
  'present',
  'absent',
  'late',
  'excused',
])

function httpError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode })
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

async function assertClassScope(user: AuthUser, classId: string) {
  const classroom = await prisma.classRoom.findUnique({
    where: { id: classId },
  })
  if (!classroom) throw httpError(404, 'Class not found.')
  if (
    user.role === 'teacher' &&
    !teacherOwnsClass(user.id, classroom.teacherId)
  ) {
    throw httpError(403, 'Forbidden')
  }
  return classroom
}

async function assertStudentScope(
  request: FastifyRequest,
  user: AuthUser,
  studentId: string,
) {
  const student = await prisma.user.findFirst({
    where: { id: studentId, role: 'student', active: true },
    select: {
      id: true,
      nickname: true,
      ageBand: true,
      level: true,
      parentId: true,
      classId: true,
    },
  })
  if (!student) throw httpError(404, 'Learner not found.')
  if (
    user.role === 'parent' &&
    !parentOwnsChild(user.id, student.parentId)
  ) {
    request.log.warn(
      { actorId: user.id, studentId },
      'schedule.student_scope parent_forbidden',
    )
    throw httpError(403, 'Forbidden')
  }
  return student
}

async function sessionStudents(sessionId: string, classId: string) {
  const [memberships, participants] = await prisma.$transaction([
    prisma.classMembership.findMany({
      where: { classId, status: 'active' },
      select: {
        student: {
          select: {
            id: true,
            nickname: true,
            avatarId: true,
            ageBand: true,
            level: true,
          },
        },
      },
    }),
    prisma.classSessionParticipant.findMany({
      where: { sessionId, status: 'active' },
      select: {
        student: {
          select: {
            id: true,
            nickname: true,
            avatarId: true,
            ageBand: true,
            level: true,
          },
        },
      },
    }),
  ])
  return [
    ...new Map(
      [...memberships, ...participants].map((row) => [
        row.student.id,
        row.student,
      ]),
    ).values(),
  ]
}

async function scheduleConflicts(input: {
  teacherId: string
  studentIds: string[]
  startsAt: Date
  endsAt: Date
  excludeSessionIds?: string[]
}) {
  const teacherSessions = await prisma.classSession.findMany({
    where: {
      id: { notIn: input.excludeSessionIds ?? [] },
      status: { in: ['scheduled', 'in_progress'] },
      classroom: { teacherId: input.teacherId },
      startsAt: { lt: input.endsAt },
      endsAt: { gt: input.startsAt },
    },
    select: { id: true, startsAt: true, endsAt: true },
  })
  const studentSessions =
    input.studentIds.length > 0
      ? await prisma.classSession.findMany({
          where: {
            id: { notIn: input.excludeSessionIds ?? [] },
            status: { in: ['scheduled', 'in_progress'] },
            startsAt: { lt: input.endsAt },
            endsAt: { gt: input.startsAt },
            OR: [
              {
                classroom: {
                  memberships: {
                    some: {
                      studentId: { in: input.studentIds },
                      status: 'active',
                    },
                  },
                },
              },
              {
                participants: {
                  some: {
                    studentId: { in: input.studentIds },
                    status: 'active',
                  },
                },
              },
            ],
          },
          select: { id: true, startsAt: true, endsAt: true },
        })
      : []
  const proposed = { start: input.startsAt, end: input.endsAt }
  return {
    teacherSessionIds: detectScheduleConflicts(
      proposed,
      teacherSessions.map((session) => ({
        id: session.id,
        start: session.startsAt,
        end: session.endsAt,
      })),
    ),
    studentSessionIds: detectScheduleConflicts(
      proposed,
      studentSessions.map((session) => ({
        id: session.id,
        start: session.startsAt,
        end: session.endsAt,
      })),
    ),
  }
}

export async function scheduleRoutes(app: FastifyInstance) {
  app.get('/api/admin/schedule-config', async (request) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'schedule-policy:write')) {
      throw httpError(403, 'Forbidden')
    }
    const policies = await prisma.schedulePolicy.findMany({
      orderBy: [{ classType: 'asc' }, { code: 'asc' }, { version: 'desc' }],
    })
    return { policies }
  })

  app.get('/api/teacher/console', async (request) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'class:read')) throw httpError(403, 'Forbidden')
    const classes = await prisma.classRoom.findMany({
      where: user.role === 'teacher' ? { teacherId: user.id } : undefined,
      orderBy: { name: 'asc' },
      include: {
        course: { select: { id: true, title: true, shortTitle: true } },
        memberships: {
          where: { status: 'active' },
          include: {
            student: {
              select: {
                id: true,
                nickname: true,
                avatarId: true,
                ageBand: true,
                level: true,
              },
            },
          },
        },
        sessions: {
          where: { status: 'scheduled', startsAt: { gte: new Date() } },
          orderBy: { startsAt: 'asc' },
          take: 1,
          include: { quest: { select: { id: true, title: true } } },
        },
      },
    })
    const studentIds = [
      ...new Set(
        classes.flatMap((classroom) =>
          classroom.memberships.map((membership) => membership.studentId),
        ),
      ),
    ]
    const [pendingReviews, progressRows, questTotals, observations] =
      await prisma.$transaction([
        prisma.assessmentReview.count({
          where: {
            status: { in: ['pending', 'in_review'] },
            response: { attempt: { studentId: { in: studentIds } } },
          },
        }),
        prisma.questProgress.findMany({
          where: {
            userId: { in: studentIds },
            status: 'completed',
          },
          select: { userId: true },
        }),
        prisma.quest.count({ where: { archived: false } }),
        prisma.teacherObservation.findMany({
          where:
            user.role === 'teacher'
              ? { teacherId: user.id }
              : { studentId: { in: studentIds } },
          orderBy: { updatedAt: 'desc' },
          distinct: ['studentId'],
          select: {
            id: true,
            studentId: true,
            body: true,
            status: true,
            updatedAt: true,
          },
        }),
      ])
    const progressByStudent = progressRows.reduce((counts, row) => {
      counts.set(row.userId, (counts.get(row.userId) ?? 0) + 1)
      return counts
    }, new Map<string, number>())
    const observationByStudent = new Map(
      observations.map((observation) => [observation.studentId, observation]),
    )
    return {
      alerts: {
        configurationRequired: true,
        reason:
          'Customer has not supplied inactivity and slow-progress thresholds.',
        learners: [],
      },
      pendingReviews,
      classes: classes.map((classroom) => ({
        id: classroom.id,
        name: classroom.name,
        code: classroom.code,
        classType: classroom.classType,
        capacity: classroom.capacity,
        status: classroom.status,
        course: classroom.course,
        nextSession: classroom.sessions[0] ?? null,
        learners: classroom.memberships.map((membership) => ({
          ...membership.student,
          completedLessons:
            progressByStudent.get(membership.studentId) ?? 0,
          totalPlatformLessons: questTotals,
          latestObservation:
            observationByStudent.get(membership.studentId) ?? null,
        })),
      })),
    }
  })

  app.get(
    '/api/teacher/students/:studentId/learning-overview',
    async (request) => {
      const user = requireRole(request, ['teacher', 'admin'])
      if (!can(user.role, 'progress:read')) throw httpError(403, 'Forbidden')
      const { studentId } = z
        .object({ studentId: z.string().uuid() })
        .parse(request.params)
      const student = await assertStudentScope(request, user, studentId)
      if (user.role === 'teacher') {
        const membership = await prisma.classMembership.findFirst({
          where: {
            studentId,
            status: 'active',
            classroom: { teacherId: user.id },
          },
        })
        if (!membership) throw httpError(403, 'Forbidden')
      }
      const [enrollments, progress, attempts, competency, observations] =
        await prisma.$transaction([
          prisma.enrollment.findMany({
            where: { userId: studentId },
            include: {
              course: {
                include: {
                  quests: {
                    where: { archived: false },
                    select: { id: true, title: true, order: true },
                  },
                },
              },
            },
          }),
          prisma.questProgress.findMany({
            where: { userId: studentId },
            orderBy: { updatedAt: 'desc' },
          }),
          prisma.assessmentAttempt.findMany({
            where: { studentId },
            orderBy: { updatedAt: 'desc' },
            include: {
              assessmentVersion: {
                include: {
                  assessment: {
                    select: { id: true, title: true, courseId: true },
                  },
                },
              },
            },
          }),
          prisma.competencySnapshot.findMany({
            where: { studentId, current: true },
            include: {
              skill: {
                include: { domain: true },
              },
            },
          }),
          prisma.teacherObservation.findMany({
            where: {
              studentId,
              ...(user.role === 'teacher' ? { teacherId: user.id } : {}),
            },
            orderBy: { updatedAt: 'desc' },
          }),
        ])
      const progressByQuest = new Map(
        progress.map((row) => [row.questId, row]),
      )
      return {
        student,
        courses: enrollments.map((enrollment) => {
          const completed = enrollment.course.quests.filter(
            (quest) => progressByQuest.get(quest.id)?.status === 'completed',
          ).length
          return {
            id: enrollment.course.id,
            title: enrollment.course.title,
            completedLessons: completed,
            totalLessons: enrollment.course.quests.length,
            completionPercent:
              enrollment.course.quests.length > 0
                ? Math.round(
                    (completed / enrollment.course.quests.length) * 100,
                  )
                : 0,
            latestLesson:
              enrollment.course.quests
                .map((quest) => ({
                  quest,
                  progress: progressByQuest.get(quest.id),
                }))
                .filter((row) => row.progress)
                .sort(
                  (left, right) =>
                    right.progress!.updatedAt.getTime() -
                    left.progress!.updatedAt.getTime(),
                )[0] ?? null,
          }
        }),
        attempts,
        competency,
        observations,
      }
    },
  )

  app.post('/api/admin/schedule-policies', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'schedule-policy:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        code: z
          .string()
          .min(2)
          .max(80)
          .regex(/^[A-Za-z0-9._-]+$/),
        classType: z.enum(['one_to_one', 'group']),
        maxCapacity: z.number().int().min(1).max(500),
        changeDeadlineHours: z.number().int().min(0).max(8_760),
        maxReschedulesPerPeriod: z.number().int().min(0).max(100),
        periodDays: z.number().int().min(1).max(366),
        reminderOffsetsMinutes: z
          .array(z.number().int().min(1).max(525_600))
          .max(20),
        reminderChannels: z.array(channelSchema).min(1).max(4),
        absencePolicy: z.record(z.unknown()),
        makeupPolicy: z.record(z.unknown()),
        status: z.enum(['draft', 'published']).default('draft'),
        reason: z.string().min(5).max(500),
      })
      .parse(request.body)
    const latest = await prisma.schedulePolicy.findFirst({
      where: { code: body.code },
      orderBy: { version: 'desc' },
    })
    const policy = await prisma.$transaction(async (tx) => {
      if (body.status === 'published') {
        await tx.schedulePolicy.updateMany({
          where: { classType: body.classType, status: 'published' },
          data: { status: 'archived' },
        })
      }
      const row = await tx.schedulePolicy.create({
        data: {
          code: body.code,
          version: (latest?.version ?? 0) + 1,
          classType: body.classType,
          maxCapacity: body.maxCapacity,
          changeDeadlineHours: body.changeDeadlineHours,
          maxReschedulesPerPeriod: body.maxReschedulesPerPeriod,
          periodDays: body.periodDays,
          reminderOffsetsMinutes: [
            ...new Set(body.reminderOffsetsMinutes),
          ].sort((a, b) => b - a),
          reminderChannels: [...new Set(body.reminderChannels)],
          absencePolicyJson: body.absencePolicy as Prisma.InputJsonValue,
          makeupPolicyJson: body.makeupPolicy as Prisma.InputJsonValue,
          status: body.status,
          publishedAt: body.status === 'published' ? new Date() : null,
        },
      })
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'schedule.policy_version_created',
          targetType: 'schedule_policy',
          targetId: row.id,
          reason: body.reason,
          afterJson: {
            code: row.code,
            version: row.version,
            classType: row.classType,
            status: row.status,
          },
          requestId: request.id,
          ipAddress: request.ip,
        },
      })
      return row
    })
    return reply.code(201).send({ policy })
  })

  app.post('/api/schedule/classes', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'schedule:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        name: z.string().min(2).max(120),
        code: z
          .string()
          .min(3)
          .max(20)
          .regex(/^[A-Za-z0-9-]+$/),
        teacherId: z.string().uuid().optional(),
        courseId: z.string().min(1).max(120),
        classType: z.enum(['one_to_one', 'group']),
        allowedAgeBands: z.array(ageBandSchema).min(1).max(3),
        minLevel: z.number().int().min(1).max(100),
        maxLevel: z.number().int().min(1).max(100),
        capacity: z.number().int().min(1).max(500),
        location: z.string().max(500).nullable().optional(),
        meetingUrl: z.string().url().max(2_000).nullable().optional(),
        status: z.enum(['draft', 'open']).default('draft'),
      })
      .refine((value) => value.minLevel <= value.maxLevel)
      .parse(request.body)
    const teacherId =
      user.role === 'teacher'
        ? user.id
        : body.teacherId ?? (() => {
            throw httpError(400, 'teacherId is required for admin.')
          })()
    const policy = await prisma.schedulePolicy.findFirst({
      where: { classType: body.classType, status: 'published' },
      orderBy: { version: 'desc' },
    })
    if (!policy) {
      return reply.code(409).send({
        error: 'Publish the customer-approved schedule policy first.',
        reason: 'schedule_policy_required',
      })
    }
    if (body.capacity > policy.maxCapacity) {
      return reply.code(400).send({
        error: `Capacity exceeds the published maximum (${policy.maxCapacity}).`,
      })
    }
    if (body.classType === 'one_to_one' && body.capacity !== 1) {
      return reply.code(400).send({
        error: 'One-to-one classes must have capacity 1.',
      })
    }
    const [teacher, course] = await prisma.$transaction([
      prisma.user.findFirst({
        where: { id: teacherId, role: 'teacher', active: true },
      }),
      prisma.course.findUnique({ where: { id: body.courseId } }),
    ])
    if (!teacher || !course) {
      return reply.code(404).send({ error: 'Teacher or course not found.' })
    }
    const classroom = await prisma.classRoom.create({
      data: {
        name: body.name,
        code: body.code.toUpperCase(),
        teacherId,
        courseId: body.courseId,
        classType: body.classType,
        allowedAgeBands: body.allowedAgeBands,
        minLevel: body.minLevel,
        maxLevel: body.maxLevel,
        capacity: body.capacity,
        location: body.location,
        meetingUrl: body.meetingUrl,
        status: body.status,
      },
    })
    return reply.code(201).send({ class: classroom })
  })

  app.get('/api/schedule', async (request) => {
    const user = requireUser(request)
    if (!can(user.role, 'schedule:read')) throw httpError(403, 'Forbidden')
    const query = z
      .object({
        studentId: z.string().uuid().optional(),
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional(),
      })
      .parse(request.query)
    const from = query.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1_000)
    const to = query.to ?? new Date(Date.now() + 120 * 24 * 60 * 60 * 1_000)
    if (to <= from || to.getTime() - from.getTime() > 366 * 24 * 60 * 60 * 1_000) {
      throw httpError(400, 'Invalid schedule range.')
    }
    let studentIds: string[] | null = null
    if (user.role === 'student') studentIds = [user.id]
    if (user.role === 'parent') {
      const children = await prisma.user.findMany({
        where: { parentId: user.id, role: 'student', active: true },
        select: { id: true },
      })
      studentIds = children.map((child) => child.id)
      if (query.studentId && !studentIds.includes(query.studentId)) {
        throw httpError(403, 'Forbidden')
      }
      if (query.studentId) studentIds = [query.studentId]
    }
    const classes = await prisma.classRoom.findMany({
      where:
        user.role === 'teacher'
          ? { teacherId: user.id }
          : studentIds
            ? {
                OR: [
                  {
                    memberships: {
                      some: {
                        studentId: { in: studentIds },
                        status: 'active',
                      },
                    },
                  },
                  {
                    sessions: {
                      some: {
                        participants: {
                          some: {
                            studentId: { in: studentIds },
                            status: 'active',
                          },
                        },
                      },
                    },
                  },
                ],
              }
            : undefined,
      orderBy: { name: 'asc' },
      include: {
        teacher: { select: { id: true, nickname: true } },
        course: { select: { id: true, title: true, shortTitle: true } },
        memberships: {
          where: studentIds
            ? { studentId: { in: studentIds }, status: 'active' }
            : { status: 'active' },
          include: {
            student: {
              select: { id: true, nickname: true, avatarId: true, ageBand: true },
            },
          },
        },
        sessions: {
          where: {
            startsAt: { lt: to },
            endsAt: { gt: from },
            status: { not: 'cancelled' },
          },
          orderBy: { startsAt: 'asc' },
          include: {
            quest: { select: { id: true, title: true } },
            participants: {
              where: studentIds
                ? { studentId: { in: studentIds }, status: 'active' }
                : { status: 'active' },
              select: { studentId: true, sourceType: true },
            },
          },
        },
      },
    })
    return { from, to, classes }
  })

  app.post('/api/schedule/classes/:classId/sessions', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'schedule:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { classId } = z
      .object({ classId: z.string().uuid() })
      .parse(request.params)
    const classroom = await assertClassScope(user, classId)
    const body = z
      .object({
        questId: z.string().min(1).max(120).nullable().optional(),
        title: z.string().min(2).max(200),
        startsAt: z.coerce.date(),
        endsAt: z.coerce.date(),
        location: z.string().max(500).nullable().optional(),
        meetingUrl: z.string().url().max(2_000).nullable().optional(),
        enrollmentDeadline: z.coerce.date().nullable().optional(),
        lessonPlan: z.record(z.unknown()).default({}),
      })
      .refine(
        (value) =>
          value.endsAt > value.startsAt &&
          value.endsAt.getTime() - value.startsAt.getTime() <=
            12 * 60 * 60 * 1_000,
      )
      .parse(request.body)
    if (
      body.questId &&
      !(await prisma.quest.findFirst({
        where: { id: body.questId, courseId: classroom.courseId ?? undefined },
      }))
    ) {
      return reply.code(400).send({
        error: 'Lesson does not belong to the class course.',
      })
    }
    const members = await prisma.classMembership.findMany({
      where: { classId, status: 'active' },
      select: { studentId: true },
    })
    const conflicts = await scheduleConflicts({
      teacherId: classroom.teacherId,
      studentIds: members.map((member) => member.studentId),
      startsAt: body.startsAt,
      endsAt: body.endsAt,
    })
    if (
      conflicts.teacherSessionIds.length > 0 ||
      conflicts.studentSessionIds.length > 0
    ) {
      return reply.code(409).send({
        error: 'Schedule conflict detected.',
        conflicts,
      })
    }
    const policy = await prisma.schedulePolicy.findFirst({
      where: { classType: classroom.classType, status: 'published' },
      orderBy: { version: 'desc' },
    })
    if (!policy) {
      return reply.code(409).send({
        error: 'Published schedule policy is required.',
      })
    }
    const changeDeadline = new Date(
      body.startsAt.getTime() - policy.changeDeadlineHours * 60 * 60 * 1_000,
    )
    const recipients = await prisma.user.findMany({
      where: {
        OR: [
          { id: classroom.teacherId },
          {
            children: {
              some: {
                id: { in: members.map((member) => member.studentId) },
              },
            },
          },
        ],
        active: true,
      },
      select: { id: true },
    })
    const session = await prisma.classSession.create({
      data: {
        classId,
        questId: body.questId,
        title: body.title,
        startsAt: body.startsAt,
        endsAt: body.endsAt,
        location: body.location ?? classroom.location,
        meetingUrl: body.meetingUrl ?? classroom.meetingUrl,
        enrollmentDeadline: body.enrollmentDeadline,
        changeDeadline,
        lessonPlanJson: body.lessonPlan as Prisma.InputJsonValue,
        createdById: user.id,
        reminderDeliveries: {
          create: policy.reminderOffsetsMinutes.flatMap((offset) => {
            const scheduledFor = new Date(
              body.startsAt.getTime() - offset * 60 * 1_000,
            )
            if (scheduledFor <= new Date()) return []
            return recipients.flatMap((recipient) =>
              policy.reminderChannels.map((channel) => ({
                recipientId: recipient.id,
                channel,
                scheduledFor,
              })),
            )
          }),
        },
      },
      include: { reminderDeliveries: true },
    })
    return reply.code(201).send({ session })
  })

  app.post('/api/schedule/placement-requests', async (request, reply) => {
    const user = requireRole(request, ['parent', 'admin'])
    if (!can(user.role, 'placement:request')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        studentId: z.string().uuid(),
        courseId: z.string().min(1).max(120),
        requestedLevel: z.number().int().min(1).max(100),
        availability: z
          .array(
            z.object({
              weekday: z.number().int().min(0).max(6),
              startMinutes: z.number().int().min(0).max(1_439),
              endMinutes: z.number().int().min(1).max(1_440),
              timezone: z.string().min(1).max(80),
            }).refine((slot) => slot.startMinutes < slot.endMinutes, {
              message: 'Availability end time must be after start time.',
            }),
          )
          .min(1)
          .max(30),
      })
      .parse(request.body)
    await assertStudentScope(request, user, body.studentId)
    const row = await prisma.classPlacementRequest.create({
      data: {
        studentId: body.studentId,
        courseId: body.courseId,
        requestedById: user.id,
        requestedLevel: body.requestedLevel,
        availabilityJson: body.availability,
      },
    })
    return reply.code(201).send({ request: row })
  })

  app.get('/api/schedule/placement-requests', async (request) => {
    const user = requireRole(request, ['parent', 'teacher', 'admin'])
    if (
      !can(user.role, 'placement:decide') &&
      !can(user.role, 'placement:request')
    ) {
      throw httpError(403, 'Forbidden')
    }
    const { status, studentId } = z
      .object({
        status: z
          .enum(['pending', 'placed', 'rejected', 'cancelled'])
          .default('pending'),
        studentId: z.string().uuid().optional(),
      })
      .parse(request.query)
    if (studentId) await assertStudentScope(request, user, studentId)
    const requests = await prisma.classPlacementRequest.findMany({
      where: {
        status,
        studentId,
        ...(user.role === 'parent'
          ? { student: { parentId: user.id } }
          : {}),
      },
      orderBy: { createdAt: 'asc' },
      include: {
        student: {
          select: {
            id: true,
            nickname: true,
            ageBand: true,
            level: true,
          },
        },
        course: { select: { id: true, title: true } },
        targetClass: { select: { id: true, name: true, code: true } },
      },
    })
    return { requests }
  })

  app.post(
    '/api/schedule/placement-requests/:placementId/decide',
    async (request, reply) => {
      const user = requireRole(request, ['teacher', 'admin'])
      if (!can(user.role, 'placement:decide')) {
        return reply.code(403).send({ error: 'Forbidden' })
      }
      const { placementId } = z
        .object({ placementId: z.string().uuid() })
        .parse(request.params)
      const body = z
        .discriminatedUnion('decision', [
          z.object({
            decision: z.literal('placed'),
            classId: z.string().uuid(),
            reason: z.string().max(500).default(''),
          }),
          z.object({
            decision: z.literal('rejected'),
            reason: z.string().max(500).default(''),
          }),
        ])
        .parse(request.body)
      const placement = await prisma.classPlacementRequest.findUnique({
        where: { id: placementId },
        include: { student: true },
      })
      if (!placement) {
        return reply.code(404).send({ error: 'Placement request not found' })
      }
      if (placement.status !== 'pending') {
        return reply.code(409).send({ error: 'Request already decided.' })
      }
      if (body.decision === 'rejected') {
        const updated = await prisma.classPlacementRequest.update({
          where: { id: placement.id },
          data: {
            status: 'rejected',
            resolutionNote: body.reason,
          },
        })
        return { request: updated }
      }
      const classroom = await assertClassScope(user, body.classId)
      if (classroom.courseId && classroom.courseId !== placement.courseId) {
        return reply.code(400).send({ error: 'Class course mismatch.' })
      }
      const currentSize = await prisma.classMembership.count({
        where: { classId: classroom.id, status: 'active' },
      })
      const compatibility = evaluatePlacementCompatibility(
        {
          ageBand: ageBandSchema.parse(placement.student.ageBand) as AgeBand,
          level: placement.requestedLevel,
        },
        {
          allowedAgeBands: classroom.allowedAgeBands.map((band) =>
            ageBandSchema.parse(band),
          ) as AgeBand[],
          minLevel: classroom.minLevel,
          maxLevel: classroom.maxLevel,
          currentSize,
          capacity: classroom.capacity,
          status: classroom.status,
        },
      )
      if (!compatibility.compatible) {
        return reply.code(409).send({
          error: 'Learner is not compatible with this class.',
          reasons: compatibility.reasons,
        })
      }
      const futureTargetSessions = await prisma.classSession.findMany({
        where: {
          classId: classroom.id,
          status: 'scheduled',
          startsAt: { gt: new Date() },
        },
        select: { id: true, startsAt: true, endsAt: true },
      })
      for (const targetSession of futureTargetSessions) {
        const conflicts = await scheduleConflicts({
          teacherId: classroom.teacherId,
          studentIds: [placement.studentId],
          startsAt: targetSession.startsAt,
          endsAt: targetSession.endsAt,
          excludeSessionIds: [targetSession.id],
        })
        if (conflicts.studentSessionIds.length > 0) {
          return reply.code(409).send({
            error: 'Learner has a future schedule conflict.',
            conflicts,
          })
        }
      }
      const updated = await prisma.$transaction(
        async (tx) => {
          const lockedCount = await tx.classMembership.count({
            where: { classId: classroom.id, status: 'active' },
          })
          if (lockedCount >= classroom.capacity) {
            throw httpError(409, 'Class capacity reached.')
          }
          await tx.classMembership.upsert({
            where: {
              classId_studentId: {
                classId: classroom.id,
                studentId: placement.studentId,
              },
            },
            create: {
              classId: classroom.id,
              studentId: placement.studentId,
            },
            update: { status: 'active', leftAt: null, joinedAt: new Date() },
          })
          if (!placement.student.classId) {
            await tx.user.update({
              where: { id: placement.studentId },
              data: { classId: classroom.id },
            })
          }
          const row = await tx.classPlacementRequest.update({
            where: { id: placement.id },
            data: {
              status: 'placed',
              targetClassId: classroom.id,
              resolutionNote: body.reason,
            },
          })
          await tx.auditEvent.create({
            data: {
              actorId: user.id,
              action: 'schedule.placement_decided',
              targetType: 'class_placement_request',
              targetId: row.id,
              reason: body.reason,
              afterJson: {
                status: row.status,
                classId: classroom.id,
                studentId: placement.studentId,
              },
              requestId: request.id,
              ipAddress: request.ip,
            },
          })
          return row
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      )
      return { request: updated }
    },
  )

  app.get('/api/schedule/sessions/:sessionId/attendance', async (request) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'attendance:write')) throw httpError(403, 'Forbidden')
    const { sessionId } = z
      .object({ sessionId: z.string().uuid() })
      .parse(request.params)
    const session = await prisma.classSession.findUnique({
      where: { id: sessionId },
      include: {
        classroom: true,
        quest: { select: { id: true, title: true, goalsJson: true } },
        attendance: {
          include: {
            revisions: { orderBy: { createdAt: 'desc' }, take: 10 },
          },
        },
      },
    })
    if (!session) throw httpError(404, 'Session not found.')
    await assertClassScope(user, session.classId)
    return {
      session,
      students: await sessionStudents(session.id, session.classId),
    }
  })

  app.put(
    '/api/schedule/sessions/:sessionId/attendance',
    async (request, reply) => {
      const user = requireRole(request, ['teacher', 'admin'])
      if (!can(user.role, 'attendance:write')) {
        return reply.code(403).send({ error: 'Forbidden' })
      }
      const { sessionId } = z
        .object({ sessionId: z.string().uuid() })
        .parse(request.params)
      const body = z
        .object({
          reason: z.string().min(5).max(500),
          finalize: z.boolean().default(false),
          records: z
            .array(
              z.object({
                studentId: z.string().uuid(),
                status: attendanceStatusSchema,
                note: z.string().max(1_000).nullable().optional(),
                version: z.number().int().positive().nullable().optional(),
              }),
            )
            .min(1)
            .max(500),
        })
        .parse(request.body)
      const session = await prisma.classSession.findUnique({
        where: { id: sessionId },
      })
      if (!session) return reply.code(404).send({ error: 'Session not found' })
      await assertClassScope(user, session.classId)
      const students = await sessionStudents(session.id, session.classId)
      const allowedIds = new Set(students.map((student) => student.id))
      if (body.records.some((record) => !allowedIds.has(record.studentId))) {
        return reply.code(400).send({
          error: 'Attendance includes a learner outside this session.',
        })
      }
      if (
        body.finalize &&
        new Set(body.records.map((record) => record.studentId)).size !==
          allowedIds.size
      ) {
        return reply.code(400).send({
          error: 'Record every learner before finalizing attendance.',
        })
      }
      const records = await prisma.$transaction(async (tx) => {
        const rows = []
        for (const input of body.records) {
          const existing = await tx.attendanceRecord.findUnique({
            where: {
              sessionId_studentId: {
                sessionId,
                studentId: input.studentId,
              },
            },
          })
          if (
            existing &&
            input.version !== null &&
            input.version !== undefined &&
            existing.version !== input.version
          ) {
            throw httpError(
              409,
              'Attendance changed on another device. Reload before saving.',
            )
          }
          const row = existing
            ? await tx.attendanceRecord.update({
                where: { id: existing.id },
                data: {
                  status: input.status,
                  note: input.note,
                  version: { increment: 1 },
                },
              })
            : await tx.attendanceRecord.create({
                data: {
                  sessionId,
                  studentId: input.studentId,
                  status: input.status,
                  note: input.note,
                },
              })
          await tx.attendanceRevision.create({
            data: {
              attendanceId: row.id,
              actorId: user.id,
              previousStatus: existing?.status,
              newStatus: row.status,
              previousNote: existing?.note,
              newNote: row.note,
              reason: body.reason,
            },
          })
          rows.push(row)
        }
        if (body.finalize) {
          await tx.classSession.update({
            where: { id: sessionId },
            data: { attendanceFinalizedAt: new Date() },
          })
        }
        await tx.auditEvent.create({
          data: {
            actorId: user.id,
            action: body.finalize
              ? 'attendance.finalized'
              : 'attendance.changed',
            targetType: 'class_session',
            targetId: sessionId,
            reason: body.reason,
            afterJson: {
              finalized: body.finalize,
              attendanceIds: rows.map((row) => row.id),
            },
            requestId: request.id,
            ipAddress: request.ip,
          },
        })
        return rows
      })
      return { records, finalized: body.finalize }
    },
  )

  app.post('/api/teacher/observations', async (request, reply) => {
    const user = requireRole(request, ['teacher'])
    if (!can(user.role, 'observation:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        studentId: z.string().uuid(),
        courseId: z.string().min(1).max(120).nullable().optional(),
        sessionId: z.string().uuid().nullable().optional(),
        body: z.string().min(2).max(3_000),
        strengths: z.array(z.string().min(1).max(300)).max(20),
        development: z.array(z.string().min(1).max(300)).max(20),
        scorePercent: z.number().min(0).max(100).nullable().optional(),
        status: z.enum(['draft', 'published']).default('draft'),
      })
      .superRefine((value, context) => {
        if (
          value.status === 'published' &&
          value.scorePercent == null
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['scorePercent'],
            message:
              'Published competency observations require an explicit score.',
          })
        }
      })
      .parse(request.body)
    await assertStudentScope(request, user, body.studentId)
    const membership = await prisma.classMembership.findFirst({
      where: {
        studentId: body.studentId,
        status: 'active',
        classroom: {
          teacherId: user.id,
          ...(body.courseId ? { courseId: body.courseId } : {}),
          ...(body.sessionId
            ? { sessions: { some: { id: body.sessionId } } }
            : {}),
        },
      },
      include: { classroom: true },
    })
    if (!membership) {
      return reply.code(403).send({ error: 'Learner is not in your class.' })
    }
    const safeBody = validateChildText(body.body, { maxLength: 3_000 })
    if (!safeBody.ok) {
      return reply.code(400).send({ error: safeBody.message })
    }
    for (const text of [...body.strengths, ...body.development]) {
      const safe = validateChildText(text, { maxLength: 300 })
      if (!safe.ok) return reply.code(400).send({ error: safe.message })
    }
    const observation = await prisma.$transaction(async (tx) => {
      const row = await tx.teacherObservation.create({
        data: {
          teacherId: user.id,
          studentId: body.studentId,
          courseId: body.courseId ?? membership.classroom.courseId,
          sessionId: body.sessionId,
          body: body.body,
          strengthsJson: body.strengths,
          developmentJson: body.development,
          scorePercent: body.scorePercent,
          status: body.status,
          publishedAt: body.status === 'published' ? new Date() : null,
        },
      })
      if (row.status === 'published') {
        await recordPublishedTeacherObservationEvidence(tx, row.id)
      }
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action:
            row.status === 'published'
              ? 'teacher_observation.published'
              : 'teacher_observation.created',
          targetType: 'teacher_observation',
          targetId: row.id,
          afterJson: {
            studentId: row.studentId,
            courseId: row.courseId,
            sessionId: row.sessionId,
            scorePercent: row.scorePercent,
            status: row.status,
          },
          requestId: request.id,
          ipAddress: request.ip,
        },
      })
      return row
    })
    return reply.code(201).send({ observation })
  })

  app.patch(
    '/api/teacher/observations/:observationId',
    async (request, reply) => {
      const user = requireRole(request, ['teacher'])
      const { observationId } = z
        .object({ observationId: z.string().uuid() })
        .parse(request.params)
      const body = z
        .object({
          version: z.number().int().positive(),
          body: z.string().min(2).max(3_000).optional(),
          strengths: z.array(z.string().min(1).max(300)).max(20).optional(),
          development: z.array(z.string().min(1).max(300)).max(20).optional(),
          scorePercent: z.number().min(0).max(100).nullable().optional(),
          status: z.enum(['draft', 'published']).optional(),
        })
        .parse(request.body)
      const existing = await prisma.teacherObservation.findFirst({
        where: { id: observationId, teacherId: user.id },
      })
      if (!existing) {
        return reply.code(404).send({ error: 'Observation not found' })
      }
      if (existing.status === 'published') {
        return reply.code(409).send({
          error: 'Published observations are immutable; create a new version.',
        })
      }
      const finalScore =
        body.scorePercent === undefined
          ? existing.scorePercent
          : body.scorePercent
      if (body.status === 'published' && finalScore === null) {
        return reply.code(400).send({
          error:
            'Published competency observations require an explicit score.',
        })
      }
      if (body.body) {
        const safe = validateChildText(body.body, { maxLength: 3_000 })
        if (!safe.ok) return reply.code(400).send({ error: safe.message })
      }
      for (const text of [
        ...(body.strengths ?? []),
        ...(body.development ?? []),
      ]) {
        const safe = validateChildText(text, { maxLength: 300 })
        if (!safe.ok) return reply.code(400).send({ error: safe.message })
      }
      const observation = await prisma.$transaction(async (tx) => {
        const updated = await tx.teacherObservation.updateMany({
          where: {
            id: observationId,
            teacherId: user.id,
            version: body.version,
            status: 'draft',
          },
          data: {
            body: body.body,
            strengthsJson: body.strengths,
            developmentJson: body.development,
            scorePercent: body.scorePercent,
            status: body.status,
            publishedAt:
              body.status === 'published' ? new Date() : undefined,
            version: { increment: 1 },
          },
        })
        if (!updated.count) {
          throw httpError(409, 'Observation changed on another device.')
        }
        const row = await tx.teacherObservation.findUniqueOrThrow({
          where: { id: observationId },
        })
        if (row.status === 'published') {
          await recordPublishedTeacherObservationEvidence(tx, row.id)
        }
        await tx.auditEvent.create({
          data: {
            actorId: user.id,
            action:
              row.status === 'published'
                ? 'teacher_observation.published'
                : 'teacher_observation.changed',
            targetType: 'teacher_observation',
            targetId: row.id,
            beforeJson: {
              version: existing.version,
              status: existing.status,
              scorePercent: existing.scorePercent,
            },
            afterJson: {
              version: row.version,
              status: row.status,
              scorePercent: row.scorePercent,
            },
            requestId: request.id,
            ipAddress: request.ip,
          },
        })
        return row
      })
      return { observation }
    },
  )

  app.post('/api/schedule/reschedule-requests', async (request, reply) => {
    const user = requireRole(request, ['parent', 'admin'])
    if (!can(user.role, 'reschedule:request')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        sessionId: z.string().uuid(),
        studentId: z.string().uuid(),
        preferredStartsAt: z.coerce.date(),
        preferredEndsAt: z.coerce.date(),
        reason: z.string().min(5).max(1_000),
      })
      .refine((value) => value.preferredEndsAt > value.preferredStartsAt)
      .parse(request.body)
    await assertStudentScope(request, user, body.studentId)
    const learner = await prisma.user.findUniqueOrThrow({
      where: { id: body.studentId },
      select: { ageBand: true },
    })
    const agePolicy = await prisma.ageExperiencePolicy.findFirst({
      where: { ageBand: learner.ageBand, status: 'published' },
      orderBy: { version: 'desc' },
    })
    const ageExperience = agePolicy
      ? parsePublishedAgePolicy(agePolicy)
      : null
    if (!ageExperience) {
      return reply.code(409).send({
        error: 'Customer-approved age policy is required.',
        reason: 'age_policy_required',
      })
    }
    if (!ageExperience.permissionPolicy.canRequestReschedule) {
      return reply.code(403).send({
        error: 'Reschedule requests are disabled for this learner age group.',
        reason: 'age_reschedule_denied',
      })
    }
    const session = await prisma.classSession.findUnique({
      where: { id: body.sessionId },
      include: { classroom: true },
    })
    if (!session) return reply.code(404).send({ error: 'Session not found' })
    const membership = await prisma.classMembership.findUnique({
      where: {
        classId_studentId: {
          classId: session.classId,
          studentId: body.studentId,
        },
      },
    })
    if (!membership || membership.status !== 'active') {
      return reply.code(403).send({ error: 'Learner is not in this session.' })
    }
    if (
      session.changeDeadline &&
      session.changeDeadline.getTime() <= Date.now()
    ) {
      return reply.code(409).send({
        error: 'The published reschedule deadline has passed.',
      })
    }
    const policy = await prisma.schedulePolicy.findFirst({
      where: {
        classType: session.classroom.classType,
        status: 'published',
      },
      orderBy: { version: 'desc' },
    })
    if (!policy) {
      return reply.code(409).send({ error: 'Schedule policy unavailable.' })
    }
    const periodStart = new Date(
      Date.now() - policy.periodDays * 24 * 60 * 60 * 1_000,
    )
    const recentCount = await prisma.rescheduleRequest.count({
      where: {
        studentId: body.studentId,
        createdAt: { gte: periodStart },
        status: { in: ['pending', 'approved'] },
      },
    })
    if (recentCount >= policy.maxReschedulesPerPeriod) {
      return reply.code(409).send({
        error: 'Published reschedule limit reached.',
      })
    }
    const row = await prisma.rescheduleRequest.create({
      data: {
        ...body,
        requestedById: user.id,
      },
    })
    return reply.code(201).send({ request: row })
  })

  app.get('/api/schedule/reschedule-requests', async (request) => {
    const user = requireRole(request, ['parent', 'teacher', 'admin'])
    if (
      !can(user.role, 'reschedule:decide') &&
      !can(user.role, 'reschedule:request')
    ) {
      throw httpError(403, 'Forbidden')
    }
    const { status, studentId } = z
      .object({
        status: z
          .enum(['pending', 'approved', 'rejected', 'cancelled'])
          .default('pending'),
        studentId: z.string().uuid().optional(),
      })
      .parse(request.query)
    if (studentId) await assertStudentScope(request, user, studentId)
    const requests = await prisma.rescheduleRequest.findMany({
      where: {
        status,
        studentId,
        ...(user.role === 'parent'
          ? {
              student: { parentId: user.id },
            }
          : user.role === 'teacher'
            ? { session: { classroom: { teacherId: user.id } } }
            : {}),
      },
      orderBy: { createdAt: 'asc' },
      include: {
        student: {
          select: { id: true, nickname: true, ageBand: true, level: true },
        },
        session: {
          include: {
            classroom: {
              select: {
                id: true,
                name: true,
                classType: true,
                courseId: true,
              },
            },
          },
        },
        targetSession: {
          select: { id: true, title: true, startsAt: true, endsAt: true },
        },
      },
    })
    return { requests }
  })

  app.post(
    '/api/schedule/reschedule-requests/:rescheduleId/decide',
    async (request, reply) => {
      const user = requireRole(request, ['teacher', 'admin'])
      if (!can(user.role, 'reschedule:decide')) {
        return reply.code(403).send({ error: 'Forbidden' })
      }
      const { rescheduleId } = z
        .object({ rescheduleId: z.string().uuid() })
        .parse(request.params)
      const body = z
        .object({
          decision: z.enum(['approved', 'rejected']),
          targetSessionId: z.string().uuid().nullable().optional(),
          reason: z.string().max(1_000).default(''),
        })
        .parse(request.body)
      const reschedule = await prisma.rescheduleRequest.findUnique({
        where: { id: rescheduleId },
        include: { session: { include: { classroom: true } } },
      })
      if (!reschedule) {
        return reply.code(404).send({ error: 'Request not found' })
      }
      await assertClassScope(user, reschedule.session.classId)
      if (reschedule.status !== 'pending') {
        return reply.code(409).send({ error: 'Request already decided.' })
      }
      let target = null
      if (body.decision === 'approved' && body.targetSessionId) {
        target = await prisma.classSession.findUnique({
          where: { id: body.targetSessionId },
          include: { classroom: true },
        })
        if (
          !target ||
          target.classroom.courseId !== reschedule.session.classroom.courseId ||
          target.status !== 'scheduled'
        ) {
          return reply.code(400).send({
            error: 'Replacement session is not compatible.',
          })
        }
        const participants = await sessionStudents(target.id, target.classId)
        if (participants.length >= target.classroom.capacity) {
          return reply.code(409).send({
            error: 'Replacement session capacity reached.',
          })
        }
        const conflicts = await scheduleConflicts({
          teacherId: target.classroom.teacherId,
          studentIds: [reschedule.studentId],
          startsAt: target.startsAt,
          endsAt: target.endsAt,
          excludeSessionIds: [reschedule.sessionId, target.id],
        })
        if (conflicts.studentSessionIds.length > 0) {
          return reply.code(409).send({
            error: 'Learner has a schedule conflict.',
            conflicts,
          })
        }
      }
      if (
        body.decision === 'approved' &&
        !target &&
        reschedule.session.classroom.classType !== 'one_to_one'
      ) {
        return reply.code(400).send({
          error: 'Group reschedules require a compatible target session.',
        })
      }
      if (body.decision === 'approved' && !target) {
        const conflicts = await scheduleConflicts({
          teacherId: reschedule.session.classroom.teacherId,
          studentIds: [reschedule.studentId],
          startsAt: reschedule.preferredStartsAt,
          endsAt: reschedule.preferredEndsAt,
          excludeSessionIds: [reschedule.sessionId],
        })
        if (
          conflicts.teacherSessionIds.length > 0 ||
          conflicts.studentSessionIds.length > 0
        ) {
          return reply.code(409).send({
            error: 'Requested time has a schedule conflict.',
            conflicts,
          })
        }
      }
      const updated = await prisma.$transaction(async (tx) => {
        if (body.decision === 'approved' && target) {
          await tx.classSessionParticipant.upsert({
            where: {
              sessionId_studentId: {
                sessionId: target.id,
                studentId: reschedule.studentId,
              },
            },
            create: {
              sessionId: target.id,
              studentId: reschedule.studentId,
              sourceType: 'reschedule',
              sourceId: reschedule.id,
            },
            update: {
              sourceType: 'reschedule',
              sourceId: reschedule.id,
              status: 'active',
            },
          })
        }
        if (body.decision === 'approved' && !target) {
          await tx.classSession.update({
            where: { id: reschedule.sessionId },
            data: {
              startsAt: reschedule.preferredStartsAt,
              endsAt: reschedule.preferredEndsAt,
            },
          })
        }
        const row = await tx.rescheduleRequest.update({
          where: { id: reschedule.id },
          data: {
            status: body.decision,
            targetSessionId: target?.id,
            handledById: user.id,
            decisionReason: body.reason,
            handledAt: new Date(),
          },
        })
        await tx.auditEvent.create({
          data: {
            actorId: user.id,
            action: 'schedule.reschedule_decided',
            targetType: 'reschedule_request',
            targetId: row.id,
            reason: body.reason,
            beforeJson: {
              sessionId: row.sessionId,
              startsAt: reschedule.session.startsAt.toISOString(),
              endsAt: reschedule.session.endsAt.toISOString(),
            },
            afterJson: {
              status: row.status,
              targetSessionId: row.targetSessionId,
              preferredStartsAt: row.preferredStartsAt.toISOString(),
              preferredEndsAt: row.preferredEndsAt.toISOString(),
            },
            requestId: request.id,
            ipAddress: request.ip,
          },
        })
        return row
      })
      return { request: updated }
    },
  )

  app.post('/api/admin/schedule/reminders/process', async (request) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'schedule-policy:write')) throw httpError(403, 'Forbidden')
    const { limit } = z
      .object({ limit: z.number().int().min(1).max(100).default(50) })
      .parse(request.body ?? {})
    const due = await prisma.sessionReminderDelivery.findMany({
      where: {
        status: { in: ['pending', 'failed'] },
        attempts: { lt: 5 },
        scheduledFor: { lte: new Date() },
        OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: new Date() } }],
        session: { status: 'scheduled', startsAt: { gt: new Date() } },
      },
      orderBy: { scheduledFor: 'asc' },
      take: limit,
      include: {
        recipient: { select: { id: true, email: true, nickname: true } },
        session: {
          select: {
            id: true,
            title: true,
            startsAt: true,
            meetingUrl: true,
          },
        },
      },
    })
    const outcomes = []
    for (const delivery of due) {
      const claimed = await prisma.sessionReminderDelivery.updateMany({
        where: {
          id: delivery.id,
          status: { in: ['pending', 'failed'] },
          attempts: delivery.attempts,
        },
        data: {
          status: 'processing',
          attempts: { increment: 1 },
          lastError: null,
        },
      })
      if (!claimed.count) continue
      try {
        if (delivery.channel === 'zalo') {
          throw new Error('ZALO_PROVIDER_NOT_CONFIGURED')
        }
        if (delivery.channel === 'email') {
          if (!delivery.recipient.email) {
            throw new Error('RECIPIENT_EMAIL_MISSING')
          }
          const outcome = await emailService.sendMail(
            delivery.recipient.email,
            `Nhắc lịch: ${delivery.session.title}`,
            `<p>${escapeHtml(delivery.session.title)}</p><p>${escapeHtml(
              delivery.session.startsAt.toISOString(),
            )}</p>`,
          )
          if (!outcome.delivered) {
            throw new Error('EMAIL_PROVIDER_NOT_CONFIGURED')
          }
          await prisma.sessionReminderDelivery.update({
            where: { id: delivery.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
              providerMessageId: outcome.providerMessageId,
            },
          })
        } else {
          let notificationId = delivery.providerMessageId
          let notification = notificationId
            ? await prisma.notification.findUnique({
                where: { id: notificationId },
              })
            : null
          if (!notification) {
            notification = await prisma.notification.create({
              data: {
                userId: delivery.recipientId,
                type: 'class_reminder',
                title: 'Lịch học sắp bắt đầu',
                body: delivery.session.title,
                data: JSON.stringify({
                  sessionId: delivery.sessionId,
                  startsAt: delivery.session.startsAt.toISOString(),
                  meetingUrl: delivery.session.meetingUrl,
                }),
              },
            })
            notificationId = notification.id
          }
          if (delivery.channel === 'push') {
            if (notification.pushStatus === 'sent') {
              // The push worker has confirmed provider delivery.
            } else if (
              notification.pushStatus === 'queued' ||
              notification.pushStatus === 'processing'
            ) {
              await prisma.sessionReminderDelivery.update({
                where: { id: delivery.id },
                data: {
                  status: 'pending',
                  providerMessageId: notification.id,
                  nextAttemptAt: new Date(Date.now() + 30_000),
                  attempts: { decrement: 1 },
                },
              })
              outcomes.push({
                id: delivery.id,
                status: 'awaiting_provider',
              })
              continue
            } else if (!(await enqueueNotificationPush(notification.id))) {
              throw new Error('PUSH_PROVIDER_NOT_CONFIGURED')
            } else {
              await prisma.sessionReminderDelivery.update({
                where: { id: delivery.id },
                data: {
                  status: 'pending',
                  providerMessageId: notification.id,
                  nextAttemptAt: new Date(Date.now() + 30_000),
                },
              })
              outcomes.push({
                id: delivery.id,
                status: 'awaiting_provider',
              })
              continue
            }
          }
          await prisma.sessionReminderDelivery.update({
            where: { id: delivery.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
              providerMessageId: notification.id,
            },
          })
        }
        outcomes.push({ id: delivery.id, status: 'sent' })
      } catch (error) {
        const message =
          error instanceof Error ? error.message.slice(0, 500) : 'Unknown'
        const exhausted = delivery.attempts + 1 >= 5
        await prisma.sessionReminderDelivery.update({
          where: { id: delivery.id },
          data: {
            status: exhausted ? 'cancelled' : 'failed',
            lastError: message,
            nextAttemptAt: exhausted
              ? null
              : new Date(
                  Date.now() +
                    Math.min(15 * 60_000, 60_000 * 2 ** delivery.attempts),
                ),
          },
        })
        outcomes.push({
          id: delivery.id,
          status: exhausted ? 'cancelled' : 'failed',
          error: message,
        })
      }
    }
    return { processed: outcomes.length, outcomes }
  })
}
