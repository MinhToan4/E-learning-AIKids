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

function isLocalBrowser(): boolean {
  if (typeof window === 'undefined') return false
  return ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
}

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const runtimeConfig = typeof window === 'undefined'
  ? undefined
  : window.__AIKIDS_RUNTIME_CONFIG__
const configuredStorageUrl = runtimeConfig?.storagePublicUrl?.trim()
  || import.meta.env.VITE_STORAGE_PUBLIC_URL?.trim()
// A production bundle served locally must stay inside the local gateway even if
// a developer machine still has an old VITE_API_URL in an ignored .env file.
const useSameOriginApi = import.meta.env.PROD && isLocalBrowser()

export const environment = Object.freeze({
  name: resolveEnvironment(),
  // Empty means same-origin. Vite/nginx proxy /api/* to StoryMee Hub.
  apiBaseUrl: configuredApiUrl && !useSameOriginApi
    ? normalizeOrigin(configuredApiUrl, 'VITE_API_URL')
    : '',
  storagePublicUrl: configuredStorageUrl
    ? normalizeOrigin(configuredStorageUrl, 'storagePublicUrl')
    : '',
})
