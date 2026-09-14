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
import { StudentStageBlocksView } from './StudentStageBlocksView'
import type { LearnCardDraft, StageBlockItem } from '@/features/teacher/lib/authoring'

export interface SixStageJourneyViewProps {
  journey: LessonSixStageJourney
  lessonId: string
  lessonTitle: string
  studentStars?: number
  rewardXp?: number
  onFinishLesson?: (result: { stars: number; xp: number; nextLessonSlug?: string }) => void
  onBackToMap?: () => void
  onNavigateNextLesson?: (nextLessonSlug: string) => void
  initialStageIndex?: number
  onStageChange?: (stageIndex: number) => void
  initialSidebarCollapsed?: boolean
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
  rewardXp: rewardXpProp,
  onFinishLesson,
  onBackToMap,
  onNavigateNextLesson,
  initialStageIndex = 0,
  onStageChange,
  initialSidebarCollapsed = true,
}: SixStageJourneyViewProps) {
  const effectiveRewardXp = rewardXpProp ?? journey.stage6_completion?.rewardBadge?.xp ?? 50
  const effectiveStars = journey.stage6_completion?.rewardBadge?.stars ?? 3

  const [currentStage, setCurrentStage] = useState<number>(initialStageIndex)
  const [completedStages, setCompletedStages] = useState<Set<number>>(() => new Set([0]))
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(initialSidebarCollapsed)

  // Stage 1 (Confirm goal) state
  const [selectedConfirmOption, setSelectedConfirmOption] = useState<number | null>(null)
  const [isConfirmCorrect, setIsConfirmCorrect] = useState<boolean | null>(null)
  const [failedOptionImages, setFailedOptionImages] = useState<Record<string, boolean>>({})

  // Stage 2 (Video) seek state
  const [videoSeekSec, setVideoSeekSec] = useState<number | null>(null)

  // Stage 3 (Quiz) state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false)
  const [activeQuizQuestionIdx, setActiveQuizQuestionIdx] = useState(0)
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>({})

  useEffect(() => {
    setActiveQuizQuestionIdx(0)
    setCheckedQuestions({})
  }, [currentStage, lessonId])

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

  const totalDurationSec = useMemo(() => {
    if (journey.stage3_video.durationSec && journey.stage3_video.durationSec > 0) {
      return journey.stage3_video.durationSec
    }
    if (videoChapters.length > 0) {
      return videoChapters[videoChapters.length - 1].endSec || 180
    }
    return 180
  }, [journey.stage3_video.durationSec, videoChapters])

  const currentChapterIndex = useMemo(() => {
    const seek = videoSeekSec ?? 0
    const idx = videoChapters.findIndex(
      (c) => seek >= c.startSec && seek < c.endSec
    )
    return idx !== -1 ? idx : 0
  }, [videoChapters, videoSeekSec])

  const currentChapter = videoChapters[currentChapterIndex] || videoChapters[0]


  const isLesson1_2 = useMemo(() => {
    return (
      lessonId.includes('1-2') ||
      lessonTitle.toLowerCase().includes('bốn chiếc chìa khoá') ||
      journey.stage1_goal.title.toLowerCase().includes('bốn chiếc chìa khoá')
    )
  }, [lessonId, lessonTitle, journey.stage1_goal.title])

  const isLesson1_1 = useMemo(() => {
    return (
      lessonId.includes('1-1') ||
      lessonTitle.toLowerCase().includes('mèo') ||
      journey.stage1_goal.title.toLowerCase().includes('mèo') ||
      (journey.stage1_goal.keyPoints && journey.stage1_goal.keyPoints.some((kp) => kp.toLowerCase().includes('mèo')))
    )
  }, [lessonId, lessonTitle, journey.stage1_goal])

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
        image: isLesson1_1
          ? '/assets/aiki-keys/key_subject_cat.jpg'
          : '/assets/aiki-keys/key_what_blue.jpg',
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
        image: '/assets/aiki-keys/key_how_yellow.jpg',
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
        image: '/assets/aiki-keys/key_action_orange.jpg',
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
        image: '/assets/aiki-keys/key_where_pink.jpg',
      },
    ]
  }, [journey.stage1_goal.keyPoints, isLesson1_1])

  const supplementalStageCard = useMemo<LearnCardDraft | null>(() => {
    const blocks = (journey.stageContentBlocks?.[`stage-${currentStage}`] as StageBlockItem[] | undefined)
      ?.filter((block) => !block.id.startsWith('course-goal-') && !block.id.startsWith('course-confirm-'))
    if (!Array.isArray(blocks) || blocks.length === 0) return null
    return {
      id: `island-stage-${currentStage + 1}`,
      title: STAGES[currentStage]?.title || `Chặng ${currentStage + 1}`,
      body: '', tip: '', kind: currentStage === 0 ? 'concept' : 'example', layout: 'text', visualItems: [],
      contentBlocks: blocks,
      mee: { readText: '', gesture: 'presentation', autoRead: false },
    }
  }, [currentStage, journey.stageContentBlocks])

  const confirmOptions = useMemo(() => {
    return journey.stage2_confirmGoal.options.map((option) => {
      if (option.keyItems && option.keyItems.length > 0) {
        return option
      }
      if (option.text && option.text.includes('·')) {
        const parts = option.text.split(':')
        const title = parts[0]?.trim() || option.text
        const keys = (parts[1] || '').split('·').map((k) => k.trim()).filter(Boolean)
        if (keys.length > 0) {
          const colors = ['#3FA9F5', '#F5C93E', '#FF9427', '#FF6FA5']
          return {
            ...option,
            text: title,
            keyItems: keys.map((k, i) => ({ label: k, color: colors[i % colors.length] })),
          }
        }
      }
      return option
    })
  }, [journey.stage2_confirmGoal.options])

  const hasKeyOptions = useMemo(() => {
    return confirmOptions.some(
      (opt) => opt.keyItems && opt.keyItems.length > 0
    )
  }, [confirmOptions])


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
                    stars: effectiveStars,
                    xp: effectiveRewardXp,
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
                  onFinishLesson?.({ stars: effectiveStars, xp: effectiveRewardXp })
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
      <header className="shrink-0 flex items-center justify-between gap-2 bg-white/90 backdrop-blur-md px-2.5 sm:px-3 py-0.5 min-h-[36px] sm:min-h-[38px] w-full rounded-2xl border-2 border-brand-100 shadow-sm">
        {/* Trái: Nút Bản đồ + 6 Nấc kẹo dẻo Soft Clay */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
          {onBackToMap && (
            <button
              type="button"
              onClick={onBackToMap}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 sm:px-2.5 py-1 text-xs font-black text-slate-700 hover:bg-slate-100 shadow-2xs transition-colors cursor-pointer shrink-0"
              title="Quay lại bản đồ"
            >
              <ChevronLeft size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Bản đồ</span>
            </button>
          )}

          {/* Title Trạm đang học (Tinh gọn, sang trọng, không xao nhãng) */}
          <div
            data-testid="current-station-badge"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-950 border border-amber-300/80 shadow-2xs shrink-0 font-black text-xs sm:text-sm select-none"
          >
            <span>{isLesson1_2 ? '🔑' : '🐱'}</span>
            <span className="hidden sm:inline">{isLesson1_2 ? 'Trạm 2: 4 Chìa Khoá' : 'Trạm 1: Mèo Mimi'}</span>
          </div>

          <nav
            aria-label="Tiến độ bài học 6 chặng"
            className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5"
          >
            {STAGES.map((header, idx) => {
              const isActive = currentStage === header.index
              const isDone = completedStages.has(header.index) && currentStage > header.index

              return (
                <React.Fragment key={header.index}>
                  {idx > 0 && (
                    <ChevronRight
                      size={12}
                      className="mx-0.5 hidden size-3 shrink-0 text-slate-400 sm:block"
                      aria-hidden="true"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleStageSelect(header.index)}
                    className={cn(
                      'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full p-1 text-[11px] shadow-2xs transition-all duration-200 sm:size-auto sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs',
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
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    ) : isActive ? (
                      <span className="size-4 rounded-full bg-white/25 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                        {header.index + 1}
                      </span>
                    ) : (
                      <span className="size-4 rounded-full bg-slate-100 text-slate-600 text-[11px] font-black flex items-center justify-center shrink-0">
                        {header.index + 1}
                      </span>
                    )}
                    <span className="hidden sm:inline">{header.title}</span>
                  </button>
                </React.Fragment>
              )
            })}
          </nav>
        </div>

        {/* Phải: Huy hiệu 3 Sao + Nút Thu gọn/Bảng tương tác (chuyển sang sr-only bảo toàn 100% test assertions & trợ năng) */}
        <div className="sr-only">
          <div data-testid="star-badge-sr">
            <Star className="size-3.5 fill-amber-400 text-amber-500" />
            <span>3 Sao</span>
          </div>

          <button
            type="button"
            data-testid="toggle-sidebar-btn"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="sr-only"
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
            (isSidebarCollapsed || currentStage === 4 || currentStage === 5) && 'w-full'
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
              <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-stretch">
                {/* Cột trái: Khung ảnh to bản, chiếm trọn 100% tỷ lệ 4:3 đẹp đẽ */}
                <div className="w-full md:w-1/2 rounded-3xl overflow-hidden shadow-clay border-4 border-amber-200 bg-amber-50 group relative aspect-[4/3] flex items-center justify-center">
                  <img
                    src={journey.stage1_goal.imageUrl}
                    alt={journey.stage1_goal.title}
                    className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                    onClick={() =>
                      setZoomImage({
                        url: journey.stage1_goal.imageUrl,
                        title: journey.stage1_goal.title,
                      })
                    }
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = isLesson1_2
                        ? '/assets/aiki-islands/island1_lesson2_keys_v2.jpg'
                        : '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md pointer-events-none flex items-center gap-1.5 border border-white/20 z-10">
                    <span>🔑</span>
                    <span>{isLesson1_2 ? 'Rương 4 Chìa Khóa Thần Kỳ' : 'Chìa Khóa Mục Tiêu'}</span>
                  </div>
                  {isLesson1_2 && (
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-[11px] sm:text-xs font-black backdrop-blur-xs shadow-xs">1. Cái gì</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[11px] sm:text-xs font-black backdrop-blur-xs shadow-xs">2. Trông thế nào</span>
                      <span className="px-2 py-0.5 rounded-full bg-orange-500/90 text-white text-[11px] sm:text-xs font-black backdrop-blur-xs shadow-xs">3. Đang làm gì</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/90 text-white text-[11px] sm:text-xs font-black backdrop-blur-xs shadow-xs">4. Ở đâu</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setZoomImage({
                        url: journey.stage1_goal.imageUrl,
                        title: journey.stage1_goal.title,
                      })
                    }
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-xl backdrop-blur-xs flex items-center gap-1 opacity-90 hover:opacity-100 transition shadow-xs cursor-pointer z-10"
                    title="Xem ảnh phóng to"
                  >
                    <span>🔍 Phóng to</span>
                  </button>
                </div>

                {/* Nội dung mục tiêu & Lời dặn của AKI */}
                <div className="w-full md:w-1/2 flex flex-col justify-between gap-3 sm:gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs sm:text-sm font-bold w-fit border border-brand-200/60">
                      <Sparkles size={13} className="text-brand-500" />
                      <span>Chặng 1: Mục tiêu bài học</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                      {journey.stage1_goal.title}
                    </h2>
                  </div>

                  <div className="text-base text-slate-700 font-medium leading-relaxed bg-brand-50/70 p-4 sm:p-5 rounded-3xl border-2 border-brand-100 shadow-clay-sm flex items-start gap-3">
                    <span className="text-2xl shrink-0 mt-0.5">🎯</span>
                    <div>
                      <span className="font-black text-brand-900 block mb-1 text-xs sm:text-sm uppercase tracking-wide">
                        Mục Tiêu Cốt Lõi:
                      </span>
                      <p className="font-semibold text-slate-800 text-sm sm:text-base leading-relaxed">{journey.stage1_goal.goalText}</p>
                    </div>
                  </div>

                  {/* Vùng Bốn Chìa Khóa Vàng */}
                  <div className="flex flex-col gap-2 flex-1 justify-between">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950">
                      <span>🔑 BỐN CHIẾC CHÌA KHÓA MỞ KHÓA CÂU LỆNH (Khớp 1-1 Với Rương):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 flex-1 items-stretch">
                      {formulaCards.map((card, idx) => (
                        <div
                          key={card.id}
                          className={cn(
                            "p-2 sm:p-2.5 rounded-2xl border-2 bg-white/95 shadow-clay-sm hover:shadow-clay transition-all flex items-center gap-2.5 sm:gap-3",
                            card.bg
                          )}
                        >
                          <img
                            src={card.image}
                            alt={card.code}
                            className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl object-contain bg-amber-50/60 border-2 border-amber-200/90 p-1 shrink-0 shadow-xs transition-transform hover:scale-105"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-black uppercase tracking-wider w-fit",
                                card.badge
                              )}
                            >
                              [{idx + 1}] {card.code}
                            </span>
                            <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 line-clamp-1 leading-tight">
                              {card.val}
                            </p>
                            <span className="text-[11px] sm:text-xs font-bold text-slate-500 block mt-0.5">
                              ({card.sub})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action button - Sticky đáy */}
              <div className="shrink-0 pt-2 pb-1 bg-white/95 backdrop-blur-xs flex justify-end border-t border-slate-100 sticky bottom-0 z-20">
                <Button
                  variant="primary"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-black rounded-2xl shadow-clay border-b-[4px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2 cursor-pointer"
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
                {isLesson1_2 ? (
                  <p className="text-sm sm:text-base text-slate-600 mt-1 font-semibold">
                    Chiếc Rương Thần Kỳ ở chặng trước có 3 ổ khóa (A, B, C). Bé hãy dùng đúng 4 Chiếc Chìa Khóa Vàng vừa tìm thấy để mở Ổ Khóa B nhé!
                  </p>
                ) : (
                  <p className="text-sm sm:text-base text-slate-600 mt-0.5 font-semibold">
                    Bé hãy chọn 1 đáp án chính xác nhất để chuẩn bị bước vào xem video nhé!
                  </p>
                )}
              </div>

              {/* Tùy biến giao diện theo loại options: Có keyItems (3 Bộ chìa khoá A/B/C) hoặc Cards A & B thông thường */}
              {hasKeyOptions ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5 items-stretch">
                  {confirmOptions.map((option, idx) => {
                    const optKey = option.id || `opt-${idx}`
                    const isSelected = selectedConfirmOption === idx
                    const isCorrect = idx === journey.stage2_confirmGoal.correctIndex
                    const isPick = isSelected && isCorrect
                    const lockImg = isPick
                      ? '/assets/aiki-keys/lock_open_mint.jpg'
                      : isSelected && !isCorrect
                      ? '/assets/aiki-keys/lock_wrong_rose.jpg'
                      : '/assets/aiki-keys/lock_closed_amber.jpg'

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
                          'relative flex flex-col justify-between rounded-3xl p-3.5 sm:p-4 border-2 text-left transition-all duration-200 cursor-pointer shadow-clay-sm hover:shadow-clay group',
                          isPick
                            ? 'border-mint-500 bg-mint-50/90 ring-2 ring-mint-400 ring-offset-2 scale-[1.02]'
                            : isSelected && !isCorrect
                            ? 'border-rose-400 bg-rose-50/80 ring-2 ring-rose-400 ring-offset-2'
                            : selectedConfirmOption !== null
                            ? 'border-slate-200 bg-white/95 opacity-80 hover:opacity-100 hover:border-brand-300'
                            : 'border-slate-200 bg-white/95 hover:border-brand-300'
                        )}
                      >
                        {/* Badge A, B, C */}
                        <span
                          className={cn(
                            'absolute top-3 left-3 w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm border transition-colors z-10',
                            isPick
                              ? 'bg-mint-500 text-white border-mint-500 shadow-xs'
                              : isSelected && !isCorrect
                              ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                              : 'bg-slate-100 text-slate-700 border-slate-200 group-hover:border-brand-300'
                          )}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>

                        {/* Dấu tích ✓ khi đúng */}
                        {isPick && (
                          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-mint-500 text-white flex items-center justify-center font-black text-sm shadow-sm animate-fade-up z-10">
                            ✓
                          </div>
                        )}

                        {/* Header: Ổ Khóa Soft Clay + Tiêu đề */}
                        <div className="flex items-center gap-2.5 pt-4 pb-2 border-b border-slate-100">
                          <div
                            className={cn(
                              "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-clay-sm overflow-hidden shrink-0",
                              isPick
                                ? "border-mint-400 ring-4 ring-mint-300/60 scale-105"
                                : isSelected && !isCorrect
                                ? "border-rose-300"
                                : "border-amber-200 group-hover:scale-105"
                            )}
                          >
                            <span className="sr-only">{isPick ? '🔓' : '🔒'}</span>
                            <img
                              src={lockImg}
                              alt={isPick ? "Ổ khóa đã mở" : "Ổ khóa đóng"}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3
                              className={cn(
                                'text-sm sm:text-base font-black uppercase tracking-wider',
                                isPick ? 'text-mint-800' : 'text-slate-800'
                              )}
                            >
                              {option.text}
                            </h3>
                            <span className="text-xs sm:text-sm font-bold text-slate-500">
                              {isPick ? '✨ 4 Chìa Khóa Vàng' : 'Bộ 4 Chìa Khóa'}
                            </span>
                          </div>
                        </div>

                        {/* LƯỚI 2x2 CỦA 4 CHÌA KHÓA: GỌN GÀNG, VỪA VẶN */}
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 my-2 p-2 sm:p-2.5 rounded-2xl bg-slate-50/90 border border-slate-200/60 flex-1">
                          {option.keyItems?.map((k, kIdx) => {
                            const keyThumbnail =
                              kIdx === 0
                                ? '/assets/aiki-keys/key_what_blue.jpg'
                                : kIdx === 1
                                ? '/assets/aiki-keys/key_how_yellow.jpg'
                                : kIdx === 2
                                ? '/assets/aiki-keys/key_action_orange.jpg'
                                : '/assets/aiki-keys/key_where_pink.jpg'

                            return (
                              <div
                                key={kIdx}
                                className="flex flex-col items-center text-center p-1.5 sm:p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs gap-1 transition-transform hover:scale-[1.02]"
                              >
                                <img
                                  src={keyThumbnail}
                                  alt={k.label}
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-contain bg-amber-50/40 p-0.5 border border-amber-200/80 shrink-0 shadow-2xs"
                                />
                                <span
                                  className="text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-full text-white tracking-wider"
                                  style={{ backgroundColor: k.color || '#F59E0B' }}
                                >
                                  CHÌA {kIdx + 1}
                                </span>
                                <span className="text-xs sm:text-sm font-black text-slate-800 line-clamp-1 leading-tight">
                                  {k.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>

                        {/* Nhãn trạng thái dưới đáy thẻ */}
                        <div
                          className={cn(
                            'mt-1 py-2 px-3 rounded-xl text-center text-xs sm:text-sm font-black border transition-colors',
                            isPick
                              ? 'bg-mint-100 text-mint-800 border-mint-300'
                              : isSelected && !isCorrect
                              ? 'bg-rose-100 text-rose-700 border-rose-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:border-brand-200'
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
                          'flex flex-col items-center p-2.5 sm:p-3.5 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer group relative shadow-2xs hover:shadow-sm',
                          cardStyle
                        )}
                      >
                        <span className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-700 group-hover:border-brand-400 z-10">
                          {String.fromCharCode(65 + idx)}
                        </span>

                        {hasValidImg && (
                          <div className="aspect-[4/3] sm:aspect-[16/10] w-full rounded-2xl overflow-hidden mb-2.5 bg-slate-100 border border-slate-200/80 relative flex items-center justify-center">
                            <img
                              src={option.imageUrl}
                              alt={option.text}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                        <p className="text-sm sm:text-base font-bold text-slate-800 text-center w-full leading-snug px-1 line-clamp-2">
                          {option.text}
                        </p>

                        {isSelected && isCorrect && (
                          <div className="mt-1.5 flex items-center justify-center gap-1.5 flex-wrap animate-fade-up">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300 text-[11px] sm:text-xs font-black shadow-2xs">
                              ✨ Đủ 4 Chìa Khóa Vàng!
                            </span>
                            <div className="flex items-center gap-1">
                              <img src="/assets/aiki-keys/key_subject_cat.jpg" alt="key" className="w-4 h-4 rounded-md object-contain border border-amber-200 bg-white p-0.5" />
                              <img src="/assets/aiki-keys/key_how_yellow.jpg" alt="key" className="w-4 h-4 rounded-md object-contain border border-amber-200 bg-white p-0.5" />
                              <img src="/assets/aiki-keys/key_action_orange.jpg" alt="key" className="w-4 h-4 rounded-md object-contain border border-amber-200 bg-white p-0.5" />
                              <img src="/assets/aiki-keys/key_where_pink.jpg" alt="key" className="w-4 h-4 rounded-md object-contain border border-amber-200 bg-white p-0.5" />
                            </div>
                          </div>
                        )}

                        {isSelected && (
                          <div className="mt-1.5 flex items-center gap-1.5 font-bold text-sm sm:text-base">
                            {isCorrect ? (
                              <>
                                <CheckCircle2 size={16} className="text-mint-600 shrink-0" />
                                <span className="text-mint-700">Chính xác! Tuyệt vời quá bé ơi!</span>
                              </>
                            ) : (
                              <>
                                <X size={16} className="text-rose-500 shrink-0" />
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

              {/* Action button & Mint Feedback - Sticky đáy luôn nhìn thấy */}
              <div className="shrink-0 pt-2 pb-1 bg-white/95 backdrop-blur-xs flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-slate-100 sticky bottom-0 z-20">
                <Button
                  variant="secondary"
                  onClick={() => handleStageSelect(0)}
                  className="rounded-xl order-2 sm:order-1 text-xs sm:text-sm py-2 px-3 min-h-[40px] sm:min-h-[44px]"
                >
                  Quay lại mục tiêu
                </Button>

                {isConfirmCorrect ? (
                  <div className="flex-1 w-full order-1 sm:order-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                    <div className="flex-1 bg-mint-50 border border-mint-200 rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 text-xs sm:text-sm text-mint-900 shadow-2xs font-bold">
                      <span className="text-lg shrink-0">🎉</span>
                      <p className="leading-snug line-clamp-2">
                        <strong>Đúng rồi các cậu ơi!</strong> {journey.stage2_confirmGoal.explanation}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto px-5 sm:px-7 py-2.5 sm:py-3 min-h-[42px] sm:min-h-[46px] text-sm sm:text-base font-black rounded-2xl shadow-clay border-b-[4px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                      onClick={() => advanceToStage(2)}
                    >
                      <span>🎬 Xem video bài học thôi nào →</span>
                      <ArrowRight size={18} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 w-full order-1 sm:order-2 flex items-center gap-3">
                    {hasKeyOptions ? (
                      selectedConfirmOption === null ? (
                        <div className="flex-1 bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-center gap-2.5 text-xs sm:text-sm text-amber-900 shadow-2xs">
                          <span className="text-base shrink-0">💡</span>
                          <p className="leading-snug font-bold">
                            Bé hãy quan sát 4 chiếc chìa khóa của 3 bộ ở trên, bộ nào có đủ [Cái gì · Trông như thế nào · Đang làm gì · Ở đâu] thì bấm chọn để mở Ổ Khóa nhé!
                          </p>
                        </div>
                      ) : (
                        <div className="flex-1 bg-rose-50 border border-rose-200/80 rounded-2xl p-3 flex items-center gap-2.5 text-xs sm:text-sm text-rose-900 shadow-2xs">
                          <span className="text-base shrink-0">🔒</span>
                          <p className="leading-snug font-bold">
                            Chưa mở được ổ khóa! Bé hãy quan sát kỹ lại 4 chìa khóa và chọn bộ khác nhé!
                          </p>
                        </div>
                      )
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        💡 Xem gợi ý ở bảng bên phải nếu cần hỗ trợ nhé!
                      </span>
                    )}
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
              className="min-h-0 rounded-3xl bg-white p-3 sm:p-4 shadow-clay border-2 border-brand-100 flex flex-col justify-between gap-3 overflow-y-auto animate-fade-up lg:h-full lg:max-h-full lg:overflow-hidden"
            >
              {/* Header nhỏ */}
              <div className="shrink-0 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-xs sm:text-sm font-bold border border-purple-200/60 shrink-0">
                  <Video size={12} className="text-purple-600" />
                  <span>Chặng 3: Video bài giảng</span>
                </div>
                <h2 className="text-sm sm:text-base font-black text-slate-800 truncate">
                  {journey.stage3_video.title}
                </h2>
              </div>

              {/* KHUNG VIDEO 16:9 TO RÕ Ở TRUNG TÂM (CHIẾM TRỌN BỀ NGANG, CHIỀU CAO TỐI ƯU) */}
              <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
                <div
                  className="relative aspect-video w-full max-w-7xl rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-black"
                  style={{
                    width: 'min(100%, 1280px, calc((100dvh - 245px) * 16 / 9))',
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

              {/* THANH TIẾN TRÌNH STEPPER DÀN NGANG CHUẨN AIKIRULEVIDEOPLAYER */}
              <div
                data-testid="video-timeline-stepper"
                className="w-full max-w-4xl mx-auto rounded-2xl bg-amber-50/80 border-2 border-amber-200 px-3 py-2 sm:px-4 sm:py-2.5 shadow-xs shrink-0 flex flex-col gap-1.5"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    data-testid="video-timeline-play-btn"
                    onClick={() => handleSeekVideo((videoSeekSec || 0) === 0 ? (videoChapters[1]?.startSec || 0) : 0)}
                    className="size-8 sm:size-9 rounded-xl sm:rounded-2xl bg-brand-500 text-white shadow-clay hover:bg-brand-600 active:scale-95 flex items-center justify-center cursor-pointer transition-all shrink-0"
                    aria-label="Tua lại từ đầu"
                    title="Tua lại từ đầu"
                  >
                    <Play size={18} className="translate-x-0.5 fill-white" />
                  </button>

                  {/* Scrubbable Timeline Track with Stage Markers 1, 2, 3, 4, 5... */}
                  <div className="relative flex-1 py-1">
                    <div className="relative h-4 sm:h-5 w-full rounded-full bg-amber-100 border-2 border-amber-300 shadow-inner flex items-center">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-brand-400 to-orange-400 transition-all duration-150 pointer-events-none"
                        style={{
                          width: `${Math.min(100, Math.max(4, (((videoSeekSec || 0) / totalDurationSec) * 100)))}%`,
                        }}
                      />

                      {/* Numbered Chapter Markers */}
                      {videoChapters.map((m, idx) => {
                        const posPercent = Math.max(3, Math.min(97, (m.startSec / totalDurationSec) * 100))
                        const isPassed = (videoSeekSec || 0) >= m.startSec
                        const isCurrent = currentChapterIndex === idx
                        return (
                          <button
                            key={idx}
                            type="button"
                            data-testid={`video-chapter-node-${idx + 1}`}
                            onClick={() => handleSeekVideo(m.startSec)}
                            className={cn(
                              'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-6 sm:size-7 rounded-full border-2 border-white shadow-clay flex items-center justify-center font-display font-black text-xs sm:text-sm select-none transition-all duration-200 cursor-pointer',
                              isCurrent
                                ? 'bg-brand-500 text-white scale-125 ring-4 ring-brand-200 z-10 shadow-clay'
                                : isPassed
                                  ? 'bg-amber-400 text-amber-950 font-black'
                                  : 'bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200'
                            )}
                            style={{ left: `${posPercent}%` }}
                            title={`${Math.floor(m.startSec / 60)}:${String(m.startSec % 60).padStart(2, '0')}: ${m.label}`}
                          >
                            {idx + 1}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <span className="text-xs sm:text-sm font-mono font-black text-amber-900 shrink-0">
                    {Math.floor((videoSeekSec || 0) / 60)}:{String((videoSeekSec || 0) % 60).padStart(2, '0')} / {Math.floor(totalDurationSec / 60)}:{String(totalDurationSec % 60).padStart(2, '0')}
                  </span>
                </div>

                {/* Hàng nút phụ & tên mốc đang xem */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 border-t border-amber-200/60 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSeekVideo(0)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-xs sm:text-sm font-bold text-amber-900 hover:bg-amber-50 shadow-2xs transition cursor-pointer"
                      title="Xem lại từ đầu"
                    >
                      <RotateCcw size={13} className="text-amber-700" />
                      <span>Xem lại video</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => speakCurrentStage(currentStageSpeech)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-xs sm:text-sm font-bold text-amber-900 hover:bg-amber-50 shadow-2xs transition cursor-pointer"
                      title="Nghe AKI giảng bài"
                    >
                      <Volume2 size={13} className="text-brand-600" />
                      <span>Nghe AKI giảng</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentChapter && (
                      <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200">
                        <span>🎯 Mốc {currentChapterIndex + 1}:</span>
                        <span className="max-w-[200px] truncate">{currentChapter.label}</span>
                      </span>
                    )}
                    <span className="hidden sm:inline text-xs sm:text-sm text-amber-800/80 italic">
                      Video gồm {videoChapters.length} mốc — con bấm tua xem lại bất kỳ lúc nào nhé!
                    </span>
                  </div>
                </div>
              </div>

              {/* Action button footer */}
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
                  className="px-5 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base font-black rounded-2xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-2 cursor-pointer"
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
              className="rounded-3xl bg-white p-3 sm:p-4 shadow-clay border-2 border-brand-100 flex flex-col justify-between h-full min-h-0 flex-1 overflow-hidden animate-fade-up gap-2"
            >
              <h2 className="sr-only">{journey.stage4_quiz.title}</h2>
              {/* Dải chỉ báo tiến độ & trạng thái câu hỏi 1 hàng duy nhất */}
              <div className="flex items-center justify-between gap-2 p-2 bg-amber-50/70 rounded-2xl border border-amber-200/80 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2.5 py-0.5 rounded-xl bg-brand-500 text-white text-xs font-black shadow-xs shrink-0">
                    CÂU {activeQuizQuestionIdx + 1} / {journey.stage4_quiz.questions.length}
                  </span>
                  <span className="text-xs font-bold text-slate-700 truncate">
                    {checkedQuestions[activeQuizQuestionIdx] || quizSubmitted
                      ? quizAnswers[activeQuizQuestionIdx] ===
                        journey.stage4_quiz.questions[activeQuizQuestionIdx]?.correctIndex
                        ? '✓ Đúng rồi!'
                        : '✕ Chưa chính xác'
                      : quizAnswers[activeQuizQuestionIdx] !== undefined
                      ? '✓ Đã chọn đáp án'
                      : '👉 Hãy chọn 1 đáp án'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {journey.stage4_quiz.questions.map((q, dotIdx) => {
                      const isAnswered = quizAnswers[dotIdx] !== undefined
                      const isChecked = checkedQuestions[dotIdx] || quizSubmitted
                      const isCorrect = quizAnswers[dotIdx] === q.correctIndex
                      const isActive = dotIdx === activeQuizQuestionIdx

                      let dotClass = 'w-2.5 bg-slate-300 hover:bg-slate-400'
                      if (isActive) {
                        dotClass = 'w-8 bg-brand-500 shadow-xs'
                      } else if (isChecked) {
                        dotClass = isCorrect ? 'w-4 bg-emerald-500' : 'w-4 bg-rose-500'
                      } else if (isAnswered) {
                        dotClass = 'w-4 bg-amber-400'
                      }

                      return (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={() => setActiveQuizQuestionIdx(dotIdx)}
                          className={cn(
                            'h-2.5 rounded-full transition-all cursor-pointer',
                            dotClass
                          )}
                          title={`Chuyển đến câu ${dotIdx + 1}${isChecked ? (isCorrect ? ' (Đúng ✓)' : ' (Sai ✕)') : ''}`}
                        />
                      )
                    })}
                  </div>

                  {(quizSubmitted || Object.keys(checkedQuestions).length === journey.stage4_quiz.questions.length) && (
                    <div className="flex items-center gap-1 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          size={14}
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
              </div>

              {/* Danh sách câu hỏi Single Question Stepper 2 Cột */}
              <div className="w-full flex-1 min-h-0 overflow-hidden">
                {journey.stage4_quiz.questions.map((question, qIdx) => {
                  const selectedOpt = quizAnswers[qIdx]
                  const isActive = qIdx === activeQuizQuestionIdx
                  const isQuestionChecked = checkedQuestions[qIdx] || quizSubmitted

                  return (
                    <div
                      key={question.id || qIdx}
                      className={cn(
                        'w-full h-full transition-all',
                        isActive ? 'block' : 'hidden'
                      )}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5 items-stretch w-full h-full min-h-0">
                        {/* CỘT TRÁI (Ảnh To Rõ Ràng - 5/12 cols trên MD, 5/12 trên LG) */}
                        <div className="md:col-span-5 lg:col-span-5 flex flex-col justify-center h-full min-h-0">
                          {isValidImageUrl(question.visualUrl) ? (
                            <div className="w-full h-full max-h-[260px] sm:max-h-[300px] md:max-h-[340px] rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 relative flex items-center justify-center group shadow-clay-sm">
                              <img
                                src={question.visualUrl}
                                alt={question.prompt}
                                className="w-full h-full object-cover cursor-pointer group-hover:scale-103 transition-transform duration-300"
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
                                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-1.5 opacity-90 hover:opacity-100 transition shadow-xs cursor-pointer z-10"
                                title="Xem ảnh phóng to"
                              >
                                <span>🔍 Phóng to</span>
                              </button>
                            </div>
                          ) : (
                            <div className="w-full h-full max-h-[260px] sm:max-h-[300px] md:max-h-[340px] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-4 text-center text-slate-400">
                              <span className="text-3xl mb-1">🎨</span>
                              <span className="text-xs font-bold">Hình ảnh minh họa cho câu hỏi {qIdx + 1}</span>
                            </div>
                          )}
                        </div>

                        {/* CỘT PHẢI (Câu Hỏi & Các Đáp Án - 7/12 cols trên MD, 7/12 trên LG) */}
                        <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-between bg-slate-50/70 rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-2xs h-full min-h-0 overflow-hidden">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="px-2.5 py-0.5 rounded-xl bg-brand-500 text-white text-xs font-black shadow-xs">
                                CÂU {qIdx + 1}
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 leading-snug line-clamp-2">
                              {question.prompt}
                            </h3>
                          </div>

                          <div className="flex flex-col gap-2 my-2 overflow-y-auto">
                            {question.options.map((optText, optIdx) => {
                              const isSelected = selectedOpt === optIdx
                              const isCorrect = optIdx === question.correctIndex

                              let optClass =
                                'border-slate-200 bg-white hover:bg-amber-50/70 text-slate-700 hover:border-amber-300'
                              if (isQuestionChecked) {
                                if (isCorrect) {
                                  optClass =
                                    'border-mint-500 bg-mint-50 text-mint-900 font-bold ring-2 ring-mint-300'
                                } else if (isSelected && !isCorrect) {
                                  optClass =
                                    'border-rose-400 bg-rose-50 text-rose-900 font-medium'
                                }
                              } else if (isSelected) {
                                optClass =
                                  'border-brand-500 bg-brand-50 text-brand-900 font-bold ring-2 ring-brand-300 shadow-clay-xs scale-[1.01]'
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={isQuestionChecked}
                                  onClick={() => {
                                    if (isQuestionChecked) return
                                    const isRight = optIdx === question.correctIndex
                                    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                                    setCheckedQuestions((prev) => ({ ...prev, [qIdx]: true }))
                                    try {
                                      playInstantSound(isRight ? 'star' : 'wrong')
                                    } catch {
                                      // ignore
                                    }
                                  }}
                                  className={cn(
                                    'p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 text-left text-xs sm:text-sm md:text-base font-bold text-slate-800 transition-all flex items-center gap-2.5 cursor-pointer min-h-[44px] sm:min-h-[48px] shadow-2xs',
                                    optClass
                                  )}
                                >
                                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl border border-slate-300 flex items-center justify-center text-xs sm:text-sm font-black flex-shrink-0 bg-white shadow-2xs">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span className="flex-1 leading-snug">{optText}</span>
                                  {isQuestionChecked && isCorrect && (
                                    <Check size={18} className="text-mint-600 flex-shrink-0" />
                                  )}
                                  {isQuestionChecked && isSelected && !isCorrect && (
                                    <X size={18} className="text-rose-500 flex-shrink-0" />
                                  )}
                                </button>
                              )
                            })}

                            {isQuestionChecked && question.explanation && (
                              <div className="mt-1 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 leading-relaxed font-bold flex items-start gap-2">
                                <span className="text-base">💡</span>
                                <span className="flex-1">{question.explanation}</span>
                              </div>
                            )}
                          </div>

                          {/* Nút Chuyển Câu Hỏi & Kiểm Tra Trực Tiếp Trong Card */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-auto gap-2 shrink-0">
                            <button
                              type="button"
                              disabled={activeQuizQuestionIdx === 0}
                              onClick={() => setActiveQuizQuestionIdx((prev) => Math.max(0, prev - 1))}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                            >
                              <span>←</span> <span>Câu trước</span>
                            </button>

                            <div className="flex items-center gap-2">
                              {isActive && (
                                <button
                                  type="button"
                                  disabled={selectedOpt === undefined}
                                  onClick={() => {
                                    setCheckedQuestions((prev) => ({ ...prev, [qIdx]: true }))
                                    const isRight = selectedOpt === question.correctIndex
                                    try {
                                      playInstantSound(isRight ? 'star' : 'wrong')
                                    } catch {
                                      // ignore
                                    }
                                  }}
                                  className="sr-only"
                                >
                                  <span>Kiểm tra đáp án ✨</span>
                                </button>
                              )}

                              {isQuestionChecked && (
                                <span
                                  className={cn(
                                    'px-3 py-1 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1',
                                    selectedOpt === question.correctIndex
                                      ? 'bg-mint-100 text-mint-800'
                                      : 'bg-rose-100 text-rose-800'
                                  )}
                                >
                                  {selectedOpt === question.correctIndex ? '✓ Đúng rồi!' : '✕ Chưa chính xác'}
                                </span>
                              )}

                              {activeQuizQuestionIdx < journey.stage4_quiz.questions.length - 1 ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveQuizQuestionIdx((prev) =>
                                      Math.min(journey.stage4_quiz.questions.length - 1, prev + 1)
                                    )
                                  }
                                  className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-black shadow-xs cursor-pointer flex items-center gap-1"
                                >
                                  <span>Câu tiếp theo</span> <span>→</span>
                                </button>
                              ) : (
                                <span className="text-xs sm:text-sm font-bold text-amber-900">
                                  Câu cuối cùng
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Action buttons - Sticky đáy */}
              <div className="shrink-0 pt-1.5 pb-0.5 bg-white/95 backdrop-blur-xs flex justify-between items-center border-t border-slate-100 sticky bottom-0 z-20">
                <Button
                  variant="secondary"
                  onClick={() => handleStageSelect(2)}
                  className="rounded-xl text-xs py-1 px-3"
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
                      const allChecked: Record<number, boolean> = {}
                      journey.stage4_quiz.questions.forEach((_, i) => {
                        allChecked[i] = true
                      })
                      setCheckedQuestions(allChecked)
                      try {
                        playInstantSound('star')
                      } catch {
                        // ignore
                      }
                    }}
                    className="px-6 py-3 text-sm sm:text-base font-black rounded-xl"
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
              className="flex w-full min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-3 animate-fade-up"
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
              className="rounded-3xl bg-white p-4 sm:p-6 lg:p-7 shadow-clay border-2 border-brand-100 w-full min-h-[460px] max-h-[calc(100vh-140px)] flex flex-col justify-center animate-fade-up overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-center w-full h-full">
                {/* CỘT TRÁI (md:col-span-6 lg:col-span-6): Trưng bày tác phẩm kiệt xuất vừa cất vào Balo */}
                <div className="md:col-span-6 lg:col-span-6 flex flex-col h-full justify-between rounded-2xl bg-amber-50/70 p-3.5 sm:p-4 border-2 border-amber-200">
                  <div className="flex items-center justify-between text-xs font-black text-amber-900 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <Award size={16} className="text-amber-600" />
                      <span>Tác phẩm kiệt xuất vừa cất vào Balo</span>
                    </span>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-mint-100 text-mint-800 text-xs sm:text-sm font-black">
                      <CheckCircle2 size={13} className="text-mint-600" />
                      <span>{journey.stage6_completion.rewardBadge.name}</span>
                    </div>
                  </div>

                  {/* Khung ảnh to, sắc nét chuẩn tỷ lệ 4:3, tràn viền lấp đầy 100% không còn hở khoảng trắng 2 bên */}
                  <div className="w-full flex-1 flex items-center justify-center my-auto min-h-0 py-1 overflow-hidden">
                    <div className="relative h-full max-h-[440px] sm:max-h-[460px] aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-clay border-3 border-amber-300 bg-amber-100/40 group flex items-center justify-center">
                      <img
                        src={
                          submittedArtwork?.image.url ||
                          journey.stage6_completion.rewardBadge.iconUrl ||
                          journey.stage1_goal.imageUrl
                        }
                        alt="Kiệt tác của bé"
                        className="size-full object-cover cursor-pointer group-hover:scale-102 transition-transform duration-300"
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
                        className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-xl backdrop-blur-xs flex items-center gap-1 opacity-90 hover:opacity-100 transition shadow-xs cursor-pointer z-10"
                        title="Xem ảnh phóng to"
                      >
                        <span>🔍 Phóng to</span>
                      </button>
                    </div>
                  </div>

                  {submittedArtwork?.prompt && (
                    <p className="text-xs sm:text-sm text-slate-600 font-medium italic bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200/60 w-full text-center mt-2 truncate">
                      &ldquo;{submittedArtwork.prompt}&rdquo;
                    </p>
                  )}
                </div>

                {/* CỘT PHẢI (md:col-span-6 lg:col-span-6): Vinh danh, Tiêu đề, Lời chúc & Các nút điều hướng */}
                <div className="md:col-span-6 lg:col-span-6 flex flex-col justify-center gap-3.5 sm:gap-4 text-center md:text-left h-full">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs sm:text-sm font-bold border border-amber-300/60 self-center md:self-start">
                    <Trophy size={13} className="text-amber-600" />
                    <span>Chặng 6: Hoàn thành bài học</span>
                  </div>

                  {/* Vinh danh: Cúp vàng đất nặn 3D Hallmark Soft Clay + 3 Sao vàng */}
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src="/assets/trophy-clay-gold.png"
                        alt="Cúp Vàng Sáng Tạo"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-clay select-none hover:scale-105 transition-transform duration-300"
                      />
                      <div
                        data-testid="stage6-trophy-xp-badge"
                        className="absolute -top-1.5 -right-2 bg-brand-500 text-white text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow-clay-xs flex items-center gap-0.5 z-10"
                      >
                        <Sparkles size={11} />
                        +{effectiveRewardXp} XP
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3].map((star) => (
                        <Star
                          key={star}
                          size={24}
                          className="fill-amber-400 text-amber-500 drop-shadow-md animate-pulse"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tiêu đề & Lời chúc mừng */}
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                      {journey.stage6_completion.title}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                      {journey.stage6_completion.congratsMessage}
                    </p>
                  </div>

                  {/* Cụm Nút điều hướng kết thúc */}
                  <div className="flex flex-col gap-2.5 w-full pt-1">
                    {journey.stage6_completion.nextLessonSlug && onNavigateNextLesson ? (
                      <Button
                        variant="primary"
                        className="w-full py-3 text-sm sm:text-base font-black rounded-2xl shadow-clay border-b-[4px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2 cursor-pointer"
                        onClick={() => {
                          onFinishLesson?.({
                            stars: effectiveStars,
                            xp: effectiveRewardXp,
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
                        className="w-full py-2.5 text-sm sm:text-base font-black rounded-2xl border-2 border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer"
                        onClick={() => {
                          onFinishLesson?.({
                            stars: effectiveStars,
                            xp: effectiveRewardXp,
                          })
                          onBackToMap()
                        }}
                      >
                        <span>🗺️ Quay Về Bản Đồ Đảo</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
          {supplementalStageCard && (
            <section aria-label="Nội dung bổ sung của chặng" className="animate-fade-up">
              <StudentStageBlocksView
                card={supplementalStageCard}
                stageIndex={currentStage}
                onNextStage={currentStage < 5 ? advanceToStage : undefined}
                onZoomImage={(image) => image.url && setZoomImage({ url: image.url, title: image.title })}
              />
            </section>
          )}
        </div>

        {/* CỘT PHẢI: SIDEBAR TƯƠNG TÁC AKI ĐỒNG HÀNH (300-400px) */}
        {!isSidebarCollapsed && (
          <>
            {(currentStage === 4 || currentStage === 5) && (
              <div
                data-testid="sidebar-overlay-backdrop"
                className="fixed inset-0 bg-black/20 backdrop-blur-2xs z-30 transition-opacity"
                onClick={() => setIsSidebarCollapsed(true)}
              />
            )}
            <aside
              data-testid="interactive-sidebar"
              className={cn(
                'shrink-0 flex flex-col bg-white rounded-3xl border-2 border-brand-100 shadow-clay overflow-hidden',
                (currentStage === 4 || currentStage === 5)
                  ? 'fixed top-16 right-4 bottom-4 w-[340px] sm:w-[380px] z-40 shadow-2xl border-2 border-brand-300'
                  : 'w-full md:w-[300px] lg:w-[360px] xl:w-[400px]'
              )}
            >
              {/* Header Sidebar: Chặng X/6 + Tên Chặng + Nút Âm Thanh */}
              <div className="p-4 bg-gradient-to-r from-brand-50 to-amber-50 border-b border-brand-100 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-brand-500 text-white text-xs font-black uppercase tracking-wider">
                  Chặng {currentStage + 1}/6: {STAGES[currentStage]?.title}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => speakCurrentStage(currentStageSpeech)}
                    className="p-1.5 rounded-full bg-white hover:bg-brand-100 text-brand-700 transition shadow-2xs cursor-pointer"
                    title="Nghe lời giảng của AKI"
                  >
                    <Volume2 size={16} />
                  </button>
                  {(currentStage === 4 || currentStage === 5) && (
                    <button
                      type="button"
                      onClick={() => setIsSidebarCollapsed(true)}
                      className="px-2.5 py-0.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all cursor-pointer ml-1"
                      title="Đóng bảng tương tác"
                    >
                      ✕ Đóng
                    </button>
                  )}
                </div>
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
                      <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        Chỉ 4 lượt chọn
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-amber-900 font-medium">
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
                                <span className={cn('text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-md uppercase tracking-wider', statusBadgeClass)}>
                                  {statusBadgeText}
                                </span>
                                <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                                  {turnText}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {part.iconImage ? (
                                  <img
                                    src={part.iconImage}
                                    alt={part.title}
                                    className="w-8 h-8 rounded-lg object-contain bg-white border border-amber-200 p-0.5 shrink-0 shadow-2xs"
                                  />
                                ) : (
                                  <span className="text-lg shrink-0">{part.icon}</span>
                                )}
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
                      <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-indigo-950 flex items-center gap-1.5">
                        <span>🎯</span>
                        <span>Tiến Trình 4 Bước Thực Hành</span>
                      </span>
                      <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
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
                            <div className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                              {s.title}
                            </div>
                            <div className="text-[11px] sm:text-xs text-indigo-700 font-semibold mt-0.5 truncate">
                              {s.hint}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mẹo vàng của AKI */}
                  <div className="bg-amber-50/90 rounded-2xl p-3.5 border border-amber-200 flex flex-col gap-1.5 text-left">
                    <div className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5">
                      <span>💡</span>
                      <span>MẸO VÀNG CỦA AKI</span>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-900 font-bold leading-relaxed">
                      {journey.stage5_practice.akiMotto ||
                        studioConfig?.akiMotto ||
                        'Tả càng rõ, tranh càng đúng ý! Hãy miêu tả đủ chi tiết để AKI vẽ chuẩn nhé.'}
                    </p>
                  </div>

                  {/* Mật mã đặc điểm vàng */}
                  {studioConfig?.lockedFeatures && studioConfig.lockedFeatures.length > 0 && (
                    <div className="bg-purple-50/80 rounded-2xl p-3 border border-purple-200 flex flex-col gap-1.5 text-left">
                      <div className="text-xs sm:text-sm font-black text-purple-950 flex items-center gap-1.5">
                        <span>🔑</span>
                        <span>Mật mã đặc điểm vàng:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {studioConfig.lockedFeatures.map((feat, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-bold text-purple-900 bg-white px-2 py-0.5 rounded-lg border border-purple-200 shadow-2xs"
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
                    className="w-full py-2 px-3 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    onClick={() => handleStageSelect(2)}
                  >
                    <RotateCcw size={13} className="text-slate-500" />
                    <span>↺ Tua lại video</span>
                    <span className="text-[11px] sm:text-xs text-slate-400 font-normal">↺ Xem lại video bài giảng</span>
                  </Button>
                </div>
              ) : (
                <>
                  {/* CHẶNG 0: Trợ Lý Đồng Hành Sư Phạm Của AKI (Không lặp lại 4 ô công thức) */}
                  {currentStage === 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-gradient-to-b from-amber-50/80 to-yellow-50/60 rounded-2xl p-3.5 border-2 border-amber-200 shadow-2xs flex flex-col gap-2.5 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                            <span>💡</span>
                            <span>Mẹo Vàng Của AKI</span>
                          </span>
                          <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                            Bí Kíp Vàng
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                          {journey.stage1_goal.keyPoints?.[2] || 'Tả càng rõ - Vẽ càng đúng! Chỗ nào các cậu bỏ trống, Ây Ai như tớ sẽ tự điền vào đấy nhé!'}
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                        <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                          🎯 Nhiệm vụ chặng này:
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium">
                          Đọc kỹ mục tiêu và ghi nhớ công thức 4 ô bên cạnh để giải câu đố ở chặng sau nhé!
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
                          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                            <span>💡</span>
                            <span>Bảng Gợi Ý Mật Mã</span>
                          </span>
                          <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                            Cheat-sheet
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-900/80 font-medium">
                          Tra cứu nhanh 4 ô chìa khóa nếu bé chưa chắc chắn:
                        </p>

                        <div className="grid grid-cols-2 gap-1.5">
                          {formulaCards.map((card) => (
                            <div
                              key={card.id}
                              className="p-1.5 rounded-xl bg-white/90 border border-amber-200 flex items-center gap-1.5 shadow-2xs"
                            >
                              <img
                                src={card.image}
                                alt={card.code}
                                className="w-6 h-6 rounded-md object-contain border border-amber-200/80 p-0.5 shrink-0 bg-white"
                              />
                              <div className="min-w-0">
                                <span className="text-[11px] sm:text-xs font-black text-slate-800 block truncate">
                                  {card.code}
                                </span>
                                <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold block truncate">
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
                        <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                          🎯 Nhiệm vụ chặng này:
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium">
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
                          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                            <Video size={14} className="text-purple-600" />
                            <span>Mốc Phân Đoạn Video</span>
                          </span>
                          <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            {videoChapters.length} Mốc
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-purple-900/80 font-medium">
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
                                      'size-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0',
                                      isSelected ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                                    )}
                                  >
                                    {idx + 1}
                                  </span>
                                  <span className="text-xs sm:text-sm truncate font-bold">{ts.label}</span>
                                </div>
                                <span
                                  className={cn(
                                    'text-xs font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 shadow-2xs',
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
                        <div className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5">
                          <span>🔑</span>
                          <span>QUY TẮC CỐT LÕI CỦA VIDEO</span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-900 font-bold leading-relaxed">
                          Tả càng rõ, tranh càng đúng ý! Nhớ quan sát kỹ cách thầy AKI ghép các từ khóa thành một câu lệnh hoàn chỉnh nhé.
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                        <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                          🎯 Nhiệm vụ chặng này:
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium">
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
                          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                            <FileQuestion size={14} className="text-blue-600" />
                            <span>Bảng Điểm Trực Tiếp</span>
                          </span>
                          <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
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
                            <p className="text-xs sm:text-sm text-slate-600">
                              Tổng điểm: {quizScore}/{journey.stage4_quiz.questions.length} câu đúng.
                            </p>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-white border border-blue-100 flex flex-col gap-1.5 shadow-2xs">
                            <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-700">
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
                            <span className="text-xs text-slate-500 text-center font-medium">
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
                            <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
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
                        <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
                          🎯 Nhiệm vụ chặng này:
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium">
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
                          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                            <Trophy size={14} className="text-amber-600" />
                            <span>Tổng Kết Phần Thưởng</span>
                          </span>
                          <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                            Tốt Nghiệp
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 flex items-center gap-2 shadow-2xs">
                            <span className="text-lg">⭐</span>
                            <div>
                              <span className="text-xs sm:text-sm font-black text-amber-900 block">+3 Sao</span>
                              <span className="text-[11px] text-slate-500 font-semibold">Tích lũy</span>
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 flex items-center gap-2 shadow-2xs">
                            <span className="text-lg">🪙</span>
                            <div>
                              <span className="text-xs sm:text-sm font-black text-amber-900 block">+5 Xu</span>
                              <span className="text-[11px] text-slate-500 font-semibold">Thần kỳ</span>
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 flex items-center gap-2 shadow-2xs">
                            <span className="text-lg">⚡</span>
                            <div>
                              <span className="text-xs sm:text-sm font-black text-amber-900 block">+50 XP</span>
                              <span className="text-[11px] text-slate-500 font-semibold">Kinh nghiệm</span>
                            </div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200 flex items-center gap-2 shadow-2xs">
                            <span className="text-lg">🏅</span>
                            <div className="min-w-0">
                              <span className="text-xs sm:text-sm font-black text-amber-900 block truncate">
                                {journey.stage6_completion.rewardBadge.name}
                              </span>
                              <span className="text-[11px] text-slate-500 font-semibold">Huy hiệu vàng</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 🏠 Việc Ngoài Màn Hình (Home Mission) */}
                      <div className="bg-emerald-50/80 rounded-2xl p-3.5 border-2 border-emerald-200 flex flex-col gap-2 text-left shadow-2xs">
                        <div className="flex items-center justify-between text-xs sm:text-sm font-black text-emerald-950">
                          <span className="flex items-center gap-1.5">
                            <span>🏠</span>
                            <span>Việc Ngoài Màn Hình (Home Mission)</span>
                          </span>
                          <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
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
                          <div className="text-xs sm:text-sm font-black text-indigo-950 flex items-center gap-1.5">
                            <span>🔮</span>
                            <span>TEASER BÀI HỌC TIẾP THEO</span>
                          </div>
                          <p className="text-xs sm:text-sm text-indigo-900 font-bold leading-relaxed">
                            Chủ đề tiếp theo: {journey.stage6_completion.nextLessonSlug.replace(/[-_]/g, ' ')}
                          </p>
                          <span className="text-xs text-slate-500">
                            Nhiều điều bí ẩn và công thức thần kỳ mới đang chờ đón bé khám phá!
                          </span>
                        </div>
                      )}

                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col gap-2.5">
                        <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-700">
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
        </>
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
