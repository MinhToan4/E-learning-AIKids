import { describe, expect, it } from 'vitest'
import {
  DEFAULT_VIDTORY_BASE_URL,
  DEFAULT_VIDTORY_ROUTING,
  modelWeightPercents,
  pickWeightedModel,
  resolveVideoMode,
  validateVidtoryRouting,
} from './vidtory-routing.js'

describe('vidtory routing', () => {
  it('validates default config', () => {
    const v = validateVidtoryRouting(DEFAULT_VIDTORY_ROUTING)
    expect(v.ok).toBe(true)
  })

  it('rejects models with zero total weight', () => {
    const v = validateVidtoryRouting({
      image: {
        aspectRatio: 'IMAGE_ASPECT_RATIO_LANDSCAPE',
        resolution: '1K',
        models: [{ modelId: 'a', weight: 0 }],
      },
      video: DEFAULT_VIDTORY_ROUTING.video,
    })
    expect(v.ok).toBe(false)
  })

  it('picks by weight across modelIds (40/60)', () => {
    const models = [
      { modelId: 'cheap', weight: 40 },
      { modelId: 'quality', weight: 60 },
    ]
    expect(pickWeightedModel(models, () => 0).modelId).toBe('cheap')
    expect(pickWeightedModel(models, () => 0.39).modelId).toBe('cheap')
    expect(pickWeightedModel(models, () => 0.4).modelId).toBe('quality')
    expect(pickWeightedModel(models, () => 0.99).modelId).toBe('quality')
  })

  it('computes percents for modelIds only', () => {
    const p = modelWeightPercents([
      { modelId: 'a', weight: 40 },
      { modelId: 'b', weight: 60 },
    ])
    expect(p[0]!.percent).toBe(40)
    expect(p[1]!.percent).toBe(60)
  })

  it('accepts multi-modelId pool + baseURL', () => {
    const v = validateVidtoryRouting({
      baseURL: 'https://bapi.vidtory.net/',
      image: {
        aspectRatio: 'IMAGE_ASPECT_RATIO_SQUARE',
        resolution: '2K',
        models: [
          { modelId: 'gemini-3.1-flash-image-preview', weight: 40, label: 'A' },
          { modelId: 'premium-image', weight: 60, label: 'B' },
        ],
      },
      video: {
        aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
        duration: 8,
        models: [
          { modelId: 'veo-3.1-fast-generate-001', weight: 70 },
          { modelId: 'veo-premium', weight: 30 },
        ],
      },
    })
    expect(v.ok).toBe(true)
    if (v.ok) {
      expect(v.config.baseURL).toBe(DEFAULT_VIDTORY_BASE_URL)
      expect(v.config.image.models).toHaveLength(2)
      expect(v.config.video.models).toHaveLength(2)
    }
  })

  it('default video pool is modelId weights only (not t2v/i2v split)', () => {
    expect(DEFAULT_VIDTORY_ROUTING.baseURL).toBe(DEFAULT_VIDTORY_BASE_URL)
    expect(DEFAULT_VIDTORY_ROUTING.video.models).toHaveLength(1)
    expect(DEFAULT_VIDTORY_ROUTING.video.models[0]!.modelId).toBe(
      'veo-3.1-fast-generate-001',
    )
  })

  it('resolveVideoMode is situational: ref → i2v, text → t2v', () => {
    expect(resolveVideoMode(true)).toBe('i2v')
    expect(resolveVideoMode(false)).toBe('t2v')
  })
})
