import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken } from './api'
import { gamificationApi, legendStudioApi } from './gamification-api'

const response = (data: unknown) => new Response(JSON.stringify({ status: 'success', data }), {
  status: 200, headers: { 'Content-Type': 'application/json' },
})

describe('gamification API facades', () => {
  beforeEach(() => { clearAccessToken(); vi.restoreAllMocks() })

  it('routes learner achievements through the me boundary', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ achievements: [] }))
    vi.stubGlobal('fetch', fetchMock)
    await gamificationApi.achievements()
    expect(fetchMock.mock.calls[0][0]).toBe('https://dev-hub.storymee.com/api/v1/gamification/me/achievements')
  })

  it('routes XP bars through the lightweight progression projection', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ totalXp: 120, level: 2 }))
    vi.stubGlobal('fetch', fetchMock)
    await gamificationApi.profile()
    expect(fetchMock.mock.calls[0][0]).toBe('https://dev-hub.storymee.com/api/v1/gamification/me/progression')
  })

  it('routes CMS updates through the admin studio boundary', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ item: {} }))
    vi.stubGlobal('fetch', fetchMock)
    await legendStudioApi.update('item 1', { status: 'review' })
    expect(fetchMock.mock.calls[0][0]).toBe('https://dev-hub.storymee.com/api/v1/gamification/admin/studio/item%201')
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: 'PUT' }))
  })
})
