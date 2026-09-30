import type React from 'react'
import { GoalBlockEditor } from './GoalBlockEditor'
import { ConfirmBlockEditor } from './ConfirmBlockEditor'
import { VideoBlockEditor } from './VideoBlockEditor'
import { QuizBlockEditor } from './QuizBlockEditor'
import { PracticeBlockEditor } from './PracticeBlockEditor'
import { RewardBlockEditor } from './RewardBlockEditor'

export const STAGE_BLOCK_EDITOR_REGISTRY: Record<string, React.ComponentType<any>> = {
  GOAL: GoalBlockEditor,
  CONFIRM: ConfirmBlockEditor,
  VIDEO: VideoBlockEditor,
  QUIZ: QuizBlockEditor,
  PRACTICE: PracticeBlockEditor,
  REWARD: RewardBlockEditor,
}
