import { createHash } from 'node:crypto'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { can, parentOwnsChild } from '@aikids/domain'
import { Prisma } from '../../generated/prisma/index.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import { emailService } from '../../infrastructure/email/email.service.js'
import {
  requireRole,
  requireUser,
  type AuthUser,
} from '../../infrastructure/session/session.js'
import { enqueueNotificationPush } from '../notification/push.queue.js'
import {
  findMissingReportSections,
  reportSectionSchema,
} from './report-contract.js'
import { generateLearningReportPdf } from './report-pdf.service.js'
import { buildLearningReportSnapshot } from './report-snapshot.service.js'

const deliveryChannelSchema = z.enum(['in_app', 'push', 'email', 'zalo'])
const reportStatusSchema = z.enum([
  'draft',
  'review',
  'approved',
  'published',
  'cancelled',
])
const layoutSchema = z.object({
  title: z.string().trim().min(2).max(200),
  issuerName: z.string().trim().min(2).max(200),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  footerText: z.string().trim().min(2).max(300),
  showScores: z.boolean(),
  sectionLabels: z.record(z.string().min(1).max(80)).optional(),
})

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

function validTimeZone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat('vi-VN', { timeZone: timezone }).format()
    return true
  } catch {
    return false
  }
}

function maskEmail(email: string | null): string | null {
  if (!email) return null
  const [local, domain] = email.split('@')
  if (!local || !domain) return null
  return `${local.slice(0, 1)}***@${domain}`
}

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue
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
      email: true,
      parentId: true,
      classMemberships: {
        where: { status: 'active' },
        select: { classroom: { select: { teacherId: true } } },
      },
    },
  })
  if (!student) throw httpError(404, 'Learner not found.')
  const allowed =
    user.role === 'admin' ||
    (user.role === 'student' && user.id === student.id) ||
    (user.role === 'parent' && parentOwnsChild(user.id, student.parentId)) ||
    (user.role === 'teacher' &&
      student.classMemberships.some(
        ({ classroom }) => classroom.teacherId === user.id,
      ))
  if (!allowed) {
    request.log.warn(
      { actorId: user.id, role: user.role, studentId },
      'report.student_scope forbidden',
    )
    throw httpError(403, 'Forbidden')
  }
  return student
}

async function getScopedReport(
  request: FastifyRequest,
  user: AuthUser,
  reportId: string,
) {
  const report = await prisma.learningReport.findUnique({
    where: { id: reportId },
    include: {
      student: {
        select: {
          id: true,
          nickname: true,
          email: true,
          parentId: true,
          classMemberships: {
            where: { status: 'active' },
            select: { classroom: { select: { teacherId: true } } },
          },
        },
      },
      template: true,
      policy: true,
      approvedBy: { select: { id: true, nickname: true } },
      deliveries: {
        select: {
          id: true,
          channel: true,
          status: true,
          attempts: true,
          destinationMasked: true,
          providerMessageId: true,
          lastError: true,
          sentAt: true,
          updatedAt: true,
        },
      },
    },
  })
  if (!report) throw httpError(404, 'Report not found.')
  const visible =
    user.role === 'admin' ||
    (user.role === 'student' &&
      user.id === report.studentId &&
      report.status === 'published') ||
    (user.role === 'parent' &&
      parentOwnsChild(user.id, report.student.parentId) &&
      report.status === 'published') ||
    (user.role === 'teacher' &&
      report.student.classMemberships.some(
        ({ classroom }) => classroom.teacherId === user.id,
      ))
  if (!visible) {
    request.log.warn(
      { actorId: user.id, role: user.role, reportId },
      'report.scope forbidden',
    )
    throw httpError(403, 'Forbidden')
  }
  return report
}

export async function reportRoutes(app: FastifyInstance) {
  app.get('/api/report-policies/active', async (request) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'report:write')) throw httpError(403, 'Forbidden')
    const policies = await prisma.reportPolicy.findMany({
      where: { status: 'published', template: { status: 'published' } },
      orderBy: [{ code: 'asc' }, { version: 'desc' }],
      select: {
        id: true,
        code: true,
        version: true,
        periodDays: true,
        timezone: true,
        requireApproval: true,
        deliveryChannels: true,
        template: { select: { name: true, requiredSections: true } },
      },
    })
    return { policies }
  })

  app.get('/api/admin/report-config', async (request) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'report-config:write')) {
      throw httpError(403, 'Forbidden')
    }
    const [templates, policies] = await prisma.$transaction([
      prisma.reportTemplate.findMany({
        orderBy: [{ code: 'asc' }, { version: 'desc' }],
      }),
      prisma.reportPolicy.findMany({
        orderBy: [{ code: 'asc' }, { version: 'desc' }],
        include: { template: true },
      }),
    ])
    return { templates, policies }
  })

  app.post('/api/admin/report-templates', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'report-config:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        code: z
          .string()
          .trim()
          .min(2)
          .max(80)
          .regex(/^[A-Za-z0-9._-]+$/),
        name: z.string().trim().min(2).max(200),
        layout: layoutSchema,
        requiredSections: z
          .array(reportSectionSchema)
          .min(1)
          .max(10)
          .transform((values) => [...new Set(values)]),
        status: z.enum(['draft', 'published']).default('draft'),
        reason: z.string().trim().min(5).max(500),
      })
      .parse(request.body)
    const latest = await prisma.reportTemplate.findFirst({
      where: { code: body.code },
      orderBy: { version: 'desc' },
    })
    const template = await prisma.$transaction(async (tx) => {
      if (body.status === 'published') {
        await tx.reportTemplate.updateMany({
          where: { code: body.code, status: 'published' },
          data: { status: 'archived' },
        })
      }
      const row = await tx.reportTemplate.create({
        data: {
          code: body.code,
          version: (latest?.version ?? 0) + 1,
          name: body.name,
          layoutJson: json(body.layout),
          requiredSections: body.requiredSections,
          status: body.status,
          createdById: user.id,
          publishedAt: body.status === 'published' ? new Date() : null,
        },
      })
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'report.template_version_created',
          targetType: 'report_template',
          targetId: row.id,
          reason: body.reason,
          afterJson: json({
            code: row.code,
            version: row.version,
            status: row.status,
            requiredSections: row.requiredSections,
          }),
          requestId: request.id,
          ipAddress: request.ip,
        },
      })
      return row
    })
    return reply.code(201).send({ template })
  })

  app.post('/api/admin/report-policies', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'report-config:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        code: z
          .string()
          .trim()
          .min(2)
          .max(80)
          .regex(/^[A-Za-z0-9._-]+$/),
        templateId: z.string().uuid(),
        periodDays: z.number().int().min(1).max(366),
        timezone: z.string().trim().min(1).max(100),
        requireApproval: z.boolean(),
        deliveryChannels: z
          .array(deliveryChannelSchema)
          .min(1)
          .max(4)
          .transform((values) => [...new Set(values)]),
        maxDeliveryAttempts: z.number().int().min(1).max(20),
        status: z.enum(['draft', 'published']).default('draft'),
        reason: z.string().trim().min(5).max(500),
      })
      .parse(request.body)
    if (!validTimeZone(body.timezone)) {
      throw httpError(400, 'Invalid IANA timezone.')
    }
    const [template, latest] = await Promise.all([
      prisma.reportTemplate.findUnique({ where: { id: body.templateId } }),
      prisma.reportPolicy.findFirst({
        where: { code: body.code },
        orderBy: { version: 'desc' },
      }),
    ])
    if (!template) throw httpError(404, 'Report template not found.')
    if (body.status === 'published' && template.status !== 'published') {
      throw httpError(409, 'Publish the referenced template first.')
    }
    const policy = await prisma.$transaction(async (tx) => {
      if (body.status === 'published') {
        await tx.reportPolicy.updateMany({
          where: { code: body.code, status: 'published' },
          data: { status: 'archived' },
        })
      }
      const row = await tx.reportPolicy.create({
        data: {
          code: body.code,
          version: (latest?.version ?? 0) + 1,
          templateId: body.templateId,
          periodDays: body.periodDays,
          timezone: body.timezone,
          requireApproval: body.requireApproval,
          deliveryChannels: body.deliveryChannels,
          maxDeliveryAttempts: body.maxDeliveryAttempts,
          status: body.status,
          createdById: user.id,
          publishedAt: body.status === 'published' ? new Date() : null,
        },
      })
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'report.policy_version_created',
          targetType: 'report_policy',
          targetId: row.id,
          reason: body.reason,
          afterJson: json({
            code: row.code,
            version: row.version,
            status: row.status,
            deliveryChannels: row.deliveryChannels,
          }),
          requestId: request.id,
          ipAddress: request.ip,
        },
      })
      return row
    })
    return reply.code(201).send({ policy })
  })

  app.post('/api/admin/reports/due/process', async (request) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'report-config:write')) throw httpError(403, 'Forbidden')
    const { limit } = z
      .object({ limit: z.number().int().min(1).max(200).default(100) })
      .parse(request.body ?? {})
    const [policies, memberships] = await prisma.$transaction([
      prisma.reportPolicy.findMany({
        where: { status: 'published', template: { status: 'published' } },
        include: { template: true },
        orderBy: { publishedAt: 'asc' },
      }),
      prisma.classMembership.findMany({
        where: { status: 'active', student: { active: true } },
        select: { studentId: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ])
    const firstMembershipByStudent = new Map<string, Date>()
    memberships.forEach((membership) => {
      if (!firstMembershipByStudent.has(membership.studentId)) {
        firstMembershipByStudent.set(membership.studentId, membership.createdAt)
      }
    })
    const latestPeriods = await prisma.learningReport.groupBy({
      by: ['studentId', 'policyId'],
      where: {
        studentId: { in: [...firstMembershipByStudent.keys()] },
        policyId: { in: policies.map((policy) => policy.id) },
      },
      _max: { periodEnd: true },
    })
    const latestPeriodByStudentPolicy = new Map(
      latestPeriods.map((row) => [
        `${row.studentId}:${row.policyId}`,
        row._max.periodEnd,
      ]),
    )
    const now = new Date()
    const created = []
    let examined = 0
    for (const policy of policies) {
      for (const [studentId, membershipAt] of firstMembershipByStudent) {
        // `limit` caps writes, not scans. Capping scans would repeatedly inspect
        // the same early learners and could starve every learner after them.
        if (created.length >= limit) break
        examined += 1
        const policyStart = policy.publishedAt ?? policy.createdAt
        let periodStart =
          latestPeriodByStudentPolicy.get(`${studentId}:${policy.id}`) ??
          new Date(Math.max(policyStart.getTime(), membershipAt.getTime()))
        while (created.length < limit) {
          const periodEnd = new Date(
            periodStart.getTime() +
              policy.periodDays * 24 * 60 * 60 * 1_000,
          )
          if (periodEnd > now) break
          const snapshot = await buildLearningReportSnapshot({
            studentId,
            periodStart,
            periodEnd,
          })
          const requiredSections = z
            .array(reportSectionSchema)
            .parse(policy.template.requiredSections)
          const missingSections = findMissingReportSections(
            snapshot as Record<string, unknown>,
            requiredSections,
          )
          try {
            const report = await prisma.$transaction(async (tx) => {
              const row = await tx.learningReport.create({
                data: {
                  studentId,
                  templateId: policy.templateId,
                  policyId: policy.id,
                  periodStart,
                  periodEnd,
                  status: 'draft',
                  snapshotJson: json(snapshot),
                  missingSections,
                  createdById: user.id,
                },
              })
              await tx.auditEvent.create({
                data: {
                  actorId: user.id,
                  action: 'report.due_generated',
                  targetType: 'learning_report',
                  targetId: row.id,
                  reason: 'Published reporting cadence reached.',
                  afterJson: json({
                    studentId,
                    policyId: policy.id,
                    periodStart: periodStart.toISOString(),
                    periodEnd: periodEnd.toISOString(),
                    missingSections,
                  }),
                  requestId: request.id,
                  ipAddress: request.ip,
                },
              })
              return row
            })
            created.push(report)
            periodStart = periodEnd
          } catch (error) {
            if (
              !(
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
              )
            ) {
              throw error
            }
            // Another worker already created this exact period.
            break
          }
        }
      }
      if (created.length >= limit) break
    }
    return { examined, createdCount: created.length, reports: created }
  })

  app.post('/api/reports/generate', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'report:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        studentId: z.string().uuid(),
        policyId: z.string().uuid(),
        periodEnd: z.coerce.date().optional(),
      })
      .parse(request.body)
    await assertStudentScope(request, user, body.studentId)
    const policy = await prisma.reportPolicy.findFirst({
      where: { id: body.policyId, status: 'published' },
      include: { template: true },
    })
    if (!policy || policy.template.status !== 'published') {
      throw httpError(409, 'A published report policy is required.')
    }
    const periodEnd = body.periodEnd ?? new Date()
    const periodStart = new Date(
      periodEnd.getTime() - policy.periodDays * 24 * 60 * 60 * 1_000,
    )
    const snapshot = await buildLearningReportSnapshot({
      studentId: body.studentId,
      periodStart,
      periodEnd,
    })
    const requiredSections = z
      .array(reportSectionSchema)
      .parse(policy.template.requiredSections)
    const missingSections = findMissingReportSections(
      snapshot as Record<string, unknown>,
      requiredSections,
    )
    try {
      const report = await prisma.$transaction(async (tx) => {
        const row = await tx.learningReport.create({
          data: {
            studentId: body.studentId,
            templateId: policy.templateId,
            policyId: policy.id,
            periodStart,
            periodEnd,
            status: 'draft',
            snapshotJson: json(snapshot),
            missingSections,
            createdById: user.id,
          },
        })
        await tx.auditEvent.create({
          data: {
            actorId: user.id,
            action: 'report.generated',
            targetType: 'learning_report',
            targetId: row.id,
            afterJson: json({
              studentId: body.studentId,
              policyId: policy.id,
              periodStart: periodStart.toISOString(),
              periodEnd: periodEnd.toISOString(),
              missingSections,
            }),
            requestId: request.id,
            ipAddress: request.ip,
          },
        })
        return row
      })
      return reply.code(201).send({ report })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw httpError(409, 'This learner and reporting period already exist.')
      }
      throw error
    }
  })

  app.post('/api/reports/:id/refresh', async (request) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'report:write')) throw httpError(403, 'Forbidden')
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const body = z
      .object({
        expectedVersion: z.number().int().positive(),
        reason: z.string().trim().min(5).max(500),
      })
      .parse(request.body)
    const report = await getScopedReport(request, user, id)
    if (report.status !== 'draft') {
      throw httpError(409, 'Only a draft report can refresh its snapshot.')
    }
    const snapshot = await buildLearningReportSnapshot({
      studentId: report.studentId,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
    })
    const requiredSections = z
      .array(reportSectionSchema)
      .parse(report.template.requiredSections)
    const missingSections = findMissingReportSections(
      snapshot as Record<string, unknown>,
      requiredSections,
    )
    const updated = await prisma.$transaction(async (tx) => {
      const changed = await tx.learningReport.updateMany({
        where: { id, status: 'draft', version: body.expectedVersion },
        data: {
          snapshotJson: json(snapshot),
          missingSections,
          version: { increment: 1 },
        },
      })
      if (!changed.count) throw httpError(409, 'Report changed. Reload and retry.')
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'report.snapshot_refreshed',
          targetType: 'learning_report',
          targetId: id,
          reason: body.reason,
          beforeJson: json({
            version: report.version,
            missingSections: report.missingSections,
          }),
          afterJson: json({
            version: report.version + 1,
            missingSections,
          }),
          requestId: request.id,
          ipAddress: request.ip,
        },
      })
      return tx.learningReport.findUniqueOrThrow({ where: { id } })
    })
    return { report: updated }
  })

  app.post('/api/reports/:id/submit-review', async (request) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'report:write')) throw httpError(403, 'Forbidden')
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const body = z
      .object({
        expectedVersion: z.number().int().positive(),
        reason: z.string().trim().min(5).max(500),
      })
      .parse(request.body)
    const report = await getScopedReport(request, user, id)
    if (report.status !== 'draft') {
      throw httpError(409, 'Only a draft report can be submitted.')
    }
    if (report.missingSections.length > 0) {
      throw httpError(
        422,
        `Required report sections are missing: ${report.missingSections.join(', ')}`,
      )
    }
    const nextStatus = report.policy.requireApproval ? 'review' : 'approved'
    const result = await prisma.$transaction(async (tx) => {
      const changed = await tx.learningReport.updateMany({
        where: { id, status: 'draft', version: body.expectedVersion },
        data: {
          status: nextStatus,
          version: { increment: 1 },
          approvedById: nextStatus === 'approved' ? user.id : null,
          approvedAt: nextStatus === 'approved' ? new Date() : null,
        },
      })
      if (!changed.count) throw httpError(409, 'Report changed. Reload and retry.')
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'report.submitted_for_review',
          targetType: 'learning_report',
          targetId: id,
          reason: body.reason,
          beforeJson: json({ status: report.status, version: report.version }),
          afterJson: json({
            status: nextStatus,
            version: report.version + 1,
          }),
          requestId: request.id,
          ipAddress: request.ip,
        },
      })
      return tx.learningReport.findUniqueOrThrow({ where: { id } })
    })
    return { report: result }
  })

  app.post('/api/reports/:id/approve', async (request) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'report:approve')) throw httpError(403, 'Forbidden')
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const body = z
      .object({
        expectedVersion: z.number().int().positive(),
        reason: z.string().trim().min(5).max(500),
      })
      .parse(request.body)
    const report = await getScopedReport(request, user, id)
    if (report.status !== 'review') {
      throw httpError(409, 'Only a report in review can be approved.')
    }
    if (report.missingSections.length > 0) {
      throw httpError(422, 'Required report sections are missing.')
    }
    const result = await prisma.$transaction(async (tx) => {
      const changed = await tx.learningReport.updateMany({
        where: { id, status: 'review', version: body.expectedVersion },
        data: {
          status: 'approved',
          version: { increment: 1 },
          approvedById: user.id,
          approvedAt: new Date(),
        },
      })
      if (!changed.count) throw httpError(409, 'Report changed. Reload and retry.')
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'report.approved',
          targetType: 'learning_report',
          targetId: id,
          reason: body.reason,
          beforeJson: json({ status: report.status, version: report.version }),
          afterJson: json({
            status: 'approved',
            version: report.version + 1,
          }),
          requestId: request.id,
          ipAddress: request.ip,
        },
      })
      return tx.learningReport.findUniqueOrThrow({ where: { id } })
    })
    return { report: result }
  })

  app.post('/api/reports/:id/publish', async (request) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'report:approve')) throw httpError(403, 'Forbidden')
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const body = z
      .object({
        expectedVersion: z.number().int().positive(),
        reason: z.string().trim().min(5).max(500),
      })
      .parse(request.body)
    const report = await getScopedReport(request, user, id)
    if (report.status !== 'approved') {
      throw httpError(409, 'Only an approved report can be published.')
    }
    if (report.missingSections.length > 0) {
      throw httpError(422, 'Required report sections are missing.')
    }
    if (!report.student.parentId) {
      throw httpError(422, 'The learner has no linked parent recipient.')
    }
    const layout = layoutSchema.parse(report.template.layoutJson)
    const pdf = await generateLearningReportPdf(
      report.snapshotJson as Record<string, unknown>,
      layout,
    )
    const pdfSha256 = createHash('sha256').update(pdf).digest('hex')
    const now = new Date()
    const published = await prisma.$transaction(async (tx) => {
      const changed = await tx.learningReport.updateMany({
        where: {
          id,
          status: 'approved',
          version: body.expectedVersion,
        },
        data: {
          status: 'published',
          version: { increment: 1 },
          publishedAt: now,
          pdfData: new Uint8Array(pdf),
          pdfSha256,
          pdfGeneratedAt: now,
        },
      })
      if (!changed.count) throw httpError(409, 'Report changed. Reload and retry.')
      for (const channel of report.policy.deliveryChannels) {
        deliveryChannelSchema.parse(channel)
        await tx.reportDelivery.create({
          data: {
            reportId: id,
            recipientId: report.student.parentId!,
            channel,
            idempotencyKey: `${id}:${report.student.parentId}:${channel}`,
            status: 'pending',
            nextAttemptAt: now,
          },
        })
      }
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'report.published',
          targetType: 'learning_report',
          targetId: id,
          reason: body.reason,
          beforeJson: json({ status: report.status, version: report.version }),
          afterJson: json({
            status: 'published',
            version: report.version + 1,
            pdfSha256,
            deliveryChannels: report.policy.deliveryChannels,
          }),
          requestId: request.id,
          ipAddress: request.ip,
        },
      })
      return tx.learningReport.findUniqueOrThrow({
        where: { id },
        include: { deliveries: true },
      })
    })
    return { report: published }
  })

  app.get('/api/reports', async (request) => {
    const user = requireUser(request)
    if (!can(user.role, 'report:read')) throw httpError(403, 'Forbidden')
    const query = z
      .object({
        studentId: z.string().uuid().optional(),
        status: reportStatusSchema.optional(),
      })
      .parse(request.query)
    if (query.studentId) await assertStudentScope(request, user, query.studentId)
    const where: Prisma.LearningReportWhereInput = {
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.status ? { status: query.status } : {}),
    }
    if (user.role === 'student') {
      where.studentId = user.id
      where.status = 'published'
    } else if (user.role === 'parent') {
      where.student = { parentId: user.id }
      where.status = 'published'
    } else if (user.role === 'teacher') {
      where.student = {
        classMemberships: {
          some: { status: 'active', classroom: { teacherId: user.id } },
        },
      }
    }
    const reports = await prisma.learningReport.findMany({
      where,
      orderBy: { periodEnd: 'desc' },
      take: 100,
      select: {
        id: true,
        studentId: true,
        periodStart: true,
        periodEnd: true,
        status: true,
        missingSections: true,
        version: true,
        approvedAt: true,
        publishedAt: true,
        pdfSha256: true,
        createdAt: true,
        updatedAt: true,
        student: { select: { nickname: true, avatarId: true } },
        template: { select: { code: true, version: true, name: true } },
        policy: {
          select: {
            code: true,
            version: true,
            requireApproval: true,
            deliveryChannels: true,
          },
        },
        deliveries: {
          select: {
            channel: true,
            status: true,
            attempts: true,
            lastError: true,
            sentAt: true,
          },
        },
      },
    })
    return { reports }
  })

  app.get('/api/reports/:id', async (request) => {
    const user = requireUser(request)
    if (!can(user.role, 'report:read')) throw httpError(403, 'Forbidden')
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const report = await getScopedReport(request, user, id)
    const { pdfData: _pdfData, ...safeReport } = report
    return { report: safeReport }
  })

  app.get('/api/reports/:id/pdf', async (request, reply) => {
    const user = requireUser(request)
    if (!can(user.role, 'report:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const report = await getScopedReport(request, user, id)
    if (report.status !== 'published' || !report.pdfData) {
      throw httpError(404, 'Published PDF not found.')
    }
    reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `inline; filename="learning-report-${id}.pdf"`)
      .header('Cache-Control', 'private, no-store')
      .header('X-Content-Type-Options', 'nosniff')
    return reply.send(Buffer.from(report.pdfData))
  })

  app.post('/api/admin/reports/deliveries/process', async (request) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'report:deliver')) throw httpError(403, 'Forbidden')
    const { limit } = z
      .object({ limit: z.number().int().min(1).max(100).default(30) })
      .parse(request.body ?? {})
    const now = new Date()
    const candidates = await prisma.reportDelivery.findMany({
      where: {
        status: { in: ['pending', 'failed'] },
        OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
        report: { status: 'published', pdfData: { not: null } },
      },
      orderBy: [{ nextAttemptAt: 'asc' }, { createdAt: 'asc' }],
      take: limit * 2,
      include: {
        recipient: { select: { id: true, nickname: true, email: true } },
        report: {
          include: {
            student: { select: { nickname: true } },
            policy: true,
          },
        },
      },
    })
    const due = candidates
      .filter((row) => row.attempts < row.report.policy.maxDeliveryAttempts)
      .slice(0, limit)
    const outcomes: Array<Record<string, unknown>> = []
    for (const delivery of due) {
      const claimed = await prisma.reportDelivery.updateMany({
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
        let providerMessageId = delivery.providerMessageId
        let destinationMasked = delivery.destinationMasked
        if (delivery.channel === 'zalo') {
          throw new Error('ZALO_PROVIDER_NOT_CONFIGURED')
        }
        if (delivery.channel === 'email') {
          if (!delivery.recipient.email) {
            throw new Error('RECIPIENT_EMAIL_MISSING')
          }
          const pdf = delivery.report.pdfData
          if (!pdf) throw new Error('REPORT_PDF_MISSING')
          const result = await emailService.sendMail(
            delivery.recipient.email,
            `Báo cáo học tập của ${delivery.report.student.nickname ?? 'học viên'}`,
            `<p>Ba/mẹ thân mến,</p><p>Báo cáo học tập mới của <strong>${escapeHtml(
              delivery.report.student.nickname ?? 'học viên',
            )}</strong> được đính kèm trong email này.</p>`,
            [
              {
                filename: `learning-report-${delivery.reportId}.pdf`,
                content: Buffer.from(pdf),
                contentType: 'application/pdf',
              },
            ],
          )
          if (!result.delivered) {
            throw new Error('EMAIL_PROVIDER_NOT_CONFIGURED')
          }
          providerMessageId = result.providerMessageId
          destinationMasked = maskEmail(delivery.recipient.email)
        } else {
          let notification = providerMessageId
            ? await prisma.notification.findUnique({
                where: { id: providerMessageId },
              })
            : null
          if (!notification) {
            notification = await prisma.notification.create({
              data: {
                userId: delivery.recipientId,
                type: 'learning_report',
                title: 'Báo cáo học tập mới',
                body: `Báo cáo của ${
                  delivery.report.student.nickname ?? 'học viên'
                } đã sẵn sàng.`,
                data: JSON.stringify({
                  reportId: delivery.reportId,
                  url: `/parent/reports/${delivery.reportId}`,
                }),
              },
            })
            providerMessageId = notification.id
          }
          if (delivery.channel === 'push') {
            if (notification.pushStatus === 'sent') {
              // The push worker already confirmed at least one FCM delivery.
            } else if (
              notification.pushStatus === 'queued' ||
              notification.pushStatus === 'processing'
            ) {
              await prisma.reportDelivery.update({
                where: { id: delivery.id },
                data: {
                  status: 'pending',
                  providerMessageId,
                  nextAttemptAt: new Date(Date.now() + 30_000),
                  attempts: { decrement: 1 },
                },
              })
              outcomes.push({ id: delivery.id, status: 'awaiting_provider' })
              continue
            } else if (!(await enqueueNotificationPush(notification.id))) {
              throw new Error('PUSH_PROVIDER_NOT_CONFIGURED')
            } else {
              await prisma.reportDelivery.update({
                where: { id: delivery.id },
                data: {
                  status: 'pending',
                  providerMessageId,
                  nextAttemptAt: new Date(Date.now() + 30_000),
                },
              })
              outcomes.push({ id: delivery.id, status: 'awaiting_provider' })
              continue
            }
          }
        }
        await prisma.reportDelivery.update({
          where: { id: delivery.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
            providerMessageId,
            destinationMasked,
            nextAttemptAt: null,
          },
        })
        outcomes.push({ id: delivery.id, status: 'sent' })
      } catch (error) {
        const message =
          error instanceof Error ? error.message.slice(0, 500) : 'Unknown'
        const exhausted =
          delivery.attempts + 1 >=
          delivery.report.policy.maxDeliveryAttempts
        const nextAttemptAt = exhausted
          ? null
          : new Date(
              Date.now() +
                Math.min(60 * 60 * 1_000, 2 ** delivery.attempts * 30_000),
            )
        await prisma.reportDelivery.update({
          where: { id: delivery.id },
          data: {
            status: exhausted ? 'cancelled' : 'failed',
            lastError: message,
            nextAttemptAt,
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
