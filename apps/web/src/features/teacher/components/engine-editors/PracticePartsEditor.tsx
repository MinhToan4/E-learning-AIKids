import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
        icon: '🎨',
        emoji: '🎨',
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
    showToast(`✅ Đã nạp danh sách ${meta.badge} mặc định`, 'success')
  }

  return (
    <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/50 p-4 space-y-3 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-200/70 pb-2.5">
        <div>
          <h4 className="text-xs font-black uppercase text-brand-950 flex items-center gap-1.5">
            <span>{meta.title}</span>
            <span className="rounded-full bg-brand-200 text-brand-900 px-2 py-0.5 text-[10px] font-black">
              {currentParts.length} {meta.badge}
            </span>
          </h4>
          <p className="text-[11px] font-medium text-brand-800 mt-0.5">
            {meta.desc}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleLoadDefaultParts}
            className="rounded-xl border border-brand-300 bg-white px-2.5 py-1 text-xs font-black text-brand-700 shadow-2xs hover:bg-brand-50 transition cursor-pointer"
          >
            🔄 Nạp mặc định
          </button>
          <button
            type="button"
            onClick={handleAddPart}
            className="rounded-xl border border-brand-400 bg-brand-600 px-2.5 py-1 text-xs font-black text-white shadow-2xs hover:bg-brand-700 transition cursor-pointer flex items-center gap-1"
          >
            <Plus size={13} />
            <span>Thêm {meta.badge.toLowerCase()}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {currentParts.map((part, pIdx) => (
          <div
            key={part.partNumber || pIdx}
            className="rounded-xl border border-border bg-white p-2.5 flex items-center gap-2 shadow-2xs hover:border-brand-300 transition"
          >
            <span className="size-6 rounded-lg bg-brand-100 text-brand-900 font-black text-[10px] grid place-items-center shrink-0">
              #{part.partNumber || pIdx + 1}
            </span>
            <input
              type="text"
              value={part.emoji || part.icon || '🎨'}
              onChange={(e) => handleUpdatePart(pIdx, { emoji: e.target.value, icon: e.target.value })}
              title="Icon hoặc Emoji"
              className="w-10 text-center rounded-lg border border-border bg-slate-50 px-1.5 py-1 text-sm shrink-0"
            />
            <input
              type="text"
              value={part.title}
              onChange={(e) => handleUpdatePart(pIdx, { title: e.target.value })}
              placeholder={`Tên món đồ ${pIdx + 1}...`}
              className="flex-1 min-w-0 rounded-lg border border-border bg-page px-2 py-1 text-xs font-bold text-slate-800"
            />
            <button
              type="button"
              onClick={() => handleRemovePart(pIdx)}
              title="Xóa món đồ này"
              className="size-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 grid place-items-center transition shrink-0 cursor-pointer"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
