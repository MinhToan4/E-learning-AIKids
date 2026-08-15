import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Check, Lock } from 'lucide-react'

import { api, type AchievementRow } from '@/shared/lib/api'
import { Button } from '@/shared/components/ui/Button'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { ImportantCardMascot } from '@/shared/components/ui/ImportantCardMascot'
import { CardGridSkeleton } from '@/shared/components/ui/Skeleton'
import { NavBadgeIcon } from '@/shared/components/icons/KidNavIcons'
import { cn } from '@/shared/lib/cn'
import { displayableAchievements, groupAchievementSeries, type AchievementSeries } from '../achievement-inventory'
import { achievementBadgeAsset } from '../achievement-badge-assets'
import { meePersonalRecordAsset } from '../mee-record-assets'

type Filter = 'all' | 'unlocked' | 'locked'
type AchievementTone = 'brand' | 'sky' | 'mint' | 'sun' | 'coral'

const categoryLabels: Record<string, string> = {
  learning: 'Học tập',
  lessons_completed: 'Học tập',
  courses_completed: 'Học tập',
  creation: 'Sáng tạo',
  creative: 'Sáng tạo',
  ai_skills: 'Kỹ năng số',
  habit: 'Thói quen',
  streak: 'Thói quen',
  stars: 'Ngôi sao',
  xp: 'Cấp độ',
  level: 'Cấp độ',
  collaboration: 'Cộng tác',
  challenge: 'Thử thách',
  discovery: 'Khám phá',
  records: 'Kỷ lục',
  social: 'Cộng đồng',
  starter: 'Khởi hành',
  general: 'Khác',
}

function categoryLabel(value?: string) {
  if (!value) return 'Khác'
  return categoryLabels[value] ?? value.replaceAll('_', ' ')
}

function categoryTone(value?: string): AchievementTone {
  if (value === 'learning' || value === 'lessons_completed' || value === 'courses_completed') return 'sky'
  if (value === 'habit' || value === 'streak' || value === 'starter') return 'mint'
  if (value === 'stars') return 'sun'
  if (value === 'creation' || value === 'creative' || value === 'collaboration') return 'coral'
  return 'brand'
}

function percent(item: AchievementRow) {
  if (item.unlocked) return 100
  if (item.currentValue == null || item.requiredValue <= 0) return 0
  return Math.min(100, Math.round((item.currentValue / item.requiredValue) * 100))
}

function progressUnit(item: AchievementRow) {
  const semantic = `${item.type} ${item.seriesKey ?? ''} ${item.category ?? ''}`.toLowerCase()
  if (semantic.includes('lesson') || semantic.includes('learning')) return 'bài học'
  if (semantic.includes('course')) return 'khóa học'
  if (semantic.includes('streak') || semantic.includes('habit')) return 'ngày học'
  if (semantic.includes('star')) return 'ngôi sao'
  if (semantic.includes('xp')) return 'XP'
  if (semantic.includes('level')) return 'cấp'
  if (semantic.includes('creation') || semantic.includes('creative')) return 'tác phẩm'
  if (semantic.includes('collaboration')) return 'hoạt động chung'
  return 'bước'
}

function achievementTitleParts(title: string) {
  const [tier, ...nameParts] = title.split(' · ')
  return nameParts.length > 0 ? { tier, name: nameParts.join(' · ') } : { tier: 'Mầm xanh', name: title }
}

function achievementTier(tier: string) {
  const normalized = tier.toLowerCase()
  if (normalized.includes('bạc')) return 'silver'
  if (normalized.includes('vàng')) return 'gold'
  if (normalized.includes('pha lê')) return 'crystal'
  if (normalized.includes('huyền thoại')) return 'legend'
  return 'green'
}

function LockedAchievementProgress({ item, compact = false, showInstruction = true }: { item: AchievementRow; compact?: boolean; showInstruction?: boolean }) {
  const current = Math.max(0, item.currentValue ?? 0)
  const remaining = Math.max(0, item.requiredValue - current)
  const progress = percent({ ...item, currentValue: current })

  return (
    <div className={cn('achievement-unlock-guide', compact && 'achievement-unlock-guide-compact')}>
      {showInstruction && (
        <p className="achievement-unlock-instruction">
          <span>Cách mở</span>
          {item.description}
        </p>
      )}
      <div className="achievement-progress-meta">
        <span className="achievement-progress-status">
          <Lock size={14} aria-hidden="true" />
          Còn {remaining.toLocaleString('vi-VN')} {progressUnit(item)}
        </span>
        <strong>{current.toLocaleString('vi-VN')}/{item.requiredValue.toLocaleString('vi-VN')}</strong>
      </div>
      <div
        className="achievement-progress-track"
        role="progressbar"
        aria-label={`Tiến độ mở ${item.title}`}
        aria-valuemin={0}
        aria-valuemax={item.requiredValue}
        aria-valuenow={Math.min(current, item.requiredValue)}
      >
        <span className="achievement-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

function AchievementSeriesCard({ series, onShowJourney }: { series: AchievementSeries; onShowJourney: (series: AchievementSeries) => void }) {
  const unlockedItems = series.items.filter((item) => item.unlocked)
  const nextItem = series.items.find((item) => !item.unlocked)
  const currentItem = nextItem ?? unlockedItems.at(-1) ?? series.items[0]
  const imageSrc = achievementBadgeAsset(currentItem)
    ?? (currentItem.icon.startsWith('/') || currentItem.icon.startsWith('http') ? currentItem.icon : null)
  const completed = nextItem == null
  const displayLevel = completed ? series.items.length : Math.min(series.items.length, unlockedItems.length + 1)
  const title = achievementTitleParts(currentItem.title)

  return (
    <article
      className={cn('achievement-series-card', completed ? 'achievement-card-unlocked' : 'achievement-card-locked')}
      data-tone={categoryTone(currentItem.category)}
      data-tier={achievementTier(title.tier)}
    >
      <div className="achievement-series-summary">
        <div className="achievement-medallion" aria-hidden="true">
          {imageSrc ? (
            <img src={imageSrc} alt="" className="h-12 w-12 object-contain" />
          ) : currentItem.unlocked ? <NavBadgeIcon size={38} /> : <Lock size={26} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="achievement-card-labels">
            <span className="achievement-tier-label">{title.tier}</span>
            <span className="achievement-category-label">{categoryLabel(currentItem.category)}</span>
          </div>
          <h3 className="achievement-card-title font-display text-text">{title.name}</h3>
        </div>
        <span className="achievement-series-level" aria-label={`Đang ở cấp ${displayLevel}`}>
          Cấp {displayLevel}
        </span>
      </div>

      <div className="achievement-series-footer">
        {nextItem ? (
          <LockedAchievementProgress item={nextItem} showInstruction={false} />
        ) : (
          <p className="achievement-state achievement-state-unlocked">
            <Check size={17} aria-hidden="true" /> Đã hoàn thành chuỗi
          </p>
        )}
        <button type="button" className="achievement-journey-trigger" onClick={() => onShowJourney(series)}>
          Hành trình {series.items.length} cấp
        </button>
      </div>
    </article>
  )
}

function PersonalRecordCard({ item }: { item: AchievementRow }) {
  const imageSrc = meePersonalRecordAsset(item)
    ?? achievementBadgeAsset(item)
    ?? (item.icon.startsWith('/') || item.icon.startsWith('http') ? item.icon : null)
  const value = item.currentValue ?? (item.unlocked ? item.requiredValue : 0)
  const title = achievementTitleParts(item.title)
  const hasRecord = value > 0
  return (
    <article
      className={cn('achievement-record-card', !hasRecord && 'achievement-record-card-empty')}
      data-tone={categoryTone(item.category)}
      data-tier={achievementTier(title.tier)}
    >
      <div className="achievement-record-icon" aria-hidden="true">
        {imageSrc ? <img src={imageSrc} alt="" /> : <NavBadgeIcon size={48} />}
        <p className="achievement-record-value font-display">{value.toLocaleString('vi-VN')}</p>
      </div>
      <span className="achievement-tier-label">{title.tier}</span>
      <h3 className="achievement-card-title font-display text-text">{title.name}</h3>
      <span className="sr-only">{hasRecord ? `Giá trị kỷ lục: ${value.toLocaleString('vi-VN')}` : 'Chưa có kỷ lục'}</span>
      {item.unlocked ? (
        <p className="achievement-record-caption text-sm font-semibold text-muted">Kỷ lục tốt nhất của con</p>
      ) : (
        <LockedAchievementProgress item={item} compact showInstruction={false} />
      )}
    </article>
  )
}

const personalRecordSeries = new Set([
  'lessons', 'courses', 'streak', 'stars', 'xp', 'level',
  'best-score', 'perfect-streak', 'creative-projects', 'quests',
])

function isPersonalRecordSeries(series: AchievementSeries) {
  return personalRecordSeries.has(series.key)
}

export function AchievementsPage() {
  const [items, setItems] = useState<AchievementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedSeries, setSelectedSeries] = useState<AchievementSeries | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api<{ achievements: AchievementRow[] }>('/api/gamification/achievements')
      setItems(displayableAchievements(data.achievements))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được huy hiệu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const unlocked = items.filter((item) => item.unlocked).length
  const visible = useMemo(() => items.filter((item) => {
    if (filter === 'unlocked') return item.unlocked
    if (filter === 'locked') return !item.unlocked
    return true
  }), [filter, items])
  const personalRecords = useMemo(() => {
    return groupAchievementSeries(visible)
      .filter(isPersonalRecordSeries)
      .map((series) => series.items.find((item) => !item.unlocked) ?? series.items.at(-1))
      .filter((item): item is AchievementRow => item != null)
  }, [visible])
  const achievementSeries = useMemo(() => groupAchievementSeries(items).filter((series) => {
    if (filter === 'unlocked') return series.items.some((item) => item.unlocked)
    if (filter === 'locked') return series.items.some((item) => !item.unlocked)
    return true
  }), [filter, items])

  return (
    <PageMotion className="achievement-experience flex flex-col gap-5">
      <header className="student-feature-hero achievement-hero" data-tone="sun">
        <ImportantCardMascot pose="celebrate" />
        <Link to="/profile" className="inline-flex min-h-11 items-center font-extrabold text-brand-700 hover:underline">
          ← Về hồ sơ
        </Link>
        <div className="student-feature-hero-row mt-2">
          <div>
            <div className="eyebrow-chip">
              <NavBadgeIcon size={20} aria-hidden="true" />
              Vùng sưu tập
            </div>
            <h1 className="font-display text-3xl text-text sm:text-4xl">Huy hiệu của con</h1>
            <p className="mt-1 max-w-xl text-base font-semibold text-muted">
              Mỗi huy hiệu ghi lại một điều con đã làm được.
            </p>
          </div>
          {!loading && items.length > 0 && (
            <div className="achievement-hero-count">
              <span className="achievement-hero-medal" aria-hidden="true"><NavBadgeIcon size={34} /></span>
              <p><strong className="block font-display text-2xl text-text">{unlocked}/{items.length}</strong><span className="text-sm font-bold text-muted">đã mở</span></p>
            </div>
          )}
        </div>
        {!loading && items.length > 0 && (
          <div className="achievement-collection-progress">
            <span className="sr-only">Đã mở {unlocked} trên {items.length} huy hiệu</span>
            <span style={{ width: `${Math.round((unlocked / items.length) * 100)}%` }} />
          </div>
        )}
      </header>

      {error && <ErrorState message={error} onRetry={() => void load()} inline />}
      {loading && <CardGridSkeleton count={6} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          title="Hành trình vừa bắt đầu"
          description="Hoàn thành một bài học để nhận huy hiệu đầu tiên."
          action={<Link to="/home"><Button>Về sảnh học</Button></Link>}
        />
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <nav className="achievement-filter-rail flex gap-2 overflow-x-auto" aria-label="Lọc huy hiệu">
            {([
              ['all', 'Tất cả'],
              ['unlocked', 'Đã mở'],
              ['locked', 'Đang khám phá'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={cn(
                  'min-h-11 shrink-0 rounded-2xl border px-4 text-sm font-extrabold',
                  filter === value
                    ? 'border-sun-400 bg-sun-400 text-sun-700 shadow-press'
                    : 'border-border bg-white/90 text-text hover:border-sun-200 hover:bg-sun-50',
                )}
              >
                {label}
              </button>
            ))}
          </nav>

          {visible.length ? (
            <div className="achievement-duo-layout">
              {personalRecords.length > 0 && (
                <section aria-labelledby="personal-records-title">
                  <div className="achievement-section-heading">
                    <div>
                      <p className="text-sm font-extrabold text-brand-600">Thành tích tốt nhất</p>
                      <h2 id="personal-records-title" className="font-display text-3xl text-text">Kỷ lục cá nhân</h2>
                    </div>
                    <span>{personalRecords.length}</span>
                  </div>
                  <div className="achievement-record-grid">
                    {personalRecords.map((item) => (
                      <PersonalRecordCard key={`${item.type}-${item.requiredValue}`} item={item} />
                    ))}
                  </div>
                </section>
              )}

              {achievementSeries.length > 0 && (
                <section aria-labelledby="awards-title">
                  <div className="achievement-section-heading">
                    <div>
                      <p className="text-sm font-extrabold text-sun-700">Mở từng cấp, tiến hoá từng huy hiệu</p>
                      <h2 id="awards-title" className="font-display text-3xl text-text">Bộ sưu tập thành tích</h2>
                    </div>
                    <span>{achievementSeries.length}</span>
                  </div>
                  <div className="achievement-series-grid">
                    {achievementSeries.map((series) => (
                      <AchievementSeriesCard key={series.key} series={series} onShowJourney={setSelectedSeries} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <EmptyState title="Không có huy hiệu trong mục này" description="Chọn một mục khác để xem tiếp." />
          )}
        </>
      )}

      <AchievementJourneyModal series={selectedSeries} onClose={() => setSelectedSeries(null)} />
    </PageMotion>
  )
}

function AchievementJourneyModal({ series, onClose }: { series: AchievementSeries | null; onClose: () => void }) {
  if (!series) return null
  const unlockedCount = series.items.filter((item) => item.unlocked).length
  const nextItem = series.items.find((item) => !item.unlocked)
  const representative = nextItem ?? series.items.at(-1) ?? series.items[0]

  return (
    <AdventureModal
      open
      tone="achievement"
      eyebrow={`${unlockedCount} cấp đã mở`}
      title={representative.title.replace(/^.+? · /, '')}
      description="Mỗi lần đạt một mốc, huy hiệu của con sẽ tiến hoá thêm một cấp."
      onClose={onClose}
      actions={<Button variant="secondary" onClick={onClose}>Quay lại bộ sưu tập</Button>}
    >
      <ol className="achievement-journey-list" aria-label="Các cấp huy hiệu">
        {series.items.map((item, index) => (
          <li key={`${item.type}-${item.requiredValue}`} className={cn(item.unlocked && 'is-unlocked', item === nextItem && 'is-next')}>
            <span className="achievement-journey-step" aria-hidden="true">{item.unlocked ? <Check size={17} /> : index + 1}</span>
            <span>
              <strong>{item.title}</strong>
              <small>{item.requiredValue.toLocaleString('vi-VN')} {progressUnit(item)}</small>
            </span>
            <b>{item.unlocked ? 'Đã mở' : item === nextItem ? 'Tiếp theo' : 'Chưa mở'}</b>
          </li>
        ))}
      </ol>
    </AdventureModal>
  )
}
