import { describe, expect, it } from 'vitest'
import { safeChapterColors, safeStorybookAssetUrl, uniqueRewardIds, uniqueStorybookIds } from './storybook-contract'

describe('storybook Hub and storage contract', () => {
  it('deduplicates and rejects malformed inventory identifiers', () => {
    expect(uniqueStorybookIds(['P01-S1', 'P01-S1', '', 'bad', null])).toEqual(['P01-S1'])
    expect(uniqueRewardIds(['frame-rainbow', 'frame-rainbow', '../secret', null])).toEqual(['frame-rainbow'])
  })

  it('allows HTTPS/same-origin assets and rejects executable or insecure URLs', () => {
    expect(safeStorybookAssetUrl('/assets/storybook/p01.webp')).toBe('/assets/storybook/p01.webp')
    expect(safeStorybookAssetUrl('https://storage.storymee.com/p01.webp')).toBe('https://storage.storymee.com/p01.webp')
    expect(safeStorybookAssetUrl('javascript:alert(1)')).toBeUndefined()
    expect(safeStorybookAssetUrl('http://tracker.example/p01.webp')).toBeUndefined()
  })

  it('fails closed for unsafe chapter colors', () => {
    expect(safeChapterColors(['#112233', '#aabbcc'], ['#000000', '#ffffff'])).toEqual(['#112233', '#aabbcc'])
    expect(safeChapterColors(['red', 'url(x)'], ['#000000', '#ffffff'])).toEqual(['#000000', '#ffffff'])
  })
})
