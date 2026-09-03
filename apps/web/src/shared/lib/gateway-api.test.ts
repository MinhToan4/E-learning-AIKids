import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  api,
  AUTH_UNAUTHORIZED_EVENT,
  clearAccessToken,
  downloadAuthorizedBlob,
  getAccessToken,
  setAccessToken,
  type AchievementRow,
} from './api'

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

  it('accepts only StoryMee Storage URLs returned by legacy media upload', async () => {
    const body = new FormData()
    body.append('file', new File(['asset'], 'asset.webp', { type: 'image/webp' }))
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        url: 'https://storage.storymee.com/content-media/media/cms.webp',
        libraryItem: { id: 'media-1' },
      }))
      .mockResolvedValueOnce(response({
        url: 'https://tracker.example/cms.webp',
        libraryItem: { id: 'media-2' },
      }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(api<{ asset: { url: string } }>('/api/media/upload', { method: 'POST', body }))
      .resolves.toMatchObject({ asset: { url: 'https://storage.storymee.com/content-media/media/cms.webp' } })
    await expect(api('/api/media/upload', { method: 'POST', body }))
      .rejects.toThrow('StoryMee Media không trả về URL Storage hợp lệ.')
  })

  it('translates nickname + PIN child login without a family code and persists the StoryMee JWT', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      token: 'storymee-jwt',
      user: { id: 'u1', actor: 'child', name: 'Bé Mây' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{ user: { role: string } }>(
      '/api/auth/login/student',
      {
        method: 'POST',
        body: JSON.stringify({
          nickname: 'Bé Mây',
          pin: '424242',
        }),
      },
    )

    expect(result.user.role).toBe('student')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://dev-hub.storymee.com/api/v1/account/family/child-login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          nickname: 'Bé Mây',
          pin: '424242',
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
          metadata: { skills: ['prompt'], lessonCount: 3 },
          versions: [{ _count: { modules: 1 } }],
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
    // The deployed Hub currently does not whitelist X-Request-ID in its
    // cross-origin preflight response, so the browser must not send it here.
    expect((secondRequest[1].headers as Headers).get('X-Request-ID'))
      .toBeNull()
  })

  it('clears an expired consumer session and announces the auth failure', async () => {
    setAccessToken('expired-storymee-jwt')
    const unauthorized = vi.fn()
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, unauthorized, { once: true })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      response({ error: 'Consumer JWT required' }, 401),
    ))

    await expect(api('/api/backpack')).rejects.toMatchObject({ status: 401 })

    expect(getAccessToken()).toBeNull()
    expect(unauthorized).toHaveBeenCalledOnce()
  })

  it('downloads binary files with bearer auth and without browser credentials', async () => {
    setAccessToken('storymee-jwt')
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const blob = await downloadAuthorizedBlob('/api/reports/report-1/pdf')

    expect(blob.size).toBe(3)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://dev-hub.storymee.com/api/reports/report-1/pdf',
      expect.objectContaining({ credentials: 'omit' }),
    )
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect((options.headers as Headers).get('Authorization'))
      .toBe('Bearer storymee-jwt')
  })

  it('sends an adult username through the unified account login field', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(response({
      token: 'storymee-jwt',
      user: { id: 'u1', actor: 'parent' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/auth/login/adult', {
      method: 'POST',
      body: JSON.stringify({ login: 'storymee_admin', password: 'secret' }),
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://dev-hub.storymee.com/api/v1/account/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ login: 'storymee_admin', password: 'secret' }),
      }),
    )
  })

  it('routes gamification to its StoryMee domain and maps streak fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      currentStreak: 4,
      longestStreak: 9,
      lastActivityDate: '2026-07-29T00:00:00.000Z',
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{ current: number; longest: number }>(
      '/api/gamification/streak',
    )

    expect(result).toEqual({
      current: 4,
      longest: 9,
      lastActivityDate: '2026-07-29T00:00:00.000Z',
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://dev-hub.storymee.com/api/v1/gamification/me/streak',
      expect.any(Object),
    )
  })

  it('maps the first achievement milestone without marking it as unlocked', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response([{
      key: 'first_quest',
      title: 'Bước đầu tiên',
      description: 'Hoàn thành bài học đầu tiên',
      icon: '🌱',
      category: 'lessons_completed',
      threshold: 1,
      points: 25,
      rewardLabel: 'Huy hiệu Mầm xanh',
      seriesKey: 'quest-completion',
      milestones: [
        { threshold: 1, label: 'Bước đầu', points: 5 },
        { threshold: 5, label: 'Chăm chỉ', points: 20, rewardLabel: 'Khung Mầm xanh' },
      ],
      unlocked: false,
      currentValue: 0,
      unlock: null,
    }]))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{ achievements: AchievementRow[] }>(
      '/api/gamification/achievements',
    )

    expect(result.achievements).toEqual([
      expect.objectContaining({
        type: 'first_quest',
        title: 'Bước đầu tiên',
        description: 'Hoàn thành bài học đầu tiên',
        icon: '🌱',
        category: 'lessons_completed',
        currentValue: 0,
        points: 25,
        rewardLabel: 'Huy hiệu Mầm xanh',
        seriesKey: 'quest-completion',
        milestones: [
          expect.objectContaining({ threshold: 1, label: 'Bước đầu', points: 5 }),
          expect.objectContaining({ threshold: 5, rewardLabel: 'Khung Mầm xanh' }),
        ],
        unlocked: false,
      }),
    ])
  })

  it('maps achievement milestone media from core metadata', async () => {
    const imageUrl = 'https://storage.storymee.com/reward-assets/achievements/2026.08.14/v2/lessons/level-1.png'
    const fetchMock = vi.fn().mockResolvedValue(response([{
      key: 'achievement.lessons',
      title: 'Nhà khám phá',
      description: 'Tiến hoá qua từng bài học.',
      icon: '🏅',
      category: 'learning',
      threshold: 1,
      xpReward: 10,
      metadata: {
        seriesKey: 'lessons',
        milestones: [{ threshold: 1, label: 'Mầm xanh', imageUrl }],
      },
      unlocked: false,
      unlock: null,
    }]))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{ achievements: AchievementRow[] }>('/api/gamification/achievements')

    expect(result.achievements[0]).toMatchObject({
      points: 10,
      seriesKey: 'lessons',
      milestones: [{ threshold: 1, label: 'Mầm xanh', imageUrl }],
    })
  })

  it('accepts a trailing slash on achievements and maps the Hub response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response([{
      achievement: {
        key: 'first_lesson',
        title: 'Bước đầu tiên',
        description: 'Hoàn thành bài học đầu tiên',
        icon: '🌱',
        threshold: 1,
      },
      unlocked: true,
      unlock: { unlockedAt: '2026-07-23T00:00:00.000Z' },
    }]))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{
      achievements: Array<{ type: string; unlocked: boolean }>
    }>('/api/gamification/achievements/')

    expect(result.achievements).toEqual([
      expect.objectContaining({ type: 'first_lesson', unlocked: true }),
    ])
    expect(fetchMock).toHaveBeenCalledWith(
      'https://dev-hub.storymee.com/api/v1/gamification/me/achievements',
      expect.any(Object),
    )
  })

  it('builds the learning pathway from the deployed LMS course catalog', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      courses: [
        {
          id: 'course-1',
          title: 'AI cơ bản',
          shortTitle: 'Khởi đầu',
          ageBand: '8-11',
          enrolled: true,
          progressPct: 25,
        },
        {
          id: 'course-not-enrolled',
          title: 'Khóa chưa đăng ký',
          shortTitle: 'Không thuộc hành trình',
          ageBand: '8-11',
          enrolled: false,
          progressPct: 0,
        },
      ],
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{
      recommendedCourseId: string | null
      courses: Array<{
        id: string
        status: string
        completionPercent: number
        enrolled: boolean
        enrollmentId?: string | null
      }>
    }>('/api/learning/pathway')

    expect(result).toMatchObject({
      recommendedCourseId: 'course-1',
      courses: [{
        id: 'course-1',
        status: 'active',
        completionPercent: 25,
        enrolled: true,
      }],
    })
    expect(result.courses).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://dev-hub.storymee.com/api/v1/lms/me/pathway',
      expect.any(Object),
    )
  })

  it('keeps canonical LMS enrollments that use status instead of enrolled', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      recommendedCourseId: 'course-1',
      courses: [
        {
          id: 'course-1',
          title: 'AI cơ bản',
          shortTitle: 'Khởi đầu',
          status: 'active',
          completionPercent: 40,
          enrollmentId: 'enrollment-1',
        },
        {
          id: 'course-2',
          title: 'Sáng tạo nâng cao',
          shortTitle: 'Nâng cao',
          status: 'completed',
          completionPercent: 100,
          enrollmentId: 'enrollment-2',
        },
      ],
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{
      recommendedCourseId: string | null
      courses: Array<{
        id: string
        status: string
        completionPercent: number
        enrolled: boolean
        enrollmentId?: string | null
      }>
    }>('/api/learning/pathway')

    expect(result).toMatchObject({
      recommendedCourseId: 'course-1',
      courses: [
        { id: 'course-1', status: 'active', completionPercent: 40, enrolled: true },
        { id: 'course-2', status: 'completed', completionPercent: 100, enrolled: true },
      ],
    })
    expect(result.courses[0].enrollmentId).toBe('enrollment-1')
  })

  it('routes the daily learning mission into the LMS world', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response([{
      mission: {
        key: 'daily_lesson',
        title: 'Học mỗi ngày',
        description: 'Hoàn thành một bài học hôm nay',
        cadence: 'daily',
        target: 1,
        xpReward: 10,
      },
      periodKey: '2026-07-29',
      progress: 1,
      completedAt: '2026-07-29T08:00:00.000Z',
      claimedAt: '2026-07-29T08:00:00.000Z',
    }]))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{
      mission: {
        progress: number
        target: number
        periodKey: string
        completedAt: string | null
        claimedAt: string | null
        action: { route: string; label: string }
      } | null
    }>('/api/gamification/daily-mission')

    expect(result.mission?.action.route).toBe('/world')
    expect(result.mission).toMatchObject({
      progress: 1,
      target: 1,
      periodKey: '2026-07-29',
      completedAt: '2026-07-29T08:00:00.000Z',
      claimedAt: '2026-07-29T08:00:00.000Z',
      action: { label: 'Xem hành trình' },
    })
  })

  it('routes the complete learning flow through the LMS compatibility facade', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ quests: [], totalStars: 0, completedCount: 0 }))
      .mockResolvedValueOnce(response({ progress: { status: 'in_progress', phase: 'learn' } }))
      .mockResolvedValueOnce(response({ questionId: 'q1', correct: true }))
      .mockResolvedValueOnce(response({ stars: 3, nextQuestId: null }))
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/progress/11111111-1111-4111-8111-111111111111')
    await api('/api/progress/22222222-2222-4222-8222-222222222222/start', {
      method: 'POST',
    })
    await api('/api/progress/22222222-2222-4222-8222-222222222222/check-answer', {
      method: 'POST',
      body: JSON.stringify({ questionId: 'q1', optionIndex: 1 }),
    })
    await api('/api/progress/22222222-2222-4222-8222-222222222222/check', {
      method: 'POST',
      body: JSON.stringify({ answers: [] }),
    })

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://dev-hub.storymee.com/api/v1/lms/compat/courses/11111111-1111-4111-8111-111111111111/progress',
      'https://dev-hub.storymee.com/api/v1/lms/compat/lessons/22222222-2222-4222-8222-222222222222/start',
      'https://dev-hub.storymee.com/api/v1/lms/compat/lessons/22222222-2222-4222-8222-222222222222/check-answer',
      'https://dev-hub.storymee.com/api/v1/lms/compat/lessons/22222222-2222-4222-8222-222222222222/check',
    ])
    const checkHeaders = fetchMock.mock.calls[3][1].headers as Headers
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

  it('maps child creation PIN to the Account credential required for its users row', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      status: 'success',
      data: {
        child: {
          id: 'child-new',
          name: 'Bé Bo',
          avatarUrl: 'avatar-robot',
        },
      },
    }, 201))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{ child: { id: string } }>(
      '/api/parent/children',
      {
        method: 'POST',
        body: JSON.stringify({
          nickname: 'Bé Bo',
          avatarId: 'avatar-robot',
          pin: '424242',
        }),
      },
    )

    expect(result.child.id).toBe('child-new')
    const [, request] = fetchMock.mock.calls[0]
    expect(request.method).toBe('POST')
    const payload = JSON.parse(String(request.body))
    expect(payload).toMatchObject({
      name: 'Bé Bo',
      ageBand: '8-11',
      avatarUrl: 'avatar-robot',
      language: 'vi',
      allowAiCreate: true,
      allowPhoto: true,
      allowExport: true,
      pin: '424242',
    })
    expect(payload.password).not.toBe('424242')
  })

  it('keeps child profile age-band updates separate from the parent-owned PIN endpoint', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
      status: 'success',
      data: { child: { id: 'child-1', name: 'Bé Mây', ageBand: '8-11' } },
      }))
      .mockResolvedValueOnce(response({
        status: 'success',
        data: { child: { id: 'child-1', name: 'Bé Mây', ageBand: '8-11' } },
      }))
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/parent/children/child-1', {
      method: 'PATCH',
      body: JSON.stringify({
        nickname: 'Bé Mây',
        avatarId: 'avatar-robot',
        ageBand: '8-11',
        pin: '424242',
      }),
    })
    await api('/api/parent/children/child-1/pin', {
      method: 'POST',
      body: JSON.stringify({ pin: '424242' }),
    })

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://dev-hub.storymee.com/api/v1/account/family/children/child-1',
    )
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Bé Mây',
        avatarUrl: 'avatar-robot',
        ageBand: '8-11',
      }),
    }))
    expect(fetchMock.mock.calls[1][0]).toBe(
      'https://dev-hub.storymee.com/api/v1/account/family/children/child-1/pin',
    )
    expect(fetchMock.mock.calls[1][1]).toEqual(expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ pin: '424242' }),
    }))
  })

  it('routes teacher classroom and authoring calls to core LMS', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ class: null, students: [] }))
      .mockResolvedValueOnce(response({ assignment: { id: 'assignment-1' } }))
      .mockResolvedValueOnce(response({ assignment: { id: 'assignment-1' } }))
      .mockResolvedValueOnce(response({ courses: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/teacher/class')
    await api('/api/teacher/class/course', {
      method: 'POST',
      body: JSON.stringify({ courseId: '22222222-2222-4222-8222-222222222222' }),
    })
    await api('/api/teacher/class/course/22222222-2222-4222-8222-222222222222', {
      method: 'DELETE',
    })
    await api('/api/teacher/lectures')

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://dev-hub.storymee.com/api/v1/lms/aikids/teacher/class',
      'https://dev-hub.storymee.com/api/v1/lms/aikids/teacher/class/course',
      'https://dev-hub.storymee.com/api/v1/lms/aikids/teacher/class/course/22222222-2222-4222-8222-222222222222',
      'https://dev-hub.storymee.com/api/v1/lms/aikids/teacher/lectures',
    ])
  })

  it('routes parent course selection to the owned child LMS resource', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      child: {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Bé Mây',
        ageBand: '9-12',
      },
      courses: [{
        id: '22222222-2222-4222-8222-222222222222',
        slug: 'ai-co-ban',
        title: 'AI cơ bản',
        shortTitle: 'AI cơ bản',
        ageBand: '9-12',
        metadata: { tagline: 'Khám phá AI' },
        stationCount: 8,
        lectures: [
          { id: 'station-1', order: 1, title: 'Máy học được không?' },
          { id: 'station-2', order: 2, title: 'Dữ liệu là gì?' },
        ],
        enrolled: true,
        parentAllowed: true,
      }],
    }))
    vi.stubGlobal('fetch', fetchMock)

    const childId = '11111111-1111-4111-8111-111111111111'
    const result = await api<{
      child: { nickname: string | null }
      courses: Array<{ enrolled: boolean; ageTrack: string; questCount: number; stations: Array<{ title: string }> }>
    }>(`/api/parent/children/${childId}/courses`)

    expect(result.child.nickname).toBe('Bé Mây')
    expect(result.courses[0]).toMatchObject({
      enrolled: true,
      ageTrack: '9-12',
      questCount: 8,
      stations: [
        { title: 'Máy học được không?' },
        { title: 'Dữ liệu là gì?' },
      ],
    })
    expect(fetchMock).toHaveBeenCalledWith(
      `https://dev-hub.storymee.com/api/v1/lms/family/children/${childId}/courses`,
      expect.any(Object),
    )
  })

  it('collapses duplicate catalog rows and preserves the real enrollment signal', async () => {
    const childId = '11111111-1111-4111-8111-111111111111'
    const fetchMock = vi.fn().mockResolvedValue(response({
      child: { id: childId, name: 'Bé Mây' },
      courses: [
        { id: 'course-1', title: 'Vùng 1', enrolled: false, metadata: { programId: 'program-1' } },
        { id: 'course-1', title: 'Vùng 1', enrolled: true, parentAllowed: true, metadata: { programId: 'program-1' } },
      ],
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{ courses: Array<{ id: string; enrolled: boolean }> }>(
      `/api/parent/children/${childId}/courses`,
    )

    expect(result.courses).toEqual([expect.objectContaining({ id: 'course-1', enrolled: true })])
  })

  it('collapses duplicate pathway rows by course and keeps the strongest state', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      pathway: {
        student: { nickname: 'Mây', ageBand: '8-11' },
        courses: [
          { id: 'course-1', title: 'AI cơ bản', status: 'available', completionPercent: 0 },
          { id: 'course-1', title: 'AI cơ bản', status: 'active', completionPercent: 45 },
        ],
      },
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{ recommendedCourseId: string; courses: Array<{ id: string; status: string; completionPercent: number }> }>('/api/learning/pathway')

    expect(result.recommendedCourseId).toBe('course-1')
    expect(result.courses).toEqual([expect.objectContaining({ id: 'course-1', status: 'active', completionPercent: 45 })])
  })

  it('routes parent consent changes to Account and preserves the child scope', async () => {
    const childId = '55555555-5555-4555-8555-555555555555'
    const fetchMock = vi.fn().mockResolvedValue(response({
      status: 'success',
      data: { child: { id: childId, consent: { allowAiCreate: true } } },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await api(`/api/parent/children/${childId}/consent`, {
      method: 'PATCH',
      body: JSON.stringify({ allowAiCreate: true, policyVersion: 'aikids-child-safety-v1' }),
    })

    expect(fetchMock).toHaveBeenCalledWith(
      `https://dev-hub.storymee.com/api/v1/account/family/children/${childId}/consent`,
      expect.objectContaining({ method: 'PATCH' }),
    )
  })

  it('loads the auditable parent consent history from Account', async () => {
    const childId = '55555555-5555-4555-8555-555555555555'
    const events = [{ id: 'event-1', method: 'parent_ui' }]
    const fetchMock = vi.fn().mockResolvedValue(response({
      status: 'success',
      data: { events },
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{ events: typeof events }>(
      `/api/parent/children/${childId}/consent/events`,
    )

    expect(result.events).toEqual(events)
    expect(fetchMock).toHaveBeenCalledWith(
      `https://dev-hub.storymee.com/api/v1/account/family/children/${childId}/consent/events`,
      expect.any(Object),
    )
  })

  it('creates course checkout through Billing with a replay-safe idempotency key', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      status: 'success',
      data: { paymentIntent: { publicId: 'pi_course_1' } },
      checkout: { paymentReady: false, transferHint: 'CK AIKIDS' },
    }, 201))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{ checkout: { transferHint: string } }>('/api/parent/course-checkout', {
      method: 'POST',
      body: JSON.stringify({
        courseId: 'course-1',
        childProfileId: '55555555-5555-4555-8555-555555555555',
      }),
    })

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('https://dev-hub.storymee.com/api/v1/billing/me/course-checkout')
    const headers = options.headers as Headers
    expect(headers.get('Idempotency-Key')).toMatch(/^[0-9a-f-]{36}$/)
    expect(JSON.parse(String(options.body))).toMatchObject({
      courseId: 'course-1',
      childProfileId: '55555555-5555-4555-8555-555555555555',
    })
    expect(result.checkout.transferHint).toBe('CK AIKIDS')
  })

  it('routes parent checkout status without exposing a service URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      status: 'success',
      data: { paymentIntent: { publicId: 'pi_course_1', status: 'pending' } },
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api<{ paymentIntent: { status: string } }>(
      '/api/parent/course-checkout/pi_course_1',
    )

    expect(fetchMock).toHaveBeenCalledWith(
      'https://dev-hub.storymee.com/api/v1/billing/me/course-checkout/pi_course_1',
      expect.any(Object),
    )
    expect(result.paymentIntent.status).toBe('pending')
  })

  it('deduplicates concurrent identical GET requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ courses: [] }))
    vi.stubGlobal('fetch', fetchMock)

    const [first, second] = await Promise.all([
      api('/api/courses'),
      api('/api/courses'),
    ])

    expect(first).toEqual(second)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('maps learner notes and bookmarks to the core LMS contracts', async () => {
    const lessonId = '33333333-3333-4333-8333-333333333333'
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        notes: [{
          id: 'n1',
          body: 'Nhớ kiểm tra nguồn',
          anchor: { sectionId: 'learn' },
          version: 1,
        }],
      }))
      .mockResolvedValueOnce(response({
        bookmarks: [{
          id: 'b1',
          label: 'Phần thực hành',
          anchorKey: 'section:practice',
        }],
      }))
    vi.stubGlobal('fetch', fetchMock)

    const noteResult = await api<{ notes: Array<{ anchorValue: string }> }>(
      `/api/learning/quests/${lessonId}/notes`,
    )
    const bookmarkResult = await api<{
      bookmarks: Array<{ anchorValue: string }>
    }>(`/api/learning/quests/${lessonId}/bookmarks`)

    expect(noteResult.notes[0].anchorValue).toBe('learn')
    expect(bookmarkResult.bookmarks[0].anchorValue).toBe('practice')
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      `https://dev-hub.storymee.com/api/v1/lms/lessons/${lessonId}/notes`,
      `https://dev-hub.storymee.com/api/v1/lms/lessons/${lessonId}/bookmarks`,
    ])
  })

  it('routes student and parent age policies to the learner-owned LMS resources', async () => {
    const childId = '44444444-4444-4444-8444-444444444444'
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        ageBand: '9-12',
        status: 'ready',
        policy: {},
      }))
      .mockResolvedValueOnce(response({
        ageBand: '9-12',
        status: 'ready',
        policy: {},
      }))
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/learning/age-policy')
    await api(`/api/learning/age-policy?studentId=${childId}`)

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://dev-hub.storymee.com/api/v1/lms/me/age-policy',
      `https://dev-hub.storymee.com/api/v1/lms/family/children/${childId}/age-policy`,
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

  it('exchanges every Firebase provider token through the generic account session route', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(response({
      accessToken: 'firebase-session',
      user: { id: 'u-firebase', role: 'parent', name: 'Firebase Parent' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/auth/login/firebase', {
      method: 'POST',
      body: JSON.stringify({ idToken: 'firebase-id-token', role: 'parent' }),
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://dev-hub.storymee.com/api/v1/account/auth/firebase/session',
      expect.any(Object),
    )
  })

  it('routes parent approvals, profile, gate and admin surfaces to core domains', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ data: { approvals: [] } }))
      .mockResolvedValueOnce(response({ data: { profile: { preferredLanguage: 'vi' } } }))
      .mockResolvedValueOnce(response({
        user: { id: 'p1', role: 'parent' },
        token: 'parent-session-token',
      }))
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
      'https://dev-hub.storymee.com/api/v1/account/family/gate-verify',
      'https://dev-hub.storymee.com/api/v1/system/aikids/admin/summary',
      'https://dev-hub.storymee.com/api/v1/account/admin/users',
      'https://dev-hub.storymee.com/api/v1/lms/aikids/admin/courses',
      'https://dev-hub.storymee.com/api/v1/jobs/providers/policy',
    ])
    expect(localStorage.getItem('storymee.access_token')).toBe('parent-session-token')
  })

  it('routes revocable child profile shares through the Account boundary', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ data: { shares: [] } }))
      .mockResolvedValueOnce(response({ data: { share: { id: 'share-1' } } }))
      .mockResolvedValueOnce(response({ data: { revoked: true } }))
      .mockResolvedValueOnce(response({ data: {
        share: { expiresAt: null },
        profile: { nickname: 'Bo' },
        achievements: [],
        works: [],
      } }))
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/parent/profile-shares')
    await api('/api/parent/profile-shares', {
      method: 'POST',
      body: JSON.stringify({ childId: 'child-1', expiresInDays: 30 }),
    })
    await api('/api/parent/profile-shares/share-1', { method: 'DELETE' })
    await api('/api/public/profile-shares/safe-token')

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://dev-hub.storymee.com/api/v1/account/family/profile-shares',
      'https://dev-hub.storymee.com/api/v1/account/family/profile-shares',
      'https://dev-hub.storymee.com/api/v1/account/family/profile-shares/share-1',
      'https://dev-hub.storymee.com/api/v1/account/public/profile-shares/safe-token',
    ])
  })

  it('normalizes generated gallery items for backpack filters and sharing', async () => {
    const gallery = {
      data: {
        items: [
          {
            id: 'generated-art',
            jobId: 'job-art',
            url: 'https://cdn.example/art.webp',
            metadata: JSON.stringify({ title: 'Mèo phi hành gia', assetType: 'image' }),
          },
          {
            id: 'comic-page',
            generationJobId: 'job-comic',
            thumbnailUrl: 'https://cdn.example/comic.webp',
            shareStatus: 'pending_approval',
            metadata: {
              title: 'Chuyến đi Sao Hỏa',
              contentType: 'comic-page',
              content: 'Bốn khung truyện',
            },
          },
          {
            id: 'old-story',
            imageUrl: 'sb://stories/cover.webp',
            status: 'published',
            metadata: {
              purpose: 'creative_workshop',
              creativeKind: 'story',
              originalName: 'Cây đèn dũng cảm',
            },
          },
        ],
      },
    }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response(gallery))
      .mockResolvedValueOnce(response(gallery))
    vi.stubGlobal('fetch', fetchMock)

    const backpack = await api<{
      assets: Array<{ id: string; type: string; thumbnail: string; jobId: string | null }>
    }>('/api/backpack')
    const projects = await api<{
      projects: Array<{ id: string; title: string; kind: string; shareStatus: string }>
    }>('/api/projects')

    expect(backpack.assets).toEqual([
      expect.objectContaining({
        id: 'generated-art',
        type: 'generated-image',
        thumbnail: 'https://cdn.example/art.webp',
        jobId: 'job-art',
      }),
    ])
    expect(projects.projects).toEqual([
      expect.objectContaining({
        id: 'comic-page',
        title: 'Chuyến đi Sao Hỏa',
        kind: 'comic',
        shareStatus: 'pending',
      }),
      expect.objectContaining({
        id: 'old-story',
        title: 'Cây đèn dũng cảm',
        kind: 'story',
        shareStatus: 'approved',
      }),
    ])
  })

  it('adapts admin user edits to the core account contract', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(response({
      status: 'success',
      data: { id: 'student-1' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/admin/users/student-1', {
      method: 'PATCH',
      body: JSON.stringify({
        nickname: 'Bé Bo',
        role: 'student',
        email: 'bo@example.com',
        password: 'new-password',
      }),
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://dev-hub.storymee.com/api/v1/account/admin/users/student-1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          nickname: 'Bé Bo',
          role: 'user',
          email: 'bo@example.com',
          password: 'new-password',
          name: 'Bé Bo',
        }),
      }),
    )
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
