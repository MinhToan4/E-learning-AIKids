// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router'
import { RouteGuard } from './RouteGuard'
import { useAuth } from '@/shared/store/auth'

describe('RouteGuard Navigation & Error Escape Protocol', () => {
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

  it('redirects to /login when user is not logged in and there is no error', async () => {
    await act(async () => {
      root?.render(
        <MemoryRouter initialEntries={['/home']}>
          <Routes>
            <Route
              path="/home"
              element={
                <RouteGuard roles={['student']}>
                  <div>Protected Home Content</div>
                </RouteGuard>
              }
            />
            <Route path="/login" element={<div>Login Page Target</div>} />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Login Page Target')
    expect(container.textContent).not.toContain('Protected Home Content')
  })

  it('redirects to /login when session is expired (401 / hết hạn) instead of trapping in blank screen', async () => {
    useAuth.setState({
      user: null,
      loading: false,
      error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    })

    await act(async () => {
      root?.render(
        <MemoryRouter initialEntries={['/home']}>
          <Routes>
            <Route
              path="/home"
              element={
                <RouteGuard roles={['student']}>
                  <div>Protected Home Content</div>
                </RouteGuard>
              }
            />
            <Route path="/login" element={<div>Login Page Target</div>} />
          </Routes>
        </MemoryRouter>,
      )
    })

    // Must cleanly navigate to /login and NOT trap the user on an unescapable error screen
    expect(container.textContent).toContain('Login Page Target')
    expect(container.textContent).not.toContain('Chưa kết nối được phiên học')
  })

  it('renders a friendly Hallmark UI card with all 3 escape routes on network connection errors', async () => {
    useAuth.setState({
      user: null,
      loading: false,
      error: 'Mất kết nối mạng (502 Bad Gateway). Máy chủ đang khởi động lại.',
    })

    await act(async () => {
      root?.render(
        <MemoryRouter initialEntries={['/home']}>
          <Routes>
            <Route
              path="/home"
              element={
                <RouteGuard roles={['student']}>
                  <div>Protected Home Content</div>
                </RouteGuard>
              }
            />
            <Route path="/login" element={<div>Login Page Target</div>} />
            <Route path="/" element={<div>Welcome Page Target</div>} />
          </Routes>
        </MemoryRouter>,
      )
    })

    expect(container.textContent).toContain('Chưa kết nối được phiên học')
    expect(container.textContent).toContain(
      'Mất kết nối mạng (502 Bad Gateway). Máy chủ đang khởi động lại.',
    )

    // Verifies all 3 escape routes are present
    const retryBtn = container.querySelector('button')
    expect(retryBtn?.textContent).toContain('Thử kết nối lại')

    const links = Array.from(container.querySelectorAll('a'))
    const loginLink = links.find((l) => l.getAttribute('href') === '/login')
    const homeLink = links.find((l) => l.getAttribute('href') === '/')

    expect(loginLink).toBeDefined()
    expect(loginLink?.textContent).toContain('Đăng nhập lại')

    expect(homeLink).toBeDefined()
    expect(homeLink?.textContent).toContain('Về trang giới thiệu')
  })
})
