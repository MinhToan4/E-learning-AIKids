export function getAikiCourseSortOrder(course: {
  id?: string
  slug?: string
  title?: string
  shortTitle?: string
  courseKey?: string
  metadata?: any
}): number {
  if (course.metadata?.sortOrder !== undefined && typeof course.metadata.sortOrder === 'number') {
    return Number(course.metadata.sortOrder)
  }
  if (course.metadata?.regionOrder !== undefined && typeof course.metadata.regionOrder === 'number') {
    return Number(course.metadata.regionOrder)
  }

  const key = `${course.courseKey ?? ''} ${course.id ?? ''} ${course.slug ?? ''}`.toLowerCase()
  const title = `${course.title ?? ''} ${course.shortTitle ?? ''}`.toLowerCase()
  const combined = `${key} ${title}`

  if (
    combined.includes('muoi-quy-tac') ||
    combined.includes('quy tắc') ||
    combined.includes('quy tac') ||
    combined.includes('module 0') ||
    combined.includes('aiki-rules') ||
    combined.includes('rule') ||
    combined.includes('tiên quyết') ||
    combined.includes('tien quyet')
  ) {
    return 0
  }
  if (
    combined.includes('dao-1') ||
    combined.includes('module 1') ||
    combined.includes('nha-tham-hiem') ||
    combined.includes('nhà thám hiểm') ||
    combined.includes('khám phá') ||
    combined.includes('kham pha') ||
    combined.includes('chìa khoá')
  ) {
    return 1
  }
  if (
    combined.includes('dao-2') ||
    combined.includes('module 2') ||
    combined.includes('hoa-si') ||
    combined.includes('hoạ sĩ')
  ) {
    return 2
  }
  if (
    combined.includes('dao-3') ||
    combined.includes('module 3') ||
    combined.includes('nhan-vat') ||
    combined.includes('nhân vật')
  ) {
    return 3
  }
  if (
    combined.includes('dao-4') ||
    combined.includes('module 4') ||
    combined.includes('truyen-tranh') ||
    combined.includes('truyện tranh')
  ) {
    return 4
  }
  if (
    combined.includes('dao-5') ||
    combined.includes('module 5') ||
    combined.includes('tro-choi') ||
    combined.includes('trò chơi')
  ) {
    return 5
  }
  return 99
}

