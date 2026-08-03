import { describe, expect, it } from 'vitest'
import type { NotificationRow } from '@/shared/lib/api'
import { displayableNotifications, normalizedUnreadCount } from './notification-inventory'

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
    expect(normalizedUnreadCount(8, rows)).toBe(8)
  })
})
