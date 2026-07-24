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

// Dev default: local Fastify API (port 4000).
// Production / staging must set VITE_API_URL to the gateway origin.
const resolvedApiUrl = configuredApiUrl || 'http://localhost:4000'

function isLocalhost(origin: string): boolean {
  try {
    const { hostname } = new URL(origin)
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  } catch {
    return false
  }
}

export const environment = Object.freeze({
  name: resolveEnvironment(),
  apiBaseUrl: normalizeOrigin(resolvedApiUrl, 'VITE_API_URL'),
  // true khi gọi local Fastify — không remap paths sang /api/v1/...
  isLocalApi: isLocalhost(resolvedApiUrl),
  storagePublicUrl: normalizeOrigin(
    import.meta.env.VITE_STORAGE_PUBLIC_URL?.trim() || 'https://storage.storymee.com',
    'VITE_STORAGE_PUBLIC_URL',
  ),
})
