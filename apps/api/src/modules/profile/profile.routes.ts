import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PROFILE_MODULES } from '@aikids/domain'
import {
  requireRole,
  requireUser,
} from '../../infrastructure/session/session.js'
import {
  getMyProfileSettings,
  getProfileProjection,
  updateMyProfileSettings,
} from './profile.service.js'

const audiences = ['friends', 'family', 'school'] as const

function registerRoutes(app: FastifyInstance, prefix: string) {
  app.get(`${prefix}/profiles/me/settings`, async (request) => {
    const child = requireRole(request, ['student'])
    return { settings: await getMyProfileSettings(child.id) }
  })

  app.put(`${prefix}/profiles/me/settings`, async (request) => {
    const child = requireRole(request, ['student'])
    const body = z
      .object({
        enabled: z.boolean(),
        visibility: z.array(z.enum(audiences)).max(3),
        modules: z.array(z.enum(PROFILE_MODULES)).max(PROFILE_MODULES.length),
      })
      .parse(request.body)
    return {
      settings: await updateMyProfileSettings({
        childId: child.id,
        ...body,
      }),
    }
  })

  app.get(`${prefix}/profiles/:slug`, async (request) => {
    const viewer = requireUser(request)
    const { slug } = z
      .object({ slug: z.string().trim().min(1).max(80) })
      .parse(request.params)
    return getProfileProjection(slug, viewer)
  })
}

export async function profileRoutes(app: FastifyInstance) {
  registerRoutes(app, '/api')
  registerRoutes(app, '/api/v1')
}
