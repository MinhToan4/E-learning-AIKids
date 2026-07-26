import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import {
  calculateCompetencyResult,
  evaluateCredentialEligibility,
  type CompetencyLevel,
} from '@aikids/domain'
import { Prisma } from '../../generated/prisma/index.js'

export const calculationPolicySchema = z
  .object({
    aggregation: z.literal('weighted_average'),
    attemptStrategy: z.enum(['latest', 'best', 'all']),
    notMetBelow: z.number().min(0).max(100),
    achievedFrom: z.number().min(0).max(100),
  })
  .refine((value) => value.notMetBelow < value.achievedFrom, {
    message: 'notMetBelow must be lower than achievedFrom',
  })

function selectEvidence<
  T extends {
    mappingId: string
    scorePercent: number
    occurredAt: Date
  },
>(
  rows: T[],
  strategy: 'latest' | 'best' | 'all',
): T[] {
  if (strategy === 'all') return rows
  const selected = new Map<string, T>()
  rows.forEach((row) => {
    const current = selected.get(row.mappingId)
    if (
      !current ||
      (strategy === 'latest' && row.occurredAt > current.occurredAt) ||
      (strategy === 'best' && row.scorePercent > current.scorePercent)
    ) {
      selected.set(row.mappingId, row)
    }
  })
  return [...selected.values()]
}

export async function recalculateStudentCompetencies(
  tx: Prisma.TransactionClient,
  mappingVersionId: string,
  studentId: string,
) {
  const mappingVersion = await tx.competencyMappingVersion.findUniqueOrThrow({
    where: { id: mappingVersionId },
    include: {
      mappings: {
        where: { active: true },
        select: { skillId: true },
      },
    },
  })
  const policy = calculationPolicySchema.parse(
    mappingVersion.calculationPolicyJson,
  )
  const skillIds = [
    ...new Set(mappingVersion.mappings.map((mapping) => mapping.skillId)),
  ]
  const results = []
  for (const skillId of skillIds) {
    const rawEvidence = await tx.competencyEvidence.findMany({
      where: {
        studentId,
        skillId,
        status: 'active',
        mapping: { mappingVersionId, active: true },
      },
      orderBy: { occurredAt: 'asc' },
    })
    const evidence = selectEvidence(rawEvidence, policy.attemptStrategy)
    const result = calculateCompetencyResult(
      evidence.map((row) => ({
        scorePercent: row.scorePercent,
        weight: row.weightSnapshot,
      })),
      policy,
    )
    const latest = await tx.competencySnapshot.findFirst({
      where: { studentId, skillId, mappingVersionId },
      orderBy: { version: 'desc' },
    })
    await tx.competencySnapshot.updateMany({
      where: { studentId, skillId, mappingVersionId, current: true },
      data: { current: false },
    })
    const snapshot = await tx.competencySnapshot.create({
      data: {
        studentId,
        skillId,
        mappingVersionId,
        version: (latest?.version ?? 0) + 1,
        scorePercent: result.scorePercent,
        level: result.level,
        evidenceCount: result.evidenceCount,
        calculationJson: {
          policy,
          selectedEvidenceIds: evidence.map((row) => row.id),
        },
        evidenceLinks: {
          create: evidence.map((row) => ({ evidenceId: row.id })),
        },
      },
    })
    results.push(snapshot)
  }
  return results
}

export async function recordPublishedAssessmentEvidence(
  tx: Prisma.TransactionClient,
  attemptId: string,
) {
  const attempt = await tx.assessmentAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: {
      assessmentVersion: {
        include: { assessment: true },
      },
      responses: true,
    },
  })
  if (attempt.status !== 'published' || attempt.scorePercent === null) return []
  const responseByQuestion = new Map(
    attempt.responses.map((response) => [
      response.questionVersionId,
      response,
    ]),
  )
  const questionVersionIds = [...responseByQuestion.keys()]
  const assessment = attempt.assessmentVersion.assessment
  const sourcePairs = [
    { sourceType: 'assessment', sourceId: assessment.id },
    { sourceType: 'course', sourceId: assessment.courseId },
    ...(assessment.questId
      ? [{ sourceType: 'quest', sourceId: assessment.questId }]
      : []),
    ...questionVersionIds.map((sourceId) => ({
      sourceType: 'question_version',
      sourceId,
    })),
  ]
  const mappings = await tx.competencyMapping.findMany({
    where: {
      active: true,
      mappingVersion: { status: 'published' },
      OR: sourcePairs,
    },
    include: { mappingVersion: true },
  })
  const affected = new Set<string>()
  for (const mapping of mappings) {
    const response =
      mapping.sourceType === 'question_version'
        ? responseByQuestion.get(mapping.sourceId)
        : null
    const scorePercent =
      response?.finalRatio !== null && response?.finalRatio !== undefined
        ? response.finalRatio * 100
        : mapping.sourceType === 'question_version'
          ? null
          : attempt.scorePercent
    if (scorePercent === null) continue
    const sourceRecordId = response?.id ?? attempt.id
    await tx.competencyEvidence.upsert({
      where: {
        fingerprint: `${mapping.id}:${sourceRecordId}`,
      },
      create: {
        fingerprint: `${mapping.id}:${sourceRecordId}`,
        studentId: attempt.studentId,
        skillId: mapping.skillId,
        mappingId: mapping.id,
        sourceType: response ? 'assessment_response' : 'assessment_attempt',
        sourceId: sourceRecordId,
        sourceVersion: attempt.version,
        evidenceType: mapping.evidenceType,
        scorePercent,
        weightSnapshot: mapping.weight,
        occurredAt: attempt.publishedAt ?? new Date(),
        metadataJson: {
          assessmentId: assessment.id,
          assessmentAttemptId: attempt.id,
          questionVersionId: response?.questionVersionId ?? null,
          courseId: assessment.courseId,
        },
      },
      update: {
        scorePercent,
        sourceVersion: attempt.version,
        weightSnapshot: mapping.weight,
        status: 'active',
        revokedAt: null,
      },
    })
    affected.add(`${mapping.mappingVersionId}:${mapping.skillId}`)
  }
  const mappingVersionIds = [
    ...new Set([...affected].map((entry) => entry.split(':')[0]!)),
  ]
  const snapshots = []
  for (const mappingVersionId of mappingVersionIds) {
    snapshots.push(
      ...(await recalculateStudentCompetencies(
        tx,
        mappingVersionId,
        attempt.studentId,
      )),
    )
  }
  return snapshots
}

export async function recordQuestCompletionEvidence(
  tx: Prisma.TransactionClient,
  studentId: string,
  questId: string,
) {
  const progress = await tx.questProgress.findUniqueOrThrow({
    where: { userId_questId: { userId: studentId, questId } },
    include: { quest: { select: { courseId: true } } },
  })
  if (progress.status !== 'completed') return []
  const mappings = await tx.competencyMapping.findMany({
    where: {
      active: true,
      evidenceType: 'lesson_completion',
      mappingVersion: { status: 'published' },
      OR: [
        { sourceType: 'quest', sourceId: questId },
        { sourceType: 'course', sourceId: progress.quest.courseId },
      ],
    },
  })
  const mappingVersionIds = new Set<string>()
  for (const mapping of mappings) {
    await tx.competencyEvidence.upsert({
      where: { fingerprint: `${mapping.id}:${progress.id}` },
      create: {
        fingerprint: `${mapping.id}:${progress.id}`,
        studentId,
        skillId: mapping.skillId,
        mappingId: mapping.id,
        sourceType: 'quest_progress',
        sourceId: progress.id,
        evidenceType: mapping.evidenceType,
        scorePercent: 100,
        weightSnapshot: mapping.weight,
        occurredAt: progress.updatedAt,
        metadataJson: {
          questId,
          courseId: progress.quest.courseId,
          stars: progress.stars,
        },
      },
      update: {
        scorePercent: 100,
        weightSnapshot: mapping.weight,
        status: 'active',
        revokedAt: null,
      },
    })
    mappingVersionIds.add(mapping.mappingVersionId)
  }
  const snapshots = []
  for (const mappingVersionId of mappingVersionIds) {
    snapshots.push(
      ...(await recalculateStudentCompetencies(
        tx,
        mappingVersionId,
        studentId,
      )),
    )
  }
  return snapshots
}

export async function recordPublishedTeacherObservationEvidence(
  tx: Prisma.TransactionClient,
  observationId: string,
) {
  const observation = await tx.teacherObservation.findUniqueOrThrow({
    where: { id: observationId },
    include: {
      session: { select: { questId: true } },
    },
  })
  if (
    observation.status !== 'published' ||
    observation.scorePercent === null
  ) {
    return []
  }
  const sourcePairs = [
    ...(observation.courseId
      ? [{ sourceType: 'course', sourceId: observation.courseId }]
      : []),
    ...(observation.session?.questId
      ? [{ sourceType: 'quest', sourceId: observation.session.questId }]
      : []),
  ]
  if (sourcePairs.length === 0) return []
  const mappings = await tx.competencyMapping.findMany({
    where: {
      active: true,
      evidenceType: 'teacher_observation',
      mappingVersion: { status: 'published' },
      OR: sourcePairs,
    },
  })
  const mappingVersionIds = new Set<string>()
  for (const mapping of mappings) {
    await tx.competencyEvidence.upsert({
      where: { fingerprint: `${mapping.id}:${observation.id}` },
      create: {
        fingerprint: `${mapping.id}:${observation.id}`,
        studentId: observation.studentId,
        skillId: mapping.skillId,
        mappingId: mapping.id,
        sourceType: 'teacher_observation',
        sourceId: observation.id,
        sourceVersion: observation.version,
        evidenceType: mapping.evidenceType,
        scorePercent: observation.scorePercent,
        weightSnapshot: mapping.weight,
        occurredAt: observation.publishedAt ?? observation.updatedAt,
        metadataJson: {
          teacherId: observation.teacherId,
          courseId: observation.courseId,
          sessionId: observation.sessionId,
        },
      },
      update: {
        sourceVersion: observation.version,
        scorePercent: observation.scorePercent,
        weightSnapshot: mapping.weight,
        status: 'active',
        revokedAt: null,
      },
    })
    mappingVersionIds.add(mapping.mappingVersionId)
  }
  const snapshots = []
  for (const mappingVersionId of mappingVersionIds) {
    snapshots.push(
      ...(await recalculateStudentCompetencies(
        tx,
        mappingVersionId,
        observation.studentId,
      )),
    )
  }
  return snapshots
}

const requiredSkillLevelsSchema = z.record(
  z.string().uuid(),
  z.enum(['no_data', 'not_met', 'developing', 'achieved']),
)

export async function issueEligibleCredentials(
  tx: Prisma.TransactionClient,
  studentId: string,
  courseId: string,
  issuedById: string | null,
) {
  const [student, course, completed, total, passedAttempt, rules, snapshots] =
    await Promise.all([
      tx.user.findUniqueOrThrow({
        where: { id: studentId },
        select: { id: true, nickname: true, level: true },
      }),
      tx.course.findUniqueOrThrow({
        where: { id: courseId },
        select: { id: true, title: true },
      }),
      tx.questProgress.findMany({
        where: {
          userId: studentId,
          status: 'completed',
          quest: { courseId, archived: false },
        },
        select: { id: true, updatedAt: true },
      }),
      tx.quest.count({ where: { courseId, archived: false } }),
      tx.assessmentAttempt.findFirst({
        where: {
          studentId,
          status: 'published',
          passed: true,
          assessmentVersion: { assessment: { courseId } },
        },
        select: { id: true },
      }),
      tx.credentialRule.findMany({
        where: {
          courseId,
          status: 'published',
          template: { status: 'published' },
        },
        include: { template: true },
      }),
      tx.competencySnapshot.findMany({
        where: { studentId, current: true },
        select: { skillId: true, level: true, id: true },
      }),
    ])
  const completedCount = completed.length
  const completionPercent =
    total > 0 ? Math.round((completedCount / total) * 100) : 0
  const completedAt =
    total > 0 && completedCount === total
      ? completed.reduce(
          (latest, row) => (row.updatedAt > latest ? row.updatedAt : latest),
          completed[0]!.updatedAt,
        )
      : null
  const skillLevels = Object.fromEntries(
    snapshots.map((snapshot) => [
      snapshot.skillId,
      snapshot.level as CompetencyLevel,
    ]),
  )
  const issued = []
  for (const rule of rules) {
    const requiredSkillLevels = requiredSkillLevelsSchema.parse(
      rule.requiredSkillLevelsJson,
    )
    const eligibility = evaluateCredentialEligibility(
      {
        completionPercent,
        hasPassedAssessment: Boolean(passedAttempt),
        skillLevels,
      },
      {
        minCompletionPercent: rule.minCompletionPercent,
        requirePassedAssessment: rule.requirePassedAssessment,
        requiredSkillLevels,
      },
    )
    if (!eligibility.eligible) continue
    // A completion certificate must freeze an actual course-completion event.
    // Badges may intentionally use lower thresholds configured by the customer.
    if (rule.kind === 'certificate' && !completedAt) continue
    const existing = await tx.issuedCredential.findFirst({
      where: { studentId, ruleId: rule.id, status: 'issued' },
      orderBy: { issuedAt: 'desc' },
    })
    if (existing) {
      issued.push(existing)
      continue
    }
    const revoked = await tx.issuedCredential.findFirst({
      where: { studentId, ruleId: rule.id, status: 'revoked' },
      orderBy: { issuedAt: 'desc' },
    })
    const issuedAt = new Date()
    issued.push(
      await tx.issuedCredential.create({
        data: {
          studentId,
          courseId,
          ruleId: rule.id,
          templateId: rule.templateId,
          kind: rule.kind,
          verificationCode: randomBytes(16).toString('hex'),
          supersedesCredentialId: revoked?.id,
          issuedById,
          issuedAt,
          payloadJson: {
            learner: {
              id: student.id,
              nickname: student.nickname,
              level: student.level,
            },
            course,
            kind: rule.kind,
            template: {
              id: rule.template.id,
              code: rule.template.code,
              version: rule.template.version,
              name: rule.template.name,
              layout: rule.template.layoutJson,
            },
            eligibility: {
              completionPercent,
              completedAt: completedAt?.toISOString() ?? null,
              questProgressIds: completed.map((row) => row.id),
              passedAssessmentAttemptId: passedAttempt?.id ?? null,
              competencySnapshotIds: snapshots
                .filter((snapshot) => requiredSkillLevels[snapshot.skillId])
                .map((snapshot) => snapshot.id),
            },
            issuedAt: issuedAt.toISOString(),
          },
        },
      }),
    )
  }
  return issued
}
