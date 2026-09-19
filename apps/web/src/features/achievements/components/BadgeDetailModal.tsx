import { memo, useMemo, useState } from 'react'
import { Check, Lock, Pin, Sparkles } from 'lucide-react'
import type { AchievementRow } from '@/shared/lib/api'
import { achievementBadgeAsset } from '../achievement-badge-assets'
import { NavBadgeIcon } from '@/shared/components/icons/KidNavIcons'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { Button } from '@/shared/components/ui/Button'
import { type AchievementSeries } from '../achievement-inventory'
import { cn } from '@/shared/lib/cn'

interface BadgeDetailModalProps {
  item: AchievementRow | null
  series?: AchievementSeries | null
  favoriteBadges: (string | null)[]
  onPinToPodium: (badgeType: string, slotIndex: number) => void
  onUnpinFromPodium: (badgeType: string) => void
  onClose: () => void
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
  if (semantic.includes('challenge')) return 'thử thách'
  return 'bước'
}

export const BadgeDetailModal = memo(function BadgeDetailModal({
  item,
  series,
  favoriteBadges,
  onPinToPodium,
  onUnpinFromPodium,
  onClose,
}: BadgeDetailModalProps) {
  const [isPinMenuOpen, setIsPinMenuOpen] = useState(false)
  const [activeTierType, setActiveTierType] = useState<string | null>(null)
  const [prevBaseType, setPrevBaseType] = useState<string | null>(null)

  // Reset activeTierType when modal opens with a different base item
  if (item && item.type !== prevBaseType) {
    setPrevBaseType(item.type)
    setActiveTierType(null)
  }

  const journeyItems = useMemo(() => {
    return series && series.items.length > 0 ? series.items : (item ? [item] : [])
  }, [series, item])

  // Current active milestone being viewed (defaults to base item)
  const activeItem = useMemo(() => {
    if (!item) return null
    if (activeTierType) {
      const match = journeyItems.find((t) => t.type === activeTierType)
      if (match) return match
    }
    return item
  }, [item, activeTierType, journeyItems])

  // First locked milestone index is the one currently in progress
  const inProgressIndex = useMemo(() => {
    return journeyItems.findIndex((t) => !t.unlocked)
  }, [journeyItems])

  const activeIndex = useMemo(() => {
    if (!activeItem) return 0
    return journeyItems.findIndex((t) => t.type === activeItem.type)
  }, [journeyItems, activeItem])

  const pinnedSlotIndex = useMemo(() => {
    if (!activeItem) return -1
    return favoriteBadges.findIndex((type) => type === activeItem.type)
  }, [activeItem, favoriteBadges])

  if (!item || !activeItem) return null

  const imageSrc =
    achievementBadgeAsset(activeItem)
    ?? (activeItem.imageUrl?.startsWith('/') || activeItem.imageUrl?.startsWith('http') ? activeItem.imageUrl : null)
    ?? (activeItem.icon.startsWith('/') || activeItem.icon.startsWith('http') ? activeItem.icon : null)

  const current = Math.max(0, activeItem.currentValue ?? 0)
  const remaining = Math.max(0, activeItem.requiredValue - current)
  const percent = activeItem.unlocked
    ? 100
    : activeItem.requiredValue > 0
      ? Math.min(100, Math.round((current / activeItem.requiredValue) * 100))
      : 0

  const isActiveInProgress = activeIndex === inProgressIndex
  const isActiveFuture = !activeItem.unlocked && !isActiveInProgress

  const meeMessage = activeItem.unlocked
    ? `🐾 Mèo AIKI reo vang: "Tuyệt đỉnh bạn học sinh ơi! Học sinh đã xuất sắc đánh thức trọn vẹn màu sắc rực rỡ của '${activeItem.title}'. Hãy tự hào ngắm nhìn báu vật lấp lánh này nhé!"`
    : isActiveInProgress
      ? `🐾 Mèo AIKI cổ vũ: "Linh thú đang hấp thụ từng giọt sương tri thức! Học sinh chỉ còn thiếu ${remaining.toLocaleString('vi-VN')} ${progressUnit(activeItem)} nữa thôi là thổi hồn màu sắc thành công rồi, cố lên nào!"`
      : `🐾 Mèo AIKI mách nhỏ: "Báu vật cấp cao '${activeItem.title}' đang say ngủ trong khối tượng thạch cao tinh khôi. Hãy chinh phục từng mốc trước đó để tiến tới đánh thức nhé!"`

  return (
    <AdventureModal
      open
      tone="achievement"
      eyebrow={activeItem.unlocked ? '✨ Báu vật đã mở khóa' : isActiveInProgress ? '⚡ Đang trong tầm tay' : '🔒 Đang khám phá'}
      title={activeItem.title}
      description={activeItem.description}
      onClose={onClose}
      actions={
        <div className="flex flex-wrap items-center justify-between gap-2 w-full">
          {activeItem.unlocked && (
            <div className="relative">
              {pinnedSlotIndex >= 0 ? (
                <Button
                  variant="secondary"
                  onClick={() => onUnpinFromPodium(activeItem.type)}
                  className="text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100"
                >
                  <Pin size={16} className="mr-1.5 fill-current text-amber-600" />
                  Đang ở Vị trí {pinnedSlotIndex + 1} (Gỡ)
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={() => setIsPinMenuOpen(!isPinMenuOpen)}
                    className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black shadow-press hover:brightness-105"
                  >
                    <Pin size={16} className="mr-1.5" />
                    Đặt vào 3 Báu Vật Tự Hào
                  </Button>

                  {isPinMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 flex flex-col gap-1 rounded-2xl border-2 border-amber-300 bg-white p-2 shadow-xl z-20 min-w-[170px]">
                      <span className="text-[11px] font-black text-amber-900 px-2 py-1 border-b border-amber-100">
                        Chọn vị trí đặt:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onPinToPodium(activeItem.type, 0)
                          setIsPinMenuOpen(false)
                        }}
                        className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-black text-slate-800 hover:bg-amber-50 text-left transition-colors"
                      >
                        ✨ Đặt vào Báu vật 1
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onPinToPodium(activeItem.type, 1)
                          setIsPinMenuOpen(false)
                        }}
                        className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-black text-slate-800 hover:bg-amber-50 text-left transition-colors"
                      >
                        ✨ Đặt vào Báu vật 2
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onPinToPodium(activeItem.type, 2)
                          setIsPinMenuOpen(false)
                        }}
                        className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-black text-slate-800 hover:bg-amber-50 text-left transition-colors"
                      >
                        ✨ Đặt vào Báu vật 3
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center gap-4 min-w-0">
        {/* Soft Clay Magnified Medallion Display (Morphs on milestone click) */}
        <div className="flex flex-col items-center justify-center p-2">
          <div className="relative h-32 w-32 sm:h-36 sm:w-36 flex items-center justify-center">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt=""
                className={cn(
                  'h-full w-full object-contain transition-all duration-300',
                  activeItem.unlocked
                    ? 'filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.22)]'
                    : 'badge-sculpture-locked select-none',
                )}
              />
            ) : (
              <div
                className={cn(
                  'flex h-28 w-28 items-center justify-center rounded-3xl transition-all duration-200',
                  activeItem.unlocked
                    ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-press'
                    : 'badge-sculpture-locked bg-slate-100 text-slate-400 border border-slate-200',
                )}
              >
                <NavBadgeIcon size={64} />
              </div>
            )}
          </div>
        </div>

        {/* Progress status card if locked */}
        {!activeItem.unlocked && (
          <div className="w-full rounded-2xl border-2 border-amber-200/80 bg-gradient-to-r from-amber-50/70 to-orange-50/70 p-3 text-left shadow-xs">
            <div className="flex items-center justify-between text-xs font-black text-slate-700">
              <span className="flex items-center gap-1.5 text-amber-800">
                <Lock size={14} className="text-amber-600" />
                <span>Còn {remaining.toLocaleString('vi-VN')} {progressUnit(activeItem)}</span>
              </span>
              <span className="font-extrabold text-amber-950">
                {current.toLocaleString('vi-VN')} / {activeItem.requiredValue.toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="dewdrop-progress-track mt-2 w-full">
              <div
                className="dewdrop-progress-fill"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Mee Cat Message */}
        <div className="w-full rounded-2xl border-2 border-amber-300/80 bg-amber-100/60 p-3.5 text-left shadow-xs">
          <p className="text-xs sm:text-sm font-black text-amber-950 leading-relaxed">
            {meeMessage}
          </p>
        </div>

        {/* Horizontal Growth Evolution Track (Chuỗi tiến hóa tăng trưởng) */}
        {journeyItems.length > 1 && (
          <div className="w-full rounded-3xl bg-gradient-to-b from-amber-50/80 via-white/90 to-amber-50/60 p-3.5 sm:p-4 border-2 border-amber-200/70 shadow-sm text-left mt-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 font-black text-xs shadow-xs">
                  <Sparkles size={15} />
                </span>
                <h3 className="font-display text-sm sm:text-base font-black text-slate-800">
                  Chuỗi Tiến Hóa Tăng Trưởng ({journeyItems.length} cấp)
                </h3>
              </div>
              <span className="text-[11px] font-extrabold text-amber-900/70">
                Chạm mốc để ngắm linh thú chuyển hình thái ✨
              </span>
            </div>

            <div className="relative w-full overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin">
              <div className="inline-flex items-center gap-1.5 sm:gap-2.5 min-w-full justify-start sm:justify-center py-1">
                {journeyItems.map((tierItem, index) => {
                  const isUnlocked = tierItem.unlocked
                  const isInProgress = index === inProgressIndex
                  const isSelected = tierItem.type === activeItem.type
                  const tierImage =
                    achievementBadgeAsset(tierItem)
                    ?? (tierItem.imageUrl?.startsWith('/') || tierItem.imageUrl?.startsWith('http') ? tierItem.imageUrl : null)
                    ?? (tierItem.icon.startsWith('/') || tierItem.icon.startsWith('http') ? tierItem.icon : null)
                  const hasNext = index < journeyItems.length - 1

                  return (
                    <div key={`${tierItem.type}-${tierItem.requiredValue}`} className="flex items-center shrink-0">
                      {/* Milestone Node */}
                      <button
                        type="button"
                        onClick={() => setActiveTierType(tierItem.type)}
                        className={cn(
                          'group relative flex flex-col items-center p-2 rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                          isSelected
                            ? 'bg-amber-100/90 ring-2 ring-amber-400 shadow-press scale-105'
                            : 'bg-white/90 hover:bg-amber-50/70 border border-amber-200/60 shadow-xs hover:scale-102',
                          isInProgress && !isSelected && 'ring-2 ring-amber-400/60 animate-pulse',
                        )}
                        title={`Chạm để xem ${tierItem.title}`}
                      >
                        {/* Level Tag */}
                        <span
                          className={cn(
                            'text-[10px] font-black px-2 py-0.5 rounded-full mb-1 transition-colors',
                            isUnlocked
                              ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/70'
                              : isInProgress
                                ? 'bg-amber-200 text-amber-900 ring-1 ring-amber-400'
                                : 'bg-slate-100 text-slate-500',
                          )}
                        >
                          Cấp {index + 1}
                        </span>

                        {/* Icon Frame */}
                        <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center p-1">
                          {tierImage ? (
                            <img
                              src={tierImage}
                              alt=""
                              className={cn(
                                'h-full w-full object-contain transition-all duration-200 group-hover:scale-110',
                                isUnlocked
                                  ? 'filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.16)]'
                                  : 'badge-sculpture-locked select-none',
                              )}
                            />
                          ) : (
                            <div
                              className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-xl',
                                isUnlocked
                                  ? 'bg-amber-300 text-amber-900'
                                  : 'badge-sculpture-locked bg-slate-100 text-slate-400',
                              )}
                            >
                              <NavBadgeIcon size={26} />
                            </div>
                          )}

                          {/* Completed Tick */}
                          {isUnlocked && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs ring-2 ring-white">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                        </div>

                        {/* Title Subtext */}
                        <span className="mt-1 line-clamp-1 max-w-[86px] text-center text-[11px] font-black text-slate-800 leading-tight">
                          {tierItem.title.includes(' · ') ? tierItem.title.split(' · ')[1] : tierItem.title}
                        </span>

                        {/* Status Label */}
                        <div className="mt-1">
                          {isUnlocked ? (
                            <span className="text-[10px] font-black text-emerald-700">✓ Đã mở</span>
                          ) : isInProgress ? (
                            <span className="text-[10px] font-black text-amber-700 animate-pulse">⚡ Đang mở</span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">🌱 Cần {tierItem.requiredValue}</span>
                          )}
                        </div>
                      </button>

                      {/* Growth Connector Line */}
                      {hasNext && (
                        <div className="flex items-center px-1 sm:px-2">
                          <div
                            className={cn(
                              'growth-connector-line w-6 sm:w-10',
                              isUnlocked && journeyItems[index + 1]?.unlocked
                                ? 'completed'
                                : isUnlocked
                                  ? 'active'
                                  : '',
                            )}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdventureModal>
  )
})
