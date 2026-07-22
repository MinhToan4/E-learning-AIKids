import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Zap, Trophy } from 'lucide-react'
import { api, type AchievementRow, type CourseSummary } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { courseCoverHint, designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { CardGridSkeleton, PageSkeleton } from '@/shared/components/ui/Skeleton'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { CourseBookIcon, NavLeaderboardIcon } from '@/shared/components/icons/KidNavIcons'

type TrackFilter = 'all' | 'L1' | 'L2'


function HeaderAvatar({ nickname }: { nickname?: string | null }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-brand-400 via-sky-400 to-mint-400 flex items-center justify-center text-3xl font-black text-white shadow-clay flex-shrink-0" aria-hidden>
        {nickname ? nickname.charAt(0).toUpperCase() : '✨'}
      </div>
    )
  }
  return (
    <img
      src={designerAssets.lobby.homeCharacter}
      alt=""
      onError={() => setFailed(true)}
      className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover shadow-clay flex-shrink-0"
    />
  )
}

function StreakWidget({ current, longest }: { current: number; longest: number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-sun-100/90 via-sun-50 to-coral-50/80 border-2 border-sun-200/80 px-4 py-2.5 shadow-soft">
      <span className="text-3xl flex-shrink-0 leading-none filter drop-shadow-sm" aria-hidden>
        🔥
      </span>
      <div className="flex flex-col min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-2xl text-text leading-none">{current}</span>
          <span className="text-xs font-bold text-sun-800">ngày liên tục</span>
        </div>
        <p className="text-[11px] font-semibold text-muted mt-0.5">Kỷ lục: {longest} ngày</p>
      </div>
    </div>
  )
}

function XpWidget({ level, xp }: { level: number; xp: number }) {
  const xpToNext = level * 200
  const pct = Math.min(100, Math.round((xp / xpToNext) * 100))
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-brand-50 border border-brand-100 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap size={14} className="text-brand-500" aria-hidden />
          <span className="text-xs font-extrabold text-brand-700">Cấp {level}</span>
        </div>
        <span className="text-[10px] font-bold text-muted">{xp}/{xpToNext} XP</span>
      </div>
      <div className="xp-bar-track">
        <div
          className="xp-bar-fill"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% tiến trình lên cấp ${level + 1}`}
        />
      </div>
    </div>
  )
}

function CourseCard({ course }: { course: CourseSummary }) {
  const cover = courseCoverHint({
    courseKey: course.courseKey,
    ageTrack: course.ageTrack,
    coverImage: course.coverImage,
  })

  // Use the server-side progress data (from the enhanced /api/courses endpoint)
  const questCount = course.questCount ?? 0
  const completedCount = course.completedCount ?? 0
  const progressPct = course.progressPct ?? (
    questCount > 0 && completedCount > 0
      ? Math.round((completedCount / questCount) * 100)
      : 0
  )

  return (
    <Link to={`/course/${course.id}`} className="course-card group">
      {/* Cover image */}
      <div className="course-card-cover overflow-hidden bg-brand-50">
        <img
          src={cover}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          aria-hidden
        />
        {/* Tags */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          <span className="rounded-full bg-white/95 backdrop-blur-sm px-2 py-0.5 text-[10px] font-extrabold text-brand-600 shadow-sm">
            {course.courseKey ?? 'Mới'}
          </span>
          <span className="rounded-full bg-white/95 backdrop-blur-sm px-2 py-0.5 text-[10px] font-extrabold text-success shadow-sm">
            {course.ageLabel}
          </span>
          {course.enrolled && (
            <span className="rounded-full bg-sun-100/95 backdrop-blur-sm px-2 py-0.5 text-[10px] font-extrabold text-warning shadow-sm">
              Đang học
            </span>
          )}
        </div>
      </div>

      {/* Progress bar (only if enrolled) */}
      {course.enrolled && questCount > 0 && (
        <div className="course-card-progress-bar">
          <div className="course-card-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        <h3 className="font-display text-base leading-snug group-hover:text-brand-600 transition-colors">
          {course.shortTitle}
        </h3>
        <p className="mt-0.5 text-xs text-muted line-clamp-2">{course.tagline}</p>
        {course.enrolled && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted">
              {completedCount}/{questCount} trạm
            </span>
            <span className="text-[10px] font-extrabold text-brand-500">
              {progressPct}%
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

export function HomePage() {
  const user = useAuth((s) => s.user)
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [track, setTrack] = useState<TrackFilter>('all')
  const [streak, setStreak] = useState({ current: 0, longest: 0 })
  const [badges, setBadges] = useState<AchievementRow[]>([])
  const [dailyMission, setDailyMission] = useState<{
    title: string
    description: string
    xpReward: number
    action: { label: string; route: string }
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [c, s, a] = await Promise.all([
        api<{ courses: CourseSummary[] }>('/api/courses'),
        api<{ current: number; longest: number }>('/api/gamification/streak'),
        api<{ achievements: AchievementRow[] }>('/api/gamification/achievements'),
      ])
      setCourses(c.courses)
      setStreak({ current: s.current, longest: s.longest })
      setBadges(a.achievements.filter((x) => x.unlocked).slice(0, 3))
      try {
        const check = await api<{
          current: number
          longest: number
        }>('/api/gamification/check-in', { method: 'POST' })
        setStreak({ current: check.current, longest: check.longest })
      } catch {
        /* ignore check-in errors */
      }
      // Load daily mission independently — failure shouldn't block the page
      try {
        const m = await api<{ mission: typeof dailyMission }>('/api/gamification/daily-mission')
        if (m.mission) setDailyMission(m.mission)
      } catch {
        /* daily mission is non-critical */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải khóa học')
    } finally {
      setLoading(false)
    }
  }, [])


  useEffect(() => {
    void load()
  }, [load])

  const open = courses.filter((c) => c.status === 'open')
  const filtered =
    track === 'all' ? open : open.filter((c) => c.ageTrack === track)
  const enrolled = filtered.filter((c) => c.enrolled)
  const explore = filtered.filter((c) => !c.enrolled)

  const goalToKey: Record<string, string> = {
    world: 'K1',
    character: 'K2',
    story: 'K3',
    comic: 'K4',
    motion: 'K5',
    film: 'K6',
    video: 'K6',
  }
  const preferredKey = user?.goal ? goalToKey[user.goal] : undefined
  const continueCourse =
    enrolled[0] ??
    (preferredKey
      ? open.find((c) => c.courseKey === preferredKey)
      : undefined) ??
    open.find((c) => c.recommended) ??
    open[0]

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageSkeleton rows={2} />
        <CardGridSkeleton count={6} />
      </div>
    )
  }

  return (
    <PageMotion className="flex flex-col gap-6">
      {/* ── Hero banner ─────────────────────────────────────────── */}
      <header className="ui-card relative overflow-hidden p-0">
        <div className="absolute inset-0">
          <img
            src={designerAssets.lobby.homeExplore}
            alt=""
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white/90 to-brand-50/60" />
        </div>
        <div className="relative flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
          {/* Left: kids character avatar + greeting */}
          <div className="flex items-center gap-3.5">
            <HeaderAvatar nickname={user?.nickname} />
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
                Xin chào!
              </p>
              <h1 className="font-display text-2xl sm:text-3xl leading-tight">
                {user?.nickname ?? 'Bạn nhỏ'} ✨
              </h1>
              <p className="text-xs font-semibold text-muted mt-0.5">
                Cấp {user?.level} · {user?.xp} điểm XP
              </p>
            </div>
          </div>

          {/* Right: streak widget */}
          <div className="flex items-center gap-2 ml-auto">
            <StreakWidget current={streak.current} longest={streak.longest} />
          </div>
        </div>

        {/* XP bar */}
        <div className="relative px-4 pb-4 sm:px-5 sm:pb-5">
          <XpWidget level={user?.level ?? 1} xp={user?.xp ?? 0} />
        </div>
      </header>

      {error && (
        <ErrorState message={error} onRetry={() => void load()} inline />
      )}

      {/* ── Daily Mission & Achievements Side-by-Side Row ────────── */}
      {(dailyMission || badges.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Daily Mission Widget (4/12 width = 1 part) */}
          {dailyMission && (
            <div
              className={cn(
                'ui-card p-4 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-sun-50/80 via-white to-sun-100/40 border-2 border-sun-200/80',
                badges.length > 0 ? 'lg:col-span-4' : 'lg:col-span-12',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-lg flex items-center gap-2">
                  <span className="text-xl" aria-hidden>
                    🎯
                  </span>
                  Nhiệm vụ hôm nay
                </h2>
                <span className="flex items-center gap-1 text-xs font-extrabold text-sun-700 bg-sun-100/90 rounded-full px-2.5 py-1 border border-sun-200/60">
                  <Zap size={12} className="text-sun-600" aria-hidden />
                  +{dailyMission.xpReward} XP
                </span>
              </div>

              <div className="my-2">
                <p className="text-xs font-semibold text-text/90 leading-relaxed line-clamp-2">
                  {dailyMission.description}
                </p>
              </div>

              <div className="pt-1">
                <Link
                  to={dailyMission.action.route}
                  className="ui-btn ui-btn-primary inline-flex items-center gap-1.5 text-xs font-extrabold !py-2 !px-4 !min-h-9"
                >
                  ▶ {dailyMission.action.label}
                </Link>
              </div>
            </div>
          )}

          {/* Achievements / Badges Widget (8/12 width = 2 parts = TWICE AS WIDE) */}
          {badges.length > 0 && (
            <div
              className={cn(
                'ui-card p-4 flex flex-col justify-between',
                dailyMission ? 'lg:col-span-8' : 'lg:col-span-12',
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="font-display text-lg flex items-center gap-2">
                  <NavLeaderboardIcon size={24} aria-hidden />
                  Huy hiệu mới nhất
                </h2>
                <Link
                  to="/achievements"
                  className="text-xs font-extrabold text-brand-500 hover:underline"
                >
                  Xem tất cả
                </Link>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-3">
                {badges.map((b) => (
                  <div
                    key={b.type}
                    className="flex items-center gap-2.5 rounded-2xl bg-brand-50/80 border border-brand-100/90 p-2.5 min-w-0 transition-colors hover:bg-brand-50 hover:border-brand-200 shadow-sm"
                  >
                    <span
                      className="ui-badge-clay !h-10 !w-10 !text-xl flex-shrink-0"
                      aria-hidden
                    >
                      {b.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold leading-snug text-text truncate">
                        {b.title}
                      </p>
                      <p className="text-[11px] font-semibold text-muted truncate mt-0.5">
                        {b.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Course catalog ──────────────────────────────────────── */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl font-black flex items-center gap-2.5 text-text">
            <CourseBookIcon size={32} aria-hidden />
            Hành trình của con
          </h2>
          {/* Age filter tabs */}
          <div className="flex gap-1 rounded-2xl bg-brand-50 p-1 border border-brand-100">
            {(
              [
                ['all', 'Tất cả'],
                ['L1', '6–8 tuổi'],
                ['L2', '9–11 tuổi'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTrack(id)}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-extrabold transition',
                  track === id
                    ? 'bg-white text-brand-600 shadow-soft'
                    : 'text-muted hover:text-text',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-4 text-sm text-muted">
          Mỗi hành trình có trò chơi nhỏ, video và sản phẩm do con tạo ra. Bắt đầu từ điều con thích!
        </p>

        {/* Enrolled courses (priority) */}
        {enrolled.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-brand-500">
              ⭐ Đang học
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {enrolled.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        )}

        {/* Explore courses */}
        {explore.length > 0 && (
          <div>
            {enrolled.length > 0 && (
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">
                🔍 Khám phá thêm
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {explore.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        )}

        {explore.length === 0 && enrolled.length === 0 && (
          <EmptyState
            className="mt-3"
            compact
            title="Chưa có khóa ở nhóm này"
            description={'Thử lọc "Tất cả" hoặc quay lại sau khi giáo viên mở khóa mới.'}
            imageSrc={designerAssets.chrome.adventureMap}
          />
        )}
      </section>
    </PageMotion>
  )
}
