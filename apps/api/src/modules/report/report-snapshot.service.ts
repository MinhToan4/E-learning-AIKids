import { prisma } from '../../infrastructure/database/prisma.js'

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

export async function buildLearningReportSnapshot(input: {
  studentId: string
  periodStart: Date
  periodEnd: Date
}) {
  const [
    student,
    enrollments,
    progressRows,
    attempts,
    competency,
    projects,
    observations,
    credentials,
  ] = await prisma.$transaction([
    prisma.user.findFirstOrThrow({
      where: { id: input.studentId, role: 'student' },
      select: {
        id: true,
        nickname: true,
        avatarId: true,
        ageBand: true,
        level: true,
      },
    }),
    prisma.enrollment.findMany({
      where: { userId: input.studentId },
      include: {
        course: {
          include: {
            quests: {
              where: { archived: false },
              orderBy: { order: 'asc' },
              select: { id: true, title: true, order: true },
            },
          },
        },
      },
    }),
    prisma.questProgress.findMany({
      where: { userId: input.studentId },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.assessmentAttempt.findMany({
      where: {
        studentId: input.studentId,
        submittedAt: { gte: input.periodStart, lt: input.periodEnd },
      },
      orderBy: { submittedAt: 'desc' },
      include: {
        assessmentVersion: {
          include: {
            assessment: {
              select: { id: true, title: true, courseId: true, kind: true },
            },
          },
        },
      },
    }),
    prisma.competencySnapshot.findMany({
      where: { studentId: input.studentId, current: true },
      orderBy: { computedAt: 'desc' },
      include: {
        skill: { include: { domain: true } },
        evidenceLinks: {
          include: {
            evidence: {
              select: {
                id: true,
                evidenceType: true,
                sourceType: true,
                sourceId: true,
                scorePercent: true,
                occurredAt: true,
              },
            },
          },
        },
      },
    }),
    prisma.project.findMany({
      where: {
        userId: input.studentId,
        updatedAt: { gte: input.periodStart, lt: input.periodEnd },
      },
      orderBy: { updatedAt: 'desc' },
      take: 12,
      select: {
        id: true,
        title: true,
        kind: true,
        thumbnail: true,
        updatedAt: true,
      },
    }),
    prisma.teacherObservation.findMany({
      where: {
        studentId: input.studentId,
        status: 'published',
        publishedAt: { gte: input.periodStart, lt: input.periodEnd },
      },
      orderBy: { publishedAt: 'desc' },
      include: {
        teacher: { select: { id: true, nickname: true } },
        course: { select: { id: true, title: true } },
      },
    }),
    prisma.issuedCredential.findMany({
      where: {
        studentId: input.studentId,
        issuedAt: { gte: input.periodStart, lt: input.periodEnd },
      },
      orderBy: { issuedAt: 'desc' },
      include: {
        course: { select: { id: true, title: true } },
        template: { select: { name: true } },
      },
    }),
  ])
  const progressByQuest = new Map(
    progressRows.map((progress) => [progress.questId, progress]),
  )
  const courseRows = enrollments.map((enrollment) => {
    const quests = enrollment.course.quests.map((quest) => ({
      id: quest.id,
      title: quest.title,
      order: quest.order,
      status: progressByQuest.get(quest.id)?.status ?? 'not_started',
      stars: progressByQuest.get(quest.id)?.stars ?? 0,
      updatedAt:
        progressByQuest.get(quest.id)?.updatedAt.toISOString() ?? null,
    }))
    const completed = quests.filter(
      (quest) => quest.status === 'completed',
    ).length
    const nextQuest = quests.find((quest) => quest.status !== 'completed')
    return {
      id: enrollment.course.id,
      title: enrollment.course.title,
      shortTitle: enrollment.course.shortTitle,
      completedLessons: completed,
      totalLessons: quests.length,
      completionPercent:
        quests.length > 0 ? Math.round((completed / quests.length) * 100) : 0,
      completedInPeriod: quests.filter(
        (quest) =>
          quest.status === 'completed' &&
          quest.updatedAt !== null &&
          new Date(quest.updatedAt) >= input.periodStart &&
          new Date(quest.updatedAt) < input.periodEnd,
      ),
      pendingLessons: quests.filter(
        (quest) => quest.status !== 'completed',
      ),
      nextQuest: nextQuest
        ? { id: nextQuest.id, title: nextQuest.title }
        : null,
    }
  })
  const strengths = [
    ...new Set(
      observations.flatMap((observation) =>
        stringList(observation.strengthsJson),
      ),
    ),
  ]
  const development = [
    ...new Set(
      observations.flatMap((observation) =>
        stringList(observation.developmentJson),
      ),
    ),
  ]
  const nextSteps = courseRows.flatMap((course) =>
    course.nextQuest
      ? [`${course.shortTitle}: ${course.nextQuest.title}`]
      : [],
  )
  return {
    generatedAt: new Date().toISOString(),
    period: {
      start: input.periodStart.toISOString(),
      end: input.periodEnd.toISOString(),
    },
    student,
    courses: courseRows,
    assessments: attempts.map((attempt) => ({
      id: attempt.id,
      assessment: attempt.assessmentVersion.assessment,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      scorePercent:
        attempt.status === 'published' ? attempt.scorePercent : null,
      passed: attempt.status === 'published' ? attempt.passed : null,
      submittedAt: attempt.submittedAt?.toISOString() ?? null,
      publishedAt: attempt.publishedAt?.toISOString() ?? null,
    })),
    competency: competency.map((snapshot) => ({
      id: snapshot.id,
      domain: {
        id: snapshot.skill.domain.id,
        code: snapshot.skill.domain.code,
        name: snapshot.skill.domain.name,
      },
      skill: {
        id: snapshot.skill.id,
        code: snapshot.skill.code,
        name: snapshot.skill.name,
        learnerLabel: snapshot.skill.learnerLabel,
      },
      level: snapshot.level,
      scorePercent: snapshot.scorePercent,
      evidenceCount: snapshot.evidenceCount,
      computedAt: snapshot.computedAt.toISOString(),
      evidence: snapshot.evidenceLinks.map(({ evidence }) => ({
        ...evidence,
        occurredAt: evidence.occurredAt.toISOString(),
      })),
    })),
    portfolio: projects.map((project) => ({
      ...project,
      updatedAt: project.updatedAt.toISOString(),
    })),
    teacherFeedback: observations.map((observation) => ({
      id: observation.id,
      body: observation.body,
      strengths: stringList(observation.strengthsJson),
      development: stringList(observation.developmentJson),
      teacher: observation.teacher,
      course: observation.course,
      publishedAt: observation.publishedAt?.toISOString() ?? null,
    })),
    strengths,
    development,
    nextSteps,
    credentials: credentials.map((credential) => ({
      id: credential.id,
      kind: credential.kind,
      name: credential.template.name,
      status: credential.status,
      course: credential.course,
      verificationCode: credential.verificationCode,
      issuedAt: credential.issuedAt.toISOString(),
    })),
  }
}
