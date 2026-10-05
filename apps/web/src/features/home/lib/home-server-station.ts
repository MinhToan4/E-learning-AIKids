import type { CourseSummary } from '@/shared/lib/api'
import type { HomeActiveStation } from './home-active-station'
import { getAikiCourseSortOrder } from '@/shared/lib/course-sort-order'

/** Home needs a server checkpoint, not the entire lesson curriculum bundle. */
export function resolveNextActiveStation(courses: CourseSummary[], userName = 'Bé', _ownerId?: string): HomeActiveStation {
  const course = [...courses].sort((a, b) => getAikiCourseSortOrder(a) - getAikiCourseSortOrder(b))
    .find((item) => item.enrolled && item.status !== 'locked' && item.status !== 'completed')
  const stations = course?.quests as Array<CourseSummary['quests'][number] & { status?: string; hook?: string; slug?: string }> | undefined
  const station = stations?.find((item) => item.status !== 'completed' && item.status !== 'locked')
  const slug = course?.courseKey || course?.id || ''
  return {
    stationLabel: station ? `Trạm ${station.order}` : 'Hành trình',
    stationTitle: station?.title || course?.shortTitle || 'Khám phá hành trình học',
    stationDesc: station?.hook || course?.description || 'Chọn hành trình để xem các trạm học của con.',
    islandTitle: course?.shortTitle || course?.title || 'Hành trình AIKid',
    islandNumber: course ? getAikiCourseSortOrder(course) : 0,
    islandSlug: slug,
    lessonSlug: station?.slug || station?.id || '',
    route: slug ? `/world/program/aikid_official?island=${encodeURIComponent(slug)}` : '/world/program/aikid_official',
    catDialogue: `${userName} ơi! Cùng khám phá trạm học tiếp theo nhé!`,
    progressPct: course?.progressPct ?? 0,
    isAllCompleted: courses.length > 0 && courses.every((item) => item.status === 'completed'),
  }
}
