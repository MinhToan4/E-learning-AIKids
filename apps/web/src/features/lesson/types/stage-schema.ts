/**
 * Stage Schema Definition for AIKids Universal Stage Engine
 * Defines StageType, JourneyStageDefinition, and Stage-specific configuration models.
 */

export type StageType =
  | 'GOAL'
  | 'CONFIRM'
  | 'VIDEO'
  | 'QUIZ'
  | 'PRACTICE'
  | 'REWARD'
  | (string & {})

export interface JourneyStageDefinition<T = any> {
  id: string
  type: StageType
  title: string
  stepNumber: number
  icon?: string
  mascotRole?: string
  speech?: string
  instruction?: string
  config: T
}

export interface ParsedGoalCard {
  index: number
  title: string
  content?: string
  note?: string
}

export interface FormulaCardItem {
  id: string
  icon: string
  code: string
  sub: string
  val: string
  color: string
  bg: string
  badge: string
  image: string
}

export interface GoalStageConfig {
  title: string
  goalText: string
  imageUrl: string
  fallbackImageUrl?: string
  speech?: string
  isFourKeys?: boolean
  formulaCards?: FormulaCardItem[]
  parsedCards?: ParsedGoalCard[]
  keyPoints?: string[]
}

export interface ConfirmOptionItem {
  id: string
  text: string
  imageUrl?: string
  keyItems?: Array<{ label: string; color?: string }>
}

export interface ConfirmStageConfig {
  question: string
  subPrompt?: string
  hasKeyOptions?: boolean
  options: ConfirmOptionItem[]
  correctIndex: number
  explanation: string
  speech?: string
}

export interface VideoTimestampItem {
  label: string
  startSec: number
  endSec?: number
  speech?: string
}

export interface VideoStageConfig {
  title: string
  videoUrl: string
  videoEmbedUrl: string
  durationSec: number
  posterUrl?: string
  timestamps: VideoTimestampItem[]
  isDedicatedLessonVideo?: boolean
  speech?: string
  slides?: Array<{
    stage: string
    speaker: string
    dialogue: string
    screenAction?: string
    image?: string
  }>
}

export interface QuizQuestionItem {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation?: string
  hint?: string
  retryFeedback?: string
  visualUrl?: string
}

export interface QuizStageConfig {
  title: string
  questions: QuizQuestionItem[]
  passScore?: number
  speech?: string
  posterUrl?: string
}

export interface PracticeStageConfig {
  title: string
  badge?: string
  subjectName?: string
  lockedFeatures?: string[]
  creativeEngineMode?: string
  notebookConfig?: any
  studioConfig?: any
  defaultPracticeParts?: any[]
  sampleUrl?: string
  akiMotto?: string
  speech?: string
}

export interface RewardStageConfig {
  title: string
  congratsMessage: string
  rewardBadge: {
    name: string
    iconUrl?: string
    stars?: number
    xp?: number
  }
  nextLessonSlug?: string
  nextLessonId?: string
  speech?: string
}
