import type {
  CurriculumGameConfig,
  CurriculumGameDifficulty,
} from '@/features/lesson/lib/curriculum-game'

export type EngineResult = {
  choices: string[]
  attempts: number
  score: number
  maxStreak: number
}

export type EngineGameProps = {
  config?: CurriculumGameConfig
  difficulty: CurriculumGameDifficulty
  instruction: string
  outcome?: string
  onComplete: (result: EngineResult) => void
  onBack?: () => void
}
