import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  checkVersion,
  DEFAULT_RELOAD_STORAGE_KEY,
  fetchVersion,
  getCurrentBuildId,
  initVersionChecker,
  reloadPage,
  setCurrentBuildId,
} from './version-checker'

describe('version-checker', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    sessionStorage.clear()
    setCurrentBuildId(null)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('fetchVersion', () => {
    it('fetches and returns version data', async () => {
      const mockData = { buildId: 'v1.0.0', buildTime: '2026-09-30T00:00:00.000Z' }
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response)

      const result = await fetchVersion('/version.json')
      expect(result).toEqual(mockData)
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/version\.json\?t=\d+/),
        expect.objectContaining({
          cache: 'no-store',
        }),
      )
    })

    it('returns null when fetch fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network offline'))
      const result = await fetchVersion('/version.json')
      expect(result).toBeNull()
    })

    it('returns null when response is not ok', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response)
      const result = await fetchVersion('/version.json')
      expect(result).toBeNull()
    })
  })

  describe('reloadPage', () => {
    it('saves timestamp in sessionStorage and invokes reloadFn', () => {
      const reloadMock = vi.fn()
      const reloaded = reloadPage(reloadMock, DEFAULT_RELOAD_STORAGE_KEY, 15000)

      expect(reloaded).toBe(true)
      expect(reloadMock).toHaveBeenCalledTimes(1)
      expect(sessionStorage.getItem(DEFAULT_RELOAD_STORAGE_KEY)).not.toBeNull()
    })

    it('throttles reload if triggered too quickly', () => {
      const reloadMock = vi.fn()
      const now = Date.now()
      sessionStorage.setItem(DEFAULT_RELOAD_STORAGE_KEY, String(now - 5000)) // 5 seconds ago

      const reloaded = reloadPage(reloadMock, DEFAULT_RELOAD_STORAGE_KEY, 15000) // 15s throttle
      expect(reloaded).toBe(false)
      expect(reloadMock).not.toHaveBeenCalled()
    })

    it('allows reload if throttle duration has elapsed', () => {
      const reloadMock = vi.fn()
      const now = Date.now()
      sessionStorage.setItem(DEFAULT_RELOAD_STORAGE_KEY, String(now - 20000)) // 20s ago

      const reloaded = reloadPage(reloadMock, DEFAULT_RELOAD_STORAGE_KEY, 15000)
      expect(reloaded).toBe(true)
      expect(reloadMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('checkVersion', () => {
    it('sets initial buildId on first run without reloading', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ buildId: 'build-aaa' }),
      } as Response)

      const reloadMock = vi.fn()
      const updated = await checkVersion({ reload: reloadMock })

      expect(updated).toBe(false)
      expect(getCurrentBuildId()).toBe('build-aaa')
      expect(reloadMock).not.toHaveBeenCalled()
    })

    it('does not reload when version matches currentBuildId', async () => {
      setCurrentBuildId('build-aaa')
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ buildId: 'build-aaa' }),
      } as Response)

      const reloadMock = vi.fn()
      const updated = await checkVersion({ reload: reloadMock })

      expect(updated).toBe(false)
      expect(reloadMock).not.toHaveBeenCalled()
    })

    it('triggers reload when buildId changes in production', async () => {
      setCurrentBuildId('build-aaa')
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ buildId: 'build-bbb' }),
      } as Response)

      const reloadMock = vi.fn()
      const onUpdateMock = vi.fn()
      const updated = await checkVersion({
        reload: reloadMock,
        onUpdateDetected: onUpdateMock,
      })

      expect(updated).toBe(true)
      expect(onUpdateMock).toHaveBeenCalledWith('build-bbb', 'build-aaa')
      expect(reloadMock).toHaveBeenCalledTimes(1)
    })

    it('does not trigger reload when currentBuildId is "dev"', async () => {
      setCurrentBuildId('dev')
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ buildId: 'build-new' }),
      } as Response)

      const reloadMock = vi.fn()
      const updated = await checkVersion({ reload: reloadMock })

      expect(updated).toBe(false)
      expect(reloadMock).not.toHaveBeenCalled()
    })
  })

  describe('initVersionChecker', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('initializes polling and visibility listener, and cleans up properly', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ buildId: 'init-build' }),
      } as Response)

      const reloadMock = vi.fn()
      const cleanup = initVersionChecker({
        checkIntervalMs: 60000,
        reload: reloadMock,
      })

      // Initial check was triggered
      expect(globalThis.fetch).toHaveBeenCalledTimes(1)

      // Advance timer by 60s
      await vi.advanceTimersByTimeAsync(60000)
      expect(globalThis.fetch).toHaveBeenCalledTimes(2)

      // Test visibilitychange
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true,
      })
      document.dispatchEvent(new Event('visibilitychange'))
      expect(globalThis.fetch).toHaveBeenCalledTimes(3)

      // Cleanup
      cleanup()

      // Advance timer again - should NOT call fetch anymore
      await vi.advanceTimersByTimeAsync(60000)
      expect(globalThis.fetch).toHaveBeenCalledTimes(3)

      // Dispatch visibilitychange - should NOT call fetch anymore
      document.dispatchEvent(new Event('visibilitychange'))
      expect(globalThis.fetch).toHaveBeenCalledTimes(3)
    })
  })
})
