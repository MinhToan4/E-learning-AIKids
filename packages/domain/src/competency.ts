export type CompetencyLevel =
  | 'no_data'
  | 'not_met'
  | 'developing'
  | 'achieved'

export function calculateCompetencyResult(
  evidence: Array<{ scorePercent: number; weight: number }>,
  policy: { notMetBelow: number; achievedFrom: number },
): {
  level: CompetencyLevel
  scorePercent: number | null
  evidenceCount: number
} {
  if (evidence.length === 0) {
    return { level: 'no_data', scorePercent: null, evidenceCount: 0 }
  }
  const totalWeight = evidence.reduce((sum, row) => sum + row.weight, 0)
  const scorePercent =
    totalWeight > 0
      ? Math.round(
          (evidence.reduce(
            (sum, row) => sum + row.scorePercent * row.weight,
            0,
          ) /
            totalWeight) *
            100,
        ) / 100
      : 0
  const level =
    scorePercent < policy.notMetBelow
      ? 'not_met'
      : scorePercent >= policy.achievedFrom
        ? 'achieved'
        : 'developing'
  return { level, scorePercent, evidenceCount: evidence.length }
}

const LEVEL_RANK: Record<CompetencyLevel, number> = {
  no_data: 0,
  not_met: 1,
  developing: 2,
  achieved: 3,
}

export function evaluateCredentialEligibility(
  state: {
    completionPercent: number
    hasPassedAssessment: boolean
    skillLevels: Record<string, CompetencyLevel>
  },
  rule: {
    minCompletionPercent: number
    requirePassedAssessment: boolean
    requiredSkillLevels: Record<string, CompetencyLevel>
  },
) {
  const unmet: string[] = []
  if (state.completionPercent < rule.minCompletionPercent) {
    unmet.push('course_completion')
  }
  if (rule.requirePassedAssessment && !state.hasPassedAssessment) {
    unmet.push('passed_assessment')
  }
  Object.entries(rule.requiredSkillLevels).forEach(([skillId, required]) => {
    const actual = state.skillLevels[skillId] ?? 'no_data'
    if (LEVEL_RANK[actual] < LEVEL_RANK[required]) {
      unmet.push(`skill:${skillId}`)
    }
  })
  return { eligible: unmet.length === 0, unmet }
}
