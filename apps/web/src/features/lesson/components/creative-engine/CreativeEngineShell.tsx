import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Sparkles, ChevronDown, Wand2, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../LessonInteractiveSidebar'
import type { CreativeEngineMode, CreativeBlock, CreativeNotebookConfig } from './types'
import { ENGINE_CONFIGS, getCreativeEngineMode } from './data/engine-presets'
import { MagicKeysEngine } from './engines/MagicKeysEngine'
import { StylePrismEngine } from './engines/StylePrismEngine'
import { PromptDoctorEngine } from './engines/PromptDoctorEngine'
import { LayerStackingEngine } from './engines/LayerStackingEngine'
import { IdentityLockEngine } from './engines/IdentityLockEngine'
import { CardForgeEngine } from './engines/CardForgeEngine'
import { CreativeNotebookEngine } from './engines/CreativeNotebookEngine'
import { PromptPreviewBar } from './components/PromptPreviewBar'

export interface CreativeEngineShellProps {
  mode?: CreativeEngineMode
  onModeChange?: (mode: CreativeEngineMode) => void
  currentPrompt: string
  onPromptChange: (prompt: string, blocks?: CreativeBlock[]) => void
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
  submitSlot?: React.ReactNode
  isTurnLocked?: boolean
  turnLockedMessage?: string
  onRefImageChange?: (url: string) => void
  activePartIndex?: number
  onPartChange?: (index: number) => void
  practiceParts?: Array<{
    id?: string
    partNumber: number
    title: string
    icon?: string
    iconImage?: string
    emoji?: string
  }>
  notebookConfig?: CreativeNotebookConfig
  onSubmitNotebook?: (content: string, structuredData?: Record<string, string>) => void
  onSaveDraft?: (content: string, structuredData?: Record<string, string>) => void
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
  submitSlot,
  isTurnLocked,
  turnLockedMessage,
  onRefImageChange,
  activePartIndex,
  onPartChange,
  practiceParts,
  notebookConfig,
  onSubmitNotebook,
  onSaveDraft,
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
      onPromptChange(prompt, blocks)
    },
    [onPromptChange]
  )

  const promptBarContent = (
    <div className="flex w-full min-w-0 shrink-0 flex-col items-stretch gap-2 border-t border-amber-100/90 pt-1 sm:flex-row sm:items-stretch">
      <PromptPreviewBar
        mode={activeMode}
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
        className="w-full min-w-0 flex-1"
      />

      <input
        data-testid="studio-prompt-input"
        type="text"
        value={currentPrompt}
        onChange={(e) => onPromptChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isTurnLocked && attemptsLeft > 0 && !isGenerating && currentPrompt.trim()) {
            onGenerate()
          }
        }}
        disabled={isTurnLocked || attemptsLeft <= 0 || isGenerating}
        placeholder="Gõ câu lệnh của bé ở đây, hoặc chạm nút gợi ý bên dưới 👇"
        className="sr-only"
        aria-hidden="true"
      />

      <div className="grid w-full shrink-0 grid-cols-1 gap-2 sm:w-auto sm:grid-cols-[auto_auto]">
      <button
        type="button"
        data-testid="studio-draw-btn"
        onClick={onGenerate}
        disabled={isTurnLocked || attemptsLeft <= 0 || isGenerating || !currentPrompt.trim()}
        className={cn(
          'flex min-h-[48px] sm:min-h-[58px] self-stretch sm:self-auto w-full shrink-0 items-center justify-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-black shadow-clay transition-all duration-150 active:scale-95 cursor-pointer select-none sm:w-auto sm:px-6 sm:py-2.5 sm:text-base',
          !isTurnLocked && attemptsLeft > 0 && !isGenerating && currentPrompt.trim()
            ? 'bg-amber-500 hover:bg-amber-600 text-white border-b-4 border-amber-700 hover:border-amber-800'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed border-none'
        )}
      >
        {!isTurnLocked && <span className="text-base">✨</span>}
        <span>
          {isTurnLocked
            ? turnLockedMessage || '🔒 Lượt này đã vẽ xong'
            : attemptsLeft > 0
            ? `Vẽ đi AIKI! · còn ${attemptsLeft} lượt`
            : 'Đã hết lượt vẽ của bài này'}
        </span>
      </button>
      {submitSlot}
      </div>
    </div>
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
      <div className="flex w-full min-w-0 min-h-0 flex-col gap-1.5">
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
            promptSlot={promptBarContent}
            practiceParts={practiceParts}
            activePartIndex={activePartIndex}
            onPartChange={onPartChange}
          />
        )}

        {activeMode === 'creative-notebook' && (
          <CreativeNotebookEngine
            characterName={characterName}
            selectedSubject={selectedSubject}
            lessonId={lessonId}
            currentPrompt={currentPrompt}
            onPromptChange={handleEnginePromptChange}
            notebookConfig={notebookConfig}
            onSubmitNotebook={onSubmitNotebook}
            onSaveDraft={onSaveDraft}
          />
        )}

        {activeMode !== 'magic-keys' && activeMode !== 'creative-notebook' && (
          canvasSlot ? (
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-2.5 items-start w-full min-w-0 mt-1">
              <div className="w-full lg:col-span-7 xl:col-span-7 flex flex-col gap-2 min-w-0 order-1">
                {activeMode === 'style-prism' && (
                  <StylePrismEngine
                    characterName={characterName}
                    selectedSubject={selectedSubject}
                    lessonId={lessonId}
                    currentPrompt={currentPrompt}
                    lockedFeatures={lockedFeatures}
                    illustrationType={illustrationType}
                    onPromptChange={handleEnginePromptChange}
                    practiceParts={practiceParts}
                    activePartIndex={activePartIndex}
                    onPartChange={onPartChange}
                  />
                )}
                {activeMode === 'prompt-doctor' && (
                  <PromptDoctorEngine
                    characterName={characterName}
                    selectedSubject={selectedSubject}
                    lessonId={lessonId}
                    currentPrompt={currentPrompt}
                    lockedFeatures={lockedFeatures}
                    illustrationType={illustrationType}
                    onPromptChange={handleEnginePromptChange}
                    onRefImageChange={onRefImageChange}
                    activeCaseIndex={activePartIndex}
                    onCaseChange={onPartChange}
                    practiceParts={practiceParts}
                    activePartIndex={activePartIndex}
                    onPartChange={onPartChange}
                  />
                )}
                {activeMode === 'layer-stacking' && (
                  <LayerStackingEngine
                    characterName={characterName}
                    selectedSubject={selectedSubject}
                    lessonId={lessonId}
                    currentPrompt={currentPrompt}
                    lockedFeatures={lockedFeatures}
                    illustrationType={illustrationType}
                    onPromptChange={handleEnginePromptChange}
                    practiceParts={practiceParts}
                    activePartIndex={activePartIndex}
                    onPartChange={onPartChange}
                  />
                )}
                {activeMode === 'identity-lock' && (
                  <IdentityLockEngine
                    characterName={characterName}
                    selectedSubject={selectedSubject}
                    lessonId={lessonId}
                    currentPrompt={currentPrompt}
                    lockedFeatures={lockedFeatures}
                    illustrationType={illustrationType}
                    onPromptChange={handleEnginePromptChange}
                    activeCharacterIndex={activePartIndex}
                    onCharacterChange={onPartChange}
                    practiceParts={practiceParts}
                    activePartIndex={activePartIndex}
                    onPartChange={onPartChange}
                  />
                )}
                {activeMode === 'card-forge' && (
                  <CardForgeEngine
                    characterName={characterName}
                    selectedSubject={selectedSubject}
                    lessonId={lessonId}
                    currentPrompt={currentPrompt}
                    lockedFeatures={lockedFeatures}
                    illustrationType={illustrationType}
                    onPromptChange={handleEnginePromptChange}
                    practiceParts={practiceParts}
                    activePartIndex={activePartIndex}
                    onPartChange={onPartChange}
                  />
                )}
              </div>

              {/* KHUNG PREVIEW TRANH VẼ & XEM LẠI ẢNH BALO */}
              <div className="w-full lg:col-span-5 xl:col-span-5 min-w-0 order-3 lg:order-2">
                {canvasSlot}
              </div>

              {/* THANH CÂU LỆNH & NÚT VẼ ĐI AIKI */}
              <div className="w-full col-span-12 order-2 lg:order-3">
                {promptBarContent}
              </div>
            </div>
          ) : (
            <>
              {activeMode === 'style-prism' && (
                <StylePrismEngine
                  characterName={characterName}
                  selectedSubject={selectedSubject}
                  lessonId={lessonId}
                  currentPrompt={currentPrompt}
                  lockedFeatures={lockedFeatures}
                  illustrationType={illustrationType}
                  onPromptChange={handleEnginePromptChange}
                  practiceParts={practiceParts}
                  activePartIndex={activePartIndex}
                  onPartChange={onPartChange}
                />
              )}
              {activeMode === 'prompt-doctor' && (
                <PromptDoctorEngine
                  characterName={characterName}
                  selectedSubject={selectedSubject}
                  lessonId={lessonId}
                  currentPrompt={currentPrompt}
                  lockedFeatures={lockedFeatures}
                  illustrationType={illustrationType}
                  onPromptChange={handleEnginePromptChange}
                  onRefImageChange={onRefImageChange}
                  activeCaseIndex={activePartIndex}
                  onCaseChange={onPartChange}
                  practiceParts={practiceParts}
                  activePartIndex={activePartIndex}
                  onPartChange={onPartChange}
                />
              )}
              {activeMode === 'layer-stacking' && (
                <LayerStackingEngine
                  characterName={characterName}
                  selectedSubject={selectedSubject}
                  lessonId={lessonId}
                  currentPrompt={currentPrompt}
                  lockedFeatures={lockedFeatures}
                  illustrationType={illustrationType}
                  onPromptChange={handleEnginePromptChange}
                  practiceParts={practiceParts}
                  activePartIndex={activePartIndex}
                  onPartChange={onPartChange}
                />
              )}
              {activeMode === 'identity-lock' && (
                <IdentityLockEngine
                  characterName={characterName}
                  selectedSubject={selectedSubject}
                  lessonId={lessonId}
                  currentPrompt={currentPrompt}
                  lockedFeatures={lockedFeatures}
                  illustrationType={illustrationType}
                  onPromptChange={handleEnginePromptChange}
                  activeCharacterIndex={activePartIndex}
                  onCharacterChange={onPartChange}
                  practiceParts={practiceParts}
                  activePartIndex={activePartIndex}
                  onPartChange={onPartChange}
                />
              )}
              {activeMode === 'card-forge' && (
                <CardForgeEngine
                  characterName={characterName}
                  selectedSubject={selectedSubject}
                  lessonId={lessonId}
                  currentPrompt={currentPrompt}
                  lockedFeatures={lockedFeatures}
                  illustrationType={illustrationType}
                  onPromptChange={handleEnginePromptChange}
                  practiceParts={practiceParts}
                  activePartIndex={activePartIndex}
                  onPartChange={onPartChange}
                />
              )}
              {promptBarContent}
            </>
          )
        )}
      </div>
    </div>
  )
}
