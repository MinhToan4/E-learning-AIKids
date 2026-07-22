import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { createHash } from 'node:crypto'
import { prisma } from '../../infrastructure/database/prisma.js'
import { requireUser } from '../../infrastructure/session/session.js'

export async function notificationRoutes(app: FastifyInstance) {
  // ── List notifications (unread + recent) ────────────────────
  app.get('/api/notifications', async (request) => {
    const user = requireUser(request)
    const limit = Math.min(50, Math.max(1, Number((request.query as { limit?: string }).limit) || 20))

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, type: true, title: true, body: true, read: true, data: true, createdAt: true },
      }),
      prisma.notification.count({ where: { userId: user.id, read: false } }),
    ])

    return { notifications, unreadCount }
  })

  // ── Mark one as read ────────────────────────────────────────
  app.patch('/api/notifications/:id/read', async (request, reply) => {
    const user = requireUser(request)
    const { id } = request.params as { id: string }

    const notif = await prisma.notification.findUnique({ where: { id } })
    if (!notif || notif.userId !== user.id) {
      return reply.code(404).send({ error: 'Không tìm thấy.' })
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    })

    return { ok: true }
  })

  // ── Mark all as read ────────────────────────────────────────
  app.post('/api/notifications/read-all', async (request) => {
    const user = requireUser(request)
    const result = await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    })
    return { marked: result.count }
  })

  const deviceSchema = z.object({
    token: z.string().trim().min(20).max(4096),
    platform: z.enum(['web', 'android', 'ios']).default('web'),
  })

  app.post('/api/notifications/devices', async (request, reply) => {
    const user = requireUser(request)
    const body = deviceSchema.parse(request.body)
    const tokenHash = createHash('sha256').update(body.token).digest('hex')
    const device = await prisma.pushDevice.upsert({
      where: { tokenHash },
      create: {
        userId: user.id,
        token: body.token,
        tokenHash,
        platform: body.platform,
        userAgent: request.headers['user-agent']?.slice(0, 500),
      },
      update: {
        userId: user.id,
        platform: body.platform,
        enabled: true,
        userAgent: request.headers['user-agent']?.slice(0, 500),
      },
      select: { id: true, platform: true, enabled: true, createdAt: true, updatedAt: true },
    })
    return reply.code(201).send({ device })
  })

  app.delete('/api/notifications/devices', async (request) => {
    const user = requireUser(request)
    const body = deviceSchema.pick({ token: true }).parse(request.body)
    const tokenHash = createHash('sha256').update(body.token).digest('hex')
    const result = await prisma.pushDevice.updateMany({
      where: { userId: user.id, tokenHash },
      data: { enabled: false },
    })
    return { disabled: result.count }
  })
}
