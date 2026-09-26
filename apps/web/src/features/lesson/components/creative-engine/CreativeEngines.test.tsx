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
import { IdentityLockEngine, IDENTITY_CHARACTERS } from './engines/IdentityLockEngine'
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
        'bai-2-1': 'creative-notebook',
        'bai-2-2': 'layer-stacking',
        'bai-2-3': 'style-prism',
        'bai-2-4': 'magic-keys',
        // M3
        'bai-3-1': 'creative-notebook',
        'bai-3-2': 'identity-lock',
        'bai-3-3': 'identity-lock',
        'bai-3-4': 'layer-stacking',
        // M4
        'bai-4-1': 'creative-notebook',
        'bai-4-2': 'creative-notebook',
        'bai-4-3': 'creative-notebook',
        'bai-4-4': 'identity-lock',
        'bai-4-5': 'creative-notebook',
        // M5
        'bai-5-1': 'creative-notebook',
        'bai-5-2': 'creative-notebook',
        'bai-5-3': 'style-prism',
        'bai-5-4': 'creative-notebook',
        'bai-5-5': 'creative-notebook',
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
      expect(getCreativeEngineMode('bai-4-1-3-cong-cua-vuong-quoc')).toBe('creative-notebook')
      expect(getCreativeEngineMode('bai-4-3-ban-do-8-o-p1-mo')).toBe('creative-notebook')
      expect(getCreativeEngineMode('bai-5-5-dau-truong-khai-mo')).toBe('creative-notebook')
      expect(getCreativeEngineMode('m2.3')).toBe('style-prism')
      expect(getCreativeEngineMode('island3_lesson1')).toBe('creative-notebook')
      expect(getCreativeEngineMode('island4_lesson2')).toBe('creative-notebook')
    })

    it('extracts lesson keys accurately', () => {
      expect(extractLessonKey('bai-1-1')).toBe('1.1')
      expect(extractLessonKey('bai-4-1-3-cong-cua-vuong-quoc')).toBe('4.1')
      expect(extractLessonKey('m5.3')).toBe('5.3')
      expect(extractLessonKey('island2_lesson4')).toBe('2.4')
      expect(extractLessonKey('rule-1')).toBeNull()
    })

    it('has full configuration info for all 7 engine modes', () => {
      expect(ALL_CREATIVE_ENGINE_MODES).toHaveLength(7)
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
      expect(html).toContain('4 Chìa Khóa Vàng AIKI')
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

    it('renders PromptDoctorEngine with clinic cases, cures, and reference error image', () => {
      const onPromptChange = vi.fn()
      const html = renderToStaticMarkup(
        <PromptDoctorEngine
          onPromptChange={onPromptChange}
        />
      )
      expect(html).toContain('data-testid="prompt-doctor-engine"')
      expect(html).toContain('Bệnh Viện Câu Lệnh AIKids')
      expect(html).toContain('Tay sáu ngón')
      expect(html).toContain('Tủ Thuốc Thần Kỳ')
      expect(html).toContain('data-testid="doctor-cure-slot"')
      // Khung hiển thị ảnh tham chiếu bệnh án trực quan
      expect(html).toContain('🏥 BỆNH VIỆN TRANH LỖI · ẢNH BỆNH NHÂN CẦN KHÁM')
      expect(html).toContain('doctor_hand_broken_v1.webp')
      expect(html).toContain('bàn tay năm ngón')
    })

    it('renders CreativeEngineShell with canvasSlot for style-prism and prompt-doctor modes', () => {
      const prismHtml = renderToStaticMarkup(
        <CreativeEngineShell
          mode="style-prism"
          currentPrompt="Cỗ xe bay cà rốt"
          onPromptChange={vi.fn()}
          onGenerate={vi.fn()}
          attemptsLeft={6}
          maxAttempts={6}
          isGenerating={false}
          canvasSlot={<div data-testid="mock-canvas-slot">Mock Canvas Display</div>}
        />
      )
      expect(prismHtml).toContain('data-testid="style-prism-engine"')
      expect(prismHtml).toContain('data-testid="mock-canvas-slot"')
      expect(prismHtml).toContain('Mock Canvas Display')

      const doctorHtml = renderToStaticMarkup(
        <CreativeEngineShell
          mode="prompt-doctor"
          currentPrompt="Hiệp sĩ bọc giáp cầm kiếm thần"
          onPromptChange={vi.fn()}
          onGenerate={vi.fn()}
          attemptsLeft={6}
          maxAttempts={6}
          isGenerating={false}
          canvasSlot={<div data-testid="mock-canvas-slot">Mock Doctor Canvas</div>}
        />
      )
      expect(doctorHtml).toContain('data-testid="prompt-doctor-engine"')
      expect(doctorHtml).toContain('data-testid="mock-canvas-slot"')
      expect(doctorHtml).toContain('Mock Doctor Canvas')
    })

    it('renders LayerStackingEngine with 3 depth layers', () => {
      const html = renderToStaticMarkup(
        <LayerStackingEngine
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('data-testid="layer-stacking-engine"')
      expect(html).toContain('Bố Cục 3 Tầng Sân Khấu')
      expect(html).toContain('HẬU CẢNH (XA NHẤT)')
      expect(html).toContain('NGÔI SAO CHÍNH (ĐIỂM NHẤN 1/3)')
      expect(html).toContain('TIỀN CẢNH (GẦN NHẤT)')
    })

    it('renders IdentityLockEngine with 4 characters in Subject Bar and ADN locks', () => {
      const html = renderToStaticMarkup(
        <IdentityLockEngine
          characterName="Bí"
          lockedFeatures={['Mũ len đỏ có quả bông trắng', 'Áo khoác xanh dương hai túi']}
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('data-testid="identity-lock-engine"')
      expect(html).toContain('BỘ CHỦ THỂ NHÂN VẬT')
      expect(html).toContain('Bí')
      expect(html).toContain('Tép')
      expect(html).toContain('Bông')
      expect(html).toContain('Rô')
      expect(html).toContain('3 Ổ Khóa Vàng VIP Bất Biến')
      expect(html).toContain('Mũ len đỏ có quả bông trắng')
      expect(html).toContain('Áo khoác xanh dương hai túi')
      expect(html).toContain('Bánh Xe 6 Biểu Cảm')
    })

    it('emits 4 activeBlocks (Subject, DNA lock, Expression, Action) and full prompt', async () => {
      const onPromptChange = vi.fn()
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)

      await act(async () => {
        root.render(
          <IdentityLockEngine
            onPromptChange={onPromptChange}
          />
        )
      })

      expect(onPromptChange).toHaveBeenCalled()
      const lastCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
      const [assembledPrompt, activeBlocks] = lastCall

      // Prompt string includes character name, locked features, expression, action
      expect(assembledPrompt).toContain('Bí')
      expect(assembledPrompt).toContain('Mũ len đỏ có quả bông trắng')

      // activeBlocks has 4 blocks
      expect(activeBlocks).toHaveLength(4)
      expect(activeBlocks[0].category).toBe('subject')
      expect(activeBlocks[0].label).toBe('Bí')
      expect(activeBlocks[1].category).toBe('modifier')
      expect(activeBlocks[1].label).toBe('3 Ổ khóa ADN')
      expect(activeBlocks[2].category).toBe('expression')
      expect(activeBlocks[3].category).toBe('action')

      await act(async () => {
        root.unmount()
      })
      container.remove()
    })

    it('switches character when activeCharacterIndex changes', async () => {
      const onPromptChange = vi.fn()
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)

      await act(async () => {
        root.render(
          <IdentityLockEngine
            activeCharacterIndex={1}
            onPromptChange={onPromptChange}
          />
        )
      })

      const lastCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
      const [assembledPrompt, activeBlocks] = lastCall

      expect(assembledPrompt).toContain('Tép')
      expect(assembledPrompt).toContain('Khăn quàng ca-rô đỏ')
      expect(activeBlocks[0].label).toBe('Tép')

      await act(async () => {
        root.unmount()
      })
      container.remove()
    })

    it('interactively switches among all 4 standard characters with full prompt and activeBlocks synchronization', async () => {
      const onPromptChange = vi.fn()
      const onCharacterChange = vi.fn()
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)

      await act(async () => {
        root.render(
          <IdentityLockEngine
            onPromptChange={onPromptChange}
            onCharacterChange={onCharacterChange}
          />
        )
      })

      // Verify all 4 characters can be clicked and update UI, prompt and blocks
      for (let i = 0; i < IDENTITY_CHARACTERS.length; i++) {
        const char = IDENTITY_CHARACTERS[i]
        const btn = container.querySelector(`[data-testid="character-button-${char.id}"]`) as HTMLButtonElement
        expect(btn).toBeTruthy()

        await act(async () => {
          btn.click()
        })

        expect(onCharacterChange).toHaveBeenCalledWith(i)
        expect(container.textContent).toContain(`3 Ổ Khóa Vàng VIP Bất Biến: ${char.name}`)

        for (const feat of char.lockedFeatures) {
          expect(container.textContent).toContain(feat)
        }

        const lastCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
        const [assembledPrompt, activeBlocks] = lastCall

        expect(assembledPrompt).toContain(char.name)
        for (const feat of char.lockedFeatures) {
          expect(assembledPrompt).toContain(feat)
        }

        expect(activeBlocks).toHaveLength(4)
        expect(activeBlocks[0].category).toBe('subject')
        expect(activeBlocks[0].label).toBe(char.name)
        expect(activeBlocks[1].category).toBe('modifier')
        expect(activeBlocks[1].label).toBe('3 Ổ khóa ADN')
        expect(activeBlocks[2].category).toBe('expression')
        expect(activeBlocks[3].category).toBe('action')
      }

      await act(async () => {
        root.unmount()
      })
      container.remove()
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
      expect(html).toContain('Vẽ đi AIKI! · còn 6 lượt')
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

    it('renders MagicKeysEngine for Chú Mèo Mướp Vàng with cat base vocabulary only and no cup blocks', () => {
      const html = renderToStaticMarkup(
        <MagicKeysEngine
          selectedSubject="Chú Mèo Mướp Vàng"
          lessonId="bai-1-1"
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('Lông vằn vàng cam')
      expect(html).toContain('Béo tròn bụ bẫm')
      expect(html).toContain('Đeo chuông vàng')
      expect(html).not.toContain('Mẻ miệng một góc')
      expect(html).not.toContain('Sứ trắng men bóng')
    })

    it('renders MagicKeysEngine for Mèo Béo Ngủ Ghế Mây with sleeping cat vocabulary', () => {
      const html = renderToStaticMarkup(
        <MagicKeysEngine
          selectedSubject="Mèo Béo Ngủ Ghế Mây"
          lessonId="bai-1-1"
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('Cuộn tròn như cuộn len')
      expect(html).toContain('Má phúng phính say sưa')
      expect(html).toContain('Bộ lông xù mềm mại')
      expect(html).not.toContain('Mẻ miệng một góc')
    })

    it('renders MagicKeysEngine for Mèo Bắt Bướm Nắng Vàng with butterfly catching vocabulary', () => {
      const html = renderToStaticMarkup(
        <MagicKeysEngine
          selectedSubject="Mèo Bắt Bướm Nắng Vàng"
          lessonId="bai-1-1"
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('Ánh mắt chăm chú sáng ngời')
      expect(html).toContain('Bốn chân nhanh thoăn thoắt')
      expect(html).toContain('Vằn cam rực rỡ dưới nắng')
      expect(html).not.toContain('Mẻ miệng một góc')
    })

    it('renders MagicKeysEngine for Mèo Phi Hành Gia with astronaut cat vocabulary', () => {
      const html = renderToStaticMarkup(
        <MagicKeysEngine
          selectedSubject="Mèo Phi Hành Gia"
          lessonId="bai-1-1"
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('Bộ đồ phi hành gia trắng')
      expect(html).toContain('Mũ kính tròn trong suốt')
      expect(html).toContain('Huy hiệu sao vàng ngực')
      expect(html).not.toContain('Mẻ miệng một góc')
    })

    it('renders MagicKeysEngine for Căn Cứ Hốc Cây Sóc Bông with treehouse base vocabulary', () => {
      const html = renderToStaticMarkup(
        <MagicKeysEngine
          selectedSubject="Căn Cứ Hốc Cây Sóc Bông"
          lessonId="bai-3-4"
          onPromptChange={vi.fn()}
        />
      )
      expect(html).toContain('Đèn nấm ma thuật')
      expect(html).toContain('Thang dây bện vỏ cây')
      expect(html).not.toContain('Mẻ miệng một góc')
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
      expect(html).toContain('Giỏ mây trước xe')
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

    it('renders full multi-line prompt without line-clamp truncation in PromptPreviewBar', () => {
      const longPrompt = 'Cái đồng hồ cổ vỏ bằng gỗ mun sẫm màu chạm trổ cổ kính đôi kim thanh mảnh uốn lượn phong cách quý tộc treo trang trọng trên bức tường gạch đỏ mộc mạc'
      const html = renderToStaticMarkup(
        <PromptPreviewBar generatedPrompt={longPrompt} />
      )
      expect(html).toContain('break-words text-slate-900')
      expect(html).not.toContain('line-clamp')
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

      // Kiểm tra container linked blocks tồn tại & có thanh cuộn giới hạn độ cao không tràn khung
      expect(html).toContain('data-testid="prompt-linked-blocks"')
      expect(html).toContain('max-h-[72px]')
      expect(html).toContain('sm:max-h-[82px]')
      expect(html).toContain('overflow-y-auto')

      // Kiểm tra chip có break-words và whitespace-normal bảo vệ layout mobile/tablet không bị cắt chữ
      expect(html).toContain('max-w-full')
      expect(html).toContain('break-words')
      expect(html).toContain('whitespace-normal')

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

    it('positions promptSlot above canvasSlot and spans canvasSlot full-width in MagicKeysEngine', () => {
      const html = renderToStaticMarkup(
        <MagicKeysEngine
          selectedSubject="Cái cốc sứ trắng"
          lessonId="bai-1-2"
          onPromptChange={vi.fn()}
          practiceSlot={<div data-testid="test-practice">Món đồ</div>}
          canvasSlot={<div data-testid="test-canvas">Tranh vẽ</div>}
          promptSlot={<div data-testid="test-prompt-slot">Thanh câu lệnh</div>}
        />
      )

      expect(html).toContain('data-testid="test-practice"')
      expect(html).toContain('data-testid="test-canvas"')
      expect(html).toContain('data-testid="test-prompt-slot"')

      // PromptSlot: Row 2 under 4 keys when < xl, span 3 at row 2 when >= xl
      expect(html).toContain('md:col-span-2 md:row-start-2 xl:col-span-3 xl:row-start-2')
      // CanvasSlot: Row 3 when < xl, column 3 row 1 when >= xl, NO md:max-w-2xl, NO md:justify-self-center
      expect(html).toContain('md:col-span-2 md:row-start-3 xl:col-span-1 xl:col-start-3 xl:row-start-1')
      expect(html).not.toContain('md:max-w-2xl')
      expect(html).not.toContain('md:justify-self-center')
    })

    it('passes promptBarContent as promptSlot to MagicKeysEngine in CreativeEngineShell without bottom duplication', () => {
      const html = renderToStaticMarkup(
        <CreativeEngineShell
          mode="magic-keys"
          characterName="Cái cốc sứ trắng"
          lessonId="bai-1-2"
          currentPrompt="Cái cốc sứ trắng"
          onPromptChange={vi.fn()}
          onGenerate={vi.fn()}
          attemptsLeft={6}
          maxAttempts={6}
          isGenerating={false}
          practiceSlot={<div data-testid="test-practice">Món đồ</div>}
          canvasSlot={<div data-testid="test-canvas">Tranh vẽ</div>}
        />
      )

      // PromptPreviewBar and draw button are rendered
      expect(html).toContain('data-testid="prompt-preview-bar"')
      expect(html).toContain('data-testid="studio-draw-btn"')

      // Grid classes ensure promptSlot is placed at row 2 above canvasSlot at row 3
      expect(html).toContain('md:col-span-2 md:row-start-2 xl:col-span-3 xl:row-start-2')
      expect(html).toContain('md:col-span-2 md:row-start-3 xl:col-span-1 xl:col-start-3 xl:row-start-1')

      // Ensure draw button is not duplicated (only 1 occurrence)
      const drawBtnCount = (html.match(/data-testid="studio-draw-btn"/g) || []).length
      expect(drawBtnCount).toBe(1)
    })

    it('notifies parent about reference image url via onRefImageChange in PromptDoctorEngine', () => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)
      const onRefImageChange = vi.fn()

      act(() => {
        root.render(
          <PromptDoctorEngine
            onPromptChange={vi.fn()}
            onRefImageChange={onRefImageChange}
          />
        )
      })

      expect(onRefImageChange).toHaveBeenCalledWith('/assets/aiki-doctor/doctor_hand_broken_v1.webp')

      act(() => {
        root.unmount()
      })
      container.remove()
    })

    it('combines old broken prompt and cure into complete prompt with brokenBlock and cure in PromptDoctorEngine', () => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)
      const onPromptChange = vi.fn()

      act(() => {
        root.render(
          <PromptDoctorEngine
            onPromptChange={onPromptChange}
          />
        )
      })

      // Initial state: brokenBlock (câu lệnh cũ) is passed
      expect(onPromptChange).toHaveBeenCalled()
      const lastCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
      expect(lastCall[0]).toContain('một bàn tay đang cầm bút')
      expect(lastCall[1]).toHaveLength(1)
      expect(lastCall[1][0].category).toBe('subject')
      expect(lastCall[1][0].label).toBe('một bàn tay đang cầm bút')

      // Select first cure (5 ngón tay)
      const cureCard = container.querySelector('[data-testid^="cure-card-"]') as HTMLElement
      expect(cureCard).not.toBeNull()
      act(() => {
        cureCard.click()
      })

      // Combined prompt: old prompt + cure text, with both blocks
      const afterCureCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
      expect(afterCureCall[0]).toContain('một bàn tay đang cầm bút, ')
      expect(afterCureCall[1]).toHaveLength(2)
      expect(afterCureCall[1][0].category).toBe('subject')
      expect(afterCureCall[1][1].category).toBe('cure')

      act(() => {
        root.unmount()
      })
      container.remove()
    })

    it('renders PromptPreviewBar in prompt-doctor mode with prescription badge and medicine prefix tags', () => {
      const brokenBlock = {
        id: 'broken-hand',
        label: 'Hiệp sĩ bọc giáp cầm kiếm thần',
        text: 'Hiệp sĩ bọc giáp cầm kiếm thần',
        category: 'subject' as const,
        icon: '📜',
        colorScheme: 'amber' as const,
      }
      const cureBlock = {
        id: 'cure-hand',
        label: 'Vẽ chuẩn 5 ngón tay giáp',
        text: 'bàn tay bọc găng giáp bạc có đầy đủ chuẩn xác đúng 5 ngón tay',
        category: 'cure' as const,
        icon: '✋',
        colorScheme: 'emerald' as const,
      }

      // Khi có đủ cả câu lệnh cũ và đơn thuốc
      const html = renderToStaticMarkup(
        <PromptPreviewBar
          mode="prompt-doctor"
          blocks={[brokenBlock, cureBlock]}
          generatedPrompt="Hiệp sĩ bọc giáp cầm kiếm thần, bàn tay bọc găng giáp bạc có đầy đủ chuẩn xác đúng 5 ngón tay"
        />
      )

      expect(html).toContain('Đã kê đơn thuốc ✨')
      expect(html).not.toContain('/4 Chìa Khóa')
      expect(html).not.toContain('🔑 1')
      expect(html).toContain('📜 Bệnh án: ')
      expect(html).toContain('💊 Đơn thuốc: ')
      expect(html).toContain('Hiệp sĩ bọc giáp cầm kiếm thần')
      expect(html).toContain('bàn tay bọc găng giáp bạc có đầy đủ chuẩn xác đúng 5 ngón tay')
    })

    it('supports single cure slot prescription with replacement, toggle removal, and diagnostic feedback', async () => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)
      const onPromptChange = vi.fn()

      await act(async () => {
        root.render(
          <PromptDoctorEngine
            onPromptChange={onPromptChange}
          />
        )
      })

      // Tiêu đề kê 1 liều duy nhất
      expect(container.textContent).toContain('ĐƠN THUỐC ĐẶC TRỊ CHO TRANH (KÊ 1 LIỀU DUY NHẤT)')

      // Tìm thẻ thuốc đúng (5 ngón tay) và thẻ bẫy (Mũ len)
      const cureHand = container.querySelector('[data-testid="cure-card-cure-5-ngon-tay"]') as HTMLElement
      const cureHat = container.querySelector('[data-testid="cure-card-cure-mu-len"]') as HTMLElement
      expect(cureHand).not.toBeNull()
      expect(cureHat).not.toBeNull()

      // 1. Click liều thuốc đúng đặc trị (5 ngón tay)
      await act(async () => {
        cureHand.click()
      })

      let lastCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
      expect(lastCall[1]).toHaveLength(2) // 1 broken + 1 cure
      expect(lastCall[0]).toContain('một bàn tay năm ngón đang cầm bút chì')
      // Hiển thị huy hiệu bốc đúng thuốc đặc trị
      expect(container.textContent).toContain('🎉 ĐÃ BỐC ĐÚNG THUỐC ĐẶC TRỊ! TRANH SẼ HẾT LỖI!')

      // 2. Click liều thuốc bẫy (Mũ len) -> Thay thế liều cũ vào ô duy nhất (Single Cure Slot)
      await act(async () => {
        cureHat.click()
      })

      lastCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
      expect(lastCall[1]).toHaveLength(2) // Vẫn đúng 1 broken + 1 cure (thay thế, không dồn tích)
      expect(lastCall[0]).toContain('một bạn nhỏ đội mũ len đỏ')
      expect(lastCall[0]).not.toContain('một bàn tay năm ngón đang cầm bút chì')
      // Hiển thị cảnh báo bốc nhầm thuốc
      expect(container.textContent).toContain('⚠️ BỐC NHẦM THUỐC RỒI! BÉ HÃY THỬ LẠI NHÉ!')
      expect(container.textContent).toContain('thuốc này không chữa được bệnh của Tay sáu ngón')

      // 3. Click nút X trên thẻ thuốc để gỡ bỏ
      const removeButton = container.querySelector('[data-testid="doctor-cure-slot"] button') as HTMLElement
      expect(removeButton).not.toBeNull()

      await act(async () => {
        removeButton.click()
      })

      lastCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
      expect(lastCall[1]).toHaveLength(1) // Chỉ còn lại 1 brokenBlock
      expect(lastCall[0]).toBe('một bàn tay đang cầm bút')
      expect(container.textContent).toContain('Chạm hoặc kéo 1 liều thuốc đặc trị bên dưới vào đây để chữa bệnh')

      act(() => {
        root.unmount()
      })
      container.remove()
    })

    it('synchronizes active case when activeCaseIndex prop is provided and triggers onCaseChange on switch', async () => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)
      const onPromptChange = vi.fn()
      const onCaseChange = vi.fn()

      // Render với activeCaseIndex = 1 (Ca 2: Sóc Bông)
      await act(async () => {
        root.render(
          <PromptDoctorEngine
            activeCaseIndex={1}
            onCaseChange={onCaseChange}
            onPromptChange={onPromptChange}
          />
        )
      })

      // Kiểm tra bệnh án hiển thị đúng Mất cái mũ
      expect(container.textContent).toContain('Mất cái mũ')
      expect(container.textContent).toContain('một bạn nhỏ đội mũ đang đứng trong sân')

      // Click chuyển sang Ca 3 (Thừa ba con chim)
      const caseButtons = container.querySelectorAll('button')
      const catButton = Array.from(caseButtons).find((b) => b.textContent?.includes('Ca 3: Thừa ba con chim'))
      expect(catButton).toBeDefined()

      await act(async () => {
        catButton?.click()
      })

      expect(onCaseChange).toHaveBeenCalledWith(2)

      act(() => {
        root.unmount()
      })
      container.remove()
    })

    it('toggles cure card selection off when tapping the active card in cabinet again', async () => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)
      const onPromptChange = vi.fn()

      await act(async () => {
        root.render(<PromptDoctorEngine onPromptChange={onPromptChange} />)
      })

      const cureHand = container.querySelector('[data-testid="cure-card-cure-5-ngon-tay"]') as HTMLElement
      expect(cureHand).not.toBeNull()

      // 1st click: selects cure
      await act(async () => {
        cureHand.click()
      })
      let lastCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
      expect(lastCall[1]).toHaveLength(2)
      expect(container.textContent).toContain('✓ Đang kê đơn')

      // 2nd click: unselects cure back to empty slot
      await act(async () => {
        cureHand.click()
      })
      lastCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
      expect(lastCall[1]).toHaveLength(1)
      expect(lastCall[0]).toBe('một bàn tay đang cầm bút')
      expect(container.textContent).toContain('+ Kê đơn')
      expect(container.textContent).not.toContain('✓ Đang kê đơn')

      act(() => {
        root.unmount()
      })
      container.remove()
    })

    it('validates Case 2 (Mất cái mũ) and Case 3 (Thừa ba con chim) special cures vs trap medicines', async () => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)
      const onPromptChange = vi.fn()

      // --- CASE 2: Mất cái mũ ---
      await act(async () => {
        root.render(
          <PromptDoctorEngine
            activeCaseIndex={1}
            onPromptChange={onPromptChange}
          />
        )
      })

      // Select Trap Medicine: cure-5-ngon-tay
      const trapHand = container.querySelector('[data-testid="cure-card-cure-5-ngon-tay"]') as HTMLElement
      await act(async () => {
        trapHand.click()
      })
      expect(container.textContent).toContain('⚠️ BỐC NHẦM THUỐC RỒI! BÉ HÃY THỬ LẠI NHÉ!')
      expect(container.textContent).toContain('thuốc này không chữa được bệnh của Mất cái mũ')
      const slotElement = container.querySelector('[data-testid="doctor-cure-slot"]') as HTMLElement
      expect(slotElement.className).toContain('border-amber-400')

      // Select Special Cure: cure-mu-len (replaces trap medicine in single slot)
      const specialHat = container.querySelector('[data-testid="cure-card-cure-mu-len"]') as HTMLElement
      await act(async () => {
        specialHat.click()
      })
      expect(container.textContent).toContain('🎉 ĐÃ BỐC ĐÚNG THUỐC ĐẶC TRỊ! TRANH SẼ HẾT LỖI!')
      expect(container.textContent).not.toContain('⚠️ BỐC NHẦM THUỐC RỒI')
      expect(slotElement.className).toContain('border-emerald-400')

      // --- CASE 3: Thừa ba con chim ---
      await act(async () => {
        root.render(
          <PromptDoctorEngine
            activeCaseIndex={2}
            onPromptChange={onPromptChange}
          />
        )
      })

      // Select Trap Medicine: cure-mu-len
      const trapHat = container.querySelector('[data-testid="cure-card-cure-mu-len"]') as HTMLElement
      await act(async () => {
        trapHat.click()
      })
      expect(container.textContent).toContain('⚠️ BỐC NHẦM THUỐC RỒI! BÉ HÃY THỬ LẠI NHÉ!')
      expect(container.textContent).toContain('thuốc này không chữa được bệnh của Thừa ba con chim')

      // Select Special Cure: cure-cay-khong-chim
      const specialBird = container.querySelector('[data-testid="cure-card-cure-cay-khong-chim"]') as HTMLElement
      await act(async () => {
        specialBird.click()
      })
      expect(container.textContent).toContain('🎉 ĐÃ BỐC ĐÚNG THUỐC ĐẶC TRỊ! TRANH SẼ HẾT LỖI!')
      expect(container.textContent).not.toContain('⚠️ BỐC NHẦM THUỐC RỒI')

      act(() => {
        root.unmount()
      })
      container.remove()
    })

    it('opens and closes reference image zoom lightbox modal', async () => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)

      await act(async () => {
        root.render(<PromptDoctorEngine onPromptChange={vi.fn()} />)
      })

      // Click thumbnail to zoom
      const zoomThumbnail = container.querySelector('div[title="Bấm để xem ảnh bệnh án phóng to soi lỗi"]') as HTMLElement
      expect(zoomThumbnail).not.toBeNull()

      await act(async () => {
        zoomThumbnail.click()
      })

      // Lightbox dialog should be open
      const dialog = container.querySelector('div[role="dialog"]') as HTMLElement
      expect(dialog).not.toBeNull()
      expect(dialog.textContent).toContain('Bệnh Án Tham Chiếu: Tay sáu ngón')

      // Click close button
      const closeBtn = dialog.querySelector('button') as HTMLButtonElement
      expect(closeBtn).not.toBeNull()

      await act(async () => {
        closeBtn.click()
      })

      expect(container.querySelector('div[role="dialog"]')).toBeNull()

      act(() => {
        root.unmount()
      })
      container.remove()
    })
  })

  describe('Standardized Subjects & Pedagogical Flow across all Engines', () => {
    const mockPracticeParts = [
      { partNumber: 1, title: 'Hiệp Sĩ Cáo Lửa (Chiến tướng Hệ Hỏa)', icon: '🦊', emoji: '🦊' },
      { partNumber: 2, title: 'Rồng Băng Bão Tuyết (Chiến tướng Hệ Băng)', icon: '🐉', emoji: '🐉' },
      { partNumber: 3, title: 'Sư Tử Lửa Cuồng Nộ (Chiến tướng Hệ Hỏa)', icon: '🦁', emoji: '🦁' },
      { partNumber: 4, title: 'Đại Bàng Lôi Thần (Chiến tướng Hệ Sét)', icon: '🦅', emoji: '🦅' },
    ]

    it('CardForgeEngine: renders 3 pedagogical steps and emits card-subject as first activeBlock', async () => {
      const onPromptChange = vi.fn()
      const onPartChange = vi.fn()
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)

      await act(async () => {
        root.render(
          <CardForgeEngine
            practiceParts={mockPracticeParts}
            activePartIndex={0}
            onPartChange={onPartChange}
            onPromptChange={onPromptChange}
          />
        )
      })

      // Kiểm tra 3 bước sư phạm được đánh số rõ ràng
      expect(container.textContent).toContain('CHỌN CHIẾN TƯỚNG (CHỦ THỂ)')
      expect(container.textContent).toContain('CHỌN HỆ NGUYÊN TỐ (KỸ NĂNG)')
      expect(container.textContent).toContain('PHÂN BỔ 3 CHỈ SỐ')

      // Kiểm tra nạp 4 chiến tướng từ practiceParts
      expect(container.textContent).toContain('Hiệp Sĩ Cáo Lửa')
      expect(container.textContent).toContain('Rồng Băng Bão Tuyết')
      expect(container.textContent).toContain('Sư Tử Lửa Cuồng Nộ')
      expect(container.textContent).toContain('Đại Bàng Lôi Thần')

      // Kiểm tra activeBlocks xuất ra có 3 thẻ, thẻ chủ thể đứng đầu
      const lastCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
      const [assembled, blocks] = lastCall

      expect(assembled).toContain('thẻ bài TCG minh họa Hiệp Sĩ Cáo Lửa')
      expect(blocks).toHaveLength(3)
      expect(blocks[0].id).toBe('card-subject')
      expect(blocks[0].category).toBe('subject')
      expect(blocks[0].label).toBe('Hiệp Sĩ Cáo Lửa')
      expect(blocks[1].id).toBe('card-elem')
      expect(blocks[1].category).toBe('stat-trait')
      expect(blocks[2].id).toBe('card-stats')
      expect(blocks[2].category).toBe('stat-trait')

      // Click chọn chiến tướng thứ 2 (Rồng Băng Bão Tuyết)
      const champBtn2 = container.querySelector('[data-testid="champion-button-champ-2"]') as HTMLButtonElement
      expect(champBtn2).not.toBeNull()

      await act(async () => {
        champBtn2.click()
      })

      expect(onPartChange).toHaveBeenCalledWith(1)
      const afterClickCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
      expect(afterClickCall[0]).toContain('thẻ bài TCG minh họa Rồng Băng Bão Tuyết')
      expect(afterClickCall[1][0].label).toBe('Rồng Băng Bão Tuyết')

      act(() => {
        root.unmount()
      })
      container.remove()
    })

    it('StylePrismEngine: renders 3 steps with subject and lighting, emitting 3 activeBlocks', async () => {
      const onPromptChange = vi.fn()
      const onPartChange = vi.fn()
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)

      await act(async () => {
        root.render(
          <StylePrismEngine
            practiceParts={mockPracticeParts}
            activePartIndex={0}
            onPartChange={onPartChange}
            onPromptChange={onPromptChange}
          />
        )
      })

      // Kiểm tra 3 bước
      expect(container.textContent).toContain('CHỌN ĐỐI TƯỢNG BIẾN HÌNH (CHỦ THỂ)')
      expect(container.textContent).toContain('CHỌN LĂNG KÍNH PHONG CÁCH')
      expect(container.textContent).toContain('TÙY CHỌN ÁNH SÁNG & KHÔNG GIAN')

      // Kiểm tra nạp chủ thể từ practiceParts
      expect(container.textContent).toContain('Hiệp Sĩ Cáo Lửa')

      // Kiểm tra activeBlocks có 3 thẻ: prism-subject, style, lighting
      const lastCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
      const [assembled, blocks] = lastCall

      expect(blocks).toHaveLength(3)
      expect(blocks[0].id).toBe('prism-subject')
      expect(blocks[0].category).toBe('subject')
      expect(blocks[0].label).toBe('Hiệp Sĩ Cáo Lửa')
      expect(blocks[1].category).toBe('style')
      expect(blocks[2].category).toBe('lighting-mood')
      expect(assembled).toContain('Hiệp Sĩ Cáo Lửa')

      // Click đổi sang chủ thể thứ 2
      const subBtn2 = container.querySelector('[data-testid="subject-button-sub-2"]') as HTMLButtonElement
      expect(subBtn2).not.toBeNull()

      await act(async () => {
        subBtn2.click()
      })

      expect(onPartChange).toHaveBeenCalledWith(1)
      const afterClickCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
      expect(afterClickCall[0]).toContain('Rồng Băng Bão Tuyết')
      expect(afterClickCall[1][0].label).toBe('Rồng Băng Bão Tuyết')

      act(() => {
        root.unmount()
      })
      container.remove()
    })

    it('LayerStackingEngine: puts Star 1/3 (Subject) step first and leads activeBlocks', async () => {
      const onPromptChange = vi.fn()
      const onPartChange = vi.fn()
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)

      await act(async () => {
        root.render(
          <LayerStackingEngine
            practiceParts={mockPracticeParts}
            activePartIndex={0}
            onPartChange={onPartChange}
            onPromptChange={onPromptChange}
          />
        )
      })

      // Kiểm tra Bước 1 là Ngôi sao chính
      const starSlot = container.querySelector('[data-testid="layer-slot-star"]')
      expect(starSlot).not.toBeNull()
      expect(starSlot?.textContent).toContain('Bước 1')
      expect(starSlot?.textContent).toContain('NGÔI SAO CHÍNH (ĐIỂM NHẤN 1/3)')
      expect(starSlot?.textContent).toContain('Hiệp Sĩ Cáo Lửa')

      // Kiểm tra activeBlocks: Thẻ Ngôi Sao đứng đầu
      const lastCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
      const [assembled, blocks] = lastCall

      expect(blocks.length).toBeGreaterThanOrEqual(2)
      expect(blocks[0].category).toBe('subject')
      expect(blocks[0].label).toBe('Hiệp Sĩ Cáo Lửa')
      expect(assembled).toContain('Hiệp Sĩ Cáo Lửa')

      act(() => {
        root.unmount()
      })
      container.remove()
    })

    it('IdentityLockEngine: dynamically loads characters from practiceParts and keeps subject first', async () => {
      const onPromptChange = vi.fn()
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)

      await act(async () => {
        root.render(
          <IdentityLockEngine
            practiceParts={mockPracticeParts}
            onPromptChange={onPromptChange}
          />
        )
      })

      expect(container.textContent).toContain('Hiệp Sĩ Cáo Lửa')
      expect(container.textContent).toContain('Rồng Băng Bão Tuyết')

      const lastCall = onPromptChange.mock.calls[onPromptChange.mock.calls.length - 1]
      const [assembled, blocks] = lastCall

      expect(blocks[0].category).toBe('subject')
      expect(blocks[0].label).toBe('Hiệp Sĩ Cáo Lửa')
      expect(assembled).toContain('Hiệp Sĩ Cáo Lửa')

      act(() => {
        root.unmount()
      })
      container.remove()
    })

    it('MagicKeysEngine: reverse syncs slots when currentPrompt changes from outside', async () => {
      const onPromptChange = vi.fn()
      const container = document.createElement('div')
      document.body.appendChild(container)
      const root = createRoot(container)

      await act(async () => {
        root.render(
          <MagicKeysEngine
            selectedSubject="Cái cốc sứ trắng"
            lessonId="bai-1-2"
            currentPrompt="Cái cốc sứ trắng"
            onPromptChange={onPromptChange}
          />
        )
      })

      // Giờ người dùng xem lại một ảnh có prompt đã kết hợp đầy đủ
      const fullPrompt = 'Cái cốc sứ trắng chất liệu men sứ màu trắng sữa bóng bẩy mịn màng làn hơi nóng bốc lên nghi ngút thơm lừng'
      await act(async () => {
        root.render(
          <MagicKeysEngine
            selectedSubject="Cái cốc sứ trắng"
            lessonId="bai-1-2"
            currentPrompt={fullPrompt}
            onPromptChange={onPromptChange}
          />
        )
      })

      // Kiểm tra slot color-shape và action đã được đồng bộ với block tương ứng
      const slotColorShape = container.querySelector('[data-testid="slot-slot-color-shape"]')
      expect(slotColorShape?.textContent).toContain('Sứ trắng men bóng')

      const slotAction = container.querySelector('[data-testid="slot-slot-action"]')
      expect(slotAction?.textContent).toContain('Đang bốc khói nghi ngút')

      act(() => {
        root.unmount()
      })
      container.remove()
    })
  })
})
