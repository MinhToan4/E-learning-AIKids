import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Lock, Star, Trophy, Zap } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { api, type QuestProgress } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { designerAssets } from '@/shared/config/assets'

// Emoji icons per quest order (fallback to order number)
const QUEST_ICONS = ['🌟', '🧩', '🎨', '📖', '🎭', '🎬', '🔍', '🤖', '💡', '🚀', '🌈', '🏆']

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= count ? 'text-sun-400 fill-sun-400' : 'text-border'}
          fill={i <= count ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

function QuestNode({ quest, index }: { quest: QuestProgress; index: number }) {
  const locked = quest.status === 'locked'
  const done = quest.status === 'completed'
  const available = quest.status === 'available' || quest.status === 'in_progress'
  const icon = QUEST_ICONS[(index) % QUEST_ICONS.length] ?? '⭐'

  const nodeEl = (
    <div className="flex items-center gap-3" style={{ flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}>
      {/* Node circle */}
      <div
        className={cn(
          'quest-node',
          locked && 'quest-node-locked',
          available && 'quest-node-available',
          done && 'quest-node-completed',
        )}
        style={
          !locked && !done
            ? { background: quest.accent || '#6d5efc' }
            : done
              ? undefined
              : undefined
        }
        aria-label={`Trạm ${quest.order}: ${quest.title}`}
      >
        {locked ? (
          <Lock size={28} className="text-muted" aria-hidden />
        ) : done ? (
          <CheckCircle2 size={32} className="text-white" aria-hidden />
        ) : (
          <span className="font-display" style={{ fontSize: '1.8rem' }}>{icon}</span>
        )}
      </div>

      {/* Label card */}
      <div className={cn('quest-label-card', locked && 'opacity-60')}>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-500 mb-0.5">
          Trạm {quest.order}
        </p>
        <p className="font-extrabold text-sm leading-snug text-text">{quest.title}</p>
        <p className="text-xs text-muted mt-0.5">{quest.duration}</p>
        {done && (
          <div className="mt-1.5">
            <StarDisplay count={quest.stars} />
          </div>
        )}
        {available && (
          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-extrabold text-brand-500 bg-brand-50 rounded-full px-2 py-0.5">
            <Zap size={10} aria-hidden /> Làm ngay!
          </span>
        )}
      </div>
    </div>
  )

  return (
    <li
      className={cn(
        'relative z-10 w-full flex',
        index % 2 === 0 ? 'justify-start' : 'justify-end',
      )}
    >
      {locked ? (
        <div className="cursor-not-allowed">{nodeEl}</div>
      ) : (
        <Link to={`/lesson/${quest.id}`} className="block">
          {nodeEl}
        </Link>
      )}
    </li>
  )
}

export function WorldPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [quests, setQuests] = useState<QuestProgress[]>([])
  const [meta, setMeta] = useState({ totalStars: 0, completedCount: 0 })
  const [courseTitle, setCourseTitle] = useState('Hành trình sáng tạo')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        if (!courseId) {
          const catalog = await api<{ courses: Array<{ id: string }> }>('/api/courses')
          const firstCourse = catalog.courses.find((course) => course.id)
          if (!firstCourse) {
            setError('Chưa có khóa học nào được xuất bản.')
            return
          }
          navigate(`/world/${firstCourse.id}`, { replace: true })
          return
        }
        await api('/api/enrollments', {
          method: 'POST',
          body: JSON.stringify({ courseId }),
        }).catch(() => null)
        const [data, course] = await Promise.all([
          api<{
            quests: QuestProgress[]
            totalStars: number
            completedCount: number
          }>(`/api/progress/${courseId}`),
          api<{ course: { title: string } }>(`/api/courses/${courseId}`),
        ])
        setQuests(data.quests)
        setMeta({ totalStars: data.totalStars, completedCount: data.completedCount })
        setCourseTitle(course.course.title)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không tải được bản đồ')
      } finally {
        setLoading(false)
      }
    })()
  }, [courseId, navigate])

  const next = quests.find(
    (q) => q.status === 'available' || q.status === 'in_progress',
  )
  const progressPct = quests.length > 0 ? Math.round((meta.completedCount / quests.length) * 100) : 0

  return (
    <div className="flex flex-col gap-5 page-enter">
      {/* Hero header */}
      <div className="ui-card relative overflow-hidden p-0">
        <img
          src={designerAssets.lobby.bgCharacter}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-sky-400/10" />
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500 mb-1">
                🗺️ Bản đồ nhiệm vụ
              </p>
              <h1 className="font-display text-2xl sm:text-3xl leading-tight">{courseTitle}</h1>
              <p className="mt-1 text-sm text-muted">
                {meta.completedCount}/{quests.length} trạm hoàn thành
                {meta.totalStars > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <Star size={13} className="text-sun-400 fill-sun-400" aria-hidden />
                    {meta.totalStars} sao
                  </span>
                )}
              </p>
            </div>
            {next && (
              <Link to={`/lesson/${next.id}`}>
                <Button className="animate-pop">
                  ▶ Làm trạm {next.order}
                </Button>
              </Link>
            )}
          </div>

          {/* Progress bar */}
          {quests.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-muted">Tiến trình</span>
                <span className="text-xs font-extrabold text-brand-600">{progressPct}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-track-fill"
                  style={{ width: `${progressPct}%` }}
                  role="progressbar"
                  aria-valuenow={progressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold shadow-soft border border-border">
              <Trophy size={13} className="text-sun-600" aria-hidden />
              {meta.totalStars} sao tổng
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold shadow-soft border border-border">
              <CheckCircle2 size={13} className="text-success" aria-hidden />
              {meta.completedCount} trạm xong
            </div>
            <Link to={`/course/${courseId}`}>
              <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold shadow-soft border border-border hover:bg-brand-50 transition cursor-pointer">
                📋 Giới thiệu khóa
              </div>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-coral-100 px-3 py-2 text-danger text-sm" role="alert">
          {error}
        </p>
      )}

      {/* Quest Node Map */}
      {loading ? (
        <div className="flex flex-col items-center gap-5 py-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 w-full max-w-sm" style={{ justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start' }}>
              <div className="ui-skeleton rounded-full" style={{ width: 80, height: 80, flexShrink: 0 }} />
              <div className="ui-skeleton rounded-2xl" style={{ width: 160, height: 72 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative mx-auto w-full max-w-md py-4 px-2">
          {/* Vertical path line */}
          <div className="quest-path-line" />

          <ol className="relative flex flex-col gap-8">
            {quests.map((q, i) => (
              <QuestNode key={q.id} quest={q} index={i} />
            ))}
          </ol>

          {/* Completion trophy at bottom */}
          {quests.length > 0 && meta.completedCount === quests.length && (
            <div className="relative z-10 flex flex-col items-center mt-8 animate-pop">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-sun-400 to-coral-400 text-5xl shadow-clay">
                🏆
              </div>
              <p className="mt-3 font-display text-xl text-text">Xuất sắc!</p>
              <p className="text-sm text-muted">Con đã hoàn thành toàn bộ hành trình!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
