import type { LessonSixStageJourney } from '@/shared/lib/api'
import { resolveIslandSixStageJourney } from '@/features/lesson/lib/island-journey-resolver'
import { findIslandCurriculum } from '@/features/lesson/data/island-curriculum-registry'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
import { extractRuleNumber, isAikiRuleJourney } from '@/features/lesson/lib/rule-journey-identifiers'

export type AuthoringStepId = 'basics' | 'content' | 'outcomes' | 'recognition' | 'learn' | 'game' | 'practice' | 'check'

export type AuthoringStep = {
  id: AuthoringStepId
  label: string
  complete: boolean
  missing: string[]
}

export type AuthoringReadiness = {
  complete: boolean
  completed: number
  total: number
  steps: AuthoringStep[]
}

export type CourseDraft = {
  id: string
  title: string
  shortTitle: string
  tagline: string
  description: string
  productLabel: string
  ageTrack: string
  courseKey: string
  durationLabel: string
  skillsText: string
  outcomesText: string
  credential: string
  finalAssessment: string
  badgeRewardId?: string
  issuerTitle?: string
}

// WHY: CheckQuestion — 1 câu hỏi trong phần "Thử tài" (có thể có nhiều câu, mỗi câu 2-6 đáp án).
// Thay thế checkQuestion/checkOption1-3/correctIndex/checkExplain (chỉ hỗ trợ 1 câu cố định 3 đáp án).
export type CheckQuestion = {
  id: string
  prompt: string
  options: string[] // 2–6 đáp án
  answer: number    // index 0-based của đáp án đúng
  explain: string
  mee?: {
    readText: string
    /** Ghi chú cho hệ thống/giáo viên, không đọc nguyên văn cho trẻ. */
    strategy: string
    /** Gợi ý theo thứ tự từ nhẹ đến rõ, không đưa đáp án ngay ở mức đầu. */
    hints: string[]
    gesture: 'presentation' | 'point-left' | 'point-right' | 'think' | 'idea' | 'celebrate' | 'celebrate-1' | 'explain' | 'idle'
    autoRead: boolean
  }
}

export type DialogueLine = {
  id: string
  speaker: string
  role: 'left' | 'right' | 'center'
  text: string
}

export type StageImageItem = {
  id: string
  url: string
  alt: string
  caption?: string
}

export type StageCompareData = {
  leftTitle?: string
  leftText?: string
  leftImage?: string
  rightTitle?: string
  rightText?: string
  rightImage?: string
}

export type LearnVisualItemDraft = {
  label: string
  text: string
  tone?: 'brand' | 'sky' | 'mint' | 'sun' | 'coral' | 'rose'
  sub?: string // Phụ đề gợi ý cho bé: VD "Ai, đồ vật gì", "Màu sắc, hình dáng", v.v.
  keyImage?: string // Ảnh chìa khóa tương ứng
  shot?: string
  duration?: string
  sound?: string
  direction?: string
}

export type ContentBlockType =
  | 'text'              // Textbox / Đoạn văn bản
  | 'layout-text'       // 1 Cột Tập Trung
  | 'layout-split'      // Bố cục 2 Cột (Chữ + Media)
  | 'layout-grid'       // Lưới Ô Thẻ
  | 'layout-four-keys'  // Bộ 4 chìa khóa câu lệnh
  | 'layout-confirm-option' // Phương án xác nhận mục tiêu (Chặng 2)
  | 'layout-callout'    // Hộp Ghi Nhớ Nổi Bật
  | 'layout-formula'    // Công thức KaTeX
  | 'layout-storyboard' // Chuỗi Storyboard
  | 'voice'             // Mèo AIKI & Lời đọc Lipsync
  | 'video'             // Video Bài Giảng
  | 'versus-ab'         // 2 Tranh Đối Đầu A/B
  | 'dialogue'          // Kịch Bản Phân Vai Comic
  | 'compare'           // Bảng So Sánh 2 Cột
  | 'poster'            // Poster Quy Tắc Vàng
  | 'images'            // Album Ảnh Minh Họa
  | 'quiz-question'     // Câu Hỏi Trắc Nghiệm / Xác Nhận Kéo Thả (Quiz Block)
  | 'practice'          // Kịch bản thực hành AI Studio (Chặng 5)
  | 'reward'            // Màn kết thúc & Trao thưởng (Chặng 6)

export interface StageBlockItem {
  id: string
  type: ContentBlockType
  title?: string
  body?: string
  tip?: string
  tone?: 'brand' | 'sky' | 'mint' | 'sun' | 'coral' | 'rose'
  imageUrl?: string
  imageAlt?: string
  videoUrl?: string
  posterUrl?: string
  durationSec?: number
  timestamps?: Array<{
    label: string
    startSec: number
    endSec: number
    speech?: string
  }>
  practiceConfig?: any
  rewardConfig?: {
    id?: string
    title?: string
    congratsMessage?: string
    rewardBadge?: {
      name: string
      iconUrl?: string
      stars: number
      xp: number
    }
    nextLessonSlug?: string
  }
  formula?: string
  visualItems?: LearnVisualItemDraft[]
  optionImages?: [string, string] | string[]
  optionLabels?: [string, string] | string[]
  optionDescs?: [string, string] | string[]
  dialogueLines?: DialogueLine[]
  dialoguePairs?: StageCompareData
  compareImages?: { left: string; right: string }
  compareData?: {
    leftTitle?: string
    rightTitle?: string
    leftText?: string
    rightText?: string
    leftImage?: string
    rightImage?: string
    rows?: Array<{ aspect: string; left: string; right: string }>
  }
  readOnlyType?: boolean
  selectedSubtype?: 'zico-sonet' | 'custom'
  isHero?: boolean
  columns?: 2 | 3
  isCorrect?: boolean
  correctFeedback?: string
  incorrectFeedback?: string
  choiceItems?: {
    id: string
    title: string
    description?: string
    isCorrect?: boolean
    feedback?: string
    imageUrl?: string
  }[]
  questionPrompt?: string
  options?: {
    label: string
    imageUrl?: string
    isCorrect?: boolean
  }[]
  layoutMode?: 'cards' | 'split' | 'list'
  visualUrl?: string
  correctIndex?: number
  explanation?: string
  questionOptions?: Array<{
    id?: string
    text: string
    imageUrl?: string
  }>
  quizQuestions?: Array<{
    id: string
    prompt: string
    layoutMode?: 'cards' | 'split' | 'list'
    visualUrl?: string
    options: string[]
    correctIndex: number
    explanation?: string
    optionImages?: string[]
  }>
  activeQuizQuestionIdx?: number
  additionalImages?: StageImageItem[]
  posterText?: string
  posterRuleNumber?: number
  gesture?: string
  readText?: string
}

export const FOUR_KEYS_DEFAULT_ITEMS: LearnVisualItemDraft[] = [
  { label: 'CÁI GÌ', text: 'Nhân vật hoặc đồ vật chính', tone: 'sky', sub: 'Ai, đồ vật gì', keyImage: '/assets/aiki-keys/key_what_blue.jpg' },
  { label: 'TRÔNG THẾ NÀO', text: 'Màu sắc, hình dáng và đặc điểm', tone: 'sun', sub: 'Màu sắc, hình dáng', keyImage: '/assets/aiki-keys/key_how_yellow.jpg' },
  { label: 'ĐANG LÀM GÌ', text: 'Hành động đang diễn ra', tone: 'coral', sub: 'Hành động', keyImage: '/assets/aiki-keys/key_action_orange.jpg' },
  { label: 'Ở ĐÂU', text: 'Bối cảnh hoặc địa điểm', tone: 'rose', sub: 'Bối cảnh, nơi chốn', keyImage: '/assets/aiki-keys/key_where_pink.jpg' },
]

/** Tạo bản sao độc lập để CMS có thể sửa/kéo thả mà không làm đổi template gốc. */
export function createFourKeysBlock(id = `blk-four-keys-${Date.now()}`): StageBlockItem {
  return {
    id,
    type: 'layout-four-keys',
    title: 'Bốn chiếc chìa khóa mở câu lệnh',
    body: '',
    tip: '',
    visualItems: FOUR_KEYS_DEFAULT_ITEMS.map((item) => ({ ...item })),
  }
}

export type LearnCardDraft = {
  id: string
  title: string
  body: string
  tip: string
  kind: 'concept' | 'example' | 'compare' | 'steps' | 'storyboard' | 'remember' | 'situation' | 'aiki-riddle' | 'rule' | 'explanation' | 'closing'
  layout: 'text' | 'split' | 'visual-grid' | 'storyboard'
  visualItems: LearnVisualItemDraft[]
  imageUrl?: string
  imageAlt?: string
  videoUrl?: string
  optionImages?: string[]
  optionLabels?: string[]
  optionDescs?: string[]
  dialogueLines?: DialogueLine[]
  additionalImages?: StageImageItem[]
  compareData?: StageCompareData
  compareImages?: { left: string; right: string }
  enabledModules?: string[] // ['versus-ab', 'images', 'dialogue', 'compare', 'poster', 'video']
  contentBlocks?: StageBlockItem[]
  layoutMode?: '1-column' | '2-column' | '3-column'
  mee?: {
    readText: string
    /** URL audio đã được Vertex tạo qua StoryMee Hub; FE không gọi Vertex trực tiếp. */
    audioUrl?: string
    voiceProvider?: 'vertex'
    gesture: 'presentation' | 'point-left' | 'point-right' | 'think' | 'idea' | 'celebrate' | 'celebrate-1' | 'explain' | 'idle'
    autoRead: boolean
  }
}

export type LessonFormat = 'standard' | 'aiki-rule-5steps' | 'aiki-rule-3steps' | 'aiki-island-6steps'

export type JourneyStageDefinition = {
  id: string
  index: number
  title: string
  shortTitle: string
  iconName?: string
  desc?: string
}

export const STANDARD_RULE_3_STAGES: JourneyStageDefinition[] = [
  { id: 'stage-0', index: 0, title: '1. Bài học', shortTitle: 'Bài học', iconName: 'Film', desc: '1. 🎬 Rạp chiếu video bài học & kiến thức trọng tâm' },
  { id: 'stage-1', index: 1, title: '2. Kiểm tra', shortTitle: 'Kiểm tra', iconName: 'MessageCircleQuestion', desc: '2. ⚡ Thử tài phản xạ (Trắc nghiệm củng cố quy tắc)' },
  { id: 'stage-2', index: 2, title: '3. Hoàn thành', shortTitle: 'Hoàn thành', iconName: 'Trophy', desc: '3. 🏆 Vinh danh, trao huy hiệu & nhận sao hoàn thành' },
]

export const STANDARD_ISLAND_6_STAGES: JourneyStageDefinition[] = [
  { id: 'stage-0', index: 0, title: '1. 🎯 Mục tiêu', shortTitle: 'Mục tiêu', iconName: 'Target', desc: '1. 🎯 Mục tiêu bài học (Ảnh minh họa)' },
  { id: 'stage-1', index: 1, title: '2. ❓ Xác nhận', shortTitle: 'Khởi động', iconName: 'HelpCircle', desc: '2. ❓ Xác nhận (1 câu hỏi khởi động)' },
  { id: 'stage-2', index: 2, title: '3. 🎬 Video', shortTitle: 'Video', iconName: 'Film', desc: '3. 🎬 Video bài giảng YouTube / MP4' },
  { id: 'stage-3', index: 3, title: '4. 🧩 Trắc nghiệm', shortTitle: 'Câu hỏi', iconName: 'MessageCircleQuestion', desc: '4. 🧩 Bộ câu hỏi trắc nghiệm kiểm tra' },
  { id: 'stage-4', index: 4, title: '5. 🎨 Thực hành', shortTitle: 'Thực hành', iconName: 'Palette', desc: '5. 🎨 Kịch bản thực hành AI Studio' },
  { id: 'stage-5', index: 5, title: '6. 🏆 Kết thúc', shortTitle: 'Kết thúc', iconName: 'Trophy', desc: '6. 🏆 Màn kết thúc, trao sao & huy hiệu' },
]

export const STANDARD_RULE_5_STAGES: JourneyStageDefinition[] = [
  { id: 'stage-0', index: 0, title: '1. Tình huống', shortTitle: 'Tình huống', iconName: 'Clapperboard', desc: '1. Tình huống câu chuyện mở đầu' },
  { id: 'stage-1', index: 1, title: '2. Câu đố AIKI', shortTitle: 'Câu đố', iconName: 'BrainCircuit', desc: '2. Câu đố suy luận AIKI tương tác' },
  { id: 'stage-2', index: 2, title: '3. Quy tắc Vàng', shortTitle: 'Quy tắc', iconName: 'Lightbulb', desc: '3. Quy tắc cốt lõi cần ghi nhớ' },
  { id: 'stage-3', index: 3, title: '4. Giải thích', shortTitle: 'Giải thích', iconName: 'ScanSearch', desc: '4. Giải thích chi tiết và ví dụ thực tế' },
  { id: 'stage-4', index: 4, title: '5. Bản Cam Kết', shortTitle: 'Cam kết', iconName: 'Trophy', desc: '5. Chốt bài học, tặng sao và vinh danh' },
]

export const STANDARD_COURSE_4_STAGES: JourneyStageDefinition[] = [
  { id: 'stage-0', index: 0, title: '1. Khám phá', shortTitle: 'Khám phá', iconName: 'Clapperboard', desc: '1. Khám phá kiến thức bài học' },
  { id: 'stage-1', index: 1, title: '2. Trò chơi', shortTitle: 'Trò chơi', iconName: 'Gamepad2', desc: '2. Trò chơi tương tác cùng Mee' },
  { id: 'stage-2', index: 2, title: '3. Sáng tạo', shortTitle: 'Sáng tạo', iconName: 'BookmarkCheck', desc: '3. Tự tay sáng tạo & thực hành' },
  { id: 'stage-3', index: 3, title: '4. Thử tài', shortTitle: 'Thử tài', iconName: 'Trophy', desc: '4. Thử thách & đánh giá năng lực' },
]

export function resolveCourseJourneyStages(
  courseId?: string,
  format?: LessonFormat,
  customStages?: JourneyStageDefinition[]
): JourneyStageDefinition[] {
  // 1. Khóa Quy Tắc (aiki-rule-3steps): 3 bước chuẩn
  if (format === 'aiki-rule-3steps') {
    return [...STANDARD_RULE_3_STAGES]
  }

  // 2. Khóa Quy Tắc (aiki-rule-5steps): giữ backward compatibility nếu explicit format là 5 bước
  if (format === 'aiki-rule-5steps') {
    return [...STANDARD_RULE_5_STAGES]
  }

  // 3. Cho phép tùy biến tự do từ 3 đến 7 chặng nếu mảng customStages được cung cấp và có >= 3 phần tử
  if (Array.isArray(customStages) && customStages.length >= 3) {
    const clampedStages = customStages.slice(0, 7)
    return clampedStages.map((st, idx) => ({
      id: st.id || `stage-${idx}`,
      index: idx,
      title: st.title || `Chặng ${idx + 1}`,
      shortTitle: st.shortTitle || st.title || `Chặng ${idx + 1}`,
      iconName: st.iconName,
      desc: st.desc || st.title || `Chặng ${idx + 1}`,
    }))
  }

  // 4. Khóa Quy Tắc (aiki-rule-3steps) mặc định nếu courseId chứa rule
  const isRule = Boolean(courseId && (courseId.toLowerCase() === 'aiki-rules' || courseId.toLowerCase().includes('rule')))
  if (isRule) {
    return [...STANDARD_RULE_3_STAGES]
  }

  // 5. Khóa Đảo (aiki-island-6steps): 6 chặng chuẩn
  const isIsland =
    format === 'aiki-island-6steps' ||
    !format ||
    Boolean(courseId && (courseId.toLowerCase().startsWith('dao-') || courseId.toLowerCase().includes('island')))
  if (isIsland && format !== 'standard') {
    return [...STANDARD_ISLAND_6_STAGES]
  }

  // 6. Khóa chuẩn / tùy biến: fallback an toàn
  if (format === 'standard') {
    return [...STANDARD_COURSE_4_STAGES]
  }

  return [...STANDARD_ISLAND_6_STAGES]
}

export const AIKI_RULE_STAGE_KINDS = [
  'situation',
  'aiki-riddle',
  'rule',
  'explanation',
  'closing',
] as const
export const AIKI_RULE_META_LABEL = '__AIKI_RULE_STAGE__'
export const AIKI_RULE_HUB_KINDS_ORDER = ['concept', 'example', 'steps', 'compare', 'remember'] as const
export const AIKI_RULE_STAGE_IDS = [
  'aiki-rule-situation',
  'aiki-rule-riddle',
  'aiki-rule-rule',
  'aiki-rule-explanation',
  'aiki-rule-closing',
] as const

export function isAikiRuleLesson(cards: LearnCardDraft[]): boolean {
  if (!Array.isArray(cards) || cards.length !== AIKI_RULE_STAGE_KINDS.length) return false
  // 1. Khớp trực tiếp 5 kinds mới (situation, aiki-riddle, rule, explanation, closing)
  if (cards.every((card, index) => card.kind === AIKI_RULE_STAGE_KINDS[index])) return true
  // 2. Khớp 5 kinds dạng Hub lưu DB (concept, example, steps, compare, remember)
  if (cards.every((card, index) => card.kind === AIKI_RULE_HUB_KINDS_ORDER[index])) return true
  // 3. Có chứa metadata __AIKI_RULE_STAGE__ trong visualItems
  if (cards.some((card) => card.visualItems?.some((item) => item.label === AIKI_RULE_META_LABEL))) return true
  // 4. Có ID theo chuẩn aiki-rule-* đúng thứ tự 5 stage
  if (cards.every((card, index) => card.id === AIKI_RULE_STAGE_IDS[index] || card.id?.startsWith(`aiki-rule-${AIKI_RULE_STAGE_KINDS[index]}`))) return true
  return false
}

export function isAikiRule3StepsLesson(cards: LearnCardDraft[]): boolean {
  if (!Array.isArray(cards) || cards.length !== 3) return false
  if (cards.every((c, idx) => c.id === `rule-3step-stage-${idx + 1}`)) return true
  if (cards.some((c) => c.id?.startsWith('rule-3step-'))) return true
  return cards.length === 3
}

export function detectLessonFormat(cards: LearnCardDraft[], explicitFormat?: string, isIsland?: boolean): LessonFormat {
  if (explicitFormat === 'aiki-island-6steps' || explicitFormat === 'aiki-rule-3steps' || explicitFormat === 'aiki-rule-5steps' || explicitFormat === 'standard') {
    return explicitFormat
  }
  if (isIsland) return 'aiki-island-6steps'
  if (Array.isArray(cards) && (cards.length === 3 || isAikiRule3StepsLesson(cards))) return 'aiki-rule-3steps'
  if (isAikiRuleLesson(cards)) return 'aiki-rule-5steps'
  return 'standard'
}

export type AikiRuleStageMeta = {
  kind: typeof AIKI_RULE_STAGE_KINDS[number]
  label: string
  shortLabel: string
}

export const AIKI_RULE_STAGE_METAS: readonly AikiRuleStageMeta[] = [
  { kind: 'situation', label: '1. Tình huống', shortLabel: 'Tình huống' },
  { kind: 'aiki-riddle', label: '2. Câu đố AIKI', shortLabel: 'Câu đố' },
  { kind: 'rule', label: '3. Quy tắc Vàng', shortLabel: 'Quy tắc' },
  { kind: 'explanation', label: '4. Giải thích', shortLabel: 'Giải thích' },
  { kind: 'closing', label: '5. Bản Cam Kết', shortLabel: 'Cam kết' },
]

export interface ParsedDialogue {
  id: string
  speaker: string
  speakerName?: string
  text: string
  role?: 'left' | 'right' | 'center'
}

export function parseComicDialogue(source?: string): ParsedDialogue[] {
  if (!source) return []
  const lines = source.split('\n').map((l) => l.trim()).filter(Boolean)
  const result: ParsedDialogue[] = []
  lines.forEach((line, idx) => {
    const match = line.match(/^([A-Za-z0-9_\u00C0-\u024F\u1EA0-\u1EF9\s]+)[:：]\s*(.*)$/)
    if (match) {
      const name = match[1].trim()
      const text = match[2].trim()
      const lower = name.toLowerCase()
      let role: 'left' | 'right' | 'center' = 'center'
      if (lower.includes('zico') || lower.includes('cam')) role = 'left'
      else if (lower.includes('sonet') || lower.includes('xanh')) role = 'right'
      result.push({
        id: `dialogue-${idx}`,
        speaker: lower.includes('zico') ? 'zico' : lower.includes('sonet') ? 'sonet' : 'aki',
        speakerName: name,
        text,
        role,
      })
    }
  })
  return result
}

export function parseVersusOption(opt: string, optIdx: number, tip?: string): { title: string; desc?: string } {
  const match = opt.match(/^(.*?)\s*\((.*?)\)$/)
  if (match) {
    return {
      title: match[1].trim(),
      desc: match[2].trim(),
    }
  }
  return {
    title: opt,
    desc: optIdx === 0
      ? 'Phương án quen thuộc hoặc sao chép'
      : 'Phương án sáng tạo độc đáo từ cảm xúc và câu chuyện riêng của con',
  }
}

const AIKI_RULE_HUB_KINDS: Record<typeof AIKI_RULE_STAGE_KINDS[number], 'concept' | 'example' | 'steps' | 'compare' | 'remember'> = {
  situation: 'concept',
  'aiki-riddle': 'example',
  rule: 'steps',
  explanation: 'compare',
  closing: 'remember',
}


export function createAikiRuleLearnCards(): LearnCardDraft[] {
  const stages: Array<Pick<LearnCardDraft, 'id' | 'title' | 'kind'> & { gesture: NonNullable<LearnCardDraft['mee']>['gesture'] }> = [
    { id: 'aiki-rule-situation', title: '1. Tình huống', kind: 'situation', gesture: 'presentation' },
    { id: 'aiki-rule-riddle', title: '2. Câu đố của AIKI', kind: 'aiki-riddle', gesture: 'think' },
    { id: 'aiki-rule-rule', title: '3. Quy tắc', kind: 'rule', gesture: 'idea' },
    { id: 'aiki-rule-explanation', title: '4. Giải thích', kind: 'explanation', gesture: 'point-left' },
    { id: 'aiki-rule-closing', title: '5. Chốt', kind: 'closing', gesture: 'celebrate' },
  ]
  return stages.map((stage) => ({
    ...stage,
    body: '',
    tip: '',
    layout: 'text',
    visualItems: [],
    imageUrl: '',
    imageAlt: '',
    videoUrl: '',
    optionImages: stage.kind === 'aiki-riddle' ? ['', ''] : undefined,
    optionLabels: undefined,
    optionDescs: undefined,
    dialogueLines: stage.kind === 'situation' ? [
      { id: 'd-1', speaker: 'zico', role: 'left', text: 'Của tớ đẹp hơn!' },
      { id: 'd-2', speaker: 'sonet', role: 'right', text: 'Không, của tớ đúng hơn!' },
      { id: 'd-3', speaker: 'aki', role: 'center', text: 'DỪNG LẠIIII...! Các cậu ơi, hãy giúp tớ vụ này!' },
    ] : undefined,
    additionalImages: [],
    compareData: stage.kind === 'explanation' ? {
      leftTitle: 'Kho Dữ Liệu Của AI',
      leftText: 'AI chỉ lấy những hình ảnh quen thuộc trong kho hàng ngàn mẫu có sẵn. Ai gõ câu giống nhau thì kết quả cũng giống hệt nhau.',
      rightTitle: 'Bộ Não Sáng Tạo Của Con',
      rightText: 'Chỉ có con mới có kỷ niệm riêng, cảm xúc thật, gia đình và sự tưởng tượng độc đáo mà AI không thể tự nghĩ ra được!',
    } : undefined,
    compareImages: stage.kind === 'explanation' ? { left: '', right: '' } : undefined,
    enabledModules: stage.kind === 'situation' ? ['images', 'dialogue']
      : stage.kind === 'aiki-riddle' ? ['versus-ab']
      : stage.kind === 'rule' ? ['poster']
      : stage.kind === 'explanation' ? ['compare']
      : ['poster'],
    mee: {
      readText: '',
      audioUrl: '',
      voiceProvider: 'vertex',
      gesture: stage.gesture,
      autoRead: false,
    },
  }))
}

export const createAikiRuleDefaultCards = createAikiRuleLearnCards

export function createAikiRule3StepsCards(): LearnCardDraft[] {
  return [
    {
      id: 'rule-3step-stage-1',
      title: '1. Bài học',
      body: '',
      tip: '',
      kind: 'concept',
      layout: 'text',
      visualItems: [],
      imageUrl: '',
      imageAlt: '',
      videoUrl: '',
      enabledModules: ['video', 'layout-callout', 'voice'],
      mee: {
        readText: '',
        audioUrl: '',
        voiceProvider: 'vertex',
        gesture: 'presentation',
        autoRead: false,
      },
    },
    {
      id: 'rule-3step-stage-2',
      title: '2. Kiểm tra',
      body: '',
      tip: '',
      kind: 'example',
      layout: 'text',
      visualItems: [],
      imageUrl: '',
      imageAlt: '',
      videoUrl: '',
      optionImages: ['', ''],
      optionLabels: ['Ảnh A: Bức tranh quen thuộc', 'Ảnh B: Bức tranh sáng tạo độc nhất của con'],
      optionDescs: ['Phương án quen thuộc hoặc sao chép', 'Phương án sáng tạo độc đáo từ cảm xúc và câu chuyện riêng của con'],
      enabledModules: ['versus-ab'],
      mee: {
        readText: '',
        audioUrl: '',
        voiceProvider: 'vertex',
        gesture: 'think',
        autoRead: false,
      },
    },
    {
      id: 'rule-3step-stage-3',
      title: '3. Hoàn thành',
      body: '',
      tip: '',
      kind: 'remember',
      layout: 'text',
      visualItems: [],
      imageUrl: '',
      imageAlt: '',
      videoUrl: '',
      enabledModules: ['poster'],
      mee: {
        readText: '',
        audioUrl: '',
        voiceProvider: 'vertex',
        gesture: 'celebrate',
        autoRead: false,
      },
    },
  ]
}

export function getActiveModules(card: LearnCardDraft, stageIndex: number): string[] {
  if (Array.isArray(card.enabledModules)) {
    return card.enabledModules
  }
  const modules: string[] = []
  if (card.imageUrl || (card.additionalImages && card.additionalImages.length > 0)) {
    modules.push('images')
  }
  if (card.videoUrl) modules.push('video')
  if (card.title || card.body || card.tip) modules.push('text')
  if (card.mee?.audioUrl || card.mee?.readText || card.mee?.gesture) modules.push('voice')
  if (stageIndex === 0 || card.kind === 'situation' || (card.dialogueLines && card.dialogueLines.length > 0)) {
    modules.push('dialogue')
  }
  if (stageIndex === 1 || card.kind === 'aiki-riddle' || (card.optionImages && card.optionImages.length > 0)) {
    modules.push('versus-ab')
  }
  if (stageIndex === 2 || stageIndex === 4 || card.kind === 'rule' || card.kind === 'closing') {
    modules.push('poster')
  }
  if (stageIndex === 3 || card.kind === 'explanation' || card.compareData || card.compareImages?.left || card.compareImages?.right) {
    modules.push('compare')
  }
  return modules
}

export function getStageBlocks(card: LearnCardDraft, stageIndex: number): StageBlockItem[] {
  if (card.contentBlocks && card.contentBlocks.length > 0) {
    return card.contentBlocks
  }
  if (Array.isArray(card.contentBlocks)) {
    return []
  }
  const activeMods = getActiveModules(card, stageIndex)
  const blocks: StageBlockItem[] = []
  for (const mod of activeMods) {
    if (mod === 'text' || mod === 'layout-text') {
      blocks.push({ id: `blk-text-${stageIndex}`, type: 'text', title: card.title || 'Đoạn văn bản', body: card.body, tip: card.tip })
    } else if (mod === 'video') {
      blocks.push({ id: `blk-video-${stageIndex}`, type: 'video', title: card.title, videoUrl: card.videoUrl })
    } else if (mod === 'dialogue') {
      blocks.push({ id: `blk-dialogue-${stageIndex}`, type: 'dialogue', dialogueLines: card.dialogueLines, body: card.body, tip: card.tip })
    } else if (mod === 'versus-ab') {
      blocks.push({
        id: `blk-versus-ab-${stageIndex}`,
        type: 'versus-ab',
        optionImages: card.optionImages,
        optionLabels: card.optionLabels,
        optionDescs: card.optionDescs,
        body: card.body,
        tip: card.tip,
      })
    } else if (mod === 'compare') {
      blocks.push({ id: `blk-compare-${stageIndex}`, type: 'compare', compareImages: card.compareImages, compareData: card.compareData })
    } else if (mod === 'poster') {
      blocks.push({ id: `blk-poster-${stageIndex}`, type: 'poster', posterText: card.body, tip: card.tip })
    } else if (mod === 'images') {
      blocks.push({ id: `blk-images-${stageIndex}`, type: 'images', imageUrl: card.imageUrl, imageAlt: card.imageAlt, additionalImages: card.additionalImages })
    } else if (mod === 'layout-callout') {
      blocks.push({ id: `blk-callout-${stageIndex}`, type: 'layout-callout', title: 'Hộp Ghi Nhớ Nổi Bật', tip: card.tip })
    } else if (mod === 'layout-formula') {
      blocks.push({ id: `blk-formula-${stageIndex}`, type: 'layout-formula', title: 'Công Thức KaTeX' })
    } else if (mod === 'layout-split') {
      blocks.push({ id: `blk-split-${stageIndex}`, type: 'layout-split', title: 'Bố cục 2 Cột Chữ + Media', body: card.body, imageUrl: card.imageUrl })
    } else if (mod === 'layout-grid') {
      blocks.push({ id: `blk-grid-${stageIndex}`, type: 'layout-grid', title: 'Lưới 3 Ô Thẻ', visualItems: card.visualItems })
    } else if (mod === 'layout-four-keys') {
      blocks.push({ ...createFourKeysBlock(`blk-four-keys-${stageIndex}`), visualItems: card.visualItems?.length ? card.visualItems : FOUR_KEYS_DEFAULT_ITEMS.map((item) => ({ ...item })) })
    } else if (mod === 'layout-confirm-option') {
      blocks.push({ id: `blk-confirm-option-${stageIndex}`, type: 'layout-confirm-option', title: card.title || 'Bộ chìa khóa A', body: card.body || 'Phương án A', imageUrl: card.imageUrl, isCorrect: false })
    } else if (mod === 'layout-storyboard') {
      blocks.push({ id: `blk-storyboard-${stageIndex}`, type: 'layout-storyboard', title: 'Chuỗi Storyboard', visualItems: card.visualItems })
    } else if (mod === 'voice') {
      blocks.push({ id: `blk-voice-${stageIndex}`, type: 'voice', readText: card.mee?.readText, gesture: card.mee?.gesture })
    }
  }
  return blocks
}

/** Encode new rule-stage metadata inside fields accepted by the deployed LMS schema. */
export function serializeLearnCardsForHub(cards: LearnCardDraft[]): LearnCardDraft[] {
  return cards.map((card) => {
    if (!AIKI_RULE_STAGE_KINDS.includes(card.kind as typeof AIKI_RULE_STAGE_KINDS[number])) return card
    const kind = card.kind as typeof AIKI_RULE_STAGE_KINDS[number]
    const metadata = JSON.stringify({
      kind,
      imageUrl: card.imageUrl,
      imageAlt: card.imageAlt,
      videoUrl: card.videoUrl,
      optionImages: card.optionImages,
      optionLabels: card.optionLabels,
      optionDescs: card.optionDescs,
      dialogueLines: card.dialogueLines,
      additionalImages: card.additionalImages,
      compareData: card.compareData,
      compareImages: card.compareImages,
      enabledModules: card.enabledModules,
      contentBlocks: card.contentBlocks,
      mee: card.mee,
    })
    return {
      ...card,
      kind: AIKI_RULE_HUB_KINDS[kind],
      visualItems: [
        ...card.visualItems.filter((item) => item.label !== AIKI_RULE_META_LABEL),
        { label: AIKI_RULE_META_LABEL, text: metadata, tone: 'brand' },
      ],
    }
  })
}

export type LessonAccessMode = 'inherit' | 'free_trial' | 'plan_required' | 'locked'

export type LessonAccessConfig = {
  mode: LessonAccessMode
  minPlanTier: number
  trialBadge?: string
  lockedReason?: string
}

export type LectureDraft = {
  id: string
  slug?: string
  questId?: string
  title: string
  skill: string
  hook: string
  practiceKind: string
  access?: LessonAccessConfig
  lessonFormat?: LessonFormat
  metadata?: Record<string, unknown>
  sixStageJourney?: LessonSixStageJourney
  customJourneyStages?: JourneyStageDefinition[]
  videoUrl: string
  concept: string
  example: string
  learnCards: LearnCardDraft[]
  reward: string
  duration: string
  goalsText: string
  gameType: string
  gameMode: 'required' | 'student_choice'
  gameAllowedTypes: string[]
  gameDifficulty: 'gentle' | 'steady' | 'challenge'
  gameInstruction: string
  gameOutcome: string
  gameCardsText: string
  gameStructuredText: string
  // WHY: số câu hỏi quiz per-bài học — mỗi bài có thể khác nhau.
  // Lưu vào gameConfig.questionCount trong DB (JSONB metadata).
  questionCount: number
  practiceInstruction: string
  product: string
  practiceStepsText: string
  successCriteriaText: string
  reflectionPrompt: string
  practiceConfigText: string
  // WHY: checkQuestions thay thế các field cũ (checkQuestion/checkOption1-3/correctIndex/checkExplain).
  // Hỗ trợ nhiều câu hỏi, mỗi câu 2–6 đáp án.
  checkQuestions: CheckQuestion[]
  // @deprecated — giữ lại chỉ để serialize backward-compat với các bài đã lưu cũ
  checkQuestion: string
  checkOption1: string
  checkOption2: string
  checkOption3: string
  correctIndex: string
  checkExplain: string
}

export const PRACTICE_OPTIONS = [
  { id: 'intro', label: 'Làm quen', description: 'Khởi động nhẹ với một nhiệm vụ ngắn.' },
  { id: 'journal', label: 'Nhật ký sáng tạo', description: 'Viết và suy ngẫm theo từng bước.' },
  { id: 'sketch', label: 'Phác thảo', description: 'Vẽ nhanh ý tưởng trước khi hoàn thiện.' },
  { id: 'character', label: 'Tạo nhân vật', description: 'Xây dựng ngoại hình và tính cách nhân vật.' },
  { id: 'style', label: 'Thử phong cách', description: 'So sánh và chọn phong cách thể hiện.' },
  { id: 'ai_pick', label: 'Mô tả & chọn tham chiếu', description: 'Viết ý tưởng và chọn tư liệu an toàn làm tham chiếu.' },
  { id: 'story', label: 'Kể chuyện', description: 'Tạo câu chuyện có mở đầu, diễn biến và kết thúc.' },
  { id: 'video', label: 'Kế hoạch video', description: 'Lập kế hoạch chuyển động và các cảnh video ngắn.' },
  { id: 'palette', label: 'Bảng màu', description: 'Chọn màu phù hợp với thông điệp.' },
  { id: 'reflect', label: 'Tự đánh giá', description: 'Nhìn lại quá trình và nêu điều sẽ cải thiện.' },
  { id: 'ordering', label: 'Sắp xếp', description: 'Kéo thả các bước theo đúng trình tự.' },
] as const

export const GAME_OPTIONS = [
  { id: 'data-runner', label: 'Đường Đua Dữ Liệu', description: 'Chạy, nhảy và chọn dữ liệu phù hợp để huấn luyện AI.', choiceReady: true, selfContained: false },
  { id: 'truth-patrol', label: 'Biệt Đội Kiểm Chứng', description: 'Điều khiển phi thuyền quét nội dung AI cần kiểm tra.', choiceReady: true, selfContained: false },
  { id: 'battle-math', label: 'BattleMath · Kiểm Chứng AI', description: 'So sánh ảnh AI và phát hiện ảnh đúng nhất.', choiceReady: false, selfContained: true },
  { id: 'math-kids', label: 'AI Quiz · Khỉ Đá Bóng', description: 'Trắc nghiệm kiến thức AI – sút bóng vào lưới.', choiceReady: false, selfContained: true },
  { id: 'edukiz', label: 'Edukiz · Xưởng Huấn Luyện AI', description: 'Gắn nhãn, bảo vệ bí mật, lắp prompt, kiểm thử AI.', choiceReady: false, selfContained: true },
  { id: 'blockly', label: 'Blockly · Mê Cung Lập Trình', description: 'Xếp khối lệnh dẫn robot qua mê cung dữ liệu.', choiceReady: false, selfContained: true },
] as const

// WHY: 4 game tự-chứa không cần DB config (lobby/catalog/levels) — engine tự quản lý nội dung.
// Chỉ catalog games (data-runner, truth-patrol) mới bắt buộc JSON config từ DB.
const SELF_CONTAINED_GAMES = new Set(['battle-math', 'blockly', 'edukiz', 'math-kids'])

export const GAME_DIFFICULTIES = [
  { id: 'gentle', label: 'Nhẹ nhàng', description: 'Ít áp lực, ưu tiên gợi ý.' },
  { id: 'steady', label: 'Vừa sức', description: 'Nhịp mặc định cho đa số học sinh.' },
  { id: 'challenge', label: 'Nâng cao', description: 'Nhiều điểm thưởng và thử thách hơn.' },
] as const

function lines(value: string): string[] {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
}

function hasLength(value: string, minimum: number): boolean {
  return value.trim().length >= minimum
}

function parseGameContent(value?: string | null): Record<string, unknown> | null {
  if (!value || typeof value !== 'string' || !value.trim()) return null
  try {
    const parsed: unknown = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null
  } catch {
    return null
  }
}

function advancedGameConfigIsReady(draft: LectureDraft): boolean {
  const enabledTypes = draft.gameMode === 'student_choice'
    ? draft.gameAllowedTypes
    : [draft.gameType]

  // WHY: Self-contained games không cần JSON config — engine tự chứa nội dung.
  // Nếu tất cả game types đều self-contained thì bỏ qua validation JSON.
  const hasCatalogGame = enabledTypes.some((type) => !SELF_CONTAINED_GAMES.has(type))
  if (!hasCatalogGame) return true

  // Catalog games (data-runner, truth-patrol) bắt buộc cần lobby + catalog + levels/waves.
  const content = parseGameContent(draft.gameStructuredText)
  if (!content || !content.lobby || !Array.isArray(content.catalog)) return false
  return enabledTypes.every((type) => (
    SELF_CONTAINED_GAMES.has(type) ||
    (
      type === 'data-runner'
        ? Array.isArray(content.runnerLevels) && content.runnerLevels.length > 0
        : type === 'truth-patrol' &&
          Array.isArray(content.patrolWaves) &&
          content.patrolWaves.length > 0
    )
  ))
}

export function buildLectureGameConfig(
  draft: LectureDraft,
  quizQuestions?: Array<{ id: string; prompt: string; options: string[]; answer: number; why?: string }>,
) {
  const content = parseGameContent(draft.gameStructuredText) ?? {}
  const config: Record<string, unknown> = {
    ...content,
    selectionMode: draft.gameMode,
    allowedTypes:
      draft.gameMode === 'student_choice'
        ? draft.gameAllowedTypes
        : [draft.gameType],
    difficulty: draft.gameDifficulty,
    // WHY: questionCount và quizQuestions lưu per-bài trong JSONB metadata.
    // FE game engine dùng để slice đúng số câu hỏi cho học sinh.
    questionCount: draft.questionCount,
    ...(quizQuestions !== undefined && { quizQuestions }),
  }
  return config
}

export function serializeLectureGameConfig(
  _gameType: string,
  value: unknown,
): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ''
  const config = value as Record<string, unknown>
  const {
    selectionMode: _selectionMode,
    allowedTypes: _allowedTypes,
    difficulty: _difficulty,
    questionCount: _questionCount,
    quizQuestions: _quizQuestions,
    ...content
  } = config
  return Object.keys(content).length > 0 ? JSON.stringify(content, null, 2) : ''
}

function step(id: AuthoringStepId, label: string, checks: Array<[boolean, string]>): AuthoringStep {
  const missing = checks.filter(([valid]) => !valid).map(([, message]) => message)
  return { id, label, complete: missing.length === 0, missing }
}

function readiness(steps: AuthoringStep[]): AuthoringReadiness {
  const completed = steps.filter((item) => item.complete).length
  return { complete: completed === steps.length, completed, total: steps.length, steps }
}

export function slugifyAuthoringId(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('vi-VN')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '')
}

export function courseDraftReadiness(draft: CourseDraft): AuthoringReadiness {
  return readiness([
    step('basics', 'Hiển thị trên trang học', [
      [/^[a-z0-9-]{3,40}$/.test(draft.id), 'Đường dẫn khóa học'],
      [hasLength(draft.title, 3), 'Tên khóa học'],
      [hasLength(draft.shortTitle, 2), 'Tên ngắn'],
      [hasLength(draft.tagline, 5), 'Câu giới thiệu'],
      [hasLength(draft.description, 10), 'Mô tả khóa học'],
      [hasLength(draft.durationLabel, 2), 'Thời lượng'],
      [hasLength(draft.ageTrack, 2), 'Nhóm tuổi'],
      [hasLength(draft.courseKey, 2), 'Mã lộ trình'],
    ]),
    step('outcomes', 'Mục tiêu & sản phẩm', [
      [hasLength(draft.productLabel, 3), 'Sản phẩm cuối khóa'],
      [lines(draft.skillsText).some((item) => hasLength(item, 2)), 'Kỹ năng đạt được'],
      [lines(draft.outcomesText).some((item) => hasLength(item, 2)), 'Kết quả đầu ra'],
    ]),
    step('recognition', 'Hoàn thành & phần thưởng', [
      [hasLength(draft.credential, 3), 'Tên chứng nhận hoặc huy hiệu'],
      [hasLength(draft.finalAssessment, 10), 'Yêu cầu hoàn thành cuối khóa'],
    ]),
  ])
}

export function lectureDraftReadiness(draft: LectureDraft): AuthoringReadiness {
  const videoIsValid = !draft.videoUrl.trim() || /^https:\/\//i.test(draft.videoUrl.trim())
  const isIsland =
    draft.lessonFormat === 'aiki-island-6steps' ||
    Boolean(draft.sixStageJourney) ||
    (/^bai-\d+-\d+/i.test(draft.id) && draft.lessonFormat !== 'standard' && draft.lessonFormat !== 'aiki-rule-5steps' && draft.lessonFormat !== 'aiki-rule-3steps')
  const hasAikiRuleStage = !isIsland && (isAikiRuleLesson(draft.learnCards) || draft.learnCards.some((card) => AIKI_RULE_STAGE_KINDS.includes(card.kind as typeof AIKI_RULE_STAGE_KINDS[number])))

  const basicsStep = step('basics', 'Thông tin trạm', [
    [/^[a-z0-9-]{3,64}$/.test(draft.id), 'Đường dẫn bài học'],
    [hasLength(draft.title, 3), 'Tên bài học'],
    ...(isIsland ? [] : ([
      [hasLength(draft.skill, 3), 'Kỹ năng trọng tâm'],
      [hasLength(draft.hook, 5), 'Câu hỏi khởi động'],
      [
        lines(draft.goalsText).length >= 3 && lines(draft.goalsText).every((item) => hasLength(item, 10)),
        'Ít nhất 3 mục tiêu rõ ràng',
      ],
      [videoIsValid, 'Liên kết video HTTPS'],
    ] as [boolean, string][])),
  ])

  if (draft.lessonFormat === 'aiki-rule-3steps') {
    return readiness([
      basicsStep,
      step('content', '3 bước Quy tắc AIKI', [
        [hasLength(draft.title, 3), 'Tiêu đề quy tắc'],
        [Boolean(draft.videoUrl || draft.sixStageJourney?.stage3_video?.videoUrl || draft.learnCards?.[0]?.videoUrl), 'Video bài học'],
        [Boolean(draft.checkQuestions?.length > 0 || draft.checkQuestion || draft.sixStageJourney?.stage4_quiz?.questions?.length || draft.learnCards?.[1]), 'Câu hỏi kiểm tra phản xạ'],
      ]),
    ])
  }

  if (isIsland) {
    const j = draft.sixStageJourney
    return readiness([
      basicsStep,
      step('content', '6 Chặng Sư Phạm Đảo AIKids', [
        [Boolean(j?.stage1_goal?.title || draft.title), 'Chặng 1: Tiêu đề bài học'],
        [Boolean(j?.stage2_confirmGoal?.question), 'Chặng 2: Câu hỏi xác nhận mục tiêu'],
        [Boolean(j?.stage3_video?.videoUrl || draft.videoUrl), 'Chặng 3: Video bài giảng'],
        [Boolean(j?.stage4_quiz?.questions && j.stage4_quiz.questions.length > 0), 'Chặng 4: Câu hỏi bài test'],
        [Boolean(j?.stage5_practice?.subjectName), 'Chặng 5: Xưởng thực hành AI'],
        [Boolean(j?.stage6_completion?.title), 'Chặng 6: Màn kết thúc'],
      ]),
    ])
  }

  if (hasAikiRuleStage) {
    return readiness([
      basicsStep,
      step('content', '5 chặng Quy tắc AIKI', [
        [isAikiRuleLesson(draft.learnCards), 'Dạng Quy tắc AIKI cần đủ 5 chặng đúng thứ tự'],
        [draft.learnCards.every((card) => hasLength(card.title, 2)), 'Mỗi chặng cần có tiêu đề'],
        [draft.learnCards.every((card) => hasLength(card.body, 10) || hasLength(card.mee?.readText ?? '', 10)), 'Mỗi chặng cần có nội dung hoặc lời đọc đầy đủ'],
      ]),
    ])
  }

  return readiness([
    basicsStep,
    step('content', 'Khám phá', [
      [draft.learnCards.length >= 2, 'Ít nhất 2 khối nội dung Khám phá'],
      [draft.learnCards.every((card) => hasLength(card.title, 3) && hasLength(card.body, 30)), 'Mỗi khối Khám phá cần tiêu đề và nội dung đầy đủ'],
      [draft.learnCards.some((card) => card.kind === 'concept'), 'Cần ít nhất một khối Khái niệm'],
      [draft.learnCards.some((card) => card.kind === 'example' || card.kind === 'compare' || card.visualItems.length > 0), 'Cần ít nhất một ví dụ hoặc nội dung so sánh'],
    ]),
    step('game', 'Trò chơi', [
      [hasLength(draft.gameType, 2), 'Kiểu trò chơi'],
      [
        draft.gameMode === 'required' || draft.gameAllowedTypes.length >= 2,
        'Ít nhất 2 game cho học sinh lựa chọn',
      ],
      [hasLength(draft.gameInstruction, 10), 'Hướng dẫn trò chơi'],
      [hasLength(draft.gameOutcome, 5), 'Mục tiêu trò chơi'],
      [
        advancedGameConfigIsReady(draft),
        SELF_CONTAINED_GAMES.has(draft.gameType)
          ? 'Hướng dẫn và mục tiêu trò chơi'
          : 'Dữ liệu lobby, catalog và màn chơi JSON hợp lệ',
      ],
    ]),
    step('practice', 'Sáng tạo', [
      [PRACTICE_OPTIONS.some((option) => option.id === draft.practiceKind), 'Kiểu thực hành được CMS hỗ trợ'],
      [hasLength(draft.practiceInstruction, 10), 'Hướng dẫn thực hành'],
      [hasLength(draft.product, 3), 'Sản phẩm học sinh cần tạo'],
      [lines(draft.practiceStepsText).length >= 3, 'Ít nhất 3 bước học sinh thực hiện'],
      [lines(draft.successCriteriaText).length >= 3, 'Ít nhất 3 tiêu chí tự kiểm tra'],
      [hasLength(draft.reflectionPrompt, 10), 'Câu hỏi giúp học sinh nhìn lại sản phẩm'],
      [draft.practiceKind !== 'ordering' || lines(draft.practiceConfigText).length >= 3, 'Ít nhất 3 thẻ sắp xếp (Tiêu đề | Mô tả)'],
    ]),
    step('check', 'Thử tài', [
      // WHY: ưu tiên kiểm tra checkQuestions (mới), fallback sang field cũ nếu dữ liệu cũ.
      draft.checkQuestions.length > 0
        ? [
            draft.checkQuestions.length > 0,
            'Câu hỏi kiểm tra',
          ] as [boolean, string]
        : [
            hasLength(draft.checkQuestion, 5),
            'Câu hỏi kiểm tra',
          ] as [boolean, string],
      draft.checkQuestions.length > 0
        ? [
            draft.checkQuestions.every((q) => q.options.length >= 2 && q.options.every((o) => o.trim().length > 0)),
            'Đáp án hợp lệ cho tất cả câu hỏi',
          ] as [boolean, string]
        : [
            [draft.checkOption1, draft.checkOption2, draft.checkOption3].every((item) => hasLength(item, 1)),
            '3 lựa chọn trả lời',
          ] as [boolean, string],
    ]),
  ])
}

// ─── Question Bank Types ───────────────────────────────────────────────────────
// WHY: Dùng chung giữa QuestionBankPicker và QuizQuestionBuilder.

export type QuestionBankItem = {
  id: string
  prompt: string
  options: string[]
  answer: number
  explanation: string
  imageUrl?: string | null
  tags: string[]
  ageMin: number
  ageMax: number
  difficulty: 'gentle' | 'steady' | 'challenge'
  sortOrder: number
}

export type QuestionBankBank = {
  id: string
  title: string
  description?: string | null
  isSystem: boolean
  itemCount: number
  isOwner: boolean
}

export const QUESTION_BANK_TAGS: { id: string; label: string; emoji: string }[] = [
  { id: 'ai-basics', label: 'AI Là Gì?', emoji: '🤖' },
  { id: 'data', label: 'Dữ Liệu', emoji: '📊' },
  { id: 'machine-learning', label: 'Học Máy', emoji: '🧠' },
  { id: 'ai-ethics', label: 'Đạo Đức AI', emoji: '⚖️' },
  { id: 'privacy', label: 'Quyền Riêng Tư', emoji: '🔒' },
  { id: 'ai-creativity', label: 'AI Sáng Tạo', emoji: '🎨' },
  { id: 'real-world', label: 'AI Quanh Ta', emoji: '🌟' },
  { id: 'nlp', label: 'Ngôn Ngữ AI', emoji: '💬' },
  { id: 'robots', label: 'Robot', emoji: '🦾' },
  { id: 'ai-future', label: 'Tương Lai AI', emoji: '🚀' },
  { id: 'ai-skills', label: 'Kỹ Năng AI', emoji: '⭐' },
  { id: 'bias', label: 'Thiên Vị', emoji: '⚠️' },
]

// ─── Visual game config types ──────────────────────────────────────────────────
// WHY: Dùng trong RunnerLevelBuilder / PatrolWaveBuilder thay vì JSON textarea thô.

export type RunnerItem = {
  id: string
  label: string
  imageUrl: string
  type: 'collect' | 'avoid'
  lane?: number
}

export type RunnerLevel = {
  id: string
  title: string
  mission: string
  backgroundUrl: string
  speed?: number
  items: RunnerItem[]
}

export type PatrolTarget = {
  id: string
  text: string
  label: string    // 'fact' | 'opinion' | 'fake' | 'ai-generated'
  imageUrl?: string
}

export type PatrolWave = {
  id: string
  title: string
  backgroundUrl: string
  targets: PatrolTarget[]
}

export type RunnerGameConfig = {
  lobby: { title: string; description: string; imageUrl: string }
  catalog: Array<{ id: string; title: string; description: string; thumbnail: string }>
  runnerLevels: RunnerLevel[]
}

export type PatrolGameConfig = {
  lobby: { title: string; description: string; imageUrl: string }
  catalog: Array<{ id: string; title: string; description: string; thumbnail: string }>
  patrolWaves: PatrolWave[]
}

/**
 * Convert visual RunnerGameConfig to JSON string (gameStructuredText).
 */
export function serializeRunnerConfig(config: RunnerGameConfig): string {
  return JSON.stringify(config, null, 2)
}

/**
 * Parse JSON string to RunnerGameConfig, return null if invalid.
 */
export function parseRunnerConfig(raw: string): RunnerGameConfig | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    const c = parsed as Record<string, unknown>
    if (!c.lobby || !Array.isArray(c.catalog) || !Array.isArray(c.runnerLevels)) return null
    return c as unknown as RunnerGameConfig
  } catch {
    return null
  }
}

/**
 * Parse JSON string to PatrolGameConfig, return null if invalid.
 */
export function parsePatrolConfig(raw: string): PatrolGameConfig | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    const c = parsed as Record<string, unknown>
    if (!c.lobby || !Array.isArray(c.catalog) || !Array.isArray(c.patrolWaves)) return null
    return c as unknown as PatrolGameConfig
  } catch {
    return null
  }
}

/** Tạo RunnerLevel mới rỗng */
export function newRunnerLevel(index: number): RunnerLevel {
  return {
    id: `level-${Date.now()}-${index}`,
    title: `Màn ${index + 1}`,
    mission: '',
    backgroundUrl: '/assets/game/idea-island-map.webp',
    speed: 5,
    items: [],
  }
}

/** Tạo PatrolWave mới rỗng */
export function newPatrolWave(index: number): PatrolWave {
  return {
    id: `wave-${Date.now()}-${index}`,
    title: `Đợt ${index + 1}`,
    backgroundUrl: '/assets/game/idea-island-map.webp',
    targets: [],
  }
}

// ─── Six-Stage Island Course Helpers & Draft Normalization ────────────────────

export const ISLAND_6_STAGE_NAMES = [
  '1. Mục tiêu (Ảnh)',
  '2. Xác nhận',
  '3. Video bài học',
  '4. Bài test thử tài',
  '5. Thực hành',
  '6. Kết thúc',
] as const

export const COURSE_GOAL_BLOCK_PREFIX = 'course-goal-'
export const COURSE_CONFIRM_BLOCK_PREFIX = 'course-confirm-'
export const COURSE_VIDEO_BLOCK_PREFIX = 'course-video-'
export const COURSE_QUIZ_BLOCK_PREFIX = 'course-quiz-'
export const COURSE_PRACTICE_BLOCK_PREFIX = 'course-practice-'
export const COURSE_REWARD_BLOCK_PREFIX = 'course-reward-'

export const FOUR_KEYS_METADATA = [
  { label: 'CÁI GÌ', sub: 'Ai, đồ vật gì', tone: 'sky' as const, keyImage: '/assets/aiki-keys/key_what_blue.jpg' },
  { label: 'TRÔNG THẾ NÀO', sub: 'Màu sắc, hình dáng', tone: 'sun' as const, keyImage: '/assets/aiki-keys/key_how_yellow.jpg' },
  { label: 'ĐANG LÀM GÌ', sub: 'Hành động', tone: 'coral' as const, keyImage: '/assets/aiki-keys/key_action_orange.jpg' },
  { label: 'Ở ĐÂU', sub: 'Bối cảnh, nơi chốn', tone: 'rose' as const, keyImage: '/assets/aiki-keys/key_where_pink.jpg' },
] as const

export function goalKeyItems(keyPoints: string[]): LearnVisualItemDraft[] {
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

    const subMatch = rawPrefix.match(/^(.*?)(?:\s*\((.*?)\))?$/)
    let parsedLabel = subMatch && subMatch[1] ? subMatch[1].trim() : (rawPrefix || defaultMeta.label)
    let parsedSub = subMatch && subMatch[2] ? subMatch[2].trim() : defaultMeta.sub

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

export function buildCourseGoalBlocks(journey: LessonSixStageJourney, existing: StageBlockItem[] = []): StageBlockItem[] {
  if (journey.stageBlockEditorVersion === 2) return existing.filter((block) => block.type !== 'voice')
  const existingFourKeys = existing.find((block) => block.type === 'layout-four-keys')
  const existingText = existing.find((block) => block.type === 'text' || block.id.startsWith(`${COURSE_GOAL_BLOCK_PREFIX}text`))
  const existingImage = existing.find((block) => block.type === 'images' || block.id.startsWith(`${COURSE_GOAL_BLOCK_PREFIX}image`))
  const authoredExtras = existing.filter((block) =>
    !block.id.startsWith(COURSE_GOAL_BLOCK_PREFIX) && block !== existingFourKeys && block !== existingText && block !== existingImage && block.type !== 'voice'
  )
  return [
    { id: `${COURSE_GOAL_BLOCK_PREFIX}text`, type: 'text', title: existingText?.title || journey.stage1_goal.title, body: existingText?.body || journey.stage1_goal.goalText },
    {
      ...createFourKeysBlock(`${COURSE_GOAL_BLOCK_PREFIX}four-keys`),
      ...(existingFourKeys || {}),
      id: `${COURSE_GOAL_BLOCK_PREFIX}four-keys`,
      visualItems: existingFourKeys?.visualItems?.length ? existingFourKeys.visualItems.slice(0, 4) : goalKeyItems(journey.stage1_goal.keyPoints),
    },
    { id: `${COURSE_GOAL_BLOCK_PREFIX}image`, type: 'images', title: 'Ảnh mục tiêu', imageUrl: existingImage?.imageUrl || journey.stage1_goal.imageUrl, imageAlt: journey.stage1_goal.title, additionalImages: [] },
    ...authoredExtras,
  ]
}

export function confirmKeyItems(option: LessonSixStageJourney['stage2_confirmGoal']['options'][number]): LearnVisualItemDraft[] {
  if (option.keyItems?.length) return option.keyItems.slice(0, 4).map((item, index) => ({
    label: item.label,
    text: item.label,
    tone: (['sky', 'sun', 'coral', 'brand'] as const)[index],
  }))
  const [, values = ''] = option.text.split(':')
  return goalKeyItems(values.split('·').map((item) => item.trim()).filter(Boolean))
}

export function buildCourseConfirmBlocks(journey: LessonSixStageJourney, existing: StageBlockItem[] = []): StageBlockItem[] {
  // Tìm block interactive confirm trong existing
  const existingUnified = existing.find(
    (b) =>
      b.id === `${COURSE_CONFIRM_BLOCK_PREFIX}quiz` ||
      (b.type === 'layout-confirm-option' && !b.id.startsWith('course-confirm-option-')) ||
      (b.type === 'quiz-question' && b.id.startsWith(COURSE_CONFIRM_BLOCK_PREFIX))
  )

  const authoredExtras = existing.filter(
    (b) =>
      b !== existingUnified &&
      !b.id.startsWith(COURSE_CONFIRM_BLOCK_PREFIX) &&
      b.type !== 'voice'
  )

  if (existingUnified) {
    const rawOptions = (existingUnified.questionOptions && existingUnified.questionOptions.length > 0)
      ? existingUnified.questionOptions
      : (journey.stage2_confirmGoal?.options?.map((opt, idx) => ({
          id: opt.id || `opt-${idx + 1}`,
          text: opt.text,
          imageUrl: opt.imageUrl || '',
        })) || [
          { id: 'opt-1', text: 'Phương án A', imageUrl: '' },
          { id: 'opt-2', text: 'Phương án B', imageUrl: '' },
        ])

    // Merge imageUrl nếu option trong existing bị thiếu mà journey có
    const mergedOptions = rawOptions.map((opt, idx) => {
      const journeyOpt = journey.stage2_confirmGoal?.options?.[idx]
      return {
        ...opt,
        imageUrl: opt.imageUrl || journeyOpt?.imageUrl || '',
      }
    })

    const hasOptImgs = mergedOptions.some((o) => Boolean(o.imageUrl))
    const isActuallyCards = existingUnified.layoutMode === 'cards' || hasOptImgs || (existingUnified.visualUrl === mergedOptions[0]?.imageUrl)
    const resolvedLayout = isActuallyCards ? 'cards' : (existingUnified.layoutMode || journey.stage2_confirmGoal?.layoutMode || 'cards')

    return [
      {
        ...existingUnified,
        id: `${COURSE_CONFIRM_BLOCK_PREFIX}quiz`,
        type: 'layout-confirm-option',
        title: existingUnified.title || 'Câu hỏi xác nhận mục tiêu',
        questionPrompt: existingUnified.questionPrompt || existingUnified.title || journey.stage2_confirmGoal?.question || 'Bé hãy chọn phương án chính xác nhất nhé!',
        layoutMode: resolvedLayout,
        visualUrl: resolvedLayout === 'cards' ? '' : (existingUnified.visualUrl || journey.stage2_confirmGoal?.visualUrl || ''),
        questionOptions: mergedOptions,
        correctIndex: typeof existingUnified.correctIndex === 'number'
          ? existingUnified.correctIndex
          : (journey.stage2_confirmGoal?.correctIndex ?? 0),
        explanation: existingUnified.explanation || journey.stage2_confirmGoal?.explanation || '',
      },
      ...authoredExtras,
    ]
  }

  // Khởi tạo khối unified mới từ journey.stage2_confirmGoal
  const defaultOptions = (journey.stage2_confirmGoal?.options && journey.stage2_confirmGoal.options.length > 0)
    ? journey.stage2_confirmGoal.options.map((option, index) => ({
        id: option.id || `opt-${index + 1}`,
        text: option.text.includes(':') ? option.text.split(':')[1]?.trim() || option.text : option.text,
        imageUrl: option.imageUrl || '',
      }))
    : [
        { id: 'opt-1', text: 'Phương án A (Đáp án đúng)', imageUrl: '' },
        { id: 'opt-2', text: 'Phương án B', imageUrl: '' },
      ]

  const hasOptImgs = defaultOptions.some((o) => Boolean(o.imageUrl))
  const unifiedConfirmBlock: StageBlockItem = {
    id: `${COURSE_CONFIRM_BLOCK_PREFIX}quiz`,
    type: 'layout-confirm-option',
    title: 'Câu hỏi xác nhận mục tiêu',
    questionPrompt: journey.stage2_confirmGoal?.question || 'Bé hãy chọn phương án chính xác nhất nhé!',
    layoutMode: hasOptImgs ? 'cards' : (journey.stage2_confirmGoal?.layoutMode || (journey.stage2_confirmGoal?.visualUrl ? 'split' : 'cards')),
    visualUrl: hasOptImgs ? '' : (journey.stage2_confirmGoal?.visualUrl || ''),
    questionOptions: defaultOptions,
    correctIndex: journey.stage2_confirmGoal?.correctIndex ?? 0,
    explanation: journey.stage2_confirmGoal?.explanation || 'Tuyệt vời! Bé đã nắm rất vững mục tiêu bài học.',
    readText: journey.stage2_confirmGoal?.speech || '',
  }

  return [unifiedConfirmBlock, ...authoredExtras]
}

export function buildCourseQuizBlocks(journey: LessonSixStageJourney, existing: StageBlockItem[] = []): StageBlockItem[] {
  const existingQuizBlocks = existing.filter(
    (b) =>
      b.type === 'quiz-question' ||
      b.id.startsWith(COURSE_QUIZ_BLOCK_PREFIX) ||
      b.id.startsWith('blk-quiz-') ||
      Boolean(b.quizQuestions?.length) ||
      Boolean(b.questionPrompt)
  )
  const authoredExtras = existing.filter(
    (b) => !existingQuizBlocks.includes(b) && b.type !== 'voice'
  )

  const fallbackQuizVisual =
    journey.stage3_video?.posterUrl ||
    journey.stage1_goal?.imageUrl ||
    journey.stage2_confirmGoal?.visualUrl ||
    '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'

  let combinedQuestions: Array<{
    id: string
    prompt: string
    layoutMode?: 'cards' | 'split' | 'list'
    visualUrl?: string
    options: string[]
    correctIndex: number
    explanation?: string
    optionImages?: string[]
  }> = []

  const existingUnified = existingQuizBlocks.find((b) => Array.isArray(b.quizQuestions) && b.quizQuestions.length > 0)

  if (existingUnified && existingUnified.quizQuestions) {
    combinedQuestions = existingUnified.quizQuestions.map((q, idx) => {
      const hasOptionImages =
        (Array.isArray(q.options) && q.options.some((opt: any) => typeof opt !== 'string' && Boolean(opt.imageUrl))) ||
        Boolean(q.optionImages?.some(Boolean))
      return {
        id: q.id || `q-${idx + 1}`,
        prompt: q.prompt || '',
        layoutMode: q.layoutMode || (hasOptionImages ? 'cards' : 'split'),
        visualUrl: q.visualUrl || fallbackQuizVisual,
        options: Array.isArray(q.options)
          ? q.options.map((opt: any) => typeof opt === 'string' ? opt : (opt.text || ''))
          : ['Phương án A', 'Phương án B'],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        explanation: q.explanation || '',
        optionImages: Array.isArray(q.optionImages)
          ? q.optionImages
          : (Array.isArray(q.options) ? q.options.map((opt: any) => typeof opt !== 'string' ? (opt.imageUrl || '') : '') : []),
      }
    })
  } else if (existingQuizBlocks.length > 0) {
    combinedQuestions = existingQuizBlocks.map((b, idx) => {
      const hasOptionImages = b.questionOptions?.some((o) => Boolean(o.imageUrl))
      const visual = b.visualUrl || b.imageUrl || fallbackQuizVisual
      const layoutMode = (b.layoutMode === 'cards' && !hasOptionImages)
        ? 'split'
        : (b.layoutMode || (hasOptionImages ? 'cards' : 'split'))
      return {
        id: b.id.replace(COURSE_QUIZ_BLOCK_PREFIX, '').replace('blk-quiz-', '') || `q-${idx + 1}`,
        prompt: b.questionPrompt || b.title || `Câu hỏi ${idx + 1}`,
        layoutMode,
        visualUrl: visual,
        options: (Array.isArray(b.questionOptions) && b.questionOptions.length > 0)
          ? b.questionOptions.map((o) => o.text)
          : (b.optionLabels || ['Phương án A', 'Phương án B']),
        correctIndex: typeof b.correctIndex === 'number' ? b.correctIndex : 0,
        explanation: b.explanation || b.tip || '',
        optionImages: b.questionOptions?.map((o) => o.imageUrl || '') || b.optionImages || [],
      }
    })
  } else {
    const questions = journey.stage4_quiz?.questions || []
    if (questions.length === 0) {
      combinedQuestions = [
        {
          id: 'q-1',
          prompt: 'Bé hãy chọn câu trả lời đúng nhất nhé!',
          layoutMode: 'split',
          visualUrl: fallbackQuizVisual,
          options: ['Phương án A (Chính xác)', 'Phương án B'],
          correctIndex: 0,
          explanation: 'Chúc mừng bé đã trả lời đúng!',
          optionImages: ['', ''],
        },
      ]
    } else {
      combinedQuestions = questions.map((q, idx) => {
        const hasOptionImages =
          (Array.isArray(q.options) && q.options.some((opt: any) => typeof opt !== 'string' && Boolean(opt.imageUrl))) ||
          Boolean(q.optionImages?.some(Boolean))
        const visual = q.visualUrl || fallbackQuizVisual
        const layoutMode = q.layoutMode || (hasOptionImages ? 'cards' : 'split')

        return {
          id: q.id || `q-${idx + 1}`,
          prompt: q.prompt || '',
          layoutMode,
          visualUrl: visual,
          options: (Array.isArray(q.options) && q.options.length > 0)
            ? q.options.map((opt: any) => typeof opt === 'string' ? opt : (opt.text || ''))
            : ['Phương án A (Đáp án đúng)', 'Phương án B'],
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
          explanation: q.explanation || '',
          optionImages: (Array.isArray(q.options) && q.options.length > 0)
            ? q.options.map((opt: any, oIdx: number) => typeof opt === 'string' ? (q.optionImages?.[oIdx] || '') : (opt.imageUrl || q.optionImages?.[oIdx] || ''))
            : ['', ''],
        }
      })
    }
  }

  const activeIdx = (existingUnified?.activeQuizQuestionIdx && existingUnified.activeQuizQuestionIdx < combinedQuestions.length)
    ? existingUnified.activeQuizQuestionIdx
    : 0
  const activeQ = combinedQuestions[activeIdx] || combinedQuestions[0]

  const unifiedQuizBlock: StageBlockItem = {
    id: `${COURSE_QUIZ_BLOCK_PREFIX}main`,
    type: 'quiz-question',
    title: journey.stage4_quiz?.title || 'Thử tài kiến thức trắc nghiệm',
    quizQuestions: combinedQuestions,
    activeQuizQuestionIdx: activeIdx,
    questionPrompt: activeQ?.prompt || '',
    layoutMode: activeQ?.layoutMode || 'split',
    visualUrl: activeQ?.visualUrl || fallbackQuizVisual,
    imageUrl: activeQ?.visualUrl || fallbackQuizVisual,
    correctIndex: activeQ?.correctIndex ?? 0,
    explanation: activeQ?.explanation || '',
    questionOptions: activeQ?.options?.map((text: string, oIdx: number) => ({
      id: `opt-${oIdx + 1}`,
      text,
      imageUrl: activeQ?.optionImages?.[oIdx] || '',
    })) || [
      { id: 'opt-1', text: 'Phương án A (Đáp án đúng)', imageUrl: '' },
      { id: 'opt-2', text: 'Phương án B', imageUrl: '' },
    ],
  }

  return [unifiedQuizBlock, ...authoredExtras]
}

export function buildCourseVideoBlocks(journey: LessonSixStageJourney, existing: StageBlockItem[] = []): StageBlockItem[] {
  const existingVideo = existing.find((b) => b.type === 'video' || b.id.startsWith(COURSE_VIDEO_BLOCK_PREFIX))
  const authoredExtras = existing.filter((b) => b !== existingVideo && b.type !== 'voice')

  if (existingVideo) {
    return [
      {
        ...existingVideo,
        id: existingVideo.id || `${COURSE_VIDEO_BLOCK_PREFIX}main`,
        type: 'video',
        title: existingVideo.title || journey.stage3_video?.title || 'Video bài giảng',
        videoUrl: existingVideo.videoUrl || journey.stage3_video?.videoUrl || '',
        posterUrl: existingVideo.posterUrl || journey.stage3_video?.posterUrl || '',
        durationSec: existingVideo.durationSec || journey.stage3_video?.durationSec || 180,
        timestamps: (existingVideo.timestamps && existingVideo.timestamps.length > 0)
          ? existingVideo.timestamps
          : (journey.stage3_video?.timestamps || []),
      },
      ...authoredExtras,
    ]
  }

  return [
    {
      id: `${COURSE_VIDEO_BLOCK_PREFIX}main`,
      type: 'video',
      title: journey.stage3_video?.title || 'Video bài giảng',
      videoUrl: journey.stage3_video?.videoUrl || '',
      posterUrl: journey.stage3_video?.posterUrl || '',
      durationSec: journey.stage3_video?.durationSec || 180,
      timestamps: journey.stage3_video?.timestamps || [],
    },
    ...authoredExtras,
  ]
}

export function buildCoursePracticeBlocks(journey: LessonSixStageJourney, existing: StageBlockItem[] = []): StageBlockItem[] {
  const existingPractice = existing.find((b) => b.type === 'practice' || b.id.startsWith(COURSE_PRACTICE_BLOCK_PREFIX))
  const authoredExtras = existing.filter((b) => b !== existingPractice && b.type !== 'voice')

  if (existingPractice) {
    return [
      {
        ...existingPractice,
        id: existingPractice.id || `${COURSE_PRACTICE_BLOCK_PREFIX}main`,
        type: 'practice',
        title: existingPractice.title || journey.stage5_practice?.title || 'Thực hành sáng tạo',
        practiceConfig: existingPractice.practiceConfig || journey.stage5_practice,
      },
      ...authoredExtras,
    ]
  }

  return [
    {
      id: `${COURSE_PRACTICE_BLOCK_PREFIX}main`,
      type: 'practice',
      title: journey.stage5_practice?.title || 'Thực hành sáng tạo',
      practiceConfig: journey.stage5_practice,
    },
    ...authoredExtras,
  ]
}

export function buildCourseRewardBlocks(journey: LessonSixStageJourney, existing: StageBlockItem[] = []): StageBlockItem[] {
  const existingReward = existing.find((b) => b.type === 'reward' || b.id.startsWith(COURSE_REWARD_BLOCK_PREFIX))
  const authoredExtras = existing.filter((b) => b !== existingReward && b.type !== 'voice')

  if (existingReward) {
    return [
      {
        ...existingReward,
        id: existingReward.id || `${COURSE_REWARD_BLOCK_PREFIX}main`,
        type: 'reward',
        title: existingReward.title || journey.stage6_completion?.title || 'Chúc mừng hoàn thành bài học!',
        body: existingReward.body || journey.stage6_completion?.congratsMessage || '',
        rewardConfig: existingReward.rewardConfig || journey.stage6_completion,
      },
      ...authoredExtras,
    ]
  }

  return [
    {
      id: `${COURSE_REWARD_BLOCK_PREFIX}main`,
      type: 'reward',
      title: journey.stage6_completion?.title || 'Chúc mừng hoàn thành bài học!',
      body: journey.stage6_completion?.congratsMessage || '',
      rewardConfig: journey.stage6_completion,
    },
    ...authoredExtras,
  ]
}


export function isLegacyAikiCourseResidue(card: LearnCardDraft, encodedItem?: LearnVisualItemDraft) {
  return Boolean(encodedItem) ||
    card.id.startsWith('aiki-rule-') ||
    ['situation', 'aiki-riddle', 'rule', 'explanation', 'closing'].includes(card.kind) ||
    /câu đố của aiki|mèo aiki|quy tắc vàng/i.test(card.title)
}

export function defaultLearnCards(concept = '', example = ''): LearnCardDraft[] {
  return [
    { id: 'concept', title: 'Khám phá ý chính', body: concept, tip: '', kind: 'concept', layout: 'text', visualItems: [], mee: { readText: '', gesture: 'presentation', autoRead: false } },
    { id: 'example', title: 'Ví dụ để hiểu rõ', body: example, tip: '', kind: 'example', layout: 'split', visualItems: [], mee: { readText: '', gesture: 'point-left', autoRead: false } },
  ]
}

export function normalizeLearnKind(value: unknown, index: number, id = '', isAiki = false): LearnCardDraft['kind'] {
  const encodedKind = ({
    'aiki-rule-situation': 'situation',
    'aiki-rule-riddle': 'aiki-riddle',
    'aiki-rule-rule': 'rule',
    'aiki-rule-explanation': 'explanation',
    'aiki-rule-closing': 'closing',
  } as const)[id as 'aiki-rule-situation']
  if (encodedKind) return encodedKind
  if (value === 'situation' || value === 'aiki-riddle' || value === 'rule' || value === 'explanation' || value === 'closing') return value
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

export function normalizeLearnLayout(value: unknown, hasVisualItems: boolean, kind: LearnCardDraft['kind']): LearnCardDraft['layout'] {
  if (value === 'text' || value === 'split' || value === 'visual-grid' || value === 'storyboard') return value
  if (kind === 'storyboard') return 'storyboard'
  return hasVisualItems ? 'split' : 'text'
}

export function normalizeLectureDraft(draft: LectureDraft, courseId = ''): LectureDraft {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const explicitFormat = (draft as any).lessonFormat || (draft as any).gameConfig?.lessonFormat
  const isRuleByCourse = courseId.toLowerCase() === 'aiki-rules' || courseId.toLowerCase().includes('rule') || isAikiRuleJourney(courseId)
  const isRuleCandidate = isAikiRuleJourney(draft) || isRuleByCourse
  const hasIslandContract =
    !isRuleCandidate &&
    (explicitFormat === 'aiki-island-6steps' ||
      courseId.startsWith('dao-') ||
      courseId.includes('island') ||
      Boolean(draft.metadata?.sixStageJourney) ||
      Boolean(draft.sixStageJourney) ||
      Boolean(draft.id && /^bai-\d+-\d+/i.test(draft.id)))
  const format: LessonFormat = explicitFormat === 'aiki-island-6steps'
    ? 'aiki-island-6steps'
    : explicitFormat === 'aiki-rule-3steps'
    ? 'aiki-rule-3steps'
    : explicitFormat === 'aiki-rule-5steps'
    ? 'aiki-rule-5steps'
    : isRuleCandidate
    ? 'aiki-rule-3steps'
    : hasIslandContract
    ? 'aiki-island-6steps'
    : explicitFormat === 'standard'
    ? 'standard'
    : isAikiRuleLesson(draft.learnCards || [])
    ? 'aiki-rule-5steps'
    : (Array.isArray(draft.learnCards) && draft.learnCards.length === 3)
    ? 'aiki-rule-3steps'
    : (draft.lessonFormat ?? 'standard')
  const isIsland = format === 'aiki-island-6steps'
  const isRule3Steps = format === 'aiki-rule-3steps'
  const isAiki5Steps = format === 'aiki-rule-5steps'
  const isAiki = isRule3Steps || isAiki5Steps

  let sixStageJourney = draft.sixStageJourney || ((draft as any).metadata?.sixStageJourney as LessonSixStageJourney | undefined)
  if (isIsland) {
    try {
      sixStageJourney = resolveIslandSixStageJourney({ ...draft, sixStageJourney } as any)
    } catch {
      // ignore
    }
  }

  // ── AIKI Rules SSOT Data Injection ──
  const isAikiRule = isRule3Steps || isAikiRuleJourney(draft) || isRuleByCourse
  let matchedRule: (typeof AIKI_RULES_DATA)[number] | undefined
  if (isAikiRule) {
    const ruleNum = extractRuleNumber(draft)
    matchedRule = AIKI_RULES_DATA.find((r) => r.id === ruleNum) || AIKI_RULES_DATA[0]

    // Nạp dữ liệu THẬT của quy tắc vào draft nếu chưa có:
    if (!draft.videoUrl) {
      draft.videoUrl = matchedRule.videoUrl || ''
    }
    if (!draft.duration) {
      draft.duration = `${matchedRule.durationSec}s`
    }
    if (!draft.hook) {
      draft.hook = matchedRule.goal
    }
    if (!draft.skill) {
      draft.skill = matchedRule.skill
    }
    if (!draft.checkQuestions || draft.checkQuestions.length === 0) {
      draft.checkQuestions = (matchedRule.questions || []).map((q, idx) => ({
        id: q.id || `rule-${matchedRule!.id}-q-${idx + 1}`,
        prompt: q.prompt,
        options: [...q.options],
        answer: q.correctIndex,
        explain: q.successFeedback || q.hint || '',
      }))
    }

    const ruleTimestamps = matchedRule.slides?.map((slide, index) => ({
      label: slide.stage,
      startSec: index * 12,
      endSec: (index + 1) * 12,
      speech: slide.dialogue,
    })) || []

    const ruleQuizQuestions = (matchedRule.questions || []).map((q, idx) => ({
      id: q.id || `rule-${matchedRule!.id}-q-${idx + 1}`,
      prompt: q.prompt,
      options: [...q.options],
      correctIndex: q.correctIndex,
      explanation: q.successFeedback || q.hint || '',
      visualUrl: q.visualUrl,
    }))

    const ruleBadgeName = `Huy hiệu ${matchedRule.code}: ${matchedRule.shortTitle}`

    if (!sixStageJourney) {
      sixStageJourney = {
        stage1_goal: {
          id: `${draft.id || 'rule'}-goal`,
          title: draft.title || matchedRule.title,
          goalText: draft.hook || matchedRule.goal,
          imageUrl: matchedRule.posterImage,
          speech: matchedRule.akiTip || draft.skill || '',
          keyPoints: [matchedRule.shortTitle || matchedRule.skill],
        },
        stage2_confirmGoal: {
          id: `${draft.id || 'rule'}-confirm`,
          question: draft.hook || matchedRule.goal || 'Bé hãy chọn phương án chính xác nhất nhé!',
          options: [{ id: 'opt-1', text: 'Hiểu rõ' }, { id: 'opt-2', text: 'Chưa hiểu' }],
          correctIndex: 0,
          explanation: 'Tuyệt vời!',
          speech: 'Bé hãy chọn phương án chính xác nhất nhé!',
        },
        stage3_video: {
          id: `${draft.id || 'rule'}-video`,
          title: draft.title || matchedRule.title,
          videoUrl: draft.videoUrl || matchedRule.videoUrl || '',
          posterUrl: matchedRule.posterImage,
          durationSec: matchedRule.durationSec,
          timestamps: ruleTimestamps,
        },
        stage4_quiz: {
          id: `${draft.id || 'rule'}-quiz`,
          title: `Thử tài phản xạ: ${matchedRule.shortTitle}`,
          questions: ruleQuizQuestions,
          passScore: 1,
        },
        stage5_practice: {
          id: `${draft.id || 'rule'}-practice`,
          title: 'Thực hành',
          subjectName: draft.title || matchedRule.shortTitle,
          badge: matchedRule.code,
          illustrationType: 'rule-practice',
          lockedFeatures: [matchedRule.shortTitle],
          akiMotto: matchedRule.akiTip,
          maxAttempts: 3,
          workflowSteps: [],
        },
        stage6_completion: {
          id: `${draft.id || 'rule'}-complete`,
          title: `Hoàn thành bài học: ${matchedRule.shortTitle}!`,
          congratsMessage: `Tuyệt vời! Bé đã làm chủ bài học "${matchedRule.shortTitle}"!`,
          rewardBadge: {
            name: ruleBadgeName,
            iconUrl: matchedRule.posterImage,
            stars: 3,
            xp: 50,
          },
        },
      }
    } else {
      sixStageJourney = {
        ...sixStageJourney,
        stage3_video: {
          ...(sixStageJourney.stage3_video || {
            id: `${draft.id || 'rule'}-video`,
            title: draft.title || matchedRule.title,
          }),
          videoUrl: draft.videoUrl || matchedRule.videoUrl || sixStageJourney.stage3_video?.videoUrl || '',
          posterUrl: matchedRule.posterImage,
          durationSec: matchedRule.durationSec,
          timestamps: (sixStageJourney.stage3_video?.timestamps && sixStageJourney.stage3_video.timestamps.length > 0)
            ? sixStageJourney.stage3_video.timestamps
            : ruleTimestamps,
        },
        stage4_quiz: {
          ...(sixStageJourney.stage4_quiz || {
            id: `${draft.id || 'rule'}-quiz`,
            title: `Thử tài phản xạ: ${matchedRule.shortTitle}`,
            passScore: 1,
          }),
          questions: (draft.checkQuestions && draft.checkQuestions.length > 0)
            ? draft.checkQuestions.map((q, idx) => ({
                id: q.id || `rule-${matchedRule!.id}-q-${idx + 1}`,
                prompt: q.prompt,
                options: [...q.options],
                correctIndex: q.answer,
                explanation: q.explain,
                visualUrl: matchedRule!.questions?.[idx]?.visualUrl,
              }))
            : ruleQuizQuestions,
        },
        stage6_completion: {
          ...(sixStageJourney.stage6_completion || {
            id: `${draft.id || 'rule'}-complete`,
            title: `Hoàn thành bài học: ${matchedRule.shortTitle}!`,
            congratsMessage: `Tuyệt vời! Bé đã làm chủ bài học "${matchedRule.shortTitle}"!`,
          }),
          rewardBadge: {
            name: ruleBadgeName,
            iconUrl: matchedRule.posterImage,
            stars: sixStageJourney.stage6_completion?.rewardBadge?.stars ?? 3,
            xp: sixStageJourney.stage6_completion?.rewardBadge?.xp ?? 50,
          },
        },
      }
    }
  }

  // ── Synchronize station reward badge ──
  let rewardName = draft.reward?.trim() || ''
  if (isAikiRule && matchedRule) {
    if (!rewardName) {
      rewardName = `Huy hiệu ${matchedRule.code}: ${matchedRule.shortTitle}`
    }
  }
  if (isIsland || Boolean(sixStageJourney)) {
    const fallbackBadgeName = rewardName || ('Huy hiệu ' + (draft.title || '')).trim()
    if (sixStageJourney) {
      const currentBadge = sixStageJourney.stage6_completion?.rewardBadge
      if (!currentBadge || !currentBadge.name?.trim()) {
        sixStageJourney = {
          ...sixStageJourney,
          stage6_completion: {
            ...(sixStageJourney.stage6_completion || {
              id: `${draft.id || 'lesson'}-complete`,
              title: 'Chúc mừng bé hoàn thành bài học!',
              congratsMessage: '',
            }),
            rewardBadge: {
              name: currentBadge?.name?.trim() || fallbackBadgeName,
              iconUrl: currentBadge?.iconUrl || '',
              stars: currentBadge?.stars ?? 3,
              xp: currentBadge?.xp ?? 50,
            },
          },
        }
      }
      if (!rewardName) {
        rewardName = sixStageJourney.stage6_completion.rewardBadge.name?.trim() || fallbackBadgeName
      }
    } else {
      if (!rewardName) {
        rewardName = fallbackBadgeName
      }
    }
  }

  if (!rewardName) {
    rewardName = ('Huy hiệu ' + (draft.title || '')).trim()
  }

  const rule3Defaults = createAikiRule3StepsCards()
  let sourceCards = draft.learnCards?.length
    ? [...draft.learnCards]
    : (isRule3Steps ? rule3Defaults : defaultLearnCards(draft.concept, draft.example))

  if (isRule3Steps) {
    if (sourceCards.length > 3) {
      sourceCards = sourceCards.slice(0, 3)
    }
    while (sourceCards.length < 3) {
      const index = sourceCards.length
      sourceCards.push(rule3Defaults[index])
    }
  } else if (isIsland) {
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
    reward: rewardName,
    access,
    slug: initialSlug,
    lessonFormat: format,
    sixStageJourney,
    customJourneyStages: draft.customJourneyStages,
    goalsText: draft.goalsText ?? '',
    practiceStepsText: draft.practiceStepsText ?? '',
    successCriteriaText: draft.successCriteriaText ?? '',
    practiceConfigText: draft.practiceConfigText ?? '',
    gameStructuredText: draft.gameStructuredText ?? '',
    learnCards: sourceCards.map((card, index) => {
      const sourceVisualItems = Array.isArray(card.visualItems) ? card.visualItems : []
      const encodedItem = sourceVisualItems.find((item) => item.label === AIKI_RULE_META_LABEL)
      let encoded: Partial<LearnCardDraft> = {}
      if (isAiki) {
        try { encoded = encodedItem ? JSON.parse(encodedItem.text) as Partial<LearnCardDraft> : {} } catch { encoded = {} }
      }
      const visualItems = sourceVisualItems.filter((item) => item.label !== AIKI_RULE_META_LABEL)
      const legacyAikiCourseResidue = isIsland && isLegacyAikiCourseResidue(card, encodedItem)
      const islandStageBlocks: StageBlockItem[] = isIsland
        ? (sixStageJourney?.stageContentBlocks?.[`stage-${index}`] ?? card.contentBlocks ?? []) as StageBlockItem[]
        : []
      const kind = isRule3Steps
        ? (index === 0 ? 'concept' : index === 1 ? 'example' : 'remember')
        : (isAiki5Steps && index < AIKI_RULE_STAGE_KINDS.length
            ? AIKI_RULE_STAGE_KINDS[index]
            : normalizeLearnKind(encoded.kind ?? card.kind, index, isAiki ? card.id : '', isAiki))
      return {
        ...card,
        id: isIsland
          ? `island-stage-${index + 1}`
          : isRule3Steps
            ? (card.id || `rule-3step-stage-${index + 1}`)
            : (card.id || (isAiki5Steps && index < AIKI_RULE_STAGE_KINDS.length ? `aiki-rule-${AIKI_RULE_STAGE_KINDS[index]}` : `learn-${index + 1}`)),
        title: isIsland
          ? (ISLAND_6_STAGE_NAMES[index] || `Chặng ${index + 1}`)
          : isRule3Steps
            ? (card.title || STANDARD_RULE_3_STAGES[index]?.title || `Chặng ${index + 1}`)
            : (card.title || `Khối khám phá ${index + 1}`),
        body: card.body || '',
        tip: card.tip ?? '',
        kind: isIsland ? (index === 0 ? 'concept' : 'example') : kind,
        layout: normalizeLearnLayout(card.layout, visualItems.length > 0, kind),
        visualItems,
        imageUrl: isIsland && index === 0 && sixStageJourney
          ? sixStageJourney.stage1_goal.imageUrl
          : isRule3Steps
            ? (card.imageUrl || matchedRule?.posterImage || encoded.imageUrl || '')
            : (encoded.imageUrl ?? card.imageUrl ?? ''),
        imageAlt: encoded.imageAlt ?? card.imageAlt ?? (isRule3Steps && matchedRule ? matchedRule.shortTitle : ''),
        videoUrl: isRule3Steps && index === 0
          ? (card.videoUrl || draft.videoUrl || matchedRule?.videoUrl || encoded.videoUrl || '')
          : (encoded.videoUrl ?? card.videoUrl ?? ''),
        optionImages: encoded.optionImages ?? card.optionImages ?? (isRule3Steps && index === 1 ? ['', ''] : kind === 'aiki-riddle' ? ['', ''] : undefined),
        optionLabels: encoded.optionLabels ?? card.optionLabels ?? (isRule3Steps && index === 1 ? rule3Defaults[1].optionLabels : undefined),
        optionDescs: encoded.optionDescs ?? card.optionDescs ?? (isRule3Steps && index === 1 ? rule3Defaults[1].optionDescs : undefined),
        dialogueLines: encoded.dialogueLines ?? card.dialogueLines,
        additionalImages: encoded.additionalImages ?? card.additionalImages,
        compareData: encoded.compareData ?? card.compareData,
        enabledModules: encoded.enabledModules ?? card.enabledModules ?? (isRule3Steps ? rule3Defaults[index]?.enabledModules : undefined),
        contentBlocks: isIsland && index === 0 && sixStageJourney
          ? buildCourseGoalBlocks(sixStageJourney, legacyAikiCourseResidue ? [] : islandStageBlocks)
          : (isIsland && index === 1 && sixStageJourney
            ? buildCourseConfirmBlocks(sixStageJourney, legacyAikiCourseResidue ? [] : islandStageBlocks)
          : (isIsland && index === 2 && sixStageJourney
            ? buildCourseVideoBlocks(sixStageJourney, legacyAikiCourseResidue ? [] : islandStageBlocks)
          : (isIsland && index === 3 && sixStageJourney
            ? buildCourseQuizBlocks(sixStageJourney, legacyAikiCourseResidue ? [] : islandStageBlocks)
          : (isIsland && index === 4 && sixStageJourney
            ? buildCoursePracticeBlocks(sixStageJourney, legacyAikiCourseResidue ? [] : islandStageBlocks)
          : (isIsland && index === 5 && sixStageJourney
            ? buildCourseRewardBlocks(sixStageJourney, legacyAikiCourseResidue ? [] : islandStageBlocks)
          : (isIsland
              ? (legacyAikiCourseResidue ? [] : islandStageBlocks.filter((block) => block.type !== 'voice'))
              : encoded.contentBlocks ?? card.contentBlocks)))))),
        compareImages: encoded.compareImages ?? card.compareImages ?? (kind === 'explanation' ? { left: '', right: '' } : undefined),
        mee: isIsland && index === 0 && sixStageJourney
          ? { ...(encoded.mee ?? card.mee), readText: sixStageJourney.stage1_goal.speech, voiceProvider: 'vertex', gesture: encoded.mee?.gesture ?? card.mee?.gesture ?? 'presentation', autoRead: encoded.mee?.autoRead ?? card.mee?.autoRead ?? false }
          : isRule3Steps
            ? {
                readText: encoded.mee?.readText ?? card.mee?.readText ?? '',
                audioUrl: encoded.mee?.audioUrl ?? card.mee?.audioUrl ?? '',
                voiceProvider: 'vertex',
                gesture: encoded.mee?.gesture ?? card.mee?.gesture ?? rule3Defaults[index]?.mee?.gesture ?? 'presentation',
                autoRead: encoded.mee?.autoRead ?? card.mee?.autoRead ?? false,
              }
            : encoded.mee ?? card.mee ?? { readText: '', audioUrl: '', voiceProvider: 'vertex', gesture: 'presentation', autoRead: false },
      }
    }),
  }
}
