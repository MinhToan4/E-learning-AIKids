import React, { useState } from 'react'
import { Sparkles, Eye, Palette } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
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
  DEFAULT_LOCKED_FEATURES,
  DEFAULT_STYLE_PRISM_OPTIONS,
  DEFAULT_PROMPT_DOCTOR_CASE,
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
  const [previewPartIndex, setPreviewPartIndex] = useState(0)

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

  const activeParts =
    practice.practiceParts && practice.practiceParts.length > 0
      ? practice.practiceParts
      : defaultParts

  const currentSelectedPart = activeParts[previewPartIndex] || activeParts[0]
  const selectedPartTitle = currentSelectedPart?.title || practice.subjectName || 'Món đồ'
  const currentPartImage =
    currentSelectedPart?.iconImage ||
    (currentMode === 'magic-keys'
      ? '/assets/aiki-islands/island1_lesson2_teacup.jpg'
      : undefined)

  // Tính toán câu lệnh mô phỏng sinh ra theo cấu hình hiện tại
  let simulatedPrompt = ''
  if (currentMode === 'magic-keys') {
    const what = selectedPartTitle
    const how = practice.fourKeysOptions?.how?.[0] || 'men bóng mẻ miệng'
    const action = practice.fourKeysOptions?.action?.[0] || 'đang bốc khói nghi ngút'
    const where = practice.fourKeysOptions?.where?.[0] || 'trên bàn gỗ mộc'
    simulatedPrompt = `Một ${what}, ${how}, ${action}, ${where}`
  } else if (currentMode === 'style-prism') {
    const style =
      practice.stylePrismOptions?.[0]?.promptStyle ||
      'phong cách đất nặn 3D Soft Clay bo tròn mịn màng màu pastel ấm áp'
    simulatedPrompt = `${selectedPartTitle}, ${style}`
  } else if (currentMode === 'prompt-doctor') {
    const cure =
      practice.promptDoctorCase?.cureCards?.[0] ||
      'một bàn tay năm ngón đang cầm bút chì, nhìn nghiêng'
    simulatedPrompt = `[Chữa lành] ${cure}`
  } else if (currentMode === 'layer-stacking') {
    const bg =
      practice.layerStackingOptions?.background?.[0] ||
      'Bầu trời dải ngân hà vũ trụ lung linh'
    const hero = selectedPartTitle
    const fg =
      practice.layerStackingOptions?.foreground?.[0] || 'Cành hoa đào bay'
    simulatedPrompt = `[Hậu cảnh] ${bg}, [Chủ thể 1/3] ${hero}, [Tiền cảnh] ${fg}`
  } else if (currentMode === 'identity-lock') {
    const dna = (practice.lockedFeatures || DEFAULT_LOCKED_FEATURES).join(', ')
    const expr = practice.expressionOptions?.[0] || 'Cười tít mắt vui vẻ'
    simulatedPrompt = `${selectedPartTitle}, đặc điểm ADN: ${dna}, biểu cảm: ${expr}`
  } else if (currentMode === 'card-forge') {
    const elem = practice.cardForgeOptions?.elements?.[0]?.name || 'Hệ Băng'
    const skill =
      practice.cardForgeOptions?.stats?.skillName || 'Bão Băng Tinh Thể'
    simulatedPrompt = `Thẻ bài TCG ${selectedPartTitle}, ${elem}, tuyệt chiêu: ${skill}`
  }

  return (
    <div className="space-y-4">
      {/* ── 1. NỀN TẢNG DÙNG CHUNG: Ngân hàng đầu vào chia lượt (Turn Input Bank) ─ */}
      <PracticePartsEditor
        parts={activeParts}
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

      {/* ── 2. DẢI PHÂN CÁCH PIPELINE KẾT NỐI TẦNG 1 & TẦNG 2 (PALETTE MÈO AIKI) ── */}
      <div className="flex items-center justify-center gap-3 py-2 select-none">
        <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-amber-300 to-[#FD7D2E]/60" />
        <span className="px-3.5 py-1.5 rounded-full bg-[#FFF9F5] text-amber-950 border-2 border-[#FD7D2E]/40 text-xs font-black flex items-center gap-2 shadow-xs">
          <Sparkles size={13} className="text-[#FD7D2E]" />
          <span>{meta.pipelineLabel}</span>
        </span>
        <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent via-amber-300 to-[#FD7D2E]/60" />
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

      {/* ── 4. LIVE STUDIO PREVIEW (GIAO DIỆN HỌC SINH NHÌN THẤY) ────── */}
      <div className="rounded-2xl border-2 border-amber-300/80 bg-[#FFFDF8] p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-gradient-to-br from-[#FD7D2E] to-[#F97316] text-white flex items-center justify-center shadow-xs">
              <Eye size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900 tracking-wide">
                Live Studio Preview (Giao Diện Học Sinh Nhìn Thấy)
              </h4>
              <p className="text-[11px] font-medium text-slate-600">
                Mô phỏng chuẩn kích thước và bố cục màn hình xưởng vẽ AIKI Studio của học sinh.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black">
            Chế độ: {currentMode}
          </span>
        </div>

        {/* Khung mô phỏng Workspace học sinh */}
        <div className="rounded-2xl border-2 border-amber-200/70 bg-stone-50/80 p-3 sm:p-4 space-y-3.5 max-w-[960px] mx-auto">
          {/* A. Dải Mini-Cards Ngang Trên Cùng */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-black text-amber-950">
              <span>Món đồ thực hành ({activeParts.length} phần):</span>
              <span className="text-[10px] text-amber-800/80 font-semibold">
                Chạm để xem tranh mẫu
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
              {activeParts.map((part, idx) => {
                const isSelected = previewPartIndex === idx
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPreviewPartIndex(idx)}
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-1.5 rounded-xl border-2 transition-all cursor-pointer shrink-0 text-left',
                      isSelected
                        ? 'border-[#FD7D2E] bg-white shadow-xs'
                        : 'border-amber-200/60 bg-amber-50/60 hover:bg-white text-slate-700'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 p-0.5 border border-amber-200/60 shrink-0 overflow-hidden flex items-center justify-center">
                      {part.iconImage ? (
                        <img
                          src={part.iconImage}
                          alt={part.title}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs font-bold text-amber-800">
                          #{idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 pr-1">
                      <p className="text-[11px] font-black text-slate-800 truncate max-w-[120px]">
                        {part.title}
                      </p>
                      <span className="text-[9px] font-bold text-amber-800/70">
                        Lượt {idx + 1}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* B. Bố cục 2 Cột: Cột Trái (Engine Slots / 4 Khay) & Cột Phải (Khung Tranh AIKI 100% object-contain) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
            {/* Cột trái: Khung 4 chìa khóa vàng hoặc engine đang chọn */}
            <div className="md:col-span-7 flex flex-col justify-between gap-2.5">
              <div className="rounded-xl border border-amber-200/80 bg-white p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">
                    {currentMode === 'magic-keys'
                      ? 'Bàn Phím 4 Chìa Khóa Vàng AIKI'
                      : currentMode === 'identity-lock'
                      ? 'Khóa Mật Mã ADN & Biểu Cảm'
                      : currentMode === 'style-prism'
                      ? 'Lăng Kính Mỹ Thuật'
                      : currentMode === 'prompt-doctor'
                      ? 'Toa Thuốc Chữa Lành'
                      : currentMode === 'layer-stacking'
                      ? '3 Tầng Sân Khấu'
                      : 'Xưởng Đúc Thẻ Bài TCG'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Mô phỏng học sinh
                  </span>
                </div>

                {/* Engine specific layout */}
                {currentMode === 'magic-keys' && (
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-[#FFF9F5] border border-[#FD7D2E]/40 p-2">
                      <span className="text-[10px] font-black text-amber-900 block mb-0.5">
                        1. Cái gì?
                      </span>
                      <span className="font-bold text-slate-800 truncate block">
                        {selectedPartTitle}
                      </span>
                    </div>
                    <div className="rounded-lg bg-purple-50/80 border border-purple-200 p-2">
                      <span className="text-[10px] font-black text-purple-900 block mb-0.5">
                        2. Trông thế nào?
                      </span>
                      <span className="font-bold text-purple-950 truncate block">
                        {practice.fourKeysOptions?.how?.[0] || 'men bóng mẻ miệng'}
                      </span>
                    </div>
                    <div className="rounded-lg bg-blue-50/80 border border-blue-200 p-2">
                      <span className="text-[10px] font-black text-blue-900 block mb-0.5">
                        3. Đang làm gì?
                      </span>
                      <span className="font-bold text-blue-950 truncate block">
                        {practice.fourKeysOptions?.action?.[0] || 'đang bốc khói'}
                      </span>
                    </div>
                    <div className="rounded-lg bg-emerald-50/80 border border-emerald-200 p-2">
                      <span className="text-[10px] font-black text-emerald-900 block mb-0.5">
                        4. Ở đâu?
                      </span>
                      <span className="font-bold text-emerald-950 truncate block">
                        {practice.fourKeysOptions?.where?.[0] || 'trên bàn gỗ'}
                      </span>
                    </div>
                  </div>
                )}

                {currentMode === 'style-prism' && (
                  <div className="space-y-1.5 text-[11px]">
                    <span className="text-[10px] font-bold text-purple-800 block">
                      Phong cách lăng kính:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(practice.stylePrismOptions || DEFAULT_STYLE_PRISM_OPTIONS).map(
                        (s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-950 border border-purple-200 font-bold text-[10px]"
                          >
                            {s.name}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {currentMode === 'identity-lock' && (
                  <div className="space-y-1.5 text-[11px]">
                    <span className="text-[10px] font-bold text-cyan-800 block">
                      Mật mã ADN đã khóa:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(practice.lockedFeatures || DEFAULT_LOCKED_FEATURES).map(
                        (f, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-cyan-100 text-cyan-950 border border-cyan-200 font-bold text-[10px]"
                          >
                            {f}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {currentMode === 'prompt-doctor' && (
                  <div className="space-y-1.5 text-[11px]">
                    <span className="text-[10px] font-bold text-rose-800 block">
                      Ca bệnh: {practice.promptDoctorCase?.caseTitle || 'Ca 1: Tay sáu ngón'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        practice.promptDoctorCase?.cureCards ||
                        DEFAULT_PROMPT_DOCTOR_CASE.cureCards
                      )
                        .slice(0, 3)
                        .map((c, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-950 border border-rose-200 font-medium text-[10px] truncate max-w-[180px]"
                          >
                            {c}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {currentMode === 'layer-stacking' && (
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-emerald-800">
                        Hậu cảnh:
                      </span>
                      <span className="text-[10px] text-slate-700 truncate">
                        {practice.layerStackingOptions?.background?.[0] || 'Bầu trời'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-emerald-800">
                        1/3 Hero:
                      </span>
                      <span className="text-[10px] text-slate-700 truncate">
                        {selectedPartTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-emerald-800">
                        Tiền cảnh:
                      </span>
                      <span className="text-[10px] text-slate-700 truncate">
                        {practice.layerStackingOptions?.foreground?.[0] || 'Cành hoa'}
                      </span>
                    </div>
                  </div>
                )}

                {currentMode === 'card-forge' && (
                  <div className="flex items-center justify-between text-[11px] p-2 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="font-bold text-amber-950">
                      Chiến tướng: {selectedPartTitle}
                    </span>
                    <span className="text-[10px] font-black text-amber-800">
                      HP {practice.cardForgeOptions?.stats?.hp || 1200} / ATK{' '}
                      {practice.cardForgeOptions?.stats?.atk || 850}
                    </span>
                  </div>
                )}
              </div>

              {/* Prompt Preview Bar */}
              <div className="rounded-xl border border-amber-200 bg-[#FFFDF8] p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-black uppercase text-amber-900 block">
                    Câu lệnh mẫu sinh ra:
                  </span>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {simulatedPrompt}
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-sky-500 text-white font-black text-xs shrink-0 shadow-xs flex items-center gap-1">
                  <span>✨</span>
                  <span>Vẽ đi AIKI!</span>
                </div>
              </div>
            </div>

            {/* Cột phải: Khung tranh sáng tạo 100% object-contain trên nền kem bo góc lớn rounded-2xl */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div className="w-full h-56 sm:h-64 bg-[#FFFDF8] border-2 border-amber-200/80 rounded-2xl p-2.5 shadow-xs flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100/90 text-amber-900 border border-amber-300/60 text-[9px] font-black">
                    100% object-contain
                  </span>
                </div>
                {currentPartImage ? (
                  <img
                    src={currentPartImage}
                    alt={selectedPartTitle}
                    className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-102"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-amber-800/60 gap-1.5">
                    <Sparkles size={32} className="text-amber-400" />
                    <span className="text-xs font-bold">Khung tranh Aiki Studio</span>
                  </div>
                )}
                <div className="absolute bottom-2 inset-x-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-amber-200 text-center">
                  <span className="text-[11px] font-black text-slate-800 truncate block">
                    {selectedPartTitle}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Giữ lại alias PracticePartsAndFourKeysEditor để tương thích ngược hoàn toàn
export const PracticePartsAndFourKeysEditor = Stage5CreativeEngineEditor
