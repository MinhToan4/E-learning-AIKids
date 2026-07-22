/**
 * Production curriculum adapter for the 12 source-of-truth course documents.
 * Lesson copy is generated from the 12 Markdown course documents; this file
 * only maps that reviewed content to database seeds.
 */
import type { CourseSeed, PracticeKindSeed, QuestSeed } from '../types.js'
import { curriculumContent } from '../generated/curriculum-content.js'

const ACCENTS = {
  L1: ['#6d5efc', '#3dbfff', '#3ed9a0', '#ff7b93', '#ffc94a', '#a78bfa'],
  L2: ['#5646e8', '#0ea5e9', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'],
} as const

const COVERS = {
  K1: '/assets/designer/hub/art-image.jpeg',
  K2: '/assets/designer/hub/home-character.jpeg',
  K3: '/assets/story-workshop.jpg',
  K4: '/assets/designer/hub/art-comic.jpeg',
  K5: '/assets/adventure-map.jpg',
  K6: '/assets/course-voice.jpg',
} as const

const SLUG = {
  K1: 'the-gioi',
  K2: 'nhan-vat',
  K3: 'ke-chuyen',
  K4: 'truyen-tranh',
  K5: 'chuyen-dong',
  K6: 'phim-ngan',
} as const

const SHORT_TITLE = {
  K1: 'Thế giới',
  K2: 'Nhân vật',
  K3: 'Câu chuyện',
  K4: 'Truyện tranh',
  K5: 'Chuyển động',
  K6: 'Phim ngắn',
} as const

const SKILLS = {
  K1: ['Xây dựng thế giới', 'Màu sắc & cảm xúc', 'Mô tả ý tưởng rõ ràng', 'Kiểm tra kết quả AI'],
  K2: ['Thiết kế nhân vật', 'Tính cách qua hành động', 'Giữ hình ảnh nhất quán', 'Thuyết trình sáng tạo'],
  K3: ['Cấu trúc câu chuyện', 'Xung đột & bước ngoặt', 'Lời thoại & cảm xúc', 'Biên tập có chủ đích'],
  K4: ['Góc máy & phân khung', 'Nhịp đọc thị giác', 'Thoại & hiệu ứng chữ', 'Hoàn thiện truyện tranh'],
  K5: ['Ý đồ chuyển động', 'Tốc độ & nhịp điệu', 'Movement prompt', 'Chọn lọc và ghép cảnh'],
  K6: ['Kịch bản phân cảnh', 'Storyboard', 'Hình ảnh, chuyển động & âm thanh', 'Dựng và giới thiệu phim'],
} as const

type ContentCourse = (typeof curriculumContent)[number]
type ContentLesson = ContentCourse['lessons'][number]

function questFor(
  course: ContentCourse,
  lesson: ContentLesson,
  order: number,
): QuestSeed {
  const track = course.track.toLowerCase()
  const key = course.courseKey.toLowerCase()
  const id = `${track}-${key}-q${order}`
  const duration = course.track === 'L1' ? '18 phút' : '20 phút'
  const check =
    order === course.lessons.length
      ? course.rubric.map((criterion, criterionIndex) => ({
          id: `${id}-rubric-${criterionIndex + 1}`,
          question: `Con kiểm tra sản phẩm cuối khóa: ${criterion}`,
          options: ['Đã có trong sản phẩm của con', 'Con cần hoàn thiện thêm'],
          correctIndex: 0,
          explain: `Tiêu chí ${criterionIndex + 1}: ${criterion}`,
        }))
      : [
          {
            id: `${id}-check`,
            question: 'Ở bước kiểm tra nhanh, con cần làm gì?',
            options: [
              lesson.check.content,
              'Bỏ qua và sang bài tiếp theo',
              'Nhập thông tin cá nhân để được chấm',
            ],
            correctIndex: 0,
            explain: lesson.check.objective,
          },
        ]
  return {
    id,
    order,
    title: lesson.title,
    skill: lesson.objective,
    reward: `Sản phẩm · ${lesson.product}`,
    duration,
    hook:
      lesson.stage === 'ideate'
        ? 'Con tự nghĩ và quyết định trước; AI chưa tham gia ở giai đoạn này.'
        : 'Con dùng đúng ý tưởng đã chốt, rồi kiểm tra kỹ phần AI hỗ trợ.',
    accent: ACCENTS[course.track][(order - 1) % 6],
    practiceKind: lesson.practiceKind as PracticeKindSeed,
    stage: lesson.stage,
    // No placeholder video: a missing lecture asset must remain visible and honest.
    videoUrl: null,
    goals: [lesson.objective, `Hoàn thành: ${lesson.product}`, 'Tự kiểm tra và lưu riêng tư trong Vũ trụ của em'],
    concept: `${lesson.video.content} Mục tiêu: ${lesson.video.objective}`,
    example: `Game ghi nhớ: ${lesson.game.content}`,
    check,
    stations: {
      stage: lesson.stage,
      stations: [
        {
          id: `${id}-video`,
          kind: 'video',
          durationMin: Number.parseInt(lesson.video.duration, 10),
          title: 'Bài giảng ngắn',
          content: lesson.video.content,
          outcome: lesson.video.objective,
          videoUrl: null,
        },
        {
          id: `${id}-game`,
          kind: 'game',
          durationMin: Number.parseInt(lesson.game.duration, 10),
          title: 'Game ghi nhớ',
          instruction: lesson.game.content,
          outcome: lesson.game.objective,
          gameType: lesson.game.gameType,
          gameConfig: lesson.game.gameConfig,
        },
        {
          id: `${id}-practice`,
          kind: 'practice',
          durationMin: Number.parseInt(lesson.practice.duration, 10),
          title: 'Xưởng thực hành',
          instruction: lesson.practice.content,
          outcome: lesson.practice.objective,
          product: lesson.product,
          practiceKind: lesson.practiceKind,
        },
        {
          id: `${id}-check`,
          kind: 'check',
          durationMin: Number.parseInt(lesson.check.duration, 10),
          title: 'Kiểm tra nhanh',
          instruction: lesson.check.content,
          outcome: lesson.check.objective,
        },
      ],
    },
  }
}

function buildCourse(course: ContentCourse, index: number): CourseSeed {
  const lessonCount = course.lessons.length
  const liveSessions = course.track === 'L1' ? (course.courseKey === 'K6' ? 5 : 4) : 8
  const ageLabel = course.track === 'L1' ? '6–8 tuổi' : '9–11 tuổi'
  return {
    id: `${course.track.toLowerCase()}-${course.courseKey.toLowerCase()}-${SLUG[course.courseKey]}`,
    title: `${course.track} · ${course.title}`,
    shortTitle: SHORT_TITLE[course.courseKey],
    tagline:
      course.track === 'L1'
        ? 'Con tự nghĩ trước, vui học từng bước và hoàn thiện sản phẩm cùng AI.'
        : 'Từ ý tưởng có chủ đích đến sản phẩm sáng tạo hoàn chỉnh cùng AI.',
    description: `${lessonCount} bài tự học theo nhịp Bài giảng → Game → Thực hành → Kiểm tra. Giai đoạn đầu nuôi ý tưởng độc lập; giai đoạn sau dùng AI như một công cụ và luôn để con giữ quyền quyết định.`,
    coverFrom: ACCENTS[course.track][0],
    coverTo: ACCENTS[course.track][1],
    accent: ACCENTS[course.track][index % 6],
    coverImage: COVERS[course.courseKey],
    ageLabel,
    ageTrack: course.track,
    courseKey: course.courseKey,
    durationLabel: `${liveSessions} buổi · ${lessonCount} bài`,
    productLabel: course.product,
    status: 'open',
    recommended: course.courseKey === 'K1' || course.courseKey === 'K4',
    skills: [...SKILLS[course.courseKey]],
    outcomes: [
      course.product,
      `Hoàn thành bài đánh giá: ${course.finalTest}`,
      'Biết tự lên ý tưởng, chọn lọc và giải thích quyết định sáng tạo',
      'Sản phẩm được lưu riêng tư trong Vũ trụ của em',
    ],
    recognition: {
      issuer: 'AI Kids Creator Academy',
      credential: `Huy hiệu số: ${course.badge}`,
      finalAssessment: course.finalTest,
      frameworks: [
        {
          code: 'Thông tư 02/2025/TT-BGDĐT',
          title: 'Khung năng lực số cho người học',
        },
        {
          code: 'Quyết định 3439/QĐ-BGDĐT',
          title: 'Khung nội dung thí điểm giáo dục trí tuệ nhân tạo cho học sinh phổ thông',
        },
      ],
      disclaimer:
        'Khóa học được thiết kế có tham chiếu các khung nội dung trên; đây không phải chứng nhận hay phê duyệt khóa học của Bộ Giáo dục và Đào tạo.',
    },
    sortOrder: (course.track === 'L1' ? 0 : 100) + index,
    quests: course.lessons.map((lesson, lessonIndex) =>
      questFor(course, lesson, lessonIndex + 1),
    ),
  }
}

export const curriculumCourses: CourseSeed[] = curriculumContent.map((course, index) =>
  buildCourse(course, (index % 6) + 1),
)

export const LEGACY_COURSE_IDS = [
  'course-comic',
  'course-robot',
  'course-safety',
  'course-voice',
] as const
