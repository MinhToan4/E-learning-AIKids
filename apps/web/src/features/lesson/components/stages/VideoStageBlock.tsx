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
      className="flex h-full min-h-0 flex-1 overflow-y-auto flex-col justify-between gap-2 rounded-3xl border-2 border-brand-100 bg-white p-2 shadow-clay animate-fade-up sm:gap-2.5 sm:p-3"
    >
      {/* Header ẩn cho screen reader/a11y để tối ưu diện tích hiển thị */}
      <h2 className="sr-only">{config.title || 'Video bài giảng'}</h2>

      {/* Khung video 16:9 to rõ ở trung tâm */}
      <div className="flex w-full flex-1 min-h-0 items-center justify-center py-1">
        <div
          className="relative aspect-video w-full max-w-5xl xl:max-w-6xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-clay sm:shadow-2xl border-2 sm:border-4 border-slate-900 bg-black"
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
      </div>

      {/* Thông báo ấm áp khi bài học dùng video chung của AIKI */}
      {!config.isDedicatedLessonVideo && !hasSlides && (
        <div
          data-testid="generic-video-notice"
          className="w-full max-w-6xl xl:max-w-7xl mx-auto rounded-2xl bg-amber-50/95 border-2 border-amber-200/90 px-3.5 py-2 sm:px-5 sm:py-2.5 text-center text-xs sm:text-sm font-bold text-amber-900 shadow-2xs shrink-0 flex items-center justify-center gap-2 animate-fade-in"
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
          className="w-full max-w-6xl xl:max-w-7xl mx-auto rounded-2xl bg-amber-100/95 border-2 border-amber-300 px-3.5 py-2 text-center text-xs sm:text-sm font-black text-amber-950 shadow-2xs flex items-center justify-center gap-2 animate-fade-in shrink-0"
        >
          <span>⭐ Đã nhận 1/3 Sao: Bạn đã hoàn thành Rạp chiếu bài giảng!</span>
        </div>
      )}

      {/* Thanh tiến trình stepper dàn ngang chuẩn AikiRuleVideoPlayer */}
      <div
        data-testid="video-timeline-stepper"
        className="w-full max-w-6xl xl:max-w-7xl mx-auto rounded-2xl bg-amber-50/80 border-2 border-amber-200 p-1.5 sm:p-2.5 [@media(max-height:760px)]:py-1 [@media(max-height:760px)]:px-2 shadow-xs shrink-0 flex flex-col gap-1 sm:gap-1.5 [@media(max-height:760px)]:gap-0.5"
      >
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            data-testid="video-timeline-play-btn"
            onClick={() => onSeekVideo?.((videoSeekSec || 0) === 0 ? (videoChapters[1]?.startSec || 0) : 0)}
            className="size-9 sm:size-10 [@media(max-height:760px)]:size-8 rounded-xl sm:rounded-2xl bg-brand-500 text-white shadow-clay hover:bg-brand-600 active:scale-95 flex items-center justify-center cursor-pointer transition-all shrink-0"
            aria-label="Tua lại từ đầu"
            title="Tua lại từ đầu"
          >
            <Play size={18} className="translate-x-0.5 fill-white" />
          </button>

          {/* Scrubbable Timeline Track with Stage Markers 1, 2, 3, 4, 5... */}
          <div className="relative flex-1 min-w-[120px] py-1">
            <div className="relative h-3.5 sm:h-4.5 [@media(max-height:760px)]:h-3 w-full rounded-full bg-amber-100 border-2 border-amber-300 shadow-inner flex items-center">
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
                      'absolute top-1/2 z-10 flex size-9 sm:size-10 [@media(max-height:760px)]:size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full font-display font-black text-xs select-none sm:text-sm'
                    )}
                    style={{ left: `${posPercent}%` }}
                    title={`${Math.floor(m.startSec / 60)}:${String(m.startSec % 60).padStart(2, '0')}: ${m.label}`}
                  >
                    <span
                      className={cn(
                        'flex items-center justify-center rounded-full border-2 border-white shadow-clay transition-all duration-200',
                        isCurrent ? 'size-7 sm:size-8 [@media(max-height:760px)]:size-6 bg-brand-500 text-white ring-4 ring-brand-200' : 'size-6 sm:size-7 [@media(max-height:760px)]:size-5',
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

          <span className="text-xs font-mono font-black text-amber-900 shrink-0">
            {Math.floor((videoSeekSec || 0) / 60)}:{String((videoSeekSec || 0) % 60).padStart(2, '0')} / {Math.floor(totalDurationSec / 60)}:{String(totalDurationSec % 60).padStart(2, '0')}
          </span>

          {/* Hàng nút phụ được đưa lên cùng hàng điều khiển để tối ưu diện tích */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
            <button
              type="button"
              onClick={() => onSeekVideo?.(0)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-xs sm:text-sm font-bold text-amber-900 hover:bg-amber-50 shadow-2xs transition cursor-pointer [@media(max-height:760px)]:py-0.5 [@media(max-height:760px)]:px-2 [@media(max-height:760px)]:text-[11px]"
              title="Xem lại từ đầu"
            >
              <RotateCcw size={13} className="text-amber-700" />
              <span>Xem lại video</span>
            </button>

            <button
              type="button"
              onClick={() => onSpeakCurrentStage?.(stage.speech || '')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-xs sm:text-sm font-bold text-amber-900 hover:bg-amber-50 shadow-2xs transition cursor-pointer [@media(max-height:760px)]:py-0.5 [@media(max-height:760px)]:px-2 [@media(max-height:760px)]:text-[11px]"
              title="Nghe AIKI giảng bài"
            >
              <Volume2 size={13} className="text-brand-600" />
              <span>Nghe AIKI giảng</span>
            </button>
          </div>
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
          <div className="hidden lg:grid grid-cols-5 gap-1 pt-1 border-t border-amber-200/60 text-[11px] font-bold text-center text-amber-900 [@media(max-height:640px)]:hidden [@media(max-height:760px)]:text-[10px]">
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

        {/* Thông tin mốc sr-only */}
        {currentChapter && (
          <div className="sr-only">
            <span>🎯 Mốc {currentChapterIndex + 1}: {currentChapter.label}</span>
            <span>Video gồm {videoChapters.length} mốc — bạn bấm tua xem lại bất kỳ lúc nào nhé!</span>
          </div>
        )}
      </div>

      {/* Action button footer */}
      <div className="shrink-0 flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 pt-1 border-t border-amber-100/80 sm:border-0 sm:mt-0">
        {onPrevious ? (
          <Button
            variant="secondary"
            onClick={onPrevious}
            className="rounded-xl text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 shrink-0 [@media(max-height:760px)]:py-1"
          >
            Quay lại câu đố
          </Button>
        ) : <div />}

        <Button
          variant="primary"
          className="px-4 sm:px-6 py-2 sm:py-2.5 [@media(max-height:760px)]:py-1.5 [@media(max-height:760px)]:px-4 text-xs sm:text-sm font-black rounded-2xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ml-auto"
          onClick={handleContinue}
        >
          <span>{hasSlides ? '⚡ Tiếp tục sang Thử Tài Phản Xạ' : '📝 Làm bài test thử tài →'}</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </section>
  )
}
