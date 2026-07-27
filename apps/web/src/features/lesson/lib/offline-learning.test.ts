import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/shared/lib/api'
import {
  clearOfflineLearningData,
  queueOfflineProgress,
  syncOfflineProgress,
} from './offline-learning'

vi.mock('@/shared/lib/api', () => ({
  api: vi.fn(),
}))

class MemoryStorage {
  private readonly values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('offline learning sync', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: new MemoryStorage(),
    })
    vi.mocked(api).mockReset()
  })

  it('unwraps the API sync envelope and clears accepted local events', async () => {
    localStorage.setItem(
      'aikids.learning.offline-grant.quest-1',
      JSON.stringify({
        grantId: '1b2781d1-6d8b-4fae-8e18-51a6f31bb438',
        contentVersion: 2,
        expiresAt: '2099-01-01T00:00:00.000Z',
      }),
    )
    queueOfflineProgress('quest-1', {
      percent: 65,
      positionSeconds: 42,
      sectionId: 'practice',
    })
    vi.mocked(api).mockResolvedValue({
      sync: { accepted: 1, duplicate: 0, resume: null },
    })

    await expect(syncOfflineProgress('quest-1')).resolves.toEqual({
      accepted: 1,
      duplicate: 0,
      resume: null,
    })
    expect(
      localStorage.getItem('aikids.learning.offline-events.quest-1'),
    ).toBeNull()
  })

  it('removes learner-scoped grants, events and device identity on session change', async () => {
    localStorage.setItem('aikids.learning.device-id', 'web.shared-device')
    localStorage.setItem(
      'aikids.learning.offline-grant.quest-1',
      '{"grantId":"old"}',
    )
    localStorage.setItem(
      'aikids.learning.offline-events.quest-1',
      '[{"clientEventId":"old"}]',
    )
    localStorage.setItem('unrelated.preference', 'keep')

    await clearOfflineLearningData()

    expect(localStorage.getItem('aikids.learning.device-id')).toBeNull()
    expect(
      localStorage.getItem('aikids.learning.offline-grant.quest-1'),
    ).toBeNull()
    expect(
      localStorage.getItem('aikids.learning.offline-events.quest-1'),
    ).toBeNull()
    expect(localStorage.getItem('unrelated.preference')).toBe('keep')
  })
})
