import { useParams, useNavigate } from 'react-router'
import { AikiRuleWorkspace } from '../components/AikiRuleWorkspace'

export function RuleLearningPage() {
  const { ruleId: ruleIdParam } = useParams<{ ruleId: string }>()
  const navigate = useNavigate()
  const ruleId = parseInt(ruleIdParam ?? '1', 10)

  return (
    <AikiRuleWorkspace
      ruleId={ruleId}
      courseId="aiki-rules"
      onBack={() => navigate('/world/aiki-rules')}
      onNext={(nextId) => navigate(`/rules/${nextId}`)}
      backUrl="/world/aiki-rules"
      nextUrlPattern={(nextId) => `/rules/${nextId}`}
    />
  )
}
