import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PRACTICE_PARTS,
  DEFAULT_FOUR_KEYS_OPTIONS,
  suggestFourKeysForSubject,
  ISLAND_6_STAGE_NAMES,
} from './LectureDrawer'

describe('Focus Studio AI Studio practice parts & 4-key options configuration', () => {
  it('provides 3 standard default practice parts with icons and images', () => {
    expect(DEFAULT_PRACTICE_PARTS).toHaveLength(3)
    expect(DEFAULT_PRACTICE_PARTS[0].title).toBe('Cái cốc sứ trắng')
    expect(DEFAULT_PRACTICE_PARTS[1].title).toBe('Cái xe đạp')
    expect(DEFAULT_PRACTICE_PARTS[2].title).toMatch(/Cuốn sổ tay/)

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

    expect(DEFAULT_FOUR_KEYS_OPTIONS.what!.length).toBe(3)
    expect(DEFAULT_FOUR_KEYS_OPTIONS.how!.length).toBe(3)
    expect(DEFAULT_FOUR_KEYS_OPTIONS.action!.length).toBe(3)
    expect(DEFAULT_FOUR_KEYS_OPTIONS.where!.length).toBe(3)

    expect(DEFAULT_FOUR_KEYS_OPTIONS.what).toContain('Cốc sứ trắng')
    expect(DEFAULT_FOUR_KEYS_OPTIONS.how).toContain('men bóng mẻ miệng')
    expect(DEFAULT_FOUR_KEYS_OPTIONS.action).toContain('đang bốc khói nghi ngút')
    expect(DEFAULT_FOUR_KEYS_OPTIONS.where).toContain('trên bàn gỗ mộc')
  })

  it('suggests appropriate four keys and practice objects based on subject name', () => {
    const catSuggestion = suggestFourKeysForSubject('Chú mèo mướp vui nhộn')
    expect(catSuggestion.parts[0].title).toContain('Mèo')
    expect(catSuggestion.fourKeys.what).toContain('Chú Mèo Mướp Vàng')
    expect(catSuggestion.fourKeys.how).toContain('Béo tròn bụ bẫm')

    const defaultSuggestion = suggestFourKeysForSubject('Bốn chiếc chìa khóa')
    expect(defaultSuggestion.parts[0].title).toBe('Cái cốc sứ trắng')
    expect(defaultSuggestion.fourKeys.what).toContain('Cốc sứ trắng')
  })

  it('preserves full text for Stage 5 in ISLAND_6_STAGE_NAMES without truncation', () => {
    expect(ISLAND_6_STAGE_NAMES[4]).toBe('5. 🎨 Thực hành (AI Studio)')
  })

  it('defines SSOT mottos for all 7 creative engines in ENGINE_DEFAULT_MOTTOS', async () => {
    const { ENGINE_DEFAULT_MOTTOS } = await import('./LectureDrawer')
    expect(Object.keys(ENGINE_DEFAULT_MOTTOS)).toEqual([
      'magic-keys',
      'style-prism',
      'prompt-doctor',
      'layer-stacking',
      'identity-lock',
      'card-forge',
      'creative-notebook',
    ])

    expect(ENGINE_DEFAULT_MOTTOS['magic-keys']).toContain('4 Chìa khóa vạn năng')
    expect(ENGINE_DEFAULT_MOTTOS['style-prism']).toContain('Lăng kính phù thủy')
    expect(ENGINE_DEFAULT_MOTTOS['prompt-doctor']).toContain('Bác sĩ AIKI')
    expect(ENGINE_DEFAULT_MOTTOS['layer-stacking']).toContain('3 Tầng sân khấu')
    expect(ENGINE_DEFAULT_MOTTOS['identity-lock']).toContain('Khóa mật mã ADN')
    expect(ENGINE_DEFAULT_MOTTOS['card-forge']).toContain('Xưởng đúc thẻ bài')
    expect(ENGINE_DEFAULT_MOTTOS['creative-notebook']).toContain('câu chuyện này là của riêng cậu')
  })

  it('automatically derives lockedFeatures from 4 keys without requiring manual entry', () => {
    const fourKeys = {
      what: ['Cốc sứ trắng', 'Bình trà'],
      how: ['men bóng mẻ miệng', 'màu xanh ngọc'],
      action: ['đang bốc khói nghi ngút', 'đứng yên'],
      where: ['trên bàn gỗ mộc', 'trong tủ kính'],
    }
    const autoLocked = [fourKeys.what?.[0], fourKeys.how?.[0], fourKeys.action?.[0], fourKeys.where?.[0]].filter(Boolean)

    expect(autoLocked).toEqual([
      'Cốc sứ trắng',
      'men bóng mẻ miệng',
      'đang bốc khói nghi ngút',
      'trên bàn gỗ mộc',
    ])
    expect(autoLocked.length).toBe(4)
  })
})
