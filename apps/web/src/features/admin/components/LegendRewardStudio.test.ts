import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { assetDimensionLabel, assetSpecs, compareLevelUnlockRules, isAssetDimensionValid, isVisibleOnPublishedMap, studioAchievementCode, studioAssetPreviewKind } from './LegendRewardStudio'

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
  it('uses the approved avatar and full-page profile background templates', () => {
    expect(assetSpecs.avatar).toMatchObject({ width: 1200, height: 1200 })
    expect(assetSpecs.background).toMatchObject({
      width: 1500,
      height: 400,
      formats: ['image/webp', 'image/jpeg', 'image/png'],
      maxMb: 3,
    })
    expect(assetSpecs.effect).toMatchObject({ width: 1200, height: 1200 })
    expect(assetSpecs.theme).toMatchObject({
      width: 2540,
      height: 1300,
      formats: ['image/png', 'image/svg+xml'],
      maxMb: 4,
    })
  })

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

describe('Legend Reward Studio level ordering', () => {
  it('sorts rewards by level within a level band', () => {
    const items = [
      { name: 'Level 9', unlockRule: { value: '9' } },
      { name: 'Level 2', unlockRule: { value: '2' } },
      { name: 'Level 5', unlockRule: { value: 5 } },
    ]

    expect(items.sort(compareLevelUnlockRules).map((item) => item.unlockRule.value)).toEqual(['2', 5, '9'])
  })

  it('uses the Vietnamese name as a stable tie-breaker for the same level', () => {
    const items = [
      { name: 'Quà B', unlockRule: { value: 3 } },
      { name: 'Quà A', unlockRule: { value: 3 } },
    ]

    expect(items.sort(compareLevelUnlockRules).map((item) => item.name)).toEqual(['Quà A', 'Quà B'])
  })
})

describe('Legend Reward Studio map lifecycle actions', () => {
  it('keeps drafts out of the published map and manages them in version history', () => {
    expect(isVisibleOnPublishedMap({ source: 'studio', status: 'published' })).toBe(true)
    expect(isVisibleOnPublishedMap({ source: 'studio', status: 'draft' })).toBe(false)
    expect(isVisibleOnPublishedMap({ source: 'studio', status: 'review' })).toBe(false)
    expect(isVisibleOnPublishedMap({ source: 'studio', status: 'retired' })).toBe(false)
    expect(isVisibleOnPublishedMap({ source: 'legacy', status: 'published' })).toBe(true)

    const source = fs.readFileSync(path.join(process.cwd(), 'src/features/admin/components/LegendRewardStudio.tsx'), 'utf8')

    expect(source).toContain('Phát hành nháp')
    expect(source).toContain('Lịch sử upload & phiên bản')
    expect(source).toContain('Archive trong 3 ngày')
    expect(source).not.toContain('legendStudioApi.remove(item.id)')
  })
})

describe('Runtime Achievement migration', () => {
  it('normalizes the runtime namespace to a Studio-safe code', () => {
    expect(studioAchievementCode('achievement.weekly-goals')).toBe('weekly-goals')
    expect(studioAchievementCode('weekly-goals')).toBe('weekly-goals')
  })
})
