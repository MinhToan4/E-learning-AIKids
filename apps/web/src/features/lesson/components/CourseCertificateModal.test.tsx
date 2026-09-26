// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { CourseCertificateModal } from './CourseCertificateModal'

describe('CourseCertificateModal', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container && container.parentNode) {
      document.body.removeChild(container)
    }
    vi.restoreAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <CourseCertificateModal
          isOpen={false}
          onClose={vi.fn()}
        />
      )
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('renders certificate modal with student name, island title, stars, and xp when isOpen is true', () => {
    const onClose = vi.fn()
    const root = createRoot(container)
    act(() => {
      root.render(
        <CourseCertificateModal
          isOpen={true}
          onClose={onClose}
          studentName="Bé Minh Trí"
          courseTitle="Đừng Để AIKI Đoán Mò"
          islandTitle="Đảo 1: Nhà Thám Hiểm AI"
          stars={18}
          xp={1500}
          issuedDate="21/09/2026"
        />
      )
    })

    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.textContent).toContain('Chứng Nhận Tốt Nghiệp')
    expect(dialog?.textContent).toContain('Bé Minh Trí')
    expect(dialog?.textContent).toContain('Đảo 1: Nhà Thám Hiểm AI')
    expect(dialog?.textContent).toContain('18 Sao Tinh Hoa')
    expect(dialog?.textContent).toContain('+1500 Điểm EXP')
    expect(dialog?.textContent).toContain('21/09/2026')
    expect(dialog?.textContent).toContain('Cất Vào Balo')
  })

  it('handles clicking "Cất Vào Balo" and automatically calls onClose', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const root = createRoot(container)
    act(() => {
      root.render(
        <CourseCertificateModal
          isOpen={true}
          onClose={onClose}
          studentName="Bé An"
        />
      )
    })

    const saveBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Cất Vào Balo')
    )
    expect(saveBtn).toBeDefined()

    act(() => {
      saveBtn?.click()
    })

    expect(container.textContent).toContain('Đã Cất Vào Balo! 🎉')

    act(() => {
      vi.advanceTimersByTime(1300)
    })

    expect(onClose).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    const root = createRoot(container)
    act(() => {
      root.render(
        <CourseCertificateModal
          isOpen={true}
          onClose={onClose}
        />
      )
    })

    const closeBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Đóng')
    )
    expect(closeBtn).toBeDefined()

    act(() => {
      closeBtn?.click()
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onSaveToBackpack and saves to backpack when clicking Cất Vào Balo', () => {
    vi.useFakeTimers()
    const onSaveToBackpack = vi.fn()
    const onClose = vi.fn()
    const root = createRoot(container)
    act(() => {
      root.render(
        <CourseCertificateModal
          isOpen={true}
          onClose={onClose}
          courseId="cert-dao-1"
          studentName="Bé Minh"
          courseTitle="Đảo Tiên Quyết"
          islandTitle="Đảo 1: Đảo Tiên Quyết"
          stars={15}
          xp={350}
          studentId="student-123"
          onSaveToBackpack={onSaveToBackpack}
        />
      )
    })

    const saveBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Cất Vào Balo')
    )
    expect(saveBtn).toBeDefined()

    act(() => {
      saveBtn?.click()
    })

    expect(onSaveToBackpack).toHaveBeenCalledTimes(1)
    expect(onSaveToBackpack).toHaveBeenCalledWith(
      expect.objectContaining({
        courseId: 'cert-dao-1',
        studentName: 'Bé Minh',
        stars: 15,
        xp: 350,
      })
    )
    expect(container.textContent).toContain('Đã Cất Vào Balo! 🎉')

    act(() => {
      vi.advanceTimersByTime(1300)
    })
    expect(onClose).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
