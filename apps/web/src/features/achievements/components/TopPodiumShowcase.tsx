import { memo, useMemo, useState } from 'react'
import { Plus, X, Award, Sparkles } from 'lucide-react'
import type { AchievementRow } from '@/shared/lib/api'
import { achievementBadgeAsset } from '../achievement-badge-assets'
import { NavBadgeIcon } from '@/shared/components/icons/KidNavIcons'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

export const FAVORITE_BADGES_STORAGE_KEY = 'aikids_favorite_badges'

export function loadFavoriteBadges(): (string | null)[] {
  try {
    const raw = localStorage.getItem(FAVORITE_BADGES_STORAGE_KEY)
    if (!raw) return [null, null, null]
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length >= 3) {
      return [
        typeof parsed[0] === 'string' ? parsed[0] : null,
        typeof parsed[1] === 'string' ? parsed[1] : null,
        typeof parsed[2] === 'string' ? parsed[2] : null,
      ]
    }
    return [null, null, null]
  } catch {
    return [null, null, null]
  }
}

export function saveFavoriteBadges(favorites: (string | null)[]): void {
  try {
    localStorage.setItem(FAVORITE_BADGES_STORAGE_KEY, JSON.stringify(favorites))
  } catch {
    // Ignore storage quota or disabled errors
  }
}

interface TopPodiumShowcaseProps {
  unlockedItems: AchievementRow[]
  allAchievements: AchievementRow[]
  favoriteBadges: (string | null)[]
  onFavoritesChange: (newFavorites: (string | null)[]) => void
  onViewBadgeDetail: (item: AchievementRow) => void
}

type TreasureSlot = {
  slotIndex: number
  label: string
}

const TREASURE_SLOTS: TreasureSlot[] = [
  { slotIndex: 0, label: 'Báu vật 1' },
  { slotIndex: 1, label: 'Báu vật 2' },
  { slotIndex: 2, label: 'Báu vật 3' },
]

export const TopPodiumShowcase = memo(function TopPodiumShowcase({
  unlockedItems,
  allAchievements,
  favoriteBadges,
  onFavoritesChange,
  onViewBadgeDetail,
}: TopPodiumShowcaseProps) {
  const [activePickerSlot, setActivePickerSlot] = useState<number | null>(null)

  // Quick lookup map for achievements
  const achievementMap = useMemo(() => {
    const map = new Map<string, AchievementRow>()
    for (const item of allAchievements) {
      map.set(item.type, item)
    }
    return map
  }, [allAchievements])

  const handleSelectBadgeForSlot = (badgeType: string) => {
    if (activePickerSlot === null) return
    const next = [...favoriteBadges]
    // If this badge was in another slot, clear that slot
    for (let i = 0; i < next.length; i++) {
      if (next[i] === badgeType) {
        next[i] = null
      }
    }
    next[activePickerSlot] = badgeType
    onFavoritesChange(next)
    saveFavoriteBadges(next)
    setActivePickerSlot(null)
  }

  const handleRemoveBadgeFromSlot = (slotIndex: number) => {
    const next = [...favoriteBadges]
    next[slotIndex] = null
    onFavoritesChange(next)
    saveFavoriteBadges(next)
    setActivePickerSlot(null)
  }

  return (
    <section
      className="soft-clay-showcase-panel relative flex flex-col gap-4 min-w-0 w-full"
      aria-label="3 Báu vật học sinh tự hào nhất"
    >
      {/* Frameless Podium Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b-2 border-dashed border-amber-200/80 pb-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-xl shadow-press">
            ✨
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              3 Báu Vật Học Sinh Tự Hào Nhất
            </h2>
            <p className="text-xs sm:text-sm font-extrabold text-amber-900/70">
              Chạm vào ô để ghim 3 báu vật học sinh yêu thích nhất lên đây nhé!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 bg-amber-100/90 px-3.5 py-1.5 rounded-full ring-1 ring-amber-300/80 shadow-xs">
          <Sparkles size={14} className="text-amber-600" />
          <span>{unlockedItems.length} báu vật sẵn sàng</span>
        </div>
      </div>

      {/* 3 Floating Organic Treasures with Soft Clay Sun Halo in Curved Arc Layout */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 max-w-4xl mx-auto w-full px-2 pt-6 pb-4 justify-items-center items-center">
        {TREASURE_SLOTS.map((config) => {
          const isCenter = config.slotIndex === 1
          const isLeft = config.slotIndex === 0

          const badgeType = favoriteBadges[config.slotIndex]
          const badgeItem = badgeType ? achievementMap.get(badgeType) : null
          const imageSrc = badgeItem
            ? achievementBadgeAsset(badgeItem)
              ?? (badgeItem.imageUrl?.startsWith('/') || badgeItem.imageUrl?.startsWith('http')
                ? badgeItem.imageUrl
                : null)
              ?? (badgeItem.icon.startsWith('/') || badgeItem.icon.startsWith('http')
                ? badgeItem.icon
                : null)
            : null

          // Staggered floating animation class
          const floatClass =
            config.slotIndex === 0
              ? 'animate-float-slow'
              : config.slotIndex === 1
                ? 'animate-float-delayed'
                : 'animate-float-delayed-2'

          // Arc curvature class: center elevated (-translate-y-3 sm:-translate-y-5), left tilted -rotate-1.5, right tilted rotate-1.5
          const arcClass = isCenter
            ? '-translate-y-3 sm:-translate-y-5 z-10'
            : isLeft
              ? '-rotate-1.5 z-0'
              : 'rotate-1.5 z-0'

          // Sizing:
          // 2 bên: w-40 h-40 sm:w-48 sm:h-48
          // Ở giữa (Centerpiece): w-48 h-48 sm:w-56 sm:h-56
          const iconSizeClass = isCenter
            ? 'w-48 h-48 sm:w-56 sm:h-56'
            : 'w-40 h-40 sm:w-48 sm:h-48'

          return (
            <div
              key={config.slotIndex}
              className={cn(
                'relative flex flex-col items-center w-full max-w-[240px] sm:max-w-[280px] gap-1.5 sm:gap-2 transition-all duration-300 p-2',
                arcClass,
              )}
            >
              {badgeItem ? (
                <div className={cn('group relative flex flex-col items-center gap-1.5 sm:gap-2 min-w-0 w-full', floatClass)}>
                  {/* Badge Item Button to View Detail (Touch Target mượt mà nảy nhẹ lò xo) */}
                  <button
                    type="button"
                    onClick={() => onViewBadgeDetail(badgeItem)}
                    className="group/btn relative flex flex-col items-center gap-1.5 sm:gap-2 min-w-0 w-full p-1 rounded-3xl transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
                    title={`${badgeItem.title} (Bấm xem chi tiết)`}
                  >
                    {/* Floating Medallion with natural warm sun halo - 180px – 220px visual footprint */}
                    <div className={cn('relative flex items-center justify-center shrink-0', iconSizeClass)}>
                      {/* Đĩa hào quang ấm ôm sát chân icon, tạo cảm giác như báu vật tỏa ánh hào quang mặt trời rực rỡ */}
                      <div
                        className={cn(
                          'absolute inset-0 rounded-full pointer-events-none -z-10 transition-all duration-300',
                          isCenter
                            ? 'hero-centerpiece-glow scale-125 sm:scale-135'
                            : 'soft-clay-sun-halo scale-115 sm:scale-125',
                        )}
                        aria-hidden="true"
                      />

                      {/* Hạt sao lấp lánh Soft Clay Sparkles nhấp nháy */}
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 pointer-events-none z-10">
                        <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-amber-400 animate-pulse drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]" />
                      </div>
                      <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 pointer-events-none z-10">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-300 animate-pulse delay-300 drop-shadow-[0_2px_6px_rgba(251,191,36,0.5)]" />
                      </div>

                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={badgeItem.title}
                          className="h-full w-full object-contain filter drop-shadow-[0_16px_26px_rgba(217,119,6,0.35)] transition-transform duration-200 transform scale-[1.38] sm:scale-[1.46]"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-press"
                        >
                          <NavBadgeIcon size={isCenter ? 76 : 64} />
                        </div>
                      )}
                    </div>

                    {/* Tên báu vật to rõ font display mềm mại ngay sát dưới chân icon (khoảng cách chỉ 6px - 8px) */}
                    <p className="line-clamp-2 max-w-full text-center font-display text-base sm:text-lg font-black text-slate-800 leading-tight">
                      {badgeItem.title}
                    </p>
                  </button>

                  {/* Nút [ ✨ Đổi báu vật ] nhỏ gọn Soft Clay nằm xinh xắn ngay dưới tên báu vật & nút gỡ nhỏ tinh tế */}
                  <div className="flex items-center justify-center gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => setActivePickerSlot(config.slotIndex)}
                      className="inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300/80 shadow-xs transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      title="Đổi báu vật khác"
                    >
                      <span>✨ Đổi báu vật</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveBadgeFromSlot(config.slotIndex)}
                      className="inline-flex items-center justify-center h-6 w-6 rounded-full text-slate-400 hover:text-coral-600 hover:bg-coral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400 active:scale-90"
                      title="Gỡ khỏi góc báu vật"
                      aria-label="Gỡ báu vật"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Slot with inviting soft clay plus on sun halo */
                <div className={cn('group relative flex flex-col items-center gap-1.5 sm:gap-2 justify-center min-w-0 w-full', floatClass)}>
                  <button
                    type="button"
                    onClick={() => setActivePickerSlot(config.slotIndex)}
                    className="group/empty flex flex-col items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-3xl p-1 cursor-pointer"
                    aria-label={`Thêm báu vật cho ${config.label}`}
                  >
                    <div
                      className={cn(
                        'relative rounded-full border-2 border-dashed border-amber-300/90 bg-white/85 flex items-center justify-center shadow-xs transition-all duration-200 group-hover/empty:scale-105 group-hover/empty:border-amber-400 group-hover/empty:bg-amber-100/50',
                        iconSizeClass,
                      )}
                    >
                      {/* Sun halo background for empty slot */}
                      <div
                        className={cn(
                          'absolute inset-0 rounded-full pointer-events-none -z-10 opacity-60 transition-all duration-300',
                          isCenter ? 'hero-centerpiece-glow' : 'soft-clay-sun-halo',
                        )}
                        aria-hidden="true"
                      />
                      <Plus
                        size={isCenter ? 52 : 44}
                        className="text-amber-500 transition-transform duration-200 group-hover/empty:scale-125 group-hover/empty:rotate-90"
                      />
                    </div>

                    <span className="font-display text-sm sm:text-base font-black text-amber-900/80 group-hover/empty:text-amber-950 text-center">
                      Thêm báu vật
                    </span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Badge Picker Modal */}
      {activePickerSlot !== null && (
        <AdventureModal
          open
          tone="achievement"
          eyebrow={`Vị trí ${TREASURE_SLOTS.find((s) => s.slotIndex === activePickerSlot)?.label ?? 'Báu vật'}`}
          title="Chọn Báu Vật Tự Hào Nhất"
          description="Chọn một báu vật học sinh đã mở để đặt vào góc tự hào."
          onClose={() => setActivePickerSlot(null)}
          actions={
            <div className="flex w-full items-center justify-between gap-2">
              {favoriteBadges[activePickerSlot] && (
                <Button
                  variant="secondary"
                  onClick={() => handleRemoveBadgeFromSlot(activePickerSlot)}
                  className="text-coral-600 hover:text-coral-700"
                >
                  <X size={16} className="mr-1 inline" /> Gỡ báu vật
                </Button>
              )}
              <Button variant="secondary" onClick={() => setActivePickerSlot(null)}>
                Đóng
              </Button>
            </div>
          }
        >
          {unlockedItems.length === 0 ? (
            <div className="py-6 text-center">
              <Award size={48} className="mx-auto text-amber-400 mb-2 opacity-60" />
              <p className="font-bold text-slate-700">Học sinh chưa có báu vật nào đã mở.</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Hãy hoàn thành bài học để mở khóa báu vật đầu tiên nhé!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto p-1">
              {unlockedItems.map((item) => {
                const isCurrentInSlot = favoriteBadges[activePickerSlot] === item.type
                const isInOtherSlot = favoriteBadges.includes(item.type) && !isCurrentInSlot
                const imageSrc =
                  achievementBadgeAsset(item)
                  ?? (item.imageUrl?.startsWith('/') || item.imageUrl?.startsWith('http')
                    ? item.imageUrl
                    : null)
                  ?? (item.icon.startsWith('/') || item.icon.startsWith('http')
                    ? item.icon
                    : null)

                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleSelectBadgeForSlot(item.type)}
                    className={cn(
                      'flex flex-col items-center p-2.5 rounded-2xl border-2 text-center transition-all duration-150',
                      isCurrentInSlot
                        ? 'border-sun-400 bg-sun-50 shadow-press ring-2 ring-sun-400'
                        : 'border-amber-200/80 bg-white hover:border-amber-400 hover:bg-amber-50/50',
                    )}
                  >
                    <div className="relative h-16 w-16 sm:h-18 sm:w-18 flex items-center justify-center">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt=""
                          className="h-full w-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.12)] transform scale-[1.22]"
                        />
                      ) : (
                        <NavBadgeIcon size={34} />
                      )}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs font-black text-slate-800 leading-tight">
                      {item.title}
                    </p>
                    {isCurrentInSlot ? (
                      <span className="mt-1 text-[10px] font-black text-amber-700">✓ Đang đặt</span>
                    ) : isInOtherSlot ? (
                      <span className="mt-1 text-[10px] font-bold text-slate-400">Đổi sang đây</span>
                    ) : (
                      <span className="mt-1 text-[10px] font-bold text-brand-600">Chọn báu vật</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </AdventureModal>
      )}
    </section>
  )
})
