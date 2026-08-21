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

    expect(markup).toContain('Đấu Trường Olympic ASMO')
    expect(markup).toContain('Phòng Thí Nghiệm 3D')
    expect(markup).toContain('Chọn Môn Học Olympic')
    expect(markup).toContain('Khối Lớp')
    expect(markup).toContain('Năm Thi')

    // 3 Big Subject Hub Cards
    expect(markup).toContain('Toán Olympic ASMO')
    expect(markup).toContain('Khoa Học Tự Nhiên ASMO')
    expect(markup).toContain('Tiếng Anh Học Thuật ASMO')
    expect(markup).toContain('Vào Luyện Đề Toán')
    expect(markup).toContain('Vào Luyện Đề Khoa Học')
    expect(markup).toContain('Vào Luyện Đề Tiếng Anh')

    // Optgroups for grades
    expect(markup).toContain('Tiểu học (Lớp 1 – 5)')
    expect(markup).toContain('THCS (Lớp 6 – 9)')
    expect(markup).toContain('THPT (Lớp 10 – 12)')

    // 1 Big Category Card for 3D Lab
    expect(markup).toContain('Mở Phòng Lab 3D')
    expect(markup).toContain('Khám Phá 12 Chuyên Đề 3D')

    // LMS 5-stage Roadmap & Exam Arena
    expect(markup).toContain('Lộ Trình 5 Chặng LMS ASMO')
    expect(markup).toContain('Đấu Trường Thi Thử ASMO')
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
