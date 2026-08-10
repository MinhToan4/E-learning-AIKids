import type {
  CurriculumGameConfig,
  CurriculumGameDefinition,
  CurriculumGameDifficulty,
} from '@/features/lesson/lib/curriculum-game'

export type EngineResult = {
  choices: string[]
  attempts: number
  score: number
  maxStreak: number
}

export type GameHint = {
  text: string
  type: 'correct' | 'wrong' | 'hint'
}

export type EngineGameProps = {
  config?: CurriculumGameConfig
  // WHY: definition optional — 4 game cũ dùng scene URL hardcoded, không cần
  // definition object. 2 game mới (DataRunner, TruthPatrol) dùng definition.sceneUrl.
  definition?: CurriculumGameDefinition
  difficulty: CurriculumGameDifficulty
  instruction: string
  outcome?: string
  onComplete: (result: EngineResult) => void
  onBack?: () => void
  onHint?: (hint: GameHint | null) => void
}
