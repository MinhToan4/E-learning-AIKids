import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  ChevronLeft,
  CheckCircle2,
  Lock,
  Zap,
  Ship,
  Compass,
  Trophy,
  Star,
} from 'lucide-react'
import { designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { type QuestProgress } from '@/shared/lib/api'
import { prefetchRoute, prefetchRouteImmediately } from '@/app/route-prefetch'
import { findIslandCurriculum } from '@/features/lesson/data/island-curriculum-registry'

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

export interface IslandPresetConfig {
  index: number
  badge: string
  title: string
  subtitle: string
  desc: string
  pedagogicalDesc: string
  scene: string
  accentColor: string
  targetSlug: string
  canonicalSlug: string
  landmark: string
}

export const AIKID_SIX_ISLAND_PRESETS: IslandPresetConfig[] = [
  {
    index: 0,
    badge: 'ĐẢO 1',
    title: 'Đảo Tiên Quyết',
    subtitle: '10 Quy tắc vàng',
    desc: '10 Quy tắc vàng Xưởng Sáng Tạo',
    pedagogicalDesc: 'Mười Quy Tắc Vàng Xưởng Sáng Tạo — Làm chủ AI an toàn, tôn trọng và thông minh',
    scene: designerAssets.worldScenes.aiValley,
    accentColor: '#7c3aed',
    targetSlug: 'dao-1',
    canonicalSlug: 'muoi-quy-tac-xuong-sang-tao',
    landmark: 'Xưởng AI & Khiên',
  },
  {
    index: 1,
    badge: 'ĐẢO 2',
    title: 'Đảo Khám Phá',
    subtitle: 'Nhà Thám Hiểm AI',
    desc: 'Bốn Chiếc Chìa Khóa Vàng',
    pedagogicalDesc: 'Bốn Chiếc Chìa Khóa Vàng (Cái gì? Trông thế nào? Đang làm gì? Ở đâu?)',
    scene: designerAssets.worldScenes.promptKeys,
    accentColor: '#059669',
    targetSlug: 'dao-2',
    canonicalSlug: 'dao-1-nha-tham-hiem-ai',
    landmark: 'Hải đăng & Chìa khóa',
  },
  {
    index: 2,
    badge: 'ĐẢO 3',
    title: 'Đảo Họa Sĩ',
    subtitle: 'Sắc màu cọ vẽ',
    desc: 'Sắc Màu & Kể Chuyện',
    pedagogicalDesc: 'Sắc Màu & Kể Chuyện — Bố cục ngôi sao 3 lớp, ánh sáng cảm xúc và tạo ra bức tranh biết nói',
    scene: designerAssets.worldScenes.creativeMountain,
    accentColor: '#ea580c',
    targetSlug: 'dao-3',
    canonicalSlug: 'dao-2-hoa-si-ai',
    landmark: 'Núi màu & Giá vẽ',
  },
  {
    index: 3,
    badge: 'ĐẢO 4',
    title: 'Đảo Nhân Vật',
    subtitle: 'Hồ sơ 3 điểm',
    desc: 'Hồ Sơ & 6 Biểu Cảm',
    pedagogicalDesc: 'Hồ Sơ & 6 Biểu Cảm — Khoá mật mã nhận diện 3 điểm, biến hoá 6 biểu cảm và căn cứ bí mật',
    scene: designerAssets.worldScenes.characterLab,
    accentColor: '#0284c7',
    targetSlug: 'dao-4',
    canonicalSlug: 'dao-3-biet-doi-nhan-vat-ai',
    landmark: 'Gương thần 6 biểu cảm',
  },
  {
    index: 4,
    badge: 'ĐẢO 5',
    title: 'Đảo Truyện Tranh',
    subtitle: 'Storyboard 8 ô',
    desc: 'Storyboard 8 Ô & Comic',
    pedagogicalDesc: 'Storyboard 8 Ô & Comic — Kịch bản 3 cổng, khung xương 4 nhịp và xuất bản cuốn truyện tranh 8 trang',
    scene: designerAssets.worldScenes.storyIsland,
    accentColor: '#db2777',
    targetSlug: 'dao-5',
    canonicalSlug: 'dao-4-vuong-quoc-truyen-tranh-ai',
    landmark: 'Lâu đài truyện tranh',
  },
  {
    index: 5,
    badge: 'ĐẢO 6',
    title: 'Đảo Trò Chơi',
    subtitle: 'Đấu trường thẻ bài',
    desc: 'Đấu Trường Thẻ Bài',
    pedagogicalDesc: 'Đấu Trường Thẻ Bài — Bộ 12 thẻ bài cân bằng chỉ số Sức-Nhanh-Khéo, bàn cờ A3 và luật chơi công bằng',
    scene: designerAssets.worldScenes.gameArena,
    accentColor: '#4f46e5',
    targetSlug: 'dao-6',
    canonicalSlug: 'dao-5-nha-phat-minh-tro-choi-ai',
    landmark: 'Đấu trường AI',
  },
]

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

  // 1. Tìm thông tin đảo hiện tại dựa vào courseId
  const currentCourseIndex = courses.findIndex(
    (c) => c.id === courseId || c.slug === courseId,
  )

  const presetIndex = AIKID_SIX_ISLAND_PRESETS.findIndex(
    (isl) =>
      isl.targetSlug === courseId ||
      isl.canonicalSlug === courseId ||
      courseId.includes(isl.targetSlug) ||
      courseId.includes(isl.canonicalSlug),
  )

  const daoMatch = courseId.match(/dao-(\d+)/)
  const daoNumberIndex = daoMatch ? parseInt(daoMatch[1], 10) - 1 : -1

  const currentIslandIndex =
    currentCourseIndex >= 0
      ? currentCourseIndex
      : presetIndex >= 0
      ? presetIndex
      : daoNumberIndex >= 0 && daoNumberIndex < AIKID_SIX_ISLAND_PRESETS.length
      ? daoNumberIndex
      : 1

  const currentIsland = AIKID_SIX_ISLAND_PRESETS[currentIslandIndex] || AIKID_SIX_ISLAND_PRESETS[1]

  const progressPct =
    quests.length > 0
      ? Math.round((meta.completedCount / quests.length) * 100)
      : 0

  const handleIslandClick = (targetSlug: string) => {
    if (onSelectIsland) {
      onSelectIsland(targetSlug)
    } else {
      navigate(`/world/${targetSlug}`)
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

  // Tìm trạm đang học (active quest) cho Khối 3 - Mèo Mee Navigator
  const inProgressIndex = quests.findIndex((q) => q.status === 'in_progress')
  const availableIndex = quests.findIndex(
    (q, idx) => q.status === 'available' && idx === meta.completedCount,
  )
  const activeQuestIndex =
    inProgressIndex >= 0
      ? inProgressIndex
      : availableIndex >= 0
      ? availableIndex
      : meta.completedCount < quests.length
      ? meta.completedCount
      : 0

  const activeQuest = quests[activeQuestIndex] || quests[0]
  const activeStationNum = activeQuest?.order || activeQuestIndex + 1
  const activeStationSlug = activeQuest ? getStationSlugFn(activeQuest, isCurrentCourseRule) : ''
  const activeLessonUrl = activeStationSlug ? `/world/${courseId}/lesson/${activeStationSlug}` : ''

  const activeCurriculum = activeQuest
    ? findIslandCurriculum({ id: activeQuest.id, title: activeQuest.title, slug: activeQuest.slug })
    : null
  const activeStationBadgeText = activeCurriculum?.lessonNumber
    ? `Trạm ${activeCurriculum.lessonNumber}`
    : isCurrentCourseRule
    ? `Quy tắc ${activeStationNum}`
    : `Trạm ${currentIslandIndex + 1}.${activeStationNum}`

  const displaySubtitle = courseTitle || currentIsland.subtitle
  const totalMaxStars = (quests.length || 4) * 3

  return (
    <div className="max-w-[1024px] mx-auto w-full px-3 sm:px-4 md:px-6 flex flex-col gap-5 text-zinc-900 pb-28 select-none min-w-0">
      {/* ── KHỐI 1: HEADER ĐIỀU HƯỚNG (Bản đồ Đảo + Badge Đảo + Sao/XP Chip) ── */}
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

        {/* Current Island Badge + Stars & XP Chip */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-black shadow-xs whitespace-nowrap shrink-0">
            <Compass className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>{currentIsland.badge}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold shadow-xs whitespace-nowrap shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
            <span>{meta.totalStars}/{totalMaxStars} Sao</span>
            <span className="text-amber-400/80">•</span>
            <span className="text-[#FD7D2E]">+{meta.completedCount * 50} XP</span>
          </div>
        </div>
      </div>

      {/* ── KHỐI 2: SÂN KHẤU ĐẢO LỚN (GRAND ISLAND DIORAMA STAGE) ── */}
      <section className="relative w-full rounded-[2.5rem] overflow-hidden bg-slate-950 shadow-clay border-2 border-amber-200/60 group">
        <div className="relative w-full aspect-16/9 sm:aspect-21/9 md:aspect-3/1 overflow-hidden">
          <img
            src={currentIsland.scene || designerAssets.worldScenes.promptKeys}
            alt={currentIsland.title}
            className="w-full h-full object-cover filter brightness-95 group-hover:scale-103 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

          {/* Badges nổi trên ảnh diorama */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-[10px] sm:text-xs shadow-md">
                {currentIsland.badge} · {currentIsland.title} | {displaySubtitle}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-amber-200 text-[10px] font-bold">
                {currentIsland.subtitle}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] sm:text-xs shadow-md flex items-center gap-1.5">
                <Ship className="w-3.5 h-3.5 text-amber-950 shrink-0" />
                <span>Thuyền Mèo Mee neo bến</span>
              </span>
            </div>
          </div>

          {/* Thông tin chân ảnh diorama */}
          <div className="absolute bottom-3 inset-x-3 text-white flex items-end justify-between gap-2 z-10">
            <div className="min-w-0 pr-2">
              <h1 className="text-base sm:text-xl md:text-2xl font-black leading-tight text-white drop-shadow-md line-clamp-1">
                {currentIsland.title} — {displaySubtitle}
              </h1>
              <p className="text-[11px] sm:text-xs text-amber-200 font-semibold line-clamp-2 mt-0.5 max-w-2xl">
                {currentIsland.pedagogicalDesc}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-amber-950 font-black text-[10px] sm:text-xs shadow-xs flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-950 text-amber-950 shrink-0" />
                <span>{meta.totalStars}/{totalMaxStars} Sao</span>
              </span>
            </div>
          </div>
        </div>

        {/* Thanh tiến độ hòn đảo Soft Clay */}
        <div className="bg-white/95 backdrop-blur-xs p-3.5 sm:p-4 border-t border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:flex-1 space-y-1">
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

          {/* Mascot AIKI Đồng Hành */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="text-[11px] font-bold text-zinc-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80">
              Hiệp Sĩ AI Nhí
            </span>
            <img
              src="/assets/aikid-ui/mascot-original/course-wave.webp"
              alt="Mèo Mee"
              className="w-8 h-8 object-contain drop-shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* ── KHỐI 3: THẺ THÔNG BÁO THUYỀN MÈO MEE NAVIGATOR ── */}
      <section className="rounded-3xl bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 border-2 border-amber-300 p-3.5 sm:p-4.5 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-white text-[#FD7D2E] shadow-sm flex items-center justify-center shrink-0 border border-amber-200">
            <Ship className="w-6 h-6 text-[#FD7D2E]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-xs sm:text-sm text-amber-950">
                Đảo {currentIsland.index + 1}: {currentIsland.title}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#FD7D2E] text-white text-[10px] font-black shrink-0">
                {activeStationBadgeText}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-amber-900 font-medium line-clamp-1 mt-0.5">
              Thuyền Mèo Mee neo bến • Học nhận ngay +3 sao
            </p>
          </div>
        </div>

        {activeLessonUrl ? (
          <Link
            to={activeLessonUrl}
            onClick={() => activeQuest && handleStationClick(activeQuest)}
            onPointerEnter={() => prefetchRoute(activeLessonUrl)}
            onPointerDown={() => prefetchRouteImmediately(activeLessonUrl)}
            onFocus={() => prefetchRoute(activeLessonUrl)}
            className="px-4 py-2.5 rounded-2xl bg-[#FD7D2E] hover:bg-[#ea6a1f] active:scale-95 text-white font-black text-xs sm:text-sm shadow-clay shrink-0 transition-all whitespace-nowrap flex items-center justify-center cursor-pointer min-h-[44px]"
          >
            <span>Học Tiếp</span>
          </Link>
        ) : null}
      </section>

      {/* ── KHỐI 4: DẢI THẺ NGANG 6 ĐẢO HẢI TRÌNH (HORIZONTAL SLIDER) ── */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[#f8fafc] p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-[#FD7D2E]">
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
          {AIKID_SIX_ISLAND_PRESETS.map((island, idx) => {
            const course = courses[idx]
            const isSelected = idx === currentIslandIndex
            const isCompleted = course ? course.status === 'completed' : idx < currentIslandIndex
            const isInProgress = course
              ? course.status === 'active' || course.status === 'available'
              : isSelected
            const isLocked = course ? course.status === 'locked' : idx > currentIslandIndex && !isSelected
            const stationCount = course?.questCount || (idx === 0 ? 10 : 4)
            const completedCount = Math.min(stationCount, Math.max(0, course?.completedCount || 0))
            const completionPercent = course?.status === 'completed'
              ? 100
              : stationCount > 0
              ? Math.round((completedCount / stationCount) * 100)
              : 0
            const islandTitle = course?.shortTitle || course?.title || island.title

            return (
              <div
                key={island.canonicalSlug}
                onClick={() => {
                  if (!isLocked) {
                    const targetSlug = course?.slug || course?.id || island.targetSlug
                    handleIslandClick(targetSlug)
                  }
                }}
                aria-disabled={isLocked}
                className={cn(
                  'snap-start shrink-0 flex flex-col justify-between transition-all duration-300 rounded-3xl p-2.5 w-[200px] sm:w-56',
                  isLocked ? 'cursor-not-allowed bg-white/70 opacity-70 border border-slate-200/60' : 'cursor-pointer',
                  isSelected
                    ? 'bg-white ring-4 ring-orange-400 scale-[1.02] shadow-md -translate-y-0.5 border-transparent'
                    : !isLocked
                    ? 'bg-white/90 hover:bg-white hover:shadow-xs border border-slate-200/80'
                    : '',
                )}
              >
                {/* Cảnh quan đảo */}
                <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden bg-zinc-200 shadow-inner">
                  <img
                    src={island.scene}
                    alt={island.title}
                    className={cn(
                      'w-full h-full object-cover transition-transform duration-500',
                      isLocked ? 'grayscale brightness-90' : 'hover:scale-105',
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
                    {isInProgress && !isCompleted && (
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
                  <span className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-xs text-[9px] font-black text-white/95 uppercase tracking-wider">
                    {island.badge}
                  </span>
                </div>

                {/* Thông tin Đảo */}
                <div className="mt-2 space-y-1 px-0.5 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-black text-zinc-900 truncate">
                      {islandTitle}
                    </h3>
                    <span className="text-[10px] font-bold text-zinc-400 shrink-0">
                      {island.subtitle}
                    </span>
                  </div>

                  <p className="text-[10px] font-semibold text-purple-700 leading-snug line-clamp-1">
                    {stationCount > 0
                      ? `${completedCount}/${stationCount} trạm · ${completionPercent}%`
                      : island.pedagogicalDesc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── KHỐI 5: LỘ TRÌNH CÁC TRẠM HỌC (STATION CARDS GRID 2 CỘT) ── */}
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

        {/* Lưới các trạm học — Đảm bảo 1 cột trên mobile, 2 cột trên tablet/desktop theo chuẩn course-demo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-1">
          {quests.map((quest, idx) => {
            const isCompleted = quest.status === 'completed'
            const isCurrent =
              quest.status === 'in_progress' ||
              (quest.status === 'available' && idx === meta.completedCount)
            const isLocked = quest.status === 'locked'
            const stationNum = quest.order || idx + 1
            const stationSlug = getStationSlugFn(quest, isCurrentCourseRule)
            const lessonUrl = `/world/${courseId}/lesson/${stationSlug}`
            const canOpenLesson = stationSlug.trim().length > 0

            // Match curriculum lesson
            const matchedCurriculum = findIslandCurriculum({
              id: quest.id,
              title: quest.title,
              slug: quest.slug,
            })
            const stationBadgeNumber = matchedCurriculum?.lessonNumber
              ? `Bài ${matchedCurriculum.lessonNumber}`
              : isCurrentCourseRule
              ? `Quy tắc ${stationNum}`
              : `Bài ${currentIslandIndex + 1}.${stationNum}`

            return (
              <div
                key={`${quest.id || stationSlug}-${idx}`}
                className={cn(
                  'rounded-3xl p-4 sm:p-5 border-2 transition-all flex flex-col justify-between gap-3 shadow-2xs bg-white',
                  isCurrent
                    ? 'border-orange-500 bg-orange-50/70 shadow-md ring-2 ring-orange-200'
                    : isCompleted
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-200 bg-slate-50/80 opacity-80',
                )}
              >
                {/* Top của thẻ trạm */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                        isCurrent
                          ? 'bg-orange-500 text-white'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600',
                      )}
                    >
                      {stationBadgeNumber}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-black">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã đạt {quest.stars || 3}/3 Sao</span>
                        </span>
                      )}
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-orange-700 font-extrabold text-xs animate-pulse">
                          <Zap className="w-3.5 h-3.5 fill-orange-500" />
                          <span>Đang Học (+3 Sao)</span>
                        </span>
                      )}
                      {isLocked && (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-bold text-xs">
                          <Lock className="w-3 h-3" />
                          <span>Chưa Mở</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#FD7D2E] text-xs font-black">
                        +{quest.xpEarned || 50} XP
                      </span>
                    </div>
                  </div>

                  <h3 className="font-black text-sm sm:text-base text-zinc-900 leading-snug line-clamp-1">
                    {quest.title}
                  </h3>
                  <p className="text-xs text-zinc-600 font-medium line-clamp-2 leading-relaxed">
                    {quest.hook || quest.skill || `Khám phá bài học thú vị trong ${currentIsland.title}`}
                  </p>
                </div>

                {/* Bottom của thẻ trạm: Nút hành động trực tiếp */}
                <div className="pt-1">
                  {isCurrent && canOpenLesson && (
                    <Link
                      to={lessonUrl}
                      onClick={() => handleStationClick(quest)}
                      onPointerEnter={() => prefetchRoute(lessonUrl)}
                      onPointerDown={() => prefetchRouteImmediately(lessonUrl)}
                      onFocus={() => prefetchRoute(lessonUrl)}
                      className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-black text-xs sm:text-sm shadow-clay transition-all text-center flex items-center justify-center cursor-pointer min-h-[44px]"
                    >
                      <span>Vào Học {stationBadgeNumber} Ngay (+3 Sao)</span>
                    </Link>
                  )}

                  {isCompleted && canOpenLesson && (
                    <Link
                      to={lessonUrl}
                      onClick={() => handleStationClick(quest)}
                      onPointerEnter={() => prefetchRoute(lessonUrl)}
                      onPointerDown={() => prefetchRouteImmediately(lessonUrl)}
                      onFocus={() => prefetchRoute(lessonUrl)}
                      className="w-full py-2 rounded-2xl bg-white border border-emerald-300 hover:bg-emerald-50 active:scale-95 text-emerald-800 font-bold text-xs sm:text-sm shadow-2xs transition-all text-center flex items-center justify-center cursor-pointer min-h-[40px]"
                    >
                      <span>Ôn lại trạm này</span>
                    </Link>
                  )}

                  {isLocked && (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2 rounded-2xl bg-slate-200 text-slate-500 font-bold text-xs sm:text-sm cursor-not-allowed text-center min-h-[40px]"
                    >
                      <span>Khóa (Cần hoàn thành bài trước)</span>
                    </button>
                  )}

                  {!isCurrent && !isCompleted && !isLocked && canOpenLesson && (
                    <Link
                      to={lessonUrl}
                      onClick={() => handleStationClick(quest)}
                      onPointerEnter={() => prefetchRoute(lessonUrl)}
                      onPointerDown={() => prefetchRouteImmediately(lessonUrl)}
                      onFocus={() => prefetchRoute(lessonUrl)}
                      className="w-full py-2.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs sm:text-sm text-center flex items-center justify-center min-h-[44px]"
                    >
                      <span>Vào học</span>
                    </Link>
                  )}
                </div>
              </div>
            )
          })}

          {/* Chúc mừng khi hoàn thành toàn bộ đảo */}
          {quests.length > 0 && meta.completedCount === quests.length && (
            <div className="col-span-full relative z-10 flex flex-col items-center py-6 text-center bg-amber-50/70 rounded-3xl border border-amber-200/80 p-5 mt-2">
              <div className="flex size-18 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-md mb-2">
                <Trophy size={36} aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-black text-zinc-900">Xuất sắc!</h3>
              <p className="text-xs sm:text-sm font-semibold text-zinc-600 mt-1 max-w-sm">
                Con đã hoàn thành toàn bộ hành trình tại {currentIsland.title}!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
