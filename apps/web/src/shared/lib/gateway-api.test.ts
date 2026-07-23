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

  it('fails fast for a legacy feature without a StoryMee backend owner', async () => {
    await expect(api('/api/gamification/streak')).rejects.toMatchObject({
      status: 501,
      body: {
        code: 'FEATURE_NOT_AVAILABLE',
        legacyPath: '/api/gamification/streak',
      },
    })
  })
})
