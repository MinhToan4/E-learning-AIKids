import React, { useState } from 'react'
import { Sparkles } from 'lucide-react'
import type { SixStageFourKeysOptions, SixStagePracticePartDef } from '@/shared/lib/api'
import { DEFAULT_FOUR_KEYS_OPTIONS, suggestFourKeysForSubject } from './engine-editor-defaults'

interface MagicKeysEditorProps {
  fourKeysOptions?: SixStageFourKeysOptions
  subjectName?: string
  practiceParts?: SixStagePracticePartDef[]
  onChange: (options: SixStageFourKeysOptions) => void
  onSuggestParts?: (parts: any) => void
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void
}

export function MagicKeysEditor({
  fourKeysOptions,
  subjectName,
  practiceParts,
  onChange,
  onSuggestParts,
  showToast,
}: MagicKeysEditorProps) {
  const fourKeys: SixStageFourKeysOptions = fourKeysOptions || DEFAULT_FOUR_KEYS_OPTIONS

  // Tự động đồng bộ Khay 1 (Cái gì) từ practiceParts (Tầng 1) nếu có
  const resolvedWhat =
    practiceParts && practiceParts.length > 0
      ? practiceParts.map((p) => p.title)
      : fourKeys.what || DEFAULT_FOUR_KEYS_OPTIONS.what || []

  const [inputHow, setInputHow] = useState('')
  const [inputAction, setInputAction] = useState('')
  const [inputWhere, setInputWhere] = useState('')

  const handleAddTag = (category: keyof SixStageFourKeysOptions, text: string, setInput: (v: string) => void) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const currentList = fourKeys[category] || []
    if (currentList.includes(trimmed)) {
      showToast(`Thẻ "${trimmed}" đã có trong danh sách`, 'info')
      setInput('')
      return
    }
    const nextList = [...currentList, trimmed]
    onChange({
      ...fourKeys,
      [category]: nextList,
    })
    setInput('')
  }

  const handleRemoveTag = (category: keyof SixStageFourKeysOptions, indexToRemove: number) => {
    const currentList = fourKeys[category] || []
    const nextList = currentList.filter((_, idx) => idx !== indexToRemove)
    onChange({
      ...fourKeys,
      [category]: nextList,
    })
  }

  const handleSuggestFourKeys = () => {
    const suggested = suggestFourKeysForSubject(subjectName || '')
    if (onSuggestParts) {
      onSuggestParts(suggested.parts)
    }
    onChange(suggested.fourKeys)
    showToast('🪄 Đã gợi ý bộ thẻ 4 Chìa Khóa và món đồ chuẩn theo bài!', 'success')
  }

  return (
    <div className="rounded-2xl border-2 border-brand-200 bg-white p-4 space-y-3.5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-2.5">
        <div>
          <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
            <span>🔑 Ngân Hàng Thẻ 4 Chìa Khóa (AI Studio Magic Keys)</span>
            <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-black">
              Hallmark SSOT
            </span>
          </h4>
          <p className="text-[11px] font-medium text-slate-600 mt-0.5">
            Học sinh bấm chọn các thẻ này ở Bàn phím Ma Thuật để ghép thành câu lệnh hoàn chỉnh.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSuggestFourKeys}
          className="rounded-xl border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-black text-brand-800 shadow-2xs hover:bg-brand-100 transition cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles size={13} className="text-brand-600" />
          <span>🪄 Gợi ý thẻ 4 Chìa Khóa theo bài</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Khay 1: Cái gì? (Sky Blue) - Tự động đồng bộ từ Tầng 1 */}
        <div className="rounded-2xl border-2 border-sky-300 bg-sky-50/70 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-sky-900 flex items-center gap-1">
              🔑 1. Cái gì? (Chủ thể / Món đồ)
            </span>
            <span className="rounded-full bg-sky-500 text-white text-[9px] font-black px-1.5 py-0.2">
              {resolvedWhat.length} thẻ (Đồng bộ Tầng 1)
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[32px] p-1.5 rounded-xl bg-white/90 border border-sky-200">
            {resolvedWhat.map((tag, tIdx) => (
              <span
                key={tIdx}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300 px-2.5 py-1 rounded-lg shadow-2xs"
              >
                <span>🎨 {tag}</span>
              </span>
            ))}
            {resolvedWhat.length === 0 && (
              <span className="text-[11px] text-muted italic">Chưa có món đồ nào từ Tầng 1</span>
            )}
          </div>
          <p className="text-[10px] text-sky-800 font-medium italic">
            💡 Tự động hiển thị và đồng bộ từ danh sách món đồ thực hành (Tầng 1).
          </p>
        </div>

        {/* Khay 2: Trông thế nào? (Sun Yellow) */}
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-900 flex items-center gap-1">
              🔑 2. Trông thế nào? (Hình dáng / Màu sắc)
            </span>
            <span className="rounded-full bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2">
              {(fourKeys.how || []).length} thẻ
            </span>
          </div>

          {/* Preset Chips Bank */}
          <div className="flex flex-wrap gap-1 items-center text-[10px]">
            <span className="text-amber-800 font-bold">Gợi ý:</span>
            {(DEFAULT_FOUR_KEYS_OPTIONS.how || []).map((preset, pIdx) => {
              const isAdded = (fourKeys.how || []).includes(preset)
              return (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handleAddTag('how', preset, setInputHow)}
                  className={`rounded-full px-2 py-0.5 font-bold transition flex items-center gap-0.5 cursor-pointer text-[10px] ${
                    isAdded
                      ? 'bg-amber-100 text-amber-900/60 opacity-60 cursor-default'
                      : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 active:scale-95 shadow-2xs'
                  }`}
                >
                  <span>{isAdded ? '✓' : '+'}</span>
                  <span>{preset}</span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[32px] p-1.5 rounded-xl bg-white/90 border border-amber-200">
            {(fourKeys.how || []).map((tag, tIdx) => (
              <span
                key={tIdx}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg shadow-2xs"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag('how', tIdx)}
                  className="hover:text-rose-600 font-black cursor-pointer ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
            {(fourKeys.how || []).length === 0 && (
              <span className="text-[11px] text-muted italic">Chưa có thẻ nào</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={inputHow}
              onChange={(e) => setInputHow(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag('how', inputHow, setInputHow)
                }
              }}
              placeholder="VD: men bóng mẻ miệng, màu xanh mini..."
              className="flex-1 min-w-0 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-semibold text-amber-950 placeholder:text-amber-300"
            />
            <button
              type="button"
              onClick={() => handleAddTag('how', inputHow, setInputHow)}
              className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 text-xs font-black shadow-2xs transition cursor-pointer shrink-0"
            >
              + Thêm
            </button>
          </div>
        </div>

        {/* Khay 3: Đang làm gì? (Mango Orange / Mint Green) */}
        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-900 flex items-center gap-1">
              🔑 3. Đang làm gì? (Hành động)
            </span>
            <span className="rounded-full bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2">
              {(fourKeys.action || []).length} thẻ
            </span>
          </div>

          {/* Preset Chips Bank */}
          <div className="flex flex-wrap gap-1 items-center text-[10px]">
            <span className="text-emerald-800 font-bold">Gợi ý:</span>
            {(DEFAULT_FOUR_KEYS_OPTIONS.action || []).map((preset, pIdx) => {
              const isAdded = (fourKeys.action || []).includes(preset)
              return (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handleAddTag('action', preset, setInputAction)}
                  className={`rounded-full px-2 py-0.5 font-bold transition flex items-center gap-0.5 cursor-pointer text-[10px] ${
                    isAdded
                      ? 'bg-emerald-100 text-emerald-900/60 opacity-60 cursor-default'
                      : 'bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 active:scale-95 shadow-2xs'
                  }`}
                >
                  <span>{isAdded ? '✓' : '+'}</span>
                  <span>{preset}</span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[32px] p-1.5 rounded-xl bg-white/90 border border-emerald-200">
            {(fourKeys.action || []).map((tag, tIdx) => (
              <span
                key={tIdx}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-lg shadow-2xs"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag('action', tIdx)}
                  className="hover:text-rose-600 font-black cursor-pointer ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
            {(fourKeys.action || []).length === 0 && (
              <span className="text-[11px] text-muted italic">Chưa có thẻ nào</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={inputAction}
              onChange={(e) => setInputAction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag('action', inputAction, setInputAction)
                }
              }}
              placeholder="VD: đang bốc khói nghi ngút, đang chạy bon bon..."
              className="flex-1 min-w-0 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-950 placeholder:text-emerald-300"
            />
            <button
              type="button"
              onClick={() => handleAddTag('action', inputAction, setInputAction)}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-xs font-black shadow-2xs transition cursor-pointer shrink-0"
            >
              + Thêm
            </button>
          </div>
        </div>

        {/* Khay 4: Ở đâu? (Rose Pink) */}
        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/70 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-900 flex items-center gap-1">
              🔑 4. Ở đâu? (Bối cảnh / Vị trí)
            </span>
            <span className="rounded-full bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2">
              {(fourKeys.where || []).length} thẻ
            </span>
          </div>

          {/* Preset Chips Bank */}
          <div className="flex flex-wrap gap-1 items-center text-[10px]">
            <span className="text-rose-800 font-bold">Gợi ý:</span>
            {(DEFAULT_FOUR_KEYS_OPTIONS.where || []).map((preset, pIdx) => {
              const isAdded = (fourKeys.where || []).includes(preset)
              return (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handleAddTag('where', preset, setInputWhere)}
                  className={`rounded-full px-2 py-0.5 font-bold transition flex items-center gap-0.5 cursor-pointer text-[10px] ${
                    isAdded
                      ? 'bg-rose-100 text-rose-900/60 opacity-60 cursor-default'
                      : 'bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 active:scale-95 shadow-2xs'
                  }`}
                >
                  <span>{isAdded ? '✓' : '+'}</span>
                  <span>{preset}</span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[32px] p-1.5 rounded-xl bg-white/90 border border-rose-200">
            {(fourKeys.where || []).map((tag, tIdx) => (
              <span
                key={tIdx}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.5 rounded-lg shadow-2xs"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag('where', tIdx)}
                  className="hover:text-rose-600 font-black cursor-pointer ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
            {(fourKeys.where || []).length === 0 && (
              <span className="text-[11px] text-muted italic">Chưa có thẻ nào</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={inputWhere}
              onChange={(e) => setInputWhere(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag('where', inputWhere, setInputWhere)
                }
              }}
              placeholder="VD: trên bàn gỗ mộc, bên cửa sổ..."
              className="flex-1 min-w-0 rounded-lg border border-rose-300 bg-white px-2.5 py-1 text-xs font-semibold text-rose-950 placeholder:text-rose-300"
            />
            <button
              type="button"
              onClick={() => handleAddTag('where', inputWhere, setInputWhere)}
              className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 text-xs font-black shadow-2xs transition cursor-pointer shrink-0"
            >
              + Thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
