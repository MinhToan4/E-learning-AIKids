import { describe, expect, it } from 'vitest'
import {
  CURRICULUM_GAME_DEFINITIONS,
  buildMemoryDeck,
  calculateBattleScore,
  calculateGameReward,
  createMathProblem,
  getGameTuning,
  missionProgress,
  normalizeGameType,
  resolveGamePolicy,
  sanitizeAllowedGameTypes,
  sanitizeAssociationPairs,
  sanitizeGameCards,
  sanitizeVisualRounds,
  feedbackFor,
  DEFAULT_AI_VISUAL_ROUNDS,
} from './curriculum-game'

describe('four source-inspired curriculum engines', () => {
  it('exposes exactly four engines and maps legacy ids without showing them', () => {
    expect(CURRICULUM_GAME_DEFINITIONS.map((game) => game.type)).toEqual([
      'blockly', 'math-kids', 'battle-math', 'edukiz',
    ])
    expect(normalizeGameType('drag')).toBe('blockly')
    expect(normalizeGameType('pick')).toBe('math-kids')
    expect(normalizeGameType('compare')).toBe('battle-math')
    expect(normalizeGameType('match')).toBe('edukiz')
    expect(normalizeGameType('unknown')).toBe('blockly')
  })

  it('sanitizes teacher content and builds a stable pair deck', () => {
    expect(sanitizeGameCards(['  Bầu trời ', 'Bầu trời', '', 'x', 'Mặt đất'], 4))
      .toEqual(['Bầu trời', 'Mặt đất'])
    const pairs = sanitizeAssociationPairs([
      { left: 'Vàng cam', right: 'Vui' },
      { left: 'Tím đậm', right: 'Bí ẩn' },
    ])
    expect(buildMemoryDeck(pairs, 'lesson')).toEqual(buildMemoryDeck(pairs, 'lesson'))
    expect(buildMemoryDeck(pairs, 'lesson')).toHaveLength(4)
  })

  it('keeps selection policy bounded to the four engines', () => {
    expect(resolveGamePolicy({
      selectionMode: 'student_choice',
      allowedTypes: ['blockly', 'math-kids', 'battle-math', 'edukiz', 'pick'],
      difficulty: 'challenge',
    }, 'blockly')).toEqual({
      selectionMode: 'student_choice',
      allowedTypes: ['blockly', 'math-kids', 'battle-math', 'edukiz'],
      difficulty: 'challenge',
    })
    expect(sanitizeAllowedGameTypes('blockly')).toEqual([])
  })

  it('preserves BattleMath 30-second scoring bands', () => {
    expect([4, 9, 14, 19, 24, 30].map(calculateBattleScore)).toEqual([10, 8, 6, 4, 2, 1])
  })

  it('accepts only bounded internal visual rounds and varies child feedback', () => {
    expect(sanitizeVisualRounds(DEFAULT_AI_VISUAL_ROUNDS)).toHaveLength(4)
    expect(sanitizeVisualRounds([{
      ...DEFAULT_AI_VISUAL_ROUNDS[0],
      options: DEFAULT_AI_VISUAL_ROUNDS[0]!.options.map((option) => ({
        ...option,
        imageUrl: 'https://untrusted.example/child.png',
      })),
    }])).toEqual([])
    expect(new Set(Array.from({ length: 5 }, (_, index) => feedbackFor('correct', index))).size)
      .toBe(5)
    expect(feedbackFor('retry', 0)).not.toBe(feedbackFor('retry', 1))
  })

  it('generates exact integer arithmetic and bounded rewards/progress', () => {
    expect(createMathProblem('gentle', '÷', () => 0.5).answer).toBe(5)
    expect(calculateGameReward(false, 9, 'challenge')).toBe(0)
    expect(calculateGameReward(true, 20, 'challenge')).toBe(24)
    expect(missionProgress(2, 3)).toBe(67)
    expect(getGameTuning('challenge')).toEqual({
      cardLimit: 8, memoryPairLimit: 4, roundLimit: 10, targetWins: 7,
    })
  })
})
