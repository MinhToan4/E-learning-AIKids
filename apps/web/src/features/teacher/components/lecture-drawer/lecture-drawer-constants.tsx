import React from 'react'
import {
  BookOpen,
  Clapperboard,
  BrainCircuit,
  Lightbulb,
  ScanSearch,
  Trophy,
  Gamepad2,
  Palette,
  HelpCircle,
  Scale,
  ListChecks,
  PanelsTopLeft,
  BookmarkCheck,
  MessageCircleQuestion,
  Flag,
} from 'lucide-react'
import { type Section } from './LectureDrawerHeader'
import {
  type LearnCardDraft,
  type ContentBlockType,
  type LectureDraft,
  defaultLearnCards,
  ISLAND_6_STAGE_NAMES,
} from '../../lib/authoring'
export type { Section }
export type { LectureDraft, LearnCardDraft, ContentBlockType }
export { ISLAND_6_STAGE_NAMES }
import { resolveIslandSixStageJourney } from '@/features/lesson/lib/island-journey-resolver'

export function emptyDraft(): LectureDraft {
  return {
    id: '', slug: '', title: '', skill: '', hook: '',
    practiceKind: 'journal', videoUrl: '',
    access: { mode: 'inherit', minPlanTier: 0, trialBadge: 'Học thử' },
    concept: '', example: '', learnCards: defaultLearnCards(),
    reward: '', duration: '', goalsText: '',
    gameType: 'math-kids', gameMode: 'required',
    gameAllowedTypes: ['math-kids'], gameDifficulty: 'steady',
    gameInstruction: '', gameOutcome: '', gameCardsText: '', gameStructuredText: '',
    questionCount: 6, practiceInstruction: '', product: '',
    practiceStepsText: '', successCriteriaText: '', reflectionPrompt: '', practiceConfigText: '',
    checkQuestions: [], checkQuestion: '', checkOption1: '', checkOption2: '', checkOption3: '',
    correctIndex: '0', checkExplain: '',
  }
}

export const AIKI_SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'basics', label: 'Thông tin trạm', icon: <BookOpen size={14} /> },
  { id: 'stage-0', label: '1. Tình huống', icon: <Clapperboard size={14} /> },
  { id: 'stage-1', label: '2. Câu đố AIKI', icon: <BrainCircuit size={14} /> },
  { id: 'stage-2', label: '3. Quy tắc', icon: <Lightbulb size={14} /> },
  { id: 'stage-3', label: '4. Giải thích', icon: <ScanSearch size={14} /> },
  { id: 'stage-4', label: '5. Chốt', icon: <Trophy size={14} /> },
]

export const STANDARD_SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'basics', label: 'Thông tin trạm', icon: <BookOpen size={14} /> },
  { id: 'content', label: 'Khám phá', icon: <BookOpen size={14} /> },
  { id: 'game', label: 'Thử cùng Mee', icon: <Gamepad2 size={14} /> },
  { id: 'practice', label: 'Tự tay làm', icon: <Palette size={14} /> },
  { id: 'check', label: 'Thử thách', icon: <HelpCircle size={14} /> },
]

export const AIKI_STAGE_NAMES = [
  '1. Tình huống',
  '2. Câu đố AIKI',
  '3. Quy tắc',
  '4. Giải thích',
  '5. Chốt',
] as const

export const ENGINE_DEFAULT_MOTTOS: Record<string, string> = {
  'magic-keys':
    '4 Chìa khóa vạn năng: Xanh (Cái gì) · Vàng (Trông như thế nào) · Cam (Đang làm gì) · Đỏ (Ở đâu). Đủ 4 chìa là hết đoán bừa!',
  'style-prism':
    'Lăng kính phù thủy: Giữ nguyên chủ thể, đổi màu phong cách nghệ thuật diệu kỳ!',
  'prompt-doctor':
    'Bác sĩ AIKI: Bắt bệnh tranh lỗi, kê đơn thuốc thẻ chữ chữa lành chuẩn xác!',
  'layer-stacking':
    '3 Tầng sân khấu: Tách bạch Hậu cảnh, Ngôi sao 1/3 và Tiền cảnh cho bức tranh có chiều sâu!',
  'identity-lock':
    'Khóa mật mã ADN: Giữ vững nhân vật bất biến qua muôn vàn biểu cảm thần thái!',
  'card-forge':
    'Xưởng đúc thẻ bài: Kết hợp Hệ nguyên tố và Tuyệt chiêu để tôi luyện thẻ bài huyền thoại!',
  'creative-notebook':
    'Hãy viết bằng chính suy nghĩ của cậu! AI sẽ giúp cậu trang trí sau, còn câu chuyện này là của riêng cậu!',
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
    shortName: 'Bác Sĩ AIKI',
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

export const AVAILABLE_MODULES = [
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
  { id: 'voice', label: 'Giọng đọc & Lời thoại', icon: '🎙️', desc: 'Trợ lý giọng đọc AI & lipsync ngầm, tối ưu diện tích bài học' },
  { id: 'video', label: 'Video Bài Giảng (16:9)', icon: '🎬', desc: 'Video MP4 / YouTube sạch bóng với dải phụ đề riêng biệt' },
  { id: 'versus-ab', label: '2 Ảnh Đối Đầu A/B', icon: '🖼️', desc: 'Upload & cấu hình 2 ảnh đối đầu A & B' },
  { id: 'dialogue', label: 'Kịch Bản Phân Vai Comic', icon: '💬', desc: 'Phân vai Zico / Sonet / AIKI / Tùy chọn' },
  { id: 'compare', label: 'Bảng So Sánh 2 Cột', icon: '⚖️', desc: 'Bảng 2 cột tiêu đề, nội dung & 2 ảnh so sánh' },
  { id: 'poster', label: 'Poster Quy Tắc Vàng', icon: '📜', desc: 'Quy tắc to bản, ảnh poster riêng & bí kíp bỏ túi' },
  { id: 'images', label: 'Bộ Sưu Tập Ảnh Minh Họa', icon: '📷', desc: 'Danh sách ảnh kèm caption chú thích' },
] as const

export function speakTextPreview(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text?.trim()) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text.trim())
  utterance.lang = 'vi-VN'
  utterance.rate = 1.0
  window.speechSynthesis.speak(utterance)
}

export const SELF_CONTAINED_QUIZ_GAMES = ['math-kids']
export const CATALOG_GAMES = ['data-runner', 'truth-patrol']

export function goalLines(value?: string | null) {
  if (!value || typeof value !== 'string') return []
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export const LEARN_KIND_OPTIONS: Array<{ id: LearnCardDraft['kind']; label: string }> = [
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

export const LEARN_LAYOUT_OPTIONS: Array<{
  id: LearnCardDraft['layout']
  label: string
  icon: string
  description: string
}> = [
  { id: 'text', label: '1 Cột Tập Trung', icon: '📖', description: 'Một cột, phù hợp giải thích ý chính & đọc tập trung.' },
  { id: 'split', label: '2 Cột Chữ + Media', icon: '📰', description: 'Hai cột trên màn hình lớn: Chữ bên trái, ảnh bên phải.' },
  { id: 'visual-grid', label: 'Lưới 3 Ô Thẻ', icon: '🍱', description: '2–3 ô để so sánh hoặc phân loại ý tưởng.' },
  { id: 'storyboard', label: 'Chuỗi Storyboard', icon: '🎬', description: 'Các khung cảnh tranh vẽ diễn hoạt theo trình tự.' },
]

export const LECTURE_GESTURES = [
  { id: 'presentation', label: '🤲 Thuyết trình cơ bản' },
  { id: 'point-left', label: '👈 Chỉ bảng bài học' },
  { id: 'think', label: '💡 Cùng suy nghĩ (đố vui)' },
  { id: 'idea', label: '💡 Aha! Nêu mẹo (quy tắc)' },
  { id: 'celebrate-1', label: '🎉 Hoan hô ăn mừng' },
  { id: 'explain', label: '👐 Diễn giải mở rộng' },
] as const

export const LEARN_KIND_PRESENTATION = {
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

export function getBlockIcon(type: ContentBlockType): string {
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

export function getBlockTitle(type: ContentBlockType, customTitle?: string): string {
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
      return 'GIỌNG ĐỌC & LỜI THOẠI HƯỚNG DẪN'
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

import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import { extractRuleNumber } from '@/features/lesson/lib/rule-journey-identifiers'
import { type LessonSixStageJourney } from '@/shared/lib/api'

export function buildRuleSyntheticJourney(draft: LectureDraft): LessonSixStageJourney {
  const ruleNum = extractRuleNumber(draft)
  const matchedRule = AIKI_RULES_DATA.find((r) => r.id === ruleNum) || AIKI_RULES_DATA[0]
  const cardImg = draft.learnCards?.[0]?.imageUrl || matchedRule.posterImage || ''
  const cardVideo = draft.learnCards?.[0]?.videoUrl || draft.videoUrl || matchedRule.videoUrl || ''

  const ruleTimestamps = matchedRule.slides?.map((slide, index) => ({
    label: slide.stage,
    startSec: index * 12,
    endSec: (index + 1) * 12,
    speech: slide.dialogue,
  })) || [
    { label: 'Mở đầu & Tình huống', startSec: 0, endSec: 20 },
    { label: 'Quy tắc trọng tâm', startSec: 20, endSec: 40 },
    { label: 'Tổng kết & Ghi nhớ', startSec: 40, endSec: 60 },
  ]

  const ruleQuestions = matchedRule.questions && matchedRule.questions.length > 0
    ? matchedRule.questions.map((q, idx) => ({
        id: q.id || `rule-${matchedRule.id}-q-${idx + 1}`,
        prompt: q.prompt,
        options: [...q.options],
        correctIndex: q.correctIndex,
        explanation: q.successFeedback || q.hint || '',
        visualUrl: q.visualUrl,
      }))
    : []

  const ruleBadgeName = `Huy hiệu ${matchedRule.code}: ${matchedRule.shortTitle}`

  if (draft.sixStageJourney) {
    const existingVideo = draft.sixStageJourney.stage3_video
    const existingQuiz = draft.sixStageJourney.stage4_quiz
    const existingCompletion = draft.sixStageJourney.stage6_completion

    return {
      ...draft.sixStageJourney,
      stage3_video: {
        ...existingVideo,
        title: existingVideo?.title || draft.title || matchedRule.title,
        videoUrl: existingVideo?.videoUrl || cardVideo || matchedRule.videoUrl || '',
        durationSec: existingVideo?.durationSec || matchedRule.durationSec || 60,
        posterUrl: existingVideo?.posterUrl || cardImg || matchedRule.posterImage,
        timestamps: (existingVideo?.timestamps && existingVideo.timestamps.length > 0)
          ? existingVideo.timestamps
          : ruleTimestamps,
      },
      stage4_quiz: {
        ...existingQuiz,
        title: existingQuiz?.title || `Thử tài phản xạ: ${draft.title || matchedRule.shortTitle}`,
        passScore: existingQuiz?.passScore ?? 1,
        questions: (existingQuiz?.questions && existingQuiz.questions.length > 0)
          ? existingQuiz.questions
          : (draft.checkQuestions && draft.checkQuestions.length > 0
              ? draft.checkQuestions.map((q, idx) => ({
                  id: q.id || `rule-${matchedRule.id}-q-${idx + 1}`,
                  prompt: q.prompt,
                  options: [...q.options],
                  correctIndex: q.answer,
                  explanation: q.explain,
                  visualUrl: matchedRule.questions?.[idx]?.visualUrl,
                }))
              : ruleQuestions),
      },
      stage6_completion: {
        ...existingCompletion,
        title: existingCompletion?.title || `Hoàn thành bài học: ${draft.title || matchedRule.shortTitle}!`,
        congratsMessage: existingCompletion?.congratsMessage || `Tuyệt vời! Bé đã làm chủ bài học "${draft.title || matchedRule.shortTitle}"!`,
        rewardBadge: {
          name: existingCompletion?.rewardBadge?.name?.trim() || draft.reward?.trim() || ruleBadgeName,
          iconUrl: existingCompletion?.rewardBadge?.iconUrl || matchedRule.posterImage || cardImg,
          stars: existingCompletion?.rewardBadge?.stars ?? 3,
          xp: existingCompletion?.rewardBadge?.xp ?? 50,
        },
      },
    }
  }

  return {
    stage1_goal: {
      id: `${draft.id}-goal`,
      title: draft.title || matchedRule.title,
      goalText: draft.hook || matchedRule.goal || '',
      imageUrl: cardImg || matchedRule.posterImage,
      speech: draft.skill || matchedRule.akiTip || '',
      keyPoints: [draft.skill || matchedRule.shortTitle || 'Ghi nhớ quy tắc'],
    },
    stage2_confirmGoal: {
      id: `${draft.id}-confirm`,
      question: draft.hook || matchedRule.goal || 'Bé hãy chọn phương án chính xác nhất nhé!',
      options: [{ id: 'opt-1', text: 'Hiểu rõ' }, { id: 'opt-2', text: 'Chưa hiểu' }],
      correctIndex: 0,
      explanation: 'Tuyệt vời!',
      speech: 'Bé hãy chọn phương án chính xác nhất nhé!',
    },
    stage3_video: {
      id: `${draft.id}-video`,
      title: draft.title || matchedRule.title,
      videoUrl: cardVideo || matchedRule.videoUrl || '',
      durationSec: matchedRule.durationSec || 60,
      posterUrl: cardImg || matchedRule.posterImage,
      timestamps: ruleTimestamps,
    },
    stage4_quiz: {
      id: `${draft.id}-quiz`,
      title: `Thử tài phản xạ: ${draft.title || matchedRule.shortTitle}`,
      questions: (draft.checkQuestions && draft.checkQuestions.length > 0
        ? draft.checkQuestions.map((q, idx) => ({
            id: q.id || `rule-${matchedRule.id}-q-${idx + 1}`,
            prompt: q.prompt,
            options: [...q.options],
            correctIndex: q.answer,
            explanation: q.explain,
            visualUrl: matchedRule.questions?.[idx]?.visualUrl,
          }))
        : ruleQuestions),
      passScore: 1,
    },
    stage5_practice: {
      id: `${draft.id}-practice`,
      title: 'Thực hành',
      subjectName: draft.title || matchedRule.shortTitle,
      badge: matchedRule.code || 'QT',
      illustrationType: 'rule-practice',
      lockedFeatures: [matchedRule.shortTitle || draft.title],
      akiMotto: matchedRule.akiTip || 'Ghi nhớ quy tắc vàng!',
      maxAttempts: 3,
      workflowSteps: [],
    },
    stage6_completion: {
      id: `${draft.id}-complete`,
      title: `Hoàn thành bài học: ${draft.title || matchedRule.shortTitle}!`,
      congratsMessage: `Tuyệt vời! Bé đã làm chủ bài học "${draft.title || matchedRule.shortTitle}"!`,
      rewardBadge: {
        name: draft.reward?.trim() || ruleBadgeName,
        iconUrl: matchedRule.posterImage || cardImg,
        stars: 3,
        xp: 50,
      },
    },
  }
}

// ─── Shared Styles & Helper Components ──────────────────────────────────────────
export const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.625rem',
  border: '1.5px solid #e2e8f0', background: '#fff',
  color: '#0f172a', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
}

export const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: 'vertical', lineHeight: 1.6,
}

export const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem',
}

export function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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

export function resolveSectionStatus(
  s: Section,
  draft: LectureDraft,
  isIslandCourse: boolean,
  readiness: { complete: boolean; steps: Array<{ id: string; complete: boolean }> }
): boolean {
  if (s.startsWith('stage-')) {
    const idx = parseInt(s.replace('stage-', ''), 10)
    if (isIslandCourse) {
      const j = draft.sixStageJourney || resolveIslandSixStageJourney(draft as any)
      if (idx === 0) return Boolean(j.stage1_goal.title && j.stage1_goal.goalText)
      if (idx === 1) return Boolean(j.stage2_confirmGoal.question && j.stage2_confirmGoal.options.length >= 2)
      if (idx === 2) return Boolean(j.stage3_video.videoUrl)
      if (idx === 3) return Boolean(j.stage4_quiz.questions.length > 0)
      if (idx === 4) return Boolean(j.stage5_practice.subjectName)
      if (idx === 5) return Boolean(j.stage6_completion.title)
      return false
    }
    const c = draft.learnCards[idx]
    return Boolean(c && c.title.trim().length >= 2 && (c.body.trim().length >= 10 || (c.mee?.readText?.trim().length ?? 0) >= 10))
  }
  return readiness.steps.find((st) => st.id === s)?.complete ?? false
}

export function resolveSectionMissing(
  s: Section,
  draft: LectureDraft,
  isIslandCourse: boolean,
  readiness: { steps: Array<{ id: string; missing: string[] }> }
): string[] {
  if (s.startsWith('stage-')) {
    const idx = parseInt(s.replace('stage-', ''), 10)
    if (isIslandCourse) {
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
    const card = draft.learnCards[idx]
    if (!card) return ['Chưa có dữ liệu chặng']
    const missing: string[] = []
    if (card.title.trim().length < 2) missing.push('Tiêu đề chặng')
    if (card.body.trim().length < 10 && (card.mee?.readText?.trim().length ?? 0) < 10) {
      missing.push('Nội dung hoặc Lời đọc cho bé (tối thiểu 10 ký tự)')
    }
    return missing
  }
  return readiness.steps.find((step) => step.id === s)?.missing ?? []
}
