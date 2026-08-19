import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken } from './api'
import { asmoApi, getAsmoExam, listAsmoExams, submitAsmoExam } from './asmo-api'
import { ASMO_SAMPLE_EXAMS } from '@/features/asmo/data/asmo-sample-exams'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('ASMO API facade', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
  })

  it('calls GET /api/v1/lms/asmo/exams with query filters', async () => {
    const mockExams = [
      {
        id: 'mock-exam-1',
        code: 'ASMO-MATH-2023',
        title: 'Mock ASMO Math 2023',
        subject: 'math',
        grade: 1,
        year: 2023,
        round: 'School Round',
        durationMinutes: 45,
        passScore: 60,
        totalPoints: 100,
        description: 'Mock Description',
        questions: [],
      },
    ]

    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ status: 'success', data: mockExams }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await listAsmoExams({
      subject: 'math',
      grade: 1,
      year: 2023,
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const calledUrl = fetchMock.mock.calls[0][0] as string
    expect(calledUrl).toContain('/api/v1/lms/asmo/exams')
    expect(calledUrl).toContain('subject=math')
    expect(calledUrl).toContain('grade=1')
    expect(calledUrl).toContain('year=2023')
    expect(result).toEqual(mockExams)
  })

  it('falls back safely to sample exams when listAsmoExams fails or is offline', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error / offline'))
    vi.stubGlobal('fetch', fetchMock)

    const result = await listAsmoExams({
      subject: 'math',
      grade: 1,
      year: 2020,
    })

    expect(result.length).toBeGreaterThan(0)
    expect(result.every((e) => e.subject === 'math' && e.grade === 1 && e.year === 2020)).toBe(true)
  })

  it('calls GET /api/v1/lms/asmo/exams/:id for single exam detail', async () => {
    const mockExam = {
      id: 'exam-detail-1',
      code: 'ASMO-DETAIL-1',
      title: 'Exam Detail',
      subject: 'math',
      grade: 2,
      year: 2022,
      round: 'National',
      durationMinutes: 60,
      passScore: 70,
      totalPoints: 100,
      description: 'Detail',
      questions: [
        {
          id: 'q1',
          subject: 'math',
          grade: 2,
          topicCode: 'T1',
          topicName: 'Topic 1',
          title: 'Q1',
          text: 'Question 1?',
          options: [{ id: 'A', label: 'A', text: 'Opt A' }],
          correctAnswer: 'A',
          explanation: 'Exp',
          meeHint: 'Hint',
          points: 10,
        },
      ],
    }

    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ data: { exam: mockExam } }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await getAsmoExam('exam-detail-1')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const calledUrl = fetchMock.mock.calls[0][0] as string
    expect(calledUrl).toContain('/api/v1/lms/asmo/exams/exam-detail-1')
    expect(result.id).toBe('exam-detail-1')
    expect(result.questions).toHaveLength(1)
  })

  it('falls back safely to sample exam when getAsmoExam fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Backend offline'))
    vi.stubGlobal('fetch', fetchMock)

    const fallback = await getAsmoExam('asmo-math-g1-2020-r1')
    expect(fallback.id).toBe('asmo-math-g1-2020-r1')
    expect(fallback.questions.length).toBeGreaterThan(0)
  })

  it('submits exam to POST /api/v1/lms/asmo/exams/:id/submit with remote result', async () => {
    const mockSubmissionResult = {
      examId: 'exam-1',
      score: 90,
      totalPoints: 100,
      scorePct: 90,
      correctCount: 9,
      totalQuestions: 10,
      isPassed: true,
      feedback: 'Great job!',
    }

    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ status: 'success', data: mockSubmissionResult }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await submitAsmoExam('exam-1', {
      answers: { q1: 'A', q2: 'B' },
      durationSpentSeconds: 120,
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const calledUrl = fetchMock.mock.calls[0][0] as string
    expect(calledUrl).toContain('/api/v1/lms/asmo/exams/exam-1/submit')
    expect(result.score).toBe(90)
    expect(result.isPassed).toBe(true)
  })

  it('grades exam locally with fallback when submitAsmoExam fails', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Gateway timeout'))
    vi.stubGlobal('fetch', fetchMock)

    const targetExam = ASMO_SAMPLE_EXAMS[0]
    const correctAnswers: Record<string, string> = {}
    targetExam.questions.forEach((q) => {
      correctAnswers[q.id] = q.correctAnswer
    })

    const result = await asmoApi.submitAsmoExam(targetExam.id, {
      answers: correctAnswers,
    })

    expect(result.examId).toBe(targetExam.id)
    expect(result.score).toBe(targetExam.totalPoints)
    expect(result.scorePct).toBe(100)
    expect(result.isPassed).toBe(true)
    expect(result.correctCount).toBe(targetExam.questions.length)
  })
})
