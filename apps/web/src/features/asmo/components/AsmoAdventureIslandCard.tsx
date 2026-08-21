import { useMemo, useState } from 'react'
import {
  Sparkles,
  CheckCircle2,
  Trophy,
  Zap,
  Star,
  Gift,
  ArrowRight,
  Play,
  Lock,
  Compass,
  X,
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
import { CuteProgress } from '@/shared/components/ui/CuteProgress'
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

  // Island-specific visual styles
  const islandStyles = useMemo(() => {
    switch (stage.id) {
      case 'stage-1':
        return {
          cardBorder: 'border-emerald-300 hover:border-emerald-400',
          cardBg: 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60',
          badgeBg: 'bg-emerald-100 border-emerald-300 text-emerald-900',
          accentPill: 'bg-emerald-600 text-white',
          activeRing: 'ring-emerald-400 text-emerald-700 bg-emerald-50',
          trailColor: '#10b981',
          gradientBtn:
            'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white',
          secondaryBtn: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300',
          chestBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        }
      case 'stage-2':
        return {
          cardBorder: 'border-rose-300 hover:border-rose-400',
          cardBg: 'bg-gradient-to-br from-rose-50/90 via-white to-pink-50/60',
          badgeBg: 'bg-rose-100 border-rose-300 text-rose-900',
          accentPill: 'bg-rose-500 text-white',
          activeRing: 'ring-rose-400 text-rose-700 bg-rose-50',
          trailColor: '#f43f5e',
          gradientBtn:
            'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white',
          secondaryBtn: 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300',
          chestBg: 'bg-rose-50 border-rose-200 text-rose-900',
        }
      case 'stage-3':
        return {
          cardBorder: 'border-amber-300 hover:border-amber-400',
          cardBg: 'bg-gradient-to-br from-amber-50/90 via-white to-orange-50/60',
          badgeBg: 'bg-amber-100 border-amber-300 text-amber-900',
          accentPill: 'bg-amber-600 text-white',
          activeRing: 'ring-amber-400 text-amber-700 bg-amber-50',
          trailColor: '#f59e0b',
          gradientBtn:
            'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white',
          secondaryBtn: 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300',
          chestBg: 'bg-amber-50 border-amber-200 text-amber-900',
        }
      case 'stage-4':
        return {
          cardBorder: 'border-sky-300 hover:border-sky-400',
          cardBg: 'bg-gradient-to-br from-sky-50/90 via-white to-indigo-50/60',
          badgeBg: 'bg-sky-100 border-sky-300 text-sky-900',
          accentPill: 'bg-sky-600 text-white',
          activeRing: 'ring-sky-400 text-sky-700 bg-sky-50',
          trailColor: '#0284c7',
          gradientBtn:
            'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white',
          secondaryBtn: 'bg-sky-100 hover:bg-sky-200 text-sky-900 border-sky-300',
          chestBg: 'bg-sky-50 border-sky-200 text-sky-900',
        }
      case 'stage-5':
      default:
        return {
          cardBorder: 'border-purple-300 hover:border-purple-400',
          cardBg: 'bg-gradient-to-br from-purple-50/90 via-white to-indigo-50/60',
          badgeBg: 'bg-purple-100 border-purple-300 text-purple-900',
          accentPill: 'bg-purple-600 text-white',
          activeRing: 'ring-purple-400 text-purple-700 bg-purple-50',
          trailColor: '#9333ea',
          gradientBtn:
            'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white',
          secondaryBtn: 'bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300',
          chestBg: 'bg-purple-50 border-purple-200 text-purple-900',
        }
    }
  }, [stage.id])

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl border-2 p-5 sm:p-7 transition-all duration-300 shadow-clay hover:shadow-xl space-y-6',
        islandStyles.cardBorder,
        islandStyles.cardBg,
      )}
    >
      {/* ── 1. HEADER & VISUAL SCENE BANNER ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-5 border-b border-slate-200/80">
        {/* Left Info */}
        <div className="space-y-3 max-w-2xl">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider border shadow-2xs',
                islandStyles.badgeBg,
              )}
            >
              <span className="text-sm">{theme.heroEmoji}</span>
              <span>VÙNG {stage.stageNumber}</span>
            </span>

            <span className="rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-black shadow-2xs">
              {gradeLabel}
            </span>

            {stats.isCompleted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-3 py-1 text-xs font-black shadow-xs animate-pop">
                <CheckCircle2 className="size-3.5" />
                <span>Hoàn thành 100% 🏆</span>
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 text-xs font-bold shadow-2xs">
                {stats.completedLessons}/{stage.lessons.length} Trạm đã chinh phục
              </span>
            )}
          </div>

          {/* Island Grand Title & Stage Name */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {stage.title}
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-black text-slate-900 leading-snug mt-0.5">
              {theme.heroEmoji} {theme.islandName}
            </h3>
          </div>

          {/* 1-Line Catchy Skill Summary */}
          <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed flex items-center gap-2 flex-wrap">
            <Sparkles className="size-4 text-amber-500 shrink-0" />
            <span>{theme.tagline}</span>
          </p>

          {/* Scenery Pill with Cartoon Emojis */}
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white/80 border border-slate-200/90 px-3.5 py-1.5 text-xs text-slate-600 font-medium backdrop-blur-xs">
            <span className="text-sm select-none">
              {theme.islandDecorIcons.slice(0, 5).join(' ')}
            </span>
            <span className="hidden sm:inline line-clamp-1">{theme.sceneryDescription}</span>
          </div>
        </div>

        {/* Right Visual Scene Canvas with Mee Mascot */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="relative w-full sm:w-72 h-36 sm:h-40 rounded-3xl overflow-hidden border-2 border-white shadow-clay bg-gradient-to-tr from-slate-900 via-indigo-900 to-sky-900 flex items-end justify-center p-2">
            {/* Background Art / Landscape Mask */}
            <img
              src={theme.image || theme.scene}
              alt={theme.islandName}
              className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay scale-105 group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Mascot Mèo Mee Standing on Island */}
            <div className="relative z-10 size-24 sm:size-28 shrink-0 drop-shadow-lg transform transition-transform group-hover:translate-y-[-4px]">
              <AikidCatCharacter pose={theme.pose} className="w-full h-full object-contain" />
            </div>

            {/* Floating Mee Quote Speech Bubble */}
            <div className="absolute top-2 right-2 max-w-[170px] bg-white/95 backdrop-blur-md rounded-2xl p-2 border border-amber-300 shadow-clay text-[10px] font-extrabold text-slate-800 leading-tight select-none hidden sm:block">
              <span className="text-amber-500 mr-1">🐾</span>
              {theme.meeQuotes[0] || 'Cùng Mee chinh phục bài này nhé!'}
            </div>

            {/* Bottom Scene Badge */}
            <div className="absolute bottom-1.5 left-3 z-20 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black text-white">
              <span>{theme.heroEmoji}</span>
              <span>{theme.shortTitle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. CHUỖI TRẠM CON ĐƯỜNG MÒN TRỰC QUAN (MINI WINDING TRAIL STATIONS) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Compass className="size-4 text-slate-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              {theme.trailLabel} ({stage.lessons.length} Trạm Học Tương Tác)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1 text-amber-700">
              <Star className="size-3.5 text-amber-500 fill-amber-500" />
              <span>{stats.totalStars}/{stats.maxStars} ⭐</span>
            </span>
            <span className="flex items-center gap-1 text-sky-700">
              <Zap className="size-3.5 text-sky-500 fill-sky-500" />
              <span>+{stage.lessons.reduce((acc, l) => acc + l.xpReward, 0)} XP</span>
            </span>
          </div>
        </div>

        {/* Interactive Winding Trail Stations Grid */}
        <div className="relative rounded-3xl bg-white/90 border-2 border-slate-200/80 p-4 sm:p-5 shadow-xs overflow-x-auto">
          {/* Subtle SVG Winding connector road line */}
          <div className="min-w-[620px] flex items-center justify-between gap-2 relative z-10 py-2">
            {stage.lessons.map((lesson, idx) => {
              const meta = ASMO_STATION_META[lesson.id] || {
                shortTitle: lesson.title,
                icon: lesson.icon,
                numberLabel: `⓪${idx + 1}`,
              }
              const isUnlocked = isLessonUnlocked(lesson, progress)
              const isCompleted = Boolean(progress.lessons[lesson.id]?.completed)
              const stars = progress.lessons[lesson.id]?.stars || 0
              const isNext = lesson.id === nextLesson?.id && isUnlocked && !isCompleted

              return (
                <div key={lesson.id} className="flex items-center flex-1">
                  {/* Station Node Button */}
                  <div className="flex flex-col items-center text-center space-y-1.5 flex-1 min-w-[90px]">
                    <button
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => isUnlocked && onOpenLesson(lesson.id)}
                      className={cn(
                        'relative group/station size-14 sm:size-16 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-200 shadow-clay select-none',
                        isCompleted
                          ? 'border-emerald-400 bg-emerald-50/90 text-emerald-800 hover:scale-110 cursor-pointer ring-2 ring-emerald-200'
                          : isNext
                          ? 'border-amber-400 bg-amber-50/90 text-amber-900 hover:scale-110 cursor-pointer ring-4 ring-amber-300 animate-pulse'
                          : isUnlocked
                          ? 'border-brand-300 bg-white text-slate-800 hover:scale-105 cursor-pointer'
                          : 'border-slate-200 bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed',
                      )}
                      title={`Trạm ${lesson.lessonNumber}: ${lesson.title}`}
                    >
                      {/* Big Cartoon Icon */}
                      <span className="text-2xl sm:text-3xl group-hover/station:scale-110 transition-transform">
                        {meta.icon}
                      </span>

                      {/* Station Number Badge */}
                      <span className="absolute -top-1.5 -left-1.5 size-5 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                        {lesson.lessonNumber}
                      </span>

                      {/* Status Icon */}
                      {isCompleted ? (
                        <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                          ✓
                        </span>
                      ) : isNext ? (
                        <span className="absolute -bottom-2 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black shadow-xs uppercase tracking-tight">
                          Đang học
                        </span>
                      ) : !isUnlocked ? (
                        <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-slate-200 border border-slate-300 text-slate-600 flex items-center justify-center shadow-xs">
                          <KidLockImageIcon size={14} />
                        </div>
                      ) : null}
                    </button>

                    {/* Station Name & XP */}
                    <div className="space-y-0.5">
                      <span
                        className={cn(
                          'block font-display text-xs font-black line-clamp-1 max-w-[105px]',
                          isCompleted
                            ? 'text-emerald-800'
                            : isNext
                            ? 'text-amber-900 font-extrabold'
                            : isUnlocked
                            ? 'text-slate-800'
                            : 'text-slate-400',
                        )}
                      >
                        {meta.shortTitle}
                      </span>
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100/80 px-2 py-0.2 text-[9px] font-black text-amber-900">
                        <Zap className="size-2.5 text-amber-500 fill-amber-500" />
                        <span>+{lesson.xpReward} XP</span>
                      </span>
                    </div>
                  </div>

                  {/* Connecting Road Arrow */}
                  {idx < stage.lessons.length - 1 && (
                    <div className="flex items-center justify-center shrink-0 w-6 sm:w-8 text-slate-300 font-black text-xs select-none">
                      <span
                        className={cn(
                          'h-1 w-full rounded-full transition-colors',
                          isCompleted ? 'bg-emerald-400' : 'bg-slate-200',
                        )}
                      />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Final Trail Connector to Treasure Chest */}
            <div className="flex items-center justify-center shrink-0 w-6 sm:w-8 text-slate-300 font-black text-xs select-none">
              <span
                className={cn(
                  'h-1 w-full rounded-full transition-colors',
                  stats.isCompleted ? 'bg-amber-400' : 'bg-slate-200',
                )}
              />
            </div>

            {/* Golden Treasure Chest Node 🎁 */}
            <div className="flex flex-col items-center text-center space-y-1.5 shrink-0 min-w-[100px]">
              <button
                type="button"
                onClick={() => setChestModalOpen(true)}
                className={cn(
                  'relative group/chest size-14 sm:size-16 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-200 shadow-clay select-none cursor-pointer',
                  stats.isCompleted
                    ? 'border-amber-400 bg-gradient-to-br from-amber-400 to-orange-400 text-white hover:scale-110 ring-4 ring-amber-300 shadow-amber-400/30'
                    : 'border-sun-300 bg-amber-50/80 text-amber-900 hover:scale-105',
                )}
                title={theme.chest.name}
              >
                <span className="text-2xl sm:text-3xl group-hover/chest:scale-110 transition-transform">
                  🎁
                </span>
                {stats.isCompleted && (
                  <span className="absolute -top-1 -right-1 size-5 rounded-full bg-amber-300 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-xs">
                    ★
                  </span>
                )}
              </button>

              <div className="space-y-0.5">
                <span className="block font-display text-xs font-black text-slate-900 line-clamp-1 max-w-[100px]">
                  {stats.isCompleted ? 'Mở Rương Vàng!' : 'Rương Kho Báu'}
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-200 px-2 py-0.2 text-[9px] font-black text-amber-950">
                  <span>+{theme.chest.bonusXp} XP</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. BOTTOM ACTION BAR (SOFT CLAY BUTTONS) ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200/80">
        {/* Left Progress Bar */}
        <div className="flex-1 max-w-sm">
          <CuteProgress
            value={progressPct}
            label={`Tiến độ ${theme.shortTitle}`}
            tone={stats.isCompleted ? 'mint' : 'coral'}
          />
        </div>

        {/* 2 Main Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-end">
          {/* Action 1: Vào Học Bài Tiếp Theo */}
          {nextLesson && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenLesson(nextLesson.id)}
              className={cn(
                'gap-1.5 rounded-2xl font-extrabold text-xs py-2.5 px-4 shadow-xs transition-transform active:scale-95 cursor-pointer justify-center',
                islandStyles.secondaryBtn,
              )}
            >
              <Play className="size-3.5 fill-current shrink-0" />
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
              'gap-2 rounded-2xl font-black text-xs sm:text-sm py-2.5 px-5 shadow-clay transition-transform active:scale-95 cursor-pointer justify-center',
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
            className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border-4 border-amber-300 space-y-4 animate-pop text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setChestModalOpen(false)}
              className="absolute top-3.5 right-3.5 size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="size-20 mx-auto rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-clay">
              🎁
            </div>

            <div>
              <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-3 py-0.5 text-xs font-black uppercase">
                Kho Báu Vàng Vùng {stage.stageNumber}
              </span>
              <h4 className="font-display text-xl font-black text-slate-900 mt-1">
                {theme.chest.name}
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{theme.chest.description}</p>

            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-amber-700 block">
                  Phần Thưởng XP
                </span>
                <span className="font-display text-base font-black text-amber-900">
                  +{theme.chest.bonusXp} XP ⚡
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-amber-700 block">
                  Huy Hiệu Vinh Danh
                </span>
                <span className="font-display text-xs font-black text-amber-900 line-clamp-1">
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
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-coral-500 text-slate-950 font-black py-3"
                >
                  🎉 Nhận Thưởng Rương Vàng ➔
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-amber-800">
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
                    className="w-full rounded-2xl font-black py-2.5"
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
