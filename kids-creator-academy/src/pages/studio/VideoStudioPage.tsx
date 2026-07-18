import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Subtitles, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, ChoiceCard } from '@/components/ui/Card'
import { LoadingCreature } from '@/components/feedback/States'
import { MUSIC_TRACKS, VOICES } from '@/data/mock'
import { mockRenderVideo } from '@/lib/generate'
import { useDemoStore } from '@/store/demo-store'
import { cn } from '@/lib/cn'

export function VideoStudioPage() {
  const navigate = useNavigate()
  const scenes = useDemoStore((s) => s.videoScenes)
  const updateVideoScene = useDemoStore((s) => s.updateVideoScene)
  const voiceId = useDemoStore((s) => s.selectedVoiceId)
  const musicId = useDemoStore((s) => s.selectedMusicId)
  const subtitlesOn = useDemoStore((s) => s.subtitlesOn)
  const videoRendered = useDemoStore((s) => s.videoRendered)
  const setVoice = useDemoStore((s) => s.setVoice)
  const setMusic = useDemoStore((s) => s.setMusic)
  const setSubtitles = useDemoStore((s) => s.setSubtitles)
  const setVideoRendered = useDemoStore((s) => s.setVideoRendered)
  const addBadge = useDemoStore((s) => s.addBadge)
  const addToast = useDemoStore((s) => s.addToast)
  const project = useDemoStore((s) => s.currentProject)
  const setCurrentProjectCoverOnScenes = useDemoStore((s) => s.currentProject.cover)

  const [stage, setStage] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [activeScene, setActiveScene] = useState(0)

  const total = scenes.reduce((sum, s) => sum + s.duration, 0)

  const render = async () => {
    setRendering(true)
    try {
      await mockRenderVideo(setStage)
      setVideoRendered(true)
      useDemoStore.getState().markPracticeDone('cinema')
      addBadge('Đạo diễn mini')
      addToast({
        type: 'success',
        title: 'Video đã sẵn sàng!',
        description: 'Làm trắc nghiệm cuối bài, rồi xem Portfolio.',
      })
      navigate('/lesson/cinema?step=quiz')
    } finally {
      setRendering(false)
      setStage(null)
    }
  }

  const previewPlay = () => {
    if (playing) return
    setPlaying(true)
    setActiveScene(0)
    let i = 0
    const tick = () => {
      if (i >= scenes.length - 1) {
        setPlaying(false)
        return
      }
      i += 1
      setActiveScene(i)
      window.setTimeout(tick, scenes[i].duration * 400)
    }
    window.setTimeout(tick, scenes[0].duration * 400)
  }

  if (rendering) {
    return (
      <div className="mx-auto max-w-xl">
        <LoadingCreature stage={stage} />
        <p className="mt-3 text-center text-sm text-muted" aria-live="polite">
          {stage}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">Rạp phim mini</h1>
        <p className="text-muted">
          Biến 4 khung truyện thành video kể chuyện ~{total}s · Có AI hỗ trợ
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <Card className="overflow-hidden p-0">
          <div className="relative aspect-video bg-gradient-to-br from-brand-600 to-sky-400">
            <img
              src={scenes[activeScene]?.thumbnail || setCurrentProjectCoverOnScenes}
              alt={`Cảnh ${activeScene + 1}`}
              className="size-full object-cover opacity-95"
            />
            {subtitlesOn ? (
              <div className="absolute inset-x-6 bottom-6 rounded-xl bg-[#24304A]/80 px-4 py-2 text-center text-sm font-semibold text-white">
                {scenes[activeScene]?.narration}
              </div>
            ) : null}
            {playing ? (
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-600">
                Đang phát (mô phỏng)
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            <Button onClick={previewPlay} disabled={playing}>
              <Play className="size-4" aria-hidden />
              Xem trước
            </Button>
            <Button variant="secondary" onClick={() => setSubtitles(!subtitlesOn)}>
              <Subtitles className="size-4" aria-hidden />
              Phụ đề: {subtitlesOn ? 'Bật' : 'Tắt'}
            </Button>
            {!videoRendered ? (
              <Button variant="primary" onClick={render}>
                Render video (giả lập)
              </Button>
            ) : (
              <Button onClick={() => navigate('/portfolio/star-cat')}>Mở Portfolio</Button>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="font-display text-lg font-semibold">Giọng kể (giả lập)</h2>
            <p className="text-sm text-muted">Không clone giọng. Không tự phát âm thanh.</p>
            <div className="mt-3 space-y-2">
              {VOICES.map((v) => (
                <ChoiceCard
                  key={v.id}
                  selected={voiceId === v.id}
                  onClick={() => setVoice(v.id)}
                  className="p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold">{v.label}</p>
                      <p className="text-sm text-muted">{v.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={(e) => {
                        e.stopPropagation()
                        addToast({
                          type: 'info',
                          title: `Nghe thử: ${v.label}`,
                          description: 'Demo — không phát file audio thật.',
                        })
                      }}
                    >
                      <Volume2 className="size-4" aria-hidden />
                      Nghe thử
                    </Button>
                  </div>
                </ChoiceCard>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold">Nhạc nền an toàn</h2>
            <div className="mt-3 grid gap-2">
              {MUSIC_TRACKS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMusic(m.id)}
                  className={cn(
                    'min-h-12 cursor-pointer rounded-2xl border px-4 text-left text-sm font-bold',
                    musicId === m.id
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-border bg-white',
                  )}
                >
                  {m.label}
                  <span className="block text-xs font-medium text-muted">{m.description}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <h2 className="font-display text-xl font-semibold">Timeline cảnh</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {scenes.map((sc, idx) => (
            <div
              key={sc.id}
              className={cn(
                'rounded-2xl border p-3',
                activeScene === idx ? 'border-brand-500 bg-brand-50' : 'border-border',
              )}
            >
              <img
                src={sc.thumbnail || project.cover}
                alt=""
                className="mb-2 aspect-video w-full rounded-xl object-cover"
              />
              <p className="font-bold">{sc.title}</p>
              <label className="mt-2 block text-xs font-bold text-muted">
                Thời lượng: {sc.duration}s
                <input
                  type="range"
                  min={2}
                  max={6}
                  value={sc.duration}
                  onChange={(e) =>
                    updateVideoScene(sc.id, { duration: Number(e.target.value) })
                  }
                  className="mt-1 w-full"
                />
              </label>
              <label className="mt-2 block text-xs font-bold text-muted">
                Chuyển động
                <select
                  value={sc.motion}
                  onChange={(e) =>
                    updateVideoScene(sc.id, {
                      motion: e.target.value as typeof sc.motion,
                    })
                  }
                  className="mt-1 min-h-11 w-full rounded-xl border border-border bg-white px-2 text-sm font-semibold text-text"
                >
                  <option value="none">Không</option>
                  <option value="pan">Pan</option>
                  <option value="zoom">Zoom</option>
                  <option value="float">Float</option>
                </select>
              </label>
              <label className="mt-2 block text-xs font-bold text-muted">
                Lời kể
                <textarea
                  value={sc.narration}
                  maxLength={120}
                  onChange={(e) => updateVideoScene(sc.id, { narration: e.target.value })}
                  className="mt-1 min-h-16 w-full rounded-xl border border-border p-2 text-sm font-medium text-text"
                />
              </label>
            </div>
          ))}
        </div>
      </Card>

      {videoRendered ? (
        <Card className="border-mint-400/40 bg-mint-100/40">
          <p className="font-display text-xl font-semibold text-success">
            Output card: {project.title}.mp4 (mô phỏng)
          </p>
          <p className="text-sm text-muted">
            Đã lưu riêng tư vào Ba lô · Nhãn: Có AI hỗ trợ · Phụ đề: {subtitlesOn ? 'Có' : 'Không'}
          </p>
        </Card>
      ) : null}
    </div>
  )
}
