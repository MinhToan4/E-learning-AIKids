import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, clearAccessToken, setAccessToken } from '@/shared/lib/api'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('parent free-plan enrollment flow', () => {
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

  it('activates free access, enrolls the owned child, then exposes that enrollment to the child session', async () => {
    const childId = '11111111-1111-4111-8111-111111111111'
    const courseId = '22222222-2222-4222-8222-222222222222'
    let enrolled = false

    setAccessToken('parent-session')
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input)
      const headers = new Headers(init?.headers)

      if (url.endsWith('/api/v1/billing/me/checkout')) {
        expect(headers.get('Authorization')).toBe('Bearer parent-session')
        expect(headers.get('Idempotency-Key')).toBeTruthy()
        expect(JSON.parse(String(init?.body))).toMatchObject({ plan: 'free' })
        return json({
          status: 'success',
          data: {
            subscription: {
              plan: 'free',
              status: 'active',
              planDef: {
                id: 'free',
                name: 'Khởi đầu',
                maxChildren: 1,
                maxOpenCoursesPerChild: 1,
                features: ['Một hồ sơ con'],
              },
            },
            paymentIntent: null,
          },
          checkout: { paymentReady: false, payUrl: null },
          message: 'Free plan active',
        })
      }

      if (url.endsWith(`/api/v1/lms/family/children/${childId}/courses`)) {
        expect(headers.get('Authorization')).toBe('Bearer parent-session')
        expect(JSON.parse(String(init?.body))).toEqual({ courseId, enroll: true })
        enrolled = true
        return json({ enrolled: true, enrollment: { courseId, status: 'active' } })
      }

      if (url.endsWith('/api/v1/account/family/child-login')) {
        expect(headers.get('Authorization')).toBe('Bearer parent-session')
        return json({
          status: 'success',
          data: {
            token: 'child-session',
            child: { id: childId, name: 'Bé Mây', actor: 'child' },
            parent: { id: 'parent-1' },
          },
        })
      }

      if (url.endsWith('/api/v1/lms/enrollments')) {
        expect(headers.get('Authorization')).toBe('Bearer child-session')
        return json({
          enrollments: enrolled
            ? [{ courseId, status: 'active', progress: [] }]
            : [],
        })
      }

      return json({ message: `Unexpected request: ${url}` }, 500)
    })
    vi.stubGlobal('fetch', fetchMock)

    const activated = await api<{
      subscription: {
        planCode: string
        status: string
        maxChildren: number
        maxOpenCoursesPerChild: number
      }
    }>('/api/parent/subscription', {
      method: 'POST',
      body: JSON.stringify({ planCode: 'free' }),
    })
    expect(activated.subscription).toMatchObject({
      planCode: 'free',
      status: 'active',
      maxChildren: 1,
      maxOpenCoursesPerChild: 1,
    })

    const enrollment = await api<{ enrolled: boolean }>(
      `/api/parent/children/${childId}/courses`,
      {
        method: 'POST',
        body: JSON.stringify({ courseId, enroll: true }),
      },
    )
    expect(enrollment.enrolled).toBe(true)

    const childLogin = await api<{ user: { id: string; role: string } }>(
      '/api/auth/login/child-profile',
      {
        method: 'POST',
        body: JSON.stringify({
          familyCode: 'SM-TEST',
          childId,
          pin: '424242',
        }),
      },
    )
    expect(childLogin.user).toMatchObject({ id: childId, role: 'student' })

    const childEnrollments = await api<{
      enrollments: Array<{ courseId: string; status: string }>
    }>('/api/enrollments')
    expect(childEnrollments.enrollments).toEqual([
      expect.objectContaining({ courseId, status: 'active' }),
    ])
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })
})
