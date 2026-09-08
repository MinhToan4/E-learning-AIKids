import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import { AsmoHubPage, getStageIdForGrade } from '../pages/AsmoHubPage'
import { AsmoExamArenaPage } from '../pages/AsmoExamArenaPage'

describe('ASMO Pages', () => {
  it('renders a focused ASMO choice and only the learning journey initially', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(AsmoHubPage),
      ),
    )

    expect(markup).toContain('Hôm nay con muốn làm gì?')
    expect(markup).toContain('Học theo lộ trình')
    expect(markup).toContain('Thi thử')
    expect(markup).toContain('aikid-cat-character')
    expect(markup).toContain('Chặng học của con')
    expect(markup).toContain('Lớp của con')
    expect(markup).toContain('course-map-hero')
    expect(markup).toContain('course-map-ribbon')
    expect(markup).not.toContain('course-station-map')
    expect(markup).toContain('Bắt đầu học')
    expect(markup).toContain('Khám phá Phòng Lab 3D')
    expect(markup).not.toContain('Chọn đề phù hợp')
    expect(markup).not.toContain('Năm đề')
  })

  it('accurately maps each grade (1-12) to the corresponding Adventure Island Stage', () => {
    // Lớp 1-2 ➔ Đảo 1 (stage-1)
    expect(getStageIdForGrade(1)).toBe('stage-1')
    expect(getStageIdForGrade(2)).toBe('stage-1')

    // Lớp 3 ➔ Đảo 2 (stage-2)
    expect(getStageIdForGrade(3)).toBe('stage-2')

    // Lớp 4-5 ➔ Đảo 3 (stage-3)
    expect(getStageIdForGrade(4)).toBe('stage-3')
    expect(getStageIdForGrade(5)).toBe('stage-3')

    // Lớp 6-8 ➔ Đảo 4 (stage-4)
    expect(getStageIdForGrade(6)).toBe('stage-4')
    expect(getStageIdForGrade(7)).toBe('stage-4')
    expect(getStageIdForGrade(8)).toBe('stage-4')

    // Lớp 9-12 ➔ Đảo 5 (stage-5)
    expect(getStageIdForGrade(9)).toBe('stage-5')
    expect(getStageIdForGrade(10)).toBe('stage-5')
    expect(getStageIdForGrade(11)).toBe('stage-5')
    expect(getStageIdForGrade(12)).toBe('stage-5')
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
