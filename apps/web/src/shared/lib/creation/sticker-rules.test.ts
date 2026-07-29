import { describe, expect, it } from 'vitest'
import { evaluateTrigger, type StickerSnapshot } from './sticker-rules.js'

const snapshot: StickerSnapshot = {
  learning: {
    quests_completed: 4, quests_perfect: 1, streak_days: 3,
    streak_longest: 7, xp_total: 500, level: 2,
    video_watched_count: 1, ebook_read_count: 0,
  },
  creative: {
    projects_created: 2, stories_created: 1,
    self_character_created: true, remix_count: 0, collab_count: 0,
    ebook_generated: false,
  },
  social: {
    reactions_given: 10, reactions_received: 5, paco_picks: 1,
    paco_picks_given: 0, shares_done: 1, challenges_completed: 0,
    weekly_prompts_submitted: 0, gallery_featured: false,
  },
  milestone: {
    pages_completed: 0, stickers_total: 3, days_active_30: 4,
    parent_approved_count: 1,
  },
  storybook: { page_slug: 'P01', stickers_on_page: 3, video_watched: false },
}

describe('evaluateTrigger', () => {
  it('supports aliases, numeric comparisons, booleans and strings', () => {
    expect(evaluateTrigger('quests.completed >= 4', snapshot)).toBe(true)
    expect(evaluateTrigger('creative.self_character_created == true', snapshot)).toBe(true)
    expect(evaluateTrigger('storybook.page_slug == "P01"', snapshot)).toBe(true)
    expect(evaluateTrigger('social.paco_picks > 1', snapshot)).toBe(false)
  })

  it('fails closed for unknown paths and executable input', () => {
    expect(evaluateTrigger('unknown.value == 1', snapshot)).toBe(false)
    expect(evaluateTrigger('social.paco_picks >= 1 || true', snapshot)).toBe(false)
  })
})
