import React, { useState } from 'react'
import { Sparkles, Palette, Plus, X } from 'lucide-react'
import type { SixStageStylePrismOption } from '../../../../shared/lib/api'
import {
  DEFAULT_STYLE_PRISM_OPTIONS,
  STYLE_PRISM_PRESETS,
  type StylePrismPreset,
} from './engine-editor-defaults'

interface StylePrismEditorProps {
  stylePrismOptions?: SixStageStylePrismOption[]
  onChange: (styles: SixStageStylePrismOption[]) => void
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void
}

export function StylePrismEditor({
  stylePrismOptions,
  onChange,
  showToast,
}: StylePrismEditorProps) {
  const currentStyles = (stylePrismOptions && stylePrismOptions.length > 0)
    ? stylePrismOptions
    : DEFAULT_STYLE_PRISM_OPTIONS

  const [inputNewName, setInputNewName] = useState('')

  const handleUpdateStyle = (index: number, patch: Partial<SixStageStylePrismOption>) => {
    const next = [...currentStyles]
    next[index] = { ...next[index], ...patch }
    onChange(next)
  }

  const handleAddPreset = (preset: StylePrismPreset) => {
    if (currentStyles.length >= 8) {
      showToast('Tối đa 8 phong cách mỹ thuật', 'info')
      return
    }
    const exists = currentStyles.some(
      (s) => s.name.toLowerCase() === preset.name.toLowerCase() || s.id === preset.id
    )
    if (exists) {
      showToast(`Phong cách "${preset.name}" đã có trong danh sách`, 'info')
      return
    }
    const newStyle: SixStageStylePrismOption = {
      id: preset.id,
      name: preset.name,
      icon: preset.icon,
      desc: preset.desc,
      promptStyle: preset.promptStyle,
    }
    onChange([...currentStyles, newStyle])
    showToast(`🪄 Đã thêm phong cách: ${preset.name}`, 'success')
  }

  const handleAddNewCustom = () => {
    const trimmed = inputNewName.trim()
    if (!trimmed) return
    if (currentStyles.length >= 8) {
      showToast('Tối đa 8 phong cách mỹ thuật', 'info')
      return
    }
    const exists = currentStyles.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())
    if (exists) {
      showToast(`Phong cách "${trimmed}" đã có trong danh sách`, 'info')
      return
    }
    const newStyle: SixStageStylePrismOption = {
      id: `style-${Date.now()}`,
      name: trimmed,
      icon: '🎨',
      desc: 'Mô tả ngắn phong cách mỹ thuật',
      promptStyle: `phong cách ${trimmed.toLowerCase()} nghệ thuật sắc nét`,
    }
    onChange([...currentStyles, newStyle])
    setInputNewName('')
    showToast(`Đã thêm phong cách: ${trimmed}`, 'success')
  }

  const handleRemoveStyle = (indexToRemove: number) => {
    if (currentStyles.length <= 1) {
      showToast('Phải có ít nhất 1 lăng kính phong cách', 'info')
      return
    }
    onChange(currentStyles.filter((_, idx) => idx !== indexToRemove))
  }

  const handleLoadDefaults = () => {
    onChange(DEFAULT_STYLE_PRISM_OPTIONS)
    showToast('🪄 Đã nạp bộ lăng kính mỹ thuật mẫu', 'success')
  }

  return (
    <div className="rounded-2xl border-2 border-purple-300 bg-white p-4 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-200/80 pb-2.5">
        <div>
          <h4 className="text-xs font-black uppercase text-purple-950 flex items-center gap-1.5">
            <span>🔮 Lăng Kính Phù Thủy (Style Prism Editor)</span>
            <span className="rounded-full bg-purple-100 text-purple-900 px-2 py-0.5 text-[10px] font-black">
              Biến Hóa Phong Cách
            </span>
          </h4>
          <p className="text-[11px] font-medium text-slate-600 mt-0.5">
            Quản lý các lăng kính phong cách mỹ thuật giúp học sinh biến hóa tranh vẽ tức thì qua cụm prompt có sẵn.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleLoadDefaults}
            className="rounded-xl border border-purple-300 bg-purple-50 px-2.5 py-1.5 text-xs font-black text-purple-800 shadow-2xs hover:bg-purple-100 transition cursor-pointer flex items-center gap-1"
          >
            <Sparkles size={13} className="text-purple-600" />
            <span>🪄 Nạp bộ lăng kính mỹ thuật mẫu</span>
          </button>
        </div>
      </div>

      {/* ── KHAY CỤM PROMPT CÓ SẴN (PRESET CHIPS BANK) ──────────────── */}
      <div className="rounded-2xl border-2 border-purple-200 bg-purple-50/70 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-purple-900 flex items-center gap-1">
            ✨ Ngân Hàng Phong Cách Mỹ Thuật Có Sẵn (1-Chạm Thêm Nhanh):
          </span>
          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
            {STYLE_PRISM_PRESETS.length} phong cách mẫu
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STYLE_PRISM_PRESETS.map((preset) => {
            const isAdded = currentStyles.some(
              (s) => s.name.toLowerCase() === preset.name.toLowerCase() || s.id === preset.id
            )
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleAddPreset(preset)}
                className={`rounded-full px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs ${
                  isAdded
                    ? 'bg-purple-200/80 text-purple-950 border border-purple-300 opacity-70 cursor-default'
                    : 'bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 active:scale-95'
                }`}
                title={preset.promptStyle}
              >
                <span>{preset.icon}</span>
                <span>{isAdded ? '✓ ' : '+ '}{preset.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── DANH SÁCH LĂNG KÍNH HIỆN TẠI (SOFT CLAY CARDS) ───────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-purple-900 uppercase">
            <Palette size={14} className="text-purple-700" />
            <span>🔮 Quản Lý {currentStyles.length}/8 Lăng Kính Đang Dùng</span>
          </div>
          <span className="text-[10px] font-medium text-slate-500 italic">
            Nhấp vào ô để tinh chỉnh tên hoặc cụm prompt
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentStyles.map((style, idx) => (
            <div
              key={style.id || idx}
              className="rounded-2xl border border-purple-200 bg-white p-3 space-y-2.5 shadow-2xs hover:border-purple-300 transition"
            >
              {/* Dòng 1: Icon/Badge + Ô sửa tên phong cách + Nút Xóa */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <input
                    type="text"
                    value={style.icon || '🎨'}
                    onChange={(e) => handleUpdateStyle(idx, { icon: e.target.value })}
                    title="Icon hoặc Emoji"
                    className="size-8 text-center rounded-lg border border-purple-200 bg-purple-50 text-base shrink-0 font-bold"
                  />
                  <input
                    type="text"
                    value={style.name}
                    onChange={(e) => handleUpdateStyle(idx, { name: e.target.value })}
                    placeholder="Tên phong cách..."
                    className="flex-1 min-w-0 rounded-lg border border-purple-200 bg-white px-2.5 py-1 text-xs font-black text-purple-950 focus:border-purple-400 focus:outline-hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveStyle(idx)}
                  className="size-7 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 grid place-items-center transition cursor-pointer shrink-0"
                  title="Xóa phong cách này"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Dòng 2: Cụm prompt đại diện dạng Pill Chip gọn gàng */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Cụm prompt áp dụng:</span>
                  <span className="text-[9px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded-md">
                    Prompt Style
                  </span>
                </div>
                <input
                  type="text"
                  value={style.promptStyle || ''}
                  onChange={(e) => handleUpdateStyle(idx, { promptStyle: e.target.value })}
                  placeholder="VD: phong cách đất nặn 3D Soft Clay bo tròn pastel..."
                  className="w-full rounded-xl border border-indigo-200 bg-indigo-50/50 px-2.5 py-1.5 text-xs font-medium text-indigo-950 placeholder:text-indigo-300 focus:bg-white focus:border-indigo-400 focus:outline-hidden"
                />
              </div>

              {/* Dòng 3: Mô tả ngắn gọn */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500">Mô tả ngắn gọn cho bé:</span>
                <input
                  type="text"
                  value={style.desc || ''}
                  onChange={(e) => handleUpdateStyle(idx, { desc: e.target.value })}
                  placeholder="VD: Bề mặt đất nặn mịn màng màu ấm áp..."
                  className="w-full rounded-lg border border-purple-100 bg-purple-50/30 px-2.5 py-1 text-[11px] text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-purple-300 focus:outline-hidden"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Chân trang: Thêm nhanh phong cách mới */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={inputNewName}
            onChange={(e) => setInputNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddNewCustom()
              }
            }}
            placeholder="Nhập tên phong cách mới (VD: Tranh khắc gỗ, Cyberpunk dễ thương)..."
            className="flex-1 min-w-0 rounded-xl border border-purple-300 bg-white px-3 py-1.5 text-xs font-semibold text-purple-950 placeholder:text-purple-300 focus:border-purple-500 focus:outline-hidden"
          />
          <button
            type="button"
            onClick={handleAddNewCustom}
            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-xs font-black shadow-2xs transition cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Plus size={13} />
            <span>+ Thêm phong cách</span>
          </button>
        </div>
      </div>
    </div>
  )
}
