import { describe, expect, it } from 'vitest'
import {
  calculateCompetencyResult,
  evaluateCredentialEligibility,
} from './competency.js'

describe('calculateCompetencyResult', () => {
  const policy = {
    notMetBelow: 40,
    achievedFrom: 70,
  }

  it('returns no_data instead of a misleading zero', () => {
    expect(calculateCompetencyResult([], policy)).toEqual({
      level: 'no_data',
      scorePercent: null,
      evidenceCount: 0,
    })
  })

  it('uses a weighted average and keeps evidence count explainable', () => {
    expect(
      calculateCompetencyResult(
        [
          { scorePercent: 100, weight: 2 },
          { scorePercent: 40, weight: 1 },
        ],
        policy,
      ),
    ).toEqual({
      level: 'achieved',
      scorePercent: 80,
      evidenceCount: 2,
    })
  })
})

describe('evaluateCredentialEligibility', () => {
  it('returns explicit unmet conditions instead of issuing optimistically', () => {
    expect(
      evaluateCredentialEligibility(
        {
          completionPercent: 90,
          hasPassedAssessment: false,
          skillLevels: { creativity: 'developing' },
        },
        {
          minCompletionPercent: 100,
          requirePassedAssessment: true,
          requiredSkillLevels: { creativity: 'achieved' },
        },
      ),
    ).toEqual({
      eligible: false,
      unmet: [
        'course_completion',
        'passed_assessment',
        'skill:creativity',
      ],
    })
  })
})
