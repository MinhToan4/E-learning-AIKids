import { useCallback, useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router'
import { api, type NotificationRow } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { useAuth } from '@/shared/store/auth'
import { displayableNotifications, normalizedUnreadCount, notificationRoute } from '../notification-inventory'

export function NotificationBell() {
  const navigate = useNavigate()
  const role = useAuth((state) => state.user?.role ?? 'student')
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationRow[]>([])
  const [unread, setUnread] = useState(0)
  const [message, setMessage] = useState('')
  const [updating, setUpdating] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await api<{
        notifications: NotificationRow[]
        unreadCount: number
      }>('/api/notifications?limit=15')
      const notifications = displayableNotifications(data.notifications)
      setItems(notifications)
      setUnread(normalizedUnreadCount(data.unreadCount, notifications))
      setMessage('')
    } catch {
      setMessage('Chưa tải được thông báo.')
    }
  }, [])

  useEffect(() => {
    void load()
    const refreshVisible = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', refreshVisible)
    window.addEventListener('focus', refreshVisible)
    window.addEventListener('online', refreshVisible)
    const t = window.setInterval(refreshVisible, 60_000)

    return () => {
      document.removeEventListener('visibilitychange', refreshVisible)
      window.removeEventListener('focus', refreshVisible)
      window.removeEventListener('online', refreshVisible)
      window.clearInterval(t)
    }
  }, [load])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  async function markAll() {
    if (updating || unread === 0) return
    setUpdating(true)
    try {
      await api('/api/notifications/read-all', { method: 'POST' })
      setUnread(0)
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      setMessage('')
    } catch {
      setMessage('Chưa đánh dấu đọc hết được.')
    } finally {
      setUpdating(false)
    }
  }

  async function openNotification(notification: NotificationRow) {
    if (updating) return
    const route = notificationRoute(notification, role)
    if (notification.read) {
      if (route) {
        setOpen(false)
        navigate(route)
      }
      return
    }
    setUpdating(true)
    try {
      await api(`/api/notifications/${notification.id}/read`, { method: 'PATCH' })
      setItems((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
      )
      setUnread((u) => Math.max(0, u - 1))
      setMessage('')
      if (route) {
        setOpen(false)
        navigate(route)
      }
    } catch {
      setMessage('Chưa đánh dấu thông báo này được.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-border/80 bg-white text-muted shadow-xs transition hover:bg-brand-50 hover:text-brand-600"
        aria-label="Thông báo"
        aria-expanded={open}
        aria-haspopup="dialog"
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
          <div role="dialog" aria-label="Danh sách thông báo" className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-border bg-white shadow-clay">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <p className="text-sm font-extrabold">Thông báo</p>
              {unread > 0 && (
                <button
                  type="button"
                  disabled={updating}
                  className="min-h-11 px-2 text-xs font-bold text-brand-500 hover:underline disabled:opacity-50"
                  onClick={() => void markAll()}
                >
                  Đọc hết
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {message && (
                <li className="bg-coral-50 px-3 py-2 text-sm font-bold text-coral-700" role="status">{message}</li>
              )}
              {items.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted">
                  Chưa có thông báo nào
                </li>
              )}
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    disabled={updating}
                    className={cn(
                      'min-h-14 w-full px-3 py-2.5 text-left transition hover:bg-brand-50/80 disabled:cursor-default',
                      !n.read && 'bg-sun-100/40',
                    )}
                    onClick={() => void openNotification(n)}
                  >
                    <p className="text-sm font-bold leading-snug">{n.title}</p>
                    <p className="text-xs text-muted">{n.body}</p>
                    {notificationRoute(n, role) && (
                      <p className="mt-1 text-xs font-bold text-brand-600">Xem chi tiết →</p>
                    )}
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
