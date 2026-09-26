import React from 'react'
import {
  SoftClayFireIcon,
  SoftClayStarIcon,
  SoftClayFlagIcon,
} from '@/features/leaderboard/components/ProgressPassportIcons'

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
      <div className="flex min-w-0 items-center gap-3 sm:gap-4 rounded-2xl border-2 border-orange-200/80 bg-[#FFFCEB]/80 backdrop-blur-xs p-3.5 sm:p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-clay">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-orange-100/80 shadow-xs text-[#FD7D2E]">
          <SoftClayFireIcon size={28} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {streakDays} ngày
          </span>
          <span className="block text-xs sm:text-sm font-extrabold text-orange-950 uppercase tracking-normal">
            Chuỗi học tập
          </span>
          <p className="mt-0.5 text-[11px] sm:text-xs font-bold text-orange-800/80">
            Giữ chuỗi ngày học chăm chỉ
          </p>
        </div>
      </div>

      {/* Thẻ 2: Sao tích lũy (Stars) - Màu vàng mật ong với icon sao đất nặn */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4 rounded-2xl border-2 border-amber-200/80 bg-[#FFFCEB]/80 backdrop-blur-xs p-3.5 sm:p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-clay">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100/80 shadow-xs text-amber-600">
          <SoftClayStarIcon size={28} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {totalStars}
          </span>
          <span className="block text-xs sm:text-sm font-extrabold text-amber-950 uppercase tracking-normal">
            Sao tích lũy
          </span>
          <p className="mt-0.5 text-[11px] sm:text-xs font-bold text-amber-800/80">
            Ngôi sao tri thức từ bài học
          </p>
        </div>
      </div>

      {/* Thẻ 3: Trạm hoàn thành (Stations) - Màu xanh ngọc / đỏ rượu vang */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4 rounded-2xl border-2 border-teal-200/80 bg-[#FFFCEB]/80 backdrop-blur-xs p-3.5 sm:p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-clay">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-teal-200 bg-teal-100/80 shadow-xs text-teal-700">
          <SoftClayFlagIcon size={28} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {completedStations} / 32 Trạm
          </span>
          <span className="block text-xs sm:text-sm font-extrabold text-teal-950 uppercase tracking-normal">
            Trạm hoàn thành
          </span>
          <p className="mt-0.5 text-[11px] sm:text-xs font-bold text-teal-800/80">
            Hành trình 6 Đảo Khám Phá
          </p>
        </div>
      </div>
    </section>
  )
}
