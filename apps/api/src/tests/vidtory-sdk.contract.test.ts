import { describe, expect, it } from 'vitest'
import { VidtoryAI } from '@vidtory/ai-sdk'

function json(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

describe('vendored Vidtory SDK contract', () => {
  it('sends image generation through the documented endpoint and polls the result', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    const fakeFetch: typeof fetch = async (input, init) => {
      const url = String(input)
      calls.push({ url, init })
      if (url.endsWith('/generative-core/image')) {
        return json({
          success: true,
          data: { status: 'PENDING', generationHistoryId: 'image-job-1' },
        })
      }
      return json({
        success: true,
        message: 'ok',
        error: null,
        timestamp: new Date(0).toISOString(),
        data: {
          id: 'image-job-1',
          generationHistoryId: 'image-job-1',
          type: 'image',
          status: 'COMPLETED',
          createdAt: new Date(0).toISOString(),
          updatedAt: new Date(0).toISOString(),
          result: { type: 'image', url: 'https://cdn.example.com/result.webp' },
        },
      })
    }
    const client = new VidtoryAI({
      apiKey: 'vidtory_contract_key',
      maxRetries: 0,
      fetch: fakeFetch,
    })

    const result = await client.models.generateImage({
      prompt: 'friendly clay cat',
      modelId: 'image-model',
      refImageUrl: 'https://cdn.example.com/ref.webp',
    })

    expect('result' in result && result.result).toBe(
      'https://cdn.example.com/result.webp',
    )
    expect(calls).toHaveLength(2)
    expect(calls[0]?.url).toMatch(/\/generative-core\/image$/)
    expect(new Headers(calls[0]?.init?.headers).get('x-api-key')).toBe(
      'vidtory_contract_key',
    )
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      modelId: 'image-model',
      prompt: 'friendly clay cat',
      refImageUrl: 'https://cdn.example.com/ref.webp',
    })
    expect(calls[1]?.url).toMatch(
      /\/generative-core\/jobs\/image-job-1\/status$/,
    )
  })

  it('keeps i2v mode and multiple start images in video requests', async () => {
    let request: { url: string; init?: RequestInit } | null = null
    const fakeFetch: typeof fetch = async (input, init) => {
      request = { url: String(input), init }
      return json({
        success: true,
        data: { status: 'PENDING', generationHistoryId: 'video-job-1' },
      })
    }
    const client = new VidtoryAI({
      apiKey: 'vidtory_contract_key',
      maxRetries: 0,
      fetch: fakeFetch,
    })

    const result = await client.models.generateVideo(
      {
        prompt: 'friendly clay cat waves',
        modelId: 'video-model',
        mode: 'i2v',
        startImages: [
          'https://cdn.example.com/1.webp',
          'https://cdn.example.com/2.webp',
        ],
      },
      { awaitResult: false },
    )

    expect('data' in result && result.data.generationHistoryId).toBe(
      'video-job-1',
    )
    expect(request).not.toBeNull()
    const captured = request as unknown as { url: string; init?: RequestInit }
    expect(captured.url).toMatch(/\/generative-core\/video$/)
    expect(JSON.parse(String(captured.init?.body))).toEqual({
      modelId: 'video-model',
      prompt: 'friendly clay cat waves',
      mode: 'i2v',
      startImages: [
        'https://cdn.example.com/1.webp',
        'https://cdn.example.com/2.webp',
      ],
    })
  })
})
