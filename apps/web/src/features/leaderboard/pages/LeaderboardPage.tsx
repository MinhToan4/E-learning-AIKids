import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '@/shared/lib/api'
import { designerAssets } from '@/shared/config/assets'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { Button } from '@/shared/components/ui/Button'

type Celebration = {
  hasClass: boolean
  learnerCount: number
  completedQuests: number
  projects: number
  teamXp: number
  nextGoal: number
  personal: { level: number; xp: number }
}

function TeamStat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/85 p-4 text-center shadow-soft">
      <span className="text-3xl" aria-hidden>{icon}</span>
      <p className="mt-2 font-display text-3xl text-brand-600">{value}</p>
      <p className="text-sm font-bold text-muted">{label}</p>
    </div>
  )
}

export function LeaderboardPage() {
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api<{ celebration: Celebration }>('/api/gamification/class-celebration')
      setCelebration(data.celebration)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Chưa tải được hành trình của lớp.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  if (loading) return <PageSkeleton rows={4} />

  const goalProgress = celebration
    ? Math.min(100, Math.round((celebration.completedQuests / celebration.nextGoal) * 100))
    : 0

  return (
    <PageMotion className="flex flex-col gap-5">
      <header className="ui-card relative overflow-hidden p-0">
        <img src={designerAssets.lobby.homeExplore} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-mint-100/80" />
        <div className="relative flex flex-wrap items-center gap-4 p-5 sm:p-7">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sun-100 text-3xl shadow-clay" aria-hidden>🌱</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-wide text-success">Cùng nhau tiến bộ</p>
            <h1 className="font-display text-3xl text-text">Vườn thành quả của lớp</h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
              Mỗi nhiệm vụ hoàn thành giúp khu vườn lớn thêm. Ở đây không có hơn thua — chỉ có những điều cả lớp cùng tạo nên.
            </p>
          </div>
        </div>
      </header>

      {error && <ErrorState message={error} onRetry={() => void load()} inline />}

      {!error && celebration && (
        <>
          <section className="ui-card bg-gradient-to-br from-mint-100/70 via-white to-sky-50 p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-4">
              <TeamStat icon="🧑‍🚀" label={celebration.hasClass ? 'bạn cùng khám phá' : 'nhà khám phá'} value={celebration.learnerCount} />
              <TeamStat icon="✅" label="nhiệm vụ hoàn thành" value={celebration.completedQuests} />
              <TeamStat icon="🎨" label="sản phẩm sáng tạo" value={celebration.projects} />
              <TeamStat icon="✨" label="điểm nỗ lực chung" value={celebration.teamXp} />
            </div>
          </section>

          <section className="ui-card p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">Mục tiêu chung tiếp theo</p>
                <h2 className="font-display text-2xl">{celebration.nextGoal} nhiệm vụ</h2>
              </div>
              <p className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-600">{goalProgress}% khu vườn đã nở</p>
            </div>
            <div className="mt-4 h-5 overflow-hidden rounded-full bg-border/60" role="progressbar" aria-label="Tiến độ mục tiêu chung" aria-valuemin={0} aria-valuemax={100} aria-valuenow={goalProgress}>
              <div className="h-full rounded-full bg-gradient-to-r from-mint-400 via-sky-400 to-brand-500 transition-[width] duration-700 motion-reduce:transition-none" style={{ width: `${goalProgress}%` }} />
            </div>
            <p className="mt-3 text-sm text-muted">
              Còn {Math.max(0, celebration.nextGoal - celebration.completedQuests)} nhiệm vụ nữa để mở một cột mốc chung mới.
            </p>
          </section>

          <section className="ui-card flex flex-wrap items-center gap-4 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-sun-100 text-2xl" aria-hidden>⭐</div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl">Hành trình riêng của con</p>
              <p className="text-sm text-muted">Cấp {celebration.personal.level} · {celebration.personal.xp} điểm nỗ lực. Mỗi lần thử lại đều đáng ghi nhận.</p>
            </div>
            <Link to="/world"><Button>Chọn nhiệm vụ tiếp theo</Button></Link>
          </section>
        </>
      )}
    </PageMotion>
  )
}
