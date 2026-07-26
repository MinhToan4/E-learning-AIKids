import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { can, type AssessmentQuestionType } from '@aikids/domain'
import { Prisma } from '../../generated/prisma/index.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import { requireRole } from '../../infrastructure/session/session.js'
import {
  parseQuestionAuthoring,
  questionTypeSchema,
} from './assessment-contract.js'

const ageBandSchema = z.enum(['6_8', '9_11', '11_plus'])
const questionVersionBodySchema = z.object({
  type: questionTypeSchema,
  prompt: z.record(z.unknown()),
  answerKey: z.record(z.unknown()),
  rubric: z.record(z.unknown()).default({}),
  explanation: z.string().max(2_000).nullable().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  ageBands: z.array(ageBandSchema).min(1).max(3),
  status: z.enum(['draft', 'published']).default('draft'),
  reason: z.string().min(5).max(500),
})
const assessmentVersionBodySchema = z.object({
  instructions: z.record(z.unknown()).default({}),
  durationMinutes: z.number().int().min(1).max(480).default(30),
  passScore: z.number().min(0).max(100).default(70),
  maxAttempts: z.number().int().min(1).max(100).default(3),
  cooldownMinutes: z.number().int().min(0).max(525_600).default(0),
  allowResume: z.boolean().default(true),
  randomizeQuestions: z.boolean().default(false),
  feedbackPolicy: z
    .enum(['after_submit', 'after_grade', 'after_publish', 'never'])
    .default('after_publish'),
  status: z.enum(['draft', 'published']).default('draft'),
  items: z
    .array(
      z.object({
        questionVersionId: z.string().uuid(),
        order: z.number().int().positive(),
        points: z.number().positive().max(100),
        required: z.boolean().default(true),
      }),
    )
    .min(1)
    .max(200),
  reason: z.string().min(5).max(500),
})

function httpError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode })
}

function parsedQuestion(input: z.infer<typeof questionVersionBodySchema>) {
  try {
    return parseQuestionAuthoring({
      type: input.type as AssessmentQuestionType,
      prompt: input.prompt,
      answerKey: input.answerKey,
      rubric: input.rubric,
    })
  } catch (error) {
    throw httpError(
      400,
      error instanceof Error ? error.message : 'Invalid question contract',
    )
  }
}

async function createAssessmentVersion(
  request: FastifyRequest,
  assessmentId: string,
  actorId: string,
  body: z.infer<typeof assessmentVersionBodySchema>,
) {
  if (
    new Set(body.items.map((item) => item.questionVersionId)).size !==
      body.items.length ||
    new Set(body.items.map((item) => item.order)).size !== body.items.length
  ) {
    throw httpError(400, 'Question versions and item order must be unique.')
  }
  const [assessment, latest, questions] = await Promise.all([
    prisma.assessment.findUnique({ where: { id: assessmentId } }),
    prisma.assessmentVersion.findFirst({
      where: { assessmentId },
      orderBy: { version: 'desc' },
    }),
    prisma.questionVersion.findMany({
      where: {
        id: { in: body.items.map((item) => item.questionVersionId) },
      },
      select: {
        id: true,
        status: true,
        question: { select: { courseId: true } },
      },
    }),
  ])
  if (!assessment) throw httpError(404, 'Assessment not found.')
  if (questions.length !== body.items.length) {
    throw httpError(400, 'One or more question versions do not exist.')
  }
  if (
    body.status === 'published' &&
    questions.some((question) => question.status !== 'published')
  ) {
    throw httpError(409, 'Publish every question version before the assessment.')
  }
  if (
    questions.some(
      (question) =>
        question.question.courseId &&
        question.question.courseId !== assessment.courseId,
    )
  ) {
    throw httpError(400, 'Question bank course does not match the assessment.')
  }

  return prisma.$transaction(async (tx) => {
    if (body.status === 'published') {
      await tx.assessmentVersion.updateMany({
        where: { assessmentId, status: 'published' },
        data: { status: 'archived' },
      })
    }
    const version = await tx.assessmentVersion.create({
      data: {
        assessmentId,
        version: (latest?.version ?? 0) + 1,
        instructionsJson: body.instructions as Prisma.InputJsonValue,
        durationMinutes: body.durationMinutes,
        passScore: body.passScore,
        maxAttempts: body.maxAttempts,
        cooldownMinutes: body.cooldownMinutes,
        allowResume: body.allowResume,
        randomizeQuestions: body.randomizeQuestions,
        feedbackPolicy: body.feedbackPolicy,
        status: body.status,
        createdById: actorId,
        publishedAt: body.status === 'published' ? new Date() : null,
        items: {
          create: body.items.map((item) => ({
            questionVersionId: item.questionVersionId,
            order: item.order,
            points: item.points,
            required: item.required,
          })),
        },
      },
      include: { items: { orderBy: { order: 'asc' } } },
    })
    await tx.auditEvent.create({
      data: {
        actorId,
        action: 'assessment.version_created',
        targetType: 'assessment_version',
        targetId: version.id,
        reason: body.reason,
        afterJson: {
          assessmentId,
          version: version.version,
          status: version.status,
          itemCount: version.items.length,
        },
        requestId: request.id,
        ipAddress: request.ip,
      },
    })
    return version
  })
}

export async function assessmentAuthoringRoutes(app: FastifyInstance) {
  app.get('/api/teacher/question-bank', async (request) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'question-bank:write')) throw httpError(403, 'Forbidden')
    const query = z
      .object({
        courseId: z.string().min(1).max(120).optional(),
        type: questionTypeSchema.optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
        q: z.string().min(2).max(100).optional(),
        limit: z.coerce.number().int().min(1).max(100).default(50),
      })
      .parse(request.query)
    return {
      questions: await prisma.questionBankItem.findMany({
        where: {
          courseId: query.courseId,
          OR: query.q
            ? [
                { title: { contains: query.q, mode: 'insensitive' } },
                { code: { contains: query.q, mode: 'insensitive' } },
              ]
            : undefined,
          versions:
            query.type || query.status
              ? {
                  some: {
                    type: query.type,
                    status: query.status,
                  },
                }
              : undefined,
        },
        orderBy: { updatedAt: 'desc' },
        take: query.limit,
        include: { versions: { orderBy: { version: 'desc' } } },
      }),
    }
  })

  app.post('/api/teacher/question-bank', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'question-bank:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = questionVersionBodySchema
      .extend({
        code: z
          .string()
          .min(2)
          .max(100)
          .regex(/^[a-z0-9-]+$/),
        courseId: z.string().min(1).max(120).nullable().optional(),
        title: z.string().min(1).max(200),
        tags: z.array(z.string().min(1).max(60)).max(30).default([]),
      })
      .parse(request.body)
    const parsed = parsedQuestion(body)
    const question = await prisma.$transaction(async (tx) => {
      const row = await tx.questionBankItem.create({
        data: {
          code: body.code,
          courseId: body.courseId,
          title: body.title,
          tags: [...new Set(body.tags)],
          versions: {
            create: {
              version: 1,
              type: body.type,
              promptJson: parsed.prompt as Prisma.InputJsonValue,
              answerKeyJson: parsed.answerKey as Prisma.InputJsonValue,
              rubricJson: parsed.rubric as Prisma.InputJsonValue,
              explanation: body.explanation,
              difficulty: body.difficulty,
              ageBands: body.ageBands,
              status: body.status,
              authoredById: user.id,
              publishedAt: body.status === 'published' ? new Date() : null,
            },
          },
        },
        include: { versions: true },
      })
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'question.created',
          targetType: 'question_bank_item',
          targetId: row.id,
          reason: body.reason,
          afterJson: {
            code: row.code,
            version: 1,
            status: body.status,
            type: body.type,
          },
          requestId: request.id,
          ipAddress: request.ip,
        },
      })
      return row
    })
    return reply.code(201).send({ question })
  })

  app.post(
    '/api/teacher/question-bank/:questionId/versions',
    async (request, reply) => {
      const user = requireRole(request, ['teacher', 'admin'])
      if (!can(user.role, 'question-bank:write')) {
        return reply.code(403).send({ error: 'Forbidden' })
      }
      const { questionId } = z
        .object({ questionId: z.string().uuid() })
        .parse(request.params)
      const body = questionVersionBodySchema.parse(request.body)
      const parsed = parsedQuestion(body)
      const latest = await prisma.questionVersion.findFirst({
        where: { questionId },
        orderBy: { version: 'desc' },
      })
      if (!latest) return reply.code(404).send({ error: 'Question not found' })
      const version = await prisma.$transaction(async (tx) => {
        if (body.status === 'published') {
          await tx.questionVersion.updateMany({
            where: { questionId, status: 'published' },
            data: { status: 'archived' },
          })
        }
        const row = await tx.questionVersion.create({
          data: {
            questionId,
            version: latest.version + 1,
            type: body.type,
            promptJson: parsed.prompt as Prisma.InputJsonValue,
            answerKeyJson: parsed.answerKey as Prisma.InputJsonValue,
            rubricJson: parsed.rubric as Prisma.InputJsonValue,
            explanation: body.explanation,
            difficulty: body.difficulty,
            ageBands: body.ageBands,
            status: body.status,
            authoredById: user.id,
            publishedAt: body.status === 'published' ? new Date() : null,
          },
        })
        await tx.auditEvent.create({
          data: {
            actorId: user.id,
            action: 'question.version_created',
            targetType: 'question_version',
            targetId: row.id,
            reason: body.reason,
            afterJson: {
              questionId,
              version: row.version,
              status: row.status,
              type: row.type,
            },
            requestId: request.id,
            ipAddress: request.ip,
          },
        })
        return row
      })
      return reply.code(201).send({ version })
    },
  )

  app.get('/api/teacher/assessments', async (request) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'assessment:write')) throw httpError(403, 'Forbidden')
    const { courseId } = z
      .object({ courseId: z.string().min(1).max(120).optional() })
      .parse(request.query)
    return {
      assessments: await prisma.assessment.findMany({
        where: { courseId },
        orderBy: { updatedAt: 'desc' },
        include: {
          versions: {
            orderBy: { version: 'desc' },
            include: { items: { orderBy: { order: 'asc' } } },
          },
        },
      }),
    }
  })

  app.post('/api/teacher/assessments', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'assessment:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = assessmentVersionBodySchema
      .extend({
        code: z
          .string()
          .min(2)
          .max(100)
          .regex(/^[a-z0-9-]+$/),
        courseId: z.string().min(1).max(120),
        questId: z.string().min(1).max(120).nullable().optional(),
        title: z.string().min(1).max(200),
        kind: z
          .enum(['lesson_check', 'course_final', 'diagnostic', 'practice'])
          .default('course_final'),
      })
      .parse(request.body)
    const assessment = await prisma.assessment.create({
      data: {
        code: body.code,
        courseId: body.courseId,
        questId: body.questId,
        title: body.title,
        kind: body.kind,
      },
    })
    try {
      const version = await createAssessmentVersion(
        request,
        assessment.id,
        user.id,
        body,
      )
      return reply.code(201).send({ assessment, version })
    } catch (error) {
      await prisma.assessment.delete({ where: { id: assessment.id } })
      throw error
    }
  })

  app.post(
    '/api/teacher/assessments/:assessmentId/versions',
    async (request, reply) => {
      const user = requireRole(request, ['teacher', 'admin'])
      if (!can(user.role, 'assessment:write')) {
        return reply.code(403).send({ error: 'Forbidden' })
      }
      const { assessmentId } = z
        .object({ assessmentId: z.string().uuid() })
        .parse(request.params)
      const body = assessmentVersionBodySchema.parse(request.body)
      const version = await createAssessmentVersion(
        request,
        assessmentId,
        user.id,
        body,
      )
      return reply.code(201).send({ version })
    },
  )
}
