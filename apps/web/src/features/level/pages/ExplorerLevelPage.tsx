import {
  EXPLORER_LEVELS,
  explorerLevelForXp,
  explorerLevelProgress,
  nextExplorerLevel,
} from '@/shared/lib/creation/xp-levels'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { api } from '@/shared/lib/api'

type GamificationProfile = {
  level: number
  totalXp: number
}

const sources = [
  ['📚', 'Học tập', 'Bài học, quest và assessment'],
  ['🎨', 'Sáng tạo', 'Truyện, nhân vật và tác phẩm'],
  ['🎮', 'Trò chơi', 'Game giáo dục trong hệ sinh thái'],
  ['🎪', 'Sự kiện', 'Thử thách và event đặc biệt'],
  ['🤝', 'Cộng đồng', 'Remix và động viên tích cực'],
] as const

export function ExplorerLevelPage() {
  const [xp, setXp] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api<GamificationProfile>('/api/gamification/profile')
      setXp(data.totalXp)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Chưa tải được XP')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])
  if (loading) return <PageSkeleton rows={4} />

  const current = explorerLevelForXp(xp)
  const next = nextExplorerLevel(xp)
  const progress = explorerLevelProgress(xp)

  return (
    <PageMotion className="flex flex-col gap-6">
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-950 via-violet-800 to-fuchsia-600 p-6 text-white shadow-xl sm:p-8">
        <span className="absolute right-4 top-0 text-[9rem] opacity-15" aria-hidden>✨</span>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">
          XP toàn StoryMee
        </p>
        <h1 className="mt-1 font-display text-4xl">Cấp độ khám phá</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold text-white/80">
          XP ghi nhận mọi nơi con đã khám phá. XP không phải điểm kiểm tra và không quyết định con học giỏi hay kém.
        </p>
      </header>

      {error && <ErrorState message={error} onRetry={() => void load()} inline />}

      {!error && (
        <>
          <section className="ui-card overflow-hidden" aria-labelledby="level-title">
            <div className="grid md:grid-cols-[1.2fr_0.8fr]">
              <div className="bg-gradient-to-br from-amber-100 to-orange-50 p-6">
                <p className="text-sm font-black text-amber-700">CẤP {current.level}</p>
                <h2 id="level-title" className="font-display text-3xl">{current.title}</h2>
                <p className="mt-2 text-4xl font-black text-violet-800">
                  {xp.toLocaleString('vi-VN')} XP
                </p>
                <div
                  className="mt-5 h-4 overflow-hidden rounded-full bg-white"
                  role="progressbar"
                  aria-label="Tiến độ lên cấp tiếp theo"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-sm font-bold text-amber-900">
                  {next
                    ? `Còn ${next.xpRequired - xp} XP để lên Cấp ${next.level}`
                    : 'Con đã đạt cấp cao nhất hiện tại!'}
                </p>
              </div>
              <div className="flex flex-col justify-center bg-violet-950 p-6 text-white">
                <p className="text-xs font-black uppercase tracking-wider text-violet-300">Phần thưởng tiếp theo</p>
                <p className="mt-3 text-5xl" aria-hidden>🎁</p>
                <h3 className="mt-2 font-display text-2xl">{next?.reward ?? 'Danh hiệu tối cao'}</h3>
                <Link to="/storybook?page=P04" className="mt-4 text-sm font-bold text-amber-300 hover:underline">
                  {next?.storybookSticker
                    ? 'Nhận sticker này trong Storybook →'
                    : 'Xem hành trình XP tại Trang P04 →'}
                </Link>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl">XP đến từ đâu?</h2>
            <p className="text-sm text-muted">Một cấp độ chung cho mọi ứng dụng và hoạt động.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {sources.map(([icon, title, description]) => (
                <article key={title} className="ui-card p-4">
                  <span className="text-3xl" aria-hidden>{icon}</span>
                  <h3 className="mt-2 font-extrabold">{title}</h3>
                  <p className="mt-1 text-xs text-muted">{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="ui-card p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-brand-600">Con đường phần thưởng</p>
                <h2 className="font-display text-2xl">Những cấp độ phía trước</h2>
              </div>
              <Link to="/leaderboard" className="text-sm font-bold text-brand-600 hover:underline">
                Xem tiến bộ học tập →
              </Link>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {EXPLORER_LEVELS.slice(current.level, current.level + 4).map((level) => (
                <article key={level.level} className="flex items-center gap-3 rounded-2xl bg-brand-50 p-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white font-black text-brand-700">
                    {level.level}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold">{level.title}</p>
                    <p className="truncate text-xs text-muted">{level.reward}</p>
                  </div>
                  <strong className="text-xs text-brand-700">{level.xpRequired} XP</strong>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </PageMotion>
  )
}
