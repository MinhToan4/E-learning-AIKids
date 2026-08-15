import { useEffect, useMemo, useState } from 'react'
import { avatarEmoji, avatarImage } from '@/shared/config/avatars'
import { designerAssets } from '@/shared/config/assets'
import { api, type User } from '@/shared/lib/api'
import { REWARD_CATALOG } from '@/shared/lib/creation/rewards'
import { explorerLevelForXp } from '@/shared/lib/creation/xp-levels'
import { readProfileAvatar } from '@/features/profile/profile-showcase'
import {
  readRewardEquipment,
  rewardFrameStyle,
  getRewardAssetUrl,
  type RewardEquipment,
} from './reward-equipment'
import {
  effectAuraClassForReward,
  ProfileRewardEffect,
} from './RewardEffectArtwork'
import {
  getGeneratedRewardAssetUrl,
  getLevelRewardNumber,
  getResolvedRewardAssetUrl,
  getSharedLevelRewardAssetId,
} from './reward-assets'
import { rewardTitleAsset } from './title-assets'
import { resolveCatalogRewardAsset, type RewardCatalogAssets } from './reward-catalog-assets'
import { DEFAULT_PROFILE_CARD_LAYOUT, PROFILE_CARD_LAYOUT_CODE, normalizeProfileCardLayout, profileCardSlotStyle, type ProfileCardLayout } from '@/features/profile/profile-card-layout'

const companionAssetNames: Record<string, string> = {
  'companion-paco-cloud': 'Paco Mây',
  'companion-paco-leaf': 'Paco Lá',
  'companion-paco-sea': 'Paco Biển',
  'companion-paco-fire': 'Paco Lửa',
}
const effectTierNames = ['Bụi Sao', 'Vệt Cầu Vồng', 'Đom Đóm', 'Bong Bóng', 'Tia Chớp Mềm', 'Lá Bay', 'Sóng Ánh Sáng', 'Quỹ Đạo', 'Pháo Hoa Dịu']
const titleTierNames = ['Người Đặt Câu Hỏi', 'Bạn Học Bền Bỉ', 'Thợ Săn Ngôi Sao', 'Nhà Kể Chuyện Nhí', 'Họa Sĩ Ý Tưởng', 'Người Bạn Tử Tế', 'Nhà Phát Minh', 'Người Dẫn Đường', 'Huyền Thoại Sáng Tạo']

function levelRewardTier(level: number): number {
  return Math.min(8, Math.max(0, Math.floor((level - 11) / 10)))
}

export function EquippedProfile({
  user,
  xp,
  level: backendLevel,
  compact = false,
  simple = false,
  equipment: controlledEquipment,
  onAvatarClick,
  tone = 'light',
  layoutOverride,
  editorSelectedSlot,
}: {
  user: User
  xp: number
  level: number
  compact?: boolean
  simple?: boolean
  equipment?: RewardEquipment
  onAvatarClick?: () => void
  tone?: 'light' | 'dark'
  layoutOverride?: ProfileCardLayout
  editorSelectedSlot?: keyof ProfileCardLayout['slots']
}) {
  const [cachedEquipment, setCachedEquipment] = useState(() => readRewardEquipment(user.id))
  const equipment = controlledEquipment ?? cachedEquipment
  const [profileAvatar, setProfileAvatar] = useState(() => readProfileAvatar(user.id))
  const [profileCardLayout, setProfileCardLayout] = useState<ProfileCardLayout>(DEFAULT_PROFILE_CARD_LAYOUT)
  const [catalogAssetUrls, setCatalogAssetUrls] = useState<Record<string, string>>({})
  const activeLayout = layoutOverride ?? profileCardLayout
  const editorOutline = (slot: keyof ProfileCardLayout['slots']) => editorSelectedSlot === slot ? ' outline outline-4 outline-sky-400 outline-offset-2' : ''
  useEffect(() => {
    const sync = () => setCachedEquipment(readRewardEquipment(user.id))
    const syncAvatar = () => setProfileAvatar(readProfileAvatar(user.id))
    const syncStorage = (event: StorageEvent) => {
      if (event.key === `aikids.reward-equipment.${user.id}`) sync()
      if (event.key === `aikids.profile-avatar.${user.id}`) syncAvatar()
    }
    window.addEventListener('aikids:reward-equipped', sync)
    window.addEventListener('aikids:profile-avatar', syncAvatar)
    window.addEventListener('storage', syncStorage)
    return () => {
      window.removeEventListener('aikids:reward-equipped', sync)
      window.removeEventListener('aikids:profile-avatar', syncAvatar)
      window.removeEventListener('storage', syncStorage)
    }
  }, [user.id])
  useEffect(() => {
    void api<{ items: Array<{ code: string; assets?: RewardCatalogAssets; displayConfig?: Record<string, unknown> }> }>('/api/gamification/catalog?type=reward&v=2026.08.01.6')
      .then(({ items }) => {
        const config = items.find((item) => item.code === PROFILE_CARD_LAYOUT_CODE)?.displayConfig?.profileCardLayout as ProfileCardLayout | undefined
        if (config) setProfileCardLayout(normalizeProfileCardLayout(config))
        setCatalogAssetUrls(Object.fromEntries(items.flatMap((item) => {
          const url = resolveCatalogRewardAsset({ id: item.code, assets: item.assets })
          return url ? [[item.code, url]] : []
        })))
      })
      .catch(() => undefined)
  }, [])


  const avatarReward = REWARD_CATALOG.find((item) => item.id === equipment.avatar)
  const avatarId = avatarReward?.equipValue ?? user.avatarId
  const frameReward = equipment.frame
  const frame = REWARD_CATALOG.find((item) => item.id === frameReward)
  const generatedLevelFrame = frameReward?.match(/^frame-level-(\d+)$/)
  const frameAsset = frameReward && catalogAssetUrls[frameReward]
    ? catalogAssetUrls[frameReward]
    : generatedLevelFrame
    ? getGeneratedRewardAssetUrl(frameReward, 'primary', { release: '2026.08.01.5', format: 'png' })
    : frameReward ? getRewardAssetUrl(frameReward) : undefined
  const usesArtworkFrame = Boolean(frameAsset)
  const titleReward = REWARD_CATALOG.find((item) => item.id === equipment.title)
  const titleLevel = getLevelRewardNumber(equipment.title, 'title')
  const title = titleReward?.equipValue ?? (titleLevel
    ? `${titleTierNames[levelRewardTier(titleLevel)]} · Mốc ${titleLevel}`
    : undefined)
  const titleCrestAsset = titleLevel
    ? getResolvedRewardAssetUrl(equipment.title)
    : titleReward
      ? getGeneratedRewardAssetUrl('title-epic', 'primary', { release: '2026.08.01.6', format: 'webp' })
      : undefined
  const titlePlaqueAsset = (equipment.title && catalogAssetUrls[equipment.title]) || rewardTitleAsset(equipment.title)
  const img = profileAvatar?.url ?? avatarImage(avatarId)
  const companionReward = REWARD_CATALOG.find((item) => item.id === equipment.companion)
  const companionLevel = getLevelRewardNumber(equipment.companion, 'companion')
  const companionSharedAsset = getSharedLevelRewardAssetId(equipment.companion)
  const companion = companionReward ?? (companionLevel
    ? { id: equipment.companion!, icon: '🤖', name: companionAssetNames[companionSharedAsset ?? ''] ?? 'Paco đồng hành' }
    : undefined)
  const companionAsset = companion ? getResolvedRewardAssetUrl(companion.id) : undefined
  const effectReward = REWARD_CATALOG.find((item) => item.id === equipment.effect)
  const effectLevel = getLevelRewardNumber(equipment.effect, 'effect')
  const effect = effectReward ?? (effectLevel
    ? { id: equipment.effect!, icon: '✨', name: `${effectTierNames[levelRewardTier(effectLevel)]} · Mốc ${effectLevel}` }
    : undefined)
  const levelEffectStyle = effect ? effectAuraClassForReward(effect.id) : undefined
  const level = useMemo(
    () => explorerLevelForXp(xp, backendLevel),
    [xp, backendLevel],
  )

  return (
    <div style={!compact ? { maxWidth: activeLayout.canvasWidth } : undefined} className={compact
      ? 'grid w-full grid-cols-1 items-center gap-3 text-center sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-5 sm:text-left'
      : 'flex flex-col items-center gap-5 text-center'}
    >
      <div className={`relative mx-auto flex justify-center ${
        compact ? 'w-32 sm:mx-0' : ''
      }`}>
        <button
          type="button"
          onClick={onAvatarClick}
          disabled={!onAvatarClick && !layoutOverride}
          className="group relative z-10 flex flex-col items-center bg-transparent transition-transform enabled:hover:-translate-y-0.5 enabled:active:translate-y-0"
          aria-label={onAvatarClick
            ? `Đổi ảnh đại diện · ${frame?.name ?? 'Khung cơ bản'}`
            : frame
              ? `Đang dùng ${frame.name}`
              : 'Khung cơ bản'}
        >
          <div
            data-profile-slot="frame"
            className={generatedLevelFrame
              ? `relative ${compact ? 'h-28 w-28 sm:h-32 sm:w-32' : 'h-48 w-48'}${editorOutline('frame')}`
              : usesArtworkFrame
                ? `relative ${compact ? 'h-28 w-28 sm:h-32 sm:w-32' : 'h-48 w-48'}${editorOutline('frame')}`
              : `relative rounded-full bg-white p-2 shadow-clay${editorOutline('frame')}`}
            style={usesArtworkFrame ? undefined : rewardFrameStyle(frameReward)}
          >
            {!simple && levelEffectStyle && (
              <span
                data-profile-slot="effect"
                className={`pointer-events-none absolute inset-[12%] z-0 rounded-full ${levelEffectStyle}`}
                aria-hidden="true"
                style={profileCardSlotStyle(activeLayout.slots.effect)}
              />
            )}
            {!simple && effect && (
              <span
                data-profile-slot="effect"
                className={`pointer-events-none absolute -inset-[5%] z-30 flex items-center justify-center${editorOutline('effect')}`}
                data-profile-effect={effect.id}
                aria-hidden="true"
                style={profileCardSlotStyle(activeLayout.slots.effect)}
              >
                <ProfileRewardEffect rewardId={effect.id} className="h-full w-full" />
              </span>
            )}
            <div data-profile-slot="avatar" style={profileCardSlotStyle(activeLayout.slots.avatar)} className={`flex items-center justify-center overflow-hidden rounded-full bg-brand-100 shadow-inner${editorOutline('avatar')} ${
              generatedLevelFrame
                ? `absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 ${compact ? 'h-[4.75rem] w-[4.75rem] text-4xl sm:h-[5.25rem] sm:w-[5.25rem]' : 'h-32 w-32 text-6xl'}`
                : usesArtworkFrame
                  ? `absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 ${compact ? 'h-[4.75rem] w-[4.75rem] text-4xl sm:h-[5.25rem] sm:w-[5.25rem]' : 'h-32 w-32 text-6xl'}`
                : compact ? 'relative z-10 h-20 w-20 border-4 border-white text-4xl sm:h-24 sm:w-24' : 'relative z-10 h-36 w-36 border-4 border-white text-7xl sm:h-44 sm:w-44'
            }`}>
              {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : avatarEmoji(avatarId)}
            </div>
            {frameAsset && (
              <img
                src={frameAsset}
                alt=""
                onError={(event) => { event.currentTarget.hidden = true }}
                style={profileCardSlotStyle(activeLayout.slots.frame)}
                className={`pointer-events-none absolute z-20 object-contain ${
                generatedLevelFrame ? 'inset-0 h-full w-full max-w-none' : 'inset-0 h-full w-full'
              }`}
              />
            )}
          </div>
        </button>
        {!simple && companion && (
          <div data-profile-slot="companion" style={profileCardSlotStyle(activeLayout.slots.companion)} className={`pointer-events-none absolute z-30 items-center justify-center${editorOutline('companion')} ${
            compact ? '-right-2 top-1 flex h-12 w-12' : '-right-3 top-3 flex h-16 w-16'
          }`}>
            <img
              src={companionAsset ?? designerAssets.brand.mascot}
              alt={companion.name}
              onError={(event) => {
                if (event.currentTarget.src.endsWith(designerAssets.brand.mascot)) {
                  event.currentTarget.hidden = true
                  return
                }
                event.currentTarget.src = designerAssets.brand.mascot
              }}
              className={`${compact ? 'h-12 w-12' : 'h-16 w-16'} object-contain drop-shadow-[0_3px_4px_rgba(30,39,64,.28)]`}
            />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-black uppercase tracking-[.2em] ${
          tone === 'dark' ? 'text-white/70' : 'text-brand-500'
        }`}>
          Hồ sơ nhà khám phá
        </p>
        <div className={`mt-1 flex min-w-0 flex-wrap items-center justify-center gap-2 ${compact ? 'sm:justify-start' : ''}`}>
          <h1 data-profile-slot="name" style={profileCardSlotStyle(activeLayout.slots.name)} className={`relative min-w-0 truncate font-display${editorOutline('name')} ${
            tone === 'dark' ? 'text-white' : 'text-text'
          } ${compact ? 'text-3xl' : 'text-4xl'}`}>{user.nickname}</h1>
          <span data-profile-slot="level" style={profileCardSlotStyle(activeLayout.slots.level)} className={`relative inline-flex min-h-8 shrink-0 items-center rounded-full border px-3 py-1 text-xs font-black shadow-soft${editorOutline('level')} ${
            tone === 'dark'
              ? 'border-white/30 bg-white/90 text-brand-800'
              : 'border-brand-200 bg-brand-50 text-brand-700'
          }`} aria-label={`Cấp độ ${level.level}`}>
            Cấp {level.level}
          </span>
        </div>
        <div className="mt-2">
          {titlePlaqueAsset ? (
            <span
              data-profile-slot="title"
              className={`profile-title-plaque ${compact ? 'profile-title-plaque--compact' : ''}`}
              aria-label={`Danh hiệu ${title}`}
              style={profileCardSlotStyle(activeLayout.slots.title)}
            >
              <img
                src={titlePlaqueAsset}
                alt=""
                className="block h-full w-full object-contain"
              />
            </span>
          ) : <span data-profile-slot="title" style={profileCardSlotStyle(activeLayout.slots.title)} className={simple
            ? 'inline-flex min-h-9 max-w-full items-center gap-2 rounded-xl bg-sun-50 px-3 py-1.5 text-sm font-extrabold text-sun-700'
            : 'relative inline-flex min-h-9 max-w-full items-center gap-2 overflow-hidden rounded-full border-2 border-amber-300/90 bg-gradient-to-r from-amber-50 via-yellow-100 to-orange-100 px-3.5 py-1.5 text-sm font-black text-amber-900 shadow-[0_5px_14px_rgba(245,158,11,.28)] sm:px-4'}>
            {!simple && (
            <span
              className="absolute inset-0 opacity-60"
              aria-hidden="true"
              style={{
                backgroundImage: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,.85) 42%, transparent 62%)',
              }}
            />
            )}
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-gradient-to-br from-yellow-300 to-amber-500 text-sm shadow-inner" aria-hidden="true">
              {titleCrestAsset
                ? <img
                    src={titleCrestAsset}
                    alt=""
                    className="h-full w-full object-contain"
                    onError={(event) => { event.currentTarget.hidden = true }}
                  />
                : titleReward?.icon ?? '✦'}
            </span>
            <span className="relative truncate">{title ?? level.title}</span>
            {!simple && <span className="relative text-amber-500" aria-hidden="true">✦</span>}
          </span>}
        </div>
      </div>
      {!compact && <div className="flex flex-wrap justify-center gap-2 text-xs font-bold">
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-brand-700 shadow-soft">
          {frame?.icon ?? '⭕'} {frame?.name ?? 'Khung cơ bản'}
        </span>
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-brand-700 shadow-soft">
          📷 {profileAvatar?.label ?? avatarReward?.name ?? 'Avatar của con'}
        </span>
        {companion && (
          <span className="rounded-full bg-white/80 px-3 py-1.5 text-brand-700 shadow-soft">
            {companion.icon} {companion.name}
          </span>
        )}
        {effect && (
          <span className="rounded-full bg-white/80 px-3 py-1.5 text-brand-700 shadow-soft">
            {effect.icon} {effect.name}
          </span>
        )}
      </div>}
    </div>
  )
}
