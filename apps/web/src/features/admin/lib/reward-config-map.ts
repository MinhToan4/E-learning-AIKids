export type RewardConfigItem = {
  id: string
  contentType: 'reward' | 'chapter' | 'event' | 'achievement'
  code: string
  version: number
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'retired'
  name: string
  kind?: string | null
  unlockRule: Record<string, unknown>
  content: Record<string, unknown>
  source?: 'studio' | 'legacy' | 'runtime'
}

export type ConfigChannel = 'level' | 'event' | 'storybook' | 'action' | 'unconfigured'
export type ConfigIssue = { severity: 'error' | 'warning' | 'info'; message: string }
export type RewardConfigMapRow<T extends RewardConfigItem = RewardConfigItem> = {
  item: T
  channel: ConfigChannel
  trigger: string
  rewardIds: string[]
  issues: ConfigIssue[]
}

const supportedMetrics = new Set([
  'lessons_completed', 'courses_completed', 'stars', 'streak', 'xp', 'level',
  'event_quests_completed', 'creative_projects_completed', 'perfect_lessons',
  'collaborations_completed', 'quests_completed', 'chapter_regular_stickers',
])

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === 'string' && Boolean(entry.trim()))
}

function linkedRewards(item: RewardConfigItem): string[] {
  const direct = stringList(item.content.rewardIds ?? item.content.rewardPool)
  const chapterReward = typeof item.content.rewardId === 'string' && item.content.rewardId.trim()
    ? [item.content.rewardId]
    : []
  return [...new Set([...chapterReward, ...direct])]
}

function channelFor(item: RewardConfigItem): ConfigChannel {
  if (item.contentType === 'achievement') return 'action'
  if (item.unlockRule.type === 'storybook_sticker' && String(item.unlockRule.value ?? '').startsWith('event-')) return 'event'
  if (item.contentType === 'event' || item.unlockRule.type === 'event') return 'event'
  if (item.contentType === 'chapter' || item.unlockRule.type === 'storybook_sticker') return 'storybook'
  if (item.unlockRule.type === 'xp_level') return 'level'
  if (item.unlockRule.type === 'achievement' || item.unlockRule.type === 'action') return 'action'
  return 'unconfigured'
}

function triggerFor(item: RewardConfigItem, channel: ConfigChannel): string {
  if (channel === 'level') return `Đạt level ${String(item.unlockRule.value ?? '—')}`
  if (channel === 'event') {
    const startsAt = typeof item.content.startsAt === 'string' ? item.content.startsAt : ''
    const endsAt = typeof item.content.endsAt === 'string' ? item.content.endsAt : ''
    if (item.contentType === 'event') return startsAt && endsAt ? `${startsAt} → ${endsAt}` : 'Thiếu lịch sự kiện'
    return `Sự kiện: ${String(item.unlockRule.value ?? '—')}`
  }
  if (channel === 'storybook') return item.contentType === 'chapter'
    ? `Boss chapter ${String(item.content.slug ?? item.code)}`
    : `Sticker ${String(item.unlockRule.value ?? '—')}`
  if (channel === 'action') {
    const requirements = item.content.requirements as Record<string, unknown> | undefined
    const metric = requirements?.metric ?? item.unlockRule.metric ?? item.unlockRule.value ?? '—'
    const target = requirements?.target ?? item.unlockRule.target
    return target == null ? `Action: ${String(metric)}` : `${String(metric)} ≥ ${String(target)}`
  }
  return 'Chưa có rule được hỗ trợ'
}

function validateItem(item: RewardConfigItem, rewardCodes: Set<string>): ConfigIssue[] {
  const issues: ConfigIssue[] = []
  if (item.source === 'legacy') issues.push({ severity: 'warning', message: 'Đang chạy từ catalog tương thích; chưa được Admin Studio quản lý.' })
  if (item.source === 'runtime') issues.push({ severity: 'info', message: 'Achievement runtime đang hoạt động; có thể đưa vào Studio khi cần chỉnh sửa.' })
  const type = item.unlockRule.type
  if (typeof type !== 'string' || !type.trim()) issues.push({ severity: 'error', message: 'Thiếu loại điều kiện mở khóa.' })

  if (type === 'xp_level') {
    const level = Number(item.unlockRule.value)
    if (!Number.isInteger(level) || level < 1 || level > 100) {
      issues.push({ severity: 'error', message: 'Level phải là số nguyên từ 1 đến 100.' })
    }
  }
  if ((type === 'event' || type === 'storybook_sticker' || type === 'achievement')
    && (typeof item.unlockRule.value !== 'string' || !item.unlockRule.value.trim())) {
    issues.push({ severity: 'error', message: 'Điều kiện phải có mã tham chiếu.' })
  }

  if (item.contentType === 'event') {
    const start = Date.parse(String(item.content.startsAt ?? ''))
    const end = Date.parse(String(item.content.endsAt ?? ''))
    if (!Number.isFinite(start) || !Number.isFinite(end)) issues.push({ severity: 'error', message: 'Thiếu hoặc sai thời gian sự kiện.' })
    else if (end <= start) issues.push({ severity: 'error', message: 'Thời gian kết thúc phải sau bắt đầu.' })
  }

  if (item.contentType === 'chapter') {
    const stickers = Array.isArray(item.content.stickers) ? item.content.stickers as Array<Record<string, unknown>> : []
    if (stickers.length !== 9) issues.push({ severity: 'error', message: 'Chapter phải có đúng 9 sticker.' })
    const boss = stickers.filter((sticker) => sticker.boss === true)
    if (boss.length !== 1) issues.push({ severity: 'error', message: 'Chapter phải có đúng 1 boss sticker.' })
    for (const [index, sticker] of stickers.entries()) {
      const rule = sticker.unlockRule as Record<string, unknown> | undefined
      const metric = rule?.metric
      if (typeof metric !== 'string' || !supportedMetrics.has(metric)) {
        issues.push({ severity: 'error', message: `Sticker ${index + 1} dùng action/metric không được hỗ trợ.` })
        break
      }
      if (rule?.operator !== 'gte' || !Number.isFinite(Number(rule?.target)) || Number(rule?.target) < 1) {
        issues.push({ severity: 'error', message: `Sticker ${index + 1} có phép so sánh hoặc mục tiêu không hợp lệ.` })
        break
      }
    }
  }

  for (const rewardId of linkedRewards(item)) {
    if (!rewardCodes.has(rewardId)) issues.push({ severity: 'error', message: `Reward liên kết không tồn tại: ${rewardId}.` })
  }
  if (item.contentType !== 'reward' && item.contentType !== 'achievement' && linkedRewards(item).length === 0) {
    issues.push({ severity: 'warning', message: 'Chưa cấu hình reward đầu ra.' })
  }
  if (item.status === 'published' && issues.some((issue) => issue.severity === 'error')) {
    issues.push({ severity: 'warning', message: 'Bản đang phát hành có lỗi cấu hình; cần tạo version thay thế.' })
  }
  return issues
}

export function buildRewardConfigMap<T extends RewardConfigItem>(items: readonly T[]): RewardConfigMapRow<T>[] {
  const rewardCodes = new Set(items.filter((item) => item.contentType === 'reward').map((item) => item.code))
  const rows = items.map((item) => {
    const channel = channelFor(item)
    return { item, channel, trigger: triggerFor(item, channel), rewardIds: linkedRewards(item), issues: validateItem(item, rewardCodes) }
  })
  const repeatedTriggers = new Map<string, RewardConfigMapRow<T>[]>()
  for (const row of rows) {
    if (row.channel !== 'storybook' && row.channel !== 'event') continue
    const key = `${row.channel}:${String(row.item.unlockRule.value ?? '')}`
    repeatedTriggers.set(key, [...(repeatedTriggers.get(key) ?? []), row])
  }
  for (const repeated of repeatedTriggers.values()) {
    if (repeated.length < 2) continue
    for (const row of repeated) row.issues.push({ severity: 'info', message: `Reward bundle: ${repeated.length} phần thưởng dùng chung điều kiện mở khóa.` })
  }
  return rows
}
