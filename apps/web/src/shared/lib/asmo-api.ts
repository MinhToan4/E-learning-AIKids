import { api } from './api'
import { ASMO_SAMPLE_EXAMS } from '@/features/asmo/data/asmo-sample-exams'
import type {
  AsmoExam,
  AsmoGrade,
  AsmoSubject,
} from '@/features/asmo/types'

export type AsmoExamFilter = {
  subject?: AsmoSubject
  grade?: AsmoGrade
  year?: number
  round?: string
}

export type AsmoExamSubmissionPayload = {
  answers: Record<string, string>
  durationSpentSeconds?: number
  studentId?: string
}

export type AsmoExamQuestionResult = {
  questionId: string
  userAnswer?: string
  correctAnswer: string
  isCorrect: boolean
  pointsEarned: number
  explanation?: string
}

export type AsmoExamSubmissionResult = {
  examId: string
  score: number
  totalPoints: number
  scorePct: number
  correctCount: number
  totalQuestions: number
  isPassed: boolean
  passed?: boolean
  questionResults?: Record<string, AsmoExamQuestionResult> | AsmoExamQuestionResult[]
  feedback?: string
  newAchievements?: string[]
}

function filterSampleExams(filters?: AsmoExamFilter): AsmoExam[] {
  if (!filters) return ASMO_SAMPLE_EXAMS
  return ASMO_SAMPLE_EXAMS.filter((exam) => {
    if (filters.subject && exam.subject !== filters.subject) return false
    if (filters.grade !== undefined) {
      if (filters.subject === 'math') {
        if (exam.grade !== filters.grade) return false
      } else {
        // Science & English level groups
        if (filters.grade <= 2 && exam.grade > 2) return false
        if (filters.grade >= 3 && filters.grade <= 4 && (exam.grade < 3 || exam.grade > 4)) return false
        if (filters.grade === 5 && exam.grade !== 5) return false
      }
    }
    if (filters.year !== undefined && exam.year !== filters.year) return false
    if (filters.round && exam.round !== filters.round) return false
    return true
  })
}

function extractExamsFromResponse(res: unknown): AsmoExam[] | null {
  if (!res) return null
  if (Array.isArray(res)) return res as AsmoExam[]
  if (typeof res === 'object') {
    const record = res as Record<string, unknown>
    if (Array.isArray(record.data)) return record.data as AsmoExam[]
    if (Array.isArray(record.exams)) return record.exams as AsmoExam[]
    if (record.data && typeof record.data === 'object') {
      const inner = record.data as Record<string, unknown>
      if (Array.isArray(inner.exams)) return inner.exams as AsmoExam[]
      if (Array.isArray(inner.items)) return inner.items as AsmoExam[]
    }
  }
  return null
}

function extractExamFromResponse(res: unknown): AsmoExam | null {
  if (!res || typeof res !== 'object') return null
  const record = res as Record<string, unknown>
  if (record.id && Array.isArray(record.questions)) return res as AsmoExam
  if (record.data && typeof record.data === 'object') {
    const dataObj = record.data as Record<string, unknown>
    if (dataObj.id && Array.isArray(dataObj.questions)) return dataObj as unknown as AsmoExam
    if (dataObj.exam && typeof dataObj.exam === 'object') return dataObj.exam as AsmoExam
  }
  if (record.exam && typeof record.exam === 'object') {
    return record.exam as AsmoExam
  }
  return null
}

function extractSubmissionResult(res: unknown, examId: string, payload: AsmoExamSubmissionPayload): AsmoExamSubmissionResult | null {
  if (!res || typeof res !== 'object') return null
  const record = res as Record<string, unknown>
  const target = (record.data && typeof record.data === 'object' ? record.data : record) as Record<string, unknown>
  if (typeof target.score === 'number' && typeof target.totalPoints === 'number') {
    const score = target.score
    const totalPoints = target.totalPoints
    const scorePct = typeof target.scorePct === 'number' ? target.scorePct : Math.round((score / (totalPoints || 1)) * 100)
    const isPassed = typeof target.isPassed === 'boolean' ? target.isPassed : Boolean(target.passed)
    return {
      examId: String(target.examId || examId),
      score,
      totalPoints,
      scorePct,
      correctCount: typeof target.correctCount === 'number' ? target.correctCount : 0,
      totalQuestions: typeof target.totalQuestions === 'number' ? target.totalQuestions : Object.keys(payload.answers).length,
      isPassed,
      passed: isPassed,
      questionResults: target.questionResults as Record<string, AsmoExamQuestionResult> | AsmoExamQuestionResult[] | undefined,
      feedback: typeof target.feedback === 'string' ? target.feedback : undefined,
      newAchievements: Array.isArray(target.newAchievements) ? (target.newAchievements as string[]) : undefined,
    }
  }
  return null
}

function localGradeExam(examId: string, payload: AsmoExamSubmissionPayload): AsmoExamSubmissionResult {
  const targetExam = ASMO_SAMPLE_EXAMS.find((e) => e.id === examId) || ASMO_SAMPLE_EXAMS[0]
  let score = 0
  let correctCount = 0
  const questionResults: AsmoExamQuestionResult[] = []

  targetExam.questions.forEach((q) => {
    const userAns = payload.answers[q.id]
    const isCorrect = userAns === q.correctAnswer
    const pointsEarned = isCorrect ? q.points : 0
    if (isCorrect) {
      score += q.points
      correctCount++
    }
    questionResults.push({
      questionId: q.id,
      userAnswer: userAns,
      correctAnswer: q.correctAnswer,
      isCorrect,
      pointsEarned,
      explanation: q.explanation,
    })
  })

  const scorePct = Math.round((score / (targetExam.totalPoints || 1)) * 100)
  const isPassed = scorePct >= targetExam.passScore

  return {
    examId: targetExam.id,
    score,
    totalPoints: targetExam.totalPoints,
    scorePct,
    correctCount,
    totalQuestions: targetExam.questions.length,
    isPassed,
    passed: isPassed,
    questionResults,
    feedback: isPassed
      ? 'Chúc mừng con đã xuất sắc vượt qua bài thi Olympic ASMO!'
      : 'Con đã nỗ lực rất tốt! Hãy xem lại các câu chưa chính xác để rút kinh nghiệm nhé!',
  }
}

/**
 * Lấy danh sách đề thi ASMO từ Backend Gateway với bộ lọc động và fallback an toàn.
 */
export async function listAsmoExams(filters?: AsmoExamFilter): Promise<AsmoExam[]> {
  const params = new URLSearchParams()
  if (filters?.subject) params.set('subject', filters.subject)
  if (filters?.grade !== undefined) params.set('grade', String(filters.grade))
  if (filters?.year !== undefined) params.set('year', String(filters.year))
  if (filters?.round) params.set('round', filters.round)

  const queryString = params.toString() ? `?${params.toString()}` : ''
  const endpoint = `/api/v1/lms/asmo/exams${queryString}`

  try {
    const res = await api.get<unknown>(endpoint)
    const remoteExams = extractExamsFromResponse(res)
    if (remoteExams && remoteExams.length > 0) {
      return remoteExams
    }
  } catch {
    // Backend offline / network fallback
  }

  return filterSampleExams(filters)
}

/**
 * Lấy chi tiết câu hỏi của một đề thi ASMO theo ID kèm fallback an toàn.
 */
export async function getAsmoExam(examId: string): Promise<AsmoExam> {
  const endpoint = `/api/v1/lms/asmo/exams/${encodeURIComponent(examId)}`

  try {
    const res = await api.get<unknown>(endpoint)
    const exam = extractExamFromResponse(res)
    if (exam && exam.questions && exam.questions.length > 0) {
      return exam
    }
  } catch {
    // Backend offline / network fallback
  }

  const local = ASMO_SAMPLE_EXAMS.find((e) => e.id === examId)
  if (local) return local

  return ASMO_SAMPLE_EXAMS[0]
}

/**
 * Nộp bài thi ASMO lên Backend Gateway để chấm điểm chính thức kèm fallback tính toán tại client.
 */
export async function submitAsmoExam(
  examId: string,
  payload: AsmoExamSubmissionPayload,
): Promise<AsmoExamSubmissionResult> {
  const endpoint = `/api/v1/lms/asmo/exams/${encodeURIComponent(examId)}/submit`

  try {
    const res = await api.post<unknown>(endpoint, payload)
    const result = extractSubmissionResult(res, examId, payload)
    if (result) {
      return result
    }
  } catch {
    // Backend offline / network fallback
  }

  return localGradeExam(examId, payload)
}

export const asmoApi = {
  listAsmoExams,
  getAsmoExam,
  submitAsmoExam,
}
