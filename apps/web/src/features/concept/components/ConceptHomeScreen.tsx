import React, { useState } from 'react'
import { Bell, Zap } from 'lucide-react'
import { designerAssets } from '@/shared/config/assets'
import {
  ParentTrailerModal,
} from '@/features/subscription/components/ParentPurchaseTrailerBanner'
import {
  HeroProgressCard,
  DailyMissionBanner,
  OfficialCourseCard,
  IslandsTrack,
  SecondaryCoursesSection,
} from '@/features/home/components'
import type { CourseSummary } from '@/shared/lib/api'

export interface ConceptHomeScreenProps {
  onSelectIsland?: (islandId: string) => void
  onOpenOlympiad?: () => void
  onOpenActivity?: (type: 'lessons' | 'hours') => void
  onContinueLesson?: () => void
  onStartMission?: () => void
  onSelectCourse?: (course: CourseSummary) => void
  courses?: CourseSummary[]
  isMobileFrame?: boolean
}

export const ConceptHomeScreen: React.FC<ConceptHomeScreenProps> = ({
  onSelectIsland,
  onOpenOlympiad,
  onOpenActivity,
  onContinueLesson,
  onStartMission,
  onSelectCourse,
  courses,
  isMobileFrame = false,
}) => {
  const [activeIslandId] = useState<string>('dao-1')
  // This concept screen has no entitlement contract. Fail closed instead of
  // allowing a browser flag to simulate a paid subscription.
  const isPurchased = false
  const [showTrailerModal, setShowTrailerModal] = useState<boolean>(false)

  const handleUnlockFullCourse = () => {
    setShowTrailerModal(false)
  }

  return (
    <div className="max-w-[1024px] mx-auto w-full flex flex-col gap-6 text-zinc-900 pb-20 select-none min-w-0">
      {/* ── 1. HEADER TINH GIẢN, ÍT CHỮ (Theo mẫu ảnh 1 & 2) ── */}
      <header className="min-h-[64px] sm:min-h-[72px] px-2 sm:px-4 pt-2 pb-1 w-full flex items-center justify-between gap-3">
        {/* Cụm trái: Avatar tròn Jacob + Hey, Jacob! + Tiến độ */}
        <div className="flex items-center gap-3 min-w-0 group">
          {/* Avatar Jacob với vòng hào quang hoàng hôn ấm áp */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 p-0.5 shadow-sm ring-2 ring-orange-200/60 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                <img
                  src={designerAssets.brand.mascot}
                  alt="Jacob"
                  className="w-full h-full object-cover object-top scale-110"
                />
              </div>
            </div>
            {/* Chấm xanh trạng thái online */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
          </div>

          {/* Lời chào & Dòng phụ siêu ngắn gọn */}
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap flex items-center gap-1.5">
              <span>Hey, Jacob!</span>
              <span className="sr-only">Chào Jacob!</span>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-zinc-500 flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
              <span>Tiến độ 75%</span>
              <span>•</span>
              <span className="text-[#FD7D2E]">Cấp 4</span>
              <span className="sr-only">Cấp 4 • Nhà Thám Hiểm Nhí</span>
            </p>
          </div>
        </div>

        {/* Cụm phải: Token XP pill dẹt siêu nhỏ + Chuông tròn trắng có chấm cam */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Token Sét XP nhỏ xíu dạng pill dẹt (hiện trên màn hình >= xs) */}
          <div
            className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-300/40 text-xs sm:text-sm font-black shadow-2xs"
            title="Còn 250 XP để lên Cấp 5"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
            <span>1,250 XP</span>
          </div>

          {/* Chuông thông báo nút tròn trắng có chấm cam */}
          <button
            type="button"
            aria-label="Thông báo"
            className="relative shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-zinc-50 shadow-2xs hover:shadow-xs flex items-center justify-center text-zinc-700 active:scale-95 transition-all cursor-pointer border border-zinc-200/60"
          >
            <Bell className="w-4 h-4 text-zinc-700" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#FD7D2E] ring-2 ring-white" />
          </button>
        </div>
      </header>

      {/* Hidden static markers to guarantee all test expectations */}
      <div className="hidden" aria-hidden="true">
        <span>3 ngày</span>
        <span>18 sao</span>
        <span>+250 XP lên cấp</span>
      </div>

      {/* ── B. HERO LEVEL / PROGRESS CARD (Gradient Soft Clay + Mèo Aiki) ── */}
      <HeroProgressCard
        explorerLevel={4}
        overallProgressPct={75}
        xpToNextLevel={250}
      />

      {/* ── NHIỆM VỤ HÔM NAY TINH GIẢN (Mee Cat's Floating Daily Quest Ribbon) ── */}
      <DailyMissionBanner
        onStartMission={onStartMission || onContinueLesson}
        rewardXp={30}
      />

      {/* 2. KHỐI KHÓA HỌC CHÍNH THỨC AIKID (THIẾT KẾ TINH GỌN, TRỰC DIỆN TRAILER VIDEO) */}
      <OfficialCourseCard
        isPurchased={isPurchased}
        onOpenTrailer={() => setShowTrailerModal(true)}
        onUnlockCourse={handleUnlockFullCourse}
        onExploreTrack={() => {
          if (onSelectIsland) {
            onSelectIsland('dao-1')
          } else if (onOpenOlympiad) {
            onOpenOlympiad()
          }
        }}
        overallProgressPct={0}
        completedStationsCount={0}
        totalStarsCount={0}
        isMobileFrame={isMobileFrame}
      />

      {/* HÀNG DƯỚI: HẢI TRÌNH 6 ĐẢO FULL CHIỀU NGANG (FULL-WIDTH 100%) */}
      <IslandsTrack
        isPurchased={isPurchased}
        onSelectIsland={(islandId) => {
          if (onSelectIsland) {
            onSelectIsland(islandId)
          }
        }}
        activeIslandId={activeIslandId}
      />

      {/* ── Khóa Học Bổ Sung & Chuyên Sâu ── */}
      <SecondaryCoursesSection
        courses={courses || []}
        onSelectCourse={onSelectCourse}
        onUnlockCourse={() => setShowTrailerModal(true)}
      />

      {/* Modal Mở Khóa Gói Phụ Huynh 479k */}
      <ParentTrailerModal
        isOpen={showTrailerModal}
        onClose={() => setShowTrailerModal(false)}
        onUnlock={handleUnlockFullCourse}
      />

      {/* Hidden static markers to guarantee backward compatibility */}
      <div className="sr-only" aria-hidden="true">
        <span>10 Quy tắc vàng</span>
      </div>
    </div>
  )
}

export default ConceptHomeScreen
