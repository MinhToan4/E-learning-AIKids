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
import { AdminStaffTab } from './AdminStaffTab'
import { AdminCoursesTab } from './AdminCoursesTab'
import { AdminRolesTab } from './AdminRolesTab'
import { AdminClassesTab } from './AdminClassesTab'
import { AdminPage } from '../../pages/AdminPage'
import { AdminBillingPos, AI_CREDIT_PACKS } from '../AdminBillingPos'
import { PendingIntentDetailModal } from '../PendingIntentDetailModal'
import { groupUsersByFamilyList, type AdminUser, type PendingIntent } from '../../types'

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

  it('AdminUsersTab renders and filters only students & parents, hiding staff & admins', async () => {
    mockApi.mockResolvedValueOnce({
      users: [
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
        {
          id: 'admin-1',
          role: 'admin',
          email: 'admin@storymee.vn',
          nickname: 'Quản Trị Viên',
          active: true,
          level: 1,
          xp: 0,
          createdAt: '2026-01-01',
        },
      ],
    })

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminUsersTab />
        </MemoryRouter>,
      )
    })

    // Contains Students & Parents
    expect(container.textContent).toContain('Bé Na')
    expect(container.textContent).toContain('Mẹ Lan')
    expect(container.textContent).toContain('Học sinh & Phụ huynh')
    expect(container.textContent).toContain('Thêm tài khoản')

    // Click to open modal
    const addBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Thêm tài khoản'),
    )
    await act(async () => {
      addBtn?.click()
    })
    expect(document.body.textContent).toContain('Tạo tài khoản Gia đình')

    // Hides staff & admins
    expect(container.textContent).not.toContain('Thầy Hưng')
    expect(container.textContent).not.toContain('admin@storymee.vn')
  })

  it('AdminStaffTab renders and filters only staff roles, hiding students & parents', async () => {
    mockApi.mockResolvedValueOnce({
      users: [
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
        {
          id: 'admin-1',
          role: 'admin',
          email: 'admin@storymee.vn',
          nickname: 'Quản Trị Viên',
          active: true,
          level: 1,
          xp: 0,
          createdAt: '2026-01-01',
        },
      ],
    })

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminStaffTab />
        </MemoryRouter>,
      )
    })

    // Contains Staff & Admins
    expect(container.textContent).toContain('Thầy Hưng')
    expect(container.textContent).toContain('Quản Trị Viên')
    expect(container.textContent).toContain('Cán bộ & Quản trị')
    expect(container.textContent).toContain('Thêm cán bộ')

    // Click to open modal
    const addStaffBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Thêm cán bộ'),
    )
    await act(async () => {
      addStaffBtn?.click()
    })
    expect(document.body.textContent).toContain('Tạo Cán bộ / Quản trị')

    // Hides students & parents
    expect(container.textContent).not.toContain('Bé Na')
    expect(container.textContent).not.toContain('lan@gmail.com')
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

  it('PendingIntentDetailModal renders order details, MBBank payment info, and triggers onConfirm', async () => {
    const mockIntent: PendingIntent = {
      id: 'pi-modal-test',
      publicId: 'pi_modal123',
      provider: 'vietqr',
      purpose: 'user_sub',
      amountMinor: '129000',
      currency: 'vnd',
      status: 'pending',
      userId: 'u-10',
      userEmail: 'mother@storymee.vn',
      userName: 'Mẹ Thu Hằng',
      paymentCode: 'AIKIDS888',
      courseTitle: null,
      createdAt: '2026-09-18T10:00:00.000Z',
    }
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    act(() => {
      root.render(
        <PendingIntentDetailModal
          intent={mockIntent}
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
        />,
      )
    })

    expect(document.body.textContent).toContain('Đơn hàng #AIKIDS888')
    expect(document.body.textContent).toContain('Chờ thanh toán')
    expect(document.body.textContent).toContain('129.000₫')
    expect(document.body.textContent).toContain('Mẹ Thu Hằng')
    expect(document.body.textContent).toContain('mother@storymee.vn')
    expect(document.body.textContent).toContain('0382228888')
    expect(document.body.textContent).toContain('CONG TY CONG NGHE GIAO DUC AI KIDS')
    expect(document.body.textContent).toContain('MBBank (Ngân hàng TMCP Quân Đội)')
    expect(document.body.textContent).toContain('Xác nhận Đã Nhận Tiền & Kích Hoạt Gói')

    const confirmBtn = Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Xác nhận Đã Nhận Tiền'),
    )
    expect(confirmBtn).toBeDefined()
    await act(async () => {
      confirmBtn?.click()
    })
    expect(onConfirm).toHaveBeenCalledWith(mockIntent)
  })

  it('AdminBillingPos calls onViewPendingIntentDetail when clicking the pending intent card', () => {
    const onViewDetail = vi.fn()
    const onConfirm = vi.fn()
    const mockIntent: PendingIntent = {
      id: 'pi-click-test',
      publicId: 'pi_click123',
      provider: 'vietqr',
      purpose: 'user_sub',
      amountMinor: '129000',
      currency: 'vnd',
      status: 'pending',
      userId: 'u-11',
      userEmail: 'click@storymee.vn',
      userName: 'Phụ Huynh Click',
      paymentCode: 'CLICK789',
      courseTitle: null,
      createdAt: '2026-09-18T10:00:00.000Z',
    }
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
      availablePlans: [],
      planLabels: {},
      planBadgeColors: {},
      roleLabels: {},
      handlePosSubmit: vi.fn(),
      generateSuggestedReason: vi.fn().mockReturnValue(''),
      pendingIntents: [mockIntent],
      onConfirmPendingIntent: onConfirm,
      onViewPendingIntentDetail: onViewDetail,
    }

    act(() => {
      root.render(<AdminBillingPos {...props} />)
    })

    const card = container.querySelector('[role="button"]') as HTMLElement
    expect(card).toBeDefined()
    act(() => {
      card?.click()
    })
    expect(onViewDetail).toHaveBeenCalledWith(mockIntent)
  })

  it('AdminClassesTab renders KPI metrics, student list, invite code, and action buttons', async () => {
    mockApi.mockImplementation((url: string) => {
      if (url === '/api/teacher/class') {
        return Promise.resolve({
          class: {
            id: 'cls-test-1',
            name: 'Lớp Phi Hành Gia Nhí 3A',
            code: 'AIKI-3A',
          },
          students: [
            {
              id: 'stu-1',
              nickname: 'Bé Miu',
              level: 3,
              xp: 250,
              completedQuests: 5,
              totalStars: 15,
              projectCount: 2,
            },
            {
              id: 'stu-2',
              nickname: 'Bé Thỏ',
              level: 1,
              xp: 40,
              completedQuests: 0,
              totalStars: 0,
              projectCount: 0,
            },
          ],
        })
      }
      if (url === '/api/teacher/class/stats') {
        return Promise.resolve({
          stats: {
            className: 'Lớp Phi Hành Gia Nhí 3A',
            code: 'AIKI-3A',
            studentCount: 2,
            totalCompletedQuests: 5,
            openQuestCount: 8,
            projectCount: 2,
            students: [
              {
                id: 'stu-1',
                nickname: 'Bé Miu',
                level: 3,
                xp: 250,
                completedQuests: 5,
                currentQuest: 'Trạm 5',
                currentPhase: 'practice',
                lastActiveAt: new Date().toISOString(),
                needsSupport: false,
                supportReason: null,
              },
              {
                id: 'stu-2',
                nickname: 'Bé Thỏ',
                level: 1,
                xp: 40,
                completedQuests: 0,
                currentQuest: 'Trạm 1',
                currentPhase: 'explore',
                lastActiveAt: new Date().toISOString(),
                needsSupport: true,
                supportReason: 'Bé đang kẹt ở phần chọn nhân vật',
              },
            ],
          },
        })
      }
      return Promise.resolve({})
    })

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminClassesTab />
        </MemoryRouter>,
      )
    })

    // KPI Metrics Header & Class Info
    expect(container.textContent).toContain('QUẢN LÝ LỚP HỌC')
    expect(container.textContent).toContain('Lớp Phi Hành Gia Nhí 3A')
    expect(container.textContent).toContain('AIKI-3A')
    expect(container.textContent).toContain('2')
    expect(container.textContent).toContain('học sinh')
    expect(container.textContent).toContain('Hiệp Sĩ AIKI')
    expect(container.textContent).toContain('cần hỗ trợ')

    // Action buttons in header
    expect(container.textContent).toContain('+ Thêm học sinh')
    expect(container.querySelector('button[aria-label="Cài đặt lớp"]')).toBeDefined()
    expect(container.querySelector('button[aria-label="Làm mới"]')).toBeDefined()

    // Sub-Nav View Switcher tabs
    expect(container.textContent).toContain('Danh sách học sinh')
    expect(container.textContent).toContain('Thống kê & Hỗ trợ')
    expect(container.textContent).toContain('Thông tin & Hướng dẫn lớp')

    // Student List Table
    expect(container.textContent).toContain('Bé Miu')
    expect(container.textContent).toContain('Bé Thỏ')
    expect(container.textContent).toContain('Lv3')
    expect(container.textContent).toContain('250 XP')
    expect(container.textContent).toContain('5 trạm · 15 ⭐ · 2 🎨')
    expect(container.textContent).toContain('🛡️ Hiệp Sĩ AIKI')
    expect(container.textContent).toContain('⏳ Đang học quy tắc')

    // Action buttons on student rows
    expect(container.textContent).toContain('🔍 Chi tiết')
    expect(container.textContent).toContain('🗑️ Gỡ')
  })
})


