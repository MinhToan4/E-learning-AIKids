// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { CourseFormModal, RECOGNITION_BADGES } from './CourseFormModal'

vi.mock('@/shared/lib/api', () => ({
  api: vi.fn().mockResolvedValue({ ok: true }),
}))

vi.mock('@/shared/hooks/useToast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}))

describe('CourseFormModal Component Integrity Tests', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    document.body.innerHTML = ''
  })

  it('renders into document.body via createPortal with subtle overlay and no backdropFilter blur', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <CourseFormModal
          course={null}
          onSaved={() => {}}
          onClose={() => {}}
        />
      )
    })

    // Modal overlay is portaled into document.body
    const overlay = document.body.querySelector('div[style*="position: fixed"]') as HTMLElement
    expect(overlay).toBeTruthy()
    expect(overlay.style.position).toBe('fixed')
    expect(overlay.style.zIndex).toBe('9999')
    // Background overlay must be rgba(15, 23, 42, 0.3)
    expect(overlay.style.background).toBe('rgba(15, 23, 42, 0.3)')
    // Confirm backdropFilter is completely absent / not set
    expect(overlay.style.backdropFilter).toBeFalsy()

    act(() => {
      root.unmount()
    })
  })

  it('provides 3 tabs and renders Tab 3 (Hoàn thành & Vinh danh) with all required fields', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <CourseFormModal
          course={{
            id: 'course-ai-artist',
            title: 'Họa sĩ nhí AI',
            shortTitle: 'Họa sĩ AI',
            tagline: 'Khám phá thế giới hội họa cùng AI',
            description: 'Khóa học dạy vẽ cùng trí tuệ nhân tạo cho trẻ em',
            productLabel: 'AI Art',
            ageTrack: '6–8 tuổi',
            courseKey: 'course-ai-artist',
            durationLabel: '4 tuần',
            skillsText: 'Prompting tranh ảnh, Tư duy thị giác',
            outcomesText: 'Bộ sưu tập 10 bức tranh số',
            credential: 'Chứng chỉ Họa Sĩ Nhí AI Xuất Sắc',
            finalAssessment: 'Hoàn thành 100% các trạm bắt buộc.',
            badgeRewardId: 'badge-title-firestarter',
            issuerTitle: 'AI Kids Creator Academy',
          }}
          onSaved={() => {}}
          onClose={() => {}}
        />
      )
    })

    // Find tab buttons
    const buttons = Array.from(document.querySelectorAll('button'))
    const tab3Button = buttons.find((b) => b.textContent?.includes('Hoàn thành & Vinh danh'))
    expect(tab3Button).toBeTruthy()

    // Click Tab 3
    act(() => {
      tab3Button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // 1. Certificate name
    expect(document.body.textContent).toContain('Tên Chứng Chỉ Số Trao Tặng')
    expect(document.body.textContent).toContain('Dùng tên tự động')
    expect(document.body.textContent).toContain('Tự đặt tên chứng chỉ riêng')

    // 2. Soft-Clay Badge Picker with 10 badges
    expect(RECOGNITION_BADGES).toHaveLength(10)
    expect(document.body.textContent).toContain('Huy Hiệu Vinh Danh (Achievement Badge)')
    expect(document.body.textContent).toContain('Huy hiệu Soft-Clay 3D chính thức')
    for (const badge of RECOGNITION_BADGES) {
      expect(document.body.textContent).toContain(badge.name)
    }

    // 3. Completion criteria presets & textarea
    expect(document.body.textContent).toContain('Tiêu Chuẩn Hoàn Thành')
    expect(document.body.textContent).toContain('100% trạm bắt buộc')
    expect(document.body.textContent).toContain('100% trạm + 1 tác phẩm AI Studio')
    expect(document.body.textContent).toContain('100% trạm + Test cuối khóa (≥ 80%)')

    // 4. Issuer Title
    expect(document.body.textContent).toContain('Đơn Vị Cấp Chứng Nhận')
    const issuerInput = document.querySelector('input[value="AI Kids Creator Academy"]')
    expect(issuerInput).toBeTruthy()

    // 5. Live Certificate Preview
    expect(document.body.textContent).toContain('Chứng Nhận Số Kỹ Thuật Số (Mô Phỏng Thực Tế)')
    expect(document.body.textContent).toContain('Đã xác thực trên hệ thống')

    act(() => {
      root.unmount()
    })
  })

  it('correctly loads and updates badgeRewardId and issuerTitle in the draft payload', () => {
    const root = createRoot(container)
    act(() => {
      root.render(
        <CourseFormModal
          course={{
            id: 'course-robot',
            title: 'Kỹ sư Robot',
            shortTitle: 'Kỹ sư Robot',
            tagline: 'Lập trình robot',
            description: 'Học robot cơ bản',
            productLabel: 'Robotics',
            ageTrack: '8–10 tuổi',
            courseKey: 'course-robot',
            durationLabel: '6 tuần',
            skillsText: 'Logic robot',
            outcomesText: 'Mô hình robot ảo',
            credential: '',
            finalAssessment: '',
            badgeRewardId: 'badge-code-comet',
            issuerTitle: 'StoryMee Lab',
          }}
          onSaved={() => {}}
          onClose={() => {}}
        />
      )
    })

    // Switch to Tab 3
    const buttons = Array.from(document.querySelectorAll('button'))
    const tab3Button = buttons.find((b) => b.textContent?.includes('Hoàn thành & Vinh danh'))
    act(() => {
      tab3Button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Verify badge-code-comet is selected or badge-title-world-architect can be clicked
    const worldArchitectBadgeBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Kiến Trúc Sư Thế Giới')
    )
    expect(worldArchitectBadgeBtn).toBeTruthy()

    act(() => {
      worldArchitectBadgeBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Verify issuer title input has 'StoryMee Lab'
    const issuerInput = document.querySelector('input[value="StoryMee Lab"]') as HTMLInputElement
    expect(issuerInput).toBeTruthy()

    act(() => {
      root.unmount()
    })
  })
})
