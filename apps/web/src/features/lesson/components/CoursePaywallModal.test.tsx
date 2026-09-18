// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CoursePaywallModal } from './CoursePaywallModal'

describe('CoursePaywallModal Component', () => {
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

  it('renders nothing when open is false', () => {
    act(() => {
      root.render(
        createElement(CoursePaywallModal, {
          open: false,
          onClose: vi.fn(),
          onUpgrade: vi.fn(),
          onContinueFree: vi.fn(),
        }),
      )
    })

    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  })

  it('renders mode="course" with 129k benefits, title, and AKI cat mascot', () => {
    act(() => {
      root.render(
        createElement(CoursePaywallModal, {
          open: true,
          onClose: vi.fn(),
          onUpgrade: vi.fn(),
          onContinueFree: vi.fn(),
          mode: 'course',
        }),
      )
    })

    // Dialog exists
    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()

    // Title and eyebrow
    expect(document.body.textContent).toContain('Khám Phá Thế Giới AI')
    expect(document.body.textContent).toContain('Con Đã Sẵn Sàng Cho Hành Trình Mới?')
    expect(document.body.textContent).toContain('10 Quy tắc của Xưởng sáng tạo')

    // 129k price and benefits
    expect(document.body.textContent).toContain('129.000đ / tháng')
    expect(document.body.textContent).toContain('Chưa tới 4.500đ/ngày')
    expect(document.body.textContent).toContain('Trọn bộ Khóa học AI Kid chính thức')
    expect(document.body.textContent).toContain('50 lượt tạo ảnh AI sáng tạo mỗi tháng')
    expect(document.body.textContent).toContain('2 hồ sơ trẻ em trong gia đình cùng học')
    expect(document.body.textContent).toContain('Chứng chỉ hoàn thành & 500 MB lưu trữ')

    // Mascot
    const mascot = document.body.querySelector('[data-testid="aikid-modal-cat-character"]')
    expect(mascot).not.toBeNull()

    // Primary and Secondary buttons
    expect(document.body.textContent).toContain('Ba Mẹ Ơi, Mở Khóa Cho Con!')
    expect(document.body.textContent).toContain('Tiếp Tục Trải Nghiệm Miễn Phí')
  })

  it('triggers onUpgrade when clicking primary button in course mode', () => {
    const onUpgrade = vi.fn()
    act(() => {
      root.render(
        createElement(CoursePaywallModal, {
          open: true,
          onClose: vi.fn(),
          onUpgrade,
          onContinueFree: vi.fn(),
          mode: 'course',
        }),
      )
    })

    const buttons = Array.from(document.body.querySelectorAll('button'))
    const upgradeBtn = buttons.find((b) => b.textContent?.includes('Ba Mẹ Ơi, Mở Khóa Cho Con!'))
    expect(upgradeBtn).toBeDefined()

    act(() => {
      upgradeBtn?.click()
    })

    expect(onUpgrade).toHaveBeenCalledTimes(1)
  })

  it('triggers onContinueFree when clicking secondary button in course mode', () => {
    const onContinueFree = vi.fn()
    act(() => {
      root.render(
        createElement(CoursePaywallModal, {
          open: true,
          onClose: vi.fn(),
          onUpgrade: vi.fn(),
          onContinueFree,
          mode: 'course',
        }),
      )
    })

    const buttons = Array.from(document.body.querySelectorAll('button'))
    const continueBtn = buttons.find((b) => b.textContent?.includes('Tiếp Tục Trải Nghiệm Miễn Phí'))
    expect(continueBtn).toBeDefined()

    act(() => {
      continueBtn?.click()
    })

    expect(onContinueFree).toHaveBeenCalledTimes(1)
  })

  it('renders mode="credits" with refill options and buttons', () => {
    const onUpgrade = vi.fn()
    const onContinueFree = vi.fn()

    act(() => {
      root.render(
        createElement(CoursePaywallModal, {
          open: true,
          onClose: vi.fn(),
          onUpgrade,
          onContinueFree,
          mode: 'credits',
        }),
      )
    })

    expect(document.body.textContent).toContain('Bé Đã Dùng Hết Lượt Tạo Ảnh Tháng Này')
    expect(document.body.textContent).toContain('50 lượt tạo ảnh AI rồi')
    expect(document.body.textContent).toContain('50.000đ')
    expect(document.body.textContent).toContain('25 lượt tạo ảnh AI kỳ diệu bổ sung')
    expect(document.body.textContent).toContain('Bảng vẽ tay tự do không giới hạn')

    const buttons = Array.from(document.body.querySelectorAll('button'))
    const refillBtn = buttons.find((b) => b.textContent?.includes('Nạp Thêm 25 Lượt (50K)'))
    const drawBtn = buttons.find((b) => b.textContent?.includes('Tiếp Tục Vẽ Tay Miễn Phí'))

    expect(refillBtn).toBeDefined()
    expect(drawBtn).toBeDefined()

    act(() => {
      refillBtn?.click()
    })
    expect(onUpgrade).toHaveBeenCalledTimes(1)

    act(() => {
      drawBtn?.click()
    })
    expect(onContinueFree).toHaveBeenCalledTimes(1)
  })

  it('displays custom courseTitle if provided', () => {
    act(() => {
      root.render(
        createElement(CoursePaywallModal, {
          open: true,
          onClose: vi.fn(),
          onUpgrade: vi.fn(),
          onContinueFree: vi.fn(),
          courseTitle: 'Đảo Hoạ Sĩ Kỳ Diệu',
        }),
      )
    })

    expect(document.body.textContent).toContain('Mở Khóa Đảo Hoạ Sĩ Kỳ Diệu')
  })
})
