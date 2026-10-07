import { useNavigate } from 'react-router'
import type { QuestDetail } from '@/shared/lib/api'
import { adaptSixStageJourneyToStages } from '@/features/lesson/lib/stage-adapter'
import { findIslandCurriculum } from '@/features/lesson/data/island-curriculum-registry'
import { resolveIslandSixStageJourney, computeNextIslandLessonSlug } from '@/features/lesson/lib/island-journey-resolver'
import { SixStageJourneyView } from '@/features/lesson/components/SixStageJourneyView'
import type { LessonCompletionSummary } from '@/features/lesson/components/SixStageJourneyView'

type Props = {
  mode: 'rule' | 'island'
  quest: QuestDetail
  ruleId: number
  effectiveCourseId: string
  liveStars: number
  initialStageIndex?: number
  isCompleted?: boolean
  onFinish: (customSummary?: LessonCompletionSummary) => boolean | void | Promise<boolean | void>
  onStageChange?: (stageIndex: number, stageCount: number) => void
  onVideoCompleted?: () => void
}

export default function LessonJourneyRenderer({ mode, quest, ruleId, effectiveCourseId, liveStars, initialStageIndex = 0, isCompleted = false, onFinish, onStageChange, onVideoCompleted }: Props) {
  const navigate = useNavigate()
  const journey = resolveIslandSixStageJourney(quest)
  const matchedCurriculum = findIslandCurriculum(quest)
  const stages = adaptSixStageJourneyToStages(journey, {
    lessonId: quest.id,
    lessonTitle: quest.title,
    matchedCurriculum,
  })

  return (
    <div className="h-auto min-h-full flex-none bg-slate-50/60 p-2 sm:p-2.5 lg:p-3 page-enter flex flex-col overflow-visible md:h-full md:max-h-full md:min-h-0 md:flex-1 md:overflow-hidden w-full max-w-[1024px] mx-auto">
      <SixStageJourneyView
        key={quest.id}
        stages={stages}
        journey={journey}
        lessonId={quest.id}
        lessonTitle={quest.title}
        studentStars={liveStars || 42}
        rewardXp={journey?.stage6_completion?.rewardBadge?.xp ?? 50}
        matchedCurriculum={matchedCurriculum}
        initialStageIndex={initialStageIndex}
        initialPracticeState={
          (quest as any)?.progress?.state?.practice?.payload ??
          (quest as any)?.state?.practice?.payload ??
          (quest as any)?.practiceState
        }
        isCompleted={isCompleted || liveStars >= 3}
        previousStars={liveStars}
        onBackToMap={() => {
          const targetSlug = matchedCurriculum?.islandNumber
            ? (matchedCurriculum.islandNumber === 0 ? 'muoi-quy-tac-xuong-sang-tao' : `dao-${matchedCurriculum.islandNumber}`)
            : (effectiveCourseId || 'dao-1')
          navigate(`/world/program/aikid_official?island=${encodeURIComponent(targetSlug)}`)
        }}
        onNavigateNextLesson={(nextSlug) => {
          const fallbackNext =
            nextSlug ||
            journey?.stage6_completion?.nextLessonSlug ||
            (matchedCurriculum ? computeNextIslandLessonSlug(matchedCurriculum.id || matchedCurriculum.slug) : undefined) ||
            computeNextIslandLessonSlug(quest.id)
          if (!fallbackNext) {
            navigate(`/world/${effectiveCourseId}`)
            return
          }
          const nextCurriculum = findIslandCurriculum({ id: fallbackNext, slug: fallbackNext })
          const targetCourseId = nextCurriculum?.islandNumber ? `dao-${nextCurriculum.islandNumber}` : effectiveCourseId
          navigate(`/world/${targetCourseId}/lesson/${fallbackNext}`)
        }}
        onFinishLesson={onFinish}
        onStageChange={(stageIndex) => onStageChange?.(stageIndex, stages.length)}
        onVideoCompleted={onVideoCompleted}
      />
    </div>
  )
}
