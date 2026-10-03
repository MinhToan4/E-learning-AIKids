// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import { LoginPage } from './LoginPage'
import { useAuth } from '@/shared/store/auth'

describe('LoginPage', () => {
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

  it('does NOT automatically pop up error toast when sessionError is present in store on mount', async () => {
    useAuth.setState({
      user: null,
      loading: false,
      error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      activeContext: null,
    })

    await act(async () => {
      root?.render(
        <MemoryRouter initialEntries={['/login']}>
          <LoginPage />
        </MemoryRouter>,
      )
    })

    // Toasts container should be empty, no toast with the error message
    const toasts = container.querySelectorAll('[role="alert"], [class*="toast"]')
    expect(toasts.length).toBe(0)
    expect(container.textContent).not.toContain('Phiên đăng nhập đã hết hạn')
  })
})
