import { describe, expect, it } from 'vitest'
import {
  createRewardAssetAddress,
  isRewardAssetId,
  resolveRemoteRewardAssetUrl,
} from './reward-asset-address'

describe('reward asset addressing', () => {
  it('creates a stable logical address', () => {
    expect(createRewardAssetAddress('frame-cloud-summer'))
      .toBe('reward://frame-cloud-summer/primary')
    expect(createRewardAssetAddress('frame-cloud-summer', 'plaque'))
      .toBe('reward://frame-cloud-summer/plaque')
  })

  it('rejects IDs that could become paths', () => {
    expect(isRewardAssetId('frame-cloud-summer')).toBe(true)
    expect(isRewardAssetId('../secret')).toBe(false)
    expect(isRewardAssetId('Khung Mây')).toBe(false)
    expect(() => createRewardAssetAddress('../secret')).toThrow()
  })

  it('resolves an immutable release URL for CDN or VPS hosting', () => {
    expect(resolveRemoteRewardAssetUrl('frame-cloud-summer', 'primary', {
      baseUrl: 'https://cdn.aikids.example/aikids/',
      release: '2026.08.0',
      format: 'webp',
    })).toBe(
      'https://cdn.aikids.example/aikids/rewards/2026.08.0/frame-cloud-summer.webp',
    )

    expect(resolveRemoteRewardAssetUrl('frame-cloud-summer', 'plaque', {
      baseUrl: 'https://cdn.aikids.example/aikids',
      release: '2026.08.0',
    })).toBe(
      'https://cdn.aikids.example/aikids/rewards/2026.08.0/frame-cloud-summer--plaque.webp',
    )
  })

  it('does not resolve invalid IDs or releases', () => {
    const config = { baseUrl: 'https://cdn.example', release: '../latest' }
    expect(resolveRemoteRewardAssetUrl('../secret', 'primary', config)).toBeUndefined()
    expect(resolveRemoteRewardAssetUrl('frame-cloud-summer', 'primary', config))
      .toBeUndefined()
  })
})
