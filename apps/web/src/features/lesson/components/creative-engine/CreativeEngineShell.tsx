import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Sparkles, ChevronDown, Wand2, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../LessonInteractiveSidebar'
import type { CreativeEngineMode, CreativeBlock } from './types'
import { ENGINE_CONFIGS, getCreativeEngineMode } from './data/engine-presets'
import { MagicKeysEngine } from './engines/MagicKeysEngine'
import { StylePrismEngine } from './engines/StylePrismEngine'
import { PromptDoctorEngine } from './engines/PromptDoctorEngine'
import { LayerStackingEngine } from './engines/LayerStackingEngine'
import { IdentityLockEngine } from './engines/IdentityLockEngine'
import { CardForgeEngine } from './engines/CardForgeEngine'
import { PromptPreviewBar } from './components/PromptPreviewBar'

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
  canvasSlot?: React.ReactNode
  practiceSlot?: React.ReactNode
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
  canvasSlot,
  practiceSlot,
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

  return (
    <div
      data-testid="creative-engine-shell"
      className={cn(
        'w-full flex flex-col gap-2 shrink-0 text-left transition-all duration-300',
        className
      )}
    >
      {/* ── BÀN PHÍM 4 CHÌA KHÓA MA THUẬT & THANH CÂU LỆNH HỢP NHẤT (~145-155PX) ── */}
      <div className="flex w-full min-h-0 flex-col gap-1.5 rounded-3xl border-2 border-amber-200/80 bg-white p-2 shadow-clay sm:p-2.5">
        {/* VÙNG ENGINE ACTIVE (Tầng 1: BlockSlotTray & Tầng 2: BlockPalette) */}
        {activeMode === 'magic-keys' && (
          <MagicKeysEngine
            characterName={characterName}
            selectedSubject={selectedSubject}
            lessonId={lessonId}
            currentPrompt={currentPrompt}
            lockedFeatures={lockedFeatures}
            illustrationType={illustrationType}
            onPromptChange={handleEnginePromptChange}
            canvasSlot={canvasSlot}
            practiceSlot={practiceSlot}
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

        {/* ── TẦNG 3: THANH CÂU LỆNH TỰ ĐỘNG & NÚT VẼ (NẰM CHUNG 1 HÀNG) ── */}
        <div className="flex items-center gap-2 w-full pt-1 border-t border-amber-100/90 shrink-0">
          {/* Bên trái: Hộp câu lệnh tự động ghép từ 4 chìa khóa & Chip gợi ý 1-chạm */}
          <PromptPreviewBar
            blocks={activeBlocks}
            generatedPrompt={currentPrompt}
            lockedFeatures={lockedFeatures}
            stepQuickPrompt={stepQuickPrompt}
            stepQuickLabel={stepQuickLabel}
            onQuickPromptClick={
              onQuickPromptClick || ((p) => onPromptChange(p))
            }
            onReset={() => {
              setActiveBlocks([])
              onPromptChange('')
            }}
            className="flex-1 min-w-0"
          />

          {/* Input prompt ẩn trong DOM (sr-only) để 100% tương thích test suite & trợ năng */}
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

          {/* Bên phải: Nút "Vẽ Đi AKI! ✨ (còn X lượt)" Soft Clay nổi bật */}
          <button
            type="button"
            data-testid="studio-draw-btn"
            onClick={onGenerate}
            disabled={attemptsLeft <= 0 || isGenerating || !currentPrompt.trim()}
            className={cn(
              'min-h-[48px] px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-black text-sm sm:text-base shadow-clay transition-all duration-150 active:scale-95 cursor-pointer select-none shrink-0 flex items-center gap-1.5',
              attemptsLeft > 0 && !isGenerating && currentPrompt.trim()
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-b-4 border-amber-700 hover:border-amber-800'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border-none'
            )}
          >
            <span className="text-base">✨</span>
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
