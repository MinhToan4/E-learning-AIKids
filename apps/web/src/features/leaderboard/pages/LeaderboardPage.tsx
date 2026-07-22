import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '@/shared/lib/api'
import { designerAssets } from '@/shared/config/assets'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import {
  NavBackpackIcon,
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
  tone,
}: {
  icon: React.ComponentType<{ size?: number }>
  label: string
  value: number
  tone: 'sky' | 'mint' | 'sun' | 'brand'
}) {
  return (
    <div className={`progress-stat progress-stat-${tone}`}>
      <span className="progress-stat-icon" aria-hidden="true">
        <Icon size={28} />
      </span>
      <div>
        <p className="font-display text-2xl font-extrabold leading-none text-text sm:text-3xl">
          {value.toLocaleString('vi-VN')}
        </p>
        <p className="mt-1 text-sm font-bold leading-snug text-muted">{label}</p>
      </div>
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
      const data = await api<{ celebration: Celebration }>(
        '/api/gamification/class-celebration',
      )
      setCelebration(data.celebration)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Khu vườn đang nghỉ một chút. Con thử lại nhé!',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) return <PageSkeleton rows={4} />

  const safeGoal = Math.max(1, celebration?.nextGoal ?? 1)
  const goalProgress = celebration
    ? Math.min(
        100,
        Math.max(0, Math.round((celebration.completedQuests / safeGoal) * 100)),
      )
    : 0
  const questsNeeded = celebration
    ? Math.max(0, celebration.nextGoal - celebration.completedQuests)
    : 0

  return (
    <PageMotion className="flex flex-col gap-5 sm:gap-6">
      <header className="progress-hero ui-card">
        <div className="progress-hero-copy">
          <div className="eyebrow-chip">
            <NavLeaderboardIcon size={20} aria-hidden="true" />
            Tiến bộ của con
          </div>
          <h1 className="font-display mt-3 text-3xl font-extrabold leading-[1.08] text-text sm:text-4xl">
            Mỗi bước nhỏ đều đáng tự hào!
          </h1>
          <p className="mt-3 max-w-xl text-base font-semibold leading-relaxed text-muted sm:text-lg">
            Cùng nhìn lại những điều con đã khám phá và chọn một thử thách vui
            cho hôm nay nhé.
          </p>
        </div>
        <div className="progress-hero-art" aria-hidden="true">
          <img
            src={designerAssets.chrome.mascotHero}
            alt=""
            width="512"
            height="512"
            fetchPriority="high"
          />
        </div>
      </header>

      {error && <ErrorState message={error} onRetry={() => void load()} inline />}

      {!error && celebration && (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Những điều đã làm được">
            <StatTile
              icon={NavProfileIcon}
              label={celebration.hasClass ? 'bạn cùng vun vườn' : 'nhà sáng tạo'}
              value={celebration.learnerCount}
              tone="sky"
            />
            <StatTile
              icon={NavWorldIcon}
              label="nhiệm vụ đã xong"
              value={celebration.completedQuests}
              tone="mint"
            />
            <StatTile
              icon={NavBackpackIcon}
              label="sản phẩm đã tạo"
              value={celebration.projects}
              tone="sun"
            />
            <StatTile
              icon={NavLeaderboardIcon}
              label="điểm nỗ lực chung"
              value={celebration.teamXp}
              tone="brand"
            />
          </section>

          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="progress-garden ui-card" aria-labelledby="garden-title">
              <img
                src={designerAssets.chrome.adventureMap}
                alt=""
                width="1280"
                height="720"
                loading="lazy"
              />
              <div className="progress-garden-shade" />
              <div className="progress-garden-content">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-success">Cùng nhau vun lớn</p>
                    <h2 id="garden-title" className="font-display text-2xl font-extrabold text-text sm:text-3xl">
                      Khu vườn chung
                    </h2>
                  </div>
                  <span className="progress-percent">{goalProgress}% đã nở</span>
                </div>

                <div
                  className="progress-track mt-4"
                  role="progressbar"
                  aria-label="Tiến độ khu vườn chung"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={goalProgress}
                >
                  <div
                    className="progress-track-fill"
                    style={{ width: `${goalProgress}%` }}
                  >
                    <span aria-hidden="true">
                      <NavWorldIcon size={18} />
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-sm font-bold leading-relaxed text-muted sm:text-base">
                  {questsNeeded > 0
                    ? `Thêm ${questsNeeded} nhiệm vụ nữa, khu vườn sẽ mở một bất ngờ mới.`
                    : 'Tuyệt quá! Khu vườn đã chạm cột mốc mới rồi.'}
                </p>
              </div>
            </section>

            <section className="next-step-card ui-card" aria-labelledby="next-step-title">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.15rem] bg-sun-100 shadow-sm" aria-hidden="true">
                  <NavBadgeIcon size={32} />
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-extrabold text-brand-600">
                  Cấp {celebration.personal.level}
                </span>
              </div>
              <div className="mt-5">
                <p className="text-sm font-extrabold text-brand-600">Hành trình riêng</p>
                <h2 id="next-step-title" className="font-display text-2xl font-extrabold text-text">
                  Bước tiếp theo của con
                </h2>
                <p className="mt-2 text-base font-semibold leading-relaxed text-muted">
                  Con đã gom được{' '}
                  <strong className="text-text">
                    {celebration.personal.xp.toLocaleString('vi-VN')} điểm sáng tạo
                  </strong>
                  . Mỗi lần thử lại cũng là một bước tiến.
                </p>
              </div>
              <Link to="/world" className="ui-btn ui-btn-primary mt-6 w-full">
                Chọn thử thách mới
                <span aria-hidden="true">→</span>
              </Link>
            </section>
          </div>
        </>
      )}
    </PageMotion>
  )
}
