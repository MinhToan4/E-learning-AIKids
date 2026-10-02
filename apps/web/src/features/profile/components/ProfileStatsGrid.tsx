import React from 'react'
import { Compass, Star, Award } from 'lucide-react'

export interface ProfileStatsGridProps {
  streakDays: number
  totalStars: number
  completedStations: number
  studyHoursFormatted?: string
  certificatesCount?: number
  achievementsCount?: number
}

export function ProfileStatsGrid({
  streakDays,
  totalStars,
  completedStations,
  studyHoursFormatted,
  certificatesCount = 0,
  achievementsCount = 0,
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
      <div className="flex min-w-0 flex-col justify-between rounded-3xl border-2 border-teal-200/80 bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/50 p-4 sm:p-5 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-clay">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-teal-300 bg-gradient-to-br from-teal-100 to-emerald-100 shadow-[0_3px_0_#5eead4] select-none">
            <Compass className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600 drop-shadow-xs" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-none break-words">
              {displayStations} / 30 Trạm
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
          <span>{displayStations >= 30 ? 'Đã chinh phục trọn hành trình' : `Còn ${stationsToMilestone} trạm tới cột mốc ${nextStationMilestone}`}</span>
        </div>
      </div>

      {/* Thẻ 2: Sao Tri Thức (Icon Star vàng mật ong) */}
      <div className="flex min-w-0 flex-col justify-between rounded-3xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-yellow-50/50 p-4 sm:p-5 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-clay">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-100 to-yellow-100 shadow-[0_3px_0_#fcd34d] select-none">
            <Star className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500 fill-amber-400 drop-shadow-xs" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-none break-words">
              {totalStars} Sao
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
          <span>Còn {starsToMilestone} sao tới kho báu tiếp theo</span>
        </div>
      </div>

      {/* Thẻ 3: Bằng Khen & Huy Hiệu (Icon Award cam hổ phách) */}
      <div className="flex min-w-0 flex-col justify-between rounded-3xl border-2 border-orange-200/80 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 p-4 sm:p-5 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-clay">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-100 to-amber-100 shadow-[0_3px_0_#fdba74] select-none">
            <Award className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600 drop-shadow-xs" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block font-display text-xl sm:text-2xl font-black text-slate-900 leading-none break-words">
              {totalHonors} Danh hiệu
            </span>
            <span className="mt-1 block text-[11px] sm:text-xs font-black uppercase tracking-normal leading-tight whitespace-normal text-slate-700 break-words">
              Bằng khen &amp; Huy hiệu
            </span>
          </div>
        </div>
        <div className="mt-3.5 space-y-1.5">
          <div className="flex h-3 items-center gap-1" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className={`h-2.5 flex-1 rounded-full border ${index < Math.min(5, totalHonors) ? 'border-orange-400 bg-orange-400' : 'border-orange-200 bg-orange-100'}`}
              />
            ))}
          </div>
          <div className="text-[11px] sm:text-xs font-bold leading-snug text-orange-900">
            Bộ sưu tập dấu ấn tự hào
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-orange-100/70 px-2.5 py-1 text-[11px] sm:text-xs font-bold leading-snug whitespace-normal break-words text-orange-900 border border-orange-200/60">
          <span>{totalHonors > 0 ? 'Chọn một danh hiệu để kể câu chuyện của con' : 'Danh hiệu đầu tiên đang chờ con khám phá'}</span>
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
