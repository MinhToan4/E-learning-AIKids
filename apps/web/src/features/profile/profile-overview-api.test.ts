import { describe, expect, it, vi } from 'vitest'
import { loadProfileOverview } from './profile-overview-api'

describe('profile overview adapter', () => {
  it('loads optional profile sections from local service routes without probing a missing aggregate route', async () => {
    const request = vi.fn()
      .mockResolvedValueOnce({ current: 4 })
      .mockResolvedValueOnce({ achievements: [] })
      .mockResolvedValueOnce({ projects: [] })
      .mockResolvedValueOnce({ assets: [] })
      .mockResolvedValueOnce({ totalXp: 1200, level: 12 })
      .mockResolvedValueOnce({
        childProfileId: 'child-1',
        slug: 'bo',
        enabled: true,
        visibility: ['family'],
        modules: ['works'],
      })
      .mockResolvedValueOnce({ equipment: [] })

    await expect(loadProfileOverview(request)).resolves.toMatchObject({
      streak: 4,
      totalXp: 1200,
      level: 12,
    })
    expect(request).toHaveBeenCalledTimes(7)
    expect(request).not.toHaveBeenCalledWith('/api/v1/profile/overview')
    expect(request).toHaveBeenCalledWith('/api/profile/settings')
  })
})
