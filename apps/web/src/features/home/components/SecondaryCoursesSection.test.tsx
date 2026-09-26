import { createElement, act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import type { CourseSummary } from '@/shared/lib/api'
import {
  SecondaryCoursesSection,
  resolveSecondaryCourses,
  isMainIslandCourse,
} from './SecondaryCoursesSection'

// Enable act environment for React 19 in jsdom
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true


const makeCourse = (overrides: Partial<CourseSummary>): CourseSummary => ({
  id: 'test-course',
  title: 'Khóa Học Thử Nghiệm',
  shortTitle: 'Thử Nghiệm',
  tagline: 'Mô tả ngắn',
  description: 'Mô tả chi tiết khóa học',
  coverFrom: '#fff',
  coverTo: '#eee',
  accent: '#f59e0b',
  coverImage: null,
  ageLabel: '7–12 tuổi',
  ageTrack: 'L2',
  durationLabel: '10 trạm',
  productLabel: 'Chuyên Đề',
  status: 'open',
  recommended: false,
  skills: ['Tư duy'],
  questCount: 10,
  enrolled: false,
  completedCount: 0,
  totalStars: 0,
  progressPct: 0,
  quests: [],
  ...overrides,
})

describe('SecondaryCoursesSection', () => {
  it('correctly identifies main track island courses vs secondary courses', () => {
    expect(isMainIslandCourse(makeCourse({ id: 'dao-1-nha-tham-hiem-ai' }))).toBe(true)
    expect(isMainIslandCourse(makeCourse({ id: 'dao-2-hoa-si-ai' }))).toBe(true)
    expect(isMainIslandCourse(makeCourse({ id: 'muoi-quy-tac-xuong-sang-tao' }))).toBe(true)
    expect(isMainIslandCourse(makeCourse({ title: 'Hải trình 6 đảo khám phá' }))).toBe(true)

    // Secondary courses
    expect(isMainIslandCourse(makeCourse({ id: 'course-comic-ai', title: 'Sáng Tạo Truyện Tranh AI' }))).toBe(false)
    expect(isMainIslandCourse(makeCourse({ id: 'course-math-asmo', title: 'Toán Tư Duy ASMO' }))).toBe(false)
  })

  it('provides default sample catalog courses when given empty course list', () => {
    const list = resolveSecondaryCourses([])
    expect(list.length).toBeGreaterThanOrEqual(3)
    expect(list.some((c) => c.title.includes('Sáng Tạo Truyện Tranh AI'))).toBe(true)
    expect(list.some((c) => c.title.includes('Toán Tư Duy Montessori & ASMO'))).toBe(true)
    expect(list.some((c) => c.title.includes('Lập Trình Game Nhí'))).toBe(true)
  })

  it('renders section title, 3 Soft Clay filter tabs, and course cards with clear status badges', () => {
    const html = renderToStaticMarkup(
      createElement(SecondaryCoursesSection, {
        courses: [
          makeCourse({
            id: 'my-purchased-course',
            title: 'Khóa Học Đã Mua Của Bé',
            enrolled: true,
            progressPct: 60,
          }),
          makeCourse({
            id: 'my-locked-course',
            title: 'Khóa Học Chưa Mở Khóa Của Bé',
            enrolled: false,
          }),
        ],
      }),
    )

    // Section Header
    expect(html).toContain('KHÓA HỌC BỔ SUNG')
    expect(html).toContain('Khám Phá Chuyên Đề &amp; Sáng Tạo')

    // 3 Filter Tabs
    expect(html).toContain('Tất cả')
    expect(html).toContain('Đã sở hữu')
    expect(html).toContain('Chưa mở khóa')

    // Badges & Buttons
    expect(html).toContain('Khóa Học Đã Mua Của Bé')
    expect(html).toContain('Đã Sở Hữu')
    expect(html).toContain('Học tiếp')
    expect(html).toContain('60%')

    expect(html).toContain('Khóa Học Chưa Mở Khóa Của Bé')
    expect(html).toContain('Chưa Mở Khóa')
    expect(html).toContain('Mở khóa')
  })

  it('supplements sample catalog courses if fewer than 3 secondary courses exist', () => {
    const custom = makeCourse({
      id: 'unique-secondary-1',
      title: 'Khóa Học Đặc Biệt Duy Nhất',
      enrolled: true,
    })
    const resolved = resolveSecondaryCourses([custom])
    expect(resolved.length).toBeGreaterThanOrEqual(3)
    expect(resolved[0].id).toBe('unique-secondary-1')
  })

  describe('Interactive Tab Filtering and Action Callbacks', () => {
    let container: HTMLDivElement

    beforeEach(() => {
      container = document.createElement('div')
      document.body.appendChild(container)
    })

    afterEach(() => {
      document.body.removeChild(container)
    })

    it('filters courses accurately when switching tabs (Tất cả, Đã sở hữu, Chưa mở khóa)', async () => {
      const purchasedCourse = makeCourse({
        id: 'purchased-1',
        title: 'Khóa Học Đã Mua A',
        enrolled: true,
        progressPct: 50,
      })
      const availableCourse1 = makeCourse({
        id: 'available-1',
        title: 'Khóa Học Chưa Mua B',
        enrolled: false,
      })
      const availableCourse2 = makeCourse({
        id: 'available-2',
        title: 'Khóa Học Chưa Mua C',
        enrolled: false,
      })

      const root = createRoot(container)
      await act(async () => {
        root.render(
          createElement(SecondaryCoursesSection, {
            courses: [purchasedCourse, availableCourse1, availableCourse2],
          }),
        )
      })

      // Initially 'all' tab is selected: displays both purchased and available
      expect(container.textContent).toContain('Khóa Học Đã Mua A')
      expect(container.textContent).toContain('Khóa Học Chưa Mua B')
      expect(container.textContent).toContain('Khóa Học Chưa Mua C')

      const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      expect(tabs.length).toBe(3)
      const [allTab, purchasedTab, availableTab] = Array.from(tabs)

      // Switch to 'Đã sở hữu' tab
      await act(async () => {
        purchasedTab.click()
      })
      expect(container.textContent).toContain('Khóa Học Đã Mua A')
      expect(container.textContent).not.toContain('Khóa Học Chưa Mua B')
      expect(container.textContent).not.toContain('Khóa Học Chưa Mua C')

      // Switch to 'Chưa mở khóa' tab
      await act(async () => {
        availableTab.click()
      })
      expect(container.textContent).not.toContain('Khóa Học Đã Mua A')
      expect(container.textContent).toContain('Khóa Học Chưa Mua B')
      expect(container.textContent).toContain('Khóa Học Chưa Mua C')

      // Switch back to 'Tất cả' tab
      await act(async () => {
        allTab.click()
      })
      expect(container.textContent).toContain('Khóa Học Đã Mua A')
      expect(container.textContent).toContain('Khóa Học Chưa Mua B')
      expect(container.textContent).toContain('Khóa Học Chưa Mua C')

      await act(async () => {
        root.unmount()
      })
    })

    it('triggers onSelectCourse when clicking "Học tiếp" and onUnlockCourse when clicking "Mở khóa"', async () => {
      const onSelectCourse = vi.fn()
      const onUnlockCourse = vi.fn()

      const purchasedCourse = makeCourse({
        id: 'purchased-1',
        title: 'Khóa Học Tiếp',
        enrolled: true,
      })
      const lockedCourse = makeCourse({
        id: 'locked-1',
        title: 'Khóa Cần Mở',
        enrolled: false,
      })
      const thirdCourse = makeCourse({
        id: 'extra-1',
        title: 'Khóa Phụ',
        enrolled: false,
      })

      const root = createRoot(container)
      await act(async () => {
        root.render(
          createElement(SecondaryCoursesSection, {
            courses: [purchasedCourse, lockedCourse, thirdCourse],
            onSelectCourse,
            onUnlockCourse,
          }),
        )
      })

      // Find "Học tiếp" button
      const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      const continueBtn = buttons.find((b) => b.textContent?.includes('Học tiếp'))
      expect(continueBtn).toBeDefined()
      await act(async () => {
        continueBtn?.click()
      })
      expect(onSelectCourse).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'purchased-1' }),
      )

      // Find "Mở khóa" button
      const unlockBtn = buttons.find((b) => b.textContent?.includes('Mở khóa'))
      expect(unlockBtn).toBeDefined()
      await act(async () => {
        unlockBtn?.click()
      })
      expect(onUnlockCourse).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'locked-1' }),
      )

      await act(async () => {
        root.unmount()
      })
    })
  })
})

