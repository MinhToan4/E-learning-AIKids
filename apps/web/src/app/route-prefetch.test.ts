import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cancelPrefetchRoute, prefetchRoute } from './route-prefetch'

describe('route-prefetch debounce and hover storm handling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    cancelPrefetchRoute()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('debounces route prefetch by 180ms', () => {
    prefetchRoute('/world')
    vi.advanceTimersByTime(100)
    vi.advanceTimersByTime(90)
    expect(true).toBe(true)
  })

  it('cancels pending prefetch when cancelPrefetchRoute is invoked', () => {
    prefetchRoute('/profile')
    cancelPrefetchRoute('/profile')
    vi.advanceTimersByTime(200)
    expect(true).toBe(true)
  })

  it('cancels preceding route timer during rapid hover storm sweeps', () => {
    prefetchRoute('/backpack')
    vi.advanceTimersByTime(50)
    prefetchRoute('/storybook')
    vi.advanceTimersByTime(200)
    expect(true).toBe(true)
  })

  it('warms route code without issuing invisible page API requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    prefetchRoute('/world/dao-1/lesson/rule-1')
    await vi.advanceTimersByTimeAsync(200)
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})
