import { describe, expect, it } from 'vitest'
import { buildRewardConfigMap, type RewardConfigItem } from './reward-config-map'

const reward: RewardConfigItem = {
  id: 'reward-1', contentType: 'reward', code: 'frame-sun', version: 1,
  status: 'published', name: 'Khung mặt trời', kind: 'frame',
  unlockRule: { type: 'xp_level', value: 5 }, content: {},
}

describe('reward configuration map', () => {
  it('maps valid level rewards without issues', () => {
    const [row] = buildRewardConfigMap([reward])
    expect(row.channel).toBe('level')
    expect(row.trigger).toBe('Đạt level 5')
    expect(row.issues).toEqual([])
  })

  it('reports broken event dates and reward references', () => {
    const event: RewardConfigItem = {
      ...reward, id: 'event-1', code: 'summer', contentType: 'event', name: 'Mùa hè',
      unlockRule: { type: 'event', value: 'summer' },
      content: { startsAt: '2026-08-20', endsAt: '2026-08-10', rewardIds: ['missing'] },
    }
    const row = buildRewardConfigMap([reward, event])[1]
    expect(row.issues.map((issue) => issue.message)).toEqual(expect.arrayContaining([
      'Thời gian kết thúc phải sau bắt đầu.',
      'Reward liên kết không tồn tại: missing.',
    ]))
  })

  it('checks chapter action rules and boss structure', () => {
    const chapter: RewardConfigItem = {
      ...reward, id: 'chapter-1', code: 'P09', contentType: 'chapter', name: 'Trang 9',
      unlockRule: { type: 'storybook_sticker', value: 'P09-S9' },
      content: { rewardId: 'frame-sun', stickers: [{ boss: false, unlockRule: { metric: 'unknown', operator: 'eq', target: 0 } }] },
    }
    const row = buildRewardConfigMap([reward, chapter])[1]
    expect(row.issues.some((issue) => issue.message.includes('đúng 9 sticker'))).toBe(true)
    expect(row.issues.some((issue) => issue.message.includes('boss sticker'))).toBe(true)
    expect(row.issues.some((issue) => issue.message.includes('không được hỗ trợ'))).toBe(true)
  })

  it('treats duplicate storybook triggers as an intentional reward bundle note', () => {
    const titles = ['storybook-title-p01', 'title-gate-keeper'].map((code, index): RewardConfigItem => ({
      ...reward,
      id: `story-${index}`,
      code,
      name: code,
      unlockRule: { type: 'storybook_sticker', value: 'P01-S9' },
    }))
    const rows = buildRewardConfigMap(titles)
    expect(rows.every((row) => row.issues.some((issue) => issue.message.includes('2 phần thưởng')))).toBe(true)
    expect(rows.every((row) => row.issues.every((issue) => issue.severity === 'info'))).toBe(true)
  })

  it('does not require a separate reward output for an achievement badge', () => {
    const achievement: RewardConfigItem = {
      ...reward, id: 'achievement-1', code: 'perfect-lessons', contentType: 'achievement',
      name: 'Bài học hoàn hảo', source: 'runtime',
      unlockRule: { type: 'action', metric: 'perfect_lessons' },
      content: { milestones: [{ threshold: 1, points: 10 }] },
    }
    const [row] = buildRewardConfigMap([achievement])
    expect(row.issues).toEqual([{ severity: 'info', message: 'Achievement runtime đang hoạt động; có thể đưa vào Studio khi cần chỉnh sửa.' }])
  })
})
