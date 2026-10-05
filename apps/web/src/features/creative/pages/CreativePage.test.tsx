// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import { CreativePage } from './CreativePage'
import * as creativeApiModule from '@/shared/lib/creative-api'
import { useAuth } from '@/shared/store/auth'

describe('CreativePage (AI Studio)', () => {
  let generateSpy: ReturnType<typeof vi.spyOn>
  let saveArtSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    useAuth.getState().setUser({
      id: 'student-test-1',
      name: 'Bé Linh',
      email: 'linh@example.com',
      role: 'student',
      allowAiCreate: true,
      allowPhoto: true,
    })

    generateSpy = vi.spyOn(creativeApiModule, 'generateCreativeImage').mockResolvedValue(
      'https://storage.storymee.com/generated-art.png',
    )
    saveArtSpy = vi.spyOn(creativeApiModule, 'saveCreativeArt').mockResolvedValue({
      id: 'proj-123',
      url: 'https://storage.storymee.com/generated-art.png',
    })

    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      getImageData: vi.fn().mockReturnValue({ data: new Uint8ClampedArray(4) }),
      putImageData: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      drawImage: vi.fn(),
    }) as any
    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mock')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders header with AI Studio title, back to home button, and no legacy 3-choice hub', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <CreativePage />
        </MemoryRouter>,
      )
    })

    // Header title and back button
    expect(container.textContent).toContain('AI Studio · Xưởng Vẽ Sáng Tạo')
    expect(container.textContent).toContain('← Trang chủ')

    // Must NOT contain legacy 3-choice hub options
    expect(container.textContent).not.toContain('Nhân vật AI')
    expect(container.textContent).not.toContain('Sáng tác truyện')

    act(() => root.unmount())
    container.remove()
  })

  it('renders all 14 child-friendly art styles directly on the drawing screen', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <CreativePage />
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Đất Nặn')
    expect(container.textContent).toContain('Màu Nước')
    expect(container.textContent).toContain('Hoạt Hình')
    expect(container.textContent).toContain('Bút Sáp')
    expect(container.textContent).toContain('Tranh Chì')
    expect(container.textContent).toContain('Chibi')
    expect(container.textContent).toContain('3D Sống Động')
    expect(container.textContent).toContain('Anime')
    expect(container.textContent).toContain('Truyện Tranh')
    expect(container.textContent).toContain('Pixel Art')
    expect(container.textContent).toContain('Vải Nỉ')
    expect(container.textContent).toContain('Manhwa')
    expect(container.textContent).toContain('Manga')
    expect(container.textContent).toContain('Bán Tả Thực')

    act(() => root.unmount())
    container.remove()
  })

  it('dynamically adapts the action button label when switching styles', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
           <CreativePage />
        </MemoryRouter>,
      )
    })

    // Default is Soft Clay ("Đất Nặn")
    expect(container.textContent).toContain('Biến hình tranh vẽ')
    expect(container.textContent).toContain('theo phong cách Đất Nặn')

    // Switch to Màu Nước
    const watercolorBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.getAttribute('aria-label') === 'Phong cách Màu Nước' || b.textContent?.trim() === 'Màu Nước',
    )
    expect(watercolorBtn).toBeDefined()

    await act(async () => {
      watercolorBtn?.click()
    })
    expect(container.textContent).toContain('theo phong cách Màu Nước')

    // Switch to Hoạt Hình
    const cartoonBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.getAttribute('aria-label') === 'Phong cách Hoạt Hình' || b.textContent?.trim() === 'Hoạt Hình',
    )
    expect(cartoonBtn).toBeDefined()

    await act(async () => {
      cartoonBtn?.click()
    })
    expect(container.textContent).toContain('theo phong cách Hoạt Hình')

    // Switch to Tranh Chì
    const sketchBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.getAttribute('aria-label') === 'Phong cách Tranh Chì' || b.textContent?.trim() === 'Tranh Chì',
    )
    expect(sketchBtn).toBeDefined()

    await act(async () => {
      sketchBtn?.click()
    })
    expect(container.textContent).toContain('theo phong cách Tranh Chì')

    act(() => root.unmount())
    container.remove()
  })

  it('renders idea textarea and 5 quick 1-touch suggestion chips and fast clear button', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <CreativePage />
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Bé muốn vẽ điều gì?')
    expect(container.textContent).toContain('Mèo Aiki phiêu lưu')
    expect(container.textContent).toContain('Khu rừng kỳ diệu')
    expect(container.textContent).toContain('Lâu đài trên mây')
    expect(container.textContent).toContain('Robot thám hiểm')
    expect(container.textContent).toContain('Ngôi nhà bánh kẹo')

    // Clicking a chip updates textarea
    const chipBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Mèo Aiki phiêu lưu'),
    )
    expect(chipBtn).toBeDefined()

    await act(async () => {
      chipBtn?.click()
    })

    const textarea = container.querySelector('textarea[placeholder*="Mèo Aiki"]') as HTMLTextAreaElement
    expect(textarea).toBeDefined()
    expect(textarea.value).toBe('Mèo Aiki phiêu lưu')

    // Fast clear button (✕)
    const clearBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === '✕',
    )
    expect(clearBtn).toBeDefined()
    await act(async () => {
      clearBtn?.click()
    })
    expect(textarea.value).toBe('')

    act(() => root.unmount())
    container.remove()
  })

  it('triggers AI generation, adds to recent creations strip, and saves to backpack and profile', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <CreativePage />
        </MemoryRouter>,
      )
    })

    const createBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Biến hình tranh vẽ'),
    )
    expect(createBtn).toBeDefined()

    await act(async () => {
      createBtn?.click()
    })

    expect(generateSpy).toHaveBeenCalledTimes(1)
    expect(container.textContent).toContain('Lưu vào Ba Lô & Hồ Sơ')
    expect(container.textContent).toContain('Tải ảnh về máy')
    expect(container.textContent).toContain('Vẽ tranh mới')

    // Verifies recent creations strip appeared
    expect(container.textContent).toContain('Tranh vừa tạo của bé')

    // Click Save to Backpack & Profile
    const saveBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Lưu vào Ba Lô & Hồ Sơ'),
    )
    expect(saveBtn).toBeDefined()

    await act(async () => {
      saveBtn?.click()
    })

    expect(saveArtSpy).toHaveBeenCalledTimes(1)
    expect(saveArtSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://storage.storymee.com/generated-art.png',
        kind: 'art',
        creativeKind: 'art',
      }),
    )
    expect(container.textContent).toContain('Đã lưu vào Ba Lô & Hồ Sơ thành công!')

    act(() => root.unmount())
    container.remove()
  })

  it('displays friendly Vietnamese message when child-safe filter error occurs', async () => {
    generateSpy.mockRejectedValueOnce(
      new Error('This request is not available in the child-safe creation space.'),
    )

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <CreativePage />
        </MemoryRouter>,
      )
    })

    const createBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Biến hình tranh vẽ'),
    )
    expect(createBtn).toBeDefined()

    await act(async () => {
      createBtn?.click()
    })

    expect(container.textContent).toContain(
      'Ý tưởng của bé có từ ngữ chưa phù hợp với không gian sáng tạo an toàn. Bé hãy thử miêu tả những điều vui tươi, đáng yêu khác nhé!',
    )
    expect(container.textContent).not.toContain(
      'This request is not available in the child-safe creation space.',
    )

    act(() => root.unmount())
    container.remove()
  })
})

