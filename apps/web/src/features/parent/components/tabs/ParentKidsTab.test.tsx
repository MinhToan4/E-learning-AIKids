// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { ParentKidsTab } from './ParentKidsTab'
import { api } from '@/shared/lib/api'
import { setDashboardCache, invalidateParentCache } from '@/features/parent/lib/parent-cache'

vi.mock('@/shared/lib/api', () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error {},
}))

describe('ParentKidsTab Component', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()
    invalidateParentCache()

    const mockedApi = vi.mocked(api)
    mockedApi.mockImplementation((path: string) => {
      if (path === '/api/parent/children') {
        return Promise.resolve({
          children: [
            {
              id: 'child-1',
              nickname: 'Bé Tít',
              avatarId: 'avatar-1',
              level: 4,
              xp: 420,
              active: true,
              totalStars: 20,
              completedQuests: 10,
              allowAiCreate: true,
              allowPhoto: false,
              allowExport: true,
            },
          ],
          subscription: {
            planCode: 'aikids_official_129k',
            planName: 'AI Kid Chính Thức',
            status: 'active',
            maxChildren: 3,
            maxOpenCoursesPerChild: 5,
            childCount: 1,
            seatsRemaining: 2,
            features: [],
            currentPeriodEnd: null,
          },
        })
      }
      if (path.includes('/api/parent/approvals')) {
        return Promise.resolve({
          approvals: [
            {
              id: 'appr-1',
              status: 'pending',
              destination: 'public',
              shareStatus: 'pending',
              project: { id: 'p1', title: 'Truyện Tít', kind: 'comic', thumbnail: '' },
              child: { id: 'child-1', nickname: 'Bé Tít' },
            },
          ],
        })
      }
      return Promise.resolve({})
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ''
    invalidateParentCache()
  })

  it('renders immediately in 0ms when cache is available without LoadingSkeleton', async () => {
    // Keep network pending to prove cache renders immediately without waiting for network
    vi.mocked(api).mockImplementation(() => new Promise(() => {}))

    setDashboardCache({
      kids: [
        {
          id: 'child-cached',
          nickname: 'Bé Miu',
          avatarId: 'avatar-2',
          level: 2,
          xp: 180,
          active: true,
          totalStars: 12,
          completedQuests: 6,
        },
      ],
      approvals: [],
      sub: {
        planCode: 'aikids_free',
        planName: 'Khởi Đầu',
        status: 'active',
        maxChildren: 2,
        maxOpenCoursesPerChild: 2,
        childCount: 1,
        seatsRemaining: 1,
        features: [],
        currentPeriodEnd: null,
      },
    })

    await act(async () => {
      root.render(
        createElement(MemoryRouter, null, createElement(ParentKidsTab, null)),
      )
    })

    expect(document.body.textContent).toContain('Bé Miu')
  })

  it('renders 4 distinct Soft-Clay stat blocks and island progress banner on each child card', async () => {
    await act(async () => {
      root.render(
        createElement(MemoryRouter, null, createElement(ParentKidsTab, null)),
      )
    })

    // Child card contains:
    expect(document.body.textContent).toContain('Bé Tít')
    expect(document.body.textContent).toContain('⭐ 20') // Sao
    expect(document.body.textContent).toContain('🎯 10') // Trạm
    expect(document.body.textContent).toContain('⚡ Lv.4') // Cấp
    expect(document.body.textContent).toContain('🎨 1') // Duyệt

    // Island progress banner
    expect(document.body.textContent).toContain('🏆 Đã hoàn thành 10 Quy tắc vàng')
  })
})
