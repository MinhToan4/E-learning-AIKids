export type AuthoringStepId = 'basics' | 'outcomes' | 'recognition' | 'learn' | 'game' | 'practice' | 'check'

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

export type LectureDraft = {
  id: string
  title: string
  skill: string
  hook: string
  practiceKind: string
  videoUrl: string
  concept: string
  example: string
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
  practiceInstruction: string
  product: string
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
  { id: 'chips', label: 'Ghép thành phần', description: 'Kết hợp các mảnh thông tin thành sản phẩm.' },
  { id: 'ai_pick', label: 'Chọn với AI', description: 'Đánh giá nhiều kết quả và giải thích lựa chọn.' },
  { id: 'story', label: 'Kể chuyện', description: 'Tạo câu chuyện có mở đầu, diễn biến và kết thúc.' },
  { id: 'comic', label: 'Truyện tranh', description: 'Sắp xếp nội dung thành các khung truyện.' },
  { id: 'video', label: 'Video', description: 'Lập kế hoạch hoặc tạo một video ngắn.' },
  { id: 'detective', label: 'Thám tử AI', description: 'Quan sát dấu hiệu và kiểm chứng thông tin.' },
  { id: 'palette', label: 'Bảng màu', description: 'Chọn màu phù hợp với thông điệp.' },
  { id: 'reflect', label: 'Tự đánh giá', description: 'Nhìn lại quá trình và nêu điều sẽ cải thiện.' },
  { id: 'match', label: 'Ghép cặp', description: 'Ghép khái niệm với ví dụ phù hợp.' },
  { id: 'drag', label: 'Sắp xếp', description: 'Kéo thả các bước theo đúng trình tự.' },
  { id: 'spin', label: 'Vòng quay ý tưởng', description: 'Nhận một gợi ý ngẫu nhiên để bắt đầu.' },
] as const

export const GAME_OPTIONS = [
  { id: 'blockly', label: 'Đội Cứu Hộ Dữ Liệu', description: 'Bốn màn lập trình, lệnh lặp và điều kiện.', choiceReady: true },
  { id: 'math-kids', label: 'Khỉ Leo Cây Dữ Liệu', description: 'Toán ngắn trong tình huống AI học từ dữ liệu.', choiceReady: true },
  { id: 'battle-math', label: 'Pháo Đài Kiểm Chứng', description: 'So prompt với 3–5 ảnh và bắt lỗi AI.', choiceReady: true },
  { id: 'edukiz', label: 'Xưởng Huấn Luyện AI', description: 'Gắn nhãn, riêng tư, prompt và kiểm thử.', choiceReady: true },
] as const

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

function structuredRows(value: string): string[][] {
  return lines(value)
    .map((row) => row.split('|').map((cell) => cell.trim()).filter(Boolean))
    .filter((row) => row.length > 0)
}

function advancedGameConfigIsReady(draft: LectureDraft): boolean {
  const rows = structuredRows(draft.gameStructuredText)
  return draft.gameType !== 'edukiz' || rows.length === 0 ||
    (rows.length >= 2 && rows.every((row) => row.length === 2))
}

export function buildLectureGameConfig(draft: LectureDraft) {
  const cards = lines(draft.gameCardsText)
  const rows = structuredRows(draft.gameStructuredText)
  const config: Record<string, unknown> = {
    cards,
    selectionMode: draft.gameMode,
    allowedTypes:
      draft.gameMode === 'student_choice'
        ? draft.gameAllowedTypes
        : [draft.gameType],
    difficulty: draft.gameDifficulty,
  }

  if (draft.gameType === 'edukiz' && rows.length > 0) {
    config.pairs = rows.map(([left, right]) => ({ left, right }))
  }

  return config
}

export function serializeLectureGameConfig(
  gameType: string,
  value: unknown,
): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ''
  const config = value as Record<string, unknown>
  if (gameType === 'edukiz' && Array.isArray(config.pairs)) {
    return config.pairs
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return ''
        const pair = entry as Record<string, unknown>
        return [String(pair.left ?? ''), String(pair.right ?? '')].join(' | ')
      })
      .filter(Boolean)
      .join('\n')
  }
  return ''
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
    step('basics', 'Thông tin khóa học', [
      [/^[a-z0-9-]{3,40}$/.test(draft.id), 'Đường dẫn khóa học'],
      [hasLength(draft.title, 3), 'Tên khóa học'],
      [hasLength(draft.shortTitle, 2), 'Tên ngắn'],
      [hasLength(draft.tagline, 5), 'Câu giới thiệu'],
      [hasLength(draft.description, 10), 'Mô tả khóa học'],
      [hasLength(draft.durationLabel, 2), 'Thời lượng'],
      [hasLength(draft.ageTrack, 2), 'Nhóm tuổi'],
      [hasLength(draft.courseKey, 2), 'Mã lộ trình'],
    ]),
    step('outcomes', 'Kết quả học tập', [
      [hasLength(draft.productLabel, 3), 'Sản phẩm cuối khóa'],
      [lines(draft.skillsText).some((item) => hasLength(item, 2)), 'Kỹ năng đạt được'],
      [lines(draft.outcomesText).some((item) => hasLength(item, 2)), 'Kết quả đầu ra'],
    ]),
    step('recognition', 'Công nhận hoàn thành', [
      [hasLength(draft.credential, 3), 'Tên chứng nhận hoặc huy hiệu'],
      [hasLength(draft.finalAssessment, 10), 'Yêu cầu hoàn thành cuối khóa'],
    ]),
  ])
}

export function lectureDraftReadiness(draft: LectureDraft): AuthoringReadiness {
  const videoIsValid = !draft.videoUrl.trim() || /^https:\/\//i.test(draft.videoUrl.trim())
  const options = [draft.checkOption1, draft.checkOption2, draft.checkOption3]
  const gameCardsAreReady =
    lines(draft.gameCardsText).length >= 2 &&
    lines(draft.gameCardsText).every((item) => hasLength(item, 2))

  return readiness([
    step('learn', 'Khám phá', [
      [/^[a-z0-9-]{3,64}$/.test(draft.id), 'Đường dẫn bài học'],
      [hasLength(draft.title, 3), 'Tên bài học'],
      [hasLength(draft.skill, 3), 'Kỹ năng trọng tâm'],
      [hasLength(draft.hook, 5), 'Câu hỏi khởi động'],
      [lines(draft.goalsText).length > 0 && lines(draft.goalsText).every((item) => hasLength(item, 2)), 'Mục tiêu bài học'],
      [hasLength(draft.concept, 10), 'Kiến thức cốt lõi'],
      [hasLength(draft.example, 5), 'Ví dụ minh họa'],
      [videoIsValid, 'Liên kết video HTTPS'],
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
        gameCardsAreReady && advancedGameConfigIsReady(draft),
        'Ít nhất 2 thẻ và cấu hình Edukiz đúng định dạng',
      ],
      [
        draft.gameMode !== 'student_choice' || gameCardsAreReady,
        'Ít nhất 2 thẻ dùng chung cho các game học sinh được chọn',
      ],
    ]),
    step('practice', 'Sáng tạo', [
      [hasLength(draft.practiceKind, 2), 'Kiểu thực hành'],
      [hasLength(draft.practiceInstruction, 10), 'Hướng dẫn thực hành'],
      [hasLength(draft.product, 3), 'Sản phẩm học sinh cần tạo'],
    ]),
    step('check', 'Thử tài', [
      [hasLength(draft.checkQuestion, 5), 'Câu hỏi kiểm tra'],
      [options.every((item) => hasLength(item, 1)), '3 lựa chọn trả lời'],
      [/^[0-2]$/.test(draft.correctIndex), 'Đáp án đúng'],
      [hasLength(draft.checkExplain, 5), 'Giải thích đáp án'],
    ]),
  ])
}
