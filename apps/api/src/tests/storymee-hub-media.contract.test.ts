import { afterEach, describe, expect, it, vi } from 'vitest'
import { createStoryMeeHubMediaClient } from '../infrastructure/generation/storymee-hub.client.js'

function json(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

describe('StoryMee Hub media contract', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('uses provider auto and polls Hub for the generated image', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    vi.stubGlobal('fetch', vi.fn(async (input, init) => {
      const url = String(input)
      calls.push({ url, init })
      if (url.endsWith('/v1/media/image')) {
        return json({ status: 'processing', job_id: 'image-job-1' })
      }
      return json({
        task: {
          id: 'image-job-1',
          metadata: { state: 'SUCCEEDED' },
          media_urls: ['https://storage.storymee.com/result.webp'],
        },
      })
    }))

    const result = await createStoryMeeHubMediaClient().models.generateImage({
      prompt: 'friendly clay cat',
      modelId: 'image-model',
      refImageUrl: 'https://storage.storymee.com/ref.webp',
    })

    expect(result.result).toBe('https://storage.storymee.com/result.webp')
    expect(calls.map((call) => call.url)).toEqual([
      'http://127.0.0.1:5100/v1/media/image',
      'http://127.0.0.1:5100/v1/media/tasks/image-job-1',
    ])
    expect(new Headers(calls[0]?.init?.headers).get('Authorization'))
      .toBe('Bearer test-hub-api-key')
    expect(JSON.parse(String(calls[0]?.init?.body))).toMatchObject({
      provider: 'auto',
      prompt: 'friendly clay cat',
      reference_image_urls: ['https://storage.storymee.com/ref.webp'],
      config: { model_id: 'image-model' },
    })
  })

  it('keeps i2v mode and multiple references in Hub video requests', async () => {
    let body: Record<string, unknown> = {}
    vi.stubGlobal('fetch', vi.fn(async (input, init) => {
      if (String(input).endsWith('/v1/media/video')) {
        body = JSON.parse(String(init?.body)) as Record<string, unknown>
        return json({ queue_id: 'video-job-1' })
      }
      return json({
        task: {
          metadata: { state: 'SUCCEEDED' },
          media_urls: ['https://storage.storymee.com/video.mp4'],
        },
      })
    }))

    const result = await createStoryMeeHubMediaClient().models.generateVideo({
      prompt: 'friendly clay cat waves',
      modelId: 'video-model',
      mode: 'i2v',
      startImages: [
        'https://storage.storymee.com/1.webp',
        'https://storage.storymee.com/2.webp',
      ],
    })

    expect(result.result).toBe('https://storage.storymee.com/video.mp4')
    expect(body).toMatchObject({
      provider: 'auto',
      reference_image_urls: [
        'https://storage.storymee.com/1.webp',
        'https://storage.storymee.com/2.webp',
      ],
      config: { generator_mode: 'i2v' },
    })
  })
})
