// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AdminSystemTab } from './AdminSystemTab'
import { AdminAnalyticsTab } from './AdminAnalyticsTab'
import { AdminLogsTab } from './AdminLogsTab'
import { AdminUsersTab } from './AdminUsersTab'
import { AdminCoursesTab } from './AdminCoursesTab'
import { AdminRolesTab } from './AdminRolesTab'
import { AdminPage } from '../../pages/AdminPage'
import { AdminBillingPos, AI_CREDIT_PACKS } from '../AdminBillingPos'
import { groupUsersByFamilyList, type AdminUser } from '../../types'

const mockApi = vi.fn()
vi.mock('@/shared/lib/api', () => ({
  api: (...args: unknown[]) => mockApi(...args),
}))

describe('Admin Domain Tabs & POS Refactor', () => {
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

  it('AdminSystemTab renders system metrics and action buttons', async () => {
    mockApi.mockResolvedValueOnce({
      system: {
        service: 'aikids-core',
        time: new Date().toISOString(),
        counts: {
          courses: 5,
          quests: 25,
          classes: 8,
          pendingApprovals: 3,
          usersByRole: { student: 10, teacher: 2, parent: 4, admin: 1 },
        },
        vidtory: { configured: true, maskedHint: 'sk-1234', source: 'db' },
      },
    })

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminSystemTab />
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Ưu tiên hôm nay')
    expect(container.textContent).toContain('Việc cần xử lý & Điều phối')
    expect(container.textContent).toContain('Tài khoản chờ duyệt')
    expect(container.textContent).toContain('Vidtory AI Gateway')
    expect(container.textContent).toContain('Hạ Tầng Microservices & NATS')
  })

  it('AdminAnalyticsTab renders analytics stat cards and learning trends', async () => {
    mockApi.mockResolvedValueOnce({
      analytics: {
        time: new Date().toISOString(),
        users: { active: 15, byRole: { student: 12, parent: 3 } },
        courses: { open: 4, soon: 1 },
        quests: { active: 20, archived: 2 },
        learning: { completedProgress: 45, enrollments: 30, projects: 18 },
        trends: [
          { date: '2026-09-10', newUsers: 2, completedQuests: 5, projects: 1 },
          { date: '2026-09-11', newUsers: 3, completedQuests: 8, projects: 3 },
        ],
      },
    })

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminAnalyticsTab />
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Người dùng hoạt động')
    expect(container.textContent).toContain('Khóa học đang mở')
    expect(container.textContent).toContain('Nhịp hoạt động 14 ngày')
    expect(container.textContent).toContain('Tiến độ đào tạo & Thực hành')
  })

  it('AdminLogsTab displays logs, IP, and auto-purge status', async () => {
    mockApi.mockResolvedValueOnce({
      logs: [
        {
          id: 'log-1',
          userId: 'u-1',
          email: 'test@storymee.vn',
          outcome: 'success',
          ipAddress: '192.168.1.1',
          reason: 'Đăng nhập mật khẩu',
          createdAt: new Date().toISOString(),
        },
      ],
      summary: {
        total: 1,
        byOutcome: { success: 1 },
        windowHours: 24,
        purgedAt: new Date().toISOString(),
      },
    })
    mockApi.mockResolvedValueOnce({
      users: [{ id: 'u-1', email: 'test@storymee.vn', role: 'parent', active: true }],
    })

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminLogsTab />
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Tổng trong 24 giờ')
    expect(container.textContent).toContain('test@storymee.vn')
    expect(container.textContent).toContain('192.168.1.1')
    expect(container.textContent).toContain('Tự động dọn sau 24 giờ')
  })

  it('groupUsersByFamilyList correctly structures parents and their children', () => {
    const rawUsers: AdminUser[] = [
      {
        id: 'child-1',
        role: 'student',
        email: null,
        nickname: 'Bé Na',
        active: true,
        level: 1,
        xp: 100,
        createdAt: '2026-01-01',
        guardianParent: { id: 'parent-1', name: 'Mẹ Lan', email: 'lan@gmail.com' },
      },
      {
        id: 'parent-1',
        role: 'parent',
        email: 'lan@gmail.com',
        nickname: 'Mẹ Lan',
        active: true,
        level: 1,
        xp: 0,
        createdAt: '2026-01-01',
        children: [{ id: 'child-1', profileId: 'p-1', name: 'Bé Na' }],
      },
      {
        id: 'teacher-1',
        role: 'teacher',
        email: 'gv@storymee.vn',
        nickname: 'Thầy Hưng',
        active: true,
        level: 1,
        xp: 0,
        createdAt: '2026-01-01',
      },
    ]

    const grouped = groupUsersByFamilyList(rawUsers)
    // Parent should be placed first
    expect(grouped[0].id).toBe('parent-1')
    expect(grouped[0].isChildInFamily).toBe(false)
    // Child should immediately follow the parent
    expect(grouped[1].id).toBe('child-1')
    expect(grouped[1].isChildInFamily).toBe(true)
    // Other accounts placed after
    expect(grouped[2].id).toBe('teacher-1')
  })

  it('AdminCoursesTab renders course list and search input', async () => {
    mockApi.mockResolvedValueOnce({
      courses: [
        {
          id: 'c-1',
          title: 'Học vẽ AI Diệu Kỳ',
          status: 'open',
          questCount: 4,
          accessPolicy: 'free',
          quests: [{ id: 'q-1', order: 1, title: 'Làm quen bút vẽ', videoUrl: 'https://video.mp4' }],
        },
      ],
    })

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminCoursesTab />
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Học vẽ AI Diệu Kỳ')
    expect(container.textContent).toContain('Đang mở')
    expect(container.textContent).toContain('✏️ Soạn Trạm Học')
    expect(container.textContent).toContain('Phân phối & bán')
  })

  it('AdminBillingPos displays 129k tier, 5 credit packs, and 4 partitions', () => {
    expect(AI_CREDIT_PACKS.length).toBe(5)
    expect(AI_CREDIT_PACKS[0].price).toBe(20000)
    expect(AI_CREDIT_PACKS[4].price).toBe(320000)

    const props = {
      billingAdminMode: 'checkout' as const,
      setBillingAdminMode: vi.fn(),
      paymentMethod: 'transfer' as const,
      setPaymentMethod: vi.fn(),
      grantForm: { userEmail: '', planId: 'starter', durationMonths: 1, reason: '' },
      setGrantForm: vi.fn(),
      grantLoading: false,
      grantSelectedUser: null,
      setGrantSelectedUser: vi.fn(),
      grantUserResults: [],
      setGrantUserResults: vi.fn(),
      grantUserSearching: false,
      searchGrantUser: vi.fn(),
      availablePlans: [
        {
          id: 'starter',
          name: 'Gói Tiêu Chuẩn 129K',
          amountMinor: 129000,
          currency: 'vnd',
          monthlyCreateCredits: 50,
          maxChildren: 2,
          features: ['50 lượt tạo AI'],
          requiresPayment: true,
        },
      ],
      planLabels: { starter: 'Gói Tiêu Chuẩn 129K' },
      planBadgeColors: { starter: 'bg-amber-100 text-amber-900' },
      roleLabels: { parent: 'Phụ huynh' },
      handlePosSubmit: vi.fn(),
      generateSuggestedReason: vi.fn().mockReturnValue('Đã thu tiền'),
      pendingIntents: [
        {
          id: 'pi-1',
          publicId: 'pi_test123',
          provider: 'vietqr',
          purpose: 'user_sub',
          amountMinor: '129000',
          currency: 'vnd',
          status: 'pending',
          userId: 'u-1',
          userEmail: 'parent@example.com',
          userName: 'Phụ huynh Test',
          paymentCode: 'AIKIDS123',
          courseTitle: null,
          createdAt: new Date().toISOString(),
        },
      ],
      onConfirmPendingIntent: vi.fn(),
    }

    act(() => {
      root.render(<AdminBillingPos {...props} />)
    })

    // 1. Duyệt đơn chờ thanh toán
    expect(container.textContent).toContain('Duyệt đơn chờ thanh toán (1)')
    expect(container.textContent).toContain('Duyệt 1-Click')
    // 2. POS xuất VietQR / Thu ngân
    expect(container.textContent).toContain('Xuất mã VietQR')
    // 3. Danh mục gói cước & nạp AI (129K và 5 gói)
    expect(container.textContent).toContain('Gói tháng (129K)')
    expect(container.textContent).toContain('Nạp lượt AI (5 gói)')
    expect(container.textContent).toContain('Tiêu chuẩn 129K')
    // 4. Cấp học bổng
    expect(container.textContent).toContain('Cấp học bổng 0đ')
  })

  it('AdminPage renders Breadcrumbs, Domain Category Badge, and Header', async () => {
    mockApi.mockResolvedValue({ system: { service: 'core', time: new Date().toISOString(), counts: { courses: 1, quests: 1, classes: 1, pendingApprovals: 0, usersByRole: {} } } })

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminPage tab="billing" />
        </MemoryRouter>,
      )
    })

    // Breadcrumbs
    expect(container.textContent).toContain('Quản trị')
    expect(container.textContent).toContain('Tài chính & Kinh doanh')
    expect(container.textContent).toContain('Gói & Thanh toán')
    // Domain badge
    expect(container.textContent).toContain('💳 TÀI CHÍNH & KINH DOANH')
  })

  it('AdminRolesTab renders Permissions Matrix, Category Filter, and Roles Catalog', async () => {
    mockApi.mockResolvedValue({
      system: {
        service: 'core',
        time: new Date().toISOString(),
        counts: {
          courses: 1,
          quests: 1,
          classes: 1,
          pendingApprovals: 0,
          usersByRole: { admin: 2, teacher: 5, parent: 12, student: 40 },
        },
      },
    })

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminRolesTab />
        </MemoryRouter>,
      )
    })

    // Header & Subtabs
    expect(container.textContent).toContain('Quản Lý Vai Trò & Ma Trận Phân Quyền (RBAC)')
    expect(container.textContent).toContain('Ma Trận Quyền Hạn')
    expect(container.textContent).toContain('Danh Mục Vai Trò')

    // Permissions categories & roles
    expect(container.textContent).toContain('Giáo trình & Khóa học')
    expect(container.textContent).toContain('Lớp học & Học sinh')
    expect(container.textContent).toContain('Người dùng & Phân quyền')
    expect(container.textContent).toContain('Tài chính & Thu ngân')
    expect(container.textContent).toContain('Kỹ thuật & AI Studio')
    expect(container.textContent).toContain('Quản Trị Viên Tối Cao')
    expect(container.textContent).toContain('Trưởng Ban Chuyên Môn')

    // Switch to Catalog subtab
    const catalogBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Danh Mục Vai Trò'),
    )
    expect(catalogBtn).toBeDefined()

    await act(async () => {
      catalogBtn?.click()
    })

    expect(container.textContent).toContain('Học Sinh')
    expect(container.textContent).toContain('Phụ Huynh Học Sinh')
    expect(container.textContent).toContain('Giáo Viên Giảng Dạy')
  })

  it('AdminPage renders roles tab with RBAC domain metadata', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminPage tab="roles" />
        </MemoryRouter>,
      )
    })

    // Breadcrumbs & Domain badge
    expect(container.textContent).toContain('Quản trị')
    expect(container.textContent).toContain('Người dùng & Phân quyền')
    expect(container.textContent).toContain('Vai trò & Quyền hạn')
    expect(container.textContent).toContain('👥 NGƯỜI DÙNG & PHÂN QUYỀN')
  })
})

