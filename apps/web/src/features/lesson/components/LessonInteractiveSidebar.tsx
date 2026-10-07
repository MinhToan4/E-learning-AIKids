import { useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '@/features/lesson/lib/lesson-sound'
import type { MeeTutorPose } from './MeeTutorAvatar'
import type { AikiRuleQuestion } from '@/features/rules/types'
import {
  type Phase,
  type PoseType,
  type InteractiveRiddle,
  type LessonInteractiveSidebarProps,
  SidebarCollapsedView,
  SidebarMascotStage,
  AikiStreamCards,
  SidebarFooterProgress,
} from './interactive-sidebar'

export type { Phase, PoseType, InteractiveRiddle, LessonInteractiveSidebarProps }
export { playInstantSound }

export function LessonInteractiveSidebar({
  className,
  guideCopy,
  phase: _phase,
  maxUnlockedPhase: _maxUnlockedPhase,
  goals = [],
  product: _product,
  successCriteria: _successCriteria = [],
  narrationText,
  hints: _hints = [],
  autoRead: _autoRead = false,
  gesture = 'presentation',
  narrationKey: _narrationKey,
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
  hasAcknowledgedRule: _hasAcknowledgedRule = false,
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
  const [_localFeedback, setLocalFeedback] = useState<{ correct: boolean; explanation: string } | null>(null)
  const [_hintTier, setHintTier] = useState<number>(0)

  const isAikiMode = Boolean(stages && stages.length > 0)
  const _currentSelected = controlledSelected !== undefined && controlledSelected !== null ? Number(controlledSelected) : localSelected
  const _currentFeedback = controlledFeedback || _localFeedback

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
    [isMuted],
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

    const optId =
      typeof riddle?.options[idx] === 'object'
        ? (riddle?.options[idx] as { id?: string })?.id
        : undefined
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
        <SidebarCollapsedView
          onExpand={() => setCollapsed(false)}
          hideMascotAvatar={hideMascotAvatar}
          dynamicPose={dynamicPose}
          isSpeaking={isSpeaking}
          coachSpeech={coachSpeech}
          gesture={gesture}
          onSpeechEnd={() => setIsSpeaking(false)}
          liveStars={liveStars}
        />
      ) : (
        <div className="flex flex-col gap-2.5 sm:gap-3 text-left h-full min-h-0 flex-1">
          <SidebarMascotStage
            stages={stages}
            currentStageIndex={currentStageIndex}
            guideCopyTitle={guideCopy.title}
            liveStars={liveStars}
            isMuted={isMuted}
            isSpeaking={isSpeaking}
            onToggleMute={handleToggleMute}
            onCollapse={() => setCollapsed(true)}
            hideMascot={hideMascot}
            isVideoPlaying={isVideoPlaying}
            dynamicPose={dynamicPose}
            coachSpeech={coachSpeech}
            gesture={gesture}
            onSpeechEnd={() => setIsSpeaking(false)}
            onStopSpeaking={stopSpeaking}
            onSpeakText={speakText}
          />

          <AikiStreamCards
            isAikiMode={isAikiMode}
            currentStageIndex={currentStageIndex}
            activeQuestion={activeQuestion}
            aikiQuizSelected={aikiQuizSelected}
            aikiQuizStatus={aikiQuizStatus}
            onSelectAikiQuiz={handleSelectAikiQuiz}
            onRetryQuiz={handleRetryQuiz}
            onSeekVideo={onSeekVideo}
            seekExplainSec={seekExplainSec}
            onNextStage={onNextStage}
            onOpenPosterModal={onOpenPosterModal}
            onAcknowledgeRule={onAcknowledgeRule}
            onRewardStar={onRewardStar}
            hasCommitted={hasCommitted}
            onToggleCommit={onToggleCommit}
            onAikiFinish={onAikiFinish}
            busy={busy}
            riddle={riddle}
            goals={goals}
            onSelectOption={handleSelectOption}
          />

          <SidebarFooterProgress
            currentStageIndex={currentStageIndex}
            liveStars={liveStars}
            stages={stages}
            onSelectStage={onSelectStage}
            onNextStage={onNextStage}
            onAikiFinish={onAikiFinish}
            busy={busy}
          />
        </div>
      )}
    </aside>
  )
}
