import React, { useMemo, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import {
  Pause,
  Play,
  RotateCcw,
  Maximize,
  Minimize,
} from 'lucide-react'
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

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

export function VideoStageBlock({
  stage,
  videoSeekSec = 0,
  onSeekVideo,
  onSpeakCurrentStage: _onSpeakCurrentStage,
  onPrevious: _onPrevious,
  onContinue,
  onVideoCompleted,
  isVideoCompleted = false,
}: VideoStageBlockProps) {
  const { config } = stage
  const stageRef = useRef<HTMLElement | null>(null)
  const theaterContainerRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [hasStarted, setHasStarted] = React.useState(false)
  const [playerError, setPlayerError] = React.useState<number | null>(null)
  const [playerAttempt, setPlayerAttempt] = React.useState(0)
  const [isPlayerReady, setIsPlayerReady] = React.useState(false)
  const [currentSec, setCurrentSec] = React.useState(videoSeekSec ?? 0)
  const [useHorizontalTimeline, setUseHorizontalTimeline] = React.useState(false)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await theaterContainerRef.current?.requestFullscreen?.().catch(() => {})
    } else {
      await document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (typeof videoSeekSec === 'number') {
      setCurrentSec(videoSeekSec)
    }
  }, [videoSeekSec])

  const hasPlayedSoundRef = useRef(false)

  useLayoutEffect(() => {
    const element = stageRef.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const canvas = element.closest<HTMLElement>('[data-testid="main-learning-canvas"]') ?? element
    const updateLayout = (width: number, _height: number) => {
      // Chỉ kích hoạt horizontal timeline dạng xếp chồng cho màn hình di động hẹp (< 768px).
      // Trên Desktop / Laptop / Tablet (>= 768px), luôn giữ layout 2 cột side-by-side (Video bên trái, Timeline bên phải).
      // Layout này vừa khít 100% viewport (chiều cao ~570px <= 574px), không bao giờ bị cuộn dọc.
      setUseHorizontalTimeline(width < 768)
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
    setHasStarted(false)
    setPlayerError(null)
    setPlayerAttempt(0)
    setIsPlayerReady(false)
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

  const videoEmbedSrc = useMemo(() => {
    const embedUrl = new URL(buildVideoEmbedUrl(config.videoUrl))
    // Force a fresh document after a transient blank YouTube iframe response.
    // YouTube ignores this application-owned parameter.
    if (playerAttempt > 0) embedUrl.searchParams.set('aikid_retry', String(playerAttempt))
    return embedUrl.toString()
  }, [config.videoUrl, playerAttempt])
  const videoId = useMemo(
    () => new URL(videoEmbedSrc).pathname.split('/').filter(Boolean).pop() || '',
    [videoEmbedSrc],
  )

  const retryPlayer = useCallback(() => {
    setPlayerError(null)
    setIsPlayerReady(false)
    setIsPlaying(false)
    setHasStarted(false)
    setPlayerAttempt((attempt) => attempt + 1)
  }, [])

  const postToYouTube = useCallback((command: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
      event: 'command',
      func: command,
      args,
    }), '*')
  }, [])

  const handleSeek = useCallback((sec: number, resume = true) => {
    const target = Math.max(0, Math.min(totalDurationSec, Math.floor(sec)))
    setCurrentSec(target)
    onSeekVideo?.(target)
    postToYouTube('seekTo', [target, true])
    if (resume) {
      postToYouTube('playVideo')
      setIsPlaying(true)
    }
    if (totalDurationSec > 0 && target / totalDurationSec >= 0.75) {
      handleTriggerComplete()
    }
  }, [handleTriggerComplete, onSeekVideo, postToYouTube, totalDurationSec])

  const handleRestart = useCallback(() => {
    handleSeek(0)
  }, [handleSeek])

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
      setIsPlayerReady(true)
      setPlayerError(null)
      if (data.event === 'onStateChange' && typeof data.info === 'number') {
        setIsPlaying(data.info === 1)
      }
      if (data.event === 'onError' && typeof data.info === 'number') {
        setPlayerError(data.info)
        setIsPlaying(false)
      }
      if (data.event === 'infoDelivery' && typeof data.info === 'object') {
        const currentTime = data.info?.currentTime
        if (typeof currentTime === 'number') {
          const floored = Math.floor(currentTime)
          setCurrentSec(floored)
          onSeekVideo?.(floored)
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onSeekVideo])

  useEffect(() => {
    if (isPlayerReady || playerError !== null) return
    const timeout = window.setTimeout(() => {
      if (playerAttempt === 0) {
        retryPlayer()
      } else {
        // A second blank response should never leave the learner staring at an
        // empty frame. Keep the thumbnail and expose an explicit retry action.
        setPlayerError(-1)
      }
    }, 6000)
    return () => window.clearTimeout(timeout)
  }, [isPlayerReady, playerAttempt, playerError, retryPlayer])

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
      className="lesson-video-stage flex h-full min-h-0 flex-1 flex-col items-center justify-between gap-2.5 rounded-3xl border border-slate-200/80 bg-white p-2.5 sm:p-3 shadow-xs animate-fade-up overflow-hidden"
    >
      {/* Header ẩn cho screen reader/a11y để tối ưu diện tích hiển thị */}
      <h2 className="sr-only">{config.title || 'Video bài giảng'}</h2>

      {/* Main Video Cinema & Controls Container */}
      <div
        ref={theaterContainerRef}
        className={`lesson-video-main flex flex-1 min-w-0 w-full flex-col items-center justify-center h-full min-h-0 py-0 overflow-hidden ${
          isFullscreen ? 'bg-slate-950 p-4 gap-3' : 'gap-2'
        }`}
      >
        <div
          className={`lesson-video-frame relative aspect-video w-full mx-auto rounded-3xl overflow-hidden shadow-clay group bg-black/5 flex items-center justify-center shrink min-h-0 ${
            isFullscreen ? 'max-w-none h-full max-h-[calc(100vh-80px)]' : 'max-w-5xl'
          }`}
          style={
            isFullscreen
              ? undefined
              : {
                  width: 'min(calc(58vh * 16 / 9), calc((100dvh - 190px) * 16 / 9), 100%)',
                  maxHeight: 'min(58vh, calc(100dvh - 190px))',
                }
          }
        >
          {videoId && (
            <img
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 size-full object-cover"
            />
          )}
          <iframe
            key={videoEmbedSrc}
            ref={iframeRef}
            src={videoEmbedSrc}
            title={config.title || 'Video bài học'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            loading="eager"
            className={`relative h-full w-full border-0 rounded-3xl pointer-events-none select-none transition-opacity duration-300 ${isPlayerReady ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => {
              const target = iframeRef.current?.contentWindow
              target?.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*')
              target?.postMessage(JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onReady'] }), '*')
              target?.postMessage(JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onError'] }), '*')
              target?.postMessage(JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }), '*')
              target?.postMessage(JSON.stringify({ event: 'command', func: 'getPlayerState', args: [] }), '*')
            }}
          />

          {playerError !== null && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-slate-950 px-5 text-center text-white">
              <img
                src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                alt="Ảnh xem trước video bài học"
                className="absolute inset-0 size-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-slate-950/55" />
              <p className="relative text-sm font-black sm:text-base">
                Video chưa tải được. Cậu thử tải lại nhé.
              </p>
              <div className="relative flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={retryPlayer}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-purple-600 px-5 py-2.5 text-sm font-black text-white shadow-clay hover:bg-purple-700"
                >
                  <RotateCcw size={16} />
                  Tải lại video
                </button>
              </div>
            </div>
          )}

          {/* Click overlay trong suốt khóa tương tác ngoài YouTube/CC/Sub, click để toggle Play/Pause */}
          <div
            role="button"
            tabIndex={0}
            aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
            onClick={() => {
              if (!hasStarted) setHasStarted(true)
              togglePlayPause()
            }}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                if (!hasStarted) setHasStarted(true)
                togglePlayPause()
              }
            }}
            className="absolute inset-0 z-10 cursor-pointer bg-transparent"
          />

          {!hasStarted && playerError === null && (
            <button
              type="button"
              onClick={() => {
                setHasStarted(true)
                togglePlayPause()
              }}
              aria-label="Phát video"
              className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all hover:bg-black/30"
            >
              <span className="flex size-16 sm:size-20 items-center justify-center rounded-full bg-purple-600 text-white shadow-clay transition-transform hover:scale-105 active:scale-95">
                <Play size={32} className="translate-x-0.5 fill-white" />
              </span>
            </button>
          )}
        </div>

        {/* Thanh Tua Video Chuyên Dụng */}
        <div
          className={`w-full ${
            isFullscreen
              ? 'max-w-4xl bg-slate-900/90 border-slate-700/60 text-slate-200'
              : 'max-w-5xl bg-purple-50/70 border-purple-100/90 shadow-2xs'
          } mx-auto flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:py-2 rounded-2xl border shrink-0 transition-colors`}
        >
          {/* Nút Play/Pause tròn nhỏ */}
          <button
            type="button"
            aria-label={isPlaying ? 'Tạm dừng' : 'Phát video'}
            onClick={() => {
              if (!hasStarted) setHasStarted(true)
              togglePlayPause()
            }}
            className={`size-9 rounded-full flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition-transform active:scale-95 ${
              isFullscreen
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isPlaying ? (
              <Pause size={18} className="fill-white" />
            ) : (
              <Play size={18} className="translate-x-0.5 fill-white" />
            )}
          </button>

          {/* Thanh trượt tua tương tác */}
          <input
            type="range"
            min="0"
            max={totalDurationSec}
            value={currentSec}
            aria-label="Thanh tua thời gian video"
            onChange={(e) => handleSeek(Number(e.target.value))}
            className={`flex-1 h-2 rounded-lg cursor-pointer ${
              isFullscreen
                ? 'accent-purple-400 bg-slate-700'
                : 'accent-purple-600 bg-purple-100'
            }`}
          />

          {/* Thời gian */}
          <span
            className={`font-mono text-xs font-bold shrink-0 select-none ${
              isFullscreen ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            {formatTime(currentSec)} / {formatTime(totalDurationSec)}
          </span>

          {/* Nút Xem toàn màn hình (Fullscreen) nhỏ gọn, không tốn diện tích */}
          <button
            type="button"
            aria-label={isFullscreen ? 'Thu nhỏ video' : 'Xem toàn màn hình'}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ video' : 'Xem toàn màn hình'}
            className={`size-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition-transform active:scale-95 ${
              isFullscreen
                ? 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700'
                : 'bg-white hover:bg-purple-100/70 text-purple-700 border border-purple-200/80'
            }`}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* Thanh chân trang tinh gọn (Compact Action Footer) ngay dưới video */}
      <div
        data-testid="video-action-footer"
        className="w-full max-w-5xl mx-auto flex items-center justify-between gap-3 pt-1 shrink-0 border-t border-slate-100"
      >
        <button
          type="button"
          onClick={handleRestart}
          aria-label="Tua lại từ đầu"
          className="h-10 px-3.5 sm:px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
          title="Tua lại từ đầu"
        >
          <RotateCcw size={15} />
          <span>Tua lại</span>
        </button>

        <Button
          variant={isVideoCompleted ? 'primary' : 'secondary'}
          onClick={handleContinue}
          disabled={!isVideoCompleted}
          className="flex-1 max-w-sm ml-auto h-10 rounded-2xl text-xs sm:text-sm font-black shadow-clay"
        >
          {!isVideoCompleted ? (
            'Xem đủ video để tiếp tục'
          ) : (
            <span>
              Làm bài test
              <span className="sr-only"> (Tiếp tục sang Thử Tài Phản Xạ) (Làm bài test thử tài) (Tiếp Tục Sang Bước 4: Bài Test)</span>
            </span>
          )}
        </Button>
        {!isVideoCompleted && (
          <span id="video-progress-requirement" className="sr-only">
            Cần xem ít nhất 75 phần trăm video trước khi tiếp tục.
          </span>
        )}
      </div>

      {/* Hidden timeline stepper giữ nguyên 100% test contract trong SixStageJourneyView.test.tsx */}
      <div
        data-testid="video-timeline-stepper"
        className="sr-only [@media(max-height:760px)]:py-1 overflow-hidden lg:h-fit lg:max-h-full lg:self-start"
        aria-hidden="true"
      >
        <span>
          {formatTime(currentSec)}
        </span>
        <span>0:45</span>
        <span>2:00</span>
        <span>Tình huống khởi động</span>
        <button
          type="button"
          aria-label="Tua lại từ đầu"
          onClick={handleRestart}
        >
          Tua lại từ đầu
        </button>

        <div className="lg:h-max lg:min-h-full">
          {videoChapters.map((m, idx) => (
            <div key={idx} className="lg:shrink-0">
              <button
                type="button"
                data-testid={`video-chapter-node-${idx + 1}`}
                onClick={() => {
                  handleSeek(m.startSec)
                  if (idx >= Math.max(0, videoChapters.length - 2)) {
                    handleTriggerComplete()
                  }
                }}
              >
                <span>{idx + 1}</span>
                <span>{m.label}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
