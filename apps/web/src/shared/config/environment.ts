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

// Dev default: StoryMee Hub Gateway (port 5100).
// Production / staging must set VITE_API_URL to the gateway origin.
const resolvedApiUrl = configuredApiUrl || 'http://localhost:5100'

function isLocalFastify(origin: string): boolean {
  try {
    const url = new URL(origin)
    // Only treat it as local Fastify if VITE_API_URL explicitly targets port 4000
    return Boolean(configuredApiUrl) && (url.port === '4000')
  } catch {
    return false
  }
}

export const environment = Object.freeze({
  name: resolveEnvironment(),
  apiBaseUrl: normalizeOrigin(resolvedApiUrl, 'VITE_API_URL'),
  // true khi gọi local Fastify — không remap paths sang /api/v1/...
  isLocalApi: isLocalFastify(resolvedApiUrl),
  storagePublicUrl: normalizeOrigin(
    import.meta.env.VITE_STORAGE_PUBLIC_URL?.trim() || 'https://storage.storymee.com',
    'VITE_STORAGE_PUBLIC_URL',
  ),
})
