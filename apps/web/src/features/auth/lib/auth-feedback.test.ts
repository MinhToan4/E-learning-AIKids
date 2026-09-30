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

  it('explains Google popup and provider conflicts', () => {
    expect(authFeedback({ code: 'auth/popup-blocked' }, 'login'))
      .toBe('Trình duyệt đang chặn cửa sổ Google. Hãy cho phép pop-up rồi thử lại nhé.')
    expect(authFeedback({ code: 'auth/account-exists-with-different-credential' }, 'login'))
      .toBe('Email này đang dùng một phương thức đăng nhập khác. Hãy chọn đúng cách đã đăng ký.')
  })

  it('handles STUDENT_LOGIN_LOCKED error code and message', () => {
    expect(authFeedback({ code: 'STUDENT_LOGIN_LOCKED' }, 'login'))
      .toBe('AIKid hiện chỉ hỗ trợ đăng nhập qua tài khoản Phụ huynh. Ba/Mẹ vui lòng đăng nhập bằng Email rồi chọn hồ sơ con nhé!')
    expect(authFeedback(new ApiError(403, 'Học sinh không thể đăng nhập trực tiếp', { code: 'STUDENT_LOGIN_LOCKED' }), 'login'))
      .toBe('AIKid hiện chỉ hỗ trợ đăng nhập qua tài khoản Phụ huynh. Ba/Mẹ vui lòng đăng nhập bằng Email rồi chọn hồ sơ con nhé!')
  })

  it('keeps password reset responses private for unknown emails', () => {
    expect(shouldConfirmPasswordResetEmail(new ApiError(404, 'Not found'))).toBe(true)
    expect(shouldConfirmPasswordResetEmail(new ApiError(422, 'Unknown email'))).toBe(true)
    expect(shouldConfirmPasswordResetEmail(new ApiError(429, 'Rate limited'))).toBe(false)
    expect(shouldConfirmPasswordResetEmail(new ApiError(500, 'Unavailable'))).toBe(false)
  })
})
