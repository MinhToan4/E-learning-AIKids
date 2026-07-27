import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { can } from '@aikids/domain'
import { Prisma } from '../../generated/prisma/index.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import { requireRole, requireUser } from '../../infrastructure/session/session.js'

async function serializable<T>(work: () => Promise<T>): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await work()
    } catch (error) {
      lastError = error
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== 'P2034'
      ) {
        throw error
      }
    }
  }
  throw lastError
}

function ownedStoryContent(
  kind: string,
  dataJson: string | null,
): string | null {
  if (kind !== 'creative_story' || !dataJson) return null
  try {
    const data = JSON.parse(dataJson) as { content?: unknown }
    return typeof data.content === 'string' ? data.content : null
  } catch {
    return null
  }
}

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

    const page = z.object({
      limit: z.coerce.number().int().min(1).max(100).default(40),
      cursor: z.string().uuid().optional(),
      childId: z.string().uuid().optional(),
    }).parse(request.query)
    const assets = await prisma.asset.findMany({
      where: { userId: ownerId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: page.limit + 1,
      ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
    })
    const hasMore = assets.length > page.limit
    if (hasMore) assets.pop()
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
      nextCursor: hasMore ? assets.at(-1)?.id ?? null : null,
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

    const page = z.object({
      limit: z.coerce.number().int().min(1).max(100).default(40),
      cursor: z.string().uuid().optional(),
      childId: z.string().uuid().optional(),
    }).parse(request.query)
    const projects = await prisma.project.findMany({
      where: { userId: ownerId },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: page.limit + 1,
      ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
    })
    const hasMore = projects.length > page.limit
    if (hasMore) projects.pop()
    return {
      projects: projects.map((p) => ({
        id: p.id,
        title: p.title,
        kind: p.kind,
        thumbnail: p.thumbnail,
        content: ownedStoryContent(p.kind, p.dataJson),
        private: p.private,
        shareStatus: p.shareStatus,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      nextCursor: hasMore ? projects.at(-1)?.id ?? null : null,
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

    const result = await serializable(() =>
      prisma.$transaction(
        async (tx) => {
          const project = await tx.project.findFirst({
            where: { id: projectId, userId: user.id },
            select: { id: true },
          })
          if (!project) return null

          const pending = await tx.approval.findFirst({
            where: {
              projectId: project.id,
              childId: user.id,
              status: 'pending',
            },
            orderBy: { createdAt: 'desc' },
          })
          if (pending) return { approval: pending, created: false }

          const approval = await tx.approval.create({
            data: {
              projectId: project.id,
              childId: user.id,
              parentId: user.parentId,
              destination: body.destination,
              status: 'pending',
            },
          })
          await tx.project.update({
            where: { id: project.id },
            data: { shareStatus: 'pending' },
          })
          return { approval, created: true }
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      ),
    )
    if (!result) return reply.code(404).send({ error: 'Not found' })

    return reply.code(result.created ? 201 : 200).send({
      approval: {
        id: result.approval.id,
        status: result.approval.status,
        destination: result.approval.destination,
      },
    })
  })
}
