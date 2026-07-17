import { useEffect, useState } from 'react'
import { Play, Pause, Subtitles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { VIDEO_GUIDES } from '@/data/challenges'
import { MASCOT_SRC } from '@/data/mock'

export function VideoGuideButton({ guideId }: { guideId: keyof typeof VIDEO_GUIDES }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Play className="size-4" aria-hidden />
        Xem video hướng dẫn
      </Button>
      <VideoGuideModal guideId={guideId} open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function VideoGuideModal({
  guideId,
  open,
  onClose,
}: {
  guideId: keyof typeof VIDEO_GUIDES
  open: boolean
  onClose: () => void
}) {
  const guide = VIDEO_GUIDES[guideId]
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const total = 30

  useEffect(() => {
    if (!open || !playing) return
    const id = window.setInterval(() => {
      setT((x) => {
        if (x >= total) {
          setPlaying(false)
          return total
        }
        return x + 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [open, playing])

  useEffect(() => {
    if (!open) {
      setPlaying(false)
      setT(0)
    }
  }, [open])

  const beat =
    [...guide.beats].reverse().find((b) => t >= b.t) ?? guide.beats[0]

  return (
    <Modal open={open} onClose={onClose} title={guide.title} className="max-w-lg">
      <div className="space-y-3">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-sky-400">
          <img
            src={MASCOT_SRC}
            alt=""
            className="absolute bottom-4 left-4 size-20 opacity-95"
          />
          <div className="absolute inset-x-4 bottom-4 rounded-xl bg-[#2a3352]/80 px-3 py-2 text-center text-sm font-bold text-white">
            <Subtitles className="mr-1 inline size-4" aria-hidden />
            {beat.text}
          </div>
          <p className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-extrabold text-brand-600">
            {t}s / {total}s · Mô phỏng
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-brand-100">
          <div
            className="h-full bg-brand-500 transition-[width] duration-300"
            style={{ width: `${(t / total) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              if (t >= total) setT(0)
              setPlaying(!playing)
            }}
          >
            {playing ? (
              <>
                <Pause className="size-4" aria-hidden /> Tạm dừng
              </>
            ) : (
              <>
                <Play className="size-4" aria-hidden /> Phát
              </>
            )}
          </Button>
          <Button variant="secondary" onClick={() => { setT(0); setPlaying(true) }}>
            Xem lại từ đầu
          </Button>
        </div>
        <ol className="space-y-1.5 text-sm font-semibold text-muted">
          {guide.beats.map((b) => (
            <li
              key={b.t}
              className={
                beat.t === b.t ? 'rounded-xl bg-brand-50 px-2 py-1 text-text' : 'px-2'
              }
            >
              {b.t}s — {b.text}
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted">
          Video hướng dẫn demo (không autoplay âm thanh). Có phụ đề chữ đầy đủ.
        </p>
      </div>
    </Modal>
  )
}
