export type ContentType = 'reward' | 'chapter' | 'event' | 'achievement'
export type ChapterEditorFocus = 'cover' | 'left' | 'stickerPage' | 'stickers'
export type LifecycleAction = 'review' | 'publish' | 'revert' | 'archive'
export type DependencyReport = { canDelete: boolean; references: Array<{ type: string; label: string }> }
export type AuditEntry = { id: string; action: string; actorName?: string; createdAt: string; summary?: string }

export type StudioItem = {
  id: string
  contentType: ContentType
  code: string
  version: number
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'retired'
  name: string
  description: string
  kind?: string | null
  rarity: string
  assets: {
    thumbnailUrl?: string
    imageUrl?: string
    overlayUrl?: string
    animationUrl?: string
    coverUrl?: string
    leftBackgroundUrl?: string
    stickerPageUrl?: string
    stickerSheetUrl?: string
  }
  displayConfig: Record<string, unknown>
  unlockRule: Record<string, unknown>
  content: Record<string, unknown>
  updatedAt?: string
  source?: 'studio' | 'legacy' | 'runtime'
}

export type AssetSpec = {
  label: string
  width: number
  height: number
  flexibleHeight?: boolean
  formats: string[]
  maxMb: number
  transparent: boolean
  layer: number
  slot: string
  safeArea: string
  combinesWith: string
}

export const kindOptions = [
  'frame', 'background', 'companion', 'effect', 'theme', 'title',
  'event_ticket', 'perk', 'avatar',
] as const

export type RewardKind = typeof kindOptions[number]

export type ChapterStickerItem = {
  id: string
  name: string
  icon: string
  hint: string
  boss?: boolean
  imageUrl?: string
  placeholderUrl?: string
  sheetIndex?: number
  unlockRule?: { metric?: string; operator?: string; target?: number }
}

export type AchievementMilestone = {
  label: string
  description?: string
  metric?: string
  operator?: string
  threshold: number
  imageUrl?: string
  points?: number
  rewardLabel?: string
  rewardAssetId?: string
}

export type StudioFormState = {
  contentType: ContentType
  code: string
  name: string
  description: string
  kind: string
  rarity: string
  assetUrl: string
  thumbnailUrl: string
  unlockType: string
  unlockValue: string
  chapterSlug: string
  chapterGroup: string
  chapterEmoji: string
  chapterColorStart: string
  chapterColorEnd: string
  chapterTheme: string
  chapterStory: string
  chapterCoverUrl: string
  chapterLeftBackgroundUrl: string
  chapterStickerPageUrl: string
  chapterStickerSheetUrl: string
  chapterButtonUrl: string
  stickerButtonUrl: string
  helpButtonUrl: string
  claimButtonUrl: string
  previousButtonUrl: string
  nextButtonUrl: string
  chapterRewardId: string
  chapterStickersJson: string
  eventStartsAt: string
  eventEndsAt: string
  achievementCategory: string
  achievementMetric: string
  achievementMilestonesJson: string
  displayJson: string
  contentJson: string
}
