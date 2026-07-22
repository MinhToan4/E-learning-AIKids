import type { FastifyInstance } from 'fastify'
import { can, resolveStations } from '@aikids/domain'
import { z } from 'zod'
import { prisma } from '../../infrastructure/database/prisma.js'
import { requireUser } from '../../infrastructure/session/session.js'

const recognitionSchema = z.object({
  issuer: z.string().min(1),
  credential: z.string().min(1),
  finalAssessment: z.string().min(1),
  frameworks: z.array(
    z.object({ code: z.string().min(1), title: z.string().min(1) }),
  ),
  disclaimer: z.string().min(1),
})

export function parseCourseRecognition(raw?: string | null) {
  if (!raw) return null
  try {
    const parsed = recognitionSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

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
  ageTrack?: string
  courseKey?: string
  durationLabel: string
  productLabel: string
  status: string
  recommended: boolean
  skillsJson: string
  outcomesJson?: string | null
  recognitionJson?: string | null
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
    ageTrack: c.ageTrack ?? 'L1',
    courseKey: c.courseKey ?? 'K1',
    durationLabel: c.durationLabel,
    productLabel: c.productLabel,
    status: c.status,
    recommended: c.recommended,
    skills: JSON.parse(c.skillsJson) as string[],
    outcomes,
    recognition: parseCourseRecognition(c.recognitionJson),
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
  stage?: string
  videoUrl?: string | null
  goalsJson: string
  learnCardsJson: string
  checkJson: string
  chipsJson: string | null
  stationsJson?: string | null
}) {
  const stations = resolveStations(
    q.stationsJson,
    q.practiceKind,
    q.videoUrl,
  )
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
    stage: q.stage ?? stations.stage,
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
    stations,
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

    const q = request.query as { ageTrack?: string; track?: string }
    const ageTrack = (q.ageTrack ?? q.track ?? '').toUpperCase()
    const where =
      ageTrack === 'L1' || ageTrack === 'L2'
        ? {
            ageTrack,
            id: { startsWith: `${ageTrack.toLowerCase()}-` },
          }
        : {
            OR: [
              { id: { startsWith: 'l1-' } },
              { id: { startsWith: 'l2-' } },
            ],
          }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        quests: {
          where: { archived: false },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            order: true,
            title: true,
            accent: true,
            practiceKind: true,
            stage: true,
          },
        },
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

    const mapped = courses.map((c) => ({
      ...mapCourse(c),
      questCount: c.quests.length,
      quests: c.quests,
      enrolled: enrolledIds.has(c.id),
    }))

    return {
      courses: mapped,
      tracks: {
        L1: {
          label: '8–9 tuổi',
          count: mapped.filter((c) => c.ageTrack === 'L1').length,
        },
        L2: {
          label: '10–11 tuổi',
          count: mapped.filter((c) => c.ageTrack === 'L2').length,
        },
      },
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
      include: {
        quests: { where: { archived: false }, orderBy: { order: 'asc' } },
      },
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
    if (!quest || quest.archived) {
      const err = new Error('Not found') as Error & { statusCode: number }
      err.statusCode = 404
      throw err
    }
    return { quest: mapQuest(quest) }
  })
}
