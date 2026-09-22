import { useNavigate } from 'react-router'
import type { QuestDetail } from '@/shared/lib/api'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import { adaptRuleToStages } from '@/features/lesson/lib/stage-adapter'
import { findIslandCurriculum } from '@/features/lesson/data/island-curriculum-registry'
import { resolveIslandSixStageJourney } from '@/features/lesson/lib/island-journey-resolver'
import { SixStageJourneyView } from '@/features/lesson/components/SixStageJourneyView'

type Props = {
  mode: 'rule' | 'island'
  quest: QuestDetail
  ruleId: number
  effectiveCourseId: string
  liveStars: number
  onFinish: () => void
}

export default function LessonJourneyRenderer({ mode, quest, ruleId, effectiveCourseId, liveStars, onFinish }: Props) {
  const navigate = useNavigate()
  const isRule = mode === 'rule'
  const journey = isRule ? undefined : resolveIslandSixStageJourney(quest)
  const stages = isRule
    ? adaptRuleToStages(AIKI_RULES_DATA.find((rule) => rule.id === ruleId) || AIKI_RULES_DATA[0])
    : undefined

  return (
    <div className="h-auto min-h-full flex-none bg-slate-50/60 p-2 sm:p-2.5 lg:p-3 page-enter flex flex-col overflow-visible md:h-full md:max-h-full md:min-h-0 md:flex-1 md:overflow-hidden">
      <SixStageJourneyView
        stages={stages}
        journey={journey}
        lessonId={quest.id}
        lessonTitle={quest.title}
        studentStars={liveStars || 42}
        rewardXp={journey?.stage6_completion?.rewardBadge?.xp ?? 50}
        onBackToMap={() => navigate(`/world/${effectiveCourseId}`)}
        onNavigateNextLesson={(nextSlug) => {
          const nextCurriculum = isRule ? undefined : findIslandCurriculum({ id: nextSlug, slug: nextSlug })
          const targetCourseId = nextCurriculum?.islandNumber ? `dao-${nextCurriculum.islandNumber}` : effectiveCourseId
          navigate(`/world/${targetCourseId}/lesson/${nextSlug}`)
        }}
        onFinishLesson={onFinish}
      />
    </div>
  )
}
