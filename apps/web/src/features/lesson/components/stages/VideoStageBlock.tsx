import React, { useMemo, useEffect, useRef, useCallback } from 'react'
import {
  Play,
  RotateCcw,
  Volume2,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import { buildVideoEmbedUrl } from '../../lib/stage-view-utils'
import { playInstantSound } from '../../lib/lesson-sound'
import type { JourneyStageDefinition, VideoStageConfig } from '../../types/stage-schema'

export interface VideoStageBlockProps {
  stage: JourneyStageDefinition<VideoStageConfig>
  videoSeekSec?: number
  onSeekVideo?: (sec: number) => void
  onSpeakCurrentStage?: (text: string) => void
  onPrevious?: () => void
  onContinue?: () => void
  onVideoCompleted?: () => void
  isVideoCompleted?: boolean
}

export function VideoStageBlock({
  stage,
  videoSeekSec = 0,
  onSeekVideo,
  onSpeakCurrentStage,
  onPrevious,
  onContinue,
  onVideoCompleted,
  isVideoCompleted = false,
}: VideoStageBlockProps) {
  const { config } = stage
  const slides = useMemo(() => config.slides || [], [config.slides])
  const hasSlides = slides.length > 0

  const hasPlayedSoundRef = useRef(false)

  // Reset khi đổi bài học
  useEffect(() => {
    hasPlayedSoundRef.current = false
  }, [config.title, config.videoUrl])

  const handleTriggerComplete = useCallback(() => {
    if (!isVideoCompleted && !hasPlayedSoundRef.current) {
      hasPlayedSoundRef.current = true
      try {
        playInstantSound('star')
      } catch {
        // ignore audio error
      }
    }
    onVideoCompleted?.()
  }, [isVideoCompleted, onVideoCompleted])

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

  // Theo dõi tiến độ Video YouTube (các đảo AIKids M1-M5 hoặc video bài giảng 10 quy tắc)
  useEffect(() => {
    const seek = videoSeekSec || 0
    const isTimePassed = totalDurationSec > 0 && seek / totalDurationSec >= 0.75
    const isChapterPassed =
      videoChapters.length > 0 &&
      currentChapterIndex >= Math.max(0, videoChapters.length - 2)
    if (isTimePassed || isChapterPassed) {
      handleTriggerComplete()
    }
  }, [
    videoSeekSec,
    totalDurationSec,
    videoChapters.length,
    currentChapterIndex,
    handleTriggerComplete,
  ])

  const handleContinue = useCallback(() => {
    handleTriggerComplete()
    onContinue?.()
  }, [handleTriggerComplete, onContinue])

  return (
    <section
      data-testid="stage-2-video"
      className="flex h-full min-h-0 flex-1 overflow-y-auto flex-col landscape:flex-row lg:flex-row justify-between gap-3 rounded-3xl border-2 border-brand-100 bg-white p-2.5 shadow-clay animate-fade-up sm:p-3.5"
    >
      {/* Header ẩn cho screen reader/a11y để tối ưu diện tích hiển thị */}
      <h2 className="sr-only">{config.title || 'Video bài giảng'}</h2>

      {/* CỘT TRÁI (Main Video Cinema - Phóng to cực đại theo chiều cao khả dụng) */}
      <div className="flex flex-1 min-w-0 flex-col items-center justify-center h-full min-h-0 py-0.5 overflow-hidden">
        <div
          className="relative aspect-video max-w-full max-h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-clay sm:shadow-2xl border-2 sm:border-4 border-slate-900 bg-black flex items-center justify-center shrink-0 w-full lg:max-w-none"
          style={{
            width: 'min(100%, 1100px, calc((100dvh - 280px) * 16 / 9))',
            maxHeight: 'min(58vh, calc(100dvh - 280px))',
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

        {/* Thông báo ấm áp khi bài học dùng video chung của AIKI */}
        {!config.isDedicatedLessonVideo && !hasSlides && (
          <div
            data-testid="generic-video-notice"
            className="w-full max-w-4xl mx-auto mt-2 rounded-2xl bg-amber-50/95 border-2 border-amber-200/90 px-3 py-1.5 text-center text-xs sm:text-sm font-bold text-amber-900 shadow-2xs shrink-0 flex items-center justify-center gap-2 animate-fade-in"
          >
            <span>
              🎬 Video bài học chuyên sâu của trạm này đang được AIKI chuẩn bị! Bạn hãy xem video bí kíp của AIKI ở trên hoặc bấm &quot;Tiếp tục&quot; để làm trắc nghiệm &amp; thực hành nhé ✨
            </span>
          </div>
        )}

        {/* Banner huy hiệu nhận sao khi hoàn thành video */}
        {isVideoCompleted && (
          <div
            data-testid="video-completed-badge"
            className="w-full max-w-4xl mx-auto mt-2 rounded-2xl bg-amber-100/95 border-2 border-amber-300 px-3 py-1.5 text-center text-xs sm:text-sm font-black text-amber-950 shadow-2xs flex items-center justify-center gap-2 animate-fade-in shrink-0"
          >
            <span>⭐ Đã nhận 1/3 Sao: Bạn đã hoàn thành Rạp chiếu bài giảng!</span>
          </div>
        )}
      </div>

      {/* CỘT PHẢI: Thanh tiến trình stepper & Vertical Playlist & Action Dock */}
      <div
        data-testid="video-timeline-stepper"
        className="relative z-10 w-full landscape:w-80 lg:w-80 xl:w-96 shrink-0 flex flex-col justify-between gap-2 bg-amber-50/80 border-2 border-amber-200 p-2 sm:p-2.5 [@media(max-height:760px)]:py-1 shadow-xs rounded-2xl min-h-0 landscape:h-full lg:h-full"
      >
        {/* Header mốc & Thời gian */}
        <div className="shrink-0 flex items-center justify-between gap-1 pb-1 border-b border-amber-200/80 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-black uppercase tracking-wider text-amber-950 flex items-center gap-1 truncate">
              <span>⏱️</span>
              <span className="truncate">Lộ trình</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 shrink-0">
              {videoChapters.length} mốc
            </span>
          </div>

          <span className="text-[11px] sm:text-xs font-mono font-black text-amber-900 shrink-0">
            {Math.floor((videoSeekSec || 0) / 60)}:{String((videoSeekSec || 0) % 60).padStart(2, '0')} / {Math.floor(totalDurationSec / 60)}:{String(totalDurationSec % 60).padStart(2, '0')}
          </span>
        </div>

        {/* Thanh Scrubbable Track + Nút Play */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            data-testid="video-timeline-play-btn"
            onClick={() => onSeekVideo?.((videoSeekSec || 0) === 0 ? (videoChapters[1]?.startSec || 0) : 0)}
            className="size-8 sm:size-9 rounded-xl bg-brand-500 text-white shadow-clay hover:bg-brand-600 active:scale-95 flex items-center justify-center cursor-pointer transition-all shrink-0"
            aria-label="Tua lại từ đầu"
            title="Tua lại từ đầu"
          >
            <Play size={16} className="translate-x-0.5 fill-white" />
          </button>

          <div className="relative flex-1 min-w-[80px] py-1">
            <div className="relative h-2.5 sm:h-3 w-full rounded-full bg-amber-100 border border-amber-300 shadow-inner flex items-center">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-brand-400 to-orange-400 transition-all duration-150 pointer-events-none"
                style={{
                  width: `${Math.min(100, Math.max(4, (((videoSeekSec || 0) / totalDurationSec) * 100)))}%`,
                }}
              />

              {/* Numbered Chapter Markers (cho kiểm thử và tua nhanh) */}
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
                      'absolute top-1/2 z-10 flex size-6 sm:size-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full font-display font-black text-xs select-none'
                    )}
                    style={{ left: `${posPercent}%` }}
                    title={`${Math.floor(m.startSec / 60)}:${String(m.startSec % 60).padStart(2, '0')}: ${m.label}`}
                  >
                    <span
                      className={cn(
                        'flex items-center justify-center rounded-full border border-white shadow-clay transition-all duration-200 text-[10px]',
                        isCurrent
                          ? 'size-5 sm:size-6 bg-brand-500 text-white ring-2 ring-brand-200'
                          : isPassed
                          ? 'size-4 sm:size-5 bg-amber-400 text-amber-950'
                          : 'size-4 sm:size-5 border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200'
                      )}
                    >
                      {idx + 1}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Hàng nút phụ Xem lại video & Nghe AIKI giảng */}
        <div className="shrink-0 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSeekVideo?.(0)}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-amber-300 bg-white px-2 py-1 text-xs font-bold text-amber-900 hover:bg-amber-50 shadow-2xs transition cursor-pointer [@media(max-height:760px)]:py-0.5"
            title="Xem lại từ đầu"
          >
            <RotateCcw size={12} className="text-amber-700" />
            <span>Xem lại video</span>
          </button>

          <button
            type="button"
            onClick={() => onSpeakCurrentStage?.(stage.speech || '')}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-amber-300 bg-white px-2 py-1 text-xs font-bold text-amber-900 hover:bg-amber-50 shadow-2xs transition cursor-pointer [@media(max-height:760px)]:py-0.5"
            title="Nghe AIKI giảng bài"
          >
            <Volume2 size={12} className="text-brand-600" />
            <span>Nghe AIKI giảng</span>
          </button>
        </div>

        {/* Vertical Chapter Playlist (Cuộn độc lập, rõ ràng từng mốc) */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 pr-0.5 max-h-[160px] landscape:max-h-none lg:max-h-none">
          {videoChapters.map((ch, idx) => {
            const isPassed = (videoSeekSec || 0) >= ch.startSec
            const isCurrent = currentChapterIndex === idx
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSeekVideo?.(ch.startSec)}
                className={cn(
                  'w-full p-1.5 sm:p-2 rounded-xl border flex items-center justify-between gap-2 text-left transition cursor-pointer shadow-2xs',
                  isCurrent
                    ? 'bg-brand-500 text-white border-brand-600 font-black ring-2 ring-brand-300 shadow-clay-xs'
                    : isPassed
                    ? 'bg-amber-100/90 text-amber-950 border-amber-300 hover:bg-amber-200'
                    : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50'
                )}
                title={`${Math.floor(ch.startSec / 60)}:${String(ch.startSec % 60).padStart(2, '0')}: ${ch.label}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      'size-5 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0',
                      isCurrent ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-xs truncate font-bold">{ch.label}</span>
                </div>
                <span
                  className={cn(
                    'text-[10px] font-mono shrink-0 px-1 py-0.5 rounded',
                    isCurrent ? 'bg-white/20 text-white font-black' : 'text-amber-800'
                  )}
                >
                  {Math.floor(ch.startSec / 60)}:{String(ch.startSec % 60).padStart(2, '0')}
                </span>
              </button>
            )
          })}
        </div>

        {/* Action Button Footer Neo Ở Chân Cột Phải */}
        <div className="shrink-0 flex justify-between items-center pt-1 border-t border-amber-200/80 gap-2">
          {onPrevious ? (
            <Button
              variant="secondary"
              onClick={onPrevious}
              className="rounded-xl text-xs py-1.5 px-2.5 shrink-0 [@media(max-height:760px)]:py-1"
            >
              Quay lại câu đố
            </Button>
          ) : <div />}

          <Button
            variant="primary"
            className="flex-1 py-2 px-3 [@media(max-height:760px)]:py-1.5 text-xs sm:text-sm font-black rounded-xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
            onClick={handleContinue}
          >
            <span>{hasSlides ? '⚡ Tiếp tục sang Thử Tài Phản Xạ' : '📝 Làm bài test thử tài →'}</span>
            <ArrowRight size={15} />
          </Button>
        </div>
      </div>
    </section>
  )
}
