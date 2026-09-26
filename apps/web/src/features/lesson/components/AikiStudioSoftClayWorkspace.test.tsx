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
  it('renders exactly 1 cat matching Google Sheet SSOT and shows banner instead of animal selector', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<AikiStudioSoftClayWorkspace lessonId="bai-1-1" />)
    })

    const text = container.textContent || ''

    // Verify banner present
    expect(text).toContain('THỰC HÀNH: CÙNG MỘT CON MÈO · HAI CÂU LỆNH (1 TỪ VS 5 ĐIỀU)')
    expect(text).toContain('Mèo AIKI')
    expect(text).toContain('Lượt 1/2')

    // Absolutely NO multiple animal selector (no 'Bé chọn con vật thực hành', no 'Con cá vàng', no 'Con cún', no 'Cái xe đạp')
    expect(text).not.toContain('Bé chọn con vật thực hành')
    expect(text).not.toContain('Con cá vàng')
    expect(text).not.toContain('Con cún')
    expect(text).not.toContain('Cái xe đạp')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('Turn 1: shows Chìa khóa 1 con mèo FIX, dimmed suggestions for keys 2-4 with Gợi ý Lượt 2, prompt “con mèo”, and draw button for Turn 1', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<AikiStudioSoftClayWorkspace lessonId="bai-1-1" />)
    })

    const text = container.textContent || ''

    // Khóa 1: con mèo (Chủ thể: con mèo (FIX))
    expect(text).toContain('1. Cái gì?')
    expect(text).toContain('con mèo')

    // Keys 2, 3, 4 show Gợi ý Lượt 2 with dimmed suggestions
    expect(text).toContain('Gợi ý Lượt 2')
    expect(text).toContain('Lông màu trắng')
    expect(text).toContain('Đang nằm nhắm mắt')
    expect(text).toContain('Ở trước sân')

    // Turn 1 prompt display is only "con mèo"
    expect(text).toContain('CÂU LỆNH: 1 TỪ DUY NHẤT')
    expect(text).toContain('“con mèo”')

    // Draw button for Turn 1
    expect(text).toContain('Vẽ Lượt 1: Một từ duy nhất (con mèo)')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('draws Turn 1, switches to Turn 2 with 5 details prompt, allows drawing Turn 2, and renders side-by-side comparison', async () => {
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
    const drawBtn1 = buttons.find((b) => b.textContent?.includes('Vẽ Lượt 1'))
    expect(drawBtn1).toBeDefined()

    await act(async () => {
      drawBtn1?.click()
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Now in Turn 2
    let text = container.textContent || ''
    expect(text).toContain('Lượt 2/2')
    expect(text).toContain('LƯỢT 2: NĂM ĐIỀU CHI TIẾT')
    expect(text).toContain('CÂU LỆNH: ĐỦ 5 ĐIỀU CHI TIẾT (4/4 CHÌA KHÓA)')
    expect(text).toContain('con mèo · lông màu trắng · đang nằm · nhắm mắt · ở trước sân')
    expect(text).toContain('Vẽ Lượt 2: Năm điều chi tiết')

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
    expect(text).toContain('1. Một từ (con mèo)')
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
    expect(callArg.prompt).toContain('con mèo')
    expect(callArg.prompt).toContain('lông màu trắng')
    expect(callArg.selectedImage.url).toContain('cat_full_details_v1.webp')

    act(() => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
  })
})
