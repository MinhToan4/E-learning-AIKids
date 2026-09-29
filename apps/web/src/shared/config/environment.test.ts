import { afterEach, describe, expect, it, vi } from 'vitest'

describe('production environment', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('keeps authenticated API requests same-origin even when a legacy API URL is configured', async () => {
    vi.stubEnv('VITE_APP_ENV', 'production')
    vi.stubEnv('VITE_API_URL', 'https://dev-hub.storymee.com')
    vi.resetModules()

    const { environment } = await import('./environment')

    expect(environment.name).toBe('production')
    expect(environment.apiBaseUrl).toBe('')
  })

  it('uses the Vite same-origin proxy during browser development', async () => {
    vi.stubEnv('VITE_APP_ENV', 'development')
    vi.stubEnv('VITE_API_URL', 'https://dev-hub.storymee.com')
    vi.stubEnv('MODE', 'development')
    vi.resetModules()

    const { environment } = await import('./environment')

    expect(environment.name).toBe('development')
    expect(environment.apiBaseUrl).toBe('')
  })
})
