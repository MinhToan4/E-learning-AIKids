import { describe, expect, it } from 'vitest'
import {
  assemblePrompt,
  isPromptComplete,
  missingSlotHint,
  missingSlots,
} from './prompt.js'
import type { PromptParts } from './types.js'

const chip = (id: string, slot: PromptParts['character'] extends infer C ? C extends { slot: infer S } ? S : never : never, label: string) =>
  ({ id, slot, label, emoji: '✨' }) as NonNullable<PromptParts['character']>

describe('assemblePrompt', () => {
  it('returns hint when empty', () => {
    expect(assemblePrompt({})).toContain('ghép thẻ')
  })

  it('joins filled slots in natural Vietnamese order', () => {
    const parts: PromptParts = {
      character: { id: 'c1', slot: 'character', label: 'mèo vũ trụ', emoji: '🐱' },
      action: { id: 'a1', slot: 'action', label: 'nhảy múa', emoji: '💃' },
      environment: { id: 'e1', slot: 'environment', label: 'hành tinh kẹo', emoji: '🪐' },
      mood: { id: 'm1', slot: 'mood', label: 'vui vẻ', emoji: '😊' },
      style: { id: 's1', slot: 'style', label: 'truyện tranh', emoji: '🎨' },
    }
    const text = assemblePrompt(parts)
    expect(text).toContain('mèo vũ trụ')
    expect(text).toContain('nhảy múa')
    expect(text).toContain('ở hành tinh kẹo')
    expect(text).toContain('cảm giác vui vẻ')
    expect(text).toContain('phong cách truyện tranh')
    expect(text.endsWith('.')).toBe(true)
  })

  it('appends free text when present', () => {
    const text = assemblePrompt({
      character: { id: 'c1', slot: 'character', label: 'robot mực', emoji: '🤖' },
      freeText: 'đội mũ sao',
    })
    expect(text).toContain('đội mũ sao')
  })
})

describe('missingSlots / complete', () => {
  it('lists all required when empty', () => {
    expect(missingSlots({})).toEqual([
      'character',
      'action',
      'environment',
      'mood',
      'style',
    ])
    expect(isPromptComplete({})).toBe(false)
  })

  it('hints first missing slot', () => {
    const hint = missingSlotHint({
      character: { id: 'c1', slot: 'character', label: 'mèo', emoji: '🐱' },
    })
    expect(hint).toMatch(/hành động/i)
  })

  it('complete when all five slots filled', () => {
    const parts: PromptParts = {
      character: { id: 'c', slot: 'character', label: 'a', emoji: '1' },
      action: { id: 'a', slot: 'action', label: 'b', emoji: '2' },
      environment: { id: 'e', slot: 'environment', label: 'c', emoji: '3' },
      mood: { id: 'm', slot: 'mood', label: 'd', emoji: '4' },
      style: { id: 's', slot: 'style', label: 'e', emoji: '5' },
    }
    expect(missingSlots(parts)).toEqual([])
    expect(isPromptComplete(parts)).toBe(true)
    expect(missingSlotHint(parts)).toBeNull()
  })
})
