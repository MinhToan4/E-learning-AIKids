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
  ArrowRight,
  RotateCcw,
  Zap,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
  Award,
  Box,
  Flame,
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
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
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

      {/* ── HERO BANNER: LMS SEQUENTIAL ROADMAP ── */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-300/80 bg-gradient-to-r from-indigo-900 via-purple-900 to-rose-900 p-6 text-white shadow-clay sm:p-8">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur-md">
            <Compass className="size-3.5 text-sun-300" />
            <span>Lộ Trình Học Tuần Tự Chuẩn Quốc Tế ASMO LMS</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Chinh Phục 5 Chặng Toán Học Olympic Cùng Mèo Mee 🗺️
          </h1>

          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-2xl">
            Lộ trình học trực quan qua 5 chặng tuần tự từ cơ bản đến nâng cao: Cộng Trừ $0-100$ ➔ Nhân Chia ➔ Phân Số ➔ Thời Gian &amp; Đo Lường ➔ Không Gian 3D &amp; Đấu Trường Olympic!
          </p>

          {/* Quick Switching Banner Buttons */}
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-400 text-slate-950 px-4 py-2 text-xs font-black shadow-md"
            >
              <Compass className="size-4" />
              <span>🗺️ Lộ Trình Học Tuần Tự (LMS)</span>
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

        {/* Decorative Mascot */}
        <div className="absolute right-4 bottom-2 opacity-20 lg:opacity-30 pointer-events-none hidden sm:block">
          <Trophy className="size-64 text-white" />
        </div>
      </div>

      {/* ── 5 STAGE SELECTOR ISLAND TABS ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Layers className="size-4 text-indigo-600" />
            <span>5 Đảo Học Tập Tuần Tự (Math Stages):</span>
          </span>
          <span className="text-xs font-bold text-slate-500">
            Mở khóa bằng Sao ⭐
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ASMO_LMS_STAGES.map((stage) => {
            const stats = getStageStats(stage.id, progress)
            const isSelected = selectedStageId === stage.id
            const isLocked = !stats.isUnlocked

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => {
                  setSelectedStageId(stage.id)
                  setSearchParams({ stage: stage.id })
                }}
                className={cn(
                  'group relative flex flex-col justify-between p-4 rounded-3xl border text-left transition-all duration-200 cursor-pointer shadow-xs',
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white border-indigo-400 ring-2 ring-indigo-400/50 shadow-md scale-[1.02]'
                    : isLocked
                    ? 'bg-slate-100/80 border-slate-200 text-slate-400 hover:bg-slate-200/80'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800 hover:border-indigo-300',
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{stage.icon}</span>
                    {isLocked ? (
                      <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 border border-slate-300">
                        <Lock className="size-2.5" />
                        <span>{stage.requiredStarsToUnlock} ⭐</span>
                      </span>
                    ) : stats.isCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                        <CheckCircle2 className="size-3 text-emerald-400" />
                        <span>Hoàn thành</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                        {stats.totalStars} / {stats.maxStars} ⭐
                      </span>
                    )}
                  </div>

                  <h3 className={cn('text-xs font-black leading-snug line-clamp-2', isSelected ? 'text-white' : 'text-slate-900')}>
                    {stage.title}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-bold">
                  <span className={isSelected ? 'text-indigo-200' : 'text-slate-500'}>
                    {stats.completedLessons}/{stats.totalLessons} Bài học
                  </span>
                  {isSelected && <ArrowRight className="size-3 text-amber-300" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── ACTIVE STAGE DETAILS & QUEST PATH ROADMAP ── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-clay backdrop-blur-md space-y-6">
        {/* Stage Overview Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex size-14 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-3xl shadow-md shrink-0">
              {activeStage.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-black text-indigo-700 border border-indigo-200">
                  Chặng {activeStage.stageNumber} / 5
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {currentStageStats.completedLessons} / {currentStageStats.totalLessons} bài hoàn thành
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                {activeStage.title}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {activeStage.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-2.5 text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sao Đã Thu Thập</span>
              <span className="text-sm font-black text-amber-600 flex items-center justify-center gap-1">
                <Star className="size-3.5 fill-amber-500 text-amber-500" />
                {currentStageStats.totalStars}/{currentStageStats.maxStars}
              </span>
            </div>
          </div>
        </div>

        {/* ── DUOLINGO / BEAST ACADEMY STYLE WINDING QUEST PATH ── */}
        <div className="relative py-6 px-2 sm:px-8 max-w-2xl mx-auto space-y-8">
          {/* Vertical Connecting Curved Line */}
          <div className="absolute left-1/2 top-10 bottom-10 -translate-x-1/2 w-1.5 bg-gradient-to-b from-indigo-300 via-purple-300 to-rose-300 rounded-full pointer-events-none -z-0" />

          {activeStage.lessons.map((lesson, idx) => {
            const isUnlocked = isLessonUnlocked(lesson, progress)
            const lessonProgress = progress.lessons[lesson.id]
            const isCompleted = lessonProgress?.completed ?? false
            const stars = lessonProgress?.stars || 0
            const isCurrent = isUnlocked && !isCompleted

            // Alternate left and right winding position for Duolingo feel
            const isEven = idx % 2 === 0
            const xOffsetClass = isEven ? 'sm:-translate-x-12' : 'sm:translate-x-12'

            return (
              <div
                key={lesson.id}
                className={cn('relative z-10 flex items-center justify-center transition-all duration-300', xOffsetClass)}
              >
                <div
                  className={cn(
                    'group relative flex flex-col items-center w-full max-w-sm rounded-3xl p-4 transition-all duration-300 border-2 shadow-sm',
                    isCompleted
                      ? 'bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/10 border-emerald-400 hover:shadow-md'
                      : isCurrent
                      ? 'bg-gradient-to-br from-indigo-500/15 via-white to-purple-500/15 border-indigo-500 ring-4 ring-indigo-400/30 shadow-lg scale-105 animate-pulse-subtle'
                      : 'bg-slate-100/90 border-slate-200 opacity-60 grayscale-40',
                  )}
                >
                  {/* Top Node Pill */}
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="rounded-xl bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5">
                      Bài {lesson.lessonNumber}
                    </span>

                    {/* Stars Badge */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 3 }).map((_, sIdx) => (
                        <Star
                          key={`star-${sIdx}`}
                          className={cn(
                            'size-3.5',
                            sIdx < stars
                              ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                              : 'text-slate-300',
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Center Big Circular Interactive Button */}
                  <button
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => handleOpenLesson(lesson)}
                    className={cn(
                      'relative size-20 sm:size-24 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-300 active:scale-95 cursor-pointer border-4',
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-300 text-white hover:scale-105'
                        : isCurrent
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 border-yellow-300 text-white hover:scale-110 shadow-indigo-500/50'
                        : 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed',
                    )}
                  >
                    <span className="text-3xl sm:text-4xl select-none drop-shadow-sm">{lesson.icon}</span>

                    {/* Status Floating Icon */}
                    {isCompleted ? (
                      <span className="absolute -bottom-1 -right-1 size-7 bg-emerald-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md">
                        <CheckCircle2 className="size-4" />
                      </span>
                    ) : isCurrent ? (
                      <span className="absolute -top-1 -right-1 size-7 bg-amber-400 text-slate-950 font-black rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
                        <Play className="size-3.5 fill-current ml-0.5" />
                      </span>
                    ) : (
                      <span className="absolute -bottom-1 -right-1 size-7 bg-slate-500 text-white rounded-full flex items-center justify-center border-2 border-white">
                        <Lock className="size-3.5" />
                      </span>
                    )}
                  </button>

                  {/* Title & Subtitle */}
                  <div className="text-center mt-3 space-y-1">
                    <h4 className="text-sm font-black text-slate-900 leading-snug">
                      {lesson.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {lesson.subtitle}
                    </p>
                  </div>

                  {/* Action CTA Button */}
                  <div className="mt-3 w-full">
                    {isUnlocked ? (
                      <Button
                        type="button"
                        variant={isCurrent ? 'primary' : 'secondary'}
                        onClick={() => handleOpenLesson(lesson)}
                        className={cn(
                          'w-full gap-1.5 rounded-2xl text-xs font-black py-2 cursor-pointer shadow-xs',
                          isCurrent
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                        )}
                      >
                        {isCompleted ? (
                          <>
                            <RotateCcw className="size-3.5" />
                            <span>Học Lại ({stars} ⭐)</span>
                          </>
                        ) : (
                          <>
                            <Play className="size-3.5 fill-current" />
                            <span>Bắt Đầu Học (+{lesson.xpReward} XP)</span>
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center gap-1 py-2 text-xs font-bold text-slate-400 bg-slate-100 rounded-2xl border border-slate-200">
                        <Lock className="size-3" />
                        <span>Chưa mở khóa</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

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
