import { useMemo, useRef, useState } from 'react'
import { CheckCircle2, RotateCw, Search, Sparkles } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

type GameType =
  | 'match'
  | 'drag'
  | 'spin'
  | 'sort'
  | 'order'
  | 'detective'
  | 'pick'

export type GameEvidence = {
  gameType: GameType
  choices: string[]
  attempts: number
  durationMs: number
}

type Props = {
  gameType?: string
  gameConfig?: { cards?: string[] }
  instruction: string
  outcome?: string
  onComplete: (evidence: GameEvidence) => void
}

const PLAY_LENSES = [
  { emoji: '👀', label: 'Quan sát kỹ' },
  { emoji: '🧩', label: 'Tìm điểm liên quan' },
  { emoji: '💬', label: 'Nói lý do của con' },
] as const

const WHEEL_PROMPTS = [
  'Tìm một chi tiết nổi bật',
  'Thử đổi thứ tự',
  'So sánh hai lựa chọn',
  'Nói điều con vừa nhận ra',
] as const

const GAME_TYPES = new Set<GameType>([
  'match',
  'drag',
  'spin',
  'sort',
  'order',
  'detective',
  'pick',
])

function normalizeGameType(value?: string): GameType {
  return value && GAME_TYPES.has(value as GameType) ? (value as GameType) : 'pick'
}

function rotate<T>(items: T[]): T[] {
  return items.length < 2 ? items : [...items.slice(1), items[0]]
}

export function CurriculumGame({
  gameType,
  gameConfig,
  instruction,
  outcome,
  onComplete,
}: Props) {
  const type = normalizeGameType(gameType)
  const startedAt = useRef(Date.now())
  const [attempts, setAttempts] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [reason, setReason] = useState<string | null>(null)
  const [orderStep, setOrderStep] = useState(0)
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null)
  const [wheelIndex, setWheelIndex] = useState<number | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [leftMatch, setLeftMatch] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])

  const cards = useMemo(() => {
    const fromCourse = (gameConfig?.cards ?? [])
      .map((card) => card.trim())
      .filter((card, index, all) => card.length >= 2 && all.indexOf(card) === index)
      .slice(0, 6)
    return fromCourse.length >= 2
      ? fromCourse
      : PLAY_LENSES.map((item) => item.label)
  }, [gameConfig?.cards])

  const shuffled = useMemo(() => rotate(cards), [cards])
  const isOrder = type === 'order' || type === 'sort' || type === 'drag'
  const complete =
    type === 'spin'
      ? wheelIndex !== null && reason !== null
      : type === 'match'
        ? matched.length === cards.length
        : isOrder
          ? orderStep === cards.length
          : selected.length >= Math.min(2, cards.length) && reason !== null

  function toggleChoice(label: string) {
    setAttempts((value) => value + 1)
    setSelected((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : current.length >= 2
          ? [current[1], label]
          : [...current, label],
    )
  }

  function chooseOrder(label: string) {
    setAttempts((value) => value + 1)
    if (label === cards[orderStep]) {
      setOrderStep((value) => value + 1)
      setOrderFeedback('Đúng rồi! Con đã tìm được bước tiếp theo.')
    } else {
      setOrderFeedback('Chưa đúng thứ tự. Con nhìn lại nhiệm vụ và thử lần nữa nhé!')
    }
  }

  function chooseMatch(side: 'left' | 'right', label: string) {
    if (matched.includes(label)) return
    setAttempts((value) => value + 1)
    if (side === 'left') {
      setLeftMatch(label)
      return
    }
    if (leftMatch === label) {
      setMatched((current) => [...current, label])
      setLeftMatch(null)
    } else {
      setLeftMatch(null)
    }
  }

  function spin() {
    setAttempts((value) => value + 1)
    setSpinning(true)
    window.setTimeout(() => {
      setWheelIndex((attempts + cards.length) % cards.length)
      setSpinning(false)
    }, 350)
  }

  function finish() {
    if (!complete) return
    const choices =
      type === 'spin' && wheelIndex !== null
        ? [cards[wheelIndex], reason!]
        : type === 'match'
          ? matched
          : isOrder
            ? cards
            : [...selected, reason!]
    onComplete({
      gameType: type,
      choices,
      attempts: Math.max(1, attempts),
      durationMs: Math.min(10 * 60 * 1000, Date.now() - startedAt.current),
    })
  }

  return (
    <section className="flex flex-col gap-4" aria-labelledby="game-heading">
      <div className="rounded-3xl border-2 border-sun-100 bg-sun-100/40 p-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-warning">
          Thử thách khám phá
        </p>
        <h2 id="game-heading" className="font-display mt-1 text-2xl">
          {type === 'detective' ? 'Thám tử tìm manh mối' : 'Chơi để hiểu bài'}
        </h2>
        <p className="mt-2 text-sm font-semibold leading-relaxed">{instruction}</p>
        {outcome && (
          <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-xs text-muted">
            Khi hoàn thành, con có thể: {outcome}
          </p>
        )}
      </div>

      {type === 'spin' ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-brand-50 p-5 text-center">
          <div
            className={cn(
              'flex h-32 w-32 items-center justify-center rounded-full border-8 border-white bg-gradient-to-br from-brand-100 via-sun-100 to-mint-100 text-5xl shadow-clay motion-reduce:transition-none',
              spinning && 'rotate-180 transition-transform duration-300',
            )}
            aria-hidden="true"
          >
            🎡
          </div>
          <Button variant="secondary" onClick={spin} disabled={spinning}>
            <RotateCw size={18} /> {spinning ? 'Đang quay…' : 'Quay thử thách'}
          </Button>
          {wheelIndex !== null && (
            <p className="rounded-2xl bg-white px-4 py-3 font-bold" role="status">
              {cards[wheelIndex] ?? WHEEL_PROMPTS[wheelIndex % WHEEL_PROMPTS.length]}
            </p>
          )}
        </div>
      ) : type === 'match' ? (
        <div className="grid grid-cols-2 gap-3" aria-label="Ghép hai thẻ giống nhau">
          <div className="space-y-2">
            {cards.map((label) => (
              <button
                key={`left-${label}`}
                type="button"
                disabled={matched.includes(label)}
                onClick={() => chooseMatch('left', label)}
                className={cn(
                  'min-h-12 w-full rounded-2xl border-2 px-3 py-2 text-left text-sm font-bold transition-colors',
                  matched.includes(label)
                    ? 'border-mint-300 bg-mint-100'
                    : leftMatch === label
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-border bg-white hover:border-brand-300',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {shuffled.map((label) => (
              <button
                key={`right-${label}`}
                type="button"
                disabled={matched.includes(label)}
                onClick={() => chooseMatch('right', label)}
                className={cn(
                  'min-h-12 w-full rounded-2xl border-2 px-3 py-2 text-left text-sm font-bold transition-colors',
                  matched.includes(label)
                    ? 'border-mint-300 bg-mint-100'
                    : 'border-border bg-white hover:border-brand-300',
                )}
              >
                {matched.includes(label) ? '✓ ' : '◇ '}{label}
              </button>
            ))}
          </div>
        </div>
      ) : isOrder ? (
        <div>
          <p className="mb-2 text-sm font-bold text-muted">
            Chọn từng thẻ theo thứ tự hợp lý trong nhiệm vụ.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {shuffled.map((label) => {
              const done = cards.indexOf(label) < orderStep
              return (
                <button
                  key={label}
                  type="button"
                  className={cn(
                    'min-h-12 rounded-2xl border-2 px-4 py-3 text-left font-bold transition-colors',
                    done
                      ? 'border-mint-300 bg-mint-100'
                      : 'border-border bg-white hover:border-brand-300',
                  )}
                  disabled={done || complete}
                  onClick={() => chooseOrder(label)}
                >
                  {done ? '✓' : '◇'} {label}
                </button>
              )
            })}
          </div>
          {orderFeedback && (
            <p className="mt-2 text-xs font-semibold text-muted" aria-live="polite">
              {orderFeedback}
            </p>
          )}
        </div>
      ) : (
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-muted">
            {type === 'detective' ? <Search size={17} /> : <Sparkles size={17} />}
            Chọn hai {type === 'detective' ? 'manh mối' : 'ý'} quan trọng nhất.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {cards.map((label, index) => (
              <button
                key={label}
                type="button"
                className={cn(
                  'min-h-14 rounded-2xl border-2 px-4 py-3 text-left font-bold transition-colors',
                  selected.includes(label)
                    ? 'border-brand-400 bg-brand-50 shadow-clay'
                    : 'border-border bg-white hover:border-brand-300',
                )}
                onClick={() => toggleChoice(label)}
              >
                <span className="mr-2 text-xl">{['👀', '🧩', '💬', '🎨', '✨', '🔎'][index]}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {type !== 'match' && !isOrder && (type !== 'spin' || wheelIndex !== null) && (
        <fieldset className="rounded-2xl border-2 border-mint-100 bg-mint-100/30 p-3">
          <legend className="px-2 text-sm font-extrabold">Con đã dùng cách nào?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {PLAY_LENSES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setReason(item.label)}
                className={cn(
                  'min-h-11 rounded-xl border-2 px-3 text-sm font-bold',
                  reason === item.label
                    ? 'border-mint-400 bg-white'
                    : 'border-transparent bg-white/70',
                )}
              >
                {item.emoji} {item.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-page px-3 py-2">
        <p className="text-xs font-semibold text-muted" aria-live="polite">
          {complete ? 'Con đã sẵn sàng sang xưởng sáng tạo!' : 'Thử thách cần thêm một bước nữa.'}
        </p>
        <span className="shrink-0 text-xs font-bold text-brand-500">{attempts} lượt thử</span>
      </div>

      <Button onClick={finish} disabled={!complete}>
        <CheckCircle2 size={18} /> Hoàn thành thử thách
      </Button>
    </section>
  )
}
