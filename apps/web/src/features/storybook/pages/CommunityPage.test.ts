import { describe, expect, it } from 'vitest'
import { COMMUNITY_DESTINATIONS } from './CommunityPage'

describe('Community island destinations', () => {
  it('keeps the three social purposes as separate illustrated destinations', () => {
    expect(COMMUNITY_DESTINATIONS.map(({ id, label }) => ({ id, label }))).toEqual([
      { id: 'gallery', label: 'Triển lãm' },
      { id: 'leaderboard', label: 'Vinh danh' },
      { id: 'interaction', label: 'Tương tác' },
    ])
    expect(COMMUNITY_DESTINATIONS.every((item) => item.emoji.length > 0)).toBe(true)
    expect(new Set(COMMUNITY_DESTINATIONS.map((item) => item.artwork)).size).toBe(3)
  })
})
