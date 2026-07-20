import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { isNicknameSafe } from '@aikids/domain'
import { env } from '../../config/env.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import { hashPassword, verifyPassword } from '../../infrastructure/security/crypto.js'
import {
  createSession,
  destroySession,
  publicUser,
  requireUser,
} from '../../infrastructure/session/session.js'

const adultLoginSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(8).max(128),
})

const studentLoginSchema = z.object({
  nickname: z.string().min(1).max(16),
  avatarId: z.string().min(1).max(40),
  /** Create student row if missing — still gated by env.studentAutoCreate */
  createIfMissing: z.boolean().optional().default(true),
})

const registerAdultSchema = z.object({
  role: z.enum(['parent', 'teacher']),
  email: z.string().email().max(120),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Za-z]/, 'Cần chữ')
    .regex(/[0-9]/, 'Cần số'),
  nickname: z.string().min(1).max(40).optional(),
})

/** Resolve optional parent/class links from env config (not hardcoded emails). */
export async function resolveStudentDefaults(): Promise<{
  parentId: string | undefined
  classId: string | undefined
}> {
  let parentId: string | undefined
  let classId: string | undefined

  if (env.defaultParentEmail) {
    const parent = await prisma.user.findFirst({
      where: {
        role: 'parent',
        email: env.defaultParentEmail,
        active: true,
      },
    })
    parentId = parent?.id
  }

  if (env.defaultClassCode) {
    const classroom = await prisma.classRoom.findFirst({
      where: { code: env.defaultClassCode },
    })
    classId = classroom?.id
  }

  return { parentId, classId }
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/api/auth/login/adult', async (request, reply) => {
    const body = adultLoginSchema.parse(request.body)
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    })
    if (!user || !user.passwordHash || user.role === 'student') {
      return reply.code(401).send({ error: 'Email hoặc mật khẩu chưa đúng' })
    }
    if (user.active === false) {
      return reply.code(403).send({ error: 'Tài khoản đã bị vô hiệu hóa' })
    }
    const ok = await verifyPassword(body.password, user.passwordHash)
    if (!ok) {
      return reply.code(401).send({ error: 'Email hoặc mật khẩu chưa đúng' })
    }
    await createSession(user.id, reply)
    return { user: publicUser(user) }
  })

  app.post('/api/auth/register/adult', async (request, reply) => {
    const body = registerAdultSchema.parse(request.body)
    const email = body.email.toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return reply.code(409).send({ error: 'Email đã được dùng' })
    }
    const passwordHash = await hashPassword(body.password)
    const user = await prisma.user.create({
      data: {
        role: body.role,
        email,
        passwordHash,
        nickname: body.nickname ?? (body.role === 'parent' ? 'Phụ huynh' : 'Giáo viên'),
        onboarded: true,
        active: true,
      },
    })
    await createSession(user.id, reply)
    return reply.code(201).send({ user: publicUser(user) })
  })

  app.post('/api/auth/login/student', async (request, reply) => {
    const body = studentLoginSchema.parse(request.body)
    const safe = isNicknameSafe(body.nickname)
    if (!safe.ok) {
      return reply.code(400).send({ error: safe.message, reason: safe.reason })
    }

    let user = await prisma.user.findFirst({
      where: {
        role: 'student',
        nickname: body.nickname.trim(),
      },
    })

    if (!user && body.createIfMissing && env.studentAutoCreate) {
      const defaults = await resolveStudentDefaults()
      user = await prisma.user.create({
        data: {
          role: 'student',
          nickname: body.nickname.trim(),
          avatarId: body.avatarId,
          parentId: defaults.parentId,
          classId: defaults.classId,
          level: 1,
          xp: 0,
          onboarded: false,
          active: true,
        },
      })
    }

    if (!user) {
      return reply.code(404).send({ error: 'Không tìm thấy học viên' })
    }

    if (user.active === false) {
      return reply.code(403).send({ error: 'Tài khoản đã bị vô hiệu hóa' })
    }

    // Update avatar on re-login
    if (user.avatarId !== body.avatarId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatarId: body.avatarId },
      })
    }

    await createSession(user.id, reply)
    return { user: publicUser(user) }
  })

  app.post('/api/auth/logout', async (request, reply) => {
    await destroySession(request, reply)
    return { ok: true }
  })

  app.get('/api/auth/me', async (request, reply) => {
    if (!request.user) return reply.code(401).send({ error: 'Unauthorized' })
    return { user: request.user }
  })

  app.patch('/api/auth/me', async (request, reply) => {
    const user = requireUser(request)
    const body = z
      .object({
        onboarded: z.boolean().optional(),
        goal: z.enum(['comic', 'video', 'character']).nullable().optional(),
        nickname: z.string().min(1).max(16).optional(),
        avatarId: z.string().min(1).max(40).optional(),
      })
      .parse(request.body)

    if (body.nickname) {
      const safe = isNicknameSafe(body.nickname)
      if (!safe.ok) {
        return reply.code(400).send({ error: safe.message })
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        onboarded: body.onboarded,
        goal: body.goal === undefined ? undefined : body.goal,
        nickname: body.nickname,
        avatarId: body.avatarId,
      },
    })
    return { user: publicUser(updated) }
  })
}
