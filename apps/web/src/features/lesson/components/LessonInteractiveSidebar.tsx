import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Award,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Square,
  Star,
  Target,
  Trophy,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import { MeeTutorAvatar, type MeeTutorPose } from './MeeTutorAvatar'
import { MeeCatInteractiveCanvas } from '@/features/mee-rig/components/MeeCatInteractiveCanvas'
import type { Gesture } from '@/features/mee-rig/hooks/useMeeCatSpeech'
import type { AikiRuleQuestion } from '@/features/rules/types'

export type Phase = 'learn' | 'game' | 'practice' | 'check' | 'done'
export type PoseType = MeeTutorPose

export { playInstantSound } from '@/features/lesson/lib/lesson-sound'
import { playInstantSound } from '@/features/lesson/lib/lesson-sound'

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

  // Aiki Rule Review Questions
  aikiQuestions?: AikiRuleQuestion[]
  aikiQuestionIndex?: number
  onSelectAikiQuestionIndex?: (index: number) => void
  onSeekVideo?: (sec: number) => void
  seekExplainSec?: number
  onAikiFinishAllQuestions?: () => void

  // Aiki Rule commitments
  hasAcknowledgedRule?: boolean
  onAcknowledgeRule?: () => void
  onOpenPosterModal?: () => void
  hasCommitted?: boolean
  onToggleCommit?: () => void
  onAikiFinish?: () => void
  busy?: boolean
  hideMascot?: boolean
  hideMascotAvatar?: boolean
  isVideoPlaying?: boolean
  onSpeakingChange?: (isSpeaking: boolean) => void
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
  isVideoPlaying = false,
  riddle,
  selectedAnswer: controlledSelected,
  onSelectAnswer,
  answerFeedback: controlledFeedback,
  isChecking = false,
  onNextStage,
  onRewardStar,
  liveStars = 0,
  aikiQuestions,
  aikiQuestionIndex: _aikiQuestionIndex,
  onSelectAikiQuestionIndex: _onSelectAikiQuestionIndex,
  onSeekVideo,
  seekExplainSec = 38,
  onAikiFinishAllQuestions: _onAikiFinishAllQuestions,
  hasAcknowledgedRule = false,
  onAcknowledgeRule,
  onOpenPosterModal,
  hasCommitted = false,
  onToggleCommit,
  onAikiFinish,
  busy = false,
  hideMascot = false,
  hideMascotAvatar = false,
  onSpeakingChange,
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

  const isAikiMode = Boolean(stages && stages.length > 0)
  const currentSelected = controlledSelected !== undefined && controlledSelected !== null ? Number(controlledSelected) : localSelected
  const currentFeedback = controlledFeedback || localFeedback

  // Aiki Stage 1 Quiz Option states
  const activeQuestion: AikiRuleQuestion = useMemo(() => {
    return (
      aikiQuestions?.[0] || {
        id: 'q1-1',
        prompt: 'Bức tranh nào mới đúng yêu cầu của cô giáo: "Vẽ nhân vật siêu anh hùng của con"?',
        options: [
          'Tranh của Zico (Siêu anh hùng áo choàng đỏ quen thuộc)',
          'Tranh của Sonet (Siêu anh hùng bố sợ gián, vỗ khẽ cái vợt muỗi)',
        ],
        correctIndex: 1,
        hint: 'Zico gõ trước nên ra nhân vật ai cũng vẽ được. Sonet nghĩ trước nên ra nhân vật chỉ mình bạn ấy nghĩ ra.',
        successFeedback:
          'Và... đáp án chính là bức của Sonet! Hãy nghĩ ý tưởng của cậu, rồi mới chia sẻ với AIKI nhé! Zico gõ trước nên ra nhân vật ai cũng vẽ được. Sonet nghĩ trước nên ra nhân vật chỉ mình bạn ấy nghĩ ra.',
        retryFeedback:
          'Gần đúng rồi! Nhưng tranh của Zico ai gõ "siêu anh hùng ngầu" cũng ra giống nhau. Còn cô giáo ra đề siêu anh hùng của con cơ mà!',
      }
    )
  }, [aikiQuestions])

  const [aikiQuizSelected, setAikiQuizSelected] = useState<number | null>(null)
  const [aikiQuizStatus, setAikiQuizStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle')

  // Sync external controlledSelected into aikiQuizSelected if provided
  useEffect(() => {
    if (controlledSelected !== undefined && controlledSelected !== null) {
      const optIdx = Number(controlledSelected)
      setAikiQuizSelected(optIdx)
      if (optIdx === activeQuestion.correctIndex) {
        setAikiQuizStatus('correct')
      } else {
        setAikiQuizStatus('incorrect')
      }
    }
  }, [controlledSelected, activeQuestion.correctIndex])

  const [isMuted, setIsMuted] = useState(false)
  const speechText = narrationText?.trim() || guideCopy.body

  // Determine dynamic Mee pose
  const dynamicPose: MeeTutorPose = useMemo(() => {
    if (currentStageIndex === 1) {
      if (aikiQuizStatus === 'correct') return 'celebrate'
      if (aikiQuizStatus === 'incorrect') return 'support'
      return 'thinking'
    }
    if (currentStageIndex === 2) return 'idea'
    if (currentStageIndex === 3) return 'guide'
    if (currentStageIndex === 4) return 'celebrate'
    return guideCopy.pose || 'guide'
  }, [currentStageIndex, aikiQuizStatus, guideCopy.pose])

  // Dynamic coach speech per stage
  const coachSpeech = useMemo(() => {
    if (isAikiMode) {
      if (currentStageIndex === 0) {
        return '🐱 AIKI: DỪNG LẠIII...! Các cậu ơi, hãy giúp tớ vụ này! Xem video bên trái để biết cô giáo ra đề gì nhé!'
      }
      if (currentStageIndex === 1) {
        if (aikiQuizStatus === 'correct') {
          return '🎉 Hoan hô con! Sonet nghĩ trước nên ra nhân vật chỉ mình bạn ấy nghĩ ra!'
        }
        if (aikiQuizStatus === 'incorrect') {
          return '💡 Gần đúng rồi! Đề bài là siêu anh hùng của con, hãy xem lại tranh Sonet nhé!'
        }
        return '🐱 AIKI: Đố các cậu nhé: Bức tranh nào mới đúng yêu cầu của cô giáo? Bấm chọn đi nào!'
      }
      if (currentStageIndex === 2) {
        return '⭐ Khắc ghi Quy tắc 1: Hãy nghĩ ý tưởng của cậu, rồi mới chia sẻ với AIKI nhé!'
      }
      if (currentStageIndex === 3) {
        return '💡 Bí quyết: Kho hình AI chỉ có mẫu quen thuộc, còn ý tưởng độc nhất nằm trong đầu con!'
      }
      if (currentStageIndex === 4) {
        return '🏆 Tuyệt vời! Lần sau cậu nhớ nghĩ nhân vật không giống ai nhé. Hẹn gặp lại các cậu nhaaaa!'
      }
    }
    return speechText
  }, [isAikiMode, currentStageIndex, aikiQuizStatus, speechText])

  // Stop speaking callback
  const stopSpeaking = useCallback(() => {
    setIsSpeaking(false)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }, [])

  // Speak text via Web Speech API (vi-VN with resume support against Chromium hang)
  const speakText = useCallback(
    (text: string) => {
      if (isMuted || !text.trim()) return
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

      try {
        window.speechSynthesis.cancel()
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume()
        }

        // Clean out emojis and speaker prefix for natural TTS reading
        const cleanText = text
          .replace(/^[🐱👦🧒⭐💡🏆🎉]+\s*/gu, '')
          .replace(/^AIKI:\s*/gi, '')
          .trim()

        if (!cleanText) return

        const utterance = new SpeechSynthesisUtterance(cleanText)
        utterance.lang = 'vi-VN'
        utterance.rate = 0.95
        utterance.pitch = 1.1

        utterance.onstart = () => {
          setIsSpeaking(true)
        }
        utterance.onend = () => {
          setIsSpeaking(false)
        }
        utterance.onerror = () => {
          setIsSpeaking(false)
        }

        window.speechSynthesis.speak(utterance)
      } catch (err) {
        console.warn('SpeechSynthesis error:', err)
        setIsSpeaking(false)
      }
    },
    [isMuted]
  )

  const handleToggleMute = useCallback(() => {
    if (!isMuted) {
      stopSpeaking()
      setIsMuted(true)
    } else {
      setIsMuted(false)
      speakText(coachSpeech)
    }
  }, [isMuted, stopSpeaking, speakText, coachSpeech])

  // Auto-read coach speech on stage change or new speech
  useEffect(() => {
    setHintTier(0)
    stopSpeaking()

    if (isMuted) return

    const timer = setTimeout(() => {
      speakText(coachSpeech)
    }, 150)

    return () => {
      clearTimeout(timer)
      stopSpeaking()
    }
  }, [currentStageIndex, coachSpeech, isMuted, speakText, stopSpeaking])

  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [stopSpeaking])

  useEffect(() => {
    onSpeakingChange?.(isSpeaking)
  }, [isSpeaking, onSpeakingChange])

  // Handle stage 1 Aiki Quiz selection
  const handleSelectAikiQuiz = (optIdx: number) => {
    playInstantSound('click')
    setAikiQuizSelected(optIdx)
    onSelectAnswer?.(optIdx)

    const isMatch = optIdx === activeQuestion.correctIndex
    if (isMatch) {
      setAikiQuizStatus('correct')
      playInstantSound('correct')
      playInstantSound('star')
      onRewardStar?.()
    } else {
      setAikiQuizStatus('incorrect')
      playInstantSound('wrong')
    }
  }

  const handleRetryQuiz = () => {
    setAikiQuizSelected(null)
    setAikiQuizStatus('idle')
    onSelectAnswer?.(-1)
  }

  // Handle regular riddle option selection
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
    const explanation =
      riddle?.explanation ||
      (matches
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

  const seekTimestampLabel = useMemo(() => {
    const mins = Math.floor(seekExplainSec / 60)
    const secs = seekExplainSec % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }, [seekExplainSec])

  return (
    <aside
      className={cn(
        'lesson-guide-panel relative shrink-0 overflow-hidden rounded-3xl border-2 border-brand-200 bg-white/95 shadow-clay backdrop-blur-md transition-all duration-300 flex flex-col justify-between',
        collapsed
          ? 'w-[76px] sm:w-[84px] p-2 sm:p-2.5 hover:shadow-clay-hover hover:border-brand-300 active:scale-[0.98] cursor-pointer select-none'
          : 'w-full xl:max-h-full xl:h-full p-3 sm:p-4',
        className,
      )}
      onClick={collapsed ? () => setCollapsed(false) : undefined}
      aria-labelledby="lesson-interactive-sidebar-title"
    >
      {collapsed ? (
        /* Collapsed minimal state - Soft Clay / Hallmark UI */
        <div
          role="button"
          tabIndex={0}
          onClick={() => setCollapsed(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setCollapsed(false)
            }
          }}
          className="flex flex-col items-center justify-between h-full min-h-[380px] sm:min-h-[420px] py-1 gap-3 w-full cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-2xl"
          title="Bấm để mở rộng hỗ trợ AIKI"
          aria-label="Mở rộng bảng hỗ trợ AIKI"
        >
          {/* Top: Avatar Mascot AIKI */}
          <div className="flex flex-col items-center gap-1.5 pt-1">
            <div className="relative group">
              {hideMascotAvatar ? (
                <div className="size-12 sm:size-14 rounded-2xl bg-amber-100 border-2 border-amber-300 grid place-items-center text-amber-800 shadow-xs group-hover:scale-105 transition-transform">
                  <Sparkles size={24} className="text-amber-600" />
                </div>
              ) : (
                <div className="relative">
                  <MeeTutorAvatar
                    pose={dynamicPose}
                    className="size-12 sm:size-14 transition-transform group-hover:scale-110 drop-shadow-md"
                    isSpeaking={isSpeaking}
                    speechText={coachSpeech}
                    gesture={gesture}
                    onSpeechEnd={() => setIsSpeaking(false)}
                  />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 size-3.5 sm:size-4 rounded-full bg-mint-500 ring-2 ring-white shadow-xs"
                    title="Trợ lý AIKI sẵn sàng"
                  />
                </div>
              )}
            </div>

            {/* Tag nhận diện Soft Clay */}
            <span className="font-display text-[10px] sm:text-[11px] font-black text-brand-800 tracking-tight text-center whitespace-nowrap px-1.5 py-0.5 rounded-full bg-brand-50 border border-brand-100 shadow-2xs">
              Hỗ trợ AIKI
            </span>
          </div>

          {/* Middle: Khối sao tiến độ */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-amber-800 bg-amber-50 border-2 border-amber-300 px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
              <span>⭐</span>
              <span>{liveStars}/3</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 tracking-tight">Tiến độ</span>
          </div>

          {/* Bottom: Nút mở rộng ở chân (Pill Soft Clay màu brand với icon ChevronLeft kèm chữ "Mở") */}
          <div className="flex items-center justify-center gap-1 w-full py-2 px-1.5 rounded-2xl border-2 border-brand-300 bg-brand-500 text-white font-black text-xs shadow-clay group-hover:bg-brand-600 transition-colors">
            <ChevronLeft size={16} className="shrink-0" />
            <span className="tracking-wide">Mở</span>
          </div>
        </div>
      ) : (
        /* Expanded full interactive state */
        <div className="flex flex-col gap-2.5 sm:gap-3 text-left h-full min-h-0 flex-1">
          {/* Header: Stage Title + Mute + Collapse button */}
          <div className="flex items-center justify-between gap-3 border-b-2 border-slate-100 pb-2 shrink-0">
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <h2
                id="lesson-interactive-sidebar-title"
                className="font-display text-sm sm:text-base font-black text-slate-900 leading-snug truncate"
              >
                {stages?.[currentStageIndex]
                  ? `Chặng ${currentStageIndex + 1}/5: ${stages[currentStageIndex].label}`
                  : guideCopy.title || `Chặng ${(currentStageIndex || 0) + 1}/5`}
              </h2>
              {liveStars > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-black text-amber-800 shadow-2xs shrink-0">
                  <Star className="size-3 fill-amber-400 text-amber-500" />
                  <span>{liveStars}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Nút Mute / Unmute */}
              <button
                type="button"
                onClick={handleToggleMute}
                className={cn(
                  'grid size-8 sm:size-9 place-items-center rounded-full border-2 transition-all cursor-pointer shadow-2xs active:scale-95',
                  isMuted
                    ? 'border-slate-300 bg-slate-100 text-slate-400 hover:bg-slate-200'
                    : isSpeaking
                      ? 'border-brand-400 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                      : 'border-brand-200 bg-white text-brand-700 hover:bg-brand-50',
                )}
                title={isMuted ? 'Bật tiếng AIKI (Unmute)' : 'Tắt tiếng AIKI (Mute)'}
                aria-label={isMuted ? 'Bật tiếng AIKI' : 'Tắt tiếng AIKI'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              {/* Nút Thu gọn trên desktop */}
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="hidden xl:grid size-8 sm:size-9 place-items-center rounded-full border-2 border-brand-200 bg-white text-brand-700 hover:bg-brand-50 transition cursor-pointer shadow-2xs active:scale-95"
                title="Thu gọn bảng tương tác"
                aria-label="Thu gọn"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Sân khấu Mèo AIKI Live Character Rig (Ẩn khi hideMascot === true) */}
          {!hideMascot && (
            <div className="flex flex-col items-center justify-center relative w-full pt-1 pb-1 shrink-0">
              <div className="w-full h-52 sm:h-60 relative flex items-center justify-center">
                <MeeCatInteractiveCanvas
                  variant="full-body"
                  transparentBackground={true}
                  state={isVideoPlaying || isSpeaking ? 'talk' : currentStageIndex === 4 ? 'celebrate' : 'idle'}
                  gesture={
                    currentStageIndex === 1
                      ? 'point-left'
                      : currentStageIndex === 2
                        ? 'explain'
                        : currentStageIndex === 3
                          ? 'think'
                          : currentStageIndex === 4
                            ? 'celebrate'
                            : 'point-left'
                  }
                  isSpeaking={isVideoPlaying || isSpeaking}
                  speechText={coachSpeech}
                  className="w-full h-full drop-shadow-md select-none pointer-events-none"
                />
              </div>
              {/* Badge trạng thái Mèo AIKI */}
              <div className="-mt-2 mb-1 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-amber-200 text-xs font-black text-amber-900 shadow-2xs">
                  <span className={cn("size-2 rounded-full", isVideoPlaying || isSpeaking ? "bg-mint-500 animate-pulse" : "bg-amber-400")} />
                  {isVideoPlaying || isSpeaking ? "Mèo AIKI đang giảng giải..." : "Gia sư AIKI đồng hành"}
                </span>
              </div>
            </div>
          )}

          {/* Coach Speech Bubble với Avatar Mèo AIKI Mini */}
          <div className="rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-cream-50 to-orange-50/70 p-2.5 sm:p-3 shadow-2xs animate-fade-up shrink-0">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="relative shrink-0">
                  <div className="size-8 sm:size-9 rounded-2xl border-2 border-amber-300 bg-amber-100 shadow-2xs overflow-hidden flex items-center justify-center">
                    <MeeTutorAvatar
                      pose={dynamicPose}
                      className="size-full scale-110"
                      isSpeaking={isSpeaking}
                      speechText={coachSpeech}
                      gesture={gesture}
                      onSpeechEnd={() => setIsSpeaking(false)}
                    />
                  </div>
                  {isSpeaking && (
                    <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-mint-500 border-2 border-white shadow-2xs animate-pulse" />
                  )}
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-900 leading-tight">
                    Lời thoại của AIKI
                  </p>
                  {isSpeaking && (
                    <span className="text-[10px] font-bold text-mint-600 block animate-pulse">
                      Đang trò chuyện...
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => (isSpeaking ? stopSpeaking() : speakText(coachSpeech))}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:text-brand-800 bg-brand-100/80 hover:bg-brand-200/80 px-2.5 py-1 rounded-full cursor-pointer transition-colors shadow-2xs"
                title={isSpeaking ? 'Dừng đọc' : 'Nghe AIKI đọc'}
              >
                {isSpeaking ? <Square size={11} /> : <RotateCcw size={11} />}
                <span>{isSpeaking ? 'Dừng' : 'Nghe lại'}</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-800 pl-0.5">
              {coachSpeech}
            </p>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              DÒNG CHẢY TƯƠNG TÁC LUÂN CHUYỂN ĐỘNG (DYNAMIC STREAM CARDS 5 CHẶNG)
             ══════════════════════════════════════════════════════════════════════ */}
          <div className="overflow-y-auto hidden-scrollbar flex-1 min-h-0 pr-1 space-y-3">

          {/* ── CHẶNG 0: TÌNH HUỐNG (Zico & Sonet giằng tranh) ────────────────── */}
          {isAikiMode && currentStageIndex === 0 && (
            <div className="flex flex-col gap-3.5 rounded-3xl border-2 border-brand-200 bg-brand-50/60 p-4 sm:p-5 shadow-clay animate-fade-up">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-800">
                  <BrainCircuit className="size-4 text-brand-600" />
                  Chặng 1: Tình Huống
                </span>
                <span className="rounded-full bg-brand-200 text-brand-800 text-[11px] font-black px-2.5 py-0.5">
                  1 / 5
                </span>
              </div>

              <div className="rounded-2xl bg-white border border-brand-200/80 p-3.5 space-y-2 text-slate-800">
                <div className="flex items-center gap-2 text-red-600 font-bold text-xs">
                  <span>⚡</span>
                  <span>Zico & Sonet đang giằng co tranh:</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold italic text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  "Của tớ đẹp hơn!" — "Không, của tớ đúng hơn!"
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                  🐱 AIKI hốt hoảng: <em>"DỪNG LẠIII...! Các cậu ơi, hãy giúp tớ vụ này!"</em>
                </p>
              </div>

              <p className="text-xs font-semibold text-slate-600 leading-snug">
                Cô giáo ra đề bài gì mà hai bạn lại tranh cãi nảy lửa thế nhỉ? Cùng bấm nút bên dưới để xem câu đố của AIKI nhé!
              </p>

              {onNextStage && (
                <Button
                  variant="primary"
                  className="w-full h-12 font-black text-sm rounded-2xl shadow-clay cursor-pointer flex items-center justify-center gap-2 mt-1 bg-brand-500 hover:bg-brand-600 text-white"
                  onClick={() => {
                    playInstantSound('click')
                    onNextStage(1)
                  }}
                >
                  <span>Giúp AIKI giải quyết ➔</span>
                  <ChevronRight className="size-5" />
                </Button>
              )}
            </div>
          )}

          {/* ── CHẶNG 1: CÂU ĐỐ CỦA AIKI (Tranh nào đúng yêu cầu cô giáo?) ───────── */}
          {isAikiMode && currentStageIndex === 1 && (
            <div className="flex flex-col gap-3.5 rounded-3xl border-2 border-brand-200/90 bg-white p-4 sm:p-5 shadow-clay animate-fade-up">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
                    ❓
                  </span>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-brand-600">
                      Chặng 2
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                      Câu Đố Của AIKI
                    </h3>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">
                  <Award className="size-3.5 text-amber-600" />
                  +1 ⭐
                </span>
              </div>

              {/* Đề bài câu hỏi */}
              <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-3 text-left space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-amber-900">
                  Đề bài của cô giáo:
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  "Vẽ nhân vật siêu anh hùng của con..."
                </p>
              </div>

              <p className="text-xs sm:text-sm font-black text-slate-800">
                Bức nào mới đúng yêu cầu của cô? Bấm chọn đi nào!
              </p>

              {/* 2 Lựa chọn A (Zico) vs B (Sonet) */}
              <div className="space-y-2.5">
                {activeQuestion.options.map((optText, optIdx) => {
                  const isSelected = aikiQuizSelected === optIdx
                  const isCorrectOpt = optIdx === activeQuestion.correctIndex
                  const isWrongSelection = aikiQuizStatus === 'incorrect' && isSelected
                  const isCorrectSelection = aikiQuizStatus === 'correct' && isSelected

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={aikiQuizStatus === 'correct'}
                      onClick={() => handleSelectAikiQuiz(optIdx)}
                      className={cn(
                        'w-full text-left p-3 sm:p-4 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all duration-200 flex flex-col gap-1 cursor-pointer shadow-xs active:scale-[0.99]',
                        // Normal state
                        aikiQuizStatus === 'idle' &&
                          !isSelected &&
                          'border-slate-200 bg-white text-slate-800 hover:border-brand-400 hover:bg-brand-50/40',
                        // Selected correct
                        isCorrectSelection || (aikiQuizStatus === 'correct' && isCorrectOpt)
                          ? 'border-mint-500 bg-mint-50 text-mint-950 ring-2 ring-mint-300 font-black'
                          : aikiQuizStatus === 'correct' && !isCorrectOpt
                            ? 'border-slate-100 bg-slate-50 text-slate-400 opacity-50'
                            : null,
                        // Selected incorrect
                        isWrongSelection && 'border-rose-400 bg-rose-50 text-rose-950 ring-2 ring-rose-200',
                        aikiQuizStatus === 'incorrect' && !isSelected && 'border-slate-200 bg-white text-slate-500 opacity-70',
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={cn(
                            'grid size-6 place-items-center rounded-xl text-xs font-black shrink-0 border mt-0.5',
                            isCorrectSelection || (aikiQuizStatus === 'correct' && isCorrectOpt)
                              ? 'bg-mint-500 text-white border-mint-600'
                              : isWrongSelection
                                ? 'bg-rose-500 text-white border-rose-600'
                                : 'bg-slate-100 text-slate-700 border-slate-200',
                          )}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-snug flex-1">{optText}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Phản hồi khi chọn sai */}
              {aikiQuizStatus === 'incorrect' && (
                <div className="flex flex-col gap-2 pt-1 animate-fade-up">
                  <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 text-xs sm:text-sm font-semibold text-amber-950 flex items-start gap-2">
                    <span className="text-xl">🐱</span>
                    <div>
                      <span className="font-black text-amber-900 block mb-0.5">AIKI mách nhỏ:</span>
                      {activeQuestion.retryFeedback}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRetryQuiz}
                      className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Thử chọn lại</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSeekVideo?.(seekExplainSec)}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>↺ Xem lại video</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Phản hồi khi chọn đúng */}
              {aikiQuizStatus === 'correct' && (
                <div className="flex flex-col gap-3 pt-1 animate-fade-up">
                  <div className="rounded-2xl border-2 border-mint-300 bg-mint-50 p-3.5 text-mint-950 text-xs sm:text-sm font-semibold flex items-start gap-2.5 shadow-2xs">
                    <CheckCircle2 className="size-5 text-mint-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-mint-900 block mb-1">
                        Chính xác 100%! (+1 ⭐)
                      </span>
                      {activeQuestion.successFeedback}
                    </div>
                  </div>

                  {onNextStage && (
                    <Button
                      variant="primary"
                      className="w-full h-12 rounded-2xl font-black text-sm shadow-clay cursor-pointer flex items-center justify-center gap-2 bg-mint-500 hover:bg-mint-600 text-white"
                      onClick={() => {
                        playInstantSound('click')
                        onNextStage(2)
                      }}
                    >
                      <span>Xem Quy Tắc Vàng ➔</span>
                      <ChevronRight className="size-5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── CHẶNG 2: QUY TẮC VÀNG (Poster trượt vào, nghĩ ý tưởng trước) ────── */}
          {isAikiMode && currentStageIndex === 2 && (
            <div className="flex flex-col gap-3.5 rounded-3xl border-2 border-amber-300 bg-amber-50/70 p-4 sm:p-5 shadow-clay animate-fade-up">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-amber-900">
                  <Star className="size-4 fill-amber-400 text-amber-600" />
                  Chặng 3: Khắc Ghi Quy Tắc 1
                </span>
                <span className="text-xs font-black text-amber-800">+1 ⭐</span>
              </div>

              {/* Mini Poster Card */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 p-4 text-center text-slate-950 shadow-md">
                <span className="inline-block rounded-full bg-white/90 text-amber-900 text-[10px] font-black px-2.5 py-0.5 mb-1.5 uppercase tracking-wider shadow-2xs">
                  Quy Tắc Sáng Tạo 1
                </span>
                <p className="font-display text-base sm:text-lg font-black text-slate-950 leading-snug">
                  "Hãy nghĩ ý tưởng của cậu, rồi mới chia sẻ với AIKI nhé!"
                </p>
              </div>

              <div className="space-y-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white/80 p-3 rounded-2xl border border-amber-200">
                <p>
                  👦 <strong>Zico gõ trước:</strong> Ra nhân vật ai cũng vẽ được (rập khuôn).
                </p>
                <p className="text-brand-900 font-bold">
                  🧒 <strong>Sonet nghĩ trước:</strong> Ra nhân vật chỉ mình bạn ấy nghĩ ra (độc nhất vô nhị)!
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                {onOpenPosterModal && (
                  <button
                    type="button"
                    className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 border border-amber-200 text-amber-900 font-bold text-xs transition cursor-pointer"
                    onClick={onOpenPosterModal}
                  >
                    🔍 Xem lại Poster phóng to
                  </button>
                )}

                <Button
                  variant="primary"
                  className="w-full h-12 font-black text-sm rounded-2xl shadow-clay cursor-pointer flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950"
                  onClick={() => {
                    playInstantSound('star')
                    onAcknowledgeRule?.()
                    onRewardStar?.()
                    onNextStage?.(3)
                  }}
                >
                  <Check className="size-4" />
                  <span>Con đã hiểu quy tắc (+1⭐) ➔</span>
                </Button>
              </div>
            </div>
          )}

          {/* ── CHẶNG 3: GIẢI THÍCH (Kho hình AI vs Bộ não của con) ─────────────── */}
          {isAikiMode && currentStageIndex === 3 && (
            <div className="flex flex-col gap-3.5 rounded-3xl border-2 border-sky-300 bg-sky-50/70 p-4 sm:p-5 shadow-clay animate-fade-up">
              <div className="flex items-center justify-between border-b border-sky-200/60 pb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-sky-900">
                  <Target className="size-4 text-sky-600" />
                  Chặng 4: Bí Quyết Tư Duy
                </span>
                <span className="text-xs font-black text-sky-800">4 / 5</span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                Đối chiếu giữa Kho hình trong đầu AI và Bộ não sáng tạo của con:
              </p>

              {/* 2 Khối so sánh */}
              <div className="space-y-2">
                <div className="rounded-2xl bg-white border border-slate-200 p-3 text-xs text-slate-700">
                  <p className="font-black text-slate-900 mb-1 flex items-center gap-1.5">
                    <span>📦</span>
                    <span>Kho Dữ Liệu Trong Đầu AIKI:</span>
                  </p>
                  <p className="leading-snug text-slate-600">
                    Gõ "siêu anh hùng ngầu" là AIKI lấy ngay cái quen thuộc nhất trong hàng trăm ngàn mẫu có sẵn ra.
                  </p>
                </div>

                <div className="rounded-2xl bg-white border border-mint-200 p-3 text-xs text-slate-700">
                  <p className="font-black text-mint-900 mb-1 flex items-center gap-1.5">
                    <span>🧠</span>
                    <span>Bộ Não Sáng Tạo Của Bé:</span>
                  </p>
                  <p className="leading-snug text-mint-950 font-semibold">
                    Cái sợ con gián, cái vợt muỗi ấy — chỉ có trong đầu con thôi, AI chịu không thể tự đoán được!
                  </p>
                </div>
              </div>

              {onNextStage && (
                <Button
                  variant="primary"
                  className="w-full h-12 font-black text-sm rounded-2xl shadow-clay cursor-pointer flex items-center justify-center gap-2 mt-1 bg-sky-500 hover:bg-sky-600 text-white"
                  onClick={() => {
                    playInstantSound('click')
                    onNextStage(4)
                  }}
                >
                  <span>Xem lời dặn của AIKI ➔</span>
                  <ChevronRight className="size-5" />
                </Button>
              )}
            </div>
          )}

          {/* ── CHẶNG 4: CHỐT (Lời dặn của AIKI, Nhận Cúp Hiệp Sĩ) ──────────────── */}
          {isAikiMode && currentStageIndex === 4 && (
            <div className="flex flex-col gap-3.5 rounded-3xl border-2 border-mint-300 bg-mint-50/70 p-4 sm:p-5 shadow-clay animate-fade-up">
              <div className="flex items-center justify-between border-b border-mint-200/60 pb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-mint-900">
                  <Trophy className="size-4 text-mint-600" />
                  Chặng 5: Lời Nhắn Nhủ & Nhận Cúp
                </span>
                <span className="text-xs font-black text-mint-800">5 / 5</span>
              </div>

              {/* Lời nhắn nhủ AIKI */}
              <div className="rounded-2xl bg-white border border-mint-200 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-brand-800 font-black text-xs">
                  <span>🐱</span>
                  <span>Mèo AIKI vẫy tay chong chóng tre:</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed italic bg-brand-50/60 p-2.5 rounded-xl border border-brand-100">
                  "Lần sau, cậu thử nghĩ xem nhân vật của mình có gì mà{' '}
                  <strong className="text-brand-900">KHÔNG GIỐNG ai hết</strong> nhé. Còn bây giờ, tớ phải đi đây, hẹn gặp lại các cậu nhaaaa!"
                </p>
              </div>

              {/* Checkbox cam kết */}
              {onToggleCommit && (
                <label className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-mint-200 cursor-pointer shadow-2xs">
                  <input
                    type="checkbox"
                    checked={hasCommitted}
                    onChange={() => {
                      playInstantSound('star')
                      if (!hasCommitted) {
                        onRewardStar?.()
                      }
                      onToggleCommit()
                    }}
                    className="size-5 rounded text-mint-600 focus:ring-mint-400 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    Con hứa luôn nghĩ ý tưởng của mình trước khi nhờ AI ✨ (+1 ⭐)
                  </span>
                </label>
              )}

              {onAikiFinish && (
                <Button
                  variant="primary"
                  disabled={busy}
                  className="w-full h-12 font-black text-sm rounded-2xl shadow-clay cursor-pointer flex items-center justify-center gap-2 mt-1 bg-mint-500 hover:bg-mint-600 text-white"
                  onClick={() => {
                    playInstantSound('star')
                    onAikiFinish()
                  }}
                >
                  <Trophy className="size-5" />
                  <span>{busy ? 'Đang cấp chứng chỉ…' : '🏆 Nhận Cúp Hiệp Sĩ & Tiếp tục'}</span>
                </Button>
              )}
            </div>
          )}

          {/* ── BÀI HỌC THƯỜNG (NON-AIKI MODE FALLBACKS) ───────────────────────── */}
          {!isAikiMode && (
            <>
              {currentStageIndex === 1 && riddle && (
                <div className="flex flex-col gap-3 rounded-2xl border-2 border-brand-300 bg-white p-4 shadow-clay">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black uppercase text-brand-600">Câu đố phản xạ</span>
                    <span className="text-xs font-black text-amber-700">+1 ⭐</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">{riddle.question}</p>
                  <div className="space-y-2">
                    {riddle.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        className="w-full text-left p-3 rounded-xl border border-slate-200 text-xs font-semibold hover:border-brand-400"
                      >
                        {typeof opt === 'string' ? opt : opt.text || opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
            </>
          )}
          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              THẺ TIẾN ĐỘ & BÍ KÍP HIỆP SĨ (KNIGHT QUEST & TIP CARD Ở ĐÁY SIDEBAR)
             ══════════════════════════════════════════════════════════════════════ */}
          <div className="rounded-3xl border-2 border-amber-200/90 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 p-3 sm:p-3.5 shadow-clay shrink-0 mt-1 space-y-2.5">
            {/* Header: Badge Tiến độ + Số sao */}
            <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900 tracking-tight">
                <Trophy className="size-3.5 text-amber-600" />
                <span>Tiến độ Hiệp Sĩ Quy Tắc</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-[11px] font-black text-amber-900 shadow-2xs">
                <Star className="size-3 fill-amber-400 text-amber-500" />
                <span>{liveStars > 0 ? `${liveStars} Sao` : '⭐ 3 Sao'}</span>
              </span>
            </div>

            {/* Thanh 5 nấc tiến độ kẹo dẻo nhỏ */}
            <div className="flex items-center gap-1.5 py-0.5">
              {[0, 1, 2, 3, 4].map((stepIdx) => {
                const isPassedOrCurrent = currentStageIndex >= stepIdx
                const isCurrent = currentStageIndex === stepIdx
                return (
                  <button
                    key={stepIdx}
                    type="button"
                    onClick={() => {
                      playInstantSound('click')
                      onSelectStage?.(stepIdx)
                      onNextStage?.(stepIdx)
                    }}
                    title={`Chặng ${stepIdx + 1}${stages?.[stepIdx] ? `: ${stages[stepIdx].label}` : ''}`}
                    className={cn(
                      'flex-1 h-2.5 rounded-full transition-all duration-300 cursor-pointer',
                      isCurrent
                        ? 'bg-gradient-to-r from-amber-400 to-brand-500 ring-2 ring-brand-300 shadow-2xs scale-y-125'
                        : isPassedOrCurrent
                          ? 'bg-amber-400/90'
                          : 'bg-amber-100 border border-amber-200/70 hover:bg-amber-200'
                    )}
                  />
                )
              })}
            </div>

            {/* Mẹo vàng từ AIKI cho từng chặng (Contextual Tip) */}
            <div className="rounded-2xl bg-white/95 border border-amber-200/80 p-2.5 text-xs font-semibold text-amber-950 shadow-2xs flex items-start gap-2">
              <span className="text-base shrink-0 mt-[-1px]">💡</span>
              <p className="leading-snug flex-1">
                {currentStageIndex === 0 && 'Để ý kỹ: Tìm chi tiết khiến bức tranh của Sonet và Zico khác nhau nhé!'}
                {currentStageIndex === 1 && 'Bấm chọn tranh: Chọn bức tranh thể hiện ý tưởng độc nhất của con!'}
                {currentStageIndex === 2 && 'Khắc ghi: Đọc to Quy Tắc Vàng để nhớ câu thần chú sáng tạo!'}
                {currentStageIndex === 3 && 'Hiểu sâu: Biết lý do vì sao AI cần ý tưởng gốc từ con người!'}
                {currentStageIndex >= 4 && 'Tuyên thệ: Nhận cúp Hiệp Sĩ và sẵn sàng cho bài tiếp theo!'}
              </p>
            </div>

            {/* Cụm nút điều hướng chặng gắn liền đáy: [← Chặng trước] và [Chặng sau ➔ / 🏆 Nhận Cúp] */}
            <div className="flex items-center gap-2 pt-0.5">
              <Button
                variant="secondary"
                disabled={currentStageIndex === 0}
                onClick={() => {
                  if (currentStageIndex > 0) {
                    playInstantSound('click')
                    const targetIdx = currentStageIndex - 1
                    onSelectStage?.(targetIdx)
                    onNextStage?.(targetIdx)
                  }
                }}
                className={cn(
                  'flex-1 h-9 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border-2 transition-all cursor-pointer shadow-2xs',
                  currentStageIndex === 0
                    ? 'opacity-40 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                    : 'border-amber-200 bg-white text-amber-900 hover:bg-amber-50 active:scale-95'
                )}
              >
                <ChevronLeft size={14} />
                <span>Chặng trước</span>
              </Button>

              {currentStageIndex < 4 ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    playInstantSound('click')
                    const targetIdx = currentStageIndex + 1
                    onSelectStage?.(targetIdx)
                    onNextStage?.(targetIdx)
                  }}
                  className="flex-1 h-9 rounded-xl font-black text-xs flex items-center justify-center gap-1 bg-brand-500 hover:bg-brand-600 text-white shadow-clay transition-all cursor-pointer active:scale-95"
                >
                  <span>Chặng sau</span>
                  <ChevronRight size={14} />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  disabled={busy}
                  onClick={() => {
                    playInstantSound('star')
                    onAikiFinish?.()
                  }}
                  className="flex-1 h-9 rounded-xl font-black text-xs flex items-center justify-center gap-1 bg-mint-500 hover:bg-mint-600 text-white shadow-clay transition-all cursor-pointer active:scale-95"
                >
                  <Trophy size={14} />
                  <span>{busy ? 'Đang cấp chứng chỉ…' : '🏆 Nhận Cúp & Tiếp tục'}</span>
                </Button>
              )}
            </div>

          </div>
        </div>
      )}
    </aside>
  )
}
