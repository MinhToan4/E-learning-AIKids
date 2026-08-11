import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken } from './api'
import { learningApi } from './learning-api'

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
      'https://dev-hub.storymee.com/api/v1/lms/family/children/child-1/pathway',
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
})
