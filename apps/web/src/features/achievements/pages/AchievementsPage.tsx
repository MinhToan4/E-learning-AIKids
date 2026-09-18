import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { api, type AchievementRow } from '@/shared/lib/api'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorState } from '@/shared/components/ui/ErrorState'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { ImportantCardMascot } from '@/shared/components/ui/ImportantCardMascot'
import { CardGridSkeleton } from '@/shared/components/ui/Skeleton'
import { NavBadgeIcon } from '@/shared/components/icons/KidNavIcons'
import { cn } from '@/shared/lib/cn'
import { displayableAchievements, groupAchievementSeries, type AchievementSeries } from '../achievement-inventory'
import { TopPodiumShowcase, loadFavoriteBadges, saveFavoriteBadges } from '../components/TopPodiumShowcase'
import { SoftClayShelf } from '../components/SoftClayShelf'
import { BadgeDetailModal } from '../components/BadgeDetailModal'

type Filter = 'all' | 'unlocked' | 'locked'

export type ShelfCategory = 'habits' | 'learning' | 'creative' | 'stars' | 'olympic'

export interface ShelfConfig {
  id: ShelfCategory
  title: string
  subtitle: string
  icon: string
}

export interface SeriesRepresentativeBadge extends AchievementRow {
  seriesKey: string
  seriesTitle: string
  currentLevel: number
  totalLevels: number
  series: AchievementSeries
}

export const SHELVES_CONFIG: ShelfConfig[] = [
  {
    id: 'habits',
    title: '🌿 Tầng 1: Mầm Xanh Chăm Chỉ',
    subtitle: 'Thói quen học tập, chuỗi ngày liên tiếp & vạch xuất phát',
    icon: '🌿',
  },
  {
    id: 'learning',
    title: '🎒 Tầng 2: Nhà Thám Hiểm Bài Học',
    subtitle: 'Chinh phục từng bài học và khóa học bổ ích',
    icon: '🎒',
  },
  {
    id: 'creative',
    title: '🎨 Tầng 3: Xưởng Sáng Tạo Nhí',
    subtitle: 'Vẽ tranh, viết truyện, sáng tạo công nghệ & AI',
    icon: '🎨',
  },
  {
    id: 'stars',
    title: '⭐ Tầng 4: Bầu Trời Tinh Thể Sao',
    subtitle: 'Ngôi sao tri thức, điểm kinh nghiệm XP & cấp bậc',
    icon: '⭐',
  },
  {
    id: 'olympic',
    title: '🏆 Tầng 5: Đỉnh Cao Olympic',
    subtitle: 'Đấu trường ASMO, SASMO, kỷ lục cá nhân & thử thách lớn',
    icon: '🏆',
  },
]

export function classifyAchievementShelf(item: AchievementRow): ShelfCategory {
  const seriesKey = item.seriesKey?.toLowerCase() ?? ''
  const category = item.category?.toLowerCase() ?? ''
  const type = item.type.toLowerCase()
  const text = `${type} ${seriesKey} ${category} ${item.title} ${item.description}`.toLowerCase()

  // 1. Olympic & Challenges & Records
  if (
    seriesKey.includes('asmo')
    || seriesKey.includes('sasmo')
    || seriesKey.includes('olympic')
    || seriesKey.includes('challenge')
    || seriesKey.includes('record')
    || seriesKey.includes('quest')
    || seriesKey.includes('perfect')
    || category === 'challenge'
    || category === 'records'
    || category === 'discovery'
    || text.includes('asmo')
    || text.includes('sasmo')
    || text.includes('olympic')
    || text.includes('kỷ lục')
    || text.includes('thử thách')
    || text.includes('hoàn hảo')
    || text.includes('nhiệm vụ')
  ) {
    return 'olympic'
  }

  // 2. Creative & AI & Creations
  if (
    seriesKey.includes('creative')
    || seriesKey.includes('creation')
    || seriesKey.includes('collab')
    || category === 'creation'
    || category === 'creative'
    || category === 'ai_skills'
    || category === 'collaboration'
    || text.includes('sáng tạo')
    || text.includes('tác phẩm')
    || text.includes('truyện')
    || text.includes('vẽ')
    || text.includes('ảnh')
    || text.includes('code')
    || text.includes('ai')
    || text.includes('cộng tác')
  ) {
    return 'creative'
  }

  // 3. Stars, XP, Level
  if (
    seriesKey.includes('star')
    || seriesKey.includes('xp')
    || seriesKey.includes('level')
    || category === 'stars'
    || category === 'xp'
    || category === 'level'
    || text.includes('ngôi sao')
    || text.includes('star')
    || text.includes('cấp độ')
    || text.includes('xp')
  ) {
    return 'stars'
  }

  // 4. Learning & Lessons & Courses
  if (
    seriesKey.includes('lesson')
    || seriesKey.includes('course')
    || category === 'learning'
    || category === 'lessons_completed'
    || category === 'courses_completed'
    || text.includes('bài học')
    || text.includes('khóa học')
    || text.includes('lesson')
    || text.includes('course')
  ) {
    return 'learning'
  }

  // 5. Habits, Streak, Starter (default for habit/daily)
  return 'habits'
}

export function AchievementsPage() {
  const [items, setItems] = useState<AchievementRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  // Selected badge for Detail Modal
  const [selectedBadge, setSelectedBadge] = useState<AchievementRow | null>(null)

  // 3 Proudest Treasure Badges: [Treasure1, Treasure2, Treasure3]
  const [favoriteBadges, setFavoriteBadges] = useState<(string | null)[]>(loadFavoriteBadges)

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

  useEffect(() => {
    void load()
  }, [load])

  // Group into Series families
  const seriesList = useMemo(() => groupAchievementSeries(items), [items])

  // Aggregate into exactly 1 representative badge per series:
  // - If any level is unlocked: Highest unlocked level
  // - If none unlocked: Level 1 in Pokédex mystery silhouette mode
  const representativeBadges = useMemo(() => {
    return seriesList.map((series): SeriesRepresentativeBadge => {
      const unlockedMilestones = series.items.filter((item) => item.unlocked)
      const totalLevels = series.items.length
      const currentLevel = unlockedMilestones.length

      const baseItem = currentLevel > 0
        ? unlockedMilestones[unlockedMilestones.length - 1]
        : series.items[0]

      const seriesTitle = baseItem.title.includes(' · ')
        ? baseItem.title.split(' · ')[0].trim()
        : baseItem.title

      return {
        ...baseItem,
        seriesKey: series.key,
        seriesTitle,
        currentLevel,
        totalLevels,
        series,
        unlocked: currentLevel > 0,
      }
    })
  }, [seriesList])

  const unlockedSeriesCount = useMemo(
    () => representativeBadges.filter((b) => b.currentLevel > 0).length,
    [representativeBadges],
  )
  const totalSeriesCount = representativeBadges.length

  // List of unlocked treasures for Top 3 showcase picker
  const unlockedTreasures = useMemo(
    () => representativeBadges.filter((b) => b.currentLevel > 0),
    [representativeBadges],
  )

  // Combined inventory for looking up pinned badges
  const combinedAchievements = useMemo(
    () => [...items, ...representativeBadges],
    [items, representativeBadges],
  )

  // Selected series for detail modal
  const selectedSeries = useMemo(() => {
    if (!selectedBadge) return null
    if ('series' in selectedBadge && (selectedBadge as SeriesRepresentativeBadge).series) {
      return (selectedBadge as SeriesRepresentativeBadge).series
    }
    return (
      seriesList.find((series) => series.items.some((item) => item.type === selectedBadge.type))
      ?? null
    )
  }, [selectedBadge, seriesList])

  // Filtered series representatives based on active filter ('all' | 'unlocked' | 'locked')
  const visibleRepresentativeBadges = useMemo(() => {
    return representativeBadges.filter((badge) => {
      if (filter === 'unlocked') return badge.currentLevel > 0
      if (filter === 'locked') return badge.currentLevel === 0
      return true
    })
  }, [filter, representativeBadges])

  // Group visible series into 5 soft clay shelves
  const shelfItemsMap = useMemo(() => {
    const map = new Map<ShelfCategory, SeriesRepresentativeBadge[]>()
    for (const shelf of SHELVES_CONFIG) {
      map.set(shelf.id, [])
    }
    for (const badge of visibleRepresentativeBadges) {
      const category = classifyAchievementShelf(badge)
      const list = map.get(category) ?? []
      list.push(badge)
      map.set(category, list)
    }
    return map
  }, [visibleRepresentativeBadges])

  // Set of pinned badge types for quick O(1) lookup
  const favoriteBadgeTypes = useMemo(() => {
    return new Set(favoriteBadges.filter((type): type is string => Boolean(type)))
  }, [favoriteBadges])

  // Handlers for showcase pin / unpin
  const handlePinToPodium = useCallback(
    (badgeType: string, slotIndex: number) => {
      setFavoriteBadges((prev) => {
        const next = [...prev]
        for (let i = 0; i < next.length; i++) {
          if (next[i] === badgeType) next[i] = null
        }
        next[slotIndex] = badgeType
        saveFavoriteBadges(next)
        return next
      })
    },
    [],
  )

  const handleUnpinFromPodium = useCallback((badgeType: string) => {
    setFavoriteBadges((prev) => {
      const next = prev.map((t) => (t === badgeType ? null : t))
      saveFavoriteBadges(next)
      return next
    })
  }, [])

  return (
    <PageMotion className="achievement-experience flex flex-col gap-6 min-w-0">
      {/* Header Hero */}
      <header className="student-feature-hero achievement-hero" data-tone="sun">
        <ImportantCardMascot pose="celebrate" />
        <Link
          to="/profile"
          className="inline-flex min-h-11 items-center font-extrabold text-brand-700 hover:underline"
        >
          ← Về hồ sơ
        </Link>
        <div className="student-feature-hero-row mt-2">
          <div>
            <div className="eyebrow-chip">
              <NavBadgeIcon size={20} aria-hidden="true" />
              Vùng sưu tập báu vật
            </div>
            <h1 className="font-display text-3xl text-text sm:text-4xl">
              Kệ Trưng Bày Huy Hiệu Soft Clay
            </h1>
            <p className="mt-1 max-w-xl text-base font-semibold text-muted">
              Mỗi huy hiệu là một viên gạch thành tựu, cùng Mèo Mee tích lũy thật nhiều nhé!
            </p>
          </div>
          {!loading && totalSeriesCount > 0 && (
            <div className="achievement-hero-count shrink-0">
              <span className="achievement-hero-medal" aria-hidden="true">
                <NavBadgeIcon size={34} />
              </span>
              <p>
                <strong className="block font-display text-2xl text-text">
                  {unlockedSeriesCount}/{totalSeriesCount}
                </strong>
                <span className="text-sm font-bold text-muted">báu vật đã mở</span>
              </p>
            </div>
          )}
        </div>
        {!loading && totalSeriesCount > 0 && (
          <div className="achievement-collection-progress mt-3">
            <span className="sr-only">
              Đã mở {unlockedSeriesCount} trên {totalSeriesCount} báu vật
            </span>
            <span
              style={{
                width: `${Math.round((unlockedSeriesCount / totalSeriesCount) * 100)}%`,
              }}
            />
          </div>
        )}
      </header>

      {/* Error & Loading States */}
      {error && <ErrorState message={error} onRetry={() => void load()} inline />}
      {loading && <CardGridSkeleton count={6} />}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          title="Hành trình vừa bắt đầu"
          description="Hoàn thành một bài học để nhận huy hiệu đầu tiên."
          action={
            <Link to="/home">
              <Button>Về sảnh học</Button>
            </Link>
          }
        />
      )}

      {/* Main Content Area */}
      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col gap-6 min-w-0">
          {/* 3 Proudest Treasures Showcase */}
          <TopPodiumShowcase
            unlockedItems={unlockedTreasures}
            allAchievements={combinedAchievements}
            favoriteBadges={favoriteBadges}
            onFavoritesChange={setFavoriteBadges}
            onViewBadgeDetail={setSelectedBadge}
          />

          {/* Filter Navigation Rail */}
          <nav
            className="achievement-filter-rail flex items-center gap-2 overflow-x-auto py-1"
            aria-label="Lọc báu vật"
          >
            {([
              ['all', `Tất cả báu vật (${totalSeriesCount})`],
              ['unlocked', `Đã mở (${unlockedSeriesCount})`],
              ['locked', `Chưa mở (${totalSeriesCount - unlockedSeriesCount})`],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={cn(
                  'min-h-11 shrink-0 rounded-2xl border px-4 text-sm font-extrabold transition-colors',
                  filter === value
                    ? 'border-sun-400 bg-sun-400 text-sun-700 shadow-press'
                    : 'border-border bg-white/90 text-text hover:border-sun-200 hover:bg-sun-50',
                )}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* 5 Shelves Showcase */}
          {visibleRepresentativeBadges.length > 0 ? (
            <div className="flex flex-col gap-6 min-w-0">
              {SHELVES_CONFIG.map((shelf) => {
                const shelfItems = shelfItemsMap.get(shelf.id) ?? []
                if (shelfItems.length === 0) return null

                return (
                  <SoftClayShelf
                    key={shelf.id}
                    shelfId={shelf.id}
                    title={shelf.title}
                    subtitle={shelf.subtitle}
                    icon={shelf.icon}
                    items={shelfItems}
                    favoriteBadgeTypes={favoriteBadgeTypes}
                    onSelectBadge={setSelectedBadge}
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState
              title="Không có báu vật trong mục này"
              description="Chọn một mục khác để tiếp tục ngắm nhìn bộ sưu tập con nhé."
            />
          )}
        </div>
      )}

      {/* Badge Detail Modal */}
      <BadgeDetailModal
        item={selectedBadge}
        series={selectedSeries}
        favoriteBadges={favoriteBadges}
        onPinToPodium={handlePinToPodium}
        onUnpinFromPodium={handleUnpinFromPodium}
        onClose={() => setSelectedBadge(null)}
      />
    </PageMotion>
  )
}
