import { describe, it, expect, beforeEach } from 'vitest'
import { parseQuizAnswersStorage, writeLessonStorage } from './useSixStageJourneyState'

describe('useSixStageJourneyState - quiz answers persistence & healing', () => {
  const lessonId = 'test-lesson-bai-2-1'

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('heals array format [ { questionId, optionIndex } ] into dictionary { 0: optionIndex, ... }', () => {
    // Simulate broken legacy format saved from submittedQuizAnswers
    const legacyArray = [
      { questionId: 'q-1', optionIndex: 2 },
      { questionId: 'q-2', optionIndex: 0 },
      { questionId: 'q-3', optionIndex: 1 },
    ]
    writeLessonStorage(`aikids_quiz_ans_${lessonId}`, legacyArray)

    const restored = parseQuizAnswersStorage(lessonId)
    expect(restored).toEqual({
      0: 2,
      1: 0,
      2: 1,
    })
  })

  it('correctly parses modern dictionary format { 0: 2, 1: 0, 2: 1 }', () => {
    const dict = { 0: 2, 1: 0, 2: 1 }
    writeLessonStorage(`aikids_quiz_ans_${lessonId}`, dict)

    const restored = parseQuizAnswersStorage(lessonId)
    expect(restored).toEqual({
      0: 2,
      1: 0,
      2: 1,
    })
  })

  it('returns empty dictionary when nothing is stored', () => {
    const restored = parseQuizAnswersStorage('non-existent-lesson')
    expect(restored).toEqual({})
  })
})
