import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  ArrowLeft,
  RotateCcw,
  Mic,
  Volume2,
  Check,
  X,
  Star,
  Zap,
  Award,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react'
import { AIKI_RULES_DATA } from '../data/rules-data'
import { useRulesProgress } from '../hooks/useRulesProgress'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { cn } from '@/shared/lib/cn'

type QuestionState = 'answering' | 'correct' | 'incorrect' | 'completed'

export type AikiRuleWorkspaceProps = {
  ruleId?: number
  courseId?: string
  onCompleteRule?: (ruleId: number) => void
  onBack?: () => void
  onNext?: (nextRuleId: number) => void
  backUrl?: string
  nextUrlPattern?: (nextRuleId: number) => string
}

export function AikiRuleWorkspace({
  ruleId = 1,
  courseId = 'aiki-rules',
  onCompleteRule,
  onBack,
  onNext,
  backUrl,
  nextUrlPattern,
}: AikiRuleWorkspaceProps) {
  const navigate = useNavigate()

  const safeRuleId = Math.max(1, Math.min(10, ruleId))

  const rule = useMemo(() => {
    return AIKI_RULES_DATA.find((r) => r.id === safeRuleId) ?? AIKI_RULES_DATA[0]
  }, [safeRuleId])

  const nextRule = useMemo(() => {
    return AIKI_RULES_DATA.find((r) => r.id === safeRuleId + 1)
  }, [safeRuleId])

  const { progress, completeRule } = useRulesProgress()

  // Video / Interactive Slide player state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Question interaction state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0) // 0 for Question 1, 1 for Question 2
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [questionState, setQuestionState] = useState<QuestionState>('answering')

  // Reset states when rule changes
  useEffect(() => {
    setCurrentSlideIndex(0)
    setIsPlaying(true)
    setElapsedSec(0)
    setIsSpeaking(false)
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setQuestionState('answering')
  }, [safeRuleId])

  const currentQuestion = rule.questions[currentQuestionIndex]

  // Timer simulation for presentation / video player
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedSec((prev) => {
          if (prev >= rule.durationSec) {
            return rule.durationSec
          }
          const nextTime = prev + 1
          const totalSlides = rule.slides.length
          const slideDuration = rule.durationSec / totalSlides
          const nextIndex = Math.min(Math.floor(nextTime / slideDuration), totalSlides - 1)
          setCurrentSlideIndex(nextIndex)
          return nextTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, rule.durationSec, rule.slides.length])

  // Text-to-speech helper (AKI voice)
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'vi-VN'
      utterance.rate = 1.0
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Handle replaying video from beginning
  const handleReplayVideo = () => {
    setElapsedSec(0)
    setCurrentSlideIndex(0)
    setIsPlaying(true)
  }

  // Handle AKI read rule
  const handleReadRule = () => {
    speakText(rule.audioVoiceText)
  }

  // Handle read current question
  const handleReadQuestion = () => {
    const questionSpeech = `${currentQuestion.prompt}. Lựa chọn: ${currentQuestion.options.join('. ')}`
    speakText(questionSpeech)
  }

  // Submit Answer
  const handleAnswer = () => {
    if (selectedOption === null) return

    if (selectedOption === currentQuestion.correctIndex) {
      setQuestionState('correct')
    } else {
      setQuestionState('incorrect')
    }
  }

  // Retry when wrong
  const handleRetry = () => {
    setSelectedOption(null)
    setQuestionState('answering')
  }

  // Next Question or Finish Rule
  const handleNextStep = () => {
    if (currentQuestionIndex === 0) {
      // Move to Question 2
      setCurrentQuestionIndex(1)
      setSelectedOption(null)
      setQuestionState('answering')
    } else {
      // Completed both questions!
      setQuestionState('completed')
      completeRule(rule.id)
      if (onCompleteRule) {
        onCompleteRule(rule.id)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const currentSlide = rule.slides[currentSlideIndex] ?? rule.slides[0]

  const defaultBackUrl = backUrl ?? (courseId ? `/world/${courseId}` : '/world')
  const getNextRuleUrl = (nextId: number) => {
    if (nextUrlPattern) return nextUrlPattern(nextId)
    return `/lesson/rule-${nextId}`
  }

  return (
    <div className="min-h-screen bg-[#f3f0ff] text-text flex flex-col selection:bg-brand-500 selection:text-white w-full">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/90 px-4 py-2.5 backdrop-blur-md sm:px-8 shadow-xs">
        <div className="mx-auto flex w-full items-center justify-between gap-3 max-w-7xl">
          {/* Left: Back & Rule Step info */}
          <div className="flex items-center gap-3 sm:gap-4">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:border-brand-300 hover:bg-slate-50 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Mười quy tắc</span>
                <span className="sm:hidden">Lộ trình</span>
              </button>
            ) : (
              <Link
                to={defaultBackUrl}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:border-brand-300 hover:bg-slate-50"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Mười quy tắc</span>
                <span className="sm:hidden">Lộ trình</span>
              </Link>
            )}

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-brand-200 bg-brand-100 px-2.5 py-0.5 text-xs font-black text-brand-800">
                QUY TẮC {rule.id} / 10
              </span>
              <span className="hidden rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 sm:inline-block">
                8 - 11 tuổi
              </span>
            </div>
          </div>

          {/* Center / Right: Question Counter, Stars & Avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800 shadow-2xs">
              {questionState === 'completed' ? 'Hoàn thành' : `Câu ${currentQuestionIndex + 1}/2`}
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 shadow-xs">
              <Star size={15} className="fill-amber-500 text-amber-500" />
              <span>{progress.totalStars} sao</span>
            </div>

            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-brand-200 bg-brand-50 shadow-xs">
              <AikidCatCharacter pose="welcome" className="h-full w-full object-cover scale-125 translate-y-1" />
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Full-Width Split Screen ──────────────────────────── */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Big Rule Title at Top */}
        <div className="mb-5 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-600">
            <span>Bí quyết vàng số {rule.id}</span>
            <span>·</span>
            <span className="text-muted normal-case font-bold">{rule.goal}</span>
          </div>
          <h1 className="mt-1 font-display text-xl sm:text-2xl lg:text-3xl font-black text-text leading-tight">
            {rule.title}
          </h1>
        </div>

        {/* 2 Columns Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto w-full items-start">
          {/* ══════════════════════════════════════════════════════════
              CỘT TRÁI (~62%): VIDEO BÀI GIẢNG QUY TẮC
             ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-4">
            {/* Video Player Box */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-border bg-slate-900 shadow-clay">
              {/* Media Display Area (16:9) */}
              <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
                {currentSlide.image ? (
                  <img
                    src={currentSlide.image}
                    alt={rule.title}
                    className="h-full w-full object-contain transition-all duration-700"
                  />
                ) : (
                  <img
                    src={rule.posterImage}
                    alt={rule.title}
                    className="h-full w-full object-contain opacity-90"
                  />
                )}

                {/* Subtitle / Dialogue Bar */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 sm:p-5 text-center">
                  <span className="inline-block rounded-full bg-brand-500/30 border border-brand-400/40 px-2.5 py-0.5 text-[11px] font-black text-white mb-1">
                    {currentSlide.stage} · {currentSlide.speaker}
                  </span>
                  <p className="font-display text-sm sm:text-base font-bold text-white drop-shadow-md">
                    "{currentSlide.dialogue}"
                  </p>
                </div>

                {/* Big Center Play/Pause button overlay if paused */}
                {!isPlaying && (
                  <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 m-auto h-16 w-16 flex items-center justify-center rounded-full bg-brand-500 text-white shadow-xl hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Play size={28} className="translate-x-0.5" />
                  </button>
                )}
              </div>

              {/* Video Timeline & Controls */}
              <div className="border-t border-slate-100 bg-white px-4 py-3 sm:px-5">
                {/* Progress Bar */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-slate-600 hover:text-brand-600 transition-colors cursor-pointer"
                    aria-label={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>

                  <div
                    className="relative h-2.5 flex-1 rounded-full bg-slate-100 border border-slate-200 cursor-pointer overflow-hidden"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const clickPos = (e.clientX - rect.left) / rect.width
                      const newTime = Math.floor(clickPos * rule.durationSec)
                      setElapsedSec(newTime)
                    }}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-mint-500"
                      style={{ width: `${(elapsedSec / rule.durationSec) * 100}%` }}
                    />
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-500">
                    {formatTime(elapsedSec)} / {formatTime(rule.durationSec)}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Action Buttons Below Player */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReplayVideo}
                  className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-brand-300 shadow-2xs transition-all cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>↺ Xem lại video</span>
                </button>

                <button
                  type="button"
                  onClick={handleReadRule}
                  disabled={isSpeaking}
                  className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-brand-300 bg-brand-100 px-3.5 py-2 text-xs font-black text-brand-800 hover:bg-brand-200 shadow-2xs transition-all cursor-pointer"
                >
                  <Mic size={14} />
                  <span>🎙️ Nghe AKI đọc quy tắc</span>
                </button>
              </div>

              <span className="text-[11px] font-medium text-muted italic">
                Video nằm yên ở đây suốt bài — con xem lại lúc nào cũng được.
              </span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              CỘT PHẢI (~38%): TƯƠNG TÁC CÙNG AKI
             ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 xl:col-span-5">
            <div className="rounded-3xl border-2 border-border bg-white p-5 sm:p-6 shadow-clay relative text-text">
              {/* ──────────────────────────────────────────────────────────
                  TRẠNG THÁI 4: HOÀN THÀNH 2 CÂU (Ăn mừng, thưởng Poster)
                 ────────────────────────────────────────────────────────── */}
              {questionState === 'completed' ? (
                <div className="space-y-6 py-2 text-center animate-pop">
                  {/* Pháo hoa chúc mừng */}
                  <div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-sun-400 to-coral-400 text-3xl shadow-clay animate-bounce">
                      🎉
                    </div>
                    <h2 className="mt-3 font-display text-2xl font-black text-text">
                      Con nhớ Quy tắc {rule.id} rồi!
                    </h2>
                    <p className="mt-1 text-xs text-muted font-medium">
                      Xuất sắc quá! Con đã trả lời đúng trọn vẹn và ghi nhớ quy tắc này!
                    </p>
                  </div>

                  {/* 3 Phần thưởng */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="rounded-2xl border-2 border-sun-300 bg-sun-50 p-3 text-center shadow-2xs">
                      <Star size={22} className="mx-auto fill-sun-500 text-sun-500" />
                      <span className="mt-1 block text-xs font-black text-sun-900">+3 sao</span>
                    </div>
                    <div className="rounded-2xl border-2 border-brand-300 bg-brand-50 p-3 text-center shadow-2xs">
                      <Zap size={22} className="mx-auto text-brand-600" />
                      <span className="mt-1 block text-xs font-black text-brand-900">+10 XP</span>
                    </div>
                    <div className="rounded-2xl border-2 border-mint-300 bg-mint-50 p-3 text-center shadow-2xs">
                      <Award size={22} className="mx-auto text-mint-600" />
                      <span className="mt-1 block text-xs font-black text-mint-900">
                        Poster số {rule.id}
                      </span>
                    </div>
                  </div>

                  {/* Poster thumbnail preview */}
                  <div className="relative overflow-hidden rounded-2xl border-2 border-sun-300 bg-sun-50/50 p-3 shadow-2xs">
                    <img
                      src={rule.posterImage}
                      alt={`Poster Quy tắc ${rule.id}`}
                      className="mx-auto max-h-40 rounded-xl object-contain shadow-xs"
                    />
                    <div className="mt-2 text-[11px] font-black text-amber-800">
                      📜 Đã thêm Poster số {rule.id} vào Bộ Sưu Tập!
                    </div>
                  </div>

                  {/* Next rule unlock card */}
                  {nextRule ? (
                    <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/70 p-3.5 text-left">
                      <span className="text-[10px] font-black uppercase tracking-wider text-brand-700">
                        QUY TẮC {nextRule.id} VỪA MỞ KHÓA
                      </span>
                      <p className="mt-0.5 text-xs font-bold text-text line-clamp-1">
                        {nextRule.title}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-mint-200 bg-mint-50 p-3.5 text-center">
                      <span className="text-xs font-black text-mint-800">
                        🏆 CHÚC MỪNG CON ĐÃ HOÀN THÀNH TOÀN BỘ 10 QUY TẮC VÀNG!
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2.5 pt-2">
                    {nextRule ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (onNext) {
                            onNext(nextRule.id)
                          } else {
                            navigate(getNextRuleUrl(nextRule.id))
                          }
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 py-3 text-sm font-black text-white shadow-clay active:scale-98 transition-all cursor-pointer"
                      >
                        <span>Mở Quy tắc {nextRule.id}</span>
                        <ChevronRight size={16} />
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => {
                        if (onBack) {
                          onBack()
                        } else {
                          navigate(defaultBackUrl)
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl border-2 border-border bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-brand-300 shadow-2xs transition-all cursor-pointer"
                    >
                      <span>Về mười quy tắc</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* ──────────────────────────────────────────────────────────
                    TRẠNG THÁI 1, 2, 3: TRẢ LỜI CÂU HỎI
                   ────────────────────────────────────────────────────────── */
                <div className="space-y-4">
                  {/* Header Question badge & Dots */}
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand-100 text-brand-800 font-black text-sm">
                        ?
                      </span>
                      <h2 className="font-display text-sm sm:text-base font-extrabold text-text">
                        Ôn lại một chút nhé
                      </h2>
                    </div>

                    {/* Câu 1 / 2 Dots */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-black transition-all',
                          currentQuestionIndex === 0
                            ? 'bg-brand-500 text-white shadow-2xs'
                            : 'bg-mint-500 text-white',
                        )}
                      >
                        1
                      </span>
                      <span
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-black transition-all',
                          currentQuestionIndex === 1
                            ? 'bg-brand-500 text-white shadow-2xs'
                            : 'bg-slate-200 text-slate-500',
                        )}
                      >
                        2
                      </span>
                    </div>
                  </div>

                  {/* Encouraging subtitle */}
                  <p className="text-[11px] font-bold text-muted">
                    Sai cũng không sao, con thử lại được
                  </p>

                  {/* Question Prompt */}
                  <div className="rounded-2xl bg-slate-50 p-4 border-2 border-slate-200">
                    <p className="font-display text-sm sm:text-base font-bold text-text leading-relaxed">
                      {currentQuestion.prompt}
                    </p>
                  </div>

                  {/* 3 Options (A, B, C) */}
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((optionText, idx) => {
                      const isSelected = selectedOption === idx
                      const isCorrect = idx === currentQuestion.correctIndex

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={questionState === 'correct'}
                          onClick={() => {
                            if (questionState === 'answering' || questionState === 'incorrect') {
                              setSelectedOption(idx)
                            }
                          }}
                          className={cn(
                            'w-full text-left p-3.5 rounded-2xl border-2 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-start gap-2.5 cursor-pointer',
                            // Default state
                            questionState === 'answering' &&
                              !isSelected &&
                              'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50/50 shadow-2xs',
                            // Selected before answer
                            questionState === 'answering' &&
                              isSelected &&
                              'border-brand-500 bg-brand-50 text-brand-900 font-black ring-2 ring-brand-200 shadow-xs',
                            // Trạng thái Đúng
                            questionState === 'correct' &&
                              isCorrect &&
                              'border-mint-500 bg-mint-50 text-mint-900 font-black ring-2 ring-mint-200',
                            questionState === 'correct' &&
                              !isCorrect &&
                              'border-slate-100 bg-slate-50 text-slate-400 opacity-60',
                            // Trạng thái Sai
                            questionState === 'incorrect' &&
                              isSelected &&
                              'border-coral-500 bg-coral-50 text-coral-900 font-black ring-2 ring-coral-200',
                            questionState === 'incorrect' &&
                              !isSelected &&
                              'border-slate-200 bg-white text-slate-500 opacity-80',
                          )}
                        >
                          <div className="mt-0.5 shrink-0">
                            {questionState === 'correct' && isCorrect ? (
                              <Check size={16} className="text-mint-600 stroke-[3]" />
                            ) : questionState === 'incorrect' && isSelected ? (
                              <X size={16} className="text-coral-600 stroke-[3]" />
                            ) : (
                              <div
                                className={cn(
                                  'h-4 w-4 rounded-full border-2 flex items-center justify-center text-[10px]',
                                  isSelected
                                    ? 'border-brand-500 bg-brand-500 text-white'
                                    : 'border-slate-300',
                                )}
                              >
                                {isSelected && '•'}
                              </div>
                            )}
                          </div>
                          <span className="leading-snug">{optionText}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Feedback Boxes */}
                  {/* Trạng thái Trả lời Đúng */}
                  {questionState === 'correct' && (
                    <div className="rounded-2xl border-2 border-mint-200 bg-mint-50 p-4 text-xs text-mint-900 animate-pop">
                      <div className="flex items-center gap-1.5 font-black text-mint-800 text-sm">
                        <span>✓ Con chọn đúng rồi!</span>
                      </div>
                      <p className="mt-1 font-medium leading-relaxed">
                        🎉 Giỏi quá con ơi! {currentQuestion.successFeedback}
                      </p>
                    </div>
                  )}

                  {/* Trạng thái Trả lời Sai */}
                  {questionState === 'incorrect' && (
                    <div className="rounded-2xl border-2 border-coral-200 bg-coral-50 p-4 text-xs text-coral-900 animate-pop">
                      <div className="flex items-center gap-1.5 font-black text-coral-800 text-sm">
                        <span>✕ Con vừa chọn ô này</span>
                      </div>
                      <p className="mt-1 font-medium leading-relaxed">
                        🐱 Gần đúng rồi đó! {currentQuestion.retryFeedback}
                      </p>
                    </div>
                  )}

                  {/* Hộp AKI mách nhỏ (khi chưa trả lời) */}
                  {questionState === 'answering' && (
                    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                      <span className="font-extrabold text-amber-800">🐱 AKI mách nhỏ: </span>
                      <span className="font-medium text-amber-900">{currentQuestion.hint}</span>
                    </div>
                  )}

                  {/* Bottom Action Controls */}
                  <div className="pt-2">
                    {questionState === 'answering' && (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleAnswer}
                          disabled={selectedOption === null}
                          className="flex-1 rounded-2xl bg-brand-500 hover:bg-brand-600 py-3 text-xs sm:text-sm font-black text-white shadow-clay active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Trả lời
                        </button>

                        <button
                          type="button"
                          onClick={handleReadQuestion}
                          className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-slate-700 hover:text-brand-700 hover:border-brand-300 shadow-2xs transition-colors cursor-pointer"
                          title="Nghe lại câu hỏi"
                        >
                          <Volume2 size={18} />
                        </button>
                      </div>
                    )}

                    {questionState === 'correct' && (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-mint-500 hover:bg-mint-600 py-3 text-sm font-black text-white shadow-clay active:scale-98 transition-all cursor-pointer"
                        >
                          <span>{currentQuestionIndex === 0 ? 'Câu tiếp theo' : 'Hoàn thành bài'}</span>
                          <ChevronRight size={16} />
                        </button>
                        <div className="text-center text-[11px] font-extrabold text-amber-600">
                          ⭐ Con vừa được +1 sao
                        </div>
                      </div>
                    )}

                    {questionState === 'incorrect' && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="w-full rounded-2xl bg-sun-500 hover:bg-sun-600 py-3 text-sm font-black text-white shadow-clay active:scale-98 transition-all cursor-pointer"
                      >
                        Thử lại
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
