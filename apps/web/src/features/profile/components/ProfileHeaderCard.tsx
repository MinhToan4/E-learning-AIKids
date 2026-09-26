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

function SoftClayBrushIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M18.8 3.2a2.8 2.8 0 0 0-3.9 0l-8.2 8.2c-.4.4-.7 1-.8 1.6l-.9 4.3a1 1 0 0 0 1.2 1.2l4.3-.9c.6-.1 1.2-.4 1.6-.8l8.2-8.2a2.8 2.8 0 0 0 0-3.9l-1.5-1.5z"
        fill="#FD7D2E"
      />
      <path
        d="M14.9 7.1l2 2"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="5" cy="19" r="2" fill="#C0392B" />
    </svg>
  )
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
      className="bg-gradient-to-r from-[#9F2642] via-[#C0392B] to-[#FD7D2E] rounded-[2rem] p-4 sm:p-6 shadow-clay border border-white/25 text-white relative overflow-hidden"
    >
      {/* Soft Clay Glaze decorative background highlights */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-xl" />
      <div className="pointer-events-none absolute left-1/3 -bottom-10 h-32 w-32 rounded-full bg-amber-400/15 blur-lg" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full min-w-0">
        {/* Avatar to rõ với vòng bo tròn viền gốm trắng và nút bấm đổi avatar */}
        <div className="relative shrink-0">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-white/90 shadow-clay overflow-hidden bg-white/20 backdrop-blur-xs flex items-center justify-center">
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
            className="absolute -bottom-1 -right-1 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white text-[#C0392B] shadow-clay hover:scale-105 active:scale-95 transition-transform border-2 border-white/90 cursor-pointer"
          >
            <SoftClayBrushIcon size={18} />
          </button>
        </div>

        {/* Thông tin học sinh: Tên, Cấp độ, Thanh tiến độ XP */}
        <div className="flex-1 min-w-0 w-full flex flex-col gap-2 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white/80">
                Hồ sơ của con
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
                {displayName}
              </h1>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-end flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/20 backdrop-blur-xs text-xs sm:text-sm font-black border border-white/20 text-white w-fit shrink-0">
                Cấp {explorerLevel} • Nhà Thám Hiểm Nhí
              </div>
              {profileSlug && (
                <Link
                  to={`/u/${profileSlug}`}
                  className="inline-flex min-h-8 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-xs px-3 py-1 text-xs font-black text-white shadow-soft hover:bg-white/30 transition-all cursor-pointer shrink-0"
                >
                  Xem bản chia sẻ
                </Link>
              )}
            </div>
          </div>

          {/* Thanh tiến độ XP: Nền đen mờ, thanh vạch vàng hổ phách, chữ {xpIntoLevel}/{xpToNextLevel} XP */}
          <div className="mt-1 w-full flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black text-white/90">
              <span>Tiến độ kinh nghiệm</span>
              <span className="tabular-nums tracking-wide">
                {xpIntoLevel}/{xpToNextLevel} XP
              </span>
            </div>
            <div className="h-3 sm:h-3.5 w-full overflow-hidden rounded-full bg-black/35 backdrop-blur-xs p-0.5 border border-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 shadow-[0_0_10px_rgba(251,191,36,0.6)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
