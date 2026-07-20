/**
 * Structural test: FE imports real domain modules (not reimplemented oracles).
 */
import { describe, expect, it } from 'vitest'
import {
  assemblePrompt,
  buildQuestStatuses,
  can,
  validateChildText,
} from '@aikids/domain'

describe('FE uses shipped domain package', () => {
  it('assemblePrompt from @aikids/domain', () => {
    const text = assemblePrompt({
      character: { id: '1', slot: 'character', label: 'mèo', emoji: '🐱' },
      action: { id: '2', slot: 'action', label: 'bay', emoji: '☁️' },
    })
    expect(text).toContain('mèo')
    expect(text).toContain('bay')
  })

  it('validateChildText blocks PII', () => {
    expect(validateChildText('a@b.com').ok).toBe(false)
  })

  it('buildQuestStatuses unlocks path', () => {
    const statuses = buildQuestStatuses(
      [
        { id: 'a', order: 1 },
        { id: 'b', order: 2 },
      ],
      new Map([
        [
          'a',
          {
            questId: 'a',
            status: 'completed',
            phase: 'check',
            stars: 3,
            xpEarned: 30,
          },
        ],
      ]),
    )
    expect(statuses.get('b')).toBe('available')
  })

  it('authz student cannot decide approval; admin can manage users', () => {
    expect(can('student', 'approval:decide')).toBe(false)
    expect(can('parent', 'approval:decide')).toBe(true)
    expect(can('admin', 'user:write')).toBe(true)
    expect(can('teacher', 'lecture:write')).toBe(true)
    expect(can('student', 'lecture:write')).toBe(false)
  })

  it('domain exposes AIkid creative catalogs used by lessons', async () => {
    const { ART_STYLES, isArtStyleId, CHARACTER_SHAPES } = await import(
      '@aikids/domain'
    )
    expect(ART_STYLES.some((s) => s.id === 'clay')).toBe(true)
    expect(isArtStyleId('comic')).toBe(true)
    expect(CHARACTER_SHAPES.length).toBeGreaterThan(3)
  })

  it('supabase client module exports configuration flag', async () => {
    const mod = await import('./supabase.js')
    expect(typeof mod.isSupabaseConfigured).toBe('boolean')
    // Client is null when VITE_ env missing in vitest; ok either way
    expect(mod.supabase === null || typeof mod.supabase === 'object').toBe(true)
  })
})
