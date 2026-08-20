import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { AsmoFormula } from '../components/AsmoFormula'
import { AsmoMeeTutor } from '../components/AsmoMeeTutor'
import { AsmoExamTimer } from '../components/AsmoExamTimer'

describe('ASMO UI Components', () => {
  it('renders AsmoFormula with KaTeX output', () => {
    const markup = renderToStaticMarkup(
      createElement(AsmoFormula, { text: 'Tìm giá trị của $3 \\times 5 + 2$' }),
    )
    expect(markup).toContain('katex')
    expect(markup).toContain('Tìm giá trị của')
  })

  it('renders unwrapped LaTeX commands using Auto-Math Fallback Engine', () => {
    const markup = renderToStaticMarkup(
      createElement(AsmoFormula, { text: 'Nghiệm là 0, \\ln(3) với \\frac{a}{b} và \\sqrt{x}' }),
    )
    expect(markup).toContain('katex')
    expect(markup).toContain('ln')
  })

  it('renders unwrapped exponential equations and powers with Auto-Math Fallback Engine', () => {
    const markup = renderToStaticMarkup(
      createElement(AsmoFormula, { text: 'Giải phương trình e^(2x) - 4e^x + 3 = 0 và x^2 - 4 = 0 với a^b' }),
    )
    expect(markup).toContain('katex')
  })

  it('renders AsmoMeeTutor with character, pose and speech', () => {
    const markup = renderToStaticMarkup(
      createElement(AsmoMeeTutor, {
        pose: 'celebrate',
        speech: 'Chúc mừng con đã giải đúng!',
        hint: 'Quan sát các khối tầng 1',
      }),
    )
    expect(markup).toContain('Mèo Mee')
    expect(markup).toContain('Chúc mừng con đã giải đúng!')
    expect(markup).toContain('Lời Khuyên Từ Trợ Giảng AI')
  })

  it('renders AsmoExamTimer with formatted time and progress bar', () => {
    const markup = renderToStaticMarkup(
      createElement(AsmoExamTimer, { durationMinutes: 45 }),
    )
    expect(markup).toContain('45:00')
  })
})
