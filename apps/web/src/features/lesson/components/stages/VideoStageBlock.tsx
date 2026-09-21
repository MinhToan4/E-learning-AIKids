import React, { useMemo } from 'react'
import { Video, Play, RotateCcw, Volume2, ArrowRight } from 'lucide-react'
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

export function VideoStageBlock({
  stage,
  videoSeekSec = 0,
  onSeekVideo,
  onSpeakCurrentStage,
  onPrevious,
  onContinue,
}: VideoStageBlockProps) {
  const { config } = stage

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

  return (
    <section
      data-testid="stage-2-video"
      className="h-full max-h-full min-h-0 rounded-3xl bg-white p-3 sm:p-4 shadow-clay border-2 border-brand-100 flex flex-col justify-between gap-2.5 sm:gap-3 overflow-y-auto animate-fade-up"
    >
      {/* Header nhỏ */}
      <div className="shrink-0 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-xs sm:text-sm font-bold border border-purple-200/60 shrink-0">
          <Video size={12} className="text-purple-600" />
          <span>Chặng 3: Video bài giảng</span>
        </div>
        <h2 className="text-sm sm:text-base font-black text-slate-800 truncate">
          {config.title}
        </h2>
      </div>

      {/* KHUNG VIDEO 16:9 TO RÕ Ở TRUNG TÂM (CHIẾM TRỌN BỀ NGANG, CHIỀU CAO TỐI ƯU) */}
      <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
        <div
          className="relative aspect-video w-full max-w-7xl max-h-[54vh] sm:max-h-[58vh] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-black"
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

      {/* THANH TIẾN TRÌNH STEPPER DÀN NGANG CHUẨN AIKIRULEVIDEOPLAYER */}
      <div
        data-testid="video-timeline-stepper"
        className="w-full max-w-6xl xl:max-w-7xl mx-auto rounded-2xl bg-amber-50/80 border-2 border-amber-200 px-3 py-2 sm:px-4 sm:py-2.5 shadow-xs shrink-0 flex flex-col gap-1.5"
      >
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            data-testid="video-timeline-play-btn"
            onClick={() => onSeekVideo?.((videoSeekSec || 0) === 0 ? (videoChapters[1]?.startSec || 0) : 0)}
            className="size-8 sm:size-9 rounded-xl sm:rounded-2xl bg-brand-500 text-white shadow-clay hover:bg-brand-600 active:scale-95 flex items-center justify-center cursor-pointer transition-all shrink-0"
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
                      'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-6 sm:size-7 rounded-full border-2 border-white shadow-clay flex items-center justify-center font-display font-black text-xs sm:text-sm select-none transition-all duration-200 cursor-pointer',
                      isCurrent
                        ? 'bg-brand-500 text-white scale-125 ring-4 ring-brand-200 z-10 shadow-clay'
                        : isPassed
                        ? 'bg-amber-400 text-amber-950 font-black'
                        : 'bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200'
                    )}
                    style={{ left: `${posPercent}%` }}
                    title={`${Math.floor(m.startSec / 60)}:${String(m.startSec % 60).padStart(2, '0')}: ${m.label}`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>

          <span className="text-xs sm:text-sm font-mono font-black text-amber-900 shrink-0 ml-auto sm:ml-0">
            {Math.floor((videoSeekSec || 0) / 60)}:{String((videoSeekSec || 0) % 60).padStart(2, '0')} / {Math.floor(totalDurationSec / 60)}:{String(totalDurationSec % 60).padStart(2, '0')}
          </span>
        </div>

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
      <div className="shrink-0 flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 pt-1">
        <Button
          variant="secondary"
          onClick={onPrevious}
          className="rounded-xl text-xs sm:text-sm py-2 px-3 sm:px-4 shrink-0"
        >
          Quay lại câu đố
        </Button>

        <Button
          variant="primary"
          className="px-4 sm:px-7 py-2 sm:py-3 text-xs sm:text-base font-black rounded-2xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0"
          onClick={onContinue}
        >
          <span>📝 Làm bài test thử tài →</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </section>
  )
}
