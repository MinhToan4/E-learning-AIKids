import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type {
  CurriculumGameConfig,
  CurriculumGameDefinition,
} from '@/features/lesson/lib/curriculum-game'
import { DataRunnerGame } from './DataRunnerGame'
import { TruthPatrolGame } from './TruthPatrolGame'

const definitions: Record<string, CurriculumGameDefinition> = {
  runner: {
    type: 'data-runner',
    label: 'Đường Đua Dữ Liệu',
    shortLabel: 'Chạy dữ liệu',
    description: 'Chọn dữ liệu phù hợp.',
    gameplay: 'Chạy và nhảy',
    sceneUrl: '/assets/game-engines/data-trail-world.webp',
    sceneAlt: 'Thung lũng dữ liệu',
  },
  patrol: {
    type: 'truth-patrol',
    label: 'Biệt Đội Kiểm Chứng',
    shortLabel: 'Tuần tra tin',
    description: 'Kiểm tra nội dung AI.',
    gameplay: 'Di chuyển và quét',
    sceneUrl: '/assets/game-engines/truth-patrol-world.webp',
    sceneAlt: 'Bầu trời kiểm chứng',
  },
}

const config: CurriculumGameConfig = {
  runnerLevels: [{
    id: 'runner-level',
    title: 'Dữ liệu đa dạng',
    mission: 'Chọn dữ liệu tốt.',
    backgroundUrl: '/assets/game-engines/data-trail-world.webp',
    backgroundAlt: 'Đường chạy dữ liệu',
    playerSpriteUrl: '/assets/game-engines/data-courier.webp',
    items: [
      { id: 'one', label: 'Mẫu đa dạng', at: 25, lane: 'ground', decision: 'collect', feedback: 'Tốt' },
      { id: 'two', label: 'Nhãn sai', at: 45, lane: 'ground', decision: 'avoid', feedback: 'Tránh' },
      { id: 'three', label: 'Có đồng ý', at: 65, lane: 'air', decision: 'collect', feedback: 'An toàn' },
    ],
    completionFeedback: 'Hoàn thành.',
  }],
  patrolWaves: [{
    id: 'patrol-wave',
    title: 'Kiểm tra nguồn',
    mission: 'Quét nội dung không nguồn.',
    backgroundUrl: '/assets/game-engines/truth-patrol-world.webp',
    backgroundAlt: 'Bầu trời kiểm chứng',
    playerSpriteUrl: '/assets/game-engines/source-scout.webp',
    targets: [
      { id: 'one', label: 'Thiếu nguồn', spawnAtMs: 0, column: 20, speed: 6, decision: 'scan', feedback: 'Quét' },
      { id: 'two', label: 'Có nguồn', spawnAtMs: 1000, column: 50, speed: 6, decision: 'protect', feedback: 'Bảo vệ' },
      { id: 'three', label: 'Thiếu ngày', spawnAtMs: 2000, column: 80, speed: 6, decision: 'scan', feedback: 'Kiểm tra' },
    ],
    completionFeedback: 'Hoàn thành.',
  }],
}

describe('AI learning game engines', () => {
  it('server-renders the original runner scene without an image atlas', () => {
    const html = renderToStaticMarkup(
      <DataRunnerGame
        config={config}
        definition={definitions.runner}
        difficulty="gentle"
        instruction=""
        outcome=""
        onComplete={vi.fn()}
      />,
    )
    expect(html).toContain('Đường Đua Dữ Liệu')
    expect(html).toContain('/assets/game-engines/data-courier.webp')
    expect(html).not.toContain('ai-worlds.jpg')
    expect(html).not.toContain('background-position')
  })

  it('server-renders patrol cards as independent contained images', () => {
    const visualConfig = {
      ...config,
      patrolWaves: [{
        ...(config.patrolWaves as Array<Record<string, unknown>>)[0],
        targets: [
          { id: 'one', label: 'Đúng prompt', imageUrl: '/assets/game-engines/prompt-match.webp', spawnAtMs: 0, column: 20, speed: 6, decision: 'protect', feedback: 'Đúng' },
          { id: 'two', label: 'Sai số lượng', imageUrl: '/assets/game-engines/prompt-count-error.webp', spawnAtMs: 1000, column: 50, speed: 6, decision: 'scan', feedback: 'Sai' },
          { id: 'three', label: 'Sai màu', imageUrl: '/assets/game-engines/prompt-color-error.webp', spawnAtMs: 2000, column: 80, speed: 6, decision: 'scan', feedback: 'Sai' },
        ],
      }],
    }
    const html = renderToStaticMarkup(
      <TruthPatrolGame
        config={visualConfig}
        definition={definitions.patrol}
        difficulty="steady"
        instruction=""
        outcome=""
        onComplete={vi.fn()}
      />,
    )
    expect(html).toContain('Biệt Đội Kiểm Chứng')
    expect(html).toContain('/assets/game-engines/source-scout.webp')
    expect(html).toContain('/assets/game-engines/prompt-match.webp')
    expect(html).toContain('object-contain')
    expect(html).not.toContain('ai-picture-check.jpg')
  })
})
