import {
  REWARD_CATALOG,
  type RewardDefinition,
  type RewardKind,
} from '@/shared/lib/creation/rewards'
import { useEffect, useState } from 'react'
import { avatarImage } from '@/shared/config/avatars'
import { api } from '@/shared/lib/api'
import {
  applyRewardEquipment,
  equipReward,
  getRewardAssetUrl,
  readRewardEquipment,
  rewardFrameStyle,
} from './reward-equipment'

const kindLabels: Record<RewardKind, string> = {
  avatar: 'Avatar',
  frame: 'Khung',
  theme: 'Theme',
  event_ticket: 'Vé sự kiện',
  perk: 'Quyền đặc biệt',
  title: 'Danh hiệu',
  companion: 'Bạn đồng hành',
  effect: 'Hiệu ứng',
  background: 'Background',
}

const wardrobeKinds: RewardKind[] = ['frame', 'background', 'companion', 'effect', 'title', 'theme']
type CatalogReward = RewardDefinition & {
  assets?: { thumbnailUrl?: string; imageUrl?: string }
  displayConfig?: Record<string, unknown>
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
  stickerIds = [],
}: {
  userId: string
  xpLevel: number
  compact?: boolean
  stickerIds?: string[]
}) {
  const [equipment, setEquipment] = useState(() => readRewardEquipment(userId))
  const [owned, setOwned] = useState<Set<string>>(new Set())
  const [catalog, setCatalog] = useState<CatalogReward[]>([...REWARD_CATALOG])
  const [message, setMessage] = useState('')
  const [activeKind, setActiveKind] = useState<RewardKind>('frame')
  useEffect(() => {
    applyRewardEquipment(equipment)
  }, [equipment])
  useEffect(() => {
    void Promise.all([
      api<{
        inventory: Array<{ rewardId: string }>
        equipment: Array<{ kind: RewardKind; rewardId: string }>
      }>('/api/gamification/storybook'),
      api<{ items: Array<{
        code: string
        name: string
        description: string
        kind: RewardKind
        assets?: CatalogReward['assets']
        displayConfig?: Record<string, unknown>
        unlockRule?: { type?: string; value?: string | number }
      }> }>('/api/gamification/catalog?type=reward'),
    ])
      .then(([result, studio]) => {
        setOwned(new Set(result.inventory.map((item) => item.rewardId)))
        const serverEquipment = Object.fromEntries(
          result.equipment.map((item) => [item.kind, item.rewardId]),
        )
        setEquipment(serverEquipment)
        applyRewardEquipment(serverEquipment)
        if (studio.items.length) {
          const dynamic = studio.items
            .filter((item) => wardrobeKinds.includes(item.kind))
            .map((item): CatalogReward => ({
              id: item.code,
              kind: item.kind,
              name: item.name,
              description: item.description,
              icon: String(item.displayConfig?.icon ?? '✨'),
              unlock: {
                type: item.unlockRule?.type === 'xp_level' ? 'xp_level' : 'storybook_sticker',
                value: item.unlockRule?.value ?? '',
              },
              equipValue: String(item.displayConfig?.equipValue ?? item.code),
              assets: item.assets,
              displayConfig: item.displayConfig,
            }))
          const dynamicIds = new Set(dynamic.map((item) => item.id))
          setCatalog([...REWARD_CATALOG.filter((item) => !dynamicIds.has(item.id)), ...dynamic])
        }
      })
      .catch(() => setMessage('Chưa đồng bộ được kho phần thưởng.'))
  }, [userId])

  const equip = async (reward: RewardDefinition) => {
    try {
      await api(`/api/gamification/rewards/equipment/${reward.kind}`, {
        method: 'PUT',
        body: JSON.stringify({ rewardId: reward.id }),
      })
      setEquipment(equipReward(userId, reward.kind, reward.id))
      setMessage(`Đã trang bị ${reward.name}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Chưa trang bị được phần thưởng.')
    }
  }

  return (
    <section aria-labelledby="reward-collection-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-brand-600">
            Phòng thay đồ
          </p>
          <h2 id="reward-collection-title" className="font-display text-2xl">
            Chọn phong cách của con
          </h2>
        </div>
        <p className="text-xs font-bold text-muted" aria-live="polite">
          {message || `Mở theo Cấp độ khám phá · Cấp ${xpLevel}`}
        </p>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Loại vật phẩm">
        {wardrobeKinds.map((kind) => (
          <button
            key={kind}
            type="button"
            role="tab"
            aria-selected={activeKind === kind}
            onClick={() => setActiveKind(kind)}
            className={`min-h-10 whitespace-nowrap rounded-full px-4 text-sm font-extrabold transition ${
              activeKind === kind
                ? 'bg-brand-600 text-white shadow-press'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
            }`}
          >
            {kindLabels[kind]}
          </button>
        ))}
      </div>
      <div className={`mt-4 grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
        {catalog.filter((reward) => reward.kind === activeKind).map((reward) => {
          const unlocked = owned.has(reward.id)
          const equipped = equipment[reward.kind] === reward.id
          const rewardAvatar = reward.kind === 'avatar' ? avatarImage(reward.equipValue) : undefined
          const assetUrl = reward.assets?.thumbnailUrl ?? reward.assets?.imageUrl ?? getRewardAssetUrl(reward.id)
          return (
            <article
              key={reward.id}
              className={`relative overflow-hidden rounded-3xl border-2 p-3 transition ${
                equipped
                  ? 'border-mint-400 bg-mint-50 ring-2 ring-mint-100'
                  : unlocked
                    ? 'border-amber-200 bg-white hover:-translate-y-0.5 hover:shadow-soft'
                    : 'border-slate-200 bg-slate-50'
              }`}
            >
              {!unlocked && (
                <span className="absolute right-2 top-2 text-sm" aria-label="Chưa mở">🔒</span>
              )}
              <div className={`flex h-20 items-center justify-center ${unlocked ? '' : 'grayscale opacity-30'}`}>
                {assetUrl ? (
                  <img src={assetUrl} alt="" className="h-16 w-16 object-contain" />
                ) : rewardAvatar ? (
                  <img src={rewardAvatar} alt="" className="h-16 w-16 rounded-full object-cover shadow-soft" />
                ) : reward.kind === 'frame' ? (
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
                    style={rewardFrameStyle(reward.id)}
                  >
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-white">
                      {reward.icon}
                    </span>
                  </div>
                ) : reward.kind === 'title' ? (
                  <span className="rounded-full bg-sun-100 px-3 py-2 text-center text-xs font-black text-sun-700">
                    {reward.icon} {reward.equipValue}
                  </span>
                ) : (
                  <span className="text-5xl" aria-hidden>{reward.icon}</span>
                )}
              </div>
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
                  onClick={() => void equip(reward)}
                  className="mt-2 w-full rounded-xl bg-brand-50 px-2 py-1.5 text-xs font-extrabold text-brand-700 disabled:bg-mint-100 disabled:text-success"
                >
                  {equipped ? 'Đang dùng ✓' : `Dùng ${kindLabels[reward.kind].toLowerCase()} này`}
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
