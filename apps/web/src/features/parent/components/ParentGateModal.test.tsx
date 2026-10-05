// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { ParentGateModal } from './ParentGateModal'
import { api, ApiError } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'

vi.mock('@/shared/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/lib/api')>()
  return {
    ...actual,
    api: vi.fn(),
    setAccessToken: vi.fn(),
  }
})

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

  it('renders in PIN mode by default with 4 PIN slots and Soft-Clay numpad', async () => {
    await act(async () => {
      root?.render(<ParentGateModal open={true} onClose={() => {}} />)
    })

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.textContent).toContain('Ba / Mẹ ơi!')
    expect(dialog?.textContent).toContain('Nhập mã PIN Ba / Mẹ gồm 4 chữ số')
    expect(dialog?.textContent).toContain('Hoặc dùng mật khẩu tài khoản')
    expect(dialog?.textContent).toContain('Quên mã PIN?')
    expect(dialog?.textContent).toContain('Đăng xuất khỏi thiết bị này')

    // On-screen numpad contains buttons for 0-9
    const buttons = dialog?.querySelectorAll('button')
    const buttonTexts = Array.from(buttons ?? []).map((b) => b.textContent?.trim())
    for (let i = 0; i <= 9; i++) {
      expect(buttonTexts).toContain(String(i))
    }
  })

  it('automatically verifies PIN when 4 digits are entered', async () => {
    const mockApi = vi.mocked(api)
    mockApi.mockResolvedValueOnce({
      status: 'success',
      user: { id: 'parent-1', role: 'parent', email: 'parent@aikid.vn' },
      token: 'jwt-parent-token',
    })

    // Mock window.location.replace
    const replaceMock = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { replace: replaceMock },
      writable: true,
    })

    await act(async () => {
      root?.render(<ParentGateModal open={true} onClose={() => {}} />)
    })

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()

    const getBtn = (text: string) => {
      const allButtons = Array.from(dialog?.querySelectorAll('button') ?? [])
      return allButtons.find((b) => b.textContent?.trim() === text)
    }

    // Click 1, 2, 3, 4 sequentially
    await act(async () => {
      getBtn('1')?.click()
    })
    await act(async () => {
      getBtn('2')?.click()
    })
    await act(async () => {
      getBtn('3')?.click()
    })
    await act(async () => {
      getBtn('4')?.click()
    })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 60))
    })

    expect(mockApi).toHaveBeenCalledWith('/api/parent/gate/verify', {
      method: 'POST',
      body: JSON.stringify({ pin: '1234' }),
    })
  })

  it('displays friendly error when PIN is incorrect (INVALID_PARENT_PIN)', async () => {
    const mockApi = vi.mocked(api)
    const err = new ApiError(401, 'Mã PIN chưa đúng, thử lại nhé!', { code: 'INVALID_PARENT_PIN' })
    mockApi.mockRejectedValueOnce(err)

    await act(async () => {
      root?.render(<ParentGateModal open={true} onClose={() => {}} />)
    })

    const dialog = document.querySelector('[role="dialog"]')
    const getBtn = (text: string) => {
      const allButtons = Array.from(dialog?.querySelectorAll('button') ?? [])
      return allButtons.find((b) => b.textContent?.trim() === text)
    }

    await act(async () => {
      getBtn('9')?.click()
    })
    await act(async () => {
      getBtn('9')?.click()
    })
    await act(async () => {
      getBtn('9')?.click()
    })
    await act(async () => {
      getBtn('9')?.click()
    })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 60))
    })

    expect(dialog?.textContent).toContain('Mã PIN chưa đúng, thử lại nhé!')
  })

  it('switches to password mode and verifies parent password', async () => {
    const mockApi = vi.mocked(api)
    mockApi.mockResolvedValueOnce({
      status: 'success',
      user: { id: 'parent-1', role: 'parent' },
    })

    await act(async () => {
      root?.render(<ParentGateModal open={true} onClose={() => {}} />)
    })

    const dialog = document.querySelector('[role="dialog"]')
    const switchBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.includes('Hoặc dùng mật khẩu tài khoản'),
    )

    await act(async () => {
      switchBtn?.click()
    })

    expect(dialog?.textContent).toContain('Nhập mật khẩu đăng nhập của Ba / Mẹ')
    expect(dialog?.textContent).toContain('Mật khẩu tài khoản Ba / Mẹ')

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

  it('switches to recovery mode on "Quên mã PIN?" click', async () => {
    await act(async () => {
      root?.render(<ParentGateModal open={true} onClose={() => {}} />)
    })

    const dialog = document.querySelector('[role="dialog"]')
    const forgotBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.includes('Quên mã PIN?'),
    )

    await act(async () => {
      forgotBtn?.click()
    })

    expect(dialog?.textContent).toContain('Khôi phục quyền truy cập Ba / Mẹ')
    expect(dialog?.textContent).toContain('Mở khóa nhanh bằng Google')
    expect(dialog?.textContent).toContain('Nhập mật khẩu tài khoản Ba / Mẹ')
    expect(dialog?.textContent).toContain('Quay lại nhập mã PIN Ba / Mẹ')
  })
})
