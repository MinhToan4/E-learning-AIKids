import { advanceSessionScope } from '@/shared/lib/session-scope'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getDashboardCache,
  setDashboardCache,
  getChildLearningCache,
  setChildLearningCache,
  invalidateParentCache,
} from './parent-cache'

describe('parent-cache module', () => {
  beforeEach(() => {
    invalidateParentCache()
    vi.useRealTimers()
  })

  it('stores and retrieves dashboard cache within TTL', () => {
    expect(getDashboardCache()).toBeNull()

    const mockDashboard = {
      kids: [
        {
          id: 'k1',
          nickname: 'Bo',
          avatarId: 'av1',
          level: 2,
          xp: 200,
          active: true,
        },
      ],
      approvals: [],
      sub: null,
    }

    setDashboardCache(mockDashboard)
    expect(getDashboardCache()).toEqual(mockDashboard)
  })

  it('expires dashboard cache after TTL', () => {
    vi.useFakeTimers()
    const mockDashboard = {
      kids: [],
      approvals: [],
      sub: null,
    }

    setDashboardCache(mockDashboard)
    expect(getDashboardCache()).toEqual(mockDashboard)

    // Advance time by 61 seconds (TTL is 60s)
    vi.advanceTimersByTime(61_000)
    expect(getDashboardCache()).toBeNull()
  })

  it('stores and retrieves child learning cache by childId', () => {
    expect(getChildLearningCache('c1')).toBeNull()

    const mockData = {
      progress: { completed: 5 },
      courses: ['course-1'],
    }

    setChildLearningCache('c1', mockData)
    expect(getChildLearningCache('c1')).toEqual(mockData)
    expect(getChildLearningCache('c2')).toBeNull()
  })

  it('expires child learning cache after TTL', () => {
    vi.useFakeTimers()
    setChildLearningCache('c1', { test: true })
    expect(getChildLearningCache('c1')).toEqual({ test: true })

    vi.advanceTimersByTime(61_000)
    expect(getChildLearningCache('c1')).toBeNull()
  })

  it('clears all cache on invalidateParentCache', () => {
    setDashboardCache({ kids: [], approvals: [], sub: null })
    setChildLearningCache('c1', { foo: 'bar' })

    expect(getDashboardCache()).not.toBeNull()
    expect(getChildLearningCache('c1')).not.toBeNull()

    invalidateParentCache()

    expect(getDashboardCache()).toBeNull()
    expect(getChildLearningCache('c1')).toBeNull()
  })

  it('invalidates cache on window parent:reload-data event', () => {
    setDashboardCache({ kids: [], approvals: [], sub: null })
    setChildLearningCache('c1', { foo: 'bar' })

    window.dispatchEvent(new Event('parent:reload-data'))

    expect(getDashboardCache()).toBeNull()
    expect(getChildLearningCache('c1')).toBeNull()
  })
})

it('does not expose household or learner cache after a session transition', () => {
  invalidateParentCache()
  setDashboardCache({ kids: [], approvals: [], sub: null })
  setChildLearningCache('child-a', { progress: 99 })
  advanceSessionScope()
  expect(getDashboardCache()).toBeNull()
  expect(getChildLearningCache('child-a')).toBeNull()
  expect(getChildLearningCache('child-b')).toBeNull()
})
