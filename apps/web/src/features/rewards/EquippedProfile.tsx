import { REWARD_CATALOG, explorerLevelForXp } from '@aikids/domain'
import { useEffect, useMemo, useState } from 'react'
import { avatarEmoji, avatarImage } from '@/shared/config/avatars'
import { designerAssets } from '@/shared/config/assets'
import type { User } from '@/shared/lib/api'
import { readProfileAvatar } from '@/features/profile/profile-showcase'
import { readRewardEquipment, rewardFrameStyle } from './reward-equipment'

export function EquippedProfile({
  user,
  xp,
  compact = false,
}: {
  user: User
  xp: number
  compact?: boolean
}) {
  const [equipment, setEquipment] = useState(() => readRewardEquipment(user.id))
  const [profileAvatar, setProfileAvatar] = useState(() => readProfileAvatar(user.id))
  useEffect(() => {
    const sync = () => setEquipment(readRewardEquipment(user.id))
    const syncAvatar = () => setProfileAvatar(readProfileAvatar(user.id))
    window.addEventListener('aikids:reward-equipped', sync)
    window.addEventListener('aikids:profile-avatar', syncAvatar)
    return () => {
      window.removeEventListener('aikids:reward-equipped', sync)
      window.removeEventListener('aikids:profile-avatar', syncAvatar)
    }
  }, [user.id])

  const avatarReward = REWARD_CATALOG.find((item) => item.id === equipment.avatar)
  const avatarId = avatarReward?.equipValue ?? user.avatarId
  const frameReward = equipment.frame
  const frame = REWARD_CATALOG.find((item) => item.id === frameReward)
  const titleReward = REWARD_CATALOG.find((item) => item.id === equipment.title)
  const title = titleReward?.equipValue
  const img = profileAvatar?.url ?? avatarImage(avatarId)
  const companion = REWARD_CATALOG.find((item) => item.id === equipment.companion)
  const effect = REWARD_CATALOG.find((item) => item.id === equipment.effect)
  const level = useMemo(() => explorerLevelForXp(xp), [xp])

  return (
    <div className={`flex items-center gap-5 ${compact ? 'flex-row text-left' : 'flex-col text-center'}`}>
      <div className={`relative ${effect ? 'drop-shadow-[0_0_18px_rgba(250,204,21,.8)]' : ''}`}>
        <div
          className="rounded-full bg-white p-2 shadow-[0_18px_50px_rgba(76,29,149,.2)]"
          style={rewardFrameStyle(frameReward)}
          aria-label={frame ? `Đang dùng ${frame.name}` : 'Khung cơ bản'}
        >
          <div className={`flex items-center justify-center overflow-hidden rounded-full border-4 border-white bg-brand-100 shadow-inner ${
            compact ? 'h-24 w-24 text-5xl sm:h-28 sm:w-28' : 'h-36 w-36 text-7xl sm:h-44 sm:w-44'
          }`}>
          {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : avatarEmoji(avatarId)}
          </div>
        </div>
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-white bg-brand-600 px-3 py-1 text-xs font-black text-white shadow-soft">
          CẤP {level.level}
        </span>
        {companion && (
          <div className={`absolute rotate-6 items-center justify-center rounded-full border-4 border-white bg-sky-100 shadow-clay ${
            compact ? '-right-5 bottom-0 flex h-12 w-12' : '-right-8 bottom-2 flex h-20 w-20'
          }`}>
            <img src={designerAssets.brand.mascot} alt={companion.name} className={compact ? 'h-10 w-10 object-contain' : 'h-16 w-16 object-contain'} />
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-[.2em] text-brand-500">
          Hồ sơ Nhà Khám Phá
        </p>
        <h1 className={`mt-1 font-display ${compact ? 'text-3xl' : 'text-4xl'}`}>{user.nickname}</h1>
        <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-sun-100 px-4 py-1.5 font-extrabold text-sun-700">
          {titleReward?.icon ?? '✨'} {title ?? level.title}
        </p>
        <p className="mt-2 text-sm font-bold text-muted">{xp} XP toàn hệ sinh thái</p>
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
