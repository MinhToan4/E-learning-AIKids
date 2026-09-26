// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import {
  BackpackPage,
  isCleanBackpackProject,
  isRawInternalFile,
  friendlyProjectTitle,
} from './BackpackPage'
import * as apiModule from '@/shared/lib/api'
import { syncRewardEquipment } from '@/features/rewards/reward-equipment'

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

describe('BackpackPage filtering helpers', () => {
  it('isCleanBackpackProject eliminates junk files and missing thumbnails', () => {
    // Should reject junk files reported by boss
    expect(isCleanBackpackProject({ title: 'storyPlot comic 1785830218476', thumbnail: '/thumb.webp' })).toBe(false)
    expect(isCleanBackpackProject({ title: 'storyPlot-comic-999', thumbnail: '/thumb.webp' })).toBe(false)
    expect(isCleanBackpackProject({ title: 'prompt-schema-1234', thumbnail: '/thumb.webp' })).toBe(false)
    expect(isCleanBackpackProject({ title: 'project.json', thumbnail: '/thumb.webp' })).toBe(false)
    expect(isCleanBackpackProject({ title: 'temp-preview', thumbnail: '/thumb.webp' })).toBe(false)
    expect(isCleanBackpackProject({ title: 'draft-file', thumbnail: '/thumb.webp' })).toBe(false)

    // Should reject invalid or missing thumbnails
    expect(isCleanBackpackProject({ title: 'Bức tranh của bé', thumbnail: '' })).toBe(false)
    expect(isCleanBackpackProject({ title: 'Bức tranh của bé', thumbnail: 'data.json' })).toBe(false)

    // Should accept clean projects and assets
    expect(isCleanBackpackProject({ title: 'Truyện tranh Vẹt Paco', thumbnail: '/thumb.webp' })).toBe(true)
    expect(isCleanBackpackProject({ name: 'Tranh Vẹt Paco', thumbnail: '/thumb.webp' })).toBe(true)
    expect(isCleanBackpackProject({ title: 'Tranh chú cún', url: 'https://example.com/dog.png' })).toBe(true)
  })

  it('isRawInternalFile identifies internal junk files', () => {
    expect(isRawInternalFile('storyPlot comic 1785830218476')).toBe(true)
    expect(isRawInternalFile('storyPlot-comic-555')).toBe(true)
    expect(isRawInternalFile('prompt-schema-01')).toBe(true)
    expect(isRawInternalFile('backup.json')).toBe(true)
    expect(isRawInternalFile('Bức tranh của bé')).toBe(false)
    expect(isRawInternalFile('')).toBe(false)
  })

  it('friendlyProjectTitle cleans up raw technical names', () => {
    expect(friendlyProjectTitle('storyPlot-comic-1234')).toBe('Truyện tranh AI')
    expect(friendlyProjectTitle('prompt-schema-99')).toBe('Ý tưởng sáng tạo')
    expect(friendlyProjectTitle('chu_cun_nho.png')).toBe('chu cun nho')
    expect(friendlyProjectTitle('')).toBe('Tác phẩm của con')
  })
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

  it('loads creations first and fetches each optional compartment only when opened', async () => {
    const apiSpy = vi.spyOn(apiModule, 'api').mockImplementation(async (endpoint: string) => {
      if (endpoint === '/api/backpack/overview') return {
        assets: [{ id: 'asset-1', type: 'image', name: 'Ảnh', thumbnail: '/a.webp', private: true, createdAt: '' }],
        projects: [{ id: 'project-1', title: 'Tranh', kind: 'image', thumbnail: '/p.webp', shareStatus: 'private' }],
      } as any
      if (endpoint === '/api/gamification/storybook') return { inventory: [{ rewardId: 'reward-1' }] } as any
      if (endpoint === '/api/gamification/catalog?type=reward') return { items: [{ code: 'reward-1', name: 'Quà', description: '', kind: 'perk' }] } as any
      if (endpoint === '/api/gamification/achievements') return { achievements: [{ id: 'badge-1', type: 'first_lesson', title: 'Bước đầu', unlocked: true }] } as any
      if (endpoint === '/api/gamification/profile') return { totalXp: 10, level: 2 } as any
      return {} as any
    })

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<MemoryRouter><BackpackPage /></MemoryRouter>)
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    let calls = apiSpy.mock.calls.map(([endpoint]) => endpoint)
    expect(calls.filter((value) => value === '/api/backpack/overview')).toHaveLength(1)
    expect(calls).not.toContain('/api/backpack')
    expect(calls).not.toContain('/api/projects')
    expect(calls).not.toContain('/api/gamification/storybook')
    expect(calls).not.toContain('/api/gamification/catalog?type=reward')
    expect(calls).not.toContain('/api/gamification/achievements')

    const buttons = Array.from(container.querySelectorAll('button'))
    await act(async () => {
      buttons.find((button) => button.textContent?.includes('Huy hiệu thành tích'))?.click()
      await new Promise((resolve) => setTimeout(resolve, 20))
    })
    await act(async () => {
      buttons.find((button) => button.textContent?.includes('Bảo bối & Kỷ vật'))?.click()
      await new Promise((resolve) => setTimeout(resolve, 20))
    })

    calls = apiSpy.mock.calls.map(([endpoint]) => endpoint)
    expect(calls.filter((value) => value === '/api/gamification/achievements')).toHaveLength(1)
    expect(calls.filter((value) => value === '/api/gamification/storybook')).toHaveLength(1)
    expect(calls.filter((value) => value === '/api/gamification/catalog?type=reward')).toHaveLength(1)

    act(() => root.unmount())
    container.remove()
  })

  it('renders the equipped title label instead of its internal reward id', async () => {
    syncRewardEquipment('guest', { title: 'title-curious-seeker' })
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(<MemoryRouter><BackpackPage /></MemoryRouter>)
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    expect(container.textContent).toContain('Người Tìm Tòi')
    expect(container.textContent).not.toContain('title-curious-seeker')

    act(() => root.unmount())
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

  it('renders 3 core compartments and does not render standalone wardrobe tab', async () => {
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

    // Confirm 3 core compartments are present
    expect(container.textContent).toContain('Tác phẩm sáng tạo')
    expect(container.textContent).toContain('Huy hiệu thành tích')
    expect(container.textContent).toContain('Bảo bối & Kỷ vật')

    // Confirm nav does NOT have 'Ngoại trang'
    const nav = container.querySelector('nav')
    expect(nav?.textContent).not.toContain('Ngoại trang')

    // Confirm CTA to profile wardrobe exists
    expect(container.textContent).toContain('Tủ đồ & Đổi trang trí')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('loads lesson notebook works from aiki_backpack_items_ into projects', async () => {
    const lessonItems = [
      {
        id: 'notebook-101',
        url: '/assets/aiki-islands/island1_lesson2_notebook.jpg',
        prompt: 'Ghi chép bài học số 2 của bé',
        time: '14:20',
        lessonId: 'bai-1-2',
        lessonTitle: 'Cánh Cổng AI Đầu Tiên',
        category: 'notebook',
      },
    ]
    localStorage.setItem('aiki_backpack_items_bai-1-2', JSON.stringify(lessonItems))

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

    expect(container.textContent).toContain('Bài học: Cánh Cổng AI Đầu Tiên')

    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders Bằng Khen Tốt Nghiệp Con Đã Nhận in treasures tab and opens modal on click', async () => {
    const certs = [
      {
        id: 'cert-course-aikid-official',
        courseId: 'cert-course-aikid-official',
        courseTitle: 'Khóa Học Sáng Tạo Nội Dung Cùng AIKids (6 Đảo • 32 Trạm)',
        islandTitle: 'Tốt Nghiệp Xuất Sắc Toàn Khóa',
        studentName: 'Bé An Nhi',
        issuedDate: '25/09/2026',
        stars: 96,
        xp: 3200,
        claimedAt: Date.now(),
      },
    ]
    localStorage.setItem('aiki_backpack_certificates', JSON.stringify(certs))

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

    // Click on "Bảo bối & Kỷ vật" tab
    const buttons = Array.from(container.querySelectorAll('button'))
    const treasuresBtn = buttons.find((b) => b.textContent?.includes('Bảo bối & Kỷ vật'))
    expect(treasuresBtn).toBeDefined()

    await act(async () => {
      treasuresBtn?.click()
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Verify certificates section in treasures tab
    expect(container.textContent).toContain('📜 Bằng Khen Tốt Nghiệp Con Đã Nhận (1)')
    expect(container.textContent).toContain('Khóa Học Sáng Tạo Nội Dung Cùng AIKids (6 Đảo • 32 Trạm)')
    expect(container.textContent).toContain('Bé An Nhi')
    expect(container.textContent).toContain('96 Sao')
    expect(container.textContent).toContain('+3200 EXP')

    // Click certificate card to open modal
    const certBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Xem chi tiết bằng khen 📜')
    )
    expect(certBtn).toBeDefined()

    await act(async () => {
      certBtn?.click()
    })

    // Modal is open
    expect(document.body.textContent).toContain('Chứng Nhận Tốt Nghiệp')
    expect(document.body.textContent).toContain('Bé An Nhi')

    act(() => {
      root.unmount()
    })
    container.remove()
  })
})
