import { describe, expect, it } from 'vitest'
import {
  MAIN_CREATE_PATH,
  resolveChallengeExit,
  storyToPanelHints,
} from '@/lib/flow'
import { questRoute } from '@/data/mock'

describe('learning flow routing', () => {
  it('does not send post-prompt quiz back to prompt studio', () => {
    const exit = resolveChallengeExit('ch-after-prompt')
    expect(exit.nextPath).toBe('/studio/story')
    expect(exit.nextQuestId).toBe('plot')
    expect(exit.completeQuestIds).toContain('detective')
  })

  it('maps detective quest to compare, not prompt', () => {
    expect(questRoute('detective')).toBe('/studio/compare')
    expect(questRoute('prompt-lab')).toBe('/studio/prompt')
    expect(questRoute('comic')).toBe('/studio/comic')
  })

  it('maps character challenge to world-build', () => {
    const exit = resolveChallengeExit('ch-after-character')
    expect(exit.nextPath).toBe('/quest/world-build')
  })

  it('main create path is character → prompt → compare → quiz → story → comic → video', () => {
    expect(MAIN_CREATE_PATH).toEqual([
      '/quest/character',
      '/studio/prompt',
      '/studio/compare',
      '/challenge/ch-after-prompt',
      '/studio/story',
      '/studio/comic',
      '/studio/video',
      '/portfolio/star-cat',
    ])
    const storyIdx = MAIN_CREATE_PATH.indexOf('/studio/story')
    const comicIdx = MAIN_CREATE_PATH.indexOf('/studio/comic')
    expect(storyIdx).toBeGreaterThan(-1)
    expect(comicIdx).toBeGreaterThan(storyIdx)
  })

  it('maps 3 story beats into 4 comic panel hints', () => {
    const hints = storyToPanelHints({
      title: 'Test',
      opening: 'Mở',
      problem: 'Sự cố',
      ending: 'Kết',
    })
    expect(hints).toHaveLength(4)
    expect(hints[0].beat).toBe('Mở')
    expect(hints[1].beat).toBe('Sự cố')
    expect(hints[3].beat).toBe('Kết')
  })
})
