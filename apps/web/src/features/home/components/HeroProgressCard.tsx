import React from 'react'
import { cn } from '@/shared/lib/cn'

export interface HeroProgressCardProps {
  explorerLevel: number
  overallProgressPct: number
  xpToNextLevel: number
  mascotSrc?: string
  levelSubtitle?: string
  userName?: string
  activeIslandTitle?: string
  activeStationLabel?: string
  onStartLesson?: () => void
  onOpenMap?: () => void
  className?: string
}

export const HeroProgressCard: React.FC<HeroProgressCardProps> = ({
  explorerLevel,
  overallProgressPct,
  xpToNextLevel,
  mascotSrc,
  levelSubtitle: _levelSubtitle = 'Hành Trình Khám Phá AI',
  userName = 'Bo',
  activeIslandTitle = 'Đảo 1: Khám Phá',
  activeStationLabel = 'Bài 1.2',
  onStartLesson,
  onOpenMap,
  className = '',
}) => {
  const clampedProgress = Math.max(0, Math.min(100, overallProgressPct))
  // Chuẩn Mèo AIKI chính thức (Official Brand Mascot)
  const aikiMascot =
    mascotSrc || '/assets/aikid-ui/mascot-original/course-wave.webp'

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-white border-2 border-amber-200/90 p-2 sm:p-4 md:p-6 shadow-clay min-w-0 transition-all',
        className,
      )}
      aria-label="Tiến trình học tập và thế giới thám hiểm"
    >
      <div className="flex flex-col lg:flex-row items-center gap-5 sm:gap-6">
        {/* ── 1. ĐẢO THÁM HIỂM TO, RÕ RÀNG & MÈO AIKI CHÍNH THỨC ── */}
        <div className="w-full lg:w-[54%] shrink-0">
          <div className="relative w-full h-56 sm:h-64 md:h-72 rounded-2xl overflow-hidden border border-sky-100 shadow-sm bg-sky-50 group">
            {/* Ảnh đảo to, sắc nét, tươi sáng */}
            <img
              src="/assets/aikid-ui/showcase/island_hero_bright.jpg"
              alt={`${activeIslandTitle} - Hải trình AI`}
              className="w-full h-full object-cover object-center select-none group-hover:scale-102 transition-transform duration-500 ease-out"
            />

            {/* Tag tên đảo góc trên */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
              <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-amber-950 text-xs font-black shadow-xs border border-amber-200/80">
                {activeIslandTitle} · {activeStationLabel}
              </span>
            </div>

            {/* Mèo AIKI chính thức đứng trên đảo */}
            <div className="absolute -bottom-1 right-2 sm:right-6 flex flex-col items-center z-10 select-none">
              {/* Bóng thoại Mèo AIKI */}
              <div className="bg-white/95 text-slate-900 px-3 py-1.5 rounded-2xl rounded-br-xs text-[11px] sm:text-xs font-black shadow-md border-2 border-amber-300 max-w-[190px] sm:max-w-[210px] break-words text-center mb-1 animate-in fade-in zoom-in-95">
                “{userName} ơi! Chìa khóa vàng đã sẵn sàng rồi, vào săn cùng tớ nhé!”
              </div>

              {/* Mèo AIKI vẫy chào */}
              <img
                src={aikiMascot}
                alt="Mèo AIKI chào bé"
                className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* ── 2. NỘI DUNG TINH GỌN, ÍT TEXT, ÍT BOX, KHÔNG SVG ── */}
        <div className="w-full lg:w-[46%] flex flex-col justify-center space-y-3 min-w-0">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full inline-block mb-1 border border-orange-200">
              Học tiếp • Cấp {explorerLevel}
            </span>
            <h2 className="font-black text-slate-900 leading-tight text-xl sm:text-2xl md:text-3xl break-words">
              Săn Bốn Chiếc Chìa Khóa Vàng!
            </h2>
            <p className="font-semibold text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed break-words">
              Cùng Mèo Mee học cách dùng bốn chìa khóa để tạo bức tranh đúng ý.
            </p>
          </div>

          {/* Thanh tiến độ tinh gọn */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>{clampedProgress}% hoàn thành</span>
              <span className="text-orange-600">+{xpToNextLevel} XP lên cấp</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 p-0.5 overflow-hidden border border-slate-200/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500 shadow-xs"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 min-w-0">
            {onStartLesson && (
              <button
                type="button"
                onClick={onStartLesson}
                className="flex min-h-12 w-full min-w-0 items-center justify-center rounded-2xl border border-orange-400 bg-gradient-to-r from-orange-500 to-amber-500 px-4 text-sm font-black text-white shadow-[0_5px_0_#c2410c] transition-all hover:from-orange-600 hover:to-amber-600 active:translate-y-1 active:shadow-none sm:flex-1 sm:text-base"
              >
                Học tiếp {activeStationLabel}
              </button>
            )}

            {onOpenMap && (
              <button
                type="button"
                onClick={onOpenMap}
                className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 text-sm font-bold text-slate-800 shadow-[0_4px_0_#cbd5e1] transition-all hover:bg-slate-100 active:translate-y-0.5 active:shadow-none sm:w-auto"
              >
                Xem bản đồ
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroProgressCard
