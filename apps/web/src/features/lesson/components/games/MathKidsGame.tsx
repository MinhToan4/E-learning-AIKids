import { useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles, Trophy } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { getGameTuning, missionProgress } from '@/features/lesson/lib/curriculum-game'
import { FeedbackOverlay } from './FeedbackOverlay'
import { EngineGameShell } from './EngineGameShell'
import type { EngineGameProps } from './types'

// ── Fallback 10 câu AI literacy cho trẻ 6–11 ─────────────────────────────
// WHY: Self-contained fallback đảm bảo game luôn chạy được mà không cần
// teacher cấu hình quizQuestions trong DB trước.
const FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'AI học từ đâu để nhận ra ảnh con mèo?',
    options: ['Xem rất nhiều ảnh mèo', 'Đọc sách về mèo', 'Nhờ người chỉ từng con', 'Tự đoán ngẫu nhiên'],
    answer: 0,
    why: 'AI học bằng cách xem rất nhiều ảnh — gọi là "học từ dữ liệu"!',
  },
  {
    id: 'q2',
    prompt: 'Khi AI nói sai, con nên làm gì để AI tốt hơn?',
    options: ['Tắt AI đi', 'Cho AI biết nó sai và giải thích', 'Bỏ qua luôn', 'Hỏi bạn bè'],
    answer: 1,
    why: 'Phản hồi đúng giúp AI học — con chính là thầy của AI đó!',
  },
  {
    id: 'q3',
    prompt: 'Cái nào KHÔNG phải AI?',
    options: ['Trợ lý giọng nói điện thoại', 'Máy lạnh thông thường', 'Chatbot trả lời câu hỏi', 'Xe tự lái'],
    answer: 1,
    why: 'Máy lạnh thường chỉ làm 1 việc cố định, không học được — không phải AI!',
  },
  {
    id: 'q4',
    prompt: 'Thông tin nào KHÔNG nên chia sẻ với AI chatbot?',
    options: ['Màu sắc yêu thích', 'Tên thú cưng tưởng tượng', 'Mật khẩu và địa chỉ nhà', 'Sách con thích'],
    answer: 2,
    why: 'Mật khẩu và địa chỉ là bí mật — không bao giờ chia sẻ nhé!',
  },
  {
    id: 'q5',
    prompt: 'Prompt là gì?',
    options: ['Tên một loại robot', 'Câu hỏi hoặc lệnh mình đưa cho AI', 'Màn hình máy tính', 'Loại pin đặc biệt'],
    answer: 1,
    why: 'Prompt là lệnh mình đưa cho AI — viết rõ thì AI hiểu và trả lời tốt hơn!',
  },
  {
    id: 'q6',
    prompt: 'Tại sao cần kiểm tra thông tin AI cung cấp?',
    options: ['AI nói quá nhanh', 'AI không bao giờ sai', 'AI đôi khi nhầm hoặc bịa ra', 'AI nói tiếng nước ngoài'],
    answer: 2,
    why: 'AI có thể tự tin nói sai — luôn đối chiếu với nguồn đáng tin nhé!',
  },
  {
    id: 'q7',
    prompt: 'AI có thể tạo ra ảnh chưa từng có thật không?',
    options: ['Không, chỉ copy ảnh có sẵn', 'Có, bằng cách học rồi tạo mới', 'Chỉ vẽ lại ảnh cũ', 'Cần người vẽ trước'],
    answer: 1,
    why: 'AI sinh ảnh học các mẫu hình và tạo ra ảnh hoàn toàn mới — kỳ diệu lắm!',
  },
  {
    id: 'q8',
    prompt: 'Điều gì giúp con trở thành người dùng AI thông minh?',
    options: [
      'Tin 100% vào AI',
      'Không dùng AI luôn cho lành',
      'Đặt câu hỏi rõ và kiểm tra lại',
      'Dùng AI càng nhiều càng tốt',
    ],
    answer: 2,
    why: 'Người dùng AI thông minh biết cách hỏi và không ngừng kiểm chứng!',
  },
  {
    id: 'q9',
    prompt: 'Dữ liệu thiên vị (lệch) ảnh hưởng tới AI thế nào?',
    options: ['AI thông minh hơn', 'Không ảnh hưởng gì', 'AI có thể đưa kết quả không công bằng', 'AI nhanh hơn'],
    answer: 2,
    why: 'Dữ liệu xấu → AI xấu. Dữ liệu tốt và đa dạng làm AI công bằng hơn!',
  },
  {
    id: 'q10',
    prompt: 'Ai chịu trách nhiệm về kết quả AI tạo ra?',
    options: ['Chỉ máy tính', 'Không ai cả', 'Chỉ internet', 'Người dùng và người tạo AI'],
    answer: 3,
    why: 'Con người tạo và dùng AI nên phải chịu trách nhiệm — AI chỉ là công cụ!',
  },
]

type QuizQuestion = {
  id: string
  prompt: string
  options: string[]
  answer: number
  why: string
}

// Đọc câu hỏi từ config DB, fallback built-in nếu không đủ 3 câu
function resolveQuestions(raw: unknown): QuizQuestion[] {
  if (!Array.isArray(raw) || raw.length < 3) return FALLBACK_QUESTIONS
  const parsed = raw
    .map((item: unknown): QuizQuestion | null => {
      if (!item || typeof item !== 'object') return null
      const r = item as Record<string, unknown>
      const id = typeof r.id === 'string' ? r.id : ''
      const prompt = typeof r.prompt === 'string' ? r.prompt : ''
      const options = Array.isArray(r.options)
        ? r.options.filter((o): o is string => typeof o === 'string')
        : []
      const answer = typeof r.answer === 'number' ? r.answer : 0
      const why = typeof r.why === 'string' ? r.why : 'Đáp án đúng đó!'
      if (!id || !prompt || options.length < 2 || answer >= options.length) return null
      return { id, prompt, options, answer, why }
    })
    .filter((q): q is QuizQuestion => q !== null)
  return parsed.length >= 3 ? parsed : FALLBACK_QUESTIONS
}

// Trạng thái animation bóng
type ShotState = 'idle' | 'shooting-goal' | 'shooting-miss' | 'done'

// OPTIONS_POSITIONS: 4 đáp án ở 4 góc sân (Violympic style)
const OPTION_LABELS = ['A', 'B', 'C', 'D']

export function MathKidsGame({
  config,
  difficulty,
  instruction,
  outcome,
  onComplete,
  onBack,
}: EngineGameProps) {
  const tuning = getGameTuning(difficulty)
  const allQuestions = useMemo(() => resolveQuestions(config?.quizQuestions), [config?.quizQuestions])
  // Lấy số câu theo độ khó (gentle=5, steady=7, challenge=10)
  const questions = useMemo(
    () => allQuestions.slice(0, Math.min(tuning.roundLimit, allQuestions.length)),
    [allQuestions, tuning.roundLimit],
  )

  const [qIndex, setQIndex] = useState(0)
  const [shot, setShot] = useState<ShotState>('idle')
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [showWhy, setShowWhy] = useState(false)
  const [score, setScore] = useState(0)
  const [goals, setGoals] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [choices, setChoices] = useState<string[]>([])
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; attempt: number } | null>(null)
  // Timer đếm ngược (gentle: không có, steady: 30s/câu, challenge: 20s)
  const timerSeconds = difficulty === 'gentle' ? null : difficulty === 'steady' ? 30 : 20
  const [secondsLeft, setSecondsLeft] = useState(timerSeconds)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const question = questions[Math.min(qIndex, questions.length - 1)]
  const complete = qIndex >= questions.length

  // Reset timer khi câu mới
  useEffect(() => {
    if (!timerSeconds || complete || shot !== 'idle') return
    setSecondsLeft(timerSeconds)
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null || s <= 1) {
          // Hết giờ → tự động chọn sai
          handleAnswer(-1)
          return timerSeconds
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [qIndex, shot, complete])

  function handleAnswer(optionIdx: number) {
    if (shot !== 'idle' || complete || !question) return
    if (timerRef.current) clearInterval(timerRef.current)

    const newAttempt = attempts + 1
    setAttempts(newAttempt)
    setSelectedIdx(optionIdx)
    setChoices((c) => [...c, question.options[optionIdx] ?? '(hết giờ)'])

    const correct = optionIdx === question.answer

    if (correct) {
      const newStreak = streak + 1
      setStreak(newStreak)
      setMaxStreak((m) => Math.max(m, newStreak))
      setScore((s) => s + 15 + Math.min(10, newStreak * 2))
      setGoals((g) => g + 1)
      setShot('shooting-goal')
      setFeedback({ type: 'correct', attempt: newAttempt })
    } else {
      setStreak(0)
      setShot('shooting-miss')
      setShowWhy(true)
      setFeedback({ type: 'wrong', attempt: newAttempt })
    }

    // WHY: delay đủ để animation hoàn thành (0.8s) + người chơi đọc kết quả (~0.6s)
    const delay = correct ? 1500 : 2500
    setTimeout(() => {
      setShot('idle')
      setSelectedIdx(null)
      setShowWhy(false)
      setQIndex((i) => i + 1)
    }, delay)
  }

  if (!question && !complete) {
    return (
      <div className="rounded-[2rem] border-2 border-coral-200 bg-coral-50 p-8 text-center">
        <p className="font-display text-xl text-danger">Không có câu hỏi nào!</p>
        {onBack && <Button className="mt-4" variant="secondary" onClick={onBack}>Quay lại</Button>}
      </div>
    )
  }
  const stars = goals >= questions.length * 0.8 ? 3 : goals >= questions.length * 0.5 ? 2 : 1

  // Tính góc bóng: goal → thẳng vào lưới, miss → lệch sang trái/phải
  const ballGoalStyle = shot === 'shooting-goal'
    ? '[animation:goal-ball-fly_0.8s_ease-in_forwards]'
    : shot === 'shooting-miss'
      ? '[animation:miss-ball-fly_0.8s_ease-in_forwards]'
      : ''

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
        title="AI Quiz · Khỉ Đá Bóng"
        subtitle={instruction || 'Trả lời đúng các câu hỏi trắc nghiệm để giúp Kiki sút bóng vào lưới.'}
        scene="/assets/game-engines/monkey-soccer.png"
        sceneAlt="Sân bóng với trái bóng và khung thành"
        score={score}
        progress={missionProgress(goals, questions.length)}
        onBack={onBack}
      >
        {complete ? (
          <div className="bg-white pb-6" aria-label="Kết quả Khỉ Đá Bóng">
            {/* Header kết quả */}
            <div className="bg-brand-950 p-8 text-center text-white">
              <p className="text-6xl">{stars === 3 ? '🏆' : stars === 2 ? '🥈' : '⭐'}</p>
              <h2 className="mt-3 font-display text-3xl font-black text-white">
                {goals >= questions.length * 0.8 ? 'Kiki vô địch!' : `Kiki ghi ${goals} bàn!`}
              </h2>
              <p className="mt-2 text-white/70">
                {stars === 3 ? '⭐⭐⭐' : stars === 2 ? '⭐⭐☆' : '⭐☆☆'}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-brand-100 text-center">
              {[
                { label: 'Bàn thắng', value: `${goals}/${questions.length}`, icon: '⚽' },
                { label: 'Điểm số', value: score, icon: '🌟' },
                { label: 'Chuỗi đỉnh', value: maxStreak, icon: '🔥' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="px-4 py-5">
                  <p className="text-2xl">{icon}</p>
                  <p className="font-display text-2xl font-black text-brand-900">{value}</p>
                  <p className="text-xs font-bold text-muted">{label}</p>
                </div>
              ))}
            </div>

            <div className="p-6 text-center">
              {outcome && <p className="mb-4 text-sm font-bold text-slate-700">{outcome}</p>}
              <Button
                onClick={() => onComplete({ choices, attempts, score, maxStreak })}
              >
                <Sparkles size={19} aria-hidden="true" />
                Nhận huy hiệu &amp; tiếp tục
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col bg-white" aria-labelledby="monkey-goal-title">
            {/* ── Sân bóng (Violympic style) ────────────────────────────────── */}
            <div
              className="relative flex min-h-[22rem] flex-col"
              style={{
                background: 'linear-gradient(180deg, #87ceeb 0%, #87ceeb 40%, #4ade80 40%, #16a34a 100%)',
              }}
              role="img"
              aria-label="Sân bóng đá của Kiki"
            >
              {/* HUD: Score + Timer */}
              <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
                {/* Score */}
                <div className="flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-1.5 text-sm font-black text-brand-900 shadow">
                  🌟 <span>{score}</span>
                </div>
                {/* Goals tracker */}
                <div className="flex gap-1 rounded-2xl bg-white/90 px-3 py-1.5 shadow">
                  {questions.map((_, i) => (
                    <span key={i} className="text-sm">{i < goals ? '⚽' : '○'}</span>
                  ))}
                </div>
              </div>

              {/* Timer */}
              {timerSeconds !== null && secondsLeft !== null && (
                <div
                  className={`absolute right-3 top-3 z-10 flex size-12 items-center justify-center rounded-full font-display text-xl font-black shadow ${
                    secondsLeft <= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/90 text-brand-900'
                  }`}
                  aria-label={`${secondsLeft} giây còn lại`}
                >
                  {secondsLeft}
                </div>
              )}

              {/* Câu hỏi — khung gỗ phong cách Violympic */}
              <div className="mx-4 mt-4">
                <div
                  className="rounded-xl border-4 border-amber-800 bg-amber-50 px-5 py-3 shadow-md"
                  style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.3)' }}
                >
                  <p id="monkey-goal-title" className="text-center text-base font-extrabold text-amber-900 sm:text-lg">
                    {question!.prompt}
                  </p>
                  {/* Số câu */}
                  <p className="mt-1 text-center text-xs font-bold text-amber-700">
                    Câu {qIndex + 1} / {questions.length}
                  </p>
                </div>
              </div>

              {/* Sân: khung thành + thủ môn + bóng ở giữa */}
              <div className="relative flex flex-1 items-center justify-center py-4">
                {/* Vạch sân */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/40" />

                {/* Khung thành */}
                <div className="relative" aria-hidden="true">
                  {/* Cột trái */}
                  <div className="absolute -left-[60px] bottom-0 h-[90px] w-3 rounded-t-lg bg-white shadow-md" />
                  {/* Xà ngang */}
                  <div className="absolute -left-[60px] h-3 w-[120px] rounded-lg bg-white shadow-md" style={{ top: '-90px' }} />
                  {/* Cột phải */}
                  <div className="absolute -right-[60px] bottom-0 h-[90px] w-3 rounded-t-lg bg-white shadow-md" />
                  {/* Lưới */}
                  <div
                    className="absolute -left-[57px] h-[76px] w-[114px] bg-white/20"
                    style={{ top: '-77px', backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, transparent 1px, transparent 12px), repeating-linear-gradient(90deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, transparent 1px, transparent 12px)' }}
                  />

                  {/* Thủ môn Kiki */}
                  <div
                    className={`relative z-10 select-none text-6xl text-center transition-all duration-300 ${
                      shot === 'shooting-goal' ? '[animation:monkey-celebrate_0.4s_ease-in-out_3]' : ''
                    } ${shot === 'shooting-miss' ? 'scale-90 opacity-80' : ''}`}
                    style={{ marginTop: '-70px' }}
                  >
                    {shot === 'shooting-goal' ? '🙈' : shot === 'shooting-miss' ? '🐒' : '🐒'}
                  </div>
                </div>

                {/* Bóng + điểm dừng (penalty spot) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2" aria-hidden="true">
                  {/* Điểm penalty */}
                  <div className="mx-auto mb-1 h-1.5 w-1.5 rounded-full bg-white/70" />
                  <div className={`select-none text-4xl ${ballGoalStyle}`}>⚽</div>
                </div>

                {/* Flash kết quả */}
                {shot === 'shooting-goal' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-[feedback-pop_0.25s_ease-out_forwards] rounded-2xl bg-emerald-500/90 px-6 py-3 text-2xl font-black text-white shadow-xl">
                      GOAL! 🎉
                    </div>
                  </div>
                )}
                {shot === 'shooting-miss' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-[feedback-shake_0.4s_ease-out] rounded-2xl bg-red-500/90 px-6 py-3 text-2xl font-black text-white shadow-xl">
                      Hụt rồi! 😅
                    </div>
                  </div>
                )}
              </div>

              {/* Hint sau khi sai */}
              {showWhy && question && (
                <div className="mx-4 mb-3 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm font-bold text-amber-900 shadow">
                  💡 {question.why}
                </div>
              )}
            </div>

            {/* ── 4 đáp án 2×2 — Violympic style ──────────────────────────────── */}
            <div
              className="grid grid-cols-2 gap-0 border-t-4 border-amber-800"
              role="group"
              aria-label="Chọn đáp án"
            >
              {question!.options.slice(0, 4).map((option, i) => {
                const isSelected = selectedIdx === i
                const isCorrectAnswer = i === question!.answer
                const showCorrect = showWhy && isCorrectAnswer
                const showWrong = showWhy && isSelected && !isCorrectAnswer

                return (
                  <button
                    key={i}
                    id={`monkey-opt-${i}`}
                    type="button"
                    disabled={shot !== 'idle'}
                    onClick={() => handleAnswer(i)}
                    className={[
                      'relative flex min-h-[4rem] items-center gap-3 border-b-2 border-r-2 border-amber-700 px-4 py-3 text-left font-extrabold transition',
                      // Violympic golden frame style
                      'bg-amber-50 text-amber-900',
                      // Border alternation for 2×2 grid (no right border on col 2)
                      i % 2 === 1 ? 'border-r-0' : '',
                      // Hover
                      shot === 'idle' ? 'hover:bg-amber-100 active:scale-95 cursor-pointer' : 'cursor-default',
                      // States
                      showCorrect ? 'bg-emerald-100 text-emerald-900' : '',
                      showWrong ? 'bg-red-100 text-red-900' : '',
                      isSelected && shot !== 'idle' && !showWhy ? 'bg-brand-100' : '',
                    ].filter(Boolean).join(' ')}
                    aria-pressed={isSelected}
                  >
                    {/* Label badge */}
                    <span
                      className={`inline-grid size-8 shrink-0 place-items-center rounded-full text-sm font-black ${
                        showCorrect
                          ? 'bg-emerald-500 text-white'
                          : showWrong
                            ? 'bg-red-500 text-white'
                            : 'bg-amber-800 text-amber-50'
                      }`}
                    >
                      {OPTION_LABELS[i]}
                    </span>
                    <span className="text-sm leading-snug sm:text-base">{option}</span>

                    {/* Icon kết quả */}
                    {showCorrect && <span className="ml-auto text-xl">✅</span>}
                    {showWrong && <span className="ml-auto text-xl">❌</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </EngineGameShell>
    </>
  )
}

