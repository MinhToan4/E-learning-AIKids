import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { can, parentOwnsChild } from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'
import { requireRole } from '../../infrastructure/session/session.js'

export async function parentRoutes(app: FastifyInstance) {
  app.get('/api/parent/children', async (request) => {
    const user = requireRole(request, ['parent'])
    const children = await prisma.user.findMany({
      where: { parentId: user.id, role: 'student' },
      orderBy: { createdAt: 'asc' },
    })

    const enriched = await Promise.all(
      children.map(async (c) => {
        const completed = await prisma.questProgress.count({
          where: { userId: c.id, status: 'completed' },
        })
        const stars = await prisma.questProgress.aggregate({
          where: { userId: c.id },
          _sum: { stars: true },
        })
        const projects = await prisma.project.count({ where: { userId: c.id } })
        return {
          id: c.id,
          nickname: c.nickname,
          avatarId: c.avatarId,
          level: c.level,
          xp: c.xp,
          onboarded: c.onboarded,
          completedQuests: completed,
          totalStars: stars._sum.stars ?? 0,
          projectCount: projects,
        }
      }),
    )

    return { children: enriched }
  })

  /** Progress for one linked child — isolation enforced */
  app.get('/api/parent/children/:childId/progress', async (request, reply) => {
    const user = requireRole(request, ['parent'])
    if (!can(user.role, 'progress:read')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { childId } = request.params as { childId: string }
    const child = await prisma.user.findUnique({ where: { id: childId } })
    if (!child || child.role !== 'student') {
      return reply.code(404).send({ error: 'Not found' })
    }
    if (!parentOwnsChild(user.id, child.parentId)) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const courseId =
      (request.query as { courseId?: string }).courseId ?? 'course-comic'

    const quests = await prisma.quest.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        order: true,
        title: true,
        skill: true,
        videoUrl: true,
      },
    })
    const progress = await prisma.questProgress.findMany({
      where: {
        userId: childId,
        questId: { in: quests.map((q) => q.id) },
      },
    })
    const byQuest = new Map(progress.map((p) => [p.questId, p]))

    return {
      child: {
        id: child.id,
        nickname: child.nickname,
        level: child.level,
        xp: child.xp,
      },
      courseId,
      quests: quests.map((q) => {
        const p = byQuest.get(q.id)
        return {
          id: q.id,
          order: q.order,
          title: q.title,
          skill: q.skill,
          videoUrl: q.videoUrl,
          status: p?.status ?? (q.order === 1 ? 'available' : 'locked'),
          stars: p?.stars ?? 0,
          phase: p?.phase ?? 'learn',
        }
      }),
    }
  })

  app.get('/api/parent/approvals', async (request) => {
    const user = requireRole(request, ['parent'])
    if (!can(user.role, 'approval:decide')) {
      const err = new Error('Forbidden') as Error & { statusCode: number }
      err.statusCode = 403
      throw err
    }

    const status = (request.query as { status?: string }).status ?? 'pending'
    const approvals = await prisma.approval.findMany({
      where: {
        OR: [
          { parentId: user.id },
          { parentId: null, child: { parentId: user.id } },
        ],
        status: status === 'all' ? undefined : status,
      },
      include: {
        project: true,
        child: { select: { id: true, nickname: true, avatarId: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      approvals: approvals.map((a) => ({
        id: a.id,
        status: a.status,
        destination: a.destination,
        note: a.note,
        createdAt: a.createdAt,
        project: {
          id: a.project.id,
          title: a.project.title,
          kind: a.project.kind,
          thumbnail: a.project.thumbnail,
          shareStatus: a.project.shareStatus,
        },
        child: a.child,
      })),
    }
  })

  app.post('/api/parent/approvals/:id/decide', async (request, reply) => {
    const user = requireRole(request, ['parent'])
    if (!can(user.role, 'approval:decide')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { id } = request.params as { id: string }
    const body = z
      .object({
        decision: z.enum(['approved', 'rejected']),
        note: z.string().max(200).optional(),
      })
      .parse(request.body)

    const approval = await prisma.approval.findUnique({
      where: { id },
      include: { child: true, project: true },
    })
    if (!approval) return reply.code(404).send({ error: 'Not found' })
    if (!parentOwnsChild(user.id, approval.child.parentId)) {
      return reply.code(403).send({ error: 'Forbidden' })
    }

    const updated = await prisma.approval.update({
      where: { id },
      data: {
        status: body.decision,
        note: body.note,
        parentId: user.id,
      },
    })

    await prisma.project.update({
      where: { id: approval.projectId },
      data: {
        shareStatus: body.decision === 'approved' ? 'shared' : 'private',
        private: body.decision !== 'approved',
      },
    })

    return {
      approval: {
        id: updated.id,
        status: updated.status,
        note: updated.note,
      },
      projectShareStatus:
        body.decision === 'approved' ? 'shared' : 'private',
    }
  })
}
