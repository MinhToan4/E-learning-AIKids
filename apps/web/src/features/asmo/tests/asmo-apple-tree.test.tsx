import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, it, expect } from 'vitest'
import { AsmoInteractiveAppleTreeCanvas } from '../components/AsmoInteractiveAppleTreeCanvas'
import { AsmoKidsArithmeticVisualizer } from '../components/AsmoKidsArithmeticVisualizer'

describe('AsmoInteractiveAppleTreeCanvas Component', () => {
  it('renders tree canopy, two soft clay baskets, and initial apple counts', () => {
    const markup = renderToStaticMarkup(
      createElement(AsmoInteractiveAppleTreeCanvas, {
        applesA: 4,
        applesB: 3,
      }),
    )

    // Streamlined Mission Bar & Tree Canopy
    expect(markup).toContain('🍎 Chạm hoặc kéo táo vào giỏ để gộp thành 10 nhé! 🧺')
    expect(markup).toContain('Cây Táo Mẹ')
    expect(markup).toContain('6 quả đỏ')
    expect(markup).toContain('7 quả xanh')

    // Baskets
    expect(markup).toContain('Giỏ A (Táo Đỏ):')
    expect(markup).toContain('Giỏ B (Táo Xanh):')

    // Apples in baskets
    expect(markup).toContain('4 / 10 🍎')
    expect(markup).toContain('3 / 10 🍏')

    // Realtime calculation bar
    expect(markup).toContain('Tổng số táo trong cả 2 giỏ')
    expect(markup).toContain('7 quả táo tổng cộng')
    expect(markup).toContain('7 quả táo thơm ngon')
    expect(markup).toContain('katex')
  })

  it('verifies baskets are stable (no bounce animation) and pedestal buttons are removed', () => {
    const markup = renderToStaticMarkup(
      createElement(AsmoInteractiveAppleTreeCanvas, {
        applesA: 4,
        applesB: 3,
      }),
    )

    // Verify no pedestal minus/plus buttons exist
    expect(markup).not.toContain('Bớt táo đỏ giỏ A')
    expect(markup).not.toContain('Thêm táo đỏ giỏ A')
    expect(markup).not.toContain('Bớt táo xanh giỏ B')
    expect(markup).not.toContain('Thêm táo xanh giỏ B')

    // Verify apples inside baskets are draggable for returning to tree (Two-way interaction)
    expect(markup).toContain('title="Chạm hoặc kéo về cây để trả táo đỏ 🍎"')
    expect(markup).toContain('title="Chạm hoặc kéo về cây để trả táo xanh 🍏"')
    expect(markup).toContain('draggable="true"')
  })

  it('renders customized title, instructions, and mee quote', () => {
    const markup = renderToStaticMarkup(
      createElement(AsmoInteractiveAppleTreeCanvas, {
        applesA: 5,
        applesB: 5,
        title: 'Thử thách 3: Sáng Tạo Phép Cộng Tròn 10',
        instruction: 'Bé hãy tạo một phép cộng tự do sao cho tổng đúng bằng 10 quả táo!',
        meeQuote: '🐱 Mèo Mee: Cố lên bé ơi, 10 quả táo đang chờ bé!',
      }),
    )

    expect(markup).toContain('Thử thách 3: Sáng Tạo Phép Cộng Tròn 10')
    expect(markup).toContain('Bé hãy tạo một phép cộng tự do sao cho tổng đúng bằng 10 quả táo!')
    expect(markup).toContain('🐱 Mèo Mee: Cố lên bé ơi, 10 quả táo đang chờ bé!')
    expect(markup).toContain('10 quả táo tổng cộng')
    expect(markup).toContain('10 quả táo thơm ngon')
  })

  it('renders empty basket state hints when counts are 0', () => {
    const markup = renderToStaticMarkup(
      createElement(AsmoInteractiveAppleTreeCanvas, {
        applesA: 0,
        applesB: 0,
      }),
    )

    expect(markup).toContain('Chạm hoặc kéo táo đỏ 🍎 vào giỏ A')
    expect(markup).toContain('Chạm hoặc kéo táo xanh 🍏 vào giỏ B')
    expect(markup).toContain('0 quả táo tổng cộng')
    expect(markup).toContain('0 quả táo thơm ngon')
  })

  it('renders within AsmoKidsArithmeticVisualizer in addition mode seamlessly', () => {
    const markup = renderToStaticMarkup(
      createElement(AsmoKidsArithmeticVisualizer, {
        mode: 'addition',
      }),
    )

    expect(markup).toContain('Phép Cộng Thần Tốc: Vườn Táo &amp; Hai Giỏ Mây 3D')
    expect(markup).toContain('Giỏ A (Táo Đỏ):')
    expect(markup).toContain('Giỏ B (Táo Xanh):')
    expect(markup).toContain('Trả Táo Về Cây')
  })
})
