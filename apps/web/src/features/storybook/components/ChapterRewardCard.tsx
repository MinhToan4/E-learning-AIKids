import { REWARD_CATALOG } from '@/shared/lib/creation/rewards'
import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '@/shared/lib/api'
import type { StorybookPage } from '../storybook-data'
import { getVerifiedStaticRewardAssetUrl } from '@/features/rewards/reward-assets'
import type { RewardKind } from '@/shared/lib/creation/rewards'

const profileRewardKinds = new Set<RewardKind>([
  'avatar',
  'frame',
  'theme',
  'background',
  'companion',
  'effect',
  'title',
])

const rewardKindLabels: Partial<Record<RewardKind, string>> = {
  avatar: 'Avatar',
  frame: 'Khung',
  theme: 'Nền trang',
  background: 'Nền thẻ',
  companion: 'Bạn đồng hành',
  effect: 'Hiệu ứng',
  title: 'Danh hiệu',
}

function RewardImage({ src, className, fallback }: {
  src?: string
  className: string
  fallback: ReactNode
}) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <>{fallback}</>
  return <img src={src} alt="" className={className} onError={() => setFailed(true)} />
}

export function ChapterRewardCard({
  page,
  earned,
  ownedRewards,
  onClaimed,
  embedded = false,
}: {
  page: StorybookPage
  earned: ReadonlySet<string>
  ownedRewards: ReadonlySet<string>
  onClaimed?: () => void | Promise<void>
  embedded?: boolean
}) {
  const bossId = `${page.slug}-S9`
  const progress = page.stickers.slice(0, 8).filter((sticker) => earned.has(sticker.id)).length
  const catalogReward = REWARD_CATALOG.find((item) =>
    item.unlock.type === 'storybook_sticker' && item.unlock.value === bossId,
  )
  const reward = catalogReward ?? (page.rewardId ? {
    id: page.rewardId,
    name: 'Quà huyền thoại của Chapter',
    icon: '🎁',
  } : null)
  const [claimed, setClaimed] = useState(earned.has(bossId))
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    setClaimed(earned.has(bossId))
  }, [bossId, earned])
  if (!reward) return null
  const ready = progress === 8
  const rewardAsset = getVerifiedStaticRewardAssetUrl(reward.id)
  const profileRewards = REWARD_CATALOG.filter((item) =>
    profileRewardKinds.has(item.kind),
  )
  const ownedProfileRewardCount = profileRewards.filter((item) => ownedRewards.has(item.id)).length

  return (
    <aside className={embedded
      ? 'rounded-3xl border border-white/50 bg-white/90 p-4 text-text shadow-soft backdrop-blur-sm'
      : 'rounded-3xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-violet-50 p-4'}>
      <div className={embedded ? 'flex flex-col gap-3' : 'flex flex-wrap items-center justify-between gap-4'}>
        <div className="flex items-center gap-3">
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-soft ${ready ? '' : 'grayscale opacity-50'}`}>
            <RewardImage
              src={rewardAsset}
              className="h-12 w-12 object-contain"
              fallback={reward.icon}
            />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-amber-700">Phần thưởng chương</p>
            <h3 className="font-display text-xl">{reward.name}</h3>
            <p className="text-sm font-bold text-muted">{progress}/8 sticker thường</p>
          </div>
        </div>
        {claimed ? (
          <Link to="/profile" className="min-h-11 rounded-full bg-brand-600 px-4 py-2.5 text-center text-sm font-extrabold text-white">
            Dùng trong hồ sơ
          </Link>
        ) : (
          <button
            type="button"
            disabled={!ready || busy}
            onClick={() => {
              setBusy(true)
              setMessage('')
              void api(`/api/gamification/storybook/chapters/${encodeURIComponent(page.slug)}/claim`, { method: 'POST' })
                .then(async () => {
                  await onClaimed?.()
                  setMessage('Đã nhận S9 và đồng bộ phần thưởng.')
                })
                .catch((error) => setMessage(error instanceof Error ? error.message : 'Chưa nhận được phần thưởng.'))
                .finally(() => setBusy(false))
            }}
            className="min-h-11 rounded-full bg-amber-400 px-4 py-2.5 text-sm font-black text-amber-950 disabled:bg-slate-200 disabled:text-muted"
          >
            {ready ? 'Nhận phần thưởng' : `Còn ${8 - progress} sticker`}
          </button>
        )}
      </div>
      {embedded && (
        <div className="mt-4 border-t border-border pt-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h4 className="font-display text-lg">Tủ phần thưởng</h4>
            <span className="text-xs font-bold text-muted">
              {ownedProfileRewardCount}/{profileRewards.length} đã sở hữu
            </span>
          </div>
          <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto pr-1">
            {profileRewards.map((item) => {
              const asset = getVerifiedStaticRewardAssetUrl(item.id)
              const isCurrent = item.id === reward.id
              const isOwned = ownedRewards.has(item.id)
              return (
                <div
                  key={item.id}
                  className={`flex min-h-14 items-center gap-2 rounded-2xl border p-2 ${
                    isCurrent
                      ? 'border-amber-300 bg-amber-50'
                      : isOwned
                        ? 'border-mint-200 bg-mint-50'
                        : 'border-border bg-slate-50 opacity-65'
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl">
                    <RewardImage
                      src={asset}
                      className="h-9 w-9 object-contain"
                      fallback={item.icon}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-black uppercase text-brand-600">
                      {rewardKindLabels[item.kind] ?? item.kind}
                    </span>
                    <span className="block truncate text-xs font-extrabold">
                      {item.name}
                    </span>
                    <span className="block text-[10px] font-bold text-muted">
                      {isOwned ? 'Đã sở hữu' : 'Chưa mở'}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {message && <p className="mt-2 text-xs font-bold text-red-600">{message}</p>}
    </aside>
  )
}
