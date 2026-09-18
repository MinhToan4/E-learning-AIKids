import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, clearAccessToken } from './api'
import { clearApiCache } from './api-cache'

const ok = () => new Response(JSON.stringify({ status: 'success', data: { items: [] } }), {
  status: 200, headers: { 'Content-Type': 'application/json' },
})

describe('short-lived API response cache', () => {
  beforeEach(() => { clearAccessToken(); vi.restoreAllMocks() })

  it('reuses stable CMS catalog reads within the TTL', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => ok())
    vi.stubGlobal('fetch', fetchMock)
    await api('/api/admin/legend-studio')
    await api('/api/admin/legend-studio')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('invalidates cached projections after a mutation', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => ok())
    vi.stubGlobal('fetch', fetchMock)
    await api('/api/admin/legend-studio')
    await api('/api/admin/legend-studio/item-1', { method: 'PUT', body: '{}' })
    await api('/api/admin/legend-studio')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('clears cache explicitly with clearApiCache', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => ok())
    vi.stubGlobal('fetch', fetchMock)
    await api('/api/admin/legend-studio')
    clearApiCache()
    await api('/api/admin/legend-studio')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('reuses responses for newly cached Phase 1 endpoints', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => ok())
    vi.stubGlobal('fetch', fetchMock)

    // Test course caching
    await api('/api/courses/course-1')
    await api('/api/courses/course-1')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // Test learning pathway caching
    await api('/api/learning/pathway')
    await api('/api/learning/pathway')
    expect(fetchMock).toHaveBeenCalledTimes(2)

    // Test age-policy caching
    await api('/api/learning/age-policy')
    await api('/api/learning/age-policy')
    expect(fetchMock).toHaveBeenCalledTimes(3)

    // Test notifications debounce caching
    await api('/api/notifications')
    await api('/api/notifications')
    expect(fetchMock).toHaveBeenCalledTimes(4)

    // Test gamification social caching
    await api('/api/gamification/social/feed')
    await api('/api/gamification/social/feed')
    expect(fetchMock).toHaveBeenCalledTimes(5)

    // Test parent children courses caching
    await api('/api/parent/children/child-1/courses')
    await api('/api/parent/children/child-1/courses')
    expect(fetchMock).toHaveBeenCalledTimes(6)

    // Test gamification daily-mission caching
    await api('/api/gamification/daily-mission')
    await api('/api/gamification/daily-mission')
    expect(fetchMock).toHaveBeenCalledTimes(7)
  })

  it('caches /api/auth/firebase/config with 300_000ms TTL', async () => {
    vi.useFakeTimers()
    try {
      const now = new Date('2026-01-01T00:00:00Z')
      vi.setSystemTime(now)

      const fetchMock = vi.fn().mockImplementation(async () => ok())
      vi.stubGlobal('fetch', fetchMock)

      // Initial call triggers fetch
      await api('/api/auth/firebase/config')
      expect(fetchMock).toHaveBeenCalledTimes(1)

      // Subsequent call reuses cache
      await api('/api/auth/firebase/config')
      expect(fetchMock).toHaveBeenCalledTimes(1)

      // At 299_999ms, cache is still valid
      vi.advanceTimersByTime(299_999)
      await api('/api/auth/firebase/config')
      expect(fetchMock).toHaveBeenCalledTimes(1)

      // Past 300_000ms, cache expires and triggers fetch
      vi.advanceTimersByTime(2)
      await api('/api/auth/firebase/config')
      expect(fetchMock).toHaveBeenCalledTimes(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it('serves stale cache immediately and revalidates in background (SWR)', async () => {
    vi.useFakeTimers()
    try {
      const now = new Date('2026-01-01T00:00:00Z')
      vi.setSystemTime(now)

      let counter = 1
      const fetchMock = vi.fn().mockImplementation(async () => {
        return new Response(JSON.stringify({
          status: 'success',
          data: {
            items: [{ id: `item-${counter++}`, kind: 'image', title: 'test' }],
          },
        }), {
          status: 200, headers: { 'Content-Type': 'application/json' },
        })
      })
      vi.stubGlobal('fetch', fetchMock)

      // Initial call - item-1
      const res1 = await api<{ assets: Array<{ id: string }> }>('/api/backpack')
      expect(res1.assets[0].id).toBe('item-1')
      expect(fetchMock).toHaveBeenCalledTimes(1)

      // Advance past TTL (30_000ms) but within stale window (300_000ms)
      vi.advanceTimersByTime(35_000)

      // Stale call: returns item-1 immediately in 0ms, revalidates in background
      const res2 = await api<{ assets: Array<{ id: string }> }>('/api/backpack')
      expect(res2.assets[0].id).toBe('item-1')
      expect(fetchMock).toHaveBeenCalledTimes(2)

      // Wait for background revalidation to settle
      await vi.advanceTimersByTimeAsync(10)

      // Subsequent call receives updated item-2
      const res3 = await api<{ assets: Array<{ id: string }> }>('/api/backpack')
      expect(res3.assets[0].id).toBe('item-2')
      expect(fetchMock).toHaveBeenCalledTimes(2) // from fresh cache, no new fetch
    } finally {
      vi.useRealTimers()
    }
  })

  it('deduplicates GET requests and handles AbortSignal correctly', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 50))
      return ok()
    })
    vi.stubGlobal('fetch', fetchMock)

    const controller1 = new AbortController()
    const controller2 = new AbortController()

    // Concurrent calls with different signals share the same in-flight fetch
    const p1 = api('/api/projects', { signal: controller1.signal })
    const p2 = api('/api/projects', { signal: controller2.signal })

    expect(fetchMock).toHaveBeenCalledTimes(1)

    // Abort caller 1
    controller1.abort()

    await expect(p1).rejects.toThrow()
    const res2 = await p2
    expect(res2).toBeDefined()

    // Subsequent call uses cache populated by p2
    await api('/api/projects')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('caches projects, profile settings, and class celebration with 30_000ms TTL', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => ok())
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/projects')
    await api('/api/projects')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await api('/api/profile/settings')
    await api('/api/profile/settings')
    expect(fetchMock).toHaveBeenCalledTimes(2)

    await api('/api/gamification/class-celebration')
    await api('/api/gamification/class-celebration')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
