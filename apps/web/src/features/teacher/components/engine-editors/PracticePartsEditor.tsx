import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { SixStagePracticePartDef } from '../../../../shared/lib/api'
import { CmsImageUploader } from '../stage-block-editors/CmsImageUploader'
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {currentParts.map((part, pIdx) => {
          return (
            <div
              key={part.partNumber || pIdx}
              className="relative bg-white border-2 border-amber-200/80 rounded-2xl p-3.5 shadow-2xs hover:border-[#FD7D2E] transition-all flex flex-col justify-between gap-3 group"
            >
              {/* Header Thẻ: Số thứ tự + Nhãn + Nút xóa */}
              <div className="flex items-center justify-between gap-2 border-b border-amber-100/80 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="size-6 rounded-lg bg-[#FD7D2E] text-white font-black text-xs grid place-items-center shadow-2xs shrink-0">
                    {part.partNumber || pIdx + 1}
                  </span>
                  <span className="text-xs font-black text-amber-950 truncate">
                    {meta.badge} #{part.partNumber || pIdx + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePart(pIdx)}
                  title={`Xóa ${meta.badge.toLowerCase()} này`}
                  className="size-7 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 grid place-items-center transition shrink-0 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Khung hiển thị & Tải ảnh to rõ nét (CmsImageUploader đồng nhất) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-amber-950 uppercase tracking-wide">
                    Ảnh {meta.badge.toLowerCase()} bé vẽ:
                  </span>
                  {part.iconImage && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                      ✓ Đã có ảnh
                    </span>
                  )}
                </div>

                <CmsImageUploader
                  imageUrl={part.iconImage || ''}
                  imageAlt={part.title || `Món đồ ${pIdx + 1}`}
                  tone="amber"
                  compact={true}
                  onImageChange={(url) => handleUpdatePart(pIdx, { iconImage: url })}
                  showToast={showToast}
                  uploadPurpose="island_practice_part"
                  className="w-full"
                />

                {/* Ô nhập URL trực tiếp — đồng bộ với các khối khác */}
                <div className="flex items-center gap-1.5 bg-[#FFFDF8] border border-amber-200/90 rounded-xl px-2.5 py-1 shadow-2xs focus-within:border-[#FD7D2E] focus-within:ring-1 focus-within:ring-orange-200 transition">
                  <span className="text-[10px] font-black text-amber-800 shrink-0">URL:</span>
                  <input
                    type="text"
                    value={part.iconImage || ''}
                    onChange={(e) => handleUpdatePart(pIdx, { iconImage: e.target.value })}
                    placeholder="Dán link ảnh hoặc chọn file ở trên..."
                    className="w-full text-[11px] font-semibold text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-hidden"
                  />
                  {part.iconImage && (
                    <button
                      type="button"
                      onClick={() => handleUpdatePart(pIdx, { iconImage: '' })}
                      className="text-slate-400 hover:text-rose-500 text-xs shrink-0 cursor-pointer"
                      title="Xóa link ảnh"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Tên món đồ */}
              <div className="space-y-1 pt-1 border-t border-amber-100/70">
                <label className="text-[11px] font-black uppercase text-amber-950 block">
                  Tên {meta.badge.toLowerCase()} (Bé vẽ):
                </label>
                <input
                  type="text"
                  value={part.title}
                  onChange={(e) => handleUpdatePart(pIdx, { title: e.target.value })}
                  placeholder={`Ví dụ: Quả táo đỏ, Xe đạp...`}
                  className="w-full rounded-xl border border-amber-200/90 bg-[#FFFDF8] px-2.5 py-1.5 font-black text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#FD7D2E] focus:ring-1 focus:ring-orange-200 transition shadow-2xs"
                />
              </div>
            </div>
          )
        })}

        {/* Card Thêm món đồ mới */}
        <button
          type="button"
          onClick={handleAddPart}
          className="border-2 border-dashed border-amber-300 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-amber-50/80 hover:border-[#FD7D2E] cursor-pointer text-xs font-black text-amber-800 transition min-h-[260px] group shadow-2xs"
        >
          <div className="size-10 rounded-full bg-amber-100 text-[#FD7D2E] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
            <Plus size={20} />
          </div>
          <span className="font-black text-amber-950">Thêm {meta.badge.toLowerCase()} mới</span>
          <span className="text-[11px] font-medium text-amber-700/80">Tối đa 12 {meta.badge.toLowerCase()}</span>
        </button>
      </div>
    </div>
  )
}
