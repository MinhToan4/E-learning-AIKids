import { REWARD_CATALOG } from '@/shared/lib/creation/rewards'
import { REWARD_EVENTS, rewardEventStatus } from '@/shared/lib/creation/events'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { ImportantCardMascot } from '@/shared/components/ui/ImportantCardMascot'
import { api } from '@/shared/lib/api'
import { designerAssets } from '@/shared/config/assets'
import {
  KidBadgeImageIcon,
  KidEventImageIcon,
  KidTimeImageIcon,
} from '@/shared/components/icons/KidImageIcons'

const statusLabel = {
  active: 'Đang diễn ra',
  upcoming: 'Sắp mở',
  ended: 'Đã kết thúc',
} as const

export function EventsPage() {
  const [ownedRewardIds, setOwnedRewardIds] = useState<Set<string>>(new Set())
  useEffect(() => {
    void api<{ inventory: Array<{ rewardId: string }> }>('/api/gamification/storybook')
      .then((data) => setOwnedRewardIds(new Set(data.inventory.map((item) => item.rewardId))))
      .catch(() => undefined)
  }, [])

  return (
    <PageMotion className="flex flex-col gap-6">
      <header className="student-feature-hero important-card-with-hero-mascot ui-card p-5 sm:p-7" data-tone="sky">
        <ImportantCardMascot pose="celebrate" className="important-card-mascot--hero" />
        <div className="student-feature-hero-row">
          <div className="max-w-2xl">
            <div className="eyebrow-chip">
              <KidEventImageIcon size={22} />
              Sự kiện
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-text sm:text-4xl">Sự kiện sáng tạo</h1>
            <p className="mt-2 text-base font-semibold leading-relaxed text-muted">
              Thử thách có thời hạn, nhiệm vụ rõ ràng và phần thưởng riêng cho từng sự kiện.
            </p>
          </div>
        </div>
        <div className="student-feature-scene" aria-hidden="true">
          <img src={designerAssets.worldScenes.storyIsland} alt="" />
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {REWARD_EVENTS.map((event) => {
          const status = rewardEventStatus(event)
          const ticket = event.ticketRewardId
            ? REWARD_CATALOG.find((reward) => reward.id === event.ticketRewardId)
            : undefined
          const hasTicket = !ticket || ownedRewardIds.has(ticket.id)
          return (
            <article key={event.key} className="ui-card overflow-hidden border-2 border-border bg-white">
              <div className="relative overflow-hidden border-b border-border bg-sky-50 p-5 sm:p-6">
                <div className="student-feature-hero-icon" aria-hidden="true">
                  <KidEventImageIcon size={36} />
                </div>
                <span className="absolute right-4 top-4 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-black text-sky-700 shadow-soft">
                  {statusLabel[status]}
                </span>
                <h2 className="mt-4 font-display text-2xl text-text sm:text-3xl">{event.title}</h2>
                <p className="mt-1 text-base font-semibold text-muted">{event.description}</p>
              </div>
              <div className="space-y-3 p-5">
                <p className="flex items-center gap-2 text-sm font-bold text-muted">
                  <KidTimeImageIcon size={22} aria-hidden="true" />
                  <time dateTime={event.startsAt}>{new Date(event.startsAt).toLocaleDateString('vi-VN')}</time>
                  <span aria-hidden="true">–</span>
                  <time dateTime={event.endsAt}>{new Date(event.endsAt).toLocaleDateString('vi-VN')}</time>
                </p>
                <div className="flex items-center gap-3 rounded-2xl border border-sun-200 bg-sun-50 p-3">
                  <span className="student-nav-icon !h-11 !w-11" aria-hidden="true"><KidBadgeImageIcon size={28} /></span>
                  <div>
                    <p className="text-xs font-black uppercase text-sun-700">Phần thưởng hoàn thành</p>
                    <p className="font-extrabold text-text">
                      {REWARD_CATALOG.find((reward) => reward.id === event.completionRewardId)?.name}
                    </p>
                  </div>
                </div>
                {ticket && (
                  <p className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold ${
                    hasTicket ? 'bg-mint-100 text-success' : 'bg-slate-100 text-muted'
                  }`}>
                    <KidEventImageIcon size={22} aria-hidden="true" />
                    {hasTicket ? `Con đã có ${ticket.name}` : `Cần ${ticket.name} trong kho phần thưởng`}
                  </p>
                )}
                {status === 'active' && hasTicket ? (
                  <Link to="/storybook?view=interaction" className="ui-btn ui-btn-primary w-full">
                    Tham gia sự kiện
                  </Link>
                ) : (
                  <Link to="/level" className="ui-btn ui-btn-secondary w-full">
                    {status === 'upcoming' ? 'Chuẩn bị phần thưởng' : 'Xem cấp độ'}
                  </Link>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </PageMotion>
  )
}
