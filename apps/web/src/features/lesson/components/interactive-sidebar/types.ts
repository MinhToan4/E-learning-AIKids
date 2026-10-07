import type { MeeTutorPose } from '../MeeTutorAvatar'
import type { Gesture } from '@/features/mee-rig/hooks/useMeeCatSpeech'
import type { AikiRuleQuestion } from '@/features/rules/types'

export type Phase = 'learn' | 'game' | 'practice' | 'check' | 'done'
export type PoseType = MeeTutorPose

export interface InteractiveRiddle {
  id: string
  title?: string
  question: string
  options: Array<{ id?: string; text?: string; label?: string; imageUrl?: string } | string>
  answer?: number | string
  explanation?: string
  meeHint?: string
  hints?: string[]
  steps?: Array<{ title: string; detail: string }>
}

export interface LessonInteractiveSidebarProps {
  className?: string
  guideCopy: {
    eyebrow: string
    title: string
    body: string
    pose: PoseType
  }
  phase: Phase
  maxUnlockedPhase: Phase
  goals?: string[]
  product?: string
  successCriteria?: string[]
  narrationText?: string
  hints?: string[]
  autoRead?: boolean
  gesture?: Gesture
  narrationKey?: string | number
  stages?: Array<{ id: string; label: string; kind?: string }>
  currentStageIndex?: number
  onSelectStage?: (index: number) => void
  isCollapsed?: boolean
  onToggleCollapse?: (collapsed: boolean) => void

  // Interactive Question & Challenge Action Card props
  riddle?: InteractiveRiddle
  selectedAnswer?: number | string | null
  onSelectAnswer?: (optionIndex: number, optionId?: string) => void
  answerFeedback?: { correct: boolean; explanation: string }
  isChecking?: boolean
  onNextStage?: (nextStageIndex: number) => void
  onRewardStar?: () => void
  liveStars?: number

  // Aiki Rule Review Questions
  aikiQuestions?: AikiRuleQuestion[]
  aikiQuestionIndex?: number
  onSelectAikiQuestionIndex?: (index: number) => void
  onSeekVideo?: (sec: number) => void
  seekExplainSec?: number
  onAikiFinishAllQuestions?: () => void

  // Aiki Rule commitments
  hasAcknowledgedRule?: boolean
  onAcknowledgeRule?: () => void
  onOpenPosterModal?: () => void
  hasCommitted?: boolean
  onToggleCommit?: () => void
  onAikiFinish?: () => void
  busy?: boolean
  hideMascot?: boolean
  hideMascotAvatar?: boolean
  isVideoPlaying?: boolean
  onSpeakingChange?: (isSpeaking: boolean) => void
}
