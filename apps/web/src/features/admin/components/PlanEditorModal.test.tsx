// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PlanEditorModal } from './PlanEditorModal'
import type { PlanDef } from '../pages/AdminPage'

const mockApi = vi.fn()
vi.mock('@/shared/lib/api', () => ({
  api: (...args: unknown[]) => mockApi(...args),
}))

const samplePlan: PlanDef = {
  id: 'pro',
  name: 'Gói Cao Cấp',
  amountMinor: 99000,
  currency: 'vnd',
  monthlyCreateCredits: 20,
  maxChildren: 2,
  maxOpenCoursesPerChild: 3,
  badge: 'HOT',
  tagline: 'Lựa chọn số 1',
  features: ['Học hoạt hình AI', 'Báo cáo tiến độ'],
  requiresPayment: true,
  isActive: true,
  version: 2,
}

describe('PlanEditorModal Component', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ''
  })

  it('renders create mode without grandfathering box', () => {
    act(() => {
      root.render(
        createElement(PlanEditorModal, {
          isOpen: true,
          onClose: vi.fn(),
          onSaved: vi.fn(),
          plan: null,
          subscriberCount: 0,
        }),
      )
    })

    expect(document.body.textContent).toContain('Tạo gói bán mới')
    expect(document.body.textContent).not.toContain('Nguyên tắc bảo toàn')
  })

  it('renders edit mode with grandfathering policy and subscriber count', () => {
    act(() => {
      root.render(
        createElement(PlanEditorModal, {
          isOpen: true,
          onClose: vi.fn(),
          onSaved: vi.fn(),
          plan: samplePlan,
          subscriberCount: 15,
        }),
      )
    })

    expect(document.body.textContent).toContain('Chỉnh sửa gói bán: Gói Cao Cấp')
    expect(document.body.textContent).toContain('Nguyên tắc bảo toàn')
    expect(document.body.textContent).toContain('15 phụ huynh đang hoạt động')
    expect(document.body.textContent).toContain('Nâng cấp quyền lợi gói mới cho các khách hàng đang dùng gói này')
  })

  it('toggles applyToExistingSubscribers checkbox and submits correctly', async () => {
    mockApi.mockResolvedValueOnce({
      message: 'Đã cập nhật gói thành công',
      data: { id: 'pro', name: 'Gói Cao Cấp' },
    })

    const onSaved = vi.fn()
    const onClose = vi.fn()

    act(() => {
      root.render(
        createElement(PlanEditorModal, {
          isOpen: true,
          onClose,
          onSaved,
          plan: samplePlan,
          subscriberCount: 8,
        }),
      )
    })

    // Find and check upgrade checkbox
    const checkboxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    // Find checkbox for applyToExistingSubscribers
    let upgradeCheckbox: HTMLInputElement | null = null
    checkboxes.forEach((cb) => {
      if (cb.closest('label')?.textContent?.includes('Nâng cấp quyền lợi gói mới')) {
        upgradeCheckbox = cb
      }
    })
    expect(upgradeCheckbox).not.toBeNull()

    act(() => {
      upgradeCheckbox!.click()
    })

    // Submit form
    const form = document.querySelector('form')
    expect(form).not.toBeNull()

    await act(async () => {
      form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    expect(mockApi).toHaveBeenCalledWith(
      '/api/admin/billing/plans',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"applyToExistingSubscribers":true'),
      }),
    )
    expect(onSaved).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})
