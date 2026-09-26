import React, { useState } from 'react'
import { Sparkles, Stethoscope, Pill, AlertTriangle, Plus, X } from 'lucide-react'
import type { SixStagePromptDoctorCase } from '../../../../shared/lib/api'
import {
  DEFAULT_PROMPT_DOCTOR_CASE,
  PROMPT_DOCTOR_CASE_PRESETS,
  PROMPT_DOCTOR_CURE_PRESETS,
  type PromptDoctorCasePreset,
  type PromptDoctorCurePreset,
} from './engine-editor-defaults'

interface PromptDoctorEditorProps {
  promptDoctorCase?: SixStagePromptDoctorCase
  onChange: (docCase: SixStagePromptDoctorCase) => void
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void
}

export function PromptDoctorEditor({
  promptDoctorCase,
  onChange,
  showToast,
}: PromptDoctorEditorProps) {
  const currentCase = promptDoctorCase || DEFAULT_PROMPT_DOCTOR_CASE
  const [inputCure, setInputCure] = useState('')

  const handleUpdateField = <K extends keyof SixStagePromptDoctorCase>(
    field: K,
    val: SixStagePromptDoctorCase[K]
  ) => {
    onChange({
      ...currentCase,
      [field]: val,
    })
  }

  const handleSelectCasePreset = (preset: PromptDoctorCasePreset) => {
    onChange({
      caseTitle: preset.title,
      symptom: preset.symptom,
      originalPrompt: preset.brokenPrompt,
      refImageUrl: preset.refImageUrl,
      cureCards: preset.suggestedCures && preset.suggestedCures.length > 0
        ? preset.suggestedCures
        : currentCase.cureCards,
    })
    showToast(`Đã nạp ca bệnh: ${preset.title}`, 'success')
  }

  const handleAddCurePreset = (preset: PromptDoctorCurePreset) => {
    if (currentCase.cureCards.includes(preset.name)) {
      showToast(`Thẻ thuốc "${preset.name}" đã có trong toa thuốc`, 'info')
      return
    }
    onChange({
      ...currentCase,
      cureCards: [...currentCase.cureCards, preset.name],
    })
    showToast(`Đã kê thêm thuốc: ${preset.name}`, 'success')
  }

  const handleAddCure = () => {
    const trimmed = inputCure.trim()
    if (!trimmed) return
    if (currentCase.cureCards.includes(trimmed)) {
      showToast(`Thẻ thuốc "${trimmed}" đã có`, 'info')
      return
    }
    onChange({
      ...currentCase,
      cureCards: [...currentCase.cureCards, trimmed],
    })
    setInputCure('')
    showToast(`Đã thêm thẻ thuốc: ${trimmed}`, 'success')
  }

  const handleRemoveCure = (indexToRemove: number) => {
    if (currentCase.cureCards.length <= 1) {
      showToast('Cần ít nhất 1 thẻ thuốc chữa lành', 'info')
      return
    }
    onChange({
      ...currentCase,
      cureCards: currentCase.cureCards.filter((_, idx) => idx !== indexToRemove),
    })
  }

  const handleLoadDefaultCase = () => {
    onChange(DEFAULT_PROMPT_DOCTOR_CASE)
    showToast('Đã nạp ca bệnh & toa thuốc mẫu', 'success')
  }

  return (
    <div className="rounded-2xl border-2 border-rose-200/80 bg-[#FFFDF8] p-4 sm:p-5 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-200/70 pb-3">
        <div>
          <h4 className="text-xs font-black uppercase text-rose-950 flex items-center gap-1.5">
            <span>🩺 Bác Sĩ Câu Lệnh (Prompt Doctor Clinic Editor)</span>
            <span className="rounded-full bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.5 text-[10px] font-black">
              Bắt Bệnh &amp; Chữa Lành
            </span>
          </h4>
          <p className="text-[11px] font-medium text-slate-600 mt-0.5">
            Biên soạn ca bệnh tranh hỏng và tủ thuốc thẻ chữ để bé chữa lành lỗi câu lệnh AI theo cụm prompt chuẩn.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLoadDefaultCase}
          className="rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-xs font-black text-rose-800 shadow-2xs hover:bg-rose-50 active:scale-[0.98] transition cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles size={12} className="text-rose-600" />
          <span>🪄 Nạp ca bệnh &amp; toa thuốc mẫu</span>
        </button>
      </div>

      {/* ── KHAY CA BỆNH MẪU CÓ SẴN (PRESET DOCTOR CASES) ───────────── */}
      <div className="rounded-2xl border-2 border-rose-200/80 bg-rose-50/70 p-4 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-rose-900 flex items-center gap-1">
            <span>🩺</span>
            <span>Ngân Hàng Ca Bệnh Mẫu (1-Chạm Nạp Nhanh):</span>
          </span>
          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full">
            {PROMPT_DOCTOR_CASE_PRESETS.length} ca bệnh mẫu
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PROMPT_DOCTOR_CASE_PRESETS.map((preset) => {
            const isSelected = currentCase.caseTitle === preset.title
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectCasePreset(preset)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'bg-rose-600 text-white border border-rose-700 shadow-xs'
                    : 'bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 active:scale-95'
                }`}
                title={preset.symptom}
              >
                <span>{preset.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 1. Hồ Sơ Bệnh Án Tranh Hỏng ─────────────────────────────── */}
      <div className="rounded-2xl border-2 border-rose-200/80 bg-rose-50/50 p-4 space-y-3 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-black text-rose-900 uppercase">
          <Stethoscope size={14} className="text-rose-700" />
          <span>🩺 Hồ Sơ Bệnh Án Tranh Hỏng</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {currentCase.refImageUrl && (
              <img
                src={currentCase.refImageUrl}
                alt={currentCase.caseTitle || 'Ảnh bệnh án'}
                className="size-11 rounded-xl object-cover border-2 border-rose-300 shadow-2xs shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-black text-slate-700 uppercase">Tiêu đề ca bệnh:</label>
              <input
                type="text"
                value={currentCase.caseTitle}
                onChange={(e) => handleUpdateField('caseTitle', e.target.value)}
                placeholder="VD: Bàn tay hiệp sĩ bị dị tật, Chú mèo thiếu tai..."
                className="mt-1 w-full rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-rose-400 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-700 uppercase">Ảnh tham chiếu (Ref Image URL):</label>
            <input
              type="text"
              value={currentCase.refImageUrl || ''}
              onChange={(e) => handleUpdateField('refImageUrl', e.target.value)}
              placeholder="VD: /assets/aiki-islands/island1_lesson4_opt_a.jpg..."
              className="mt-1 w-full rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 focus:border-rose-400 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-700 uppercase flex items-center gap-1">
              <AlertTriangle size={12} className="text-amber-600" />
              <span>Mô tả triệu chứng bệnh để bé phát hiện lỗi:</span>
            </label>
            <input
              type="text"
              value={currentCase.symptom}
              onChange={(e) => handleUpdateField('symptom', e.target.value)}
              placeholder="VD: Tranh vẽ hiệp sĩ nhưng bàn tay bị biến dạng chỉ có 3 ngón tay..."
              className="mt-1 w-full rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-rose-400 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-700 uppercase">Câu lệnh ban đầu bị lỗi (Original Prompt):</label>
            <input
              type="text"
              value={currentCase.originalPrompt}
              onChange={(e) => handleUpdateField('originalPrompt', e.target.value)}
              placeholder="VD: Hiệp sĩ bọc giáp cầm kiếm thần đứng giữa rừng..."
              className="mt-1 w-full rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-mono text-rose-900 focus:border-rose-400 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* ── 2. Tủ Thuốc Thẻ Chữ Chữa Lành ───────────────────────────── */}
      <div className="rounded-2xl border-2 border-rose-200/80 bg-rose-50/50 p-4 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-rose-900 uppercase">
            <Pill size={14} className="text-rose-700" />
            <span>💊 Tủ Thuốc Thẻ Chữ Chữa Lành</span>
            <span className="rounded-full bg-rose-200 text-rose-900 text-[9px] font-black px-2 py-0.5">
              {currentCase.cureCards.length} liều thuốc
            </span>
          </div>
        </div>

        {/* Khay Toa Thuốc Chữa Lành Có SẴn */}
        <div className="rounded-xl border border-rose-200 bg-white/90 p-3 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <span className="text-[10px] font-black text-rose-800 uppercase block">
              + Khay Thẻ Thuốc Gợi Ý (1 Thuốc Đặc Trị Chính Xác + Các Thuốc Bẫy Nhầm Bệnh):
            </span>
            <span className="text-[9px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
              Minigame Bác Sĩ Bắt Bệnh
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROMPT_DOCTOR_CURE_PRESETS.map((cure, cIdx) => {
              const isIncluded = currentCase.cureCards.includes(cure.name)
              const isCorrectCure = cure.role === 'cure'

              return (
                <button
                  key={cIdx}
                  type="button"
                  onClick={() => handleAddCurePreset(cure)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                    isIncluded
                      ? 'bg-rose-100 text-rose-900/60 border border-rose-200 opacity-60 cursor-default'
                      : isCorrectCure
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-400 active:scale-95'
                      : 'bg-rose-50 hover:bg-rose-200 text-rose-900 border border-rose-300 active:scale-95'
                  }`}
                  title={`${cure.prompt}${cure.targetCase ? ` (${cure.targetCase})` : ''}`}
                >
                  <span>{isIncluded ? '✓' : '+'}</span>
                  <span>{cure.name}</span>
                  {isCorrectCure ? (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      🎯 Đặc trị
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      ⚠️ Bẫy
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Danh sách thẻ thuốc đang có dạng Pill Chips Soft Clay */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-600 uppercase block">
            Toa thuốc hiện tại bé cần dùng để chữa lành:
          </span>
          <div className="flex flex-wrap gap-2 min-h-[44px] p-2.5 rounded-xl bg-white border border-rose-200">
            {currentCase.cureCards.map((cure, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 text-xs font-black bg-rose-100 text-rose-900 border border-rose-300 px-3 py-1.5 rounded-xl shadow-2xs"
              >
                <span>{cure}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCure(idx)}
                  className="size-4 rounded-full bg-rose-200 hover:bg-rose-300 text-rose-800 hover:text-rose-950 grid place-items-center cursor-pointer ml-1 text-xs font-black transition"
                  title="Xóa liều thuốc này"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            {currentCase.cureCards.length === 0 && (
              <span className="text-xs text-muted italic p-1">Chưa có thẻ thuốc nào</span>
            )}
          </div>
        </div>

        {/* Input nhập thuốc mới nhanh */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputCure}
            onChange={(e) => setInputCure(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddCure()
              }
            }}
            placeholder="Nhập tên liều thuốc mới (VD: Kê đơn 5 ngón tay hoàn chỉnh, Thêm đuôi cam)..."
            className="flex-1 min-w-0 rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs font-semibold text-rose-950 placeholder:text-rose-300 focus:border-rose-500 focus:outline-hidden"
          />
          <button
            type="button"
            onClick={handleAddCure}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 text-xs font-black shadow-2xs transition cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Plus size={13} />
            <span>+ Thêm thuốc</span>
          </button>
        </div>
      </div>
    </div>
  )
}
