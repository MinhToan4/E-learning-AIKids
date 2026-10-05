// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ParentPlanTab } from './ParentPlanTab'
import { api } from '@/shared/lib/api'

vi.mock('@/shared/lib/api', () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error {},
}))

describe('ParentPlanTab Component', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()

    const mockedApi = vi.mocked(api)
    mockedApi.mockImplementation((path: string) => {
      if (path === '/api/parent/plans') {
        return Promise.resolve({
          plans: [
            {
              code: 'free',
              name: 'Gói Khởi Đầu',
              tagline: 'Khởi đầu trải nghiệm',
              maxChildren: 1,
              maxOpenCoursesPerChild: 1,
              priceMonthly: 0,
              currency: 'vnd',
              features: ['1 vùng học'],
            },
            {
              code: 'aikids_official_129k',
              name: 'Gói AI Kid Chính Thức',
              tagline: 'Lộ trình toàn diện',
              maxChildren: 2,
              maxOpenCoursesPerChild: 999,
              priceMonthly: 129000,
              currency: 'vnd',
              features: ['Trọn bộ 5 đảo'],
              monthlyCreateCredits: 50,
            },
          ],
        })
      }
      if (path === '/api/parent/subscription') {
        return Promise.resolve({
          subscription: {
            planCode: 'free',
            planName: 'Gói Khởi Đầu',
            status: 'active',
            maxChildren: 1,
            maxOpenCoursesPerChild: 1,
            childCount: 1,
            seatsRemaining: 0,
            features: [],
            currentPeriodEnd: null,
          },
        })
      }
      if (path === '/api/parent/children') {
        return Promise.resolve({
          children: [
            {
              id: 'child-1',
              nickname: 'Bé Tít',
              avatarId: 'avatar-1',
              level: 1,
              xp: 50,
              active: true,
              totalStars: 5,
              completedQuests: 2,
              allowAiCreate: true,
              allowPhoto: true,
              allowExport: true,
            },
          ],
        })
      }
      if (path.includes('/courses')) {
        return Promise.resolve({ courses: [{ enrolled: true }] })
      }
      return Promise.resolve({})
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ''
  })

  it('renders dynamic Hero CTA price, name, and credits when unpurchased', async () => {
    const onOpenCheckout = vi.fn()

    await act(async () => {
      root.render(
        createElement(ParentPlanTab, {
          onOpenCheckout,
        }),
      )
    })

    // Dynamic CTA button text (no 🚀 and dynamic price/name)
    expect(document.body.textContent).toContain('Kích hoạt Gói AI Kid Chính Thức · 129.000đ')
    expect(document.body.textContent).not.toContain('🚀')
    expect(document.body.textContent).not.toContain('479.000đ')

    // Dynamic AI credit privileges
    expect(document.body.textContent).toContain('50 lượt tạo ảnh AI')
    expect(document.body.textContent).toContain('50 lượt tạo ảnh AI mỗi tháng.')

    // Click Hero CTA
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const heroBtn = buttons.find((b) =>
      b.textContent?.includes('Kích hoạt Gói AI Kid Chính Thức · 129.000đ'),
    )
    expect(heroBtn).toBeDefined()

    await act(async () => {
      heroBtn?.click()
    })

    expect(onOpenCheckout).toHaveBeenCalledWith(
      'sub',
      'aikids_official_129k',
      129000,
      'Gói AI Kid Chính Thức',
    )
  })

  it('renders updated price and benefits if plans list contains custom official plan', async () => {
    const mockedApi = vi.mocked(api)
    mockedApi.mockImplementation((path: string) => {
      if (path === '/api/parent/plans') {
        return Promise.resolve({
          plans: [
            {
              code: 'aikids_official_129k',
              name: 'Gói AI Kid VIP',
              tagline: 'VIP',
              maxChildren: 3,
              maxOpenCoursesPerChild: 999,
              priceMonthly: 199000,
              currency: 'vnd',
              features: ['VIP'],
              monthlyCreateCredits: 100,
            },
          ],
        })
      }
      if (path === '/api/parent/subscription') {
        return Promise.resolve({
          subscription: {
            planCode: 'free',
            planName: 'Gói Khởi Đầu',
            status: 'active',
            maxChildren: 1,
            maxOpenCoursesPerChild: 1,
            childCount: 0,
            seatsRemaining: 1,
            features: [],
            currentPeriodEnd: null,
          },
        })
      }
      if (path === '/api/parent/children') {
        return Promise.resolve({ children: [] })
      }
      return Promise.resolve({})
    })

    const onOpenCheckout = vi.fn()

    await act(async () => {
      root.render(
        createElement(ParentPlanTab, {
          onOpenCheckout,
        }),
      )
    })

    expect(document.body.textContent).toContain('Kích hoạt Gói AI Kid VIP · 199.000đ')
    expect(document.body.textContent).toContain('100 lượt tạo ảnh AI')
    expect(document.body.textContent).toContain('100 lượt tạo ảnh AI mỗi tháng.')

    const buttons = Array.from(document.body.querySelectorAll('button'))
    const heroBtn = buttons.find((b) =>
      b.textContent?.includes('Kích hoạt Gói AI Kid VIP · 199.000đ'),
    )
    expect(heroBtn).toBeDefined()

    await act(async () => {
      heroBtn?.click()
    })

    expect(onOpenCheckout).toHaveBeenCalledWith(
      'sub',
      'aikids_official_129k',
      199000,
      'Gói AI Kid VIP',
    )
  })

  it('safely parses subscription response when backend returns { status: "success", data: { ... } } structure', async () => {
    const mockedApi = vi.mocked(api)
    mockedApi.mockImplementation((path: string) => {
      if (path === '/api/parent/plans') {
        return Promise.resolve({
          plans: [
            {
              code: 'aikids_official_129k',
              name: 'Gói AI Kid Chính Thức',
              tagline: 'Lộ trình toàn diện',
              maxChildren: 2,
              maxOpenCoursesPerChild: 999,
              priceMonthly: 129000,
              currency: 'vnd',
              features: ['Trọn bộ 5 đảo'],
              monthlyCreateCredits: 50,
            },
          ],
        })
      }
      if (path === '/api/parent/subscription') {
        // Backend returns data object instead of subscription wrapper
        return Promise.resolve({
          status: 'success',
          data: {
            planCode: 'aikids_official_129k',
            planName: 'Gói AI Kid Chính Thức',
            status: 'active',
            maxChildren: 2,
            maxOpenCoursesPerChild: 5,
            monthlyCreateCredits: 50,
            aiCreditsRemaining: 42,
          },
        })
      }
      if (path === '/api/parent/children') {
        return Promise.resolve({
          children: [{ id: 'child-1', nickname: 'Bé Tít' }],
        })
      }
      if (path.includes('/courses')) {
        return Promise.resolve({ courses: [{ enrolled: true }] })
      }
      return Promise.resolve({})
    })

    await act(async () => {
      root.render(createElement(ParentPlanTab, {}))
    })

    // Should render active plan without throwing
    expect(document.body.textContent).toContain('GÓI ĐANG HOẠT ĐỘNG')
    expect(document.body.textContent).toContain('Gói AI Kid Chính Thức')
    expect(document.body.textContent).toContain('1/2 ghế')
    expect(document.body.textContent).toContain('Còn 42 lượt')
  })
})
