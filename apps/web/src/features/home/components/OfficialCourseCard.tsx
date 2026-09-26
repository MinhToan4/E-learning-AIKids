import React, { useState } from 'react'
import { Crown, Film, Play, X } from 'lucide-react'
import { designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'

export interface OfficialCourseCardProps {
  isPurchased: boolean
  onOpenTrailer: () => void
  onUnlockCourse: () => void
  onExploreTrack?: () => void
  overallProgressPct?: number
  completedStationsCount?: number
  totalStarsCount?: number
  isMobileFrame?: boolean
  className?: string
  children?: React.ReactNode
}

export const OfficialCourseCard: React.FC<OfficialCourseCardProps> = ({
  isPurchased,
  onOpenTrailer,
  onUnlockCourse,
  onExploreTrack,
  overallProgressPct = 0,
  completedStationsCount = 0,
  totalStarsCount = 0,
  isMobileFrame = false,
  className,
  children,
}) => {
  const [isPlayingTrailer, setIsPlayingTrailer] = useState<boolean>(false)

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#eff8ff] via-[#f7f5ff] to-[#fff6eb] p-4 sm:p-5 lg:p-6 shadow-sm border border-orange-100/80 min-w-0 transition-all',
        className,
      )}
      aria-label="Khóa học chính thức 6 đảo AIKid"
    >
      {/* Khung nền trang trí góc trên phải */}
      <div className="absolute top-0 right-0 w-2/3 h-56 sm:h-72 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#eff8ff] via-[#f2fdf5]/40 to-transparent z-10" />
        <img
          src={designerAssets.worldScenes.aiValley}
          alt="AI Valley Background"
          className="absolute inset-0 w-full h-full object-cover object-center [mask-image:linear-gradient(to_right,transparent,black_30%)]"
        />
      </div>

      {/* BỐ CỤC CHÍNH: 2 CỘT CÂN ĐỐI */}
      <div
        className={cn(
          'w-full grid gap-4 sm:gap-5 items-start min-w-0 relative z-10',
          isMobileFrame ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2',
        )}
      >
        {/* CỘT 1 (BÊN TRÁI): THÔNG TIN KHÓA HỌC & TIẾN ĐỘ */}
        <div className="flex flex-col gap-4 min-w-0">
          {/* Header thông tin khóa học */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 text-emerald-800 px-3 py-1 text-xs font-black uppercase shadow-2xs border border-emerald-200">
                CHƯƠNG TRÌNH CHÍNH THỨC • 6 ĐẢO
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug whitespace-normal break-normal">
                Khóa sáng tạo nội dung cùng AIKID
              </h2>
              <p className="text-xs sm:text-sm font-bold text-purple-700 mt-1">
                32 Trạm học thực tế • Rèn luyện tư duy AI cùng Mèo Mee
              </p>
            </div>
          </div>

          {/* Trạng thái phân quyền Đảo 1 & Đảo 2-6 ngắn gọn */}
          <div
            className={cn(
              'flex flex-col gap-2 text-xs',
              !isMobileFrame && 'sm:grid sm:grid-cols-2',
            )}
          >
            <div className="p-2.5 rounded-2xl bg-white/80 backdrop-blur-xs shadow-2xs flex items-center gap-2 border border-emerald-100/80 min-w-0">
              <div className="min-w-0">
                <p className="font-black text-emerald-800 text-[11px] whitespace-nowrap">
                  Đảo 1: Học Thử Free
                </p>
                <span className="text-[10px] text-zinc-500 font-medium block whitespace-nowrap">
                  10 quy tắc an toàn số
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/80 backdrop-blur-xs shadow-2xs flex items-center gap-2 border border-amber-100/80 min-w-0">
              <div className="min-w-0">
                <p
                  className={`font-black text-[11px] whitespace-nowrap ${
                    isPurchased ? 'text-purple-800' : 'text-amber-900'
                  }`}
                >
                  {isPurchased ? 'Đảo 2 - 6: Đã Mở Khóa VIP' : 'Đảo 2 - 6: Mở Khóa VIP'}
                </p>
                <span className="text-[10px] text-zinc-500 font-medium block whitespace-nowrap">
                  32 trạm &amp; xưởng AI
                </span>
              </div>
            </div>
          </div>

          {/* Tiến độ khóa học */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 whitespace-nowrap">
                  TIẾN ĐỘ
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-black border border-orange-200 shadow-2xs whitespace-nowrap">
                  {overallProgressPct}%
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs backdrop-blur-xs whitespace-nowrap shrink-0">
                <span className="border-r border-slate-200 pr-2 whitespace-nowrap">
                  {completedStationsCount}/32 trạm
                </span>
                <span className="text-amber-600 font-bold whitespace-nowrap">
                  {totalStarsCount} sao
                </span>
              </div>
            </div>

            {/* Progress bar pastel */}
            <div className="w-full h-2.5 rounded-full bg-purple-100/70 overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-[#FD7D2E] transition-all duration-500"
                style={{ width: `${Math.max(5, overallProgressPct)}%` }}
              />
            </div>
          </div>

          {/* Nút hành động chính */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={onExploreTrack}
              title="Khám phá lộ trình"
              className="w-full min-h-[48px] px-6 py-2.5 rounded-2xl bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-xs sm:text-sm font-black shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <span>Lên thuyền khám phá Đảo 1</span>
              <span className="sr-only">Khám phá lộ trình</span>
            </button>
          </div>
        </div>

        {/* CỘT 2 (BÊN PHẢI): VIDEO TRAILER 16:9 + GÓI PHỤ HUYNH */}
        <div className="flex flex-col gap-4 min-w-0">
          {/* 1. KHUNG VIDEO TRAILER 16:9 */}
          <div className="relative w-full aspect-16/9 rounded-2xl overflow-hidden bg-zinc-950 shadow-inner border border-orange-200/60 group">
            <img
              src="/assets/aikid-ui/mascot-original/course-wave.webp"
              alt="Trailer Hoạt Hình Mèo Mee"
              className={`w-full h-full object-cover object-top transition-all duration-500 ${
                isPlayingTrailer ? 'opacity-30 blur-xs scale-105' : 'opacity-90 group-hover:scale-105'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

            {!isPlayingTrailer ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsPlayingTrailer(true)}
                  aria-label="Xem Trailer Khóa Học"
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/95 hover:bg-white text-[#FD7D2E] shadow-2xl flex items-center justify-center transform group-hover:scale-110 active:scale-95 transition-all cursor-pointer z-20"
                >
                  <Play className="w-6 h-6 fill-current ml-0.5 text-[#FD7D2E]" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlayingTrailer(true)}
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[11px] font-black flex items-center gap-1.5 shadow-2xs z-20 hover:bg-black/80 transition-colors"
                >
                  <Film className="w-3.5 h-3.5 text-amber-300" />
                  <span>Trailer 01:45</span>
                </button>

                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#FD7D2E] text-white text-[10px] font-black shadow-xs z-20">
                  Khám phá AIKid
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold z-20">
                  <span className="truncate">Cùng Mèo Mee khám phá 6 đảo</span>
                  <span className="text-amber-300 text-[10px] shrink-0 ml-2">Bấm để xem ▶</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col justify-between p-3.5 z-20 text-white animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-black truncate">
                      Đang phát: Khám phá AIKid (01:45)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPlayingTrailer(false)}
                    aria-label="Đóng Trailer"
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center gap-1.5 my-auto">
                  <div className="w-10 h-10 rounded-full bg-[#FD7D2E]/80 flex items-center justify-center">
                    <Film className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-black text-center text-amber-200">
                    Chuyến du hành 6 Đảo AIKid cùng Trợ lý Mèo Mee!
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-white/30 overflow-hidden">
                    <div className="h-full bg-[#FD7D2E] rounded-full w-2/5 animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-300">
                    <span>00:42</span>
                    <button
                      type="button"
                      onClick={() => setIsPlayingTrailer(false)}
                      className="underline hover:text-white cursor-pointer"
                    >
                      Tạm dừng &amp; Đóng
                    </button>
                    <span>01:45</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. THÔNG TIN GÓI PHỤ HUYNH NGAY DƯỚI VIDEO */}
          {!isPurchased ? (
            <div className="rounded-2xl bg-white/85 p-3.5 sm:p-4 shadow-xs flex flex-col gap-2.5 border border-amber-200/70">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-400 to-[#FD7D2E] text-white flex items-center justify-center shrink-0">
                    <Crown className="w-3.5 h-3.5 fill-white" />
                  </div>
                  <span className="text-xs font-black text-amber-950 uppercase tracking-wider whitespace-nowrap">
                    DÀNH CHO PHỤ HUYNH
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-2xs shrink-0">
                  Tiết kiệm 40%
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg sm:text-xl font-black text-[#FD7D2E]">
                    479.000đ
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-400 line-through">
                    799.000đ
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                  Sở hữu trọn đời
                </span>
              </div>

              <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">
                Gói Thám Hiểm Toàn Diện 6 Đảo: Mở khóa trọn bộ Đảo 2 - 6, 32 trạm học &amp; xưởng vẽ AI trọn đời cho bé.
              </p>

              <div className="flex flex-col gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={onUnlockCourse}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <span>Phụ huynh mở khóa trọn bộ (479k)</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenTrailer}
                  className="w-full min-h-[40px] px-3.5 py-2 rounded-full bg-white hover:bg-amber-50 text-amber-900 text-xs font-black border border-amber-300 shadow-2xs active:scale-98 transition-all flex items-center justify-center gap-1 cursor-pointer text-center"
                >
                  <Film className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chi tiết &amp; Trailer</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-3.5 border border-emerald-200/80 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-950 uppercase tracking-wider whitespace-nowrap">
                      Gói VIP 6 Đảo
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black shrink-0">
                      VIP
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-zinc-600 leading-tight whitespace-nowrap">
                    Đã kích hoạt trọn bộ 32 trạm
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                Đã Mở Khóa
              </span>
            </div>
          )}
        </div>
      </div>

      {children && (
        <div className="w-full pt-4 border-t border-orange-200/50 relative z-10 mt-4">
          {children}
        </div>
      )}
    </section>
  )
}

export default OfficialCourseCard
