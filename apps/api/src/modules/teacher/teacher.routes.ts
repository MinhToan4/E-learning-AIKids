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
    const existing = await prisma.classRoom.findUnique({ where: { code } })
    if (existing && existing.teacherId !== user.id) {
      return reply.code(409).send({ error: 'Class code already taken' })
    }

    const classroom = existing
      ? await prisma.classRoom.update({
          where: { id: existing.id },
          data: { name: body.name },
        })
      : await prisma.classRoom.create({
          data: {
            name: body.name,
            code,
            teacherId: user.id,
          },
        })

    return reply.code(existing ? 200 : 201).send({
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
}
