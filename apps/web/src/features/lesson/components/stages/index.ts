import React from 'react'
import { GoalStageBlock, type GoalStageBlockProps } from './GoalStageBlock'
import { ConfirmStageBlock, type ConfirmStageBlockProps } from './ConfirmStageBlock'
import { VideoStageBlock, type VideoStageBlockProps } from './VideoStageBlock'
import { QuizStageBlock, type QuizStageBlockProps } from './QuizStageBlock'
import { PracticeStageBlock, type PracticeStageBlockProps } from './PracticeStageBlock'
import { RewardStageBlock, type RewardStageBlockProps } from './RewardStageBlock'

export * from './GoalStageBlock'
export * from './ConfirmStageBlock'
export * from './VideoStageBlock'
export * from './QuizStageBlock'
export * from './PracticeStageBlock'
export * from './RewardStageBlock'

export type StageComponentProps =
  | GoalStageBlockProps
  | ConfirmStageBlockProps
  | VideoStageBlockProps
  | QuizStageBlockProps
  | PracticeStageBlockProps
  | RewardStageBlockProps
  | Record<string, any>

export const STAGE_REGISTRY: Record<string, React.ComponentType<any>> = {
  GOAL: GoalStageBlock,
  CONFIRM: ConfirmStageBlock,
  VIDEO: VideoStageBlock,
  QUIZ: QuizStageBlock,
  PRACTICE: PracticeStageBlock,
  REWARD: RewardStageBlock,
}
