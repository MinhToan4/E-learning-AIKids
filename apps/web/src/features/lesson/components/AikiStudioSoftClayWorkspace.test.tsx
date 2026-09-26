import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { AikiStudioSoftClayWorkspace } from './AikiStudioSoftClayWorkspace'

describe('AikiStudioSoftClayWorkspace - Bài 1.2 Bốn chiếc chìa khoá', () => {
  it('renders exactly 2 practice items (Con cún & Cái xe đạp) matching Excel SSOT', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<AikiStudioSoftClayWorkspace lessonId="bai-1-2" />)
    })

    const text = container.textContent || ''

    // Verify 2 items count
    expect(text).toContain('2 món')

    // Verify item titles present
    expect(text).toContain('Con cún')
    expect(text).toContain('Cái xe đạp')

    // Absolutely NO Cuốn sách or Cái đồng hồ
    expect(text).not.toContain('Cuốn sách')
    expect(text).not.toContain('Cái đồng hồ')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('generates accurate prompt with "Một con cún" prefix and dog vocabulary', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<AikiStudioSoftClayWorkspace lessonId="bai-1-2" />)
    })

    const text = container.textContent || ''

    // Initial item is Con cún
    // Check that prompt contains exact prefix and vocabulary
    expect(text).toContain('Một con cún')
    expect(text).toContain('lông vàng hai tai cụp')
    expect(text).toContain('đang chạy đuổi quả bóng')
    expect(text).toContain('ở góc sân gạch đỏ')

    // Absolutely NO "Một chú con cún" or "Một chú cái xe đạp"
    expect(text).not.toContain('Một chú con cún')
    expect(text).not.toContain('Một chú cái xe đạp')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('switches to Cái xe đạp, uses "Một cái xe đạp" prefix, bicycle vocabulary, and does NOT fallback to cat', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<AikiStudioSoftClayWorkspace lessonId="bai-1-2" />)
    })

    // Switch to Part 2: Cái xe đạp
    // Find button containing 'Cái xe đạp'
    const buttons = Array.from(container.querySelectorAll('button'))
    const bikeBtn = buttons.find((b) => b.textContent?.includes('Cái xe đạp'))
    expect(bikeBtn).toBeDefined()

    await act(async () => {
      bikeBtn?.click()
    })

    const text = container.textContent || ''

    // Verify prompt updated for Cái xe đạp
    expect(text).toContain('Một cái xe đạp')
    expect(text).toContain('cũ sơn xanh bong từng mảng')
    expect(text).toContain('đang dựa nghiêng vào tường')
    expect(text).toContain('ở góc sân gạch')

    // Check vocabulary options for bicycle
    expect(text).toContain('Cũ sơn xanh bong từng mảng')
    expect(text).toContain('Xe mini có giỏ mây trước')
    expect(text).toContain('Màu đỏ còn mới chuông sáng')
    expect(text).toContain('Đang dựa nghiêng vào tường')
    expect(text).toContain('Giỏ trước đang chở bó rau')
    expect(text).toContain('Đang đổ nằm trên nền đất')
    expect(text).toContain('Ở góc sân gạch')
    expect(text).toContain('Trước cổng trường')

    // Artwork check: must be island1_lesson2_bicycle.jpg and NEVER cat
    const mainCanvasImg = container.querySelector('img[alt="Cái xe đạp"]') as HTMLImageElement
    expect(mainCanvasImg).not.toBeNull()
    expect(mainCanvasImg.src).toContain('island1_lesson2_bicycle.jpg')
    expect(mainCanvasImg.src).not.toContain('cat')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('updates prompt when selecting different Golden Key options', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<AikiStudioSoftClayWorkspace lessonId="bai-1-2" />)
    })

    const buttons = Array.from(container.querySelectorAll('button'))

    // Click 'Trắng đốm nâu quanh mắt'
    const altDescBtn = buttons.find((b) => b.textContent?.includes('Trắng đốm nâu quanh mắt'))
    expect(altDescBtn).toBeDefined()
    await act(async () => {
      altDescBtn?.click()
    })
    expect(container.textContent).toContain('trắng đốm nâu quanh mắt')

    // Click 'Đang tha một chiếc dép'
    const altActionBtn = buttons.find((b) => b.textContent?.includes('Đang tha một chiếc dép'))
    expect(altActionBtn).toBeDefined()
    await act(async () => {
      altActionBtn?.click()
    })
    expect(container.textContent).toContain('đang tha một chiếc dép')

    // Click 'Trên thảm phòng khách'
    const altContextBtn = buttons.find((b) => b.textContent?.includes('Trên thảm phòng khách'))
    expect(altContextBtn).toBeDefined()
    await act(async () => {
      altContextBtn?.click()
    })
    expect(container.textContent).toContain('trên thảm phòng khách')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('allows drawing 1 turn per item and submits work properly', async () => {
    vi.useFakeTimers()
    const onSubmitWork = vi.fn()

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioSoftClayWorkspace
          lessonId="bai-1-2"
          initialAttemptsLeft={2}
          onSubmitWork={onSubmitWork}
        />
      )
    })

    // Draw Part 1
    expect(container.textContent).toContain('Vẽ tranh cùng AIKI · còn 2 lượt')

    const buttons = Array.from(container.querySelectorAll('button'))
    const drawBtn = buttons.find((b) => b.textContent?.includes('Vẽ tranh cùng AIKI'))
    expect(drawBtn).toBeDefined()

    await act(async () => {
      drawBtn?.click()
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Turn count decreased to 1
    expect(container.textContent).toContain('Vẽ tranh cùng AIKI · còn 1 lượt')

    // Open submit modal and confirm submit
    const submitBtn = container.querySelector('[data-testid="studio-submit-btn"]') as HTMLButtonElement
    expect(submitBtn).toBeDefined()
    await act(async () => {
      submitBtn.click()
    })

    const confirmSubmitBtn = container.querySelector('[data-testid="studio-confirm-submit"]') as HTMLButtonElement
    expect(confirmSubmitBtn).toBeDefined()
    await act(async () => {
      confirmSubmitBtn.click()
    })

    expect(onSubmitWork).toHaveBeenCalledTimes(1)
    const callArg = onSubmitWork.mock.calls[0][0]
    expect(callArg.prompt).toContain('Một con cún')
    expect(callArg.selectedImage.url).toContain('dog_full_details_v1.webp')

    act(() => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
  })
})

describe('AikiStudioSoftClayWorkspace - Bài 1.1 Một từ hay năm từ', () => {
  it('renders exactly 3 animals (Con mèo, Con cá vàng, Con cún) matching Excel SSOT', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<AikiStudioSoftClayWorkspace lessonId="bai-1-1" />)
    })

    const text = container.textContent || ''

    // Verify 3 items count
    expect(text).toContain('3 con')
    expect(text).toContain('Con mèo')
    expect(text).toContain('Con cá vàng')
    expect(text).toContain('Con cún')

    // Absolutely NO bicycle or other irrelevant items
    expect(text).not.toContain('Cái xe đạp')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('Turn 1 unlocks all Golden Keys, allows student to freely select prompt chips, and updates prompt dynamically', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<AikiStudioSoftClayWorkspace lessonId="bai-1-1" />)
    })

    let text = container.textContent || ''

    // Keys 2, 3, 4 NO LONGER show lock overlays
    expect(text).not.toContain('Khóa ở Lượt 1')
    expect(text).not.toContain('AIKI sẽ tự điền')

    // Initial prompt contains full keys with Con mèo
    expect(text).toContain('Con mèo')
    expect(text).toContain('mướp vằn nâu béo tròn')
    expect(text).toContain('đang ngủ cuộn tròn')
    expect(text).toContain('trên ghế mây cạnh cửa sổ')

    // Student can freely click chips in Turn 1
    const buttons = Array.from(container.querySelectorAll('button'))
    const whiteFurBtn = buttons.find((b) => b.textContent?.includes('Trắng lông xù dài'))
    expect(whiteFurBtn).toBeDefined()
    expect(whiteFurBtn?.hasAttribute('disabled')).toBe(false)

    await act(async () => {
      whiteFurBtn?.click()
    })

    text = container.textContent || ''
    expect(text).toContain('trắng lông xù dài')

    // Select action
    const chaseButterflyBtn = buttons.find((b) => b.textContent?.includes('Đang rình con bướm'))
    expect(chaseButterflyBtn).toBeDefined()
    expect(chaseButterflyBtn?.hasAttribute('disabled')).toBe(false)

    await act(async () => {
      chaseButterflyBtn?.click()
    })

    text = container.textContent || ''
    expect(text).toContain('đang rình con bướm')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('draws Turn 1, unlocks Keys 2-4 for Turn 2, shows 5-detail prompt, allows drawing Turn 2, and renders side-by-side comparison', async () => {
    vi.useFakeTimers()
    const onSubmitWork = vi.fn()

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioSoftClayWorkspace
          lessonId="bai-1-1"
          onSubmitWork={onSubmitWork}
        />
      )
    })

    // Draw Turn 1
    const buttons = Array.from(container.querySelectorAll('button'))
    const drawBtn = buttons.find((b) => b.textContent?.includes('Vẽ Lượt 1'))
    expect(drawBtn).toBeDefined()

    await act(async () => {
      drawBtn?.click()
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Now in Turn 2
    let text = container.textContent || ''
    expect(text).toContain('Lượt 2: Đủ 5 điều')
    expect(text).toContain('Vẽ Lượt 2 (5 điều chi tiết)')
    expect(text).toContain('CÂU LỆNH: ĐỦ 5 ĐIỀU CHI TIẾT (4/4 CHÌA KHÓA)')
    expect(text).toContain('mướp vằn nâu béo tròn')
    expect(text).toContain('đang ngủ cuộn tròn')
    expect(text).toContain('trên ghế mây cạnh cửa sổ')

    // Keys 2, 3, 4 are unlocked; select alternative option
    const newButtons = Array.from(container.querySelectorAll('button'))
    const calicoBtn = newButtons.find((b) => b.textContent?.includes('Tam thể ba màu'))
    expect(calicoBtn).toBeDefined()

    await act(async () => {
      calicoBtn?.click()
    })

    expect(container.textContent).toContain('tam thể ba màu')

    // Draw Turn 2
    const drawBtn2 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Vẽ Lượt 2')
    )
    expect(drawBtn2).toBeDefined()

    await act(async () => {
      drawBtn2?.click()
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Now side-by-side comparison is rendered!
    text = container.textContent || ''
    expect(text).toContain('So sánh 2 bức tranh của bé')
    expect(text).toContain('1. Một từ (Con mèo)')
    expect(text).toContain('2. Năm điều')
    expect(text).toContain('Vì sao con thích bức này hơn?')

    // Submit work
    const submitBtn = container.querySelector('[data-testid="studio-submit-btn"]') as HTMLButtonElement
    expect(submitBtn).toBeDefined()
    await act(async () => {
      submitBtn.click()
    })

    const confirmSubmitBtn = container.querySelector('[data-testid="studio-confirm-submit"]') as HTMLButtonElement
    expect(confirmSubmitBtn).toBeDefined()
    await act(async () => {
      confirmSubmitBtn.click()
    })

    expect(onSubmitWork).toHaveBeenCalledTimes(1)
    const callArg = onSubmitWork.mock.calls[0][0]
    expect(callArg.prompt).toContain('Con mèo')
    expect(callArg.selectedImage.url).toContain('cat_full_details_v1.webp')

    act(() => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
  })
})
