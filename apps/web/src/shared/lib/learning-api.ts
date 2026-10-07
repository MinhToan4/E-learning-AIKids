import {
  api,
  ApiError,
  type CourseSummary,
  type QuestDetail,
  type QuestProgress,
} from './api'
import { registerSessionResetHandler, sessionGeneration, sessionOwnerId } from './session-scope'

export type LearningPathwayCourse = {
  id: string
  slug?: string
  title: string
  shortTitle: string
  status: 'completed' | 'active' | 'available' | 'locked'
  reasonCode: string
  completionPercent: number
  missingPrerequisites: string[]
  coverImage: string | null
  enrolled: boolean
  enrollmentId: string | null
  questCount?: number
  completedCount?: number
  totalStars?: number
  stations?: QuestProgress[]
}
export type LearningPathway = {
  student: { nickname: string | null; ageBand: string }
  policy: { label: string } | null
  recommendedCourseId: string | null
  courses: LearningPathwayCourse[]
}

export type CourseProgress = {
  quests: QuestProgress[]
  totalStars: number
  completedCount: number
}

export type LessonPhase = 'learn' | 'game' | 'practice' | 'check'

export type LessonProgress = {
  status: string
  phase: LessonPhase
  stars: number
  sectionId?: string | null
  lastSectionId?: string | null
  anchor?: { sectionId?: string | null } | null
  resume?: { sectionId?: string | null } | null
}

/** Convert the server-owned six-stage checkpoint into the zero-based UI index. */
export function lessonStageIndexFromProgress(progress: LessonProgress): number {
  if (progress.status === 'completed') {
    return 99
  }
  const sectionId = progress.sectionId
    ?? progress.lastSectionId
    ?? progress.anchor?.sectionId
    ?? progress.resume?.sectionId
    ?? ''
  const match = /^stage-(\d+)$/.exec(sectionId.trim())
  if (match) {
    const stageNumber = Number(match[1])
    if (Number.isFinite(stageNumber)) return Math.max(0, stageNumber - 1)
  }
  if (progress.phase === 'practice' || progress.phase === 'check') {
    return 1
  }
  return 0
}

type LessonAdvanceInput = {
  fromPhase: LessonPhase
  gameEvidence?: unknown
}

type LessonPracticeInput = {
  kind: string
  payload: Record<string, unknown>
}

type LessonCheckInput = {
  answers: Array<{ questionId: string; optionIndex: number }>
}

const LESSON_START_DEDUPE_MS = 5_000
const lessonStartRequests = new Map<string, { expiresAt: number; request: Promise<{ progress: LessonProgress }> }>()

const LESSON_OPEN_DEDUPE_MS = 3_000
const lessonOpenRequests = new Map<string, { expiresAt: number; request: Promise<{ quest: QuestDetail; progress: LessonProgress }> }>()

const advanceInflightRequests = new Map<string, Promise<{ progress: LessonProgress }>>()

function cachedLessonDetail(lessonId: string) {
  return api<{ quest: QuestDetail }>(`/api/v1/lms/compat/quests/${encodeURIComponent(lessonId)}`)
}

function dedupedLessonStart(lessonId: string) {
  const key = `${sessionGeneration}:${sessionOwnerId ?? 'anonymous'}:${lessonId}`
  const now = Date.now()
  const cached = lessonStartRequests.get(key)
  if (cached && cached.expiresAt > now) return cached.request
  const request = api<{ progress: LessonProgress }>(
    `/api/v1/lms/compat/lessons/${encodeURIComponent(lessonId)}/start`,
    { method: 'POST' },
  )
  lessonStartRequests.set(key, { expiresAt: now + LESSON_START_DEDUPE_MS, request })
  globalThis.setTimeout(() => {
    if (lessonStartRequests.get(key)?.request === request) lessonStartRequests.delete(key)
  }, LESSON_START_DEDUPE_MS)
  void request.catch(() => {
    if (lessonStartRequests.get(key)?.request === request) lessonStartRequests.delete(key)
  })
  return request
}

async function rawOpenLesson(lessonId: string): Promise<{ quest: QuestDetail; progress: LessonProgress }> {
  try {
    return await api<{ quest: QuestDetail; progress: LessonProgress }>(
      `/api/v1/lms/compat/lessons/${encodeURIComponent(lessonId)}/open`,
      { method: 'POST' },
    )
  } catch (error) {
    // Rolling deploy compatibility: older Hub/LMS versions do not expose
    // the aggregate route yet. Keep the app usable until backend catches up.
    if (!(error instanceof ApiError) || (error.status !== 404 && error.status !== 405)) throw error
    const [lesson, started] = await Promise.all([
      cachedLessonDetail(lessonId),
      dedupedLessonStart(lessonId),
    ])
    return { quest: lesson.quest, progress: started.progress }
  }
}

function dedupedLessonOpen(lessonId: string) {
  const key = `${sessionGeneration}:${sessionOwnerId ?? 'anonymous'}:${lessonId}`
  const now = Date.now()
  const cached = lessonOpenRequests.get(key)
  if (cached && cached.expiresAt > now) return cached.request
  const request = rawOpenLesson(lessonId)
  lessonOpenRequests.set(key, { expiresAt: now + LESSON_OPEN_DEDUPE_MS, request })
  globalThis.setTimeout(() => {
    if (lessonOpenRequests.get(key)?.request === request) lessonOpenRequests.delete(key)
  }, LESSON_OPEN_DEDUPE_MS)
  void request.catch(() => {
    if (lessonOpenRequests.get(key)?.request === request) lessonOpenRequests.delete(key)
  })
  return request
}

const PATHWAY_DEDUPE_MS = 2_500
const pathwayRequests = new Map<string, { expiresAt: number; request: Promise<LearningPathway> }>()

export function clearSessionLearningCache(): void {
  pathwayRequests.clear()
  lessonStartRequests.clear()
  lessonOpenRequests.clear()
  advanceInflightRequests.clear()
}

registerSessionResetHandler(() => {
  clearSessionLearningCache()
})

if (typeof window !== 'undefined') {
  const onInvalidate = () => {
    clearSessionLearningCache()
  }
  window.addEventListener('aikids:lesson-completed', onInvalidate)
  window.addEventListener('aikids:progression-updated', onInvalidate)
}

function dedupedPathway(studentId?: string, options: RequestInit = {}): Promise<LearningPathway> {
  const key = `${sessionGeneration}:${sessionOwnerId ?? 'anonymous'}${studentId ? `:${studentId}` : ''}`
  const now = Date.now()
  const cached = pathwayRequests.get(key)
  if (cached && cached.expiresAt > now) return cached.request

  const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : ''
  const request = api<LearningPathway>(`/api/v1/lms/compat/pathway${query}`, options)
  pathwayRequests.set(key, { expiresAt: now + PATHWAY_DEDUPE_MS, request })
  globalThis.setTimeout(() => {
    if (pathwayRequests.get(key)?.request === request) pathwayRequests.delete(key)
  }, PATHWAY_DEDUPE_MS)
  void request.catch(() => {
    if (pathwayRequests.get(key)?.request === request) pathwayRequests.delete(key)
  })
  return request
}

/**
 * Learning is the public frontend boundary. Route compatibility and future
 * canonical migration stay inside this adapter, so child-facing components
 * only depend on learning contracts rather than service paths.
 *
 * Hub routing: /api/v1/lms/* → /internal/v1/lms/* → core-lms-api:4509
 */
export const learningApi = {
  clearSessionLearningCache,

  getPathway(studentId?: string, options: RequestInit = {}) {
    return dedupedPathway(studentId, options)
  },

  getCourse<T = { course: CourseSummary }>(courseId: string) {
    return api<T>(`/api/v1/lms/courses/${encodeURIComponent(courseId)}`)
  },

  getCourseProgress(courseId: string) {
    return api<CourseProgress>(`/api/v1/lms/compat/courses/${encodeURIComponent(courseId)}/progress`)
  },

  getChildTeacherFeedback<T>(childId: string) {
    return api<T>(
      `/api/v1/lms/family/children/${encodeURIComponent(childId)}/teacher-feedback`,
    )
  },

  getLesson(lessonId: string) {
    return cachedLessonDetail(lessonId)
  },

  startLesson(lessonId: string) {
    return dedupedLessonStart(lessonId)
  },

  openLesson(lessonId: string) {
    return dedupedLessonOpen(lessonId)
  },

  advanceLesson(lessonId: string, input: LessonAdvanceInput) {
    const key = `${sessionGeneration}:${sessionOwnerId ?? 'anonymous'}:${lessonId}:${JSON.stringify(input)}`
    const inflight = advanceInflightRequests.get(key)
    if (inflight) return inflight

    const request = api<{ progress: LessonProgress }>(
      `/api/v1/lms/compat/lessons/${encodeURIComponent(lessonId)}/advance`,
      { method: 'POST', body: JSON.stringify(input), keepalive: true },
    )
    advanceInflightRequests.set(key, request)
    const cleanup = () => {
      if (advanceInflightRequests.get(key) === request) {
        advanceInflightRequests.delete(key)
      }
    }
    void request.then(
      () => {
        cleanup()
        clearSessionLearningCache()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('aikids:progression-updated'))
        }
      },
      cleanup,
    )
    return request
  },

  saveResume(
    lessonId: string,
    input: {
      percent: number
      positionSeconds: number
      sectionId: string
      occurredAt: string
    },
  ) {
    return api<{ resume: { id: string } }>(
      `/api/v1/lms/lessons/${encodeURIComponent(lessonId)}/resume`,
      { method: 'PUT', keepalive: true, body: JSON.stringify(input) },
    )
  },

  savePractice<T = { result: unknown }>(lessonId: string, input: LessonPracticeInput) {
    const request = api<T>(
      `/api/v1/lms/compat/lessons/${encodeURIComponent(lessonId)}/practice`,
      { method: 'POST', body: JSON.stringify(input) },
    )
    void request.then(() => {
      clearSessionLearningCache()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aikids:progression-updated'))
      }
    }).catch(() => null)
    return request
  },

  submitCheck(lessonId: string, input: LessonCheckInput, idempotencyKey?: string) {
    const key =
      idempotencyKey ||
      (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`)
    const request = api<{
      passed?: boolean
      stars: number
      message: string
      nextQuestId: string | null
      newAchievements?: string[]
      courseCredential?: string | null
      /** Nếu server trả về XP mới sau completion, client có thể optimistic-update ngay */
      totalXp?: number
      level?: number
    }>(`/api/v1/lms/compat/lessons/${encodeURIComponent(lessonId)}/check`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': key,
      },
      body: JSON.stringify(input),
      keepalive: true,
    })
    void request.then((res) => {
      clearSessionLearningCache()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aikids:progression-updated'))
        if (res.passed !== false) {
          window.dispatchEvent(new CustomEvent('aikids:lesson-completed'))
        }
      }
    }).catch(() => null)
    return request
  },

  checkAnswer(
    lessonId: string,
    input: { questionId: string; optionIndex: number },
  ) {
    return api<{
      questionId: string
      correct: boolean
      explanation: string
    }>(`/api/v1/lms/compat/lessons/${encodeURIComponent(lessonId)}/check-answer`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },
}
