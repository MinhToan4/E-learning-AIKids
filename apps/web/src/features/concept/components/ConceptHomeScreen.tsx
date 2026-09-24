import React, { useState, useRef } from 'react'
import {
  Bell,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  BookOpen,
  Clock,
  Zap,
  Play,
  Trophy,
  Award,
  Users,
  Crown,
  Eye,
  Film,
  Compass,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
  X,
} from 'lucide-react'
import { designerAssets } from '@/shared/config/assets'
import {
  ParentTrailerModal,
  STORAGE_KEY,
} from '@/features/subscription/components/ParentPurchaseTrailerBanner'

export interface ConceptHomeScreenProps {
  onSelectIsland?: (islandId: string) => void
  onOpenOlympiad?: () => void
  onOpenActivity?: (type: 'lessons' | 'hours') => void
  onContinueLesson?: () => void
  onStartMission?: () => void
  isMobileFrame?: boolean
}

interface IslandItem {
  id: string
  number: string
  title: string
  desc: string
  status: 'completed' | 'in_progress' | 'locked'
  progressText?: string
  progressPct?: number
  scene: string
  badgeLabel?: string
}

const ISLANDS_DATA: IslandItem[] = [
  {
    id: 'dao-1',
    number: 'ĐẢO 1',
    title: 'Đảo Tiên Quyết',
    desc: '10 Quy tắc vàng',
    status: 'completed',
    progressText: '10/10 bài',
    progressPct: 100,
    scene: designerAssets.worldScenes.aiValley,
    badgeLabel: 'ĐÃ XONG',
  },
  {
    id: 'dao-2',
    number: 'ĐẢO 2',
    title: 'Đảo Khám Phá',
    desc: '4 Chìa khóa lệnh',
    status: 'in_progress',
    progressText: '2/4 bài',
    progressPct: 50,
    scene: designerAssets.worldScenes.promptKeys,
    badgeLabel: 'ĐANG HỌC',
  },
  {
    id: 'dao-3',
    number: 'ĐẢO 3',
    title: 'Đảo Họa Sĩ',
    desc: 'Sắc màu cọ vẽ',
    status: 'locked',
    progressText: '0/4 bài',
    progressPct: 0,
    scene: designerAssets.worldScenes.creativeMountain,
    badgeLabel: 'KHÓA',
  },
  {
    id: 'dao-4',
    number: 'ĐẢO 4',
    title: 'Đảo Nhân Vật',
    desc: 'Hồ sơ 3 điểm',
    status: 'locked',
    progressText: '0/4 bài',
    progressPct: 0,
    scene: designerAssets.worldScenes.characterLab,
    badgeLabel: 'KHÓA',
  },
  {
    id: 'dao-5',
    number: 'ĐẢO 5',
    title: 'Đảo Truyện Tranh',
    desc: 'Storyboard 8 ô',
    status: 'locked',
    progressText: '0/5 bài',
    progressPct: 0,
    scene: designerAssets.worldScenes.storyIsland,
    badgeLabel: 'KHÓA',
  },
  {
    id: 'dao-6',
    number: 'ĐẢO 6',
    title: 'Đảo Trò Chơi',
    desc: 'Đấu trường thẻ',
    status: 'locked',
    progressText: '0/5 bài',
    progressPct: 0,
    scene: designerAssets.worldScenes.gameArena,
    badgeLabel: 'KHÓA',
  },
]

export const ConceptHomeScreen: React.FC<ConceptHomeScreenProps> = ({
  onSelectIsland,
  onOpenOlympiad,
  onOpenActivity,
  onContinueLesson,
  onStartMission,
  isMobileFrame = false,
}) => {
  const [activeIslandId, setActiveIslandId] = useState<string>('dao-2')
  const [isPurchased, setIsPurchased] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [showTrailerModal, setShowTrailerModal] = useState<boolean>(false)
  const [isPlayingTrailer, setIsPlayingTrailer] = useState<boolean>(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -220 : 220,
        behavior: 'smooth',
      })
    }
  }

  const handlePurchaseToggle = () => {
    const nextState = !isPurchased
    setIsPurchased(nextState)
    try {
      localStorage.setItem(STORAGE_KEY, String(nextState))
    } catch {
      // ignore
    }
  }

  const handleUnlockFullCourse = () => {
    setIsPurchased(true)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {
      // ignore
    }
    setShowTrailerModal(false)
  }

  return (
    <div className="max-w-[1024px] mx-auto w-full flex flex-col gap-6 text-zinc-900 pb-20 select-none min-w-0">
      {/* 1. Header: Avatar Mèo Mee viền gradient + Jacob (Cấp 4 • Nhà Khám Phá) + Nút chuông trắng */}
      <header className="flex flex-col gap-3.5 pt-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar Mèo Mee tròn viền gradient + chấm xanh online */}
            <div className="relative shrink-0">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-orange-400 via-amber-300 to-rose-300 p-0.5 shadow-sm">
                <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                  <img
                    src={designerAssets.brand.mascot}
                    alt="Mee Cat Avatar"
                    className="w-full h-full object-cover object-top scale-110"
                  />
                </div>
              </div>
              {/* Active Status Dot */}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            </div>

            {/* Welcome User Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight truncate">
                  Hey, Jacob!
                </h1>
                <span className="text-lg">👋</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-zinc-500 whitespace-nowrap">
                Cấp 4 • Nhà Khám Phá
              </p>
            </div>
          </div>

          {/* Nút chuông thông báo tròn trắng có chấm cam badge */}
          <button
            type="button"
            aria-label="Thông báo"
            className="relative shrink-0 w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all"
          >
            <Bell className="w-5 h-5 text-zinc-700" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#FD7D2E] ring-2 ring-white" />
          </button>
        </div>

        {/* Widget XP: 1,250 / 1,500 XP, thanh tiến độ nhỏ xinh xắn kèm text "Còn 250 XP để lên Cấp 5" */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-xs p-3 sm:p-3.5 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-black text-zinc-800">
              <Zap className="w-4 h-4 text-[#FD7D2E] fill-[#FD7D2E]" />
              <span className="text-sm">1,250 / 1,500 XP</span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#FD7D2E]">
              Còn 250 XP để lên Cấp 5
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-orange-100/80 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-[#FD7D2E] transition-all duration-500"
              style={{ width: '83.3%' }}
            />
          </div>
        </div>
      </header>

      {/* 2. KHỐI KHÓA HỌC CHÍNH THỨC AIKID (THIẾT KẾ TINH GỌN, TRỰC DIỆN TRAILER VIDEO, HẢI TRÌNH FULL-WIDTH) */}
      <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#eff8ff]/95 via-[#f2fdf5]/90 to-[#ffffff]/95 backdrop-blur-md shadow-sm border border-white/80 p-4 sm:p-5 lg:p-6 flex flex-col gap-4 sm:gap-5 min-w-0 transition-all">
        {/* Background landscape watermark */}
        <div className="absolute top-0 right-0 bottom-0 w-full md:w-[45%] lg:w-[50%] pointer-events-none overflow-hidden rounded-r-[2.5rem] opacity-25 lg:opacity-40">
          <div className="absolute inset-0 bg-gradient-to-r from-[#eff8ff] via-[#f2fdf5]/40 to-transparent z-10" />
          <img
            src={designerAssets.worldScenes.aiValley}
            alt="AI Valley Background"
            className="absolute inset-0 w-full h-full object-cover object-center [mask-image:linear-gradient(to_right,transparent,black_30%)]"
          />
        </div>

        {/* BỐ CỤC CHÍNH: CHIA 2 CỘT RÕ RÀNG (DESKTOP: 2 CỘT CÂN ĐỐI, MOBILE: 1 CỘT STACKED) */}
        <div
          className={`w-full grid ${
            isMobileFrame ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
          } gap-4 sm:gap-5 items-start min-w-0 relative z-10`}
        >
          {/* CỘT 1 (BÊN TRÁI): THÔNG TIN KHÓA HỌC & TIẾN ĐỘ */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* Header thông tin khóa học */}
            <div className="space-y-2.5">
              {/* Badge & Test Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 text-emerald-800 px-3 py-1 text-xs font-black uppercase shadow-2xs border border-emerald-200">
                  <Sparkles size={13} aria-hidden="true" /> CHƯƠNG TRÌNH CHÍNH THỨC • 6 ĐẢO
                </span>

                <button
                  type="button"
                  onClick={handlePurchaseToggle}
                  aria-label="Chuyển trạng thái gói mua thử nghiệm"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-zinc-700 text-[10px] font-bold shadow-2xs border border-zinc-200/80 transition-all cursor-pointer shrink-0"
                >
                  <Eye className="w-3 h-3 text-purple-600" />
                  <span>Test: {isPurchased ? 'Đã mua (VIP)' : 'Chưa mua'}</span>
                </button>
              </div>

              {/* Tiêu đề ngắn gọn - Không bao giờ ngắt chữ kỳ lạ */}
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug whitespace-normal break-normal">
                  Khóa sáng tạo nội dung cùng AIKID
                </h2>
                <p className="text-xs sm:text-sm font-bold text-purple-700 mt-1">
                  32 Trạm học thực tế • Rèn luyện tư duy AI cùng Mèo Mee
                </p>
              </div>
            </div>

            {/* Trạng thái phân quyền Đảo 1 & Đảo 2-6 ngắn gọn */}
            <div className={`flex flex-col ${isMobileFrame ? 'gap-2' : 'sm:grid sm:grid-cols-2 gap-2'} text-xs`}>
              <div className="p-2.5 rounded-2xl bg-white/80 backdrop-blur-xs shadow-2xs flex items-center gap-2 border border-emerald-100/80 min-w-0">
                <span className="text-base shrink-0">🎁</span>
                <div className="min-w-0">
                  <p className="font-black text-emerald-800 text-[11px] whitespace-nowrap">
                    Đảo 1: Học Thử Free
                  </p>
                  <span className="text-[10px] text-zinc-500 font-medium block whitespace-nowrap">
                    10 quy tắc an toàn số
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/80 backdrop-blur-xs shadow-2xs flex items-center gap-2 border border-amber-100/80 min-w-0">
                <span className="text-base shrink-0">{isPurchased ? '🔓' : '🔒'}</span>
                <div className="min-w-0">
                  <p className={`font-black text-[11px] whitespace-nowrap ${isPurchased ? 'text-purple-800' : 'text-amber-900'}`}>
                    {isPurchased ? 'Đảo 2 - 6: Đã Mở Khóa VIP' : 'Đảo 2 - 6: Mở Khóa VIP'}
                  </p>
                  <span className="text-[10px] text-zinc-500 font-medium block whitespace-nowrap">
                    32 trạm &amp; xưởng AI
                  </span>
                </div>
              </div>
            </div>

            {/* Tiến độ khóa học */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 whitespace-nowrap">
                    TIẾN ĐỘ
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-black border border-orange-200 shadow-2xs whitespace-nowrap">
                    0%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs backdrop-blur-xs whitespace-nowrap shrink-0">
                  <span className="flex items-center gap-1 border-r border-slate-200 pr-2 whitespace-nowrap">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    0/32 trạm
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 whitespace-nowrap">
                    <Star size={13} className="fill-amber-400 text-amber-500 shrink-0" aria-hidden="true" />
                    0 sao
                  </span>
                </div>
              </div>

              {/* Progress bar pastel */}
              <div className="w-full h-2.5 rounded-full bg-purple-100/70 overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-[#FD7D2E] transition-all duration-500"
                  style={{ width: '8%' }}
                />
              </div>
            </div>

            {/* Nút hành động chính */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => {
                  if (onSelectIsland) {
                    onSelectIsland('dao-1')
                  } else if (onOpenOlympiad) {
                    onOpenOlympiad()
                  }
                }}
                title="Khám phá lộ trình"
                className="w-full min-h-[48px] px-6 py-2.5 rounded-2xl bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-xs sm:text-sm font-black shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>Lên thuyền khám phá Đảo 1 →</span>
              </button>
            </div>
          </div>

          {/* CỘT 2 (BÊN PHẢI): MULTIMEDIA TRAILER VIDEO Ở TRÊN & THÔNG TIN GÓI PHỤ HUYNH Ở DƯỚI */}
          <div className="flex flex-col gap-4 min-w-0">
            {/* 1. KHUNG VIDEO TRAILER 16:9 */}
            <div className="relative w-full aspect-16/9 rounded-2xl overflow-hidden bg-zinc-950 shadow-inner border border-orange-200/60 group">
              <img
                src="/assets/aikid-ui/mascot-original/course-wave.webp"
                alt="Trailer Hoạt Hình Mèo Mee"
                className={`w-full h-full object-cover object-top transition-all duration-500 ${
                  isPlayingTrailer ? 'opacity-30 blur-xs scale-105' : 'opacity-90 group-hover:scale-105'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

              {!isPlayingTrailer ? (
                <>
                  {/* Big Play Button tròn Soft Clay ở giữa */}
                  <button
                    type="button"
                    onClick={() => setIsPlayingTrailer(true)}
                    aria-label="Xem Trailer Khóa Học"
                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/95 hover:bg-white text-[#FD7D2E] shadow-2xl flex items-center justify-center transform group-hover:scale-110 active:scale-95 transition-all cursor-pointer z-20"
                  >
                    <Play className="w-6 h-6 fill-current ml-0.5 text-[#FD7D2E]" />
                  </button>

                  {/* Badge Trailer 01:45 */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[11px] font-black flex items-center gap-1.5 shadow-2xs z-20">
                    <Film className="w-3.5 h-3.5 text-amber-300" />
                    <span>Trailer 01:45</span>
                  </div>

                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#FD7D2E] text-white text-[10px] font-black shadow-xs z-20">
                    Khám phá AIKid
                  </div>

                  {/* Bottom Text Label */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold z-20">
                    <span className="truncate">Cùng Mèo Mee khám phá 6 đảo</span>
                    <span className="text-amber-300 text-[10px] shrink-0 ml-2">Bấm để xem ▶</span>
                  </div>
                </>
              ) : (
                /* Interactive Simulated Video Player */
                <div className="absolute inset-0 flex flex-col justify-between p-3.5 z-20 text-white animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-xs font-black truncate">Đang phát: Khám phá AIKid (01:45)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPlayingTrailer(false)}
                      aria-label="Đóng Trailer"
                      className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-1.5 my-auto">
                    <div className="w-10 h-10 rounded-full bg-[#FD7D2E]/80 flex items-center justify-center animate-bounce-subtle">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-black text-center text-amber-200">
                      🎬 Chuyến du hành 6 Đảo AIKid cùng Trợ lý Mèo Mee!
                    </p>
                  </div>

                  {/* Simulated player timeline scrubber */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 rounded-full bg-white/30 overflow-hidden">
                      <div className="h-full bg-[#FD7D2E] rounded-full w-2/5 animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-300">
                      <span>00:42</span>
                      <button
                        type="button"
                        onClick={() => setIsPlayingTrailer(false)}
                        className="underline hover:text-white cursor-pointer"
                      >
                        Tạm dừng &amp; Đóng
                      </button>
                      <span>01:45</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. THÔNG TIN GÓI PHỤ HUYNH NGAY DƯỚI VIDEO */}
            {!isPurchased ? (
              <div className="rounded-2xl bg-white/85 p-3.5 sm:p-4 shadow-xs flex flex-col gap-2.5 border border-amber-200/70">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-400 to-[#FD7D2E] text-white flex items-center justify-center shrink-0">
                      <Crown className="w-3.5 h-3.5 fill-white" />
                    </div>
                    <span className="text-xs font-black text-amber-950 uppercase tracking-wider whitespace-nowrap">
                      DÀNH CHO PHỤ HUYNH
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-2xs shrink-0">
                    Tiết kiệm 40%
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg sm:text-xl font-black text-[#FD7D2E]">
                      479.000đ
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-400 line-through">
                      799.000đ
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                    Sở hữu trọn đời
                  </span>
                </div>

                <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">
                  Gói Thám Hiểm Toàn Diện 6 Đảo: Mở khóa trọn bộ Đảo 2 - 6, 32 trạm học &amp; xưởng vẽ AI trọn đời cho bé.
                </p>

                <div className="flex flex-col gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={handleUnlockFullCourse}
                    className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-xs sm:text-sm font-black shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Phụ huynh mở khóa trọn bộ (479k) 🚀</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTrailerModal(true)}
                    className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-zinc-100/80 hover:bg-zinc-200 text-zinc-700 text-xs font-bold active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Xem chi tiết & trailer"
                  >
                    <Film className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Chi tiết &amp; Trailer</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-emerald-500/15 p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-2.5 border border-amber-300/40">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Crown className="w-4 h-4 fill-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-amber-950 uppercase tracking-wider whitespace-nowrap">
                        Gói VIP 6 Đảo
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black shrink-0">
                        VIP
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-zinc-600 leading-tight whitespace-nowrap">
                      Đã kích hoạt trọn bộ 32 trạm
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                  Đã Mở Khóa ✨
                </span>
              </div>
            )}
          </div>
        </div>

        {/* HÀNG DƯỚI: HẢI TRÌNH 6 ĐẢO FULL CHIỀU NGANG (FULL-WIDTH 100%) THEO CHỈ ĐẠO CỦA SẾP */}
        <div className="w-full pt-4 border-t border-orange-200/50 relative z-10">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Compass size={17} className="text-[#FD7D2E] shrink-0" aria-hidden="true" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 whitespace-nowrap">
                HẢI TRÌNH 6 ĐẢO
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#FD7D2E] text-[11px] font-bold border border-orange-200/60 whitespace-nowrap">
                0/6 đảo
              </span>

              {/* Nút điều hướng cuộn Soft Clay */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleScroll('left')}
                  aria-label="Cuộn sang trái"
                  className="rounded-full w-7 h-7 sm:w-8 sm:h-8 bg-white/90 border border-orange-200/90 shadow-xs flex items-center justify-center text-[#FD7D2E] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll('right')}
                  aria-label="Cuộn sang phải"
                  className="rounded-full w-7 h-7 sm:w-8 sm:h-8 bg-white/90 border border-orange-200/90 shadow-xs flex items-center justify-center text-[#FD7D2E] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Dải squircle 6 đảo cuộn ngang trọn vẹn */}
          <div
            className="w-full overflow-x-auto pt-4 pb-2 no-scrollbar scroll-smooth"
            ref={scrollContainerRef}
          >
            <div className="flex items-center gap-5 sm:gap-6 relative px-2 min-w-max">
              {/* Đường ray nối */}
              <div className="absolute top-[34px] left-8 right-10 h-1 bg-slate-200/80 rounded-full -translate-y-1/2 z-0" />
              <div className="absolute top-[34px] left-8 w-16 h-1 bg-emerald-400 rounded-full -translate-y-1/2 z-0" />

              {ISLANDS_DATA.map((island) => {
                const isIsland1 = island.id === 'dao-1'
                const isLocked = !isIsland1 && !isPurchased

                return (
                  <button
                    key={island.id}
                    type="button"
                    onClick={() => {
                      if (isLocked) {
                        setShowTrailerModal(true)
                      } else if (onSelectIsland) {
                        onSelectIsland(island.id)
                      }
                    }}
                    className={`relative z-10 flex flex-col items-center gap-1.5 group rounded-2xl shrink-0 transition-transform ${
                      isLocked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:scale-105'
                    }`}
                    title={`${island.title}: ${island.desc}`}
                  >
                    {/* Huy hiệu ĐANG HỌC trên Đảo 1 */}
                    {isIsland1 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-[8.5px] font-black px-2 py-0.5 rounded-full border border-white shadow-2xs z-30 whitespace-nowrap tracking-wider">
                        ĐANG HỌC
                      </div>
                    )}

                    {/* Mặt đảo Squircle */}
                    <div
                      className={`relative w-16 h-16 sm:w-17 sm:h-17 rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 border-2 ${
                        isIsland1
                          ? 'border-amber-400 ring-2 ring-amber-300/70 shadow-md shadow-amber-400/20 scale-105'
                          : isLocked
                            ? 'border-slate-300/60 bg-slate-200/80'
                            : 'border-emerald-400 ring-1 ring-emerald-300/60 shadow-xs'
                      }`}
                    >
                      <img
                        src={island.scene}
                        alt={island.title}
                        className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 ${
                          isLocked ? 'grayscale-[60%] opacity-50' : 'group-hover:scale-110'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 pointer-events-none" />

                      {/* Ổ khóa khi bị khóa */}
                      {isLocked && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-800/80 backdrop-blur-xs flex items-center justify-center z-20 shadow-xs">
                          <Lock size={11} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Nhãn Đảo 1..6 và Tên */}
                    <div className="text-center min-w-[76px] sm:min-w-[84px]">
                      <span
                        className={`block text-[10px] tracking-wide mb-0.5 ${
                          isIsland1 ? 'text-amber-600 font-black' : 'text-slate-400 font-bold'
                        }`}
                      >
                        {island.number}
                      </span>
                      <p
                        className={`text-[11px] sm:text-xs leading-snug whitespace-nowrap ${
                          isIsland1 ? 'text-slate-900 font-black' : 'text-slate-500 font-semibold'
                        }`}
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
      </section>

      {/* Modal Chi Tiết Trailer Phụ Huynh */}
      <ParentTrailerModal
        isOpen={showTrailerModal}
        onClose={() => setShowTrailerModal(false)}
        onUnlock={handleUnlockFullCourse}
      />

      {/* 4. BÀI HỌC TIẾP THEO (Stroke-less, KHUNG SQUIRCLE TRẮNG SỮA BÉO TRÒN) */}
      <article className="group relative rounded-[2.25rem] bg-gradient-to-br from-[#f8f5ff] via-[#f3ebff] to-[#eee4ff] p-5 sm:p-6 shadow-sm flex flex-col gap-3.5 transition-all hover:shadow-md min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-[#FD7D2E] text-[10px] font-black uppercase tracking-wider shadow-2xs">
            <Zap className="w-2.5 h-2.5 fill-current" />
            <span>BÀI HỌC TIẾP THEO</span>
          </span>
          <span className="text-xs font-bold text-purple-700 bg-purple-100/90 px-2.5 py-0.5 rounded-full">
            2/4 trạm (50%)
          </span>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
            Đảo 2: 4 Chìa khóa lệnh
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-zinc-600 leading-relaxed">
            Trạm tiếp theo: <strong className="text-purple-900">Trạm 3: Chìa khóa Phong cách nghệ thuật</strong>
          </p>
        </div>

        {/* Mini Progress Bar Độc Lập Có Khoảng Đệm */}
        <div className="w-full pt-1.5 pb-0.5">
          <div className="w-full h-2 rounded-full bg-purple-200/70 overflow-hidden">
            <div className="h-full rounded-full bg-[#FD7D2E] w-1/2" />
          </div>
        </div>

        {/* Nút bấm ở ĐÁY THẺ - Nút Pill Cam Thương Hiệu Mộc Mạc */}
        <button
          type="button"
          onClick={onContinueLesson}
          className="w-full min-h-[48px] px-5 py-3 rounded-full bg-[#FD7D2E] hover:bg-[#ea6a1f] text-white text-sm sm:text-base font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
        >
          <span>Học tiếp bài dở</span>
          <span className="text-base">🚀</span>
        </button>
      </article>

      {/* 5. NHIỆM VỤ HÔM NAY (Stroke-less, THANH NGANG MISSION STRIP SQUIRCLE) */}
      <article className="w-full rounded-2xl bg-[#fffbeb] p-4 shadow-xs flex flex-col gap-3 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center text-sm shrink-0 shadow-xs">
              🎯
            </div>
            <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
              Nhiệm Vụ Hôm Nay
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-200/80 rounded-full px-2 py-0.5">
              <Zap className="w-2.5 h-2.5 fill-amber-700 text-amber-700" />
              <span>+30 XP</span>
            </span>
            <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
              1/2 bài
            </span>
          </div>
        </div>

        <div className="space-y-0.5">
          <p className="text-xs sm:text-sm font-bold text-zinc-900">
            Nhiệm vụ hôm nay: Hoàn thành 1 trạm tại Đảo 2
          </p>
          <p className="text-[11px] font-medium text-amber-900/80">
            Phần thưởng: <span className="font-bold text-[#FD7D2E]">+30 XP</span> &amp; <span className="font-bold text-purple-700">1 Huy Hiệu Chăm Chỉ</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onStartMission || onContinueLesson}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Làm nhiệm vụ</span>
        </button>
      </article>

      {/* 4. Lộ trình 6 đảo (Island Roadmap Track) - Stroke-less Soft Clay */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-zinc-900">
              Lộ Trình 6 Đảo Khám Phá
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold">
              6 Đảo
            </span>
          </div>
          <span className="text-xs font-semibold text-zinc-500">
            Trạm 2 / 6
          </span>
        </div>

        {/* Horizontal Scroll Track of 6 Islands */}
        <div className="flex gap-3.5 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory">
          {ISLANDS_DATA.map((island) => {
            const isCompleted = island.status === 'completed'
            const isInProgress = island.status === 'in_progress'
            const isLocked = island.status === 'locked'

            return (
              <div
                key={island.id}
                onClick={() => {
                  setActiveIslandId(island.id)
                  onSelectIsland?.(island.id)
                }}
                className={`snap-start shrink-0 w-[175px] sm:w-[195px] rounded-[2rem] p-3.5 flex flex-col justify-between transition-all cursor-pointer shadow-xs ${
                  isInProgress
                    ? 'bg-white ring-2 ring-orange-400/50'
                    : isCompleted
                      ? 'bg-white hover:brightness-105'
                      : 'bg-zinc-100/90 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Thumbnail Squircle mềm mại */}
                <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-zinc-200">
                  <img
                    src={island.scene}
                    alt={island.title}
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      isLocked ? 'grayscale-[40%] brightness-90' : 'hover:scale-105'
                    }`}
                  />

                  {/* Gradient shadow overlay for badge readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Status Pill Badge */}
                  <div className="absolute top-2 left-2">
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-sm">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>ĐÃ XONG</span>
                      </span>
                    )}
                    {isInProgress && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FD7D2E] text-white text-[10px] font-black shadow-sm animate-pulse">
                        <Zap className="w-2.5 h-2.5 fill-white" />
                        <span>ĐANG HỌC</span>
                      </span>
                    )}
                    {isLocked && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800/80 backdrop-blur-xs text-zinc-300 text-[10px] font-medium">
                        <Lock className="w-2.5 h-2.5" />
                        <span>KHÓA</span>
                      </span>
                    )}
                  </div>

                  {/* Island Number in Thumbnail Bottom */}
                  <span className="absolute bottom-2 left-2 text-[10px] font-extrabold text-white/90 uppercase tracking-wider">
                    {island.number}
                  </span>
                </div>

                {/* Island Content */}
                <div className="mt-2.5 space-y-1">
                  <h3 className="text-sm font-bold text-zinc-900 truncate">
                    {island.title}
                  </h3>
                  <p className="text-xs font-semibold text-zinc-500 truncate">
                    {island.desc}
                  </p>

                  {/* Progress indicator */}
                  <div className="pt-1.5 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-zinc-400">
                      {island.progressText}
                    </span>
                    {isInProgress && (
                      <span className="text-[#FD7D2E] font-bold">50%</span>
                    )}
                    {isCompleted && (
                      <span className="text-emerald-600 font-bold">100%</span>
                    )}
                  </div>

                  {isInProgress && (
                    <div className="w-full h-1.5 bg-orange-100 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-[#FD7D2E] rounded-full w-1/2" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 5. Phân khu "Your Activity" (Hoạt động của con) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-black text-zinc-900">
            Hoạt Động Của Con
          </h2>
          <span className="text-xs font-semibold text-purple-600">
            Xem tất cả
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Thẻ 1 (Tím nhạt #f3f0ff) */}
          <div
            onClick={() => onOpenActivity?.('lessons')}
            className="group relative rounded-3xl bg-[#f3f0ff] p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md cursor-pointer"
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                <BookOpen className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Avatar stack + Action button */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white overflow-hidden bg-rose-200">
                    <img
                      src={designerAssets.brand.mascot}
                      alt="Friend 1"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white overflow-hidden bg-sky-200">
                    <img
                      src={designerAssets.lobby.mii}
                      alt="Friend 2"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white overflow-hidden bg-amber-200">
                    <img
                      src={designerAssets.lobby.girl}
                      alt="Friend 3"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-[#18181b] text-white flex items-center justify-center shadow-sm group-hover:scale-105 active:scale-95 transition-all">
                  <ArrowUpRight className="w-4 h-4 text-zinc-200" />
                </div>
              </div>
            </div>

            {/* Bottom metrics */}
            <div className="mt-5 space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                12 bài học
              </div>
              <p className="text-xs font-semibold text-zinc-500">
                Đã hoàn thành xuất sắc tuần này
              </p>
            </div>
          </div>

          {/* Thẻ 2 (Vàng Bơ #fffbeb) */}
          <div
            onClick={() => onOpenActivity?.('hours')}
            className="group relative rounded-3xl bg-[#fffbeb] p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md cursor-pointer"
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
                <Clock className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Avatar stack + Action button */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white overflow-hidden bg-emerald-200">
                    <img
                      src={designerAssets.lobby.cardMee}
                      alt="Friend 4"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white overflow-hidden bg-violet-200">
                    <img
                      src={designerAssets.brand.mascot}
                      alt="Friend 5"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white overflow-hidden bg-orange-200">
                    <img
                      src={designerAssets.lobby.mii}
                      alt="Friend 6"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-[#18181b] text-white flex items-center justify-center shadow-sm group-hover:scale-105 active:scale-95 transition-all">
                  <ArrowUpRight className="w-4 h-4 text-zinc-200" />
                </div>
              </div>
            </div>

            {/* Bottom metrics */}
            <div className="mt-5 space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                43 giờ rèn luyện
              </div>
              <p className="text-xs font-semibold text-zinc-500">
                Thời gian tích lũy kiên trì &amp; sáng tạo
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ConceptHomeScreen
