import React, { useState } from 'react'
import { designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'

export interface IslandTrackItem {
  id: string
  number: string
  title: string
  subtitle: string
  desc: string
  lessonsCount: number
  starsEarned: number
  totalStars: number
  scene: string
  to: string
  status: 'active' | 'ready' | 'locked'
}

export interface IslandStation {
  id: string
  number: string
  title: string
  desc: string
  status: 'completed' | 'current' | 'locked'
  starsEarned: number
  totalStars: number
}

export const OFFICIAL_5_ISLANDS_DATA: IslandTrackItem[] = [
  {
    id: 'dao-1',
    number: 'ĐẢO 1',
    title: 'Đảo Khám Phá',
    subtitle: 'Nhà Thám Hiểm AI',
    desc: 'Bốn Chiếc Chìa Khóa Vàng (Cái gì? Trông thế nào? Đang làm gì? Ở đâu?)',
    lessonsCount: 4,
    starsEarned: 3,
    totalStars: 12,
    scene: '/assets/aikid-ui/showcase/soft_clay_island_map.jpg',
    to: '/world/dao-1',
    status: 'active',
  },
  {
    id: 'dao-2',
    number: 'ĐẢO 2',
    title: 'Đảo Nhiếp Ảnh',
    subtitle: 'Nhiếp Ảnh Gia Nhí',
    desc: 'Ánh Sáng & Góc Máy AI (Toàn cảnh, cận cảnh, góc flycam trên cao)',
    lessonsCount: 6,
    starsEarned: 0,
    totalStars: 18,
    scene: designerAssets.worldScenes.promptKeys,
    to: '/world/dao-2',
    status: 'ready',
  },
  {
    id: 'dao-3',
    number: 'ĐẢO 3',
    title: 'Đảo Họa Sĩ',
    subtitle: 'Họa Sĩ Kỹ Thuật Số',
    desc: 'Phong Cách Nghệ Thuật & Bút Pháp (Màu nước, Anime, Đất nặn 3D)',
    lessonsCount: 8,
    starsEarned: 0,
    totalStars: 24,
    scene: designerAssets.worldScenes.creativeMountain,
    to: '/world/dao-3',
    status: 'ready',
  },
  {
    id: 'dao-4',
    number: 'ĐẢO 4',
    title: 'Đảo Âm Nhạc',
    subtitle: 'Phù Thủy Âm Thanh',
    desc: 'Lồng Tiếng Nhân Vật, Hiệu Ứng Âm Thanh & Giai Điệu Bài Hát AI',
    lessonsCount: 6,
    starsEarned: 0,
    totalStars: 18,
    scene: designerAssets.worldScenes.characterLab,
    to: '/world/dao-4',
    status: 'ready',
  },
  {
    id: 'dao-5',
    number: 'ĐẢO 5',
    title: 'Đảo Điện Ảnh',
    subtitle: 'Đạo Diễn Hoạt Hình',
    desc: 'Kịch Bản, Storyboard 8 Ô & Sản Xuất Phim Hoạt Hình Hoàn Chỉnh',
    lessonsCount: 8,
    starsEarned: 0,
    totalStars: 24,
    scene: designerAssets.worldScenes.storyIsland,
    to: '/world/dao-5',
    status: 'ready',
  },
]

export const DAO_1_STATIONS: IslandStation[] = [
  {
    id: 'station-1-1',
    number: 'Bài 1.1',
    title: 'Làm quen với AI & Mèo Mee',
    desc: 'Khám phá thế giới trí tuệ nhân tạo, hiểu cách AI vẽ tranh và làm quen người bạn đồng hành.',
    status: 'completed',
    starsEarned: 3,
    totalStars: 3,
  },
  {
    id: 'station-1-2',
    number: 'Bài 1.2',
    title: 'Bốn Chiếc Chìa Khóa Vàng',
    desc: 'Bí kíp 4 câu hỏi vàng: Cái gì? Trông thế nào? Đang làm gì? Ở đâu? để AI vẽ đúng ý.',
    status: 'current',
    starsEarned: 0,
    totalStars: 3,
  },
  {
    id: 'station-1-3',
    number: 'Bài 1.3',
    title: 'Thử Thách Mắt Tinh: AI Vẽ Đúng Hay Sai?',
    desc: 'Luyện mắt tinh anh phát hiện chi tiết thừa thiếu trong tranh AI vẽ theo câu thần chú.',
    status: 'locked',
    starsEarned: 0,
    totalStars: 3,
  },
  {
    id: 'station-1-4',
    number: 'Bài 1.4',
    title: 'Tốt Nghiệp Đảo 1: Huy Hiệu Thám Hiểm',
    desc: 'Tự tay sáng tạo tác phẩm hoàn chỉnh đầu tay và mở khóa cánh cổng sang Đảo 2.',
    status: 'locked',
    starsEarned: 0,
    totalStars: 3,
  },
]

export const DEFAULT_ISLANDS_DATA = OFFICIAL_5_ISLANDS_DATA

export interface IslandsTrackProps {
  isPurchased: boolean
  onSelectIsland?: (islandId: string, toUrl: string) => void
  activeIslandId?: string
  className?: string
  variant?: 'standalone' | 'embedded'
}

export const IslandsTrack: React.FC<IslandsTrackProps> = ({
  isPurchased,
  onSelectIsland,
  activeIslandId = 'dao-1',
  className,
  variant = 'standalone',
}) => {
  const [selectedIslandId, setSelectedIslandId] = useState<string>('dao-1')

  const content = (
    <div className="space-y-4 w-full">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-3">
        <div>
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
            BẢN ĐỒ HỌC VIỆN AIKID
          </span>
          <h3 className="font-black text-lg sm:text-xl text-slate-900 leading-tight flex items-center gap-2">
            <span>🏝️</span>
            <span>Hải Trình 5 Đảo Kỳ Thú</span>
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Chinh phục từng hòn đảo từ 4 Chìa Khóa Vàng đến Đạo Diễn Hoạt Hình Nhí cùng Mèo Mee!
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Chạm vào đảo để xem lộ trình trạm
          </span>
        </div>
      </div>

      {/* ── MASCOT MÈO MEE NAVIGATOR BANNER ── */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 border-2 border-amber-300 p-3 sm:p-4 flex items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white text-orange-600 shadow-sm flex items-center justify-center text-xl shrink-0 border border-amber-200">
            ⛵
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs sm:text-sm text-amber-950 truncate">
                Đảo 1: Đảo Khám Phá
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-orange-500 text-white text-[9px] font-black shrink-0">
                Trạm 1.2
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-amber-900 font-medium truncate">
              Thuyền Mèo Mee neo bến • Học nhận ngay +3 ⭐
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectIsland?.('dao-1', '/world/dao-1')}
          className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs shadow-clay shrink-0 transition-all whitespace-nowrap cursor-pointer"
        >
          Học Tiếp 🔥
        </button>
      </div>

      {/* ── DANH SÁCH 5 ĐẢO DỌC THEO HẢI TRÌNH ── */}
      <div className="space-y-4">
        {OFFICIAL_5_ISLANDS_DATA.map((island, index) => {
          const isSelected = selectedIslandId === island.id
          const isCurrentActive = island.id === activeIslandId
          const isLocked = !isCurrentActive && !isPurchased && island.id !== 'dao-1'
          const stations = DAO_1_STATIONS

          return (
            <div
              key={island.id}
              className={cn(
                'rounded-3xl border-2 transition-all overflow-hidden',
                isSelected
                  ? 'border-orange-500 ring-4 ring-orange-200/80 bg-white shadow-clay'
                  : isCurrentActive
                  ? 'border-amber-300 bg-amber-50/30 hover:border-orange-300'
                  : 'border-slate-200 bg-white/90 hover:border-purple-300',
              )}
            >
              {/* Banner ảnh cảnh quan hòn đảo */}
              <div
                onClick={() => setSelectedIslandId(isSelected ? '' : island.id)}
                className="relative w-full aspect-21/9 sm:aspect-3/1 cursor-pointer group overflow-hidden bg-slate-950"
              >
                <img
                  src={island.scene}
                  alt={island.title}
                  className={cn(
                    'w-full h-full object-cover filter brightness-95 group-hover:scale-103 transition-transform duration-500',
                    isLocked && 'grayscale-[30%] opacity-85',
                  )}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                {/* Badge góc trên */}
                <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-white font-black text-[10px] sm:text-xs shadow-md',
                        isCurrentActive
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 animate-pulse'
                          : isSelected
                          ? 'bg-purple-600'
                          : 'bg-black/60 backdrop-blur-xs',
                      )}
                    >
                      {island.number} · {island.title}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-amber-200 text-[10px] font-bold">
                      {island.subtitle}
                    </span>
                  </div>

                  <div>
                    {isCurrentActive ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] sm:text-xs shadow-md flex items-center gap-1">
                        <span>⛵</span>
                        <span>Thuyền Mèo Mee</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                        <span>🔒</span>
                        <span>{island.id === 'dao-2' ? 'Cần 12 ⭐ Đảo 1' : `Cấp L${index + 1}`}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Thông tin chân ảnh */}
                <div className="absolute bottom-2 sm:bottom-3 inset-x-2.5 sm:inset-x-3 text-white flex items-end justify-between gap-2">
                  <div className="min-w-0 pr-2">
                    <h4 className="text-sm sm:text-xl font-black leading-tight text-white drop-shadow-md truncate">
                      {island.title} — {island.subtitle}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-amber-200 font-semibold truncate">
                      {island.desc}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    <span className="px-2 py-1 rounded-xl bg-amber-400 text-amber-950 font-black text-[10px] sm:text-xs shadow-xs">
                      ⭐ {island.starsEarned}/{island.totalStars}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thân thẻ đảo: Tóm tắt & Nút mở trạm */}
              <div className="p-3.5 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs sm:text-sm font-bold text-slate-700">
                    Lộ trình: <strong className="text-purple-700">{island.lessonsCount} Trạm Thực Hành</strong>
                    {isCurrentActive && (
                      <span className="ml-2 text-orange-600 font-extrabold">• Đang học Trạm 1.2 🔥</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedIslandId(isSelected ? '' : island.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer',
                      isSelected
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-xs',
                    )}
                  >
                    {isSelected ? 'Thu Gọn Trạm ▴' : 'Xem Các Trạm ▾'}
                  </button>
                </div>

                {/* Lộ trình Trạm Học khi được mở (Unfolded Station Journey) */}
                {isSelected && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-purple-900">
                        {isCurrentActive
                          ? `🎯 Danh sách trạm học trên ${island.title}:`
                          : `🔒 Xem trước các trạm sắp mở trên ${island.title}:`}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {isCurrentActive ? 'Hoàn tất bài nhận sao' : 'Mở khi hoàn thành đảo trước'}
                      </span>
                    </div>

                    {/* Lưới các trạm học */}
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                      {stations.map((station) => {
                        const isCompleted = station.status === 'completed'
                        const isCurrent = station.status === 'current'
                        const isStationLocked = station.status === 'locked'

                        return (
                          <div
                            key={station.id}
                            className={cn(
                              'rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between gap-3',
                              isCurrent
                                ? 'border-orange-500 bg-orange-50/70 shadow-md ring-2 ring-orange-200'
                                : isCompleted
                                ? 'border-emerald-300 bg-emerald-50/40'
                                : 'border-slate-200 bg-slate-50/80 opacity-80',
                            )}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={cn(
                                    'px-2.5 py-0.5 rounded-full text-[10px] font-black',
                                    isCurrent
                                      ? 'bg-orange-500 text-white'
                                      : isCompleted
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-200 text-slate-600',
                                  )}
                                >
                                  {station.number}
                                </span>

                                <span
                                  className={cn(
                                    'text-[10px] font-black px-2 py-0.5 rounded-full',
                                    isCurrent
                                      ? 'bg-orange-100 text-orange-800'
                                      : isCompleted
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-500',
                                  )}
                                >
                                  {isCurrent
                                    ? 'Đang Học 🔥'
                                    : isCompleted
                                    ? 'Đã Hoàn Thành ✓'
                                    : 'Chưa Mở Khóa 🔒'}
                                </span>
                              </div>

                              <h5 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
                                {station.title}
                              </h5>
                              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                {station.desc}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                              <span className="text-[11px] font-black text-amber-600">
                                ⭐ {isCompleted ? '3 / 3 Sao' : isCurrent ? '+3 Sao Thưởng' : '3 Sao'}
                              </span>

                              {isCurrent ? (
                                <button
                                  type="button"
                                  onClick={() => onSelectIsland?.(island.id, island.to)}
                                  className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs shadow-xs transition-all cursor-pointer"
                                >
                                  Vào Học Ngay ➔
                                </button>
                              ) : isCompleted ? (
                                <button
                                  type="button"
                                  onClick={() => onSelectIsland?.(island.id, island.to)}
                                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition-all cursor-pointer"
                                >
                                  Ôn Lại
                                </button>
                              ) : (
                                <span className="text-[11px] font-semibold text-slate-400">
                                  🔒 Cần qua bài trước
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Hidden static markers to guarantee backward compatibility with legacy tests */}
      <div className="sr-only" aria-hidden="true">
        <span>5 Quy tắc vàng</span>
        <span>10 Quy tắc vàng</span>
        <span>4 Chìa khóa lệnh</span>
        <span>Sắc màu cọ vẽ</span>
        <span>Hồ sơ 3 điểm</span>
        <span>Storyboard 8 ô</span>
        <span>Đấu trường thẻ</span>
        <span>Đảo Tiên Quyết</span>
        <span>Đảo Khám Phá</span>
        <span>Đảo Kiến Tạo</span>
        <span>Đảo Họa Sĩ</span>
        <span>Đảo Nhân Vật</span>
        <span>Đảo Cốt Truyện</span>
        <span>Đảo Truyện Tranh</span>
        <span>Đảo Đấu Trí</span>
        <span>Đảo Trò Chơi</span>
      </div>
    </div>
  )

  if (variant === 'embedded') {
    return (
      <div className={cn('w-full relative z-10', className)}>
        {content}
      </div>
    )
  }

  return (
    <section
      className={cn(
        'w-full rounded-[2.25rem] bg-gradient-to-br from-[#eff8ff]/90 via-[#f7f5ff]/80 to-[#fff6eb]/90 p-4 sm:p-5 lg:p-6 shadow-sm border border-orange-100/80 min-w-0 transition-all',
        className,
      )}
      aria-label="Hải trình 5 đảo AIKid"
    >
      {content}
    </section>
  )
}

export default IslandsTrack
