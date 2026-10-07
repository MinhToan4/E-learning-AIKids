import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AikiStudioSoftClayWorkspace } from './AikiStudioSoftClayWorkspace'
import { learningApi } from '@/shared/lib/learning-api'

const createMemoryStorage = (): Storage => {
  const values = new Map<string, string>()

  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  }
}

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: createMemoryStorage(),
    writable: true,
    configurable: true,
  })
  Object.defineProperty(window, 'sessionStorage', {
    value: createMemoryStorage(),
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.body.replaceChildren()
})

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
      vi.advanceTimersByTime(3100)
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
      vi.advanceTimersByTime(3100)
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
      vi.advanceTimersByTime(3100)
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

  it('verifies 2-step stepper, AIKI speech bubble messages, blank vs 5-detail key states, and side-by-side comparison canvas', async () => {
    vi.useFakeTimers()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<AikiStudioSoftClayWorkspace lessonId="bai-1-1" />)
    })

    // ── STEP 1 VERIFICATION ──
    let text = container.textContent || ''
    // Header Stepper
    expect(text).toContain('Bước 1: Thử thách 1 từ')
    expect(text).toContain('Chỉ nói “con mèo” ➔ AIKI tự đoán')
    expect(text).toContain('Bước 2: Nâng cấp 5 điều')
    expect(text).toContain('Nói đủ 5 điều ➔ AIKI vẽ đúng ý')
    // AIKI Speech bubble Step 1
    expect(text).toContain('Đầu tiên, bé hãy thử thách AIKI bằng đúng 1 từ \'con mèo\' xem tớ vẽ thế nào nhé!')

    // Key 1 has badge [1] and (Từ thứ 1)
    expect(text).toContain('[1]')
    expect(text).toContain('(Từ thứ 1)')

    // Keys 2, 3, 4 show ❓ Bỏ trống — AIKI tự đoán
    expect(text).toContain('❓ Bỏ trống — AIKI tự đoán')

    // Draw Step 1
    const drawBtn1 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Vẽ Lượt 1')
    )
    expect(drawBtn1).toBeDefined()
    await act(async () => {
      drawBtn1?.click()
    })
    act(() => {
      vi.advanceTimersByTime(3100)
    })

    // ── STEP 2 VERIFICATION ──
    text = container.textContent || ''
    // Stepper status
    expect(text).toContain('✓ Đã thử thách')
    // AIKI Speech bubble Step 2
    expect(text).toContain('Ơ, vì bé bỏ trống nên tranh lúc nãy chung chung quá! Giờ bé hãy cùng tớ điền đủ 5 điều chi tiết nhé!')

    // Keys 1 to 4 with all 5 numbered badges: [1], [2], [3], [4], [5]
    expect(text).toContain('[1]')
    expect(text).toContain('(Điều 1)')
    expect(text).toContain('[2]')
    expect(text).toContain('(Điều 2)')
    expect(text).toContain('Lông màu trắng')
    expect(text).toContain('[3]')
    expect(text).toContain('(Điều 3)')
    expect(text).toContain('mướp béo')
    expect(text).toContain('[4]')
    expect(text).toContain('(Điều 4)')
    expect(text).toContain('Đang nằm nhắm mắt')
    expect(text).toContain('[5]')
    expect(text).toContain('(Điều 5)')
    expect(text).toContain('Ở trước sân')

    // Draw Step 2
    const drawBtn2 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Vẽ Lượt 2')
    )
    expect(drawBtn2).toBeDefined()
    await act(async () => {
      drawBtn2?.click()
    })
    act(() => {
      vi.advanceTimersByTime(3100)
    })

    // ── COMPARISON CANVAS VERIFICATION ──
    text = container.textContent || ''
    // AIKI Speech bubble comparison
    expect(text).toContain('Bé thấy chưa: tả càng rõ thì AIKI vẽ càng đúng ý! Con thích bức tranh nào hơn?')
    expect(text).toContain('TRANH SÁNG TẠO: BẢNG SO SÁNH 2 BƯỚC')
    expect(text).toContain('So sánh 2 bức tranh của bé')
    expect(text).toContain('Bức 1: 1. Một từ (con mèo)')
    expect(text).toContain('AKI tự đoán bừa')
    expect(text).toContain('Bức 2: 2. Năm điều')
    expect(text).toContain('Khuyên chọn')
    expect(text).toContain('Đủ 5 chi tiết')
    expect(text).toContain('Vì sao con thích bức này hơn?')
    expect(text).toContain('Cất vào Ba Lô & Tiếp tục')

    act(() => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
  })

  it('does NOT render floating text banner covering the artwork on canvas even when options changed', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<AikiStudioSoftClayWorkspace lessonId="bai-1-2" />)
    })

    // Change an option
    const buttons = Array.from(container.querySelectorAll('button'))
    const altDescBtn = buttons.find((b) => b.textContent?.includes('Trắng đốm nâu quanh mắt'))
    await act(async () => {
      altDescBtn?.click()
    })

    const text = container.textContent || ''
    // Absolutely NO floating banner text covering canvas
    expect(text).not.toContain('Đã đổi câu lệnh • Bấm nút Tạo ảnh bên dưới')
    expect(text).not.toContain('xem tranh mới!')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('shows friendly generating title and NO technical text (~3s)... during generation', async () => {
    vi.useFakeTimers()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<AikiStudioSoftClayWorkspace lessonId="bai-1-1" />)
    })

    const drawBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Vẽ Lượt 1')
    )
    expect(drawBtn).toBeDefined()

    await act(async () => {
      drawBtn?.click()
    })

    // While generating is active:
    const text = container.textContent || ''
    expect(text).toContain('AIKI đang vẽ tranh...')
    expect(text).not.toContain('(~3s)')
    expect(text).not.toContain('Đang tạo tranh bằng AI')

    act(() => {
      vi.advanceTimersByTime(3100)
    })

    act(() => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
  })

  it('enforces 2 attempts quota in Lesson 1.1: draw button is disabled with "Đã hết lượt tạo ảnh (0 lượt)" after 2 turns', async () => {
    vi.useFakeTimers()
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<AikiStudioSoftClayWorkspace lessonId="bai-1-1" />)
    })

    // Turn 1
    const drawBtn1 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Vẽ Lượt 1')
    ) as HTMLButtonElement
    expect(drawBtn1).toBeDefined()
    expect(drawBtn1.disabled).toBe(false)
    expect(drawBtn1.textContent).toContain('còn 2 lượt')

    await act(async () => {
      drawBtn1.click()
    })
    act(() => {
      vi.advanceTimersByTime(3100)
    })

    // Turn 2
    const drawBtn2 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Vẽ Lượt 2')
    ) as HTMLButtonElement
    expect(drawBtn2).toBeDefined()
    expect(drawBtn2.disabled).toBe(false)
    expect(drawBtn2.textContent).toContain('còn 1 lượt')

    await act(async () => {
      drawBtn2.click()
    })
    act(() => {
      vi.advanceTimersByTime(3100)
    })

    // After 2 turns: attemptsLeft is 0, draw button is disabled
    const exhaustedDrawBtn = container.querySelector('[data-testid="studio-draw-btn"]') as HTMLButtonElement
    expect(exhaustedDrawBtn).toBeDefined()
    expect(exhaustedDrawBtn.disabled).toBe(true)
    expect(exhaustedDrawBtn.textContent).toContain('Đã hết lượt tạo ảnh (0 lượt)')
    expect(exhaustedDrawBtn.className).toContain('opacity-50')
    expect(exhaustedDrawBtn.className).toContain('cursor-not-allowed')

    act(() => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
  })

  it('restores attempts, both turn artworks, and submitted status from localStorage upon reload', async () => {
    const lessonId = 'bai-1-1-test-reload'
    const storageKey = `aiki_softclay_practice_${lessonId}`

    const mockStorage: Record<string, string> = {}
    const mockLocalStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value
      },
      removeItem: (key: string) => {
        delete mockStorage[key]
      },
      clear: () => {
        Object.keys(mockStorage).forEach((k) => delete mockStorage[k])
      },
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    })

    // Seed state as if student finished 2 turns, chose favorite, and submitted
    const savedData = {
      attemptsLeft: 0,
      turn1Artworks: {
        0: { url: '/assets/pregenerated-fallback/magic-keys/cat_one_word_v1.webp', prompt: 'con mèo' },
      },
      turn2Artworks: {
        0: { url: '/assets/pregenerated-fallback/magic-keys/cat_full_details_v1.webp', prompt: 'con mèo · lông màu trắng · đang nằm · nhắm mắt · ở trước sân' },
      },
      completedParts: [0],
      turnByPart: { 0: 2 },
      favoriteByPart: { 0: 2 },
      favoriteReasonByPart: { 0: 'Vì nhìn rõ hơn' },
      isSubmitted: true,
    }
    mockLocalStorage.setItem(storageKey, JSON.stringify(savedData))

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    // Render component simulating reload
    await act(async () => {
      root.render(<AikiStudioSoftClayWorkspace lessonId={lessonId} />)
    })

    const text = container.textContent || ''

    // 1. Both turns restored: comparison board visible
    expect(text).toContain('TRANH SÁNG TẠO: BẢNG SO SÁNH 2 BƯỚC')
    expect(text).toContain('So sánh 2 bức tranh của bé')
    expect(text).toContain('1. Một từ (con mèo)')
    expect(text).toContain('2. Năm điều')

    // 2. Both turn images restored
    const images = Array.from(container.querySelectorAll('img')).map((img) => img.src)
    expect(images.some((s) => s.includes('cat_one_word_v1.webp'))).toBe(true)
    expect(images.some((s) => s.includes('cat_full_details_v1.webp'))).toBe(true)

    // 3. Attempts quota: 0 attempts left, draw button disabled
    const drawBtn = container.querySelector('[data-testid="studio-draw-btn"]') as HTMLButtonElement
    expect(drawBtn).toBeDefined()
    expect(drawBtn.disabled).toBe(true)
    expect(drawBtn.textContent).toContain('Đã hết lượt tạo ảnh (0 lượt)')

    // 4. Submitted status restored: Balo badges & submit button text
    expect(text).toContain('✓ Đã lưu vào Balo')
    expect(text).toContain('✓ Đã cất vào Ba Lô')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('synchronizes practice progress to backend DB via learningApi.savePractice and onPracticeStateChange with decreasing attemptsLeft (2 -> 1 -> 0) and turn artworks', async () => {
    vi.useFakeTimers()
    const savePracticeSpy = vi.spyOn(learningApi, 'savePractice').mockResolvedValue({ result: 'ok' } as any)
    const onPracticeStateChange = vi.fn()

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioSoftClayWorkspace
          lessonId="bai-1-1"
          onPracticeStateChange={onPracticeStateChange}
        />
      )
    })

    // Turn 1
    const drawBtn1 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Vẽ Lượt 1')
    ) as HTMLButtonElement
    expect(drawBtn1).toBeDefined()

    await act(async () => {
      drawBtn1.click()
    })
    act(() => {
      vi.advanceTimersByTime(3100)
    })

    // Expect learningApi.savePractice called for Turn 1
    expect(savePracticeSpy).toHaveBeenCalledWith('bai-1-1', {
      kind: 'studio',
      payload: expect.objectContaining({
        attemptsLeft: 1,
        generatedCount: 1,
        turn1Artworks: expect.objectContaining({
          0: expect.objectContaining({ prompt: 'con mèo' }),
        }),
      }),
    })
    expect(onPracticeStateChange).toHaveBeenCalledWith(
      expect.objectContaining({
        attemptsLeft: 1,
        generatedCount: 1,
      })
    )

    // Turn 2
    const drawBtn2 = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Vẽ Lượt 2')
    ) as HTMLButtonElement
    expect(drawBtn2).toBeDefined()

    await act(async () => {
      drawBtn2.click()
    })
    act(() => {
      vi.advanceTimersByTime(3100)
    })

    // Expect learningApi.savePractice called for Turn 2 with attemptsLeft = 0
    expect(savePracticeSpy).toHaveBeenCalledWith('bai-1-1', {
      kind: 'studio',
      payload: expect.objectContaining({
        attemptsLeft: 0,
        generatedCount: 2,
        turn1Artworks: expect.objectContaining({
          0: expect.objectContaining({ prompt: 'con mèo' }),
        }),
        turn2Artworks: expect.objectContaining({
          0: expect.objectContaining({ prompt: expect.stringContaining('con mèo · lông màu trắng') }),
        }),
        completedParts: [0],
      }),
    })
    expect(onPracticeStateChange).toHaveBeenCalledWith(
      expect.objectContaining({
        attemptsLeft: 0,
        generatedCount: 2,
        completedParts: [0],
      })
    )

    act(() => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
    savePracticeSpy.mockRestore()
  })

  it('restores practice state directly from initialPracticeState provided by backend DB', async () => {
    const lessonId = 'bai-1-1-from-db'
    const dbPracticeState = {
      attemptsLeft: 0,
      turn1Artworks: {
        0: { url: '/assets/pregenerated-fallback/magic-keys/cat_one_word_v1.webp', prompt: 'con mèo' },
      },
      turn2Artworks: {
        0: { url: '/assets/pregenerated-fallback/magic-keys/cat_full_details_v1.webp', prompt: 'con mèo · lông màu trắng · đang nằm · nhắm mắt · ở trước sân' },
      },
      completedParts: [0],
      turnByPart: { 0: 2 } as Record<number, 1 | 2>,
      favoriteByPart: { 0: 2 } as Record<number, 1 | 2>,
      favoriteReasonByPart: { 0: 'Rõ chi tiết hơn' },
      isSubmitted: true,
      generatedCount: 2,
    }

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AikiStudioSoftClayWorkspace
          lessonId={lessonId}
          initialPracticeState={dbPracticeState}
        />
      )
    })

    const text = container.textContent || ''

    // 1. Both turns restored: comparison board visible
    expect(text).toContain('TRANH SÁNG TẠO: BẢNG SO SÁNH 2 BƯỚC')
    expect(text).toContain('So sánh 2 bức tranh của bé')
    expect(text).toContain('1. Một từ (con mèo)')
    expect(text).toContain('2. Năm điều')

    // 2. Both turn images restored
    const images = Array.from(container.querySelectorAll('img')).map((img) => img.src)
    expect(images.some((s) => s.includes('cat_one_word_v1.webp'))).toBe(true)
    expect(images.some((s) => s.includes('cat_full_details_v1.webp'))).toBe(true)

    // 3. Attempts quota restored from DB (0 attempts left)
    const drawBtn = container.querySelector('[data-testid="studio-draw-btn"]') as HTMLButtonElement
    expect(drawBtn).toBeDefined()
    expect(drawBtn.disabled).toBe(true)
    expect(drawBtn.textContent).toContain('Đã hết lượt tạo ảnh (0 lượt)')

    // 4. Submitted status restored: Balo badges & submit button text
    expect(text).toContain('✓ Đã lưu vào Balo')
    expect(text).toContain('✓ Đã cất vào Ba Lô')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders dynamic subject and turns in confirmation modal for Lesson 1.1', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    const dbPracticeState = {
      attemptsLeft: 0,
      turn1Artworks: {
        0: { url: '/assets/pregenerated-fallback/magic-keys/cat_one_word_v1.webp', prompt: 'con mèo' },
      },
      turn2Artworks: {
        0: { url: '/assets/pregenerated-fallback/magic-keys/cat_full_details_v1.webp', prompt: 'con mèo · lông màu trắng · đang nằm · nhắm mắt · ở trước sân' },
      },
      completedParts: [0],
      turnByPart: { 0: 2 } as Record<number, 1 | 2>,
    }

    await act(async () => {
      root.render(
        <AikiStudioSoftClayWorkspace
          lessonId="bai-1-1"
          initialPracticeState={dbPracticeState}
        />
      )
    })

    // Click submit button to open modal
    const submitBtn = container.querySelector('[data-testid="studio-submit-btn"]') as HTMLButtonElement
    expect(submitBtn).toBeDefined()
    await act(async () => {
      submitBtn.click()
    })

    const text = container.textContent || ''
    expect(text).toContain('Nộp Tranh Vào Balo Nghệ Thuật?')
    expect(text).toContain('Bé đã hoàn thành xuất sắc 2 lượt vẽ cho con mèo!')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders dynamic subject and turns in confirmation modal for Lesson 1.2 switching between items', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<AikiStudioSoftClayWorkspace lessonId="bai-1-2" />)
    })

    // Open submit modal for first item (Con cún)
    let submitBtn = container.querySelector('[data-testid="studio-submit-btn"]') as HTMLButtonElement
    await act(async () => {
      submitBtn.click()
    })

    let text = container.textContent || ''
    expect(text).toContain('Nộp Tranh Vào Balo Nghệ Thuật?')
    expect(text).toContain('Bé đã hoàn thành kiệt tác Con cún trong 1 lượt vẽ xuất sắc!')

    // Close modal
    const closeBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('Ngắm thêm chút'))
    await act(async () => {
      closeBtn?.click()
    })

    // Switch to Part 2: Cái xe đạp
    const buttons = Array.from(container.querySelectorAll('button'))
    const bikeBtn = buttons.find((b) => b.textContent?.includes('Cái xe đạp'))
    await act(async () => {
      bikeBtn?.click()
    })

    // Reopen modal for second item
    submitBtn = container.querySelector('[data-testid="studio-submit-btn"]') as HTMLButtonElement
    await act(async () => {
      submitBtn.click()
    })

    text = container.textContent || ''
    expect(text).toContain('Bé đã hoàn thành kiệt tác Cái xe đạp trong 1 lượt vẽ xuất sắc!')

    act(() => {
      root.unmount()
    })
    container.remove()
  })
})
