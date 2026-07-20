import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../infrastructure/database/prisma.js'
import { requireUser } from '../../infrastructure/session/session.js'

export async function notificationRoutes(app: FastifyInstance) {
  // ── List notifications (unread + recent) ────────────────────
  app.get('/api/notifications', async (request) => {
    const user = requireUser(request)
    const limit = Number((request.query as { limit?: string }).limit) || 20

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    })

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
}
