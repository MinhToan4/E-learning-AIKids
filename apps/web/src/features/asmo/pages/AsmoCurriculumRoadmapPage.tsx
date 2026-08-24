import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  Compass,
  Trophy,
  Star,
  CheckCircle2,
  RotateCcw,
  Zap,
  ChevronLeft,
  Box,
  Map,
} from 'lucide-react'
import {
  ASMO_LMS_STAGES,
  type AsmoLmsLesson,
  type AsmoLmsProgressState,
  getLmsProgress,
  isLessonUnlocked,
  getStageStats,
  resetLmsProgress,
} from '../data/asmo-curriculum-lms'
import { AsmoIslandWorldMap } from '../components/AsmoIslandWorldMap'
import { FlatClayStar, FlatClayZap, FlatClayIcon, FlatClayTrophy } from '../components/AsmoFlatClayIcons'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'

export function AsmoCurriculumRoadmapPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [progress, setProgress] = useState<AsmoLmsProgressState>(getLmsProgress())
  const [selectedStageId, setSelectedStageId] = useState<string>('stage-1')

  // Sync stage from URL or default
  useEffect(() => {
    const stageQuery = searchParams.get('stage')
    if (stageQuery && ASMO_LMS_STAGES.some((s) => s.id === stageQuery)) {
      setSelectedStageId(stageQuery)
    }
  }, [searchParams])

  const handleOpenLesson = (lesson: AsmoLmsLesson) => {
    if (!isLessonUnlocked(lesson, progress)) return
    navigate(`/asmo/curriculum/lesson/${lesson.id}`)
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

  // Progress metrics
  const totalPossibleStars = useMemo(() => {
    return ASMO_LMS_STAGES.reduce((sum, s) => sum + s.lessons.length * 3, 0)
  }, [])

  const totalLessonsCount = useMemo(() => {
    return ASMO_LMS_STAGES.reduce((sum, s) => sum + s.lessons.length, 0)
  }, [])

  const totalCompletedLessons = useMemo(() => {
    return Object.values(progress.lessons).filter((l) => l.completed).length
  }, [progress])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
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
            <FlatClayStar size={16} />
            <span>{progress.totalStars} / {totalPossibleStars} Sao</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl bg-sky-50 border border-sky-200 px-3.5 py-1.5 text-xs font-black text-sky-800 shadow-2xs">
            <FlatClayZap size={16} />
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

      {/* ── HERO BANNER: 5 FLOATING ISLANDS WORLD MAP & AI KIDS MEE MASCOT ── */}
      <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-900 via-indigo-900 to-mint-900 p-6 text-white shadow-clay sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
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
              className="inline-flex items-center gap-1.5 rounded-2xl bg-sun-400 text-slate-950 px-4 py-2 text-xs font-black shadow-clay cursor-default"
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

        {/* Authentic AikidCatCharacter Companion Avatar Badge */}
        <div className="relative z-10 hidden sm:flex flex-col items-center shrink-0">
          <div className="relative size-24 sm:size-28 rounded-full border-4 border-sun-300 shadow-clay p-2 bg-gradient-to-tr from-sun-400 via-coral-300 to-sun-200 overflow-hidden flex items-center justify-center">
            <AikidCatCharacter pose="welcome" className="w-full h-full object-contain" />
            <div className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-sun-400 text-slate-950 text-[10px] font-black shadow-md border border-white/60">
              🐾 Dẫn Đường
            </div>
          </div>
          <span className="text-[11px] font-black text-sun-300 mt-2.5 drop-shadow-xs">
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
        hideStationTrail={false}
      />
    </div>
  )
}
