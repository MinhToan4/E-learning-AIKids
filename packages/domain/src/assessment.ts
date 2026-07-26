export type AssessmentQuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'drag_drop'
  | 'short_text'
  | 'ordering'
  | 'artifact'

type ChoiceKey = {
  type: 'single_choice' | 'multiple_choice'
  correctOptionIds: string[]
}
type OrderingKey = {
  type: 'ordering'
  correctOrder: string[]
}
type DragDropKey = {
  type: 'drag_drop'
  correctPlacements: Record<string, string>
}
type ManualKey = { type: 'short_text' | 'artifact' }

export type QuestionGradingKey =
  | ChoiceKey
  | OrderingKey
  | DragDropKey
  | ManualKey

export type AssessmentResponseValue =
  | { selectedOptionIds: string[] }
  | { orderedItemIds: string[] }
  | { placements: Record<string, string> }
  | { text: string }
  | {
      sourceType: 'project' | 'asset' | 'upload'
      sourceId: string
    }

export type GradingResult =
  | { status: 'graded'; ratio: 0 | 1 }
  | { status: 'manual_review'; ratio: null }

function sameMembers(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false
  const leftSet = new Set(left)
  return leftSet.size === left.length && right.every((item) => leftSet.has(item))
}

/**
 * Grades only deterministic item types. Open child work is never interpreted
 * heuristically; it enters the teacher review queue with an explicit rubric.
 */
export function gradeObjectiveResponse(
  key: QuestionGradingKey,
  response: AssessmentResponseValue,
): GradingResult {
  if (key.type === 'short_text' || key.type === 'artifact') {
    return { status: 'manual_review', ratio: null }
  }
  if (
    (key.type === 'single_choice' || key.type === 'multiple_choice') &&
    'selectedOptionIds' in response
  ) {
    return {
      status: 'graded',
      ratio: sameMembers(key.correctOptionIds, response.selectedOptionIds) ? 1 : 0,
    }
  }
  if (key.type === 'ordering' && 'orderedItemIds' in response) {
    return {
      status: 'graded',
      ratio:
        key.correctOrder.length === response.orderedItemIds.length &&
        key.correctOrder.every((item, index) => response.orderedItemIds[index] === item)
          ? 1
          : 0,
    }
  }
  if (key.type === 'drag_drop' && 'placements' in response) {
    const expected = Object.entries(key.correctPlacements)
    const actual = Object.entries(response.placements)
    return {
      status: 'graded',
      ratio:
        expected.length === actual.length &&
        expected.every(([item, target]) => response.placements[item] === target)
          ? 1
          : 0,
    }
  }
  return { status: 'graded', ratio: 0 }
}

export function summarizeAssessmentScore(
  items: Array<{ points: number; ratio: number | null }>,
) {
  const possiblePoints = items.reduce((sum, item) => sum + item.points, 0)
  const earnedPoints = items.reduce(
    (sum, item) => sum + item.points * (item.ratio ?? 0),
    0,
  )
  return {
    earnedPoints,
    possiblePoints,
    scorePercent:
      possiblePoints > 0
        ? Math.round((earnedPoints / possiblePoints) * 10_000) / 100
        : 0,
    pendingManualReview: items.some((item) => item.ratio === null),
  }
}

export function canStartAssessmentAttempt(
  policy: { maxAttempts: number; cooldownMinutes: number },
  priorAttempts: Array<{ submittedAt: Date | null }>,
  now = new Date(),
):
  | { allowed: true; reason: null; retryAt: null }
  | {
      allowed: false
      reason: 'attempt_limit' | 'cooldown'
      retryAt: Date | null
    } {
  if (priorAttempts.length >= policy.maxAttempts) {
    return { allowed: false, reason: 'attempt_limit', retryAt: null }
  }
  const lastSubmitted = priorAttempts
    .map((attempt) => attempt.submittedAt)
    .filter((value): value is Date => Boolean(value))
    .sort((a, b) => b.getTime() - a.getTime())[0]
  if (lastSubmitted && policy.cooldownMinutes > 0) {
    const retryAt = new Date(
      lastSubmitted.getTime() + policy.cooldownMinutes * 60 * 1000,
    )
    if (retryAt > now) return { allowed: false, reason: 'cooldown', retryAt }
  }
  return { allowed: true, reason: null, retryAt: null }
}
