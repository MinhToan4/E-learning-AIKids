import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { CheckCircle2, Lock, Star, Trophy, Zap, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import {
  CourseBookIcon,
  NavWorldIcon,
} from '@/shared/components/icons/KidNavIcons'
import { api, type QuestProgress } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { designerAssets, courseCoverHint } from '@/shared/config/assets'

type PathwayCourse = {
  id: string
  title: string
  shortTitle: string
  status: 'completed' | 'active' | 'available' | 'locked'
  reasonCode: string
  completionPercent: number
  missingPrerequisites: string[]
  coverImage: string | null
  enrolled: boolean
}

type Pathway = {
  student: { nickname: string | null; ageBand: string }
  policy: { label: string } | null
  recommendedCourseId: string | null
  courses: PathwayCourse[]
}

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex flex-wrap items-center gap-1" aria-label={`${count} sao`}>
      <div className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <Star
            key={i}
            size={14}
            className={i <= count ? 'text-sun-400 fill-sun-400' : 'text-border'}
            fill={i <= count ? 'currentColor' : 'none'}
          />
        ))}
      </div>
      {count === 0 && (
        <span className="text-[10px] font-extrabold text-coral-500">
          Thử lại để nhận sao
        </span>
      )}
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
  const [enrollmentRequired, setEnrollmentRequired] = useState(false)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError(null)
      setEnrollmentRequired(false)
      setQuests([])
      setMeta({ totalStars: 0, completedCount: 0 })
      try {
        if (!courseId) {
          const journey = await api<Pathway>('/api/learning/pathway')
          setPathway(journey)
          return
        }
        const [course, journey] = await Promise.all([
          api<{ course: { title: string } }>(`/api/courses/${courseId}`),
          api<Pathway>('/api/learning/pathway'),
        ])
        const pathRow = journey.courses.find((row) => row.id === courseId)
        if (!pathRow || pathRow.status === 'locked') {
          throw new Error('Khóa học này chưa được mở trong lộ trình của con.')
        }
        setPathway(journey)
        setCourseTitle(course.course.title)
        if (pathRow.status === 'available') {
          setEnrollmentRequired(true)
          return
        }
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

      {enrollmentRequired && !loading && (
        <section className="ui-card mx-auto w-full max-w-xl p-6 text-center">
          <CourseBookIcon size={42} className="mx-auto text-brand-500" aria-hidden="true" />
          <h2 className="mt-3 font-display text-2xl">Hành trình chưa bắt đầu</h2>
          <p className="mt-2 text-sm text-muted">
            Xem giới thiệu và bắt đầu khóa học để mở trạm đầu tiên.
          </p>
          <Link className="mt-4 inline-block" to={`/course/${courseId}`}>
            <Button>Bắt đầu hành trình</Button>
          </Link>
        </section>
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
      ) : !enrollmentRequired && !error ? (
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
      ) : null}
    </div>
  )
}




export function isPathwayCourseVisible(course: PathwayCourse): boolean {
  return (
    course.enrolled ||
    course.status === 'active' ||
    course.status === 'completed'
  )
}

// ── Icon & gradient logic ────────────────────────────────────────────────────

// WHY: dùng topic-aware mapping trước, tránh icon vô nghĩa khi list dài.
// Fallback: 24 icon phủ hầu hết nội dung sáng tạo — không trùng trong 24 khóa đầu.
const FALLBACK_ICONS = [
  '✨', '🚀', '💡', '🌈', '🦋', '🌟', '🎯', '🔮',
  '🧩', '🌺', '🦄', '🌊', '🏅', '🌙', '🦉', '🌸',
  '🎲', '💎', '🌻', '🔭', '🎠', '🏖️', '🧸', '🪄',
]

// WHY: map từ keywords trong course.id và shortTitle → icon có nghĩa với nội dung.
// Ưu tiên: id keyword > title keyword > fallback theo index.
function resolveCourseIcon(course: PathwayCourse, index: number): string {
  const id = course.id.toLowerCase()
  const hint = (course.shortTitle + ' ' + course.title).toLowerCase()
  if (id.includes('story') || hint.includes('kể chuyện') || hint.includes('câu chuyện')) return '📖'
  if (id.includes('comic') || hint.includes('truyện tranh')) return '🎭'
  if (id.includes('motion') || hint.includes('chuyển động') || hint.includes('hoạt hình')) return '🎬'
  if (id.includes('film') || id.includes('video') || hint.includes('phim')) return '🎥'
  if (id.includes('world') || id.includes('setting') || hint.includes('thế giới')) return '🌍'
  if (id.includes('char') || hint.includes('nhân vật')) return '🎨'
  if (id.includes('ai') || hint.includes(' ai ') || hint.includes('trí tuệ')) return '🤖'
  if (id.includes('music') || hint.includes('âm nhạc') || hint.includes('âm thanh')) return '🎵'
  if (id.includes('draw') || hint.includes('vẽ') || hint.includes('minh họa')) return '✏️'
  if (id.includes('photo') || hint.includes('nhiếp ảnh') || hint.includes('ảnh')) return '📸'
  if (id.includes('game') || hint.includes('trò chơi') || hint.includes('game')) return '🎮'
  if (id.includes('poem') || hint.includes('thơ') || hint.includes('bài thơ')) return '🖊️'
  if (id.includes('science') || hint.includes('khoa học') || hint.includes('thí nghiệm')) return '🔬'
  if (id.includes('nature') || hint.includes('thiên nhiên') || hint.includes('động vật')) return '🌿'
  // Fallback: index không modulo để tránh trùng trong 24 khóa đầu;
  // sau 24 khóa mới bắt đầu lặp (rất hiếm trong thực tế)
  return FALLBACK_ICONS[index % FALLBACK_ICONS.length]
}

// WHY: gradient dùng hash từ course.id (không phải index) → cùng khóa luôn cùng màu
// dù thứ tự trong list thay đổi.
const GRADIENT_POOL = [
  'from-brand-500 to-sky-400',
  'from-mint-400 to-brand-500',
  'from-sun-400 to-coral-400',
  'from-sky-400 to-mint-400',
  'from-coral-400 to-brand-500',
  'from-brand-600 to-mint-400',
  'from-sun-400 to-sky-400',
  'from-mint-400 to-coral-400',
  'from-sky-600 to-brand-400',
  'from-coral-400 to-mint-500',
  'from-brand-400 to-sun-300',
  'from-mint-500 to-sky-500',
]

function hashCourseGradient(courseId: string): string {
  // WHY: djb2 hash — nhanh, phân bố đều, pure function (no side-effects)
  let h = 5381
  for (let i = 0; i < courseId.length; i++) {
    h = ((h << 5) + h + courseId.charCodeAt(i)) >>> 0
  }
  return GRADIENT_POOL[h % GRADIENT_POOL.length]
}

function RoadmapCourseNode({
  course,
  index,
  isRecommended,
  courseHref,
}: {
  course: PathwayCourse
  index: number
  isRecommended: boolean
  courseHref: string
}) {
  const isLeft = index % 2 === 0
  const isCompleted = course.status === 'completed'
  const isActive = course.status === 'active'
  const isLocked = course.status === 'locked'
  const icon = resolveCourseIcon(course, index)
  const gradient = hashCourseGradient(course.id)

  // Cover image cho node (thu nhỏ)
  const coverSrc = course.coverImage
    ? courseCoverHint({ coverImage: course.coverImage })
    : null

  const nodeCircle = (
    <div
      className={cn(
        'relative flex-shrink-0 flex items-center justify-center rounded-full border-4 border-white transition-transform duration-200',
        'h-16 w-16 sm:h-20 sm:w-20',
        isCompleted
          ? 'bg-gradient-to-br from-mint-400 to-mint-600 shadow-[0_6px_0_0_rgba(62,217,160,0.35),0_16px_36px_rgba(30,39,64,0.18)]'
          : isLocked
            ? 'bg-gradient-to-br from-slate-200 to-slate-300 shadow-[0_4px_0_0_rgba(0,0,0,0.12),0_8px_20px_rgba(30,39,64,0.1)] opacity-60'
            : `bg-gradient-to-br ${gradient} shadow-clay`,
        isRecommended && !isCompleted && 'animate-[pulse-soft_2.5s_ease-in-out_infinite]',
        !isLocked && 'hover:scale-110',
      )}
      aria-label={`Khóa ${index + 1}: ${course.title}`}
    >
      {isCompleted ? (
        <CheckCircle2 size={28} className="text-white" aria-hidden />
      ) : isLocked ? (
        <Lock size={22} className="text-slate-400" aria-hidden />
      ) : coverSrc ? (
        <img
          src={coverSrc}
          alt=""
          className="h-full w-full rounded-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      ) : (
        <span className="text-2xl sm:text-3xl leading-none select-none" aria-hidden>
          {icon}
        </span>
      )}
      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-brand-700 shadow-soft border border-brand-100">
        {index + 1}
      </span>
    </div>
  )

  const cardInner = (
    <div
      className={cn(
        'ui-card flex flex-col gap-2.5 p-4 transition-all duration-200 w-full',
        isCompleted && 'border-mint-200 bg-gradient-to-br from-mint-50/60 to-white',
        isRecommended && !isCompleted && 'border-brand-300 ring-2 ring-brand-200/60 bg-gradient-to-br from-brand-50/40 to-white',
        isLocked && 'opacity-60',
        !isLocked && 'hover:shadow-clay hover:-translate-y-0.5',
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {isRecommended && !isCompleted && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
            <Zap size={9} aria-hidden /> Tiếp theo
          </span>
        )}
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-extrabold',
            isCompleted ? 'bg-mint-100 text-mint-700'
              : isActive ? 'bg-sun-100 text-sun-700'
                : isLocked ? 'bg-slate-100 text-slate-500'
                  : 'bg-brand-50 text-brand-600',
          )}
        >
          {isCompleted ? '✅ Hoàn thành' : isActive ? '🔥 Đang học' : isLocked ? '🔒 Chưa mở' : '⭐ Sẵn sàng'}
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted truncate">
          {course.shortTitle}
        </p>
        <h2 className="font-display text-sm sm:text-base leading-snug text-text line-clamp-2">
          {course.title}
        </h2>
      </div>

      {(isActive || isCompleted) && (
        <div>
          <div className="h-1.5 overflow-hidden rounded-full bg-brand-100">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isCompleted
                  ? 'bg-gradient-to-r from-mint-400 to-mint-500'
                  : 'bg-gradient-to-r from-brand-400 to-brand-600',
              )}
              style={{ width: `${course.completionPercent}%` }}
              role="progressbar"
              aria-valuenow={course.completionPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="mt-0.5 text-[10px] font-bold text-muted">
            {course.completionPercent}% hoàn thành
          </p>
        </div>
      )}

      {isLocked && course.missingPrerequisites.length > 0 && (
        <p className="text-[10px] font-semibold text-muted">
          📌 Cần học trước: {course.missingPrerequisites.slice(0, 2).join(', ')}
        </p>
      )}

      {!isLocked && (
        <div className="flex items-center gap-1 text-[10px] font-extrabold text-brand-500">
          {isCompleted ? 'Xem lại' : isActive ? 'Tiếp tục' : 'Bắt đầu'}
          <ChevronRight size={12} aria-hidden />
        </div>
      )}
    </div>
  )

  const card = isLocked ? (
    <div className="cursor-not-allowed w-full">{cardInner}</div>
  ) : (
    <Link to={courseHref} className="block w-full">
      {cardInner}
    </Link>
  )

  const nodEl = isLocked ? (
    <div className="flex justify-center z-10">{nodeCircle}</div>
  ) : (
    <Link to={courseHref} className="flex justify-center flex-shrink-0 z-10">
      {nodeCircle}
    </Link>
  )

  return (
    // WHY: grid-cols [1fr auto 1fr] → card luôn có đủ không gian, không bị squish bởi flex shrink
    <li
      className="grid items-center gap-x-3"
      style={{ gridTemplateColumns: '1fr auto 1fr' }}
    >
      {/* Left slot */}
      <div className="min-w-0 flex justify-end">
        {isLeft ? card : null}
      </div>

      {/* Center: node */}
      {nodEl}

      {/* Right slot */}
      <div className="min-w-0 flex justify-start">
        {!isLeft ? card : null}
      </div>
    </li>
  )
}

function PathwayOverview({ pathway }: { pathway: Pathway }) {
  // Canonical pathway responses include `enrolled`; status is retained as a
  // defensive fallback for older cached/deployed gateway responses.
  const visibleCourses = pathway.courses.filter(isPathwayCourseVisible)
  const recommended = visibleCourses.find(
    (course) => course.id === pathway.recommendedCourseId,
  )
  const courseHref = (course: PathwayCourse) =>
    course.status === 'active' || course.status === 'completed'
      ? `/world/${course.id}`
      : `/course/${course.id}`

  const completedCount = visibleCourses.filter((c) => c.status === 'completed').length
  const totalProgress =
    visibleCourses.length > 0
      ? Math.round(
          visibleCourses.reduce((sum, c) => sum + c.completionPercent, 0) / visibleCourses.length,
        )
      : 0

  return (
    <div className="page-enter flex flex-col gap-5">
      {/* ── Header card ─────────────────────────────────────────── */}
      <header className="ui-card relative overflow-hidden p-5 sm:p-7">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/60 via-transparent to-sky-50/40 pointer-events-none" />

        <div className="relative flex items-start gap-4">
          <span className="rounded-3xl bg-brand-100 p-3 text-brand-600 flex-shrink-0">
            <CourseBookIcon size={30} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
              Lộ trình cá nhân
            </p>
            <h1 className="font-display text-2xl sm:text-3xl leading-tight">
              Hành trình của {pathway.student.nickname ?? 'con'} ✨
            </h1>
            <p className="mt-1 text-sm text-muted">
              {pathway.policy?.label ?? `Nhóm tuổi ${pathway.student.ageBand}`}
            </p>

            {/* Overall progress summary */}
            {visibleCourses.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold shadow-soft border border-border">
                  <CheckCircle2 size={13} className="text-mint-600" aria-hidden />
                  {completedCount}/{visibleCourses.length} khóa hoàn thành
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold shadow-soft border border-border">
                  <Trophy size={13} className="text-sun-600" aria-hidden />
                  {totalProgress}% toàn lộ trình
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommended next course banner */}
        {recommended && (
          <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-mint-50 to-brand-50 p-4 border border-mint-200">
            <div>
              <p className="text-xs font-bold uppercase text-success flex items-center gap-1">
                <Star size={11} className="fill-mint-500 text-mint-500" aria-hidden />
                Gợi ý tiếp theo
              </p>
              <p className="font-display text-lg mt-0.5">{recommended.title}</p>
            </div>
            <Link to={courseHref(recommended)}>
              <Button>
                {recommended.status === 'available' ? 'Xem & bắt đầu' : 'Tiếp tục hành trình'}
              </Button>
            </Link>
          </div>
        )}
      </header>

      {/* ── Roadmap body ─────────────────────────────────────────── */}
      {visibleCourses.length === 0 ? (
        <div className="ui-card p-6 text-center">
          <p className="font-display text-xl">Cha mẹ chưa chọn khóa học</p>
          <p className="mt-2 text-sm text-muted">
            Nhờ cha mẹ vào mục Con của tôi để chọn và mở khóa học cho con nhé.
          </p>
        </div>
      ) : (
        <section aria-label="Lộ trình khóa học" className="relative px-2">
          {/* ── Section label ── */}
          <p className="mb-5 text-xs font-extrabold uppercase tracking-widest text-brand-500 flex items-center gap-2">
            <span className="inline-block h-px flex-1 bg-brand-100" />
            🗺️ Lộ trình học tập
            <span className="inline-block h-px flex-1 bg-brand-100" />
          </p>

          {/* ── Center path line (decorative) ── */}
          <div className="relative">
            {/* Vertical gradient line down the center */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 rounded-full pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, #6d5efc 0%, #3dbfff 40%, #3ed9a0 75%, #ffc94a 100%)',
                opacity: 0.25,
              }}
              aria-hidden
            />

            <ol className="relative flex flex-col gap-7" aria-label="Danh sách khóa học theo lộ trình">
              {visibleCourses.map((course, index) => (
                <RoadmapCourseNode
                  key={course.id}
                  course={course}
                  index={index}
                  isRecommended={course.id === pathway.recommendedCourseId}
                  courseHref={courseHref(course)}
                />
              ))}
            </ol>

            {/* ── Finish line at bottom ── */}
            {completedCount === visibleCourses.length && visibleCourses.length > 0 && (
              <div className="relative z-10 flex flex-col items-center mt-8 animate-pop">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-sun-400 to-coral-400 shadow-clay">
                  <Trophy size={40} className="text-white" aria-hidden="true" />
                </div>
                <p className="mt-3 font-display text-xl text-text">🎉 Xuất sắc!</p>
                <p className="text-sm text-muted">Con đã hoàn thành toàn bộ lộ trình!</p>
              </div>
            )}

            {/* Finish flag at bottom (always shown) */}
            {visibleCourses.length > 0 && completedCount < visibleCourses.length && (
              <div
                className="relative z-10 mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-muted shadow-soft border border-border"
                aria-hidden
              >
                🏁 Đích đến
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
