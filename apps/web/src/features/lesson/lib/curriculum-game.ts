export type CurriculumGameType =
  | 'match'
  | 'drag'
  | 'spin'
  | 'sort'
  | 'order'
  | 'detective'
  | 'pick'
  | 'combine'
  | 'compare'
  | 'place'

export type CombineGroup = {
  label: string
  options: string[]
}

export type CompareRound = {
  prompt: string
  options: string[]
  answerIndex: number
  feedback: string
}

export type PlacementChallenge = {
  item: string
  target: string
}

export type MemoryCard = {
  id: string
  pairId: string
  label: string
}

export type AssociationPair = {
  left: string
  right: string
}

export type AdventureBlueprint = {
  title: string
  objective: string
  reward: string
  guideLine: string
}

/** Purpose-built, lazy-loaded visual layer for the lesson quest map. */
export const GAME_ASSETS = {
  ideaIslandMap: '/assets/game/idea-island-map.png',
} as const

const GAME_TYPES = new Set<CurriculumGameType>([
  'match',
  'drag',
  'spin',
  'sort',
  'order',
  'detective',
  'pick',
  'combine',
  'compare',
  'place',
])

export function normalizeGameType(value?: string): CurriculumGameType {
  return value && GAME_TYPES.has(value as CurriculumGameType)
    ? (value as CurriculumGameType)
    : 'pick'
}

export function sanitizeGameCards(
  values: readonly string[],
  limit = 6,
): string[] {
  return values
    .map((value) => value.trim())
    .filter(
      (value, index, all) =>
        value.length >= 2 && all.indexOf(value) === index,
    )
    .slice(0, Math.max(2, limit))
}

function boundedLabel(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export function sanitizeCombineGroups(value: unknown): CombineGroup[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const label = boundedLabel(row.label, 40)
      const options = Array.isArray(row.options)
        ? sanitizeGameCards(
            row.options.map((option) => boundedLabel(option, 64)),
            6,
          )
        : []
      return label.length >= 2 && options.length >= 2
        ? { label, options }
        : null
    })
    .filter((group): group is CombineGroup => group !== null)
    .slice(0, 3)
}

export function sanitizeAssociationPairs(value: unknown): AssociationPair[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const left = boundedLabel(row.left, 64)
      const right = boundedLabel(row.right, 64)
      return left.length >= 2 && right.length >= 2 && left !== right
        ? { left, right }
        : null
    })
    .filter((pair): pair is AssociationPair => pair !== null)
    .slice(0, 4)
}

export function sanitizeCompareRounds(value: unknown): CompareRound[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const prompt = boundedLabel(row.prompt, 120)
      const feedback = boundedLabel(row.feedback, 180)
      const options = Array.isArray(row.options)
        ? sanitizeGameCards(
            row.options.map((option) => boundedLabel(option, 140)),
            3,
          )
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
    .slice(0, 5)
}

export function sanitizePlacements(value: unknown): PlacementChallenge[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const row = entry as Record<string, unknown>
      const item = boundedLabel(row.item, 64)
      const target = boundedLabel(row.target, 64)
      return item.length >= 2 && target.length >= 2 && item !== target
        ? { item, target }
        : null
    })
    .filter((entry): entry is PlacementChallenge => entry !== null)
    .slice(0, 5)
}

function hashSeed(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededRandom(seed: number): () => number {
  let state = seed || 0x6d2b79f5
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffled<T>(values: readonly T[], seed: string): T[] {
  const result = [...values]
  const random = seededRandom(hashSeed(seed))
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[result[index], result[target]] = [result[target]!, result[index]!]
  }
  return result
}

export function buildMemoryDeck(
  values: readonly string[],
  seed: string,
): MemoryCard[] {
  const cards = sanitizeGameCards(values, 4)
  const deck = cards.flatMap((label, pairIndex) => {
    const pairId = `pair-${pairIndex + 1}`
    return [
      { id: `${pairId}-a`, pairId, label },
      { id: `${pairId}-b`, pairId, label },
    ]
  })
  return shuffled(deck, `${seed}:memory`)
}

export function buildAssociationDeck(
  pairs: readonly AssociationPair[],
  seed: string,
): MemoryCard[] {
  const deck = pairs.flatMap((pair, pairIndex) => {
    const pairId = `pair-${pairIndex + 1}`
    return [
      { id: `${pairId}-left`, pairId, label: pair.left },
      { id: `${pairId}-right`, pairId, label: pair.right },
    ]
  })
  return shuffled(deck, `${seed}:association`)
}

export function buildOrderBoard(
  answers: readonly string[],
  seed: string,
): string[] {
  const values = [...answers]
  if (values.length < 2) return values
  const board = shuffled(values, `${seed}:order`)
  if (board.every((value, index) => value === values[index])) {
    return [...board.slice(1), board[0]!]
  }
  return board
}

export function nextWheelIndex(
  length: number,
  previous: number | null,
  entropy: number,
): number | null {
  if (length <= 0) return null
  const bounded = Math.min(0.999999, Math.max(0, entropy))
  let index = Math.floor(bounded * length)
  if (length > 1 && index === previous) index = (index + 1) % length
  return index
}

const ADVENTURE_BLUEPRINTS: Record<CurriculumGameType, AdventureBlueprint> = {
  detective: {
    title: 'Truy tìm manh mối',
    objective: 'Thu thập hai manh mối',
    reward: 'Huy hiệu Thám hiểm',
    guideLine: 'Cùng Mii soi kỹ từng chi tiết để mở xưởng ý tưởng nhé!',
  },
  match: {
    title: 'Kho báu ký ức',
    objective: 'Ghép đủ các cặp bí mật',
    reward: 'Ngọc Ghi nhớ',
    guideLine: 'Mỗi cặp đúng sẽ thắp sáng một chiếc đèn trên đường đi.',
  },
  order: {
    title: 'Bắc cầu ý tưởng',
    objective: 'Xếp đúng các bước làm bài',
    reward: 'Mảnh ghép Cầu vồng',
    guideLine: 'Chọn đúng một bước để Mii đặt thêm một nhịp cầu.',
  },
  sort: {
    title: 'Bắc cầu ý tưởng',
    objective: 'Xếp đúng các bước làm bài',
    reward: 'Mảnh ghép Cầu vồng',
    guideLine: 'Chọn đúng một bước để Mii đặt thêm một nhịp cầu.',
  },
  drag: {
    title: 'Bắc cầu ý tưởng',
    objective: 'Xếp đúng các bước làm bài',
    reward: 'Mảnh ghép Cầu vồng',
    guideLine: 'Chọn đúng một bước để Mii đặt thêm một nhịp cầu.',
  },
  spin: {
    title: 'La bàn kỳ diệu',
    objective: 'Nhận một thử thách mới',
    reward: 'Sao Dũng cảm',
    guideLine: 'Quay la bàn, nhận nhiệm vụ rồi nói cách con đã khám phá.',
  },
  pick: {
    title: 'Săn ý tưởng',
    objective: 'Chọn hai ý tưởng quan trọng',
    reward: 'Hạt mầm Ý tưởng',
    guideLine: 'Hai lựa chọn của con sẽ giúp Mii mang quà về xưởng.',
  },
  combine: {
    title: 'Cỗ máy ghép ý tưởng',
    objective: 'Ghép đủ ba mảnh thành một thế giới',
    reward: 'Hạt mầm Tưởng tượng',
    guideLine: 'Thử nhiều tổ hợp, giữ lại ý tưởng khiến con muốn khám phá nhất.',
  },
  compare: {
    title: 'Kính soi mô tả',
    objective: 'Vượt ba câu đố mô tả',
    reward: 'Kính lúp Chi tiết',
    guideLine: 'Chọn, xem phản hồi rồi thử lại — mỗi vòng mở thêm một manh mối.',
  },
  place: {
    title: 'Xây bản đồ ý tưởng',
    objective: 'Đặt từng mảnh vào đúng vùng',
    reward: 'La bàn Bố cục',
    guideLine: 'Đọc tên mảnh, thử một vùng và sửa ngay nếu bản đồ chưa khớp.',
  },
}

export function getAdventureBlueprint(value?: string): AdventureBlueprint {
  return ADVENTURE_BLUEPRINTS[normalizeGameType(value)]
}

export function missionProgress(completed: number, total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0
  const normalized = Math.min(Math.max(0, completed), total)
  return Math.round((normalized / total) * 100)
}
