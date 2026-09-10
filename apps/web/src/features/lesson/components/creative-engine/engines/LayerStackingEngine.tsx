import React, { useState, useEffect, useCallback } from 'react'
import { Layers, Sparkles, Check, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { EngineProps, CreativeBlock } from '../types'
import { LAYER_BLOCKS } from '../data/creative-blocks-dataset'

export const LayerStackingEngine: React.FC<EngineProps> = ({
  onPromptChange,
}) => {
  const [bgBlock, setBgBlock] = useState<CreativeBlock | null>(LAYER_BLOCKS.background[0])
  const [starBlock, setStarBlock] = useState<CreativeBlock | null>(LAYER_BLOCKS.character[0])
  const [fgBlock, setFgBlock] = useState<CreativeBlock | null>(LAYER_BLOCKS.foreground[0])

  const [activeTab, setActiveTab] = useState<'bg' | 'star' | 'fg'>('star')

  const syncPrompt = useCallback(
    (bg: CreativeBlock | null, star: CreativeBlock | null, fg: CreativeBlock | null) => {
      const activeBlocks: CreativeBlock[] = []
      const parts: string[] = []

      if (star) {
        activeBlocks.push(star)
        parts.push(star.text)
      }
      if (bg) {
        activeBlocks.push(bg)
        parts.push(bg.text)
      }
      if (fg) {
        activeBlocks.push(fg)
        parts.push(fg.text)
      }

      const assembled = parts.join(', ')
      onPromptChange(assembled, activeBlocks)
    },
    [onPromptChange]
  )

  useEffect(() => {
    syncPrompt(bgBlock, starBlock, fgBlock)
  }, [bgBlock, starBlock, fgBlock, syncPrompt])

  const handleSelectBlock = (block: CreativeBlock) => {
    playInstantSound('click')
    if (activeTab === 'bg') setBgBlock(block)
    if (activeTab === 'star') setStarBlock(block)
    if (activeTab === 'fg') setFgBlock(block)
  }

  return (
    <div data-testid="layer-stacking-engine" className="flex flex-col gap-3 text-left">
      {/* Header hướng dẫn */}
      <div className="bg-linear-to-r from-sky-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <div className="flex items-center gap-2">
            <Layers className="text-indigo-600" size={18} />
            <span className="font-black text-xs sm:text-sm text-indigo-950">
              Bố Cục 3 Tầng Sân Khấu: "Ai Là Ngôi Sao?"
            </span>
          </div>
          <span className="text-[11px] font-black text-indigo-800 bg-indigo-100/90 px-2 py-0.5 rounded-full">
            Bài 2.2 & 2.4 · Bố Cục 1/3
          </span>
        </div>
        <p className="text-[11px] font-bold text-slate-500">
          Xếp 3 lớp giấy thủ công tạo chiều sâu điện ảnh: Hậu cảnh (xa) → Ngôi sao 1/3 (giữa) → Tiền cảnh (gần).
        </p>
      </div>

      {/* 3 Lớp Sân Khấu Xếp Chồng */}
      <div className="flex flex-col gap-2">
        {/* Tầng 1: Hậu Cảnh (Xa nhất) */}
        <div
          role="button"
          tabIndex={0}
          data-testid="layer-slot-bg"
          onClick={() => {
            playInstantSound('click')
            setActiveTab('bg')
          }}
          className={cn(
            'p-3 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between cursor-pointer select-none',
            activeTab === 'bg'
              ? 'border-indigo-500 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-300'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center">
              Lớp 1
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase">
                Hậu Cảnh (Phía sau)
              </div>
              <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span>{bgBlock?.icon || '🌅'}</span>
                <span>{bgBlock?.label || 'Chưa chọn nền xa'}</span>
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600">
            {activeTab === 'bg' ? '● Đang chọn' : 'Chạm để đổi →'}
          </span>
        </div>

        {/* Tầng 2: Ngôi Sao 1/3 (Ở giữa - Quan trọng nhất) */}
        <div
          role="button"
          tabIndex={0}
          data-testid="layer-slot-star"
          onClick={() => {
            playInstantSound('click')
            setActiveTab('star')
          }}
          className={cn(
            'p-3 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between cursor-pointer select-none',
            activeTab === 'star'
              ? 'border-amber-500 bg-amber-50/80 shadow-xs ring-2 ring-amber-300'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
              ⭐ 1/3
            </div>
            <div>
              <div className="text-[10px] font-black text-amber-700 uppercase">
                Ngôi Sao Chính (Trung tâm 1/3)
              </div>
              <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span>{starBlock?.icon || '🐿️'}</span>
                <span>{starBlock?.label || 'Chưa chọn ngôi sao'}</span>
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-700">
            {activeTab === 'star' ? '● Đang chọn' : 'Chạm để đổi →'}
          </span>
        </div>

        {/* Tầng 3: Tiền Cảnh (Sát camera) */}
        <div
          role="button"
          tabIndex={0}
          data-testid="layer-slot-fg"
          onClick={() => {
            playInstantSound('click')
            setActiveTab('fg')
          }}
          className={cn(
            'p-3 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between cursor-pointer select-none',
            activeTab === 'fg'
              ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-300'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">
              Lớp 3
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase">
                Tiền Cảnh (Sát ống kính)
              </div>
              <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span>{fgBlock?.icon || '🌿'}</span>
                <span>{fgBlock?.label || 'Chưa chọn tiền cảnh'}</span>
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600">
            {activeTab === 'fg' ? '● Đang chọn' : 'Chạm để đổi →'}
          </span>
        </div>
      </div>

      {/* Khay Thẻ để đổi cho tầng đang chọn */}
      <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-3.5 shadow-2xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-black text-xs text-slate-800">
            {activeTab === 'bg' && 'Chọn Hậu Cảnh (Phía xa):'}
            {activeTab === 'star' && 'Chọn Ngôi Sao 1/3 (Nhân vật chính):'}
            {activeTab === 'fg' && 'Chọn Tiền Cảnh (Sát ống kính):'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(activeTab === 'bg'
            ? LAYER_BLOCKS.background
            : activeTab === 'star'
            ? LAYER_BLOCKS.character
            : LAYER_BLOCKS.foreground
          ).map((item) => {
            const currentSelectedId =
              activeTab === 'bg'
                ? bgBlock?.id
                : activeTab === 'star'
                ? starBlock?.id
                : fgBlock?.id

            const isSelected = currentSelectedId === item.id

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                data-testid={`layer-item-${item.id}`}
                onClick={() => handleSelectBlock(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectBlock(item)
                  }
                }}
                className={cn(
                  'p-2.5 rounded-xl border-2 transition-all duration-150 cursor-pointer flex items-center gap-2 select-none active:scale-95',
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-950 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-800'
                )}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                <span className="text-xs font-black truncate">{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
