import React, { useState } from 'react'
import { ChevronUp, ChevronDown, Volume2, Palette, Key, Stethoscope, Layers, Lock, Award, BookOpen, Pencil } from 'lucide-react'
import type { LessonSixStageJourney, SixStagePractice } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { CREATIVE_ENGINES, ENGINE_DEFAULT_MOTTOS } from '../lecture-drawer-constants'
import { Stage5CreativeEngineEditor } from '../../engine-editors'
import { PracticeWorkflowStepsAccordion } from '../PracticeWorkflowStepsAccordion'
import { DEFAULT_NOTEBOOK_CONFIGS } from '@/features/lesson/data/island-curriculum-registry'

function renderCreativeEngineIcon(mode: string) {
  switch (mode) {
    case 'magic-keys':
      return <Key size={20} className="text-brand-600" />
    case 'style-prism':
      return <Palette size={20} className="text-purple-600" />
    case 'prompt-doctor':
      return <Stethoscope size={20} className="text-rose-600" />
    case 'layer-stacking':
      return <Layers size={20} className="text-emerald-600" />
    case 'identity-lock':
      return <Lock size={20} className="text-cyan-600" />
    case 'card-forge':
      return <Award size={20} className="text-amber-600" />
    case 'creative-notebook':
      return <BookOpen size={20} className="text-amber-600" />
    default:
      return <Palette size={20} className="text-slate-600" />
  }
}

export interface PracticeBlockEditorProps {
  practice: LessonSixStageJourney['stage5_practice']
  onChange: (patch: Partial<LessonSixStageJourney['stage5_practice']>) => void
  readOnly?: boolean
  previewAikiVoice?: (index: number, text: string) => void
  showToast?: (message: string, tone?: 'success' | 'error' | 'info') => void
  stageStarAllocation?: number[]
  onToggleStageStar?: () => void
}

/**
 * PracticeBlockEditor — Form soạn thảo Chặng Thực Hành Sáng Tạo (Stage 5 / Practice Block).
 * Quản lý: 7 Creative Game Engines, Lời dẫn thử thách (Motto), Cấu hình món đồ/4 Chìa Khóa, Accordion kịch bản.
 */
export function PracticeBlockEditor({
  practice,
  onChange,
  readOnly = false,
  previewAikiVoice,
  showToast,
  stageStarAllocation,
  onToggleStageStar,
}: PracticeBlockEditorProps) {
  const [isEngineSelectorExpanded, setIsEngineSelectorExpanded] = useState<boolean>(false)

  const selectedEngineMode = practice.creativeEngineMode || 'magic-keys'
  const currentEngine =
    CREATIVE_ENGINES.find((e) => e.mode === selectedEngineMode) || CREATIVE_ENGINES[0]
  const isStage5StarAllocated = (stageStarAllocation ?? [2, 3, 4]).includes(4)

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-xs">
      {/* Khối Thưởng Sao Hoàn Thành Thực Hành */}
      <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-3.5 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-amber-400 text-amber-950 font-black text-sm shadow-xs shrink-0">
            ⭐
          </span>
          <div>
            <h5 className="text-xs font-black uppercase text-amber-950 tracking-wide">
              Phần thưởng hoàn thành Xưởng vẽ: +1 Sao cho học sinh
            </h5>
            <p className="text-[11px] font-semibold text-amber-900/80">
              Học sinh sáng tạo câu lệnh, vẽ tranh và nộp bài vào Balo để tích lũy Sao danh giá!
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={readOnly}
          onClick={() => onToggleStageStar?.()}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-black shrink-0 shadow-2xs border transition cursor-pointer active:scale-95",
            isStage5StarAllocated
              ? "bg-amber-400 text-amber-950 border-amber-500 shadow-clay-xs"
              : "bg-white text-slate-600 border-slate-300 hover:bg-amber-50"
          )}
        >
          {isStage5StarAllocated ? "⭐ Chặng 5 đang tặng 1 Sao" : "+ Bật tặng 1 Sao cho Chặng 5"}
        </button>
      </div>
      {/* BỘ CHUYỂN ĐỔI GAME ENGINE THỰC HÀNH SÁNG TẠO (CREATIVE ENGINE SELECTOR) */}
      <div className="rounded-2xl border-2 border-brand-200 bg-gradient-to-r from-brand-50/90 via-purple-50/50 to-amber-50/60 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Bên trái */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-base">🎨</span>
            <h4 className="font-display text-xs sm:text-sm font-black text-brand-950 uppercase tracking-wide">
              Game Engine Thực Hành:
            </h4>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-brand-200/80 px-2.5 py-0.5 text-[11px] font-bold text-brand-900 shadow-2xs">
              <span>{currentEngine.icon}</span> <span>{currentEngine.title}</span>
            </span>
            <span className="rounded-full bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 shadow-2xs uppercase tracking-wider">
              Đang dùng
            </span>
          </div>

          {/* Bên phải */}
          <button
            type="button"
            onClick={() => setIsEngineSelectorExpanded(!isEngineSelectorExpanded)}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-brand-300/80 bg-white/90 px-3 py-1.5 text-xs font-black text-brand-900 hover:bg-white hover:border-brand-400 active:scale-95 transition shadow-2xs cursor-pointer"
          >
            <span>{isEngineSelectorExpanded ? 'Thu gọn' : 'Đổi Game Engine'}</span>
            {isEngineSelectorExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Vùng nội dung chi tiết (Mô tả và lưới 7 nút) */}
        {isEngineSelectorExpanded && (
          <div className="animate-in fade-in duration-200 pt-3 border-t border-brand-200/60 mt-3 space-y-3">
            <p className="text-[11px] font-medium text-slate-600">
              Chuyển đổi linh hoạt giữa 7 cơ chế chơi — Mọi nội dung (chủ thể, huy hiệu, thần chú AIKI, món đồ bé vẽ) đều được tự động đồng bộ và giữ nguyên trọn vẹn!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
              {CREATIVE_ENGINES.map((eng) => {
                const isSelected = selectedEngineMode === eng.mode
                return (
                  <button
                    key={eng.mode}
                    type="button"
                    disabled={readOnly}
                    onClick={() => {
                      const currentMotto = (practice.akiMotto || '').trim()
                      const isDefaultOrEmpty =
                        !currentMotto ||
                        Object.values(ENGINE_DEFAULT_MOTTOS).some(
                          (motto) => motto.trim() === currentMotto
                        )
                      const nextMotto = isDefaultOrEmpty
                        ? ENGINE_DEFAULT_MOTTOS[eng.mode] || currentMotto
                        : currentMotto

                      const nextPractice: Partial<SixStagePractice> = {
                        creativeEngineMode: eng.mode,
                        akiMotto: nextMotto,
                        ...(eng.mode === 'creative-notebook'
                          ? { practiceParts: [], notebookConfig: practice.notebookConfig || DEFAULT_NOTEBOOK_CONFIGS['3.1'] }
                          : {}),
                      }

                      if (eng.mode === 'magic-keys' && practice.fourKeysOptions) {
                        const fk = practice.fourKeysOptions
                        const autoLocked = [
                          fk.what?.[0],
                          fk.how?.[0],
                          fk.action?.[0],
                          fk.where?.[0],
                        ].filter(Boolean) as string[]
                        if (autoLocked.length > 0) {
                          nextPractice.lockedFeatures = autoLocked
                        }
                      }

                      onChange(nextPractice)
                      showToast?.(`Đã chọn Game Engine Thực Hành: ${eng.title}!`, 'success')
                    }}
                    className={cn(
                      'flex flex-col items-center text-center p-2.5 rounded-xl border transition cursor-pointer select-none relative',
                      isSelected
                        ? cn(eng.activeBorder, 'shadow-clay-sm')
                        : 'border-border/70 bg-white/70 hover:bg-white hover:border-slate-300'
                    )}
                  >
                    {isSelected && (
                      <span
                        className={cn(
                          'absolute -top-2 left-1/2 -translate-x-1/2 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-2xs whitespace-nowrap',
                          eng.badgeBg
                        )}
                      >
                        ĐANG CHỌN
                      </span>
                    )}
                    <span className="size-8 rounded-xl bg-slate-100 flex items-center justify-center mb-1 mt-0.5">{renderCreativeEngineIcon(eng.mode)}</span>
                    <span className="text-[11px] font-black text-slate-900 block leading-tight">
                      {eng.shortName}
                    </span>
                    <span className="text-[9px] font-medium text-slate-500 mt-1 line-clamp-2 leading-snug">
                      {eng.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Khối Lời dẫn thử thách của AIKI (Challenge Prompt) */}
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/50 via-white to-indigo-50/30 p-4 shadow-clay-sm space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span>🎯 Lời dẫn thử thách của AIKI (Challenge Prompt)</span>
            <span className="text-[10px] font-normal lowercase text-slate-400">
              (lời dặn dò giao nhiệm vụ cho bé khi vào xưởng vẽ)
            </span>
          </label>
          <div className="flex items-center gap-2">
            {!readOnly && (
              <button
                type="button"
                onClick={() => {
                  const mode = practice.creativeEngineMode || 'magic-keys'
                  const defaultMotto =
                    ENGINE_DEFAULT_MOTTOS[mode] || ENGINE_DEFAULT_MOTTOS['magic-keys']
                  onChange({ akiMotto: defaultMotto })
                  showToast?.('Đã nạp lời dẫn thử thách chuẩn của Engine!', 'success')
                }}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                title="Nạp lại lời dẫn chuẩn tương ứng với engine đang chọn"
              >
                <Pencil size={11} />
                <span>✏️ Lời dẫn chuẩn</span>
              </button>
            )}
            {previewAikiVoice && (
              <button
                type="button"
                onClick={() =>
                  previewAikiVoice(
                    4,
                    practice.akiMotto ||
                      ENGINE_DEFAULT_MOTTOS[practice.creativeEngineMode || 'magic-keys']
                  )
                }
                className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
              >
                <Volume2 size={11} />
                <span>Nghe thử giọng AIKI</span>
              </button>
            )}
          </div>
        </div>
        <textarea
          rows={2}
          value={practice.akiMotto ?? ''}
          disabled={readOnly}
          placeholder={
            ENGINE_DEFAULT_MOTTOS[practice.creativeEngineMode || 'magic-keys']
          }
          onChange={(e) => onChange({ akiMotto: e.target.value })}
          className="w-full rounded-xl border border-sky-200/80 bg-white p-2.5 text-xs font-semibold text-slate-800 italic placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200/50 shadow-inner"
        />
      </div>

      {/* Cấu hình Món đồ bé vẽ & CMS Động theo Game Engine Thực Hành */}
      <Stage5CreativeEngineEditor
        practice={practice}
        onChange={(patch) => {
          const nextPractice = { ...practice, ...patch }
          if ((nextPractice.creativeEngineMode || 'magic-keys') === 'magic-keys') {
            const fk = nextPractice.fourKeysOptions
            if (fk) {
              const autoLocked = [
                fk.what?.[0],
                fk.how?.[0],
                fk.action?.[0],
                fk.where?.[0],
              ].filter(Boolean) as string[]
              if (
                autoLocked.length > 0 &&
                (!nextPractice.lockedFeatures?.length || patch.fourKeysOptions)
              ) {
                nextPractice.lockedFeatures = autoLocked
              }
            }
          }
          onChange(nextPractice)
        }}
        showToast={showToast ?? (() => {})}
      />

      {/* Lời thoại & Gợi ý từng lượt của AIKI (Nâng cao) - Accordion tinh gọn */}
      <PracticeWorkflowStepsAccordion
        workflowSteps={practice.workflowSteps}
        onChange={(steps) => onChange({ workflowSteps: steps })}
      />
    </div>
  )
}

export { PracticeBlockEditor as Stage5PracticeEditor }
