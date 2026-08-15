import { describe, expect, it } from 'vitest'
import { assetDimensionLabel, isAssetDimensionValid, studioAssetPreviewKind } from './LegendRewardStudio'

describe('Legend Reward Studio asset preview', () => {
  it.each([
    ['https://storage.storymee.com/content-media/frame.webp?version=2', 'image'],
    ['https://storage.storymee.com/content-media/effect.webm', 'video'],
    ['https://storage.storymee.com/content-media/theme.json?version=2', 'config'],
  ] as const)('renders %s as %s', (url, expected) => {
    expect(studioAssetPreviewKind(url)).toBe(expected)
  })
})

describe('Legend Reward Studio dimension rules', () => {
  it('keeps title width fixed while allowing any positive height', () => {
    const titleSpec = { width: 1200, height: 320, flexibleHeight: true }

    expect(assetDimensionLabel(titleSpec)).toBe('1200px ngang × cao tự do')
    expect(isAssetDimensionValid(titleSpec, 1200, 180)).toBe(true)
    expect(isAssetDimensionValid(titleSpec, 1200, 640)).toBe(true)
    expect(isAssetDimensionValid(titleSpec, 1199, 320)).toBe(false)
  })

  it('keeps both dimensions fixed for other assets', () => {
    const frameSpec = { width: 1024, height: 1024 }

    expect(isAssetDimensionValid(frameSpec, 1024, 1024)).toBe(true)
    expect(isAssetDimensionValid(frameSpec, 1024, 900)).toBe(false)
  })
})
