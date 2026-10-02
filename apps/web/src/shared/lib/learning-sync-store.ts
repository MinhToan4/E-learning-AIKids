import { ISLAND_CURRICULUM_LESSONS } from '@/features/lesson/data/island-curriculum-registry'
import { learningApi } from '@/shared/lib/learning-api'

export const PENDING_SYNC_QUEUE_KEY = 'aikids_pending_sync_queue'

export interface PendingSyncItem {
  id?: string
  lessonId: string
  answers?: Array<{ questionId: string; optionIndex: number }>
  fromPhase?: string
  childId?: string
  timestamp?: number
}

export interface LocalLearningProgress {
  completedCount: number
  totalStars: number
  completedLessonIds: Set<string>
  lessonStars: Record<string, number>
}

/**
 * Tạo namespaced storage key theo childId (hoặc anonymous nếu chưa đăng nhập).
 */
export function getNamespacedKey(baseKey: string, childId?: string | null): string {
  const cid = childId && childId.trim() ? childId.trim() : 'anonymous'
  return `aikids:${cid}:${baseKey}`
}

export const LEGACY_MIGRATED_CHILD_ID_KEY = 'aikids:legacy_migrated_child_id'

/**
 * Đọc cache theo learner. Dữ liệu legacy không có owner không được tự động gán
 * cho learner hiện tại; việc đoán owner chính là nguồn gây nhiễm chéo profile.
 */
export function getStoredItemWithFallback(baseKey: string, childId?: string | null): string | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null
  try {
    const isSpecificChild = Boolean(childId && childId.trim() && childId.trim() !== 'anonymous')
    const cid = isSpecificChild ? childId!.trim() : 'anonymous'
    const namespacedKey = `aikids:${cid}:${baseKey}`

    if (isSpecificChild) {
      const namespacedVal = localStorage.getItem(namespacedKey)
      if (namespacedVal !== null) return namespacedVal

      return null
    }

    // Trường hợp anonymous / không có childId cụ thể
    const namespacedVal = localStorage.getItem(namespacedKey)
    if (namespacedVal !== null) return namespacedVal
    // Anonymous preview data may use the old key, but authenticated learners
    // never consume it.
    return localStorage.getItem(baseKey)
  } catch {
    return null
  }
}

/**
 * Quét toàn bộ tiến trình học tập cục bộ từ 10 quy tắc vàng và 22 bài học giáo trình 5 đảo.
 */
export function getLocalProgress(childId?: string | null): LocalLearningProgress {
  let completedCount = 0
  let totalStars = 0
  const completedLessonIds = new Set<string>()
  const lessonStars: Record<string, number> = {}

  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return { completedCount: 0, totalStars: 0, completedLessonIds, lessonStars }
  }

  // 1. Quét 10 quy tắc vàng (Đảo Tiên Quyết)
  for (let r = 1; r <= 10; r++) {
    const isDone =
      getStoredItemWithFallback(`aikids_lesson_completed_rule-${r}`, childId) === 'true' ||
      getStoredItemWithFallback(`aikids_lesson_completed_bai-0-${r}`, childId) === 'true' ||
      Number(getStoredItemWithFallback(`aikids_lesson_stars_rule-${r}`, childId) || 0) >= 3 ||
      Number(getStoredItemWithFallback(`aikids_lesson_stars_bai-0-${r}`, childId) || 0) >= 3

    const stars = Math.max(
      Number(getStoredItemWithFallback(`aikids_lesson_stars_rule-${r}`, childId) || 0),
      Number(getStoredItemWithFallback(`aikids_lesson_stars_bai-0-${r}`, childId) || 0),
      isDone ? 3 : 0,
    )

    const ruleKey = `rule-${r}`
    if (stars > 0) {
      lessonStars[ruleKey] = stars
      lessonStars[`bai-0-${r}`] = stars
      totalStars += stars
    }
    if (isDone) {
      completedCount++
      completedLessonIds.add(ruleKey)
      completedLessonIds.add(`bai-0-${r}`)
    }
  }

  // 2. Quét 22 bài học thuộc 5 đảo chính thức
  for (const lesson of ISLAND_CURRICULUM_LESSONS) {
    const isDone =
      getStoredItemWithFallback(`aikids_lesson_completed_${lesson.id}`, childId) === 'true' ||
      (lesson.slug ? getStoredItemWithFallback(`aikids_lesson_completed_${lesson.slug}`, childId) === 'true' : false) ||
      (lesson.lessonNumber ? getStoredItemWithFallback(`aikids_lesson_completed_${lesson.lessonNumber}`, childId) === 'true' : false) ||
      Number(getStoredItemWithFallback(`aikids_lesson_stars_${lesson.id}`, childId) || 0) >= 3 ||
      (lesson.slug ? Number(getStoredItemWithFallback(`aikids_lesson_stars_${lesson.slug}`, childId) || 0) >= 3 : false) ||
      (lesson.lessonNumber ? Number(getStoredItemWithFallback(`aikids_lesson_stars_${lesson.lessonNumber}`, childId) || 0) >= 3 : false)

    const stars = Math.max(
      Number(getStoredItemWithFallback(`aikids_lesson_stars_${lesson.id}`, childId) || 0),
      lesson.slug ? Number(getStoredItemWithFallback(`aikids_lesson_stars_${lesson.slug}`, childId) || 0) : 0,
      lesson.lessonNumber ? Number(getStoredItemWithFallback(`aikids_lesson_stars_${lesson.lessonNumber}`, childId) || 0) : 0,
      isDone ? 3 : 0,
    )

    if (stars > 0) {
      lessonStars[lesson.id] = stars
      if (lesson.slug) lessonStars[lesson.slug] = stars
      if (lesson.lessonNumber) lessonStars[lesson.lessonNumber] = stars
      totalStars += stars
    }
    if (isDone) {
      completedCount++
      completedLessonIds.add(lesson.id)
      if (lesson.slug) completedLessonIds.add(lesson.slug)
      if (lesson.lessonNumber) completedLessonIds.add(lesson.lessonNumber)
    }
  }

  return {
    completedCount,
    totalStars,
    completedLessonIds,
    lessonStars,
  }
}

/**
 * Trả về tiến trình cục bộ cho một đảo cụ thể (0: Đảo Tiên Quyết, 1..5: Đảo 1..5).
 */
export function getIslandLocalProgress(
  islandIndex: number,
  childId?: string | null,
): { completedCount: number; totalStars: number } {
  const { completedLessonIds, lessonStars } = getLocalProgress(childId)
  let count = 0
  let stars = 0

  if (islandIndex === 0) {
    for (let r = 1; r <= 10; r++) {
      const isDone =
        completedLessonIds.has(`rule-${r}`) ||
        completedLessonIds.has(`bai-0-${r}`)
      const s = Math.max(
        lessonStars[`rule-${r}`] || 0,
        lessonStars[`bai-0-${r}`] || 0,
        isDone ? 3 : 0,
      )
      if (isDone) count++
      stars += s
    }
  } else {
    const islandLessons = ISLAND_CURRICULUM_LESSONS.filter(
      (l) => (l.islandNumber || 1) === islandIndex,
    )
    for (const lesson of islandLessons) {
      const isDone =
        completedLessonIds.has(lesson.id) ||
        (lesson.slug ? completedLessonIds.has(lesson.slug) : false) ||
        (lesson.lessonNumber ? completedLessonIds.has(lesson.lessonNumber) : false)
      const s = Math.max(
        lessonStars[lesson.id] || 0,
        lesson.slug ? (lessonStars[lesson.slug] || 0) : 0,
        lesson.lessonNumber ? (lessonStars[lesson.lessonNumber] || 0) : 0,
        isDone ? 3 : 0,
      )
      if (isDone) count++
      stars += s
    }
  }

  return { completedCount: count, totalStars: stars }
}

/**
 * Trả về tổng số sao và trạm hoàn thành từ các đảo cho một bé (childId).
 */
export function getChildOverallLocalStats(
  childId?: string | null,
): { completedCount: number; totalStars: number } {
  const { completedCount, totalStars } = getLocalProgress(childId)
  return { completedCount, totalStars }
}

/**
 * Cache tiến trình tạm thời theo đúng learner. Server vẫn là nguồn sự thật.
 *
 * Không ghi key legacy không namespace: trên thiết bị dùng chung, key đó không
 * thể hiện chủ sở hữu và từng làm tiến trình của trẻ A xuất hiện ở trẻ B.
 */
export function saveLocalLessonProgress(
  lessonId: string,
  stars: number,
  isCompleted: boolean,
  childId?: string | null,
): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
  if (!lessonId) return

  const clampedStars = Math.max(0, Math.min(3, stars))
  const isDone = isCompleted || clampedStars >= 3
  const completedStr = isDone ? 'true' : 'false'
  const starsStr = String(clampedStars)

  const keysToSave = new Set<string>([lessonId])

  // Ánh xạ bí danh cho Quy tắc vàng
  const ruleMatch = lessonId.match(/^(?:rule-|bai-0-)?([1-9]|10)$/)
  if (ruleMatch) {
    const rNum = ruleMatch[1]
    keysToSave.add(`rule-${rNum}`)
    keysToSave.add(`bai-0-${rNum}`)
  } else {
    // Ánh xạ bí danh cho Bài học đảo
    const matchedLesson = ISLAND_CURRICULUM_LESSONS.find(
      (l) => l.id === lessonId || l.slug === lessonId || l.lessonNumber === lessonId,
    )
    if (matchedLesson) {
      keysToSave.add(matchedLesson.id)
      if (matchedLesson.slug) keysToSave.add(matchedLesson.slug)
      if (matchedLesson.lessonNumber) keysToSave.add(matchedLesson.lessonNumber)
    }
  }

  for (const id of keysToSave) {
    const compKey = `aikids_lesson_completed_${id}`
    const starKey = `aikids_lesson_stars_${id}`

    try {
      const namespacedCompKey = getNamespacedKey(compKey, childId)
      const namespacedStarKey = getNamespacedKey(starKey, childId)
      localStorage.setItem(namespacedCompKey, completedStr)
      localStorage.setItem(namespacedStarKey, starsStr)
      if (childId && childId.trim() && childId.trim() !== 'anonymous') {
        const currentMigrated = localStorage.getItem(LEGACY_MIGRATED_CHILD_ID_KEY)
        if (!currentMigrated) {
          localStorage.setItem(LEGACY_MIGRATED_CHILD_ID_KEY, childId.trim())
        }
      }
    } catch {
      // ignore
    }
  }
}

// ─── PENDING SYNC QUEUE ──────────────────────────────────────────────────

export function getPendingSyncQueue(): PendingSyncItem[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(PENDING_SYNC_QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function savePendingSyncQueue(queue: PendingSyncItem[]): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(PENDING_SYNC_QUEUE_KEY, JSON.stringify(queue))
  } catch {
    // ignore
  }
}

export function clearPendingSyncQueue(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(PENDING_SYNC_QUEUE_KEY)
  } catch {
    // ignore
  }
}

/**
 * Đưa thao tác cập nhật tiến trình vào hàng đợi đồng bộ khi mạng lỗi hoặc offline.
 */
export function queuePendingSync(item: {
  lessonId: string
  answers?: any
  fromPhase?: string
  childId?: string
}): void {
  if (!item.lessonId) return
  const queue = getPendingSyncQueue()
  const existingIdx = queue.findIndex(
    (q) => q.lessonId === item.lessonId && (q.childId || '') === (item.childId || ''),
  )

  const fullItem: PendingSyncItem = {
    ...item,
    id: `${item.lessonId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
  }

  if (existingIdx >= 0) {
    queue[existingIdx] = fullItem
  } else {
    queue.push(fullItem)
  }

  savePendingSyncQueue(queue)
}

let isFlushing = false

/**
 * Lặp qua hàng đợi đồng bộ, gửi lên server DB khi có mạng.
 * Khi thành công xóa khỏi queue và phát sự kiện `aikids:lesson-completed`.
 */
export async function flushPendingSyncQueue(activeChildId?: string | null): Promise<void> {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
  if (isFlushing) return
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return

  const normalizedChildId = activeChildId?.trim()
  // Never replay a learner mutation without proving which learner owns the
  // current authenticated session. Legacy queue items without childId remain
  // quarantined for manual recovery instead of being written to another child.
  if (!normalizedChildId) return

  const queue = getPendingSyncQueue()
  const ownedQueue = queue.filter((item) => item.childId === normalizedChildId)
  if (ownedQueue.length === 0) return

  isFlushing = true
  const successfulIds = new Set<string>()
  let anySuccess = false

  try {
    for (const item of ownedQueue) {
      const syncId = item.id || `${item.lessonId}-${item.timestamp}`
      try {
        if (item.answers && Array.isArray(item.answers)) {
          await learningApi.submitCheck(item.lessonId, { answers: item.answers })
          successfulIds.add(syncId)
          anySuccess = true
        } else if (item.fromPhase) {
          await learningApi.advanceLesson(item.lessonId, { fromPhase: item.fromPhase as any })
          successfulIds.add(syncId)
          anySuccess = true
        } else {
          await learningApi.submitCheck(item.lessonId, { answers: item.answers ?? [] })
          successfulIds.add(syncId)
          anySuccess = true
        }
      } catch (err) {
        console.warn(`[SyncQueue] Failed to sync item for lesson ${item.lessonId}:`, err)
        // Keep in queue for next flush retry
      }
    }
  } finally {
    // Lọc bỏ những phần tử đã sync thành công một cách an toàn concurrency-safe
    const freshQueue = getPendingSyncQueue()
    const remaining = freshQueue.filter((item) => {
      const syncId = item.id || `${item.lessonId}-${item.timestamp}`
      return !successfulIds.has(syncId)
    })
    savePendingSyncQueue(remaining)
    isFlushing = false

    if (anySuccess && typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('aikids:lesson-completed'))
      } catch {
        // ignore
      }
    }
  }
}

// Tự động gắn listener lắng nghe khi thiết bị kết nối mạng trở lại
// Route owners trigger a flush with the authenticated learner id. An unscoped
// global `online` replay is intentionally forbidden because the active account
// may have changed while the device was offline.
