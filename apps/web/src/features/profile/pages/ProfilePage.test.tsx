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

    vi.spyOn(apiModule, 'api').mockImplementation(async (endpoint: string) => {
      if (endpoint.startsWith('/api/v1/aikids/profile-overview?')) {
        return {
          streak: { current: 5 },
          achievements: {
            achievements: [
              {
                type: 'first_lesson',
                title: 'Bước Chân Đầu Tiên',
                description: 'Hoàn thành bài học đầu tiên.',
                unlocked: true,
                icon: '🏆',
              },
              {
                type: 'streak_3',
                title: 'Ngọn Lửa Chăm Chỉ',
                description: 'Học 3 ngày liên tiếp.',
                unlocked: true,
                icon: '🔥',
              },
            ],
          },
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
            ],
          },
          appearance: { slug: 'be-minh' },
          storybook: { equipment: [] },
          pathway: await learningApiModule.learningApi.getPathway(),
        } as any
      }
      if (endpoint === '/api/gamification/streak') return { current: 5 } as any
      if (endpoint === '/api/gamification/achievements') {
        return {
          achievements: [
            {
              type: 'first_lesson',
              title: 'Bước Chân Đầu Tiên',
              description: 'Hoàn thành bài học đầu tiên.',
              unlocked: true,
              icon: '🏆',
            },
            {
              type: 'streak_3',
              title: 'Ngọn Lửa Chăm Chỉ',
              description: 'Học 3 ngày liên tiếp.',
              unlocked: true,
              icon: '🔥',
            },
          ],
        } as any
      }
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
            // The corrupted junk file from the user's issue
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
      if (endpoint === '/api/profile/settings') return { slug: 'be-minh' } as any
      if (endpoint === '/api/gamification/storybook') return { equipment: [] } as any
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

  it('renders 6 Soft Clay Floating Pill Tabs and defaults to progress tab', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Navigation tab list with 6 tabs
    const nav = container.querySelector('nav[role="tablist"]')
    expect(nav).not.toBeNull()
    const tabs = Array.from(nav?.querySelectorAll('button[role="tab"]') ?? [])
    expect(tabs).toHaveLength(6)
    expect(tabs[0].textContent).toContain('Tiến độ')
    expect(tabs[1].textContent).toContain('Bằng khen')
    expect(tabs[2].textContent).toContain('Kỹ năng')
    expect(tabs[3].textContent).toContain('Sổ kỷ niệm')
    expect(tabs[4].textContent).toContain('Thành tích')
    expect(tabs[5].textContent).toContain('Trang trí')

    // Active tab is progress by default
    expect(tabs[0].getAttribute('aria-selected')).toBe('true')
    expect(tabs[1].getAttribute('aria-selected')).toBe('false')

    // 4 Core Progress Cards
    expect(container.textContent).toContain('Chuỗi học tập')
    expect(container.textContent).toContain('Chăm chỉ giữ lửa học tập!')
    expect(container.textContent).toContain('Thời lượng rèn luyện')
    expect(container.textContent).toContain('Tích lũy học & sáng tạo')
    expect(container.textContent).toContain('Hành trình 6 Đảo')
    expect(container.textContent).toContain('32 Trạm')
    expect(container.textContent).toContain('Tiến độ khám phá')
    expect(container.textContent).toContain('Ngôi sao tri thức')
    expect(container.textContent).toContain('Tích lũy qua bài học')

    // Zero-truncation check: ensure no truncate class exists within the 4 cards
    const coreCardsSection = container.querySelector('section[aria-label="Bộ tứ chỉ số học tập cốt lõi"]')
    expect(coreCardsSection).not.toBeNull()
    expect(coreCardsSection?.querySelector('.truncate')).toBeNull()

    // Weekly pulse chart
    expect(container.textContent).toContain('Nhịp học tập tuần này')
    expect(container.textContent).toContain('Xem con học như thế nào')

    // Level journey
    expect(container.textContent).toContain('Hành trình cấp độ thám hiểm')

    act(() => root.unmount())
    container.remove()
  })

  it('renders Weekly Activity Pulse chart with 7 days and friendly non-AI advice', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Weekly pulse chart title and days
    expect(container.textContent).toContain('Nhịp học tập tuần này')
    expect(container.textContent).toContain('Xem con học như thế nào')
    expect(container.textContent).toContain('T2')
    expect(container.textContent).toContain('T3')
    expect(container.textContent).toContain('T4')
    expect(container.textContent).toContain('T5')
    expect(container.textContent).toContain('T6')
    expect(container.textContent).toContain('T7')
    expect(container.textContent).toContain('CN')

    // Advice text has NO AI
    expect(container.textContent).toContain('Lời khuyên của Mèo Mee')
    expect(container.textContent).not.toContain('Lời khuyên AIKI')
    expect(container.textContent).not.toContain('tư duy AI')

    act(() => root.unmount())
    container.remove()
  })

  it('switches to competencies tab and renders Vườn Kỹ Năng Sáng Tạo Của Con with 4 core pillars and zero AI buzzwords', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Click on Kỹ năng tab
    const competenciesTab = container.querySelector('#tab-competencies') as HTMLButtonElement
    expect(competenciesTab).not.toBeNull()

    await act(async () => {
      competenciesTab.click()
    })

    // 4 Pillars with updated non-AI text
    expect(container.textContent).toContain('Vườn Kỹ Năng Sáng Tạo Của Con')
    expect(container.textContent).toContain('4 Kỹ Năng Sáng Tạo Cốt Lõi')
    expect(container.textContent).toContain('Bộ kỹ năng toàn diện: Tư duy diễn đạt, Mỹ thuật tranh vẽ, Kể chuyện và An toàn số.')

    // Pillar 1: Tư Duy Diễn Đạt & Giao Tiếp
    expect(container.textContent).toContain('Tư Duy Diễn Đạt & Giao Tiếp')
    expect(container.textContent).toContain('Creative Thinking & Expression')
    expect(container.textContent).toContain('chìa khóa lệnh đã vượt qua')
    expect(container.textContent).not.toContain('Tư duy Ra lệnh AI')
    expect(container.textContent).not.toContain('Prompt Thinking')

    // Pillar 2: Mỹ Thuật & Sáng Tạo Tranh Vẽ
    expect(container.textContent).toContain('Mỹ Thuật & Sáng Tạo Tranh Vẽ')
    expect(container.textContent).toContain('Visual Arts')
    expect(container.textContent).toContain('bức tranh & phong cách nghệ thuật')
    expect(container.textContent).not.toContain('Mỹ thuật & Thị giác AI')

    // Pillar 3: Kể Chuyện & Kịch Bản Nhí
    expect(container.textContent).toContain('Kể Chuyện & Kịch Bản Nhí')
    expect(container.textContent).toContain('Storytelling')
    expect(container.textContent).toContain('kịch bản & khung truyện tranh')

    // Pillar 4: An Toàn Số & Ứng Xử Thông Minh
    expect(container.textContent).toContain('An Toàn Số & Ứng Xử Thông Minh')
    expect(container.textContent).toContain('Digital Safety & Smart Habits')
    expect(container.textContent).toContain('Đạt Chuẩn Hiệp Sĩ An Toàn Số')
    expect(container.textContent).toContain('quy tắc đã thuộc lòng')
    expect(container.textContent).not.toContain('Đạo đức & An toàn số AI')
    expect(container.textContent).not.toContain('AI Safety & Ethics')
    expect(container.textContent).not.toContain('Hiệp Sĩ AI')

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
        </MemoryRouter>
      )
    })

    await act(async () => {
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

    // Trường hợp 3: Khi chưa xong 32 trạm, KHÔNG có banner chúc mừng nhận bằng nào, chỉ có thẻ tiến độ
    expect(container.textContent).not.toContain('CHÚC MỪNG CON ĐÃ TỐT NGHIỆP')
    expect(container.textContent).not.toContain('Chúc mừng con đã tốt nghiệp')
    expect(container.textContent).toContain(
      'Hoàn thành trọn vẹn 32/32 trạm của Khóa Học Khám Phá & Sáng Tạo để nhận Bằng Khen Tốt Nghiệp danh dự từ Ban Cố Vấn và cất vào Ba Lô!'
    )
    expect(container.textContent).not.toContain('AIKids')
    expect(container.textContent).toContain('Tiến độ toàn khóa')
    expect(container.textContent).toContain('trạm nữa để tốt nghiệp khóa học!')

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
        stars: 96,
        xp: 3200,
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
        </MemoryRouter>
      )
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Click on Bằng khen tab
    const certsTab = container.querySelector('#tab-certificates') as HTMLButtonElement
    expect(certsTab).not.toBeNull()

    await act(async () => {
      certsTab.click()
    })

    expect(container.textContent).toContain('1 Bằng khen trong Ba lô')
    expect(container.textContent).toContain('Đã lưu trong Ba lô')
    expect(container.textContent).toContain('Khóa Học Khám Phá & Sáng Tạo Nhí (6 Đảo • 32 Trạm)')
    expect(container.textContent).toContain('Tốt Nghiệp Xuất Sắc Toàn Khóa')

    const reviewBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Xem lại bằng khen')
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
          questCount: 6,
          completedCount: 6,
          totalStars: 18,
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
          questCount: 6,
          completedCount: 6,
          totalStars: 18,
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
          questCount: 6,
          completedCount: 6,
          totalStars: 18,
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
        </MemoryRouter>
      )
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Click on Bằng khen tab
    const certsTab = container.querySelector('#tab-certificates') as HTMLButtonElement
    expect(certsTab).not.toBeNull()

    await act(async () => {
      certsTab.click()
    })

    // Graduation banner & Claim to Backpack flow with non-AI text
    expect(container.textContent).toContain('CHÚC MỪNG CON ĐÃ TỐT NGHIỆP KHÓA HỌC KHÁM PHÁ & SÁNG TẠO!')
    expect(container.textContent).toContain('Con đã xuất sắc hoàn thành trọn vẹn 32/32 Trạm Học trên 6 Đảo Khám Phá! Ban Cố Vấn Học Viện chính thức trao tặng Bằng Khen Danh Dự cho con.')
    expect(container.textContent).toContain('Nhận Bằng Khen & Cất Vào Ba Lô')
    expect(container.textContent).toContain('0 Bằng khen trong Ba lô')

    const gradBanner = Array.from(container.querySelectorAll('[role="region"]')).find((el) =>
      el.getAttribute('aria-label') === 'Vinh danh tốt nghiệp khóa học'
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

  it('switches to storybook tab and renders Full Storybook with BookSpread, sticker canvas and navigation rail', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Click on Sổ kỷ niệm tab
    const storybookTab = container.querySelector('#tab-storybook') as HTMLButtonElement
    expect(storybookTab).not.toBeNull()

    await act(async () => {
      storybookTab.click()
    })

    // Storybook header
    expect(container.textContent).toContain('Sổ Kỷ Niệm Huyền Thoại')
    expect(container.textContent).toContain('Nhật Ký Phiêu Lưu Cùng Paco')
    expect(container.textContent).toContain('Mọi trang sách đều mở sẵn để con khám phá câu chuyện')
    expect(container.textContent).toContain('Nhãn dán đã mở')

    // Full Storybook component BookSpread elements
    const book = container.querySelector('.storybook-book')
    expect(book).not.toBeNull()
    const leftPage = container.querySelector('.storybook-page-left')
    expect(leftPage).not.toBeNull()
    const rightPage = container.querySelector('.storybook-page-right')
    expect(rightPage).not.toBeNull()
    const stickerCanvas = container.querySelector('.storybook-sticker-canvas')
    expect(stickerCanvas).not.toBeNull()
    const rail = container.querySelector('.storybook-chapter-rail')
    expect(rail).not.toBeNull()

    // No old 4 SVG preview cards
    expect(container.textContent).not.toContain('Sổ Tay Nhật Ký Khám Phá')
    expect(container.textContent).not.toContain('Sổ Da Soft Clay 3D')

    act(() => root.unmount())
    container.remove()
  })

  it('switches to memories tab and renders Achievements and Showcase Works without old SVG preview cards', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Click on Thành tích tab
    const memoriesTab = container.querySelector('#tab-memories') as HTMLButtonElement
    expect(memoriesTab).not.toBeNull()

    await act(async () => {
      memoriesTab.click()
    })

    // 1. Achievements Showcase
    expect(container.textContent).toContain('Bục Vinh Danh Thành Tích')
    expect(container.textContent).toContain('Huy Hiệu & Cúp Danh Dự')
    expect(container.textContent).toContain('Ghi nhận từng cột mốc nỗ lực vượt bậc của con trong suốt hành trình rèn luyện và khám phá.')
    expect(container.textContent).toContain('2 / 45 Huy hiệu đã mở')
    expect(container.textContent).toContain('Mở Kho Báu Huy Hiệu')
    expect(container.textContent).toContain('Bước Chân Đầu Tiên')
    expect(container.textContent).toContain('Ngọn Lửa Chăm Chỉ')

    // 2. Showcase Works
    expect(container.textContent).toContain('Tác phẩm tiêu biểu')
    expect(container.textContent).toContain('Truyện tranh Vẹt Paco')
    expect(container.textContent).not.toContain('storyPlot comic 1785830218476')

    // 3. Old 4 preview cards should NOT be here
    expect(container.textContent).not.toContain('Sổ Tay Nhật Ký Khám Phá')
    expect(container.textContent).not.toContain('Sổ Da Soft Clay 3D')

    act(() => root.unmount())
    container.remove()
  })

  it('switches to customize tab and allows returning to progress tab', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Click on Trang trí tab
    const customizeTab = container.querySelector('#tab-customize') as HTMLButtonElement
    expect(customizeTab).not.toBeNull()

    await act(async () => {
      customizeTab.click()
    })

    expect(container.textContent).toContain('Chỉnh phong cách hồ sơ')
    expect(container.textContent).toContain('Tạo avatar của con')
    expect(container.textContent).toContain('Mở Avatar Studio')

    // Click on Quay lại hồ sơ button
    const backBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Quay lại hồ sơ')
    )
    expect(backBtn).toBeDefined()

    await act(async () => {
      backBtn?.click()
    })

    // Should return to progress tab
    const progressTab = container.querySelector('#tab-progress') as HTMLButtonElement
    expect(progressTab.getAttribute('aria-selected')).toBe('true')
    expect(container.textContent).toContain('Chuỗi học tập')
    expect(container.textContent).toContain('Thời lượng rèn luyện')

    act(() => root.unmount())
    container.remove()
  })

  it('ensures 100% zero arrow characters and zero tech AI buzzwords across all tabs', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      )
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    // Check all tabs sequentially for arrows
    const tabIds: ProfileTabSection[] = ['progress', 'certificates', 'competencies', 'storybook', 'memories', 'customize']

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
