import React, { useState } from 'react'
import { Sparkles, Plus, ShieldCheck, Smile, X } from 'lucide-react'
import {
  DEFAULT_LOCKED_FEATURES,
  DEFAULT_EXPRESSIONS,
  IDENTITY_LOCK_DNA_PRESETS,
  IDENTITY_LOCK_EXPRESSION_PRESETS,
} from './engine-editor-defaults'

interface IdentityLockEditorProps {
  lockedFeatures?: string[]
  expressionOptions?: string[]
  onLockedFeaturesChange: (features: string[]) => void
  onExpressionsChange: (expressions: string[]) => void
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void
}

export function IdentityLockEditor({
  lockedFeatures,
  expressionOptions,
  onLockedFeaturesChange,
  onExpressionsChange,
  showToast,
}: IdentityLockEditorProps) {
  const currentFeatures = (lockedFeatures && lockedFeatures.length > 0)
    ? lockedFeatures
    : DEFAULT_LOCKED_FEATURES

  const currentExpressions = (expressionOptions && expressionOptions.length > 0)
    ? expressionOptions
    : DEFAULT_EXPRESSIONS

  const [inputFeature, setInputFeature] = useState('')
  const [inputExpression, setInputExpression] = useState('')

  // ADN Features handlers
  const handleAddFeaturePreset = (preset: string) => {
    if (currentFeatures.includes(preset)) {
      showToast(`Mật mã ADN "${preset}" đã có`, 'info')
      return
    }
    onLockedFeaturesChange([...currentFeatures, preset])
    showToast(`Đã khóa đặc điểm ADN: ${preset}`, 'success')
  }

  const handleAddFeature = () => {
    const trimmed = inputFeature.trim()
    if (!trimmed) return
    if (currentFeatures.includes(trimmed)) {
      showToast(`Mật mã ADN "${trimmed}" đã có`, 'info')
      return
    }
    onLockedFeaturesChange([...currentFeatures, trimmed])
    setInputFeature('')
    showToast(`Đã thêm mật mã ADN: ${trimmed}`, 'success')
  }

  const handleRemoveFeature = (idx: number) => {
    if (currentFeatures.length <= 1) {
      showToast('Cần ít nhất 1 mật mã ADN bất biến', 'info')
      return
    }
    onLockedFeaturesChange(currentFeatures.filter((_, i) => i !== idx))
  }

  const handleLoadDefaultFeatures = () => {
    onLockedFeaturesChange(DEFAULT_LOCKED_FEATURES)
    showToast('Đã nạp 3 Mật mã ADN mẫu', 'success')
  }

  // Expression handlers
  const handleAddExpressionPreset = (preset: string) => {
    if (currentExpressions.includes(preset)) {
      showToast(`Biểu cảm "${preset}" đã có`, 'info')
      return
    }
    onExpressionsChange([...currentExpressions, preset])
    showToast(`Đã thêm biểu cảm: ${preset}`, 'success')
  }

  const handleAddExpression = () => {
    const trimmed = inputExpression.trim()
    if (!trimmed) return
    if (currentExpressions.includes(trimmed)) {
      showToast(`Biểu cảm "${trimmed}" đã có`, 'info')
      return
    }
    onExpressionsChange([...currentExpressions, trimmed])
    setInputExpression('')
    showToast(`Đã thêm biểu cảm: ${trimmed}`, 'success')
  }

  const handleRemoveExpression = (idx: number) => {
    if (currentExpressions.length <= 1) {
      showToast('Cần ít nhất 1 biểu cảm', 'info')
      return
    }
    onExpressionsChange(currentExpressions.filter((_, i) => i !== idx))
  }

  const handleLoadDefaultExpressions = () => {
    onExpressionsChange(DEFAULT_EXPRESSIONS)
    showToast('Đã nạp 6 biểu cảm mẫu Hallmark', 'success')
  }

  return (
    <div className="rounded-2xl border-2 border-cyan-200/80 bg-[#FFFDF8] p-4 sm:p-5 space-y-4 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-200/70 pb-3">
        <div>
          <h4 className="text-xs font-black uppercase text-cyan-950 flex items-center gap-1.5">
            <span>🔒 Khóa Mật Mã ADN & 6 Biểu Cảm (Identity Lock Editor)</span>
            <span className="rounded-full bg-cyan-100 text-cyan-900 border border-cyan-300 px-2 py-0.5 text-[10px] font-black">
              Bảo Toàn Nhân Vật
            </span>
          </h4>
          <p className="text-[11px] font-medium text-slate-600 mt-0.5">
            Khóa cố định các đặc điểm ADN bất biến và xoay chuyển các trạng thái cảm xúc của nhân vật qua ngân hàng chip mẫu.
          </p>
        </div>
      </div>

      {/* ── Phần 1: 3 Mật Mã ADN Bất Biến ───────────────────────────── */}
      <div className="rounded-2xl border-2 border-cyan-200/80 bg-cyan-50/60 p-4 space-y-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-cyan-900 uppercase">
            <ShieldCheck size={14} className="text-cyan-700" />
            <span>🔒 3 Mật Mã ADN Bất Biến (lockedFeatures)</span>
            <span className="rounded-full bg-cyan-200 text-cyan-900 text-[9px] font-black px-2 py-0.5">
              {currentFeatures.length} đặc điểm
            </span>
          </div>
          <button
            type="button"
            onClick={handleLoadDefaultFeatures}
            className="text-[11px] font-black text-cyan-700 hover:text-cyan-900 bg-white border border-cyan-300 rounded-xl px-2.5 py-1 shadow-2xs cursor-pointer active:scale-95 transition"
          >
            🔄 Mật mã mẫu
          </button>
        </div>

        {/* Khay Chip ADN Có SẴn */}
        <div className="rounded-xl border border-cyan-200 bg-white/90 p-3 space-y-1.5">
          <span className="text-[10px] font-black text-cyan-800 uppercase block">
            + Ngân hàng đặc điểm ADN nhận diện (1-chạm khóa nhanh):
          </span>
          <div className="flex flex-wrap gap-2">
            {IDENTITY_LOCK_DNA_PRESETS.map((dna, dIdx) => {
              const isLocked = currentFeatures.includes(dna)
              return (
                <button
                  key={dIdx}
                  type="button"
                  onClick={() => handleAddFeaturePreset(dna)}
                  className={`rounded-xl px-3 py-1 font-bold text-xs transition flex items-center gap-1 cursor-pointer shadow-2xs ${
                    isLocked
                      ? 'bg-cyan-100 text-cyan-900/60 border border-cyan-200 opacity-60 cursor-default'
                      : 'bg-white hover:bg-cyan-100 text-cyan-900 border border-cyan-300 active:scale-95'
                  }`}
                >
                  <span>{isLocked ? '✓' : '+'}</span>
                  <span>{dna}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Danh sách thẻ ADN đang khóa dạng Pill Chips */}
        <div className="flex flex-wrap gap-2 min-h-[44px] p-2.5 rounded-xl bg-white border border-cyan-200">
          {currentFeatures.map((feat, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 text-xs font-black bg-cyan-100 text-cyan-900 border border-cyan-300 px-3 py-1.5 rounded-xl shadow-2xs"
            >
              <span className="font-mono font-black text-[10px] bg-cyan-200 px-1.5 py-0.5 rounded-md text-cyan-800">
                #{idx + 1}
              </span>
              <span>{feat}</span>
              <button
                type="button"
                onClick={() => handleRemoveFeature(idx)}
                className="size-4 rounded-full bg-cyan-200 hover:bg-rose-200 text-cyan-800 hover:text-rose-700 grid place-items-center cursor-pointer ml-1 text-xs font-black transition"
                title="Xóa đặc điểm này"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          {currentFeatures.length === 0 && (
            <span className="text-xs text-cyan-800/60 italic p-1">Chưa có đặc điểm ADN nào</span>
          )}
        </div>

        {/* Input thêm ADN */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputFeature}
            onChange={(e) => setInputFeature(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddFeature()
              }
            }}
            placeholder="VD: Đội mũ len đỏ quả bông, Mắt xanh biếc..."
            className="flex-1 min-w-0 rounded-xl border border-cyan-300 bg-white px-3 py-2 text-xs font-semibold text-cyan-950 placeholder:text-cyan-300 focus:border-cyan-500 focus:outline-hidden"
          />
          <button
            type="button"
            onClick={handleAddFeature}
            className="rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white px-3.5 py-2 text-xs font-black shadow-2xs transition cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Plus size={13} />
            <span>Thêm ADN</span>
          </button>
        </div>
      </div>

      {/* ── Phần 2: Bánh Xe 6 Biểu Cảm Thần Thái ────────────────────── */}
      <div className="rounded-2xl border-2 border-cyan-200/80 bg-cyan-50/60 p-4 space-y-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-cyan-900 uppercase">
            <Smile size={14} className="text-cyan-700" />
            <span>🎭 Bánh Xe 6 Biểu Cảm Thần Thái</span>
            <span className="rounded-full bg-cyan-200 text-cyan-900 text-[9px] font-black px-2 py-0.5">
              {currentExpressions.length} biểu cảm
            </span>
          </div>
          <button
            type="button"
            onClick={handleLoadDefaultExpressions}
            className="rounded-xl border border-cyan-300 bg-white px-3 py-1.5 text-xs font-black text-cyan-800 shadow-2xs hover:bg-cyan-100 transition cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles size={12} className="text-cyan-600" />
            <span>🪄 Nạp 6 biểu cảm mẫu Hallmark</span>
          </button>
        </div>

        {/* Khay Chip Biểu Cảm Có Sẵn */}
        <div className="rounded-xl border border-cyan-200 bg-white/90 p-3 space-y-1.5">
          <span className="text-[10px] font-black text-cyan-800 uppercase block">
            + Ngân hàng biểu cảm thần thái (1-chạm thêm nhanh):
          </span>
          <div className="flex flex-wrap gap-2">
            {IDENTITY_LOCK_EXPRESSION_PRESETS.map((expr, eIdx) => {
              const isIncluded = currentExpressions.includes(expr)
              return (
                <button
                  key={eIdx}
                  type="button"
                  onClick={() => handleAddExpressionPreset(expr)}
                  className={`rounded-xl px-3 py-1 font-bold text-xs transition flex items-center gap-1 cursor-pointer shadow-2xs ${
                    isIncluded
                      ? 'bg-cyan-100 text-cyan-900/60 border border-cyan-200 opacity-60 cursor-default'
                      : 'bg-white hover:bg-cyan-100 text-cyan-900 border border-cyan-300 active:scale-95'
                  }`}
                >
                  <span>{isIncluded ? '✓' : '+'}</span>
                  <span>{expr}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Danh sách Biểu Cảm dạng Pill Chips Soft Clay */}
        <div className="flex flex-wrap gap-2 min-h-[44px] p-2.5 rounded-xl bg-white border border-cyan-200">
          {currentExpressions.map((expr, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 text-xs font-black bg-cyan-100 text-cyan-900 border border-cyan-300 px-3 py-1.5 rounded-xl shadow-2xs"
            >
              <span>{expr}</span>
              <button
                type="button"
                onClick={() => handleRemoveExpression(idx)}
                className="size-4 rounded-full bg-cyan-200 hover:bg-rose-200 text-cyan-800 hover:text-rose-700 grid place-items-center cursor-pointer ml-1 text-xs font-black transition"
                title="Xóa biểu cảm này"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          {currentExpressions.length === 0 && (
            <span className="text-xs text-cyan-800/60 italic p-1">Chưa có biểu cảm nào</span>
          )}
        </div>

        {/* Input thêm biểu cảm */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputExpression}
            onChange={(e) => setInputExpression(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddExpression()
              }
            }}
            placeholder="VD: 🤩 Hào hứng reo hò, 🥺 Lo lắng ôm má..."
            className="flex-1 min-w-0 rounded-xl border border-cyan-300 bg-white px-3 py-2 text-xs font-semibold text-cyan-950 placeholder:text-cyan-300 focus:border-cyan-500 focus:outline-hidden"
          />
          <button
            type="button"
            onClick={handleAddExpression}
            className="rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white px-3.5 py-2 text-xs font-black shadow-2xs transition cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Plus size={13} />
            <span>+ Thêm biểu cảm</span>
          </button>
        </div>
      </div>
    </div>
  )
}
