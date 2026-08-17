import {
  api,
  type CourseSummary,
  type QuestDetail,
  type QuestProgress,
} from './api'

export type LearningPathwayCourse = {
  id: string
  title: string
  shortTitle: string
  status: 'completed' | 'active' | 'available' | 'locked'
  reasonCode: string
  completionPercent: number
  missingPrerequisites: string[]
  coverImage: string | null
  enrolled: boolean
  enrollmentId: string | null
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

type LessonProgress = {
  status: string
  phase: LessonPhase
  stars: number
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

/**
 * Learning is the public frontend boundary. Route compatibility and future
 * canonical migration stay inside this adapter, so child-facing components
 * only depend on learning contracts rather than service paths.
 */
export const learningApi = {
  getPathway(studentId?: string) {
    const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : ''
    return api<LearningPathway>(`/api/learning/pathway${query}`)
  },

  getCourse<T = { course: CourseSummary }>(courseId: string) {
    return api<T>(`/api/courses/${encodeURIComponent(courseId)}`)
  },

  getCourseProgress(courseId: string) {
    return api<CourseProgress>(`/api/progress/${encodeURIComponent(courseId)}`)
  },

  getChildTeacherFeedback<T>(childId: string) {
    return api<T>(
      `/api/v1/lms/family/children/${encodeURIComponent(childId)}/teacher-feedback`,
    )
  },

  getLesson(lessonId: string) {
    return api<{ quest: QuestDetail }>(`/api/quests/${encodeURIComponent(lessonId)}`)
  },

  startLesson(lessonId: string) {
    return api<{ progress: LessonProgress }>(
      `/api/progress/${encodeURIComponent(lessonId)}/start`,
      { method: 'POST' },
    )
  },

  advanceLesson(lessonId: string, input: LessonAdvanceInput) {
    return api<{ progress: LessonProgress }>(
      `/api/progress/${encodeURIComponent(lessonId)}/advance`,
      { method: 'POST', body: JSON.stringify(input) },
    )
  },

  savePractice<T = { result: unknown }>(lessonId: string, input: LessonPracticeInput) {
    return api<T>(
      `/api/progress/${encodeURIComponent(lessonId)}/practice`,
      { method: 'POST', body: JSON.stringify(input) },
    )
  },

  submitCheck(lessonId: string, input: LessonCheckInput) {
    return api<{
      passed?: boolean
      stars: number
      message: string
      nextQuestId: string | null
      newAchievements?: string[]
      courseCredential?: string | null
    }>(`/api/progress/${encodeURIComponent(lessonId)}/check`, {
      method: 'POST',
      body: JSON.stringify(input),
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
    }>(`/api/progress/${encodeURIComponent(lessonId)}/check-answer`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },
}
