// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot as originalCreateRoot } from 'react-dom/client'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { GoalStageBlock } from './GoalStageBlock'
import type { JourneyStageDefinition, GoalStageConfig } from '../../types/stage-schema'

const activeRoots: Array<{ unmount: () => void }> = []
const createRoot: typeof originalCreateRoot = (container, options) => {
  const root = originalCreateRoot(container, options)
  activeRoots.push(root)
  return root
}

const mockGoalStage: JourneyStageDefinition<GoalStageConfig> = {
  id: 'stage-0',
  type: 'GOAL',
  title: 'Mục tiêu',
  stepNumber: 1,
  config: {
    title: 'Mục tiêu: Đừng Để AIKI Đoán Mò',
    goalText: 'Con hiểu được AI tạo ảnh không tự nghĩ được.',
    imageUrl: '/assets/aiki-islands/island1_lesson1_cat.jpg',
    fallbackImageUrl: '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2',
    speech: 'Chào mừng bé!',
    keyPoints: ['Tả rõ ràng', 'Không đoán bừa', 'Kiểm tra kỹ'],
    isFourKeys: true,
    formulaCards: [
      {
        id: 'k1',
        icon: '🔑',
        code: 'Cái gì',
        val: 'Chú mèo mướp',
        sub: 'Chủ thể',
        color: '#38bdf8',
        image: '/assets/aiki-keys/key_what_blue.jpg',
        bg: 'border-sky-200',
        badge: 'bg-sky-500 text-white',
      },
    ],
  },
}

describe('GoalStageBlock', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    act(() => {
      while (activeRoots.length > 0) {
        try {
          activeRoots.pop()?.unmount()
        } catch {
          // ignore
        }
      }
    })
    if (container && container.parentNode) {
      document.body.removeChild(container)
    }
  })

  it('renders goal content, title, formula cards, and high-priority hero image', () => {
    const root = createRoot(container)
    act(() => {
      root.render(<GoalStageBlock stage={mockGoalStage} />)
    })

    const section = container.querySelector('section[data-testid="stage-0-goal"]')
    expect(section).not.toBeNull()
    expect(section?.textContent).toContain('Chặng 1: Mục tiêu bài học')
    expect(section?.textContent).toContain('Mục tiêu: Đừng Để AIKI Đoán Mò')
    expect(section?.textContent).toContain('Con hiểu được AI tạo ảnh không tự nghĩ được.')
    expect(section?.textContent).toContain('BỐN CHIẾC CHÌA KHÓA MỞ KHÓA CÂU LỆNH')
    expect(section?.textContent).toContain('Chú mèo mướp')

    const heroImg = section?.querySelector('img[alt="Mục tiêu: Đừng Để AIKI Đoán Mò"]') as HTMLImageElement
    expect(heroImg).not.toBeNull()
    expect(heroImg.src).toContain('/assets/aiki-islands/island1_lesson1_cat.jpg')
    expect(heroImg.getAttribute('fetchpriority')).toBe('high')
  })

  it('triggers onImageClick when clicking hero image or Phóng to button', () => {
    const onImageClick = vi.fn()
    const root = createRoot(container)
    act(() => {
      root.render(<GoalStageBlock stage={mockGoalStage} onImageClick={onImageClick} />)
    })

    const section = container.querySelector('section[data-testid="stage-0-goal"]')
    const heroImg = section?.querySelector('img[alt="Mục tiêu: Đừng Để AIKI Đoán Mò"]') as HTMLImageElement
    act(() => {
      heroImg.click()
    })

    expect(onImageClick).toHaveBeenCalledTimes(1)
    expect(onImageClick).toHaveBeenCalledWith({
      url: '/assets/aiki-islands/island1_lesson1_cat.jpg',
      title: 'Mục tiêu: Đừng Để AIKI Đoán Mò',
      fallbackUrl: '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2',
    })

    const zoomBtn = section?.querySelector('button[title="Xem ảnh phóng to"]') as HTMLButtonElement
    expect(zoomBtn).not.toBeNull()
    act(() => {
      zoomBtn.click()
    })

    expect(onImageClick).toHaveBeenCalledTimes(2)
  })

  it('falls back to safe fallback URL when image fails to load (onError self-healing)', () => {
    const onImageClick = vi.fn()
    const root = createRoot(container)
    act(() => {
      root.render(<GoalStageBlock stage={mockGoalStage} onImageClick={onImageClick} />)
    })

    const heroImg = container.querySelector('img[alt="Mục tiêu: Đừng Để AIKI Đoán Mò"]') as HTMLImageElement
    expect(heroImg).not.toBeNull()

    // Trigger error event
    act(() => {
      heroImg.dispatchEvent(new Event('error'))
    })

    // Image src must update to fallbackUrl
    expect(heroImg.src).toContain('/assets/aiki-islands/island1_lesson1_cat.jpg?v=2')

    // Subsequent zoom click must pass the recovered fallback URL
    act(() => {
      heroImg.click()
    })
    expect(onImageClick).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'),
      })
    )
  })

  it('updates displayed image src when stage.config.imageUrl changes', () => {
    const root = createRoot(container)
    act(() => {
      root.render(<GoalStageBlock stage={mockGoalStage} />)
    })

    const heroImg = container.querySelector('img[alt="Mục tiêu: Đừng Để AIKI Đoán Mò"]') as HTMLImageElement
    expect(heroImg.src).toContain('/assets/aiki-islands/island1_lesson1_cat.jpg')

    const updatedStage: JourneyStageDefinition<GoalStageConfig> = {
      ...mockGoalStage,
      config: {
        ...mockGoalStage.config,
        imageUrl: '/assets/aiki-rules/rule1_superhero_dad.jpg',
      },
    }

    act(() => {
      root.render(<GoalStageBlock stage={updatedStage} />)
    })

    expect(heroImg.src).toContain('/assets/aiki-rules/rule1_superhero_dad.jpg')
  })
})
