export interface VersionData {
  buildId: string
  buildTime?: string
  timestamp?: number
}

export interface VersionCheckerOptions {
  checkIntervalMs?: number
  reloadThrottleMs?: number
  versionUrl?: string
  storageKey?: string
  reload?: () => void
  onUpdateDetected?: (newBuildId: string, oldBuildId: string) => void
}

export const DEFAULT_CHECK_INTERVAL_MS = 300_000 // 5 minutes
export const DEFAULT_RELOAD_THROTTLE_MS = 15_000 // 15 seconds
export const DEFAULT_RELOAD_STORAGE_KEY = 'app_version_reload'

let currentBuildId: string | null = null

export function getCurrentBuildId(): string | null {
  return currentBuildId
}

export function setCurrentBuildId(id: string | null): void {
  currentBuildId = id
}

export function reloadPage(
  reloadFn?: () => void,
  storageKey = DEFAULT_RELOAD_STORAGE_KEY,
  throttleMs = DEFAULT_RELOAD_THROTTLE_MS,
): boolean {
  try {
    const lastReload = sessionStorage.getItem(storageKey)
    const now = Date.now()
    if (lastReload && now - Number(lastReload) < throttleMs) {
      return false
    }
    sessionStorage.setItem(storageKey, String(now))
  } catch {
    // Storage access might be restricted; proceed with reload
  }

  if (reloadFn) {
    reloadFn()
  } else if (typeof window !== 'undefined' && window.location?.reload) {
    window.location.reload()
  }
  return true
}

export async function fetchVersion(versionUrl = '/version.json'): Promise<VersionData | null> {
  try {
    const separator = versionUrl.includes('?') ? '&' : '?'
    const res = await fetch(`${versionUrl}${separator}t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    })
    if (!res.ok) return null
    const data = (await res.json()) as VersionData
    if (data && typeof data.buildId === 'string') {
      return data
    }
  } catch {
    // Network errors or offline mode are handled silently
  }
  return null
}

export async function checkVersion(options?: VersionCheckerOptions): Promise<boolean> {
  const versionUrl = options?.versionUrl ?? '/version.json'
  const data = await fetchVersion(versionUrl)
  if (!data) return false

  // First fetch sets the current build ID
  if (currentBuildId === null) {
    currentBuildId = data.buildId
    return false
  }

  // Same version, no action needed
  if (data.buildId === currentBuildId) {
    return false
  }

  // Dev mode should not auto reload
  if (currentBuildId === 'dev') {
    return false
  }

  // Different version detected in production
  if (options?.onUpdateDetected) {
    options.onUpdateDetected(data.buildId, currentBuildId)
  }

  reloadPage(options?.reload, options?.storageKey, options?.reloadThrottleMs)
  return true
}

export function initVersionChecker(options?: VersionCheckerOptions): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {}
  }

  // Fetch initial version immediately
  void checkVersion(options)

  // Listen for visibility change (e.g. user switching back to tab/app)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      void checkVersion(options)
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Periodic polling every 5 minutes (default)
  const intervalMs = options?.checkIntervalMs ?? DEFAULT_CHECK_INTERVAL_MS
  const timerId = setInterval(() => {
    void checkVersion(options)
  }, intervalMs)

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    clearInterval(timerId)
  }
}
