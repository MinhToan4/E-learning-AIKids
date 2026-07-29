export type RewardKind =
  | 'avatar'
  | 'frame'
  | 'theme'
  | 'event_ticket'
  | 'perk'
  | 'title'

export interface RewardDefinition {
  id: string
  kind: RewardKind
  name: string
  description: string
  icon: string
  unlock: {
    type: 'xp_level' | 'storybook_sticker'
    value: number | string
  }
  equipValue?: string
  eventKey?: string
}

export const REWARD_CATALOG: readonly RewardDefinition[] = [
  {
    id: 'title-first-light',
    kind: 'title',
    name: 'Tia Sáng Đầu Tiên',
    description: 'Danh hiệu đầu tiên trên hồ sơ.',
    icon: '✨',
    unlock: { type: 'xp_level', value: 1 },
    equipValue: 'Tia Sáng Đầu Tiên',
  },
  {
    id: 'avatar-paco-blue',
    kind: 'avatar',
    name: 'Avatar Paco Xanh',
    description: 'Paco đồng hành trong mọi ứng dụng StoryMee.',
    icon: '🤖',
    unlock: { type: 'xp_level', value: 2 },
    equipValue: 'avatar-robot',
  },
  {
    id: 'frame-rainbow',
    kind: 'frame',
    name: 'Khung Cầu Vồng',
    description: 'Khung hồ sơ bảy sắc dành cho Nhà Khám Phá.',
    icon: '🌈',
    unlock: { type: 'xp_level', value: 3 },
    equipValue: 'rainbow',
  },
  {
    id: 'theme-workshop',
    kind: 'theme',
    name: 'Theme Xưởng Sáng Tạo',
    description: 'Màu cam ấm và những bánh răng ý tưởng.',
    icon: '🛠️',
    unlock: { type: 'xp_level', value: 4 },
    equipValue: 'workshop',
  },
  {
    id: 'sticker-p04-s1',
    kind: 'perk',
    name: 'Sticker Nhà Thám Hiểm',
    description: 'Sticker cột mốc tại Trang P04.',
    icon: '💎',
    unlock: { type: 'xp_level', value: 5 },
  },
  {
    id: 'perk-sticker-sparkle',
    kind: 'perk',
    name: 'Hiệu ứng Lấp Lánh',
    description: 'Sticker đã mở có hiệu ứng ánh sao.',
    icon: '💫',
    unlock: { type: 'xp_level', value: 6 },
    equipValue: 'sparkle',
  },
  {
    id: 'frame-galaxy',
    kind: 'frame',
    name: 'Khung Dải Ngân Hà',
    description: 'Khung huyền thoại với quỹ đạo sao.',
    icon: '🌌',
    unlock: { type: 'xp_level', value: 7 },
    equipValue: 'galaxy',
  },
  {
    id: 'ticket-creative-challenge',
    kind: 'event_ticket',
    name: 'Vé Thử Thách Đặc Biệt',
    description: 'Dùng để tham gia một challenge giới hạn.',
    icon: '🎟️',
    unlock: { type: 'xp_level', value: 8 },
    eventKey: 'creative-challenge',
  },
  {
    id: 'perk-boss-hint',
    kind: 'perk',
    name: 'Mở Hint Boss Sớm',
    description: 'Xem một hint Boss trước thời hạn.',
    icon: '🔮',
    unlock: { type: 'xp_level', value: 9 },
    equipValue: 'early-boss-hint',
  },
  {
    id: 'theme-legend',
    kind: 'theme',
    name: 'Theme Storybook Huyền Thoại',
    description: 'Bìa tím vàng dành cho Huyền Thoại Trẻ.',
    icon: '📖',
    unlock: { type: 'xp_level', value: 10 },
    equipValue: 'legend',
  },
  {
    id: 'frame-cloud-summer',
    kind: 'frame',
    name: 'Khung Mây Mùa Hè',
    description: 'Hoàn thành sự kiện Hè Trên Mây 2026.',
    icon: '☁️',
    unlock: { type: 'storybook_sticker', value: 'event-summer-2026-S9' },
    equipValue: 'cloud-summer',
  },
  {
    id: 'title-creative-warrior',
    kind: 'title',
    name: 'Chiến Binh Sáng Tạo',
    description: 'Hoàn thành Đấu Trường Ý Tưởng.',
    icon: '⚔️',
    unlock: { type: 'storybook_sticker', value: 'event-creative-challenge-S9' },
    equipValue: 'Chiến Binh Sáng Tạo',
  },
] as const

export function isRewardUnlocked(
  reward: RewardDefinition,
  input: { xpLevel: number; stickerIds?: ReadonlySet<string> | string[] },
): boolean {
  if (reward.unlock.type === 'xp_level') {
    return input.xpLevel >= Number(reward.unlock.value)
  }
  const stickers = input.stickerIds ?? []
  return Array.isArray(stickers)
    ? stickers.includes(String(reward.unlock.value))
    : stickers.has(String(reward.unlock.value))
}

export function rewardsForLevel(level: number): RewardDefinition[] {
  return REWARD_CATALOG.filter(
    (reward) =>
      reward.unlock.type === 'xp_level' &&
      Number(reward.unlock.value) === level,
  )
}
