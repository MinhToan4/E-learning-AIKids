import { describe, expect, it } from 'vitest'
import {
  inspectPracticePayload,
  practiceKindMatchesQuest,
} from './practice-policy.js'

describe('practice request policy', () => {
  it('only accepts the practice kind configured by the quest', () => {
    expect(practiceKindMatchesQuest('video', 'journal')).toBe(false)
    expect(practiceKindMatchesQuest('journal', 'journal')).toBe(true)
  })

  it('keeps the chips client alias used by the current lesson UI', () => {
    expect(practiceKindMatchesQuest('prompt', 'chips')).toBe(true)
    expect(practiceKindMatchesQuest('chips', 'chips')).toBe(true)
  })

  it('finds unsafe child text inside nested creative payloads', () => {
    const result = inspectPracticePayload({
      title: 'Chuyện của con',
      scenes: [{ dialogue: 'Email của mình là be@example.com' }],
    })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('unsafe_text')
  })

  it('does not treat owned asset ids or generated data URLs as child prose', () => {
    expect(
      inspectPracticePayload({
        assetIds: ['14a9f2be-8b46-4eb8-a887-f4f2e4c32354'],
        sketchDataUrl: 'data:image/png;base64,AAAA',
        text: 'Một khu rừng màu tím thật vui',
      }),
    ).toEqual({ ok: true })
  })

  it('rejects deeply nested and oversized payloads before persistence', () => {
    let nested: Record<string, unknown> = { text: 'ý tưởng' }
    for (let i = 0; i < 12; i += 1) nested = { child: nested }

    expect(inspectPracticePayload(nested)).toMatchObject({
      ok: false,
      reason: 'too_deep',
    })
    expect(inspectPracticePayload({ text: 'a'.repeat(4_001) })).toMatchObject({
      ok: false,
      reason: 'text_too_long',
    })
  })
})
