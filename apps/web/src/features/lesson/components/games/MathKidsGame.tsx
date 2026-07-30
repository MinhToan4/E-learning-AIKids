import { useMemo, useState } from 'react'
import { ArrowUp, Delete, Lightbulb, Sparkles } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import {
  createMathProblem,
  feedbackFor,
  getGameTuning,
  missionProgress,
  type MathOperator,
  type MathProblem,
} from '@/features/lesson/lib/curriculum-game'
import { cn } from '@/shared/lib/cn'
import { EngineGameShell } from './EngineGameShell'
import type { EngineGameProps } from './types'

const OPERATORS: Array<{ id: MathOperator; label: string }> = [
  { id: '+', label: 'Gộp dữ liệu' },
  { id: '-', label: 'Bỏ dữ liệu lỗi' },
  { id: '×', label: 'Các nhóm bằng nhau' },
  { id: '÷', label: 'Chia nhóm kiểm thử' },
]

function missionFor(problem: MathProblem): string {
  if (problem.operator === '+') {
    return `AI đã xem ${problem.left} ảnh con mèo, rồi được xem thêm ${problem.right} ảnh. AI có tất cả bao nhiêu ví dụ?`
  }
  if (problem.operator === '-') {
    return `Có ${problem.left} ảnh huấn luyện nhưng ${problem.right} ảnh bị mờ cần bỏ đi. Còn lại bao nhiêu ảnh tốt?`
  }
  if (problem.operator === '×') {
    return `${problem.left} nhóm dữ liệu, mỗi nhóm có ${problem.right} thẻ. Có tất cả bao nhiêu thẻ?`
  }
  return `${problem.left} thẻ dữ liệu được chia đều vào ${problem.right} giỏ kiểm thử. Mỗi giỏ có bao nhiêu thẻ?`
}

function hintFor(problem: MathProblem): string {
  if (problem.operator === '+') return `Bắt đầu từ ${problem.left}, rồi đếm thêm ${problem.right} bước.`
  if (problem.operator === '-') return `Dùng ${problem.left} ngón tưởng tượng rồi bớt đi ${problem.right}.`
  if (problem.operator === '×') return `Cộng số ${problem.right} lặp lại ${problem.left} lần nhé.`
  return `Tìm số mà ${problem.right} nhân với nó sẽ bằng ${problem.left}.`
}

export function MathKidsGame({
  difficulty,
  instruction,
  outcome,
  onComplete,
  onBack,
}: EngineGameProps) {
  const target = getGameTuning(difficulty).roundLimit
  const [operator, setOperator] = useState<MathOperator>('+')
  const [problem, setProblem] = useState(() => createMathProblem(difficulty, '+'))
  const [answer, setAnswer] = useState('')
  const [solved, setSolved] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const [showHint, setShowHint] = useState(false)
  const [status, setStatus] = useState(
    'Mỗi câu đúng giúp Khỉ Mơ mang một giỏ dữ liệu lên cao hơn. Không đúng thì Khỉ Mơ vẫn đứng yên chờ con nhé!',
  )
  const complete = solved >= target
  const keypad = useMemo(
    () => ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'],
    [],
  )

  function chooseOperator(next: MathOperator) {
    if (complete) return
    setOperator(next)
    setProblem(createMathProblem(difficulty, next))
    setAnswer('')
    setShowHint(false)
    setStatus(`Đổi nhiệm vụ: ${OPERATORS.find((item) => item.id === next)?.label}. Khỉ Mơ sẵn sàng rồi!`)
  }

  function submit() {
    if (answer.trim() === '' || complete) return
    setAttempts((value) => value + 1)
    if (Number(answer) !== problem.answer) {
      setStreak(0)
      setShowHint(true)
      setStatus(`${feedbackFor('retry', attempts)} ${hintFor(problem)}`)
      return
    }

    const nextSolved = solved + 1
    const nextStreak = streak + 1
    const earned = 12 + Math.min(8, nextStreak * 2)
    setSolved(nextSolved)
    setStreak(nextStreak)
    setMaxStreak((current) => Math.max(current, nextStreak))
    setScore((current) => current + earned)
    setHistory((current) => [
      ...current,
      `${problem.left} ${problem.operator} ${problem.right} = ${problem.answer}`,
    ])
    setAnswer('')
    setShowHint(false)
    if (nextSolved >= target) {
      setStatus('Tới ngọn cây rồi! Con vừa giúp AI có đủ dữ liệu tốt để học.')
      return
    }
    setProblem(createMathProblem(difficulty, operator))
    setStatus(`${feedbackFor('correct', nextSolved)} Khỉ Mơ leo thêm một tầng!`)
  }

  return (
    <EngineGameShell
      title="Math for Kids · Khỉ Leo Cây Dữ Liệu"
      subtitle={instruction || 'Giải các bài toán ngắn về dữ liệu để giúp Khỉ Mơ leo tới phòng học AI.'}
      scene="/assets/game-engines/ai-worlds.jpg"
      scenePosition="top-right"
      score={score}
      progress={missionProgress(solved, target)}
      status={status}
      onBack={onBack}
    >
      <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border-4 border-[#f4dfaa] bg-[#fff8df]">
          <div
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage: 'url("/assets/game-engines/ai-worlds.jpg")',
              backgroundSize: '200% 200%',
              backgroundPosition: '100% 0%',
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/75 via-transparent to-transparent" />
          <div className="absolute inset-x-4 bottom-4 grid gap-2">
            <div className="flex items-end justify-between gap-1" aria-label={`${solved} trên ${target} tầng đã leo`}>
              {Array.from({ length: target }, (_, index) => (
                <span
                  key={index}
                  className={cn(
                    'grid h-9 flex-1 place-items-center rounded-t-xl border-2 border-white/70 text-xs font-black shadow-sm',
                    index < solved ? 'bg-sun-300 text-brand-950' : 'bg-white/70 text-brand-700',
                  )}
                >
                  {index < solved ? '✓' : index + 1}
                </span>
              ))}
            </div>
            <p className="flex items-center justify-center gap-2 rounded-2xl bg-brand-950/80 px-3 py-2 text-center text-sm font-extrabold text-white backdrop-blur-sm">
              <ArrowUp size={17} aria-hidden="true" />
              Khỉ Mơ: tầng {Math.min(solved + 1, target)} / {target}
            </p>
          </div>
        </aside>

        <div className="grid content-start gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Chọn loại nhiệm vụ">
            {OPERATORS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseOperator(item.id)}
                className={cn(
                  'min-h-14 rounded-2xl border-2 px-2 font-extrabold transition',
                  operator === item.id
                    ? 'border-brand-600 bg-brand-600 text-white shadow-clay'
                    : 'border-brand-100 bg-white text-brand-800 hover:border-brand-300',
                )}
              >
                <span className="block font-display text-xl" aria-hidden="true">{item.id}</span>
                <span className="text-[0.68rem]">{item.label}</span>
              </button>
            ))}
          </div>

          <section className="rounded-[2rem] border-2 border-[#ead7a5] bg-[#fffaf0] p-5 text-center sm:p-7">
            <p className="mx-auto max-w-xl text-base font-extrabold leading-relaxed text-brand-950">
              {missionFor(problem)}
            </p>
            <div className="my-4 font-display text-5xl text-brand-900 sm:text-6xl" aria-live="polite">
              {problem.left} {problem.operator} {problem.right} = ?
            </div>
            {showHint && (
              <p className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-sun-50 p-3 text-sm font-bold text-amber-900">
                <Lightbulb size={18} aria-hidden="true" /> {hintFor(problem)}
              </p>
            )}
            <label className="sr-only" htmlFor="math-kids-answer">Đáp án</label>
            <input
              id="math-kids-answer"
              value={answer}
              inputMode="numeric"
              onChange={(event) => setAnswer(event.target.value.replace(/[^0-9-]/g, '').slice(0, 6))}
              onKeyDown={(event) => { if (event.key === 'Enter') submit() }}
              disabled={complete}
              className="mx-auto h-20 w-full max-w-xs rounded-3xl border-4 border-white bg-white text-center font-display text-4xl text-brand-800 shadow-soft outline-none focus:border-brand-300"
              placeholder="?"
            />
          </section>

          {!complete ? (
            <>
              <div className="mx-auto grid w-full max-w-sm grid-cols-5 gap-2">
                {keypad.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAnswer((current) => `${current}${key}`.slice(0, 6))}
                    className="min-h-14 rounded-2xl border-2 border-brand-100 bg-white font-display text-2xl text-text shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300"
                  >
                    {key}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAnswer((current) => current.slice(0, -1))}
                  className="col-span-2 grid min-h-12 place-items-center rounded-2xl border-2 border-coral-100 bg-coral-50 text-danger"
                  aria-label="Xóa một số"
                >
                  <Delete aria-hidden="true" />
                </button>
                <Button className="col-span-3" onClick={submit} disabled={!answer}>
                  Kiểm tra & leo cây
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={() =>
                onComplete({
                  choices: history,
                  attempts: Math.max(1, attempts),
                  score,
                  maxStreak,
                })
              }
            >
              <Sparkles size={19} aria-hidden="true" /> Nhận huy hiệu Người Giữ Dữ Liệu
            </Button>
          )}

          {outcome && <p className="text-center text-xs font-bold text-muted">{outcome}</p>}
        </div>
      </div>
    </EngineGameShell>
  )
}
