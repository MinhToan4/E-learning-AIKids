// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import { WelcomePage } from './WelcomePage'
import { useAuth } from '@/shared/store/auth'
import type { User } from '@/shared/lib/api'

describe('WelcomePage Shortcut Protocol', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | null = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()
    useAuth.setState({
      user: null,
      loading: false,
      error: null,
      activeContext: null,
    })
  })

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount()
      })
      root = null
    }
    if (container && container.parentNode) {
      document.body.removeChild(container)
    }
  })

  it('renders "Bắt đầu ngay" linking to /login for guest visitors', async () => {
    await act(async () => {
      root?.render(
        <MemoryRouter initialEntries={['/']}>
          <WelcomePage />
        </MemoryRouter>,
      )
    })

    const links = Array.from(container.querySelectorAll('a'))
    const startLink = links.find((l) => l.textContent?.includes('Bắt đầu ngay'))
    expect(startLink).toBeDefined()
    expect(startLink?.getAttribute('href')).toBe('/login')
  })

  it('renders "Vào lớp học của [Bé]" linking to /home for active students', async () => {
    const studentUser: User = {
      id: 'student-bo',
      role: 'student',
      email: null,
      name: 'Bo Bo',
      nickname: 'Bo Bo',
      avatarId: null,
      level: 5,
      xp: 1200,
      onboarded: true,
      goal: null,
      parentId: 'parent-123',
      classId: null,
    }

    useAuth.setState({
      user: studentUser,
      loading: false,
      error: null,
    })

    await act(async () => {
      root?.render(
        <MemoryRouter initialEntries={['/']}>
          <WelcomePage />
        </MemoryRouter>,
      )
    })

    const links = Array.from(container.querySelectorAll('a'))
    const studentHomeLink = links.find((l) => l.textContent?.includes('Vào lớp học của Bo Bo'))
    expect(studentHomeLink).toBeDefined()
    expect(studentHomeLink?.getAttribute('href')).toBe('/home')
  })
})
