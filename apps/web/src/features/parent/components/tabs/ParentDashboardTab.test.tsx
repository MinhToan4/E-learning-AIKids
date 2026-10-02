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

  it('displays Touch-to-enter quick child switcher section at top of dashboard', async () => {
    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(ParentDashboardTab, { onOpenCheckout: vi.fn() }),
        ),
      )
    })

    // Section title and note
    expect(document.body.textContent).toContain('Chuyển nhanh sang không gian học của con')
    expect(document.body.textContent).toContain('Chạm vào bé để thiết bị chuyển sang chế độ học tập riêng của con')

    // Touch-to-enter card badges and CTA
    expect(document.body.textContent).toContain('⭐ 15 sao')
    expect(document.body.textContent).toContain('🎯 10 trạm')
    expect(document.body.textContent).toContain('Chạm để vào học ngay')
    expect(document.body.textContent).toContain('+ Thêm bé mới')
  })

  it('displays Administration and Safety Permissions section with quick management actions and consent controls', async () => {
    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(ParentDashboardTab, { onOpenCheckout: vi.fn() }),
        ),
      )
    })

    // Administration section header
    expect(document.body.textContent).toContain('Quản trị & Phân quyền an toàn')

    // Management buttons
    expect(document.body.textContent).toContain('Đổi tên / avatar')
    expect(document.body.textContent).toContain('Thẻ QR')
    expect(document.body.textContent).toContain('Tạm khóa')

    // Safety permission toggles
    expect(document.body.textContent).toContain('Cho phép AI tạo ảnh')
    expect(document.body.textContent).toContain('Sử dụng máy ảnh')
    expect(document.body.textContent).toContain('Xuất tác phẩm')
  })
})
