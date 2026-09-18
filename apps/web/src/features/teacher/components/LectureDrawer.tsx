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
  serializeLectureGameConfig, serializeLearnCardsForHub, slugifyAuthoringId, createAikiRuleLearnCards, AIKI_RULE_META_LABEL,
  AIKI_RULE_STAGE_KINDS,
  detectLessonFormat, isAikiRuleLesson, type LessonFormat,
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
import { CreativeNotebookEngine } from '@/features/lesson/components/creative-engine/engines/CreativeNotebookEngine'
import { DEFAULT_NOTEBOOK_CONFIGS, findIslandCurriculum } from '@/features/lesson/data/island-curriculum-registry'
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

const AIKI_SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'basics', label: 'Thông tin trạm', icon: <BookOpen size={14} /> },
  { id: 'stage-0', label: '1. Tình huống', icon: <Clapperboard size={14} /> },
  { id: 'stage-1', label: '2. Câu đố AIKI', icon: <BrainCircuit size={14} /> },
  { id: 'stage-2', label: '3. Quy tắc', icon: <Lightbulb size={14} /> },
  { id: 'stage-3', label: '4. Giải thích', icon: <ScanSearch size={14} /> },
  { id: 'stage-4', label: '5. Chốt', icon: <Trophy size={14} /> },
]

export { ISLAND_6_STAGE_SECTIONS } from './lecture-drawer'


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

export const ENGINE_DEFAULT_MOTTOS: Record<string, string> = {
  'magic-keys': '4 Chìa khóa vạn năng: Xanh (Cái gì) · Vàng (Trông như thế nào) · Cam (Đang làm gì) · Đỏ (Ở đâu). Đủ 4 chìa là hết đoán bừa!',
  'style-prism': 'Lăng kính phù thủy: Giữ nguyên chủ thể, đổi màu phong cách nghệ thuật diệu kỳ!',
  'prompt-doctor': 'Bác sĩ AKI: Bắt bệnh tranh lỗi, kê đơn thuốc thẻ chữ chữa lành chuẩn xác!',
  'layer-stacking': '3 Tầng sân khấu: Tách bạch Hậu cảnh, Ngôi sao 1/3 và Tiền cảnh cho bức tranh có chiều sâu!',
  'identity-lock': 'Khóa mật mã ADN: Giữ vững nhân vật bất biến qua muôn vàn biểu cảm thần thái!',
  'card-forge': 'Xưởng đúc thẻ bài: Kết hợp Hệ nguyên tố và Tuyệt chiêu để tôi luyện thẻ bài huyền thoại!',
  'creative-notebook': 'Hãy viết bằng chính suy nghĩ của cậu! AI sẽ giúp cậu trang trí sau, còn câu chuyện này là của riêng cậu!',
}

export interface CreativeEngineOption {
  mode: string
  title: string
  shortName: string
  icon: string
  desc: string
  activeBorder: string
  badgeBg: string
}

export const CREATIVE_ENGINES: CreativeEngineOption[] = [
  {
    mode: 'magic-keys',
    title: '4 Chìa Khóa Ma Thuật',
    shortName: '4 Chìa Khóa',
    icon: '🔑',
    desc: 'Ai? + Trông thế nào? + Làm gì? + Ở đâu?',
    activeBorder: 'border-brand-500 ring-2 ring-brand-400 bg-white',
    badgeBg: 'bg-brand-600',
  },
  {
    mode: 'style-prism',
    title: 'Lăng Kính Phù Thủy',
    shortName: 'Lăng Kính',
    icon: '🔮',
    desc: 'Xoay 4 phong cách: Đất nặn, Màu nước, 3D, Dân gian',
    activeBorder: 'border-purple-500 ring-2 ring-purple-400 bg-white',
    badgeBg: 'bg-purple-600',
  },
  {
    mode: 'prompt-doctor',
    title: 'Bác Sĩ Câu Lệnh',
    shortName: 'Bác Sĩ AKI',
    icon: '🩺',
    desc: 'Bắt bệnh tranh lỗi & kê đơn thuốc thẻ chữ',
    activeBorder: 'border-rose-500 ring-2 ring-rose-400 bg-white',
    badgeBg: 'bg-rose-600',
  },
  {
    mode: 'layer-stacking',
    title: '3 Tầng Sân Khấu',
    shortName: '3 Tầng',
    icon: '🎭',
    desc: 'Hậu cảnh - Ngôi sao 1/3 - Tiền cảnh',
    activeBorder: 'border-emerald-500 ring-2 ring-emerald-400 bg-white',
    badgeBg: 'bg-emerald-600',
  },
  {
    mode: 'identity-lock',
    title: 'Khóa Mật Mã & Biểu Cảm',
    shortName: 'Khóa Mật Mã',
    icon: '🔒',
    desc: 'Khóa 3 ADN nhân vật & xoay 6 biểu cảm',
    activeBorder: 'border-cyan-500 ring-2 ring-cyan-400 bg-white',
    badgeBg: 'bg-cyan-600',
  },
  {
    mode: 'card-forge',
    title: 'Xưởng Đúc Thẻ Bài TCG',
    shortName: 'Đúc Thẻ Bài',
    icon: '🃏',
    desc: 'Hệ nguyên tố, khung pha lê, chỉ số HP/ATK',
    activeBorder: 'border-amber-500 ring-2 ring-amber-400 bg-white',
    badgeBg: 'bg-amber-600',
  },
  {
    mode: 'creative-notebook',
    title: 'Sổ Tay Sáng Tạo Ba Lô',
    shortName: 'Sổ Tay Ba Lô',
    icon: '🎒',
    desc: 'Lập hồ sơ, viết cốt truyện, phân cảnh storyboard cất Ba Lô',
    activeBorder: 'border-amber-500 ring-2 ring-amber-400 bg-white',
    badgeBg: 'bg-amber-600',
  },
]


const AVAILABLE_MODULES = [
  { id: 'course-text', label: 'Nội Dung Bài Học', icon: '📖', desc: 'Khối nội dung chuẩn cho khóa học 6 chặng' },
  { id: 'course-four-keys', label: 'Bộ 4 Chìa Khóa', icon: '🔑', desc: 'Một bộ 4 ô kéo thả dùng trong Mục tiêu hoặc Xác nhận' },
  { id: 'text', label: 'Đoạn văn bản (Textbox)', icon: '📖', desc: 'Thêm một đoạn văn bản hoặc tiêu đề mới' },
  { id: 'layout-callout', label: 'Hộp Ghi Nhớ Nổi Bật', icon: '💡', desc: 'Khung vàng ghi chú bí kíp bỏ túi' },
  { id: 'layout-formula', label: 'Công Thức KaTeX', icon: '🔤', desc: 'Công thức toán học hoặc định nghĩa cô đọng' },
  { id: 'layout-split', label: '2 Cột: 1 Ảnh + 1 Chữ (50/50)', icon: '📰', desc: 'Cột chữ kết hợp cột ảnh/video minh họa' },
  { id: 'layout-two-text', label: '2 Cột: 2 Văn Bản Song Song', icon: '📄', desc: 'Hai cột văn bản song song không kèm ảnh' },
  { id: 'layout-grid', label: 'Lưới 3 Ô Thẻ', icon: '🍱', desc: 'Lưới 3 thẻ ví dụ trực quan' },
  { id: 'layout-four-keys', label: 'Bố cục 4 Chìa Khóa', icon: '🔑', desc: 'Template 4 ô đúng giao diện bài Bốn chiếc chìa khóa' },
  { id: 'layout-confirm-option', label: 'Phương Án Lựa Chọn (A, B, C...)', icon: '🔘', desc: 'Phương án trắc nghiệm xác nhận mục tiêu (Chữ + Ảnh)' },
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
const COURSE_CONFIRM_BLOCK_PREFIX = 'course-confirm-'

const FOUR_KEYS_METADATA = [
  { label: 'CÁI GÌ', sub: 'Ai, đồ vật gì', tone: 'sky' as const, keyImage: '/assets/aiki-keys/key_what_blue.jpg' },
  { label: 'TRÔNG THẾ NÀO', sub: 'Màu sắc, hình dáng', tone: 'sun' as const, keyImage: '/assets/aiki-keys/key_how_yellow.jpg' },
  { label: 'ĐANG LÀM GÌ', sub: 'Hành động', tone: 'coral' as const, keyImage: '/assets/aiki-keys/key_action_orange.jpg' },
  { label: 'Ở ĐÂU', sub: 'Bối cảnh, nơi chốn', tone: 'rose' as const, keyImage: '/assets/aiki-keys/key_where_pink.jpg' },
] as const

function goalKeyItems(keyPoints: string[]): LearnVisualItemDraft[] {
  const COLOR_NAME_MAP: Record<string, { tone: 'sky' | 'sun' | 'coral' | 'rose'; image: string }> = {
    'xanh sky': { tone: 'sky', image: '/assets/aiki-keys/key_what_blue.jpg' },
    'sky': { tone: 'sky', image: '/assets/aiki-keys/key_what_blue.jpg' },
    'vàng sun': { tone: 'sun', image: '/assets/aiki-keys/key_how_yellow.jpg' },
    'sun': { tone: 'sun', image: '/assets/aiki-keys/key_how_yellow.jpg' },
    'cam mango': { tone: 'coral', image: '/assets/aiki-keys/key_action_orange.jpg' },
    'coral': { tone: 'coral', image: '/assets/aiki-keys/key_action_orange.jpg' },
    'hồng gum': { tone: 'rose', image: '/assets/aiki-keys/key_where_pink.jpg' },
    'rose': { tone: 'rose', image: '/assets/aiki-keys/key_where_pink.jpg' },
  }

  return Array.from({ length: 4 }, (_, index) => {
    const defaultMeta = FOUR_KEYS_METADATA[index] || FOUR_KEYS_METADATA[0]
    const value = keyPoints[index] || ''
    const separator = value.indexOf(':')

    let rawPrefix = separator > 0 ? value.slice(0, separator).trim() : value.trim()
    const rawText = separator > 0 ? value.slice(separator + 1).trim() : ''

    // Bóc tách nếu có màu sắc cũ trong ngoặc: VD "(Xanh Sky)"
    let detectedTone: 'sky' | 'sun' | 'coral' | 'rose' = defaultMeta.tone
    let detectedImage: string = defaultMeta.keyImage

    const colorMatch = rawPrefix.match(/\((Xanh Sky|Vàng Sun|Cam Mango|Hồng Gum|sky|sun|coral|rose|brand)\)/i)
    if (colorMatch) {
      const colorKey = colorMatch[1].toLowerCase()
      if (COLOR_NAME_MAP[colorKey]) {
        detectedTone = COLOR_NAME_MAP[colorKey].tone
        detectedImage = COLOR_NAME_MAP[colorKey].image
      }
      rawPrefix = rawPrefix.replace(/\((Xanh Sky|Vàng Sun|Cam Mango|Hồng Gum|sky|sun|coral|rose|brand)\)/i, '').trim()
    }

    // Bóc tách tên và phụ đề gợi ý: VD "CÁI GÌ (Ai, đồ vật gì)"
    const subMatch = rawPrefix.match(/^(.*?)(?:\s*\((.*?)\))?$/)
    let parsedLabel = subMatch && subMatch[1] ? subMatch[1].trim() : (rawPrefix || defaultMeta.label)
    let parsedSub = subMatch && subMatch[2] ? subMatch[2].trim() : defaultMeta.sub

    // Nếu parsedSub là tên màu sắc sót lại
    if (parsedSub && COLOR_NAME_MAP[parsedSub.toLowerCase()]) {
      const matched = COLOR_NAME_MAP[parsedSub.toLowerCase()]
      detectedTone = matched.tone
      detectedImage = matched.image
      parsedSub = defaultMeta.sub
    }

    if (parsedLabel.toUpperCase() === 'TRÔNG NHƯ THẾ NÀO') {
      parsedLabel = 'TRÔNG THẾ NÀO'
    } else if (parsedLabel === 'Cái gì?') {
      parsedLabel = defaultMeta.label
    }

    return {
      label: parsedLabel || defaultMeta.label,
      sub: parsedSub || defaultMeta.sub,
      text: rawText,
      tone: detectedTone,
      keyImage: detectedImage,
    }
  })
}

function buildCourseGoalBlocks(journey: LessonSixStageJourney, existing: StageBlockItem[] = []): StageBlockItem[] {
  if (journey.stageBlockEditorVersion === 2) return existing.filter((block) => block.type !== 'voice')
  const existingFourKeys = existing.find((block) => block.type === 'layout-four-keys')
  const authoredExtras = existing.filter((block) =>
    !block.id.startsWith(COURSE_GOAL_BLOCK_PREFIX) && block !== existingFourKeys && block.type !== 'voice'
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
    ...authoredExtras,
  ]
}

function confirmKeyItems(option: LessonSixStageJourney['stage2_confirmGoal']['options'][number]): LearnVisualItemDraft[] {
  if (option.keyItems?.length) return option.keyItems.slice(0, 4).map((item, index) => ({
    label: item.label,
    text: item.label,
    tone: (['sky', 'sun', 'coral', 'brand'] as const)[index],
  }))
  const [, values = ''] = option.text.split(':')
  return goalKeyItems(values.split('·').map((item) => item.trim()).filter(Boolean))
}

function buildCourseConfirmBlocks(journey: LessonSixStageJourney, existing: StageBlockItem[] = []): StageBlockItem[] {
  if (journey.stageBlockEditorVersion === 3 && existing.length > 0) {
    return existing.map((block) => {
      if (block.type === 'layout-four-keys' && (block.id.startsWith(COURSE_CONFIRM_BLOCK_PREFIX) || block.id.includes('option'))) {
        return {
          ...block,
          type: 'layout-confirm-option' as const,
          visualItems: [],
        }
      }
      return block
    })
  }
  return [
    {
      id: `${COURSE_CONFIRM_BLOCK_PREFIX}question`,
      type: 'text',
      title: 'Câu hỏi xác nhận',
      body: journey.stage2_confirmGoal.question,
      tip: journey.stage2_confirmGoal.explanation,
    },
    ...journey.stage2_confirmGoal.options.map((option, index) => ({
      id: `${COURSE_CONFIRM_BLOCK_PREFIX}option-${index}`,
      type: 'layout-confirm-option' as const,
      title: option.text.split(':')[0]?.trim() || `Bộ chìa khóa ${String.fromCharCode(65 + index)}`,
      body: option.text.includes(':') ? option.text.split(':')[1]?.trim() : (option.text || `Phương án ${String.fromCharCode(65 + index)}`),
      imageUrl: option.imageUrl || '',
      isCorrect: journey.stage2_confirmGoal.correctIndex === index,
      visualItems: [],
    })),
  ]
}

function isLegacyAikiCourseResidue(card: LearnCardDraft, encodedItem?: LearnVisualItemDraft) {
  return Boolean(encodedItem) ||
    card.id.startsWith('aiki-rule-') ||
    ['situation', 'aiki-riddle', 'rule', 'explanation', 'closing'].includes(card.kind) ||
    /câu đố của aiki|mèo aiki|quy tắc vàng/i.test(card.title)
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
  if (isIsland) {
    try {
      // The editor must use the same SSOT resolver as the learner screen.
      sixStageJourney = resolveIslandSixStageJourney({ ...draft, sixStageJourney } as any)
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
  } else if (draft.customJourneyStages && draft.customJourneyStages.length >= 3) {
    const totalCustom = Math.min(7, draft.customJourneyStages.length)
    while (sourceCards.length < totalCustom) {
      const index = sourceCards.length
      sourceCards.push({
        id: draft.customJourneyStages[index]?.id || `custom-stage-${index + 1}`,
        title: draft.customJourneyStages[index]?.title || `Chặng ${index + 1}`,
        body: '', tip: '', kind: index === 0 ? 'concept' : 'example', layout: 'text', visualItems: [], contentBlocks: [],
      })
    }
  }
  let initialSlug = draft.slug || (draft as any).metadata?.slug || ''
  if (!initialSlug && draft.id) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(draft.id)
    if (!isUUID) {
      initialSlug = draft.id
    } else {
      const curriculum = findIslandCurriculum(draft as any)
      initialSlug = curriculum?.slug || slugifyAuthoringId(draft.title || '')
    }
  } else if (!initialSlug && draft.title) {
    initialSlug = slugifyAuthoringId(draft.title)
  }

  const rawAccess = (draft as any).access ?? (draft as any).metadata?.access
  const access: LessonAccessConfig = {
    mode: rawAccess?.mode ?? 'inherit',
    minPlanTier: rawAccess?.minPlanTier ?? 0,
    trialBadge: rawAccess?.trialBadge ?? 'Học thử',
    lockedReason: rawAccess?.lockedReason ?? '',
  }

  return {
    ...draft,
    access,
    slug: initialSlug,
    lessonFormat: format,
    sixStageJourney,
    customJourneyStages: draft.customJourneyStages,
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
      const legacyAikiCourseResidue = isIsland && isLegacyAikiCourseResidue(card, encodedItem)
      const islandStageBlocks: StageBlockItem[] = isIsland
        ? (sixStageJourney?.stageContentBlocks?.[`stage-${index}`] ?? card.contentBlocks ?? []) as StageBlockItem[]
        : []
      const kind = isAiki && index < AIKI_RULE_STAGE_KINDS.length
        ? AIKI_RULE_STAGE_KINDS[index]
        : normalizeLearnKind(encoded.kind ?? card.kind, index, isAiki ? card.id : '', isAiki)
      return {
        ...card,
        id: isIsland ? `island-stage-${index + 1}` : (card.id || (isAiki && index < AIKI_RULE_STAGE_KINDS.length ? `aiki-rule-${AIKI_RULE_STAGE_KINDS[index]}` : `learn-${index + 1}`)),
        title: isIsland ? (ISLAND_6_STAGE_NAMES[index] || `Chặng ${index + 1}`) : (card.title || `Khối khám phá ${index + 1}`),
        body: card.body || '',
        tip: card.tip ?? '',
        kind: isIsland ? (index === 0 ? 'concept' : 'example') : kind,
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
          ? buildCourseGoalBlocks(sixStageJourney, legacyAikiCourseResidue ? [] : islandStageBlocks)
          : (isIsland && index === 1 && sixStageJourney
            ? buildCourseConfirmBlocks(sixStageJourney, legacyAikiCourseResidue ? [] : islandStageBlocks)
          : (isIsland
              ? (legacyAikiCourseResidue ? [] : islandStageBlocks.filter((block) => block.type !== 'voice'))
              : encoded.contentBlocks ?? card.contentBlocks)),
        compareImages: encoded.compareImages ?? card.compareImages ?? (kind === 'explanation' ? { left: '', right: '' } : undefined),
        mee: isIsland && index === 0 && sixStageJourney
          ? { ...(encoded.mee ?? card.mee), readText: sixStageJourney.stage1_goal.speech, voiceProvider: 'vertex', gesture: encoded.mee?.gesture ?? card.mee?.gesture ?? 'presentation', autoRead: encoded.mee?.autoRead ?? card.mee?.autoRead ?? false }
          : encoded.mee ?? card.mee ?? { readText: '', audioUrl: '', voiceProvider: 'vertex', gesture: 'presentation', autoRead: false },
      }
    }),
  }
}

export function CollapsedPreviewRail({
  onExpand,
  label = 'HỌC SINH SẼ THẤY',
}: {
  onExpand: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onExpand}
      className="w-14 shrink-0 sticky top-4 h-[calc(100vh-10rem)] min-h-[420px] rounded-3xl border-2 border-sky-200 bg-white/95 shadow-clay-xs hover:border-sky-400 hover:bg-sky-50/60 cursor-pointer flex flex-col items-center justify-between py-4 px-1 select-none group transition-all"
      title="Mở rộng xem trước màn học sinh"
      aria-label="Mở rộng xem trước màn học sinh"
    >
      {/* Đỉnh: Nút PanelRightOpen màu sky */}
      <span className="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-100 group-hover:scale-110 shadow-2xs transition">
        <PanelRightOpen size={16} />
      </span>

      {/* Thân giữa: Icon Eye + Dòng chữ dọc mềm mại HỌC SINH SẼ THẤY */}
      <div className="flex flex-col items-center gap-2 text-sky-800">
        <Eye size={16} className="text-sky-600 group-hover:scale-110 transition shrink-0" />
        <span
          className="text-[10px] font-black tracking-widest text-sky-900 group-hover:text-sky-700 transition"
          style={{ writingMode: 'vertical-rl' }}
        >
          {label}
        </span>
      </div>

      {/* Đáy: Icon Smartphone + chữ PREVIEW */}
      <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-sky-600 transition">
        <Smartphone size={13} className="shrink-0" />
        <span className="text-[9px] font-black tracking-wider">PREVIEW</span>
      </div>
    </button>
  )
}

export const StudentBasicsPreview = React.memo(function StudentBasicsPreview({ draft, onCollapse }: { draft: LectureDraft; onCollapse?: () => void }) {
  const goals = goalLines(draft.goalsText)
  return (
    <aside className="ui-card h-fit p-4 lg:sticky lg:top-4" aria-label="Xem trước thông tin trạm trên màn học sinh">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-sky-700"><Eye size={16} /> Học sinh sẽ thấy</p>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg transition cursor-pointer"
            title="Thu gọn cột xem trước"
          >
            <PanelRightClose size={13} />
            <span>Thu gọn</span>
          </button>
        )}
      </div>
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
})

const StudentLearnPreview = React.memo(function StudentLearnPreview({ draft }: { draft: LectureDraft }) {
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
})

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

// Stage 5 Practice Engine Editor: PracticePartsAndFourKeysEditor & Stage5CreativeEngineEditor
// are imported from ./engine-editors (supporting all 6 creative engines).

export const PracticeWorkflowStepsAccordion = React.memo(function PracticeWorkflowStepsAccordion({
  workflowSteps,
  onChange,
}: {
  workflowSteps: SixStageWorkflowStep[]
  onChange: (steps: SixStageWorkflowStep[]) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleUpdateStep = (idx: number, patch: Partial<SixStageWorkflowStep>) => {
    const nextSteps = [...workflowSteps]
    nextSteps[idx] = { ...nextSteps[idx], ...patch }
    onChange(nextSteps)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-3.5 bg-slate-50/80 hover:bg-slate-100/90 transition cursor-pointer text-left gap-3"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              💬 Lời thoại &amp; Gợi ý từng lượt của AKI (Nâng cao)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {workflowSteps.length} lượt
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-normal">
            Gợi ý câu lệnh nhanh xuất hiện trên thanh prompt (&apos;Chạm để thử ngay&apos;) và lời thoại động viên của AKI qua các lượt vẽ của bé.
          </p>
        </div>
        <div className="text-slate-400 shrink-0 p-1">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3.5 border-t border-slate-200 space-y-3 bg-slate-50/40 animate-in fade-in duration-150">
          {workflowSteps.map((ws, wsIdx) => (
            <div key={ws.step || wsIdx} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-brand-900">
                  Bước {ws.step}: {ws.title || `Lượt ${ws.step}`}
                </span>
                <span className="text-[10px] font-bold text-slate-400">Lượt vẽ {ws.step}/4</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Tên bước kịch bản</label>
                <input
                  type="text"
                  value={ws.title}
                  onChange={(e) => handleUpdateStep(wsIdx, { title: e.target.value })}
                  placeholder="Tên bước..."
                  className="w-full rounded-lg border border-border bg-page px-2.5 py-1.5 text-xs font-semibold text-text"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Câu lệnh gợi ý nhanh (&apos;Chạm để thử ngay&apos;)</label>
                <input
                  type="text"
                  value={ws.quickPrompt}
                  onChange={(e) => handleUpdateStep(wsIdx, { quickPrompt: e.target.value })}
                  placeholder="Từ khóa / Câu lệnh mẫu khởi đầu..."
                  className="w-full rounded-lg border border-border bg-page px-2.5 py-1.5 text-xs font-mono text-text"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Lời thoại AKI động viên bé</label>
                <textarea
                  rows={2}
                  value={ws.akiSpeech}
                  onChange={(e) => handleUpdateStep(wsIdx, { akiSpeech: e.target.value })}
                  placeholder="Lời thoại AKI hướng dẫn..."
                  className="w-full rounded-lg border border-border bg-page p-2 text-xs italic text-text"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

export type PreviewViewportMode = 'mobile' | 'tablet' | 'pc' | 'full'

export const StudentStagePreview = React.memo(function StudentStagePreview({
  card,
  stageIndex,
  isIsland,
  sixStageJourney,
  stageCard,
  viewport: propViewport,
  hideHeaderToolbar,
  onCollapse,
}: {
  card?: LearnCardDraft
  stageIndex: number
  isIsland?: boolean
  sixStageJourney?: LessonSixStageJourney
  stageCard?: LearnCardDraft
  viewport?: PreviewViewportMode
  hideHeaderToolbar?: boolean
  onCollapse?: () => void
}) {
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title?: string } | null>(null)
  const [internalViewport, setInternalViewport] = useState<PreviewViewportMode>('mobile')
  const activeViewport = propViewport ?? internalViewport
  const setViewport = setInternalViewport
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { showToast } = useToast()

  // State tương tác cho Chặng 2 (Video bài học preview)
  const [previewVideoSeekSec, setPreviewVideoSeekSec] = useState(0)
  const [isPlayingPreviewVideo, setIsPlayingPreviewVideo] = useState(false)

  // State tương tác cho Chặng 5 (Thực hành AI Studio)
  const [selectedPartIndex, setSelectedPartIndex] = useState(0)
  const [activeWhat, setActiveWhat] = useState<string | null>(null)
  const [activeHow, setActiveHow] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [activeWhere, setActiveWhere] = useState<string | null>(null)
  const [activeStylePrism, setActiveStylePrism] = useState<string | null>(null)
  const [activeCure, setActiveCure] = useState<string | null>(null)
  const [activeExpression, setActiveExpression] = useState<string | null>(null)
  const [activeCardElement, setActiveCardElement] = useState<string | null>(null)

  // Lắng nghe phím Escape để đóng toàn màn hình
  useEffect(() => {
    if (!isFullscreen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  if (isIsland && sixStageJourney) {
    const stageName = ISLAND_6_STAGE_NAMES[stageIndex] ?? `Chặng ${stageIndex + 1}`

    const renderIslandStageContent = (isFs: boolean, vp: PreviewViewportMode) => {
      const isMobile = vp === 'mobile'
      const isWide = !isMobile && (vp === 'tablet' || vp === 'pc' || vp === 'full')

      return (
        <div className="space-y-4">
          {/* Chặng 0: Mục tiêu */}
          {stageIndex === 0 && (
            <SixStageGoalStage
              goal={sixStageJourney.stage1_goal}
              fourKeys={sixStageJourney.stage1_goal.keyPoints.length >= 4 || sixStageJourney.stage1_goal.title.toLowerCase().includes('chìa khoá')}
              compact={isMobile}
              showContinue={false}
              onImageClick={(image) => setZoomedImage(image)}
            />
          )}

          {/* Chặng 1: Xác nhận */}
          {stageIndex === 1 && (() => {
            const rawOptions = (sixStageJourney.stage2_confirmGoal.options && sixStageJourney.stage2_confirmGoal.options.length >= 2)
              ? sixStageJourney.stage2_confirmGoal.options
              : [
                  { id: 'opt-a', text: 'Bộ chìa khoá A: Ai vẽ · Vẽ lúc nào · Vẽ ở đâu · Vẽ bằng gì' },
                  { id: 'opt-b', text: 'Bộ chìa khoá B: Cái gì · Trông như thế nào · Đang làm gì · Ở đâu' },
                  { id: 'opt-c', text: 'Bộ chìa khoá C: Cái gì · Màu gì · To hay nhỏ · Của ai' },
                ]

            const confirmCards = rawOptions.map((opt, idx) => {
              let title = opt.text
              let keys: string[] = []
              if (opt.keyItems && opt.keyItems.length > 0) {
                keys = opt.keyItems.map((k) => k.label)
              } else if (opt.text.includes('·')) {
                const parts = opt.text.split(':')
                title = parts[0]?.trim() || opt.text
                keys = (parts[1] || '').split('·').map((k) => k.trim()).filter(Boolean)
              }
              if (keys.length === 0) {
                if (idx === sixStageJourney.stage2_confirmGoal.correctIndex) {
                  keys = ['Cái gì?', 'Trông thế nào?', 'Đang làm gì?', 'Ở đâu?']
                } else if (idx === 0) {
                  keys = ['Ai vẽ?', 'Vẽ lúc nào?', 'Vẽ ở đâu?', 'Vẽ bằng gì?']
                } else {
                  keys = ['Cái gì?', 'Màu gì?', 'To hay nhỏ?', 'Của ai?']
                }
              }
              return {
                ...opt,
                displayTitle: title,
                keys,
              }
            })

            return (
              <div className="space-y-3">
                <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/70 p-3.5 shadow-sm">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-black uppercase text-sky-700 flex items-center gap-1">
                      ❓ Chặng 2: Xác nhận mục tiêu
                    </span>
                    <span className="text-[9px] font-bold text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full">
                      3 Ổ Khóa Thần Kỳ
                    </span>
                  </div>
                  <h4 className="font-display text-sm sm:text-base font-black text-sky-950">
                    {sixStageJourney.stage2_confirmGoal.question || 'Bộ chìa khoá nào mở được một câu lệnh tốt?'}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-sky-800/80 font-medium mt-0.5">
                    Chiếc Rương Thần Kỳ có 3 ổ khóa (A, B, C). Bé dùng đúng 4 Chiếc Chìa Khóa Vàng để mở Ổ Khóa B nhé!
                  </p>
                </div>

                {/* 3 Bộ chìa khóa A, B, C dàn hàng ngang rộng rãi ở chế độ PC / Tablet */}
                <div className={cn(
                  "grid gap-3.5",
                  isWide ? "grid-cols-1 md:grid-cols-3 sm:gap-4" : "grid-cols-1"
                )}>
                  {confirmCards.map((option, idx) => {
                    const isCorrect = idx === sixStageJourney.stage2_confirmGoal.correctIndex
                    const letter = String.fromCharCode(65 + idx)
                    return (
                      <div
                        key={option.id || idx}
                        className={cn(
                          "relative flex flex-col justify-between rounded-2xl p-3 sm:p-3.5 border-2 transition-all min-w-0 shadow-clay-xs",
                          isCorrect
                            ? "border-emerald-400 bg-emerald-50/90 ring-2 ring-emerald-300/60"
                            : "border-slate-200 bg-white"
                        )}
                      >
                        {/* Header: Badge A, B, C & Status */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            "size-7 rounded-lg flex items-center justify-center font-black text-xs border shrink-0 shadow-2xs",
                            isCorrect ? "bg-emerald-500 text-white border-emerald-500" : "bg-slate-100 text-slate-700 border-slate-200"
                          )}>
                            {letter}
                          </span>
                          {isCorrect ? (
                            <span className="rounded-full bg-emerald-600 text-white text-[9.5px] font-black px-2 py-0.5 shadow-2xs flex items-center gap-1">
                              <Check size={11} /> ĐÚNG
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 text-slate-500 text-[9.5px] font-bold px-2 py-0.5">
                              Khóa
                            </span>
                          )}
                        </div>

                        {/* Ổ Khóa thần kỳ Card Header */}
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                          <div className={cn(
                            "size-9 sm:size-10 rounded-xl flex items-center justify-center text-lg border shrink-0 shadow-2xs",
                            isCorrect ? "bg-emerald-100 border-emerald-300" : "bg-amber-50 border-amber-200"
                          )}>
                            {isCorrect ? '🔑' : '🔒'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className={cn("text-xs sm:text-sm font-black truncate leading-tight", isCorrect ? "text-emerald-950" : "text-slate-800")}>
                              {isCorrect ? `🔑 Ổ Khóa ${letter} [ĐÚNG]` : `🔒 Ổ Khóa ${letter}`}
                            </h5>
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block truncate mt-0.5">
                              {isCorrect ? '✨ 4 Chìa Khóa Vàng' : 'Bộ 4 Chìa Khóa'}
                            </span>
                          </div>
                        </div>

                        {/* Hiển thị 1 ảnh đại diện của 4 chìa khóa nếu có imageUrl, hoặc fallback về lưới 2x2 */}
                        {option.imageUrl ? (
                          <div className="my-1.5 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 flex-1 flex items-center justify-center p-1 min-h-[120px]">
                            <img
                              src={option.imageUrl}
                              alt={option.displayTitle || option.text}
                              className="w-full h-auto max-h-[160px] object-contain rounded-lg"
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-1.5 my-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/70 flex-1">
                            {option.keys.slice(0, 4).map((kLabel, kIdx) => {
                              const keyColorStyles = [
                                { bg: 'bg-sky-50', text: 'text-sky-900', border: 'border-sky-200', tag: 'bg-sky-500' },
                                { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200', tag: 'bg-amber-500' },
                                { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200', tag: 'bg-emerald-500' },
                                { bg: 'bg-rose-50', text: 'text-rose-900', border: 'border-rose-200', tag: 'bg-rose-500' },
                              ][kIdx % 4]

                              return (
                                <div
                                  key={kIdx}
                                  className={cn(
                                    "flex flex-col items-center text-center p-1.5 rounded-lg border shadow-2xs gap-0.5",
                                    keyColorStyles.bg, keyColorStyles.border
                                  )}
                                >
                                  <span className={cn("text-[7.5px] font-black uppercase px-1 rounded text-white tracking-wider", keyColorStyles.tag)}>
                                    CHÌA {kIdx + 1}
                                  </span>
                                  <span className={cn("text-[10px] sm:text-[11px] font-extrabold leading-snug line-clamp-3 break-words", keyColorStyles.text)}>
                                    {kLabel}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Nhãn trạng thái dưới đáy */}
                        <div className={cn(
                          "mt-2 py-1.5 px-2.5 rounded-xl text-center text-[10px] sm:text-[11px] font-black border",
                          isCorrect ? "bg-emerald-100/90 text-emerald-800 border-emerald-300" : "bg-slate-100 text-slate-500 border-slate-200"
                        )}>
                          {isCorrect ? '✓ Mở Rương Thần Kỳ' : 'Ổ khóa đang khóa'}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {sixStageJourney.stage2_confirmGoal.explanation && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 text-xs font-semibold text-emerald-900">
                    💡 <strong>Giải thích:</strong> {sixStageJourney.stage2_confirmGoal.explanation}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Chặng 2: Video bài học */}
          {stageIndex === 2 && (() => {
            const videoChapters = (sixStageJourney.stage3_video.timestamps && sixStageJourney.stage3_video.timestamps.length > 0)
              ? sixStageJourney.stage3_video.timestamps
              : [
                  { label: 'Tình huống mở đầu', startSec: 0, endSec: 30 },
                  { label: 'Khám phá bí kíp', startSec: 30, endSec: 75 },
                  { label: 'Quy tắc 4 chìa khóa', startSec: 75, endSec: 120 },
                  { label: 'Thực hành cùng AKI', startSec: 120, endSec: 150 },
                  { label: 'Mẹo tránh lỗi đoán mò', startSec: 150, endSec: 175 },
                  { label: 'Tổng kết bài học', startSec: 175, endSec: 180 },
                ]

            const totalDurationSec = (sixStageJourney.stage3_video.durationSec && sixStageJourney.stage3_video.durationSec > 0)
              ? sixStageJourney.stage3_video.durationSec
              : (videoChapters.length > 0 ? (videoChapters[videoChapters.length - 1].endSec || 180) : 180)

            const currentChapterIndex = Math.max(0, videoChapters.findIndex(
              (c) => previewVideoSeekSec >= c.startSec && previewVideoSeekSec < (c.endSec || totalDurationSec)
            ))
            const currentChapter = videoChapters[currentChapterIndex] || videoChapters[0]

            const handleSeekPreviewVideo = (sec: number) => {
              setPreviewVideoSeekSec(sec)
            }

            const isDesktopVideoLayout = vp === 'pc' || vp === 'full'

            return (
              <div className={cn("w-full", isDesktopVideoLayout ? "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start" : "space-y-3")}>
                {/* Cột trái: Header Banner, Video Canvas Player, Stepper */}
                <div className={isDesktopVideoLayout ? "lg:col-span-8 space-y-3" : "space-y-3"}>
                  {/* Header Banner */}
                  <div className="rounded-2xl border-2 border-purple-200 bg-purple-50/70 p-3 sm:p-3.5 shadow-sm">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-black uppercase text-purple-700 flex items-center gap-1">
                        🎬 Chặng 3: Video bài giảng
                      </span>
                      <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                        {videoChapters.length} Mốc kiến thức
                      </span>
                    </div>
                    <h4 className="font-display text-sm sm:text-base font-black text-purple-950">
                      {sixStageJourney.stage3_video.title || 'Video bài giảng 4 Chìa Khóa'}
                    </h4>
                  </div>

                  {/* Khung Video Canvas Player */}
                  <div className="aspect-video w-full rounded-2xl bg-slate-900 grid place-items-center text-white relative overflow-hidden shadow-md max-h-[460px] border-2 border-slate-800">
                    {sixStageJourney.stage3_video.posterUrl && (
                      <img
                        src={sixStageJourney.stage3_video.posterUrl}
                        alt="Poster"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                      />
                    )}
                    <div className="relative z-10 flex flex-col items-center gap-2.5 text-center p-3">
                      <button
                        type="button"
                        onClick={() => setIsPlayingPreviewVideo(!isPlayingPreviewVideo)}
                        className="size-14 sm:size-16 rounded-full bg-brand-500/90 text-white hover:bg-brand-500 hover:scale-105 active:scale-95 transition-all shadow-clay grid place-items-center border-2 border-white/50 cursor-pointer"
                        title={isPlayingPreviewVideo ? "Tạm dừng preview" : "Phát video preview"}
                      >
                        {isPlayingPreviewVideo ? (
                          <Pause size={28} className="fill-white" />
                        ) : (
                          <Play size={28} className="fill-white ml-1" />
                        )}
                      </button>
                      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold tracking-wide text-white border border-white/20">
                        <span>Thời lượng: {totalDurationSec}s</span>
                        <span>•</span>
                        <span className="text-amber-400 font-mono">
                          Đang ở: {Math.floor(previewVideoSeekSec / 60)}:{String(previewVideoSeekSec % 60).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* THANH TIẾN TRÌNH STEPPER DÀN NGANG CHUẨN (Golden Milestone Stepper Bar) */}
                  <div
                    data-testid="video-timeline-stepper"
                    className="w-full rounded-2xl bg-amber-50/90 border-2 border-amber-200 px-3 py-2 sm:px-4 sm:py-2.5 shadow-xs shrink-0 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      {/* Nút Play / tua đầu */}
                      <button
                        type="button"
                        data-testid="video-timeline-play-btn"
                        onClick={() => handleSeekPreviewVideo((previewVideoSeekSec || 0) === 0 ? (videoChapters[1]?.startSec || 0) : 0)}
                        className="size-8 sm:size-9 rounded-xl sm:rounded-2xl bg-brand-500 text-white shadow-clay hover:bg-brand-600 active:scale-95 flex items-center justify-center cursor-pointer transition-all shrink-0"
                        aria-label="Tua lại từ đầu hoặc sang mốc tiếp theo"
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
                              width: `${Math.min(100, Math.max(4, (((previewVideoSeekSec || 0) / totalDurationSec) * 100)))}%`,
                            }}
                          />

                          {/* Numbered Chapter Markers */}
                          {videoChapters.map((m, idx) => {
                            const posPercent = Math.max(3, Math.min(97, (m.startSec / totalDurationSec) * 100))
                            const isPassed = (previewVideoSeekSec || 0) >= m.startSec
                            const isCurrent = currentChapterIndex === idx
                            return (
                              <button
                                key={idx}
                                type="button"
                                data-testid={`video-chapter-node-${idx + 1}`}
                                onClick={() => handleSeekPreviewVideo(m.startSec)}
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
                        {Math.floor((previewVideoSeekSec || 0) / 60)}:{String((previewVideoSeekSec || 0) % 60).padStart(2, '0')} / {Math.floor(totalDurationSec / 60)}:{String(totalDurationSec % 60).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Hàng nút phụ & tên mốc đang xem */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 border-t border-amber-200/60 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSeekPreviewVideo(0)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-xs sm:text-sm font-bold text-amber-900 hover:bg-amber-50 shadow-2xs transition cursor-pointer"
                          title="Xem lại từ đầu"
                        >
                          <RotateCcw size={13} className="text-amber-700" />
                          <span>Xem lại video</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => showToast(`🔊 AKI đang giảng mốc ${currentChapterIndex + 1}: ${currentChapter.label}`, 'info')}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-xs sm:text-sm font-bold text-amber-900 hover:bg-amber-50 shadow-2xs transition cursor-pointer"
                          title="Nghe AKI giảng bài"
                        >
                          <Volume2 size={13} className="text-brand-600" />
                          <span>Nghe AKI giảng</span>
                        </button>
                      </div>

                      {currentChapter && (
                        <div className="sr-only">
                          <span>🎯 Mốc {currentChapterIndex + 1}: {currentChapter.label}</span>
                          <span>Video gồm {videoChapters.length} mốc — con bấm tua xem lại bất kỳ lúc nào nhé!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cột phải: Danh sách phân đoạn chi tiết bài học & Cụm nút điều hướng */}
                <div className={isDesktopVideoLayout ? "lg:col-span-4 space-y-3" : "space-y-3"}>
                  {/* Danh sách phân đoạn chi tiết */}
                  {videoChapters.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-1.5 shadow-2xs">
                      <p className="text-[10px] font-black uppercase text-slate-600 flex items-center justify-between">
                        <span>Phân đoạn mốc bài học ({videoChapters.length}):</span>
                        <span className="text-[9px] font-medium text-slate-400">Bấm mốc để tua</span>
                      </p>
                      {videoChapters.map((ts, idx) => {
                        const isActive = currentChapterIndex === idx
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSeekPreviewVideo(ts.startSec)}
                            className={cn(
                              "w-full flex items-center justify-between text-xs font-semibold py-1.5 px-2 rounded-xl transition cursor-pointer text-left",
                              isActive
                                ? "bg-amber-100/70 text-amber-950 font-bold border border-amber-300/80"
                                : "text-slate-700 hover:bg-slate-50 border border-transparent"
                            )}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span className={cn(
                                "size-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                                isActive ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600"
                              )}>
                                {idx + 1}
                              </span>
                              <span className="truncate">{ts.label}</span>
                            </span>
                            <span className="text-slate-400 font-mono text-[10px] shrink-0 ml-2">
                              {Math.floor(ts.startSec / 60)}:{String(ts.startSec % 60).padStart(2, '0')} - {Math.floor((ts.endSec || totalDurationSec) / 60)}:{String((ts.endSec || totalDurationSec) % 60).padStart(2, '0')}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Footer chuyển chặng */}
                  <div className="shrink-0 flex justify-between items-center pt-1">
                    <button
                      type="button"
                      onClick={() => showToast('Học sinh bấm: Quay lại câu đố (Chặng 2)', 'info')}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                    >
                      Quay lại câu đố
                    </button>

                    <button
                      type="button"
                      onClick={() => showToast('Học sinh bấm: Làm bài test thử tài (Chặng 4)', 'info')}
                      className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-black rounded-xl shadow-clay border-b-[3px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white cursor-pointer transition-all"
                    >
                      <span>📝 Làm bài test thử tài →</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Chặng 3: Quiz */}
          {stageIndex === 3 && (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-3 shadow-sm">
                <span className="text-[10px] font-black uppercase text-indigo-700">📝 Bài test thử tài</span>
                <p className="font-display text-sm sm:text-base font-black text-indigo-950 mt-0.5">{sixStageJourney.stage4_quiz.title}</p>
                <span className="text-[10px] font-bold text-indigo-600">Đạt yêu cầu: {sixStageJourney.stage4_quiz.passScore} câu</span>
              </div>
              <div className="space-y-2.5">
                {sixStageJourney.stage4_quiz.questions.map((q, idx) => (
                  <div key={q.id || idx} className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-2xs">
                    <p className="font-bold text-slate-900 mb-2">{idx + 1}. {q.prompt}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={cn(
                            "px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between",
                            optIdx === q.correctIndex ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-50 text-slate-600"
                          )}
                        >
                          <span>{opt}</span>
                          {optIdx === q.correctIndex && <Check size={13} className="text-emerald-600 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chặng 4: Practice (Thực hành AI Studio) */}
          {stageIndex === 4 && (() => {
            const parts = (sixStageJourney.stage5_practice.practiceParts && sixStageJourney.stage5_practice.practiceParts.length > 0)
              ? sixStageJourney.stage5_practice.practiceParts
              : DEFAULT_PRACTICE_PARTS

            const fourKeys = sixStageJourney.stage5_practice.fourKeysOptions || DEFAULT_FOUR_KEYS_OPTIONS

            const currentEngineMode = sixStageJourney.stage5_practice.creativeEngineMode || 'magic-keys'
            const currentWhat = activeWhat || fourKeys.what?.[0] || 'Cái cốc sứ trắng'
            const currentHow = activeHow || fourKeys.how?.[0] || 'men bóng mẻ miệng'
            const currentAction = activeAction || fourKeys.action?.[0] || 'đang bốc khói nghi ngút'
            const currentWhere = activeWhere || fourKeys.where?.[0] || 'trên bàn gỗ mộc'

            return (
              <div className="space-y-3">
                <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/70 p-3 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-brand-700 flex items-center gap-1">
                      {currentEngineMode === 'creative-notebook' ? '🎒 Sổ Tay Sáng Tạo Ba Lô (Text Engine)' :
                       currentEngineMode === 'style-prism' ? '🔮 Lăng Kính Phù Thủy' :
                       currentEngineMode === 'prompt-doctor' ? '🩺 Bác Sĩ AKI' :
                       currentEngineMode === 'layer-stacking' ? '🎭 3 Tầng Sân Khấu' :
                       currentEngineMode === 'identity-lock' ? '🔒 Khóa Mật Mã & Biểu Cảm' :
                       currentEngineMode === 'card-forge' ? '🃏 Xưởng Đúc Thẻ Bài TCG' :
                       '🎨 Xưởng Sáng Tạo AI Kids'}
                    </span>
                    <h4 className="font-display text-sm sm:text-base font-black text-brand-950 mt-0.5">
                      {sixStageJourney.stage5_practice.subjectName || 'Chủ thể bài thực hành'}
                    </h4>
                  </div>
                  <span className="rounded-full bg-brand-200 text-brand-900 px-2.5 py-1 text-[10px] font-black shadow-2xs">
                    {sixStageJourney.stage5_practice.badge || 'Bài thực hành'}
                  </span>
                </div>

                {currentEngineMode === 'creative-notebook' ? (
                  <div className="w-full">
                    <CreativeNotebookEngine
                      className={!isWide ? "!flex !flex-col" : undefined}
                      characterName={sixStageJourney.stage5_practice.subjectName || 'Hồ sơ nhân vật'}
                      selectedSubject={sixStageJourney.stage5_practice.subjectName}
                      lessonId={stageCard?.id || card?.id || '3.1'}
                      currentPrompt=""
                      notebookConfig={
                        sixStageJourney.stage5_practice.notebookConfig ||
                        findIslandCurriculum({
                          id: stageCard?.id || card?.id,
                          slug: stageCard?.id || card?.id,
                          title: sixStageJourney.stage5_practice.subjectName,
                        })?.journey?.stage5_practice?.notebookConfig ||
                        DEFAULT_NOTEBOOK_CONFIGS['3.1']
                      }
                      onPromptChange={() => {}}
                      onSubmitNotebook={() => {
                        showToast('🎒 Đã cất tác phẩm vào Ba Lô Sáng Tạo!', 'success')
                      }}
                      onSaveDraft={() => {
                        showToast('Đã lưu bản nháp Sổ Tay Ba Lô!', 'info')
                      }}
                    />
                  </div>
                ) : (
                  /* 3 Cột của Xưởng Sáng Tạo AI Kids - Dàn ngang chuẩn Desktop khi xem PC/Tablet */
                  <div className={cn(
                    "grid gap-3.5",
                    isWide ? "grid-cols-1 md:grid-cols-3 sm:gap-4" : "grid-cols-1"
                  )}>
                  {/* Cột 1: Danh sách các thẻ món đồ bé vẽ */}
                  <div className="flex flex-col gap-2 rounded-2xl border border-border bg-slate-50/70 p-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                        🎒 Món đồ bé vẽ ({parts.length})
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">Click chọn</span>
                    </div>
                    <div className="space-y-1.5">
                      {parts.map((part, pIdx) => {
                        const isSelected = pIdx === selectedPartIndex
                        return (
                          <div
                            key={part.partNumber || pIdx}
                            onClick={() => setSelectedPartIndex(pIdx)}
                            className={cn(
                              "rounded-xl p-2.5 border transition flex items-center justify-between gap-2 shadow-2xs cursor-pointer hover:border-brand-300",
                              isSelected ? "border-brand-500 bg-brand-50/95 ring-2 ring-brand-300/80" : "border-border bg-white hover:bg-slate-50"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="size-8 rounded-lg bg-white border border-border/80 grid place-items-center text-sm shadow-2xs shrink-0">
                                {part.icon || part.emoji || '🎨'}
                              </span>
                              <div className="min-w-0">
                                <span className="text-[8px] font-black uppercase tracking-wider text-brand-700 block whitespace-nowrap">
                                  THỰC HÀNH 0{part.partNumber || pIdx + 1}
                                </span>
                                <span className="text-[11px] sm:text-xs font-bold text-slate-900 truncate block">
                                  {part.title}
                                </span>
                              </div>
                            </div>
                            {isSelected ? (
                              <span className="rounded bg-brand-600 text-white text-[8px] font-black px-1.5 py-0.5 shrink-0 whitespace-nowrap">
                                ĐANG VẼ
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-slate-400 shrink-0">
                                Chọn
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Cột 2: Bàn phím Thực hành Tương ứng Engine đang chọn */}
                  {currentEngineMode === 'style-prism' ? (() => {
                    const styles = (sixStageJourney.stage5_practice.stylePrismOptions && sixStageJourney.stage5_practice.stylePrismOptions.length > 0)
                      ? sixStageJourney.stage5_practice.stylePrismOptions
                      : DEFAULT_STYLE_PRISM_OPTIONS
                    const currentActiveStyle = activeStylePrism || styles[0]?.name || 'Đất nặn Claymation'

                    return (
                      <div className="flex flex-col gap-2.5 rounded-2xl border border-purple-200 bg-purple-50/70 p-3 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-purple-200/60 pb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1">
                            🔮 Lăng Kính Phong Cách
                          </span>
                          <span className="text-[9px] font-black text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded-full">
                            {styles.length === 4 ? '4 Phong Cách' : `${styles.length} Phong Cách`}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {styles.map((style) => {
                            const isSelected = currentActiveStyle === style.name
                            return (
                              <div
                                key={style.id}
                                onClick={() => setActiveStylePrism(style.name)}
                                className={cn(
                                  "rounded-xl p-2.5 border transition flex items-center justify-between gap-2 shadow-2xs cursor-pointer",
                                  isSelected
                                    ? "border-purple-500 bg-white ring-2 ring-purple-300"
                                    : "border-purple-200 bg-white/80 hover:bg-white"
                                )}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="size-8 rounded-lg bg-purple-100 border border-purple-200 grid place-items-center text-sm shrink-0">
                                    {style.icon || '🎨'}
                                  </span>
                                  <div className="min-w-0">
                                    <span className="text-[11px] font-black text-purple-950 block truncate">
                                      {style.name}
                                    </span>
                                    <span className="text-[9px] font-medium text-slate-500 block truncate">
                                      {style.desc}
                                    </span>
                                  </div>
                                </div>
                                {isSelected && (
                                  <span className="rounded bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 shrink-0">
                                    ĐANG CHỌN
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        <div className="rounded-xl border border-purple-200 bg-white p-2.5 shadow-2xs">
                          <span className="text-[8px] font-black uppercase text-purple-600 block mb-1">✨ Câu lệnh biến hóa:</span>
                          <p className="text-[10.5px] sm:text-xs font-bold text-slate-800 leading-snug">
                            ✨ <span className="text-purple-700 font-extrabold">{sixStageJourney.stage5_practice.subjectName || 'Chủ thể'}</span>, phong cách <span className="text-purple-900 font-black">{currentActiveStyle}</span>
                          </p>
                        </div>
                      </div>
                    )
                  })() : currentEngineMode === 'prompt-doctor' ? (() => {
                    const doctorCase = sixStageJourney.stage5_practice.promptDoctorCase || DEFAULT_PROMPT_DOCTOR_CASE
                    const cures = (doctorCase.cureCards && doctorCase.cureCards.length > 0)
                      ? doctorCase.cureCards
                      : DEFAULT_PROMPT_DOCTOR_CASE.cureCards
                    const currentActiveCure = activeCure || cures[0] || 'Kê đơn 5 ngón tay đầy đủ chuẩn xác'

                    return (
                      <div className="flex flex-col gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/70 p-3 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-rose-200/60 pb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-rose-900 flex items-center gap-1">
                            🩺 Bác Sĩ AKI Bắt Bệnh
                          </span>
                          <span className="text-[9px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded-full">
                            Kê Đơn Thuốc
                          </span>
                        </div>

                        <div className="rounded-xl border border-rose-200 bg-white p-2.5 shadow-2xs">
                          <div className="flex items-center gap-1 text-[9px] font-black text-rose-700 mb-0.5">
                            <AlertTriangle size={12} />
                            <span>HỒ SƠ BỆNH ÁN TRANH HỎNG{doctorCase.caseTitle ? `: ${doctorCase.caseTitle}` : ''}</span>
                          </div>
                          <p className="text-[10px] text-slate-700 font-bold leading-relaxed">
                            {doctorCase.symptom || 'Tranh vẽ chú mèo thiếu mất tai và bàn tay bị biến dạng chỉ có 3 ngón tay! Bé hãy kê đơn thuốc chữa lành nhé!'}
                          </p>
                          {doctorCase.originalPrompt && (
                            <p className="text-[9px] font-mono text-rose-800 bg-rose-50 rounded px-1.5 py-0.5 mt-1 truncate">
                              Câu lệnh lỗi: {doctorCase.originalPrompt}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase text-rose-900 block">💊 Tủ thuốc thẻ chữ chữa lành:</span>
                          {cures.map((cure, cIdx) => {
                            const isSelected = currentActiveCure === cure
                            return (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => setActiveCure(cure)}
                                className={cn(
                                  "w-full rounded-xl p-2 border text-left transition flex items-center justify-between gap-2 shadow-2xs cursor-pointer",
                                  isSelected
                                    ? "border-rose-500 bg-rose-500 text-white font-bold"
                                    : "border-rose-200 bg-white text-rose-950 hover:bg-rose-50 font-semibold"
                                )}
                              >
                                <span className="text-[10px]">{cure}</span>
                                {isSelected && <Check size={12} className="shrink-0" />}
                              </button>
                            )
                          })}
                        </div>

                        <div className="rounded-xl border border-rose-200 bg-white p-2.5 shadow-2xs">
                          <span className="text-[8px] font-black uppercase text-rose-600 block mb-1">✨ Đơn thuốc đã kê:</span>
                          <p className="text-[10.5px] sm:text-xs font-bold text-slate-800 leading-snug">
                            ✨ <span className="text-rose-700 font-extrabold">{sixStageJourney.stage5_practice.subjectName || 'Chủ thể'}</span> + <span className="text-emerald-700 font-black">{currentActiveCure}</span>
                          </p>
                        </div>
                      </div>
                    )
                  })() : currentEngineMode === 'layer-stacking' ? (() => {
                    const layers = sixStageJourney.stage5_practice.layerStackingOptions || DEFAULT_LAYER_STACKING_OPTIONS
                    const bgList = (layers.background && layers.background.length > 0) ? layers.background : DEFAULT_LAYER_STACKING_OPTIONS.background
                    const heroList = (layers.hero && layers.hero.length > 0) ? layers.hero : DEFAULT_LAYER_STACKING_OPTIONS.hero
                    const fgList = (layers.foreground && layers.foreground.length > 0) ? layers.foreground : DEFAULT_LAYER_STACKING_OPTIONS.foreground

                    return (
                      <div className="flex flex-col gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                            🎭 3 Tầng Sân Khấu
                          </span>
                          <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                            Bố Cục 1/3
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="rounded-xl border border-emerald-200 bg-white p-2">
                            <span className="text-[9px] font-black text-emerald-900 uppercase block mb-1">🌄 Tầng 1: Hậu cảnh (Background)</span>
                            <div className="text-[10px] font-bold text-slate-700 bg-emerald-50/60 rounded-md p-1.5">
                              {bgList[0]}
                            </div>
                          </div>

                          <div className="rounded-xl border border-emerald-400 bg-emerald-100/60 p-2 ring-1 ring-emerald-300">
                            <span className="text-[9px] font-black text-emerald-950 uppercase block mb-1">⭐ Tầng 2: Ngôi sao 1/3 (Center)</span>
                            <div className="text-[10px] font-black text-emerald-900 bg-white rounded-md p-1.5">
                              {heroList[0] || `${sixStageJourney.stage5_practice.subjectName || 'Nhân vật chính'} ở vị trí điểm vàng 1/3`}
                            </div>
                          </div>

                          <div className="rounded-xl border border-emerald-200 bg-white p-2">
                            <span className="text-[9px] font-black text-emerald-900 uppercase block mb-1">🌿 Tầng 3: Tiền cảnh (Foreground)</span>
                            <div className="text-[10px] font-bold text-slate-700 bg-emerald-50/60 rounded-md p-1.5">
                              {fgList[0]}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-emerald-200 bg-white p-2.5 shadow-2xs">
                          <span className="text-[8px] font-black uppercase text-emerald-700 block mb-1">✨ Bố cục không gian ghép:</span>
                          <p className="text-[10.5px] sm:text-xs font-bold text-slate-800 leading-snug">
                            ✨ <span className="text-emerald-800 font-extrabold">{heroList[0] || (sixStageJourney.stage5_practice.subjectName || 'Nhân vật')}</span>, hậu cảnh {bgList[0]}, tiền cảnh {fgList[0]}
                          </p>
                        </div>
                      </div>
                    )
                  })() : currentEngineMode === 'identity-lock' ? (() => {
                    const lockedFeats = (sixStageJourney.stage5_practice.lockedFeatures && sixStageJourney.stage5_practice.lockedFeatures.length > 0)
                      ? sixStageJourney.stage5_practice.lockedFeatures
                      : DEFAULT_LOCKED_FEATURES
                    const expressions = (sixStageJourney.stage5_practice.expressionOptions && sixStageJourney.stage5_practice.expressionOptions.length > 0)
                      ? sixStageJourney.stage5_practice.expressionOptions
                      : DEFAULT_EXPRESSIONS
                    const currentActiveExpr = activeExpression || expressions[0] || '😊 Cười tít mắt vui vẻ'

                    return (
                      <div className="flex flex-col gap-2.5 rounded-2xl border border-cyan-200 bg-cyan-50/70 p-3 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-cyan-200/60 pb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-900 flex items-center gap-1">
                            🔒 Khóa Mật Mã & Biểu Cảm
                          </span>
                          <span className="text-[9px] font-black text-cyan-700 bg-cyan-100 px-1.5 py-0.2 rounded-full">
                            ADN Nhân Vật
                          </span>
                        </div>

                        <div className="rounded-xl border border-cyan-200 bg-white p-2">
                          <span className="text-[9px] font-black text-cyan-900 uppercase block mb-1">🔒 3 Mật mã ADN bất biến:</span>
                          <div className="space-y-1">
                            {lockedFeats.slice(0, 3).map((feat, fIdx) => (
                              <div key={fIdx} className="text-[9.5px] font-bold text-cyan-950 bg-cyan-50/80 rounded px-2 py-0.5 border border-cyan-100 flex items-center gap-1">
                                <span>🔒</span>
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-xl border border-cyan-200 bg-white p-2">
                          <span className="text-[9px] font-black text-cyan-900 uppercase block mb-1">🎡 Bánh xe {expressions.length} biểu cảm:</span>
                          <div className="grid grid-cols-2 gap-1">
                            {expressions.map((expr, idx) => {
                              const isSelected = currentActiveExpr === expr
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setActiveExpression(expr)}
                                  className={cn(
                                    "text-[9.5px] font-bold px-2 py-1 rounded-md border transition cursor-pointer text-left truncate",
                                    isSelected
                                      ? "bg-cyan-500 text-white border-cyan-600 shadow-2xs"
                                      : "bg-white text-cyan-950 border-cyan-200 hover:bg-cyan-50"
                                  )}
                                >
                                  {expr}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div className="rounded-xl border border-cyan-200 bg-white p-2.5 shadow-2xs">
                          <span className="text-[8px] font-black uppercase text-cyan-600 block mb-1">✨ Câu lệnh khóa ADN:</span>
                          <p className="text-[10.5px] sm:text-xs font-bold text-slate-800 leading-snug">
                            ✨ <span className="text-cyan-800 font-extrabold">{sixStageJourney.stage5_practice.subjectName || 'Nhân vật'}</span> (Khóa 3 ADN), biểu cảm <span className="text-cyan-950 font-black">{currentActiveExpr}</span>
                          </p>
                        </div>
                      </div>
                    )
                  })() : currentEngineMode === 'card-forge' ? (() => {
                    const cardForge = sixStageJourney.stage5_practice.cardForgeOptions || DEFAULT_CARD_FORGE_OPTIONS
                    const elements = (cardForge.elements && cardForge.elements.length > 0) ? cardForge.elements : DEFAULT_CARD_FORGE_OPTIONS.elements
                    const stats = cardForge.stats || DEFAULT_CARD_FORGE_OPTIONS.stats
                    const cardBorder = cardForge.cardBorder || DEFAULT_CARD_FORGE_OPTIONS.cardBorder
                    const currentActiveElement = activeCardElement || elements[0]?.name || 'Hệ Hỏa (Lửa Đỏ)'

                    return (
                      <div className="flex flex-col gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/70 p-3 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-amber-200/60 pb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                            🃏 Xưởng Đúc Thẻ Bài TCG
                          </span>
                          <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                            Chiến Tướng
                          </span>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-white p-2">
                          <span className="text-[9px] font-black text-amber-900 uppercase block mb-1">⚡ Hệ Nguyên Tố:</span>
                          <div className="grid grid-cols-2 gap-1">
                            {elements.map((elem, idx) => {
                              const isSelected = currentActiveElement === elem.name
                              return (
                                <button
                                  key={elem.id || idx}
                                  type="button"
                                  onClick={() => setActiveCardElement(elem.name)}
                                  className={cn(
                                    "text-[9.5px] font-bold px-2 py-1 rounded-md border transition cursor-pointer text-left flex items-center gap-1",
                                    isSelected
                                      ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                                      : "bg-white text-amber-950 border-amber-200 hover:bg-amber-50"
                                  )}
                                >
                                  <span>{elem.icon}</span>
                                  <span className="truncate">{elem.name}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-white p-2">
                          <span className="text-[9px] font-black text-amber-900 uppercase block mb-1">📊 Chỉ số chiến đấu & Khung thẻ:</span>
                          <div className="flex items-center justify-around gap-1 text-[10px] font-black py-1 bg-amber-50 rounded-lg">
                            <span className="text-rose-600">⚔️ ATK: {stats.atk}</span>
                            <span className="text-sky-600">🛡️ DEF: 6</span>
                            <span className="text-purple-600">🔮 MP: 6</span>
                          </div>
                          <div className="mt-1 text-[9px] text-center font-bold text-amber-800 bg-amber-100/60 rounded px-1.5 py-0.5">
                            ✨ Khung {cardBorder} ma thuật lấp lánh
                          </div>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-white p-2.5 shadow-2xs">
                          <span className="text-[8px] font-black uppercase text-amber-700 block mb-1">✨ Thẻ bài TCG đúc hoàn thành:</span>
                          <p className="text-[10.5px] sm:text-xs font-bold text-slate-800 leading-snug">
                            ✨ Thẻ bài TCG <span className="text-amber-900 font-extrabold">{sixStageJourney.stage5_practice.subjectName || 'Chiến Tướng'}</span>, <span className="text-amber-800 font-black">{currentActiveElement}</span>, ATK {stats.atk} DEF 6 MP 6
                          </p>
                        </div>
                      </div>
                    )
                  })() : (
                    /* Mặc định: Bàn phím 4 Chìa Khóa Ma Thuật */
                    <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-slate-50/70 p-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                          🎹 Bàn phím 4 Chìa Khóa
                        </span>
                        <span className="text-[9px] font-black text-brand-700 bg-brand-100 px-1.5 py-0.2 rounded-full">
                          SSOT
                        </span>
                      </div>

                      <div className="space-y-2">
                        {/* 1. Cái gì */}
                        <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-2">
                          <span className="text-[9px] font-black text-sky-900 uppercase block mb-1">🔑 1. Cái gì?</span>
                          <div className="flex flex-wrap gap-1">
                            {(fourKeys.what || []).map((t, idx) => {
                              const isSelected = currentWhat === t
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setActiveWhat(t)}
                                  className={cn(
                                    "text-[10px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded-md border transition cursor-pointer text-left",
                                    isSelected
                                      ? "bg-sky-500 text-white border-sky-600 shadow-2xs ring-1 ring-sky-300"
                                      : "bg-white text-sky-900 border-sky-200 hover:bg-sky-100/70"
                                  )}
                                >
                                  {t}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* 2. Trông thế nào */}
                        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-2">
                          <span className="text-[9px] font-black text-amber-900 uppercase block mb-1">🔑 2. Trông thế nào?</span>
                          <div className="flex flex-wrap gap-1">
                            {(fourKeys.how || []).map((t, idx) => {
                              const isSelected = currentHow === t
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setActiveHow(t)}
                                  className={cn(
                                    "text-[10px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded-md border transition cursor-pointer text-left",
                                    isSelected
                                      ? "bg-amber-500 text-white border-amber-600 shadow-2xs ring-1 ring-amber-300"
                                      : "bg-white text-amber-900 border-amber-200 hover:bg-amber-100/70"
                                  )}
                                >
                                  {t}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* 3. Đang làm gì */}
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2">
                          <span className="text-[9px] font-black text-emerald-900 uppercase block mb-1">🔑 3. Đang làm gì?</span>
                          <div className="flex flex-wrap gap-1">
                            {(fourKeys.action || []).map((t, idx) => {
                              const isSelected = currentAction === t
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setActiveAction(t)}
                                  className={cn(
                                    "text-[10px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded-md border transition cursor-pointer text-left",
                                    isSelected
                                      ? "bg-emerald-500 text-white border-emerald-600 shadow-2xs ring-1 ring-emerald-300"
                                      : "bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-100/70"
                                  )}
                                >
                                  {t}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* 4. Ở đâu */}
                        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-2">
                          <span className="text-[9px] font-black text-rose-900 uppercase block mb-1">🔑 4. Ở đâu?</span>
                          <div className="flex flex-wrap gap-1">
                            {(fourKeys.where || []).map((t, idx) => {
                              const isSelected = currentWhere === t
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setActiveWhere(t)}
                                  className={cn(
                                    "text-[10px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded-md border transition cursor-pointer text-left",
                                    isSelected
                                      ? "bg-rose-500 text-white border-rose-600 shadow-2xs ring-1 ring-rose-300"
                                      : "bg-white text-rose-900 border-rose-200 hover:bg-rose-100/70"
                                  )}
                                >
                                  {t}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Câu lệnh đang ghép thời gian thực */}
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] font-black uppercase text-slate-500 block">✨ Câu lệnh đang ghép:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveWhat(null)
                              setActiveHow(null)
                              setActiveAction(null)
                              setActiveWhere(null)
                            }}
                            className="flex items-center gap-0.5 text-[9px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Đặt lại câu lệnh"
                          >
                            <RotateCcw size={9} />
                            <span>Đặt lại</span>
                          </button>
                        </div>
                        <p className="text-[10.5px] sm:text-xs font-bold text-slate-800 leading-snug">
                          ✨ <span className="text-sky-700 font-extrabold">{currentWhat}</span> +{' '}
                          <span className="text-amber-700 font-extrabold">{currentHow}</span> +{' '}
                          <span className="text-emerald-700 font-extrabold">{currentAction}</span> +{' '}
                          <span className="text-rose-700 font-extrabold">{currentWhere}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Cột 3: Khung tranh AI Canvas & Thông tin AKI */}
                  <div className="flex flex-col justify-between gap-2.5 rounded-2xl border border-border bg-slate-50/70 p-3 shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between border-b border-border/60 pb-1.5 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                          🖼️ Khung Tranh AI Canvas
                        </span>
                        <span className="rounded-full bg-brand-100 text-brand-900 px-2 py-0.2 text-[9px] font-black">
                          {sixStageJourney.stage5_practice.badge || 'Bài thực hành'}
                        </span>
                      </div>

                      <div className="aspect-video w-full rounded-xl bg-slate-900 border border-slate-200 overflow-hidden relative shadow-clay-xs grid place-items-center">
                        {parts[selectedPartIndex]?.iconImage || sixStageJourney.stage5_practice.sampleUrl ? (
                          <img
                            src={parts[selectedPartIndex]?.iconImage || sixStageJourney.stage5_practice.sampleUrl}
                            alt="Tranh mẫu"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                        ) : (
                          <div className="text-center p-2">
                            <span className="text-2xl block mb-1">🎨</span>
                            <span className="text-[10px] text-slate-400 font-bold">Khung tranh bé sáng tạo</span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[8px] font-black text-white backdrop-blur-xs">
                          Còn 4/4 lượt vẽ
                        </div>
                      </div>

                      {sixStageJourney.stage5_practice.lockedFeatures?.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {sixStageJourney.stage5_practice.lockedFeatures.slice(0, 4).map((f, fIdx) => (
                            <span key={fIdx} className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded">
                              🔒 {f}
                            </span>
                          ))}
                        </div>
                      )}

                      {sixStageJourney.stage5_practice.akiMotto && (
                        <div className="mt-2.5 rounded-xl bg-white/90 p-2.5 border border-brand-100 shadow-2xs">
                          <p className="text-[10.5px] text-brand-900 font-semibold italic">
                            &ldquo;{sixStageJourney.stage5_practice.akiMotto}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        showToast(`🎨 AKI nhận câu thần chú: "${currentWhat} ${currentHow} ${currentAction} ${currentWhere}"!`, 'success')
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-sky-600 text-white font-black text-xs shadow-clay-sm flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-105 active:scale-98 transition mt-2"
                    >
                      <Sparkles size={14} />
                      <span>✨ AKI Vẽ Tranh (Còn 4/4 lượt)</span>
                    </button>
                  </div>
                </div>
                )}
              </div>
            )
          })()}

          {/* Chặng 6: Completion (Màn kết thúc chuẩn 100% giao diện học sinh) */}
          {stageIndex === 5 && (
            <div data-testid="stage-5-complete" className="w-full max-w-full flex flex-col gap-4 text-left">
              <div className={cn("grid gap-4 sm:gap-5 items-stretch w-full max-w-full", isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12")}>
                {/* Cột 1 (lg:col-span-6): Balo Sáng Tạo & Tác phẩm kiệt xuất */}
                <div className={cn("flex flex-col justify-between rounded-2xl border-2 border-amber-200 bg-amber-50/70 p-3.5 sm:p-4 min-w-0 max-w-full overflow-hidden", !isMobile && "lg:col-span-6")}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-black text-amber-900 uppercase tracking-wider mb-2 min-w-0">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <Award size={16} className="text-amber-600 shrink-0" />
                      <span>Tác phẩm kiệt xuất vừa cất vào Balo</span>
                    </span>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black shrink-0">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                      <span>{sixStageJourney.stage6_completion.rewardBadge.name || 'Huy hiệu bài học'}</span>
                    </div>
                  </div>

                  <div className="w-full flex-1 flex items-center justify-center my-auto min-h-0 py-1 overflow-hidden">
                    <div className="group relative flex aspect-[4/3] w-full max-w-xl items-center justify-center overflow-hidden rounded-2xl border-3 border-amber-300 bg-amber-100/40 shadow-clay sm:rounded-3xl">
                      <img
                        src={
                          sixStageJourney.stage6_completion.rewardBadge.iconUrl ||
                          sixStageJourney.stage1_goal.imageUrl ||
                          '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
                        }
                        alt="Kiệt tác của bé"
                        className="size-full object-cover cursor-pointer group-hover:scale-102 transition-transform duration-300"
                        onClick={() => {
                          const url =
                            sixStageJourney.stage6_completion.rewardBadge.iconUrl ||
                            sixStageJourney.stage1_goal.imageUrl ||
                            '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
                          if (url) setZoomedImage({ url, title: 'Tác phẩm kiệt xuất của bé' })
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const url =
                            sixStageJourney.stage6_completion.rewardBadge.iconUrl ||
                            sixStageJourney.stage1_goal.imageUrl ||
                            '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
                          if (url) setZoomedImage({ url, title: 'Tác phẩm kiệt xuất của bé' })
                        }}
                        className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded-xl backdrop-blur-xs flex items-center gap-1 opacity-90 hover:opacity-100 transition shadow-xs cursor-pointer z-10"
                        title="Xem ảnh phóng to"
                      >
                        <span>🔍 Phóng to</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium italic bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200/60 w-full text-center mt-2 truncate">
                    &ldquo;{sixStageJourney.stage1_goal.title || 'Tác phẩm sáng tạo AI Kids'}&rdquo;
                  </p>
                </div>

                {/* Cột 2 (lg:col-span-6): Vinh danh, Tiêu đề, Lời chúc & Nút điều hướng */}
                <div className={cn("flex flex-col justify-center gap-3 text-center sm:gap-3.5 min-w-0 max-w-full", !isMobile && "lg:col-span-6 lg:text-left")}>
                  <div className="inline-flex items-center gap-1.5 self-center rounded-full border border-amber-300/60 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 sm:text-sm lg:self-start">
                    <Trophy size={13} className="text-amber-600" />
                    <span>Chặng 6: Hoàn thành bài học</span>
                  </div>

                  {/* Vinh danh: Cúp vàng đất nặn 3D Hallmark Soft Clay + 3 Sao vàng */}
                  <div className="flex items-center justify-center gap-3.5 lg:justify-start">
                    <div className="relative shrink-0">
                      <img
                        src="/assets/trophy-clay-gold.png"
                        alt="Cúp Vàng Sáng Tạo"
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-clay select-none hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                      <div
                        data-testid="stage6-trophy-xp-badge"
                        className="absolute -top-1.5 -right-2 bg-brand-500 text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full shadow-clay-xs flex items-center gap-0.5 z-10"
                      >
                        <Sparkles size={11} />
                        +{sixStageJourney.stage6_completion.rewardBadge.xp || 50} XP
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: sixStageJourney.stage6_completion.rewardBadge.stars || 3 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          size={22}
                          className="fill-amber-400 text-amber-500 drop-shadow-md animate-pulse"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Tiêu đề & Lời chúc mừng */}
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                      {sixStageJourney.stage6_completion.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                      {sixStageJourney.stage6_completion.congratsMessage}
                    </p>
                  </div>

                  {/* Cụm Nút điều hướng kết thúc */}
                  <div className="flex flex-col gap-2 w-full pt-1">
                    {sixStageJourney.stage6_completion.nextLessonSlug ? (
                      <Button
                        variant="primary"
                        className="w-full py-2.5 text-xs sm:text-sm font-black rounded-2xl shadow-clay border-b-[4px] border-brand-700 bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>👉 Khám Phá Bài Tiếp Theo 🚀</span>
                      </Button>
                    ) : null}

                    <Button
                      variant="secondary"
                      className="w-full py-2 text-xs sm:text-sm font-black rounded-2xl border-2 border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Compass size={15} />
                      <span>🗺️ Trở Về Bản Đồ Đảo</span>
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>🔄 Học Lại Bài Này</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {stageCard && getStageBlocks(stageCard, stageIndex).some((block) => !block.id.startsWith('course-goal-') && !block.id.startsWith('course-confirm-')) && (
            <div className="mt-4 border-t border-sky-100 pt-4">
              <StudentStageBlocksView
                card={{ ...stageCard, contentBlocks: getStageBlocks(stageCard, stageIndex).filter((block) => !block.id.startsWith('course-goal-') && !block.id.startsWith('course-confirm-')) }}
                stageIndex={stageIndex}
                isMobile={isMobile}
              />
            </div>
          )}
        </div>
      )
    }

    return (
      <aside className="ui-card min-w-0 h-fit overflow-hidden p-4 lg:sticky lg:top-4" aria-label={`Xem trước ${stageName} trên màn học sinh`}>
        {/* Header Preview với Viewport Selector */}
        {!hideHeaderToolbar && (
          <div className="flex flex-col gap-2 pb-2.5 border-b border-border/80">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-sky-700">
                <Eye size={15} /> Xem trước học sinh (Đảo AIKids)
              </p>
              <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-black text-brand-800">
                Chặng {stageIndex + 1}/6
              </span>
            </div>

            {/* Thanh công cụ Viewport Selector trên header preview */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 border border-slate-200/80 text-[10.5px]">
                <button
                  type="button"
                  onClick={() => setViewport('mobile')}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md font-bold transition cursor-pointer",
                    activeViewport === 'mobile' ? "bg-white text-brand-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  )}
                  title="Xem dạng Mobile (375px)"
                >
                  <Smartphone size={12} />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewport('tablet')}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md font-bold transition cursor-pointer",
                    activeViewport === 'tablet' ? "bg-white text-brand-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  )}
                  title="Xem dạng iPad (768px)"
                >
                  <Tablet size={12} />
                  <span>iPad</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewport('pc')}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md font-bold transition cursor-pointer",
                    activeViewport === 'pc' ? "bg-white text-brand-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  )}
                  title="Xem dạng PC (1024px+)"
                >
                  <Monitor size={12} />
                  <span>PC</span>
                </button>
              </div>

              {/* Nút nổi bật: ⛶ Toàn màn hình */}
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-brand-600 hover:from-sky-700 hover:to-brand-700 text-white px-2.5 py-1 text-[10.5px] font-black shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
                title="Phóng to toàn màn hình (Fullscreen Modal)"
              >
                <Maximize2 size={13} />
                <span>Toàn màn hình</span>
              </button>
              {onCollapse && !hideHeaderToolbar && (
                <button
                  type="button"
                  onClick={onCollapse}
                  className="flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 text-[10.5px] font-bold transition cursor-pointer shrink-0"
                  title="Thu gọn cột xem trước"
                >
                  <PanelRightClose size={12} />
                  <span>Thu gọn</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Nội dung xem trước Inline */}
        <div className={cn(
          hideHeaderToolbar
            ? "w-full transition-all text-left"
            : cn(
                "mt-3 transition-all",
                activeViewport === 'mobile' && "max-w-[385px] mx-auto preview-viewport-mobile",
                activeViewport === 'tablet' && "w-full overflow-x-auto",
                activeViewport === 'pc' && "w-full overflow-x-auto"
              )
        )}>
          {renderIslandStageContent(false, activeViewport)}
        </div>

        {/* Chế độ Xem Trước Toàn Màn Hình (Fullscreen Modal Preview) */}
        {isFullscreen && (
          <div
            className="fixed inset-0 z-50 flex flex-col bg-slate-900/25 backdrop-blur-md animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label={`Xem trước toàn màn hình: ${stageName}`}
          >
            {/* Thanh điều khiển trên cùng (Header Modal nền trắng Soft Clay) */}
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/80 bg-white/95 px-4 sm:px-6 text-slate-900 shadow-2xs z-10">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex size-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200 shrink-0">
                  <Eye size={18} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-slate-900 truncate flex items-center gap-2">
                    <span>👁️ Xem Trước Trải Nghiệm Học Sinh:</span>
                    <span className="text-brand-600 truncate">{stageName}</span>
                  </h2>
                  <span className="text-[11px] font-medium text-slate-500 block truncate">
                    Đảo AIKids · Chặng {stageIndex + 1}/6
                  </span>
                </div>
              </div>

              {/* Bộ nút chuyển kích thước xem thử */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setViewport('mobile')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                    activeViewport === 'mobile'
                      ? "bg-brand-500 text-white font-black shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  )}
                  title="Xem trước màn hình Điện thoại (375px)"
                >
                  <Smartphone size={14} />
                  <span className="hidden md:inline">📱 Điện thoại 375px</span>
                  <span className="md:hidden">375px</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewport('tablet')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                    activeViewport === 'tablet'
                      ? "bg-brand-500 text-white font-black shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  )}
                  title="Xem trước màn hình iPad / Máy tính bảng (768px)"
                >
                  <Tablet size={14} />
                  <span className="hidden md:inline">📱 iPad / Tablet 768px</span>
                  <span className="md:hidden">768px</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewport('pc')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                    activeViewport === 'pc'
                      ? "bg-brand-500 text-white font-black shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  )}
                  title="Xem trước màn hình Máy tính PC (1200px)"
                >
                  <Monitor size={14} />
                  <span className="hidden md:inline">💻 Máy tính PC 1200px</span>
                  <span className="md:hidden">1200px</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewport('full')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                    activeViewport === 'full'
                      ? "bg-brand-500 text-white font-black shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  )}
                  title="Xem trước màn hình Tràn viền (100%)"
                >
                  <Maximize2 size={14} />
                  <span className="hidden md:inline">🖥️ Full màn hình 100%</span>
                  <span className="md:hidden">100%</span>
                </button>
              </div>

              {/* Nút đóng Esc */}
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 text-xs border border-slate-200 transition cursor-pointer shadow-xs shrink-0"
                title="Đóng chế độ xem trước (Esc)"
              >
                <X size={15} />
                <span className="hidden sm:inline">✕ Đóng (Esc)</span>
              </button>
            </header>

            {/* Vùng chứa nội dung xem trước (Canvas area) */}
            <div className="flex-1 bg-slate-100/70 p-4 sm:p-6 overflow-y-auto flex justify-center items-start">
              {activeViewport === 'mobile' ? (
                <div className="w-[375px] max-w-full rounded-[2.5rem] border-[6px] border-slate-300 bg-white shadow-2xl overflow-hidden flex flex-col shrink-0 my-auto sm:my-0 preview-viewport-mobile">
                  {/* Tai thỏ / Dynamic Island / rãnh loa thoại */}
                  <div className="h-5 flex justify-center items-center py-1 bg-slate-100 border-b border-slate-200 shrink-0">
                    <div className="w-16 h-1 rounded-full bg-slate-300" />
                  </div>
                  {/* Vùng xem trước bên trong điện thoại có scroll */}
                  <div className="overflow-y-auto max-h-[75vh] p-3 text-left">
                    {renderIslandStageContent(true, activeViewport)}
                  </div>
                </div>
              ) : activeViewport === 'tablet' ? (
                <div className="w-[768px] max-w-full rounded-2xl border-4 border-slate-300 bg-white shadow-xl overflow-hidden p-4 shrink-0">
                  {renderIslandStageContent(true, activeViewport)}
                </div>
              ) : (
                <div className={cn(
                  "w-full rounded-2xl border-2 border-slate-200 bg-white shadow-lg p-6 shrink-0",
                  activeViewport === 'full' ? "max-w-[1600px]" : "max-w-[1240px]"
                )}>
                  {renderIslandStageContent(true, activeViewport)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal phóng to ảnh */}
        {zoomedImage && (
          <AdventureModal
            open={!!zoomedImage}
            onClose={() => setZoomedImage(null)}
            title={zoomedImage.title || 'Chi tiết ảnh'}
          >
            <img src={zoomedImage.url} alt="Chi tiết" className="w-full h-auto rounded-xl" />
          </AdventureModal>
        )}
      </aside>
    )
  }

  if (!card) return null
  const presentation = LEARN_KIND_PRESENTATION[card.kind] ?? LEARN_KIND_PRESENTATION.example
  const KindIcon = presentation.icon
  const stageName = AIKI_STAGE_NAMES[stageIndex] ?? `Chặng ${stageIndex + 1}`
  const stageBlocks = getStageBlocks(card, stageIndex)

  const renderAikiStageContent = (isFs: boolean, vp: PreviewViewportMode) => {
    const isMobile = vp === 'mobile'
    return (
    <article className={cn("rounded-2xl border-2 p-4 shadow-sm", presentation.tone, isFs ? "w-full" : "mt-3")}>
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
                const isTwoText = block.columns === 2 && !block.imageUrl
                return (
                  <div key={block.id} className={cn("rounded-xl border border-current/15 bg-white/70 p-2.5 items-center", isMobile ? "grid grid-cols-1 gap-2" : "grid grid-cols-2 gap-2")}>
                    <div>
                      {block.title && <h4 className="font-display text-xs font-bold text-text">{block.title}</h4>}
                      <p className="text-[11px] font-semibold text-text mt-0.5">{block.body || 'Nội dung giải thích...'}</p>
                    </div>
                    {isTwoText ? (
                      <div>
                        <p className="text-[11px] font-semibold text-text mt-0.5">{block.tip || 'Nội dung cột phải...'}</p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-lg aspect-video bg-slate-100 border border-slate-200 grid place-items-center">
                        {block.imageUrl ? (
                          <img src={block.imageUrl} alt={block.imageAlt || 'Media'} className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        ) : (
                          <span className="text-[10px] font-bold text-muted">Ảnh / Media</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              }

              if (block.type === 'layout-grid') {
                const items = (block.visualItems && block.visualItems.length > 0) ? block.visualItems : card.visualItems
                return (
                  <div key={block.id} className="rounded-xl border border-current/15 bg-white/70 p-2.5">
                    {block.title && <h4 className="font-display text-xs font-black text-text mb-1.5">{block.title}</h4>}
                    <div className={cn("grid gap-1.5", isMobile ? "grid-cols-1" : "grid-cols-3")}>
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

              if (block.type === 'layout-four-keys') {
                const items = (block.visualItems && block.visualItems.length > 0) ? block.visualItems : card.visualItems
                return (
                  <div key={block.id} className="rounded-xl border border-current/15 bg-white/70 p-2.5">
                    {block.title && <h4 className="font-display text-xs font-black text-text mb-1.5">{block.title}</h4>}
                    <div className={cn("grid gap-1.5", isMobile ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-4")}>
                      {items.map((item, vIdx) => (
                        <div key={vIdx} className="rounded-lg border border-amber-200 bg-amber-50/70 p-1.5 text-center">
                          <span className="inline-block rounded bg-amber-200 px-1 text-[8px] font-black text-amber-900">🔑 Khóa {vIdx + 1}</span>
                          <p className="text-[10px] font-black text-amber-950 truncate mt-0.5">{item.label}</p>
                          <p className="text-[9px] font-semibold text-amber-800 line-clamp-2">{item.text}</p>
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
                    <div className={cn("grid gap-1.5", isMobile ? "grid-cols-1" : "grid-cols-3")}>
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
                  <div key={block.id} className={cn("grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-2")}>
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
                  <div key={block.id} className={cn("grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-2")}>
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
                        <div className={cn("grid gap-2", isMobile ? "grid-cols-1" : "grid-cols-2")}>
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
    )
  }

    return (
      <aside className="ui-card min-w-0 h-fit overflow-hidden p-4 lg:sticky lg:top-4" aria-label={`Xem trước ${stageName} trên màn học sinh`}>
        {/* Header Preview với Viewport Selector */}
        {!hideHeaderToolbar && (
          <div className="flex flex-col gap-2 pb-2.5 border-b border-border/80">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-sky-700">
                <Eye size={15} /> Xem trước học sinh (10 Quy Tắc)
              </p>
              <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-black text-brand-800">
                Chặng {stageIndex + 1}/5
              </span>
            </div>

            {/* Thanh công cụ Viewport Selector trên header preview */}
            <div className="flex items-center justify-between gap-1.5 pt-0.5">
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 border border-slate-200/80 text-[10.5px]">
                <button
                  type="button"
                  onClick={() => setViewport('mobile')}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md font-bold transition cursor-pointer",
                    activeViewport === 'mobile' ? "bg-white text-brand-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  )}
                  title="Xem dạng Mobile (375px)"
                >
                  <Smartphone size={12} />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewport('tablet')}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md font-bold transition cursor-pointer",
                    activeViewport === 'tablet' ? "bg-white text-brand-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  )}
                  title="Xem dạng iPad (768px)"
                >
                  <Tablet size={12} />
                  <span>iPad</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewport('pc')}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md font-bold transition cursor-pointer",
                    activeViewport === 'pc' ? "bg-white text-brand-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  )}
                  title="Xem dạng PC (1024px+)"
                >
                  <Monitor size={12} />
                  <span>PC</span>
                </button>
              </div>

              {/* Nút nổi bật: ⛶ Toàn màn hình */}
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-brand-600 hover:from-sky-700 hover:to-brand-700 text-white px-2.5 py-1 text-[10.5px] font-black shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
                title="Phóng to toàn màn hình (Fullscreen Modal)"
              >
                <Maximize2 size={13} />
                <span>Toàn màn hình</span>
              </button>
              {onCollapse && !hideHeaderToolbar && (
                <button
                  type="button"
                  onClick={onCollapse}
                  className="flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 text-[10.5px] font-bold transition cursor-pointer shrink-0"
                  title="Thu gọn cột xem trước"
                >
                  <PanelRightClose size={12} />
                  <span>Thu gọn</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Nội dung xem trước Inline */}
        <div className={cn(
          hideHeaderToolbar
            ? "w-full transition-all text-left"
            : cn(
                "mt-3 transition-all",
                activeViewport === 'mobile' && "max-w-[385px] mx-auto preview-viewport-mobile",
                activeViewport === 'tablet' && "w-full overflow-x-auto",
                activeViewport === 'pc' && "w-full overflow-x-auto"
              )
        )}>
          {renderAikiStageContent(false, activeViewport)}
        </div>

        {/* Chế độ Xem Trước Toàn Màn Hình (Fullscreen Modal Preview) */}
        {isFullscreen && (
          <div
            className="fixed inset-0 z-50 flex flex-col bg-slate-900/25 backdrop-blur-md animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label={`Xem trước toàn màn hình: ${stageName}`}
          >
            {/* Thanh điều khiển trên cùng (Header Modal nền trắng Soft Clay) */}
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/80 bg-white/95 px-4 sm:px-6 text-slate-900 shadow-2xs z-10">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex size-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200 shrink-0">
                  <Eye size={18} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-slate-900 truncate flex items-center gap-2">
                    <span>👁️ Xem Trước Trải Nghiệm Học Sinh:</span>
                    <span className="text-brand-600 truncate">{stageName}</span>
                  </h2>
                  <span className="text-[11px] font-medium text-slate-500 block truncate">
                    Mười Quy Tắc Vàng · Chặng {stageIndex + 1}/5
                  </span>
                </div>
              </div>

              {/* Bộ nút chuyển kích thước xem thử */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setViewport('mobile')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                    activeViewport === 'mobile'
                      ? "bg-brand-500 text-white font-black shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  )}
                  title="Xem trước màn hình Điện thoại (375px)"
                >
                  <Smartphone size={14} />
                  <span className="hidden md:inline">📱 Điện thoại 375px</span>
                  <span className="md:hidden">375px</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewport('tablet')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                    activeViewport === 'tablet'
                      ? "bg-brand-500 text-white font-black shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  )}
                  title="Xem trước màn hình iPad / Máy tính bảng (768px)"
                >
                  <Tablet size={14} />
                  <span className="hidden md:inline">📱 iPad / Tablet 768px</span>
                  <span className="md:hidden">768px</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewport('pc')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                    activeViewport === 'pc'
                      ? "bg-brand-500 text-white font-black shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  )}
                  title="Xem trước màn hình Máy tính PC (1200px)"
                >
                  <Monitor size={14} />
                  <span className="hidden md:inline">💻 Máy tính PC 1200px</span>
                  <span className="md:hidden">1200px</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewport('full')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition cursor-pointer",
                    activeViewport === 'full'
                      ? "bg-brand-500 text-white font-black shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  )}
                  title="Xem trước màn hình Tràn viền (100%)"
                >
                  <Maximize2 size={14} />
                  <span className="hidden md:inline">🖥️ Full màn hình 100%</span>
                  <span className="md:hidden">100%</span>
                </button>
              </div>

              {/* Nút đóng Esc */}
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 text-xs border border-slate-200 transition cursor-pointer shadow-xs shrink-0"
                title="Đóng chế độ xem trước (Esc)"
              >
                <X size={15} />
                <span className="hidden sm:inline">✕ Đóng (Esc)</span>
              </button>
            </header>

            {/* Vùng chứa nội dung xem trước (Canvas area) */}
            <div className="flex-1 bg-slate-100/70 p-4 sm:p-6 overflow-y-auto flex justify-center items-start">
              {activeViewport === 'mobile' ? (
                <div className="w-[375px] max-w-full rounded-[2.5rem] border-[6px] border-slate-300 bg-white shadow-2xl overflow-hidden flex flex-col shrink-0 my-auto sm:my-0 preview-viewport-mobile">
                  {/* Tai thỏ / rãnh loa thoại */}
                  <div className="h-5 flex justify-center items-center py-1 bg-slate-100 border-b border-slate-200 shrink-0">
                    <div className="w-16 h-1 rounded-full bg-slate-300" />
                  </div>
                  {/* Vùng xem trước bên trong điện thoại có scroll */}
                  <div className="overflow-y-auto max-h-[75vh] p-3 text-left">
                    {renderAikiStageContent(true, activeViewport)}
                  </div>
                </div>
              ) : activeViewport === 'tablet' ? (
                <div className="w-[768px] max-w-full rounded-2xl border-4 border-slate-300 bg-white shadow-xl overflow-hidden p-4 shrink-0">
                  {renderAikiStageContent(true, activeViewport)}
                </div>
              ) : (
                <div className={cn(
                  "w-full rounded-2xl border-2 border-slate-200 bg-white shadow-lg p-6 shrink-0",
                  activeViewport === 'full' ? "max-w-[1600px]" : "max-w-[1240px]"
                )}>
                  {renderAikiStageContent(true, activeViewport)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal phóng to ảnh */}
        {zoomedImage && (
          <AdventureModal
            open={!!zoomedImage}
            onClose={() => setZoomedImage(null)}
            title={zoomedImage.title || 'Chi tiết ảnh'}
          >
            <img src={zoomedImage.url} alt="Chi tiết" className="w-full h-auto rounded-xl" />
          </AdventureModal>
        )}
      </aside>
    )
})

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

function FullStationPreview({
  draft,
  gameConfig,
  isIslandCourse,
}: {
  draft: LectureDraft
  gameConfig: CurriculumGameConfig
  isIslandCourse?: boolean
}) {
  const deferredDraft = useDeferredValue(draft)
  const isAiki = detectLessonFormat(deferredDraft.learnCards) === 'aiki-rule-5steps' || isAikiRuleLesson(deferredDraft.learnCards)
  const isCustomJourney = Boolean(deferredDraft.customJourneyStages && deferredDraft.customJourneyStages.length >= 3)
  const isIsland = Boolean(isIslandCourse || detectLessonFormat(deferredDraft.learnCards) === 'aiki-island-6steps' || deferredDraft.sixStageJourney)
  const [activeStage, setActiveStage] = useState<number>(0)
  const [previewSection, setPreviewSection] = useState<Section>('basics')
  const [viewport, setViewport] = useState<PreviewViewportMode>('pc')
  const goals = goalLines(deferredDraft.goalsText)
  const steps = goalLines(deferredDraft.practiceStepsText)
  const criteria = goalLines(deferredDraft.successCriteriaText)

  const renderViewportToolbar = () => (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-slate-100 p-2 border border-slate-200/80">
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 ml-1">
          <Eye size={14} className="text-brand-600" /> Chế độ xem thiết bị:
        </span>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => setViewport('mobile')}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer",
            viewport === 'mobile'
              ? "bg-brand-500 text-white shadow-xs font-black"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60"
          )}
          title="Xem dạng Điện thoại (375px)"
        >
          <Smartphone size={14} />
          <span className="hidden sm:inline">📱 Mobile 375px</span>
          <span className="sm:hidden">Mobile</span>
        </button>
        <button
          type="button"
          onClick={() => setViewport('tablet')}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer",
            viewport === 'tablet'
              ? "bg-brand-500 text-white shadow-xs font-black"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60"
          )}
          title="Xem dạng iPad / Máy tính bảng (768px)"
        >
          <Tablet size={14} />
          <span className="hidden sm:inline">📱 iPad / Tablet 768px</span>
          <span className="sm:hidden">Tablet</span>
        </button>
        <button
          type="button"
          onClick={() => setViewport('pc')}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer",
            viewport === 'pc'
              ? "bg-brand-500 text-white shadow-xs font-black"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60"
          )}
          title="Xem dạng Máy tính PC (1200px)"
        >
          <Monitor size={14} />
          <span className="hidden sm:inline">💻 Máy tính PC</span>
          <span className="sm:hidden">PC</span>
        </button>
        <button
          type="button"
          onClick={() => setViewport('full')}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer",
            viewport === 'full'
              ? "bg-brand-500 text-white shadow-xs font-black"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60"
          )}
          title="Xem dạng Tràn viền (100%)"
        >
          <Maximize2 size={14} />
          <span className="hidden sm:inline">🖥️ Full 100%</span>
          <span className="sm:hidden">Full</span>
        </button>
      </div>
    </div>
  )

  const wrapInViewport = (children: React.ReactNode) => {
    if (viewport === 'mobile') {
      return (
        <div className="w-[375px] max-w-full mx-auto rounded-[2.5rem] border-[6px] border-slate-300 bg-white shadow-2xl overflow-hidden flex flex-col my-3 text-left preview-viewport-mobile">
          <div className="h-5 flex justify-center items-center py-1 bg-slate-100 border-b border-slate-200 shrink-0">
            <div className="w-16 h-1 rounded-full bg-slate-300" />
          </div>
          <div className="station-preview-scroll overflow-y-auto max-h-[58vh] sm:max-h-[62vh] p-3 text-left">
            {children}
          </div>
        </div>
      )
    }

    if (viewport === 'tablet') {
      return (
        <div className="w-[768px] max-w-full mx-auto rounded-2xl border-4 border-slate-300 bg-white shadow-xl overflow-hidden p-3 sm:p-4 my-3 text-left">
          <div className="station-preview-scroll overflow-y-auto max-h-[58vh] sm:max-h-[62vh] pr-1 text-left">
            {children}
          </div>
        </div>
      )
    }

    return (
      <div className={cn(
        "w-full mx-auto rounded-2xl border-2 border-slate-200 bg-white shadow-sm p-3 sm:p-5 my-3 text-left",
        viewport === 'full' ? "max-w-full" : "max-w-[1200px]"
      )}>
        <div className="station-preview-scroll overflow-y-auto max-h-[58vh] sm:max-h-[62vh] pr-1 text-left">
          {children}
        </div>
      </div>
    )
  }

  if (isIsland) {
    const currentJourney = deferredDraft.sixStageJourney || resolveIslandSixStageJourney(deferredDraft as any)
    const islandCard = deferredDraft.learnCards[activeStage]
    const stageIcons = ['🎯', '🎬', '🔍', '✍️', '🎨', '🏆']
    return (
      <div className="text-left">
        {renderViewportToolbar()}

        {/* Navigation 6 chặng Đảo */}
        <nav className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-brand-200 bg-brand-50/70 p-2" aria-label="Chọn chặng Đảo muốn xem trước">
          {ISLAND_6_STAGE_NAMES.map((name, index) => {
            const isSelected = activeStage === index
            return (
              <button
                key={name}
                type="button"
                onClick={() => setActiveStage(index)}
                aria-current={isSelected ? 'page' : undefined}
                className={cn(
                  'flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-black transition cursor-pointer',
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-brand-900 bg-white/80 hover:bg-white border border-brand-200/60'
                )}
              >
                <span>{stageIcons[index]}</span>
                <span>Chặng {index + 1}: {name}</span>
              </button>
            )
          })}
        </nav>

        {wrapInViewport(
          <div>
            <StudentStagePreview
              stageIndex={activeStage}
              isIsland={true}
              sixStageJourney={currentJourney}
              stageCard={islandCard}
              viewport={viewport}
              hideHeaderToolbar={true}
            />

            {/* Điều hướng chuyển chặng */}
            <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3">
              <button
                type="button"
                disabled={activeStage === 0}
                onClick={() => setActiveStage((prev) => Math.max(0, prev - 1))}
                className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
              >
                ← Chặng trước
              </button>
              <span className="text-xs font-black text-brand-800">
                Chặng {activeStage + 1} / 6
              </span>
              <button
                type="button"
                disabled={activeStage === 5}
                onClick={() => setActiveStage((prev) => Math.min(5, prev + 1))}
                className="rounded-xl bg-brand-600 text-white px-3.5 py-1.5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-700 cursor-pointer shadow-xs"
              >
                Chặng tiếp theo →
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isAiki || isCustomJourney) {
    const customStages = resolveCourseJourneyStages(undefined, deferredDraft.lessonFormat, deferredDraft.customJourneyStages)
    const totalStages = customStages.length
    const defaultCards = createAikiRuleLearnCards()
    const card = deferredDraft.learnCards[activeStage] ?? defaultCards[activeStage]
    const stageIcons = ['🎬', '🖼️', '📜', '⚖️', '🏆', '🎨', '🌟']
    return (
      <div className="text-left">
        {renderViewportToolbar()}

        {/* Navigation các chặng */}
        <nav className="mb-4 flex gap-2 overflow-x-auto rounded-2xl border border-brand-200 bg-brand-50/70 p-2" aria-label="Chọn chặng muốn xem trước">
          {customStages.map((stage, index) => {
            const isSelected = activeStage === index
            return (
              <button
                key={stage.id || index}
                type="button"
                onClick={() => setActiveStage(index)}
                aria-current={isSelected ? 'page' : undefined}
                className={cn(
                  'flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-xs font-black transition cursor-pointer',
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-brand-900 bg-white/80 hover:bg-white border border-brand-200/60'
                )}
              >
                <span>{stageIcons[index % stageIcons.length]}</span>
                <span>{stage.index + 1}. {stage.shortTitle || stage.title}</span>
              </button>
            )
          })}
        </nav>

        {wrapInViewport(
          <div>
            {card && <StudentStagePreview card={card} stageIndex={activeStage} viewport={viewport} hideHeaderToolbar={true} />}

            {/* Điều hướng chuyển chặng */}
            <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3">
              <button
                type="button"
                disabled={activeStage === 0}
                onClick={() => setActiveStage((prev) => Math.max(0, prev - 1))}
                className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
              >
                ← Chặng trước
              </button>
              <span className="text-xs font-black text-brand-800">
                Chặng {activeStage + 1} / {totalStages}
              </span>
              <button
                type="button"
                disabled={activeStage === totalStages - 1}
                onClick={() => setActiveStage((prev) => Math.min(totalStages - 1, prev + 1))}
                className="rounded-xl bg-brand-600 text-white px-3.5 py-1.5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-700 cursor-pointer shadow-xs"
              >
                Chặng tiếp theo →
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="text-left">
      {renderViewportToolbar()}

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

      {wrapInViewport(
        <div className="grid gap-4">
          {previewSection === 'basics' && <section className="rounded-3xl border-2 border-brand-200 bg-brand-50 p-5 text-center">
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">Câu hỏi mở trạm</p>
            <h3 className="mt-2 font-display text-2xl text-brand-900">{deferredDraft.hook.trim() || 'Chưa có câu hỏi khởi động'}</h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {(goals.length ? goals : ['Chưa có mục tiêu học tập']).map((goal, index) => (
                <div key={`${index}-${goal}`} className="rounded-2xl bg-white px-3 py-3 text-sm font-bold text-text shadow-sm">
                  <span className="mr-2 text-coral-600">{index + 1}.</span>{goal}
                </div>
              ))}
            </div>
          </section>}

          {previewSection === 'content' && <StudentLearnPreview draft={deferredDraft} />}

          {previewSection === 'game' && (
            <div className="ui-card p-5">
              <div className="mb-4">
                <div className="companion-bubble" style={{ maxWidth: 'none', width: '100%' }}>
                  <p className="text-sm font-bold">{deferredDraft.gameInstruction || 'Chơi một lượt để ghi nhớ ý chính của bài!'}</p>
                </div>
              </div>
              <CurriculumGame
                gameType={deferredDraft.gameType}
                gameConfig={gameConfig}
                instruction={deferredDraft.gameInstruction}
                outcome={deferredDraft.gameOutcome}
                onComplete={() => undefined}
              />
              <p className="mt-4 rounded-xl bg-sun-50 px-3 py-3 text-center text-xs font-semibold text-sun-900">Chế độ xem trước: giáo viên có thể chơi thử, nhưng kết quả không được ghi vào tiến độ học sinh.</p>
            </div>
          )}

          {previewSection === 'practice' && <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,.85fr)]">
            <div className="grid gap-4">
            <section className="rounded-3xl border-2 border-mint-200 bg-mint-50 p-5">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-mint-700"><Palette size={16} /> Tự tay làm</p>
              <h3 className="mt-2 font-display text-xl text-text">{deferredDraft.product || 'Chưa đặt tên sản phẩm'}</h3>
              <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-relaxed text-text">{deferredDraft.practiceInstruction || 'Chưa có hướng dẫn thực hành.'}</p>
              {steps.length > 0 && <ol className="mt-3 grid gap-2">{steps.map((step, index) => <li key={step} className="rounded-xl bg-white px-3 py-2 text-xs font-bold"><span className="mr-2 text-mint-700">{index + 1}.</span>{step}</li>)}</ol>}
              {criteria.length > 0 && <div className="mt-3 rounded-xl border border-mint-200 bg-white p-3 text-xs font-semibold"><strong>Con tự kiểm tra:</strong> {criteria.join(' · ')}</div>}
            </section>
            <PracticeKindPreview draft={deferredDraft} />
            </div>
            <aside className="rounded-3xl border-2 border-border bg-white p-5">
              <p className="text-xs font-extrabold uppercase tracking-wide text-muted">Sau khi làm xong</p>
              <p className="mt-3 text-sm font-bold leading-relaxed text-text">Câu hỏi nhìn lại: {deferredDraft.reflectionPrompt || 'Chưa có câu hỏi giúp học sinh tự nhìn lại sản phẩm.'}</p>
              <p className="mt-3 rounded-xl bg-sun-50 px-3 py-3 text-xs font-semibold text-sun-900">Sản phẩm được lưu riêng tư và chỉ chia sẻ khi có luồng duyệt phù hợp.</p>
            </aside>
          </div>}

          {previewSection === 'check' && <section className="rounded-3xl border-2 border-coral-200 bg-coral-50 p-5">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-coral-700"><HelpCircle size={16} /> Thử thách cuối trạm</p>
            <p className="mt-2 text-sm font-bold text-text">{deferredDraft.checkQuestions.length || (deferredDraft.checkQuestion ? 1 : 0)} câu hỏi kiểm tra · Học sinh cần hoàn thành trước khi nhận thưởng.</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {(deferredDraft.checkQuestions.length ? deferredDraft.checkQuestions : deferredDraft.checkQuestion ? [{ prompt: deferredDraft.checkQuestion, options: [deferredDraft.checkOption1, deferredDraft.checkOption2, deferredDraft.checkOption3].filter(Boolean), answer: Number(deferredDraft.correctIndex), explain: deferredDraft.checkExplain }] : []).map((question, index) => (
                <article key={`${index}-${question.prompt}`} className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="font-extrabold text-text">{index + 1}. {question.prompt}</p>
                  <div className="mt-3 grid gap-2">{question.options.map((option, optionIndex) => <div key={`${optionIndex}-${option}`} className="rounded-xl border border-border px-3 py-2 text-sm font-semibold">{String.fromCharCode(65 + optionIndex)}. {option}</div>)}</div>
                  {question.explain && <p className="mt-3 text-xs font-semibold text-muted">Phản hồi sau khi trả lời: {question.explain}</p>}
                </article>
              ))}
            </div>
          </section>}
        </div>
      )}
    </div>
  )
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
  const currentLectureId = lecture?.id
  const prevLectureIdRef = useRef(currentLectureId)
  useEffect(() => {
    if (currentLectureId !== prevLectureIdRef.current) {
      prevLectureIdRef.current = currentLectureId
      const nextDraft = normalizeLectureDraft(lecture ?? emptyDraft(), courseId)
      initialDraftRef.current = nextDraft
      setDraft(nextDraft)
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
  }, [currentLectureId, lecture, courseId])

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
    if ((isIslandCourse || lessonFormat === 'aiki-island-6steps' || lessonFormat === 'aiki-rule-5steps' || isCustom) && (activeSection === 'content' || activeSection === 'game' || activeSection === 'practice' || activeSection === 'check')) {
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
        reward: draft.reward,
        duration: draft.duration,
        practiceKind: draft.practiceKind,
        lessonFormat: isIslandCourse ? 'aiki-island-6steps' : lessonFormat,
        sixStageJourney: finalJourney,
        metadata: {
          ...(draft as any).metadata,
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
                      placeholder="VD: Tả càng rõ, AKI vẽ càng đúng!"
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
                    <FormRow label="Phần thưởng trạm học">
                      <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 font-medium leading-relaxed">
                        <span className="text-base shrink-0">⭐</span>
                        <span>Đánh giá 1–3 Sao (tương ứng 30/60/100 XP) tự động theo 6 bước học tập (Lý thuyết, Bài test, AI Studio).</span>
                      </div>
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
          {isIslandCourse && activeSection.startsWith('stage-') && (() => {
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
                                  Chuyển đổi linh hoạt giữa 7 cơ chế chơi — Mọi nội dung (chủ thể, huy hiệu, thần chú AKI, món đồ bé vẽ) đều được tự động đồng bộ và giữ nguyên trọn vẹn!
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

                      {/* Khối Lời dẫn thử thách của AKI (Challenge Prompt) */}
                      <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/50 via-white to-indigo-50/30 p-4 shadow-clay-sm space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                            <span>🎯 Lời dẫn thử thách của AKI (Challenge Prompt)</span>
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
                              <span>Nghe thử giọng AKI</span>
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

                      {/* Lời thoại & Gợi ý từng lượt của AKI (Nâng cao) - Accordion tinh gọn */}
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
          {!isIslandCourse && (lessonFormat === 'aiki-rule-5steps' || activeSection.startsWith('stage-')) && (() => {
            const stageIndex = parseInt(activeSection.replace('stage-', ''), 10)
            const customStages = resolveCourseJourneyStages(courseId, lessonFormat, draft.customJourneyStages)
            const totalStages = customStages.length
            const defaultCards = createAikiRuleLearnCards()
            const card = draft.learnCards[stageIndex] ?? defaultCards[stageIndex]
            if (!card) return null
            const stageBlocks = getStageBlocks(card, stageIndex)

            const fallbackIcons = [Clapperboard, BrainCircuit, Lightbulb, ScanSearch, Trophy, Sparkles, Award]
            const ruleStageInfo = [
              { title: '1. Tình huống', icon: Clapperboard, desc: 'Mở đầu bằng câu chuyện/tình huống gần gũi kích thích sự tò mò.' },
              { title: '2. Câu đố AIKI', icon: BrainCircuit, desc: 'Thử thách trực giác: Trẻ quan sát 2 tranh vẽ A và B để chọn ra tranh độc nhất.' },
              { title: '3. Quy tắc', icon: Lightbulb, desc: 'Đúc kết bài học thành 1 quy tắc cốt lõi, dễ nhớ cho trẻ.' },
              { title: '4. Giải thích', icon: ScanSearch, desc: 'So sánh trực quan 2 mặt: Kho dữ liệu sao chép của AI vs Não sáng tạo của con.' },
              { title: '5. Chốt', icon: Trophy, desc: 'Tổng kết và trao huy hiệu/lời động viên tự hào cho bé.' },
            ]
            const stageDef = customStages[stageIndex]
            const stageInfo = stageDef
              ? {
                  title: `${stageDef.index + 1}. ${stageDef.shortTitle || stageDef.title}`,
                  icon: fallbackIcons[stageIndex % fallbackIcons.length] ?? Lightbulb,
                  desc: stageDef.desc || card.tip || '',
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
        description={lessonFormat === 'aiki-rule-5steps' ? 'Toàn bộ hành trình 5 chặng Quy tắc AIKI: Tình huống → Câu đố AIKI → Quy tắc → Giải thích → Chốt.' : 'Toàn bộ hành trình trong một trạm: mở bài → khám phá → chơi → thực hành → thử thách.'}
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
