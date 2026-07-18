import { describe, expect, it } from 'vitest'
import {
  MAIN_CREATE_PATH,
  resolveChallengeExit,
  storyToPanelHints,
} from '@/lib/flow'
import { starsFromQuiz } from '@/data/lessons'
import {
  getActiveAdventureIndex,
  getNextQuestAfter,
  isCourseComplete,
  nextLessonPath,
} from '@/lib/course-flow'
import { questRoute } from '@/data/mock'

describe('learning flow routing', () => {
  it('does not send post-prompt quiz back to prompt studio', () => {
    const exit = resolveChallengeExit('ch-after-prompt')
    expect(exit.nextPath).toBe('/studio/story')
    expect(exit.nextQuestId).toBe('plot')
    expect(exit.completeQuestIds).toContain('detective')
  })

  it('routes every quest through lesson shell first (theory → practice → quiz)', () => {
    expect(questRoute('detective')).toBe('/lesson/detective')
    expect(questRoute('prompt-lab')).toBe('/lesson/prompt-lab')
    expect(questRoute('comic')).toBe('/lesson/comic')
    expect(questRoute('character')).toBe('/lesson/character')
  })

  it('maps character challenge to world-build', () => {
    const exit = resolveChallengeExit('ch-after-character')
    expect(exit.nextPath).toBe('/quest/world-build')
  })

  it('main create path includes lesson shells before studio practice', () => {
    expect(MAIN_CREATE_PATH[0]).toBe('/lesson/character')
    expect(MAIN_CREATE_PATH).toContain('/lesson/prompt-lab')
    expect(MAIN_CREATE_PATH).toContain('/studio/prompt')
    expect(MAIN_CREATE_PATH).toContain('/studio/story')
    expect(MAIN_CREATE_PATH).toContain('/studio/comic')
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

  it('awards 1–3 stars from quiz accuracy (Phaser level-select style)', () => {
    expect(starsFromQuiz(2, 2)).toBe(3)
    expect(starsFromQuiz(1, 2)).toBe(2)
    expect(starsFromQuiz(0, 2)).toBe(1)
  })

  it('next station goes to next lesson path, not catalog mid-course', () => {
    expect(nextLessonPath('course-comic', 'character')).toBe('/lesson/world-build')
    expect(getNextQuestAfter('course-comic', 'character')?.id).toBe('world-build')
    // last quest → adventure map with courseDone
    expect(nextLessonPath('course-comic', 'cinema')).toContain('/world')
  })

  it('parks adventure index on first incomplete station', () => {
    // meet-mascot done → next is character (index 1)
    expect(
      getActiveAdventureIndex('course-comic', ['meet-mascot'], 'character'),
    ).toBe(1)
    expect(isCourseComplete('course-comic', ['meet-mascot'])).toBe(false)
  })
})
