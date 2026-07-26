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
import {
  calculationPolicySchema,
  recalculateStudentCompetencies,
  recordPublishedAssessmentEvidence,
} from './competency.service.js'

const levelPolicySchema = z
  .object({
    notMetBelow: z.number().min(0).max(100),
    achievedFrom: z.number().min(0).max(100),
  })
  .refine((value) => value.notMetBelow < value.achievedFrom)
const sourceTypeSchema = z.enum([
  'course',
  'quest',
  'question_version',
  'assessment',
])
const evidenceTypeSchema = z.enum([
  'lesson_completion',
  'assessment_score',
  'question_score',
  'artifact_rubric',
  'teacher_observation',
])

function httpError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode })
}

async function scopedStudent(request: FastifyRequest, user: AuthUser) {
  const query =
    user.role === 'student'
      ? { studentId: user.id }
      : z
          .object({ studentId: z.string().uuid() })
          .parse(request.query)
  const student = await prisma.user.findFirst({
    where: { id: query.studentId, role: 'student', active: true },
    select: {
      id: true,
      nickname: true,
      avatarId: true,
      ageBand: true,
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
      throw httpError(403, 'Forbidden')
    }
  }
  return student
}

async function validateMappingSources(
  mappings: Array<{ sourceType: z.infer<typeof sourceTypeSchema>; sourceId: string }>,
) {
  const byType = new Map<string, Set<string>>()
  mappings.forEach((mapping) => {
    const ids = byType.get(mapping.sourceType) ?? new Set<string>()
    ids.add(mapping.sourceId)
    byType.set(mapping.sourceType, ids)
  })
  for (const [type, idSet] of byType) {
    const ids = [...idSet]
    const count =
      type === 'course'
        ? await prisma.course.count({ where: { id: { in: ids } } })
        : type === 'quest'
          ? await prisma.quest.count({ where: { id: { in: ids } } })
          : type === 'question_version'
            ? await prisma.questionVersion.count({
                where: { id: { in: ids } },
              })
            : await prisma.assessment.count({ where: { id: { in: ids } } })
    if (count !== ids.length) {
      throw httpError(400, `Unknown competency mapping source: ${type}`)
    }
  }
}

export async function competencyRoutes(app: FastifyInstance) {
  app.get('/api/admin/competency/frameworks', async (request) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'competency:write')) throw httpError(403, 'Forbidden')
    return {
      frameworks: await prisma.competencyFramework.findMany({
        orderBy: [{ code: 'asc' }, { version: 'desc' }],
        include: {
          domains: {
            orderBy: { sortOrder: 'asc' },
            include: { skills: { orderBy: { sortOrder: 'asc' } } },
          },
          mappingVersions: {
            orderBy: { version: 'desc' },
            include: { mappings: true },
          },
        },
      }),
    }
  })

  app.post('/api/admin/competency/frameworks', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'competency:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        code: z
          .string()
          .min(2)
          .max(80)
          .regex(/^[A-Za-z0-9._-]+$/),
        name: z.string().min(2).max(200),
        description: z.string().max(2_000).nullable().optional(),
        expectedDomainCount: z.literal(4),
        sourceReference: z.string().max(500).nullable().optional(),
        alignmentStatement: z.string().max(500).nullable().optional(),
        disclaimer: z.string().min(10).max(1_000),
        status: z.enum(['draft', 'published']).default('draft'),
        reason: z.string().min(5).max(500),
        domains: z
          .array(
            z.object({
              code: z.string().min(1).max(80),
              name: z.string().min(1).max(200),
              description: z.string().min(1).max(2_000),
              sortOrder: z.number().int().min(0).max(100),
              skills: z
                .array(
                  z.object({
                    code: z.string().min(1).max(80),
                    name: z.string().min(1).max(200),
                    description: z.string().min(1).max(2_000),
                    learnerLabel: z.string().min(1).max(200),
                    levelPolicy: levelPolicySchema,
                    sortOrder: z.number().int().min(0).max(1_000),
                  }),
                )
                .min(1)
                .max(100),
            }),
          )
          .min(1)
          .max(20),
      })
      .parse(request.body)
    if (
      body.alignmentStatement &&
      /được\s+phê\s+duyệt|approved\s+by/i.test(body.alignmentStatement)
    ) {
      return reply.code(400).send({
        error:
          'Alignment wording must not claim government or framework approval.',
      })
    }
    if (
      body.status === 'published' &&
      body.domains.length !== body.expectedDomainCount
    ) {
      return reply.code(409).send({
        error: `Published framework requires exactly ${body.expectedDomainCount} domains.`,
      })
    }
    if (
      new Set(body.domains.map((domain) => domain.code)).size !==
      body.domains.length
    ) {
      return reply.code(400).send({ error: 'Domain codes must be unique.' })
    }
    const latest = await prisma.competencyFramework.findFirst({
      where: { code: body.code },
      orderBy: { version: 'desc' },
    })
    const framework = await prisma.$transaction(async (tx) => {
      if (body.status === 'published') {
        await tx.competencyFramework.updateMany({
          where: { code: body.code, status: 'published' },
          data: { status: 'archived' },
        })
      }
      const row = await tx.competencyFramework.create({
        data: {
          code: body.code,
          version: (latest?.version ?? 0) + 1,
          name: body.name,
          description: body.description,
          expectedDomainCount: body.expectedDomainCount,
          sourceReference: body.sourceReference,
          alignmentStatement: body.alignmentStatement,
          disclaimer: body.disclaimer,
          status: body.status,
          createdById: user.id,
          publishedAt: body.status === 'published' ? new Date() : null,
          domains: {
            create: body.domains.map((domain) => ({
              code: domain.code,
              name: domain.name,
              description: domain.description,
              sortOrder: domain.sortOrder,
              skills: {
                create: domain.skills.map((skill) => ({
                  code: skill.code,
                  name: skill.name,
                  description: skill.description,
                  learnerLabel: skill.learnerLabel,
                  levelPolicyJson:
                    skill.levelPolicy as Prisma.InputJsonValue,
                  sortOrder: skill.sortOrder,
                })),
              },
            })),
          },
        },
        include: {
          domains: { include: { skills: true } },
        },
      })
      await tx.auditEvent.create({
        data: {
          actorId: user.id,
          action: 'competency.framework_version_created',
          targetType: 'competency_framework',
          targetId: row.id,
          reason: body.reason,
          afterJson: {
            code: row.code,
            version: row.version,
            status: row.status,
            domainCount: row.domains.length,
          },
          requestId: request.id,
          ipAddress: request.ip,
        },
      })
      return row
    })
    return reply.code(201).send({ framework })
  })

  app.post(
    '/api/admin/competency/mapping-versions',
    async (request, reply) => {
      const user = requireRole(request, ['admin'])
      if (!can(user.role, 'competency:write')) {
        return reply.code(403).send({ error: 'Forbidden' })
      }
      const body = z
        .object({
          frameworkId: z.string().uuid(),
          calculationPolicy: calculationPolicySchema,
          status: z.enum(['draft', 'published']).default('draft'),
          reason: z.string().min(5).max(500),
          mappings: z
            .array(
              z.object({
                skillId: z.string().uuid(),
                sourceType: sourceTypeSchema,
                sourceId: z.string().min(1).max(160),
                evidenceType: evidenceTypeSchema,
                weight: z.number().positive().max(100),
              }),
            )
            .min(1)
            .max(5_000),
        })
        .parse(request.body)
      await validateMappingSources(body.mappings)
      const framework = await prisma.competencyFramework.findUnique({
        where: { id: body.frameworkId },
        include: {
          domains: { include: { skills: { select: { id: true } } } },
        },
      })
      if (!framework) {
        return reply.code(404).send({ error: 'Framework not found' })
      }
      if (body.status === 'published' && framework.status !== 'published') {
        return reply.code(409).send({
          error: 'Publish the customer-approved framework before its mapping.',
        })
      }
      const allowedSkillIds = new Set(
        framework.domains.flatMap((domain) =>
          domain.skills.map((skill) => skill.id),
        ),
      )
      if (body.mappings.some((mapping) => !allowedSkillIds.has(mapping.skillId))) {
        return reply.code(400).send({
          error: 'Every mapped skill must belong to the selected framework.',
        })
      }
      const latest = await prisma.competencyMappingVersion.findFirst({
        where: { frameworkId: body.frameworkId },
        orderBy: { version: 'desc' },
      })
      const mappingVersion = await prisma.$transaction(async (tx) => {
        if (body.status === 'published') {
          await tx.competencyMappingVersion.updateMany({
            where: {
              frameworkId: body.frameworkId,
              status: 'published',
            },
            data: { status: 'archived' },
          })
        }
        const row = await tx.competencyMappingVersion.create({
          data: {
            frameworkId: body.frameworkId,
            version: (latest?.version ?? 0) + 1,
            calculationPolicyJson:
              body.calculationPolicy as Prisma.InputJsonValue,
            status: body.status,
            createdById: user.id,
            publishedAt: body.status === 'published' ? new Date() : null,
            mappings: { create: body.mappings },
          },
          include: { mappings: true },
        })
        await tx.auditEvent.create({
          data: {
            actorId: user.id,
            action: 'competency.mapping_version_created',
            targetType: 'competency_mapping_version',
            targetId: row.id,
            reason: body.reason,
            afterJson: {
              frameworkId: row.frameworkId,
              version: row.version,
              status: row.status,
              mappingCount: row.mappings.length,
            },
            requestId: request.id,
            ipAddress: request.ip,
          },
        })
        return row
      })
      return reply.code(201).send({ mappingVersion })
    },
  )

  app.post('/api/admin/competency/recalculate', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'competency:recalculate')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        mappingVersionId: z.string().uuid(),
        studentId: z.string().uuid(),
        reason: z.string().min(5).max(500),
      })
      .parse(request.body)
    const run = await prisma.competencyRecalculationRun.create({
      data: {
        mappingVersionId: body.mappingVersionId,
        studentId: body.studentId,
        actorId: user.id,
        reason: body.reason,
      },
    })
    try {
      const result = await prisma.$transaction(async (tx) => {
        await tx.competencyRecalculationRun.update({
          where: { id: run.id },
          data: { status: 'running', startedAt: new Date() },
        })
        const attempts = await tx.assessmentAttempt.findMany({
          where: { studentId: body.studentId, status: 'published' },
          select: { id: true },
          orderBy: { publishedAt: 'asc' },
        })
        for (const attempt of attempts) {
          await recordPublishedAssessmentEvidence(tx, attempt.id)
        }
        const snapshots = await recalculateStudentCompetencies(
          tx,
          body.mappingVersionId,
          body.studentId,
        )
        await tx.competencyRecalculationRun.update({
          where: { id: run.id },
          data: { status: 'completed', finishedAt: new Date() },
        })
        await tx.auditEvent.create({
          data: {
            actorId: user.id,
            action: 'competency.recalculated',
            targetType: 'competency_recalculation_run',
            targetId: run.id,
            reason: body.reason,
            afterJson: {
              studentId: body.studentId,
              snapshotIds: snapshots.map((snapshot) => snapshot.id),
            },
            requestId: request.id,
            ipAddress: request.ip,
          },
        })
        return snapshots
      })
      return { run: { ...run, status: 'completed' }, snapshots: result }
    } catch (error) {
      await prisma.competencyRecalculationRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          finishedAt: new Date(),
          errorMessage:
            error instanceof Error ? error.message.slice(0, 1_000) : 'Unknown',
        },
      })
      throw error
    }
  })

  app.get('/api/competency-map', async (request) => {
    const user = requireUser(request)
    if (!can(user.role, 'competency:read')) throw httpError(403, 'Forbidden')
    const student = await scopedStudent(request, user)
    const frameworks = await prisma.competencyFramework.findMany({
      where: { status: 'published' },
      orderBy: [{ code: 'asc' }, { version: 'desc' }],
      include: {
        domains: {
          orderBy: { sortOrder: 'asc' },
          include: {
            skills: {
              orderBy: { sortOrder: 'asc' },
              include: {
                snapshots: {
                  where: { studentId: student.id, current: true },
                  orderBy: { computedAt: 'desc' },
                  take: 1,
                  include: {
                    evidenceLinks: {
                      include: {
                        evidence: {
                          select: {
                            id: true,
                            sourceType: true,
                            sourceId: true,
                            evidenceType: true,
                            scorePercent: true,
                            occurredAt: true,
                            metadataJson: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        mappingVersions: {
          where: { status: 'published' },
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    })
    return {
      student,
      status: frameworks.length > 0 ? 'ready' : 'configuration_required',
      frameworks: frameworks.map((framework) => ({
        id: framework.id,
        code: framework.code,
        version: framework.version,
        name: framework.name,
        description: framework.description,
        sourceReference: framework.sourceReference,
        alignmentStatement: framework.alignmentStatement,
        disclaimer: framework.disclaimer,
        mappingVersion: framework.mappingVersions[0] ?? null,
        domains: framework.domains.map((domain) => ({
          id: domain.id,
          code: domain.code,
          name: domain.name,
          description: domain.description,
          skills: domain.skills.map((skill) => {
            const snapshot = skill.snapshots[0]
            return {
              id: skill.id,
              code: skill.code,
              name: skill.name,
              description: skill.description,
              learnerLabel: skill.learnerLabel,
              result: snapshot
                ? {
                    id: snapshot.id,
                    level: snapshot.level,
                    scorePercent: snapshot.scorePercent,
                    evidenceCount: snapshot.evidenceCount,
                    computedAt: snapshot.computedAt,
                    evidence: snapshot.evidenceLinks.map(
                      (link) => link.evidence,
                    ),
                  }
                : {
                    id: null,
                    level: 'no_data',
                    scorePercent: null,
                    evidenceCount: 0,
                    computedAt: null,
                    evidence: [],
                  },
            }
          }),
        })),
      })),
    }
  })
}
