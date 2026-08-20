import { useState, useEffect, useMemo } from 'react'
import {
  X,
  Sparkles,
  BookOpen,
  Lightbulb,
  Gamepad2,
  HelpCircle,
  Star,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Trophy,
  PartyPopper,
  Zap,
  Play,
  Heart,
} from 'lucide-react'
import {
  type AsmoLmsLesson,
  type AsmoLmsProgressState,
  saveLmsLessonCompletion,
  ASMO_LMS_STAGES,
} from '../data/asmo-curriculum-lms'
import { AsmoFormula } from './AsmoFormula'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { renderClockSvg, renderBalanceScaleSvg, renderMatchstickFigureSvg } from './AsmoDiagramEngine'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

type StepTab = 1 | 2 | 3 | 4

type Props = {
  lesson: AsmoLmsLesson | null
  isOpen: boolean
  onClose: () => void
  onCompleteLesson: (lessonId: string, stars: number, xp: number) => void
  onNextLesson?: (nextLesson: AsmoLmsLesson) => void
}

export function AsmoInteractiveLessonModal({
  lesson,
  isOpen,
  onClose,
  onCompleteLesson,
  onNextLesson,
}: Props) {
  const [activeStep, setActiveStep] = useState<StepTab>(1)

  // Interactive Visualizer state (Step 1 & 3)
  const [applesA, setApplesA] = useState(4)
  const [applesB, setApplesB] = useState(3)
  const [poppedBalloons, setPoppedBalloons] = useState<number[]>([1, 2])
  const [pairedMake10, setPairedMake10] = useState<number[][]>([])
  const [selectedMake10, setSelectedMake10] = useState<number[]>([])
  const [cakeRows, setCakeRows] = useState(3)
  const [cakeCols, setCakeCols] = useState(4)
  const [clockHour, setClockHour] = useState(8)
  const [clockMinute, setClockMinute] = useState(15)
  const [pizzaSlices, setPizzaSlices] = useState(8)
  const [pizzaShaded, setPizzaShaded] = useState(3)
  const [candyTotal, setCandyTotal] = useState(12)
  const [candyPlates, setCandyPlates] = useState(3)
  const [columnCarryOnes, setColumnCarryOnes] = useState(8)
  const [columnCarryTens, setColumnCarryTens] = useState(3)

  // Step 3 Hands-on practice state
  const [practiceCompleted, setPracticeCompleted] = useState(false)
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null)

  // Step 4 Quiz state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [earnedStars, setEarnedStars] = useState(0)
  const [isQuizCorrect, setIsQuizCorrect] = useState(false)

  // Reset state when lesson changes
  useEffect(() => {
    if (lesson) {
      setActiveStep(1)
      setSelectedOptionId(null)
      setQuizSubmitted(false)
      setAttempts(0)
      setEarnedStars(0)
      setIsQuizCorrect(false)
      setPracticeCompleted(false)
      setPracticeFeedback(null)

      // Initialize visualizer specific states
      if (lesson.visualType === 'apple_drop') {
        setApplesA(4)
        setApplesB(3)
      } else if (lesson.visualType === 'balloon_pop') {
        setPoppedBalloons([1, 2])
      } else if (lesson.visualType === 'cake_tray') {
        setCakeRows(3)
        setCakeCols(4)
      } else if (lesson.visualType === 'analog_clock') {
        setClockHour(8)
        setClockMinute(15)
      } else if (lesson.visualType === 'pizza_fraction') {
        setPizzaSlices(8)
        setPizzaShaded(3)
      } else if (lesson.visualType === 'candy_division') {
        setCandyTotal(12)
        setCandyPlates(3)
      }
    }
  }, [lesson])

  if (!isOpen || !lesson) return null

  // Find next lesson
  const allLessons = ASMO_LMS_STAGES.flatMap((s) => s.lessons)
  const currentIdx = allLessons.findIndex((l) => l.id === lesson.id)
  const nextLesson = currentIdx >= 0 && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null

  // ── STEP 3 PRACTICE HANDLERS ──
  const handleVerifyPractice = () => {
    setPracticeCompleted(true)
    setPracticeFeedback(lesson.interactivePractice.successFeedback)
  }

  // ── STEP 4 QUIZ HANDLERS ──
  const handleSelectOption = (optId: string) => {
    if (quizSubmitted && isQuizCorrect) return
    setSelectedOptionId(optId)
  }

  const handleSubmitQuiz = () => {
    if (!selectedOptionId) return
    setQuizSubmitted(true)
    const newAttempts = attempts + 1
    setAttempts(newAttempts)

    const selectedOpt = lesson.quiz.options.find((o) => o.id === selectedOptionId)
    const correct = selectedOpt?.isCorrect ?? false
    setIsQuizCorrect(correct)

    if (correct) {
      const stars = newAttempts === 1 ? 3 : newAttempts === 2 ? 2 : 1
      setEarnedStars(stars)
      saveLmsLessonCompletion(lesson.id, stars, lesson.xpReward)
      onCompleteLesson(lesson.id, stars, lesson.xpReward)
    }
  }

  const handleRetryQuiz = () => {
    setSelectedOptionId(null)
    setQuizSubmitted(false)
    setIsQuizCorrect(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border-2 border-indigo-500/40 shadow-2xl text-white overflow-hidden">
        {/* ── MODAL HEADER ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl select-none">{lesson.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-500/30 px-2 py-0.5 text-[10px] font-black text-indigo-300 border border-indigo-400/40">
                  Chặng {lesson.stageNumber} · Bài {lesson.lessonNumber}
                </span>
                <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1">
                  <Zap className="size-3 text-amber-400 fill-amber-400" />
                  +{lesson.xpReward} XP
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white leading-snug line-clamp-1">
                {lesson.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-9 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
            aria-label="Đóng bài học"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ── 4-STEP PEDAGOGICAL TABS NAV ── */}
        <div className="grid grid-cols-4 border-b border-white/10 bg-slate-950/40 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className={cn(
              'flex items-center justify-center gap-1.5 py-3 px-1 transition-all cursor-pointer border-b-2',
              activeStep === 1
                ? 'border-indigo-400 bg-indigo-950/60 text-indigo-200'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5',
            )}
          >
            <BookOpen className="size-3.5" />
            <span className="hidden sm:inline">1. Lý Thuyết Trực Quan</span>
            <span className="sm:hidden">1. Lý Thuyết</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className={cn(
              'flex items-center justify-center gap-1.5 py-3 px-1 transition-all cursor-pointer border-b-2',
              activeStep === 2
                ? 'border-amber-400 bg-amber-950/60 text-amber-200'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5',
            )}
          >
            <Lightbulb className="size-3.5" />
            <span className="hidden sm:inline">2. Bí Kíp Mèo Mee</span>
            <span className="sm:hidden">2. Bí Kíp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className={cn(
              'flex items-center justify-center gap-1.5 py-3 px-1 transition-all cursor-pointer border-b-2',
              activeStep === 3
                ? 'border-emerald-400 bg-emerald-950/60 text-emerald-200'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5',
            )}
          >
            <Gamepad2 className="size-3.5" />
            <span className="hidden sm:inline">3. Thực Hành Tương Tác</span>
            <span className="sm:hidden">3. Thực Hành</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep(4)}
            className={cn(
              'flex items-center justify-center gap-1.5 py-3 px-1 transition-all cursor-pointer border-b-2',
              activeStep === 4
                ? 'border-rose-400 bg-rose-950/60 text-rose-200'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5',
            )}
          >
            <HelpCircle className="size-3.5" />
            <span className="hidden sm:inline">4. Thử Thách Quiz</span>
            <span className="sm:hidden">4. Thử Thách</span>
          </button>
        </div>

        {/* ── MAIN SCROLLABLE CONTENT BODY ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ══════════════════════════════════════════════════════════════════
              GIAI ĐOẠN 1: 📖 LÝ THUYẾT TRỰC QUAN & MÔ PHỎNG TƯƠNG TÁC
          ══════════════════════════════════════════════════════════════════ */}
          {activeStep === 1 && (
            <div className="space-y-6">
              {/* Theory Header Card */}
              <div className="rounded-2xl bg-indigo-950/50 border border-indigo-500/40 p-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="size-4 text-amber-400" />
                  <span>Trọng Tâm Kiến Thức</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {lesson.theory.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {lesson.theory.summary}
                </p>
                {lesson.theory.formulaLatex && (
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-indigo-400/30 text-center font-mono text-amber-300 text-sm">
                    <AsmoFormula text={`$$${lesson.theory.formulaLatex}$$`} />
                  </div>
                )}
              </div>

              {/* Dynamic Interactive Pedagogical Visualizer for Lesson */}
              <div className="rounded-3xl bg-slate-950 border border-slate-700/80 p-5 flex flex-col items-center justify-center space-y-4 min-h-[260px] shadow-inner">
                {/* 1. Apple Drop */}
                {lesson.visualType === 'apple_drop' && (
                  <div className="w-full max-w-md space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-rose-950/40 border-2 border-rose-500/50 rounded-2xl p-3 flex flex-col items-center space-y-2">
                        <div className="flex items-center justify-between w-full text-xs font-bold text-rose-300">
                          <span>Giỏ Đỏ: {applesA} quả</span>
                          <button
                            type="button"
                            onClick={() => setApplesA((prev) => (prev < 10 ? prev + 1 : 1))}
                            className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                          >
                            +🍎
                          </button>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap min-h-12">
                          {Array.from({ length: applesA }).map((_, i) => (
                            <span key={`apple-a-${i}`} className="text-2xl animate-in zoom-in-50">🍎</span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl p-3 flex flex-col items-center space-y-2">
                        <div className="flex items-center justify-between w-full text-xs font-bold text-emerald-300">
                          <span>Giỏ Xanh: {applesB} quả</span>
                          <button
                            type="button"
                            onClick={() => setApplesB((prev) => (prev < 10 ? prev + 1 : 1))}
                            className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                          >
                            +🍏
                          </button>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap min-h-12">
                          {Array.from({ length: applesB }).map((_, i) => (
                            <span key={`apple-b-${i}`} className="text-2xl animate-in zoom-in-50">🍏</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-900/60 border border-indigo-400/40 rounded-2xl p-3 text-center">
                      <span className="font-mono font-extrabold text-amber-300 text-lg">
                        {applesA} (đỏ) + {applesB} (xanh) = {applesA + applesB} quả táo
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. Balloon Pop */}
                {lesson.visualType === 'balloon_pop' && (
                  <div className="w-full max-w-md space-y-3">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {Array.from({ length: 10 }).map((_, idx) => {
                        const id = idx + 1
                        const isPopped = poppedBalloons.includes(id)
                        return (
                          <button
                            key={`balloon-${id}`}
                            type="button"
                            onClick={() => {
                              if (isPopped) {
                                setPoppedBalloons(poppedBalloons.filter((b) => b !== id))
                              } else {
                                setPoppedBalloons([...poppedBalloons, id])
                              }
                            }}
                            className={cn(
                              'size-11 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border',
                              isPopped
                                ? 'bg-slate-800 border-slate-700 opacity-30 scale-90'
                                : 'bg-sky-600 hover:bg-sky-500 border-sky-400 text-white shadow-md',
                            )}
                          >
                            <span className="text-lg">{isPopped ? '💥' : '🎈'}</span>
                            <span className="text-[9px] font-bold">{id}</span>
                          </button>
                        )
                      })}
                    </div>
                    <div className="bg-sky-950/60 border border-sky-400/40 rounded-2xl p-3 text-center font-mono font-bold text-amber-300 text-base">
                      10 - {poppedBalloons.length} = {10 - poppedBalloons.length} (quả bóng còn lại)
                    </div>
                  </div>
                )}

                {/* 3. Cake Tray */}
                {lesson.visualType === 'cake_tray' && (
                  <div className="w-full max-w-md space-y-3">
                    <div className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-xl border border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span>Hàng:</span>
                        <button type="button" onClick={() => setCakeRows((r) => (r > 1 ? r - 1 : 5))} className="size-6 bg-white/10 rounded font-bold">-</button>
                        <span className="font-bold text-amber-300">{cakeRows}</span>
                        <button type="button" onClick={() => setCakeRows((r) => (r < 5 ? r + 1 : 1))} className="size-6 bg-white/10 rounded font-bold">+</button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>Cột:</span>
                        <button type="button" onClick={() => setCakeCols((c) => (c > 1 ? c - 1 : 6))} className="size-6 bg-white/10 rounded font-bold">-</button>
                        <span className="font-bold text-emerald-300">{cakeCols}</span>
                        <button type="button" onClick={() => setCakeCols((c) => (c < 6 ? c + 1 : 1))} className="size-6 bg-white/10 rounded font-bold">+</button>
                      </div>
                    </div>

                    <div
                      className="grid gap-2 justify-center"
                      style={{ gridTemplateColumns: `repeat(${cakeCols}, minmax(0, 1fr))` }}
                    >
                      {Array.from({ length: cakeRows }).map((_, r) =>
                        Array.from({ length: cakeCols }).map((_, c) => (
                          <div
                            key={`cake-${r}-${c}`}
                            className="size-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shadow-xs"
                          >
                            🍰
                          </div>
                        )),
                      )}
                    </div>

                    <div className="bg-amber-950/60 border border-amber-400/40 rounded-2xl p-2.5 text-center font-mono font-bold text-amber-300 text-sm">
                      {cakeRows} hàng × {cakeCols} cột = {cakeRows * cakeCols} chiếc bánh
                    </div>
                  </div>
                )}

                {/* 4. Pizza Fractions */}
                {(lesson.visualType === 'pizza_fraction' || lesson.visualType === 'compare_fractions' || lesson.visualType === 'fraction_add_sub') && (
                  <div className="w-full max-w-md space-y-3 flex flex-col items-center">
                    <div className="flex items-center gap-4 text-xs bg-white/5 p-2 rounded-xl border border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span>Tổng số phần (Mẫu số):</span>
                        <button type="button" onClick={() => setPizzaSlices((s) => (s === 4 ? 8 : s === 8 ? 6 : 4))} className="px-2 py-0.5 bg-white/10 rounded font-mono font-bold text-emerald-300">{pizzaSlices} lát ⟳</button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>Lấy (Tử số):</span>
                        <button type="button" onClick={() => setPizzaShaded((s) => (s < pizzaSlices ? s + 1 : 1))} className="px-2 py-0.5 bg-emerald-600 rounded font-mono font-bold text-white">+1 lát</button>
                      </div>
                    </div>

                    {/* SVG Pizza Pie */}
                    <svg viewBox="0 0 160 160" className="size-36 select-none drop-shadow-lg">
                      <circle cx="80" cy="80" r="70" fill="#f59e0b" stroke="#78350f" strokeWidth="4" />
                      {Array.from({ length: pizzaSlices }).map((_, i) => {
                        const startAngle = (i * 360) / pizzaSlices
                        const endAngle = ((i + 1) * 360) / pizzaSlices
                        const isShaded = i < pizzaShaded

                        const x1 = 80 + 66 * Math.cos(((startAngle - 90) * Math.PI) / 180)
                        const y1 = 80 + 66 * Math.sin(((startAngle - 90) * Math.PI) / 180)
                        const x2 = 80 + 66 * Math.cos(((endAngle - 90) * Math.PI) / 180)
                        const y2 = 80 + 66 * Math.sin(((endAngle - 90) * Math.PI) / 180)

                        const largeArc = endAngle - startAngle > 180 ? 1 : 0
                        const d = `M 80,80 L ${x1},${y1} A 66,66 0 ${largeArc},1 ${x2},${y2} Z`

                        return (
                          <path
                            key={`slice-${i}`}
                            d={d}
                            fill={isShaded ? '#ef4444' : '#fef3c7'}
                            stroke="#78350f"
                            strokeWidth="1.5"
                            className="transition-colors duration-200"
                          />
                        )
                      })}
                      <circle cx="80" cy="80" r="4" fill="#78350f" />
                    </svg>

                    <div className="bg-emerald-950/60 border border-emerald-400/40 rounded-2xl p-2.5 text-center font-mono font-bold text-emerald-300 text-base">
                      Phân số biểu thị: $\frac{`{${pizzaShaded}}`}{`{${pizzaSlices}}`}$ chiếc bánh pizza
                    </div>
                  </div>
                )}

                {/* 5. Analog Clock */}
                {(lesson.visualType === 'analog_clock' || lesson.visualType === 'elapsed_time') && (
                  <div className="w-full max-w-sm space-y-3 flex flex-col items-center">
                    <div className="flex items-center gap-3 text-xs bg-white/5 p-2 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setClockHour((h) => (h < 12 ? h + 1 : 1))}
                        className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 font-bold"
                      >
                        Chỉnh Giờ ({clockHour}h)
                      </button>
                      <button
                        type="button"
                        onClick={() => setClockMinute((m) => (m === 0 ? 15 : m === 15 ? 30 : m === 30 ? 45 : 0))}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold"
                      >
                        Chỉnh Phút ({clockMinute}p)
                      </button>
                    </div>

                    <div className="size-40 bg-white rounded-full p-1 shadow-md flex items-center justify-center">
                      {renderClockSvg(clockHour, clockMinute, { size: 150 })}
                    </div>

                    <div className="bg-sky-950/60 border border-sky-400/40 rounded-2xl p-2 text-center font-mono font-bold text-amber-300 text-sm">
                      Thời gian: {clockHour}:{clockMinute < 10 ? `0${clockMinute}` : clockMinute}
                    </div>
                  </div>
                )}

                {/* 6. Balance Scale */}
                {lesson.visualType === 'balance_scale' && (
                  <div className="w-full max-w-md">
                    {renderBalanceScaleSvg({
                      left: { emoji: '🍉', text: '1 Quả Dưa' },
                      right: { emoji: '🍎', text: '4 Quả Táo' },
                      tilt: 'equal',
                      label: 'Cân thăng bằng: 1 Dưa = 4 Táo',
                    })}
                  </div>
                )}

                {/* 7. Default 3D / Geometric fallback */}
                {lesson.visualType !== 'apple_drop' &&
                  lesson.visualType !== 'balloon_pop' &&
                  lesson.visualType !== 'cake_tray' &&
                  lesson.visualType !== 'pizza_fraction' &&
                  lesson.visualType !== 'compare_fractions' &&
                  lesson.visualType !== 'fraction_add_sub' &&
                  lesson.visualType !== 'analog_clock' &&
                  lesson.visualType !== 'elapsed_time' &&
                  lesson.visualType !== 'balance_scale' && (
                    <div className="text-center space-y-2">
                      <span className="text-5xl">{lesson.icon}</span>
                      <p className="text-xs text-indigo-200 font-medium">
                        {lesson.theory.visualHint || 'Quan sát mô hình trực quan chuẩn sư phạm ASMO'}
                      </p>
                    </div>
                  )}
              </div>

              {/* Key Takeaways */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                  🌟 Ghi Nhớ Nhanh:
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                  {lesson.theory.keyTakeaways.map((takeaway, idx) => (
                    <li key={`takeaway-${idx}`} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span><AsmoFormula text={takeaway} /></span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              GIAI ĐOẠN 2: 💡 BÍ KÍP MÈO MEE (STORY-DRIVEN ADVICE)
          ══════════════════════════════════════════════════════════════════ */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-amber-950/60 via-indigo-950/60 to-purple-950/60 rounded-3xl border-2 border-amber-500/40 p-5 sm:p-6 shadow-xl">
                <div className="shrink-0 flex flex-col items-center">
                  <AikidCatCharacter pose={lesson.meeTip.pose} className="size-28 sm:size-32 drop-shadow-md" />
                  <span className="text-xs font-black text-amber-300 mt-1 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                    Trợ Giảng AI Mèo Mee
                  </span>
                </div>

                <div className="space-y-3 text-center sm:text-left flex-1">
                  <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-3.5">
                    <span className="text-xs font-bold text-amber-200 block mb-1">🐱 Mèo Mee Kể Chuyện:</span>
                    <p className="text-sm sm:text-base font-extrabold text-amber-300 italic leading-snug">
                      &quot;{lesson.meeTip.quote}&quot;
                    </p>
                  </div>

                  <div className="bg-indigo-900/40 border border-indigo-400/30 rounded-2xl p-3.5 space-y-1">
                    <span className="text-xs font-bold text-indigo-300 block">💡 Câu Thần Chú Giải Nhanh:</span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                      <AsmoFormula text={lesson.meeTip.storyAdvice} />
                    </p>
                  </div>
                </div>
              </div>

              {/* Fast Tips List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 space-y-1">
                  <span className="font-extrabold text-indigo-300 flex items-center gap-1.5">
                    <span>⚡ Mẹo Nhẩm Nhanh:</span>
                  </span>
                  <p className="text-slate-300">
                    Luôn nhóm các số tạo thành 10 hoặc 100 trước khi cộng dồn.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 space-y-1">
                  <span className="font-extrabold text-rose-300 flex items-center gap-1.5">
                    <span>⚠️ Lỗi Thường Gặp:</span>
                  </span>
                  <p className="text-slate-300">
                    Quên cộng số nhớ ở hàng chục hoặc trừ nhầm thứ tự các số bị trừ.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              GIAI ĐOẠN 3: 🎮 THỰC HÀNH CẦM TAY CHỈ VIỆC
          ══════════════════════════════════════════════════════════════════ */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/40 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
                  <Gamepad2 className="size-4 text-emerald-400" />
                  <span>Nhiệm Vụ Thực Hành Cầm Tay Chỉ Việc</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-white">
                  {lesson.interactivePractice.instruction}
                </p>
              </div>

              {/* Hands-on Interactive Area */}
              <div className="rounded-3xl bg-slate-950 border border-emerald-500/30 p-6 flex flex-col items-center justify-center space-y-4">
                <span className="text-4xl animate-bounce">{lesson.icon}</span>
                <p className="text-xs text-slate-300 text-center max-w-md">
                  Hãy thao tác và bấm nút xác nhận bên dưới để Mèo Mee kiểm tra kết quả thực hành của con nhé!
                </p>

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleVerifyPractice}
                  className="gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md px-6 py-2.5 cursor-pointer"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Kiểm Tra Kết Quả Thực Hành</span>
                </Button>

                {practiceCompleted && practiceFeedback && (
                  <div className="w-full bg-emerald-900/60 border border-emerald-400/60 rounded-2xl p-3.5 text-center text-xs sm:text-sm font-bold text-emerald-200 animate-in zoom-in-50 space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-300">
                      <Sparkles className="size-4 text-amber-400" />
                      <span>{practiceFeedback}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              GIAI ĐOẠN 4: 📝 BÀI TẬP TRẮC NGHIỆM THỬ THÁCH (1-3 SAO + UNLOCK)
          ══════════════════════════════════════════════════════════════════ */}
          {activeStep === 4 && (
            <div className="space-y-6">
              {/* Question Card */}
              <div className="rounded-2xl bg-slate-950/80 border border-indigo-500/40 p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="size-4 text-rose-400" />
                    <span>{lesson.quiz.questionTitle}</span>
                  </span>
                  <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                    ⭐ 1–3 Sao + {lesson.xpReward} XP
                  </span>
                </div>

                <div className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  <AsmoFormula text={lesson.quiz.questionText} />
                </div>
              </div>

              {/* Options List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lesson.quiz.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id
                  const isCorrect = opt.isCorrect

                  let optClass = 'bg-white/5 border-white/15 text-slate-200 hover:bg-white/10 hover:border-indigo-400'
                  if (quizSubmitted) {
                    if (isCorrect) {
                      optClass = 'bg-emerald-950/90 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/50 shadow-md font-bold'
                    } else if (isSelected && !isCorrect) {
                      optClass = 'bg-rose-950/90 border-rose-400 text-rose-200 ring-2 ring-rose-400/50'
                    }
                  } else if (isSelected) {
                    optClass = 'bg-indigo-600/90 border-indigo-300 text-white ring-2 ring-indigo-400 shadow-md font-bold'
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      className={cn(
                        'flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] cursor-pointer',
                        optClass,
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={cn(
                            'size-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0',
                            isSelected
                              ? 'bg-white text-slate-950'
                              : 'bg-white/10 text-slate-300',
                          )}
                        >
                          {opt.label}
                        </span>
                        <span className="text-xs sm:text-sm font-medium leading-snug">
                          <AsmoFormula text={opt.text} />
                        </span>
                      </div>

                      {quizSubmitted && (
                        <div>
                          {isCorrect ? (
                            <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                          ) : isSelected ? (
                            <XCircle className="size-5 text-rose-400 shrink-0" />
                          ) : null}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Submit & Result Banner */}
              {!quizSubmitted ? (
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    disabled={!selectedOptionId}
                    onClick={handleSubmitQuiz}
                    className="gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-extrabold shadow-md px-6 py-2.5 disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Nộp Bài Trắc Nghiệm</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {isQuizCorrect ? (
                    <div className="rounded-3xl bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-slate-900 border-2 border-emerald-400 p-5 text-center space-y-3 shadow-xl">
                      <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Star
                            key={`star-${i}`}
                            className={cn(
                              'size-8 transition-all',
                              i < earnedStars
                                ? 'text-amber-400 fill-amber-400 drop-shadow-md animate-bounce'
                                : 'text-slate-600',
                            )}
                          />
                        ))}
                      </div>

                      <div>
                        <h4 className="text-base sm:text-lg font-black text-emerald-300">
                          🎉 CHÍNH XÁC XUẤT SẮC! BẠN ĐÃ ĐẠT {earnedStars} SAO!
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-200 mt-1">
                          {lesson.quiz.correctExplanation}
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2">
                        {nextLesson ? (
                          <Button
                            type="button"
                            variant="primary"
                            onClick={() => onNextLesson?.(nextLesson)}
                            className="gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold shadow-lg px-6 py-2.5 cursor-pointer"
                          >
                            <span>Học Tiếp Bài {nextLesson.lessonNumber}</span>
                            <ArrowRight className="size-4 text-slate-950" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="primary"
                            onClick={onClose}
                            className="gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-2.5"
                          >
                            <Trophy className="size-4" />
                            <span>Hoàn Thành Lộ Trình!</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl bg-rose-950/70 border-2 border-rose-500/60 p-5 text-center space-y-3">
                      <h4 className="text-base font-bold text-rose-300">
                        Chưa chính xác rồi! Hãy xem lại gợi ý của Mèo Mee và thử lại nhé!
                      </h4>
                      <p className="text-xs text-slate-300">
                        Bí kíp: Hãy quay lại tab 2 &quot;Bí Kíp Mèo Mee&quot; để nắm vững phương pháp giải!
                      </p>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleRetryQuiz}
                        className="gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2 border-white/20"
                      >
                        <RotateCcw className="size-4" />
                        <span>Thử Chọn Lại</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── MODAL FOOTER STEPPER NAV ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-slate-950/80 shrink-0">
          <button
            type="button"
            disabled={activeStep === 1}
            onClick={() => setActiveStep((s) => (s > 1 ? ((s - 1) as StepTab) : s))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>Quay lại</span>
          </button>

          <span className="text-xs font-extrabold text-indigo-300">
            Bước {activeStep} / 4
          </span>

          <button
            type="button"
            disabled={activeStep === 4}
            onClick={() => setActiveStep((s) => (s < 4 ? ((s + 1) as StepTab) : s))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-sm"
          >
            <span>Tiếp theo</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
