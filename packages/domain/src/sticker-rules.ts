export interface StickerSnapshot {
  learning: {
    quests_completed: number
    quests_perfect: number
    streak_days: number
    streak_longest: number
    xp_total: number
    level: number
    video_watched_count: number
    ebook_read_count: number
  }
  creative: {
    projects_created: number
    stories_created: number
    self_character_created: boolean
    remix_count: number
    collab_count: number
    ebook_generated: boolean
  }
  social: {
    reactions_given: number
    reactions_received: number
    paco_picks: number
    paco_picks_given: number
    shares_done: number
    challenges_completed: number
    weekly_prompts_submitted: number
    gallery_featured: boolean
  }
  milestone: {
    pages_completed: number
    stickers_total: number
    days_active_30: number
    parent_approved_count: number
  }
  storybook: {
    page_slug: string
    stickers_on_page: number
    video_watched: boolean
  }
}

type Primitive = string | number | boolean

const aliases: Record<string, string> = {
  'quests.completed': 'learning.quests_completed',
  'quests.perfect': 'learning.quests_perfect',
  'quests.streak_days': 'learning.streak_days',
  'quests.streak_longest': 'learning.streak_longest',
  'quests.xp_total': 'learning.xp_total',
  'quests.level': 'learning.level',
  'quests.video_watched_count': 'learning.video_watched_count',
  'quests.ebook_read_count': 'learning.ebook_read_count',
}

function resolve(path: string, snapshot: StickerSnapshot): Primitive | undefined {
  const normalized = aliases[path] ?? path
  const [namespace, key, ...rest] = normalized.split('.')
  if (rest.length || !namespace || !key) return undefined
  const group = snapshot[namespace as keyof StickerSnapshot] as unknown
  if (!group || typeof group !== 'object') return undefined
  const value = (group as Record<string, unknown>)[key]
  return typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
    ? value
    : undefined
}

function parseLiteral(raw: string): Primitive {
  const trimmed = raw.trim()
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed)
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

/**
 * Evaluates one deliberately small, non-executable trigger expression.
 * Invalid expressions fail closed instead of unlocking a sticker.
 */
export function evaluateTrigger(
  condition: string,
  snapshot: StickerSnapshot,
): boolean {
  const match = condition
    .trim()
    .match(/^([a-z_][a-z0-9_.]*)\s*(>=|<=|==|!=|>|<)\s*(.+)$/i)
  if (!match) return false

  const left = resolve(match[1], snapshot)
  if (left === undefined) return false
  const right = parseLiteral(match[3])

  switch (match[2]) {
    case '==':
      return left === right
    case '!=':
      return left !== right
    case '>=':
      return typeof left === 'number' && typeof right === 'number' && left >= right
    case '<=':
      return typeof left === 'number' && typeof right === 'number' && left <= right
    case '>':
      return typeof left === 'number' && typeof right === 'number' && left > right
    case '<':
      return typeof left === 'number' && typeof right === 'number' && left < right
    default:
      return false
  }
}
