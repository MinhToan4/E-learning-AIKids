import React, { useState } from 'react'
import { Sparkles, X, Plus } from 'lucide-react'
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
    showToast('Đã gợi ý bộ thẻ 4 Chìa Khóa và món đồ chuẩn theo bài!', 'success')
  }

  return (
    <div className="rounded-2xl border-2 border-amber-200/80 bg-[#FFFDF8] p-4 sm:p-5 space-y-4 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/70 pb-3">
        <div>
          <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
            <span>Ngân Hàng Thẻ 4 Chìa Khóa (AI Studio Magic Keys)</span>
            <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-black">
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
          className="rounded-xl bg-gradient-to-r from-[#FD7D2E] to-[#F97316] text-white font-black shadow-xs hover:opacity-95 active:scale-[0.98] transition px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles size={13} className="text-white" />
          <span>Gợi ý thẻ 4 Chìa Khóa theo bài</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Khay 1: Cái gì? (Tông Cam Aiki ấm áp) - Tự động đồng bộ từ Tầng 1 */}
        <div className="rounded-2xl border-2 border-[#FD7D2E]/40 bg-[#FFF9F5] text-amber-950 p-4 space-y-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black flex items-center gap-1 text-amber-950">
                1. Cái gì? (Chủ thể / Món đồ)
              </span>
              <span className="rounded-full bg-[#FD7D2E] text-white text-[10px] font-black px-2 py-0.5 shadow-2xs">
                {resolvedWhat.length} thẻ (Đồng bộ Tầng 1)
              </span>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-xl bg-white/90 border border-amber-200/80">
              {resolvedWhat.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="inline-flex items-center gap-1 text-xs font-black bg-amber-100/90 text-amber-950 border border-amber-300 px-3 py-1.5 rounded-xl shadow-2xs"
                >
                  <span>{tag}</span>
                </span>
              ))}
              {resolvedWhat.length === 0 && (
                <span className="text-xs text-amber-800/60 italic p-1">Chưa có món đồ nào từ Tầng 1</span>
              )}
            </div>
          </div>
          <p className="text-[11px] text-amber-900/80 font-medium italic pt-1 border-t border-amber-200/60">
            Tự động hiển thị và đồng bộ từ danh sách món đồ thực hành (Tầng 1).
          </p>
        </div>

        {/* Khay 2: Trông thế nào? (Tông Tím Soft Clay) */}
        <div className="rounded-2xl border-2 border-purple-200 bg-purple-50/80 text-purple-950 p-4 space-y-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black flex items-center gap-1 text-purple-950">
                2. Trông thế nào? (Hình dáng / Màu sắc)
              </span>
              <span className="rounded-full bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 shadow-2xs">
                {(fourKeys.how || []).length} thẻ
              </span>
            </div>

            {/* Preset Chips Bank */}
            <div className="flex flex-wrap gap-1.5 items-center text-xs">
              <span className="text-purple-900 font-black text-[11px]">Gợi ý:</span>
              {(DEFAULT_FOUR_KEYS_OPTIONS.how || []).map((preset, pIdx) => {
                const isAdded = (fourKeys.how || []).includes(preset)
                return (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleAddTag('how', preset, setInputHow)}
                    className={`rounded-xl px-2.5 py-1 font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                      isAdded
                        ? 'bg-purple-200/80 text-purple-900/60 opacity-60 cursor-default border border-purple-200'
                        : 'bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 active:scale-95 shadow-2xs'
                    }`}
                  >
                    <span>{isAdded ? '✓' : '+'}</span>
                    <span>{preset}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-xl bg-white/90 border border-purple-200">
              {(fourKeys.how || []).map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="inline-flex items-center gap-1.5 text-xs font-black bg-purple-100/90 text-purple-950 border border-purple-300 px-3 py-1.5 rounded-xl shadow-2xs"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag('how', tIdx)}
                    className="hover:text-rose-600 text-purple-700 font-black cursor-pointer ml-0.5 transition"
                    title="Xóa thẻ này"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {(fourKeys.how || []).length === 0 && (
                <span className="text-xs text-purple-800/60 italic p-1">Chưa có thẻ nào</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-purple-200/60">
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
              className="flex-1 min-w-0 rounded-xl border border-purple-300 bg-white px-3 py-1.5 text-xs font-bold text-purple-950 placeholder:text-purple-300 focus:outline-hidden focus:border-purple-500"
            />
            <button
              type="button"
              onClick={() => handleAddTag('how', inputHow, setInputHow)}
              className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 text-xs font-black shadow-xs transition cursor-pointer shrink-0 flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Thêm</span>
            </button>
          </div>
        </div>

        {/* Khay 3: Đang làm gì? (Tông Xanh Dương Soft Clay) */}
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/80 text-blue-950 p-4 space-y-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black flex items-center gap-1 text-blue-950">
                3. Đang làm gì? (Hành động)
              </span>
              <span className="rounded-full bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 shadow-2xs">
                {(fourKeys.action || []).length} thẻ
              </span>
            </div>

            {/* Preset Chips Bank */}
            <div className="flex flex-wrap gap-1.5 items-center text-xs">
              <span className="text-blue-900 font-black text-[11px]">Gợi ý:</span>
              {(DEFAULT_FOUR_KEYS_OPTIONS.action || []).map((preset, pIdx) => {
                const isAdded = (fourKeys.action || []).includes(preset)
                return (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleAddTag('action', preset, setInputAction)}
                    className={`rounded-xl px-2.5 py-1 font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                      isAdded
                        ? 'bg-blue-200/80 text-blue-900/60 opacity-60 cursor-default border border-blue-200'
                        : 'bg-white hover:bg-blue-100 text-blue-900 border border-blue-200 active:scale-95 shadow-2xs'
                    }`}
                  >
                    <span>{isAdded ? '✓' : '+'}</span>
                    <span>{preset}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-xl bg-white/90 border border-blue-200">
              {(fourKeys.action || []).map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="inline-flex items-center gap-1.5 text-xs font-black bg-blue-100/90 text-blue-950 border border-blue-300 px-3 py-1.5 rounded-xl shadow-2xs"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag('action', tIdx)}
                    className="hover:text-rose-600 text-blue-700 font-black cursor-pointer ml-0.5 transition"
                    title="Xóa thẻ này"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {(fourKeys.action || []).length === 0 && (
                <span className="text-xs text-blue-800/60 italic p-1">Chưa có thẻ nào</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-blue-200/60">
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
              placeholder="VD: đang bốc khói, đang lăn tròn..."
              className="flex-1 min-w-0 rounded-xl border border-blue-300 bg-white px-3 py-1.5 text-xs font-bold text-blue-950 placeholder:text-blue-300 focus:outline-hidden focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => handleAddTag('action', inputAction, setInputAction)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-black shadow-xs transition cursor-pointer shrink-0 flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Thêm</span>
            </button>
          </div>
        </div>

        {/* Khay 4: Ở đâu? (Tông Xanh Ngọc Soft Clay) */}
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 text-emerald-950 p-4 space-y-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black flex items-center gap-1 text-emerald-950">
                4. Ở đâu? (Bối cảnh / Không gian)
              </span>
              <span className="rounded-full bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 shadow-2xs">
                {(fourKeys.where || []).length} thẻ
              </span>
            </div>

            {/* Preset Chips Bank */}
            <div className="flex flex-wrap gap-1.5 items-center text-xs">
              <span className="text-emerald-900 font-black text-[11px]">Gợi ý:</span>
              {(DEFAULT_FOUR_KEYS_OPTIONS.where || []).map((preset, pIdx) => {
                const isAdded = (fourKeys.where || []).includes(preset)
                return (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleAddTag('where', preset, setInputWhere)}
                    className={`rounded-xl px-2.5 py-1 font-bold text-xs transition flex items-center gap-1 cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-200/80 text-emerald-900/60 opacity-60 cursor-default border border-emerald-200'
                        : 'bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 active:scale-95 shadow-2xs'
                    }`}
                  >
                    <span>{isAdded ? '✓' : '+'}</span>
                    <span>{preset}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-xl bg-white/90 border border-emerald-200">
              {(fourKeys.where || []).map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="inline-flex items-center gap-1.5 text-xs font-black bg-emerald-100/90 text-emerald-950 border border-emerald-300 px-3 py-1.5 rounded-xl shadow-2xs"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag('where', tIdx)}
                    className="hover:text-rose-600 text-emerald-700 font-black cursor-pointer ml-0.5 transition"
                    title="Xóa thẻ này"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {(fourKeys.where || []).length === 0 && (
                <span className="text-xs text-emerald-800/60 italic p-1">Chưa có thẻ nào</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/60">
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
              placeholder="VD: trên bàn gỗ mộc, ở sân cỏ xanh..."
              className="flex-1 min-w-0 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-950 placeholder:text-emerald-300 focus:outline-hidden focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => handleAddTag('where', inputWhere, setInputWhere)}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-black shadow-xs transition cursor-pointer shrink-0 flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Thêm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
