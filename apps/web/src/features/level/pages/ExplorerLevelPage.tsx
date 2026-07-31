import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Check, ChevronRight, Lock } from 'lucide-react'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import {
  NavBackpackIcon,
  NavBadgeIcon,
  NavEventIcon,
  NavLeaderboardIcon,
  NavStorybookIcon,
  NavWorldIcon,
} from '@/shared/components/icons/KidNavIcons'
import { api } from '@/shared/lib/api'

type LevelReward = {
  code: string
  name: string
  description: string
  kind: string
  rarity: string
  displayConfig?: { icon?: string; level?: number }
  unlockRule?: { type?: string; value?: number | string }
  content?: { level?: number; track?: string }
}

type GamificationProfile = {
  level: number
  totalXp: number
  xpIntoLevel: number
  xpToNextLevel: number
  nextLevelRewards: Array<{ id: string; name: string; icon: string; kind: string }>
}

type RewardState = {
  inventory: Array<{ rewardId: string }>
}

const journeyLinks = [
  {
    to: '/leaderboard',
    label: 'Tiến bộ',
    description: 'Xem con đang học đến đâu',
    icon: NavLeaderboardIcon,
  },
  {
    to: '/events',
    label: 'Sự kiện',
    description: 'Nhận thử thách và XP thưởng',
    icon: NavEventIcon,
  },
  {
    to: '/achievements',
    label: 'Huy hiệu',
    description: 'Theo dõi các mốc tích lũy',
    icon: NavBadgeIcon,
  },
  {
    to: '/storybook',
    label: 'Huyền thoại',
    description: 'Gắn sticker vào sách của con',
    icon: NavStorybookIcon,
  },
  {
    to: '/backpack',
    label: 'Ba lô',
    description: 'Dùng quà con đã mở khóa',
    icon: NavBackpackIcon,
  },
] as const

const kindLabels: Record<string, string> = {
  title: 'Danh hiệu',
  companion: 'Bạn đồng hành',
  frame: 'Khung hồ sơ',
  theme: 'Nền trang',
  effect: 'Hiệu ứng',
  background: 'Nền thẻ',
  perk: 'Quyền đặc biệt',
  event_ticket: 'Vé sự kiện',
}

function rewardLevel(reward: LevelReward) {
  return Number(reward.content?.level ?? reward.displayConfig?.level ?? reward.unlockRule?.value ?? 0)
}

function rewardIcon(reward: LevelReward | GamificationProfile['nextLevelRewards'][number] | undefined) {
  if (!reward) return undefined
  return 'icon' in reward ? reward.icon : reward.displayConfig?.icon
}

export function ExplorerLevelPage() {
  const [profile, setProfile] = useState<GamificationProfile | null>(null)
  const [catalog, setCatalog] = useState<LevelReward[]>([])
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [profileData, catalogData, rewards] = await Promise.all([
        api<GamificationProfile>('/api/gamification/profile'),
        api<{ items: LevelReward[] }>('/api/gamification/catalog?type=reward'),
        api<RewardState>('/api/gamification/storybook'),
      ])
      setProfile(profileData)
      setCatalog(catalogData.items)
      setOwnedIds(new Set(rewards.inventory.map((item) => item.rewardId)))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Chưa tải được hành trình phần thưởng')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const levelRewards = useMemo(
    () => catalog
      .filter((reward) => reward.unlockRule?.type === 'xp_level' && rewardLevel(reward) > 0)
      .sort((left, right) => rewardLevel(left) - rewardLevel(right)),
    [catalog],
  )

  if (loading) return <PageSkeleton rows={5} />

  const level = profile?.level ?? 1
  const progress = Math.min(100, Math.max(0, profile?.xpIntoLevel ?? 0))
  const maxRewardLevel = levelRewards.at(-1) ? rewardLevel(levelRewards.at(-1)!) : 100
  const completedSeason = level >= maxRewardLevel
  const upcoming = levelRewards.filter((reward) => rewardLevel(reward) >= level).slice(0, 6)
  const nextReward = profile?.nextLevelRewards[0] ?? upcoming.find((reward) => rewardLevel(reward) > level)
  const completedRewards = levelRewards.filter((reward) => ownedIds.has(reward.code)).length

  return (
    <PageMotion className="flex flex-col gap-5">
      <header className="ui-card overflow-hidden p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">
              Một hành trình · Một cấp độ
            </p>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl">Hành trình phần thưởng</h1>
            <p className="mt-1 max-w-2xl text-muted">
              Học, sáng tạo và tham gia thử thách đều cộng vào cùng một thanh XP.
            </p>
          </div>
          <Link
            to="/world"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 font-extrabold text-white shadow-press focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <NavWorldIcon size={24} aria-hidden="true" />
            Học để nhận XP
          </Link>
        </div>
      </header>

      {error && <ErrorState message={error} onRetry={() => void load()} inline />}

      {!error && profile && (
        <>
          <section className="ui-card overflow-hidden" aria-labelledby="current-level-title">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="bg-sun-50 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-extrabold text-sun-700">CẤP HIỆN TẠI</p>
                    <h2 id="current-level-title" className="font-display text-4xl text-text">
                      Cấp {level}
                    </h2>
                  </div>
                  <p className="rounded-2xl bg-white px-4 py-2 font-display text-xl text-brand-700 shadow-soft">
                    {profile.totalXp.toLocaleString('vi-VN')} XP
                  </p>
                </div>
                <div
                  className="mt-5 h-4 overflow-hidden rounded-full bg-white shadow-inner"
                  role="progressbar"
                  aria-label={completedSeason ? 'Đã hoàn thành hành trình 100 cấp' : `Tiến độ lên Cấp ${level + 1}`}
                  aria-valuenow={completedSeason ? 100 : progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-mint-400 to-brand-500 transition-[width] duration-500 motion-reduce:transition-none"
                    style={{ width: `${completedSeason ? 100 : progress}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm font-bold">
                  <span className="text-muted">
                    {completedSeason ? `Đã hoàn thành ${maxRewardLevel} cấp` : `${progress}/100 XP trong cấp này`}
                  </span>
                  <span className="text-sun-700">
                    {completedSeason
                      ? 'Con đã nhận trọn bộ quà mùa này'
                      : `Còn ${profile.xpToNextLevel} XP để lên Cấp ${level + 1}`}
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-center bg-brand-700 p-5 text-white sm:p-6">
                <p className="text-xs font-extrabold uppercase tracking-wide text-brand-100">
                  Quà sắp mở
                </p>
                <div className="mt-3 flex items-center gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow-soft" aria-hidden>
                    {rewardIcon(nextReward) ?? <NavBadgeIcon size={34} />}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-brand-100">
                      {completedSeason ? 'HOÀN THÀNH MÙA' : `Cấp ${level + 1}`}
                    </p>
                    <h3 className="font-display text-2xl">
                      {completedSeason
                        ? 'Nhà thám hiểm trọn bộ'
                        : nextReward?.name ?? 'Một món quà bất ngờ'}
                    </h3>
                  </div>
                </div>
                <Link to="/backpack" className="mt-4 inline-flex min-h-11 items-center gap-1 font-extrabold text-sun-200 hover:underline">
                  Xem quà đã nhận <ChevronRight size={18} aria-hidden />
                </Link>
              </div>
            </div>
          </section>

          <section aria-labelledby="journey-map-title">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 id="journey-map-title" className="font-display text-2xl">Con muốn làm gì?</h2>
                <p className="text-sm text-muted">Mỗi nơi đều nối vào cùng hành trình phần thưởng.</p>
              </div>
              <p className="text-sm font-extrabold text-brand-700">
                {completedRewards}/{levelRewards.length || 100} quà đã mở
              </p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {journeyLinks.map(({ to, label, description, icon: Icon }) => (
                <Link key={to} to={to} className="ui-card group min-h-32 p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                  <span className="student-nav-icon" aria-hidden><Icon size={28} /></span>
                  <h3 className="mt-2 font-display text-xl group-hover:text-brand-700">{label}</h3>
                  <p className="mt-1 text-sm leading-snug text-muted">{description}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="ui-card p-5 sm:p-6" aria-labelledby="reward-road-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">
                  Mỗi 100 XP có quà
                </p>
                <h2 id="reward-road-title" className="font-display text-2xl">Các mốc gần nhất</h2>
              </div>
              <Link to="/backpack" className="inline-flex min-h-11 items-center gap-1 font-extrabold text-brand-700 hover:underline">
                Mở Ba lô <ChevronRight size={18} aria-hidden />
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((reward) => {
                const rewardAt = rewardLevel(reward)
                const owned = ownedIds.has(reward.code)
                const current = rewardAt === level
                return (
                  <article
                    key={reward.code}
                    className={`flex min-h-28 items-center gap-4 rounded-3xl border-2 p-4 ${
                      owned
                        ? 'border-mint-200 bg-mint-50'
                        : current
                          ? 'border-sun-300 bg-sun-50'
                          : 'border-border bg-white'
                    }`}
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-soft" aria-hidden>
                      {reward.displayConfig?.icon ?? <NavBadgeIcon size={30} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">
                        Cấp {rewardAt} · {kindLabels[reward.kind] ?? 'Phần thưởng'}
                      </p>
                      <h3 className="truncate font-extrabold">{reward.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm font-bold text-muted">
                        {owned ? <Check size={16} aria-hidden /> : <Lock size={15} aria-hidden />}
                        {owned ? 'Đã có trong Ba lô' : `${Math.max(0, (rewardAt - level) * 100 - progress)} XP nữa`}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </>
      )}
    </PageMotion>
  )
}
