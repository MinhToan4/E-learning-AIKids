import React from 'react'
import { Link } from 'react-router'
import { designerAssets } from '@/shared/config/assets'
import { ImportantCardMascot } from '@/shared/components/ui/ImportantCardMascot'
import {
  SoftClayStarIcon,
  SoftClayFlagIcon,
  SoftClayFireIcon,
  SoftClayTrophyIcon,
} from './ProgressPassportIcons'

export interface ProgressPassportHeroProps {
  studentName?: string | null
  totalStars: number
  completedQuests: number
  totalQuests?: number
  streakDays: number
  level: number
  xp: number
}

interface PassportStatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sublabel?: string
  tone: 'sun' | 'teal' | 'aiki' | 'brand'
}

function PassportStatCard({
  icon,
  label,
  value,
  sublabel,
  tone,
}: PassportStatCardProps) {
  const toneClasses = {
    sun: 'border-[#F1B120]/40 bg-linear-to-br from-[#FFFCEB] via-amber-50/80 to-[#F1B120]/15 text-amber-950',
    teal: 'border-[#16A5A9]/40 bg-linear-to-br from-[#f0fcfc] via-teal-50/80 to-[#16A5A9]/15 text-teal-950',
    aiki: 'border-[#FD7D2E]/40 bg-linear-to-br from-[#fff7f0] via-orange-50/80 to-[#FD7D2E]/15 text-orange-950',
    brand: 'border-[#0A6EDF]/40 bg-linear-to-br from-[#f0f7ff] via-sky-50/80 to-[#0A6EDF]/15 text-blue-950',
  }[tone]

  const iconBgClasses = {
    sun: 'bg-[#F1B120]/20 shadow-xs border border-[#F1B120]/50 text-[#F1B120]',
    teal: 'bg-[#16A5A9]/20 shadow-xs border border-[#16A5A9]/50 text-[#16A5A9]',
    aiki: 'bg-[#FD7D2E]/20 shadow-xs border border-[#FD7D2E]/50 text-[#FD7D2E]',
    brand: 'bg-[#0A6EDF]/20 shadow-xs border border-[#0A6EDF]/50 text-[#0A6EDF]',
  }[tone]

  return (
    <div
      className={`min-w-0 rounded-2xl sm:rounded-3xl border-2 p-3 sm:p-4 shadow-clay transition-transform hover:-translate-y-0.5 ${toneClasses}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl ${iconBgClasses}`}
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display truncate text-xl font-black leading-tight sm:text-2xl lg:text-3xl">
            {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
          </p>
          <p className="truncate text-xs sm:text-sm font-bold opacity-85">
            {label}
          </p>
        </div>
      </div>
      {sublabel && (
        <p className="mt-2 truncate text-xs font-semibold opacity-75">
          {sublabel}
        </p>
      )}
    </div>
  )
}

export function ProgressPassportHero({
  studentName,
  totalStars,
  completedQuests,
  totalQuests,
  streakDays,
  level,
  xp,
}: ProgressPassportHeroProps) {
  // Lời nhắn khích lệ ấm áp từ Mèo AIKI
  const aikiEncouragement = React.useMemo(() => {
    if (streakDays >= 7) {
      return `Mèo AIKI vô cùng khâm phục! Học sinh đã thắp sáng ngọn lửa học tập ${streakDays} ngày liên tiếp rồi đấy!`
    }
    if (streakDays >= 3) {
      return `Tuyệt vời lắm! Chuỗi ${streakDays} ngày học chăm chỉ đang giúp học sinh tiến bộ vượt bậc mỗi ngày!`
    }
    if (completedQuests > 0) {
      return `Mèo AIKI chào học sinh! Cùng tiếp tục mở thêm những trạm học kỳ thú hôm nay nhé!`
    }
    return `Chào mừng học sinh đến với Hộ Chiếu Học Tập! Cùng Mèo AIKI khám phá trạm học đầu tiên nào!`
  }, [streakDays, completedQuests])

  const stationsDisplay = totalQuests && totalQuests > 0
    ? `${completedQuests}/${totalQuests}`
    : completedQuests

  return (
    <section className="flex flex-col gap-4 w-full min-w-0">
      {/* Banner Hộ Chiếu Thám Hiểm */}
      <header className="relative overflow-hidden rounded-3xl border-3 border-[#16A5A9]/20 bg-[#FFFCEB] shadow-clay w-full min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 p-5 sm:p-7 md:items-center">
          <div className="progress-hero-copy z-2 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#16A5A9]/40 bg-white/90 px-3.5 py-1.5 text-xs sm:text-sm font-extrabold text-[#16A5A9] shadow-xs">
              <SoftClayStarIcon size={18} />
              <span>Hộ Chiếu Thám Hiểm Soft Clay</span>
            </div>

            <h1 className="font-display mt-3 text-2xl font-black text-[#072147] sm:text-3xl lg:text-4xl leading-tight">
              {studentName ? `Hành trình của ${studentName}` : 'Học sinh đang học đến đâu?'}
            </h1>

            <p className="mt-2.5 max-w-xl text-sm sm:text-base font-semibold text-slate-700 leading-relaxed">
              {aikiEncouragement}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm font-bold text-slate-600">
              <span className="rounded-xl border border-white/80 bg-white/70 px-3 py-1.5 shadow-2xs">
                Kho báu huy hiệu đã đạt?{' '}
                <Link
                  to="/achievements"
                  className="font-extrabold text-[#0A6EDF] underline underline-offset-2 hover:text-[#085bc0]"
                >
                  Mở Phòng Huy Hiệu
                </Link>
              </span>
            </div>
          </div>

          <div className="progress-hero-art relative hidden sm:flex items-center justify-center shrink-0 w-44 md:w-56" aria-hidden="true">
            <img
              src={designerAssets.achievementExperience.progressValley}
              alt=""
              width="240"
              height="240"
              className="h-auto w-full max-w-[200px] object-contain drop-shadow-md"
              fetchPriority="high"
            />
            <ImportantCardMascot pose="walking" className="absolute -bottom-2 right-1 w-20 h-20" />
          </div>
        </div>
      </header>

      {/* 4 Ô Chỉ Số Vàng Soft Clay - Brand Palette Canva */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5"
        aria-label="4 Chỉ số vàng Hộ chiếu tiến bộ"
      >
        {/* 1. ⭐ Tổng Sao Đạt Được (Vàng Bright Yellow #F1B120) */}
        <PassportStatCard
          icon={<SoftClayStarIcon size={28} />}
          value={totalStars}
          label="Ngôi Sao Vàng"
          sublabel="Gặt hái từ bài học"
          tone="sun"
        />

        {/* 2. 🚩 Trạm Đã Chinh Phục (Xanh lục Teal #16A5A9) */}
        <PassportStatCard
          icon={<SoftClayFlagIcon size={28} />}
          value={stationsDisplay}
          label="Trạm Chinh Phục"
          sublabel={totalQuests ? 'Mục tiêu hoàn thành khóa' : 'Nhiệm vụ xuất sắc'}
          tone="teal"
        />

        {/* 3. 🔥 Chuỗi Ngày Học Liên Tục (Cam Lông Mèo AIKI #FD7D2E) */}
        <PassportStatCard
          icon={<SoftClayFireIcon size={28} />}
          value={`${streakDays} Ngày`}
          label="Chuỗi Ngày Học"
          sublabel={streakDays > 0 ? 'Giữ vững ngọn lửa!' : 'Học bài hôm nay nhé'}
          tone="aiki"
        />

        {/* 4. 🏆 Cấp Độ Nhà Thám Hiểm (Xanh biển Primary Blue #0A6EDF) */}
        <PassportStatCard
          icon={<SoftClayTrophyIcon size={28} />}
          value={`Cấp ${level}`}
          label="Nhà Thám Hiểm"
          sublabel={`${xp.toLocaleString('vi-VN')} Năng lượng XP`}
          tone="brand"
        />
      </div>
    </section>
  )
}
