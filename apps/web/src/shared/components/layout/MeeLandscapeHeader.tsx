import React, { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { designerAssets } from '@/shared/config/assets'

export interface MeeLandscapeHeaderProps {
  islandNumber?: string
  islandTitle?: string
  islandDesc?: string
  islandScene?: string
  currentStationName?: string
  starsEarned?: number
  totalStars?: number
  xpEarned?: number
  onMeeWaveClick?: () => void
  className?: string
}

export const MeeLandscapeHeader: React.FC<MeeLandscapeHeaderProps> = ({
  islandNumber = 'ĐẢO 2',
  islandTitle = 'Đảo Khám Phá',
  islandDesc = '4 Chìa khóa lệnh',
  islandScene,
  currentStationName = 'Trạm 3: Phong Cách Nghệ Thuật',
  starsEarned = 6,
  totalStars = 12,
  xpEarned = 160,
  onMeeWaveClick,
  className = '',
}) => {
  const [isWaving, setIsWaving] = useState<boolean>(true)

  const handleMeeClick = () => {
    setIsWaving(!isWaving)
    onMeeWaveClick?.()
  }

  return (
    <section
      aria-label="Khung cảnh Xưởng sáng tạo Mèo Mee"
      className={`relative overflow-hidden rounded-[36px] bg-[#f0f9ff] min-h-[240px] sm:min-h-[260px] p-4 sm:p-5 shadow-xs border border-sky-100 flex flex-col justify-between select-none ${className}`}
    >
      {/* Background Soft Clay Elements: Sun, Clouds, Rolling Hills */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Sun & warm aura */}
        <div className="absolute top-3 right-10 w-12 h-12 rounded-full bg-amber-200/60 blur-xs" />
        <div className="absolute top-5 right-12 w-8 h-8 rounded-full bg-amber-300 shadow-sm" />

        {/* Soft floating clouds */}
        <div className="absolute top-4 left-6 w-16 h-5 bg-white/70 rounded-full blur-[0.5px]" />
        <div className="absolute top-3 left-10 w-10 h-7 bg-white/70 rounded-full" />
        <div className="absolute top-8 right-24 w-14 h-4 bg-white/60 rounded-full" />

        {/* Background rolling green clay hills */}
        <svg
          className="absolute bottom-0 left-0 w-full h-[120px]"
          preserveAspectRatio="none"
          viewBox="0 0 600 200"
          fill="none"
        >
          <path
            d="M0,130 C120,70 200,100 320,80 C440,60 520,110 600,90 L600,200 L0,200 Z"
            fill="#86efac"
            fillOpacity="0.55"
          />
          <path
            d="M0,150 C140,110 240,170 380,120 C480,80 540,140 600,110 L600,200 L0,200 Z"
            fill="#4ade80"
            fillOpacity="0.75"
          />
          <path
            d="M-20,180 Q150,140 320,170 Q480,195 620,160 L620,200 L-20,200 Z"
            fill="#22c55e"
            fillOpacity="0.35"
          />
        </svg>
      </div>

      {/* TOP: Floating Center Info Card (Zero-Overlap với nhà vòm & biển chỉ đường bên dưới) */}
      <div className="relative z-20 w-full flex justify-center pt-1">
        <div className="w-full max-w-sm rounded-2xl bg-white/90 backdrop-blur-md p-3 sm:p-3.5 shadow-sm border border-emerald-100/60 text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black">
            <Sparkles className="w-3 h-3 text-[#FD7D2E]" />
            <span>Xưởng Sáng Tạo Mèo Mee</span>
          </div>

          <h1 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight leading-snug">
            Bản Đồ Lộ Trình Khám Phá
          </h1>

          <p className="text-[11px] sm:text-xs font-semibold text-zinc-600 truncate line-clamp-1">
            {islandNumber}: {islandTitle} • {islandDesc}
          </p>

          {/* Clean status pill row inside center card */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate max-w-[140px]">{currentStationName}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
              <span>⭐ {starsEarned}/{totalStars}</span>
            </span>

            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FD7D2E] text-[10px] font-black">
              +{xpEarned} XP
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Cánh Trái (Nhà Vòm Anten) + Trung Tâm (Hòn Đảo Xóa Nền) + Cánh Phải (Biển Chỉ Đường & Mèo Mee Vẫy Tay) */}
      <div className="relative z-20 flex items-end justify-between gap-2 pt-3">
        {/* Cánh Trái: Ngôi nhà vòm anten Soft Clay màu be hồng phấn */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative flex flex-col items-center mb-[-4px]">
            <div className="w-2 h-2 rounded-full bg-[#FD7D2E] animate-ping" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#FD7D2E] -mt-1.5 z-10" />
            <div className="w-0.5 h-3 bg-zinc-600" />
            <div className="w-4 h-1.5 border-t-2 border-zinc-700 rounded-t-full -mt-0.5" />
          </div>

          <div className="relative w-16 h-12 sm:w-20 sm:h-14 rounded-t-[32px] rounded-b-xl bg-[#fed7aa] shadow-xs flex flex-col items-center justify-end p-1">
            <div className="absolute -top-1 w-10 h-2.5 rounded-full bg-rose-400/90" />
            <div className="w-4 h-4 rounded-full bg-amber-200 border border-amber-300 shadow-inner flex items-center justify-center mb-0.5">
              <div className="w-2 h-2 rounded-full bg-amber-400/80 animate-pulse" />
            </div>
            <div className="w-3.5 h-5 rounded-t-full bg-amber-800/80" />
          </div>
          <span className="text-[8px] sm:text-[9px] font-black text-emerald-950 bg-white/85 px-1.5 py-0.5 rounded-full mt-1 shadow-2xs">
            Nhà Vòm Anten
          </span>
        </div>

        {/* Trung Tâm: Cảnh quan Hòn Đảo nổi bật xóa nền */}
        {islandScene && (
          <div className="flex flex-col items-center shrink-0 w-24 h-16 sm:w-36 sm:h-22 mb-0.5">
            <img
              src={islandScene}
              alt={islandTitle}
              className="w-full h-full object-contain filter drop-shadow-md transition-transform hover:scale-105 duration-300"
            />
          </div>
        )}

        {/* Cánh Phải: Biển chỉ đường robot 3 hướng + Chú Mèo Mee vẫy tay chào */}
        <div className="flex items-end gap-2 shrink-0">
          {/* Biển chỉ đường Robot */}
          <div className="hidden sm:flex flex-col items-center">
            <div className="w-6 h-5 rounded-lg bg-purple-600 text-white shadow-xs flex flex-col items-center justify-center p-0.5 mb-0.5">
              <div className="flex items-center gap-0.5">
                <div className="w-1 h-1 rounded-full bg-emerald-300 animate-ping" />
                <div className="w-1 h-1 rounded-full bg-emerald-300" />
              </div>
            </div>
            <div className="flex flex-col gap-0.5 -mt-0.5 z-10">
              <div className="px-1.5 py-0.2 rounded-md bg-orange-400 text-white text-[7px] font-black shadow-2xs transform -rotate-3">
                Đảo 2 ➔
              </div>
              <div className="px-1.5 py-0.2 rounded-md bg-emerald-500 text-white text-[7px] font-black shadow-2xs transform rotate-2">
                ← Đảo 1
              </div>
            </div>
            <div className="w-1 h-5 bg-amber-800/70 rounded-full -mt-0.5" />
            <span className="text-[8px] font-black text-purple-950 bg-white/80 px-1 py-0.2 rounded-full mt-0.5 shadow-2xs">
              Biển Chỉ Đường Robot
            </span>
          </div>

          {/* Chú Mèo Mee vẫy tay chào với bong bóng thoại */}
          <div className="flex flex-col items-center">
            <div className="relative mb-0.5 px-2 py-0.5 rounded-full bg-white text-zinc-800 text-[10px] font-black shadow-xs flex items-center gap-1 animate-bounce-subtle">
              <span>Mee chào con!</span>
              <span className="text-xs">👋</span>
              <div className="absolute -bottom-1 right-4 w-1.5 h-1.5 bg-white transform rotate-45" />
            </div>

            <div
              onClick={handleMeeClick}
              className="w-16 h-16 sm:w-20 sm:h-20 cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
              title="Mèo Mee vẫy tay chào bé!"
            >
              <img
                src={designerAssets.catPoses.welcome}
                alt="Mèo Mee vẫy tay"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MeeLandscapeHeader
