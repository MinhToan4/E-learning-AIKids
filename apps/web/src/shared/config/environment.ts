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

const runtimeConfig = typeof window === 'undefined'
  ? undefined
  : window.__AIKIDS_RUNTIME_CONFIG__
const configuredApiUrl = runtimeConfig?.apiBaseUrl?.trim()
  || import.meta.env.VITE_API_URL?.trim()
const configuredStorageUrl = runtimeConfig?.storagePublicUrl?.trim()
  || import.meta.env.VITE_STORAGE_PUBLIC_URL?.trim()
const appEnvironment = resolveEnvironment()
// Browser sessions are HttpOnly, Secure and SameSite=Lax. Browser runtimes must
// use their same-origin /api proxy so the cookie belongs to the app host;
// calling dev-hub directly authenticates successfully but loses the session on
// following requests from app.aikid.vn or localhost because they are cross-site.
const useSameOriginApi =
  appEnvironment === 'production' ||
  (typeof window !== 'undefined' && import.meta.env.MODE !== 'test')

export const environment = Object.freeze({
  name: appEnvironment,
  // Empty means same-origin. Vite/nginx proxy /api/* to StoryMee Hub.
  apiBaseUrl: configuredApiUrl && !useSameOriginApi
    ? normalizeOrigin(configuredApiUrl, 'VITE_API_URL')
    : '',
  storagePublicUrl: configuredStorageUrl
    ? normalizeOrigin(configuredStorageUrl, 'storagePublicUrl')
    : '',
  // Public media URLs must also resolve when a worker consumes them outside the browser.
  mediaWorkerOrigin: configuredApiUrl
    ? normalizeOrigin(configuredApiUrl, 'VITE_API_URL')
    : typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? window.location.origin
      : 'https://dev-hub.storymee.com',
  affiliateApiUrl: (import.meta.env.VITE_AFFILIATE_API_URL as string | undefined) || '',
})
