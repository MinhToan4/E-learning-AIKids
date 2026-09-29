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
]

/** Keep infrastructure details and credentials out of parent-facing UI. */
export function parentFriendlyError(
  cause: unknown,
  fallback = 'Hệ thống đang tạm gián đoạn. Ba / Mẹ vui lòng thử lại sau ít phút.',
): string {
  if (!(cause instanceof Error)) return fallback
  const message = cause.message.trim()
  if (!message) return fallback
  const normalized = message.toLowerCase()
  if (TECHNICAL_ERROR_MARKERS.some((marker) => normalized.includes(marker))) return fallback
  if (
    normalized.includes('zoderror') ||
    normalized.includes('validation') ||
    normalized.includes('schema') ||
    normalized.includes('expected') ||
    normalized.includes('received')
  ) {
    return 'Dữ liệu phản hồi chưa đúng định dạng. Ba / Mẹ vui lòng thử lại.'
  }
  if (
    normalized.includes('failed to fetch') ||
    normalized.includes('network') ||
    normalized === 'fetch failed'
  ) {
    return 'Không thể kết nối máy chủ. Ba / Mẹ vui lòng kiểm tra mạng và thử lại.'
  }
  return message
}
