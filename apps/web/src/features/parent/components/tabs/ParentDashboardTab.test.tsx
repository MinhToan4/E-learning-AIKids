// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { ParentDashboardTab } from './ParentDashboardTab'
import { api } from '@/shared/lib/api'
import { setDashboardCache, invalidateParentCache } from '@/features/parent/lib/parent-cache'

vi.mock('@/shared/lib/api', () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error {},
}))

describe('ParentDashboardTab Component', () => {
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
              id: 'child-bo',
              nickname: 'Bo',
              avatarId: 'avatar-1',
              level: 3,
              xp: 350,
              active: true,
              totalStars: 15,
              completedQuests: 10,
            },
            {
              id: 'child-bi',
              nickname: 'Bi',
              avatarId: 'avatar-2',
              level: 1,
              xp: 80,
              active: true,
              totalStars: 8,
              completedQuests: 4,
            },
          ],
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
              project: { id: 'p1', title: 'Tranh AI Bo', kind: 'comic', thumbnail: '' },
              child: { id: 'child-bo', nickname: 'Bo' },
            },
          ],
        })
      }
      if (path === '/api/parent/subscription') {
        return Promise.resolve({
          subscription: {
            planCode: 'aikids_official_129k',
            planName: 'AI Kid Chính Thức',
            status: 'active',
            maxChildren: 3,
            maxOpenCoursesPerChild: 5,
            childCount: 2,
            seatsRemaining: 1,
            features: [],
            currentPeriodEnd: null,
            aiCreditsRemaining: 45,
          },
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

  it('renders instantly in 0ms without skeleton when dashboard cache is available', async () => {
    // Keep network pending to prove cache renders immediately without waiting for network
    vi.mocked(api).mockImplementation(() => new Promise(() => {}))

    setDashboardCache({
      kids: [
        {
          id: 'child-cached',
          nickname: 'Bé Bắp',
          avatarId: 'avatar-1',
          level: 2,
          xp: 150,
          active: true,
          totalStars: 10,
          completedQuests: 3,
        },
      ],
      approvals: [],
      sub: null,
    })

    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(ParentDashboardTab, { onOpenCheckout: vi.fn() }),
        ),
      )
    })

    // Should immediately display Bé Bắp without loading skeleton
    expect(document.body.textContent).toContain('Bé Bắp')
  })

  it('displays per-child breakdown subtext in KPI metric cards for stars and quests', async () => {
    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(ParentDashboardTab, { onOpenCheckout: vi.fn() }),
        ),
      )
    })

    // Breakdown subtext: "Bo: 15 sao · Bi: 8 sao"
    expect(document.body.textContent).toContain('Bo: 15 sao · Bi: 8 sao')
    // Breakdown subtext: "Bo: 10 trạm · Bi: 4 trạm"
    expect(document.body.textContent).toContain('Bo: 10 trạm · Bi: 4 trạm')
  })

  it('displays Per-Child Comparative Scorecard Matrix when 2 or more children exist', async () => {
    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(ParentDashboardTab, { onOpenCheckout: vi.fn() }),
        ),
      )
    })

    // Title of comparative scorecard
    expect(document.body.textContent).toContain('Bảng so sánh chỉ số giữa các con')
    expect(document.body.textContent).toContain('2 bé song hành')

    // Check Bo's matrix info: >= 10 quests -> Hoàn thành Đảo Tiên Quyết
    expect(document.body.textContent).toContain('Hoàn thành Đảo Tiên Quyết')

    // Check Bi's matrix info: 4 quests -> Đang ở Trạm 5 / 10
    expect(document.body.textContent).toContain('Đang ở Trạm 5 / 10')
  })

  it('renders 4 distinct Soft-Clay stat blocks and island progress banner in each child card', async () => {
    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(ParentDashboardTab, { onOpenCheckout: vi.fn() }),
        ),
      )
    })

    // Child cards contain 4 stat blocks: Sao, Trạm, Cấp, Duyệt
    expect(document.body.textContent).toContain('⭐ 15')
    expect(document.body.textContent).toContain('🎯 10')
    expect(document.body.textContent).toContain('⚡ Lv.3')
    expect(document.body.textContent).toContain('🎨 1') // Bo has 1 pending approval

    // Island banners
    expect(document.body.textContent).toContain('🏆 Đã hoàn thành 10 Quy tắc vàng')
    expect(document.body.textContent).toContain('🧭 Đang thám hiểm Đảo Tiên Quyết (Trạm 5/10)')
  })
})
