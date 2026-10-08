// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { ParentGateModal } from './ParentGateModal'
import { api, ApiError } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { firebaseApp, signInWithFirebasePassword } from '@/shared/lib/firebase-client'

vi.mock('@/shared/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/lib/api')>()
  return {
    ...actual,
    api: vi.fn(),
    setAccessToken: vi.fn(),
  }
})

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: class {
    setCustomParameters() {}
  },
  signInWithPopup: vi.fn(async () => ({ user: { getIdToken: async () => 'google-id-token' } })),
}))

vi.mock('@/shared/lib/firebase-client', () => ({
  firebaseApp: vi.fn(),
  signInWithFirebasePassword: vi.fn(),
}))

describe('ParentGateModal', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | null = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()
    useAuth.setState({
      user: { id: 'u1', role: 'student', nickname: 'Bé' },
      loading: false,
      error: null,
      activeContext: null,
    })
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { replace: vi.fn() },
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

  it('renders password verification by default without a device/default PIN bypass', async () => {
    const mockApi = vi.mocked(api)
    mockApi.mockResolvedValueOnce({
      status: 'success',
      user: { id: 'parent-1', role: 'parent' },
    })

    await act(async () => {
      root?.render(<ParentGateModal open={true} onClose={() => {}} />)
    })

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog?.textContent).toContain('Nhập mật khẩu đăng nhập của Ba / Mẹ')
    expect(dialog?.textContent).toContain('Mật khẩu tài khoản Ba / Mẹ')
    expect(dialog?.textContent).not.toContain('0000')
    expect(dialog?.textContent).not.toContain('Dùng mã PIN')

    const pwInput = dialog?.querySelector('#parent-gate-pw') as HTMLInputElement
    expect(pwInput).not.toBeNull()

    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set
      nativeSetter?.call(pwInput, 'Secret123!')
      pwInput.dispatchEvent(new Event('input', { bubbles: true }))
      pwInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    const confirmBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.trim() === 'Xác nhận',
    )

    await act(async () => {
      confirmBtn?.click()
      await new Promise((r) => setTimeout(r, 20))
    })

    expect(mockApi).toHaveBeenCalledWith('/api/parent/gate/verify', {
      method: 'POST',
      body: JSON.stringify({ password: 'Secret123!' }),
    })
  })

  it('re-authenticates Firebase parents without calling the legacy password gate', async () => {
    const completeFirebaseSignIn = vi.fn().mockResolvedValue({
      id: 'parent-1',
      role: 'parent',
      email: 'parent@example.test',
    })
    useAuth.setState({
      user: {
        id: 'child-1',
        role: 'student',
        nickname: 'Bé',
        parentId: 'parent-1',
        parentEmail: 'parent@example.test',
      },
      completeFirebaseSignIn,
    })
    vi.mocked(signInWithFirebasePassword).mockResolvedValueOnce('firebase-id-token')

    await act(async () => {
      root?.render(<ParentGateModal open={true} onClose={() => {}} />)
    })
    const dialog = document.querySelector('[role="dialog"]')
    const input = dialog?.querySelector('#parent-gate-pw') as HTMLInputElement
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )?.set
      setter?.call(input, 'Secret123!')
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await act(async () => {
      Array.from(dialog?.querySelectorAll('button') ?? [])
        .find((button) => button.textContent?.trim() === 'Xác nhận')
        ?.click()
      await Promise.resolve()
    })

    expect(signInWithFirebasePassword).toHaveBeenCalledWith(
      'parent@example.test',
      'Secret123!',
    )
    expect(completeFirebaseSignIn).toHaveBeenCalledWith(
      'firebase-id-token',
      { role: 'parent' },
    )
    expect(api).not.toHaveBeenCalledWith('/api/parent/gate/verify', expect.anything())
  })

  it('switches to Google/password recovery mode', async () => {
    await act(async () => {
      root?.render(<ParentGateModal open={true} onClose={() => {}} />)
    })

    const dialog = document.querySelector('[role="dialog"]')
    const forgotBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.includes('Quên mật khẩu hoặc muốn dùng Google?'),
    )

    await act(async () => {
      forgotBtn?.click()
    })

    expect(dialog?.textContent).toContain('Khôi phục quyền truy cập Ba / Mẹ')
    expect(dialog?.textContent).toContain('Mở khóa nhanh bằng Google')
    expect(dialog?.textContent).toContain('Nhập mật khẩu tài khoản Ba / Mẹ')
    expect(dialog?.textContent).toContain('Quay lại nhập mật khẩu Ba / Mẹ')
  })

  it('never falls back to a general Google sign-in when the gate rejects the account', async () => {
    const completeFirebaseSignIn = vi.fn()
    useAuth.setState({ completeFirebaseSignIn } as any)
    vi.mocked(firebaseApp).mockResolvedValue({} as any)
    vi.mocked(api).mockRejectedValue(
      new ApiError(403, 'Tài khoản Google này không phải của ba / mẹ quản lý bé', {}),
    )

    await act(async () => {
      root?.render(<ParentGateModal open={true} onClose={() => {}} />)
    })
    const dialog = document.querySelector('[role="dialog"]')
    const forgotBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.includes('Quên mật khẩu hoặc muốn dùng Google?'),
    )
    await act(async () => {
      forgotBtn?.click()
    })
    const googleBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.includes('Mở khóa nhanh bằng Google'),
    )
    await act(async () => {
      googleBtn?.click()
    })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(api).toHaveBeenCalledWith(
      '/api/parent/gate/verify-google',
      expect.objectContaining({ body: JSON.stringify({ idToken: 'google-id-token' }) }),
    )
    expect(completeFirebaseSignIn).not.toHaveBeenCalled()
    expect(window.location.replace).not.toHaveBeenCalled()
    expect(dialog?.textContent).toContain('không phải của ba / mẹ')
  })
})
