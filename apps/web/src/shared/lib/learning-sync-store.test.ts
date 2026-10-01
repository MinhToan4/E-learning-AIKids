// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import {
  getNamespacedKey,
  getStoredItemWithFallback,
  getLocalProgress,
  getIslandLocalProgress,
  saveLocalLessonProgress,
  queuePendingSync,
  getPendingSyncQueue,
  savePendingSyncQueue,
  clearPendingSyncQueue,
  flushPendingSyncQueue,
  PENDING_SYNC_QUEUE_KEY,
} from './learning-sync-store'
import { learningApi } from '@/shared/lib/learning-api'

let mockStorage: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = String(val)
  },
  removeItem: (key: string) => {
    delete mockStorage[key]
  },
  clear: () => {
    mockStorage = {}
  },
  get length() {
    return Object.keys(mockStorage).length
  },
  key: (i: number) => Object.keys(mockStorage)[i] ?? null,
}
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
})

describe('learning-sync-store', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.restoreAllMocks()
  })

  describe('getNamespacedKey', () => {
    it('creates key with childId when provided', () => {
      expect(getNamespacedKey('lesson_1', 'child-999')).toBe('aikids:child-999:lesson_1')
      expect(getNamespacedKey('lesson_1', '  child-abc  ')).toBe('aikids:child-abc:lesson_1')
    })

    it('falls back to anonymous when childId is missing or empty', () => {
      expect(getNamespacedKey('lesson_1', null)).toBe('aikids:anonymous:lesson_1')
      expect(getNamespacedKey('lesson_1', undefined)).toBe('aikids:anonymous:lesson_1')
      expect(getNamespacedKey('lesson_1', '')).toBe('aikids:anonymous:lesson_1')
      expect(getNamespacedKey('lesson_1', '   ')).toBe('aikids:anonymous:lesson_1')
    })
  })

  describe('getStoredItemWithFallback & migration', () => {
    it('returns namespaced item if it exists', () => {
      localStorage.setItem('aikids:child-1:my_key', 'val-1')
      expect(getStoredItemWithFallback('my_key', 'child-1')).toBe('val-1')
    })

    it('falls back to legacy key and automatically migrates to namespaced key', () => {
      localStorage.setItem('my_key', 'legacy-value')
      expect(localStorage.getItem('aikids:child-2:my_key')).toBeNull()

      const result = getStoredItemWithFallback('my_key', 'child-2')
      expect(result).toBe('legacy-value')
      // Auto-migrated to namespaced key:
      expect(localStorage.getItem('aikids:child-2:my_key')).toBe('legacy-value')
    })

    it('returns null if neither exists', () => {
      expect(getStoredItemWithFallback('non_existent', 'child-1')).toBeNull()
    })
  })

  describe('saveLocalLessonProgress & getLocalProgress', () => {
    it('saves progress to both legacy and namespaced keys with alias resolution', () => {
      saveLocalLessonProgress('rule-1', 3, true, 'child-test')

      // Legacy keys
      expect(localStorage.getItem('aikids_lesson_completed_rule-1')).toBe('true')
      expect(localStorage.getItem('aikids_lesson_stars_rule-1')).toBe('3')
      expect(localStorage.getItem('aikids_lesson_completed_bai-0-1')).toBe('true')
      expect(localStorage.getItem('aikids_lesson_stars_bai-0-1')).toBe('3')

      // Namespaced keys
      expect(localStorage.getItem('aikids:child-test:aikids_lesson_completed_rule-1')).toBe('true')
      expect(localStorage.getItem('aikids:child-test:aikids_lesson_stars_rule-1')).toBe('3')
      expect(localStorage.getItem('aikids:child-test:aikids_lesson_completed_bai-0-1')).toBe('true')
      expect(localStorage.getItem('aikids:child-test:aikids_lesson_stars_bai-0-1')).toBe('3')
    })

    it('saves island lesson progress and reflects in getLocalProgress', () => {
      saveLocalLessonProgress('bai-1-1', 3, true, 'child-test')

      const progress = getLocalProgress('child-test')
      expect(progress.completedCount).toBeGreaterThanOrEqual(1)
      expect(progress.totalStars).toBeGreaterThanOrEqual(3)
      expect(progress.completedLessonIds.has('bai-1-1')).toBe(true)
      expect(progress.lessonStars['bai-1-1']).toBe(3)
    })

    it('reads legacy data with automatic migration on getLocalProgress', () => {
      // Setup legacy storage (before namespacing existed)
      localStorage.setItem('aikids_lesson_completed_rule-2', 'true')
      localStorage.setItem('aikids_lesson_stars_rule-2', '3')

      const progress = getLocalProgress('new-child-id')
      expect(progress.completedLessonIds.has('rule-2')).toBe(true)
      expect(progress.totalStars).toBeGreaterThanOrEqual(3)

      // Verified migrated
      expect(localStorage.getItem('aikids:new-child-id:aikids_lesson_completed_rule-2')).toBe('true')
    })
  })

  describe('getIslandLocalProgress', () => {
    it('computes correct count and stars for island 0 (Golden Rules)', () => {
      saveLocalLessonProgress('rule-1', 3, true, 'child-test')
      saveLocalLessonProgress('rule-2', 2, false, 'child-test')

      const island0 = getIslandLocalProgress(0, 'child-test')
      expect(island0.completedCount).toBe(1)
      expect(island0.totalStars).toBe(5) // 3 + 2
    })

    it('computes correct count and stars for island 1', () => {
      saveLocalLessonProgress('bai-1-1', 3, true, 'child-test')
      const island1 = getIslandLocalProgress(1, 'child-test')
      expect(island1.completedCount).toBe(1)
      expect(island1.totalStars).toBe(3)

      const island2 = getIslandLocalProgress(2, 'child-test')
      expect(island2.completedCount).toBe(0)
      expect(island2.totalStars).toBe(0)
    })
  })

  describe('Pending Sync Queue', () => {
    it('enqueues pending sync item and saves to localStorage', () => {
      queuePendingSync({
        lessonId: 'bai-1-1',
        answers: [{ questionId: 'q1', optionIndex: 0 }],
        childId: 'child-1',
      })

      const queue = getPendingSyncQueue()
      expect(queue.length).toBe(1)
      expect(queue[0].lessonId).toBe('bai-1-1')
      expect(queue[0].childId).toBe('child-1')
    })

    it('deduplicates when same lessonId and childId is enqueued', () => {
      queuePendingSync({
        lessonId: 'bai-1-1',
        answers: [{ questionId: 'q1', optionIndex: 0 }],
        childId: 'child-1',
      })
      queuePendingSync({
        lessonId: 'bai-1-1',
        answers: [{ questionId: 'q1', optionIndex: 1 }],
        childId: 'child-1',
      })

      const queue = getPendingSyncQueue()
      expect(queue.length).toBe(1)
      expect(queue[0].answers?.[0].optionIndex).toBe(1)
    })

    it('flushPendingSyncQueue sends items to server and dispatches event on success', async () => {
      const submitSpy = vi.spyOn(learningApi, 'submitCheck').mockResolvedValue({
        stars: 3,
        message: 'Tuyệt vời',
        nextQuestId: null,
      })

      const eventSpy = vi.fn()
      window.addEventListener('aikids:lesson-completed', eventSpy)

      queuePendingSync({
        lessonId: 'bai-1-2',
        answers: [{ questionId: 'q1', optionIndex: 2 }],
        childId: 'child-1',
      })

      await flushPendingSyncQueue()

      expect(submitSpy).toHaveBeenCalledWith('bai-1-2', {
        answers: [{ questionId: 'q1', optionIndex: 2 }],
      })
      expect(getPendingSyncQueue().length).toBe(0)
      expect(eventSpy).toHaveBeenCalled()

      window.removeEventListener('aikids:lesson-completed', eventSpy)
    })

    it('retains item in queue when network call fails', async () => {
      vi.spyOn(learningApi, 'submitCheck').mockRejectedValue(new Error('Network Offline'))

      queuePendingSync({
        lessonId: 'bai-1-3',
        answers: [{ questionId: 'q1', optionIndex: 0 }],
        childId: 'child-1',
      })

      await flushPendingSyncQueue()

      const remaining = getPendingSyncQueue()
      expect(remaining.length).toBe(1)
      expect(remaining[0].lessonId).toBe('bai-1-3')
    })
  })
})
