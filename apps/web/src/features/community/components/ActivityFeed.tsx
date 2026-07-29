import { useCallback, useEffect, useState } from 'react'
import { api } from '@/shared/lib/api'

export type SocialActivity = {
  id: string
  type: string
  title: string
  summary: string
  icon?: string | null
  coverUrl?: string | null
  referenceId?: string | null
  audiences: string[]
  createdAt: string
  actor: { id: string; name: string; avatarUrl?: string | null; level: number }
  counts: Record<string, number>
  mine?: string | null
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<SocialActivity[]>([])
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    try {
      const result = await api<{ activities: SocialActivity[] }>('/api/gamification/social/feed')
      setActivities(result.activities)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Chưa tải được hoạt động.')
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const toggleLove = async (activity: SocialActivity) => {
    try {
      await api(`/api/gamification/social/activities/${activity.id}/reaction`, {
        method: 'PUT',
        body: JSON.stringify({ type: activity.mine === 'LOVE' ? null : 'LOVE' }),
      })
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Chưa gửi được lời động viên.')
    }
  }

  return (
    <section className="ui-card p-5">
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-brand-600">Cập nhật tự động</p>
        <h2 className="font-display text-2xl">Hoạt động gần đây</h2>
      </div>
      <div className="mt-4 space-y-3">
        {activities.length === 0 && (
          <p className="rounded-2xl bg-brand-50 p-4 text-sm text-muted">Chưa có hoạt động đã được chia sẻ trong vòng tròn của con.</p>
        )}
        {activities.map((activity) => {
          const total = Object.values(activity.counts ?? {}).reduce((sum, value) => sum + Number(value), 0)
          return (
            <article key={activity.id} className="flex gap-3 rounded-2xl bg-brand-50 p-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-soft">{activity.icon || '✨'}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-brand-600">{activity.actor.name}</p>
                <p className="text-sm font-extrabold">{activity.title}</p>
                <p className="text-xs text-muted">{activity.summary}</p>
                <p className="mt-1 text-[10px] font-bold text-brand-600">Hiển thị: {activity.audiences.join(' · ')}</p>
              </div>
              <button
                type="button"
                onClick={() => void toggleLove(activity)}
                className="self-center rounded-full bg-white px-2 py-1 text-xs font-bold shadow-soft"
                aria-label={`Thả reaction cho ${activity.title}`}
              >
                {activity.mine === 'LOVE' ? '💜' : '🤍'} {total}
              </button>
            </article>
          )
        })}
      </div>
      {message && <p className="mt-3 text-xs font-bold text-brand-700">{message}</p>}
      <p className="mt-3 text-[11px] text-muted">
        Chỉ chia sẻ thẻ cột mốc và reward; video Storybook, prompt và workspace riêng tư không xuất hiện ở đây.
      </p>
    </section>
  )
}
