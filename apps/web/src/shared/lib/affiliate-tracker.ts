import { environment } from '../config/environment'

const COOKIE_NAME = 'aff_ref'
const STORAGE_KEY = 'aff_ref'
const STORAGE_DATA_KEY = 'aff_ref_data'
const COOKIE_EXPIRE_DAYS = 30

function parseCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  try {
    const prefix = `${name}=`
    const cookies = document.cookie.split(';')
    for (let c of cookies) {
      c = c.trim()
      if (c.indexOf(prefix) === 0) {
        return decodeURIComponent(c.substring(prefix.length))
      }
    }
  } catch {
    // Ignore cookie parsing error
  }
  return null
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return
  try {
    const maxAge = days * 24 * 60 * 60
    const expires = new Date(Date.now() + maxAge * 1000).toUTCString()
    const isHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:'
    const secure = isHttps ? '; Secure' : ''
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; expires=${expires}; path=/; SameSite=Lax${secure}`
  } catch {
    // Ignore cookie write error
  }
}

function getQueryRef(): string | null {
  if (typeof window === 'undefined' || !window.location?.search) return null
  try {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('ref') || params.get('aff_ref') || params.get('aff') || params.get('refCode')
    if (code && code.trim()) {
      return code.trim()
    }
  } catch {
    // Ignore URL parse error
  }
  return null
}

/**
 * Lấy mã Affiliate giới thiệu hiện tại:
 * Ưu tiên 1: Query param trên URL (?ref= hoặc ?aff_ref= hoặc ?aff=)
 * Ưu tiên 2: Cookie 'aff_ref'
 * Ưu tiên 3: LocalStorage 'aff_ref'
 */
export function getAffiliateRef(): string | null {
  const queryRef = getQueryRef()
  if (queryRef) return queryRef

  const cookieRef = parseCookie(COOKIE_NAME)
  if (cookieRef && cookieRef.trim()) return cookieRef.trim()

  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && stored.trim()) return stored.trim()
    } catch {
      // Ignore localStorage read error
    }
  }

  return null
}

/**
 * Gửi click tracking beacon tới Affiliate Tracking API
 */
export function recordAffiliateClick(refCode: string): void {
  if (!refCode) return

  const cleanRef = refCode.trim()
  const baseApiUrl = (environment.affiliateApiUrl || 'http://173.249.19.167:3000').replace(/\/+$/, '')
  const endpoint = `${baseApiUrl}/api/track/click`

  const payload = JSON.stringify({
    ref_code: cleanRef,
    current_url: typeof window !== 'undefined' ? window.location?.href || '' : '',
    referrer: typeof document !== 'undefined' ? document.referrer || null : null,
  })

  // 1. Thử gửi bằng navigator.sendBeacon
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([payload], { type: 'application/json' })
      const success = navigator.sendBeacon(endpoint, blob)
      if (success) return
    } catch {
      // Fallback sang fetch nếu sendBeacon lỗi
    }
  }

  // 2. Fallback bằng fetch
  if (typeof fetch === 'function') {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Bỏ qua lỗi tracking nền, không gián đoạn app
    })
  }
}

/**
 * Khởi tạo Affiliate Tracker:
 * - Đọc refCode từ query URL (?ref=, ?aff_ref=, ?aff=).
 * - Lưu cookie aff_ref 30 ngày.
 * - Lưu localStorage aff_ref và aff_ref_data.
 * - Gửi click tracking beacon nếu phát hiện refCode mới.
 */
export function initAffiliateTracker(): void {
  if (typeof window === 'undefined') return

  const refCode = getQueryRef()

  if (refCode) {
    // 1. Lưu Cookie aff_ref 30 ngày
    setCookie(COOKIE_NAME, refCode, COOKIE_EXPIRE_DAYS)

    // 2. Lưu LocalStorage aff_ref và aff_ref_data
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, refCode)
        localStorage.setItem(
          STORAGE_DATA_KEY,
          JSON.stringify({
            ref_code: refCode,
            refCode: refCode,
            landing_url: window.location?.href || '',
            referrer: typeof document !== 'undefined' ? document.referrer || null : null,
            recorded_at: new Date().toISOString(),
          }),
        )
      } catch {
        // Ignore localStorage write error
      }
    }

    // 3. Gửi click tracking beacon
    recordAffiliateClick(refCode)
  } else {
    // Đồng bộ nếu cookie có mà storage chưa có hoặc ngược lại
    const existingRef = getAffiliateRef()
    if (existingRef) {
      setCookie(COOKIE_NAME, existingRef, COOKIE_EXPIRE_DAYS)
      if (typeof localStorage !== 'undefined') {
        try {
          if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, existingRef)
          }
        } catch {
          // Ignore
        }
      }
    }
  }

  // Gắn helper lên window để tiện kiểm tra / tích hợp bên ngoài
  if (typeof window !== 'undefined') {
    (window as unknown as { getAffiliateRef?: typeof getAffiliateRef }).getAffiliateRef = getAffiliateRef
  }
}
