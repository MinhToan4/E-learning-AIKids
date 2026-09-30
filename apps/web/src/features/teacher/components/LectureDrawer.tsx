/**
 * LectureDrawer — Slide-in drawer để tạo/chỉnh sửa bài học (lecture).
 *
 * WHY slide-in drawer:
 * - Giáo viên thấy danh sách bài học bên trái trong khi chỉnh sửa bên phải
 * - Không mất context khi chỉnh sửa
 * - Light theme đồng bộ với hệ thống UI
 *
 * Sections (tab ngang):
 *   1. Cơ bản — tiêu đề, skill, hook, goals, video
 *   2. Kiến thức — concept, example
 *   3. Trò chơi — game selector + questionCount + config
 *   4. Sáng tạo — practice kind + instruction
 *   5. Thử tài — check question, options, answer
 */
import React, { useState, useCallback, useEffect, useId, useRef, useDeferredValue, useMemo } from 'react'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { Button } from '@/shared/components/ui/Button'
import { X, CheckCircle2, Circle, Youtube, BookOpen, Gamepad2, Palette, HelpCircle, BookMarked, Target, Lightbulb, Eye, Plus, Trash2, ChevronUp, ChevronDown, ChevronRight, BrainCircuit, ScanSearch, ListChecks, PanelsTopLeft, Scale, BookmarkCheck, MessageCircleQuestion, Flag, Clapperboard, Volume2, Trophy, MessageSquareText, Sparkles, Image as ImageIcon, Check, Play, Film, Split, GripVertical, ArrowUp, ArrowDown, ZoomIn, Star, Maximize2, Minimize2, Smartphone, Tablet, Monitor, RotateCcw, Pause, ArrowRight, Award, Compass, AlertTriangle, Link2, Wand2, PanelRightClose, PanelRightOpen } from 'lucide-react'
import {
  api,
  type LessonSixStageJourney,
  type SixStagePractice,
  type SixStagePracticePartDef,
  type SixStageFourKeysOptions,
  type SixStageWorkflowStep,
} from '@/shared/lib/api'
import { resolveIslandSixStageJourney } from '@/features/lesson/lib/island-journey-resolver'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'
import { cn } from '@/shared/lib/cn'
import { useToast } from '@/shared/hooks/useToast'
import {
  GAME_OPTIONS, PRACTICE_OPTIONS, GAME_DIFFICULTIES,
  buildLectureGameConfig, lectureDraftReadiness,
  serializeLectureGameConfig, serializeLearnCardsForHub, slugifyAuthoringId, createAikiRuleLearnCards, createAikiRule3StepsCards, AIKI_RULE_META_LABEL,
  AIKI_RULE_STAGE_KINDS,
  detectLessonFormat, isAikiRuleLesson, type LessonFormat,
  STANDARD_RULE_3_STAGES,
  type LectureDraft,
  type LessonAccessMode,
  type LessonAccessConfig,
  type LearnCardDraft,
  type LearnVisualItemDraft,
  type DialogueLine,
  type StageImageItem,
  type StageCompareData,
  type ContentBlockType,
  type StageBlockItem,
  type JourneyStageDefinition,
  resolveCourseJourneyStages,
  getActiveModules,
  getStageBlocks,
  createFourKeysBlock,
  normalizeLectureDraft,
  ISLAND_6_STAGE_NAMES,
  COURSE_GOAL_BLOCK_PREFIX,
  COURSE_CONFIRM_BLOCK_PREFIX,
  defaultLearnCards,
  goalKeyItems,
} from '../lib/authoring'

export {
  getActiveModules,
  normalizeLectureDraft,
  ISLAND_6_STAGE_NAMES,
  defaultLearnCards,
  COURSE_GOAL_BLOCK_PREFIX,
  COURSE_CONFIRM_BLOCK_PREFIX,
}
import { StageBlockItemCard } from './StageBlockItemCard'
import { GameSelector } from './GameSelector'
import { QuizQuestionBuilder, type EditableQuestion } from './QuizQuestionBuilder'
import { CatalogGameBuilder } from './CatalogGameBuilder'
import { QuestionBankPicker } from './QuestionBankPicker'
import { CheckQuestionBuilder } from './CheckQuestionBuilder'
import { CurriculumGame } from '@/features/lesson/components/CurriculumGame'
import { LectureVideo } from '@/features/lesson/components/LectureVideo'
import { SixStageGoalStage } from '@/features/lesson/components/SixStageGoalStage'
import { StudentStageBlocksView } from '@/features/lesson/components/StudentStageBlocksView'
import {
  VideoStageBlock,
  QuizStageBlock,
  RewardStageBlock,
  GoalStageBlock,
  ConfirmStageBlock,
  PracticeStageBlock,
} from '@/features/lesson/components/stages'
import { adaptSixStageJourneyToStages } from '@/features/lesson/lib/stage-adapter'
import { buildVideoEmbedUrl } from '@/features/lesson/lib/stage-view-utils'
import type {
  GoalStageConfig,
  ConfirmStageConfig,
  VideoStageConfig,
  QuizStageConfig,
  PracticeStageConfig,
  RewardStageConfig,
  QuizQuestionItem,
  JourneyStageDefinition as StageSchemaDefinition,
} from '@/features/lesson/types/stage-schema'
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { MeeCatInteractiveCanvas } from '@/features/mee-rig/components/MeeCatInteractiveCanvas'
import type { CurriculumGameConfig } from '@/features/lesson/lib/curriculum-game'
import { CreativeNotebookEngine } from '@/features/lesson/components/creative-engine/engines/CreativeNotebookEngine'
import { DEFAULT_NOTEBOOK_CONFIGS, findIslandCurriculum } from '@/features/lesson/data/island-curriculum-registry'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import { extractRuleNumber, isAikiRuleJourney } from '@/features/lesson/lib/rule-journey-identifiers'
import {
  LectureDrawerHeader,
  LectureDrawerGameTab,
  LectureDrawerExerciseTab,
  type Section,
} from './lecture-drawer'

type Props = {
  courseId: string
  lecture: LectureDraft | null      // null = create new
  onSaved: () => void
  onClose: () => void
  // WHY: inline=true → hiển thị trong main panel (không phải overlay).
  // Master-detail layout: sidebar trái, editor phải inline.
  inline?: boolean
  // WHY: archived + archive/restore callback để giáo viên ẩn/hiện bài từ trong editor.
  archived?: boolean
  onArchive?: () => void
  onRestore?: () => void
  // WHY: readOnly=true cho global system courses — chỉ xem, không được gọm PATCH/DELETE.
  // Ngăn chặn 403 bằng cách ẩn mọi nút thực hiện action.
  readOnly?: boolean
  onDirtyChange?: (dirty: boolean) => void
}

export { ISLAND_6_STAGE_SECTIONS } from './lecture-drawer'

import {
  DEFAULT_PRACTICE_PARTS,
  DEFAULT_FOUR_KEYS_OPTIONS,
  DEFAULT_LOCKED_FEATURES,
  DEFAULT_EXPRESSIONS,
  DEFAULT_STYLE_PRISM_OPTIONS,
  DEFAULT_PROMPT_DOCTOR_CASE,
  DEFAULT_LAYER_STACKING_OPTIONS,
  DEFAULT_CARD_FORGE_OPTIONS,
  suggestFourKeysForSubject,
  Stage5CreativeEngineEditor,
  PracticePartsAndFourKeysEditor,
} from './engine-editors'

export {
  DEFAULT_PRACTICE_PARTS,
  DEFAULT_FOUR_KEYS_OPTIONS,
  DEFAULT_LOCKED_FEATURES,
  DEFAULT_EXPRESSIONS,
  DEFAULT_STYLE_PRISM_OPTIONS,
  DEFAULT_PROMPT_DOCTOR_CASE,
  DEFAULT_LAYER_STACKING_OPTIONS,
  DEFAULT_CARD_FORGE_OPTIONS,
  suggestFourKeysForSubject,
  Stage5CreativeEngineEditor,
  PracticePartsAndFourKeysEditor,
}


import {
  AIKI_SECTIONS,
  STANDARD_SECTIONS,
  AIKI_STAGE_NAMES,
  ENGINE_DEFAULT_MOTTOS,
  type CreativeEngineOption,
  CREATIVE_ENGINES,
  AVAILABLE_MODULES,
  LEARN_KIND_OPTIONS,
  LEARN_LAYOUT_OPTIONS,
  LECTURE_GESTURES,
  LEARN_KIND_PRESENTATION,
  getBlockIcon,
  getBlockTitle,
  speakTextPreview,
  goalLines,
  SELF_CONTAINED_QUIZ_GAMES,
  CATALOG_GAMES,
  buildRuleSyntheticJourney,
} from './lecture-drawer/lecture-drawer-constants'

import {
  CollapsedPreviewRail,
  StudentBasicsPreview,
  StudentLearnPreview,
  PracticeWorkflowStepsAccordion,
} from './lecture-drawer/PracticeWorkflowStepsAccordion'

import {
  type PreviewViewportMode,
  StudentStagePreview,
  practiceKindLabel,
  PracticeKindPreview,
} from './lecture-drawer/StudentStagePreview'

import { FullStationPreview } from './lecture-drawer/FullStationPreview'

export {
  AIKI_SECTIONS,
  STANDARD_SECTIONS,
  AIKI_STAGE_NAMES,
  ENGINE_DEFAULT_MOTTOS,
  type CreativeEngineOption,
  CREATIVE_ENGINES,
  AVAILABLE_MODULES,
  LEARN_KIND_OPTIONS,
  LEARN_LAYOUT_OPTIONS,
  LECTURE_GESTURES,
  LEARN_KIND_PRESENTATION,
  getBlockIcon,
  getBlockTitle,
  speakTextPreview,
  goalLines,
  buildRuleSyntheticJourney,
  CollapsedPreviewRail,
  StudentBasicsPreview,
  StudentLearnPreview,
  PracticeWorkflowStepsAccordion,
  type PreviewViewportMode,
  StudentStagePreview,
  practiceKindLabel,
  PracticeKindPreview,
  FullStationPreview,
}

export function emptyDraft(): LectureDraft {
  return {
    id: '', slug: '', title: '', skill: '', hook: '',
    practiceKind: 'journal', videoUrl: '',
    access: { mode: 'inherit', minPlanTier: 0, trialBadge: 'Học thử' },
    concept: '', example: '', learnCards: defaultLearnCards(),
    reward: '', duration: '',
    goalsText: '',
    gameType: 'math-kids',
    gameMode: 'required',
    gameAllowedTypes: ['math-kids'],
    gameDifficulty: 'steady',
    gameInstruction: '',
    gameOutcome: '',
    gameCardsText: '',
    gameStructuredText: '',
    // WHY: 6 là số câu hỏi mặc định hợp lý cho 1 bài học.
    // Giáo viên có thể chỉnh từ 1–30 tuỳ độ khó bài.
    questionCount: 6,
    practiceInstruction: '',
    product: '',
    practiceStepsText: '',
    successCriteriaText: '',
    reflectionPrompt: '',
    practiceConfigText: '',
    checkQuestions: [],
    checkQuestion: '', checkOption1: '', checkOption2: '', checkOption3: '',
    correctIndex: '0', checkExplain: '',
  }
}

export function LectureDrawer({ courseId, lecture, onSaved, onClose, inline = false, archived = false, onArchive, onRestore, readOnly = false, onDirtyChange }: Props) {
  const uid = useId()
  const { showToast } = useToast()
  const isAikiRule = Boolean(
    (lecture as any)?.lessonFormat === 'aiki-rule-3steps' ||
    (lecture as any)?.lessonFormat === 'aiki-rule-5steps' ||
    (lecture?.learnCards ? isAikiRuleLesson(lecture.learnCards) : false) ||
    (courseId && (courseId.toLowerCase() === 'aiki-rules' || courseId.toLowerCase().includes('rule'))) ||
    isAikiRuleJourney(lecture) ||
    isAikiRuleJourney(courseId)
  )
  const hasIslandContract = !isAikiRule && Boolean(
    (lecture as any)?.lessonFormat === 'aiki-island-6steps' ||
    (lecture as any)?.metadata?.sixStageJourney ||
    lecture?.sixStageJourney
  )
  const isIslandCourse = !isAikiRule && Boolean(
    courseId.startsWith('dao-') ||
    (lecture as any)?.lessonFormat === 'aiki-island-6steps' ||
    (lecture as any)?.metadata?.sixStageJourney ||
    lecture?.sixStageJourney ||
    (/^bai-\d+-\d+/i.test(lecture?.id || '') && (lecture as any)?.lessonFormat !== 'standard')
  )
  const initialDraftRef = useRef(normalizeLectureDraft(lecture ?? emptyDraft(), courseId))
  const [draft, setDraft] = useState<LectureDraft>(() => initialDraftRef.current)
  const deferredDraft = useDeferredValue(draft)
  const [activeSection, setActiveSection] = useState<Section>('basics')
  const [quizQuestions, setQuizQuestions] = useState<EditableQuestion[]>([])
  const [showBankPicker, setShowBankPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingStageMedia, setUploadingStageMedia] = useState<string | null>(null)
  const [lessonFormat, setLessonFormat] = useState<LessonFormat>(() => {
    if (isIslandCourse) return 'aiki-island-6steps'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let explicit: string | undefined = (lecture as any)?.lessonFormat
    if (!explicit && lecture?.gameStructuredText) {
      try {
        const parsed = JSON.parse(lecture.gameStructuredText)
        explicit = parsed.lessonFormat
      } catch {}
    }
    if (explicit === 'aiki-rule-3steps' || explicit === 'aiki-rule-5steps' || explicit === 'aiki-island-6steps' || explicit === 'standard') {
      return explicit
    }
    if (isAikiRule) return 'aiki-rule-3steps'
    return detectLessonFormat(initialDraftRef.current.learnCards, explicit, isIslandCourse)
  })

  const updateSixStage = useCallback((updater: (prev: LessonSixStageJourney) => LessonSixStageJourney) => {
    setDraft((d) => {
      const current = d.sixStageJourney || (d.lessonFormat === 'aiki-rule-3steps' ? buildRuleSyntheticJourney(d) : resolveIslandSixStageJourney(d as any))
      const next = updater(current)
      const nextLearnCards = [...d.learnCards]
      if (d.lessonFormat === 'aiki-rule-3steps') {
        if (nextLearnCards[0]) {
          nextLearnCards[0] = {
            ...nextLearnCards[0],
            title: next.stage3_video?.title || nextLearnCards[0].title,
            videoUrl: next.stage3_video?.videoUrl || nextLearnCards[0].videoUrl,
            imageUrl: next.stage3_video?.posterUrl || nextLearnCards[0].imageUrl,
          }
        }
        if (nextLearnCards[1]) {
          nextLearnCards[1] = {
            ...nextLearnCards[1],
            title: next.stage4_quiz?.title || nextLearnCards[1].title,
          }
        }
        if (nextLearnCards[2]) {
          nextLearnCards[2] = {
            ...nextLearnCards[2],
            title: next.stage6_completion?.title || nextLearnCards[2].title,
          }
        }
      }
      return {
        ...d,
        sixStageJourney: next,
        metadata: {
          ...d.metadata,
          sixStageJourney: next,
        },
        title: (d.lessonFormat === 'aiki-rule-3steps' ? d.title : (next.stage1_goal.title || d.title)),
        goalsText: next.stage1_goal.keyPoints?.length ? next.stage1_goal.keyPoints.join('\n') : d.goalsText,
        videoUrl: next.stage3_video.videoUrl || d.videoUrl,
        reward: next.stage6_completion?.rewardBadge?.name || d.reward,
        learnCards: nextLearnCards,
        checkQuestions: next.stage4_quiz.questions?.map((q, idx) => ({
          id: q.id || `q-${idx}`,
          prompt: q.prompt,
          options: q.options,
          answer: q.correctIndex,
          explain: q.explanation || '',
        })) ?? d.checkQuestions,
      }
    })
  }, [])
  const [previewSpeakingIndex, setPreviewSpeakingIndex] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggingBlockIdx, setDraggingBlockIdx] = useState<number | null>(null)
  const [dragOverBlockIdx, setDragOverBlockIdx] = useState<number | null>(null)
  const [isTrashDragOver, setIsTrashDragOver] = useState(false)

  const previewAikiVoice = useCallback((index: number, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Trình duyệt không hỗ trợ phát thử giọng đọc.', 'info')
      return
    }
    window.speechSynthesis.cancel()
    if (previewSpeakingIndex === index) {
      setPreviewSpeakingIndex(null)
      return
    }
    const clean = text.trim()
    if (!clean) {
      showToast('Vui lòng nhập lời đọc hoặc nội dung trước khi nghe thử.', 'info')
      return
    }
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.rate = 0.95
    utterance.pitch = 1.25
    const voices = window.speechSynthesis.getVoices()
    const viVoice = voices.find((v) => v.lang.startsWith('vi') || v.name.toLowerCase().includes('vietnam'))
    if (viVoice) utterance.voice = viVoice

    setPreviewSpeakingIndex(index)
    utterance.onend = () => setPreviewSpeakingIndex(null)
    utterance.onerror = () => setPreviewSpeakingIndex(null)
    window.speechSynthesis.speak(utterance)
  }, [previewSpeakingIndex, showToast])

  const getAutoBadge = useCallback((): string => {
    const stationMatch = draft.title?.match(/Trạm\s+(\d+)/i)
    if (stationMatch) return `Trạm ${stationMatch[1]}`
    const idMatch = (lecture?.id || draft.id || '').match(/bai-(\d+)-(\d+)/i)
    if (idMatch) return `Trạm ${idMatch[2]}`
    const titleMatch = draft.title?.match(/Bài\s+\d+\.(\d+)/i)
    if (titleMatch) return `Trạm ${titleMatch[1]}`
    return 'Trạm 1'
  }, [draft.title, draft.id, lecture?.id])

  const [confirmClose, setConfirmClose] = useState(false)
  const [showFullPreview, setShowFullPreview] = useState(false)
  const [showInlinePreview, setShowInlinePreview] = useState(true)
  const [isEngineSelectorExpanded, setIsEngineSelectorExpanded] = useState<boolean>(false)
  const draftStorageKey = `aikids:teacher-lecture-draft:${courseId}:${lecture?.id || 'new'}`
  const [recovery, setRecovery] = useState<{ savedAt: string; draft: LectureDraft } | null>(() => {
    if (readOnly) return null
    try {
      const raw = window.sessionStorage.getItem(draftStorageKey)
      if (!raw) return null
      const parsed = JSON.parse(raw) as { savedAt?: string; draft?: LectureDraft }
      return parsed.savedAt && parsed.draft ? { savedAt: parsed.savedAt, draft: normalizeLectureDraft(parsed.draft) } : null
    } catch { return null }
  })

  const isEdit = !!lecture
  const readiness = lectureDraftReadiness(draft)
  const dirty = !readOnly && JSON.stringify(draft) !== JSON.stringify(initialDraftRef.current)

  // Đồng bộ draft khi lecture prop thay đổi (hỗ trợ chuyển trạm tức thì mà không cần remount drawer)
  const lectureKey = lecture ? `${lecture.id || ''}:${lecture.slug || ''}:${lecture.title || ''}` : null
  const prevLectureKeyRef = useRef(lectureKey)
  useEffect(() => {
    if (lectureKey !== prevLectureKeyRef.current) {
      prevLectureKeyRef.current = lectureKey
      const nextDraft = normalizeLectureDraft(lecture ?? emptyDraft(), courseId)
      initialDraftRef.current = nextDraft
      setDraft(nextDraft)
      setLessonFormat(nextDraft.lessonFormat ?? 'standard')
      setActiveSection('basics')
      if (nextDraft.checkQuestions && nextDraft.checkQuestions.length > 0) {
        setQuizQuestions(nextDraft.checkQuestions.map((q, idx) => ({
          id: q.id ?? `q-${idx}`,
          prompt: q.prompt,
          options: q.options,
          answer: q.answer,
          explanation: q.explain,
          tags: [],
          ageMin: 6,
          ageMax: 11,
          difficulty: 'steady',
          imageUrl: null,
        })))
      } else {
        setQuizQuestions([])
      }
    }
  }, [lectureKey, lecture, courseId])

  useEffect(() => {
    onDirtyChange?.(dirty)
    return () => onDirtyChange?.(false)
  }, [dirty, onDirtyChange])

  useEffect(() => {
    if (!dirty) return
    const protectDraft = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', protectDraft)
    return () => window.removeEventListener('beforeunload', protectDraft)
  }, [dirty])

  useEffect(() => {
    if (readOnly || !dirty || recovery) return
    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(draftStorageKey, JSON.stringify({ savedAt: new Date().toISOString(), draft }))
      } catch {}
    }, 600)
    return () => window.clearTimeout(timer)
  }, [draft, dirty, draftStorageKey, readOnly, recovery])

  useEffect(() => {
    const isCustom = Boolean(draft.customJourneyStages && draft.customJourneyStages.length >= 3)
    if ((isIslandCourse || lessonFormat === 'aiki-island-6steps' || lessonFormat === 'aiki-rule-3steps' || lessonFormat === 'aiki-rule-5steps' || isCustom) && (activeSection === 'content' || activeSection === 'game' || activeSection === 'practice' || activeSection === 'check')) {
      setActiveSection('stage-0')
    }
  }, [isIslandCourse, lessonFormat, activeSection, draft.customJourneyStages])

  useEffect(() => {
    if (lessonFormat === 'standard' && activeSection.startsWith('stage-')) {
      if (draft.customJourneyStages && draft.customJourneyStages.length >= 3) {
        return
      }
      setActiveSection('content')
    }
  }, [lessonFormat, activeSection, draft.customJourneyStages])

  const requestClose = useCallback(() => {
    if (dirty) setConfirmClose(true)
    else onClose()
  }, [dirty, onClose])

  const set = useCallback(<K extends keyof LectureDraft>(key: K, value: LectureDraft[K]) => {
    if (readOnly) return
    setDraft((prev) => {
      const next = { ...prev, [key]: value }
      // Auto-generate slug từ title nếu đang tạo mới và chưa có id
      if (key === 'title' && !isEdit && !prev.id.trim()) {
        next.id = slugifyAuthoringId(value as string)
      }
      return next
    })
  }, [isEdit, readOnly])

  const updateAccess = useCallback((patch: Partial<LessonAccessConfig>) => {
    if (readOnly) return
    setDraft((d) => ({
      ...d,
      access: {
        mode: d.access?.mode ?? 'inherit',
        minPlanTier: d.access?.minPlanTier ?? 0,
        trialBadge: d.access?.trialBadge ?? 'Học thử',
        lockedReason: d.access?.lockedReason ?? '',
        ...patch,
      },
    }))
  }, [readOnly])

  const updateLearnCard = useCallback((index: number, patch: Partial<LearnCardDraft>) => {
    if (readOnly) return
    setDraft((previous) => {
      let cards = previous.learnCards
      if (cards.length <= index) {
        const defaults = lessonFormat === 'aiki-rule-3steps' ? createAikiRule3StepsCards() : createAikiRuleLearnCards()
        cards = defaults.map((d, i) => cards[i] ?? d)
      }
      const learnCards = cards.map((card, cardIndex) => cardIndex === index ? { ...card, ...patch } : card)
      const conceptCard = learnCards.find((card) => card.kind === 'concept')
      const exampleCard = learnCards.find((card) => card.kind === 'example')
      const next = { ...previous, learnCards, concept: conceptCard?.body ?? previous.concept, example: exampleCard?.body ?? previous.example }
      if (isIslandCourse && index === 0 && (patch.imageUrl !== undefined || patch.mee !== undefined)) {
        const journey = previous.sixStageJourney || resolveIslandSixStageJourney(previous as any)
        const sixStageJourney = {
          ...journey,
          stage1_goal: {
            ...journey.stage1_goal,
            imageUrl: patch.imageUrl ?? journey.stage1_goal.imageUrl,
            speech: patch.mee?.readText ?? journey.stage1_goal.speech,
          },
        }
        return { ...next, sixStageJourney, metadata: { ...previous.metadata, sixStageJourney } }
      }
      return next
    })
  }, [isIslandCourse, readOnly])

  const uploadLearnCardMedia = useCallback(async (
    index: number,
    field: 'videoUrl' | 'imageUrl' | 'audioUrl' | 'optionImageA' | 'optionImageB' | 'compareLeft' | 'compareRight',
    file: File,
  ) => {
    if (readOnly) return
    const isOptionOrCompare = ['optionImageA', 'optionImageB', 'compareLeft', 'compareRight'].includes(field)
    const isImage = field === 'imageUrl' || isOptionOrCompare
    const limits: Record<typeof field, number> = {
      videoUrl: 250 * 1024 * 1024,
      imageUrl: 10 * 1024 * 1024,
      audioUrl: 25 * 1024 * 1024,
      optionImageA: 10 * 1024 * 1024,
      optionImageB: 10 * 1024 * 1024,
      compareLeft: 10 * 1024 * 1024,
      compareRight: 10 * 1024 * 1024,
    }
    const prefix = field === 'videoUrl' ? 'video/' : field === 'audioUrl' ? 'audio/' : 'image/'
    if (!file.type.startsWith(prefix) || file.size > limits[field]) {
      showToast(field === 'videoUrl' ? 'Video cần đúng định dạng và tối đa 250 MB.' : isImage ? 'Ảnh cần đúng định dạng và tối đa 10 MB.' : 'Audio cần đúng định dạng và tối đa 25 MB.', 'error')
      return
    }
    const uploadKey = `${index}:${field}`
    setUploadingStageMedia(uploadKey)
    try {
      const asset = await uploadCmsCourseMedia({ file, purpose: `aiki_rule_${field}`, questId: lecture?.id })
      if (field === 'audioUrl') {
        const current = draft.learnCards[index]
        updateLearnCard(index, { mee: { readText: current?.mee?.readText ?? current?.body ?? '', audioUrl: asset.url, voiceProvider: 'vertex', gesture: current?.mee?.gesture ?? 'presentation', autoRead: current?.mee?.autoRead ?? false } })
      } else if (field === 'optionImageA') {
        const current = draft.learnCards[index]
        const currentOptions = [...(current?.optionImages || ['', ''])]
        currentOptions[0] = asset.url
        updateLearnCard(index, { optionImages: currentOptions })
      } else if (field === 'optionImageB') {
        const current = draft.learnCards[index]
        const currentOptions = [...(current?.optionImages || ['', ''])]
        currentOptions[1] = asset.url
        updateLearnCard(index, { optionImages: currentOptions })
      } else if (field === 'compareLeft') {
        const current = draft.learnCards[index]
        updateLearnCard(index, { compareImages: { left: asset.url, right: current?.compareImages?.right || '' } })
      } else if (field === 'compareRight') {
        const current = draft.learnCards[index]
        updateLearnCard(index, { compareImages: { left: current?.compareImages?.left || '', right: asset.url } })
      } else {
        updateLearnCard(index, { [field]: asset.url })
      }
      showToast('Đã tải media lên StoryMee.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không tải được media.', 'error')
    } finally {
      setUploadingStageMedia(null)
    }
  }, [draft.learnCards, lecture?.id, readOnly, showToast, updateLearnCard])

  const uploadAdditionalImageItem = useCallback(async (stageIndex: number, imgIndex: number, file: File) => {
    if (readOnly) return
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      showToast('Ảnh cần đúng định dạng và tối đa 10 MB.', 'error')
      return
    }
    const uploadKey = `${stageIndex}:additionalImage:${imgIndex}`
    setUploadingStageMedia(uploadKey)
    try {
      const asset = await uploadCmsCourseMedia({ file, purpose: 'aiki_rule_additional', questId: lecture?.id })
      const current = draft.learnCards[stageIndex]
      const list = [...(current?.additionalImages || [])]
      if (list[imgIndex]) {
        list[imgIndex] = { ...list[imgIndex], url: asset.url }
        updateLearnCard(stageIndex, { additionalImages: list })
      }
      showToast('Đã tải ảnh minh họa lên.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không tải được ảnh.', 'error')
    } finally {
      setUploadingStageMedia(null)
    }
  }, [draft.learnCards, lecture?.id, readOnly, showToast, updateLearnCard])

  const updateStageBlocks = useCallback((stageIndex: number, newBlocks: StageBlockItem[]) => {
    if (readOnly) return
    const currentCard = draft.learnCards[stageIndex]
    if (!currentCard) return

    const uniqueModules = Array.from(new Set(newBlocks.map((b) => b.type)))
    const patch: Partial<LearnCardDraft> = {
      contentBlocks: newBlocks,
      enabledModules: uniqueModules,
    }

    const firstTextBlock = newBlocks.find((b) => b.type === 'text' || b.type === 'layout-text')
    if (firstTextBlock) {
      if (firstTextBlock.title !== undefined) patch.title = firstTextBlock.title
      if (firstTextBlock.body !== undefined) patch.body = firstTextBlock.body
      if (firstTextBlock.tip !== undefined) patch.tip = firstTextBlock.tip
    }

    updateLearnCard(stageIndex, patch)

    if (isIslandCourse && stageIndex === 0) {
      const textBlock = newBlocks.find((block) => block.id === `${COURSE_GOAL_BLOCK_PREFIX}text`)
      const keysBlock = newBlocks.find((block) => block.id === `${COURSE_GOAL_BLOCK_PREFIX}four-keys` || block.type === 'layout-four-keys')
      const imageBlock = newBlocks.find((block) => block.id === `${COURSE_GOAL_BLOCK_PREFIX}image`)
      const voiceBlock = newBlocks.find((block) => block.id === `${COURSE_GOAL_BLOCK_PREFIX}voice`)
      updateSixStage((journey) => ({
        ...journey,
        stage1_goal: {
          ...journey.stage1_goal,
          title: textBlock?.title ?? journey.stage1_goal.title,
          goalText: textBlock?.body ?? '',
          imageUrl: imageBlock?.imageUrl ?? journey.stage1_goal.imageUrl,
          speech: voiceBlock?.readText ?? journey.stage1_goal.speech,
          keyPoints: keysBlock?.visualItems?.slice(0, 4).map((item) => `${item.label}${item.sub ? ` (${item.sub})` : ''}: ${item.text}`) ?? [],
        },
      }))
    }
    if (isIslandCourse && stageIndex === 1) {
      const questionBlock = newBlocks.find((block) => block.id === `${COURSE_CONFIRM_BLOCK_PREFIX}question` || block.type === 'text')
      const optionBlocks = newBlocks.filter((block) => block.id.startsWith(COURSE_CONFIRM_BLOCK_PREFIX + 'option-') || block.type === 'layout-confirm-option' || block.type === 'layout-four-keys')
      updateSixStage((journey) => ({
        ...journey,
        stage2_confirmGoal: {
          ...journey.stage2_confirmGoal,
          question: questionBlock?.body ?? journey.stage2_confirmGoal.question,
          explanation: questionBlock?.tip ?? journey.stage2_confirmGoal.explanation,
          correctIndex: Math.max(0, optionBlocks.findIndex((block) => block.isCorrect)),
          options: optionBlocks.map((block, index) => ({
            id: block.id || `confirm-${index + 1}`,
            text: block.title ? (block.body && block.body !== block.title && block.body !== `Phương án ${String.fromCharCode(65 + index)}` ? `${block.title}: ${block.body}` : block.title) : `Bộ chìa khóa ${String.fromCharCode(65 + index)}`,
            imageUrl: block.imageUrl || '',
          })),
        },
      }))
    }
  }, [draft.learnCards, isIslandCourse, readOnly, updateLearnCard, updateSixStage])

  const updateBlockItem = useCallback((stageIndex: number, blockId: string, blockPatch: Partial<StageBlockItem>) => {
    if (readOnly) return
    const card = draft.learnCards[stageIndex]
    if (!card) return
    const blocks = getStageBlocks(card, stageIndex)
    const newBlocks = blocks.map((b) => (b.id === blockId ? { ...b, ...blockPatch } : b))
    updateStageBlocks(stageIndex, newBlocks)
  }, [draft.learnCards, readOnly, updateStageBlocks])

  const moveBlock = useCallback((stageIndex: number, blockIndex: number, direction: -1 | 1) => {
    if (readOnly) return
    const card = draft.learnCards[stageIndex]
    if (!card) return
    const blocks = [...getStageBlocks(card, stageIndex)]
    const targetIndex = blockIndex + direction
    if (targetIndex < 0 || targetIndex >= blocks.length) return
    const temp = blocks[blockIndex]
    blocks[blockIndex] = blocks[targetIndex]
    blocks[targetIndex] = temp
    updateStageBlocks(stageIndex, blocks)
  }, [draft.learnCards, readOnly, updateStageBlocks])

  const removeBlock = useCallback((stageIndex: number, blockId: string) => {
    if (readOnly) return
    const card = draft.learnCards[stageIndex]
    if (!card) return
    const blocks = getStageBlocks(card, stageIndex)
    const newBlocks = blocks.filter((b) => b.id !== blockId)
    updateStageBlocks(stageIndex, newBlocks)
    showToast('Đã xóa khối nội dung!', 'info')
  }, [draft.learnCards, readOnly, showToast, updateStageBlocks])

  const removeModuleFromStage = useCallback((stageIndex: number, modId: string) => {
    if (readOnly) return
    const card = draft.learnCards[stageIndex]
    if (!card) return
    const blocks = getStageBlocks(card, stageIndex)
    const newBlocks = blocks.filter((b) => b.type !== modId && b.id !== modId)
    updateStageBlocks(stageIndex, newBlocks)
  }, [draft.learnCards, readOnly, updateStageBlocks])

  const handleAddModule = useCallback((blockId: string, explicitStageIndex?: number, insertIndex?: number) => {
    if (readOnly) return

    if (isIslandCourse && blockId === 'voice') {
      showToast('Khối trợ giảng Mèo AIKI chỉ dùng cho Quy tắc AIKI, không dùng trong Khóa học 6 chặng.', 'info')
      return
    }

    // 1. Nếu là Game Engine Bài Học
    if (['data-runner', 'truth-patrol', 'battle-math', 'blockly'].includes(blockId)) {
      const defaultInstructions: Record<string, string> = {
        'data-runner': 'Thu thập các gói dữ liệu sạch và né tránh thông tin sai lệch!',
        'truth-patrol': 'Nhận diện tin tức thật giả và bắn hạ thiên thạch fake news!',
        'battle-math': 'Giải cứu các con số và đối đầu thử thách toán học vui nhộn!',
        'blockly': 'Kéo thả các khối lệnh tư duy logic để giúp Mèo AIKI vượt mê cung!',
      }
      const gameTitles: Record<string, string> = {
        'data-runner': 'Data Runner',
        'truth-patrol': 'Truth Patrol',
        'battle-math': 'Battle Math',
        'blockly': 'Blockly Code',
      }
      setDraft((prev) => ({
        ...prev,
        gameType: blockId,
        gameInstruction: prev.gameInstruction || defaultInstructions[blockId] || 'Hoàn thành thử thách mini-game cùng Mèo AIKI!',
      }))
      if (lessonFormat === 'standard') {
        setActiveSection('game')
      }
      showToast(`Đã chọn Game Engine: ${gameTitles[blockId] || blockId}`, 'success')
      return
    }

    // 1.1. Nếu là Creative Engine Thực Hành Sáng Tạo (7 Chế Độ Game Thực Hành)
    const CREATIVE_ENGINE_BLOCK_MAP: Record<string, { mode: string; title: string }> = {
      'practice-ai-studio': { mode: 'magic-keys', title: '4 Chìa Khóa Ma Thuật' },
      'practice-style-prism': { mode: 'style-prism', title: 'Lăng Kính Phù Thủy' },
      'practice-prompt-doctor': { mode: 'prompt-doctor', title: 'Bác Sĩ Câu Lệnh' },
      'practice-layer-stacking': { mode: 'layer-stacking', title: '3 Tầng Sân Khấu' },
      'practice-identity-lock': { mode: 'identity-lock', title: 'Khóa Mật Mã & Biểu Cảm' },
      'practice-card-forge': { mode: 'card-forge', title: 'Xưởng Đúc Thẻ Bài TCG' },
      'practice-creative-notebook': { mode: 'creative-notebook', title: 'Sổ Tay Sáng Tạo Ba Lô' },
    }

    if (CREATIVE_ENGINE_BLOCK_MAP[blockId]) {
      const { mode, title } = CREATIVE_ENGINE_BLOCK_MAP[blockId]
      updateSixStage((j) => ({
        ...j,
        stage5_practice: {
          ...j.stage5_practice,
          creativeEngineMode: mode,
          ...(mode === 'creative-notebook' ? { practiceParts: [] } : {}),
        },
      }))
      setActiveSection('stage-4')
      showToast(`Đã chuyển sang Game Engine Thực Hành: ${title}!`, 'success')
      return
    }

    // 2. Xác định stageIndex mục tiêu
    let targetStageIndex = explicitStageIndex
    if (targetStageIndex === undefined) {
      if (activeSection.startsWith('stage-')) {
        targetStageIndex = parseInt(activeSection.replace('stage-', ''), 10)
      } else {
        targetStageIndex = 0
      }
    }

    const card = draft.learnCards[targetStageIndex]
    if (!card) return
    const stageBlocks = getStageBlocks(card, targetStageIndex)
    const timestamp = Date.now()
    let newBlock: StageBlockItem | null = null

    if (blockId === 'text' || blockId === 'layout-text' || blockId === 'course-text') {
      newBlock = {
        id: blockId === 'course-text' && isIslandCourse && targetStageIndex === 1 ? `${COURSE_CONFIRM_BLOCK_PREFIX}question-${timestamp}` : `blk-text-${timestamp}`,
        type: 'text',
        title: `Đoạn văn bản ${stageBlocks.length + 1}`,
        body: '',
      }
      showToast('Đã thêm khối Đoạn văn bản mới!', 'success')
    } else if (blockId === 'practice-brief') {
      newBlock = {
        id: `blk-practice-brief-${timestamp}`,
        type: 'layout-callout',
        title: 'Đề bài thực hành',
        body: 'Mô tả sản phẩm học sinh cần hoàn thành.',
        tip: 'Liệt kê các chi tiết bắt buộc để học sinh tự kiểm tra.',
      }
      showToast('Đã thêm block Đề bài thực hành!', 'success')
    } else if (blockId === 'practice-workflow') {
      newBlock = {
        id: `blk-practice-workflow-${timestamp}`,
        type: 'layout-storyboard',
        title: 'Quy trình 4 bước thực hành',
        visualItems: Array.from({ length: 4 }, (_, index) => ({ label: `Bước ${index + 1}`, text: 'Nhập hướng dẫn thao tác...', tone: (['brand', 'sky', 'mint', 'sun'] as const)[index] })),
      }
      showToast('Đã thêm block Quy trình 4 bước!', 'success')
    } else if (blockId === 'practice-ai-studio') {
      newBlock = {
        id: `blk-practice-studio-${timestamp}`,
        type: 'layout-four-keys',
        title: 'Xưởng tạo tranh AI · 4 chìa khóa',
        body: 'Học sinh ghép bốn thành phần để tạo câu lệnh và sinh sản phẩm.',
        visualItems: goalKeyItems([]),
      }
      showToast('Đã thêm Game Engine Xưởng tạo tranh AI!', 'success')
    } else if (blockId === 'layout-callout') {
      newBlock = {
        id: `blk-callout-${timestamp}`,
        type: 'layout-callout',
        title: 'Hộp Ghi Nhớ Nổi Bật',
        tip: '💡 Bí kíp bỏ túi: Hãy luôn tự tay thêm ý tưởng của riêng con!',
      }
      showToast('Đã thêm Hộp Ghi Nhớ Nổi Bật!', 'success')
    } else if (blockId === 'layout-formula') {
      newBlock = {
        id: `blk-formula-${timestamp}`,
        type: 'layout-formula',
        title: 'Công Thức KaTeX',
        formula: '$$\\text{Ý tưởng con} + \\text{Sức mạnh AI} = \\text{Tác phẩm độc nhất}$$',
      }
      showToast('Đã thêm Khối Công Thức KaTeX!', 'success')
    } else if (blockId === 'layout-split') {
      newBlock = {
        id: `blk-split-${timestamp}`,
        type: 'layout-split',
        title: 'Bố cục 2 Cột Chữ + Media',
        body: 'Nhập nội dung giải thích ở đây...',
        imageUrl: '',
      }
      showToast('Đã thêm Bố cục 2 Cột Chữ + Media!', 'success')
    } else if (blockId === 'layout-two-text') {
      newBlock = {
        id: `blk-two-text-${timestamp}`,
        type: 'layout-split',
        title: '2 Cột: 2 Văn Bản Song Song',
        columns: 2,
        body: 'Nội dung cột trái...',
        tip: 'Nội dung cột phải...',
        imageUrl: '',
      }
      showToast('Đã thêm Bố cục 2 Cột Văn Bản!', 'success')
    } else if (blockId === 'layout-grid') {
      newBlock = {
        id: `blk-grid-${timestamp}`,
        type: 'layout-grid',
        title: 'Lưới 3 Ô Thẻ',
        visualItems: [
          { label: 'Ý tưởng 1', text: 'Chi tiết 1', tone: 'brand' },
          { label: 'Ý tưởng 2', text: 'Chi tiết 2', tone: 'sky' },
          { label: 'Ý tưởng 3', text: 'Chi tiết 3', tone: 'mint' },
        ],
      }
      showToast('Đã thêm Bố cục Lưới 3 Ô Thẻ!', 'success')
    } else if (blockId === 'layout-four-keys' || blockId === 'course-four-keys' || blockId === 'layout-confirm-option') {
      if (isIslandCourse && targetStageIndex === 1) {
        const optionBlocks = stageBlocks.filter((b) => b.type === 'layout-confirm-option' || b.id.startsWith(COURSE_CONFIRM_BLOCK_PREFIX + 'option-'))
        const optLetter = String.fromCharCode(65 + optionBlocks.length)
        newBlock = {
          id: `${COURSE_CONFIRM_BLOCK_PREFIX}option-${timestamp}`,
          type: 'layout-confirm-option',
          title: `Bộ chìa khóa ${optLetter}`,
          body: `Phương án ${optLetter}`,
          imageUrl: '',
          isCorrect: optionBlocks.length === 0,
          visualItems: [],
        }
        showToast(`Đã thêm Phương án ${optLetter}!`, 'success')
      } else {
        newBlock = createFourKeysBlock(`blk-four-keys-${timestamp}`)
        showToast('Đã thêm template Bốn chiếc chìa khóa!', 'success')
      }
    } else if (blockId === 'layout-storyboard') {
      newBlock = {
        id: `blk-storyboard-${timestamp}`,
        type: 'layout-storyboard',
        title: 'Chuỗi Storyboard',
        visualItems: [
          { label: 'Cảnh 1', text: 'Mở đầu', tone: 'brand' },
          { label: 'Cảnh 2', text: 'Diễn biến', tone: 'sky' },
          { label: 'Cảnh 3', text: 'Kết thúc', tone: 'mint' },
        ],
      }
      showToast('Đã thêm Khối Storyboard 3 Cảnh!', 'success')
    } else if (blockId === 'voice') {
      newBlock = { id: `blk-voice-${timestamp}`, type: 'voice' }
      if (!card.mee) {
        updateLearnCard(targetStageIndex, {
          mee: { readText: card.body || '', audioUrl: '', voiceProvider: 'vertex', gesture: 'presentation', autoRead: true },
        })
      }
      showToast('Đã thêm Khối Mèo AIKI & Lipsync!', 'success')
    } else if (blockId === 'video') {
      newBlock = { id: `blk-video-${timestamp}`, type: 'video' }
      showToast('Đã thêm Khối Video bài giảng!', 'success')
    } else if (blockId === 'versus-ab' || blockId === 'quiz') {
      newBlock = { id: `blk-versus-ab-${timestamp}`, type: 'versus-ab' }
      if (!card.optionImages || card.optionImages.length < 2) {
        updateLearnCard(targetStageIndex, {
          optionImages: ['', ''],
          optionLabels: ['Ảnh A: Bức tranh của Zico', 'Ảnh B: Bức tranh của Sonet'],
          optionDescs: ['Siêu anh hùng quen thuộc (ai cũng vẽ được)', 'Siêu anh hùng bố cầm vợt muỗi (độc nhất của riêng con)'],
        })
      }
      showToast('Đã thêm Khối 2 Ảnh Đối Đầu A/B!', 'success')
    } else if (blockId === 'dialogue') {
      newBlock = { id: `blk-dialogue-${timestamp}`, type: 'dialogue' }
      if (!card.dialogueLines || card.dialogueLines.length === 0) {
        updateLearnCard(targetStageIndex, {
          dialogueLines: [
            { id: `d-${timestamp}-1`, speaker: 'zico', role: 'left', text: 'Của tớ đẹp hơn!' },
            { id: `d-${timestamp}-2`, speaker: 'sonet', role: 'right', text: 'Không, của tớ đúng hơn!' },
            { id: `d-${timestamp}-3`, speaker: 'aki', role: 'center', text: 'DỪNG LẠIIII...! Các cậu ơi, hãy giúp tớ vụ này!' },
          ],
        })
      }
      showToast('Đã thêm Khối Kịch Bản Phân Vai Comic!', 'success')
    } else if (blockId === 'compare' || blockId === 'ordering') {
      newBlock = { id: `blk-compare-${timestamp}`, type: 'compare' }
      if (!card.compareData) {
        updateLearnCard(targetStageIndex, {
          compareData: {
            leftTitle: 'Kho Dữ Liệu Của AI',
            leftText: 'AI chỉ lấy những hình ảnh quen thuộc trong kho hàng ngàn mẫu có sẵn. Ai gõ câu giống nhau thì kết quả cũng giống hệt nhau.',
            leftImage: '',
            rightTitle: 'Bộ Não Sáng Tạo Của Con',
            rightText: 'Chỉ có con mới có kỷ niệm riêng, cảm xúc thật, gia đình và sự tưởng tượng độc đáo mà AI không thể tự nghĩ ra được!',
            rightImage: '',
          },
        })
      }
      showToast('Đã thêm Khối Bảng So Sánh 2 Cột!', 'success')
    } else if (blockId === 'poster' || blockId === 'pledge') {
      newBlock = { id: `blk-poster-${timestamp}`, type: 'poster' }
      if (blockId === 'pledge') {
        updateLearnCard(targetStageIndex, {
          body: '🛡️ BẢN CAM KẾT HIỆP SĨ: Con cam kết sử dụng AI an toàn, sáng tạo và trung thực!',
          tip: 'Luôn kiểm chứng thông tin và tự tay thêm dấu ấn riêng của con!',
        })
      }
      showToast('Đã thêm Khối Poster Quy Tắc Vàng!', 'success')
    } else if (blockId === 'images' || blockId === 'gallery') {
      newBlock = { id: `blk-images-${timestamp}`, type: 'images' }
      if (!card.additionalImages || card.additionalImages.length === 0) {
        updateLearnCard(targetStageIndex, {
          additionalImages: [{ id: `img-${timestamp}`, url: '', alt: 'Minh họa chặng', caption: '' }],
        })
      }
      showToast('Đã thêm Khối Bộ Sưu Tập Ảnh!', 'success')
    }

    if (newBlock) {
      const nextBlocks = [...stageBlocks]
      if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= nextBlocks.length) {
        nextBlocks.splice(insertIndex, 0, newBlock)
      } else {
        nextBlocks.push(newBlock)
      }
      updateStageBlocks(targetStageIndex, nextBlocks)
    }
  }, [activeSection, draft.learnCards, isIslandCourse, lessonFormat, readOnly, showToast, updateLearnCard, updateStageBlocks])

  const addModuleToStage = useCallback((stageIndex: number, modId: string) => {
    handleAddModule(modId, stageIndex)
  }, [handleAddModule])

  useEffect(() => {
    const handleFeatureBlockEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ blockId: string }>
      if (customEvent.detail?.blockId) {
        handleAddModule(customEvent.detail.blockId)
      }
    }
    window.addEventListener('aikids:add-feature-block', handleFeatureBlockEvent)
    return () => window.removeEventListener('aikids:add-feature-block', handleFeatureBlockEvent)
  }, [handleAddModule])

  const addLearnCard = useCallback(() => {
    if (readOnly) return
    setDraft((previous) => ({
      ...previous,
      learnCards: [...previous.learnCards, {
        id: `learn-${Date.now().toString(36)}`,
        title: 'Khối khám phá mới',
        body: '',
        tip: '',
        kind: 'example',
        layout: 'text',
        visualItems: [],
        mee: { readText: '', gesture: 'presentation', autoRead: false },
      }],
    }))
  }, [readOnly])

  const applyAikiRuleTemplate = useCallback(() => {
    if (readOnly) return
    setDraft((previous) => ({
      ...previous,
      learnCards: createAikiRuleLearnCards(),
      concept: '',
      example: '',
    }))
    setLessonFormat('aiki-rule-5steps')
    setActiveSection('stage-0')
  }, [readOnly])

  const moveLearnCard = useCallback((index: number, direction: -1 | 1) => {
    if (readOnly) return
    setDraft((previous) => {
      const target = index + direction
      if (target < 0 || target >= previous.learnCards.length) return previous
      const learnCards = [...previous.learnCards]
      const current = learnCards[index]
      const adjacent = learnCards[target]
      if (!current || !adjacent) return previous
      learnCards[index] = adjacent
      learnCards[target] = current
      return { ...previous, learnCards }
    })
  }, [readOnly])

  const removeLearnCard = useCallback((index: number) => {
    if (readOnly) return
    setDraft((previous) => previous.learnCards.length <= 2
      ? previous
      : { ...previous, learnCards: previous.learnCards.filter((_, cardIndex) => cardIndex !== index) })
  }, [readOnly])

  const updateLearnVisualItem = useCallback((cardIndex: number, itemIndex: number, patch: Partial<LearnCardDraft['visualItems'][number]>) => {
    if (readOnly) return
    setDraft((previous) => ({
      ...previous,
      learnCards: previous.learnCards.map((card, index) => index !== cardIndex ? card : {
        ...card,
        visualItems: card.visualItems.map((item, visualIndex) => visualIndex === itemIndex ? { ...item, ...patch } : item),
      }),
    }))
  }, [readOnly])

  const addLearnVisualItem = useCallback((cardIndex: number) => {
    if (readOnly) return
    const tones: NonNullable<LearnCardDraft['visualItems'][number]['tone']>[] = ['sky', 'mint', 'sun', 'coral', 'brand']
    setDraft((previous) => ({
      ...previous,
      learnCards: previous.learnCards.map((card, index) => index !== cardIndex ? card : {
        ...card,
        visualItems: [...card.visualItems, {
          label: `Ví dụ ${card.visualItems.length + 1}`,
          text: '',
          tone: tones[card.visualItems.length % tones.length],
        }],
      }),
    }))
  }, [readOnly])

  const removeLearnVisualItem = useCallback((cardIndex: number, itemIndex: number) => {
    if (readOnly) return
    setDraft((previous) => ({
      ...previous,
      learnCards: previous.learnCards.map((card, index) => index !== cardIndex ? card : {
        ...card,
        visualItems: card.visualItems.filter((_, visualIndex) => visualIndex !== itemIndex),
      }),
    }))
  }, [readOnly])

  // Xác định game hiện tại cần cấu hình gì
  const activeGameTypes = draft.gameMode === 'student_choice' ? draft.gameAllowedTypes : [draft.gameType]
  const needsQuizConfig = activeGameTypes.some((t) => SELF_CONTAINED_QUIZ_GAMES.includes(t))
  const needsCatalogConfig = activeGameTypes.some((t) => CATALOG_GAMES.includes(t))
  const catalogGameType = activeGameTypes.find((t) => CATALOG_GAMES.includes(t)) as 'data-runner' | 'truth-patrol' | undefined

  // WHY: quizQuestions được truyền vào buildLectureGameConfig để lưu DB
  // (không tách state, không share giữa các bài học)
  function buildGameConfigForSave() {
    const questionsForSave = needsQuizConfig && quizQuestions.length > 0
      ? quizQuestions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          options: q.options,
          answer: q.answer,
          why: q.explanation,
        }))
      : undefined
    return buildLectureGameConfig(draft, questionsForSave)
  }

  async function handleSave() {
    if (readOnly) return
    const missing = readiness.steps.flatMap((s) => s.missing)
    if (missing.length > 0) {
      const firstIncomplete = readiness.steps.find((step) => !step.complete)
      if (firstIncomplete?.id === 'basics') setActiveSection('basics')
      else if (firstIncomplete?.id === 'content') {
        if (lessonFormat === 'aiki-rule-5steps') {
          const firstIncompleteStage = [0, 1, 2, 3, 4].find((idx) => {
            const card = draft.learnCards[idx]
            return !card || card.title.trim().length < 2 || (card.body.trim().length < 10 && (card.mee?.readText?.trim().length ?? 0) < 10)
          })
          setActiveSection(`stage-${firstIncompleteStage ?? 0}` as Section)
        } else {
          setActiveSection('content')
        }
      }
      else if (firstIncomplete?.id === 'game') setActiveSection('game')
      else if (firstIncomplete?.id === 'practice') setActiveSection('practice')
      else if (firstIncomplete?.id === 'check') setActiveSection('check')
      showToast(`Còn thiếu: ${missing.slice(0, 3).join(', ')}`, 'error')
      return
    }

    setSaving(true)
    try {
      const gameConfig = buildGameConfigForSave()
      const baseJourney = isIslandCourse ? (draft.sixStageJourney || resolveIslandSixStageJourney(draft as any)) : undefined
      const finalJourney = baseJourney ? {
        ...baseJourney,
        stageBlockEditorVersion: 3,
        stageContentBlocks: Object.fromEntries(
          draft.learnCards.slice(0, 6).map((card, index) => [`stage-${index}`, card.contentBlocks ?? []])
        ),
      } : undefined
      if (finalJourney?.stage5_practice) {
        const p = finalJourney.stage5_practice
        if ((p.creativeEngineMode || 'magic-keys') === 'magic-keys' && p.fourKeysOptions) {
          const fk = p.fourKeysOptions
          const autoLocked = [fk.what?.[0], fk.how?.[0], fk.action?.[0], fk.where?.[0]].filter(Boolean) as string[]
          if (autoLocked.length > 0 && (!p.lockedFeatures || p.lockedFeatures.length === 0)) {
            p.lockedFeatures = autoLocked
          }
        }
        if (!p.badge?.trim()) {
          p.badge = getAutoBadge()
        }
      }

      // ── Synchronize station reward badge ──
      const currentJourney = finalJourney || draft.sixStageJourney
      const rewardName = currentJourney?.stage6_completion?.rewardBadge?.name?.trim() || draft.reward?.trim() || ('Huy hiệu ' + draft.title).trim()
      if (finalJourney?.stage6_completion) {
        if (!finalJourney.stage6_completion.rewardBadge?.name?.trim()) {
          finalJourney.stage6_completion = {
            ...finalJourney.stage6_completion,
            rewardBadge: {
              ...(finalJourney.stage6_completion.rewardBadge || { iconUrl: '', stars: 3, xp: 50 }),
              name: rewardName,
            },
          }
        }
      }

      const payload = {
        courseId,
        id: draft.id,
        slug: (draft as any).slug || draft.id,
        title: draft.title,
        skill: draft.skill || draft.title,
        hook: draft.hook || draft.title,
        access: draft.access,
        goals: draft.goalsText ? draft.goalsText.split('\n').map((s) => s.trim()).filter(Boolean) : [draft.title],
        concept: draft.concept,
        example: draft.example,
        learnCards: serializeLearnCardsForHub(draft.learnCards),
        videoUrl: isIslandCourse ? (finalJourney?.stage3_video?.videoUrl || draft.videoUrl || null) : (draft.videoUrl || null),
        reward: rewardName,
        duration: draft.duration,
        practiceKind: draft.practiceKind,
        lessonFormat: isIslandCourse ? 'aiki-island-6steps' : lessonFormat,
        sixStageJourney: finalJourney,
        metadata: {
          ...(draft as any).metadata,
          reward: rewardName,
          slug: (draft as any).slug || draft.id,
          sixStageJourney: finalJourney,
          access: draft.access,
        },
        gameType: draft.gameType,
        gameConfig: {
          ...gameConfig,
          lessonFormat: isIslandCourse ? 'aiki-island-6steps' : lessonFormat,
          sixStageJourney: finalJourney,
        },
        gameInstruction: draft.gameInstruction,
        gameOutcome: draft.gameOutcome,
        gameCards: draft.gameCardsText.split('\n').map((s) => s.trim()).filter(Boolean),
        practiceInstruction: draft.practiceInstruction,
        product: draft.product,
        practiceSteps: draft.practiceStepsText.split('\n').map((s) => s.trim()).filter(Boolean),
        successCriteria: draft.successCriteriaText.split('\n').map((s) => s.trim()).filter(Boolean),
        reflectionPrompt: draft.reflectionPrompt,
        practiceConfig: draft.practiceKind === 'ordering' ? {
          activityType: 'ordering',
          prompt: draft.practiceInstruction,
          cards: draft.practiceConfigText.split(/\r?\n/).map((line, index) => {
            const [title, ...description] = line.split('|')
            return { id: `card-${index + 1}`, title: title?.trim() ?? '', description: description.join('|').trim() }
          }).filter((card) => card.title && card.description),
        } : undefined,
        // WHY: checkQuestions thay thế check fields cũ — nhiều câu, nhiều đáp án
        checkQuestions: draft.checkQuestions,
        checkQuestion: draft.checkQuestions[0]?.prompt ?? draft.checkQuestion,
        checkOptions: draft.checkQuestions.length > 0
          ? draft.checkQuestions[0].options
          : [draft.checkOption1, draft.checkOption2, draft.checkOption3],
        correctIndex: draft.checkQuestions.length > 0
          ? draft.checkQuestions[0].answer
          : parseInt(draft.correctIndex) || 0,
        checkExplain: draft.checkQuestions[0]?.explain ?? draft.checkExplain,
      }

      if (isEdit) {
        await api(`/api/teacher/lectures/${lecture.id}`, {
          method: 'PATCH', body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        })
        showToast('✅ Đã cập nhật bài học!', 'success')
      } else {
        await api('/api/teacher/lectures', {
          method: 'POST', body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        })
        showToast('✅ Đã tạo bài học mới!', 'success')
      }
      onSaved()
      window.sessionStorage.removeItem(draftStorageKey)
      onClose()
    } catch (err) {
      showToast(`Lỗi: ${err instanceof Error ? err.message : 'Không thể lưu'}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Sync quizQuestions từ existing gameConfig khi load lecture
  useState(() => {
    if (lecture) {
      try {
        const cfg = JSON.parse(lecture.gameStructuredText || '{}') as Record<string, unknown>
        if (Array.isArray(cfg.quizQuestions)) {
          const questions = (cfg.quizQuestions as Record<string, unknown>[]).map((q, i): EditableQuestion => ({
            id: typeof q.id === 'string' ? q.id : `q-${i}`,
            prompt: typeof q.prompt === 'string' ? q.prompt : '',
            options: Array.isArray(q.options) ? q.options as string[] : ['', ''],
            answer: typeof q.answer === 'number' ? q.answer : 0,
            explanation: typeof q.why === 'string' ? q.why : '',
            imageUrl: null,
            tags: [],
            ageMin: 6, ageMax: 11, difficulty: 'steady',
          }))
          if (questions.length > 0) setQuizQuestions(questions)
        }
      } catch {
        // Ignore parse errors — fallback về rỗng
      }
    }
  })

  const sectionStatus = (sectionId: Section) => {
    if (isIslandCourse && sectionId.startsWith('stage-')) {
      const idx = parseInt(sectionId.replace('stage-', ''), 10)
      const j = draft.sixStageJourney || resolveIslandSixStageJourney(draft as any)
      if (idx === 0) return Boolean(j.stage1_goal.title && j.stage1_goal.goalText)
      if (idx === 1) return Boolean(j.stage2_confirmGoal.question && j.stage2_confirmGoal.options.length >= 2)
      if (idx === 2) return Boolean(j.stage3_video.videoUrl)
      if (idx === 3) return Boolean(j.stage4_quiz.questions.length > 0)
      if (idx === 4) return Boolean(j.stage5_practice.subjectName)
      if (idx === 5) return Boolean(j.stage6_completion.title)
      return false
    }
    if (sectionId.startsWith('stage-')) {
      const idx = parseInt(sectionId.replace('stage-', ''), 10)
      const card = draft.learnCards[idx]
      return Boolean(card && card.title.trim().length >= 2 && (card.body.trim().length >= 10 || (card.mee?.readText?.trim().length ?? 0) >= 10))
    }
    const step = readiness.steps.find((s) => {
      if (sectionId === 'basics') return s.id === 'basics'
      if (sectionId === 'content') return s.id === 'content'
      if (sectionId === 'game') return s.id === 'game'
      if (sectionId === 'practice') return s.id === 'practice'
      if (sectionId === 'check') return s.id === 'check'
      return false
    })
    return step?.complete ?? false
  }

  const sectionMissing = (sectionId: Section) => {
    if (isIslandCourse && sectionId.startsWith('stage-')) {
      const idx = parseInt(sectionId.replace('stage-', ''), 10)
      const j = draft.sixStageJourney || resolveIslandSixStageJourney(draft as any)
      const missing: string[] = []
      if (idx === 0) {
        if (!j.stage1_goal.title) missing.push('Tiêu đề mục tiêu')
        if (!j.stage1_goal.goalText) missing.push('Nội dung mục tiêu')
      } else if (idx === 1) {
        if (!j.stage2_confirmGoal.question) missing.push('Câu hỏi xác nhận')
      } else if (idx === 2) {
        if (!j.stage3_video.videoUrl) missing.push('Link video bài học')
      } else if (idx === 3) {
        if (j.stage4_quiz.questions.length === 0) missing.push('Câu hỏi trắc nghiệm')
      } else if (idx === 4) {
        if (!j.stage5_practice.subjectName) missing.push('Tên chủ thể vẽ')
      } else if (idx === 5) {
        if (!j.stage6_completion.title) missing.push('Tiêu đề màn kết thúc')
      }
      return missing
    }
    if (sectionId.startsWith('stage-')) {
      const idx = parseInt(sectionId.replace('stage-', ''), 10)
      const card = draft.learnCards[idx]
      const missing: string[] = []
      if (!card) return ['Chưa có dữ liệu chặng']
      if (card.title.trim().length < 2) missing.push('Tiêu đề chặng')
      if (card.body.trim().length < 10 && (card.mee?.readText?.trim().length ?? 0) < 10) {
        missing.push('Nội dung hoặc Lời đọc cho bé (tối thiểu 10 ký tự)')
      }
      return missing
    }
    const stepId = sectionId === 'basics' ? 'basics' : sectionId === 'content' ? 'content' : sectionId === 'game' ? 'game' : sectionId === 'practice' ? 'practice' : 'check'
    return readiness.steps.find((step) => step.id === stepId)?.missing ?? []
  }

  // WHY: inline=true → không có backdrop, không fixed position.
  // Container fill 100% chiều cao parent (main panel trong TeacherPage).
  const containerStyle: React.CSSProperties = inline ? {
    display: 'flex', flexDirection: 'column', height: '100%',
    background: '#f8fafc', overflow: 'hidden',
    borderRadius: '1rem', border: '1px solid #e2e8f0',
  } : {
    position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 401,
    width: '100%', maxWidth: showInlinePreview ? 'min(1280px, 100vw)' : '700px',
    background: '#f8fafc',
    borderLeft: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '-20px 0 60px rgba(15,23,42,0.15)',
  }

  const body = (
    <>
      <div style={containerStyle}>
        <LectureDrawerHeader
          uid={uid}
          draft={draft}
          isEdit={isEdit}
          readOnly={readOnly}
          archived={archived}
          isIslandCourse={isIslandCourse}
          lessonFormat={lessonFormat}
          customJourneyStages={draft.customJourneyStages}
          activeSection={activeSection}
          readiness={readiness}
          showInlinePreview={showInlinePreview}
          recovery={recovery}
          draftStorageKey={draftStorageKey}
          onRestore={onRestore}
          onArchive={onArchive}
          onRequestClose={requestClose}
          onShowFullPreview={() => setShowFullPreview(true)}
          onToggleInlinePreview={() => setShowInlinePreview((value) => !value)}
          onFormatChange={(format) => {
            setLessonFormat(format)
            if (format === 'aiki-rule-5steps') {
              if (!isAikiRuleLesson(draft.learnCards)) {
                setDraft((d) => ({ ...d, lessonFormat: format, learnCards: createAikiRuleLearnCards() }))
              } else {
                setDraft((d) => ({ ...d, lessonFormat: format }))
              }
              setActiveSection('stage-0')
            } else if (format === 'aiki-rule-3steps') {
              if (!Array.isArray(draft.learnCards) || draft.learnCards.length !== 3 || !draft.learnCards.some((c) => c.id?.startsWith('rule-3step-'))) {
                setDraft((d) => ({ ...d, lessonFormat: format, learnCards: createAikiRule3StepsCards() }))
              } else {
                setDraft((d) => ({ ...d, lessonFormat: format }))
              }
              setActiveSection('stage-0')
            } else {
              setDraft((d) => ({ ...d, lessonFormat: format }))
              if (draft.customJourneyStages && draft.customJourneyStages.length >= 3 && activeSection.startsWith('stage-')) {
                // keep current active stage
              } else {
                setActiveSection('content')
              }
            }
          }}
          onSelectSection={(sec) => setActiveSection(sec)}
          onDiscardRecovery={() => {
            window.sessionStorage.removeItem(draftStorageKey)
            setRecovery(null)
          }}
          onApplyRecovery={() => {
            if (recovery) {
              setDraft(recovery.draft)
              setRecovery(null)
              showToast('Đã khôi phục nội dung đang soạn', 'success')
            }
          }}
          sectionStatus={sectionStatus}
          sectionMissing={sectionMissing}
        />

        {/* Content area — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
          {sectionMissing(activeSection).length > 0 && !readOnly && (
            <div className="mb-4 rounded-xl border border-sun-200 bg-sun-50 p-3" role="status">
              <p className="text-sm font-extrabold text-warning">Cần bổ sung trước khi lưu</p>
              <ul className="mt-2 grid gap-1 text-xs font-semibold text-text">
                {sectionMissing(activeSection).map((message) => <li key={message} className="flex gap-2"><span aria-hidden="true">•</span><span>{message}</span></li>)}
              </ul>
            </div>
          )}

          {/* ── BASICS ── */}
          {activeSection === 'basics' && (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-4 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-xs">
                    <BookOpen size={20} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg text-brand-950">Thông tin trạm học</h3>
                    <p className="mt-0.5 text-xs font-semibold text-brand-800">
                      Định hướng toàn bộ bài học: tiêu đề, đường dẫn, mục tiêu và kỹ năng trọng tâm.
                    </p>
                  </div>
                </div>
              </div>

              <div className={cn('grid items-start gap-5 transition-all', showInlinePreview ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,.85fr)]' : 'lg:grid-cols-[minmax(0,1fr)_56px]')}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <FormRow label="Tên trạm học *">
                    <input
                      type="text" id={`${uid}-title`}
                      value={draft.title}
                      readOnly={readOnly}
                      onChange={(e) => set('title', e.target.value)}
                      placeholder="VD: Bài 1.2 — Bốn chiếc chìa khoá"
                      style={inputStyle}
                    />
                  </FormRow>
                  <FormRow label="Đường dẫn (slug) *" hint="VD: bai-1-1-mot-tu-hay-nam-tu">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>/</span>
                      <input
                        type="text" id={`${uid}-slug`}
                        value={(draft as any).slug ?? ''}
                        readOnly={readOnly}
                        onChange={(e) => set('slug', e.target.value)}
                        placeholder="ten-bai-hoc"
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => set('slug', slugifyAuthoringId(draft.title))}
                        className="rounded-lg bg-sky-100 px-2.5 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-200 transition whitespace-nowrap cursor-pointer"
                        title="Tự sinh đường dẫn không dấu từ tên trạm học"
                      >
                        ⚡ Tự tạo
                      </button>
                    </div>
                    {(draft as any).slug && !/^[a-z0-9-]{3,64}$/.test((draft as any).slug) && (
                      <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                        ⚠️ Chỉ dùng chữ thường, số và gạch ngang (3–64 ký tự)
                      </div>
                    )}
                  </FormRow>
                  <FormRow label="Kỹ năng trọng tâm *">
                    <input
                      type="text" value={draft.skill}
                      readOnly={readOnly}
                      onChange={(e) => set('skill', e.target.value)}
                      placeholder="VD: Hiểu cách AI học từ dữ liệu"
                      style={inputStyle}
                    />
                  </FormRow>
                  <FormRow label="Khẩu hiệu / Lời dẫn khởi động *" hint="Khẩu hiệu ngắn gọn hoặc câu hỏi kích thích tò mò">
                    <textarea
                      value={draft.hook}
                      readOnly={readOnly}
                      onChange={(e) => set('hook', e.target.value)}
                      placeholder="VD: Tả càng rõ, AIKI vẽ càng đúng!"
                      rows={3} style={textareaStyle}
                    />
                  </FormRow>
                  <FormRow label="Mục tiêu bài học đạt được *" hint="Hôm nay con sẽ đạt được gì? - Mỗi mục tiêu cốt lõi 1 dòng">
                    <textarea
                      value={draft.goalsText}
                      readOnly={readOnly}
                      onChange={(e) => set('goalsText', e.target.value)}
                      placeholder={"Hiểu AI học từ dữ liệu\nPhân biệt dữ liệu tốt và xấu\nBiết tại sao dữ liệu đa dạng quan trọng"}
                      rows={4} style={textareaStyle}
                    />
                  </FormRow>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <FormRow label="Thời lượng">
                      <input type="text" readOnly={readOnly} value={draft.duration} onChange={(e) => set('duration', e.target.value)} placeholder="VD: 30 phút" style={inputStyle} />
                    </FormRow>
                    <FormRow label="Phần thưởng trạm học" hint="Huy hiệu & thành tích học sinh đạt được khi hoàn thành trạm">
                      {(() => {
                        const stationBadge = isIslandCourse
                          ? (draft.sixStageJourney?.stage6_completion?.rewardBadge || { name: draft.reward || ('Huy hiệu ' + draft.title), stars: 3, xp: 50, iconUrl: '' })
                          : { name: draft.reward || ('Huy hiệu ' + draft.title), stars: 3, xp: 50, iconUrl: '' }
                        const badgeName = stationBadge.name || draft.reward || ('Huy hiệu ' + draft.title)
                        const starsCount = stationBadge.stars || 3
                        const xpReward = stationBadge.xp || 50
                        const iconUrl = stationBadge.iconUrl || draft.sixStageJourney?.stage1_goal?.imageUrl || ''

                        return (
                          <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/90 to-orange-50/60 p-3 shadow-clay-xs flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative size-12 shrink-0 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center overflow-hidden shadow-xs">
                                {iconUrl ? (
                                  <img src={iconUrl} alt={badgeName} className="size-full object-cover" />
                                ) : (
                                  <Award size={24} className="text-amber-600" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-amber-900 truncate" title={badgeName}>
                                    {badgeName}
                                  </span>
                                </div>
                                <div className="mt-0.5 flex items-center gap-2">
                                  <div className="flex items-center gap-0.5">
                                    {Array.from({ length: starsCount }).map((_, i) => (
                                      <Star key={i} size={13} className="text-amber-500 fill-amber-400" />
                                    ))}
                                  </div>
                                  <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-[10px] font-black text-amber-950">
                                    +{xpReward} XP
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="shrink-0 text-[11px] font-semibold text-amber-700 bg-white/80 px-2 py-1 rounded-lg border border-amber-200/80">
                              🏆 Hoàn thành trạm
                            </span>
                          </div>
                        )
                      })()}
                    </FormRow>
                  </div>
                  {isIslandCourse ? (
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 shadow-sm">
                      <p className="text-xs font-bold leading-relaxed text-sky-800 flex items-start gap-2">
                        <span className="text-base shrink-0">💡</span>
                        <span>
                          <strong>Lưu ý:</strong> Đối với bài học Đảo AIKids, Video bài giảng, ảnh bìa và các phân đoạn mốc thời gian được biên soạn trực tiếp tại <strong>Chặng 3 (Video bài học)</strong>.
                        </span>
                      </p>
                    </div>
                  ) : (
                    <FormRow label="Video bài học">
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Youtube size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                        <input
                          type="url" readOnly={readOnly} value={draft.videoUrl}
                          onChange={(e) => set('videoUrl', e.target.value)}
                          placeholder="https://youtube.com/..."
                          style={{ ...inputStyle, flex: 1 }}
                        />
                      </div>
                    </FormRow>
                  )}

                  {/* Card điều khiển Quyền truy cập & Học thử */}
                  <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-xl bg-amber-100 text-amber-700 font-bold text-sm">
                          🛡️
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Quyền truy cập & Học thử</h4>
                          <p className="text-xs text-slate-500">Cấu hình chế độ mở khóa và học thử riêng cho bài học này</p>
                        </div>
                      </div>
                      <span className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-bold',
                        (draft.access?.mode ?? 'inherit') === 'inherit' && 'bg-amber-100 text-amber-800',
                        draft.access?.mode === 'free_trial' && 'bg-emerald-100 text-emerald-800',
                        draft.access?.mode === 'plan_required' && 'bg-indigo-100 text-indigo-800',
                        draft.access?.mode === 'locked' && 'bg-rose-100 text-rose-800',
                      )}>
                        {(draft.access?.mode ?? 'inherit') === 'inherit' && '🟡 Kế thừa'}
                        {draft.access?.mode === 'free_trial' && '🟢 Học thử'}
                        {draft.access?.mode === 'plan_required' && '🔒 Gói 129k'}
                        {draft.access?.mode === 'locked' && '⛔ Đang khóa'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* 1. inherit */}
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => updateAccess({ mode: 'inherit', minPlanTier: 0 })}
                        className={cn(
                          'flex flex-col items-start rounded-xl border-2 p-3 text-left transition cursor-pointer',
                          (draft.access?.mode ?? 'inherit') === 'inherit'
                            ? 'border-amber-400 bg-amber-50/70 shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                        )}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                          <span>🟡</span> Kế thừa từ Khóa học
                        </div>
                        <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                          Theo chính sách chung của Khóa học (Free hoặc Yêu cầu gói).
                        </p>
                      </button>

                      {/* 2. free_trial */}
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => updateAccess({ mode: 'free_trial', minPlanTier: 0, trialBadge: draft.access?.trialBadge || 'Học thử' })}
                        className={cn(
                          'flex flex-col items-start rounded-xl border-2 p-3 text-left transition cursor-pointer',
                          draft.access?.mode === 'free_trial'
                            ? 'border-emerald-500 bg-emerald-50 shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                        )}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                          <span>🟢</span> Cho phép Học Thử Miễn Phí
                        </div>
                        <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                          Học sinh được học miễn phí bài này ngay cả khi chưa mua gói.
                        </p>
                      </button>

                      {/* 3. plan_required */}
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => updateAccess({ mode: 'plan_required', minPlanTier: 1 })}
                        className={cn(
                          'flex flex-col items-start rounded-xl border-2 p-3 text-left transition cursor-pointer',
                          draft.access?.mode === 'plan_required'
                            ? 'border-indigo-500 bg-indigo-50 shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                        )}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-900">
                          <span>🔒</span> Yêu cầu Gói Thuê Bao
                        </div>
                        <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                          Tier 1: Yêu cầu Gói Hội Viên AIKids 129k để mở khóa bài học này.
                        </p>
                      </button>

                      {/* 4. locked */}
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => updateAccess({ mode: 'locked' })}
                        className={cn(
                          'flex flex-col items-start rounded-xl border-2 p-3 text-left transition cursor-pointer',
                          draft.access?.mode === 'locked'
                            ? 'border-rose-400 bg-rose-50 shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                        )}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-rose-900">
                          <span>⛔</span> Tạm khóa
                        </div>
                        <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                          Tạm khóa bài học với thông báo tùy chỉnh cho học sinh.
                        </p>
                      </button>
                    </div>

                    {/* Extra config fields based on mode */}
                    {draft.access?.mode === 'free_trial' && (
                      <div className="mt-3 pt-3 border-t border-emerald-100">
                        <label className="block text-xs font-bold text-emerald-900 mb-1">
                          Huy hiệu học thử (Trial Badge):
                        </label>
                        <input
                          type="text"
                          disabled={readOnly}
                          value={draft.access?.trialBadge ?? 'Học thử'}
                          onChange={(e) => updateAccess({ trialBadge: e.target.value })}
                          placeholder="VD: Học thử, Trải nghiệm miễn phí..."
                          className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-emerald-500"
                        />
                      </div>
                    )}

                    {draft.access?.mode === 'locked' && (
                      <div className="mt-3 pt-3 border-t border-rose-100">
                        <label className="block text-xs font-bold text-rose-900 mb-1">
                          Lý do tạm khóa hiển thị cho học sinh:
                        </label>
                        <input
                          type="text"
                          disabled={readOnly}
                          value={draft.access?.lockedReason ?? ''}
                          onChange={(e) => updateAccess({ lockedReason: e.target.value })}
                          placeholder="VD: Bài học đang được giáo viên cập nhật..."
                          className="w-full rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-rose-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
                {showInlinePreview ? (
                  <StudentBasicsPreview draft={deferredDraft} onCollapse={() => setShowInlinePreview(false)} />
                ) : (
                  <CollapsedPreviewRail onExpand={() => setShowInlinePreview(true)} />
                )}
              </div>
            </div>
          )}

          {/* ── ĐẢO AIKIDS 6 CHẶNG SƯ PHẠM ── */}
          {isIslandCourse && lessonFormat !== 'aiki-rule-3steps' && activeSection.startsWith('stage-') && (() => {
            const stageIndex = parseInt(activeSection.replace('stage-', ''), 10)
            const currentJourney = draft.sixStageJourney || resolveIslandSixStageJourney(draft as any)
            const islandCard = draft.learnCards[stageIndex]
            const islandBlocks = islandCard ? getStageBlocks(islandCard, stageIndex) : []

            return (
              <div className={cn('grid min-w-0 items-start gap-5 transition-all', showInlinePreview ? 'xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,.85fr)]' : 'xl:grid-cols-[minmax(0,1fr)_56px]')}>
                <div className="flex min-w-0 flex-col gap-4">
                  {/* Header chặng 6 bước */}
                  <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-xs">
                          {stageIndex === 0 ? <Target size={20} /> :
                           stageIndex === 1 ? <HelpCircle size={20} /> :
                           stageIndex === 2 ? <Clapperboard size={20} /> :
                           stageIndex === 3 ? <BrainCircuit size={20} /> :
                           stageIndex === 4 ? <Palette size={20} /> :
                           <Trophy size={20} />}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-brand-200 px-1.5 py-0.5 text-[10px] font-black text-brand-900 uppercase">
                              Chặng {stageIndex + 1}/6 · Đảo AIKids
                            </span>
                            <h3 className="font-display text-lg text-brand-950">{ISLAND_6_STAGE_NAMES[stageIndex]}</h3>
                          </div>
                          <p className="mt-0.5 text-xs font-semibold text-brand-800">
                            {stageIndex === 0 ? 'Ảnh mục tiêu, mục tiêu cốt lõi và các thẻ nội dung hiển thị đúng như màn học sinh.' :
                             stageIndex === 1 ? '1 câu đố A/B xác nhận mục tiêu và mở khóa video bài học.' :
                             stageIndex === 2 ? 'Video bài giảng YouTube/MP4 và các mốc phân đoạn thời gian.' :
                             stageIndex === 3 ? 'Bộ câu hỏi trắc nghiệm kiểm tra kiến thức sau video.' :
                             stageIndex === 4 ? 'Kịch bản 4 bước thực hành trên Xưởng Sáng Tạo AI.' :
                             'Màn kết thúc chúc mừng, trao huy hiệu 3 sao, 50 XP và bài học tiếp.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form nội dung từng chặng */}
                  {stageIndex === 0 && false && (
                    <div className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-xs">
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700">Ảnh Mục Tiêu (Cover / Illustration)</label>
                        <div className="mt-1.5 flex gap-2">
                          <input
                            type="text"
                            value={currentJourney.stage1_goal.imageUrl}
                            onChange={(e) => {
                              const val = e.target.value
                              updateSixStage((j) => ({ ...j, stage1_goal: { ...j.stage1_goal, imageUrl: val } }))
                            }}
                            placeholder="/assets/aiki-islands/island1_lesson1_cat.jpg hoặc URL ảnh..."
                            className="flex-1 rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
                          />
                          <label className="flex items-center gap-1 rounded-xl bg-brand-50 border border-brand-200 px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 cursor-pointer">
                            <span>📤 Tải ảnh</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                try {
                                  const res = await uploadCmsCourseMedia({ file, purpose: 'island_stage1_image', questId: lecture?.id })
                                  if (res?.url) {
                                    updateSixStage((j) => ({ ...j, stage1_goal: { ...j.stage1_goal, imageUrl: res.url } }))
                                    showToast('Đã tải ảnh lên thành công!', 'success')
                                  }
                                } catch (err) {
                                  showToast(`Lỗi tải ảnh: ${err instanceof Error ? err.message : 'Không xác định'}`, 'error')
                                }
                              }}
                            />
                          </label>
                        </div>
                        {currentJourney.stage1_goal.imageUrl && (
                          <div className="mt-2 relative w-40 aspect-video rounded-xl overflow-hidden border border-border">
                            <img src={currentJourney.stage1_goal.imageUrl} alt="Mục tiêu" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700">Tiêu đề bài học</label>
                        <input
                          type="text"
                          value={currentJourney.stage1_goal.title}
                          onChange={(e) => {
                            const val = e.target.value
                            updateSixStage((j) => ({ ...j, stage1_goal: { ...j.stage1_goal, title: val } }))
                          }}
                          className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-sm font-bold text-text"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700">Mục tiêu bài học (Goal text)</label>
                        <textarea
                          rows={2}
                          value={currentJourney.stage1_goal.goalText}
                          onChange={(e) => {
                            const val = e.target.value
                            updateSixStage((j) => ({ ...j, stage1_goal: { ...j.stage1_goal, goalText: val } }))
                          }}
                          className="mt-1.5 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text"
                          placeholder="Mô tả mục tiêu cụ thể bé sẽ đạt được..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700">
                          {currentJourney.stage1_goal.keyPoints.length >= 4 ? '4 chìa khóa (hiển thị 1–1 trên frontend)' : 'Điểm vàng cần ghi nhớ'}
                        </label>
                        <div className="mt-1.5 space-y-2">
                          {Array.from({ length: Math.max(3, currentJourney.stage1_goal.keyPoints.length) }, (_, idx) => idx).map((idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="size-6 rounded-full bg-amber-500 text-white font-bold text-xs grid place-items-center shrink-0">
                                {idx + 1}
                              </span>
                              <input
                                type="text"
                                value={currentJourney.stage1_goal.keyPoints[idx] || ''}
                                onChange={(e) => {
                                  const val = e.target.value
                                  updateSixStage((j) => {
                                    const pts = [...j.stage1_goal.keyPoints]
                                    pts[idx] = val
                                    return { ...j, stage1_goal: { ...j.stage1_goal, keyPoints: pts } }
                                  })
                                }}
                                placeholder={currentJourney.stage1_goal.keyPoints.length >= 4 ? `Chìa khóa ${idx + 1}...` : `Điểm vàng thứ ${idx + 1}...`}
                                className="flex-1 rounded-xl border border-border bg-page px-3 py-1.5 text-xs font-semibold text-text"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-black uppercase text-slate-700">Lời chào & Thuyết minh của Mèo AIKI</label>
                          <button
                            type="button"
                            onClick={() => previewAikiVoice(0, currentJourney.stage1_goal.speech)}
                            className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
                          >
                            <Volume2 size={13} />
                            <span>Nghe thử giọng AIKI</span>
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={currentJourney.stage1_goal.speech}
                          onChange={(e) => {
                            const val = e.target.value
                            updateSixStage((j) => ({ ...j, stage1_goal: { ...j.stage1_goal, speech: val } }))
                          }}
                          className="mt-1.5 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text italic"
                        />
                      </div>
                    </div>
                  )}



                  {stageIndex === 2 && (
                    <div className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-xs">
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700">Tiêu đề video bài học</label>
                        <input
                          type="text"
                          value={currentJourney.stage3_video.title}
                          onChange={(e) => {
                            const val = e.target.value
                            updateSixStage((j) => ({ ...j, stage3_video: { ...j.stage3_video, title: val } }))
                          }}
                          className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-bold text-text"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700">Đường dẫn video (YouTube embed hoặc MP4)</label>
                        <input
                          type="text"
                          value={currentJourney.stage3_video.videoUrl}
                          onChange={(e) => {
                            const val = e.target.value
                            updateSixStage((j) => ({ ...j, stage3_video: { ...j.stage3_video, videoUrl: val } }))
                          }}
                          placeholder="https://www.youtube.com/embed/... hoặc https://..."
                          className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700">Thời lượng (giây)</label>
                          <input
                            type="number"
                            value={currentJourney.stage3_video.durationSec}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 180
                              updateSixStage((j) => ({ ...j, stage3_video: { ...j.stage3_video, durationSec: val } }))
                            }}
                            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700">Ảnh bìa video (Poster URL)</label>
                          <input
                            type="text"
                            value={currentJourney.stage3_video.posterUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value
                              updateSixStage((j) => ({ ...j, stage3_video: { ...j.stage3_video, posterUrl: val } }))
                            }}
                            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-black uppercase text-slate-700">Mốc phân đoạn video (Timestamps)</label>
                          <button
                            type="button"
                            onClick={() => {
                              updateSixStage((j) => {
                                const ts = j.stage3_video.timestamps ? [...j.stage3_video.timestamps] : []
                                ts.push({ label: `Phân đoạn ${ts.length + 1}`, startSec: 0, endSec: 60 })
                                return { ...j, stage3_video: { ...j.stage3_video, timestamps: ts } }
                              })
                            }}
                            className="text-xs font-bold text-brand-600 hover:text-brand-800 cursor-pointer"
                          >
                            + Thêm mốc
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(currentJourney.stage3_video.timestamps || []).map((ts, tsIdx) => (
                            <div key={tsIdx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                              <input
                                type="text"
                                value={ts.label}
                                onChange={(e) => {
                                  const val = e.target.value
                                  updateSixStage((j) => {
                                    const items = [...(j.stage3_video.timestamps || [])]
                                    items[tsIdx] = { ...items[tsIdx], label: val }
                                    return { ...j, stage3_video: { ...j.stage3_video, timestamps: items } }
                                  })
                                }}
                                placeholder="Tên phân đoạn..."
                                className="flex-1 rounded-lg border border-border bg-white px-2 py-1 text-xs font-semibold"
                              />
                              <input
                                type="number"
                                value={ts.startSec}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 0
                                  updateSixStage((j) => {
                                    const items = [...(j.stage3_video.timestamps || [])]
                                    items[tsIdx] = { ...items[tsIdx], startSec: val }
                                    return { ...j, stage3_video: { ...j.stage3_video, timestamps: items } }
                                  })
                                }}
                                className="w-16 rounded-lg border border-border bg-white px-2 py-1 text-xs font-semibold text-center"
                                title="Giây bắt đầu"
                              />
                              <span className="text-xs text-muted">➔</span>
                              <input
                                type="number"
                                value={ts.endSec}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 0
                                  updateSixStage((j) => {
                                    const items = [...(j.stage3_video.timestamps || [])]
                                    items[tsIdx] = { ...items[tsIdx], endSec: val }
                                    return { ...j, stage3_video: { ...j.stage3_video, timestamps: items } }
                                  })
                                }}
                                className="w-16 rounded-lg border border-border bg-white px-2 py-1 text-xs font-semibold text-center"
                                title="Giây kết thúc"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  updateSixStage((j) => {
                                    const items = (j.stage3_video.timestamps || []).filter((_, i) => i !== tsIdx)
                                    return { ...j, stage3_video: { ...j.stage3_video, timestamps: items } }
                                  })
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {stageIndex === 3 && (
                    <div className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700">Tiêu đề bài test</label>
                          <input
                            type="text"
                            value={currentJourney.stage4_quiz.title}
                            onChange={(e) => {
                              const val = e.target.value
                              updateSixStage((j) => ({ ...j, stage4_quiz: { ...j.stage4_quiz, title: val } }))
                            }}
                            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-bold text-text"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700">Điểm đạt tối thiểu (câu)</label>
                          <input
                            type="number"
                            value={currentJourney.stage4_quiz.passScore}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 1
                              updateSixStage((j) => ({ ...j, stage4_quiz: { ...j.stage4_quiz, passScore: val } }))
                            }}
                            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-black uppercase text-slate-700">
                            Danh sách câu hỏi trắc nghiệm ({currentJourney.stage4_quiz.questions.length})
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              updateSixStage((j) => {
                                const qs = [...j.stage4_quiz.questions]
                                qs.push({
                                  id: `q-${qs.length + 1}`,
                                  prompt: 'Câu hỏi mới?',
                                  options: ['Đáp án đúng', 'Đáp án sai'],
                                  correctIndex: 0,
                                  explanation: 'Giải thích đáp án đúng...',
                                })
                                return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                              })
                            }}
                            className="text-xs font-bold text-brand-600 hover:text-brand-800 cursor-pointer"
                          >
                            + Thêm câu hỏi
                          </button>
                        </div>

                        {currentJourney.stage4_quiz.questions.map((q, qIdx) => (
                          <div key={q.id || qIdx} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-black text-slate-700">Câu hỏi #{qIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  updateSixStage((j) => {
                                    const qs = j.stage4_quiz.questions.filter((_, i) => i !== qIdx)
                                    return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                                  })
                                }}
                                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={q.prompt}
                              onChange={(e) => {
                                const val = e.target.value
                                updateSixStage((j) => {
                                  const qs = [...j.stage4_quiz.questions]
                                  qs[qIdx] = { ...qs[qIdx], prompt: val }
                                  return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                                })
                              }}
                              placeholder="Nội dung câu hỏi..."
                              className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold"
                            />
                            <div className="space-y-1.5">
                              <p className="text-[11px] font-bold text-slate-600">Các phương án lựa chọn:</p>
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`quiz-correct-${qIdx}`}
                                    checked={q.correctIndex === optIdx}
                                    onChange={() => {
                                      updateSixStage((j) => {
                                        const qs = [...j.stage4_quiz.questions]
                                        qs[qIdx] = { ...qs[qIdx], correctIndex: optIdx }
                                        return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                                      })
                                    }}
                                    title="Chọn làm đáp án đúng"
                                  />
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const val = e.target.value
                                      updateSixStage((j) => {
                                        const qs = [...j.stage4_quiz.questions]
                                        const opts = [...qs[qIdx].options]
                                        opts[optIdx] = val
                                        qs[qIdx] = { ...qs[qIdx], options: opts }
                                        return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                                      })
                                    }}
                                    className="flex-1 rounded-lg border border-border bg-white px-2 py-1 text-xs"
                                  />
                                </div>
                              ))}
                            </div>
                            <input
                              type="text"
                              value={q.explanation}
                              onChange={(e) => {
                                const val = e.target.value
                                updateSixStage((j) => {
                                  const qs = [...j.stage4_quiz.questions]
                                  qs[qIdx] = { ...qs[qIdx], explanation: val }
                                  return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                                })
                              }}
                              placeholder="Lời giải thích khi trả lời..."
                              className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-[11px] text-slate-600"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {stageIndex === 4 && (
                    <div className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-xs">
                      {/* BỘ CHUYỂN ĐỔI GAME ENGINE THỰC HÀNH SÁNG TẠO (CREATIVE ENGINE SELECTOR) */}
                      {(() => {
                        const selectedEngineMode = currentJourney.stage5_practice.creativeEngineMode || 'magic-keys'
                        const currentEngine = CREATIVE_ENGINES.find((e) => e.mode === selectedEngineMode) || CREATIVE_ENGINES[0]

                        return (
                          <div className="rounded-2xl border-2 border-brand-200 bg-gradient-to-r from-brand-50/90 via-purple-50/50 to-amber-50/60 p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              {/* Bên trái */}
                              <div className="flex items-center flex-wrap gap-2">
                                <span className="text-base">🎨</span>
                                <h4 className="font-display text-xs sm:text-sm font-black text-brand-950 uppercase tracking-wide">
                                  Game Engine Thực Hành:
                                </h4>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-brand-200/80 px-2.5 py-0.5 text-[11px] font-bold text-brand-900 shadow-2xs">
                                  <span>{currentEngine.icon}</span> <span>{currentEngine.title}</span>
                                </span>
                                <span className="rounded-full bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 shadow-2xs uppercase tracking-wider">
                                  Đang dùng
                                </span>
                              </div>

                              {/* Bên phải */}
                              <button
                                type="button"
                                onClick={() => setIsEngineSelectorExpanded(!isEngineSelectorExpanded)}
                                className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-brand-300/80 bg-white/90 px-3 py-1.5 text-xs font-black text-brand-900 hover:bg-white hover:border-brand-400 active:scale-95 transition shadow-2xs cursor-pointer"
                              >
                                <span>{isEngineSelectorExpanded ? 'Thu gọn' : 'Đổi Game Engine'}</span>
                                {isEngineSelectorExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            </div>

                            {/* Vùng nội dung chi tiết (Mô tả và lưới 7 nút) */}
                            {isEngineSelectorExpanded && (
                              <div className="animate-in fade-in duration-200 pt-3 border-t border-brand-200/60 mt-3 space-y-3">
                                <p className="text-[11px] font-medium text-slate-600">
                                  Chuyển đổi linh hoạt giữa 7 cơ chế chơi — Mọi nội dung (chủ thể, huy hiệu, thần chú AIKI, món đồ bé vẽ) đều được tự động đồng bộ và giữ nguyên trọn vẹn!
                                </p>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
                                  {CREATIVE_ENGINES.map((eng) => {
                                    const isSelected = selectedEngineMode === eng.mode
                                    return (
                                      <button
                                        key={eng.mode}
                                        type="button"
                                        onClick={() => {
                                          const currentMotto = (currentJourney.stage5_practice.akiMotto || '').trim()
                                          const isDefaultOrEmpty =
                                            !currentMotto ||
                                            Object.values(ENGINE_DEFAULT_MOTTOS).some(
                                              (motto) => motto.trim() === currentMotto
                                            )
                                          const nextMotto = isDefaultOrEmpty
                                            ? ENGINE_DEFAULT_MOTTOS[eng.mode] || currentMotto
                                            : currentMotto

                                          updateSixStage((j) => {
                                            const nextPractice = {
                                              ...j.stage5_practice,
                                              creativeEngineMode: eng.mode,
                                              akiMotto: nextMotto,
                                              ...(eng.mode === 'creative-notebook' ? { practiceParts: [], notebookConfig: j.stage5_practice.notebookConfig || DEFAULT_NOTEBOOK_CONFIGS['3.1'] } : {}),
                                            }
                                            if (eng.mode === 'magic-keys' && nextPractice.fourKeysOptions) {
                                              const fk = nextPractice.fourKeysOptions
                                              const autoLocked = [
                                                fk.what?.[0],
                                                fk.how?.[0],
                                                fk.action?.[0],
                                                fk.where?.[0],
                                              ].filter(Boolean) as string[]
                                              if (autoLocked.length > 0) {
                                                nextPractice.lockedFeatures = autoLocked
                                              }
                                            }
                                            return {
                                              ...j,
                                              stage5_practice: nextPractice,
                                            }
                                          })
                                          showToast(`Đã chọn Game Engine Thực Hành: ${eng.title}!`, 'success')
                                        }}
                                        className={cn(
                                          'flex flex-col items-center text-center p-2.5 rounded-xl border transition cursor-pointer select-none relative',
                                          isSelected
                                            ? cn(eng.activeBorder, 'shadow-clay-sm')
                                            : 'border-border/70 bg-white/70 hover:bg-white hover:border-slate-300'
                                        )}
                                      >
                                        {isSelected && (
                                          <span className={cn(
                                            'absolute -top-2 left-1/2 -translate-x-1/2 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-2xs whitespace-nowrap',
                                            eng.badgeBg
                                          )}>
                                            ĐANG CHỌN
                                          </span>
                                        )}
                                        <span className="text-xl mb-1 mt-0.5">{eng.icon}</span>
                                        <span className="text-[11px] font-black text-slate-900 block leading-tight">
                                          {eng.shortName}
                                        </span>
                                        <span className="text-[9px] font-medium text-slate-500 mt-1 line-clamp-2 leading-snug">
                                          {eng.desc}
                                        </span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })()}

                      {/* Khối Lời dẫn thử thách của AIKI (Challenge Prompt) */}
                      <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/50 via-white to-indigo-50/30 p-4 shadow-clay-sm space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <span>🎯 Lời dẫn thử thách của AIKI (Challenge Prompt)</span>
                            <span className="text-[10px] font-normal lowercase text-slate-400">
                              (lời dặn dò giao nhiệm vụ cho bé khi vào xưởng vẽ)
                            </span>
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const mode = currentJourney.stage5_practice.creativeEngineMode || 'magic-keys'
                                const defaultMotto = ENGINE_DEFAULT_MOTTOS[mode] || ENGINE_DEFAULT_MOTTOS['magic-keys']
                                updateSixStage((j) => ({
                                  ...j,
                                  stage5_practice: { ...j.stage5_practice, akiMotto: defaultMotto },
                                }))
                                showToast('Đã nạp lời dẫn thử thách chuẩn của Engine!', 'success')
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                              title="Nạp lại lời dẫn chuẩn tương ứng với engine đang chọn"
                            >
                              <Wand2 size={11} />
                              <span>🪄 Lời dẫn chuẩn</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                previewAikiVoice(
                                  4,
                                  currentJourney.stage5_practice.akiMotto ||
                                    ENGINE_DEFAULT_MOTTOS[currentJourney.stage5_practice.creativeEngineMode || 'magic-keys']
                                )
                              }
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
                            >
                              <Volume2 size={11} />
                              <span>Nghe thử giọng AIKI</span>
                            </button>
                          </div>
                        </div>
                        <textarea
                          rows={2}
                          value={currentJourney.stage5_practice.akiMotto ?? ''}
                          placeholder={ENGINE_DEFAULT_MOTTOS[currentJourney.stage5_practice.creativeEngineMode || 'magic-keys']}
                          onChange={(e) => {
                            const val = e.target.value
                            updateSixStage((j) => ({ ...j, stage5_practice: { ...j.stage5_practice, akiMotto: val } }))
                          }}
                          className="w-full rounded-xl border border-sky-200/80 bg-white p-2.5 text-xs font-semibold text-slate-800 italic placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200/50 shadow-inner"
                        />
                      </div>

                      {/* Cấu hình Món đồ bé vẽ & CMS Động theo Game Engine Thực Hành */}
                      <Stage5CreativeEngineEditor
                        practice={currentJourney.stage5_practice}
                        onChange={(patch) => {
                          updateSixStage((j) => {
                            const nextPractice = {
                              ...j.stage5_practice,
                              ...patch,
                            }
                            // Tự động đồng bộ lockedFeatures khi ở magic-keys nếu fourKeysOptions thay đổi
                            if ((nextPractice.creativeEngineMode || 'magic-keys') === 'magic-keys') {
                              const fk = nextPractice.fourKeysOptions
                              if (fk) {
                                const autoLocked = [
                                  fk.what?.[0],
                                  fk.how?.[0],
                                  fk.action?.[0],
                                  fk.where?.[0],
                                ].filter(Boolean) as string[]
                                if (autoLocked.length > 0 && (!nextPractice.lockedFeatures?.length || patch.fourKeysOptions)) {
                                  nextPractice.lockedFeatures = autoLocked
                                }
                              }
                            }
                            return {
                              ...j,
                              stage5_practice: nextPractice,
                            }
                          })
                        }}
                        showToast={showToast}
                      />

                      {/* Lời thoại & Gợi ý từng lượt của AIKI (Nâng cao) - Accordion tinh gọn */}
                      <PracticeWorkflowStepsAccordion
                        workflowSteps={currentJourney.stage5_practice.workflowSteps}
                        onChange={(steps) => {
                          updateSixStage((j) => ({
                            ...j,
                            stage5_practice: {
                              ...j.stage5_practice,
                              workflowSteps: steps,
                            },
                          }))
                        }}
                      />
                    </div>
                  )}

                  {stageIndex === 5 && (
                    <div className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-xs">
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700">Tiêu đề hoàn thành</label>
                        <input
                          type="text"
                          value={currentJourney.stage6_completion.title}
                          onChange={(e) => {
                            const val = e.target.value
                            updateSixStage((j) => ({ ...j, stage6_completion: { ...j.stage6_completion, title: val } }))
                          }}
                          className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-bold text-text"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700">Thông điệp chúc mừng</label>
                        <textarea
                          rows={3}
                          value={currentJourney.stage6_completion.congratsMessage}
                          onChange={(e) => {
                            const val = e.target.value
                            updateSixStage((j) => ({ ...j, stage6_completion: { ...j.stage6_completion, congratsMessage: val } }))
                          }}
                          className="mt-1.5 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text"
                        />
                      </div>

                      {/* Cấu hình Ảnh kiệt tác trong Balo / Ảnh huy hiệu */}
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700">
                          Ảnh kiệt tác trong Balo / Ảnh huy hiệu (iconUrl)
                        </label>
                        <div className="mt-1.5 flex gap-2">
                          <input
                            type="text"
                            value={currentJourney.stage6_completion.rewardBadge.iconUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value
                              updateSixStage((j) => ({
                                ...j,
                                stage6_completion: {
                                  ...j.stage6_completion,
                                  rewardBadge: { ...j.stage6_completion.rewardBadge, iconUrl: val },
                                },
                              }))
                            }}
                            placeholder="https://... hoặc tải ảnh lên (mặc định lấy ảnh Chặng 1 nếu để trống)"
                            className="flex-1 rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text font-mono"
                          />
                          <label className="flex items-center gap-1 rounded-xl bg-brand-50 border border-brand-200 px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 cursor-pointer shrink-0">
                            <span>📤 Tải ảnh</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                try {
                                  const res = await uploadCmsCourseMedia({ file, purpose: 'island_stage6_badge', questId: lecture?.id })
                                  if (res?.url) {
                                    updateSixStage((j) => ({
                                      ...j,
                                      stage6_completion: {
                                        ...j.stage6_completion,
                                        rewardBadge: { ...j.stage6_completion.rewardBadge, iconUrl: res.url },
                                      },
                                    }))
                                    showToast('Đã tải ảnh huy hiệu/kiệt tác lên thành công!', 'success')
                                  }
                                } catch (err) {
                                  showToast(`Lỗi tải ảnh: ${err instanceof Error ? err.message : 'Không xác định'}`, 'error')
                                }
                              }}
                            />
                          </label>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 font-medium">
                          💡 Mặc định hiển thị ảnh mục tiêu Chặng 1 ({currentJourney.stage1_goal.imageUrl ? 'đã có' : 'chưa có'}) nếu để trống.
                        </p>
                        {(currentJourney.stage6_completion.rewardBadge.iconUrl || currentJourney.stage1_goal.imageUrl) && (
                          <div className="mt-2 flex items-center gap-3 p-2 bg-amber-50/60 rounded-xl border border-amber-200/80">
                            <div className="relative w-20 aspect-[4/3] rounded-lg overflow-hidden border border-amber-300 bg-white shrink-0">
                              <img
                                src={currentJourney.stage6_completion.rewardBadge.iconUrl || currentJourney.stage1_goal.imageUrl}
                                alt="Xem trước ảnh kiệt tác/huy hiệu"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-xs space-y-0.5 min-w-0 flex-1">
                              <p className="font-bold text-slate-700 truncate">
                                {currentJourney.stage6_completion.rewardBadge.iconUrl ? 'Ảnh huy hiệu riêng' : 'Ảnh kế thừa từ Chặng 1 (Mục tiêu)'}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate font-mono">
                                {currentJourney.stage6_completion.rewardBadge.iconUrl || currentJourney.stage1_goal.imageUrl}
                              </p>
                            </div>
                            {currentJourney.stage6_completion.rewardBadge.iconUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateSixStage((j) => ({
                                    ...j,
                                    stage6_completion: {
                                      ...j.stage6_completion,
                                      rewardBadge: { ...j.stage6_completion.rewardBadge, iconUrl: '' },
                                    },
                                  }))
                                  showToast('Đã xóa ảnh huy hiệu tùy chỉnh (sẽ dùng ảnh Chặng 1)', 'info')
                                }}
                                className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer shrink-0"
                                title="Xóa ảnh tùy chỉnh, dùng lại ảnh Chặng 1"
                              >
                                ✕ Bỏ ảnh riêng
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700">Tên huy hiệu</label>
                          <input
                            type="text"
                            value={currentJourney.stage6_completion.rewardBadge.name}
                            onChange={(e) => {
                              const val = e.target.value
                              updateSixStage((j) => ({
                                ...j,
                                stage6_completion: {
                                  ...j.stage6_completion,
                                  rewardBadge: { ...j.stage6_completion.rewardBadge, name: val },
                                },
                              }))
                            }}
                            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700">Số sao thưởng ⭐</label>
                          <input
                            type="number"
                            value={currentJourney.stage6_completion.rewardBadge.stars}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 3
                              updateSixStage((j) => ({
                                ...j,
                                stage6_completion: {
                                  ...j.stage6_completion,
                                  rewardBadge: { ...j.stage6_completion.rewardBadge, stars: val },
                                },
                              }))
                            }}
                            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700">Điểm kinh nghiệm XP</label>
                          <input
                            type="number"
                            value={currentJourney.stage6_completion.rewardBadge.xp}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 50
                              updateSixStage((j) => ({
                                ...j,
                                stage6_completion: {
                                  ...j.stage6_completion,
                                  rewardBadge: { ...j.stage6_completion.rewardBadge, xp: val },
                                },
                              }))
                            }}
                            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700">Slug bài học tiếp theo (nextLessonSlug)</label>
                        <input
                          type="text"
                          value={currentJourney.stage6_completion.nextLessonSlug || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            updateSixStage((j) => ({ ...j, stage6_completion: { ...j.stage6_completion, nextLessonSlug: val } }))
                          }}
                          placeholder="bai-1-2"
                          className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Canvas SSOT: cả nội dung chuẩn và block tùy biến cùng một luồng kéo-thả. */}
                  <div
                    onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; setIsDragOver(true) }}
                    onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragOver(false) }}
                    onDrop={(event) => {
                      event.preventDefault()
                      setIsDragOver(false)
                      const blockId = event.dataTransfer.getData('text/plain')
                      if (blockId) handleAddModule(blockId, stageIndex)
                    }}
                    className={cn(
                      'space-y-3 rounded-2xl border-2 border-dashed p-4 transition',
                      isDragOver ? 'border-brand-500 bg-brand-50 ring-4 ring-brand-200/50' : 'border-sky-200 bg-sky-50/40'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-black text-sky-950">Canvas nội dung của chặng</h4>
                        <p className="text-xs font-semibold text-sky-800">Kéo block từ thư viện bên trái, thả vào đúng vị trí và sắp xếp theo thứ tự học sinh sẽ học.</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {stageIndex === 1 && !readOnly && (
                          <button
                            type="button"
                            onClick={() => handleAddModule('layout-confirm-option', stageIndex)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-black text-brand-800 shadow-2xs hover:bg-brand-100 transition cursor-pointer active:scale-95 shrink-0 whitespace-nowrap"
                          >
                            <Plus size={14} className="shrink-0" /> + Thêm phương án
                          </button>
                        )}
                        <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-black text-sky-800 shrink-0 whitespace-nowrap">{islandBlocks.length} block</span>
                      </div>
                    </div>

                    {islandBlocks.length === 0 && (
                      <div className="rounded-xl border border-dashed border-sky-300 bg-white p-5 text-center">
                        <p className="text-sm font-bold text-slate-700">Chặng này chưa có block nội dung.</p>
                        <button
                          type="button"
                          onClick={() => handleAddModule(stageIndex === 1 ? 'layout-confirm-option' : stageIndex === 2 ? 'video' : 'layout-text', stageIndex)}
                          className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-xl border-2 border-brand-300 bg-brand-50 px-4 text-xs font-black text-brand-800 hover:bg-brand-100 cursor-pointer shrink-0 whitespace-nowrap"
                        >
                          <Plus size={14} className="shrink-0" /> {stageIndex === 1 ? 'Tạo phương án đầu tiên' : 'Tạo block đầu tiên'}
                        </button>
                      </div>
                    )}

                    {islandCard && islandBlocks.map((block, blockIndex) => (
                      <StageBlockItemCard
                        key={block.id}
                        block={block}
                        bIdx={blockIndex}
                        totalBlocks={islandBlocks.length}
                        stageIndex={stageIndex}
                        card={islandCard}
                        stageBlocks={islandBlocks}
                        readOnly={readOnly}
                        draggingBlockIdx={draggingBlockIdx}
                        dragOverBlockIdx={dragOverBlockIdx}
                        setDraggingBlockIdx={setDraggingBlockIdx}
                        setDragOverBlockIdx={setDragOverBlockIdx}
                        setIsTrashDragOver={setIsTrashDragOver}
                        moveBlock={moveBlock}
                        removeBlock={removeBlock}
                        updateStageBlocks={updateStageBlocks}
                        updateBlockItem={updateBlockItem}
                        updateLearnCard={updateLearnCard}
                        uploadingStageMedia={uploadingStageMedia}
                        setUploadingStageMedia={setUploadingStageMedia}
                        uploadLearnCardMedia={uploadLearnCardMedia}
                        uploadAdditionalImageItem={uploadAdditionalImageItem}
                        previewAikiVoice={previewAikiVoice}
                        previewSpeakingIndex={previewSpeakingIndex}
                        speakTextPreview={speakTextPreview}
                        courseId={courseId}
                        handleAddModule={handleAddModule}
                        stageInfo={{ title: ISLAND_6_STAGE_NAMES[stageIndex], icon: Target, desc: 'Nội dung bổ sung của chặng' }}
                        inputStyle={inputStyle}
                        textareaStyle={textareaStyle}
                        showToast={showToast}
                      />
                    ))}

                    {stageIndex === 1 && !readOnly && islandBlocks.length > 0 && (
                      <div className="flex justify-center pt-2">
                        <button
                          type="button"
                          onClick={() => handleAddModule('layout-confirm-option', stageIndex)}
                          className="inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-brand-400 bg-white/90 px-5 py-3 text-xs font-black text-brand-800 hover:bg-brand-50 hover:border-brand-500 shadow-xs transition active:scale-95 cursor-pointer"
                        >
                          <Plus size={16} /> + Thêm phương án lựa chọn mới (A, B, C...)
                        </button>
                      </div>
                    )}

                    {islandBlocks.length === 0 && (
                      <div className="rounded-xl border border-dashed border-sky-300 bg-white/80 px-4 py-8 text-center text-xs font-bold text-sky-800">
                        Thả block vào đây hoặc bấm “+ Thêm” ở thư viện bên trái.
                      </div>
                    )}
                  </div>

                  {/* Nút Điều hướng Chặng */}
                  <div className="mt-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-3 shadow-xs">
                    {stageIndex > 0 ? (
                      <button
                        type="button"
                        onClick={() => setActiveSection(`stage-${stageIndex - 1}` as Section)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-page px-4 py-2.5 text-xs font-bold text-text hover:bg-slate-100 transition active:scale-95 cursor-pointer shrink-0 whitespace-nowrap max-w-[48%] truncate"
                      >
                        ← Chặng trước: {ISLAND_6_STAGE_NAMES[stageIndex - 1]}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveSection('basics')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-page px-4 py-2.5 text-xs font-bold text-text hover:bg-slate-100 transition active:scale-95 cursor-pointer shrink-0 whitespace-nowrap max-w-[48%] truncate"
                      >
                        ← Thông tin trạm
                      </button>
                    )}

                    {stageIndex < 5 ? (
                      <button
                        type="button"
                        onClick={() => setActiveSection(`stage-${stageIndex + 1}` as Section)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-brand-700 transition active:scale-95 cursor-pointer shrink-0 whitespace-nowrap max-w-[50%] truncate"
                      >
                        Chặng tiếp theo: {ISLAND_6_STAGE_NAMES[stageIndex + 1]} ➔
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || !readiness.complete}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition active:scale-95 shrink-0 whitespace-nowrap max-w-[50%] truncate",
                          readiness.complete ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer" : "bg-slate-300 cursor-not-allowed opacity-70"
                        )}
                      >
                        {saving ? 'Đang lưu...' : 'Hoàn thành & Lưu trạm học ➔'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Live preview Đảo 6 chặng */}
                {showInlinePreview ? (() => {
                  const deferredJourney = deferredDraft.sixStageJourney || resolveIslandSixStageJourney(deferredDraft as any)
                  const deferredIslandCard = deferredDraft.learnCards[stageIndex]
                  return (
                    <StudentStagePreview
                      stageIndex={stageIndex}
                      isIsland={true}
                      sixStageJourney={deferredJourney}
                      stageCard={deferredIslandCard}
                      onCollapse={() => setShowInlinePreview(false)}
                    />
                  )
                })() : (
                  <CollapsedPreviewRail onExpand={() => setShowInlinePreview(true)} />
                )}
              </div>
            )
          })()}

          {/* ── AIKI RULE / CUSTOM STAGES (3 to 7) ── */}
          {(!isIslandCourse || lessonFormat === 'aiki-rule-3steps') && (lessonFormat === 'aiki-rule-3steps' || lessonFormat === 'aiki-rule-5steps' || activeSection.startsWith('stage-')) && (() => {
            const stageIndex = parseInt(activeSection.replace('stage-', ''), 10)
            const customStages = resolveCourseJourneyStages(courseId, lessonFormat, draft.customJourneyStages)
            const totalStages = customStages.length
            const defaultCards = lessonFormat === 'aiki-rule-3steps' ? createAikiRule3StepsCards() : createAikiRuleLearnCards()
            const card = draft.learnCards[stageIndex] ?? defaultCards[stageIndex]
            if (!card) return null
            const stageBlocks = getStageBlocks(card, stageIndex)

            const fallbackIcons = [Film, MessageCircleQuestion, Trophy, Clapperboard, BrainCircuit, Lightbulb, ScanSearch]
            const ruleStageInfo = lessonFormat === 'aiki-rule-3steps'
              ? [
                  { title: '1. Bài học', icon: Film, desc: '1. 🎬 Rạp chiếu video bài học & kiến thức trọng tâm' },
                  { title: '2. Kiểm tra', icon: MessageCircleQuestion, desc: '2. ⚡ Thử tài phản xạ (Trắc nghiệm củng cố quy tắc)' },
                  { title: '3. Hoàn thành', icon: Trophy, desc: '3. 🏆 Vinh danh, trao huy hiệu & nhận sao hoàn thành' },
                ]
              : [
                  { title: '1. Tình huống', icon: Clapperboard, desc: 'Mở đầu bằng câu chuyện/tình huống gần gũi kích thích sự tò mò.' },
                  { title: '2. Câu đố AIKI', icon: BrainCircuit, desc: 'Thử thách trực giác: Trẻ quan sát 2 tranh vẽ A và B để chọn ra tranh độc nhất.' },
                  { title: '3. Quy tắc', icon: Lightbulb, desc: 'Đúc kết bài học thành 1 quy tắc cốt lõi, dễ nhớ cho trẻ.' },
                  { title: '4. Giải thích', icon: ScanSearch, desc: 'So sánh trực quan 2 mặt: Kho dữ liệu sao chép của AI vs Não sáng tạo của con.' },
                  { title: '5. Chốt', icon: Trophy, desc: 'Tổng kết và trao huy hiệu/lời động viên tự hào cho bé.' },
                ]
            const stageDef = customStages[stageIndex]
            const stageInfo = stageDef
              ? {
                  title: stageDef.title || `${stageDef.index + 1}. ${stageDef.shortTitle || stageDef.title}`,
                  icon: (stageDef.iconName === 'Film'
                    ? Film
                    : stageDef.iconName === 'MessageCircleQuestion'
                    ? MessageCircleQuestion
                    : stageDef.iconName === 'Trophy'
                    ? Trophy
                    : (lessonFormat === 'aiki-rule-3steps' && ruleStageInfo[stageIndex])
                    ? ruleStageInfo[stageIndex]!.icon
                    : fallbackIcons[stageIndex % fallbackIcons.length]) ?? Lightbulb,
                  desc: stageDef.desc || (lessonFormat === 'aiki-rule-3steps' && ruleStageInfo[stageIndex]?.desc) || card.tip || '',
                }
              : (ruleStageInfo[stageIndex] ?? { title: card.title, icon: Lightbulb, desc: '' })
            const StageIcon = stageInfo.icon

            return (
              <div className={cn('grid min-w-0 items-start gap-5 transition-all', showInlinePreview ? 'xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,.95fr)]' : 'xl:grid-cols-[minmax(0,1fr)_56px]')}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Header chặng */}
                  <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-xs">
                          <StageIcon size={20} />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-brand-200 px-1.5 py-0.5 text-[10px] font-black text-brand-900 uppercase">
                              Chặng {stageIndex + 1}/{totalStages}
                            </span>
                            <h3 className="font-display text-lg text-brand-950">{stageInfo.title}</h3>
                          </div>
                          <p className="mt-0.5 text-xs font-semibold text-brand-800">{stageInfo.desc}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-brand-100 border border-brand-200 px-2.5 py-1 text-[11px] font-black text-brand-900">
                        {stageBlocks.length} khối nội dung
                      </span>
                    </div>
                  </div>

                  {/* ── FORM SOẠN THẢO QUY TẮC AIKI 3 BƯỚC (CHUẨN FRONTEND) ── */}
                  {lessonFormat === 'aiki-rule-3steps' && stageIndex === 0 && (() => {
                    const videoConfig = (draft.sixStageJourney || buildRuleSyntheticJourney(draft)).stage3_video || {
                      title: draft.title || card.title || 'Video bài học',
                      videoUrl: draft.videoUrl || card.videoUrl || '',
                      durationSec: 60,
                      posterUrl: card.imageUrl || '',
                      timestamps: [],
                    }

                    return (
                      <div className="space-y-4 rounded-2xl border-2 border-indigo-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                          <h4 className="flex items-center gap-2 text-sm font-black uppercase text-indigo-950">
                            <Film size={18} className="text-indigo-600" />
                            🎬 Cấu hình Video Bài Học (Chuẩn Frontend)
                          </h4>
                          <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                            Chặng 1: Bài học
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700">Tiêu đề video bài học</label>
                          <input
                            type="text"
                            value={videoConfig.title}
                            disabled={readOnly}
                            onChange={(e) => {
                              const val = e.target.value
                              updateSixStage((j) => ({ ...j, stage3_video: { ...j.stage3_video, title: val } }))
                            }}
                            placeholder="VD: 10 Quy tắc Vàng giúp con không bị AI bắt nạt"
                            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-bold text-text"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700">Đường dẫn video (YouTube URL hoặc MP4)</label>
                          <div className="mt-1.5 flex gap-2">
                            <input
                              type="text"
                              value={videoConfig.videoUrl}
                              disabled={readOnly}
                              onChange={(e) => {
                                const val = e.target.value
                                updateSixStage((j) => ({ ...j, stage3_video: { ...j.stage3_video, videoUrl: val } }))
                              }}
                              placeholder="https://www.youtube.com/watch?v=... hoặc URL MP4"
                              className="flex-1 rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text font-mono"
                            />
                            <label className="flex items-center gap-1 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 cursor-pointer shrink-0">
                              <span>📹 Tải video</span>
                              <input
                                type="file"
                                accept="video/*"
                                disabled={readOnly}
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (!file) return
                                  try {
                                    const res = await uploadCmsCourseMedia({ file, purpose: 'aiki_rule_video', questId: lecture?.id })
                                    if (res?.url) {
                                      updateSixStage((j) => ({
                                        ...j,
                                        stage3_video: { ...j.stage3_video, videoUrl: res.url },
                                      }))
                                      showToast('Đã tải video bài học lên thành công!', 'success')
                                    }
                                  } catch (err) {
                                    showToast(`Lỗi tải video: ${err instanceof Error ? err.message : 'Không xác định'}`, 'error')
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-black uppercase text-slate-700">Thời lượng (giây)</label>
                            <input
                              type="number"
                              value={videoConfig.durationSec || 60}
                              disabled={readOnly}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 60
                                updateSixStage((j) => ({ ...j, stage3_video: { ...j.stage3_video, durationSec: val } }))
                              }}
                              className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black uppercase text-slate-700">Ảnh bìa video (Poster URL)</label>
                            <div className="mt-1.5 flex gap-2">
                              <input
                                type="text"
                                value={videoConfig.posterUrl || ''}
                                disabled={readOnly}
                                onChange={(e) => {
                                  const val = e.target.value
                                  updateSixStage((j) => ({ ...j, stage3_video: { ...j.stage3_video, posterUrl: val } }))
                                }}
                                placeholder="https://... hoặc tải ảnh"
                                className="flex-1 rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text font-mono"
                              />
                              <label className="flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer shrink-0">
                                <span>🖼️ Tải ảnh</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={readOnly}
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    try {
                                      const res = await uploadCmsCourseMedia({ file, purpose: 'aiki_rule_poster', questId: lecture?.id })
                                      if (res?.url) {
                                        updateSixStage((j) => ({
                                          ...j,
                                          stage3_video: { ...j.stage3_video, posterUrl: res.url },
                                        }))
                                        showToast('Đã tải ảnh poster lên thành công!', 'success')
                                      }
                                    } catch (err) {
                                      showToast(`Lỗi tải ảnh poster: ${err instanceof Error ? err.message : 'Không xác định'}`, 'error')
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-black uppercase text-slate-700">Mốc phân đoạn video (Timestamps)</label>
                            <button
                              type="button"
                              disabled={readOnly}
                              onClick={() => {
                                updateSixStage((j) => {
                                  const ts = j.stage3_video.timestamps ? [...j.stage3_video.timestamps] : []
                                  ts.push({ label: `Phân đoạn ${ts.length + 1}`, startSec: 0, endSec: 60 })
                                  return { ...j, stage3_video: { ...j.stage3_video, timestamps: ts } }
                                })
                              }}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            >
                              + Thêm mốc thời gian
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(videoConfig.timestamps || []).map((ts, tsIdx) => (
                              <div key={tsIdx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                                <input
                                  type="text"
                                  value={ts.label}
                                  disabled={readOnly}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    updateSixStage((j) => {
                                      const items = [...(j.stage3_video.timestamps || [])]
                                      items[tsIdx] = { ...items[tsIdx], label: val }
                                      return { ...j, stage3_video: { ...j.stage3_video, timestamps: items } }
                                    })
                                  }}
                                  placeholder="Tên phân đoạn..."
                                  className="flex-1 rounded-lg border border-border bg-white px-2 py-1 text-xs font-semibold"
                                />
                                <input
                                  type="number"
                                  value={ts.startSec}
                                  disabled={readOnly}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10) || 0
                                    updateSixStage((j) => {
                                      const items = [...(j.stage3_video.timestamps || [])]
                                      items[tsIdx] = { ...items[tsIdx], startSec: val }
                                      return { ...j, stage3_video: { ...j.stage3_video, timestamps: items } }
                                    })
                                  }}
                                  className="w-16 rounded-lg border border-border bg-white px-2 py-1 text-xs font-semibold text-center"
                                  title="Giây bắt đầu"
                                />
                                <span className="text-xs text-muted">➔</span>
                                <input
                                  type="number"
                                  value={ts.endSec}
                                  disabled={readOnly}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10) || 0
                                    updateSixStage((j) => {
                                      const items = [...(j.stage3_video.timestamps || [])]
                                      items[tsIdx] = { ...items[tsIdx], endSec: val }
                                      return { ...j, stage3_video: { ...j.stage3_video, timestamps: items } }
                                    })
                                  }}
                                  className="w-16 rounded-lg border border-border bg-white px-2 py-1 text-xs font-semibold text-center"
                                  title="Giây kết thúc"
                                />
                                <button
                                  type="button"
                                  disabled={readOnly}
                                  onClick={() => {
                                    updateSixStage((j) => {
                                      const items = (j.stage3_video.timestamps || []).filter((_, i) => i !== tsIdx)
                                      return { ...j, stage3_video: { ...j.stage3_video, timestamps: items } }
                                    })
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {lessonFormat === 'aiki-rule-3steps' && stageIndex === 1 && (() => {
                    const quizConfig = (draft.sixStageJourney || buildRuleSyntheticJourney(draft)).stage4_quiz || {
                      title: `Thử tài phản xạ: ${draft.title || 'Quy tắc AIKI'}`,
                      passScore: 1,
                      questions: [],
                    }

                    return (
                      <div className="space-y-4 rounded-2xl border-2 border-amber-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                          <h4 className="flex items-center gap-2 text-sm font-black uppercase text-amber-950">
                            <MessageCircleQuestion size={18} className="text-amber-600" />
                            ⚡ Soạn Câu Hỏi Thử Tài Phản Xạ (Reflex Quiz)
                          </h4>
                          <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                            Chặng 2: Kiểm tra
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-black uppercase text-slate-700">Tiêu đề thử tài phản xạ</label>
                            <input
                              type="text"
                              value={quizConfig.title}
                              disabled={readOnly}
                              onChange={(e) => {
                                const val = e.target.value
                                updateSixStage((j) => ({ ...j, stage4_quiz: { ...j.stage4_quiz, title: val } }))
                              }}
                              placeholder="VD: Thử tài phản xạ: Bức tranh nào là độc nhất?"
                              className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-bold text-text"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black uppercase text-slate-700">Điểm đạt tối thiểu (số câu)</label>
                            <input
                              type="number"
                              value={quizConfig.passScore || 1}
                              disabled={readOnly}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 1
                                updateSixStage((j) => ({ ...j, stage4_quiz: { ...j.stage4_quiz, passScore: val } }))
                              }}
                              className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-black uppercase text-slate-700">
                              Danh sách câu hỏi trắc nghiệm ({quizConfig.questions.length})
                            </label>
                            <button
                              type="button"
                              disabled={readOnly}
                              onClick={() => {
                                updateSixStage((j) => {
                                  const qs = [...(j.stage4_quiz.questions || [])]
                                  qs.push({
                                    id: `q-${Date.now().toString(36)}`,
                                    prompt: 'Bức tranh nào thể hiện đúng quy tắc sáng tạo?',
                                    options: ['Phương án A: Sao chép ý tưởng', 'Phương án B: Sáng tạo cảm xúc riêng'],
                                    correctIndex: 1,
                                    explanation: 'Chính xác! Tranh sáng tạo từ cảm xúc riêng luôn là độc nhất!',
                                  })
                                  return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                                })
                              }}
                              className="text-xs font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                            >
                              + Thêm câu hỏi
                            </button>
                          </div>

                          {quizConfig.questions.map((q, qIdx) => (
                            <div key={q.id || qIdx} className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 space-y-3">
                              <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-2">
                                <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                                  <span>❓ Câu hỏi #{qIdx + 1}</span>
                                </span>
                                {quizConfig.questions.length > 1 && (
                                  <button
                                    type="button"
                                    disabled={readOnly}
                                    onClick={() => {
                                      updateSixStage((j) => {
                                        const qs = j.stage4_quiz.questions.filter((_, i) => i !== qIdx)
                                        return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                                      })
                                    }}
                                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                    title="Xóa câu hỏi này"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nội dung câu hỏi / Câu lệnh</label>
                                <input
                                  type="text"
                                  value={q.prompt}
                                  disabled={readOnly}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    updateSixStage((j) => {
                                      const qs = [...j.stage4_quiz.questions]
                                      qs[qIdx] = { ...qs[qIdx], prompt: val }
                                      return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                                    })
                                  }}
                                  placeholder="Nội dung câu hỏi trắc nghiệm..."
                                  className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-text"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Ảnh minh họa câu hỏi (visualUrl - tùy chọn)</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={q.visualUrl || ''}
                                    disabled={readOnly}
                                    onChange={(e) => {
                                      const val = e.target.value
                                      updateSixStage((j) => {
                                        const qs = [...j.stage4_quiz.questions]
                                        qs[qIdx] = { ...qs[qIdx], visualUrl: val }
                                        return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                                      })
                                    }}
                                    placeholder="https://... hoặc tải ảnh"
                                    className="flex-1 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-mono"
                                  />
                                  <label className="flex items-center gap-1 rounded-lg bg-amber-100 border border-amber-300 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-200 cursor-pointer shrink-0">
                                    <span>🖼️ Tải ảnh</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      disabled={readOnly}
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        try {
                                          const res = await uploadCmsCourseMedia({ file, purpose: 'aiki_quiz_visual', questId: lecture?.id })
                                          if (res?.url) {
                                            updateSixStage((j) => {
                                              const qs = [...j.stage4_quiz.questions]
                                              qs[qIdx] = { ...qs[qIdx], visualUrl: res.url }
                                              return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                                            })
                                            showToast('Đã tải ảnh câu hỏi lên!', 'success')
                                          }
                                        } catch (err) {
                                          showToast(`Lỗi tải ảnh: ${err instanceof Error ? err.message : 'Không xác định'}`, 'error')
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-[11px] font-bold text-slate-700">Các phương án lựa chọn (Chọn tròn để đặt đáp án đúng):</p>
                                  <button
                                    type="button"
                                    disabled={readOnly}
                                    onClick={() => {
                                      updateSixStage((j) => {
                                        const qs = [...j.stage4_quiz.questions]
                                        const opts = [...qs[qIdx].options, `Phương án mới`]
                                        qs[qIdx] = { ...qs[qIdx], options: opts }
                                        return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                                      })
                                    }}
                                    className="text-[10px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                                  >
                                    + Thêm phương án
                                  </button>
                                </div>

                                {q.options.map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`rule-quiz-correct-${qIdx}`}
                                      checked={q.correctIndex === optIdx}
                                      disabled={readOnly}
                                      onChange={() => {
                                        updateSixStage((j) => {
                                          const qs = [...j.stage4_quiz.questions]
                                          qs[qIdx] = { ...qs[qIdx], correctIndex: optIdx }
                                          return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                                        })
                                      }}
                                      title="Chọn làm đáp án đúng"
                                      className="size-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={opt}
                                      disabled={readOnly}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        updateSixStage((j) => {
                                          const qs = [...j.stage4_quiz.questions]
                                          const opts = [...qs[qIdx].options]
                                          opts[optIdx] = val
                                          qs[qIdx] = { ...qs[qIdx], options: opts }
                                          return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                                        })
                                      }}
                                      className={cn(
                                        "flex-1 rounded-lg border bg-white px-2.5 py-1 text-xs font-semibold",
                                        q.correctIndex === optIdx ? "border-emerald-400 bg-emerald-50/50 text-emerald-950 font-bold" : "border-border text-text"
                                      )}
                                    />
                                    {q.options.length > 2 && (
                                      <button
                                        type="button"
                                        disabled={readOnly}
                                        onClick={() => {
                                          updateSixStage((j) => {
                                            const qs = [...j.stage4_quiz.questions]
                                            const opts = qs[qIdx].options.filter((_, i) => i !== optIdx)
                                            let corr = qs[qIdx].correctIndex
                                            if (corr === optIdx) corr = 0
                                            else if (corr > optIdx) corr -= 1
                                            qs[qIdx] = { ...qs[qIdx], options: opts, correctIndex: corr }
                                            return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                                          })
                                        }}
                                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                        title="Xóa phương án này"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Giải thích / Lời khuyên của AIKI khi trả lời</label>
                                <input
                                  type="text"
                                  value={q.explanation || ''}
                                  disabled={readOnly}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    updateSixStage((j) => {
                                      const qs = [...j.stage4_quiz.questions]
                                      qs[qIdx] = { ...qs[qIdx], explanation: val }
                                      return { ...j, stage4_quiz: { ...j.stage4_quiz, questions: qs } }
                                    })
                                  }}
                                  placeholder="VD: Chính xác! Tranh sáng tạo từ cảm xúc riêng luôn là độc nhất!"
                                  className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs text-slate-700"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  {lessonFormat === 'aiki-rule-3steps' && stageIndex === 2 && (() => {
                    const completionConfig = (draft.sixStageJourney || buildRuleSyntheticJourney(draft)).stage6_completion || {
                      title: `Chúc mừng con đã hoàn thành bài học!`,
                      congratsMessage: `Con đã nắm vững quy tắc sáng tạo này! Hãy tiếp tục phát huy nhé!`,
                      rewardBadge: {
                        name: draft.reward || 'Huy hiệu Sáng Tạo AIKI',
                        iconUrl: card.imageUrl || '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2',
                        stars: 3,
                        xp: 50,
                      },
                      nextLessonSlug: '',
                    }

                    return (
                      <div className="space-y-4 rounded-2xl border-2 border-emerald-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                          <h4 className="flex items-center gap-2 text-sm font-black uppercase text-emerald-950">
                            <Trophy size={18} className="text-emerald-600" />
                            🏆 Cấu hình Màn Hoàn Thành & Trao Thưởng
                          </h4>
                          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                            Chặng 3: Hoàn thành
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700">Tiêu đề màn kết thúc</label>
                          <input
                            type="text"
                            value={completionConfig.title}
                            disabled={readOnly}
                            onChange={(e) => {
                              const val = e.target.value
                              updateSixStage((j) => ({ ...j, stage6_completion: { ...j.stage6_completion, title: val } }))
                            }}
                            placeholder="VD: Chúc Mừng Con Đã Chinh Phục Quy Tắc!"
                            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-bold text-text"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700">Thông điệp chúc mừng của AIKI</label>
                          <textarea
                            rows={3}
                            value={completionConfig.congratsMessage}
                            disabled={readOnly}
                            onChange={(e) => {
                              const val = e.target.value
                              updateSixStage((j) => ({ ...j, stage6_completion: { ...j.stage6_completion, congratsMessage: val } }))
                            }}
                            placeholder="Lời khen ngợi và động viên từ Mèo AIKI..."
                            className="mt-1.5 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-black uppercase text-slate-700">Tên huy hiệu nhận được</label>
                            <input
                              type="text"
                              value={completionConfig.rewardBadge?.name || ''}
                              disabled={readOnly}
                              onChange={(e) => {
                                const val = e.target.value
                                updateSixStage((j) => ({
                                  ...j,
                                  stage6_completion: {
                                    ...j.stage6_completion,
                                    rewardBadge: { ...j.stage6_completion.rewardBadge, name: val },
                                  },
                                }))
                              }}
                              placeholder="VD: Huy hiệu Bút Vẽ Thần Kỳ"
                              className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black uppercase text-slate-700">Ảnh huy hiệu (iconUrl)</label>
                            <div className="mt-1.5 flex gap-2">
                              <input
                                type="text"
                                value={completionConfig.rewardBadge?.iconUrl || ''}
                                disabled={readOnly}
                                onChange={(e) => {
                                  const val = e.target.value
                                  updateSixStage((j) => ({
                                    ...j,
                                    stage6_completion: {
                                      ...j.stage6_completion,
                                      rewardBadge: { ...j.stage6_completion.rewardBadge, iconUrl: val },
                                    },
                                  }))
                                }}
                                placeholder="https://... hoặc tải ảnh"
                                className="flex-1 rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text font-mono"
                              />
                              <label className="flex items-center gap-1 rounded-xl bg-emerald-100 border border-emerald-300 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-200 cursor-pointer shrink-0">
                                <span>🖼️ Tải ảnh</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={readOnly}
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    try {
                                      const res = await uploadCmsCourseMedia({ file, purpose: 'aiki_rule_badge', questId: lecture?.id })
                                      if (res?.url) {
                                        updateSixStage((j) => ({
                                          ...j,
                                          stage6_completion: {
                                            ...j.stage6_completion,
                                            rewardBadge: { ...j.stage6_completion.rewardBadge, iconUrl: res.url },
                                          },
                                        }))
                                        showToast('Đã tải ảnh huy hiệu lên!', 'success')
                                      }
                                    } catch (err) {
                                      showToast(`Lỗi tải ảnh: ${err instanceof Error ? err.message : 'Không xác định'}`, 'error')
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-black uppercase text-slate-700">Số sao thưởng (Stars)</label>
                            <input
                              type="number"
                              value={completionConfig.rewardBadge?.stars ?? 3}
                              disabled={readOnly}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 3
                                updateSixStage((j) => ({
                                  ...j,
                                  stage6_completion: {
                                    ...j.stage6_completion,
                                    rewardBadge: { ...j.stage6_completion.rewardBadge, stars: val },
                                  },
                                }))
                              }}
                              className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black uppercase text-slate-700">Điểm kinh nghiệm (XP)</label>
                            <input
                              type="number"
                              value={completionConfig.rewardBadge?.xp ?? 50}
                              disabled={readOnly}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 50
                                updateSixStage((j) => ({
                                  ...j,
                                  stage6_completion: {
                                    ...j.stage6_completion,
                                    rewardBadge: { ...j.stage6_completion.rewardBadge, xp: val },
                                  },
                                }))
                              }}
                              className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black uppercase text-slate-700">Slug bài tiếp theo (Tùy chọn)</label>
                            <input
                              type="text"
                              value={completionConfig.nextLessonSlug || ''}
                              disabled={readOnly}
                              onChange={(e) => {
                                const val = e.target.value
                                updateSixStage((j) => ({
                                  ...j,
                                  stage6_completion: {
                                    ...j.stage6_completion,
                                    nextLessonSlug: val,
                                  },
                                }))
                              }}
                              placeholder="VD: quy-tac-2-buc-tranh-doc-nhat"
                              className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* ── CANVAS CHẶNG (PURE BLOCK-BASED) ── */}
                  {stageBlocks.length === 0 ? (
                    /* 📥 EMPTY STATE DROPZONE: Vùng Thả Rỗng Khi Chặng Chưa Có Khối Nào */
                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = 'copy'
                        if (!isDragOver) setIsDragOver(true)
                      }}
                      onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setIsDragOver(false)
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        setIsDragOver(false)
                        const blockId = e.dataTransfer.getData('text/plain')
                        if (blockId) {
                          handleAddModule(blockId, stageIndex)
                        }
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-3xl border-3 border-dashed py-14 px-6 text-center transition-all duration-200",
                        isDragOver
                          ? "border-brand-500 bg-brand-50/90 ring-4 ring-brand-300/50 scale-[1.01]"
                          : "border-sky-300 bg-gradient-to-b from-sky-50/60 to-brand-50/30 hover:border-brand-400 hover:bg-sky-50/80"
                      )}
                    >
                      <div className="grid size-16 place-items-center rounded-2xl bg-white shadow-md text-3xl mb-3 border border-sky-200">
                        {isDragOver ? '✨' : '📥'}
                      </div>
                      <h4 className="font-display text-base font-black text-sky-950 sm:text-lg">
                        {isDragOver ? 'Thả khối tính năng vào đây để tạo nội dung ngay!' : 'Vùng Kéo Thả Soạn Chặng Đang Trống'}
                      </h4>
                      <p className="mt-1.5 max-w-md text-xs font-semibold text-sky-800 leading-relaxed">
                        Kéo thả các khối tính năng từ bảng bên trái vào đây để bắt đầu nhập liệu, hoặc bấm nhanh vào các khối gợi ý bên dưới:
                      </p>

                      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-xl">
                        {AVAILABLE_MODULES.map((mod) => (
                          <button
                            key={mod.id}
                            type="button"
                            draggable={!readOnly}
                            onDragStart={(event) => {
                              event.dataTransfer.setData('text/plain', mod.id)
                              event.dataTransfer.effectAllowed = 'copy'
                            }}
                            disabled={readOnly}
                            onClick={() => handleAddModule(mod.id, stageIndex)}
                            className="flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-xs font-black text-slate-800 shadow-2xs hover:border-brand-400 hover:bg-brand-50 hover:text-brand-900 transition active:scale-95 cursor-pointer text-left"
                          >
                            <span className="text-base">{mod.icon}</span>
                            <span className="truncate">{mod.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* 🧱 DANH SÁCH CÁC BLOCK CARDS ĐÃ KÍCH HOẠT */
                    <div className="space-y-4">
                      {/* 🗑️ VÙNG THẢ ĐỂ XÓA KHỐI KHI ĐANG KÉO */}
                      {draggingBlockIdx !== null && (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.dataTransfer.dropEffect = 'move'
                            if (!isTrashDragOver) setIsTrashDragOver(true)
                          }}
                          onDragLeave={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                              setIsTrashDragOver(false)
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            setIsTrashDragOver(false)
                            if (draggingBlockIdx !== null && stageBlocks[draggingBlockIdx]) {
                              removeBlock(stageIndex, stageBlocks[draggingBlockIdx].id)
                              setDraggingBlockIdx(null)
                            }
                          }}
                          className={cn(
                            "flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 px-4 text-center transition-all animate-pulse",
                            isTrashDragOver
                              ? "border-rose-500 bg-rose-100 text-rose-800 scale-[1.02] shadow-md ring-4 ring-rose-200"
                              : "border-rose-300 bg-rose-50/80 text-rose-700 hover:border-rose-400 hover:bg-rose-100/60"
                          )}
                        >
                          <Trash2 size={20} className={isTrashDragOver ? "scale-125 transition-transform text-rose-600" : "text-rose-500"} />
                          <span className="text-sm font-extrabold">
                            {isTrashDragOver ? 'Thả vào đây để xóa khối này ngay lập tức!' : 'Kéo khối thả vào đây để gỡ bỏ khỏi chặng'}
                          </span>
                        </div>
                      )}

                      {/* 📦 DANH SÁCH KHỐI NỘI DUNG TUẦN TỰ */}
                      {stageBlocks.map((block, bIdx) => (
                        <StageBlockItemCard
                          key={block.id}
                          block={block}
                          bIdx={bIdx}
                          totalBlocks={stageBlocks.length}
                          stageIndex={stageIndex}
                          card={card}
                          stageBlocks={stageBlocks}
                          readOnly={readOnly}
                          draggingBlockIdx={draggingBlockIdx}
                          dragOverBlockIdx={dragOverBlockIdx}
                          setDraggingBlockIdx={setDraggingBlockIdx}
                          setDragOverBlockIdx={setDragOverBlockIdx}
                          setIsTrashDragOver={setIsTrashDragOver}
                          moveBlock={moveBlock}
                          removeBlock={removeBlock}
                          updateStageBlocks={updateStageBlocks}
                          updateBlockItem={updateBlockItem}
                          updateLearnCard={updateLearnCard}
                          uploadingStageMedia={uploadingStageMedia}
                          setUploadingStageMedia={setUploadingStageMedia}
                          uploadLearnCardMedia={uploadLearnCardMedia}
                          uploadAdditionalImageItem={uploadAdditionalImageItem}
                          previewAikiVoice={previewAikiVoice}
                          previewSpeakingIndex={previewSpeakingIndex}
                          speakTextPreview={speakTextPreview}
                          courseId={courseId}
                          handleAddModule={handleAddModule}
                          stageInfo={stageInfo}
                          inputStyle={inputStyle}
                          textareaStyle={textareaStyle}
                          showToast={showToast}
                        />
                      ))}

                      {/* ➕ BOTTOM DROPZONE & QUICK ADD */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.dataTransfer.dropEffect = 'copy'
                          if (!isDragOver) setIsDragOver(true)
                        }}
                        onDragLeave={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            setIsDragOver(false)
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          setIsDragOver(false)
                          const blockId = e.dataTransfer.getData('text/plain')
                          if (blockId) {
                            handleAddModule(blockId, stageIndex)
                          }
                        }}
                        className={cn(
                          "rounded-2xl border-2 border-dashed p-4 transition-all duration-200 text-center",
                          isDragOver
                            ? "border-brand-500 bg-brand-50/90 ring-4 ring-brand-300/40"
                            : "border-sky-200 bg-sky-50/50 hover:border-brand-300 hover:bg-sky-50/80"
                        )}
                      >
                        <p className="text-xs font-bold text-sky-900">
                          {isDragOver ? '✨ Thả để thêm khối vào cuối chặng!' : '➕ Thêm khối vào chặng này (kéo từ menu trái hoặc bấm nhanh):'}
                        </p>
                        <div className="mt-2.5 flex flex-wrap justify-center gap-2">
                          {AVAILABLE_MODULES.map((mod) => (
                            <button
                              key={mod.id}
                              type="button"
                              draggable={!readOnly}
                              onDragStart={(event) => {
                                event.dataTransfer.setData('text/plain', mod.id)
                                event.dataTransfer.effectAllowed = 'copy'
                              }}
                              disabled={readOnly}
                              onClick={() => handleAddModule(mod.id, stageIndex)}
                              className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-black text-slate-800 shadow-2xs hover:border-brand-400 hover:bg-brand-50 transition cursor-pointer active:scale-95"
                              title={mod.desc}
                            >
                              <span>{mod.icon}</span>
                              <span>+ {mod.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  
                  {/* Nút Chặng trước & Chặng tiếp theo ở cuối màn hình */}
                  <div className="mt-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-3 shadow-xs">
                    {stageIndex > 0 ? (
                      <button
                        type="button"
                        onClick={() => setActiveSection(`stage-${stageIndex - 1}` as Section)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-page px-4 py-2.5 text-xs font-bold text-text hover:bg-slate-100 transition active:scale-95 shrink-0 whitespace-nowrap max-w-[48%] truncate cursor-pointer"
                      >
                        ← Chặng trước: {customStages[stageIndex - 1]?.shortTitle || AIKI_STAGE_NAMES[stageIndex - 1] || `Chặng ${stageIndex}`}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveSection('basics')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-page px-4 py-2.5 text-xs font-bold text-text hover:bg-slate-100 transition active:scale-95 shrink-0 whitespace-nowrap max-w-[48%] truncate cursor-pointer"
                      >
                        ← Thông tin trạm
                      </button>
                    )}

                    {stageIndex < totalStages - 1 ? (
                      <button
                        type="button"
                        onClick={() => setActiveSection(`stage-${stageIndex + 1}` as Section)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-brand-700 transition active:scale-95 shrink-0 whitespace-nowrap max-w-[50%] truncate cursor-pointer"
                      >
                        Chặng tiếp theo: {customStages[stageIndex + 1]?.shortTitle || AIKI_STAGE_NAMES[stageIndex + 1] || `Chặng ${stageIndex + 2}`} ➔
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || !readiness.complete}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition active:scale-95 shrink-0 whitespace-nowrap max-w-[50%] truncate",
                          readiness.complete ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer" : "bg-slate-300 cursor-not-allowed opacity-70"
                        )}
                      >
                        {saving ? 'Đang lưu...' : 'Hoàn thành & Lưu trạm học ➔'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Live preview */}
                {showInlinePreview ? (() => {
                  const deferredCard = deferredDraft.learnCards[stageIndex] ?? card
                  return (
                    <StudentStagePreview
                      card={deferredCard}
                      stageIndex={stageIndex}
                      onCollapse={() => setShowInlinePreview(false)}
                      lessonFormat={lessonFormat}
                      sixStageJourney={buildRuleSyntheticJourney(deferredDraft)}
                    />
                  )
                })() : (
                  <CollapsedPreviewRail onExpand={() => setShowInlinePreview(true)} />
                )}
              </div>
            )
          })()}

          {/* ── CONTENT ── */}
          {lessonFormat === 'standard' && activeSection === 'content' && (
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,.95fr)]">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/50 p-4 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-wide text-brand-800">Dạng bài học</p>
                <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => setLessonFormat('standard')}
                    className="flex flex-col items-start rounded-xl border-2 p-3 text-left transition border-brand-500 bg-white shadow-sm ring-2 ring-brand-200"
                  >
                    <span className="flex items-center gap-2 text-sm font-extrabold text-text">
                      <BookOpen size={16} className="text-brand-600" /> Khám phá tự do
                    </span>
                    <span className="mt-1 text-xs text-muted">Tự do thêm bớt và sắp xếp các khối Khái niệm, Ví dụ, So sánh...</span>
                  </button>

                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => {
                      setLessonFormat('aiki-rule-5steps')
                      applyAikiRuleTemplate()
                    }}
                    className="flex flex-col items-start rounded-xl border-2 p-3 text-left transition border-border bg-white/60 hover:bg-white"
                  >
                    <span className="flex items-center gap-2 text-sm font-extrabold text-text">
                      <Clapperboard size={16} className="text-brand-600" /> Quy tắc AIKI (5 chặng)
                    </span>
                    <span className="mt-1 text-xs text-muted">Mạch chuẩn: Tình huống ➔ Câu đố ➔ Quy tắc ➔ Giải thích ➔ Chốt. Có Video & Mèo AIKI.</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-sun-200 bg-sun-50 px-3.5 py-3 text-xs font-bold leading-relaxed text-sun-900">
                <strong>Mỗi khối là một màn đọc ngắn của học sinh.</strong> Chọn loại nội dung, layout và sắp thứ tự theo mạch: hiểu ý chính → xem ví dụ → tự ghi nhớ.
              </div>

              {draft.learnCards.map((card, index) => (
                <section key={card.id} className="rounded-2xl border-2 border-border bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-extrabold text-text">Khối {index + 1}: {card.title}</p>
                    <div className="flex gap-1">
                      <button type="button" disabled={readOnly || index === 0} onClick={() => moveLearnCard(index, -1)} className="grid size-10 place-items-center rounded-xl border border-border text-muted disabled:opacity-30" aria-label={`Đưa khối ${index + 1} lên`}><ChevronUp size={17} /></button>
                      <button type="button" disabled={readOnly || index === draft.learnCards.length - 1} onClick={() => moveLearnCard(index, 1)} className="grid size-10 place-items-center rounded-xl border border-border text-muted disabled:opacity-30" aria-label={`Đưa khối ${index + 1} xuống`}><ChevronDown size={17} /></button>
                      <button type="button" disabled={readOnly || draft.learnCards.length <= 2} onClick={() => removeLearnCard(index)} className="grid size-10 place-items-center rounded-xl border border-border text-danger disabled:opacity-30" aria-label={`Xóa khối ${index + 1}`}><Trash2 size={17} /></button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-extrabold text-text">Loại nội dung
                      <select disabled={readOnly} value={card.kind} onChange={(event) => updateLearnCard(index, { kind: event.target.value as LearnCardDraft['kind'] })} style={{ ...inputStyle, marginTop: '0.35rem' }}>
                        {LEARN_KIND_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-extrabold text-text">Cách trình bày
                      <select disabled={readOnly} value={card.layout} onChange={(event) => updateLearnCard(index, { layout: event.target.value as LearnCardDraft['layout'] })} style={{ ...inputStyle, marginTop: '0.35rem' }}>
                        {LEARN_LAYOUT_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                      </select>
                    </label>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-muted">{LEARN_LAYOUT_OPTIONS.find((option) => option.id === card.layout)?.description}</p>
                  <label className="mt-3 block text-xs font-extrabold text-text">Tiêu đề khối
                    <input readOnly={readOnly} value={card.title} onChange={(event) => updateLearnCard(index, { title: event.target.value })} style={{ ...inputStyle, marginTop: '0.35rem' }} />
                  </label>
                  <label className="mt-3 block text-xs font-extrabold text-text">Nội dung học sinh đọc
                    <textarea readOnly={readOnly} value={card.body} onChange={(event) => updateLearnCard(index, { body: event.target.value })} rows={4} style={{ ...textareaStyle, marginTop: '0.35rem' }} placeholder="Giải thích một ý rõ ràng trong 2–4 câu..." />
                  </label>
                  <label className="mt-3 block text-xs font-extrabold text-text">Câu ghi nhớ
                    <input readOnly={readOnly} value={card.tip} onChange={(event) => updateLearnCard(index, { tip: event.target.value })} style={{ ...inputStyle, marginTop: '0.35rem' }} placeholder="Một câu ngắn để học sinh nhớ ý chính" />
                  </label>
                  <div className="mt-3 grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
                    <label className="text-[11px] font-extrabold text-muted">Video chính của phần
                      <input type="url" readOnly={readOnly} value={card.videoUrl ?? ''} onChange={(event) => updateLearnCard(index, { videoUrl: event.target.value })} style={{ ...inputStyle, marginTop: '0.25rem' }} placeholder="https://cdn.example.com/video.mp4 hoặc YouTube" />
                      <span className="mt-1 block text-[11px] font-bold text-amber-700 leading-tight">
                        💡 Khi nhập Video URL, video sẽ tự động thay thế khung kịch bản phân cảnh trên màn hình học sinh.
                      </span>
                      {!readOnly && <span className="mt-2 flex min-h-11 cursor-pointer items-center justify-center rounded-xl border-2 border-brand-200 bg-white px-3 text-xs font-extrabold text-brand-700"><Clapperboard size={16} className="mr-2" aria-hidden="true" />{uploadingStageMedia === `${index}:videoUrl` ? 'Đang tải video…' : 'Tải video lên'}<input className="sr-only" type="file" accept="video/mp4,video/webm" disabled={uploadingStageMedia !== null} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadLearnCardMedia(index, 'videoUrl', file); event.currentTarget.value = '' }} /></span>}
                    </label>
                    <label className="text-[11px] font-extrabold text-muted">Ảnh chính của phần
                      <input type="url" readOnly={readOnly} value={card.imageUrl ?? ''} onChange={(event) => updateLearnCard(index, { imageUrl: event.target.value })} style={{ ...inputStyle, marginTop: '0.25rem' }} placeholder="https://cdn.example.com/image.webp" />
                      {!readOnly && <span className="mt-2 flex min-h-11 cursor-pointer items-center justify-center rounded-xl border-2 border-brand-200 bg-white px-3 text-xs font-extrabold text-brand-700"><Eye size={16} className="mr-2" aria-hidden="true" />{uploadingStageMedia === `${index}:imageUrl` ? 'Đang tải ảnh…' : 'Tải ảnh lên'}<input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" disabled={uploadingStageMedia !== null} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadLearnCardMedia(index, 'imageUrl', file); event.currentTarget.value = '' }} /></span>}
                    </label>
                    {card.videoUrl && (
                      <div className="sm:col-span-2 overflow-hidden rounded-xl border border-border">
                        <LectureVideo title={card.title} url={card.videoUrl} />
                      </div>
                    )}
                    {card.imageUrl && !card.videoUrl && (
                      <div className="sm:col-span-2 overflow-hidden rounded-xl border border-border">
                        <img src={card.imageUrl} alt={card.imageAlt || card.title} className="aspect-video w-full rounded-xl object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      </div>
                    )}
                    <label className="text-[11px] font-extrabold text-muted sm:col-span-2">Mô tả ảnh cho trẻ dùng trình đọc màn hình
                      <input readOnly={readOnly} value={card.imageAlt ?? ''} onChange={(event) => updateLearnCard(index, { imageAlt: event.target.value })} style={{ ...inputStyle, marginTop: '0.25rem' }} placeholder="Mô tả điều quan trọng trong ảnh, không ghi 'hình ảnh'" />
                    </label>
                  </div>

                  {/* Khối tải 2 tranh phương án A và B cho Chặng 2 (aiki-riddle) */}
                  {card.kind === 'aiki-riddle' && (
                    <div className="mt-3 rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-4">
                      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
                        <BrainCircuit size={16} className="text-amber-700" />
                        🖼️ Hình ảnh 2 bức tranh cho phương án lựa chọn (A và B)
                      </p>
                      <p className="mt-1 text-xs font-medium text-amber-800">
                        Trẻ em 6–10 tuổi nhìn vào tranh vẽ trực quan để chọn! Nếu chưa upload ảnh, hệ thống tự động hiển thị tranh vẽ minh họa thủ công Hallmark Craft ngộ nghĩnh cực đẹp.
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {/* Ảnh Tranh A: Zico */}
                        <div className="rounded-xl border border-amber-200 bg-white p-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-amber-950">Ảnh A: Bức tranh của Zico</span>
                            <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-800">Phương án A</span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted">Siêu anh hùng quen thuộc (ai cũng vẽ được)</p>
                          <input
                            type="url"
                            readOnly={readOnly}
                            value={card.optionImages?.[0] ?? ''}
                            onChange={(event) => {
                              const next = [...(card.optionImages || ['', ''])]
                              next[0] = event.target.value
                              updateLearnCard(index, { optionImages: next })
                            }}
                            style={{ ...inputStyle, marginTop: '0.35rem' }}
                            placeholder="https://cdn.example.com/zico-hero.webp"
                          />
                          {!readOnly && (
                            <span className="mt-2 flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-3 text-xs font-extrabold text-amber-900 hover:bg-amber-100">
                              <Eye size={15} className="mr-1.5" />
                              {uploadingStageMedia === `${index}:optionImageA` ? 'Đang tải ảnh A…' : 'Tải ảnh tranh A lên'}
                              <input
                                className="sr-only"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                disabled={uploadingStageMedia !== null}
                                onChange={(event) => {
                                  const file = event.target.files?.[0]
                                  if (file) void uploadLearnCardMedia(index, 'optionImageA', file)
                                  event.currentTarget.value = ''
                                }}
                              />
                            </span>
                          )}
                          {card.optionImages?.[0] && (
                            <div className="mt-2 overflow-hidden rounded-lg border border-amber-200 aspect-video">
                              <img src={card.optionImages[0]} alt="Bức tranh của Zico" className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                            </div>
                          )}
                        </div>

                        {/* Ảnh Tranh B: Sonet */}
                        <div className="rounded-xl border border-sky-200 bg-white p-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-sky-950">Ảnh B: Bức tranh của Sonet</span>
                            <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-black text-sky-800">Phương án B</span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted">Siêu anh hùng bố cầm vợt muỗi (độc nhất của riêng con)</p>
                          <input
                            type="url"
                            readOnly={readOnly}
                            value={card.optionImages?.[1] ?? ''}
                            onChange={(event) => {
                              const next = [...(card.optionImages || ['', ''])]
                              next[1] = event.target.value
                              updateLearnCard(index, { optionImages: next })
                            }}
                            style={{ ...inputStyle, marginTop: '0.35rem' }}
                            placeholder="https://cdn.example.com/sonet-hero.webp"
                          />
                          {!readOnly && (
                            <span className="mt-2 flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-sky-300 bg-sky-50 px-3 text-xs font-extrabold text-sky-900 hover:bg-sky-100">
                              <Eye size={15} className="mr-1.5" />
                              {uploadingStageMedia === `${index}:optionImageB` ? 'Đang tải ảnh B…' : 'Tải ảnh tranh B lên'}
                              <input
                                className="sr-only"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                disabled={uploadingStageMedia !== null}
                                onChange={(event) => {
                                  const file = event.target.files?.[0]
                                  if (file) void uploadLearnCardMedia(index, 'optionImageB', file)
                                  event.currentTarget.value = ''
                                }}
                              />
                            </span>
                          )}
                          {card.optionImages?.[1] && (
                            <div className="mt-2 overflow-hidden rounded-lg border border-sky-200 aspect-video">
                              <img src={card.optionImages[1]} alt="Bức tranh của Sonet" className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Khối tải ảnh Bảng So Sánh Hai Mặt cho Chặng 4 (explanation) */}
                  {card.kind === 'explanation' && (
                    <div className="mt-3 rounded-2xl border-2 border-sky-300 bg-sky-50/80 p-4">
                      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-900">
                        <ScanSearch size={16} className="text-sky-700" />
                        🖼️ Hình ảnh minh họa Bảng So Sánh (Kho AI vs Não của con)
                      </p>
                      <p className="mt-1 text-xs font-medium text-sky-800">
                        Upload ảnh minh họa trực quan 2 cột đối so. Mặc định có hình minh họa đồ họa sẵn sàng!
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {/* Cột Trái: Kho AI */}
                        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                          <span className="text-xs font-black text-slate-800">Cột Trái: Kho Dữ Liệu AI</span>
                          <input
                            type="url"
                            readOnly={readOnly}
                            value={card.compareImages?.left ?? ''}
                            onChange={(event) => {
                              updateLearnCard(index, { compareImages: { left: event.target.value, right: card.compareImages?.right || '' } })
                            }}
                            style={{ ...inputStyle, marginTop: '0.35rem' }}
                            placeholder="https://cdn.example.com/ai-copy.webp"
                          />
                          {!readOnly && (
                            <span className="mt-2 flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-extrabold text-slate-800 hover:bg-slate-100">
                              <Eye size={15} className="mr-1.5" />
                              {uploadingStageMedia === `${index}:compareLeft` ? 'Đang tải ảnh…' : 'Tải ảnh Kho AI lên'}
                              <input
                                className="sr-only"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                disabled={uploadingStageMedia !== null}
                                onChange={(event) => {
                                  const file = event.target.files?.[0]
                                  if (file) void uploadLearnCardMedia(index, 'compareLeft', file)
                                  event.currentTarget.value = ''
                                }}
                              />
                            </span>
                          )}
                          {card.compareImages?.left && (
                            <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 aspect-video">
                              <img src={card.compareImages.left} alt="Minh họa Kho AI" className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                            </div>
                          )}
                        </div>

                        {/* Cột Phải: Não con */}
                        <div className="rounded-xl border border-brand-200 bg-white p-3 shadow-xs">
                          <span className="text-xs font-black text-brand-900">Cột Phải: Não Sáng Tạo Của Con</span>
                          <input
                            type="url"
                            readOnly={readOnly}
                            value={card.compareImages?.right ?? ''}
                            onChange={(event) => {
                              updateLearnCard(index, { compareImages: { left: card.compareImages?.left || '', right: event.target.value } })
                            }}
                            style={{ ...inputStyle, marginTop: '0.35rem' }}
                            placeholder="https://cdn.example.com/kid-brain.webp"
                          />
                          {!readOnly && (
                            <span className="mt-2 flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-brand-300 bg-amber-50 px-3 text-xs font-extrabold text-brand-900 hover:bg-amber-100">
                              <Eye size={15} className="mr-1.5" />
                              {uploadingStageMedia === `${index}:compareRight` ? 'Đang tải ảnh…' : 'Tải ảnh Não Con lên'}
                              <input
                                className="sr-only"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                disabled={uploadingStageMedia !== null}
                                onChange={(event) => {
                                  const file = event.target.files?.[0]
                                  if (file) void uploadLearnCardMedia(index, 'compareRight', file)
                                  event.currentTarget.value = ''
                                }}
                              />
                            </span>
                          )}
                          {card.compareImages?.right && (
                            <div className="mt-2 overflow-hidden rounded-lg border border-brand-200 aspect-video">
                              <img src={card.compareImages.right} alt="Minh họa Não Con" className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* 🐱 KHỐI STUDIO: MÈO AIKI ĐỒNG HÀNH & TRỢ GIẢNG AI (2 CỘT CHUẨN MỰC) */}
                  <div className="mt-4 rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-brand-50/80 via-sky-50/50 to-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2 border-b border-brand-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-lg bg-brand-500 text-white text-base shadow-xs">
                          🐱
                        </span>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-brand-950">
                            MÈO AIKI ĐỒNG HÀNH & TRỢ GIẢNG AI
                          </h4>
                          <p className="text-[11px] text-brand-800">
                            Character Rig tương tác trực tiếp · Giọng đọc Vertex AI & Khẩu hình Lipsync
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-white border border-brand-200 px-2 py-0.5 text-[10px] font-extrabold text-brand-700 shadow-2xs">
                        Studio Trợ Giảng
                      </span>
                    </div>

                    <div className="mt-3.5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-stretch">
                      <div className="flex flex-col justify-between gap-3">
                        <div>
                          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                            Lời đọc cho bé <span className="font-semibold normal-case text-muted">(để trống AIKI sẽ đọc nội dung bài ở trên)</span>
                            <textarea
                              readOnly={readOnly}
                              value={card.mee?.readText ?? ''}
                              onChange={(event) => updateLearnCard(index, {
                                mee: {
                                  ...(card.mee ?? { readText: '', gesture: 'presentation', autoRead: false }),
                                  readText: event.target.value,
                                  voiceProvider: 'vertex',
                                  gesture: (card.mee?.gesture as any) ?? 'presentation',
                                  autoRead: card.mee?.autoRead ?? false,
                                }
                              })}
                              rows={2}
                              style={{ ...textareaStyle, marginTop: '0.25rem', minHeight: '3.25rem' }}
                              placeholder="Rút gọn thành 1–2 câu dễ hiểu, vui tươi và tràn đầy năng lượng..."
                            />
                          </label>
                        </div>

                        <div>
                          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
                            Audio Vertex AI (StoryMee Hub)
                            <div className="mt-1 flex items-center gap-2">
                              <input
                                type="url"
                                readOnly={readOnly}
                                value={card.mee?.audioUrl ?? ''}
                                onChange={(event) => updateLearnCard(index, {
                                  mee: {
                                    ...(card.mee ?? { readText: '', gesture: 'presentation', autoRead: false }),
                                    audioUrl: event.target.value,
                                    voiceProvider: 'vertex',
                                  }
                                })}
                                style={{ ...inputStyle, marginTop: 0 }}
                                placeholder="https://cdn.example.com/aiki-voice.mp3"
                                className="flex-1 min-h-9"
                              />
                              {!readOnly && (
                                <label className="shrink-0 flex min-h-9 items-center justify-center gap-1 rounded-xl border-2 border-brand-200 bg-white px-2.5 text-[11px] font-black text-brand-700 hover:bg-brand-50 cursor-pointer shadow-2xs transition">
                                  <Volume2 size={13} />
                                  <span>{uploadingStageMedia === `${index}:audioUrl` ? 'Đang tải…' : 'Tải MP3'}</span>
                                  <input
                                    className="sr-only"
                                    type="file"
                                    accept="audio/mpeg,audio/mp4,audio/wav,audio/webm"
                                    disabled={uploadingStageMedia !== null}
                                    onChange={(event) => {
                                      const file = event.target.files?.[0]
                                      if (file) void uploadLearnCardMedia(index, 'audioUrl', file)
                                      event.currentTarget.value = ''
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </label>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-brand-100/60">
                          <label className="min-w-44 flex-1 text-[11px] font-black uppercase tracking-wider text-slate-700">
                            Cử chỉ giảng dạy
                            <select
                              disabled={readOnly}
                              value={card.mee?.gesture ?? 'presentation'}
                              onChange={(event) => updateLearnCard(index, {
                                mee: {
                                  ...(card.mee ?? { readText: '', gesture: 'presentation', autoRead: false }),
                                  gesture: event.target.value as any,
                                }
                              })}
                              style={{ ...inputStyle, marginTop: '0.25rem', height: '2.4rem' }}
                            >
                              {LECTURE_GESTURES.map((g) => (
                                <option key={g.id} value={g.id}>{g.label}</option>
                              ))}
                            </select>
                          </label>

                          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer mt-4">
                            <input
                              type="checkbox"
                              disabled={readOnly}
                              checked={card.mee?.autoRead ?? false}
                              onChange={(event) => updateLearnCard(index, {
                                mee: {
                                  ...(card.mee ?? { readText: '', gesture: 'presentation', autoRead: false }),
                                  autoRead: event.target.checked,
                                }
                              })}
                              className="size-4 rounded text-brand-600 focus:ring-brand-400"
                            />
                            <span>Tự đọc khi mở chặng</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-between rounded-2xl border-2 border-brand-200 bg-gradient-to-b from-brand-50 via-amber-50/60 to-white p-3 shadow-inner relative overflow-hidden">
                        <div className="w-full flex items-center justify-between text-[10px] font-black text-brand-800">
                          <span className="flex items-center gap-1">
                            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                            Interactive Rig
                          </span>
                          <span className="uppercase opacity-75">
                            {card.mee?.gesture ?? 'presentation'}
                          </span>
                        </div>

                        <div className="h-44 w-full flex items-center justify-center my-1">
                          <MeeCatInteractiveCanvas
                            variant="half-body"
                            animated={true}
                            transparentBackground={true}
                            state={card.mee?.gesture === 'think' ? 'look' : card.mee?.gesture === 'celebrate' || card.mee?.gesture === 'celebrate-1' ? 'celebrate' : previewSpeakingIndex === index ? 'talk' : 'idle'}
                            gesture={(card.mee?.gesture as any) ?? 'presentation'}
                            isSpeaking={previewSpeakingIndex === index}
                            speechText={card.mee?.readText || card.body}
                            className="size-full max-h-44"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => previewAikiVoice(index, card.mee?.readText?.trim() || card.body)}
                          className={cn(
                            "w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-black transition active:scale-95 shadow-xs cursor-pointer",
                            previewSpeakingIndex === index
                              ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                              : "bg-brand-600 hover:bg-brand-700 text-white"
                          )}
                        >
                          <Volume2 size={15} />
                          <span>{previewSpeakingIndex === index ? 'Dừng đọc & lipsync' : '🔊 Nghe thử giọng & Lipsync'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  {(card.layout === 'split' || card.layout === 'visual-grid' || card.layout === 'storyboard') && (
                    <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/60 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-extrabold text-text">Các ô ví dụ trực quan</p>
                          <p className="mt-1 text-xs font-semibold text-muted">Mỗi ô gồm một tên ngắn và phần giải thích. Thứ tự bên dưới là thứ tự học sinh xem.</p>
                        </div>
                        {!readOnly && <button type="button" onClick={() => addLearnVisualItem(index)} className="flex min-h-10 items-center gap-1 rounded-xl border border-sky-300 bg-white px-3 text-xs font-extrabold text-sky-700"><Plus size={15} /> Thêm ô</button>}
                      </div>
                      {card.visualItems.length === 0 ? (
                        <div className="mt-3 rounded-xl border border-dashed border-sky-300 bg-white px-3 py-4 text-center text-xs font-bold text-muted">Chưa có ô ví dụ. Chọn “Thêm ô” để bắt đầu.</div>
                      ) : (
                        <div className="mt-3 grid gap-2">
                          {card.visualItems.map((item, itemIndex) => (
                            <div key={`${card.id}-visual-${itemIndex}`} className="grid gap-2 rounded-xl border border-border bg-white p-3 sm:grid-cols-[minmax(8rem,.42fr)_minmax(0,1fr)_2.5rem]">
                              <label className="text-[11px] font-extrabold text-muted">Tên ô
                                <input readOnly={readOnly} value={item.label} onChange={(event) => updateLearnVisualItem(index, itemIndex, { label: event.target.value })} style={{ ...inputStyle, minHeight: '2.5rem', marginTop: '0.25rem' }} placeholder="Ví dụ: Chọn ý" />
                              </label>
                              <label className="text-[11px] font-extrabold text-muted">Nội dung ngắn
                                <textarea readOnly={readOnly} value={item.text} onChange={(event) => updateLearnVisualItem(index, itemIndex, { text: event.target.value })} rows={2} style={{ ...textareaStyle, minHeight: '2.5rem', marginTop: '0.25rem' }} placeholder="Học sinh cần nhìn thấy điều gì?" />
                              </label>
                              {!readOnly && <button type="button" onClick={() => removeLearnVisualItem(index, itemIndex)} className="mt-5 grid size-10 place-items-center rounded-xl border border-border text-danger" aria-label={`Xóa ô ${itemIndex + 1}`}><Trash2 size={16} /></button>}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-xs font-semibold text-muted">Gợi ý: “Chữ + ví dụ” dùng 1–3 ô xếp dọc; “Lưới ví dụ” dùng 2–4 ô; “Storyboard” dùng 3–6 khung theo trình tự.</p>
                    </div>
                  )}

                  {/* ── DRAG & DROP CONTENT BLOCKS (STANDARD MODE) ── */}
                  {(() => {
                    const stageIndex = index
                    const stageBlocks = getStageBlocks(card, stageIndex)
                    return (
                      <div className="mt-5 pt-5 border-t-2 border-dashed border-border/60">
                        <div className="mb-4">
                          <h4 className="text-sm font-black text-brand-950 flex items-center gap-2">
                            <PanelsTopLeft size={18} className="text-brand-600" />
                            Các khối tính năng kéo thả (Dynamic Blocks)
                          </h4>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            Kéo thả các khối nội dung chi tiết vào thẻ học này. Các khối này sẽ hiển thị trực quan 1-1 trên màn hình học sinh.
                          </p>
                        </div>
                        
                        {stageBlocks.length === 0 ? (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault()
                              e.dataTransfer.dropEffect = 'copy'
                              if (!isDragOver) setIsDragOver(true)
                            }}
                            onDragLeave={(e) => {
                              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                setIsDragOver(false)
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault()
                              setIsDragOver(false)
                              const blockId = e.dataTransfer.getData('text/plain')
                              if (blockId) {
                                handleAddModule(blockId, stageIndex)
                              }
                            }}
                            className={cn(
                              "flex flex-col items-center justify-center rounded-3xl border-3 border-dashed py-10 px-6 text-center transition-all duration-200",
                              isDragOver
                                ? "border-brand-500 bg-brand-50/90 ring-4 ring-brand-300/50 scale-[1.01]"
                                : "border-sky-300 bg-gradient-to-b from-sky-50/60 to-brand-50/30 hover:border-brand-400 hover:bg-sky-50/80"
                            )}
                          >
                            <div className="grid size-14 place-items-center rounded-2xl bg-white shadow-md text-2xl mb-2.5 border border-sky-200">
                              {isDragOver ? '✨' : '📥'}
                            </div>
                            <h4 className="font-display text-base font-black text-sky-950 sm:text-lg">
                              {isDragOver ? 'Thả khối tính năng vào đây!' : 'Vùng Kéo Thả Khối Cho Thẻ Học Này'}
                            </h4>
                            <p className="mt-1 max-w-md text-xs font-semibold text-sky-800 leading-relaxed">
                              Bấm nhanh các khối bên dưới hoặc kéo thả từ bảng bên trái để bổ sung vào thẻ:
                            </p>
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-xl">
                              {AVAILABLE_MODULES.map((mod) => (
                                <button
                                  key={mod.id}
                                  type="button"
                                  draggable={!readOnly}
                                  onDragStart={(event) => {
                                    event.dataTransfer.setData('text/plain', mod.id)
                                    event.dataTransfer.effectAllowed = 'copy'
                                  }}
                                  disabled={readOnly}
                                  onClick={() => handleAddModule(mod.id, stageIndex)}
                                  className="flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-2.5 py-2 text-xs font-black text-slate-800 shadow-2xs hover:border-brand-400 hover:bg-brand-50 hover:text-brand-900 transition active:scale-95 cursor-pointer text-left"
                                >
                                  <span className="text-base">{mod.icon}</span>
                                  <span className="truncate">{mod.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {draggingBlockIdx !== null && (
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault()
                                  e.dataTransfer.dropEffect = 'move'
                                  if (!isTrashDragOver) setIsTrashDragOver(true)
                                }}
                                onDragLeave={(e) => {
                                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                    setIsTrashDragOver(false)
                                  }
                                }}
                                onDrop={(e) => {
                                  e.preventDefault()
                                  setIsTrashDragOver(false)
                                  if (draggingBlockIdx !== null && stageBlocks[draggingBlockIdx]) {
                                    removeBlock(stageIndex, stageBlocks[draggingBlockIdx].id)
                                    setDraggingBlockIdx(null)
                                  }
                                }}
                                className={cn(
                                  "flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 px-4 text-center transition-all animate-pulse",
                                  isTrashDragOver
                                    ? "border-rose-500 bg-rose-100 text-rose-800 scale-[1.02] shadow-md ring-4 ring-rose-200"
                                    : "border-rose-300 bg-rose-50/80 text-rose-700 hover:border-rose-400 hover:bg-rose-100/60"
                                )}
                              >
                                <Trash2 size={20} className={isTrashDragOver ? "scale-125 transition-transform text-rose-600" : "text-rose-500"} />
                                <span className="text-sm font-extrabold">
                                  {isTrashDragOver ? 'Thả vào đây để xóa khối này!' : 'Kéo khối thả vào đây để xóa'}
                                </span>
                              </div>
                            )}

                            {stageBlocks.map((block, bIdx) => (
                              <StageBlockItemCard
                                key={block.id}
                                block={block}
                                bIdx={bIdx}
                                totalBlocks={stageBlocks.length}
                                stageIndex={stageIndex}
                                card={card}
                                stageBlocks={stageBlocks}
                                readOnly={readOnly}
                                draggingBlockIdx={draggingBlockIdx}
                                dragOverBlockIdx={dragOverBlockIdx}
                                setDraggingBlockIdx={setDraggingBlockIdx}
                                setDragOverBlockIdx={setDragOverBlockIdx}
                                setIsTrashDragOver={setIsTrashDragOver}
                                moveBlock={moveBlock}
                                removeBlock={removeBlock}
                                updateStageBlocks={updateStageBlocks}
                                updateBlockItem={updateBlockItem}
                                updateLearnCard={updateLearnCard}
                                uploadingStageMedia={uploadingStageMedia}
                                setUploadingStageMedia={setUploadingStageMedia}
                                uploadLearnCardMedia={uploadLearnCardMedia}
                                uploadAdditionalImageItem={uploadAdditionalImageItem}
                                previewAikiVoice={previewAikiVoice}
                                previewSpeakingIndex={previewSpeakingIndex}
                                speakTextPreview={speakTextPreview}
                                courseId={courseId}
                                handleAddModule={handleAddModule}
                                stageInfo={{ title: card.title || 'Khối học', icon: Lightbulb, desc: '' }}
                                inputStyle={inputStyle}
                                textareaStyle={textareaStyle}
                                showToast={showToast}
                              />
                            ))}

                            <div
                              onDragOver={(e) => {
                                e.preventDefault()
                                e.dataTransfer.dropEffect = 'copy'
                                if (!isDragOver) setIsDragOver(true)
                              }}
                              onDragLeave={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                  setIsDragOver(false)
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault()
                                setIsDragOver(false)
                                const blockId = e.dataTransfer.getData('text/plain')
                                if (blockId) {
                                  handleAddModule(blockId, stageIndex)
                                }
                              }}
                              className={cn(
                                "flex items-center justify-center rounded-2xl border-2 border-dashed py-3 transition-all",
                                isDragOver
                                  ? "border-brand-500 bg-brand-50 shadow-inner scale-[1.01]"
                                  : "border-sky-300 bg-sky-50/50 hover:border-brand-400 hover:bg-sky-50"
                              )}
                            >
                              <span className="text-xs font-extrabold text-sky-800">
                                {isDragOver ? '✨ Thả vào đây!' : '➕ Kéo thả tính năng mới vào đây'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </section>
              ))}
              {!readOnly && <button type="button" onClick={addLearnCard} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50 px-4 text-sm font-extrabold text-sky-700"><Plus size={18} /> Thêm khối Khám phá</button>}
              </div>
              <StudentLearnPreview draft={deferredDraft} />
            </div>
          )}

          {/* ── GAME ── */}
          {lessonFormat === 'standard' && activeSection === 'game' && (
            <LectureDrawerGameTab
              readOnly={readOnly}
              draft={draft}
              quizQuestions={quizQuestions}
              onChangeDraft={set}
              onChangeQuizQuestions={setQuizQuestions}
              onOpenBankPicker={() => setShowBankPicker(true)}
            />
          )}

          {/* ── PRACTICE & CHECK ── */}
          {lessonFormat === 'standard' && (activeSection === 'practice' || activeSection === 'check') && (
            <LectureDrawerExerciseTab
              readOnly={readOnly}
              draft={draft}
              activeSubSection={activeSection as 'practice' | 'check'}
              onChangeDraft={set}
              practicePreview={<PracticeKindPreview draft={draft} compact />}
            />
          )}
        </div>

        {/* Footer — Save button */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          background: '#fff',
          flexShrink: 0,
        }}>
          {!readOnly && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {readiness.complete
                ? <CheckCircle2 size={14} color="#10b981" />
                : <Circle size={14} color="#f97316" />
              }
              <span style={{ fontSize: '0.8125rem', color: readiness.complete ? '#10b981' : '#f97316' }}>
                {readiness.complete ? 'Sẵn sàng lưu!' : `Còn ${readiness.total - readiness.completed} bước chưa hoàn thành`}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {/* WHY: readOnly=true — ẩn hoàn toàn footer action để tránh gọi PATCH/DELETE vào system courses. */}
            {!readOnly ? (
              <>
                <button
                  type="button"
                  onClick={requestClose}
                  style={{ padding: '0.625rem 1.25rem', borderRadius: '0.625rem', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  id={`${uid}-save-lecture`}
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '0.625rem 1.5rem', borderRadius: '0.625rem', border: 'none',
                    background: readiness.complete ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#c7d2fe',
                    color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
                  }}
                >
                  {saving ? 'Đang lưu...' : isEdit ? 'Lưu trạm học' : 'Tạo trạm học'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={requestClose}
                style={{ padding: '0.625rem 1.5rem', borderRadius: '0.625rem', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question bank picker modal */}
      {showBankPicker && (
        <QuestionBankPicker
          selectedIds={quizQuestions.map((q) => q.id)}
          onSelect={(newQuestions) => setQuizQuestions((prev) => [...prev, ...newQuestions])}
          onClose={() => setShowBankPicker(false)}
        />
      )}
      <ConfirmDialog
        open={confirmClose}
        title="Bỏ các thay đổi chưa lưu?"
        description="Nội dung vừa chỉnh trong trạm sẽ bị mất. Con trỏ và dữ liệu đã lưu trước đó vẫn được giữ nguyên."
        confirmLabel="Bỏ thay đổi"
        cancelLabel="Tiếp tục soạn"
        danger
        onCancel={() => setConfirmClose(false)}
        onConfirm={() => { window.sessionStorage.removeItem(draftStorageKey); setConfirmClose(false); onDirtyChange?.(false); onClose() }}
      />
      <AdventureModal
        open={showFullPreview}
        tone="guidance"
        eyebrow="Xem trước như học sinh"
        title={draft.title || 'Trạm học chưa có tên'}
        description={
          lessonFormat === 'aiki-rule-3steps'
            ? 'Toàn bộ hành trình 3 bước Quy tắc AIKI: Bài học (Video) → Kiểm tra (Quiz) → Hoàn thành.'
            : lessonFormat === 'aiki-rule-5steps'
            ? 'Toàn bộ hành trình 5 chặng Quy tắc AIKI: Tình huống → Câu đố AIKI → Quy tắc → Giải thích → Chốt.'
            : 'Toàn bộ hành trình trong một trạm: mở bài → khám phá → chơi → thực hành → thử thách.'
        }
        showMascot={false}
        className="station-preview-modal"
        onClose={() => setShowFullPreview(false)}
        actions={<button type="button" className="btn-primary" onClick={() => setShowFullPreview(false)}>Tiếp tục biên soạn</button>}
      >
        <FullStationPreview draft={draft} gameConfig={buildGameConfigForSave()} isIslandCourse={isIslandCourse} />
      </AdventureModal>
    </>
  )

  // inline mode: render trực tiếp, không có backdrop
  if (inline) return body

  // overlay mode: thêm backdrop bên ngoài
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(3px)',
        }}
      />
      {body}
    </>
  )
}

// ─── Helper components ─────────────────────────────────────────────────────────
function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{label}</span>
        {hint && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{hint}</span>}
      </div>
      {children}
    </label>
  )
}

// ─── Styles ─ Light theme ──────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.625rem',
  border: '1.5px solid #e2e8f0', background: '#fff',
  color: '#0f172a', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
}
const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: 'vertical', lineHeight: 1.6,
}
const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem',
}
