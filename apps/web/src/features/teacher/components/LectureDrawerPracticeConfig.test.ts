import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PRACTICE_PARTS,
  DEFAULT_FOUR_KEYS_OPTIONS,
  suggestFourKeysForSubject,
  ISLAND_6_STAGE_NAMES,
} from './LectureDrawer'

describe('Focus Studio AI Studio practice parts & 4-key options configuration', () => {
  it('provides 4 standard default practice parts with icons and images', () => {
    expect(DEFAULT_PRACTICE_PARTS).toHaveLength(4)
    expect(DEFAULT_PRACTICE_PARTS[0].title).toBe('Cái cốc sứ trắng')
    expect(DEFAULT_PRACTICE_PARTS[1].title).toBe('Cái xe đạp')
    expect(DEFAULT_PRACTICE_PARTS[2].title).toBe('Cuốn sổ tay mở')
    expect(DEFAULT_PRACTICE_PARTS[3].title).toBe('Cái đồng hồ cổ')

    DEFAULT_PRACTICE_PARTS.forEach((part, idx) => {
      expect(part.partNumber).toBe(idx + 1)
      expect(part.icon).toBeDefined()
      expect(part.iconImage).toBeDefined()
    })
  })

  it('provides 4 Hallmark SSOT trays for the Magic Keys keyboard', () => {
    expect(DEFAULT_FOUR_KEYS_OPTIONS.what).toBeDefined()
    expect(DEFAULT_FOUR_KEYS_OPTIONS.how).toBeDefined()
    expect(DEFAULT_FOUR_KEYS_OPTIONS.action).toBeDefined()
    expect(DEFAULT_FOUR_KEYS_OPTIONS.where).toBeDefined()

    expect(DEFAULT_FOUR_KEYS_OPTIONS.what!.length).toBeGreaterThanOrEqual(4)
    expect(DEFAULT_FOUR_KEYS_OPTIONS.how!.length).toBeGreaterThanOrEqual(4)
    expect(DEFAULT_FOUR_KEYS_OPTIONS.action!.length).toBeGreaterThanOrEqual(4)
    expect(DEFAULT_FOUR_KEYS_OPTIONS.where!.length).toBeGreaterThanOrEqual(4)

    expect(DEFAULT_FOUR_KEYS_OPTIONS.what).toContain('Cốc sứ trắng')
    expect(DEFAULT_FOUR_KEYS_OPTIONS.how).toContain('men bóng mẻ miệng')
    expect(DEFAULT_FOUR_KEYS_OPTIONS.action).toContain('đang bốc khói nghi ngút')
    expect(DEFAULT_FOUR_KEYS_OPTIONS.where).toContain('trên bàn gỗ mộc')
  })

  it('suggests appropriate four keys and practice objects based on subject name', () => {
    const catSuggestion = suggestFourKeysForSubject('Chú mèo mướp vui nhộn')
    expect(catSuggestion.parts[0].title).toContain('Mèo')
    expect(catSuggestion.fourKeys.what).toContain('Mèo mướp vàng')
    expect(catSuggestion.fourKeys.how).toContain('béo tròn bụ bẫm')

    const defaultSuggestion = suggestFourKeysForSubject('Bốn chiếc chìa khóa')
    expect(defaultSuggestion.parts[0].title).toBe('Cái cốc sứ trắng')
    expect(defaultSuggestion.fourKeys.what).toContain('Cốc sứ trắng')
  })

  it('preserves full text for Stage 5 in ISLAND_6_STAGE_NAMES without truncation', () => {
    expect(ISLAND_6_STAGE_NAMES[4]).toBe('5. 🎨 Thực hành (AI Studio)')
  })
})
