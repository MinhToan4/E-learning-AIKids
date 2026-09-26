import React, { useMemo, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import {
  Pause,
  Play,
  RotateCcw,
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
  onSpeakCurrentStage: _onSpeakCurrentStage,
  onPrevious,
  onContinue,
  onVideoCompleted,
  isVideoCompleted = false,
}: VideoStageBlockProps) {
  const { config } = stage
  const stageRef = useRef<HTMLElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [useHorizontalTimeline, setUseHorizontalTimeline] = React.useState(false)
  const slides = useMemo(() => config.slides || [], [config.slides])
  const hasSlides = slides.length > 0

  const hasPlayedSoundRef = useRef(false)

  useLayoutEffect(() => {
    const element = stageRef.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const canvas = element.closest<HTMLElement>('[data-testid="main-learning-canvas"]') ?? element
    const updateLayout = (width: number, height: number) => {
      // Observe the stable parent canvas, not this stage. Measuring the stage
      // itself creates a feedback loop: horizontal layout changes its height,
      // which can immediately switch it back to vertical and make it flicker.
      // Prefer the bottom timeline until the canvas is genuinely panoramic.
      // Around 16:10/3:2, reclaiming the 320px side rail produces a materially
      // larger teaching video with less unused space.
      setUseHorizontalTimeline(width < 768 || width / Math.max(height, 1) <= 1.75)
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) updateLayout(entry.contentRect.width, entry.contentRect.height)
    })
    observer.observe(canvas)
    const rect = canvas.getBoundingClientRect()
    updateLayout(rect.width, rect.height)
    return () => observer.disconnect()
  }, [])

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

  const videoEmbedSrc = useMemo(() => buildVideoEmbedUrl(config.videoUrl), [config.videoUrl])

  const postToYouTube = useCallback((command: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
      event: 'command',
      func: command,
      args,
    }), '*')
  }, [])

  const handleSeek = useCallback((sec: number, resume = true) => {
    const target = Math.max(0, Math.min(totalDurationSec, Math.floor(sec)))
    onSeekVideo?.(target)
    postToYouTube('seekTo', [target, true])
    if (resume) {
      postToYouTube('playVideo')
      setIsPlaying(true)
    }
  }, [onSeekVideo, postToYouTube, totalDurationSec])

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      postToYouTube('pauseVideo')
      setIsPlaying(false)
      return
    }
    postToYouTube('playVideo')
    setIsPlaying(true)
  }, [isPlaying, postToYouTube])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return
      let data: { event?: string; info?: number | { currentTime?: number } }
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
      } catch {
        return
      }
      if (data.event === 'onStateChange' && typeof data.info === 'number') {
        setIsPlaying(data.info === 1)
      }
      if (data.event === 'infoDelivery' && typeof data.info === 'object') {
        const currentTime = data.info?.currentTime
        if (typeof currentTime === 'number') onSeekVideo?.(Math.floor(currentTime))
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onSeekVideo])

  useEffect(() => {
    if (!isPlaying) return
    const timer = window.setInterval(() => postToYouTube('getCurrentTime'), 750)
    return () => window.clearInterval(timer)
  }, [isPlaying, postToYouTube])

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
    if (!isVideoCompleted) return
    onContinue?.()
  }, [isVideoCompleted, onContinue])

  return (
    <section
      ref={stageRef}
      data-testid="stage-2-video"
      data-timeline-layout={useHorizontalTimeline ? 'horizontal' : 'vertical'}
      className="lesson-video-stage flex h-full min-h-0 flex-1 overflow-x-hidden overflow-y-auto flex-col landscape:flex-row lg:flex-row justify-between gap-3 rounded-3xl border border-slate-200/80 bg-white p-2.5 shadow-xs animate-fade-up sm:p-3"
    >
      {/* Header ẩn cho screen reader/a11y để tối ưu diện tích hiển thị */}
      <h2 className="sr-only">{config.title || 'Video bài giảng'}</h2>

      {/* CỘT TRÁI (Main Video Cinema - Phóng to cực đại theo chiều cao khả dụng) */}
      <div className="lesson-video-main flex flex-1 min-w-0 flex-col items-center justify-center h-full min-h-0 py-0.5 overflow-hidden">
        <div
          className="lesson-video-frame group relative aspect-video max-w-full max-h-full overflow-hidden bg-transparent flex items-center justify-center shrink-0 w-full lg:max-w-none"
          style={{
            width: 'min(100%, 1100px, calc((100dvh - 190px) * 16 / 9))',
            maxHeight: 'min(68vh, calc(100dvh - 190px))',
          }}
        >
          <iframe
            ref={iframeRef}
            src={videoEmbedSrc}
            title={config.title}
            allow="autoplay; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            className="pointer-events-none h-full w-full border-0"
            onLoad={() => {
              iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*')
            }}
          />
          <button
            type="button"
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
            className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-transparent focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-brand-400"
          >
            <span className={cn(
              'flex size-14 items-center justify-center rounded-full bg-brand-500/95 text-white shadow-2xl transition-opacity sm:size-16',
              isPlaying && 'opacity-0 group-hover:opacity-100 focus:opacity-100',
            )}>
              {isPlaying ? <Pause size={28} className="fill-white" /> : <Play size={28} className="translate-x-0.5 fill-white" />}
            </span>
          </button>
        </div>

      </div>

      {/* CỘT PHẢI: Thanh tiến trình stepper & Vertical Playlist & Action Dock */}
      <div
        data-testid="video-timeline-stepper"
        className="lesson-video-timeline relative z-10 w-full landscape:w-80 lg:w-80 xl:w-96 shrink-0 flex flex-col justify-between gap-2 overflow-hidden bg-brand-50/70 border-2 border-brand-200 p-2.5 sm:p-3 [@media(max-height:760px)]:py-1 shadow-clay-xs rounded-2xl min-h-0 landscape:h-fit lg:h-fit landscape:max-h-full lg:max-h-full landscape:self-start lg:self-start"
      >
        {/* Header mốc & Thời gian */}
        <div className="shrink-0 flex items-center justify-between gap-1 pb-2 border-b border-brand-200/80 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-black uppercase tracking-wider text-brand-900 flex items-center gap-1 truncate">
              <span className="truncate">Lộ trình</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 shrink-0">
              {videoChapters.length} mốc
            </span>
          </div>

          <span className="text-[11px] sm:text-xs font-mono font-black text-brand-700 shrink-0">
            {Math.floor((videoSeekSec || 0) / 60)}:{String((videoSeekSec || 0) % 60).padStart(2, '0')} / {Math.floor(totalDurationSec / 60)}:{String(totalDurationSec % 60).padStart(2, '0')}
          </span>
        </div>

        {/* TRACK & CONTROLS GRID */}
        <div className="lesson-video-controls grid grid-cols-[auto_auto_1fr] grid-rows-1 landscape:flex lg:flex landscape:flex-wrap lg:flex-wrap gap-2 flex-1 min-h-0">
          
          {/* NÚT PLAY / TUA LẠI */}
          <button
            type="button"
            data-testid="video-timeline-play-btn"
            onClick={togglePlayPause}
            className="lesson-video-play col-start-1 row-start-1 landscape:order-2 lg:order-2 size-11 sm:size-12 rounded-2xl border-2 border-brand-600 bg-brand-500 text-white shadow-clay hover:bg-brand-600 active:scale-95 flex items-center justify-center cursor-pointer transition-all self-center shrink-0 z-10"
            aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
            title={isPlaying ? 'Tạm dừng video' : 'Phát video'}
          >
            {isPlaying ? <Pause size={16} className="fill-white shrink-0" /> : <Play size={16} className="translate-x-0.5 fill-white shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => handleSeek(0)}
            className="col-start-2 row-start-1 landscape:order-3 lg:order-3 size-11 sm:size-12 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 flex items-center justify-center cursor-pointer transition-all self-center shrink-0"
            aria-label="Tua lại từ đầu"
            title="Tua lại từ đầu"
          >
            <RotateCcw size={17} />
          </button>

          {/* TRACK TIẾN ĐỘ */}
          <div className="lesson-video-track col-start-3 row-start-1 landscape:order-1 lg:order-1 landscape:basis-full lg:basis-full landscape:w-full lg:w-full relative flex-1 min-h-[48px] landscape:min-h-0 lg:min-h-0 landscape:overflow-y-auto lg:overflow-y-auto landscape:pr-1 lg:pr-1 landscape:pb-2 lg:pb-2">
            
            {/* Thanh tiến trình ngang: bấm các mốc để tua tới đoạn cần xem. */}
            <div className="lesson-video-horizontal-line absolute top-1/2 left-0 right-0 h-2.5 sm:h-3 rounded-full bg-white border-2 border-brand-200 shadow-inner flex items-center landscape:hidden lg:hidden -translate-y-1/2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-mint-400 via-sky-400 to-brand-500 transition-all duration-150 pointer-events-none"
                style={{
                  width: `${Math.min(100, Math.max(4, (((videoSeekSec || 0) / totalDurationSec) * 100)))}%`,
                }}
              />
            </div>

            {/* Vertical Line (Landscape) */}
            <div className="lesson-video-vertical-line absolute left-[11px] top-4 bottom-4 w-1.5 bg-brand-100 rounded-full shadow-inner hidden landscape:block lg:block z-0">
              <div
                className="w-full rounded-full bg-gradient-to-b from-mint-400 via-sky-400 to-brand-500 transition-all duration-150 pointer-events-none"
                style={{
                  height: `${Math.min(100, Math.max(0, (((videoSeekSec || 0) / totalDurationSec) * 100)))}%`,
                }}
              />
            </div>

            {/* Nodes Container */}
            <div className="lesson-video-nodes relative w-full h-full landscape:h-max lg:h-max landscape:min-h-full lg:min-h-full flex landscape:flex-col lg:flex-col gap-0 landscape:gap-2.5 lg:gap-2.5 z-10">
              {videoChapters.map((m, idx) => {
                const posPercent = Math.max(3, Math.min(97, (m.startSec / totalDurationSec) * 100))
                const isPassed = (videoSeekSec || 0) >= m.startSec
                const isCurrent = currentChapterIndex === idx
                
                return (
                  <div
                    key={idx}
                    className="lesson-video-node-row absolute top-1/2 -translate-x-1/2 -translate-y-1/2 landscape:relative lg:relative landscape:top-auto lg:top-auto landscape:left-auto lg:left-auto landscape:translate-x-0 lg:translate-x-0 landscape:translate-y-0 lg:translate-y-0 flex items-center gap-2.5 w-fit landscape:w-full lg:w-full landscape:shrink-0 lg:shrink-0 left-[var(--portrait-left)]"
                    style={{ '--portrait-left': `${posPercent}%` } as React.CSSProperties}
                  >
                    {/* Node Circle */}
                    <button
                      type="button"
                      data-testid={`video-chapter-node-${idx + 1}`}
                      onClick={() => handleSeek(m.startSec)}
                      className={cn(
                        'lesson-video-node-button flex items-center justify-center rounded-full font-display font-black text-[10px] sm:text-xs select-none cursor-pointer border shadow-clay transition-all duration-200 shrink-0 z-10',
                        isCurrent
                          ? 'size-5 sm:size-6 landscape:size-6 lg:size-6 bg-brand-500 text-white border-brand-200 ring-2 ring-brand-300'
                          : isPassed
                          ? 'size-4 sm:size-5 landscape:size-6 lg:size-6 bg-mint-500 text-white border-white hover:bg-mint-600'
                          : 'size-4 sm:size-5 landscape:size-6 lg:size-6 bg-white text-brand-600 border-brand-200 hover:bg-brand-50'
                      )}
                      title={`${Math.floor(m.startSec / 60)}:${String(m.startSec % 60).padStart(2, '0')}: ${m.label}`}
                    >
                      {idx + 1}
                    </button>

                    {/* Node Label (Landscape only) */}
                    <button
                      type="button"
                      onClick={() => handleSeek(m.startSec)}
                      className={cn(
                        "lesson-video-node-label hidden landscape:flex lg:flex flex-1 text-left px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all min-w-0 flex-col gap-0 shadow-2xs cursor-pointer",
                        isCurrent ? 'bg-brand-500 text-white border-brand-600 ring-1 ring-brand-300 shadow-clay-xs' :
                        isPassed ? 'bg-mint-50 text-mint-900 border-mint-200 hover:bg-mint-100' :
                        'bg-white text-slate-700 border-brand-200 hover:bg-brand-50'
                      )}
                    >
                      <div className="text-xs sm:text-[13px] font-bold truncate leading-tight w-full">{m.label}</div>
                      <div className={cn("text-[10px] sm:text-[11px] font-mono", isCurrent ? 'text-brand-100 font-black' : 'text-slate-500')}>
                        {Math.floor(m.startSec / 60)}:{String(m.startSec % 60).padStart(2, '0')}
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* Action Button Footer Neo Ở Chân Cột Phải */}
        <div data-testid="video-action-footer" className="shrink-0 flex justify-between items-center pt-2 border-t border-brand-200/80 gap-2 mt-auto">
          {onPrevious ? (
            <Button
              variant="secondary"
              onClick={onPrevious}
              className="rounded-xl text-xs py-1.5 px-2.5 shrink-0 [@media(max-height:760px)]:py-1"
            >
              Quay lại câu đố
            </Button>
          ) : <div />}

          <button
            type="button"
            className="flex-1 min-h-[48px] py-2.5 px-3 text-xs sm:text-sm font-black rounded-2xl border-2 border-brand-600 bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center gap-1.5 cursor-pointer ml-auto shadow-clay transition-all active:scale-[0.98] disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
            onClick={handleContinue}
            disabled={!isVideoCompleted}
            aria-describedby={!isVideoCompleted ? 'video-progress-requirement' : undefined}
          >
            <span>{!isVideoCompleted ? 'Xem đủ video để tiếp tục' : hasSlides ? 'Tiếp tục sang Thử Tài Phản Xạ' : 'Làm bài test thử tài'}</span>
          </button>
          {!isVideoCompleted && <span id="video-progress-requirement" className="sr-only">Cần xem ít nhất 75 phần trăm video trước khi tiếp tục.</span>}
        </div>
      </div>
    </section>
  )
}
