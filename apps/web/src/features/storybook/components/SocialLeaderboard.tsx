const boards = [
  {
    title: 'Nghệ sĩ được yêu thích',
    subtitle: 'Reactions nhận được tuần này',
    icon: '🌟',
    rows: [
      ['1', 'Lan', 'Thành Phố Tương Lai', '84'],
      ['2', 'Minh', 'Chú Rồng Xanh', '74'],
      ['3', 'Tú', 'Hành Trình Vũ Trụ', '70'],
    ],
  },
  {
    title: 'Người lan tỏa yêu thương',
    subtitle: 'Lời động viên đã gửi tuần này',
    icon: '💝',
    rows: [
      ['1', 'Hà', 'Cổ động viên tuyệt vời', '47'],
      ['2', 'An', 'Trái tim ấm áp', '38'],
      ['3', 'Bình', 'Bạn đồng hành', '31'],
    ],
  },
] as const

export function SocialLeaderboard() {
  return (
    <section className="space-y-5" aria-labelledby="social-board-title">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">
          Bảng vinh danh tuần
        </p>
        <h2 id="social-board-title" className="font-display text-3xl">
          Thành tích làm cộng đồng tốt đẹp hơn
        </h2>
        <p className="mx-auto mt-1 max-w-2xl text-sm text-muted">
          Không có điểm trừ hay dislike. Thành tích nhận và cho đi được tôn vinh ngang nhau.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {boards.map((board) => (
          <article key={board.title} className="ui-card overflow-hidden">
            <header className="bg-gradient-to-r from-violet-700 to-fuchsia-600 p-5 text-white">
              <span className="text-4xl" aria-hidden>{board.icon}</span>
              <h3 className="mt-2 font-display text-2xl">{board.title}</h3>
              <p className="text-xs font-semibold text-white/75">{board.subtitle}</p>
            </header>
            <ol className="divide-y divide-slate-100 p-3">
              {board.rows.map(([rank, name, work, score]) => (
                <li key={rank} className="flex items-center gap-3 rounded-xl p-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full font-black ${
                    rank === '1' ? 'bg-amber-300 text-amber-950' : 'bg-slate-100 text-slate-600'
                  }`}>{rank}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold">{name}</p>
                    <p className="truncate text-xs text-muted">{work}</p>
                  </div>
                  <strong className="rounded-full bg-pink-50 px-3 py-1 text-pink-700">{score}</strong>
                </li>
              ))}
              <li className="mt-2 flex items-center gap-3 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white">✨</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-muted">Vị trí của con</p>
                  <p className="font-extrabold">Tiếp tục lan tỏa nhé!</p>
                </div>
              </li>
            </ol>
          </article>
        ))}
      </div>
    </section>
  )
}
