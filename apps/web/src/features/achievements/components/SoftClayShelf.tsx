import { memo } from 'react'
import type { AchievementRow } from '@/shared/lib/api'
import { CollectibleBadgeItem, type CollectibleBadgeItemProps } from './CollectibleBadgeItem'
import { cn } from '@/shared/lib/cn'

interface SoftClayShelfProps {
  shelfId: string
  title: string
  subtitle?: string
  icon?: string
  items: CollectibleBadgeItemProps['item'][]
  favoriteBadgeTypes?: Set<string>
  onSelectBadge: (item: AchievementRow) => void
  className?: string
}

export const SoftClayShelf = memo(function SoftClayShelf({
  title,
  subtitle,
  icon,
  items,
  favoriteBadgeTypes = new Set(),
  onSelectBadge,
  className,
}: SoftClayShelfProps) {
  const unlockedCount = items.filter((item) => item.unlocked).length
  const totalCount = items.length

  if (totalCount === 0) return null

  return (
    <section
      className={cn('soft-clay-showcase-panel flex flex-col gap-3.5 min-w-0', className)}
      aria-label={title}
    >
      {/* Soft Clay Horizon Ribbon Header */}
      <div className="soft-clay-horizon-ribbon">
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-200 to-amber-300 text-amber-950 text-xl shadow-press">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h2 className="font-display text-lg sm:text-xl font-black text-slate-800 tracking-tight truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-[13px] font-bold text-amber-900/70 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Badge counter pill */}
        <div className="flex items-center gap-1.5 rounded-full bg-amber-100/90 px-3 py-1 text-xs font-black text-amber-950 shadow-xs ring-1 ring-amber-300/80 shrink-0">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span>
            {unlockedCount}/{totalCount} đã mở
          </span>
        </div>
      </div>

      {/* Badges Showcase Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 justify-items-center items-start pt-2 pb-1 min-w-0">
        {items.map((item) => (
          <CollectibleBadgeItem
            key={`${item.type}-${item.requiredValue}`}
            item={item}
            isPinned={favoriteBadgeTypes.has(item.type)}
            onSelect={onSelectBadge}
          />
        ))}
      </div>
    </section>
  )
})
