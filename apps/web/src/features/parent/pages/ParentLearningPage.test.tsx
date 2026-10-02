// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { ParentLearningPage } from './ParentLearningPage'
import { api } from '@/shared/lib/api'
import { learningApi } from '@/shared/lib/learning-api'
import { invalidateParentCache, setChildLearningCache } from '@/features/parent/lib/parent-cache'

vi.mock('@/shared/lib/api', () => ({
  api: vi.fn(),
  downloadAuthorizedBlob: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number
    code?: string
    constructor(message: string, status: number, code?: string) {
      super(message)
      this.status = status
      this.code = code
    }
  },
}))

vi.mock('@/shared/lib/learning-api', () => ({
  learningApi: {
    getPathway: vi.fn().mockResolvedValue({
      recommendedCourseId: 'course-1',
      courses: [
        {
          id: 'course-1',
          title: 'Khám Phá AI Vui Nhộn',
          shortTitle: 'AI Vui Nhộn',
          status: 'active',
          reasonCode: 'current',
          completionPercent: 40,
          missingPrerequisites: [],
        },
      ],
    }),
  },
}))

vi.mock('@/features/parent/hooks/useParentFeedbackBadge', () => ({
  useParentFeedbackBadge: () => ({
    totalUnread: 0,
    byChild: {},
    markSeen: vi.fn(),
  }),
}))

describe('ParentLearningPage Component', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()
    invalidateParentCache()

    const mockedApi = vi.mocked(api)
    mockedApi.mockImplementation((path: string) => {
      if (path === '/api/parent/children') {
        return Promise.resolve({
          children: [
            { id: 'child-1', nickname: 'Bé Bắp', avatarId: 'avatar-1', level: 2 },
          ],
        })
      }
      if (path.includes('/api/competency-map')) {
        return Promise.resolve({ status: 'ready', frameworks: [] })
      }
      if (path.includes('/api/credentials')) {
        return Promise.resolve({ credentials: [] })
      }
      if (path.includes('/api/learning/age-policy')) {
        return Promise.resolve({ status: 'ready', policy: null })
      }
      if (path.includes('/courses')) {
        return Promise.resolve({ courses: [] })
      }
      if (path.includes('/progress')) {
        return Promise.resolve({
          courseId: 'course-1',
          courses: [],
          summary: { completed: 2, total: 5, totalStars: 6, currentPhase: 'learn' },
          quests: [],
        })
      }
      if (path === '/api/parent/subscription') {
        return Promise.resolve({
          subscription: { status: 'active', maxOpenCoursesPerChild: 2 },
        })
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
    vi.restoreAllMocks()
    invalidateParentCache()
  })

  it('renders streamlined child profile selector without bulky buttons, description, or AI sparkles', async () => {
    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(ParentLearningPage, null),
        ),
      )
    })

    const text = document.body.textContent ?? ''
    expect(text).toContain('Hồ sơ học tập của con:')
    expect(text).toContain('Bé Bắp')
    expect(text).not.toContain('Trung tâm học tập')
    expect(text).not.toContain('Nạp Thêm Lượt Tạo Ảnh AI')
    expect(text).not.toContain('THEO DÕI TIẾN ĐỘ HỌC TẬP')
    expect(text).not.toContain('ĐANG XEM HỒ SƠ HỌC TẬP')
  })

  it('does not display bare "Error" when sub-queries fail or reject, and renders gracefully', async () => {
    const mockedApi = vi.mocked(api)
    mockedApi.mockImplementation((path: string) => {
      if (path === '/api/parent/children') {
        return Promise.resolve({
          children: [
            { id: 'child-1', nickname: 'Bé Bo', avatarId: 'avatar-1', level: 115, xp: 11400 },
          ],
        })
      }
      if (path.includes('/api/competency-map')) {
        return Promise.reject(new Error('Network error'))
      }
      if (path.includes('/api/credentials')) {
        return Promise.reject(new Error('Error'))
      }
      if (path.includes('/progress')) {
        return Promise.reject(new Error('Internal Server Error'))
      }
      return Promise.resolve({})
    })

    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(ParentLearningPage, null),
        ),
      )
    })

    expect(document.body.textContent).not.toMatch(/\bError\b/)
    expect(document.body.textContent).toContain('Bé Bo')
  })

  it('renders immediately in 0ms with cached learning data without showing PageSkeleton', async () => {
    setChildLearningCache('child-1', {
      competency: { status: 'ready', frameworks: [] },
      credentials: [],
      pathway: { recommendedCourseId: 'course-1', courses: [] },
      courses: [],
      progress: {
        courseId: 'course-1',
        courses: [],
        summary: { completed: 2, total: 5, totalStars: 6, currentPhase: 'learn' },
        quests: [],
      },
      subscription: { status: 'active', maxOpenCoursesPerChild: 2 },
      ageExperience: { status: 'ready', policy: null },
    })

    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          { initialEntries: ['/parent/learning?childId=child-1'] },
          createElement(ParentLearningPage, null),
        ),
      )
    })

    expect(document.body.textContent).toContain('Hồ sơ học tập của con:')
    expect(document.body.textContent).toContain('Khóa học AIKid')
  })

  it('renders concise parent progress report without banner, childish dialogues, or island cert button, and requires 30 stations for graduation', async () => {
    const mockedApi = vi.mocked(api)
    mockedApi.mockImplementation((path: string) => {
      if (path === '/api/parent/children') {
        return Promise.resolve({
          children: [
            { id: 'child-bo', nickname: 'Bo', avatarId: 'avatar-1', level: 11, totalStars: 30, completedQuests: 10 },
          ],
        })
      }
      if (path.includes('/api/competency-map')) {
        return Promise.resolve({ status: 'ready', frameworks: [] })
      }
      if (path.includes('/api/credentials')) {
        return Promise.resolve({ credentials: [] })
      }
      if (path.includes('/api/learning/age-policy')) {
        return Promise.resolve({ status: 'ready', policy: null })
      }
      if (path.includes('/courses')) {
        return Promise.resolve({ courses: [] })
      }
      if (path.includes('/progress')) {
        return Promise.resolve({
          courseId: 'muoi-quy-tac-xuong-sang-tao',
          courses: [],
          summary: { completed: 10, total: 30, totalStars: 30, currentPhase: 'learn' },
          quests: [],
        })
      }
      if (path === '/api/parent/subscription') {
        return Promise.resolve({
          subscription: { status: 'active', maxOpenCoursesPerChild: 2 },
        })
      }
      return Promise.resolve({})
    })

    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          { initialEntries: ['/parent/learning?childId=child-bo'] },
          createElement(ParentLearningPage, null),
        ),
      )
    })

    const text = document.body.textContent ?? ''

    // 1. Banner removed
    expect(text).not.toContain('Xưởng Sáng Tạo & Tranh Vẽ AI Cho Bo')

    // 2. Childish dialogues removed
    expect(text).not.toContain('Bo ơi! Cùng tiếp tục hành trình')
    expect(text).not.toContain('Bé đã xuất sắc hoàn thành')

    // 3. Next step enter-class card removed from learning page
    expect(text).not.toContain('Vào lớp học cùng con')
    expect(text).not.toContain('Bước tiếp theo')

    // 4. Official naming
    expect(text).toContain('Khóa học AIKid')
    expect(text).not.toContain('Hành trình 6 Đảo')
    expect(text).toContain('Khóa Học AIKid Chính Thức (30 Trạm Học)')
    expect(text).toContain('Chương trình đào tạo toàn diện gồm Đảo Tiên Quyết (10 trạm) và 5 Đảo Sáng Tạo (mỗi đảo 4 trạm).')

    // 5. Island 0 completion status & footer without "Xem Bằng Khen 🏆"
    expect(text).toContain('🟢 Đã hoàn thành (10/10 trạm)')
    expect(text).toContain('Đã đạt chuẩn an toàn AI')
    expect(text).not.toContain('Xem Bằng Khen 🏆')

    // 6. Overview stat "Chứng nhận": 0 when < 30 stations
    expect(text).toContain('Cần hoàn thành 30/30 trạm để tốt nghiệp')
  })

  it('renders CredentialsShowcase with 30-station requirement, progress bar, preview badge, and download unlock logic', async () => {
    const mockedApi = vi.mocked(api)
    mockedApi.mockImplementation((path: string) => {
      if (path === '/api/parent/children') {
        return Promise.resolve({
          children: [
            { id: 'child-bo', nickname: 'Bo', avatarId: 'avatar-1', level: 11, totalStars: 30, completedQuests: 10 },
          ],
        })
      }
      if (path.includes('/api/competency-map')) {
        return Promise.resolve({ status: 'ready', frameworks: [] })
      }
      if (path.includes('/api/credentials')) {
        return Promise.resolve({ credentials: [] })
      }
      if (path.includes('/api/learning/age-policy')) {
        return Promise.resolve({ status: 'ready', policy: null })
      }
      if (path.includes('/courses')) {
        return Promise.resolve({ courses: [] })
      }
      if (path.includes('/progress')) {
        return Promise.resolve({
          courseId: 'muoi-quy-tac-xuong-sang-tao',
          courses: [],
          summary: { completed: 10, total: 30, totalStars: 30, currentPhase: 'learn' },
          quests: [],
        })
      }
      if (path === '/api/parent/subscription') {
        return Promise.resolve({
          subscription: { status: 'active', maxOpenCoursesPerChild: 2 },
        })
      }
      return Promise.resolve({})
    })

    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          { initialEntries: ['/parent/learning?childId=child-bo'] },
          createElement(ParentLearningPage, null),
        ),
      )
    })

    // Click on tab "Bằng khen & Chứng nhận"
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const credTabBtn = buttons.find((b) => b.textContent?.includes('Bằng khen & Chứng nhận'))
    expect(credTabBtn).toBeDefined()

    await act(async () => {
      credTabBtn?.click()
    })

    const text = document.body.textContent ?? ''

    // Title & subtitle
    expect(text).toContain('Giấy Chứng Nhận Tốt Nghiệp Khóa Học AIKid')
    expect(text).toContain('Giấy Chứng Nhận Tốt Nghiệp Khóa Học AIKid là chứng chỉ vinh dự cao nhất khi học sinh hoàn thành trọn bộ 30 trạm học của cả 6 đảo.')

    // Progress bar for 10/30 stations
    expect(text).toContain('Tiến độ tốt nghiệp: 10 / 30 trạm (33%)')

    // Message for parent when < 30
    expect(text).toContain('Con cần hoàn thành đủ 30 trạm của Khóa học AIKid Chính Thức để nhận Giấy chứng nhận tốt nghiệp danh dự. Hiện tại con đã tích lũy 10/30 trạm.')

    // Preview badge
    expect(text).toContain('Bản xem trước chứng nhận · Mở khi hoàn thành 30 trạm')

    // Locked download button
    expect(text).toContain('🔒 Mở khóa tải về khi hoàn thành 30/30 trạm')
    expect(text).not.toContain('Tải Bằng Khen (.SVG)')
  })

  it('unlocks graduation certificate download when child completes all 30/30 stations', async () => {
    const mockedApi = vi.mocked(api)
    mockedApi.mockImplementation((path: string) => {
      if (path === '/api/parent/children') {
        return Promise.resolve({
          children: [
            { id: 'child-bo-graduated', nickname: 'Bo', avatarId: 'avatar-1', level: 31, totalStars: 90, completedQuests: 30 },
          ],
        })
      }
      if (path.includes('/api/competency-map')) {
        return Promise.resolve({ status: 'ready', frameworks: [] })
      }
      if (path.includes('/api/credentials')) {
        return Promise.resolve({ credentials: [] })
      }
      if (path.includes('/api/learning/age-policy')) {
        return Promise.resolve({ status: 'ready', policy: null })
      }
      if (path.includes('/courses')) {
        return Promise.resolve({ courses: [] })
      }
      if (path.includes('/progress')) {
        return Promise.resolve({
          courseId: 'dao-5-nha-phat-minh-tro-choi-ai',
          courses: [],
          summary: { completed: 30, total: 30, totalStars: 90, currentPhase: 'learn' },
          quests: [],
        })
      }
      if (path === '/api/parent/subscription') {
        return Promise.resolve({
          subscription: { status: 'active', maxOpenCoursesPerChild: 2 },
        })
      }
      return Promise.resolve({})
    })

    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          { initialEntries: ['/parent/learning?childId=child-bo-graduated'] },
          createElement(ParentLearningPage, null),
        ),
      )
    })

    // In overview, certification count is 1
    const textOverview = document.body.textContent ?? ''
    expect(textOverview).toContain('Đã tốt nghiệp Khóa học AIKid')

    // Click on tab "Bằng khen & Chứng nhận"
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const credTabBtn = buttons.find((b) => b.textContent?.includes('Bằng khen & Chứng nhận'))
    expect(credTabBtn).toBeDefined()

    await act(async () => {
      credTabBtn?.click()
    })

    const text = document.body.textContent ?? ''
    expect(text).toContain('Tiến độ tốt nghiệp: 30 / 30 trạm (100%)')
    expect(text).toContain('🟢 Đã đủ điều kiện')
    expect(text).toContain('Tải Bằng Khen (.SVG)')
    expect(text).not.toContain('Bản xem trước chứng nhận · Mở khi hoàn thành 30 trạm')
  })

  it('does not display ungrounded "Năng lực & Nhận xét" tab or artificial metric scores', async () => {
    const mockedApi = vi.mocked(api)
    mockedApi.mockImplementation((path: string) => {
      if (path === '/api/parent/children') {
        return Promise.resolve({
          children: [
            { id: 'child-bo', nickname: 'Bo', avatarId: 'avatar-1', level: 11, totalStars: 30, completedQuests: 10 },
          ],
        })
      }
      if (path.includes('/courses')) {
        return Promise.resolve({ courses: [] })
      }
      if (path.includes('/progress')) {
        return Promise.resolve({
          courseId: 'muoi-quy-tac-xuong-sang-tao',
          courses: [],
          summary: { completed: 10, total: 30, totalStars: 30, currentPhase: 'learn' },
          quests: [],
        })
      }
      if (path === '/api/parent/subscription') {
        return Promise.resolve({
          subscription: { status: 'active', maxOpenCoursesPerChild: 2 },
        })
      }
      return Promise.resolve({})
    })

    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          { initialEntries: ['/parent/learning?childId=child-bo'] },
          createElement(ParentLearningPage, null),
        ),
      )
    })

    const text = document.body.textContent ?? ''

    // 1. "Năng lực & Nhận xét" tab removed
    expect(text).not.toContain('Năng lực & Nhận xét')

    // 2. Fake ungrounded metrics removed
    expect(text).not.toContain('Tư Duy Prompt & Ngôn Ngữ AI')
    expect(text).not.toContain('95% · Xuất Sắc')
    expect(text).not.toContain('100% · Đạt Chuẩn')
    expect(text).not.toContain('88% · Đang Bứt Phá')
    expect(text).not.toContain('Nhận xét ấm áp từ Mèo AIKI')

    // 3. Grounded tabs remain
    expect(text).toContain('Khóa học AIKid')
    expect(text).toContain('Bằng khen & Chứng nhận')
    expect(text).toContain('Hoạt động')
    expect(text).toContain('Lộ trình')
    expect(text).toContain('Nhận xét')
  })
})
