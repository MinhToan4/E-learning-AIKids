import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Target,
  HelpCircle,
  Video,
  FileQuestion,
  Palette,
  Trophy,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Star,
  Check,
  X,
  Volume2,
  Award,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import { AikiStudioWorkspace, type StudioImageItem } from './AikiStudioWorkspace'
import {
  getAikiStudioConfig,
  type AikiStudioConfig,
} from '../data/aiki-studio-configs'
import { playInstantSound } from './LessonInteractiveSidebar'

export interface SixStageJourneyViewProps {
  journey: LessonSixStageJourney
  lessonId: string
  lessonTitle: string
  studentStars?: number
  onFinishLesson?: (result: { stars: number; xp: number; nextLessonSlug?: string }) => void
  onBackToMap?: () => void
  onNavigateNextLesson?: (nextLessonSlug: string) => void
  initialStageIndex?: number
  onStageChange?: (stageIndex: number) => void
}

export const STAGES = [
  { index: 0, title: 'Mục tiêu', icon: Target, stepNumber: 1 },
  { index: 1, title: 'Xác nhận', icon: HelpCircle, stepNumber: 2 },
  { index: 2, title: 'Video', icon: Video, stepNumber: 3 },
  { index: 3, title: 'Bài test', icon: FileQuestion, stepNumber: 4 },
  { index: 4, title: 'Thực hành', icon: Palette, stepNumber: 5 },
  { index: 5, title: 'Hoàn thành', icon: Trophy, stepNumber: 6 },
]

export function SixStageJourneyView({
  journey,
  lessonId,
  lessonTitle,
  studentStars = 42,
  onFinishLesson,
  onBackToMap,
  onNavigateNextLesson,
  initialStageIndex = 0,
  onStageChange,
}: SixStageJourneyViewProps) {
  const [currentStage, setCurrentStage] = useState<number>(initialStageIndex)
  const [completedStages, setCompletedStages] = useState<Set<number>>(() => new Set([0]))
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)

  // Stage 1 (Confirm goal) state
  const [selectedConfirmOption, setSelectedConfirmOption] = useState<number | null>(null)
  const [isConfirmCorrect, setIsConfirmCorrect] = useState<boolean | null>(null)
  const [failedOptionImages, setFailedOptionImages] = useState<Record<string, boolean>>({})

  // Stage 3 (Quiz) state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false)

  // Stage 4 (Practice) submitted artwork state
  const [submittedArtwork, setSubmittedArtwork] = useState<{
    image: StudioImageItem
    prompt: string
  } | null>(null)

  // Lightbox Modal state for full-screen image inspection
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null)

  useEffect(() => {
    if (!zoomImage) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomImage(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zoomImage])

  const handleStageSelect = useCallback(
    (index: number) => {
      setCurrentStage(index)
      onStageChange?.(index)
    },
    [onStageChange]
  )

  const advanceToStage = useCallback(
    (nextStage: number) => {
      setCompletedStages((prev) => new Set([...prev, currentStage, nextStage]))
      setCurrentStage(nextStage)
      onStageChange?.(nextStage)
      try {
        playInstantSound('click')
      } catch {
        // ignore audio failure
      }
    },
    [currentStage, onStageChange]
  )

  // Web Speech synthesis for AKI
  const speakCurrentStage = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.95
      window.speechSynthesis.speak(utterance)
    } catch {
      // ignore
    }
  }, [])

  // AKI voice speech for each stage
  const currentStageSpeech = useMemo(() => {
    switch (currentStage) {
      case 0:
        return journey.stage1_goal.speech || 'Chào bạn nhỏ! Cùng AKI khám phá mục tiêu và điểm vàng bài học hôm nay nhé!'
      case 1:
        return journey.stage2_confirmGoal.speech || 'Bé hãy chọn phương án chính xác nhất để chuẩn bị bước vào xem video nhé!'
      case 2:
        return (
          journey.stage3_video.timestamps?.[0]?.speech ||
          'Cùng AKI xem video bài giảng để mở khóa các bí kíp câu lệnh thần kỳ nào!'
        )
      case 3:
        return 'Thử tài trí nhớ của bé qua các câu hỏi trắc nghiệm để mở khóa Xưởng Sáng Tạo AI!'
      case 4:
        return journey.stage5_practice.akiMotto || 'Cùng AKI bắt tay sáng tạo tranh trong Xưởng Sáng Tạo AI nào!'
      case 5:
        return journey.stage6_completion.congratsMessage || 'Chúc mừng Nhà Sáng Tạo Tí Hon đã xuất sắc hoàn thành trạm học!'
      default:
        return 'Cùng AKI học thật vui nhé!'
    }
  }, [currentStage, journey])

  const getStageMascotEmoji = (stage: number) => {
    switch (stage) {
      case 0:
        return '🎯'
      case 1:
        return '🧐'
      case 2:
        return '🎬'
      case 3:
        return '📝'
      case 4:
        return '🎨'
      case 5:
        return '🏆'
      default:
        return '🐱'
    }
  }

  const getStageMascotRole = (stage: number) => {
    switch (stage) {
      case 0:
        return 'AKI Đồng Hành'
      case 1:
        return 'AKI Cố Vấn'
      case 2:
        return 'Thầy Giáo AKI'
      case 3:
        return 'Giám Khảo AKI'
      case 4:
        return 'Bậc Thầy AIKI'
      case 5:
        return 'Thần Đèn AIKI'
      default:
        return 'Bạn Đồng Hành AKI'
    }
  }

  const getStageInstruction = (stage: number) => {
    switch (stage) {
      case 0:
        return 'Đọc kỹ mục tiêu bài học và ghi nhớ 3 điểm vàng quan trọng.'
      case 1:
        return 'Quan sát tranh minh họa và chọn phương án chuẩn xác nhất.'
      case 2:
        return 'Theo dõi video bài giảng và nắm chắc các mốc phân đoạn.'
      case 3:
        return 'Hoàn thành các câu hỏi trắc nghiệm để mở khóa xưởng vẽ.'
      case 4:
        return 'Thực hành tạo tranh bằng câu lệnh và nộp bài vào Balo.'
      case 5:
        return 'Chiêm ngưỡng cúp vàng, tác phẩm và sẵn sàng bài học mới!'
      default:
        return 'Hoàn thành các bước để thu thập đủ 3 sao nhé!'
    }
  }

  // Dynamic Studio Config for Stage 4 Practice
  const studioConfig = useMemo<AikiStudioConfig>(() => {
    const base = getAikiStudioConfig(lessonId, lessonTitle)
    const practice = journey.stage5_practice
    if (!practice) return base

    return {
      ...base,
      subjectName: practice.subjectName || base.subjectName,
      badge: practice.badge || base.badge,
      lockedFeatures: practice.lockedFeatures?.length ? practice.lockedFeatures : base.lockedFeatures,
      akiMotto: practice.akiMotto || base.akiMotto,
      illustrationType: (practice.illustrationType as any) || base.illustrationType,
      practiceWorkflow: practice.workflowSteps?.length
        ? {
            steps: practice.workflowSteps.map((ws, i) => ({
              stepIndex: ws.step || i + 1,
              taskLabel: ws.title,
              akiInstruction: ws.akiSpeech,
              quickPrompt: ws.quickPrompt,
              sampleResultUrl:
                practice.sampleUrl ||
                base.preloadedImages?.[i]?.url ||
                base.preloadedImages?.[0]?.url ||
                '/assets/aiki-islands/island1_lesson1_cat.jpg',
              akiFeedback: ws.instruction,
            })),
          }
        : base.practiceWorkflow,
    }
  }, [journey.stage5_practice, lessonId, lessonTitle])

  // Calculate Quiz Score
  const quizScore = useMemo(() => {
    const questions = journey.stage4_quiz.questions || []
    let correct = 0
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        correct++
      }
    })
    return correct
  }, [journey.stage4_quiz.questions, quizAnswers])

  const quizStars = useMemo(() => {
    const total = journey.stage4_quiz.questions?.length || 1
    const ratio = quizScore / total
    if (ratio >= 0.8) return 3
    if (ratio >= 0.5) return 2
    return 1
  }, [quizScore, journey.stage4_quiz.questions])

  const renderSidebarAction = (stage: number) => {
    switch (stage) {
      case 0:
        return (
          <Button
            variant="primary"
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1.5 cursor-pointer"
            onClick={() => advanceToStage(1)}
          >
            <span>👉 Đã hiểu mục tiêu!</span>
            <ArrowRight size={14} />
          </Button>
        )
      case 1:
        return isConfirmCorrect ? (
          <Button
            variant="primary"
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1.5 cursor-pointer"
            onClick={() => advanceToStage(2)}
          >
            <span>🎬 Xem video bài học</span>
            <ArrowRight size={14} />
          </Button>
        ) : (
          <p className="text-xs text-amber-800 font-bold text-center bg-amber-100/70 p-2 rounded-lg border border-amber-200">
            👉 Hãy chọn đáp án đúng ở cột bên trái nhé!
          </p>
        )
      case 2:
        return (
          <Button
            variant="primary"
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1.5 cursor-pointer"
            onClick={() => advanceToStage(3)}
          >
            <span>📝 Làm bài test thử tài</span>
            <ArrowRight size={14} />
          </Button>
        )
      case 3:
        return quizSubmitted ? (
          <Button
            variant="primary"
            className="w-full py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1.5 cursor-pointer"
            onClick={() => advanceToStage(4)}
          >
            <span>🎨 Vào xưởng thực hành</span>
            <ArrowRight size={14} />
          </Button>
        ) : (
          <p className="text-xs text-blue-800 font-bold text-center bg-blue-100/70 p-2 rounded-lg border border-blue-200">
            👉 Trả lời hết câu hỏi rồi bấm Nộp bài nhé!
          </p>
        )
      case 4:
        return (
          <div className="flex flex-col gap-1.5 text-xs text-slate-700 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
            <span className="font-bold text-emerald-800">🎨 Xưởng thực hành đang mở:</span>
            <span>Làm theo 4 bước hướng dẫn và nộp bài để cất vào Balo.</span>
          </div>
        )
      case 5:
        return (
          <div className="flex flex-col gap-2">
            {journey.stage6_completion.nextLessonSlug && onNavigateNextLesson ? (
              <Button
                variant="primary"
                className="w-full py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1.5 cursor-pointer"
                onClick={() => {
                  onFinishLesson?.({
                    stars: 3,
                    xp: 50,
                    nextLessonSlug: journey.stage6_completion.nextLessonSlug,
                  })
                  onNavigateNextLesson(journey.stage6_completion.nextLessonSlug!)
                }}
              >
                <span>🚀 Khám phá bài tiếp theo</span>
              </Button>
            ) : null}
            {onBackToMap && (
              <Button
                variant="secondary"
                className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1 cursor-pointer"
                onClick={() => {
                  onFinishLesson?.({ stars: 3, xp: 50 })
                  onBackToMap()
                }}
              >
                <span>🗺️ Về bản đồ đảo</span>
              </Button>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col gap-3">
      {/* ── TOP HEADER: 6 NẤC TIẾN ĐỘ SƯ PHẠM + NÚT THU GỌN/MỞ RỘNG SIDEBAR ── */}
      <header className="flex items-center justify-between gap-3 bg-white/90 backdrop-blur-md px-3 sm:px-4 py-2 rounded-2xl border-2 border-brand-100 shadow-sm shrink-0">
        {/* Trái: Nút Bản đồ + 6 Nấc kẹo dẻo Soft Clay */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-x-auto hidden-scrollbar py-0.5">
          {onBackToMap && (
            <button
              type="button"
              onClick={onBackToMap}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-black text-slate-700 hover:bg-slate-100 shadow-2xs transition-colors cursor-pointer shrink-0"
              title="Quay lại bản đồ"
            >
              <ChevronLeft size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Bản đồ</span>
            </button>
          )}

          <nav
            aria-label="Tiến độ bài học 6 chặng"
            className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto hidden-scrollbar py-0.5"
          >
            {STAGES.map((header, idx) => {
              const isActive = currentStage === header.index
              const isDone = completedStages.has(header.index) && currentStage > header.index

              return (
                <React.Fragment key={header.index}>
                  {idx > 0 && (
                    <ChevronRight
                      size={14}
                      className="text-slate-400 shrink-0 mx-0.5"
                      aria-hidden="true"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleStageSelect(header.index)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer shrink-0 shadow-2xs',
                      isActive &&
                        'bg-brand-500 text-white ring-2 ring-brand-300 shadow-sm font-black scale-105',
                      isDone &&
                        !isActive &&
                        'bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold hover:bg-emerald-100',
                      !isActive &&
                        !isDone &&
                        'bg-white border border-slate-200 text-slate-700 font-bold hover:border-brand-300 hover:text-brand-600 shadow-2xs hover:bg-slate-50'
                    )}
                    title={`Chặng ${header.index + 1}: ${header.title}`}
                  >
                    {isDone && !isActive ? (
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    ) : isActive ? (
                      <span className="size-4 rounded-full bg-white/25 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                        {header.index + 1}
                      </span>
                    ) : (
                      <span className="size-4 rounded-full bg-slate-100 text-slate-600 text-[11px] font-black flex items-center justify-center shrink-0">
                        {header.index + 1}
                      </span>
                    )}
                    <span className="inline">{header.title}</span>
                  </button>
                </React.Fragment>
              )
            })}
          </nav>
        </div>

        {/* Phải: Huy hiệu 3 Sao + Nút Thu gọn/Bảng tương tác */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 sm:px-3 py-1 text-xs font-black text-amber-900 shadow-2xs shrink-0">
            <Star className="size-3.5 fill-amber-400 text-amber-500" />
            <span>3 Sao</span>
          </div>

          <button
            type="button"
            data-testid="toggle-sidebar-btn"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border-2 px-2.5 sm:px-3 py-1 text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95',
              isSidebarCollapsed
                ? 'bg-brand-500 border-brand-600 text-white hover:bg-brand-600 ring-2 ring-brand-200'
                : 'bg-white border-brand-200 text-brand-800 hover:bg-brand-50'
            )}
            title={isSidebarCollapsed ? 'Hiển thị bảng tương tác AKI' : 'Thu gọn bảng tương tác'}
          >
            <span>{isSidebarCollapsed ? '⛶ Bảng tương tác' : '⛶ Thu gọn'}</span>
          </button>
        </div>
      </header>

      {/* ── 2 CỘT TƯƠNG THÍCH HOÀN HẢO ── */}
      <div className="flex flex-col md:flex-row items-stretch gap-4 flex-1 min-h-0 w-full overflow-hidden">
        {/* CỘT TRÁI (MAIN LEARNING BLOCKS - 60-65% WIDTH HOẶC 100% KHI THU GỌN SIDEBAR) */}
        <div
          data-testid="main-learning-canvas"
          className={cn(
            'flex-1 min-w-0 flex flex-col overflow-y-auto hidden-scrollbar gap-4 pr-1',
            isSidebarCollapsed && 'w-full'
          )}
        >
          {/* ──────────────────────────────────────────────────────────── */}
          {/* CHẶNG 0: MỤC TIÊU BÀI HỌC = ẢNH                            */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStage === 0 && (
            <section
              data-testid="stage-0-goal"
              className="rounded-3xl bg-white p-5 sm:p-7 shadow-clay border-2 border-brand-100 flex flex-col gap-6 animate-fade-up"
            >
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Ảnh mục tiêu to đẹp */}
                <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-lg border-4 border-amber-200 bg-amber-50/50 group relative aspect-[4/3] flex items-center justify-center p-1.5">
                  <img
                    src={journey.stage1_goal.imageUrl}
                    alt={journey.stage1_goal.title}
                    className="w-full h-full object-contain cursor-pointer group-hover:scale-105 transition-transform duration-300"
                    onClick={() =>
                      setZoomImage({
                        url: journey.stage1_goal.imageUrl,
                        title: journey.stage1_goal.title,
                      })
                    }
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/aiki-islands/island1_lesson1_cat.jpg'
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium pointer-events-none">
                    🎯 Hình mẫu mục tiêu
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setZoomImage({
                        url: journey.stage1_goal.imageUrl,
                        title: journey.stage1_goal.title,
                      })
                    }
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-xl backdrop-blur-xs flex items-center gap-1 opacity-90 hover:opacity-100 transition shadow-xs cursor-pointer z-10"
                    title="Xem ảnh phóng to"
                  >
                    <span>🔍 Phóng to</span>
                  </button>
                </div>

                {/* Nội dung mục tiêu & Lời dặn của AKI */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold w-fit border border-brand-200/60">
                    <Sparkles size={13} className="text-brand-500" />
                    <span>Chặng 1: Mục tiêu bài học</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                    {journey.stage1_goal.title}
                  </h2>

                  <p className="text-base text-slate-600 font-medium leading-relaxed bg-brand-50/50 p-3.5 rounded-2xl border border-brand-100">
                    {journey.stage1_goal.goalText}
                  </p>

                  {/* 3 Điểm Vàng Cần Nhớ */}
                  <div className="flex flex-col gap-2">
                    <p className="text-xs uppercase tracking-wider font-extrabold text-amber-600 flex items-center gap-1.5">
                      <Star size={14} className="fill-amber-500 text-amber-500" />
                      Điểm vàng cần ghi nhớ:
                    </p>
                    <div className="space-y-1.5">
                      {journey.stage1_goal.keyPoints.map((point, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70"
                        >
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lời AKI chào bé */}
                  <div className="flex items-start gap-3 bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
                    <div className="w-10 h-10 rounded-full bg-amber-400 flex-shrink-0 flex items-center justify-center text-xl shadow-sm">
                      🐱
                    </div>
                    <div className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                      <span className="font-bold block text-amber-950">Lời dặn từ AKI:</span>
                      {journey.stage1_goal.speech}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action button */}
              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-black rounded-2xl shadow-clay border-b-[4px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2 cursor-pointer"
                  onClick={() => advanceToStage(1)}
                >
                  <span>👉 Đã hiểu mục tiêu! Đi tiếp nào ✨</span>
                  <ArrowRight size={20} />
                </Button>
              </div>
            </section>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* CHẶNG 1: XÁC NHẬN MỤC TIÊU = 1 CÂU HỎI                     */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStage === 1 && (
            <section
              data-testid="stage-1-confirm"
              className="rounded-3xl bg-white p-4 sm:p-5 shadow-clay border-2 border-brand-100 flex flex-col gap-3.5 sm:gap-4 animate-fade-up"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold w-fit border border-amber-200/60">
                <HelpCircle size={13} className="text-amber-600" />
                <span>Chặng 2: Xác nhận mục tiêu</span>
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-black text-slate-800">
                  {journey.stage2_confirmGoal.question}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Bé hãy chọn 1 đáp án chính xác nhất để chuẩn bị bước vào xem video nhé!
                </p>
              </div>

              {/* 2 Cards lựa chọn A & B */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {journey.stage2_confirmGoal.options.map((option, idx) => {
                  const optKey = option.id || `opt-${idx}`
                  const isSelected = selectedConfirmOption === idx
                  const isCorrect = idx === journey.stage2_confirmGoal.correctIndex
                  const isImgFailed = failedOptionImages[optKey]
                  const hasValidImg = Boolean(
                    option.imageUrl && option.imageUrl.trim() !== '' && !isImgFailed
                  )

                  let cardStyle =
                    'border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 text-slate-700'

                  if (isSelected) {
                    if (isCorrect) {
                      cardStyle =
                        'border-mint-500 bg-mint-50/80 text-mint-900 ring-2 ring-mint-400 ring-offset-2'
                    } else {
                      cardStyle =
                        'border-rose-400 bg-rose-50/80 text-rose-900 ring-2 ring-rose-400 ring-offset-2'
                    }
                  }

                  return (
                    <button
                      key={optKey}
                      type="button"
                      onClick={() => {
                        setSelectedConfirmOption(idx)
                        const correct = idx === journey.stage2_confirmGoal.correctIndex
                        setIsConfirmCorrect(correct)
                        try {
                          playInstantSound(correct ? 'correct' : 'wrong')
                        } catch {
                          // ignore
                        }
                      }}
                      className={cn(
                        'flex flex-col items-center p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer group relative shadow-2xs hover:shadow-sm',
                        cardStyle
                      )}
                    >
                      <span className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-700 group-hover:border-brand-400 z-10">
                        {String.fromCharCode(65 + idx)}
                      </span>

                      {hasValidImg && (
                        <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden mb-3 bg-slate-100/70 border border-slate-200/80 relative flex items-center justify-center p-1.5">
                          <img
                            src={option.imageUrl}
                            alt={option.text}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            onError={() => {
                              setFailedOptionImages((prev) => ({ ...prev, [optKey]: true }))
                            }}
                          />
                          <span
                            role="button"
                            tabIndex={0}
                            aria-label="Xem ảnh phóng to"
                            onClick={(e) => {
                              e.stopPropagation()
                              setZoomImage({ url: option.imageUrl!, title: option.text })
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation()
                                setZoomImage({ url: option.imageUrl!, title: option.text })
                              }
                            }}
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold px-2 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 opacity-90 hover:opacity-100 transition shadow-xs z-10 cursor-pointer"
                            title="Xem ảnh phóng to"
                          >
                            <span>🔍 Phóng to</span>
                          </span>
                        </div>
                      )}

                      <p className="text-sm sm:text-base font-bold text-slate-800 text-center w-full leading-snug px-2">
                        {option.text}
                      </p>

                      {isSelected && (
                        <div className="mt-2.5 flex items-center gap-1.5 font-bold text-sm">
                          {isCorrect ? (
                            <>
                              <CheckCircle2 size={18} className="text-mint-600" />
                              <span className="text-mint-700">Chính xác! Tuyệt vời quá bé ơi!</span>
                            </>
                          ) : (
                            <>
                              <X size={18} className="text-rose-500" />
                              <span className="text-rose-600">Chưa đúng rồi, bé hãy thử chọn lại nhé!</span>
                            </>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Hộp giải thích & Feedback từ AKI khi chọn */}
              {selectedConfirmOption !== null && (
                <div
                  className={cn(
                    'p-3 sm:p-3.5 rounded-2xl border flex items-start gap-2.5 sm:gap-3 transition-all animate-fade-up',
                    isConfirmCorrect
                      ? 'bg-mint-50 border-mint-200 text-mint-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  )}
                >
                  <span className="text-2xl">{isConfirmCorrect ? '🎉' : '💡'}</span>
                  <div className="text-xs sm:text-sm leading-relaxed">
                    <span className="font-bold block mb-0.5">
                      {isConfirmCorrect ? 'AKI giải thích:' : 'Gợi ý từ AKI:'}
                    </span>
                    {isConfirmCorrect
                      ? journey.stage2_confirmGoal.explanation
                      : 'Bé hãy đọc lại câu hỏi và quan sát kỹ bức tranh minh họa để chọn phương án chuẩn nhất nhé!'}
                  </div>
                </div>
              )}

              {/* Action button */}
              <div className="pt-1 flex justify-between items-center">
                <Button
                  variant="secondary"
                  onClick={() => handleStageSelect(0)}
                  className="rounded-xl"
                >
                  Quay lại mục tiêu
                </Button>

                {isConfirmCorrect && (
                  <Button
                    variant="primary"
                    className="px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-black rounded-2xl shadow-clay border-b-[4px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-2 cursor-pointer"
                    onClick={() => advanceToStage(2)}
                  >
                    <span>👉 Xem video bài học thôi nào 🎬</span>
                    <ArrowRight size={20} />
                  </Button>
                )}
              </div>
            </section>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* CHẶNG 2: VIDEO BÀI HỌC NHÚNG TỪ YOUTUBE                    */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStage === 2 && (
            <section
              data-testid="stage-2-video"
              className="h-full max-h-full min-h-0 rounded-3xl bg-white p-3 sm:p-4 shadow-clay border-2 border-brand-100 flex flex-col justify-between gap-2 overflow-hidden animate-fade-up"
            >
              <div className="shrink-0 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200/60 shrink-0">
                  <Video size={12} className="text-purple-600" />
                  <span>Chặng 3: Video bài giảng</span>
                </div>
                <h2 className="text-xs sm:text-sm font-black text-slate-800 truncate">
                  {journey.stage3_video.title}
                </h2>
              </div>

              {/* YouTube Video Embed 16:9 thích ứng màn hình */}
              <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden [container-type:size] my-auto py-1">
                <div
                  className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-black flex items-center justify-center"
                  style={{
                    height: 'min(100cqh, calc(100cqw * 9 / 16))',
                    width: 'min(100cqw, calc(100cqh * 16 / 9))',
                    maxHeight: '100%',
                    maxWidth: '100%',
                    aspectRatio: '16 / 9',
                  }}
                >
                  <iframe
                    src={journey.stage3_video.videoUrl}
                    title={journey.stage3_video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>

              {/* Timestamps tinh gọn dạng chip ngang */}
              {journey.stage3_video.timestamps && journey.stage3_video.timestamps.length > 0 && (
                <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto hidden-scrollbar py-0.5">
                  {journey.stage3_video.timestamps.map((ts, idx) => (
                    <div
                      key={idx}
                      className="bg-purple-50/70 hover:bg-purple-100/80 px-2.5 py-1 rounded-xl border border-purple-200/70 flex items-center gap-1.5 shrink-0 text-xs transition-colors"
                    >
                      <span className="font-black text-purple-800">{ts.label}</span>
                      <span className="font-bold text-purple-600 bg-white px-1.5 py-0.5 rounded-md text-[10px] shadow-2xs">
                        {Math.floor(ts.startSec / 60)}:{String(ts.startSec % 60).padStart(2, '0')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action button */}
              <div className="shrink-0 flex justify-between items-center pt-1">
                <Button
                  variant="secondary"
                  onClick={() => handleStageSelect(1)}
                  className="rounded-xl text-xs sm:text-sm py-2 px-3 sm:px-4"
                >
                  Quay lại câu đố
                </Button>

                <Button
                  variant="primary"
                  className="px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-black rounded-2xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-2 cursor-pointer"
                  onClick={() => advanceToStage(3)}
                >
                  <span>👉 Làm bài test thử tài 📝</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            </section>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* CHẶNG 3: BÀI TEST KIỂM TRA KIẾN THỨC                       */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStage === 3 && (
            <section
              data-testid="stage-3-quiz"
              className="rounded-3xl bg-white p-5 sm:p-7 shadow-clay border-2 border-brand-100 flex flex-col gap-6 animate-fade-up"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold w-fit border border-blue-200/60">
                  <FileQuestion size={13} className="text-blue-600" />
                  <span>Chặng 4: Bài test thử tài</span>
                </div>

                {quizSubmitted && (
                  <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        className={cn(
                          s <= quizStars ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                        )}
                      />
                    ))}
                    <span className="text-xs font-bold text-amber-900 ml-1">
                      {quizScore}/{journey.stage4_quiz.questions.length} điểm
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                  {journey.stage4_quiz.title}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Vượt qua bài test với ít nhất {journey.stage4_quiz.passScore} câu đúng để mở khóa
                  Xưởng Sáng Tạo AI!
                </p>
              </div>

              {/* Danh sách câu hỏi */}
              <div className="space-y-6">
                {journey.stage4_quiz.questions.map((question, qIdx) => {
                  const selectedOpt = quizAnswers[qIdx]
                  const isAnswered = selectedOpt !== undefined

                  return (
                    <div
                      key={question.id || qIdx}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col gap-3"
                    >
                      <p className="text-base font-bold text-slate-800 flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <span>{question.prompt}</span>
                      </p>

                      {question.visualUrl && (
                        <div className="relative aspect-[4/3] max-w-sm mx-auto w-full rounded-xl overflow-hidden my-2 border border-slate-200 bg-slate-100/70 flex items-center justify-center p-1.5 group">
                          <img
                            src={question.visualUrl}
                            alt={question.prompt}
                            className="w-full h-full object-contain cursor-pointer group-hover:scale-105 transition-transform duration-300"
                            onClick={() =>
                              setZoomImage({ url: question.visualUrl!, title: question.prompt })
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setZoomImage({ url: question.visualUrl!, title: question.prompt })
                            }
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold px-2 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 opacity-90 hover:opacity-100 transition shadow-xs cursor-pointer z-10"
                            title="Xem ảnh phóng to"
                          >
                            <span>🔍 Phóng to</span>
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                        {question.options.map((optText, optIdx) => {
                          const isSelected = selectedOpt === optIdx
                          const isCorrect = optIdx === question.correctIndex

                          let optClass =
                            'border-slate-200 bg-white hover:bg-blue-50 text-slate-700'
                          if (quizSubmitted) {
                            if (isCorrect) {
                              optClass = 'border-mint-500 bg-mint-50 text-mint-900 font-bold'
                            } else if (isSelected && !isCorrect) {
                              optClass = 'border-rose-400 bg-rose-50 text-rose-900 font-medium'
                            }
                          } else if (isSelected) {
                            optClass = 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={quizSubmitted}
                              onClick={() => {
                                setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                                try {
                                  playInstantSound('click')
                                } catch {
                                  // ignore
                                }
                              }}
                              className={cn(
                                'p-3 rounded-xl border text-left text-sm transition-all flex items-center gap-2 cursor-pointer',
                                optClass
                              )}
                            >
                              <span className="w-5 h-5 rounded-md border border-slate-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="flex-1">{optText}</span>
                              {quizSubmitted && isCorrect && (
                                <Check size={16} className="text-mint-600 flex-shrink-0" />
                              )}
                              {quizSubmitted && isSelected && !isCorrect && (
                                <X size={16} className="text-rose-500 flex-shrink-0" />
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900">
                          <span className="font-bold">Giải thích: </span>
                          {question.explanation}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex justify-between items-center">
                <Button
                  variant="secondary"
                  onClick={() => handleStageSelect(2)}
                  className="rounded-xl"
                >
                  Xem lại video
                </Button>

                {!quizSubmitted ? (
                  <Button
                    variant="primary"
                    disabled={
                      Object.keys(quizAnswers).length < journey.stage4_quiz.questions.length
                    }
                    onClick={() => {
                      setQuizSubmitted(true)
                      try {
                        playInstantSound('star')
                      } catch {
                        // ignore
                      }
                    }}
                    className="px-6 py-3 text-base font-bold rounded-xl"
                  >
                    Nộp bài kiểm tra
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="px-8 py-4 text-base sm:text-lg font-black rounded-2xl shadow-clay border-b-[4px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-2 cursor-pointer"
                    onClick={() => advanceToStage(4)}
                  >
                    <span>👉 Vào Xưởng Sáng Tạo AI 🎨</span>
                    <ArrowRight size={20} />
                  </Button>
                )}
              </div>
            </section>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* CHẶNG 4: THỰC HÀNH - XƯỞNG SÁNG TẠO AI (STUDIO WORKSPACE)   */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStage === 4 && (
            <section data-testid="stage-4-practice" className="w-full flex flex-col gap-4 animate-fade-up">
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-brand-100 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
                  <Palette size={13} className="text-emerald-600" />
                  <span>Chặng 5: Xưởng sáng tạo</span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Vẽ tranh cùng AKI qua 4 bước thực hành và nộp bài để cất vào Balo!
                </p>
              </div>

              <AikiStudioWorkspace
                config={studioConfig}
                lessonId={lessonId}
                lessonTitle={lessonTitle}
                lessonBadge={journey.stage5_practice.badge || 'Bài thực hành'}
                characterName={journey.stage5_practice.subjectName || lessonTitle}
                lockedFeatures={journey.stage5_practice.lockedFeatures}
                initialAttemptsLeft={6}
                maxAttempts={6}
                studentStars={studentStars}
                onBackToLesson={() => handleStageSelect(3)}
                onReplayVideo={() => handleStageSelect(2)}
                onSubmitWork={({ selectedImage, prompt }) => {
                  setSubmittedArtwork({ image: selectedImage, prompt })
                  advanceToStage(5)
                }}
              />
            </section>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* CHẶNG 5: MÀN KẾT THÚC - VINH DANH CÚP VÀNG & TÁC PHẨM      */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStage === 5 && (
            <section
              data-testid="stage-5-completion"
              className="rounded-3xl bg-white p-6 sm:p-9 shadow-clay border-2 border-brand-100 flex flex-col items-center text-center gap-6 animate-fade-up"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-300/60">
                <Trophy size={13} className="text-amber-600" />
                <span>Chặng 6: Hoàn thành bài học</span>
              </div>

              {/* Cúp Vàng Lấp Lánh */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center shadow-xl border-4 border-amber-300 animate-bounce">
                  <Trophy size={56} className="text-amber-800 drop-shadow-md" />
                </div>
                <div className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles size={12} />
                  +50 XP
                </div>
              </div>

              {/* 3 Ngôi Sao Vàng */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    size={36}
                    className="fill-amber-400 text-amber-500 drop-shadow-md animate-pulse"
                  />
                ))}
              </div>

              {/* Tiêu đề & Lời chúc mừng */}
              <div className="max-w-md space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                  {journey.stage6_completion.title}
                </h2>
                <p className="text-base text-slate-600 font-medium leading-relaxed">
                  {journey.stage6_completion.congratsMessage}
                </p>
              </div>

              {/* Trưng bày Tác Phẩm Bé Vừa Vẽ Trong Xưởng */}
              <div className="w-full max-w-lg rounded-2xl bg-amber-50/70 p-4 border-2 border-amber-200 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <Award size={16} className="text-amber-600" />
                  <span>Tác phẩm kiệt xuất vừa cất vào Balo</span>
                </div>

                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md border border-amber-300 bg-white/90 relative group flex items-center justify-center p-1.5">
                  <img
                    src={
                      submittedArtwork?.image.url ||
                      journey.stage6_completion.rewardBadge.iconUrl ||
                      journey.stage1_goal.imageUrl
                    }
                    alt="Kiệt tác của bé"
                    className="w-full h-full object-contain cursor-pointer group-hover:scale-105 transition-transform duration-300"
                    onClick={() => {
                      const url =
                        submittedArtwork?.image.url ||
                        journey.stage6_completion.rewardBadge.iconUrl ||
                        journey.stage1_goal.imageUrl
                      if (url) setZoomImage({ url, title: 'Tác phẩm kiệt xuất của bé' })
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/aiki-islands/island1_lesson1_cat.jpg'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const url =
                        submittedArtwork?.image.url ||
                        journey.stage6_completion.rewardBadge.iconUrl ||
                        journey.stage1_goal.imageUrl
                      if (url) setZoomImage({ url, title: 'Tác phẩm kiệt xuất của bé' })
                    }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-xl backdrop-blur-xs flex items-center gap-1 opacity-90 hover:opacity-100 transition shadow-xs cursor-pointer z-10"
                    title="Xem ảnh phóng to"
                  >
                    <span>🔍 Phóng to</span>
                  </button>
                </div>

                {submittedArtwork?.prompt && (
                  <p className="text-xs text-slate-600 italic bg-white/80 px-3 py-2 rounded-lg border border-amber-200/60 w-full text-center">
                    &ldquo;{submittedArtwork.prompt}&rdquo;
                  </p>
                )}

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-100 text-mint-800 text-xs font-bold">
                  <CheckCircle2 size={14} className="text-mint-600" />
                  <span>{journey.stage6_completion.rewardBadge.name}</span>
                </div>
              </div>

              {/* Nút điều hướng kết thúc */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md pt-2">
                {journey.stage6_completion.nextLessonSlug && onNavigateNextLesson ? (
                  <Button
                    variant="primary"
                    className="flex-1 py-4 text-base sm:text-lg font-black rounded-2xl shadow-clay border-b-[4px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2 cursor-pointer"
                    onClick={() => {
                      onFinishLesson?.({
                        stars: 3,
                        xp: 50,
                        nextLessonSlug: journey.stage6_completion.nextLessonSlug,
                      })
                      onNavigateNextLesson(journey.stage6_completion.nextLessonSlug!)
                    }}
                  >
                    <span>👉 Khám Phá Bài Tiếp Theo 🚀</span>
                  </Button>
                ) : null}

                {onBackToMap && (
                  <Button
                    variant="secondary"
                    className="flex-1 py-4 text-base font-bold rounded-2xl border-2 border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer"
                    onClick={() => {
                      onFinishLesson?.({ stars: 3, xp: 50 })
                      onBackToMap()
                    }}
                  >
                    <span>🗺️ Quay Về Bản Đồ Đảo</span>
                  </Button>
                )}
              </div>
            </section>
          )}
        </div>

        {/* CỘT PHẢI: SIDEBAR TƯƠNG TÁC AKI ĐỒNG HÀNH (35-40% WIDTH) */}
        {!isSidebarCollapsed && (
          <aside
            data-testid="interactive-sidebar"
            className="w-full md:w-[300px] lg:w-[360px] xl:w-[400px] shrink-0 flex flex-col bg-white rounded-3xl border-2 border-brand-100 shadow-clay overflow-hidden"
          >
            {/* Header Sidebar: Chặng X/6 + Tên Chặng + Nút Âm Thanh */}
            <div className="p-4 bg-gradient-to-r from-brand-50 to-amber-50 border-b border-brand-100 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-brand-500 text-white text-xs font-black uppercase tracking-wider">
                Chặng {currentStage + 1}/6: {STAGES[currentStage]?.title}
              </span>
              <button
                type="button"
                onClick={() => speakCurrentStage(currentStageSpeech)}
                className="p-1.5 rounded-full bg-white hover:bg-brand-100 text-brand-700 transition shadow-2xs cursor-pointer"
                title="Nghe lời giảng của AKI"
              >
                <Volume2 size={16} />
              </button>
            </div>

            {/* Thân Sidebar: Mascot AKI + Hộp thoại + Thẻ tương tác chặng */}
            <div className="flex-1 overflow-y-auto hidden-scrollbar p-4 flex flex-col gap-4">
              {/* Mascot Mèo AKI sinh động */}
              <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-b from-amber-50 to-orange-50/40 rounded-2xl border border-amber-200 shadow-2xs">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-300 border-4 border-white shadow-md grid place-items-center text-4xl animate-bounce">
                  {getStageMascotEmoji(currentStage)}
                </div>
                <span className="mt-2 text-xs font-black text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                  {getStageMascotRole(currentStage)}
                </span>
              </div>

              {/* Lời thoại của AKI có nút nghe đọc */}
              <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-black text-amber-950">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-amber-600" />
                    LỜI THOẠI CỦA AKI
                  </span>
                  <button
                    type="button"
                    onClick={() => speakCurrentStage(currentStageSpeech)}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 size={12} />
                    Nghe lại
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                  {currentStageSpeech}
                </p>
              </div>

              {/* Thẻ hành động chặng hiện tại */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-700">
                  🎯 Nhiệm vụ chặng này:
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  {getStageInstruction(currentStage)}
                </p>
                {/* Nút hành động nhanh tương ứng */}
                <div className="mt-1">
                  {renderSidebarAction(currentStage)}
                </div>
              </div>

              {/* Tiến độ sao & danh hiệu */}
              <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-bold flex items-center gap-1 text-amber-600">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  Tiến độ: {currentStage + 1}/6 chặng
                </span>
                <span className="font-extrabold text-brand-600">
                  ⭐ {studentStars} Sao tích lũy
                </span>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ── LIGHTBOX MODAL PHÓNG TO ẢNH FULL-SCREEN ── */}
      {zoomImage && (
        <div
          data-testid="lightbox-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút Đóng ✕ to rõ */}
            <button
              type="button"
              aria-label="Đóng"
              onClick={() => setZoomImage(null)}
              className="absolute -top-12 right-0 sm:top-3 sm:right-3 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xl font-bold backdrop-blur-md transition cursor-pointer shadow-lg border border-white/20"
            >
              <X size={24} />
            </button>

            {/* Ảnh phóng to trọn vẹn */}
            <img
              src={zoomImage.url}
              alt={zoomImage.title}
              className="max-w-4xl max-h-[85vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/20 bg-black/40"
            />

            {zoomImage.title && (
              <p className="mt-3 text-sm sm:text-base text-white/90 font-medium text-center bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-xs max-w-xl truncate">
                {zoomImage.title}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
