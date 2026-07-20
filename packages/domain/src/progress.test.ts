import { describe, expect, it } from 'vitest'
import {
  advancePhase,
  buildQuestStatuses,
  canEnterQuest,
  computeQuestStatus,
  scoreStars,
  xpForStars,
} from './progress.js'
import type { QuestProgressState } from './progress.js'

describe('computeQuestStatus', () => {
  it('first quest is available', () => {
    expect(computeQuestStatus(1, new Set())).toBe('available')
  })

  it('later quest locked until previous completed', () => {
    expect(computeQuestStatus(2, new Set())).toBe('locked')
    expect(computeQuestStatus(2, new Set([1]))).toBe('available')
  })

  it('keeps completed status', () => {
    expect(computeQuestStatus(1, new Set([1]), 'completed')).toBe('completed')
  })
})

describe('buildQuestStatuses', () => {
  const quests = [
    { id: 'q1', order: 1 },
    { id: 'q2', order: 2 },
    { id: 'q3', order: 3 },
  ]

  it('unlocks next after complete', () => {
    const progress = new Map<string, QuestProgressState>([
      [
        'q1',
        {
          questId: 'q1',
          status: 'completed',
          phase: 'check',
          stars: 3,
          xpEarned: 30,
        },
      ],
    ])
    const statuses = buildQuestStatuses(quests, progress)
    expect(statuses.get('q1')).toBe('completed')
    expect(statuses.get('q2')).toBe('available')
    expect(statuses.get('q3')).toBe('locked')
  })
})

describe('scoreStars / xp', () => {
  it('never shames with zero when finished', () => {
    expect(scoreStars(0, 3)).toBe(1)
    expect(scoreStars(2, 3)).toBe(2)
    expect(scoreStars(3, 3)).toBe(3)
  })

  it('maps stars to XP', () => {
    expect(xpForStars(3)).toBe(30)
    expect(xpForStars(2)).toBe(20)
    expect(xpForStars(1)).toBe(12)
  })
})

describe('phase advance', () => {
  it('learn → practice → check → done', () => {
    expect(advancePhase('learn')).toEqual({ phase: 'practice', complete: false })
    expect(advancePhase('practice')).toEqual({ phase: 'check', complete: false })
    expect(advancePhase('check')).toEqual({ phase: 'check', complete: true })
  })
})

describe('canEnterQuest', () => {
  it('blocks locked only', () => {
    expect(canEnterQuest('locked')).toBe(false)
    expect(canEnterQuest('available')).toBe(true)
    expect(canEnterQuest('completed')).toBe(true)
  })
})
