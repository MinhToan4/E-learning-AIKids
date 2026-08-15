import type { AchievementRow } from '@/shared/lib/api'

import collaborationArtwork from '@/assets/rewards/mee-records/mee-record-collaboration.png'
import coursesArtwork from '@/assets/rewards/mee-records/mee-record-courses.png'
import creativeArtwork from '@/assets/rewards/mee-records/mee-record-creative.png'
import lessonsArtwork from '@/assets/rewards/mee-records/mee-record-lessons.png'
import levelArtwork from '@/assets/rewards/mee-records/mee-record-level.png'
import perfectArtwork from '@/assets/rewards/mee-records/mee-record-perfect.png'
import questsArtwork from '@/assets/rewards/mee-records/mee-record-quests.png'
import starsArtwork from '@/assets/rewards/mee-records/mee-record-stars.png'
import streakArtwork from '@/assets/rewards/mee-records/mee-record-streak.png'
import xpArtwork from '@/assets/rewards/mee-records/mee-record-xp.png'

export function meePersonalRecordAsset(item: AchievementRow): string | null {
  const semantic = [item.type, item.seriesKey, item.category]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (semantic.includes('perfect')) return perfectArtwork
  if (semantic.includes('streak') || semantic.includes('habit')) return streakArtwork
  if (semantic.includes('collaboration') || semantic.includes('social')) return collaborationArtwork
  if (semantic.includes('creative') || semantic.includes('creation') || semantic.includes('project')) return creativeArtwork
  if (semantic.includes('course')) return coursesArtwork
  if (semantic.includes('lesson') || semantic.includes('learning')) return lessonsArtwork
  if (semantic.includes('quest') || semantic.includes('mission')) return questsArtwork
  if (semantic.includes('level')) return levelArtwork
  if (semantic.includes('star')) return starsArtwork
  if (semantic.includes('xp')) return xpArtwork
  return null
}
