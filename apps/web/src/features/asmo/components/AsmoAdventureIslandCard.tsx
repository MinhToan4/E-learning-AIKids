import { useMemo, useState } from 'react'
import {
  Sparkles,
  CheckCircle2,
  Trophy,
  Zap,
  Star,
  Gift,
  Play,
  Lock,
  Compass,
  X,
  Flag,
  Crown,
} from 'lucide-react'
import {
  type AsmoLmsStage,
  type AsmoLmsLesson,
  type AsmoLmsProgressState,
  isLessonUnlocked,
  getStageStats,
} from '../data/asmo-curriculum-lms'
import { ASMO_ISLAND_THEMES, type AsmoIslandTheme } from './AsmoIslandWorldMap'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { KidLockImageIcon } from '@/shared/components/icons/KidImageIcons'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

export const ASMO_ISLAND_GRADES: Record<string, string> = {
  'stage-1': 'Khối 1 – 2',
  'stage-2': 'Khối 2 – 3',
  'stage-3': 'Khối 4 – 5',
  'stage-4': 'Khối 3 – 6',
  'stage-5': 'Khối 6 – 12',
}

export const ASMO_STATION_META: Record<
  string,
  { shortTitle: string; icon: string; numberLabel: string }
> = {
  // Stage 1
  's1-apples': { shortTitle: 'Thả Táo Gộp 10', icon: '🍎', numberLabel: '①' },
  's1-balloons': { shortTitle: 'Bấm Nổ Bóng Trừ', icon: '🎈', numberLabel: '②' },
  's1-make10': { shortTitle: 'Cầu Vồng Tròn 10', icon: '🔟', numberLabel: '③' },
  's1-column-add': { shortTitle: 'Đặt Tính Cộng Cột', icon: '➕', numberLabel: '④' },
  's1-column-sub': { shortTitle: 'Đặt Tính Trừ Mượn', icon: '➖', numberLabel: '⑤' },

  // Stage 2
  's2-cake-tray': { shortTitle: 'Khay Bánh Nhân', icon: '🍰', numberLabel: '①' },
  's2-times-table-25': { shortTitle: 'Bảng Nhân 2–5', icon: '🐸', numberLabel: '②' },
  's2-times-table-69': { shortTitle: 'Bảng Nhân 6–9', icon: '✨', numberLabel: '③' },
  's2-candy-split': { shortTitle: 'Đĩa Chia Kẹo', icon: '🍬', numberLabel: '④' },
  's2-div-remainder': { shortTitle: 'Phép Chia Có Dư', icon: '🍓', numberLabel: '⑤' },

  // Stage 3 (Exact IDs & aliases)
  's3-pizza-fractions': { shortTitle: 'Lát Cắt Pizza', icon: '🍕', numberLabel: '①' },
  's3-pizza-fraction': { shortTitle: 'Lát Cắt Pizza', icon: '🍕', numberLabel: '①' },
  's3-compare-fractions': { shortTitle: 'So Sánh Phân Số', icon: '🔍', numberLabel: '②' },
  's3-add-sub-fractions': { shortTitle: 'Cộng Trừ Phân Số', icon: '➕', numberLabel: '③' },
  's3-fraction-ops': { shortTitle: 'Cộng Trừ Phân Số', icon: '➕', numberLabel: '③' },
  's3-fraction-of-number': { shortTitle: 'Phân Số Một Số', icon: '🍫', numberLabel: '④' },
  's3-fraction-of-num': { shortTitle: 'Phân Số Một Số', icon: '🍫', numberLabel: '④' },
  's3-perimeter-area': { shortTitle: 'Chu Vi & Diện Tích', icon: '📐', numberLabel: '⑤' },

  // Stage 4
  's4-analog-clock': { shortTitle: 'Xem Đồng Hồ Kim', icon: '⏰', numberLabel: '①' },
  's4-elapsed-time': { shortTitle: 'Thời Gian Trôi', icon: '⏳', numberLabel: '②' },
  's4-balance-scale': { shortTitle: 'Cân Thăng Bằng', icon: '⚖️', numberLabel: '③' },
  's4-perimeter-area': { shortTitle: 'Lưới Chu Vi & S', icon: '📐', numberLabel: '④' },

  // Stage 5
  's5-cube-layers': { shortTitle: 'Đếm Khối 3D Tầng', icon: '🧊', numberLabel: '①' },
  's5-cube-nets': { shortTitle: 'Gấp Hộp 3D Nets', icon: '📦', numberLabel: '②' },
  's5-grid-maze': { shortTitle: 'Mê Cung Toạ Độ', icon: '🧭', numberLabel: '③' },
  's5-matchstick': { shortTitle: 'Đố Que Diêm 3D', icon: '🪵', numberLabel: '④' },
  's5-olympic-arena': { shortTitle: 'Đấu Trường ASMO', icon: '🏆', numberLabel: '⑤' },
}

export interface AsmoAdventureIslandCardProps {
  stage: AsmoLmsStage
  progress: AsmoLmsProgressState
  onSelectStage: (stageId: string) => void
  onOpenLesson: (lessonId: string) => void
}

/**
 * Candy-style progress bar with a sliding golden star
 */
function CuteCandyProgressBar({
  value,
  label,
  gradientClass,
}: {
  value: number
  label: string
  gradientClass: string
}) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-amber-500" />
          <span>{label}</span>
        </span>
        <strong className="font-display text-sm font-black text-amber-700 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200/80 shadow-2xs">
          {safeValue}%
        </strong>
      </div>

      <div
        className="relative h-6 sm:h-7 rounded-full bg-slate-200/90 p-1 shadow-inner border border-slate-300/70 overflow-visible select-none"
        role="progressbar"
        aria-label={label}
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Track Fill */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 shadow-xs relative overflow-hidden',
            gradientClass,
          )}
          style={{ width: `${safeValue}%` }}
        >
          {/* Candy Gloss Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/10 rounded-full" />
        </div>

        {/* Sliding Golden Star */}
        <div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500 flex items-center justify-center drop-shadow-md"
          style={{
            left: `${Math.max(4, Math.min(96, safeValue))}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative size-7 sm:size-8 flex items-center justify-center animate-pulse">
            <Star className="size-6 sm:size-7 text-amber-400 fill-amber-400 filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.6)]" />
            <Sparkles className="size-3 text-white absolute -top-0.5 -right-0.5 animate-spin-slow" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function AsmoAdventureIslandCard({
  stage,
  progress,
  onSelectStage,
  onOpenLesson,
}: AsmoAdventureIslandCardProps) {
  const [chestModalOpen, setChestModalOpen] = useState(false)

  const theme: AsmoIslandTheme =
    ASMO_ISLAND_THEMES[stage.id] || ASMO_ISLAND_THEMES['stage-1']
  const gradeLabel = ASMO_ISLAND_GRADES[stage.id] || 'Khối 1 – 12'
  const stats = useMemo(() => getStageStats(stage.id, progress), [stage.id, progress])

  // Current active / next unfinished lesson in stage
  const nextLesson = useMemo(() => {
    const unfinished = stage.lessons.find((l) => {
      const unlocked = isLessonUnlocked(l, progress)
      const completed = progress.lessons[l.id]?.completed
      return unlocked && !completed
    })
    if (unfinished) return unfinished
    const unlocked = stage.lessons.filter((l) => isLessonUnlocked(l, progress))
    return unlocked[unlocked.length - 1] || stage.lessons[0]
  }, [stage, progress])

  const progressPct =
    stage.lessons.length > 0
      ? Math.round((stats.completedLessons / stage.lessons.length) * 100)
      : 0

  // Island-specific visual styles (Soft Clay Palettes)
  const islandStyles = useMemo(() => {
    switch (stage.id) {
      case 'stage-1':
        return {
          cardBorder: 'border-emerald-300/80 hover:border-emerald-400',
          cardBg: 'bg-gradient-to-b from-emerald-50/95 via-teal-50/70 to-emerald-100/70',
          badgeBg: 'bg-emerald-100 border-emerald-300 text-emerald-900',
          accentPill: 'bg-emerald-600 text-white',
          trailFill: '#10b981',
          progressGradient: 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500',
          gradientBtn:
            'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-clay',
          secondaryBtn:
            'bg-emerald-100/90 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 shadow-xs',
          chestBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          dioramaSky: 'from-sky-100/90 via-emerald-50/60 to-teal-100/80',
          nodeComplete: 'bg-gradient-to-b from-emerald-400 via-teal-400 to-emerald-500 text-white ring-4 ring-emerald-200/80',
        }
      case 'stage-2':
        return {
          cardBorder: 'border-rose-300/80 hover:border-rose-400',
          cardBg: 'bg-gradient-to-b from-rose-50/95 via-pink-50/70 to-rose-100/70',
          badgeBg: 'bg-rose-100 border-rose-300 text-rose-900',
          accentPill: 'bg-rose-500 text-white',
          trailFill: '#f43f5e',
          progressGradient: 'bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500',
          gradientBtn:
            'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-clay',
          secondaryBtn:
            'bg-rose-100/90 hover:bg-rose-200 text-rose-900 border border-rose-300 shadow-xs',
          chestBg: 'bg-rose-50 border-rose-200 text-rose-900',
          dioramaSky: 'from-pink-100/90 via-rose-50/60 to-orange-100/80',
          nodeComplete: 'bg-gradient-to-b from-rose-400 via-pink-400 to-rose-500 text-white ring-4 ring-rose-200/80',
        }
      case 'stage-3':
        return {
          cardBorder: 'border-amber-300/80 hover:border-amber-400',
          cardBg: 'bg-gradient-to-b from-amber-50/95 via-yellow-50/70 to-orange-100/70',
          badgeBg: 'bg-amber-100 border-amber-300 text-amber-900',
          accentPill: 'bg-amber-600 text-white',
          trailFill: '#f59e0b',
          progressGradient: 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500',
          gradientBtn:
            'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-clay',
          secondaryBtn:
            'bg-amber-100/90 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-xs',
          chestBg: 'bg-amber-50 border-amber-200 text-amber-900',
          dioramaSky: 'from-amber-100/90 via-yellow-50/60 to-orange-100/80',
          nodeComplete: 'bg-gradient-to-b from-amber-400 via-orange-400 to-amber-500 text-white ring-4 ring-amber-200/80',
        }
      case 'stage-4':
        return {
          cardBorder: 'border-sky-300/80 hover:border-sky-400',
          cardBg: 'bg-gradient-to-b from-sky-50/95 via-indigo-50/70 to-blue-100/70',
          badgeBg: 'bg-sky-100 border-sky-300 text-sky-900',
          accentPill: 'bg-sky-600 text-white',
          trailFill: '#0284c7',
          progressGradient: 'bg-gradient-to-r from-sky-400 via-indigo-400 to-sky-500',
          gradientBtn:
            'bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-clay',
          secondaryBtn:
            'bg-sky-100/90 hover:bg-sky-200 text-sky-900 border border-sky-300 shadow-xs',
          chestBg: 'bg-sky-50 border-sky-200 text-sky-900',
          dioramaSky: 'from-sky-100/90 via-blue-50/60 to-indigo-100/80',
          nodeComplete: 'bg-gradient-to-b from-sky-400 via-indigo-400 to-sky-500 text-white ring-4 ring-sky-200/80',
        }
      case 'stage-5':
      default:
        return {
          cardBorder: 'border-purple-300/80 hover:border-purple-400',
          cardBg: 'bg-gradient-to-b from-purple-50/95 via-fuchsia-50/70 to-indigo-100/70',
          badgeBg: 'bg-purple-100 border-purple-300 text-purple-900',
          accentPill: 'bg-purple-600 text-white',
          trailFill: '#9333ea',
          progressGradient: 'bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-500',
          gradientBtn:
            'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-clay',
          secondaryBtn:
            'bg-purple-100/90 hover:bg-purple-200 text-purple-900 border border-purple-300 shadow-xs',
          chestBg: 'bg-purple-50 border-purple-200 text-purple-900',
          dioramaSky: 'from-purple-100/90 via-fuchsia-50/60 to-indigo-100/80',
          nodeComplete: 'bg-gradient-to-b from-purple-400 via-indigo-400 to-purple-500 text-white ring-4 ring-purple-200/80',
        }
    }
  }, [stage.id])

  // Total XP across all lessons in stage
  const totalStageXp = useMemo(() => {
    return stage.lessons.reduce((acc, l) => acc + l.xpReward, 0)
  }, [stage.lessons])

  // Wave offsets for Mario World Map / Duolingo style wavy S-curve trail
  const waveOffsets = [10, -14, 14, -12, 12, -10]

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border-3 p-5 sm:p-7 md:p-8 transition-all duration-300 shadow-clay hover:shadow-2xl space-y-6',
        islandStyles.cardBorder,
        islandStyles.cardBg,
      )}
    >
      {/* ── 1. HEADER & CUTE FLOATING ISLAND WORLD (DIORAMA BANNER) ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
        {/* Left Info Column */}
        <div className="space-y-3.5 max-w-2xl">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider border shadow-2xs',
                islandStyles.badgeBg,
              )}
            >
              <span className="text-base">{theme.heroEmoji}</span>
              <span>VÙNG {stage.stageNumber}</span>
            </span>

            <span className="rounded-full bg-slate-900 text-white px-3.5 py-1 text-xs font-black shadow-2xs border border-slate-800">
              {gradeLabel}
            </span>

            {stats.isCompleted ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3.5 py-1 text-xs font-black shadow-sm animate-pop">
                <CheckCircle2 className="size-3.5" />
                <span>Hoàn thành 100% 🏆</span>
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1 text-xs font-bold shadow-2xs">
                {stats.completedLessons}/{stage.lessons.length} Trạm đã chinh phục
              </span>
            )}
          </div>

          {/* Island Grand Title & Stage Name */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {stage.title}
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-black text-slate-900 leading-snug mt-1">
              {theme.heroEmoji} {theme.islandName}
            </h3>
          </div>

          {/* Catchy Tagline with Sparkles */}
          <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed flex items-center gap-2 flex-wrap">
            <Sparkles className="size-4 text-amber-500 shrink-0" />
            <span>{theme.tagline}</span>
          </p>

          {/* Cute Scenery Pill */}
          <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white/90 border border-slate-200/90 px-4 py-2 text-xs text-slate-600 font-medium backdrop-blur-xs shadow-2xs">
            <span className="text-sm select-none">
              {theme.islandDecorIcons.slice(0, 5).join(' ')}
            </span>
            <span className="hidden sm:inline line-clamp-1 font-semibold">{theme.sceneryDescription}</span>
          </div>
        </div>

        {/* Right Diorama: MÈO MEE ĐỨNG SỐNG ĐỘNG TRÊN ĐẢO NỔI */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div
            className={cn(
              'relative w-full sm:w-80 md:w-92 h-44 sm:h-48 rounded-[2rem] overflow-hidden border-3 border-white shadow-clay flex items-end justify-between p-3.5 bg-gradient-to-b',
              islandStyles.dioramaSky,
            )}
          >
            {/* Scenic Background Art */}
            <img
              src={theme.image || theme.scene}
              alt={theme.islandName}
              className="absolute inset-0 w-full h-full object-contain drop-shadow-md scale-105 group-hover:scale-110 transition-transform duration-700 pointer-events-none"
            />

            {/* Soft Sun Light & Floating Clouds Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-sky-100/30 pointer-events-none" />
            <div className="absolute top-2 left-3 text-lg opacity-80 select-none animate-float pointer-events-none">
              ☁️
            </div>
            <div className="absolute top-4 right-6 text-sm opacity-90 select-none animate-pulse pointer-events-none">
              ✨
            </div>

            {/* Speech Bubble beside Mee */}
            <div className="relative z-20 max-w-[170px] sm:max-w-[190px] bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border-2 border-amber-300 shadow-clay text-[11px] sm:text-xs font-black text-slate-800 leading-snug select-none mb-1">
              <div className="flex items-center gap-1 text-amber-500 mb-0.5 text-[10px] uppercase font-black">
                <span>🐾 Mèo Mee</span>
              </div>
              <p className="line-clamp-2">
                {theme.meeQuotes[0] || 'Cùng Mee chinh phục bài này nhé bé ơi!'}
              </p>
              {/* Bubble Arrow pointing right towards Mee */}
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-amber-300" />
            </div>

            {/* Mascot Mèo Mee Standing Proud on Island */}
            <div className="relative z-10 size-28 sm:size-32 shrink-0 drop-shadow-xl transform transition-transform group-hover:scale-105 group-hover:-translate-y-1 -mb-1">
              <AikidCatCharacter pose={theme.pose} className="w-full h-full object-contain" />
            </div>

            {/* Bottom-left Scene Pill */}
            <div className="absolute bottom-2 left-3 z-20 flex items-center gap-1.5 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-[10px] font-black text-white shadow-xs">
              <span>{theme.heroEmoji}</span>
              <span>{theme.shortTitle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. CON ĐƯỜNG MÒN TRẠM HỌC UỐN LƯỢN PHIÊU LƯU (CUTE WINDING S-CURVE ADVENTURE TRAIL) ── */}
      <div className="space-y-3.5">
        {/* Trail Subheader Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap px-1">
          <div className="flex items-center gap-2">
            <Compass className="size-4 text-slate-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              {theme.trailLabel} ({stage.lessons.length} Trạm Học Tương Tác)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1 text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200/80">
              <Star className="size-3.5 text-amber-500 fill-amber-500" />
              <span>{stats.totalStars}/{stats.maxStars} ⭐</span>
            </span>
            <span className="flex items-center gap-1 text-sky-800 bg-sky-100/80 px-2.5 py-0.5 rounded-full border border-sky-200/80">
              <Zap className="size-3.5 text-sky-500 fill-sky-500" />
              <span>+{totalStageXp} XP</span>
            </span>
          </div>
        </div>

        {/* Wavy Trail Stepping Stone Canvas */}
        <div className="relative rounded-[2rem] bg-gradient-to-b from-white/95 via-slate-50/90 to-white/95 border-2 border-slate-200/90 p-5 sm:p-7 shadow-inner overflow-x-auto select-none">
          {/* Subtle Background Floating Cute Decors */}
          <div className="absolute top-3 left-6 text-base opacity-40 pointer-events-none select-none">🌸</div>
          <div className="absolute top-4 right-16 text-base opacity-40 pointer-events-none select-none">🍄</div>
          <div className="absolute bottom-4 left-1/4 text-base opacity-35 pointer-events-none select-none">🍀</div>
          <div className="absolute bottom-3 right-1/3 text-base opacity-35 pointer-events-none select-none">✨</div>

          {/* Stepping Trail Nodes Row with Wavy Vertical Offsets */}
          <div className="min-w-[680px] sm:min-w-[760px] flex items-center justify-between gap-1 relative z-10 py-6">
            {stage.lessons.map((lesson, idx) => {
              const meta = ASMO_STATION_META[lesson.id] || {
                shortTitle: lesson.title,
                icon: lesson.icon,
                numberLabel: `⓪${idx + 1}`,
              }
              const isUnlocked = isLessonUnlocked(lesson, progress)
              const isCompleted = Boolean(progress.lessons[lesson.id]?.completed)
              const isNext = lesson.id === nextLesson?.id && isUnlocked && !isCompleted
              const yOffset = waveOffsets[idx % waveOffsets.length]

              return (
                <div key={lesson.id} className="flex items-center flex-1">
                  {/* Station Node Stepping Stone */}
                  <div
                    className="flex flex-col items-center text-center space-y-2 flex-1 min-w-[100px] transition-transform duration-300"
                    style={{ transform: `translateY(${yOffset}px)` }}
                  >
                    {/* 3D Round Node Button */}
                    <button
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => isUnlocked && onOpenLesson(lesson.id)}
                      className={cn(
                        'relative group/station size-16 sm:size-20 rounded-full border-4 border-white shadow-clay flex flex-col items-center justify-center transition-all duration-300 select-none',
                        isCompleted
                          ? cn(islandStyles.nodeComplete, 'hover:scale-115 cursor-pointer ring-4 shadow-md')
                          : isNext
                          ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-orange-400 text-slate-950 ring-4 ring-amber-400 animate-bounce scale-110 shadow-2xl hover:scale-120 cursor-pointer'
                          : isUnlocked
                          ? 'bg-gradient-to-b from-white to-slate-100 text-slate-800 ring-2 ring-brand-200 hover:ring-brand-400 hover:scale-110 cursor-pointer'
                          : 'bg-slate-200/80 border-slate-300 text-slate-400 opacity-60 cursor-not-allowed shadow-inner',
                      )}
                      title={`Trạm ${lesson.lessonNumber}: ${lesson.title}`}
                    >
                      {/* Top Crown with 3 Stars for Completed Stations */}
                      {isCompleted && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 px-2 py-0.5 rounded-full text-[9px] font-black shadow-xs border border-amber-200 z-10 animate-pop whitespace-nowrap">
                          <span>⭐</span>
                          <span>⭐</span>
                          <span>⭐</span>
                        </div>
                      )}

                      {/* Top Championship Flag for Active Station */}
                      {isNext && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black shadow-clay whitespace-nowrap border border-white">
                          <span>🚩 BÉ Ở ĐÂY</span>
                        </div>
                      )}

                      {/* Station Number Badge (Top-left) */}
                      <span
                        className={cn(
                          'absolute -top-1 -left-1 size-5 sm:size-6 rounded-full border-2 border-white font-black text-[10px] sm:text-xs flex items-center justify-center shadow-xs',
                          isCompleted
                            ? 'bg-slate-900 text-white'
                            : isNext
                            ? 'bg-rose-600 text-white'
                            : isUnlocked
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-400 text-white',
                        )}
                      >
                        {lesson.lessonNumber}
                      </span>

                      {/* Center 3D Icon or Cute Lock */}
                      {!isUnlocked ? (
                        <div className="text-slate-400">
                          <KidLockImageIcon size={26} />
                        </div>
                      ) : (
                        <span className="text-2xl sm:text-3xl select-none group-hover/station:scale-110 transition-transform">
                          {meta.icon}
                        </span>
                      )}

                      {/* Status Badges */}
                      {isCompleted ? (
                        <span className="absolute -bottom-1 -right-1 size-6 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center text-xs font-black shadow-md">
                          ✓
                        </span>
                      ) : isNext ? (
                        <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-400 border border-white text-slate-950 text-[9px] font-black shadow-xs uppercase tracking-tight whitespace-nowrap">
                          Đang học
                        </span>
                      ) : null}
                    </button>

                    {/* Station Name Pill & XP */}
                    <div className="space-y-1 pt-1">
                      <div className="rounded-full bg-white/95 border border-slate-200/90 shadow-2xs px-2.5 py-0.5 text-center">
                        <span
                          className={cn(
                            'block font-display text-xs font-black line-clamp-1 max-w-[105px]',
                            isCompleted
                              ? 'text-emerald-800'
                              : isNext
                              ? 'text-amber-950 font-black'
                              : isUnlocked
                              ? 'text-slate-800'
                              : 'text-slate-400',
                          )}
                        >
                          {meta.shortTitle}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100/90 px-2 py-0.5 text-[9px] font-black text-amber-900 border border-amber-200/60 shadow-2xs">
                        <Zap className="size-2.5 text-amber-500 fill-amber-500" />
                        <span>+{lesson.xpReward} XP</span>
                      </span>
                    </div>
                  </div>

                  {/* Wavy Stepping Stone Connector Dots between stations */}
                  {idx < stage.lessons.length - 1 && (
                    <div className="flex items-center justify-center shrink-0 w-8 sm:w-10 text-slate-300 font-black text-xs select-none gap-1 px-1">
                      <span
                        className={cn(
                          'size-2.5 rounded-full shadow-2xs transition-colors',
                          isCompleted ? 'bg-emerald-400' : 'bg-slate-200',
                        )}
                      />
                      <span
                        className={cn(
                          'size-2 rounded-full shadow-2xs transition-colors',
                          isCompleted ? 'bg-emerald-400' : 'bg-slate-200',
                        )}
                      />
                      <span
                        className={cn(
                          'size-2.5 rounded-full shadow-2xs transition-colors',
                          isCompleted ? 'bg-emerald-400' : 'bg-slate-200',
                        )}
                      />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Trail Connector to Grand Treasure Chest */}
            <div className="flex items-center justify-center shrink-0 w-8 sm:w-10 text-slate-300 font-black text-xs select-none gap-1 px-1">
              <span
                className={cn(
                  'size-2.5 rounded-full shadow-2xs transition-colors',
                  stats.isCompleted ? 'bg-amber-400' : 'bg-slate-200',
                )}
              />
              <span
                className={cn(
                  'size-2 rounded-full shadow-2xs transition-colors',
                  stats.isCompleted ? 'bg-amber-400' : 'bg-slate-200',
                )}
              />
              <span
                className={cn(
                  'size-2.5 rounded-full shadow-2xs transition-colors',
                  stats.isCompleted ? 'bg-amber-400' : 'bg-slate-200',
                )}
              />
            </div>

            {/* ── ĐÍCH ĐẾN CUỐI ĐƯỜNG: RƯƠNG KHO BÁU KHỔNG LỒ 🎁 ── */}
            <div
              className="flex flex-col items-center text-center space-y-2 shrink-0 min-w-[110px] transition-transform duration-300"
              style={{ transform: 'translateY(-10px)' }}
            >
              {/* Grand Chest 3D Button */}
              <button
                type="button"
                onClick={() => setChestModalOpen(true)}
                className={cn(
                  'relative group/chest size-18 sm:size-22 rounded-full border-4 border-white shadow-clay flex flex-col items-center justify-center transition-all duration-300 select-none cursor-pointer',
                  stats.isCompleted
                    ? 'bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-300 text-white ring-4 ring-amber-300 shadow-amber-400/50 animate-pulse hover:scale-115'
                    : 'bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 text-amber-900 border-amber-300/80 ring-2 ring-amber-200 hover:scale-105',
                )}
                title={theme.chest.name}
              >
                {/* Sparkling star badge on top */}
                <div className="absolute -top-1.5 -right-1.5 size-7 rounded-full bg-gradient-to-r from-amber-300 to-yellow-300 border-2 border-white text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                  ✨
                </div>

                <span className="text-3xl sm:text-4xl group-hover/chest:scale-115 transition-transform filter drop-shadow-md select-none">
                  🎁
                </span>
              </button>

              {/* Chest Title & XP Pill */}
              <div className="space-y-1 pt-1">
                <div className="rounded-full bg-white/95 border border-amber-300/80 shadow-2xs px-3 py-0.5 text-center">
                  <span className="block font-display text-xs font-black text-amber-950 truncate max-w-[115px]">
                    {stats.isCompleted ? 'Mở Rương Vàng!' : 'Rương Kho Báu'}
                  </span>
                </div>

                <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 px-2.5 py-0.5 text-[9px] font-black text-slate-950 shadow-2xs border border-amber-200">
                  <span>+{theme.chest.bonusXp} XP ⚡</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. BOTTOM ACTION BAR (CUTE CANDY PROGRESS & SOFT CLAY BUTTONS) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
        {/* Left Cute Candy Progress Bar */}
        <div className="flex-1 max-w-sm">
          <CuteCandyProgressBar
            value={progressPct}
            label={`Tiến độ ${theme.shortTitle}`}
            gradientClass={islandStyles.progressGradient}
          />
        </div>

        {/* 2 Main Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap justify-end">
          {/* Action 1: Vào Học Bài Tiếp Theo */}
          {nextLesson && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenLesson(nextLesson.id)}
              className={cn(
                'gap-2 rounded-2xl font-black text-xs py-3 px-5 shadow-xs transition-transform active:scale-95 cursor-pointer justify-center',
                islandStyles.secondaryBtn,
              )}
            >
              <Play className="size-3.5 fill-current shrink-0 text-amber-600" />
              <span>
                {stats.isCompleted
                  ? 'Ôn Tập Lại ➔'
                  : 'Vào Học Ngay ➔'}
              </span>
            </Button>
          )}

          {/* Action 2: Đặt Chân Lên Đảo & Khám Phá Trạm */}
          <Button
            type="button"
            variant="primary"
            onClick={() => onSelectStage(stage.id)}
            className={cn(
              'gap-2 rounded-2xl font-black text-xs sm:text-sm py-3 px-6 shadow-clay transition-transform active:scale-95 cursor-pointer justify-center',
              islandStyles.gradientBtn,
            )}
          >
            <span>🚀 Đặt Chân Lên Đảo &amp; Khám Phá Trạm ➔</span>
          </Button>
        </div>
      </div>

      {/* ── 4. CHEST REWARD DIALOG POPUP ── */}
      {chestModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={theme.chest.name}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setChestModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-[2.5rem] bg-gradient-to-b from-amber-50 via-white to-amber-50 p-6 sm:p-8 shadow-2xl border-4 border-amber-300 space-y-4 animate-pop text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setChestModalOpen(false)}
              className="absolute top-4 right-4 size-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer shadow-xs"
            >
              <X className="size-4" />
            </button>

            {/* Big 3D Gift Box */}
            <div className="size-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-300 border-4 border-white flex items-center justify-center text-5xl shadow-clay animate-pulse">
              🎁
            </div>

            <div>
              <span className="rounded-full bg-amber-100 text-amber-950 border border-amber-300 px-3.5 py-1 text-xs font-black uppercase tracking-wider">
                Kho Báu Vàng Vùng {stage.stageNumber}
              </span>
              <h4 className="font-display text-2xl font-black text-slate-900 mt-2">
                {theme.chest.name}
              </h4>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {theme.chest.description}
            </p>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-amber-100/60 border border-amber-200/90 shadow-2xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-amber-800 block">
                  Phần Thưởng XP
                </span>
                <span className="font-display text-lg font-black text-amber-950">
                  +{theme.chest.bonusXp} XP ⚡
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-amber-800 block">
                  Huy Hiệu Vinh Danh
                </span>
                <span className="font-display text-xs font-black text-amber-950 line-clamp-1">
                  {theme.chest.badge}
                </span>
              </div>
            </div>

            <div className="pt-2">
              {stats.isCompleted ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setChestModalOpen(false)}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black py-3.5 shadow-clay text-sm"
                >
                  🎉 Nhận Thưởng Rương Vàng ➔
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-amber-900 bg-amber-100/80 p-2.5 rounded-2xl border border-amber-200">
                    Cần hoàn thành tất cả {stage.lessons.length} trạm của đảo để mở rương này nhé! (Hiện
                    tại: {stats.completedLessons}/{stage.lessons.length})
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setChestModalOpen(false)
                      if (nextLesson) onOpenLesson(nextLesson.id)
                    }}
                    className="w-full rounded-2xl font-black py-3 shadow-xs text-xs"
                  >
                    Tiếp Tục Học Để Mở Rương ➔
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
