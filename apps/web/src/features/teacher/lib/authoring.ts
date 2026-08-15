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

export type LearnCardDraft = {
  id: string
  title: string
  body: string
  tip: string
  kind: 'concept' | 'example' | 'compare' | 'steps' | 'storyboard' | 'remember'
  layout: 'text' | 'split' | 'visual-grid' | 'storyboard'
  visualItems: LearnVisualItemDraft[]
}

export type LectureDraft = {
  id: string
  title: string
  skill: string
  hook: string
  practiceKind: string
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
  const options = [draft.checkOption1, draft.checkOption2, draft.checkOption3]
  return readiness([
    step('basics', 'Thông tin trạm', [
      [/^[a-z0-9-]{3,64}$/.test(draft.id), 'Đường dẫn bài học'],
      [hasLength(draft.title, 3), 'Tên bài học'],
      [hasLength(draft.skill, 3), 'Kỹ năng trọng tâm'],
      [hasLength(draft.hook, 5), 'Câu hỏi khởi động'],
      [lines(draft.goalsText).length >= 3 && lines(draft.goalsText).every((item) => hasLength(item, 10)), 'Ít nhất 3 mục tiêu rõ ràng'],
      [videoIsValid, 'Liên kết video HTTPS'],
    ]),
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
