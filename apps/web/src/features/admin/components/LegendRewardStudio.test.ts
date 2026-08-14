import { describe, expect, it } from 'vitest'
import { studioAssetPreviewKind } from './LegendRewardStudio'

describe('Legend Reward Studio asset preview', () => {
  it.each([
    ['https://storage.storymee.com/content-media/frame.webp?version=2', 'image'],
    ['https://storage.storymee.com/content-media/effect.webm', 'video'],
    ['https://storage.storymee.com/content-media/theme.json?version=2', 'config'],
  ] as const)('renders %s as %s', (url, expected) => {
    expect(studioAssetPreviewKind(url)).toBe(expected)
  })
})
