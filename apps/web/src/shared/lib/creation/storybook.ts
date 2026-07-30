import { REWARD_CATALOG, type RewardDefinition } from './rewards.js'

export interface StorybookChapterDefinition {
  slug: string
  title: string
  group: 'learning' | 'creative' | 'milestone' | 'social'
  stickerIds: readonly string[]
  bossStickerId: string
  rewardId: string
}

const chapter = (
  slug: string,
  title: string,
  group: StorybookChapterDefinition['group'],
  rewardId: string,
): StorybookChapterDefinition => ({
  slug,
  title,
  group,
  stickerIds: Array.from({ length: 8 }, (_, index) => `${slug}-S${index + 1}`),
  bossStickerId: `${slug}-S9`,
  rewardId,
})

export const STORYBOOK_CHAPTERS: readonly StorybookChapterDefinition[] = [
  chapter('P01', 'Cánh Cổng Thế Giới AI', 'learning', 'background-ai-gate'),
  chapter('P02', 'Vương Quốc Ngôn Ngữ', 'learning', 'frame-language-kingdom'),
  chapter('P03', 'Đại Dương Hình Ảnh', 'creative', 'background-ocean-artist'),
  chapter('P04', 'Đỉnh Núi Tri Thức', 'milestone', 'frame-summit-gold'),
  chapter('P05', 'Xưởng Của Paco', 'creative', 'theme-paco-workshop'),
  chapter('P06', 'Rừng Nhân Vật', 'creative', 'background-forest-guardian'),
  chapter('P07', 'Thiên Hà Câu Chuyện', 'creative', 'frame-galaxy-storyteller'),
  chapter('P08', 'Trái Tim Kết Nối', 'social', 'theme-community-legend'),
] as const

const stickerIds = new Set(
  STORYBOOK_CHAPTERS.flatMap((item) => [...item.stickerIds, item.bossStickerId]),
)

export function isStorybookStickerId(value: string): boolean {
  return stickerIds.has(value)
}

export function storybookChapter(
  slug: string,
): StorybookChapterDefinition | undefined {
  return STORYBOOK_CHAPTERS.find((item) => item.slug === slug.toUpperCase())
}

export function chapterReward(
  chapterDefinition: StorybookChapterDefinition,
): RewardDefinition {
  const reward = REWARD_CATALOG.find(
    (item) => item.id === chapterDefinition.rewardId,
  )
  if (!reward) {
    throw new Error(`Missing reward catalog entry: ${chapterDefinition.rewardId}`)
  }
  return reward
}

export function isChapterClaimable(
  chapterDefinition: StorybookChapterDefinition,
  earnedStickerIds: ReadonlySet<string> | readonly string[],
): boolean {
  const earned = new Set(earnedStickerIds)
  return chapterDefinition.stickerIds.every((stickerId) => earned.has(stickerId))
}
