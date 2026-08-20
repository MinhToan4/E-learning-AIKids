import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  Compass,
  Trophy,
  Sparkles,
  Star,
  Lock,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
  Award,
  Box,
  Flame,
  Map,
} from 'lucide-react'
import {
  ASMO_LMS_STAGES,
  type AsmoLmsStage,
  type AsmoLmsLesson,
  type AsmoLmsProgressState,
  getLmsProgress,
  isLessonUnlocked,
  getStageStats,
  resetLmsProgress,
} from '../data/asmo-curriculum-lms'
import { AsmoInteractiveLessonModal } from '../components/AsmoInteractiveLessonModal'
import {
  AsmoIslandWorldMap,
  ASMO_ISLAND_THEMES,
  MEE_FLAT_CLAY_MASCOT,
} from '../components/AsmoIslandWorldMap'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'

export function AsmoCurriculumRoadmapPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [progress, setProgress] = useState<AsmoLmsProgressState>(getLmsProgress())
  const [selectedStageId, setSelectedStageId] = useState<string>('stage-1')
  const [activeLesson, setActiveLesson] = useState<AsmoLmsLesson | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Sync stage from URL or default
  useEffect(() => {
    const stageQuery = searchParams.get('stage')
    if (stageQuery && ASMO_LMS_STAGES.some((s) => s.id === stageQuery)) {
      setSelectedStageId(stageQuery)
    }
  }, [searchParams])

  // Refresh progress state from storage
  const reloadProgress = () => {
    setProgress(getLmsProgress())
  }

  const handleOpenLesson = (lesson: AsmoLmsLesson) => {
    if (!isLessonUnlocked(lesson, progress)) return
    setActiveLesson(lesson)
    setIsModalOpen(true)
  }

  const handleLessonCompleted = () => {
    reloadProgress()
  }

  const handleNextLesson = (nextLsn: AsmoLmsLesson) => {
    setActiveLesson(nextLsn)
    if (nextLsn.stageId !== selectedStageId) {
      setSelectedStageId(nextLsn.stageId)
      setSearchParams({ stage: nextLsn.stageId })
    }
  }

  const handleSelectStage = (stageId: string) => {
    setSelectedStageId(stageId)
    setSearchParams({ stage: stageId })
  }

  const handleResetProgress = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học LMS để bắt đầu lại từ đầu?')) {
      const reset = resetLmsProgress()
      setProgress(reset)
    }
  }

  // Active Stage
  const activeStage = useMemo(() => {
    return ASMO_LMS_STAGES.find((s) => s.id === selectedStageId) || ASMO_LMS_STAGES[0]
  }, [selectedStageId])

  const totalPossibleStars = useMemo(() => {
    return ASMO_LMS_STAGES.reduce((sum, s) => sum + s.lessons.length * 3, 0)
  }, [])

  const totalLessonsCount = useMemo(() => {
    return ASMO_LMS_STAGES.reduce((sum, s) => sum + s.lessons.length, 0)
  }, [])

  const totalCompletedLessons = useMemo(() => {
    return Object.values(progress.lessons).filter((l) => l.completed).length
  }, [progress])

  const currentStageStats = getStageStats(activeStage.id, progress)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* ── TOP BREADCRUMB & PROGRESS MASTERY BAR ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Link
            to="/asmo"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-white/90 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-white transition-all border border-slate-200"
          >
            <ChevronLeft className="size-4" />
            <span>Cổng Olympic ASMO</span>
          </Link>

          <Link
            to="/asmo/journey"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-2xl bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-all border border-indigo-200"
          >
            <Box className="size-3.5" />
            <span>Chặng Học 3D</span>
          </Link>
        </div>

        {/* Global Progress Header Badges */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-2xl bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-xs font-black text-amber-800 shadow-2xs">
            <Star className="size-4 text-amber-500 fill-amber-500" />
            <span>{progress.totalStars} / {totalPossibleStars} Sao ⭐</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl bg-sky-50 border border-sky-200 px-3.5 py-1.5 text-xs font-black text-sky-800 shadow-2xs">
            <Zap className="size-4 text-sky-500 fill-sky-500" />
            <span>{progress.totalXp} XP</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>{totalCompletedLessons} / {totalLessonsCount} Bài</span>
          </div>

          <button
            type="button"
            onClick={handleResetProgress}
            className="size-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer border border-slate-200"
            title="Đặt lại tiến độ"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── HERO BANNER: 5 FLOATING ISLANDS WORLD MAP & MEE FLAT CLAY MASCOT ── */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-300/80 bg-gradient-to-r from-indigo-950 via-purple-900 to-rose-900 p-6 text-white shadow-clay sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur-md">
            <Compass className="size-3.5 text-sun-300" />
            <span>Thế Giới Quần Đảo Toán Học Olympic ASMO LMS</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Chinh Phục 5 Chặng Toán Học Olympic Cùng Mèo Mee 🗺️
          </h1>

          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-xl">
            Du hành qua 5 Vùng Đảo Diệu Kỳ: Đảo Táo Đỏ 🍎 ➔ Vương Quốc Bánh Ngọt 🍰 ➔ Quần Đảo Pizza Phân Số 🍕 ➔ Cao Nguyên Đồng Hồ ⏰ ➔ Thành Phố Pha Lê 3D &amp; Lâu Đài Olympic 🏆!
          </p>

          {/* Quick Switching Banner Buttons */}
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-400 text-slate-950 px-4 py-2 text-xs font-black shadow-clay cursor-default"
            >
              <Map className="size-4" />
              <span>🗺️ 5 Vùng Đảo Thế Giới</span>
            </button>

            <Link
              to="/asmo"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/20 text-white hover:bg-white/30 px-4 py-2 text-xs font-bold backdrop-blur-md transition-all border border-white/20"
            >
              <Trophy className="size-4 text-sun-300" />
              <span>⚡ Đấu Trường Thi Đấu (Exam Arena)</span>
            </Link>

            <Link
              to="/asmo/journey"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 text-white hover:bg-white/20 px-4 py-2 text-xs font-bold backdrop-blur-md transition-all border border-white/20"
            >
              <Box className="size-4" />
              <span>🧊 Chặng Học 3D</span>
            </Link>
          </div>
        </div>

        {/* Flat Clay Mee Companion Avatar Badge */}
        <div className="relative z-10 hidden sm:flex flex-col items-center shrink-0">
          <div className="relative size-24 sm:size-28 rounded-full border-4 border-amber-300 shadow-clay p-1 bg-gradient-to-tr from-amber-400 via-orange-300 to-amber-200">
            <img
              src={MEE_FLAT_CLAY_MASCOT}
              alt="Mèo Mee Đồng Hành Flat Clay"
              className="w-full h-full object-cover rounded-full"
            />
            <div className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shadow-md border border-white/60">
              🐾 Dẫn Đường
            </div>
          </div>
          <span className="text-[11px] font-black text-amber-300 mt-2.5 drop-shadow-xs">
            Mèo Mee Cổ Vũ
          </span>
        </div>
      </div>

      {/* ── 5 FLOATING ISLANDS WORLD MAP & MEE COMPANION COMPONENT ── */}
      <AsmoIslandWorldMap
        selectedStageId={selectedStageId}
        onSelectStage={handleSelectStage}
        progress={progress}
        onOpenLesson={handleOpenLesson}
      />

      {/* ── INTERACTIVE LESSON MODAL ── */}
      {activeLesson && (
        <AsmoInteractiveLessonModal
          lesson={activeLesson}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCompleteLesson={handleLessonCompleted}
          onNextLesson={handleNextLesson}
        />
      )}
    </div>
  )
}
