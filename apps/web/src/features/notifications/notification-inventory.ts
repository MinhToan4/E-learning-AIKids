import type { NotificationRow } from '@/shared/lib/api'

export function displayableNotifications(rows: readonly NotificationRow[]): NotificationRow[] {
  const seen = new Set<string>()
  return rows.filter((row) => {
    if (typeof row.id !== 'string' || typeof row.title !== 'string') return false
    const id = row.id.trim()
    if (!id || !row.title.trim() || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

export function normalizedUnreadCount(value: number, rows: readonly NotificationRow[]): number {
  const visibleUnread = rows.filter((row) => !row.read).length
  const serverCount = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
  return Math.max(visibleUnread, serverCount)
}
