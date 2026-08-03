import {
  REWARD_CATALOG,
  type RewardDefinition,
  type RewardKind,
} from '@/shared/lib/creation/rewards'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { avatarImage } from '@/shared/config/avatars'
import { api } from '@/shared/lib/api'
import {
  applyRewardEquipment,
  equipReward,
  readRewardEquipment,
  rewardFrameStyle,
  syncRewardEquipment,
  unequipReward,
} from './reward-equipment'
import { readProfileAvatar } from '@/features/profile/profile-showcase'
import {
  resolveCatalogRewardAsset,
  type RewardCatalogAssets,
} from './reward-catalog-assets'
import {
  getSharedLevelRewardAssetId,
  isLocalRewardAssetTestMode,
} from './reward-assets'
import { RewardEffectArtwork } from './RewardEffectArtwork'
import { profilePageThemeStyle } from './student-theme'
import { displayableWardrobeRewards } from './reward-inventory'

const kindLabels: Record<RewardKind, string> = {
  avatar: 'Avatar',
  frame: 'Khung cấp độ',
  theme: 'Theme trang',
  event_ticket: 'Vé sự kiện',
  perk: 'Quyền đặc biệt',
  title: 'Danh hiệu',
  companion: 'Bạn đồng hành',
  effect: 'Hiệu ứng',
  background: 'Nền profile',
}

const wardrobeKinds: RewardKind[] = ['avatar', 'frame', 'companion', 'title', 'background', 'theme', 'effect']
type CatalogReward = RewardDefinition & {
  assets?: RewardCatalogAssets
  displayConfig?: Record<string, unknown>
}

function RewardAssetImage({
  src,
  className,
  fallback,
}: {
  src?: string
  className: string
  fallback: ReactNode
}) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <>{fallback}</>
  return <img src={src} alt="" className={className} onError={() => setFailed(true)} />
}

function catalogAssetsFor(item: { code: string; assets?: RewardCatalogAssets }) {
  if (/^frame-level-(?:15|25|35|45|55|65|75|85|95)$/.test(item.code)) {
    return {
      assetId: item.code,
      primary: { assetId: item.code, variant: 'primary' as const, release: '2026.08.01.5', format: 'png' as const },
      preview: { assetId: item.code, variant: 'primary' as const, release: '2026.08.01.5', format: 'png' as const },
      thumbnail: {
        assetId: item.code,
        variant: 'primary' as const,
        release: '2026.08.01.5',
        format: 'png' as const,
      },
    }
  }
  return item.assets && Object.keys(item.assets).length > 0 ? item.assets : undefined
}

function unlockLabel(reward: RewardDefinition) {
  return reward.unlock.type === 'xp_level'
    ? `Mở ở Cấp ${reward.unlock.value}`
    : 'Nhận từ hành trình hoặc sự kiện'
}

function RewardArtwork({
  reward,
  assetUrl,
  large = false,
}: {
  reward: CatalogReward
  assetUrl?: string
  large?: boolean
}) {
  const size = large ? 'h-36 w-36' : 'h-16 w-16'
  const rewardAvatar = reward.kind === 'avatar' ? avatarImage(reward.equipValue) : undefined

  if (reward.kind === 'effect') {
    return <RewardEffectArtwork rewardId={reward.id} large={large} />
  }

  if (reward.kind === 'background') {
    return (
      <span
        className={`inline-flex aspect-[3/1] overflow-hidden rounded-2xl border-2 border-white shadow-soft ${large ? 'w-40' : 'w-24'}`}
        data-profile-composition="v1"
      >
        <RewardAssetImage
          src={assetUrl}
          className="h-full w-full object-cover"
          fallback={<span className="flex h-full w-full items-center justify-center bg-brand-50 text-3xl" aria-hidden>{reward.icon}</span>}
        />
      </span>
    )
  }

  if (reward.kind === 'theme') {
    return (
      <span
        className={`inline-flex overflow-hidden rounded-2xl border-2 border-white shadow-soft ${large ? 'h-36 w-24' : 'h-20 w-14'}`}
        style={{ ...profilePageThemeStyle(reward.id), backgroundSize: 'auto 100%' }}
        aria-hidden="true"
      />
    )
  }

  if (reward.kind === 'title') {
    return (
      <span className={`inline-flex max-w-full items-center rounded-full border-2 border-sun-300 bg-gradient-to-r from-sun-50 via-white to-brand-50 font-black text-sun-800 shadow-soft ${large ? 'gap-3 px-5 py-3 text-base' : 'gap-2 px-3 py-2 text-[11px]'}`}>
        <RewardAssetImage
          src={assetUrl}
          className={large ? 'h-10 w-10 rounded-full object-contain' : 'h-7 w-7 rounded-full object-contain'}
          fallback={<span aria-hidden>{reward.icon}</span>}
        />
        <span className="line-clamp-2">{reward.equipValue ?? reward.name}</span>
      </span>
    )
  }

  if (assetUrl) {
    return <span className={`relative inline-flex ${size}`}>
      <RewardAssetImage
        src={assetUrl}
        className="h-full w-full object-contain"
        fallback={<span className={large ? 'text-7xl' : 'text-5xl'} aria-hidden>{reward.icon}</span>}
      />
    </span>
  }
  if (rewardAvatar) {
    return <img src={rewardAvatar} alt="" className={`${size} rounded-full object-cover shadow-soft`} />
  }
  if (reward.kind === 'frame') {
    return (
      <div className="flex flex-col items-center">
        <div
          className={`flex ${size} items-center justify-center rounded-full bg-white text-3xl shadow-soft`}
          style={rewardFrameStyle(reward.id)}
        >
          <span className="flex h-full w-full items-center justify-center rounded-full bg-white">
            {reward.icon}
          </span>
        </div>
      </div>
    )
  }
  return <span className={large ? 'text-7xl' : 'text-5xl'} aria-hidden>{reward.icon}</span>
}

function canEquip(reward: RewardDefinition) {
  return Boolean(reward.equipValue) &&
    reward.kind !== 'event_ticket' &&
    reward.kind !== 'perk'
}

function companionAssetKey(rewardId?: string): string | undefined {
  if (rewardId === 'avatar-paco-blue') return 'companion-paco-cloud'
  return getSharedLevelRewardAssetId(rewardId)
}

function effectAssetKey(rewardId?: string): string | undefined {
  if (rewardId === 'perk-sticker-sparkle') return 'effect-sunrise'
  return getSharedLevelRewardAssetId(rewardId)
}

function isEquippedReward(
  reward: RewardDefinition,
  equipment: Partial<Record<RewardKind, string>>,
): boolean {
  const equippedId = equipment[reward.kind]
  if (equippedId === reward.id) return true
  if (reward.kind === 'companion') {
    return companionAssetKey(equippedId) === companionAssetKey(reward.id)
  }
  return reward.kind === 'effect'
    && effectAssetKey(equippedId) === effectAssetKey(reward.id)
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
  const [owned, setOwned] = useState<Set<string>>(new Set())
  const [catalog, setCatalog] = useState<CatalogReward[]>([...REWARD_CATALOG])
  const [message, setMessage] = useState('')
  const [activeKind, setActiveKind] = useState<RewardKind>('frame')
  const [previewReward, setPreviewReward] = useState<CatalogReward | null>(null)
  const currentProfileAvatar = readProfileAvatar(userId)
  const bundles = useMemo(() => {
    const grouped = new Map<string, { name: string; rewards: CatalogReward[] }>()
    for (const reward of catalog) {
      const bundleKey = typeof reward.displayConfig?.bundleKey === 'string'
        ? reward.displayConfig.bundleKey
        : ''
      if (!bundleKey) continue
      const bundleName = typeof reward.displayConfig?.bundleName === 'string'
        ? reward.displayConfig.bundleName
        : 'Bộ phong cách'
      const current = grouped.get(bundleKey) ?? { name: bundleName, rewards: [] }
      current.rewards.push(reward)
      grouped.set(bundleKey, current)
    }
    return [...grouped.entries()]
      .filter(([, bundle]) => bundle.rewards.length > 1)
      .map(([id, bundle]) => ({ id, ...bundle }))
  }, [catalog])
  const visibleRewards = useMemo(
    () => displayableWardrobeRewards(catalog, activeKind),
    [activeKind, catalog],
  )
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
      }> }>('/api/gamification/catalog?type=reward&v=2026.08.01.6'),
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
              name: item.code === 'avatar-paco-blue' ? 'Paco Mây' : item.name,
              description: item.description,
              icon: String(item.displayConfig?.icon ?? '✨'),
              unlock: {
                type: item.unlockRule?.type === 'xp_level'
                  ? 'xp_level'
                  : item.unlockRule?.type === 'event'
                    ? 'event'
                    : 'storybook_sticker',
                value: item.unlockRule?.value ?? '',
              },
              equipValue: String(item.displayConfig?.equipValue ?? item.code),
              assets: catalogAssetsFor(item),
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
      if (isLocalRewardAssetTestMode()) {
        setEquipment(equipReward(userId, reward.kind, reward.id))
        setMessage(`Đang test local: ${reward.name}`)
        return
      }
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

  const unequip = async (kind: RewardKind) => {
    try {
      if (!isLocalRewardAssetTestMode()) {
        await api(`/api/gamification/rewards/equipment/${kind}`, {
          method: 'PUT',
          body: JSON.stringify({ rewardId: null }),
        })
      }
      setEquipment(unequipReward(userId, kind))
      setPreviewReward(null)
      setMessage(`Đã bỏ ${kindLabels[kind].toLowerCase()}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Chưa bỏ được vật phẩm.')
    }
  }

  const equipBundle = async (rewards: CatalogReward[]) => {
    const equipable = rewards.filter((reward) => owned.has(reward.id) && canEquip(reward))
    if (equipable.length !== rewards.length) {
      setMessage('Con cần nhận đủ vật phẩm trước khi dùng cả bộ.')
      return
    }
    const previous = { ...equipment }
    const changedKinds: RewardKind[] = []
    try {
      if (isLocalRewardAssetTestMode()) {
        for (const reward of equipable) equipReward(userId, reward.kind, reward.id)
        setEquipment(readRewardEquipment(userId))
        setMessage('Đang test local trọn bộ phong cách.')
        return
      }
      for (const reward of equipable) {
        await api(`/api/gamification/rewards/equipment/${reward.kind}`, {
          method: 'PUT',
          body: JSON.stringify({ rewardId: reward.id }),
        })
        equipReward(userId, reward.kind, reward.id)
        changedKinds.push(reward.kind)
      }
      setEquipment(readRewardEquipment(userId))
      setMessage('Đã dùng trọn bộ phong cách.')
    } catch (error) {
      for (const kind of changedKinds.reverse()) {
        const rewardId = previous[kind] ?? null
        try {
          await api(`/api/gamification/rewards/equipment/${kind}`, {
            method: 'PUT',
            body: JSON.stringify({ rewardId }),
          })
        } catch {
          // The next inventory refresh remains authoritative if compensation fails.
        }
      }
      setEquipment(syncRewardEquipment(userId, previous))
      setMessage(error instanceof Error ? error.message : 'Chưa dùng được bộ phong cách.')
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
      <div className="mt-5 rounded-3xl border border-brand-100 bg-white p-4 shadow-soft" aria-labelledby="currently-equipped-title">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-600">Hồ sơ hiện tại</p>
            <h3 id="currently-equipped-title" className="font-display text-xl">Đang trang bị</h3>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <p className="text-xs font-bold text-muted">Mỗi vật phẩm thuộc một slot độc lập</p>
            {equipment[activeKind] && activeKind !== 'avatar' && (
              <button
                type="button"
                onClick={() => void unequip(activeKind)}
                className="min-h-11 rounded-xl border border-brand-200 bg-white px-4 text-sm font-extrabold text-brand-700 transition hover:bg-brand-50"
              >
                Không dùng {kindLabels[activeKind].toLowerCase()}
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {wardrobeKinds.map((kind) => {
            const rewardId = equipment[kind]
            const reward = catalog.find((item) => item.id === rewardId)
            const assetUrl = kind === 'avatar' && currentProfileAvatar?.url
              ? currentProfileAvatar.url
              : reward
              ? resolveCatalogRewardAsset(reward, 'thumbnail')
              : undefined
            return (
              <button
                key={kind}
                type="button"
                onClick={() => {
                  setActiveKind(kind)
                  setPreviewReward(reward ?? null)
                }}
                className={`min-h-24 rounded-2xl border p-2 text-center transition ${
                  activeKind === kind
                    ? 'border-brand-300 bg-brand-50 shadow-press'
                    : 'border-border bg-white hover:bg-brand-50/60'
                }`}
              >
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-2xl" aria-hidden="true">
                  {kind === 'effect' && reward
                    ? <RewardEffectArtwork rewardId={reward.id} />
                    : <RewardAssetImage
                        src={assetUrl}
                        className="h-10 w-10 object-contain"
                        fallback={reward?.icon ?? '＋'}
                      />}
                </span>
                <span className="mt-1 block text-[10px] font-black uppercase tracking-wide text-brand-600">
                  {kindLabels[kind]}
                </span>
                <span className="block truncate text-xs font-extrabold text-text">
                  {kind === 'avatar' && currentProfileAvatar
                    ? currentProfileAvatar.label
                    : reward?.name ?? 'Chưa chọn'}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      {bundles.length > 0 && (
        <div className="mt-5" aria-labelledby="profile-bundles-title">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand-600">Bộ đồng bộ</p>
              <h3 id="profile-bundles-title" className="font-display text-xl">Dùng trọn một phong cách</h3>
            </div>
            <p className="text-xs font-bold text-muted">Mỗi vật phẩm vẫn thuộc một slot riêng</p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {bundles.map((bundle) => {
              const ownedCount = bundle.rewards.filter((reward) => owned.has(reward.id)).length
              const complete = ownedCount === bundle.rewards.length
              return (
                <article key={bundle.id} className="rounded-3xl border border-brand-100 bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-display text-lg">{bundle.name}</h4>
                      <p className="text-xs font-bold text-muted">{ownedCount}/{bundle.rewards.length} vật phẩm đã nhận</p>
                    </div>
                    <div className="flex -space-x-2" aria-hidden>
                      {bundle.rewards.slice(0, 4).map((reward) => {
                        const assetUrl = resolveCatalogRewardAsset(reward, 'thumbnail')
                        return (
                          <span key={reward.id} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-brand-50">
                            {reward.kind === 'effect'
                              ? <RewardEffectArtwork rewardId={reward.id} />
                              : <RewardAssetImage
                                  src={assetUrl}
                                  className="h-9 w-9 object-contain"
                                  fallback={<span>{reward.icon}</span>}
                                />}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!complete}
                    onClick={() => void equipBundle(bundle.rewards)}
                    className="mt-4 min-h-11 w-full rounded-xl bg-brand-600 px-4 text-sm font-extrabold text-white disabled:bg-slate-100 disabled:text-muted"
                  >
                    {complete ? 'Dùng cả bộ' : 'Nhận đủ để dùng cả bộ'}
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      )}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Loại vật phẩm">
        {wardrobeKinds.map((kind) => (
          <button
            key={kind}
            type="button"
            role="tab"
            aria-selected={activeKind === kind}
            onClick={() => setActiveKind(kind)}
            className={`min-h-11 whitespace-nowrap rounded-full px-4 text-sm font-extrabold transition ${
              activeKind === kind
                ? 'bg-brand-600 text-white shadow-press'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
            }`}
          >
            {kindLabels[kind]}
          </button>
        ))}
      </div>
      {previewReward && (() => {
        const unlocked = owned.has(previewReward.id)
        const equipped = isEquippedReward(previewReward, equipment)
        const assetUrl = resolveCatalogRewardAsset(previewReward, 'preview')
        return (
          <aside className="mt-4 grid gap-5 rounded-3xl border border-brand-100 bg-brand-50 p-5 sm:grid-cols-[10rem_1fr] sm:items-center" aria-label={`Xem trước ${previewReward.name}`}>
            <div className="flex min-h-40 items-center justify-center rounded-2xl bg-white shadow-soft">
              <RewardArtwork reward={previewReward} assetUrl={assetUrl} large />
            </div>
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-brand-600">
                    Xem trước · {kindLabels[previewReward.kind]}
                  </p>
                  <h3 className="font-display text-2xl">{previewReward.name}</h3>
                </div>
                <button type="button" onClick={() => setPreviewReward(null)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white font-black text-muted shadow-soft" aria-label="Đóng xem trước">×</button>
              </div>
              <p className="mt-2 text-sm text-muted">{previewReward.description}</p>
              <p className={`mt-3 text-sm font-extrabold ${unlocked ? 'text-success' : 'text-brand-700'}`}>
                {unlocked ? 'Đã có trong Bộ sưu tập' : unlockLabel(previewReward)}
              </p>
              {unlocked && canEquip(previewReward) && (
                <button
                  type="button"
                  onClick={() => void (equipped ? unequip(previewReward.kind) : equip(previewReward))}
                  className={`mt-4 min-h-11 rounded-xl px-5 text-sm font-extrabold ${
                    equipped
                      ? 'border border-brand-200 bg-white text-brand-700'
                      : 'bg-brand-600 text-white'
                  }`}
                >
                  {equipped ? 'Không dùng nữa' : 'Dùng vật phẩm này'}
                </button>
              )}
            </div>
          </aside>
        )
      })()}
      <div className={`mt-4 grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
        {visibleRewards.map((reward) => {
          const unlocked = owned.has(reward.id)
          const equipped = isEquippedReward(reward, equipment)
          const assetUrl = resolveCatalogRewardAsset(reward, 'thumbnail')
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
              <div className={`flex h-24 items-center justify-center ${unlocked ? '' : 'opacity-70'}`}>
                <RewardArtwork reward={reward} assetUrl={assetUrl} />
              </div>
              <p className="mt-2 text-xs font-black uppercase tracking-wide text-brand-600">
                {kindLabels[reward.kind]}
              </p>
              <h3 className="text-base font-extrabold leading-tight">{reward.name}</h3>
              {!compact && <p className="mt-1 text-xs leading-snug text-muted">{reward.description}</p>}
              <p className="mt-2 text-[11px] font-bold text-muted">
                {unlocked
                  ? 'Đã sở hữu'
                  : unlockLabel(reward)}
              </p>
              <button
                type="button"
                onClick={() => setPreviewReward(reward)}
                className="mt-2 min-h-11 w-full rounded-xl border border-brand-100 bg-white px-2 text-xs font-extrabold text-brand-700"
              >
                Xem trước
              </button>
              {unlocked && canEquip(reward) && (
                <button
                  type="button"
                  onClick={() => void (equipped ? unequip(reward.kind) : equip(reward))}
                  className={`mt-2 min-h-11 w-full rounded-xl px-2 py-1.5 text-xs font-extrabold ${
                    equipped
                      ? 'border border-brand-200 bg-white text-brand-700'
                      : 'bg-brand-50 text-brand-700'
                  }`}
                >
                  {equipped ? 'Không dùng nữa' : `Dùng ${kindLabels[reward.kind].toLowerCase()} này`}
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
      {visibleRewards.length === 0 && (
        <div className="mt-4 rounded-3xl border border-dashed border-brand-200 bg-brand-50 px-5 py-8 text-center">
          <p className="font-display text-lg text-brand-800">Chưa có vật phẩm phù hợp</p>
          <p className="mt-1 text-sm font-semibold text-muted">Phần thưởng mới sẽ xuất hiện khi hình ảnh đã sẵn sàng.</p>
        </div>
      )}
    </section>
  )
}
