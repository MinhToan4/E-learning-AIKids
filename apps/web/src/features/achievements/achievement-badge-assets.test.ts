import { describe, expect, it } from 'vitest'
import type { AchievementRow } from '@/shared/lib/api'
import { achievementBadgeAsset } from './achievement-badge-assets'

const achievement = (overrides: Partial<AchievementRow>): AchievementRow => ({
  type: 'unknown',
  title: 'Danh hiệu',
  description: 'Mô tả',
  icon: '🏅',
  requiredValue: 1,
  unlocked: false,
  unlockedAt: null,
  ...overrides,
})

describe('achievement badge assets', () => {
  it('prefers approved backend media and rejects arbitrary remote hosts', () => {
    const imageUrl = 'https://storage.storymee.com/reward-assets/achievements/2026.08.14/v2/lessons/level-1.png'
    expect(achievementBadgeAsset(achievement({ imageUrl }))).toBe(imageUrl)
    expect(achievementBadgeAsset(achievement({ imageUrl: 'https://example.com/untrusted.png' }))).toBeUndefined()
  })

  it('resolves a bundled reward asset id and fails closed for unknown ids', () => {
    expect(achievementBadgeAsset(achievement({ rewardAssetId: 'badge-title-first-light' })))
      .toMatch(/badge-title-first-light\.png/)
    expect(achievementBadgeAsset(achievement({ rewardAssetId: 'badge-not-published' })))
      .toBeUndefined()
  })

  it('resolves published V2 asset ids without treating the frontend as the catalog', () => {
    expect(achievementBadgeAsset(achievement({ rewardAssetId: 'achievement-lessons-level-6' })))
      .toBe('/assets/designer/achievements/v2/lessons/level-6.png')
  })

  it('maps the shipped achievement series and milestones to distinct artwork', () => {
    expect(achievementBadgeAsset(achievement({ type: 'lessons_completed', requiredValue: 1 })))
      .toBe('/assets/designer/achievements/v2/lessons/level-1.png')
    expect(achievementBadgeAsset(achievement({ type: 'stars', category: 'stars', requiredValue: 50 })))
      .toBe('/assets/designer/achievements/v2/stars/level-2.png')
    expect(achievementBadgeAsset(achievement({ type: 'streak', category: 'habit', requiredValue: 7 })))
      .toBe('/assets/designer/achievements/v2/streak/level-2.png')
    expect(achievementBadgeAsset(achievement({ type: 'xp', requiredValue: 500 })))
      .toBe('/assets/designer/achievements/v2/xp/level-1.png')
  })
})
