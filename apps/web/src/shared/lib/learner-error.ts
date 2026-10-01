const TECHNICAL_ERROR_MARKERS = [
  'prisma.',
  'invocation',
  'database server',
  'error in connector',
  'ecircuitbreaker',
  'authentication failed',
  'pooler.supabase.com',
  'postgresql://',
  'stack trace',
  'syntaxerror',
  'typeerror',
  'internal server error',
  'p2023',
  'p2002',
  'p2025',
  'uuid',
  'column',
  'zoderror',
]

/**
 * Sanitize technical backend and runtime errors into warm, reassuring,
 * child-friendly explanations for learners and parents.
 */
export function learnerFriendlyError(
  cause: unknown,
  fallback = 'Úi, có chút trục trặc nhỏ rồi. Con thử bấm Thử lại hoặc quay về Trang Chủ nhé!',
): string {
  if (!cause) return fallback

  let message = ''
  if (cause instanceof Error) {
    message = cause.message.trim()
  } else if (typeof cause === 'string') {
    message = cause.trim()
  } else if (typeof cause === 'object' && cause !== null && 'message' in cause) {
    message = String((cause as any).message || '').trim()
  }

  if (!message) return fallback

  const normalized = message.toLowerCase()

  // 1. Network offline or fetch failure
  if (
    normalized.includes('failed to fetch') ||
    normalized.includes('network') ||
    normalized.includes('offline') ||
    normalized === 'fetch failed' ||
    normalized.includes('econnrefused')
  ) {
    return 'Chưa có kết nối mạng ổn định. Con hãy kiểm tra lại Wi-Fi hoặc nhờ Ba Mẹ hỗ trợ nhé!'
  }

  // 2. Technical infrastructure, database, Prisma or SQL errors
  if (TECHNICAL_ERROR_MARKERS.some((marker) => normalized.includes(marker))) {
    return 'Máy chủ đang nghỉ ngơi một chút. Dữ liệu và số sao của con vẫn được giữ an toàn tuyệt đối!'
  }

  // 3. Station or course locked / prerequisites missing
  if (
    normalized.includes('locked') ||
    normalized.includes('prerequisite') ||
    normalized.includes('not_entitled') ||
    normalized.includes('bị khóa')
  ) {
    return 'Trạm này đang chờ mở khóa! Con hãy hoàn thành các trạm trước trên bản đồ để tiếp tục nhé.'
  }

  // 4. Session expired or auth required
  if (
    normalized.includes('jwt') ||
    normalized.includes('unauthorized') ||
    normalized.includes('auth_required') ||
    normalized.includes('401')
  ) {
    return 'Phiên học của con cần được xác nhận lại. Con thử quay về Trang Chủ nhé!'
  }

  // 5. If it's already a friendly Vietnamese message without technical jargon, keep it
  if (message.length < 120 && !normalized.includes('http') && !normalized.includes('{')) {
    return message
  }

  return fallback
}
