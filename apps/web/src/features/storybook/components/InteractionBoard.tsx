import { Link } from 'react-router'

const interactions = [
  {
    id: 'remix',
    icon: '🎛️',
    title: 'Remix một ý tưởng',
    description: 'Chọn tác phẩm con yêu thích và tạo phiên bản mang dấu ấn riêng.',
    action: 'Khám phá tác phẩm',
    href: '/community?view=gallery',
    tone: 'remix',
  },
  {
    id: 'challenge',
    icon: '⚡',
    title: 'Thách bạn sáng tạo',
    description: 'Cùng một chủ đề, hai góc nhìn. Cả hai đều nhận phần thưởng.',
    action: 'Tạo thử thách',
    href: '/creative',
    tone: 'challenge',
  },
  {
    id: 'inspire',
    icon: '✨',
    title: 'Ghi nguồn cảm hứng',
    description: 'Cảm ơn người đã giúp ý tưởng của con bắt đầu.',
    action: 'Gửi lời cảm ơn',
    href: '/community?view=gallery',
    tone: 'inspire',
  },
] as const

export function InteractionBoard() {
  return (
    <section className="space-y-5" aria-labelledby="interaction-title">
      <header className="storybook-section-intro" data-tone="interaction">
        <span className="storybook-section-symbol" aria-hidden="true">🤝</span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--section-accent)]">Cùng làm · Cùng động viên</p>
          <h2 id="interaction-title" className="mt-1 font-display text-3xl text-text">Ý tưởng lớn lên khi mình kết nối</h2>
          <p className="mt-2 max-w-2xl text-base font-semibold leading-relaxed text-muted">Chọn một hoạt động để sáng tạo cùng chủ đề, remix có ghi nguồn hoặc gửi phản hồi tích cực cho bạn.</p>
          <p className="mt-3 inline-flex rounded-full bg-white/80 px-3 py-1.5 text-xs font-extrabold text-[var(--section-accent)]">🛡️ Không bình luận tự do, không dislike</p>
        </div>
      </header>
      <article className="storybook-weekly-prompt">
        <span className="absolute right-5 top-0 text-8xl opacity-15" aria-hidden>☁️</span>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-700">
          Chủ đề trên đảo tuần này
        </p>
        <h3 className="mt-1 font-display text-3xl">
          Nếu trường học nằm trên một đám mây?
        </h3>
        <p className="mt-2 max-w-xl text-sm font-semibold text-muted">
          Tạo nhân vật, hình ảnh hoặc truyện theo chủ đề tuần. Không có đáp án đúng.
        </p>
        <Link to="/creative" className="mt-5 inline-block rounded-full border-2 border-brand-300 bg-white px-5 py-2.5 text-sm font-black text-brand-800 shadow-press">
          Bắt đầu sáng tạo
        </Link>
      </article>

      <div className="grid gap-4 md:grid-cols-3">
        {interactions.map((item) => (
          <article key={item.id} className="storybook-community-action ui-card flex flex-col overflow-hidden" data-tone={item.tone}>
            <div className="storybook-community-action-head">
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
