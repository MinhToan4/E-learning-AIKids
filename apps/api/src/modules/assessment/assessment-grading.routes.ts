import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  can,
  parentOwnsChild,
  summarizeAssessmentScore,
} from '@aikids/domain'
import { Prisma } from '../../generated/prisma/index.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import {
  requireRole,
  requireUser,
  type AuthUser,
} from '../../infrastructure/session/session.js'
import { publicQuestion } from './assessment-contract.js'
import {
  issueEligibleCredentials,
  recordPublishedAssessmentEvidence,
} from '../competency/competency.service.js'

function httpError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode })
}

async function teacherClassIds(user: AuthUser): Promise<string[] | null> {
  if (user.role === 'admin') return null
  const classrooms = await prisma.classRoom.findMany({
    where: { teacherId: user.id },
    select: { id: true },
  })
  return classrooms.map((classroom) => classroom.id)
}

async function assertTeacherCanReview(
  request: FastifyRequest,
  user: AuthUser,
  student: { id: string },
) {
  if (user.role === 'admin') return
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
      { actorId: user.id, studentId: student.id },
      'assessment.review_scope forbidden',
    )
    throw httpError(403, 'Learner is not in your class.')
  }
}

function parseRubric(value: Prisma.JsonValue) {
  return z
    .object({
      criteria: z.array(
        z.object({
          id: z.string().min(1).max(80),
          label: z.string().min(1).max(200),
          maxPoints: z.number().positive().max(100),
        }),
      ),
    })
    .parse(value)
}

function gradeRubric(
  rubricValue: Prisma.JsonValue,
  scores: Record<string, number>,
) {
  const rubric = parseRubric(rubricValue)
  const expectedIds = new Set(rubric.criteria.map((criterion) => criterion.id))
  if (
    Object.keys(scores).length !== expectedIds.size ||
    Object.keys(scores).some((id) => !expectedIds.has(id))
  ) {
    throw httpError(400, 'Provide one score for every rubric criterion.')
  }
  let earned = 0
  let possible = 0
  rubric.criteria.forEach((criterion) => {
    const score = scores[criterion.id]
    if (score === undefined || score < 0 || score > criterion.maxPoints) {
      throw httpError(400, `Invalid rubric score: ${criterion.id}`)
    }
    earned += score
    possible += criterion.maxPoints
  })
  return {
    ratio: possible > 0 ? earned / possible : 0,
    rubric,
  }
}

async function recalculateAttempt(
  tx: Prisma.TransactionClient,
  attemptId: string,
) {
  const attempt = await tx.assessmentAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: {
      assessmentVersion: { include: { items: true } },
      responses: { include: { review: true } },
    },
  })
  const responseByQuestion = new Map(
    attempt.responses.map((response) => [
      response.questionVersionId,
      response,
    ]),
  )
  const rows = attempt.assessmentVersion.items
    .filter((item) => responseByQuestion.has(item.questionVersionId))
    .map((item) => ({
      points: item.points,
      ratio:
        responseByQuestion.get(item.questionVersionId)?.finalRatio ?? null,
    }))
  const summary = summarizeAssessmentScore(rows)
  const pending = attempt.responses.some(
    (response) =>
      response.review &&
      !['reviewed', 'published'].includes(response.review.status),
  )
  return tx.assessmentAttempt.update({
    where: { id: attempt.id },
    data: {
      status: pending || summary.pendingManualReview ? 'pending_review' : 'graded',
      earnedPoints: summary.earnedPoints,
      possiblePoints: summary.possiblePoints,
      scorePercent: summary.scorePercent,
      passed:
        !pending &&
        !summary.pendingManualReview &&
        summary.scorePercent >= attempt.assessmentVersion.passScore,
      gradedAt: !pending && !summary.pendingManualReview ? new Date() : null,
      version: { increment: 1 },
    },
  })
}

export async function assessmentGradingRoutes(app: FastifyInstance) {
  app.get('/api/teacher/grading/queue', async (request) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'grading:read')) throw httpError(403, 'Forbidden')
    const query = z
      .object({
        status: z
          .enum(['pending', 'in_review', 'reviewed', 'published'])
          .optional(),
        assessmentId: z.string().uuid().optional(),
        limit: z.coerce.number().int().min(1).max(100).default(50),
      })
      .parse(request.query)
    const classIds = await teacherClassIds(user)
    const reviews = await prisma.assessmentReview.findMany({
      where: {
        status: query.status ?? { in: ['pending', 'in_review', 'reviewed'] },
        response: {
          attempt: {
            assessmentVersion: {
              assessmentId: query.assessmentId,
            },
            student:
              classIds === null
                ? undefined
                : {
                    classMemberships: {
                      some: { classId: { in: classIds }, status: 'active' },
                    },
                  },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: query.limit,
      include: {
        response: {
          include: {
            artifact: true,
            questionVersion: true,
            attempt: {
              include: {
                student: {
                  select: {
                    id: true,
                    nickname: true,
                    avatarId: true,
                  },
                },
                assessmentVersion: {
                  include: {
                    assessment: {
                      select: { id: true, title: true, courseId: true },
                    },
                    items: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    return {
      reviews: reviews.map((review) => ({
        id: review.id,
        status: review.status,
        version: review.version,
        reviewerId: review.reviewerId,
        rubricScores: review.rubricScoresJson,
        feedback: review.feedback,
        aiDraft: review.aiDraftJson,
        createdAt: review.createdAt,
        student: review.response.attempt.student,
        assessment: review.response.attempt.assessmentVersion.assessment,
        attemptId: review.response.attemptId,
        attemptNumber: review.response.attempt.attemptNumber,
        maxAttempts:
          review.response.attempt.assessmentVersion.maxAttempts,
        points:
          review.response.attempt.assessmentVersion.items.find(
            (item) =>
              item.questionVersionId === review.response.questionVersionId,
          )?.points ?? 0,
        question: {
          ...publicQuestion(review.response.questionVersion),
          rubric: review.response.questionVersion.rubricJson,
        },
        response: review.response.responseJson,
        artifact: review.response.artifact,
      })),
    }
  })

  app.patch('/api/teacher/grading/reviews/:reviewId', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'grading:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { reviewId } = z
      .object({ reviewId: z.string().uuid() })
      .parse(request.params)
    const body = z
      .object({
        version: z.number().int().positive(),
        rubricScores: z.record(z.string(), z.number().min(0).max(100)),
        feedback: z.string().trim().min(2).max(2_000),
      })
      .parse(request.body)
    const review = await prisma.assessmentReview.findUnique({
      where: { id: reviewId },
      include: {
        response: {
          include: {
            questionVersion: true,
            attempt: {
              include: {
                student: { select: { id: true } },
              },
            },
          },
        },
      },
    })
    if (!review) return reply.code(404).send({ error: 'Review not found' })
    await assertTeacherCanReview(request, user, review.response.attempt.student)
    if (review.status === 'published') {
      return reply.code(409).send({ error: 'Published feedback is immutable.' })
    }
    const rubricGrade = gradeRubric(
      review.response.questionVersion.rubricJson,
      body.rubricScores,
    )
    const updated = await prisma.$transaction(async (tx) => {
      const locked = await tx.assessmentReview.updateMany({
        where: {
          id: review.id,
          version: body.version,
          status: { not: 'published' },
        },
        data: {
          status: 'reviewed',
          reviewerId: user.id,
          rubricScoresJson: body.rubricScores,
          feedback: body.feedback,
          reviewedAt: new Date(),
          version: { increment: 1 },
        },
      })
      if (!locked.count) {
        throw httpError(
          409,
          'Review changed on another device. Reload before saving.',
        )
      }
      await tx.assessmentResponse.update({
        where: { id: review.response.id },
        data: {
          manualRatio: rubricGrade.ratio,
          finalRatio: rubricGrade.ratio,
          version: { increment: 1 },
        },
      })
      const attempt = await recalculateAttempt(tx, review.response.attemptId)
      return {
        review: await tx.assessmentReview.findUniqueOrThrow({
          where: { id: review.id },
        }),
        attempt,
      }
    })
    return updated
  })

  app.post(
    '/api/teacher/grading/attempts/:attemptId/request-resubmission',
    async (request, reply) => {
      const user = requireRole(request, ['teacher', 'admin'])
      if (!can(user.role, 'grading:write')) {
        return reply.code(403).send({ error: 'Forbidden' })
      }
      const { attemptId } = z
        .object({ attemptId: z.string().uuid() })
        .parse(request.params)
      const { reason } = z
        .object({ reason: z.string().trim().min(5).max(2_000) })
        .parse(request.body)
      const attempt = await prisma.assessmentAttempt.findUnique({
        where: { id: attemptId },
        include: {
          student: { select: { id: true } },
          assessmentVersion: {
            include: { assessment: { select: { id: true, title: true } } },
          },
        },
      })
      if (!attempt) return reply.code(404).send({ error: 'Attempt not found' })
      await assertTeacherCanReview(request, user, attempt.student)
      if (!['pending_review', 'graded'].includes(attempt.status)) {
        return reply.code(409).send({
          error: 'Only a submitted, unpublished attempt can be returned.',
        })
      }
      const attemptCount = await prisma.assessmentAttempt.count({
        where: {
          studentId: attempt.studentId,
          assessmentVersion: {
            assessmentId: attempt.assessmentVersion.assessment.id,
          },
          status: { not: 'void' },
        },
      })
      if (attemptCount >= attempt.assessmentVersion.maxAttempts) {
        return reply.code(409).send({
          error: 'The published assessment policy has no resubmission attempt left.',
        })
      }
      const updated = await prisma.$transaction(async (tx) => {
        const locked = await tx.assessmentAttempt.updateMany({
          where: {
            id: attempt.id,
            version: attempt.version,
            status: { in: ['pending_review', 'graded'] },
          },
          data: { status: 'revision_requested', version: { increment: 1 } },
        })
        if (!locked.count) {
          throw httpError(409, 'Attempt changed on another device.')
        }
        await tx.assessmentReview.updateMany({
          where: { response: { attemptId: attempt.id } },
          data: {
            status: 'resubmission_requested',
            reviewerId: user.id,
            feedback: reason,
            reviewedAt: new Date(),
            version: { increment: 1 },
          },
        })
        await tx.notification.create({
          data: {
            userId: attempt.studentId,
            type: 'assessment_resubmission',
            title: 'Giáo viên đề nghị con nộp lại bài',
            body: `${attempt.assessmentVersion.assessment.title}: ${reason}`,
            data: JSON.stringify({
              assessmentId: attempt.assessmentVersion.assessment.id,
              previousAttemptId: attempt.id,
            }),
          },
        })
        await tx.auditEvent.create({
          data: {
            actorId: user.id,
            action: 'assessment.resubmission_requested',
            targetType: 'assessment_attempt',
            targetId: attempt.id,
            reason,
            beforeJson: { status: attempt.status, version: attempt.version },
            afterJson: {
              status: 'revision_requested',
              nextAttemptNumber: attemptCount + 1,
            },
            requestId: request.id,
            ipAddress: request.ip,
          },
        })
        return tx.assessmentAttempt.findUniqueOrThrow({
          where: { id: attempt.id },
        })
      })
      return { attempt: updated }
    },
  )

  app.post(
    '/api/teacher/grading/attempts/:attemptId/publish',
    async (request, reply) => {
      const user = requireRole(request, ['teacher', 'admin'])
      if (!can(user.role, 'grading:publish')) {
        return reply.code(403).send({ error: 'Forbidden' })
      }
      const { attemptId } = z
        .object({ attemptId: z.string().uuid() })
        .parse(request.params)
      const { reason } = z
        .object({ reason: z.string().min(5).max(500) })
        .parse(request.body)
      const attempt = await prisma.assessmentAttempt.findUnique({
        where: { id: attemptId },
        include: {
          student: { select: { id: true } },
          responses: { include: { review: true } },
        },
      })
      if (!attempt) return reply.code(404).send({ error: 'Attempt not found' })
      await assertTeacherCanReview(request, user, attempt.student)
      if (attempt.status === 'published') return { attempt }
      if (attempt.status !== 'graded') {
        return reply.code(409).send({
          error: 'Finish every manual review before publishing.',
        })
      }
      if (
        attempt.responses.some(
          (response) =>
            response.review && response.review.status !== 'reviewed',
        )
      ) {
        return reply.code(409).send({
          error: 'Finish every manual review before publishing.',
        })
      }
      const published = await prisma.$transaction(async (tx) => {
        const publishedAt = new Date()
        await tx.assessmentReview.updateMany({
          where: {
            response: { attemptId: attempt.id },
            status: 'reviewed',
          },
          data: { status: 'published', publishedAt },
        })
        const row = await tx.assessmentAttempt.update({
          where: { id: attempt.id },
          data: {
            status: 'published',
            publishedAt,
            version: { increment: 1 },
          },
          include: {
            assessmentVersion: {
              select: {
                assessment: { select: { courseId: true } },
              },
            },
          },
        })
        await recordPublishedAssessmentEvidence(tx, row.id)
        const credentials = await issueEligibleCredentials(
          tx,
          row.studentId,
          row.assessmentVersion.assessment.courseId,
          user.id,
        )
        await tx.auditEvent.create({
          data: {
            actorId: user.id,
            action: 'assessment.grade_published',
            targetType: 'assessment_attempt',
            targetId: attempt.id,
            reason,
            afterJson: {
              scorePercent: row.scorePercent,
              passed: row.passed,
              publishedAt: publishedAt.toISOString(),
              credentialIds: credentials.map((credential) => credential.id),
            },
            requestId: request.id,
            ipAddress: request.ip,
          },
        })
        return { row, credentials }
      })
      return { attempt: published.row, credentials: published.credentials }
    },
  )

  app.get('/api/assessment-attempts/:attemptId/result', async (request) => {
    const user = requireUser(request)
    if (!can(user.role, 'assessment:read')) throw httpError(403, 'Forbidden')
    const { attemptId } = z
      .object({ attemptId: z.string().uuid() })
      .parse(request.params)
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        student: { select: { id: true, nickname: true, parentId: true, classId: true } },
        assessmentVersion: {
          include: { assessment: true, items: true },
        },
        responses: {
          include: {
            questionVersion: true,
            review: true,
            artifact: true,
          },
        },
      },
    })
    if (!attempt) throw httpError(404, 'Attempt not found.')
    if (
      user.role === 'student' &&
      user.id !== attempt.studentId
    ) {
      throw httpError(403, 'Forbidden')
    }
    if (
      user.role === 'parent' &&
      !parentOwnsChild(user.id, attempt.student.parentId)
    ) {
      throw httpError(403, 'Forbidden')
    }
    if (user.role === 'teacher') {
      await assertTeacherCanReview(request, user, attempt.student)
    }
    if (
      ['student', 'parent'].includes(user.role) &&
      attempt.status !== 'published'
    ) {
      throw httpError(409, 'Result has not been published.')
    }
    const itemByQuestion = new Map(
      attempt.assessmentVersion.items.map((item) => [
        item.questionVersionId,
        item,
      ]),
    )
    return {
      result: {
        id: attempt.id,
        status: attempt.status,
        student: attempt.student,
        assessment: attempt.assessmentVersion.assessment,
        attemptNumber: attempt.attemptNumber,
        submittedAt: attempt.submittedAt,
        gradedAt: attempt.gradedAt,
        publishedAt: attempt.publishedAt,
        earnedPoints: attempt.earnedPoints,
        possiblePoints: attempt.possiblePoints,
        scorePercent: attempt.scorePercent,
        passed: attempt.passed,
        responses: attempt.responses.map((response) => ({
          question: publicQuestion(response.questionVersion),
          points:
            itemByQuestion.get(response.questionVersionId)?.points ?? 0,
          response: response.responseJson,
          ratio: response.finalRatio,
          rubric: response.questionVersion.rubricJson,
          feedback: response.review?.feedback ?? null,
          artifact: response.artifact,
        })),
      },
    }
  })
}
