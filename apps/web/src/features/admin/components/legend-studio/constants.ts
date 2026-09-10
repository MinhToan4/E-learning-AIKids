import type { AssetSpec, RewardKind, StudioFormState, StudioItem } from './types'
import { kindOptions } from './types'
import { STORYBOOK_PAGES } from '@/features/storybook/storybook-data'
import { REWARD_CATALOG } from '@/shared/lib/creation/rewards'
import { storybookChapter } from '@/shared/lib/creation/storybook'
import { getResolvedRewardAssetUrl } from '@/features/rewards/reward-assets'
import { rewardTitleAsset } from '@/features/rewards/title-assets'
import { achievementBadgeAsset, rewardBadgeThumbnail } from '@/features/achievements/achievement-badge-assets'
import { achievementEvolutionTier, resolveAchievementMetric } from '@/features/achievements/achievement-config'
import type { AchievementRow } from '@/shared/lib/api'

export { kindOptions }

export const assetSpecs: Record<RewardKind, AssetSpec> = {
  background: { label: 'Nền thẻ hồ sơ', width: 1500, height: 400, formats: ['image/webp', 'image/jpeg', 'image/png'], maxMb: 3, transparent: false, layer: 0, slot: 'profile_background', safeArea: 'Giữ chủ thể ngoài vùng giữa 60%', combinesWith: 'Avatar + Frame + Companion + Effect + Title' },
  avatar: { label: 'Avatar', width: 1200, height: 1200, formats: ['image/webp', 'image/png', 'image/jpeg'], maxMb: 2, transparent: false, layer: 20, slot: 'profile_avatar', safeArea: 'Mặt nằm trong vòng tròn giữa 72%', combinesWith: 'Background + Frame + Companion + Effect' },
  frame: { label: 'Khung avatar', width: 1024, height: 1024, formats: ['image/png', 'image/webp'], maxMb: 2, transparent: true, layer: 30, slot: 'avatar_frame', safeArea: 'Giữa ảnh phải trong suốt tối thiểu 58%', combinesWith: 'Background + Avatar + 1 Companion + 1 Effect' },
  companion: { label: 'Bạn đồng hành', width: 512, height: 512, formats: ['image/png', 'image/webp'], maxMb: 1.5, transparent: true, layer: 40, slot: 'avatar_companion', safeArea: 'Nhân vật trong 90%, chừa 5% mỗi cạnh', combinesWith: 'Background + Avatar + Frame + Effect' },
  effect: { label: 'Hiệu ứng', width: 1200, height: 1200, formats: ['video/webm', 'image/webp', 'image/png'], maxMb: 4, transparent: true, layer: 50, slot: 'avatar_effect', safeArea: 'Không che vùng mặt ở giữa 50%', combinesWith: 'Background + Avatar + Frame + Companion' },
  title: { label: 'Khung danh hiệu', width: 1200, height: 320, flexibleHeight: true, formats: ['image/png', 'image/webp', 'image/svg+xml'], maxMb: 1.5, transparent: true, layer: 60, slot: 'profile_title', safeArea: 'Chiều rộng cố định 1200px; chiều cao theo artwork, chừa vùng chữ giữa', combinesWith: 'Nền trang + nền thẻ; nằm dưới thẻ hồ sơ' },
  theme: { label: 'Nền toàn trang cá nhân', width: 2540, height: 1300, formats: ['image/png', 'image/svg+xml'], maxMb: 4, transparent: false, layer: 10, slot: 'profile_theme', safeArea: 'Giữ nội dung chính trong vùng giữa; chừa khoảng trống cho thẻ hồ sơ', combinesWith: 'Nền thẻ + Frame + Title; chỉ áp dụng trong trang cá nhân' },
  event_ticket: { label: 'Vé / banner sự kiện', width: 1200, height: 675, formats: ['image/webp', 'image/jpeg', 'image/png'], maxMb: 2, transparent: false, layer: 0, slot: 'event_card', safeArea: 'Chừa 20% bên trái cho tên và thời gian', combinesWith: 'Dùng độc lập trong card sự kiện' },
  perk: { label: 'Biểu tượng đặc quyền', width: 512, height: 512, formats: ['image/png', 'image/webp'], maxMb: 1, transparent: true, layer: 60, slot: 'perk_badge', safeArea: 'Icon trong 80% vùng giữa', combinesWith: 'Hiển thị độc lập ở ba lô và badge' },
}

export const assetDimensionLabel = (spec: Pick<AssetSpec, 'width' | 'height' | 'flexibleHeight'>) =>
  spec.flexibleHeight ? `${spec.width}px ngang × cao tự do` : `${spec.width}×${spec.height}px`

export const isAssetDimensionValid = (spec: Pick<AssetSpec, 'width' | 'height' | 'flexibleHeight'>, width: number, height: number) =>
  width === spec.width && (spec.flexibleHeight ? height > 0 : height === spec.height)

export const compareLevelUnlockRules = (
  left: Pick<StudioItem, 'unlockRule' | 'name'>,
  right: Pick<StudioItem, 'unlockRule' | 'name'>,
) => {
  const levelDifference = Number(left.unlockRule.value) - Number(right.unlockRule.value)
  return levelDifference || (left.name ?? '').localeCompare(right.name ?? '', 'vi')
}

export const isVisibleOnPublishedMap = (item: Pick<StudioItem, 'source' | 'status'>) =>
  item.source !== 'studio' || item.status === 'published'

export const studioAchievementCode = (runtimeCode: string) => runtimeCode.replace(/^achievement\./, '')

export function studioAssetPreviewKind(url: string): 'image' | 'video' | 'config' {
  let pathname = url.toLowerCase()
  try { pathname = new URL(url, 'https://cms.local').pathname.toLowerCase() } catch { /* use raw value */ }
  if (pathname.endsWith('.webm')) return 'video'
  if (pathname.endsWith('.json')) return 'config'
  return 'image'
}

export function studioArtwork(item: StudioItem): string | undefined {
  return item.assets.imageUrl ?? item.assets.thumbnailUrl
    ?? (item.contentType === 'reward' ? rewardTitleAsset(item.code) ?? getResolvedRewardAssetUrl(item.code) : item.assets.coverUrl)
}

export const achievementFamilyLabels: Record<string, string> = {
  learning: 'Học tập', habit: 'Thói quen', creativity: 'Sáng tạo', creative: 'Sáng tạo', social: 'Hợp tác',
  safety: 'An toàn', exploration: 'Khám phá', mastery: 'Chinh phục', stars: 'Ngôi sao',
  discovery: 'Khám phá', challenge: 'Thử thách', records: 'Kỷ lục', progress: 'Tiến bộ', other: 'Khác',
}

export function achievementFamilyLabel(category: unknown): string {
  const key = typeof category === 'string' && category.trim() ? category : 'other'
  return achievementFamilyLabels[key] ?? key.replaceAll('_', ' ')
}

export function studioStatusLabel(item: StudioItem): string {
  if (item.source === 'legacy') return 'Legacy'
  if (item.source === 'runtime') return 'Runtime'
  return { draft: 'Bản nháp', review: 'Chờ duyệt', scheduled: 'Đã lên lịch', published: 'Đang phát hành', retired: 'Đã archive · chờ xóa' }[item.status]
}

export function studioEditLabel(item: StudioItem): string {
  if (item.source === 'legacy' || item.source === 'runtime') return 'Đưa vào Studio'
  if (item.status === 'published' || item.status === 'retired') return 'Chỉnh sửa'
  if (item.status === 'review' || item.status === 'scheduled') return 'Cập nhật bản duyệt'
  return 'Sửa bản nháp'
}

export const storybookThemePresets = STORYBOOK_PAGES.map((page) => ({
  key: page.slug.toLowerCase(),
  label: page.title,
  emoji: page.emoji,
  colors: page.colors,
  coverUrl: page.coverUrl ?? '',
  leftBackgroundUrl: page.leftBackgroundUrl ?? '',
  stickerPageUrl: page.stickerPageUrl ?? '',
  stickerSheetUrl: page.stickerSheetUrl ?? '',
}))

export const stickerMetrics = [
  { value: 'lessons_completed', label: 'Bài học đã hoàn thành', unit: 'bài', source: 'LMS' },
  { value: 'courses_completed', label: 'Khóa học đã hoàn thành', unit: 'khóa', source: 'LMS' },
  { value: 'stars', label: 'Tổng số sao học tập', unit: 'sao', source: 'LMS' },
  { value: 'streak', label: 'Chuỗi ngày học liên tiếp', unit: 'ngày', source: 'Gamification' },
  { value: 'xp', label: 'Tổng XP hệ sinh thái', unit: 'XP', source: 'Gamification' },
  { value: 'level', label: 'Cấp XP', unit: 'cấp', source: 'Gamification' },
] as const

export const displayTemplate = (kind: RewardKind) => {
  const spec = assetSpecs[kind]
  return JSON.stringify({
    slot: spec.slot,
    layer: spec.layer,
    canvas: { width: spec.width, height: spec.height },
    transparent: spec.transparent,
    fit: 'contain',
    glowColor: '#A78BFA',
    intensity: 0.6,
  }, null, 2)
}

export const emptyForm = (): StudioFormState => ({
  contentType: 'reward',
  code: '',
  name: '',
  description: '',
  kind: 'frame',
  rarity: 'common',
  assetUrl: '',
  thumbnailUrl: '',
  unlockType: 'xp_level',
  unlockValue: '1',
  chapterSlug: 'P09',
  chapterGroup: 'learning',
  chapterEmoji: '📖',
  chapterColorStart: '#4338CA',
  chapterColorEnd: '#F59E0B',
  chapterTheme: 'custom',
  chapterStory: '',
  chapterCoverUrl: '',
  chapterLeftBackgroundUrl: '',
  chapterStickerPageUrl: '',
  chapterStickerSheetUrl: '',
  chapterButtonUrl: '',
  stickerButtonUrl: '',
  helpButtonUrl: '',
  claimButtonUrl: '',
  previousButtonUrl: '',
  nextButtonUrl: '',
  chapterRewardId: '',
  chapterStickersJson: JSON.stringify(Array.from({ length: 9 }, (_, index) => ({
    id: `P09-S${index + 1}`,
    name: index === 8 ? 'Boss huyền thoại' : `Sticker ${index + 1}`,
    icon: index === 8 ? '🏆' : '⭐',
    hint: index === 8 ? 'Hoàn thành 8 sticker thường' : 'Mô tả điều kiện mở khóa',
    boss: index === 8,
    unlockRule: index === 8
      ? { metric: 'chapter_regular_stickers', operator: 'gte', target: 8 }
      : { metric: 'lessons_completed', operator: 'gte', target: index + 1 },
  })), null, 2),
  eventStartsAt: '',
  eventEndsAt: '',
  achievementCategory: 'learning',
  achievementMetric: 'lessons_completed',
  achievementMilestonesJson: JSON.stringify([
    { label: 'Mầm non', description: 'Bắt đầu hành trình', metric: 'lessons_completed', operator: 'gte', threshold: 1, imageUrl: '', points: 10, rewardLabel: '', rewardAssetId: '' },
  ], null, 2),
  displayJson: displayTemplate('frame'),
  contentJson: '{}',
})

export function legacyRewardStudioItems(studioItems: readonly StudioItem[]): StudioItem[] {
  const rows: readonly StudioItem[] = Array.isArray(studioItems) ? studioItems : []
  const studioCodes = new Set(rows.map((item) => item.code))
  const catalog = Array.isArray(REWARD_CATALOG) ? REWARD_CATALOG : []
  return catalog
    .filter((reward) => !studioCodes.has(reward.id))
    .map((reward): StudioItem => ({
      id: `legacy:${reward.id}`,
      contentType: 'reward',
      code: reward.id,
      version: 0,
      status: 'published',
      source: 'legacy',
      name: reward.name,
      description: reward.description,
      kind: reward.kind,
      rarity: 'common',
      assets: {},
      displayConfig: reward.equipValue ? { equipValue: reward.equipValue } : {},
      unlockRule: { type: reward.unlock.type, value: reward.unlock.value },
      content: reward.eventKey ? { eventKey: reward.eventKey } : {},
    }))
}

export function legacyStorybookStudioItems(studioItems: readonly StudioItem[]): StudioItem[] {
  const rows: readonly StudioItem[] = Array.isArray(studioItems) ? studioItems : []
  const studioChapterCodes = new Set(
    rows
      .filter((item) => item.contentType === 'chapter')
      .map((item) => item.code.toUpperCase()),
  )
  const pages = Array.isArray(STORYBOOK_PAGES) ? STORYBOOK_PAGES : []
  return pages
    .filter((page) => !studioChapterCodes.has(page.slug.toUpperCase()))
    .map((page): StudioItem => {
      const definition = storybookChapter(page.slug)
      return {
        id: `legacy:storybook:${page.slug}`,
        contentType: 'chapter',
        code: page.slug,
        version: 0,
        status: 'published',
        source: 'legacy',
        name: page.title,
        description: page.story,
        rarity: 'common',
        assets: {
          coverUrl: page.coverUrl,
          leftBackgroundUrl: page.leftBackgroundUrl,
          stickerPageUrl: page.stickerPageUrl,
          stickerSheetUrl: page.stickerSheetUrl,
        },
        displayConfig: {
          group: page.group,
          emoji: page.emoji,
          colors: page.colors,
        },
        unlockRule: { type: 'storybook_sticker', value: `${page.slug}-S9` },
        content: {
          slug: page.slug,
          story: page.story,
          rewardId: page.rewardId ?? definition?.rewardId,
          stickers: page.stickers,
          migratedFrom: 'storybook_catalog',
        },
      }
    })
}

export function runtimeAchievementItems(rows: readonly AchievementRow[]): StudioItem[] {
  const safeRows: readonly AchievementRow[] = Array.isArray(rows) ? rows : []
  return safeRows.map((achievement): StudioItem => {
    const artwork = achievement.imageUrl ?? achievement.milestones?.[0]?.imageUrl ?? achievementBadgeAsset(achievement)
    return {
      id: `runtime:${achievement.type}`,
      contentType: 'achievement',
      code: achievement.type,
      version: 0,
      status: 'published',
      source: 'runtime',
      name: achievement.title,
      description: achievement.description,
      kind: 'perk',
      rarity: 'common',
      assets: artwork ? { imageUrl: artwork } : {},
      displayConfig: {},
      unlockRule: { type: 'action', metric: achievement.type, target: achievement.requiredValue },
      content: {
        requirements: { metric: achievement.type, operator: 'gte', target: achievement.requiredValue },
        points: achievement.points,
        category: achievement.category ?? 'other',
        milestones: (achievement.milestones ?? []).map((milestone, index) => ({
          ...milestone,
          label: achievementEvolutionTier(index).label,
          metric: resolveAchievementMetric(milestone.metric ?? achievement.type),
          operator: milestone.operator ?? 'gte',
          imageUrl: milestone.imageUrl ?? achievementBadgeAsset({
            ...achievement,
            requiredValue: milestone.threshold,
            rewardAssetId: milestone.rewardAssetId,
            milestones: undefined,
          }),
        })),
        rewardLabel: achievement.rewardLabel,
        rewardAssetId: achievement.rewardAssetId,
      },
    }
  })
}
