import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../infrastructure/database/prisma.js'
import { requireRole } from '../../infrastructure/session/session.js'

const scalar = z.union([z.string().max(1000), z.number().finite(), z.boolean(), z.null()])
const eventSchema = z.object({
  type: z.string().regex(/^[a-z][a-z0-9_.-]{1,63}$/),
  payload: z.record(z.string().max(80), scalar).refine(
    (value) => JSON.stringify(value).length <= 8_000,
    'Payload is too large',
  ),
})

export async function realtimeRoutes(app: FastifyInstance) {
  app.post('/api/realtime/classrooms/:classId/events', async (request, reply) => {
    const user = requireRole(request, ['teacher', 'admin'])
    const { classId } = z.object({ classId: z.string().uuid() }).parse(request.params)
    const body = eventSchema.parse(request.body)
    const classroom = await prisma.classRoom.findFirst({
      where: {
        id: classId,
        status: 'active',
        ...(user.role === 'admin' ? {} : { teacherId: user.id }),
      },
      select: { id: true, teacherId: true },
    })
    if (!classroom) return reply.code(404).send({ error: 'Classroom not found' })
    const { publishClassroomEvent } = await import('./firestore-realtime.service.js')
    const eventId = await publishClassroomEvent({
      classId,
      teacherId: classroom.teacherId,
      type: body.type,
      payload: body.payload,
    })
    return reply.code(202).send({ eventId })
  })
}
