// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { SetParentPinModal } from './SetParentPinModal'
import { api } from '@/shared/lib/api'

vi.mock('@/shared/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/lib/api')>()
  return {
    ...actual,
    api: vi.fn(),
  }
})

describe('SetParentPinModal', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot> | null = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()
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

  it('renders step 1 by default and advances to step 2 after entering 4 digits', async () => {
    await act(async () => {
      root?.render(<SetParentPinModal open={true} onClose={() => {}} />)
    })

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.textContent).toContain('Cài đặt mã PIN Ba / Mẹ')
    expect(dialog?.textContent).toContain('Bước 1/2')

    const getBtn = (text: string) => {
      const allButtons = Array.from(dialog?.querySelectorAll('button') ?? [])
      return allButtons.find((b) => b.textContent?.trim() === text)
    }

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

    // Advance to Step 2
    await act(async () => {
      await new Promise((r) => setTimeout(r, 250))
    })

    expect(dialog?.textContent).toContain('Bước 2/2')
    expect(dialog?.textContent).toContain('Xác nhận lại mã PIN')
  })

  it('submits pin to /api/parent/pin when step 2 matches step 1', async () => {
    const mockApi = vi.mocked(api)
    mockApi.mockResolvedValueOnce({
      message: 'Đã lưu mã PIN',
      hasParentPin: true,
    })

    const onSuccess = vi.fn()

    await act(async () => {
      root?.render(<SetParentPinModal open={true} onClose={() => {}} onSuccess={onSuccess} />)
    })

    const dialog = document.querySelector('[role="dialog"]')
    const getBtn = (text: string) => {
      const allButtons = Array.from(dialog?.querySelectorAll('button') ?? [])
      return allButtons.find((b) => b.textContent?.trim() === text)
    }

    // Step 1: 5 6 7 8
    await act(async () => {
      getBtn('5')?.click()
    })
    await act(async () => {
      getBtn('6')?.click()
    })
    await act(async () => {
      getBtn('7')?.click()
    })
    await act(async () => {
      getBtn('8')?.click()
    })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 250))
    })

    // Step 2: 5 6 7 8
    await act(async () => {
      getBtn('5')?.click()
    })
    await act(async () => {
      getBtn('6')?.click()
    })
    await act(async () => {
      getBtn('7')?.click()
    })
    await act(async () => {
      getBtn('8')?.click()
    })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100))
    })

    expect(mockApi).toHaveBeenCalledWith('/api/parent/pin', {
      method: 'POST',
      body: JSON.stringify({ pin: '5678' }),
    })
    expect(onSuccess).toHaveBeenCalled()
  })

  it('shows error if confirmation PIN does not match', async () => {
    await act(async () => {
      root?.render(<SetParentPinModal open={true} onClose={() => {}} />)
    })

    const dialog = document.querySelector('[role="dialog"]')
    const getBtn = (text: string) => {
      const allButtons = Array.from(dialog?.querySelectorAll('button') ?? [])
      return allButtons.find((b) => b.textContent?.trim() === text)
    }

    // Step 1: 1 2 3 4
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
      await new Promise((r) => setTimeout(r, 250))
    })

    // Step 2: 1 2 3 5 (mismatch!)
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
      getBtn('5')?.click()
    })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100))
    })

    expect(dialog?.textContent).toContain('Mã PIN xác nhận không khớp')
  })
})
