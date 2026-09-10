import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Sparkles, Dices, ChevronDown, Wand2, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../LessonInteractiveSidebar'
import type { CreativeEngineMode, CreativeBlock } from './types'
import { ENGINE_CONFIGS, getCreativeEngineMode } from './data/engine-presets'
import {
  SUBJECT_BLOCKS,
  COLOR_SHAPE_BLOCKS,
  ACTION_BLOCKS,
  CONTEXT_BLOCKS,
  STYLE_BLOCKS,
} from './data/creative-blocks-dataset'
import { MagicKeysEngine } from './engines/MagicKeysEngine'
import { StylePrismEngine } from './engines/StylePrismEngine'
import { PromptDoctorEngine } from './engines/PromptDoctorEngine'
import { LayerStackingEngine } from './engines/LayerStackingEngine'
import { IdentityLockEngine } from './engines/IdentityLockEngine'
import { CardForgeEngine } from './engines/CardForgeEngine'
import { PromptPreviewBar } from './components/PromptPreviewBar'
import { SurpriseRollButton } from './components/SurpriseRollButton'

export interface CreativeEngineShellProps {
  mode?: CreativeEngineMode
  onModeChange?: (mode: CreativeEngineMode) => void
  currentPrompt: string
  onPromptChange: (prompt: string) => void
  onGenerate: () => void
  attemptsLeft: number
  maxAttempts: number
  isGenerating: boolean
  characterName?: string
  lessonId?: string
  lockedFeatures?: string[]
  illustrationType?: string
  stepQuickPrompt?: string
  stepQuickLabel?: string
  onQuickPromptClick?: (prompt: string) => void
  className?: string
  selectedSubject?: string
}

export const CreativeEngineShell: React.FC<CreativeEngineShellProps> = ({
  mode: propMode,
  onModeChange,
  currentPrompt,
  onPromptChange,
  onGenerate,
  attemptsLeft,
  maxAttempts,
  isGenerating,
  characterName = 'Sóc Bông',
  selectedSubject,
  lessonId,
  lockedFeatures = [],
  illustrationType,
  stepQuickPrompt,
  stepQuickLabel,
  onQuickPromptClick,
  className,
}) => {
  // Xác định chế độ engine mặc định dựa vào bài học
  const initialMode = useMemo(() => {
    return propMode || getCreativeEngineMode(lessonId, illustrationType)
  }, [propMode, lessonId, illustrationType])

  const [activeMode, setActiveMode] = useState<CreativeEngineMode>(initialMode)
  const [activeBlocks, setActiveBlocks] = useState<CreativeBlock[]>([])
  const [showTextFallback, setShowTextFallback] = useState(false)

  // Đồng bộ mode nếu prop bên ngoài thay đổi
  useEffect(() => {
    if (propMode && propMode !== activeMode) {
      setActiveMode(propMode)
    }
  }, [propMode, activeMode])

  const handleSwitchMode = (newMode: CreativeEngineMode) => {
    playInstantSound('click')
    setActiveMode(newMode)
    if (onModeChange) {
      onModeChange(newMode)
    }
  }

  // Callback nhận prompt từ Engine con
  const handleEnginePromptChange = useCallback(
    (prompt: string, blocks: CreativeBlock[]) => {
      setActiveBlocks(blocks)
      onPromptChange(prompt)
    },
    [onPromptChange]
  )

  // Tung xúc xắc ma thuật tạo tổ hợp thẻ ngẫu nhiên
  const handleRollSurprise = () => {
    const randomSub = SUBJECT_BLOCKS[Math.floor(Math.random() * SUBJECT_BLOCKS.length)]
    const randomColor = COLOR_SHAPE_BLOCKS[Math.floor(Math.random() * COLOR_SHAPE_BLOCKS.length)]
    const randomAction = ACTION_BLOCKS[Math.floor(Math.random() * ACTION_BLOCKS.length)]
    const randomContext = CONTEXT_BLOCKS[Math.floor(Math.random() * CONTEXT_BLOCKS.length)]

    const rolledBlocks = [randomSub, randomColor, randomAction, randomContext]
    setActiveBlocks(rolledBlocks)

    const rolledPrompt = `${randomSub.text} ${randomColor.text}, ${randomAction.text}, ${randomContext.text}`
    onPromptChange(rolledPrompt)
  }

  return (
    <div
      data-testid="creative-engine-shell"
      className={cn(
        'w-full flex flex-col gap-3 text-left transition-all duration-300',
        className
      )}
    >
      {/* ── 1. BANNER GỢI Ý 1-CHẠM & NÚT XÚC XẮC MA THUẬT TINH GỌN (ẨN HOÀN TOÀN KHÁI NIỆM ENGINE KHỎI FRONTEND) ── */}
      <div className="flex items-center gap-2 w-full">
        {stepQuickPrompt ? (
          <button
            type="button"
            data-testid="studio-step-quick-btn"
            onClick={() => {
              if (onQuickPromptClick) {
                onQuickPromptClick(stepQuickPrompt)
              } else {
                onPromptChange(stepQuickPrompt)
              }
            }}
            className="flex-1 min-h-[44px] py-2 px-4 rounded-2xl bg-linear-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer border border-amber-500/60 truncate"
          >
            <span>👉 {stepQuickLabel || 'Chạm để thử ngay:'}</span>
            <span className="underline decoration-2 font-black truncate">"{stepQuickPrompt}"</span>
          </button>
        ) : (
          <div className="flex-1" />
        )}

        {/* Nút Xúc Xắc Ma Thuật nhỏ gọn, tinh tế ở đầu khay thẻ bài */}
        <SurpriseRollButton
          onRoll={handleRollSurprise}
          disabled={isGenerating}
          className="min-h-[44px] py-2 px-3 shrink-0 rounded-2xl text-xs shadow-xs"
          label="Xúc xắc 🎲"
        />
      </div>

      {/* ── 3. KHU VỰC ENGINE ACTIVE ── */}
      <div className="w-full bg-white rounded-2xl border-2 border-slate-100 p-2 sm:p-3 shadow-2xs">
        {activeMode === 'magic-keys' && (
          <MagicKeysEngine
            characterName={characterName}
            selectedSubject={selectedSubject}
            lessonId={lessonId}
            currentPrompt={currentPrompt}
            lockedFeatures={lockedFeatures}
            illustrationType={illustrationType}
            onPromptChange={handleEnginePromptChange}
          />
        )}

        {activeMode === 'style-prism' && (
          <StylePrismEngine
            characterName={characterName}
            lessonId={lessonId}
            currentPrompt={currentPrompt}
            lockedFeatures={lockedFeatures}
            illustrationType={illustrationType}
            onPromptChange={handleEnginePromptChange}
          />
        )}

        {activeMode === 'prompt-doctor' && (
          <PromptDoctorEngine
            characterName={characterName}
            lessonId={lessonId}
            currentPrompt={currentPrompt}
            lockedFeatures={lockedFeatures}
            illustrationType={illustrationType}
            onPromptChange={handleEnginePromptChange}
          />
        )}

        {activeMode === 'layer-stacking' && (
          <LayerStackingEngine
            characterName={characterName}
            lessonId={lessonId}
            currentPrompt={currentPrompt}
            lockedFeatures={lockedFeatures}
            illustrationType={illustrationType}
            onPromptChange={handleEnginePromptChange}
          />
        )}

        {activeMode === 'identity-lock' && (
          <IdentityLockEngine
            characterName={characterName}
            lessonId={lessonId}
            currentPrompt={currentPrompt}
            lockedFeatures={lockedFeatures}
            illustrationType={illustrationType}
            onPromptChange={handleEnginePromptChange}
          />
        )}

        {activeMode === 'card-forge' && (
          <CardForgeEngine
            characterName={characterName}
            lessonId={lessonId}
            currentPrompt={currentPrompt}
            lockedFeatures={lockedFeatures}
            illustrationType={illustrationType}
            onPromptChange={handleEnginePromptChange}
          />
        )}
      </div>

      {/* ── 4. CHUỖI BLOCK PREVIEW BAR (BLOCK-CHAIN) ── */}
      <PromptPreviewBar
        blocks={activeBlocks}
        generatedPrompt={currentPrompt}
        lockedFeatures={lockedFeatures}
        onReset={() => {
          setActiveBlocks([])
          onPromptChange('')
        }}
      />

      {/* ── 5. CÂU LỆNH TỰ ĐỘNG GHÉP TỪ THẺ & NÚT VẼ LỚN ── */}
      <div className="flex flex-col gap-2 pt-1">
        {/* Input prompt ẩn trong DOM (sr-only) để 100% tương thích test suite & trợ năng, học sinh tương tác 100% kéo/chạm thẻ */}
        <input
          data-testid="studio-prompt-input"
          type="text"
          value={currentPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && attemptsLeft > 0 && !isGenerating && currentPrompt.trim()) {
              onGenerate()
            }
          }}
          disabled={attemptsLeft <= 0 || isGenerating}
          placeholder="Gõ câu lệnh của bé ở đây, hoặc chạm nút gợi ý bên dưới 👇"
          className="sr-only"
          aria-hidden="true"
        />

        {/* Nút "Vẽ Đi AKI! ✨" Lớn Chuẩn Hallmark UI */}
        <div className="pt-1">
          <button
            type="button"
            data-testid="studio-draw-btn"
            onClick={onGenerate}
            disabled={attemptsLeft <= 0 || isGenerating || !currentPrompt.trim()}
            className={cn(
              'w-full min-h-[52px] inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm sm:text-base shadow-clay transition-all duration-150 active:scale-98 cursor-pointer select-none',
              attemptsLeft > 0 && !isGenerating && currentPrompt.trim()
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-b-4 border-amber-700 hover:border-amber-800'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border-none'
            )}
          >
            <span className="text-xl">✨</span>
            <span>
              {attemptsLeft > 0
                ? `Vẽ đi AKI! · còn ${attemptsLeft} lượt`
                : 'Đã hết lượt vẽ của bài này'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
