import {
  REWARD_CATALOG,
  type RewardDefinition,
  type RewardKind,
} from '@/shared/lib/creation/rewards'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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
import { PROFILE_CARD_LAYOUT_CODE } from '@/features/profile/profile-card-layout'
import {
  resolveCatalogRewardAsset,
  type RewardCatalogAssets,
} from './reward-catalog-assets'
import {
  getResolvedRewardAssetUrl,
  getSharedLevelRewardAssetId,
  isLocalRewardAssetTestMode,
} from './reward-assets'
import { RewardEffectArtwork } from './RewardEffectArtwork'
import { profilePageThemeStyle } from './student-theme'
import { profileCardEdgeBackgroundStyle } from './profile-backgrounds'
import { displayableWardrobeRewards } from './reward-inventory'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { isRewardUnlocked, rewardSource, rewardTitleAsset } from './title-assets'
import { normalizeRewardRequirement } from './reward-requirement'
import { Lock } from 'lucide-react'

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
  if (item.assets?.imageUrl || item.assets?.thumbnailUrl || item.assets?.previewUrl) {
    return item.assets
  }
  if (/^frame-level-(?:15|25|35|45|55|65|75|85|95|100)$/.test(item.code)) {
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
  if (reward.unlock.type === 'xp_level') return `Mở ở Cấp ${reward.unlock.value}`
  if (reward.unlock.type === 'storybook_sticker') {
    const chapter = String(reward.unlock.value).match(/^P0?(\d+)-S9$/)?.[1]
    return chapter ? `Mở khi hoàn thành Sticker Book Chương ${chapter}` : 'Mở từ Sticker Book'
  }
  if (reward.unlock.type === 'event') return 'Nhận từ sự kiện'
  return 'Mở từ thành tích cá nhân'
}

const rewardSourceLabels = {
  level: 'Theo cấp',
  storybook: 'Sticker Book',
  achievement: 'Thành tích',
  event: 'Sự kiện',
} as const

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
    if (assetUrl) return <RewardAssetImage src={assetUrl} className={`${size} object-contain`} fallback={<RewardEffectArtwork rewardId={reward.id} large={large} />} />
    return <RewardEffectArtwork rewardId={reward.id} large={large} />
  }

  if (reward.kind === 'background' || reward.kind === 'theme') {
    const backgroundStyle = reward.kind === 'background'
      ? profileCardEdgeBackgroundStyle(reward.id)
      : profilePageThemeStyle(reward.id)
    return (
      <span
        className={`inline-flex aspect-[3/1] overflow-hidden rounded-xl border-2 border-white shadow-soft ${large ? 'w-full max-w-72' : 'w-full max-w-40'}`}
        data-profile-composition="v1"
        style={{ ...backgroundStyle, backgroundSize: 'cover', backgroundPosition: 'center' }}
        aria-hidden="true"
      />
    )
  }

  if (reward.kind === 'title') {
    const titleAsset = assetUrl ?? rewardTitleAsset(reward.id)
    if (titleAsset) return (
      <span className={`inline-flex w-full max-w-full items-center justify-center ${large ? 'max-w-[30rem]' : 'max-w-[18rem]'}`}>
        <span className="reward-title-artwork">
          <RewardAssetImage
            src={titleAsset}
            className="reward-title-artwork-image"
            fallback={<span className="rounded-full border-2 border-sun-300 bg-sun-50 px-4 py-2 font-black text-sun-800">{reward.equipValue ?? reward.name}</span>}
          />
        </span>
      </span>
    )
    return (
      <span className={`inline-flex max-w-full items-center justify-center rounded-full border-2 border-sun-300 bg-sun-50 text-center font-black leading-tight text-sun-800 ${
        large ? 'min-h-14 px-5 py-2 text-lg' : 'min-h-9 px-3 py-1 text-xs'
      }`}>
        {reward.equipValue ?? reward.name}
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
  const [pendingRewardId, setPendingRewardId] = useState<string | null>(null)
  const equipmentMutationVersion = useRef(0)
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
    const loadVersion = equipmentMutationVersion.current
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
        if (equipmentMutationVersion.current === loadVersion) {
          const serverEquipment = Object.fromEntries(
            result.equipment.map((item) => [item.kind, item.rewardId]),
          )
          setEquipment(syncRewardEquipment(userId, serverEquipment))
        }
        if (studio.items.length) {
          const dynamic = studio.items
            .filter((item) => item.code !== PROFILE_CARD_LAYOUT_CODE && wardrobeKinds.includes(item.kind))
            .map((item): CatalogReward => ({
              id: item.code,
              kind: item.kind,
              name: item.code === 'avatar-paco-blue' ? 'Paco Mây' : item.name,
              description: item.description,
              icon: String(item.displayConfig?.icon ?? '✨'),
              unlock: normalizeRewardRequirement(item.unlockRule),
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
    if (pendingRewardId) return
    equipmentMutationVersion.current += 1
    setPendingRewardId(reward.id)
    setEquipment(equipReward(userId, reward.kind, reward.id))
    setMessage(`Đang dùng ${reward.name}…`)
    try {
      const isStorybookTitleTest = reward.id === 'storybook-title-p01' &&
        typeof window !== 'undefined' &&
        ['127.0.0.1', 'localhost'].includes(window.location.hostname) &&
        new URLSearchParams(window.location.search).get('reward-test') === 'storybook-p01'
      if (isLocalRewardAssetTestMode() || isStorybookTitleTest) {
        setMessage(`Đang thử cục bộ: ${reward.name}`)
        return
      }
      await api(`/api/gamification/rewards/equipment/${reward.kind}`, {
        method: 'PUT',
        body: JSON.stringify({ rewardId: reward.id }),
      })
      // Re-commit after the authoritative response. A profile/catalog refresh
      // may finish while the mutation is in flight and write an older snapshot.
      setEquipment(equipReward(userId, reward.kind, reward.id))
      setMessage(`Đã trang bị ${reward.name}`)
    } catch (error) {
      // Keep the explicit local selection usable when the legacy equipment
      // endpoint does not yet know a newly published reward ID.
      setEquipment(equipReward(userId, reward.kind, reward.id))
      const reason = error instanceof Error && error.message !== 'Error'
        ? ` (${error.message})`
        : ''
      setMessage(`Đã áp dụng trên thiết bị, chưa đồng bộ máy chủ${reason}.`)
    } finally {
      setPendingRewardId(null)
    }
  }

  const unequip = async (kind: RewardKind) => {
    if (pendingRewardId) return
    equipmentMutationVersion.current += 1
    const rewardId = equipment[kind]
    setPendingRewardId(rewardId ?? kind)
    setEquipment(unequipReward(userId, kind))
    setMessage(`Đang bỏ ${kindLabels[kind].toLowerCase()}…`)
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
      setEquipment(unequipReward(userId, kind))
      const reason = error instanceof Error && error.message !== 'Error'
        ? ` (${error.message})`
        : ''
      setMessage(`Đã bỏ trên thiết bị, chưa đồng bộ máy chủ${reason}.`)
    } finally {
      setPendingRewardId(null)
    }
  }

  const equipBundle = async (rewards: CatalogReward[]) => {
    const equipable = rewards.filter((reward) => isRewardUnlocked(reward, owned, xpLevel) && canEquip(reward))
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
          <p className="text-sm font-extrabold text-brand-600">
            Phòng thay đồ
          </p>
          <h2 id="reward-collection-title" className="font-display text-2xl">
            Chọn phong cách của con
          </h2>
        </div>
        <p className="text-sm font-bold text-muted" aria-live="polite">
          {message || `Mở theo Cấp độ khám phá · Cấp ${xpLevel}`}
        </p>
      </div>
      <div className="mt-5 rounded-3xl border border-brand-100 bg-white p-4 shadow-soft" aria-labelledby="currently-equipped-title">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-extrabold text-brand-600">Hồ sơ hiện tại</p>
            <h3 id="currently-equipped-title" className="font-display text-xl">Đang trang bị</h3>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <p className="text-sm font-bold text-muted">Mỗi vật phẩm thuộc một slot độc lập</p>
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
              : kind === 'title' && reward
              ? resolveCatalogRewardAsset(reward, 'thumbnail') ?? rewardTitleAsset(reward.id)
              : kind === 'frame' && reward
              ? resolveCatalogRewardAsset(reward, 'thumbnail') ?? getResolvedRewardAssetUrl(reward.id)
              : reward
              ? resolveCatalogRewardAsset(reward, 'thumbnail')
              : undefined
            return (
              <button
                key={kind}
                type="button"
                onClick={() => setActiveKind(kind)}
                className={`min-h-24 rounded-2xl border p-2 text-center transition ${
                  activeKind === kind
                    ? 'border-brand-300 bg-brand-50 shadow-press'
                    : 'border-border bg-white hover:bg-brand-50/60'
                }`}
              >
                <span className={`mx-auto flex h-11 items-center justify-center rounded-xl bg-brand-50 text-2xl ${
                  kind === 'background' || kind === 'theme' || kind === 'title' ? 'w-full px-1' : 'w-11'
                }`} aria-hidden="true">
                  {(kind === 'background' || kind === 'theme' || kind === 'title') && reward
                    ? <RewardArtwork reward={reward} />
                    : kind === 'effect' && reward
                    ? <RewardEffectArtwork rewardId={reward.id} />
                    : <RewardAssetImage
                        src={assetUrl}
                        className="h-10 w-10 object-contain"
                        fallback={reward?.icon ?? '＋'}
                      />}
                </span>
                <span className="mt-1 block text-xs font-extrabold text-brand-600">
                  {kindLabels[kind]}
                </span>
                <span className="block truncate text-sm font-extrabold text-text">
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
              const ownedCount = bundle.rewards.filter((reward) => isRewardUnlocked(reward, owned, xpLevel)).length
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
      {message && (
        <p
          className={`mt-3 rounded-xl border px-3 py-2 text-sm font-extrabold ${
            message.startsWith('Đã ') || message.startsWith('Đang ')
              ? 'border-mint-200 bg-mint-50 text-mint-800'
              : 'border-coral-200 bg-coral-50 text-coral-700'
          }`}
          role="status"
        >
          {message}
        </p>
      )}
      {previewReward && (() => {
        const unlocked = isRewardUnlocked(previewReward, owned, xpLevel)
        const equipped = isEquippedReward(previewReward, equipment)
        const assetUrl = resolveCatalogRewardAsset(previewReward, 'preview')
        return (
          <AdventureModal
            open
            tone={unlocked ? 'reward' : 'discovery'}
            eyebrow={`Xem trước · ${kindLabels[previewReward.kind]}`}
            title={previewReward.name}
            description={previewReward.description}
            onClose={() => setPreviewReward(null)}
            artwork={
              <div className="flex min-h-48 items-center justify-center">
              <RewardArtwork reward={previewReward} assetUrl={assetUrl} large />
              </div>
            }
            actions={unlocked && canEquip(previewReward) ? (
              <button
                type="button"
                disabled={pendingRewardId !== null}
                onClick={() => void (equipped ? unequip(previewReward.kind) : equip(previewReward))}
                className={equipped ? 'ui-btn ui-btn-secondary' : 'ui-btn ui-btn-primary'}
              >
                {pendingRewardId === previewReward.id
                  ? 'Đang áp dụng…'
                  : equipped ? 'Không dùng nữa' : 'Dùng vật phẩm này'}
              </button>
            ) : undefined}
          >
              <p className={`text-center text-sm font-extrabold ${unlocked ? 'text-success' : 'text-brand-700'}`}>
                {unlocked ? 'Đã có trong Bộ sưu tập' : unlockLabel(previewReward)}
              </p>
          </AdventureModal>
        )
      })()}
      <div className={`mt-4 grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
        {visibleRewards.map((reward) => {
          const unlocked = isRewardUnlocked(reward, owned, xpLevel)
          const equipped = isEquippedReward(reward, equipment)
          const assetUrl = reward.kind === 'frame'
            ? resolveCatalogRewardAsset(reward, 'thumbnail') ?? getResolvedRewardAssetUrl(reward.id)
            : resolveCatalogRewardAsset(reward, 'thumbnail')
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
                <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-xl bg-white text-muted shadow-press" aria-label="Chưa mở"><Lock size={16} aria-hidden="true" /></span>
              )}
              <div className={`flex h-24 items-center justify-center ${unlocked ? '' : 'opacity-70'}`}>
                <RewardArtwork reward={reward} assetUrl={assetUrl} />
              </div>
              <p className="mt-2 text-sm font-extrabold text-brand-600">
                {kindLabels[reward.kind]}
              </p>
              {reward.kind === 'title' && (
                <p className="mt-1 w-fit rounded-full bg-brand-50 px-2 py-1 text-xs font-extrabold text-brand-700">
                  {rewardSourceLabels[rewardSource(reward.unlock.type)]}
                </p>
              )}
              <h3 className="text-base font-extrabold leading-tight">{reward.name}</h3>
              {!compact && <p className="mt-1 text-sm font-semibold leading-snug text-muted">{reward.description}</p>}
              <p className="mt-2 text-sm font-bold text-muted">
                {unlocked
                  ? 'Đã sở hữu'
                  : unlockLabel(reward)}
              </p>
              <button
                type="button"
                onClick={() => setPreviewReward(reward)}
                className="mt-2 min-h-11 w-full rounded-xl border border-brand-100 bg-white px-2 text-sm font-extrabold text-brand-700"
              >
                Xem trước
              </button>
              {unlocked && canEquip(reward) && (
                <button
                  type="button"
                  disabled={pendingRewardId !== null}
                  aria-busy={pendingRewardId === reward.id}
                  onClick={() => void (equipped ? unequip(reward.kind) : equip(reward))}
                  className={`reward-equip-button mt-2 min-h-12 w-full rounded-xl px-3 py-2 text-sm font-extrabold ${
                    equipped
                      ? 'border border-brand-200 bg-white text-brand-700'
                      : 'bg-brand-600 text-white'
                  }`}
                >
                  {pendingRewardId === reward.id
                    ? 'Đang áp dụng…'
                    : equipped ? 'Không dùng nữa' : `Dùng ${kindLabels[reward.kind].toLowerCase()} này`}
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
