export type CourseStationSummary = {
  id?: string
  slug?: string
  courseKey?: string
  title?: string
  shortTitle?: string
  questCount?: number
  stations?: unknown[]
}

const PUBLISHED_AIKID_COURSES = [
  { slug: 'muoi-quy-tac-xuong-sang-tao', count: 10, hints: ['quy tắc', 'quy tac'] },
  { slug: 'dao-1-nha-tham-hiem-ai', count: 4, hints: ['nhà thám hiểm', 'nha tham hiem'] },
  { slug: 'dao-2-hoa-si-ai', count: 4, hints: ['hoạ sĩ', 'họa sĩ', 'hoa si'] },
  { slug: 'dao-3-biet-doi-nhan-vat-ai', count: 4, hints: ['biệt đội nhân vật', 'biet doi nhan vat'] },
  { slug: 'dao-4-vuong-quoc-truyen-tranh-ai', count: 5, hints: ['vương quốc truyện tranh', 'vuong quoc truyen tranh'] },
  { slug: 'dao-5-nha-phat-minh-tro-choi-ai', count: 5, hints: ['nhà phát minh trò chơi', 'nha phat minh tro choi'] },
] as const

export function getCanonicalAikidCourseSlug(course: CourseStationSummary): string | null {
  const title = `${course.title ?? ''} ${course.shortTitle ?? ''}`.toLocaleLowerCase('vi')
  const titleMatch = PUBLISHED_AIKID_COURSES.find((entry) =>
    entry.hints.some((hint) => title.includes(hint)),
  )
  if (titleMatch) return titleMatch.slug

  const candidate = course.slug || course.courseKey || course.id || ''
  const normalized = candidate === 'aiki-rules' || candidate === 'muoi-quy-tac'
    ? 'muoi-quy-tac-xuong-sang-tao'
    : candidate
  return PUBLISHED_AIKID_COURSES.some((entry) => entry.slug === normalized)
    ? normalized
    : null
}

export function getCourseStationCount(course: CourseStationSummary): number {
  const embeddedCount = course.stations?.length ?? 0
  const measuredCount = embeddedCount > 0
    ? embeddedCount
    : Math.max(0, Math.round(course.questCount ?? 0))
  const canonicalSlug = getCanonicalAikidCourseSlug(course)
  const published = PUBLISHED_AIKID_COURSES.find((entry) => entry.slug === canonicalSlug)

  // Compatibility for the deployed projection that counts learn/practice/check
  // rows as stations. Genuine count changes pass through untouched.
  if (
    published &&
    (measuredCount === published.count ||
      measuredCount === published.count * 2 ||
      measuredCount === published.count * 3)
  ) return published.count

  return measuredCount
}
