import React, { useState } from 'react'
import { Plus, Trash2, ImagePlus } from 'lucide-react'
import type { SixStagePracticePartDef } from '../../../../shared/lib/api'
import {
  getDefaultPartsForMode,
  getEngineConfigMeta,
} from './engine-editor-defaults'

interface PracticePartsEditorProps {
  parts: SixStagePracticePartDef[]
  onChange: (parts: SixStagePracticePartDef[]) => void
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void
  mode?: string
}

export function PracticePartsEditor({
  parts,
  onChange,
  showToast,
  mode,
}: PracticePartsEditorProps) {
  const meta = getEngineConfigMeta(mode)
  const defaultParts = getDefaultPartsForMode(mode)
  const currentParts = parts && parts.length > 0 ? parts : defaultParts
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null)

  const handleUpdatePart = (index: number, patch: Partial<SixStagePracticePartDef>) => {
    const nextParts = [...currentParts]
    nextParts[index] = { ...nextParts[index], ...patch }
    onChange(nextParts)
  }

  const handleAddPart = () => {
    if (currentParts.length >= 12) {
      showToast(`Đã đạt giới hạn tối đa 12 ${meta.badge.toLowerCase()}`, 'info')
      return
    }
    const nextNumber = currentParts.length + 1
    const nextParts: SixStagePracticePartDef[] = [
      ...currentParts,
      {
        partNumber: nextNumber,
        title: `${meta.badge} thứ ${nextNumber}`,
        icon: 'part',
        emoji: '',
        iconImage: '/assets/aiki-keys/key_what_blue.jpg',
      },
    ]
    onChange(nextParts)
  }

  const handleRemovePart = (indexToRemove: number) => {
    if (currentParts.length <= 1) {
      showToast(`Phải có ít nhất 1 ${meta.badge.toLowerCase()} thực hành`, 'info')
      return
    }
    const nextParts = currentParts
      .filter((_, idx) => idx !== indexToRemove)
      .map((p, idx) => ({ ...p, partNumber: idx + 1 }))
    onChange(nextParts)
  }

  const handleLoadDefaultParts = () => {
    onChange(defaultParts)
    showToast(`Đã nạp danh sách ${meta.badge} mặc định`, 'success')
  }

  return (
    <div className="rounded-2xl border-2 border-amber-200/80 bg-[#FFFDF8] p-4 sm:p-5 space-y-4 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/70 pb-3">
        <div>
          <h4 className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
            <span>{meta.title}</span>
            <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-black">
              {currentParts.length} {meta.badge}
            </span>
          </h4>
          <p className="text-[11px] font-medium text-amber-900/80 mt-0.5">
            {meta.desc}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadDefaultParts}
            className="rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-black text-amber-800 shadow-2xs hover:bg-amber-50 active:scale-[0.98] transition cursor-pointer flex items-center gap-1"
          >
            <span>🔄 Nạp mặc định</span>
          </button>
          <button
            type="button"
            onClick={handleAddPart}
            className="rounded-xl border border-[#FD7D2E] bg-gradient-to-r from-[#FD7D2E] to-[#F97316] px-3 py-1.5 text-xs font-black text-white shadow-2xs hover:opacity-95 active:scale-[0.98] transition cursor-pointer flex items-center gap-1"
          >
            <Plus size={13} />
            <span>Thêm {meta.badge.toLowerCase()}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {currentParts.map((part, pIdx) => {
          const isEditingImg = editingImageIndex === pIdx
          return (
            <div
              key={part.partNumber || pIdx}
              className="relative bg-[#FFFDF8] border-2 border-amber-200/80 rounded-2xl p-3 shadow-xs hover:border-[#FD7D2E] transition-all flex flex-col justify-between gap-2.5 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  {part.iconImage ? (
                    <img
                      src={part.iconImage}
                      alt={part.title}
                      className="w-11 h-11 rounded-xl object-contain bg-amber-50 p-1 border border-amber-200/60 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-amber-50 p-1 border border-amber-200/60 shrink-0 flex items-center justify-center text-amber-800 font-bold text-xs">
                      #{part.partNumber || pIdx + 1}
                    </div>
                  )}
                  <span className="absolute -top-1.5 -left-1.5 size-5 rounded-md bg-[#FD7D2E] text-white font-black text-[10px] grid place-items-center shadow-2xs">
                    {part.partNumber || pIdx + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={part.title}
                    onChange={(e) => handleUpdatePart(pIdx, { title: e.target.value })}
                    placeholder={`Tên món đồ ${pIdx + 1}...`}
                    className="w-full rounded-lg border border-amber-200/70 bg-white px-2 py-1 font-black text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FD7D2E] transition"
                  />
                </div>
              </div>

              {isEditingImg && (
                <div className="pt-1.5 space-y-1 bg-amber-50/70 p-2 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-900 block">Đường dẫn ảnh (URL):</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={part.iconImage || ''}
                      onChange={(e) => handleUpdatePart(pIdx, { iconImage: e.target.value })}
                      placeholder="/assets/aiki-..."
                      className="flex-1 min-w-0 rounded-lg border border-amber-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingImageIndex(null)}
                      className="rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold px-2 py-1 text-[11px] cursor-pointer shrink-0"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-amber-100 text-[11px]">
                <button
                  type="button"
                  onClick={() => setEditingImageIndex(isEditingImg ? null : pIdx)}
                  className="text-amber-800 hover:text-[#FD7D2E] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                  title="Đổi ảnh hoặc icon"
                >
                  <ImagePlus size={13} />
                  <span>{isEditingImg ? 'Ẩn URL ảnh' : 'Đổi ảnh'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemovePart(pIdx)}
                  title="Xóa món đồ này"
                  className="size-7 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 grid place-items-center transition shrink-0 cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        })}

        <button
          type="button"
          onClick={handleAddPart}
          className="border-2 border-dashed border-amber-300 rounded-2xl p-3 flex items-center justify-center gap-2 hover:bg-amber-50 cursor-pointer text-xs font-black text-amber-800 transition min-h-[88px]"
        >
          <Plus size={15} className="text-[#FD7D2E]" />
          <span>Thêm {meta.badge.toLowerCase()} mới</span>
        </button>
      </div>
    </div>
  )
}
