import { describe, expect, it } from 'vitest'
import { parentFriendlyError } from './parent-error'

describe('parentFriendlyError', () => {
  it('never exposes Prisma or database infrastructure details', () => {
    const message = parentFriendlyError(new Error(
      'Invalid `prisma.userSubscription.findUnique()` invocation: Error in connector: ECIRCUITBREAKER at pooler.supabase.com',
    ))

    expect(message).toBe('Hệ thống đang tạm gián đoạn. Ba / Mẹ vui lòng thử lại sau ít phút.')
    expect(message).not.toContain('prisma')
    expect(message).not.toContain('supabase')
  })

  it('keeps a safe actionable business message', () => {
    expect(parentFriendlyError(new Error('Gói học hiện tại chưa đủ quyền.')))
      .toBe('Gói học hiện tại chưa đủ quyền.')
  })
})
