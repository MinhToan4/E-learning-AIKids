import {
  REWARD_CATALOG,
  isRewardUnlocked,
  type RewardDefinition,
  type RewardKind,
} from '@aikids/domain'
import { useEffect, useState } from 'react'
import {
  applyRewardEquipment,
  equipReward,
  readRewardEquipment,
} from './reward-equipment'

const kindLabels: Record<RewardKind, string> = {
  avatar: 'Avatar',
  frame: 'Khung',
  theme: 'Theme',
  event_ticket: 'Vé sự kiện',
  perk: 'Quyền đặc biệt',
  title: 'Danh hiệu',
}

function canEquip(reward: RewardDefinition) {
  return Boolean(reward.equipValue) &&
    reward.kind !== 'event_ticket' &&
    reward.kind !== 'perk'
}

export function RewardCollection({
  userId,
  xpLevel,
  compact = false,
}: {
  userId: string
  xpLevel: number
  compact?: boolean
}) {
  const [equipment, setEquipment] = useState(() => readRewardEquipment(userId))
  const [message, setMessage] = useState('')
  useEffect(() => {
    applyRewardEquipment(equipment)
  }, [equipment])

  const equip = (reward: RewardDefinition) => {
    setEquipment(equipReward(userId, reward.kind, reward.id))
    setMessage(`Đã trang bị ${reward.name}`)
  }

  return (
    <section aria-labelledby="reward-collection-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-brand-600">
            Kho phần thưởng
          </p>
          <h2 id="reward-collection-title" className="font-display text-2xl">
            Vật phẩm của con
          </h2>
        </div>
        <p className="text-xs font-bold text-muted" aria-live="polite">
          {message || `Mở theo Cấp độ khám phá · Cấp ${xpLevel}`}
        </p>
      </div>
      <div className={`mt-4 grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
        {REWARD_CATALOG.map((reward) => {
          const unlocked = isRewardUnlocked(reward, { xpLevel })
          const equipped = equipment[reward.kind] === reward.id
          return (
            <article
              key={reward.id}
              className={`relative overflow-hidden rounded-2xl border-2 p-3 ${
                unlocked ? 'border-amber-200 bg-white' : 'border-slate-200 bg-slate-50'
              }`}
            >
              {!unlocked && (
                <span className="absolute right-2 top-2 text-sm" aria-label="Chưa mở">🔒</span>
              )}
              <span className={`text-4xl ${unlocked ? '' : 'grayscale opacity-30'}`} aria-hidden>
                {reward.icon}
              </span>
              <p className="mt-2 text-[10px] font-black uppercase tracking-wide text-brand-600">
                {kindLabels[reward.kind]}
              </p>
              <h3 className="text-sm font-extrabold leading-tight">{reward.name}</h3>
              {!compact && <p className="mt-1 text-xs leading-snug text-muted">{reward.description}</p>}
              <p className="mt-2 text-[11px] font-bold text-muted">
                {unlocked
                  ? 'Đã sở hữu'
                  : reward.unlock.type === 'xp_level'
                    ? `Mở ở Cấp ${reward.unlock.value}`
                    : 'Phần thưởng sự kiện'}
              </p>
              {unlocked && canEquip(reward) && (
                <button
                  type="button"
                  disabled={equipped}
                  onClick={() => equip(reward)}
                  className="mt-2 w-full rounded-xl bg-brand-50 px-2 py-1.5 text-xs font-extrabold text-brand-700 disabled:bg-mint-100 disabled:text-success"
                >
                  {equipped ? 'Đang dùng ✓' : 'Trang bị'}
                </button>
              )}
              {unlocked && reward.kind === 'event_ticket' && (
                <p className="mt-2 rounded-lg bg-amber-100 px-2 py-1 text-center text-[11px] font-extrabold text-amber-900">
                  1 vé trong ví
                </p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
