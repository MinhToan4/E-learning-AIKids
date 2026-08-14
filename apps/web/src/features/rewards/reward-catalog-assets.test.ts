import { describe, expect, it } from 'vitest'
import {
  resolveCatalogRewardAsset,
  selectRewardAssetReference,
} from './reward-catalog-assets'

describe('reward catalog asset contract', () => {
  it('prefers an explicit usage variant over primary and shorthand', () => {
    expect(selectRewardAssetReference({
      assetId: 'frame-cloud-summer',
      primary: { assetId: 'frame-cloud-summer' },
      thumbnail: {
        assetId: 'frame-cloud-summer',
        variant: 'thumbnail',
      },
    }, 'thumbnail')).toEqual({
      assetId: 'frame-cloud-summer',
      variant: 'thumbnail',
    })
  })

  it('supports assetId shorthand without coupling to a URL', () => {
    expect(selectRewardAssetReference({
      assetId: 'companion-paco-blue',
    }, 'preview')).toEqual({
      assetId: 'companion-paco-blue',
      variant: 'primary',
    })
  })

  it('fails closed instead of deriving a URL from the reward id', () => {
    expect(resolveCatalogRewardAsset({
      id: 'frame-cloud-summer',
    })).toBeUndefined()
  })

  it('prefers a published CMS Storage URL over bundled asset references', () => {
    expect(resolveCatalogRewardAsset({
      id: 'title-first-light',
      assets: {
        imageUrl: 'https://storage.storymee.com/content-media/title-first-light.png',
        assetId: 'title-common',
      },
    })).toBe('https://storage.storymee.com/content-media/title-first-light.png')
  })

  it('rejects direct catalog URLs outside StoryMee Storage', () => {
    expect(resolveCatalogRewardAsset({
      id: 'title-first-light',
      assets: { imageUrl: 'https://tracker.example/title-first-light.png' },
    })).toBeUndefined()
  })

  it('preserves immutable release and format overrides per catalog asset', () => {
    expect(selectRewardAssetReference({
      preview: {
        assetId: 'frame-level-15',
        release: '2026.08.01',
        format: 'png',
      },
    }, 'preview')).toEqual({
      assetId: 'frame-level-15',
      release: '2026.08.01',
      format: 'png',
    })
  })
})
