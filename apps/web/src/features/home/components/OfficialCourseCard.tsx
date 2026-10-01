import React from 'react'
import { Check, Image, Play, ShieldCheck, TrendingUp } from 'lucide-react'
import { designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'

export interface OfficialCourseCardProps {
  isPurchased: boolean
  onOpenTrailer: () => void
  onUnlockCourse: () => void
  onExploreTrack?: () => void
  actionLabel?: string
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
  actionLabel,
  overallProgressPct = 0,
  completedStationsCount = 0,
  totalStarsCount = 0,
  className,
  children,
}) => {
  const primaryAction = isPurchased ? onExploreTrack : onUnlockCourse

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl sm:rounded-[2rem] border-2 border-orange-300 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-3 shadow-sm sm:p-6',
        className,
      )}
      aria-label="Khóa học chính thức AIKid"
    >
      <div className="flex flex-col gap-3 border-b border-orange-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-orange-800">
              Chương trình chính thức AIKid
            </span>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
              isPurchased ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isPurchased ? 'Đã mở khóa' : 'Chưa mở khóa'}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
            Khóa học Khám phá &amp; Sáng tạo AIKid
          </h2>
          <p className="mt-1.5 text-sm font-semibold leading-relaxed text-slate-600">
            Học miễn phí 10 Quy tắc vàng, sau đó tiếp tục 5 khóa học sáng tạo theo lộ trình chính thức.
          </p>
        </div>
        <div className="flex shrink-0 gap-2 text-[11px] font-black text-slate-600">
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800 ring-1 ring-emerald-200">10 quy tắc miễn phí</span>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800 ring-1 ring-amber-200">5 khóa cần mở</span>
        </div>
      </div>

      <div className="mt-5 grid items-stretch gap-5 lg:grid-cols-2">
        <button
          type="button"
          onClick={onOpenTrailer}
          className="group relative aspect-[16/9] min-h-[210px] w-full overflow-hidden rounded-3xl border border-orange-200 bg-sky-50 text-left focus-visible:outline-focus sm:min-h-0"
          aria-label="Xem giới thiệu khóa học"
        >
          <img
            src={designerAssets.worldScenes.aiValley}
            alt="Đảo học tập của khóa AIKid"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-orange-700 shadow-sm">
            Khóa học chính thức
          </span>
          <span className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-orange-500 text-white shadow-lg transition-transform group-hover:scale-105">
            <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
          </span>
          <span className="absolute bottom-4 left-4 text-sm font-black text-white">
            Xem giới thiệu 1 phút 45 giây
          </span>
        </button>

        <div className="flex min-w-0 flex-col justify-between">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="flex items-start gap-2 rounded-xl bg-white/80 p-2.5 ring-1 ring-orange-100">
              <Image className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" aria-hidden="true" />
              <span className="text-[11px] font-bold leading-snug text-slate-700">Đảo Tiên Quyết: học miễn phí 10 Quy tắc vàng</span>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-white/80 p-2.5 ring-1 ring-orange-100">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" aria-hidden="true" />
              <span className="text-[11px] font-bold leading-snug text-slate-700">5 khóa tiếp theo mở sau khi thanh toán</span>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-white/80 p-2.5 ring-1 ring-orange-100">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span className="text-[11px] font-bold leading-snug text-slate-700">Tạo tranh, nhân vật, truyện và trò chơi</span>
            </div>
          </div>

          <div className="mt-3 rounded-2xl bg-white/85 p-3 ring-1 ring-orange-100">
            <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
              <span>{completedStationsCount}/32 trạm hoàn thành</span>
              <span className="text-orange-700">{overallProgressPct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-orange-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-[width]"
                style={{ width: `${Math.max(0, Math.min(100, overallProgressPct))}%` }}
              />
            </div>
          </div>

          {isPurchased ? (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
              <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
              Đã mở khóa 5 khóa học · 10 Quy tắc vẫn miễn phí
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-end justify-between gap-2 rounded-2xl bg-amber-50 px-3 py-2.5 ring-1 ring-amber-200">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wide text-amber-800">Thanh toán một lần</p>
                <p className="mt-0.5 text-xl font-black text-orange-700">479.000đ</p>
              </div>
              <div className="text-right text-[11px] font-bold text-slate-500">
                <p className="line-through">799.000đ</p>
                <p className="text-emerald-700">Sở hữu trọn đời</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={primaryAction}
            className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-black text-white shadow-[0_4px_0_#c2410c] transition-all hover:bg-orange-600 active:translate-y-1 active:shadow-none cursor-pointer"
          >
            {actionLabel ? (
              actionLabel
            ) : isPurchased ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Vào học 5 khóa đã mở
              </>
            ) : (
              'Mở khóa ngay · 479.000đ'
            )}
          </button>
        </div>
      </div>

      {children && <div className="mt-5 border-t border-orange-100 pt-5">{children}</div>}
    </section>
  )
}

export default OfficialCourseCard
