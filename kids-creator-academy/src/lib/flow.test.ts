import { describe, expect, it } from 'vitest'
import { resolveChallengeExit } from '@/lib/flow'
import { questRoute } from '@/data/mock'

describe('learning flow routing', () => {
  it('does not send post-prompt quiz back to prompt studio', () => {
    const exit = resolveChallengeExit('ch-after-prompt')
    expect(exit.nextPath).toBe('/studio/comic')
    expect(exit.nextQuestId).toBe('comic')
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
})
