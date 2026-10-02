// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { ProfileHeaderCard } from './ProfileHeaderCard'
import { ProfileStatsGrid } from './ProfileStatsGrid'
import type { User } from '@/shared/lib/api'
import * as apiModule from '@/shared/lib/api'

describe('ProfileHeaderCard Component', () => {
  const mockUser: User = {
    id: 'student-test-1',
    name: 'Bé Lan',
    email: 'lan@example.com',
    role: 'student',
    level: 4,
    xp: 350,
    avatarId: 'avatar-star',
    nickname: 'Lan Khám Phá',
  }

  it('renders student identity, level badge, and XP progress correctly without text overlap', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const onOpenAvatarPicker = vi.fn()

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfileHeaderCard
            user={mockUser}
            explorerLevel={4}
            explorerXp={350}
            xpIntoLevel={50}
            xpToNextLevel={100}
            onOpenAvatarPicker={onOpenAvatarPicker}
            profileSlug="lan-kham-pha"
          />
        </MemoryRouter>
      )
    })

    // Contains student name and level
    expect(container.textContent).toContain('Lan Khám Phá')
    expect(container.textContent).toContain('Hồ sơ của con')
    expect(container.textContent).toContain('Cấp 4')
    expect(container.textContent).toContain('Nhà Thám Hiểm Nhí')
    expect(container.textContent).toContain('50/100 XP')
    expect(container.textContent).toContain('Xem bản chia sẻ')

    // Avatar button triggers onOpenAvatarPicker
    const avatarButton = container.querySelector('button[aria-label="Đổi hình đại diện"]') as HTMLButtonElement
    expect(avatarButton).not.toBeNull()
    await act(async () => {
      avatarButton.click()
    })
    expect(onOpenAvatarPicker).toHaveBeenCalledTimes(1)

    act(() => root.unmount())
    container.remove()
  })

  it('handles null user gracefully and renders fallback', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfileHeaderCard
            user={null}
            explorerLevel={1}
            explorerXp={0}
            xpIntoLevel={0}
            xpToNextLevel={100}
            onOpenAvatarPicker={vi.fn()}
          />
        </MemoryRouter>
      )
    })

    expect(container.textContent).toContain('Nhà Thám Hiểm')
    expect(container.textContent).toContain('Cấp 1')
    expect(container.textContent).toContain('Nhà Thám Hiểm Nhí')
    expect(container.textContent).toContain('0/100 XP')

    act(() => root.unmount())
    container.remove()
  })

  it('uses backend catalog geometry for an uploaded square frame', async () => {
    vi.spyOn(apiModule, 'api').mockResolvedValue({
      items: [{
        code: 'frame-uploaded-square',
        assets: { imageUrl: '/assets/rewards/frames/frame-rainbow.webp' },
        displayConfig: { frameShape: 'square' },
      }],
    } as never)
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfileHeaderCard
            user={mockUser}
            explorerLevel={4}
            explorerXp={350}
            xpIntoLevel={50}
            xpToNextLevel={100}
            equipment={{ frame: 'frame-uploaded-square' }}
            onOpenAvatarPicker={vi.fn()}
          />
        </MemoryRouter>,
      )
      await Promise.resolve()
    })

    const frame = container.querySelector('[data-profile-frame-shape="square"]')
    expect(frame).not.toBeNull()
    expect(frame?.classList.contains('rounded-none')).toBe(true)
    expect(container.querySelector('[data-profile-avatar-layer]')?.classList.contains('z-20')).toBe(true)
    expect(container.querySelector('[data-profile-frame-artwork]')?.classList.contains('z-10')).toBe(true)

    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
  })

  it('does not layer an opaque catalog preview over a built-in CSS frame', async () => {
    vi.spyOn(apiModule, 'api').mockResolvedValue({
      items: [{ code: 'frame-galaxy', assets: { imageUrl: '/assets/rewards/frames/frame-galaxy.webp' } }],
    } as never)
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfileHeaderCard user={mockUser} explorerLevel={4} explorerXp={350} xpIntoLevel={50}
            xpToNextLevel={100} equipment={{ frame: 'frame-galaxy' }} onOpenAvatarPicker={vi.fn()} />
        </MemoryRouter>,
      )
      await Promise.resolve()
    })
    expect(container.querySelector('[data-profile-frame-artwork]')).toBeNull()
    expect(container.querySelector('[data-profile-frame-shape]')?.classList.contains('overflow-hidden')).toBe(true)
    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
  })

  it('renders the equipped title plaque artwork instead of plain title text', async () => {
    vi.spyOn(apiModule, 'api').mockResolvedValue({
      items: [{ code: 'title-curious-seeker', assets: { imageUrl: 'https://storage.storymee.com/content-media/title-curious.png' } }],
    } as never)
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => {
      root.render(
        <MemoryRouter>
          <ProfileHeaderCard user={mockUser} explorerLevel={4} explorerXp={350} xpIntoLevel={50}
            xpToNextLevel={100} equipment={{ title: 'title-curious-seeker' }} onOpenAvatarPicker={vi.fn()} />
        </MemoryRouter>,
      )
      await Promise.resolve()
    })
    const artwork = container.querySelector('[data-profile-title-artwork]') as HTMLImageElement | null
    expect(artwork?.src).toBe('https://storage.storymee.com/content-media/title-curious.png')
    expect(artwork?.alt).toBe('Người Tìm Tòi')
    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
  })
})

describe('ProfileStatsGrid Component', () => {
  it('renders 4 compact Soft Clay cards with Streak, Hours, Stations, and Stars', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ProfileStatsGrid
          streakDays={7}
          totalStars={48}
          completedStations={16}
        />
      )
    })

    // Card 1: Streak
    expect(container.textContent).toContain('7 ngày')
    expect(container.textContent).toContain('Chuỗi học tập')
    expect(container.textContent).toContain('Giữ chuỗi ngày học chăm chỉ')

    // Card 2: Hours
    expect(container.textContent).toContain('Thời lượng rèn luyện')
    expect(container.textContent).toContain('Tích lũy học & sáng tạo')

    // Card 3: Stations
    expect(container.textContent).toContain('16 / 30 Trạm')
    expect(container.textContent).toContain('Trạm hoàn thành')
    expect(container.textContent).toContain('Hành trình 6 Đảo')

    // Card 4: Stars
    expect(container.textContent).toContain('48')
    expect(container.textContent).toContain('Sao tích lũy')
    expect(container.textContent).toContain('Ngôi sao tri thức')

    act(() => root.unmount())
    container.remove()
  })
})
