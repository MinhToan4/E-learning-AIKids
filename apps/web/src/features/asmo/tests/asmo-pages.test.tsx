import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, vi } from 'vitest'
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

    expect(markup).toContain('Chinh Phục ASMO')
    expect(markup).toContain('Phòng Thí Nghiệm 3D')
    expect(markup).toContain('Chọn Môn Học Olympic')
    expect(markup).toContain('Khối Lớp')
    expect(markup).toContain('Năm Thi')
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
