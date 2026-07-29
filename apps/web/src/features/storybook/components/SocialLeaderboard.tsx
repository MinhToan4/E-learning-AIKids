import { useEffect, useState } from 'react'
import { api } from '@/shared/lib/api'

type Leader = { id: string; name: string; avatarUrl?: string | null; score: number }

export function SocialLeaderboard() {
  const [boards, setBoards] = useState<{ received: Leader[]; given: Leader[] }>({ received: [], given: [] })
  const [message, setMessage] = useState('')

  useEffect(() => {
    void api<{ leaderboard: { received: Leader[]; given: Leader[] } }>('/api/gamification/social/discover')
      .then((result) => setBoards(result.leaderboard))
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Chưa tải được bảng vinh danh.'))
  }, [])

  const definitions = [
    { key: 'received' as const, title: 'Nghệ sĩ được yêu thích', subtitle: 'Reactions nhận được tuần này', icon: '🌟' },
    { key: 'given' as const, title: 'Người lan tỏa yêu thương', subtitle: 'Lời động viên đã gửi tuần này', icon: '💝' },
  ]
  return (
    <section className="space-y-5" aria-labelledby="social-board-title">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">Bảng vinh danh tuần</p>
        <h2 id="social-board-title" className="font-display text-3xl">Thành tích làm cộng đồng tốt đẹp hơn</h2>
        <p className="mx-auto mt-1 max-w-2xl text-sm text-muted">Không có điểm trừ hay dislike. Thành tích nhận và cho đi được tôn vinh ngang nhau.</p>
      </div>
      {message && <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
      <div className="grid gap-5 md:grid-cols-2">
        {definitions.map((board) => (
          <article key={board.key} className="ui-card overflow-hidden">
            <header className="bg-gradient-to-r from-violet-700 to-fuchsia-600 p-5 text-white">
              <span className="text-4xl" aria-hidden>{board.icon}</span>
              <h3 className="mt-2 font-display text-2xl">{board.title}</h3>
              <p className="text-xs font-semibold text-white/75">{board.subtitle}</p>
            </header>
            <ol className="divide-y divide-slate-100 p-3">
              {boards[board.key].length === 0 && <li className="p-5 text-center text-sm text-muted">Chưa có dữ liệu tuần này.</li>}
              {boards[board.key].map((leader, index) => (
                <li key={leader.id} className="flex items-center gap-3 rounded-xl p-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full font-black ${
                    index === 0 ? 'bg-amber-300 text-amber-950' : 'bg-slate-100 text-slate-600'
                  }`}>{index + 1}</span>
                  {leader.avatarUrl
                    ? <img src={leader.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                    : <span className="text-2xl">🧑‍🎨</span>}
                  <p className="min-w-0 flex-1 truncate font-extrabold">{leader.name}</p>
                  <strong className="rounded-full bg-pink-50 px-3 py-1 text-pink-700">{leader.score}</strong>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  )
}
