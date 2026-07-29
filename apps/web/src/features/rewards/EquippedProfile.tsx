import { REWARD_CATALOG, explorerLevelForXp } from '@aikids/domain'
import { useEffect, useMemo, useState } from 'react'
import { avatarEmoji, avatarImage } from '@/shared/config/avatars'
import type { User } from '@/shared/lib/api'
import { readRewardEquipment, rewardFrameStyle } from './reward-equipment'

export function EquippedProfile({ user, xp }: { user: User; xp: number }) {
  const [equipment, setEquipment] = useState(() => readRewardEquipment(user.id))
  useEffect(() => {
    const sync = () => setEquipment(readRewardEquipment(user.id))
    window.addEventListener('aikids:reward-equipped', sync)
    return () => window.removeEventListener('aikids:reward-equipped', sync)
  }, [user.id])

  const avatarReward = REWARD_CATALOG.find((item) => item.id === equipment.avatar)
  const avatarId = avatarReward?.equipValue ?? user.avatarId
  const frameReward = equipment.frame
  const title = REWARD_CATALOG.find((item) => item.id === equipment.title)?.equipValue
  const img = avatarImage(avatarId)
  const level = useMemo(() => explorerLevelForXp(xp), [xp])

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="rounded-full" style={rewardFrameStyle(frameReward)}>
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-5xl shadow-clay">
          {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : avatarEmoji(avatarId)}
        </div>
      </div>
      <div>
        <h1 className="font-display text-3xl">{user.nickname}</h1>
        <p className="font-bold text-brand-600">{title ?? level.title}</p>
        <p className="text-sm text-muted">Cấp {level.level} · {xp} XP</p>
      </div>
    </div>
  )
}
