export type CheckAnswer = { questionId: string; optionIndex: number }

type Input = {
  summaryAnswers?: Array<{ questionId: string; optionIndex: number }>
  ruleQuestions?: Array<{ id: string; correctIndex?: number }> | null
  checkQuestions?: Array<{ id: string }> | null
  checkAnswers?: Record<string, number | undefined> | null
}

/**
 * Answers sent to `/compat/lessons/:id/check`. Only questions the learner
 * actually answered are submitted; the server grades the rest as wrong.
 * `ruleQuestions` is the legacy rule renderer fallback: that renderer gates on
 * its own local quiz and never reports per-question answers.
 */
export function buildCheckAnswersPayload({
  summaryAnswers,
  ruleQuestions,
  checkQuestions,
  checkAnswers,
}: Input): CheckAnswer[] {
  if (summaryAnswers?.length) {
    return summaryAnswers.filter(
      (a) => typeof a.questionId === 'string' && a.questionId.length > 0 && Number.isInteger(a.optionIndex) && a.optionIndex >= 0,
    )
  }
  if (ruleQuestions?.length) {
    return ruleQuestions.map((q) => ({ questionId: q.id, optionIndex: q.correctIndex ?? 0 }))
  }
  return (checkQuestions ?? []).flatMap((q) => {
    const optionIndex = checkAnswers?.[q.id]
    return typeof optionIndex === 'number' && Number.isInteger(optionIndex) && optionIndex >= 0
      ? [{ questionId: q.id, optionIndex }]
      : []
  })
}
