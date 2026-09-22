import { describe, it, expect } from 'vitest'
import { resolveExactComboImage, AVAILABLE_PREGENERATED_COMBOS } from './combo-image-resolver'

describe('resolveExactComboImage (Trạm 1: Mèo Mướp)', () => {
  it('Level 1: Trả về ảnh 1 từ ngơ ngác khi bé chỉ chọn Chú Mèo Mướp', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-meo-muop'],
      prompt: 'Chú mèo mướp',
    })
    expect(img).toBe('/assets/pregenerated-combos/cat/combo__sub-meo-muop.webp')
  })

  it('Level 2: Trả về ảnh 2 khóa khi bé chọn Mèo Mướp + Béo tròn', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-meo-muop', 'cs-cat-beo-tron'],
      prompt: 'Chú mèo mướp béo tròn bụ bẫm',
    })
    expect(img).toBe('/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron.webp')
  })

  it('Level 2: Trả về ảnh 2 khóa khi bé chọn Mèo Mướp + Chuông vàng', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-meo-muop', 'cs-cat-chuong-vang'],
      prompt: 'Chú mèo mướp đeo chuông vàng',
    })
    expect(img).toBe('/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-chuong-vang.webp')
  })

  it('Level 3: Trả về ảnh 3 khóa khi bé chọn Mèo Mướp + Béo tròn + Liếm chân', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-meo-muop', 'cs-cat-beo-tron', 'act-cat-liem-chan'],
      prompt: 'Chú mèo mướp béo tròn đang liếm chân',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron__act-cat-liem-chan.webp'
    )
  })

  it('Level 4: Trả về ảnh 4 khóa chuẩn khi bé chọn đủ 4 chìa khóa hoàn chỉnh', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-meo-muop', 'cs-cat-beo-tron', 'act-cat-vuon-vai', 'ctx-cat-bau-cua'],
      prompt: 'Chú mèo mướp béo tròn vươn vai ngáp dài bên bậu cửa sổ',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron__act-cat-vuon-vai__ctx-cat-bau-cua.webp'
    )
  })

  it('Level 2: Trả về ảnh 2 khóa khi bé chọn Mèo Mướp + Lông vằn vàng cam', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-meo-muop', 'cs-cat-long-van-vang'],
      prompt: 'Chú mèo mướp lông vằn vàng cam',
    })
    expect(img).toBe('/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-long-van-vang.webp')
  })

  it('Level 3: Trả về ảnh 3 khóa khi bé chọn Mèo Mướp + Lông vằn vàng cam + Dạo bước', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-meo-muop', 'cs-cat-long-van-vang', 'act-cat-dao-buoc'],
      prompt: 'Chú mèo mướp lông vằn vàng cam dạo bước',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-long-van-vang__act-cat-dao-buoc.webp'
    )
  })

  it('Level 4: Trả về ảnh 4 khóa chuẩn khi bé chọn Mèo Mướp + Lông vằn + Dạo bước + Thảm cỏ', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-meo-muop', 'cs-cat-long-van-vang', 'act-cat-dao-buoc', 'ctx-cat-tham-co'],
      prompt: 'Chú mèo mướp lông vằn vàng cam dạo bước trên thảm cỏ',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-long-van-vang__act-cat-dao-buoc__ctx-cat-tham-co.webp'
    )
  })

  it('Hierarchical Fallback: Khi bé chọn 4 khóa nhưng tổ hợp 4 khóa cụ thể chưa generate, tự động lùi về cấp 3 hoặc cấp 2', () => {
    // Giả sử bé chọn combo chưa có ảnh 4 khóa: 'ctx-cat-hien-nha'
    const img = resolveExactComboImage({
      blockIds: ['sub-meo-muop', 'cs-cat-beo-tron', 'act-cat-liem-chan', 'ctx-cat-hien-nha'],
      prompt: 'Chú mèo mướp béo tròn đang liếm chân dưới hiên nhà',
    })
    // Tự động lùi về cấp độ 3 (liếm chân) đã có sẵn!
    expect(img).toBe(
      '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron__act-cat-liem-chan.webp'
    )
  })

  it('Full Fallback: Khi không có blockIds, tự động fallback mượt mà về non-repeating fallback', () => {
    const img = resolveExactComboImage({
      prompt: 'con mèo',
      engineMode: 'magic-keys',
    })
    expect(img).toBeDefined()
    expect(typeof img).toBe('string')
  })
})
