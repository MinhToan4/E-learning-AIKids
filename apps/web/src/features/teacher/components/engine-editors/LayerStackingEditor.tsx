import React, { useState } from 'react'
import { Sparkles, Layers, Plus, X } from 'lucide-react'
import type { SixStageLayerStackingOptions } from '../../../../shared/lib/api'
import {
  DEFAULT_LAYER_STACKING_OPTIONS,
  LAYER_STACKING_PRESETS,
} from './engine-editor-defaults'

interface LayerStackingEditorProps {
  layerStackingOptions?: SixStageLayerStackingOptions
  onChange: (layers: SixStageLayerStackingOptions) => void
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void
}

export function LayerStackingEditor({
  layerStackingOptions,
  onChange,
  showToast,
}: LayerStackingEditorProps) {
  const currentLayers = layerStackingOptions || DEFAULT_LAYER_STACKING_OPTIONS

  const [inputBg, setInputBg] = useState('')
  const [inputHero, setInputHero] = useState('')
  const [inputFg, setInputFg] = useState('')

  const handleAddLayerItem = (
    tier: keyof SixStageLayerStackingOptions,
    val: string,
    setVal?: (v: string) => void
  ) => {
    const trimmed = val.trim()
    if (!trimmed) return
    const currentList = currentLayers[tier] || []
    if (currentList.includes(trimmed)) {
      showToast(`Mục "${trimmed}" đã có trong tầng này`, 'info')
      if (setVal) setVal('')
      return
    }
    onChange({
      ...currentLayers,
      [tier]: [...currentList, trimmed],
    })
    if (setVal) setVal('')
    showToast(`Đã thêm vào tầng: ${trimmed}`, 'success')
  }

  const handleRemoveLayerItem = (
    tier: keyof SixStageLayerStackingOptions,
    idxToRemove: number
  ) => {
    const currentList = currentLayers[tier] || []
    if (currentList.length <= 1) {
      showToast('Cần ít nhất 1 mục cho tầng này', 'info')
      return
    }
    onChange({
      ...currentLayers,
      [tier]: currentList.filter((_, i) => i !== idxToRemove),
    })
  }

  const handleLoadDefaults = () => {
    onChange(DEFAULT_LAYER_STACKING_OPTIONS)
    showToast('🪄 Đã gợi ý 3 tầng bố cục sân khấu', 'success')
  }

  return (
    <div className="rounded-2xl border-2 border-emerald-300 bg-white p-4 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
        <div>
          <h4 className="text-xs font-black uppercase text-emerald-950 flex items-center gap-1.5">
            <span>🎭 3 Tầng Sân Khấu (Layer Stacking Editor)</span>
            <span className="rounded-full bg-emerald-100 text-emerald-900 px-2 py-0.5 text-[10px] font-black">
              Bố Cục 1/3
            </span>
          </h4>
          <p className="text-[11px] font-medium text-slate-600 mt-0.5">
            Thiết lập 3 lớp không gian (Hậu cảnh, Ngôi sao 1/3, Tiền cảnh) qua các cụm prompt có sẵn để tranh có chiều sâu.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLoadDefaults}
          className="rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-800 shadow-2xs hover:bg-emerald-100 transition cursor-pointer flex items-center gap-1"
        >
          <Sparkles size={12} className="text-emerald-600" />
          <span>🪄 Gợi ý 3 tầng bố cục sân khấu</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* ── Tầng 1: Hậu Cảnh (Background) ─────────────────────────── */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-950 uppercase flex items-center gap-1">
              🌄 Tầng 1: Hậu Cảnh (Background)
            </span>
            <span className="rounded-full bg-emerald-200 text-emerald-900 text-[9px] font-black px-2 py-0.5">
              {(currentLayers.background || []).length} lựa chọn
            </span>
          </div>

          {/* Preset Chips Bank */}
          <div className="rounded-xl border border-emerald-200 bg-white/80 p-2 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">
              + Gợi ý phông nền có sẵn (1-chạm thêm nhanh):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {LAYER_STACKING_PRESETS.background.map((bgItem, bIdx) => {
                const isSelected = (currentLayers.background || []).includes(bgItem)
                return (
                  <button
                    key={bIdx}
                    type="button"
                    onClick={() => handleAddLayerItem('background', bgItem)}
                    className={`rounded-full px-2.5 py-0.8 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-emerald-100 text-emerald-900/60 border border-emerald-200 opacity-60 cursor-default'
                        : 'bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 active:scale-95'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{bgItem}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Current Chips List */}
          <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-xl bg-white border border-emerald-200">
            {(currentLayers.background || []).map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full shadow-2xs"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLayerItem('background', idx)}
                  className="size-4 rounded-full bg-emerald-200 hover:bg-emerald-300 text-emerald-800 hover:text-emerald-950 grid place-items-center cursor-pointer ml-1 text-xs font-black transition"
                  title="Xóa lựa chọn này"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            {(currentLayers.background || []).length === 0 && (
              <span className="text-[11px] text-muted italic p-1">Chưa có bối cảnh hậu cảnh nào</span>
            )}
          </div>

          {/* Input Add */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={inputBg}
              onChange={(e) => setInputBg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddLayerItem('background', inputBg, setInputBg)
                }
              }}
              placeholder="Nhập hậu cảnh mới (VD: Bầu trời hoàng hôn cam rực rỡ, Rừng thông sương mù)..."
              className="flex-1 min-w-0 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-950 placeholder:text-emerald-300 focus:border-emerald-500 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => handleAddLayerItem('background', inputBg, setInputBg)}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-black shadow-2xs transition cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus size={13} />
              <span>+ Thêm</span>
            </button>
          </div>
        </div>

        {/* ── Tầng 2: Ngôi Sao 1/3 (Hero / Subject) ─────────────────── */}
        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-3.5 space-y-2.5 ring-1 ring-emerald-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-950 uppercase flex items-center gap-1">
              ⭐ Tầng 2: Ngôi Sao 1/3 (Hero / Subject)
            </span>
            <span className="rounded-full bg-emerald-300 text-emerald-950 text-[9px] font-black px-2 py-0.5">
              {(currentLayers.hero || []).length} lựa chọn
            </span>
          </div>

          {/* Preset Chips Bank */}
          <div className="rounded-xl border border-emerald-300 bg-white/80 p-2 space-y-1">
            <span className="text-[10px] font-bold text-emerald-900 uppercase block">
              + Gợi ý chủ thể ngôi sao 1/3 có sẵn:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {LAYER_STACKING_PRESETS.hero.map((heroItem, hIdx) => {
                const isSelected = (currentLayers.hero || []).includes(heroItem)
                return (
                  <button
                    key={hIdx}
                    type="button"
                    onClick={() => handleAddLayerItem('hero', heroItem)}
                    className={`rounded-full px-2.5 py-0.8 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-emerald-200 text-emerald-950/60 border border-emerald-300 opacity-60 cursor-default'
                        : 'bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-400 active:scale-95'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{heroItem}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Current Chips List */}
          <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-xl bg-white border border-emerald-300">
            {(currentLayers.hero || []).map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-200 text-emerald-950 border border-emerald-400 px-2.5 py-1 rounded-full shadow-2xs"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLayerItem('hero', idx)}
                  className="size-4 rounded-full bg-emerald-300 hover:bg-emerald-400 text-emerald-950 grid place-items-center cursor-pointer ml-1 text-xs font-black transition"
                  title="Xóa lựa chọn này"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            {(currentLayers.hero || []).length === 0 && (
              <span className="text-[11px] text-muted italic p-1">Chưa có chủ thể ngôi sao 1/3 nào</span>
            )}
          </div>

          {/* Input Add */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={inputHero}
              onChange={(e) => setInputHero(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddLayerItem('hero', inputHero, setInputHero)
                }
              }}
              placeholder="Nhập chủ thể 1/3 mới (VD: Chú Sóc Bông ở vị trí 1/3, Hiệp sĩ giương kiếm)..."
              className="flex-1 min-w-0 rounded-xl border border-emerald-400 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-950 placeholder:text-emerald-300 focus:border-emerald-600 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => handleAddLayerItem('hero', inputHero, setInputHero)}
              className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-black shadow-2xs transition cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus size={13} />
              <span>+ Thêm</span>
            </button>
          </div>
        </div>

        {/* ── Tầng 3: Tiền Cảnh (Foreground) ────────────────────────── */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-950 uppercase flex items-center gap-1">
              🌿 Tầng 3: Tiền Cảnh (Foreground)
            </span>
            <span className="rounded-full bg-emerald-200 text-emerald-900 text-[9px] font-black px-2 py-0.5">
              {(currentLayers.foreground || []).length} lựa chọn
            </span>
          </div>

          {/* Preset Chips Bank */}
          <div className="rounded-xl border border-emerald-200 bg-white/80 p-2 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">
              + Gợi ý tiền cảnh có sẵn:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {LAYER_STACKING_PRESETS.foreground.map((fgItem, fIdx) => {
                const isSelected = (currentLayers.foreground || []).includes(fgItem)
                return (
                  <button
                    key={fIdx}
                    type="button"
                    onClick={() => handleAddLayerItem('foreground', fgItem)}
                    className={`rounded-full px-2.5 py-0.8 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs ${
                      isSelected
                        ? 'bg-emerald-100 text-emerald-900/60 border border-emerald-200 opacity-60 cursor-default'
                        : 'bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 active:scale-95'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{fgItem}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Current Chips List */}
          <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-xl bg-white border border-emerald-200">
            {(currentLayers.foreground || []).map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full shadow-2xs"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLayerItem('foreground', idx)}
                  className="size-4 rounded-full bg-emerald-200 hover:bg-emerald-300 text-emerald-800 hover:text-emerald-950 grid place-items-center cursor-pointer ml-1 text-xs font-black transition"
                  title="Xóa lựa chọn này"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            {(currentLayers.foreground || []).length === 0 && (
              <span className="text-[11px] text-muted italic p-1">Chưa có chi tiết tiền cảnh nào</span>
            )}
          </div>

          {/* Input Add */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={inputFg}
              onChange={(e) => setInputFg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddLayerItem('foreground', inputFg, setInputFg)
                }
              }}
              placeholder="Nhập tiền cảnh mới (VD: Cành lá phong đỏ thắm bay, Bụi hoa đọng sương, Đom đóm)..."
              className="flex-1 min-w-0 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-950 placeholder:text-emerald-300 focus:border-emerald-500 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => handleAddLayerItem('foreground', inputFg, setInputFg)}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-black shadow-2xs transition cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus size={13} />
              <span>+ Thêm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
