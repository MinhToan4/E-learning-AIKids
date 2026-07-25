/**
 * environment.ts
 *
 * Centralize tất cả biến môi trường của frontend.
 * - Dev default: StoryMee Hub Gateway tại port 5100.
 *   Để dùng local Fastify (port 4000) set VITE_API_URL=http://localhost:4000
 * - Production/Staging: VITE_API_URL bắt buộc.
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

if (import.meta.env.PROD && !configuredApiUrl) {
  throw new Error(
    'VITE_API_URL is required for production builds. Configure it in the deployment environment.',
  )
}

/**
 * Dev default: StoryMee Hub Gateway (port 5100).
 * Để dùng local Fastify (port 4000) set VITE_API_URL=http://localhost:4000
 * Production / staging phải set VITE_API_URL đến gateway origin.
 */
const resolvedApiUrl = configuredApiUrl || 'http://localhost:5100'

function isLocalFastify(origin: string): boolean {
  try {
    const url = new URL(origin)
    // Chỉ treat là local Fastify khi VITE_API_URL tường minh trỏ đến port 4000
    return Boolean(configuredApiUrl) && url.port === '4000'
  } catch {
    return false
  }
}

export const environment = Object.freeze({
  name: resolveEnvironment(),
  apiBaseUrl: normalizeOrigin(resolvedApiUrl, 'VITE_API_URL'),
  /** true khi gọi local Fastify — không remap paths sang /api/v1/... */
  isLocalApi: isLocalFastify(resolvedApiUrl),
  storagePublicUrl: normalizeOrigin(
    import.meta.env.VITE_STORAGE_PUBLIC_URL?.trim() || 'https://storage.storymee.com',
    'VITE_STORAGE_PUBLIC_URL',
  ),
})
