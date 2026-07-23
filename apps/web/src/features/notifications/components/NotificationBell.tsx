import { useCallback, useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { api, type NotificationRow } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { enablePushNotifications, listenForForegroundPush } from '@/shared/lib/firebase-client'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationRow[]>([])
  const [unread, setUnread] = useState(0)
  const [pushEnabled, setPushEnabled] = useState(
    () => typeof Notification !== 'undefined' && Notification.permission === 'granted',
  )

  const load = useCallback(async () => {
    try {
      const data = await api<{
        notifications: NotificationRow[]
        unreadCount: number
      }>('/api/notifications?limit=15')
      setItems(data.notifications)
      setUnread(data.unreadCount)
    } catch {
      // silent — bell is non-critical
    }
  }, [])

  useEffect(() => {
    void load()
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      void enablePushNotifications().then(setPushEnabled).catch(() => setPushEnabled(false))
    }
    const refreshVisible = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', refreshVisible)
    const t = window.setInterval(refreshVisible, 5 * 60_000)
    let unsubscribe: () => void = () => undefined
    void listenForForegroundPush(load).then((stop) => { unsubscribe = stop })
    return () => {
      document.removeEventListener('visibilitychange', refreshVisible)
      window.clearInterval(t)
      unsubscribe()
    }
  }, [load])

  async function markAll() {
    try {
      await api('/api/notifications/read-all', { method: 'POST' })
      setUnread(0)
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      /* ignore */
    }
  }

  async function markOne(id: string) {
    try {
      await api(`/api/notifications/${id}/read`, { method: 'PATCH' })
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      )
      setUnread((u) => Math.max(0, u - 1))
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 bg-white text-muted shadow-xs transition hover:bg-brand-50 hover:text-brand-600"
        aria-label="Thông báo"
        onClick={() => {
          setOpen((o) => !o)
          if (!open) void load()
        }}
      >
        <Bell size={20} strokeWidth={2.2} />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-600 px-1.5 text-[11px] font-black text-white shadow-md shadow-rose-500/40 ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Đóng"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-border bg-white shadow-clay">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <p className="text-sm font-extrabold">Thông báo</p>
              {unread > 0 && (
                <button
                  type="button"
                  className="text-xs font-bold text-brand-500 hover:underline"
                  onClick={() => void markAll()}
                >
                  Đọc hết
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {items.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted">
                  Chưa có thông báo nào
                </li>
              )}
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={cn(
                      'w-full px-3 py-2.5 text-left transition hover:bg-brand-50/80',
                      !n.read && 'bg-sun-100/40',
                    )}
                    onClick={() => void markOne(n.id)}
                  >
                    <p className="text-sm font-bold leading-snug">{n.title}</p>
                    <p className="text-xs text-muted">{n.body}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
