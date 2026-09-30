// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot as originalCreateRoot } from 'react-dom/client'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { RewardStageBlock } from './RewardStageBlock'
import type { JourneyStageDefinition, RewardStageConfig } from '../../types/stage-schema'

const activeRoots: Array<{ unmount: () => void }> = []
const createRoot: typeof originalCreateRoot = (container, options) => {
  const root = originalCreateRoot(container, options)
  activeRoots.push(root)
  return root
}

const mockRewardStage: JourneyStageDefinition<RewardStageConfig> = {
  id: 'stage-5',
  type: 'REWARD',
  title: 'Hoàn thành',
  stepNumber: 6,
  config: {
    title: 'Chúc mừng con đã hoàn thành!',
    congratsMessage: 'Con đã làm rất tốt!',
    rewardBadge: {
      name: 'Chiến Binh AI',
      iconUrl: '/assets/badge.png',
      xp: 50,
    },
    nextLessonSlug: 'bai-1-2-bon-chiec-chia-khoa',
  },
}

describe('RewardStageBlock guaranteed navigation', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    vi.useFakeTimers()
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
    container.remove()
    vi.useRealTimers()
  })

  it('guarantees navigation to next lesson when clicking "Khám phá bài tiếp theo" even if onFinishLesson returns false', () => {
    const onFinishLesson = vi.fn(() => false)
    const onNavigateNextLesson = vi.fn()

    const root = createRoot(container)
    act(() => {
      root.render(
        <RewardStageBlock
          stage={mockRewardStage}
          onFinishLesson={onFinishLesson}
          onNavigateNextLesson={onNavigateNextLesson}
        />,
      )
    })

    const nextBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Khám phá bài tiếp theo'),
    )
    expect(nextBtn).toBeDefined()

    act(() => {
      nextBtn?.click()
    })

    expect(onFinishLesson).toHaveBeenCalled()
    expect(onNavigateNextLesson).toHaveBeenCalledWith('bai-1-2-bon-chiec-chia-khoa')
  })

  it('guarantees navigation to next lesson when onFinishLesson rejects as a Promise', async () => {
    const onFinishLesson = vi.fn(() => Promise.reject(new Error('Backend offline 500')))
    const onNavigateNextLesson = vi.fn()

    const root = createRoot(container)
    act(() => {
      root.render(
        <RewardStageBlock
          stage={mockRewardStage}
          onFinishLesson={onFinishLesson}
          onNavigateNextLesson={onNavigateNextLesson}
        />,
      )
    })

    const nextBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Khám phá bài tiếp theo'),
    )

    await act(async () => {
      nextBtn?.click()
      await Promise.resolve()
    })

    expect(onFinishLesson).toHaveBeenCalled()
    expect(onNavigateNextLesson).toHaveBeenCalledWith('bai-1-2-bon-chiec-chia-khoa')
  })

  it('guarantees navigation via safety timeout if onFinishLesson promise hangs indefinitely', () => {
    const onFinishLesson = vi.fn(() => new Promise<boolean>(() => {}))
    const onNavigateNextLesson = vi.fn()

    const root = createRoot(container)
    act(() => {
      root.render(
        <RewardStageBlock
          stage={mockRewardStage}
          onFinishLesson={onFinishLesson}
          onNavigateNextLesson={onNavigateNextLesson}
        />,
      )
    })

    const nextBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Khám phá bài tiếp theo'),
    )

    act(() => {
      nextBtn?.click()
    })

    // Advance past safety timeout (350ms)
    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(onNavigateNextLesson).toHaveBeenCalledWith('bai-1-2-bon-chiec-chia-khoa')
  })

  it('guarantees navigation to map when clicking "Quay về bản đồ đảo" even if onFinishLesson returns false', () => {
    const onFinishLesson = vi.fn(() => false)
    const onBackToMap = vi.fn()

    const root = createRoot(container)
    act(() => {
      root.render(
        <RewardStageBlock
          stage={mockRewardStage}
          onFinishLesson={onFinishLesson}
          onBackToMap={onBackToMap}
        />,
      )
    })

    const backBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Quay về bản đồ đảo'),
    )
    expect(backBtn).toBeDefined()

    act(() => {
      backBtn?.click()
    })

    expect(onFinishLesson).toHaveBeenCalled()
    expect(onBackToMap).toHaveBeenCalled()
  })
})
