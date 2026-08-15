import { describe, expect, it } from 'vitest'
import { STORYBOOK_PAGES } from '../storybook-data'
import { storybookChapterState } from './BookSpread'

describe('storybook chapter state', () => {
  const page = STORYBOOK_PAGES[0]!

  it('becomes ready after S1-S8 and complete only after S9', () => {
    const regular = new Set(page.stickers.slice(0, 8).map((sticker) => sticker.id))
    expect(storybookChapterState(page, regular)).toEqual({ earnedCount: 8, ready: true, complete: false })

    regular.add(`${page.slug}-S9`)
    expect(storybookChapterState(page, regular)).toEqual({ earnedCount: 9, ready: false, complete: true })
  })

  it('provides the complete Figma sticker layout for every chapter', () => {
    expect(STORYBOOK_PAGES).toHaveLength(8)

    for (const chapter of STORYBOOK_PAGES) {
      expect(chapter.stickers).toHaveLength(9)
      expect(chapter.stickers.every((sticker) => sticker.placement)).toBe(true)
      expect(chapter.stickerSheetUrl).toMatch(
        /^\/assets\/designer\/storybook\/stickers-v3\/chapter-0[1-8]\.webp$/,
      )
      expect(chapter.stickers.map((sticker) => sticker.sheetIndex).sort()).toEqual([
        0, 1, 2, 3, 4, 5, 6, 7, 8,
      ])
    }
  })
})
