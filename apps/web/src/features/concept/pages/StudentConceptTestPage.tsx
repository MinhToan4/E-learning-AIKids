import React, { useState } from 'react'
import {
  Smartphone,
  Maximize2,
  Sparkles,
  Info,
} from 'lucide-react'
import {
  KidHomeImageIcon,
  KidWorldImageIcon,
  KidCreativeImageIcon,
  KidProgressImageIcon,
} from '@/shared/components/icons/KidImageIcons'
import { designerAssets } from '@/shared/config/assets'
import { ConceptWelcomeScreen } from '../components/ConceptWelcomeScreen'
import { ConceptHomeScreen } from '../components/ConceptHomeScreen'
import { ConceptProgressScreen } from '../components/ConceptProgressScreen'
import { ConceptIslandStationScreen, ISLANDS_DATA } from '../components/ConceptIslandStationScreen'
import { ConceptLessonScreen } from '../components/ConceptLessonScreen'

export type ScreenTab = 'welcome' | 'home' | 'progress' | 'island_station' | 'lesson'
export type ViewMode = 'mobile' | 'full'

export interface StudentConceptTestPageProps {
  initialTab?: ScreenTab
  initialViewMode?: ViewMode
}

export const StudentConceptTestPage: React.FC<StudentConceptTestPageProps> = ({
  initialTab = 'welcome',
  initialViewMode = 'mobile',
}) => {
  const [activeTab, setActiveTab] = useState<ScreenTab>(initialTab)
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [showInfoBanner, setShowInfoBanner] = useState<boolean>(true)
  const [showReviewerBar, setShowReviewerBar] = useState<boolean>(true)
  const [selectedIslandId, setSelectedIslandId] = useState<string>('dao-2')

  const currentIsland = ISLANDS_DATA.find((i) => i.id === selectedIslandId) || ISLANDS_DATA[1]
  const currentIslandTitle =
    selectedIslandId === 'dao-1'
      ? 'Đảo 1: 10 Quy Tắc Vàng'
      : `${currentIsland.number}: ${currentIsland.title}`
  const currentStationTitle =
    selectedIslandId === 'dao-1'
      ? 'Trạm 1: Nghĩ Ý Tưởng Trước Khi Hỏi AI'
      : 'Trạm 3: Chìa Khóa Phong Cách'

  return (
    <div
      className="relative min-h-screen w-full text-zinc-900 flex flex-col items-center selection:bg-purple-200"
      style={{
        backgroundImage: 'url(/assets/optimized/lobby-bg-login.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Lớp phủ mềm mại thảo nguyên nắng ấm Soft Clay */}
      <div className="fixed inset-0 bg-white/40 backdrop-blur-[2px] pointer-events-none z-0" />

      {/* 1. TOP REVIEWER CONTROL BAR (Có thể thu gọn/ẩn để tôn vinh Master Menu học sinh bên dưới) */}
      {showReviewerBar ? (
        <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200/60 px-4 py-1.5 shadow-2xs">
          <div className="max-w-[1024px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            {/* Brand & Mini Badge */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-5 h-5 rounded-lg bg-[#FD7D2E] flex items-center justify-center text-white shadow-2xs">
                <Sparkles className="w-3 h-3 fill-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs tracking-tight text-zinc-800">
                  AIKID CONCEPT LAB 2026
                </span>
                <span className="hidden md:inline px-1.5 py-0.5 rounded-full bg-orange-100/80 text-[#FD7D2E] text-[10px] font-black uppercase tracking-wider">
                  Mee Cat Edition
                </span>
              </div>
            </div>

            {/* Screen Switch Tabs (5 Màn hình Concept) */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-zinc-100/90 overflow-x-auto no-scrollbar max-w-full">
              <button
                type="button"
                onClick={() => setActiveTab('welcome')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'welcome'
                    ? 'bg-white text-purple-700 shadow-2xs font-black'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                }`}
              >
                <span>📱</span>
                <span>Màn 1: Chào Mừng</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-white text-[#FD7D2E] shadow-2xs font-black'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                }`}
              >
                <span>🏠</span>
                <span>Màn 2: Trang Chủ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('progress')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'progress'
                    ? 'bg-white text-emerald-600 shadow-2xs font-black'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                }`}
              >
                <span>📊</span>
                <span>Màn 3: Tiến Độ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('island_station')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'island_station'
                    ? 'bg-white text-indigo-600 shadow-2xs font-black'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                }`}
              >
                <span>🏝️</span>
                <span>Màn 4: Bản Đồ Đảo &amp; Trạm</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('lesson')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'lesson'
                    ? 'bg-white text-amber-600 shadow-2xs font-black'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                }`}
              >
                <span>🚀</span>
                <span>Màn 5: Trải Nghiệm Học</span>
              </button>
            </div>

            {/* View Mode Toggle & Close Reviewer Button */}
            <div className="flex items-center gap-1 shrink-0">
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-zinc-100/90">
                <button
                  type="button"
                  onClick={() => setViewMode('mobile')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    viewMode === 'mobile'
                      ? 'bg-[#18181b] text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile Phone (390px)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('full')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    viewMode === 'full'
                      ? 'bg-[#18181b] text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Toàn màn hình</span>
                </button>
              </div>

              {/* Nút thu gọn thanh reviewer */}
              <button
                type="button"
                onClick={() => setShowReviewerBar(false)}
                className="w-7 h-7 rounded-lg hover:bg-zinc-200/70 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Thu gọn thanh Reviewer (để chỉ hiển thị thanh Menu của học sinh)"
                aria-label="Thu gọn thanh điều khiển Reviewer"
              >
                ✕
              </button>
            </div>
          </div>
        </header>
      ) : (
        /* Nút khôi phục thanh reviewer khi đã ẩn */
        <button
          type="button"
          onClick={() => setShowReviewerBar(true)}
          className="fixed top-3 right-4 z-50 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-zinc-200/80 text-[11px] font-bold text-zinc-700 hover:text-zinc-900 hover:bg-white transition-all cursor-pointer flex items-center gap-1.5"
          title="Mở lại thanh điều khiển Reviewer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FD7D2E]" />
          <span>Reviewer Bar</span>
        </button>
      )}

      {/* 2. Top Informational Pill Banner */}
      {showInfoBanner && (
        <div className="w-full max-w-[1024px] mx-auto px-4 pt-4">
          <div className="relative rounded-2xl bg-white/80 backdrop-blur-xs p-3.5 shadow-xs flex items-start justify-between gap-3 text-xs border border-purple-100/80">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-zinc-900">
                  Concept Test: Soft Clay + Stroke-less Minimalism + 5 Màn Hình Học Tập Đầy Đủ Thông Tin Thực Tế
                </span>
                <p className="text-zinc-500 leading-relaxed">
                  Trang chủ tích hợp Widget XP Jacob, Thẻ Nhiệm Vụ Hàng Ngày vàng bơ, Spotlight bài học dở, Bản đồ hiển thị đầy đủ trạm thật cho cả 6 đảo, Hộ chiếu thám hiểm và Khu vườn kỹ năng Montessori.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInfoBanner(false)}
              className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
              aria-label="Đóng thông báo"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN TEST WORKSPACE */}
      <main className="w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-6 pb-28">
        {viewMode === 'mobile' ? (
          /* MOBILE PHONE FRAME (iPhone 390px chassis) */
          <div className="relative w-full max-w-[390px] rounded-[52px] bg-zinc-950 p-3 shadow-2xl ring-1 ring-zinc-800/80 transition-all">
            {/* Phone Screen Bezel */}
            <div className="relative w-full min-h-[780px] max-h-[860px] rounded-[42px] bg-[#fbfaff] overflow-y-auto no-scrollbar flex flex-col p-3.5 pb-36 select-none">
              {/* Dynamic Island / Notch Mockup - Nền đặc không trong suốt */}
              <div className="sticky top-0 z-30 w-full flex items-center justify-between pt-3 pb-2 px-3 bg-[#fbfaff] border-b border-purple-100/50 shadow-2xs">
                <span className="text-[12px] font-black text-zinc-800">9:41</span>
                <div className="w-24 h-6 rounded-full bg-black shadow-xs flex items-center justify-end pr-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-700">5G</span>
                  <div className="w-5 h-2.5 rounded-sm border border-zinc-700 p-0.5 flex items-center">
                    <div className="w-3 h-full bg-zinc-700 rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* Active Screen Content inside Mobile Frame */}
              <div className="flex-1 flex flex-col min-w-0">
                {activeTab === 'welcome' && (
                  <ConceptWelcomeScreen
                    onStart={() => setActiveTab('home')}
                    onBack={() => setActiveTab('home')}
                  />
                )}
                {activeTab === 'home' && (
                  <ConceptHomeScreen
                    isMobileFrame={true}
                    onSelectIsland={(islandId) => {
                      setSelectedIslandId(islandId)
                      setActiveTab('island_station')
                    }}
                    onOpenOlympiad={() => {
                      setSelectedIslandId('dao-2')
                      setActiveTab('island_station')
                    }}
                    onOpenActivity={() => setActiveTab('progress')}
                    onContinueLesson={() => {
                      setSelectedIslandId('dao-2')
                      setActiveTab('lesson')
                    }}
                    onStartMission={() => {
                      setSelectedIslandId('dao-2')
                      setActiveTab('lesson')
                    }}
                  />
                )}
                {activeTab === 'progress' && (
                  <ConceptProgressScreen
                    isMobileFrame={true}
                    onCardClick={(cardId) => {
                      if (cardId === 'islands' || cardId === 'next_station') {
                        setSelectedIslandId('dao-2')
                        setActiveTab('island_station')
                      } else {
                        setActiveTab('home')
                      }
                    }}
                  />
                )}
                {activeTab === 'island_station' && (
                  <ConceptIslandStationScreen
                    isMobileFrame={true}
                    initialIslandId={selectedIslandId}
                    onBackToHome={() => setActiveTab('home')}
                    onSelectStation={(stationId, islandId) => {
                      setSelectedIslandId(islandId)
                      setActiveTab('lesson')
                    }}
                  />
                )}
                {activeTab === 'lesson' && (
                  <ConceptLessonScreen
                    isMobileFrame={true}
                    islandTitle={currentIslandTitle}
                    stationTitle={currentStationTitle}
                    onBackToRoadmap={() => setActiveTab('island_station')}
                    onCompleteStation={() => {
                      setActiveTab('island_station')
                    }}
                  />
                )}
              </div>

              {/* Bottom Phone Home Indicator Bar */}
              <div className="sticky bottom-0 z-20 w-full pt-2 pb-1 flex justify-center bg-gradient-to-t from-[#fbfaff] via-[#fbfaff]/90 to-transparent pointer-events-none">
                <div className="w-32 h-1 bg-zinc-300 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          /* FULL WIDTH RESPONSIVE VIEW (Tablet / Desktop Test) */
          <div className="w-full max-w-[1024px] mx-auto px-4 flex flex-col gap-4 min-w-0">
            {/* Container nội dung màn hình rộng rãi - Trong Suốt (Transparent) */}
            <div className="w-full bg-transparent min-w-0 p-0 sm:p-2 pb-24">
              {activeTab === 'welcome' && (
                <ConceptWelcomeScreen
                  onStart={() => setActiveTab('home')}
                  onBack={() => setActiveTab('home')}
                />
              )}
              {activeTab === 'home' && (
                <ConceptHomeScreen
                  isMobileFrame={false}
                  onSelectIsland={(islandId) => {
                    setSelectedIslandId(islandId)
                    setActiveTab('island_station')
                  }}
                  onOpenOlympiad={() => {
                    setSelectedIslandId('dao-2')
                    setActiveTab('island_station')
                  }}
                  onOpenActivity={() => setActiveTab('progress')}
                  onContinueLesson={() => {
                    setSelectedIslandId('dao-2')
                    setActiveTab('lesson')
                  }}
                  onStartMission={() => {
                    setSelectedIslandId('dao-2')
                    setActiveTab('lesson')
                  }}
                />
              )}
              {activeTab === 'progress' && (
                <ConceptProgressScreen
                  isMobileFrame={false}
                  onCardClick={(cardId) => {
                    if (cardId === 'islands' || cardId === 'next_station') {
                      setSelectedIslandId('dao-2')
                      setActiveTab('island_station')
                    } else {
                      setActiveTab('home')
                    }
                  }}
                />
              )}
              {activeTab === 'island_station' && (
                <ConceptIslandStationScreen
                  isMobileFrame={false}
                  initialIslandId={selectedIslandId}
                  onBackToHome={() => setActiveTab('home')}
                  onSelectStation={(stationId, islandId) => {
                    setSelectedIslandId(islandId)
                    setActiveTab('lesson')
                  }}
                />
              )}
              {activeTab === 'lesson' && (
                <ConceptLessonScreen
                  isMobileFrame={false}
                  islandTitle={currentIslandTitle}
                  stationTitle={currentStationTitle}
                  onBackToRoadmap={() => setActiveTab('island_station')}
                  onCompleteStation={() => {
                    setActiveTab('island_station')
                  }}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* 4. UNIFIED FLOATING DOCK CHO CẢ PC & MOBILE (THEO CHỈ ĐẠO CỦA SẾP) */}
      <nav
        aria-label="Floating Navigation Dock"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all animate-bounce-subtle"
      >
        <div className="student-floating-dock px-4 py-2.5 rounded-full bg-zinc-900/95 backdrop-blur-md shadow-[0_16px_36px_rgba(0,0,0,0.35)] border border-white/20 flex items-center gap-2.5">
          {/* Welcome Screen Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('welcome')}
            data-active={activeTab === 'welcome'}
            aria-label="Chào mừng"
            className="student-floating-tab w-13 h-13 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90"
            title="Màn 1: Chào Mừng"
          >
            <Sparkles className="w-6 h-6 text-purple-300" />
          </button>

          {/* Home Screen Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            data-active={activeTab === 'home'}
            aria-label="Trang chủ"
            className="student-floating-tab w-13 h-13 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90"
            title="Trang Chủ"
          >
            <KidHomeImageIcon size={32} />
          </button>

          {/* Island & Station Screen Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('island_station')}
            data-active={activeTab === 'island_station'}
            aria-label="Bản đồ Đảo & Trạm"
            className="student-floating-tab w-13 h-13 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90"
            title="Bản Đồ Đảo"
          >
            <KidWorldImageIcon size={32} />
          </button>

          {/* Creative Studio Screen Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('lesson')}
            data-active={activeTab === 'lesson'}
            aria-label="Xưởng Sáng Tạo AI"
            className="student-floating-tab w-13 h-13 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90"
            title="Xưởng Sáng Tạo"
          >
            <KidCreativeImageIcon size={32} />
          </button>

          {/* Progress / My Space Screen Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('progress')}
            data-active={activeTab === 'progress'}
            aria-label="Không gian của con"
            className="student-floating-tab w-13 h-13 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90"
            title="Không Gian Con"
          >
            <KidProgressImageIcon size={32} />
          </button>

          {/* Separator */}
          <div className="w-px h-6 bg-zinc-700/60 mx-1" />

          {/* Nút chuyển chế độ xem 390px / Toàn màn hình */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'mobile' ? 'full' : 'mobile')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-[11px] font-black text-zinc-200 transition-all cursor-pointer"
            title={viewMode === 'mobile' ? 'Chuyển sang Toàn màn hình' : 'Xem khung Mobile 390px'}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#FD7D2E]" />
            <span>{viewMode === 'mobile' ? 'Toàn màn hình' : '390px'}</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default StudentConceptTestPage
