import { describe, expect, it } from 'vitest'
import {
  STORYBOOK_CHAPTERS,
  chapterReward,
  isChapterClaimable,
  isStorybookStickerId,
  storybookChapter,
} from './storybook.js'

describe('storybook catalog', () => {
  it('defines eight chapters with eight regular stickers and one boss', () => {
    expect(STORYBOOK_CHAPTERS).toHaveLength(8)
    for (const item of STORYBOOK_CHAPTERS) {
      expect(item.stickerIds).toHaveLength(8)
      expect(isStorybookStickerId(item.bossStickerId)).toBe(true)
      expect(chapterReward(item).unlock.value).toBe(item.bossStickerId)
    }
  })

  it('only allows a chapter claim after every regular sticker is earned', () => {
    const item = storybookChapter('p01')!
    expect(isChapterClaimable(item, item.stickerIds.slice(0, 7))).toBe(false)
    expect(isChapterClaimable(item, item.stickerIds)).toBe(true)
  })

  it('rejects unknown sticker identifiers', () => {
    expect(isStorybookStickerId('P09-S1')).toBe(false)
    expect(storybookChapter('P09')).toBeUndefined()
  })
})
