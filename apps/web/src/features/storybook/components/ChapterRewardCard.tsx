import { REWARD_CATALOG } from '@aikids/domain'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/shared/store/auth'
import type { StorybookPage } from '../storybook-data'
import { claimChapterSticker, readClaimedChapterStickers } from '../chapter-rewards'

export function ChapterRewardCard({
  page,
  earned,
}: {
  page: StorybookPage
  earned: ReadonlySet<string>
}) {
  const user = useAuth((state) => state.user)
  const bossId = `${page.slug}-S9`
  const progress = page.stickers.slice(0, 8).filter((sticker) => earned.has(sticker.id)).length
  const reward = REWARD_CATALOG.find((item) =>
    item.unlock.type === 'storybook_sticker' && item.unlock.value === bossId,
  )
  const [claimed, setClaimed] = useState(() =>
    user ? readClaimedChapterStickers(user.id).includes(bossId) : false,
  )
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
            disabled={!ready || !user}
            onClick={() => {
              if (!user) return
              claimChapterSticker(user.id, bossId)
              setClaimed(true)
            }}
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-black text-amber-950 disabled:bg-slate-200 disabled:text-muted"
          >
            {ready ? 'Nhận phần thưởng' : `Còn ${8 - progress} sticker`}
          </button>
        )}
      </div>
    </aside>
  )
}
