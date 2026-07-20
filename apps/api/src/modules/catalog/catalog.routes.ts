import type { FastifyInstance } from 'fastify'
import { can } from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'
import { requireUser } from '../../infrastructure/session/session.js'

function mapCourse(c: {
  id: string
  title: string
  shortTitle: string
  tagline: string
  description: string
  coverFrom: string
  coverTo: string
  accent: string
  coverImage: string | null
  ageLabel: string
  durationLabel: string
  productLabel: string
  status: string
  recommended: boolean
  skillsJson: string
  outcomesJson?: string | null
  sortOrder: number
  quests?: Array<Record<string, unknown>>
}) {
  let outcomes: string[] = []
  try {
    outcomes = JSON.parse(c.outcomesJson || '[]') as string[]
  } catch {
    outcomes = []
  }
  return {
    id: c.id,
    title: c.title,
    shortTitle: c.shortTitle,
    tagline: c.tagline,
    description: c.description,
    coverFrom: c.coverFrom,
    coverTo: c.coverTo,
    accent: c.accent,
    coverImage: c.coverImage,
    ageLabel: c.ageLabel,
    durationLabel: c.durationLabel,
    productLabel: c.productLabel,
    status: c.status,
    recommended: c.recommended,
    skills: JSON.parse(c.skillsJson) as string[],
    outcomes,
    sortOrder: c.sortOrder,
    quests: c.quests,
  }
}

function mapQuest(q: {
  id: string
  courseId: string
  order: number
  title: string
  skill: string
  reward: string
  duration: string
  hook: string
  accent: string
  icon: string
  practiceKind: string
  videoUrl?: string | null
  goalsJson: string
  learnCardsJson: string
  checkJson: string
  chipsJson: string | null
}) {
  return {
    id: q.id,
    courseId: q.courseId,
    order: q.order,
    title: q.title,
    skill: q.skill,
    reward: q.reward,
    duration: q.duration,
    hook: q.hook,
    accent: q.accent,
    icon: q.icon,
    practiceKind: q.practiceKind,
    videoUrl: q.videoUrl ?? null,
    goals: JSON.parse(q.goalsJson) as string[],
    learnCards: JSON.parse(q.learnCardsJson) as unknown[],
    // Strip correctIndex from public check until submit — send options only for play
    check: (JSON.parse(q.checkJson) as Array<{
      id: string
      question: string
      options: string[]
      correctIndex: number
      explain: string
    }>).map(({ id, question, options }) => ({ id, question, options })),
    chips: q.chipsJson ? JSON.parse(q.chipsJson) : null,
  }
}

export async function courseRoutes(app: FastifyInstance) {
  app.get('/api/courses', async (request) => {
    const user = requireUser(request)
    if (!can(user.role, 'course:read')) {
      const err = new Error('Forbidden') as Error & { statusCode: number }
      err.statusCode = 403
      throw err
    }

    const courses = await prisma.course.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        quests: { orderBy: { order: 'asc' }, select: { id: true, order: true, title: true, accent: true, practiceKind: true } },
      },
    })

    let enrolledIds = new Set<string>()
    if (user.role === 'student') {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: user.id },
        select: { courseId: true },
      })
      enrolledIds = new Set(enrollments.map((e) => e.courseId))
    }

    return {
      courses: courses.map((c) => ({
        ...mapCourse(c),
        questCount: c.quests.length,
        quests: c.quests,
        enrolled: enrolledIds.has(c.id),
      })),
    }
  })

  app.get('/api/courses/:courseId', async (request) => {
    const user = requireUser(request)
    if (!can(user.role, 'course:read')) {
      const err = new Error('Forbidden') as Error & { statusCode: number }
      err.statusCode = 403
      throw err
    }
    const { courseId } = request.params as { courseId: string }
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { quests: { orderBy: { order: 'asc' } } },
    })
    if (!course) {
      const err = new Error('Not found') as Error & { statusCode: number }
      err.statusCode = 404
      throw err
    }
    return {
      course: {
        ...mapCourse(course),
        quests: course.quests.map(mapQuest),
      },
    }
  })

  app.get('/api/quests/:questId', async (request) => {
    const user = requireUser(request)
    if (!can(user.role, 'course:read')) {
      const err = new Error('Forbidden') as Error & { statusCode: number }
      err.statusCode = 403
      throw err
    }
    const { questId } = request.params as { questId: string }
    const quest = await prisma.quest.findUnique({ where: { id: questId } })
    if (!quest) {
      const err = new Error('Not found') as Error & { statusCode: number }
      err.statusCode = 404
      throw err
    }
    return { quest: mapQuest(quest) }
  })
}
