// @vitest-environment jsdom
import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from './api'
import {
  applyConfirmedXpDelta,
  progressionQueryKey,
  readProgressionSnapshot,
  setProgressionSnapshot,
} from './progression-query'

const learner = (id: string, xp = 0, level = 1): User => ({
  id,
  role: 'student',
  email: null,
  nickname: 'Bạn nhỏ',
  avatarId: null,
  level,
  xp,
  onboarded: true,
  goal: null,
  parentId: null,
  classId: null,
})

describe('shared progression snapshot', () => {
  const values = new Map<string, string>()
  const storage: Storage = {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  }

  beforeEach(() => {
    storage.clear()
    vi.stubGlobal('localStorage', storage)
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: storage,
    })
  })

  it('persists snapshots per learner on shared devices', () => {
    const client = new QueryClient()
    setProgressionSnapshot(client, 'child-a', { totalXp: 250, level: 3 })
    setProgressionSnapshot(client, 'child-b', { totalXp: 40, level: 1 })

    expect(readProgressionSnapshot(learner('child-a'))?.totalXp).toBe(250)
    expect(readProgressionSnapshot(learner('child-b'))?.totalXp).toBe(40)
  })

  it('updates the shared query immediately after a confirmed XP award', () => {
    const client = new QueryClient()
    setProgressionSnapshot(client, 'child-a', { totalXp: 90, level: 1 })

    const next = applyConfirmedXpDelta(client, learner('child-a', 90, 1), 30)

    expect(next).toMatchObject({ totalXp: 120, level: 2, xpIntoLevel: 20 })
    expect(client.getQueryData(progressionQueryKey('child-a'))).toEqual(next)
  })
})
