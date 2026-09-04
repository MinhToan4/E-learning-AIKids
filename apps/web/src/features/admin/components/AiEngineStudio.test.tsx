// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AiEngineStudio } from './AiEngineStudio'
import { ART_STYLES, buildArtGenerationPrompt } from '@/shared/lib/creation/creative'
import * as apiModule from '@/shared/lib/api'

// Mock api functions
vi.mock('@/shared/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/lib/api')>()
  return {
    ...actual,
    fetchAiProviders: vi.fn().mockResolvedValue({
      catalog: [
        {
          id: 'gemini-native',
          displayName: 'Google Gemini Native (AI Studio)',
          kind: 'api_key',
          capabilities: ['image', 'llm'],
          status: 'active',
        },
        {
          id: 'vidtory-sdk',
          displayName: 'Vidtory SDK (Generative Core)',
          kind: 'sdk',
          capabilities: ['image', 'video'],
          status: 'active',
        },
      ],
      planProviderPolicy: {
        free: { allowedProviders: ['gflow', 'gemini-native'], defaultImageRoute: ['gflow'] },
      },
      imageRoute: {
        chain: [
          { providerId: 'gflow', credentialSource: 'pool', hasCredentials: true },
          { providerId: 'gemini-native', credentialSource: 'key', hasCredentials: true },
          { providerId: 'vidtory-sdk', credentialSource: 'sdk', hasCredentials: true },
        ],
      },
    }),
    fetchAiProviderPolicy: vi.fn().mockResolvedValue({
      planProviderPolicy: {
        free: { allowedProviders: ['gflow', 'gemini-native'], defaultImageRoute: ['gflow'] },
        pro: { allowedProviders: ['vertex', 'gemini-native'], defaultImageRoute: ['vertex'] },
      },
      disabledImageProviders: [],
      sdkApiKey: 'vidtory_live_12345678',
      geminiApiKey: 'AIzaSy12345678',
      vertexProjectId: '1091492607886',
      universalNegativePrompt: 'deformed, bad anatomy, violence, nsfw',
    }),
    updateAiProviderPolicy: vi.fn().mockResolvedValue({
      planProviderPolicy: {},
      disabledImageProviders: [],
    }),
    saveProviderApiKey: vi.fn().mockResolvedValue({
      success: true,
      maskedHint: 'AIzaS••••5678',
    }),
  }
})

describe('AiEngineStudio Component', () => {
  let container: HTMLDivElement
  let root: Root
  let mockStorage: Record<string, string> = {}

  beforeEach(() => {
    mockStorage = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, val: string) => {
        mockStorage[key] = val
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key]
      }),
      clear: vi.fn(() => {
        mockStorage = {}
      }),
    })
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  it('renders AiEngineStudio without crashing and displays all 5 sub-tabs', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Studio root
    const studioEl = container.querySelector('[data-testid="ai-engine-studio"]')
    expect(studioEl).not.toBeNull()

    // 5 tab buttons
    expect(container.textContent).toContain('1. Nhà Cung Cấp & Khóa API')
    expect(container.textContent).toContain('2. Luồng Điều Phối & Fallback')
    expect(container.textContent).toContain('3. Khung Prompt Sẵn (Prompt Studio)')
    expect(container.textContent).toContain('4. Ma Trận Gói Học (Plan Matrix)')
    expect(container.textContent).toContain('5. An Toàn, Kiểm Duyệt & Probe Tester')

    // Tab 1 content by default
    expect(container.textContent).toContain('Danh Mục Nhà Cung Cấp & Quản Trị Khóa Kết Nối')
    expect(container.textContent).toContain('Google Gemini Native (AI Studio)')
    expect(container.textContent).toContain('Google Vertex AI (Enterprise / Free Trial)')
    expect(container.textContent).toContain('Vidtory SDK (Generative Core)')
    expect(container.textContent).toContain('Google Flow (Worker Extension)')
    expect(container.textContent).toContain('Dreamina (Worker Extension)')
    expect(container.textContent).toContain('OpenAI (API Key)')
    expect(container.textContent).toContain('Suno Audio Engine')
  })

  it('switches between all 5 sub-tabs seamlessly', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    const buttons = () => Array.from(container.querySelectorAll('button'))

    // ── Tab 2: Routing & Fallback ───────────────────────────
    const routingTabBtn = buttons().find((b) =>
      b.textContent?.includes('2. Luồng Điều Phối & Fallback'),
    )
    expect(routingTabBtn).toBeDefined()
    await act(async () => {
      routingTabBtn?.click()
    })

    expect(container.textContent).toContain('Chuỗi Dự Phòng Tạo Ảnh Tự Động (Fallback Pipeline)')
    expect(container.textContent).toContain('Cấu hình Tạo Video (Video Engine)')
    expect(container.textContent).toContain('Bộ Não Sư Phạm Mèo Mee')

    // ── Tab 3: Prompt Studio ────────────────────────────────
    const promptsTabBtn = buttons().find((b) =>
      b.textContent?.includes('3. Khung Prompt Sẵn (Prompt Studio)'),
    )
    expect(promptsTabBtn).toBeDefined()
    await act(async () => {
      promptsTabBtn?.click()
    })

    expect(container.textContent).toContain('Trung Tâm Quản Trị Khung Prompt Sẵn (Prompt Studio)')
    expect(container.textContent).toContain('Phác Thảo Sang Tranh Vẽ (Sketch to Art)')
    expect(container.textContent).toContain('Xưởng Tạo Nhân Vật & Linh Vật (Character Studio)')
    expect(container.textContent).toContain('Kịch Bản Truyện Tranh 4 Khung (4-Panel Comic)')
    expect(container.textContent).toContain('Sáng Tác Truyện Chữ Thiếu Nhi (Story Narrative)')
    expect(container.textContent).toContain('Ghép Thẻ Tạo Ảnh Bài Học (Scaffolded Chip Prompt)')
    expect(container.textContent).toContain('Minh Họa Toán & Khoa Học ASMO (ASMO Visualizer)')
    expect(container.textContent).toContain('Trợ Giảng Sư Phạm Mèo Mee (Mee Tutor System Prompt)')
    expect(container.textContent).toContain('Video Hoạt Cảnh Thiếu Nhi (Video Motion Prompt)')

    // ── Tab 4: Plan Matrix ──────────────────────────────────
    const matrixTabBtn = buttons().find((b) =>
      b.textContent?.includes('4. Ma Trận Gói Học (Plan Matrix)'),
    )
    expect(matrixTabBtn).toBeDefined()
    await act(async () => {
      matrixTabBtn?.click()
    })

    expect(container.textContent).toContain('Ma Trận Phân Quyền AI Theo Gói Học (AI Kids Plans)')
    expect(container.textContent).toContain('Gói Miễn Phí (Free)')
    expect(container.textContent).toContain('Gói Khởi Đầu (Starter)')
    expect(container.textContent).toContain('Gói Premium Gia Đình')
    expect(container.textContent).toContain('Gói Pro VIP (ASMO Master)')

    // ── Tab 5: Child Safety & Probe Tester ───────────────────
    const safetyTabBtn = buttons().find((b) =>
      b.textContent?.includes('5. An Toàn, Kiểm Duyệt & Probe Tester'),
    )
    expect(safetyTabBtn).toBeDefined()
    await act(async () => {
      safetyTabBtn?.click()
    })

    expect(container.textContent).toContain('Bộ Lọc An Toàn Thiếu Nhi (Universal Negative Prompt)')
    expect(container.textContent).toContain('Phong Cách Tạo Hình Độc Quyền (AI Kids Style Presets)')
    expect(container.textContent).toContain('Công Cụ Thử Nghiệm Nhanh Pipeline (Probe Tester)')
  })

  it('toggles kill-switch for provider in routing tab and triggers update policy', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to routing tab
    const routingTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('2. Luồng Điều Phối & Fallback'),
    )
    await act(async () => {
      routingTabBtn?.click()
    })

    // Find kill-switch button for gflow
    const killButtons = Array.from(container.querySelectorAll('button')).filter((b) =>
      b.getAttribute('title')?.includes('khẩn cấp') || b.getAttribute('title')?.includes('Bật lại'),
    )
    expect(killButtons.length).toBeGreaterThan(0)

    await act(async () => {
      killButtons[0].click()
    })

    expect(apiModule.updateAiProviderPolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        disabledImageProviders: expect.any(Array),
      }),
    )

    // Check toast notification in portal body
    expect(document.body.textContent).toMatch(/Đã tạm ngắt khẩn cấp|Đã kích hoạt lại/)
  })

  it('saves routing settings and shows success toast', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to routing tab
    const routingTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('2. Luồng Điều Phối & Fallback'),
    )
    await act(async () => {
      routingTabBtn?.click()
    })

    // Click "Lưu luồng điều phối"
    const saveBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Lưu luồng điều phối'),
    )
    expect(saveBtn).toBeDefined()

    await act(async () => {
      saveBtn?.click()
    })

    expect(apiModule.updateAiProviderPolicy).toHaveBeenCalled()
    expect(document.body.textContent).toContain('Đã lưu cấu hình Luồng điều phối')
  })

  it('saves plan matrix and shows success toast', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to matrix tab
    const matrixTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('4. Ma Trận Gói Học (Plan Matrix)'),
    )
    await act(async () => {
      matrixTabBtn?.click()
    })

    // Toggle a checkbox in the matrix
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(checkbox).not.toBeNull()
    await act(async () => {
      checkbox.click()
    })

    // Click "Lưu ma trận gói học"
    const saveMatrixBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Lưu ma trận gói học'),
    )
    expect(saveMatrixBtn).toBeDefined()

    await act(async () => {
      saveMatrixBtn?.click()
    })

    expect(apiModule.updateAiProviderPolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        planProviderPolicy: expect.any(Object),
      }),
    )
    expect(document.body.textContent).toContain('Đã lưu Ma trận phân quyền theo gói học')
  })

  it('runs probe tester in safety tab and displays results', async () => {
    vi.useFakeTimers()
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to safety tab
    const safetyTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('5. An Toàn, Kiểm Duyệt & Probe Tester'),
    )
    await act(async () => {
      safetyTabBtn?.click()
    })

    // Click "Chạy Probe"
    const probeBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Chạy Probe'),
    )
    expect(probeBtn).toBeDefined()

    await act(async () => {
      probeBtn?.click()
    })

    // Advance fake timers for simulated latency
    await act(async () => {
      vi.advanceTimersByTime(1200)
    })

    expect(container.textContent).toContain('Kết quả Probe:')
    expect(container.textContent).toContain('PASSED: Đạt chuẩn an toàn thiếu nhi')
    vi.useRealTimers()
  })

  it('moves fallback chain priority up and down correctly', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to routing tab
    const routingTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('2. Luồng Điều Phối & Fallback'),
    )
    await act(async () => {
      routingTabBtn?.click()
    })

    // Initial order should have gflow as #1
    expect(container.textContent).toContain('Ưu tiên #1')

    // Find arrow down button for index 0
    const downButtons = Array.from(container.querySelectorAll('button[aria-label^="Giảm ưu tiên"]'))
    expect(downButtons.length).toBeGreaterThan(0)

    // Click down on the first item
    await act(async () => {
      (downButtons[0] as HTMLButtonElement).click()
    })

    // Now find arrow up button
    const upButtons = Array.from(container.querySelectorAll('button[aria-label^="Tăng ưu tiên"]'))
    expect(upButtons.length).toBeGreaterThan(1)

    // Click up on the second item to restore
    await act(async () => {
      (upButtons[1] as HTMLButtonElement).click()
    })
  })

  it('saves provider API key and displays success toast', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Click to add / change key for OpenAI
    const addKeyButtons = Array.from(container.querySelectorAll('button')).filter((b) =>
      b.textContent?.includes('+ Thêm khóa API mới') || b.textContent?.includes('Thay đổi khóa API'),
    )
    expect(addKeyButtons.length).toBeGreaterThan(0)

    await act(async () => {
      addKeyButtons[0].click()
    })

    // Find password input
    const input = container.querySelector('input[type="password"]') as HTMLInputElement
    expect(input).not.toBeNull()

    await act(async () => {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
      descriptor?.set?.call(input, 'sk-proj-test123456789')
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })

    // Click Lưu
    const saveKeyBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Lưu',
    )
    expect(saveKeyBtn).toBeDefined()

    await act(async () => {
      saveKeyBtn?.click()
    })

    expect(apiModule.saveProviderApiKey).toHaveBeenCalled()
    expect(document.body.textContent).toContain('Đã mã hóa và lưu khóa API')
  })

  it('restores default and saves universal negative prompt in safety tab', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to safety tab
    const safetyTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('5. An Toàn, Kiểm Duyệt & Probe Tester'),
    )
    await act(async () => {
      safetyTabBtn?.click()
    })

    // Find "Khôi phục mẫu chuẩn" button
    const restoreBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Khôi phục mẫu chuẩn'),
    )
    expect(restoreBtn).toBeDefined()

    await act(async () => {
      restoreBtn?.click()
    })

    // Find "Lưu bộ lọc an toàn" button
    const saveSafetyBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Lưu bộ lọc an toàn'),
    )
    expect(saveSafetyBtn).toBeDefined()

    await act(async () => {
      saveSafetyBtn?.click()
    })

    expect(apiModule.updateAiProviderPolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        universalNegativePrompt: expect.any(String),
      }),
    )
    expect(document.body.textContent).toContain('Đã lưu Bộ lọc An toàn Trẻ em')
  })

  it('displays Google Vertex AI as active and configured with GCP ADC badge and project info', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Vertex card should show active state, ADC badge, and project info
    expect(container.textContent).toContain('Google Vertex AI (Enterprise / Free Trial)')
    expect(container.textContent).toContain('GCP ADC / Service Account')
    expect(container.textContent).toContain('Project: 1091492607886 · us-central1')
    expect(container.textContent).toContain('GCP-1091492607886 (Active)')
    expect(container.textContent).toContain('Thay đổi Service Account / Key')
  })

  it('renders Image Engine block in routing tab with 14 SSOT art styles and live prompt preview', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to routing tab
    const routingTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('2. Luồng Điều Phối & Fallback'),
    )
    await act(async () => {
      routingTabBtn?.click()
    })

    // Image Engine block presence
    expect(container.textContent).toContain('Cấu hình Tạo Ảnh (Image Engine)')
    expect(container.textContent).toContain('Động Cơ Tạo Ảnh Chính & Phong Cách')

    // Dropdowns & select options
    const providerSelect = container.querySelector('select[aria-label="Nhà cung cấp ảnh chính"]') as HTMLSelectElement
    expect(providerSelect).not.toBeNull()
    expect(providerSelect.value).toBe('gemini-native')
    expect(providerSelect.innerHTML).toContain('Google Gemini Native')
    expect(providerSelect.innerHTML).toContain('Google Flow')
    expect(providerSelect.innerHTML).toContain('Google Vertex AI')
    expect(providerSelect.innerHTML).toContain('Vidtory SDK')
    expect(providerSelect.innerHTML).toContain('Dreamina')

    const aspectSelect = container.querySelector('select[aria-label="Tỷ lệ khung hình ảnh"]') as HTMLSelectElement
    expect(aspectSelect).not.toBeNull()
    expect(aspectSelect.innerHTML).toContain('Vuông 1:1')
    expect(aspectSelect.innerHTML).toContain('Ngang 16:9')
    expect(aspectSelect.innerHTML).toContain('Dọc 9:16')

    const resSelect = container.querySelector('select[aria-label="Độ phân giải ảnh"]') as HTMLSelectElement
    expect(resSelect).not.toBeNull()
    expect(resSelect.innerHTML).toContain('1K')
    expect(resSelect.innerHTML).toContain('2K')
    expect(resSelect.innerHTML).toContain('4K')

    // Style preset dropdown: Must contain all 14 SSOT Art Styles
    const styleSelect = container.querySelector('select[aria-label="Phong cách mỹ thuật"]') as HTMLSelectElement
    expect(styleSelect).not.toBeNull()
    expect(styleSelect.options.length).toBe(14)
    expect(styleSelect.value).toBe('clay')

    const expectedStyleIds = [
      'watercolor', 'cartoon', 'crayon', 'anime', 'manga',
      'comic', 'sketch', '3d', 'pixel', 'chibi',
      'clay', 'fabric', 'manhwa', 'semirealistic',
    ]
    for (const styleId of expectedStyleIds) {
      const opt = Array.from(styleSelect.options).find((o) => o.value === styleId)
      expect(opt).toBeDefined()
    }

    // Selected style badge & descriptor preview
    expect(container.textContent).toContain('Đất sét')
    expect(container.textContent).toContain('Soft clay handmade')
    expect(container.textContent).toContain('handmade claymation, matte plasticine')

    // Checkboxes
    expect(container.textContent).toContain('Tối ưu nén WebP cho thiếu nhi')
    expect(container.textContent).toContain('Tự động lồng khung prompt thiếu nhi cho app.aikid.vn & play.aikid.vn')

    // Live Prompt Preview
    const livePreview = container.querySelector('[data-testid="live-prompt-preview"]')
    expect(livePreview).not.toBeNull()
    expect(livePreview?.textContent).toContain('handmade claymation, matte plasticine')
    expect(livePreview?.textContent).toContain('Study the child-provided reference sketch')
    expect(livePreview?.textContent).toContain('Child-safe and wholesome for ages 6-15')
  })

  it('switches between 14 SSOT art styles and dynamically updates badge and live prompt preview', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to routing tab
    const routingTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('2. Luồng Điều Phối & Fallback'),
    )
    await act(async () => {
      routingTabBtn?.click()
    })

    const styleSelect = container.querySelector('select[aria-label="Phong cách mỹ thuật"]') as HTMLSelectElement
    expect(styleSelect).not.toBeNull()

    // Switch to watercolor
    await act(async () => {
      styleSelect.value = 'watercolor'
      styleSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(container.textContent).toContain('Màu nước')
    expect(container.textContent).toContain('Mềm, loang nhẹ như màu nước')
    let livePreview = container.querySelector('[data-testid="live-prompt-preview"]')
    expect(livePreview?.textContent).toContain('watercolor on cold-pressed paper')

    // Switch to anime
    await act(async () => {
      styleSelect.value = 'anime'
      styleSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(container.textContent).toContain('Anime')
    expect(container.textContent).toContain('Mắt to, màu tươi vừa phải')
    livePreview = container.querySelector('[data-testid="live-prompt-preview"]')
    expect(livePreview?.textContent).toContain('high-quality child-friendly anime')
  })

  it('customizes prompt frame prefix and suffix and resets to default template', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to routing tab
    const routingTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('2. Luồng Điều Phối & Fallback'),
    )
    await act(async () => {
      routingTabBtn?.click()
    })

    // Click toggle button to open prompt frame editor
    const toggleBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Tùy biến khung prompt (Prefix & Suffix)'),
    )
    expect(toggleBtn).toBeDefined()

    await act(async () => {
      toggleBtn?.click()
    })

    // Prefix & Suffix textareas are visible
    const prefixInput = container.querySelector('textarea[aria-label="Tiền tố prompt"]') as HTMLTextAreaElement
    const suffixInput = container.querySelector('textarea[aria-label="Hậu tố prompt"]') as HTMLTextAreaElement
    expect(prefixInput).not.toBeNull()
    expect(suffixInput).not.toBeNull()

    // Edit prefix
    await act(async () => {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')
      descriptor?.set?.call(prefixInput, 'Vẽ lại bức tranh thiếu nhi phong cách')
      prefixInput.dispatchEvent(new Event('input', { bubbles: true }))
      prefixInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    // Live preview immediately reflects custom prefix
    let livePreview = container.querySelector('[data-testid="live-prompt-preview"]')
    expect(livePreview?.textContent).toContain('Vẽ lại bức tranh thiếu nhi phong cách')

    // Click reset to default template
    const resetBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Khôi phục mẫu chuẩn app.aikid.vn'),
    )
    expect(resetBtn).toBeDefined()

    await act(async () => {
      resetBtn?.click()
    })

    // Verify restored
    livePreview = container.querySelector('[data-testid="live-prompt-preview"]')
    expect(livePreview?.textContent).toContain('Study the child-provided reference sketch')
  })

  it('displays all 14 SSOT art styles in child safety tab with modal preview', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to safety tab
    const safetyTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('5. An Toàn, Kiểm Duyệt & Probe Tester'),
    )
    await act(async () => {
      safetyTabBtn?.click()
    })

    // Check header
    expect(container.textContent).toContain('Bộ 14 Phong Cách Mỹ Thuật Thiếu Nhi SSOT')
    expect(container.textContent).toContain('14 Phong Cách Chuẩn (SSOT)')

    // Check that all 14 labels are present
    for (const style of ART_STYLES) {
      expect(container.textContent).toContain(style.labelVi)
    }

    // Find "Xem khung prompt hoàn chỉnh" buttons
    const previewButtons = Array.from(container.querySelectorAll('button')).filter((b) =>
      b.textContent?.includes('Xem khung prompt hoàn chỉnh'),
    )
    expect(previewButtons.length).toBe(14)

    // Click preview on first item (watercolor)
    await act(async () => {
      previewButtons[0].click()
    })

    // Modal should be open in document.body
    const modalPrompt = document.body.querySelector('[data-testid="modal-full-prompt"]')
    expect(modalPrompt).not.toBeNull()
    expect(modalPrompt?.textContent).toBe(buildArtGenerationPrompt(ART_STYLES[0].id))

    // Close modal
    const closeBtn = Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.textContent === 'Đóng' || b.getAttribute('aria-label') === 'Đóng',
    )
    expect(closeBtn).toBeDefined()

    await act(async () => {
      closeBtn?.click()
    })

    expect(document.body.querySelector('[data-testid="modal-full-prompt"]')).toBeNull()
  })

  it('updates image config and saves complete routing settings (Image + Video + LLM)', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to routing tab
    const routingTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('2. Luồng Điều Phối & Fallback'),
    )
    await act(async () => {
      routingTabBtn?.click()
    })

    // Change image provider to vertex
    const providerSelect = container.querySelector('select[aria-label="Nhà cung cấp ảnh chính"]') as HTMLSelectElement
    expect(providerSelect).not.toBeNull()
    await act(async () => {
      providerSelect.value = 'vertex'
      providerSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })

    // Change aspect ratio to 16:9
    const aspectSelect = container.querySelector('select[aria-label="Tỷ lệ khung hình ảnh"]') as HTMLSelectElement
    expect(aspectSelect).not.toBeNull()
    await act(async () => {
      aspectSelect.value = '16:9'
      aspectSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })

    // Change style preset to crayon
    const styleSelect = container.querySelector('select[aria-label="Phong cách mỹ thuật"]') as HTMLSelectElement
    expect(styleSelect).not.toBeNull()
    await act(async () => {
      styleSelect.value = 'crayon'
      styleSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })

    // Click "Lưu luồng điều phối"
    const saveBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Lưu luồng điều phối'),
    )
    expect(saveBtn).toBeDefined()

    await act(async () => {
      saveBtn?.click()
    })

    expect(apiModule.updateAiProviderPolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        imageProvider: 'vertex',
        imageConfig: expect.objectContaining({
          provider: 'vertex',
          aspectRatio: '16:9',
          stylePreset: 'crayon',
          autoWrapPrompt: true,
          promptPrefix: expect.any(String),
          promptSuffix: expect.any(String),
        }),
        videoProvider: expect.any(String),
        llmProvider: expect.any(String),
      }),
    )
    expect(document.body.textContent).toContain('Đã lưu cấu hình Luồng điều phối')
  })

  // ── Prompt Studio Specific Tests ─────────────────────────
  it('filters prompt frameworks by category (all, art, story, lesson, asmo, video)', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to Tab 3: Prompt Studio
    const promptsTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('3. Khung Prompt Sẵn (Prompt Studio)'),
    )
    expect(promptsTabBtn).toBeDefined()
    await act(async () => {
      promptsTabBtn?.click()
    })

    // All categories initially show all 8 items
    expect(container.textContent).toContain('Phác Thảo Sang Tranh Vẽ (Sketch to Art)')
    expect(container.textContent).toContain('Xưởng Tạo Nhân Vật & Linh Vật (Character Studio)')
    expect(container.textContent).toContain('Kịch Bản Truyện Tranh 4 Khung (4-Panel Comic)')
    expect(container.textContent).toContain('Sáng Tác Truyện Chữ Thiếu Nhi (Story Narrative)')
    expect(container.textContent).toContain('Ghép Thẻ Tạo Ảnh Bài Học (Scaffolded Chip Prompt)')
    expect(container.textContent).toContain('Minh Họa Toán & Khoa Học ASMO (ASMO Visualizer)')
    expect(container.textContent).toContain('Trợ Giảng Sư Phạm Mèo Mee (Mee Tutor System Prompt)')
    expect(container.textContent).toContain('Video Hoạt Cảnh Thiếu Nhi (Video Motion Prompt)')

    const filterBtn = (label: string) =>
      Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes(label),
      )

    // Filter by Art: only art frameworks visible
    await act(async () => {
      filterBtn('Tranh vẽ & Mỹ thuật')?.click()
    })
    expect(container.textContent).toContain('Phác Thảo Sang Tranh Vẽ (Sketch to Art)')
    expect(container.textContent).toContain('Xưởng Tạo Nhân Vật & Linh Vật (Character Studio)')
    expect(container.textContent).not.toContain('Kịch Bản Truyện Tranh 4 Khung')
    expect(container.textContent).not.toContain('Video Hoạt Cảnh Thiếu Nhi')

    // Filter by Story
    await act(async () => {
      filterBtn('Truyện & Kịch bản')?.click()
    })
    expect(container.textContent).toContain('Kịch Bản Truyện Tranh 4 Khung (4-Panel Comic)')
    expect(container.textContent).toContain('Sáng Tác Truyện Chữ Thiếu Nhi (Story Narrative)')
    expect(container.textContent).not.toContain('Phác Thảo Sang Tranh Vẽ')

    // Filter by Lesson
    await act(async () => {
      filterBtn('Ghép thẻ bài học')?.click()
    })
    expect(container.textContent).toContain('Ghép Thẻ Tạo Ảnh Bài Học (Scaffolded Chip Prompt)')
    expect(container.textContent).not.toContain('Kịch Bản Truyện Tranh 4 Khung')

    // Filter by ASMO
    await act(async () => {
      filterBtn('ASMO & Trợ giảng')?.click()
    })
    expect(container.textContent).toContain('Minh Họa Toán & Khoa Học ASMO (ASMO Visualizer)')
    expect(container.textContent).toContain('Trợ Giảng Sư Phạm Mèo Mee (Mee Tutor System Prompt)')
    expect(container.textContent).not.toContain('Ghép Thẻ Tạo Ảnh Bài Học')

    // Filter by Video
    await act(async () => {
      filterBtn('Video hoạt cảnh')?.click()
    })
    expect(container.textContent).toContain('Video Hoạt Cảnh Thiếu Nhi (Video Motion Prompt)')
    expect(container.textContent).not.toContain('Minh Họa Toán & Khoa Học ASMO')

    // Restore to All
    await act(async () => {
      filterBtn('Tất cả')?.click()
    })
    expect(container.textContent).toContain('Phác Thảo Sang Tranh Vẽ (Sketch to Art)')
    expect(container.textContent).toContain('Video Hoạt Cảnh Thiếu Nhi (Video Motion Prompt)')
  })

  it('edits prefix, suffix, and quality keywords in prompt framework card and updates live preview in real time', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to Tab 3: Prompt Studio
    const promptsTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('3. Khung Prompt Sẵn (Prompt Studio)'),
    )
    await act(async () => {
      promptsTabBtn?.click()
    })

    // Find prefix textarea for Sketch to Art
    const prefixInput = container.querySelector(
      'textarea[aria-label="Tiền tố Phác Thảo Sang Tranh Vẽ (Sketch to Art)"]',
    ) as HTMLTextAreaElement
    expect(prefixInput).not.toBeNull()

    // Edit prefix
    await act(async () => {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')
      descriptor?.set?.call(
        prefixInput,
        'Vẽ lại bức tranh từ phác thảo của bé theo phong cách {styleDescriptor}.',
      )
      prefixInput.dispatchEvent(new Event('input', { bubbles: true }))
      prefixInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    // Live preview for sketch_to_art must reflect this update
    let livePreview = container.querySelector('[data-testid="live-prompt-framework-sketch_to_art"]')
    expect(livePreview?.textContent).toContain('Vẽ lại bức tranh từ phác thảo của bé theo phong cách')
    expect(livePreview?.textContent).toContain('handmade claymation, matte plasticine')

    // Find suffix textarea for Sketch to Art
    const suffixInput = container.querySelector(
      'textarea[aria-label="Hậu tố Phác Thảo Sang Tranh Vẽ (Sketch to Art)"]',
    ) as HTMLTextAreaElement
    expect(suffixInput).not.toBeNull()

    // Edit suffix
    await act(async () => {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')
      descriptor?.set?.call(suffixInput, 'Bảo đảm an toàn tuyệt đối lứa tuổi 6-12.')
      suffixInput.dispatchEvent(new Event('input', { bubbles: true }))
      suffixInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    livePreview = container.querySelector('[data-testid="live-prompt-framework-sketch_to_art"]')
    expect(livePreview?.textContent).toContain('Bảo đảm an toàn tuyệt đối lứa tuổi 6-12.')
  })

  it('inserts dynamic variable token when clicking a variable chip', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to Tab 3: Prompt Studio
    const promptsTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('3. Khung Prompt Sẵn (Prompt Studio)'),
    )
    await act(async () => {
      promptsTabBtn?.click()
    })

    // Find variable chip button for childSketch
    const chipBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('{childSketch}'),
    )
    expect(chipBtn).toBeDefined()

    await act(async () => {
      chipBtn?.click()
    })

    // Toast notification confirms insertion
    expect(document.body.textContent).toContain('Đã chèn biến {childSketch} vào tiền tố')

    // Prefix textarea now contains {childSketch}
    const prefixInput = container.querySelector(
      'textarea[aria-label="Tiền tố Phác Thảo Sang Tranh Vẽ (Sketch to Art)"]',
    ) as HTMLTextAreaElement
    expect(prefixInput.value).toContain('{childSketch}')
  })

  it('resets single framework and restores all default frameworks', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to Tab 3: Prompt Studio
    const promptsTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('3. Khung Prompt Sẵn (Prompt Studio)'),
    )
    await act(async () => {
      promptsTabBtn?.click()
    })

    // Edit prefix of character studio
    const prefixInput = container.querySelector(
      'textarea[aria-label="Tiền tố Xưởng Tạo Nhân Vật & Linh Vật (Character Studio)"]',
    ) as HTMLTextAreaElement
    expect(prefixInput).not.toBeNull()

    await act(async () => {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')
      descriptor?.set?.call(prefixInput, 'Một nhân vật hoàn toàn mới.')
      prefixInput.dispatchEvent(new Event('input', { bubbles: true }))
      prefixInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    let livePreview = container.querySelector(
      '[data-testid="live-prompt-framework-character_mascot"]',
    )
    expect(livePreview?.textContent).toContain('Một nhân vật hoàn toàn mới.')

    // Click "Khôi phục mẫu chuẩn mục này" on character card
    const resetSingleButtons = Array.from(container.querySelectorAll('button')).filter((b) =>
      b.textContent?.includes('Khôi phục mẫu chuẩn mục này'),
    )
    expect(resetSingleButtons.length).toBeGreaterThan(0)

    await act(async () => {
      resetSingleButtons[1].click() // Second card is character_mascot
    })

    // Live preview restored
    livePreview = container.querySelector('[data-testid="live-prompt-framework-character_mascot"]')
    expect(livePreview?.textContent).toContain('Create a full-body original character illustration')
    expect(document.body.textContent).toContain('Đã khôi phục khung prompt')

    // Click "Khôi phục toàn bộ mặc định" in global toolbar
    const resetAllBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Khôi phục toàn bộ mặc định'),
    )
    expect(resetAllBtn).toBeDefined()

    await act(async () => {
      resetAllBtn?.click()
    })

    expect(document.body.textContent).toContain('Đã khôi phục toàn bộ 8 khung prompt')
  })

  it('saves prompt frameworks and displays success toast', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to Tab 3: Prompt Studio
    const promptsTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('3. Khung Prompt Sẵn (Prompt Studio)'),
    )
    await act(async () => {
      promptsTabBtn?.click()
    })

    // Click "Lưu tất cả khung prompt"
    const saveBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Lưu tất cả khung prompt'),
    )
    expect(saveBtn).toBeDefined()

    await act(async () => {
      saveBtn?.click()
    })

    expect(document.body.textContent).toContain(
      'Đã lưu cấu hình 8 khung prompt chuẩn SSOT thành công!',
    )
  })

  it('interacts with live variable tester inputs and sends prompt to probe tester in tab 5', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to Tab 3: Prompt Studio
    const promptsTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('3. Khung Prompt Sẵn (Prompt Studio)'),
    )
    await act(async () => {
      promptsTabBtn?.click()
    })

    // Find variable input for topic (ASMO)
    const topicInput = container.querySelector(
      'input[aria-label="Giá trị thử nghiệm topic"]',
    ) as HTMLInputElement
    expect(topicInput).not.toBeNull()

    await act(async () => {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
      descriptor?.set?.call(topicInput, 'Hình học không gian xếp khối lập phương Olympic')
      topicInput.dispatchEvent(new Event('input', { bubbles: true }))
      topicInput.dispatchEvent(new Event('change', { bubbles: true }))
    })

    // Live preview updates with new topic
    const livePreview = container.querySelector(
      '[data-testid="live-prompt-framework-asmo_math_visual"]',
    )
    expect(livePreview?.textContent).toContain('Hình học không gian xếp khối lập phương Olympic')

    // Click "Thử nghiệm qua Probe Tester"
    const probeButtons = Array.from(container.querySelectorAll('button')).filter((b) =>
      b.textContent?.includes('Thử nghiệm qua Probe Tester'),
    )
    expect(probeButtons.length).toBeGreaterThan(0)

    await act(async () => {
      probeButtons[0].click()
    })

    // Should navigate to Tab 5 (Probe Tester)
    expect(container.textContent).toContain('Công Cụ Thử Nghiệm Nhanh Pipeline (Probe Tester)')
    expect(document.body.textContent).toContain('Đã nạp prompt vào Probe Tester ở Tab 5!')
  })

  it('toggles framework enabled state and copies full prompt with visual feedback', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to Tab 3: Prompt Studio
    const promptsTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('3. Khung Prompt Sẵn (Prompt Studio)'),
    )
    await act(async () => {
      promptsTabBtn?.click()
    })

    // Toggle switch for first framework
    const toggleBtn = container.querySelector(
      'button[aria-label="Bật tắt khung Phác Thảo Sang Tranh Vẽ (Sketch to Art)"]',
    ) as HTMLButtonElement
    expect(toggleBtn).not.toBeNull()

    await act(async () => {
      toggleBtn.click()
    })

    // Copy full prompt button
    const copyPromptBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Sao chép Prompt đầy đủ'),
    )
    expect(copyPromptBtn).toBeDefined()

    await act(async () => {
      copyPromptBtn?.click()
    })

    expect(document.body.textContent).toContain('Đã sao chép prompt')
  })

  it('opens and closes import JSON modal cleanly', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Switch to Tab 3: Prompt Studio
    const promptsTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('3. Khung Prompt Sẵn (Prompt Studio)'),
    )
    await act(async () => {
      promptsTabBtn?.click()
    })

    // Open import modal
    const importBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Nhập cấu hình JSON'),
    )
    expect(importBtn).toBeDefined()

    await act(async () => {
      importBtn?.click()
    })

    expect(document.body.textContent).toContain('Nhập Cấu Hình Khung Prompt JSON')

    // Close modal via Hủy
    const cancelBtn = Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.textContent === 'Hủy',
    )
    expect(cancelBtn).toBeDefined()

    await act(async () => {
      cancelBtn?.click()
    })

    expect(document.body.querySelector('#import-modal-title')).toBeNull()
  })

  // ── Sub-tab 5: AI Rejection Review Queue Tests ─────────────────────────────
  it('displays AI Rejection & False-Positive Review Queue in Tab 5 with pending badge and KPIs', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    // Check Tab 5 button has pending badge
    const badge = container.querySelector('[data-testid="rejection-pending-badge"]')
    expect(badge).not.toBeNull()
    expect(badge?.textContent).toBe('3')

    // Switch to Tab 5
    const safetyTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('5. An Toàn, Kiểm Duyệt & Probe Tester'),
    )
    await act(async () => {
      safetyTabBtn?.click()
    })

    // Header check
    expect(container.textContent).toContain('Hàng Đợi Thẩm Định Từ Chối Của AI')
    expect(container.textContent).toContain('Xử Lý Chặn Nhầm & Cứu Sáng Tạo Của Bé')

    // KPI Metrics check
    expect(container.textContent).toContain('Tổng Số Ca Bị Chặn')
    expect(container.textContent).toContain('Chờ Thẩm Định')
    expect(container.textContent).toContain('Tỷ Lệ Chặn Nhầm')
    expect(container.textContent).toContain('Đã Gỡ Chặn')

    // Incident cards check
    expect(container.textContent).toContain('Bé Minh Triết')
    expect(container.textContent).toContain('Bé Bảo An')
    expect(container.textContent).toContain('Bé Gia Huy')
    expect(container.textContent).toContain('Thanh kiếm gỗ đồ chơi của hiệp sĩ')

    // Highlight trigger check
    const markEl = container.querySelector('mark')
    expect(markEl).not.toBeNull()
    expect(markEl?.textContent).toBe('kiếm gỗ')
  })

  it('filters rejection incidents by pending, approved_override, and confirmed_rejected', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    const safetyTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('5. An Toàn, Kiểm Duyệt & Probe Tester'),
    )
    await act(async () => {
      safetyTabBtn?.click()
    })

    // Filter by pending
    const filterPendingBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('⏳ Chờ thẩm định'),
    )
    expect(filterPendingBtn).toBeDefined()
    await act(async () => {
      filterPendingBtn?.click()
    })

    expect(container.querySelector('[data-testid="incident-card-inc_001"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="incident-card-inc_005"]')).toBeNull()

    // Filter by confirmed_rejected
    const filterRejectedBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('❌ Xác nhận vi phạm'),
    )
    expect(filterRejectedBtn).toBeDefined()
    await act(async () => {
      filterRejectedBtn?.click()
    })

    expect(container.querySelector('[data-testid="incident-card-inc_005"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="incident-card-inc_001"]')).toBeNull()

    // Filter by approved_override
    const filterApprovedBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('✅ Đã duyệt gỡ chặn'),
    )
    expect(filterApprovedBtn).toBeDefined()
    await act(async () => {
      filterApprovedBtn?.click()
    })

    expect(container.querySelector('[data-testid="incident-card-inc_004"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="incident-card-inc_001"]')).toBeNull()
  })

  it('allows approving override for a pending rejection incident', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    const safetyTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('5. An Toàn, Kiểm Duyệt & Probe Tester'),
    )
    await act(async () => {
      safetyTabBtn?.click()
    })

    const card = container.querySelector('[data-testid="incident-card-inc_001"]')
    expect(card).not.toBeNull()
    expect(card?.textContent).toContain('⏳ Chờ thẩm định')

    const approveBtn = Array.from(card!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Duyệt cho phép (Gỡ chặn)'),
    )
    expect(approveBtn).toBeDefined()

    await act(async () => {
      approveBtn?.click()
    })

    const updatedCard = container.querySelector('[data-testid="incident-card-inc_001"]')
    expect(updatedCard?.textContent).toContain('✅ Đã duyệt gỡ chặn')
    expect(document.body.textContent).toContain('Đã gỡ chặn thành công')
  })

  it('allows confirming rejection for an incident', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    const safetyTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('5. An Toàn, Kiểm Duyệt & Probe Tester'),
    )
    await act(async () => {
      safetyTabBtn?.click()
    })

    const card = container.querySelector('[data-testid="incident-card-inc_002"]')
    expect(card).not.toBeNull()

    const rejectBtn = Array.from(card!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Xác nhận vi phạm'),
    )
    expect(rejectBtn).toBeDefined()

    await act(async () => {
      rejectBtn?.click()
    })

    const updatedCard = container.querySelector('[data-testid="incident-card-inc_002"]')
    expect(updatedCard?.textContent).toContain('❌ Xác nhận vi phạm')
    expect(document.body.textContent).toContain('Đã xác nhận vi phạm')
  })

  it('opens refine prompt modal, updates prompt and saves recreation for student', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    const safetyTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('5. An Toàn, Kiểm Duyệt & Probe Tester'),
    )
    await act(async () => {
      safetyTabBtn?.click()
    })

    const card = container.querySelector('[data-testid="incident-card-inc_001"]')
    const refineBtn = Array.from(card!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Sửa nhanh prompt'),
    )
    expect(refineBtn).toBeDefined()

    await act(async () => {
      refineBtn?.click()
    })

    // Check modal appears in portal
    const modal = document.body.querySelector('[data-testid="refine-prompt-modal"]')
    expect(modal).not.toBeNull()
    expect(modal?.textContent).toContain('Sửa Nhanh Prompt & Tái Tạo Tranh Cho Bé')
    expect(modal?.textContent).toContain('Bé Minh Triết')

    // Find prompt textarea inside modal
    const textarea = modal?.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea).not.toBeNull()

    await act(async () => {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')
      descriptor?.set?.call(textarea, 'Thanh đũa phép bằng gỗ thần kỳ của hiệp sĩ tí hon')
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
      textarea.dispatchEvent(new Event('change', { bubbles: true }))
    })

    // Submit save button
    const saveBtn = Array.from(modal!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Lưu & Tái tạo tranh ngay cho bé'),
    )
    expect(saveBtn).toBeDefined()

    await act(async () => {
      saveBtn?.click()
    })

    // Modal closes
    expect(document.body.querySelector('[data-testid="refine-prompt-modal"]')).toBeNull()

    // Card shows refined prompt
    const updatedCard = container.querySelector('[data-testid="incident-card-inc_001"]')
    expect(updatedCard?.textContent).toContain('Prompt đã hiệu chỉnh:')
    expect(updatedCard?.textContent).toContain('Thanh đũa phép bằng gỗ thần kỳ của hiệp sĩ tí hon')
  })

  it('adds whitelist keyword exception for an incident trigger', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    const safetyTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('5. An Toàn, Kiểm Duyệt & Probe Tester'),
    )
    await act(async () => {
      safetyTabBtn?.click()
    })

    const card = container.querySelector('[data-testid="incident-card-inc_001"]')
    const whitelistBtn = Array.from(card!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Thêm ngoại lệ'),
    )
    expect(whitelistBtn).toBeDefined()

    await act(async () => {
      whitelistBtn?.click()
    })

    expect(document.body.textContent).toContain('Đã thêm ngoại lệ "kiếm gỗ" vào Whitelist an toàn')
  })

  it('opens sketch zoom modal on clicking sketch thumbnail and closes it', async () => {
    await act(async () => {
      root.render(createElement(AiEngineStudio))
    })

    const safetyTabBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('5. An Toàn, Kiểm Duyệt & Probe Tester'),
    )
    await act(async () => {
      safetyTabBtn?.click()
    })

    const card = container.querySelector('[data-testid="incident-card-inc_001"]')
    const thumbnailContainer = card?.querySelector('div[title="Nhấn để phóng to nét vẽ của bé"]') as HTMLElement
    expect(thumbnailContainer).not.toBeNull()

    await act(async () => {
      thumbnailContainer.click()
    })

    const zoomDialog = document.body.querySelector('div[aria-label="Phóng to nét vẽ phác thảo của bé"]')
    expect(zoomDialog).not.toBeNull()
    expect(zoomDialog?.textContent).toContain('Chi Tiết Bản Vẽ Phác Thảo Của Bé')
    expect(zoomDialog?.querySelector('img')).not.toBeNull()

    const closeBtn = zoomDialog?.querySelector('button[aria-label="Đóng"]') as HTMLButtonElement
    expect(closeBtn).not.toBeNull()

    await act(async () => {
      closeBtn.click()
    })

    expect(document.body.querySelector('div[aria-label="Phóng to nét vẽ phác thảo của bé"]')).toBeNull()
  })
})

