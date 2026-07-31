import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock3, Lightbulb, ShieldCheck, Swords } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import {
  DEFAULT_AI_VISUAL_ROUNDS,
  calculateBattleScore,
  deterministicShuffle,
  feedbackFor,
  missionProgress,
  sanitizeVisualRounds,
} from '@/features/lesson/lib/curriculum-game'
import { EngineGameShell } from './EngineGameShell'
import { FeedbackOverlay } from './FeedbackOverlay'
import type { EngineGameProps } from './types'

const IMAGE_POSITIONS = {
  'top-left': '0% 0%',
  'top-right': '100% 0%',
  'bottom-left': '0% 100%',
  'bottom-right': '100% 100%',
} as const

export function BattleMathGame({
  config,
  difficulty,
  instruction,
  outcome,
  onComplete,
  onBack,
}: EngineGameProps) {
  const configuredRounds = useMemo(
    () => sanitizeVisualRounds(config?.visualRounds),
    [config?.visualRounds],
  )
  const rounds = configuredRounds.length >= 2
    ? configuredRounds
    : [...DEFAULT_AI_VISUAL_ROUNDS]
  const roundSeconds = difficulty === 'gentle' ? null : difficulty === 'steady' ? 45 : 30
  const [roundIndex, setRoundIndex] = useState(0)
  const [seconds, setSeconds] = useState(roundSeconds)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [roundSolved, setRoundSolved] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [status, setStatus] = useState(
    'Đọc prompt như một thám tử: kiểm tra từng chi tiết rồi mới chọn ảnh.',
  )
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; attempt: number } | null>(null)
  const startedAt = useRef(Date.now())
  const round = rounds[Math.min(roundIndex, rounds.length - 1)]!
  const displayedOptions = useMemo(
    () => deterministicShuffle(round.options, `${round.id}-${difficulty}`),
    [difficulty, round],
  )
  const correctId = round.options[round.answerIndex]!.id
  const complete = roundIndex >= rounds.length

  useEffect(() => {
    if (!roundSeconds || roundSolved || complete) return
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current === null || current > 1) return current === null ? null : current - 1
        setHintLevel((level) => Math.max(1, level))
        setStatus('Đồng hồ nghỉ một nhịp thôi. Không mất lượt đâu — mở manh mối rồi kiểm tra tiếp nhé!')
        return roundSeconds
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [complete, roundSeconds, roundSolved, roundIndex])

  function choose(optionId: string) {
    if (roundSolved || complete) return
    setSelectedId(optionId)
    setAttempts((value) => value + 1)
    if (optionId !== correctId) {
      const nextHint = Math.min(2, hintLevel + 1)
      setHintLevel(nextHint)
      setStreak(0)
      setFeedback({ type: 'wrong', attempt: attempts })
      setStatus(
        `${feedbackFor('retry', attempts)} ${
          nextHint >= 2 ? round.clue : 'So lại đúng một chi tiết trong prompt trước nhé.'
        }`,
      )
      return
    }

    const elapsed = Math.min(30, Math.max(0, (Date.now() - startedAt.current) / 1000))
    const timeScore = roundSeconds ? calculateBattleScore(elapsed) : 6
    const nextStreak = streak + 1
    const earned = 20 + timeScore + Math.min(8, nextStreak * 2)
    setRoundSolved(true)
    setScore((value) => value + earned)
    setStreak(nextStreak)
    setMaxStreak((value) => Math.max(value, nextStreak))
    setAnswers((value) => [...value, `${round.id}:${optionId}`])
    setStatus(`${feedbackFor('correct', roundIndex)} ${round.feedback}`)
    setFeedback({ type: 'correct', attempt: attempts })
  }

  function nextRound() {
    const next = roundIndex + 1
    setRoundIndex(next)
    setSelectedId(null)
    setRoundSolved(false)
    setHintLevel(0)
    setSeconds(roundSeconds)
    startedAt.current = Date.now()
    if (next < rounds.length) {
      setStatus('Một lớp Sương Mù đã tan. Nhiệm vụ kiểm chứng tiếp theo tới rồi!')
    }
  }

  return (
    <>
      {feedback && (
        <FeedbackOverlay
          type={feedback.type}
          streak={streak}
          attempt={feedback.attempt}
          onDismiss={() => setFeedback(null)}
        />
      )}
    <EngineGameShell
      title="BattleMath · Pháo Đài Kiểm Chứng"
      subtitle={instruction || 'Đánh bại Sương Mù bằng cách phát hiện kết quả AI đúng, sai và giải thích vì sao.'}
      scene="/assets/game-engines/battle-valley.svg"
      sceneAlt="Pháo đài kiểm chứng AI trong màn đêm huyền bí"
      score={score}
      progress={missionProgress(Math.min(roundIndex + (roundSolved ? 1 : 0), rounds.length), rounds.length)}
      status={status}
      onBack={onBack}
    >
      {!complete ? (
        <div className="grid gap-5">
          <div className="grid gap-3 rounded-[1.75rem] border-2 border-amber-200 bg-[#fffaf0] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-amber-800">
                <ShieldCheck size={18} aria-hidden="true" />
                Cửa ải {roundIndex + 1} / {rounds.length}
              </p>
              <h3 className="mt-2 font-display text-xl leading-snug text-brand-950 sm:text-2xl">
                {round.prompt}
              </h3>
            </div>
            {seconds !== null && (
              <span className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand-950 px-4 font-display text-xl text-white">
                <Clock3 size={20} aria-hidden="true" /> {seconds}s
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Bốn ảnh AI để kiểm chứng">
            {displayedOptions.map((option, index) => {
              const selected = selectedId === option.id
              const correct = roundSolved && option.id === correctId
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => choose(option.id)}
                  disabled={roundSolved}
                  aria-label={`Ảnh ${index + 1}: ${option.label}`}
                  className={cn(
                    'group overflow-hidden rounded-[1.5rem] border-4 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-clay focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand-300',
                    selected && !roundSolved && option.id !== correctId
                      ? 'border-coral-400'
                      : 'border-white',
                    correct && 'border-mint-500',
                  )}
                >
                  <span
                    className="block aspect-square bg-cover"
                    style={{
                      backgroundImage: `url("${option.imageUrl}")`,
                      backgroundSize: '200% 200%',
                      backgroundPosition: IMAGE_POSITIONS[option.imagePosition],
                    }}
                    aria-hidden="true"
                  />
                  <span className="block min-h-14 p-3 text-center text-sm font-extrabold text-brand-900">
                    Ảnh {index + 1}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <button
              type="button"
              onClick={() => {
                setHintLevel((level) => Math.min(2, level + 1))
                setStatus(hintLevel >= 1 ? round.clue : 'Tách prompt thành bốn phần nhỏ rồi kiểm tra từng phần nhé.')
              }}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-sun-200 bg-sun-50 px-4 font-extrabold text-amber-900"
            >
              <Lightbulb size={19} aria-hidden="true" />
              {hintLevel >= 1 ? 'Manh mối rõ hơn' : 'Xin một manh mối'}
            </button>
            {roundSolved && (
              <Button onClick={nextRound}>
                <Swords size={19} aria-hidden="true" />
                {roundIndex + 1 === rounds.length ? 'Mở cổng pháo đài' : 'Sang cửa ải tiếp'}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="mx-auto grid max-w-2xl gap-5 rounded-[2rem] border-2 border-mint-200 bg-mint-50 p-6 text-center">
          <span className="text-6xl" aria-hidden="true">🔎</span>
          <div>
            <h3 className="font-display text-3xl text-brand-950">Sương Mù tan rồi!</h3>
            <p className="mt-2 font-bold text-muted">
              Con đã biết kiểm tra số lượng, màu sắc và cả chi tiết vô lý. Nhớ nhé: ảnh đẹp chưa chắc đã đúng.
            </p>
          </div>
          {outcome && <p className="text-sm font-bold text-brand-800">{outcome}</p>}
          <Button
            onClick={() =>
              onComplete({
                choices: answers,
                attempts: Math.max(1, attempts),
                score,
                maxStreak,
              })
            }
          >
            Nhận huy hiệu Mắt Kiểm Chứng
          </Button>
        </div>
      )}
    </EngineGameShell>
    </>
  )
}
