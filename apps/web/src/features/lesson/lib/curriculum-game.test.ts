import { describe, expect, it } from 'vitest'
import {
  missionProgress,
  normalizeGameType,
  resolveGamePolicy,
  safeGameAssetPath,
  sanitizeAllowedGameTypes,
  sanitizeGameCatalog,
  sanitizeGameLobby,
  sanitizePatrolWaves,
  sanitizeRunnerLevels,
} from './curriculum-game'

const runnerLevel = {
  id: 'level-1',
  title: 'Dữ liệu đa dạng',
  mission: 'Thu thập dữ liệu tốt và tránh dữ liệu sai.',
  backgroundUrl: '/assets/game-engines/data-trail-world.webp',
  backgroundAlt: 'Đường chạy dữ liệu',
  playerSpriteUrl: '/assets/game-engines/data-courier.webp',
  items: [
    { id: 'good-1', label: 'Mẫu đa dạng', at: 25, lane: 'ground', decision: 'collect', feedback: 'Tốt' },
    { id: 'bad-1', label: 'Nhãn sai', at: 45, lane: 'ground', decision: 'avoid', feedback: 'Cần tránh' },
    { id: 'good-2', label: 'Có đồng ý', at: 65, lane: 'air', decision: 'collect', feedback: 'An toàn' },
  ],
  completionFeedback: 'Đã hoàn thành.',
}

const patrolWave = {
  id: 'wave-1',
  title: 'Kiểm tra nguồn',
  mission: 'Quét nội dung không có nguồn.',
  backgroundUrl: '/assets/game-engines/truth-patrol-world.webp',
  backgroundAlt: 'Bầu trời kiểm chứng',
  playerSpriteUrl: '/assets/game-engines/source-scout.webp',
  targets: [
    { id: 'claim-1', label: 'Không có nguồn', spawnAtMs: 0, column: 20, speed: 6, decision: 'scan', feedback: 'Cần kiểm chứng' },
    { id: 'claim-2', label: 'Có tài liệu', spawnAtMs: 1000, column: 50, speed: 6, decision: 'protect', feedback: 'Có nguồn' },
    { id: 'claim-3', label: 'Không rõ tác giả', spawnAtMs: 2000, column: 80, speed: 6, decision: 'scan', feedback: 'Cần tìm tác giả' },
  ],
  completionFeedback: 'Đã kiểm tra xong.',
}

describe('DB-authored AI game configuration', () => {
  it('keeps supported engines stable and maps legacy interactions compatibly', () => {
    expect(normalizeGameType('blockly')).toBe('blockly')
    expect(normalizeGameType('math-kids')).toBe('math-kids')
    expect(normalizeGameType('battle-math')).toBe('battle-math')
    expect(normalizeGameType('edukiz')).toBe('edukiz')
    expect(normalizeGameType('detective')).toBe('edukiz')
    expect(sanitizeAllowedGameTypes([
      'blockly',
      'data-runner',
      'battle-math',
      'truth-patrol',
    ])).toEqual(['blockly', 'data-runner', 'battle-math', 'truth-patrol'])
  })

  it('accepts only complete catalog and lobby data with local assets', () => {
    const lobby = {
      eyebrow: 'Xưởng AI',
      title: 'Chọn nhiệm vụ',
      description: 'Học AI bằng hành động.',
      imageUrl: '/assets/game-engines/game-lab-world.webp',
      imageAlt: 'Bản đồ xưởng AI',
    }
    const catalog = [{
      type: 'data-runner',
      label: 'Đường Đua Dữ Liệu',
      shortLabel: 'Chạy dữ liệu',
      description: 'Chọn dữ liệu phù hợp.',
      gameplay: 'Chạy và nhảy',
      sceneUrl: '/assets/game-engines/data-trail-world.webp',
      sceneAlt: 'Thung lũng dữ liệu',
    }]

    expect(sanitizeGameLobby(lobby)).toEqual(lobby)
    expect(sanitizeGameCatalog(catalog)).toHaveLength(1)
    expect(safeGameAssetPath('https://example.test/child.png')).toBe('')
    expect(safeGameAssetPath('/assets/../secret.webp')).toBe('')
  })

  it('returns no rounds when DB content is absent or unsafe', () => {
    expect(sanitizeRunnerLevels(undefined)).toEqual([])
    expect(sanitizePatrolWaves(undefined)).toEqual([])
    expect(sanitizeRunnerLevels([{
      ...runnerLevel,
      backgroundUrl: 'https://untrusted.test/track.png',
    }])).toEqual([])
    expect(sanitizePatrolWaves([{
      ...patrolWave,
      targets: patrolWave.targets.map((target) => ({
        ...target,
        imageUrl: '/assets/../../private.webp',
      })),
    }])).toEqual([])
  })

  it('sanitizes DB levels and keeps policy bounded', () => {
    expect(sanitizeRunnerLevels([runnerLevel])).toHaveLength(1)
    expect(sanitizePatrolWaves([patrolWave])).toHaveLength(1)
    expect(resolveGamePolicy({
      selectionMode: 'student_choice',
      allowedTypes: ['blockly', 'battle-math', 'unsafe-game'],
      difficulty: 'challenge',
    }, 'data-runner')).toEqual({
      selectionMode: 'student_choice',
      allowedTypes: ['data-runner', 'blockly', 'battle-math'],
      difficulty: 'challenge',
    })
    expect(missionProgress(2, 3)).toBe(67)
  })
})
