import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sparkles,
  Check,
  CheckCircle2,
  Trophy,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { AikiRule, AikiRuleQuestion } from '@/features/rules/types'
import { resolveLectureVideo } from '@/features/lesson/lib/lecture-video'
import { playInstantSound } from './LessonInteractiveSidebar'
import {
  ZicoDrawingFallback,
  SonetDrawingFallback,
  AiWarehouseVisual,
  KidBrainVisual,
} from './AikiRuleVisuals'

export interface AikiRuleVideoPlayerProps {
  rule: AikiRule
  className?: string
  seekTarget?: { sec: number; token: number } | null
  questions?: AikiRuleQuestion[]
  onOpenSidebarQuiz?: () => void
  activeSlideIndex?: number
  onSlideChange?: (index: number) => void
  selectedAnswer?: number | string | null
  onSelectOption?: (optionIndex: number) => void
  onPlayStateChange?: (isPlaying: boolean) => void
}

export function AikiRuleVideoPlayer({
  rule,
  className,
  seekTarget,
  questions,
  onOpenSidebarQuiz: _onOpenSidebarQuiz,
  activeSlideIndex,
  onSlideChange,
  selectedAnswer,
  onSelectOption,
  onPlayStateChange,
}: AikiRuleVideoPlayerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(activeSlideIndex ?? 0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const isWaitingQuizRef = useRef(false)
  const [quizNotice, setQuizNotice] = useState(false)

  const correctIdx = questions?.[0]?.correctIndex ?? 1

  // Resolve YouTube video if available
  const videoSource = useMemo(() => resolveLectureVideo(rule.videoUrl), [rule.videoUrl])
  const youtubeEmbedSrc = useMemo(() => {
    if (!videoSource || videoSource.kind !== 'youtube') return null
    try {
      const url = new URL(videoSource.src)
      url.searchParams.set('playsinline', '1')
      url.searchParams.set('enablejsapi', '1')
      return url.toString()
    } catch {
      return videoSource.src
    }
  }, [videoSource])

  // Helper to send postMessage to YouTube iframe
  const postToYouTube = useCallback((command: string, args: unknown[] = []) => {
    if (videoSource?.kind === 'youtube' && iframeRef.current?.contentWindow) {
      const payload = command === 'listening'
        ? { event: 'listening', id: 1 }
        : { event: 'command', func: command, args }
      iframeRef.current.contentWindow.postMessage(JSON.stringify(payload), '*')
    }
  }, [videoSource?.kind])

  // Notify play state change to parent (e.g. for MeeCat interactive rig sync)
  useEffect(() => {
    onPlayStateChange?.(isPlaying)
  }, [isPlaying, onPlayStateChange])

  // Time and stage synchronization helper
  const syncTimeAndStage = useCallback((curTime: number) => {
    const curSec = Math.floor(curTime)
    setElapsedSec(curSec)
    const totalSlides = rule.slides.length || 5
    const slideDuration = rule.durationSec / totalSlides
    const nextIndex = Math.min(Math.floor(curSec / slideDuration), totalSlides - 1)

    // Auto pause cứng tại Chặng 1 (15s) cho câu đố nếu chưa trả lời đúng
    const correctIdx = questions?.[0]?.correctIndex ?? 1
    const isAnswerCorrect = selectedAnswer === correctIdx || selectedAnswer === String(correctIdx)
    if (curSec >= 15 && !isAnswerCorrect) {
      isWaitingQuizRef.current = true
      postToYouTube('pauseVideo')
      setIsPlaying(false)
      if (currentSlideIndex !== 1) {
        setCurrentSlideIndex(1)
        onSlideChange?.(1)
      }
      return
    }

    if (curSec < 15) {
      isWaitingQuizRef.current = false
    }

    if (nextIndex !== currentSlideIndex) {
      setCurrentSlideIndex(nextIndex)
      onSlideChange?.(nextIndex)
    }
  }, [currentSlideIndex, onSlideChange, rule.durationSec, rule.slides.length, selectedAnswer, postToYouTube, questions])

  // 2-way sync: Listen to YouTube IFrame API messages (onStateChange, infoDelivery)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      let data = event.data
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch {
          return
        }
      }
      if (!data || typeof data !== 'object') return

      const isAnswerCorrect = selectedAnswer === correctIdx || selectedAnswer === String(correctIdx)

      // Handle onStateChange
      if (data.event === 'onStateChange') {
        if (data.info === 1) {
          if (isWaitingQuizRef.current && !isAnswerCorrect) {
            postToYouTube('pauseVideo')
            setIsPlaying(false)
          } else {
            setIsPlaying(true)
          }
        } else if (data.info === 2 || data.info === 0) {
          setIsPlaying(false)
        }
      }

      // Handle infoDelivery
      if (data.event === 'infoDelivery' && data.info) {
        if (typeof data.info.playerState === 'number') {
          if (data.info.playerState === 1) {
            if (isWaitingQuizRef.current && !isAnswerCorrect) {
              postToYouTube('pauseVideo')
              setIsPlaying(false)
            } else {
              setIsPlaying(true)
            }
          } else if (data.info.playerState === 2 || data.info.playerState === 0) {
            setIsPlaying(false)
          }
        }
        if (typeof data.info.currentTime === 'number') {
          syncTimeAndStage(data.info.currentTime)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [syncTimeAndStage, selectedAnswer, postToYouTube, correctIdx])

  // Polling getCurrentTime every 500ms when isPlaying === true for YouTube
  useEffect(() => {
    if (!isPlaying || videoSource?.kind !== 'youtube') return
    postToYouTube('listening')
    const interval = setInterval(() => {
      postToYouTube('getCurrentTime')
    }, 500)
    return () => clearInterval(interval)
  }, [isPlaying, videoSource?.kind, postToYouTube])

  // When child selects answer: correct -> resume video immediately, wrong -> stay paused
  useEffect(() => {
    if (selectedAnswer === correctIdx || selectedAnswer === String(correctIdx)) {
      isWaitingQuizRef.current = false
      postToYouTube('playVideo')
      setIsPlaying(true)
    } else if (selectedAnswer !== null && selectedAnswer !== undefined) {
      isWaitingQuizRef.current = true
      postToYouTube('pauseVideo')
      setIsPlaying(false)
    }
  }, [selectedAnswer, postToYouTube, correctIdx])

  // Sync with external activeSlideIndex if provided (2-way sync - TUYỆT ĐỐI KHÔNG tự tiện kích hoạt play gây loop)
  useEffect(() => {
    if (
      typeof activeSlideIndex === 'number' &&
      activeSlideIndex >= 0 &&
      activeSlideIndex !== currentSlideIndex
    ) {
      const totalSlides = rule.slides.length || 5
      const safeIndex = Math.min(activeSlideIndex, totalSlides - 1)
      setCurrentSlideIndex(safeIndex)
      const targetSec = Math.round((safeIndex / totalSlides) * rule.durationSec)
      setElapsedSec(targetSec)
      if (targetSec < 15) {
        isWaitingQuizRef.current = false
      }
      postToYouTube('seekTo', [targetSec, true])
    }
  }, [activeSlideIndex, rule.durationSec, rule.slides.length, currentSlideIndex, postToYouTube])

  // Reset states when rule changes
  useEffect(() => {
    setCurrentSlideIndex(0)
    setIsPlaying(false)
    setElapsedSec(0)
    setIsSpeaking(false)
    isWaitingQuizRef.current = false
  }, [rule.id])

  // Handle external seek requests (e.g. from sidebar "Tua tới 0:38" or progress bar)
  useEffect(() => {
    if (seekTarget && typeof seekTarget.sec === 'number') {
      const targetSec = Math.max(0, Math.min(rule.durationSec, seekTarget.sec))
      setElapsedSec(targetSec)
      const totalSlides = rule.slides.length || 5
      const slideDuration = rule.durationSec / totalSlides
      const nextIndex = Math.min(Math.floor(targetSec / slideDuration), totalSlides - 1)
      setCurrentSlideIndex(nextIndex)
      onSlideChange?.(nextIndex)

      const isAnswerCorrect = selectedAnswer === correctIdx || selectedAnswer === String(correctIdx)
      if (targetSec < 15) {
        isWaitingQuizRef.current = false
      } else if (nextIndex === 1 && !isAnswerCorrect) {
        isWaitingQuizRef.current = true
      }

      postToYouTube('seekTo', [targetSec, true])

      if (isWaitingQuizRef.current && !isAnswerCorrect) {
        setIsPlaying(false)
        postToYouTube('pauseVideo')
      } else {
        setIsPlaying(true)
        postToYouTube('playVideo')
      }
    }
  }, [seekTarget, rule.durationSec, rule.slides.length, onSlideChange, postToYouTube, selectedAnswer, correctIdx])

  // Fallback timer simulation for canvas animation when not YouTube
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isPlaying && videoSource?.kind !== 'youtube') {
      interval = setInterval(() => {
        setElapsedSec((prev) => {
          if (prev >= rule.durationSec) {
            setIsPlaying(false)
            return rule.durationSec
          }
          const nextTime = prev + 1
          const totalSlides = rule.slides.length || 5
          const slideDuration = rule.durationSec / totalSlides
          const nextIndex = Math.min(Math.floor(nextTime / slideDuration), totalSlides - 1)

          const isAnswerCorrect = selectedAnswer === correctIdx || selectedAnswer === String(correctIdx)
          if (nextTime >= 15 && !isAnswerCorrect) {
            isWaitingQuizRef.current = true
            setIsPlaying(false)
            if (currentSlideIndex !== 1) {
              setCurrentSlideIndex(1)
              onSlideChange?.(1)
            }
            return 15
          }

          if (nextIndex !== currentSlideIndex) {
            setCurrentSlideIndex(nextIndex)
            onSlideChange?.(nextIndex)
          }
          return nextTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, videoSource?.kind, rule.durationSec, rule.slides.length, currentSlideIndex, onSlideChange, selectedAnswer, correctIdx])

  // Text-to-speech helper (AIKI voice)
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

  const handleReplayVideo = () => {
    setElapsedSec(0)
    setCurrentSlideIndex(0)
    isWaitingQuizRef.current = false
    setIsPlaying(true)
    onSlideChange?.(0)
    postToYouTube('seekTo', [0, true])
    postToYouTube('playVideo')
  }

  const togglePlayPause = () => {
    const isAnswerCorrect = selectedAnswer === correctIdx || selectedAnswer === String(correctIdx)
    if (!isPlaying) {
      if ((currentSlideIndex === 1 || elapsedSec >= 15) && isWaitingQuizRef.current && !isAnswerCorrect) {
        setQuizNotice(true)
        setTimeout(() => setQuizNotice(false), 3000)
        return
      }
      setIsPlaying(true)
      postToYouTube('playVideo')
    } else {
      setIsPlaying(false)
      postToYouTube('pauseVideo')
    }
  }

  const handleReadRule = () => {
    speakText(rule.audioVoiceText)
  }

  const handleSeek = (newTime: number) => {
    const target = Math.max(0, Math.min(rule.durationSec, newTime))
    setElapsedSec(target)
    const totalSlides = rule.slides.length || 5
    const slideDuration = rule.durationSec / totalSlides
    const nextIndex = Math.min(Math.floor(target / slideDuration), totalSlides - 1)
    setCurrentSlideIndex(nextIndex)
    onSlideChange?.(nextIndex)

    const isAnswerCorrect = selectedAnswer === correctIdx || selectedAnswer === String(correctIdx)
    if (target < 15) {
      isWaitingQuizRef.current = false
    } else if (nextIndex === 1 && !isAnswerCorrect) {
      isWaitingQuizRef.current = true
    }

    postToYouTube('seekTo', [target, true])

    if (isWaitingQuizRef.current && !isAnswerCorrect) {
      setIsPlaying(false)
      postToYouTube('pauseVideo')
    } else {
      setIsPlaying(true)
      postToYouTube('playVideo')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const currentSlide = rule.slides[currentSlideIndex] ?? rule.slides[0]

  // Timeline key markers (Tình huống, Câu đố, Quy tắc, Giải thích, Chốt)
  const timelineMarkers = useMemo(() => {
    const total = rule.slides.length || 1
    return rule.slides.map((s, idx) => {
      const sec = Math.round((idx / total) * rule.durationSec)
      let label = s.stage.replace(/^\d+\.\s*/, '')
      if (label.toLowerCase().includes('tình huống')) label = 'Tình huống'
      else if (label.toLowerCase().includes('câu đố')) label = 'Câu đố'
      else if (label.toLowerCase().includes('quy tắc')) label = 'Quy tắc 1'
      else if (label.toLowerCase().includes('giải thích')) label = 'Giải thích'
      else if (label.toLowerCase().includes('chốt') || label.toLowerCase().includes('nhắn')) label = 'Chốt'

      return {
        index: idx,
        sec,
        label,
        speaker: s.speaker,
      }
    })
  }, [rule])

  // Answer selection for Slide 1 (A/B comparison)
  const isSelectedSonet = selectedAnswer === 1 || selectedAnswer === '1'
  const isSelectedZico = selectedAnswer === 0 || selectedAnswer === '0'

  const renderSceneContent = () => (
    <>
      {/* ── STAGE 0: TÌNH HUỐNG (Zico & Sonet giằng co tranh, AIKI hốt hoảng) ─ */}
      {currentSlideIndex === 0 && (
        <div className="relative size-full flex items-center justify-center p-4 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60">
          {currentSlide?.image ? (
            <img
              src={currentSlide.image}
              alt="Tình huống Zico và Sonet giằng co tranh"
              className="size-full object-contain"
            />
          ) : (
            <div className="relative size-full max-w-2xl flex flex-col items-center justify-center text-center p-4 sm:p-6">
              <div className="flex items-center gap-4 sm:gap-8 mb-4">
                {/* Zico cãi nhau */}
                <div className="flex flex-col items-center gap-2 animate-bounce">
                  <div className="rounded-full bg-amber-100 border-2 border-amber-300 p-2 flex items-center justify-center shadow-md size-16 sm:size-20 lg:size-24 text-3xl sm:text-4xl lg:text-5xl">
                    👦
                  </div>
                  <span className="rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black px-3 py-1 shadow-sm">
                    Zico: "Của tớ đẹp hơn!"
                  </span>
                </div>

                {/* Tranh giằng co */}
                <div className="relative rounded-2xl bg-white border-2 border-dashed border-coral-400 text-coral-700 p-2 flex items-center justify-center shadow-clay rotate-[-6deg] animate-pulse size-20 sm:size-24 lg:size-28">
                  <span className="text-2xl sm:text-3xl">⚡📜⚡</span>
                  <div className="absolute -top-2 -right-2 bg-coral-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    Giằng co!
                  </div>
                </div>

                {/* Sonet cãi nhau */}
                <div className="flex flex-col items-center gap-2 animate-bounce" style={{ animationDelay: '200ms' }}>
                  <div className="rounded-full bg-brand-100 border-2 border-brand-300 p-2 flex items-center justify-center shadow-md size-16 sm:size-20 lg:size-24 text-3xl sm:text-4xl lg:text-5xl">
                    🧒
                  </div>
                  <span className="rounded-full bg-brand-100 border border-brand-300 text-brand-950 text-xs font-black px-3 py-1 shadow-sm">
                    Sonet: "Không, của tớ đúng hơn!"
                  </span>
                </div>
              </div>

              {/* AIKI hốt hoảng xuất hiện bên bảng */}
              <div className="rounded-3xl bg-white/95 border-2 border-amber-300 p-3 sm:p-4 max-w-lg shadow-clay animate-pulse">
                <div className="flex items-center justify-center gap-2 text-amber-950 font-black text-xs sm:text-base">
                  <span className="text-2xl">🐱</span>
                  <span>AIKI: "DỪNG LẠIII...! Các cậu ơi, hãy giúp tớ vụ này!"</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STAGE 1: CÂU ĐỐ CỦA AIKI (2 Tranh So Sánh A & B Tương Tác) ──── */}
      {currentSlideIndex === 1 && (
        <div className="relative size-full flex flex-col p-3 sm:p-5 bg-gradient-to-b from-amber-50/60 via-white to-brand-50/40">
          <div className="text-center mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 text-amber-950 shadow-clay font-black px-3.5 py-1 text-xs">
              <Sparkles size={12} className="fill-amber-950 text-amber-950" />
              Bức nào mới đúng yêu cầu của cô giáo? Bấm chọn đi nào!
            </span>
          </div>

          {/* 2 Tranh so sánh A vs B */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4 flex-1 min-h-0">
            {/* Bức Zico (Option A) */}
            <div
              onClick={() => {
                onSelectOption?.(0)
                playInstantSound('wrong')
                isWaitingQuizRef.current = true
                postToYouTube('pauseVideo')
                setIsPlaying(false)
              }}
              className={cn(
                'relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 flex flex-col group bg-amber-50/40 border-amber-200',
                isSelectedZico
                  ? 'border-amber-400 ring-4 ring-amber-400/40 scale-[0.98]'
                  : 'hover:border-amber-400/60'
              )}
            >
              <div className="absolute top-2 left-2 z-10 rounded-full bg-white/90 border border-amber-200 px-2.5 py-1 text-[11px] font-black text-amber-950 shadow-2xs backdrop-blur-md">
                A. Bức của Zico
              </div>
              <div className="flex-1 w-full overflow-hidden bg-amber-50/20">
                <ZicoDrawingFallback className="size-full min-h-0" />
              </div>
              <div className="text-amber-950 bg-white/95 border-t border-amber-200 p-2 text-center">
                <p className="text-[11px] sm:text-xs font-bold text-amber-950 break-words leading-snug">
                  Siêu anh hùng quen thuộc (gõ từ chung chung)
                </p>
              </div>
              {isSelectedZico && (
                <div className="absolute inset-0 bg-amber-950/20 flex items-center justify-center p-2 text-center backdrop-blur-2xs">
                  <span className="rounded-2xl bg-amber-400 text-amber-950 font-black text-xs px-3 py-1.5 shadow-lg">
                    Chưa đúng yêu cầu cô giáo rồi, thử lại nhé!
                  </span>
                </div>
              )}
            </div>

            {/* Bức Sonet (Option B - Đúng) */}
            <div
              onClick={() => {
                onSelectOption?.(1)
                playInstantSound('correct')
                playInstantSound('star')
                isWaitingQuizRef.current = false
                postToYouTube('playVideo')
                setIsPlaying(true)
              }}
              className={cn(
                'relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 cursor-pointer transition-all duration-300 flex flex-col group bg-amber-50/40 border-amber-200',
                isSelectedSonet
                  ? 'border-mint-500 ring-4 ring-mint-400/50 shadow-2xl scale-[1.02]'
                  : 'hover:border-mint-400/60'
              )}
            >
              <div className="absolute top-2 left-2 z-10 rounded-full bg-white/90 border border-amber-200 px-2.5 py-1 text-[11px] font-black text-amber-950 shadow-2xs backdrop-blur-md flex items-center gap-1">
                <span>B. Bức của Sonet</span>
                {isSelectedSonet && <Check size={13} className="text-mint-600 font-bold" />}
              </div>
              <div className="flex-1 w-full overflow-hidden bg-amber-50/20">
                <SonetDrawingFallback className="size-full min-h-0" />
              </div>
              <div className="text-amber-950 bg-white/95 border-t border-amber-200 p-2 text-center">
                <p className="text-[11px] sm:text-xs font-bold text-amber-950 break-words leading-snug">
                  Siêu anh hùng bố sợ gián, cầm vợt muỗi ✨
                </p>
              </div>
              {isSelectedSonet && (
                <div className="absolute inset-0 bg-mint-950/10 border-4 border-mint-500 pointer-events-none rounded-2xl sm:rounded-3xl flex items-center justify-center">
                  <div className="rounded-2xl bg-mint-500 text-white font-black text-xs sm:text-sm px-4 py-2 shadow-2xl flex items-center gap-2 animate-bounce">
                    <CheckCircle2 size={18} />
                    <span>Chính xác 100%! (+1 ⭐)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 2: QUY TẮC 1 (Bức Sonet sáng tick xanh, Poster trượt vào) ─ */}
      {currentSlideIndex === 2 && (
        <div className="relative size-full flex items-center justify-center p-3 sm:p-6 bg-gradient-to-br from-amber-100/70 via-cream-50 to-brand-100/50">
          <div className="relative max-w-2xl w-full flex flex-col items-center text-center p-4 sm:p-6 rounded-3xl bg-white/95 border-[3px] border-amber-300 shadow-clay">
            <div className="inline-flex items-center gap-2 rounded-full bg-mint-500 text-white px-4 py-1 text-xs sm:text-sm font-black shadow-md mb-3 animate-bounce">
              <CheckCircle2 size={16} />
              <span>ĐÁP ÁN CHÍNH LÀ BỨC CỦA SONET!</span>
            </div>

            <h2 className="font-display text-lg sm:text-2xl lg:text-3xl font-black text-brand-700 uppercase tracking-wide drop-shadow-xs leading-tight mb-2">
              QUY TẮC 1
            </h2>
            <p className="font-display text-base sm:text-xl lg:text-2xl font-black text-amber-950 leading-snug max-w-lg mb-4">
              "Hãy nghĩ ý tưởng của cậu, rồi mới chia sẻ với AIKI nhé!"
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-md pt-2 border-t border-amber-200 text-left">
              <div className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 p-2.5 shadow-2xs">
                <p className="text-[11px] font-black text-amber-900 mb-0.5">👦 Zico gõ trước:</p>
                <p className="text-[11px] text-amber-800">Ra nhân vật ai cũng vẽ được.</p>
              </div>
              <div className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 p-2.5 shadow-2xs">
                <p className="text-[11px] font-black text-brand-700 mb-0.5">🧒 Sonet nghĩ trước:</p>
                <p className="text-[11px] text-amber-800">Ra nhân vật chỉ mình bạn ấy nghĩ ra.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 3: GIẢI THÍCH (Kho hình AI vs Bộ não của con) ─────────── */}
      {currentSlideIndex === 3 && (
        <div className="relative size-full flex flex-col p-3 sm:p-5 bg-gradient-to-b from-amber-50/60 via-white to-sky-50/40">
          <div className="text-center mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 text-amber-950 shadow-clay font-black px-3.5 py-1 text-xs">
              💡 Bí Quyết Tư Duy: Kho Hình AI vs Đầu Của Con
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 flex-1 min-h-0">
            <div className="rounded-2xl sm:rounded-3xl border-2 border-amber-200 overflow-hidden bg-white shadow-2xs">
              <AiWarehouseVisual className="size-full min-h-0" />
            </div>
            <div className="rounded-2xl sm:rounded-3xl border-2 border-amber-200 overflow-hidden bg-white shadow-2xs">
              <KidBrainVisual className="size-full min-h-0" />
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 4: CHỐT (Poster Quy tắc 1, AIKI chong chóng tre bay lên) ─ */}
      {currentSlideIndex === 4 && (
        <div className="relative size-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-mint-50/70 via-white to-brand-50/60">
          <div className="relative max-w-xl w-full flex flex-col items-center text-center p-4 sm:p-6 rounded-3xl bg-white/95 border-2 border-mint-300 shadow-clay text-slate-800">
            {/* Chong chóng tre visual animation */}
            <div className="size-20 sm:size-24 rounded-full bg-brand-100 border-2 border-brand-300 p-3 flex flex-col items-center justify-center text-4xl mb-3 shadow-md animate-pulse">
              <span className="animate-spin text-2xl">🚁</span>
              <span>🐱</span>
            </div>

            <span className="rounded-full bg-brand-500 text-white text-xs font-black px-3.5 py-1 mb-2 shadow-xs">
              Lời dặn của Mèo AIKI
            </span>

            <p className="font-display text-sm sm:text-base lg:text-lg font-black text-amber-950 leading-relaxed mb-4 max-w-md">
              "Lần sau, cậu thử nghĩ xem nhân vật của mình có gì mà{' '}
              <span className="text-brand-600 underline underline-offset-4">
                KHÔNG GIỐNG ai hết
              </span>{' '}
              nhé. Còn bây giờ, tớ phải đi đây, hẹn gặp lại các cậu nhaaaa!"
            </p>

            <div className="flex items-center gap-2 text-xs font-black text-mint-800 bg-mint-100 border border-mint-300 px-3.5 py-1.5 rounded-full shadow-2xs">
              <Trophy size={14} />
              <span>Chúc mừng Hiệp Sĩ Sáng Tạo AIKI!</span>
            </div>
          </div>
        </div>
      )}

      {/* Live Subtitles (Karaoke Phân Vai) */}
      {currentSlide && currentSlideIndex !== 4 && (
        <div className="relative mt-1.5 p-2 bg-brand-900/90 rounded-xl text-white md:absolute md:inset-x-0 md:bottom-0 md:bg-gradient-to-t md:from-black/85 md:via-black/60 md:to-transparent md:p-3 md:sm:p-4 text-center pointer-events-none z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/80 border border-brand-300/60 px-3 py-0.5 text-xs font-black text-white mb-1 backdrop-blur-xs shadow-xs">
            <span>{currentSlide.stage}</span>
            <span>·</span>
            <span className="text-amber-300">{currentSlide.speaker}</span>
          </div>
          <p className="font-display text-xs sm:text-base font-bold text-white drop-shadow-md max-w-2xl mx-auto leading-snug break-words">
            "{currentSlide.dialogue}"
          </p>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* ── MAIN VIDEO BLOCK (16:9, Flat Layout, Full Width Cột Trái) ─────────── */}
      <div
        ref={containerRef}
        className={cn('w-full flex flex-col gap-2 sm:gap-2.5 min-h-0', className)}
        data-testid="aiki-rule-video-player"
      >
        {/* 16:9 Video Canvas */}
        <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-clay bg-[#fffdfa] select-none group border-[3px] border-amber-300 flex flex-col shrink-0 min-h-0">
          {/* Media & Dynamic Stage Scene Canvas */}
          <div className="relative flex-1 w-full flex items-center justify-center bg-[#fffdfa] overflow-hidden">
            {videoSource?.kind === 'youtube' && youtubeEmbedSrc ? (
              <div className="relative size-full">
                <iframe
                  ref={iframeRef}
                  className="size-full aspect-video bg-black"
                  src={youtubeEmbedSrc}
                  title={`Video bài giảng: ${rule.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  onLoad={() => postToYouTube('listening')}
                />
                {(currentSlideIndex === 1 || quizNotice) && (selectedAnswer !== correctIdx && selectedAnswer !== String(correctIdx)) && (
                  <div className="absolute inset-x-0 bottom-3 sm:bottom-4 z-20 mx-auto max-w-lg px-3 sm:px-4 pointer-events-auto">
                    <div className="rounded-2xl bg-white/95 border-2 border-brand-400 p-2.5 sm:p-3 shadow-clay flex items-center gap-2 animate-bounce">
                      <Sparkles className="size-5 text-amber-500 shrink-0" />
                      <p className="text-xs sm:text-sm font-black text-brand-900 leading-tight">
                        ❓ Tạm dừng câu đố! Con hãy chọn đáp án A hoặc B bên bảng tương tác để mở tiếp video nhé!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {renderSceneContent()}

                {/* Center Play/Pause overlay when paused */}
                {!isPlaying && (
                  <button
                    type="button"
                    onClick={() => {
                      const isAnswerCorrect = selectedAnswer === correctIdx || selectedAnswer === String(correctIdx)
                      if ((currentSlideIndex === 1 || elapsedSec >= 15) && isWaitingQuizRef.current && !isAnswerCorrect) {
                        setQuizNotice(true)
                        setTimeout(() => setQuizNotice(false), 3000)
                        return
                      }
                      setIsPlaying(true)
                    }}
                    aria-label="Phát video"
                    className="absolute inset-0 m-auto size-16 sm:size-20 flex items-center justify-center rounded-full bg-brand-500 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer z-20"
                  >
                    <Play size={32} className="translate-x-0.5 fill-white" />
                  </button>
                )}

                {quizNotice && (selectedAnswer !== correctIdx && selectedAnswer !== String(correctIdx)) && (
                  <div className="absolute inset-x-0 bottom-3 sm:bottom-4 z-30 mx-auto max-w-lg px-3 sm:px-4 pointer-events-auto">
                    <div className="rounded-2xl bg-amber-400 text-amber-950 border-2 border-amber-500 p-2.5 sm:p-3 shadow-clay flex items-center justify-center gap-2 animate-bounce">
                      <Sparkles className="size-5 text-amber-950 shrink-0" />
                      <p className="text-xs sm:text-sm font-black text-center leading-tight">
                        Con hãy chọn đáp án cho câu đố trước khi mở tiếp video nhé!
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Video Timeline & Controls (Clean & Integrated) */}
        <div className="flex flex-col gap-1.5 rounded-2xl bg-amber-50/60 border-2 border-amber-200 px-3 py-1.5 shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayPause}
              className="size-8 sm:size-9 rounded-xl sm:rounded-2xl bg-brand-500 text-white shadow-clay hover:bg-brand-600 active:scale-95 flex items-center justify-center cursor-pointer transition-all shrink-0"
              aria-label={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5 fill-white" />}
            </button>

            {/* Scrubbable Timeline Track with Stage Markers */}
            <div className="relative flex-1 py-1">
              <div
                className="relative h-4.5 w-full rounded-full bg-amber-100 border-2 border-amber-300 shadow-inner cursor-pointer flex items-center"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                  handleSeek(Math.floor(clickPos * rule.durationSec))
                }}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-brand-400 to-orange-400 transition-all duration-150 pointer-events-none"
                  style={{ width: `${Math.min(100, (elapsedSec / Math.max(1, rule.durationSec)) * 100)}%` }}
                />

                {/* Stage Marker Points */}
                {timelineMarkers.map((m) => {
                  const posPercent = (m.sec / Math.max(1, rule.durationSec)) * 100
                  const isPassed = elapsedSec >= m.sec
                  const isCurrent = currentSlideIndex === m.index
                  return (
                    <button
                      key={m.index}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSeek(m.sec)
                      }}
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-6 sm:size-7 rounded-full border-2 border-white shadow-clay flex items-center justify-center font-display font-black text-[11px] select-none transition-all duration-200 cursor-pointer',
                        isCurrent
                          ? 'bg-brand-500 text-white scale-125 ring-4 ring-brand-200 z-10 shadow-clay'
                          : isPassed
                            ? 'bg-amber-400 text-amber-950'
                            : 'bg-amber-100 border-amber-300 text-amber-700'
                      )}
                      style={{ left: `${posPercent}%` }}
                      title={`${formatTime(m.sec)}: ${m.label}`}
                    >
                      {m.index + 1}
                    </button>
                  )
                })}
              </div>
            </div>

            <span className="text-xs font-mono font-black text-amber-900 shrink-0">
              {formatTime(elapsedSec)} / {formatTime(rule.durationSec)}
            </span>
          </div>
        </div>

        {/* Action Buttons Below Video Player */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleReplayVideo}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-50 shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw size={14} className="text-amber-900" />
              <span>↺ Xem lại video</span>
            </button>

            <button
              type="button"
              onClick={handleReadRule}
              disabled={isSpeaking}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-900 hover:bg-amber-200 shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <Volume2 size={14} className="text-amber-900" />
              <span>🔊 Nghe AIKI đọc quy tắc</span>
            </button>

          </div>

          <span className="hidden xl:inline text-xs font-medium text-amber-800/80 italic">
            Video trình chiếu liên tục 5 chặng — con bấm tua xem lại bất kỳ lúc nào.
          </span>
        </div>
      </div>
    </>
  )
}
