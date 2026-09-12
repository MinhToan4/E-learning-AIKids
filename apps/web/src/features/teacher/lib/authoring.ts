import type { LessonSixStageJourney } from '@/shared/lib/api'

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
  tone?: 'brand' | 'sky' | 'mint' | 'sun' | 'coral'
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

export interface StageBlockItem {
  id: string
  type: ContentBlockType
  title?: string
  body?: string
  tip?: string
  tone?: 'brand' | 'sky' | 'mint' | 'sun' | 'coral'
  imageUrl?: string
  imageAlt?: string
  videoUrl?: string
  formula?: string
  visualItems?: LearnVisualItemDraft[]
  optionImages?: [string, string] | string[]
  optionLabels?: [string, string] | string[]
  optionDescs?: [string, string] | string[]
  dialogueLines?: DialogueLine[]
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
  additionalImages?: StageImageItem[]
  posterText?: string
  posterRuleNumber?: number
  gesture?: string
  readText?: string
}

export const FOUR_KEYS_DEFAULT_ITEMS: LearnVisualItemDraft[] = [
  { label: 'Cái gì?', text: 'Nhân vật hoặc đồ vật chính', tone: 'sky' },
  { label: 'Trông như thế nào?', text: 'Màu sắc, hình dáng và đặc điểm', tone: 'sun' },
  { label: 'Đang làm gì?', text: 'Hành động đang diễn ra', tone: 'coral' },
  { label: 'Ở đâu?', text: 'Bối cảnh hoặc địa điểm', tone: 'brand' },
]

/** Tạo bản sao độc lập để CMS có thể sửa/kéo thả mà không làm đổi template gốc. */
export function createFourKeysBlock(id = `blk-four-keys-${Date.now()}`): StageBlockItem {
  return {
    id,
    type: 'layout-four-keys',
    title: 'Bốn chiếc chìa khóa mở câu lệnh',
    body: 'Ghép đủ bốn chìa khóa để AI hiểu đúng ý tưởng của con.',
    tip: 'Cái gì · Trông như thế nào · Đang làm gì · Ở đâu',
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
  mee?: {
    readText: string
    /** URL audio đã được Vertex tạo qua StoryMee Hub; FE không gọi Vertex trực tiếp. */
    audioUrl?: string
    voiceProvider?: 'vertex'
    gesture: 'presentation' | 'point-left' | 'point-right' | 'think' | 'idea' | 'celebrate' | 'celebrate-1' | 'explain' | 'idle'
    autoRead: boolean
  }
}

export type LessonFormat = 'standard' | 'aiki-rule-5steps' | 'aiki-island-6steps'

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

export function detectLessonFormat(cards: LearnCardDraft[], explicitFormat?: string, isIsland?: boolean): LessonFormat {
  if (explicitFormat === 'aiki-island-6steps' || explicitFormat === 'aiki-rule-5steps' || explicitFormat === 'standard') {
    return explicitFormat
  }
  if (isIsland) return 'aiki-island-6steps'
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

export type LectureDraft = {
  id: string
  title: string
  skill: string
  hook: string
  practiceKind: string
  lessonFormat?: LessonFormat
  metadata?: Record<string, unknown>
  sixStageJourney?: LessonSixStageJourney
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

function parseGameContent(value: string): Record<string, unknown> | null {
  if (!value.trim()) return null
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
    (/^bai-\d+-\d+/i.test(draft.id) && draft.lessonFormat !== 'standard' && draft.lessonFormat !== 'aiki-rule-5steps')
  const hasAikiRuleStage = !isIsland && (isAikiRuleLesson(draft.learnCards) || draft.learnCards.some((card) => AIKI_RULE_STAGE_KINDS.includes(card.kind as typeof AIKI_RULE_STAGE_KINDS[number])))

  const basicsStep = step('basics', 'Thông tin trạm', [
    [/^[a-z0-9-]{3,64}$/.test(draft.id), 'Đường dẫn bài học'],
    [hasLength(draft.title, 3), 'Tên bài học'],
    [hasLength(draft.skill, 3), 'Kỹ năng trọng tâm'],
    [hasLength(draft.hook, 5), 'Câu hỏi khởi động'],
    [
      isIsland
        ? lines(draft.goalsText).length >= 1
        : lines(draft.goalsText).length >= 3 && lines(draft.goalsText).every((item) => hasLength(item, 10)),
      isIsland ? 'Ít nhất 1 mục tiêu rõ ràng' : 'Ít nhất 3 mục tiêu rõ ràng',
    ],
    [videoIsValid, 'Liên kết video HTTPS'],
  ])

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
