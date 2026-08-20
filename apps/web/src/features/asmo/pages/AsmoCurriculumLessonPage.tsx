import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import {
  BookOpen,
  Lightbulb,
  Gamepad2,
  Trophy,
  Star,
  Check,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Zap,
  HelpCircle,
  Map,
  Play,
  Award,
  MessageCircle,
} from 'lucide-react'
import {
  ASMO_LMS_STAGES,
  type AsmoLmsLesson,
  type AsmoLmsStage,
  type AsmoLmsProgressState,
  getLmsProgress,
  saveLmsLessonCompletion,
  isLessonUnlocked,
} from '../data/asmo-curriculum-lms'
import { AsmoFormula } from '../components/AsmoFormula'
import { renderClockSvg, renderBalanceScaleSvg, renderMatchstickFigureSvg } from '../components/AsmoDiagramEngine'
import { AikidCatCharacter, type AikidCatPose } from '@/shared/components/ui/AikidCatCharacter'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

export type AsmoLessonPhase = 'explore' | 'tips' | 'practice' | 'quiz' | 'done'

export const ASMO_LESSON_PHASES = [
  {
    id: 'explore' as const,
    label: 'Khám phá Khái niệm',
    description: 'Quan sát & Nhận diện',
    icon: BookOpen,
    badge: 'Bước 1',
  },
  {
    id: 'tips' as const,
    label: 'Mẹo Mèo Mee & Bí kíp',
    description: 'Bí kíp tính nhanh',
    icon: Lightbulb,
    badge: 'Bước 2',
  },
  {
    id: 'practice' as const,
    label: 'Thực hành Thao tác',
    description: 'Thao tác trực quan',
    icon: Gamepad2,
    badge: 'Bước 3',
  },
  {
    id: 'quiz' as const,
    label: 'Thử tài Olympic',
    description: 'Chinh phục 3 Sao',
    icon: Trophy,
    badge: 'Bước 4',
  },
]

const PHASE_ORDER: AsmoLessonPhase[] = ['explore', 'tips', 'practice', 'quiz', 'done']

export function AsmoCurriculumLessonPage() {
  const { lessonId = '' } = useParams()
  const navigate = useNavigate()

  // ── Find Lesson & Stage ──
  const lessonData = useMemo(() => {
    for (const stage of ASMO_LMS_STAGES) {
      const idx = stage.lessons.findIndex((l) => l.id === lessonId)
      if (idx !== -1) {
        const lesson = stage.lessons[idx]
        const prevLesson = idx > 0 ? stage.lessons[idx - 1] : null

        // Find next lesson across stages
        const allLessons = ASMO_LMS_STAGES.flatMap((s) => s.lessons)
        const globalIdx = allLessons.findIndex((l) => l.id === lessonId)
        const nextLesson = globalIdx !== -1 && globalIdx < allLessons.length - 1 ? allLessons[globalIdx + 1] : null

        return { lesson, stage, prevLesson, nextLesson }
      }
    }
    return null
  }, [lessonId])

  const lesson = lessonData?.lesson
  const stage = lessonData?.stage
  const nextLesson = lessonData?.nextLesson

  // ── Global & Local State ──
  const [progress, setProgress] = useState<AsmoLmsProgressState>(getLmsProgress())
  const [phase, setPhase] = useState<AsmoLessonPhase>('explore')
  const [maxUnlockedPhase, setMaxUnlockedPhase] = useState<AsmoLessonPhase>('explore')
  const [showHint, setShowHint] = useState(false)
  const [starBurst, setStarBurst] = useState<{ id: number; count: number } | null>(null)

  // ── Phase 1 & 3: Interactive Visualizer State ──
  const [applesA, setApplesA] = useState(4)
  const [applesB, setApplesB] = useState(3)
  const [poppedBalloons, setPoppedBalloons] = useState<number[]>([1, 2])
  const [cakeRows, setCakeRows] = useState(3)
  const [cakeCols, setCakeCols] = useState(4)
  const [clockHour, setClockHour] = useState(8)
  const [clockMinute, setClockMinute] = useState(15)
  const [pizzaSlices, setPizzaSlices] = useState(8)
  const [pizzaShaded, setPizzaShaded] = useState(3)
  const [candyTotal, setCandyTotal] = useState(12)
  const [candyPlates, setCandyPlates] = useState(3)
  const [tableBase, setTableBase] = useState(3)
  const [tableMultiplier, setTableMultiplier] = useState(4)
  const [scaleLeft, setScaleLeft] = useState(4)
  const [scaleRight, setScaleRight] = useState(4)
  const [activeMake10Pairs, setActiveMake10Pairs] = useState<number[]>([1, 9])
  const [cubeCount, setCubeCount] = useState(8)

  // ── Phase 3: Hands-on Practice State ──
  const [practiceCompleted, setPracticeCompleted] = useState(false)
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null)

  // ── Phase 4: Quiz State ──
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [earnedStars, setEarnedStars] = useState(0)
  const [isQuizCorrect, setIsQuizCorrect] = useState(false)
  const [showCelebrationModal, setShowCelebrationModal] = useState(false)

  // ── Sync progress on mount & lesson change ──
  useEffect(() => {
    const p = getLmsProgress()
    setProgress(p)

    if (lesson) {
      setPhase('explore')
      setMaxUnlockedPhase('explore')
      setShowHint(false)
      setSelectedOptionId(null)
      setQuizSubmitted(false)
      setAttempts(0)
      setEarnedStars(p.lessons[lesson.id]?.stars || 0)
      setIsQuizCorrect(p.lessons[lesson.id]?.completed || false)
      setPracticeCompleted(false)
      setPracticeFeedback(null)
      setShowCelebrationModal(false)

      // Initialize visualizer specific defaults
      if (lesson.visualType === 'apple_drop') {
        setApplesA(4)
        setApplesB(3)
      } else if (lesson.visualType === 'balloon_pop') {
        setPoppedBalloons([1, 2])
      } else if (lesson.visualType === 'cake_tray') {
        setCakeRows(3)
        setCakeCols(4)
      } else if (lesson.visualType === 'analog_clock' || lesson.visualType === 'elapsed_time') {
        setClockHour(8)
        setClockMinute(15)
      } else if (lesson.visualType === 'pizza_fraction' || lesson.visualType === 'compare_fractions' || lesson.visualType === 'fraction_add_sub') {
        setPizzaSlices(8)
        setPizzaShaded(3)
      } else if (lesson.visualType === 'candy_division' || lesson.visualType === 'div_remainder') {
        setCandyTotal(12)
        setCandyPlates(3)
      } else if (lesson.visualType === 'times_table_25') {
        setTableBase(3)
        setTableMultiplier(4)
      } else if (lesson.visualType === 'times_table_69') {
        setTableBase(7)
        setTableMultiplier(6)
      }
    }
  }, [lesson])

  // Track max unlocked phase
  useEffect(() => {
    setMaxUnlockedPhase((prev) => {
      const prevIdx = PHASE_ORDER.indexOf(prev)
      const currentIdx = PHASE_ORDER.indexOf(phase === 'done' ? 'quiz' : phase)
      return currentIdx > prevIdx ? (PHASE_ORDER[currentIdx] as AsmoLessonPhase) : prev
    })
  }, [phase])

  // ── Existing saved lesson stars ──
  const liveStars = useMemo(() => {
    if (earnedStars > 0) return earnedStars
    if (lesson && progress.lessons[lesson.id]?.stars) {
      return progress.lessons[lesson.id].stars
    }
    return 0
  }, [earnedStars, lesson, progress])

  // ── Step Navigation Handlers ──
  const advanceToPhase = (nextPhase: AsmoLessonPhase) => {
    setPhase(nextPhase)
    setShowHint(false)
  }

  // ── Step 3: Verify Practice ──
  const handleVerifyPractice = () => {
    if (!lesson) return
    setPracticeCompleted(true)
    setPracticeFeedback(lesson.interactivePractice.successFeedback)
    setMaxUnlockedPhase('quiz')
  }

  // ── Step 4: Quiz Options & Submit ──
  const handleSelectOption = (optId: string) => {
    if (quizSubmitted && isQuizCorrect) return
    setSelectedOptionId(optId)
  }

  const handleSubmitQuiz = () => {
    if (!lesson || !selectedOptionId) return
    setQuizSubmitted(true)
    const newAttempts = attempts + 1
    setAttempts(newAttempts)

    const selectedOpt = lesson.quiz.options.find((o) => o.id === selectedOptionId)
    const correct = selectedOpt?.isCorrect ?? false
    setIsQuizCorrect(correct)

    if (correct) {
      const calculatedStars = newAttempts === 1 ? 3 : newAttempts === 2 ? 2 : 1
      setEarnedStars(calculatedStars)
      setStarBurst({ id: Date.now(), count: calculatedStars })

      // Save to LMS storage
      const updated = saveLmsLessonCompletion(lesson.id, calculatedStars, lesson.xpReward)
      setProgress(updated)
      setShowCelebrationModal(true)
    }
  }

  const handleRetryQuiz = () => {
    setSelectedOptionId(null)
    setQuizSubmitted(false)
    setIsQuizCorrect(false)
  }

  // ── Dynamic Cat Pose & Guide Copy ──
  const dynamicGuideCopy = useMemo(() => {
    if (!lesson) {
      return {
        eyebrow: 'Trợ Giảng Mee',
        title: 'Chào mừng bé!',
        body: 'Cùng bắt đầu bài học nhé!',
        pose: 'welcome' as AikidCatPose,
      }
    }

    if (phase === 'explore') {
      return {
        eyebrow: 'Khám phá Khái niệm',
        title: 'Mee kể con nghe',
        body: lesson.theory.summary,
        pose: 'guide' as AikidCatPose,
      }
    }

    if (phase === 'tips') {
      return {
        eyebrow: 'Mẹo Mèo Mee & Bí kíp',
        title: 'Bí kíp tính nhanh ✨',
        body: lesson.meeTip.quote,
        pose: lesson.meeTip.pose,
      }
    }

    if (phase === 'practice') {
      return {
        eyebrow: 'Thực hành Thao tác',
        title: 'Thử tay nghề ngay!',
        body: lesson.interactivePractice.instruction,
        pose: 'thinking' as AikidCatPose,
      }
    }

    if (phase === 'quiz') {
      if (quizSubmitted && isQuizCorrect) {
        return {
          eyebrow: 'Xuất sắc!',
          title: 'Con làm đúng rồi! 🎉',
          body: lesson.quiz.correctExplanation,
          pose: 'celebrate' as AikidCatPose,
        }
      }
      if (quizSubmitted && !isQuizCorrect) {
        return {
          eyebrow: 'Chưa đúng',
          title: 'Cùng thử lại nhé!',
          body: 'Đọc kỹ lại câu hỏi và tham khảo Mẹo Mèo Mee ở Bước 2 nhé.',
          pose: 'support' as AikidCatPose,
        }
      }
      return {
        eyebrow: 'Thử tài Olympic',
        title: 'Chinh phục 3 Sao ⭐',
        body: 'Đọc kỹ câu hỏi và chọn đáp án chính xác nhất để nhận 3 Sao và XP!',
        pose: 'thinking' as AikidCatPose,
      }
    }

    return {
      eyebrow: 'Hoàn thành bài học',
      title: 'Tuyệt vời!',
      body: 'Bé đã hoàn thành xuất sắc bài học này!',
      pose: 'celebrate' as AikidCatPose,
    }
  }, [lesson, phase, quizSubmitted, isQuizCorrect])

  // ── Missing Lesson Fallback ──
  if (!lesson || !stage) {
    return (
      <div className="mx-auto w-full max-w-3xl page-enter p-6 space-y-4">
        <div className="rounded-3xl border border-coral-200 bg-white p-8 shadow-clay text-center space-y-4">
          <div className="size-16 rounded-full bg-coral-50 text-coral-600 flex items-center justify-center mx-auto text-3xl">
            🔍
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-800">
            Không tìm thấy bài học ASMO
          </h1>
          <p className="text-sm font-semibold text-slate-500">
            Mã bài học <code className="text-brand-600 font-mono font-bold">{lessonId}</code> không tồn tại hoặc đã được cập nhật.
          </p>
          <div className="pt-2">
            <Link to="/asmo/curriculum">
              <Button variant="primary" className="gap-2">
                <Map className="size-4" />
                <span>Quay về Bản Đồ 5 Vùng Đảo</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter flex h-dvh flex-col gap-4 overflow-hidden p-2 sm:p-4 lg:flex-row bg-[#f8fafc] text-text font-body">
      {/* ══════════════════════════════════════════════════════════════════════
          LEFT COLUMN: 70% MAIN STAGE & LESSON WORKSPACE
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
        {/* ── 1. HEADER CARD ── */}
        <div className="ui-card p-4 sm:p-5 shrink-0 bg-white rounded-3xl border border-brand-100 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {/* Badge Tím TRẠM X */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="rounded-xl bg-purple-100 border border-purple-300 px-3 py-1 text-xs font-black text-purple-800 uppercase tracking-wider">
                  TRẠM {lesson.lessonNumber}: <AsmoFormula text={lesson.title} />
                </span>
                <span className="rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-800 flex items-center gap-1">
                  <Zap className="size-3.5 text-amber-500 fill-amber-500" />
                  +{lesson.xpReward} XP
                </span>
                <span className="rounded-xl bg-sky-50 border border-sky-200 px-2.5 py-1 text-xs font-bold text-sky-800">
                  Chặng {stage.stageNumber}: {stage.title.split(':')[1] || stage.title}
                </span>
              </div>

              {/* Tiêu đề to rõ ràng */}
              <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
                <AsmoFormula text={lesson.title} />
              </h1>

              {/* Dòng phụ: Sản phẩm của trạm */}
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">
                Sản phẩm của trạm: <strong className="text-slate-800 font-bold"><AsmoFormula text={lesson.subtitle} /></strong>
              </p>
            </div>

            {/* Thẻ Sao của trạm: Sao của trạm ⭐⭐⭐ ở góc phải */}
            <div
              className="lesson-star-rack shrink-0 flex items-center gap-1.5 bg-amber-50/80 border-2 border-amber-200 rounded-2xl px-3.5 py-2 shadow-xs"
              aria-label={`Sao của trạm: ${liveStars} sao đã nhận`}
            >
              <span className="text-xs font-extrabold text-amber-800 mr-1 hidden sm:inline">
                Sao của trạm
              </span>
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  size={24}
                  className={cn(
                    'transition-all duration-300',
                    starIdx <= liveStars
                      ? 'text-amber-400 fill-amber-400 drop-shadow-sm scale-110'
                      : 'text-slate-300 fill-slate-200',
                  )}
                  aria-hidden="true"
                />
              ))}

              {/* Star fly animation burst */}
              {starBurst &&
                Array.from({ length: starBurst.count }, (_, index) => (
                  <span
                    key={`${starBurst.id}-${index}`}
                    className="lesson-star-fly"
                    aria-hidden="true"
                  >
                    ⭐
                  </span>
                ))}
            </div>
          </div>

          {/* ── 2. THANH 4 TAB PHASE (PILL TABS TOÁN HỌC & OLYMPIC) ── */}
          <nav
            className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t-2 border-slate-100 w-full"
            aria-label="Các giai đoạn bài học"
          >
            {ASMO_LESSON_PHASES.map((p, idx) => {
              const maxIdx = PHASE_ORDER.indexOf(maxUnlockedPhase === 'done' ? 'quiz' : maxUnlockedPhase)
              const currentIdx = PHASE_ORDER.indexOf(phase === 'done' ? 'quiz' : phase)
              const isUnlocked = idx <= Math.max(maxIdx, 0) || progress.lessons[lesson.id]?.completed
              const isActive = p.id === (phase === 'done' ? 'quiz' : phase)

              return (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`${p.label}: ${p.description}`}
                  title={`${p.label} · ${p.description}`}
                  onClick={() => {
                    setPhase(p.id)
                    setShowHint(false)
                  }}
                  className={cn(
                    'flex min-h-11 items-center gap-2 px-3.5 py-2 rounded-2xl border-2 text-xs sm:text-sm font-bold transition-all cursor-pointer select-none',
                    isActive
                      ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-clay scale-[1.02]'
                      : isUnlocked
                        ? 'bg-white border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-slate-50'
                        : 'bg-slate-100 border-transparent text-slate-400 opacity-80 cursor-pointer',
                  )}
                >
                  <p.icon className={cn('size-4 shrink-0', isActive ? 'text-brand-600' : 'text-slate-500')} />
                  <span className="text-left leading-tight">
                    <span className="block">{p.label}</span>
                    <span className="hidden text-[10px] font-bold opacity-75 lg:block text-slate-500">
                      {p.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* ── 3. KHU VỰC NỘI DUNG CHÍNH (LEFT SCROLLABLE MAIN STAGE - 70%) ── */}
        <main className="lesson-stage-main min-h-0 flex-1 relative overflow-y-auto hidden-scrollbar pb-6 pr-1 space-y-4">
          {/* ══════════════════════════════════════════════════════════════════
              PHASE 1: 📖 KHÁM PHÁ KHÁI NIỆM (QUAN SÁT & NHẬN DIỆN)
          ══════════════════════════════════════════════════════════════════ */}
          {phase === 'explore' && (
            <div className="rounded-3xl border border-slate-200 shadow-clay bg-white p-5 sm:p-7 space-y-6 animate-fade-up">
              {/* Theory Summary Header Card */}
              <div className="rounded-2xl bg-gradient-to-r from-brand-50 via-white to-sky-50 border border-brand-200 p-5 space-y-2.5">
                <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="size-4 text-amber-500" />
                  <span>Trọng Tâm Kiến Thức Bài Học</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  <AsmoFormula text={lesson.theory.title} />
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                  <AsmoFormula text={lesson.theory.summary} />
                </p>
                {lesson.theory.formulaLatex && (
                  <div className="p-3 rounded-2xl bg-white border border-brand-200 text-center font-mono text-brand-800 text-sm sm:text-base shadow-2xs font-bold">
                    <AsmoFormula text={`$$${lesson.theory.formulaLatex}$$`} />
                  </div>
                )}
              </div>

              {/* Dynamic Interactive Pedagogical Visualizer for Lesson */}
              <div className="rounded-3xl bg-slate-50 border-2 border-slate-200 p-5 sm:p-6 flex flex-col items-center justify-center space-y-4 min-h-[280px]">
                {/* 1. Apple Drop Visualizer */}
                {lesson.visualType === 'apple_drop' && (
                  <div className="w-full max-w-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 flex flex-col items-center space-y-3">
                        <div className="flex items-center justify-between w-full text-xs font-black text-rose-800">
                          <span>Giỏ Đỏ: {applesA} quả</span>
                          <button
                            type="button"
                            onClick={() => setApplesA((prev) => (prev < 10 ? prev + 1 : 1))}
                            className="px-2.5 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-xs transition-all cursor-pointer"
                          >
                            +🍎 Thêm
                          </button>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap min-h-14 p-2 bg-white/80 rounded-xl w-full border border-rose-100">
                          {Array.from({ length: applesA }).map((_, i) => (
                            <span key={`apple-a-${i}`} className="text-2xl animate-in zoom-in-50 select-none">
                              🍎
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex flex-col items-center space-y-3">
                        <div className="flex items-center justify-between w-full text-xs font-black text-emerald-800">
                          <span>Giỏ Xanh: {applesB} quả</span>
                          <button
                            type="button"
                            onClick={() => setApplesB((prev) => (prev < 10 ? prev + 1 : 1))}
                            className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-xs transition-all cursor-pointer"
                          >
                            +🍏 Thêm
                          </button>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 flex-wrap min-h-14 p-2 bg-white/80 rounded-xl w-full border border-emerald-100">
                          {Array.from({ length: applesB }).map((_, i) => (
                            <span key={`apple-b-${i}`} className="text-2xl animate-in zoom-in-50 select-none">
                              🍏
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-brand-50 border-2 border-brand-200 rounded-2xl p-3.5 text-center">
                      <span className="font-display font-extrabold text-brand-800 text-base sm:text-lg">
                        {applesA} quả đỏ + {applesB} quả xanh = {applesA + applesB} quả táo tổng cộng
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. Balloon Pop Visualizer */}
                {lesson.visualType === 'balloon_pop' && (
                  <div className="w-full max-w-lg space-y-4">
                    <p className="text-xs font-bold text-slate-500 text-center">
                      Bấm vào từng quả bóng để nổ 💥 hoặc hồi sinh 🎈 quả bóng nhé!
                    </p>
                    <div className="flex items-center justify-center gap-2.5 flex-wrap">
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
                              'size-12 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border-2 select-none',
                              isPopped
                                ? 'bg-slate-200 border-slate-300 opacity-40 scale-90'
                                : 'bg-sky-500 hover:bg-sky-400 border-sky-300 text-white shadow-clay',
                            )}
                          >
                            <span className="text-xl">{isPopped ? '💥' : '🎈'}</span>
                            <span className="text-[10px] font-black">{id}</span>
                          </button>
                        )
                      })}
                    </div>
                    <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-3.5 text-center font-display font-extrabold text-sky-900 text-base">
                      10 (ban đầu) − {poppedBalloons.length} (nổ mất) = {10 - poppedBalloons.length} quả bóng còn lại
                    </div>
                  </div>
                )}

                {/* 3. Cake Tray Visualizer */}
                {lesson.visualType === 'cake_tray' && (
                  <div className="w-full max-w-lg space-y-4">
                    <div className="flex items-center justify-between text-xs bg-white p-3 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">Số Hàng:</span>
                        <button
                          type="button"
                          onClick={() => setCakeRows((r) => (r > 1 ? r - 1 : 5))}
                          className="size-7 bg-slate-100 hover:bg-slate-200 rounded-lg font-black"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-amber-700 text-sm px-1">{cakeRows}</span>
                        <button
                          type="button"
                          onClick={() => setCakeRows((r) => (r < 5 ? r + 1 : 1))}
                          className="size-7 bg-slate-100 hover:bg-slate-200 rounded-lg font-black"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">Số Cột:</span>
                        <button
                          type="button"
                          onClick={() => setCakeCols((c) => (c > 1 ? c - 1 : 6))}
                          className="size-7 bg-slate-100 hover:bg-slate-200 rounded-lg font-black"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-emerald-700 text-sm px-1">{cakeCols}</span>
                        <button
                          type="button"
                          onClick={() => setCakeCols((c) => (c < 6 ? c + 1 : 1))}
                          className="size-7 bg-slate-100 hover:bg-slate-200 rounded-lg font-black"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div
                      className="grid gap-2 justify-center p-3 bg-amber-50/60 rounded-2xl border border-amber-200"
                      style={{ gridTemplateColumns: `repeat(${cakeCols}, minmax(0, 1fr))` }}
                    >
                      {Array.from({ length: cakeRows }).map((_, r) =>
                        Array.from({ length: cakeCols }).map((_, c) => (
                          <div
                            key={`cake-${r}-${c}`}
                            className="size-11 sm:size-12 rounded-xl bg-white border-2 border-amber-300 flex items-center justify-center text-2xl shadow-xs animate-in zoom-in-50"
                          >
                            🍰
                          </div>
                        )),
                      )}
                    </div>

                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-center font-display font-extrabold text-amber-900 text-base">
                      {cakeRows} hàng × {cakeCols} cột = {cakeRows * cakeCols} chiếc bánh thơm ngon
                    </div>
                  </div>
                )}

                {/* 4. Pizza Fraction Visualizer */}
                {(lesson.visualType === 'pizza_fraction' ||
                  lesson.visualType === 'compare_fractions' ||
                  lesson.visualType === 'fraction_add_sub' ||
                  lesson.visualType === 'fraction_of_number') && (
                  <div className="w-full max-w-lg space-y-4 flex flex-col items-center">
                    <div className="flex items-center gap-3 text-xs bg-white p-3 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">Số lát cắt:</span>
                        <button
                          type="button"
                          onClick={() => setPizzaSlices((s) => (s === 4 ? 8 : s === 8 ? 6 : 4))}
                          className="px-2.5 py-1 bg-brand-50 border border-brand-200 text-brand-700 rounded-xl font-bold cursor-pointer"
                        >
                          {pizzaSlices} lát ⟳
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">Đã lấy:</span>
                        <button
                          type="button"
                          onClick={() => setPizzaShaded((s) => (s < pizzaSlices ? s + 1 : 1))}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                        >
                          +1 lát ({pizzaShaded})
                        </button>
                      </div>
                    </div>

                    {/* SVG Pizza Pie */}
                    <svg viewBox="0 0 160 160" className="size-40 select-none drop-shadow-md">
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

                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 text-center font-display font-extrabold text-emerald-900 text-base">
                      Phân số biểu thị: $\frac{`{${pizzaShaded}}`}{`{${pizzaSlices}}`}$ chiếc bánh pizza
                    </div>
                  </div>
                )}

                {/* 5. Analog Clock Visualizer */}
                {(lesson.visualType === 'analog_clock' || lesson.visualType === 'elapsed_time') && (
                  <div className="w-full max-w-md space-y-4 flex flex-col items-center">
                    <div className="flex items-center gap-3 text-xs bg-white p-3 rounded-2xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setClockHour((h) => (h < 12 ? h + 1 : 1))}
                        className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold cursor-pointer"
                      >
                        Chỉnh Giờ ({clockHour}h)
                      </button>
                      <button
                        type="button"
                        onClick={() => setClockMinute((m) => (m === 0 ? 15 : m === 15 ? 30 : m === 30 ? 45 : 0))}
                        className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold cursor-pointer"
                      >
                        Chỉnh Phút ({clockMinute}p)
                      </button>
                    </div>

                    <div className="size-44 bg-white rounded-full p-2 shadow-md border-2 border-slate-200 flex items-center justify-center">
                      {renderClockSvg(clockHour, clockMinute, { size: 160 })}
                    </div>

                    <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-3 text-center font-display font-extrabold text-sky-900 text-base">
                      Thời gian hiển thị: {clockHour}:{clockMinute < 10 ? `0${clockMinute}` : clockMinute}
                    </div>
                  </div>
                )}

                {/* 6. Balance Scale Visualizer */}
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

                {/* 7. Candy Division Visualizer */}
                {(lesson.visualType === 'candy_division' || lesson.visualType === 'div_remainder') && (
                  <div className="w-full max-w-lg space-y-4">
                    <div className="flex items-center justify-between text-xs bg-white p-3 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">Tổng số kẹo:</span>
                        <span className="font-extrabold text-rose-700 text-sm">{candyTotal} 🍬</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">Chia vào số đĩa:</span>
                        <button
                          type="button"
                          onClick={() => setCandyPlates((p) => (p === 2 ? 3 : p === 3 ? 4 : 2))}
                          className="px-2.5 py-1 bg-brand-50 border border-brand-200 text-brand-700 rounded-xl font-bold cursor-pointer"
                        >
                          {candyPlates} đĩa ⟳
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-center">
                      {Array.from({ length: candyPlates }).map((_, plateIdx) => {
                        const candiesPerPlate = Math.floor(candyTotal / candyPlates)
                        return (
                          <div
                            key={`plate-${plateIdx}`}
                            className="bg-white border-2 border-brand-200 rounded-2xl p-3 flex flex-col items-center space-y-2 shadow-xs"
                          >
                            <span className="text-xs font-black text-brand-700">Đĩa {plateIdx + 1}</span>
                            <div className="flex items-center justify-center gap-1 flex-wrap min-h-10">
                              {Array.from({ length: candiesPerPlate }).map((_, cIdx) => (
                                <span key={`plate-candy-${cIdx}`} className="text-lg">
                                  🍬
                                </span>
                              ))}
                            </div>
                            <span className="text-xs font-bold text-slate-500">{candiesPerPlate} cái</span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-3 text-center font-display font-extrabold text-rose-900 text-base">
                      {candyTotal} kẹo ÷ {candyPlates} đĩa = {Math.floor(candyTotal / candyPlates)} kẹo mỗi đĩa
                      {candyTotal % candyPlates !== 0 && ` (dư ${candyTotal % candyPlates} kẹo)`}
                    </div>
                  </div>
                )}

                {/* 8. Fallback for other visual types */}
                {lesson.visualType !== 'apple_drop' &&
                  lesson.visualType !== 'balloon_pop' &&
                  lesson.visualType !== 'cake_tray' &&
                  lesson.visualType !== 'pizza_fraction' &&
                  lesson.visualType !== 'compare_fractions' &&
                  lesson.visualType !== 'fraction_add_sub' &&
                  lesson.visualType !== 'fraction_of_number' &&
                  lesson.visualType !== 'analog_clock' &&
                  lesson.visualType !== 'elapsed_time' &&
                  lesson.visualType !== 'balance_scale' &&
                  lesson.visualType !== 'candy_division' &&
                  lesson.visualType !== 'div_remainder' && (
                    <div className="text-center space-y-3 p-4">
                      <span className="text-5xl select-none">{lesson.icon}</span>
                      <h3 className="text-base font-extrabold text-slate-800">
                        {lesson.theory.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-md">
                        {lesson.theory.visualHint || 'Quan sát mô hình trực quan chuẩn sư phạm ASMO và khám phá bí kíp giải toán!'}
                      </p>
                    </div>
                  )}
              </div>

              {/* Key Takeaways */}
              <div className="rounded-2xl bg-brand-50/60 border border-brand-200 p-4 sm:p-5 space-y-2.5">
                <span className="text-xs font-black text-brand-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="size-4 text-amber-500 fill-amber-500" />
                  <span>🌟 Ghi Nhớ Nhanh:</span>
                </span>
                <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-700">
                  {lesson.theory.keyTakeaways.map((takeaway, idx) => (
                    <li key={`takeaway-${idx}`} className="flex items-start gap-2.5">
                      <span className="size-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span>
                        <AsmoFormula text={takeaway} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Step Forward Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => advanceToPhase('tips')}
                  className="gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold px-6 py-3 shadow-clay cursor-pointer"
                >
                  <span>Tiếp tục: Mẹo Mèo Mee</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PHASE 2: 💡 MẸO MÈO MEE & BÍ KÍP (BÍ KÍP TÍNH NHANH)
          ══════════════════════════════════════════════════════════════════ */}
          {phase === 'tips' && (
            <div className="rounded-3xl border border-slate-200 shadow-clay bg-white p-5 sm:p-7 space-y-6 animate-fade-up">
              {/* Mee's Story Card */}
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-gradient-to-r from-amber-50 via-brand-50 to-purple-50 rounded-3xl border-2 border-amber-300 p-6 shadow-sm">
                <div className="shrink-0 flex flex-col items-center">
                  <AikidCatCharacter pose={lesson.meeTip.pose} className="size-28 sm:size-36 drop-shadow-md" />
                  <span className="text-xs font-black text-amber-900 mt-2 bg-amber-200/80 px-3 py-0.5 rounded-full border border-amber-300">
                    Trợ Giảng AI Mèo Mee
                  </span>
                </div>

                <div className="space-y-3.5 text-center sm:text-left flex-1">
                  <div className="bg-white/90 border border-amber-200 rounded-2xl p-4 shadow-2xs">
                    <span className="text-xs font-black text-amber-800 block mb-1">
                      🐱 Mèo Mee Kể Chuyện:
                    </span>
                    <p className="text-sm sm:text-base font-extrabold text-amber-950 italic leading-snug">
                      &quot;{lesson.meeTip.quote}&quot;
                    </p>
                  </div>

                  <div className="bg-brand-50/90 border border-brand-200 rounded-2xl p-4 space-y-1">
                    <span className="text-xs font-black text-brand-700 block">
                      💡 Câu Thần Chú Giải Nhanh:
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-brand-950 leading-relaxed">
                      <AsmoFormula text={lesson.meeTip.storyAdvice} />
                    </p>
                  </div>
                </div>
              </div>

              {/* Fast Tips & Common Pitfalls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 space-y-1.5">
                  <span className="font-black text-sky-800 flex items-center gap-1.5">
                    <Zap className="size-4 text-sky-600 fill-sky-600" />
                    <span>⚡ Mẹo Nhẩm Nhanh Thần Tốc:</span>
                  </span>
                  <p className="text-slate-700 font-semibold leading-relaxed">
                    Luôn nhóm các số tạo thành cặp tròn 10 hoặc tròn 100 trước khi cộng dồn để tiết kiệm thời gian.
                  </p>
                </div>

                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 space-y-1.5">
                  <span className="font-black text-rose-800 flex items-center gap-1.5">
                    <XCircle className="size-4 text-rose-600" />
                    <span>⚠️ Lỗi Thường Gặp Cần Tránh:</span>
                  </span>
                  <p className="text-slate-700 font-semibold leading-relaxed">
                    Quên cộng số nhớ ở hàng chục, hoặc nhầm lẫn giữa số bị trừ và số trừ trong phép tính có lời văn.
                  </p>
                </div>
              </div>

              {/* Bottom Step Navigation */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => advanceToPhase('explore')}
                  className="gap-2 rounded-2xl"
                >
                  <ChevronLeft className="size-4" />
                  <span>Quay lại Khám phá</span>
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  onClick={() => advanceToPhase('practice')}
                  className="gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 shadow-clay cursor-pointer"
                >
                  <span>Bắt đầu Thực hành</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PHASE 3: 🎮 THỰC HÀNH THAO TÁC (THAO TÁC TRỰC QUAN)
          ══════════════════════════════════════════════════════════════════ */}
          {phase === 'practice' && (
            <div className="rounded-3xl border border-slate-200 shadow-clay bg-white p-5 sm:p-7 space-y-6 animate-fade-up">
              {/* Task Instructions Card */}
              <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
                  <Gamepad2 className="size-4 text-emerald-600" />
                  <span>Nhiệm Vụ Thực Hành Cầm Tay Chỉ Việc</span>
                </div>
                <p className="text-sm sm:text-base font-extrabold text-slate-800 leading-snug">
                  <AsmoFormula text={lesson.interactivePractice.instruction} />
                </p>
              </div>

              {/* Interactive Practice Workspace */}
              <div className="rounded-3xl bg-slate-50 border-2 border-emerald-200 p-6 flex flex-col items-center justify-center space-y-5 text-center min-h-[220px]">
                <span className="text-5xl animate-bounce select-none">{lesson.icon}</span>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-md">
                  Hãy hoàn thành thao tác theo yêu cầu của đề bài, sau đó bấm nút kiểm tra bên dưới để Mèo Mee chấm điểm nhé!
                </p>

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleVerifyPractice}
                  className="gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-clay px-7 py-3 text-sm cursor-pointer"
                >
                  <CheckCircle2 className="size-5" />
                  <span>Kiểm Tra Kết Quả Thực Hành</span>
                </Button>

                {practiceCompleted && practiceFeedback && (
                  <div className="w-full max-w-lg bg-emerald-100 border-2 border-emerald-400 rounded-2xl p-4 text-center text-xs sm:text-sm font-extrabold text-emerald-900 animate-in zoom-in-50 space-y-1">
                    <div className="flex items-center justify-center gap-2 text-emerald-800">
                      <Sparkles className="size-5 text-amber-500 fill-amber-400" />
                      <span>{practiceFeedback}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Step Navigation */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => advanceToPhase('tips')}
                  className="gap-2 rounded-2xl"
                >
                  <ChevronLeft className="size-4" />
                  <span>Quay lại Bí kíp</span>
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  onClick={() => advanceToPhase('quiz')}
                  className="gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-6 py-3 shadow-clay cursor-pointer"
                >
                  <span>Vào Thử tài Olympic ⭐⭐⭐</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PHASE 4: 🏆 THỬ TÀI OLYMPIC (TRẮC NGHIỆM KATEX 4 ĐÁP ÁN A, B, C, D)
          ══════════════════════════════════════════════════════════════════ */}
          {phase === 'quiz' && (
            <div className="rounded-3xl border border-slate-200 shadow-clay bg-white p-5 sm:p-7 space-y-6 animate-fade-up">
              {/* Question Header Card */}
              <div className="rounded-2xl bg-gradient-to-r from-purple-50 via-brand-50 to-pink-50 border-2 border-purple-200 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-purple-100 pb-2.5 flex-wrap gap-2">
                  <span className="text-xs font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="size-4 text-purple-600" />
                    <span><AsmoFormula text={lesson.quiz.questionTitle} /></span>
                  </span>
                  <span className="rounded-xl bg-amber-100 px-3 py-1 text-xs font-black text-amber-900 border border-amber-300 shadow-2xs">
                    ⭐ 1–3 Sao + {lesson.xpReward} XP
                  </span>
                </div>

                <div className="text-base sm:text-lg font-extrabold text-slate-900 leading-relaxed">
                  <AsmoFormula text={lesson.quiz.questionText} />
                </div>
              </div>

              {/* 4 Options Grid (A, B, C, D) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {lesson.quiz.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id
                  const isCorrect = opt.isCorrect

                  let optClass = 'bg-white border-slate-200 text-slate-800 hover:border-brand-300 hover:bg-brand-50/40 shadow-xs'
                  if (quizSubmitted) {
                    if (isCorrect) {
                      optClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400 font-extrabold shadow-sm'
                    } else if (isSelected && !isCorrect) {
                      optClass = 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-300 font-bold'
                    }
                  } else if (isSelected) {
                    optClass = 'bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-400 font-extrabold shadow-clay'
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.99] cursor-pointer select-none',
                        optClass,
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span
                          className={cn(
                            'size-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs',
                            isSelected
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-100 text-slate-700',
                          )}
                        >
                          {opt.label}
                        </span>
                        <span className="text-sm sm:text-base font-bold leading-snug">
                          <AsmoFormula text={opt.text} />
                        </span>
                      </div>

                      {quizSubmitted && (
                        <div>
                          {isCorrect ? (
                            <CheckCircle2 className="size-6 text-emerald-600 shrink-0 animate-in zoom-in-50" />
                          ) : isSelected ? (
                            <XCircle className="size-6 text-rose-600 shrink-0 animate-in zoom-in-50" />
                          ) : null}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Quiz Submit & Immediate Feedback Banner */}
              {!quizSubmitted ? (
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    disabled={!selectedOptionId}
                    onClick={handleSubmitQuiz}
                    className="gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-extrabold shadow-clay px-8 py-3.5 text-base disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="size-5" />
                    <span>Nộp Bài Trắc Nghiệm</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {isQuizCorrect ? (
                    <div className="rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-mint-50 border-2 border-emerald-400 p-6 text-center space-y-3.5 shadow-sm">
                      <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Star
                            key={`star-${i}`}
                            className={cn(
                              'size-9 transition-all',
                              i < earnedStars
                                ? 'text-amber-400 fill-amber-400 drop-shadow-md animate-bounce'
                                : 'text-slate-300 fill-slate-200',
                            )}
                          />
                        ))}
                      </div>

                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-emerald-900">
                          🎉 CHÍNH XÁC XUẤT SẮC! BÉ ĐÃ ĐẠT {earnedStars} SAO!
                        </h3>
                        <p className="text-xs sm:text-sm font-bold text-emerald-800 mt-1">
                          <AsmoFormula text={lesson.quiz.correctExplanation} />
                        </p>
                        {lesson.quiz.formulaExplanation && (
                          <div className="mt-2 inline-block px-3 py-1 bg-white/80 rounded-xl border border-emerald-300 text-xs font-mono font-bold text-emerald-900">
                            <AsmoFormula text={`$$${lesson.quiz.formulaExplanation}$$`} />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        {nextLesson ? (
                          <Button
                            type="button"
                            variant="primary"
                            onClick={() => navigate(`/asmo/curriculum/lesson/${nextLesson.id}`)}
                            className="gap-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shadow-clay px-6 py-3 cursor-pointer"
                          >
                            <span>Trạm tiếp theo ({nextLesson.lessonNumber})</span>
                            <ArrowRight className="size-4 text-slate-950" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="primary"
                            onClick={() => navigate(`/asmo/curriculum?stage=${stage.id}`)}
                            className="gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3"
                          >
                            <Trophy className="size-4" />
                            <span>Hoàn Thành Lộ Trình Chặng!</span>
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => navigate(`/asmo/curriculum?stage=${stage.id}`)}
                          className="gap-2 rounded-2xl"
                        >
                          <Map className="size-4" />
                          <span>Về Bản Đồ Vùng Đảo</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl bg-rose-50 border-2 border-rose-300 p-6 text-center space-y-3">
                      <h3 className="text-base sm:text-lg font-black text-rose-900">
                        Chưa chính xác rồi! Hãy xem lại bí kíp của Mèo Mee và thử lại nhé!
                      </h3>
                      <p className="text-xs sm:text-sm font-bold text-rose-700">
                        Bí kíp: Hãy quay lại Tab 2 &quot;Mẹo Mèo Mee &amp; Bí kíp&quot; để nắm vững phương pháp giải!
                      </p>
                      <div className="pt-2 flex justify-center gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleRetryQuiz}
                          className="gap-2 rounded-2xl bg-white border-rose-200 text-rose-800 font-bold px-6 py-2.5 shadow-2xs"
                        >
                          <RotateCcw className="size-4" />
                          <span>Thử Chọn Lại</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => advanceToPhase('tips')}
                          className="gap-2 rounded-2xl text-brand-700 font-bold"
                        >
                          <Lightbulb className="size-4" />
                          <span>Xem lại Bí kíp</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── 4. FOOTER ACTION BUTTONS ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => navigate(`/asmo/curriculum?stage=${stage.id}`)}
              className="gap-2 rounded-2xl"
            >
              <Map className="size-4" />
              <span>🎓 Thoát về bản đồ</span>
            </Button>

            {isQuizCorrect ? (
              <Button
                variant="primary"
                onClick={() => {
                  if (nextLesson) {
                    navigate(`/asmo/curriculum/lesson/${nextLesson.id}`)
                  } else {
                    navigate(`/asmo/curriculum?stage=${stage.id}`)
                  }
                }}
                className="gap-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold shadow-clay px-6 py-2.5"
              >
                <Star className="size-4" />
                <span>🌸 Hoàn thành &amp; Tiếp tục</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  if (phase !== 'quiz') {
                    advanceToPhase('quiz')
                  } else {
                    handleSubmitQuiz()
                  }
                }}
                className="gap-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold px-6 py-2.5"
              >
                <span>Vào Thử tài Olympic</span>
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          RIGHT COLUMN: 30% SIDEBAR TRỢ GIẢNG MÈO MEE & CHECKLIST HÀNH TRÌNH
      ══════════════════════════════════════════════════════════════════ */}
      <aside
        className="w-full lg:w-[320px] shrink-0 self-start overflow-y-auto rounded-3xl border-2 border-brand-200 bg-white p-4 shadow-clay space-y-4"
        aria-labelledby="asmo-sidebar-assistant-title"
      >
        {/* Khối Mèo Mee: AikidCatCharacter + bóng thoại */}
        <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3.5">
          <AikidCatCharacter pose={dynamicGuideCopy.pose} className="size-16 shrink-0 drop-shadow-sm" />
          <div className="min-w-0 flex-1 text-left">
            <p className="flex items-center gap-1 text-xs font-black text-coral-600">
              <MessageCircle className="size-3.5" />
              <span>Mee đang hỗ trợ: Con làm được! 🐾</span>
            </p>
            <h2 id="asmo-sidebar-assistant-title" className="font-display text-base font-extrabold text-slate-800 leading-tight">
              {dynamicGuideCopy.title}
            </h2>
          </div>
        </div>

        {/* Dynamic Mee speech balloon */}
        <div className="rounded-2xl bg-brand-50 border border-brand-100 p-3.5 text-left animate-pop">
          <p className="text-[11px] font-black text-brand-700 uppercase tracking-wider">
            {dynamicGuideCopy.eyebrow}
          </p>
          <p className="mt-1 text-xs font-bold leading-relaxed text-slate-700">
            <AsmoFormula text={dynamicGuideCopy.body} />
          </p>
        </div>

        {/* Hộp lời khuyên: 💡 Gợi ý cho con (Toggleable) */}
        <div className="space-y-2">
          <Button
            className="w-full gap-2 rounded-2xl text-xs font-bold"
            variant="secondary"
            onClick={() => setShowHint(!showHint)}
            aria-expanded={showHint}
          >
            <Lightbulb className="size-4 text-amber-500" />
            <span>{showHint ? 'Ẩn gợi ý' : '💡 Gợi ý cho con'}</span>
          </Button>

          {showHint && (
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 text-left text-xs font-bold text-amber-950 animate-pop space-y-1">
              <p className="flex items-center gap-1.5 font-black text-amber-900">
                <Lightbulb className="size-3.5 text-amber-600" />
                <span>Mee bật mí:</span>
              </p>
              <p className="font-medium text-slate-700">
                Làm tuần tự từ Bước 1 đến Bước 4. Khi làm câu hỏi Olympic, nếu chưa chắc chắn thì hãy quay lại xem Mẹo Mèo Mee ở Bước 2 nhé!
              </p>
            </div>
          )}
        </div>

        {/* Checklist Hành trình trạm */}
        <section className="border-t-2 border-slate-100 pt-3.5" aria-labelledby="journey-checklist-title">
          <h3 id="journey-checklist-title" className="font-display text-sm font-extrabold text-slate-800">
            Hành trình trạm
          </h3>
          <ol className="mt-2.5 space-y-2">
            {ASMO_LESSON_PHASES.map((step, index) => {
              const currentIdx = PHASE_ORDER.indexOf(phase === 'done' ? 'quiz' : phase)
              const maxIdx = PHASE_ORDER.indexOf(maxUnlockedPhase === 'done' ? 'quiz' : maxUnlockedPhase)
              const complete = index < currentIdx || (index === 3 && isQuizCorrect)
              const active = index === currentIdx

              return (
                <li
                  key={step.id}
                  onClick={() => {
                    setPhase(step.id)
                    setShowHint(false)
                  }}
                  className={cn(
                    'flex items-center gap-2.5 rounded-2xl border p-2.5 text-xs font-bold transition-all cursor-pointer',
                    active
                      ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-2xs'
                      : complete
                        ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                        : 'border-slate-200 bg-slate-50 text-slate-500',
                  )}
                >
                  <span
                    className={cn(
                      'size-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0',
                      complete
                        ? 'bg-emerald-500 text-white'
                        : active
                          ? 'bg-brand-500 text-white'
                          : 'bg-slate-200 text-slate-600',
                    )}
                  >
                    {complete ? '✓' : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block font-extrabold truncate">{step.label}</span>
                    <span className="text-[10px] font-semibold text-slate-500">{step.description}</span>
                  </div>
                  {complete && <span className="text-[10px] font-black text-emerald-600 shrink-0">Xong</span>}
                  {active && !complete && <span className="text-[10px] font-black text-brand-600 shrink-0">Đang học</span>}
                </li>
              )
            })}
          </ol>
        </section>

        {/* Hộp 🎯 Mục tiêu của con */}
        <section className="border-t-2 border-slate-100 pt-3.5" aria-labelledby="asmo-goals-title">
          <h3 id="asmo-goals-title" className="font-display text-sm font-extrabold text-slate-800">
            🎯 Mục tiêu của con
          </h3>
          <ul className="mt-2 space-y-1.5">
            {lesson.theory.keyTakeaways.slice(0, 3).map((goal, idx) => (
              <li key={`goal-${idx}`} className="flex items-start gap-2 text-xs font-semibold text-slate-600">
                <span className="mt-0.5 size-4 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[9px] font-black shrink-0">
                  ★
                </span>
                <span className="leading-snug">
                  <AsmoFormula text={goal} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Reward summary teaser */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-sun-50 border border-amber-200 p-3 flex items-center gap-3">
          <Award className="size-6 text-amber-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
              Phần thưởng trạm
            </span>
            <span className="text-xs font-extrabold text-slate-800">
              +{lesson.xpReward} XP &amp; Huy Hiệu Chặng {stage.stageNumber}
            </span>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          COMPLETION CELEBRATION MODAL (ADVENTURE MODAL)
      ══════════════════════════════════════════════════════════════════════ */}
      {showCelebrationModal && (
        <AdventureModal
          open={showCelebrationModal}
          tone="celebration"
          eyebrow={`Trạm ${lesson.lessonNumber} đã hoàn thành`}
          title="Con đã chinh phục trạm!"
          description={`Bé đã xuất sắc đạt ${earnedStars} sao và nhận +${lesson.xpReward} XP cùng Mèo Mee!`}
          onClose={() => setShowCelebrationModal(false)}
          closeLabel="Đóng"
          className="lesson-completion-modal"
          artwork={
            <div className="lesson-result-visual flex flex-col items-center gap-3">
              <div className="stars-row flex items-center justify-center gap-2">
                {[1, 2, 3].map((i) => (
                  <Star
                    key={i}
                    size={44}
                    className={cn(
                      'transition-all duration-500',
                      i <= earnedStars
                        ? 'text-amber-400 fill-amber-400 animate-bounce drop-shadow-md'
                        : 'text-slate-300 fill-slate-200',
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2 flex items-center gap-2">
                <Trophy className="size-5 text-amber-600" />
                <span className="text-xs font-black text-amber-900">
                  +{lesson.xpReward} XP Thưởng Olympic
                </span>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-left">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-800">
                Hôm nay con đã làm chủ:
              </p>
              <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800">
                <AsmoFormula text={lesson.theory.title} />
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {nextLesson && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowCelebrationModal(false)
                    navigate(`/asmo/curriculum/lesson/${nextLesson.id}`)
                  }}
                  className="gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shadow-clay"
                >
                  <Play className="size-4 fill-slate-950" />
                  <span>Trạm tiếp theo ({nextLesson.lessonNumber})</span>
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCelebrationModal(false)
                  navigate(`/asmo/curriculum?stage=${stage.id}`)
                }}
                className="gap-2"
              >
                <Map className="size-4" />
                <span>Về bản đồ</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCelebrationModal(false)
                  advanceToPhase('explore')
                }}
                className="gap-2"
              >
                <span>Xem lại bài</span>
              </Button>
            </div>
          </div>
        </AdventureModal>
      )}
    </div>
  )
}
