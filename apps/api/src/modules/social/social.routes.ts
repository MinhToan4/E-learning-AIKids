import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { isValidFriendCode, normalizeFriendCode } from '@aikids/domain'
import { requireRole } from '../../infrastructure/session/session.js'
import {
  acceptFriendInvite,
  blockChild,
  createFriendInvite,
  listChildConnections,
  listChildInvites,
  listParentReviewInvites,
  removeConnection,
  reviewFriendInvite,
  setFavoriteConnection,
  unblockChild,
} from './social.service.js'

const idParams = z.object({ id: z.string().uuid() })
const childParams = z.object({ childId: z.string().uuid() })

function registerRoutes(app: FastifyInstance, prefix: string) {
  app.post(`${prefix}/social/invites`, async (request, reply) => {
    const child = requireRole(request, ['student'])
    const result = await createFriendInvite(child.id)
    request.log.info(
      { childId: child.id, inviteId: result.invite.id },
      'social.invite_created',
    )
    return reply.code(201).send({
      invite: {
        id: result.invite.id,
        code: result.code,
        status: result.invite.status,
        expiresAt: result.invite.expiresAt,
      },
    })
  })

  app.post(`${prefix}/social/invites/accept`, async (request) => {
    const child = requireRole(request, ['student'])
    const body = z
      .object({
        code: z
          .string()
          .transform(normalizeFriendCode)
          .refine(isValidFriendCode),
      })
      .parse(request.body)
    const invite = await acceptFriendInvite(child.id, body.code)
    request.log.info(
      { childId: child.id, inviteId: invite.id },
      'social.invite_accepted',
    )
    return { invite }
  })

  app.get(`${prefix}/social/invites`, async (request) => {
    const child = requireRole(request, ['student'])
    return { invites: await listChildInvites(child.id) }
  })

  app.get(`${prefix}/social/invites/pending`, async (request) => {
    const parent = requireRole(request, ['parent'])
    return { invites: await listParentReviewInvites(parent.id) }
  })

  app.post(`${prefix}/social/invites/:id/approve`, async (request) => {
    const parent = requireRole(request, ['parent'])
    const { id } = idParams.parse(request.params)
    const body = z
      .object({ decision: z.enum(['approved', 'declined']) })
      .parse(request.body)
    const result = await reviewFriendInvite({
      parentId: parent.id,
      inviteId: id,
      decision: body.decision,
    })
    request.log.info(
      {
        parentId: parent.id,
        inviteId: id,
        decision: body.decision,
      },
      'social.invite_reviewed',
    )
    return result
  })

  app.get(`${prefix}/social/connections`, async (request) => {
    const child = requireRole(request, ['student'])
    return { connections: await listChildConnections(child.id) }
  })

  app.put(`${prefix}/social/connections/:id/favorite`, async (request) => {
    const child = requireRole(request, ['student'])
    const { id } = idParams.parse(request.params)
    const { favorite } = z
      .object({ favorite: z.boolean() })
      .parse(request.body)
    return {
      favorite: await setFavoriteConnection({
        childId: child.id,
        connectionId: id,
        favorite,
      }),
    }
  })

  app.delete(`${prefix}/social/connections/:id`, async (request, reply) => {
    const child = requireRole(request, ['student'])
    const { id } = idParams.parse(request.params)
    await removeConnection(child.id, id)
    return reply.code(204).send()
  })

  app.post(`${prefix}/social/blocks`, async (request, reply) => {
    const child = requireRole(request, ['student'])
    const { childId } = z
      .object({ childId: z.string().uuid() })
      .parse(request.body)
    const block = await blockChild(child.id, childId)
    request.log.info(
      { blockerChildId: child.id, blockedChildId: childId },
      'social.child_blocked',
    )
    return reply.code(201).send({ block })
  })

  app.delete(`${prefix}/social/blocks/:childId`, async (request, reply) => {
    const child = requireRole(request, ['student'])
    const { childId } = childParams.parse(request.params)
    await unblockChild(child.id, childId)
    return reply.code(204).send()
  })
}

export async function socialRoutes(app: FastifyInstance) {
  registerRoutes(app, '/api')
  registerRoutes(app, '/api/v1')
}
