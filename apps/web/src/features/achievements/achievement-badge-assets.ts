import type { AchievementRow } from '@/shared/lib/api'
import { environment } from '@/shared/config/environment'
import { achievementV2AssetPath } from './achievement-v2-assets.generated'

const badgeModules = import.meta.glob<string>(
  '../../assets/rewards/badges/badge-*.png',
  { eager: true, import: 'default', query: '?url' },
)

const badgesById = new Map(
  Object.entries(badgeModules).map(([path, url]) => [
    path.split('/').at(-1)?.replace(/\.png$/, '') ?? '',
    url,
  ]),
)

/** Lightweight raster thumbnail for CMS lists; full SVG remains for profile rendering. */
export function rewardBadgeThumbnail(rewardId?: string): string | undefined {
  if (!rewardId) return undefined
  return badgesById.get(`badge-${rewardId.replace(/\.(?:svg|png|webp)$/, '')}`)
}

function semanticBadgeId(item: AchievementRow): string | undefined {
  const key = `${item.type} ${item.category ?? ''} ${item.seriesKey ?? ''}`.toLowerCase()
  const threshold = item.requiredValue

  if (key.includes('course')) return 'badge-title-explorer'
  if (key.includes('lesson') || key.includes('learning')) {
    return threshold <= 1 ? 'badge-title-first-light' : 'badge-title-explorer'
  }
  if (key.includes('star')) {
    return threshold <= 10 ? 'badge-title-starlight-adventurer' : 'badge-title-star-keeper'
  }
  if (key.includes('streak') || key.includes('habit')) {
    if (threshold <= 3) return 'badge-title-guide'
    if (threshold <= 7) return 'badge-title-firestarter'
    return 'badge-title-star-keeper'
  }
  if (key.includes('xp') || key.includes('level')) {
    return threshold >= 500 ? 'badge-title-young-legend' : 'badge-title-curious-seeker'
  }
  if (key.includes('creative') || key.includes('creation')) return 'badge-title-idea-hunter'
  if (key.includes('collaboration')) return 'badge-title-world-architect'
  return undefined
}

function legacyV2BadgeId(item: AchievementRow): string | undefined {
  const key = `${item.type} ${item.category ?? ''} ${item.seriesKey ?? ''}`.toLowerCase()
  const threshold = item.requiredValue
  const legacySeries = (
    key.includes('course') ? ['courses', [1]]
      : key.includes('lesson') || key.includes('learning') ? ['lessons', [1, 10]]
        : key.includes('star') ? ['stars', [10, 50]]
          : key.includes('streak') || key.includes('habit') ? ['streak', [3, 7, 30]]
            : key.includes('xp') ? ['xp', [500]]
              : undefined
  ) as [string, number[]] | undefined
  if (!legacySeries) return undefined
  const level = legacySeries[1].indexOf(threshold) + 1
  return level > 0 ? `achievement-${legacySeries[0]}-level-${level}` : undefined
}

/** Resolve only approved bundled badges; unknown Hub IDs fail closed. */
export function achievementBadgeAsset(item: AchievementRow): string | undefined {
  if (
    item.imageUrl?.startsWith('/assets/')
    || (environment.storagePublicUrl && item.imageUrl?.startsWith(`${environment.storagePublicUrl}/`))
  ) {
    return item.imageUrl
  }
  const v2Candidates = [item.rewardAssetId, legacyV2BadgeId(item)]
  for (const candidate of v2Candidates) {
    const asset = achievementV2AssetPath(candidate)
    if (asset) return asset
  }

  const candidates = [
    item.rewardAssetId,
    `badge-${item.type}`,
    `badge-${item.type.replaceAll('_', '-')}`,
    semanticBadgeId(item),
  ]
  for (const candidate of candidates) {
    if (!candidate) continue
    const asset = badgesById.get(candidate.replace(/\.(?:png|webp)$/, ''))
    if (asset) return asset
  }
  return undefined
}
