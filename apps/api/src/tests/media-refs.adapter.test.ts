/**
 * Multi-ref mapping + media upload tagging (shipped adapter paths).
 */
import { afterEach, describe, expect, it } from 'vitest'
import { config as loadEnv } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(__dirname, '../../.env') })
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-secret-aikids-creator-academy-32chars'

describe('media multi-ref + upload metadata', () => {
  afterEach(async () => {
    const { setVidtoryClientFactory, setVidtoryRoutingOverride } = await import(
      '../infrastructure/generation/vidtory.adapter.js'
    )
    const { setVidtoryMediaClientFactory } = await import(
      '../infrastructure/generation/vidtory.media.js'
    )
    setVidtoryClientFactory(null)
    setVidtoryRoutingOverride(null)
    setVidtoryMediaClientFactory(null)
  })

  it('passes startImages when N>=2 refUrls on image gen', async () => {
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
        models: [{ modelId: 'img-model', weight: 100 }],
      },
      video: {
        aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
        duration: 6,
        models: [{ modelId: 'veo', weight: 100 }],
      },
    })

    let seen: { refImageUrl?: string; startImages?: string[] } = {}
    setVidtoryClientFactory(() => ({
      models: {
        generateImage: async (p) => {
          seen = { refImageUrl: p.refImageUrl, startImages: p.startImages }
          return { id: 'i1', result: 'https://cdn.example.com/out.png' }
        },
        generateVideo: async () => ({ result: 'https://cdn.example.com/v.mp4' }),
      },
    }))

    const r = await generatePracticeImage('world', 's', {
      refUrls: ['https://a/1.png', 'https://a/2.png'],
    })
    expect(r.refStrategy).toBe('startImages')
    expect(seen.startImages).toEqual(['https://a/1.png', 'https://a/2.png'])
    expect(seen.refImageUrl).toBe('https://a/1.png')
    expect(r.storageBackend).toBe('vidtory_cdn')
  })

  it('uploadStudentMedia tags aikids_user_id via media.upload', async () => {
    const { setVidtoryMediaClientFactory, uploadStudentMedia } = await import(
      '../infrastructure/generation/vidtory.media.js'
    )
    const { setVidtoryRoutingOverride } = await import(
      '../infrastructure/generation/vidtory.adapter.js'
    )

    // Ensure getVidtoryApiKey path: inject media client only after key exists
    // Force factory so we don't need real key for client, but uploadStudentMedia
    // still requires getVidtoryApiKey — set env key for test
    process.env.VIDTORY_API_KEY = 'vidtory_test_key_for_upload_unit'
    setVidtoryRoutingOverride({
      baseURL: 'https://bapi.vidtory.net',
      image: {
        aspectRatio: 'IMAGE_ASPECT_RATIO_LANDSCAPE',
        resolution: '1K',
        models: [{ modelId: 'm', weight: 100 }],
      },
      video: {
        aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
        duration: 6,
        models: [{ modelId: 'v', weight: 100 }],
      },
    })

    let seenMeta: Record<string, unknown> | undefined
    setVidtoryMediaClientFactory(() => ({
      media: {
        upload: async (params) => {
          seenMeta = params.metadata as Record<string, unknown>
          return {
            id: 'media-uuid-1',
            url: 'https://bapi.vidtory.net/files/x.png',
            fileName: params.fileName ?? 'x.png',
            fileType: 'image/png',
            fileSize: 12,
            metadata: params.metadata,
          }
        },
      },
    }))

    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    )
    const up = await uploadStudentMedia({
      userId: 'student-uuid-abc',
      file: png,
      fileName: 'dot.png',
      mime: 'image/png',
      purpose: 'i2v_ref',
      questId: 'l1-k1-q1',
    })
    expect(up.mediaId).toBe('media-uuid-1')
    expect(up.storageBackend).toBe('vidtory_cdn')
    expect(seenMeta?.aikids_user_id).toBe('student-uuid-abc')
    expect(seenMeta?.aikids_purpose).toBe('i2v_ref')
    expect(seenMeta?.aikids_quest_id).toBe('l1-k1-q1')
    expect(seenMeta?.aikids_tenant).toBe('aikids')
  })

  it('isCourseCreatedAsset blocks free upload purposes', async () => {
    const { isCourseCreatedAsset } = await import('@aikids/domain')
    expect(
      isCourseCreatedAsset({
        questId: null,
        type: 'panel',
        meta: { purpose: 'backpack_upload' },
      }),
    ).toBe(false)
    expect(
      isCourseCreatedAsset({
        questId: 'q1',
        type: 'panel',
        meta: { generationMode: 'vidtory' },
      }),
    ).toBe(true)
  })
})
