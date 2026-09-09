export type RuleQuestion = {
  id: string
  prompt: string
  options: [string, string, string] // Exactly 3 options A, B, C
  correctIndex: 0 | 1 | 2
  hint: string
  successFeedback: string
  retryFeedback: string
}

export type RuleVideoSlide = {
  stage: string
  speaker: string
  dialogue: string
  screenAction: string
  image?: string
}

export type AikiRule = {
  id: number // 1 to 10
  code: string // QT1 to QT10
  title: string
  shortTitle: string
  goal: string
  skill: string
  durationSec: number
  videoUrl?: string
  posterImage: string
  audioVoiceText: string
  akiTip: string
  slides: RuleVideoSlide[]
  questions: [RuleQuestion, RuleQuestion] // Exactly 2 review questions
}

export type RuleProgressStatus = 'locked' | 'available' | 'completed'

export type RuleUserProgress = {
  ruleId: number
  status: RuleProgressStatus
  completedQuestions: number
  starsEarned: number
  completedAt?: string
}

export type RulesOverallProgress = {
  rules: Record<number, RuleUserProgress>
  totalStars: number
  totalXp: number
  unlockedPosters: number[]
}
