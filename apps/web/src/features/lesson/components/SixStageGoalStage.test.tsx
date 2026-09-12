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
})
