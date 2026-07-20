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
  order: z.number().int().min(1).max(100).optional(),
})

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

    const summaries = await Promise.all(
      classroom.students.map(async (s) => {
        const completed = await prisma.questProgress.count({
          where: { userId: s.id, status: 'completed' },
        })
        const stars = await prisma.questProgress.aggregate({
          where: { userId: s.id },
          _sum: { stars: true },
        })
        const projects = await prisma.project.count({ where: { userId: s.id } })
        return {
          ...s,
          completedQuests: completed,
          totalStars: stars._sum.stars ?? 0,
          projectCount: projects,
        }
      }),
    )

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
        lectures: c.quests,
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
      const concept = body.concept ?? 'Nội dung bài giảng'
      const example = body.example ?? 'Ví dụ thực hành'
      data.learnCardsJson = learnCardsJson(questId, concept, example)
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
      },
    })

    return { lecture: updated }
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
        goals: z.array(z.string().max(200)).max(12).default([]),
        concept: z.string().max(2000).default('Nội dung bài giảng'),
        example: z.string().max(2000).default('Ví dụ thực hành'),
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
        checkJson: defaultCheckJson(body.skill),
        chipsJson: null,
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
      productLabel: z.string().min(1).max(40),
      skillsJson: z.string().default('[]'),
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
        ageTrack: body.ageLabel.includes('9') ? 'L2' : 'L1',
        durationLabel: body.durationLabel,
        productLabel: body.productLabel,
        skillsJson: body.skillsJson,
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
    const [completed, totalQuests, projects] = await Promise.all([
      prisma.questProgress.count({
        where: { userId: { in: studentIds }, status: 'completed' },
      }),
      prisma.quest.count({ where: { archived: false } }),
      prisma.project.count({ where: { userId: { in: studentIds } } }),
    ])

    const perStudent = await Promise.all(
      classroom.students.map(async (s) => {
        const done = await prisma.questProgress.count({
          where: { userId: s.id, status: 'completed' },
        })
        return {
          id: s.id,
          nickname: s.nickname,
          level: s.level,
          xp: s.xp,
          completedQuests: done,
        }
      }),
    )

    return {
      stats: {
        className: classroom.name,
        code: classroom.code,
        studentCount: classroom.students.length,
        totalCompletedQuests: completed,
        openQuestCount: totalQuests,
        projectCount: projects,
        students: perStudent.sort((a, b) => b.xp - a.xp),
      },
    }
  })
}
