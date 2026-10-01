import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, clearAccessToken, markSessionTransition } from '@/shared/lib/api'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('AI Kids E2E Full Lifecycle & Strict Isolation Verification', () => {
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

  it('verifies complete E2E flow: registration -> children -> handoff -> free prerequisite -> paywall gate -> VietQR purchase -> island unlock -> sibling isolation -> idempotency', async () => {
    let parentRegistered = false
    let currentChild: string | null = null
    let parentSubscribed = false
    const boProgress: Record<string, unknown> = {}

    markSessionTransition()
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input)
      const method = (init?.method ?? 'GET').toUpperCase()
      const headers = new Headers(init?.headers)

      // Phase 1: Parent Registration
      if (url.endsWith('/api/v1/account/register')) {
        parentRegistered = true
        return json({
          status: 'success',
          data: {
            user: { id: 'parent-1', email: 'parent@example.com', actor: 'parent', role: 'parent' },
          },
        })
      }

      // Phase 2: Add Children to Family
      if (url.endsWith('/api/v1/account/family/children') && method === 'POST') {
        const body = JSON.parse(String(init?.body))
        const name = body.name ?? body.nickname ?? 'Bé'
        const childId = name === 'Bé Bo' ? 'child-bo' : 'child-bi'
        return json({
          status: 'success',
          data: {
            child: {
              id: childId,
              name,
              nickname: name,
              actor: 'child',
              level: 1,
              xp: 0,
            },
          },
        })
      }

      // Phase 3: Parent-to-Child Handoff (Enter as child)
      if (url.match(/\/api\/v1\/account\/family\/children\/(child-bo|child-bi)\/session/)) {
        currentChild = url.includes('child-bo') ? 'child-bo' : 'child-bi'
        return json({
          status: 'success',
          data: {
            child: {
              id: currentChild,
              name: currentChild === 'child-bo' ? 'Bé Bo' : 'Bé Bi',
              actor: 'child',
              parentalConsent: { allowAiCreate: true, allowPhoto: true, allowExport: true },
            },
            parent: { id: 'parent-1' },
          },
        })
      }

      // Phase 3: Parent Gate Verification (Password required, PIN blocked)
      if (url.endsWith('/api/v1/account/family/gate-verify')) {
        const body = JSON.parse(String(init?.body))
        if (body.pin || body.password === '1234') {
          return json({ status: 'error', message: 'Mã PIN không hợp lệ cho Cổng Phụ Huynh' }, 403)
        }
        return json({
          status: 'success',
          data: { user: { id: 'parent-1', actor: 'parent', role: 'parent' } },
        })
      }

      // Phase 4: Free Prerequisite Course (Mười quy tắc xưởng sáng tạo)
      if (url.endsWith('/api/v1/lms/courses/muoi-quy-tac-xuong-sang-tao')) {
        return json({
          data: {
            course: {
              id: 'muoi-quy-tac',
              courseKey: 'muoi-quy-tac-xuong-sang-tao',
              title: 'Mười quy tắc xưởng sáng tạo',
              enrolled: true,
              quests: [{ id: 'quest-free-1', title: 'Bài 1', access: { mode: 'inherit' } }],
            },
          },
        })
      }

      // Phase 5 & 7: Paid Island Access Gate (aikid_island_1)
      if (url.match(/\/api\/v1\/lms\/courses\/aikid_island_1/)) {
        if (!parentSubscribed) {
          return json({
            data: {
              course: {
                id: 'island-1',
                title: 'Đảo 1: Xưởng Sáng Tạo',
                enrolled: false,
                quests: [{ id: 'quest-island-1', access: { mode: 'plan_required' } }],
              },
            },
          })
        }
        return json({
          data: {
            course: {
              id: 'island-1',
              title: 'Đảo 1: Xưởng Sáng Tạo',
              enrolled: true,
              quests: [{ id: 'quest-island-1', access: { mode: 'inherit' } }],
            },
          },
        })
      }

      // Phase 6: Parent Plan Checkout & Activation (VietQR 129k)
      if (url.endsWith('/api/v1/billing/me/checkout')) {
        parentSubscribed = true
        return json({
          status: 'success',
          data: {
            subscription: {
              plan: 'aikids_official_129k',
              status: 'active',
              planDef: { id: 'aikids_official_129k', name: 'Gói 129k', maxChildren: 2 },
            },
            paymentIntent: { id: 'pi_ak129k1234', status: 'succeeded' },
          },
          checkout: { paymentReady: true },
        })
      }

      // Phase 8 & 9: Lesson Check with Idempotency & Child Ownership
      if (url.match(/\/api\/v1\/lms\/compat\/lessons\/quest-island-1\/check/)) {
        if (currentChild !== 'child-bo') {
          return json({ error: 'Không phải tiến độ của bé này' }, 403)
        }
        const idempotencyKey = headers.get('Idempotency-Key')
        if (!idempotencyKey) return json({ error: 'Thiếu Idempotency-Key' }, 400)

        if (boProgress[idempotencyKey]) {
          return json(boProgress[idempotencyKey])
        }

        const result = {
          status: 'success',
          data: {
            progress: { xp: 50, stars: 3, completed: true },
          },
        }
        boProgress[idempotencyKey] = result
        return json(result)
      }

      // Sibling Isolation: Child Bi Pathway
      if (url.endsWith('/api/v1/lms/family/children/child-bi/pathway')) {
        if (currentChild === 'child-bi') {
          return json({
            data: {
              student: { nickname: 'Bé Bi', ageBand: '8-11' },
              courses: [
                {
                  id: 'island-1',
                  status: 'active',
                  completionPercent: 0,
                  totalStars: 0,
                },
              ],
            },
          })
        }
      }

      return json({ message: `Unexpected request: ${url}` }, 500)
    })
    vi.stubGlobal('fetch', fetchMock)

    // ── Phase 1: Đăng ký Phụ huynh ───────────────────────────────
    const registerParent = await api<{ user: { id: string; role: string } }>('/api/auth/register/adult', {
      method: 'POST',
      body: JSON.stringify({ email: 'parent@example.com', password: 'password123' }),
    })
    expect(registerParent.user.id).toBe('parent-1')
    expect(parentRegistered).toBe(true)

    // ── Phase 2: Thêm 2 Bé (Bé Bo và Bé Bi) ──────────────────────
    const bo = await api<{ child: { id: string; nickname: string } }>('/api/parent/children', {
      method: 'POST',
      body: JSON.stringify({ nickname: 'Bé Bo' }),
    })
    expect(bo.child.id).toBe('child-bo')

    const bi = await api<{ child: { id: string; nickname: string } }>('/api/parent/children', {
      method: 'POST',
      body: JSON.stringify({ nickname: 'Bé Bi' }),
    })
    expect(bi.child.id).toBe('child-bi')

    // ── Phase 3: Bàn giao sang Bé Bo ─────────────────────────────
    const boLogin = await api<{ user: { id: string; role: string } }>('/api/auth/login/child-profile', {
      method: 'POST',
      body: JSON.stringify({ childId: 'child-bo' }),
    })
    expect(boLogin.user.id).toBe('child-bo')
    expect(boLogin.user.role).toBe('student')

    // Thử Cổng Phụ Huynh với Parent Password
    const gateVerify = await api<{ user: { id: string } }>('/api/parent/gate/verify', {
      method: 'POST',
      body: JSON.stringify({ password: 'password123' }),
    })
    expect(gateVerify.user.id).toBe('parent-1')

    // ── Phase 4: Khóa học Tiên quyết Miễn phí ─────────────────────
    const freeCourse = await api<{ course: { id: string; enrolled: boolean; quests: Array<{ access: { mode: string } }> } }>(
      '/api/courses/muoi-quy-tac-xuong-sang-tao',
    )
    expect(freeCourse.course.id).toBe('muoi-quy-tac')
    expect(freeCourse.course.enrolled).toBe(true)

    // ── Phase 5: Rào cản Paywall Đảo 1 (Khi chưa mua gói) ─────────
    const islandLocked = await api<{ course: { id: string; enrolled: boolean; quests: Array<{ access: { mode: string } }> } }>(
      '/api/courses/aikid_island_1',
    )
    expect(islandLocked.course.enrolled).toBe(false)
    expect(islandLocked.course.quests[0].access.mode).toBe('plan_required')

    // ── Phase 6: Phụ huynh mua Gói 129k (VietQR) ─────────────────
    const purchase = await api<{ subscription: { planCode: string; status: string } }>('/api/parent/subscription', {
      method: 'POST',
      body: JSON.stringify({ planCode: 'aikids_official_129k' }),
    })
    expect(purchase.subscription.status).toBe('active')
    expect(parentSubscribed).toBe(true)

    // ── Phase 7: Mở khóa Đảo 1 & Nộp bài Chấm điểm ────────────────
    const islandUnlocked = await api<{ course: { id: string; enrolled: boolean; quests: Array<{ access: { mode: string } }> } }>(
      '/api/courses/aikid_island_1',
    )
    expect(islandUnlocked.course.enrolled).toBe(true)
    expect(islandUnlocked.course.quests[0].access.mode).toBe('inherit')

    // ── Phase 8: Nộp bài & Chống cộng điểm trùng (Idempotency) ───
    const check1 = await api<{ progress: { xp: number; stars: number } }>('/api/progress/quest-island-1/check', {
      method: 'POST',
      body: JSON.stringify({ answer: 'A' }),
      headers: { 'Idempotency-Key': 'idem-123' },
    })
    expect(check1.progress.xp).toBe(50)
    expect(check1.progress.stars).toBe(3)

    // Nộp lại cùng Idempotency-Key: Điểm số giữ nguyên, không cộng thêm
    const check2 = await api<{ progress: { xp: number; stars: number } }>('/api/progress/quest-island-1/check', {
      method: 'POST',
      body: JSON.stringify({ answer: 'A' }),
      headers: { 'Idempotency-Key': 'idem-123' },
    })
    expect(check2).toEqual(check1)

    // ── Phase 9: Kiểm tra Cách ly Tuyệt đối (Sibling Isolation) ───
    // Chuyển sang Bé Bi
    const biLogin = await api<{ user: { id: string } }>('/api/auth/login/child-profile', {
      method: 'POST',
      body: JSON.stringify({ childId: 'child-bi' }),
    })
    expect(biLogin.user.id).toBe('child-bi')

    // Bé Bi xem lộ trình học của mình: Đảo 1 hoàn toàn mới (0%, 0 Sao)
    const biPathway = await api<{ courses: Array<{ id: string; completionPercent: number; totalStars: number }> }>(
      '/api/learning/pathway?studentId=child-bi',
    )
    expect(biPathway.courses[0].id).toBe('island-1')
    expect(biPathway.courses[0].completionPercent).toBe(0)
    expect(biPathway.courses[0].totalStars).toBe(0)
  })
})
