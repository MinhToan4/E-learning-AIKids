// @vitest-environment jsdom
;(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  getCreativeEngineMode,
  ENGINE_CONFIGS,
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
import { SUBJECT_BLOCKS, STYLE_BLOCKS } from './data/creative-blocks-dataset'

describe('CreativeEngine Suite', () => {
  describe('engine-presets mapping', () => {
    it('maps lessonIds to correct CreativeEngineMode', () => {
      expect(getCreativeEngineMode('bai-1-1')).toBe('magic-keys')
      expect(getCreativeEngineMode('bai-1-2')).toBe('magic-keys')
      expect(getCreativeEngineMode('bai-1-3')).toBe('style-prism')
      expect(getCreativeEngineMode('bai-5-3')).toBe('style-prism')
      expect(getCreativeEngineMode('bai-1-4')).toBe('prompt-doctor')
      expect(getCreativeEngineMode('bai-2-2')).toBe('layer-stacking')
      expect(getCreativeEngineMode('bai-2-4')).toBe('layer-stacking')
      expect(getCreativeEngineMode('bai-3-2')).toBe('identity-lock')
      expect(getCreativeEngineMode('bai-3-3')).toBe('identity-lock')
      expect(getCreativeEngineMode('bai-3-4')).toBe('identity-lock')
      expect(getCreativeEngineMode('bai-5-2')).toBe('card-forge')
      // Fallback
      expect(getCreativeEngineMode()).toBe('magic-keys')
    })

    it('has full configuration info for all 6 engine modes', () => {
      const modes = ['magic-keys', 'style-prism', 'prompt-doctor', 'layer-stacking', 'identity-lock', 'card-forge'] as const
      for (const mode of modes) {
        const cfg = ENGINE_CONFIGS[mode]
        expect(cfg).toBeDefined()
        expect(cfg.title).toBeTruthy()
        expect(cfg.icon).toBeTruthy()
        expect(cfg.description).toBeTruthy()
      }
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

    it('renders SurpriseRollButton with dice icon', () => {
      const html = renderToStaticMarkup(
        <SurpriseRollButton onRoll={vi.fn()} />
      )
      expect(html).toContain('data-testid="surprise-roll-btn"')
      expect(html).toContain('Xúc Xắc Ma Thuật')
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

    it('renders CreativeEngineShell with tabs switcher and prompt preview', () => {
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
      expect(html).toContain('data-testid="prompt-preview-bar"')
      expect(html).toContain('data-testid="studio-prompt-input"')
      expect(html).toContain('data-testid="studio-draw-btn"')
      expect(html).toContain('Vẽ đi AKI! · còn 6 lượt')
    })
  })
})
