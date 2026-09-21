import React, { useMemo, useState, useEffect } from 'react'
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import { buildVideoEmbedUrl } from '../../lib/stage-adapter'
import type { JourneyStageDefinition, VideoStageConfig } from '../../types/stage-schema'

export interface VideoStageBlockProps {
  stage: JourneyStageDefinition<VideoStageConfig>
  videoSeekSec?: number
  onSeekVideo?: (sec: number) => void
  onSpeakCurrentStage?: (text: string) => void
  onPrevious?: () => void
  onContinue?: () => void
}

const DEFAULT_SLIDE_STEPS = [
  '1. Tình huống',
  '2. Câu đố AIKI',
  '3. Quy tắc vàng',
  '4. Giải thích so sánh',
  '5. Chốt hạ',
]

export function VideoStageBlock({
  stage,
  videoSeekSec = 0,
  onSeekVideo,
  onSpeakCurrentStage,
  onPrevious,
  onContinue,
}: VideoStageBlockProps) {
  const { config } = stage
  const slides = useMemo(() => config.slides || [], [config.slides])
  const hasSlides = slides.length > 0

  // State cho Slide Cinema 16:9
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false)

  // Tự động phát mỗi slide ~7-10s (8s)
  useEffect(() => {
    if (!isAutoPlaying || !hasSlides || slides.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlideIdx((prev) => {
        if (prev < slides.length - 1) {
          return prev + 1
        }
        setIsAutoPlaying(false)
        return prev
      })
    }, 8000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, hasSlides, slides.length])

  // Reset slide index khi đổi bài học
  useEffect(() => {
    setCurrentSlideIdx(0)
    setIsAutoPlaying(false)
  }, [config.title])

  const currentSlide = slides[currentSlideIdx] || slides[0]

  // State cho Video YouTube chuẩn bài giảng
  const videoChapters = useMemo(() => {
    if (config.timestamps && config.timestamps.length > 0) {
      return config.timestamps
    }
    return [
      { label: 'Tình huống mở đầu', startSec: 0, endSec: 30 },
      { label: 'Khám phá bí kíp', startSec: 30, endSec: 75 },
      { label: 'Quy tắc 4 chìa khóa', startSec: 75, endSec: 120 },
      { label: 'Thực hành cùng AIKI', startSec: 120, endSec: 150 },
      { label: 'Mẹo tránh lỗi đoán mò', startSec: 150, endSec: 175 },
      { label: 'Tổng kết bài học', startSec: 175, endSec: 180 },
    ]
  }, [config.timestamps])

  const totalDurationSec = useMemo(() => {
    if (config.durationSec && config.durationSec > 0) {
      return config.durationSec
    }
    if (videoChapters.length > 0) {
      return videoChapters[videoChapters.length - 1].endSec || 180
    }
    return 180
  }, [config.durationSec, videoChapters])

  const currentChapterIndex = useMemo(() => {
    const seek = videoSeekSec ?? 0
    const idx = videoChapters.findIndex(
      (c) => seek >= c.startSec && (c.endSec !== undefined ? seek < c.endSec : true)
    )
    return idx !== -1 ? idx : 0
  }, [videoChapters, videoSeekSec])

  const currentChapter = videoChapters[currentChapterIndex] || videoChapters[0]

  const videoEmbedSrc = useMemo(() => {
    return buildVideoEmbedUrl(config.videoUrl, videoSeekSec)
  }, [config.videoUrl, videoSeekSec])

  // ═══════════════════════════════════════════════════════════════════════════
  // CHẾ ĐỘ 1: RẠP CHIẾU SLIDE CINEMA 16:9 CHO 10 QUY TẮC VÀNG
  // ═══════════════════════════════════════════════════════════════════════════
  if (hasSlides) {
    return (
      <section
        data-testid="stage-2-video"
        className="flex h-auto min-h-0 shrink-0 flex-col gap-2 rounded-3xl border-2 border-brand-100 bg-white p-2.5 shadow-clay animate-fade-up sm:gap-3 sm:p-4"
      >
        {/* Header nhỏ */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-xs sm:text-sm font-bold border border-purple-200/60 shrink-0">
            <Video size={12} className="text-purple-600" />
            <span>Chặng {stage.stepNumber || 1}: Rạp chiếu Quy tắc vàng</span>
          </div>
          <h2 className="text-sm sm:text-base font-black text-slate-800 leading-snug">
            {config.title}
          </h2>
        </div>

        {/* Khung hình hiển thị Slide Cinema */}
        <div className="flex w-full flex-col items-center justify-start gap-2 sm:gap-2.5">
          <div className="relative aspect-video max-sm:aspect-[4/3] sm:aspect-video w-full max-w-5xl max-h-[32vh] sm:max-h-[54vh] rounded-2xl sm:rounded-3xl overflow-hidden shadow-clay sm:shadow-2xl border-2 sm:border-4 border-slate-900 bg-slate-950 flex items-center justify-center group shrink-0">
            <img
              src={currentSlide?.image || config.posterUrl || '/assets/aiki-rules/rule1_superhero_dad.jpg'}
              alt={currentSlide?.stage || config.title}
              className="w-full h-full object-contain select-none transition-all duration-300"
            />

            {/* Stage badge overlay góc trái */}
            <div className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 bg-black/80 backdrop-blur-md text-amber-300 text-xs sm:text-sm font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl shadow-md border border-amber-400/40 flex items-center gap-1.5 z-10">
              <Sparkles size={13} className="text-amber-400" />
              <span>{currentSlide?.stage || DEFAULT_SLIDE_STEPS[currentSlideIdx]}</span>
            </div>

            {/* Screen action chú thích kịch bản hoạt cảnh bên dưới */}
            {currentSlide?.screenAction && (
              <div className="absolute bottom-2 inset-x-2.5 sm:bottom-2.5 sm:inset-x-6 bg-black/80 backdrop-blur-md text-white text-[11px] sm:text-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-center shadow-lg border border-white/15 italic line-clamp-2 sm:line-clamp-none">
                {currentSlide.screenAction}
              </div>
            )}
          </div>

          {/* Lời thoại Mèo AIKI hiển thị dưới dạng Speech Bubble sinh động */}
          <div
            data-testid="slide-speech-bubble"
            className="w-full max-w-5xl mx-auto rounded-2xl bg-amber-50/95 border-2 border-amber-300/90 p-2.5 sm:p-4 shadow-sm flex flex-col gap-1 sm:gap-1.5 shrink-0"
          >
            <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 pb-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-xl">🐱</span>
                <span className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide">
                  Mèo AIKI
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] sm:text-[11px] font-bold">
                  {currentSlideIdx + 1}/{slides.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onSpeakCurrentStage?.(currentSlide?.dialogue || '')}
                className="inline-flex min-h-11 items-center gap-1 sm:gap-1.5 px-3 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-2xs transition cursor-pointer"
                title="Nghe Mèo AIKI đọc lời thoại"
              >
                <Volume2 size={12} className="text-brand-600 sm:size-[13px]" />
                <span>Nghe đọc</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm md:text-base font-bold text-slate-800 leading-relaxed font-sans">
              {currentSlide?.dialogue}
            </p>
          </div>
        </div>

        {/* Timeline Stepper gồm 5 mốc */}
        <div
          data-testid="video-timeline-stepper"
          className="w-full max-w-5xl mx-auto rounded-2xl bg-amber-50/90 border-2 border-amber-200 p-2 sm:p-3 shadow-xs shrink-0 flex flex-col gap-1.5 sm:gap-2"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Nút Tự động phát */}
            <button
              type="button"
              data-testid="slide-autoplay-btn"
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              className="size-11 rounded-xl bg-brand-500 text-white shadow-clay hover:bg-brand-600 active:scale-95 flex items-center justify-center cursor-pointer transition shrink-0"
              title={isAutoPlaying ? 'Tạm dừng tự động phát' : 'Tự động phát'}
            >
              {isAutoPlaying ? (
                <Pause size={16} className="fill-white" />
              ) : (
                <Play size={16} className="translate-x-0.5 fill-white" />
              )}
            </button>

            {/* Stepper track */}
            <div className="relative flex-1 min-w-[140px] py-1">
              <div className="relative h-4 sm:h-5 w-full rounded-full bg-amber-100 border-2 border-amber-300 shadow-inner flex items-center">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-brand-400 to-orange-400 transition-all duration-200 pointer-events-none"
                  style={{
                    width: `${Math.min(100, Math.max(8, ((currentSlideIdx + 1) / slides.length) * 100))}%`,
                  }}
                />

                {/* 5 Mốc timeline */}
                {slides.map((s, idx) => {
                  const posPercent = (idx / (slides.length - 1 || 1)) * 92 + 4
                  const isCurrent = currentSlideIdx === idx
                  const isPassed = currentSlideIdx >= idx
                  const label = DEFAULT_SLIDE_STEPS[idx] || s.stage

                  return (
                    <button
                      key={idx}
                      type="button"
                      data-testid={`video-chapter-node-${idx + 1}`}
                      onClick={() => {
                        setCurrentSlideIdx(idx)
                        setIsAutoPlaying(false)
                      }}
                      className={cn(
                        'absolute top-1/2 z-10 flex size-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full font-display font-black text-xs select-none'
                      )}
                      style={{ left: `${posPercent}%` }}
                      title={label}
                    >
                      <span
                        className={cn(
                          'flex items-center justify-center rounded-full border-2 border-white shadow-clay transition-all duration-200',
                          isCurrent ? 'size-9 bg-brand-500 text-white ring-4 ring-brand-200' : 'size-7 sm:size-9',
                          !isCurrent && isPassed
                            ? 'bg-amber-400 text-amber-950'
                            : !isCurrent
                              ? 'border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : ''
                        )}
                      >
                        {idx + 1}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <span className="hidden text-xs font-mono font-black text-amber-900 shrink-0 sm:inline sm:text-sm">
              {currentSlideIdx + 1} / {slides.length}
            </span>
          </div>

          {/* Dòng nhãn nổi bật mốc đang chọn hiển thị trên mobile/tablet (< lg) */}
          <div className="lg:hidden flex items-center justify-center text-xs font-bold text-amber-900 bg-amber-100/70 py-1 px-2.5 rounded-lg border border-amber-200/60 text-center">
            <span>
              🎯 Mốc {currentSlideIdx + 1}: {DEFAULT_SLIDE_STEPS[currentSlideIdx] || currentSlide?.stage || `Mốc ${currentSlideIdx + 1}`}
            </span>
          </div>

          {/* Nhãn 5 mốc timeline chỉ hiển thị trên màn hình rộng lg */}
          <div className="hidden lg:grid grid-cols-5 gap-1 pt-1 border-t border-amber-200/60 text-[11px] font-bold text-center text-amber-900">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCurrentSlideIdx(idx)
                  setIsAutoPlaying(false)
                }}
                className={cn(
                  'min-h-11 truncate rounded-lg px-1 transition cursor-pointer',
                  currentSlideIdx === idx
                    ? 'bg-amber-200 text-amber-950 font-black'
                    : 'text-amber-800 hover:bg-amber-100'
                )}
              >
                {DEFAULT_SLIDE_STEPS[idx] || `Mốc ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>

        {/* Nút điều hướng chân trang */}
        <div className="shrink-0 flex justify-between items-center gap-2 pt-1 border-t border-amber-100/80 sm:border-0 sm:mt-0">
          <div className="flex items-center gap-2">
            {currentSlideIdx > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setCurrentSlideIdx((prev) => Math.max(0, prev - 1))
                  setIsAutoPlaying(false)
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-amber-900 hover:bg-amber-50 transition cursor-pointer shadow-2xs active:scale-95"
              >
                <ChevronLeft size={14} />
                <span>Trước</span>
              </button>
            ) : onPrevious ? (
              <Button
                variant="secondary"
                onClick={onPrevious}
                className="rounded-xl text-xs sm:text-sm py-2 px-3 shrink-0"
              >
                Quay lại
              </Button>
            ) : null}
          </div>

          {currentSlideIdx < slides.length - 1 ? (
            <Button
              variant="primary"
              className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-black rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-1.5 cursor-pointer ml-auto"
              onClick={() => {
                setCurrentSlideIdx((prev) => Math.min(slides.length - 1, prev + 1))
                setIsAutoPlaying(false)
              }}
            >
              <span>Kế tiếp</span>
              <ChevronRight size={16} />
            </Button>
          ) : (
            <Button
              variant="primary"
              className="px-5 sm:px-7 py-2 sm:py-3 text-xs sm:text-base font-black rounded-2xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 animate-pulse ml-auto"
              onClick={onContinue}
            >
              <span>⚡ Tiếp tục sang Thử Tài Phản Xạ</span>
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </section>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHẾ ĐỘ 2: TRÌNH PHÁT VIDEO BÀI GIẢNG YOUTUBE (CÁC ĐẢO AIKIDS M1-M5)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <section
      data-testid="stage-2-video"
      className="flex h-full min-h-0 shrink-0 flex-col justify-between gap-2 rounded-3xl border-2 border-brand-100 bg-white p-2.5 shadow-clay animate-fade-up sm:gap-3 sm:p-4"
    >
      {/* Header nhỏ */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-xs sm:text-sm font-bold border border-purple-200/60 shrink-0">
          <Video size={12} className="text-purple-600" />
          <span>Chặng {stage.stepNumber || 3}: Video bài giảng</span>
        </div>
        <h2 className="text-sm sm:text-base font-black text-slate-800 leading-snug">
          {config.title}
        </h2>
      </div>

      {/* Khung video 16:9 to rõ ở trung tâm */}
      <div className="flex w-full items-center justify-center py-1 sm:py-0">
        <div
          className="relative aspect-video w-full max-w-7xl max-h-[32vh] sm:max-h-[54vh] rounded-2xl sm:rounded-3xl overflow-hidden shadow-clay sm:shadow-2xl border-2 sm:border-4 border-slate-900 bg-black"
          style={{
            width: 'min(100%, 1100px, calc((100dvh - 360px) * 16 / 9))',
          }}
        >
          <iframe
            src={videoEmbedSrc}
            title={config.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      </div>

      {/* Thông báo ấm áp khi bài học dùng video chung của AIKI */}
      {!config.isDedicatedLessonVideo && (
        <div
          data-testid="generic-video-notice"
          className="w-full max-w-6xl xl:max-w-7xl mx-auto rounded-2xl bg-amber-50/95 border-2 border-amber-200/90 px-3.5 py-2 sm:px-5 sm:py-2.5 text-center text-xs sm:text-sm font-bold text-amber-900 shadow-2xs shrink-0 flex items-center justify-center gap-2 animate-fade-in"
        >
          <span>
            🎬 Video bài học chuyên sâu của trạm này đang được AIKI chuẩn bị! Bạn hãy xem video bí kíp của AIKI ở trên hoặc bấm &quot;Tiếp tục&quot; để làm trắc nghiệm &amp; thực hành nhé ✨
          </span>
        </div>
      )}

      {/* Thanh tiến trình stepper dàn ngang chuẩn AikiRuleVideoPlayer */}
      <div
        data-testid="video-timeline-stepper"
        className="w-full max-w-6xl xl:max-w-7xl mx-auto rounded-2xl bg-amber-50/80 border-2 border-amber-200 px-3 py-2 sm:px-4 sm:py-2.5 shadow-xs shrink-0 flex flex-col gap-1.5"
      >
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            data-testid="video-timeline-play-btn"
            onClick={() => onSeekVideo?.((videoSeekSec || 0) === 0 ? (videoChapters[1]?.startSec || 0) : 0)}
            className="size-11 rounded-xl sm:rounded-2xl bg-brand-500 text-white shadow-clay hover:bg-brand-600 active:scale-95 flex items-center justify-center cursor-pointer transition-all shrink-0"
            aria-label="Tua lại từ đầu"
            title="Tua lại từ đầu"
          >
            <Play size={18} className="translate-x-0.5 fill-white" />
          </button>

          {/* Scrubbable Timeline Track with Stage Markers 1, 2, 3, 4, 5... */}
          <div className="relative flex-1 min-w-[140px] py-1">
            <div className="relative h-4 sm:h-5 w-full rounded-full bg-amber-100 border-2 border-amber-300 shadow-inner flex items-center">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-brand-400 to-orange-400 transition-all duration-150 pointer-events-none"
                style={{
                  width: `${Math.min(100, Math.max(4, (((videoSeekSec || 0) / totalDurationSec) * 100)))}%`,
                }}
              />

              {/* Numbered Chapter Markers */}
              {videoChapters.map((m, idx) => {
                const posPercent = Math.max(3, Math.min(97, (m.startSec / totalDurationSec) * 100))
                const isPassed = (videoSeekSec || 0) >= m.startSec
                const isCurrent = currentChapterIndex === idx
                return (
                  <button
                    key={idx}
                    type="button"
                    data-testid={`video-chapter-node-${idx + 1}`}
                    onClick={() => onSeekVideo?.(m.startSec)}
                    className={cn(
                      'absolute top-1/2 z-10 flex size-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full font-display font-black text-xs select-none sm:text-sm'
                    )}
                    style={{ left: `${posPercent}%` }}
                    title={`${Math.floor(m.startSec / 60)}:${String(m.startSec % 60).padStart(2, '0')}: ${m.label}`}
                  >
                    <span
                      className={cn(
                        'flex items-center justify-center rounded-full border-2 border-white shadow-clay transition-all duration-200',
                        isCurrent ? 'size-9 bg-brand-500 text-white ring-4 ring-brand-200' : 'size-7 sm:size-9',
                        !isCurrent && isPassed
                          ? 'bg-amber-400 text-amber-950'
                          : !isCurrent
                            ? 'border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : ''
                      )}
                    >
                      {idx + 1}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <span className="hidden text-xs font-mono font-black text-amber-900 shrink-0 ml-auto sm:inline sm:ml-0 sm:text-sm">
            {Math.floor((videoSeekSec || 0) / 60)}:{String((videoSeekSec || 0) % 60).padStart(2, '0')} / {Math.floor(totalDurationSec / 60)}:{String(totalDurationSec % 60).padStart(2, '0')}
          </span>
        </div>

        {/* Dòng nhãn nổi bật mốc đang chọn hiển thị trên mobile/tablet (< lg) */}
        {currentChapter && (
          <div className="lg:hidden flex items-center justify-center text-xs font-bold text-amber-900 bg-amber-100/70 py-1 px-2.5 rounded-lg border border-amber-200/60 text-center">
            <span>
              🎯 Mốc {currentChapterIndex + 1}: {currentChapter.label} ({Math.floor(currentChapter.startSec / 60)}:{String(currentChapter.startSec % 60).padStart(2, '0')})
            </span>
          </div>
        )}

        {/* Lưới 5 mốc chỉ hiển thị trên màn hình rộng lg */}
        {videoChapters.length > 0 && (
          <div className="hidden lg:grid grid-cols-5 gap-1 pt-1 border-t border-amber-200/60 text-[11px] font-bold text-center text-amber-900">
            {videoChapters.slice(0, 5).map((ch, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSeekVideo?.(ch.startSec)}
                className={cn(
                  'truncate rounded-lg px-1 py-0.5 transition cursor-pointer',
                  currentChapterIndex === idx
                    ? 'bg-amber-200 text-amber-950 font-black'
                    : 'text-amber-800 hover:bg-amber-100'
                )}
                title={ch.label}
              >
                {idx + 1}. {ch.label}
              </button>
            ))}
          </div>
        )}

        {/* Hàng nút phụ & tên mốc đang xem */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 border-t border-amber-200/60 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSeekVideo?.(0)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-xs sm:text-sm font-bold text-amber-900 hover:bg-amber-50 shadow-2xs transition cursor-pointer"
              title="Xem lại từ đầu"
            >
              <RotateCcw size={13} className="text-amber-700" />
              <span>Xem lại video</span>
            </button>

            <button
              type="button"
              onClick={() => onSpeakCurrentStage?.(stage.speech || '')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-xs sm:text-sm font-bold text-amber-900 hover:bg-amber-50 shadow-2xs transition cursor-pointer"
              title="Nghe AIKI giảng bài"
            >
              <Volume2 size={13} className="text-brand-600" />
              <span>Nghe AIKI giảng</span>
            </button>
          </div>

          {/* Thông tin mốc sr-only */}
          {currentChapter && (
            <div className="sr-only">
              <span>🎯 Mốc {currentChapterIndex + 1}: {currentChapter.label}</span>
              <span>Video gồm {videoChapters.length} mốc — bạn bấm tua xem lại bất kỳ lúc nào nhé!</span>
            </div>
          )}
        </div>
      </div>

      {/* Action button footer */}
      <div className="shrink-0 flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 pt-1 border-t border-amber-100/80 sm:border-0 sm:mt-0">
        {onPrevious ? (
          <Button
            variant="secondary"
            onClick={onPrevious}
            className="rounded-xl text-xs sm:text-sm py-2 px-3 sm:px-4 shrink-0"
          >
            Quay lại câu đố
          </Button>
        ) : <div />}

        <Button
          variant="primary"
          className="px-4 sm:px-7 py-2 sm:py-3 text-xs sm:text-base font-black rounded-2xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ml-auto"
          onClick={onContinue}
        >
          <span>📝 Làm bài test thử tài →</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </section>
  )
}
