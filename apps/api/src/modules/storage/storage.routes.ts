import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { env } from '../../config/env.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import { requireUser } from '../../infrastructure/session/session.js'
import { buildObjectPath, validateUpload } from './storage-policy.js'

const createUploadSchema = z.object({
  purpose: z.enum(['avatar', 'portfolio', 'classroom']),
  fileName: z.string().trim().min(1).max(180),
  mime: z.string().trim().min(3).max(100),
  size: z.number().int().positive(),
  questId: z.string().max(120).optional(),
  projectId: z.string().uuid().optional(),
})

export async function storageRoutes(app: FastifyInstance) {
  app.post('/api/storage/uploads', {
    config: {
      rateLimit: {
        max: env.generationRateLimitMax,
        timeWindow: '1 minute',
      },
    },
  }, async (request, reply) => {
    const user = requireUser(request)
    const body = createUploadSchema.parse(request.body)
    validateUpload(body)
    if (body.purpose === 'classroom' && !['teacher', 'admin'].includes(user.role)) {
      return reply.code(403).send({ error: 'Forbidden' })
    }
    if (!env.firebaseEnabled || !env.firebaseStorageBucket) {
      return reply.code(503).send({ error: 'Direct upload is not configured' })
    }
    if (body.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: body.projectId, userId: user.id },
        select: { id: true },
      })
      if (!project) return reply.code(404).send({ error: 'Project not found' })
    }

    const id = randomUUID()
    const objectPath = buildObjectPath({
      userId: user.id,
      objectId: id,
      purpose: body.purpose,
      mime: body.mime,
    })
    const row = await prisma.storageObject.create({
      data: {
        id,
        userId: user.id,
        objectPath,
        bucket: env.firebaseStorageBucket,
        purpose: body.purpose,
        fileName: body.fileName,
        mime: body.mime,
        size: body.size,
        questId: body.questId,
        projectId: body.projectId,
      },
      select: { id: true, objectPath: true, status: true },
    })
    try {
      const { createSignedUploadUrl } = await import('./firebase-storage.service.js')
      const signed = await createSignedUploadUrl({ objectPath, mime: body.mime })
      return reply.code(201).send({ upload: row, ...signed, requiredHeaders: { 'Content-Type': body.mime } })
    } catch (error) {
      await prisma.storageObject.delete({ where: { id } }).catch(() => undefined)
      throw error
    }
  })

  app.post('/api/storage/uploads/:id/finalize', async (request, reply) => {
    const user = requireUser(request)
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const row = await prisma.storageObject.findFirst({ where: { id, userId: user.id } })
    if (!row) return reply.code(404).send({ error: 'Not found' })
    if (row.status === 'ready') {
      const { createSignedReadUrl } = await import('./firebase-storage.service.js')
      return { upload: row, read: await createSignedReadUrl(row.objectPath) }
    }
    if (row.size === null) return reply.code(409).send({ error: 'Upload size is missing' })

    const { verifyUploadedObject, createSignedReadUrl } = await import('./firebase-storage.service.js')
    await verifyUploadedObject({
      objectPath: row.objectPath,
      expectedMime: row.mime,
      expectedSize: row.size,
      purpose: row.purpose as 'avatar' | 'portfolio' | 'classroom',
    })
    const upload = await prisma.storageObject.update({
      where: { id: row.id },
      data: { status: 'ready', readyAt: new Date() },
    })
    return { upload, read: await createSignedReadUrl(row.objectPath) }
  })

  app.get('/api/storage/uploads/:id/read-url', async (request, reply) => {
    const user = requireUser(request)
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const row = await prisma.storageObject.findFirst({
      where: { id, userId: user.id, status: 'ready' },
      select: { objectPath: true },
    })
    if (!row) return reply.code(404).send({ error: 'Not found' })
    const { createSignedReadUrl } = await import('./firebase-storage.service.js')
    return createSignedReadUrl(row.objectPath)
  })
}
