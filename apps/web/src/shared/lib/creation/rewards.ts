export type RewardKind =
  | 'avatar'
  | 'frame'
  | 'theme'
  | 'event_ticket'
  | 'perk'
  | 'title'
  | 'companion'
  | 'effect'
  | 'background'

export interface RewardDefinition {
  id: string
  kind: RewardKind
  name: string
  description: string
  icon: string
  unlock: {
    type: 'xp_level' | 'storybook_sticker' | 'achievement' | 'event'
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
    kind: 'companion',
    name: 'Paco Mây',
    description: 'Paco xuất hiện cạnh avatar trong mọi ứng dụng StoryMee.',
    icon: '🤖',
    unlock: { type: 'xp_level', value: 2 },
    equipValue: 'paco-blue',
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
    name: 'Nền trang Xưởng Sáng Tạo',
    description: 'Nền cam ấm phủ toàn bộ trang cá nhân.',
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
    kind: 'effect',
    name: 'Hào Quang Lấp Lánh',
    description: 'Avatar và sticker đã mở có hiệu ứng ánh sao.',
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
    name: 'Nền trang Storybook Huyền Thoại',
    description: 'Nền tím vàng phủ toàn bộ trang cá nhân của Huyền Thoại Trẻ.',
    icon: '📖',
    unlock: { type: 'xp_level', value: 10 },
    equipValue: 'legend',
  },
  {
    id: 'title-curious-seeker',
    kind: 'title',
    name: 'Người Tìm Tòi',
    description: 'Danh hiệu dành cho người luôn đặt câu hỏi mới.',
    icon: '🔎',
    unlock: { type: 'xp_level', value: 2 },
    equipValue: 'Người Tìm Tòi',
  },
  {
    id: 'title-explorer',
    kind: 'title',
    name: 'Nhà Khám Phá',
    description: 'Danh hiệu ghi dấu những bước học tập đầu tiên.',
    icon: '🧭',
    unlock: { type: 'xp_level', value: 3 },
    equipValue: 'Nhà Khám Phá',
  },
  {
    id: 'title-idea-hunter',
    kind: 'title',
    name: 'Người Săn Ý Tưởng',
    description: 'Danh hiệu cho trí tưởng tượng luôn hoạt động.',
    icon: '💡',
    unlock: { type: 'xp_level', value: 4 },
    equipValue: 'Người Săn Ý Tưởng',
  },
  {
    id: 'title-starlight-adventurer',
    kind: 'title',
    name: 'Nhà Thám Hiểm Ánh Sao',
    description: 'Danh hiệu cho hành trình đã vượt qua những cột mốc đầu tiên.',
    icon: '🌟',
    unlock: { type: 'xp_level', value: 5 },
    equipValue: 'Nhà Thám Hiểm Ánh Sao',
  },
  {
    id: 'title-guide',
    kind: 'title',
    name: 'Người Dẫn Đường',
    description: 'Danh hiệu của người học bền bỉ và biết giúp đỡ.',
    icon: '🏮',
    unlock: { type: 'xp_level', value: 6 },
    equipValue: 'Người Dẫn Đường',
  },
  {
    id: 'title-world-architect',
    kind: 'title',
    name: 'Kiến Trúc Sư Thế Giới',
    description: 'Danh hiệu cho người biến ý tưởng thành tác phẩm.',
    icon: '🏗️',
    unlock: { type: 'xp_level', value: 7 },
    equipValue: 'Kiến Trúc Sư Thế Giới',
  },
  {
    id: 'title-firestarter',
    kind: 'title',
    name: 'Người Truyền Lửa',
    description: 'Danh hiệu ghi nhận tinh thần học tập tích cực.',
    icon: '🔥',
    unlock: { type: 'xp_level', value: 8 },
    equipValue: 'Người Truyền Lửa',
  },
  {
    id: 'title-star-keeper',
    kind: 'title',
    name: 'Người Giữ Ánh Sao',
    description: 'Danh hiệu cho người đã giữ vững hành trình dài.',
    icon: '🌠',
    unlock: { type: 'xp_level', value: 9 },
    equipValue: 'Người Giữ Ánh Sao',
  },
  {
    id: 'title-young-legend',
    kind: 'title',
    name: 'Huyền Thoại Trẻ',
    description: 'Danh hiệu cao nhất của hành trình khám phá đầu tiên.',
    icon: '🏆',
    unlock: { type: 'xp_level', value: 10 },
    equipValue: 'Huyền Thoại Trẻ',
  },
  {
    id: 'storybook-title-p01',
    kind: 'title',
    name: 'Người Giữ Cổng',
    description: 'Danh hiệu hoàn thành Cánh Cổng Thế Giới AI.',
    icon: '🚪',
    unlock: { type: 'storybook_sticker', value: 'P01-S9' },
    equipValue: 'Người Giữ Cổng',
  },
  {
    id: 'storybook-title-p02',
    kind: 'title',
    name: 'Lời Dệt Thành Hoa',
    description: 'Danh hiệu hoàn thành Vương Quốc Ngôn Ngữ.',
    icon: '📖',
    unlock: { type: 'storybook_sticker', value: 'P02-S9' },
    equipValue: 'Lời Dệt Thành Hoa',
  },
  {
    id: 'storybook-title-p03',
    kind: 'title',
    name: 'Vệt Sáng Biển Khơi',
    description: 'Danh hiệu hoàn thành Đại Dương Hình Ảnh.',
    icon: '🌊',
    unlock: { type: 'storybook_sticker', value: 'P03-S9' },
    equipValue: 'Vệt Sáng Biển Khơi',
  },
  {
    id: 'storybook-title-p04',
    kind: 'title',
    name: 'Đỉnh Olympus',
    description: 'Danh hiệu hoàn thành Đỉnh Núi Tri Thức.',
    icon: '🏔️',
    unlock: { type: 'storybook_sticker', value: 'P04-S9' },
    equipValue: 'Đỉnh Olympus',
  },
  {
    id: 'storybook-title-p05',
    kind: 'title',
    name: 'Họa Sĩ Kỳ Tài',
    description: 'Danh hiệu hoàn thành Xưởng Của Paco.',
    icon: '🎨',
    unlock: { type: 'storybook_sticker', value: 'P05-S9' },
    equipValue: 'Họa Sĩ Kỳ Tài',
  },
  {
    id: 'storybook-title-p06',
    kind: 'title',
    name: 'Phù Thủy Rừng Xanh',
    description: 'Danh hiệu hoàn thành Rừng Nhân Vật.',
    icon: '🌳',
    unlock: { type: 'storybook_sticker', value: 'P06-S9' },
    equipValue: 'Phù Thủy Rừng Xanh',
  },
  {
    id: 'storybook-title-p07',
    kind: 'title',
    name: 'Once Upon A Star',
    description: 'Danh hiệu hoàn thành Thiên Hà Câu Chuyện.',
    icon: '🌌',
    unlock: { type: 'storybook_sticker', value: 'P07-S9' },
    equipValue: 'Once Upon A Star',
  },
  {
    id: 'storybook-title-p08',
    kind: 'title',
    name: 'Máy Bay Giấy',
    description: 'Danh hiệu hoàn thành Trái Tim Kết Nối.',
    icon: '💌',
    unlock: { type: 'storybook_sticker', value: 'P08-S9' },
    equipValue: 'Máy Bay Giấy',
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
  {
    id: 'frame-creative-arena',
    kind: 'frame',
    name: 'Khung Đấu Trường Ý Tưởng',
    description: 'Khung tàu vũ trụ nhận khi hoàn thành Đấu Trường Ý Tưởng.',
    icon: '🚂',
    unlock: { type: 'storybook_sticker', value: 'event-creative-challenge-S9' },
    equipValue: 'creative-arena',
  },
  {
    id: 'background-ai-gate',
    kind: 'background',
    name: 'Bình Minh Cổng AI',
    description: 'Nền thẻ hồ sơ nhận khi hoàn thành Cánh Cổng Thế Giới AI.',
    icon: '🌅',
    unlock: { type: 'storybook_sticker', value: 'P01-S9' },
    equipValue: 'ai-gate',
  },
  {
    id: 'frame-language-kingdom',
    kind: 'frame',
    name: 'Khung Thư Viện Cổ',
    description: 'Khung Profile nhận khi hoàn thành Vương Quốc Ngôn Ngữ.',
    icon: '📚',
    unlock: { type: 'storybook_sticker', value: 'P02-S9' },
    equipValue: 'language-kingdom',
  },
  {
    id: 'background-ocean-artist',
    kind: 'background',
    name: 'Đại Dương Sáng Tạo',
    description: 'Nền thẻ hồ sơ nhận khi hoàn thành Đại Dương Hình Ảnh.',
    icon: '🌊',
    unlock: { type: 'storybook_sticker', value: 'P03-S9' },
    equipValue: 'ocean-artist',
  },
  {
    id: 'frame-summit-gold',
    kind: 'frame',
    name: 'Khung Đỉnh Núi Vàng',
    description: 'Khung Profile nhận khi chinh phục Đỉnh Núi Tri Thức.',
    icon: '🏔️',
    unlock: { type: 'storybook_sticker', value: 'P04-S9' },
    equipValue: 'summit-gold',
  },
  {
    id: 'theme-paco-workshop',
    kind: 'theme',
    name: 'Nền trang Xưởng Paco',
    description: 'Nền toàn trang cá nhân nhận khi hoàn thành Xưởng Của Paco.',
    icon: '⚙️',
    unlock: { type: 'storybook_sticker', value: 'P05-S9' },
    equipValue: 'paco-workshop',
  },
  {
    id: 'background-forest-guardian',
    kind: 'background',
    name: 'Rừng Hộ Vệ',
    description: 'Nền thẻ hồ sơ nhận khi hoàn thành Rừng Nhân Vật.',
    icon: '🌳',
    unlock: { type: 'storybook_sticker', value: 'P06-S9' },
    equipValue: 'forest-guardian',
  },
  {
    id: 'frame-galaxy-storyteller',
    kind: 'frame',
    name: 'Khung Người Kể Chuyện Thiên Hà',
    description: 'Khung Profile nhận khi hoàn thành Thiên Hà Câu Chuyện.',
    icon: '🌠',
    unlock: { type: 'storybook_sticker', value: 'P07-S9' },
    equipValue: 'galaxy-storyteller',
  },
  {
    id: 'theme-community-legend',
    kind: 'theme',
    name: 'Nền trang Trái Tim Kết Nối',
    description: 'Nền toàn trang cá nhân nhận khi hoàn thành Trái Tim Kết Nối.',
    icon: '💞',
    unlock: { type: 'storybook_sticker', value: 'P08-S9' },
    equipValue: 'community-legend',
  },
] as const

export function isRewardUnlocked(
  reward: RewardDefinition,
  input: { xpLevel: number; stickerIds?: ReadonlySet<string> | string[] },
): boolean {
  if (reward.unlock.type === 'xp_level') {
    return input.xpLevel >= Number(reward.unlock.value)
  }
  if (reward.unlock.type === 'event') return false
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
