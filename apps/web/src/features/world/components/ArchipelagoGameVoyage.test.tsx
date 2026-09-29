import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import { ArchipelagoGameVoyage } from './ArchipelagoGameVoyage'

describe('ArchipelagoGameVoyage', () => {
  it('renders unified card layout without empty right info card column', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(ArchipelagoGameVoyage, {
          courses: [
            {
              id: 'dao-1',
              title: 'Đảo Tiên Quyết',
              shortTitle: '10 Quy tắc vàng',
              description: 'Nắm vững 10 nguyên tắc',
              status: 'completed',
              totalStars: 15,
              questCount: 5,
              completedCount: 5,
            },
            {
              id: 'dao-2',
              title: 'Đảo Khám Phá',
              shortTitle: '4 Chìa khóa lệnh',
              description: 'Tạo hình ảnh đơn lẻ',
              status: 'active',
              totalStars: 6,
              questCount: 4,
              completedCount: 2,
            },
          ] as any,
        })
      )
    )

    // Should NOT have the old empty right-hand side column
    expect(html).not.toContain('w-full lg:w-80 shrink-0')
    expect(html).not.toContain('Info Card side')

    // Should have the unified card with soft clay styling
    expect(html).toContain('rounded-[2rem]')
    expect(html).toContain('shadow-clay')
    expect(html).toContain('Lộ Trình Trạm Học:')
  })

  it('renders compact diorama header and 2-column station grid', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(ArchipelagoGameVoyage)
      )
    )

    // Header has progress information
    expect(html).toContain('Tiến độ:')
    expect(html).toContain('trạm xong')

    // Stations roadmap rendered in 2-column responsive grid
    expect(html).toContain('grid grid-cols-1 sm:grid-cols-2')
    expect(html).toContain('TRẠM 1')
  })

  it('complies strictly with Hallmark UI: zero emoji glyphs and zero arrows', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(ArchipelagoGameVoyage)
      )
    )

    // Zero emoji glyphs in buttons or badges
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu
    expect(html.match(emojiRegex)).toBeNull()

    // Zero star emoji
    expect(html).not.toContain('⭐')

    // Zero arrows in buttons
    expect(html).not.toContain('→')
    expect(html).not.toContain('➔')
    expect(html).not.toContain('->')
    expect(html).not.toContain('←')
  })

  it('contains zero bezier SVG path drawings and zero extraneous program switchers', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(ArchipelagoGameVoyage)
      )
    )

    // No SVG bezier curve connections
    expect(html).not.toContain('viewBox="0 0 100 100"')
    expect(html).not.toContain('strokeDasharray')

    // No program switcher tabs or fake program cards
    expect(html).not.toContain('Khóa Chính (6 Đảo)')
    expect(html).not.toContain('Chương Trình Chuẩn')

    // Focuses strictly on AIKids Official Voyage
    expect(html).toContain('Hải Trình 6 Đảo Sáng Tạo')
    expect(html).toContain('1 Đảo Quy Tắc + 5 Đảo Học AI')
  })

  it('resolves exactly 10 Golden Rules for Island 1 and uses compact layout without oversized buttons', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(ArchipelagoGameVoyage)
      )
    )

    // Island 1 must have exactly 10 stations (TRẠM 10 present, TRẠM 11 NOT present, and NOT 20 trạm)
    expect(html).toContain('TRẠM 10')
    expect(html).not.toContain('TRẠM 11')
    expect(html).not.toContain('/20 trạm')
    expect(html).toContain('Nghĩ ý tưởng trước khi hỏi AI')

    // Must NOT have oversized "Chưa mở khóa" buttons
    expect(html).not.toContain('>Chưa mở khóa<')
  })
})
