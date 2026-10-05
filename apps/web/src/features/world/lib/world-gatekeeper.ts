import { getAikiCourseSortOrder } from '@/shared/lib/course-sort-order'
export { getAikiCourseSortOrder } from '@/shared/lib/course-sort-order'
import { designerAssets } from '@/shared/config/assets'
import { getCourseStationCount } from '@/shared/lib/course-station-count'
import {
  type PathwayCourse,
  isUserTestingUnlocked,
  FORCE_UNLOCK_ALL_ISLANDS,
  AIKID_CANONICAL_SLUGS,
  formatCourseTitle,
} from './world-pathway-mapper'

export function isAikiRuleCourse(course: { id: string; title: string }, _index?: number): boolean {
  if (course.id === 'aiki-rules' || course.id.startsWith('rule-')) return true
  const lowerTitle = (course.title || '').toLowerCase()
  if (
    lowerTitle.includes('mười quy tắc') ||
    lowerTitle.includes('muoi quy tac') ||
    lowerTitle.includes('module 0')
  ) {
    return true
  }
  return false
}

export function isCourseRuleCompleted(course: PathwayCourse): boolean {
  if (course.reasonCode === 'manual_override') return true
  if (course.status === 'completed') return true
  const stationCount = getCourseStationCount(course)
  if (stationCount > 0 && typeof course.completedCount === 'number') {
    return course.completedCount >= stationCount
  }
  return false
}

export function applySequentialQuestRules<
  T extends {
    status: 'completed' | 'in_progress' | 'available' | 'locked' | string
    [key: string]: any
  },
>(
  quests: T[],
  forceUnlockOverride?: boolean,
): T[] {
  if (!Array.isArray(quests) || quests.length === 0) return []

  const isDevUnlock = isUserTestingUnlocked()
  const forceUnlock = forceUnlockOverride ?? (FORCE_UNLOCK_ALL_ISLANDS || isDevUnlock)

  if (forceUnlock) {
    return quests.map((q) => ({
      ...q,
      status: (q.status === 'locked' ? 'available' : q.status) as T['status'],
    }))
  }

  let firstUncompletedFound = false
  const result: T[] = []
  for (let idx = 0; idx < quests.length; idx++) {
    const quest = quests[idx]
    const isSelfCompleted = quest.status === 'completed' || (quest.stars ?? 0) >= 3

    if (isSelfCompleted) {
      // Đã hoàn thành: bảo lưu trạng thái completed
      result.push({
        ...quest,
        status: 'completed' as T['status'],
      })
    } else if (!firstUncompletedFound) {
      // Trạm chưa hoàn thành ĐẦU TIÊN: được mở để học (available hoặc in_progress)
      firstUncompletedFound = true
      const status = (quest.status === 'locked' ? 'available' : quest.status) as T['status']
      result.push({
        ...quest,
        status,
      })
    } else {
      // Đã có trạm chưa hoàn thành phía trước -> BẮT BUỘC KHÓA toàn bộ các trạm chưa hoàn thành sau đó!
      result.push({
        ...quest,
        status: 'locked' as T['status'],
      })
    }
  }

  return result
}

export function applyGatekeeperRules(
  courses: PathwayCourse[],
  forceUnlockOverride?: boolean,
): PathwayCourse[] {
  if (courses.length === 0) return []

  const sortedCourses = sortAikiCourses(courses)
  const isDevUnlock = isUserTestingUnlocked()
  const forceUnlock = forceUnlockOverride ?? (FORCE_UNLOCK_ALL_ISLANDS || isDevUnlock)

  const result: PathwayCourse[] = []
  for (let idx = 0; idx < sortedCourses.length; idx++) {
    const course = sortedCourses[idx]
    const defaultSlug = idx < AIKID_CANONICAL_SLUGS.length ? AIKID_CANONICAL_SLUGS[idx] : undefined
    const slug = course.slug || defaultSlug
    // Preserve server-authored learner/course overrides. Previously the
    // frontend reapplied sequential locking even when the LMS returned a
    // parallel/manual override (for example Bo's test profile).
    const courseForceUnlock =
      forceUnlock ||
      course.programUnlockMode === 'parallel' ||
      course.reasonCode === 'manual_override'
    const stations = course.stations
      ? applySequentialQuestRules(course.stations, courseForceUnlock)
      : undefined

    if (idx === 0) {
      // Đảo 1 (dao-1): Luôn mở (available / in_progress / active / completed)
      const status = course.status === 'locked' ? 'available' : course.status
      result.push({
        ...course,
        slug,
        status,
        stations,
        isGatekeeper: true,
      })
      continue
    }

    if (courseForceUnlock) {
      const status = course.status === 'locked' ? 'available' : course.status
      result.push({
        ...course,
        slug,
        status,
        stations,
        reasonCode: 'requirements_met',
        lockMessage: undefined,
      })
      continue
    }

    // Đảo N (N > 1): Chỉ mở khi Đảo N-1 có trạng thái completed
    const prevCourse = result[idx - 1]
    const isPrevDone = isCourseRuleCompleted(prevCourse)

    if (isPrevDone) {
      const status = course.status === 'locked' ? 'available' : course.status
      result.push({
        ...course,
        slug,
        status,
        stations,
        reasonCode: 'requirements_met',
        lockMessage: undefined,
      })
    } else {
      const prevTitle = formatCourseTitle(prevCourse.title) || 'đảo trước'
      result.push({
        ...course,
        slug,
        status: 'locked' as const,
        stations,
        reasonCode: 'previous_island_incomplete',
        lockMessage: `Bé hãy hoàn thành ${prevTitle} trước để mở khóa hòn đảo tiếp theo nhé!`,
      })
    }
  }

  return result
}

export function isPathwayCourseVisible(course: PathwayCourse): boolean {
  // A locked region is part of the learner's pathway: hiding it removes the
  // goal and the server-authored condition needed to unlock it.
  return ['completed', 'active', 'available', 'locked'].includes(course.status)
}

export const AIKI_ISLAND_BADGES = [
  'ĐẢO TIÊN QUYẾT',
  'ĐẢO KHÁM PHÁ',
  'ĐẢO HOẠ SĨ',
  'ĐẢO NHÂN VẬT',
  'ĐẢO TRUYỆN TRANH',
  'ĐẢO TRÒ CHƠI',
] as const

export const WORLD_REGIONS = [
  {
    name: 'Đảo Tiên Quyết',
    badge: 'ĐẢO TIÊN QUYẾT',
    description: 'Đảo Tiên Quyết — Nắm vững 10 nguyên tắc an toàn, đạo đức và làm chủ AI của Xưởng sáng tạo.',
    background: designerAssets.lobby.bgHome,
    scene: designerAssets.worldScenes.aiValley,
    ribbon: '#7c3aed',
    trailLabel: 'Đường mòn 10 Quy Tắc Vàng',
    pose: 'guide' as const,
    sceneLabel: 'AIKI đang hướng dẫn 10 quy tắc an toàn sáng tạo AI',
  },
  {
    name: 'Đảo Khám Phá',
    badge: 'ĐẢO KHÁM PHÁ',
    description: '4 Chìa Khóa Lệnh — Tạo hình ảnh đơn lẻ đúng ý mình và sửa câu lệnh như một kỹ sư AI thực thụ.',
    background: designerAssets.lobby.bgArt,
    scene: designerAssets.worldScenes.promptKeys,
    ribbon: '#10b981',
    trailLabel: 'Đường thám hiểm 4 chìa khoá lệnh',
    pose: 'thinking' as const,
    sceneLabel: 'AIKI đang cùng con mở 4 chiếc chìa khoá lệnh',
  },
  {
    name: 'Đảo Hoạ Sĩ',
    badge: 'ĐẢO HOẠ SĨ',
    description: 'Sắc Màu & Kể Chuyện — Bố cục ngôi sao 3 lớp, ánh sáng cảm xúc và tạo ra bức tranh biết nói.',
    background: designerAssets.lobby.bgCharacter,
    scene: designerAssets.worldScenes.creativeMountain,
    ribbon: '#f59e0b',
    trailLabel: 'Đường mòn sắc màu hoạ sĩ',
    pose: 'celebrate' as const,
    sceneLabel: 'AIKI đang cầm cọ vẽ kiệt tác nghệ thuật',
  },
  {
    name: 'Đảo Nhân Vật',
    badge: 'ĐẢO NHÂN VẬT',
    description: 'Hồ Sơ & 6 Biểu Cảm — Khoá mật mã nhận diện 3 điểm, biến hoá 6 biểu cảm và căn cứ bí mật.',
    background: designerAssets.lobby.bgCharacter,
    scene: designerAssets.worldScenes.characterLab,
    ribbon: '#0284c7',
    trailLabel: 'Đường mật mã nhân vật',
    pose: 'support' as const,
    sceneLabel: 'AIKI đang cùng con thiết kế hồ sơ nhân vật độc quyền',
  },
  {
    name: 'Đảo Truyện Tranh',
    badge: 'ĐẢO TRUYỆN TRANH',
    description: 'Storyboard 8 Ô & Comic — Kịch bản 3 cổng, khung xương 4 nhịp và xuất bản cuốn truyện tranh 8 trang.',
    background: designerAssets.lobby.bgArt,
    scene: designerAssets.worldScenes.storyIsland,
    ribbon: '#ec4899',
    trailLabel: 'Đường vương quốc truyện tranh 8 ô',
    pose: 'thinking' as const,
    sceneLabel: 'AIKI đang xem bản thảo truyện tranh 8 ô',
  },
  {
    name: 'Đảo Trò Chơi',
    badge: 'ĐẢO TRÒ CHƠI',
    description: 'Đấu Trường Thẻ Bài — Bộ 12 thẻ bài cân bằng chỉ số Sức-Nhanh-Khéo, bàn cờ A3 và luật chơi công bằng.',
    background: designerAssets.lobby.bgHome,
    scene: designerAssets.worldScenes.gameArena,
    ribbon: '#8b5cf6',
    trailLabel: 'Đấu trường thẻ bài đỉnh cao',
    pose: 'celebrate' as const,
    sceneLabel: 'AIKI đang thi đấu trận chung kết thẻ bài',
  },
] as const

export function sortAikiCourses<
  T extends {
    id?: string
    slug?: string
    title?: string
    shortTitle?: string
    courseKey?: string
    metadata?: any
  },
>(courses: T[]): T[] {
  return [...courses].sort((a, b) => getAikiCourseSortOrder(a) - getAikiCourseSortOrder(b))
}

export function getRegionForCourse(
  course: { id?: string; title?: string; shortTitle?: string; courseKey?: string; metadata?: any },
  index: number,
) {
  const order = getAikiCourseSortOrder(course)
  if (order < WORLD_REGIONS.length) {
    return WORLD_REGIONS[order]
  }
  return WORLD_REGIONS[index % WORLD_REGIONS.length]
}

export function getIslandBadge(
  course: { id?: string; title?: string; shortTitle?: string; courseKey?: string; metadata?: any },
  index: number,
): string {
  const order = getAikiCourseSortOrder(course)
  if (order >= 0 && order < AIKI_ISLAND_BADGES.length) {
    return AIKI_ISLAND_BADGES[order]
  }
  if (index >= 0 && index < AIKI_ISLAND_BADGES.length) {
    return AIKI_ISLAND_BADGES[index]
  }
  return `ĐẢO ${index + 1}`
}
