import { describe, expect, it } from 'vitest'
import {
  buildMemoryDeck,
  buildAssociationDeck,
  buildOrderBoard,
  getAdventureBlueprint,
  missionProgress,
  normalizeGameType,
  sanitizeCombineGroups,
  sanitizeAssociationPairs,
  sanitizeCompareRounds,
  sanitizeGameCards,
  sanitizePlacements,
} from './curriculum-game'

describe('curriculum game engine', () => {
  it('normalizes unsupported types to the safe pick game', () => {
    expect(normalizeGameType('detective')).toBe('detective')
    expect(normalizeGameType('combine')).toBe('combine')
    expect(normalizeGameType('compare')).toBe('compare')
    expect(normalizeGameType('unknown')).toBe('pick')
    expect(normalizeGameType()).toBe('pick')
  })

  it('accepts only bounded, playable idea-combination groups', () => {
    expect(
      sanitizeCombineGroups([
        { label: 'Địa điểm', options: ['Rừng phép thuật', 'Đại dương'] },
        { label: 'Cảm giác', options: ['Vui', 'Bí ẩn', 'Vui'] },
        { label: '', options: ['Bị loại', 'Bị loại'] },
        { label: 'Thiếu lựa chọn', options: ['Một'] },
      ]),
    ).toEqual([
      { label: 'Địa điểm', options: ['Rừng phép thuật', 'Đại dương'] },
      { label: 'Cảm giác', options: ['Vui', 'Bí ẩn'] },
    ])
  })

  it('keeps only compare rounds with a valid answer and child-sized copy', () => {
    expect(
      sanitizeCompareRounds([
        {
          prompt: 'Mô tả nào giúp con hình dung rõ hơn?',
          options: ['Một khu rừng đẹp', 'Khu rừng nhỏ có cây phát sáng'],
          answerIndex: 1,
          feedback: 'Mô tả thứ hai cho biết kích thước và chi tiết đặc biệt.',
        },
        {
          prompt: 'Sai',
          options: ['A', 'B'],
          answerIndex: 3,
          feedback: 'Không được giữ',
        },
      ]),
    ).toEqual([
      {
        prompt: 'Mô tả nào giúp con hình dung rõ hơn?',
        options: ['Một khu rừng đẹp', 'Khu rừng nhỏ có cây phát sáng'],
        answerIndex: 1,
        feedback: 'Mô tả thứ hai cho biết kích thước và chi tiết đặc biệt.',
      },
    ])
  })

  it('keeps only explicit item-to-zone placement challenges', () => {
    expect(
      sanitizePlacements([
        { item: 'Tên thế giới', target: 'Bảng tên phía trên' },
        { item: 'Cảnh chính', target: 'Nền bản đồ' },
        { item: '', target: 'Bị loại' },
      ]),
    ).toEqual([
      { item: 'Tên thế giới', target: 'Bảng tên phía trên' },
      { item: 'Cảnh chính', target: 'Nền bản đồ' },
    ])
  })

  it('trims, deduplicates and bounds content cards', () => {
    expect(
      sanitizeGameCards(['  Bầu trời ', 'Bầu trời', '', 'x', 'Mặt đất'], 4),
    ).toEqual(['Bầu trời', 'Mặt đất'])
  })

  it('builds a deterministic hidden memory deck with two cards per pair', () => {
    const cards = ['Màu ấm', 'Màu lạnh', 'Màu trung tính']
    const first = buildMemoryDeck(cards, 'palette-lesson')
    const second = buildMemoryDeck(cards, 'palette-lesson')

    expect(first).toEqual(second)
    expect(first).toHaveLength(6)
    for (const label of cards) {
      expect(first.filter((card) => card.label === label)).toHaveLength(2)
    }
    expect(new Set(first.map((card) => card.id)).size).toBe(6)
  })

  it('builds related, non-identical pairs for concept matching games', () => {
    const pairs = sanitizeAssociationPairs([
      { left: 'Vàng cam', right: 'Vui' },
      { left: 'Tím đậm', right: 'Bí ẩn' },
      { left: 'Thiếu vế', right: '' },
    ])
    const deck = buildAssociationDeck(pairs, 'color-feeling')

    expect(pairs).toEqual([
      { left: 'Vàng cam', right: 'Vui' },
      { left: 'Tím đậm', right: 'Bí ẩn' },
    ])
    expect(deck).toHaveLength(4)
    expect(new Set(deck.map((card) => card.label))).toEqual(
      new Set(['Vàng cam', 'Vui', 'Tím đậm', 'Bí ẩn']),
    )
    expect(new Set(deck.map((card) => card.pairId)).size).toBe(2)
  })

  it('builds a stable order board that preserves every answer but starts mixed', () => {
    const answers = ['Ý tưởng', 'Phác thảo', 'Kiểm tra', 'Hoàn thiện']
    const board = buildOrderBoard(answers, 'story-order')

    expect([...board].sort()).toEqual([...answers].sort())
    expect(board).not.toEqual(answers)
    expect(buildOrderBoard(answers, 'story-order')).toEqual(board)
  })

  it('maps every lesson game to a child-friendly mission without relying on course copy', () => {
    expect(getAdventureBlueprint('detective')).toMatchObject({
      title: 'Truy tìm manh mối',
      objective: 'Thu thập hai manh mối',
      reward: 'Huy hiệu Thám hiểm',
    })
    expect(getAdventureBlueprint('unknown').title).toBe('Săn ý tưởng')
  })

  it('keeps mission progress bounded for a predictable three-stop map', () => {
    expect(missionProgress(0, 3)).toBe(0)
    expect(missionProgress(2, 3)).toBe(67)
    expect(missionProgress(8, 3)).toBe(100)
    expect(missionProgress(1, 0)).toBe(0)
  })
})
