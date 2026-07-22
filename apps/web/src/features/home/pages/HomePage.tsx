import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type AchievementRow, type CourseSummary } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { courseCoverHint, designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { CardGridSkeleton, PageSkeleton } from '@/shared/components/ui/Skeleton'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageMotion } from '@/shared/components/ui/PageMotion'

type TrackFilter = 'all' | 'L1' | 'L2'

export function HomePage() {
  const user = useAuth((s) => s.user)
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [track, setTrack] = useState<TrackFilter>('all')
  const [streak, setStreak] = useState({ current: 0, longest: 0 })
  const [badges, setBadges] = useState<AchievementRow[]>([])

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
  // Onboarding goal → courseKey (K1–K6 curriculum)
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
      <header className="ui-card relative overflow-hidden p-0">
        <div className="absolute inset-0">
          <img
            src={designerAssets.lobby.homeExplore}
            alt=""
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent" />
        </div>
        <div className="relative flex flex-wrap items-center gap-4 p-4 sm:p-5">
          <img
            src={designerAssets.brand.mascot}
            alt=""
            className="h-20 w-20 rounded-2xl object-cover shadow-clay"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-brand-500">
              Chào {user?.nickname}, hôm nay con khỏe không?
            </p>
            <h1 className="font-display text-3xl leading-tight">
              Mình cùng sáng tạo nhé!
            </h1>
            <p className="text-sm text-muted">
              Cấp {user?.level} · {user?.xp} điểm sáng tạo · {open.length} hành trình đang mở
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-2xl bg-sun-100 px-3 py-2 text-center shadow-soft">
              <p className="text-sm font-bold text-warning">Ngày sáng tạo 🔥</p>
              <p className="font-display text-2xl text-text">{streak.current}</p>
              <p className="text-xs text-muted">Tốt nhất: {streak.longest} ngày</p>
            </div>
            {continueCourse && (
              <Link to={`/course/${continueCourse.id}`} className="ui-btn ui-btn-primary">
                Sáng tạo tiếp
              </Link>
            )}
          </div>
        </div>
      </header>

      {error && (
        <ErrorState message={error} onRetry={() => void load()} inline />
      )}

      <section className="ui-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl">Điều con vừa làm được</h2>
          <Link
            to="/achievements"
            className="text-sm font-bold text-brand-500 hover:underline"
          >
            Xem tất cả
          </Link>
        </div>
        {badges.length === 0 ? (
          <p className="text-sm text-muted">
            Hoàn thành thử thách đầu tiên để nhận một huy hiệu thật xinh nhé!
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {badges.map((b) => (
              <div
                key={b.type}
                className="flex items-center gap-2 rounded-2xl bg-brand-50 px-3 py-2"
              >
                <span className="ui-badge-clay !h-10 !w-10 !text-xl" aria-hidden>
                  {b.icon}
                </span>
                <span className="text-sm font-bold">{b.title}</span>
              </div>
            ))}
          </div>
        )}
      </section>



      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl">Chọn hành trình của con</h2>
          <div className="flex gap-1 rounded-2xl bg-brand-50 p-1">
            {(
              [
                ['all', 'Tất cả'],
                ['L1', '8–9 tuổi'],
                ['L2', '10–11 tuổi'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTrack(id)}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-sm font-extrabold transition',
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
        <p className="mb-3 text-sm text-muted">
          Bắt đầu từ điều con thích. Mỗi hành trình đều có hướng dẫn từng bước,
          trò chơi nhỏ và một sản phẩm do chính con tạo ra.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const cover = courseCoverHint({
              courseKey: c.courseKey,
              ageTrack: c.ageTrack,
              coverImage: c.coverImage,
            })
            return (
              <Link
                key={c.id}
                to={`/course/${c.id}`}
                className="ui-card group overflow-hidden transition hover:-translate-y-0.5"
              >
                <div
                  className="h-28 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${cover})`,
                    backgroundColor: c.coverFrom,
                  }}
                />
                <div className="p-3">
                  <div className="mb-1 flex flex-wrap gap-1">
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-extrabold text-brand-600">
                      Chặng {c.courseKey ?? 'mới'}
                    </span>
                    <span className="rounded-full bg-mint-100 px-2 py-0.5 text-[10px] font-extrabold text-success">
                      {c.ageLabel}
                    </span>
                    {c.enrolled && (
                      <span className="rounded-full bg-sun-100 px-2 py-0.5 text-[10px] font-extrabold text-warning">
                        Đang học
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg leading-tight group-hover:text-brand-600">
                    {c.shortTitle}
                  </h3>
                  <p className="line-clamp-2 text-xs text-muted">{c.tagline}</p>
                  <p className="mt-1 text-xs font-bold text-muted">
                    {c.questCount} trạm · Làm ra: {c.productLabel}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
        {explore.length === 0 && enrolled.length === 0 && (
          <EmptyState
            className="mt-3"
            compact
            title="Chưa có khóa ở nhóm này"
            description="Thử lọc “Tất cả” hoặc quay lại sau khi giáo viên mở khóa mới."
            imageSrc={designerAssets.chrome.adventureMap}
          />
        )}
      </section>
    </PageMotion>
  )
}
