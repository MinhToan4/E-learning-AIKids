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
  RotateCcw,
  Play,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import {
  AikiStudioWorkspace,
  type StudioImageItem,
  getDefaultPracticeParts,
  type PracticePartState,
} from './AikiStudioWorkspace'
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

export const isValidImageUrl = (url?: string) => {
  if (!url) return false
  const trimmed = url.trim()
  return (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  )
}

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

  // Stage 2 (Video) seek state
  const [videoSeekSec, setVideoSeekSec] = useState<number | null>(null)

  // Stage 3 (Quiz) state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false)

  // Stage 4 (Practice) submitted artwork state
  const [submittedArtwork, setSubmittedArtwork] = useState<{
    image: StudioImageItem
    prompt: string
  } | null>(null)

  // Stage 4 (Practice) 4 Món đồ / 4 Phần thực hành state
  const [activePracticePartIndex, setActivePracticePartIndex] = useState<number>(0)
  const [practicePartsState, setPracticePartsState] = useState<PracticePartState[]>([])

  const defaultPracticeParts = useMemo(() => {
    return getDefaultPracticeParts(lessonId, journey.stage5_practice?.subjectName || lessonTitle)
  }, [lessonId, journey.stage5_practice?.subjectName, lessonTitle])

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

  const handleSeekVideo = useCallback((sec: number) => {
    setVideoSeekSec(sec)
    try {
      playInstantSound('click')
    } catch {
      // ignore
    }
  }, [])

  const videoEmbedUrl = useMemo(() => {
    const raw = journey.stage3_video.videoUrl
    if (videoSeekSec === null || videoSeekSec === undefined) {
      return raw
    }
    const delimiter = raw.includes('?') ? '&' : '?'
    return `${raw}${delimiter}start=${videoSeekSec}&autoplay=1`
  }, [journey.stage3_video.videoUrl, videoSeekSec])

  const videoChapters = useMemo(() => {
    if (journey.stage3_video.timestamps && journey.stage3_video.timestamps.length > 0) {
      return journey.stage3_video.timestamps
    }
    return [
      { label: 'Tình huống mở đầu', startSec: 0, endSec: 30 },
      { label: 'Khám phá bí kíp', startSec: 30, endSec: 75 },
      { label: 'Quy tắc 4 chìa khóa', startSec: 75, endSec: 120 },
      { label: 'Thực hành cùng AKI', startSec: 120, endSec: 150 },
      { label: 'Mẹo tránh lỗi đoán mò', startSec: 150, endSec: 175 },
      { label: 'Tổng kết bài học', startSec: 175, endSec: 180 },
    ]
  }, [journey.stage3_video.timestamps])

  const formulaCards = useMemo(() => {
    const kp = journey.stage1_goal.keyPoints || []
    const cleanPoint = (raw?: string, fallback = '') => {
      if (!raw) return fallback
      const match = raw.match(/:\s*['"“](.+?)['"”]$/) || raw.match(/:\s*(.+)$/)
      return match ? `“${match[1]}”` : raw
    }

    return [
      {
        id: 'slot-1',
        icon: '🔵',
        code: 'CÁI GÌ',
        sub: 'Ai, đồ vật gì',
        val: cleanPoint(kp[0], 'Chủ thể chính của bức tranh'),
        color: '#3FA9F5',
        bg: 'bg-blue-50/80 border-blue-200 text-blue-950',
        badge: 'bg-blue-600 text-white',
      },
      {
        id: 'slot-2',
        icon: '🟡',
        code: 'TRÔNG THẾ NÀO',
        sub: 'Màu sắc, hình dáng',
        val: cleanPoint(kp[1], 'Đặc điểm ngoại hình, màu sắc'),
        color: '#F5C93E',
        bg: 'bg-amber-50/80 border-amber-200 text-amber-950',
        badge: 'bg-amber-600 text-white',
      },
      {
        id: 'slot-3',
        icon: '🟠',
        code: 'ĐANG LÀM GÌ',
        sub: 'Hành động',
        val: cleanPoint(kp[2], 'Hành động hoặc tư thế'),
        color: '#FF9427',
        bg: 'bg-orange-50/80 border-orange-200 text-orange-950',
        badge: 'bg-orange-600 text-white',
      },
      {
        id: 'slot-4',
        icon: '🔴',
        code: 'Ở ĐÂU',
        sub: 'Bối cảnh, nơi chốn',
        val: cleanPoint(kp[3], 'Khung cảnh xung quanh'),
        color: '#FF6FA5',
        bg: 'bg-rose-50/80 border-rose-200 text-rose-950',
        badge: 'bg-rose-600 text-white',
      },
    ]
  }, [journey.stage1_goal.keyPoints])

  const isLesson1_2 = useMemo(() => {
    return (
      lessonId.includes('1-2') ||
      lessonTitle.toLowerCase().includes('bốn chiếc chìa khoá') ||
      journey.stage1_goal.title.toLowerCase().includes('bốn chiếc chìa khoá')
    )
  }, [lessonId, lessonTitle, journey.stage1_goal.title])

  const hasKeyOptions = useMemo(() => {
    return journey.stage2_confirmGoal.options.some(
      (opt) => opt.keyItems && opt.keyItems.length > 0
    )
  }, [journey.stage2_confirmGoal.options])

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
        return (
          journey.stage5_practice.workflowSteps?.[0]?.akiSpeech ||
          journey.stage5_practice.akiMotto ||
          'Cùng AKI bắt tay sáng tạo tranh trong Xưởng Sáng Tạo AI nào!'
        )
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
                '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2',
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
    <div className="w-full h-full min-h-0 flex-1 flex flex-col gap-2 overflow-hidden">
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

          {/* Thanh chuyển nhanh bài học (Quick Station Switcher) */}
          <div className="flex items-center gap-1 bg-amber-50/90 p-1 rounded-full border border-amber-200/80 shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => onNavigateNextLesson?.('bai-1-1-mot-tu-hay-nam-tu')}
              className={cn(
                "px-2.5 py-1 text-xs font-black rounded-full transition-all cursor-pointer",
                !isLesson1_2 ? "bg-brand-600 text-white shadow-xs" : "text-slate-600 hover:text-brand-600"
              )}
              title="Xem Trạm 1: Mèo Mimi"
            >
              Trạm 1: Mèo Mimi 🐱
            </button>
            <button
              type="button"
              onClick={() => onNavigateNextLesson?.('bai-1-2-bon-chiec-chia-khoa')}
              className={cn(
                "px-2.5 py-1 text-xs font-black rounded-full transition-all cursor-pointer",
                isLesson1_2 ? "bg-brand-600 text-white shadow-xs" : "text-slate-600 hover:text-brand-600"
              )}
              title="Xem Trạm 2: Bốn Chìa Khoá"
            >
              Trạm 2: 4 Chìa Khoá 🔑
            </button>
          </div>

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
            'flex-1 min-w-0 flex flex-col gap-4 pr-1',
            currentStage === 4
              ? 'h-full min-h-0 overflow-hidden pr-0 gap-0'
              : 'overflow-y-auto hidden-scrollbar',
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
                {/* Cột trái: Nếu là Bài 1.2 hiển thị Banner 4 chiếc chìa khoá Soft Clay kèm ảnh mẫu, nếu không hiển thị ảnh mục tiêu chuẩn */}
                {isLesson1_2 ? (
                  <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-lg border-4 border-amber-200 bg-gradient-to-br from-[#FFF3E2] via-[#FFE7E2] to-[#EFE6FF] flex flex-col items-center justify-center p-4 sm:p-5 relative aspect-[4/3] group">
                    {isValidImageUrl(journey.stage1_goal.imageUrl) ? (
                      <div className="w-full flex-1 min-h-0 flex items-center justify-center relative overflow-hidden">
                        <img
                          src={journey.stage1_goal.imageUrl}
                          alt={journey.stage1_goal.title}
                          className="max-w-full max-h-40 sm:max-h-48 object-contain cursor-pointer group-hover:scale-105 transition-transform duration-300 rounded-xl shadow-xs"
                          onClick={() =>
                            setZoomImage({
                              url: journey.stage1_goal.imageUrl,
                              title: journey.stage1_goal.title,
                            })
                          }
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex gap-3 sm:gap-4 justify-center text-4xl sm:text-5xl drop-shadow-sm select-none">
                        <span className="inline-block hover:scale-110 transition-transform hue-rotate-[190deg]">🔑</span>
                        <span className="inline-block hover:scale-110 transition-transform">🔑</span>
                        <span className="inline-block hover:scale-110 transition-transform hue-rotate-[-25deg]">🔑</span>
                        <span className="inline-block hover:scale-110 transition-transform hue-rotate-[-60deg]">🔑</span>
                      </div>
                    )}
                    <div className="font-baloo text-xl sm:text-2xl font-black text-slate-800 text-center mt-2 leading-tight">
                      Bốn chiếc chìa khoá
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-600 text-center mt-1.5 leading-relaxed max-w-xs">
                      Mở được cả bốn thì AKI vẽ đúng ngay từ lần đầu tiên
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium pointer-events-none">
                      🎯 Hình mẫu mục tiêu
                    </div>
                    {isValidImageUrl(journey.stage1_goal.imageUrl) && (
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
                        <span>🔍 Xem ảnh mẫu</span>
                      </button>
                    )}
                  </div>
                ) : (
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
                        (e.target as HTMLImageElement).src = '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
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
                )}

                {/* Nội dung mục tiêu & Lời dặn của AKI */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold w-fit border border-brand-200/60">
                    <Sparkles size={13} className="text-brand-500" />
                    <span>Chặng 1: Mục tiêu bài học</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                    {journey.stage1_goal.title}
                  </h2>

                  <div className="text-base text-slate-700 font-medium leading-relaxed bg-brand-50/60 p-4 rounded-2xl border border-brand-100 shadow-2xs">
                    <span className="font-black text-brand-900 block mb-1 text-sm uppercase tracking-wide">
                      🎯 Mục Tiêu Cốt Lõi:
                    </span>
                    <p className="font-bold text-slate-800">{journey.stage1_goal.goalText}</p>
                  </div>

                  {/* Bảng 4 ô công thức màu sắc cho tất cả các bài học (bao gồm Bài 1.1 và Bài 1.2) */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900">
                      <span>🔑</span>
                      <span>Công Thức Câu Lệnh Bốn Ô:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {formulaCards.map((card) => (
                        <div
                          key={card.id}
                          className={cn(
                            "border rounded-xl p-2.5 flex flex-col justify-center transition-all shadow-2xs",
                            card.bg
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs shrink-0">{card.icon}</span>
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: card.color }}
                            />
                            <b className="text-[11px] sm:text-xs font-black tracking-wide">
                              {card.code}
                            </b>
                          </div>
                          <div className="text-xs sm:text-sm font-bold mt-0.5 line-clamp-1 sm:line-clamp-2">
                            {card.val}
                          </div>
                        </div>
                      ))}
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

              {/* Tùy biến giao diện theo loại options: Có keyItems (3 Bộ chìa khoá A/B/C) hoặc Cards A & B thông thường */}
              {hasKeyOptions ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {journey.stage2_confirmGoal.options.map((option, idx) => {
                    const optKey = option.id || `opt-${idx}`
                    const isSelected = selectedConfirmOption === idx
                    const isCorrect = idx === journey.stage2_confirmGoal.correctIndex
                    const isPick = isSelected && isCorrect

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
                          'relative flex flex-col rounded-2xl p-4 sm:p-5 border-2 text-left transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md group',
                          isPick
                            ? 'border-mint-500 bg-mint-50/90 ring-2 ring-mint-400 ring-offset-2 scale-[1.02]'
                            : isSelected && !isCorrect
                            ? 'border-rose-400 bg-rose-50/80 ring-2 ring-rose-400 ring-offset-2'
                            : selectedConfirmOption !== null
                            ? 'opacity-60 border-slate-200 bg-[#FAF8FF] hover:opacity-90'
                            : 'border-slate-200 bg-[#FAF8FF] hover:border-brand-300'
                        )}
                      >
                        {/* Tick icon khi chọn đúng */}
                        {isPick && (
                          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-mint-500 text-white flex items-center justify-center font-black text-sm shadow-sm animate-fade-up">
                            ✓
                          </div>
                        )}

                        {/* Badge A, B, C */}
                        <span
                          className={cn(
                            'w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm border transition-colors',
                            isPick
                              ? 'bg-mint-500 text-white border-mint-500'
                              : 'bg-slate-100 text-slate-700 border-slate-200 group-hover:border-brand-300'
                          )}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>

                        {/* Icon Ổ khoá & Tiêu đề */}
                        <div className="flex flex-col items-center gap-1.5 my-2 w-full">
                          <div
                            className={cn(
                              'w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 transition-all',
                              isPick
                                ? 'bg-mint-500 border-mint-500 text-white shadow-md'
                                : 'bg-slate-100/90 border-dashed border-slate-300 text-slate-700 group-hover:border-brand-400'
                            )}
                          >
                            {isPick ? '🔓' : '🔒'}
                          </div>
                          <span
                            className={cn(
                              'text-xs font-black uppercase tracking-wider',
                              isPick ? 'text-mint-800' : 'text-slate-600'
                            )}
                          >
                            {option.text}
                          </span>
                        </div>

                        {/* Danh sách các thanh chìa khoá màu sắc */}
                        <div className="flex flex-col gap-2.5 w-full my-2.5 flex-1 justify-center">
                          {option.keyItems?.map((item, kIdx) => (
                            <div key={kIdx} className="flex items-center w-full">
                              {/* Khoen tròn (kbow) */}
                              <span
                                className={cn(
                                  'w-6 h-6 rounded-full shrink-0 z-10',
                                  isPick ? 'bg-mint-50' : 'bg-white'
                                )}
                                style={{
                                  border: `4px solid ${item.color}`,
                                }}
                              />
                              {/* Thanh ngang (kbar) */}
                              <span
                                className="flex-1 h-6 rounded-r-md -ml-2 px-2 text-xs font-black text-white flex items-center truncate shadow-2xs relative"
                                style={{ backgroundColor: item.color }}
                              >
                                <span>{item.label}</span>
                                {/* Răng chìa khoá */}
                                <span
                                  className="absolute right-2.5 -bottom-1 w-1.5 h-1 rounded-b-xs"
                                  style={{ backgroundColor: item.color }}
                                />
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Chân card */}
                        <div
                          className={cn(
                            'mt-auto pt-2 text-[11px] font-extrabold text-center w-full',
                            isPick
                              ? 'text-mint-700'
                              : isSelected && !isCorrect
                              ? 'text-rose-600'
                              : 'text-slate-400 group-hover:text-brand-600'
                          )}
                        >
                          {isPick
                            ? 'Đúng bộ này rồi! 🎉'
                            : isSelected && !isCorrect
                            ? 'Chưa mở được 🔒'
                            : 'Bấm để chọn bộ này'}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
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
              )}

              {/* Action button & Mint Feedback */}
              <div className="pt-1 flex flex-col sm:flex-row justify-between items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => handleStageSelect(0)}
                  className="rounded-xl order-2 sm:order-1 text-xs sm:text-sm"
                >
                  Quay lại mục tiêu
                </Button>

                {isConfirmCorrect ? (
                  <div className="flex-1 w-full order-1 sm:order-2 flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex-1 bg-mint-50 border border-mint-200 rounded-2xl p-3 flex items-center gap-2.5 text-xs sm:text-sm text-mint-900 shadow-2xs">
                      <span className="text-xl shrink-0">🎉</span>
                      <p className="leading-snug font-medium">
                        <strong>Đúng rồi các cậu ơi!</strong> {journey.stage2_confirmGoal.explanation}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto px-6 sm:px-8 py-3.5 text-sm sm:text-base font-black rounded-2xl shadow-clay border-b-[4px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                      onClick={() => advanceToStage(2)}
                    >
                      <span>🎬 Xem video bài học thôi nào →</span>
                      <ArrowRight size={20} />
                    </Button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic order-1 sm:order-2">
                    💡 Xem gợi ý ở bảng bên phải nếu cần hỗ trợ nhé!
                  </div>
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
                    src={videoEmbedUrl}
                    title={journey.stage3_video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>

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
                  <span>📝 Làm bài test thử tài →</span>
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

              {/* Danh sách câu hỏi bố cục 3 cột */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-stretch">
                {journey.stage4_quiz.questions.map((question, qIdx) => {
                  const selectedOpt = quizAnswers[qIdx]

                  return (
                    <div
                      key={question.id || qIdx}
                      className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-amber-100/80 shadow-clay-sm flex flex-col justify-between hover:border-amber-200 transition-all"
                    >
                      <div>
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full bg-brand-500 text-white text-xs font-black shadow-xs tracking-wide">
                            CÂU {qIdx + 1}
                          </span>
                          <p className="text-sm sm:text-base font-bold text-slate-800 leading-snug mt-1.5">
                            {question.prompt}
                          </p>
                        </div>

                        {isValidImageUrl(question.visualUrl) && (
                          <div className="aspect-[16/10] sm:aspect-[4/3] w-full rounded-2xl overflow-hidden my-2 border border-slate-200 bg-slate-100/70 flex items-center justify-center p-1.5 group relative">
                            <img
                              src={question.visualUrl}
                              alt={question.prompt}
                              className="w-full h-full object-contain cursor-pointer group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.parentElement?.classList.add('hidden')
                              }}
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
                      </div>

                      <div className="flex flex-col gap-2 mt-auto pt-3">
                        {question.options.map((optText, optIdx) => {
                          const isSelected = selectedOpt === optIdx
                          const isCorrect = optIdx === question.correctIndex

                          let optClass =
                            'border-slate-200 bg-white hover:bg-amber-50/60 text-slate-700'
                          if (quizSubmitted) {
                            if (isCorrect) {
                              optClass = 'border-mint-500 bg-mint-50 text-mint-900 font-bold'
                            } else if (isSelected && !isCorrect) {
                              optClass = 'border-rose-400 bg-rose-50 text-rose-900 font-medium'
                            }
                          } else if (isSelected) {
                            optClass = 'border-brand-500 bg-brand-50 text-brand-900 font-bold'
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
                                'p-2.5 sm:p-3 rounded-2xl border-2 text-left text-xs sm:text-sm font-semibold transition-all flex items-center gap-2.5 cursor-pointer min-h-[44px]',
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

                        {quizSubmitted && question.explanation && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium flex items-start gap-1.5">
                            <span>💡</span>
                            <span className="flex-1">{question.explanation}</span>
                          </div>
                        )}
                      </div>
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
            <section
              data-testid="stage-4-practice"
              className="w-full h-full min-h-0 flex-1 flex flex-col overflow-hidden animate-fade-up"
            >

              <AikiStudioWorkspace
                config={studioConfig}
                lessonId={lessonId}
                lessonTitle={lessonTitle}
                lessonBadge={journey.stage5_practice.badge || 'Bài thực hành'}
                characterName={journey.stage5_practice.subjectName || lessonTitle}
                lockedFeatures={journey.stage5_practice.lockedFeatures}
                initialAttemptsLeft={8}
                maxAttempts={8}
                studentStars={studentStars}
                activePartIndex={activePracticePartIndex}
                onPartChange={setActivePracticePartIndex}
                onPracticePartsSync={(parts, activeIdx) => {
                  setPracticePartsState(parts)
                  setActivePracticePartIndex(activeIdx)
                }}
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
                      (e.target as HTMLImageElement).src = '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
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

        {/* CỘT PHẢI: SIDEBAR TƯƠNG TÁC AKI ĐỒNG HÀNH (300-400px) */}
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
                    {currentStage === 4 ? 'DẶN DÒ CỦA AKI' : 'LỜI THOẠI CỦA AKI'}
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

              {/* Nếu ở Chặng 4 (Thực hành - Xưởng sáng tạo): Hiển thị chi tiết Bốn món đồ, Tiến trình 4 bước & Mẹo vàng AKI */}
              {currentStage === 4 ? (
                <div className="flex flex-col gap-3">
                  {/* KHỐI: 🧰 BỐN MÓN ĐỒ CỦA CÁC CẬU */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-3xl p-3.5 border-2 border-amber-300 shadow-clay flex flex-col gap-2.5 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-amber-950">
                        <span className="text-base">🧰</span>
                        <span>Bốn món đồ của các cậu</span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        Chỉ 4 lượt chọn
                      </span>
                    </div>

                    <p className="text-xs text-amber-900 font-medium">
                      Bài này có 4 phần. Mỗi phần 2 lượt tạo.
                    </p>

                    {/* 4 Card món đồ có thể bấm chọn */}
                    <div className="flex flex-col gap-2">
                      {(() => {
                        const partsList = practicePartsState.length > 0
                          ? practicePartsState
                          : defaultPracticeParts.map((def, idx) => ({
                              ...def,
                              images: [],
                              isDone: false,
                              isActive: idx === activePracticePartIndex,
                            }))

                        return partsList.map((part, idx) => {
                          const isSelected = activePracticePartIndex === idx
                          const imagesCount = part.images?.length || 0
                          const isDone = part.isDone || imagesCount >= 2

                          let statusBadgeText = `PHẦN ${idx + 1} - CHỜ`
                          let statusBadgeClass = 'bg-slate-200 text-slate-700'
                          if (isDone) {
                            statusBadgeText = `PHẦN ${idx + 1} - XONG ✓`
                            statusBadgeClass = 'bg-emerald-500 text-white shadow-2xs'
                          } else if (isSelected) {
                            statusBadgeText = `PHẦN ${idx + 1} - ĐANG LÀM`
                            statusBadgeClass = 'bg-indigo-600 text-white shadow-xs animate-pulse'
                          }

                          let turnText = '(lượt 1, lượt 2)'
                          if (imagesCount >= 2) {
                            turnText = '(✓ lượt 1, ✓ lượt 2)'
                          } else if (imagesCount === 1) {
                            turnText = '(✓ lượt 1, lượt 2)'
                          }

                          const displayName = isDone || isSelected
                            ? part.title
                            : `Chưa chọn món đồ / ${part.title}`

                          return (
                            <button
                              key={part.partNumber}
                              type="button"
                              data-testid={`sidebar-practice-part-${part.partNumber}`}
                              onClick={() => {
                                setActivePracticePartIndex(idx)
                                playInstantSound('click')
                              }}
                              className={cn(
                                'w-full p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 select-none',
                                isSelected
                                  ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-200 scale-[1.01]'
                                  : isDone
                                  ? 'bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100/70'
                                  : 'bg-white/90 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                              )}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider', statusBadgeClass)}>
                                  {statusBadgeText}
                                </span>
                                <span className="text-[11px] font-bold text-slate-500">
                                  {turnText}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-lg shrink-0">{part.icon}</span>
                                <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                                  {displayName}
                                </span>
                              </div>
                            </button>
                          )
                        })
                      })()}
                    </div>
                  </div>

                  {/* Tiến trình 4 bước thực hành của bài học */}
                  <div className="bg-indigo-50/80 rounded-2xl p-3.5 border border-indigo-200 flex flex-col gap-2.5 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wide text-indigo-950 flex items-center gap-1.5">
                        <span>🎯</span>
                        <span>Tiến Trình 4 Bước Thực Hành</span>
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        Chuẩn AIKI
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {[
                        {
                          step: 1,
                          title: 'Bước 1: Thử câu lệnh ban đầu (1-2 từ)',
                          hint: studioConfig?.practiceWorkflow?.steps?.[0]?.quickPrompt
                            ? `💡 Thử: "${studioConfig.practiceWorkflow.steps[0].quickPrompt}"`
                            : 'Thử lệnh 1-2 từ',
                        },
                        {
                          step: 2,
                          title: 'Bước 2: Thêm hình dáng & màu sắc',
                          hint: studioConfig?.practiceWorkflow?.steps?.[1]?.quickPrompt
                            ? `💡 Thêm: "${studioConfig.practiceWorkflow.steps[1].quickPrompt}"`
                            : 'Thêm dáng & màu',
                        },
                        {
                          step: 3,
                          title: 'Bước 3: Hoàn thiện câu lệnh 5 chi tiết vàng',
                          hint: studioConfig?.practiceWorkflow?.steps?.[2]?.quickPrompt
                            ? `💡 5 chi tiết: "${studioConfig.practiceWorkflow.steps[2].quickPrompt}"`
                            : 'Đủ 5 chi tiết vàng',
                        },
                        {
                          step: 4,
                          title: 'Bước 4: Soi kỹ tranh & nộp vào Balo',
                          hint: '🔍 Soi kỹ và cất Balo',
                        },
                      ].map((s) => (
                        <div
                          key={s.step}
                          className="p-2 rounded-xl bg-white/90 border border-indigo-100 flex items-start gap-2 shadow-2xs"
                        >
                          <span className="size-5 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {s.step}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-800 leading-tight">
                              {s.title}
                            </div>
                            <div className="text-[10px] text-indigo-700 font-semibold mt-0.5 truncate">
                              {s.hint}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mẹo vàng của AKI */}
                  <div className="bg-amber-50/90 rounded-2xl p-3.5 border border-amber-200 flex flex-col gap-1.5 text-left">
                    <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span>💡</span>
                      <span>MẸO VÀNG CỦA AKI</span>
                    </div>
                    <p className="text-xs text-amber-900 font-bold leading-relaxed">
                      {journey.stage5_practice.akiMotto ||
                        studioConfig?.akiMotto ||
                        'Tả càng rõ, tranh càng đúng ý! Hãy miêu tả đủ chi tiết để AKI vẽ chuẩn nhé.'}
                    </p>
                  </div>

                  {/* Mật mã đặc điểm vàng */}
                  {studioConfig?.lockedFeatures && studioConfig.lockedFeatures.length > 0 && (
                    <div className="bg-purple-50/80 rounded-2xl p-3 border border-purple-200 flex flex-col gap-1.5 text-left">
                      <div className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                        <span>🔑</span>
                        <span>Mật mã đặc điểm vàng:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {studioConfig.lockedFeatures.map((feat, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-bold text-purple-900 bg-white px-2 py-0.5 rounded-lg border border-purple-200 shadow-2xs"
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nút xem lại bài giảng */}
                  <Button
                    variant="secondary"
                    className="w-full py-2 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    onClick={() => handleStageSelect(2)}
                  >
                    <RotateCcw size={13} className="text-slate-500" />
                    <span>↺ Tua lại video</span>
                    <span className="text-[10px] text-slate-400 font-normal">↺ Xem lại video bài giảng</span>
                  </Button>
                </div>
              ) : (
                <>
                  {/* CHẶNG 0: Bảng Tra Cứu Công Thức 4 Ô Mật Mã + Lời dặn AKI */}
                  {currentStage === 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-gradient-to-b from-blue-50/70 to-indigo-50/70 rounded-2xl p-3.5 border-2 border-indigo-200 shadow-2xs flex flex-col gap-2.5 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                            <span>🔍</span>
                            <span>Công Thức 4 Ô Mật Mã</span>
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            Bí Kíp Vàng
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                          Ghi nhớ 4 ô mật mã này để bức tranh không bao giờ bị AI đoán mò nhé:
                        </p>

                        <div className="flex flex-col gap-2">
                          {formulaCards.map((card) => (
                            <div
                              key={card.id}
                              className={cn(
                                'p-2.5 rounded-xl border shadow-2xs flex items-start gap-2.5 transition-all',
                                card.bg
                              )}
                            >
                              <span className="text-base shrink-0 leading-none mt-0.5">{card.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-md', card.badge)}>
                                    {card.code}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-bold">({card.sub})</span>
                                </div>
                                <p className="text-xs font-bold text-slate-800 mt-1 leading-snug">
                                  {card.val}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-700">
                          🎯 Nhiệm vụ chặng này:
                        </p>
                        <p className="text-xs text-slate-600 font-medium">
                          {getStageInstruction(0)}
                        </p>
                        <div className="mt-1">
                          {renderSidebarAction(0)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CHẶNG 1: Bảng Gợi Ý Mật Mã (Cheat-sheet) + Cố vấn AKI */}
                  {currentStage === 1 && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-gradient-to-b from-amber-50/80 to-yellow-50/60 rounded-2xl p-3.5 border-2 border-amber-200 shadow-2xs flex flex-col gap-2.5 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                            <span>💡</span>
                            <span>Bảng Gợi Ý Mật Mã</span>
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                            Cheat-sheet
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-900/80 font-medium">
                          Tra cứu nhanh 4 ô chìa khóa nếu bé chưa chắc chắn:
                        </p>

                        <div className="grid grid-cols-2 gap-1.5">
                          {formulaCards.map((card) => (
                            <div
                              key={card.id}
                              className="p-2 rounded-xl bg-white/90 border border-amber-200 flex items-start gap-1.5 shadow-2xs"
                            >
                              <span className="text-xs shrink-0">{card.icon}</span>
                              <div className="min-w-0">
                                <span className="text-[10px] font-black text-slate-800 block truncate">
                                  {card.code}
                                </span>
                                <span className="text-[9px] text-slate-500 font-semibold block truncate">
                                  {card.sub}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedConfirmOption !== null && (
                        <div
                          className={cn(
                            'rounded-2xl p-3.5 border flex flex-col gap-2 transition-all text-left shadow-2xs',
                            isConfirmCorrect
                              ? 'bg-mint-50/90 border-mint-200 text-mint-950'
                              : 'bg-rose-50/90 border-rose-200 text-rose-950'
                          )}
                        >
                          <div className="flex items-center justify-between text-xs font-black">
                            <span className="flex items-center gap-1.5">
                              <span>{isConfirmCorrect ? '🎉' : '🧐'}</span>
                              <span>
                                {isConfirmCorrect
                                  ? 'AKI GIẢI THÍCH CHUẨN XÁC'
                                  : 'AKI GỢI Ý CHO BÉ'}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                speakCurrentStage(
                                  isConfirmCorrect
                                    ? journey.stage2_confirmGoal.explanation
                                    : 'Chưa chuẩn rồi! Bé hãy đọc câu hỏi và liếc sang Bảng Gợi Ý Mật Mã ở trên để chọn lại nhé!'
                                )
                              }
                              className="text-[11px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                            >
                              <Volume2 size={12} />
                              Nghe
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed font-medium">
                            {isConfirmCorrect
                              ? journey.stage2_confirmGoal.explanation
                              : 'Chưa chuẩn rồi! Bé hãy đọc câu hỏi và liếc sang Bảng Gợi Ý Mật Mã ở trên để chọn lại nhé!'}
                          </p>
                        </div>
                      )}

                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-700">
                          🎯 Nhiệm vụ chặng này:
                        </p>
                        <p className="text-xs text-slate-600 font-medium">
                          {getStageInstruction(1)}
                        </p>
                        <div className="mt-1">
                          {renderSidebarAction(1)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CHẶNG 2: Danh Sách 6 Mốc Phân Đoạn (Interactive Chapters) + Quy Tắc Cốt Lõi */}
                  {currentStage === 2 && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-purple-50/70 rounded-2xl p-3.5 border-2 border-purple-200 shadow-2xs flex flex-col gap-2.5 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                            <Video size={14} className="text-purple-600" />
                            <span>Mốc Phân Đoạn Video</span>
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            {videoChapters.length} Mốc
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-900/80 font-medium">
                          Bấm vào mốc phân đoạn để Video tua ngay đến đoạn đó:
                        </p>

                        <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto hidden-scrollbar pr-0.5">
                          {videoChapters.map((ts, idx) => {
                            const isSelected = videoSeekSec === ts.startSec
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSeekVideo(ts.startSec)}
                                className={cn(
                                  'w-full p-2.5 rounded-xl border flex items-center justify-between gap-2 text-left transition-all cursor-pointer group shadow-2xs hover:shadow-xs',
                                  isSelected
                                    ? 'bg-purple-600 text-white border-purple-700 font-black'
                                    : 'bg-white hover:bg-purple-100/70 border-purple-200/80 text-slate-700'
                                )}
                                title={`Tua đến ${Math.floor(ts.startSec / 60)}:${String(ts.startSec % 60).padStart(2, '0')}`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={cn(
                                      'size-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0',
                                      isSelected ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                                    )}
                                  >
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs truncate font-bold">{ts.label}</span>
                                </div>
                                <span
                                  className={cn(
                                    'text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 shadow-2xs',
                                    isSelected ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700 border border-purple-200'
                                  )}
                                >
                                  {Math.floor(ts.startSec / 60)}:{String(ts.startSec % 60).padStart(2, '0')}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200 flex flex-col gap-1.5 text-left shadow-2xs">
                        <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                          <span>🔑</span>
                          <span>QUY TẮC CỐT LÕI CỦA VIDEO</span>
                        </div>
                        <p className="text-xs text-amber-900 font-bold leading-relaxed">
                          Tả càng rõ, tranh càng đúng ý! Nhớ quan sát kỹ cách thầy AKI ghép các từ khóa thành một câu lệnh hoàn chỉnh nhé.
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-700">
                          🎯 Nhiệm vụ chặng này:
                        </p>
                        <p className="text-xs text-slate-600 font-medium">
                          {getStageInstruction(2)}
                        </p>
                        <div className="mt-1">
                          {renderSidebarAction(2)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CHẶNG 3: Bảng Điểm Trực Tiếp + Góc Cố Vấn AKI */}
                  {currentStage === 3 && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-blue-50/70 rounded-2xl p-3.5 border-2 border-blue-200 shadow-2xs flex flex-col gap-2.5 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                            <FileQuestion size={14} className="text-blue-600" />
                            <span>Bảng Điểm Trực Tiếp</span>
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            Đạt {journey.stage4_quiz.passScore} câu để mở Xưởng
                          </span>
                        </div>

                        {quizSubmitted ? (
                          <div className="p-3 rounded-xl bg-white border border-blue-200 flex flex-col items-center gap-2 text-center shadow-2xs">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  size={20}
                                  className={cn(
                                    s <= quizStars ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                                  )}
                                />
                              ))}
                            </div>
                            <div className="text-sm font-black text-blue-950">
                              ✓ Đã đúng {quizScore}/{journey.stage4_quiz.passScore} câu để mở Xưởng!
                            </div>
                            <p className="text-xs text-slate-600">
                              Tổng điểm: {quizScore}/{journey.stage4_quiz.questions.length} câu đúng.
                            </p>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-white border border-blue-100 flex flex-col gap-1.5 shadow-2xs">
                            <div className="flex justify-between text-xs font-bold text-slate-700">
                              <span>Đã chọn:</span>
                              <span className="text-blue-600 font-black">
                                {Object.keys(quizAnswers).length}/{journey.stage4_quiz.questions.length} câu
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                style={{
                                  width: `${(Object.keys(quizAnswers).length / journey.stage4_quiz.questions.length) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-[11px] text-slate-500 text-center font-medium">
                              Cần đạt ít nhất {journey.stage4_quiz.passScore} câu đúng để mở xưởng vẽ!
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200 flex flex-col gap-2 text-left shadow-2xs">
                        <div className="flex items-center justify-between text-xs font-black text-amber-950">
                          <span className="flex items-center gap-1.5">
                            <span>🧐</span>
                            <span>GÓC CỐ VẤN AKI</span>
                          </span>
                          {quizSubmitted && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                              {quizScore >= journey.stage4_quiz.passScore ? 'ĐÃ ĐẠT CHUẨN' : 'CẦN ÔN LẠI'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                          {quizSubmitted
                            ? quizScore >= journey.stage4_quiz.passScore
                              ? 'Xuất sắc! Giám khảo AKI xác nhận bé đã nắm chắc bài học. Cánh cửa Xưởng Sáng Tạo AI đã mở toang chào đón bé!'
                              : 'Chưa đủ điểm mở Xưởng rồi! Bé hãy xem lại video bài giảng và thử sức lại nhé!'
                            : 'Bé hãy đọc kỹ câu hỏi và hình minh họa ở cột bên trái. Hãy tự tin chọn đáp án chuẩn xác nhất!'}
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-700">
                          🎯 Nhiệm vụ chặng này:
                        </p>
                        <p className="text-xs text-slate-600 font-medium">
                          {getStageInstruction(3)}
                        </p>
                        <div className="mt-1">
                          {renderSidebarAction(3)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CHẶNG 5: Bảng Tổng Kết Phần Thưởng + Home Mission + Teaser Bài Sau */}
                  {currentStage === 5 && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-gradient-to-b from-amber-50 to-yellow-50/60 rounded-2xl p-3.5 border-2 border-amber-300 shadow-2xs flex flex-col gap-2.5 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                            <Trophy size={14} className="text-amber-600" />
                            <span>Tổng Kết Phần Thưởng</span>
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                            Tốt Nghiệp
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 flex items-center gap-2 shadow-2xs">
                            <span className="text-lg">⭐</span>
                            <div>
                              <span className="text-xs font-black text-amber-900 block">+3 Sao</span>
                              <span className="text-[10px] text-slate-500 font-semibold">Tích lũy</span>
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 flex items-center gap-2 shadow-2xs">
                            <span className="text-lg">🪙</span>
                            <div>
                              <span className="text-xs font-black text-amber-900 block">+5 Xu</span>
                              <span className="text-[10px] text-slate-500 font-semibold">Thần kỳ</span>
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 flex items-center gap-2 shadow-2xs">
                            <span className="text-lg">⚡</span>
                            <div>
                              <span className="text-xs font-black text-amber-900 block">+50 XP</span>
                              <span className="text-[10px] text-slate-500 font-semibold">Kinh nghiệm</span>
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 flex items-center gap-2 shadow-2xs">
                            <span className="text-lg">🏅</span>
                            <div className="min-w-0">
                              <span className="text-xs font-black text-amber-900 block truncate">
                                {journey.stage6_completion.rewardBadge.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-semibold">Huy hiệu vàng</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 🏠 Việc Ngoài Màn Hình (Home Mission) */}
                      <div className="bg-emerald-50/80 rounded-2xl p-3.5 border-2 border-emerald-200 flex flex-col gap-2 text-left shadow-2xs">
                        <div className="flex items-center justify-between text-xs font-black text-emerald-950">
                          <span className="flex items-center gap-1.5">
                            <span>🏠</span>
                            <span>Việc Ngoài Màn Hình (Home Mission)</span>
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                            Nhiệm Vụ
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium">
                          Lời dặn AKI: &ldquo;Bé hãy đem tranh khoe với bố mẹ ngay bây giờ, đố bố mẹ đoán xem bé đã vẽ gì nhé!&rdquo;
                        </p>
                      </div>

                      {/* 🔮 Teaser Bài Sau */}
                      {journey.stage6_completion.nextLessonSlug && (
                        <div className="bg-indigo-50/80 rounded-2xl p-3.5 border border-indigo-200 flex flex-col gap-1.5 text-left shadow-2xs">
                          <div className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                            <span>🔮</span>
                            <span>TEASER BÀI HỌC TIẾP THEO</span>
                          </div>
                          <p className="text-xs text-indigo-900 font-bold leading-relaxed">
                            Chủ đề tiếp theo: {journey.stage6_completion.nextLessonSlug.replace(/[-_]/g, ' ')}
                          </p>
                          <span className="text-[11px] text-slate-500">
                            Nhiều điều bí ẩn và công thức thần kỳ mới đang chờ đón bé khám phá!
                          </span>
                        </div>
                      )}

                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-700">
                          🎯 Hành động tiếp theo:
                        </p>
                        <div className="mt-1">
                          {renderSidebarAction(5)}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

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
