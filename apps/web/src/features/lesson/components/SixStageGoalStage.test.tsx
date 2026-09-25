// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { SixStageGoalStage } from './SixStageGoalStage'

const goal = {
  id: 'goal-1-2',
  title: 'Mục tiêu bài học: Bài 1.2 — Bốn chiếc chìa khoá',
  goalText: 'Trẻ viết được một câu lệnh có đủ bốn phần.',
  imageUrl: '/assets/aiki-islands/island1_lesson2_keys_v2.jpg',
  speech: '',
  keyPoints: [
    "CÁI GÌ (Xanh Sky): 'một cái cốc'",
    "TRÔNG NHƯ THẾ NÀO (Vàng Sun): 'sứ trắng'",
    "ĐANG LÀM GÌ (Cam Mango): 'đang bốc khói'",
    "Ở ĐÂU (Hồng Gum): 'trên bàn gỗ'",
  ],
}

describe('SixStageGoalStage', () => {
  let container: HTMLDivElement | null = null

  afterEach(() => {
    container?.remove()
    container = null
  })

  it('renders the same four-key visual contract used by the learner stage', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    act(() => root.render(<SixStageGoalStage goal={goal} fourKeys showContinue={false} />))

    expect(container.textContent).toContain('Rương 4 Chìa Khóa Thần Kỳ')
    expect(container.textContent).toContain('[1] CÁI GÌ')
    expect(container.textContent).toContain('[2] TRÔNG THẾ NÀO')
    expect(container.textContent).toContain('[3] ĐANG LÀM GÌ')
    expect(container.textContent).toContain('[4] Ở ĐÂU')
    expect(container.textContent).toContain('“một cái cốc”')
    expect(container.querySelector('button')).toBeNull()
    act(() => root.unmount())
  })

  it('applies anti-clipping styles (line-clamp-3, leading-snug, break-words, items-start) so long text is fully legible on iPad', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    act(() => root.render(<SixStageGoalStage goal={goal} fourKeys showContinue={false} />))

    // Card containers must use items-start and min-h-[64px]
    const cardElements = container.querySelectorAll('.min-h-\\[64px\\]')
    expect(cardElements.length).toBe(4)
    cardElements.forEach((el) => {
      expect(el.className).toContain('items-start')
      expect(el.className).toContain('min-h-[64px]')
    })

    // Value text must use line-clamp-3, leading-snug, break-words (not line-clamp-1)
    const valueTexts = container.querySelectorAll('p.line-clamp-3')
    expect(valueTexts.length).toBe(4)
    valueTexts.forEach((el) => {
      expect(el.className).toContain('leading-snug')
      expect(el.className).toContain('break-words')
      expect(el.className).not.toContain('line-clamp-1')
    })

    act(() => root.unmount())
  })

  it('renders sequential vertical flow with Hero Row banner and 4-column responsive grid', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    let continued = false
    act(() =>
      root.render(
        <SixStageGoalStage
          goal={goal}
          fourKeys
          showContinue
          onContinue={() => {
            continued = true
          }}
        />
      )
    )

    // Hero Row banner
    const heroBanner = container.querySelector('.max-w-2xl')
    expect(heroBanner).not.toBeNull()
    expect(heroBanner?.className).not.toContain('aspect-[16/9]')
    expect(heroBanner?.className).toContain('rounded-2xl')
    expect(heroBanner?.querySelector('img')?.className).toContain('h-auto')

    // 4-column responsive grid on desktop / 2-column on tablet
    const grid = container.querySelector('.lg\\:grid-cols-4')
    expect(grid).not.toBeNull()
    expect(grid?.className).toContain('sm:grid-cols-2')

    // Next button
    const btn = container.querySelector('button')
    expect(btn?.textContent).toContain('Đã hiểu mục tiêu! Đi tiếp nào')
    act(() => {
      btn?.click()
    })
    expect(continued).toBe(true)

    act(() => root.unmount())
  })

  it('renders single-column grid in compact mode', () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    act(() => root.render(<SixStageGoalStage goal={goal} fourKeys compact showContinue={false} />))

    const grid = container.querySelector('.grid-cols-1')
    expect(grid).not.toBeNull()
    expect(grid?.className).not.toContain('lg:grid-cols-4')

    act(() => root.unmount())
  })
})
