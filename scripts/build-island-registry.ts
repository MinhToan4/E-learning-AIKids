import fs from 'fs'
import path from 'path'
import {
  AIKI_ISLANDS_LESSONS,
  createSixStageJourney,
} from '../../../2-MCP-Core/core-lms-api/src/curricula/aiki-islands-curriculum'

const lessonsData = AIKI_ISLANDS_LESSONS.map((lesson, index) => {
  const globalIndex = AIKI_ISLANDS_LESSONS.findIndex((l) => l.slug === lesson.slug)
  const nextSlug =
    globalIndex >= 0 && globalIndex < AIKI_ISLANDS_LESSONS.length - 1
      ? AIKI_ISLANDS_LESSONS[globalIndex + 1].slug
      : undefined

  const journey = createSixStageJourney(lesson, nextSlug)
  const lessonSub = lesson.lessonNumber.split('.')[1] || '1'
  const resolvedCover =
    lesson.imageUrl ||
    `/assets/aiki-islands/island${lesson.islandNumber}_lesson${lessonSub}_cat.jpg`

  return {
    id: `bai-${lesson.islandNumber}-${lessonSub}`,
    slug: lesson.slug,
    islandNumber: lesson.islandNumber,
    lessonNumber: lesson.lessonNumber,
    title: lesson.title,
    subtitle: lesson.subtitle,
    imageUrl: resolvedCover,
    objective: lesson.objective,
    skillLearned: lesson.skillLearned,
    nextLessonSlug: nextSlug,
    journey,
  }
})

const fileContent = `// SSOT Thư viện Giáo trình 6 Chặng cho toàn bộ 22 bài học Aiki Islands (Module 1 - Module 5)
// Tự động đồng bộ và chuẩn hóa từ aiki-islands-curriculum.ts
import type { QuestDetail, LessonSixStageJourney } from '@/shared/lib/api'

export interface IslandCurriculumLesson {
  id: string
  slug: string
  islandNumber: number
  lessonNumber: string
  title: string
  subtitle: string
  imageUrl: string
  objective: string
  skillLearned: string
  nextLessonSlug?: string
  journey: LessonSixStageJourney
}

export const ISLAND_CURRICULUM_LESSONS: IslandCurriculumLesson[] = ${JSON.stringify(
  lessonsData,
  null,
  2
)}

export const ISLAND_CURRICULUM_MAP: Record<string, IslandCurriculumLesson> = {}
for (const item of ISLAND_CURRICULUM_LESSONS) {
  ISLAND_CURRICULUM_MAP[item.id] = item
  ISLAND_CURRICULUM_MAP[item.slug] = item
  ISLAND_CURRICULUM_MAP[item.lessonNumber] = item
}

// Bảng từ khóa nhận diện bài học kể cả khi quest.id là database UUID
const LESSON_KEYWORD_PATTERNS: Array<{ key: string; keywords: string[] }> = [
  { key: '1.1', keywords: ['một từ hay năm từ', 'mot tu hay nam tu', '1 từ hay 5 từ', 'mèo mướp', 'chú mèo', '1.1'] },
  { key: '1.2', keywords: ['bốn chiếc chìa khoá', 'bốn chiếc chìa khóa', 'bon chiec chia khoa', '4 chìa', 'cốc sứ', '1.2'] },
  { key: '1.3', keywords: ['úm ba la', 'um ba la', 'biến hình', 'phong cách nghệ thuật', 'bảng 4 phong cách', '1.3'] },
  { key: '1.4', keywords: ['kỹ sư', 'bác sĩ sửa tranh', 'sửa tay hiệp sĩ', 'ky su tai ba', 'kỹ sư tài ba', '1.4'] },
  { key: '2.1', keywords: ['bức tranh biết nói', 'buc tranh biet noi', 'chú cáo lông đỏ', 'cáo lông đỏ', '2.1'] },
  { key: '2.2', keywords: ['ngôi sao và 3 lớp', 'ai là ngôi sao', 'thuyền buồm', '3 lớp', 'ngôi sao', '2.2'] },
  { key: '2.3', keywords: ['cảm xúc và ánh sáng', 'cảm xúc của sắc màu', 'ngọn hải đăng', 'sắc màu', 'ánh sáng', '2.3'] },
  { key: '2.4', keywords: ['khung tranh a3', 'mảnh ghép hoàn hảo', 'khung tranh', 'gia đình thú', '2.4'] },
  { key: '3.1', keywords: ['hồ sơ adn', 'hồ sơ biệt đội', 'hiệp sĩ cáo lửa', 'adn', '3.1'] },
  { key: '3.2', keywords: ['khóa 3 điểm', 'mật mã nhận diện', 'sóc bông', 'khoa 3 diem', 'mật mã', '3.2'] },
  { key: '3.3', keywords: ['lưới 6 biểu cảm', 'biến hoá biểu cảm', 'đổi mặt', 'biểu cảm', '3.3'] },
  { key: '3.4', keywords: ['căn cứ hốc cây', 'căn cứ bí mật', 'hốc cây', 'căn cứ', '3.4'] },
  { key: '4.1', keywords: ['mở lối 3 cổng', '3 cổng của vương quốc', '3 cổng', 'khởi đầu', 'thắt nút', '4.1'] },
  { key: '4.2', keywords: ['vượt 4 ải', '04 chặng thử thách', '4 chặng', 'muốn - cản', '4.2'] },
  { key: '4.3', keywords: ['storyboard 8 ô', 'bản đồ 8 ô - p1', 'bản đồ 8 ô - phần 1', 'hình que', '4.3'] },
  { key: '4.4', keywords: ['vương miện bìa truyện', 'bản đồ 8 ô - p2', 'bản đồ 8 ô - phần 2', 'khoá', '4.4'] },
  { key: '4.5', keywords: ['khai mạc hội chợ', 'vương miện hoàn hảo', 'comic book', 'hội chợ truyện tranh', '4.5'] },
  { key: '5.1', keywords: ['lá bài đầu tiên', 'săn lùng bộ sưu tập', 'rồng băng', 'thú cưng nguyên tố', '5.1'] },
  { key: '5.2', keywords: ['ngân sách 20 điểm', 'phù phép mặt thẻ', 'ngân sách 20', '5.2'] },
  { key: '5.3', keywords: ['lưng thẻ ma thuật', 'bánh răng ma thuật', 'khoá thẻ', 'khoa the', '5.3'] },
  { key: '5.4', keywords: ['tương khắc ngũ hành', 'luật 5 câu', 'luật chơi', 'luat choi', '5.4'] },
  { key: '5.5', keywords: ['đấu trường & giải đấu', 'đấu trường khai mở', 'giải đấu gia đình', 'bàn cờ', '5.5'] },
]

/**
 * Tìm bài học chuẩn trong thư viện SSOT 22 bài học Aiki Islands
 * Hỗ trợ nhận diện linh hoạt theo id, slug, số hiệu X.Y, hoặc từ khóa tiêu đề (ngay cả khi quest.id là database UUID)
 */
export function findIslandCurriculum(
  quest?: Partial<QuestDetail> | { id?: string; slug?: string; title?: string } | null
): IslandCurriculumLesson | undefined {
  if (!quest) return undefined

  const q = quest as Record<string, any>
  const id = (q.id || '').toLowerCase().trim()
  const slug = (q.slug || '').toLowerCase().trim()
  const title = (q.title || '').toLowerCase().trim()

  // 1. Khớp chính xác ID hoặc Slug
  if (ISLAND_CURRICULUM_MAP[id]) return ISLAND_CURRICULUM_MAP[id]
  if (ISLAND_CURRICULUM_MAP[slug]) return ISLAND_CURRICULUM_MAP[slug]

  // 2. Nhận diện qua mẫu regex bai-X-Y hoặc bai_X_Y
  const idOrSlug = \`\${id} \${slug}\`
  const islandLessonMatch = idOrSlug.match(/bai[-_](\\d+)[-_](\\d+)/i)
  if (islandLessonMatch) {
    const key = \`\${islandLessonMatch[1]}.\${islandLessonMatch[2]}\`
    if (ISLAND_CURRICULUM_MAP[key]) return ISLAND_CURRICULUM_MAP[key]
    const idKey = \`bai-\${islandLessonMatch[1]}-\${islandLessonMatch[2]}\`
    if (ISLAND_CURRICULUM_MAP[idKey]) return ISLAND_CURRICULUM_MAP[idKey]
  }

  // 3. Nhận diện qua số bài X.Y trong tiêu đề hoặc slug
  const titleAndSlug = \`\${title} \${slug} \${id}\`
  const dotMatch = titleAndSlug.match(/(\\d+)\\.(\\d+)/)
  if (dotMatch) {
    const dotKey = \`\${dotMatch[1]}.\${dotMatch[2]}\`
    if (ISLAND_CURRICULUM_MAP[dotKey]) return ISLAND_CURRICULUM_MAP[dotKey]
  }

  // 4. Nhận diện bằng từ khóa tiêu đề (hữu hiệu khi quest.id là UUID của DB)
  for (const item of LESSON_KEYWORD_PATTERNS) {
    for (const kw of item.keywords) {
      if (title.includes(kw) || slug.includes(kw)) {
        return ISLAND_CURRICULUM_MAP[item.key]
      }
    }
  }

  return undefined
}
`

const targetPath = path.resolve(
  __dirname,
  '../apps/web/src/features/lesson/data/island-curriculum-registry.ts'
)
fs.writeFileSync(targetPath, fileContent, 'utf8')
console.log('Successfully written island-curriculum-registry.ts, size:', fs.statSync(targetPath).size)
