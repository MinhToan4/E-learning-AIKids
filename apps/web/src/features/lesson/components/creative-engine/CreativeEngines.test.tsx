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
import { SurpriseRollButton } from './components/SurpriseRollButton'
import { ShuffleEngineButton } from './components/ShuffleEngineButton'
import { SUBJECT_BLOCKS, STYLE_BLOCKS } from './data/creative-blocks-dataset'

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
      expect(html).toContain('🔑 1. Cái gì?')
      expect(html).toContain('Chú Sóc Bông')
      expect(html).toContain('data-testid="slot-remove-slot-1"')
      expect(html).toContain('+ Chạm thẻ để gắn')
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

    it('renders CreativeEngineShell with tabs switcher, shuffle button and prompt preview', () => {
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
      expect(html).toContain('data-testid="engine-tab-magic-keys"')
      expect(html).toContain('data-testid="engine-tab-identity-lock"')
      expect(html).toContain('data-testid="shuffle-engine-btn"')
      expect(html).toContain('data-testid="surprise-roll-btn"')
      expect(html).toContain('data-testid="prompt-preview-bar"')
      expect(html).toContain('data-testid="studio-prompt-input"')
      expect(html).toContain('data-testid="studio-draw-btn"')
      expect(html).toContain('Vẽ đi AKI! · còn 6 lượt')
    })
  })
})
