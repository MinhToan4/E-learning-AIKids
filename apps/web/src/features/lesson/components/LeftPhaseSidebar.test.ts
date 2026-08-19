import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LeftPhaseSidebar } from './LeftPhaseSidebar'

describe('LeftPhaseSidebar', () => {
  it('renders the character and guide copy', () => {
    const markup = renderToStaticMarkup(
      createElement(LeftPhaseSidebar, {
        guideCopy: { eyebrow: 'Hi', title: 'Test Title', body: 'Test Body', pose: 'welcome' as const },
        phase: 'learn',
        maxUnlockedPhase: 'practice',
        goals: ['Hiểu mục tiêu'],
        product: 'Một sản phẩm nhỏ',
      })
    )

    expect(markup).toContain('Test Title')
    expect(markup).toContain('Test Body')
    expect(markup).toContain('Hành trình trạm')
    expect(markup).toContain('Mục tiêu của con')
    expect(markup).toContain('Một sản phẩm nhỏ')
    expect(markup).toContain('data-pose="welcome"')
    expect(markup).toContain('Mee đang chào con')
  })
})
