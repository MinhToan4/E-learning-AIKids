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
})
