import { Backpack, Palette } from 'lucide-react'

export interface StudioCanvasViewProps {
  isGenerating: boolean
  isLesson1_1: boolean
  currentArtworkUrl: string
  currentPartTitle: string
  isSubmitted?: boolean
  isCommitted?: boolean
  isCompletedPart?: boolean
  currentPartTurn: 1 | 2
}

export function StudioCanvasView({
  isGenerating,
  isLesson1_1,
  currentArtworkUrl,
  currentPartTitle,
  isSubmitted,
  isCommitted,
  isCompletedPart,
  currentPartTurn,
}: StudioCanvasViewProps) {
  return (
    <>
      <div className="relative w-full aspect-4/3 sm:aspect-16/10 min-h-[200px] sm:min-h-[230px] rounded-2xl overflow-hidden bg-[#FFFDF8] border-2 border-amber-200/80 p-2 flex items-center justify-center group shadow-inner">
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-50/95 gap-2 z-20 backdrop-blur-xs p-4 text-center">
            <div className="relative size-12 flex items-center justify-center">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#FD7D2E] border-t-transparent" />
              <Palette className="size-5 text-[#FD7D2E] animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs sm:text-sm font-black text-[#FD7D2E] animate-pulse">
                {isLesson1_1 ? 'AIKI đang vẽ tranh...' : 'AIKI đang hóa phép vẽ tranh...'}
              </span>
            </div>
            {/* Thanh tiến độ loading */}
            <div className="w-48 max-w-[80%] h-2 bg-amber-200/70 rounded-full overflow-hidden border border-amber-300/80 shadow-2xs mt-1">
              <div
                className="h-full bg-gradient-to-r from-[#FD7D2E] via-amber-400 to-purple-600 rounded-full animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        ) : null}

        <img
          src={currentArtworkUrl}
          alt={currentPartTitle}
          className="w-full h-full object-contain transition-all duration-300 group-hover:scale-105"
        />

        {/* Badge Đã lưu vào Balo */}
        {(isSubmitted || isCommitted || (isLesson1_1 && isCompletedPart)) && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600/95 text-white text-[10px] font-black shadow-md flex items-center gap-1 backdrop-blur-xs">
            <Backpack className="w-3 h-3" />
            <span>{isSubmitted ? '✓ Đã lưu vào Balo' : 'Đã lưu vào Balo'}</span>
          </span>
        )}

        {/* Tag Phong cách */}
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[9px] font-bold backdrop-blur-xs">
          Phong cách: Hoạt hình 2D
        </span>
      </div>

      {/* Thông tin lượt vẽ */}
      <div className="p-1.5 sm:p-2 rounded-xl bg-purple-50/80 border border-purple-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-[#FD7D2E] shrink-0" />
          <span className="font-extrabold text-[11px] sm:text-xs text-purple-950">
            {isLesson1_1
              ? currentPartTurn === 1
                ? `LƯỢT 1: MỘT TỪ DUY NHẤT (${currentPartTitle.toUpperCase()})`
                : 'LƯỢT 2: NĂM ĐIỀU CHI TIẾT'
              : '1 LƯỢT DUY NHẤT'}
          </span>
        </div>
        <span className="text-[10px] font-black text-[#FD7D2E] bg-orange-100/80 border border-orange-200/80 px-2 py-0.5 rounded-lg">
          {isLesson1_1 ? (currentPartTurn === 1 ? '1 từ' : 'Đủ 5 điều') : 'Đủ 4 khóa'}
        </span>
      </div>
    </>
  )
}
