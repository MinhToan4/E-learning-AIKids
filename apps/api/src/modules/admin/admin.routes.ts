import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { can, isAdultRole } from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'
import { hashPassword } from '../../infrastructure/security/crypto.js'
import { requireRole } from '../../infrastructure/session/session.js'

/**
 * Admin CMS: accounts + system overview.
 * Never returns password hashes.
 */
export async function adminRoutes(app: FastifyInstance) {
  app.get('/api/admin/system', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'system:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const [users, courses, quests, sessions, classes, approvals] =
      await Promise.all([
        prisma.user.groupBy({ by: ['role'], _count: true }),
        prisma.course.count(),
        prisma.quest.count(),
        prisma.session.count({
          where: { expiresAt: { gt: new Date() } },
        }),
        prisma.classRoom.count(),
        prisma.approval.count({ where: { status: 'pending' } }),
      ])

    return {
      system: {
        service: 'aikids-api',
        time: new Date().toISOString(),
        counts: {
          courses,
          quests,
          classes,
          activeSessions: sessions,
          pendingApprovals: approvals,
          usersByRole: Object.fromEntries(
            users.map((u) => [u.role, u._count]),
          ),
        },
      },
    }
  })

  app.get('/api/admin/users', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'user:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const q = request.query as { role?: string; take?: string }
    const take = Math.min(Number(q.take ?? 100) || 100, 200)
    const where = q.role ? { role: q.role } : {}

    const rows = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        role: true,
        email: true,
        nickname: true,
        avatarId: true,
        level: true,
        xp: true,
        onboarded: true,
        active: true,
        parentId: true,
        classId: true,
        createdAt: true,
      },
    })

    return { users: rows }
  })

  app.post('/api/admin/users', async (request, reply) => {
    const actor = requireRole(request, ['admin'])
    if (!can(actor.role, 'user:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const body = z
      .object({
        role: z.enum(['parent', 'teacher', 'admin', 'student']),
        email: z.string().email().max(120).optional(),
        password: z.string().min(8).max(128).optional(),
        nickname: z.string().min(1).max(40).optional(),
        parentId: z.string().optional(),
        classId: z.string().optional(),
        avatarId: z.string().max(40).optional(),
      })
      .parse(request.body)

    if (body.role !== 'student') {
      if (!body.email || !body.password) {
        return reply
          .code(400)
          .send({ error: 'Adult accounts require email and password' })
      }
      if (!isAdultRole(body.role)) {
        return reply.code(400).send({ error: 'Invalid adult role' })
      }
      const email = body.email.toLowerCase()
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return reply.code(409).send({ error: 'Email already in use' })
      }
      const passwordHash = await hashPassword(body.password)
      const created = await prisma.user.create({
        data: {
          role: body.role,
          email,
          passwordHash,
          nickname:
            body.nickname ??
            (body.role === 'admin'
              ? 'Quản trị'
              : body.role === 'teacher'
                ? 'Giáo viên'
                : 'Phụ huynh'),
          onboarded: true,
          active: true,
        },
      })
      return reply.code(201).send({
        user: {
          id: created.id,
          role: created.role,
          email: created.email,
          nickname: created.nickname,
          active: created.active,
        },
      })
    }

    // Student provisioning (admin)
    const created = await prisma.user.create({
      data: {
        role: 'student',
        nickname: body.nickname ?? 'HọcSinh',
        avatarId: body.avatarId ?? 'avatar-star',
        parentId: body.parentId,
        classId: body.classId,
        onboarded: false,
        active: true,
      },
    })
    return reply.code(201).send({
      user: {
        id: created.id,
        role: created.role,
        nickname: created.nickname,
        active: created.active,
        parentId: created.parentId,
        classId: created.classId,
      },
    })
  })

  app.patch('/api/admin/users/:id', async (request, reply) => {
    const actor = requireRole(request, ['admin'])
    if (!can(actor.role, 'user:write')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { id } = request.params as { id: string }
    const body = z
      .object({
        active: z.boolean().optional(),
        role: z.enum(['parent', 'teacher', 'admin', 'student']).optional(),
        nickname: z.string().min(1).max(40).optional(),
        parentId: z.string().nullable().optional(),
        classId: z.string().nullable().optional(),
      })
      .parse(request.body)

    // Prevent admin from locking themselves out mid-session
    if (id === actor.id && body.active === false) {
      return reply.code(400).send({ error: 'Cannot deactivate yourself' })
    }

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) return reply.code(404).send({ error: 'Not found' })

    const updated = await prisma.user.update({
      where: { id },
      data: {
        active: body.active,
        role: body.role,
        nickname: body.nickname,
        parentId: body.parentId === undefined ? undefined : body.parentId,
        classId: body.classId === undefined ? undefined : body.classId,
      },
      select: {
        id: true,
        role: true,
        email: true,
        nickname: true,
        active: true,
        parentId: true,
        classId: true,
      },
    })

    return { user: updated }
  })

  app.get('/api/admin/courses', async (request, reply) => {
    const user = requireRole(request, ['admin'])
    if (!can(user.role, 'course:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const courses = await prisma.course.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        quests: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            order: true,
            title: true,
            videoUrl: true,
            practiceKind: true,
          },
        },
      },
    })
    return {
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        questCount: c.quests.length,
        quests: c.quests,
      })),
    }
  })
}
