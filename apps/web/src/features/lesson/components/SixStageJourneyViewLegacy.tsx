import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import { adaptRuleToStages } from '../lib/rule-stage-adapter'
import { adaptSixStageJourneyToStages } from '../lib/stage-adapter'
import { extractRuleNumber, isAikiRuleJourney } from '../lib/rule-journey-identifiers'
import {
  SixStageJourneyView as DeclarativeSixStageJourneyView,
  type SixStageJourneyViewProps,
} from './SixStageJourneyView'

/** Test/legacy compatibility adapter. Production renderers pass declarative stages directly. */
export function SixStageJourneyView(props: SixStageJourneyViewProps) {
  if (props.stages?.length) return <DeclarativeSixStageJourneyView {...props} />

  const isRule =
    isAikiRuleJourney(props.lessonId) ||
    isAikiRuleJourney(props.lessonTitle) ||
    isAikiRuleJourney(props.journey)
  const stages = isRule
    ? adaptRuleToStages(
        AIKI_RULES_DATA.find((rule) => rule.id === extractRuleNumber({ id: props.lessonId, title: props.lessonTitle })) ||
          AIKI_RULES_DATA[0],
      )
    : props.journey
      ? adaptSixStageJourneyToStages(props.journey, {
          lessonId: props.lessonId,
          lessonTitle: props.lessonTitle,
          matchedCurriculum: props.matchedCurriculum,
        })
      : []

  return <DeclarativeSixStageJourneyView {...props} stages={stages} />
}
