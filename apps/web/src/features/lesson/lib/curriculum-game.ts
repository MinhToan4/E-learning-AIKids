export const CURRICULUM_GAME_TYPES = [
  'blockly',
  'math-kids',
  'battle-math',
  'edukiz',
] as const

export type CurriculumGameType = (typeof CURRICULUM_GAME_TYPES)[number]
export type CurriculumGameSelectionMode = 'required' | 'student_choice'
export type CurriculumGameDifficulty = 'gentle' | 'steady' | 'challenge'

export type CurriculumGameConfig = {
  cards?: string[]
  groups?: unknown
  rounds?: unknown
  visualRounds?: unknown
  pairs?: unknown
  placements?: unknown
  selectionMode?: CurriculumGameSelectionMode
  allowedTypes?: unknown
  difficulty?: CurriculumGameDifficulty
}

export type CurriculumGamePolicy = {
  selectionMode: CurriculumGameSelectionMode
  allowedTypes: CurriculumGameType[]
  difficulty: CurriculumGameDifficulty
}

export type CurriculumGameDefinition = {
  type: CurriculumGameType
  label: string
  shortLabel: string
  description: string
  gameplay: string
  sourceUrl: string
}

export type CurriculumGameTuning = {
  cardLimit: number
  memoryPairLimit: number
  roundLimit: number
  targetWins: number
}

export type CompareRound = {
  prompt: string
  options: string[]
  answerIndex: number
  feedback: string
}

export type VisualOption = {
  id: string
  label: string
  imageUrl: string
  imagePosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export type VisualRound = {
  id: string
  prompt: string
  clue: string
  options: VisualOption[]
  answerIndex: number
  feedback: string
}

export type AssociationPair = {
  left: string
  right: string
}

export type MemoryCard = {
  id: string
  pairId: string
  label: string
}

export type MathOperator = '+' | '-' | '×' | '÷'

export type MathProblem = {
  left: number
  right: number
  operator: MathOperator
  answer: number
}

const GAME_TYPES = new Set<string>(CURRICULUM_GAME_TYPES)

const LEGACY_GAME_ALIASES: Record<string, CurriculumGameType> = {
  pick: 'math-kids',
  spin: 'math-kids',
  compare: 'battle-math',
  match: 'edukiz',
  sort: 'edukiz',
  combine: 'edukiz',
  detective: 'blockly',
  order: 'blockly',
  drag: 'blockly',
  place: 'blockly',
}

export const CURRICULUM_GAME_DEFINITIONS: readonly CurriculumGameDefinition[] = [
  {
    type: 'blockly',
    label: 'Blockly – Đội Cứu Hộ Dữ Liệu',
    shortLabel: 'Blockly',
    description: 'Lập chương trình, thử, sửa và đưa dữ liệu tốt về phòng học của AI.',
    gameplay: 'Xếp lệnh → chạy thử → quan sát → sửa lỗi',
    sourceUrl: 'https://github.com/blockly-games/blockly-games',
  },
  {
    type: 'math-kids',
    label: 'Math for Kids – Khỉ Leo Cây Dữ Liệu',
    shortLabel: 'Khỉ Leo Cây',
    description: 'Đếm các ví dụ AI đã học để giúp Khỉ Mơ leo tới ngọn cây.',
    gameplay: 'Đọc tình huống AI → tính nhanh → leo một tầng',
    sourceUrl: 'https://github.com/ndrada/math-for-kids',
  },
  {
    type: 'battle-math',
    label: 'BattleMath – Pháo Đài Kiểm Chứng',
    shortLabel: 'Pháo Đài AI',
    description: 'So prompt với bốn bức ảnh, tìm lỗi AI và làm tan Sương Mù.',
    gameplay: 'Quan sát ảnh → kiểm tra chi tiết → giải thích lỗi',
    sourceUrl: 'https://github.com/JesseRWeigel/battlemath',
  },
  {
    type: 'edukiz',
    label: 'Edukiz – Xưởng Huấn Luyện AI',
    shortLabel: 'Edukiz',
    description: 'Gắn nhãn dữ liệu, giữ bí mật, lắp prompt rồi kiểm thử AI.',
    gameplay: 'Học mẫu → phân loại → viết prompt → kiểm thử',
    sourceUrl: 'https://github.com/timmalich/edukiz',
  },
] as const

const GAME_DEFINITION_BY_TYPE = new Map(
  CURRICULUM_GAME_DEFINITIONS.map((definition) => [
    definition.type,
    definition,
  ]),
)

export function normalizeGameType(value?: string): CurriculumGameType {
  if (value && GAME_TYPES.has(value)) return value as CurriculumGameType
  return value ? LEGACY_GAME_ALIASES[value] ?? 'blockly' : 'blockly'
}

export function getGameDefinition(value?: string): CurriculumGameDefinition {
  return GAME_DEFINITION_BY_TYPE.get(normalizeGameType(value))!
}

function boundedLabel(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export function sanitizeGameCards(
  values: readonly string[] | undefined,
  limit = 8,
): string[] {
  if (!Array.isArray(values)) return []
  return values
    .map((value) => boundedLabel(value, 160))
    .filter(
      (value, index, all) =>
        value.length >= 2 && all.indexOf(value) === index,
    )
    .slice(0, Math.max(2, limit))
}

export function sanitizeAssociationPairs(value: unknown): AssociationPair[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const left = boundedLabel(row.left, 80)
      const right = boundedLabel(row.right, 80)
      return left.length >= 2 && right.length >= 2 && left !== right
        ? { left, right }
        : null
    })
    .filter((pair): pair is AssociationPair => pair !== null)
    .slice(0, 6)
}

export function sanitizeCompareRounds(value: unknown): CompareRound[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const prompt = boundedLabel(row.prompt, 180)
      const feedback = boundedLabel(row.feedback, 240)
      const options = Array.isArray(row.options)
        ? sanitizeGameCards(row.options.map(String), 4)
        : []
      const answerIndex = row.answerIndex
      return prompt.length >= 2 &&
        feedback.length >= 2 &&
        typeof answerIndex === 'number' &&
        Number.isInteger(answerIndex) &&
        answerIndex >= 0 &&
        answerIndex < options.length &&
        options.length >= 2
        ? { prompt, options, answerIndex, feedback }
        : null
    })
    .filter((round): round is CompareRound => round !== null)
    .slice(0, 8)
}

const VISUAL_POSITIONS = new Set<VisualOption['imagePosition']>([
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
])

function safeAssetPath(value: unknown): string {
  const path = boundedLabel(value, 220)
  return path.startsWith('/assets/') && !path.includes('..') ? path : ''
}

export function sanitizeVisualRounds(value: unknown): VisualRound[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item, roundIndex) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const prompt = boundedLabel(row.prompt, 240)
      const clue = boundedLabel(row.clue, 180)
      const feedback = boundedLabel(row.feedback, 500)
      const options = Array.isArray(row.options)
        ? row.options
            .map((option, optionIndex) => {
              if (!option || typeof option !== 'object') return null
              const candidate = option as Record<string, unknown>
              const label = boundedLabel(candidate.label, 120)
              const imageUrl = safeAssetPath(candidate.imageUrl)
              const imagePosition = candidate.imagePosition
              return label.length >= 2 &&
                imageUrl &&
                typeof imagePosition === 'string' &&
                VISUAL_POSITIONS.has(imagePosition as VisualOption['imagePosition'])
                ? {
                    id: boundedLabel(candidate.id, 50) || `${roundIndex}-${optionIndex}`,
                    label,
                    imageUrl,
                    imagePosition: imagePosition as VisualOption['imagePosition'],
                  }
                : null
            })
            .filter((option): option is VisualOption => option !== null)
            .slice(0, 5)
        : []
      const answerIndex = row.answerIndex
      return prompt.length >= 2 &&
        clue.length >= 2 &&
        feedback.length >= 2 &&
        options.length >= 3 &&
        typeof answerIndex === 'number' &&
        Number.isInteger(answerIndex) &&
        answerIndex >= 0 &&
        answerIndex < options.length
        ? {
            id: boundedLabel(row.id, 50) || `visual-${roundIndex}`,
            prompt,
            clue,
            options,
            answerIndex,
            feedback,
          }
        : null
    })
    .filter((round): round is VisualRound => round !== null)
    .slice(0, 8)
}

const PICTURE_ATLAS = '/assets/game-engines/ai-picture-check.jpg'

const PICTURE_OPTIONS: VisualOption[] = [
  {
    id: 'exact',
    label: 'Ba quả táo · ba lô xanh',
    imageUrl: PICTURE_ATLAS,
    imagePosition: 'top-left',
  },
  {
    id: 'count',
    label: 'Bốn quả táo · ba lô xanh',
    imageUrl: PICTURE_ATLAS,
    imagePosition: 'top-right',
  },
  {
    id: 'color',
    label: 'Ba quả táo · ba lô tím',
    imageUrl: PICTURE_ATLAS,
    imagePosition: 'bottom-left',
  },
  {
    id: 'physics',
    label: 'Một quả táo đang lơ lửng',
    imageUrl: PICTURE_ATLAS,
    imagePosition: 'bottom-right',
  },
]

export const DEFAULT_AI_VISUAL_ROUNDS: readonly VisualRound[] = [
  {
    id: 'match-the-prompt',
    prompt: 'Prompt: “Một chú khỉ vàng đeo ba lô xanh, cầm đúng 3 quả táo đỏ dưới cây xanh.”',
    clue: 'Kiểm tra lần lượt: nhân vật, màu ba lô, số quả táo và vị trí.',
    options: PICTURE_OPTIONS,
    answerIndex: 0,
    feedback: 'Ảnh này khớp đủ bốn chi tiết. AI làm đúng khi kết quả bám sát từng phần của prompt.',
  },
  {
    id: 'count-error',
    prompt: 'Ảnh nào làm sai số lượng mà prompt yêu cầu?',
    clue: 'Đừng đoán vội. Chạm mắt vào từng quả táo và đếm 1, 2, 3…',
    options: PICTURE_OPTIONS,
    answerIndex: 1,
    feedback: 'Đúng rồi, ảnh này có 4 quả táo thay vì 3. AI thường có thể làm sai số lượng nên mình luôn cần đếm lại.',
  },
  {
    id: 'color-error',
    prompt: 'Ảnh nào đã đổi sai màu của chiếc ba lô?',
    clue: 'Prompt cần ba lô xanh. Hãy chỉ nhìn vào phụ kiện trước.',
    options: PICTURE_OPTIONS,
    answerIndex: 2,
    feedback: 'Chuẩn, ba lô đã thành màu tím. Khi nhiều chi tiết xuất hiện cùng lúc, AI có thể bỏ quên một chi tiết màu sắc.',
  },
  {
    id: 'impossible-detail',
    prompt: 'Ảnh nào có chi tiết vô lý cần người kiểm tra lại?',
    clue: 'Quan sát xem mọi đồ vật có đang được giữ hoặc đặt ở đâu đó không.',
    options: PICTURE_OPTIONS,
    answerIndex: 3,
    feedback: 'Con bắt được rồi: quả táo đang tự lơ lửng. Ảnh trông đẹp vẫn có thể sai logic, nên con người luôn là người kiểm tra cuối.',
  },
]

const POSITIVE_FEEDBACK = [
  'Bắt đúng tín hiệu rồi!',
  'Mắt kiểm chứng của con sắc thật!',
  'Đúng ý luôn, đi tiếp nào!',
  'Con vừa dạy AI thêm một điều hay!',
  'Hay quá, mảnh ghép này vào đúng chỗ rồi!',
] as const

const TRY_AGAIN_FEEDBACK = [
  'Suýt nữa rồi. Mình nhìn từng chi tiết một nhé!',
  'Chưa khớp thôi, không sao cả. Thử đổi cách kiểm tra nào!',
  'Có một manh mối đang trốn đấy. Con tìm lại nhé!',
  'AI cũng học bằng cách sửa lỗi. Mình thử thêm lần nữa nào!',
  'Khoan vội, đọc lại yêu cầu rồi chạm đáp án mới nhé!',
] as const

export function feedbackFor(
  kind: 'correct' | 'retry',
  index: number,
): string {
  const bank = kind === 'correct' ? POSITIVE_FEEDBACK : TRY_AGAIN_FEEDBACK
  return bank[Math.abs(index) % bank.length]!
}

export function sanitizeAllowedGameTypes(value: unknown): CurriculumGameType[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) =>
      typeof item === 'string' &&
      (GAME_TYPES.has(item) || LEGACY_GAME_ALIASES[item])
        ? normalizeGameType(item)
        : null,
    )
    .filter(
      (item, index, all): item is CurriculumGameType =>
        item !== null && all.indexOf(item) === index,
    )
    .slice(0, CURRICULUM_GAME_TYPES.length)
}

export function resolveGamePolicy(
  config: CurriculumGameConfig = {},
  requestedType?: string,
): CurriculumGamePolicy {
  const requested = normalizeGameType(requestedType)
  const difficulty: CurriculumGameDifficulty =
    config.difficulty === 'gentle' ||
    config.difficulty === 'challenge'
      ? config.difficulty
      : 'steady'
  const configured = sanitizeAllowedGameTypes(config.allowedTypes)
  const allowedTypes = configured.includes(requested)
    ? configured
    : [requested, ...configured]
  const unique = allowedTypes.filter(
    (type, index, all) => all.indexOf(type) === index,
  )
  const studentChoice =
    config.selectionMode === 'student_choice' && unique.length >= 2

  return {
    selectionMode: studentChoice ? 'student_choice' : 'required',
    allowedTypes: studentChoice ? unique : [requested],
    difficulty,
  }
}

export function calculateGameReward(
  correct: boolean,
  streak: number,
  difficulty: CurriculumGameDifficulty = 'steady',
): number {
  if (!correct) return 0
  const difficultyBonus =
    difficulty === 'challenge' ? 4 : difficulty === 'steady' ? 2 : 0
  return 10 + difficultyBonus + Math.min(10, Math.max(0, streak - 1) * 2)
}

/** BattleMath's original time bands: fast answers deal stronger attacks. */
export function calculateBattleScore(elapsedSeconds: number): number {
  if (elapsedSeconds < 5) return 10
  if (elapsedSeconds < 10) return 8
  if (elapsedSeconds < 15) return 6
  if (elapsedSeconds < 20) return 4
  if (elapsedSeconds < 25) return 2
  return 1
}

export function getGameTuning(
  difficulty: CurriculumGameDifficulty,
): CurriculumGameTuning {
  if (difficulty === 'gentle') {
    return { cardLimit: 4, memoryPairLimit: 2, roundLimit: 5, targetWins: 3 }
  }
  if (difficulty === 'challenge') {
    return { cardLimit: 8, memoryPairLimit: 4, roundLimit: 10, targetWins: 7 }
  }
  return { cardLimit: 6, memoryPairLimit: 3, roundLimit: 7, targetWins: 5 }
}

function seededNumber(seed: string): number {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function deterministicShuffle<T>(
  values: readonly T[],
  seed: string,
): T[] {
  const result = [...values]
  let state = seededNumber(seed) || 1
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    const target = state % (index + 1)
    ;[result[index], result[target]] = [result[target]!, result[index]!]
  }
  return result
}

export function buildMemoryDeck(
  pairs: readonly AssociationPair[],
  seed: string,
): MemoryCard[] {
  const deck = pairs.flatMap((pair, index) => [
    { id: `${index}-left`, pairId: `pair-${index}`, label: pair.left },
    { id: `${index}-right`, pairId: `pair-${index}`, label: pair.right },
  ])
  return deterministicShuffle(deck, seed)
}

export function createMathProblem(
  difficulty: CurriculumGameDifficulty,
  operator: MathOperator,
  random = Math.random,
): MathProblem {
  const ceiling =
    difficulty === 'gentle' ? 9 : difficulty === 'steady' ? 30 : 99
  const positive = () => Math.floor(random() * ceiling) + 1
  let left = positive()
  let right = positive()

  if (operator === '-') {
    if (left < right) [left, right] = [right, left]
    return { left, right, operator, answer: left - right }
  }
  if (operator === '×') {
    const factor = difficulty === 'challenge' ? 12 : 9
    left = Math.floor(random() * factor) + 1
    right = Math.floor(random() * factor) + 1
    return { left, right, operator, answer: left * right }
  }
  if (operator === '÷') {
    right = Math.floor(random() * (difficulty === 'challenge' ? 12 : 9)) + 1
    const answer = Math.floor(random() * (difficulty === 'challenge' ? 12 : 9)) + 1
    left = right * answer
    return { left, right, operator, answer }
  }
  return { left, right, operator, answer: left + right }
}

export function missionProgress(completed: number, total: number): number {
  if (total <= 0) return 0
  return Math.round(
    Math.min(1, Math.max(0, completed) / total) * 100,
  )
}
