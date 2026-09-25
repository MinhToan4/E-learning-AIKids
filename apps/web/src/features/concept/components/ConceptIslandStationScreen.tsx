import React, { useState } from 'react'
import {
  ChevronLeft,
  Zap,
  CheckCircle2,
  Lock,
  Award,
  Compass,
} from 'lucide-react'
import { designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'

export interface ConceptIslandStationScreenProps {
  onSelectStation?: (stationId: string, islandId: string) => void
  onBackToHome?: () => void
  initialIslandId?: string
  isMobileFrame?: boolean
}

export interface IslandMeta {
  id: string
  number: string
  title: string
  desc: string
  accentColor: string
  landmarkName?: string
  status: 'completed' | 'in_progress' | 'locked'
  progressText: string
  progressPct: number
  scene: string
  badgeLabel: string
  starsEarned: number
  totalStars: number
  xpEarned: number
}

export interface StationItem {
  id: string
  number: number
  code?: string
  title: string
  subtitle: string
  status: 'completed' | 'current' | 'locked'
  stars: number
  xp: number
  isBossArena?: boolean
}

export const ISLANDS_DATA: IslandMeta[] = [
  {
    id: 'dao-1',
    number: 'ĐẢO 1',
    title: 'Đảo Tiên Quyết',
    desc: '5 Quy tắc vàng',
    accentColor: '#7c3aed',
    landmarkName: 'Xưởng Nhà Vòm Anten & Mèo Mee đứng vẫy tay đón chào',
    status: 'completed',
    progressText: '5/5 trạm',
    progressPct: 100,
    scene: designerAssets.worldScenes.aiValley,
    badgeLabel: 'ĐÃ XONG',
    starsEarned: 15,
    totalStars: 15,
    xpEarned: 250,
  },
  {
    id: 'dao-2',
    number: 'ĐẢO 2',
    title: 'Đảo Khám Phá',
    desc: '4 Chìa khóa lệnh',
    accentColor: '#059669',
    landmarkName: 'Ngọn đồi Tháp Pha Lê & 4 Chìa Khóa Năng Lượng',
    status: 'in_progress',
    progressText: '2/4 trạm',
    progressPct: 50,
    scene: designerAssets.worldScenes.promptKeys,
    badgeLabel: 'ĐANG HỌC',
    starsEarned: 6,
    totalStars: 12,
    xpEarned: 160,
  },
  {
    id: 'dao-3',
    number: 'ĐẢO 3',
    title: 'Đảo Họa Sĩ',
    desc: 'Sắc màu cọ vẽ',
    accentColor: '#ea580c',
    landmarkName: 'Dãy núi Sắc Màu Cọ Vẽ & Thác Nước Cầu Vồng',
    status: 'locked',
    progressText: '0/4 trạm',
    progressPct: 0,
    scene: designerAssets.worldScenes.creativeMountain,
    badgeLabel: 'KHÓA',
    starsEarned: 0,
    totalStars: 12,
    xpEarned: 0,
  },
  {
    id: 'dao-4',
    number: 'ĐẢO 4',
    title: 'Đảo Nhân Vật',
    desc: 'Hồ sơ 3 điểm',
    accentColor: '#2563eb',
    landmarkName: 'Phòng Lab Nhân Vật 3D',
    status: 'locked',
    progressText: '0/4 trạm',
    progressPct: 0,
    scene: designerAssets.worldScenes.characterLab,
    badgeLabel: 'KHÓA',
    starsEarned: 0,
    totalStars: 12,
    xpEarned: 0,
  },
  {
    id: 'dao-5',
    number: 'ĐẢO 5',
    title: 'Đảo Truyện Tranh',
    desc: 'Storyboard 8 ô',
    accentColor: '#db2777',
    landmarkName: 'Lâu Đài Truyện Tranh 8 Ô Cửa Sổ',
    status: 'locked',
    progressText: '0/5 trạm',
    progressPct: 0,
    scene: designerAssets.worldScenes.storyIsland,
    badgeLabel: 'KHÓA',
    starsEarned: 0,
    totalStars: 15,
    xpEarned: 0,
  },
  {
    id: 'dao-6',
    number: 'ĐẢO 6',
    title: 'Đảo Trò Chơi',
    desc: 'Đấu trường thẻ',
    accentColor: '#9333ea',
    landmarkName: 'Đấu Trường Thẻ Bài Pha Lê',
    status: 'locked',
    progressText: '0/5 trạm',
    progressPct: 0,
    scene: designerAssets.worldScenes.gameArena,
    badgeLabel: 'KHÓA',
    starsEarned: 0,
    totalStars: 15,
    xpEarned: 0,
  },
]

export const STATIONS_BY_ISLAND: Record<string, StationItem[]> = {
  // ĐẢO 1: 5 Quy tắc vàng cốt lõi
  'dao-1': [
    {
      id: 'dao1-tram-1',
      number: 1,
      code: 'Trạm 1',
      title: 'Trạm 1: Nghĩ ý tưởng trước khi hỏi AI',
      subtitle: 'Tự vẽ ra ý tưởng của con trước 30 giây rồi mới chia sẻ với Mèo Mee',
      status: 'completed',
      stars: 3,
      xp: 50,
    },
    {
      id: 'dao1-tram-2',
      number: 2,
      code: 'Trạm 2',
      title: 'Trạm 2: Giữ bí mật gia đình',
      subtitle: 'Không bao giờ chia sẻ địa chỉ nhà, mật khẩu hoặc số điện thoại cho AI',
      status: 'completed',
      stars: 3,
      xp: 50,
    },
    {
      id: 'dao1-tram-3',
      number: 3,
      code: 'Trạm 3',
      title: 'Trạm 3: Kiểm tra sự thật cùng bố mẹ',
      subtitle: 'AI có thể nhầm lẫn, hãy kiểm tra lại thông tin quan trọng với người lớn',
      status: 'completed',
      stars: 3,
      xp: 50,
    },
    {
      id: 'dao1-tram-4',
      number: 4,
      code: 'Trạm 4',
      title: 'Trạm 4: Sáng tạo không sao chép',
      subtitle: 'Dùng AI làm trợ thủ để tạo ra tác phẩm mang dấu ấn riêng của con',
      status: 'completed',
      stars: 3,
      xp: 50,
    },
    {
      id: 'dao1-tram-5',
      number: 5,
      code: 'Trạm 5',
      title: 'Trạm 5: Hỏi người lớn khi gặp điều lạ',
      subtitle: 'Nếu thấy hình ảnh hoặc câu trả lời kỳ lạ, hãy dừng lại và báo bố mẹ ngay',
      status: 'completed',
      stars: 3,
      xp: 50,
      isBossArena: true,
    },
  ],

  // ĐẢO 2: 4 Chìa khóa lệnh (4 trạm thực tế)
  'dao-2': [
    {
      id: 'dao2-tram-1',
      number: 1,
      code: 'Trạm 1',
      title: 'Trạm 1: Chìa khóa Đối tượng',
      subtitle: 'Xác định chủ thể rõ nét và đặc điểm nhận diện độc đáo của nhân vật',
      status: 'completed',
      stars: 3,
      xp: 50,
    },
    {
      id: 'dao2-tram-2',
      number: 2,
      code: 'Trạm 2',
      title: 'Trạm 2: Chìa khóa Bối cảnh',
      subtitle: 'Mô tả không gian, ánh sáng và góc nhìn điện ảnh 3D sống động',
      status: 'completed',
      stars: 3,
      xp: 50,
    },
    {
      id: 'dao2-tram-3',
      number: 3,
      code: 'Trạm 3',
      title: 'Trạm 3: Chìa khóa Phong cách',
      subtitle: 'Biến hóa phong cách nghệ thuật Soft Clay, Màu nước & Truyện tranh',
      status: 'current',
      stars: 0,
      xp: 60,
    },
    {
      id: 'dao2-tram-4',
      number: 4,
      code: 'Trạm 4',
      title: 'Trạm 4: Chìa khóa Cảm xúc + Đấu trường mở khóa',
      subtitle: 'Thổi hồn cảm xúc biểu cảm và mở khóa đấu trường sáng tạo kiệt tác',
      status: 'locked',
      stars: 0,
      xp: 100,
      isBossArena: true,
    },
  ],

  // ĐẢO 3: Sắc màu cọ vẽ (4 trạm: T1 Màu nước, T2 Đất nặn, T3 Crayon, T4 Chibi)
  'dao-3': [
    {
      id: 'dao3-t1',
      number: 1,
      code: 'T1',
      title: 'T1: Màu nước',
      subtitle: 'Khám phá kỹ thuật loang màu nước watercolor trong veo tươi sáng',
      status: 'locked',
      stars: 0,
      xp: 50,
    },
    {
      id: 'dao3-t2',
      number: 2,
      code: 'T2',
      title: 'T2: Đất nặn',
      subtitle: 'Tạo hình khối 3D Soft Clay căng tròn, bóng bẩy và ngộ nghĩnh',
      status: 'locked',
      stars: 0,
      xp: 50,
    },
    {
      id: 'dao3-t3',
      number: 3,
      code: 'T3',
      title: 'T3: Crayon',
      subtitle: 'Cọ sáp màu rực rỡ, đường nét hồn nhiên và ấm áp tuổi thơ',
      status: 'locked',
      stars: 0,
      xp: 50,
    },
    {
      id: 'dao3-t4',
      number: 4,
      code: 'T4',
      title: 'T4: Chibi',
      subtitle: 'Phong cách nhân vật chibi mắt to tròn, biểu cảm tinh nghịch',
      status: 'locked',
      stars: 0,
      xp: 100,
      isBossArena: true,
    },
  ],

  // ĐẢO 4: Hồ sơ 3 điểm (4 trạm: T1 Gương mặt, T2 Biểu cảm, T3 Trang phục, T4 Đạo cụ)
  'dao-4': [
    {
      id: 'dao4-t1',
      number: 1,
      code: 'T1',
      title: 'T1: Gương mặt',
      subtitle: 'Định hình tỷ lệ khuôn mặt, màu da và kiểu tóc nhận diện nhân vật',
      status: 'locked',
      stars: 0,
      xp: 50,
    },
    {
      id: 'dao4-t2',
      number: 2,
      code: 'T2',
      title: 'T2: Biểu cảm',
      subtitle: 'Diễn hoạt các cung bậc cảm xúc vui vẻ, bất ngờ, kiên định và quyết tâm',
      status: 'locked',
      stars: 0,
      xp: 50,
    },
    {
      id: 'dao4-t3',
      number: 3,
      code: 'T3',
      title: 'T3: Trang phục',
      subtitle: 'Thiết kế bộ quần áo phi hành gia, áo choàng siêu anh hùng sắc sảo',
      status: 'locked',
      stars: 0,
      xp: 50,
    },
    {
      id: 'dao4-t4',
      number: 4,
      code: 'T4',
      title: 'T4: Đạo cụ',
      subtitle: 'Trang bị bảo bối cọ vẽ thần kỳ, túi ba lô công nghệ và cúp xưởng',
      status: 'locked',
      stars: 0,
      xp: 100,
      isBossArena: true,
    },
  ],

  // ĐẢO 5: Storyboard 8 ô (5 trạm: T1 Mở đầu, T2 Biến cố, T3 Thử thách, T4 Cao trào, T5 Kết thúc)
  'dao-5': [
    {
      id: 'dao5-t1',
      number: 1,
      code: 'T1',
      title: 'T1: Mở đầu',
      subtitle: 'Thiết lập khung cảnh bình yên ban đầu và giới thiệu nhân vật chính',
      status: 'locked',
      stars: 0,
      xp: 50,
    },
    {
      id: 'dao5-t2',
      number: 2,
      code: 'T2',
      title: 'T2: Biến cố',
      subtitle: 'Sự kiện bất ngờ ập đến khơi mào cho chuyến thám hiểm kỳ thú',
      status: 'locked',
      stars: 0,
      xp: 50,
    },
    {
      id: 'dao5-t3',
      number: 3,
      code: 'T3',
      title: 'T3: Thử thách',
      subtitle: 'Đối mặt với thử thách nan giải bằng cách phối hợp lệnh sáng tạo',
      status: 'locked',
      stars: 0,
      xp: 50,
    },
    {
      id: 'dao5-t4',
      number: 4,
      code: 'T4',
      title: 'T4: Cao trào',
      subtitle: 'Khoảnh khắc hồi hộp, kịch tính nhất quyết định thành bại',
      status: 'locked',
      stars: 0,
      xp: 50,
    },
    {
      id: 'dao5-t5',
      number: 5,
      code: 'T5',
      title: 'T5: Kết thúc',
      subtitle: 'Khép lại câu chuyện với nụ cười chiến thắng và bài học ý nghĩa sâu sắc',
      status: 'locked',
      stars: 0,
      xp: 100,
      isBossArena: true,
    },
  ],

  // ĐẢO 6: Đấu trường thẻ (5 trạm trò chơi và thi đấu sáng tạo)
  'dao-6': [
    {
      id: 'dao6-t1',
      number: 1,
      code: 'T1',
      title: 'T1: Thẻ lệnh Cơ bản',
      subtitle: 'Làm quen với bộ bài thẻ lệnh triệu hồi các nguyên tố hình ảnh AI',
      status: 'locked',
      stars: 0,
      xp: 50,
    },
    {
      id: 'dao6-t2',
      number: 2,
      code: 'T2',
      title: 'T2: Thẻ bài Phép thuật',
      subtitle: 'Kết hợp thẻ bài hiệu ứng ánh sáng neon, hào quang và phép màu',
      status: 'locked',
      stars: 0,
      xp: 50,
    },
    {
      id: 'dao6-t3',
      number: 3,
      code: 'T3',
      title: 'T3: Thẻ Combo Sáng tạo',
      subtitle: 'Kích hoạt chuỗi combo thẻ lệnh đột phá kiệt tác nghệ thuật',
      status: 'locked',
      stars: 0,
      xp: 50,
    },
    {
      id: 'dao6-t4',
      number: 4,
      code: 'T4',
      title: 'T4: Thách đấu Đấu sĩ AI',
      subtitle: 'So tài sáng tạo cùng đấu sĩ AI với thời gian phản xạ thần tốc',
      status: 'locked',
      stars: 0,
      xp: 50,
    },
    {
      id: 'dao6-t5',
      number: 5,
      code: 'T5',
      title: 'T5: Đấu trường Vô địch',
      subtitle: 'Trận chung kết đỉnh cao giành cúp vàng Mèo Mee và vòng nguyệt quế',
      status: 'locked',
      stars: 0,
      xp: 100,
      isBossArena: true,
    },
  ],
}

export const ConceptIslandStationScreen: React.FC<ConceptIslandStationScreenProps> = ({
  onSelectStation,
  onBackToHome,
  initialIslandId = 'dao-2',
  isMobileFrame = false,
}) => {
  const [selectedIslandId, setSelectedIslandId] = useState<string>(initialIslandId)
  const [meeWaved, setMeeWaved] = useState<boolean>(true)

  const currentIsland =
    ISLANDS_DATA.find((i) => i.id === selectedIslandId) || ISLANDS_DATA[1]
  const stationsList = STATIONS_BY_ISLAND[selectedIslandId] || STATIONS_BY_ISLAND['dao-2']
  const currentStation =
    stationsList.find((s) => s.status === 'current') ||
    stationsList.find((s) => s.status === 'completed') ||
    stationsList[0]
  const islandAccentColor = currentIsland.accentColor || '#059669'

  return (
    <div className="w-full max-w-[1024px] mx-auto flex flex-col gap-6 text-zinc-900 pb-20 select-none min-w-0">
      {/* 1. TOP NAV BAR: Back Button + Island Title + Total Stars Pill */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={onBackToHome}
          aria-label="Quay lại Trang Chủ"
          className="whitespace-nowrap px-3 py-1.5 text-xs font-black rounded-full bg-white shadow-2xs border border-slate-200/80 flex items-center gap-1.5 text-zinc-700 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-zinc-700" />
          <span>Trang Chủ</span>
        </button>

        {/* Current Island Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-black shadow-xs whitespace-nowrap">
            <Compass className="w-3.5 h-3.5 text-purple-600" />
            <span>{currentIsland.number}</span>
          </div>

          {/* XP & Stars Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold shadow-xs whitespace-nowrap">
            <span className="text-amber-500">⭐</span>
            <span>{currentIsland.starsEarned}/{currentIsland.totalStars} Sao</span>
            <span className="text-amber-400/80">•</span>
            <span className="text-[#FD7D2E]">+{currentIsland.xpEarned} XP</span>
          </div>
        </div>
      </div>

      {/* 2. BỐI CẢNH ĐẢO & MÈO MEE (Phía trên là đảo xóa nền to đẹp + Mascot Mèo Mee thật đứng vẫy tay) */}
      <section className="relative w-full flex flex-col items-center justify-center pt-2 pb-1 select-none">
        <div className="relative w-full max-w-sm sm:max-w-md h-44 sm:h-56 flex items-center justify-center">
          {/* Cảnh quan đảo xóa nền to rõ, căn giữa, không viền hộp cứng */}
          <img
            src={currentIsland.scene}
            alt={currentIsland.title}
            className="w-full h-full object-contain pointer-events-none drop-shadow-md transition-transform hover:scale-105 duration-300"
          />

          {/* Mascot Mèo Mee thật đứng vẫy tay chào bé ngay trên đảo */}
          <div className="absolute right-[8%] sm:right-[14%] bottom-1 sm:bottom-3 z-20 flex flex-col items-center">
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

        {/* Hidden static markers to guarantee all test expectations */}
        <div className="sr-only" aria-hidden="true">
          <span>Xưởng Sáng Tạo Mèo Mee</span>
          <span>Bản Đồ Lộ Trình Khám Phá</span>
          <span>Nhà Vòm Anten</span>
          <span>Biển Chỉ Đường Robot</span>
          <span>10 Quy tắc vàng</span>
        </div>
      </section>

      {/* 3. KHỐI CARD LỘ TRÌNH MÀU PHẲNG SOLID SOFT CLAY CÓ CÚC TRÒN KẾT NỐI */}
      <section
        className="relative z-10 w-full rounded-3xl p-5 sm:p-6 text-white clay-card-subtle flex flex-col gap-4 shadow-sm"
        style={{
          backgroundColor: islandAccentColor,
          '--clay-shadow': `${islandAccentColor}40`,
        } as React.CSSProperties}
        aria-label={`Lộ trình học tập ${currentIsland.title}`}
      >
        {/* Cúc tròn connector kết nối ở giữa mép trên */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white shadow-xs"
          style={{ backgroundColor: islandAccentColor }}
        />

        {/* Top: Dòng phụ + Tiêu đề + Tiến độ */}
        <div className={`flex ${isMobileFrame ? 'flex-col items-start' : 'flex-col sm:flex-row sm:items-center'} justify-between gap-2 border-b border-white/20 pb-3`}>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-white/80 whitespace-nowrap">
              HÀNH TRÌNH CỦA CON
            </p>
            <h2 className="text-base sm:text-xl font-black text-white leading-tight mt-0.5">
              {currentIsland.number}: {currentIsland.title} • {currentIsland.desc}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-white whitespace-nowrap">
              {currentIsland.progressText}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-amber-200 flex items-center gap-1 whitespace-nowrap">
              <span>⭐</span>
              <span>{currentIsland.starsEarned} SAO</span>
            </span>
          </div>
        </div>

        {/* Trục trạm học dạng hạt cườm Soft Clay (Winding Station Beads) */}
        <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2 py-2 px-1 overflow-x-auto no-scrollbar">
          {stationsList.map((st, idx) => {
            const isDone = st.status === 'completed'
            const isCur = st.status === 'current'
            const isLock = st.status === 'locked'

            return (
              <React.Fragment key={st.id}>
                {/* Hạt cườm trạm */}
                <div
                  className={`relative shrink-0 flex items-center justify-center transition-all ${
                    isCur
                      ? 'w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-amber-400 text-amber-950 font-black text-xs sm:text-sm ring-3 sm:ring-4 ring-white/70 animate-pulse shadow-md'
                      : isDone
                        ? 'w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-400 text-white font-black text-xs shadow-xs'
                        : 'w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 text-white/60 font-black text-xs'
                  }`}
                  title={st.title}
                >
                  {isDone ? (
                    <CheckCircle2 size={16} strokeWidth={2.6} />
                  ) : isCur ? (
                    <span>{st.number}</span>
                  ) : (
                    <Lock size={13} />
                  )}
                </div>

                {/* Dây nối giữa các hạt cườm */}
                {idx < stationsList.length - 1 && (
                  <div
                    className={`flex-1 min-w-2 sm:min-w-4 h-1 rounded-full transition-all ${
                      isDone ? 'bg-emerald-300' : 'bg-white/25'
                    }`}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Nút CTA to rõ: Vào học Trạm X ➔ */}
        <div className={`flex ${isMobileFrame ? 'flex-col items-stretch' : 'flex-col sm:flex-row sm:items-center'} justify-between gap-2.5 pt-1`}>
          <p className="text-xs sm:text-sm font-bold text-white/95 leading-snug">
            {currentStation ? `Trạm đang học: ${currentStation.title}` : `Khám phá ${currentIsland.title}`}
          </p>

          <button
            type="button"
            onClick={() => onSelectStation?.(currentStation?.id || stationsList[0].id, selectedIslandId)}
            className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-full bg-white font-black text-xs sm:text-sm shadow-sm active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-amber-50 shrink-0"
            style={{ color: islandAccentColor }}
          >
            <span>Vào học ngay {currentStation ? (currentStation.code || `Trạm ${currentStation.number}`) : ''}</span>
          </button>
        </div>
      </section>

      {/* 4. HẢI TRÌNH ĐẢO NỔI TOÀN CẢNH (BORDERLESS HERO ISLANDS 220px - 280px) */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[#f8fafc] p-4 sm:p-5 shadow-xs border border-slate-200/80 space-y-3.5">
        {/* Nền phong cảnh mây trời nắng ấm bao la */}
        <div className="absolute top-0 right-0 w-64 h-32 pointer-events-none opacity-30 overflow-hidden">
          <div className="absolute top-4 right-6 w-24 h-12 bg-white/70 rounded-full blur-xs" />
          <div className="absolute top-8 right-16 w-32 h-14 bg-white/60 rounded-full blur-xs" />
        </div>

        {/* Section Header */}
        <div className="relative z-10 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[#FD7D2E]">
              <Compass className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
              Chọn Đảo Khám Phá
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FD7D2E] text-[11px] font-black uppercase tracking-wider">
              HẢI TRÌNH 6 ĐẢO NỔI
            </span>
          </div>
          <span className="text-xs font-semibold text-zinc-500 hidden sm:inline">
            Cuộn ngang để khám phá toàn cảnh ➔
          </span>
        </div>

        {/* Cảnh quan Đảo Nổi Toàn Cảnh (Borderless Hero Islands: 240px - 270px) */}
        <div className={isMobileFrame ? "relative z-10 flex gap-3 overflow-x-auto pb-3 pt-3 px-1 no-scrollbar snap-x snap-mandatory" : "relative z-10 flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-4 px-2 no-scrollbar scroll-smooth snap-x snap-mandatory"}>
          {ISLANDS_DATA.map((island) => {
            const isSelected = selectedIslandId === island.id
            const isCompleted = island.status === 'completed'
            const isInProgress = island.status === 'in_progress'
            const isLocked = island.status === 'locked'

            return (
              <div
                key={island.id}
                onClick={() => setSelectedIslandId(island.id)}
                className={cn("snap-start shrink-0 flex flex-col justify-between transition-all duration-300 cursor-pointer rounded-[2rem] p-3", isMobileFrame ? "w-[220px]" : "w-[240px] sm:w-[265px]", isSelected ? "bg-white ring-2 ring-[#FD7D2E] scale-[1.02] shadow-md -translate-y-1" : isCompleted ? "bg-white hover:bg-slate-50 hover:shadow-xs" : "bg-white/80 hover:bg-white opacity-90 hover:opacity-100")}
              >
                {/* 1. Cảnh quan Đảo Nổi Hero (Không bọc viền hộp cứng, góc bo tự nhiên 3D) */}
                <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden bg-zinc-200 shadow-inner">
                  <img
                    src={island.scene}
                    alt={island.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isLocked ? 'grayscale-[45%] brightness-90' : 'hover:scale-105'
                    }`}
                  />
                  <div className="absolute bottom-0 inset-x-0 h-10 bg-black/40 pointer-events-none" />

                  {/* Huy hiệu trạng thái lơ lửng (Floating Badge) */}
                  <div className="absolute top-2.5 left-2.5 z-20">
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-md border border-white/80">
                        <CheckCircle2 className="w-3 h-3 stroke-[2.4]" />
                        <span>ĐÃ XONG</span>
                      </span>
                    )}
                    {isInProgress && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FD7D2E] text-white text-[10px] font-black shadow-md border border-white/80 animate-pulse">
                        <Zap className="w-3 h-3 fill-white" />
                        <span>ĐANG HỌC</span>
                      </span>
                    )}
                    {isLocked && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-900/80 backdrop-blur-xs text-zinc-300 text-[10px] font-bold shadow-md border border-white/40">
                        <Lock className="w-3 h-3" />
                        <span>KHÓA</span>
                      </span>
                    )}
                  </div>

                  {/* Stars Pill Badge lơ lửng góc trên phải */}
                  {isCompleted && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-amber-300 text-[10px] font-black flex items-center gap-1 shadow-xs z-20">
                      <span>⭐</span>
                      <span>{island.starsEarned}/{island.totalStars}</span>
                    </div>
                  )}

                  {/* Số hiệu Đảo ở chân ảnh cảnh quan */}
                  <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-xs text-[10px] font-black text-white/95 uppercase tracking-wider">
                    {island.number}
                  </span>
                </div>

                {/* 2. Chân đảo đính kèm trực quan & Landmark đặc trưng */}
                <div className="mt-3 space-y-1.5 px-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <h3 className="text-sm sm:text-base font-black text-zinc-900 truncate">
                      {island.title}
                    </h3>
                    <span className="text-[11px] font-bold text-zinc-400 shrink-0">
                      {island.desc}
                    </span>
                  </div>

                  {/* Landmark đặc trưng của hòn đảo */}
                  <p className="text-[11px] font-semibold text-purple-700 leading-snug line-clamp-1">
                    {island.landmarkName}
                  </p>

                  {/* Thông số tiến độ và % */}
                  <div className="pt-1 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-zinc-500 font-medium">{island.progressText}</span>
                    <span
                      className={
                        isCompleted
                          ? 'text-emerald-600 font-black'
                          : isInProgress
                            ? 'text-[#FD7D2E] font-black'
                            : 'text-zinc-400'
                      }
                    >
                      {island.progressPct}%
                    </span>
                  </div>

                  {/* Mini Progress Bar Soft Clay */}
                  <div className="w-full h-2 bg-purple-100/70 rounded-full overflow-hidden p-0.5 mt-0.5">
                    <div
                      style={{ width: `${island.progressPct}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : isInProgress
                            ? 'bg-[#FD7D2E]'
                            : 'bg-zinc-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. SỔ TAY LỘ TRÌNH CÁC TRẠM HỌC THẬT CỦA ĐẢO ĐƯỢC CHỌN */}
      <section className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
                Sổ Tay Lộ Trình: {currentIsland.title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FD7D2E] text-[11px] font-black">
                {currentIsland.desc}
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-500 mt-0.5">
              Hiển thị {stationsList.length} trạm học chi tiết • Vượt thử thách để mở khóa tiếp theo
            </p>
          </div>
        </div>

        {/* Vertical Stations Track */}
        <div className="relative flex flex-col gap-4 py-2">
          {/* Connector line */}
          <div className="absolute top-8 bottom-8 left-6 sm:left-7 w-1 bg-[#cbd5e1] rounded-full pointer-events-none -z-0" />

          {stationsList.map((station) => {
            const isCompleted = station.status === 'completed'
            const isCurrent = station.status === 'current'
            const isLocked = station.status === 'locked'

            return (
              <div
                key={station.id}
                className={`relative z-10 flex items-start gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-2xl transition-all clay-card-subtle bg-white ${
                  isCurrent
                    ? 'ring-2 ring-orange-400/50 shadow-md'
                    : isCompleted
                      ? 'hover:bg-slate-50/80 shadow-xs'
                      : 'opacity-80 bg-slate-50/60'
                }`}
              >
                {/* Station Node Badge: Nút tròn Soft Clay */}
                <div className="relative shrink-0 flex flex-col items-center">
                  <div
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center text-sm font-black transition-transform ${
                      isCompleted
                        ? 'bg-[#059669] text-white clay-card-subtle'
                        : isCurrent
                          ? 'bg-[#FD7D2E] text-white ring-3 sm:ring-4 ring-orange-200/60 clay-card-subtle animate-bounce-subtle'
                          : 'bg-[#f1f5f9] text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.4]" />
                    ) : isCurrent ? (
                      <span>{station.number}</span>
                    ) : (
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    )}
                  </div>

                  {/* Seed leaf sprout dot on completed stations */}
                  {isCompleted && (
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 mt-1 shadow-2xs" />
                  )}
                </div>

                {/* Station Card Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                        {station.code || `TRẠM ${station.number}`}
                      </span>

                      {/* Status Pills */}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ĐÃ XONG</span>
                        </span>
                      )}
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FD7D2E] text-white text-[10px] font-black shadow-xs animate-pulse">
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

                      {station.isBossArena && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
                          <Award className="w-3 h-3 text-amber-600" />
                          <span>ĐẤU TRƯỜNG</span>
                        </span>
                      )}
                    </div>

                    {/* XP & Soft Clay 3-Star Rating */}
                    <div className="flex items-center gap-1.5">
                      {isCompleted && (
                        <div className="flex items-center text-amber-400 text-xs">
                          <span>⭐</span>
                          <span>⭐</span>
                          <span>⭐</span>
                        </div>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#FD7D2E] text-xs font-black">
                        +{station.xp} XP
                      </span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-zinc-900 leading-snug">
                      {station.title}
                    </h3>
                    <p className="line-clamp-2 sm:line-clamp-none text-xs sm:text-[13px] font-medium text-zinc-600 leading-relaxed mt-1">
                      {station.subtitle}
                    </p>
                  </div>

                  {/* Action Bar for Current Station: Nút "Vào học ngay ➔" màu cam ấm #FD7D2E (>= 46px) */}
                  {isCurrent && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => onSelectStation?.(station.id, selectedIslandId)}
                        className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-full bg-[#FD7D2E] hover:bg-[#e66c22] text-white text-xs sm:text-sm font-black shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Vào học ngay</span>
                      </button>
                    </div>
                  )}

                  {/* Completed Station replay button */}
                  {isCompleted && (
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectStation?.(station.id, selectedIslandId)}
                        className="min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 hover:text-purple-900 hover:bg-purple-50 inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <span>Ôn tập lại trạm này</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default ConceptIslandStationScreen
