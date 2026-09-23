import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import { WorldProgramIslandCard } from './WorldProgramIslandCard'

describe('WorldProgramIslandCard', () => {
  it('renders official AIKID program card with 6 island milestones and Hallmark styling', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(WorldProgramIslandCard, {
          type: 'aikid',
          totalProgress: 25,
          completedStations: 8,
          totalStations: 32,
          completedCount: 1,
          totalCourses: 6,
          totalStars: 3,
        })
      )
    )

    expect(html).toContain('Khóa sáng tạo nội dung cùng AIKID')
    expect(html).toContain('CHƯƠNG TRÌNH CHÍNH THỨC')
    expect(html).toContain('Hải trình 6 hòn đảo sáng tạo')
    expect(html).toContain('10 Quy tắc vàng')
    expect(html).toContain('Chìa khóa lệnh')
    expect(html).toContain('Tiếp tục học các đảo')
    expect(html).toContain('Xem toàn bộ các đảo')
    expect(html).toContain('shadow-clay')
    expect(html).not.toContain('🐾')
  })

  it('renders coming soon ASMO card with mystical island branding', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(WorldProgramIslandCard, {
          type: 'asmo',
        })
      )
    )

    expect(html).toContain('Toán tư duy &amp; Khoa học AI (ASMO Lab)')
    expect(html).toContain('5 VÙNG ĐẤT ASMO')
    expect(html).toContain('Vùng Đất Kỳ Bí')
    expect(html).toContain('Sắp mở cổng thám hiểm...')
    expect(html).toContain('shadow-clay')
  })

  it('has semantic clean targetSlug and canonicalSlug for all 6 islands', async () => {
    const { AIKID_ISLANDS_META } = await import('./WorldProgramIslandCard')
    expect(AIKID_ISLANDS_META).toHaveLength(6)

    expect(AIKID_ISLANDS_META[0].targetSlug).toBe('dao-1')
    expect(AIKID_ISLANDS_META[0].canonicalSlug).toBe('muoi-quy-tac-xuong-sang-tao')

    expect(AIKID_ISLANDS_META[1].targetSlug).toBe('dao-2')
    expect(AIKID_ISLANDS_META[1].canonicalSlug).toBe('dao-1-nha-tham-hiem-ai')

    expect(AIKID_ISLANDS_META[2].targetSlug).toBe('dao-3')
    expect(AIKID_ISLANDS_META[2].canonicalSlug).toBe('dao-2-hoa-si-ai')

    expect(AIKID_ISLANDS_META[3].targetSlug).toBe('dao-4')
    expect(AIKID_ISLANDS_META[3].canonicalSlug).toBe('dao-3-biet-doi-nhan-vat-ai')

    expect(AIKID_ISLANDS_META[4].targetSlug).toBe('dao-5')
    expect(AIKID_ISLANDS_META[4].canonicalSlug).toBe('dao-4-vuong-quoc-truyen-tranh-ai')

    expect(AIKID_ISLANDS_META[5].targetSlug).toBe('dao-6')
    expect(AIKID_ISLANDS_META[5].canonicalSlug).toBe('dao-5-nha-phat-minh-tro-choi-ai')
  })

  it('renders locked islands as dimmed/disabled when courses report locked status', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(WorldProgramIslandCard, {
          type: 'aikid',
          totalProgress: 0,
          completedCount: 0,
          totalCourses: 6,
          courses: [
            { id: 'dao-1', slug: 'dao-1', title: 'Đảo 1', status: 'available' },
            { id: 'dao-2', slug: 'dao-2', title: 'Đảo 2', status: 'locked' },
            { id: 'dao-3', slug: 'dao-3', title: 'Đảo 3', status: 'locked' },
          ],
        })
      )
    )

    expect(html).toContain('cursor-not-allowed')
    expect(html).toContain('opacity-60')
    expect(html).toContain('Chưa mở khóa')
  })
})
