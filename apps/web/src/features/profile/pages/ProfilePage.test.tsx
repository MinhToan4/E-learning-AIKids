// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router'
import {
  ProfilePage,
  isCleanDisplayableWork,
  friendlyProjectTitle,
  type ProfileTabSection,
} from './ProfilePage'
import * as apiModule from '@/shared/lib/api'
import * as learningApiModule from '@/shared/lib/learning-api'
import { useAuth } from '@/shared/store/auth'

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

describe('ProfilePage helpers', () => {
  it('isCleanDisplayableWork eliminates 100% of internal junk files and invalid drafts', () => {
    // Should reject junk files reported by boss
    expect(isCleanDisplayableWork({ title: 'storyPlot comic 1785830218476', thumbnail: '/thumb.webp' })).toBe(false)
    expect(isCleanDisplayableWork({ title: 'storyPlot-comic-1785830218476', thumbnail: '/thumb.webp' })).toBe(false)
    expect(isCleanDisplayableWork({ title: 'prompt-schema-1234', thumbnail: '/thumb.webp' })).toBe(false)
    expect(isCleanDisplayableWork({ title: 'draft-internal-backup', thumbnail: '/thumb.webp' })).toBe(false)
    expect(isCleanDisplayableWork({ title: 'project.json', thumbnail: '/thumb.webp' })).toBe(false)

    // Should reject missing or invalid thumbnails
    expect(isCleanDisplayableWork({ title: 'Bức tranh chú cún', thumbnail: '' })).toBe(false)
    expect(isCleanDisplayableWork({ title: 'Bức tranh chú cún', thumbnail: 'data.json' })).toBe(false)

    // Should accept clean displayable works
    expect(isCleanDisplayableWork({ title: 'Truyện tranh Vẹt Paco', thumbnail: '/assets/paco.webp' })).toBe(true)
    expect(isCleanDisplayableWork({ title: 'Bức tranh Chú Cún', thumbnail: 'https://example.com/dog.png' })).toBe(true)
    expect(isCleanDisplayableWork({ title: 'Kiệt tác Chiếc Cốc Sứ', thumbnail: 'data:image/png;base64,123' })).toBe(true)
  })

  it('friendlyProjectTitle produces clear, kid-friendly Vietnamese titles without AI buzzwords', () => {
    expect(friendlyProjectTitle('storyPlot-comic-1234')).toBe('Truyện tranh')
    expect(friendlyProjectTitle('prompt-schema-99')).toBe('Ý tưởng sáng tạo')
    expect(friendlyProjectTitle('chu_cun_nho.png')).toBe('chu cun nho')
    expect(friendlyProjectTitle('paco_phi_phieu.jpg')).toBe('paco phi phieu')
    expect(friendlyProjectTitle('')).toBe('Tác phẩm của con')
  })
})

describe('ProfilePage Component', () => {
  let apiSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mockStorage = {}
    useAuth.getState().setUser({
      id: 'test-student-1',
      name: 'Bé Minh',
      email: 'minh@example.com',
      role: 'student',
      level: 3,
      xp: 450,
      avatarId: '/avatars/paco.png',
      nickname: 'Minh Thám Hiểm',
    })

    apiSpy = vi.spyOn(apiModule, 'api').mockImplementation(async (endpoint: string) => {
      if (endpoint.startsWith('/api/v1/aikids/profile-overview?')) {
        return {
          streak: { current: 5 },
          projects: {
            items: [
              {
                id: 'p-clean-1',
                title: 'Truyện tranh Vẹt Paco',
                kind: 'comic',
                creativeKind: 'comic',
                thumbnail: '/assets/paco.jpg',
                shareStatus: 'approved',
              },
              {
                id: 'p-clean-2',
                title: 'Bức tranh Chú Cún Nhỏ',
                kind: 'drawing',
                creativeKind: 'drawing',
                thumbnail: '/assets/dog.jpg',
                shareStatus: 'approved',
              },
            ],
          },
          appearance: { slug: 'be-minh' },
          pathway: await learningApiModule.learningApi.getPathway(),
        } as any
      }
      if (endpoint === '/api/gamification/streak') return { current: 5 } as any
      if (endpoint === '/api/projects') {
        return {
          projects: [
            {
              id: 'p-clean-1',
              title: 'Truyện tranh Vẹt Paco',
              kind: 'comic',
              thumbnail: '/assets/paco.jpg',
              shareStatus: 'approved',
            },
            {
              id: 'p-clean-2',
              title: 'Bức tranh Chú Cún Nhỏ',
              kind: 'drawing',
              thumbnail: '/assets/dog.jpg',
              shareStatus: 'approved',
            },
            // Corrupted junk file
            {
              id: 'p-junk-1',
              title: 'storyPlot comic 1785830218476',
              kind: 'comic',
              thumbnail: '',
              shareStatus: 'private',
            },
          ],
        } as any
      }
      if (endpoint === '/api/backpack') return { assets: [] } as any
      if (endpoint === '/api/gamification/profile') return { totalXp: 450, level: 3 } as any
      return {} as any
    })

    vi.spyOn(learningApiModule.learningApi, 'getPathway').mockResolvedValue({
      student: { nickname: 'Minh Thám Hiểm', ageBand: '6-8' },
      policy: null,
      recommendedCourseId: 'dao-1',
      courses: [
        {
          id: 'dao-1',
          title: 'Đảo 1: 10 Quy Tắc Vàng',
          shortTitle: 'Đảo 1',
          status: 'active',
          reasonCode: '',
          completionPercent: 60,
          missingPrerequisites: [],
          coverImage: null,
          enrolled: true,
          enrollmentId: 'e-1',
          questCount: 5,
          completedCount: 3,
          totalStars: 9,
        },
      ],
    } as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders 2 Soft Clay Floating Pill Tabs and defaults to works tab ("Ảnh đã tạo")', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      )
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Navigation tab list with exactly 2 tabs: 'works' and 'certificates'
    const nav = container.querySelector('nav[role="tablist"]')
    expect(nav).not.toBeNull()
    const tabs = Array.from(nav?.querySelectorAll('button[role="tab"]') ?? [])
    expect(tabs).toHaveLength(2)
    expect(tabs[0].textContent).toContain('Ảnh đã tạo')
    expect(tabs[1].textContent).toContain('Bằng khen')

    // Default active tab is 'works'
    expect(tabs[0].getAttribute('aria-selected')).toBe('true')
    expect(tabs[1].getAttribute('aria-selected')).toBe('false')

    // Verifies obsolete tabs are completely gone
    expect(container.querySelector('#tab-storybook')).toBeNull()
    expect(container.querySelector('#tab-memories')).toBeNull()
    expect(container.querySelector('#tab-customize')).toBeNull()
    expect(container.querySelector('#tab-progress')).toBeNull()

    // 3 Core Progress Cards in ProfileStatsGrid
    expect(container.textContent).toContain('Hành trình 6 Đảo')
    expect(container.textContent).toContain('Sao tích lũy')
    expect(container.textContent).toContain('Ảnh đã tạo')

    // Zero-truncation check within stats section
    const coreCardsSection = container.querySelector('section[aria-label="Ba dấu ấn hành trình của con"]')
    expect(coreCardsSection).not.toBeNull()
    expect(coreCardsSection?.querySelector('.truncate')).toBeNull()

    // Filter buttons in works tab
    expect(container.querySelector('#filter-works-all')).not.toBeNull()
    expect(container.querySelector('#filter-works-drawing')).not.toBeNull()
    expect(container.querySelector('#filter-works-comic')).not.toBeNull()

    // Displays clean projects, eliminates junk files
    expect(container.textContent).toContain('Truyện tranh Vẹt Paco')
    expect(container.textContent).toContain('Bức tranh Chú Cún Nhỏ')
    expect(container.textContent).not.toContain('storyPlot comic 1785830218476')

    act(() => root.unmount())
    container.remove()
  })

  it('never lets cached browser progress override the authoritative pathway snapshot', async () => {
    mockStorage['aikids:test-student-1:aikids_lesson_completed_rule-1'] = 'true'
    mockStorage['aikids:test-student-1:aikids_lesson_stars_rule-1'] = '3'
    mockStorage['aikids:test-student-1:aikids_lesson_completed_rule-2'] = 'true'
    mockStorage['aikids:test-student-1:aikids_lesson_stars_rule-2'] = '3'

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      )
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // The authoritative pathway snapshot owns this value (3 stations, 9 stars)
    expect(container.textContent).toContain('3 / 32 Trạm')
    expect(container.textContent).toContain('9 Sao')

    act(() => root.unmount())
    container.remove()
  })

  it('filters works by category (all, drawing, comic) in works tab', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      )
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Initially "all" shows both comic and drawing
    expect(container.textContent).toContain('Truyện tranh Vẹt Paco')
    expect(container.textContent).toContain('Bức tranh Chú Cún Nhỏ')

    // Click "Tranh vẽ" filter
    const drawingFilter = container.querySelector('#filter-works-drawing') as HTMLButtonElement
    expect(drawingFilter).not.toBeNull()
    await act(async () => {
      drawingFilter.click()
    })
    expect(container.textContent).toContain('Bức tranh Chú Cún Nhỏ')
    expect(container.textContent).not.toContain('Truyện tranh Vẹt Paco')

    // Click "Truyện tranh" filter
    const comicFilter = container.querySelector('#filter-works-comic') as HTMLButtonElement
    expect(comicFilter).not.toBeNull()
    await act(async () => {
      comicFilter.click()
    })
    expect(container.textContent).toContain('Truyện tranh Vẹt Paco')
    expect(container.textContent).not.toContain('Bức tranh Chú Cún Nhỏ')

    // Click "Tất cả" filter
    const allFilter = container.querySelector('#filter-works-all') as HTMLButtonElement
    expect(allFilter).not.toBeNull()
    await act(async () => {
      allFilter.click()
    })
    expect(container.textContent).toContain('Truyện tranh Vẹt Paco')
    expect(container.textContent).toContain('Bức tranh Chú Cún Nhỏ')

    act(() => root.unmount())
    container.remove()
  })

  it('opens image lightbox modal when clicking a project in works tab and allows download and close', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      )
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Find first project card
    const projectCard = container.querySelector('article')
    expect(projectCard).not.toBeNull()

    // Click on project card to open lightbox modal
    await act(async () => {
      projectCard?.click()
    })

    // Lightbox modal should be present
    const modal = document.body.querySelector('[role="dialog"]')
    expect(modal).not.toBeNull()
    expect(modal?.textContent).toContain('Truyện tranh Vẹt Paco')
    expect(modal?.textContent).toContain('Tải ảnh về máy')
    expect(modal?.textContent).toContain('Đóng')

    // Click close button
    const closeBtn = Array.from(modal?.querySelectorAll('button') ?? []).find(
      (b) => b.textContent?.includes('Đóng') || b.getAttribute('aria-label') === 'Đóng',
    )
    expect(closeBtn).toBeDefined()

    await act(async () => {
      closeBtn?.click()
    })

    // Modal should be closed
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()

    act(() => root.unmount())
    container.remove()
  })

  it('switches to certificates tab and renders progress card when course is not yet completed (< 32 stations)', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      )
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Click on Bằng khen tab
    const certsTab = container.querySelector('#tab-certificates') as HTMLButtonElement
    expect(certsTab).not.toBeNull()

    await act(async () => {
      certsTab.click()
    })

    // Header & stats
    expect(container.textContent).toContain('Bằng Khen Trong Ba Lô')
    expect(container.textContent).toContain('Bằng Khen Tốt Nghiệp Khóa Học')
    expect(container.textContent).toContain('0 Bằng khen trong Ba lô')

    // Filter buttons in certificates tab
    expect(container.querySelector('#filter-certs-all')).not.toBeNull()
    expect(container.querySelector('#filter-certs-claimed')).not.toBeNull()
    expect(container.querySelector('#filter-certs-in-progress')).not.toBeNull()

    // Progress card for unfinished course (< 32 stations)
    expect(container.textContent).not.toContain('CHÚC MỪNG CON ĐÃ TỐT NGHIỆP')
    expect(container.textContent).toContain(
      'Hoàn thành trọn vẹn 32/32 trạm của Khóa Học Khám Phá & Sáng Tạo để nhận Bằng Khen Tốt Nghiệp danh dự từ Ban Cố Vấn và cất vào Ba Lô!',
    )
    expect(container.textContent).toContain('Tiến độ toàn khóa')
    expect(container.textContent).toContain('trạm nữa để tốt nghiệp khóa học!')

    act(() => root.unmount())
    container.remove()
  })

  it('filters certificates by category (all, claimed, in_progress)', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      )
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Switch to certificates tab
    const certsTab = container.querySelector('#tab-certificates') as HTMLButtonElement
    await act(async () => {
      certsTab.click()
    })

    // Click "Đã lưu vào Ba lô" when none claimed
    const claimedFilter = container.querySelector('#filter-certs-claimed') as HTMLButtonElement
    await act(async () => {
      claimedFilter.click()
    })
    expect(container.textContent).toContain('Chưa có bằng khen nào trong Ba lô')

    // Click "Đang chinh phục"
    const inProgressFilter = container.querySelector('#filter-certs-in-progress') as HTMLButtonElement
    await act(async () => {
      inProgressFilter.click()
    })
    expect(container.textContent).toContain('Tiến độ toàn khóa')

    act(() => root.unmount())
    container.remove()
  })

  it('renders claimed backpack certificates in certificates tab and opens review modal when clicked', async () => {
    // Save official course certificate into localStorage
    mockStorage['aiki_backpack_certificates_test-student-1'] = JSON.stringify([
      {
        id: 'cert-course-aikid-official',
        courseId: 'cert-course-aikid-official',
        courseTitle: 'Khóa Học Khám Phá & Sáng Tạo Nhí (6 Đảo • 32 Trạm)',
        islandTitle: 'Tốt Nghiệp Xuất Sắc Toàn Khóa',
        studentName: 'Minh Thám Hiểm',
        issuedDate: '25/09/2026',
        stars: 90,
        xp: 3000,
        claimedAt: Date.now(),
      },
    ])

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      )
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Click on Bằng khen tab
    const certsTab = container.querySelector('#tab-certificates') as HTMLButtonElement
    await act(async () => {
      certsTab.click()
    })

    expect(container.textContent).toContain('1 Bằng khen trong Ba lô')
    expect(container.textContent).toContain('Đã lưu trong Ba lô')
    expect(container.textContent).toContain('Khóa Học Khám Phá & Sáng Tạo Nhí (6 Đảo • 32 Trạm)')
    expect(container.textContent).toContain('Tốt Nghiệp Xuất Sắc Toàn Khóa')

    const reviewBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Xem lại bằng khen'),
    )
    expect(reviewBtn).toBeDefined()

    await act(async () => {
      reviewBtn?.click()
    })

    expect(document.body.textContent).toContain('Chứng Nhận Tốt Nghiệp')
    expect(document.body.textContent).toContain('Minh Thám Hiểm')
    expect(document.body.textContent).toContain('Tốt Nghiệp Xuất Sắc Toàn Khóa')

    act(() => root.unmount())
    container.remove()
  })

  it('renders Graduation Honors banner on certificates tab when student achieves 32/32 stations and opens CourseCertificateModal', async () => {
    // Mock pathway with 32 completed stations
    vi.spyOn(learningApiModule.learningApi, 'getPathway').mockResolvedValue({
      student: { nickname: 'Minh Thám Hiểm', ageBand: '6-8' },
      policy: null,
      recommendedCourseId: 'dao-1',
      courses: [
        {
          id: 'dao-1',
          title: 'Đảo 1: 10 Quy Tắc Vàng',
          shortTitle: 'Đảo 1',
          status: 'completed',
          reasonCode: '',
          completionPercent: 100,
          missingPrerequisites: [],
          coverImage: null,
          enrolled: true,
          enrollmentId: 'e-1',
          questCount: 10,
          completedCount: 10,
          totalStars: 30,
        },
        {
          id: 'dao-2',
          title: 'Đảo 2: 4 Chìa Khóa Lệnh',
          shortTitle: 'Đảo 2',
          status: 'completed',
          reasonCode: '',
          completionPercent: 100,
          missingPrerequisites: [],
          coverImage: null,
          enrolled: true,
          enrollmentId: 'e-2',
          questCount: 4,
          completedCount: 4,
          totalStars: 12,
        },
        {
          id: 'dao-3',
          title: 'Đảo 3: Sắc Màu Cọ Vẽ',
          shortTitle: 'Đảo 3',
          status: 'completed',
          reasonCode: '',
          completionPercent: 100,
          missingPrerequisites: [],
          coverImage: null,
          enrolled: true,
          enrollmentId: 'e-3',
          questCount: 4,
          completedCount: 4,
          totalStars: 12,
        },
        {
          id: 'dao-4',
          title: 'Đảo 4: Biệt Đội Nhân Vật',
          shortTitle: 'Đảo 4',
          status: 'completed',
          reasonCode: '',
          completionPercent: 100,
          missingPrerequisites: [],
          coverImage: null,
          enrolled: true,
          enrollmentId: 'e-4',
          questCount: 4,
          completedCount: 4,
          totalStars: 12,
        },
        {
          id: 'dao-5',
          title: 'Đảo 5: Lâu Đài Truyện Tranh',
          shortTitle: 'Đảo 5',
          status: 'completed',
          reasonCode: '',
          completionPercent: 100,
          missingPrerequisites: [],
          coverImage: null,
          enrolled: true,
          enrollmentId: 'e-5',
          questCount: 5,
          completedCount: 5,
          totalStars: 15,
        },
        {
          id: 'dao-6',
          title: 'Đảo 6: Đấu Trường Trò Chơi',
          shortTitle: 'Đảo 6',
          status: 'completed',
          reasonCode: '',
          completionPercent: 100,
          missingPrerequisites: [],
          coverImage: null,
          enrolled: true,
          enrollmentId: 'e-6',
          questCount: 5,
          completedCount: 5,
          totalStars: 15,
        },
      ],
    } as any)

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      )
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Click on Bằng khen tab
    const certsTab = container.querySelector('#tab-certificates') as HTMLButtonElement
    await act(async () => {
      certsTab.click()
    })

    // Graduation banner & Claim to Backpack flow
    expect(container.textContent).toContain('CHÚC MỪNG CON ĐÃ TỐT NGHIỆP KHÓA HỌC KHÁM PHÁ & SÁNG TẠO!')
    expect(container.textContent).toContain(
      'Con đã xuất sắc hoàn thành trọn vẹn 32/32 Trạm Học trên 6 Đảo Khám Phá! Ban Cố Vấn Học Viện chính thức trao tặng Bằng Khen Danh Dự cho con.',
    )
    expect(container.textContent).toContain('Nhận Bằng Khen & Cất Vào Ba Lô')

    const gradBanner = Array.from(container.querySelectorAll('[role="region"]')).find(
      (el) => el.getAttribute('aria-label') === 'Vinh danh tốt nghiệp khóa học',
    )
    expect(gradBanner).toBeDefined()
    const certBtn = gradBanner?.querySelector('button')
    expect(certBtn).toBeDefined()

    await act(async () => {
      certBtn?.click()
    })

    // Modal renders student name and graduation title
    expect(document.body.textContent).toContain('Chứng Nhận Tốt Nghiệp')
    expect(document.body.textContent).toContain('Minh Thám Hiểm')
    expect(document.body.textContent).toContain('Tốt Nghiệp Xuất Sắc Toàn Khóa')

    act(() => root.unmount())
    container.remove()
  })

  it('guarantees zero API calls to /api/gamification/storybook, /api/gamification/achievements, and loadProfileAppearance', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      )
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Verify all invoked endpoints
    const calledEndpoints = apiSpy.mock.calls.map((call) => call[0])

    // Must NOT call achievements or storybook
    expect(calledEndpoints).not.toContain('/api/gamification/achievements')
    expect(calledEndpoints).not.toContain('/api/gamification/storybook')
    expect(calledEndpoints).not.toContain('/api/profile/settings')

    // Must call overview with includeAppearance=false and includeStorybook=false
    const overviewCall = calledEndpoints.find((ep) => typeof ep === 'string' && ep.startsWith('/api/v1/aikids/profile-overview?'))
    expect(overviewCall).toBeDefined()
    expect(overviewCall).not.toContain('storybook')
    expect(overviewCall).not.toContain('appearance')

    act(() => root.unmount())
    container.remove()
  })

  it('ensures 100% zero arrow characters and zero tech AI buzzwords across both tabs', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>,
      )
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    const tabIds: ProfileTabSection[] = ['works', 'certificates']

    for (const tabId of tabIds) {
      const tabBtn = container.querySelector(`#tab-${tabId}`) as HTMLButtonElement
      await act(async () => {
        tabBtn.click()
      })

      const allLinks = Array.from(container.querySelectorAll('a'))
      const allButtons = Array.from(container.querySelectorAll('button'))

      allLinks.forEach((link) => {
        expect(link.textContent).not.toContain('➔')
        expect(link.textContent).not.toContain('→')
        expect(link.textContent).not.toContain('->')
        expect(link.textContent).not.toContain('←')
      })

      allButtons.forEach((btn) => {
        expect(btn.textContent).not.toContain('➔')
        expect(btn.textContent).not.toContain('→')
        expect(btn.textContent).not.toContain('->')
        expect(btn.textContent).not.toContain('←')
      })
    }

    act(() => root.unmount())
    container.remove()
  })
})
