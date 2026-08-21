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
  Plus,
  Minus,
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
import { AsmoInteractiveAppleTreeCanvas } from '../components/AsmoInteractiveAppleTreeCanvas'
import { AsmoInteractivePracticeWorkspace } from '../components/AsmoInteractivePracticeWorkspace'
import { renderClockSvg, renderBalanceScaleSvg, renderMatchstickFigureSvg } from '../components/AsmoDiagramEngine'
import { AikidCatCharacter, type AikidCatPose } from '@/shared/components/ui/AikidCatCharacter'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

export type AsmoLessonPhase = 'explore' | 'tips' | 'practice' | 'quiz' | 'done'

export const ASMO_LESSON_PHASES = [
  {
    id: 'explore' as const,
    label: '1. 📖 Khám phá',
    title: 'Khám phá Khái niệm',
    description: 'Quan sát & Nhận diện',
    icon: BookOpen,
    badge: 'Bước 1',
  },
  {
    id: 'tips' as const,
    label: '2. 💡 Mẹo Mee',
    title: 'Mẹo Mèo Mee & Bí kíp',
    description: 'Bí kíp tính nhanh',
    icon: Lightbulb,
    badge: 'Bước 2',
  },
  {
    id: 'practice' as const,
    label: '3. 🎮 Thực hành',
    title: 'Thực hành Thao tác',
    description: 'Thao tác trực quan',
    icon: Gamepad2,
    badge: 'Bước 3',
  },
  {
    id: 'quiz' as const,
    label: '4. 🏆 Thử tài',
    title: 'Thử tài Olympic',
    description: 'Chinh phục 3 Sao',
    icon: Trophy,
    badge: 'Bước 4',
  },
]

const PHASE_ORDER: AsmoLessonPhase[] = ['explore', 'tips', 'practice', 'quiz', 'done']

export const RAINBOW_MAKE10_PAIRS = [
  {
    id: 1,
    left: 1,
    right: 9,
    themeColor: 'rose',
    colorName: '🔴 Đỏ',
    fruitEmoji: '🍎',
    fruitName: 'Quả Táo Đỏ',
    leftFruits: ['🍎'],
    rightFruits: ['🍎', '🍎', '🍎', '🍎', '🍎', '🍎', '🍎', '🍎', '🍎'],
    gradient: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white',
    bridgeGradient: 'from-rose-500 via-pink-400 to-rose-500',
    borderGlow: 'border-rose-400 shadow-rose-200',
    cardBg: 'bg-rose-50/70 border-rose-200',
    meeQuote: 'Mee vỗ tay: Bạn 1 kết đôi cùng Bạn 9 tạo thành 10 quả táo đỏ thơm ngọt! 🍎✨',
  },
  {
    id: 2,
    left: 2,
    right: 8,
    themeColor: 'amber',
    colorName: '🟠 Cam',
    fruitEmoji: '🍊',
    fruitName: 'Quả Cam Ngọt',
    leftFruits: ['🍊', '🍊'],
    rightFruits: ['🍊', '🍊', '🍊', '🍊', '🍊', '🍊', '🍊', '🍊'],
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
    bridgeGradient: 'from-amber-500 via-orange-400 to-amber-500',
    borderGlow: 'border-amber-400 shadow-amber-200',
    cardBg: 'bg-amber-50/70 border-amber-200',
    meeQuote: 'Mee vỗ tay: Bạn 2 sánh đôi cùng Bạn 8 tạo thành 10 quả cam mọng nước! 🍊✨',
  },
  {
    id: 3,
    left: 3,
    right: 7,
    themeColor: 'yellow',
    colorName: '🟡 Vàng',
    fruitEmoji: '🍋',
    fruitName: 'Quả Chanh Vàng',
    leftFruits: ['🍋', '🍋', '🍋'],
    rightFruits: ['🍋', '🍋', '🍋', '🍋', '🍋', '🍋', '🍋'],
    gradient: 'bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-950',
    bridgeGradient: 'from-yellow-400 via-amber-300 to-yellow-400',
    borderGlow: 'border-yellow-400 shadow-yellow-200',
    cardBg: 'bg-yellow-50/70 border-yellow-200',
    meeQuote: 'Mee vỗ tay: Bạn 3 kết bạn cùng Bạn 7 tạo thành 10 quả chanh vàng tươi sáng! 🍋✨',
  },
  {
    id: 4,
    left: 4,
    right: 6,
    themeColor: 'emerald',
    colorName: '🟢 Xanh Lá',
    fruitEmoji: '🍏',
    fruitName: 'Quả Táo Xanh',
    leftFruits: ['🍏', '🍏', '🍏', '🍏'],
    rightFruits: ['🍏', '🍏', '🍏', '🍏', '🍏', '🍏'],
    gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    bridgeGradient: 'from-emerald-500 via-teal-400 to-emerald-500',
    borderGlow: 'border-emerald-400 shadow-emerald-200',
    cardBg: 'bg-emerald-50/70 border-emerald-200',
    meeQuote: 'Mee vỗ tay: Bạn 4 tìm bạn cùng Bạn 6 tạo thành 10 quả táo xanh giòn ngọt! 🍏✨',
  },
  {
    id: 5,
    left: 5,
    right: 5,
    themeColor: 'purple',
    colorName: '🟣 Tím',
    fruitEmoji: '🍇',
    fruitName: 'Chùm Nho Tím',
    leftFruits: ['🍇', '🍇', '🍇', '🍇', '🍇'],
    rightFruits: ['🍇', '🍇', '🍇', '🍇', '🍇'],
    gradient: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white',
    bridgeGradient: 'from-purple-500 via-indigo-400 to-purple-500',
    borderGlow: 'border-purple-400 shadow-purple-200',
    cardBg: 'bg-purple-50/70 border-purple-200',
    meeQuote: 'Mee vỗ tay: Cặp song sinh 5 và 5 bắt tay nhau tạo thành 10 chùm nho tím tuyệt đẹp! 🍇✨',
  },
]

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
  const isElementary = (stage?.stageNumber ?? 1) <= 3

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
  const [activeRainbowPairId, setActiveRainbowPairId] = useState<number | 'all'>(1)
  const [columnAddStep, setColumnAddStep] = useState(0)
  const [columnSubStep, setColumnSubStep] = useState(0)
  const [table9Factor, setTable9Factor] = useState(7)
  const [rectW, setRectW] = useState(4)
  const [rectH, setRectH] = useState(3)
  const [cubeLayers, setCubeLayers] = useState([4, 2, 1])
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
    <div className="page-enter flex h-dvh flex-col gap-3 sm:gap-4 overflow-hidden p-2 sm:p-4 lg:flex-row bg-[#f8fafc] text-text font-body">
      {/* ══════════════════════════════════════════════════════════════════════
          LEFT COLUMN: 70% MAIN STAGE & LESSON WORKSPACE
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col gap-3 sm:gap-4 min-w-0 overflow-hidden">
        {/* ── 1. HEADER CARD (COMPACT HERO HEADER) ── */}
        <div className="ui-card p-3 sm:p-4 shrink-0 bg-white rounded-3xl border border-brand-100 shadow-sm space-y-2">
          {/* Dòng 1: Breadcrumb nhẹ nhàng + Badge XP & Thẻ Sao trạm ⭐⭐⭐ */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 min-w-0">
              <Link
                to={`/asmo/curriculum?stage=${stage.id}`}
                className="hover:text-brand-600 transition-colors font-bold text-slate-500 hover:underline truncate max-w-[200px] sm:max-w-none"
              >
                Chặng {stage.stageNumber}: {stage.title.split(':')[1]?.trim() || stage.title}
              </Link>
              <span className="text-slate-300 select-none">›</span>
              <span className="font-extrabold text-brand-700 truncate">
                Trạm {lesson.lessonNumber}: <AsmoFormula text={lesson.title} />
              </span>
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-xl bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-bold text-amber-800 flex items-center gap-1">
                <Zap className="size-3 text-amber-500 fill-amber-500" />
                +{lesson.xpReward} XP
              </span>
              <div
                className="lesson-star-rack flex items-center gap-1 bg-amber-50/80 border border-amber-200 rounded-xl px-2 py-0.5 shadow-2xs"
                aria-label={`Sao của trạm: ${liveStars} sao đã nhận`}
              >
                <span className="text-[11px] font-extrabold text-amber-800 mr-0.5 hidden sm:inline">
                  Sao của trạm
                </span>
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    size={16}
                    className={cn(
                      'transition-all duration-300',
                      starIdx <= liveStars
                        ? 'text-amber-400 fill-amber-400 drop-shadow-xs scale-110'
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
          </div>

          {/* Dòng 2: Tiêu đề bài học + mô tả ngắn gọn 1 dòng */}
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
            <h1 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              <AsmoFormula text={lesson.title} />
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 truncate shrink-0">
              <span className="text-slate-400">Sản phẩm của trạm:</span>{' '}
              <strong className="text-slate-700 font-bold">
                <AsmoFormula text={lesson.subtitle} />
              </strong>
            </p>
          </div>

          {/* ── 2. THANH 4 TAB STEPPER SIÊU TINH TẾ (COMPACT 1-ROW STEPPER) ── */}
          <nav
            className="grid grid-cols-4 gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60"
            aria-label="Các giai đoạn bài học"
          >
            {ASMO_LESSON_PHASES.map((p, idx) => {
              const currentIdx = PHASE_ORDER.indexOf(phase === 'done' ? 'quiz' : phase)
              const isActive = p.id === (phase === 'done' ? 'quiz' : phase)
              const isDone = idx < currentIdx || (idx === 3 && isQuizCorrect)

              return (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`${p.label}: ${p.description}`}
                  title={`${p.title} · ${p.description}`}
                  onClick={() => {
                    setPhase(p.id)
                    setShowHint(false)
                  }}
                  className={cn(
                    'flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-2 rounded-xl text-xs sm:text-sm transition-all select-none cursor-pointer text-center truncate',
                    isActive
                      ? 'bg-white shadow-clay border-2 border-brand-500 text-brand-700 font-black scale-[1.01]'
                      : isDone
                        ? 'bg-white/60 hover:bg-white text-emerald-700 font-bold border border-emerald-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 font-semibold border border-transparent',
                  )}
                >
                  {isDone && !isActive && (
                    <span className="size-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                      ✓
                    </span>
                  )}
                  <span className="truncate">{p.label}</span>
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
            <div className="rounded-3xl border border-slate-200 shadow-clay bg-white p-5 sm:p-7 space-y-5 animate-fade-up">
              {/* Capsule Mèo Mee Visual-First Banner (Elementary Cấp 1) or Theory Card (Secondary / High School) */}
              {isElementary ? (
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-100 via-brand-50 to-pink-100 border-2 border-amber-300/80 shadow-xs text-xs sm:text-sm font-extrabold text-amber-950 animate-pop">
                  <AikidCatCharacter pose="welcome" className="size-7 shrink-0 drop-shadow-xs" />
                  <span>🐱 Mèo Mee: Bé hãy chạm vào hình ảnh để xem điều kỳ diệu nhé!</span>
                </div>
              ) : (
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
              )}

              {/* Dynamic Interactive Pedagogical Visualizer for Lesson */}
              <div className="rounded-3xl bg-slate-50 border-2 border-slate-200 p-5 sm:p-6 flex flex-col items-center justify-center space-y-4 min-h-[280px]">
                {/* 1. Apple Drop Visualizer */}
                {lesson.visualType === 'apple_drop' && (
                  <div className="w-full max-w-xl">
                    <AsmoInteractiveAppleTreeCanvas
                      applesA={applesA}
                      applesB={applesB}
                      onAddApple={(basket) => {
                        if (basket === 'A') setApplesA((prev) => (prev < 10 ? prev + 1 : 10))
                        else setApplesB((prev) => (prev < 10 ? prev + 1 : 10))
                      }}
                      onSubApple={(basket) => {
                        if (basket === 'A') setApplesA((prev) => (prev > 0 ? prev - 1 : 0))
                        else setApplesB((prev) => (prev > 0 ? prev - 1 : 0))
                      }}
                      onReset={() => {
                        setApplesA(0)
                        setApplesB(0)
                      }}
                      title="Vườn Cây Táo Mẹ: Thao Tác Kéo Thả &amp; Nhảy Số"
                      instruction="Bé hãy chạm vào quả táo trên cây hoặc kéo thả vào giỏ tương ứng nhé!"
                      meeQuote="🐱 Mèo Mee: Bé hãy chạm vào quả táo trên cây hoặc kéo thả vào giỏ nhé!"
                    />
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
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white p-3.5 rounded-2xl border-2 border-amber-200">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-700">Số Hàng:</span>
                        <div className="flex items-center gap-1.5 bg-white/90 p-1 rounded-2xl border-2 border-amber-200 shadow-2xs">
                          <button
                            type="button"
                            aria-label="Bớt hàng bánh"
                            disabled={cakeRows <= 1}
                            onClick={() => setCakeRows((r) => (r > 1 ? r - 1 : 1))}
                            className="size-8 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="size-4 stroke-[3]" />
                          </button>
                          <span className="w-6 text-center font-display font-black text-sm text-amber-950 select-none">
                            {cakeRows}
                          </span>
                          <button
                            type="button"
                            aria-label="Thêm hàng bánh"
                            disabled={cakeRows >= 6}
                            onClick={() => setCakeRows((r) => (r < 6 ? r + 1 : 6))}
                            className="size-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black flex items-center justify-center shadow-xs transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="size-4 stroke-[3]" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-700">Số Cột:</span>
                        <div className="flex items-center gap-1.5 bg-white/90 p-1 rounded-2xl border-2 border-amber-200 shadow-2xs">
                          <button
                            type="button"
                            aria-label="Bớt cột bánh"
                            disabled={cakeCols <= 1}
                            onClick={() => setCakeCols((c) => (c > 1 ? c - 1 : 1))}
                            className="size-8 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="size-4 stroke-[3]" />
                          </button>
                          <span className="w-6 text-center font-display font-black text-sm text-amber-950 select-none">
                            {cakeCols}
                          </span>
                          <button
                            type="button"
                            aria-label="Thêm cột bánh"
                            disabled={cakeCols >= 6}
                            onClick={() => setCakeCols((c) => (c < 6 ? c + 1 : 6))}
                            className="size-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black flex items-center justify-center shadow-xs transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="size-4 stroke-[3]" />
                          </button>
                        </div>
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
                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs bg-white p-3 rounded-2xl border-2 border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-700">Số lát cắt:</span>
                        {[4, 6, 8, 10].map((num) => (
                          <button
                            key={`slice-btn-${num}`}
                            type="button"
                            onClick={() => {
                              setPizzaSlices(num)
                              if (pizzaShaded > num) setPizzaShaded(num)
                            }}
                            className={cn(
                              'px-2.5 py-1 rounded-xl font-black text-xs cursor-pointer border transition-all',
                              pizzaSlices === num
                                ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
                            )}
                          >
                            {num}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                        <span className="font-extrabold text-slate-700">Đã lấy:</span>
                        <div className="flex items-center gap-1.5 bg-white/90 p-1 rounded-2xl border-2 border-emerald-200 shadow-2xs">
                          <button
                            type="button"
                            aria-label="Bớt lát pizza"
                            disabled={pizzaShaded <= 0}
                            onClick={() => setPizzaShaded((s) => (s > 0 ? s - 1 : 0))}
                            className="size-8 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-black flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="size-4 stroke-[3]" />
                          </button>
                          <span className="w-6 text-center font-display font-black text-sm text-emerald-950 select-none">
                            {pizzaShaded}
                          </span>
                          <button
                            type="button"
                            aria-label="Thêm lát pizza"
                            disabled={pizzaShaded >= pizzaSlices}
                            onClick={() => setPizzaShaded((s) => (s < pizzaSlices ? s + 1 : pizzaSlices))}
                            className="size-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black flex items-center justify-center shadow-xs transition-all active:scale-90 disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="size-4 stroke-[3]" />
                          </button>
                        </div>
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
                      <AsmoFormula text={`Phân số biểu thị: $\\frac{${pizzaShaded}}{${pizzaSlices}}$ chiếc bánh pizza`} />
                    </div>
                  </div>
                )}

                {/* 5. Analog Clock Visualizer */}
                {(lesson.visualType === 'analog_clock' || lesson.visualType === 'elapsed_time') && (
                  <div className="w-full max-w-md space-y-4 flex flex-col items-center">
                    <div className="flex flex-wrap items-center justify-center gap-3 text-xs bg-white p-3 rounded-2xl border-2 border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-700">Chỉnh Giờ:</span>
                        <div className="flex items-center gap-1.5 bg-white/90 p-1 rounded-2xl border-2 border-sky-200 shadow-2xs">
                          <button
                            type="button"
                            aria-label="Lùi 1 giờ"
                            onClick={() => setClockHour((h) => (h > 1 ? h - 1 : 12))}
                            className="size-8 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-700 font-black flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                          >
                            <Minus className="size-4 stroke-[3]" />
                          </button>
                          <span className="w-8 text-center font-display font-black text-sm text-sky-950 select-none">
                            {clockHour}h
                          </span>
                          <button
                            type="button"
                            aria-label="Tiến 1 giờ"
                            onClick={() => setClockHour((h) => (h < 12 ? h + 1 : 1))}
                            className="size-8 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black flex items-center justify-center shadow-xs transition-all active:scale-90 cursor-pointer"
                          >
                            <Plus className="size-4 stroke-[3]" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                        <span className="font-extrabold text-slate-700">Chỉnh Phút:</span>
                        {[0, 15, 30, 45].map((min) => (
                          <button
                            key={`min-btn-${min}`}
                            type="button"
                            onClick={() => setClockMinute(min)}
                            className={cn(
                              'px-2 py-1 rounded-xl font-black text-xs cursor-pointer border transition-all',
                              clockMinute === min
                                ? 'bg-indigo-500 text-white border-indigo-500 shadow-xs'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
                            )}
                          >
                            {min}p
                          </button>
                        ))}
                      </div>
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

                {/* ── 8. MAKE 10: CẦU VỒNG 5 CẶP BẠN THÂN TRÒN 10 ── */}
                {lesson.visualType === 'make10' && (
                  <div className="w-full max-w-2xl space-y-5">
                    {/* Header Banner */}
                    <div className="rounded-2xl bg-gradient-to-r from-rose-100 via-amber-100 via-emerald-100 to-purple-100 border-2 border-brand-300 p-4 text-center space-y-1 shadow-xs">
                      <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-black text-slate-900">
                        <span>🌈</span>
                        <span>CẦU VỒNG 5 CẶP BẠN THÂN TRÒN 10</span>
                        <span>🌈</span>
                      </div>
                      <p className="text-xs font-bold text-slate-600">
                        Bé hãy bấm vào từng cặp bạn thân để thắp sáng cầu vồng kết nối và nghe Mèo Mee cổ vũ nhé!
                      </p>
                    </div>

                    {/* Pair Selector Buttons */}
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {RAINBOW_MAKE10_PAIRS.map((p) => {
                        const isSelected = activeRainbowPairId === p.id
                        return (
                          <button
                            key={`rainbow-btn-${p.id}`}
                            type="button"
                            onClick={() => setActiveRainbowPairId(p.id)}
                            className={cn(
                              'px-3 py-1.5 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 select-none active:scale-95 shadow-xs flex items-center gap-1.5',
                              isSelected
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 ring-2 ring-purple-300 scale-105 shadow-clay'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
                            )}
                          >
                            <span>{p.colorName}</span>
                            <span>{p.left} + {p.right} = 10</span>
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => setActiveRainbowPairId('all')}
                        className={cn(
                          'px-3 py-1.5 rounded-2xl text-xs font-black transition-all cursor-pointer border-2 select-none active:scale-95 shadow-xs flex items-center gap-1.5',
                          activeRainbowPairId === 'all'
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-amber-400 ring-2 ring-amber-300 scale-105 shadow-clay'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
                        )}
                      >
                        <span>🌈 Xem Cả 5 Cặp</span>
                      </button>
                    </div>

                    {/* Single Pair Showcase or All Pairs View */}
                    {activeRainbowPairId !== 'all' ? (
                      (() => {
                        const cur = RAINBOW_MAKE10_PAIRS.find((p) => p.id === activeRainbowPairId) || RAINBOW_MAKE10_PAIRS[0]
                        return (
                          <div className={cn('rounded-3xl border-2 p-5 sm:p-6 space-y-4 shadow-sm transition-all animate-in zoom-in-95 duration-200', cur.cardBg, cur.borderGlow)}>
                            {/* Top Stage: Left Ball ➔ Animated Rainbow Bridge ➔ Right Ball */}
                            <div className="flex items-center justify-between gap-2 sm:gap-4 relative">
                              {/* Left Ball */}
                              <div className="flex flex-col items-center gap-1.5 z-10">
                                <div className={cn('size-20 sm:size-24 rounded-full font-black text-3xl sm:text-4xl drop-shadow-md flex flex-col items-center justify-center shadow-clay border-4 border-white animate-bounce', cur.gradient)}>
                                  <span>{cur.left}</span>
                                  <span className="text-base sm:text-lg -mt-1">{cur.fruitEmoji}</span>
                                </div>
                                <span className="text-xs font-extrabold text-slate-800">
                                  {cur.left} {cur.fruitName}
                                </span>
                              </div>

                              {/* Big 7-Color Rainbow Arch with Clouds */}
                              <div className="flex-1 flex flex-col items-center justify-center relative px-1 sm:px-2 min-w-0">
                                <svg viewBox="0 0 300 110" className="w-full max-w-[280px] sm:max-w-[320px] h-24 sm:h-28 select-none drop-shadow-md overflow-visible">
                                  <defs>
                                    <linearGradient id="rainbow-cloud-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                      <stop offset="0%" stopColor="#ffffff" />
                                      <stop offset="100%" stopColor="#f1f5f9" />
                                    </linearGradient>
                                    <filter id="rainbow-cloud-shadow" x="-20%" y="-20%" width="140%" height="140%">
                                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#64748b" floodOpacity="0.15" />
                                    </filter>
                                  </defs>

                                  {/* 5 Layered Bold Rainbow Arcs */}
                                  {/* Red #ef4444 */}
                                  <path
                                    d="M 60,95 A 90,90 0 0,1 240,95"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="7.5"
                                    strokeLinecap="round"
                                  />
                                  {/* Orange #f97316 */}
                                  <path
                                    d="M 68,95 A 82,82 0 0,1 232,95"
                                    fill="none"
                                    stroke="#f97316"
                                    strokeWidth="7.5"
                                    strokeLinecap="round"
                                  />
                                  {/* Yellow #facc15 */}
                                  <path
                                    d="M 76,95 A 74,74 0 0,1 224,95"
                                    fill="none"
                                    stroke="#facc15"
                                    strokeWidth="7.5"
                                    strokeLinecap="round"
                                  />
                                  {/* Green #10b981 */}
                                  <path
                                    d="M 84,95 A 66,66 0 0,1 216,95"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="7.5"
                                    strokeLinecap="round"
                                  />
                                  {/* Purple #8b5cf6 */}
                                  <path
                                    d="M 92,95 A 58,58 0 0,1 208,95"
                                    fill="none"
                                    stroke="#8b5cf6"
                                    strokeWidth="7.5"
                                    strokeLinecap="round"
                                  />

                                  {/* Sparkle Dashed Highlight Overlay along outer arc */}
                                  <path
                                    d="M 60,95 A 90,90 0 0,1 240,95"
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeDasharray="3 8"
                                    opacity="0.85"
                                  />

                                  {/* Fluffy 3D Cloud Left */}
                                  <g filter="url(#rainbow-cloud-shadow)">
                                    <ellipse cx="72" cy="94" rx="28" ry="13" fill="url(#rainbow-cloud-grad)" stroke="#ffffff" strokeWidth="1.5" />
                                    <circle cx="58" cy="88" r="12" fill="url(#rainbow-cloud-grad)" stroke="#ffffff" strokeWidth="1.5" />
                                    <circle cx="74" cy="80" r="15" fill="url(#rainbow-cloud-grad)" stroke="#ffffff" strokeWidth="1.5" />
                                    <circle cx="90" cy="88" r="11" fill="url(#rainbow-cloud-grad)" stroke="#ffffff" strokeWidth="1.5" />
                                  </g>

                                  {/* Fluffy 3D Cloud Right */}
                                  <g filter="url(#rainbow-cloud-shadow)">
                                    <ellipse cx="228" cy="94" rx="28" ry="13" fill="url(#rainbow-cloud-grad)" stroke="#ffffff" strokeWidth="1.5" />
                                    <circle cx="210" cy="88" r="11" fill="url(#rainbow-cloud-grad)" stroke="#ffffff" strokeWidth="1.5" />
                                    <circle cx="226" cy="80" r="15" fill="url(#rainbow-cloud-grad)" stroke="#ffffff" strokeWidth="1.5" />
                                    <circle cx="242" cy="88" r="12" fill="url(#rainbow-cloud-grad)" stroke="#ffffff" strokeWidth="1.5" />
                                  </g>

                                  {/* Cute Sparkle Stars */}
                                  <path d="M 36,45 Q 36,50 31,50 Q 36,50 36,55 Q 36,50 41,50 Q 36,50 36,45" fill="#facc15" opacity="0.9" />
                                  <path d="M 264,45 Q 264,50 259,50 Q 264,50 264,55 Q 264,50 269,50 Q 264,50 264,45" fill="#facc15" opacity="0.9" />
                                </svg>

                                {/* Huy hiệu trung tâm */}
                                <div className="absolute -top-1 bg-amber-400 text-slate-950 font-black text-sm px-4 py-1 rounded-full shadow-clay border-2 border-white animate-pulse select-none whitespace-nowrap">
                                  {cur.left} + {cur.right} = 10 ✨
                                </div>
                              </div>

                              {/* Right Ball */}
                              <div className="flex flex-col items-center gap-1.5 z-10">
                                <div className={cn('size-20 sm:size-24 rounded-full font-black text-3xl sm:text-4xl drop-shadow-md flex flex-col items-center justify-center shadow-clay border-4 border-white animate-bounce', cur.gradient)}>
                                  <span>{cur.right}</span>
                                  <span className="text-base sm:text-lg -mt-1">{cur.fruitEmoji}</span>
                                </div>
                                <span className="text-xs font-extrabold text-slate-800">
                                  {cur.right} {cur.fruitName}
                                </span>
                              </div>
                            </div>

                            {/* Fruit Quantities Visual Breakdown */}
                            <div className="bg-white/90 rounded-2xl border border-slate-200/80 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
                              <div className="flex items-center gap-1 flex-wrap justify-center min-h-8">
                                <span className="font-bold text-slate-500 mr-1">Trái:</span>
                                {cur.leftFruits.map((f, i) => (
                                  <span key={`lf-${i}`} className="text-lg animate-in zoom-in-50">{f}</span>
                                ))}
                              </div>
                              <span className="font-black text-brand-600 text-sm sm:text-base">+</span>
                              <div className="flex items-center gap-1 flex-wrap justify-center min-h-8">
                                <span className="font-bold text-slate-500 mr-1">Phải:</span>
                                {cur.rightFruits.map((f, i) => (
                                  <span key={`rf-${i}`} className="text-lg animate-in zoom-in-50">{f}</span>
                                ))}
                              </div>
                              <span className="font-black text-brand-600 text-sm sm:text-base">=</span>
                              <div className="bg-brand-50 border border-brand-200 rounded-xl px-2.5 py-1 font-black text-brand-900 shrink-0">
                                10 {cur.fruitEmoji}
                              </div>
                            </div>

                            {/* Mee Tutor Clapping Mascot Banner */}
                            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-100/90 via-white to-pink-100/90 rounded-2xl border border-amber-300 p-3 text-left">
                              <AikidCatCharacter pose="celebrate" className="size-12 shrink-0 drop-shadow-xs" />
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wide block">
                                  Mèo Mee Cổ Vũ Bạn Thân:
                                </span>
                                <p className="text-xs sm:text-sm font-extrabold text-amber-950 leading-snug">
                                  {cur.meeQuote}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })()
                    ) : (
                      /* All 5 Pairs Grid Showcase */
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {RAINBOW_MAKE10_PAIRS.map((p) => (
                          <div
                            key={`all-p-${p.id}`}
                            onClick={() => setActiveRainbowPairId(p.id)}
                            className={cn(
                              'p-3.5 rounded-2xl border-2 flex items-center justify-between gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98 shadow-xs',
                              p.cardBg,
                              p.borderGlow,
                            )}
                          >
                            <div className={cn('size-10 rounded-full font-black text-sm flex items-center justify-center shadow-xs shrink-0', p.gradient)}>
                              {p.left}
                            </div>
                            <div className="flex-1 text-center min-w-0">
                              <span className="text-xs font-black text-slate-800 block">
                                {p.left} + {p.right} = 10
                              </span>
                              <span className="text-[11px] font-bold text-slate-500 truncate block">
                                {p.fruitEmoji} {p.fruitName}
                              </span>
                            </div>
                            <div className={cn('size-10 rounded-full font-black text-sm flex items-center justify-center shadow-xs shrink-0', p.gradient)}>
                              {p.right}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Olympic Math Formula Application Box */}
                    <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-300 rounded-2xl p-4 text-center space-y-1.5 shadow-xs">
                      <span className="text-[11px] font-black text-purple-900 uppercase tracking-wider flex items-center justify-center gap-1">
                        <Sparkles className="size-3.5 text-amber-500" />
                        <span>Ứng Dụng Olympic ASMO Tính Nhanh:</span>
                      </span>
                      <div className="text-sm sm:text-base font-black text-brand-900 leading-snug">
                        <AsmoFormula text="$1 + 3 + 5 + 7 + 9 = (1 + 9) + (3 + 7) + 5 = 10 + 10 + 5 = 25$" />
                      </div>
                      <p className="text-[11px] font-bold text-slate-600">
                        Nhóm cặp 🔴 (1, 9) và cặp 🟡 (3, 7) thành 10 trước giúp bé giải nhẩm ra kết quả trong 3 giây!
                      </p>
                    </div>
                  </div>
                )}

                {/* ── 9. COLUMN ADDITION VISUALIZER (CỘNG CỘT DỌC CÓ NHỚ) ── */}
                {lesson.visualType === 'column_add' && (
                  <div className="w-full max-w-md space-y-4">
                    <div className="bg-white p-5 rounded-3xl border-2 border-rose-200 shadow-sm space-y-3">
                      <div className="text-center text-xs font-black text-rose-900 uppercase tracking-wide">
                        <AsmoFormula text="Mô Hình Đặt Tính Cột Dọc: $48 + 37 = 85$" />
                      </div>

                      <div className="flex justify-center">
                        <div className="font-mono text-xl sm:text-2xl font-black text-slate-800 space-y-1 text-right inline-block bg-rose-50/50 p-4 rounded-2xl border border-rose-200">
                          {/* Carry Indicator */}
                          <div className="text-xs text-rose-600 font-bold tracking-widest text-right pr-6">
                            <span className="bg-rose-500 text-white rounded-full px-1.5 py-0.5 text-[10px] shadow-xs">
                              +1 nhớ
                            </span>
                          </div>
                          <div className="tracking-widest">
                            <span className="text-slate-500 text-sm font-sans mr-3">Hàng chục: 4 | Hàng đv:</span>
                            <span>4 8</span>
                          </div>
                          <div className="tracking-widest border-b-2 border-slate-800 pb-1">
                            <span className="text-rose-600 mr-4 font-bold">+</span>
                            <span>3 7</span>
                          </div>
                          <div className="tracking-widest text-emerald-700 font-black pt-1">
                            <span>8 5</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs font-bold text-slate-700 space-y-1">
                        <AsmoFormula text="🔹 Bước 1 (Hàng đơn vị): $8 + 7 = 15 \rightarrow$ Viết 5, nhớ 1 sang hàng chục." />
                        <AsmoFormula text="🔹 Bước 2 (Hàng chục): $4 + 3 = 7$, thêm 1 nhớ thành $8 \rightarrow$ Viết 8. Kết quả là 85." />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 10. COLUMN SUBTRACTION VISUALIZER (TRỪ MƯỢN CỘT DỌC) ── */}
                {lesson.visualType === 'column_sub' && (
                  <div className="w-full max-w-md space-y-4">
                    <div className="bg-white p-5 rounded-3xl border-2 border-amber-200 shadow-sm space-y-3">
                      <div className="text-center text-xs font-black text-amber-900 uppercase tracking-wide">
                        <AsmoFormula text="Mô Hình Đặt Tính Phép Trừ Có Mượn: $63 - 28 = 35$" />
                      </div>

                      <div className="flex justify-center">
                        <div className="font-mono text-xl sm:text-2xl font-black text-slate-800 space-y-1 text-right inline-block bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                          <div className="text-xs text-amber-600 font-bold tracking-widest text-right pr-6">
                            <span className="bg-amber-500 text-white rounded-full px-1.5 py-0.5 text-[10px] shadow-xs">
                              Mượn 1 chục (10)
                            </span>
                          </div>
                          <div className="tracking-widest">
                            <span className="text-slate-500 text-sm font-sans mr-3">Hàng chục: 6 | Hàng đv:</span>
                            <span>6 3</span>
                          </div>
                          <div className="tracking-widest border-b-2 border-slate-800 pb-1">
                            <span className="text-amber-600 mr-4 font-bold">−</span>
                            <span>2 8</span>
                          </div>
                          <div className="tracking-widest text-emerald-700 font-black pt-1">
                            <span>3 5</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs font-bold text-slate-700 space-y-1">
                        <AsmoFormula text="🔹 Bước 1: 3 không trừ được 8, mượn 1 chục thành 13: $13 - 8 = 5 \rightarrow$ Viết 5." />
                        <AsmoFormula text="🔹 Bước 2: 6 bớt 1 đã mượn còn 5: $5 - 2 = 3 \rightarrow$ Viết 3. Kết quả là 35." />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 11. TIMES TABLE 2-5 VISUALIZER (BẢNG NHÂN 2-5 NHẢY ẾCH) ── */}
                {lesson.visualType === 'times_table_25' && (
                  <div className="w-full max-w-lg space-y-4">
                    <div className="bg-white p-4 rounded-3xl border-2 border-emerald-200 shadow-sm space-y-3 text-center">
                      <div className="flex items-center justify-between text-xs font-extrabold text-emerald-900 border-b border-emerald-100 pb-2">
                        <span>Bảng Nhân {tableBase}: Nhịp Nhảy Số Học</span>
                        <div className="flex gap-1.5">
                          {[2, 3, 4, 5].map((b) => (
                            <button
                              key={`tbase-${b}`}
                              type="button"
                              onClick={() => setTableBase(b)}
                              className={cn(
                                'px-2 py-0.5 rounded-lg text-xs font-black cursor-pointer border',
                                tableBase === b
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-slate-100 text-slate-700 border-slate-200',
                              )}
                            >
                              Bảng {b}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Number Line Stepper */}
                      <div className="flex items-center justify-center gap-1.5 flex-wrap p-2">
                        {Array.from({ length: 6 }).map((_, idx) => {
                          const step = idx + 1
                          const val = tableBase * step
                          const isCurrent = step === tableMultiplier
                          return (
                            <button
                              key={`frog-step-${step}`}
                              type="button"
                              onClick={() => setTableMultiplier(step)}
                              className={cn(
                                'p-2 rounded-2xl flex flex-col items-center transition-all cursor-pointer border-2 min-w-14',
                                isCurrent
                                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-clay scale-105'
                                  : 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100',
                              )}
                            >
                              <span className="text-base">{isCurrent ? '🐸' : '🐾'}</span>
                              <span className="text-xs font-black">{val}</span>
                              <span className="text-[9px] opacity-80">{tableBase}×{step}</span>
                            </button>
                          )
                        })}
                      </div>

                      <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 font-display font-extrabold text-emerald-950 text-base">
                        {tableBase} × {tableMultiplier} = <span className="text-emerald-700 font-black underline">{tableBase * tableMultiplier}</span> (Ếch nhảy {tableMultiplier} bước {tableBase} đơn vị)
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 12. TIMES TABLE 6-9 VISUALIZER (BÍ THUẬT SỐ 9) ── */}
                {lesson.visualType === 'times_table_69' && (
                  <div className="w-full max-w-lg space-y-4">
                    <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-indigo-200 shadow-sm space-y-3 text-center">
                      <div className="text-xs font-black text-indigo-900 uppercase">
                        Bí Mật Đối Xứng Bảng Nhân 9: Tổng Chữ Số Luôn Bằng 9!
                      </div>

                      {/* Factor Selector */}
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((f) => (
                          <button
                            key={`t9-f-${f}`}
                            type="button"
                            onClick={() => setTable9Factor(f)}
                            className={cn(
                              'size-8 rounded-xl font-black text-xs cursor-pointer border transition-all',
                              table9Factor === f
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-105'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
                            )}
                          >
                            {f}
                          </button>
                        ))}
                      </div>

                      {/* Math Breakdown Card */}
                      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-200 p-4 space-y-2 text-xs sm:text-sm font-bold text-slate-800">
                        <div className="font-display font-black text-lg text-indigo-900">
                          <AsmoFormula text={`$9 \\times ${table9Factor} = ${9 * table9Factor}$`} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-left bg-white/90 p-2.5 rounded-xl border border-indigo-100">
                          <div>
                            <span className="text-slate-500 block">Hàng chục (n − 1):</span>
                            <span className="font-black text-indigo-700">{table9Factor} − 1 = {table9Factor - 1}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Hàng đơn vị (9 − chục):</span>
                            <span className="font-black text-purple-700">9 − {table9Factor - 1} = {9 - (table9Factor - 1)}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Kiểm tra: Chữ số hàng chục ({table9Factor - 1}) + đơn vị ({9 - (table9Factor - 1)}) = 9!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 13. PERIMETER & AREA VISUALIZER ── */}
                {lesson.visualType === 'perimeter_area' && (
                  <div className="w-full max-w-md space-y-4 text-center">
                    <div className="bg-white p-4 rounded-3xl border-2 border-teal-200 shadow-sm space-y-3">
                      <div className="text-xs font-black text-teal-900 uppercase">
                        Hình Chữ Nhật: Chiều Dài 4m × Chiều Rộng 3m
                      </div>

                      {/* SVG Grid Rectangle */}
                      <svg viewBox="0 0 160 120" className="w-48 mx-auto select-none drop-shadow-xs">
                        <rect x="10" y="10" width="140" height="90" fill="#ccfbf1" stroke="#0f766e" strokeWidth="3" rx="4" />
                        {/* Grid lines */}
                        {Array.from({ length: 3 }).map((_, i) => (
                          <line key={`gl-x-${i}`} x1={10 + (i + 1) * 35} y1="10" x2={10 + (i + 1) * 35} y2="100" stroke="#0d9488" strokeWidth="1" strokeDasharray="2 2" />
                        ))}
                        {Array.from({ length: 2 }).map((_, i) => (
                          <line key={`gl-y-${i}`} x1="10" y1={10 + (i + 1) * 30} x2="150" y2={10 + (i + 1) * 30} stroke="#0d9488" strokeWidth="1" strokeDasharray="2 2" />
                        ))}
                        <text x="80" y="8" fill="#0f766e" fontSize="10" fontWeight="900" textAnchor="middle">4m (Dài)</text>
                        <text x="5" y="58" fill="#0f766e" fontSize="10" fontWeight="900" textAnchor="middle" transform="rotate(-90 5 58)">3m (Rộng)</text>
                      </svg>

                      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                        <div className="bg-teal-50 border border-teal-200 rounded-xl p-2 text-teal-950">
                          <span className="block text-[10px] text-teal-700 uppercase">Chu vi (P):</span>
                          <span>(4 + 3) × 2 = 14m</span>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-emerald-950">
                          <span className="block text-[10px] text-emerald-700 uppercase">Diện tích (S):</span>
                          <span>4 × 3 = 12m²</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 14. 3D CUBE VISUALIZER ── */}
                {lesson.visualType === 'cube_3d' && (
                  <div className="w-full max-w-md space-y-4 text-center">
                    <div className="bg-white p-4 rounded-3xl border-2 border-indigo-200 shadow-sm space-y-3">
                      <div className="text-xs font-black text-indigo-900 uppercase">
                        Đếm Khối Lập Phương Theo Từng Tầng
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 text-xs font-bold text-indigo-950">
                          <span className="block text-[10px] text-indigo-600">Tầng 1 (Dưới):</span>
                          <span className="text-lg font-black">4 khối</span>
                        </div>
                        <span className="text-lg font-black text-indigo-500">+</span>
                        <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 text-xs font-bold text-indigo-950">
                          <span className="block text-[10px] text-indigo-600">Tầng 2 (Giữa):</span>
                          <span className="text-lg font-black">2 khối</span>
                        </div>
                        <span className="text-lg font-black text-indigo-500">+</span>
                        <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 text-xs font-bold text-indigo-950">
                          <span className="block text-[10px] text-indigo-600">Tầng 3 (Trên):</span>
                          <span className="text-lg font-black">1 khối</span>
                        </div>
                      </div>
                      <div className="bg-indigo-50 border border-indigo-300 rounded-2xl p-3 font-display font-extrabold text-indigo-950 text-base">
                        <AsmoFormula text="Tổng cộng: $4 + 2 + 1 = 7$ khối lập phương 🧊" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 15. MATCHSTICK & MAZE & OLYMPIC ARENA VISUALIZERS ── */}
                {lesson.visualType === 'matchstick' && (
                  <div className="w-full max-w-md space-y-3 text-center">
                    <div className="bg-white p-4 rounded-3xl border-2 border-amber-200 shadow-sm space-y-3">
                      <div className="text-xs font-black text-amber-900 uppercase">
                        Xếp 3 Ô Vuông Nối Tiếp Cần 10 Que Diêm
                      </div>
                      <div className="flex justify-center">
                        {renderMatchstickFigureSvg('square_flag', 6, { className: 'w-48 h-24' })}
                      </div>
                      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs font-bold text-amber-950">
                        <AsmoFormula text="Quy luật: Ô đầu tiên cần 4 que, mỗi ô tiếp theo cần thêm 3 que $\rightarrow 4 + 3 + 3 = 10$ que diêm!" />
                      </div>
                    </div>
                  </div>
                )}

                {lesson.visualType === 'olympic_arena' && (
                  <div className="w-full max-w-md space-y-3 text-center">
                    <div className="bg-gradient-to-r from-amber-100 via-yellow-50 to-sun-100 p-6 rounded-3xl border-2 border-amber-300 shadow-sm space-y-3">
                      <span className="text-5xl animate-bounce inline-block">🏆</span>
                      <h3 className="text-lg font-black text-amber-950">Đấu Trường Olympic ASMO Toàn Diện</h3>
                      <p className="text-xs font-bold text-amber-800">
                        Sẵn sàng thử thách bản thân với bộ câu hỏi Olympic chuẩn quốc tế cùng Mèo Mee!
                      </p>
                    </div>
                  </div>
                )}

                {/* 16. Fallback for any other custom visual types */}
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
                  lesson.visualType !== 'div_remainder' &&
                  lesson.visualType !== 'make10' &&
                  lesson.visualType !== 'column_add' &&
                  lesson.visualType !== 'column_sub' &&
                  lesson.visualType !== 'times_table_25' &&
                  lesson.visualType !== 'times_table_69' &&
                  lesson.visualType !== 'perimeter_area' &&
                  lesson.visualType !== 'cube_3d' &&
                  lesson.visualType !== 'matchstick' &&
                  lesson.visualType !== 'olympic_arena' && (
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

              {/* Đáy bài: Thẻ Bí Kíp Nhìn Hình 1 dòng ngắn (Elementary Cấp 1) hoặc Key Takeaways (Secondary / High) */}
              {isElementary ? (
                <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50 to-sky-50 border-2 border-emerald-300/80 p-3.5 sm:p-4 text-center shadow-xs">
                  <span className="font-display font-extrabold text-xs sm:text-sm text-slate-800 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-amber-800 font-black flex items-center gap-1">
                      <Sparkles className="size-4 text-amber-500" />
                      <span>Bí Kíp Nhìn Hình:</span>
                    </span>
                    {lesson.visualType === 'apple_drop' && (
                      <span className="text-rose-700 font-black">
                        🍎 {applesA} quả đỏ + {applesB} quả xanh = {applesA + applesB} quả táo tổng cộng ({applesA + applesB} quả táo thơm ngon)!
                      </span>
                    )}
                    {lesson.visualType === 'balloon_pop' && (
                      <span className="text-sky-700 font-black">
                        🎈 10 quả − {poppedBalloons.length} quả nổ = {10 - poppedBalloons.length} quả bóng bay xinh xắn!
                      </span>
                    )}
                    {lesson.visualType === 'cake_tray' && (
                      <span className="text-amber-700 font-black">
                        🍰 {cakeRows} hàng × {cakeCols} cột = {cakeRows * cakeCols} chiếc bánh thơm ngon!
                      </span>
                    )}
                    {(lesson.visualType === 'pizza_fraction' ||
                      lesson.visualType === 'compare_fractions' ||
                      lesson.visualType === 'fraction_add_sub' ||
                      lesson.visualType === 'fraction_of_number') && (
                      <span className="text-emerald-700 font-black">
                        🍕 Phân số trực quan: {pizzaShaded}/{pizzaSlices} chiếc bánh pizza!
                      </span>
                    )}
                    {(lesson.visualType === 'candy_division' || lesson.visualType === 'div_remainder') && (
                      <span className="text-purple-700 font-black">
                        🍬 {candyTotal} kẹo ÷ {candyPlates} đĩa = {Math.floor(candyTotal / candyPlates)} kẹo mỗi đĩa{candyTotal % candyPlates !== 0 ? ` (dư ${candyTotal % candyPlates} kẹo)` : ''}!
                      </span>
                    )}
                    {lesson.visualType === 'make10' && (
                      <span className="text-pink-700 font-black">
                        🌈 Bạn thân tròn 10: 1+9, 2+8, 3+7, 4+6, 5+5 luôn bằng 10!
                      </span>
                    )}
                    {lesson.visualType === 'times_table_25' && (
                      <span className="text-emerald-700 font-black">
                        🐸 {tableBase} × {tableMultiplier} = {tableBase * tableMultiplier} (Ếch nhảy {tableMultiplier} bước {tableBase} đơn vị)!
                      </span>
                    )}
                    {lesson.visualType === 'times_table_69' && (
                      <span className="text-indigo-700 font-black">
                        ✨ 9 × {table9Factor} = {9 * table9Factor} (chục {table9Factor - 1} + đv {9 - (table9Factor - 1)} = 9)!
                      </span>
                    )}
                    {lesson.visualType === 'column_add' && (
                      <span className="text-rose-700 font-black">
                        ➕ Cộng hàng đơn vị (8+7=15 viết 5 nhớ 1), cộng hàng chục (4+3+1=8) ➔ 85!
                      </span>
                    )}
                    {lesson.visualType === 'column_sub' && (
                      <span className="text-amber-700 font-black">
                        ➖ Mượn 1 chục: 13 − 8 = 5 (viết 5), 6 bớt 1 còn 5: 5 − 2 = 3 (viết 3) ➔ 35!
                      </span>
                    )}
                    {lesson.visualType === 'perimeter_area' && (
                      <span className="text-teal-700 font-black">
                        📐 Chu vi P = (4 + 3) × 2 = 14m · Diện tích S = 4 × 3 = 12m²!
                      </span>
                    )}
                    {lesson.visualType === 'analog_clock' && (
                      <span className="text-sky-700 font-black">
                        ⏰ Đồng hồ: {clockHour} giờ {clockMinute < 10 ? `0${clockMinute}` : clockMinute} phút!
                      </span>
                    )}
                    {lesson.visualType === 'balance_scale' && (
                      <span className="text-teal-700 font-black">
                        ⚖️ Cân thăng bằng: 1 Quả Dưa = 4 Quả Táo!
                      </span>
                    )}
                    {lesson.visualType === 'cube_3d' && (
                      <span className="text-indigo-700 font-black">
                        🧊 Đếm theo tầng: 4 + 2 + 1 = 7 khối lập phương!
                      </span>
                    )}
                    {lesson.visualType === 'matchstick' && (
                      <span className="text-amber-700 font-black">
                        🥢 Ô đầu 4 que, ô sau thêm 3 que ➔ 4 + 3 + 3 = 10 que diêm!
                      </span>
                    )}
                    {lesson.visualType !== 'apple_drop' &&
                      lesson.visualType !== 'balloon_pop' &&
                      lesson.visualType !== 'cake_tray' &&
                      lesson.visualType !== 'pizza_fraction' &&
                      lesson.visualType !== 'compare_fractions' &&
                      lesson.visualType !== 'fraction_add_sub' &&
                      lesson.visualType !== 'fraction_of_number' &&
                      lesson.visualType !== 'candy_division' &&
                      lesson.visualType !== 'div_remainder' &&
                      lesson.visualType !== 'make10' &&
                      lesson.visualType !== 'times_table_25' &&
                      lesson.visualType !== 'times_table_69' &&
                      lesson.visualType !== 'column_add' &&
                      lesson.visualType !== 'column_sub' &&
                      lesson.visualType !== 'perimeter_area' &&
                      lesson.visualType !== 'analog_clock' &&
                      lesson.visualType !== 'balance_scale' &&
                      lesson.visualType !== 'cube_3d' &&
                      lesson.visualType !== 'matchstick' && (
                        <span className="text-brand-700 font-black">{lesson.theory.title}</span>
                      )}
                  </span>
                </div>
              ) : (
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
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PHASE 2: 💡 MẸO MÈO MEE & BÍ KÍP (BÍ KÍP TÍNH NHANH)
          ══════════════════════════════════════════════════════════════════ */}
          {phase === 'tips' && (
            isElementary ? (
              <div className="rounded-3xl border-2 border-amber-300 shadow-clay bg-gradient-to-br from-amber-50 via-white to-pink-50 p-6 sm:p-8 space-y-6 text-center animate-fade-up">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-200/80 border border-amber-300 text-xs font-black text-amber-900 shadow-2xs">
                  <span>✨</span>
                  <span>Tranh Bí Kíp Mèo Mee</span>
                  <span>✨</span>
                </div>

                <div className="flex flex-col items-center justify-center gap-5">
                  <AikidCatCharacter pose={lesson.meeTip.pose} className="size-32 sm:size-40 drop-shadow-md animate-bounce" />

                  <div className="max-w-xl w-full bg-white/95 rounded-3xl border-2 border-amber-300 p-5 sm:p-6 shadow-clay space-y-3 text-center">
                    <span className="text-xs font-black text-amber-800 uppercase tracking-wide block">
                      🐱 Câu Thần Chú Mèo Mee:
                    </span>
                    <p className="text-base sm:text-xl font-black text-amber-950 italic leading-snug">
                      &quot;{lesson.meeTip.quote}&quot;
                    </p>
                    <div className="bg-amber-100/70 rounded-2xl p-3 border border-amber-200 text-xs sm:text-sm font-extrabold text-amber-900">
                      <AsmoFormula text={lesson.meeTip.storyAdvice} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
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
              </div>
            )
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PHASE 3: 🎮 THỰC HÀNH THAO TÁC (THAO TÁC TRỰC QUAN ĐA THỬ THÁCH)
          ══════════════════════════════════════════════════════════════════ */}
          {phase === 'practice' && (
            <div className="rounded-3xl border border-slate-200 shadow-clay bg-white p-5 sm:p-7 space-y-6 animate-fade-up">
              {/* Interactive Practice Workspace with 3-tier challenges & dynamic diagnostics */}
              <AsmoInteractivePracticeWorkspace
                lesson={lesson}
                onCompleteAllChallenges={() => {
                  setPracticeCompleted(true)
                  setMaxUnlockedPhase('quiz')
                }}
                onAdvanceToQuiz={() => advanceToPhase('quiz')}
              />
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

              {/* Quiz Immediate Feedback Banner */}
              {quizSubmitted && (
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
                          className="gap-2 rounded-2xl bg-white border-rose-200 text-rose-800 font-bold px-6 py-2.5 shadow-2xs cursor-pointer"
                        >
                          <RotateCcw className="size-4" />
                          <span>Thử Chọn Lại</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* ── 4. THANH FOOTER DUY NHẤT CHUẨN AI KIDS ── */}
        <footer className="shrink-0 flex flex-wrap items-center justify-between gap-3 pt-3 pb-1 border-t-2 border-slate-200/80 bg-white/95 backdrop-blur-md rounded-3xl px-4 sm:px-5 py-3 shadow-xs">
          {/* Bên Trái: Nút 🎓 Về bản đồ (hoặc ❮ Quay lại khi ở các phase sau) */}
          <div className="flex items-center gap-2">
            {phase === 'explore' ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/asmo/curriculum?stage=${stage.id}`)}
                className="gap-2 rounded-2xl cursor-pointer"
              >
                <Map className="size-4" />
                <span>🎓 Về bản đồ</span>
              </Button>
            ) : phase === 'tips' ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => advanceToPhase('explore')}
                className="gap-2 rounded-2xl cursor-pointer"
              >
                <ChevronLeft className="size-4" />
                <span>❮ Quay lại: Khám phá</span>
              </Button>
            ) : phase === 'practice' ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => advanceToPhase('tips')}
                className="gap-2 rounded-2xl cursor-pointer"
              >
                <ChevronLeft className="size-4" />
                <span>❮ Quay lại: Mẹo Mee</span>
              </Button>
            ) : (
              /* phase === 'quiz' or 'done' */
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (isQuizCorrect) {
                    navigate(`/asmo/curriculum?stage=${stage.id}`)
                  } else {
                    advanceToPhase('practice')
                  }
                }}
                className="gap-2 rounded-2xl cursor-pointer"
              >
                {isQuizCorrect ? (
                  <>
                    <Map className="size-4" />
                    <span>🎓 Về bản đồ</span>
                  </>
                ) : (
                  <>
                    <ChevronLeft className="size-4" />
                    <span>❮ Quay lại: Thực hành</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Bên Phải: Nút hành động tiếp theo rõ ràng */}
          <div className="flex items-center gap-2">
            {phase === 'explore' && (
              <Button
                type="button"
                variant="primary"
                onClick={() => advanceToPhase('tips')}
                className="gap-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold px-6 py-2.5 shadow-clay cursor-pointer"
              >
                <span>Tiếp tục: Mẹo Mèo Mee</span>
                <ArrowRight className="size-4" />
              </Button>
            )}

            {phase === 'tips' && (
              <Button
                type="button"
                variant="primary"
                onClick={() => advanceToPhase('practice')}
                className="gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 shadow-clay cursor-pointer"
              >
                <span>Bắt đầu Thực hành</span>
                <ArrowRight className="size-4" />
              </Button>
            )}

            {phase === 'practice' && (
              <Button
                type="button"
                variant="primary"
                onClick={() => advanceToPhase('quiz')}
                className="gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-6 py-2.5 shadow-clay cursor-pointer"
              >
                <span>Vào Thử tài Olympic ⭐⭐⭐</span>
                <ArrowRight className="size-4" />
              </Button>
            )}

            {phase === 'quiz' && (
              isQuizCorrect ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    if (nextLesson) {
                      navigate(`/asmo/curriculum/lesson/${nextLesson.id}`)
                    } else {
                      navigate(`/asmo/curriculum?stage=${stage.id}`)
                    }
                  }}
                  className="gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-coral-500 hover:brightness-105 text-slate-950 font-black shadow-clay px-7 py-2.5 text-base cursor-pointer animate-pop"
                >
                  <Star className="size-5 fill-slate-950 text-slate-950" />
                  <span>🌸 Hoàn thành &amp; Tiếp tục</span>
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  disabled={!selectedOptionId}
                  onClick={handleSubmitQuiz}
                  className="gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white font-extrabold shadow-clay px-7 py-2.5 text-base disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="size-5" />
                  <span>Nộp bài Thử tài</span>
                  <ArrowRight className="size-4" />
                </Button>
              )
            )}
          </div>
        </footer>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          RIGHT COLUMN: 30% SIDEBAR TRỢ GIẢNG MÈO MEE & MỤC TIÊU BÀI HỌC
      ══════════════════════════════════════════════════════════════════════ */}
      <aside
        className="w-full lg:w-[320px] shrink-0 self-start overflow-y-auto rounded-3xl border-2 border-brand-200 bg-white p-3.5 sm:p-4 shadow-clay space-y-3"
        aria-labelledby="asmo-sidebar-assistant-title"
      >
        {/* 1. MÈO MEE TRỢ GIẢNG: Linh vật + Bong bóng hướng dẫn */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <AikidCatCharacter pose={dynamicGuideCopy.pose} className="size-14 sm:size-16 shrink-0 drop-shadow-sm" />
          <div className="min-w-0 flex-1 text-left">
            <p className="flex items-center gap-1 text-xs font-black text-coral-600">
              <MessageCircle className="size-3.5" />
              <span>Mee đang hỗ trợ: Con làm được! 🐾</span>
            </p>
            <h2 id="asmo-sidebar-assistant-title" className="font-display text-sm sm:text-base font-extrabold text-slate-800 leading-tight">
              {dynamicGuideCopy.title}
            </h2>
          </div>
        </div>

        {/* Dynamic Mee speech balloon */}
        <div className="rounded-2xl bg-brand-50 border border-brand-100 p-3 text-left animate-pop">
          <p className="text-[11px] font-black text-brand-700 uppercase tracking-wider">
            {dynamicGuideCopy.eyebrow}
          </p>
          <p className="mt-1 text-xs font-bold leading-relaxed text-slate-700">
            <AsmoFormula text={dynamicGuideCopy.body} />
          </p>
        </div>

        {/* 2. HỘP GỢI Ý THÔNG MINH (Toggleable) */}
        <div className="space-y-2">
          <Button
            className="w-full gap-2 rounded-2xl text-xs font-bold py-2"
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

        {/* 3. MỤC TIÊU BÀI HỌC (Visual Milestone cho Cấp 1, Gạch đầu dòng cho Cấp 2-3) */}
        <section className="border-t border-slate-100 pt-3" aria-labelledby="asmo-goals-title">
          <h3 id="asmo-goals-title" className="font-display text-xs sm:text-sm font-extrabold text-slate-800">
            🎯 Mục tiêu bài học
          </h3>
          {isElementary ? (
            <div className="mt-2 rounded-2xl bg-amber-50/90 border-2 border-amber-200 p-2.5 flex items-center gap-2.5 shadow-2xs">
              <span className="text-2xl shrink-0 select-none">🌟</span>
              <span className="text-xs font-black text-amber-950 leading-snug">
                Khám phá hình ảnh trực quan, rinh trọn 3 Sao &amp; +{lesson.xpReward} XP cùng Mèo Mee!
              </span>
            </div>
          ) : (
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
          )}
        </section>

        {/* 4. PHẦN THƯỞNG TRẠM (+XP & Huy hiệu) */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-sun-50 border border-amber-200 p-2.5 sm:p-3 flex items-center gap-2.5">
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
