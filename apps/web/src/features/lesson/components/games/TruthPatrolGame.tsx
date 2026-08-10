import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Crosshair, RotateCcw } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import {
  gameSpeedMultiplier,
  missionProgress,
  sanitizePatrolWaves,
  type PatrolTarget,
} from '@/features/lesson/lib/curriculum-game'
import { cn } from '@/shared/lib/cn'
import { EngineGameShell } from './EngineGameShell'
import { PRAISE_MESSAGES, WRONG_MESSAGES, pickRandom } from './FeedbackOverlay'
import type { EngineGameProps } from './types'

type TargetResult = {
  id: string
  correct: boolean
  evidence: string
}

export function TruthPatrolGame({
  config,
  definition,
  difficulty,
  instruction,
  outcome,
  onComplete,
  onBack,
  onHint,
}: EngineGameProps) {
  const waves = useMemo(
    () => sanitizePatrolWaves(config?.patrolWaves),
    [config?.patrolWaves],
  )
  const [waveIndex, setWaveIndex] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [running, setRunning] = useState(true)
  const [playerX, setPlayerX] = useState(50)
  const [results, setResults] = useState<TargetResult[]>([])
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [status, setStatus] = useState('')
  const [beam, setBeam] = useState<{ x: number; y: number } | null>(null)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const handled = useRef(new Set<string>())
  const beamTimer = useRef<number | null>(null)
  const wave = waves[Math.min(waveIndex, Math.max(0, waves.length - 1))]
  const speedMultiplier = gameSpeedMultiplier(difficulty)
  const waveComplete = Boolean(wave) && handled.current.size === wave.targets.length
  const allComplete = waveComplete && waveIndex === waves.length - 1

  useEffect(() => {
    if (wave) setStatus(wave.mission)
  }, [wave])

  useEffect(() => {
    if (!running || !wave || waveComplete) return
    const timer = window.setInterval(() => {
      setElapsedMs((current) => current + 50)
    }, 50)
    return () => window.clearInterval(timer)
  }, [running, wave, waveComplete])

  useEffect(
    () => () => {
      if (beamTimer.current !== null) window.clearTimeout(beamTimer.current)
    },
    [],
  )

  const targetY = (target: PatrolTarget) =>
    ((elapsedMs - target.spawnAtMs) / 1000) *
      target.speed *
      speedMultiplier -
    12

  const visibleTargets = wave?.targets.filter((target) => {
    const y = targetY(target)
    return !handled.current.has(target.id) && y >= -14 && y <= 82
  }) ?? []

  useEffect(() => {
    if (!wave || !running) return
    wave.targets.forEach((target) => {
      if (handled.current.has(target.id) || targetY(target) < 78) return
      resolveTarget(target, false)
    })
  })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        event.preventDefault()
        move(-8)
      }
      if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        event.preventDefault()
        move(8)
      }
      if (event.code === 'Space') {
        event.preventDefault()
        fire()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  useEffect(() => {
    if (!waveComplete || !wave) return
    setRunning(false)
    setStatus(wave.completionFeedback)
  }, [wave, waveComplete])

  function move(amount: number) {
    if (!running || waveComplete) return
    setPlayerX((current) => Math.min(92, Math.max(8, current + amount)))
  }

  function resolveTarget(target: PatrolTarget, scanned: boolean) {
    if (handled.current.has(target.id)) return
    handled.current.add(target.id)
    const correct = target.decision === 'scan' ? scanned : !scanned
    const evidence = `${wave?.id}:${target.id}:${scanned ? 'scanned' : 'protected'}`
    setResults((current) => [...current, { id: target.id, correct, evidence }])
    const newAttempt = totalAttempts + 1
    setTotalAttempts(newAttempt)
    
    if (correct) {
      const nextStreak = streak + 1
      setStreak(nextStreak)
      setMaxStreak((current) => Math.max(current, nextStreak))
      setScore((current) => current + 25 + Math.min(10, nextStreak * 2))
      setStatus(target.feedback)
      
      const praise = pickRandom(PRAISE_MESSAGES, newAttempt)
      if (onHint) onHint({ text: praise.text, type: 'correct' })
    } else {
      setStreak(0)
      setStatus(target.feedback)
      
      const wrong = pickRandom(WRONG_MESSAGES, newAttempt)
      if (onHint) {
        onHint({ text: `${wrong.main} ${wrong.sub}\n💡 ${target.feedback}`, type: 'wrong' })
      }
    }
  }

  function fire(targetId?: string) {
    if (!running || waveComplete) return
    const selected = targetId
      ? visibleTargets.find((target) => target.id === targetId)
      : visibleTargets
          .filter((target) => Math.abs(target.column - playerX) <= 12)
          .sort((left, right) => targetY(right) - targetY(left))[0]
    if (!selected) {
      setStatus('Tia kiểm chứng chưa chạm thẻ nào. Di chuyển gần cột của thẻ rồi thử lại nhé.')
      return
    }
    const y = targetY(selected)
    setBeam({ x: selected.column, y })
    if (beamTimer.current !== null) window.clearTimeout(beamTimer.current)
    beamTimer.current = window.setTimeout(() => {
      setBeam(null)
      beamTimer.current = null
    }, 180)
    resolveTarget(selected, true)
  }

  function restartWave() {
    handled.current = new Set()
    setElapsedMs(0)
    setRunning(true)
    setPlayerX(50)
    setResults((current) =>
      current.filter((result) => !result.evidence.startsWith(`${wave?.id}:`)),
    )
    setStreak(0)
    setBeam(null)
    setStatus(wave?.mission ?? '')
  }

  function nextWave() {
    if (!waveComplete || waveIndex >= waves.length - 1) return
    handled.current = new Set()
    setWaveIndex((current) => current + 1)
    setElapsedMs(0)
    setRunning(true)
    setPlayerX(50)
    setBeam(null)
  }

  if (!wave) {
    return (
      <section className="rounded-[2rem] border-2 border-coral-200 bg-coral-50 p-6" role="alert">
        <h2 className="font-display text-2xl text-danger">Game chưa có dữ liệu đợt bay</h2>
        <p className="mt-2 font-bold text-muted">
          Giáo viên cần cấu hình patrolWaves trong bài học trước khi học sinh bắt đầu.
        </p>
        {onBack && <Button className="mt-4" variant="secondary" onClick={onBack}>Chọn game khác</Button>}
      </section>
    )
  }

  const totalTargets = waves.reduce((total, entry) => total + entry.targets.length, 0)
  const correctTargets = results.filter((result) => result.correct).length

  return (
    <>
    <EngineGameShell
      // WHY: definition guaranteed non-null for truth-patrol engine (CurriculumGame checks this)
      title={definition!.label}
      subtitle={instruction || definition!.description}
      scene={definition!.sceneUrl}
      sceneAlt={definition!.sceneAlt}
      score={score}
      progress={missionProgress(results.length, totalTargets)}
      status={status}
      onBack={onBack}
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border-4 border-brand-200 bg-brand-50 px-5 py-4 shadow-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-600">
              Đợt tín hiệu {waveIndex + 1} / {waves.length}
            </p>
            <h3 className="font-display text-2xl text-brand-950">{wave.title}</h3>
          </div>
          <p className="rounded-full bg-white px-5 py-3 text-sm font-black text-brand-800 shadow-sm border-2 border-brand-100">
            {correctTargets} quyết định đúng
          </p>
        </div>

        <div
          className="relative aspect-video min-h-[18rem] overflow-hidden rounded-[2rem] border-4 border-white bg-brand-950 shadow-soft"
          aria-label={`Bầu trời kiểm chứng: ${wave.backgroundAlt}`}
        >
          <img
            src={wave.backgroundUrl}
            alt=""
            width={1672}
            height={941}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-950/10" aria-hidden="true" />

          {visibleTargets.map((target) => {
            const y = targetY(target)
            return (
              <button
                key={target.id}
                type="button"
                onClick={() => {
                  setPlayerX(target.column)
                  fire(target.id)
                }}
                className={cn(
                  'absolute z-20 grid w-28 -translate-x-1/2 place-items-center rounded-[2rem] border-4 border-white bg-white p-3 text-center shadow-xl transition-all hover:scale-110 focus-visible:outline focus-visible:outline-4 focus-visible:outline-sun-400 sm:w-36',
                )}
                style={{
                  left: `${target.column}%`,
                  top: `${y}%`,
                }}
                aria-label={`Di chuyển và quét thẻ: ${target.label}`}
              >
                {target.imageUrl && (
                  <img
                    src={target.imageUrl}
                    alt=""
                    width={96}
                    height={72}
                    className="mb-1 h-14 w-full object-contain"
                  />
                )}
                <span className="text-xs font-extrabold leading-tight text-brand-950 sm:text-sm">
                  {target.label}
                </span>
              </button>
            )
          })}

          {beam && (
            <span
              className="absolute bottom-[13%] z-10 w-1 -translate-x-1/2 rounded-full bg-sun-200 shadow-[0_0_18px_rgba(255,238,122,0.9)]"
              style={{
                left: `${beam.x}%`,
                height: `${Math.max(8, 74 - beam.y)}%`,
              }}
              aria-hidden="true"
            />
          )}

          <div
            className="absolute bottom-[4%] z-30 w-20 -translate-x-1/2 transition-[left] duration-100 sm:w-24"
            style={{ left: `${playerX}%` }}
          >
            <img
              src={wave.playerSpriteUrl}
              alt="Phi thuyền kiểm chứng nguồn"
              width={512}
              height={470}
              className="max-h-24 w-full object-contain drop-shadow-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-[auto_auto_1fr_auto] sm:items-center">
          <button type="button" onClick={() => move(-8)} disabled={!running} className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-b-[6px] border-brand-300 bg-white flex items-center justify-center text-brand-700 shadow-md transition-all active:translate-y-1 active:border-b-4 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:translate-y-0 disabled:border-b-[6px]">
            <ArrowLeft size={32} aria-hidden="true" />
            <span className="sr-only">Trái</span>
          </button>
          <button type="button" onClick={() => move(8)} disabled={!running} className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-b-[6px] border-brand-300 bg-white flex items-center justify-center text-brand-700 shadow-md transition-all active:translate-y-1 active:border-b-4 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:translate-y-0 disabled:border-b-[6px]">
            <span className="sr-only">Phải</span>
            <ArrowRight size={32} aria-hidden="true" />
          </button>
          <p className="col-span-3 row-start-1 rounded-[2rem] bg-sun-50 px-4 py-3 text-sm font-bold text-amber-950 sm:col-span-1 sm:col-start-3 sm:row-auto text-center border-2 border-sun-100">
            Quét nội dung cần kiểm chứng; để dữ liệu có nguồn đáng tin bay qua an toàn.
          </p>
          <button type="button" onClick={() => fire()} disabled={!running || visibleTargets.length === 0} className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-b-[6px] border-coral-400 bg-coral-50 flex items-center justify-center text-danger shadow-md transition-all active:translate-y-1 active:border-b-4 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:translate-y-0 disabled:border-b-[6px]">
            <Crosshair size={32} aria-hidden="true" />
            <span className="sr-only">Quét</span>
          </button>
        </div>

        <Button variant="ghost" onClick={restartWave}>
          <RotateCcw size={18} aria-hidden="true" /> Chơi lại đợt này
        </Button>
        {waveComplete && !allComplete && (
          <Button onClick={nextWave}>Mở đợt tín hiệu tiếp theo</Button>
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
            Hoàn thành chuyến tuần tra
          </Button>
        )}
        {outcome && <p className="text-center text-xs font-bold text-muted">{outcome}</p>}
      </div>
    </EngineGameShell>
    </>
  )
}
