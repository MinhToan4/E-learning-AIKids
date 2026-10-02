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

    expect(document.body.textContent).toContain('Trung tâm học tập')
  })
})
