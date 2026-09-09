import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Award,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Star,
  Target,
  Trophy,
  Volume2,
  XCircle,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import { MeeTutorAvatar, type MeeTutorPose } from './MeeTutorAvatar'
import type { Gesture } from '@/features/mee-rig/hooks/useMeeCatSpeech'
import { AsmoFormula } from '@/features/asmo/components/AsmoFormula'

export type Phase = 'learn' | 'game' | 'practice' | 'check' | 'done'
export type PoseType = MeeTutorPose

// Web Audio API zero-latency feedback sounds (<5ms)
function playInstantSound(type: 'correct' | 'wrong' | 'click' | 'star') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (type === 'correct') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12) // G5
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } else if (type === 'wrong') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(320, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.18)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.25)
    } else if (type === 'star') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(659.25, ctx.currentTime) // E5
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.15) // C6
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.35)
    } else {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.08)
    }
  } catch {
    // AudioContext blocked or not allowed yet
  }
}

export interface InteractiveRiddle {
  id: string
  title?: string
  question: string
  options: Array<{ id?: string; text?: string; label?: string; imageUrl?: string } | string>
  answer?: number | string
  explanation?: string
  meeHint?: string
  hints?: string[]
  steps?: Array<{ title: string; detail: string }>
}

export interface LessonInteractiveSidebarProps {
  className?: string
  guideCopy: {
    eyebrow: string
    title: string
    body: string
    pose: PoseType
  }
  phase: Phase
  maxUnlockedPhase: Phase
  goals?: string[]
  product?: string
  successCriteria?: string[]
  narrationText?: string
  hints?: string[]
  autoRead?: boolean
  gesture?: Gesture
  narrationKey?: string | number
  stages?: Array<{ id: string; label: string; kind?: string }>
  currentStageIndex?: number
  onSelectStage?: (index: number) => void
  isCollapsed?: boolean
  onToggleCollapse?: (collapsed: boolean) => void

  // Interactive Question & Challenge Action Card props
  riddle?: InteractiveRiddle
  selectedAnswer?: number | string | null
  onSelectAnswer?: (optionIndex: number, optionId?: string) => void
  answerFeedback?: { correct: boolean; explanation: string }
  isChecking?: boolean
  onNextStage?: (nextStageIndex: number) => void
  onRewardStar?: () => void
  liveStars?: number

  // Aiki Rule commitments
  hasAcknowledgedRule?: boolean
  onAcknowledgeRule?: () => void
  onOpenPosterModal?: () => void
  hasCommitted?: boolean
  onToggleCommit?: () => void
  onAikiFinish?: () => void
  busy?: boolean
}

export function LessonInteractiveSidebar({
  className,
  guideCopy,
  phase: _phase,
  maxUnlockedPhase: _maxUnlockedPhase,
  goals = [],
  product: _product,
  successCriteria: _successCriteria = [],
  narrationText,
  hints = [],
  autoRead = false,
  gesture = 'presentation',
  narrationKey,
  stages,
  currentStageIndex = 0,
  onSelectStage,
  isCollapsed,
  onToggleCollapse,
  riddle,
  selectedAnswer: controlledSelected,
  onSelectAnswer,
  answerFeedback: controlledFeedback,
  isChecking = false,
  onNextStage,
  onRewardStar,
  liveStars = 0,
  hasAcknowledgedRule = false,
  onAcknowledgeRule,
  onOpenPosterModal,
  hasCommitted = false,
  onToggleCommit,
  onAikiFinish,
  busy = false,
}: LessonInteractiveSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const collapsed = isCollapsed !== undefined ? isCollapsed : internalCollapsed
  const setCollapsed = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(collapsed) : val
    setInternalCollapsed(nextVal)
    onToggleCollapse?.(nextVal)
  }

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [localSelected, setLocalSelected] = useState<number | null>(null)
  const [localFeedback, setLocalFeedback] = useState<{ correct: boolean; explanation: string } | null>(null)
  const [hintTier, setHintTier] = useState<number>(0) // 0: hidden, 1: observation, 2: eliminate, 3: solution

  const currentSelected = controlledSelected !== undefined && controlledSelected !== null ? Number(controlledSelected) : localSelected
  const currentFeedback = controlledFeedback || localFeedback

  const isAikiMode = Boolean(stages && stages.length > 0)
  const isAnswered = currentSelected !== null && currentSelected !== undefined
  const isCorrect = isAnswered && (currentFeedback?.correct ?? (riddle?.answer !== undefined && currentSelected === Number(riddle.answer)))

  // Stop speaking callback
  const stopSpeaking = useCallback(() => {
    setIsSpeaking(false)
    window.speechSynthesis?.cancel()
  }, [])

  const speechText = narrationText?.trim() || guideCopy.body

  useEffect(() => {
    setHintTier(0)
    stopSpeaking()
    if (!autoRead || !speechText.trim()) return
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
    setIsSpeaking(true)
  }, [autoRead, narrationKey, speechText, stopSpeaking, currentStageIndex])

  useEffect(() => stopSpeaking, [stopSpeaking])

  // Handle option selection with instant feedback (<50ms)
  const handleSelectOption = (idx: number) => {
    if (isChecking) return
    playInstantSound('click')
    setLocalSelected(idx)

    const optId = typeof riddle?.options[idx] === 'object' ? (riddle?.options[idx] as { id?: string })?.id : undefined
    if (onSelectAnswer) {
      onSelectAnswer(idx, optId)
    }

    const correctIdx = Number(riddle?.answer ?? 0)
    const matches = idx === correctIdx
    const explanation = riddle?.explanation || (matches
      ? 'Chính xác! Con đã quan sát và tư duy rất sắc bén!'
      : 'Chưa đúng rồi! Con hãy xem gợi ý của Mee và quan sát lại tranh nhé!')

    setLocalFeedback({ correct: matches, explanation })

    if (matches) {
      playInstantSound('correct')
      playInstantSound('star')
      onRewardStar?.()
    } else {
      playInstantSound('wrong')
    }
  }

  // Determine dynamic Mee pose
  const dynamicPose: MeeTutorPose = useMemo(() => {
    if (isAnswered) {
      return isCorrect ? 'celebrate' : 'support'
    }
    if (currentStageIndex === 1) {
      return hintTier > 0 ? 'thinking' : 'guide'
    }
    return guideCopy.pose || 'guide'
  }, [isAnswered, isCorrect, currentStageIndex, hintTier, guideCopy.pose])

  // Dynamic speech line for Mee Coach
  const coachSpeech = useMemo(() => {
    if (currentStageIndex === 1 && riddle) {
      if (!isAnswered) {
        return '🐱 Mèo Mee: Con hãy quan sát 2 bức tranh bên trái và chọn phương án đúng nhất nhé!'
      }
      if (isCorrect) {
        return '🎉 Tuyệt đỉnh! Con tư duy siêu nhanh và chính xác 100% rồi!'
      }
      return '💡 Chưa đúng rồi nè! Cùng xem Mee hướng dẫn 3 bước sư phạm bên dưới nhé!'
    }
    return speechText
  }, [currentStageIndex, riddle, isAnswered, isCorrect, speechText])

  // 3-Tier Hint Ladder
  const hintLadder = useMemo(() => {
    const rawHints = riddle?.hints || hints
    const defaultObservation = '🔍 Tầng 1: Con hãy nhìn kỹ số lượng chi tiết hoặc hành động của nhân vật trong hình.'
    const defaultElimination = '💡 Tầng 2: Loại trừ phương án vẽ chung chung hoặc bắt chép tranh người khác.'
    const defaultSolution = riddle?.meeHint || '🌟 Tầng 3: Quy tắc vàng của Xưởng: Tả càng rõ, AI vẽ càng đúng!'

    return [
      rawHints[0] || defaultObservation,
      rawHints[1] || defaultElimination,
      rawHints[2] || defaultSolution,
    ]
  }, [riddle, hints])

  return (
    <aside
      className={cn(
        'lesson-guide-panel fixed bottom-20 right-3 z-30 max-h-[calc(100dvh-7rem)] shrink-0 self-start overflow-y-auto rounded-3xl border-2 border-brand-200 bg-white/95 p-4 shadow-clay backdrop-blur-md transition-all duration-300 lg:sticky lg:top-4 lg:bottom-auto lg:right-auto lg:z-auto',
        collapsed ? 'w-[68px] sm:w-[76px]' : 'w-[min(24rem,calc(100vw-1.5rem))] lg:w-[35%] xl:w-[34%]',
        className,
      )}
      aria-labelledby="lesson-interactive-sidebar-title"
    >
      {collapsed ? (
        /* Collapsed minimal state */
        <div className="flex flex-col items-center gap-3 py-1">
          <button
            type="button"
            className="group relative cursor-pointer"
            onClick={() => setCollapsed(false)}
            title="Mở rộng Trung tâm Tương tác Mee"
          >
            <MeeTutorAvatar
              pose={dynamicPose}
              className="size-12 sm:size-14 transition-transform group-hover:scale-110"
              isSpeaking={isSpeaking}
              speechText={coachSpeech}
              gesture={gesture}
              onSpeechEnd={() => setIsSpeaking(false)}
            />
            <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-mint-500 border-2 border-white shadow-2xs" />
          </button>
          <span className="font-display text-xs font-black text-brand-800">Mee AI</span>
          <div className="flex items-center gap-1 text-[11px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
            <Star className="size-3 fill-amber-400 text-amber-500" />
            <span>{liveStars}</span>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="grid size-10 place-items-center rounded-2xl border-2 border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 hover:scale-105 transition shadow-xs cursor-pointer"
            aria-label="Mở rộng sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      ) : (
        /* Expanded full interactive state */
        <div className="flex flex-col gap-4 text-left">
          {/* Header: Coach Mee Avatar + Title + Collapse button */}
          <div className="flex items-center justify-between gap-3 border-b-2 border-slate-100 pb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <MeeTutorAvatar
                  pose={dynamicPose}
                  className="size-14 sm:size-16"
                  isSpeaking={isSpeaking}
                  speechText={coachSpeech}
                  gesture={gesture}
                  onSpeechEnd={() => setIsSpeaking(false)}
                />
                <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-mint-500 text-white text-[10px] font-black border-2 border-white">
                  ✓
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-brand-100 px-2 py-0.5 text-[11px] font-black text-brand-800 uppercase tracking-wider">
                    <Sparkles className="size-3 text-brand-600 fill-brand-400" />
                    Coach Mee AI
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-800">
                    <Star className="size-3 fill-amber-500 text-amber-600" />
                    +{liveStars} ⭐
                  </span>
                </div>
                <h2
                  id="lesson-interactive-sidebar-title"
                  className="mt-1 font-display text-base sm:text-lg font-bold text-slate-900 leading-snug truncate"
                >
                  {guideCopy.title || 'Trung Tâm Tương Tác'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => (isSpeaking ? stopSpeaking() : setIsSpeaking(true))}
                className={cn(
                  'grid size-9 place-items-center rounded-xl border transition cursor-pointer',
                  isSpeaking
                    ? 'border-coral-300 bg-coral-50 text-coral-700 animate-pulse'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                )}
                title={isSpeaking ? 'Dừng đọc' : 'Nghe Coach Mee hướng dẫn'}
                aria-label={isSpeaking ? 'Dừng đọc' : 'Nghe Coach Mee hướng dẫn'}
              >
                {isSpeaking ? <Square size={15} /> : <Volume2 size={16} />}
              </button>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition cursor-pointer"
                title="Thu gọn bảng tương tác"
                aria-label="Thu gọn"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Coach Speech Bubble */}
          <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50/90 to-sky-50/70 p-3.5 shadow-2xs animate-fade-up">
            <p className="text-xs font-black uppercase tracking-wider text-brand-700 flex items-center gap-1.5">
              <MessageCircle className="size-3.5" />
              <span>Chỉ dẫn của Mee</span>
            </p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-800">
              {coachSpeech}
            </p>
          </div>

          {/* Mini Journey Steps Indicator (5 Chặng) */}
          {isAikiMode && stages && stages.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto hidden-scrollbar py-1">
              {stages.map((stg, idx) => {
                const isComplete = idx < currentStageIndex
                const isActive = idx === currentStageIndex
                return (
                  <button
                    key={stg.id || idx}
                    type="button"
                    onClick={() => onSelectStage?.(idx)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer truncate',
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-300'
                        : isComplete
                          ? 'bg-mint-100 text-mint-800 hover:bg-mint-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                    )}
                    title={stg.label}
                  >
                    <span>{idx + 1}.</span>
                    <span className="hidden sm:inline truncate">{stg.label.split(':')[0]}</span>
                    {isComplete && <Check className="size-3 text-mint-700 shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}

          {/* ── THẺ HÀNH ĐỘNG TƯƠNG TÁC (LessonInteractiveActionCard) ── */}
          {currentStageIndex === 1 && riddle ? (
            <div className="flex flex-col gap-3 rounded-2xl border-2 border-brand-300 bg-white p-4 shadow-clay animate-fade-up">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-xl bg-brand-500 text-white font-black text-xs shadow-xs">
                    Q2
                  </span>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-brand-600">
                      Thử thách chặng 2
                    </span>
                    <p className="text-xs font-bold text-slate-700">Câu đố phản xạ</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-sun-100 px-2.5 py-1 text-xs font-black text-amber-800">
                  <Award className="size-3.5 text-amber-600" />
                  +1 ⭐
                </span>
              </div>

              {/* Question prompt */}
              <div className="space-y-1">
                <p className="font-display text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {riddle.question}
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  👉 Chọn 1 đáp án dưới đây để nhận phản hồi tức thì:
                </p>
              </div>

              {/* Options A & B list */}
              <div className="flex flex-col gap-2.5 pt-1">
                {riddle.options.map((rawOpt, optIdx) => {
                  const optText = typeof rawOpt === 'string' ? rawOpt : (rawOpt.text || rawOpt.label || '')
                  const optLetter = String.fromCharCode(65 + optIdx)
                  const isThisSelected = currentSelected === optIdx
                  const isThisCorrect = optIdx === Number(riddle.answer ?? 0)

                  let optionStyle = 'border-slate-200 bg-slate-50/70 hover:bg-brand-50/50 hover:border-brand-300 text-slate-800'
                  if (isAnswered) {
                    if (isThisCorrect) {
                      optionStyle = 'border-mint-500 bg-mint-50 text-mint-950 font-bold ring-2 ring-mint-300 shadow-sm'
                    } else if (isThisSelected && !isThisCorrect) {
                      optionStyle = 'border-coral-400 bg-coral-50 text-coral-950 ring-2 ring-coral-300'
                    }
                  } else if (isThisSelected) {
                    optionStyle = 'border-brand-500 bg-brand-50 text-brand-950 font-bold ring-2 ring-brand-300'
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isChecking}
                      onClick={() => handleSelectOption(optIdx)}
                      className={cn(
                        'group flex items-start gap-3 rounded-2xl border-2 p-3 text-left transition-all duration-150 active:scale-[0.98] cursor-pointer',
                        optionStyle,
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-7 shrink-0 items-center justify-center rounded-xl font-black text-xs shadow-xs transition-colors',
                          isThisSelected
                            ? isThisCorrect
                              ? 'bg-mint-600 text-white'
                              : 'bg-coral-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 group-hover:border-brand-400',
                        )}
                      >
                        {optLetter}
                      </span>
                      <div className="flex-1 min-w-0 text-xs sm:text-sm font-semibold leading-snug">
                        <AsmoFormula text={optText} />
                      </div>
                      {isAnswered && (
                        <div className="shrink-0 mt-0.5">
                          {isThisCorrect ? (
                            <CheckCircle2 className="size-4.5 text-mint-600 animate-in zoom-in-50 duration-150" />
                          ) : isThisSelected ? (
                            <XCircle className="size-4.5 text-coral-500 animate-in zoom-in-50 duration-150" />
                          ) : null}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* 3-Tier Hint Ladder */}
              <div className="mt-1 flex flex-col gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <Lightbulb className="size-3 text-amber-500" />
                    Thang gợi ý Mee (3 Tầng)
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          playInstantSound('click')
                          setHintTier((prev) => (prev === t ? 0 : t))
                        }}
                        className={cn(
                          'px-2 py-0.5 rounded-lg text-[10px] font-black border transition cursor-pointer',
                          hintTier === t
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300',
                        )}
                      >
                        T{t}
                      </button>
                    ))}
                  </div>
                </div>

                {hintTier > 0 && (
                  <div className="mt-1 rounded-lg bg-amber-50/90 border border-amber-200 p-2 text-xs font-semibold text-amber-900 animate-fade-up">
                    <p>{hintLadder[hintTier - 1]}</p>
                  </div>
                )}
              </div>

              {/* 3-Step Pedagogical Explanation (Giải thích 3 bước khi đã trả lời) */}
              {isAnswered && (
                <div
                  className={cn(
                    'mt-1 rounded-2xl border-2 p-3.5 space-y-2 animate-fade-up text-xs sm:text-sm font-sans',
                    isCorrect
                      ? 'border-mint-300 bg-mint-50/80 text-mint-950'
                      : 'border-coral-200 bg-coral-50/80 text-coral-950',
                  )}
                >
                  <div className="flex items-center gap-1.5 font-black text-sm">
                    <span>{isCorrect ? '🎉' : '💡'}</span>
                    <span>
                      {isCorrect ? 'Tuyệt vời! Giải thích chi tiết:' : 'Chưa đúng rồi! Cùng phân tích nhé:'}
                    </span>
                  </div>

                  <div className="grid gap-2 pt-1 font-semibold text-xs leading-relaxed">
                    <div className="flex items-start gap-2 bg-white/70 p-2 rounded-xl border border-current/10">
                      <span className="font-black text-brand-700 shrink-0">Bước 1 (Nhận diện):</span>
                      <span>Quan sát kỹ câu lệnh và kết quả hình ảnh đối chiếu.</span>
                    </div>
                    <div className="flex items-start gap-2 bg-white/70 p-2 rounded-xl border border-current/10">
                      <span className="font-black text-amber-700 shrink-0">Bước 2 (Phân tích):</span>
                      <span>
                        {currentFeedback?.explanation ||
                          'AI chỉ vẽ theo dữ liệu cụ thể ta cung cấp; thiếu chi tiết AI sẽ tự đoán bừa.'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 bg-white/70 p-2 rounded-xl border border-current/10">
                      <span className="font-black text-mint-700 shrink-0">Bước 3 (Kết luận):</span>
                      <span>Luôn áp dụng công thức đầy đủ và không sao chép tác phẩm của người khác.</span>
                    </div>
                  </div>

                  {/* Nút Chuyển Chặng / Tiếp Tục */}
                  {onNextStage && (
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        className="w-full h-11 font-black text-sm rounded-xl shadow-clay cursor-pointer flex items-center justify-center gap-2"
                        onClick={() => {
                          playInstantSound('click')
                          onNextStage(currentStageIndex + 1)
                        }}
                      >
                        <span>Tiếp tục sang Chặng {currentStageIndex + 2}</span>
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : currentStageIndex === 0 ? (
            /* Action Card Chặng 0: Tình huống */
            <div className="flex flex-col gap-3 rounded-2xl border-2 border-brand-200 bg-brand-50/50 p-4 shadow-sm animate-fade-up">
              <div className="flex items-center gap-2 text-brand-800 font-black text-xs uppercase tracking-wider">
                <BrainCircuit className="size-4 text-brand-600" />
                <span>Nhiệm vụ Chặng 1: Tình huống</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                Các bạn nhỏ hãy lắng nghe kịch bản phân vai bên trái. Khi con đã sẵn sàng, hãy bấm nút dưới đây để bước vào Câu đố thử thách!
              </p>
              {onNextStage && (
                <Button
                  variant="primary"
                  className="w-full h-11 font-black text-sm rounded-xl shadow-clay cursor-pointer flex items-center justify-center gap-2 mt-1"
                  onClick={() => {
                    playInstantSound('click')
                    onNextStage(1)
                  }}
                >
                  <span>Sẵn sàng sang Câu đố phản xạ</span>
                  <ChevronRight className="size-4" />
                </Button>
              )}
            </div>
          ) : currentStageIndex === 2 ? (
            /* Action Card Chặng 2: Quy tắc Vàng */
            <div className="flex flex-col gap-3 rounded-2xl border-2 border-sun-300 bg-sun-50/60 p-4 shadow-sm animate-fade-up">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-sun-800">
                  <Star className="size-4 fill-sun-500 text-sun-600" />
                  Khắc ghi Quy tắc Vàng
                </span>
                <span className="text-xs font-black text-amber-700">+1 ⭐</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                Con đã đọc kỹ tấm Poster Quy tắc Vàng ở bên trái chưa? Hãy ghi nhớ vào sổ tay hiệp sĩ nhé!
              </p>
              <div className="flex flex-col gap-2 pt-1">
                {onOpenPosterModal && (
                  <Button
                    variant="secondary"
                    className="w-full h-10 font-bold text-xs rounded-xl cursor-pointer"
                    onClick={onOpenPosterModal}
                  >
                    Xem lại Poster phóng to
                  </Button>
                )}
                {onAcknowledgeRule && (
                  <Button
                    variant={hasAcknowledgedRule ? 'secondary' : 'primary'}
                    className="w-full h-11 font-black text-sm rounded-xl shadow-clay cursor-pointer flex items-center justify-center gap-2"
                    onClick={() => {
                      playInstantSound('star')
                      onAcknowledgeRule()
                      if (onNextStage) onNextStage(3)
                    }}
                  >
                    <Check className="size-4" />
                    <span>{hasAcknowledgedRule ? 'Đã ghi nhớ! Sang So sánh ➜' : 'Con đã hiểu & Khắc ghi (+⭐)'}</span>
                  </Button>
                )}
              </div>
            </div>
          ) : currentStageIndex === 3 ? (
            /* Action Card Chặng 3: Bảng So Sánh 2 Mặt Bản Chất */
            <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-300 bg-sky-50/60 p-4 shadow-sm animate-fade-up">
              <div className="flex items-center gap-2 text-sky-800 font-black text-xs uppercase tracking-wider">
                <Target className="size-4 text-sky-600" />
                <span>Phân tích bản chất AI</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                Đối chiếu giữa Kho dữ liệu AI và Bộ não con người. Con chính là thuyền trưởng chỉ huy trí tuệ nhân tạo!
              </p>
              {onNextStage && (
                <Button
                  variant="primary"
                  className="w-full h-11 font-black text-sm rounded-xl shadow-clay cursor-pointer flex items-center justify-center gap-2 mt-1"
                  onClick={() => {
                    playInstantSound('click')
                    onNextStage(4)
                  }}
                >
                  <span>Chuyển sang Chặng 5: Cam kết</span>
                  <ChevronRight className="size-4" />
                </Button>
              )}
            </div>
          ) : (
            /* Action Card Chặng 4: Cam kết Hiệp sĩ Sáng tạo */
            <div className="flex flex-col gap-3 rounded-2xl border-2 border-mint-300 bg-mint-50/60 p-4 shadow-sm animate-fade-up">
              <div className="flex items-center gap-2 text-mint-800 font-black text-xs uppercase tracking-wider">
                <Trophy className="size-4 text-mint-600" />
                <span>Lời tuyên thệ Hiệp sĩ Sáng tạo</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                Tích chọn cam kết để nhận huy hiệu hiệp sĩ và hoàn tất hành trình trạm hôm nay!
              </p>

              {onToggleCommit && (
                <label className="flex items-center gap-3 p-3 rounded-xl bg-white border border-mint-200 cursor-pointer shadow-2xs">
                  <input
                    type="checkbox"
                    checked={hasCommitted}
                    onChange={() => {
                      playInstantSound('star')
                      onToggleCommit()
                    }}
                    className="size-5 rounded text-mint-600 focus:ring-mint-400 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    Con hứa luôn tự nghĩ ý tưởng trước khi dùng AI ✨
                  </span>
                </label>
              )}

              {onAikiFinish && (
                <Button
                  variant="primary"
                  disabled={!hasCommitted || busy}
                  className="w-full h-12 font-black text-sm rounded-xl shadow-clay cursor-pointer flex items-center justify-center gap-2 mt-1"
                  onClick={() => {
                    playInstantSound('star')
                    onAikiFinish()
                  }}
                >
                  <Trophy className="size-4" />
                  <span>{busy ? 'Đang cấp chứng chỉ…' : 'Hoàn thành trạm & Nhận Cúp 🏆'}</span>
                </Button>
              )}
            </div>
          )}

          {/* Goal checklist footer */}
          {goals.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-xs">
              <span className="font-black text-slate-700 uppercase tracking-wider block mb-1.5">
                Mục tiêu trạm học
              </span>
              <ul className="space-y-1">
                {goals.slice(0, 3).map((g, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 font-medium text-slate-600">
                    <Check className="size-3.5 text-mint-600 shrink-0 mt-0.5" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
