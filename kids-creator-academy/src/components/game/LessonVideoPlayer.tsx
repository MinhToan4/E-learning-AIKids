import { useEffect, useState } from 'react'
import { Pause, Play, Subtitles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MASCOT_SRC } from '@/data/mock'
import type { LessonVideo } from '@/data/lessons'
import { cn } from '@/lib/cn'

/**
 * Inline “video” player for theory phase — demo without external media.
 * Pattern: Khan / BrainPOP style short instructional clip + captions.
 */
export function LessonVideoPlayer({
  video,
  onComplete,
  onProgress,
  completed,
}: {
  video: LessonVideo
  onComplete: () => void
  onProgress?: (sec: number) => void
  completed?: boolean
}) {
  const total = video.durationSec
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const done = completed || t >= total

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setT((x) => {
        if (x >= total) {
          setPlaying(false)
          return total
        }
        const next = x + 1
        onProgress?.(next)
        if (next >= total) {
          setPlaying(false)
          onComplete()
        }
        return next
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [playing, total, onComplete, onProgress])

  const beat =
    [...video.beats].reverse().find((b) => t >= b.t) ?? video.beats[0]

  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-[1.25rem] border-2 border-white bg-gradient-to-br from-brand-500 via-[#6d5efc] to-sky-400 shadow-clay">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-1/4 top-1/4 size-32 rounded-full bg-white/40 blur-2xl" />
          <div className="absolute bottom-0 right-1/4 size-40 rounded-full bg-sun-400/40 blur-2xl" />
        </div>
        <img
          src={MASCOT_SRC}
          alt=""
          className={cn(
            'absolute bottom-16 left-4 size-20 drop-shadow-lg sm:size-24',
            playing && 'animate-soft-pulse',
          )}
        />
        <p className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-bold text-white">
          {video.title}
        </p>
        <p className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold text-brand-600">
          {Math.min(t, total)}s / {total}s
        </p>
        <div className="absolute inset-x-3 bottom-3 rounded-xl bg-[#1e2740]/85 px-3 py-2.5 text-center text-sm font-bold text-white sm:text-base">
          <Subtitles className="mr-1 inline size-4" aria-hidden />
          {beat?.text}
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-mint-400 transition-[width] duration-300"
          style={{ width: `${(Math.min(t, total) / total) * 100}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="lg"
          onClick={() => {
            if (t >= total) {
              setT(0)
              setPlaying(true)
              return
            }
            setPlaying(!playing)
          }}
        >
          {playing ? (
            <>
              <Pause className="size-5" /> Tạm dừng
            </>
          ) : (
            <>
              <Play className="size-5" /> {t > 0 && t < total ? 'Tiếp tục' : 'Phát video'}
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setT(total)
            setPlaying(false)
            onProgress?.(total)
            onComplete()
          }}
        >
          {done ? (
            <>
              <CheckCircle2 className="size-4 text-success" /> Đã xem xong
            </>
          ) : (
            'Đánh dấu đã xem'
          )}
        </Button>
      </div>

      <ol className="grid gap-1.5 sm:grid-cols-2">
        {video.beats.map((b) => (
          <li
            key={b.t}
            className={cn(
              'rounded-xl px-3 py-2 text-sm font-semibold',
              beat?.t === b.t
                ? 'bg-brand-50 text-text ring-2 ring-brand-200'
                : 'bg-white/80 text-muted',
            )}
          >
            <span className="text-brand-600">{b.t}s</span> — {b.text}
          </li>
        ))}
      </ol>
      <p className="text-xs font-semibold text-muted">
        Video demo (mô phỏng) · Có phụ đề · Không tự phát âm thanh.
      </p>
    </div>
  )
}
