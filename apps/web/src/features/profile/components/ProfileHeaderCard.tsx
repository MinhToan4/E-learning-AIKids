import React from 'react'
import { Link } from 'react-router'
import type { User } from '@/shared/lib/api'
import { avatarEmoji, avatarImage } from '@/shared/config/avatars'

export interface ProfileHeaderCardProps {
  user: User | null
  explorerLevel: number
  explorerXp: number
  xpIntoLevel: number
  xpToNextLevel: number
  onOpenAvatarPicker: () => void
  profileSlug?: string | null
}

export function ProfileHeaderCard({
  user,
  explorerLevel,
  explorerXp: _explorerXp,
  xpIntoLevel,
  xpToNextLevel,
  onOpenAvatarPicker,
  profileSlug,
}: ProfileHeaderCardProps) {
  const displayName = user?.nickname || user?.name || 'Nhà Thám Hiểm'
  const avatarUrl = avatarImage(user?.avatarId)

  // Progress percentage calculation
  const progressPercent =
    xpToNextLevel > 0
      ? Math.min(100, Math.max(0, Math.round((xpIntoLevel / xpToNextLevel) * 100)))
      : 0

  return (
    <section
      aria-label="Thẻ hồ sơ thám hiểm"
      className="relative overflow-hidden rounded-[2.2rem] bg-white/95 border-2 border-amber-200/90 p-4 sm:p-6 shadow-clay min-w-0"
    >
      {/* Soft Clay Glaze decorative background highlights */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-100/60 blur-xl" />
      <div className="pointer-events-none absolute left-1/3 -bottom-10 h-32 w-32 rounded-full bg-orange-100/50 blur-lg" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full min-w-0">
        {/* Avatar squircle bo góc tròn 3D với nút bấm đổi avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-4 border-white shadow-clay overflow-hidden bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl sm:text-5xl select-none" aria-hidden="true">
                {avatarEmoji(user?.avatarId)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenAvatarPicker}
            aria-label="Đổi hình đại diện"
            title="Đổi hình đại diện"
            className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-white text-orange-600 font-black px-3 py-1 shadow-[0_3px_0_#cbd5e1] border border-orange-200 hover:scale-105 active:translate-y-0.5 active:shadow-none text-xs transition-transform cursor-pointer"
          >
            Đổi ảnh
          </button>
        </div>

        {/* Thông tin học sinh: Tiêu đề, Tên, Cấp độ, Chip Online, Thanh tiến độ XP */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-2.5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-orange-600">
                  HỒ SƠ THÁM HIỂM
                </p>
                <span className="sr-only">Hồ sơ của con</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight break-words">
                {displayName}
              </h1>
            </div>

            <div className="flex items-center gap-2 justify-center sm:justify-end flex-wrap">
              {/* Huy hiệu cấp độ Soft Clay */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs sm:text-sm font-black border border-amber-300 shadow-2xs shrink-0">
                Cấp {explorerLevel} • Nhà Thám Hiểm Nhí
              </div>

              {/* Chip Online màu ngọc lục bảo */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300 shadow-2xs shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online</span>
              </div>

              {profileSlug && (
                <Link
                  to={`/u/${profileSlug}`}
                  className="inline-flex min-h-8 items-center justify-center rounded-full border border-orange-200 bg-orange-50 hover:bg-orange-100 px-3 py-1 text-xs font-black text-orange-700 shadow-soft transition-all cursor-pointer shrink-0"
                >
                  Xem bản chia sẻ
                </Link>
              )}
            </div>
          </div>

          {/* Thanh tiến độ XP Soft Clay bo tròn vàng hổ phách */}
          <div className="mt-1 w-full flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black text-slate-700">
              <span>Tiến độ kinh nghiệm</span>
              <span className="tabular-nums tracking-wide text-orange-600 font-black">
                {xpIntoLevel}/{xpToNextLevel} XP
              </span>
            </div>
            <div className="h-3 sm:h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/80 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Mascot Mèo Aiki đồng hành vẫy chào ở góc thẻ hồ sơ */}
        <div className="hidden sm:flex shrink-0 items-center justify-center self-center pl-1 select-none pointer-events-none">
          <img
            src="/assets/aikid-ui/mascot-original/course-wave.webp"
            alt="Mèo Aiki đồng hành"
            className="w-20 h-20 md:w-24 md:h-24 lg:w-26 lg:h-26 object-contain drop-shadow-md hover:scale-105 transition-transform"
            loading="eager"
          />
        </div>
      </div>
    </section>
  )
}
