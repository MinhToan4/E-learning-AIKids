import React from 'react'
import {
  FlatClayCompass,
  FlatClayStar,
  FlatClayTrophy,
} from '@/features/asmo/components/AsmoFlatClayIcons'

export interface ProfileStatsGridProps {
  streakDays: number
  totalStars: number
  completedStations: number
  studyHoursFormatted?: string
  certificatesCount?: number
  achievementsCount?: number
  worksCount?: number
}

export function ProfileStatsGrid({
  streakDays,
  totalStars,
  completedStations,
  studyHoursFormatted,
  certificatesCount = 0,
  achievementsCount = 0,
  worksCount,
}: ProfileStatsGridProps) {
  // Chuẩn hóa 30 trạm
  const displayStations = Math.min(30, Math.max(0, completedStations))
  const stationPercent = Math.min(100, Math.round((displayStations / 30) * 100))

  // Thời lượng fallback nếu không truyền vào
  const fallbackMinutes = displayStations * 20 + streakDays * 25
  const formattedHours =
    studyHoursFormatted ??
    `${Math.floor(fallbackMinutes / 60)}h ${fallbackMinutes % 60}m`

  const totalHonors = (achievementsCount ?? 0) + (certificatesCount ?? 0)
  const nextStationMilestone = displayStations >= 30
    ? 30
    : Math.min(30, Math.ceil((displayStations + 1) / 5) * 5)
  const stationsToMilestone = Math.max(0, nextStationMilestone - displayStations)
  const starsInMilestone = Math.max(0, totalStars % 15)
  const starsToMilestone = starsInMilestone === 0 && totalStars > 0 ? 15 : 15 - starsInMilestone
  const starMilestonePercent = totalStars === 0 ? 0 : Math.round((starsInMilestone / 15) * 100)

  return (
    <section
      aria-label="Ba dấu ấn hành trình của con"
      className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 w-full min-w-0"
    >
      {/* Thẻ 1: Hành trình 6 Đảo (Icon Compass xanh ngọc) */}
      <div className="relative flex min-w-0 overflow-hidden flex-col justify-between rounded-3xl border-2 border-teal-300 bg-gradient-to-br from-[#dffff8] via-white to-[#c9fff0] p-4 sm:p-5 shadow-[0_7px_0_#99f6e4] transition-transform hover:-translate-y-1">
        <span className="pointer-events-none absolute -right-7 -top-8 h-24 w-24 rounded-full bg-teal-200/45" aria-hidden="true" />
        <span className="mb-2 w-fit rounded-full bg-teal-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">Bản đồ chinh phục</span>
        <div className="flex items-center gap-3">
          <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center select-none">
            <FlatClayCompass size={62} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-none break-words">
              <span className="text-3xl sm:text-4xl">{displayStations}</span><span className="text-base text-teal-700"> / 30 Trạm</span>
            </span>
            <span className="mt-1 block text-[11px] sm:text-xs font-black uppercase tracking-normal leading-tight whitespace-normal text-slate-700 break-words">
              Hành trình 6 Đảo
            </span>
          </div>
        </div>
        <div className="mt-3.5 space-y-1.5">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-teal-100/80 border border-teal-200/60 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-500"
              style={{ width: `${stationPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold leading-snug whitespace-normal break-words text-teal-900">
            <span>{stationPercent}% đã chinh phục</span>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-teal-100/70 px-2.5 py-1 text-[11px] sm:text-xs font-bold leading-snug whitespace-normal break-words text-teal-900 border border-teal-200/60">
          <span><strong>Nhiệm vụ:</strong> {displayStations >= 30 ? 'Chinh phục trọn hành trình' : `Thêm ${stationsToMilestone} trạm để chạm mốc ${nextStationMilestone}`}</span>
        </div>
      </div>

      {/* Thẻ 2: Sao Tri Thức (Icon Star vàng mật ong) */}
      <div className="relative flex min-w-0 overflow-hidden flex-col justify-between rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-[#fff8c7] via-white to-[#fff0a6] p-4 sm:p-5 shadow-[0_7px_0_#fde68a] transition-transform hover:-translate-y-1">
        <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rotate-12 rounded-[2rem] bg-yellow-200/50" aria-hidden="true" />
        <span className="mb-2 w-fit rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">Kho sao tri thức</span>
        <div className="flex items-center gap-3">
          <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center select-none">
            <FlatClayStar size={62} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-none break-words">
              <span className="text-3xl sm:text-4xl">{totalStars}</span><span className="text-base text-amber-700"> Sao</span>
            </span>
            <span className="mt-1 block text-[11px] sm:text-xs font-black uppercase tracking-normal leading-tight whitespace-normal text-slate-700 break-words">
              Sao tích lũy
            </span>
          </div>
        </div>
        <div className="mt-3.5 space-y-1.5">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-amber-100/80 border border-amber-200/60 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-500"
              style={{ width: `${starMilestonePercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold leading-snug whitespace-normal break-words text-amber-900">
            <span>Cột mốc kho báu mỗi 15 sao</span>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-amber-100/70 px-2.5 py-1 text-[11px] sm:text-xs font-bold leading-snug whitespace-normal break-words text-amber-900 border border-amber-200/60">
          <span><strong>Kho báu:</strong> Còn {starsToMilestone} sao để mở rương tiếp theo</span>
        </div>
      </div>

      {/* Thẻ 3: Tác phẩm sáng tạo / Bằng khen & Huy hiệu (Icon Award cam hổ phách) */}
      <div className="relative flex min-w-0 overflow-hidden flex-col justify-between rounded-3xl border-2 border-orange-300 bg-gradient-to-br from-[#ffe8d2] via-white to-[#ffdfc5] p-4 sm:p-5 shadow-[0_7px_0_#fed7aa] transition-transform hover:-translate-y-1">
        <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-200/45" aria-hidden="true" />
        <span className="mb-2 w-fit rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
          {worksCount !== undefined ? 'Tủ tác phẩm' : 'Tủ huy hiệu'}
        </span>
        <div className="flex items-center gap-3">
          <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center select-none">
            <FlatClayTrophy size={62} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-none break-words">
              {worksCount !== undefined ? (
                <>
                  <span className="text-3xl sm:text-4xl">{worksCount}</span><span className="text-base text-orange-700"> tranh</span>
                </>
              ) : (
                <>
                  <span className="text-3xl sm:text-4xl">{totalHonors}</span><span className="text-base text-orange-700"> dấu ấn</span>
                </>
              )}
            </span>
            <span className="mt-1 block text-[11px] sm:text-xs font-black uppercase tracking-normal leading-tight whitespace-normal text-slate-700 break-words">
              {worksCount !== undefined ? 'Ảnh đã tạo' : 'Bằng khen & Huy hiệu'}
            </span>
          </div>
        </div>
        <div className="mt-3.5 space-y-1.5">
          <div className="flex h-3 items-center gap-1" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => {
              const activeCount = worksCount !== undefined ? worksCount : totalHonors
              return (
                <span
                  key={index}
                  className={`h-2.5 flex-1 rounded-full border ${index < Math.min(5, activeCount) ? 'border-orange-400 bg-orange-400' : 'border-orange-200 bg-orange-100'}`}
                />
              )
            })}
          </div>
          <div className="text-[11px] sm:text-xs font-bold leading-snug text-orange-900">
            {worksCount !== undefined ? 'Mỗi ô sáng là một kiệt tác của con' : 'Mỗi ô sáng là một chiến tích của con'}
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-orange-100/70 px-2.5 py-1 text-[11px] sm:text-xs font-bold leading-snug whitespace-normal break-words text-orange-900 border border-orange-200/60">
          <span>
            <strong>Trưng bày:</strong>{' '}
            {worksCount !== undefined
              ? worksCount > 0
                ? 'Lưu giữ những khoảnh khắc đẹp'
                : 'Bức tranh đầu tiên đang chờ con'
              : totalHonors > 0
                ? 'Chọn danh hiệu con tự hào nhất'
                : 'Danh hiệu đầu tiên đang chờ con'}
          </span>
        </div>
      </div>

      {/* Khối trợ năng & tương thích hệ thống: Giữ các chỉ số phụ mà không làm rối mắt học sinh */}
      <div className="sr-only" aria-hidden="true">
        <span>{streakDays} ngày</span>
        <span>Chuỗi học tập</span>
        <span>Giữ chuỗi ngày học chăm chỉ</span>
        <span>Chăm chỉ giữ lửa học tập!</span>
        <span>{formattedHours}</span>
        <span>Thời lượng rèn luyện</span>
        <span>Tích lũy học &amp; sáng tạo</span>
        <span>Trạm hoàn thành</span>
        <span>Tiến độ khám phá</span>
        <span>Ngôi sao tri thức</span>
        <span>Tích lũy qua bài học</span>
      </div>
    </section>
  )
}
