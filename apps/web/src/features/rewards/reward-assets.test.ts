import { describe, expect, it } from 'vitest'
import {
  getGeneratedRewardAssetUrl,
  getResolvedRewardAssetUrl,
  getVerifiedStaticRewardAssetUrl,
  getLevelRewardNumber,
  getSharedLevelRewardAssetId,
} from './reward-assets'

describe('dynamic level reward assets', () => {
  it('resolves the equipped level companion to its published shared asset', () => {
    expect(getLevelRewardNumber('companion-level-71', 'companion')).toBe(71)
    expect(getSharedLevelRewardAssetId('companion-level-71')).toBe('companion-paco-sea')
  })

  it('resolves every dynamic visual reward kind', () => {
    expect(getSharedLevelRewardAssetId('background-level-71')).toBe('background-community-legend')
    expect(getSharedLevelRewardAssetId('theme-level-71')).toBe('background-community-legend')
    expect(getSharedLevelRewardAssetId('effect-level-71')).toBe('effect-galaxy')
    expect(getSharedLevelRewardAssetId('title-level-71')).toBe('title-common')
  })

  it('leaves static catalog rewards untouched', () => {
    expect(getSharedLevelRewardAssetId('companion-paco-cloud')).toBeUndefined()
  })

  it('uses transparent local artwork for the four curated companions', () => {
    expect(getGeneratedRewardAssetUrl('companion-paco-cloud')).toBe('/assets/designer/companions/paco-cloud-companion.png')
    expect(getGeneratedRewardAssetUrl('companion-paco-leaf')).toBe('/assets/designer/companions/paco-leaf-companion.png')
    expect(getGeneratedRewardAssetUrl('companion-paco-sea')).toBe('/assets/designer/companions/paco-sea-companion.png')
    expect(getGeneratedRewardAssetUrl('companion-paco-fire')).toBe('/assets/designer/companions/paco-fire-companion.png')
  })

  it('resolves the legendary level 100 frame from bundled artwork', () => {
    expect(getResolvedRewardAssetUrl('frame-level-100')).toMatch(/frame-level-100\.webp/)
  })

  it('prefers the newly exported local SVG frame artwork', () => {
    expect(getResolvedRewardAssetUrl('frame-level-15')).toMatch(/frame-level-15\.svg/)
    expect(getResolvedRewardAssetUrl('frame-language-kingdom')).toMatch(/frame-language-kingdom\.svg/)
    expect(getResolvedRewardAssetUrl('frame-creative-arena')).toMatch(/frame-creative-arena\.svg/)
  })

  it('uses lightweight WebP previews for level-frame collection cards', () => {
    expect(getResolvedRewardAssetUrl('frame-level-15', 'thumbnail')).toMatch(
      /frame-level-15--preview\.webp/,
    )
    expect(getResolvedRewardAssetUrl('frame-level-75', 'preview')).toMatch(
      /frame-level-75--preview\.webp/,
    )
  })

  it('does not invent broken URLs for icon-only static rewards', () => {
    window.__AIKIDS_RUNTIME_CONFIG__ = {
      rewardAssetBaseUrl: 'https://cdn.example.com',
      rewardAssetRelease: '2026.07.31',
      rewardAssetFormat: 'svg',
    }
    expect(getVerifiedStaticRewardAssetUrl('background-ai-gate')).toBe(
      'https://cdn.example.com/rewards/2026.07.31/background-ai-gate.svg',
    )
    expect(getVerifiedStaticRewardAssetUrl('title-explorer')).toBeUndefined()
    expect(getVerifiedStaticRewardAssetUrl('ticket-creative-challenge')).toBeUndefined()
    delete window.__AIKIDS_RUNTIME_CONFIG__
  })

  it('resolves designer assets directly to local WebP files and thumbnails', () => {
    expect(getGeneratedRewardAssetUrl('frame-galaxy', 'thumbnail')).toBe(
      '/assets/rewards/frames/frame-galaxy--thumb.webp',
    )
    expect(getGeneratedRewardAssetUrl('frame-galaxy', 'primary')).toBe(
      '/assets/rewards/frames/frame-galaxy.webp',
    )
    expect(getGeneratedRewardAssetUrl('background-ai-gate', 'thumbnail')).toBe(
      '/assets/rewards/backgrounds/background-ai-gate--thumb.webp',
    )
    expect(getGeneratedRewardAssetUrl('background-ocean-artist', 'thumbnail')).toBe(
      '/assets/rewards/backgrounds/background-ocean-artist--thumb.webp',
    )
    expect(getGeneratedRewardAssetUrl('theme-paco-workshop', 'thumbnail')).toBe(
      '/assets/rewards/themes/theme-paco-workshop--thumb.webp',
    )
    expect(getGeneratedRewardAssetUrl('background-forest-guardian', 'thumbnail')).toBe(
      '/assets/rewards/backgrounds/background-forest-guardian--thumb.webp',
    )
    expect(getGeneratedRewardAssetUrl('theme-community-legend', 'thumbnail')).toBe(
      '/assets/rewards/themes/theme-community-legend--thumb.webp',
    )
  })
})
