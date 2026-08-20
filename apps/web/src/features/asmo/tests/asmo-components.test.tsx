import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { AsmoFormula } from '../components/AsmoFormula'
import { AsmoMeeTutor } from '../components/AsmoMeeTutor'
import { AsmoExamTimer } from '../components/AsmoExamTimer'

import { AsmoTrigLabVisualizer, SPECIAL_ANGLES } from '../components/AsmoTrigLabVisualizer'

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

  it('preserves natural Vietnamese text and does NOT wrap words like xanh = 7 into KaTeX', () => {
    const naturalSentence = 'Tuyệt vời bé ơi! 3 quả đỏ + 4 quả xanh = 7 quả táo thơm ngon!'
    const markup = renderToStaticMarkup(
      createElement(AsmoFormula, { text: naturalSentence }),
    )
    // Should NOT wrap xanh into katex
    expect(markup).not.toContain('katex')
    expect(markup).toContain('Tuyệt vời bé ơi! 3 quả đỏ + 4 quả xanh = 7 quả táo thơm ngon!')
  })

  it('correctly handles equations with single-letter variables while ignoring Vietnamese words', () => {
    const mixed = 'Biết rằng x + 4 = 7, hãy tìm x. Kết quả = 3.'
    const markup = renderToStaticMarkup(
      createElement(AsmoFormula, { text: mixed }),
    )
    expect(markup).toContain('katex')
    expect(markup).toContain('Kết quả = 3')
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

  it('renders AsmoTrigLabVisualizer with 2-tier header, 3 tabs, and KaTeX square roots for 30 deg', () => {
    const markup = renderToStaticMarkup(
      createElement(AsmoTrigLabVisualizer, { initialAngle: 30 }),
    )
    // Header & Tabs
    expect(markup).toContain('Phòng Thí Nghiệm Lượng Giác ASMO')
    expect(markup).toContain('Live Interactive Lab')
    expect(markup).toContain('Đường Tròn Đơn Vị')
    expect(markup).toContain('Sóng Lượng Giác')
    expect(markup).toContain('Công Thức Lớp 11')

    // SVG ViewBox 0 0 340 340
    expect(markup).toContain('viewBox="0 0 340 340"')

    // KaTeX Formulas & Pythagoras
    expect(markup).toContain('katex')
    expect(markup).toContain('Hằng đẳng thức Pythagoras')

    // Special angles array has accurate sqrt symbols
    const angle30 = SPECIAL_ANGLES.find((a) => a.deg === 30)
    expect(angle30?.cosExact).toBe('\\frac{\\sqrt{3}}{2}')
    expect(angle30?.tanExact).toBe('\\frac{\\sqrt{3}}{3}')
    expect(angle30?.cotExact).toBe('\\sqrt{3}')
  })
})
