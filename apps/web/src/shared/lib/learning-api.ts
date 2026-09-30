import {
  api,
  ApiError,
  type CourseSummary,
  type QuestDetail,
  type QuestProgress,
} from './api'

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

function cachedLessonDetail(lessonId: string) {
  return api<{ quest: QuestDetail }>(`/api/v1/lms/compat/quests/${encodeURIComponent(lessonId)}`)
}

function dedupedLessonStart(lessonId: string) {
  const now = Date.now()
  const cached = lessonStartRequests.get(lessonId)
  if (cached && cached.expiresAt > now) return cached.request
  const request = api<{ progress: LessonProgress }>(
    `/api/v1/lms/compat/lessons/${encodeURIComponent(lessonId)}/start`,
    { method: 'POST' },
  )
  lessonStartRequests.set(lessonId, { expiresAt: now + LESSON_START_DEDUPE_MS, request })
  globalThis.setTimeout(() => {
    if (lessonStartRequests.get(lessonId)?.request === request) lessonStartRequests.delete(lessonId)
  }, LESSON_START_DEDUPE_MS)
  void request.catch(() => lessonStartRequests.delete(lessonId))
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
  getPathway(studentId?: string) {
    const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : ''
    return api<LearningPathway>(`/api/v1/lms/compat/pathway${query}`)
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

  async openLesson(lessonId: string) {
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
  },

  advanceLesson(lessonId: string, input: LessonAdvanceInput) {
    return api<{ progress: LessonProgress }>(
      `/api/v1/lms/compat/lessons/${encodeURIComponent(lessonId)}/advance`,
      { method: 'POST', body: JSON.stringify(input), keepalive: true },
    )
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
    return api<T>(
      `/api/v1/lms/compat/lessons/${encodeURIComponent(lessonId)}/practice`,
      { method: 'POST', body: JSON.stringify(input) },
    )
  },

  submitCheck(lessonId: string, input: LessonCheckInput, idempotencyKey?: string) {
    const key =
      idempotencyKey ||
      (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`)
    return api<{
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
