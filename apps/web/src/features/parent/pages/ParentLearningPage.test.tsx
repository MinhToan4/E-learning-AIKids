// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { ParentLearningPage } from './ParentLearningPage'
import { api } from '@/shared/lib/api'
import { learningApi } from '@/shared/lib/learning-api'

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
  })

  it('renders "Nạp Thêm Lượt Tạo Ảnh AI" button in child profile section and opens modal with credits mode', async () => {
    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(ParentLearningPage, null),
        ),
      )
    })

    // Find the "Nạp Thêm Lượt Tạo Ảnh AI" button
    const buttons = Array.from(document.body.querySelectorAll('button'))
    const topupBtn = buttons.find((b) => b.textContent?.includes('Nạp Thêm Lượt Tạo Ảnh AI'))
    expect(topupBtn).toBeDefined()

    // Click button to open modal
    await act(async () => {
      topupBtn?.click()
    })

    // Verify modal opened with 'credits' mode
    const dialog = document.body.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(document.body.textContent).toContain('NẠP LƯỢT TẠO ẢNH AI DỰ PHÒNG')
    expect(document.body.textContent).toContain('Chọn Gói Lượt Tạo Ảnh Cho Bé')
  })
})
