import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Lock, Star } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { api, type QuestProgress } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { designerAssets } from '@/shared/config/assets'

const EMOJI: Record<string, string> = {
  'meet-mascot': '👋',
  character: '🐱',
  'world-build': '🪐',
  plot: '⚡',
  'prompt-lab': '🎨',
  detective: '🔎',
  comic: '📖',
  cinema: '🎬',
  'safe-hello': '🛡️',
  'safe-spot': '👀',
  'safe-choice': '✅',
  'safe-badge': '🏅',
  'voice-idea': '💭',
  'voice-pick': '🎙️',
  'voice-scene': '🖼️',
  'voice-show': '🎭',
  'bot-parts': '🤖',
  'bot-job': '🧰',
  'bot-train': '📚',
  'bot-safe': '🛡️',
}

export function WorldPage() {
  const { courseId = 'course-comic' } = useParams()
  const [quests, setQuests] = useState<QuestProgress[]>([])
  const [meta, setMeta] = useState({ totalStars: 0, completedCount: 0 })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        // enroll if needed
        await api('/api/enrollments', {
          method: 'POST',
          body: JSON.stringify({ courseId }),
        }).catch(() => null)
        const data = await api<{
          quests: QuestProgress[]
          totalStars: number
          completedCount: number
        }>(`/api/progress/${courseId}`)
        setQuests(data.quests)
        setMeta({ totalStars: data.totalStars, completedCount: data.completedCount })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không tải được bản đồ')
      } finally {
        setLoading(false)
      }
    })()
  }, [courseId])

  const next = quests.find(
    (q) => q.status === 'available' || q.status === 'in_progress',
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="ui-card relative overflow-hidden">
        <img
          src={designerAssets.lobby.bgCharacter}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="relative p-5">
          <p className="text-sm font-bold text-brand-500">Bản đồ nhiệm vụ</p>
          <h1 className="font-display text-3xl">
            {courseId === 'course-safety'
              ? 'An toàn với AI'
              : courseId === 'course-voice'
                ? 'Giọng kể chuyện'
                : courseId === 'course-robot'
                  ? 'Robot sáng tạo'
                  : 'Tạo truyện tranh AI'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {meta.completedCount}/{quests.length} trạm · {meta.totalStars} sao
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={`/course/${courseId}`}>
              <Button variant="secondary">Giới thiệu khóa học</Button>
            </Link>
            {next && (
              <Link to={`/lesson/${next.id}`}>
                <Button>Làm trạm: {next.title}</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-coral-100 px-3 py-2 text-danger" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-muted">Đang mở bản đồ…</p>
      ) : (
        <div className="relative mx-auto w-full max-w-md py-4">
          {/* path line */}
          <div className="absolute left-1/2 top-8 bottom-8 w-1 -translate-x-1/2 rounded-full bg-brand-100" />
          <ol className="relative flex flex-col gap-8">
            {quests.map((q, i) => {
              const locked = q.status === 'locked'
              const done = q.status === 'completed'
              const side = i % 2 === 0 ? 'self-start' : 'self-end'
              const emoji = EMOJI[q.id] ?? '⭐'
              const inner = (
                <div
                  className={cn(
                    'flex items-center gap-3',
                    side === 'self-end' && 'flex-row-reverse',
                  )}
                >
                  <div
                    className={cn(
                      'station',
                      locked && 'station-locked bg-border text-muted',
                      !locked && !done && 'station-available bg-brand-500 text-white',
                      done && 'bg-mint-400 text-white',
                    )}
                    style={!locked && !done ? { background: q.accent } : undefined}
                  >
                    {locked ? <Lock size={28} /> : emoji}
                  </div>
                  <div
                    className={cn(
                      'ui-card max-w-[200px] p-3',
                      locked && 'opacity-70',
                    )}
                  >
                    <p className="text-xs font-bold text-muted">Trạm {q.order}</p>
                    <p className="font-extrabold leading-tight">{q.title}</p>
                    <p className="mt-1 text-xs text-muted">{q.duration}</p>
                    {done && (
                      <p className="mt-1 flex items-center gap-1 text-sm font-bold text-warning">
                        {Array.from({ length: q.stars }).map((_, si) => (
                          <Star key={si} size={14} fill="currentColor" />
                        ))}
                      </p>
                    )}
                  </div>
                </div>
              )

              return (
                <li key={q.id} className={cn('z-10 w-full', side === 'self-start' ? 'pr-8' : 'pl-8 flex justify-end')}>
                  {locked ? (
                    inner
                  ) : (
                    <Link to={`/lesson/${q.id}`} className="block">
                      {inner}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['course-comic', 'Truyện tranh'],
            ['course-safety', 'An toàn'],
            ['course-voice', 'Giọng kể'],
            ['course-robot', 'Robot'],
          ] as const
        ).map(([id, label]) => (
          <Link key={id} to={`/world/${id}`}>
            <Button variant={courseId === id ? 'primary' : 'secondary'}>{label}</Button>
          </Link>
        ))}
      </div>
    </div>
  )
}
