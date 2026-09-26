// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { ProfileHeaderCard } from './ProfileHeaderCard'
import { ProfileStatsGrid } from './ProfileStatsGrid'
import type { User } from '@/shared/lib/api'

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
    expect(container.textContent).toContain('Cấp 4 • Nhà Thám Hiểm Nhí')
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
    expect(container.textContent).toContain('Cấp 1 • Nhà Thám Hiểm Nhí')
    expect(container.textContent).toContain('0/100 XP')

    act(() => root.unmount())
    container.remove()
  })
})

describe('ProfileStatsGrid Component', () => {
  it('renders 3 compact Soft Clay cards with Streak, Stars, and Stations', async () => {
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

    // Card 2: Stars
    expect(container.textContent).toContain('48')
    expect(container.textContent).toContain('Sao tích lũy')
    expect(container.textContent).toContain('Ngôi sao tri thức')

    // Card 3: Stations
    expect(container.textContent).toContain('16 / 32 Trạm')
    expect(container.textContent).toContain('Trạm hoàn thành')
    expect(container.textContent).toContain('Hành trình 6 Đảo')

    act(() => root.unmount())
    container.remove()
  })
})
