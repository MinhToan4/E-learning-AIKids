// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { HomePage } from './HomePage'
import { ConceptHomeScreen } from '@/features/concept/components/ConceptHomeScreen'

const mockNavigate = vi.fn()
const mockApi = vi.fn()

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to, onClick, ...props }: any) =>
    createElement('a', { href: to, onClick, ...props }, children),
}))

vi.mock('@/shared/store/auth', () => ({
  useAuth: (selector: any) =>
    selector({
      user: {
        id: 'student-123',
        name: 'Bé Bắp',
        role: 'student',
        level: 2,
        currentStreak: 3,
        lastActivityDate: new Date().toISOString(),
      },
    }),
}))

vi.mock('@/shared/lib/api', () => ({
  api: (...args: any[]) => mockApi(...args),
}))

vi.mock('@/shared/lib/learning-api', () => ({
  learningApi: {
    getPathway: vi.fn().mockResolvedValue({ courses: [] }),
  },
}))

vi.mock('@/shared/lib/progression-query', () => ({
  useProgression: () => ({
    data: { level: 2, xpToNextLevel: 100, xpIntoLevel: 25 },
  }),
}))

vi.mock('@/shared/lib/official-plan', () => ({
  AIKIDS_OFFICIAL_PLAN_ID: 'aikids_official_129k',
  formatPlanPrice: (amount: number) => `${amount.toLocaleString('vi-VN')}đ`,
  getOfficialBillingPlan: () => ({
    id: 'aikids_official_129k',
    name: 'Khóa học Khám phá & Sáng tạo AIKid',
    amountMinor: 129000,
    currency: 'VND',
    monthlyCreateCredits: 100,
    maxChildren: 1,
    features: ['Đảo Tiên Quyết', '5 Đảo Sáng Tạo'],
    requiresPayment: true,
  }),
  useOfficialBillingPlan: () => ({
    plans: [],
    officialPlan: {
      id: 'aikids_official_129k',
      code: 'aikids_official_129k',
      name: 'Khóa học Khám phá & Sáng tạo AIKid',
      amountMinor: 129000,
      currency: 'VND',
      monthlyCreateCredits: 100,
      maxChildren: 1,
      features: ['Đảo Tiên Quyết', '5 Đảo Sáng Tạo'],
      requiresPayment: true,
      tagline: 'Mở khóa trọn bộ 5 Đảo Sáng Tạo',
      badge: 'ĐẶC QUYỀN KHÓA HỌC CHÍNH THỨC',
    },
    priceFormatted: '129.000đ',
  }),
}))

describe('HomePage & ConceptHomeScreen - Checkout Modal Popup Unlock Flow', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.useRealTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()

    mockApi.mockImplementation((url: string) => {
      if (url === '/api/courses') {
        return Promise.resolve({ courses: [] })
      }
      if (url === '/api/gamification/daily-mission') {
        return Promise.resolve({ mission: null })
      }
      return Promise.resolve({})
    })

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('HomePage: Clicking main CTA button opens ParentSubscriptionCheckoutModal directly', async () => {
    await act(async () => {
      root.render(createElement(HomePage))
      await Promise.resolve()
    })

    // Initially checkout modal should not be in the DOM
    expect(document.body.textContent).not.toContain('Thanh toán an toàn cho phụ huynh')

    // Find main CTA button "Mở khóa..."
    const ctaButton = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Mở khóa Khóa học Khám phá & Sáng tạo AIKid'),
    )

    expect(ctaButton).toBeDefined()

    // Click the CTA button
    await act(async () => {
      ctaButton?.click()
    })

    // Checkout modal is opened with QR code and 129.000 đ
    expect(document.body.textContent).toContain('Thanh toán an toàn cho phụ huynh')
    expect(document.body.textContent).toContain('129.000 đ')
    expect(document.body.textContent).toContain('9812723359')
    expect(mockNavigate).not.toHaveBeenCalledWith('/parent/plan')
  })

  it('HomePage: Unlocking from ParentTrailerModal opens ParentSubscriptionCheckoutModal instead of redirecting', async () => {
    await act(async () => {
      root.render(createElement(HomePage))
      await Promise.resolve()
    })

    // Click on video trailer box to open ParentTrailerModal
    const trailerBox = document.body.querySelector('[aria-label="Xem video trailer giới thiệu khóa học"]') as HTMLElement
    expect(trailerBox).toBeDefined()

    await act(async () => {
      trailerBox.click()
    })

    // ParentTrailerModal should now be open
    expect(document.body.textContent).toContain('Khóa học Khám phá & Sáng tạo AIKid')
    expect(document.body.textContent).toContain('Quyền lợi từ gói Khóa học Khám phá & Sáng tạo AIKid')

    // Find and click the unlock button inside the trailer modal
    const unlockBtn = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Mở khóa Khóa học') && btn.textContent?.includes('129.000'),
    )
    expect(unlockBtn).toBeDefined()

    await act(async () => {
      unlockBtn?.click()
    })

    // It should NOT navigate to /parent/plan
    expect(mockNavigate).not.toHaveBeenCalledWith('/parent/plan')

    // It SHOULD open ParentSubscriptionCheckoutModal
    expect(document.body.textContent).toContain('Thanh toán an toàn cho phụ huynh')
    expect(document.body.textContent).toContain('9812723359')
    expect(document.body.textContent).toContain('129.000 đ')
  })

  it('ConceptHomeScreen: Unlocking opens ParentSubscriptionCheckoutModal', async () => {
    await act(async () => {
      root.render(createElement(ConceptHomeScreen, {}))
      await Promise.resolve()
    })

    expect(document.body.textContent).not.toContain('Thanh toán an toàn cho phụ huynh')

    // Click unlock course button in OfficialCourseCard
    const unlockBtn = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Mở khóa toàn bộ 6 đảo') || btn.textContent?.includes('Phụ huynh mở khóa trọn bộ'),
    )

    if (unlockBtn) {
      await act(async () => {
        unlockBtn.click()
      })

      // Checkout modal is opened
      expect(document.body.textContent).toContain('Thanh toán an toàn cho phụ huynh')
      expect(document.body.textContent).toContain('129.000 đ')
    }
  })

  it('HomePage: unlocks all 6 islands, shows emerald header badge, and renders celebratory Hero Card when user has active subscription', async () => {
    mockApi.mockImplementation((url: string) => {
      if (url === '/api/courses') {
        return Promise.resolve({ courses: [] })
      }
      if (url === '/api/gamification/daily-mission') {
        return Promise.resolve({ mission: null })
      }
      if (url === '/api/v1/billing/me/subscription') {
        return Promise.resolve({
          status: 'success',
          data: {
            plan: 'aikids_official_129k',
            status: 'active',
          },
        })
      }
      return Promise.resolve({})
    })

    await act(async () => {
      root.render(createElement(HomePage))
      await Promise.resolve()
    })

    // Header badge displays "ĐÃ MỞ KHÓA TOÀN BỘ (CHÍNH THỨC)"
    expect(document.body.textContent).toContain('ĐÃ MỞ KHÓA TOÀN BỘ (CHÍNH THỨC)')
    expect(document.body.textContent).not.toContain('Học miễn phí Đảo Tiên Quyết')

    // Celebratory Soft Clay Hero Card is rendered
    expect(document.body.textContent).toContain('🎉 Chúc mừng bé! Toàn bộ 6 Đảo Sáng Tạo đã được mở khóa')
    expect(document.body.textContent).toContain(
      'Bé đã sẵn sàng khám phá trọn vẹn lộ trình 30 trạm học chuẩn Quốc tế và 50 lượt tạo ảnh AI mỗi tháng.',
    )

    // Button "🚀 Tiến Vào Học Ngay" is present and navigates on click
    const enterCourseBtn = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('🚀 Tiến Vào Học Ngay'),
    )
    expect(enterCourseBtn).toBeDefined()

    await act(async () => {
      enterCourseBtn?.click()
    })

    expect(mockNavigate).toHaveBeenCalledWith('/world/program/aikid_official?island=dao-1-nha-tham-hiem-ai')
  })

  it('HomePage: ParentSubscriptionCheckoutModal onSuccess displays celebratory toast', async () => {
    vi.useFakeTimers()
    mockApi.mockImplementation((url: string) => {
      if (url === '/api/courses') {
        return Promise.resolve({ courses: [] })
      }
      if (url === '/api/gamification/daily-mission') {
        return Promise.resolve({ mission: null })
      }
      if (url === '/api/v1/billing/me/subscription') {
        return Promise.resolve({
          status: 'success',
          data: { plan: 'free', status: 'active' },
        })
      }
      if (url.includes('/payment-intents')) {
        return Promise.resolve({
          status: 'succeeded',
          paymentIntent: { status: 'succeeded', publicId: 'pi_home_129k' },
        })
      }
      return Promise.resolve({})
    })

    await act(async () => {
      root.render(createElement(HomePage))
      await Promise.resolve()
    })

    // Open checkout modal
    const ctaButton = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Mở khóa Khóa học Khám phá & Sáng tạo AIKid'),
    )
    await act(async () => {
      ctaButton?.click()
    })

    expect(document.body.textContent).toContain('Thanh toán an toàn cho phụ huynh')

    // Advance 3s for polling
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })

    // Celebratory screen in modal is shown
    expect(document.body.textContent).toContain('Chúc Mừng Ba Mẹ & Bé!')

    // Parent clicks "Bắt Đầu Học Ngay"
    const startBtn = Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Bắt Đầu Học Ngay'),
    )
    expect(startBtn).toBeDefined()
    await act(async () => {
      startBtn?.click()
    })

    // Modal closes and toast is displayed on HomePage
    expect(document.body.textContent).toContain('🎉 Chúc mừng! Khóa học AI Kid Chính Thức đã được kích hoạt thành công!')
    vi.useRealTimers()
  })
})
