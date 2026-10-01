// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { StageStepperBar } from './StageStepperBar'
import type { JourneyStageDefinition } from '../types/stage-schema'

const mockStages: JourneyStageDefinition[] = [
  { id: 'stage-0', type: 'GOAL', title: 'Mục tiêu', stepNumber: 1, config: {} },
  { id: 'stage-1', type: 'CONFIRM', title: 'Xác nhận', stepNumber: 2, config: {} },
  { id: 'stage-2', type: 'VIDEO', title: 'Video', stepNumber: 3, config: {} },
  { id: 'stage-3', type: 'QUIZ', title: 'Test', stepNumber: 4, config: {} },
  { id: 'stage-4', type: 'PRACTICE', title: 'Thực hành', stepNumber: 5, config: {} },
  { id: 'stage-5', type: 'REWARD', title: 'Hoàn thành', stepNumber: 6, config: {} },
]

describe('StageStepperBar - handleBackToMap', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('does NOT trigger onFinishLesson when user clicks back to map at intermediate uncompleted stage', async () => {
    const onBackToMap = vi.fn()
    const onFinishLesson = vi.fn()

    const root = createRoot(container)
    await act(async () => {
      root.render(
        <StageStepperBar
          stages={mockStages}
          currentStage={1}
          completedStages={new Set([0])}
          isVideoCompleted={false}
          quizScore={0}
          isCompletedLesson={false}
          onSelectStage={vi.fn()}
          onBackToMap={onBackToMap}
          onFinishLesson={onFinishLesson}
          lessonTitle="Bài 1.1"
          effectiveStars={1}
          effectiveRewardXp={20}
        />
      )
    })

    const backButton = container.querySelector('button[title*="bản đồ"], button[aria-label*="bản đồ"], button:has(svg)') as HTMLButtonElement
    expect(backButton).toBeTruthy()

    await act(async () => {
      backButton.click()
    })

    expect(onFinishLesson).not.toHaveBeenCalled()
    expect(onBackToMap).toHaveBeenCalledTimes(1)
    root.unmount()
  })

  it('triggers onFinishLesson when at REWARD stage or completed', async () => {
    const onBackToMap = vi.fn()
    const onFinishLesson = vi.fn()

    const root = createRoot(container)
    await act(async () => {
      root.render(
        <StageStepperBar
          stages={mockStages}
          currentStage={5}
          completedStages={new Set([0, 1, 2, 3, 4, 5])}
          isVideoCompleted={true}
          quizScore={3}
          isCompletedLesson={true}
          onSelectStage={vi.fn()}
          onBackToMap={onBackToMap}
          onFinishLesson={onFinishLesson}
          lessonTitle="Bài 1.1"
          effectiveStars={3}
          effectiveRewardXp={50}
        />
      )
    })

    const backButton = container.querySelector('button[title*="bản đồ"], button[aria-label*="bản đồ"], button:has(svg)') as HTMLButtonElement
    expect(backButton).toBeTruthy()

    await act(async () => {
      backButton.click()
    })

    expect(onFinishLesson).toHaveBeenCalledTimes(1)
    expect(onBackToMap).toHaveBeenCalledTimes(1)
    root.unmount()
  })
})
