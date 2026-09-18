// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ParentSubscriptionCheckoutModal } from './ParentSubscriptionCheckoutModal'
import { api } from '@/shared/lib/api'

vi.mock('@/shared/lib/api', () => ({
  api: vi.fn(),
}))

describe('ParentSubscriptionCheckoutModal Component', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.useRealTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()

    // Mock clipboard
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
    vi.useRealTimers()
  })

  it('renders nothing when open is false', () => {
    act(() => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: false,
          onClose: vi.fn(),
        }),
      )
    })

    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  })

  it('renders modal with Soft-Clay UI, 129k package info, and AKI cat mascot', () => {
    act(() => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
          paymentCode: 'AK129K9999',
        }),
      )
    })

    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()

    // Soft-clay styling classes
    expect(dialog?.className).toContain('rounded-3xl')
    expect(dialog?.className).toContain('border-cream-300')
    expect(dialog?.className).toContain('shadow-clay')

    // Header & Mascot
    expect(document.body.textContent).toContain('Nâng Cấp Gói AI Kid Toàn Diện')
    expect(document.body.textContent).toContain('Mèo AKI Đồng Hành')
    const mascot = document.body.querySelector('[data-testid="aikid-modal-cat-character"]')
    expect(mascot).not.toBeNull()

    // 129k package info & benefits
    expect(document.body.textContent).toContain('129.000đ / tháng')
    expect(document.body.textContent).toContain('Chưa tới 4.500đ/ngày')
    expect(document.body.textContent).toContain('Trọn bộ Khóa học AI Kid chính thức (6 chặng)')
    expect(document.body.textContent).toContain('50 lượt tạo ảnh AI/tháng (2.000đ/lượt)')
    expect(document.body.textContent).toContain('2 trẻ em cùng học')
    expect(document.body.textContent).toContain('500 MB lưu trữ đám mây')
  })

  it('renders VietQR tab by default with accurate bank information and QR code', () => {
    act(() => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
          paymentCode: 'AK129K8888',
        }),
      )
    })

    // Active tab is VietQR
    const vietQrTab = document.body.querySelector('#tab-vietqr')
    expect(vietQrTab?.getAttribute('aria-selected')).toBe('true')

    // Bank information
    expect(document.body.textContent).toContain('MBBank (Ngân hàng TMCP Quân Đội)')
    expect(document.body.textContent).toContain('0382228888')
    expect(document.body.textContent).toContain('CONG TY CONG NGHE GIAO DUC AI KIDS')
    expect(document.body.textContent).toContain('129.000 đ')
    expect(document.body.textContent).toContain('AK129K8888')
    expect(document.body.textContent).toContain('Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống kích hoạt tự động')

    // VietQR image src
    const qrImage = document.body.querySelector('img[alt="VietQR AK129K8888"]') as HTMLImageElement | null
    expect(qrImage).not.toBeNull()
    expect(qrImage?.src).toContain('https://img.vietqr.io/image/MB-0382228888-compact2.png')
    expect(qrImage?.src).toContain('amount=129000')
    expect(qrImage?.src).toContain('addInfo=AK129K8888')
  })

  it('switches to Manual/Admin Support tab and sends confirmation', () => {
    act(() => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
          paymentCode: 'AK129K1234',
        }),
      )
    })

    const manualTab = document.body.querySelector('#tab-manual') as HTMLButtonElement | null
    expect(manualTab).not.toBeNull()

    act(() => {
      manualTab?.click()
    })

    // Tab is now active
    expect(manualTab?.getAttribute('aria-selected')).toBe('true')
    expect(document.body.textContent).toContain('Chuyển Khoản Trực Tiếp & Hỗ Trợ Kích Hoạt Nhanh')
    expect(document.body.textContent).toContain('Xuất Hóa Đơn Điện Tử VAT')
    expect(document.body.textContent).toContain('0382.228.888')

    // Click "Tôi đã chuyển khoản xong" button
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const confirmBtn = buttons.find((b) => b.textContent?.includes('Tôi đã chuyển khoản xong'))
    expect(confirmBtn).toBeDefined()

    act(() => {
      confirmBtn?.click()
    })

    // Feedback message appears
    expect(document.body.textContent).toContain('Đã gửi thông báo ưu tiên tới bộ phận CSKH & Admin')
  })

  it('switches to Apple Pay / Google Pay tab and handles 1-tap payment', async () => {
    vi.useFakeTimers()
    const onSuccess = vi.fn()

    act(() => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
          onSuccess,
        }),
      )
    })

    const walletsTab = document.body.querySelector('#tab-wallets') as HTMLButtonElement | null
    expect(walletsTab).not.toBeNull()

    act(() => {
      walletsTab?.click()
    })

    expect(walletsTab?.getAttribute('aria-selected')).toBe('true')
    expect(document.body.textContent).toContain('Thanh Toán Nhanh 1 Chạm Bảo Mật Cao')
    expect(document.body.textContent).toContain('Pay with Apple Pay')
    expect(document.body.textContent).toContain('Pay')

    const buttons = Array.from(document.body.querySelectorAll('button'))
    const applePayBtn = buttons.find((b) => b.textContent?.includes('Pay with Apple Pay'))
    expect(applePayBtn).toBeDefined()

    act(() => {
      applePayBtn?.click()
    })

    // Fast forward wallet processing timer
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Triggers success screen and callback
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(document.body.textContent).toContain('Chúc Mừng Ba Mẹ & Bé!')
    expect(document.body.textContent).toContain('Kích Hoạt Thành Công')
  })

  it('copies payment code and account number to clipboard', async () => {
    act(() => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
          paymentCode: 'AK129K7777',
        }),
      )
    })

    const copyAccountBtn = document.body.querySelector('button[aria-label="Sao chép số tài khoản"]') as HTMLButtonElement | null
    const copyCodeBtn = document.body.querySelector('button[aria-label="Sao chép nội dung chuyển khoản"]') as HTMLButtonElement | null

    expect(copyAccountBtn).not.toBeNull()
    expect(copyCodeBtn).not.toBeNull()

    await act(async () => {
      copyAccountBtn?.click()
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('0382228888')

    await act(async () => {
      copyCodeBtn?.click()
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('AK129K7777')
  })

  it('triggers onClose when clicking close button or pressing Escape', () => {
    const onClose = vi.fn()

    act(() => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose,
        }),
      )
    })

    // Click close button
    const closeBtn = document.body.querySelector('button[aria-label="Đóng"]') as HTMLButtonElement | null
    expect(closeBtn).not.toBeNull()

    act(() => {
      closeBtn?.click()
    })
    expect(onClose).toHaveBeenCalledTimes(1)

    // Press Escape
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('polls payment intent API and transitions to success when status becomes succeeded', async () => {
    vi.useFakeTimers()
    const onSuccess = vi.fn()
    const mockedApi = vi.mocked(api)

    mockedApi.mockResolvedValue({
      status: 'succeeded',
      paymentIntent: { status: 'succeeded', publicId: 'pi_test_129k' },
    })

    act(() => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
          onSuccess,
          publicId: 'pi_test_129k',
        }),
      )
    })

    // Advance timers by 3 seconds for polling interval
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })

    expect(mockedApi).toHaveBeenCalledWith('/api/v1/billing/payment-intents/pi_test_129k')
    expect(onSuccess).toHaveBeenCalledTimes(1)

    // Displays celebration and activated benefits
    expect(document.body.textContent).toContain('Chúc Mừng Ba Mẹ & Bé!')
    expect(document.body.textContent).toContain('Gói AI Kid 129K đã được kích hoạt thành công')
    expect(document.body.textContent).toContain('Bắt Đầu Học Ngay')
  })

  it('renders credit packs and switches between 129k plan and AI credits mode', async () => {
    act(() => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
          initialMode: 'credits',
          initialPackId: 'credits_25',
          paymentCode: 'AKCRE25K1111',
        }),
      )
    })

    // Shows credit packs UI
    expect(document.body.textContent).toContain('NẠP LƯỢT TẠO ẢNH AI DỰ PHÒNG')
    expect(document.body.textContent).toContain('Chọn Gói Lượt Tạo Ảnh Cho Bé')
    expect(document.body.textContent).toContain('10 lượt')
    expect(document.body.textContent).toContain('25 lượt')
    expect(document.body.textContent).toContain('50 lượt')
    expect(document.body.textContent).toContain('100 lượt')
    expect(document.body.textContent).toContain('200 lượt')

    // Initial pack 25 credits = 50.000 đ
    expect(document.body.textContent).toContain('50.000 đ')
    const qrImage25 = document.body.querySelector('img[alt="VietQR AKCRE25K1111"]') as HTMLImageElement | null
    expect(qrImage25).not.toBeNull()
    expect(qrImage25?.src).toContain('amount=50000')

    // Click on 200 lượt pack (320.000 đ)
    const pack200Btn = Array.from(document.body.querySelectorAll('button[role="radio"]')).find((b) =>
      b.textContent?.includes('200 lượt'),
    ) as HTMLButtonElement | undefined
    expect(pack200Btn).toBeDefined()

    act(() => {
      pack200Btn?.click()
    })

    // VietQR updates to 320000 and price updates
    expect(qrImage25?.src).toContain('amount=320000')
    expect(document.body.textContent).toContain('320.000 đ')
    expect(document.body.textContent).toContain('Tiết kiệm 20%')

    // Switch back to 129k subscription plan
    const subTab = document.body.querySelector('#product-tab-sub') as HTMLButtonElement | null
    expect(subTab).not.toBeNull()

    act(() => {
      subTab?.click()
    })

    expect(document.body.textContent).toContain('Gói Học Chuẩn Quốc Tế Cho Bé')
    expect(document.body.textContent).toContain('129.000đ / tháng')
    expect(document.body.textContent).toContain('50 lượt tạo ảnh AI/tháng')
    expect(qrImage25?.src).toContain('amount=129000')
  })

  it('handles partially_paid status by showing alert warning and updating QR with amountDue', async () => {
    vi.useFakeTimers()
    const mockedApi = vi.mocked(api)

    mockedApi.mockResolvedValue({
      status: 'partially_paid',
      paymentIntent: {
        status: 'partially_paid',
        publicId: 'pi_partial_test',
        amountPaid: 100000,
        amountDue: 29000,
      },
    })

    act(() => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
          publicId: 'pi_partial_test',
          paymentCode: 'AK129KPARTIAL',
        }),
      )
    })

    // Advance timers by 3 seconds for polling interval
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })

    // Partially paid alert warning is displayed
    const alertBox = document.body.querySelector('[role="alert"]')
    expect(alertBox).not.toBeNull()
    expect(alertBox?.textContent).toContain('Hệ thống đã nhận được 100.000 đ')
    expect(alertBox?.textContent).toContain('Đơn hàng còn thiếu 29.000 đ để kích hoạt gói')

    // VietQR image automatically updates with amountDue = 29000 while keeping paymentCode
    const qrImage = document.body.querySelector('img[alt="VietQR AK129KPARTIAL"]') as HTMLImageElement | null
    expect(qrImage).not.toBeNull()
    expect(qrImage?.src).toContain('amount=29000')
    expect(qrImage?.src).toContain('addInfo=AK129KPARTIAL')

    // Copy missing amount
    const copyDueBtn = document.body.querySelector('button[aria-label="Sao chép số tiền còn thiếu"]') as HTMLButtonElement | null
    expect(copyDueBtn).not.toBeNull()

    await act(async () => {
      copyDueBtn?.click()
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('29000')
    expect(document.body.textContent).toContain('Đã chép số tiền còn thiếu')
  })

  it('displays overpay celebration gift message when payment succeeds with overpayBonusCredits', async () => {
    vi.useFakeTimers()
    const onSuccess = vi.fn()
    const mockedApi = vi.mocked(api)

    mockedApi.mockResolvedValue({
      status: 'succeeded',
      paymentIntent: {
        status: 'succeeded',
        publicId: 'pi_overpay_test',
        overpayBonusCredits: 10,
      },
    })

    act(() => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
          onSuccess,
          publicId: 'pi_overpay_test',
        }),
      )
    })

    // Advance timers by 3 seconds for polling interval
    await act(async () => {
      vi.advanceTimersByTime(3000)
    })

    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(document.body.textContent).toContain('Chúc Mừng Ba Mẹ & Bé!')
    expect(document.body.textContent).toContain('Quà Tặng Thêm Cho Bé')
    expect(document.body.textContent).toContain(
      'Đặc biệt: Khoản tiền thừa của Ba Mẹ đã được tự động tặng thêm 10 lượt tạo ảnh AI cho bé sáng tạo!',
    )
  })
})
