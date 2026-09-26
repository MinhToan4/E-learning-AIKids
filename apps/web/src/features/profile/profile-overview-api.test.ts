// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadProfileAppearance, loadProfileOverview } from './profile-overview-api'

let mockStorage: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = String(val)
  },
  removeItem: (key: string) => {
    delete mockStorage[key]
  },
  clear: () => {
    mockStorage = {}
  },
  get length() {
    return Object.keys(mockStorage).length
  },
  key: (i: number) => Object.keys(mockStorage)[i] ?? null,
}
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
})

describe('profile overview adapter', () => {
  beforeEach(() => {
    mockStorage = {}
  })

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

  it('fails closed instead of trusting localStorage when gamification request fails', async () => {
    localStorage.setItem('aiki_last_known_level', '7')
    localStorage.setItem('aiki_last_known_xp', '850')

    const request = vi.fn().mockImplementation((path: string) => {
      if (path === '/api/gamification/profile') {
        return Promise.reject(new Error('Network error'))
      }
      if (path === '/api/gamification/streak') {
        return Promise.resolve({ current: 2 })
      }
      return Promise.resolve({})
    })

    const overview = await loadProfileOverview(request)
    expect(overview.level).toBe(1)
    expect(overview.totalXp).toBe(0)
    expect(overview.streak).toBe(2)

    localStorage.removeItem('aiki_last_known_level')
    localStorage.removeItem('aiki_last_known_xp')
  })

  it('does not persist authoritative level and XP in localStorage', async () => {
    localStorage.removeItem('aiki_last_known_level')
    localStorage.removeItem('aiki_last_known_xp')

    const request = vi.fn().mockImplementation((path: string) => {
      if (path === '/api/gamification/profile') {
        return Promise.resolve({ totalXp: 350, level: 5 })
      }
      return Promise.resolve({})
    })

    await loadProfileOverview(request)
    expect(localStorage.getItem('aiki_last_known_level')).toBeNull()
    expect(localStorage.getItem('aiki_last_known_xp')).toBeNull()

    localStorage.removeItem('aiki_last_known_level')
    localStorage.removeItem('aiki_last_known_xp')
  })

  it('safely handles slow requests via timeout without hanging', async () => {
    const request = vi.fn().mockImplementation((path: string) => {
      if (path === '/api/profile/settings') {
        // Mock a hanging promise that takes longer than the timeout
        return new Promise((resolve) => setTimeout(resolve, 200))
      }
      return Promise.resolve({})
    })

    // Run with a very short timeout for testing speed
    const overview = await loadProfileOverview(request, 50)
    expect(overview.profileSettings).toBeNull()
  })

  it('loads appearance independently from slow non-critical profile sections', async () => {
    const request = vi.fn().mockImplementation((path: string) => {
      if (path === '/api/profile/settings') {
        return Promise.resolve({ slug: 'bo', themeKey: 'theme-ocean' })
      }
      if (path === '/api/gamification/storybook') {
        return Promise.resolve({
          inventory: [{ rewardId: 'theme-ocean' }],
          equipment: [{ kind: 'theme', rewardId: 'theme-ocean' }],
        })
      }
      return Promise.reject(new Error(`Unexpected request: ${path}`))
    })

    await expect(loadProfileAppearance(request)).resolves.toMatchObject({
      profileSettings: { slug: 'bo', themeKey: 'theme-ocean' },
      equipment: [{ kind: 'theme', rewardId: 'theme-ocean' }],
      ownedRewardIds: ['theme-ocean'],
    })
    expect(request).toHaveBeenCalledTimes(2)
  })
})
