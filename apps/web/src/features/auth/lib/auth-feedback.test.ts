import { describe, expect, it } from 'vitest'
import { ApiError } from '@/shared/lib/api'
import { authFeedback, shouldConfirmPasswordResetEmail } from './auth-feedback'

describe('auth feedback', () => {
  it('does not expose backend or infrastructure messages', () => {
    expect(authFeedback(new ApiError(500, 'Consumer JWT required'), 'login'))
      .toBe('Kết nối đang gián đoạn. Bạn thử lại sau nhé.')
    expect(authFeedback(new Error('Firebase chưa được cấu hình.'), 'login'))
      .toBe('Chưa thể đăng nhập. Bạn thử lại nhé.')
  })

  it('gives a useful response for common account states', () => {
    expect(authFeedback(new ApiError(401, 'Unauthorized'), 'login'))
      .toContain('chưa đúng')
    expect(authFeedback(new ApiError(409, 'Conflict'), 'register'))
      .toContain('đã được đăng ký')
    expect(authFeedback(new ApiError(410, 'Expired'), 'reset-password'))
      .toContain('không còn hiệu lực')
  })

  it('keeps password reset responses private for unknown emails', () => {
    expect(shouldConfirmPasswordResetEmail(new ApiError(404, 'Not found'))).toBe(true)
    expect(shouldConfirmPasswordResetEmail(new ApiError(422, 'Unknown email'))).toBe(true)
    expect(shouldConfirmPasswordResetEmail(new ApiError(429, 'Rate limited'))).toBe(false)
    expect(shouldConfirmPasswordResetEmail(new ApiError(500, 'Unavailable'))).toBe(false)
  })
})
