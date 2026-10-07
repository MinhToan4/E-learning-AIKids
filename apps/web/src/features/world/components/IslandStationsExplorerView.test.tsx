import React, { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import {
  IslandStationsExplorerView,
  type IslandCourseSummary,
} from './IslandStationsExplorerView'
import type { QuestProgress } from '@/shared/lib/api'

const mockQuests: QuestProgress[] = [
  {
    id: 'bai-1-1',
    title: 'Bài 1.1 — Một từ hay năm từ?',
    slug: 'bai-1-1-mot-tu-hay-nam-tu',
    status: 'completed',
    stars: 3,
    xpEarned: 50,
    order: 1,
    phase: 'learn',
  },
  {
    id: 'bai-1-2',
    title: 'Bài 1.2 — Bốn chiếc chìa khóa vàng',
    slug: 'bai-1-2-bon-chiec-chia-khoa',
    status: 'in_progress',
    stars: 0,
    xpEarned: 0,
    order: 2,
    phase: 'learn',
  },
  {
    id: 'bai-1-3',
    title: 'Bài 1.3 — Bác sĩ sửa câu lệnh',
    slug: 'bai-1-3-bac-si-sua-cau-lenh',
    status: 'locked',
    stars: 0,
    xpEarned: 0,
    order: 3,
    phase: 'learn',
  },
  {
    id: 'bai-1-4',
    title: 'Bài 1.4 — Chiếc hộp kỳ diệu',
    slug: 'bai-1-4-chiec-hop-ky-dieu',
    status: 'locked',
    stars: 0,
    xpEarned: 0,
    order: 4,
    phase: 'learn',
  },
]

const mockCourses: IslandCourseSummary[] = [
  {
    id: 'aiki-rules',
    slug: 'muoi-quy-tac-xuong-sang-tao',
    title: '10 Quy Tắc Vàng',
    shortTitle: 'Quy Tắc',
    status: 'completed',
    completedCount: 10,
    questCount: 10,
    totalStars: 30,
  },
  {
    id: 'course-2',
    slug: 'dao-1-nha-tham-hiem-ai',
    title: 'Nhà Thám Hiểm AI',
    shortTitle: 'Khám Phá',
    status: 'active',
    completedCount: 1,
    questCount: 4,
    totalStars: 3,
  },
  {
    id: 'course-3',
    slug: 'dao-2-hoa-si-ai',
    title: 'Họa Sĩ AI',
    shortTitle: 'Họa Sĩ',
    status: 'locked',
    completedCount: 0,
    questCount: 4,
    totalStars: 0,
  },
  {
    id: 'course-4',
    slug: 'dao-3-biet-doi-nhan-vat-ai',
    title: 'Biệt Đội Nhân Vật AI',
    shortTitle: 'Nhân Vật',
    status: 'locked',
    completedCount: 0,
    questCount: 4,
    totalStars: 0,
  },
  {
    id: 'course-5',
    slug: 'dao-4-vuong-quoc-truyen-tranh-ai',
    title: 'Vương Quốc Truyện Tranh AI',
    shortTitle: 'Truyện Tranh',
    status: 'locked',
    completedCount: 0,
    questCount: 4,
    totalStars: 0,
  },
  {
    id: 'course-6',
    slug: 'dao-5-nha-phat-minh-tro-choi-ai',
    title: 'Nhà Phát Minh Trò Chơi AI',
    shortTitle: 'Trò Chơi',
    status: 'locked',
    completedCount: 0,
    questCount: 4,
    totalStars: 0,
  },
]

describe('IslandStationsExplorerView', () => {
  it('renders all 5 standard blocks for dao-1-nha-tham-hiem-ai aligned with course-demo', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(IslandStationsExplorerView, {
          courseId: 'dao-1-nha-tham-hiem-ai',
          courseTitle: 'Nhà Thám Hiểm AI',
          quests: mockQuests,
          courses: mockCourses,
          meta: { totalStars: 3, completedCount: 1 },
          getStationSlugFn: (q: QuestProgress) => q.slug || q.id,
        }),
      ),
    )

    // Khối 1: Header điều hướng
    expect(html).toContain('Về Trang Chủ')
    expect(html).toContain('ĐẢO 1')
    expect(html).toContain('3/12 Sao')

    // Khối 2: Sân khấu Đảo Lớn (Grand Island Diorama Stage)
    expect(html).toContain('Đảo Khám Phá — Nhà Thám Hiểm AI')
    expect(html).toContain('Bốn Chiếc Chìa Khóa Vàng (Cái gì? Trông thế nào? Đang làm gì? Ở đâu?)')
    expect(html).toContain('Thuyền Mèo Mee neo bến')
    expect(html).toContain('1/4 trạm xong')

    // Khối 3: Thẻ Thông Báo Thuyền Mèo Mee Navigator
    expect(html).toContain('Đảo 1: Đảo Khám Phá')
    expect(html).toContain('Trạm 1.2')
    expect(html).toContain('Thuyền Mèo Mee neo bến • Học nhận ngay +3 sao')
    expect(html).toContain('Học Tiếp')

    // Khối 4: Dải Thẻ Ngang 6 Đảo Hải Trình
    expect(html).toContain('Hải Trình 6 Đảo Học Tập')
    expect(html).toContain('6 HÒN ĐẢO SÁNG TẠO')

    // Khối 5: Lộ Trình Các Trạm Học
    expect(html).toContain('Lộ Trình Trạm Học: Đảo Khám Phá')
    expect(html).toContain('4 trạm')

    // Station Cards
    expect(html).toContain('Bài 1.1')
    expect(html).toContain('Bài 1.2')
    expect(html).toContain('Bài 1.3')
    expect(html).toContain('Bài 1.4')

    // Action button for in-progress station
    expect(html).toContain('Vào Học Bài 1.2 Ngay (+3 Sao)')

    // Action button for completed station
    expect(html).toContain('Ôn lại trạm này')

    // Action button for locked station
    expect(html).toContain('Khóa (Cần hoàn thành bài trước)')
  })

  it('strictly follows Hallmark UI: zero raw emojis in buttons and badges, zero arrows', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(IslandStationsExplorerView, {
          courseId: 'dao-1-nha-tham-hiem-ai',
          courseTitle: 'Nhà Thám Hiểm AI',
          quests: mockQuests,
          courses: mockCourses,
          meta: { totalStars: 3, completedCount: 1 },
          getStationSlugFn: (q: QuestProgress) => q.slug || q.id,
        }),
      ),
    )

    // Verify Hallmark UI standards
    expect(html).not.toMatch(/[→➔←]/)
    expect(html).not.toContain('->')
    expect(html).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u)
  })

  it('renders all completed state with Trophy celebration block', () => {
    const allCompletedQuests: QuestProgress[] = mockQuests.map((q) => ({
      ...q,
      status: 'completed',
      stars: 3,
      xpEarned: 50,
    }))

    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(IslandStationsExplorerView, {
          courseId: 'dao-1-nha-tham-hiem-ai',
          courseTitle: 'Nhà Thám Hiểm AI',
          quests: allCompletedQuests,
          courses: mockCourses,
          meta: { totalStars: 12, completedCount: 4 },
          getStationSlugFn: (q: QuestProgress) => q.slug || q.id,
        }),
      ),
    )

    expect(html).toContain('Xuất sắc!')
    expect(html).toContain('Con đã hoàn thành toàn bộ hành trình tại Đảo Khám Phá!')
  })

  it('renders interactive island hero with left/right 3D buttons and 6 pagination dots', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(IslandStationsExplorerView, {
          courseId: 'dao-1-nha-tham-hiem-ai',
          courseTitle: 'Nhà Thám Hiểm AI',
          quests: mockQuests,
          courses: mockCourses,
          meta: { totalStars: 3, completedCount: 1 },
          getStationSlugFn: (q: QuestProgress) => q.slug || q.id,
        }),
      ),
    )

    // Tactile 3D Left and Right buttons
    expect(html).toContain('aria-label="Đảo trước đó"')
    expect(html).toContain('aria-label="Đảo kế tiếp"')

    // 6 Island Pagination Dots
    expect(html).toContain('aria-label="Danh sách 6 đảo hải trình"')
    expect(html).toContain('aria-current="page"')
    expect(html).toContain('ĐẢO 1: Khám Phá')
    expect(html).toContain('aria-label="Chuyển đến TIÊN QUYẾT: Đảo Tiên Quyết"')
    expect(html).toContain('aria-label="Chuyển đến ĐẢO 2: Đảo Họa Sĩ"')
    expect(html).toContain('aria-label="Chuyển đến ĐẢO 3: Đảo Nhân Vật"')
    expect(html).toContain('aria-label="Chuyển đến ĐẢO 4: Đảo Truyện Tranh"')
    expect(html).toContain('aria-label="Chuyển đến ĐẢO 5: Đảo Trò Chơi"')
  })

  it('renders hero container with cursor-grab active:cursor-grabbing and smooth fadeIn animation', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(IslandStationsExplorerView, {
          courseId: 'dao-1-nha-tham-hiem-ai',
          courseTitle: 'Nhà Thám Hiểm AI',
          quests: mockQuests,
          courses: mockCourses,
          meta: { totalStars: 3, completedCount: 1 },
          getStationSlugFn: (q: QuestProgress) => q.slug || q.id,
        }),
      ),
    )

    // Gesture grab indicator
    expect(html).toContain('cursor-grab')
    expect(html).toContain('active:cursor-grabbing')

    // Smooth transition & fadeIn animation wrapper
    expect(html).toContain('animate-fadeIn')
    expect(html).toContain('transition-all duration-300 ease-out')
  })

  it('contains AIKID_SIX_ISLAND_PRESETS with all 6 islands configured for slider navigation', async () => {
    const { AIKID_SIX_ISLAND_PRESETS } = await import('./IslandStationsExplorerView')
    expect(AIKID_SIX_ISLAND_PRESETS).toHaveLength(6)

    expect(AIKID_SIX_ISLAND_PRESETS[0].targetSlug).toBe('muoi-quy-tac-xuong-sang-tao')
    expect(AIKID_SIX_ISLAND_PRESETS[0].canonicalSlug).toBe('muoi-quy-tac-xuong-sang-tao')

    expect(AIKID_SIX_ISLAND_PRESETS[1].targetSlug).toBe('dao-1')
    expect(AIKID_SIX_ISLAND_PRESETS[1].canonicalSlug).toBe('dao-1-nha-tham-hiem-ai')

    expect(AIKID_SIX_ISLAND_PRESETS[2].targetSlug).toBe('dao-2')
    expect(AIKID_SIX_ISLAND_PRESETS[2].canonicalSlug).toBe('dao-2-hoa-si-ai')

    expect(AIKID_SIX_ISLAND_PRESETS[3].targetSlug).toBe('dao-3')
    expect(AIKID_SIX_ISLAND_PRESETS[3].canonicalSlug).toBe('dao-3-biet-doi-nhan-vat-ai')

    expect(AIKID_SIX_ISLAND_PRESETS[4].targetSlug).toBe('dao-4')
    expect(AIKID_SIX_ISLAND_PRESETS[4].canonicalSlug).toBe('dao-4-vuong-quoc-truyen-tranh-ai')

    expect(AIKID_SIX_ISLAND_PRESETS[5].targetSlug).toBe('dao-5')
    expect(AIKID_SIX_ISLAND_PRESETS[5].canonicalSlug).toBe('dao-5-nha-phat-minh-tro-choi-ai')
  })
})

