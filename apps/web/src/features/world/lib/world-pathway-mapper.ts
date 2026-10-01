import { type CourseSummary, type QuestProgress } from '@/shared/lib/api'
import { designerAssets } from '@/shared/config/assets'
import {
  findIslandCurriculum,
  ISLAND_CURRICULUM_LESSONS,
} from '@/features/lesson/data/island-curriculum-registry'
import {
  getCanonicalAikidCourseSlug,
  getCourseStationCount,
} from '@/shared/lib/course-station-count'
import { isAikiRuleJourney, extractRuleNumber } from '@/features/lesson/lib/rule-journey-identifiers'
import { isAikiRuleCourse, sortAikiCourses } from './world-gatekeeper'
import { getLocalProgress } from '@/shared/lib/learning-sync-store'
import { clampStationStars } from '@/shared/lib/star-progress'

const isUuid = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val)

export function getStationSlug(station: any, isRuleCourse?: boolean): string {
  if (!station) return ''
  if (isRuleCourse || isAikiRuleJourney(station)) {
    const ruleNum = extractRuleNumber(station)
    if (ruleNum >= 1 && ruleNum <= 10) return `rule-${ruleNum}`
  }
  if (station.slug && typeof station.slug === 'string' && !isUuid(station.slug)) {
    return station.slug
  }
  const matched = findIslandCurriculum({ id: station.id, title: station.title, slug: station.slug })
  if (matched?.slug) return matched.slug
  return station.id || ''
}

// Client-side unlock switches are intentionally disabled. Test accounts such
// as Bo must receive enrollment/entitlement from the backend just like every
// other learner so the browser cannot bypass payment or sequential gates.
export const FORCE_UNLOCK_ALL_ISLANDS = false

export function isUserTestingUnlocked(): boolean {
  if (
    typeof window !== 'undefined' &&
    (window.location.search.includes('preview') ||
      window.location.search.includes('guest') ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('aikids.dev_preview') === 'true'))
  ) {
    return true
  }
  return false
}

export type PathwayCourse = {
  id: string
  slug?: string
  title: string
  shortTitle: string
  status: 'completed' | 'active' | 'available' | 'locked'
  reasonCode: string
  completionPercent: number
  missingPrerequisites: string[]
  coverImage: string | null
  enrolled: boolean
  questCount?: number
  completedCount?: number
  totalStars?: number
  stations?: QuestProgress[]
  programSource?: 'aikid_official' | 'workspace' | 'creator_marketplace'
  workspaceId?: string | null
  programUnlockMode?: 'sequential' | 'parallel' | 'graph'
  isGatekeeper?: boolean
  lockMessage?: string
}

export type Pathway = {
  student: { nickname: string | null; ageBand: string }
  policy: { label: string } | null
  regionUnlockMode?: 'sequential' | 'parallel'
  regionUnlockModeSource?: 'course' | 'classroom' | 'learner_override'
  recommendedCourseId: string | null
  courses: PathwayCourse[]
}

export function createFallbackPathway(): Pathway {
  return {
    student: { nickname: 'Bo Bo', ageBand: '8-11' },
    policy: { label: 'Chương trình chính thức' },
    recommendedCourseId: 'muoi-quy-tac-xuong-sang-tao',
    courses: [
      {
        id: 'muoi-quy-tac-xuong-sang-tao',
        slug: 'muoi-quy-tac-xuong-sang-tao',
        title: 'Mười quy tắc Xưởng',
        shortTitle: '10 Quy tắc vàng',
        status: 'active',
        reasonCode: 'enrolled',
        completionPercent: 0,
        missingPrerequisites: [],
        coverImage: designerAssets.worldScenes.aiValley,
        enrolled: true,
        questCount: 10,
        completedCount: 0,
        totalStars: 0,
      },
      {
        id: 'dao-1-nha-tham-hiem-ai',
        slug: 'dao-1-nha-tham-hiem-ai',
        title: 'Nhà thám hiểm AI',
        shortTitle: 'Bốn chìa khóa vàng',
        status: 'locked',
        reasonCode: 'backend_unavailable',
        completionPercent: 0,
        missingPrerequisites: ['muoi-quy-tac-xuong-sang-tao'],
        coverImage: designerAssets.worldScenes.promptKeys,
        enrolled: false,
        questCount: 4,
        completedCount: 0,
        totalStars: 0,
      },
      {
        id: 'dao-2-hoa-si-ai',
        slug: 'dao-2-hoa-si-ai',
        title: 'Tớ là hoạ sĩ AI!',
        shortTitle: 'Sắc màu & Kể chuyện',
        status: 'locked',
        reasonCode: 'backend_unavailable',
        completionPercent: 0,
        missingPrerequisites: [],
        coverImage: designerAssets.worldScenes.creativeMountain,
        enrolled: false,
        questCount: 4,
        completedCount: 0,
        totalStars: 0,
      },
      {
        id: 'dao-3-biet-doi-nhan-vat-ai',
        slug: 'dao-3-biet-doi-nhan-vat-ai',
        title: 'Biệt đội nhân vật AI',
        shortTitle: 'Hồ sơ 3 điểm',
        status: 'locked',
        reasonCode: 'backend_unavailable',
        completionPercent: 0,
        missingPrerequisites: [],
        coverImage: designerAssets.worldScenes.characterLab,
        enrolled: false,
        questCount: 4,
        completedCount: 0,
        totalStars: 0,
      },
      {
        id: 'dao-4-vuong-quoc-truyen-tranh-ai',
        slug: 'dao-4-vuong-quoc-truyen-tranh-ai',
        title: 'Vương quốc truyện tranh',
        shortTitle: 'Storyboard 8 ô',
        status: 'locked',
        reasonCode: 'backend_unavailable',
        completionPercent: 0,
        missingPrerequisites: [],
        coverImage: designerAssets.worldScenes.storyIsland,
        enrolled: false,
        questCount: 4,
        completedCount: 0,
        totalStars: 0,
      },
      {
        id: 'dao-5-nha-phat-minh-tro-choi-ai',
        slug: 'dao-5-nha-phat-minh-tro-choi-ai',
        title: 'Nhà phát minh trò chơi',
        shortTitle: 'Đấu trường thẻ bài',
        status: 'locked',
        reasonCode: 'backend_unavailable',
        completionPercent: 0,
        missingPrerequisites: [],
        coverImage: designerAssets.worldScenes.gameArena,
        enrolled: false,
        questCount: 4,
        completedCount: 0,
        totalStars: 0,
      },
    ],
  }
}

export const AIKID_CANONICAL_SLUGS = [
  'muoi-quy-tac-xuong-sang-tao',
  'dao-1-nha-tham-hiem-ai',
  'dao-2-hoa-si-ai',
  'dao-3-biet-doi-nhan-vat-ai',
  'dao-4-vuong-quoc-truyen-tranh-ai',
  'dao-5-nha-phat-minh-tro-choi-ai',
] as const

export const AIKID_CANONICAL_TITLE_HINTS: Record<(typeof AIKID_CANONICAL_SLUGS)[number], string[]> = {
  'muoi-quy-tac-xuong-sang-tao': ['quy tắc', 'quy tac'],
  'dao-1-nha-tham-hiem-ai': ['nhà thám hiểm', 'nha tham hiem'],
  'dao-2-hoa-si-ai': ['hoạ sĩ', 'họa sĩ', 'hoa si'],
  'dao-3-biet-doi-nhan-vat-ai': ['biệt đội nhân vật', 'biet doi nhan vat'],
  'dao-4-vuong-quoc-truyen-tranh-ai': ['vương quốc truyện tranh', 'vuong quoc truyen tranh'],
  'dao-5-nha-phat-minh-tro-choi-ai': ['nhà phát minh trò chơi', 'nha phat minh tro choi'],
}

export const ISLAND_ALIAS_MAP: Record<string, string> = {
  'dao-1': 'dao-1-nha-tham-hiem-ai',
  'dao-2': 'dao-2-hoa-si-ai',
  'dao-3': 'dao-3-biet-doi-nhan-vat-ai',
  'dao-4': 'dao-4-vuong-quoc-truyen-tranh-ai',
  'dao-5': 'dao-5-nha-phat-minh-tro-choi-ai',
  'dao-6': 'dao-5-nha-phat-minh-tro-choi-ai',
  'aiki-rules': 'muoi-quy-tac-xuong-sang-tao',
  'muoi-quy-tac': 'muoi-quy-tac-xuong-sang-tao',
  'dao-0': 'muoi-quy-tac-xuong-sang-tao',
  'tien-quyet': 'muoi-quy-tac-xuong-sang-tao',
  'dao-tien-quyet': 'muoi-quy-tac-xuong-sang-tao',
}

export function mapCourseCatalogStations(course?: CourseSummary | null): QuestProgress[] {
  if (!course?.quests?.length) return []

  return course.quests
    .filter((station) => typeof station.id === 'string' && station.id.trim().length > 0)
    .map((station) => ({
      ...station,
      status: station.status || 'locked',
      phase: station.stage || 'learn',
      stars: 0,
      xpEarned: 0,
    })) as QuestProgress[]
}

export const AIKID_CURRICULUM_ISLAND_BY_SLUG: Record<string, number> = {
  'dao-1-nha-tham-hiem-ai': 1,
  'dao-2-hoa-si-ai': 2,
  'dao-3-biet-doi-nhan-vat-ai': 3,
  'dao-4-vuong-quoc-truyen-tranh-ai': 4,
  'dao-5-nha-phat-minh-tro-choi-ai': 5,
}

export function mapPublishedCurriculumStations(
  course?: PathwayCourse | null,
  routeIdentifier?: string,
): QuestProgress[] {
  const canonicalSlug =
    (course ? getCanonicalAikidCourseSlug(course) : null) ||
    (routeIdentifier ? (ISLAND_ALIAS_MAP[routeIdentifier] || ((AIKID_CANONICAL_SLUGS as readonly string[]).includes(routeIdentifier) ? routeIdentifier : null)) : null) ||
    (course?.id ? (ISLAND_ALIAS_MAP[course.id] || ((AIKID_CANONICAL_SLUGS as readonly string[]).includes(course.id) ? course.id : null)) : null) ||
    (course?.slug ? (ISLAND_ALIAS_MAP[course.slug] || ((AIKID_CANONICAL_SLUGS as readonly string[]).includes(course.slug) ? course.slug : null)) : null)
  const islandNumber = canonicalSlug
    ? AIKID_CURRICULUM_ISLAND_BY_SLUG[canonicalSlug]
    : undefined
  if (!islandNumber) return []

  const publishedCount = course ? getCourseStationCount(course) : 0
  const effectiveCount = publishedCount > 0 ? publishedCount : 4

  // Compatibility for rolling Hub deployments where pathway exposes the
  // published count but neither pathway nor course detail embeds lectures.
  // Access still comes from the server-owned course gate; these rows only map
  // the bundled, published AIKID curriculum to its lesson routes.
  return ISLAND_CURRICULUM_LESSONS
    .filter((lesson) => lesson.islandNumber === islandNumber)
    .sort((a, b) => a.lessonNumber.localeCompare(b.lessonNumber, 'vi'))
    .slice(0, effectiveCount)
    .map((lesson, index) => ({
      id: lesson.id,
      slug: lesson.slug,
      order: index + 1,
      title: lesson.title,
      skill: lesson.skillLearned,
      reward: '',
      duration: '',
      hook: lesson.objective,
      accent: 'mint',
      practiceKind: 'lesson',
      status: 'locked',
      phase: 'learn',
      stars: 0,
      xpEarned: 0,
    }))
}

export function selectCanonicalAikidCourses(courses: PathwayCourse[]): PathwayCourse[] {
  return AIKID_CANONICAL_SLUGS.flatMap((slug) => {
    const hints = AIKID_CANONICAL_TITLE_HINTS[slug]
    const exact = courses.find((course) => {
      const title = `${course.title} ${course.shortTitle}`.toLocaleLowerCase('vi')
      return hints.some((hint) => title.includes(hint))
    })
    if (exact) return [exact]
    const fallback = courses.find((course) => getCanonicalAikidCourseSlug(course) === slug)
    return fallback ? [fallback] : []
  })
}

export { getCourseStationCount }

export type NextLearningTarget = {
  course: PathwayCourse
  station?: QuestProgress
}

export function isCourseComplete(course: PathwayCourse): boolean {
  if (course.status === 'completed') return true
  const stationCount = getCourseStationCount(course)
  return stationCount > 0 && (course.completedCount ?? 0) >= stationCount
}

/**
 * Select the next server-authored learning target without falling back to an
 * already completed recommended module. Course order is the canonical island
 * sequence; an in-progress course wins, then a still-actionable recommendation,
 * then the first available/locked island.
 */
export function selectNextLearningTarget(
  courses: PathwayCourse[],
  recommendedCourseId?: string | null,
): NextLearningTarget | null {
  const unfinished = courses.filter((course) => !isCourseComplete(course))
  const recommended = unfinished.find((course) => course.id === recommendedCourseId)
  const course =
    unfinished.find((item) => item.status === 'active') ??
    recommended ??
    unfinished.find((item) => item.status === 'available') ??
    unfinished.find((item) => item.status === 'locked')

  if (!course) return null

  const station =
    course.stations?.find((item) => item.status === 'in_progress') ??
    course.stations?.find((item) => item.status === 'available')

  return { course, station }
}

export function findCourseByIdentifier(
  courses: PathwayCourse[],
  identifier?: string,
): PathwayCourse | undefined {
  if (!identifier) return undefined
  const idOrSlug = identifier.trim().toLowerCase()
  const canonicalSlug = ISLAND_ALIAS_MAP[idOrSlug] || idOrSlug

  // 1. Match exact id or slug
  let found = courses.find(
    (c) => c.id.toLowerCase() === idOrSlug || (c.slug && c.slug.toLowerCase() === idOrSlug),
  )
  if (found) return found

  // 2. Match canonical slug
  found = courses.find(
    (c) =>
      (c.slug && c.slug.toLowerCase() === canonicalSlug) ||
      c.id.toLowerCase() === canonicalSlug,
  )
  if (found) return found

  // 3. Match by Island number: dao-0 -> index 0, dao-1 -> index 1...
  const daoMatch = idOrSlug.match(/^dao-(\d+)$/)
  if (daoMatch) {
    const num = parseInt(daoMatch[1], 10)
    const sorted = sortAikiCourses(courses)
    if (num >= 0 && num < sorted.length) {
      return sorted[num]
    }
  }

  // 4. Fallback: match by title / sort order
  if (canonicalSlug === 'muoi-quy-tac-xuong-sang-tao') {
    return courses.find((c, i) => isAikiRuleCourse(c, i))
  }

  return undefined
}

export function clearWorldPageCache(): void {
  // Compatibility hook: World data is server-owned and is not retained in a
  // browser/module cache between route mounts.
}

export function mergeQuestsWithLocalProgress<
  T extends {
    id: string
    status: 'completed' | 'in_progress' | 'available' | 'locked' | string
    stars?: number
    order?: number
    slug?: string
    [key: string]: any
  },
>(
  quests: T[],
  isRuleCourse: boolean,
  localCompletedLessons?: Record<string, { stars?: number; xp?: number; completedAt?: string }>,
  localGoldenRules?: Record<number, { status?: string; starsEarned?: number }>,
  childId?: string | null,
): T[] {
  if (!Array.isArray(quests) || quests.length === 0) return []
  void localCompletedLessons
  void localGoldenRules

  let localProgress: ReturnType<typeof getLocalProgress> | null = null
  if (childId !== undefined && childId !== null && childId.trim().length > 0) {
    try {
      localProgress = getLocalProgress(childId)
    } catch {
      localProgress = null
    }
  }

  return quests.map((quest) => {
    let status = quest.status
    let stars = clampStationStars(quest.stars)

    if (localProgress) {
      const isCompleted =
        localProgress.completedLessonIds.has(quest.id) ||
        (Boolean(quest.slug) && localProgress.completedLessonIds.has(quest.slug!)) ||
        (isRuleCourse && typeof quest.order === 'number' && localProgress.completedLessonIds.has(`rule-${quest.order}`)) ||
        (isRuleCourse && typeof quest.order === 'number' && localProgress.completedLessonIds.has(`bai-0-${quest.order}`))

      if (isCompleted) {
        status = 'completed'
        const localStar =
          localProgress.lessonStars[quest.id] ||
          (quest.slug ? localProgress.lessonStars[quest.slug] : 0) ||
          (isRuleCourse && typeof quest.order === 'number' ? localProgress.lessonStars[`rule-${quest.order}`] : 0) ||
          3
        stars = Math.max(stars, clampStationStars(localStar))
      }
    }

    return {
      ...quest,
      status,
      stars,
    }
  })
}

export function enrichCoursesWithLocalProgress(
  courses: PathwayCourse[],
  localCompletedLessons?: Record<string, { stars?: number; xp?: number; completedAt?: string }>,
  localGoldenRules?: Record<number, { status?: string; starsEarned?: number }>,
  childId?: string | null,
): PathwayCourse[] {
  void localCompletedLessons
  void localGoldenRules
  if (!Array.isArray(courses) || courses.length === 0) return []
  if (!childId || !childId.trim()) return courses.map((course) => ({ ...course }))

  let localProgress: ReturnType<typeof getLocalProgress> | null = null
  try {
    localProgress = getLocalProgress(childId)
  } catch {
    localProgress = null
  }

  if (!localProgress) return courses.map((course) => ({ ...course }))

  return courses.map((course) => {
    const isRule = isAikiRuleCourse(course)
    if (isRule && localProgress) {
      // 10 Quy tắc vàng
      let ruleCompleted = 0
      let ruleStars = 0
      for (let r = 1; r <= 10; r++) {
        if (localProgress.completedLessonIds.has(`rule-${r}`) || localProgress.completedLessonIds.has(`bai-0-${r}`)) {
          ruleCompleted++
          ruleStars += Math.max(localProgress.lessonStars[`rule-${r}`] || 0, 3)
        }
      }
      const nextCompleted = Math.max(course.completedCount ?? 0, ruleCompleted)
      return {
        ...course,
        completedCount: nextCompleted,
        totalStars: Math.max(course.totalStars ?? 0, ruleStars),
        status: nextCompleted >= 10 ? 'completed' : course.status,
      }
    }

    if (!isRule && localProgress && course.stations?.length) {
      let islandCompleted = 0
      let islandStars = 0
      for (const st of course.stations) {
        if (
          localProgress.completedLessonIds.has(st.id) ||
          (st.slug && localProgress.completedLessonIds.has(st.slug))
        ) {
          islandCompleted++
          islandStars += Math.max(localProgress.lessonStars[st.id] || 0, 3)
        }
      }
      const nextCompleted = Math.max(course.completedCount ?? 0, islandCompleted)
      return {
        ...course,
        completedCount: nextCompleted,
        totalStars: Math.max(course.totalStars ?? 0, islandStars),
        status: nextCompleted >= course.stations.length ? 'completed' : course.status,
      }
    }

    return { ...course }
  })
}

export function formatCourseTitle(title?: string | null): string {
  if (!title) return ''
  return title
    .replace(/^module\s*\d+\s*[-—:]\s*/i, '')
    .replace(/^module\s*\d+\s*\.\s*/i, '')
    .replace(/^m\d+\s*[-—:]\s*/i, '')
    .replace(/^đảo\s*\d+\s*[-—:]\s*/i, '')
    .trim()
}
