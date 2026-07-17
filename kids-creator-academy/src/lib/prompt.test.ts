import { describe, expect, it } from 'vitest'
import { assemblePrompt, missingSlotHint, missingSlots } from '@/lib/prompt'
import type { PromptChip } from '@/types'

const chip = (slot: PromptChip['slot'], label: string): PromptChip => ({
  id: label,
  slot,
  label,
  emoji: '✨',
  description: label,
})

describe('assemblePrompt', () => {
  it('builds a Vietnamese sentence from parts', () => {
    const text = assemblePrompt({
      character: chip('character', 'Mèo phi hành gia'),
      action: chip('action', 'Sửa tàu'),
      environment: chip('environment', 'Hành tinh tím'),
      mood: chip('mood', 'Dũng cảm'),
      style: chip('style', 'Màu nước'),
    })
    expect(text).toContain('Mèo phi hành gia')
    expect(text).toContain('Hành tinh tím')
    expect(text.endsWith('.')).toBe(true)
  })

  it('returns helper when empty', () => {
    expect(assemblePrompt({})).toMatch(/ghép thẻ/i)
  })
})

describe('missingSlots', () => {
  it('lists missing required slots', () => {
    const missing = missingSlots({
      character: chip('character', 'Mèo'),
    })
    expect(missing).toContain('action')
    expect(missing).toContain('environment')
    expect(missingSlotHint({ character: chip('character', 'Mèo') })).toMatch(
      /hành động/i,
    )
  })
})
