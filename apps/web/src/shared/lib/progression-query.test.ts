// @vitest-environment jsdom
import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from './api'
import { clearAccessToken } from './api'
import {
  applyConfirmedXpDelta,
  fetchProgressionSnapshot,
  progressionQueryKey,
  readProgressionSnapshot,
  setProgressionSnapshot,
} from './progression-query'

const learner = (id: string, xp = 0, level = 1): User => ({
  id,
  role: 'student',
  email: null,
  nickname: 'Bạn nhỏ',
  avatarId: null,
  level,
  xp,
  onboarded: true,
  goal: null,
  parentId: null,
  classId: null,
})

describe('shared progression snapshot', () => {
  const values = new Map<string, string>()
  const storage: Storage = {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    storage.clear()
    vi.stubGlobal('localStorage', storage)
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: storage,
    })
  })

  it('persists snapshots per learner on shared devices', () => {
    const client = new QueryClient()
    setProgressionSnapshot(client, 'child-a', { totalXp: 250, level: 3 })
    setProgressionSnapshot(client, 'child-b', { totalXp: 40, level: 1 })

    expect(readProgressionSnapshot(learner('child-a'))?.totalXp).toBe(250)
    expect(readProgressionSnapshot(learner('child-b'))?.totalXp).toBe(40)
  })

  it('updates the shared query immediately after a confirmed XP award', () => {
    const client = new QueryClient()
    setProgressionSnapshot(client, 'child-a', { totalXp: 90, level: 1 })

    const next = applyConfirmedXpDelta(client, learner('child-a', 90, 1), 30)

    expect(next).toMatchObject({ totalXp: 120, level: 2, xpIntoLevel: 20 })
    expect(client.getQueryData(progressionQueryKey('child-a'))).toEqual(next)
  })

  it('falls back to /api/v1/gamification/me when progression endpoint returns 404', async () => {
    clearAccessToken()
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/v1/gamification/me/progression')) {
        return Promise.resolve(new Response(JSON.stringify({ status: 'fail', message: 'Route not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }))
      }
      if (url.includes('/api/v1/gamification/me')) {
        return Promise.resolve(new Response(JSON.stringify({
          status: 'success',
          data: { totalXp: 10650, level: 107, xpIntoLevel: 50, xpToNextLevel: 50 },
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }))
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`))
    })
    vi.stubGlobal('fetch', fetchMock)

    const snapshot = await fetchProgressionSnapshot('child-bo')
    expect(snapshot.level).toBe(107)
    expect(snapshot.totalXp).toBe(10650)
    expect(snapshot.progressPercent).toBe(50)
  })

  it('rejects an incomplete legacy payload instead of persisting fake Level 1 data', async () => {
    clearAccessToken()
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/v1/gamification/me/progression')) {
        return Promise.resolve(new Response(null, { status: 404 }))
      }
      return Promise.resolve(new Response(JSON.stringify({
        status: 'success',
        data: { nickname: 'Bé Bo' },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchProgressionSnapshot('child-bo')).rejects.toMatchObject({
      status: 502,
      code: 'INVALID_PROGRESSION_PAYLOAD',
    })
    expect(localStorage.getItem('aiki.progression.v1.child-bo')).toBeNull()
  })

  it('does not use the legacy fallback for authorization or server failures', async () => {
    clearAccessToken()
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      message: 'Service unavailable',
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchProgressionSnapshot('child-bo')).rejects.toMatchObject({ status: 503 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
