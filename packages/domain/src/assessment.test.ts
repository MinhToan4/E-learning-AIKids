import { describe, expect, it } from 'vitest'
import {
  canStartAssessmentAttempt,
  gradeObjectiveResponse,
  summarizeAssessmentScore,
} from './assessment.js'

describe('gradeObjectiveResponse', () => {
  it('grades single and multiple choice without depending on option order', () => {
    expect(
      gradeObjectiveResponse(
        { type: 'single_choice', correctOptionIds: ['b'] },
        { selectedOptionIds: ['b'] },
      ),
    ).toEqual({ status: 'graded', ratio: 1 })
    expect(
      gradeObjectiveResponse(
        { type: 'multiple_choice', correctOptionIds: ['a', 'c'] },
        { selectedOptionIds: ['c', 'a'] },
      ),
    ).toEqual({ status: 'graded', ratio: 1 })
    expect(
      gradeObjectiveResponse(
        { type: 'multiple_choice', correctOptionIds: ['a', 'c'] },
        { selectedOptionIds: ['a'] },
      ),
    ).toEqual({ status: 'graded', ratio: 0 })
  })

  it('grades ordering and drag/drop mappings exactly', () => {
    expect(
      gradeObjectiveResponse(
        { type: 'ordering', correctOrder: ['plan', 'make', 'review'] },
        { orderedItemIds: ['plan', 'make', 'review'] },
      ).ratio,
    ).toBe(1)
    expect(
      gradeObjectiveResponse(
        {
          type: 'drag_drop',
          correctPlacements: { cat: 'animal', rose: 'plant' },
        },
        { placements: { rose: 'plant', cat: 'animal' } },
      ).ratio,
    ).toBe(1)
  })

  it('routes short text and artifact evidence to manual review', () => {
    expect(
      gradeObjectiveResponse(
        { type: 'short_text' },
        { text: 'Con sẽ kiểm tra lại nguồn.' },
      ),
    ).toEqual({ status: 'manual_review', ratio: null })
    expect(
      gradeObjectiveResponse(
        { type: 'artifact' },
        {
          sourceType: 'project',
          sourceId: '8e8f6f0e-f531-42e8-a402-f1b23b0be3e3',
        },
      ),
    ).toEqual({ status: 'manual_review', ratio: null })
  })
})

describe('summarizeAssessmentScore', () => {
  it('keeps an attempt pending until every manual item is reviewed', () => {
    expect(
      summarizeAssessmentScore([
        { points: 2, ratio: 1 },
        { points: 3, ratio: null },
      ]),
    ).toEqual({
      earnedPoints: 2,
      possiblePoints: 5,
      scorePercent: 40,
      pendingManualReview: true,
    })
  })
})

describe('canStartAssessmentAttempt', () => {
  it('enforces max attempts and cooldown from the database policy', () => {
    const now = new Date('2026-07-26T10:00:00.000Z')
    expect(
      canStartAssessmentAttempt(
        { maxAttempts: 2, cooldownMinutes: 60 },
        [{ submittedAt: new Date('2026-07-26T09:30:00.000Z') }],
        now,
      ),
    ).toEqual({
      allowed: false,
      reason: 'cooldown',
      retryAt: new Date('2026-07-26T10:30:00.000Z'),
    })
    expect(
      canStartAssessmentAttempt(
        { maxAttempts: 1, cooldownMinutes: 0 },
        [{ submittedAt: new Date('2026-07-26T08:00:00.000Z') }],
        now,
      ),
    ).toEqual({ allowed: false, reason: 'attempt_limit', retryAt: null })
  })
})
