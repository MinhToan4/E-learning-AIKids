// WHY: Hợp nhất 4 game cũ (BattleMath, Blockly, Edukiz, MathKids) với 2 game mới
// (DataRunner, TruthPatrol). Giữ nguyên toàn bộ types và helper functions của
// cả hai thế hệ để không phá vỡ existing DB configs.
export const CURRICULUM_GAME_TYPES = [
  'battle-math',
  'blockly',
  'edukiz',
  'math-kids',
  'data-runner',
  'truth-patrol',
] as const

export type CurriculumGameType = (typeof CURRICULUM_GAME_TYPES)[number]
export type CurriculumGameSelectionMode = 'required' | 'student_choice'
export type CurriculumGameDifficulty = 'gentle' | 'steady' | 'challenge'

// Config unified — hỗ trợ cả 4 game cũ lẫn 2 game mới
export type CurriculumGameConfig = {
  // Legacy game fields (4 game cũ)
  cards?: string[]
  groups?: unknown
  rounds?: unknown
  visualRounds?: unknown
  pairs?: unknown
  placements?: unknown
  // New game fields (2 game mới)
  lobby?: unknown
  catalog?: unknown
  runnerLevels?: unknown
  patrolWaves?: unknown
  // MonkeyGoal quiz questions (math-kids engine)
  quizQuestions?: unknown
  // Shared
  selectionMode?: CurriculumGameSelectionMode
  allowedTypes?: unknown
  difficulty?: CurriculumGameDifficulty
}

export type CurriculumGameLobby = {
  eyebrow: string
  title: string
  description: string
  imageUrl: string
  imageAlt: string
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
  // WHY: sceneUrl thay thế sourceUrl từ commit 91f9aa2 — backward compat cần cả hai
  sceneUrl: string
  sceneAlt: string
}

// Legacy types cho 4 game cũ
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

// New game types (DataRunner + TruthPatrol)
export type RunnerItem = {
  id: string
  label: string
  imageUrl?: string
  at: number
  lane: 'ground' | 'air'
  decision: 'collect' | 'avoid'
  feedback: string
}

export type RunnerLevel = {
  id: string
  title: string
  mission: string
  backgroundUrl: string
  backgroundAlt: string
  playerSpriteUrl: string
  items: RunnerItem[]
  completionFeedback: string
}

export type PatrolTarget = {
  id: string
  label: string
  imageUrl?: string
  spawnAtMs: number
  column: number
  speed: number
  decision: 'scan' | 'protect'
  feedback: string
}

export type PatrolWave = {
  id: string
  title: string
  mission: string
  backgroundUrl: string
  backgroundAlt: string
  playerSpriteUrl: string
  targets: PatrolTarget[]
  completionFeedback: string
}

// ─── Default data cho 4 game cũ khi DB chưa có data ──────────────────────────

// WHY: BattleMath cần visual rounds với 4 options mỗi round để so sánh AI outputs
export const DEFAULT_AI_VISUAL_ROUNDS: VisualRound[] = [
  {
    id: 'round-1',
    prompt: 'AI được yêu cầu vẽ "3 con mèo màu đỏ đang nhảy". Ảnh nào đúng nhất?',
    clue: 'Đếm số con mèo và kiểm tra màu sắc trước.',
    options: [
      { id: 'opt-a', label: 'Ảnh A', imageUrl: '/assets/game-engines/ai-picture-check.webp', imagePosition: 'top-left' },
      { id: 'opt-b', label: 'Ảnh B', imageUrl: '/assets/game-engines/ai-picture-check.webp', imagePosition: 'top-right' },
      { id: 'opt-c', label: 'Ảnh C', imageUrl: '/assets/game-engines/ai-picture-check.webp', imagePosition: 'bottom-left' },
      { id: 'opt-d', label: 'Ảnh D', imageUrl: '/assets/game-engines/ai-picture-check.webp', imagePosition: 'bottom-right' },
    ],
    answerIndex: 0,
    feedback: 'Đúng! Kiểm tra số lượng và màu sắc là bước đầu tiên khi đánh giá ảnh AI.',
  },
  {
    id: 'round-2',
    prompt: 'Prompt yêu cầu "cầu vồng 7 màu". Ảnh nào thiếu màu?',
    clue: 'Đỏ, Cam, Vàng, Lục, Lam, Chàm, Tím — đếm từng dải.',
    options: [
      { id: 'opt-a', label: 'Ảnh A', imageUrl: '/assets/game-engines/ai-picture-check.webp', imagePosition: 'top-left' },
      { id: 'opt-b', label: 'Ảnh B', imageUrl: '/assets/game-engines/ai-picture-check.webp', imagePosition: 'top-right' },
      { id: 'opt-c', label: 'Ảnh C', imageUrl: '/assets/game-engines/ai-picture-check.webp', imagePosition: 'bottom-left' },
      { id: 'opt-d', label: 'Ảnh D', imageUrl: '/assets/game-engines/ai-picture-check.webp', imagePosition: 'bottom-right' },
    ],
    answerIndex: 1,
    feedback: 'Đúng rồi! AI đôi khi nhầm số lượng dải màu.',
  },
]

// ─── Utility functions ────────────────────────────────────────────────────────

const GAME_TYPES = new Set<string>(CURRICULUM_GAME_TYPES)

// WHY: Giữ alias cho backward compat với DB configs cũ đã lưu
const LEGACY_GAME_ALIASES: Record<string, CurriculumGameType> = {
  pick: 'blockly',
  spin: 'blockly',
  sort: 'blockly',
  combine: 'blockly',
  order: 'blockly',
  drag: 'blockly',
  place: 'blockly',
  compare: 'battle-math',
  match: 'edukiz',
  detective: 'battle-math',
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function boundedText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function boundedNumber(
  value: unknown,
  minimum: number,
  maximum: number,
): number | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : null
}

export function safeGameAssetPath(value: unknown): string {
  const path = boundedText(value, 240)
  return path.startsWith('/assets/') && !path.includes('..') ? path : ''
}

export function normalizeGameType(value?: string): CurriculumGameType {
  if (value && GAME_TYPES.has(value)) return value as CurriculumGameType
  return value ? LEGACY_GAME_ALIASES[value] ?? 'data-runner' : 'data-runner'
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

export function sanitizeGameCatalog(value: unknown): CurriculumGameDefinition[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      const row = record(item)
      const rawType = boundedText(row.type, 40)
      const type = GAME_TYPES.has(rawType)
        ? rawType as CurriculumGameType
        : null
      const label = boundedText(row.label, 120)
      const shortLabel = boundedText(row.shortLabel, 60)
      const description = boundedText(row.description, 240)
      const gameplay = boundedText(row.gameplay, 180)
      // WHY: Support cả sceneUrl (mới) lẫn sourceUrl (cũ) để backward compat
      const sceneUrl = safeGameAssetPath(row.sceneUrl) || safeGameAssetPath(row.sourceUrl)
      const sceneAlt = boundedText(row.sceneAlt, 180)
      return type &&
        label.length >= 2 &&
        shortLabel.length >= 2 &&
        description.length >= 2 &&
        gameplay.length >= 2 &&
        sceneUrl &&
        sceneAlt.length >= 2
        ? {
            type,
            label,
            shortLabel,
            description,
            gameplay,
            sceneUrl,
            sceneAlt,
          }
        : null
    })
    .filter(
      (item, index, all): item is CurriculumGameDefinition =>
        item !== null &&
        all.findIndex((candidate) => candidate?.type === item.type) === index,
    )
    .slice(0, CURRICULUM_GAME_TYPES.length)
}

export function sanitizeGameLobby(value: unknown): CurriculumGameLobby | null {
  const row = record(value)
  const eyebrow = boundedText(row.eyebrow, 80)
  const title = boundedText(row.title, 160)
  const description = boundedText(row.description, 360)
  const imageUrl = safeGameAssetPath(row.imageUrl)
  const imageAlt = boundedText(row.imageAlt, 180)
  return eyebrow.length >= 2 &&
    title.length >= 2 &&
    description.length >= 2 &&
    imageUrl &&
    imageAlt.length >= 2
    ? { eyebrow, title, description, imageUrl, imageAlt }
    : null
}

export function getGameDefinition(
  config: CurriculumGameConfig | undefined,
  type: CurriculumGameType,
): CurriculumGameDefinition | null {
  return sanitizeGameCatalog(config?.catalog)
    .find((definition) => definition.type === type) ?? null
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

// ─── New game sanitizers (DataRunner + TruthPatrol) ──────────────────────────

export function sanitizeRunnerLevels(value: unknown): RunnerLevel[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => {
      const row = record(entry)
      const id = boundedText(row.id, 60)
      const title = boundedText(row.title, 120)
      const mission = boundedText(row.mission, 360)
      const backgroundUrl = safeGameAssetPath(row.backgroundUrl)
      const backgroundAlt = boundedText(row.backgroundAlt, 180)
      const playerSpriteUrl = safeGameAssetPath(row.playerSpriteUrl)
      const completionFeedback = boundedText(row.completionFeedback, 360)
      const items = Array.isArray(row.items)
        ? row.items.map((entryItem) => {
            const item = record(entryItem)
            const itemId = boundedText(item.id, 60)
            const label = boundedText(item.label, 120)
            const imageUrl = item.imageUrl === undefined
              ? ''
              : safeGameAssetPath(item.imageUrl)
            const at = boundedNumber(item.at, 18, 92)
            const lane = item.lane === 'air' || item.lane === 'ground'
              ? item.lane
              : null
            const decision =
              item.decision === 'collect' || item.decision === 'avoid'
                ? item.decision
                : null
            const feedback = boundedText(item.feedback, 360)
            return itemId.length >= 2 &&
              label.length >= 2 &&
              at !== null &&
              lane &&
              decision &&
              feedback.length >= 2 &&
              (item.imageUrl === undefined || imageUrl)
              ? {
                  id: itemId,
                  label,
                  ...(imageUrl ? { imageUrl } : {}),
                  at,
                  lane,
                  decision,
                  feedback,
                }
              : null
          }).filter((item): item is RunnerItem => item !== null)
        : []
      return id.length >= 2 &&
        title.length >= 2 &&
        mission.length >= 2 &&
        backgroundUrl &&
        backgroundAlt.length >= 2 &&
        playerSpriteUrl &&
        items.length >= 3 &&
        completionFeedback.length >= 2
        ? {
            id,
            title,
            mission,
            backgroundUrl,
            backgroundAlt,
            playerSpriteUrl,
            items: items
              .filter(
                (item, index, all) =>
                  all.findIndex((candidate) => candidate.id === item.id) === index,
              )
              .sort((left, right) => left.at - right.at)
              .slice(0, 12),
            completionFeedback,
          }
        : null
    })
    .filter((level): level is RunnerLevel => level !== null)
    .slice(0, 6)
}

export function sanitizePatrolWaves(value: unknown): PatrolWave[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => {
      const row = record(entry)
      const id = boundedText(row.id, 60)
      const title = boundedText(row.title, 120)
      const mission = boundedText(row.mission, 360)
      const backgroundUrl = safeGameAssetPath(row.backgroundUrl)
      const backgroundAlt = boundedText(row.backgroundAlt, 180)
      const playerSpriteUrl = safeGameAssetPath(row.playerSpriteUrl)
      const completionFeedback = boundedText(row.completionFeedback, 360)
      const targets = Array.isArray(row.targets)
        ? row.targets.map((entryTarget) => {
            const target = record(entryTarget)
            const targetId = boundedText(target.id, 60)
            const label = boundedText(target.label, 140)
            const imageUrl = target.imageUrl === undefined
              ? ''
              : safeGameAssetPath(target.imageUrl)
            const spawnAtMs = boundedNumber(target.spawnAtMs, 0, 60_000)
            const column = boundedNumber(target.column, 8, 92)
            const speed = boundedNumber(target.speed, 3, 18)
            const decision =
              target.decision === 'scan' || target.decision === 'protect'
                ? target.decision
                : null
            const feedback = boundedText(target.feedback, 360)
            return targetId.length >= 2 &&
              label.length >= 2 &&
              spawnAtMs !== null &&
              column !== null &&
              speed !== null &&
              decision &&
              feedback.length >= 2 &&
              (target.imageUrl === undefined || imageUrl)
              ? {
                  id: targetId,
                  label,
                  ...(imageUrl ? { imageUrl } : {}),
                  spawnAtMs,
                  column,
                  speed,
                  decision,
                  feedback,
                }
              : null
          }).filter((target): target is PatrolTarget => target !== null)
        : []
      return id.length >= 2 &&
        title.length >= 2 &&
        mission.length >= 2 &&
        backgroundUrl &&
        backgroundAlt.length >= 2 &&
        playerSpriteUrl &&
        targets.length >= 3 &&
        completionFeedback.length >= 2
        ? {
            id,
            title,
            mission,
            backgroundUrl,
            backgroundAlt,
            playerSpriteUrl,
            targets: targets
              .filter(
                (target, index, all) =>
                  all.findIndex((candidate) => candidate.id === target.id) === index,
              )
              .sort((left, right) => left.spawnAtMs - right.spawnAtMs)
              .slice(0, 16),
            completionFeedback,
          }
        : null
    })
    .filter((wave): wave is PatrolWave => wave !== null)
    .slice(0, 6)
}

// ─── Legacy game sanitizers (4 game cũ) ──────────────────────────────────────

export function sanitizeVisualRounds(value: unknown): VisualRound[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => {
      const row = record(entry)
      const id = boundedText(row.id, 60)
      const prompt = boundedText(row.prompt, 400)
      const clue = boundedText(row.clue, 300)
      const answerIndex = typeof row.answerIndex === 'number' ? Math.max(0, Math.floor(row.answerIndex)) : null
      const feedback = boundedText(row.feedback, 360)
      const options = Array.isArray(row.options)
        ? row.options.map((entryOpt) => {
            const opt = record(entryOpt)
            const optId = boundedText(opt.id, 60)
            const label = boundedText(opt.label, 120)
            const imageUrl = safeGameAssetPath(opt.imageUrl)
            const imagePosition = ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(opt.imagePosition as string)
              ? opt.imagePosition as VisualOption['imagePosition']
              : 'top-left'
            return optId.length >= 1 && label.length >= 1 && imageUrl
              ? { id: optId, label, imageUrl, imagePosition }
              : null
          }).filter((opt): opt is VisualOption => opt !== null)
        : []
      return id.length >= 2 &&
        prompt.length >= 4 &&
        clue.length >= 4 &&
        options.length >= 2 &&
        answerIndex !== null &&
        answerIndex < options.length &&
        feedback.length >= 4
        ? { id, prompt, clue, options, answerIndex, feedback }
        : null
    })
    .filter((round): round is VisualRound => round !== null)
    .slice(0, 8)
}

export function sanitizeCompareRounds(value: unknown): CompareRound[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => {
      const row = record(entry)
      const prompt = boundedText(row.prompt, 400)
      const answerIndex = typeof row.answerIndex === 'number' ? Math.max(0, Math.floor(row.answerIndex)) : null
      const feedback = boundedText(row.feedback, 300)
      const options = Array.isArray(row.options)
        ? row.options.map((opt) => typeof opt === 'string' ? opt.slice(0, 200) : '').filter(Boolean)
        : []
      return prompt.length >= 4 && options.length >= 2 && answerIndex !== null && answerIndex < options.length && feedback.length >= 4
        ? { prompt, options, answerIndex, feedback }
        : null
    })
    .filter((round): round is CompareRound => round !== null)
    .slice(0, 10)
}

export function sanitizeAssociationPairs(value: unknown): AssociationPair[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => {
      const row = record(entry)
      const left = boundedText(row.left, 120)
      const right = boundedText(row.right, 120)
      return left.length >= 1 && right.length >= 1 ? { left, right } : null
    })
    .filter((pair): pair is AssociationPair => pair !== null)
    .slice(0, 12)
}

export function sanitizeGameCards(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => typeof item === 'string' ? item.slice(0, 200).trim() : '')
    .filter(Boolean)
    .slice(0, 24)
}


export function gameSpeedMultiplier(
  difficulty: CurriculumGameDifficulty,
): number {
  if (difficulty === 'gentle') return 0.78
  if (difficulty === 'challenge') return 1.18
  return 1
}

export function missionProgress(completed: number, total: number): number {
  if (total <= 0) return 0
  return Math.round(
    Math.min(1, Math.max(0, completed) / total) * 100,
  )
}

/** BattleMath: điểm theo tốc độ trả lời (fast = mạnh hơn). */
export function calculateBattleScore(elapsedSeconds: number): number {
  if (elapsedSeconds < 5) return 10
  if (elapsedSeconds < 10) return 8
  if (elapsedSeconds < 15) return 6
  if (elapsedSeconds < 20) return 4
  if (elapsedSeconds < 25) return 2
  return 1
}

/** Điểm theo đúng/sai, difficulty, streak. */
export function calculateScore(
  correct: boolean,
  streak: number = 0,
  difficulty: CurriculumGameDifficulty = 'steady',
): number {
  if (!correct) return 0
  const difficultyBonus =
    difficulty === 'challenge' ? 4 : difficulty === 'steady' ? 2 : 0
  return 10 + difficultyBonus + Math.min(10, Math.max(0, streak - 1) * 2)
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

export function feedbackFor(context: 'correct' | 'retry', count: number): string {
  const correct = ['Xuất sắc! 🌟', 'Chính xác! ✨', 'Tuyệt vời! 🎉', 'Đúng rồi! 💫']
  const retry = ['Thử lại nhé!', 'Gần đúng rồi!', 'Kiểm tra kỹ hơn nào!', 'Cố lên! 💪']
  const pool = context === 'correct' ? correct : retry
  return pool[count % pool.length]!
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
