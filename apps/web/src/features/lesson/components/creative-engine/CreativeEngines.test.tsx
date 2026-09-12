// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  getCreativeEngineMode,
  getRandomCreativeEngineMode,
  extractLessonKey,
  ENGINE_CONFIGS,
  LESSON_ENGINE_MAP,
  ALL_CREATIVE_ENGINE_MODES,
} from './data/engine-presets'
import { MagicKeysEngine } from './engines/MagicKeysEngine'
import { StylePrismEngine } from './engines/StylePrismEngine'
import { PromptDoctorEngine } from './engines/PromptDoctorEngine'
import { LayerStackingEngine } from './engines/LayerStackingEngine'
import { IdentityLockEngine } from './engines/IdentityLockEngine'
import { CardForgeEngine } from './engines/CardForgeEngine'
import { CreativeEngineShell } from './CreativeEngineShell'
import { BlockPalette } from './components/BlockPalette'
import { BlockSlotTray } from './components/BlockSlotTray'
import type { BlockSlot } from './types'
import { SurpriseRollButton } from './components/SurpriseRollButton'
import { ShuffleEngineButton } from './components/ShuffleEngineButton'
import { PromptPreviewBar } from './components/PromptPreviewBar'
import { CreativeBlockIcon } from './components/CreativeBlockIcon'
import { SUBJECT_BLOCKS, STYLE_BLOCKS, CERAMIC_CUP_BLOCKS } from './data/creative-blocks-dataset'

describe('CreativeEngine Suite', () => {
  describe('engine-presets mapping & random generator', () => {
    it('covers all 22 lessons across M1 to M5 with diverse and non-repetitive distribution', () => {
      const expectedMapping: Record<string, string> = {
        // M1
        'bai-1-1': 'magic-keys',
        'bai-1-2': 'magic-keys',
        'bai-1-3': 'style-prism',
        'bai-1-4': 'prompt-doctor',
        // M2
        'bai-2-1': 'style-prism',
        'bai-2-2': 'layer-stacking',
        'bai-2-3': 'identity-lock',
        'bai-2-4': 'layer-stacking',
        // M3
        'bai-3-1': 'card-forge',
        'bai-3-2': 'identity-lock',
        'bai-3-3': 'identity-lock',
        'bai-3-4': 'layer-stacking',
        // M4
        'bai-4-1': 'prompt-doctor',
        'bai-4-2': 'magic-keys',
        'bai-4-3': 'layer-stacking',
        'bai-4-4': 'identity-lock',
        'bai-4-5': 'style-prism',
        // M5
        'bai-5-1': 'magic-keys',
        'bai-5-2': 'card-forge',
        'bai-5-3': 'style-prism',
        'bai-5-4': 'prompt-doctor',
        'bai-5-5': 'card-forge',
      }

      expect(Object.keys(expectedMapping)).toHaveLength(22)

      for (const [lessonId, expectedMode] of Object.entries(expectedMapping)) {
        expect(getCreativeEngineMode(lessonId)).toBe(expectedMode)
      }
    })

    it('handles various lessonId formats correctly (full title slugs, mX.Y, island formats)', () => {
      expect(getCreativeEngineMode('bai-1-1-mot-tu-hay-nam-tu')).toBe('magic-keys')
      expect(getCreativeEngineMode('bai-1-2-bon-chiec-chia-khoa')).toBe('magic-keys')
      expect(getCreativeEngineMode('bai-1-3-um-ba-la-bien-hinh')).toBe('style-prism')
      expect(getCreativeEngineMode('bai-1-4-ky-su-tai-ba')).toBe('prompt-doctor')
      expect(getCreativeEngineMode('bai-4-1-3-cong-cua-vuong-quoc')).toBe('prompt-doctor')
      expect(getCreativeEngineMode('bai-4-3-ban-do-8-o-p1-mo')).toBe('layer-stacking')
      expect(getCreativeEngineMode('bai-5-5-dau-truong-khai-mo')).toBe('card-forge')
      expect(getCreativeEngineMode('m2.3')).toBe('identity-lock')
      expect(getCreativeEngineMode('island3_lesson1')).toBe('card-forge')
      expect(getCreativeEngineMode('island4_lesson2')).toBe('magic-keys')
    })

    it('extracts lesson keys accurately', () => {
      expect(extractLessonKey('bai-1-1')).toBe('1.1')
      expect(extractLessonKey('bai-4-1-3-cong-cua-vuong-quoc')).toBe('4.1')
      expect(extractLessonKey('m5.3')).toBe('5.3')
      expect(extractLessonKey('island2_lesson4')).toBe('2.4')
      expect(extractLessonKey('rule-1')).toBeNull()
    })

    it('has full configuration info for all 6 engine modes', () => {
      for (const mode of ALL_CREATIVE_ENGINE_MODES) {
        const cfg = ENGINE_CONFIGS[mode]
        expect(cfg).toBeDefined()
        expect(cfg.title).toBeTruthy()
        expect(cfg.icon).toBeTruthy()
        expect(cfg.description).toBeTruthy()
        expect(cfg.badge).toBeTruthy()
      }
    })

    it('selects random engine mode with getRandomCreativeEngineMode and honors excludeCurrent', () => {
      for (let i = 0; i < 25; i++) {
        const mode = getRandomCreativeEngineMode()
        expect(ALL_CREATIVE_ENGINE_MODES).toContain(mode)
      }

      for (const currentMode of ALL_CREATIVE_ENGINE_MODES) {
        for (let i = 0; i < 15; i++) {
          const nextMode = getRandomCreativeEngineMode(currentMode)
          expect(nextMode).not.toBe(currentMode)
          expect(ALL_CREATIVE_ENGINE_MODES).toContain(nextMode)
        }
      }
    })

    it('supports randomSeed and deterministic hash for unmapped lesson IDs', () => {
      // With explicit numeric randomSeed
      const modeA = getCreativeEngineMode('unknown-lesson', undefined, 10)
      const modeB = getCreativeEngineMode('different-unknown-lesson', undefined, 10)
      expect(modeA).toBe(modeB)

      // With string randomSeed
      const modeStringSeed1 = getCreativeEngineMode(undefined, undefined, 'seed-abc')
      const modeStringSeed2 = getCreativeEngineMode(undefined, undefined, 'seed-abc')
      expect(modeStringSeed1).toBe(modeStringSeed2)

      // Fallback for empty parameters
      expect(getCreativeEngineMode()).toBe('magic-keys')

      // Stable deterministic hash for unknown lesson name
      const custom1 = getCreativeEngineMode('ngoai-khoa-mua-he-ai')
      const custom2 = getCreativeEngineMode('ngoai-khoa-mua-he-ai')
      expect(custom1).toBe(custom2)
    })
  })

  describe('Components static markup rendering', () => {
    it('renders BlockPalette with all blocks and categories', () => {
      const html = renderToStaticMarkup(
        <BlockPalette
          blocks={SUBJECT_BLOCKS}
          onSelectBlock={vi.fn()}
        />
      )
      expect(html).toContain('data-testid="block-palette"')
      expect(html).toContain('Chú Sóc Bông')
      expect(html).toContain('Chú Mèo Mướp')
    })

    it('renders BlockSlotTray with slotted blocks and empty slots', () => {
      const slots = [
        {
          id: 'slot-1',
          keyId: 'subject',
          label: '🔑 1. Cái gì?',
          required: true,
          currentBlock: SUBJECT_BLOCKS[0],
        },
        {
          id: 'slot-2',
          keyId: 'action',
          label: '🔑 2. Làm gì?',
          required: false,
        },
      ]

      const html = renderToStaticMarkup(
        <BlockSlotTray
          slots={slots}
          onRemoveBlock={vi.fn()}
        />
      )

      expect(html).toContain('data-testid="block-slot-tray"')
      expect(html).toContain('Cái gì?')
      expect(html).toContain('Chú Sóc Bông')
      expect(html).toContain('data-testid="slot-remove-slot-1"')
      expect(html).toContain('+ Chạm để chọn')
    })

    it('renders SurpriseRollButton with dice icon and 48px touch target', () => {
      const html = renderToStaticMarkup(
        <SurpriseRollButton onRoll={vi.fn()} />
      )
      expect(html).toContain('data-testid="surprise-roll-btn"')
      expect(html).toContain('Xúc Xắc Ma Thuật')
      expect(html).toContain('min-h-[48px]')
    })

    it('renders ShuffleEngineButton with 48px touch target and dice icon', () => {
      const html = renderToStaticMarkup(
        <ShuffleEngineButton
          currentMode="magic-keys"
          onShuffle={vi.fn()}
        />
      )
      expect(html).toContain('data-testid="shuffle-engine-btn"')
      expect(html).toContain('🎲 Đổi Engine Ngẫu Nhiên')
      expect(html).toContain('min-h-[48px]')
    })
  })

  describe('Interactive components behavior', () => {
    it('triggers onShuffle with a new random engine mode when ShuffleEngineButton is clicked', async () => {
      const onShuffle = vi.fn()
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)

      await act(async () => {
        root.render(
          <ShuffleEngineButton
            currentMode="magic-keys"
            onShuffle={onShuffle}
          />
        )
      })

      const btn = container.querySelector('[data-testid="shuffle-engine-btn"]') as HTMLButtonElement
      expect(btn).not.toBeNull()

      await act(async () => {
        btn.click()
      })

      expect(onShuffle).toHaveBeenCalledTimes(1)
      const selectedMode = onShuffle.mock.calls[0][0]
      expect(selectedMode).not.toBe('magic-keys')
      expect(ALL_CREATIVE_ENGINE_MODES).toContain(selectedMode)

      act(() => {
        root.unmount()
      })
      container.remove()
    })
  })

  describe('Engines rendering and interaction', () => {
    it('renders MagicKeysEngine cleanly', () => {
      const html = renderToStaticMarkup(
        <MagicKeysEngine
          characterName="Chú Mèo Mướp Béo"
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('data-testid="magic-keys-engine"')
      expect(html).toContain('4 Chìa Khóa Vàng AKI')
      expect(html).toContain('Khay Thẻ Bài 4 Nhóm Chìa Khóa')
    })

    it('renders StylePrismEngine with 4 art styles', () => {
      const html = renderToStaticMarkup(
        <StylePrismEngine
          characterName="Chú Mèo Mướp"
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('data-testid="style-prism-engine"')
      expect(html).toContain('Lăng Kính Phù Thủy')
      expect(html).toContain('Đất Nặn Soft Clay')
      expect(html).toContain('Màu Nước Loang Mềm')
      expect(html).toContain('Truyện Tranh Chibi')
      expect(html).toContain('Tranh Đông Hồ')
    })

    it('renders PromptDoctorEngine with clinic cases and cures', () => {
      const html = renderToStaticMarkup(
        <PromptDoctorEngine
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('data-testid="prompt-doctor-engine"')
      expect(html).toContain('Bệnh Viện Câu Lệnh AIKids')
      expect(html).toContain('Bàn Tay Hiệp Sĩ Biến Dạng')
      expect(html).toContain('Tủ Thuốc Thần Kỳ')
      expect(html).toContain('data-testid="doctor-cure-slot"')
    })

    it('renders LayerStackingEngine with 3 depth layers', () => {
      const html = renderToStaticMarkup(
        <LayerStackingEngine
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('data-testid="layer-stacking-engine"')
      expect(html).toContain('Bố Cục 3 Tầng Sân Khấu')
      expect(html).toContain('Hậu Cảnh (Phía sau)')
      expect(html).toContain('Ngôi Sao Chính (Trung tâm 1/3)')
      expect(html).toContain('Tiền Cảnh (Sát ống kính)')
    })

    it('renders IdentityLockEngine with 3 VIP locks and expression wheel', () => {
      const html = renderToStaticMarkup(
        <IdentityLockEngine
          characterName="Sóc Bông"
          lockedFeatures={['Mũ len đỏ', 'Đuôi to xù cam']}
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('data-testid="identity-lock-engine"')
      expect(html).toContain('3 Ổ Khóa Vàng VIP Bất Biến')
      expect(html).toContain('Mũ len đỏ')
      expect(html).toContain('Đuôi to xù cam')
      expect(html).toContain('Bánh Xe 6 Biểu Cảm')
    })

    it('renders CardForgeEngine with element selector and 3 stat sliders', () => {
      const html = renderToStaticMarkup(
        <CardForgeEngine
          characterName="Rồng Băng Tinh Thể"
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('data-testid="card-forge-engine"')
      expect(html).toContain('Xưởng Đúc Thẻ Bài TCG')
      expect(html).toContain('Băng Tuyết')
      expect(html).toContain('TẤN CÔNG (ATK)')
      expect(html).toContain('PHÒNG THỦ (DEF)')
      expect(html).toContain('TRÍ TUỆ (MAG)')
      expect(html).toContain('Chuẩn Cân Bằng')
    })

    it('renders CreativeEngineShell with simplified engine-hidden UI and without surprise roll button', () => {
      const html = renderToStaticMarkup(
        <CreativeEngineShell
          currentPrompt="Sóc Bông đang ôm quả thông"
          onPromptChange={vi.fn()}
          onGenerate={vi.fn()}
          attemptsLeft={6}
          maxAttempts={6}
          isGenerating={false}
          characterName="Sóc Bông"
          lessonId="bai-3-2"
          stepQuickPrompt="Sóc Bông"
        />
      )
      expect(html).toContain('data-testid="creative-engine-shell"')
      expect(html).toContain('data-testid="studio-step-quick-btn"')
      // Đã ẩn hoàn toàn khái niệm Engine khỏi frontend theo yêu cầu của Sếp
      expect(html).not.toContain('data-testid="engine-tab-magic-keys"')
      expect(html).not.toContain('data-testid="engine-tab-identity-lock"')
      expect(html).not.toContain('data-testid="shuffle-engine-btn"')
      // Nút xúc xắc đã được loại bỏ hoàn toàn theo yêu cầu của Sếp, thanh preview câu lệnh, input và nút vẽ vẫn đầy đủ
      expect(html).not.toContain('data-testid="surprise-roll-btn"')
      expect(html).toContain('data-testid="prompt-preview-bar"')
      expect(html).toContain('data-testid="studio-prompt-input"')
      expect(html).toContain('data-testid="studio-draw-btn"')
      expect(html).toContain('Vẽ đi AKI! · còn 6 lượt')
    })

    it('renders BlockPalette with 3 distinct step tabs and without "Tất cả" tab', () => {
      const categories = [
        { id: 'color-shape', label: '2. Trông thế nào', icon: '🎨' },
        { id: 'action', label: '3. Đang làm gì', icon: '🏃' },
        { id: 'context', label: '4. Ở đâu', icon: '🌲' },
      ]
      const html = renderToStaticMarkup(
        <BlockPalette
          blocks={CERAMIC_CUP_BLOCKS}
          categories={categories}
          onSelectBlock={vi.fn()}
        />
      )
      expect(html).not.toContain('Tất cả')
      expect(html).toContain('2. Trông thế nào')
      expect(html).toContain('3. Đang làm gì')
      expect(html).toContain('4. Ở đâu')
      // Mặc định tab 1 được chọn, hiển thị thẻ Sứ trắng men bóng
      expect(html).toContain('Sứ trắng men bóng')
    })

    it('renders MagicKeysEngine for cup subject with ceramic cup vocabulary only', () => {
      const html = renderToStaticMarkup(
        <MagicKeysEngine
          characterName="Cái cốc sứ trắng"
          lessonId="bai-1-2"
          onPromptChange={vi.fn()}
        />
      )
      // Thẻ từ vựng Cốc sứ
      expect(html).toContain('Sứ trắng men bóng')
      expect(html).toContain('Mẻ miệng một góc')
      // Không chứa từ vựng thú cưng
      expect(html).not.toContain('Mũ len đỏ quả bông')
      expect(html).not.toContain('Lông vằn cam trắng')
    })

    it('renders MagicKeysEngine for bicycle subject with bicycle vocabulary', () => {
      const html = renderToStaticMarkup(
        <MagicKeysEngine
          selectedSubject="Cái xe đạp"
          lessonId="bai-1-2"
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('Khung thép xanh bóng')
      expect(html).toContain('Bánh nan hoa tròn')
      expect(html).toContain('Chuông kính coong nhỏ')
      expect(html).not.toContain('Sứ trắng men bóng')
    })

    it('renders MagicKeysEngine for notebook subject with notebook vocabulary', () => {
      const html = renderToStaticMarkup(
        <MagicKeysEngine
          selectedSubject="Cuốn sổ tay mở"
          lessonId="bai-1-2"
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('Bìa da nâu cổ điển')
      expect(html).toContain('Trang giấy ngả vàng')
      expect(html).toContain('Dây đánh dấu đỏ')
      expect(html).not.toContain('Sứ trắng men bóng')
    })

    it('renders MagicKeysEngine for clock subject with clock vocabulary', () => {
      const html = renderToStaticMarkup(
        <MagicKeysEngine
          selectedSubject="Cái đồng hồ cổ"
          lessonId="bai-1-2"
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('Vỏ gỗ mun cổ kính')
      expect(html).toContain('Mặt số la mã vàng')
      expect(html).toContain('Kim đồng hồ tích tắc')
      expect(html).not.toContain('Sứ trắng men bóng')
    })

    it('renders BlockPalette with multi-row flex-wrap layout without horizontal scrolling', () => {
      const html = renderToStaticMarkup(
        <BlockPalette
          blocks={CERAMIC_CUP_BLOCKS}
          onSelectBlock={vi.fn()}
        />
      )
      expect(html).toContain('flex flex-wrap items-center gap-2')
      expect(html).not.toContain('overflow-x-auto')
    })

    it('hides quick prompt button in PromptPreviewBar when prompt already contains the phrase', () => {
      // Khi prompt chưa có từ khóa -> hiển thị bình thường (không có class hidden)
      const htmlNotIncluded = renderToStaticMarkup(
        <PromptPreviewBar
          generatedPrompt="đang bốc khói nghi ngút"
          stepQuickPrompt="Cái cốc sứ trắng"
        />
      )
      expect(htmlNotIncluded).toContain('data-testid="studio-step-quick-btn"')
      expect(htmlNotIncluded).not.toContain('hidden')

      // Khi prompt đã chứa từ khóa -> tự động thêm class hidden để ẩn khỏi UI
      const htmlIncluded = renderToStaticMarkup(
        <PromptPreviewBar
          generatedPrompt="Cái cốc sứ trắng đang bốc khói nghi ngút"
          stepQuickPrompt="Cốc Sứ"
        />
      )
      expect(htmlIncluded).toContain('data-testid="studio-step-quick-btn"')
      expect(htmlIncluded).toContain('hidden')
    })

    it('renders full multi-line prompt without line-clamp-1 truncation in PromptPreviewBar', () => {
      const longPrompt = 'Cái đồng hồ cổ vỏ bằng gỗ mun sẫm màu chạm trổ cổ kính đôi kim thanh mảnh uốn lượn phong cách quý tộc treo trang trọng trên bức tường gạch đỏ mộc mạc'
      const html = renderToStaticMarkup(
        <PromptPreviewBar generatedPrompt={longPrompt} />
      )
      expect(html).toContain('line-clamp-2 sm:line-clamp-3 break-words text-slate-900')
      expect(html).not.toContain('line-clamp-1 break-words')
      expect(html).toContain(longPrompt)
    })

    it('renders PromptPreviewBar as linked word blocks with key badges and connectors when blocks are present', () => {
      const mockBlocks = [
        {
          id: 'sub-cup',
          label: 'Cái cốc sứ trắng',
          text: 'Cái cốc sứ trắng',
          category: 'subject' as const,
        },
        {
          id: 'shape-flaw',
          label: 'Vết mẻ nhỏ',
          text: 'vết mẻ nhỏ một góc miệng cốc mộc mạc',
          category: 'color-shape' as const,
        },
        {
          id: 'act-sit',
          label: 'Đang đặt ngay ngắn',
          text: 'đang được đặt ngay ngắn đón ánh nắng sớm',
          category: 'action' as const,
        },
        {
          id: 'ctx-desk',
          label: 'Cạnh sổ tay',
          text: 'đặt cạnh một cuốn sổ tay đang mở trang giấy vẽ',
          category: 'context' as const,
        },
      ]
      const generatedPrompt =
        'Cái cốc sứ trắng vết mẻ nhỏ một góc miệng cốc mộc mạc đang được đặt ngay ngắn đón ánh nắng sớm đặt cạnh một cuốn sổ tay đang mở trang giấy vẽ'

      const html = renderToStaticMarkup(
        <PromptPreviewBar
          blocks={mockBlocks}
          generatedPrompt={generatedPrompt}
        />
      )

      // Kiểm tra container linked blocks tồn tại
      expect(html).toContain('data-testid="prompt-linked-blocks"')

      // Kiểm tra 4 khối từ vựng
      expect(html).toContain('data-testid="prompt-block-chip-sub-cup"')
      expect(html).toContain('data-testid="prompt-block-chip-shape-flaw"')
      expect(html).toContain('data-testid="prompt-block-chip-act-sit"')
      expect(html).toContain('data-testid="prompt-block-chip-ctx-desk"')

      // Kiểm tra nhãn chìa khóa 🔑 1, 🔑 2, 🔑 3, 🔑 4
      expect(html).toContain('🔑 1')
      expect(html).toContain('🔑 2')
      expect(html).toContain('🔑 3')
      expect(html).toContain('🔑 4')

      // Kiểm tra dấu cộng '+' kết nối các khối
      expect(html).toContain('+')

      // Kiểm tra nội dung text của các khối
      expect(html).toContain('Cái cốc sứ trắng')
      expect(html).toContain('vết mẻ nhỏ một góc miệng cốc mộc mạc')
      expect(html).toContain('đang được đặt ngay ngắn đón ánh nắng sớm')
      expect(html).toContain('đặt cạnh một cuốn sổ tay đang mở trang giấy vẽ')

      // Kiểm tra sr-only chứa toàn bộ prompt cho accessibility
      expect(html).toContain('sr-only')
      expect(html).toContain(generatedPrompt)
    })

    it('renders CreativeBlockIcon as 2D Flat Soft Clay SVG without white box wrapper in BlockSlotTray', () => {
      const slots = [
        {
          id: 'slot-subject',
          keyId: 'subject',
          label: 'Chìa Khóa 1',
          required: true,
          currentBlock: {
            id: 'sub-clock',
            label: 'Cái đồng hồ cổ',
            text: 'Cái đồng hồ cổ',
            category: 'subject' as const,
            icon: '⏰',
          },
        },
      ]
      const html = renderToStaticMarkup(
        <BlockSlotTray slots={slots} onRemoveBlock={vi.fn()} />
      )
      // Không còn hộp trắng bg-white/95 border bao quanh icon
      expect(html).not.toContain('size-8 sm:size-9 rounded-xl bg-white/95 border')
      // Có SVG của đồng hồ cổ
      expect(html).toContain('aria-label="Cái đồng hồ cổ"')
      expect(html).toContain('<svg')
    })

    it('renders CreativeBlockIcon for all M1.2 clock vocabulary items with high quality SVG', () => {
      const items = [
        { label: 'Cốc sứ trắng', icon: '☕', expectedSvgLabel: 'Cốc sứ trắng' },
        { label: 'Chiếc xe đạp', icon: '🚲', expectedSvgLabel: 'Cái xe đạp' },
        { label: 'Cuốn sổ tay mở', icon: '📖', expectedSvgLabel: 'Cuốn sổ tay mở' },
        { label: 'Cái đồng hồ cổ', icon: '⏰', expectedSvgLabel: 'Cái đồng hồ cổ' },
        { label: 'Mặt số la mã vàng', icon: '🟡', expectedSvgLabel: 'Mặt số la mã vàng' },
        { label: 'Kim đồng hồ tích tắc', icon: '⏱️', expectedSvgLabel: 'Kim đồng hồ tích tắc' },
        { label: 'Quả lắc đồng đu đưa', icon: '🔔', expectedSvgLabel: 'Quả lắc đồng đu đưa' },
        { label: 'Chân đế chạm hoa', icon: '🌺', expectedSvgLabel: 'Chân đế chạm hoa' },
        { label: 'Treo trên tường gạch', icon: '🧱', expectedSvgLabel: 'Treo trên tường gạch' },
        { label: 'Trên lò sưởi ấm áp', icon: '🔥', expectedSvgLabel: 'Trên lò sưởi ấm áp' },
        { label: 'Trên kệ sách phòng khách', icon: '📚', expectedSvgLabel: 'Trên kệ sách phòng khách' },
        { label: 'Bên cửa sổ nhìn ra vườn', icon: '🪟', expectedSvgLabel: 'Bên cửa sổ nhìn ra vườn' },
        { label: 'Phản chiếu nắng chiều', icon: '✨', expectedSvgLabel: 'Bụi sao' },
      ]

      for (const item of items) {
        const html = renderToStaticMarkup(
          <CreativeBlockIcon label={item.label} icon={item.icon} size={32} />
        )
        expect(html).toContain('<svg')
        expect(html).toContain(item.expectedSvgLabel)
      }
    })

    it('renders 3D Subject Image in slot-subject and corner key badges without icons in slots 2-4', () => {
      const html = renderToStaticMarkup(
        <MagicKeysEngine
          selectedSubject="Cái đồng hồ cổ"
          lessonId="bai-1-2"
          onPromptChange={vi.fn()}
        />
      )
      // Ô 1: Có ảnh 3D thật của Cái đồng hồ cổ (TUYỆT ĐỐI KHÔNG PHẢI ẢNH CHÌA KHÓA)
      expect(html).toContain('/assets/aiki-islands/island1_lesson2_clock.jpg')
      expect(html).not.toContain('/assets/aiki-keys/key_what_blue.jpg')
      expect(html).not.toContain('/assets/aiki-keys/key_subject_cup.jpg')
      // Không còn icon hộp emoji cũ trong ô slot
      expect(html).not.toContain('☕')
      // Badge chìa khóa ở góc
      expect(html).toContain('<span>🔑</span>')
      // Tiêu đề ngắn gọn không bị ngắt dòng
      expect(html).toContain('Cái gì?')
      expect(html).toContain('Trông thế nào')
      expect(html).toContain('Đang làm gì')
      expect(html).toContain('Ở đâu?')
      expect(html).not.toContain('● Bắt buộc')
      // Các ô slot chưa chọn hiển thị gợi ý text của slot
      expect(html).toContain('+ Chọn đặc điểm')
    })

    it('renders real 3D teacup image (not key image) when cup is selected', () => {
      const html = renderToStaticMarkup(
        <MagicKeysEngine
          selectedSubject="Cái cốc sứ trắng"
          lessonId="bai-1-2"
          onPromptChange={vi.fn()}
        />
      )
      // Ô 1: Đúng ảnh chiếc cốc sứ thật island1_lesson2_teacup.jpg, TUYỆT ĐỐI KHÔNG PHẢI key_subject_cup.jpg
      expect(html).toContain('/assets/aiki-islands/island1_lesson2_teacup.jpg')
      expect(html).not.toContain('/assets/aiki-keys/key_subject_cup.jpg')
    })

    it('opens dedicated modal for each key without shared category tabs and closes immediately on selection', async () => {
      const onPromptChange = vi.fn()
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)

      await act(async () => {
        root.render(
          <MagicKeysEngine
            selectedSubject="Cái cốc sứ trắng"
            lessonId="bai-1-2"
            onPromptChange={onPromptChange}
          />
        )
      })

      // 1. Modal ban đầu đóng (hidden)
      const modal = container.querySelector('[data-testid="magic-keys-palette-modal"]')
      expect(modal).not.toBeNull()
      expect(modal?.parentElement?.className).toContain('hidden')

      // 2. Click vào ô "Trông thế nào" (Ban đầu ở trạng thái Empty đầy đặn)
      const slotColorShape = container.querySelector('[data-testid="slot-slot-color-shape"]') as HTMLDivElement
      expect(slotColorShape).not.toBeNull()
      expect(slotColorShape.textContent).toContain('🎨')
      expect(slotColorShape.textContent).toContain('Màu sắc')
      expect(slotColorShape.textContent).toContain('Hình dáng')
      expect(slotColorShape.textContent).toContain('👉 + Chọn đặc điểm ✨')

      await act(async () => {
        slotColorShape.click()
      })

      // Modal được mở ra
      expect(modal?.parentElement?.className).not.toContain('hidden')
      // Header tùy biến cho chìa khóa Trông thế nào
      expect(modal?.textContent).toContain('🎨 Chọn Đặc Điểm (Trông thế nào)')
      expect(modal?.textContent).toContain('Dành cho: Cái cốc sứ trắng')

      // Tuyệt đối không có dải tab chuyển nhanh
      expect(modal?.textContent).not.toContain('3. Đang làm gì')

      // Danh sách thẻ bài hiển thị các từ của Trông thế nào
      const ceramicBlock = container.querySelector('[data-testid^="block-card-cs-"]') as HTMLDivElement
      expect(ceramicBlock).not.toBeNull()

      // 3. Chọn 1 từ vựng: đóng modal ngay lập tức, không nhảy sang slot khác
      await act(async () => {
        ceramicBlock.click()
      })

      // Modal đã đóng lại
      expect(modal?.parentElement?.className).toContain('hidden')
      // Slot đã cập nhật trạng thái filled đầy đủ thông tin: tag đã chọn và nút đổi từ
      expect(slotColorShape.textContent).toContain('✓ Đã chọn từ này')
      expect(slotColorShape.textContent).toContain('✨ Chạm để đổi từ khác')

      act(() => {
        root.unmount()
      })
      container.remove()
    })

    it('standardizes 3-tier structure (Header, Body, Footer) across all 4 golden key slots in isGrid2x2 mode', () => {
      const slots = [
        {
          id: 'slot-subject',
          keyId: 'subject',
          keyNumber: 1,
          keyTitle: 'Cái gì?',
          label: '🔑 1. Cái gì?',
          required: true,
          locked: true,
          subjectImage: '/assets/aiki-islands/island1_lesson2_clock.jpg',
          currentBlock: { id: 'sub-clock', label: 'Cái đồng hồ cổ', text: 'Cái đồng hồ cổ', category: 'subject' as const, icon: '⏰' },
        },
        {
          id: 'slot-color-shape',
          keyId: 'color-shape',
          keyNumber: 2,
          keyTitle: 'Trông thế nào',
          label: '🔑 2. Trông thế nào',
          required: true,
          hint: '+ Chọn đặc điểm',
        },
        {
          id: 'slot-action',
          keyId: 'action',
          keyNumber: 3,
          keyTitle: 'Đang làm gì',
          label: '🔑 3. Đang làm gì',
          required: true,
          currentBlock: { id: 'act-run', label: 'Đang chạy tung tăng', text: 'Đang chạy tung tăng', category: 'action' as const, icon: '🏃' },
        },
        {
          id: 'slot-context',
          keyId: 'context',
          keyNumber: 4,
          keyTitle: 'Ở đâu?',
          label: '🔑 4. Ở đâu?',
          required: true,
          hint: '+ Chọn bối cảnh',
        },
      ]

      const container = document.createElement('div')
      const root = createRoot(container)

      act(() => {
        root.render(
          <BlockSlotTray
            slots={slots}
            isGrid2x2={true}
            onRemoveBlock={vi.fn()}
          />
        )
      })

      // Cả 4 slot đều có data-testid
      const slot1 = container.querySelector('[data-testid="slot-slot-subject"]') as HTMLDivElement
      const slot2 = container.querySelector('[data-testid="slot-slot-color-shape"]') as HTMLDivElement
      const slot3 = container.querySelector('[data-testid="slot-slot-action"]') as HTMLDivElement
      const slot4 = container.querySelector('[data-testid="slot-slot-context"]') as HTMLDivElement

      expect(slot1).not.toBeNull()
      expect(slot2).not.toBeNull()
      expect(slot3).not.toBeNull()
      expect(slot4).not.toBeNull()

      // Tầng 1: Header h-[26px] với Badge Chìa Khóa
      for (const slotEl of [slot1, slot2, slot3, slot4]) {
        const header = slotEl.firstElementChild as HTMLElement
        expect(header.className).toContain('h-[26px]')
        expect(header.textContent).toContain('🔑')
      }

      // Slot 1 (đã khóa): Footer có '✓ Đã cố định món đồ'
      expect(slot1.textContent).toContain('✓ Đã cố định món đồ')
      expect(slot1.textContent).toContain('Món đồ bài học')

      // Slot 2 (chưa chọn): Footer có '+ Chọn đặc điểm'
      expect(slot2.textContent).toContain('+ Chọn đặc điểm')

      // Slot 3 (đã chọn): Footer có '✨ Chạm để đổi từ' và tag '✓ Đã chọn từ này'
      expect(slot3.textContent).toContain('✓ Đã chọn từ này')
      expect(slot3.textContent).toContain('✨ Chạm để đổi từ')

      // Slot 4 (chưa chọn): Footer có '+ Chọn bối cảnh'
      expect(slot4.textContent).toContain('+ Chọn bối cảnh')

      act(() => {
        root.unmount()
      })
      container.remove()
    })

    it('eliminates giant green checkmark circles and unifies footer buttons across all 4 slots in BlockSlotTray', () => {
      const slots: BlockSlot[] = [
        {
          id: 'slot-subject',
          keyId: 'subject',
          label: '🔑 1. Cái gì?',
          keyNumber: 1,
          keyTitle: '1. Cái gì?',
          required: true,
          category: 'subject',
          colorScheme: 'sky',
          hint: '+ Chọn món đồ',
          currentBlock: {
            id: 'block-cup',
            label: 'Cốc sứ trắng',
            text: 'Cái cốc sứ trắng',
            category: 'subject',
          },
        },
        {
          id: 'slot-color-shape',
          keyId: 'color-shape',
          label: '🔑 2. Trông thế nào',
          keyNumber: 2,
          keyTitle: '2. Trông thế nào',
          required: true,
          category: 'color-shape',
          colorScheme: 'amber',
          hint: '+ Chọn đặc điểm',
        },
        {
          id: 'slot-action',
          keyId: 'action',
          label: '🔑 3. Đang làm gì',
          keyNumber: 3,
          keyTitle: '3. Đang làm gì',
          required: true,
          category: 'action',
          colorScheme: 'mint',
          hint: '+ Chọn hành động',
          currentBlock: {
            id: 'block-smoke',
            label: 'Bốc khói nghi ngút',
            text: 'đang bốc khói nghi ngút',
            category: 'action',
          },
        },
        {
          id: 'slot-context',
          keyId: 'context',
          label: '🔑 4. Ở đâu?',
          keyNumber: 4,
          keyTitle: '4. Ở đâu?',
          required: true,
          category: 'context',
          colorScheme: 'rose',
          hint: '+ Chọn bối cảnh',
        },
      ]

      const container = document.createElement('div')
      const root = createRoot(container)

      act(() => {
        root.render(
          <BlockSlotTray
            slots={slots}
            isGrid2x2={true}
            onRemoveBlock={vi.fn()}
          />
        )
      })

      // Tuyệt đối không còn vòng tròn tick xanh to đùng ở giữa ô
      const greenCircles = container.querySelectorAll('.rounded-full.bg-emerald-100.border-2.border-emerald-300')
      expect(greenCircles.length).toBe(0)

      const slot1 = container.querySelector('[data-testid="slot-slot-subject"]') as HTMLElement
      const slot2 = container.querySelector('[data-testid="slot-slot-color-shape"]') as HTMLElement
      const slot3 = container.querySelector('[data-testid="slot-slot-action"]') as HTMLElement
      const slot4 = container.querySelector('[data-testid="slot-slot-context"]') as HTMLElement

      // Slot 1: Tên món đồ to rõ và button chỉ dẫn đổi món ở cột bên cạnh
      expect(slot1.textContent).toContain('Cốc sứ trắng')
      expect(slot1.textContent).toContain('Món đồ bài học')
      expect(slot1.textContent).toContain('👈 Đổi món ở cột bên cạnh')

      // Slot 2: Chưa chọn có dấu + to và button + Chọn đặc điểm
      expect(slot2.textContent).toContain('+')
      expect(slot2.textContent).toContain('👉 + Chọn đặc điểm ✨')

      // Slot 3: Tên từ vựng to rõ và button Chạm để đổi từ
      expect(slot3.textContent).toContain('Bốc khói nghi ngút')
      expect(slot3.textContent).toContain('✓ Đã chọn')
      expect(slot3.textContent).toContain('✨ Chạm để đổi từ')

      // Slot 4: Chưa chọn có dấu + to và button + Chọn bối cảnh
      expect(slot4.textContent).toContain('+')
      expect(slot4.textContent).toContain('👉 + Chọn bối cảnh ✨')

      act(() => {
        root.unmount()
      })
      container.remove()
    })

    it('does not open popup modal when clicking slot 1 (subject) and guides user to side panel', async () => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)

      const onPromptChange = vi.fn()

      await act(async () => {
        root.render(
          <MagicKeysEngine
            lessonId="bai-1-2"
            characterName="Cốc Sứ Trắng"
            selectedSubject="Cái cốc sứ trắng"
            onPromptChange={onPromptChange}
          />
        )
      })

      const slot1 = container.querySelector('[data-testid="slot-slot-subject"]') as HTMLDivElement
      expect(slot1).not.toBeNull()
      expect(slot1.textContent).toContain('Cái cốc sứ trắng')
      expect(slot1.textContent).toContain('👈 Đổi món ở cột bên cạnh')

      // Bé bấm vào Ô 1 "1. Cái gì?"
      await act(async () => {
        slot1.click()
      })

      // Modal KHÔNG ĐƯỢC MỞ (container modal vẫn giữ class hidden)
      const modal = container.querySelector('[data-testid="magic-keys-palette-modal"]') as HTMLDivElement
      expect(modal).not.toBeNull()
      expect(modal.parentElement?.className).toContain('hidden')

      act(() => {
        root.unmount()
      })
      container.remove()
    })
  })
})
