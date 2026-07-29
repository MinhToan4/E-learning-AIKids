import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  requireRole,
  requireUser,
} from '../../infrastructure/session/session.js'
import {
  getWorkspaceProjection,
  listPendingWorkspaceGrants,
  listWorkspaceGrants,
  reviewWorkspaceGrant,
  revokeWorkspaceGrant,
  updateWorkspaceGrants,
} from './workspace.service.js'

const audiences = ['friends', 'family', 'school'] as const
const projectParams = z.object({ id: z.string().uuid() })
const grantParams = z.object({
  id: z.string().uuid(),
  audience: z.enum(audiences),
})

function registerRoutes(app: FastifyInstance, prefix: string) {
  app.get(`${prefix}/workspaces/grants/pending`, async (request) => {
    const parent = requireRole(request, ['parent'])
    return { grants: await listPendingWorkspaceGrants(parent.id) }
  })

  app.get(`${prefix}/workspaces/:id/grants`, async (request) => {
    const child = requireRole(request, ['student'])
    const { id } = projectParams.parse(request.params)
    return { grants: await listWorkspaceGrants(child.id, id) }
  })

  app.put(`${prefix}/workspaces/:id/grants`, async (request) => {
    const child = requireRole(request, ['student'])
    const { id } = projectParams.parse(request.params)
    const body = z
      .object({
        grants: z
          .array(
            z.object({
              audience: z.enum(audiences),
              permission: z.enum(['view', 'remix']).default('view'),
            }),
          )
          .max(3),
      })
      .parse(request.body)
    return {
      grants: await updateWorkspaceGrants({
        childId: child.id,
        projectId: id,
        grants: body.grants,
      }),
    }
  })

  app.post(
    `${prefix}/workspaces/:id/grants/:audience/approve`,
    async (request) => {
      const parent = requireRole(request, ['parent'])
      const { id, audience } = grantParams.parse(request.params)
      const { decision } = z
        .object({ decision: z.enum(['approved', 'declined']) })
        .parse(request.body)
      return {
        grant: await reviewWorkspaceGrant({
          parentId: parent.id,
          projectId: id,
          audience,
          decision,
        }),
      }
    },
  )

  app.delete(
    `${prefix}/workspaces/:id/grants/:audience`,
    async (request, reply) => {
      const child = requireRole(request, ['student'])
      const { id, audience } = grantParams.parse(request.params)
      await revokeWorkspaceGrant({
        childId: child.id,
        projectId: id,
        audience,
      })
      return reply.code(204).send()
    },
  )

  app.get(`${prefix}/workspaces/:id`, async (request) => {
    const viewer = requireUser(request)
    const { id } = projectParams.parse(request.params)
    return getWorkspaceProjection(id, viewer)
  })
}

export async function workspaceRoutes(app: FastifyInstance) {
  registerRoutes(app, '/api')
  registerRoutes(app, '/api/v1')
}
