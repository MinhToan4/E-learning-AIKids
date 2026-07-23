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
    const result = await api<{ courses: Array<{ courseKey?: string; questCount: number; status: string }> }>(
      '/api/courses',
    )

    expect(result.courses[0]).toMatchObject({
      courseKey: 'ai-co-ban',
      questCount: 3,
      status: 'open',
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

  it('routes the daily learning mission into the LMS world', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response([{
      mission: {
        key: 'daily_lesson',
        title: 'Học mỗi ngày',
        description: 'Hoàn thành một bài học hôm nay',
        cadence: 'daily',
        xpReward: 10,
      },
      progress: 0,
    }]))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{
      mission: { action: { route: string } } | null
    }>('/api/gamification/daily-mission')

    expect(result.mission?.action.route).toBe('/world')
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

  it('routes teacher classroom and authoring calls to core LMS', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ class: null, students: [] }))
      .mockResolvedValueOnce(response({ courses: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/teacher/class')
    await api('/api/teacher/lectures')

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://dev-hub.storymee.com/api/v1/lms/aikids/teacher/class',
      'https://dev-hub.storymee.com/api/v1/lms/aikids/teacher/lectures',
    ])
  })

  it('maps the server-owned billing catalog for the parent plan UI', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      status: 'success',
      data: [{
        id: 'premium_family',
        name: 'Premium Family',
        amountMinor: 149000,
        currency: 'vnd',
        maxChildren: 4,
        maxOpenCoursesPerChild: 5,
        features: ['Family profiles'],
      }],
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{ plans: Array<{ code: string; maxChildren: number }> }>(
      '/api/parent/plans',
    )

    expect(result.plans[0]).toMatchObject({
      code: 'premium_family',
      maxChildren: 4,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://dev-hub.storymee.com/api/v1/billing/plans',
      expect.any(Object),
    )
  })

  it('routes direct Google GIS auth to core Account without Firebase', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ data: { enabled: true, clientId: 'google-client' } }))
      .mockResolvedValueOnce(response({
        accessToken: 'google-session',
        user: { id: 'u-google', role: 'parent', name: 'Google Parent' },
      }))
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/auth/google/config')
    await api('/api/auth/login/google', {
      method: 'POST',
      body: JSON.stringify({ credential: 'gis-token', role: 'parent' }),
    })

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://dev-hub.storymee.com/api/v1/account/auth/google/config',
      'https://dev-hub.storymee.com/api/v1/account/auth/google',
    ])
  })

  it('routes parent approvals, profile, gate and admin surfaces to core domains', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ data: { approvals: [] } }))
      .mockResolvedValueOnce(response({ data: { profile: { preferredLanguage: 'vi' } } }))
      .mockResolvedValueOnce(response({ data: { user: { id: 'p1', role: 'parent' } } }))
      .mockResolvedValueOnce(response({ data: { system: { counts: {} } } }))
      .mockResolvedValueOnce(response({ data: [] }))
      .mockResolvedValueOnce(response({ courses: [] }))
      .mockResolvedValueOnce(response({ data: { planProviderPolicy: {} } }))
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/parent/approvals?status=pending')
    await api('/api/parent/profile')
    await api('/api/parent/gate/verify', {
      method: 'POST',
      body: JSON.stringify({ password: 'secret' }),
    })
    await api('/api/admin/system')
    await api('/api/admin/users')
    await api('/api/admin/courses')
    await api('/api/admin/settings/vidtory')

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://dev-hub.storymee.com/api/v1/media/gallery/share-requests?status=pending',
      'https://dev-hub.storymee.com/api/v1/account/parent-profile',
      'https://dev-hub.storymee.com/api/v1/account/me/verify-password',
      'https://dev-hub.storymee.com/api/v1/system/aikids/admin/summary',
      'https://dev-hub.storymee.com/api/v1/account/admin/users',
      'https://dev-hub.storymee.com/api/v1/lms/aikids/admin/courses',
      'https://dev-hub.storymee.com/api/v1/jobs/providers/policy',
    ])
  })

  it('loads account access and exchanges a selected workspace session', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        data: {
          contexts: [{
            id: 'organization:org-1',
            type: 'organization',
            label: 'Trường Nguyễn Du',
            actor: 'org_admin',
            roles: ['admin'],
            permissions: ['lms.class.manage'],
            defaultRoute: '/organization',
          }],
        },
      }))
      .mockResolvedValueOnce(response({
        data: {
          accessToken: 'scoped-session',
          active: { contextId: 'organization:org-1' },
        },
      }))
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/auth/access')
    await api('/api/auth/context', {
      method: 'POST',
      body: JSON.stringify({ contextId: 'organization:org-1' }),
    })

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://dev-hub.storymee.com/api/v1/account/me/access',
      'https://dev-hub.storymee.com/api/v1/account/me/contexts/select',
    ])
    expect(localStorage.getItem('storymee.access_token')).toBe('scoped-session')
  })
})
