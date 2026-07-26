import { describe, expect, it } from 'vitest'
import {
  detectScheduleConflicts,
  evaluatePlacementCompatibility,
} from './scheduling.js'

describe('detectScheduleConflicts', () => {
  it('detects overlap but allows back-to-back sessions', () => {
    const proposed = {
      start: new Date('2026-08-01T09:00:00Z'),
      end: new Date('2026-08-01T10:00:00Z'),
    }
    expect(
      detectScheduleConflicts(proposed, [
        {
          id: 'overlap',
          start: new Date('2026-08-01T09:30:00Z'),
          end: new Date('2026-08-01T10:30:00Z'),
        },
        {
          id: 'back-to-back',
          start: new Date('2026-08-01T10:00:00Z'),
          end: new Date('2026-08-01T11:00:00Z'),
        },
      ]),
    ).toEqual(['overlap'])
  })
})

describe('evaluatePlacementCompatibility', () => {
  it('reports every blocking reason for assisted manual matching', () => {
    expect(
      evaluatePlacementCompatibility(
        { ageBand: '6_8', level: 2 },
        {
          allowedAgeBands: ['9_11'],
          minLevel: 3,
          maxLevel: 5,
          currentSize: 4,
          capacity: 4,
          status: 'open',
        },
      ),
    ).toEqual({
      compatible: false,
      reasons: ['capacity', 'age_band', 'level'],
    })
  })
})
