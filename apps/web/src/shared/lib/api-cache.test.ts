import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, clearAccessToken } from './api'

const ok = () => new Response(JSON.stringify({ status: 'success', data: { items: [] } }), {
  status: 200, headers: { 'Content-Type': 'application/json' },
})

describe('short-lived API response cache', () => {
  beforeEach(() => { clearAccessToken(); vi.restoreAllMocks() })

  it('reuses stable CMS catalog reads within the TTL', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => ok())
    vi.stubGlobal('fetch', fetchMock)
    await api('/api/admin/legend-studio')
    await api('/api/admin/legend-studio')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('invalidates cached projections after a mutation', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => ok())
    vi.stubGlobal('fetch', fetchMock)
    await api('/api/admin/legend-studio')
    await api('/api/admin/legend-studio/item-1', { method: 'PUT', body: '{}' })
    await api('/api/admin/legend-studio')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
