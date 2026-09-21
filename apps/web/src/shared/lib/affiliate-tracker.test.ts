import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getAffiliateRef,
  recordAffiliateClick,
  initAffiliateTracker,
} from './affiliate-tracker'
import { normalizeAuthGatewayRequest } from './normalizers/auth-normalizer'

let mockStorage: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = String(val)
  },
  removeItem: (key: string) => {
    delete mockStorage[key]
  },
  clear: () => {
    mockStorage = {}
  },
  get length() {
    return Object.keys(mockStorage).length
  },
  key: (i: number) => Object.keys(mockStorage)[i] ?? null,
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
})

describe('Affiliate Tracker', () => {
  beforeEach(() => {
    // Reset URL to clean state
    window.history.pushState({}, '', '/')
    // Clear cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`)
    })
    // Clear localStorage
    mockStorage = {}
    vi.restoreAllMocks()
  })

  afterEach(() => {
    mockStorage = {}
    vi.restoreAllMocks()
  })

  describe('getAffiliateRef', () => {
    it('returns null when no ref is present in query, cookies, or localStorage', () => {
      expect(getAffiliateRef()).toBeNull()
    })

    it('extracts ref from query parameter ?ref=', () => {
      window.history.pushState({}, '', '/?ref=AFFILIATE_123')
      expect(getAffiliateRef()).toBe('AFFILIATE_123')
    })

    it('extracts ref from query parameter ?aff_ref=', () => {
      window.history.pushState({}, '', '/?aff_ref=AFF_REF_456')
      expect(getAffiliateRef()).toBe('AFF_REF_456')
    })

    it('extracts ref from query parameter ?aff=', () => {
      window.history.pushState({}, '', '/?aff=AFF_789')
      expect(getAffiliateRef()).toBe('AFF_789')
    })

    it('extracts ref from cookie aff_ref when no query param is present', () => {
      window.history.pushState({}, '', '/')
      document.cookie = 'aff_ref=COOKIE_PARTNER_99; path=/'
      expect(getAffiliateRef()).toBe('COOKIE_PARTNER_99')
    })

    it('extracts ref from localStorage when neither query nor cookie is present', () => {
      window.history.pushState({}, '', '/')
      localStorage.setItem('aff_ref', 'STORAGE_PARTNER_88')
      expect(getAffiliateRef()).toBe('STORAGE_PARTNER_88')
    })

    it('prioritizes query param over cookie and localStorage', () => {
      window.history.pushState({}, '', '/?ref=QUERY_WINNER')
      document.cookie = 'aff_ref=COOKIE_LOSER; path=/'
      localStorage.setItem('aff_ref', 'STORAGE_LOSER')
      expect(getAffiliateRef()).toBe('QUERY_WINNER')
    })
  })

  describe('recordAffiliateClick', () => {
    it('sends tracking beacon via navigator.sendBeacon when available', () => {
      const sendBeaconMock = vi.fn().mockReturnValue(true)
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      })

      recordAffiliateClick('PARTNER_BEACON')

      expect(sendBeaconMock).toHaveBeenCalledTimes(1)
      const [url, blob] = sendBeaconMock.mock.calls[0]
      expect(url).toContain('/api/track/click')
      expect(blob).toBeInstanceOf(Blob)
    })

    it('falls back to fetch when navigator.sendBeacon is unavailable', () => {
      Object.defineProperty(navigator, 'sendBeacon', {
        value: undefined,
        writable: true,
        configurable: true,
      })
      const fetchMock = vi.fn().mockResolvedValue(new Response('ok'))
      globalThis.fetch = fetchMock

      recordAffiliateClick('PARTNER_FETCH')

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, options] = fetchMock.mock.calls[0]
      expect(url).toContain('/api/track/click')
      expect(options.method).toBe('POST')
      const parsedBody = JSON.parse(options.body as string)
      expect(parsedBody.ref_code).toBe('PARTNER_FETCH')
    })

    it('does nothing when refCode is empty', () => {
      const sendBeaconMock = vi.fn()
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      })
      recordAffiliateClick('')
      expect(sendBeaconMock).not.toHaveBeenCalled()
    })
  })

  describe('initAffiliateTracker', () => {
    it('stores cookie, localStorage aff_ref, localStorage aff_ref_data, and sends beacon when URL has ref', () => {
      const sendBeaconMock = vi.fn().mockReturnValue(true)
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      })

      window.history.pushState({}, '', '/?ref=CAMPAIGN_2026')
      initAffiliateTracker()

      // Check cookie
      expect(document.cookie).toContain('aff_ref=CAMPAIGN_2026')

      // Check localStorage
      expect(localStorage.getItem('aff_ref')).toBe('CAMPAIGN_2026')
      const storedData = localStorage.getItem('aff_ref_data')
      expect(storedData).toBeTruthy()
      const parsedData = JSON.parse(storedData!)
      expect(parsedData.ref_code).toBe('CAMPAIGN_2026')

      // Check tracking beacon call
      expect(sendBeaconMock).toHaveBeenCalledTimes(1)
    })

    it('syncs existing ref to cookie if found in localStorage without sending duplicate beacon', () => {
      const sendBeaconMock = vi.fn().mockReturnValue(true)
      Object.defineProperty(navigator, 'sendBeacon', {
        value: sendBeaconMock,
        writable: true,
        configurable: true,
      })

      window.history.pushState({}, '', '/')
      localStorage.setItem('aff_ref', 'EXISTING_STORED_REF')

      initAffiliateTracker()

      expect(document.cookie).toContain('aff_ref=EXISTING_STORED_REF')
      expect(sendBeaconMock).not.toHaveBeenCalled()
    })
  })

  describe('auth normalizer integration with refCode', () => {
    it('forwards refCode when calling /api/parent/subscription POST', () => {
      const req = normalizeAuthGatewayRequest('/api/parent/subscription', {
        method: 'POST',
        body: JSON.stringify({
          planCode: 'pro-yearly',
          refCode: 'AFF_PARENT_01',
        }),
      })

      expect(req).not.toBeNull()
      expect(req?.path).toBe('/api/v1/billing/me/checkout')
      const payload = JSON.parse(req?.options.body as string)
      expect(payload.plan).toBe('pro-yearly')
      expect(payload.refCode).toBe('AFF_PARENT_01')
      expect(payload.idempotencyKey).toBeDefined()
    })

    it('forwards ref_code (snake_case) as refCode when calling /api/parent/subscription POST', () => {
      const req = normalizeAuthGatewayRequest('/api/parent/subscription', {
        method: 'POST',
        body: JSON.stringify({
          planCode: 'pro-yearly',
          ref_code: 'AFF_SNAKE_02',
        }),
      })

      expect(req).not.toBeNull()
      expect(req?.path).toBe('/api/v1/billing/me/checkout')
      const payload = JSON.parse(req?.options.body as string)
      expect(payload.refCode).toBe('AFF_SNAKE_02')
    })

    it('does not include refCode when not provided', () => {
      const req = normalizeAuthGatewayRequest('/api/parent/subscription', {
        method: 'POST',
        body: JSON.stringify({
          planCode: 'basic',
        }),
      })

      expect(req).not.toBeNull()
      expect(req?.path).toBe('/api/v1/billing/me/checkout')
      const payload = JSON.parse(req?.options.body as string)
      expect(payload.refCode).toBeUndefined()
    })
  })
})
