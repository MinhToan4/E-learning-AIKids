import { REWARD_CATALOG } from '@/shared/lib/creation/rewards'
import { Link } from 'react-router'
import { useState } from 'react'
import { api } from '@/shared/lib/api'
import type { StorybookPage } from '../storybook-data'

export function ChapterRewardCard({
  page,
  earned,
  onClaimed,
}: {
  page: StorybookPage
  earned: ReadonlySet<string>
  onClaimed?: () => void
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
  if (!reward) return null
  const ready = progress === 8

  return (
    <aside className="rounded-3xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-violet-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-soft ${ready ? '' : 'grayscale opacity-50'}`}>
            {reward.icon}
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Quà hoàn thành Chapter</p>
            <h3 className="font-display text-xl">{reward.name}</h3>
            <p className="text-xs text-muted">{progress}/8 sticker thường · video không được chia sẻ</p>
          </div>
        </div>
        {claimed ? (
          <Link to="/profile" className="rounded-full bg-brand-600 px-4 py-2 text-sm font-extrabold text-white">
            Trang trí Profile →
          </Link>
        ) : (
          <button
            type="button"
            disabled={!ready || busy}
            onClick={() => {
              setBusy(true)
              setMessage('')
              void api(`/api/gamification/storybook/chapters/${page.slug}/claim`, { method: 'POST' })
                .then(() => {
                  setClaimed(true)
                  onClaimed?.()
                })
                .catch((error) => setMessage(error instanceof Error ? error.message : 'Chưa nhận được phần thưởng.'))
                .finally(() => setBusy(false))
            }}
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-amber-950 disabled:bg-slate-200 disabled:text-muted"
          >
            {ready ? 'Nhận phần thưởng' : `Còn ${8 - progress} sticker`}
          </button>
        )}
      </div>
      {message && <p className="mt-2 text-xs font-bold text-red-600">{message}</p>}
    </aside>
  )
}
