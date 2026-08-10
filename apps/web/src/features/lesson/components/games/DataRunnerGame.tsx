import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, RotateCcw, Space } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import {
  gameSpeedMultiplier,
  missionProgress,
  sanitizeRunnerLevels,
  type RunnerItem,
} from '@/features/lesson/lib/curriculum-game'
import { cn } from '@/shared/lib/cn'
import { EngineGameShell } from './EngineGameShell'
import { PRAISE_MESSAGES, WRONG_MESSAGES, pickRandom } from './FeedbackOverlay'
import type { EngineGameProps } from './types'

type ItemResult = {
  id: string
  correct: boolean
  evidence: string
}

export function DataRunnerGame({
  config,
  definition,
  difficulty,
  instruction,
  outcome,
  onComplete,
  onBack,
  onHint,
}: EngineGameProps) {
  const levels = useMemo(
    () => sanitizeRunnerLevels(config?.runnerLevels),
    [config?.runnerLevels],
  )
  const [levelIndex, setLevelIndex] = useState(0)
  const [trackProgress, setTrackProgress] = useState(0)
  const [running, setRunning] = useState(true)
  const [jumping, setJumping] = useState(false)
  const [results, setResults] = useState<ItemResult[]>([])
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [status, setStatus] = useState('')
  const [totalAttempts, setTotalAttempts] = useState(0)
  const processed = useRef(new Set<string>())
  const jumpTimer = useRef<number | null>(null)
  const level = levels[Math.min(levelIndex, Math.max(0, levels.length - 1))]
  const speed = 0.45 * gameSpeedMultiplier(difficulty)
  const levelComplete =
    Boolean(level) &&
    processed.current.size === level.items.length &&
    trackProgress >= 100
  const allComplete = levelComplete && levelIndex === levels.length - 1

  useEffect(() => {
    if (level) setStatus(level.mission)
  }, [level])

  useEffect(() => {
    if (!running || !level || levelComplete) return
    const timer = window.setInterval(() => {
      setTrackProgress((current) => Math.min(100, current + speed))
    }, 50)
    return () => window.clearInterval(timer)
  }, [level, levelComplete, running, speed])

  useEffect(
    () => () => {
      if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current)
    },
    [],
  )

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code !== 'Space' && event.code !== 'ArrowUp') return
      event.preventDefault()
      jump()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  useEffect(() => {
    if (!level || !running) return
    level.items.forEach((item) => {
      if (processed.current.has(item.id)) return
      const relativeX = 12 + item.at - trackProgress
      const collides =
        relativeX >= 10 &&
        relativeX <= 18 &&
        (item.lane === 'ground' ? !jumping : jumping)
      const passed = relativeX < 10
      if (!collides && !passed) return

      processed.current.add(item.id)
      const correct = item.decision === 'collect' ? collides : !collides
      const evidence = `${level.id}:${item.id}:${collides ? 'collected' : 'avoided'}`
      setResults((current) => [...current, { id: item.id, correct, evidence }])
      const newAttempt = totalAttempts + 1
      setTotalAttempts(newAttempt)
      
      if (correct) {
        const nextStreak = streak + 1
        setStreak(nextStreak)
        setMaxStreak((current) => Math.max(current, nextStreak))
        setScore((current) => current + 20 + Math.min(10, nextStreak * 2))
        setStatus(item.feedback)
        
        const praise = pickRandom(PRAISE_MESSAGES, newAttempt)
        if (onHint) onHint({ text: praise.text, type: 'correct' })
      } else {
        setStreak(0)
        setStatus(item.feedback)
        
        const wrong = pickRandom(WRONG_MESSAGES, newAttempt)
        if (onHint) {
          onHint({ text: `${wrong.main} ${wrong.sub}\n💡 ${item.feedback}`, type: 'wrong' })
        }
      }
    })
  }, [jumping, level, running, streak, trackProgress])

  useEffect(() => {
    if (!levelComplete || !level) return
    setRunning(false)
    setStatus(level.completionFeedback)
  }, [level, levelComplete])

  function jump() {
    if (!running || jumping || levelComplete) return
    setJumping(true)
    if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current)
    jumpTimer.current = window.setTimeout(() => {
      setJumping(false)
      jumpTimer.current = null
    }, difficulty === 'gentle' ? 820 : 680)
  }

  function restartLevel() {
    processed.current = new Set()
    setTrackProgress(0)
    setRunning(true)
    setJumping(false)
    setResults((current) =>
      current.filter((result) => !result.evidence.startsWith(`${level?.id}:`)),
    )
    setStreak(0)
    setStatus(level?.mission ?? '')
  }

  function nextLevel() {
    if (!levelComplete || levelIndex >= levels.length - 1) return
    processed.current = new Set()
    setLevelIndex((current) => current + 1)
    setTrackProgress(0)
    setRunning(true)
    setJumping(false)
  }

  if (!level) {
    return (
      <section className="rounded-[2rem] border-2 border-coral-200 bg-coral-50 p-6" role="alert">
        <h2 className="font-display text-2xl text-danger">Game chưa có dữ liệu màn chơi</h2>
        <p className="mt-2 font-bold text-muted">
          Giáo viên cần cấu hình runnerLevels trong bài học trước khi học sinh bắt đầu.
        </p>
        {onBack && <Button className="mt-4" variant="secondary" onClick={onBack}>Chọn game khác</Button>}
      </section>
    )
  }

  const totalItems = levels.reduce((total, entry) => total + entry.items.length, 0)
  const correctItems = results.filter((result) => result.correct).length
  const completedBefore = levels
    .slice(0, levelIndex)
    .reduce((total, entry) => total + entry.items.length, 0)
  const overallCompleted = completedBefore + Math.min(
    level.items.length,
    Math.round((trackProgress / 100) * level.items.length),
  )

  return (
    <>
    <EngineGameShell
      // WHY: definition guaranteed non-null for data-runner engine (CurriculumGame checks this)
      title={definition!.label}
      subtitle={instruction || definition!.description}
      scene={definition!.sceneUrl}
      sceneAlt={definition!.sceneAlt}
      score={score}
      progress={missionProgress(overallCompleted, totalItems)}
      status={status}
      onBack={onBack}
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border-[6px] border-brand-200 bg-brand-50/80 px-6 py-4 shadow-sm backdrop-blur-md">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-brand-600">
              Chặng {levelIndex + 1} / {levels.length}
            </p>
            <h3 className="font-display text-2xl text-brand-950">{level.title}</h3>
          </div>
          <p className="rounded-[2rem] border-2 border-b-[4px] border-brand-200 bg-white px-5 py-3 text-lg font-black text-brand-800 shadow-sm">
            {correctItems} quyết định đúng
          </p>
        </div>

        <div
          className="relative aspect-video min-h-[18rem] overflow-hidden rounded-[2.5rem] border-[8px] border-brand-300 border-b-[16px] bg-sky-100 shadow-clay"
          aria-label={`Đường chạy: ${level.backgroundAlt}`}
        >
          <img
            src={level.backgroundUrl}
            alt=""
            width={1672}
            height={941}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/25 via-transparent to-white/10" aria-hidden="true" />

          {level.items.map((item) => {
            const left = 12 + item.at - trackProgress
            const handled = processed.current.has(item.id)
            return (
              <article
                key={item.id}
                className={cn(
                  'absolute z-20 grid w-28 -translate-x-1/2 place-items-center rounded-[2rem] border-[4px] border-b-[6px] border-white bg-white/95 p-3 text-center shadow-clay transition-all',
                  item.lane === 'ground' ? 'bottom-[13%]' : 'bottom-[48%]',
                  handled && 'pointer-events-none opacity-0 scale-90 translate-y-4',
                )}
                style={{ left: `${left}%` }}
                aria-hidden={handled || left < -10 || left > 110}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt=""
                    width={96}
                    height={72}
                    className="mb-1 h-14 w-full object-contain"
                  />
                )}
                <p className="text-xs font-extrabold leading-tight text-brand-950 sm:text-sm">
                  {item.label}
                </p>
              </article>
            )
          })}

          <div
            className="absolute bottom-[12%] left-[12%] z-30 w-20 transition-transform duration-200 sm:w-24"
            style={{
              transform: jumping
                ? 'translate3d(-50%, -125%, 0) rotate(-5deg)'
                : 'translate3d(-50%, 0, 0)',
            }}
          >
            <img
              src={level.playerSpriteUrl}
              alt="Bạn đưa thư dữ liệu đang chạy"
              width={372}
              height={512}
              className="max-h-32 w-full object-contain drop-shadow-lg"
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 h-[13%] bg-brand-950/20" aria-hidden="true" />
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <p className="rounded-[2rem] border-4 border-dashed border-sun-300 bg-sun-50 px-5 py-4 text-base font-black text-amber-950 shadow-sm">
            Giữ dữ liệu tốt, nhảy qua dữ liệu nhiễu hoặc không được phép.
          </p>
          <button type="button" onClick={restartLevel} className="flex items-center justify-center gap-2 rounded-[2rem] border-2 border-b-[6px] border-brand-300 bg-brand-100 px-6 py-4 font-black text-brand-900 shadow-clay transition-all hover:-translate-y-1 hover:bg-brand-200 active:translate-y-1 active:border-b-2">
            <RotateCcw size={20} aria-hidden="true" /> Chơi lại
          </button>
          <button type="button" onClick={jump} disabled={!running || jumping || levelComplete} className="flex items-center justify-center gap-2 rounded-[2rem] border-2 border-b-[6px] border-sky-500 bg-sky-400 px-8 py-4 font-black text-white shadow-clay transition-all hover:-translate-y-1 hover:bg-sky-300 active:translate-y-1 active:border-b-2 disabled:opacity-50 text-xl">
            <Space size={24} aria-hidden="true" /> Nhảy
          </button>
        </div>

        {levelComplete && !allComplete && (
          <Button onClick={nextLevel}>
            Sang chặng tiếp theo <ArrowRight size={19} aria-hidden="true" />
          </Button>
        )}
        {allComplete && (
          <Button
            onClick={() =>
              onComplete({
                choices: results.map((result) => result.evidence),
                attempts: Math.max(1, results.length),
                score,
                maxStreak,
              })
            }
          >
            Hoàn thành chuyến giao dữ liệu
          </Button>
        )}
        {outcome && <p className="text-center text-xs font-bold text-muted">{outcome}</p>}
      </div>
    </EngineGameShell>
    </>
  )
}
