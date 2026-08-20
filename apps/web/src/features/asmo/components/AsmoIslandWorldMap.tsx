import { useState, useMemo } from 'react'
import {
  Star,
  Lock,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Trophy,
  Award,
  ChevronLeft,
  ChevronRight,
  Map,
  Compass,
  Layers,
  Flame,
  Volume2,
  Gift,
  HelpCircle,
  X,
  Footprints,
} from 'lucide-react'
import {
  ASMO_LMS_STAGES,
  type AsmoLmsStage,
  type AsmoLmsLesson,
  type AsmoLmsProgressState,
  isLessonUnlocked,
  getStageStats,
} from '../data/asmo-curriculum-lms'
import { AikidCatCharacter, type AikidCatPose } from '@/shared/components/ui/AikidCatCharacter'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

// ════════════════════════════════════════════════════════════════════════════
// FLAT CLAY ASSETS (AUTHENTIC SOFT CLAY ARTWORK & MEE COMPANION)
// ════════════════════════════════════════════════════════════════════════════

export const MEE_FLAT_CLAY_MASCOT = '/assets/asmo-islands/mee_flat_clay_guide.jpg'

export interface AsmoIslandTheme {
  id: string
  stageNumber: number
  islandName: string
  englishName: string
  tagline: string
  badgeName: string
  badgeIcon: string
  icon: string
  heroEmoji: string
  themeColor: string
  bgGradient: string
  skyGradient: string
  cardBorder: string
  pathStroke: string
  pathGlow: string
  image: string
  islandDecorIcons: string[]
  sceneryDescription: string
  meeQuotes: string[]
  chest: {
    name: string
    bonusXp: number
    badge: string
    badgeIcon: string
    description: string
  }
}

export const ASMO_ISLAND_THEMES: Record<string, AsmoIslandTheme> = {
  'stage-1': {
    id: 'stage-1',
    stageNumber: 1,
    islandName: 'Đảo Táo Đỏ & Rừng Phép Cộng Trừ',
    englishName: 'Apple Forest Island',
    tagline: 'Cộng & Trừ 0 - 100 • Gộp Tách & Đặt Cột Dọc',
    badgeName: 'Huy Hiệu Táo Vàng Đệ Nhất',
    badgeIcon: '🍎',
    icon: '🏝️',
    heroEmoji: '🍎',
    themeColor: 'emerald',
    bgGradient: 'from-emerald-950/90 via-slate-900 to-teal-950/90',
    skyGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    cardBorder: 'border-emerald-500/40',
    pathStroke: '#10b981',
    pathGlow: 'rgba(16, 185, 129, 0.4)',
    image: '/assets/asmo-islands/island_apple_forest.jpg',
    islandDecorIcons: ['🍎', '🍏', '🌈', '🌸', '🍄', '🍃', '🌳', '🧺'],
    sceneryDescription: 'Cảnh đồi cỏ xanh ngọc, cây táo trĩu quả 🍎, dòng suối cầu vồng 🌈 và nấm bập bênh 🍄',
    meeQuotes: [
      'Cùng Mee chinh phục bài này nhé bé ơi! 🐾',
      'Mèo Mee có 4 quả táo đỏ, nhặt thêm 3 quả là thành 7 quả ngon lành! 🍎',
      'Bấm nổ bóng bay để xem phép trừ thời gian thực nhé! 🎈',
      'Bí kíp kết bạn tròn 10 sẽ giúp bé giải toán ASMO siêu nhanh! ✨',
    ],
    chest: {
      name: 'Rương Táo Vàng Phép Thuật',
      bonusXp: 100,
      badge: 'Huy Hiệu Táo Vàng Đệ Nhất',
      badgeIcon: '🍎',
      description: 'Bé đã xuất sắc hoàn thành toàn bộ 5 bài học phép cộng trừ nền tảng!',
    },
  },
  'stage-2': {
    id: 'stage-2',
    stageNumber: 2,
    islandName: 'Vương Quốc Bánh Ngọt & Phép Nhân Chia',
    englishName: 'Sweet Bakery Realm',
    tagline: 'Bảng Cửu Chương 2-9 • Phép Chia Đều & Chia Có Dư',
    badgeName: 'Huy Hiệu Bếp Trưởng Nhân Chia',
    badgeIcon: '🍰',
    icon: '🍰',
    heroEmoji: '🧁',
    themeColor: 'rose',
    bgGradient: 'from-rose-950/90 via-slate-900 to-pink-950/90',
    skyGradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    cardBorder: 'border-rose-500/40',
    pathStroke: '#f43f5e',
    pathGlow: 'rgba(244, 63, 94, 0.4)',
    image: '/assets/asmo-islands/island_sweet_bakery.jpg',
    islandDecorIcons: ['🍰', '🧁', '🍭', '🍓', '🍩', '🍬', '🧇', '✨'],
    sceneryDescription: 'Đồi bánh kem thơm lừng 🍰, kẹo mút xoắn sắc màu 🍭, khay dâu tây mọng nước 🍓',
    meeQuotes: [
      'Cùng Mee chinh phục bài này nhé bé ơi! 🐾',
      'Vương quốc bánh kem ngào ngạt hương thơm! Mee đói quá, cùng chia bánh đều nhé! 🍰',
      'Phép nhân chính là cộng nhiều nhóm bằng nhau một cách thần tốc! 🧁',
      'Bảng cửu chương 2-5 và 6-9 như những điệu nhảy ngọt ngào! 🎶',
      'Chia kẹo dâu và tìm phần dư - bài toán chia kẹo cực kỳ thú vị! 🍓',
    ],
    chest: {
      name: 'Rương Bánh Kem Hoàng Gia',
      bonusXp: 150,
      badge: 'Huy Hiệu Bếp Trưởng Nhân Chia',
      badgeIcon: '🍰',
      description: 'Bé đã thành thạo trọn vẹn bảng cửu chương và phép chia đều chia có dư!',
    },
  },
  'stage-3': {
    id: 'stage-3',
    stageNumber: 3,
    islandName: 'Quần Đảo Phân Số Pizza Biển Khơi',
    englishName: 'Pizza Fractions Archipelago',
    tagline: 'Lát Cắt Pizza • So Sánh & Phép Tính Phân Số • Chu Vi Diện Tích',
    badgeName: 'Huy Hiệu Thuyền Trưởng Phân Số',
    badgeIcon: '🍕',
    icon: '🍕',
    heroEmoji: '🧀',
    themeColor: 'amber',
    bgGradient: 'from-amber-950/90 via-slate-900 to-sky-950/90',
    skyGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    cardBorder: 'border-amber-500/40',
    pathStroke: '#f59e0b',
    pathGlow: 'rgba(245, 158, 11, 0.4)',
    image: '/assets/asmo-islands/island_pizza_fractions.jpg',
    islandDecorIcons: ['🍕', '🧀', '🌊', '⛵', '🐬', '🥥', '🏖️', '🐚'],
    sceneryDescription: 'Quần đảo phô mai vàng óng 🧀, lát pizza bay 🍕, biển ngọc bích 🌊, thuyền buồm ⛵',
    meeQuotes: [
      'Cùng Mee chinh phục bài này nhé bé ơi! 🐾',
      'Aloy thủy thủ nhí! Cùng Mee cắt bánh pizza 1/2, 1/4 để giương buồm ra khơi! 🍕',
      'Tử số là số miếng ta ăn, mẫu số là tổng số phần bằng nhau! 🧀',
      'Nhìn hình pizza trực quan, so sánh phân số không còn sợ nhầm lẫn nữa! 🐬',
      'Tính chu vi và diện tích để rào mảnh đất phô mai vàng rực rỡ! 📐',
    ],
    chest: {
      name: 'Rương Phô Mai Hải Tặc Vàng',
      bonusXp: 180,
      badge: 'Huy Hiệu Thuyền Trưởng Phân Số',
      badgeIcon: '🍕',
      description: 'Bé đã làm chủ trọn vẹn phân số trực quan, phân số của một số và hình học chu vi diện tích!',
    },
  },
  'stage-4': {
    id: 'stage-4',
    stageNumber: 4,
    islandName: 'Cao Nguyên Đồng Hồ & Thời Gian Trên Mây',
    englishName: 'Clocktower Sky Highlands',
    tagline: 'Đồng Hồ Kim • Khoảng Thời Gian Trôi • Cân Thăng Bằng',
    badgeName: 'Huy Hiệu Pháp Sư Thời Gian',
    badgeIcon: '⏰',
    icon: '⏰',
    heroEmoji: '⏳',
    themeColor: 'indigo',
    bgGradient: 'from-indigo-950/90 via-slate-900 to-cyan-950/90',
    skyGradient: 'from-indigo-500/20 via-sky-500/10 to-transparent',
    cardBorder: 'border-indigo-500/40',
    pathStroke: '#6366f1',
    pathGlow: 'rgba(99, 102, 241, 0.4)',
    image: '/assets/asmo-islands/island_clock_sky.jpg',
    islandDecorIcons: ['⏰', '⏱️', '☁️', '⚖️', '⏳', '🧭', '🌙', '☀️'],
    sceneryDescription: 'Tháp đồng hồ cổ kính lơ lửng trên tầng mây ☁️, đĩa cân vàng ⚖️, đồng hồ cát ⏳',
    meeQuotes: [
      'Cùng Mee chinh phục bài này nhé bé ơi! 🐾',
      'Tíc tắc tíc tắc! Kim giờ ngắn chỉ giờ, kim phút dài xoay từng phút trôi! ⏰',
      'Thời gian là vàng bạc! Cùng Mee đo khoảng thời gian từ sáng đến chiều nha! ⏳',
      'Đĩa cân thăng bằng khi hai bên bằng nhau - bí kíp giải toán Olympic ASMO! ⚖️',
      'Đổi đơn vị đo lường cực chuẩn xác để vượt qua các đám mây kỳ ảo! 🧭',
    ],
    chest: {
      name: 'Rương Đồng Hồ Vượt Thời Gian',
      bonusXp: 200,
      badge: 'Huy Hiệu Pháp Sư Thời Gian',
      badgeIcon: '⏰',
      description: 'Bé đã thuần thục đọc đồng hồ kim, tính thời gian trôi và giải toán cân thăng bằng logic!',
    },
  },
  'stage-5': {
    id: 'stage-5',
    stageNumber: 5,
    islandName: 'Thành Phố Pha Lê 3D & Lâu Đài Olympic',
    englishName: '3D Crystal Citadel',
    tagline: 'Khối Lập Phương 3D • Lưới Gấp Hình • Đấu Trường ASMO Đỉnh Cao',
    badgeName: 'Đại Kiện Tướng Olympic ASMO',
    badgeIcon: '🏆',
    icon: '🧊',
    heroEmoji: '🏆',
    themeColor: 'purple',
    bgGradient: 'from-purple-950/90 via-slate-900 to-indigo-950/90',
    skyGradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
    cardBorder: 'border-purple-500/40',
    pathStroke: '#a855f7',
    pathGlow: 'rgba(168, 85, 247, 0.4)',
    image: '/assets/asmo-islands/island_crystal_olympic.jpg',
    islandDecorIcons: ['🧊', '🏆', '👑', '📐', '💎', '🌌', '🌟', '🥇'],
    sceneryDescription: 'Khối lập phương phát sáng 🧊, lưới gấp đa giác 📐, lâu đài cúp vàng Olympic 🏆, dải ngân hà 🌌',
    meeQuotes: [
      'Cùng Mee chinh phục bài này nhé bé ơi! 🐾',
      'Chào mừng bé đến đỉnh cao Thành Phố Pha Lê & Đấu Trường Olympic ASMO! 🏆',
      'Xoay khối 3D trong không gian và đếm từng khối lập phương ẩn giấu! 🧊',
      'Tưởng tượng gấp các mặt của hình hộp lập phương - thử thách siêu trí tuệ! 📐',
      'Mee và cúp vàng danh giá đang chờ trao tặng nhà vô địch nhí! 👑',
    ],
    chest: {
      name: 'Rương Cúp Vàng Olympic Tối Thượng',
      bonusXp: 300,
      badge: 'Đại Kiện Tướng Olympic ASMO',
      badgeIcon: '🏆',
      description: 'Bé đã xuất sắc chinh phục toàn bộ 5 Chặng & 23 Bài Học Toán Olympic ASMO quốc tế!',
    },
  },
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ════════════════════════════════════════════════════════════════════════════

export interface AsmoIslandWorldMapProps {
  selectedStageId: string
  onSelectStage: (stageId: string) => void
  progress: AsmoLmsProgressState
  onOpenLesson: (lesson: AsmoLmsLesson) => void
}

export function AsmoIslandWorldMap({
  selectedStageId,
  onSelectStage,
  progress,
  onOpenLesson,
}: AsmoIslandWorldMapProps) {
  const [viewMode, setViewMode] = useState<'island' | 'world'>('island')
  const [meeQuoteIndex, setMeeQuoteIndex] = useState(0)
  const [meeSparkleKey, setMeeSparkleKey] = useState(0)
  const [openedChestStageId, setOpenedChestStageId] = useState<string | null>(null)

  // Get active stage
  const activeStage = useMemo(() => {
    return ASMO_LMS_STAGES.find((s) => s.id === selectedStageId) || ASMO_LMS_STAGES[0]
  }, [selectedStageId])

  const activeTheme = useMemo(() => {
    return ASMO_ISLAND_THEMES[activeStage.id] || ASMO_ISLAND_THEMES['stage-1']
  }, [activeStage.id])

  const currentStageStats = useMemo(() => {
    return getStageStats(activeStage.id, progress)
  }, [activeStage.id, progress])

  // Find current active lesson (the first unlocked but unfinished lesson)
  const currentActiveLesson = useMemo(() => {
    const unlockedUnfinished = activeStage.lessons.find((l) => {
      const isUnlocked = isLessonUnlocked(l, progress)
      const isCompleted = progress.lessons[l.id]?.completed
      return isUnlocked && !isCompleted
    })
    if (unlockedUnfinished) return unlockedUnfinished
    // If all completed or none, return the last unlocked
    const unlocked = activeStage.lessons.filter((l) => isLessonUnlocked(l, progress))
    return unlocked[unlocked.length - 1] || activeStage.lessons[0]
  }, [activeStage, progress])

  // Mascot click reaction
  const handleMeeClick = () => {
    setMeeQuoteIndex((prev) => (prev + 1) % activeTheme.meeQuotes.length)
    setMeeSparkleKey((k) => k + 1)
  }

  // Chest reward click
  const handleChestClick = (stageId: string) => {
    setOpenedChestStageId(stageId)
  }

  // Winding Path coordinates for lessons (S-curve zigzag)
  const lessonNodesCount = activeStage.lessons.length
  const nodePositions = useMemo(() => {
    if (lessonNodesCount === 5) {
      return [
        { x: 30, y: 10 },
        { x: 70, y: 28 },
        { x: 28, y: 48 },
        { x: 74, y: 68 },
        { x: 34, y: 86 },
      ]
    }
    // 4 lessons
    return [
      { x: 30, y: 12 },
      { x: 70, y: 36 },
      { x: 30, y: 62 },
      { x: 70, y: 84 },
    ]
  }, [lessonNodesCount])

  // Build SVG S-Curve Path String
  const svgPathData = useMemo(() => {
    if (nodePositions.length === 0) return ''
    const chestPoint = { x: 50, y: 97 }
    const allPoints = [...nodePositions, chestPoint]

    let d = `M ${allPoints[0].x} ${allPoints[0].y}`
    for (let i = 1; i < allPoints.length; i++) {
      const prev = allPoints[i - 1]
      const curr = allPoints[i]
      const midY = (prev.y + curr.y) / 2
      d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`
    }
    return d
  }, [nodePositions])

  // Paw prints along path
  const pawPrintPositions = useMemo(() => {
    const paws: Array<{ x: number; y: number; rot: number }> = []
    for (let i = 0; i < nodePositions.length - 1; i++) {
      const p1 = nodePositions[i]
      const p2 = nodePositions[i + 1]
      // 2 paw steps between each level node
      const mx1 = p1.x * 0.65 + p2.x * 0.35
      const my1 = p1.y * 0.65 + p2.y * 0.35
      const mx2 = p1.x * 0.35 + p2.x * 0.65
      const my2 = p1.y * 0.35 + p2.y * 0.65
      const dx = p2.x - p1.x
      const rot1 = dx > 0 ? 30 : -30
      const rot2 = dx > 0 ? 15 : -15
      paws.push({ x: mx1, y: my1, rot: rot1 })
      paws.push({ x: mx2, y: my2, rot: rot2 })
    }
    return paws
  }, [nodePositions])

  return (
    <div className="w-full space-y-6">
      {/* ── TOP CONTROLS & WORLD VIEW TOGGLE BAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-md rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-soft">
        {/* Island Navigation Tabs with Flat Clay Thumbnails */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {ASMO_LMS_STAGES.map((stg) => {
            const isSelected = selectedStageId === stg.id && viewMode === 'island'
            const stats = getStageStats(stg.id, progress)
            const isLocked = !stats.isUnlocked
            const theme = ASMO_ISLAND_THEMES[stg.id]

            return (
              <button
                key={stg.id}
                type="button"
                onClick={() => {
                  onSelectStage(stg.id)
                  setViewMode('island')
                }}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 border shadow-xs',
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-clay scale-105 ring-2 ring-indigo-300'
                    : isLocked
                    ? 'bg-slate-100/80 text-slate-400 border-slate-200 hover:bg-slate-200/80'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-indigo-200',
                )}
              >
                {/* Flat Clay Island Thumbnail */}
                <div className="relative size-6 sm:size-7 rounded-lg overflow-hidden border border-white/60 shadow-2xs shrink-0 bg-slate-100">
                  <img
                    src={theme.image}
                    alt={theme.islandName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <span>Đảo {stg.stageNumber}</span>

                {stats.isCompleted ? (
                  <span className="size-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-2xs">
                    ✓
                  </span>
                ) : isLocked ? (
                  <Lock className="size-3 text-slate-400" />
                ) : (
                  <span className="text-[10px] text-amber-500 font-black">
                    {stats.totalStars}⭐
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'island' ? 'world' : 'island')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border shadow-xs',
              viewMode === 'world'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-amber-500/20'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
            )}
          >
            {viewMode === 'world' ? (
              <>
                <Map className="size-4" />
                <span>🏝️ Vào Khám Phá Đảo</span>
              </>
            ) : (
              <>
                <Compass className="size-4 text-indigo-600" />
                <span>🗺️ Toàn Cảnh 5 Đảo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODE 1: DETAILED ISLAND EXPLORATION TRAIL VIEW (DUOLINGO/WINDING S-PATH) */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'island' ? (
        <div className="relative rounded-3xl border border-slate-700/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden shadow-2xl p-4 sm:p-8">
          {/* Ambient Scenery Background Aura with Island Image Blur */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-b opacity-40 pointer-events-none transition-all duration-700',
              activeTheme.skyGradient,
            )}
          />

          <div
            className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none filter blur-xl"
            style={{ backgroundImage: `url(${activeTheme.image})` }}
          />

          {/* Floating Ambient Decal Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {activeTheme.islandDecorIcons.map((emoji, idx) => {
              const leftPositions = [8, 85, 12, 88, 6, 92, 15, 82]
              const topPositions = [12, 18, 42, 48, 72, 78, 88, 92]
              return (
                <span
                  key={`decor-${idx}`}
                  className="absolute text-2xl sm:text-4xl opacity-20 hover:opacity-40 transition-opacity animate-pulse-subtle"
                  style={{
                    left: `${leftPositions[idx % leftPositions.length]}%`,
                    top: `${topPositions[idx % topPositions.length]}%`,
                    animationDelay: `${idx * 0.5}s`,
                  }}
                >
                  {emoji}
                </span>
              )
            })}
          </div>

          {/* ── ISLAND HEADER BANNER WITH FLAT CLAY ARTWORK ── */}
          <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
            {/* Left: Island Artwork Showcase & Headings */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1">
              {/* Flat Clay Island Hero Frame */}
              <div className="relative w-full sm:w-44 lg:w-48 h-32 sm:h-36 rounded-3xl overflow-hidden border-3 border-amber-300/60 shadow-clay shrink-0 bg-slate-900 group">
                <img
                  src={activeTheme.image}
                  alt={activeTheme.islandName}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-amber-300 border border-white/20">
                    Đảo {activeTheme.stageNumber}
                  </span>
                  <span className="text-lg drop-shadow-md">{activeTheme.badgeIcon}</span>
                </div>
              </div>

              {/* Island Title & Scenery */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-black border border-white/15">
                    Vùng Đảo {activeTheme.stageNumber} / 5
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30">
                    {activeTheme.englishName}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                  {activeTheme.islandName}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  {activeTheme.sceneryDescription}
                </p>
                <div className="text-[11px] font-extrabold text-amber-300/90 pt-0.5">
                  ✨ {activeTheme.tagline}
                </div>
              </div>
            </div>

            {/* Island Star & XP Mastery Gauges */}
            <div className="flex items-center gap-3 self-stretch lg:self-auto justify-end flex-wrap">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-xs">
                <Star className="size-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-black text-amber-300">
                  {currentStageStats.totalStars} / {currentStageStats.maxStars} Sao
                </span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-xs">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span className="text-xs font-black text-emerald-300">
                  {currentStageStats.completedLessons} / {currentStageStats.totalLessons} Bài
                </span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/20 border border-amber-400/30 backdrop-blur-md text-amber-300 text-xs font-black shadow-xs">
                <Award className="size-4 text-amber-400" />
                <span>{activeTheme.badgeName}</span>
              </div>
            </div>
          </div>

          {/* ── INTERACTIVE WINDING S-CURVE TRAIL CANVAS ── */}
          <div className="relative z-10 py-12 px-2 sm:px-8 max-w-3xl mx-auto min-h-[760px] sm:min-h-[880px]">
            {/* SVG Connecting Curved Path */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={activeTheme.pathStroke} stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Shadow / Glow line */}
              <path
                d={svgPathData}
                fill="none"
                stroke={activeTheme.pathStroke}
                strokeWidth="4"
                strokeOpacity="0.3"
                filter="url(#glow)"
              />

              {/* Main Cobblestone Path */}
              <path
                d={svgPathData}
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="2.4"
                strokeDasharray="4 6"
                strokeLinecap="round"
              />
            </svg>

            {/* Cat Paw Prints along the Path */}
            {pawPrintPositions.map((paw, pIdx) => (
              <div
                key={`paw-${pIdx}`}
                className="absolute text-amber-300/40 select-none pointer-events-none transform -translate-x-1/2 -translate-y-1/2 text-xs sm:text-sm animate-pulse-subtle"
                style={{
                  left: `${paw.x}%`,
                  top: `${paw.y}%`,
                  transform: `translate(-50%, -50%) rotate(${paw.rot}deg)`,
                  animationDelay: `${pIdx * 0.3}s`,
                }}
              >
                🐾
              </div>
            ))}

            {/* ── LESSON NODES ON WINDING TRAIL (SOFT CLAY STYLE) ── */}
            {activeStage.lessons.map((lesson, idx) => {
              const isUnlocked = isLessonUnlocked(lesson, progress)
              const lessonProgress = progress.lessons[lesson.id]
              const isCompleted = lessonProgress?.completed ?? false
              const stars = lessonProgress?.stars || 0
              const isCurrent = currentActiveLesson.id === lesson.id && (!isCompleted || isUnlocked)
              const pos = nodePositions[idx] || { x: 50, y: (idx + 1) * 18 }

              return (
                <div
                  key={lesson.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                  }}
                >
                  <div className="relative flex flex-col items-center group">
                    {/* ── MÈO MEE FLAT CLAY MASCOT COMPANION OVER CURRENT NODE ── */}
                    {isCurrent && (
                      <div className="absolute -top-40 sm:-top-44 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-auto">
                        {/* Interactive Soft Clay Speech Bubble */}
                        <div
                          onClick={handleMeeClick}
                          className="relative max-w-[220px] sm:max-w-[260px] bg-white text-slate-900 text-[11px] sm:text-xs font-black p-2.5 sm:p-3 rounded-2xl shadow-clay border-2 border-amber-400 cursor-pointer animate-bounce hover:scale-105 transition-all text-center leading-snug select-none group/speech"
                          title="Bấm vào Mèo Mee để nghe lời động viên mới!"
                        >
                          <span className="block text-indigo-700 font-extrabold flex items-center justify-center gap-1 mb-0.5">
                            <Sparkles className="size-3 text-amber-500" />
                            <span>Mèo Mee Cổ Vũ</span>
                          </span>
                          <span>{activeTheme.meeQuotes[meeQuoteIndex]}</span>

                          {/* Bubble Pointer Arrow */}
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
                        </div>

                        {/* Flat Clay Mee Mascot Avatar */}
                        <button
                          type="button"
                          onClick={handleMeeClick}
                          key={`mee-sprite-${meeSparkleKey}`}
                          className="relative size-20 sm:size-24 mt-2 cursor-pointer transition-transform hover:scale-110 active:scale-95 drop-shadow-2xl group/avatar"
                          title="Mèo Mee Flat Clay dẫn đường — Bấm để tạo bất ngờ!"
                        >
                          {/* Soft Clay Circular Outer Ring */}
                          <div className="size-full rounded-full p-1 bg-gradient-to-tr from-amber-400 via-orange-300 to-amber-200 border-3 border-amber-300 shadow-clay overflow-hidden relative">
                            <img
                              src={MEE_FLAT_CLAY_MASCOT}
                              alt="Mèo Mee Flat Clay"
                              className="w-full h-full object-cover rounded-full"
                            />
                            {/* Inner Clay Highlight */}
                            <div className="absolute inset-0 rounded-full border border-white/40 pointer-events-none" />
                          </div>

                          {/* Explorer Guide Badge */}
                          <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-0.5 shadow-md border border-white/60 animate-pulse">
                            <span>🐾 Dẫn Đường</span>
                          </span>
                        </button>
                      </div>
                    )}

                    {/* ── SOFT CLAY NODE CARD / PEDESTAL ── */}
                    <div
                      className={cn(
                        'relative flex flex-col items-center p-3 sm:p-4 rounded-3xl transition-all duration-300 border-2 shadow-clay backdrop-blur-md w-44 sm:w-56',
                        isCompleted
                          ? 'bg-slate-900/90 border-emerald-400/80 shadow-emerald-900/30'
                          : isCurrent
                          ? 'bg-slate-900/95 border-amber-400 shadow-amber-500/40 ring-4 ring-amber-400/30 scale-105'
                          : 'bg-slate-900/60 border-slate-700/60 opacity-60 grayscale-50',
                      )}
                    >
                      {/* Top Lesson Badge & Stars */}
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="px-2 py-0.5 rounded-lg bg-white/10 text-white text-[10px] font-black">
                          Bài {lesson.lessonNumber}
                        </span>

                        {/* Star Rating Display */}
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 3 }).map((_, sIdx) => (
                            <Star
                              key={`star-${sIdx}`}
                              className={cn(
                                'size-3 sm:size-3.5',
                                sIdx < stars
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                                  : 'text-slate-600',
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Center Interactive Circular Soft Clay Button */}
                      <button
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => onOpenLesson(lesson)}
                        className={cn(
                          'relative size-16 sm:size-20 rounded-full flex flex-col items-center justify-center shadow-clay transition-all duration-300 active:scale-95 cursor-pointer border-3',
                          isCompleted
                            ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-300 text-white hover:scale-105 hover:shadow-emerald-500/50'
                            : isCurrent
                            ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 border-amber-300 text-white hover:scale-110 shadow-[0_0_25px_rgba(251,191,36,0.6)] animate-pulse'
                            : 'bg-slate-800 border-slate-600 text-slate-500 cursor-not-allowed',
                        )}
                      >
                        <span className="text-2xl sm:text-3xl select-none drop-shadow-sm">
                          {lesson.icon}
                        </span>

                        {/* Status Float Badge */}
                        {isCompleted ? (
                          <span className="absolute -bottom-1 -right-1 size-6 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md">
                            <CheckCircle2 className="size-3.5" />
                          </span>
                        ) : isCurrent ? (
                          <span className="absolute -top-1 -right-1 size-6 bg-amber-400 text-slate-950 font-black rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md animate-bounce">
                            <Play className="size-3 fill-current ml-0.5" />
                          </span>
                        ) : (
                          <span className="absolute -bottom-1 -right-1 size-6 bg-slate-700 text-slate-300 rounded-full flex items-center justify-center border-2 border-slate-900">
                            <Lock className="size-3" />
                          </span>
                        )}
                      </button>

                      {/* Title & XP Badge */}
                      <div className="text-center mt-2.5 space-y-1 w-full">
                        <h4 className="text-xs sm:text-sm font-black text-white leading-snug line-clamp-1">
                          {lesson.title}
                        </h4>
                        <div className="flex items-center justify-center gap-1 text-[10px] text-amber-300 font-bold">
                          <Zap className="size-3 fill-amber-400 text-amber-400" />
                          <span>+{lesson.xpReward} XP</span>
                        </div>
                      </div>

                      {/* Action CTA Button */}
                      <div className="mt-2 w-full">
                        {isUnlocked ? (
                          <Button
                            type="button"
                            variant={isCurrent ? 'primary' : 'secondary'}
                            onClick={() => onOpenLesson(lesson)}
                            className={cn(
                              'w-full gap-1 rounded-xl text-[11px] font-black py-1.5 cursor-pointer shadow-xs',
                              isCurrent
                                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:brightness-110 shadow-clay'
                                : isCompleted
                                ? 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700',
                            )}
                          >
                            {isCompleted ? (
                              <>
                                <RotateCcw className="size-3" />
                                <span>Học Lại</span>
                              </>
                            ) : (
                              <>
                                <Play className="size-3 fill-current" />
                                <span>Bắt Đầu</span>
                              </>
                            )}
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center gap-1 py-1 text-[10px] font-bold text-slate-500 bg-slate-800/80 rounded-xl border border-slate-700">
                            <Lock className="size-2.5" />
                            <span>Khóa</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* ── FINAL ISLAND TREASURE CHEST (RƯƠNG KHO BÁU VÀNG CUỐI ĐẢO) ── */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
              style={{
                left: '50%',
                top: '97%',
              }}
            >
              <div className="relative flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleChestClick(activeStage.id)}
                  className={cn(
                    'relative p-4 sm:p-5 rounded-3xl flex flex-col items-center justify-center shadow-clay transition-all duration-300 border-2 cursor-pointer backdrop-blur-md w-48 sm:w-60 group',
                    currentStageStats.isCompleted
                      ? 'bg-gradient-to-br from-amber-500/30 via-slate-900 to-amber-900/40 border-amber-400 shadow-amber-500/50 hover:scale-105 animate-pulse-subtle'
                      : 'bg-slate-900/80 border-slate-700 hover:border-slate-500 opacity-85',
                  )}
                >
                  {/* Glowing Chest Icon */}
                  <div className="relative size-16 sm:size-20 flex items-center justify-center text-4xl sm:text-5xl mb-2 group-hover:scale-110 transition-transform">
                    <span>{currentStageStats.isCompleted ? '👑' : '🎁'}</span>
                    {currentStageStats.isCompleted && (
                      <span className="absolute -top-1 -right-1 text-2xl animate-spin-slow">
                        ✨
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-black text-amber-300 text-center leading-snug">
                    {activeTheme.chest.name}
                  </h4>

                  <p className="text-[10px] text-slate-300 text-center mt-1">
                    {currentStageStats.isCompleted
                      ? `🎉 Đã Mở Khóa! (+${activeTheme.chest.bonusXp} XP & Huy Hiệu)`
                      : `Cần ${currentStageStats.maxStars}/${currentStageStats.maxStars} ⭐ để mở rương`}
                  </p>

                  <div className="mt-2.5 px-3 py-1 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-sm">
                    <Gift className="size-3" />
                    <span>{currentStageStats.isCompleted ? 'Xem Chiến Tích' : 'Khám Phá Rương'}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ── BOTTOM ISLAND NAVIGATION BAR ── */}
          <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/10 mt-8">
            <button
              type="button"
              disabled={activeStage.stageNumber === 1}
              onClick={() => {
                const prevStage = ASMO_LMS_STAGES.find(
                  (s) => s.stageNumber === activeStage.stageNumber - 1,
                )
                if (prevStage) onSelectStage(prevStage.id)
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-white transition-all border border-white/10 cursor-pointer"
            >
              <ChevronLeft className="size-4" />
              <span>Đảo Trước</span>
            </button>

            <span className="text-xs font-extrabold text-slate-300">
              Đảo {activeStage.stageNumber} / 5: {activeTheme.islandName}
            </span>

            <button
              type="button"
              disabled={activeStage.stageNumber === 5}
              onClick={() => {
                const nextStage = ASMO_LMS_STAGES.find(
                  (s) => s.stageNumber === activeStage.stageNumber + 1,
                )
                if (nextStage) onSelectStage(nextStage.id)
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold text-white transition-all border border-white/10 cursor-pointer"
            >
              <span>Đảo Kế Tiếp</span>
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════ */
        /* MODE 2: BIRD'S EYE ARCHIPELAGO WORLD MAP OVERVIEW (5 FLOATING ISLANDS) */
        /* ══════════════════════════════════════════════════════════════════════ */
        <div className="relative rounded-3xl border border-indigo-900/60 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Cosmic World Map Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 text-amber-300 px-3 py-0.5 text-xs font-bold border border-amber-400/30">
                <Compass className="size-3.5" />
                <span>Bản Đồ Quần Đảo Toán Học Olympic ASMO</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5">
                5 Vùng Đảo Học Tập Kỳ Thú 🗺️
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl">
                Khám phá thế giới toán học diệu kỳ qua 5 vùng đảo độc đáo. Thu thập đủ Sao ⭐ để mở khóa các vùng đất huyền thoại mới!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('island')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-clay transition-all cursor-pointer"
            >
              <Map className="size-4" />
              <span>Vào Đang Học: Đảo {activeStage.stageNumber}</span>
            </button>
          </div>

          {/* 5 Floating Islands Interactive Archipelago Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ASMO_LMS_STAGES.map((stage) => {
              const theme = ASMO_ISLAND_THEMES[stage.id]
              const stats = getStageStats(stage.id, progress)
              const isLocked = !stats.isUnlocked
              const isSelected = stage.id === selectedStageId

              return (
                <div
                  key={stage.id}
                  className={cn(
                    'relative rounded-3xl border-2 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-clay group',
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-slate-900 border-amber-400 ring-2 ring-amber-400/40 scale-[1.02]'
                      : isLocked
                      ? 'bg-slate-900/60 border-slate-800 opacity-75 grayscale-40'
                      : 'bg-slate-900/80 border-slate-700/80 hover:border-indigo-400/80 hover:bg-slate-800/90',
                  )}
                >
                  {/* Flat Clay Island Cover Image Banner */}
                  <div className="relative w-full h-44 overflow-hidden bg-slate-950 border-b border-white/10">
                    <img
                      src={theme.image}
                      alt={theme.islandName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/20" />

                    {/* Top Island Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black border border-white/20">
                        Vùng Đảo {stage.stageNumber}
                      </span>

                      {isLocked ? (
                        <span className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700">
                          <Lock className="size-3" />
                          <span>Cần {stage.requiredStarsToUnlock} ⭐</span>
                        </span>
                      ) : stats.isCompleted ? (
                        <span className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-white border border-emerald-400/50">
                          <CheckCircle2 className="size-3.5" />
                          <span>Hoàn Thành</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-500/80 backdrop-blur-md text-slate-950 border border-amber-300/50">
                          <Star className="size-3 fill-current" />
                          <span>{stats.totalStars} / {stats.maxStars} ⭐</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Floating Title */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                      <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider">
                        {theme.englishName}
                      </span>
                      <span className="text-xl">{theme.heroEmoji}</span>
                    </div>
                  </div>

                  {/* Island Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                        {theme.islandName}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                        {theme.sceneryDescription}
                      </p>

                      {/* Mini Decor Items */}
                      <div className="flex items-center gap-1.5 mt-3 text-lg select-none">
                        {theme.islandDecorIcons.slice(0, 5).map((d, dIdx) => (
                          <span key={`de-${dIdx}`}>{d}</span>
                        ))}
                      </div>
                    </div>

                    {/* Island Stats & Action Button */}
                    <div className="pt-3 border-t border-white/10 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                        <span>{stats.completedLessons} / {stats.totalLessons} Bài học</span>
                        <span className="text-amber-300 font-black flex items-center gap-1">
                          <Gift className="size-3" />
                          +{theme.chest.bonusXp} XP
                        </span>
                      </div>

                      <Button
                        type="button"
                        disabled={isLocked}
                        variant={isSelected ? 'primary' : 'secondary'}
                        onClick={() => {
                          onSelectStage(stage.id)
                          setViewMode('island')
                        }}
                        className={cn(
                          'w-full rounded-2xl text-xs font-black py-2.5 cursor-pointer shadow-clay',
                          isLocked
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700'
                            : isSelected
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:brightness-110'
                            : 'bg-white/10 text-white hover:bg-white/20 border-white/20',
                        )}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="size-3.5" />
                            <span>Chưa Mở Khóa</span>
                          </>
                        ) : (
                          <>
                            <Compass className="size-3.5" />
                            <span>Khám Phá Đảo Này</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── CHEST REWARD CELEBRATION MODAL ── */}
      {openedChestStageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          {(() => {
            const chestTheme = ASMO_ISLAND_THEMES[openedChestStageId]
            const stats = getStageStats(openedChestStageId, progress)

            return (
              <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-400 shadow-clay space-y-5 text-center">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setOpenedChestStageId(null)}
                  className="absolute top-4 right-4 size-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center cursor-pointer transition-all border border-white/10"
                >
                  <X className="size-4" />
                </button>

                {/* Big Mascot & Chest Visual */}
                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="relative text-6xl sm:text-7xl mb-3 animate-bounce">
                    {stats.isCompleted ? '👑' : '🎁'}
                    <span className="absolute -top-2 -right-2 text-3xl">✨</span>
                  </div>

                  {/* Flat Clay Mee Mascot Round Avatar */}
                  <div className="size-20 rounded-full border-3 border-amber-300 overflow-hidden shadow-clay p-0.5 bg-gradient-to-tr from-amber-400 to-orange-400">
                    <img
                      src={MEE_FLAT_CLAY_MASCOT}
                      alt="Mèo Mee Flat Clay"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30">
                    Kho Báu Vùng Đảo {chestTheme.stageNumber}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {chestTheme.chest.name}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                    {stats.isCompleted
                      ? chestTheme.chest.description
                      : `Bé cần đạt trọn vẹn ${stats.maxStars} ⭐ tại Đảo ${chestTheme.stageNumber} để mở khóa rương kho báu này!`}
                  </p>
                </div>

                {/* Rewards Breakdown Card */}
                <div className="bg-white/10 rounded-2xl p-4 border border-white/15 space-y-2 text-left shadow-inner">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">Phần Thưởng Điểm XP:</span>
                    <span className="text-amber-300 font-black flex items-center gap-1">
                      <Zap className="size-3.5 text-amber-400 fill-amber-400" />
                      +{chestTheme.chest.bonusXp} XP
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">Huy Hiệu Danh Dự:</span>
                    <span className="text-emerald-300 font-black flex items-center gap-1">
                      <span>{chestTheme.chest.badgeIcon}</span>
                      <span>{chestTheme.chest.badge}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">Tiến Độ Sao Hiện Tại:</span>
                    <span className="text-amber-300 font-black">
                      {stats.totalStars} / {stats.maxStars} ⭐
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setOpenedChestStageId(null)}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-sm py-2.5 rounded-2xl shadow-clay cursor-pointer"
                >
                  {stats.isCompleted ? 'Tuyệt Vời Bé Ơi! 🚀' : 'Cố Gắng Luyện Tập! 🐾'}
                </Button>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
