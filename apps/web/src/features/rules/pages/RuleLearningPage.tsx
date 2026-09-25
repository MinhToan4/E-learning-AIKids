import { Navigate, useParams } from 'react-router'

export function RuleLearningPage() {
  const { ruleId: ruleIdParam } = useParams<{ ruleId: string }>()
  const parsedRuleId = Number.parseInt(ruleIdParam ?? '1', 10)
  const ruleId = Number.isFinite(parsedRuleId) ? Math.max(1, Math.min(10, parsedRuleId)) : 1

  // Keep old bookmarks working, but use the canonical lesson flow so answer
  // validation, stars, XP and unlocks are always committed by the LMS backend.
  return <Navigate replace to={`/world/aiki-rules/lesson/rule-${ruleId}`} />
}
