import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '@/shared/lib/api'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { Button } from '@/shared/components/ui/Button'
import {
  NavBadgeIcon,
  NavLeaderboardIcon,
  NavProfileIcon,
  NavWorldIcon,
} from '@/shared/components/icons/KidNavIcons'

type Celebration = {
  hasClass: boolean
  learnerCount: number
  completedQuests: number
  projects: number
  teamXp: number
  nextGoal: number
  personal: { level: number; xp: number }
}

function StatTile({
  icon: Icon,
  label,
  value,
  bgClass,
}: {
  icon: React.ComponentType<{ size?: number }>
  label: string
  value: number
  bgClass: string
}) {
  return (
    <div className="ui-card flex flex-col items-center justify-center p-4 text-center shadow-soft transition-all duration-150 hover:-translate-y-0.5 sm:p-5">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bgClass} mb-2.5`}>
        <Icon size={26} />
      </div>
      <p className="font-display text-2xl font-extrabold text-brand-600 sm:text-3xl">
        {value.toLocaleString('vi-VN')}
      </p>
      <p className="mt-1 text-xs font-bold text-muted">{label}</p>
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

  useEffect(() => {
    void load()
  }, [load])

  if (loading) return <PageSkeleton rows={4} />

  const goalProgress = celebration
    ? Math.min(100, Math.round((celebration.completedQuests / celebration.nextGoal) * 100))
    : 0

  const questsNeeded = celebration ? Math.max(0, celebration.nextGoal - celebration.completedQuests) : 0

  return (
    <PageMotion className="flex flex-col gap-5">
      {/* Clean Light Warm Header — No Dark Purple */}
      <header className="ui-card relative overflow-hidden border border-mint-200/80 bg-gradient-to-r from-mint-50/90 via-white to-sky-50/90 p-5 sm:p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sun-100 shadow-xs">
            <NavLeaderboardIcon size={32} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-extrabold uppercase tracking-wide text-mint-600">
              Cùng nhau tiến bộ
            </span>
            <h1 className="font-display text-2xl font-extrabold text-text sm:text-3xl">
              Vườn thành quả của lớp
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
              Mỗi nhiệm vụ hoàn thành giúp khu vườn lớn thêm. Ở đây không có hơn thua — chỉ có những điều cả lớp cùng tạo nên.
            </p>
          </div>
        </div>
      </header>

      {error && <ErrorState message={error} onRetry={() => void load()} inline />}

      {!error && celebration && (
        <>
          {/* 4 Stat Cards in a clean row */}
          <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatTile
              icon={NavProfileIcon}
              label={celebration.hasClass ? 'bạn cùng khám phá' : 'nhà khám phá'}
              value={celebration.learnerCount}
              bgClass="bg-sky-50"
            />
            <StatTile
              icon={NavBadgeIcon}
              label="nhiệm vụ hoàn thành"
              value={celebration.completedQuests}
              bgClass="bg-mint-50"
            />
            <StatTile
              icon={NavWorldIcon}
              label="sản phẩm sáng tạo"
              value={celebration.projects}
              bgClass="bg-sun-50"
            />
            <StatTile
              icon={NavLeaderboardIcon}
              label="điểm nỗ lực chung"
              value={celebration.teamXp}
              bgClass="bg-brand-50"
            />
          </section>

          {/* Next Goal Milestone Progress Card */}
          <section className="ui-card flex flex-col gap-3 p-5 sm:p-6 shadow-soft">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
                  Mục tiêu chung tiếp theo
                </p>
                <h2 className="font-display text-2xl font-extrabold text-text">
                  {celebration.nextGoal} nhiệm vụ
                </h2>
              </div>
              <span className="rounded-full bg-brand-50 px-3.5 py-1 text-xs font-extrabold text-brand-600 ring-1 ring-brand-100">
                {goalProgress}% khu vườn đã nở
              </span>
            </div>

            <div
              className="mt-2 h-4 overflow-hidden rounded-full bg-brand-50/70 p-0.5 ring-1 ring-border/40"
              role="progressbar"
              aria-label="Tiến độ mục tiêu chung"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={goalProgress}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-mint-400 via-sky-400 to-brand-500 transition-all duration-700 motion-reduce:transition-none"
                style={{ width: `${goalProgress}%` }}
              />
            </div>

            <p className="mt-1 text-sm font-medium text-muted">
              {questsNeeded > 0
                ? `Còn ${questsNeeded} nhiệm vụ nữa để mở một cột mốc chung mới.`
                : 'Chúc mừng! Cả lớp đã xuất sắc hoàn thành cột mốc tiếp theo! 🌱'}
            </p>
          </section>

          {/* Personal Journey Section */}
          <section className="ui-card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sun-100 shadow-xs">
                <NavBadgeIcon size={28} />
              </div>
              <div>
                <h3 className="font-display text-lg font-extrabold text-text">
                  Hành trình riêng của con
                </h3>
                <p className="mt-0.5 text-sm text-muted">
                  Cấp {celebration.personal.level} · {celebration.personal.xp} điểm nỗ lực. Mỗi lần thử lại đều đáng ghi nhận.
                </p>
              </div>
            </div>
            <Link to="/world" className="shrink-0">
              <Button className="font-bold shadow-soft">
                Chọn nhiệm vụ tiếp theo
              </Button>
            </Link>
          </section>
        </>
      )}
    </PageMotion>
  )
}
