import React, { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/Button'
import { Star, Lock, Play, CheckCircle2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { AIKID_SIX_ISLANDS_CONFIG, getCourseStationCount, type PathwayCourse } from '../pages/WorldPage'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import { ISLAND_CURRICULUM_LESSONS } from '@/features/lesson/data/island-curriculum-registry'

export interface ArchipelagoGameVoyageProps {
  courses?: PathwayCourse[]
  onLockedClick?: (course: PathwayCourse) => void
}

export function ArchipelagoGameVoyage({ courses, onLockedClick }: ArchipelagoGameVoyageProps) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  let totalStars = 0
  let totalStations = 0
  
  if (courses && courses.length > 0) {
    courses.forEach(c => {
      totalStars += c.totalStars || 0
      totalStations += getCourseStationCount(c)
    })
  }

  const numIslands = Math.max(courses?.length || 6, 2)
  const selectedIslandConfig = AIKID_SIX_ISLANDS_CONFIG[selectedIdx % AIKID_SIX_ISLANDS_CONFIG.length]
  const selectedCourse = courses?.[selectedIdx]
  const targetSlug = selectedCourse?.slug || selectedCourse?.id || `dao-${selectedIdx + 1}`

  const selectedStatus = selectedCourse ? selectedCourse.status : (selectedIdx === 0 ? 'completed' : (selectedIdx === 1 ? 'active' : 'locked'))
  const activeBoatIdx = courses ? courses.findIndex(c => c.status === 'active') : 1
  const primaryActiveIdx = activeBoatIdx >= 0 ? activeBoatIdx : 1

  interface VoyageStationItem {
    id: string
    number: number
    code?: string
    title: string
    subtitle: string
    status: 'completed' | 'current' | 'locked'
    stars?: number
    xp: number
    isBossArena?: boolean
    slug?: string
  }

  let rawStations: VoyageStationItem[] = []
  if (selectedIdx === 0) {
    rawStations = AIKI_RULES_DATA.slice(0, 10).map((rule, index) => ({
      id: `rule-${rule.id}`,
      number: index + 1,
      code: `TRẠM ${index + 1}`,
      title: rule.shortTitle || rule.title,
      subtitle: rule.skill || rule.goal || 'Nhiệm vụ sáng tạo',
      stars: 3,
      xp: 50,
      status: 'locked',
      slug: `rule-${rule.id}`,
      isBossArena: false,
    }))
  } else {
    const prefix = `${selectedIdx}.`
    const lessons = ISLAND_CURRICULUM_LESSONS.filter(l => l.lessonNumber.startsWith(prefix))
    rawStations = lessons.map((lesson, index) => ({
      id: lesson.id,
      number: index + 1,
      code: `TRẠM ${index + 1}`,
      title: lesson.title.includes('—') ? lesson.title.split('—')[1].trim() : lesson.title,
      subtitle: lesson.skillLearned || lesson.subtitle || 'Nhiệm vụ sáng tạo',
      stars: 3,
      xp: 50,
      status: 'locked',
      slug: lesson.slug,
      isBossArena: false,
    }))
  }
  
  const stationsList = rawStations.map((st, index) => {
    let status: 'locked' | 'completed' | 'current' = 'locked'
    if (selectedStatus === 'completed') {
      status = 'completed'
    } else if (selectedStatus === 'active') {
      const completedCount = selectedCourse?.completedCount || 0
      if (index < completedCount) status = 'completed'
      else if (index === completedCount) status = 'current'
    }

    let stationUrl = '#'
    if (selectedIdx === 0) {
      stationUrl = `/world/muoi-quy-tac-xuong-sang-tao/lesson/rule-${st.number}`
    } else {
      stationUrl = `/world/${selectedIslandConfig.canonicalSlug || targetSlug}/lesson/${st.slug}`
    }

    return { ...st, status, stationUrl }
  })

  const completedStationCount = stationsList.filter(s => s.status === 'completed').length
  const progressPercent = stationsList.length > 0 ? Math.round((completedStationCount / stationsList.length) * 100) : 0
  const islandMaxStars = stationsList.length * 3
  const displayStars = selectedCourse?.totalStars ?? (selectedStatus === 'completed' ? islandMaxStars : completedStationCount * 3)

  const activeStation = stationsList.find(s => s.status === 'current') || stationsList[0]

  const getPrimaryActionHref = () => {
    if (selectedStatus === 'locked') return '#'
    return activeStation?.stationUrl || `/world/${targetSlug}`
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Cụm Header Hải Trình AIKids */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
            Hải Trình 6 Đảo Sáng Tạo
          </h2>
          <p className="text-slate-500 font-semibold mt-1">
            Cùng Mèo Mee khám phá thế giới AI!
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-[2rem] bg-indigo-50 text-indigo-700 font-black text-sm shadow-sm border border-indigo-200/50">
            1 Đảo Quy Tắc + 5 Đảo Học AI
          </div>
          <div className="px-4 py-2 rounded-[2rem] bg-amber-50 text-amber-700 font-black text-sm shadow-sm border border-amber-200/50 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {totalStars} Sao
          </div>
          <div className="px-4 py-2 rounded-[2rem] bg-slate-100/80 text-slate-700 font-black text-sm shadow-sm border border-slate-200/50">
            {totalStations} Trạm
          </div>
        </div>
      </div>

      {/* Băng Chuyền Các Thẻ Đảo To Vuốt Ngang (Horizontal Carousel) - Không viền box, không background */}
      <div className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 pb-4 scrollbar-none w-full">
        {Array.from({ length: numIslands }).map((_, idx) => {
          const course = courses?.[idx]
          const status = course ? course.status : (idx === 0 ? 'completed' : (idx === 1 ? 'active' : 'locked'))
          const islandConfig = AIKID_SIX_ISLANDS_CONFIG[idx % AIKID_SIX_ISLANDS_CONFIG.length]
          const isSelected = selectedIdx === idx
          const isActiveBoat = idx === primaryActiveIdx

          const islandStationsCount = idx === 0 ? 10 : ISLAND_CURRICULUM_LESSONS.filter(l => l.lessonNumber.startsWith(`${idx}.`)).length
          const islandMaxStarsLocal = islandStationsCount * 3
          const completedLocal = course?.completedCount || 0
          const displayStarsLocal = course?.totalStars ?? (status === 'completed' ? islandMaxStarsLocal : completedLocal * 3)

          return (
            <button
              key={`island-${idx}`}
              id={`island-${idx + 1}`}
              onClick={() => setSelectedIdx(idx)}
              className="relative flex flex-col w-[280px] sm:w-[340px] md:w-[380px] shrink-0 snap-center transition-all duration-300 text-left bg-transparent border-0 group cursor-pointer"
            >
              {/* Khung Đảo Nổi Tự Do */}
              <div className="relative w-full h-34 sm:h-38 flex items-end justify-center pb-0 transition-all duration-300">
                <img
                  src={islandConfig.scene || (islandConfig as any).artwork}
                  alt={islandConfig.title}
                  className={cn(
                    "w-full h-full object-contain filter transition-all duration-500 select-none",
                    isSelected
                      ? "scale-105 drop-shadow-[0_16px_28px_rgba(253,125,46,0.35)] -translate-y-1 z-10"
                      : "drop-shadow-md group-hover:scale-102 group-hover:drop-shadow-xl group-hover:-translate-y-1",
                    status === 'locked' && "opacity-75 grayscale contrast-75 brightness-95"
                  )}
                />

                {/* Badges trên đảo */}
                <div className="absolute top-0 left-1 flex items-center gap-1.5 z-20">
                  <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl font-black text-xs shadow-xs text-slate-800 border border-slate-200/60">
                    {islandConfig.badge}
                  </div>
                  {isSelected && (
                    <div className="bg-[#FD7D2E] text-white px-2.5 py-1 rounded-xl font-black text-xs shadow-xs">
                      Đang Khám Phá
                    </div>
                  )}
                </div>

                {status === 'completed' && !isActiveBoat && (
                  <div className="absolute top-0 right-1 bg-emerald-500 text-white px-2.5 py-1 rounded-xl font-black text-xs shadow-xs flex items-center gap-1 z-20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã Xong</span>
                  </div>
                )}
                {status === 'locked' && (
                  <div className="absolute top-0 right-1 bg-slate-800/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl font-black text-xs shadow-xs flex items-center gap-1 z-20">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Khóa</span>
                  </div>
                )}

                {/* Thuyền Mèo Mee neo đậu */}
                {isActiveBoat && (
                  <div className="absolute -top-1 right-2 z-30 animate-bounce flex flex-col items-center" style={{ animationDuration: '3s' }}>
                    <div className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full mb-0.5 whitespace-nowrap shadow-xs text-center">
                      Thuyền Mèo Mee
                    </div>
                    <img
                      src="/assets/aikid-ui/mascot-original/course-wave.webp"
                      alt="Thuyền Mèo Mee"
                      className="w-13 h-13 drop-shadow-md object-contain mx-auto"
                    />
                  </div>
                )}

                {/* Ổ khóa 3D nhỏ tinh tế ở tâm đảo */}
                {status === 'locked' && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-200 to-slate-300 flex items-center justify-center border-2 border-white/50 shadow-sm opacity-90">
                      <Lock size={24} className="text-slate-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Khối chữ hộp nổi thay vì trong suốt */}
              <div className={cn(
                "w-full rounded-2xl p-4 transition-all duration-300 flex flex-col gap-2 text-left -mt-3 sm:-mt-5 relative z-10",
                isSelected
                  ? "bg-white border-2 border-orange-400 shadow-clay ring-2 ring-orange-200/50"
                  : "bg-white/90 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:bg-white"
              )}>
                <h3 className={cn(
                  "font-display font-black text-base sm:text-lg leading-snug transition-colors",
                  isSelected ? "text-[#FD7D2E]" : "text-slate-900"
                )}>
                  {islandConfig.title} — {islandConfig.subtitle}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                  {islandConfig.description}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-amber-700 bg-amber-50/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-amber-200/50 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{displayStarsLocal}/{islandMaxStarsLocal} Sao</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-slate-600 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-200/50 shadow-sm">
                    <span>{islandStationsCount} Trạm</span>
                  </div>
                </div>

                {/* Cầu nối thị giác bên trong thẻ đảo */}
                {isSelected && (
                  <div className="pt-2 border-t border-orange-100 flex items-center justify-between text-[11px] font-black text-[#FD7D2E]">
                    <span>Lộ trình chi tiết</span>
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px]">
                      Đang hiển thị bên dưới
                    </span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Lộ trình các trạm học của đảo - Journey Road Pathway */}
      <div className="w-full rounded-[2rem] bg-white/95 backdrop-blur-md p-5 sm:p-7 shadow-clay border-0 flex flex-col gap-6 mt-2">

        {/* Lộ Trình Header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 bg-gradient-to-br from-slate-50/90 via-indigo-50/30 to-amber-50/20 p-4 sm:p-6 rounded-[2rem] border border-slate-200/80 shadow-soft">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black tracking-wide">
                <span>{selectedIslandConfig.badge}: {selectedIslandConfig.title}</span>
              </span>
              {selectedStatus === 'active' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-black animate-pulse">
                  <span>Hành trình hiện tại</span>
                </span>
              )}
            </div>
            <h3 className="font-display font-black text-xl sm:text-2xl text-slate-900 leading-snug">
              Lộ Trình Trạm Học: {selectedIslandConfig.title}
            </h3>
            <p className="font-semibold text-slate-600 mt-1.5 text-sm">
              Khám phá và chinh phục từng trạm thực hành của {selectedIslandConfig.title} cùng Mèo Mee
            </p>

            {/* Thanh tiến độ */}
            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-xs font-black text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span>Tiến độ: {completedStationCount}/{stationsList.length} trạm xong</span>
                </span>
                <span className="text-orange-600 font-black">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Nút hành động chính */}
          <div className="w-full md:w-56 shrink-0 flex flex-col justify-center items-stretch gap-2.5 md:border-l md:border-slate-200/60 md:pl-5">
            <div className="text-center md:text-left text-xs font-bold text-slate-500">
              {selectedStatus === 'locked'
                ? 'Vượt thử thách trước để mở khóa!'
                : selectedStatus === 'completed'
                  ? 'Hoàn thành xuất sắc!'
                  : 'Khám phá ngay cùng Mèo Mee'}
            </div>

            {selectedStatus === 'locked' ? (
              <Button 
                type="button"
                onClick={() => {
                  if (onLockedClick && selectedCourse) onLockedClick(selectedCourse)
                }}
                variant="secondary" 
                className="w-full min-h-[44px] rounded-[1.5rem] font-black border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Xem Điều Kiện Mở</span>
              </Button>
            ) : selectedStatus === 'completed' ? (
              <Link to={getPrimaryActionHref()} className="w-full block">
                <Button 
                  type="button"
                  className="w-full min-h-[44px] rounded-[1.5rem] font-black bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white border-0 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>Thực Hành Lại</span>
                </Button>
              </Link>
            ) : (
              <Link to={getPrimaryActionHref()} className="w-full block">
                <Button 
                  type="button"
                  className="w-full min-h-[44px] rounded-[1.5rem] font-black bg-gradient-to-r from-[#FD7D2E] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Học Tiếp Ngay</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Bản Đồ Con Đường Lộ Trình Lõi */}
        <div className="relative mt-6 pt-4 pb-4 w-full max-w-4xl mx-auto">
          {/* Road Spine (Dải đường kết nối) */}
          <div className="absolute left-[20px] sm:left-1/2 sm:-translate-x-1/2 top-4 bottom-4 w-2 bg-slate-100 rounded-full border border-slate-200/50 shadow-inner z-0"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 sm:gap-x-16 gap-y-8 relative z-10">
            {stationsList.map((station, index) => {
              const isCompleted = station.status === 'completed'
              const isCurrent = station.status === 'current'
              const isLocked = station.status === 'locked'
              const isLeftCol = index % 2 === 0

              return (
                <div key={station.id} className="relative">
                  <div className={cn(
                    "ml-[60px] sm:ml-0 bg-white p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between h-full relative",
                    isCurrent ? "border-orange-400 shadow-clay ring-2 ring-orange-100 bg-gradient-to-br from-white to-orange-50/30" : isCompleted ? "border-slate-200 shadow-xs hover:shadow-md" : "border-slate-100 bg-slate-50/50"
                  )}>

                    {/* Milestone Circle Node */}
                    <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full shadow-sm",
                      "w-12 h-12 text-[15px] font-black transition-all",
                      "-left-[60px]", // Mobile: always relative left off the card
                      isLeftCol ? "sm:left-auto sm:-right-[48px]" : "sm:left-auto sm:-left-[48px]", // Desktop alignment to spine
                      isCompleted ? "bg-emerald-500 text-white" : isCurrent ? "bg-orange-500 text-white ring-4 ring-orange-200 animate-pulse" : "bg-slate-100 text-slate-400 border border-slate-200"
                    )}>
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : isLocked ? <Lock className="w-5 h-5" /> : station.number}
                    </div>

                    {/* Lesson Card Detail (Soft Clay Text) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {station.code}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-black text-white bg-orange-500 px-2 py-0.5 rounded-md shadow-xs animate-pulse">
                              ĐANG HỌC
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-500" /> {station.stars || 3}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                            +{station.xp} XP
                          </span>
                        </div>
                      </div>

                      <h5 className="text-base font-bold text-slate-900 leading-snug mb-1.5">
                        {station.title}
                      </h5>
                      {/* Sư phạm 100% không truncate */}
                      <p className="text-sm font-medium text-slate-600 leading-relaxed">
                        {station.subtitle}
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end">
                      {isCurrent ? (
                        <Link to={station.stationUrl}>
                          <Button className="h-9 px-4 rounded-xl bg-[#FD7D2E] hover:bg-orange-600 text-white font-black text-xs shadow-md border-0 gap-1.5 cursor-pointer">
                            <Play className="w-3.5 h-3.5 fill-white" /> Vào Học Ngay
                          </Button>
                        </Link>
                      ) : isCompleted ? (
                        <Link to={station.stationUrl}>
                          <Button variant="secondary" className="h-9 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-black text-xs gap-1.5 shadow-none cursor-pointer">
                            Ôn Lại
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" /> Chưa mở
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Đích Đến / Trophy Landmark */}
          <div className="relative mt-8 pt-4 pb-2 w-full flex sm:justify-center">
            {/* Cột nối đích */}
            <div className="absolute top-0 bottom-1/2 left-[20px] sm:left-1/2 sm:-translate-x-1/2 w-2 bg-gradient-to-b from-slate-200 to-amber-200 z-0"></div>

            <div className="relative z-10 w-full sm:w-[400px] bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 rounded-[2rem] p-4 sm:p-5 shadow-clay ml-[60px] sm:ml-0 flex items-center sm:flex-col sm:text-center gap-4 sm:gap-2">
               <div className="absolute top-1/2 sm:top-0 -translate-y-1/2 -left-[60px] sm:left-1/2 sm:-translate-x-1/2 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-md z-20">
                 <Star className="w-5 h-5 text-white fill-white" />
               </div>

               <div className="flex-1 sm:mt-6">
                 <h4 className="font-black text-amber-900 text-lg sm:text-xl leading-none">Đích Đến Hoàn Thành</h4>
                 <p className="text-sm font-semibold text-amber-700/80 mt-1.5 leading-snug">Chinh phục tất cả các trạm để nhận rương báu và cúp vàng!</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
