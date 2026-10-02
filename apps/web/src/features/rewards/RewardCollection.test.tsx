// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import * as apiModule from '@/shared/lib/api'
import { RewardCollection } from './RewardCollection'
import { readRewardEquipment } from './reward-equipment'

describe('RewardCollection persistence', () => {
  it('does not infer ownership from a high browser level', async () => {
    vi.spyOn(apiModule, 'api').mockImplementation(async (path: string) => {
      if (path.startsWith('/api/gamification/catalog')) return { items: [] } as never
      return {} as never
    })
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => {
      root.render(<RewardCollection userId="child-authoritative-inventory" xpLevel={112}
        initialWardrobe={{ ownedRewardIds: [], equipment: [] }} />)
      await Promise.resolve()
    })
    const titleTabs = Array.from(container.querySelectorAll('button')).filter((button) => button.textContent === 'Danh hiệu')
    await act(async () => titleTabs.at(-1)?.click())
    expect(container.textContent).toContain('Mở ở Cấp 3')
    expect(container.querySelector('.reward-equip-button')).toBeNull()
    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
  })

  it('keeps an equipped frame only after the storybook read confirms it', async () => {
    const userId = 'child-equip-confirmed'
    let persisted = false
    vi.spyOn(apiModule, 'api').mockImplementation(async (path: string, options?: RequestInit) => {
      if (path.startsWith('/api/gamification/catalog')) return { items: [] } as never
      if (path === '/api/gamification/rewards/equipment/frame' && options?.method === 'PUT') {
        persisted = true
        return { equipment: { kind: 'frame', rewardId: 'frame-rainbow' } } as never
      }
      if (path === '/api/gamification/storybook') {
        return {
          equipment: persisted ? [{ kind: 'frame', rewardId: 'frame-rainbow' }] : [],
        } as never
      }
      return {} as never
    })
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <RewardCollection
          userId={userId}
          xpLevel={3}
          initialWardrobe={{ ownedRewardIds: ['frame-rainbow'], equipment: [] }}
        />,
      )
      await Promise.resolve()
    })

    const equipButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Dùng khung cấp độ này'),
    )
    await act(async () => {
      equipButton?.click()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(readRewardEquipment(userId).frame).toBe('frame-rainbow')
    expect(container.textContent).toContain('Đã trang bị Khung Cầu Vồng')

    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
  })

  it('rolls back an optimistic equip when the Hub does not persist it', async () => {
    const userId = 'child-equip-rollback'
    vi.spyOn(apiModule, 'api').mockImplementation(async (path: string) => {
      if (path.startsWith('/api/gamification/catalog')) return { items: [] } as never
      if (path === '/api/gamification/rewards/equipment/frame') {
        throw new Error('Mất kết nối máy chủ')
      }
      return {} as never
    })
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <RewardCollection
          userId={userId}
          xpLevel={3}
          initialWardrobe={{ ownedRewardIds: ['frame-rainbow'], equipment: [] }}
        />,
      )
      await Promise.resolve()
    })

    const equipButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Dùng khung cấp độ này'),
    )
    expect(equipButton).toBeDefined()

    await act(async () => {
      equipButton?.click()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(readRewardEquipment(userId).frame).toBeUndefined()
    expect(container.textContent).toContain('Chưa thể dùng Khung Cầu Vồng')

    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
  })
})
