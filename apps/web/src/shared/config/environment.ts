/**
 * environment.ts
 *
 * Centralize tất cả biến môi trường của frontend.
 *
 * Hai chế độ API:
 * 1. nginx-proxy (Docker): VITE_API_URL rỗng → FE gọi /api/* relative,
 *    nginx.conf proxy_pass đến container api:4000. apiBaseUrl = '' (same-origin).
 * 2. Direct URL: VITE_API_URL=http://localhost:4000 (dev) hoặc https://api.example.com (staging/prod).
 */

type AppEnvironment = 'development' | 'staging' | 'production'

function normalizeOrigin(value: string, variableName: string) {
  const normalized = value.trim().replace(/\/+$/, '')
  let url: URL
  try {
    url = new URL(normalized)
  } catch {
    throw new Error(`${variableName} must be an absolute http(s) URL`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${variableName} must use http or https`)
  }
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${variableName} must be an origin without a path, query or hash`)
  }
  return url.origin
}

function resolveEnvironment(): AppEnvironment {
  const configured = import.meta.env.VITE_APP_ENV?.trim().toLowerCase()
  if (configured === 'production' || configured === 'staging' || configured === 'development') {
    return configured
  }
  return import.meta.env.PROD ? 'production' : 'development'
}

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

/**
 * Khi VITE_API_URL rỗng trong PROD build (Docker nginx-proxy mode):
 * - KHÔNG throw — đây là cấu hình hợp lệ được thiết kế trong docker-compose.yml.
 * - nginx.conf proxy_pass /api/ → http://api:4000/api/ bên trong Docker network.
 * - FE dùng same-origin (apiBaseUrl=''), fetch('/api/...') hoạt động bình thường.
 */
if (import.meta.env.PROD && !configuredApiUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    '[environment] VITE_API_URL is not set. Running in nginx-proxy mode: ' +
    'all /api/* requests will be proxied by nginx to the API container.',
  )
}

function resolveApiBaseUrl(): string {
  if (configuredApiUrl) {
    return normalizeOrigin(configuredApiUrl, 'VITE_API_URL')
  }
  if (!import.meta.env.PROD) {
    // Dev local: fallback về StoryMee Hub Gateway
    return 'http://localhost:5100'
  }
  // Docker nginx-proxy mode: same-origin, nginx xử lý /api/* proxy
  return ''
}

function isLocalFastify(): boolean {
  const apiMode = import.meta.env.VITE_API_MODE?.trim().toLowerCase()
  if (apiMode === 'standalone') return true
  if (apiMode === 'gateway') return false

  if (!configuredApiUrl) {
    // nginx-proxy mode: gọi Fastify của repo này thông qua nginx → treat như local
    return import.meta.env.PROD
  }
  try {
    const url = new URL(configuredApiUrl)
    // Chỉ treat là local Fastify khi VITE_API_URL tường minh trỏ đến port 4000
    return url.port === '4000'
  } catch {
    return false
  }
}

const resolvedApiBaseUrl = resolveApiBaseUrl()

export const environment = Object.freeze({
  name: resolveEnvironment(),
  apiBaseUrl: resolvedApiBaseUrl,
  /** true khi gọi Fastify của repo này — không remap paths sang gateway /api/v1/... */
  isLocalApi: isLocalFastify(),
  storagePublicUrl: normalizeOrigin(
    import.meta.env.VITE_STORAGE_PUBLIC_URL?.trim() || 'https://storage.storymee.com',
    'VITE_STORAGE_PUBLIC_URL',
  ),
})
