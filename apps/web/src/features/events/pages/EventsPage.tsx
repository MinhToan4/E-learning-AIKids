import {
  REWARD_CATALOG,
  REWARD_EVENTS,
  explorerLevelForXp,
  isRewardUnlocked,
  rewardEventStatus,
} from '@aikids/domain'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { api } from '@/shared/lib/api'

const statusLabel = {
  active: 'Đang diễn ra',
  upcoming: 'Sắp mở',
  ended: 'Đã kết thúc',
} as const

export function EventsPage() {
  const [xp, setXp] = useState(0)
  useEffect(() => {
    void api<{ totalXp: number }>('/api/gamification/profile')
      .then((data) => setXp(data.totalXp))
      .catch(() => undefined)
  }, [])
  const level = explorerLevelForXp(xp).level

  return (
    <PageMotion className="flex flex-col gap-6">
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-500 via-cyan-500 to-violet-600 p-7 text-white shadow-xl">
        <span className="absolute right-5 top-0 text-[9rem] opacity-20" aria-hidden>🎪</span>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-200">
          StoryMee Events
        </p>
        <h1 className="mt-1 font-display text-4xl">Sự kiện sáng tạo</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold text-white/85">
          Sự kiện có thời hạn, nhiệm vụ rõ ràng và phần thưởng độc quyền.
          Vé chỉ được dùng cho đúng sự kiện, không làm mất XP.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {REWARD_EVENTS.map((event) => {
          const status = rewardEventStatus(event)
          const ticket = event.ticketRewardId
            ? REWARD_CATALOG.find((reward) => reward.id === event.ticketRewardId)
            : undefined
          const hasTicket = !ticket || isRewardUnlocked(ticket, { xpLevel: level })
          return (
            <article key={event.key} className="ui-card overflow-hidden">
              <div className="relative bg-gradient-to-br from-indigo-800 to-fuchsia-600 p-6 text-white">
                <span className="text-6xl" aria-hidden>{event.icon}</span>
                <span className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-black">
                  {statusLabel[status]}
                </span>
                <h2 className="mt-4 font-display text-3xl">{event.title}</h2>
                <p className="mt-1 text-sm font-semibold text-white/80">{event.description}</p>
              </div>
              <div className="space-y-3 p-5">
                <p className="text-xs font-bold text-muted">
                  {new Date(event.startsAt).toLocaleDateString('vi-VN')} –{' '}
                  {new Date(event.endsAt).toLocaleDateString('vi-VN')}
                </p>
                <div className="rounded-2xl bg-amber-50 p-3">
                  <p className="text-xs font-black uppercase text-amber-700">Phần thưởng hoàn thành</p>
                  <p className="font-extrabold">
                    {REWARD_CATALOG.find((reward) => reward.id === event.completionRewardId)?.icon}{' '}
                    {REWARD_CATALOG.find((reward) => reward.id === event.completionRewardId)?.name}
                  </p>
                </div>
                {ticket && (
                  <p className={`rounded-xl px-3 py-2 text-sm font-extrabold ${
                    hasTicket ? 'bg-mint-100 text-success' : 'bg-slate-100 text-muted'
                  }`}>
                    {hasTicket ? `🎟️ Con đã có ${ticket.name}` : `🔒 Cần ${ticket.name} · mở ở Cấp ${ticket.unlock.value}`}
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
