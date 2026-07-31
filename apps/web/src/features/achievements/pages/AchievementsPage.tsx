import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Check, ChevronDown, Lock, Search } from 'lucide-react'
import { api, type AchievementRow } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { CardGridSkeleton } from '@/shared/components/ui/Skeleton'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { designerAssets } from '@/shared/config/assets'
import { Button } from '@/shared/components/ui/Button'
import { NavBadgeIcon } from '@/shared/components/icons/KidNavIcons'

type XpProfile = {
  totalXp: number
  level: number
  xpIntoLevel: number
  xpToNextLevel: number
  nextLevelXp: number
  nextLevelRewards: Array<{ id: string; name: string; icon: string }>
}

type StatusFilter = 'all' | 'unlocked' | 'locked'

const categoryLabels: Record<string, string> = {
  learning: 'Học tập',
  lessons_completed: 'Học tập',
  courses_completed: 'Học tập',
  creation: 'Sáng tạo',
  creative: 'Sáng tạo',
  ai_skills: 'Kỹ năng AI',
  habit: 'Thói quen',
  streak: 'Thói quen',
  stars: 'Ngôi sao',
  xp: 'XP',
  collaboration: 'Cộng tác',
  starter: 'Khởi hành',
  general: 'Khác',
}

function categoryLabel(value: string) {
  return categoryLabels[value] ?? value.replaceAll('_', ' ')
}

function progressPercent(item: AchievementRow) {
  if (item.unlocked) return 100
  if (item.currentValue == null || item.requiredValue <= 0) return null
  return Math.min(100, Math.round((item.currentValue / item.requiredValue) * 100))
}

function AchievementArtwork({
  item,
  size = 'md',
}: {
  item: AchievementRow
  size?: 'md' | 'lg'
}) {
  const imageIcon = item.icon.startsWith('/') || item.icon.startsWith('http')
  return (
    <div
      className={cn(
        'ui-badge-clay shrink-0',
        size === 'lg' && '!h-20 !w-20 !rounded-[1.75rem]',
        !item.unlocked && 'ui-badge-clay-locked',
      )}
      aria-hidden="true"
    >
      {imageIcon
        ? <img src={item.icon} alt="" className="h-4/5 w-4/5 object-contain" />
        : item.icon}
    </div>
  )
}

function AchievementProgress({ item }: { item: AchievementRow }) {
  const percent = progressPercent(item)
  if (percent == null || item.unlocked) return null
  return (
    <div className="mt-3">
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm font-extrabold">
        <span className="text-muted">Tiến độ</span>
        <span className="text-brand-700">
          {item.currentValue}/{item.requiredValue}
        </span>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full bg-brand-50 shadow-inner"
        role="progressbar"
        aria-label={`Tiến độ ${item.title}`}
        aria-valuemin={0}
        aria-valuemax={item.requiredValue}
        aria-valuenow={item.currentValue}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-mint-400 to-brand-500 transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function AchievementMilestones({ item }: { item: AchievementRow }) {
  const [expanded, setExpanded] = useState(false)
  if (!item.milestones || item.milestones.length < 2) return null
  const currentValue = item.currentValue ?? (item.unlocked ? item.requiredValue : 0)
  return (
    <div className="mt-4 border-t border-border pt-4">
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
      >
        <span className="font-display text-lg">Các mốc tích lũy</span>
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-700">
            {currentValue} lần
          </span>
          <ChevronDown
            size={19}
            className={cn('transition-transform', expanded && 'rotate-180')}
            aria-hidden="true"
          />
        </span>
      </button>
      {expanded && <ol className="mt-3 grid grid-cols-2 gap-2">
        {item.milestones.map((milestone) => {
          const reached = milestone.unlocked === true || currentValue >= milestone.threshold
          return (
            <li
              key={milestone.threshold}
              className={cn(
                'rounded-2xl border p-3',
                reached
                  ? 'border-mint-200 bg-mint-50'
                  : 'border-border bg-brand-50/50',
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                    reached
                      ? 'bg-mint-400 text-white'
                      : 'bg-white text-brand-700 shadow-soft',
                  )}
                  aria-hidden="true"
                >
                  {reached ? <Check size={15} /> : milestone.threshold}
                </span>
                <p className="text-sm font-extrabold">
                  {milestone.label ?? `${milestone.threshold} lần`}
                </p>
              </div>
              {(milestone.rewardLabel || milestone.points) && (
                <p className="mt-2 text-xs font-bold text-muted">
                  {milestone.rewardLabel ?? `+${milestone.points} điểm`}
                </p>
              )}
            </li>
          )
        })}
      </ol>}
    </div>
  )
}

function CumulativeJourneyCard({
  items,
}: {
  items: AchievementRow[]
}) {
  const [expanded, setExpanded] = useState(false)
  const sorted = [...items].sort((a, b) => a.requiredValue - b.requiredValue)
  const reached = sorted.filter((item) => item.unlocked)
  const nextMilestone = sorted.find((item) => !item.unlocked)
  const currentFloor = reached.at(-1)?.requiredValue ?? 0
  const finalTarget = sorted.at(-1)?.requiredValue ?? 1
  const percent = Math.min(100, Math.round((currentFloor / finalTarget) * 100))
  const label = categoryLabel(sorted[0]?.category ?? 'general')

  return (
    <article className="ui-card overflow-hidden p-5">
      <button
        type="button"
        className="flex min-h-14 w-full items-start justify-between gap-3 text-left"
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
      >
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
            Chặng tích lũy
          </p>
          <h3 className="font-display text-2xl">{label}</h3>
          <p className="mt-1 text-sm font-bold text-muted">
            {reached.length}/{sorted.length} mốc đã đạt
          </p>
        </div>
        <span className="flex items-center gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sun-100 shadow-soft" aria-hidden="true">
            <NavBadgeIcon size={29} />
          </span>
          <ChevronDown
            size={20}
            className={cn('mt-3 transition-transform', expanded && 'rotate-180')}
            aria-hidden="true"
          />
        </span>
      </button>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-brand-50 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-mint-400 to-brand-500 transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
      {!expanded && nextMilestone && (
        <p className="mt-3 text-sm font-bold text-muted">
          Tiếp theo: <span className="text-text">{nextMilestone.title}</span>
          {' · '}{nextMilestone.requiredValue}
        </p>
      )}
      {expanded && <ol className="mt-4 space-y-2">
        {sorted.map((item) => (
          <li
            key={item.type}
            className={cn(
              'flex items-center gap-3 rounded-2xl border p-3',
              item.unlocked
                ? 'border-mint-200 bg-mint-50'
                : 'border-border bg-white',
            )}
          >
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-black',
                item.unlocked
                  ? 'bg-mint-400 text-white'
                  : 'bg-brand-50 text-brand-700',
              )}
              aria-hidden="true"
            >
              {item.unlocked ? <Check size={17} /> : item.requiredValue}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold leading-tight">{item.title}</p>
              <p className="text-xs font-bold text-muted">
                Mốc {item.requiredValue}
                {item.rewardLabel ? ` · ${item.rewardLabel}` : ''}
              </p>
            </div>
            <span className={cn(
              'text-xs font-extrabold',
              item.unlocked ? 'text-success' : 'text-muted',
            )}>
              {item.unlocked ? 'Đã đạt' : 'Tiếp theo'}
            </span>
          </li>
        ))}
      </ol>}
    </article>
  )
}

function AchievementCard({ item }: { item: AchievementRow }) {
  return (
    <article
      className={cn(
        'ui-card flex h-full flex-col gap-3 p-4',
        item.unlocked
          ? 'border-mint-200 bg-gradient-to-br from-white to-mint-50'
          : 'bg-white',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <AchievementArtwork item={item} />
        <span
          className={cn(
            'inline-flex min-h-8 items-center gap-1 rounded-full px-3 text-xs font-extrabold',
            item.unlocked
              ? 'bg-mint-100 text-success'
              : 'bg-brand-50 text-brand-700',
          )}
        >
          {item.unlocked
            ? <Check size={15} aria-hidden="true" />
            : <Lock size={14} aria-hidden="true" />}
          {item.unlocked ? 'Đã mở' : 'Đang khám phá'}
        </span>
      </div>
      <div className="flex-1">
        {item.category && (
          <p className="text-xs font-extrabold text-brand-600">
            {categoryLabel(item.category)}
          </p>
        )}
        <h2 className="font-display text-xl leading-tight">{item.title}</h2>
        <p className="mt-1 text-sm text-muted">{item.description}</p>
        <AchievementProgress item={item} />
        <AchievementMilestones item={item} />
      </div>
      <div className="border-t border-border pt-3 text-sm font-bold">
        {item.unlocked ? (
          <p className="text-success">
            Hoàn thành
            {item.unlockedAt
              ? ` · ${new Date(item.unlockedAt).toLocaleDateString('vi-VN')}`
              : ''}
          </p>
        ) : item.rewardLabel ? (
          <p className="text-warning">Phần thưởng: {item.rewardLabel}</p>
        ) : (
          <p className="text-muted">Hoàn thành điều kiện để nhận huy hiệu</p>
        )}
      </div>
    </article>
  )
}

export function AchievementsPage() {
  const [items, setItems] = useState<AchievementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [xpProfile, setXpProfile] = useState<XpProfile>({
    totalXp: 0,
    level: 1,
    xpIntoLevel: 0,
    xpToNextLevel: 100,
    nextLevelXp: 100,
    nextLevelRewards: [],
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [data, profile] = await Promise.all([
        api<{ achievements: AchievementRow[] }>('/api/gamification/achievements'),
        api<XpProfile>('/api/gamification/profile'),
      ])
      setItems(data.achievements.filter((item) => !item.hidden || item.unlocked))
      setXpProfile(profile)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được thành tựu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const unlocked = items.filter((item) => item.unlocked)
  const overallPercent = items.length
    ? Math.round((unlocked.length / items.length) * 100)
    : 0
  const achievementPoints = unlocked.reduce(
    (total, item) => total + (item.points ?? 0),
    0,
  )
  const levelProgress = Math.min(100, Math.max(0, xpProfile.xpIntoLevel))
  const categories = useMemo(
    () => [...new Set(items.map((item) => categoryLabel(item.category ?? 'general')))],
    [items],
  )
  const cumulativeJourneys = useMemo(() => {
    const grouped = new Map<string, AchievementRow[]>()
    for (const item of items) {
      if (!item.category) continue
      grouped.set(item.category, [...(grouped.get(item.category) ?? []), item])
    }
    return [...grouped.values()].filter((group) => group.length >= 2)
  }, [items])
  const nearCompletion = useMemo(
    () => items
      .filter((item) => {
        const percent = progressPercent(item)
        return !item.unlocked && percent != null && percent > 0
      })
      .sort((a, b) => (progressPercent(b) ?? 0) - (progressPercent(a) ?? 0))
      .slice(0, 3),
    [items],
  )
  const recent = useMemo(
    () => [...unlocked]
      .sort((a, b) => Date.parse(b.unlockedAt ?? '') - Date.parse(a.unlockedAt ?? ''))
      .slice(0, 3),
    [items],
  )
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi')
    return items.filter((item) => {
      if (
        category !== 'all' &&
        categoryLabel(item.category ?? 'general') !== category
      ) return false
      if (status === 'unlocked' && !item.unlocked) return false
      if (status === 'locked' && item.unlocked) return false
      if (!normalizedQuery) return true
      return `${item.title} ${item.description}`
        .toLocaleLowerCase('vi')
        .includes(normalizedQuery)
    })
  }, [category, items, query, status])

  return (
    <PageMotion className="flex flex-col gap-5">
      <header className="ui-card relative overflow-hidden p-5 sm:p-6">
        <img
          src={designerAssets.chrome.badges}
          alt=""
          className="pointer-events-none absolute right-0 top-0 h-full w-48 object-cover opacity-15"
        />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_18rem] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
              Hành trình của con
            </p>
            <h1 className="font-display text-3xl sm:text-4xl">Thành tựu</h1>
            <p className="mt-1 max-w-xl text-muted">
              Xem những điều con đã hoàn thành và mục tiêu đang tiến gần.
            </p>
            <Link
              to="/home"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-extrabold text-brand-600 hover:underline"
            >
              ← Về sảnh
            </Link>
          </div>
          {!loading && items.length > 0 && (
            <div className="rounded-3xl border border-brand-100 bg-white/90 p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sun-100" aria-hidden="true">
                  <NavBadgeIcon size={29} />
                </span>
                <div>
                  <p className="font-display text-2xl">{unlocked.length}/{items.length}</p>
                  <p className="text-sm font-bold text-muted">thành tựu đã mở</p>
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-brand-50 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-mint-400 to-brand-500 transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-sm font-extrabold">
                <span className="text-muted">{overallPercent}% hành trình</span>
                {achievementPoints > 0 && (
                  <span className="text-warning">{achievementPoints} điểm</span>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {error && <ErrorState message={error} onRetry={() => void load()} inline />}
      {loading && <CardGridSkeleton count={6} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          title="Chưa có thành tựu"
          description="Hoàn thành bài học đầu tiên để bắt đầu bộ sưu tập nhé!"
          action={<Link to="/home"><Button>Về sảnh học</Button></Link>}
        />
      )}

      {!loading && items.length > 0 && (
        <>
          <section className="ui-card grid gap-4 p-5 lg:grid-cols-[1.15fr_1fr] lg:items-center" aria-labelledby="reward-guidance-title">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
                Đường đến phần thưởng
              </p>
              <h2 id="reward-guidance-title" className="font-display text-2xl">
                Cấp {xpProfile.level} · {xpProfile.totalXp.toLocaleString('vi-VN')} XP
              </h2>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-brand-50 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-mint-400 to-brand-500"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
              <p className="mt-2 text-sm font-bold text-muted">
                Còn {xpProfile.xpToNextLevel.toLocaleString('vi-VN')} XP để lên Cấp {xpProfile.level + 1}
              </p>
              {xpProfile.nextLevelRewards.length > 0 && (
                <p className="mt-1 text-sm font-extrabold text-warning">
                  Quà sắp nhận: {xpProfile.nextLevelRewards.map((reward) => `${reward.icon} ${reward.name}`).join(' · ')}
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Link to="/home" className="rounded-2xl border border-border bg-white p-3 text-center text-sm font-extrabold">
                Học bài
              </Link>
              <Link to="/creative" className="rounded-2xl border border-border bg-white p-3 text-center text-sm font-extrabold">
                Sáng tạo
              </Link>
              <Link to="/storybook" className="rounded-2xl border border-border bg-white p-3 text-center text-sm font-extrabold">
                Lấy sticker
              </Link>
            </div>
          </section>

          {categories.length > 0 && (
            <section aria-labelledby="achievement-categories-title">
              <h2 id="achievement-categories-title" className="mb-3 font-display text-2xl">
                Các hành trình
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {categories.map((itemCategory) => {
                  const categoryItems = items.filter(
                    (item) => categoryLabel(item.category ?? 'general') === itemCategory,
                  )
                  const categoryUnlocked = categoryItems.filter((item) => item.unlocked).length
                  const percent = Math.round((categoryUnlocked / categoryItems.length) * 100)
                  return (
                    <button
                      key={itemCategory}
                      type="button"
                      onClick={() => setCategory(category === itemCategory ? 'all' : itemCategory)}
                      aria-pressed={category === itemCategory}
                      className={cn(
                        'ui-card min-h-32 p-4 text-left transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus',
                        category === itemCategory && 'border-brand-300 bg-brand-50 shadow-press',
                      )}
                    >
                      <NavBadgeIcon size={32} aria-hidden="true" />
                      <p className="mt-2 font-display text-lg leading-tight capitalize">
                        {itemCategory}
                      </p>
                      <p className="text-sm font-bold text-muted">
                        {categoryUnlocked}/{categoryItems.length} · {percent}%
                      </p>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {cumulativeJourneys.length > 0 && (
            <section aria-labelledby="cumulative-journeys-title">
              <div className="mb-3">
                <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
                  Tiến bộ theo số lần
                </p>
                <h2 id="cumulative-journeys-title" className="font-display text-2xl">
                  Chặng tích lũy
                </h2>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {cumulativeJourneys.map((journey) => (
                  <CumulativeJourneyCard
                    key={journey[0]?.category}
                    items={journey}
                  />
                ))}
              </div>
            </section>
          )}

          {nearCompletion.length > 0 && (
            <section aria-labelledby="near-completion-title">
              <div className="mb-3">
                <p className="text-xs font-extrabold uppercase tracking-wide text-mint-700">
                  Bước tiếp theo
                </p>
                <h2 id="near-completion-title" className="font-display text-2xl">
                  Sắp hoàn thành
                </h2>
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                {nearCompletion.map((item) => (
                  <AchievementCard key={item.type} item={item} />
                ))}
              </div>
            </section>
          )}

          {recent.length > 0 && (
            <section aria-labelledby="recent-achievements-title">
              <div className="mb-3">
                <p className="text-xs font-extrabold uppercase tracking-wide text-warning">
                  Bộ sưu tập
                </p>
                <h2 id="recent-achievements-title" className="font-display text-2xl">
                  Mới nhận được
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recent.map((item) => (
                  <AchievementCard key={item.type} item={item} />
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="all-achievements-title">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
                  Bộ sưu tập đầy đủ
                </p>
                <h2 id="all-achievements-title" className="font-display text-2xl">
                  Tất cả thành tựu
                </h2>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative">
                  <span className="sr-only">Tìm thành tựu</span>
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Tìm thành tựu"
                    className="min-h-11 w-full rounded-2xl border border-border bg-white pl-10 pr-4 text-base font-bold outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-56"
                  />
                </label>
                <label>
                  <span className="sr-only">Lọc theo trạng thái</span>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as StatusFilter)}
                    className="min-h-11 w-full rounded-2xl border border-border bg-white px-4 text-base font-bold outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="unlocked">Đã mở</option>
                    <option value="locked">Đang khám phá</option>
                  </select>
                </label>
              </div>
            </div>

            {category !== 'all' && (
              <button
                type="button"
                onClick={() => setCategory('all')}
                className="mb-3 min-h-11 rounded-full bg-brand-50 px-4 text-sm font-extrabold text-brand-700"
              >
                {category} ×
              </button>
            )}

            {filtered.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item) => (
                  <AchievementCard key={item.type} item={item} />
                ))}
              </div>
            ) : (
              <div className="ui-card p-6 text-center">
                <p className="font-display text-xl">Không tìm thấy thành tựu</p>
                <p className="mt-1 text-sm text-muted">Thử đổi từ khóa hoặc bộ lọc nhé.</p>
              </div>
            )}
          </section>
        </>
      )}
    </PageMotion>
  )
}
