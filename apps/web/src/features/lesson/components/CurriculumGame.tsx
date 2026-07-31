import { useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import {
  getGameDefinition,
  resolveGamePolicy,
  sanitizeGameLobby,
  type CurriculumGameConfig,
  type CurriculumGameDefinition,
  type CurriculumGameDifficulty,
  type CurriculumGameType,
} from '@/features/lesson/lib/curriculum-game'
import { GameModeIcon } from './GameModeIcon'
import { BattleMathGame } from './games/BattleMathGame'
import { BlocklyMazeGame } from './games/BlocklyMazeGame'
import { DataRunnerGame } from './games/DataRunnerGame'
import { EdukizGame } from './games/EdukizGame'
import { MathKidsGame } from './games/MathKidsGame'
import { TruthPatrolGame } from './games/TruthPatrolGame'
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

// WHY: Tất cả 6 engine phải được khai báo ở đây để TypeScript satisfy
// CurriculumGameType union. Khi thêm game mới → thêm entry ở đây.
const ENGINES: Record<CurriculumGameType, React.ComponentType<React.ComponentProps<typeof DataRunnerGame>>> = {
  'battle-math': BattleMathGame as React.ComponentType<React.ComponentProps<typeof DataRunnerGame>>,
  'blockly': BlocklyMazeGame as React.ComponentType<React.ComponentProps<typeof DataRunnerGame>>,
  'edukiz': EdukizGame as React.ComponentType<React.ComponentProps<typeof DataRunnerGame>>,
  'math-kids': MathKidsGame as React.ComponentType<React.ComponentProps<typeof DataRunnerGame>>,
  'data-runner': DataRunnerGame,
  'truth-patrol': TruthPatrolGame as React.ComponentType<React.ComponentProps<typeof DataRunnerGame>>,
}

// WHY: 4 game cũ tự-chứa (self-contained) — không cần catalog entry trong DB để chạy.
// Built-in metadata này được dùng khi DB không có catalog entry cho game đó,
// đảm bảo học sinh vẫn thấy và chọn được game trong lobby.
const LEGACY_BUILTIN: Record<string, Pick<CurriculumGameDefinition, 'label' | 'shortLabel' | 'description' | 'gameplay' | 'sceneUrl' | 'sceneAlt'>> = {
  'battle-math': {
    label: 'BattleMath · Pháo Đài Kiểm Chứng',
    shortLabel: 'BattleMath',
    description: 'Kiểm chứng ảnh AI trong lượt đấu 30 giây — phát hiện ảnh đúng trước khi hết giờ.',
    gameplay: 'CHỌN ẢNH ĐÚNG · ĐỒNG HỒ · MANH MỐI',
    sceneUrl: '/assets/game-engines/battle-valley.svg',
    sceneAlt: 'Pháo đài kiểm chứng AI trong màn đêm huyền bí',
  },
  'blockly': {
    label: 'Blockly · Đội Cứu Hộ Dữ Liệu',
    shortLabel: 'Blockly',
    description: 'Lập chương trình bằng khối lệnh để dẫn robot qua mê cung, đưa dữ liệu về phòng học AI.',
    gameplay: 'XẾP KHỐI LỆNH · CHẠY · QUAN SÁT · SỬA',
    sceneUrl: '/assets/game-engines/blockly-island.svg',
    sceneAlt: 'Hòn đảo lập trình nổi giữa bầu trời xanh',
  },
  'edukiz': {
    label: 'Edukiz · Xưởng Huấn Luyện AI',
    shortLabel: 'Edukiz',
    description: 'Đi qua 4 phòng: gắn nhãn dữ liệu, bảo vệ bí mật, lắp prompt và kiểm thử kết quả AI.',
    gameplay: 'GẮN NHÃN · GHÉ P CẶP · PROMPT · KIỂM THỬ',
    sceneUrl: '/assets/game-engines/edukiz-garden.svg',
    sceneAlt: 'Khu vườn trí nhớ ma thuật với hoa phát sáng',
  },
  'math-kids': {
    label: 'AI Quiz · Khỉ Đá Bóng',
    shortLabel: 'Khỉ Đá Bóng',
    description: 'Trả lời đúng các câu hỏi trắc nghiệm để giúp Kiki sút bóng vào lưới.',
    gameplay: 'TRẮC NGHIỆM · SÚT BÓNG',
    sceneUrl: '/assets/game-engines/monkey-soccer.webp',
    sceneAlt: 'Sân bóng với trái bóng và khung thành',
  },
}

// Trả về definition đầy đủ cho mọi game type — kể cả 4 game cũ không có catalog
function resolveDefinition(
  config: CurriculumGameConfig | undefined,
  type: CurriculumGameType,
): CurriculumGameDefinition | null {
  // Ưu tiên catalog từ DB (giáo viên có thể override label/description)
  const catalogEntry = getGameDefinition(config, type)
  if (catalogEntry) return catalogEntry
  // Fallback: built-in description cho 4 game cũ
  const builtin = LEGACY_BUILTIN[type]
  if (builtin) return { type, ...builtin }
  return null
}

export function CurriculumGame(props: Props) {
  const policy = useMemo(
    () => resolveGamePolicy(props.gameConfig, props.gameType),
    [props.gameConfig, props.gameType],
  )
  const lobby = useMemo(
    () => sanitizeGameLobby(props.gameConfig?.lobby),
    [props.gameConfig?.lobby],
  )

  // WHY: resolveDefinition handles cả catalog games lẫn legacy games.
  // Mọi game trong allowedTypes đều có definition (catalog hoặc built-in).
  const definitions = useMemo(
    () =>
      policy.allowedTypes
        .map((type) => resolveDefinition(props.gameConfig, type))
        .filter((d): d is CurriculumGameDefinition => d !== null),
    [policy.allowedTypes, props.gameConfig],
  )

  const availableTypes = definitions.map((d) => d.type)
  const mustChoose = policy.selectionMode === 'student_choice' && definitions.length >= 2

  const [selectedType, setSelectedType] = useState<CurriculumGameType | null>(
    mustChoose ? null : availableTypes[0] ?? null,
  )
  const startedAt = useRef(Date.now())

  useEffect(() => {
    setSelectedType(mustChoose ? null : availableTypes[0] ?? null)
    startedAt.current = Date.now()
  }, [mustChoose, availableTypes.join('|')])

  function choose(type: CurriculumGameType) {
    startedAt.current = Date.now()
    setSelectedType(type)
  }

  // Không có game nào được resolve → bài học chưa cấu hình
  if (definitions.length === 0) {
    return (
      <section className="rounded-[2rem] border-2 border-coral-200 bg-coral-50 p-6" role="alert">
        <h2 className="font-display text-2xl text-danger">Game chưa được cấu hình</h2>
        <p className="mt-2 font-bold text-muted">
          Bài học cần chỉ định loại game hợp lệ (gameType) trong cấu hình.
        </p>
      </section>
    )
  }

  // Lobby chọn game (student_choice + nhiều game)
  if (!selectedType) {
    // Nếu có lobby config từ DB → dùng ảnh lobby đẹp
    // Nếu không → hiển thị grid chọn đơn giản (không cần lobby image)
    return (
      <section
        className="overflow-hidden rounded-[2rem] border-2 border-brand-100 bg-white shadow-clay"
        aria-labelledby="game-lobby-heading"
      >
        {/* Lobby banner — chỉ hiển thị nếu có lobby image từ DB */}
        {lobby && (
          <div className="relative overflow-hidden bg-brand-950 text-white">
            <img
              src={lobby.imageUrl}
              alt={lobby.imageAlt}
              width={1672}
              height={941}
              className="aspect-video w-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-950/50 to-transparent" aria-hidden="true" />
            <div className="absolute inset-0 flex max-w-2xl flex-col justify-center p-5 sm:p-8">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-sun-300 sm:text-sm">
                <Sparkles size={17} /> {lobby.eyebrow}
              </p>
              <h2 id="game-lobby-heading" className="mt-2 font-display text-2xl sm:text-4xl">
                {lobby.title}
              </h2>
              <p className="mt-2 hidden max-w-xl font-semibold leading-relaxed text-white/90 sm:block">
                {lobby.description}
              </p>
            </div>
          </div>
        )}

        {/* Nếu không có lobby banner → hiển thị heading đơn giản */}
        {!lobby && (
          <div className="flex items-center gap-3 border-b border-brand-100 bg-brand-50 px-6 py-4">
            <Sparkles size={20} className="text-brand-500" aria-hidden="true" />
            <div>
              <h2 id="game-lobby-heading" className="font-display text-xl text-brand-900">
                Chọn game học AI
              </h2>
              <p className="text-sm font-semibold text-muted">
                {props.instruction || 'Chọn một nhiệm vụ để bắt đầu học bằng hành động.'}
              </p>
            </div>
          </div>
        )}

        {/* Game cards grid */}
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
          {definitions.map((definition) => (
            <button
              key={definition.type}
              id={`game-choice-${definition.type}`}
              type="button"
              onClick={() => choose(definition.type)}
              className="group grid min-h-44 grid-cols-[4rem_1fr] gap-4 rounded-3xl border-2 border-brand-100 bg-brand-50 p-5 text-left transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-clay focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand-300"
            >
              {/* Scene thumbnail từ SVG */}
              <span className="relative grid size-16 overflow-hidden rounded-2xl bg-white shadow-sm">
                <img
                  src={definition.sceneUrl}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 grid place-items-center bg-white/70">
                  <GameModeIcon type={definition.type} size={30} className="text-brand-600" />
                </span>
              </span>
              <span>
                <strong className="font-display text-xl text-brand-900">{definition.label}</strong>
                <span className="mt-1 block text-sm font-bold text-muted">{definition.description}</span>
                <span className="mt-3 block text-xs font-extrabold uppercase tracking-wide text-mint-700">
                  {definition.gameplay}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
    )
  }

  // Render engine đã chọn
  const definition = resolveDefinition(props.gameConfig, selectedType)
  // WHY: DataRunner và TruthPatrol cần definition.sceneUrl từ catalog.
  // 4 game cũ có built-in scene URLs nên definition luôn non-null.
  const isNewEngine = selectedType === 'data-runner' || selectedType === 'truth-patrol'
  if (isNewEngine && !definition) return null

  const Engine = ENGINES[selectedType]
  return (
    <div className="relative">
      <Engine
        config={props.gameConfig}
        definition={definition ?? undefined}
        difficulty={policy.difficulty}
        instruction={props.instruction}
        outcome={props.outcome}
        onBack={mustChoose ? () => setSelectedType(null) : undefined}
        onComplete={(result: EngineResult) =>
          props.onComplete({
            ...result,
            gameType: selectedType,
            durationMs: Math.max(0, Date.now() - startedAt.current),
            difficulty: policy.difficulty,
            selectedByStudent: mustChoose,
          })
        }
      />
    </div>
  )
}
