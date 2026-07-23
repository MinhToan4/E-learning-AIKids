import { describe, expect, it } from 'vitest'
import {
  buildCharacterPrompt,
  CHARACTER_CATEGORIES,
  CHARACTER_QUESTIONS,
} from './character-workshop'

describe('AiKid character workshop', () => {
  it('keeps all five source categories with selectable questions', () => {
    expect(CHARACTER_CATEGORIES).toEqual([
      'shape',
      'parts',
      'face',
      'hair',
      'clothes',
    ])
    for (const category of CHARACTER_CATEGORIES) {
      expect(CHARACTER_QUESTIONS[category].length).toBeGreaterThanOrEqual(3)
    }
  })

  it('builds a child-safe provider-neutral character prompt', () => {
    const prompt = buildCharacterPrompt('mèo du hành vũ trụ', {
      'Dáng người': 'tròn trịa',
      'Biểu cảm': 'vui vẻ',
    })
    expect(prompt).toContain('mèo du hành vũ trụ')
    expect(prompt).toContain('Dáng người: tròn trịa')
    expect(prompt).toContain('Child-safe')
    expect(prompt).not.toContain('provider')
  })
})
