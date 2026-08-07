import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { Play, Zap } from 'lucide-react'
import { api, type AchievementRow, type CourseSummary } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { courseCoverHint, designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { CardGridSkeleton, PageSkeleton } from '@/shared/components/ui/Skeleton'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { CourseBookIcon, NavLeaderboardIcon } from '@/shared/components/icons/KidNavIcons'
import { KidProfileStreakImageIcon } from '@/shared/components/icons/KidImageIcons'
import type { RewardKind } from '@/shared/lib/creation/rewards'
import { EquippedProfile } from '@/features/rewards/EquippedProfile'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { CuteProgress } from '@/shared/components/ui/CuteProgress'
import {
  profileCardBackgroundStyle,
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
    return { label: 'Chưa tạo chuỗi', hint: 'Hoàn thành 1 bài để bắt đầu' }
  }
  const today = localDay(new Date())
  const last = localDay(new Date(lastActivityDate))
  if (last === today) {
    return { label: `${current} ngày liên tục`, hint: 'Hôm nay đã giữ chuỗi' }
  }
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  if (last === localDay(yesterdayDate)) {
    return { label: `${current} ngày đang chờ`, hint: 'Học hôm nay để giữ chuỗi' }
  }
  return { label: 'Chuỗi đã gián đoạn', hint: 'Hoàn thành 1 bài để bắt đầu lại' }
}

function StreakWidget({ current, longest, lastActivityDate }: { current: number; longest: number; lastActivityDate: string | null }) {
  const state = streakState(current, lastActivityDate)
  return (
    <div className="home-streak-ticket">
      <span className="home-streak-icon" aria-hidden="true">
        <KidProfileStreakImageIcon size={34} />
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
    <div className="home-xp-ticket">
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
      <CuteProgress value={pct} label={`Tiến độ đến Cấp ${level + 1}`} tone="violet" compact />
    </div>
  )
}

function CourseCard({ course, index }: { course: CourseSummary; index: number }) {
  // Use the server-side progress data (from the enhanced /api/courses endpoint)
  const questCount = course.questCount ?? 0
  const completedCount = course.completedCount ?? 0
  const progressPct = course.progressPct ?? (
    questCount > 0 && completedCount > 0
      ? Math.round((completedCount / questCount) * 100)
      : 0
  )
  const courseTones = ['var(--color-mint-600)', 'var(--color-sun-600)', 'var(--color-sky-600)']
  const courseScenes = [
    designerAssets.worldScenes.aiValley,
    designerAssets.worldScenes.storyIsland,
    designerAssets.worldScenes.creativeMountain,
  ]
  const coursePoses = ['guide', 'thinking', 'celebrate'] as const
  const courseStyle = { '--home-course-accent': courseTones[index % courseTones.length] } as CSSProperties

  return (
    <Link
      to={course.enrolled ? `/world/${course.id}` : `/course/${course.id}`}
      className="home-course-card group transition-transform hover:-translate-y-1 active:translate-y-1 active:shadow-none"
      style={courseStyle}
    >
      {/* Cover image */}
      <div className="home-course-card-scene" aria-label={`Đảo hành trình ${course.shortTitle}`}>
        <img
          src={courseScenes[index % courseScenes.length]}
          alt=""
          className="home-course-island-art"
          aria-hidden
        />
        <AikidCatCharacter
          pose={coursePoses[index % coursePoses.length]}
          className="home-course-island-cat"
        />
        {/* Tags */}
        <div className="home-course-island-tags">
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

      <div className="home-course-card-ribbon">
        <div className="home-course-card-copy">
          <p className="text-xs font-extrabold uppercase tracking-wider text-white/75">Hành trình của con</p>
          <h3 className="font-display text-2xl font-bold leading-snug text-white sm:text-3xl">
            {course.shortTitle}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-white/85 sm:text-base">{course.tagline}</p>
        </div>
        {course.enrolled && (
          <div className="home-course-card-progress">
            <CuteProgress value={progressPct} label={`${completedCount}/${questCount} trạm`} tone="violet" compact />
            <div className="home-course-stations" aria-hidden="true">
              {Array.from({ length: questCount }, (_, stationIndex) => (
                <span
                  key={stationIndex}
                  className={cn(
                    'home-course-station-dot',
                    stationIndex < completedCount && 'home-course-station-dot-done',
                    stationIndex === completedCount && 'home-course-station-dot-current',
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

function ContinueLearningCard({ course }: { course: CourseSummary }) {
  const cover = courseCoverHint({
    courseKey: course.courseKey,
    ageTrack: course.ageTrack,
    coverImage: course.coverImage,
  })
  const questCount = course.questCount ?? 0
  const completedCount = course.completedCount ?? 0
  const progressPct = course.progressPct ?? 0

  return (
    <article className="home-next-course group transition-transform hover:-translate-y-1 active:translate-y-1 active:shadow-none">
      <img
        src={cover}
        alt=""
        aria-hidden="true"
        onError={(event) => {
          event.currentTarget.onerror = null
          event.currentTarget.src = designerAssets.lobby.bgHome
        }}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
      />
      <div className="home-next-course-wash" />
      <AikidCatCharacter pose="welcome" className="home-next-course-cat" />
      <div className="home-next-course-copy">
        <div>
          <p className="text-sm font-extrabold text-brand-700">BÀI HỌC TIẾP THEO</p>
          <h2 className="mt-1 font-display text-3xl leading-tight text-text sm:text-4xl">
            {course.shortTitle}
          </h2>
          <p className="mt-2 line-clamp-2 max-w-md text-sm font-semibold text-muted sm:text-base">
            {course.tagline}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-4">
          <Link
            to={course.enrolled ? `/world/${course.id}` : `/course/${course.id}`}
             className="course-map-primary-action"
          >
            <Play size={18} fill="currentColor" aria-hidden="true" />
            {course.enrolled ? 'Học tiếp' : 'Xem khóa học'}
          </Link>
          {course.enrolled && questCount > 0 && (
            <div className="min-w-[12rem] flex-1 pb-1">
              <CuteProgress value={progressPct} label={`${completedCount}/${questCount} trạm`} tone="violet" compact />
            </div>
          )}
        </div>
      </div>
    </article>
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
        className="home-profile-banner"
        style={{
          ...profileCardBackgroundStyle(profileEquipment.background),
          backgroundPosition: 'center',
        }}
      >
        <div className="home-profile-banner-wash" />
        <div className="home-profile-banner-grid">
          {user && (
            <EquippedProfile
              user={user}
              xp={explorerXp}
              level={explorerLevel}
              compact
              simple
            />
          )}

          <div className="min-w-0 md:w-[20rem]">
            <StreakWidget current={streak.current} longest={streak.longest} lastActivityDate={streak.lastActivityDate} />
          </div>
        </div>

        {explorerLevel < 100 && (
          <div className="home-profile-progress">
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

      {/* The primary learning action comes before secondary rewards. */}
      {(continueCourse || dailyMission) && (
        <section className="grid items-stretch gap-4 lg:grid-cols-12" aria-label="Tiếp tục hành trình học">
          {continueCourse && (
            <div className={dailyMission ? 'lg:col-span-8' : 'lg:col-span-12'}>
              <ContinueLearningCard course={continueCourse} />
            </div>
          )}

          {dailyMission && (
            <article className={cn(
              'relative flex flex-col justify-between overflow-hidden border-4 border-white bg-sun-50 p-6 rounded-[2rem] shadow-[0_8px_0_rgba(255,201,74,0.35)] transition-transform hover:-translate-y-1 active:translate-y-1 active:shadow-[0_0px_0_rgba(255,201,74,0.35)]',
              continueCourse ? 'lg:col-span-4' : 'lg:col-span-12',
            )}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-xl">Nhiệm vụ hôm nay</h2>
                <span className="flex items-center gap-1 text-xs font-extrabold text-sun-700 bg-sun-100/90 rounded-full px-2.5 py-1 border border-sun-200/60">
                  <Zap size={12} className="text-sun-600" aria-hidden />
                  +{dailyMission.xpReward} XP
                </span>
              </div>

              <div className="my-4">
                <p className="font-bold text-text">{dailyMission.title}</p>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-muted">
                  {dailyMission.description}
                </p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{dailyMission.completedAt ? 'Đã hoàn thành' : `${Math.min(dailyMission.progress, dailyMission.target)}/${dailyMission.target} bài`}</span>
                    <span>{Math.round(Math.min(1, dailyMission.progress / dailyMission.target) * 100)}%</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-sun-100">
                    <div
                      className="h-full rounded-full bg-sun-400 transition-all"
                      style={{ width: `${Math.min(100, (dailyMission.progress / dailyMission.target) * 100)}%` }}
                    />
                  </div>
                  {dailyMission.claimedAt && (
                    <p className="mt-1 text-[11px] font-extrabold text-success">✓ Đã cộng +{dailyMission.xpReward} XP</p>
                  )}
                </div>
              </div>

              <Link
                to={dailyMission.action.route}
                className="ui-btn ui-btn-primary inline-flex min-h-11 w-full items-center justify-center gap-2 font-extrabold"
              >
                  <Play size={14} aria-hidden="true" />
                  {dailyMission.action.label}
              </Link>
            </article>
          )}
        </section>
      )}

      {badges.length > 0 && (
        <section className="p-5 sm:p-6 rounded-[2rem] border-4 border-white bg-brand-50/50 shadow-[0_8px_0_rgba(109,94,252,0.15)] transition-transform hover:-translate-y-1 active:translate-y-1 active:shadow-[0_0px_0_rgba(109,94,252,0.15)]" aria-labelledby="recent-achievements-title">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 id="recent-achievements-title" className="font-display text-xl flex items-center gap-2">
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
                    className="flex items-center gap-3 rounded-[1.5rem] bg-white border-2 border-brand-100 p-3 min-w-0 transition-transform hover:-translate-y-0.5 active:translate-y-0.5 shadow-[0_4px_0_rgba(109,94,252,0.1)] active:shadow-none"
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
        </section>
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
            <p className="mb-2 text-sm font-extrabold text-brand-600">
              Các hành trình của con
            </p>
            <div className="home-course-island-grid">
              {enrolled.map((c, index) => (
                <CourseCard key={c.id} course={c} index={index} />
              ))}
            </div>
          </div>
        )}

        {enrolled.length === 0 && (
          <div className="mb-5 rounded-3xl border-4 border-dashed border-brand-200 bg-brand-50/60 p-5 text-center shadow-sm">
            <p className="font-display text-lg">Con chưa đăng ký khóa học nào</p>
            <p className="mt-1 text-sm text-muted">Chọn một khóa bên dưới để xem nội dung và đăng ký. Các khóa đã đăng ký mới xuất hiện trong phần Học.</p>
          </div>
        )}

        {/* Catalog remains separate so purchase/approval can be introduced without
            treating access to a public course description as an enrollment. */}
        {explore.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-extrabold text-muted">
              Khám phá & đăng ký khóa mới
            </p>
            <div className="home-course-island-grid">
              {explore.map((c, index) => (
                <CourseCard key={c.id} course={c} index={index} />
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
