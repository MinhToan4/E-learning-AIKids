import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, clearAccessToken } from './api'

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('StoryMee Gateway adapter', () => {
  beforeEach(() => {
    const values = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    })
    clearAccessToken()
    vi.restoreAllMocks()
  })

  it('translates child login and persists the StoryMee JWT', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      token: 'storymee-jwt',
      user: { id: 'u1', actor: 'child', name: 'Bé Mây' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{ user: { role: string } }>(
      '/api/auth/login/student',
      {
        method: 'POST',
        body: JSON.stringify({ nickname: 'be-may', password: 'secret' }),
      },
    )

    expect(result.user.role).toBe('student')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://dev-hub.storymee.com/api/v1/account/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          login: 'be-may',
          username: 'be-may',
          password: 'secret',
        }),
      }),
    )
  })

  it('sends the JWT and maps LMS catalog responses for the existing UI', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response({
        token: 'storymee-jwt',
        user: { id: 'u1', actor: 'parent' },
      }))
      .mockResolvedValueOnce(response({
        courses: [{
          id: 'c1',
          slug: 'ai-co-ban',
          title: 'AI cơ bản',
          ageBand: '8-11',
          metadata: { skills: ['prompt'] },
          versions: [{ _count: { modules: 3 } }],
        }],
      }))
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/auth/login/adult', {
      method: 'POST',
      body: JSON.stringify({ email: 'parent@example.test', password: 'secret' }),
    })
    const result = await api<{ courses: Array<{ courseKey?: string; questCount: number }> }>(
      '/api/courses',
    )

    expect(result.courses[0]).toMatchObject({
      courseKey: 'ai-co-ban',
      questCount: 3,
    })
    const secondRequest = fetchMock.mock.calls[1]
    expect((secondRequest[1].headers as Headers).get('Authorization'))
      .toBe('Bearer storymee-jwt')
  })

  it('routes gamification to its StoryMee domain and maps streak fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      currentStreak: 4,
      longestStreak: 9,
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{ current: number; longest: number }>(
      '/api/gamification/streak',
    )

    expect(result).toEqual({ current: 4, longest: 9 })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://dev-hub.storymee.com/api/v1/gamification/me/streak',
      expect.any(Object),
    )
  })

  it('routes the complete learning flow through the LMS compatibility facade', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ quests: [], totalStars: 0, completedCount: 0 }))
      .mockResolvedValueOnce(response({ progress: { status: 'in_progress', phase: 'learn' } }))
      .mockResolvedValueOnce(response({ stars: 3, nextQuestId: null }))
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/progress/11111111-1111-4111-8111-111111111111')
    await api('/api/progress/22222222-2222-4222-8222-222222222222/start', {
      method: 'POST',
    })
    await api('/api/progress/22222222-2222-4222-8222-222222222222/check', {
      method: 'POST',
      body: JSON.stringify({ answers: [] }),
    })

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://dev-hub.storymee.com/api/v1/lms/compat/courses/11111111-1111-4111-8111-111111111111/progress',
      'https://dev-hub.storymee.com/api/v1/lms/compat/lessons/22222222-2222-4222-8222-222222222222/start',
      'https://dev-hub.storymee.com/api/v1/lms/compat/lessons/22222222-2222-4222-8222-222222222222/check',
    ])
    const checkHeaders = fetchMock.mock.calls[2][1].headers as Headers
    expect(checkHeaders.get('Idempotency-Key')).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('maps Account child profiles to the existing family UI contract', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      status: 'success',
      data: {
        children: [{
          id: 'child-1',
          name: 'Bé Mây',
          avatarUrl: 'avatar-robot',
          level: 2,
          xp: 40,
          hasPin: true,
        }],
      },
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{ children: Array<{ nickname: string; avatarId: string }> }>(
      '/api/parent/children',
    )

    expect(result.children[0]).toMatchObject({
      nickname: 'Bé Mây',
      avatarId: 'avatar-robot',
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://dev-hub.storymee.com/api/v1/account/family/children',
      expect.any(Object),
    )
  })
})
