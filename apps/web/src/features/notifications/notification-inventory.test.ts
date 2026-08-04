import { describe, expect, it } from 'vitest'
import type { NotificationRow } from '@/shared/lib/api'
import { displayableNotifications, normalizedUnreadCount, notificationRoute } from './notification-inventory'

const notification = (overrides: Partial<NotificationRow> = {}): NotificationRow => ({
  id: 'notice-1',
  type: 'achievement',
  title: 'Huy hiệu mới',
  body: 'Con vừa mở một huy hiệu.',
  read: false,
  data: null,
  createdAt: '2026-08-03T00:00:00.000Z',
  ...overrides,
})

describe('notification inventory', () => {
  it('removes malformed and duplicate notifications', () => {
    expect(displayableNotifications([
      notification(),
      notification({ title: 'Bản sao' }),
      notification({ id: '', title: 'Thiếu mã' }),
    ]).map((row) => row.id)).toEqual(['notice-1'])
  })

  it('keeps unread total consistent with visible unread items', () => {
    const rows = [notification(), notification({ id: 'notice-2', read: false })]
    expect(normalizedUnreadCount(Number.NaN, rows)).toBe(2)
    expect(normalizedUnreadCount(1, rows)).toBe(1)
  })

  it('sorts newest notifications first', () => {
    const rows = displayableNotifications([
      notification({ id: 'old', createdAt: '2026-08-01T00:00:00.000Z' }),
      notification({ id: 'new', createdAt: '2026-08-03T00:00:00.000Z' }),
    ])
    expect(rows.map((row) => row.id)).toEqual(['new', 'old'])
  })

  it('routes parent approval notices without accepting external URLs', () => {
    expect(notificationRoute(notification({
      type: 'project.share_requested',
      data: { actionUrl: 'https://example.com/phishing' },
    }), 'parent')).toBe('/parent/approvals')
    expect(notificationRoute(notification({ data: { route: '/parent/approvals' } }), 'parent'))
      .toBe('/parent/approvals')
    expect(notificationRoute(notification({ type: 'general', data: { route: '/parent/approvals' } }), 'student'))
      .toBeNull()
  })
})
