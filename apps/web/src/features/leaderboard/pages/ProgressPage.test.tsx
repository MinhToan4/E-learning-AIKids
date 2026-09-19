// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { ProgressPage } from './LeaderboardPage'
import * as apiModule from '@/shared/lib/api'
import { learningApi } from '@/shared/lib/learning-api'

const mockCelebration = {
  hasClass: true,
  learnerCount: 15,
  completedQuests: 6,
  projects: 2,
  teamXp: 1200,
  nextGoal: 2000,
  personal: { level: 3, xp: 450 },
}

const mockStreak = {
  current: 7,
  longest: 12,
  lastActivityDate: '2026-09-19T00:00:00Z',
}

const mockCompetency = {
  status: 'ready' as const,
  frameworks: [
    {
      id: 'montessori-math',
      name: 'Toán Trực Quan Montessori',
      disclaimer: '',
      domains: [
        {
          id: 'number-sense',
          name: 'Cảm Thụ Số Học',
          skills: [
            {
              id: 'skill-addition',
              name: 'Phép cộng trực quan',
              learnerLabel: 'Cộng tách số que tính',
              result: {
                level: 'achieved' as const,
                scorePercent: 95,
                evidenceCount: 4,
              },
            },
            {
              id: 'skill-balance',
              name: 'Cân đĩa thăng bằng',
              learnerLabel: 'Thăng bằng đĩa cân',
              result: {
                level: 'developing' as const,
                scorePercent: 70,
                evidenceCount: 2,
              },
            },
            {
              id: 'skill-fraction',
              name: 'Phân số pizza',
              learnerLabel: 'Chia lát pizza',
              result: {
                level: 'not_met' as const,
                scorePercent: null,
                evidenceCount: 1,
              },
            },
          ],
        },
      ],
    },
  ],
}

const mockPathway = {
  student: { nickname: 'Bé Na', ageBand: '6-8' },
  policy: { label: 'Montessori Track' },
  recommendedCourseId: 'course-asmo-1',
  courses: [
    {
      id: 'course-asmo-1',
      title: 'Toán Olympic ASMO Khám Phá',
      shortTitle: 'Toán ASMO 1',
      status: 'active' as const,
      reasonCode: 'current',
      completionPercent: 45,
      missingPrerequisites: [],
      coverImage: null,
      enrolled: true,
      enrollmentId: 'enr-1',
      questCount: 6,
      completedCount: 3,
      totalStars: 9,
      stations: [
        {
          id: 'station-1',
          order: 1,
          title: 'Khu rừng phép cộng số học',
          skill: 'Cộng tách số',
          reward: 'Huy hiệu Mầm Xanh',
          duration: '15 phút',
          hook: 'Cùng Mèo AIKI hái táo nhé!',
          accent: 'mint',
          practiceKind: 'math',
          status: 'completed' as const,
          phase: 'check' as const,
          stars: 3,
          xpEarned: 50,
        },
        {
          id: 'station-2',
          order: 2,
          title: 'Tiệm bánh phép nhân vui nhộn',
          skill: 'Nhân trực quan',
          reward: 'Huy hiệu Bánh Ngọt',
          duration: '20 phút',
          hook: 'Nướng bánh cùng bạn bè!',
          accent: 'amber',
          practiceKind: 'math',
          status: 'in_progress' as const,
          phase: 'practice' as const,
          stars: 0,
          xpEarned: 0,
        },
        {
          id: 'station-3',
          order: 3,
          title: 'Đảo cân thăng bằng bí ẩn',
          skill: 'Cân thăng bằng',
          reward: 'Huy hiệu Cân Đĩa',
          duration: '25 phút',
          hook: 'Khám phá bí mật quả cân!',
          accent: 'sky',
          practiceKind: 'math',
          status: 'locked' as const,
          phase: 'learn' as const,
          stars: 0,
          xpEarned: 0,
        },
      ],
    },
    {
      id: 'course-ai-story',
      title: 'Sáng Tạo Truyện Tranh AI',
      shortTitle: 'Truyện Tranh AI',
      status: 'completed' as const,
      reasonCode: 'completed',
      completionPercent: 100,
      missingPrerequisites: [],
      coverImage: null,
      enrolled: true,
      enrollmentId: 'enr-2',
      questCount: 4,
      completedCount: 4,
      totalStars: 12,
      stations: [
        {
          id: 'story-station-1',
          order: 1,
          title: 'Họa sĩ Mèo AIKI',
          skill: 'Phác họa nhân vật',
          reward: 'Bút vẽ ma thuật',
          duration: '20 phút',
          hook: 'Vẽ chú mèo đầu tiên!',
          accent: 'brand',
          practiceKind: 'creative',
          status: 'completed' as const,
          phase: 'check' as const,
          stars: 3,
          xpEarned: 60,
        },
      ],
    },
  ],
}

describe('ProgressPage - Hộ Chiếu Học Tập Soft Clay & Kiến Trúc Đa Khóa Học', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    // Mock API calls
    vi.spyOn(apiModule, 'api').mockImplementation(async (path: string) => {
      if (path === '/api/gamification/class-celebration') {
        return { celebration: mockCelebration } as never
      }
      if (path === '/api/gamification/streak') {
        return mockStreak as never
      }
      if (path === '/api/competency-map') {
        return mockCompetency as never
      }
      if (path.startsWith('/api/progress/course-asmo-1')) {
        return {
          quests: mockPathway.courses[0].stations,
          totalStars: 9,
          completedCount: 3,
        } as never
      }
      if (path.startsWith('/api/progress/course-ai-story')) {
        return {
          quests: mockPathway.courses[1].stations,
          totalStars: 12,
          completedCount: 4,
        } as never
      }
      return {} as never
    })

    vi.spyOn(learningApi, 'getPathway').mockResolvedValue(mockPathway as never)
    vi.spyOn(learningApi, 'getCourseProgress').mockImplementation(async (courseId: string) => {
      const course = mockPathway.courses.find((c) => c.id === courseId)
      return {
        quests: course?.stations || [],
        totalStars: course?.totalStars || 0,
        completedCount: course?.completedCount || 0,
      } as never
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  it('renders progress passport hero with 4 golden metrics', async () => {
    await act(async () => {
      root.render(
        createElement(MemoryRouter, null, createElement(ProgressPage))
      )
    })

    // 1. Header title & encouragement
    expect(container.textContent).toContain('Học sinh đang học đến đâu?')
    expect(container.textContent).toContain('Hộ Chiếu Thám Hiểm Soft Clay')
    expect(container.textContent).toContain('Mèo AIKI')

    // 2. 4 Golden Stat Tiles
    expect(container.textContent).toContain('Ngôi Sao Vàng')
    expect(container.textContent).toContain('Trạm Chinh Phục')
    expect(container.textContent).toContain('Chuỗi Ngày Học')
    expect(container.textContent).toContain('7 Ngày')
    expect(container.textContent).toContain('Nhà Thám Hiểm')
    expect(container.textContent).toContain('Cấp 3')
  })

  it('renders ActiveQuestSpotlightCard with one-touch continue button', async () => {
    await act(async () => {
      root.render(
        createElement(MemoryRouter, null, createElement(ProgressPage))
      )
    })

    // Active spotlight card
    expect(container.textContent).toContain('Trạm Học Tiếp Theo Của Học Sinh')
    expect(container.textContent).toContain('Trạm 2: Tiệm bánh phép nhân vui nhộn')
    expect(container.textContent).toContain('Tiếp Tục Trạm 2 Ngay')
    expect(container.textContent).toContain('Tiến độ khóa học')
  })

  it('renders MultiCourseJourneyHub with tabs and switches course selection', async () => {
    await act(async () => {
      root.render(
        createElement(MemoryRouter, null, createElement(ProgressPage))
      )
    })

    // Course Hub tabs
    expect(container.textContent).toContain('Đang Học')
    expect(container.textContent).toContain('Đã Chinh Phục')
    expect(container.textContent).toContain('Sắp Khám Phá')
    expect(container.textContent).toContain('Hành Trình Khám Phá Của Học Sinh')

    // Current selected course card
    expect(container.textContent).toContain('Toán ASMO 1')
    expect(container.textContent).toContain('Đang xem bản đồ')

    // Click tab Đã Chinh Phục
    const completedTabBtn = Array.from(container.querySelectorAll('button[role="tab"]')).find(
      (btn) => btn.textContent?.includes('Đã Chinh Phục')
    ) as HTMLButtonElement
    expect(completedTabBtn).toBeDefined()

    await act(async () => {
      completedTabBtn.click()
    })

    // Course in completed tab is visible
    expect(container.textContent).toContain('Truyện Tranh AI')

    // Click on Truyện Tranh AI course card to select it
    const storyCourseCard = Array.from(container.querySelectorAll('article[role="button"]')).find(
      (el) => el.textContent?.includes('Truyện Tranh AI')
    ) as HTMLElement
    expect(storyCourseCard).toBeDefined()

    await act(async () => {
      storyCourseCard.click()
      await new Promise((r) => setTimeout(r, 20))
    })

    // CourseStationRoadmap updates with the new selected course title and stations
    expect(container.textContent).toContain('Sổ Tay Lộ Trình Trạm Học')
    expect(container.textContent).toContain('Họa sĩ Mèo AIKI')
  })

  it('renders CourseStationRoadmap displaying completed, current, and locked stations', async () => {
    await act(async () => {
      root.render(
        createElement(MemoryRouter, null, createElement(ProgressPage))
      )
    })

    // Roadmap title and station details
    expect(container.textContent).toContain('Sổ Tay Lộ Trình Trạm Học')
    expect(container.textContent).toContain('Khu rừng phép cộng số học')
    expect(container.textContent).toContain('Ôn tập lại')
    expect(container.textContent).toContain('Tiệm bánh phép nhân vui nhộn')
    expect(container.textContent).toContain('Đang học ở đây')
    expect(container.textContent).toContain('Vào Học Ngay')
    expect(container.textContent).toContain('Đảo cân thăng bằng bí ẩn')
    expect(container.textContent).toContain('Sắp mở')
  })

  it('renders SkillGardenSection with Montessori bloom stages and filter buttons', async () => {
    await act(async () => {
      root.render(
        createElement(MemoryRouter, null, createElement(ProgressPage))
      )
    })

    // Skill garden header
    expect(container.textContent).toContain('Khu Vườn Kỹ Năng Đang Nở Rộ')
    expect(container.textContent).toContain('Cộng tách số que tính')
    expect(container.textContent).toContain('Đã tỏa sáng')
    expect(container.textContent).toContain('Thăng bằng đĩa cân')
    expect(container.textContent).toContain('Đang lớn lên')

    // Filter button for achieved skills
    const flowerFilterBtn = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Đã Tỏa Sáng')
    ) as HTMLButtonElement
    expect(flowerFilterBtn).toBeDefined()

    await act(async () => {
      flowerFilterBtn.click()
    })

    expect(container.textContent).toContain('Cộng tách số que tính')
  })
})
