import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  ChevronLeft,
  CheckCircle2,
  Lock,
  Zap,
  Award,
  Compass,
  Trophy,
} from 'lucide-react'
import { designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { type QuestProgress } from '@/shared/lib/api'
import { AIKID_ISLANDS_META, type IslandMeta } from './WorldProgramIslandCard'
import { prefetchRoute, prefetchRouteImmediately } from '@/app/route-prefetch'

export type IslandCourseSummary = {
  id: string
  slug?: string
  title: string
  shortTitle?: string
  status: 'completed' | 'active' | 'available' | 'locked'
  completionPercent?: number
  completedCount?: number
  totalStars?: number
  questCount?: number
  stations?: QuestProgress[]
}

export interface IslandStationsExplorerViewProps {
  courseId: string
  courseTitle: string
  quests: QuestProgress[]
  courses?: IslandCourseSummary[]
  meta: { totalStars: number; completedCount: number }
  currentRegion?: {
    name: string
    scene?: string
    ribbon?: string
    accent?: string
  }
  isCurrentCourseRule?: boolean
  getStationSlugFn: (station: any, isRuleCourse?: boolean) => string
  onSelectStation?: (stationSlug: string) => void
  onBackToMap?: () => void
  onSelectIsland?: (islandSlug: string) => void
}

export function IslandStationsExplorerView({
  courseId,
  courseTitle,
  quests,
  courses = [],
  meta,
  currentRegion,
  isCurrentCourseRule = false,
  getStationSlugFn,
  onSelectStation,
  onBackToMap,
  onSelectIsland,
}: IslandStationsExplorerViewProps) {
  const navigate = useNavigate()
  const [meeWaved, setMeeWaved] = useState<boolean>(true)

  // Tìm thông tin đảo hiện tại dựa vào courseId
  const currentCourseIndex = courses.findIndex(
    (course) => course.id === courseId || course.slug === courseId,
  )
  const currentIslandIndex = currentCourseIndex >= 0
    ? currentCourseIndex
    : AIKID_ISLANDS_META.findIndex(
        (isl) =>
          isl.targetSlug === courseId ||
          isl.canonicalSlug === courseId ||
          isl.id === courseId,
      )
  const currentIsland: IslandMeta =
    currentIslandIndex >= 0
      ? AIKID_ISLANDS_META[currentIslandIndex]
      : AIKID_ISLANDS_META[0]

  const accentColor = currentIsland.accentColor || currentRegion?.accent || currentRegion?.ribbon || '#7c3aed'

  const progressPct =
    quests.length > 0
      ? Math.round((meta.completedCount / quests.length) * 100)
      : 0

  const handleIslandClick = (island: IslandMeta) => {
    const slug = island.targetSlug || island.id || ''
    if (onSelectIsland) {
      onSelectIsland(slug)
    } else {
      navigate(`/world/${slug}`)
    }
  }

  const handleStationClick = (quest: QuestProgress) => {
    const slug = getStationSlugFn(quest, isCurrentCourseRule)
    if (onSelectStation) {
      onSelectStation(slug)
    } else {
      const targetUrl = `/world/${courseId}/lesson/${slug}`
      navigate(targetUrl)
    }
  }

  return (
    <div className="max-w-[1024px] mx-auto w-full px-3 sm:px-4 md:px-6 flex flex-col gap-5 text-zinc-900 pb-16 select-none min-w-0">
      {/* ── 1. TOP NAV BAR: Back Button + Island Title + Total Stars/XP Pill ── */}
      <div className="flex items-center justify-between gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => {
            if (onBackToMap) onBackToMap()
            else navigate('/world/program/aikid_official')
          }}
          aria-label="Quay lại Bản đồ Đảo"
          className="whitespace-nowrap px-3.5 py-2 text-xs sm:text-sm font-black rounded-full bg-white shadow-xs border border-slate-200/80 flex items-center gap-1.5 text-zinc-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-4 h-4 text-zinc-700 shrink-0" />
          <span>Quay lại Bản đồ Đảo</span>
        </button>

        {/* Current Island Badge + XP & Stars Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-black shadow-xs whitespace-nowrap shrink-0">
            <Compass className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>{currentIsland.number}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold shadow-xs whitespace-nowrap shrink-0">
            <span className="text-amber-500">⭐</span>
            <span>{meta.totalStars}/{quests.length * 3} Sao</span>
            <span className="text-amber-400/80">•</span>
            <span className="text-[#FD7D2E]">+{meta.completedCount * 50} XP</span>
          </div>
        </div>
      </div>

      {/* ── 2. LANDSCAPE HEADER SOFT CLAY: BỐI CẢNH ĐẢO & MÈO MEE CHÀO BÉ ── */}
      <section className="relative w-full rounded-[2.5rem] bg-linear-to-b from-purple-50/80 via-white to-amber-50/40 p-4 sm:p-6 border border-purple-100/90 shadow-xs overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Cột trái: Tên Đảo, mô tả và tiến độ trạm */}
          <div className="flex-1 min-w-0 space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-purple-900 text-[11px] font-black uppercase tracking-wider shadow-2xs border border-purple-200/60">
              <span>🏰</span>
              <span>{currentIsland.number}: {currentIsland.title}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 leading-tight">
              {courseTitle || currentIsland.title}
            </h1>

            <p className="text-xs sm:text-sm font-semibold text-zinc-600 line-clamp-2 max-w-xl">
              Cùng Mèo Mee khám phá {currentIsland.desc}, chinh phục từng trạm thử thách để trở thành Hiệp Sĩ Sáng Tạo AI nhí!
            </p>

            {/* Thanh tiến độ Soft Clay */}
            <div className="pt-2 max-w-md mx-auto md:mx-0 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-zinc-600">Tiến độ hòn đảo</span>
                <span className="text-purple-700">{meta.completedCount}/{quests.length} trạm xong ({progressPct}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-purple-100 overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-purple-600 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cột phải: Cảnh quan đảo + Mascot Mèo Mee tương tác */}
          <div className="relative shrink-0 w-60 sm:w-72 h-36 sm:h-44 flex items-center justify-center">
            {/* Ảnh cảnh quan Đảo Soft Clay */}
            <img
              src={currentIsland.scene || designerAssets.worldScenes.aiValley}
              alt={currentIsland.title}
              className="w-full h-full object-contain pointer-events-none drop-shadow-md transition-transform hover:scale-105 duration-300"
            />

            {/* Mascot Mèo Mee đứng vẫy tay chào bé */}
            <div className="absolute right-2 bottom-1 z-20 flex flex-col items-center">
              <div className="relative mb-0.5 px-2.5 py-0.5 rounded-full bg-white text-zinc-800 text-[10px] font-black shadow-xs flex items-center gap-1 animate-bounce-subtle whitespace-nowrap">
                <span>Mee chào con!</span>
                <span className="text-xs">👋</span>
                <div className="absolute -bottom-1 right-3 w-1.5 h-1.5 bg-white transform rotate-45" />
              </div>
              <div
                onClick={() => setMeeWaved(!meeWaved)}
                className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
                title="Mèo Mee vẫy tay chào bé!"
              >
                <img
                  src={designerAssets.catPoses.welcome}
                  alt="Mèo Mee vẫy tay"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. HẢI TRÌNH 6 ĐẢO NỔI TOÀN CẢNH (HORIZONTAL SLIDER) ── */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[#f8fafc] p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[#FD7D2E]">
              <Compass className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
              Hải Trình 6 Đảo Học Tập
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FD7D2E] text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
              6 HÒN ĐẢO SÁNG TẠO
            </span>
          </div>
          <span className="text-xs font-semibold text-zinc-400 hidden sm:inline">
            Chạm đảo để chuyển lộ trình
          </span>
        </div>

        {/* Thanh trượt ngang 6 Đảo */}
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-2 px-1 no-scrollbar scroll-smooth snap-x snap-mandatory">
          {(courses.length > 0 ? courses : AIKID_ISLANDS_META).map((entry, idx) => {
            const course = courses.length > 0 ? entry as IslandCourseSummary : undefined
            const island = AIKID_ISLANDS_META[idx] || AIKID_ISLANDS_META[AIKID_ISLANDS_META.length - 1]
            const isSelected =
              course?.id === courseId ||
              course?.slug === courseId ||
              (!course && (
                island.targetSlug === courseId ||
                island.canonicalSlug === courseId ||
                island.id === courseId
              ))

            // Trạng thái đảo luôn lấy từ pathway backend. Chỉ dùng suy luận cũ
            // khi client cũ không truyền danh sách khóa học.
            const isCompleted = course ? course.status === 'completed' : idx < currentIslandIndex
            const isInProgress = course
              ? course.status === 'active' || course.status === 'available'
              : isSelected
            const isLocked = course ? course.status === 'locked' : idx > currentIslandIndex && !isSelected
            // `stations` trong projection cũ có thể chứa nhiều dòng phase cho
            // cùng một bài. `questCount` đã được chuẩn hóa tại WorldPage nên
            // phải được ưu tiên để không hiển thị x2/x3 số trạm.
            const stationCount = course?.questCount || course?.stations?.length || 0
            const completedCount = Math.min(stationCount, Math.max(0, course?.completedCount || 0))
            const completionPercent = course?.status === 'completed'
              ? 100
              : stationCount > 0
              ? Math.round((completedCount / stationCount) * 100)
              : Math.max(0, course?.completionPercent || 0)
            const islandTitle = course?.shortTitle || course?.title || island.title

            return (
              <div
                key={course?.id || island.id}
                onClick={() => {
                  if (!isLocked) {
                    handleIslandClick({
                      ...island,
                      targetSlug: course?.slug || course?.id || island.targetSlug,
                    })
                  }
                }}
                aria-disabled={isLocked}
                className={cn(
                  'snap-start shrink-0 flex flex-col justify-between transition-all duration-300 cursor-pointer rounded-2xl p-2.5 w-[200px] sm:w-[220px]',
                  isSelected
                    ? 'bg-white ring-2 ring-[#FD7D2E] scale-[1.02] shadow-md -translate-y-0.5'
                    : isCompleted
                    ? 'bg-white hover:bg-slate-50 hover:shadow-xs'
                    : isLocked
                    ? 'cursor-not-allowed bg-white/70 opacity-70'
                    : 'bg-white/80 hover:bg-white opacity-90 hover:opacity-100'
                )}
              >
                {/* Cảnh quan đảo */}
                <div className="relative w-full aspect-16/10 rounded-xl overflow-hidden bg-zinc-200 shadow-inner">
                  <img
                    src={island.scene}
                    alt={island.title}
                    className={cn(
                      'w-full h-full object-cover transition-transform duration-500',
                      isLocked ? 'grayscale-[40%] brightness-90' : 'hover:scale-105'
                    )}
                  />
                  <div className="absolute bottom-0 inset-x-0 h-8 bg-black/40 pointer-events-none" />

                  {/* Huy hiệu trạng thái */}
                  <div className="absolute top-2 left-2 z-20">
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black shadow-md border border-white/80">
                        <CheckCircle2 className="w-2.5 h-2.5 stroke-[2.4]" />
                        <span>ĐÃ XONG</span>
                      </span>
                    )}
                    {isInProgress && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FD7D2E] text-white text-[9px] font-black shadow-md border border-white/80 animate-pulse">
                        <Zap className="w-2.5 h-2.5 fill-white" />
                        <span>ĐANG HỌC</span>
                      </span>
                    )}
                    {isLocked && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900/80 backdrop-blur-xs text-zinc-300 text-[9px] font-bold shadow-md border border-white/40">
                        <Lock className="w-2.5 h-2.5" />
                        <span>KHÓA</span>
                      </span>
                    )}
                  </div>

                  {/* Số hiệu Đảo */}
                  <span className="absolute bottom-1.5 left-2 px-1.5 py-0.2 rounded-md bg-black/50 backdrop-blur-xs text-[9px] font-black text-white/95 uppercase tracking-wider">
                    {island.number}
                  </span>
                </div>

                {/* Thông tin Đảo */}
                <div className="mt-2 space-y-1 px-0.5 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-black text-zinc-900 truncate">
                      {islandTitle}
                    </h3>
                    <span className="text-[10px] font-bold text-zinc-400 shrink-0">
                      {island.desc}
                    </span>
                  </div>

                  <p className="text-[10px] font-semibold text-purple-700 leading-snug line-clamp-1">
                    {stationCount > 0
                      ? `${completedCount}/${stationCount} trạm · ${completionPercent}%`
                      : island.landmark}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 4. SỔ TAY LỘ TRÌNH CÁC TRẠM HỌC SOFT CLAY 2D FLAT ── */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
                Lộ Trình Trạm Học: {currentIsland.title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FD7D2E] text-[11px] font-black">
                {quests.length} trạm
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-500 mt-0.5">
              Hoàn thành các trạm thử thách để tích lũy sao và mở khóa phần thưởng
            </p>
          </div>
        </div>

        {/* Danh sách các Trạm Học */}
        <div className="relative flex flex-col gap-3.5 py-1">
          {/* Đường dẫn kết nối giữa các trạm */}
          <div className="absolute top-8 bottom-8 left-6 sm:left-7 w-1 bg-slate-200 rounded-full pointer-events-none -z-0" />

          {quests.map((quest, idx) => {
            const isCompleted = quest.status === 'completed'
            const isCurrent = quest.status === 'in_progress' || (quest.status === 'available' && idx === meta.completedCount)
            const isLocked = quest.status === 'locked'
            const stationNum = quest.order || idx + 1
            const stationSlug = getStationSlugFn(quest, isCurrentCourseRule)
            const lessonUrl = `/world/${courseId}/lesson/${stationSlug}`
            const canOpenLesson = stationSlug.trim().length > 0

            return (
              <div
                key={`${quest.id || stationSlug}-${idx}`}
                className={cn(
                  'relative z-10 flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl transition-all clay-card-subtle bg-white border border-slate-200/80',
                  isCurrent
                    ? 'ring-2 ring-orange-400/60 shadow-md'
                    : isCompleted
                    ? 'hover:bg-slate-50/90 shadow-2xs'
                    : 'opacity-80 bg-slate-50/60'
                )}
              >
                {/* Node số thứ tự trạm */}
                <div className="relative shrink-0 flex flex-col items-center">
                  <div
                    className={cn(
                      'w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-black transition-transform',
                      isCompleted
                        ? 'bg-[#059669] text-white shadow-xs'
                        : isCurrent
                        ? 'bg-[#FD7D2E] text-white ring-3 ring-orange-200/70 shadow-xs animate-bounce-subtle'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.4]" />
                    ) : isCurrent ? (
                      <span>{stationNum}</span>
                    ) : (
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    )}
                  </div>

                  {/* Chấm mầm xanh khi hoàn thành */}
                  {isCompleted && (
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 mt-1 shadow-2xs" />
                  )}
                </div>

                {/* Nội dung card trạm */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                        TRẠM {stationNum}
                      </span>

                      {/* Huy hiệu trạng thái trạm */}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ĐÃ XONG</span>
                        </span>
                      )}
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FD7D2E] text-white text-[10px] font-black shadow-2xs animate-pulse">
                          <Zap className="w-3 h-3 fill-white" />
                          <span>ĐANG HỌC</span>
                        </span>
                      )}
                      {isLocked && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-600 text-[10px] font-bold">
                          <Lock className="w-2.5 h-2.5" />
                          <span>KHÓA</span>
                        </span>
                      )}

                      {idx === quests.length - 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
                          <Award className="w-3 h-3 text-amber-600" />
                          <span>TRẠM ĐÍCH</span>
                        </span>
                      )}
                    </div>

                    {/* XP & Sao */}
                    <div className="flex items-center gap-1.5">
                      {isCompleted && (
                        <div className="flex items-center text-amber-400 text-xs">
                          {Array.from({ length: quest.stars || 3 }).map((_, sIdx) => (
                            <span key={sIdx}>⭐</span>
                          ))}
                        </div>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#FD7D2E] text-xs font-black">
                        +{quest.xpEarned || 50} XP
                      </span>
                    </div>
                  </div>

                  {/* Tiêu đề & mô tả */}
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-zinc-900 leading-snug">
                      {quest.title}
                    </h3>
                    <p className="line-clamp-2 sm:line-clamp-none text-xs sm:text-[13px] font-medium text-zinc-600 leading-relaxed mt-0.5">
                      {quest.hook || quest.skill || `Khám phá bài học thú vị trong ${currentIsland.title}`}
                    </p>
                  </div>

                  {/* Nút hành động trạm (KHÔNG CÓ DẤU ->, → hay <ArrowRight />, KHÔNG CÓ SPARKLES) */}
                  <div className="pt-1.5 flex items-center gap-2">
                    {isCurrent && canOpenLesson && (
                      <Link
                        to={lessonUrl}
                        onClick={() => handleStationClick(quest)}
                        onPointerEnter={() => prefetchRoute(lessonUrl)}
                        onPointerDown={() => prefetchRouteImmediately(lessonUrl)}
                        onFocus={() => prefetchRoute(lessonUrl)}
                        className="inline-flex min-h-[44px] px-5 py-2.5 rounded-full bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-xs sm:text-sm font-black shadow-xs active:scale-95 transition-all items-center justify-center cursor-pointer"
                      >
                        <span>{quest.status === 'in_progress' ? 'Tiếp tục học' : 'Bắt đầu học'}</span>
                      </Link>
                    )}

                    {isCompleted && canOpenLesson && (
                      <Link
                        to={lessonUrl}
                        onClick={() => handleStationClick(quest)}
                        onPointerEnter={() => prefetchRoute(lessonUrl)}
                        onPointerDown={() => prefetchRouteImmediately(lessonUrl)}
                        onFocus={() => prefetchRoute(lessonUrl)}
                        className="inline-flex min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold text-purple-700 hover:text-purple-900 hover:bg-purple-50 transition-all cursor-pointer active:scale-95 border border-purple-200/60"
                      >
                        <span>Ôn tập lại trạm này</span>
                      </Link>
                    )}

                    {!isCurrent && !isCompleted && !isLocked && canOpenLesson && (
                      <Link
                        to={lessonUrl}
                        onClick={() => handleStationClick(quest)}
                        onPointerEnter={() => prefetchRoute(lessonUrl)}
                        onPointerDown={() => prefetchRouteImmediately(lessonUrl)}
                        onFocus={() => prefetchRoute(lessonUrl)}
                        className="inline-flex min-h-[44px] px-5 py-2.5 rounded-full bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-black shadow-xs active:scale-95 transition-all items-center justify-center cursor-pointer"
                      >
                        <span>Vào học</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Chúc mừng khi hoàn thành toàn bộ đảo */}
        {quests.length > 0 && meta.completedCount === quests.length && (
          <div className="relative z-10 flex flex-col items-center py-6 text-center bg-amber-50/70 rounded-3xl border border-amber-200/80 p-5 mt-4">
            <div className="flex size-18 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-md mb-2">
              <Trophy size={36} aria-hidden="true" />
            </div>
            <h3 className="font-display text-lg font-black text-zinc-900">Xuất sắc!</h3>
            <p className="text-xs sm:text-sm font-semibold text-zinc-600 mt-1 max-w-sm">
              Con đã hoàn thành toàn bộ hành trình tại {currentIsland.title}!
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
