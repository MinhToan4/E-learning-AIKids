import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fetchLatestOfficialPlans,
} from './official-plan'

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('official billing plan fetching & caching', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    window.dispatchEvent(new Event('aikids:billing-plans-updated'))
  })

  it('coalesces concurrent fetch calls into a single server request and reuses within 60s TTL', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/billing/admin/plans') || url.includes('/billing/plans')) {
        return Promise.resolve(response({
          status: 'success',
          plans: [
            {
              id: 'aikids_official_129k',
              name: 'Gói Học Toàn Diện',
              amountMinor: 129000,
              currency: 'VND',
              interval: 'month',
              requiresPayment: true,
              tier: 'paid',
            },
          ],
        }))
      }
      return Promise.reject(new Error(`Unexpected ${url}`))
    })
    vi.stubGlobal('fetch', fetchMock)

    // Call concurrently
    const [p1, p2, p3] = await Promise.all([
      fetchLatestOfficialPlans(),
      fetchLatestOfficialPlans(),
      fetchLatestOfficialPlans(),
    ])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(p1).toEqual(p2)
    expect(p2).toEqual(p3)
    expect(p1[0].id).toBe('aikids_official_129k')

    // Call again immediately: should reuse cache without calling server
    const p4 = await fetchLatestOfficialPlans()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(p4).toEqual(p1)
  })

  it('resets cache when receiving aikids:billing-plans-updated event', async () => {
    const fetchMock = vi.fn().mockImplementation(() => {
      return Promise.resolve(response({
        status: 'success',
        plans: [
          {
            id: 'aikids_official_129k',
            name: 'Gói Học Toàn Diện',
            amountMinor: 129000,
            currency: 'VND',
            interval: 'month',
            requiresPayment: true,
            tier: 'paid',
          },
        ],
      }))
    })
    vi.stubGlobal('fetch', fetchMock)

    await fetchLatestOfficialPlans()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // Fire billing-plans-updated event
    window.dispatchEvent(new Event('aikids:billing-plans-updated'))

    // Next fetch should hit the server again
    await fetchLatestOfficialPlans()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

