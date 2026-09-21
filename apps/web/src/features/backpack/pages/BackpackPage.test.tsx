// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import { BackpackPage } from './BackpackPage'
import * as apiModule from '@/shared/lib/api'

let mockStorage: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = String(val)
  },
  removeItem: (key: string) => {
    delete mockStorage[key]
  },
  clear: () => {
    mockStorage = {}
  },
  get length() {
    return Object.keys(mockStorage).length
  },
  key: (i: number) => Object.keys(mockStorage)[i] ?? null,
}
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
})

describe('BackpackPage', () => {
  beforeEach(() => {
    mockStorage = {}
    vi.spyOn(apiModule, 'api').mockImplementation(async (endpoint: string) => {
      if (endpoint === '/api/backpack') return { assets: [] } as any
      if (endpoint === '/api/projects') return { projects: [] } as any
      if (endpoint === '/api/gamification/storybook') return { inventory: [] } as any
      if (endpoint === '/api/gamification/catalog?type=reward') return { items: [] } as any
      if (endpoint === '/api/gamification/achievements') return { achievements: [] } as any
      if (endpoint.includes('/api/v1/media/gallery')) return { items: [] } as any
      return {} as any
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    mockStorage = {}
  })

  it('loads saved studio works from aiki_backpack_saved_works into projects', async () => {
    const savedWorks = [
      {
        id: 'bp-masterpiece-123',
        title: 'Kiệt tác: Cái cốc sứ trắng...',
        stationLabel: 'Bài 1.2',
        url: '/assets/aiki-islands/island1_lesson2_teacup.jpg',
        time: '08:30',
        prompt: 'Cái cốc sứ trắng',
        lessonId: 'bai-1-2',
        isNew: true,
        isMasterpiece: true,
        badgeColor: 'bg-amber-500',
      },
      {
        id: 'bp-sketch-124',
        title: 'Cái cốc sứ trắng (Lượt 1): Cốc sứ...',
        stationLabel: 'Bài 1.2',
        url: '/assets/aiki-islands/island1_lesson2_teacup.jpg',
        time: '08:32',
        prompt: 'Cốc sứ',
        lessonId: 'bai-1-2',
        isNew: true,
        badgeColor: 'bg-indigo-600',
      },
    ]

    localStorage.setItem('aiki_backpack_saved_works', JSON.stringify(savedWorks))

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <BackpackPage />
        </MemoryRouter>
      )
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    const buttons = container.querySelectorAll('button')
    const projectsNavBtn = Array.from(buttons).find((b) => b.textContent?.includes('Tác phẩm'))
    expect(projectsNavBtn).toBeDefined()

    await act(async () => {
      projectsNavBtn?.click()
    })

    expect(container.textContent).toContain('Kiệt tác: Cái cốc sứ trắng...')
    expect(container.textContent).toContain('Cái cốc sứ trắng (Lượt 1): Cốc sứ...')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('does not show error banner when local projects exist even if network calls fail', async () => {
    vi.spyOn(apiModule, 'api').mockImplementation(async (endpoint: string) => {
      if (endpoint.includes('/api/v1/media/gallery')) throw new Error('Offline')
      if (endpoint === '/api/projects') throw new Error('Network error')
      if (endpoint === '/api/backpack') throw new Error('Offline')
      if (endpoint === '/api/gamification/storybook') return { inventory: [] } as any
      if (endpoint === '/api/gamification/catalog?type=reward') return { items: [] } as any
      return {} as any
    })

    const savedWorks = [
      {
        id: 'bp-local-1',
        title: 'Tranh địa phương của bé',
        kind: 'image',
        thumbnail: '/test.jpg',
        prompt: 'Tranh vui',
      },
    ]
    localStorage.setItem('aiki_backpack_saved_works', JSON.stringify(savedWorks))

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <BackpackPage />
        </MemoryRouter>
      )
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    expect(container.textContent).not.toContain('Một vài ngăn chưa tải được. Con thử lại nhé.')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('shows error banner when network calls fail and no local or remote projects exist', async () => {
    vi.spyOn(apiModule, 'api').mockImplementation(async (endpoint: string) => {
      throw new Error('Network error')
    })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <BackpackPage />
        </MemoryRouter>
      )
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    expect(container.textContent).toContain('Một vài ngăn chưa tải được. Con thử lại nhé.')

    act(() => {
      root.unmount()
    })
    container.remove()
  })
})
