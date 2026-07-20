/**
 * Standardised API response helpers.
 * All API responses follow: { success, message, data, error, timestamp }
 * Pattern from vidtory-b2b-api ResponseInterceptor.
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T | null
  error: string | null
  timestamp: string
}

export function apiOk<T>(data: T, message = 'Thành công'): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    error: null,
    timestamp: new Date().toISOString(),
  }
}

export function apiCreated<T>(data: T, message = 'Tạo thành công'): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    error: null,
    timestamp: new Date().toISOString(),
  }
}

export function apiError(message: string, error?: string | null): ApiResponse<null> {
  return {
    success: false,
    message,
    data: null,
    error: error ?? message,
    timestamp: new Date().toISOString(),
  }
}
