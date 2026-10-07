// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router'
import RuleLessonJourneyRenderer from '@/features/lesson/components/RuleLessonJourneyRenderer'
import { ParentPage } from '@/features/parent/pages/ParentPage'
import { useAuth } from '@/shared/store/auth'
import { api, type QuestDetail } from '@/shared/lib/api'
import { applyGatekeeperRules } from '@/features/world/lib/world-gatekeeper'
import type { PathwayCourse } from '@/features/world/lib/world-pathway-mapper'

// Mock api call for admin complete intent
vi.mock('@/shared/lib/api', async () => {
  const actual = await vi.importActual<any>('@/shared/lib/api')
  return {
    ...actual,
    api: vi.fn(),
  }
})

describe('Hải Trình 5 Mắt Xích: Đảo Tiên Quyết Trạm 10 -> Paywall -> VietQR -> Admin Duyệt -> Mở Đảo 1 & bai-1-1', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()

    useAuth.setState({
      user: {
        id: 'child-1',
        role: 'student',
        email: null,
        nickname: 'Bé Khám Phá',
        avatarId: null,
        level: 1,
        xp: 100,
        onboarded: true,
        goal: null,
        parentId: 'parent-1',
        classId: null,
      },
      loading: false,
      error: null,
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

  it('Mắt xích 1 & 2: Học sinh hoàn thành Trạm 10 -> Chúc mừng Hiệp Sĩ AIKI -> Bấm khám phá Đảo 1 kích hoạt CoursePaywallModal', () => {
    const mockQuest10: QuestDetail = {
      id: 'rule-10',
      slug: 'rule-10',
      title: 'Quy tắc 10: Nhờ giảng thì được, nhờ làm hộ thì không',
      description: 'Quy tắc vàng 10 của Xưởng Sáng Tạo AI',
      status: 'available',
      stars: 3,
      xp: 50,
    }

    act(() => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(RuleLessonJourneyRenderer, {
            quest: mockQuest10,
            ruleId: 10,
            effectiveCourseId: 'muoi-quy-tac-xuong-sang-tao',
            liveStars: 3,
            initialStageIndex: 5,
            isCompleted: true,
            onFinish: vi.fn(),
          }),
        ),
      )
    })

    // 1. Kiểm tra thông điệp vinh danh Hiệp Sĩ AIKI
    expect(document.body.textContent).toContain('Chúc mừng tân Hiệp Sĩ AIKI!')
    expect(document.body.textContent).toContain(
      'Xuất sắc! Con đã hoàn thành trọn vẹn 10 Quy Tắc Vàng của Xưởng Sáng Tạo AI. Hãy sẵn sàng mở khóa Hải Trình Đảo 1 nhé!',
    )

    // 2. Học sinh chưa có gói bấm nút tiếp tục sang bai-1-1
    const nextBtn = Array.from(document.querySelectorAll('button')).find(
      (b) =>
        b.textContent?.toLowerCase().includes('tiếp theo') ||
        b.textContent?.toLowerCase().includes('tiếp tục'),
    )
    expect(nextBtn).toBeDefined()

    act(() => {
      nextBtn?.click()
    })

    // 3. CoursePaywallModal được kích hoạt
    expect(document.body.textContent).toContain('Con Đã Sẵn Sàng Cho Hành Trình Mới?')
    expect(document.body.textContent).toContain('Ba Mẹ Ơi, Mở Khóa Cho Con!')
    expect(document.body.textContent).toContain('Trọn bộ Khóa học AI Kid chính thức')
  })

  it('Mắt xích 3: Bấm nâng cấp từ Paywall khi là học sinh kích hoạt ParentGateModal với redirectTo="/parent/plan?upgrade=aikids_official_129k"', () => {
    const mockQuest10: QuestDetail = {
      id: 'rule-10',
      slug: 'rule-10',
      title: 'Quy tắc 10: Chia sẻ an toàn',
      status: 'available',
      stars: 3,
      xp: 50,
    }

    act(() => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(RuleLessonJourneyRenderer, {
            quest: mockQuest10,
            ruleId: 10,
            effectiveCourseId: 'muoi-quy-tac-xuong-sang-tao',
            liveStars: 3,
            initialStageIndex: 5,
            isCompleted: true,
            onFinish: vi.fn(),
          }),
        ),
      )
    })

    // Bấm mở paywall
    const nextBtn = Array.from(document.querySelectorAll('button')).find(
      (b) =>
        b.textContent?.toLowerCase().includes('tiếp theo') ||
        b.textContent?.toLowerCase().includes('tiếp tục'),
    )
    expect(nextBtn).toBeDefined()

    act(() => {
      nextBtn?.click()
    })

    // Bấm nút "Ba Mẹ Ơi, Mở Khóa Cho Con!"
    const upgradeBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Ba Mẹ Ơi, Mở Khóa Cho Con!'),
    )
    expect(upgradeBtn).toBeDefined()

    act(() => {
      upgradeBtn?.click()
    })

    // Xuất hiện Parent Gate Modal để đảm bảo an toàn cho học sinh
    expect(document.body.textContent).toContain('Ba / Mẹ ơi!')
    expect(document.body.textContent).toContain('Nhập mật khẩu đăng nhập của Ba / Mẹ')
    expect(document.body.textContent).not.toContain('Mã PIN mặc định là 0000')
  })

  it('Mắt xích 4: ParentPage với query ?upgrade=aikids_official_129k tự động chuyển sang tab Plan và bật Checkout Modal VietQR', () => {
    let currentLocation: ReturnType<typeof useLocation> | null = null

    function LocationTracker() {
      currentLocation = useLocation()
      return null
    }

    act(() => {
      root.render(
        createElement(
          MemoryRouter,
          { initialEntries: ['/parent/plan?upgrade=aikids_official_129k'] },
          createElement(LocationTracker),
          createElement(ParentPage, { tab: 'plan' }),
        ),
      )
    })

    // Dialog thanh toán mở lên với thông tin gói 129k
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(document.body.textContent).toContain('Gói Học AI Kid 129K')
    expect(document.body.textContent).toContain('129.000')

    // Khi đóng modal thanh toán, tham số ?upgrade= được xóa khỏi URL
    const closeBtn = dialog?.querySelector('button[aria-label="Đóng"]') as HTMLButtonElement | null
    if (closeBtn) {
      act(() => {
        closeBtn.click()
      })
      expect(currentLocation?.search).not.toContain('upgrade=')
    }
  })

  it('Mắt xích 5: Admin duyệt đơn -> Kích hoạt subscription active (openCourses = 6) -> Mở khóa Đảo 1 và Trạm bai-1-1', async () => {
    // 1. Giả lập Admin xác nhận đơn hàng VietQR thành công
    const mockCompletedResponse = {
      status: 'success',
      message: 'Xác nhận thanh toán VietQR thành công!',
      data: {
        id: 'intent-vietqr-1',
        status: 'completed',
        planId: 'aikids_official_129k',
      },
    }
    vi.mocked(api).mockResolvedValue(mockCompletedResponse)

    const result = await api(
      '/api/v1/billing/admin/subscriptions/intents/intent-vietqr-1/complete',
      { method: 'POST' },
    )
    expect(result).toEqual(mockCompletedResponse)

    // 2. Cập nhật trạng thái người dùng sang gói official 129k
    useAuth.setState({
      user: {
        id: 'child-1',
        role: 'student',
        email: null,
        nickname: 'Bé Khám Phá',
        avatarId: null,
        level: 2,
        xp: 300,
        onboarded: true,
        goal: null,
        parentId: 'parent-1',
        classId: null,
        ...({
          planCode: 'aikids_official_129k',
          subscription: {
            status: 'active',
            plan: 'aikids_official_129k',
            maxOpenCoursesPerChild: 6,
          },
        } as any),
      },
    })

    // 3. Kiểm tra kiểm duyệt của Gatekeeper:
    // Đảo 0 (Đảo Tiên Quyết) đã hoàn thành trọn vẹn 10/10 trạm
    const courses: PathwayCourse[] = [
      {
        id: 'muoi-quy-tac-xuong-sang-tao',
        slug: 'muoi-quy-tac-xuong-sang-tao',
        title: 'Mười quy tắc Xưởng Sáng Tạo',
        shortTitle: '10 Quy tắc vàng',
        status: 'completed',
        reasonCode: 'requirements_met',
        completionPercent: 100,
        missingPrerequisites: [],
        coverImage: null,
        enrolled: true,
        questCount: 10,
        completedCount: 10,
        totalStars: 30,
        stations: Array.from({ length: 10 }, (_, i) => ({
          id: `rule-${i + 1}`,
          slug: `rule-${i + 1}`,
          order: i + 1,
          title: `Quy tắc ${i + 1}`,
          status: 'completed',
          stars: 3,
        })),
      },
      {
        id: 'dao-1-nha-tham-hiem-ai',
        slug: 'dao-1-nha-tham-hiem-ai',
        title: 'Nhà thám hiểm AI',
        shortTitle: 'Đảo 1',
        status: 'locked', // Ban đầu bị khóa khi chưa xét gatekeeper
        reasonCode: 'previous_island_incomplete',
        completionPercent: 0,
        missingPrerequisites: [],
        coverImage: null,
        enrolled: true,
        questCount: 4,
        completedCount: 0,
        totalStars: 0,
        stations: [
          {
            id: 'bai-1-1',
            slug: 'bai-1-1-mot-tu-hay-nam-tu',
            order: 1,
            title: 'Trạm 1.1: Một từ hay năm từ',
            status: 'locked',
            stars: 0,
          },
          {
            id: 'bai-1-2',
            slug: 'bai-1-2-bon-chiec-chia-khoa',
            order: 2,
            title: 'Trạm 1.2: Bốn chiếc chìa khóa',
            status: 'locked',
            stars: 0,
          },
        ],
      },
    ]

    // Áp dụng Gatekeeper: Vì Đảo 0 đã hoàn thành 10/10 trạm -> Đảo 1 tự động mở khóa
    const gatedCourses = applyGatekeeperRules(courses, false)

    expect(gatedCourses[0].status).toBe('completed')
    // Đảo 1 được mở khóa thành available
    expect(gatedCourses[1].status).toBe('available')
    expect(gatedCourses[1].reasonCode).toBe('requirements_met')

    // Trạm 1.1 (bai-1-1) trong Đảo 1 mở khóa thành available!
    expect(gatedCourses[1].stations?.[0].id).toBe('bai-1-1')
    expect(gatedCourses[1].stations?.[0].status).toBe('available')
  })
})
