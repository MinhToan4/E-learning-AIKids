import { useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import {
  getGameDefinition,
  resolveGamePolicy,
  type CurriculumGameConfig,
  type CurriculumGameDifficulty,
  type CurriculumGameType,
} from '@/features/lesson/lib/curriculum-game'
import { GameModeIcon } from './GameModeIcon'
import { BlocklyMazeGame } from './games/BlocklyMazeGame'
import { MathKidsGame } from './games/MathKidsGame'
import { BattleMathGame } from './games/BattleMathGame'
import { EdukizGame } from './games/EdukizGame'
import type { EngineResult } from './games/types'

export type GameEvidence = {
  gameType: CurriculumGameType
  choices: string[]
  attempts: number
  durationMs: number
  score: number
  maxStreak: number
  difficulty: CurriculumGameDifficulty
  selectedByStudent: boolean
}

type Props = {
  gameType?: string
  gameConfig?: CurriculumGameConfig
  instruction: string
  outcome?: string
  onComplete: (evidence: GameEvidence) => void
}

const ENGINES = {
  blockly: BlocklyMazeGame,
  'math-kids': MathKidsGame,
  'battle-math': BattleMathGame,
  edukiz: EdukizGame,
} satisfies Record<CurriculumGameType, typeof BlocklyMazeGame>

export function CurriculumGame(props: Props) {
  const policy = useMemo(
    () => resolveGamePolicy(props.gameConfig, props.gameType),
    [props.gameConfig, props.gameType],
  )
  const [selectedType, setSelectedType] = useState<CurriculumGameType | null>(
    policy.selectionMode === 'required' ? policy.allowedTypes[0]! : null,
  )
  const startedAt = useRef(Date.now())

  useEffect(() => {
    setSelectedType(policy.selectionMode === 'required' ? policy.allowedTypes[0]! : null)
    startedAt.current = Date.now()
  }, [policy.selectionMode, policy.allowedTypes.join('|')])

  function choose(type: CurriculumGameType) {
    startedAt.current = Date.now()
    setSelectedType(type)
  }

  if (!selectedType) {
    return (
      <section className="overflow-hidden rounded-[2rem] border-2 border-brand-100 bg-white shadow-clay" aria-labelledby="game-lobby-heading">
        <div className="relative overflow-hidden p-6 text-white sm:p-8">
          <div className="absolute inset-0 bg-[url('/assets/game-engines/ai-worlds.jpg')] bg-cover bg-center" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-950/80 to-brand-950/30" aria-hidden="true" />
          <div className="relative">
            <p className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.14em] text-sun-300"><Sparkles size={17} /> StoryMee Game Lab</p>
            <h2 id="game-lobby-heading" className="mt-2 font-display text-3xl">Con muốn khám phá AI ở thế giới nào?</h2>
            <p className="mt-2 max-w-2xl font-semibold text-white/85">Bốn game có bốn vòng chơi riêng: lập trình, dữ liệu, kiểm chứng hình ảnh và huấn luyện AI.</p>
          </div>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
          {policy.allowedTypes.map((type) => {
            const definition = getGameDefinition(type)
            return (
              <button key={type} type="button" onClick={() => choose(type)} className="group grid min-h-44 grid-cols-[4rem_1fr] gap-4 rounded-3xl border-2 border-brand-100 bg-brand-50 p-5 text-left transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-clay focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand-300">
                <span className="grid size-16 place-items-center rounded-2xl bg-white text-brand-600 shadow-sm"><GameModeIcon type={type} size={38} /></span>
                <span>
                  <strong className="font-display text-xl text-brand-900">{definition.label}</strong>
                  <span className="mt-1 block text-sm font-bold text-muted">{definition.description}</span>
                  <span className="mt-3 block text-xs font-extrabold uppercase tracking-wide text-mint-700">{definition.gameplay}</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>
    )
  }

  const Engine = ENGINES[selectedType]
  return (
    <Engine
      config={props.gameConfig}
      difficulty={policy.difficulty}
      instruction={props.instruction}
      outcome={props.outcome}
      onBack={policy.selectionMode === 'student_choice' ? () => setSelectedType(null) : undefined}
      onComplete={(result: EngineResult) =>
        props.onComplete({
          ...result,
          gameType: selectedType,
          durationMs: Math.max(0, Date.now() - startedAt.current),
          difficulty: policy.difficulty,
          selectedByStudent: policy.selectionMode === 'student_choice',
        })
      }
    />
  )
}
