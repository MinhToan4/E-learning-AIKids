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
import { useState, useCallback, useEffect, useId, useRef } from 'react'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { X, CheckCircle2, Circle, Youtube, BookOpen, Gamepad2, Palette, HelpCircle, BookMarked, Target, Lightbulb, Eye, Plus, Trash2, ChevronUp, ChevronDown, BrainCircuit, ScanSearch, ListChecks, PanelsTopLeft, Scale, BookmarkCheck, MessageCircleQuestion, Flag, Clapperboard, Volume2, Trophy, MessageSquareText, Sparkles, Image as ImageIcon, Check, Play, Film, Split, GripVertical, ArrowUp, ArrowDown, ZoomIn, Star } from 'lucide-react'
import { api, type LessonSixStageJourney } from '@/shared/lib/api'
import { resolveIslandSixStageJourney } from '@/features/lesson/lib/island-journey-resolver'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'
import { cn } from '@/shared/lib/cn'
import { useToast } from '@/shared/hooks/useToast'
import {
  GAME_OPTIONS, PRACTICE_OPTIONS, GAME_DIFFICULTIES,
  buildLectureGameConfig, lectureDraftReadiness,
  serializeLectureGameConfig, serializeLearnCardsForHub, slugifyAuthoringId, createAikiRuleLearnCards, AIKI_RULE_META_LABEL,
  AIKI_RULE_STAGE_KINDS,
  detectLessonFormat, isAikiRuleLesson, type LessonFormat,
  type LectureDraft,
  type LearnCardDraft,
  type LearnVisualItemDraft,
  type DialogueLine,
  type StageImageItem,
  type StageCompareData,
  type ContentBlockType,
  type StageBlockItem,
  getActiveModules,
  getStageBlocks,
  createFourKeysBlock,
} from '../lib/authoring'

export { getActiveModules }
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
import { AikidCatCharacter } from '@/shared/components/ui/AikidCatCharacter'
import { MeeCatInteractiveCanvas } from '@/features/mee-rig/components/MeeCatInteractiveCanvas'
import type { CurriculumGameConfig } from '@/features/lesson/lib/curriculum-game'

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

type Section = 'basics' | 'content' | 'game' | 'practice' | 'check' | 'stage-0' | 'stage-1' | 'stage-2' | 'stage-3' | 'stage-4' | 'stage-5'

const AIKI_SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'basics', label: 'Thông tin trạm', icon: <BookOpen size={14} /> },
  { id: 'stage-0', label: '1. Tình huống', icon: <Clapperboard size={14} /> },
  { id: 'stage-1', label: '2. Câu đố AIKI', icon: <BrainCircuit size={14} /> },
  { id: 'stage-2', label: '3. Quy tắc', icon: <Lightbulb size={14} /> },
  { id: 'stage-3', label: '4. Giải thích', icon: <ScanSearch size={14} /> },
  { id: 'stage-4', label: '5. Chốt', icon: <Trophy size={14} /> },
]

export const ISLAND_6_STAGE_SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'basics', label: 'Thông tin trạm', icon: <BookOpen size={14} /> },
  { id: 'stage-0', label: '1. 🎯 Mục tiêu (Ảnh)', icon: <Target size={14} /> },
  { id: 'stage-1', label: '2. ❓ Xác nhận (1 câu hỏi)', icon: <HelpCircle size={14} /> },
  { id: 'stage-2', label: '3. 🎬 Video bài học', icon: <Clapperboard size={14} /> },
  { id: 'stage-3', label: '4. 📝 Bài test thử tài', icon: <BrainCircuit size={14} /> },
  { id: 'stage-4', label: '5. 🎨 Thực hành (AI Studio)', icon: <Palette size={14} /> },
  { id: 'stage-5', label: '6. 🏆 Màn kết thúc', icon: <Trophy size={14} /> },
]

const STANDARD_SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'basics', label: 'Thông tin trạm', icon: <BookOpen size={14} /> },
  { id: 'content', label: 'Khám phá', icon: <BookOpen size={14} /> },
  { id: 'game', label: 'Thử cùng Mee', icon: <Gamepad2 size={14} /> },
  { id: 'practice', label: 'Tự tay làm', icon: <Palette size={14} /> },
  { id: 'check', label: 'Thử thách', icon: <HelpCircle size={14} /> },
]

const AIKI_STAGE_NAMES = [
  '1. Tình huống',
  '2. Câu đố AIKI',
  '3. Quy tắc',
  '4. Giải thích',
  '5. Chốt',
] as const

export const ISLAND_6_STAGE_NAMES = [
  '1. 🎯 Mục tiêu (Ảnh)',
  '2. ❓ Xác nhận (1 câu hỏi)',
  '3. 🎬 Video bài học',
  '4. 📝 Bài test thử tài',
  '5. 🎨 Thực hành (AI Studio)',
  '6. 🏆 Màn kết thúc',
] as const

const AVAILABLE_MODULES = [
  { id: 'text', label: 'Đoạn văn bản (Textbox)', icon: '📖', desc: 'Thêm một đoạn văn bản hoặc tiêu đề mới' },
  { id: 'layout-callout', label: 'Hộp Ghi Nhớ Nổi Bật', icon: '💡', desc: 'Khung vàng ghi chú bí kíp bỏ túi' },
  { id: 'layout-formula', label: 'Công Thức KaTeX', icon: '🔤', desc: 'Công thức toán học hoặc định nghĩa cô đọng' },
  { id: 'layout-split', label: '2 Cột Chữ + Media', icon: '📰', desc: 'Cột chữ kết hợp cột ảnh/video minh họa' },
  { id: 'layout-grid', label: 'Lưới 3 Ô Thẻ', icon: '🍱', desc: 'Lưới 3 thẻ ví dụ trực quan' },
  { id: 'layout-four-keys', label: 'Bố cục 4 Chìa Khóa', icon: '🔑', desc: 'Template 4 ô đúng giao diện bài Bốn chiếc chìa khóa' },
  { id: 'layout-storyboard', label: 'Chuỗi Storyboard', icon: '🎬', desc: 'Chuỗi 3 cảnh kịch bản diễn biến' },
  { id: 'voice', label: 'Mèo AIKI & Lipsync', icon: '🐱', desc: 'Studio tương tác, giọng đọc AI & khẩu hình Lipsync' },
  { id: 'video', label: 'Video Bài Giảng', icon: '🎬', desc: 'Video MP4 / YouTube phát tự động' },
  { id: 'versus-ab', label: '2 Ảnh Đối Đầu A/B', icon: '🖼️', desc: 'Upload & cấu hình 2 ảnh đối đầu A & B' },
  { id: 'dialogue', label: 'Kịch Bản Phân Vai Comic', icon: '💬', desc: 'Phân vai Zico / Sonet / AKI / Tùy chọn' },
  { id: 'compare', label: 'Bảng So Sánh 2 Cột', icon: '⚖️', desc: 'Bảng 2 cột tiêu đề, nội dung & 2 ảnh so sánh' },
  { id: 'poster', label: 'Poster Quy Tắc Vàng', icon: '📜', desc: 'Quy tắc to bản, ảnh poster riêng & bí kíp bỏ túi' },
  { id: 'images', label: 'Bộ Sưu Tập Ảnh Minh Họa', icon: '📷', desc: 'Danh sách ảnh kèm caption chú thích' },
] as const

function speakTextPreview(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text?.trim()) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text.trim())
  utterance.lang = 'vi-VN'
  utterance.rate = 1.0
  window.speechSynthesis.speak(utterance)
}

const SELF_CONTAINED_QUIZ_GAMES = ['math-kids']
const CATALOG_GAMES = ['data-runner', 'truth-patrol']

function goalLines(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
}

const COURSE_GOAL_BLOCK_PREFIX = 'course-goal-'

function goalKeyItems(keyPoints: string[]): LearnVisualItemDraft[] {
  const defaults = ['Cái gì?', 'Trông như thế nào?', 'Đang làm gì?', 'Ở đâu?']
  return Array.from({ length: 4 }, (_, index) => {
    const value = keyPoints[index] || ''
    const separator = value.indexOf(':')
    return {
      label: separator > 0 ? value.slice(0, separator).trim() : defaults[index],
      text: separator > 0 ? value.slice(separator + 1).trim() : value,
      tone: (['sky', 'sun', 'coral', 'brand'] as const)[index],
    }
  })
}

function buildCourseGoalBlocks(journey: LessonSixStageJourney, existing: StageBlockItem[] = []): StageBlockItem[] {
  if (journey.stageBlockEditorVersion === 2) return existing
  const existingFourKeys = existing.find((block) => block.type === 'layout-four-keys')
  const authoredExtras = existing.filter((block) =>
    !block.id.startsWith(COURSE_GOAL_BLOCK_PREFIX) && block !== existingFourKeys
  )
  return [
    { id: `${COURSE_GOAL_BLOCK_PREFIX}text`, type: 'text', title: journey.stage1_goal.title, body: journey.stage1_goal.goalText },
    {
      ...createFourKeysBlock(`${COURSE_GOAL_BLOCK_PREFIX}four-keys`),
      ...(existingFourKeys || {}),
      id: `${COURSE_GOAL_BLOCK_PREFIX}four-keys`,
      visualItems: existingFourKeys?.visualItems?.length ? existingFourKeys.visualItems.slice(0, 4) : goalKeyItems(journey.stage1_goal.keyPoints),
    },
    { id: `${COURSE_GOAL_BLOCK_PREFIX}image`, type: 'images', title: 'Ảnh mục tiêu', imageUrl: journey.stage1_goal.imageUrl, imageAlt: journey.stage1_goal.title, additionalImages: [] },
    { id: `${COURSE_GOAL_BLOCK_PREFIX}voice`, type: 'voice', readText: journey.stage1_goal.speech, gesture: 'presentation' },
    ...authoredExtras,
  ]
}

const LEARN_KIND_OPTIONS: Array<{ id: LearnCardDraft['kind']; label: string }> = [
  { id: 'concept', label: 'Khái niệm' },
  { id: 'example', label: 'Ví dụ đời sống' },
  { id: 'compare', label: 'So sánh' },
  { id: 'steps', label: 'Từng bước' },
  { id: 'storyboard', label: 'Storyboard' },
  { id: 'remember', label: 'Ghi nhớ' },
  { id: 'situation', label: 'Tình huống' },
  { id: 'aiki-riddle', label: 'Câu đố của AIKI' },
  { id: 'rule', label: 'Quy tắc' },
  { id: 'explanation', label: 'Giải thích' },
  { id: 'closing', label: 'Chốt' },
]

const LEARN_LAYOUT_OPTIONS: Array<{ id: LearnCardDraft['layout']; label: string; icon: string; description: string }> = [
  { id: 'text', label: '1 Cột Tập Trung', icon: '📖', description: 'Một cột, phù hợp giải thích ý chính & đọc tập trung.' },
  { id: 'split', label: '2 Cột Chữ + Media', icon: '📰', description: 'Hai cột trên màn hình lớn: Chữ bên trái, ảnh bên phải.' },
  { id: 'visual-grid', label: 'Lưới 3 Ô Thẻ', icon: '🍱', description: '2–3 ô để so sánh hoặc phân loại ý tưởng.' },
  { id: 'storyboard', label: 'Chuỗi Storyboard', icon: '🎬', description: 'Các khung cảnh tranh vẽ diễn hoạt theo trình tự.' },
]

const LECTURE_GESTURES = [
  { id: 'presentation', label: '🤲 Thuyết trình cơ bản' },
  { id: 'point-left', label: '👈 Chỉ bảng bài học' },
  { id: 'think', label: '💡 Cùng suy nghĩ (đố vui)' },
  { id: 'idea', label: '💡 Aha! Nêu mẹo (quy tắc)' },
  { id: 'celebrate-1', label: '🎉 Hoan hô ăn mừng' },
  { id: 'explain', label: '👐 Diễn giải mở rộng' },
] as const

const LEARN_KIND_PRESENTATION = {
  concept: { label: 'Khái niệm', icon: BrainCircuit, tone: 'border-sun-200 bg-sun-50 text-sun-800' },
  example: { label: 'Ví dụ đời sống', icon: ScanSearch, tone: 'border-mint-200 bg-mint-50 text-mint-800' },
  compare: { label: 'So sánh', icon: Scale, tone: 'border-sky-200 bg-sky-50 text-sky-800' },
  steps: { label: 'Từng bước', icon: ListChecks, tone: 'border-brand-200 bg-brand-50 text-brand-800' },
  storyboard: { label: 'Storyboard', icon: PanelsTopLeft, tone: 'border-coral-200 bg-coral-50 text-coral-800' },
  remember: { label: 'Ghi nhớ', icon: BookmarkCheck, tone: 'border-sun-200 bg-white text-sun-800' },
  situation: { label: 'Tình huống', icon: Clapperboard, tone: 'border-coral-200 bg-coral-50 text-coral-800' },
  'aiki-riddle': { label: 'Câu đố của AIKI', icon: MessageCircleQuestion, tone: 'border-sky-200 bg-sky-50 text-sky-800' },
  rule: { label: 'Quy tắc', icon: BookmarkCheck, tone: 'border-brand-200 bg-brand-50 text-brand-800' },
  explanation: { label: 'Giải thích', icon: BrainCircuit, tone: 'border-mint-200 bg-mint-50 text-mint-800' },
  closing: { label: 'Chốt', icon: Flag, tone: 'border-sun-200 bg-sun-50 text-sun-800' },
} satisfies Record<LearnCardDraft['kind'], { label: string; icon: typeof Lightbulb; tone: string }>

function defaultLearnCards(concept = '', example = ''): LearnCardDraft[] {
  return [
    { id: 'concept', title: 'Khám phá ý chính', body: concept, tip: '', kind: 'concept', layout: 'text', visualItems: [], mee: { readText: '', gesture: 'presentation', autoRead: false } },
    { id: 'example', title: 'Ví dụ để hiểu rõ', body: example, tip: '', kind: 'example', layout: 'split', visualItems: [], mee: { readText: '', gesture: 'point-left', autoRead: false } },
  ]
}

function normalizeLearnKind(value: unknown, index: number, id = '', isAiki = false): LearnCardDraft['kind'] {
  const encodedKind = ({
    'aiki-rule-situation': 'situation',
    'aiki-rule-riddle': 'aiki-riddle',
    'aiki-rule-rule': 'rule',
    'aiki-rule-explanation': 'explanation',
    'aiki-rule-closing': 'closing',
  } as const)[id as 'aiki-rule-situation']
  if (encodedKind) return encodedKind
  if (value === 'situation' || value === 'aiki-riddle' || value === 'rule' || value === 'explanation' || value === 'closing') return value
  // Khôi phục theo vị trí 5 chặng nếu nhận được Hub kind
  if (isAiki || id.startsWith('aiki-rule-')) {
    if (index === 0 && value === 'concept') return 'situation'
    if (index === 1 && value === 'example') return 'aiki-riddle'
    if (index === 2 && value === 'steps') return 'rule'
    if (index === 3 && value === 'compare') return 'explanation'
    if (index === 4 && value === 'remember') return 'closing'
  }
  if (value === 'concept' || value === 'example' || value === 'compare' || value === 'steps' || value === 'storyboard' || value === 'remember') return value
  if (value === 'guided-practice') return 'steps'
  if (value === 'artifact') return 'remember'
  return index === 0 ? 'concept' : 'example'
}

function normalizeLearnLayout(value: unknown, hasVisualItems: boolean, kind: LearnCardDraft['kind']): LearnCardDraft['layout'] {
  if (value === 'text' || value === 'split' || value === 'visual-grid' || value === 'storyboard') return value
  if (kind === 'storyboard') return 'storyboard'
  return hasVisualItems ? 'split' : 'text'
}

export function normalizeLectureDraft(draft: LectureDraft, courseId = ''): LectureDraft {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const explicitFormat = (draft as any).lessonFormat || (draft as any).gameConfig?.lessonFormat
  const hasIslandContract =
    explicitFormat === 'aiki-island-6steps' ||
    courseId.startsWith('dao-') ||
    Boolean(draft.metadata?.sixStageJourney) ||
    Boolean(draft.sixStageJourney) ||
    (/^bai-\d+-\d+/i.test(draft.id || '') && explicitFormat !== 'standard')
  // The explicit six-stage course contract wins over legacy five-card data.
  // Several migrated course lessons still carry exactly five generic cards;
  // treating card count/order as authoritative turned them into AIKI Rules.
  const isAiki = !hasIslandContract && (explicitFormat === 'aiki-rule-5steps' || isAikiRuleLesson(draft.learnCards || []))
  const isIsland = hasIslandContract
  const format: LessonFormat = isAiki ? 'aiki-rule-5steps' : (isIsland ? 'aiki-island-6steps' : (explicitFormat === 'standard' ? 'standard' : (draft.lessonFormat ?? 'standard')))

  let sixStageJourney = draft.sixStageJourney || ((draft as any).metadata?.sixStageJourney as LessonSixStageJourney | undefined)
  if (isIsland && !sixStageJourney) {
    try {
      sixStageJourney = resolveIslandSixStageJourney(draft as any)
    } catch {
      // ignore
    }
  }

  const sourceCards = draft.learnCards?.length ? [...draft.learnCards] : defaultLearnCards(draft.concept, draft.example)
  if (isIsland) {
    while (sourceCards.length < 6) {
      const index = sourceCards.length
      sourceCards.push({
        id: `island-stage-${index + 1}`,
        title: ISLAND_6_STAGE_NAMES[index] || `Chặng ${index + 1}`,
        body: '', tip: '', kind: index === 0 ? 'concept' : 'example', layout: 'text', visualItems: [], contentBlocks: [],
      })
    }
  }
  return {
    ...draft,
    lessonFormat: format,
    sixStageJourney,
    practiceConfigText: draft.practiceConfigText ?? '',
    learnCards: sourceCards.map((card, index) => {
      const sourceVisualItems = Array.isArray(card.visualItems) ? card.visualItems : []
      const encodedItem = sourceVisualItems.find((item) => item.label === AIKI_RULE_META_LABEL)
      let encoded: Partial<LearnCardDraft> = {}
      // AIKI Rule metadata must never reshape a six-stage course lesson.
      // It is legacy residue on some migrated lessons and is discarded here.
      if (isAiki) {
        try { encoded = encodedItem ? JSON.parse(encodedItem.text) as Partial<LearnCardDraft> : {} } catch { encoded = {} }
      }
      const visualItems = sourceVisualItems.filter((item) => item.label !== AIKI_RULE_META_LABEL)
      const kind = isAiki && index < AIKI_RULE_STAGE_KINDS.length
        ? AIKI_RULE_STAGE_KINDS[index]
        : normalizeLearnKind(encoded.kind ?? card.kind, index, isAiki ? card.id : '', isAiki)
      return {
        ...card,
        id: card.id || (isAiki && index < AIKI_RULE_STAGE_KINDS.length ? `aiki-rule-${AIKI_RULE_STAGE_KINDS[index]}` : `learn-${index + 1}`),
        title: card.title || `Khối khám phá ${index + 1}`,
        body: card.body || '',
        tip: card.tip ?? '',
        kind,
        layout: normalizeLearnLayout(card.layout, visualItems.length > 0, kind),
        visualItems,
        imageUrl: isIsland && index === 0 && sixStageJourney ? sixStageJourney.stage1_goal.imageUrl : encoded.imageUrl ?? card.imageUrl ?? '',
        imageAlt: encoded.imageAlt ?? card.imageAlt ?? '',
        videoUrl: encoded.videoUrl ?? card.videoUrl ?? '',
        optionImages: encoded.optionImages ?? card.optionImages ?? (kind === 'aiki-riddle' ? ['', ''] : undefined),
        optionLabels: encoded.optionLabels ?? card.optionLabels,
        optionDescs: encoded.optionDescs ?? card.optionDescs,
        dialogueLines: encoded.dialogueLines ?? card.dialogueLines,
        additionalImages: encoded.additionalImages ?? card.additionalImages,
        compareData: encoded.compareData ?? card.compareData,
        enabledModules: encoded.enabledModules ?? card.enabledModules,
        contentBlocks: isIsland && index === 0 && sixStageJourney
          ? buildCourseGoalBlocks(sixStageJourney, (encoded.contentBlocks ?? card.contentBlocks ?? sixStageJourney.stageContentBlocks?.['stage-0'] ?? []) as StageBlockItem[])
          : encoded.contentBlocks ?? card.contentBlocks ?? (isIsland
              ? sixStageJourney?.stageContentBlocks?.[`stage-${index}`] as StageBlockItem[] | undefined
              : undefined),
        compareImages: encoded.compareImages ?? card.compareImages ?? (kind === 'explanation' ? { left: '', right: '' } : undefined),
        mee: isIsland && index === 0 && sixStageJourney
          ? { ...(encoded.mee ?? card.mee), readText: sixStageJourney.stage1_goal.speech, voiceProvider: 'vertex', gesture: encoded.mee?.gesture ?? card.mee?.gesture ?? 'presentation', autoRead: encoded.mee?.autoRead ?? card.mee?.autoRead ?? false }
          : encoded.mee ?? card.mee ?? { readText: '', audioUrl: '', voiceProvider: 'vertex', gesture: 'presentation', autoRead: false },
      }
    }),
  }
}

function StudentBasicsPreview({ draft }: { draft: LectureDraft }) {
  const goals = goalLines(draft.goalsText)
  return (
    <aside className="ui-card h-fit p-4 lg:sticky lg:top-4" aria-label="Xem trước thông tin trạm trên màn học sinh">
      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-sky-700"><Eye size={16} /> Học sinh sẽ thấy</p>
      <div className="mt-3 rounded-3xl border-2 border-brand-200 bg-brand-50 p-5 text-center shadow-sm">
        <p className="font-display text-xl leading-tight text-brand-800">{draft.hook.trim() || 'Câu hỏi khởi động sẽ xuất hiện tại đây'}</p>
      </div>
      <div className="mt-4 rounded-2xl border-2 border-border bg-white p-4">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-coral-600"><Target size={16} /> Hôm nay con sẽ</p>
        <ol className="mt-3 grid gap-2">
          {(goals.length ? goals : ['Mục tiêu 1', 'Mục tiêu 2', 'Mục tiêu 3']).slice(0, 4).map((goal, index) => (
            <li key={`${index}-${goal}`} className="flex items-start gap-2 rounded-xl border border-coral-200 bg-coral-50 px-3 py-2 text-sm font-bold text-text">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs text-coral-700">{index + 1}</span>
              <span>{goal}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-3 text-xs font-semibold leading-relaxed text-muted">Nên dùng một câu hỏi tò mò và 3 mục tiêu có thể quan sát được. Mỗi mục tiêu bắt đầu bằng động từ: nhận biết, giải thích, tạo, so sánh hoặc tự kiểm tra.</p>
    </aside>
  )
}

function StudentLearnPreview({ draft }: { draft: LectureDraft }) {
  const cards = draft.learnCards.length ? draft.learnCards : defaultLearnCards(draft.concept, draft.example)
  return (
    <aside className="ui-card h-fit p-4 lg:sticky lg:top-4" aria-label="Xem trước nội dung khám phá trên màn học sinh">
      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-sky-700"><Eye size={16} /> Xem trước phần Khám phá</p>
      <div className="mt-3 grid gap-3">
        {cards.map((card, index) => {
          const presentation = LEARN_KIND_PRESENTATION[card.kind] ?? LEARN_KIND_PRESENTATION.example
          const KindIcon = presentation.icon
          const hasVisuals = card.visualItems.length > 0
          return (
          <article key={card.id} className={`rounded-2xl border-2 p-4 shadow-sm ${presentation.tone} ${card.layout === 'split' && hasVisuals ? 'sm:grid sm:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] sm:gap-3' : ''}`}>
            <div>
            <div className="flex items-center justify-between gap-2">
              <span className="grid size-10 place-items-center rounded-xl bg-white/80"><KindIcon size={21} aria-hidden="true" /></span>
              <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide">{presentation.label}</span>
            </div>
            <h3 className="mt-2 font-display text-lg">{card.title}</h3>
            <p className="mt-1 whitespace-pre-line text-sm font-semibold leading-relaxed text-text">{card.body.trim() || 'Nội dung của khối sẽ hiển thị ở đây.'}</p>
            {card.tip && <p className="mt-3 rounded-xl border border-current/20 bg-white/80 px-3 py-2 text-xs font-bold">Ghi nhớ: {card.tip}</p>}
            </div>
            {(hasVisuals || card.layout !== 'text') && (
              <div className={`mt-3 grid gap-2 ${card.layout === 'split' ? 'content-center sm:mt-0' : ''} ${card.layout === 'storyboard' ? 'grid-cols-2' : card.layout === 'visual-grid' ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                {!hasVisuals && <div className="col-span-full rounded-xl border border-dashed border-current/30 bg-white/60 p-3 text-center text-xs font-bold">Thêm các ô ví dụ để thấy layout {LEARN_LAYOUT_OPTIONS.find((option) => option.id === card.layout)?.label.toLocaleLowerCase('vi')}</div>}
                {card.visualItems.map((item, itemIndex) => (
                  <div key={`${item.label}-${itemIndex}`} className={`rounded-xl border border-current/20 bg-white/80 p-3 ${card.layout === 'storyboard' ? 'relative pt-8' : ''}`}>
                    {card.layout === 'storyboard' && <span className="absolute left-2 top-2 grid size-5 place-items-center rounded-full bg-current text-[10px] text-white">{itemIndex + 1}</span>}
                    <strong className="block text-xs">{item.label || `Ví dụ ${itemIndex + 1}`}</strong>
                    <span className="mt-1 block text-xs font-semibold text-text">{item.text}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        )})}
      </div>
      <div className="mt-3 rounded-xl bg-sky-50 px-3 py-3 text-xs font-semibold leading-relaxed text-sky-900">
        <strong>Cách viết đúng:</strong> giải thích một ý trong 2–4 câu; ví dụ phải có nhân vật hoặc tình huống cụ thể; tránh định nghĩa dài và thuật ngữ chưa được giải thích.
      </div>
    </aside>
  )
}

function getBlockIcon(type: ContentBlockType): string {
  switch (type) {
    case 'text':
    case 'layout-text':
      return '📖'
    case 'layout-callout':
      return '💡'
    case 'layout-formula':
      return '🔤'
    case 'layout-split':
      return '📰'
    case 'layout-grid':
      return '🍱'
    case 'layout-storyboard':
      return '🎬'
    case 'voice':
      return '🐱'
    case 'video':
      return '🎬'
    case 'versus-ab':
      return '🖼️'
    case 'dialogue':
      return '💬'
    case 'compare':
      return '⚖️'
    case 'poster':
      return '📜'
    case 'images':
      return '📷'
    default:
      return '📦'
  }
}

function getBlockTitle(type: ContentBlockType, customTitle?: string): string {
  switch (type) {
    case 'text':
    case 'layout-text':
      return customTitle || 'ĐOẠN VĂN BẢN'
    case 'layout-callout':
      return customTitle || 'HỘP GHI NHỚ NỔI BẬT'
    case 'layout-formula':
      return customTitle || 'CÔNG THỨC KATEX'
    case 'layout-split':
      return customTitle || '2 CỘT CHỮ + MEDIA'
    case 'layout-grid':
      return customTitle || 'LƯỚI Ô THẺ'
    case 'layout-storyboard':
      return customTitle || 'CHUỖI STORYBOARD'
    case 'voice':
      return 'MÈO AIKI ĐỒNG HÀNH & TRỢ GIẢNG AI'
    case 'video':
      return 'VIDEO BÀI GIẢNG'
    case 'versus-ab':
      return '2 TRANH ĐỐI ĐẦU A/B'
    case 'dialogue':
      return 'KỊCH BẢN PHÂN VAI COMIC'
    case 'compare':
      return 'BẢNG SO SÁNH 2 CỘT'
    case 'poster':
      return 'POSTER QUY TẮC VÀNG'
    case 'images':
      return 'BỘ SƯU TẬP ẢNH MINH HỌA'
    default:
      return customTitle || 'KHỐI NỘI DUNG'
  }
}

function StudentStagePreview({
  card,
  stageIndex,
  isIsland,
  sixStageJourney,
  stageCard,
}: {
  card?: LearnCardDraft
  stageIndex: number
  isIsland?: boolean
  sixStageJourney?: LessonSixStageJourney
  stageCard?: LearnCardDraft
}) {
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title?: string } | null>(null)

  if (isIsland && sixStageJourney) {
    const stageName = ISLAND_6_STAGE_NAMES[stageIndex] ?? `Chặng ${stageIndex + 1}`

    return (
      <aside className="ui-card h-fit p-4 lg:sticky lg:top-4" aria-label={`Xem trước ${stageName} trên màn học sinh`}>
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/80">
          <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-sky-700">
            <Eye size={15} /> Xem trước học sinh (Đảo AIKids)
          </p>
          <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-black text-brand-800">
            Chặng {stageIndex + 1}/6
          </span>
        </div>

        <div className="mt-3">
          {/* Chặng 0: Mục tiêu */}
          {stageIndex === 0 && (
            <SixStageGoalStage
              goal={sixStageJourney.stage1_goal}
              fourKeys={sixStageJourney.stage1_goal.keyPoints.length >= 4 || sixStageJourney.stage1_goal.title.toLowerCase().includes('chìa khoá')}
              showContinue={false}
              onImageClick={(image) => setZoomedImage(image)}
            />
          )}

          {/* Chặng 1: Xác nhận */}
          {stageIndex === 1 && (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/70 p-3.5 shadow-sm">
                <span className="text-[10px] font-black uppercase text-sky-700">❓ Câu đố xác nhận</span>
                <p className="font-display text-sm font-black text-sky-950 mt-1">
                  {sixStageJourney.stage2_confirmGoal.question || 'Câu hỏi xác nhận...'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sixStageJourney.stage2_confirmGoal.options.map((opt, idx) => (
                  <div
                    key={opt.id || idx}
                    className={cn(
                      "rounded-xl border-2 p-2 text-center transition",
                      idx === sixStageJourney.stage2_confirmGoal.correctIndex
                        ? "border-emerald-400 bg-emerald-50/90 ring-2 ring-emerald-200"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-black text-slate-700 uppercase">
                        {idx === 0 ? '🅰️ Phương án A' : '🅱️ Phương án B'}
                      </span>
                      {idx === sixStageJourney.stage2_confirmGoal.correctIndex && (
                        <span className="rounded bg-emerald-600 text-white text-[9px] font-extrabold px-1">ĐÚNG</span>
                      )}
                    </div>
                    {opt.imageUrl ? (
                      <img src={opt.imageUrl} alt={opt.text} className="aspect-video w-full rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    ) : (
                      <div className="aspect-video rounded-lg bg-slate-100 grid place-items-center text-[10px] text-muted">Chưa có ảnh</div>
                    )}
                    <p className="mt-1.5 text-xs font-bold text-slate-800 line-clamp-2">{opt.text}</p>
                  </div>
                ))}
              </div>
              {sixStageJourney.stage2_confirmGoal.explanation && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 text-xs font-semibold text-emerald-900">
                  💡 <strong>Giải thích:</strong> {sixStageJourney.stage2_confirmGoal.explanation}
                </div>
              )}
            </div>
          )}

          {/* Chặng 2: Video */}
          {stageIndex === 2 && (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-purple-200 bg-purple-50/60 p-3 shadow-sm">
                <span className="text-[10px] font-black uppercase text-purple-700">🎬 Video bài học</span>
                <p className="font-display text-sm font-black text-purple-950 mt-0.5">{sixStageJourney.stage3_video.title}</p>
              </div>
              <div className="aspect-video w-full rounded-2xl bg-slate-900 grid place-items-center text-white relative overflow-hidden shadow-sm">
                {sixStageJourney.stage3_video.posterUrl && (
                  <img src={sixStageJourney.stage3_video.posterUrl} alt="Poster" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                )}
                <div className="relative z-10 flex flex-col items-center gap-1.5 text-center p-3">
                  <div className="size-12 rounded-full bg-white/20 backdrop-blur-xs grid place-items-center border border-white/40">
                    <Play size={22} className="text-white fill-white ml-0.5" />
                  </div>
                  <span className="text-xs font-bold tracking-wide">Thời lượng: {sixStageJourney.stage3_video.durationSec}s</span>
                </div>
              </div>
              {sixStageJourney.stage3_video.timestamps && sixStageJourney.stage3_video.timestamps.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-600">Phân đoạn video:</p>
                  {sixStageJourney.stage3_video.timestamps.map((ts, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-semibold text-slate-700 py-1 border-b border-slate-100 last:border-0">
                      <span>{idx + 1}. {ts.label}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{ts.startSec}s - {ts.endSec}s</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chặng 3: Quiz */}
          {stageIndex === 3 && (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-3 shadow-sm">
                <span className="text-[10px] font-black uppercase text-indigo-700">📝 Bài test thử tài</span>
                <p className="font-display text-sm font-black text-indigo-950 mt-0.5">{sixStageJourney.stage4_quiz.title}</p>
                <span className="text-[10px] font-bold text-indigo-600">Đạt yêu cầu: {sixStageJourney.stage4_quiz.passScore} câu</span>
              </div>
              <div className="space-y-2">
                {sixStageJourney.stage4_quiz.questions.map((q, idx) => (
                  <div key={q.id || idx} className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs">
                    <p className="font-bold text-slate-900 mb-1.5">{idx + 1}. {q.prompt}</p>
                    <div className="space-y-1">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={cn(
                            "px-2 py-1 rounded text-[11px] font-semibold flex items-center justify-between",
                            optIdx === q.correctIndex ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-50 text-slate-600"
                          )}
                        >
                          <span>{opt}</span>
                          {optIdx === q.correctIndex && <Check size={12} className="text-emerald-600" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chặng 4: Practice */}
          {stageIndex === 4 && (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/70 p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-brand-700">🎨 Xưởng thực hành AI</span>
                  <span className="rounded-full bg-brand-200 text-brand-900 px-2 py-0.5 text-[10px] font-black">
                    {sixStageJourney.stage5_practice.badge}
                  </span>
                </div>
                <h4 className="font-display text-sm font-black text-brand-950 mt-1">{sixStageJourney.stage5_practice.subjectName}</h4>
                <p className="text-[11px] text-brand-800 font-semibold italic mt-1 bg-white/80 p-2 rounded-lg border border-brand-100">
                  "{sixStageJourney.stage5_practice.akiMotto}"
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                <p className="text-[10px] font-black uppercase text-slate-700 mb-1">Chi tiết vàng bắt buộc:</p>
                <div className="flex flex-wrap gap-1">
                  {sixStageJourney.stage5_practice.lockedFeatures.map((f, idx) => (
                    <span key={idx} className="rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-1.5 py-0.5">
                      🔒 {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1.5">
                <p className="text-[10px] font-black uppercase text-slate-700">Kịch bản 4 bước:</p>
                {sixStageJourney.stage5_practice.workflowSteps.map((ws, idx) => (
                  <div key={idx} className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-800">Bước {ws.step}: {ws.title}</span>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">Lệnh: {ws.quickPrompt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chặng 5: Completion */}
          {stageIndex === 5 && (
            <div className="space-y-3 text-center">
              <div className="rounded-2xl border-2 border-sun-300 bg-sun-50 p-4 shadow-sm">
                <div className="size-14 rounded-full bg-sun-100 border-2 border-sun-300 grid place-items-center mx-auto text-2xl shadow-sm">
                  🏆
                </div>
                <h4 className="font-display text-base font-black text-sun-950 mt-2">{sixStageJourney.stage6_completion.title}</h4>
                <p className="text-xs font-semibold text-slate-700 mt-1 leading-relaxed">
                  {sixStageJourney.stage6_completion.congratsMessage}
                </p>
                <div className="mt-3 inline-flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-sun-200 shadow-2xs">
                  <span className="text-xs font-extrabold text-amber-600 flex items-center gap-1">
                    <Star size={14} className="fill-amber-500 text-amber-500" />
                    +{sixStageJourney.stage6_completion.rewardBadge.stars} Sao
                  </span>
                  <span className="text-xs font-extrabold text-brand-600">
                    +{sixStageJourney.stage6_completion.rewardBadge.xp} XP
                  </span>
                </div>
              </div>
              {sixStageJourney.stage6_completion.nextLessonSlug && (
                <div className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold text-slate-600">
                  Bài tiếp theo: <span className="font-mono text-brand-600">{sixStageJourney.stage6_completion.nextLessonSlug}</span>
                </div>
              )}
            </div>
          )}
          {stageCard && getStageBlocks(stageCard, stageIndex).length > 0 && (
            <div className="mt-4 border-t border-sky-100 pt-4">
              <StudentStageBlocksView card={stageCard} stageIndex={stageIndex} />
            </div>
          )}
        </div>
      </aside>
    )
  }

  if (!card) return null
  const presentation = LEARN_KIND_PRESENTATION[card.kind] ?? LEARN_KIND_PRESENTATION.example
  const KindIcon = presentation.icon
  const stageName = AIKI_STAGE_NAMES[stageIndex] ?? `Chặng ${stageIndex + 1}`
  const stageBlocks = getStageBlocks(card, stageIndex)

  return (
    <aside className="ui-card h-fit p-4 lg:sticky lg:top-4" aria-label={`Xem trước ${stageName} trên màn học sinh`}>
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-sky-700">
          <Eye size={15} /> Xem trước học sinh
        </p>
        <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-black text-brand-800">
          Chặng {stageIndex + 1}/5
        </span>
      </div>

      <article className={`mt-3 rounded-2xl border-2 p-4 shadow-sm ${presentation.tone}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-white/80">
            <KindIcon size={20} aria-hidden="true" />
          </span>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
              {presentation.label}
            </span>
            {stageBlocks.map((b) => (
              <span key={b.id} className="rounded-full bg-brand-50 border border-brand-200 px-1.5 py-0.5 text-[9px] font-black text-brand-800">
                {b.type === 'versus-ab' ? '🖼️ A/B' : b.type === 'images' ? '📷 Ảnh' : b.type === 'dialogue' ? '💬 Thoại' : b.type === 'compare' ? '⚖️ So sánh' : b.type === 'poster' ? '📜 Poster' : b.type === 'voice' ? '🐱 Mèo' : b.type === 'video' ? '🎬 Video' : b.type === 'layout-callout' ? '💡 Ghi nhớ' : b.type === 'layout-formula' ? '🔤 KaTeX' : b.type === 'layout-split' ? '📰 2 Cột' : b.type === 'layout-grid' ? '🍱 Lưới' : b.type === 'layout-storyboard' ? '🎬 Storyboard' : '📖 Chữ'}
              </span>
            ))}
          </div>
        </div>

        {stageBlocks.length === 0 ? (
          <p className="mt-3 text-center text-xs font-bold text-muted py-4">Chặng này chưa có khối nội dung nào.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {stageBlocks.map((block) => {
              if (block.type === 'text' || block.type === 'layout-text') {
                return (
                  <div key={block.id} className="rounded-xl border border-current/15 bg-white/70 p-3">
                    {block.title && <h3 className="font-display text-base leading-snug">{block.title}</h3>}
                    <p className="mt-1 whitespace-pre-line text-sm font-semibold leading-relaxed text-text">
                      {block.body?.trim() || 'Nội dung đoạn văn bản sẽ hiển thị ở đây.'}
                    </p>
                    {block.tip && (
                      <p className="mt-2 rounded-xl border border-current/20 bg-white/90 px-3 py-1.5 text-xs font-bold text-brand-900">
                        💡 Ghi nhớ: {block.tip}
                      </p>
                    )}
                  </div>
                )
              }

              if (block.type === 'layout-callout') {
                return (
                  <div key={block.id} className="rounded-xl border-2 border-amber-300 bg-amber-50/90 p-3 text-amber-950">
                    <p className="text-[11px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1 mb-1">
                      💡 {block.title || 'Hộp Ghi Nhớ Nổi Bật'}
                    </p>
                    <p className="text-xs font-bold leading-relaxed">{block.tip || block.body || 'Bí kíp bỏ túi cho bé...'}</p>
                  </div>
                )
              }

              if (block.type === 'layout-formula') {
                return (
                  <div key={block.id} className="rounded-xl border border-brand-200 bg-brand-50/70 p-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-wider text-brand-800 mb-1">{block.title || 'Công Thức KaTeX'}</p>
                    <div className="font-mono text-xs font-black text-brand-950 py-1.5 px-2 bg-white rounded-lg border border-brand-200 shadow-2xs">
                      {block.formula || '$$\\text{Ý tưởng con} + \\text{Sức mạnh AI} = \\text{Tác phẩm độc nhất}$$'}
                    </div>
                  </div>
                )
              }

              if (block.type === 'layout-split') {
                return (
                  <div key={block.id} className="grid grid-cols-2 gap-2 rounded-xl border border-current/15 bg-white/70 p-2.5 items-center">
                    <div>
                      {block.title && <h4 className="font-display text-xs font-bold text-text">{block.title}</h4>}
                      <p className="text-[11px] font-semibold text-text mt-0.5">{block.body || 'Nội dung giải thích...'}</p>
                    </div>
                    <div className="overflow-hidden rounded-lg aspect-video bg-slate-100 border border-slate-200 grid place-items-center">
                      {block.imageUrl ? (
                        <img src={block.imageUrl} alt={block.imageAlt || 'Media'} className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      ) : (
                        <span className="text-[10px] font-bold text-muted">Ảnh / Media</span>
                      )}
                    </div>
                  </div>
                )
              }

              if (block.type === 'layout-grid') {
                const items = (block.visualItems && block.visualItems.length > 0) ? block.visualItems : card.visualItems
                return (
                  <div key={block.id} className="rounded-xl border border-current/15 bg-white/70 p-2.5">
                    {block.title && <h4 className="font-display text-xs font-black text-text mb-1.5">{block.title}</h4>}
                    <div className="grid grid-cols-3 gap-1.5">
                      {items.map((item, vIdx) => (
                        <div key={vIdx} className="rounded-lg border border-brand-200 bg-brand-50/70 p-1.5 text-center">
                          <p className="text-[10px] font-black text-brand-900 truncate">{item.label}</p>
                          <p className="text-[9px] font-semibold text-brand-800 line-clamp-2 mt-0.5">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }

              if (block.type === 'layout-storyboard') {
                const items = (block.visualItems && block.visualItems.length > 0) ? block.visualItems : card.visualItems
                return (
                  <div key={block.id} className="rounded-xl border border-current/15 bg-white/70 p-2.5">
                    {block.title && <h4 className="font-display text-xs font-black text-text mb-1.5">{block.title}</h4>}
                    <div className="grid grid-cols-3 gap-1.5">
                      {items.map((item, vIdx) => (
                        <div key={vIdx} className="rounded-lg border border-sky-200 bg-sky-50/70 p-1.5 text-center">
                          <span className="inline-block rounded bg-sky-200 px-1 text-[8px] font-black text-sky-900">Cảnh {vIdx + 1}</span>
                          <p className="text-[10px] font-black text-sky-950 truncate mt-0.5">{item.label}</p>
                          <p className="text-[9px] font-semibold text-sky-800 line-clamp-2">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }

              if (block.type === 'video') {
                return (
                  <div key={block.id} className="overflow-hidden rounded-xl border border-border">
                    {card.videoUrl ? (
                      <LectureVideo title={card.title} url={card.videoUrl} />
                    ) : (
                      <div className="aspect-video bg-slate-900 grid place-items-center text-white text-xs font-bold">
                        🎬 Video Bài Giảng (Chưa nhập URL)
                      </div>
                    )}
                  </div>
                )
              }

              if (block.type === 'versus-ab') {
                return (
                  <div key={block.id} className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-amber-200 bg-white p-2 text-center">
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-800">
                        {card.optionLabels?.[0] || 'Tranh A: Zico'}
                      </span>
                      {card.optionDescs?.[0] && (
                        <p className="mt-0.5 text-[9px] text-muted line-clamp-1">{card.optionDescs[0]}</p>
                      )}
                      {card.optionImages?.[0] ? (
                        <img src={card.optionImages[0]} alt="Tranh A" className="mt-1.5 aspect-video w-full rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      ) : (
                        <div className="mt-1.5 aspect-video rounded-lg bg-amber-50 grid place-items-center text-[10px] font-bold text-amber-700">🎨 Minh họa mặc định</div>
                      )}
                    </div>
                    <div className="rounded-xl border border-sky-200 bg-white p-2 text-center">
                      <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-black text-sky-800">
                        {card.optionLabels?.[1] || 'Tranh B: Sonet'}
                      </span>
                      {card.optionDescs?.[1] && (
                        <p className="mt-0.5 text-[9px] text-muted line-clamp-1">{card.optionDescs[1]}</p>
                      )}
                      {card.optionImages?.[1] ? (
                        <img src={card.optionImages[1]} alt="Tranh B" className="mt-1.5 aspect-video w-full rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      ) : (
                        <div className="mt-1.5 aspect-video rounded-lg bg-sky-50 grid place-items-center text-[10px] font-bold text-sky-700">🎨 Minh họa mặc định</div>
                      )}
                    </div>
                  </div>
                )
              }

              if (block.type === 'dialogue') {
                const lines = card.dialogueLines || []
                return (
                  <div key={block.id} className="space-y-2 rounded-xl border border-border/80 bg-white/80 p-2.5">
                    <p className="text-[10px] font-black uppercase text-brand-800">💬 Kịch bản Comic ({lines.length} câu)</p>
                    <div className="space-y-1.5">
                      {lines.map((line) => (
                        <div key={line.id} className="flex items-start gap-2 text-xs">
                          <span className="shrink-0 rounded-md bg-brand-100 px-1.5 py-0.5 font-black text-brand-800">
                            {line.speaker}
                          </span>
                          <p className="flex-1 rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-semibold text-text">
                            {line.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }

              if (block.type === 'compare') {
                return (
                  <div key={block.id} className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-2 text-center">
                      <span className="text-[10px] font-black text-slate-800">
                        🤖 {card.compareData?.leftTitle || 'Trợ lý AI'}
                      </span>
                      {card.compareData?.leftText && (
                        <p className="mt-0.5 text-[9px] text-muted line-clamp-2">{card.compareData.leftText}</p>
                      )}
                      {(card.compareData?.leftImage || card.compareImages?.left) ? (
                        <img src={card.compareData?.leftImage || card.compareImages?.left} alt="Cột trái" className="mt-1.5 aspect-video w-full rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      ) : (
                        <div className="mt-1.5 aspect-video rounded-lg bg-slate-100 grid place-items-center text-[10px] font-bold text-slate-600">📁 Đồ họa sẵn sàng</div>
                      )}
                    </div>
                    <div className="rounded-xl border border-brand-200 bg-white p-2 text-center">
                      <span className="text-[10px] font-black text-brand-800">
                        🧠 {card.compareData?.rightTitle || 'Não sáng tạo con'}
                      </span>
                      {card.compareData?.rightText && (
                        <p className="mt-0.5 text-[9px] text-brand-900 line-clamp-2">{card.compareData.rightText}</p>
                      )}
                      {(card.compareData?.rightImage || card.compareImages?.right) ? (
                        <img src={card.compareData?.rightImage || card.compareImages?.right} alt="Cột phải" className="mt-1.5 aspect-video w-full rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      ) : (
                        <div className="mt-1.5 aspect-video rounded-lg bg-brand-50 grid place-items-center text-[10px] font-bold text-brand-700">💡 Đồ họa sẵn sàng</div>
                      )}
                    </div>
                  </div>
                )
              }

              if (block.type === 'poster') {
                return (
                  <div key={block.id} className="rounded-xl border-2 border-yellow-300 bg-yellow-50/90 p-3 text-center">
                    <p className="text-[10px] font-black uppercase tracking-wider text-yellow-800">📜 Poster Quy Tắc Vàng</p>
                    <p className="mt-1 font-display text-sm font-black text-yellow-950 uppercase">{card.body || 'HÃY LUÔN TỰ TAY THÊM Ý TƯỞNG CỦA RIÊNG MÌNH!'}</p>
                    {card.tip && (
                      <p className="mt-1.5 text-xs font-bold text-yellow-900">💡 {card.tip}</p>
                    )}
                    {card.imageUrl && (
                      <img src={card.imageUrl} alt="Poster" className="mt-2 aspect-video w-full rounded-lg object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    )}
                  </div>
                )
              }

              if (block.type === 'images') {
                const heroImage = block.imageUrl || card.imageUrl
                const additionalImgs = block.additionalImages || card.additionalImages || []

                return (
                  <div key={block.id} className="space-y-3">
                    {/* Ảnh chính Hero Image to bản */}
                    {heroImage && (
                      <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-2 group/art">
                        <img
                          src={heroImage}
                          alt={block.imageAlt || card.imageAlt || block.title || card.title || 'Ảnh chính chặng'}
                          className="w-full max-h-[280px] object-contain rounded-xl mx-auto transition-transform duration-300 group-hover/art:scale-101"
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => setZoomedImage({
                            url: heroImage,
                            title: block.title || card.title || `Ảnh chính Chặng ${stageIndex + 1}`,
                          })}
                          className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur-xs transition hover:bg-black/90 cursor-pointer shadow-xs"
                          title="Phóng to xem ảnh"
                        >
                          <ZoomIn size={12} />
                          <span>🔍 Xem to</span>
                        </button>
                      </div>
                    )}

                    {/* Danh sách ảnh minh họa bổ sung */}
                    {additionalImgs.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase text-brand-800">
                          📷 Ảnh minh họa bổ sung ({additionalImgs.length}):
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {additionalImgs.map((imgItem, imgIdx) => (
                            <div key={imgItem.id || imgIdx} className="group relative overflow-hidden rounded-xl border border-emerald-100 bg-white/95 p-1 text-center shadow-2xs">
                              {imgItem.url ? (
                                <>
                                  <img
                                    src={imgItem.url}
                                    alt={imgItem.alt || 'Ảnh'}
                                    className="aspect-video w-full rounded-lg object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setZoomedImage({
                                      url: imgItem.url,
                                      title: imgItem.caption || `Ảnh minh họa #${imgIdx + 1}`,
                                    })}
                                    className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                  >
                                    <ZoomIn size={10} />
                                  </button>
                                </>
                              ) : (
                                <div className="aspect-video rounded-lg bg-slate-100 grid place-items-center text-[10px] text-muted">Chưa có ảnh</div>
                              )}
                              {imgItem.caption && (
                                <p className="mt-1 text-[9px] font-bold text-text truncate">{imgItem.caption}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!heroImage && additionalImgs.length === 0 && (
                      <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 p-3 text-center text-xs font-bold text-emerald-800">
                        Chưa có ảnh minh họa nào.
                      </div>
                    )}
                  </div>
                )
              }

              if (block.type === 'voice') {
                return (
                  <div key={block.id} className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-3">
                    <AikidCatCharacter
                      pose={card.mee?.gesture === 'think' ? 'thinking' : card.mee?.gesture === 'celebrate' ? 'celebrate' : 'guide'}
                      gesture={card.mee?.gesture ?? 'presentation'}
                      isSpeaking={false}
                      animated={true}
                      className="h-14 w-14 shrink-0 object-contain"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-extrabold uppercase text-sky-800">Mèo AIKI nói:</p>
                      <p className="mt-0.5 line-clamp-3 text-xs font-semibold text-sky-950 italic">
                        "{card.mee?.readText?.trim() || card.body?.trim() || 'Chào các bạn nhỏ!'}"
                      </p>
                    </div>
                  </div>
                )
              }

              return null
            })}
          </div>
        )}
      </article>

      {/* Modal phóng to ảnh */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-h-[85vh] max-w-2xl w-full rounded-2xl bg-white p-4 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <span className="text-xs font-black text-text truncate">{zoomedImage.title || 'Xem ảnh phóng to'}</span>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="grid size-7 place-items-center rounded-lg hover:bg-slate-100 text-muted hover:text-text cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={zoomedImage.url}
                alt={zoomedImage.title || 'Ảnh phóng to'}
                className="max-h-[68vh] w-auto object-contain rounded-xl shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

function practiceKindLabel(kind: string) {
  return PRACTICE_OPTIONS.find((option) => option.id === kind)?.label ?? 'Kiểu thực hành cũ'
}

function PracticeKindPreview({ draft, compact = false }: { draft: LectureDraft; compact?: boolean }) {
  const orderingCards = goalLines(draft.practiceConfigText).map((line, index) => {
    const [title, ...description] = line.split('|')
    return { title: title?.trim() || `Bước ${index + 1}`, description: description.join('|').trim() }
  })
  const shell = 'rounded-2xl border-2 border-mint-200 bg-white p-4 shadow-sm'
  const input = 'min-h-11 w-full rounded-xl border-2 border-border bg-page px-3 text-sm font-semibold text-muted'

  return (
    <section className="rounded-3xl border-2 border-mint-200 bg-mint-50 p-4" aria-label={`Xem trước kiểu thực hành ${practiceKindLabel(draft.practiceKind)}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-mint-700">Học sinh sẽ thao tác</p>
          <h4 className="mt-1 font-display text-lg text-text">{practiceKindLabel(draft.practiceKind)}</h4>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-mint-800">Preview trực tiếp</span>
      </div>

      {draft.practiceKind === 'intro' && <div className={shell}>
        <p className="font-extrabold text-text">Nhiệm vụ làm quen</p>
        <p className="mt-2 text-sm font-semibold text-muted">{draft.practiceInstruction || 'Đọc nhiệm vụ ngắn và xác nhận con đã sẵn sàng.'}</p>
        <button type="button" disabled className="mt-4 min-h-11 rounded-xl bg-brand-600 px-5 font-extrabold text-white">Con đã sẵn sàng</button>
      </div>}

      {(draft.practiceKind === 'journal' || draft.practiceKind === 'reflect') && <div className={shell}>
        <p className="font-extrabold text-text">{draft.practiceKind === 'reflect' ? 'Con tự nhìn lại sản phẩm' : 'Sổ tay thực hành của con'}</p>
        <p className="mt-1 text-sm font-semibold text-muted">{draft.reflectionPrompt || 'Con quan sát được gì và vì sao con nghĩ như vậy?'}</p>
        <textarea readOnly className={`${input} mt-3 min-h-28 p-3`} placeholder="Con viết câu trả lời tại đây…" />
      </div>}

      {draft.practiceKind === 'sketch' && <div className={shell}>
        <p className="font-extrabold text-text">Bảng phác thảo</p>
        <div className="mt-3 grid min-h-40 place-items-center rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 text-center">
          <div><span className="text-4xl" aria-hidden="true">✏️</span><p className="mt-2 text-sm font-bold text-brand-700">Vẽ bằng bút, tẩy và chọn màu</p></div>
        </div>
      </div>}

      {draft.practiceKind === 'character' && <div className={shell}>
        <p className="font-extrabold text-text">Xưởng tạo nhân vật</p>
        <div className="mt-3 flex flex-wrap gap-2">{['🐱 Mèo', '🤖 Robot', '🦊 Cáo'].map((item) => <span key={item} className="rounded-xl border-2 border-brand-200 bg-brand-50 px-3 py-2 text-sm font-bold">{item}</span>)}</div>
        <div className="mt-2 flex flex-wrap gap-2">{['Tò mò', 'Can đảm', 'Vui tính'].map((item) => <span key={item} className="rounded-full bg-sun-100 px-3 py-1 text-xs font-bold">{item}</span>)}</div>
        <input readOnly className={`${input} mt-3`} placeholder="Biệt danh an toàn của nhân vật" />
      </div>}

      {draft.practiceKind === 'style' && <div className={shell}>
        <p className="font-extrabold text-text">So sánh và chọn phong cách</p>
        <div className="mt-3 grid grid-cols-3 gap-2">{['🖍️ Màu sáp', '🎨 Cắt giấy', '✒️ Nét mực'].map((item, index) => <div key={item} className={`rounded-xl border-2 p-3 text-center text-xs font-bold ${index === 0 ? 'border-brand-500 bg-brand-50' : 'border-border'}`}>{item}</div>)}</div>
      </div>}

      {draft.practiceKind === 'ai_pick' && <div className={shell}>
        <p className="font-extrabold text-text">Mô tả ý tưởng và chọn tham chiếu an toàn</p>
        <textarea readOnly className={`${input} mt-3 min-h-24 p-3`} placeholder="Con muốn tạo điều gì? Chi tiết quan trọng là gì?" />
        <div className="mt-3 grid grid-cols-3 gap-2">{['🖼️ Tư liệu 1', '🌈 Tư liệu 2', '🧩 Tư liệu 3'].map((item) => <div key={item} className="rounded-xl border-2 border-border bg-page p-3 text-center text-xs font-bold">{item}</div>)}</div>
      </div>}

      {draft.practiceKind === 'story' && <div className={shell}>
        <p className="font-extrabold text-text">Chọn ba nhịp của câu chuyện</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">{[['1', 'Mở đầu'], ['2', 'Sự cố'], ['3', 'Kết thúc']].map(([number, label]) => <div key={number} className="rounded-xl border-2 border-brand-200 bg-brand-50 p-3"><span className="text-xs font-extrabold text-brand-600">NHỊP {number}</span><p className="mt-1 text-sm font-bold">{label}</p><span className="mt-2 block rounded-lg bg-white px-2 py-2 text-xs text-muted">Chọn một thẻ…</span></div>)}</div>
      </div>}

      {draft.practiceKind === 'video' && <div className={shell}>
        <p className="font-extrabold text-text">Kế hoạch cảnh video</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">{['🎬 Cảnh mở', '🏃 Chuyển động', '✨ Cảnh kết'].map((item, index) => <div key={item} className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 text-sm font-bold"><span className="block text-xs text-sky-700">CẢNH {index + 1}</span>{item}<span className="mt-2 block text-xs font-semibold text-muted">Mô tả hành động…</span></div>)}</div>
      </div>}

      {draft.practiceKind === 'palette' && <div className={shell}>
        <p className="font-extrabold text-text">Chọn ba màu và giải thích thông điệp</p>
        <div className="mt-3 flex gap-3">{['#6d5dfc', '#ff7a90', '#43d6b3'].map((color) => <span key={color} className="size-12 rounded-2xl border-4 border-white shadow-sm" style={{ backgroundColor: color }} />)}</div>
        <textarea readOnly className={`${input} mt-3 min-h-20 p-3`} placeholder="Vì sao các màu này phù hợp với sản phẩm?" />
      </div>}

      {draft.practiceKind === 'ordering' && <div className={shell}>
        <p className="font-extrabold text-text">Kéo thả để sắp xếp đúng trình tự</p>
        <div className="mt-3 grid gap-2">{(orderingCards.length ? orderingCards : [{ title: 'Thẻ 1', description: 'Nhập ít nhất ba thẻ ở phần cấu hình.' }, { title: 'Thẻ 2', description: 'Các thẻ sẽ được đảo khi học sinh bắt đầu.' }, { title: 'Thẻ 3', description: 'Học sinh kéo thả về đúng thứ tự.' }]).slice(0, compact ? 3 : 6).map((card, index) => <div key={`${card.title}-${index}`} className="flex items-center gap-3 rounded-xl border-2 border-border bg-page px-3 py-2"><span className="text-lg text-muted">⠿</span><span className="grid size-7 place-items-center rounded-lg bg-brand-100 text-xs font-extrabold text-brand-700">{index + 1}</span><div><p className="text-sm font-extrabold">{card.title}</p>{card.description && <p className="text-xs font-semibold text-muted">{card.description}</p>}</div></div>)}</div>
      </div>}
    </section>
  )
}

function FullStationPreview({ draft, gameConfig }: { draft: LectureDraft; gameConfig: CurriculumGameConfig }) {
  const isAiki = detectLessonFormat(draft.learnCards) === 'aiki-rule-5steps' || isAikiRuleLesson(draft.learnCards)
  const [activeAikiStage, setActiveAikiStage] = useState<number>(0)
  const [previewSection, setPreviewSection] = useState<Section>('basics')
  const goals = goalLines(draft.goalsText)
  const steps = goalLines(draft.practiceStepsText)
  const criteria = goalLines(draft.successCriteriaText)

  if (isAiki) {
    const defaultCards = createAikiRuleLearnCards()
    const card = draft.learnCards[activeAikiStage] ?? defaultCards[activeAikiStage]
    const stageIcons = ['🎬', '🖼️', '📜', '⚖️', '🏆']
    return (
      <div className="text-left">
        {/* Navigation 5 chặng AIKI */}
        <nav className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-brand-200 bg-brand-50/70 p-2" aria-label="Chọn chặng AIKI muốn xem trước">
          {AIKI_STAGE_NAMES.map((name, index) => {
            const isSelected = activeAikiStage === index
            return (
              <button
                key={name}
                type="button"
                onClick={() => setActiveAikiStage(index)}
                aria-current={isSelected ? 'page' : undefined}
                className={cn(
                  'flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-black transition cursor-pointer',
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-brand-900 bg-white/80 hover:bg-white border border-brand-200/60'
                )}
              >
                <span>{stageIcons[index]}</span>
                <span>{name}</span>
              </button>
            )
          })}
        </nav>

        {/* Nội dung xem trước chặng học sinh */}
        <div className="station-preview-scroll overflow-y-auto pr-1">
          {card && <StudentStagePreview card={card} stageIndex={activeAikiStage} />}

          {/* Điều hướng chuyển chặng */}
          <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3">
            <button
              type="button"
              disabled={activeAikiStage === 0}
              onClick={() => setActiveAikiStage((prev) => Math.max(0, prev - 1))}
              className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              ← Chặng trước
            </button>
            <span className="text-xs font-black text-brand-800">
              Chặng {activeAikiStage + 1} / 5
            </span>
            <button
              type="button"
              disabled={activeAikiStage === 4}
              onClick={() => setActiveAikiStage((prev) => Math.min(4, prev + 1))}
              className="rounded-xl bg-brand-600 text-white px-3.5 py-1.5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-700 cursor-pointer shadow-xs"
            >
              Chặng tiếp theo →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-left">
      <nav className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-white p-2" aria-label="Chọn phần muốn xem trước">
        {STANDARD_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setPreviewSection(section.id)}
            aria-current={previewSection === section.id ? 'page' : undefined}
            className={cn(
              'flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus',
              previewSection === section.id ? 'bg-brand-600 text-white shadow-press' : 'text-muted hover:bg-brand-50 hover:text-brand-700',
            )}
          >
            {section.icon}{section.label}
          </button>
        ))}
      </nav>

      <div className="station-preview-scroll grid gap-4 overflow-y-auto pr-1">
      {previewSection === 'basics' && <section className="rounded-3xl border-2 border-brand-200 bg-brand-50 p-5 text-center">
        <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Câu hỏi mở trạm</p>
        <h3 className="mt-2 font-display text-2xl text-brand-900">{draft.hook.trim() || 'Chưa có câu hỏi khởi động'}</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {(goals.length ? goals : ['Chưa có mục tiêu học tập']).map((goal, index) => (
            <div key={`${index}-${goal}`} className="rounded-2xl bg-white px-3 py-3 text-sm font-bold text-text shadow-sm">
              <span className="mr-2 text-coral-600">{index + 1}.</span>{goal}
            </div>
          ))}
        </div>
      </section>}

      {previewSection === 'content' && <StudentLearnPreview draft={draft} />}

      {previewSection === 'game' && (
        <div className="ui-card p-5">
          <div className="mb-4">
            <div className="companion-bubble" style={{ maxWidth: 'none', width: '100%' }}>
              <p className="text-sm font-bold">{draft.gameInstruction || 'Chơi một lượt để ghi nhớ ý chính của bài!'}</p>
            </div>
          </div>
          <CurriculumGame
            gameType={draft.gameType}
            gameConfig={gameConfig}
            instruction={draft.gameInstruction}
            outcome={draft.gameOutcome}
            onComplete={() => undefined}
          />
          <p className="mt-4 rounded-xl bg-sun-50 px-3 py-3 text-center text-xs font-semibold text-sun-900">Chế độ xem trước: giáo viên có thể chơi thử, nhưng kết quả không được ghi vào tiến độ học sinh.</p>
        </div>
      )}

      {previewSection === 'practice' && <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,.85fr)]">
        <div className="grid gap-4">
        <section className="rounded-3xl border-2 border-mint-200 bg-mint-50 p-5">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-mint-700"><Palette size={16} /> Tự tay làm</p>
          <h3 className="mt-2 font-display text-xl text-text">{draft.product || 'Chưa đặt tên sản phẩm'}</h3>
          <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-relaxed text-text">{draft.practiceInstruction || 'Chưa có hướng dẫn thực hành.'}</p>
          {steps.length > 0 && <ol className="mt-3 grid gap-2">{steps.map((step, index) => <li key={step} className="rounded-xl bg-white px-3 py-2 text-xs font-bold"><span className="mr-2 text-mint-700">{index + 1}.</span>{step}</li>)}</ol>}
          {criteria.length > 0 && <div className="mt-3 rounded-xl border border-mint-200 bg-white p-3 text-xs font-semibold"><strong>Con tự kiểm tra:</strong> {criteria.join(' · ')}</div>}
        </section>
        <PracticeKindPreview draft={draft} />
        </div>
        <aside className="rounded-3xl border-2 border-border bg-white p-5">
          <p className="text-xs font-extrabold uppercase tracking-wide text-muted">Sau khi làm xong</p>
          <p className="mt-3 text-sm font-bold leading-relaxed text-text">Câu hỏi nhìn lại: {draft.reflectionPrompt || 'Chưa có câu hỏi giúp học sinh tự nhìn lại sản phẩm.'}</p>
          <p className="mt-3 rounded-xl bg-sun-50 px-3 py-3 text-xs font-semibold text-sun-900">Sản phẩm được lưu riêng tư và chỉ chia sẻ khi có luồng duyệt phù hợp.</p>
        </aside>
      </div>}

      {previewSection === 'check' && <section className="rounded-3xl border-2 border-coral-200 bg-coral-50 p-5">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-coral-700"><HelpCircle size={16} /> Thử thách cuối trạm</p>
        <p className="mt-2 text-sm font-bold text-text">{draft.checkQuestions.length || (draft.checkQuestion ? 1 : 0)} câu hỏi kiểm tra · Học sinh cần hoàn thành trước khi nhận thưởng.</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {(draft.checkQuestions.length ? draft.checkQuestions : draft.checkQuestion ? [{ prompt: draft.checkQuestion, options: [draft.checkOption1, draft.checkOption2, draft.checkOption3].filter(Boolean), answer: Number(draft.correctIndex), explain: draft.checkExplain }] : []).map((question, index) => (
            <article key={`${index}-${question.prompt}`} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="font-extrabold text-text">{index + 1}. {question.prompt}</p>
              <div className="mt-3 grid gap-2">{question.options.map((option, optionIndex) => <div key={`${optionIndex}-${option}`} className="rounded-xl border border-border px-3 py-2 text-sm font-semibold">{String.fromCharCode(65 + optionIndex)}. {option}</div>)}</div>
              {question.explain && <p className="mt-3 text-xs font-semibold text-muted">Phản hồi sau khi trả lời: {question.explain}</p>}
            </article>
          ))}
        </div>
      </section>}
      </div>
    </div>
  )
}

function emptyDraft(): LectureDraft {
  return {
    id: '', title: '', skill: '', hook: '',
    practiceKind: 'journal', videoUrl: '',
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
  const hasIslandContract = (lecture as any)?.lessonFormat === 'aiki-island-6steps' || Boolean((lecture as any)?.metadata?.sixStageJourney) || Boolean(lecture?.sixStageJourney)
  const isAikiRule = !hasIslandContract && ((lecture as any)?.lessonFormat === 'aiki-rule-5steps' || (lecture?.learnCards ? isAikiRuleLesson(lecture.learnCards) : false))
  const isIslandCourse = !isAikiRule && Boolean(
    courseId.startsWith('dao-') ||
    (lecture as any)?.lessonFormat === 'aiki-island-6steps' ||
    (lecture as any)?.metadata?.sixStageJourney ||
    lecture?.sixStageJourney ||
    (/^bai-\d+-\d+/i.test(lecture?.id || '') && (lecture as any)?.lessonFormat !== 'standard')
  )
  const initialDraftRef = useRef(normalizeLectureDraft(lecture ?? emptyDraft(), courseId))
  const [draft, setDraft] = useState<LectureDraft>(() => initialDraftRef.current)
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
    return detectLessonFormat(initialDraftRef.current.learnCards, explicit, isIslandCourse)
  })

  const updateSixStage = useCallback((updater: (prev: LessonSixStageJourney) => LessonSixStageJourney) => {
    setDraft((d) => {
      const current = d.sixStageJourney || resolveIslandSixStageJourney(d as any)
      const next = updater(current)
      return {
        ...d,
        sixStageJourney: next,
        metadata: {
          ...d.metadata,
          sixStageJourney: next,
        },
        title: next.stage1_goal.title || d.title,
        goalsText: next.stage1_goal.keyPoints?.length ? next.stage1_goal.keyPoints.join('\n') : d.goalsText,
        videoUrl: next.stage3_video.videoUrl || d.videoUrl,
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

  const [confirmClose, setConfirmClose] = useState(false)
  const [showFullPreview, setShowFullPreview] = useState(false)
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
      window.sessionStorage.setItem(draftStorageKey, JSON.stringify({ savedAt: new Date().toISOString(), draft }))
    }, 600)
    return () => window.clearTimeout(timer)
  }, [draft, dirty, draftStorageKey, readOnly, recovery])

  useEffect(() => {
    if ((isIslandCourse || lessonFormat === 'aiki-island-6steps' || lessonFormat === 'aiki-rule-5steps') && (activeSection === 'content' || activeSection === 'game' || activeSection === 'practice' || activeSection === 'check')) {
      setActiveSection('stage-0')
    }
  }, [isIslandCourse, lessonFormat, activeSection])

  useEffect(() => {
    if (lessonFormat === 'standard' && activeSection.startsWith('stage-')) {
      setActiveSection('content')
    }
  }, [lessonFormat, activeSection])

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

  const updateLearnCard = useCallback((index: number, patch: Partial<LearnCardDraft>) => {
    if (readOnly) return
    setDraft((previous) => {
      let cards = previous.learnCards
      if (cards.length <= index) {
        const defaults = createAikiRuleLearnCards()
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
          keyPoints: keysBlock?.visualItems?.slice(0, 4).map((item) => `${item.label}: ${item.text}`) ?? [],
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

    // 1. Nếu là Game Engine
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

    if (blockId === 'text' || blockId === 'layout-text') {
      newBlock = {
        id: `blk-text-${timestamp}`,
        type: 'text',
        title: `Đoạn văn bản ${stageBlocks.length + 1}`,
        body: '',
      }
      showToast('Đã thêm khối Đoạn văn bản mới!', 'success')
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
    } else if (blockId === 'layout-four-keys') {
      newBlock = createFourKeysBlock(`blk-four-keys-${timestamp}`)
      showToast('Đã thêm template Bốn chiếc chìa khóa!', 'success')
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
  }, [activeSection, draft.learnCards, lessonFormat, readOnly, showToast, updateLearnCard, updateStageBlocks])

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
        stageBlockEditorVersion: 2,
        stageContentBlocks: Object.fromEntries(
          draft.learnCards.slice(0, 6).map((card, index) => [`stage-${index}`, card.contentBlocks ?? []])
        ),
      } : undefined
      const payload = {
        courseId,
        id: draft.id,
        title: draft.title,
        skill: draft.skill,
        hook: draft.hook,
        goals: draft.goalsText.split('\n').map((s) => s.trim()).filter(Boolean),
        concept: draft.concept,
        example: draft.example,
        learnCards: serializeLearnCardsForHub(draft.learnCards),
        videoUrl: draft.videoUrl || null,
        reward: draft.reward,
        duration: draft.duration,
        practiceKind: draft.practiceKind,
        lessonFormat: isIslandCourse ? 'aiki-island-6steps' : lessonFormat,
        sixStageJourney: finalJourney,
        metadata: {
          ...(draft as any).metadata,
          sixStageJourney: finalJourney,
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
    width: '100%', maxWidth: '700px',
    background: '#f8fafc',
    borderLeft: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '-20px 0 60px rgba(15,23,42,0.15)',
  }

  const body = (
    <>
      <div style={containerStyle}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#fff',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }}>
                {readOnly ? 'Xem trạm học' : isEdit ? 'Chỉnh sửa trạm học' : 'Tạo trạm học mới'}
              </div>
              {readOnly && (
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.375rem', padding: '0.125rem 0.5rem' }}>
                  Chỉ xem
                </span>
              )}
              {!readOnly && isEdit && archived && (
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#ea580c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.375rem', padding: '0.125rem 0.5rem' }}>
                  Đang ẩn
                </span>
              )}
            </div>
            {draft.title && (
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>
                {draft.title}
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-muted">Cấu trúc trạm học:</span>
              <select
                disabled={readOnly || isIslandCourse}
                value={lessonFormat}
                onChange={(e) => {
                  const format = e.target.value as LessonFormat
                  setLessonFormat(format)
                  if (format === 'aiki-rule-5steps') {
                    if (!isAikiRuleLesson(draft.learnCards)) {
                      setDraft((d) => ({ ...d, lessonFormat: format, learnCards: createAikiRuleLearnCards() }))
                    } else {
                      setDraft((d) => ({ ...d, lessonFormat: format }))
                    }
                    setActiveSection('stage-0')
                  } else {
                    setDraft((d) => ({ ...d, lessonFormat: format }))
                    setActiveSection('content')
                  }
                }}
                className="rounded-xl border-2 border-brand-200 bg-brand-50/70 px-3 py-1 text-xs font-black text-brand-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {isIslandCourse ? (
                  <option value="aiki-island-6steps">Khóa học · 6 chặng Mục tiêu → Hoàn thành</option>
                ) : (
                  <>
                    <option value="aiki-rule-5steps">Quy tắc AIKI · 5 bước riêng</option>
                    <option value="standard">Khám phá tiêu chuẩn</option>
                  </>
                )}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowFullPreview(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-extrabold text-brand-700 hover:bg-brand-100"
            >
              <Eye size={14} /> Xem toàn bộ
            </button>
            {/* Progress indicator — chỉ có nghĩa khi edit/create, ẩn khi chỉ xem */}
            {!readOnly && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#64748b' }}>
                <span style={{ color: readiness.complete ? '#10b981' : '#f97316', fontWeight: 700 }}>
                  {readiness.completed}/{readiness.total}
                </span>
                <span>bước</span>
              </div>
            )}
            {/* WHY: Ẩn archive buttons hoàn toàn khi readOnly=true — tránh 403. */}
            {!readOnly && isEdit && (
              archived ? (
                <button
                  type="button"
                  onClick={onRestore}
                  style={{ padding: '0.375rem 0.75rem', border: '1px solid #6ee7b7', background: '#ecfdf5', borderRadius: '0.5rem', color: '#059669', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  ↩ Khôi phục
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onArchive}
                  style={{ padding: '0.375rem 0.75rem', border: '1px solid #fca5a5', background: '#fff1f2', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  🗃 Ẩn bài
                </button>
              )
            )}
            <button
              type="button"
              id={`${uid}-drawer-close`}
              onClick={requestClose}
              style={{ padding: '0.5rem', border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0.5rem', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Section tabs */}
        <div style={{
          display: 'flex', overflowX: 'auto', padding: '0 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#fff',
          flexShrink: 0,
          scrollbarWidth: 'none',
        }}>
          {(isIslandCourse ? ISLAND_6_STAGE_SECTIONS : (lessonFormat === 'aiki-rule-5steps' ? AIKI_SECTIONS : STANDARD_SECTIONS)).map((section) => {
            const isActive = activeSection === section.id
            const complete = sectionStatus(section.id)
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.75rem 1rem', border: 'none', background: 'transparent',
                  color: isActive ? '#6366f1' : '#64748b',
                  fontSize: '0.875rem', fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {complete
                  ? <CheckCircle2 size={13} color="#10b981" />
                  : <Circle size={13} color={isActive ? '#6366f1' : '#cbd5e1'} />
                }
                {section.label}
                {!complete && sectionMissing(section.id).length > 0 && (
                  <span className="grid min-w-5 place-items-center rounded-full bg-sun-100 px-1 text-[10px] font-extrabold text-warning">{sectionMissing(section.id).length}</span>
                )}
              </button>
            )
          })}
        </div>

        {recovery && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sun-200 bg-sun-50 px-6 py-3 text-sm">
            <div><strong className="text-sun-900">Có bản nháp chưa lưu</strong><span className="ml-2 text-muted">lúc {new Date(recovery.savedAt).toLocaleString('vi-VN')}</span></div>
            <div className="flex gap-2">
              <button type="button" className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-bold" onClick={() => { window.sessionStorage.removeItem(draftStorageKey); setRecovery(null) }}>Bỏ bản nháp</button>
              <button type="button" className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-extrabold text-white" onClick={() => { setDraft(recovery.draft); setRecovery(null); showToast('Đã khôi phục nội dung đang soạn', 'success') }}>Khôi phục</button>
            </div>
          </div>
        )}

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
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,.85fr)]">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-3 text-sm font-semibold leading-relaxed text-sky-900">
                <strong>Thông tin trạm định hướng toàn bộ bài học.</strong> Câu hỏi khởi động, mục tiêu, game, thực hành và thử thách phải cùng kiểm tra một nội dung.
              </div>
              <FormRow label="Tên trạm học *">
                <input
                  type="text" id={`${uid}-title`}
                  value={draft.title}
                  readOnly={readOnly}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="VD: AI học từ dữ liệu như thế nào?"
                  style={inputStyle}
                />
              </FormRow>
              <FormRow label="Đường dẫn (slug) *" hint="Tự động từ tên, có thể chỉnh">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>/</span>
                  <input
                    type="text" id={`${uid}-slug`}
                    value={draft.id}
                    readOnly={readOnly}
                    onChange={(e) => set('id', e.target.value)}
                    placeholder="ten-bai-hoc"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
                {draft.id && !/^[a-z0-9-]{3,64}$/.test(draft.id) && (
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
              <FormRow label="Câu hỏi khởi động *" hint="Hook kích thích tò mò">
                <textarea
                  value={draft.hook}
                  readOnly={readOnly}
                  onChange={(e) => set('hook', e.target.value)}
                  placeholder="VD: Làm thế nào một cỗ máy có thể nhận ra khuôn mặt bạn?"
                  rows={3} style={textareaStyle}
                />
              </FormRow>
              <FormRow label="Hôm nay con sẽ đạt được gì? *" hint="Mỗi mục tiêu 1 dòng">
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
                <FormRow label="Phần thưởng">
                  <input type="text" readOnly={readOnly} value={draft.reward} onChange={(e) => set('reward', e.target.value)} placeholder="VD: Huy hiệu Nhà Khoa Học" style={inputStyle} />
                </FormRow>
              </div>
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
              </div>
              <StudentBasicsPreview draft={draft} />
            </div>
          )}

          {/* ── ĐẢO AIKIDS 6 CHẶNG SƯ PHẠM ── */}
          {isIslandCourse && activeSection.startsWith('stage-') && (() => {
            const stageIndex = parseInt(activeSection.replace('stage-', ''), 10)
            const currentJourney = draft.sixStageJourney || resolveIslandSixStageJourney(draft as any)
            const islandCard = draft.learnCards[stageIndex]
            const islandBlocks = islandCard ? getStageBlocks(islandCard, stageIndex) : []

            return (
              <div className={cn('grid items-start gap-5', stageIndex === 0 ? 'grid-cols-1' : 'lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,.95fr)]')}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                          <label className="block text-xs font-black uppercase text-slate-700">Lời chào & Thuyết minh của Mèo AKI</label>
                          <button
                            type="button"
                            onClick={() => previewAikiVoice(0, currentJourney.stage1_goal.speech)}
                            className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
                          >
                            <Volume2 size={13} />
                            <span>Nghe thử giọng AKI</span>
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

                  {stageIndex === 1 && (
                    <div className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-xs">
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700">Câu hỏi câu đố xác nhận</label>
                        <textarea
                          rows={2}
                          value={currentJourney.stage2_confirmGoal.question}
                          onChange={(e) => {
                            const val = e.target.value
                            updateSixStage((j) => ({ ...j, stage2_confirmGoal: { ...j.stage2_confirmGoal, question: val } }))
                          }}
                          placeholder="Nhập câu đố để bé chọn A hay B..."
                          className="mt-1.5 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-black uppercase text-slate-700">Lời dẫn của Mèo AKI</label>
                          <button
                            type="button"
                            onClick={() => previewAikiVoice(1, currentJourney.stage2_confirmGoal.speech)}
                            className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
                          >
                            <Volume2 size={13} />
                            <span>Nghe thử giọng AKI</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={currentJourney.stage2_confirmGoal.speech}
                          onChange={(e) => {
                            const val = e.target.value
                            updateSixStage((j) => ({ ...j, stage2_confirmGoal: { ...j.stage2_confirmGoal, speech: val } }))
                          }}
                          className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text italic"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={cn(
                          "rounded-xl border-2 p-3.5 space-y-2.5",
                          currentJourney.stage2_confirmGoal.correctIndex === 0 ? "border-emerald-400 bg-emerald-50/40" : "border-border bg-page"
                        )}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800 uppercase">🅰️ Phương án A</span>
                            <label className="flex items-center gap-1 text-xs font-bold text-emerald-700 cursor-pointer">
                              <input
                                type="radio"
                                name="confirmCorrect"
                                checked={currentJourney.stage2_confirmGoal.correctIndex === 0}
                                onChange={() => {
                                  updateSixStage((j) => ({ ...j, stage2_confirmGoal: { ...j.stage2_confirmGoal, correctIndex: 0 } }))
                                }}
                              />
                              <span>Đáp án đúng</span>
                            </label>
                          </div>
                          <input
                            type="text"
                            value={currentJourney.stage2_confirmGoal.options[0]?.text || ''}
                            onChange={(e) => {
                              const val = e.target.value
                              updateSixStage((j) => {
                                const opts = [...j.stage2_confirmGoal.options]
                                opts[0] = { ...opts[0], text: val }
                                return { ...j, stage2_confirmGoal: { ...j.stage2_confirmGoal, options: opts } }
                              })
                            }}
                            placeholder="Nội dung phương án A..."
                            className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-text"
                          />
                          <input
                            type="text"
                            value={currentJourney.stage2_confirmGoal.options[0]?.imageUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value
                              updateSixStage((j) => {
                                const opts = [...j.stage2_confirmGoal.options]
                                opts[0] = { ...opts[0], imageUrl: val }
                                return { ...j, stage2_confirmGoal: { ...j.stage2_confirmGoal, options: opts } }
                              })
                            }}
                            placeholder="URL ảnh phương án A..."
                            className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-text"
                          />
                        </div>

                        <div className={cn(
                          "rounded-xl border-2 p-3.5 space-y-2.5",
                          currentJourney.stage2_confirmGoal.correctIndex === 1 ? "border-emerald-400 bg-emerald-50/40" : "border-border bg-page"
                        )}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800 uppercase">🅱️ Phương án B</span>
                            <label className="flex items-center gap-1 text-xs font-bold text-emerald-700 cursor-pointer">
                              <input
                                type="radio"
                                name="confirmCorrect"
                                checked={currentJourney.stage2_confirmGoal.correctIndex === 1}
                                onChange={() => {
                                  updateSixStage((j) => ({ ...j, stage2_confirmGoal: { ...j.stage2_confirmGoal, correctIndex: 1 } }))
                                }}
                              />
                              <span>Đáp án đúng</span>
                            </label>
                          </div>
                          <input
                            type="text"
                            value={currentJourney.stage2_confirmGoal.options[1]?.text || ''}
                            onChange={(e) => {
                              const val = e.target.value
                              updateSixStage((j) => {
                                const opts = [...j.stage2_confirmGoal.options]
                                opts[1] = { ...opts[1], text: val }
                                return { ...j, stage2_confirmGoal: { ...j.stage2_confirmGoal, options: opts } }
                              })
                            }}
                            placeholder="Nội dung phương án B..."
                            className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-text"
                          />
                          <input
                            type="text"
                            value={currentJourney.stage2_confirmGoal.options[1]?.imageUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value
                              updateSixStage((j) => {
                                const opts = [...j.stage2_confirmGoal.options]
                                opts[1] = { ...opts[1], imageUrl: val }
                                return { ...j, stage2_confirmGoal: { ...j.stage2_confirmGoal, options: opts } }
                              })
                            }}
                            placeholder="URL ảnh phương án B..."
                            className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-text"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700">Lời giải thích khi trả lời</label>
                        <textarea
                          rows={2}
                          value={currentJourney.stage2_confirmGoal.explanation}
                          onChange={(e) => {
                            const val = e.target.value
                            updateSixStage((j) => ({ ...j, stage2_confirmGoal: { ...j.stage2_confirmGoal, explanation: val } }))
                          }}
                          placeholder="Giải thích vì sao đáp án đó chính xác..."
                          className="mt-1.5 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text"
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
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700">Tên chủ thể tranh (Subject Name)</label>
                          <input
                            type="text"
                            value={currentJourney.stage5_practice.subjectName}
                            onChange={(e) => {
                              const val = e.target.value
                              updateSixStage((j) => ({ ...j, stage5_practice: { ...j.stage5_practice, subjectName: val } }))
                            }}
                            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-bold text-text"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black uppercase text-slate-700">Huy hiệu bài (Badge)</label>
                          <input
                            type="text"
                            value={currentJourney.stage5_practice.badge}
                            onChange={(e) => {
                              const val = e.target.value
                              updateSixStage((j) => ({ ...j, stage5_practice: { ...j.stage5_practice, badge: val } }))
                            }}
                            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-black uppercase text-slate-700">Khẩu hiệu / Thần chú của AKI (Motto)</label>
                          <button
                            type="button"
                            onClick={() => previewAikiVoice(4, currentJourney.stage5_practice.akiMotto)}
                            className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
                          >
                            <Volume2 size={13} />
                            <span>Nghe thử giọng AKI</span>
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={currentJourney.stage5_practice.akiMotto}
                          onChange={(e) => {
                            const val = e.target.value
                            updateSixStage((j) => ({ ...j, stage5_practice: { ...j.stage5_practice, akiMotto: val } }))
                          }}
                          className="mt-1.5 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text italic"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700">5 Chi tiết vàng khóa cố định (mỗi dòng 1 chi tiết)</label>
                        <textarea
                          rows={3}
                          value={currentJourney.stage5_practice.lockedFeatures.join('\n')}
                          onChange={(e) => {
                            const lines = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                            updateSixStage((j) => ({ ...j, stage5_practice: { ...j.stage5_practice, lockedFeatures: lines } }))
                          }}
                          className="mt-1.5 w-full rounded-xl border border-border bg-page p-3 text-xs font-semibold text-text"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase text-slate-700 mb-2">Kịch bản 4 bước thực hành (Workflow Steps)</label>
                        <div className="space-y-2.5">
                          {currentJourney.stage5_practice.workflowSteps.map((ws, wsIdx) => (
                            <div key={ws.step || wsIdx} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
                              <span className="text-xs font-black text-brand-900">Bước {ws.step}: {ws.title}</span>
                              <input
                                type="text"
                                value={ws.title}
                                onChange={(e) => {
                                  const val = e.target.value
                                  updateSixStage((j) => {
                                    const steps = [...j.stage5_practice.workflowSteps]
                                    steps[wsIdx] = { ...steps[wsIdx], title: val }
                                    return { ...j, stage5_practice: { ...j.stage5_practice, workflowSteps: steps } }
                                  })
                                }}
                                placeholder="Tên bước..."
                                className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold"
                              />
                              <input
                                type="text"
                                value={ws.quickPrompt}
                                onChange={(e) => {
                                  const val = e.target.value
                                  updateSixStage((j) => {
                                    const steps = [...j.stage5_practice.workflowSteps]
                                    steps[wsIdx] = { ...steps[wsIdx], quickPrompt: val }
                                    return { ...j, stage5_practice: { ...j.stage5_practice, workflowSteps: steps } }
                                  })
                                }}
                                placeholder="Từ khóa / Câu lệnh mẫu khởi đầu..."
                                className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-mono"
                              />
                              <textarea
                                rows={2}
                                value={ws.akiSpeech}
                                onChange={(e) => {
                                  const val = e.target.value
                                  updateSixStage((j) => {
                                    const steps = [...j.stage5_practice.workflowSteps]
                                    steps[wsIdx] = { ...steps[wsIdx], akiSpeech: val }
                                    return { ...j, stage5_practice: { ...j.stage5_practice, workflowSteps: steps } }
                                  })
                                }}
                                placeholder="Lời thoại AKI hướng dẫn..."
                                className="w-full rounded-lg border border-border bg-white p-2 text-xs italic"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
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
                      <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-black text-sky-800">{islandBlocks.length} block</span>
                    </div>

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

                    {islandBlocks.length === 0 && (
                      <div className="rounded-xl border border-dashed border-sky-300 bg-white/80 px-4 py-8 text-center text-xs font-bold text-sky-800">
                        Thả block vào đây hoặc bấm “+ Thêm” ở thư viện bên trái.
                      </div>
                    )}
                  </div>

                  {/* Nút Điều hướng Chặng */}
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-white p-3 shadow-xs">
                    {stageIndex > 0 ? (
                      <button
                        type="button"
                        onClick={() => setActiveSection(`stage-${stageIndex - 1}` as Section)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-page px-4 py-2.5 text-xs font-bold text-text hover:bg-slate-100 transition active:scale-95 cursor-pointer"
                      >
                        ← Chặng trước: {ISLAND_6_STAGE_NAMES[stageIndex - 1]}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveSection('basics')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-page px-4 py-2.5 text-xs font-bold text-text hover:bg-slate-100 transition active:scale-95 cursor-pointer"
                      >
                        ← Thông tin trạm
                      </button>
                    )}

                    {stageIndex < 5 ? (
                      <button
                        type="button"
                        onClick={() => setActiveSection(`stage-${stageIndex + 1}` as Section)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-brand-700 transition active:scale-95 cursor-pointer"
                      >
                        Chặng tiếp theo: {ISLAND_6_STAGE_NAMES[stageIndex + 1]} ➔
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || !readiness.complete}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition active:scale-95",
                          readiness.complete ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer" : "bg-slate-300 cursor-not-allowed opacity-70"
                        )}
                      >
                        {saving ? 'Đang lưu...' : 'Hoàn thành & Lưu trạm học ➔'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Live preview Đảo 6 chặng */}
                <StudentStagePreview
                  stageIndex={stageIndex}
                  isIsland={true}
                  sixStageJourney={currentJourney}
                  stageCard={islandCard}
                />
              </div>
            )
          })()}

          {/* ── AIKI RULE STAGE (1 of 5) ── */}
          {!isIslandCourse && lessonFormat === 'aiki-rule-5steps' && activeSection.startsWith('stage-') && (() => {
            const stageIndex = parseInt(activeSection.replace('stage-', ''), 10)
            const defaultCards = createAikiRuleLearnCards()
            const card = draft.learnCards[stageIndex] ?? defaultCards[stageIndex]
            if (!card) return null
            const stageBlocks = getStageBlocks(card, stageIndex)

            const stageInfo = [
              { title: '1. Tình huống', icon: Clapperboard, desc: 'Mở đầu bằng câu chuyện/tình huống gần gũi kích thích sự tò mò.' },
              { title: '2. Câu đố AIKI', icon: BrainCircuit, desc: 'Thử thách trực giác: Trẻ quan sát 2 tranh vẽ A và B để chọn ra tranh độc nhất.' },
              { title: '3. Quy tắc', icon: Lightbulb, desc: 'Đúc kết bài học thành 1 quy tắc cốt lõi, dễ nhớ cho trẻ.' },
              { title: '4. Giải thích', icon: ScanSearch, desc: 'So sánh trực quan 2 mặt: Kho dữ liệu sao chép của AI vs Não sáng tạo của con.' },
              { title: '5. Chốt', icon: Trophy, desc: 'Tổng kết và trao huy hiệu/lời động viên tự hào cho bé.' },
            ][stageIndex] ?? { title: card.title, icon: Lightbulb, desc: '' }
            const StageIcon = stageInfo.icon

            return (
              <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,.95fr)]">
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
                              Chặng {stageIndex + 1}/5
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
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-white p-3 shadow-xs">
                    {stageIndex > 0 ? (
                      <button
                        type="button"
                        onClick={() => setActiveSection(`stage-${stageIndex - 1}` as Section)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-page px-4 py-2.5 text-xs font-bold text-text hover:bg-slate-100 transition active:scale-95"
                      >
                        ← Chặng trước: {AIKI_STAGE_NAMES[stageIndex - 1]}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveSection('basics')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-page px-4 py-2.5 text-xs font-bold text-text hover:bg-slate-100 transition active:scale-95"
                      >
                        ← Thông tin trạm
                      </button>
                    )}

                    {stageIndex < 4 ? (
                      <button
                        type="button"
                        onClick={() => setActiveSection(`stage-${stageIndex + 1}` as Section)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:bg-brand-700 transition active:scale-95"
                      >
                        Chặng tiếp theo: {AIKI_STAGE_NAMES[stageIndex + 1]} ➔
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || !readiness.complete}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition active:scale-95",
                          readiness.complete ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer" : "bg-slate-300 cursor-not-allowed opacity-70"
                        )}
                      >
                        {saving ? 'Đang lưu...' : 'Hoàn thành & Lưu trạm học ➔'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Live preview */}
                <StudentStagePreview card={card} stageIndex={stageIndex} />
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
              <StudentLearnPreview draft={draft} />
            </div>
          )}

          {/* ── GAME ── */}
          {lessonFormat === 'standard' && activeSection === 'game' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Game selector */}
              <div>
                <div style={sectionLabelStyle}>Chọn hoạt động Thử cùng Mee</div>
                <GameSelector
                  disabled={readOnly}
                  gameType={draft.gameType}
                  gameMode={draft.gameMode}
                  gameAllowedTypes={draft.gameAllowedTypes}
                  onChangeGameType={(t) => set('gameType', t)}
                  onChangeGameMode={(m) => set('gameMode', m)}
                  onChangeAllowedTypes={(types) => set('gameAllowedTypes', types)}
                />
              </div>

              {/* Difficulty */}
              <FormRow label="Độ khó">
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {GAME_DIFFICULTIES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      disabled={readOnly}
                      onClick={() => set('gameDifficulty', d.id as 'gentle' | 'steady' | 'challenge')}
                      style={{
                        flex: 1, padding: '0.5rem 0.25rem', borderRadius: '0.625rem', cursor: readOnly ? 'default' : 'pointer', transition: 'all 0.2s',
                        background: draft.gameDifficulty === d.id ? '#ede9fe' : '#fff',
                        color: draft.gameDifficulty === d.id ? '#6d28d9' : '#64748b',
                        fontSize: '0.8125rem', fontWeight: draft.gameDifficulty === d.id ? 700 : 500,
                        border: draft.gameDifficulty === d.id ? '1.5px solid #8b5cf6' : '1.5px solid #e2e8f0',
                      }}
                    >
                      <div>{d.label}</div>
                      <div style={{ fontSize: '0.6875rem', opacity: 0.7 }}>{d.description}</div>
                    </button>
                  ))}
                </div>
              </FormRow>

              {/* Hướng dẫn và mục tiêu */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormRow label="Hướng dẫn chơi *">
                  <textarea readOnly={readOnly} value={draft.gameInstruction} onChange={(e) => set('gameInstruction', e.target.value)} placeholder="Học sinh cần làm gì trong game?" rows={3} style={textareaStyle} />
                </FormRow>
                <FormRow label="Mục tiêu game *">
                  <textarea readOnly={readOnly} value={draft.gameOutcome} onChange={(e) => set('gameOutcome', e.target.value)} placeholder="Học sinh đạt được gì khi chơi?" rows={3} style={textareaStyle} />
                </FormRow>
              </div>

              {/* ── Math-kids: question count + quiz builder ── */}
              {needsQuizConfig && (
                <div>
                  {/* WHY: questionCount per-bài — bài dễ dùng ít câu, bài khó dùng nhiều câu */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={sectionLabelStyle}>Câu hỏi trắc nghiệm (AI Quiz)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        Số câu:
                        <input
                          type="number"
                          readOnly={readOnly}
                          min={1} max={30}
                          value={draft.questionCount}
                          onChange={(e) => set('questionCount', Math.max(1, Math.min(30, parseInt(e.target.value) || 6)))}
                          style={{
                            width: '4rem', padding: '0.25rem 0.5rem',
                            border: '1.5px solid #e2e8f0', borderRadius: '0.375rem',
                            fontSize: '0.875rem', textAlign: 'center',
                            background: '#fff', color: '#0f172a',
                            outline: 'none',
                          }}
                        />
                      </label>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => setShowBankPicker(true)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                            padding: '0.375rem 0.875rem', borderRadius: '0.5rem',
                            background: '#ede9fe', color: '#6d28d9',
                            fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                            border: '1px solid #c4b5fd',
                          }}
                        >
                          <BookMarked size={13} /> Chọn từ ngân hàng
                        </button>
                      )}
                    </div>
                  </div>
                  <QuizQuestionBuilder
                    readOnly={readOnly}
                    questions={quizQuestions}
                    onChange={setQuizQuestions}
                  />
                </div>
              )}

              {/* ── Catalog game config ── */}
              {needsCatalogConfig && catalogGameType && (
                <div>
                  <div style={sectionLabelStyle}>
                    Cấu hình {catalogGameType === 'data-runner' ? '🏃 Data Runner' : '🚀 Truth Patrol'}
                  </div>
                  <CatalogGameBuilder
                    readOnly={readOnly}
                    gameType={catalogGameType}
                    value={draft.gameStructuredText}
                    onChange={(raw) => set('gameStructuredText', raw)}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── PRACTICE ── */}
          {lessonFormat === 'standard' && activeSection === 'practice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '0.625rem', fontSize: '0.8125rem', color: '#065f46' }}>
                <strong>Tự tay làm phải dùng kiến thức vừa học.</strong> Học sinh cần biết làm gì, tạo ra sản phẩm nào, tự kiểm tra theo tiêu chí nào và lưu sản phẩm riêng tư.
              </div>
              <FormRow label="Kiểu thực hành *">
                {!PRACTICE_OPTIONS.some((option) => option.id === draft.practiceKind) && (
                  <div className="mb-3 rounded-xl border border-sun-200 bg-sun-50 px-4 py-3 text-sm font-semibold text-sun-900" role="alert">
                    Kiểu cũ <strong>{draft.practiceKind}</strong> chưa có trình biên soạn dữ liệu an toàn. Hãy chọn một kiểu được hỗ trợ bên dưới trước khi lưu lại trạm.
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' }}>
                  {PRACTICE_OPTIONS.map((opt) => {
                    const active = draft.practiceKind === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={readOnly}
                        onClick={() => set('practiceKind', opt.id)}
                        style={{
                          padding: '0.625rem 0.75rem', borderRadius: '0.625rem', cursor: readOnly ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s',
                          background: active ? '#ede9fe' : '#fff',
                          border: active ? '1.5px solid #8b5cf6' : '1.5px solid #e2e8f0',
                          color: active ? '#6d28d9' : '#475569',
                        }}
                      >
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{opt.label}</div>
                        <div style={{ fontSize: '0.6875rem', opacity: 0.7, marginTop: '0.125rem' }}>{opt.description}</div>
                      </button>
                    )
                  })}
                </div>
              </FormRow>
              <PracticeKindPreview draft={draft} compact />
              <FormRow label="Hướng dẫn thực hành *">
                <textarea readOnly={readOnly} value={draft.practiceInstruction} onChange={(e) => set('practiceInstruction', e.target.value)} placeholder="Mô tả nhiệm vụ học sinh cần làm..." rows={4} style={textareaStyle} />
              </FormRow>
              <FormRow label="Sản phẩm học sinh tạo ra *">
                <input type="text" readOnly={readOnly} value={draft.product} onChange={(e) => set('product', e.target.value)} placeholder="VD: Bức tranh về AI trong tương lai" style={inputStyle} />
              </FormRow>
              {draft.practiceKind === 'ordering' && (
                <FormRow label="Các thẻ cần sắp xếp *">
                  <textarea
                    readOnly={readOnly}
                    value={draft.practiceConfigText}
                    onChange={(e) => set('practiceConfigText', e.target.value)}
                    placeholder={'Mỗi dòng theo mẫu: Tiêu đề | Mô tả\nNhận nhiều ví dụ | AI xem dữ liệu đã chuẩn bị.\nTìm mẫu | AI tìm dấu hiệu thường lặp lại.\nCon người kiểm tra | Con người xem bằng chứng trước khi dùng.'}
                    rows={7}
                    style={textareaStyle}
                  />
                  <p className="mt-2 text-xs font-semibold text-muted">Thứ tự giáo viên nhập là đáp án đúng. Học sinh sẽ nhận danh sách đã đảo và kéo thả để sắp xếp.</p>
                </FormRow>
              )}
              <FormRow label="Các bước học sinh thực hiện *">
                <textarea readOnly={readOnly} value={draft.practiceStepsText} onChange={(e) => set('practiceStepsText', e.target.value)} placeholder={'Mỗi dòng là một bước ngắn, ví dụ:\nNhắc lại dấu hiệu vừa học\nTạo bản đầu tiên\nĐối chiếu và sửa sản phẩm\nKiểm tra riêng tư trước khi lưu'} rows={6} style={textareaStyle} />
              </FormRow>
              <FormRow label="Tiêu chí sản phẩm đạt chuẩn *">
                <textarea readOnly={readOnly} value={draft.successCriteriaText} onChange={(e) => set('successCriteriaText', e.target.value)} placeholder={'Mỗi dòng là một tiêu chí học sinh tự kiểm tra\nSản phẩm thể hiện đúng kiến thức của trạm\nCó bằng chứng hoặc lý do lựa chọn\nKhông chứa thông tin riêng tư'} rows={5} style={textareaStyle} />
              </FormRow>
              <FormRow label="Câu hỏi nhìn lại *">
                <input type="text" readOnly={readOnly} value={draft.reflectionPrompt} onChange={(e) => set('reflectionPrompt', e.target.value)} placeholder="Con đã sửa điểm nào sau khi tự kiểm tra? Vì sao?" style={inputStyle} />
              </FormRow>
            </div>
          )}

          {/* ── CHECK ── */}
          {lessonFormat === 'standard' && activeSection === 'check' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '0.75rem 1rem',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '0.625rem',
                fontSize: '0.8125rem',
                color: '#0369a1',
              }}>
                <strong>Thử thách cuối trạm</strong> kiểm tra học sinh đã đạt đúng các mục tiêu phía trên.
                Mỗi câu hỏi có thể có từ <strong>2–6 đáp án</strong>. Câu hỏi trong game được cấu hình ở phần <strong>Thử cùng Mee</strong>.
              </div>

              {/* Multi-question check builder */}
              <CheckQuestionBuilder
                readOnly={readOnly}
                questions={draft.checkQuestions}
                onChange={(qs) => set('checkQuestions', qs)}
              />
            </div>
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
        description={lessonFormat === 'aiki-rule-5steps' ? 'Toàn bộ hành trình 5 chặng Quy tắc AIKI: Tình huống → Câu đố AIKI → Quy tắc → Giải thích → Chốt.' : 'Toàn bộ hành trình trong một trạm: mở bài → khám phá → chơi → thực hành → thử thách.'}
        showMascot={false}
        className="station-preview-modal"
        onClose={() => setShowFullPreview(false)}
        actions={<button type="button" className="btn-primary" onClick={() => setShowFullPreview(false)}>Tiếp tục biên soạn</button>}
      >
        <FullStationPreview draft={draft} gameConfig={buildGameConfigForSave()} />
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
