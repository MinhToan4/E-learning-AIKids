// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import * as apiModule from './api'
import { generateCreativeImage } from './creative-api'

describe('creative-api', () => {
  let store: Record<string, string> = {}

  beforeEach(() => {
    store = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = String(value)
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key]
      }),
      clear: vi.fn(() => {
        store = {}
      }),
    })
    localStorage.setItem('storymee_active_ip_id', 'test-ip-123')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('prepends base64 dataUrl into references and converts relative uploaded URL to absolute', async () => {
    let capturedJobPayload: any = null

    vi.spyOn(apiModule, 'api').mockImplementation(async (path: string, init?: any) => {
      if (path.includes('/api/v1/media/upload')) {
        return { url: '/internal/v1/media/aikids-reference.png' }
      }
      if (path === '/api/v1/jobs' && init?.method === 'POST') {
        capturedJobPayload = JSON.parse(init.body)
        return { id: 'test-job-999' }
      }
      if (path.includes('/api/v1/jobs/test-job-999')) {
        return {
          status: 'completed',
          outputUrls: ['https://cdn.storymee.com/output-art.png'],
        }
      }
      return {}
    })

    vi.spyOn(apiModule, 'openAuthorizedStream').mockRejectedValue(new Error('SSE disabled in test'))

    const mockDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    const result = await generateCreativeImage({
      prompt: 'Bé mèo xinh xắn',
      imageDataUrl: mockDataUrl,
    })

    expect(result).toBe('https://cdn.storymee.com/output-art.png')
    expect(capturedJobPayload).toBeTruthy()

    const { reference_image_url, reference_image_urls } = capturedJobPayload.inputParams

    // references[0] must be the raw base64 dataUrl for native Gemini/Vertex inlineData
    expect(reference_image_url).toBe(mockDataUrl)
    expect(reference_image_urls[0]).toBe(mockDataUrl)

    // The uploaded relative URL should be converted to absolute URL
    expect(reference_image_urls[1]).toMatch(/^https:\/\/[^/]+\/internal\/v1\/media\/aikids-reference\.png$/)
  })

  it('resolves immediately when SSE stream emits completed status first', async () => {
    vi.spyOn(apiModule, 'api').mockImplementation(async (path: string, init?: any) => {
      if (path === '/api/v1/jobs' && init?.method === 'POST') {
        return { id: 'sse-job-1' }
      }
      if (path.includes('/api/v1/jobs/sse-job-1')) {
        // Polling returns pending
        return { status: 'processing' }
      }
      return {}
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const payload = JSON.stringify({
          id: 'sse-job-1',
          status: 'completed',
          outputUrls: ['https://cdn.storymee.com/sse-art.png'],
        })
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
        controller.close()
      },
    })

    vi.spyOn(apiModule, 'openAuthorizedStream').mockResolvedValue(new Response(stream))

    const result = await generateCreativeImage({
      prompt: 'Chú cún vui vẻ',
    })

    expect(result).toBe('https://cdn.storymee.com/sse-art.png')
  })

  it('throws error when job fails with error message', async () => {
    vi.spyOn(apiModule, 'api').mockImplementation(async (path: string, init?: any) => {
      if (path === '/api/v1/jobs' && init?.method === 'POST') {
        return { id: 'fail-job-1' }
      }
      if (path.includes('/api/v1/jobs/fail-job-1')) {
        return {
          status: 'failed',
          errorMessage: 'Quota exceeded or safety trigger',
        }
      }
      return {}
    })

    vi.spyOn(apiModule, 'openAuthorizedStream').mockRejectedValue(new Error('Network drop'))

    await expect(
      generateCreativeImage({
        prompt: 'Vẽ robot',
      }),
    ).rejects.toThrow('Quota exceeded or safety trigger')
  })
})

