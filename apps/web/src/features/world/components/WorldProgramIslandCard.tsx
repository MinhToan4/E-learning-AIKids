import React, { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Shield,
  Key,
  Palette,
  UserCheck,
  BookOpen,
  Gamepad2,
  Lock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Cloud,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { CuteProgress } from '@/shared/components/ui/CuteProgress'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { FlatClayIcon } from '@/features/asmo/components/AsmoFlatClayIcons'
import { designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'

export interface IslandMeta {
  id: string
  number: string
  title: string
  desc: string
  landmark: string
  scene: string
  icon: any
  accentColor: string
  shadowColor: string
}

export interface WorldProgramIslandCardProps {
  type: 'aikid' | 'asmo'
  totalProgress?: number
  completedStations?: number
  totalStations?: number
  completedCount?: number
  totalCourses?: number
  totalStars?: number
  islands?: IslandMeta[]
}

export const AIKID_ISLANDS_META: IslandMeta[] = [
  {
    id: '1',
    number: 'ĐẢO 1',
    title: 'Đảo Tiên Quyết',
    desc: '10 Quy tắc vàng',
    landmark: 'Xưởng AI & Khiên',
    scene: designerAssets.worldScenes.aiValley,
    icon: Shield,
    accentColor: 'from-violet-500 to-purple-600',
    shadowColor: 'shadow-violet-500/30',
  },
  {
    id: '2',
    number: 'ĐẢO 2',
    title: 'Đảo Khám Phá',
    desc: '4 Chìa khóa lệnh',
    landmark: 'Hải đăng & Chìa khóa',
    scene: designerAssets.worldScenes.promptKeys,
    icon: Key,
    accentColor: 'from-emerald-500 to-teal-600',
    shadowColor: 'shadow-emerald-500/30',
  },
  {
    id: '3',
    number: 'ĐẢO 3',
    title: 'Đảo Họa Sĩ',
    desc: 'Sắc màu cọ vẽ',
    landmark: 'Núi màu & Giá vẽ',
    scene: designerAssets.worldScenes.creativeMountain,
    icon: Palette,
    accentColor: 'from-amber-500 to-orange-600',
    shadowColor: 'shadow-amber-500/30',
  },
  {
    id: '4',
    number: 'ĐẢO 4',
    title: 'Đảo Nhân Vật',
    desc: 'Hồ sơ 3 điểm',
    landmark: 'Gương thần 6 biểu cảm',
    scene: designerAssets.worldScenes.characterLab,
    icon: UserCheck,
    accentColor: 'from-sky-500 to-blue-600',
    shadowColor: 'shadow-sky-500/30',
  },
  {
    id: '5',
    number: 'ĐẢO 5',
    title: 'Đảo Truyện Tranh',
    desc: 'Storyboard 8 ô',
    landmark: 'Lâu đài truyện tranh',
    scene: designerAssets.worldScenes.storyIsland,
    icon: BookOpen,
    accentColor: 'from-pink-500 to-rose-600',
    shadowColor: 'shadow-pink-500/30',
  },
  {
    id: '6',
    number: 'ĐẢO 6',
    title: 'Đảo Trò Chơi',
    desc: 'Đấu trường thẻ',
    landmark: 'Bàn cờ sao & Cúp vàng',
    scene: designerAssets.worldScenes.gameArena,
    icon: Gamepad2,
    accentColor: 'from-indigo-500 to-purple-600',
    shadowColor: 'shadow-indigo-500/30',
  },
]

export function WorldProgramIslandCard({
  type,
  totalProgress = 0,
  completedStations = 0,
  totalStations = 0,
  completedCount = 0,
  totalCourses = 6,
  totalStars = 0,
  islands = AIKID_ISLANDS_META,
}: WorldProgramIslandCardProps) {
  const navigate = useNavigate()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const currentIslandRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (type !== 'aikid') return
    const container = scrollContainerRef.current
    const currentEl = currentIslandRef.current
    if (container && currentEl) {
      const containerWidth = container.offsetWidth
      const elementWidth = currentEl.offsetWidth
      const targetScrollLeft = currentEl.offsetLeft - (containerWidth / 2) + (elementWidth / 2)
      container.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' })
    }
  }, [completedCount, type, islands.length])

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -220 : 220,
        behavior: 'smooth',
      })
    }
  }

  if (type === 'asmo') {
    return (
      <div className="ui-card relative overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] border-2 border-amber-200/90 bg-gradient-to-br from-[#fffbeb] via-[#fff7ed] to-[#f5f3ff] p-5 sm:p-7 lg:p-8 shadow-clay transition-all hover:shadow-2xl">
        {/* Background Image Landscape - Mờ chìm tinh tế */}
        <div className="absolute top-0 right-0 bottom-0 w-full lg:w-[45%] pointer-events-none opacity-20 lg:opacity-50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#fff7ed] via-transparent to-transparent z-10" />
          <img
            src={designerAssets.worldScenes.storyIsland}
            alt="Đảo bí ẩn ASMO"
            className="absolute inset-0 w-full h-full object-cover object-left [mask-image:linear-gradient(to_right,transparent,black_20%)]"
          />
          <div className="absolute top-8 left-8 text-sky-400/80 animate-float">
            <Cloud size={32} />
          </div>
          <div className="absolute top-12 right-12 text-amber-400 animate-pulse">
            <Sparkles size={24} />
          </div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between w-full h-full">
          <div className="flex-1 space-y-4 min-w-0 w-full max-w-xl relative z-20">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1 text-xs font-black uppercase text-amber-700 shadow-2xs border border-amber-200">
                <FlatClayIcon name="sparkles" size={14} /> 5 VÙNG ĐẤT ASMO
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-extrabold text-sky-800 shadow-2xs border border-sky-200">
                Đang đón gió mở cổng
              </span>
            </div>

            <div>
              <h3 className="font-display text-2xl sm:text-3xl text-slate-800 mb-2">
                Toán tư duy & Khoa học AI (ASMO Lab)
              </h3>
              <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
                Rèn luyện tư duy logic Olympic, giải các bài toán mô phỏng 3D tương tác và khám phá 5 vùng đất kỳ thú cùng AI.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="secondary"
                disabled
                className="gap-2 opacity-80 cursor-not-allowed shadow-clay rounded-2xl pointer-events-none bg-white/80 backdrop-blur-sm border-amber-100"
              >
                <Lock size={16} /> Sắp mở cổng thám hiểm...
              </Button>
              {/* Mobile/Tablet In-Flow Dock - Không đè lên chữ */}
              <div className="flex md:hidden items-center justify-start pt-3 w-full">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-900/10 border border-amber-300/60 backdrop-blur-xs text-xs font-black text-amber-900">
                  <Lock size={14} className="text-amber-600" />
                  <span>Vùng Đất Kỳ Bí · Đang đón gió</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Graphic Stage - Tách riêng trong cột flex phải, không đè text */}
          <div className="hidden md:flex flex-col items-center justify-center w-[180px] lg:w-[220px] xl:w-[260px] shrink-0 relative z-20 gap-2.5 animate-float drop-shadow-xl">
            <div className="size-16 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center shadow-clay border-2 border-white">
              <Lock className="text-amber-500 size-7" />
            </div>
            <span className="rounded-full bg-amber-900/40 backdrop-blur-sm px-3 py-1 text-[10px] font-extrabold text-amber-50 shadow-xs">
              Vùng Đất Kỳ Bí
            </span>
          </div>
        </div>
      </div>
    )
  }

  // AIKID Official Creator Program Card
  return (
    <div className="ui-card relative overflow-hidden rounded-[2.5rem] sm:rounded-[3rem] border-2 border-brand-200/90 bg-gradient-to-br from-[#eff8ff] via-[#f2fdf5] to-[#fbf7ff] p-5 sm:p-7 lg:p-8 shadow-clay transition-all hover:shadow-2xl">
      {/* Background open landscape with soft blend */}
      <div className="absolute top-0 right-0 bottom-0 w-full md:w-[45%] lg:w-[50%] pointer-events-none overflow-hidden rounded-r-[2.5rem] sm:rounded-r-[3rem] opacity-35 lg:opacity-60">
        <div className="absolute inset-0 bg-gradient-to-r from-[#eff8ff] via-[#f2fdf5]/50 to-transparent z-10" />
        <img
          src={designerAssets.worldScenes.aiValley}
          alt="AI Valley"
          className="absolute inset-0 w-full h-full object-cover object-center [mask-image:linear-gradient(to_right,transparent,black_30%)]"
        />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-stretch justify-between w-full h-full">
        {/* Cột Nội Dung Bên Trái */}
        <div className="flex-1 space-y-5 sm:space-y-6 min-w-0 w-full md:max-w-[60%] lg:max-w-[62%] xl:max-w-[66%] relative z-30">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-100 px-3.5 py-1 text-xs font-black uppercase text-mint-800 shadow-2xs border border-mint-200">
              <FlatClayIcon name="sparkles" size={14} /> CHƯƠNG TRÌNH CHÍNH THỨC
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-brand-700 shadow-2xs border border-brand-200">
              {totalCourses} Đảo học tập
            </span>
          </div>

          <div>
            <h3 className="font-display text-2xl sm:text-3xl text-slate-900 mb-2">
              Khóa sáng tạo nội dung cùng AIKID
            </h3>
            <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
              Nắm vững 10 quy tắc vàng an toàn, cùng AKI sáng tạo nhân vật, viết truyện tranh và xây dựng các thế giới diệu kỳ.
            </p>
          </div>

          {/* DẢI HẢI TRÌNH CÁC HÒN ĐẢO NỔI MINI */}
          <div className="relative mt-2">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FlatClayIcon name="compass" size={16} />
                <span>Hải trình {islands.length} hòn đảo sáng tạo</span>
              </p>

              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-[11px] font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/60 hidden sm:inline-block">
                  {completedCount}/{islands.length} đảo đã khám phá
                </span>
                {/* Nút điều hướng cuộn Soft Clay */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleScroll('left')}
                    aria-label="Cuộn sang trái"
                    className="rounded-full size-7.5 sm:size-8 bg-white/90 border border-brand-200/90 shadow-clay flex items-center justify-center text-brand-700 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScroll('right')}
                    aria-label="Cuộn sang phải"
                    className="rounded-full size-7.5 sm:size-8 bg-white/90 border border-brand-200/90 shadow-clay flex items-center justify-center text-brand-700 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Container cuộn với pt-6 pb-3 để huy hiệu "ĐANG HỌC" không bao giờ bị cắt xén biên */}
            <div
              className="w-full overflow-x-auto pt-6 pb-3 scrollbar-none scroll-smooth"
              ref={scrollContainerRef}
            >
              <div className="flex items-center gap-6 relative px-3 min-w-max">
                {/* Đường nối giữa các đảo */}
                <div className="absolute top-[34px] left-8 right-10 h-1 bg-slate-200/80 rounded-full -translate-y-1/2 z-0" />
                {/* Vệt tiến độ phát sáng */}
                <div
                  className="absolute top-[34px] left-8 h-1 bg-mint-400 rounded-full -translate-y-1/2 z-0 transition-all duration-700"
                  style={{
                    width: `calc(${Math.min(
                      100,
                      (Math.max(0, completedCount) / Math.max(1, islands.length - 1)) * 100
                    )}% - 24px)`,
                  }}
                />

                {islands.map((island, idx) => {
                  const isCompleted = idx < completedCount
                  const isCurrent = idx === completedCount

                  return (
                    <button
                      key={island.id}
                      ref={isCurrent ? currentIslandRef : null}
                      type="button"
                      onClick={() => navigate('/world/program/aikid_official/creator')}
                      className="relative z-10 flex flex-col items-center gap-1.5 group cursor-pointer hover:scale-105 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 rounded-2xl shrink-0"
                      title={`${island.title}: ${island.desc} (${island.landmark})`}
                    >
                      {/* Huy hiệu ĐANG HỌC nổi bật với viền trắng, không bị clipping do container có pt-6 */}
                      {isCurrent && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[8.5px] font-black px-2 py-0.5 rounded-full border-[1.5px] border-white shadow-sm z-30 whitespace-nowrap tracking-wider">
                          ĐANG HỌC
                        </div>
                      )}

                      {/* Mặt đảo nổi */}
                      <div
                        className={cn(
                          'relative size-16 sm:size-17 rounded-2xl sm:rounded-3xl overflow-hidden group-hover:shadow-xl transition-all duration-300',
                          isCurrent
                            ? 'border-2 border-amber-400 ring-2 ring-amber-300/70 shadow-lg shadow-amber-400/20 scale-105'
                            : isCompleted
                            ? 'border-2 border-mint-400 ring-1 ring-mint-300/60 shadow-sm'
                            : 'border-2 border-slate-300/80 bg-slate-200/60 shadow-2xs',
                        )}
                      >
                        {/* Ảnh phong cảnh độc bản chuẩn của hòn đảo */}
                        <img
                          src={island.scene}
                          alt={island.title}
                          className={cn(
                            'absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110',
                            !isCompleted &&
                              !isCurrent &&
                              'filter grayscale contrast-75 opacity-55 transition-all duration-300 group-hover:opacity-75',
                          )}
                        />

                        {/* Lớp màng men chuyển sắc siêu nhẹ */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none" />

                        {/* Tích xanh khi hoàn thành */}
                        {isCompleted && (
                          <div className="absolute top-1 right-1 size-4.5 bg-mint-500 rounded-full border border-white flex items-center justify-center shadow-xs z-20">
                            <CheckCircle2 size={11} className="text-white" />
                          </div>
                        )}

                        {/* Ổ khóa khi chưa học */}
                        {!isCompleted && !isCurrent && (
                          <div className="absolute top-1 right-1 size-4 rounded-full bg-slate-500/60 backdrop-blur-xs flex items-center justify-center z-20">
                            <Lock size={9} className="text-white" />
                          </div>
                        )}
                      </div>

                      {/* Nhãn Đảo 1..6 và Tên Nhiệm Vụ — KHÔNG KHUNG HỘP */}
                      <div className="text-center min-w-[76px] sm:min-w-[84px]">
                        <span
                          className={cn(
                            'block text-[10px] tracking-wide mb-0.5',
                            isCurrent
                              ? 'text-amber-600 font-black'
                              : isCompleted
                              ? 'text-mint-600 font-black'
                              : 'text-slate-400 font-bold',
                          )}
                        >
                          {island.number}
                        </span>
                        <p
                          className={cn(
                            'text-[11px] sm:text-xs leading-snug whitespace-nowrap transition-colors',
                            isCurrent
                              ? 'text-slate-900 font-black'
                              : isCompleted
                              ? 'text-slate-800 font-extrabold'
                              : 'text-slate-400 font-semibold',
                          )}
                        >
                          {island.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Unified Soft Clay Progress Dock — Căn Thẳng Hàng, Gom Ô % Không Bị Lệch */}
          <div className="w-full max-w-xl space-y-2.5 pt-1">
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Tiến độ khóa học
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 text-[11px] font-black border border-brand-200 shadow-2xs">
                  {totalProgress}%
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-extrabold text-slate-600 bg-white/70 px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs backdrop-blur-sm">
                <span className="flex items-center gap-1.5 border-r border-slate-200 pr-2.5">
                  <CheckCircle2 size={14} className="text-mint-600" />
                  {completedStations}/{totalStations} trạm
                </span>
                <span className="flex items-center gap-1.5">
                  <FlatClayIcon name="star" size={14} />
                  {totalStars} sao
                </span>
              </div>
            </div>

            <div className="w-full">
              <CuteProgress
                value={totalProgress}
                tone="mint"
                className="w-full [&_.cute-progress-header]:hidden"
              />
            </div>
          </div>

          {/* Nút Hành Động Soft Clay */}
          <div className="pt-2">
            <Button
              onClick={() => navigate('/world/program/aikid_official/creator')}
              className="w-full sm:w-auto shadow-clay active:shadow-press rounded-2xl gap-2 px-8 py-4 text-base font-black inline-flex items-center justify-center cursor-pointer"
            >
              <span>{totalProgress > 0 ? 'Tiếp tục học các đảo' : 'Lên thuyền khám phá các đảo'}</span>
              <ArrowRight size={18} />
            </Button>
          </div>

          {/* Mèo Aki Trong Luồng Tự Nhiên Cho Mobile Phone (< md) - 100% Không Bao Giờ Đè Lên Nút */}
          <div className="flex md:hidden flex-col items-center pt-6 pb-2 w-full relative z-20">
            <div className="py-2 px-4 rounded-2xl border-2 border-brand-200 shadow-soft text-[11px] sm:text-xs font-black text-slate-800 text-center mb-2.5 bg-white/95 backdrop-blur-xs relative animate-float flex items-center justify-center gap-1.5">
              <span>Cùng Aki chinh phục 6 hòn đảo nhé!</span>
              <FlatClayIcon name="sparkles" size={14} />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[8px] border-t-white" />
              <div className="absolute -bottom-[10.5px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[7px] border-x-transparent border-t-[9px] border-t-brand-200/80 -z-10" />
            </div>
            <div className="w-28 sm:w-32 drop-shadow-[0_8px_0_rgba(47,38,91,0.12)]">
              <AikidCatCharacter pose="welcome" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        {/* Cột Mèo Aki Riêng Biệt Cho Tablet & Desktop (>= md) - Không Bao Giờ Đè Lên Cột Trái */}
        <div className="hidden md:flex flex-col items-center justify-end w-[200px] lg:w-[240px] xl:w-[280px] shrink-0 relative z-20 self-stretch pb-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/85 border border-brand-200/80 shadow-2xs text-[11px] font-extrabold text-brand-700 backdrop-blur-xs mb-2">
            <FlatClayIcon name="compass" size={13} />
            <span>Trợ lý đồng hành Aki</span>
          </div>
          <div className="bg-white/95 backdrop-blur-xs rounded-2xl py-2.5 px-4 border-2 border-brand-200/80 shadow-soft text-[11px] sm:text-xs font-black text-slate-800 text-center animate-float flex items-center justify-center gap-1.5 mb-3 relative">
            <span>Cùng Aki chinh phục 6 hòn đảo nhé!</span>
            <FlatClayIcon name="sparkles" size={14} />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[8px] border-t-white" />
            <div className="absolute -bottom-[10.5px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[7px] border-x-transparent border-t-[9px] border-t-brand-200/80 -z-10" />
          </div>
          <div className="w-48 xl:w-56 drop-shadow-[0_8px_0_rgba(47,38,91,0.12)]">
            <AikidCatCharacter pose="welcome" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    </div>
  )
}
