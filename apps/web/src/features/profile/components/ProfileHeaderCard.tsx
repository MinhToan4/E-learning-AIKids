import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { api, type User } from '@/shared/lib/api'
import { avatarEmoji, avatarImage } from '@/shared/config/avatars'
import {
  type RewardEquipment,
  profileCardBackgroundStyle,
  profileCardBackgroundTone,
  rewardFrameStyle,
  readRewardEquipment,
} from '@/features/rewards/reward-equipment'
import { REWARD_CATALOG } from '@/shared/lib/creation/rewards'
import { resolveCatalogRewardAsset, type RewardCatalogAssets } from '@/features/rewards/reward-catalog-assets'
import { getResolvedRewardAssetUrl } from '@/features/rewards/reward-assets'
import { rewardTitleAsset } from '@/features/rewards/title-assets'

type FrameShape = 'circle' | 'rounded-square' | 'square'

function normalizeFrameShape(value: unknown): FrameShape {
  if (value === 'square') return 'square'
  if (value === 'rounded-square' || value === 'squircle') return 'rounded-square'
  return 'circle'
}

export interface ProfileHeaderCardProps {
  user: User | null
  explorerLevel: number
  explorerXp: number
  xpIntoLevel: number
  xpToNextLevel: number
  onOpenAvatarPicker: () => void
  profileSlug?: string | null
  equipment?: RewardEquipment
}

export function ProfileHeaderCard({
  user,
  explorerLevel,
  explorerXp: _explorerXp,
  xpIntoLevel,
  xpToNextLevel,
  onOpenAvatarPicker,
  profileSlug,
  equipment: propEquipment,
}: ProfileHeaderCardProps) {
  const [cachedEquipment, setCachedEquipment] = useState<RewardEquipment>(() =>
    user ? readRewardEquipment(user.id) : {},
  )
  const equipment = propEquipment ?? cachedEquipment
  const [framePresentation, setFramePresentation] = useState<{
    rewardId: string
    assetUrl?: string
    shape: FrameShape
  } | null>(null)
  const [titleArtworkUrl, setTitleArtworkUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const sync = () => setCachedEquipment(readRewardEquipment(user.id))
    window.addEventListener('aikids:reward-equipped', sync)
    return () => {
      window.removeEventListener('aikids:reward-equipped', sync)
    }
  }, [user?.id])

  useEffect(() => {
    const rewardId = equipment?.frame
    if (!rewardId) {
      setFramePresentation(null)
      return
    }
    let active = true
    void api<{ items?: Array<{
      code: string
      assets?: RewardCatalogAssets
      displayConfig?: Record<string, unknown>
    }> }>('/api/gamification/catalog?type=reward&v=2026.08.01.6')
      .then(({ items }) => {
        if (!active) return
        const item = items?.find((candidate) => candidate.code === rewardId)
        const shapeValue = item?.displayConfig?.frameShape
          ?? item?.displayConfig?.avatarShape
          ?? item?.displayConfig?.shape
        setFramePresentation({
          rewardId,
          assetUrl: item
            ? resolveCatalogRewardAsset({ id: item.code, assets: item.assets }, 'primary')
            : getResolvedRewardAssetUrl(rewardId),
          shape: normalizeFrameShape(shapeValue),
        })
      })
      .catch(() => {
        if (!active) return
        setFramePresentation({
          rewardId,
          assetUrl: getResolvedRewardAssetUrl(rewardId),
          shape: 'circle',
        })
      })
    return () => {
      active = false
    }
  }, [equipment?.frame])

  useEffect(() => {
    const rewardId = equipment?.title
    if (!rewardId) {
      setTitleArtworkUrl(null)
      return
    }
    const localArtwork = rewardTitleAsset(rewardId)
    let active = true
    void api<{ items?: Array<{
      code: string
      assets?: RewardCatalogAssets
    }> }>('/api/gamification/catalog?type=reward&v=2026.08.01.6')
      .then(({ items }) => {
        if (!active) return
        const item = items?.find((candidate) => candidate.code === rewardId)
        setTitleArtworkUrl(
          (item ? resolveCatalogRewardAsset({ id: item.code, assets: item.assets }, 'primary') : undefined)
          ?? localArtwork
          ?? null,
        )
      })
      .catch(() => {
        if (active) setTitleArtworkUrl(localArtwork ?? null)
      })
    return () => {
      active = false
    }
  }, [equipment?.title])

  const displayName = user?.nickname || user?.name || 'Nhà Thám Hiểm'
  const avatarUrl = avatarImage(user?.avatarId)

  // Progress percentage calculation
  const progressPercent =
    xpToNextLevel > 0
      ? Math.min(100, Math.max(0, Math.round((xpIntoLevel / xpToNextLevel) * 100)))
      : 0

  let displayTitle = 'Nhà Thám Hiểm Nhí'
  if (equipment?.title) {
    const catalogItem = REWARD_CATALOG.find(
      (r) => (r.id === equipment.title || r.equipValue === equipment.title) && r.kind === 'title',
    )
    if (catalogItem) {
      displayTitle = catalogItem.name || catalogItem.equipValue || 'Nhà Thám Hiểm Nhí'
    } else if (typeof equipment.title === 'string' && equipment.title.trim()) {
      displayTitle = equipment.title
    }
  }

  const bgStyle = profileCardBackgroundStyle(equipment?.background)
  const tone = profileCardBackgroundTone(equipment?.background)
  const isDarkTone = tone === 'dark'
  const frameStyle = equipment?.frame ? rewardFrameStyle(equipment.frame) : undefined
  const usesBuiltInFrameRenderer = Boolean(frameStyle && Object.keys(frameStyle).length > 0)
  const activeFramePresentation = framePresentation?.rewardId === equipment?.frame
    ? framePresentation
    : null
  const frameShape = activeFramePresentation?.shape ?? 'circle'
  const frameRadiusClass = useMemo(() => {
    if (frameShape === 'square') return 'rounded-none'
    if (frameShape === 'rounded-square') return 'rounded-2xl'
    return 'rounded-full'
  }, [frameShape])
  const hasCustomBg = Boolean(equipment?.background)

  return (
    <section
      aria-label="Thẻ hồ sơ thám hiểm"
      className="relative overflow-hidden rounded-[2.2rem] bg-white/95 border-2 border-amber-200/90 p-4 sm:p-6 shadow-clay min-w-0 transition-all duration-300"
      style={bgStyle}
    >
      {/* Soft Clay Glaze decorative background highlights (when no custom background equipped) */}
      {!hasCustomBg && (
        <>
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-100/60 blur-xl" />
          <div className="pointer-events-none absolute left-1/3 -bottom-10 h-32 w-32 rounded-full bg-orange-100/50 blur-lg" />
        </>
      )}

      {/* Backdrop glass overlay when custom background is equipped to keep typography pristine */}
      {hasCustomBg && (
        <div
          className={`pointer-events-none absolute inset-0 backdrop-blur-[2px] transition-colors ${
            isDarkTone ? 'bg-slate-950/40' : 'bg-white/40'
          }`}
        />
      )}

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full min-w-0">
        {/* Avatar squircle bo góc tròn 3D với khung trang trí & nút bấm đổi avatar */}
        <div className="relative shrink-0">
          <div
            data-profile-frame-shape={frameShape}
            className={`w-20 h-20 sm:w-24 sm:h-24 ${frameRadiusClass} border-4 border-white shadow-clay overflow-hidden bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center relative transition-all`}
            style={frameStyle}
          >
            <span data-profile-avatar-layer className={`absolute inset-[10%] z-20 overflow-hidden ${frameRadiusClass} bg-white`}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-4xl sm:text-5xl select-none" aria-hidden="true">
                  {avatarEmoji(user?.avatarId)}
                </span>
              )}
            </span>
            {activeFramePresentation?.assetUrl && !usesBuiltInFrameRenderer && (
              <img
                src={activeFramePresentation.assetUrl}
                alt=""
                data-profile-frame-artwork
                className="pointer-events-none absolute inset-0 z-10 h-full w-full max-w-none object-contain"
                onError={(event) => { event.currentTarget.hidden = true }}
              />
            )}
          </div>
          <button
            type="button"
            onClick={onOpenAvatarPicker}
            aria-label="Đổi hình đại diện"
            title="Đổi hình đại diện"
            className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-white text-orange-600 font-black px-3 py-1 shadow-[0_3px_0_#cbd5e1] border border-orange-200 hover:scale-105 active:translate-y-0.5 active:shadow-none text-xs transition-transform cursor-pointer"
          >
            Đổi ảnh
          </button>
        </div>

        {/* Thông tin học sinh: Tiêu đề, Tên, Cấp độ, Chip Online, Thanh tiến độ XP */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-2.5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <p
                  className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider ${
                    isDarkTone ? 'text-amber-300 drop-shadow-sm' : 'text-orange-600'
                  }`}
                >
                  HỒ SƠ THÁM HIỂM
                </p>
                <span className="sr-only">Hồ sơ của con</span>
              </div>
              <h1
                className={`text-2xl sm:text-3xl font-black tracking-tight break-words ${
                  isDarkTone ? 'text-white drop-shadow-md' : 'text-slate-900'
                }`}
              >
                {displayName}
              </h1>
            </div>

            <div className="flex items-center gap-2 justify-center sm:justify-end flex-wrap">
              {/* Huy hiệu cấp độ Soft Clay & Danh hiệu trang bị */}
              <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-black text-amber-900 shadow-2xs shrink-0">
                <span className="whitespace-nowrap">Cấp {explorerLevel}</span>
                <span className="h-4 w-px bg-amber-300" aria-hidden="true" />
                {titleArtworkUrl ? (
                  <img
                    src={titleArtworkUrl}
                    alt={displayTitle}
                    data-profile-title-artwork
                    className="h-7 w-auto max-w-44 object-contain sm:max-w-52"
                    onError={() => setTitleArtworkUrl(null)}
                  />
                ) : (
                  <span>{displayTitle}</span>
                )}
              </div>

              {/* Chip Online màu ngọc lục bảo */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300 shadow-2xs shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online</span>
              </div>

              {profileSlug && (
                <Link
                  to={`/u/${profileSlug}`}
                  className="inline-flex min-h-8 items-center justify-center rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 px-3 py-1 text-xs font-black text-orange-700 shadow-soft transition-all cursor-pointer shrink-0"
                >
                  Xem bản chia sẻ
                </Link>
              )}
            </div>
          </div>

          {/* Thanh tiến độ XP Soft Clay bo tròn vàng hổ phách */}
          <div className="mt-1 w-full flex flex-col gap-1.5">
            <div
              className={`flex items-center justify-between text-xs sm:text-sm font-black ${
                isDarkTone ? 'text-slate-100 drop-shadow-xs' : 'text-slate-700'
              }`}
            >
              <span>Tiến độ kinh nghiệm</span>
              <span
                className={`tabular-nums tracking-wide font-black ${
                  isDarkTone ? 'text-amber-300 drop-shadow-xs' : 'text-orange-600'
                }`}
              >
                {xpIntoLevel}/{xpToNextLevel} XP
              </span>
            </div>
            <div className="h-3 sm:h-3.5 w-full overflow-hidden rounded-full bg-slate-100/90 p-0.5 border border-slate-200/80 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mascot Mèo Aiki đồng hành vẫy chào ở góc thẻ hồ sơ */}
        <div className="hidden sm:flex shrink-0 items-center justify-center self-center pl-1 select-none pointer-events-none">
          <img
            src="/assets/aikid-ui/mascot-original/course-wave.webp"
            alt="Mèo Aiki đồng hành"
            className="w-20 h-20 md:w-24 md:h-24 lg:w-26 lg:h-26 object-contain drop-shadow-md hover:scale-105 transition-transform"
            loading="eager"
          />
        </div>
      </div>
    </section>
  )
}
