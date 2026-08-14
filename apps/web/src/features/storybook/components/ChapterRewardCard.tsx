import { REWARD_CATALOG } from '@/shared/lib/creation/rewards'
import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { api } from '@/shared/lib/api'
import type { StorybookPage } from '../storybook-data'
import { getVerifiedStaticRewardAssetUrl } from '@/features/rewards/reward-assets'
import type { RewardKind } from '@/shared/lib/creation/rewards'
import { rewardTitleAsset } from '@/features/rewards/title-assets'
import { storybookChapter } from '@/shared/lib/creation/storybook'

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
  const titleReward = REWARD_CATALOG.find((item) =>
    item.kind === 'title' && item.unlock.type === 'storybook_sticker' && item.unlock.value === bossId,
  )
  const cosmeticRewardId = page.rewardId ?? storybookChapter(page.slug)?.rewardId
  const cosmeticReward = REWARD_CATALOG.find((item) => item.id === cosmeticRewardId)
  const chapterRewards = [titleReward, cosmeticReward].filter(
    (item, index, items) => item && items.findIndex((candidate) => candidate?.id === item.id) === index,
  )
  const [claimed, setClaimed] = useState(earned.has(bossId))
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    setClaimed(earned.has(bossId))
  }, [bossId, earned])
  if (chapterRewards.length === 0) return null
  const ready = progress === 8
  const leadReward = titleReward ?? cosmeticReward!
  const rewardAsset = leadReward.kind === 'title'
    ? rewardTitleAsset(leadReward.id)
    : getVerifiedStaticRewardAssetUrl(leadReward.id)

  return (
    <details className={`group text-text ${embedded
      ? 'relative z-30 rounded-2xl border border-white/55 bg-white/92 shadow-soft backdrop-blur-sm'
      : 'rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-violet-50'}`}>
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 rounded-2xl px-3 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 [&::-webkit-details-marker]:hidden">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-soft ${ready ? '' : 'grayscale opacity-55'}`}>
          <RewardImage
            src={rewardAsset}
            className="h-9 w-9 object-contain"
            fallback={leadReward.icon}
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-black uppercase tracking-wider text-amber-700">
            Phần thưởng chương
          </span>
          <span className="block truncate font-display text-lg leading-tight">
            {chapterRewards.length} quà riêng của chương
          </span>
          <span className="block text-xs font-bold text-muted">
            {claimed ? 'Đã nhận' : ready ? 'Sẵn sàng nhận' : `${progress}/8 sticker thường`}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-xs font-extrabold text-brand-700">
          <span className="hidden sm:inline">Xem</span>
          <ChevronDown
            size={20}
            className="transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
            aria-hidden
          />
        </span>
      </summary>

      <div className={embedded
        ? 'absolute inset-x-0 bottom-[calc(100%+0.5rem)] rounded-2xl border border-border bg-white px-3 pb-3 pt-3 shadow-clay'
        : 'border-t border-border/80 px-3 pb-3 pt-3'}>
        <div className={`flex items-center justify-between gap-2 rounded-xl bg-sun-50 px-3 py-2.5 ${embedded ? '' : 'flex-wrap'}`}>
          <div>
            <p className="text-sm font-extrabold">
              {claimed ? 'Phần thưởng đã ở trong hồ sơ' : ready ? 'Con đã đủ sticker để nhận quà' : `Còn ${8 - progress} sticker nữa`}
            </p>
            <p className="text-xs font-bold text-muted">Hoàn thành 8 sticker thường để mở sticker S9.</p>
          </div>
          {claimed ? (
            <Link to="/profile" className="min-h-11 rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-extrabold text-white">
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
              className="min-h-11 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-black text-amber-950 disabled:bg-slate-200 disabled:text-muted"
            >
              {busy ? 'Đang nhận…' : ready ? 'Nhận phần thưởng' : 'Chưa thể nhận'}
            </button>
          )}
        </div>

        <div className="mt-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h4 className="font-display text-base">Phần thưởng chương {page.slug}</h4>
              <span className="text-xs font-bold text-muted">
                {claimed ? `${chapterRewards.length}/${chapterRewards.length} đã mở` : `0/${chapterRewards.length} đã mở`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {chapterRewards.map((item) => {
                if (!item) return null
                const asset = item.kind === 'title'
                  ? rewardTitleAsset(item.id)
                  : getVerifiedStaticRewardAssetUrl(item.id)
                const isOwned = claimed || ownedRewards.has(item.id) || ownedRewards.has(bossId)
                return (
                  <div
                    key={item.id}
                    className={`flex min-h-16 items-center gap-2 rounded-xl border p-2 ${isOwned
                      ? 'border-mint-200 bg-mint-50'
                      : 'border-border bg-slate-100 grayscale opacity-65'}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-lg">
                      <RewardImage
                        src={asset}
                        className="h-8 w-8 object-contain"
                        fallback={item.icon}
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[9px] font-black uppercase text-brand-600">
                        {rewardKindLabels[item.kind] ?? item.kind}
                      </span>
                      <span className="block truncate text-[11px] font-extrabold">{item.name}</span>
                      <span className="block text-[9px] font-bold text-muted">
                        {isOwned ? 'Đã mở trong hồ sơ' : `Mở khi nhận ${bossId}`}
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

        {message && <p className="mt-2 text-xs font-bold text-red-600">{message}</p>}
      </div>
    </details>
  )
}
