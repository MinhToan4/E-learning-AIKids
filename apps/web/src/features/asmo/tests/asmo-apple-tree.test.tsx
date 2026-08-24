import { createElement, act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AsmoInteractiveAppleTreeCanvas } from '../components/AsmoInteractiveAppleTreeCanvas'
import { AsmoKidsArithmeticVisualizer } from '../components/AsmoKidsArithmeticVisualizer'

describe('AsmoInteractiveAppleTreeCanvas Component', () => {
  let container: HTMLDivElement | null = null

  beforeEach(() => {
    // @ts-expect-error React 19 act environment flag
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container) {
      document.body.removeChild(container)
      container = null
    }
  })

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

    // Tree Mother Soft Clay 2.5D Diorama
    expect(markup).toContain('tree_mother_soft_clay.png')
    expect(markup).toContain('alt="Cây Táo Mẹ Soft Clay 2.5D"')

    // Streamlined realtime calculation bar (no duplicated text/formula)
    expect(markup).toContain('TỔNG SỐ TÁO TRONG CẢ 2 GIỎ')
    expect(markup).not.toContain('quả táo tổng cộng')
    expect(markup).not.toContain('quả táo thơm ngon')
    expect(markup).not.toContain('katex')
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

  it('tracks unique apple identity: tapping specific tree apple removes only that apple from tree and adds it to basket', async () => {
    const onAddApple = vi.fn()
    const onSubApple = vi.fn()
    const root = createRoot(container!)

    await act(async () => {
      root.render(
        createElement(AsmoInteractiveAppleTreeCanvas, {
          applesA: 4, // IDs 0, 1, 2, 3 in basket A; tree has IDs 4..9
          applesB: 3, // IDs 0, 1, 2 in basket B; tree has IDs 3..9
          onAddApple,
          onSubApple,
        }),
      )
    })

    // Find all tree red apple buttons
    const redTreeButtons = container!.querySelectorAll(
      'button[title="Chạm hoặc kéo vào Giỏ A để hái táo đỏ 🍎"]',
    )
    expect(redTreeButtons.length).toBe(6) // IDs 4, 5, 6, 7, 8, 9

    // Find all basket A apple buttons
    const redBasketButtons = container!.querySelectorAll(
      'button[title="Chạm hoặc kéo về cây để trả táo đỏ 🍎"]',
    )
    expect(redBasketButtons.length).toBe(4) // IDs 0, 1, 2, 3

    // Click the 2nd tree apple (which is ID 5)
    await act(async () => {
      redTreeButtons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onAddApple).toHaveBeenCalledWith('A')

    // Tree red apples should now have 5 items left
    const redTreeButtonsAfter = container!.querySelectorAll(
      'button[title="Chạm hoặc kéo vào Giỏ A để hái táo đỏ 🍎"]',
    )
    expect(redTreeButtonsAfter.length).toBe(5)

    // Basket A should now have 5 items
    const redBasketButtonsAfter = container!.querySelectorAll(
      'button[title="Chạm hoặc kéo về cây để trả táo đỏ 🍎"]',
    )
    expect(redBasketButtonsAfter.length).toBe(5)

    // Now click an apple in basket A to return it to tree
    await act(async () => {
      redBasketButtonsAfter[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onSubApple).toHaveBeenCalledWith('A')

    // Basket A count goes back to 4
    const redBasketButtonsFinal = container!.querySelectorAll(
      'button[title="Chạm hoặc kéo về cây để trả táo đỏ 🍎"]',
    )
    expect(redBasketButtonsFinal.length).toBe(4)
  })

  it('supports drag and drop 2-way transitions with appleId preservation', async () => {
    const onAddApple = vi.fn()
    const onSubApple = vi.fn()
    const root = createRoot(container!)

    await act(async () => {
      root.render(
        createElement(AsmoInteractiveAppleTreeCanvas, {
          applesA: 2,
          applesB: 2,
          onAddApple,
          onSubApple,
        }),
      )
    })

    // Drag apple from tree to basket A
    const redTreeButtons = container!.querySelectorAll(
      'button[title="Chạm hoặc kéo vào Giỏ A để hái táo đỏ 🍎"]',
    )
    expect(redTreeButtons.length).toBe(8)

    // Create a mock DataTransfer
    const dataStore: Record<string, string> = {}
    const mockDataTransfer = {
      setData: (k: string, v: string) => {
        dataStore[k] = v
      },
      getData: (k: string) => dataStore[k] || '',
      effectAllowed: 'copyMove',
      dropEffect: 'copy',
    }

    // Trigger dragstart on tree apple ID 7
    const dragStartEvent = new Event('dragstart', { bubbles: true })
    Object.defineProperty(dragStartEvent, 'dataTransfer', { value: mockDataTransfer })
    await act(async () => {
      redTreeButtons[5].dispatchEvent(dragStartEvent)
    })

    expect(dataStore['source']).toBe('tree')
    expect(dataStore['appleType']).toBe('A')
    expect(dataStore['appleId']).toBeDefined()

    // Find basket A drop container and drop the apple
    const basketContainer = container!.querySelector('.grid > div')
    expect(basketContainer).not.toBeNull()

    const dropEvent = new Event('drop', { bubbles: true })
    Object.defineProperty(dropEvent, 'dataTransfer', { value: mockDataTransfer })
    await act(async () => {
      basketContainer!.dispatchEvent(dropEvent)
    })

    expect(onAddApple).toHaveBeenCalledWith('A')
  })

  it('synchronizes correctly when controlled props change from outside', async () => {
    const root = createRoot(container!)

    await act(async () => {
      root.render(
        createElement(AsmoInteractiveAppleTreeCanvas, {
          applesA: 3,
          applesB: 2,
        }),
      )
    })

    let redBasket = container!.querySelectorAll('button[title="Chạm hoặc kéo về cây để trả táo đỏ 🍎"]')
    expect(redBasket.length).toBe(3)

    // Parent updates applesA to 5
    await act(async () => {
      root.render(
        createElement(AsmoInteractiveAppleTreeCanvas, {
          applesA: 5,
          applesB: 2,
        }),
      )
    })

    redBasket = container!.querySelectorAll('button[title="Chạm hoặc kéo về cây để trả táo đỏ 🍎"]')
    expect(redBasket.length).toBe(5)

    // Parent resets applesA to 0
    await act(async () => {
      root.render(
        createElement(AsmoInteractiveAppleTreeCanvas, {
          applesA: 0,
          applesB: 0,
        }),
      )
    })

    redBasket = container!.querySelectorAll('button[title="Chạm hoặc kéo về cây để trả táo đỏ 🍎"]')
    expect(redBasket.length).toBe(0)
  })

  it('resets all apples to tree when reset button is clicked', async () => {
    const onReset = vi.fn()
    const root = createRoot(container!)

    await act(async () => {
      root.render(
        createElement(AsmoInteractiveAppleTreeCanvas, {
          applesA: 4,
          applesB: 3,
          onReset,
        }),
      )
    })

    const resetBtn = container!.querySelector('button[title="Đặt lại thao tác (Đưa tất cả táo về lại cây)"]')
    expect(resetBtn).not.toBeNull()

    await act(async () => {
      resetBtn!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onReset).toHaveBeenCalledTimes(1)
  })
})

