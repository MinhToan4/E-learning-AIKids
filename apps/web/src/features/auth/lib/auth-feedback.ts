import { ApiError } from '@/shared/lib/api'

type AuthAction = 'login' | 'register' | 'forgot-password' | 'reset-password'

const fallbackByAction: Record<AuthAction, string> = {
  login: 'Chưa thể đăng nhập. Bạn thử lại nhé.',
  register: 'Chưa thể tạo tài khoản. Bạn thử lại nhé.',
  'forgot-password': 'Chưa thể gửi email. Bạn thử lại sau nhé.',
  'reset-password': 'Chưa thể đổi mật khẩu. Bạn thử lại nhé.',
}

export function authFeedback(error: unknown, action: AuthAction): string {
  const firebaseCode = error && typeof error === 'object' && 'code' in error
    ? String((error as { code?: unknown }).code ?? '')
    : ''
  if (firebaseCode === 'auth/network-request-failed') {
    return 'Kết nối đang gián đoạn. Bạn thử lại sau nhé.'
  }
  if (firebaseCode === 'auth/too-many-requests') {
    return 'Bạn đã thử nhiều lần. Vui lòng chờ một chút rồi thử lại.'
  }
  if (action === 'login' && [
    'auth/invalid-credential',
    'auth/invalid-email',
    'auth/user-disabled',
  ].includes(firebaseCode)) {
    return firebaseCode === 'auth/user-disabled'
      ? 'Tài khoản này chưa thể đăng nhập. Vui lòng liên hệ hỗ trợ.'
      : 'Thông tin đăng nhập chưa đúng. Bạn kiểm tra lại nhé.'
  }
  if (action === 'register' && firebaseCode === 'auth/email-already-in-use') {
    return 'Email này đã được đăng ký. Bạn có thể đăng nhập ngay.'
  }
  if (action === 'reset-password' && [
    'auth/expired-action-code',
    'auth/invalid-action-code',
  ].includes(firebaseCode)) {
    return 'Liên kết này không còn hiệu lực. Vui lòng yêu cầu liên kết mới.'
  }
  if (!(error instanceof ApiError)) return fallbackByAction[action]

  if (error.status === 0 || error.status >= 500) {
    return 'Kết nối đang gián đoạn. Bạn thử lại sau nhé.'
  }
  if (error.status === 429) {
    return 'Bạn đã thử nhiều lần. Vui lòng chờ một chút rồi thử lại.'
  }
  if (action === 'login' && error.status === 401) {
    return 'Thông tin đăng nhập chưa đúng. Bạn kiểm tra lại nhé.'
  }
  if (action === 'register' && error.status === 409) {
    return 'Email này đã được đăng ký. Bạn có thể đăng nhập ngay.'
  }
  if (action === 'reset-password' && [400, 404, 410].includes(error.status)) {
    return 'Liên kết này không còn hiệu lực. Vui lòng yêu cầu liên kết mới.'
  }
  if (error.status === 403) {
    return 'Tài khoản này chưa thể đăng nhập. Vui lòng liên hệ hỗ trợ.'
  }
  return fallbackByAction[action]
}

export function shouldConfirmPasswordResetEmail(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code?: unknown }).code ?? '')
    if (code.startsWith('auth/')) return code === 'auth/user-not-found'
  }
  return error instanceof ApiError &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 429
}
