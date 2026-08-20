import { useState, useMemo } from 'react'
import {
  Star,
  CheckCircle2,
  Trophy,
  Zap,
  ChevronLeft,
  ChevronRight,
  Compass,
  Gift,
  X,
  Sparkles,
  Map,
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
import { CuteProgress } from '@/shared/components/ui/CuteProgress'
import { KidLockImageIcon } from '@/shared/components/icons/KidImageIcons'
import { Button } from '@/shared/components/ui/Button'
import { designerAssets } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'

// ════════════════════════════════════════════════════════════════════════════
// 5 ASMO REGION THEMES (AUTHENTIC AI KIDS WORLD MAP & MEE COMPANION)
// ════════════════════════════════════════════════════════════════════════════

export const MEE_FLAT_CLAY_MASCOT = '/assets/aikid-ui/mascot-original/course-wave.webp'

export interface AsmoIslandTheme {
  id: string
  stageNumber: number
  name: string
  islandName: string
  shortTitle: string
  englishName: string
  tagline: string
  badgeName: string
  badgeIcon: string
  icon: string
  heroEmoji: string
  themeColor: string
  background: string
  scene: string
  ribbon: string
  trailLabel: string
  pose: AikidCatPose
  sceneLabel: string
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
    name: 'VÙNG 1: L1 · Thế Giới Phép Cộng & Phép Trừ',
    islandName: 'Đảo Táo Đỏ & Rừng Phép Cộng Trừ',
    shortTitle: 'Vùng 1: Phép Cộng & Trừ',
    englishName: 'Apple Forest Island',
    tagline: 'Cộng & Trừ 0 - 100 • Gộp Tách & Đặt Cột Dọc',
    badgeName: 'Huy Hiệu Táo Vàng Đệ Nhất',
    badgeIcon: '🍎',
    icon: '🍎',
    heroEmoji: '🍎',
    themeColor: 'emerald',
    background: designerAssets.lobby.bgHome,
    scene: designerAssets.worldScenes.aiValley,
    ribbon: 'var(--color-mint-600)',
    trailLabel: 'Đường mòn Thung Lũng Táo',
    pose: 'guide',
    sceneLabel: 'Mee đang đứng trên đồi cỏ hướng dẫn phép cộng trừ',
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
    name: 'VÙNG 2: L2 · Vương Quốc Phép Nhân & Phép Chia',
    islandName: 'Vương Quốc Bánh Ngọt & Phép Nhân Chia',
    shortTitle: 'Vùng 2: Phép Nhân & Chia',
    englishName: 'Sweet Bakery Realm',
    tagline: 'Bảng Cửu Chương 2-9 • Phép Chia Đều & Chia Có Dư',
    badgeName: 'Huy Hiệu Bếp Trưởng Nhân Chia',
    badgeIcon: '🍰',
    icon: '🍰',
    heroEmoji: '🧁',
    themeColor: 'rose',
    background: designerAssets.lobby.bgArt,
    scene: designerAssets.worldScenes.storyIsland,
    ribbon: 'var(--color-coral-500)',
    trailLabel: 'Đường qua Đảo Bánh Ngọt',
    pose: 'welcome',
    sceneLabel: 'Mee đang chia bánh ngọt và khám phá bảng cửu chương',
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
    name: 'VÙNG 3: L3 · Quần Đảo Phân Số Pizza',
    islandName: 'Quần Đảo Phân Số Pizza Biển Khơi',
    shortTitle: 'Vùng 3: Phân Số Pizza',
    englishName: 'Pizza Fractions Archipelago',
    tagline: 'Lát Cắt Pizza • So Sánh & Phép Tính Phân Số • Chu Vi Diện Tích',
    badgeName: 'Huy Hiệu Thuyền Trưởng Phân Số',
    badgeIcon: '🍕',
    icon: '🍕',
    heroEmoji: '🧀',
    themeColor: 'amber',
    background: designerAssets.lobby.bgCharacter,
    scene: designerAssets.worldScenes.creativeMountain,
    ribbon: 'var(--color-sun-600)',
    trailLabel: 'Đường mòn Pizza Biển Khơi',
    pose: 'thinking',
    sceneLabel: 'Mee đang suy nghĩ và tính toán phân số pizza',
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
    name: 'VÙNG 4: L4 · Cao Nguyên Thời Gian Đồng Hồ',
    islandName: 'Cao Nguyên Đồng Hồ & Thời Gian Trên Mây',
    shortTitle: 'Vùng 4: Thời Gian Đồng Hồ',
    englishName: 'Clocktower Sky Highlands',
    tagline: 'Đồng Hồ Kim • Khoảng Thời Gian Trôi • Cân Thăng Bằng Logic',
    badgeName: 'Huy Hiệu Pháp Sư Thời Gian',
    badgeIcon: '⏰',
    icon: '⏰',
    heroEmoji: '⏳',
    themeColor: 'indigo',
    background: designerAssets.lobby.bgHome,
    scene: designerAssets.worldScenes.aiValley,
    ribbon: 'var(--color-sky-600)',
    trailLabel: 'Đường mòn Đồng Hồ Trên Mây',
    pose: 'walking',
    sceneLabel: 'Mee đang đi dạo trên đồi đồng hồ thời gian',
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
    name: 'VÙNG 5: L5 · Thành Phố Hình Học Không Gian 3D',
    islandName: 'Thành Phố Pha Lê 3D & Lâu Đài Olympic',
    shortTitle: 'Vùng 5: Không Gian 3D',
    englishName: '3D Crystal Citadel',
    tagline: 'Khối Lập Phương 3D • Lưới Gấp Hình • Đấu Trường Olympic ASMO',
    badgeName: 'Đại Kiện Tướng Olympic ASMO',
    badgeIcon: '🏆',
    icon: '🧊',
    heroEmoji: '🏆',
    themeColor: 'purple',
    background: designerAssets.lobby.bgCharacter,
    scene: designerAssets.worldScenes.creativeMountain,
    ribbon: 'var(--color-violet-600)',
    trailLabel: 'Đường lên Đỉnh Olympic',
    pose: 'celebrate',
    sceneLabel: 'Mee đang nhảy mừng chiến thắng trên đỉnh lâu đài pha lê',
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
// HELPER COMPONENTS & PATH MATHEMATICS
// ════════════════════════════════════════════════════════════════════════════

function StarDisplay({ count }: { count: number }) {
  const safeCount = Math.max(0, Math.min(3, count))
  return (
    <div className="flex items-center gap-1" aria-label={`${safeCount} trên 3 sao`}>
      <div className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <Star
            key={i}
            size={16}
            className={i <= safeCount ? 'fill-sun-400 text-sun-400' : 'fill-white text-slate-300'}
          />
        ))}
      </div>
      <span className="text-[10px] font-extrabold text-muted">{safeCount}/3</span>
    </div>
  )
}

const STATION_X_POSITIONS = [28, 68, 74, 43, 25, 52, 72, 42, 24, 61] as const

function getStationPoint(index: number, total: number) {
  return {
    x: STATION_X_POSITIONS[index % STATION_X_POSITIONS.length],
    y: total <= 1 ? 50 : 20 + (index * 68) / (total - 1),
  }
}

function buildStationPath(total: number) {
  if (total === 0) return ''
  const points = Array.from({ length: total }, (_, index) => getStationPoint(index, total))
  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index]
    const middleY = (previous.y + point.y) / 2
    return `${path} C ${previous.x} ${middleY}, ${point.x} ${middleY}, ${point.x} ${point.y}`
  }, `M ${points[0].x} ${points[0].y}`)
}

// ════════════════════════════════════════════════════════════════════════════
// QUEST NODE COMPONENT (AUTHENTIC AI KIDS EMERALD ROUND NODE)
// ════════════════════════════════════════════════════════════════════════════

function QuestStationNode({
  lesson,
  index,
  total,
  isUnlocked,
  isCompleted,
  stars,
  isCurrent,
  onOpenLesson,
}: {
  lesson: AsmoLmsLesson
  index: number
  total: number
  isUnlocked: boolean
  isCompleted: boolean
  stars: number
  isCurrent: boolean
  onOpenLesson: (lesson: AsmoLmsLesson) => void
}) {
  const locked = !isUnlocked
  const done = isCompleted
  const available = isUnlocked && !isCompleted

  const nodeEl = (
    <div className="quest-node-compact-wrap relative">
      {/* ── MÈO MEE COMPANION STANDING DIRECTLY AT CURRENT STATION ── */}
      {isCurrent && (
        <div className="absolute -top-24 sm:-top-28 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-auto select-none animate-bounce">
          {/* Speech bubble */}
          <div className="relative bg-white text-slate-900 text-[11px] sm:text-xs font-black px-3 py-1.5 rounded-2xl shadow-clay border-2 border-sun-400 whitespace-nowrap mb-1 flex items-center gap-1.5">
            <Sparkles className="size-3 text-sun-500 fill-sun-500 shrink-0" />
            <span>Cùng Mee chinh phục Trạm {lesson.lessonNumber} nhé! 🐾</span>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white" />
          </div>
          {/* Authentic AikidCatCharacter */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 drop-shadow-md">
            <AikidCatCharacter pose="guide" className="w-full h-full object-contain" />
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={locked}
        onClick={() => isUnlocked && onOpenLesson(lesson)}
        className={cn(
          'quest-node cursor-pointer transition-transform duration-200',
          locked && 'quest-node-locked cursor-not-allowed',
          available && 'quest-node-available',
          done && 'quest-node-completed',
        )}
        aria-label={`Trạm ${lesson.lessonNumber}: ${lesson.title}`}
      >
        {locked ? (
          <KidLockImageIcon size={46} />
        ) : done ? (
          <CheckCircle2 size={32} className="text-text" aria-hidden />
        ) : (
          <span className="font-display text-2xl text-text" aria-hidden="true">
            {lesson.lessonNumber}
          </span>
        )}
      </button>

      {!locked && (
        <div className={cn('quest-node-caption', available && 'quest-node-caption-current')}>
          <span>Trạm {lesson.lessonNumber}</span>
          {done ? <StarDisplay count={stars} /> : <strong>Đang học</strong>}
        </div>
      )}
    </div>
  )

  return (
    <li
      className="quest-map-point"
      style={{
        left: `${getStationPoint(index, total).x}%`,
        top: `${getStationPoint(index, total).y}%`,
      }}
    >
      {locked ? (
        <div className="cursor-not-allowed">{nodeEl}</div>
      ) : (
        <div onClick={() => onOpenLesson(lesson)} className="block cursor-pointer">
          {nodeEl}
        </div>
      )}
    </li>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ════════════════════════════════════════════════════════════════════════════

export interface AsmoIslandWorldMapProps {
  selectedStageId: string
  onSelectStage: (stageId: string) => void
  progress: AsmoLmsProgressState
  onOpenLesson: (lesson: AsmoLmsLesson) => void
  viewMode?: 'island' | 'world'
  onToggleViewMode?: (mode: 'island' | 'world') => void
}

export function AsmoIslandWorldMap({
  selectedStageId,
  onSelectStage,
  progress,
  onOpenLesson,
  viewMode: controlledViewMode,
  onToggleViewMode,
}: AsmoIslandWorldMapProps) {
  const [internalViewMode, setInternalViewMode] = useState<'island' | 'world'>('island')
  const viewMode = controlledViewMode ?? internalViewMode
  const setViewMode = (mode: 'island' | 'world') => {
    if (onToggleViewMode) {
      onToggleViewMode(mode)
    } else {
      setInternalViewMode(mode)
    }
  }

  const [openedChestStageId, setOpenedChestStageId] = useState<string | null>(null)

  // Active Stage & Theme
  const activeStage = useMemo(() => {
    return ASMO_LMS_STAGES.find((s) => s.id === selectedStageId) || ASMO_LMS_STAGES[0]
  }, [selectedStageId])

  const activeTheme = useMemo(() => {
    return ASMO_ISLAND_THEMES[activeStage.id] || ASMO_ISLAND_THEMES['stage-1']
  }, [activeStage.id])

  const currentStageStats = useMemo(() => {
    return getStageStats(activeStage.id, progress)
  }, [activeStage.id, progress])

  // Current active lesson
  const currentActiveLesson = useMemo(() => {
    const unlockedUnfinished = activeStage.lessons.find((l) => {
      const isUnlocked = isLessonUnlocked(l, progress)
      const isCompleted = progress.lessons[l.id]?.completed
      return isUnlocked && !isCompleted
    })
    if (unlockedUnfinished) return unlockedUnfinished
    const unlocked = activeStage.lessons.filter((l) => isLessonUnlocked(l, progress))
    return unlocked[unlocked.length - 1] || activeStage.lessons[0]
  }, [activeStage, progress])

  // Progress percentage in current stage
  const progressPct =
    activeStage.lessons.length > 0
      ? Math.round((currentStageStats.completedLessons / activeStage.lessons.length) * 100)
      : 0

  const handleChestClick = (stageId: string) => {
    setOpenedChestStageId(stageId)
  }

  return (
    <div className="w-full space-y-6">
      {/* ── 5 ISLANDS NAVIGATION SELECTOR BAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-md rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-soft">
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
                  'flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 border shadow-xs',
                  isSelected
                    ? 'bg-gradient-to-r from-mint-600 to-brand-600 text-white border-transparent shadow-clay scale-105 ring-2 ring-mint-300'
                    : isLocked
                    ? 'bg-slate-100/80 text-slate-400 border-slate-200 hover:bg-slate-200/80'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-mint-200',
                )}
              >
                <span className="text-base select-none">{theme.heroEmoji}</span>
                <span>Vùng {stg.stageNumber}</span>

                {stats.isCompleted ? (
                  <span className="size-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-2xs">
                    ✓
                  </span>
                ) : isLocked ? (
                  <KidLockImageIcon size={14} />
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
                ? 'bg-gradient-to-r from-sun-500 to-coral-500 text-white border-sun-400 shadow-sun-500/20'
                : 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100',
            )}
          >
            {viewMode === 'world' ? (
              <>
                <Map className="size-4" />
                <span>🏝️ Vào Bản Đồ Trạm Vùng {activeStage.stageNumber}</span>
              </>
            ) : (
              <>
                <Compass className="size-4 text-brand-600" />
                <span>🗺️ Toàn Cảnh 5 Vùng Đảo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODE 1: WINDING STATION TRAIL VIEW (MATCHING WORLD PAGE 100%)         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'island' ? (
        <div className="flex flex-col gap-6 page-enter">
          {/* ── HEADER CẢNH QUAN (SCENE HERO) ── */}
          <header className="course-map-hero">
            <div className="course-map-heading">
              <p className="mb-1 flex flex-wrap items-center justify-center gap-2 text-xs font-extrabold text-brand-700">
                <button
                  type="button"
                  onClick={() => setViewMode('world')}
                  className="inline-flex min-h-11 items-center gap-1 hover:text-brand-900 cursor-pointer"
                >
                  <Compass size={18} aria-hidden="true" />
                  <span>5 Vùng Đảo ASMO</span>
                </button>
                <span aria-hidden="true">›</span>
                <span>{activeTheme.shortTitle}</span>
                <span aria-hidden="true">›</span>
                <span>Bản đồ trạm</span>
              </p>
              <h1 className="font-display text-3xl leading-tight sm:text-4xl text-text">
                {activeTheme.name}
              </h1>
              <p className="mt-1 text-base font-bold text-muted">
                Đi cùng Mee và mở từng trạm trong {activeTheme.shortTitle}.
              </p>
            </div>

            {/* Scene Canvas with Art + Mèo Mee Character on Grass Hill */}
            <div className="course-map-scene" aria-label={activeTheme.sceneLabel}>
              <img src={activeTheme.scene} alt="" className="course-map-scene-art" />
              <AikidCatCharacter pose={activeTheme.pose} className="course-map-scene-cat" />
            </div>

            {/* ── THẺ RUY BĂNG TIẾN ĐỘ (COURSE MAP RIBBON) ── */}
            <div className="course-map-ribbon" style={{ backgroundColor: activeTheme.ribbon }}>
              <div className="course-map-ribbon-main">
                <div>
                  <p className="text-sm font-extrabold text-white/85">Hành trình trong vùng</p>
                  <p className="font-display text-2xl text-white">
                    {currentStageStats.completedLessons}/{activeStage.lessons.length} trạm đã chinh phục
                  </p>
                </div>

                {currentActiveLesson && (
                  <aside className="course-map-next-ticket">
                    <div>
                      <p className="text-xs font-extrabold text-mint-700 uppercase">TRẠM TIẾP THEO</p>
                      <h2 className="font-display text-xl text-text">{currentActiveLesson.title}</h2>
                      <p className="text-sm font-bold text-muted">
                        Trạm {currentActiveLesson.lessonNumber} · +{currentActiveLesson.xpReward} XP
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenLesson(currentActiveLesson)}
                      className="course-map-primary-action animate-pop cursor-pointer"
                    >
                      {progress.lessons[currentActiveLesson.id]?.completed ? 'Học lại' : 'Bắt đầu học'}
                    </button>
                  </aside>
                )}
              </div>

              {activeStage.lessons.length > 0 && (
                <CuteProgress
                  value={progressPct}
                  label="Tiến độ vùng đảo"
                  tone="mint"
                  className="course-map-progress"
                />
              )}

              {/* Station Dots Preview */}
              <div className="mt-3 flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/20">
                <span className="text-xs font-extrabold text-white/90">{activeTheme.trailLabel}</span>
                <ol className="world-station-path flex items-center gap-1.5">
                  {activeStage.lessons.map((lsn) => {
                    const lsnDone = progress.lessons[lsn.id]?.completed ?? false
                    const lsnUnlocked = isLessonUnlocked(lsn, progress)
                    const lsnCurrent = lsn.id === currentActiveLesson?.id
                    const dotClassName = cn(
                      'world-station-dot',
                      lsnDone && 'world-station-dot-done',
                      lsnCurrent && 'world-station-dot-current',
                    )
                    return (
                      <li key={lsn.id}>
                        {lsnUnlocked ? (
                          <button
                            type="button"
                            onClick={() => onOpenLesson(lsn)}
                            className={dotClassName}
                            title={lsn.title}
                          >
                            {lsn.lessonNumber}
                          </button>
                        ) : (
                          <span className={dotClassName} aria-disabled="true">
                            {lsn.lessonNumber}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ol>
              </div>

              {/* Stats Bar */}
              <div className="course-map-stats">
                <span>
                  <Trophy size={17} aria-hidden /> {currentStageStats.totalStars}/
                  {currentStageStats.maxStars} sao
                </span>
                <span>
                  <CheckCircle2 size={17} aria-hidden /> {currentStageStats.completedLessons} trạm xong
                </span>
                <span>
                  <Zap size={17} aria-hidden /> +{activeStage.lessons.reduce((acc, l) => acc + l.xpReward, 0)} XP
                </span>
                <button
                  type="button"
                  onClick={() => setViewMode('world')}
                  className="cursor-pointer"
                >
                  <Compass size={19} aria-hidden="true" /> Xem tất cả 5 vùng
                </button>
              </div>
            </div>
          </header>

          {/* ── CUNG ĐƯỜNG MÒN UỐN LƯỢN (COURSE STATION MAP) ── */}
          <section
            className="course-station-map"
            style={{
              backgroundColor: activeTheme.ribbon,
              backgroundImage: `linear-gradient(rgba(255,255,255,.2), rgba(255,255,255,.08)), url(${activeTheme.background})`,
            }}
            aria-label="Lộ trình bài học"
          >
            <div
              className="course-station-canvas pt-12 sm:pt-14 pb-6"
              style={{
                minHeight: `${Math.max(46, activeStage.lessons.length * 9)}rem`,
              }}
            >
              <svg
                className="course-game-path"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path className="course-game-path-shadow" d={buildStationPath(activeStage.lessons.length)} />
                <path className="course-game-path-road" d={buildStationPath(activeStage.lessons.length)} />
                <path className="course-game-path-dashes" d={buildStationPath(activeStage.lessons.length)} />
              </svg>

              <ol className="course-game-stations">
                {activeStage.lessons.map((lesson, index) => {
                  const isUnlocked = isLessonUnlocked(lesson, progress)
                  const isCompleted = progress.lessons[lesson.id]?.completed ?? false
                  const stars = progress.lessons[lesson.id]?.stars || 0
                  const isCurrent = lesson.id === currentActiveLesson?.id && (!isCompleted || isUnlocked)

                  return (
                    <QuestStationNode
                      key={lesson.id}
                      lesson={lesson}
                      index={index}
                      total={activeStage.lessons.length}
                      isUnlocked={isUnlocked}
                      isCompleted={isCompleted}
                      stars={stars}
                      isCurrent={isCurrent}
                      onOpenLesson={onOpenLesson}
                    />
                  )
                })}
              </ol>
            </div>

            {/* ── COMPLETION TROPHY AT END OF JOURNEY ── */}
            {currentStageStats.isCompleted ? (
              <div className="relative z-10 flex flex-col items-center mt-10 animate-pop">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-sun-400 to-coral-400 shadow-clay">
                  <Trophy size={48} className="text-white" aria-hidden="true" />
                </div>
                <p className="mt-3 font-display text-2xl text-text font-black">🏆 Xuất sắc!</p>
                <p className="text-sm font-bold text-muted">
                  Con đã hoàn thành toàn bộ hành trình {activeTheme.shortTitle}!
                </p>
                <button
                  type="button"
                  onClick={() => handleChestClick(activeStage.id)}
                  className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sun-400 to-coral-400 text-slate-950 font-black text-xs shadow-clay cursor-pointer hover:brightness-110"
                >
                  <Gift className="size-4" />
                  <span>Mở Rương Kho Báu Vàng (+{activeTheme.chest.bonusXp} XP)</span>
                </button>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center mt-8">
                <button
                  type="button"
                  onClick={() => handleChestClick(activeStage.id)}
                  className="flex flex-col items-center p-4 rounded-3xl bg-white/90 backdrop-blur-md border-2 border-sun-300 shadow-clay hover:scale-105 transition-all cursor-pointer group"
                >
                  <div className="text-4xl group-hover:scale-110 transition-transform">🎁</div>
                  <span className="font-display text-sm font-black text-text mt-1">
                    {activeTheme.chest.name}
                  </span>
                  <span className="text-xs text-muted font-bold">
                    Cần {currentStageStats.maxStars}/{currentStageStats.maxStars} ⭐ để mở
                  </span>
                </button>
              </div>
            )}
          </section>

          {/* ── BOTTOM ISLAND SWITCHER ── */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-4">
            <button
              type="button"
              disabled={activeStage.stageNumber === 1}
              onClick={() => {
                const prevStage = ASMO_LMS_STAGES.find(
                  (s) => s.stageNumber === activeStage.stageNumber - 1,
                )
                if (prevStage) onSelectStage(prevStage.id)
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-slate-700 transition-all border border-slate-200 cursor-pointer shadow-xs"
            >
              <ChevronLeft className="size-4" />
              <span>Vùng Trước</span>
            </button>

            <span className="text-xs font-extrabold text-slate-600">
              Vùng {activeStage.stageNumber} / 5: {activeTheme.shortTitle}
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-slate-700 transition-all border border-slate-200 cursor-pointer shadow-xs"
            >
              <span>Vùng Kế Tiếp</span>
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════ */
        /* MODE 2: TOÀN CẢNH 5 VÙNG ĐẢO (MATCHING WORLD PAGE 100%)               */
        /* ══════════════════════════════════════════════════════════════════════ */
        <div className="space-y-6 page-enter">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand-700">
              Hành trình Olympic ASMO
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-text">
              5 Vùng Đảo Toán Học Diệu Kỳ 🗺️
            </h2>
            <p className="text-sm font-bold text-muted">
              Đồng hành cùng Mèo Mee vượt qua 5 vùng đảo để chinh phục cúp vàng Olympic ASMO danh giá!
            </p>
          </div>

          <ol className="flex flex-col gap-10">
            {ASMO_LMS_STAGES.map((stage, index) => {
              const theme = ASMO_ISLAND_THEMES[stage.id]
              const stats = getStageStats(stage.id, progress)
              const isLocked = !stats.isUnlocked
              const isCompleted = stats.isCompleted
              const isCurrent = stage.id === selectedStageId
              const stageProgressPct =
                stage.lessons.length > 0
                  ? Math.round((stats.completedLessons / stage.lessons.length) * 100)
                  : 0

              const nextLessonInStage = stage.lessons.find((l) => {
                const unlocked = isLessonUnlocked(l, progress)
                const done = progress.lessons[l.id]?.completed
                return unlocked && !done
              }) || stage.lessons[0]

              const previousRegion =
                index > 0 ? ASMO_ISLAND_THEMES[ASMO_LMS_STAGES[index - 1].id] : null

              return (
                <li
                  key={stage.id}
                  className={cn(
                    'world-region-card relative overflow-visible',
                    isCompleted && 'world-region-card-completed',
                    (isCurrent || !isLocked) && !isCompleted && 'world-region-card-current',
                    isLocked && 'world-region-card-locked grayscale-[.35]',
                  )}
                >
                  <div className="relative flex min-h-[29rem] flex-col justify-between pt-6 sm:min-h-[32rem] sm:pt-7">
                    <div className="relative z-10 px-5 text-center sm:px-8">
                      <p className="text-xs font-extrabold uppercase tracking-widest text-brand-700">
                        Vùng {stage.stageNumber}
                      </p>
                      <h2 className="mt-1 font-display text-4xl text-text">{theme.name}</h2>
                      <p className="mx-auto mt-2 max-w-lg text-sm font-bold leading-relaxed text-muted">
                        {theme.tagline}
                      </p>
                    </div>

                    <div
                      className="world-region-scene relative z-10 flex flex-1 items-end justify-center overflow-hidden px-4 pt-2"
                      aria-label={theme.sceneLabel}
                    >
                      <img
                        src={theme.scene}
                        alt=""
                        className="world-region-art"
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                      <AikidCatCharacter pose={theme.pose} className="world-region-scene-cat" />
                    </div>

                    <div className="relative z-20">
                      <div
                        className={cn(
                          'world-region-ribbon flex w-full flex-col gap-3 px-5 py-4 text-white transition-transform duration-200 sm:px-8 sm:py-5',
                          isLocked && 'opacity-60',
                          !isLocked && 'hover:-translate-y-0.5',
                        )}
                        style={{ backgroundColor: theme.ribbon }}
                      >
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isCurrent && !isCompleted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-brand-700">
                              <Zap size={9} aria-hidden /> Tiếp theo
                            </span>
                          )}
                          <span className="rounded-full bg-black/10 px-2.5 py-1 text-xs font-extrabold text-white">
                            {isCompleted ? 'Hoàn thành' : isCurrent ? 'Đang học' : isLocked ? 'Chưa mở' : 'Sẵn sàng'}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/80 truncate">
                            {theme.englishName}
                          </p>
                          <h3 className="font-display text-xl leading-snug text-white line-clamp-2">
                            {theme.shortTitle}
                          </h3>
                        </div>

                        <div>
                          <CuteProgress
                            value={stageProgressPct}
                            label="Hoàn thành vùng"
                            tone={isCompleted ? 'mint' : 'violet'}
                          />
                        </div>

                        <div
                          className="world-station-preview"
                          aria-label={`${stats.completedLessons}/${stats.totalLessons} trạm hoàn thành`}
                        >
                          <div className="world-station-preview-head">
                            <span>{theme.trailLabel}</span>
                            <strong>
                              {stats.completedLessons}/{stats.totalLessons} trạm
                            </strong>
                          </div>
                          <ol className="world-station-path">
                            {stage.lessons.map((lsn) => {
                              const lsnDone = progress.lessons[lsn.id]?.completed ?? false
                              const lsnUnlocked = isLessonUnlocked(lsn, progress)
                              const lsnCurrent = lsn.id === nextLessonInStage?.id
                              const dotClassName = cn(
                                'world-station-dot',
                                lsnDone && 'world-station-dot-done',
                                lsnCurrent && 'world-station-dot-current',
                              )
                              return (
                                <li key={lsn.id}>
                                  {lsnUnlocked ? (
                                    <button
                                      type="button"
                                      onClick={() => onOpenLesson(lsn)}
                                      className={dotClassName}
                                      title={lsn.title}
                                    >
                                      {lsn.lessonNumber}
                                    </button>
                                  ) : (
                                    <span className={dotClassName} aria-disabled="true">
                                      {lsn.lessonNumber}
                                    </span>
                                  )}
                                </li>
                              )
                            })}
                          </ol>
                        </div>

                        {isLocked ? (
                          <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-black/10 p-3 text-left">
                            <KidLockImageIcon size={42} className="shrink-0" aria-hidden="true" />
                            <div>
                              <p className="text-sm font-extrabold text-white">Vùng sẽ mở khi con sẵn sàng</p>
                              <p className="mt-0.5 text-xs font-semibold leading-relaxed text-white/90">
                                {previousRegion
                                  ? `Hoàn thành ${previousRegion.shortTitle} để mở vùng này.`
                                  : 'Hoàn thành điều kiện trong hành trình để mở vùng này.'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            {nextLessonInStage && (
                              <button
                                type="button"
                                onClick={() => onOpenLesson(nextLessonInStage)}
                                className="world-course-primary-action cursor-pointer"
                              >
                                {progress.lessons[nextLessonInStage.id]?.completed ? 'Học lại' : 'Học tiếp'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                onSelectStage(stage.id)
                                setViewMode('island')
                              }}
                              className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-extrabold text-white hover:bg-white/10 cursor-pointer"
                            >
                              {isCompleted ? 'Học lại' : 'Xem toàn bộ trạm'}
                              <ChevronRight size={16} aria-hidden />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <svg
                    className="world-region-road"
                    viewBox="0 0 100 160"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path className="world-region-road-edge" d="M50 0 C18 42 82 102 50 160" />
                    <path className="world-region-road-surface" d="M50 0 C18 42 82 102 50 160" />
                    <path className="world-region-road-centre" d="M50 0 C18 42 82 102 50 160" />
                  </svg>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {/* ── CHEST REWARD CELEBRATION MODAL ── */}
      {openedChestStageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          {(() => {
            const chestTheme = ASMO_ISLAND_THEMES[openedChestStageId]
            const stats = getStageStats(openedChestStageId, progress)

            return (
              <div className="relative w-full max-w-md bg-white text-text rounded-3xl p-6 sm:p-8 border-2 border-sun-400 shadow-clay space-y-5 text-center">
                <button
                  type="button"
                  onClick={() => setOpenedChestStageId(null)}
                  className="absolute top-4 right-4 size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-all border border-slate-200"
                >
                  <X className="size-4" />
                </button>

                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="relative text-6xl sm:text-7xl mb-3 animate-bounce">
                    {stats.isCompleted ? '👑' : '🎁'}
                    <span className="absolute -top-2 -right-2 text-3xl">✨</span>
                  </div>

                  <div className="size-20 rounded-full border-3 border-sun-300 overflow-hidden shadow-clay p-0.5 bg-gradient-to-tr from-sun-400 to-coral-400">
                    <AikidCatCharacter pose="celebrate" className="w-full h-full object-contain" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="px-3 py-1 rounded-full bg-sun-100 text-sun-800 text-xs font-black border border-sun-200">
                    Kho Báu Vùng {chestTheme.stageNumber}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-text">
                    {chestTheme.chest.name}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed max-w-sm mx-auto font-medium">
                    {stats.isCompleted
                      ? chestTheme.chest.description
                      : `Bé cần đạt trọn vẹn ${stats.maxStars} ⭐ tại Vùng ${chestTheme.stageNumber} để mở khóa rương kho báu này!`}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-left">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted">Phần Thưởng Điểm XP:</span>
                    <span className="text-sun-600 font-black flex items-center gap-1">
                      <Zap className="size-3.5 text-sun-500 fill-sun-500" />
                      +{chestTheme.chest.bonusXp} XP
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted">Huy Hiệu Danh Dự:</span>
                    <span className="text-mint-700 font-black flex items-center gap-1">
                      <span>{chestTheme.chest.badgeIcon}</span>
                      <span>{chestTheme.chest.badge}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted">Tiến Độ Sao Hiện Tại:</span>
                    <span className="text-sun-600 font-black">
                      {stats.totalStars} / {stats.maxStars} ⭐
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setOpenedChestStageId(null)}
                  className="w-full bg-gradient-to-r from-sun-400 to-coral-400 text-slate-950 font-black text-sm py-2.5 rounded-2xl shadow-clay cursor-pointer"
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
