import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { QuickBlockPickerModal } from './QuickBlockPickerModal'

afterEach(() => {
  document.body.replaceChildren()
})

describe('QuickBlockPickerModal (Gutenberg-style block inserter)', () => {
  it('renders all categories and block items when open', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <QuickBlockPickerModal
          open={true}
          onClose={vi.fn()}
          onSelectBlock={vi.fn()}
        />
      )
    })

    const text = container.textContent || ''
    expect(text).toContain('Thêm Khối Nội Dung Mới')
    expect(text).toContain('Nội Dung & Lời Thoại')
    expect(text).toContain('Hình Ảnh & Đa Phương Tiện')
    expect(text).toContain('Tương Tác & Cốt Lõi AIKids')

    // Key blocks present
    expect(text).toContain('Đoạn Văn Bản Bài Học')
    expect(text).toContain('Hộp Ghi Nhớ AIKI')
    expect(text).toContain('Kịch Bản Phân Vai Nhân Vật')
    expect(text).toContain('4 Chìa Khóa Vàng (Magic Keys)')
    expect(text).toContain('Video Bài Giảng')
    expect(text).toContain('2 Tranh Đối Đầu A/B')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('filters blocks based on search keyword', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <QuickBlockPickerModal
          open={true}
          onClose={vi.fn()}
          onSelectBlock={vi.fn()}
        />
      )
    })

    const input = container.querySelector('input') as HTMLInputElement
    expect(input).toBeDefined()

    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      nativeSetter?.call(input, 'Chìa khóa')
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })

    const text = container.textContent || ''
    expect(text).toContain('4 Chìa Khóa Vàng (Magic Keys)')
    expect(text).not.toContain('Video Bài Giảng')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('triggers onSelectBlock and onClose when clicking a block card', async () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <QuickBlockPickerModal
          open={true}
          onClose={onClose}
          onSelectBlock={onSelect}
        />
      )
    })

    const buttons = Array.from(container.querySelectorAll('button'))
    const fourKeysBtn = buttons.find((b) => b.textContent?.includes('4 Chìa Khóa Vàng'))
    expect(fourKeysBtn).toBeDefined()

    await act(async () => {
      fourKeysBtn?.click()
    })

    expect(onSelect).toHaveBeenCalledWith('layout-four-keys')
    expect(onClose).toHaveBeenCalledTimes(1)

    act(() => {
      root.unmount()
    })
    container.remove()
  })
})
