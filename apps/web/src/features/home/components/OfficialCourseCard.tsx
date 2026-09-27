import React, { useState } from 'react'
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
  overallProgressPct = 25,
  completedStationsCount = 3,
  totalStarsCount = 3,
  isMobileFrame = false,
  className,
  children,
}) => {
  const [isPlayingTrailer, setIsPlayingTrailer] = useState<boolean>(false)

  const handlePlayTrailer = () => {
    setIsPlayingTrailer(true)
    onOpenTrailer()
  }

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[2.25rem] border-2 border-orange-400 ring-4 ring-orange-200/60 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 p-4 sm:p-6 shadow-clay space-y-4 min-w-0 transition-all',
        className,
      )}
      aria-label="Khóa học chính 2026 Học Viện AIKid"
    >
      {/* ── TOP HEADER OF SHOWCASE ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-orange-100 pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-xs whitespace-nowrap">
              KHÓA HỌC CHÍNH 2026 · HỌC VIỆN SÁNG TẠO AIKID
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300">
              Đang Học
            </span>
          </div>
          <h3 className="text-base sm:text-2xl font-black text-slate-900 leading-tight">
            Hải Trình 5 Đảo: Từ Chìa Khóa Vàng Đến Đạo Diễn Hoạt Hình
          </h3>
          <p className="text-[11px] sm:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
            Chương trình AI chuẩn mực dành riêng cho trẻ em Việt Nam, giúp con kích hoạt tư duy đạo diễn, mỹ thuật kỹ thuật số và sáng tạo an toàn 100%.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="px-2.5 py-1 rounded-xl bg-orange-100 text-orange-900 font-extrabold text-[11px] sm:text-xs">
            8–11 tuổi
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 font-extrabold text-[11px] sm:text-xs">
            5 Đảo • 32 Trạm
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-black text-[11px] sm:text-xs">
            {totalStarsCount} Sao ({overallProgressPct}%)
          </div>
        </div>
      </div>

      {/* ── MAIN SHOWCASE BODY: 2 CỘT CÂN BẰNG HOÀN HẢO ── */}
      <div
        className={cn(
          'w-full grid gap-5 items-stretch min-w-0',
          isMobileFrame ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12',
        )}
      >
        {/* CỘT TRÁI (lg:col-span-7): Video Trailer 16:9 + Tiến Độ + Nút Hành Động Cho Con */}
        <div className={cn('flex flex-col justify-between gap-3 min-w-0', !isMobileFrame && 'lg:col-span-7')}>
          <div className="space-y-3">
            {/* Khung Trailer Video 16:9 */}
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-950 border-2 border-orange-300 shadow-inner group">
              <img
                src={designerAssets.worldScenes.aiValley}
                alt="Trailer 5 Đảo Sáng Tạo AIKid"
                className={cn(
                  'w-full h-full object-cover filter brightness-90 transition-transform duration-500',
                  isPlayingTrailer ? 'scale-105 opacity-30 blur-xs' : 'group-hover:scale-102',
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 pointer-events-none" />

              {!isPlayingTrailer ? (
                <>
                  {/* Nút Play Trailer tròn Soft Clay to ở giữa (Thuần text ▶, NO SVG) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handlePlayTrailer}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-orange-600 shadow-2xl flex items-center justify-center font-black text-2xl sm:text-3xl hover:scale-110 active:scale-95 transition-all border-4 border-amber-300 ring-8 ring-white/20 cursor-pointer"
                      title="Bấm để xem Trailer giới thiệu 5 Đảo"
                    >
                      ▶
                    </button>
                  </div>

                  {/* Badge góc trên */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-black">
                      🎬 TRAILER CHÍNH THỨC
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black">
                      01:45
                    </span>
                  </div>

                  {/* Dải thông tin dưới trailer */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white flex items-center justify-between text-[11px] font-bold">
                    <span className="truncate">Khám phá thế giới 5 Đảo cùng Mèo Mee</span>
                    <button
                      type="button"
                      onClick={handlePlayTrailer}
                      className="text-amber-300 hover:underline cursor-pointer bg-transparent border-0 p-0 text-[11px] font-bold"
                    >
                      Xem toàn màn hình ▶
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col justify-between p-3.5 z-20 text-white animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                      <span className="text-xs font-black truncate">
                        Đang phát: Khám phá 5 Đảo AIKid (01:45)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPlayingTrailer(false)}
                      className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all cursor-pointer shrink-0 font-black text-xs"
                      title="Đóng trailer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1 my-auto">
                    <div className="text-3xl">🎬</div>
                    <p className="text-xs font-black text-center text-amber-200">
                      Chuyến du hành 5 Đảo AIKid cùng Trợ lý Mèo Mee!
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full h-1.5 rounded-full bg-white/30 overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full w-2/5 animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-300">
                      <span>00:42</span>
                      <button
                        type="button"
                        onClick={() => setIsPlayingTrailer(false)}
                        className="underline hover:text-white cursor-pointer bg-transparent border-0 p-0"
                      >
                        Tạm dừng &amp; Đóng
                      </button>
                      <span>01:45</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Thước đo tiến độ hải trình */}
            <div className="p-3 rounded-2xl bg-white border border-orange-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  Hải trình hiện tại: <strong className="text-orange-600">Đảo 1 (Đảo Khám Phá)</strong>
                </span>
              </div>
              <span className="font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                {completedStationsCount} / 32 Trạm Hoàn Thành
              </span>
            </div>
          </div>

          {/* Cụm Nút Hành Động Cho Con (Nằm Gọn Ngay Dưới Video & Tiến Độ) */}
          <div className="grid gap-2 pt-0.5 grid-cols-1 sm:grid-cols-2">
            <button
              type="button"
              onClick={onExploreTrack}
              className="w-full py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-clay transition-all text-center flex items-center justify-center cursor-pointer"
            >
              Mở Bản Đồ Hải Trình 5 Đảo
            </button>

            <button
              type="button"
              onClick={onExploreTrack}
              className="w-full py-3 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs sm:text-sm shadow-clay transition-all text-center flex items-center justify-center cursor-pointer"
            >
              Học Tiếp Bài 1.2 Ngay
            </button>
          </div>
        </div>

        {/* CỘT PHẢI (lg:col-span-5): Lợi Ích Cốt Lõi, Hộp Gói Mua & Nút Phụ Huynh */}
        <div className={cn('flex flex-col justify-between gap-3 min-w-0', !isMobileFrame && 'lg:col-span-5')}>
          {/* 3 Lợi ích vàng của khóa */}
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div>
                <div className="font-extrabold text-xs text-slate-900">Lộ Trình 5 Đảo Trực Quan</div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight">
                  Từ câu lệnh chìa khóa, góc máy, cọ vẽ tới làm phim hoạt hình.
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div>
                <div className="font-extrabold text-xs text-slate-900">32 Trạm Học Montessori</div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight">
                  Vừa xem video, làm thử thách hiểu bài, vừa tạo tranh thật 100%.
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <div>
                <div className="font-extrabold text-xs text-slate-900">Không Gian An Toàn Cho Trẻ</div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight">
                  Phụ huynh kiểm soát tiến độ, không cần email riêng của con.
                </div>
              </div>
            </div>
          </div>

          {/* Hộp Gói Mua Bản Quyền Phụ Huynh */}
          {!isPurchased ? (
            <div className="rounded-2xl bg-gradient-to-r from-orange-100/90 to-amber-100/90 border border-orange-300 p-3.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-purple-950 uppercase tracking-wide">
                  GÓI THÁM HIỂM TOÀN DIỆN
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  Tiết kiệm 40%
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-orange-600">479.000đ</span>
                <span className="text-xs text-slate-400 line-through">799.000đ</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Sở hữu trọn đời
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-snug font-medium">
                Mở khóa toàn bộ 5 Đảo, 32 trạm thực hành và phân xưởng sáng tạo AI không giới hạn.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-3.5 border border-emerald-200 shadow-xs flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                  GÓI VIP 5 ĐẢO SÁNG TẠO
                </span>
                <p className="text-[11px] text-slate-600 font-medium">
                  Đã kích hoạt trọn đời 32 trạm học &amp; phân xưởng AI
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shadow-2xs shrink-0">
                ✓ Đã Mở Khóa
              </span>
            </div>
          )}

          {/* Cụm Nút Phụ Huynh Mở Khóa */}
          <div className="space-y-1.5 pt-0.5">
            {!isPurchased ? (
              <button
                type="button"
                onClick={onUnlockCourse}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-black text-xs sm:text-sm shadow-clay transition-all text-center flex items-center justify-center cursor-pointer"
              >
                Phụ Huynh Mở Khóa Trọn Gói (479.000đ)
              </button>
            ) : (
              <button
                type="button"
                onClick={onExploreTrack}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-clay transition-all text-center flex items-center justify-center cursor-pointer"
              >
                Vào Khám Phá Toàn Bộ 5 Đảo
              </button>
            )}
            <div className="text-center text-[10px] text-slate-400 font-medium">
              Cam kết an toàn 100% cho trẻ • Kích hoạt học ngay
            </div>
          </div>
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
