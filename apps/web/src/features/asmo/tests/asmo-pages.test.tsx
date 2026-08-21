import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import { AsmoHubPage } from '../pages/AsmoHubPage'
import { AsmoExamArenaPage } from '../pages/AsmoExamArenaPage'

describe('ASMO Pages', () => {
  it('renders AsmoHubPage initial layout with Olympic title and filters', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(AsmoHubPage),
      ),
    )

    // Hero banner & Global title
    expect(markup).toContain('Đấu Trường Olympic ASMO')
    expect(markup).toContain('Cổng Thi Đấu Olympic Quốc Tế ASMO')
    expect(markup).toContain('Phòng Thí Nghiệm 3D')
    expect(markup).toContain('Chọn Môn Học Olympic')
    expect(markup).toContain('Khối Lớp')
    expect(markup).toContain('Năm Thi')

    // 3 Big Subject Hub Cards
    expect(markup).toContain('Toán Olympic ASMO')
    expect(markup).toContain('Khoa Học Tự Nhiên ASMO')
    expect(markup).toContain('Tiếng Anh Học Thuật ASMO')

    // 2 Action buttons on subject cards
    expect(markup).toContain('Học Lộ Trình LMS')
    expect(markup).toContain('Thi Thử Olympic')

    // Optgroups for grades
    expect(markup).toContain('Tiểu học (Lớp 1 – 5)')
    expect(markup).toContain('THCS (Lớp 6 – 9)')
    expect(markup).toContain('THPT (Lớp 10 – 12)')

    // 1 Big Category Card for 3D Lab
    expect(markup).toContain('Phòng Thí Nghiệm &amp; Mô Phỏng Không Gian 3D')
    expect(markup).toContain('Mở Phòng Lab 3D')
    expect(markup).toContain('Khám Phá 12 Chuyên Đề 3D')

    // Mascot AikidCatCharacter rendering
    expect(markup).toContain('aikid-cat-character')

    // Khu Vực 1: Full-Width LMS Academy
    expect(markup).toContain('Lộ Trình Học Tập Chuẩn LMS ASMO')
    expect(markup).toContain('Bản Đồ Đảo LMS')
    expect(markup).toContain('Chặng 1: Thế Giới Phép Cộng &amp; Phép Trừ')
    expect(markup).toContain('Vào Học Ngay ➔')

    // Khu Vực 2: Full-Width Exam Arena with 3 Subject Tabs
    expect(markup).toContain('Đấu Trường Thi Thử Olympic ASMO')
    expect(markup).toContain('Toán Olympic')
    expect(markup).toContain('Khoa Học Tự Nhiên')
    expect(markup).toContain('Tiếng Anh Học Thuật')
  })

  it('renders AsmoExamArenaPage loading and arena layout', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/asmo/exam/asmo-math-g1-2020-r1'] },
        createElement(AsmoExamArenaPage),
      ),
    )

    expect(markup).toContain('Đang tải đề thi Olympic ASMO')
  })
})
