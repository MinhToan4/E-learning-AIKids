/**
 * Drives the shipped Vidtory adapter (not a reimplementation).
 */
import { afterEach, describe, expect, it } from 'vitest'
import { config as loadEnv } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const apiRoot = resolve(__dirname, '../..')
loadEnv({ path: resolve(apiRoot, '.env') })

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-secret-aikids-creator-academy-32chars'

describe('vidtory adapter', () => {
  afterEach(async () => {
    const { setVidtoryClientFactory, setVidtoryRoutingOverride } = await import(
      '../infrastructure/generation/vidtory.adapter.js'
    )
    setVidtoryClientFactory(null)
    setVidtoryRoutingOverride(null)
  })

  it('falls back to mock when no key and no client factory', async () => {
    const { generatePracticeImage, setVidtoryClientFactory } = await import(
      '../infrastructure/generation/vidtory.adapter.js'
    )
    setVidtoryClientFactory(null)
    // forceMock bypasses env/DB keys so this test is hermetic
    const result = await generatePracticeImage('mèo clay mềm', 'seed-1', {
      forceMock: true,
    })
    expect(result.source).toBe('mock')
    expect(result.imageUrl).toContain('data:image/svg')
    expect(result.mode).toBe('mock')
  })

  it('uses injected Vidtory client when factory is set', async () => {
    const {
      generatePracticeImage,
      setVidtoryClientFactory,
      setVidtoryRoutingOverride,
    } = await import('../infrastructure/generation/vidtory.adapter.js')
    setVidtoryRoutingOverride({
      baseURL: 'https://bapi.vidtory.net',
      image: {
        aspectRatio: 'IMAGE_ASPECT_RATIO_LANDSCAPE',
        resolution: '1K',
        models: [
          { modelId: 'model-a', weight: 0 },
          { modelId: 'model-b-quality', weight: 100 },
        ],
      },
      video: {
        aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
        duration: 6,
        models: [
          { modelId: 'veo-fast', weight: 40 },
          { modelId: 'veo-premium', weight: 60 },
        ],
      },
    })
    let seenModelId: string | undefined
    setVidtoryClientFactory(() => ({
      models: {
        generateImage: async (params) => {
          seenModelId = params.modelId
          return {
            id: 'job-1',
            result: 'https://cdn.example.com/clay.png',
          }
        },
        generateVideo: async () => ({
          id: 'job-v',
          result: 'https://cdn.example.com/clip.mp4',
        }),
      },
    }))

    const result = await generatePracticeImage('rừng kẹo clay', 'seed-2')
    expect(result.source).toBe('vidtory')
    expect(result.mode).toBe('vidtory')
    expect(result.imageUrl).toBe('https://cdn.example.com/clay.png')
    expect(result.id).toBe('job-1')
    expect(seenModelId).toBe('model-b-quality')
    expect(result.modelId).toBe('model-b-quality')
    setVidtoryRoutingOverride(null)
  })

  it('generatePracticeVideo uses injected client and falls back safely', async () => {
    const {
      generatePracticeVideo,
      setVidtoryClientFactory,
    } = await import('../infrastructure/generation/vidtory.adapter.js')

    setVidtoryClientFactory(() => ({
      models: {
        generateImage: async () => ({ result: 'https://cdn.example.com/x.png' }),
        generateVideo: async () => ({
          id: 'job-v',
          result: 'https://cdn.example.com/clip.mp4',
        }),
      },
    }))
    const ok = await generatePracticeVideo('mèo nhảy clay', 'seed-v')
    expect(ok.source).toBe('vidtory')
    expect(ok.videoUrl).toBe('https://cdn.example.com/clip.mp4')

    setVidtoryClientFactory(null)
    const mock = await generatePracticeVideo('clip', 'seed-m', { forceMock: true })
    expect(mock.source).toBe('mock')
    expect(mock.mode).toBe('mock')
  })

  it('video mode is situational: text→t2v, ref image→i2v (not weight split)', async () => {
    const {
      generatePracticeVideo,
      setVidtoryClientFactory,
      setVidtoryRoutingOverride,
    } = await import('../infrastructure/generation/vidtory.adapter.js')

    setVidtoryRoutingOverride({
      baseURL: 'https://bapi.vidtory.net',
      image: {
        aspectRatio: 'IMAGE_ASPECT_RATIO_LANDSCAPE',
        resolution: '1K',
        models: [{ modelId: 'img', weight: 100 }],
      },
      video: {
        aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
        duration: 6,
        models: [
          { modelId: 'veo-a', weight: 40 },
          { modelId: 'veo-b', weight: 60 },
        ],
      },
    })

    const seen: string[] = []
    setVidtoryClientFactory(() => ({
      models: {
        generateImage: async () => ({ result: 'x' }),
        generateVideo: async (params) => {
          seen.push(params.mode ?? '')
          return { id: 'v', result: 'https://cdn.example.com/v.mp4' }
        },
      },
    }))

    const t2v = await generatePracticeVideo('clip text only', 's1')
    expect(t2v.videoMode).toBe('t2v')
    expect(seen[0]).toBe('t2v')

    const i2v = await generatePracticeVideo('clip with still', 's2', {
      refImageUrl: 'https://cdn.example.com/still.png',
    })
    expect(i2v.videoMode).toBe('i2v')
    expect(seen[1]).toBe('i2v')
  })
})
