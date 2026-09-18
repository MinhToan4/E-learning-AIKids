import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Layers, Sparkles } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../LessonInteractiveSidebar'
import type { EngineProps, CreativeBlock } from '../types'
import { LAYER_BLOCKS } from '../data/creative-blocks-dataset'

export const LayerStackingEngine: React.FC<EngineProps> = ({
  onPromptChange,
  practiceParts,
  activePartIndex,
  onPartChange,
}) => {
  // Trích xuất danh sách Ngôi Sao Chính (Chủ thể) từ practiceParts (DB) hoặc fallback
  const starOptions = useMemo<CreativeBlock[]>(() => {
    if (practiceParts && practiceParts.length > 0) {
      return practiceParts.map((p, idx) => {
        const cleanName = p.title.replace(/\s*\(.*?\)/, '').trim() || p.title
        return {
          id: p.id || `star-${p.partNumber || idx + 1}`,
          label: cleanName,
          text: cleanName,
          category: 'subject',
          icon: p.icon || p.emoji || '⭐',
          colorScheme: 'indigo',
        }
      })
    }
    return LAYER_BLOCKS.character
  }, [practiceParts])

  const [starBlock, setStarBlock] = useState<CreativeBlock | null>(
    starOptions[activePartIndex ?? 0] || starOptions[0]
  )
  const [bgBlock, setBgBlock] = useState<CreativeBlock | null>(LAYER_BLOCKS.background[0])
  const [fgBlock, setFgBlock] = useState<CreativeBlock | null>(LAYER_BLOCKS.foreground[0])

  // Mặc định mở Bước 1: Chọn Ngôi sao chính (Chủ thể)
  const [activeTab, setActiveTab] = useState<'star' | 'bg' | 'fg'>('star')

  // Đồng bộ khi activePartIndex thay đổi từ bên ngoài
  useEffect(() => {
    if (
      activePartIndex !== undefined &&
      activePartIndex >= 0 &&
      activePartIndex < starOptions.length
    ) {
      setStarBlock(starOptions[activePartIndex])
    }
  }, [activePartIndex, starOptions])

  // CÂU LỆNH: BẮT BUỘC đặt Thẻ Ngôi Sao (Chủ thể) đứng đầu trong activeBlocks
  const syncPrompt = useCallback(
    (star: CreativeBlock | null, bg: CreativeBlock | null, fg: CreativeBlock | null) => {
      const activeBlocks: CreativeBlock[] = []
      const parts: string[] = []

      // 1. Thẻ Ngôi sao (Chủ thể) đứng đầu
      if (star) {
        activeBlocks.push(star)
        parts.push(star.text)
      }
      // 2. Thẻ Hậu cảnh
      if (bg) {
        activeBlocks.push(bg)
        parts.push(bg.text)
      }
      // 3. Thẻ Tiền cảnh
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
    syncPrompt(starBlock, bgBlock, fgBlock)
  }, [starBlock, bgBlock, fgBlock, syncPrompt])

  const handleSelectBlock = (block: CreativeBlock, idx?: number) => {
    playInstantSound('click')
    if (activeTab === 'star') {
      setStarBlock(block)
      if (idx !== undefined) {
        onPartChange?.(idx)
      }
    } else if (activeTab === 'bg') {
      setBgBlock(block)
    } else if (activeTab === 'fg') {
      setFgBlock(block)
    }
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
            Bố Cục 1/3 ⭐
          </span>
        </div>
        <p className="text-[11px] font-bold text-slate-500">
          Xếp 3 lớp không gian: <strong>Bước 1: Chọn Ngôi Sao Chính (Chủ thể)</strong> → <strong>Bước 2: Hậu Cảnh (Xa)</strong> → <strong>Bước 3: Tiền Cảnh (Gần)</strong>.
        </p>
      </div>

      {/* ── BƯỚC 1 ĐẾN BƯỚC 3: 3 LỚP SÂN KHẤU THEO THỨ TỰ SƯ PHẠM CHUẨN ── */}
      <div className="flex flex-col gap-2">
        {/* BƯỚC 1: NGÔI SAO CHÍNH (ĐIỂM NHẤN 1/3 - CHỦ THỂ) ĐẶT LÊN ĐẦU TIÊN */}
        <div
          role="button"
          tabIndex={0}
          data-testid="layer-slot-star"
          onClick={() => {
            playInstantSound('click')
            setActiveTab('star')
          }}
          className={cn(
            'p-3 sm:p-3.5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between cursor-pointer select-none',
            activeTab === 'star'
              ? 'border-amber-400 bg-linear-to-r from-amber-50 via-yellow-50/70 to-orange-50/50 shadow-md ring-2 ring-amber-300 scale-[1.01]'
              : 'border-amber-200/80 bg-amber-50/30 hover:bg-amber-50/60'
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="min-w-[66px] h-8 px-2 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 text-amber-950 font-black text-xs flex items-center justify-center gap-1 shadow-xs border border-amber-500/40">
              <span>⭐</span>
              <span>Bước 1</span>
            </div>
            <div>
              <div className="text-amber-900 font-black text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                <span>🌟 NGÔI SAO CHÍNH (ĐIỂM NHẤN 1/3)</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-200/60 px-1.5 py-0.2 rounded">Chủ thể</span>
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-2 mt-0.5">
                <span className="text-lg">{starBlock?.icon || '🐿️'}</span>
                <span>{starBlock?.label || 'Chưa chọn ngôi sao'}</span>
                <span className="hidden sm:inline-flex text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 border border-amber-300">
                  🎯 Tâm điểm 1/3
                </span>
              </div>
            </div>
          </div>
          <span className="text-xs font-black text-amber-800">
            {activeTab === 'star' ? '● Đang chọn' : 'Chạm để đổi →'}
          </span>
        </div>

        {/* BƯỚC 2: HẬU CẢNH (LỚP 1 - XA NHẤT) */}
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
              ? 'border-indigo-500 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-300 scale-[1.01]'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="min-w-[66px] h-8 px-2 rounded-xl bg-purple-100 text-purple-800 border border-purple-200/80 font-black text-xs flex items-center justify-center">
              Bước 2
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase">
                HẬU CẢNH (XA NHẤT)
              </div>
              <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                <span>{bgBlock?.icon || '🌅'}</span>
                <span>{bgBlock?.label || 'Chưa chọn nền xa'}</span>
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600">
            {activeTab === 'bg' ? '● Đang chọn' : 'Chạm để đổi →'}
          </span>
        </div>

        {/* BƯỚC 3: TIỀN CẢNH (LỚP 3 - GẦN NHẤT) */}
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
              ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-300 scale-[1.01]'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="min-w-[66px] h-8 px-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-black text-xs flex items-center justify-center">
              Bước 3
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase">
                TIỀN CẢNH (GẦN NHẤT)
              </div>
              <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
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
            {activeTab === 'star' && '🌟 Bước 1: Chọn Ngôi Sao Bố Cục 1/3 (Chủ Thể Của Bức Tranh):'}
            {activeTab === 'bg' && '🌅 Bước 2: Chọn Hậu Cảnh (Phía Xa Nhất):'}
            {activeTab === 'fg' && '🌿 Bước 3: Chọn Tiền Cảnh (Sát Ống Kính):'}
          </span>
        </div>

        <div className={cn('grid gap-2', activeTab === 'star' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2')}>
          {(activeTab === 'star'
            ? starOptions
            : activeTab === 'bg'
            ? LAYER_BLOCKS.background
            : LAYER_BLOCKS.foreground
          ).map((item, idx) => {
            const currentSelectedId =
              activeTab === 'star'
                ? starBlock?.id
                : activeTab === 'bg'
                ? bgBlock?.id
                : fgBlock?.id

            const isSelected = currentSelectedId === item.id

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                data-testid={`layer-item-${item.id}`}
                onClick={() => handleSelectBlock(item, idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectBlock(item, idx)
                  }
                }}
                className={cn(
                  'relative p-2.5 rounded-xl border-2 transition-all duration-150 cursor-pointer flex items-center gap-2 select-none active:scale-95',
                  isSelected
                    ? activeTab === 'star'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-2xs'
                      : 'border-indigo-500 bg-indigo-50 text-indigo-950 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-800'
                )}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                <span className="text-xs font-black truncate pr-4">{item.label}</span>
                {activeTab === 'star' && (
                  <span className="absolute top-0 right-0 -mt-1.5 -mr-1.5 bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-md border border-amber-200 shadow-xs">
                    ⭐ 1/3
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
