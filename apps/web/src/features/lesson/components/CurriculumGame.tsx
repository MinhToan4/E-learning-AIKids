import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Circle, MapPin, RotateCw, Search, Sparkles, Trophy } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import {
  buildMemoryDeck,
  buildAssociationDeck,
  buildOrderBoard,
  GAME_ASSETS,
  getAdventureBlueprint,
  missionProgress,
  nextWheelIndex,
  normalizeGameType,
  sanitizeCombineGroups,
  sanitizeCompareRounds,
  sanitizeAssociationPairs,
  sanitizePlacements,
  sanitizeGameCards,
  type CurriculumGameType,
} from '@/features/lesson/lib/curriculum-game'

export type GameEvidence = {
  gameType: CurriculumGameType
  choices: string[]
  attempts: number
  durationMs: number
}

type Props = {
  gameType?: string
  gameConfig?: {
    cards?: string[]
    groups?: unknown
    rounds?: unknown
    pairs?: unknown
    placements?: unknown
  }
  instruction: string
  outcome?: string
  onComplete: (evidence: GameEvidence) => void
}

const PLAY_LENSES = [
  'Quan sát kỹ',
  'Tìm điểm liên quan',
  'Nói lý do của con',
] as const

const FALLBACK_CARDS = ['Quan sát kỹ', 'Tìm điểm liên quan', 'Nói điều con nhận ra']

export function CurriculumGame({
  gameType,
  gameConfig,
  instruction,
  outcome,
  onComplete,
}: Props) {
  const requestedType = normalizeGameType(gameType)
  const combineGroups = useMemo(
    () => sanitizeCombineGroups(gameConfig?.groups),
    [gameConfig?.groups],
  )
  const compareRounds = useMemo(
    () => sanitizeCompareRounds(gameConfig?.rounds),
    [gameConfig?.rounds],
  )
  const associationPairs = useMemo(
    () => sanitizeAssociationPairs(gameConfig?.pairs),
    [gameConfig?.pairs],
  )
  const placements = useMemo(
    () => sanitizePlacements(gameConfig?.placements),
    [gameConfig?.placements],
  )
  const type =
    requestedType === 'combine' && combineGroups.length < 2
      ? 'pick'
      : requestedType === 'compare' && compareRounds.length === 0
        ? 'pick'
        : requestedType === 'place' && placements.length < 2
          ? 'pick'
        : requestedType
  const adventure = getAdventureBlueprint(type)
  const startedAt = useRef(Date.now())
  const [attempts, setAttempts] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [reason, setReason] = useState<string | null>(null)
  const [orderStep, setOrderStep] = useState(0)
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null)
  const [dragBoard, setDragBoard] = useState<string[]>([])
  const [draggingLabel, setDraggingLabel] = useState<string | null>(null)
  const [wheelIndex, setWheelIndex] = useState<number | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [memoryOpen, setMemoryOpen] = useState<string[]>([])
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [memoryLocked, setMemoryLocked] = useState(false)
  const [memoryFeedback, setMemoryFeedback] = useState<string | null>(null)
  const [combineChoices, setCombineChoices] = useState<Record<number, string>>({})
  const [compareRoundIndex, setCompareRoundIndex] = useState(0)
  const [compareAnswers, setCompareAnswers] = useState<string[]>([])
  const [compareFeedback, setCompareFeedback] = useState<{
    correct: boolean
    text: string
  } | null>(null)
  const [compareSolved, setCompareSolved] = useState(false)
  const [placedTargets, setPlacedTargets] = useState<string[]>([])
  const [placementFeedback, setPlacementFeedback] = useState<{
    correct: boolean
    text: string
  } | null>(null)
  const memoryTimer = useRef<number | null>(null)
  const spinTimer = useRef<number | null>(null)

  const cards = useMemo(() => {
    const fromCourse = sanitizeGameCards(
      gameConfig?.cards ?? [],
      type === 'match' ? 4 : 6,
    )
    return fromCourse.length >= 2 ? fromCourse : FALLBACK_CARDS
  }, [gameConfig?.cards, type])

  const memoryDeck = useMemo(
    () =>
      associationPairs.length >= 2
        ? buildAssociationDeck(associationPairs, instruction)
        : buildMemoryDeck(cards, instruction),
    [associationPairs, cards, instruction],
  )
  const memoryPairCount =
    associationPairs.length >= 2 ? associationPairs.length : cards.length
  const orderBoard = useMemo(
    () => buildOrderBoard(cards, instruction),
    [cards, instruction],
  )
  useEffect(() => setDragBoard(orderBoard), [orderBoard])
  const isOrder = type === 'order' || type === 'sort' || type === 'drag'
  const reorderGame = type === 'drag' || type === 'order'
  const dragComplete = reorderGame && dragBoard.every((label, index) => label === cards[index])
  const combineComplete =
    combineGroups.length >= 2 &&
    combineGroups.every((_, index) => Boolean(combineChoices[index]))
  const compareComplete =
    compareRounds.length > 0 && compareAnswers.length === compareRounds.length
  const placementComplete =
    placements.length > 0 && placedTargets.length === placements.length
  const complete =
    type === 'combine'
      ? combineComplete && reason !== null
      : type === 'compare'
        ? compareComplete
        : type === 'place'
          ? placementComplete
        : type === 'spin'
      ? wheelIndex !== null && reason !== null
      : type === 'match'
        ? matchedPairs.length === memoryPairCount
        : isOrder
          ? reorderGame ? dragComplete : orderStep === cards.length
          : selected.length >= Math.min(2, cards.length) && reason !== null
  const missionTotal =
    type === 'combine'
      ? combineGroups.length
      : type === 'compare'
        ? compareRounds.length
        : type === 'place'
          ? placements.length
        : type === 'spin'
      ? 1
      : type === 'match' || isOrder
        ? type === 'match' ? memoryPairCount : cards.length
        : Math.min(2, cards.length)
  const missionCompleted =
    type === 'combine'
      ? Object.keys(combineChoices).length
      : type === 'compare'
        ? compareAnswers.length
        : type === 'place'
          ? placedTargets.length
        : type === 'spin'
      ? Number(wheelIndex !== null)
      : type === 'match'
        ? matchedPairs.length
        : isOrder
          ? reorderGame ? (dragComplete ? cards.length : 0) : orderStep
          : selected.length
  const progress = missionProgress(missionCompleted, missionTotal)
  const compareRound = compareRounds[compareRoundIndex]
  const currentPlacement = placements[placedTargets.length]

  useEffect(
    () => () => {
      if (memoryTimer.current !== null) window.clearTimeout(memoryTimer.current)
      if (spinTimer.current !== null) window.clearTimeout(spinTimer.current)
    },
    [],
  )

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

  function moveCard(label: string, direction: -1 | 1) {
    setAttempts((value) => value + 1)
    setDragBoard((current) => {
      const from = current.indexOf(label)
      const to = from + direction
      if (from < 0 || to < 0 || to >= current.length) return current
      const next = [...current]
      ;[next[from], next[to]] = [next[to]!, next[from]!]
      return next
    })
  }

  function dropCard(target: string) {
    if (!draggingLabel || draggingLabel === target) return
    setAttempts((value) => value + 1)
    setDragBoard((current) => {
      const from = current.indexOf(draggingLabel)
      const to = current.indexOf(target)
      if (from < 0 || to < 0) return current
      const next = [...current]
      next.splice(from, 1)
      next.splice(to, 0, draggingLabel)
      return next
    })
    setDraggingLabel(null)
  }

  function chooseMemory(cardId: string) {
    if (memoryLocked || memoryOpen.includes(cardId)) return
    const card = memoryDeck.find((item) => item.id === cardId)
    if (!card || matchedPairs.includes(card.pairId)) return

    setAttempts((value) => value + 1)
    if (memoryOpen.length === 0) {
      setMemoryOpen([cardId])
      setMemoryFeedback('Chọn thêm một thẻ để tìm cặp giống nhau.')
      return
    }

    const first = memoryDeck.find((item) => item.id === memoryOpen[0])
    if (first?.pairId === card.pairId) {
      setMatchedPairs((current) => [...current, card.pairId])
      setMemoryOpen([])
      setMemoryFeedback('Ghép đúng! Con thử tìm cặp tiếp theo nhé.')
    } else {
      setMemoryOpen([memoryOpen[0]!, cardId])
      setMemoryLocked(true)
      setMemoryFeedback('Hai thẻ chưa giống nhau. Ghi nhớ vị trí rồi thử tiếp nhé.')
      memoryTimer.current = window.setTimeout(() => {
        setMemoryOpen([])
        setMemoryLocked(false)
      }, 650)
    }
  }

  function spin() {
    setAttempts((value) => value + 1)
    setSpinning(true)
    spinTimer.current = window.setTimeout(() => {
      setWheelIndex((current) => nextWheelIndex(cards.length, current, Math.random()))
      setSpinning(false)
    }, 350)
  }

  function chooseCombine(groupIndex: number, option: string) {
    setAttempts((value) => value + 1)
    setCombineChoices((current) => ({ ...current, [groupIndex]: option }))
  }

  function chooseCompare(optionIndex: number) {
    const round = compareRounds[compareRoundIndex]
    if (!round || compareSolved) return
    setAttempts((value) => value + 1)
    if (optionIndex === round.answerIndex) {
      setCompareSolved(true)
      setCompareAnswers((current) => [...current, round.options[optionIndex]!])
      setCompareFeedback({ correct: true, text: round.feedback })
      return
    }
    setCompareFeedback({
      correct: false,
      text: 'Con đọc lại yêu cầu và đối chiếu từng chi tiết trước khi chọn lại nhé.',
    })
  }

  function nextCompareRound() {
    if (!compareSolved || compareRoundIndex >= compareRounds.length - 1) return
    setCompareRoundIndex((value) => value + 1)
    setCompareSolved(false)
    setCompareFeedback(null)
  }

  function choosePlacement(target: string) {
    if (!currentPlacement) return
    setAttempts((value) => value + 1)
    if (target === currentPlacement.target) {
      setPlacedTargets((current) => [...current, target])
      setPlacementFeedback({
        correct: true,
        text: `${currentPlacement.item} đã vào đúng vùng ${target}.`,
      })
      return
    }
    setPlacementFeedback({
      correct: false,
      text: `Vùng ${target} chưa hợp với ${currentPlacement.item}. Con thử một vùng khác nhé.`,
    })
  }

  function finish() {
    if (!complete) return
    const choices =
      type === 'combine'
        ? [
            ...combineGroups.map((group, index) =>
              `${group.label}: ${combineChoices[index]}`,
            ),
            reason!,
          ]
        : type === 'compare'
          ? compareAnswers
          : type === 'place'
            ? placements.map((entry) => `${entry.item} → ${entry.target}`)
          : type === 'spin' && wheelIndex !== null
        ? [cards[wheelIndex], reason!]
        : type === 'match'
          ? associationPairs.length >= 2
            ? associationPairs.flatMap((pair) => [pair.left, pair.right])
            : cards
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
      <div className="overflow-hidden rounded-3xl border-2 border-brand-100 bg-brand-50 shadow-clay">
        <div className="relative min-h-64 overflow-hidden bg-brand-100 sm:min-h-72">
          <img
            src={GAME_ASSETS.ideaIslandMap}
            alt="Bản đồ Đảo Ý tưởng với đường ba chặng dẫn đến xưởng sáng tạo"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute left-3 top-3 max-w-xs rounded-2xl bg-white/92 p-3 shadow-clay backdrop-blur-sm sm:left-4 sm:max-w-md">
            <p className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-warning">
              <Sparkles size={14} aria-hidden="true" /> Nhiệm vụ trên Đảo Ý tưởng
            </p>
            <p className="font-display mt-1 text-xl text-text">{adventure.title}</p>
            <p className="mt-1 text-sm font-bold text-text">{adventure.objective}</p>
            <p className="mt-1 text-xs font-semibold text-muted">{adventure.guideLine}</p>
          </div>
          <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/94 p-3 shadow-clay backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 text-xs font-extrabold text-text">
              <span className="flex items-center gap-1">
                <MapPin size={15} className="text-brand-500" /> {missionCompleted}/{missionTotal} chặng
              </span>
              <span className="flex items-center gap-1 text-warning">
                <Trophy size={15} /> {adventure.reward}
              </span>
            </div>

            {/* Stepper progress bar with integrated stop nodes */}
            <div className="relative mt-3 px-6 py-1" aria-label={`Tiến độ nhiệm vụ ${missionCompleted}/${missionTotal}`}>
              {/* Background track line */}
              <div className="absolute left-6 right-6 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-brand-100" />

              {/* Active filled progress line */}
              <div
                className="absolute left-6 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-brand-400 via-sky-400 to-mint-400 transition-all duration-500 motion-reduce:transition-none"
                style={{
                  width: missionTotal <= 1
                    ? (missionCompleted > 0 ? 'calc(100% - 3rem)' : '0%')
                    : `calc((100% - 3rem) * ${Math.min(1, Math.max(0, missionCompleted / (missionTotal - 1)))})`,
                }}
              />

              {/* Stop nodes aligned along the track */}
              <div className="relative h-8 w-full" aria-hidden="true">
                {Array.from({ length: Math.max(1, missionTotal) }, (_, i) => {
                  const isCompleted = i < missionCompleted
                  const isCurrent = i === missionCompleted && missionCompleted < missionTotal
                  const pct = missionTotal <= 1 ? 50 : (i / (missionTotal - 1)) * 100

                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300 motion-reduce:transition-none"
                      style={{ left: `${pct}%` }}
                    >
                      {isCompleted ? (
                        <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-mint-500 bg-mint-100 text-xs font-extrabold text-mint-700 shadow-sm">
                          ✦
                        </span>
                      ) : isCurrent ? (
                        <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-brand-500 text-xs font-black text-white shadow-clay ring-4 ring-brand-200/80">
                          {i + 1}
                        </span>
                      ) : (
                        <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-brand-200 bg-white text-xs font-bold text-brand-400 shadow-sm">
                          {i + 1}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-3xl border-2 border-sun-100 bg-sun-100/40 p-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-warning">
          Thử thách khám phá
        </p>
        <h2 id="game-heading" className="font-display mt-1 text-2xl">
          {type === 'detective'
            ? 'Thám tử tìm manh mối'
            : type === 'combine'
              ? 'Ghép một thế giới chưa từng có'
              : type === 'compare'
                ? 'Mô tả nào làm con nhìn thấy rõ hơn?'
                : type === 'place'
                  ? 'Đặt đúng mảnh lên bản đồ'
                : 'Chơi để hiểu bài'}
        </h2>
        <p className="mt-2 text-sm font-semibold leading-relaxed">{instruction}</p>
        {outcome && (
          <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-xs text-muted">
            Khi hoàn thành, con có thể: {outcome}
          </p>
        )}
      </div>

      {type === 'combine' ? (
        <div className="flex flex-col gap-3 sm:flex-row" aria-label="Cỗ máy ghép ba mảnh ý tưởng">
          {combineGroups.map((group, groupIndex) => (
            <fieldset key={group.label} className="combine-col">
              <legend className="combine-col-label px-1 pb-1">
                Mảnh {groupIndex + 1} · {group.label}
              </legend>
              <div className="mt-1 flex flex-col gap-1.5">
                {group.options.map((option) => {
                  const active = combineChoices[groupIndex] === option
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={active}
                      onClick={() => chooseCombine(groupIndex, option)}
                      className={cn(
                        'combine-option',
                        active && 'combine-option-selected',
                      )}
                    >
                      {active ? '✓ ' : ''}{option}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          ))}
          {combineComplete && (
            <p className="rounded-2xl bg-mint-100 p-3 text-sm font-bold text-mint-700 sm:col-span-3" role="status">
              ✨ Ý tưởng của con: {combineGroups.map((group, index) => combineChoices[index]).join(' · ')}
            </p>
          )}
        </div>
      ) : type === 'compare' && compareRound ? (
        <div className="rounded-3xl border-2 border-brand-100 bg-brand-50/50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-brand-600">
              Vòng {Math.min(compareRoundIndex + 1, compareRounds.length)}/{compareRounds.length}
            </p>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-muted">
              {compareAnswers.length} kính lúp đã sáng
            </span>
          </div>
          <p className="font-display mt-3 text-xl">{compareRound.prompt}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {compareRound.options.map((option, optionIndex) => (
              <button
                key={option}
                type="button"
                disabled={compareSolved}
                onClick={() => chooseCompare(optionIndex)}
                className={cn(
                  'min-h-24 rounded-2xl border-2 bg-white px-4 py-4 text-left font-bold leading-relaxed transition-colors disabled:cursor-default',
                  compareSolved && optionIndex === compareRound.answerIndex
                    ? 'border-mint-400 bg-mint-100 text-mint-700'
                    : 'border-border hover:border-brand-300',
                )}
              >
                <span className="mb-2 block text-xs font-extrabold uppercase text-brand-500">
                  Mô tả {String.fromCharCode(65 + optionIndex)}
                </span>
                {option}
              </button>
            ))}
          </div>
          {compareFeedback && (
            <div
              className={cn(
                'mt-3 rounded-2xl px-4 py-3 text-sm font-bold',
                compareFeedback.correct
                  ? 'bg-mint-100 text-mint-700'
                  : 'bg-sun-100 text-warning',
              )}
              role="status"
            >
              {compareFeedback.correct ? 'Đúng rồi! ' : 'Thử lại nhé. '}
              {compareFeedback.text}
            </div>
          )}
          {compareSolved && compareRoundIndex < compareRounds.length - 1 && (
            <Button className="mt-3" variant="secondary" onClick={nextCompareRound}>
              Sang câu đố tiếp theo
            </Button>
          )}
        </div>
      ) : type === 'place' ? (
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border-2 border-brand-100 bg-brand-50/60 p-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-brand-600">
              Mảnh đang cầm
            </p>
            <p className="font-display mt-2 text-2xl">
              {currentPlacement?.item ?? 'Bản đồ đã hoàn chỉnh'}
            </p>
            <ol className="mt-4 space-y-2" aria-label="Các mảnh đã đặt đúng">
              {placements.slice(0, placedTargets.length).map((entry) => (
                <li key={entry.item} className="flex items-center gap-2 rounded-2xl bg-mint-100 px-3 py-2 text-sm font-bold text-mint-700">
                  <CheckCircle2 size={17} aria-hidden="true" />
                  {entry.item} → {entry.target}
                </li>
              ))}
            </ol>
          </div>
          <div className="grid gap-2 sm:grid-cols-2" aria-label="Các vùng trên bản đồ">
            {[...new Set(placements.map((entry) => entry.target))].map((target) => {
              const used = placedTargets.includes(target)
              return (
                <button
                  key={target}
                  type="button"
                  disabled={used || placementComplete}
                  onClick={() => choosePlacement(target)}
                  className={cn(
                    'min-h-24 rounded-3xl border-2 px-4 py-3 text-center font-extrabold transition-colors',
                    used
                      ? 'border-mint-300 bg-mint-100 text-mint-700'
                      : 'border-brand-100 bg-white hover:border-brand-400 hover:bg-brand-50',
                  )}
                >
                  {used ? '✓ ' : ''}{target}
                </button>
              )
            })}
          </div>
          {placementFeedback && (
            <p className={cn('rounded-2xl px-4 py-3 text-sm font-bold lg:col-span-2', placementFeedback.correct ? 'bg-mint-100 text-mint-700' : 'bg-sun-100 text-warning')} role="status">
              {placementFeedback.text}
            </p>
          )}
        </div>
      ) : type === 'spin' ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-brand-50 p-5 text-center">
          <div
            className={cn(
              'flex h-32 w-32 items-center justify-center rounded-full border-8 border-white bg-brand-100 text-brand-600 shadow-clay motion-reduce:transition-none',
              spinning && 'rotate-180 transition-transform duration-300',
            )}
            aria-hidden="true"
          >
            <RotateCw size={48} strokeWidth={2.5} />
          </div>
          <Button variant="secondary" onClick={spin} disabled={spinning}>
            <RotateCw size={18} /> {spinning ? 'Đang quay…' : 'Quay thử thách'}
          </Button>
          {wheelIndex !== null && (
            <p className="rounded-2xl bg-white px-4 py-3 font-bold" role="status">
              {cards[wheelIndex]}
            </p>
          )}
        </div>
      ) : type === 'match' ? (
        <div>
          <p className="mb-3 text-sm font-bold text-muted">
            {associationPairs.length >= 2
              ? 'Lật hai thẻ mỗi lượt và tìm các ý có liên quan với nhau.'
              : 'Lật hai thẻ mỗi lượt và nhớ vị trí để tìm đủ các cặp.'}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Trò chơi ghi nhớ ghép cặp">
            {memoryDeck.map((card, index) => {
              const matched = matchedPairs.includes(card.pairId)
              const revealed = matched || memoryOpen.includes(card.id)
              return (
                <button
                  key={card.id}
                  type="button"
                  aria-pressed={revealed}
                  aria-label={revealed ? card.label : `Lật thẻ số ${index + 1}`}
                  disabled={matched || memoryLocked}
                  onClick={() => chooseMemory(card.id)}
                  className={cn(
                    'memory-card',
                    revealed && !matched && 'memory-card-open',
                    matched && 'memory-card-matched',
                  )}
                >
                  <div className="memory-card-inner">
                    {/* Back face (shown when face-down) */}
                    <div
                      className="memory-card-face"
                      style={{ background: 'linear-gradient(135deg, #ebe8ff 0%, #c8eeff 100%)' }}
                    >
                      <span className="text-3xl" aria-hidden>🌀</span>
                    </div>
                    {/* Front face (shown when flipped) */}
                    <div
                      className={cn(
                        'memory-card-back',
                        matched && 'bg-mint-100',
                      )}
                    >
                      {matched && (
                        <CheckCircle2 className="absolute top-2 right-2" size={16} style={{ color: 'var(--color-success)' }} />
                      )}
                      <span className="text-sm font-extrabold text-center leading-tight">{card.label}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          {memoryFeedback && (
            <p className="mt-3 text-sm font-bold text-muted" role="status">
              {memoryFeedback}
            </p>
          )}
        </div>
      ) : reorderGame ? (
        <div>
          <p className="mb-2 text-sm font-bold text-muted">Kéo thẻ để xếp lại câu chuyện. Nếu dùng bàn phím hoặc màn hình cảm ứng, dùng nút lên/xuống.</p>
          <ol className="flex flex-col gap-2" aria-label="Bảng kéo thả thứ tự câu chuyện">
            {dragBoard.map((label, index) => (
              <li
                key={label}
                draggable
                onDragStart={() => setDraggingLabel(label)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => dropCard(label)}
                className={cn(
                  'drag-item',
                  draggingLabel === label && 'opacity-60 scale-[1.03]',
                  dragComplete && 'drag-item-correct',
                )}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-extrabold text-brand-700" aria-hidden>{index + 1}</span>
                <span className="min-w-0 flex-1 font-bold">{label}</span>
                <div className="flex shrink-0 gap-1 ml-auto">
                  <button type="button" onClick={() => moveCard(label, -1)} disabled={index === 0} className="min-h-9 min-w-9 rounded-xl border border-border bg-white text-xs font-extrabold disabled:opacity-40 hover:bg-brand-50" aria-label={`Đưa ${label} lên`}>↑</button>
                  <button type="button" onClick={() => moveCard(label, 1)} disabled={index === dragBoard.length - 1} className="min-h-9 min-w-9 rounded-xl border border-border bg-white text-xs font-extrabold disabled:opacity-40 hover:bg-brand-50" aria-label={`Đưa ${label} xuống`}>↓</button>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs font-semibold text-muted" role="status">{dragComplete ? '✅ Đúng thứ tự rồi! Con có thể hoàn thành thử thách.' : 'Xếp từ phần mở đầu đến phần kết thúc.'}</p>
        </div>
      ) : isOrder ? (
        <div>
          <p className="mb-2 text-sm font-bold text-muted">
            Chọn từng thẻ theo thứ tự hợp lý trong nhiệm vụ.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {orderBoard.map((label) => {
              const done = cards.indexOf(label) < orderStep
              return (
                <button
                  key={label}
                  type="button"
                  className={cn(
                    'game-card text-left',
                    done && 'game-card-correct',
                  )}
                  disabled={done || complete}
                  onClick={() => chooseOrder(label)}
                >
                  <span className="flex items-center gap-2 text-sm font-bold">
                    {done ? (
                      <CheckCircle2 size={18} className="text-success flex-shrink-0" aria-hidden />
                    ) : (
                      <Circle size={18} className="text-muted flex-shrink-0" aria-hidden />
                    )}
                    {label}
                  </span>
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
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-muted">
            {type === 'detective' && <Search size={17} />}
            {type === 'detective' ? 'Tìm hai manh mối quan trọng nhất!' : 'Chọn hai ý đúng nhất.'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((label, index) => (
              <button
                key={label}
                type="button"
                className={cn(
                  'game-card text-left',
                  selected.includes(label) && 'game-card-selected',
                )}
                onClick={() => toggleChoice(label)}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={cn(
                      'inline-grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-sm font-extrabold',
                      selected.includes(label)
                        ? 'bg-brand-500 text-white'
                        : 'bg-brand-100 text-brand-700'
                    )}
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold leading-snug">{label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {type !== 'match' && type !== 'compare' && type !== 'place' && !isOrder && (type !== 'spin' || wheelIndex !== null) && (
        <fieldset className="rounded-2xl border-2 border-mint-100 bg-mint-100/30 p-3">
          <legend className="px-2 text-sm font-extrabold">Con đã dùng cách nào?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {PLAY_LENSES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setReason(item)}
                aria-pressed={reason === item}
                className={cn(
                  'min-h-11 rounded-xl border-2 px-3 text-sm font-bold',
                  reason === item
                    ? 'border-mint-400 bg-white'
                    : 'border-transparent bg-white/70',
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-brand-50 border border-brand-100 px-3 py-2">
        <div className="flex items-center gap-1.5">
          {/* Progress pips */}
          {[...Array(Math.min(attempts + 1, 4))].map((_, i) => (
            <span
              key={i}
              className={cn('game-progress-pip', i < attempts && 'game-progress-pip-done')}
            />
          ))}
        </div>
        <p className="text-xs font-semibold text-muted" aria-live="polite">
          {complete ? '🎉 Xuất sắc! Sẵn sàng sang xưởng!' : 'Cần thêm một bước nữa.'}
        </p>
        <span className="shrink-0 text-xs font-bold text-brand-500">{attempts} lượt</span>
      </div>

      <Button onClick={finish} disabled={!complete}>
        <CheckCircle2 size={18} /> Hoàn thành thử thách
      </Button>
    </section>
  )
}
