import React, { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/Button'
import { Star, Lock, Play, CheckCircle2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { AIKID_SIX_ISLANDS_CONFIG, getCourseStationCount, type PathwayCourse } from '../pages/WorldPage'
import { STATIONS_BY_ISLAND, type StationItem } from '@/features/concept/components/ConceptIslandStationScreen'

export interface ArchipelagoGameVoyageProps {
  courses?: PathwayCourse[]
  onLockedClick?: (course: PathwayCourse) => void
}

const getDynamicIslandPositions = (count: number) => {
  const positions = []
  for (let i = 0; i < count; i++) {
    const blockIndex = Math.floor(i / 6)
    const posInBlock = i % 6
    let localX = 0
    let localY = 0
    if (posInBlock === 0) { localX = 18; localY = 34 }
    else if (posInBlock === 1) { localX = 50; localY = 24 }
    else if (posInBlock === 2) { localX = 82; localY = 34 }
    else if (posInBlock === 3) { localX = 82; localY = 72 }
    else if (posInBlock === 4) { localX = 50; localY = 80 }
    else if (posInBlock === 5) { localX = 18; localY = 72 }
    
    const numBlocks = Math.max(1, Math.ceil(count / 6))
    const globalX = (blockIndex * 100 + localX) / numBlocks
    positions.push({ x: globalX, y: localY })
  }
  return positions
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
  const numBlocks = Math.max(1, Math.ceil(numIslands / 6))
  const islandPositions = getDynamicIslandPositions(numIslands)

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

  const islandKey = selectedIslandConfig.slug || `dao-${selectedIdx + 1}`
  const serverStations = selectedCourse?.stations ?? []
  const fallbackStations = STATIONS_BY_ISLAND[islandKey] || STATIONS_BY_ISLAND['dao-1'] || []
  const rawStations: VoyageStationItem[] = serverStations.length > 0
    ? serverStations.map((station, index) => ({
        id: station.id,
        number: station.order || index + 1,
        code: `TRẠM ${station.order || index + 1}`,
        title: station.title,
        subtitle: station.hook || station.skill || 'Nhiệm vụ sáng tạo',
        stars: 3,
        xp: station.xpEarned || 50,
        status: station.status === 'completed'
          ? 'completed'
          : station.status === 'in_progress' || station.status === 'available'
            ? 'current'
            : 'locked',
        slug: station.slug,
        isBossArena: false,
      }))
    : fallbackStations.map((st) => ({
        ...st,
        slug: undefined,
      }))
  
  const stationsList = rawStations.map((st, index) => {
    let status: 'locked' | 'completed' | 'current' = st.status
    if (selectedStatus === 'completed') {
      status = 'completed'
    } else if (selectedStatus === 'active') {
      const completedCount = selectedCourse?.completedCount || 0
      if (index < completedCount) status = 'completed'
      else if (index === completedCount) status = 'current'
    }

    let stationUrl = '#'
    if (st.slug) {
      stationUrl = `/world/${selectedIslandConfig.canonicalSlug || targetSlug}/lesson/${st.slug}`
    } else if ((islandKey as string) === 'muoi-quy-tac-xuong-sang-tao' || islandKey === 'dao-1') {
      stationUrl = `/world/muoi-quy-tac-xuong-sang-tao/lesson/rule-${st.number}`
    } else {
      stationUrl = `/world/${selectedIslandConfig.canonicalSlug || targetSlug}/lesson/bai-${selectedIdx}-${st.number}`
    }

    return { ...st, status, stationUrl }
  })

  const completedStationCount = stationsList.filter(s => s.status === 'completed').length
  const progressPercent = stationsList.length > 0 ? Math.round((completedStationCount / stationsList.length) * 100) : 0
  const islandMaxStars = Math.max(0, (selectedCourse ? getCourseStationCount(selectedCourse) : stationsList.length) * 3)
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

      {/* Canvas Bản Đồ Hải Trình Biển */}
      <div
        className="relative w-full rounded-[2rem] border-[6px] border-sky-100/50 bg-gradient-to-b from-sky-200 via-teal-100 to-cyan-200 shadow-inner mt-2 overflow-x-auto overflow-y-hidden scrollbar-none"
        style={{ height: 530 }}
      >
        <div 
          className="relative h-full"
          style={{ width: `${Math.max(100, numBlocks * 100)}%`, minWidth: '700px' }}
        >
          {/* Lớp sóng ngầm tự nhiên */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
          
          {/* Danh sách 6 Đảo */}
          {islandPositions.map((pos, idx) => {
            const course = courses?.[idx]
            const status = course ? course.status : (idx === 0 ? 'completed' : (idx === 1 ? 'active' : 'locked'))
            const islandConfig = AIKID_SIX_ISLANDS_CONFIG[idx % AIKID_SIX_ISLANDS_CONFIG.length]
            const isSelected = selectedIdx === idx
            const isActiveBoat = idx === primaryActiveIdx

            return (
              <button
                key={`island-${idx}`}
                id={`island-${idx + 1}`}
                onClick={() => setSelectedIdx(idx)}
                className="absolute w-32 h-32 -translate-x-1/2 -translate-y-1/2 group transition-all duration-500 hover:scale-105 hover:z-30 cursor-pointer"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  zIndex: isSelected ? 40 : (isActiveBoat ? 35 : (30 - idx)),
                }}
              >
                {/* Hiệu ứng chọn đảo */}
                {isSelected && (
                  <span className="absolute inset-0 rounded-full bg-white/40 animate-ping opacity-75 scale-125 z-0" />
                )}
                
                {/* Artwork Đảo */}
                <div className={cn(
                  "relative w-full h-full z-10 transition-transform duration-500 rounded-full overflow-hidden border-4 bg-white shadow-clay", 
                  isSelected ? 'scale-110 drop-shadow-2xl border-orange-400 ring-4 ring-orange-200' : 'drop-shadow-lg border-white'
                )}>
                  <img
                    src={islandConfig.scene || (islandConfig as any).artwork}
                    alt={islandConfig.title}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-500",
                      status === 'locked' && "opacity-60 grayscale hover:grayscale-0 hover:opacity-100",
                      isSelected && "brightness-110"
                    )}
                  />
                  
                  {status === 'completed' && (
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm border-2 border-emerald-200 z-20 scale-90">
                      <CheckCircle2 size={24} className="text-emerald-500" />
                    </div>
                  )}
                  {status === 'locked' && (
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm border-2 border-slate-200 z-20 scale-90">
                      <Lock size={20} className="text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Nhãn tên Đảo */}
                <div className={cn(
                  "absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-2xl text-[11px] font-black shadow-sm border transition-all z-20",
                  isSelected 
                    ? "bg-white text-orange-500 border-orange-200 scale-110 shadow-md" 
                    : (status === 'locked' ? "bg-slate-50/80 text-slate-500 border-slate-200/50 backdrop-blur-sm" : "bg-white/95 text-slate-700 border-slate-200 backdrop-blur-sm")
                )}>
                  Đảo {idx + 1}: {islandConfig.title.replace('Đảo ', '')}
                </div>

                {/* Thuyền Mèo Mee neo đậu */}
                {isActiveBoat && (
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-30 animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full mb-0.5 whitespace-nowrap shadow-md">
                      Thuyền Mèo Mee
                    </div>
                    <img 
                      src="/assets/aikid-ui/mascot-original/course-wave.webp" 
                      alt="Thuyền Mèo Mee" 
                      className="w-14 h-14 drop-shadow-md object-contain" 
                    />
                  </div>
                )}
                
                {/* Ổ khóa Đảo */}
                {status === 'locked' && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-90 drop-shadow-md">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 flex items-center justify-center border-[3px] border-amber-200/50">
                      <Lock size={20} className="text-white" />
                    </div>
                  </div>
                )}
                
                {status === 'locked' && (
                  <div className="absolute inset-0 bg-white/20 rounded-full z-10 backdrop-blur-xs" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sân Khấu Lớn Của Đảo Được Chọn (Diorama Stage) */}
      <div className="w-full ui-card p-5 sm:p-7 rounded-[2rem] shadow-clay flex flex-col gap-6 bg-white border-2 border-slate-100 mt-2">
        <div className="flex flex-col md:flex-row items-stretch gap-5 sm:gap-6 bg-gradient-to-br from-slate-50/90 via-indigo-50/30 to-amber-50/20 p-4 sm:p-5 rounded-[2rem] border border-slate-200/80 shadow-soft">
          {/* Ảnh cảnh quan đảo */}
          <div className="relative w-full sm:w-64 md:w-72 aspect-[16/10] shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 shadow-md border-2 border-white">
            <img
              src={selectedIslandConfig.scene}
              alt={selectedIslandConfig.title}
              className={cn(
                "w-full h-full object-cover transition-transform duration-500 hover:scale-105",
                selectedStatus === 'locked' && 'opacity-80 grayscale'
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl font-black text-xs shadow-soft text-slate-800 border border-slate-100/80 flex items-center gap-1.5">
              <span>{selectedIslandConfig.badge}</span>
            </div>
            
            {selectedStatus === 'active' && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2.5 py-1 rounded-xl font-black text-xs shadow-soft flex items-center gap-1">
                <span>Đang Neo Đậu</span>
              </div>
            )}
            {selectedStatus === 'completed' && (
              <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2.5 py-1 rounded-xl font-black text-xs shadow-soft flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã Xong</span>
              </div>
            )}
            {selectedStatus === 'locked' && (
              <div className="absolute top-3 right-3 bg-slate-800/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl font-black text-xs shadow-soft flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Khóa</span>
              </div>
            )}
            
            <div className="absolute bottom-3 right-3 bg-amber-400 text-amber-950 px-2.5 py-1 rounded-xl font-black text-xs shadow-soft flex items-center gap-1">
              <Star size={14} className="fill-amber-950" />
              <span>{displayStars}/{islandMaxStars} Sao</span>
            </div>
          </div>

          {/* Chi tiết nội dung hòn đảo */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
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
                {selectedIslandConfig.title} — {selectedIslandConfig.subtitle}
              </h3>

              <p className="font-semibold text-slate-600 mt-1.5 text-xs sm:text-sm leading-relaxed line-clamp-2">
                {selectedIslandConfig.description}
              </p>
            </div>

            {/* Thanh tiến độ */}
            <div className="mt-3 pt-3 border-t border-slate-200/60">
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

        {/* Lộ trình các trạm học của đảo */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2.5">
              <div>
                <h4 className="font-display font-black text-lg sm:text-xl text-slate-900 leading-tight">
                  Lộ Trình Trạm Học: {selectedIslandConfig.title}
                </h4>
                <p className="text-xs font-semibold text-slate-500">
                  Chinh phục từng trạm thực hành để tích lũy XP
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black border border-slate-200/60">
                {stationsList.length} trạm
              </span>
              {completedStationCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200/60">
                  {completedStationCount} hoàn thành
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {stationsList.map((station) => {
              const isCompleted = station.status === 'completed'
              const isCurrent = station.status === 'current'
              const isLocked = station.status === 'locked'

              return (
                <div
                  key={station.id}
                  className={cn(
                    "relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl transition-all bg-white border-2",
                    isCurrent
                      ? "border-orange-400 ring-2 ring-orange-100 shadow-md bg-gradient-to-b from-orange-50/20 to-white"
                      : isCompleted
                        ? "border-slate-100 hover:border-slate-200 hover:shadow-md shadow-sm"
                        : "border-slate-100 opacity-75 hover:opacity-90"
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 transition-transform shadow-sm",
                            isCompleted
                              ? "bg-emerald-500 text-white"
                              : isCurrent
                                ? "bg-orange-500 text-white ring-4 ring-orange-100"
                                : "bg-slate-100 text-slate-400 border border-slate-200"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : isCurrent ? (
                            <span>{station.number}</span>
                          ) : (
                            <Lock className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                            {(station.code || `TRẠM ${station.number}`).toUpperCase()}
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>ĐÃ XONG</span>
                              </span>
                            )}
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black shadow-sm animate-pulse">
                                <span>ĐANG HỌC</span>
                              </span>
                            )}
                            {isLocked && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
                                <Lock className="w-2.5 h-2.5" />
                                <span>KHÓA</span>
                              </span>
                            )}
                            {station.isBossArena && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
                                <span>ĐẤU TRƯỜNG</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCompleted && (
                          <div className="flex items-center gap-0.5 text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          </div>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-xs font-black border border-orange-100">
                          +{station.xp} XP
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                        {station.title}
                      </h5>
                      <p className="text-xs sm:text-[13px] font-medium text-slate-600 leading-relaxed mt-1 line-clamp-2">
                        {station.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100/80">
                    {isCurrent && (
                      <Link to={station.stationUrl} className="block w-full">
                        <button
                          type="button"
                          className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#FD7D2E] to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-black shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Vào Học Ngay</span>
                        </button>
                      </Link>
                    )}
                    {isCompleted && (
                      <Link to={station.stationUrl} className="block w-full">
                        <button
                          type="button"
                          className="w-full min-h-[40px] px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-black text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/80 border border-indigo-200/60 inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 bg-indigo-50/30"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ôn lại trạm này</span>
                        </button>
                      </Link>
                    )}
                    {isLocked && (
                      <button
                        type="button"
                        disabled={!onLockedClick || !selectedCourse}
                        onClick={() => {
                          if (onLockedClick && selectedCourse) onLockedClick(selectedCourse)
                        }}
                        className={cn(
                          "w-full min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 bg-slate-100/80 border border-slate-200 inline-flex items-center justify-center gap-1.5 transition-all",
                          onLockedClick && selectedCourse ? "cursor-pointer hover:bg-slate-200/80 hover:text-slate-600" : "cursor-not-allowed opacity-80"
                        )}
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Chưa mở khóa</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
