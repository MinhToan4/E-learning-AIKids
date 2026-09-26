import { useCallback, useMemo, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { resolveLectureVideo } from '@/features/lesson/lib/lecture-video'

type Props = {
  title: string
  url: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

export function LectureVideo({ title, url, onPlay, onPause, onEnded }: Props) {
  const source = useMemo(() => resolveLectureVideo(url), [url])
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const toggleYouTube = useCallback(() => {
    const nextPlaying = !isPlaying
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
      event: 'command',
      func: nextPlaying ? 'playVideo' : 'pauseVideo',
      args: [],
    }), '*')
    setIsPlaying(nextPlaying)
    if (nextPlaying) onPlay?.()
    else onPause?.()
  }, [isPlaying, onPause, onPlay])

  if (!source) {
    return (
      <p className="rounded-2xl border-2 border-coral-100 bg-coral-100/40 p-4 text-sm font-bold text-danger" role="alert">
        Video bài giảng chưa có đường dẫn HTTPS hợp lệ.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-border bg-black/5">
      <p className="bg-brand-50 px-3 py-2 text-xs font-extrabold uppercase text-brand-600">
        Video bài giảng
      </p>
      {source.kind === 'youtube' ? (
        <div className="group relative aspect-video w-full bg-black">
          <iframe
            ref={iframeRef}
            className="pointer-events-none size-full"
            src={source.src}
            title={`Video bài giảng: ${title}`}
            allow="autoplay; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*')}
          />
          <button
            type="button"
            onClick={toggleYouTube}
            aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-transparent focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-brand-400"
          >
            <span className={`flex size-16 items-center justify-center rounded-full bg-brand-500/95 text-white shadow-2xl transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-100 focus:opacity-100' : ''}`}>
              {isPlaying ? <Pause size={28} className="fill-white" /> : <Play size={28} className="translate-x-0.5 fill-white" />}
            </span>
          </button>
        </div>
      ) : (
        <video
          className="aspect-video w-full bg-black"
          controls
          playsInline
          preload="metadata"
          src={source.src}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
        >
          Trình duyệt không hỗ trợ video.
        </video>
      )}
      {source.kind === 'youtube' && (
        <p className="bg-white px-3 py-2 text-xs text-muted">
          Video được phát bằng chế độ tăng cường riêng tư của YouTube.
        </p>
      )}
    </div>
  )
}
