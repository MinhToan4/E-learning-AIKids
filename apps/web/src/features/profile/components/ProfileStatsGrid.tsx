import React from 'react'
import { Flame, Star, Compass } from 'lucide-react'

export interface ProfileStatsGridProps {
  streakDays: number
  totalStars: number
  completedStations: number
}

export function ProfileStatsGrid({
  streakDays,
  totalStars,
  completedStations,
}: ProfileStatsGridProps) {
  return (
    <section
      aria-label="Thống kê nhanh hồ sơ"
      className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0"
    >
      {/* Thẻ 1: Chuỗi học tập (Streak) - Màu cam Aiki ấm áp */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4 rounded-2xl border-2 border-orange-200/80 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/40 backdrop-blur-xs p-3.5 sm:p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-clay">
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-100 to-amber-100 shadow-[0_3px_0_#fdba74] select-none">
          <Flame className="w-6 h-6 text-[#FD7D2E] fill-orange-400 drop-shadow-xs" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-tight break-words">
            {streakDays} ngày
          </span>
          <span className="block text-xs sm:text-sm font-extrabold text-orange-950 uppercase tracking-normal break-words">
            Chuỗi học tập
          </span>
          <p className="mt-0.5 text-[11px] sm:text-xs font-bold text-orange-800/80 break-words">
            Giữ chuỗi ngày học chăm chỉ
          </p>
        </div>
      </div>

      {/* Thẻ 2: Sao tích lũy (Stars) - Màu vàng mật ong Soft Clay */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4 rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-yellow-50/40 backdrop-blur-xs p-3.5 sm:p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-clay">
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-100 to-yellow-100 shadow-[0_3px_0_#fcd34d] select-none">
          <Star className="w-6 h-6 text-amber-500 fill-amber-400 drop-shadow-xs" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-tight break-words">
            {totalStars}
          </span>
          <span className="block text-xs sm:text-sm font-extrabold text-amber-950 uppercase tracking-normal break-words">
            Sao tích lũy
          </span>
          <p className="mt-0.5 text-[11px] sm:text-xs font-bold text-amber-800/80 break-words">
            Ngôi sao tri thức từ bài học
          </p>
        </div>
      </div>

      {/* Thẻ 3: Trạm hoàn thành (Stations) - Màu xanh ngọc Soft Clay */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4 rounded-2xl border-2 border-teal-200/80 bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/40 backdrop-blur-xs p-3.5 sm:p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-clay">
        <div className="flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl border-2 border-teal-300 bg-gradient-to-br from-teal-100 to-emerald-100 shadow-[0_3px_0_#5eead4] select-none">
          <Compass className="w-6 h-6 text-teal-600 drop-shadow-xs" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-tight break-words">
            {completedStations} / 32 Trạm
          </span>
          <span className="block text-xs sm:text-sm font-extrabold text-teal-950 uppercase tracking-normal break-words">
            Trạm hoàn thành
          </span>
          <p className="mt-0.5 text-[11px] sm:text-xs font-bold text-teal-800/80 break-words">
            Hành trình 6 Đảo Khám Phá
          </p>
        </div>
      </div>
    </section>
  )
}
