import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  can,
  parentOwnsChild,
} from '@aikids/domain'
import { Prisma } from '../../generated/prisma/index.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import {
  requireRole,
  requireUser,
  type AuthUser,
} from '../../infrastructure/session/session.js'
import { issueEligibleCredentials } from './competency.service.js'
import { generateCredentialPdf } from './credential-pdf.service.js'
import { parsePublishedAgePolicy } from '../learning/age-policy.js'

const competencyLevelSchema = z.enum([
  'no_data',
  'not_met',
  'developing',
  'achieved',
])
const credentialLayoutSchema = z.object({
  title: z.string().min(2).max(200),
  issuerName: z.string().min(2).max(200),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  backgroundUrl: z.string().url().max(2_000).nullable().optional(),
  bodyTemplate: z.string().min(10).max(2_000),
  allowDownload: z.boolean(),
  allowShare: z.boolean(),
  publicDisplayName: z.boolean(),
})

function httpError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode })
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
      avatarId: true,
      parentId: true,
    },
  })
  if (!student) throw httpError(404, 'Learner not found.')
  if (
    user.role === 'parent' &&
    !parentOwnsChild(user.id, student.parentId)
  ) {
    throw httpError(403, 'Forbidden')
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
        'credential.student_scope forbidden',
      )
      throw httpError(403, 'Forbidden')
    }
  }
  if (user.role === 'student' && user.id !== studentId) {
    throw httpError(403, 'Forbidden')
  }
  return student
}

export async function credentialRoutes(app: FastifyInstance) {
  app.get('/api/admin/credential-config', async (request) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'credential:write')) throw httpError(403, 'Forbidden')
    const [templates, rules, issued] = await prisma.$transaction([
      prisma.credentialTemplate.findMany({
        orderBy: [{ code: 'asc' }, { version: 'desc' }],
      }),
      prisma.credentialRule.findMany({
        orderBy: [{ courseId: 'asc' }, { kind: 'asc' }, { version: 'desc' }],
        include: { template: true },
      }),
      prisma.issuedCredential.findMany({
        orderBy: { issuedAt: 'desc' },
        take: 200,
        select: {
          id: true,
          kind: true,
          status: true,
          verificationCode: true,
          issuedAt: true,
          revokedAt: true,
          revokeReason: true,
          supersedesCredentialId: true,
          student: { select: { id: true, nickname: true } },
          course: { select: { id: true, title: true } },
          template: { select: { id: true, name: true, version: true } },
        },
      }),
    ])
    return { templates, rules, issued }
  })

  app.post('/api/admin/credential-templates', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'credential:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        code: z
          .string()
          .min(2)
          .max(80)
          .regex(/^[A-Za-z0-9._-]+$/),
        kind: z.enum(['certificate', 'badge']),
        name: z.string().min(2).max(200),
        layout: credentialLayoutSchema,
        status: z.enum(['draft', 'published']).default('draft'),
        reason: z.string().min(5).max(500),
      })
      .superRefine((value, context) => {
        if (
          value.kind === 'badge' &&
          value.status === 'published' &&
          !value.layout.backgroundUrl
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['layout', 'backgroundUrl'],
            message: 'Published badges require a customer-approved image URL.',
          })
        }
      })
      .parse(request.body)
    const latest = await prisma.credentialTemplate.findFirst({
      where: { code: body.code },
      orderBy: { version: 'desc' },
    })
    const template = await prisma.$transaction(async (tx) => {
      if (body.status === 'published') {
        await tx.credentialTemplate.updateMany({
          where: { code: body.code, status: 'published' },
          data: { status: 'archived' },
        })
      }
      const row = await tx.credentialTemplate.create({
        data: {
          code: body.code,
          version: (latest?.version ?? 0) + 1,
          kind: body.kind,
          name: body.name,
          layoutJson: body.layout,
          status: body.status,
          createdById: user.id,
          publishedAt: body.status === 'published' ? new Date() : null,
        },
      })
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'credential.template_version_created',
          targetType: 'credential_template',
          targetId: row.id,
          reason: body.reason,
          afterJson: {
            code: row.code,
            version: row.version,
            kind: row.kind,
            status: row.status,
          },
          requestId: request.id,
          ipAddress: request.ip,
        },
      })
      return row
    })
    return reply.code(201).send({ template })
  })

  app.post('/api/admin/credential-rules', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'credential:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        courseId: z.string().min(1).max(120),
        templateId: z.string().uuid(),
        kind: z.enum(['certificate', 'badge']),
        minCompletionPercent: z.number().int().min(0).max(100),
        requirePassedAssessment: z.boolean(),
        requiredSkillLevels: z.record(z.string().uuid(), competencyLevelSchema),
        status: z.enum(['draft', 'published']).default('draft'),
        reason: z.string().min(5).max(500),
      })
      .parse(request.body)
    const [course, template, skillCount, latest] = await Promise.all([
      prisma.course.findUnique({ where: { id: body.courseId } }),
      prisma.credentialTemplate.findUnique({
        where: { id: body.templateId },
      }),
      prisma.competencySkill.count({
        where: { id: { in: Object.keys(body.requiredSkillLevels) } },
      }),
      prisma.credentialRule.findFirst({
        where: { courseId: body.courseId, kind: body.kind },
        orderBy: { version: 'desc' },
      }),
    ])
    if (!course) return reply.code(404).send({ error: 'Course not found' })
    if (!template || template.kind !== body.kind) {
      return reply.code(400).send({ error: 'Credential template mismatch.' })
    }
    if (body.status === 'published' && template.status !== 'published') {
      return reply.code(409).send({
        error: 'Publish the credential template before the rule.',
      })
    }
    if (body.kind === 'certificate' && body.minCompletionPercent !== 100) {
      return reply.code(400).send({
        error: 'Completion certificates require 100% course completion.',
      })
    }
    if (skillCount !== Object.keys(body.requiredSkillLevels).length) {
      return reply.code(400).send({ error: 'Unknown competency skill.' })
    }
    const rule = await prisma.$transaction(async (tx) => {
      if (body.status === 'published') {
        await tx.credentialRule.updateMany({
          where: {
            courseId: body.courseId,
            kind: body.kind,
            status: 'published',
          },
          data: { status: 'archived' },
        })
      }
      const row = await tx.credentialRule.create({
        data: {
          courseId: body.courseId,
          templateId: body.templateId,
          kind: body.kind,
          version: (latest?.version ?? 0) + 1,
          minCompletionPercent: body.minCompletionPercent,
          requirePassedAssessment: body.requirePassedAssessment,
          requiredSkillLevelsJson:
            body.requiredSkillLevels as Prisma.InputJsonValue,
          status: body.status,
          createdById: user.id,
          publishedAt: body.status === 'published' ? new Date() : null,
        },
      })
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'credential.rule_version_created',
          targetType: 'credential_rule',
          targetId: row.id,
          reason: body.reason,
          afterJson: {
            courseId: row.courseId,
            kind: row.kind,
            version: row.version,
            status: row.status,
          },
          requestId: request.id,
          ipAddress: request.ip,
        },
      })
      return row
    })
    return reply.code(201).send({ rule })
  })

  app.post('/api/credentials/issue', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'credential:issue')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        studentId: z.string().uuid(),
        courseId: z.string().min(1).max(120),
        reason: z.string().min(5).max(500),
      })
      .parse(request.body)
    await assertStudentScope(request, user, body.studentId)
    const credentials = await serializable(() =>
      prisma.$transaction(
        async (tx) => {
          const rows = await issueEligibleCredentials(
            tx,
            body.studentId,
            body.courseId,
            user.id,
          )
          await tx.auditEvent.create({
            data: {
              actorId: user.id,
              action: 'credential.eligibility_evaluated',
              targetType: 'student_course',
              targetId: `${body.studentId}:${body.courseId}`,
              reason: body.reason,
              afterJson: { credentialIds: rows.map((row) => row.id) },
              requestId: request.id,
              ipAddress: request.ip,
            },
          })
          return rows
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      ),
    )
    return reply.code(credentials.length > 0 ? 201 : 200).send({
      credentials,
      eligible: credentials.length > 0,
    })
  })

  app.get('/api/credentials', async (request) => {
    const user = requireUser(request)
    if (!can(user.role, 'credential:read')) throw httpError(403, 'Forbidden')
    const { studentId } =
      user.role === 'student'
        ? { studentId: user.id }
        : z
            .object({ studentId: z.string().uuid() })
            .parse(request.query)
    const student = await assertStudentScope(request, user, studentId)
    const credentials = await prisma.issuedCredential.findMany({
      where: { studentId },
      orderBy: { issuedAt: 'desc' },
      include: {
        course: {
          select: { id: true, title: true, shortTitle: true, coverImage: true },
        },
        template: {
          select: {
            id: true,
            code: true,
            version: true,
            name: true,
            layoutJson: true,
          },
        },
      },
    })
    return { student, credentials }
  })

  app.get('/api/credentials/:credentialId/pdf', async (request, reply) => {
    const user = requireUser(request)
    if (!can(user.role, 'credential:read')) throw httpError(403, 'Forbidden')
    const { credentialId } = z
      .object({ credentialId: z.string().uuid() })
      .parse(request.params)
    const credential = await prisma.issuedCredential.findUnique({
      where: { id: credentialId },
      include: {
        course: true,
        student: { select: { id: true } },
        template: true,
      },
    })
    if (!credential) return reply.code(404).send({ error: 'Credential not found' })
    await assertStudentScope(request, user, credential.studentId)
    if (credential.status !== 'issued') {
      return reply.code(409).send({ error: 'Credential is no longer valid.' })
    }
    if (credential.kind !== 'certificate') {
      return reply.code(400).send({ error: 'Only certificates have a PDF document.' })
    }
    const layout = credentialLayoutSchema.parse(credential.template.layoutJson)
    if (!layout.allowDownload) {
      return reply.code(403).send({
        error: 'Certificate download is disabled by the published template.',
      })
    }
    const payload =
      credential.payloadJson &&
      typeof credential.payloadJson === 'object' &&
      !Array.isArray(credential.payloadJson)
        ? (credential.payloadJson as Record<string, unknown>)
        : {}
    const pdf = await generateCredentialPdf(
      payload,
      credential.verificationCode,
      layout,
    )
    return reply
      .header('Cache-Control', 'private, no-store')
      .header('Content-Type', 'application/pdf')
      .header(
        'Content-Disposition',
        `attachment; filename="certificate-${credential.id}.pdf"`,
      )
      .send(pdf)
  })

  app.get('/api/public/credentials/:verificationCode', async (request, reply) => {
    const { verificationCode } = z
      .object({
        verificationCode: z.string().length(32).regex(/^[a-f0-9]+$/),
      })
      .parse(request.params)
    const credential = await prisma.issuedCredential.findUnique({
      where: { verificationCode },
      include: {
        course: { select: { title: true } },
        template: { select: { name: true, kind: true, layoutJson: true } },
        student: { select: { ageBand: true } },
      },
    })
    if (!credential) {
      return reply.code(404).send({ valid: false, status: 'not_found' })
    }
    const layout = credentialLayoutSchema.parse(credential.template.layoutJson)
    const agePolicy = await prisma.ageExperiencePolicy.findFirst({
      where: {
        ageBand: credential.student.ageBand,
        status: 'published',
      },
      orderBy: { version: 'desc' },
    })
    const ageExperience = agePolicy
      ? parsePublishedAgePolicy(agePolicy)
      : null
    if (
      !layout.allowShare ||
      !ageExperience?.permissionPolicy.canShareCredentials
    ) {
      return reply.code(403).send({
        valid: false,
        status: 'sharing_disabled',
      })
    }
    const payload =
      credential.payloadJson &&
      typeof credential.payloadJson === 'object' &&
      !Array.isArray(credential.payloadJson)
        ? (credential.payloadJson as Record<string, unknown>)
        : {}
    const learner =
      payload.learner &&
      typeof payload.learner === 'object' &&
      !Array.isArray(payload.learner)
        ? (payload.learner as Record<string, unknown>)
        : {}
    return {
      valid: credential.status === 'issued',
      status: credential.status,
      credential: {
        kind: credential.kind,
        templateName: credential.template.name,
        learnerNickname:
          layout.publicDisplayName && typeof learner.nickname === 'string'
            ? learner.nickname
            : null,
        courseTitle: credential.course.title,
        issuedAt: credential.issuedAt,
        revokedAt: credential.revokedAt,
      },
    }
  })

  app.post(
    '/api/admin/credentials/:credentialId/revoke',
    async (request, reply) => {
      const user = requireRole(request, ['admin'])
      if (!can(user.role, 'credential:revoke')) {
        return reply.code(403).send({ error: 'Forbidden' })
      }
      const { credentialId } = z
        .object({ credentialId: z.string().uuid() })
        .parse(request.params)
      const { reason } = z
        .object({ reason: z.string().min(5).max(500) })
        .parse(request.body)
      const existing = await prisma.issuedCredential.findUnique({
        where: { id: credentialId },
      })
      if (!existing) {
        return reply.code(404).send({ error: 'Credential not found' })
      }
      if (existing.status === 'revoked') return { credential: existing }
      const credential = await prisma.$transaction(async (tx) => {
        const changed = await tx.issuedCredential.updateMany({
          where: { id: credentialId, status: 'issued' },
          data: {
            status: 'revoked',
            revokedById: user.id,
            revokedAt: new Date(),
            revokeReason: reason,
          },
        })
        if (!changed.count) {
          return tx.issuedCredential.findUniqueOrThrow({
            where: { id: credentialId },
          })
        }
        const row = await tx.issuedCredential.findUniqueOrThrow({
          where: { id: credentialId },
        })
        await tx.auditEvent.create({
          data: {
            actorId: user.id,
            action: 'credential.revoked',
            targetType: 'issued_credential',
            targetId: row.id,
            reason,
            beforeJson: { status: existing.status },
            afterJson: { status: row.status, revokedAt: row.revokedAt?.toISOString() },
            requestId: request.id,
            ipAddress: request.ip,
          },
        })
        return row
      })
      return { credential }
    },
  )
}
