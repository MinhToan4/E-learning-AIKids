import { useState } from 'react'

const activities = [
  {
    id: 'chapter',
    icon: '📖',
    title: 'Hoàn thành Chapter “Cánh cửa đầu tiên”',
    detail: 'Mở khóa Background Bình Minh',
    audience: 'Bạn bè',
    reactions: 7,
  },
  {
    id: 'badge',
    icon: '🌱',
    title: 'Nhận huy hiệu Bước đầu tiên',
    detail: 'Hoàn thành bài học AI đầu tiên',
    audience: 'Gia đình · Bạn bè',
    reactions: 4,
  },
  {
    id: 'streak',
    icon: '🔥',
    title: 'Giữ chuỗi học tập',
    detail: 'Một ngày liên tiếp và đang tiếp tục',
    audience: 'Lớp học',
    reactions: 2,
  },
] as const

export function ActivityFeed() {
  const [reacted, setReacted] = useState<Record<string, boolean>>({})
  return (
    <section className="ui-card p-5">
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-brand-600">Cập nhật tự động</p>
        <h2 className="font-display text-2xl">Hoạt động gần đây</h2>
      </div>
      <div className="mt-4 space-y-3">
        {activities.map((activity) => (
          <article key={activity.id} className="flex gap-3 rounded-2xl bg-brand-50 p-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-soft">{activity.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold">{activity.title}</p>
              <p className="text-xs text-muted">{activity.detail}</p>
              <p className="mt-1 text-[10px] font-bold text-brand-600">Hiển thị: {activity.audience}</p>
            </div>
            <button
              type="button"
              onClick={() => setReacted((current) => ({ ...current, [activity.id]: !current[activity.id] }))}
              className="self-center rounded-full bg-white px-2 py-1 text-xs font-bold shadow-soft"
              aria-label={`Thả reaction cho ${activity.title}`}
            >
              {reacted[activity.id] ? '💜' : '🤍'} {activity.reactions + (reacted[activity.id] ? 1 : 0)}
            </button>
          </article>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted">
        Chỉ chia sẻ thẻ cột mốc và reward; video Storybook, prompt và workspace riêng tư không xuất hiện ở đây.
      </p>
    </section>
  )
}
