import { Link } from 'react-router'

const interactions = [
  {
    id: 'remix',
    icon: '🎛️',
    title: 'Remix một ý tưởng',
    description: 'Chọn tác phẩm con yêu thích và tạo phiên bản mang dấu ấn riêng.',
    action: 'Khám phá tác phẩm',
    href: '/storybook?view=gallery',
    tone: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'challenge',
    icon: '⚡',
    title: 'Thách bạn sáng tạo',
    description: 'Cùng một chủ đề, hai góc nhìn. Cả hai đều nhận phần thưởng.',
    action: 'Tạo thử thách',
    href: '/creative',
    tone: 'from-orange-400 to-rose-500',
  },
  {
    id: 'inspire',
    icon: '✨',
    title: 'Ghi nguồn cảm hứng',
    description: 'Cảm ơn người đã giúp ý tưởng của con bắt đầu.',
    action: 'Gửi lời cảm ơn',
    href: '/storybook?view=gallery',
    tone: 'from-violet-500 to-fuchsia-600',
  },
] as const

export function InteractionBoard() {
  return (
    <section className="space-y-5" aria-labelledby="interaction-title">
      <article className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-900 to-violet-700 p-6 text-white shadow-xl">
        <span className="absolute right-5 top-0 text-8xl opacity-20" aria-hidden>📝</span>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
          Weekly Prompt
        </p>
        <h2 id="interaction-title" className="mt-1 font-display text-3xl">
          Nếu trường học nằm trên một đám mây?
        </h2>
        <p className="mt-2 max-w-xl text-sm font-semibold text-white/80">
          Tạo nhân vật, hình ảnh hoặc truyện theo chủ đề tuần. Không có đáp án đúng.
        </p>
        <Link to="/creative" className="mt-5 inline-block rounded-full bg-amber-300 px-5 py-2.5 text-sm font-black text-indigo-950">
          Bắt đầu sáng tạo
        </Link>
      </article>

      <div className="grid gap-4 md:grid-cols-3">
        {interactions.map((item) => (
          <article key={item.id} className="ui-card flex flex-col overflow-hidden">
            <div className={`bg-gradient-to-br ${item.tone} p-5 text-white`}>
              <span className="text-4xl" aria-hidden>{item.icon}</span>
              <h3 className="mt-3 font-display text-xl">{item.title}</h3>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="flex-1 text-sm text-muted">{item.description}</p>
              <Link
                to={item.href}
                className="mt-4 rounded-xl border-2 border-brand-200 px-3 py-2 text-sm font-extrabold text-brand-600 hover:bg-brand-50"
              >
                {item.action}
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="font-extrabold text-emerald-900">🛡️ Không gian tương tác an toàn</p>
        <p className="mt-1 text-xs font-semibold text-emerald-800">
          Không comment tự do, không dislike; phạm vi Family, Class và Community luôn theo quyền phụ huynh.
        </p>
      </div>
    </section>
  )
}
