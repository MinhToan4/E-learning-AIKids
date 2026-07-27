import { createHash, randomInt } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  can,
  canStartAssessmentAttempt,
  gradeObjectiveResponse,
  summarizeAssessmentScore,
  validateChildText,
  type AssessmentQuestionType,
} from '@aikids/domain'
import { Prisma } from '../../generated/prisma/index.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import { requireRole } from '../../infrastructure/session/session.js'
import {
  parseQuestionAuthoring,
  parseStudentResponse,
  publicQuestion,
  questionTypeSchema,
  studentTextMaxLength,
} from './assessment-contract.js'
import { parsePublishedAgePolicy } from '../learning/age-policy.js'

function httpError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode })
}

function shuffled<T>(values: T[]): T[] {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = randomInt(index + 1)
    ;[result[index], result[target]] = [result[target]!, result[index]!]
  }
  return result
}

async function assertCourseEnrollment(studentId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: studentId, courseId } },
  })
  if (!enrollment) throw httpError(403, 'Course enrollment is required.')
}

function orderedItems<
  T extends { questionVersionId: string },
>(attempt: { itemOrderJson: Prisma.JsonValue }, items: T[]): T[] {
  const order = Array.isArray(attempt.itemOrderJson)
    ? attempt.itemOrderJson.filter(
        (value): value is string => typeof value === 'string',
      )
    : []
  const rank = new Map(order.map((id, index) => [id, index]))
  return [...items].sort(
    (left, right) =>
      (rank.get(left.questionVersionId) ?? Number.MAX_SAFE_INTEGER) -
      (rank.get(right.questionVersionId) ?? Number.MAX_SAFE_INTEGER),
  )
}

function learnerAttemptPayload(attempt: {
  id: string
  status: string
  attemptNumber: number
  version: number
  startedAt: Date
  expiresAt: Date
  submittedAt: Date | null
  publishedAt: Date | null
  scorePercent: number | null
  passed: boolean | null
  itemOrderJson: Prisma.JsonValue
  assessmentVersion: {
    instructionsJson: Prisma.JsonValue
    durationMinutes: number
    feedbackPolicy: string
    assessment: { id: string; title: string; courseId: string }
    items: Array<{
      questionVersionId: string
      order: number
      points: number
      required: boolean
      questionVersion: {
        id: string
        type: string
        promptJson: Prisma.JsonValue
        answerKeyJson: Prisma.JsonValue
        rubricJson: Prisma.JsonValue
        explanation: string | null
      }
    }>
  }
  responses: Array<{
    questionVersionId: string
    responseJson: Prisma.JsonValue
    version: number
  }>
}) {
  const published = attempt.status === 'published'
  const responseByQuestion = new Map(
    attempt.responses.map((response) => [
      response.questionVersionId,
      response,
    ]),
  )
  return {
    id: attempt.id,
    assessment: attempt.assessmentVersion.assessment,
    status: attempt.status,
    attemptNumber: attempt.attemptNumber,
    version: attempt.version,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    submittedAt: attempt.submittedAt,
    instructions: attempt.assessmentVersion.instructionsJson,
    durationMinutes: attempt.assessmentVersion.durationMinutes,
    scorePercent: published ? attempt.scorePercent : null,
    passed: published ? attempt.passed : null,
    items: orderedItems(
      attempt,
      attempt.assessmentVersion.items.map((item) => ({
        order: item.order,
        points: item.points,
        required: item.required,
        questionVersionId: item.questionVersionId,
        question: publicQuestion(item.questionVersion),
        response: responseByQuestion.get(item.questionVersionId) ?? null,
        explanation:
          published &&
          attempt.assessmentVersion.feedbackPolicy === 'after_publish'
            ? item.questionVersion.explanation
            : null,
      })),
    ),
  }
}

const attemptInclude = {
  assessmentVersion: {
    include: {
      assessment: {
        select: { id: true, title: true, courseId: true },
      },
      items: {
        orderBy: { order: 'asc' as const },
        include: { questionVersion: true },
      },
    },
  },
  responses: {
    select: {
      questionVersionId: true,
      responseJson: true,
      version: true,
    },
  },
} satisfies Prisma.AssessmentAttemptInclude

async function artifactSnapshot(
  tx: Prisma.TransactionClient,
  studentId: string,
  response: {
    sourceType: 'project' | 'asset' | 'upload'
    sourceId: string
  },
) {
  if (response.sourceType === 'project') {
    const project = await tx.project.findFirst({
      where: { id: response.sourceId, userId: studentId },
      select: {
        id: true,
        title: true,
        kind: true,
        thumbnail: true,
        dataJson: true,
        updatedAt: true,
      },
    })
    if (!project) throw httpError(404, 'Portfolio project not found.')
    return {
      ids: { projectId: project.id },
      snapshot: { sourceType: 'project', ...project },
    }
  }
  if (response.sourceType === 'asset') {
    const asset = await tx.asset.findFirst({
      where: { id: response.sourceId, userId: studentId },
      select: {
        id: true,
        type: true,
        name: true,
        questId: true,
        thumbnail: true,
        metaJson: true,
        createdAt: true,
      },
    })
    if (!asset) throw httpError(404, 'Portfolio asset not found.')
    return {
      ids: { assetId: asset.id },
      snapshot: { sourceType: 'asset', ...asset },
    }
  }
  const upload = await tx.storageObject.findFirst({
    where: {
      id: response.sourceId,
      userId: studentId,
      status: 'ready',
    },
    select: {
      id: true,
      objectPath: true,
      bucket: true,
      purpose: true,
      fileName: true,
      mime: true,
      size: true,
      readyAt: true,
    },
  })
  if (!upload) throw httpError(404, 'Ready upload not found.')
  return {
    ids: { storageObjectId: upload.id },
    snapshot: { sourceType: 'upload', ...upload },
  }
}

export async function assessmentAttemptRoutes(app: FastifyInstance) {
  app.get('/api/assessments/course/:courseId', async (request) => {
    const user = requireRole(request, ['student'])
    if (!can(user.role, 'assessment:read')) throw httpError(403, 'Forbidden')
    const { courseId } = z
      .object({ courseId: z.string().min(1).max(120) })
      .parse(request.params)
    await assertCourseEnrollment(user.id, courseId)
    const student = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { ageBand: true },
    })
    const compatiblePublishedVersion: Prisma.AssessmentVersionWhereInput = {
      status: 'published',
      items: {
        every: {
          questionVersion: {
            OR: [
              { ageBands: { isEmpty: true } },
              { ageBands: { has: student.ageBand } },
            ],
          },
        },
      },
    }
    const assessments = await prisma.assessment.findMany({
      where: {
        courseId,
        status: 'active',
        versions: { some: compatiblePublishedVersion },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        versions: {
          where: compatiblePublishedVersion,
          orderBy: { version: 'desc' },
          take: 1,
          select: {
            id: true,
            version: true,
            durationMinutes: true,
            passScore: true,
            maxAttempts: true,
            cooldownMinutes: true,
            allowResume: true,
            _count: { select: { items: true } },
          },
        },
      },
    })
    const latestAttempts = await Promise.all(
      assessments.map((assessment) =>
        prisma.assessmentAttempt.findFirst({
          where: {
            studentId: user.id,
            assessmentVersion: { assessmentId: assessment.id },
          },
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            status: true,
            attemptNumber: true,
            scorePercent: true,
            passed: true,
            updatedAt: true,
          },
        }),
      ),
    )
    return {
      assessments: assessments.map((assessment, index) => {
        const latest = latestAttempts[index]
        return {
          ...assessment,
          latestAttempt: latest
            ? {
                id: latest.id,
                status: latest.status,
                attemptNumber: latest.attemptNumber,
                scorePercent: latest.scorePercent,
                passed: latest.passed,
                updatedAt: latest.updatedAt,
              }
            : null,
        }
      }),
    }
  })

  app.post('/api/assessments/:assessmentId/attempts', async (request, reply) => {
    const user = requireRole(request, ['student'])
    if (!can(user.role, 'assessment:take')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { assessmentId } = z
      .object({ assessmentId: z.string().uuid() })
      .parse(request.params)
    const { clientAttemptId } = z
      .object({ clientAttemptId: z.string().uuid() })
      .parse(request.body)
    const existing = await prisma.assessmentAttempt.findUnique({
      where: {
        studentId_clientAttemptId: {
          studentId: user.id,
          clientAttemptId,
        },
      },
      include: attemptInclude,
    })
    if (existing) return { attempt: learnerAttemptPayload(existing) }

    const assessment = await prisma.assessment.findFirst({
      where: { id: assessmentId, status: 'active' },
      include: {
        versions: {
          where: { status: 'published' },
          orderBy: { version: 'desc' },
          take: 1,
          include: {
            items: {
              orderBy: { order: 'asc' },
              include: { questionVersion: true },
            },
          },
        },
      },
    })
    const assessmentVersion = assessment?.versions[0]
    if (!assessment || !assessmentVersion) {
      return reply.code(404).send({ error: 'Published assessment not found' })
    }
    await assertCourseEnrollment(user.id, assessment.courseId)
    const student = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { ageBand: true },
    })
    const agePolicy = await prisma.ageExperiencePolicy.findFirst({
      where: { ageBand: student.ageBand, status: 'published' },
      orderBy: { version: 'desc' },
    })
    const ageExperience = agePolicy
      ? parsePublishedAgePolicy(agePolicy)
      : null
    if (!ageExperience) {
      return reply.code(409).send({
        error: 'Customer-approved age assessment policy is required.',
        reason: 'age_policy_required',
      })
    }
    if (
      assessmentVersion.items.some(
        (item) =>
          item.questionVersion.ageBands.length > 0 &&
          !item.questionVersion.ageBands.includes(student.ageBand),
      )
    ) {
      return reply.code(409).send({
        error: 'Assessment is not configured for this learner age band.',
      })
    }
    const allowedQuestionTypes = new Set(
      ageExperience.assessmentPolicy.allowedQuestionTypes,
    )
    if (
      assessmentVersion.items.some(
        (item) =>
          !allowedQuestionTypes.has(
            item.questionVersion.type as AssessmentQuestionType,
          ),
      )
    ) {
      return reply.code(409).send({
        error: 'This assessment contains a question type disabled for the learner age group.',
        reason: 'age_question_type_denied',
      })
    }
    const excessiveChoices = assessmentVersion.items.find((item) => {
      const prompt =
        item.questionVersion.promptJson &&
        typeof item.questionVersion.promptJson === 'object' &&
        !Array.isArray(item.questionVersion.promptJson)
          ? (item.questionVersion.promptJson as Record<string, unknown>)
          : {}
      const visibleCollections =
        item.questionVersion.type === 'drag_drop'
          ? [prompt.items, prompt.targets]
          : item.questionVersion.type === 'ordering'
            ? [prompt.items]
            : item.questionVersion.type === 'single_choice' ||
                item.questionVersion.type === 'multiple_choice'
              ? [prompt.options]
              : []
      return visibleCollections.some(
        (value) =>
          Array.isArray(value) &&
          value.length > ageExperience.uiPolicy.maxChoicesPerStep,
      )
    })
    if (excessiveChoices) {
      return reply.code(409).send({
        error:
          'This assessment exceeds the configured choices per step for the learner age group.',
        reason: 'age_choice_limit_exceeded',
      })
    }
    const oversizedShortText = assessmentVersion.items.find((item) => {
      if (item.questionVersion.type !== 'short_text') return false
      const prompt =
        item.questionVersion.promptJson &&
        typeof item.questionVersion.promptJson === 'object' &&
        !Array.isArray(item.questionVersion.promptJson)
          ? (item.questionVersion.promptJson as Record<string, unknown>)
          : {}
      return (
        typeof prompt.maxLength === 'number' &&
        prompt.maxLength > ageExperience.assessmentPolicy.maxShortTextLength
      )
    })
    if (oversizedShortText) {
      return reply.code(409).send({
        error: 'Short-text input exceeds the configured limit for this age group.',
        reason: 'age_input_limit_exceeded',
      })
    }
    const prior = await prisma.assessmentAttempt.findMany({
      where: {
        studentId: user.id,
        assessmentVersion: { assessmentId },
        status: { not: 'void' },
      },
      orderBy: { submittedAt: 'desc' },
      select: { submittedAt: true, status: true, id: true },
    })
    const active = prior.find((attempt) => attempt.status === 'in_progress')
    if (active && assessmentVersion.allowResume) {
      const resumable = await prisma.assessmentAttempt.findUniqueOrThrow({
        where: { id: active.id },
        include: attemptInclude,
      })
      return { attempt: learnerAttemptPayload(resumable) }
    }
    const policy = canStartAssessmentAttempt(
      {
        maxAttempts: assessmentVersion.maxAttempts,
        cooldownMinutes: assessmentVersion.cooldownMinutes,
      },
      prior,
    )
    if (!policy.allowed) {
      return reply.code(409).send({
        error:
          policy.reason === 'cooldown'
            ? 'Assessment cooldown is still active.'
            : 'Assessment attempt limit reached.',
        reason: policy.reason,
        retryAt: policy.retryAt,
      })
    }
    const itemIds = assessmentVersion.items.map(
      (item) => item.questionVersionId,
    )
    const itemOrder = assessmentVersion.randomizeQuestions
      ? shuffled(itemIds)
      : itemIds
    const startedAt = new Date()
    let attempt
    try {
      attempt = await prisma.assessmentAttempt.create({
        data: {
          assessmentVersionId: assessmentVersion.id,
          studentId: user.id,
          attemptNumber: prior.length + 1,
          clientAttemptId,
          startedAt,
          expiresAt: new Date(
            startedAt.getTime() + assessmentVersion.durationMinutes * 60 * 1000,
          ),
          itemOrderJson: itemOrder,
        },
        include: attemptInclude,
      })
    } catch (error) {
      if (
        !(
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        )
      ) {
        throw error
      }
      // Two devices may pass the preflight simultaneously. Resolve the unique
      // constraint deterministically instead of exposing a database error.
      const winner = await prisma.assessmentAttempt.findFirst({
        where: {
          studentId: user.id,
          assessmentVersionId: assessmentVersion.id,
          OR: [
            { clientAttemptId },
            ...(assessmentVersion.allowResume
              ? [{ status: 'in_progress' }]
              : []),
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: attemptInclude,
      })
      if (winner) return { attempt: learnerAttemptPayload(winner) }
      return reply.code(409).send({
        error: 'Another assessment attempt started concurrently. Reload and retry.',
        reason: 'concurrent_attempt',
      })
    }
    return reply.code(201).send({ attempt: learnerAttemptPayload(attempt) })
  })

  app.get('/api/assessment-attempts/:attemptId', async (request) => {
    const user = requireRole(request, ['student'])
    const { attemptId } = z
      .object({ attemptId: z.string().uuid() })
      .parse(request.params)
    const attempt = await prisma.assessmentAttempt.findFirst({
      where: { id: attemptId, studentId: user.id },
      include: attemptInclude,
    })
    if (!attempt) throw httpError(404, 'Assessment attempt not found.')
    return { attempt: learnerAttemptPayload(attempt) }
  })

  app.put(
    '/api/assessment-attempts/:attemptId/responses/:questionVersionId',
    async (request, reply) => {
      const user = requireRole(request, ['student'])
      if (!can(user.role, 'assessment:take')) {
        return reply.code(403).send({ error: 'Forbidden' })
      }
      const { attemptId, questionVersionId } = z
        .object({
          attemptId: z.string().uuid(),
          questionVersionId: z.string().uuid(),
        })
        .parse(request.params)
      const body = z
        .object({
          attemptVersion: z.number().int().positive(),
          response: z.record(z.unknown()),
        })
        .parse(request.body)
      const attempt = await prisma.assessmentAttempt.findFirst({
        where: { id: attemptId, studentId: user.id },
        include: {
          assessmentVersion: {
            include: {
              items: {
                where: { questionVersionId },
                include: { questionVersion: true },
              },
            },
          },
        },
      })
      if (!attempt) return reply.code(404).send({ error: 'Attempt not found' })
      if (attempt.status !== 'in_progress') {
        return reply.code(409).send({ error: 'Attempt is no longer editable.' })
      }
      if (attempt.expiresAt.getTime() < Date.now()) {
        return reply.code(409).send({
          error: 'Assessment time has expired.',
          reason: 'attempt_expired',
        })
      }
      const item = attempt.assessmentVersion.items[0]
      if (!item) {
        return reply.code(400).send({ error: 'Question is not in this attempt.' })
      }
      const type = questionTypeSchema.parse(item.questionVersion.type)
      let parsedResponse
      try {
        parsedResponse = parseStudentResponse(
          type,
          item.questionVersion.promptJson,
          body.response,
        )
      } catch (error) {
        return reply.code(400).send({
          error:
            error instanceof Error ? error.message : 'Invalid response contract',
        })
      }
      if ('text' in parsedResponse) {
        const safe = validateChildText(parsedResponse.text, {
          maxLength: studentTextMaxLength(
            type,
            item.questionVersion.promptJson,
          ),
        })
        if (!safe.ok) return reply.code(400).send({ error: safe.message })
      }
      const saved = await prisma.$transaction(async (tx) => {
        const locked = await tx.assessmentAttempt.updateMany({
          where: {
            id: attempt.id,
            studentId: user.id,
            status: 'in_progress',
            version: body.attemptVersion,
          },
          data: { version: { increment: 1 } },
        })
        if (!locked.count) {
          throw httpError(
            409,
            'Attempt changed on another device. Reload before saving.',
          )
        }
        const response = await tx.assessmentResponse.upsert({
          where: {
            attemptId_questionVersionId: {
              attemptId: attempt.id,
              questionVersionId,
            },
          },
          create: {
            attemptId: attempt.id,
            questionVersionId,
            responseJson: parsedResponse as Prisma.InputJsonValue,
          },
          update: {
            responseJson: parsedResponse as Prisma.InputJsonValue,
            autoRatio: null,
            manualRatio: null,
            finalRatio: null,
            version: { increment: 1 },
          },
        })
        if ('sourceType' in parsedResponse) {
          const evidence = await artifactSnapshot(tx, user.id, parsedResponse)
          const serialized = JSON.stringify(evidence.snapshot)
          await tx.artifactSubmission.upsert({
            where: { responseId: response.id },
            create: {
              responseId: response.id,
              studentId: user.id,
              ...evidence.ids,
              snapshotJson: evidence.snapshot as Prisma.InputJsonValue,
              checksum: createHash('sha256').update(serialized).digest('hex'),
            },
            update: {
              projectId: null,
              assetId: null,
              storageObjectId: null,
              ...evidence.ids,
              snapshotJson: evidence.snapshot as Prisma.InputJsonValue,
              checksum: createHash('sha256').update(serialized).digest('hex'),
            },
          })
        }
        return {
          response,
          attemptVersion: body.attemptVersion + 1,
        }
      })
      return { saved }
    },
  )

  app.post(
    '/api/assessment-attempts/:attemptId/submit',
    async (request, reply) => {
      const user = requireRole(request, ['student'])
      const { attemptId } = z
        .object({ attemptId: z.string().uuid() })
        .parse(request.params)
      const body = z
        .object({
          attemptVersion: z.number().int().positive(),
          clientSubmissionId: z.string().uuid(),
        })
        .parse(request.body)
      const current = await prisma.assessmentAttempt.findFirst({
        where: { id: attemptId, studentId: user.id },
        include: {
          assessmentVersion: {
            include: {
              items: {
                include: { questionVersion: true },
              },
            },
          },
          responses: true,
        },
      })
      if (!current) return reply.code(404).send({ error: 'Attempt not found' })
      if (current.clientSubmissionId === body.clientSubmissionId) {
        return {
          attempt: await prisma.assessmentAttempt.findUniqueOrThrow({
            where: { id: current.id },
            include: attemptInclude,
          }).then(learnerAttemptPayload),
        }
      }
      if (current.status !== 'in_progress') {
        return reply.code(409).send({ error: 'Attempt already submitted.' })
      }
      const responseByQuestion = new Map(
        current.responses.map((response) => [
          response.questionVersionId,
          response,
        ]),
      )
      const missingRequired = current.assessmentVersion.items.filter(
        (item) =>
          item.required && !responseByQuestion.has(item.questionVersionId),
      )
      if (missingRequired.length > 0) {
        return reply.code(400).send({
          error: 'Complete every required question before submitting.',
          missingQuestionVersionIds: missingRequired.map(
            (item) => item.questionVersionId,
          ),
        })
      }
      const graded = current.assessmentVersion.items
        .filter((item) => responseByQuestion.has(item.questionVersionId))
        .map((item) => {
          const response = responseByQuestion.get(item.questionVersionId)!
          const contract = parseQuestionAuthoring({
            type: item.questionVersion.type as AssessmentQuestionType,
            prompt: item.questionVersion.promptJson,
            answerKey: item.questionVersion.answerKeyJson,
            rubric: item.questionVersion.rubricJson,
          })
          const result = gradeObjectiveResponse(
            contract.answerKey,
            response.responseJson as never,
          )
          return { item, response, result }
        })
      const summary = summarizeAssessmentScore(
        graded.map(({ item, result }) => ({
          points: item.points,
          ratio: result.ratio,
        })),
      )
      const submitted = await prisma.$transaction(async (tx) => {
        const locked = await tx.assessmentAttempt.updateMany({
          where: {
            id: current.id,
            studentId: user.id,
            status: 'in_progress',
            version: body.attemptVersion,
          },
          data: {
            status: summary.pendingManualReview ? 'pending_review' : 'graded',
            clientSubmissionId: body.clientSubmissionId,
            submittedAt: new Date(),
            gradedAt: summary.pendingManualReview ? null : new Date(),
            earnedPoints: summary.earnedPoints,
            possiblePoints: summary.possiblePoints,
            scorePercent: summary.scorePercent,
            passed:
              !summary.pendingManualReview &&
              summary.scorePercent >= current.assessmentVersion.passScore,
            version: { increment: 1 },
          },
        })
        if (!locked.count) {
          throw httpError(
            409,
            'Attempt changed on another device. Reload before submitting.',
          )
        }
        for (const row of graded) {
          await tx.assessmentResponse.update({
            where: { id: row.response.id },
            data: {
              autoRatio: row.result.ratio,
              finalRatio: row.result.ratio,
            },
          })
          if (row.result.status === 'manual_review') {
            await tx.assessmentReview.upsert({
              where: { responseId: row.response.id },
              create: { responseId: row.response.id },
              update: {
                status: 'pending',
                reviewerId: null,
                reviewedAt: null,
                publishedAt: null,
              },
            })
          }
        }
        return tx.assessmentAttempt.findUniqueOrThrow({
          where: { id: current.id },
          include: attemptInclude,
        })
      })
      return { attempt: learnerAttemptPayload(submitted) }
    },
  )
}
