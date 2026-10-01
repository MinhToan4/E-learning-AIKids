import { ISLAND_CURRICULUM_LESSONS } from '@/features/lesson/data/island-curriculum-registry'
import type { CourseSummary } from '@/shared/lib/api'

export interface HomeActiveStation {
  stationLabel: string // 'Bài 1.2'
  stationTitle: string // 'Bốn chiếc chìa khóa vàng'
  stationDesc: string // 'Cùng Mèo Mee học cách dùng bốn chìa khóa để tạo bức tranh đúng ý.'
  islandTitle: string // 'Đảo 1: Khám Phá'
  islandNumber: number // 1
  islandSlug: string // 'dao-1'
  lessonSlug: string // 'bai-1-2-bon-chiec-chia-khoa'
  route: string // '/world/dao-1/lesson/bai-1-2-bon-chiec-chia-khoa'
  catDialogue: string // '“Bo ơi! Bốn chiếc chìa khóa vàng đã sẵn sàng, vào săn cùng tớ nhé!”'
  progressPct: number
  isAllCompleted: boolean
}

export function resolveNextActiveStation(courses: CourseSummary[] = [], userName: string = 'Bé'): HomeActiveStation {
  // Quét qua danh sách 22 bài học của các đảo theo thứ tự
  for (const lesson of ISLAND_CURRICULUM_LESSONS) {
    const localCompleted =
      typeof window !== 'undefined' &&
      typeof localStorage !== 'undefined' &&
      (localStorage.getItem(`aikids_lesson_completed_${lesson.id}`) === 'true' ||
        localStorage.getItem(`aikids_lesson_completed_${lesson.slug}`) === 'true' ||
        Number(localStorage.getItem(`aikids_lesson_stars_${lesson.id}`) || 0) >= 3 ||
        Number(localStorage.getItem(`aikids_lesson_stars_${lesson.slug}`) || 0) >= 3)

    let serverCompleted = false
    if (courses && courses.length > 0) {
      const identifiers = [lesson.id, lesson.slug]
      const matches = (val?: string) => Boolean(val && identifiers.includes(val))

      for (const c of courses) {
        const quests = (c as any).quests || (c as any).stations || []
        if (Array.isArray(quests)) {
          const q = quests.find(
            (item: any) =>
              matches(item?.id) ||
              matches(item?.slug) ||
              matches(item?.questId) ||
              matches(item?.lessonId) ||
              matches(item?.stationId),
          )
          if (q && (q.status === 'completed' || Number(q.stars || 0) >= 3)) {
            serverCompleted = true
            break
          }
        }
      }
    }

    const isCompleted = Boolean(localCompleted || serverCompleted)

    if (!isCompleted) {
      // Tìm thấy bài học đầu tiên chưa hoàn thành!
      const islandNumber = lesson.islandNumber || 1
      const islandSlug = `dao-${islandNumber}`
      const stationLabel = `Bài ${lesson.lessonNumber}`
      const rawTitle = lesson.title || 'Bài học sáng tạo'
      const stationTitle = rawTitle.replace(/^Bài\s+[\d.]+\s*[—–-]\s*/i, '').trim() || rawTitle
      const stationDesc =
        lesson.journey?.stage1_goal?.goalText ||
        lesson.subtitle ||
        'Cùng Mèo Aiki khám phá xưởng sáng tạo AI thông minh.'

      // Lời thoại động của Mèo Aiki
      let dialogue = 'Cùng tớ khám phá những điều kỳ diệu hôm nay nhé!'
      if (lesson.lessonNumber === '1.1') {
        dialogue = 'Một từ hay năm từ? Cùng tớ khám phá bí mật câu lệnh ma thuật nhé!'
      } else if (lesson.lessonNumber === '1.2') {
        dialogue = 'Bốn chiếc chìa khóa vàng đã sẵn sàng, vào săn cùng tớ nhé!'
      } else if (lesson.lessonNumber === '1.3') {
        dialogue = 'Úm ba la biến hình, sẵn sàng hóa thân cùng tớ chưa nào!'
      } else if (lesson.lessonNumber === '1.4') {
        dialogue = 'Trạm cuối Đảo 1 rồi, cùng chinh phục cúp vàng thám hiểm nhé!'
      } else if (islandNumber === 2) {
        dialogue = 'Đảo Họa Sĩ đang chờ đôi bàn tay ma thuật của cậu đó!'
      } else if (islandNumber === 3) {
        dialogue = 'Biệt đội nhân vật AI siêu ngầu sắp xuất hiện rồi!'
      } else if (islandNumber === 4) {
        dialogue = 'Vương quốc truyện tranh đang mở cửa chào đón tác giả nhí!'
      } else if (islandNumber >= 5) {
        dialogue = 'Đấu trường trò chơi AI đỉnh cao đang vẫy gọi!'
      }

      // Tính % tiến độ của đảo hiện tại
      const courseMatch = courses.find(
        (c) =>
          c.id === islandSlug ||
          (c as any).slug === islandSlug ||
          (c.shortTitle && c.shortTitle.includes(`Đảo ${islandNumber}`)) ||
          (c.title && c.title.includes(`Đảo ${islandNumber}`)),
      )
      const progressPct = courseMatch?.progressPct ?? 0

      return {
        stationLabel,
        stationTitle,
        stationDesc,
        islandTitle: courseMatch?.shortTitle || courseMatch?.title || `Đảo ${islandNumber}: Khám Phá`,
        islandNumber,
        islandSlug,
        lessonSlug: lesson.slug,
        route: `/world/${islandSlug}/lesson/${lesson.slug}`,
        catDialogue: `“${userName} ơi! ${dialogue}”`,
        progressPct,
        isAllCompleted: false,
      }
    }
  }

  // Trường hợp hiếm hoi đã hoàn thành tất cả các bài
  return {
    stationLabel: 'Xuất sắc',
    stationTitle: 'Con đã hoàn thành tất cả hải trình!',
    stationDesc: 'Tuyệt vời lắm! Con có thể tự do sáng tạo tại Xưởng Vẽ AI bất cứ lúc nào.',
    islandTitle: 'Đại Bản Doanh AI',
    islandNumber: 1,
    islandSlug: 'dao-1',
    lessonSlug: 'bai-1-1-mot-tu-hay-nam-tu',
    route: '/world/program/aikid_official',
    catDialogue: `“${userName} ơi! Con là một Nhà Thám Hiểm AI kiệt xuất!”`,
    progressPct: 100,
    isAllCompleted: true,
  }
}
