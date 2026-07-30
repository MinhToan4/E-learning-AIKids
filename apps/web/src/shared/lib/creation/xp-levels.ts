export type XpSource =
  | 'learning'
  | 'creative'
  | 'game'
  | 'event'
  | 'social'

export interface ExplorerLevel {
  level: number
  title: string
  xpRequired: number
  reward: string
  storybookSticker?: string
}

export const EXPLORER_LEVELS: readonly ExplorerLevel[] = [
  { level: 1, title: 'Tia Sáng Đầu Tiên', xpRequired: 0, reward: 'Danh hiệu khởi hành' },
  { level: 2, title: 'Người Tìm Tòi', xpRequired: 100, reward: 'Avatar Paco Xanh' },
  { level: 3, title: 'Nhà Khám Phá', xpRequired: 400, reward: 'Khung Cầu Vồng' },
  { level: 4, title: 'Người Săn Ý Tưởng', xpRequired: 900, reward: 'Theme Xưởng Sáng Tạo' },
  { level: 5, title: 'Nhà Thám Hiểm Ánh Sao', xpRequired: 1_600, reward: 'Sticker P04-S1', storybookSticker: 'P04-S1' },
  { level: 6, title: 'Người Dẫn Đường', xpRequired: 2_500, reward: 'Hiệu ứng sticker Lấp Lánh' },
  { level: 7, title: 'Kiến Trúc Sư Thế Giới', xpRequired: 3_600, reward: 'Khung Dải Ngân Hà' },
  { level: 8, title: 'Người Truyền Lửa', xpRequired: 4_900, reward: '1 vé thử thách đặc biệt' },
  { level: 9, title: 'Người Giữ Ánh Sao', xpRequired: 6_400, reward: 'Mở hint Boss sớm' },
  { level: 10, title: 'Huyền Thoại Trẻ', xpRequired: 8_100, reward: 'Theme Storybook Huyền Thoại', storybookSticker: 'P04-S9' },
] as const

export function xpRequiredForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level))
  return (safeLevel - 1) ** 2 * 100
}

function explorerLevelMetadata(level: number): ExplorerLevel {
  const safeLevel = Math.max(1, Math.floor(level))
  return EXPLORER_LEVELS.find((item) => item.level === safeLevel) ?? {
    level: safeLevel,
    title: `Nhà khám phá cấp ${safeLevel}`,
    xpRequired: xpRequiredForLevel(safeLevel),
    reward: 'Phần thưởng đang được cập nhật',
  }
}

export function explorerLevelForXp(xp: number, backendLevel?: number): ExplorerLevel {
  const resolvedLevel = backendLevel != null
    ? Math.max(1, Math.floor(backendLevel))
    : Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1
  return explorerLevelMetadata(resolvedLevel)
}

export function nextExplorerLevel(xp: number, backendLevel?: number): ExplorerLevel {
  const current = explorerLevelForXp(xp, backendLevel)
  return explorerLevelMetadata(current.level + 1)
}

export function explorerLevelProgress(xp: number, backendLevel?: number): number {
  const current = explorerLevelForXp(xp, backendLevel)
  const next = nextExplorerLevel(xp, backendLevel)
  return Math.round(
    Math.min(1, Math.max(0,
      (Math.max(0, xp) - current.xpRequired) /
      (next.xpRequired - current.xpRequired),
    )) * 100,
  )
}

export function explorerLevelsAfter(level: number, count: number): ExplorerLevel[] {
  return Array.from(
    { length: Math.max(0, count) },
    (_, index) => explorerLevelMetadata(Math.max(1, Math.floor(level)) + index + 1),
  )
}
