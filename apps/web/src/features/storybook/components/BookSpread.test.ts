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
})
