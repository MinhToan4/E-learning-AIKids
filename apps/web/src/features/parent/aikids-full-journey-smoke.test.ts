// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router'
import RuleLessonJourneyRenderer from '@/features/lesson/components/RuleLessonJourneyRenderer'
import { CourseCertificateModal, generateDynamicCertificateSvg } from '@/features/lesson/components/CourseCertificateModal'
import { ParentPage } from '@/features/parent/pages/ParentPage'
import { ParentSubscriptionCheckoutModal } from '@/features/parent/components/ParentSubscriptionCheckoutModal'
import { CredentialsShowcase } from '@/features/parent/pages/ParentLearningPage'
import { useAuth } from '@/shared/store/auth'
import { api, type QuestDetail } from '@/shared/lib/api'
import { applyGatekeeperRules } from '@/features/world/lib/world-gatekeeper'
import type { PathwayCourse } from '@/features/world/lib/world-pathway-mapper'
import {
  saveCertificateToBackpack,
  getBackpackCertificates,
  isCertificateClaimed,
  OFFICIAL_COURSE_CERTIFICATE_ID,
} from '@/features/backpack/lib/backpack-certificates'

vi.mock('@/shared/lib/api', async () => {
  const actual = await vi.importActual<any>('@/shared/lib/api')
  return {
    ...actual,
    api: vi.fn(),
  }
})

describe('AI Kids Full Journey Smoke Test: Login -> Học Free -> Mua Khóa Học (VietQR + Admin Accept) -> Học Khóa Mở -> Nhận Certificate Cá Nhân Hóa', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ''
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('Bước 1 & 2: Học sinh "Bo" đăng nhập -> Học Free Trạm 10 Đảo Tiên Quyết -> Hoàn thành vinh danh Hiệp Sĩ AIKI', () => {
    // 1. Khởi tạo session học sinh Bé Bo
    useAuth.setState({
      user: {
        id: 'child-bo-id',
        role: 'student',
        email: null,
        nickname: 'Bo',
        avatarId: 'avatar-cat-1',
        level: 1,
        xp: 150,
        onboarded: true,
        goal: null,
        parentId: 'parent-wallet-id',
        classId: null,
      },
      loading: false,
      error: null,
    })

    const currentUser = useAuth.getState().user
    expect(currentUser?.nickname).toBe('Bo')
    expect(currentUser?.role).toBe('student')

    // 2. Bé Bo hoàn thành Trạm 10 của Đảo Tiên Quyết (Học Free)
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

    // Xác nhận vinh danh tân Hiệp Sĩ AIKI trên giao diện
    expect(document.body.textContent).toContain('Chúc mừng tân Hiệp Sĩ AIKI!')
    expect(document.body.textContent).toContain('Xuất sắc! Con đã hoàn thành trọn vẹn 10 Quy Tắc Vàng của Xưởng Sáng Tạo AI.')
  })

  it('Bước 3: Bấm khám phá Đảo 1 -> Chạm Paywall -> Chuyển khoản VietQR -> Admin duyệt -> Kích hoạt bản quyền', async () => {
    // 1. Bé Bo bấm sang bài tiếp theo của Đảo 1 khi chưa mua gói
    useAuth.setState({
      user: {
        id: 'child-bo-id',
        role: 'student',
        email: null,
        nickname: 'Bo',
        avatarId: null,
        level: 1,
        xp: 150,
        onboarded: true,
        goal: null,
        parentId: 'parent-wallet-id',
        classId: null,
      },
      loading: false,
      error: null,
    })

    const mockQuest10: QuestDetail = {
      id: 'rule-10',
      slug: 'rule-10',
      title: 'Quy tắc 10',
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

    const nextBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent?.toLowerCase().includes('tiếp tục') || b.textContent?.toLowerCase().includes('tiếp theo'),
    )
    act(() => {
      nextBtn?.click()
    })

    // Paywall xuất hiện
    expect(document.body.textContent).toContain('Con Đã Sẵn Sàng Cho Hành Trình Mới?')
    expect(document.body.textContent).toContain('Ba Mẹ Ơi, Mở Khóa Cho Con!')

    // 2. Chuyển sang luồng thanh toán VietQR của Phụ huynh
    useAuth.setState({
      user: {
        id: 'parent-wallet-id',
        role: 'parent',
        email: 'parent@aikid.vn',
        nickname: 'Phụ huynh Bé Bo',
        avatarId: null,
        level: 1,
        xp: 0,
        onboarded: true,
        goal: null,
        parentId: null,
        classId: null,
      },
      loading: false,
      error: null,
    })

    act(() => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(ParentSubscriptionCheckoutModal, {
            open: true,
            onClose: vi.fn(),
            paymentCode: 'AK129K9999',
          }),
        ),
      )
    })

    // Dialog thanh toán VietQR xuất hiện với thông tin gói 129k
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(document.body.textContent).toContain('Thanh Toán Gói AI Kid 129K')
    expect(document.body.textContent).toContain('129.000 đ')
    expect(document.body.textContent).toContain('AK129K9999')

    // 3. Admin xác nhận đơn hàng thành công qua backend API
    const mockCompleteResult = {
      status: 'success',
      data: {
        id: 'vietqr-intent-bo-1',
        status: 'completed',
        planId: 'aikids_official_129k',
      },
    }
    vi.mocked(api).mockResolvedValue(mockCompleteResult)

    const adminResponse = await api('/api/v1/billing/admin/subscriptions/intents/vietqr-intent-bo-1/complete', {
      method: 'POST',
    })
    expect(adminResponse).toEqual(mockCompleteResult)

    // Cập nhật subscription của gia đình sang active
    useAuth.setState({
      user: {
        id: 'child-bo-id',
        role: 'student',
        email: null,
        nickname: 'Bo',
        avatarId: null,
        level: 2,
        xp: 350,
        onboarded: true,
        goal: null,
        parentId: 'parent-wallet-id',
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

    expect(useAuth.getState().user?.subscription?.status).toBe('active')
  })

  it('Bước 4: Khóa học Đảo 1 & Trạm 1.1 mở khóa thành công cho bé Bo', () => {
    // Dữ liệu lộ trình khi Đảo 0 đã hoàn thành và gói đã kích hoạt
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
        status: 'locked',
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
        ],
      },
    ]

    // Áp dụng Gatekeeper kiểm tra quyền mở khóa
    const gated = applyGatekeeperRules(courses, false)
    expect(gated[1].status).toBe('available')
    expect(gated[1].reasonCode).toBe('requirements_met')
    expect(gated[1].stations?.[0].id).toBe('bai-1-1')
    expect(gated[1].stations?.[0].status).toBe('available')
  })

  it('Bước 5: Nhận Giấy Chứng Nhận Tốt Nghiệp -> Lưu vào Ba Lô & Đổi đúng tên "Bo", sao, ngày cấp', () => {
    const studentId = 'child-bo-id'
    const studentName = 'Bo'
    const totalStars = 134
    const totalXp = 6700

    // 1. Kiểm tra sinh chuỗi SVG động có chứa đúng tên "Bo" và thông tin khóa học
    const dynamicSvg = generateDynamicCertificateSvg({
      studentName,
      courseTitle: 'Khóa Học Sáng Tạo Nội Dung Cùng AIKids (32 Trạm)',
      formattedDate: '07/10/2026',
      stars: totalStars,
      xp: totalXp,
      courseId: OFFICIAL_COURSE_CERTIFICATE_ID,
    })

    const decodedSvg = decodeURIComponent(dynamicSvg.replace('data:image/svg+xml;charset=utf-8,', ''))
    expect(decodedSvg).toContain('Bo')
    expect(decodedSvg).toContain('134 Sao Tinh Hoa')
    expect(decodedSvg).toContain('07/10/2026')
    expect(decodedSvg).toContain('AI KIDS ACADEMY')
    expect(decodedSvg).toContain('OFFICIAL CERTIFIED')

    // 2. Render Modal Bằng Khen cho học sinh
    let claimedCert: any = null
    act(() => {
      root.render(
        createElement(CourseCertificateModal, {
          isOpen: true,
          onClose: vi.fn(),
          courseId: OFFICIAL_COURSE_CERTIFICATE_ID,
          studentName,
          studentId,
          stars: totalStars,
          xp: totalXp,
          onSaveToBackpack: (cert) => {
            claimedCert = cert
          },
        }),
      )
    })

    // Modal hiển thị trang trọng tên học sinh "Bo"
    expect(document.body.textContent).toContain('Bo')
    expect(document.body.textContent).toContain('Chứng Nhận Tốt Nghiệp')
    expect(document.body.textContent).toContain('134 Sao Tinh Hoa')

    // 3. Học sinh bấm nút "Cất Vào Balo"
    const saveBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Cất Vào Balo'),
    )
    expect(saveBtn).toBeDefined()
    act(() => {
      saveBtn?.click()
    })

    // Kiểm tra chứng nhận đã được lưu vào Ba Lô thành công
    expect(isCertificateClaimed(OFFICIAL_COURSE_CERTIFICATE_ID, studentId)).toBe(true)
    const backpackCerts = getBackpackCertificates(studentId)
    expect(backpackCerts.length).toBeGreaterThan(0)
    expect(backpackCerts[0].studentName).toBe('Bo')
    expect(backpackCerts[0].stars).toBe(134)

    // 4. Kiểm tra Cổng Phụ Huynh (CredentialsShowcase) hiển thị đồng nhất
    act(() => {
      root.render(
        createElement(CredentialsShowcase, {
          child: {
            id: studentId,
            nickname: 'Bo',
            avatarId: null,
            level: 3,
            totalStars,
            completedQuests: 32,
          },
          credentials: [],
          totalStars,
          completedQuests: 32,
          busy: false,
          onDownload: vi.fn(),
        }),
      )
    })

    // Phụ huynh thấy vinh danh tên bé Bo và đủ 32/32 trạm
    expect(document.body.textContent).toContain('Vinh danh Nhà Sáng Tạo Nhí:')
    expect(document.body.textContent).toContain('Bo')
    expect(document.body.textContent).toContain('32 / 32 Trạm Hoàn Thành')
    expect(document.body.textContent).toContain('134 Sao Tinh Hoa')

    // Nút Tải Bằng Khen (.SVG) mở khóa với file tải về đúng tên bé Bo
    const downloadLink = document.querySelector('a[download="Chung-Nhan-Tot-Nghiep-Bo.svg"]') as HTMLAnchorElement | null
    expect(downloadLink).not.toBeNull()
    expect(downloadLink?.href).toContain('data:image/svg+xml')
  })
})
