// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { CustomStagesManagerModal } from './CustomStagesManagerModal'
import { STANDARD_ISLAND_6_STAGES } from '@/features/teacher/lib/authoring'

describe('CustomStagesManagerModal', () => {
  let container: HTMLDivElement | null = null
  let root: ReturnType<typeof createRoot> | null = null

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount()
      })
      root = null
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
      container = null
    }
  })

  it('renders all stages and displays total stage count and star allocation', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    const handleApply = vi.fn()
    const handleClose = vi.fn()

    act(() => {
      root?.render(
        <CustomStagesManagerModal
          isOpen={true}
          onClose={handleClose}
          currentStages={STANDARD_ISLAND_6_STAGES}
          starAllocation={[2, 3, 4]}
          onApply={handleApply}
        />
      )
    })

    expect(container.textContent).toContain('Quản lý & Tùy biến các bước học')
    expect(container.textContent).toContain('6 chặng')
    expect(container.textContent).toContain('3/3 Sao')
  })

  it('allows adding a new stage up to 7 stages', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    const handleApply = vi.fn()
    const handleClose = vi.fn()

    act(() => {
      root?.render(
        <CustomStagesManagerModal
          isOpen={true}
          onClose={handleClose}
          currentStages={STANDARD_ISLAND_6_STAGES}
          starAllocation={[2, 3, 4]}
          onApply={handleApply}
        />
      )
    })

    const buttons = Array.from(container.querySelectorAll('button'))
    const addButton = buttons.find((b) => b.textContent?.includes('Thêm chặng mới'))
    expect(addButton).toBeDefined()

    act(() => {
      addButton?.click()
    })

    expect(container.textContent).toContain('7 chặng')
    expect(addButton?.disabled).toBe(true)
  })

  it('calls onApply with updated stages and star allocation when submitted', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    const handleApply = vi.fn()
    const handleClose = vi.fn()

    act(() => {
      root?.render(
        <CustomStagesManagerModal
          isOpen={true}
          onClose={handleClose}
          currentStages={STANDARD_ISLAND_6_STAGES}
          starAllocation={[2, 3, 4]}
          onApply={handleApply}
        />
      )
    })

    const buttons = Array.from(container.querySelectorAll('button'))
    const applyButton = buttons.find((b) => b.textContent?.includes('Áp dụng cấu trúc chặng'))
    expect(applyButton).toBeDefined()

    act(() => {
      applyButton?.click()
    })

    expect(handleApply).toHaveBeenCalledTimes(1)
    expect(handleApply.mock.calls[0][0]).toHaveLength(6)
    expect(handleApply.mock.calls[0][1]).toEqual([2, 3, 4])
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
