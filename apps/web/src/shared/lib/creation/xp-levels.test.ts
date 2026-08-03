import { describe, expect, it } from 'vitest'
import {
  EXPLORER_LEVELS,
  explorerLevelForXp,
  explorerLevelProgress,
  nextExplorerLevel,
} from './xp-levels.js'

describe('explorer XP levels', () => {
  it('resolves current and next level from lifetime XP', () => {
    expect(explorerLevelForXp(87).level).toBe(1)
    expect(nextExplorerLevel(87).level).toBe(2)
    expect(explorerLevelForXp(1_360).level).toBe(14)
    expect(explorerLevelForXp(9_900, 100).level).toBe(100)
    expect(nextExplorerLevel(9_900, 100).level).toBe(101)
  })

  it('calculates bounded progress inside the current level', () => {
    expect(explorerLevelProgress(-10)).toBe(0)
    expect(explorerLevelProgress(50)).toBe(50)
    expect(explorerLevelProgress(9_999)).toBe(99)
    expect(explorerLevelProgress(9_900, 100)).toBe(0)
  })

  it('does not grant Storybook boss stickers from client-side level metadata', () => {
    expect(EXPLORER_LEVELS.some((item) => 'storybookSticker' in item)).toBe(false)
  })
})
