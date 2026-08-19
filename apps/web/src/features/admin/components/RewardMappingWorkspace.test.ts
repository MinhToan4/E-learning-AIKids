import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { compatibilityMappings, rewardRequirementSentence } from './RewardMappingWorkspace'
import type { StudioItem } from './LegendRewardStudio'

describe('Reward Mapping requirement summaries', () => {
  it('explains level mappings in plain Vietnamese', () => {
    expect(rewardRequirementSentence({
      requirement: { type: 'xp_level', value: 15 },
      rewardIds: ['frame-cloud', 'title-explorer'],
    })).toBe('Khi học sinh đạt Level 15, trao 2 phần quà.')
  })

  it('explains action and Storybook mappings', () => {
    expect(rewardRequirementSentence({
      requirement: { type: 'action', metric: 'lessons_completed', operator: 'gte', value: 10 },
      rewardIds: ['effect-light'],
    })).toBe('Khi lessons_completed ≥ 10, trao 1 phần quà.')
    expect(rewardRequirementSentence({
      requirement: { type: 'storybook_sticker', chapter: 'P03', value: 'P03-05' },
      rewardIds: ['background-storybook'],
    })).toBe('Khi nhận sticker P03-05 thuộc P03, trao 1 phần quà.')
  })
})

describe('Reward Mapping lifecycle controls', () => {
  it('keeps lifecycle actions in a compact menu and supports both viewing directions', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/features/admin/components/RewardMappingWorkspace.tsx'), 'utf8')

    expect(source).toContain('Mốc → Phần quà')
    expect(source).toContain('Phần quà → Điều kiện')
    expect(source).toContain('Thao tác')
    expect(source).toContain('Xóa bản nháp')
    expect(source).toContain('Lưu & phát hành')
  })
})

describe('Reward Mapping compatibility mode', () => {
  it('derives real mappings from Studio reward unlock rules', () => {
    const base = {
      contentType: 'reward', source: 'studio', status: 'draft', version: 1,
      name: 'Quà', description: '', kind: 'title', rarity: 'common', assets: {}, displayConfig: {}, content: {},
    } as const
    const mappings = compatibilityMappings([
      { ...base, id: 'reward-1', code: 'title-one', unlockRule: { type: 'xp_level', value: 5 } },
      { ...base, id: 'reward-2', code: 'frame-two', unlockRule: { type: 'xp_level', value: 5 } },
      { ...base, id: 'reward-3', code: 'effect-three', unlockRule: { type: 'unconfigured', value: '' } },
    ] as StudioItem[])

    expect(mappings).toHaveLength(1)
    expect(mappings[0]).toMatchObject({
      status: 'draft',
      requirement: { type: 'xp_level', value: 5 },
      rewardIds: ['title-one', 'frame-two'],
      compatItemIds: ['reward-1', 'reward-2'],
    })
  })
})
