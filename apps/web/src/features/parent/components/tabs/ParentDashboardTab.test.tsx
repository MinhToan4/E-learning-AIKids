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
              allowAiCreate: true,
              allowPhoto: true,
              allowExport: true,
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
              allowAiCreate: true,
              allowPhoto: false,
              allowExport: true,
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

  it('removes all 5 KPI stat cards from the dashboard for a clean, clutter-free view', async () => {
    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(ParentDashboardTab, { onOpenCheckout: vi.fn() }),
        ),
      )
    })

    // 5 old KPI stat cards must NOT be rendered on the dashboard
    expect(document.body.textContent).not.toContain('Số con theo học')
    expect(document.body.textContent).not.toContain('Tổng sao tích lũy')
    expect(document.body.textContent).not.toContain('Nhiệm vụ hoàn thành')
  })

  it('renders unified "Hồ sơ của các con" section with touch-to-enter and learning links', async () => {
    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(ParentDashboardTab, { onOpenCheckout: vi.fn() }),
        ),
      )
    })

    // Section title and description
    expect(document.body.textContent).toContain('Hồ sơ của các con')
    expect(document.body.textContent).toContain('Chạm vào bé để thiết bị chuyển sang không gian học tập riêng, hoặc quản lý phân quyền bảo vệ con.')

    // Children cards
    expect(document.body.textContent).toContain('Bo')
    expect(document.body.textContent).toContain('Bi')
    expect(document.body.textContent).toContain('Lv.3')
    expect(document.body.textContent).toContain('Lv.1')
    expect(document.body.textContent).toContain('⭐ 15 sao')
    expect(document.body.textContent).toContain('🎯 10 trạm')

    // Action buttons
    expect(document.body.textContent).toContain('Chạm để vào học ngay')
    expect(document.body.textContent).not.toContain('🚀')
    expect(document.body.textContent).not.toContain('👨‍👩‍👧‍👦')
    expect(document.body.textContent).toContain('Xem tiến độ học tập')
    expect(document.body.textContent).toContain('+ Thêm bé mới')
  })

  it('displays quick management tools and expands collapsible safety permissions on demand', async () => {
    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(ParentDashboardTab, { onOpenCheckout: vi.fn() }),
        ),
      )
    })

    // Collapsible accordion button
    expect(document.body.textContent).toContain('Cài đặt & Phân quyền an toàn')
    expect(document.body.textContent).not.toContain('🛡️')

    // Initially collapsed: consent switches are not visible
    expect(document.body.textContent).not.toContain('Cho phép AI tạo ảnh')

    // Click accordion toggle to expand safety permissions
    const safetyToggleBtn = document.querySelector('button[aria-expanded="false"]') as HTMLButtonElement
    expect(safetyToggleBtn).toBeTruthy()

    await act(async () => {
      safetyToggleBtn.click()
    })

    // Now expanded: shows the 3 safety permission switches
    expect(document.body.textContent).toContain('Cho phép AI tạo ảnh')
    expect(document.body.textContent).toContain('Sử dụng máy ảnh')
    expect(document.body.textContent).toContain('Xuất tác phẩm')
  })
})
