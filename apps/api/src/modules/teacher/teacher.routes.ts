import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { can, teacherOwnsClass } from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'
import { requireRole } from '../../infrastructure/session/session.js'

const lectureBodySchema = z.object({
  title: z.string().min(1).max(120).optional(),
  skill: z.string().min(1).max(200).optional(),
  reward: z.string().min(1).max(120).optional(),
  duration: z.string().min(1).max(40).optional(),
  hook: z.string().min(1).max(400).optional(),
  accent: z.string().min(1).max(20).optional(),
  practiceKind: z
    .enum([
      'intro',
      'character',
      'style',
      'chips',
      'story',
      'detective',
      'comic',
      'video',
      'journal',
      'palette',
      'match',
      'drag',
      'spin',
      'sketch',
      'ai_pick',
      'reflect',
    ])
    .optional(),
  /** HTTPS lecture video URL — stored in SQL, never hardcoded in FE catalog */
  videoUrl: z
    .union([z.string().url().max(2000), z.literal(''), z.null()])
    .optional(),
  goals: z.array(z.string().max(200)).max(12).optional(),
  concept: z.string().max(2000).optional(),
  example: z.string().max(2000).optional(),
  gameType: z.enum(['match', 'drag', 'spin', 'sort', 'order', 'detective', 'pick']).optional(),
  gameInstruction: z.string().min(10).max(500).optional(),
  gameOutcome: z.string().min(5).max(300).optional(),
  gameCards: z.array(z.string().min(2).max(80)).min(2).max(8).optional(),
  practiceInstruction: z.string().min(10).max(800).optional(),
  product: z.string().min(3).max(300).optional(),
  checkQuestion: z.string().min(5).max(500).optional(),
  checkOptions: z.array(z.string().min(1).max(240)).length(3).optional(),
  correctIndex: z.number().int().min(0).max(2).optional(),
  checkExplain: z.string().min(5).max(500).optional(),
  order: z.number().int().min(1).max(100).optional(),
})

type JsonRecord = Record<string, unknown>

function parseRecord(value: string | null): JsonRecord {
  if (!value) return {}
  try {
    const parsed: unknown = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as JsonRecord)
      : {}
  } catch {
    return {}
  }
}

function parseRecords(value: string | null): JsonRecord[] {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is JsonRecord => Boolean(item) && typeof item === 'object')
      : []
  } catch {
    return []
  }
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function lectureEditorDetail(quest: {
  goalsJson: string
  learnCardsJson: string
  checkJson: string
  stationsJson: string | null
}) {
  const cards = parseRecords(quest.learnCardsJson)
  const checks = parseRecords(quest.checkJson)
  const stationEnvelope = parseRecord(quest.stationsJson)
  const stations = Array.isArray(stationEnvelope.stations)
    ? stationEnvelope.stations.filter((item): item is JsonRecord => Boolean(item) && typeof item === 'object')
    : []
  const game = stations.find((station) => station.kind === 'game') ?? {}
  const practice = stations.find((station) => station.kind === 'practice') ?? {}
  const gameConfig = game.gameConfig && typeof game.gameConfig === 'object'
    ? (game.gameConfig as JsonRecord)
    : {}
  const firstCheck = checks[0] ?? {}

  let goals: string[] = []
  try {
    const parsed: unknown = JSON.parse(quest.goalsJson)
    goals = stringList(parsed)
  } catch {
    goals = []
  }

  return {
    goals,
    concept: stringValue(cards[0]?.body),
    example: stringValue(cards[1]?.body),
    gameType: stringValue(game.gameType) || 'pick',
    gameInstruction: stringValue(game.instruction),
    gameOutcome: stringValue(game.outcome),
    gameCards: stringList(gameConfig.cards),
    practiceInstruction: stringValue(practice.instruction),
    product: stringValue(practice.product),
    checkQuestion: stringValue(firstCheck.question),
    checkOptions: stringList(firstCheck.options),
    correctIndex: typeof firstCheck.correctIndex === 'number' ? firstCheck.correctIndex : 0,
    checkExplain: stringValue(firstCheck.explain),
  }
}

function learnCardsJson(questId: string, concept: string, example: string) {
  return JSON.stringify([
    {
      id: `${questId}-concept`,
      title: 'Ý chính',
      body: concept,
      tip: 'Làm chậm, không sao nếu thử lại.',
      kind: 'concept',
    },
    {
      id: `${questId}-example`,
      title: 'Ví dụ',
      body: example,
      tip: 'Chọn đáp án vui và an toàn.',
      kind: 'example',
    },
    {
      id: `${questId}-safety`,
      title: 'An toàn',
      body: 'Không dùng tên thật hay thông tin cá nhân.',
      tip: 'Biệt danh là đủ!',
      kind: 'safety',
    },
  ])
}

function defaultCheckJson(skill: string) {
  return JSON.stringify([
    {
      id: 'q1',
      question: `Con nhớ gì về: ${skill}?`,
      options: ['Không cần học gì cả', skill, 'Chỉ cần copy người khác'],
      correctIndex: 1,
      explain: 'Làm tốt lắm! Con hiểu rồi.',
    },
    {
      id: 'q2',
      question: 'Khi AI vẽ sai, con nên làm gì?',
      options: [
        'Tức giận với máy',
        'Thử lại với mô tả rõ hơn',
        'Đưa email của mình cho AI',
      ],
      correctIndex: 1,
      explain: 'AI có thể sai — con là người kiểm tra và chỉnh lại!',
    },
  ])
}

export async function teacherRoutes(app: FastifyInstance) {
  app.get('/api/teacher/class', async (request) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'class:read')) {
      const err = new Error('Forbidden') as Error & { statusCode: number }
      err.statusCode = 403
      throw err
    }

    const classroom =
      user.role === 'admin'
        ? await prisma.classRoom.findFirst({
            include: {
              students: {
                select: {
                  id: true,
                  nickname: true,
                  avatarId: true,
                  level: true,
                  xp: true,
                  onboarded: true,
                },
              },
            },
          })
        : await prisma.classRoom.findFirst({
            where: { teacherId: user.id },
            include: {
              students: {
                select: {
                  id: true,
                  nickname: true,
                  avatarId: true,
                  level: true,
                  xp: true,
                  onboarded: true,
                },
              },
            },
          })

    if (!classroom) {
      return { class: null, students: [] }
    }

    const studentIds = classroom.students.map((student) => student.id)
    const completedMap = new Map<string, number>()
    const starsMap = new Map<string, number>()
    const projectsMap = new Map<string, number>()
    if (studentIds.length > 0) {
      // Keep database concurrency bounded: class size must not multiply queries.
      const completedByStudent = await prisma.questProgress.groupBy({
        by: ['userId'],
        orderBy: { userId: 'asc' },
        where: { userId: { in: studentIds }, status: 'completed' },
        _count: { id: true },
      })
      const starsByStudent = await prisma.questProgress.groupBy({
        by: ['userId'],
        orderBy: { userId: 'asc' },
        where: { userId: { in: studentIds } },
        _sum: { stars: true },
      })
      const projectsByStudent = await prisma.project.groupBy({
        by: ['userId'],
        orderBy: { userId: 'asc' },
        where: { userId: { in: studentIds } },
        _count: { id: true },
      })
      completedByStudent.forEach((row) =>
        completedMap.set(row.userId, row._count.id),
      )
      starsByStudent.forEach((row) =>
        starsMap.set(row.userId, row._sum.stars ?? 0),
      )
      projectsByStudent.forEach((row) =>
        projectsMap.set(row.userId, row._count.id),
      )
    }
    const summaries = classroom.students.map((student) => ({
      ...student,
      completedQuests: completedMap.get(student.id) ?? 0,
      totalStars: starsMap.get(student.id) ?? 0,
      projectCount: projectsMap.get(student.id) ?? 0,
    }))

    return {
      class: {
        id: classroom.id,
        name: classroom.name,
        code: classroom.code,
      },
      students: summaries,
    }
  })

  /** Create or update teacher-owned classroom */
  app.post('/api/teacher/class', async (request, reply) => {
    const user = requireRole(request, ['teacher'])
    if (!can(user.role, 'class:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        name: z.string().min(2).max(80),
        code: z
          .string()
          .min(3)
          .max(16)
          .regex(/^[A-Za-z0-9-]+$/, 'Mã lớp chỉ gồm chữ, số, gạch'),
      })
      .parse(request.body)

    const code = body.code.toUpperCase()
    const ownClass = await prisma.classRoom.findFirst({
      where: { teacherId: user.id },
    })
    const codeOwner = await prisma.classRoom.findUnique({ where: { code } })
    if (codeOwner && codeOwner.teacherId !== user.id) {
      return reply.code(409).send({ error: 'Class code already taken' })
    }

    // One class per teacher: update name/code if exists, else create
    const classroom = ownClass
      ? await prisma.classRoom.update({
          where: { id: ownClass.id },
          data: { name: body.name, code },
        })
      : await prisma.classRoom.create({
          data: {
            name: body.name,
            code,
            teacherId: user.id,
          },
        })

    return reply.code(ownClass ? 200 : 201).send({
      class: {
        id: classroom.id,
        name: classroom.name,
        code: classroom.code,
      },
    })
  })

  /** List courses + lectures (with videoUrl) for CMS */
  app.get('/api/teacher/lectures', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'course:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const courseId = (request.query as { courseId?: string }).courseId
    const courses = await prisma.course.findMany({
      where: courseId ? { id: courseId } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: {
        quests: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            courseId: true,
            order: true,
            title: true,
            skill: true,
            reward: true,
            duration: true,
            hook: true,
            accent: true,
            practiceKind: true,
            videoUrl: true,
            stage: true,
            archived: true,
            goalsJson: true,
            learnCardsJson: true,
            checkJson: true,
            stationsJson: true,
          },
        },
      },
    })
    return {
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        shortTitle: c.shortTitle,
        status: c.status,
        ageTrack: c.ageTrack,
        courseKey: c.courseKey,
        ageLabel: c.ageLabel,
        lectures: c.quests.map((quest) => ({
          id: quest.id,
          courseId: quest.courseId,
          order: quest.order,
          title: quest.title,
          skill: quest.skill,
          reward: quest.reward,
          duration: quest.duration,
          hook: quest.hook,
          accent: quest.accent,
          practiceKind: quest.practiceKind,
          videoUrl: quest.videoUrl,
          stage: quest.stage,
          archived: quest.archived,
          ...lectureEditorDetail(quest),
        })),
      })),
    }
  })

  /** Update lecture fields including videoUrl */
  app.patch('/api/teacher/lectures/:questId', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'lecture:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { questId } = request.params as { questId: string }
    const body = lectureBodySchema.parse(request.body)

    const quest = await prisma.quest.findUnique({ where: { id: questId } })
    if (!quest) return reply.code(404).send({ error: 'Not found' })

    const videoUrl =
      body.videoUrl === undefined
        ? undefined
        : body.videoUrl === '' || body.videoUrl === null
          ? null
          : body.videoUrl

    const currentEditor = lectureEditorDetail(quest)
    const data: Record<string, unknown> = {}
    if (body.title !== undefined) data.title = body.title
    if (body.skill !== undefined) data.skill = body.skill
    if (body.reward !== undefined) data.reward = body.reward
    if (body.duration !== undefined) data.duration = body.duration
    if (body.hook !== undefined) data.hook = body.hook
    if (body.accent !== undefined) data.accent = body.accent
    if (body.practiceKind !== undefined) data.practiceKind = body.practiceKind
    if (body.order !== undefined) data.order = body.order
    if (videoUrl !== undefined) data.videoUrl = videoUrl
    if (body.goals !== undefined) data.goalsJson = JSON.stringify(body.goals)
    if (body.concept !== undefined || body.example !== undefined) {
      const concept = body.concept ?? currentEditor.concept
      const example = body.example ?? currentEditor.example
      data.learnCardsJson = learnCardsJson(questId, concept, example)
    }

    const changesGame = body.gameType !== undefined || body.gameInstruction !== undefined ||
      body.gameOutcome !== undefined || body.gameCards !== undefined
    const changesPractice = body.practiceInstruction !== undefined || body.product !== undefined ||
      body.practiceKind !== undefined
    if (changesGame || changesPractice || videoUrl !== undefined || body.concept !== undefined) {
      const envelope = parseRecord(quest.stationsJson)
      const rawStations = Array.isArray(envelope.stations)
        ? envelope.stations.filter((item): item is JsonRecord => Boolean(item) && typeof item === 'object')
        : []
      // Legacy courses may predate stationsJson. Editing one upgrades it to the
      // same four-station contract used by newly created curriculum content.
      const baseStations = rawStations.length > 0 ? rawStations : [
        { id: 'st-video', kind: 'video', title: 'Khám phá nhiệm vụ', durationMin: 5 },
        { id: 'st-game', kind: 'game', title: 'Chơi để hiểu bài', durationMin: 7 },
        { id: 'st-practice', kind: 'practice', title: 'Xưởng sáng tạo', durationMin: 15 },
        { id: 'st-check', kind: 'check', title: 'Thử tài và giải thích', durationMin: 5 },
      ]
      const stations = baseStations.map((station) => {
        if (station.kind === 'video') {
          return {
            ...station,
            ...(body.concept !== undefined ? { content: body.concept } : {}),
            ...(videoUrl !== undefined ? { videoUrl } : {}),
          }
        }
        if (station.kind === 'game') {
          return {
            ...station,
            gameType: body.gameType ?? currentEditor.gameType,
            instruction: body.gameInstruction ?? currentEditor.gameInstruction,
            outcome: body.gameOutcome ?? currentEditor.gameOutcome,
            gameConfig: { cards: body.gameCards ?? currentEditor.gameCards },
          }
        }
        if (station.kind === 'practice') {
          return {
            ...station,
            practiceKind: body.practiceKind ?? quest.practiceKind,
            instruction: body.practiceInstruction ?? currentEditor.practiceInstruction,
            product: body.product ?? currentEditor.product,
          }
        }
        return station
      })
      const practiceKind = body.practiceKind ?? quest.practiceKind
      data.stationsJson = JSON.stringify({
        ...envelope,
        stage: ['ai_pick', 'chips', 'video'].includes(practiceKind) ? 'produce' : 'ideate',
        stations,
      })
    }

    if (
      body.checkQuestion !== undefined || body.checkOptions !== undefined ||
      body.correctIndex !== undefined || body.checkExplain !== undefined
    ) {
      const checks = parseRecords(quest.checkJson)
      const current = checks[0] ?? {}
      const updatedCheck = {
        ...current,
        id: stringValue(current.id) || 'q1',
        question: body.checkQuestion ?? stringValue(current.question),
        options: body.checkOptions ?? stringList(current.options),
        correctIndex:
          body.correctIndex ?? (typeof current.correctIndex === 'number' ? current.correctIndex : 0),
        explain: body.checkExplain ?? stringValue(current.explain),
      }
      data.checkJson = JSON.stringify([updatedCheck, ...checks.slice(1)])
    }

    const updated = await prisma.quest.update({
      where: { id: questId },
      data,
      select: {
        id: true,
        courseId: true,
        order: true,
        title: true,
        skill: true,
        reward: true,
        duration: true,
        hook: true,
        accent: true,
        practiceKind: true,
        videoUrl: true,
        goalsJson: true,
        learnCardsJson: true,
        checkJson: true,
        stationsJson: true,
      },
    })

    return { lecture: { ...updated, ...lectureEditorDetail(updated) } }
  })

  /** Create a new lecture/quest under a course */
  app.post('/api/teacher/lectures', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'lecture:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        courseId: z.string().min(1).max(80),
        id: z
          .string()
          .min(2)
          .max(80)
          .regex(/^[a-z0-9-]+$/, 'id slug: a-z, 0-9, hyphen'),
        title: z.string().min(1).max(120),
        skill: z.string().min(1).max(200),
        reward: z.string().min(1).max(120).default('Huy hiệu mới'),
        duration: z.string().min(1).max(40).default('8–10 phút'),
        hook: z.string().min(1).max(400),
        accent: z.string().min(1).max(20).default('#6d5efc'),
        practiceKind: z
          .enum([
            'intro',
            'character',
            'style',
            'chips',
            'story',
            'detective',
            'comic',
            'video',
            'journal',
            'palette',
            'match',
            'drag',
            'spin',
            'sketch',
            'ai_pick',
            'reflect',
          ])
          .default('intro'),
        videoUrl: z.string().url().max(2000).optional().nullable(),
        goals: z.array(z.string().min(2).max(200)).min(1).max(12),
        concept: z.string().min(10).max(2000),
        example: z.string().min(5).max(2000),
        gameType: z
          .enum(['match', 'drag', 'spin', 'sort', 'order', 'detective', 'pick'])
          .default('pick'),
        gameInstruction: z.string().min(10).max(500),
        gameOutcome: z.string().min(5).max(300),
        gameCards: z.array(z.string().min(2).max(80)).min(2).max(8),
        practiceInstruction: z.string().min(10).max(800),
        product: z.string().min(3).max(300),
        checkQuestion: z.string().min(5).max(500),
        checkOptions: z.array(z.string().min(1).max(240)).length(3),
        correctIndex: z.number().int().min(0).max(2),
        checkExplain: z.string().min(5).max(500),
        order: z.number().int().min(1).max(100).optional(),
      })
      .parse(request.body)

    const course = await prisma.course.findUnique({
      where: { id: body.courseId },
    })
    if (!course) return reply.code(404).send({ error: 'Course not found' })

    const existing = await prisma.quest.findUnique({ where: { id: body.id } })
    if (existing) {
      return reply.code(409).send({ error: 'Lecture id already exists' })
    }

    const maxOrder = await prisma.quest.aggregate({
      where: { courseId: body.courseId },
      _max: { order: true },
    })
    const order = body.order ?? (maxOrder._max.order ?? 0) + 1

    const created = await prisma.quest.create({
      data: {
        id: body.id,
        courseId: body.courseId,
        order,
        title: body.title,
        skill: body.skill,
        reward: body.reward,
        duration: body.duration,
        hook: body.hook,
        accent: body.accent,
        practiceKind: body.practiceKind,
        videoUrl: body.videoUrl ?? null,
        goalsJson: JSON.stringify(body.goals),
        learnCardsJson: learnCardsJson(body.id, body.concept, body.example),
        checkJson: JSON.stringify([
          {
            id: 'q1',
            question: body.checkQuestion,
            options: body.checkOptions,
            correctIndex: body.correctIndex,
            explain: body.checkExplain,
          },
          ...JSON.parse(defaultCheckJson(body.skill)).slice(1),
        ]),
        chipsJson: null,
        stationsJson: JSON.stringify({
          stage:
            body.practiceKind === 'ai_pick' ||
            body.practiceKind === 'chips' ||
            body.practiceKind === 'video'
              ? 'produce'
              : 'ideate',
          stations: [
            {
              id: 'st-video',
              kind: 'video',
              title: 'Khám phá nhiệm vụ',
              durationMin: 5,
              content: body.concept,
              videoUrl: body.videoUrl ?? null,
            },
            {
              id: 'st-game',
              kind: 'game',
              title: 'Chơi để hiểu bài',
              durationMin: 7,
              gameType: body.gameType,
              instruction: body.gameInstruction,
              outcome: body.gameOutcome,
              gameConfig: { cards: body.gameCards },
            },
            {
              id: 'st-practice',
              kind: 'practice',
              title: 'Xưởng sáng tạo',
              durationMin: 15,
              practiceKind: body.practiceKind,
              instruction: body.practiceInstruction,
              product: body.product,
            },
            {
              id: 'st-check',
              kind: 'check',
              title: 'Thử tài và giải thích',
              durationMin: 5,
            },
          ],
        }),
      },
      select: {
        id: true,
        courseId: true,
        order: true,
        title: true,
        skill: true,
        videoUrl: true,
        practiceKind: true,
      },
    })

    return reply.code(201).send({ lecture: created })
  })

  /** Enroll student into teacher's class by nickname */
  app.post('/api/teacher/class/students', async (request, reply) => {
    const user = requireRole(request, ['teacher'])
    if (!can(user.role, 'class:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        nickname: z.string().min(1).max(16),
      })
      .parse(request.body)

    const classroom = await prisma.classRoom.findFirst({
      where: { teacherId: user.id },
    })
    if (!classroom || !teacherOwnsClass(user.id, classroom.teacherId)) {
      return reply.code(404).send({ error: 'No class found for teacher' })
    }

    const student = await prisma.user.findFirst({
      where: { role: 'student', nickname: body.nickname.trim() },
    })
    if (!student) {
      return reply.code(404).send({ error: 'Student not found' })
    }

    const updated = await prisma.user.update({
      where: { id: student.id },
      data: { classId: classroom.id },
      select: {
        id: true,
        nickname: true,
        classId: true,
        level: true,
        xp: true,
      },
    })
    return { student: updated }
  })

  // ── Remove student from class ───────────────────────────────
  app.delete('/api/teacher/class/students/:studentId', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    const { studentId } = request.params as { studentId: string }

    const student = await prisma.user.findUnique({ where: { id: studentId } })
    if (!student || student.role !== 'student') {
      return reply.code(404).send({ error: 'Không tìm thấy học sinh.' })
    }
    if (!student.classId) {
      return reply.code(400).send({ error: 'Học sinh chưa thuộc lớp nào.' })
    }

    const classroom = await prisma.classRoom.findUnique({ where: { id: student.classId } })
    if (!classroom || !teacherOwnsClass(user.id, classroom.teacherId)) {
      return reply.code(403).send({ error: 'Không phải lớp của bạn.' })
    }

    await prisma.user.update({
      where: { id: studentId },
      data: { classId: null },
    })

    return { message: 'Đã xóa học sinh khỏi lớp.' }
  })

  // ── Student progress detail ─────────────────────────────────
  app.get('/api/teacher/students/:studentId/progress', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    const { studentId } = request.params as { studentId: string }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true, nickname: true, avatarId: true, level: true, xp: true,
        classId: true, onboarded: true, goal: true,
      },
    })
    if (!student || !student.classId) {
      return reply.code(404).send({ error: 'Không tìm thấy học sinh.' })
    }

    // Verify teacher owns the class
    const classroom = await prisma.classRoom.findUnique({ where: { id: student.classId } })
    if (!classroom || (!teacherOwnsClass(user.id, classroom.teacherId) && user.role !== 'admin')) {
      return reply.code(403).send({ error: 'Không phải lớp của bạn.' })
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: studentId },
      include: { course: { select: { id: true, title: true, shortTitle: true } } },
    })

    const progress = await prisma.questProgress.findMany({
      where: { userId: studentId },
      include: { quest: { select: { id: true, title: true, courseId: true, order: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const achievements = await prisma.achievement.findMany({
      where: { userId: studentId },
    })

    const streak = await prisma.dailyStreak.findUnique({
      where: { userId: studentId },
    })

    return {
      student,
      enrollments: enrollments.map((e) => ({
        courseId: e.courseId,
        courseTitle: e.course.title,
        enrolledAt: e.createdAt,
      })),
      progress: progress.map((p) => ({
        questId: p.questId,
        questTitle: p.quest.title,
        courseId: p.quest.courseId,
        order: p.quest.order,
        status: p.status,
        phase: p.phase,
        stars: p.stars,
        xpEarned: p.xpEarned,
      })),
      achievements: achievements.map((a) => ({
        type: a.type,
        unlockedAt: a.unlockedAt,
      })),
      streak: streak ? { current: streak.current, longest: streak.longest } : null,
    }
  })

  // ── Teacher profile (GET + PATCH) ───────────────────────────
  app.get('/api/teacher/profile', async (request) => {
    const user = requireRole(request, ['teacher'])
    let profile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
    })
    if (!profile) {
      profile = await prisma.teacherProfile.create({
        data: { userId: user.id, displayName: user.nickname },
      })
    }
    return {
      profile: {
        displayName: profile.displayName,
        bio: profile.bio,
        subjects: profile.subjects,
        languages: profile.languages,
        verificationStatus: profile.verificationStatus,
      },
    }
  })

  app.patch('/api/teacher/profile', async (request) => {
    const user = requireRole(request, ['teacher'])
    const body = z.object({
      displayName: z.string().min(1).max(80).optional(),
      bio: z.string().max(500).optional(),
      subjects: z.array(z.string().max(40)).max(10).optional(),
      languages: z.array(z.enum(['vi', 'en'])).optional(),
    }).parse(request.body)

    const profile = await prisma.teacherProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        displayName: body.displayName ?? user.nickname,
        bio: body.bio,
        subjects: body.subjects,
        languages: body.languages,
      },
      update: {
        displayName: body.displayName,
        bio: body.bio,
        subjects: body.subjects,
        languages: body.languages,
      },
    })

    return {
      profile: {
        displayName: profile.displayName,
        bio: profile.bio,
        subjects: profile.subjects,
        languages: profile.languages,
        verificationStatus: profile.verificationStatus,
      },
    }
  })

  // ── Create new course ───────────────────────────────────────
  app.post('/api/teacher/courses', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'course:write')) {
      return reply.code(403).send({ error: 'Không có quyền.' })
    }

    const body = z.object({
      id: z.string().min(3).max(40).regex(/^[a-z0-9-]+$/),
      title: z.string().min(1).max(120),
      shortTitle: z.string().min(1).max(40),
      tagline: z.string().min(1).max(200),
      description: z.string().min(1).max(2000),
      coverFrom: z.string().min(1).max(20),
      coverTo: z.string().min(1).max(20),
      accent: z.string().min(1).max(20),
      ageLabel: z.string().min(1).max(20).default('8-11'),
      durationLabel: z.string().min(1).max(40).default('4 tuần'),
      productLabel: z.string().min(3).max(240),
      ageTrack: z.enum(['L1', 'L2']).default('L1'),
      courseKey: z.enum(['K1', 'K2', 'K3', 'K4', 'K5', 'K6']).default('K1'),
      skills: z.array(z.string().min(2).max(120)).min(1).max(12),
      outcomes: z.array(z.string().min(2).max(240)).min(1).max(12),
      credential: z.string().min(3).max(200),
      finalAssessment: z.string().min(10).max(500),
    }).parse(request.body)

    const existing = await prisma.course.findUnique({ where: { id: body.id } })
    if (existing) {
      return reply.code(409).send({ error: 'ID khóa học đã tồn tại.' })
    }

    const maxSort = await prisma.course.aggregate({ _max: { sortOrder: true } })
    const course = await prisma.course.create({
      data: {
        id: body.id,
        title: body.title,
        shortTitle: body.shortTitle,
        tagline: body.tagline,
        description: body.description,
        coverFrom: body.coverFrom,
        coverTo: body.coverTo,
        accent: body.accent,
        ageLabel: body.ageLabel,
        ageTrack: body.ageTrack,
        courseKey: body.courseKey,
        durationLabel: body.durationLabel,
        productLabel: body.productLabel,
        skillsJson: JSON.stringify(body.skills),
        outcomesJson: JSON.stringify(body.outcomes),
        recognitionJson: JSON.stringify({
          issuer: 'AI Kids Creator Academy',
          credential: body.credential,
          finalAssessment: body.finalAssessment,
          frameworks: [],
          disclaimer:
            'Đây là ghi nhận hoàn thành nội bộ của AI Kids Creator Academy, không phải chứng nhận của cơ quan quản lý nhà nước.',
        }),
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
        status: 'soon',
      },
    })

    return reply.code(201).send({ course })
  })

  // ── Patch course metadata ───────────────────────────────────
  app.patch('/api/teacher/courses/:courseId', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'course:write')) {
      return reply.code(403).send({ error: 'Không có quyền.' })
    }
    const { courseId } = request.params as { courseId: string }
    const body = z
      .object({
        title: z.string().min(1).max(120).optional(),
        shortTitle: z.string().min(1).max(40).optional(),
        tagline: z.string().min(1).max(200).optional(),
        description: z.string().min(1).max(2000).optional(),
        status: z.enum(['open', 'soon']).optional(),
        ageLabel: z.string().min(1).max(20).optional(),
        ageTrack: z.enum(['L1', 'L2']).optional(),
        courseKey: z
          .enum(['K1', 'K2', 'K3', 'K4', 'K5', 'K6'])
          .optional(),
        durationLabel: z.string().min(1).max(40).optional(),
        productLabel: z.string().min(1).max(40).optional(),
        accent: z.string().min(1).max(20).optional(),
        recommended: z.boolean().optional(),
      })
      .parse(request.body)

    const existing = await prisma.course.findUnique({ where: { id: courseId } })
    if (!existing) return reply.code(404).send({ error: 'Không tìm thấy khóa.' })

    if (body.status === 'open') {
      const activeQuestCount = await prisma.quest.count({
        where: { courseId, archived: false },
      })
      let skills: unknown = []
      let outcomes: unknown = []
      let recognition: Record<string, unknown> = {}
      try {
        skills = JSON.parse(existing.skillsJson)
        outcomes = JSON.parse(existing.outcomesJson)
        recognition = JSON.parse(existing.recognitionJson) as Record<string, unknown>
      } catch {
        // The validation below returns one safe, actionable publishing error.
      }
      if (
        activeQuestCount === 0 ||
        !Array.isArray(skills) ||
        skills.length === 0 ||
        !Array.isArray(outcomes) ||
        outcomes.length === 0 ||
        typeof recognition.credential !== 'string' ||
        typeof recognition.finalAssessment !== 'string'
      ) {
        return reply.code(409).send({
          error:
            'Khóa học chưa đủ điều kiện xuất bản. Hãy thêm bài học, kỹ năng, kết quả đầu ra và cách đánh giá cuối khóa.',
          code: 'COURSE_NOT_READY',
        })
      }
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: body.title,
        shortTitle: body.shortTitle,
        tagline: body.tagline,
        description: body.description,
        status: body.status,
        ageLabel: body.ageLabel,
        ageTrack: body.ageTrack,
        courseKey: body.courseKey,
        durationLabel: body.durationLabel,
        productLabel: body.productLabel,
        accent: body.accent,
        recommended: body.recommended,
      },
    })
    return { course }
  })

  // ── Soft-archive lecture (hide from students) ───────────────
  app.delete('/api/teacher/lectures/:questId', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'lecture:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { questId } = request.params as { questId: string }
    const quest = await prisma.quest.findUnique({ where: { id: questId } })
    if (!quest) return reply.code(404).send({ error: 'Not found' })

    const progressCount = await prisma.questProgress.count({
      where: { questId, status: 'completed' },
    })

    // Soft-archive always (preserve progress history)
    const updated = await prisma.quest.update({
      where: { id: questId },
      data: { archived: true },
      select: {
        id: true,
        courseId: true,
        title: true,
        archived: true,
        order: true,
      },
    })

    return {
      lecture: updated,
      message:
        progressCount > 0
          ? 'Đã ẩn bài giảng (soft-archive). Tiến trình học sinh được giữ.'
          : 'Đã ẩn bài giảng khỏi học sinh.',
    }
  })

  // ── Restore archived lecture ────────────────────────────────
  app.post('/api/teacher/lectures/:questId/restore', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'lecture:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { questId } = request.params as { questId: string }
    const quest = await prisma.quest.findUnique({ where: { id: questId } })
    if (!quest) return reply.code(404).send({ error: 'Not found' })
    const updated = await prisma.quest.update({
      where: { id: questId },
      data: { archived: false },
      select: { id: true, title: true, archived: true },
    })
    return { lecture: updated }
  })

  // ── Reorder lectures within a course ────────────────────────
  app.post('/api/teacher/lectures/reorder', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'lecture:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const body = z
      .object({
        courseId: z.string().min(1).max(80),
        orderedQuestIds: z.array(z.string().min(1).max(80)).min(1).max(100),
      })
      .parse(request.body)

    const quests = await prisma.quest.findMany({
      where: { courseId: body.courseId },
      select: { id: true },
    })
    const idSet = new Set(quests.map((q) => q.id))
    for (const id of body.orderedQuestIds) {
      if (!idSet.has(id)) {
        return reply
          .code(400)
          .send({ error: `Quest ${id} không thuộc khóa ${body.courseId}` })
      }
    }

    // Two-phase update to avoid unique(courseId, order) collisions
    await prisma.$transaction(async (tx) => {
      let i = 0
      for (const id of body.orderedQuestIds) {
        await tx.quest.update({
          where: { id },
          data: { order: 10000 + i },
        })
        i += 1
      }
      i = 1
      for (const id of body.orderedQuestIds) {
        await tx.quest.update({
          where: { id },
          data: { order: i },
        })
        i += 1
      }
    })

    const lectures = await prisma.quest.findMany({
      where: { courseId: body.courseId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        order: true,
        title: true,
        archived: true,
      },
    })
    return { lectures }
  })

  // ── Class progress snapshot (stats tab) ─────────────────────
  app.get('/api/teacher/class/stats', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    if (!can(user.role, 'progress:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const classroom =
      user.role === 'admin'
        ? await prisma.classRoom.findFirst({
            include: {
              students: {
                where: { active: true },
                select: { id: true, nickname: true, xp: true, level: true },
              },
            },
          })
        : await prisma.classRoom.findFirst({
            where: { teacherId: user.id },
            include: {
              students: {
                where: { active: true },
                select: { id: true, nickname: true, xp: true, level: true },
              },
            },
          })

    if (!classroom) {
      return { stats: null, message: 'Chưa có lớp' }
    }

    const studentIds = classroom.students.map((s) => s.id)
    // Sequential aggregate queries avoid exhausting small production pools.
    const completed = await prisma.questProgress.count({
      where: { userId: { in: studentIds }, status: 'completed' },
    })
    const totalQuests = await prisma.quest.count({ where: { archived: false } })
    const projects = await prisma.project.count({
      where: { userId: { in: studentIds } },
    })
    const completedByStudent = await prisma.questProgress.groupBy({
      by: ['userId'],
      orderBy: { userId: 'asc' },
      where: { userId: { in: studentIds }, status: 'completed' },
      _count: { id: true },
    })
    const progressActivity = await prisma.questProgress.findMany({
      where: { userId: { in: studentIds } },
      orderBy: { updatedAt: 'desc' },
      select: {
        userId: true,
        status: true,
        phase: true,
        updatedAt: true,
        quest: { select: { title: true } },
      },
    })

    const completedMap = new Map<string, number>()
    completedByStudent.forEach((row) =>
      completedMap.set(row.userId, row._count.id),
    )
    const latestMap = new Map<string, (typeof progressActivity)[number]>()
    progressActivity.forEach((row) => {
      if (!latestMap.has(row.userId)) latestMap.set(row.userId, row)
    })
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const perStudent = classroom.students.map((student) => {
      const latest = latestMap.get(student.id)
      const needsSupport = !latest ||
        (latest.status !== 'completed' && latest.updatedAt.getTime() < sevenDaysAgo)
      return {
        id: student.id,
        nickname: student.nickname,
        level: student.level,
        xp: student.xp,
        completedQuests: completedMap.get(student.id) ?? 0,
        currentQuest: latest?.quest.title ?? null,
        currentPhase: latest?.phase ?? null,
        lastActiveAt: latest?.updatedAt.toISOString() ?? null,
        needsSupport,
        supportReason: !latest
          ? 'Chưa bắt đầu nhiệm vụ đầu tiên'
          : needsSupport
            ? 'Đang dở một nhiệm vụ hơn 7 ngày'
            : null,
      }
    })

    return {
      stats: {
        className: classroom.name,
        code: classroom.code,
        studentCount: classroom.students.length,
        totalCompletedQuests: completed,
        openQuestCount: totalQuests,
        projectCount: projects,
        students: perStudent.sort((a, b) => {
          if (a.needsSupport !== b.needsSupport) return a.needsSupport ? -1 : 1
          return (a.nickname ?? '').localeCompare(b.nickname ?? '', 'vi')
        }),
      },
    }
  })
}
