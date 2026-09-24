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

  it('Level 4: Tự động lùi về ảnh 3 khóa chuẩn khi bé chọn 4 chìa khóa (Mèo + Béo tròn + Vươn vai)', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-meo-muop', 'cs-cat-beo-tron', 'act-cat-vuon-vai', 'ctx-cat-bau-cua'],
      prompt: 'Chú mèo mướp béo tròn vươn vai ngáp dài bên bậu cửa sổ',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron__act-cat-vuon-vai.webp'
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

  it('Level 4: Trả về ảnh 4 khóa chuẩn xác khi bé chọn đủ 4 chìa khóa (Mèo + Lông vằn + Dạo bước + Thảm cỏ)', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-meo-muop', 'cs-cat-long-van-vang', 'act-cat-dao-buoc', 'ctx-cat-tham-co'],
      prompt: 'Chú mèo mướp lông vằn vàng cam dạo bước trên thảm cỏ',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-long-van-vang__act-cat-dao-buoc__ctx-cat-tham-co.webp'
    )
  })

  it('Hierarchical Fallback: Khi bé chọn 4 khóa nhưng bối cảnh chưa generate, tự động lùi về cấp 3', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-meo-muop', 'cs-cat-beo-tron', 'act-cat-liem-chan', 'ctx-cat-chua-co-anh'],
      prompt: 'Chú mèo mướp béo tròn đang liếm chân ở nơi chưa có ảnh',
    })
    // Tự động lùi về cấp độ 3 (liếm chân) đã có sẵn!
    expect(img).toBe(
      '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-beo-tron__act-cat-liem-chan.webp'
    )
  })

  it('Keyword extraction: Khi blockIds trống, tự động phân tích prompt ra 4 khóa', () => {
    const img = resolveExactComboImage({
      blockIds: [],
      prompt: 'Chú mèo mướp lông vằn vàng dạo bước trên thảm cỏ',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/cat/combo__sub-meo-muop__cs-cat-long-van-vang__act-cat-dao-buoc__ctx-cat-tham-co.webp'
    )
  })

  it('Full Fallback: Khi không có blockIds và không có từ khóa hợp lệ, tự động fallback mượt mà về non-repeating fallback', () => {
    const img = resolveExactComboImage({
      prompt: 'khủng long bay trên sao hỏa',
      engineMode: 'magic-keys',
    })
    expect(img).toBeDefined()
    expect(typeof img).toBe('string')
  })
})

describe('resolveExactComboImage (Bài 1.2: Cốc Sứ Trắng)', () => {
  it('Level 1: Trả về ảnh 1 từ ngơ ngác khi chọn Cốc Sứ Trắng', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-coc-su'],
      prompt: 'Cái cốc sứ trắng tinh',
    })
    expect(img).toBe('/assets/pregenerated-combos/ceramic-cup/combo__sub-coc-su.webp')
  })

  it('Level 2: Trả về ảnh 2 khóa khi chọn Cốc Sứ + Sứ trắng men bóng', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-coc-su', 'cs-su-trang-men-bong'],
      prompt: 'Cái cốc sứ trắng men bóng',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/ceramic-cup/combo__sub-coc-su__cs-su-trang-men-bong.webp'
    )
  })

  it('Level 2: Trả về ảnh 2 khóa khi chọn Cốc Sứ + Mẻ miệng một góc', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-coc-su', 'cs-me-mieng-goc'],
      prompt: 'Cái cốc sứ mẻ miệng một góc',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/ceramic-cup/combo__sub-coc-su__cs-me-mieng-goc.webp'
    )
  })

  it('Level 3: Trả về ảnh 3 khóa khi chọn Cốc Sứ + Men bóng + Bốc khói nghi ngút', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-coc-su', 'cs-su-trang-men-bong', 'act-khoi-nghi-ngut'],
      prompt: 'Cái cốc sứ trắng men bóng bốc khói nghi ngút',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/ceramic-cup/combo__sub-coc-su__cs-su-trang-men-bong__act-khoi-nghi-ngut.webp'
    )
  })

  it('Level 4: Trả về ảnh 4 khóa chuẩn xác khi chọn đủ 4 chìa khóa (Cốc sứ + Men bóng + Bốc khói + Bàn gỗ sồi)', () => {
    const img = resolveExactComboImage({
      blockIds: [
        'sub-coc-su',
        'cs-su-trang-men-bong',
        'act-khoi-nghi-ngut',
        'ctx-ban-go-soi',
      ],
      prompt: 'Cái cốc sứ trắng men bóng bốc khói nghi ngút trên bàn gỗ sồi mộc',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/ceramic-cup/combo__sub-coc-su__cs-su-trang-men-bong__act-khoi-nghi-ngut__ctx-ban-go-soi.webp'
    )
  })

  it('Level 4: Trả về ảnh 4 khóa chuẩn cho Quai tròn + Chứa đầy trà + Bậu cửa sổ', () => {
    const img = resolveExactComboImage({
      blockIds: [
        'sub-coc-su',
        'cs-quai-cam-tron',
        'act-chua-tra-nong',
        'ctx-bau-cua-so',
      ],
      prompt: 'Cái cốc sứ quai tròn xinh chứa đầy trà nóng bên bậu cửa sổ',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/ceramic-cup/combo__sub-coc-su__cs-quai-cam-tron__act-chua-tra-nong__ctx-bau-cua-so.webp'
    )
  })
})

describe('resolveExactComboImage (Bài 1.2: Xe Đạp Mini)', () => {
  it('Level 1: Trả về ảnh 1 từ ngơ ngác khi chọn Chiếc Xe Đạp', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-xe-dap'],
      prompt: 'Chiếc xe đạp mini',
    })
    expect(img).toBe('/assets/pregenerated-combos/bicycle/combo__sub-xe-dap.webp')
  })

  it('Level 2: Trả về ảnh 2 khóa khi chọn Xe Đạp + Khung thép xanh bóng', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-xe-dap', 'cs-bike-khung-xanh'],
      prompt: 'Chiếc xe đạp khung thép xanh bóng',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/bicycle/combo__sub-xe-dap__cs-bike-khung-xanh.webp'
    )
  })

  it('Level 3: Trả về ảnh 3 khóa khi chọn Xe Đạp + Giỏ mây + Chở giỏ hoa rực rỡ', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-xe-dap', 'cs-bike-gio-may', 'act-bike-cho-gio-hoa'],
      prompt: 'Chiếc xe đạp có giỏ mây chở giỏ hoa rực rỡ',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/bicycle/combo__sub-xe-dap__cs-bike-gio-may__act-bike-cho-gio-hoa.webp'
    )
  })

  it('Level 4: Trả về ảnh 4 khóa chuẩn xác khi chọn đủ 4 chìa khóa (Xe đạp + Giỏ mây + Chở giỏ hoa + Bên bờ hồ)', () => {
    const img = resolveExactComboImage({
      blockIds: [
        'sub-xe-dap',
        'cs-bike-gio-may',
        'act-bike-cho-gio-hoa',
        'ctx-bike-bo-ho',
      ],
      prompt: 'Chiếc xe đạp giỏ mây chở giỏ hoa rực rỡ bên bờ hồ lộng gió',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/bicycle/combo__sub-xe-dap__cs-bike-gio-may__act-bike-cho-gio-hoa__ctx-bike-bo-ho.webp'
    )
  })

  it('Level 4: Trả về ảnh 4 khóa cho Khung xanh + Lăn bánh bon bon + Bờ hồ', () => {
    const img = resolveExactComboImage({
      blockIds: [
        'sub-xe-dap',
        'cs-bike-khung-xanh',
        'act-bike-lan-banh',
        'ctx-bike-bo-ho',
      ],
      prompt: 'Chiếc xe đạp khung xanh đang lăn bánh bon bon bên bờ hồ',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/bicycle/combo__sub-xe-dap__cs-bike-khung-xanh__act-bike-lan-banh__ctx-bike-bo-ho.webp'
    )
  })
})

describe('resolveExactComboImage (Bài 1.2: Cuốn Sổ Tay Bìa Da)', () => {
  it('Level 1: Trả về ảnh 1 từ ngơ ngác khi chọn Cuốn Sổ Tay', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-so-tay'],
      prompt: 'Cuốn sổ tay mở bìa da nâu',
    })
    expect(img).toBe('/assets/pregenerated-combos/notebook/combo__sub-so-tay.webp')
  })

  it('Level 2: Trả về ảnh 2 khóa khi chọn Sổ Tay + Bìa da nâu cổ điển', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-so-tay', 'cs-note-bia-da'],
      prompt: 'Cuốn sổ tay bìa da nâu cổ điển',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/notebook/combo__sub-so-tay__cs-note-bia-da.webp'
    )
  })

  it('Level 3: Trả về ảnh 3 khóa khi chọn Sổ Tay + Bìa da + Mở sẵn trang vẽ', () => {
    const img = resolveExactComboImage({
      blockIds: ['sub-so-tay', 'cs-note-bia-da', 'act-note-mo-trang'],
      prompt: 'Cuốn sổ tay bìa da đang mở sẵn trang vẽ',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/notebook/combo__sub-so-tay__cs-note-bia-da__act-note-mo-trang.webp'
    )
  })

  it('Level 4: Trả về ảnh 4 khóa chuẩn xác khi chọn đủ 4 chìa khóa (Sổ tay + Bìa da + Mở trang + Trên bàn học)', () => {
    const img = resolveExactComboImage({
      blockIds: [
        'sub-so-tay',
        'cs-note-bia-da',
        'act-note-mo-trang',
        'ctx-note-ban-hoc',
      ],
      prompt: 'Cuốn sổ tay bìa da đang mở sẵn trang vẽ trên bàn học ấm cúng',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/notebook/combo__sub-so-tay__cs-note-bia-da__act-note-mo-trang__ctx-note-ban-hoc.webp'
    )
  })

  it('Level 4: Trả về ảnh 4 khóa cho Dây đỏ + Lấp lánh + Tách trà chiều', () => {
    const img = resolveExactComboImage({
      blockIds: [
        'sub-so-tay',
        'cs-note-day-do',
        'act-note-lap-lanh',
        'ctx-note-tach-tra',
      ],
      prompt: 'Cuốn sổ tay dây đỏ lấp lánh dưới ánh đèn bên tách trà chiều',
    })
    expect(img).toBe(
      '/assets/pregenerated-combos/notebook/combo__sub-so-tay__cs-note-day-do__act-note-lap-lanh__ctx-note-tach-tra.webp'
    )
  })
})
