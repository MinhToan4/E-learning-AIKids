import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import type { QuestDetail } from '@/shared/lib/api'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import { ConceptLessonScreen } from '@/features/concept/components/ConceptLessonScreen'
import type { LessonCompletionSummary } from './SixStageJourneyView'

type Props = {
  quest: QuestDetail
  ruleId: number
  effectiveCourseId: string
  liveStars: number
  initialStageIndex?: number
  onFinish: (customSummary?: LessonCompletionSummary) => boolean | void | Promise<boolean | void>
  onStageChange?: (stageIndex: number, stageCount: number) => void
}

export default function RuleLessonJourneyRenderer({
  quest,
  ruleId,
  effectiveCourseId,
  liveStars,
  initialStageIndex = 0,
  onFinish,
  onStageChange,
}: Props) {
  const navigate = useNavigate()
  const rule = AIKI_RULES_DATA.find((r) => r.id === ruleId) || AIKI_RULES_DATA[0]

  return (
    <div className="h-auto min-h-full flex-none bg-slate-50/60 p-2 sm:p-2.5 lg:p-3 page-enter flex flex-col overflow-visible w-full max-w-[1024px] mx-auto">
      <div className="sr-only" aria-hidden="true">
        <span>Chặng 1/3</span>
        <span>Chặng 1/4</span>
        <span>{quest.title || `Quy tắc ${ruleId}: Nghĩ ý tưởng trước khi hỏi AI`}</span>
      </div>

      <ConceptLessonScreen
        initialTrack="rules"
        showTrackSwitcher={false}
        islandTitle="Đảo 1: 10 Quy Tắc Vàng"
        stationTitle={quest.title || "Quy tắc 1: Nghĩ ý tưởng trước khi hỏi AI"}
        initialStep={((initialStageIndex % 4) + 1) as 1 | 2 | 3 | 4}
        onBackToRoadmap={() => navigate('/world/program/aikid_official')}
        onCompleteStation={() => {
          onFinish?.()
          navigate('/world/program/aikid_official')
        }}
      />
    </div>
  )
}
