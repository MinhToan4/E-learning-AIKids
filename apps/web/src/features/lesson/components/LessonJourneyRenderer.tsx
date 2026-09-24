import { useNavigate } from 'react-router'
import type { QuestDetail } from '@/shared/lib/api'
import { adaptSixStageJourneyToStages } from '@/features/lesson/lib/stage-adapter'
import { findIslandCurriculum } from '@/features/lesson/data/island-curriculum-registry'
import { resolveIslandSixStageJourney } from '@/features/lesson/lib/island-journey-resolver'
import { SixStageJourneyView } from '@/features/lesson/components/SixStageJourneyView'
import type { LessonCompletionSummary } from '@/features/lesson/components/SixStageJourneyView'

type Props = {
  mode: 'rule' | 'island'
  quest: QuestDetail
  ruleId: number
  effectiveCourseId: string
  liveStars: number
  onFinish: (customSummary?: LessonCompletionSummary) => void
}

export default function LessonJourneyRenderer({ mode, quest, ruleId, effectiveCourseId, liveStars, onFinish }: Props) {
  const navigate = useNavigate()
  const journey = resolveIslandSixStageJourney(quest)
  const matchedCurriculum = findIslandCurriculum(quest)
  const stages = adaptSixStageJourneyToStages(journey, {
    lessonId: quest.id,
    lessonTitle: quest.title,
    matchedCurriculum,
  })

  return (
    <div className="h-auto min-h-full flex-none bg-slate-50/60 p-2 sm:p-2.5 lg:p-3 page-enter flex flex-col overflow-visible md:h-full md:max-h-full md:min-h-0 md:flex-1 md:overflow-hidden">
      <SixStageJourneyView
        key={quest.id}
        stages={stages}
        journey={journey}
        lessonId={quest.id}
        lessonTitle={quest.title}
        studentStars={liveStars || 42}
        rewardXp={journey?.stage6_completion?.rewardBadge?.xp ?? 50}
        matchedCurriculum={matchedCurriculum}
        onBackToMap={() => navigate(`/world/${effectiveCourseId}`)}
        onNavigateNextLesson={(nextSlug) => {
          try {
            localStorage.removeItem(`aikids_lesson_stage_${nextSlug}`)
            localStorage.removeItem(`aikids_lesson_completed_stages_${nextSlug}`)
          } catch {}
          const nextCurriculum = findIslandCurriculum({ id: nextSlug, slug: nextSlug })
          const targetCourseId = nextCurriculum?.islandNumber ? `dao-${nextCurriculum.islandNumber}` : effectiveCourseId
          navigate(`/world/${targetCourseId}/lesson/${nextSlug}`)
        }}
        onFinishLesson={onFinish}
      />
    </div>
  )
}
