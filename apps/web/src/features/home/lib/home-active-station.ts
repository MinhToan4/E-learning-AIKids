import { ISLAND_CURRICULUM_LESSONS } from '@/features/lesson/data/island-curriculum-registry'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'
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

function serverLessonCompleted(
  courses: CourseSummary[],
  identifiers: Array<string | undefined>,
): boolean {
  const expected = identifiers.filter(Boolean).map((value) => String(value).toLowerCase())
  return courses.some((course) => {
    const stations = ((course as any).quests || (course as any).stations || []) as any[]
    return stations.some((station) => {
      const values = [
        station?.id,
        station?.slug,
        station?.questId,
        station?.lessonId,
        station?.stationId,
      ].filter(Boolean).map((value) => String(value).toLowerCase())
      const title = String(station?.title ?? '').toLowerCase()
      const matches = expected.some((identifier) =>
        values.includes(identifier) ||
        (identifier.match(/^\d+\.\d+$/) && title.includes(identifier)) ||
        (identifier.match(/^(?:rule-|bai-0-)(\d+)$/) &&
          new RegExp(`(?:qt|quy tắc)\\s*${identifier.match(/\d+/)?.[0]}(?:\\D|$)`, 'i').test(title)),
      )
      return matches && (station?.status === 'completed' || Number(station?.stars || 0) >= 3)
    })
  })
}

export function resolveNextActiveStation(
  courses: CourseSummary[] = [],
  userName: string = 'Bé',
  _childId?: string | null,
): HomeActiveStation {
  // Phân định quyền truy cập theo Gói Đăng Ký (Subscription Gate):
  // Kiểm tra xem 5 đảo sáng tạo có đang bị khóa không:
  const island1 = courses.find(
    (c) =>
      c.id === 'dao-1' ||
      (c as any).slug === 'dao-1-nha-tham-hiem-ai' ||
      c.courseKey?.includes('dao-1-nha-tham-hiem-ai') ||
      c.shortTitle?.toLowerCase().includes('nhà thám hiểm') ||
      c.title?.toLowerCase().includes('nhà thám hiểm') ||
      c.shortTitle?.includes('Đảo 1') ||
      c.title?.includes('Đảo 1'),
  )
  const isIsland1Locked = !island1 || island1.status === 'locked' || island1.enrolled === false

  if (isIsland1Locked) {
    // Quét 10 Quy Tắc Vàng (Đảo Tiên Quyết - hoàn toàn miễn phí):
    // Tìm quy tắc đầu tiên từ 1 đến 10 chưa hoàn thành:
    for (let r = 1; r <= 10; r++) {
      const isDone = serverLessonCompleted(courses, [`rule-${r}`, `bai-0-${r}`])
      if (!isDone) {
        // Tìm thấy quy tắc vàng tiếp theo cần học!
        const ruleData = AIKI_RULES_DATA.find((rule) => rule.id === r) || AIKI_RULES_DATA[0]
        return {
          stationLabel: `Quy tắc ${r}`,
          stationTitle: ruleData.shortTitle || ruleData.title || `Quy tắc ${r}`,
          stationDesc: ruleData.title || 'Cùng Mèo Aiki khám phá 10 Quy tắc vàng an toàn và làm chủ AI.',
          islandTitle: 'Đảo Tiên Quyết',
          islandNumber: 0,
          islandSlug: 'muoi-quy-tac-xuong-sang-tao',
          lessonSlug: `rule-${r}`,
          route: `/world/program/aikid_official?island=muoi-quy-tac-xuong-sang-tao`,
          catDialogue: `“${userName} ơi! Cùng tớ khám phá Quy tắc ${r} để nhận Huy hiệu Hiệp Sĩ AIKI nhé!”`,
          progressPct: Math.round(((r - 1) / 10) * 100),
          isAllCompleted: false,
        }
      }
    }

    // Nếu đã học xong cả 10 Quy Tắc Vàng nhưng chưa mở khóa 5 đảo sáng tạo:
    return {
      stationLabel: 'Mở khóa',
      stationTitle: 'Mở khóa 5 Khóa Học Sáng Tạo',
      stationDesc: 'Bé đã xuất sắc hoàn thành 10 Quy Tắc Vàng! Hãy nhờ Ba / Mẹ mở khóa hành trình tiếp theo nhé.',
      islandTitle: 'Đảo Khám Phá',
      islandNumber: 1,
      islandSlug: 'dao-1',
      lessonSlug: 'bai-1-1-mot-tu-hay-nam-tu',
      route: '/parent/plan',
      catDialogue: `“${userName} ơi! Con đã là Hiệp Sĩ AIKI xuất sắc! Nhờ Ba / Mẹ mở khóa để tiếp tục thám hiểm nhé!”`,
      progressPct: 100,
      isAllCompleted: false,
    }
  }

  // Nếu Đảo 1 đã được mở khóa: Quét qua danh sách 22 bài học của các đảo theo thứ tự
  for (const lesson of ISLAND_CURRICULUM_LESSONS) {
    const isCompleted = serverLessonCompleted(
      courses,
      [lesson.id, lesson.slug, lesson.lessonNumber],
    )

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
      const lessonIslandTitle = (lesson as any).islandTitle
      const courseMatch = courses.find(
        (c) =>
          c.id === islandSlug ||
          (c as any).slug === islandSlug ||
          c.id?.startsWith(`dao-${islandNumber}`) ||
          (c as any).slug?.startsWith(`dao-${islandNumber}`) ||
          c.courseKey?.startsWith(`dao-${islandNumber}`) ||
          (Boolean(c.shortTitle) && (c.shortTitle!.includes(`Đảo ${islandNumber}`) || Boolean(lessonIslandTitle && c.shortTitle!.includes(lessonIslandTitle)))) ||
          (Boolean(c.title) && (c.title.includes(`Đảo ${islandNumber}`) || Boolean(lessonIslandTitle && c.title.includes(lessonIslandTitle)))),
      )

      const islandLessons = ISLAND_CURRICULUM_LESSONS.filter((l) => (l.islandNumber || 1) === islandNumber)
      const islandTotal = islandLessons.length || 4
      let islandDone = 0
      for (const il of islandLessons) {
        const done = serverLessonCompleted(courses, [il.id, il.slug, il.lessonNumber])
        if (done) islandDone++
      }
      const calculatedPct = islandTotal > 0 ? Math.round((islandDone / islandTotal) * 100) : 0
      const progressPct = Math.max(calculatedPct, courseMatch?.progressPct ?? 0)

      const defaultIslandTitle =
        islandNumber === 1
          ? 'Đảo 1: Khám Phá'
          : islandNumber === 2
            ? 'Đảo 2: Họa Sĩ'
            : islandNumber === 3
              ? 'Đảo 3: Nhân Vật'
              : islandNumber === 4
                ? 'Đảo 4: Truyện Tranh'
                : 'Đảo 5: Trò Chơi'

      return {
        stationLabel,
        stationTitle,
        stationDesc,
        islandTitle: courseMatch?.shortTitle || courseMatch?.title || lessonIslandTitle || defaultIslandTitle,
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
