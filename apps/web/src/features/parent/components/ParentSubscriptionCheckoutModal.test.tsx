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

    // Mock anchor click to prevent jsdom navigation error
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
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

  it('renders modal with Soft-Clay UI, 129k package info, countdown timer, and AIKI cat mascot', () => {
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

    // Soft-clay styling classes & responsive max-w-xl
    expect(dialog?.className).toContain('rounded-3xl')
    expect(dialog?.className).toContain('border-cream-300')
    expect(dialog?.className).toContain('shadow-clay')
    expect(dialog?.className).toContain('max-w-xl')

    // Header & Security Badge
    expect(document.body.textContent).toContain('Thanh Toán Gói AI Kid 129K')
    expect(document.body.textContent).toContain('Thanh toán an toàn cho phụ huynh')

    // Countdown timer & Essential info
    expect(document.body.textContent).toContain('Mã thanh toán có hiệu lực trong: 15:00')
    expect(document.body.textContent).toContain('129.000 đ')
    expect(document.body.textContent).toContain('AK129K9999')
    expect(document.body.textContent).toContain('9812723359')
    expect(document.body.textContent).toContain('Đang chờ thanh toán tự động...')
    expect(document.body.textContent).toContain('Kiểm tra ngay')
  })

  it('renders VietQR Hero with accurate bank information and QR code', () => {
    act(() => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
          paymentCode: 'AK129K8888',
        }),
      )
    })

    // Bank information
    expect(document.body.textContent).toContain('Vietcombank (Ngân hàng TMCP Ngoại thương Việt Nam)')
    expect(document.body.textContent).toContain('9812723359')
    expect(document.body.textContent).toContain('LE QUANG MINH')
    expect(document.body.textContent).toContain('Trụ sở CN Ba Đình')
    expect(document.body.textContent).toContain('129.000 đ')
    expect(document.body.textContent).toContain('AK129K8888')
    expect(document.body.textContent).toContain('Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống kích hoạt tự động')

    // VietQR image src
    const qrImage = document.body.querySelector('img[alt="VietQR AK129K8888"]') as HTMLImageElement | null
    expect(qrImage).not.toBeNull()
    expect(qrImage?.src).toContain('https://img.vietqr.io/image/VCB-9812723359-compact2.png')
    expect(qrImage?.src).toContain('amount=129000')
    expect(qrImage?.src).toContain('addInfo=AK129K8888')
    expect(qrImage?.src).toContain('accountName=LE%20QUANG%20MINH')
  })

  it('handles manual transfer confirmation and sends notification to CSKH', async () => {
    const mockedApi = vi.mocked(api)

    await act(async () => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
          paymentCode: 'AK129K1234',
        }),
      )
    })

    expect(document.body.textContent).toContain('0382.228.888')

    // Click "Tôi đã chuyển khoản xong" button
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const confirmBtn = buttons.find((b) => b.textContent?.includes('Tôi đã chuyển khoản xong'))
    expect(confirmBtn).toBeDefined()

    await act(async () => {
      confirmBtn?.click()
    })

    // Feedback message appears
    expect(document.body.textContent).toContain('Đã gửi thông báo ưu tiên tới bộ phận CSKH & Admin')
    expect(mockedApi).toHaveBeenCalledWith(
      '/api/v1/billing/payment-intents/pi_ak129k1234/customer-confirm',
      { method: 'POST' },
    )
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
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('9812723359')

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

    expect(document.body.textContent).toContain('Thanh Toán Gói AI Kid 129K')
    expect(document.body.textContent).toContain('129.000 đ')
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

  it('downloads QR code and copies full payment info correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['fake-png-data'], { type: 'image/png' })),
    })
    const createObjectURLSpy = vi.fn().mockReturnValue('blob:http://localhost/fake-qr')
    const revokeObjectURLSpy = vi.fn()
    window.URL.createObjectURL = createObjectURLSpy
    window.URL.revokeObjectURL = revokeObjectURLSpy

    act(() => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
          paymentCode: 'AK129K9999',
        }),
      )
    })

    const downloadBtn = Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Tải mã QR về máy'),
    )
    expect(downloadBtn).toBeDefined()

    await act(async () => {
      downloadBtn?.click()
    })
    expect(global.fetch).toHaveBeenCalled()

    // Test Copy All button
    const copyAllBtn = Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Sao chép toàn bộ thông tin'),
    )
    expect(copyAllBtn).toBeDefined()

    await act(async () => {
      copyAllBtn?.click()
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Vietcombank'),
    )
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('9812723359'),
    )
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('LE QUANG MINH'),
    )
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('Trụ sở CN Ba Đình'),
    )
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('AK129K9999'),
    )
  })

  it('handles countdown timer and refreshes payment code when expiring', async () => {
    vi.useFakeTimers()
    act(() => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
        }),
      )
    })

    expect(document.body.textContent).toContain('Mã thanh toán có hiệu lực trong: 15:00')

    // Advance 1 second -> 14:59
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(document.body.textContent).toContain('14:59')

    // Advance 891 seconds (total 892s -> 8s left)
    act(() => {
      vi.advanceTimersByTime(891000)
    })
    expect(document.body.textContent).toContain('00:08')
    expect(document.body.textContent).toContain('Mã thanh toán sắp hết hạn')

    // Click "Làm mới mã thanh toán"
    const refreshBtn = Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Làm mới mã thanh toán'),
    )
    expect(refreshBtn).toBeDefined()

    act(() => {
      refreshBtn?.click()
    })

    // Resets to 15:00
    expect(document.body.textContent).toContain('15:00')
    expect(document.body.textContent).not.toContain('Mã thanh toán sắp hết hạn')
  })

  it('initializes checkout on backend when opened in sub and credits modes', async () => {
    const mockedApi = vi.mocked(api)
    mockedApi.mockResolvedValueOnce({
      checkout: { publicId: 'pi_server_sub_123', paymentCode: 'AK129K9999' },
    })

    await act(async () => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
          defaultPlanId: 'aikids_official_129k',
        }),
      )
    })

    expect(mockedApi).toHaveBeenCalledWith(
      '/api/v1/billing/me/checkout',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"plan":"aikids_official_129k"'),
      }),
    )

    // Render in credits mode
    mockedApi.mockClear()
    mockedApi.mockResolvedValueOnce({
      checkout: { publicId: 'pi_server_cred_456' },
      data: { paymentIntent: { publicId: 'pi_server_cred_456' } },
    })

    await act(async () => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
          initialMode: 'credits',
          initialPackId: 'credits_50',
        }),
      )
    })

    expect(mockedApi).toHaveBeenCalledWith(
      '/api/v1/billing/me/credit-packs/checkout',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"packId":"credits_50"'),
      }),
    )
  })

  it('toggles between dynamic VietQR and original Vietcombank QR views', async () => {
    act(() => {
      root.render(
        createElement(ParentSubscriptionCheckoutModal, {
          open: true,
          onClose: vi.fn(),
          paymentCode: 'AK129K5555',
        }),
      )
    })

    // Initially shows dynamic QR
    const dynamicImg = document.body.querySelector('img[alt="VietQR AK129K5555"]') as HTMLImageElement | null
    expect(dynamicImg).not.toBeNull()
    expect(dynamicImg?.src).toContain('https://img.vietqr.io/image/VCB-9812723359-compact2.png')

    // Click original QR tab button
    const originalTabBtn = Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Ảnh QR Vietcombank gốc'),
    )
    expect(originalTabBtn).toBeDefined()

    await act(async () => {
      originalTabBtn?.click()
    })

    const originalImg = document.body.querySelector('img[alt="Ảnh QR Vietcombank gốc LE QUANG MINH"]') as HTMLImageElement | null
    expect(originalImg).not.toBeNull()
    expect(originalImg?.src).toContain('/images/qr-lequangminh-vcb.png')

    // Click dynamic QR tab button to switch back
    const dynamicTabBtn = Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Mã QR tự động (Napas 24/7)'),
    )
    expect(dynamicTabBtn).toBeDefined()

    await act(async () => {
      dynamicTabBtn?.click()
    })

    const switchedBackImg = document.body.querySelector('img[alt="VietQR AK129K5555"]') as HTMLImageElement | null
    expect(switchedBackImg).not.toBeNull()
  })
})
