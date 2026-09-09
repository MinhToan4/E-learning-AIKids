import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Mic } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { AikiRule } from '@/features/rules/types'

export interface AikiRuleVideoPlayerProps {
  rule: AikiRule
  className?: string
}

export function AikiRuleVideoPlayer({ rule, className }: AikiRuleVideoPlayerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Reset states when rule changes
  useEffect(() => {
    setCurrentSlideIndex(0)
    setIsPlaying(true)
    setElapsedSec(0)
    setIsSpeaking(false)
  }, [rule.id])

  // Timer simulation for presentation / video player
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedSec((prev) => {
          if (prev >= rule.durationSec) {
            setIsPlaying(false)
            return rule.durationSec
          }
          const nextTime = prev + 1
          const totalSlides = rule.slides.length || 1
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

  const handleReplayVideo = () => {
    setElapsedSec(0)
    setCurrentSlideIndex(0)
    setIsPlaying(true)
  }

  const handleReadRule = () => {
    speakText(rule.audioVoiceText)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const currentSlide = rule.slides[currentSlideIndex] ?? rule.slides[0]

  return (
    <div className={cn("space-y-3", className)} data-testid="aiki-rule-video-player">
      {/* Video Player Box 16:9 */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-border bg-slate-900 shadow-clay">
        {/* Media Display Area (16:9) */}
        <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
          {currentSlide?.image ? (
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
          {currentSlide && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 sm:p-5 text-center">
              <span className="inline-block rounded-full bg-brand-500/30 border border-brand-400/40 px-2.5 py-0.5 text-[11px] font-black text-white mb-1">
                {currentSlide.stage} · {currentSlide.speaker}
              </span>
              <p className="font-display text-sm sm:text-base font-bold text-white drop-shadow-md">
                "{currentSlide.dialogue}"
              </p>
            </div>
          )}

          {/* Big Center Play/Pause button overlay if paused */}
          {!isPlaying && (
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              aria-label="Phát video"
              className="absolute inset-0 m-auto h-16 w-16 flex items-center justify-center rounded-full bg-brand-500 text-white shadow-xl hover:scale-110 transition-transform cursor-pointer"
            >
              <Play size={28} className="translate-x-0.5" />
            </button>
          )}
        </div>

        {/* Video Timeline & Controls */}
        <div className="border-t border-slate-100 bg-white px-4 py-3 sm:px-5">
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
                const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                const newTime = Math.floor(clickPos * rule.durationSec)
                setElapsedSec(newTime)
                const totalSlides = rule.slides.length || 1
                const slideDuration = rule.durationSec / totalSlides
                const nextIndex = Math.min(Math.floor(newTime / slideDuration), totalSlides - 1)
                setCurrentSlideIndex(nextIndex)
              }}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-mint-500 transition-all duration-150"
                style={{ width: `${Math.min(100, (elapsedSec / Math.max(1, rule.durationSec)) * 100)}%` }}
              />
            </div>

            <span className="text-xs font-mono font-bold text-slate-500 shrink-0">
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
          Video bài giảng 16:9 sắc nét — con có thể xem lại bất kỳ lúc nào.
        </span>
      </div>
    </div>
  )
}
