import { memo } from 'react'
import type { AchievementRow } from '@/shared/lib/api'
import { achievementBadgeAsset } from '../achievement-badge-assets'
import { NavBadgeIcon } from '@/shared/components/icons/KidNavIcons'
import { cn } from '@/shared/lib/cn'

export interface CollectibleBadgeItemProps {
  item: AchievementRow & {
    seriesTitle?: string
    currentLevel?: number
    totalLevels?: number
  }
  onSelect: (item: AchievementRow) => void
  isPinned?: boolean
}

export const CollectibleBadgeItem = memo(function CollectibleBadgeItem({
  item,
  onSelect,
  isPinned = false,
}: CollectibleBadgeItemProps) {
  const imageSrc =
    achievementBadgeAsset(item)
    ?? (item.imageUrl?.startsWith('/') || item.imageUrl?.startsWith('http') ? item.imageUrl : null)
    ?? (item.icon.startsWith('/') || item.icon.startsWith('http') ? item.icon : null)

  const current = Math.max(0, item.currentValue ?? 0)
  const percent = item.unlocked
    ? 100
    : item.requiredValue > 0
      ? Math.min(100, Math.round((current / item.requiredValue) * 100))
      : 0

  const hasMultipleLevels = (item.totalLevels ?? 1) > 1
  const isMaxLevel = hasMultipleLevels && item.currentLevel === item.totalLevels
  const isLocked = !item.unlocked
  const displayName = item.seriesTitle ?? item.title

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="collectible-badge-card group relative flex min-w-0 flex-col items-center h-[205px] sm:h-[220px] w-full max-w-[170px] p-3 rounded-2xl bg-white/95 border-2 border-amber-200/70 hover:border-amber-400 hover:bg-amber-50/40 shadow-soft hover:shadow-clay hover:-translate-y-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 text-center"
      aria-label={`${displayName} - ${item.unlocked ? (isMaxLevel ? 'Đạt cấp tối đa' : `Cấp ${item.currentLevel}/${item.totalLevels}`) : `Chưa mở, tiến độ ${percent}%`}`}
    >
      {/* Pinned badge indicator */}
      {isPinned && (
        <span
          className="absolute -top-1.5 -right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-sun-400 text-xs font-black text-amber-900 shadow-sm ring-2 ring-white"
          title="Đang trong 3 báu vật tự hào"
        >
          ★
        </span>
      )}

      {/* Badge Medallion - Enlarged to 96px – 108px (w-24 h-24 sm:w-28 sm:h-28) */}
      <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            loading="lazy"
            decoding="async"
            className={cn(
              'h-full w-full object-contain transition-all duration-300 transform scale-[1.22]',
              item.unlocked
                ? 'filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.16)]'
                : 'badge-sculpture-locked select-none',
            )}
          />
        ) : (
          <div
            className={cn(
              'flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl transition-all duration-200',
              item.unlocked
                ? 'bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900 shadow-press'
                : 'badge-sculpture-locked bg-slate-100 text-slate-400 border border-slate-200',
            )}
          >
            <NavBadgeIcon size={44} />
          </div>
        )}
      </div>

      {/* Khối Tiêu đề (cố định chiều cao, căn giữa chữ) */}
      <div className="mt-2 flex h-9 sm:h-10 w-full items-center justify-center min-w-0">
        <p className="line-clamp-2 w-full text-center text-xs sm:text-sm font-black leading-tight text-slate-800 transition-colors group-hover:text-amber-800">
          {displayName}
        </p>
      </div>

      {/* Khối Footer: Pill cấp độ + Khe tiến độ giữ chỗ */}
      <div className="mt-auto flex flex-col items-center justify-end w-full pb-0.5">
        {/* Pill cấp độ */}
        <div className="flex items-center justify-center h-5">
          {hasMultipleLevels && (
            isMaxLevel ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100/90 px-2 py-0.5 text-[10px] sm:text-[11px] font-black text-amber-800 ring-1 ring-amber-300/80 shadow-xs">
                Hoàn thành ★
              </span>
            ) : item.currentLevel && item.currentLevel > 0 ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] sm:text-[11px] font-black text-emerald-800 ring-1 ring-emerald-300/70 shadow-xs">
                Cấp {item.currentLevel}/{item.totalLevels}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                Cấp 0/{item.totalLevels}
              </span>
            )
          )}
        </div>

        {/* Khe tiến độ giọt sương */}
        <div className="h-2 mt-1.5 flex items-center justify-center w-full">
          {isLocked ? (
            <div
              className="dewdrop-progress-track w-16 sm:w-20 overflow-hidden"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              title={`Tiến độ: ${current}/${item.requiredValue}`}
            >
              <div
                className="dewdrop-progress-fill"
                style={{ width: `${percent}%` }}
              />
            </div>
          ) : (
            <div
              className="w-16 sm:w-20 h-1.5 opacity-0 pointer-events-none"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </button>
  )
})
