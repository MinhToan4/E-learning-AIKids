import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, clearAccessToken, getCacheTtlMs } from './api'
import { clearApiCache } from './api-cache'

const ok = (revision = 1) => new Response(JSON.stringify({
  status: 'success',
  data: { revision },
}), {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
})

describe('authoritative browser API reads', () => {
  beforeEach(() => {
    clearAccessToken()
    clearApiCache()
    vi.restoreAllMocks()
  })

  it('does not assign a browser response-cache TTL to any API route', () => {
    expect(getCacheTtlMs('/api/courses')).toBe(0)
    expect(getCacheTtlMs('/api/gamification/profile')).toBe(0)
    expect(getCacheTtlMs('/api/auth/firebase/config')).toBe(0)
  })

  it('fetches again after a completed GET so server state stays authoritative', async () => {
    let revision = 0
    const fetchMock = vi.fn().mockImplementation(async () => ok(++revision))
    vi.stubGlobal('fetch', fetchMock)

    await api('/api/backpack')
    await api('/api/backpack')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('correlates each wire request without changing explicit retry or trace keys', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => ok())
    vi.stubGlobal('fetch', fetchMock)
    await api('/api/backpack')
    await api('/api/backpack')
    const first = new Headers(fetchMock.mock.calls[0][1].headers).get('X-Request-Id')
    const second = new Headers(fetchMock.mock.calls[1][1].headers).get('X-Request-Id')
    expect(first).toBeTruthy()
    expect(second).not.toBe(first)
    await api('/api/projects', { method: 'POST', headers: {
      'X-Request-Id': 'explicit-trace-123', 'Idempotency-Key': 'stable-retry-key',
    }, body: '{}' })
    const headers = new Headers(fetchMock.mock.calls[2][1].headers)
    expect(headers.get('X-Request-Id')).toBe('explicit-trace-123')
    expect(headers.get('Idempotency-Key')).toBe('stable-retry-key')
  })

  it('coalesces only concurrent identical GET requests', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    const fetchMock = vi.fn().mockImplementation(async () => {
      await gate
      return ok()
    })
    vi.stubGlobal('fetch', fetchMock)

    const first = api('/api/projects')
    const second = api('/api/projects')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    release()
    await Promise.all([first, second])
    await api('/api/projects')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('lets one caller abort without cancelling a shared in-flight request', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    const fetchMock = vi.fn().mockImplementation(async () => {
      await gate
      return ok()
    })
    vi.stubGlobal('fetch', fetchMock)

    const controller = new AbortController()
    const aborted = api('/api/courses', { signal: controller.signal })
    const active = api('/api/courses')
    controller.abort()
    release()

    await expect(aborted).rejects.toThrow()
    await expect(active).resolves.toBeDefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not reuse a GET that was in flight before a related mutation', async () => {
    let releaseFirst!: () => void
    const firstGate = new Promise<void>((resolve) => { releaseFirst = resolve })
    let call = 0
    const fetchMock = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      call += 1
      if (call === 1) await firstGate
      return ok(init?.method === 'POST' ? 2 : call)
    })
    vi.stubGlobal('fetch', fetchMock)

    const staleRead = api('/api/gamification/profile')
    await api('/api/progress/lesson-1/start', { method: 'POST', body: '{}' })
    const freshRead = api('/api/gamification/profile')
    releaseFirst()

    await Promise.all([staleRead, freshRead])
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})

it('rejects a read that completes after the session changes', async () => {
  let release!: (value: Response) => void
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { release = resolve })))
  const oldRead = api('/api/projects')
  const assertion = expect(oldRead).rejects.toMatchObject({ name: 'AbortError' })
  clearAccessToken()
  release(ok())
  await assertion
})
