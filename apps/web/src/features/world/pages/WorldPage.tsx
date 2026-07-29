import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { CheckCircle2, Lock, Star, Trophy, Zap } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import {
  CourseBookIcon,
  NavWorldIcon,
} from '@/shared/components/icons/KidNavIcons'
import { api, type QuestProgress } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { designerAssets } from '@/shared/config/assets'

type PathwayCourse = {
  id: string
  title: string
  shortTitle: string
  status: 'completed' | 'active' | 'available' | 'locked'
  reasonCode: string
  completionPercent: number
  missingPrerequisites: string[]
  coverImage: string | null
}

type Pathway = {
  student: { nickname: string | null; ageBand: string }
  policy: { label: string } | null
  recommendedCourseId: string | null
  courses: PathwayCourse[]
}

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
          <span className="font-display text-2xl text-white" aria-hidden="true">
            {quest.order}
          </span>
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
  const [quests, setQuests] = useState<QuestProgress[]>([])
  const [meta, setMeta] = useState({ totalStars: 0, completedCount: 0 })
  const [courseTitle, setCourseTitle] = useState('Hành trình sáng tạo')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pathway, setPathway] = useState<Pathway | null>(null)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        if (!courseId) {
          const journey = await api<Pathway>('/api/learning/pathway')
          setPathway(journey)
          return
        }
        const [data, course, journey] = await Promise.all([
          api<{
            quests: QuestProgress[]
            totalStars: number
            completedCount: number
          }>(`/api/progress/${courseId}`),
          api<{ course: { title: string } }>(`/api/courses/${courseId}`),
          api<Pathway>('/api/learning/pathway'),
        ])
        const pathRow = journey.courses.find((row) => row.id === courseId)
        if (!pathRow || pathRow.status === 'locked') {
          throw new Error('Khóa học này chưa được mở trong lộ trình của con.')
        }
        setPathway(journey)
        setQuests(data.quests)
        setMeta({ totalStars: data.totalStars, completedCount: data.completedCount })
        setCourseTitle(course.course.title)
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
  const progressPct = quests.length > 0 ? Math.round((meta.completedCount / quests.length) * 100) : 0

  if (!courseId) {
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="ui-skeleton h-32 rounded-3xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="ui-skeleton h-40 rounded-3xl" />
            <div className="ui-skeleton h-40 rounded-3xl" />
          </div>
        </div>
      )
    }
    if (error || !pathway) {
      return (
        <p className="ui-card p-5 text-danger" role="alert">
          {error ?? 'Chưa tải được lộ trình học.'}
        </p>
      )
    }
    return <PathwayOverview pathway={pathway} />
  }

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
              <p className="mb-1 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-brand-500">
                <NavWorldIcon size={20} aria-hidden="true" />
                Bản đồ nhiệm vụ
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
                  <Zap size={16} aria-hidden="true" />
                  Làm trạm {next.order}
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
              <span className="flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-white/80 px-3 py-1.5 text-xs font-bold shadow-soft transition hover:bg-brand-50">
                <CourseBookIcon size={17} aria-hidden="true" />
                Giới thiệu khóa
              </span>
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
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-sun-400 to-coral-400 shadow-clay">
                <Trophy size={48} className="text-white" aria-hidden="true" />
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

const reasonLabels: Record<string, string> = {
  completed: 'Đã hoàn thành',
  in_progress: 'Đang học',
  manual_override: 'Được giáo viên mở',
  manual_block: 'Đang tạm khóa',
  not_entitled: 'Chưa ghi danh',
  age_mismatch: 'Chưa phù hợp nhóm tuổi',
  not_available_yet: 'Chưa đến ngày mở',
  prerequisite_incomplete: 'Cần hoàn thành khóa trước',
  requirements_met: 'Sẵn sàng học',
}

function PathwayOverview({ pathway }: { pathway: Pathway }) {
  const recommended = pathway.courses.find(
    (course) => course.id === pathway.recommendedCourseId,
  )
  return (
    <div className="page-enter flex flex-col gap-5">
      <header className="ui-card overflow-hidden p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="rounded-3xl bg-brand-100 p-3 text-brand-600">
            <CourseBookIcon size={30} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
              Lộ trình cá nhân
            </p>
            <h1 className="font-display text-2xl sm:text-3xl">
              Hành trình của {pathway.student.nickname ?? 'con'}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {pathway.policy?.label ?? `Nhóm tuổi ${pathway.student.ageBand}`}
            </p>
          </div>
        </div>
        {recommended && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mint-50 p-4">
            <div>
              <p className="text-xs font-bold uppercase text-success">Gợi ý tiếp theo</p>
              <p className="font-display text-lg">{recommended.title}</p>
            </div>
            <Link to={`/world/${recommended.id}`}>
              <Button>Tiếp tục hành trình</Button>
            </Link>
          </div>
        )}
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pathway.courses.map((course, index) => {
          const locked = course.status === 'locked'
          const content = (
            <article
              className={cn(
                'ui-card flex h-full flex-col gap-3 p-5',
                course.id === pathway.recommendedCourseId && 'ring-2 ring-mint-300',
                locked && 'opacity-75',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 font-display text-brand-700">
                  {index + 1}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs font-bold',
                    course.status === 'completed'
                      ? 'bg-mint-100 text-success'
                      : locked
                        ? 'bg-sky-100 text-muted'
                        : 'bg-sun-100 text-warning',
                  )}
                >
                  {reasonLabels[course.reasonCode] ?? course.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted">{course.shortTitle}</p>
                <h2 className="mt-1 font-display text-xl">{course.title}</h2>
              </div>
              <div className="mt-auto">
                <div className="h-2 overflow-hidden rounded-full bg-brand-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${course.completionPercent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted">{course.completionPercent}% hoàn thành</p>
                {locked && course.reasonCode === 'not_entitled' && (
                  <Link
                    className="mt-3 inline-block text-sm font-bold text-brand-600 underline"
                    to={`/course/${course.id}`}
                  >
                    Xem khóa học để ghi danh
                  </Link>
                )}
              </div>
            </article>
          )
          return locked ? <div key={course.id}>{content}</div> : <Link key={course.id} to={`/world/${course.id}`}>{content}</Link>
        })}
      </div>
    </div>
  )
}
