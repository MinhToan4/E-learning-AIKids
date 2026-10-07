/**
 * LectureDrawer — Slide-in drawer để tạo/chỉnh sửa bài học (lecture).
 * Áp dụng mô hình Stage-Editor Pattern & Block-Based Architecture.
 */
import React, { useState, useCallback, useEffect, useId, useRef, useDeferredValue } from 'react'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { CheckCircle2, Circle } from 'lucide-react'
import { api, type LessonSixStageJourney } from '@/shared/lib/api'
import { resolveIslandSixStageJourney } from '@/features/lesson/lib/island-journey-resolver'
import { useToast } from '@/shared/hooks/useToast'
import {
  buildLectureGameConfig, lectureDraftReadiness, serializeLearnCardsForHub,
  slugifyAuthoringId, detectLessonFormat, isAikiRuleLesson,
  type LessonFormat, type LectureDraft, type LessonAccessConfig,
  getActiveModules, normalizeLectureDraft, ISLAND_6_STAGE_NAMES,
  COURSE_GOAL_BLOCK_PREFIX, COURSE_CONFIRM_BLOCK_PREFIX, defaultLearnCards,
  STANDARD_ISLAND_6_STAGES, type JourneyStageDefinition,
} from '../lib/authoring'
import { QuestionBankPicker } from './QuestionBankPicker'
import type { EditableQuestion } from './QuizQuestionBuilder'
import { isAikiRuleJourney } from '@/features/lesson/lib/rule-journey-identifiers'
import {
  LectureDrawerHeader, LectureDrawerBasicsForm, SixStageJourneyEditor,
  LectureDrawerStandardContent, FullStationPreview, type Section,
  CustomStagesManagerModal,
} from './lecture-drawer'
import { useLectureAuthoring } from './lecture-drawer/useLectureAuthoring'
import { FullStationPreviewModal } from './lecture-drawer/FullStationPreviewModal'
import {
  emptyDraft, resolveSectionStatus, resolveSectionMissing,
  AIKI_SECTIONS, STANDARD_SECTIONS, AIKI_STAGE_NAMES, ENGINE_DEFAULT_MOTTOS,
  type CreativeEngineOption, CREATIVE_ENGINES, AVAILABLE_MODULES,
  LEARN_KIND_OPTIONS, LEARN_LAYOUT_OPTIONS, LECTURE_GESTURES,
  LEARN_KIND_PRESENTATION, getBlockIcon, getBlockTitle, speakTextPreview,
  goalLines, buildRuleSyntheticJourney,
} from './lecture-drawer/lecture-drawer-constants'
import {
  CollapsedPreviewRail, StudentBasicsPreview, StudentLearnPreview, PracticeWorkflowStepsAccordion,
} from './lecture-drawer/PracticeWorkflowStepsAccordion'
import {
  type PreviewViewportMode, StudentStagePreview, practiceKindLabel, PracticeKindPreview,
} from './lecture-drawer/StudentStagePreview'
import {
  DEFAULT_PRACTICE_PARTS, DEFAULT_FOUR_KEYS_OPTIONS, DEFAULT_LOCKED_FEATURES,
  DEFAULT_EXPRESSIONS, DEFAULT_STYLE_PRISM_OPTIONS, DEFAULT_PROMPT_DOCTOR_CASE,
  DEFAULT_LAYER_STACKING_OPTIONS, DEFAULT_CARD_FORGE_OPTIONS,
  suggestFourKeysForSubject, Stage5CreativeEngineEditor, PracticePartsAndFourKeysEditor,
} from './engine-editors'

export {
  emptyDraft, getActiveModules, normalizeLectureDraft, ISLAND_6_STAGE_NAMES,
  defaultLearnCards, COURSE_GOAL_BLOCK_PREFIX, COURSE_CONFIRM_BLOCK_PREFIX,
  DEFAULT_PRACTICE_PARTS, DEFAULT_FOUR_KEYS_OPTIONS, DEFAULT_LOCKED_FEATURES,
  DEFAULT_EXPRESSIONS, DEFAULT_STYLE_PRISM_OPTIONS, DEFAULT_PROMPT_DOCTOR_CASE,
  DEFAULT_LAYER_STACKING_OPTIONS, DEFAULT_CARD_FORGE_OPTIONS, suggestFourKeysForSubject,
  Stage5CreativeEngineEditor, PracticePartsAndFourKeysEditor, AIKI_SECTIONS,
  STANDARD_SECTIONS, AIKI_STAGE_NAMES, ENGINE_DEFAULT_MOTTOS, type CreativeEngineOption,
  CREATIVE_ENGINES, AVAILABLE_MODULES, LEARN_KIND_OPTIONS, LEARN_LAYOUT_OPTIONS,
  LECTURE_GESTURES, LEARN_KIND_PRESENTATION, getBlockIcon, getBlockTitle,
  speakTextPreview, goalLines, buildRuleSyntheticJourney, CollapsedPreviewRail,
  StudentBasicsPreview, StudentLearnPreview, PracticeWorkflowStepsAccordion,
  type PreviewViewportMode, StudentStagePreview, practiceKindLabel,
  PracticeKindPreview, FullStationPreview,
}
export { ISLAND_6_STAGE_SECTIONS } from './lecture-drawer'

const DEFAULT_STAR_ALLOCATION: number[] = [2, 3, 4]

type Props = {
  courseId: string; lecture: LectureDraft | null; onSaved: () => void; onClose: () => void
  inline?: boolean; archived?: boolean; onArchive?: () => void; onRestore?: () => void
  readOnly?: boolean; onDirtyChange?: (dirty: boolean) => void
}

export function LectureDrawer({
  courseId, lecture, onSaved, onClose, inline = false,
  archived = false, onArchive, onRestore, readOnly = false, onDirtyChange,
}: Props) {
  const uid = useId()
  const { showToast } = useToast()
  const isAikiRule = Boolean(
    (lecture as any)?.lessonFormat === 'aiki-rule-3steps' ||
    (lecture as any)?.lessonFormat === 'aiki-rule-5steps' ||
    (lecture?.learnCards ? isAikiRuleLesson(lecture.learnCards) : false) ||
    (courseId && (courseId.toLowerCase() === 'aiki-rules' || courseId.toLowerCase().includes('rule'))) ||
    isAikiRuleJourney(lecture) || isAikiRuleJourney(courseId)
  )
  const initialDraftRef = useRef(normalizeLectureDraft(lecture ?? emptyDraft(), courseId))
  const [draft, setDraft] = useState<LectureDraft>(() => initialDraftRef.current)
  const isIslandCourse = !isAikiRule && Boolean(
    courseId.startsWith('dao-') ||
    courseId.includes('island') ||
    (lecture as any)?.lessonFormat === 'aiki-island-6steps' ||
    (lecture as any)?.metadata?.sixStageJourney ||
    lecture?.sixStageJourney ||
    Boolean(lecture?.id && /^bai-\d+-\d+/i.test(lecture.id)) ||
    Boolean(draft?.id && /^bai-\d+-\d+/i.test(draft.id))
  )
  const deferredDraft = useDeferredValue(draft)
  const [activeSection, setActiveSection] = useState<Section>('basics')
  const [quizQuestions, setQuizQuestions] = useState<EditableQuestion[]>([])
  const [showBankPicker, setShowBankPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingStageMedia, setUploadingStageMedia] = useState<string | null>(null)
  const [previewSpeakingIndex, setPreviewSpeakingIndex] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [draggingBlockIdx, setDraggingBlockIdx] = useState<number | null>(null)
  const [dragOverBlockIdx, setDragOverBlockIdx] = useState<number | null>(null)
  const [isTrashDragOver, setIsTrashDragOver] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [showFullPreview, setShowFullPreview] = useState(false)
  const [showInlinePreview, setShowInlinePreview] = useState(false)
  const [previewStageIndex, setPreviewStageIndex] = useState<number>(0)
  const [showCustomStagesModal, setShowCustomStagesModal] = useState(false)

  const handleApplyCustomStages = useCallback((newStages: JourneyStageDefinition[], newStarAllocation: number[]) => {
    setDraft((prev) => {
      let nextCards = [...prev.learnCards]
      while (nextCards.length < newStages.length) {
        const idx = nextCards.length
        nextCards.push({
          id: newStages[idx]?.id || `custom-stage-${idx + 1}`,
          title: newStages[idx]?.title || `Chặng ${idx + 1}`,
          body: '',
          tip: '',
          kind: idx === 0 ? 'concept' : idx === 1 ? 'example' : idx === 2 ? 'storyboard' : idx === 3 ? 'steps' : idx === 4 ? 'compare' : 'remember',
          layout: 'text',
          visualItems: [],
          contentBlocks: [],
        })
      }
      const clampedCards = nextCards.slice(0, newStages.length)

      const prevJourney = prev.sixStageJourney || resolveIslandSixStageJourney(prev as any)
      const nextJourney = {
        ...prevJourney,
        customStages: newStages,
        stageStarAllocation: newStarAllocation,
      }

      return {
        ...prev,
        customJourneyStages: newStages,
        learnCards: clampedCards,
        sixStageJourney: nextJourney,
        metadata: {
          ...prev.metadata,
          customJourneyStages: newStages,
          sixStageJourney: nextJourney,
        },
      }
    })

    if (activeSection.startsWith('stage-')) {
      const currentIdx = parseInt(activeSection.replace('stage-', ''), 10)
      if (currentIdx >= newStages.length) {
        setActiveSection('stage-0')
      }
    }

    showToast(`✅ Đã cập nhật cấu trúc ${newStages.length} chặng học!`, 'success')
  }, [activeSection, showToast])

  useEffect(() => {
    const handleOpen = (e: any) => {
      setPreviewStageIndex(e.detail?.stageIndex ?? 0)
      setShowFullPreview(true)
    }
    window.addEventListener('aikids:open-stage-preview', handleOpen)
    return () => window.removeEventListener('aikids:open-stage-preview', handleOpen)
  }, [])

  const [lessonFormat, setLessonFormat] = useState<LessonFormat>(() => {
    if (isIslandCourse) return 'aiki-island-6steps'
    let explicit: string | undefined = (lecture as any)?.lessonFormat
    if (!explicit && lecture?.gameStructuredText) {
      try { explicit = JSON.parse(lecture.gameStructuredText).lessonFormat } catch {}
    }
    if (explicit === 'aiki-rule-3steps' || explicit === 'aiki-rule-5steps' || explicit === 'aiki-island-6steps' || explicit === 'standard') return explicit
    if (isAikiRule) return 'aiki-rule-3steps'
    return detectLessonFormat(initialDraftRef.current.learnCards, explicit, isIslandCourse)
  })

  const {
    updateLearnCard, updateStageBlocks, updateBlockItem, moveBlock, removeBlock,
    handleAddModule, uploadLearnCardMedia, uploadAdditionalImageItem,
  } = useLectureAuthoring({ draft, setDraft, lessonFormat, activeSection, courseId, readOnly, showToast, setUploadingStageMedia })

  const updateSixStage = useCallback((updater: (prev: LessonSixStageJourney) => LessonSixStageJourney) => {
    setDraft((d) => {
      const current = d.sixStageJourney || (d.lessonFormat === 'aiki-rule-3steps' ? buildRuleSyntheticJourney(d) : resolveIslandSixStageJourney(d as any))
      const next = updater(current)
      const nextCards = [...d.learnCards]
      if (d.lessonFormat === 'aiki-rule-3steps') {
        if (nextCards[0]) nextCards[0] = { ...nextCards[0], title: next.stage3_video?.title || nextCards[0].title, videoUrl: next.stage3_video?.videoUrl || nextCards[0].videoUrl, imageUrl: next.stage3_video?.posterUrl || nextCards[0].imageUrl }
        if (nextCards[1]) nextCards[1] = { ...nextCards[1], title: next.stage4_quiz?.title || nextCards[1].title }
        if (nextCards[2]) nextCards[2] = { ...nextCards[2], title: next.stage6_completion?.title || nextCards[2].title }
      }
      return {
        ...d, sixStageJourney: next, metadata: { ...d.metadata, sixStageJourney: next },
        title: d.lessonFormat === 'aiki-rule-3steps' ? d.title : (next.stage1_goal.title || d.title),
        goalsText: next.stage1_goal.keyPoints?.length ? next.stage1_goal.keyPoints.join('\n') : d.goalsText,
        videoUrl: next.stage3_video.videoUrl || d.videoUrl, reward: next.stage6_completion?.rewardBadge?.name || d.reward,
        learnCards: nextCards,
        checkQuestions: next.stage4_quiz.questions?.map((q, idx) => ({ id: q.id || `q-${idx}`, prompt: q.prompt, options: q.options, answer: q.correctIndex, explain: q.explanation || '' })) ?? d.checkQuestions,
      }
    })
  }, [])

  const previewAikiVoice = useCallback((index: number, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) { showToast('Trình duyệt không hỗ trợ giọng đọc.', 'info'); return }
    window.speechSynthesis.cancel()
    if (previewSpeakingIndex === index) { setPreviewSpeakingIndex(null); return }
    const clean = text.trim()
    if (!clean) { showToast('Vui lòng nhập nội dung trước khi nghe thử.', 'info'); return }
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.rate = 0.95; utterance.pitch = 1.25
    const viVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('vi') || v.name.toLowerCase().includes('vietnam'))
    if (viVoice) utterance.voice = viVoice
    setPreviewSpeakingIndex(index)
    utterance.onend = () => setPreviewSpeakingIndex(null); utterance.onerror = () => setPreviewSpeakingIndex(null)
    window.speechSynthesis.speak(utterance)
  }, [previewSpeakingIndex, showToast])

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

  const lectureKey = lecture ? `${lecture.id || ''}:${lecture.slug || ''}:${lecture.title || ''}` : null
  const prevLectureKeyRef = useRef(lectureKey)
  useEffect(() => {
    if (lectureKey !== prevLectureKeyRef.current) {
      prevLectureKeyRef.current = lectureKey
      const nextDraft = normalizeLectureDraft(lecture ?? emptyDraft(), courseId)
      initialDraftRef.current = nextDraft
      setDraft(nextDraft)
      const resolvedFormat = (isIslandCourse || Boolean(nextDraft.id && /^bai-\d+-\d+/i.test(nextDraft.id)))
        ? 'aiki-island-6steps'
        : (nextDraft.lessonFormat ?? (isAikiRule ? 'aiki-rule-3steps' : 'standard'))
      setLessonFormat(resolvedFormat)
      setActiveSection(resolvedFormat.startsWith('aiki-') ? 'stage-0' : 'basics')
      if (nextDraft.checkQuestions?.length) {
        setQuizQuestions(nextDraft.checkQuestions.map((q, idx) => ({
          id: q.id ?? `q-${idx}`, prompt: q.prompt, options: q.options, answer: q.answer,
          explanation: q.explain, tags: [], ageMin: 6, ageMax: 11, difficulty: 'steady', imageUrl: null,
        })))
      } else setQuizQuestions([])
    }
  }, [lectureKey, lecture, courseId, isIslandCourse, isAikiRule])

  useEffect(() => { onDirtyChange?.(dirty); return () => onDirtyChange?.(false) }, [dirty, onDirtyChange])
  useEffect(() => {
    if (!dirty) return
    const protect = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', protect); return () => window.removeEventListener('beforeunload', protect)
  }, [dirty])
  useEffect(() => {
    if (readOnly || !dirty || recovery) return
    const timer = window.setTimeout(() => {
      try { window.sessionStorage.setItem(draftStorageKey, JSON.stringify({ savedAt: new Date().toISOString(), draft })) } catch {}
    }, 600)
    return () => window.clearTimeout(timer)
  }, [draft, dirty, draftStorageKey, readOnly, recovery])
  useEffect(() => {
    const isCustom = Boolean(draft.customJourneyStages && draft.customJourneyStages.length >= 3)
    if ((isIslandCourse || lessonFormat === 'aiki-island-6steps' || lessonFormat === 'aiki-rule-3steps' || lessonFormat === 'aiki-rule-5steps' || isCustom) && ['content', 'game', 'practice', 'check'].includes(activeSection)) {
      setActiveSection('stage-0')
    }
  }, [isIslandCourse, lessonFormat, activeSection, draft.customJourneyStages])
  useEffect(() => {
    if (lessonFormat === 'standard' && activeSection.startsWith('stage-') && !(draft.customJourneyStages && draft.customJourneyStages.length >= 3)) {
      setActiveSection('content')
    }
  }, [lessonFormat, activeSection, draft.customJourneyStages])

  const requestClose = useCallback(() => { dirty ? setConfirmClose(true) : onClose() }, [dirty, onClose])
  const set = useCallback(<K extends keyof LectureDraft>(key: K, value: LectureDraft[K]) => {
    if (readOnly) return
    setDraft((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'title' && !isEdit && !prev.id.trim()) next.id = slugifyAuthoringId(value as string)
      return next
    })
  }, [isEdit, readOnly])

  const updateAccess = useCallback((patch: Partial<LessonAccessConfig>) => {
    if (readOnly) return
    setDraft((d) => ({ ...d, access: { mode: d.access?.mode ?? 'inherit', minPlanTier: d.access?.minPlanTier ?? 0, trialBadge: d.access?.trialBadge ?? 'Học thử', lockedReason: d.access?.lockedReason ?? '', ...patch } }))
  }, [readOnly])

  async function handleSave() {
    if (readOnly) return
    const missing = readiness.steps.flatMap((s) => s.missing)
    if (missing.length > 0) { showToast(`Còn thiếu: ${missing.slice(0, 3).join(', ')}`, 'error'); return }
    setSaving(true)
    try {
      const questionsForSave = quizQuestions.length > 0 ? quizQuestions.map((q) => ({ id: q.id, prompt: q.prompt, options: q.options, answer: q.answer, why: q.explanation })) : undefined
      const gameConfig = buildLectureGameConfig(draft, questionsForSave)
      const baseJourney = isIslandCourse ? (draft.sixStageJourney || resolveIslandSixStageJourney(draft as any)) : undefined
      let finalJourney = baseJourney ? { ...baseJourney, stageBlockEditorVersion: 3 } : undefined
      if (finalJourney) {
        // Stage 0 Goal sync
        const goalCard = draft.learnCards[0]
        if (goalCard?.contentBlocks) {
          const textBlock = goalCard.contentBlocks.find(
            (b) => b.id.startsWith('course-goal-text') || b.type === 'text' || b.type === 'layout-text'
          )
          const fourKeysBlock = goalCard.contentBlocks.find(
            (b) => b.id.startsWith('course-goal-four-keys') || b.type === 'layout-four-keys'
          )
          const imageBlock = goalCard.contentBlocks.find(
            (b) => b.id.startsWith('course-goal-image') || b.type === 'images' || Boolean(b.imageUrl)
          )
          const voiceBlock = goalCard.contentBlocks.find(
            (b) => b.type === 'voice' || Boolean(b.readText)
          )
          finalJourney.stage1_goal = {
            ...finalJourney.stage1_goal,
            title: textBlock?.title ?? finalJourney.stage1_goal?.title ?? '',
            goalText: textBlock?.body ?? finalJourney.stage1_goal?.goalText ?? '',
            imageUrl: imageBlock?.imageUrl || finalJourney.stage1_goal?.imageUrl || '',
            speech: voiceBlock?.body || voiceBlock?.readText || finalJourney.stage1_goal?.speech || '',
            layoutMode: goalCard.layoutMode || finalJourney.stage1_goal?.layoutMode || '2-column',
            keyPoints: fourKeysBlock?.visualItems?.length
              ? fourKeysBlock.visualItems.map((v) => v.text || v.label).filter(Boolean)
              : (finalJourney.stage1_goal?.keyPoints || []),
          }
        }

        // Stage 1 Confirm sync
        const confirmBlock = draft.learnCards[1]?.contentBlocks?.find(
          (b) =>
            b.id === 'course-confirm-quiz' ||
            b.type === 'layout-confirm-option' ||
            b.type === 'quiz-question' ||
            b.id.startsWith('course-confirm-') ||
            Boolean(b.questionPrompt)
        )
        if (confirmBlock) {
          finalJourney.stage2_confirmGoal = {
            ...finalJourney.stage2_confirmGoal,
            id: confirmBlock.id,
            question: confirmBlock.questionPrompt || confirmBlock.title || finalJourney.stage2_confirmGoal?.question || '',
            options: (confirmBlock.questionOptions && confirmBlock.questionOptions.length > 0)
              ? confirmBlock.questionOptions.map((o, optIdx) => ({ id: o.id || `opt-${optIdx + 1}`, text: o.text, imageUrl: o.imageUrl }))
              : (finalJourney.stage2_confirmGoal?.options || []),

            correctIndex: typeof confirmBlock.correctIndex === 'number'
              ? confirmBlock.correctIndex
              : (finalJourney.stage2_confirmGoal?.correctIndex ?? 0),
            explanation: confirmBlock.explanation || confirmBlock.tip || finalJourney.stage2_confirmGoal?.explanation || '',
            visualUrl: confirmBlock.visualUrl || confirmBlock.imageUrl || finalJourney.stage2_confirmGoal?.visualUrl || '',
            layoutMode: confirmBlock.layoutMode || finalJourney.stage2_confirmGoal?.layoutMode || 'cards',
          }
        }

        // Stage 2 Video sync
        const videoBlock = draft.learnCards[2]?.contentBlocks?.find(
          (b) => b.type === 'video' || b.id.startsWith('course-video-')
        )
        if (videoBlock) {
          finalJourney.stage3_video = {
            ...finalJourney.stage3_video,
            title: videoBlock.title || finalJourney.stage3_video?.title || 'Video bài giảng',
            videoUrl: videoBlock.videoUrl || draft.learnCards[2]?.videoUrl || finalJourney.stage3_video?.videoUrl || '',
            posterUrl: videoBlock.posterUrl || finalJourney.stage3_video?.posterUrl || '',
            durationSec: typeof videoBlock.durationSec === 'number' ? videoBlock.durationSec : (finalJourney.stage3_video?.durationSec || 180),
            timestamps: videoBlock.timestamps || finalJourney.stage3_video?.timestamps || [],
          }
        }

        // Stage 3 Quiz sync
        const quizBlocks = draft.learnCards[3]?.contentBlocks?.filter(
          (b) =>
            b.type === 'quiz-question' ||
            b.id.startsWith('course-quiz-') ||
            b.id.startsWith('blk-quiz-') ||
            Boolean(b.questionPrompt)
        )
        if (quizBlocks && quizBlocks.length > 0) {
          finalJourney.stage4_quiz = {
            ...finalJourney.stage4_quiz,
            questions: quizBlocks.map((b, qIdx) => ({
              id: b.id.replace('course-quiz-', ''),
              prompt: b.questionPrompt || b.title || `Câu hỏi ${qIdx + 1}`,
              options: (b.questionOptions && b.questionOptions.length > 0)
                ? b.questionOptions.map((o) => o.text)
                : (b.optionLabels || ['Phương án A', 'Phương án B']),
              correctIndex: typeof b.correctIndex === 'number' ? b.correctIndex : 0,
              explanation: b.explanation || b.tip || '',
              visualUrl: b.visualUrl || b.imageUrl || '',
              layoutMode: b.layoutMode || 'cards',
              optionImages: b.questionOptions?.map((o) => o.imageUrl || '') || b.optionImages,
            })),
          }
        }

        // Stage 4 Practice sync
        const practiceBlock = draft.learnCards[4]?.contentBlocks?.find(
          (b) => b.type === 'practice' || b.id.startsWith('course-practice-')
        )
        if (practiceBlock) {
          finalJourney.stage5_practice = {
            ...finalJourney.stage5_practice,
            ...(practiceBlock.practiceConfig || {}),
            title: practiceBlock.title || practiceBlock.practiceConfig?.title || finalJourney.stage5_practice?.title || 'Thực hành',
          }
        }

        // Stage 5 Reward sync
        const rewardBlock = draft.learnCards[5]?.contentBlocks?.find(
          (b) => b.type === 'reward' || b.id.startsWith('course-reward-')
        )
        if (rewardBlock) {
          finalJourney.stage6_completion = {
            ...finalJourney.stage6_completion,
            ...(rewardBlock.rewardConfig || {}),
            title: rewardBlock.title || rewardBlock.rewardConfig?.title || finalJourney.stage6_completion?.title || 'Chúc mừng hoàn thành bài học!',
            congratsMessage: rewardBlock.body || rewardBlock.rewardConfig?.congratsMessage || finalJourney.stage6_completion?.congratsMessage || '',
          }
        }

        finalJourney.stageContentBlocks = {
          ...(finalJourney.stageContentBlocks || {}),
          'stage-0': draft.learnCards[0]?.contentBlocks || [],
          'stage-1': draft.learnCards[1]?.contentBlocks || [],
          'stage-2': draft.learnCards[2]?.contentBlocks || [],
          'stage-3': draft.learnCards[3]?.contentBlocks || [],
          'stage-4': draft.learnCards[4]?.contentBlocks || [],
          'stage-5': draft.learnCards[5]?.contentBlocks || [],
        }
      }

      const finalCustomStages = draft.customJourneyStages && draft.customJourneyStages.length >= 3 ? draft.customJourneyStages : undefined
      if (finalJourney && finalCustomStages) {
        finalJourney.customStages = finalCustomStages
      }

      const rewardName = finalJourney?.stage6_completion?.rewardBadge?.name?.trim() || draft.reward?.trim() || ('Huy hiệu ' + draft.title).trim()
      const payload = {
        courseId, id: draft.id, slug: (draft as any).slug || draft.id, title: draft.title, skill: draft.skill || draft.title,
        hook: draft.hook || draft.title, access: draft.access, goals: draft.goalsText ? draft.goalsText.split('\n').filter(Boolean) : [draft.title],
        concept: draft.concept, example: draft.example, learnCards: serializeLearnCardsForHub(draft.learnCards),
        videoUrl: isIslandCourse ? (finalJourney?.stage3_video?.videoUrl || draft.videoUrl || null) : (draft.videoUrl || null),
        reward: rewardName, duration: draft.duration, practiceKind: draft.practiceKind, lessonFormat: isIslandCourse ? 'aiki-island-6steps' : lessonFormat,
        sixStageJourney: finalJourney, customJourneyStages: finalCustomStages,
        metadata: { ...(draft as any).metadata, reward: rewardName, slug: (draft as any).slug || draft.id, sixStageJourney: finalJourney, access: draft.access, customJourneyStages: finalCustomStages },
        gameType: draft.gameType, gameConfig: { ...gameConfig, lessonFormat: isIslandCourse ? 'aiki-island-6steps' : lessonFormat, sixStageJourney: finalJourney, customJourneyStages: finalCustomStages },
        checkQuestions: draft.checkQuestions,
      }
      if (isEdit) await api(`/api/teacher/lectures/${lecture.id}`, { method: 'PATCH', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
      else await api('/api/teacher/lectures', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
      showToast(isEdit ? '✅ Đã cập nhật bài học!' : '✅ Đã tạo bài học mới!', 'success')
      onSaved(); window.sessionStorage.removeItem(draftStorageKey); onClose()
    } catch (err) { showToast(`Lỗi: ${err instanceof Error ? err.message : 'Không thể lưu'}`, 'error') }
    finally { setSaving(false) }
  }

  const containerStyle: React.CSSProperties = inline
    ? { display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc', overflow: 'hidden', borderRadius: '1rem', border: '1px solid #e2e8f0' }
    : { position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 401, width: '100%', maxWidth: showInlinePreview ? 'min(1280px, 100vw)' : 'min(1100px, 100vw)', background: '#f8fafc', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '-20px 0 60px rgba(15,23,42,0.15)' }

  const body = (
    <div style={containerStyle}>
      <LectureDrawerHeader
        uid={uid} draft={draft} isEdit={isEdit} readOnly={readOnly} archived={archived} isIslandCourse={isIslandCourse}
        lessonFormat={lessonFormat} customJourneyStages={draft.customJourneyStages} activeSection={activeSection}
        readiness={readiness} showInlinePreview={showInlinePreview} recovery={recovery} draftStorageKey={draftStorageKey}
        onRestore={onRestore} onArchive={onArchive} onRequestClose={requestClose}
        onOpenCustomStagesModal={() => setShowCustomStagesModal(true)}
        onShowFullPreview={() => {
          const currentIdx = activeSection.startsWith('stage-')
            ? parseInt(activeSection.replace('stage-', ''), 10)
            : 0
          setPreviewStageIndex(Number.isNaN(currentIdx) ? 0 : currentIdx)
          setShowFullPreview(true)
        }}
        onToggleInlinePreview={() => setShowInlinePreview((v) => !v)}
        onFormatChange={(fmt) => { setLessonFormat(fmt); setActiveSection(fmt.startsWith('aiki-') ? 'stage-0' : 'content') }}
        onSelectSection={(sec) => setActiveSection(sec)}
        onDiscardRecovery={() => { window.sessionStorage.removeItem(draftStorageKey); setRecovery(null) }}
        onApplyRecovery={() => { if (recovery) { setDraft(recovery.draft); setRecovery(null); showToast('Đã khôi phục', 'success') } }}
        sectionStatus={(s) => resolveSectionStatus(s, draft, isIslandCourse, readiness)}
        sectionMissing={(s) => resolveSectionMissing(s, draft, isIslandCourse, readiness)}
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
        {activeSection === 'basics' && (
          <LectureDrawerBasicsForm
            draft={draft} deferredDraft={deferredDraft} set={set} updateAccess={updateAccess}
            readOnly={readOnly} isIslandCourse={isIslandCourse} showInlinePreview={showInlinePreview}
            setShowInlinePreview={setShowInlinePreview} uid={uid}
          />
        )}
        {activeSection.startsWith('stage-') && (
          <SixStageJourneyEditor
            draft={draft} deferredDraft={deferredDraft} updateSixStage={updateSixStage}
            stageIndex={parseInt(activeSection.replace('stage-', ''), 10)} readOnly={readOnly} courseId={courseId}
            lessonFormat={lessonFormat} isIslandCourse={isIslandCourse} onSelectSection={(sec) => setActiveSection(sec)}
            onSave={handleSave} saving={saving} readiness={readiness} showInlinePreview={showInlinePreview}
            setShowInlinePreview={setShowInlinePreview} updateStageBlocks={updateStageBlocks} updateBlockItem={updateBlockItem}
            moveBlock={moveBlock} removeBlock={removeBlock} handleAddModule={handleAddModule}
            uploadingStageMedia={uploadingStageMedia} setUploadingStageMedia={setUploadingStageMedia}
            uploadLearnCardMedia={uploadLearnCardMedia} uploadAdditionalImageItem={uploadAdditionalImageItem} previewAikiVoice={previewAikiVoice}
            previewSpeakingIndex={previewSpeakingIndex} speakTextPreview={speakTextPreview} updateLearnCard={updateLearnCard}
            showToast={showToast} isDragOver={isDragOver} setIsDragOver={setIsDragOver} draggingBlockIdx={draggingBlockIdx}
            setDraggingBlockIdx={setDraggingBlockIdx} dragOverBlockIdx={dragOverBlockIdx} setDragOverBlockIdx={setDragOverBlockIdx}
            isTrashDragOver={isTrashDragOver} setIsTrashDragOver={setIsTrashDragOver}
          />
        )}
        {lessonFormat === 'standard' && ['content', 'game', 'practice', 'check'].includes(activeSection) && (
          <LectureDrawerStandardContent
            readOnly={readOnly} draft={draft} deferredDraft={deferredDraft} activeSection={activeSection}
            lessonFormat={lessonFormat} setLessonFormat={setLessonFormat} applyAikiRuleTemplate={() => {}}
            set={set} quizQuestions={quizQuestions} setQuizQuestions={setQuizQuestions} setShowBankPicker={setShowBankPicker}
            moveLearnCard={() => {}} removeLearnCard={() => {}} updateLearnCard={updateLearnCard}
            uploadingStageMedia={uploadingStageMedia} uploadLearnCardMedia={uploadLearnCardMedia} addLearnCard={() => {}}
            handleAddModule={handleAddModule} moveBlock={moveBlock} removeBlock={removeBlock} updateStageBlocks={updateStageBlocks}
            updateBlockItem={updateBlockItem} uploadAdditionalImageItem={uploadAdditionalImageItem} previewAikiVoice={previewAikiVoice}
            previewSpeakingIndex={previewSpeakingIndex} courseId={courseId} showToast={showToast} isDragOver={isDragOver}
            setIsDragOver={setIsDragOver} draggingBlockIdx={draggingBlockIdx} setDraggingBlockIdx={setDraggingBlockIdx}
            dragOverBlockIdx={dragOverBlockIdx} setDragOverBlockIdx={setDragOverBlockIdx} isTrashDragOver={isTrashDragOver}
            setIsTrashDragOver={setIsTrashDragOver}
          />
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 }}>
        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {readiness.complete ? <CheckCircle2 size={14} color="#10b981" /> : <Circle size={14} color="#f97316" />}
            <span style={{ fontSize: '0.8125rem', color: readiness.complete ? '#10b981' : '#f97316' }}>
              {readiness.complete ? 'Sẵn sàng lưu!' : `Còn ${readiness.total - readiness.completed} bước chưa hoàn thành`}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!readOnly ? (
            <>
              <button type="button" onClick={requestClose} style={{ padding: '0.625rem 1.25rem', borderRadius: '0.625rem', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}>Hủy</button>
              <button type="button" id={`${uid}-save-lecture`} onClick={handleSave} disabled={saving} style={{ padding: '0.625rem 1.5rem', borderRadius: '0.625rem', border: 'none', background: readiness.complete ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#c7d2fe', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Đang lưu...' : isEdit ? 'Lưu trạm học' : 'Tạo trạm học'}</button>
            </>
          ) : (
            <button type="button" onClick={requestClose} style={{ padding: '0.625rem 1.5rem', borderRadius: '0.625rem', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}>Đóng</button>
          )}
        </div>
      </div>
      {showBankPicker && <QuestionBankPicker selectedIds={quizQuestions.map((q) => q.id)} onSelect={(nq) => setQuizQuestions((p) => [...p, ...nq])} onClose={() => setShowBankPicker(false)} />}
      <ConfirmDialog open={confirmClose} title="Bỏ các thay đổi chưa lưu?" description="Nội dung vừa chỉnh trong trạm sẽ bị mất." confirmLabel="Bỏ thay đổi" cancelLabel="Tiếp tục soạn" danger onCancel={() => setConfirmClose(false)} onConfirm={() => { window.sessionStorage.removeItem(draftStorageKey); setConfirmClose(false); onDirtyChange?.(false); onClose() }} />
      <FullStationPreviewModal open={showFullPreview} onClose={() => setShowFullPreview(false)} draft={draft} lessonFormat={lessonFormat} gameConfig={buildLectureGameConfig(draft)} isIslandCourse={isIslandCourse} initialStageIndex={previewStageIndex} />
      <CustomStagesManagerModal
        isOpen={showCustomStagesModal}
        onClose={() => setShowCustomStagesModal(false)}
        currentStages={draft.customJourneyStages && draft.customJourneyStages.length >= 3 ? draft.customJourneyStages : (draft.sixStageJourney?.customStages && draft.sixStageJourney.customStages.length >= 3 ? draft.sixStageJourney.customStages : STANDARD_ISLAND_6_STAGES)}
        starAllocation={draft.sixStageJourney?.stageStarAllocation ?? DEFAULT_STAR_ALLOCATION}
        onApply={handleApplyCustomStages}
        readOnly={readOnly}
        showToast={showToast}
      />
    </div>
  )

  if (inline) return body
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(3px)' }} />
      {body}
    </>
  )
}
export default LectureDrawer
