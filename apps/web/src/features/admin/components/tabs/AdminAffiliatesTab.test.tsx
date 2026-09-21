// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AdminAffiliatesTab } from './AdminAffiliatesTab'
import { AdminPage } from '../../pages/AdminPage'

const mockApi = vi.fn()
vi.mock('@/shared/lib/api', () => ({
  api: Object.assign((...args: unknown[]) => mockApi(...args), {
    get: (...args: unknown[]) => mockApi(...args),
    post: (...args: unknown[]) => mockApi(...args),
    put: (...args: unknown[]) => mockApi(...args),
    delete: (...args: unknown[]) => mockApi(...args),
  }),
}))

describe('AdminAffiliatesTab & AdminPage Affiliates integration', () => {
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

  it('renders 5 stat cards, CTV list, and opens create modal', async () => {
    mockApi.mockImplementation((url: string) => {
      if (url.includes('/api/v1/billing/admin/affiliate-stats')) {
        return Promise.resolve({
          total_affiliates: 12,
          total_active_affiliates: 10,
          total_orders: 85,
          total_revenue_minor: 15600000,
          total_commission_minor: 1560000,
          pending_commission_minor: 320000,
          approved_commission_minor: 480000,
          paid_commission_minor: 760000,
          rejected_commission_minor: 0,
        })
      }
      if (url.includes('/api/v1/billing/admin/affiliates')) {
        return Promise.resolve([
          {
            id: 'aff-1',
            name: 'Nguyễn Văn Minh',
            phone: '0988111222',
            email: 'minh.ctv@gmail.com',
            ref_code: 'MINHPRO',
            commission_rate: 10.0,
            bank_name: 'MBBank',
            bank_account: '0988111222',
            bank_account_name: 'NGUYEN VAN MINH',
            status: 'active',
            created_at: '2026-09-10T10:00:00.000Z',
            updated_at: '2026-09-10T10:00:00.000Z',
            total_orders: 5,
            total_revenue_minor: 1200000,
            total_commission_minor: 120000,
            pending_commission_minor: 30000,
            approved_commission_minor: 40000,
            paid_commission_minor: 50000,
          },
        ])
      }
      if (url.includes('/api/v1/billing/admin/affiliate-orders')) {
        return Promise.resolve([
          {
            id: 'comm-1',
            affiliate_id: 'aff-1',
            order_code: 'ORD-9988',
            payment_intent_id: 'pi-1',
            customer_name: 'Phụ huynh Hương',
            customer_phone: '0901234567',
            customer_email: 'huong@gmail.com',
            order_total_minor: 149000,
            commission_amount_minor: 14900,
            status: 'pending',
            note: null,
            is_self_referral: false,
            created_at: '2026-09-15T08:30:00.000Z',
            updated_at: '2026-09-15T08:30:00.000Z',
            affiliate_name: 'Nguyễn Văn Minh',
            affiliate_ref_code: 'MINHPRO',
          },
        ])
      }
      return Promise.resolve([])
    })

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminAffiliatesTab />
        </MemoryRouter>,
      )
    })

    // 1. Kiểm tra 5 Thẻ Thống Kê
    expect(container.textContent).toContain('Tổng số CTV')
    expect(container.textContent).toContain('12')
    expect(container.textContent).toContain('10 đang hoạt động')
    expect(container.textContent).toContain('Tổng đơn Ref')
    expect(container.textContent).toContain('85')
    expect(container.textContent).toContain('Doanh số Ref')
    expect(container.textContent).toContain('Hoa hồng chờ duyệt')
    expect(container.textContent).toContain('Đã chi trả')

    // 2. Kiểm tra Bảng Danh Sách CTV
    expect(container.textContent).toContain('MINHPRO')
    expect(container.textContent).toContain('Nguyễn Văn Minh')
    expect(container.textContent).toContain('0988111222')
    expect(container.textContent).toContain('minh.ctv@gmail.com')
    expect(container.textContent).toContain('10%')
    expect(container.textContent).toContain('MBBank')
    expect(container.textContent).toContain('Đang hoạt động')

    // 3. Mở Modal Thêm CTV Mới
    const addBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('+ Thêm CTV Mới'),
    )
    expect(addBtn).toBeDefined()

    await act(async () => {
      addBtn?.click()
    })

    expect(document.body.textContent).toContain('Thêm Cộng Tác Viên Mới')
    expect(document.body.textContent).toContain('Mã Ref (Viết hoa)')
    expect(document.body.textContent).toContain('Thông Tin Tài Khoản Nhận Hoa Hồng')
  })

  it('switches to commissions subtab and displays orders & action buttons', async () => {
    mockApi.mockImplementation((url: string) => {
      if (url.includes('/api/v1/billing/admin/affiliate-stats')) {
        return Promise.resolve({
          total_affiliates: 1,
          total_active_affiliates: 1,
          total_orders: 1,
          total_revenue_minor: 149000,
          total_commission_minor: 14900,
          pending_commission_minor: 14900,
          approved_commission_minor: 0,
          paid_commission_minor: 0,
          rejected_commission_minor: 0,
        })
      }
      if (url.includes('/api/v1/billing/admin/affiliates')) {
        return Promise.resolve([])
      }
      if (url.includes('/api/v1/billing/admin/affiliate-orders')) {
        return Promise.resolve([
          {
            id: 'comm-1',
            affiliate_id: 'aff-1',
            order_code: 'ORD-1234',
            payment_intent_id: 'pi-1',
            customer_name: 'Mẹ Lan',
            customer_phone: '0901234567',
            customer_email: 'lan@gmail.com',
            order_total_minor: 129000,
            commission_amount_minor: 12900,
            status: 'pending',
            note: null,
            is_self_referral: false,
            created_at: '2026-09-18T14:00:00.000Z',
            updated_at: '2026-09-18T14:00:00.000Z',
            affiliate_name: 'Thầy Tuấn',
            affiliate_ref_code: 'TUANVIP',
          },
        ])
      }
      return Promise.resolve([])
    })

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminAffiliatesTab />
        </MemoryRouter>,
      )
    })

    // Click chuyển sang Tab Đơn hàng & Đối soát
    const commSubTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Đơn Hàng & Đối Soát Hoa Hồng'),
    )
    expect(commSubTabBtn).toBeDefined()

    await act(async () => {
      commSubTabBtn?.click()
    })

    // Kiểm tra hiển thị đơn hàng
    expect(container.textContent).toContain('#ORD-1234')
    expect(container.textContent).toContain('Mẹ Lan')
    expect(container.textContent).toContain('TUANVIP')
    expect(container.textContent).toContain('Thầy Tuấn')
    expect(container.textContent).toContain('Chờ duyệt')
    expect(container.textContent).toContain('Duyệt')
    expect(container.textContent).toContain('Từ chối')

    // Click Duyệt hoa hồng
    const approveBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent === 'Duyệt',
    )
    expect(approveBtn).toBeDefined()

    mockApi.mockResolvedValueOnce({ status: 'success' })

    await act(async () => {
      approveBtn?.click()
    })

    expect(mockApi).toHaveBeenCalledWith(
      '/api/v1/billing/admin/affiliate-commissions/comm-1/status',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved', note: undefined }),
      }),
    )
  })

  it('AdminPage renders affiliates tab with proper breadcrumb and metadata badge', async () => {
    mockApi.mockResolvedValue({})

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminPage tab="affiliates" />
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Quản trị')
    expect(container.textContent).toContain('Tài chính & Kinh doanh')
    expect(container.textContent).toContain('Cộng Tác Viên & Đối Soát')
    expect(container.textContent).toContain('💳 TÀI CHÍNH & KINH DOANH')
  })
})
