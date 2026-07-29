import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { REWARD_CATALOG, type RewardKind } from '@aikids/domain'
import { requireRole } from '../../infrastructure/session/session.js'
import {
  claimChapter,
  equipReward,
  getRewards,
  getStorybook,
} from './storybook.service.js'

const chapterParams = z.object({
  slug: z.string().trim().regex(/^P0[1-8]$/i),
})

const rewardKinds = [
  ...new Set(REWARD_CATALOG.map((item) => item.kind)),
] as [RewardKind, ...RewardKind[]]

const equipmentParams = z.object({
  kind: z.enum(rewardKinds),
})

const equipmentBody = z.object({
  rewardId: z.string().trim().min(1).nullable(),
})

function registerRoutes(app: FastifyInstance, prefix: string) {
  app.get(`${prefix}/storybook/me`, async (request) => {
    const user = requireRole(request, ['student'])
    return getStorybook(user.id, user.xp)
  })

  app.post(`${prefix}/storybook/chapters/:slug/claim`, async (request) => {
    const user = requireRole(request, ['student'])
    const { slug } = chapterParams.parse(request.params)
    return claimChapter(user.id, slug)
  })

  app.get(`${prefix}/rewards/me`, async (request) => {
    const user = requireRole(request, ['student'])
    return getRewards(user.id, user.xp)
  })

  app.put(`${prefix}/rewards/me/equipment/:kind`, async (request) => {
    const user = requireRole(request, ['student'])
    const { kind } = equipmentParams.parse(request.params)
    const { rewardId } = equipmentBody.parse(request.body)
    return {
      equipment: await equipReward({
        userId: user.id,
        kind,
        rewardId,
      }),
    }
  })
}

export async function storybookRoutes(app: FastifyInstance) {
  registerRoutes(app, '/api')
  registerRoutes(app, '/api/v1')
}
