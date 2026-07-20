import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { can } from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'
import { requireRole, requireUser } from '../../infrastructure/session/session.js'

export async function portfolioRoutes(app: FastifyInstance) {
  app.get('/api/backpack', async (request) => {
    const user = requireUser(request)
    if (!can(user.role, 'portfolio:read')) {
      const err = new Error('Forbidden') as Error & { statusCode: number }
      err.statusCode = 403
      throw err
    }

    let ownerId = user.id
    if (user.role === 'parent') {
      const q = request.query as { childId?: string }
      if (!q.childId) {
        const err = new Error('childId required') as Error & { statusCode: number }
        err.statusCode = 400
        throw err
      }
      const child = await prisma.user.findFirst({
        where: { id: q.childId, parentId: user.id },
      })
      if (!child) {
        const err = new Error('Forbidden') as Error & { statusCode: number }
        err.statusCode = 403
        throw err
      }
      ownerId = child.id
    }

    const assets = await prisma.asset.findMany({
      where: { userId: ownerId },
      orderBy: { createdAt: 'desc' },
    })
    return {
      assets: assets.map((a) => ({
        id: a.id,
        type: a.type,
        name: a.name,
        questId: a.questId,
        thumbnail: a.thumbnail,
        private: a.private,
        meta: a.metaJson ? JSON.parse(a.metaJson) : null,
        createdAt: a.createdAt,
      })),
    }
  })

  app.get('/api/projects', async (request) => {
    const user = requireUser(request)
    if (!can(user.role, 'portfolio:read')) {
      const err = new Error('Forbidden') as Error & { statusCode: number }
      err.statusCode = 403
      throw err
    }

    let ownerId = user.id
    if (user.role === 'parent') {
      const q = request.query as { childId?: string }
      if (!q.childId) {
        const err = new Error('childId required') as Error & { statusCode: number }
        err.statusCode = 400
        throw err
      }
      const child = await prisma.user.findFirst({
        where: { id: q.childId, parentId: user.id },
      })
      if (!child) {
        const err = new Error('Forbidden') as Error & { statusCode: number }
        err.statusCode = 403
        throw err
      }
      ownerId = child.id
    }

    const projects = await prisma.project.findMany({
      where: { userId: ownerId },
      orderBy: { updatedAt: 'desc' },
    })
    return {
      projects: projects.map((p) => ({
        id: p.id,
        title: p.title,
        kind: p.kind,
        thumbnail: p.thumbnail,
        private: p.private,
        shareStatus: p.shareStatus,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    }
  })

  app.post('/api/projects/:projectId/request-share', async (request, reply) => {
    const user = requireRole(request, ['student'])
    if (!can(user.role, 'approval:request')) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    const { projectId } = request.params as { projectId: string }
    const body = z
      .object({
        destination: z.enum(['family', 'class']).default('family'),
      })
      .parse(request.body ?? {})

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: user.id },
    })
    if (!project) return reply.code(404).send({ error: 'Not found' })

    const approval = await prisma.approval.create({
      data: {
        projectId: project.id,
        childId: user.id,
        parentId: user.parentId,
        destination: body.destination,
        status: 'pending',
      },
    })

    await prisma.project.update({
      where: { id: project.id },
      data: { shareStatus: 'pending' },
    })

    return reply.code(201).send({
      approval: {
        id: approval.id,
        status: approval.status,
        destination: approval.destination,
      },
    })
  })
}
