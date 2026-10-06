import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken } from './api'
import {
  clearSessionLearningCache,
  learningApi,
  lessonStageIndexFromProgress,
  type LearningPathway,
} from './learning-api'

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('learning API facade', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
  })

  it('restores a six-stage lesson from the server checkpoint', () => {
    expect(lessonStageIndexFromProgress({
      status: 'in_progress',
      phase: 'practice',
      stars: 1,
      sectionId: 'stage-5',
    })).toBe(4)
    expect(lessonStageIndexFromProgress({
      status: 'in_progress',
      phase: 'learn',
      stars: 0,
      anchor: { sectionId: 'stage-2' },
    })).toBe(1)
    expect(lessonStageIndexFromProgress({
      status: 'in_progress',
      phase: 'practice',
      stars: 0,
      resume: { sectionId: 'stage-4' },
    })).toBe(3)
  })

  it('keeps child pathway calls on the gateway-owned LMS route', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      status: 'success',
      data: {
        student: { nickname: 'May', ageBand: '8-11' },
        policy: null,
        recommendedCourseId: null,
        courses: [],
      },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await learningApi.getPathway('child-1')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://dev-hub.storymee.com/api/v1/lms/compat/pathway?studentId=child-1',
      expect.any(Object),
    )
  })

  it('preserves the retry-safe check contract behind the facade', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      status: 'success',
      data: {
        passed: true,
        stars: 3,
        message: 'Good work',
        nextQuestId: null,
      },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await learningApi.submitCheck('lesson-1', {
      answers: [{ questionId: 'q-1', optionIndex: 0 }],
    })

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://dev-hub.storymee.com/api/v1/lms/compat/lessons/lesson-1/check',
    )
    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(new Headers(init.headers).get('Idempotency-Key')).toMatch(
      /^[0-9a-f-]{36}$/,
    )
  })

  it('keeps parent feedback reads behind the learning facade', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      status: 'success',
      data: { child: {}, feedback: [] },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await learningApi.getChildTeacherFeedback('child-1')

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://dev-hub.storymee.com/api/v1/lms/family/children/child-1/teacher-feedback',
    )
  })

  it('opens a lesson with one aggregate LMS request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      status: 'success',
      data: {
        quest: { id: 'lesson-1' },
        progress: { status: 'in_progress', phase: 'learn', stars: 0 },
      },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await learningApi.openLesson('lesson-1')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://dev-hub.storymee.com/api/v1/lms/compat/lessons/lesson-1/open',
    )
  })
})

it('does not reuse a lesson-start result across learner sessions', async () => {
  vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(response({ progress: { stars: 0 } }))))
  clearAccessToken()
  await learningApi.startLesson('same-lesson')
  await learningApi.startLesson('same-lesson')
  expect(fetch).toHaveBeenCalledTimes(1)
  clearAccessToken()
  await learningApi.startLesson('same-lesson')
  expect(fetch).toHaveBeenCalledTimes(2)
})

it('coalesces and caches openLesson requests within TTL and allows retry on failure', async () => {
  clearAccessToken()
  const successPayload = { quest: { id: 'lesson-coalesce' }, progress: { status: 'in_progress', phase: 'learn', stars: 0 } }
  let failFirst = true
  const fetchMock = vi.fn().mockImplementation(() => {
    if (failFirst) {
      failFirst = false
      return Promise.resolve(new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 }))
    }
    return Promise.resolve(response({ status: 'success', data: successPayload }))
  })
  vi.stubGlobal('fetch', fetchMock)

  // 1. Initial failed call should reject and evict from dedupe map
  await expect(learningApi.openLesson('lesson-coalesce')).rejects.toThrow()
  expect(fetchMock).toHaveBeenCalledTimes(1)

  // 2. Retry succeeds
  const [res1, res2] = await Promise.all([
    learningApi.openLesson('lesson-coalesce'),
    learningApi.openLesson('lesson-coalesce'),
  ])
  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(res1.quest.id).toBe('lesson-coalesce')
  expect(res2.quest.id).toBe('lesson-coalesce')

  // 3. Clear session invalidates cache
  clearAccessToken()
  await learningApi.openLesson('lesson-coalesce')
  expect(fetchMock).toHaveBeenCalledTimes(3)
})

it('coalesces inflight advanceLesson calls with identical payload', async () => {
  clearAccessToken()
  let resolvePromise: (value: Response) => void
  const pendingPromise = new Promise<Response>((resolve) => {
    resolvePromise = resolve
  })
  const fetchMock = vi.fn().mockReturnValue(pendingPromise)
  vi.stubGlobal('fetch', fetchMock)

  const advanceInput = { fromPhase: 'learn' as const }
  const call1 = learningApi.advanceLesson('lesson-adv', advanceInput)
  const call2 = learningApi.advanceLesson('lesson-adv', advanceInput)

  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(call1).toBe(call2)

  resolvePromise!(response({ status: 'success', data: { progress: { status: 'in_progress', phase: 'game', stars: 1 } } }))
  const [res1, res2] = await Promise.all([call1, call2])
  expect(res1.progress.phase).toBe('game')
  expect(res2.progress.phase).toBe('game')

  // After resolving, advanceInflightRequests has cleared this key, next call fires a new request
  fetchMock.mockResolvedValueOnce(response({ status: 'success', data: { progress: { status: 'in_progress', phase: 'practice', stars: 2 } } }))
  await learningApi.advanceLesson('lesson-adv', advanceInput)
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

it('coalesces and caches getPathway requests within 2500ms TTL and allows retry on failure', async () => {
  clearAccessToken()
  const pathwayPayload: LearningPathway = {
    student: { nickname: 'May', ageBand: '8-11' },
    policy: null,
    recommendedCourseId: null,
    courses: [],
  }
  let failFirst = true
  const fetchMock = vi.fn().mockImplementation(() => {
    if (failFirst) {
      failFirst = false
      return Promise.resolve(new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 }))
    }
    return Promise.resolve(response({ status: 'success', data: pathwayPayload }))
  })
  vi.stubGlobal('fetch', fetchMock)

  // 1. Initial failed call should reject and evict from cache
  await expect(learningApi.getPathway()).rejects.toThrow()
  expect(fetchMock).toHaveBeenCalledTimes(1)

  // 2. Retry succeeds and coalesces concurrent calls
  const [res1, res2] = await Promise.all([
    learningApi.getPathway(),
    learningApi.getPathway(),
  ])
  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(res1.student.nickname).toBe('May')
  expect(res2.student.nickname).toBe('May')

  // 3. Subsequent call within TTL returns cached result without extra fetch
  const res3 = await learningApi.getPathway()
  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(res3.student.nickname).toBe('May')
})

it('invalidates getPathway cache on aikids:lesson-completed and aikids:progression-updated events', async () => {
  clearAccessToken()
  const pathwayPayload: LearningPathway = {
    student: { nickname: 'Bé Bắp', ageBand: '6-7' },
    policy: null,
    recommendedCourseId: null,
    courses: [],
  }
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(response({ status: 'success', data: pathwayPayload })))
  vi.stubGlobal('fetch', fetchMock)

  // 1. First fetch
  await learningApi.getPathway()
  expect(fetchMock).toHaveBeenCalledTimes(1)

  // Repeated call hits cache
  await learningApi.getPathway()
  expect(fetchMock).toHaveBeenCalledTimes(1)

  // 2. aikids:lesson-completed invalidates cache
  window.dispatchEvent(new CustomEvent('aikids:lesson-completed'))
  await learningApi.getPathway()
  expect(fetchMock).toHaveBeenCalledTimes(2)

  // 3. aikids:progression-updated invalidates cache
  window.dispatchEvent(new CustomEvent('aikids:progression-updated'))
  await learningApi.getPathway()
  expect(fetchMock).toHaveBeenCalledTimes(3)
})

it('invalidates getPathway cache when clearSessionLearningCache is explicitly called', async () => {
  clearAccessToken()
  const pathwayPayload: LearningPathway = {
    student: { nickname: 'Sóc Con', ageBand: '8-11' },
    policy: null,
    recommendedCourseId: null,
    courses: [],
  }
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(response({ status: 'success', data: pathwayPayload })))
  vi.stubGlobal('fetch', fetchMock)

  await learningApi.getPathway()
  expect(fetchMock).toHaveBeenCalledTimes(1)

  // Repeated call hits cache
  await learningApi.getPathway()
  expect(fetchMock).toHaveBeenCalledTimes(1)

  // Explicit clearSessionLearningCache
  clearSessionLearningCache()
  await learningApi.getPathway()
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

it('expires getPathway cache after 2500ms TTL', async () => {
  vi.useFakeTimers()
  try {
    clearAccessToken()
    const pathwayPayload: LearningPathway = {
      student: { nickname: 'May', ageBand: '8-11' },
      policy: null,
      recommendedCourseId: null,
      courses: [],
    }
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(response({ status: 'success', data: pathwayPayload })))
    vi.stubGlobal('fetch', fetchMock)

    await learningApi.getPathway()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // Advance 2400ms (still within 2500ms TTL)
    vi.advanceTimersByTime(2400)
    await learningApi.getPathway()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // Advance past 2500ms TTL
    vi.advanceTimersByTime(200)
    await learningApi.getPathway()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  } finally {
    vi.useRealTimers()
  }
})

it('does not reuse pathway results across different learners or sessions', async () => {
  clearAccessToken()
  const payloadChild1: LearningPathway = {
    student: { nickname: 'Child 1', ageBand: '6-7' },
    policy: null,
    recommendedCourseId: null,
    courses: [],
  }
  const payloadChild2: LearningPathway = {
    student: { nickname: 'Child 2', ageBand: '8-11' },
    policy: null,
    recommendedCourseId: null,
    courses: [],
  }
  const fetchMock = vi.fn().mockImplementation((url: string) => {
    if (url.includes('child-1')) return Promise.resolve(response({ status: 'success', data: payloadChild1 }))
    return Promise.resolve(response({ status: 'success', data: payloadChild2 }))
  })
  vi.stubGlobal('fetch', fetchMock)

  const res1 = await learningApi.getPathway('child-1')
  const res2 = await learningApi.getPathway('child-2')
  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(res1.student.nickname).toBe('Child 1')
  expect(res2.student.nickname).toBe('Child 2')

  // Switching session clears cache and refetches
  clearAccessToken()
  await learningApi.getPathway('child-1')
  expect(fetchMock).toHaveBeenCalledTimes(3)
})
