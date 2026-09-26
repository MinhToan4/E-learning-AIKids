import React from 'react'
import { designerAssets } from '@/shared/config/assets'

export interface HeroProgressCardProps {
  explorerLevel: number
  overallProgressPct: number
  xpToNextLevel: number
  mascotSrc?: string
  levelSubtitle?: string
  className?: string
}

export const HeroProgressCard: React.FC<HeroProgressCardProps> = ({
  explorerLevel,
  overallProgressPct,
  xpToNextLevel,
  mascotSrc,
  levelSubtitle,
  className = '',
}) => {
  const clampedProgress = Math.max(0, Math.min(100, overallProgressPct))
  const mascot = mascotSrc || designerAssets?.aiki?.mascotPose1 || '/assets/mee/aiki/AIKI pose 1.png'

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-r from-[#9F2642] via-[#C0392B] to-[#FD7D2E] rounded-[2rem] p-4 sm:p-6 shadow-clay border border-white/25 ${className}`}
      aria-label="Tiến trình học tập và cấp độ"
    >
      {/* Vệt sáng phản quang men gốm / Soft clay glow */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/4 -bottom-10 h-36 w-36 rounded-full bg-[#FD7D2E]/20 blur-xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-row items-center justify-between">
        {/* Cột trái */}
        <div className="flex-1 min-w-0 pr-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white backdrop-blur-xs mb-1">
            TIẾN TRÌNH HỌC TẬP
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-xs">
            Cấp {explorerLevel}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-white/95 mt-0.5">
            {levelSubtitle || 'Hành Trình Khám Phá AI'}
          </p>

          {/* Thanh tiến độ */}
          <div className="relative h-2.5 sm:h-3 bg-black/25 rounded-full flex items-center p-0.5 mt-3 sm:mt-4 max-w-sm shadow-inner">
            <div
              className="bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-100 rounded-full h-full relative transition-all duration-500 shadow-xs"
              style={{ width: `${clampedProgress}%` }}
            >
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-b from-amber-100 to-orange-400 shadow-sm border border-white"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Text tiến độ bên dưới */}
          <div className="text-[11px] sm:text-xs font-bold text-white/95 flex items-center justify-between mt-1.5 max-w-sm">
            <span>{overallProgressPct}% hoàn thành</span>
            <span>+{xpToNextLevel} XP lên cấp</span>
          </div>
        </div>

        {/* Cột phải: Mascot Mèo Aiki */}
        <div className="shrink-0 flex items-center justify-end">
          <img
            src={mascot}
            alt="Mèo Aiki"
            className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain select-none drop-shadow-md transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>
    </section>
  )
}

export default HeroProgressCard
