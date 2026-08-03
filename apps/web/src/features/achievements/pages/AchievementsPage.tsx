import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
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
import { getGeneratedRewardAssetUrl } from '@/features/rewards/reward-assets'
import { displayableAchievements } from '../achievement-inventory'

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
  xp: 'Cấp độ',
  level: 'Cấp độ',
  collaboration: 'Cộng tác',
  starter: 'Khởi hành',
  general: 'Khác',
}

function SafeAchievementImage({ src, className, fallback = null }: {
  src?: string
  className: string
  fallback?: ReactNode
}) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <>{fallback}</>
  return <img src={src} alt="" loading="lazy" decoding="async" className={className} onError={() => setFailed(true)} />
}

function AchievementRewardPreview({
  item,
  compact = false,
}: {
  item: AchievementRow
  compact?: boolean
}) {
  if (!item.rewardLabel) return null
  const rewardAssetUrl = getGeneratedRewardAssetUrl(item.rewardAssetId)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-100 font-black text-amber-900',
        compact ? 'max-w-full px-2 py-1 text-[11px]' : 'p-2 pr-3 text-xs',
      )}
      title={item.rewardLabel}
    >
      {rewardAssetUrl && (
        <span className={cn(
          'flex shrink-0 items-center justify-center rounded-xl bg-white shadow-soft',
          compact ? 'h-8 w-8' : 'h-12 w-12',
        )}>
          <SafeAchievementImage
            src={rewardAssetUrl}
            className={compact ? 'h-7 w-7 object-contain' : 'h-11 w-11 object-contain'}
            fallback={<span aria-hidden>🎁</span>}
          />
        </span>
      )}
      <span className={cn(compact ? 'truncate' : 'line-clamp-2')}>
        {item.rewardLabel}
      </span>
    </span>
  )
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
    ? item.icon
    : undefined
  return (
    <div
      className={cn(
        'ui-badge-clay shrink-0',
        size === 'lg' && '!h-20 !w-20 !rounded-[1.75rem]',
        !item.unlocked && 'ui-badge-clay-locked',
      )}
      aria-hidden="true"
    >
      <SafeAchievementImage
        src={imageIcon}
        className="h-4/5 w-4/5 object-contain"
        fallback={item.icon.startsWith('/') || item.icon.startsWith('http') ? '🏅' : item.icon}
      />
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

function AchievementJourneyCard({
  items,
  onOpen,
}: {
  items: AchievementRow[]
  onOpen: () => void
}) {
  const sorted = [...items].sort((a, b) => a.requiredValue - b.requiredValue)
  const reached = sorted.filter((item) => item.unlocked)
  const nextMilestone = sorted.find((item) => !item.unlocked)
  const currentValue = Math.max(
    reached.at(-1)?.requiredValue ?? 0,
    ...sorted.map((item) => item.currentValue ?? 0),
  )
  const finalTarget = sorted.at(-1)?.requiredValue ?? 1
  const percent = Math.min(100, Math.round((currentValue / finalTarget) * 100))
  const label = categoryLabel(sorted[0]?.category ?? 'general')

  return (
    <article className="ui-card overflow-hidden p-5">
      <button
        type="button"
        className="flex min-h-14 w-full items-start justify-between gap-3 text-left"
        onClick={onOpen}
      >
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
            Hành trình huy hiệu
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
            className="-rotate-90"
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
      {nextMilestone && (
        <p className="mt-3 text-sm font-bold text-muted">
          Tiếp theo: <span className="text-text">{nextMilestone.title}</span>
          {' · '}{nextMilestone.requiredValue}
        </p>
      )}
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
        <div className="flex flex-wrap justify-end gap-1.5">
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
          {item.points != null && item.points > 0 && (
            <span className="inline-flex min-h-8 items-center rounded-full bg-amber-100 px-3 text-xs font-black text-amber-800">
              {item.points} điểm
            </span>
          )}
        </div>
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
        {item.rewardLabel ? (
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-wide text-warning">Phần thưởng</p>
            <AchievementRewardPreview item={item} />
          </div>
        ) : item.unlocked ? (
          <p className="text-success">
            Hoàn thành
            {item.unlockedAt
              ? ` · ${new Date(item.unlockedAt).toLocaleDateString('vi-VN')}`
              : ''}
          </p>
        ) : (
          <p className="text-muted">Hoàn thành điều kiện để mở huy hiệu</p>
        )}
      </div>
    </article>
  )
}

function CompactAchievementRow({ item }: { item: AchievementRow }) {
  const percent = progressPercent(item)
  return (
    <article className={cn(
      'ui-card flex items-center gap-3 p-3',
      item.unlocked && 'border-mint-200 bg-gradient-to-r from-white to-mint-50',
    )}>
      <AchievementArtwork item={item} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-lg">{item.title}</h3>
        <p className="line-clamp-1 text-xs font-bold text-muted">{item.description}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className={cn(
            'rounded-full px-2 py-1 text-[11px] font-black',
            item.unlocked ? 'bg-mint-100 text-success' : 'bg-brand-50 text-brand-700',
          )}>
            {item.unlocked ? '✓ Đã đạt' : `${item.currentValue ?? 0}/${item.requiredValue}`}
          </span>
          {item.rewardLabel && (
            <AchievementRewardPreview item={item} compact />
          )}
        </div>
        {percent != null && !item.unlocked && (
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-50">
            <div className="h-full rounded-full bg-gradient-to-r from-mint-400 to-brand-500" style={{ width: `${percent}%` }} />
          </div>
        )}
      </div>
      {item.points != null && item.points > 0 && (
        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-full border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-amber-200 text-amber-900 shadow-soft" aria-label={`${item.points} điểm thành tựu`}>
          <span className="text-sm font-black leading-none">{item.points}</span>
          <span className="text-[9px] font-black uppercase leading-none">điểm</span>
        </div>
      )}
    </article>
  )
}

export function AchievementsPage() {
  const [items, setItems] = useState<AchievementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState('all')
  const [view, setView] = useState<'overview' | 'catalog'>('overview')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [displayLimit, setDisplayLimit] = useState(8)
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api<{ achievements: AchievementRow[] }>('/api/gamification/achievements')
      setItems(displayableAchievements(data.achievements))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được thành tựu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setDisplayLimit(8)
  }, [category, query, status, view])

  const allItems = items
  const unlocked = allItems.filter((item) => item.unlocked)
  const overallPercent = allItems.length
    ? Math.round((unlocked.length / allItems.length) * 100)
    : 0
  const achievementPoints = unlocked.reduce(
    (total, item) => total + (item.points ?? 0),
    0,
  )
  const categories = useMemo(
    () => [...new Set(allItems.map((item) => categoryLabel(item.category ?? 'general')))],
    [allItems],
  )
  const achievementJourneys = useMemo(() => {
    const grouped = new Map<string, AchievementRow[]>()
    for (const item of allItems) {
      if (!item.category) continue
      const journeyLabel = categoryLabel(item.category)
      grouped.set(journeyLabel, [...(grouped.get(journeyLabel) ?? []), item])
    }
    return [...grouped.values()]
  }, [allItems])
  const nearCompletion = useMemo(
    () => allItems
      .filter((item) => {
        const percent = progressPercent(item)
        return !item.unlocked && percent != null && percent > 0
      })
      .sort((a, b) => (progressPercent(b) ?? 0) - (progressPercent(a) ?? 0))
      .slice(0, 3),
    [allItems],
  )
  const recent = useMemo(
    () => [...unlocked]
      .sort((a, b) => Date.parse(b.unlockedAt ?? '') - Date.parse(a.unlockedAt ?? ''))
      .slice(0, 3),
    [allItems],
  )
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi')
    return allItems.filter((item) => {
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
  }, [allItems, category, query, status])

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
          {!loading && allItems.length > 0 && (
            <div className="rounded-3xl border border-brand-100 bg-white/90 p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sun-100" aria-hidden="true">
                  <NavBadgeIcon size={29} />
                </span>
                <div>
                  <p className="font-display text-2xl">{unlocked.length}/{allItems.length}</p>
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

      {!loading && !error && allItems.length === 0 && (
        <EmptyState
          title="Chưa có thành tựu"
          description="Hoàn thành bài học đầu tiên để bắt đầu bộ sưu tập nhé!"
          action={<Link to="/home"><Button>Về sảnh học</Button></Link>}
        />
      )}

      {!loading && allItems.length > 0 && (
        <>
          <section className="ui-card grid gap-4 p-5 lg:grid-cols-[1.15fr_1fr] lg:items-center" aria-labelledby="reward-guidance-title">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
                Hai hành trình liên kết
              </p>
              <h2 id="reward-guidance-title" className="font-display text-2xl">
                Huy hiệu ghi nhận điều con đã làm
              </h2>
              <p className="mt-2 text-sm font-bold text-muted">
                XP và quà theo cấp được quản lý tại Hành trình phần thưởng; huy hiệu theo dõi các cột mốc học tập riêng.
              </p>
              <Link to="/level" className="mt-3 inline-flex min-h-11 items-center font-extrabold text-brand-700 hover:underline">
                Xem hành trình XP →
              </Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Link to="/home" className="flex min-h-11 items-center justify-center rounded-2xl border border-border bg-white p-3 text-center text-sm font-extrabold">
                Học bài
              </Link>
              <Link to="/creative" className="flex min-h-11 items-center justify-center rounded-2xl border border-border bg-white p-3 text-center text-sm font-extrabold">
                Sáng tạo
              </Link>
              <Link to="/storybook" className="flex min-h-11 items-center justify-center rounded-2xl border border-border bg-white p-3 text-center text-sm font-extrabold">
                Lấy sticker
              </Link>
            </div>
          </section>

          <nav className="ui-card flex gap-2 overflow-x-auto p-2" aria-label="Khu vực thành tựu">
            <button
              type="button"
              onClick={() => { setView('overview'); setCategory('all') }}
              aria-pressed={view === 'overview'}
              className={cn(
                'min-h-11 shrink-0 rounded-2xl px-4 text-sm font-extrabold',
                view === 'overview' ? 'bg-brand-600 text-white shadow-press' : 'text-brand-700',
              )}
            >
              Tổng quan
            </button>
            <button
              type="button"
              onClick={() => { setView('catalog'); setCategory('all') }}
              aria-pressed={view === 'catalog' && category === 'all'}
              className={cn(
                'min-h-11 shrink-0 rounded-2xl px-4 text-sm font-extrabold',
                view === 'catalog' && category === 'all' ? 'bg-brand-600 text-white shadow-press' : 'text-brand-700',
              )}
            >
              Tất cả
            </button>
            {categories.map((itemCategory) => (
              <button
                key={itemCategory}
                type="button"
                onClick={() => { setView('catalog'); setCategory(itemCategory) }}
                aria-pressed={view === 'catalog' && category === itemCategory}
                className={cn(
                  'min-h-11 shrink-0 rounded-2xl px-4 text-sm font-extrabold',
                  view === 'catalog' && category === itemCategory ? 'bg-brand-600 text-white shadow-press' : 'text-brand-700',
                )}
              >
                {itemCategory}
              </button>
            ))}
          </nav>

          {view === 'overview' && achievementJourneys.length > 0 && (
            <section aria-labelledby="achievement-journeys-title">
              <div className="mb-3">
                <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
                  Mỗi hành trình · nhiều cột mốc
                </p>
                <h2 id="achievement-journeys-title" className="font-display text-2xl">
                  Hành trình huy hiệu
                </h2>
                <p className="mt-1 text-sm font-bold text-muted">
                  Chọn một hành trình để xem các huy hiệu đã đạt và mục tiêu tiếp theo.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {achievementJourneys.map((journey) => (
                  <AchievementJourneyCard
                    key={categoryLabel(journey[0]?.category ?? 'general')}
                    items={journey}
                    onOpen={() => {
                      setCategory(categoryLabel(journey[0]?.category ?? 'general'))
                      setView('catalog')
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {view === 'overview' && nearCompletion.length > 0 && (
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

          {view === 'overview' && recent.length > 0 && (
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

          {view === 'catalog' && <section aria-labelledby="all-achievements-title">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-brand-500">
                  {category === 'all' ? 'Bộ sưu tập đầy đủ' : 'Danh mục huy hiệu'}
                </p>
                <h2 id="all-achievements-title" className="font-display text-2xl">
                  {category === 'all' ? 'Tất cả thành tựu' : category}
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

            {filtered.length > 0 ? (
              <>
                <div className="grid gap-3 lg:grid-cols-2">
                  {filtered.slice(0, displayLimit).map((item) => (
                    <CompactAchievementRow key={item.type} item={item} />
                  ))}
                </div>
                {filtered.length > displayLimit && (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setDisplayLimit((limit) => limit + 8)}
                      className="min-h-11 rounded-2xl bg-brand-50 px-5 text-sm font-extrabold text-brand-700"
                    >
                      Xem thêm {Math.min(8, filtered.length - displayLimit)} huy hiệu
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="ui-card p-6 text-center">
                <p className="font-display text-xl">Không tìm thấy thành tựu</p>
                <p className="mt-1 text-sm text-muted">Thử đổi từ khóa hoặc bộ lọc nhé.</p>
              </div>
            )}
          </section>}
        </>
      )}
    </PageMotion>
  )
}
