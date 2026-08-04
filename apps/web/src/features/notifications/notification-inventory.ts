import type { NotificationRow } from '@/shared/lib/api'

export function displayableNotifications(rows: readonly NotificationRow[]): NotificationRow[] {
  const seen = new Set<string>()
  return rows.filter((row) => {
    if (typeof row.id !== 'string' || typeof row.title !== 'string') return false
    const id = row.id.trim()
    if (!id || !row.title.trim() || seen.has(id)) return false
    seen.add(id)
    return true
  }).sort((left, right) => {
    const leftTime = Date.parse(left.createdAt)
    const rightTime = Date.parse(right.createdAt)
    return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0)
  })
}

export function normalizedUnreadCount(value: number, rows: readonly NotificationRow[]): number {
  const visibleUnread = rows.filter((row) => !row.read).length
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : visibleUnread
}

export function notificationRoute(
  notification: NotificationRow,
  role: 'student' | 'parent' | 'teacher' | 'admin',
): string | null {
  const data = notification.data ?? {}
  const candidate = [data.route, data.path, data.actionUrl, data.action_url]
    .find((value): value is string => typeof value === 'string')
  // Only allow app-local destinations. API-provided URLs are untrusted input.
  if (candidate?.startsWith('/') && !candidate.startsWith('//')) {
    const targetsAnotherRole =
      (candidate.startsWith('/parent') && role !== 'parent') ||
      (candidate.startsWith('/teacher') && role !== 'teacher') ||
      (candidate.startsWith('/admin') && role !== 'admin')
    if (!targetsAnotherRole) return candidate
  }

  const type = notification.type.toLowerCase().replaceAll('-', '_').replaceAll('.', '_')
  if (role === 'parent' && /(approval|share_request|friend_invite|review)/.test(type)) {
    return '/parent/approvals'
  }
  if (/(achievement|badge|reward)/.test(type)) return '/achievements'
  if (/(lesson|course|learning|progress)/.test(type)) return role === 'parent' ? '/parent' : '/world'
  if (/(project|creation|creative|portfolio)/.test(type)) return role === 'parent' ? '/parent/approvals' : '/backpack'
  if (/(event|mission)/.test(type)) return '/events'
  return null
}
