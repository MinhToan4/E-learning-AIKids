import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { REACTION_TYPES } from '@aikids/domain'
import { requireRole } from '../../infrastructure/session/session.js'
import {
  getSocialFeed,
  removeActivityReaction,
  setActivityReaction,
} from './activity.service.js'

const activityParams = z.object({ id: z.string().uuid() })
const reactionParams = z.object({
  id: z.string().uuid(),
  type: z.enum(REACTION_TYPES),
})

function registerRoutes(app: FastifyInstance, prefix: string) {
  app.get(`${prefix}/social/feed`, async (request) => {
    const child = requireRole(request, ['student'])
    const query = z
      .object({
        limit: z.coerce.number().int().min(1).max(50).default(20),
        cursor: z.string().uuid().optional(),
      })
      .parse(request.query)
    return getSocialFeed({
      viewerChildId: child.id,
      limit: query.limit,
      cursor: query.cursor,
    })
  })

  app.post(`${prefix}/social/activities/:id/reactions`, async (request) => {
    const child = requireRole(request, ['student'])
    const { id } = activityParams.parse(request.params)
    const { type } = z
      .object({ type: z.enum(REACTION_TYPES) })
      .parse(request.body)
    return {
      reaction: await setActivityReaction({
        actorChildId: child.id,
        activityId: id,
        type,
      }),
    }
  })

  app.delete(
    `${prefix}/social/activities/:id/reactions/:type`,
    async (request, reply) => {
      const child = requireRole(request, ['student'])
      const { id, type } = reactionParams.parse(request.params)
      await removeActivityReaction({
        actorChildId: child.id,
        activityId: id,
        type,
      })
      return reply.code(204).send()
    },
  )
}

export async function activityRoutes(app: FastifyInstance) {
  registerRoutes(app, '/api')
  registerRoutes(app, '/api/v1')
}
