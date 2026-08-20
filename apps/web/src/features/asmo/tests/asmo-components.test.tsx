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

  it('renders AsmoMeeTutor with character, pose, speech, KaTeX hint, and secretTip', () => {
    const markup = renderToStaticMarkup(
      createElement(AsmoMeeTutor, {
        pose: 'celebrate',
        speech: 'Chúc mừng con đã giải đúng!',
        hint: 'Góc $150^\\circ$ ở góc phần tư II nên $\\sin(150^\\circ) = \\frac{1}{2}$',
        secretTip: '"Sin đứng, Cos nằm" · "Nhất cả (+,+), Nhì sin (-,+)"',
      }),
    )
    expect(markup).toContain('Mèo Mee')
    expect(markup).toContain('Chúc mừng con đã giải đúng!')
    expect(markup).toContain('Lời Khuyên Từ Trợ Giảng AI')
    expect(markup).toContain('Bí kíp Mèo Mee')
    expect(markup).toContain('Sin đứng, Cos nằm')
    // Hint button is rendered
    expect(markup).toContain('Mee ơi, gợi ý cho con nhé!')
  })

  it('renders AsmoExamTimer with formatted time and progress bar', () => {
    const markup = renderToStaticMarkup(
      createElement(AsmoExamTimer, { durationMinutes: 45 }),
    )
    expect(markup).toContain('45:00')
  })

  it('renders AsmoTrigLabVisualizer with single-column layout, level-dedicated models, and KaTeX special angles', () => {
    const markup = renderToStaticMarkup(
      createElement(AsmoTrigLabVisualizer, { initialAngle: 30 }),
    )
    // Header & Badges
    expect(markup).toContain('Phòng Thí Nghiệm Lượng Giác ASMO')
    expect(markup).toContain('Live Interactive Lab')
    expect(markup).toContain('Đường Tròn Đơn Vị')

    // Compact 1-line ribbon
    expect(markup).toContain('Bí kíp Mèo Mee')
    expect(markup).toContain('Sin đứng, Cos nằm')

    // SVG ViewBox 0 0 380 340 for full column unit circle
    expect(markup).toContain('viewBox="0 0 380 340"')

    // All 4 distinct math cards for sin, cos, tan, cot + Pythagoras
    expect(markup).toContain('Trục đứng')
    expect(markup).toContain('Trục ngang')
    expect(markup).toContain('Trục tiếp tuyến')
    expect(markup).toContain('katex')
    expect(markup).toContain('Hằng đẳng thức Pythagoras')

    // Special angles array has accurate sqrt symbols
    const angle30 = SPECIAL_ANGLES.find((a) => a.deg === 30)
    expect(angle30?.cosExact).toBe('\\frac{\\sqrt{3}}{2}')
    expect(angle30?.tanExact).toBe('\\frac{\\sqrt{3}}{3}')
    expect(angle30?.cotExact).toBe('\\sqrt{3}')

    // Level 2 renders double angle formula model with compact ribbon
    const markupL2 = renderToStaticMarkup(
      createElement(AsmoTrigLabVisualizer, { level: 2, demoSinValue: 1 / 3 }),
    )
    expect(markupL2).toContain('Công Thức Lớp 11')
    expect(markupL2).toContain('Mô Hình Góc Đôi')
    expect(markupL2).toContain('Bí kíp Mèo Mee')
    expect(markupL2).toContain('Cho')

    // Level 3 renders Olympic equation model with compact ribbon
    const markupL3 = renderToStaticMarkup(
      createElement(AsmoTrigLabVisualizer, { level: 3 }),
    )
    expect(markupL3).toContain('Olympic Chuyên Sâu')
    expect(markupL3).toContain('Biến Đổi Vế Trái')
    expect(markupL3).toContain('Bí kíp Mèo Mee')
    expect(markupL3).toContain('Cặp song sinh Olympic')
  })
})
