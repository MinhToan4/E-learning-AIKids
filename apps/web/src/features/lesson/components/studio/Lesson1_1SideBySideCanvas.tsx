import React from 'react'
import { Backpack } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../../lib/lesson-sound'

export interface Lesson1_1SideBySideCanvasProps {
  activeIdx: number
  isSubmitted?: boolean
  favoriteByPart: Record<number, 1 | 2>
  setFavoriteByPart: React.Dispatch<React.SetStateAction<Record<number, 1 | 2>>>
  isLesson1_1: boolean
  currentPartTitle: string
  currentItemType: string
  turn1Artworks: Record<number, { url: string; prompt: string }>
  turn2Artworks: Record<number, { url: string; prompt: string }>
  favoriteReasonByPart: Record<number, string>
  setFavoriteReasonByPart: React.Dispatch<React.SetStateAction<Record<number, string>>>
  onOpenSubmitModal: () => void
  getLesson1_1Artwork: (type: string, turn: number) => string
  reasons: string[]
}

export function Lesson1_1SideBySideCanvas({
  activeIdx,
  isSubmitted,
  favoriteByPart,
  setFavoriteByPart,
  isLesson1_1,
  currentPartTitle,
  currentItemType,
  turn1Artworks,
  turn2Artworks,
  favoriteReasonByPart,
  setFavoriteReasonByPart,
  onOpenSubmitModal,
  getLesson1_1Artwork,
  reasons,
}: Lesson1_1SideBySideCanvasProps) {
  return (
    <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-50/95 border-2 border-amber-300 shadow-clay flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-[13px] font-black uppercase text-amber-950 flex items-center gap-1.5">
          <span>⚖️</span>
          <span>So sánh 2 bức tranh của bé</span>
        </span>
        <div className="flex items-center gap-1.5">
          {isSubmitted && (
            <span className="text-[9px] sm:text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <Backpack className="w-3 h-3" />
              <span>✓ Đã lưu vào Balo</span>
            </span>
          )}
          <span className="text-[9px] sm:text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
            Chạm chọn bức thích hơn
          </span>
        </div>
      </div>

      {/* Side-by-side 2 bức tranh */}
      <div className="grid grid-cols-2 gap-2">
        {/* Bức 1: Chỉ 1 từ */}
        <button
          type="button"
          onClick={() => {
            playInstantSound('click')
            setFavoriteByPart((prev) => ({ ...prev, [activeIdx]: 1 }))
          }}
          className={cn(
            'p-2 rounded-xl border-2 flex flex-col gap-1.5 text-left transition-all cursor-pointer select-none shadow-2xs',
            (favoriteByPart[activeIdx] ?? 2) === 1
              ? 'border-purple-500 bg-purple-50/90 ring-3 ring-purple-300 scale-[1.01]'
              : 'border-slate-200 bg-white hover:border-slate-300',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-black text-purple-900 truncate">
              Bức 1: 1. Một từ ({currentPartTitle.toLowerCase()})
            </span>
            <span className="text-[8px] font-bold px-1 rounded bg-slate-100 text-slate-500 shrink-0">
              1 từ
            </span>
          </div>
          <div className="w-full aspect-16/10 rounded-lg overflow-hidden border border-slate-200 bg-[#FFFDF8] p-1 flex items-center justify-center">
            <img
              src={turn1Artworks[activeIdx]?.url || getLesson1_1Artwork(currentItemType, 1)}
              alt="Tranh 1 từ"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-slate-500 font-semibold truncate">AKI tự đoán bừa</span>
            {(favoriteByPart[activeIdx] ?? 2) === 1 && (
              <span className="text-purple-700 font-black flex items-center gap-0.5">
                Đã chọn
              </span>
            )}
          </div>
        </button>

        {/* Bức 2: Đủ 5 điều chi tiết */}
        <button
          type="button"
          onClick={() => {
            playInstantSound('click')
            setFavoriteByPart((prev) => ({ ...prev, [activeIdx]: 2 }))
          }}
          className={cn(
            'p-2 rounded-xl border-2 flex flex-col gap-1.5 text-left transition-all cursor-pointer select-none shadow-2xs',
            (favoriteByPart[activeIdx] ?? 2) === 2
              ? 'border-emerald-500 bg-emerald-50/90 ring-3 ring-emerald-300 scale-[1.01]'
              : 'border-slate-200 bg-white hover:border-slate-300',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-black text-emerald-900 truncate">
              Bức 2: 2. Năm điều
            </span>
            <span className="text-[8px] bg-emerald-200 text-emerald-950 px-1 rounded font-black shrink-0">
              Khuyên chọn
            </span>
          </div>
          <div className="w-full aspect-16/10 rounded-lg overflow-hidden border border-slate-200 bg-[#FFFDF8] p-1 flex items-center justify-center">
            <img
              src={turn2Artworks[activeIdx]?.url || getLesson1_1Artwork(currentItemType, 2)}
              alt="Tranh 5 điều"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-emerald-700 font-semibold truncate">Đủ 5 chi tiết</span>
            {(favoriteByPart[activeIdx] ?? 2) === 2 && (
              <span className="text-emerald-700 font-black flex items-center gap-0.5">
                Đã chọn
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Câu hỏi ngắn: Vì sao con thích bức này hơn? */}
      <div className="flex flex-col gap-1 pt-1.5 border-t border-amber-200">
        <span className="text-[10px] sm:text-[11px] font-black text-amber-950 flex items-center gap-1">
          <span>💭</span>
          <span>Vì sao con thích bức này hơn?</span>
        </span>
        <div className="grid grid-cols-2 gap-1">
          {reasons.map((reason) => {
            const isChosen = (favoriteReasonByPart[activeIdx] || reasons[0]) === reason
            return (
              <button
                key={reason}
                type="button"
                onClick={() => {
                  playInstantSound('click')
                  setFavoriteReasonByPart((prev) => ({ ...prev, [activeIdx]: reason }))
                }}
                className={cn(
                  'px-2 py-1 rounded-lg text-[9.5px] font-bold text-left transition-all cursor-pointer truncate',
                  isChosen
                    ? 'bg-amber-500 text-white font-black shadow-2xs'
                    : 'bg-white hover:bg-amber-100/60 text-slate-700 border border-amber-200/80',
                )}
              >
                {reason}
              </button>
            )
          })}
        </div>
      </div>

      {/* Nút Hoàn thành: Cất vào Ba Lô & Tiếp tục */}
      <button
        type="button"
        onClick={() => {
          playInstantSound('click')
          onOpenSubmitModal()
        }}
        className={cn(
          'w-full mt-1 min-h-[44px] px-4 py-2 rounded-xl text-white font-black text-xs sm:text-sm shadow-clay active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer',
          isSubmitted
            ? 'bg-emerald-600 hover:bg-emerald-700'
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
        )}
      >
        <Backpack className="w-4 h-4" />
        <span>{isSubmitted ? '✓ Đã cất vào Ba Lô' : 'Cất vào Ba Lô & Tiếp tục'}</span>
      </button>
    </div>
  )
}
