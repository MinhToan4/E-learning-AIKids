import React from 'react'
import type {
  SixStagePractice,
  SixStagePracticePartDef,
  SixStageFourKeysOptions,
  SixStageStylePrismOption,
  SixStagePromptDoctorCase,
  SixStageLayerStackingOptions,
  SixStageCardForgeOptions,
} from '../../../../shared/lib/api'
import { PracticePartsEditor } from './PracticePartsEditor'
import { MagicKeysEditor } from './MagicKeysEditor'
import { IdentityLockEditor } from './IdentityLockEditor'
import { StylePrismEditor } from './StylePrismEditor'
import { PromptDoctorEditor } from './PromptDoctorEditor'
import { LayerStackingEditor } from './LayerStackingEditor'
import { CardForgeEditor } from './CardForgeEditor'
import { CreativeNotebookEditor } from './CreativeNotebookEditor'
import {
  getDefaultPartsForMode,
  getEngineConfigMeta,
} from './engine-editor-defaults'

interface Stage5CreativeEngineEditorProps {
  practice: SixStagePractice
  onChange: (patch: Partial<SixStagePractice>) => void
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void
}

export function Stage5CreativeEngineEditor({
  practice,
  onChange,
  showToast,
}: Stage5CreativeEngineEditorProps) {
  const currentMode = practice.creativeEngineMode || 'magic-keys'
  const meta = getEngineConfigMeta(currentMode)
  const defaultParts = getDefaultPartsForMode(currentMode)

  if (currentMode === 'creative-notebook') {
    return (
      <CreativeNotebookEditor
        notebookConfig={practice.notebookConfig}
        onChange={(config) => {
          onChange({ notebookConfig: config })
        }}
        showToast={showToast}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* ── 1. NỀN TẢNG DÙNG CHUNG: Ngân hàng đầu vào chia lượt (Turn Input Bank) ─ */}
      <PracticePartsEditor
        parts={practice.practiceParts && practice.practiceParts.length > 0 ? practice.practiceParts : defaultParts}
        mode={currentMode}
        onChange={(nextParts: SixStagePracticePartDef[]) => {
          const patch: Partial<SixStagePractice> = { practiceParts: nextParts }
          if (nextParts.length > 0) {
            const hasMatch = nextParts.some((p) => p.title === practice.subjectName)
            if (!hasMatch) {
              patch.subjectName = nextParts[0].title
            }
          }
          onChange(patch)
        }}
        showToast={showToast}
      />

      {/* ── 2. DẢI PHÂN CÁCH PIPELINE KẾT NỐI TẦNG 1 & TẦNG 2 ──────────── */}
      <div className="flex items-center justify-center gap-2 py-1 select-none">
        <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-brand-200 to-brand-300" />
        <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-900 border border-brand-300 text-[11px] font-black flex items-center gap-1.5 shadow-2xs">
          <span>⬇️</span>
          <span>{meta.pipelineLabel}</span>
        </span>
        <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-brand-200 to-brand-300" />
      </div>

      {/* ── 3. CMS ĐỘNG BÊN TRÁI THEO ENGINE ĐANG CHỌN (PROMPT MODIFIERS) ── */}
      {currentMode === 'identity-lock' ? (
        <IdentityLockEditor
          lockedFeatures={practice.lockedFeatures}
          expressionOptions={practice.expressionOptions}
          onLockedFeaturesChange={(features: string[]) => {
            onChange({ lockedFeatures: features })
          }}
          onExpressionsChange={(expressions: string[]) => {
            onChange({ expressionOptions: expressions })
          }}
          showToast={showToast}
        />
      ) : currentMode === 'style-prism' ? (
        <StylePrismEditor
          stylePrismOptions={practice.stylePrismOptions}
          onChange={(styles: SixStageStylePrismOption[]) => {
            onChange({ stylePrismOptions: styles })
          }}
          showToast={showToast}
        />
      ) : currentMode === 'prompt-doctor' ? (
        <PromptDoctorEditor
          promptDoctorCase={practice.promptDoctorCase}
          onChange={(docCase: SixStagePromptDoctorCase) => {
            onChange({ promptDoctorCase: docCase })
          }}
          showToast={showToast}
        />
      ) : currentMode === 'layer-stacking' ? (
        <LayerStackingEditor
          layerStackingOptions={practice.layerStackingOptions}
          onChange={(layers: SixStageLayerStackingOptions) => {
            onChange({ layerStackingOptions: layers })
          }}
          showToast={showToast}
        />
      ) : currentMode === 'card-forge' ? (
        <CardForgeEditor
          cardForgeOptions={practice.cardForgeOptions}
          onChange={(options: SixStageCardForgeOptions) => {
            onChange({ cardForgeOptions: options })
          }}
          showToast={showToast}
        />
      ) : (
        /* Mặc định: magic-keys */
        <MagicKeysEditor
          fourKeysOptions={practice.fourKeysOptions}
          subjectName={practice.subjectName}
          practiceParts={practice.practiceParts}
          onChange={(fourKeys: SixStageFourKeysOptions) => {
            const autoLocked = [
              fourKeys.what?.[0],
              fourKeys.how?.[0],
              fourKeys.action?.[0],
              fourKeys.where?.[0],
            ].filter(Boolean) as string[]
            onChange({
              fourKeysOptions: fourKeys,
              ...(autoLocked.length > 0 ? { lockedFeatures: autoLocked } : {}),
            })
          }}
          onSuggestParts={(parts: SixStagePracticePartDef[]) => {
            onChange({ practiceParts: parts })
          }}
          showToast={showToast}
        />
      )}
    </div>
  )
}

// Giữ lại alias PracticePartsAndFourKeysEditor để tương thích ngược hoàn toàn
export const PracticePartsAndFourKeysEditor = Stage5CreativeEngineEditor
