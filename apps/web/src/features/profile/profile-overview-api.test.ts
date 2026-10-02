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

  it('loads optional profile sections through one Hub aggregate request', async () => {
    const request = vi.fn().mockResolvedValue({
      streak: { currentStreak: 4 },
      achievements: { achievements: [] },
      projects: { items: [] },
      media: { items: [] },
      progression: { totalXp: 1200, level: 12 },
      appearance: {
        childProfileId: 'child-1',
        slug: 'bo',
        enabled: true,
        visibility: ['family'],
        modules: ['works'],
      },
      storybook: { equipment: [] },
    })

    await expect(loadProfileOverview(request)).resolves.toMatchObject({
      streak: 4,
      totalXp: 1200,
      level: 12,
    })
    expect(request).toHaveBeenCalledTimes(1)
    expect(request).toHaveBeenCalledWith('/api/v1/aikids/profile-overview?sections=core%2Cprogression%2Cappearance%2Cpathway')
  })

  it('hydrates profile, backpack and pathway through one scoped request with storybook', async () => {
    const request = vi.fn().mockResolvedValue({
      streak: { currentStreak: 4 },
      achievements: { achievements: [] },
      projects: { items: [] },
      appearance: { childProfileId: 'child-1', enabled: true },
      storybook: { inventory: [], equipment: [], studio: { chapters: [] } },
      pathway: {
        student: { nickname: 'Bo', ageBand: '8-10' },
        policy: null,
        recommendedCourseId: null,
        courses: [],
      },
    })

    await expect(loadProfileOverview(request, 3500, false, false, true, true, true)).resolves.toMatchObject({
      storybook: { inventory: [], equipment: [] },
      pathway: { courses: [] },
    })
    expect(request).toHaveBeenCalledTimes(1)
    expect(request).toHaveBeenCalledWith('/api/v1/aikids/profile-overview?sections=core%2Cappearance%2Cpathway%2Cstorybook')
  })

  it('reads storybook directly when an older Hub aggregate omits the requested section', async () => {
    const request = vi.fn().mockImplementation((path: string) => {
      if (path.startsWith('/api/v1/aikids/profile-overview')) {
        return Promise.resolve({
          streak: { currentStreak: 4 },
          achievements: { achievements: [] },
          appearance: { childProfileId: 'child-1', enabled: true },
        })
      }
      if (path === '/api/gamification/storybook') {
        return Promise.resolve({
          inventory: [{ rewardId: 'frame-uploaded-square' }],
          equipment: [{ kind: 'frame', rewardId: 'frame-uploaded-square' }],
        })
      }
      return Promise.reject(new Error(`Unexpected request: ${path}`))
    })

    await expect(loadProfileOverview(request, 3500, false, false, true, false, true)).resolves.toMatchObject({
      equipment: [{ kind: 'frame', rewardId: 'frame-uploaded-square' }],
      storybook: { inventory: [{ rewardId: 'frame-uploaded-square' }] },
    })
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('omits storybook section by default to accelerate initial profile load', async () => {
    const request = vi.fn().mockResolvedValue({
      streak: { currentStreak: 5 },
      achievements: { achievements: [] },
      storybook: { inventory: [{ rewardId: 'reward-1' }], equipment: [] },
    })

    const result = await loadProfileOverview(request)
    expect(result.storybook).toBeNull()
    expect(request).toHaveBeenCalledWith(expect.not.stringContaining('storybook'))
  })

  it('fails closed instead of starting legacy browser fan-out', async () => {
    localStorage.setItem('aiki_last_known_level', '7')
    localStorage.setItem('aiki_last_known_xp', '850')

    const request = vi.fn().mockRejectedValue(new Error('Network error'))

    await expect(loadProfileOverview(request)).rejects.toThrow('Network error')
    expect(request).toHaveBeenCalledTimes(1)

    localStorage.removeItem('aiki_last_known_level')
    localStorage.removeItem('aiki_last_known_xp')
  })

  it('does not persist authoritative level and XP in localStorage', async () => {
    localStorage.removeItem('aiki_last_known_level')
    localStorage.removeItem('aiki_last_known_xp')

    const request = vi.fn().mockResolvedValue({
      streak: { currentStreak: 0 }, achievements: { achievements: [] },
      projects: { items: [] }, media: { items: [] },
      progression: { totalXp: 350, level: 5 },
      appearance: {}, storybook: { equipment: [] },
    })

    await loadProfileOverview(request)
    expect(localStorage.getItem('aiki_last_known_level')).toBeNull()
    expect(localStorage.getItem('aiki_last_known_xp')).toBeNull()

    localStorage.removeItem('aiki_last_known_level')
    localStorage.removeItem('aiki_last_known_xp')
  })

  it('fails a slow aggregate request via timeout without starting fallback requests', async () => {
    const request = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 200)))

    // Run with a very short timeout for testing speed
    await expect(loadProfileOverview(request, 50)).rejects.toThrow('Request timed out')
    expect(request).toHaveBeenCalledTimes(1)
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
