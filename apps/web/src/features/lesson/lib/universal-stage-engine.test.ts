import { describe, it, expect } from 'vitest'
import {
  getStageTypeIndices,
  calculateUniversalStars,
  isStageStepDone,
} from './universal-stage-engine'
import type { JourneyStageDefinition } from '../types/stage-schema'

describe('universal-stage-engine', () => {
  const createMockStages = (types: string[]): JourneyStageDefinition[] => {
    return types.map((type, idx) => ({
      id: `stage-${idx}`,
      type,
      title: `Chặng ${idx + 1}`,
      stepNumber: idx + 1,
      config: {},
    }))
  }

  describe('getStageTypeIndices', () => {
    it('correctly maps 6-stage journey indices', () => {
      const stages = createMockStages(['GOAL', 'CONFIRM', 'VIDEO', 'QUIZ', 'PRACTICE', 'REWARD'])
      const indices = getStageTypeIndices(stages)
      expect(indices).toEqual({
        goalIdx: 0,
        confirmIdx: 1,
        videoIdx: 2,
        quizIdx: 3,
        practiceIdx: 4,
        rewardIdx: 5,
      })
    })

    it('correctly maps 3-stage journey indices', () => {
      const stages = createMockStages(['VIDEO', 'QUIZ', 'REWARD'])
      const indices = getStageTypeIndices(stages)
      expect(indices).toEqual({
        goalIdx: -1,
        confirmIdx: -1,
        videoIdx: 0,
        quizIdx: 1,
        practiceIdx: -1,
        rewardIdx: 2,
      })
    })
  })

  describe('calculateUniversalStars', () => {
    it('returns 3 stars for completed lesson or previousStars', () => {
      const stages = createMockStages(['VIDEO', 'QUIZ', 'REWARD'])
      expect(
        calculateUniversalStars({
          stages,
          currentStage: 0,
          completedStages: new Set(),
          isVideoCompleted: false,
          quizScore: 0,
          effectiveQuizQuestions: [],
          quizSubmitted: false,
          submittedArtwork: null,
          isCompletedLesson: true,
          previousStars: 2,
        }),
      ).toBe(2)

      expect(
        calculateUniversalStars({
          stages,
          currentStage: 0,
          completedStages: new Set(),
          isVideoCompleted: false,
          quizScore: 0,
          effectiveQuizQuestions: [],
          quizSubmitted: false,
          submittedArtwork: null,
          isCompletedLesson: true,
          previousStars: null,
        }),
      ).toBe(3)
    })

    it('calculates 1 star when video is completed in 3-stage or 6-stage template', () => {
      const stages3 = createMockStages(['VIDEO', 'QUIZ', 'REWARD'])
      expect(
        calculateUniversalStars({
          stages: stages3,
          currentStage: 0,
          completedStages: new Set(),
          isVideoCompleted: true,
          quizScore: 0,
          effectiveQuizQuestions: [{ id: 'q1' }],
          quizSubmitted: false,
          submittedArtwork: null,
          isCompletedLesson: false,
        }),
      ).toBe(1)

      const stages6 = createMockStages(['GOAL', 'CONFIRM', 'VIDEO', 'QUIZ', 'PRACTICE', 'REWARD'])
      expect(
        calculateUniversalStars({
          stages: stages6,
          currentStage: 2,
          completedStages: new Set([0, 1]),
          isVideoCompleted: true,
          quizScore: 0,
          effectiveQuizQuestions: [{ id: 'q1' }],
          quizSubmitted: false,
          submittedArtwork: null,
          isCompletedLesson: false,
        }),
      ).toBe(1)
    })

    it('calculates 2 stars when quiz or practice is completed', () => {
      const stages3 = createMockStages(['VIDEO', 'QUIZ', 'REWARD'])
      expect(
        calculateUniversalStars({
          stages: stages3,
          currentStage: 1,
          completedStages: new Set([0]),
          isVideoCompleted: true,
          quizScore: 1,
          effectiveQuizQuestions: [{ id: 'q1' }],
          quizSubmitted: true,
          submittedArtwork: null,
          isCompletedLesson: false,
        }),
      ).toBe(2)

      const stagesPractice = createMockStages(['VIDEO', 'PRACTICE', 'REWARD'])
      expect(
        calculateUniversalStars({
          stages: stagesPractice,
          currentStage: 1,
          completedStages: new Set([0]),
          isVideoCompleted: true,
          quizScore: 0,
          effectiveQuizQuestions: [],
          quizSubmitted: false,
          submittedArtwork: { image: 'test.png', prompt: 'cat' },
          isCompletedLesson: false,
        }),
      ).toBe(2)
    })

    it('calculates 3 stars when reaching reward stage', () => {
      const stages = createMockStages(['VIDEO', 'QUIZ', 'REWARD'])
      expect(
        calculateUniversalStars({
          stages,
          currentStage: 2,
          completedStages: new Set([0, 1]),
          isVideoCompleted: true,
          quizScore: 1,
          effectiveQuizQuestions: [{ id: 'q1' }],
          quizSubmitted: true,
          submittedArtwork: null,
          isCompletedLesson: false,
        }),
      ).toBe(3)
    })

    it('handles arbitrary templates without video or quiz (e.g. 4-step custom)', () => {
      const stages4 = createMockStages(['INTRO', 'ACTIVITY1', 'ACTIVITY2', 'OUTRO'])
      // Stage 1/4 (25%) -> 0 stars
      expect(
        calculateUniversalStars({
          stages: stages4,
          currentStage: 0,
          completedStages: new Set(),
          isVideoCompleted: false,
          quizScore: 0,
          effectiveQuizQuestions: [],
          quizSubmitted: false,
          submittedArtwork: null,
          isCompletedLesson: false,
        }),
      ).toBe(0)

      // Stage 2/4 (>= 33%) -> 1 star
      expect(
        calculateUniversalStars({
          stages: stages4,
          currentStage: 1,
          completedStages: new Set([0]),
          isVideoCompleted: false,
          quizScore: 0,
          effectiveQuizQuestions: [],
          quizSubmitted: false,
          submittedArtwork: null,
          isCompletedLesson: false,
        }),
      ).toBe(1)

      // Stage 3/4 (>= 66%) -> 2 stars
      expect(
        calculateUniversalStars({
          stages: stages4,
          currentStage: 2,
          completedStages: new Set([0, 1]),
          isVideoCompleted: false,
          quizScore: 0,
          effectiveQuizQuestions: [],
          quizSubmitted: false,
          submittedArtwork: null,
          isCompletedLesson: false,
        }),
      ).toBe(2)

      // Final stage -> 3 stars (defaultStars fallback if reaching end)
      expect(
        calculateUniversalStars({
          stages: stages4,
          currentStage: 3,
          completedStages: new Set([0, 1, 2]),
          isVideoCompleted: false,
          quizScore: 0,
          effectiveQuizQuestions: [],
          quizSubmitted: false,
          submittedArtwork: null,
          isCompletedLesson: false,
        }),
      ).toBe(3)
    })
  })

  describe('isStageStepDone', () => {
    it('correctly marks video stage as done when completed or passed', () => {
      const stages = createMockStages(['VIDEO', 'QUIZ', 'REWARD'])
      expect(isStageStepDone(0, stages, 0, new Set(), false, 0, false)).toBe(false)
      expect(isStageStepDone(0, stages, 0, new Set(), true, 0, false)).toBe(true)
      expect(isStageStepDone(0, stages, 1, new Set(), false, 0, false)).toBe(true)
    })

    it('correctly marks quiz stage as done when scored or passed', () => {
      const stages = createMockStages(['VIDEO', 'QUIZ', 'REWARD'])
      expect(isStageStepDone(1, stages, 1, new Set(), false, 0, false)).toBe(false)
      expect(isStageStepDone(1, stages, 1, new Set(), false, 1, false)).toBe(true)
      expect(isStageStepDone(1, stages, 2, new Set(), false, 0, false)).toBe(true)
    })

    it('correctly handles isCompletedLesson mode', () => {
      const stages = createMockStages(['VIDEO', 'QUIZ', 'REWARD'])
      expect(isStageStepDone(0, stages, 1, new Set(), false, 0, true)).toBe(true)
      expect(isStageStepDone(1, stages, 1, new Set(), false, 0, true)).toBe(false)
    })
  })
})
