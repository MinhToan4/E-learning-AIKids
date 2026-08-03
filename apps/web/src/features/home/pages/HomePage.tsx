import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Play, Star, Zap, Trophy } from 'lucide-react'
import { api, type AchievementRow, type CourseSummary } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { courseCoverHint, designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { CardGridSkeleton, PageSkeleton } from '@/shared/components/ui/Skeleton'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { CourseBookIcon, NavLeaderboardIcon } from '@/shared/components/icons/KidNavIcons'
import type { RewardKind } from '@/shared/lib/creation/rewards'
import { EquippedProfile } from '@/features/rewards/EquippedProfile'
import {
  profileCardBackgroundStyle,
  profileCardBackgroundTone,
  readRewardEquipment,
  rewardEquipmentFromRows,
  syncRewardEquipment,
} from '@/features/rewards/reward-equipment'

type TrackFilter = 'all' | 'L1' | 'L2'

type EnrollmentSummary = {
  courseId: string
  status: string
  progress?: Array<{ status?: string; stars?: number }>
}

export function coursesWithEnrollments(
  courses: CourseSummary[],
  enrollments: EnrollmentSummary[],
): CourseSummary[] {
  const byCourse = new Map(enrollments.map((row) => [row.courseId, row]))
  return courses.map((course) => {
    const enrollment = byCourse.get(course.id)
    if (!enrollment || !['active', 'completed'].includes(enrollment.status)) {
      return { ...course, enrolled: false, completedCount: 0, totalStars: 0, progressPct: 0 }
    }
    const progress = enrollment.progress ?? []
    const completedCount = progress.filter((row) => row.status === 'completed').length
    const questCount = progress.length || course.questCount || 0
    return {
      ...course,
      enrolled: true,
      questCount,
      completedCount,
      totalStars: progress.reduce((sum, row) => sum + Number(row.stars ?? 0), 0),
      progressPct: questCount > 0 ? Math.round((completedCount / questCount) * 100) : 0,
    }
  })
}


function courseBadge(course: CourseSummary) {
  return /^l[12]-k7-/.test(course.id) ? 'AI' : (course.courseKey ?? 'Mới')
}

function localDay(value: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value)
}

function streakState(current: number, lastActivityDate: string | null) {
  if (!lastActivityDate || current <= 0) {
    return { icon: '🕯️', label: 'Chưa tạo chuỗi', hint: 'Hoàn thành 1 bài để bắt đầu', tone: 'border-slate-200 bg-slate-50' }
  }
  const today = localDay(new Date())
  const last = localDay(new Date(lastActivityDate))
  if (last === today) {
    return { icon: '🔥', label: `${current} ngày liên tục`, hint: 'Hôm nay đã giữ chuỗi', tone: 'border-sun-200/80 bg-gradient-to-br from-sun-100/90 via-sun-50 to-coral-50/80' }
  }
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  if (last === localDay(yesterdayDate)) {
    return { icon: '⏳', label: `${current} ngày đang chờ`, hint: 'Học hôm nay để giữ chuỗi', tone: 'border-sun-300 bg-sun-50' }
  }
  return { icon: '🌱', label: 'Chuỗi đã gián đoạn', hint: 'Hoàn thành 1 bài để bắt đầu lại', tone: 'border-slate-200 bg-slate-50' }
}

function StreakWidget({ current, longest, lastActivityDate }: { current: number; longest: number; lastActivityDate: string | null }) {
  const state = streakState(current, lastActivityDate)
  return (
    <div className={cn('flex items-center gap-3 rounded-2xl border-2 px-4 py-2.5 shadow-soft', state.tone)}>
      <span className="text-3xl flex-shrink-0 leading-none filter drop-shadow-sm" aria-hidden>
        {state.icon}
      </span>
      <div className="flex flex-col min-w-0">
        <p className="font-display text-base text-text leading-none">{state.label}</p>
        <p className="mt-1 text-[11px] font-semibold text-muted">{state.hint} · Kỷ lục {longest} ngày</p>
      </div>
    </div>
  )
}

function XpWidget({
  xp,
  level,
  xpIntoLevel,
  xpToNextLevel,
}: {
  xp: number
  level: number
  xpIntoLevel: number
  xpToNextLevel: number
}) {
  const levelSpan = Math.max(1, xpIntoLevel + xpToNextLevel)
  const pct = Math.min(100, Math.max(0, Math.round((xpIntoLevel / levelSpan) * 100)))
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-soft backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap size={14} className="text-brand-500" aria-hidden />
          <span className="text-xs font-extrabold text-brand-700">
            Còn {Math.max(0, xpToNextLevel).toLocaleString('vi-VN')} XP
          </span>
        </div>
        <span className="text-[10px] font-bold text-muted">
          {xp.toLocaleString('vi-VN')} XP
        </span>
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
        <p className="mt-0.5 text-[10px] font-bold text-muted">
          Tiến độ đến Cấp {level + 1}
        </p>
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
    <Link to={course.enrolled ? `/world/${course.id}` : `/course/${course.id}`} className="course-card group">
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
            {courseBadge(course)}
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
        <h3 className="font-display text-lg font-bold leading-snug group-hover:text-brand-600 transition-colors">
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
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastActivityDate: null as string | null })

  const [badges, setBadges] = useState<AchievementRow[]>([])
  const [dailyMission, setDailyMission] = useState<{
    title: string
    key: string
    periodKey: string
    description: string
    xpReward: number
    progress: number
    target: number
    completedAt: string | null
    claimedAt: string | null
    action: { label: string; route: string }
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [explorerXp, setExplorerXp] = useState(0)
  const [explorerLevel, setExplorerLevel] = useState(1)
  const [xpIntoLevel, setXpIntoLevel] = useState(0)
  const [xpToNextLevel, setXpToNextLevel] = useState(100)
  const [profileEquipment, setProfileEquipment] = useState(
    () => user ? readRewardEquipment(user.id) : {},
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // WHY: Run all independent API calls in parallel to cut perceived load time
      // from serial round-trips down to one batched round-trip.
      const fetchMissionAndStreak = async () => {
        const streakPromise = api<{ current: number; longest: number; lastActivityDate: string | null }>('/api/gamification/streak')
          .catch(() => null)
        const missionPromise = api<{ mission: typeof dailyMission }>('/api/gamification/daily-mission').catch(() => null)
        const [streak, mission] = await Promise.all([streakPromise, missionPromise])
        return { streak, mission }
      }

      const [c, enrollmentData, a, profile, gamification, rewardState] =
        await Promise.all([
        api<{ courses: CourseSummary[] }>('/api/courses'),
        api<{ enrollments: EnrollmentSummary[] }>('/api/enrollments'),
        api<{ achievements: AchievementRow[] }>('/api/gamification/achievements'),
        api<{ totalXp: number; level: number; xpIntoLevel: number; xpToNextLevel: number }>('/api/gamification/profile'),
        fetchMissionAndStreak(),
        api<{ equipment: Array<{ kind: RewardKind; rewardId: string }> }>('/api/gamification/storybook')
          .catch(() => null),
      ])
      setCourses(coursesWithEnrollments(c.courses, enrollmentData.enrollments))
      if (gamification.streak) {
        setStreak({
          current: gamification.streak.current,
          longest: gamification.streak.longest,
          lastActivityDate: gamification.streak.lastActivityDate,
        })
      }
      const unlockedBadges = a.achievements.filter((achievement) => achievement.unlocked)
      const firstMilestone = a.achievements.find(
        (achievement) => achievement.type === 'first_quest',
      )
      // WHY: Keep the first milestone visible as a goal without granting it;
      // the gamification service remains the source of truth for unlock state.
      setBadges(
        unlockedBadges.length > 0
          ? unlockedBadges.slice(0, 3)
          : firstMilestone
            ? [firstMilestone]
            : a.achievements.slice(0, 1),
      )
      if (gamification.mission?.mission) {
        setDailyMission(gamification.mission.mission)
      } else {
        setDailyMission(null)
      }
      setExplorerXp(profile.totalXp)
      setExplorerLevel(profile.level)
      setXpIntoLevel(profile.xpIntoLevel)
      setXpToNextLevel(profile.xpToNextLevel)
      if (user && rewardState) {
        const synced = rewardEquipmentFromRows(rewardState.equipment)
        setProfileEquipment(syncRewardEquipment(user.id, synced))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải khóa học')
    } finally {
      setLoading(false)
    }
  }, [user?.id])


  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const syncEquipment = () => {
      if (user) setProfileEquipment(readRewardEquipment(user.id))
    }
    window.addEventListener('aikids:reward-equipped', syncEquipment)
    window.addEventListener('aikids:profile-avatar', syncEquipment)
    return () => {
      window.removeEventListener('aikids:reward-equipped', syncEquipment)
      window.removeEventListener('aikids:profile-avatar', syncEquipment)
    }
  }, [user])

  const open = courses.filter((c) => c.status === 'open')
  // A child only sees courses explicitly selected by their parent. Adult
  // contexts keep the full catalog for discovery and administration.
  const accessibleCourses =
    user?.role === 'student' ? open.filter((c) => c.enrolled) : open
  const enrolled = accessibleCourses.filter((c) => c.enrolled)
  const explore = accessibleCourses.filter((c) => !c.enrolled)
  const profileCardTone = profileCardBackgroundTone(profileEquipment.background)


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
      ? accessibleCourses.find((c) => c.courseKey === preferredKey)
      : undefined) ??
    accessibleCourses.find((c) => c.recommended) ??
    accessibleCourses[0]

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
      <header
        className="ui-card relative overflow-hidden p-0"
        style={{
          ...profileCardBackgroundStyle(profileEquipment.background),
          backgroundPosition: 'center top',
        }}
        data-profile-tone={profileCardTone}
        data-profile-composition="v1"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-white/10" />
        <div className="relative grid gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          {user && (
            <EquippedProfile
              user={user}
              xp={explorerXp}
              level={explorerLevel}
              compact
              tone={profileCardTone}
            />
          )}

          <div className="min-w-0 md:w-[19rem]">
            <StreakWidget current={streak.current} longest={streak.longest} lastActivityDate={streak.lastActivityDate} />
          </div>
        </div>

        {explorerLevel < 100 && (
          <div className="relative px-4 pb-4 sm:px-5 sm:pb-5">
            <XpWidget
              xp={explorerXp}
              level={explorerLevel}
              xpIntoLevel={xpIntoLevel}
              xpToNextLevel={xpToNextLevel}
            />
          </div>
        )}
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
                  <strong>{dailyMission.title}</strong> · {dailyMission.description}
                </p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>{dailyMission.completedAt ? 'Đã hoàn thành' : `${Math.min(dailyMission.progress, dailyMission.target)}/${dailyMission.target} bài`}</span>
                    <span>{Math.round(Math.min(1, dailyMission.progress / dailyMission.target) * 100)}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-sun-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sun-400 to-coral-400 transition-all"
                      style={{ width: `${Math.min(100, (dailyMission.progress / dailyMission.target) * 100)}%` }}
                    />
                  </div>
                  {dailyMission.claimedAt && (
                    <p className="mt-1 text-[11px] font-extrabold text-success">✓ Đã cộng +{dailyMission.xpReward} XP</p>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <Link
                  to={dailyMission.action.route}
                  className="ui-btn ui-btn-primary inline-flex items-center gap-1.5 text-xs font-extrabold !py-2 !px-4 !min-h-9"
                >
                  <Play size={14} aria-hidden="true" />
                  {dailyMission.action.label}
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
            Khóa con đang học
          </h2>
        </div>



        {/* Only real enrollments belong to the child's learning list. */}
        {enrolled.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-brand-500">
              ⭐ Enrollment đang hoạt động
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {enrolled.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        )}

        {enrolled.length === 0 && (
          <div className="mb-5 rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/60 p-5 text-center">
            <p className="font-display text-lg">Con chưa đăng ký khóa học nào</p>
            <p className="mt-1 text-sm text-muted">Chọn một khóa bên dưới để xem nội dung và đăng ký. Các khóa đã đăng ký mới xuất hiện trong phần Học.</p>
          </div>
        )}

        {/* Catalog remains separate so purchase/approval can be introduced without
            treating access to a public course description as an enrollment. */}
        {explore.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">
              🔍 Khám phá & đăng ký khóa mới
            </p>
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
            title={
              user?.role === 'student'
                ? 'Cha mẹ chưa chọn khóa học'
                : 'Chưa có khóa ở nhóm này'
            }
            description={
              user?.role === 'student'
                ? 'Nhờ cha mẹ vào mục Con của tôi để chọn và mở khóa học cho con nhé.'
                : 'Quay lại sau khi giáo viên mở khóa học mới.'
            }
            imageSrc={designerAssets.chrome.adventureMap}
          />
        )}
      </section>
    </PageMotion>
  )
}
