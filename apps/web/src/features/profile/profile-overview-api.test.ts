import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/lib/api'
import { loadProfileOverview } from './profile-overview-api'

const overviewPayload = {
  profile: {
    settings: {
      childProfileId: 'child-1',
      slug: 'bo',
      enabled: true,
      visibility: ['family'],
      modules: ['works'],
    },
  },
  gamification: {
    streak: 4,
    totalXp: 1200,
    level: 12,
    achievements: [],
  },
  recentProjects: [],
  media: { avatarChoices: [] },
  rewards: { equipment: [] },
}

describe('profile overview adapter', () => {
  it('loads the profile with one Ubuntu backend request', async () => {
    const request = vi.fn().mockResolvedValue(overviewPayload)
    await expect(loadProfileOverview(request)).resolves.toMatchObject({
      streak: 4,
      totalXp: 1200,
      level: 12,
    })
    expect(request).toHaveBeenCalledTimes(1)
    expect(request).toHaveBeenCalledWith('/api/v1/profile/overview')
  })

  it.each([404, 405, 501])(
    'uses legacy requests only when overview is unavailable (%s)',
    async (status) => {
      const request = vi.fn()
        .mockRejectedValueOnce(new ApiError(status, 'not implemented'))
        .mockResolvedValueOnce({ current: 2 })
        .mockResolvedValueOnce({ achievements: [] })
        .mockResolvedValueOnce({ projects: [] })
        .mockResolvedValueOnce({ assets: [] })
        .mockResolvedValueOnce({ totalXp: 100, level: 2 })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ equipment: [] })

      await expect(loadProfileOverview(request)).resolves.toMatchObject({
        streak: 2,
        totalXp: 100,
        level: 2,
      })
      expect(request).toHaveBeenCalledTimes(8)
    },
  )

  it.each([401, 403, 429, 500])(
    'does not fan out legacy requests after HTTP %s',
    async (status) => {
      const request = vi.fn().mockRejectedValue(new ApiError(status, 'failed'))
      await expect(loadProfileOverview(request)).rejects.toMatchObject({ status })
      expect(request).toHaveBeenCalledTimes(1)
    },
  )
})
