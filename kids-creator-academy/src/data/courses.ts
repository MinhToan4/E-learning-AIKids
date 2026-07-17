import type { Quest } from '@/types'
import { QUESTS } from '@/data/mock'

export type CourseStatus = 'open' | 'soon' | 'new'

export type Course = {
  id: string
  title: string
  shortTitle: string
  tagline: string
  description: string
  emoji: string
  /** Tailwind-ish gradient stops as CSS */
  coverFrom: string
  coverTo: string
  accent: string
  /** Optional generated cover image under /assets */
  coverImage?: string
  ageLabel: string
  durationLabel: string
  productLabel: string
  status: CourseStatus
  skills: string[]
  quests: Quest[]
}

const mini = (
  id: string,
  order: number,
  title: string,
  skill: string,
  reward: string,
  hook: string,
  accent: string,
  status: Quest['status'] = 'locked',
): Quest => ({
  id,
  order,
  title,
  skill,
  reward,
  duration: '6–10 phút',
  hook,
  goals: ['Hiểu ý chính', 'Làm thử một việc', 'Nhận phần thưởng'],
  learnCards: [
    {
      id: `${id}-1`,
      title: 'Ý chính',
      body: skill,
      tip: 'Làm chậm, không sao nếu thử lại.',
      kind: 'concept',
    },
    {
      id: `${id}-2`,
      title: 'Ví dụ',
      body: hook,
      tip: 'Chọn đáp án vui và an toàn.',
      kind: 'example',
    },
    {
      id: `${id}-3`,
      title: 'An toàn',
      body: 'Không dùng tên thật hay thông tin cá nhân.',
      tip: 'Biệt danh là đủ!',
      kind: 'safety',
    },
  ],
  status,
  accent,
  icon: 'star',
})

/** Kid-friendly labels for quest cards on the map */
export const QUEST_KID: Record<string, { make: string; why: string; emoji: string }> = {
  'meet-mascot': { make: 'Làm quen AI', why: 'Biết AI là công cụ giúp con', emoji: '👋' },
  character: { make: 'Tạo nhân vật', why: 'Có “bạn” để kể chuyện', emoji: '🐱' },
  'world-build': { make: 'Chọn nơi chơi', why: 'Biết câu chuyện xảy ra ở đâu', emoji: '🪐' },
  plot: { make: 'Chọn sự cố vui', why: 'Truyện có mở đầu và kết', emoji: '⚡' },
  'prompt-lab': { make: 'Ghép thẻ → AI vẽ ảnh', why: 'Có hình để ghép truyện', emoji: '🎨' },
  detective: { make: 'Chọn ảnh đúng ý', why: 'AI có thể sai — con kiểm tra', emoji: '🔎' },
  comic: { make: 'Làm truyện 4 khung', why: 'Ghép ảnh + lời thoại', emoji: '📖' },
  cinema: { make: 'Làm video kể chuyện', why: 'Khoe cho gia đình xem', emoji: '🎬' },
  // Safety course
  'safe-hello': { make: 'AI và bí mật', why: 'Biết giữ thông tin cá nhân', emoji: '🛡️' },
  'safe-spot': { make: 'Tìm chi tiết lạ', why: 'Luyện mắt thám tử AI', emoji: '👀' },
  'safe-choice': { make: 'Chọn cách an toàn', why: 'Biết nên làm gì khi nghi ngờ', emoji: '✅' },
  'safe-badge': { make: 'Nhận huy hiệu bảo vệ', why: 'Khóa học an toàn hoàn thành', emoji: '🏅' },
  // Voice course
  'voice-idea': { make: 'Ý tưởng lời kể', why: 'Viết 3 câu chuyện ngắn', emoji: '💭' },
  'voice-pick': { make: 'Chọn giọng kể', why: 'Nghe thử giọng giả lập', emoji: '🎙️' },
  'voice-scene': { make: 'Ghép cảnh + lời', why: 'Mỗi cảnh một câu kể', emoji: '🖼️' },
  'voice-show': { make: 'Trình diễn mini', why: 'Xem trước video kể chuyện', emoji: '🎭' },
  // Robot course (preview)
  'bot-parts': { make: 'Chọn bộ phận robot', why: 'Tạo robot tưởng tượng', emoji: '🤖' },
  'bot-job': { make: 'Robot làm việc gì?', why: 'Gắn nhiệm vụ vui', emoji: '🧰' },
  'bot-draw': { make: 'AI vẽ robot', why: 'Ghép thẻ tạo ảnh robot', emoji: '✨' },
  'bot-card': { make: 'Thẻ robot của con', why: 'Lưu vào ba lô', emoji: '💳' },
}

export const COURSES: Course[] = [
  {
    id: 'course-comic',
    title: 'Hành trình Mèo Sao',
    shortTitle: 'Truyện tranh AI',
    tagline: 'Tạo truyện 4 khung + video kể chuyện',
    description:
      '8 nhiệm vụ: làm quen AI, tạo nhân vật, ghép thẻ vẽ ảnh, kiểm tra AI, làm truyện và video.',
    emoji: '🐱',
    coverFrom: '#7C6CF0',
    coverTo: '#5ED0FF',
    accent: '#7C6CF0',
    coverImage: '/assets/course-comic.jpg',
    ageLabel: '8–11 tuổi',
    durationLabel: '60–90 phút',
    productLabel: 'Truyện + video',
    status: 'open',
    skills: ['Prompt', 'Kể chuyện', 'Kiểm tra AI', 'An toàn'],
    quests: QUESTS,
  },
  {
    id: 'course-safety',
    title: 'Thám tử An toàn AI',
    shortTitle: 'An toàn số',
    tagline: 'Học giữ bí mật & phát hiện AI sai',
    description:
      '4 nhiệm vụ ngắn: bí mật cá nhân, chi tiết lạ, lựa chọn an toàn, nhận huy hiệu bảo vệ.',
    emoji: '🛡️',
    coverFrom: '#5EE4B0',
    coverTo: '#5ED0FF',
    accent: '#1F9D6A',
    coverImage: '/assets/course-safety.jpg',
    ageLabel: '8–11 tuổi',
    durationLabel: '25–35 phút',
    productLabel: 'Huy hiệu an toàn',
    status: 'open',
    skills: ['An toàn', 'Tư duy phản biện'],
    quests: [
      mini('safe-hello', 1, 'AI và bí mật', 'Không chia sẻ thông tin thật', 'Huy hiệu bí mật', 'Robot Mực Màu hỏi: con giữ bí mật thế nào?', '#5EE4B0', 'available'),
      mini('safe-spot', 2, 'Tìm chi tiết lạ', 'AI có thể vẽ sai', 'Kính thám tử', 'Tìm điểm kỳ lạ trong ảnh AI!', '#5ED0FF'),
      mini('safe-choice', 3, 'Chọn cách an toàn', 'Biết cách phản ứng đúng', 'Thẻ lựa chọn', 'Tình huống vui: con sẽ chọn gì?', '#FFD56A'),
      mini('safe-badge', 4, 'Nhận huy hiệu bảo vệ', 'Ôn lại 3 quy tắc vàng', 'Huy hiệu Bảo vệ', 'Con đã sẵn sàng trở thành người bảo vệ dữ liệu!', '#7C6CF0'),
    ],
  },
  {
    id: 'course-voice',
    title: 'Rạp kể chuyện',
    shortTitle: 'Lời kể & giọng',
    tagline: 'Viết lời kể + chọn giọng + xem trước',
    description:
      '4 nhiệm vụ: ý tưởng lời kể, chọn giọng giả lập, ghép cảnh, trình diễn mini.',
    emoji: '🎙️',
    coverFrom: '#FF8FA3',
    coverTo: '#FFD56A',
    accent: '#E85D75',
    coverImage: '/assets/course-voice.jpg',
    ageLabel: '8–11 tuổi',
    durationLabel: '30–40 phút',
    productLabel: 'Video kể chuyện',
    status: 'new',
    skills: ['Kể chuyện', 'Giọng kể', 'Phụ đề'],
    quests: [
      mini('voice-idea', 1, 'Ý tưởng lời kể', '3 câu mở đầu – giữa – kết', 'Mảnh kịch bản', 'Kể về một bạn robot đi lạc trong thư viện mây.', '#FF8FA3', 'available'),
      mini('voice-pick', 2, 'Chọn giọng kể', 'Giọng ấm / tươi / kể chuyện', 'Thẻ giọng', 'Nghe thử và chọn giọng con thích.', '#FFD56A'),
      mini('voice-scene', 3, 'Ghép cảnh + lời', 'Mỗi cảnh một câu', 'Bảng cảnh', 'Gắn lời kể vào từng khung hình.', '#5ED0FF'),
      mini('voice-show', 4, 'Trình diễn mini', 'Xem trước có phụ đề', 'Vé rạp phim', 'Xem lại câu chuyện của con!', '#7C6CF0'),
    ],
  },
  {
    id: 'course-robot',
    title: 'Xưởng Robot Tí Hon',
    shortTitle: 'Thiết kế robot',
    tagline: 'Sắp ra mắt — tạo robot bằng thẻ AI',
    description:
      'Sắp mở: chọn bộ phận, việc robot làm, AI vẽ robot, lưu thẻ vào ba lô.',
    emoji: '🤖',
    coverFrom: '#94A3B8',
    coverTo: '#CBD5E1',
    accent: '#64748B',
    coverImage: '/assets/course-robot.jpg',
    ageLabel: '8–11 tuổi',
    durationLabel: 'Sắp có',
    productLabel: 'Thẻ robot',
    status: 'soon',
    skills: ['Sáng tạo', 'Prompt'],
    quests: [
      mini('bot-parts', 1, 'Chọn bộ phận robot', 'Đầu – thân – bánh xe', 'Mảnh robot', 'Lắp robot tưởng tượng của con.', '#94A3B8'),
      mini('bot-job', 2, 'Robot làm việc gì?', 'Tưới cây / kể chuyện / dọn nhà', 'Thẻ nhiệm vụ', 'Gắn một việc vui cho robot.', '#64748B'),
      mini('bot-draw', 3, 'AI vẽ robot', 'Ghép thẻ tạo ảnh', 'Ảnh robot', 'Xem AI vẽ robot theo thẻ của con.', '#7C6CF0'),
      mini('bot-card', 4, 'Thẻ robot của con', 'Lưu ba lô', 'Character Card', 'Robot vào ba lô sáng tạo!', '#5EE4B0'),
    ],
  },
]

export const DEFAULT_COURSE_ID = 'course-comic'

export function getCourse(courseId: string | null | undefined): Course {
  return COURSES.find((c) => c.id === courseId) ?? COURSES[0]
}

export function getQuestInCourse(courseId: string, questId: string): Quest | undefined {
  return getCourse(courseId).quests.find((q) => q.id === questId)
}

export function findQuestAnywhere(questId: string): { course: Course; quest: Quest } | undefined {
  for (const c of COURSES) {
    const q = c.quests.find((x) => x.id === questId)
    if (q) return { course: c, quest: q }
  }
  return undefined
}

export function courseProgress(
  course: Course,
  completedQuestIds: string[],
): { done: number; total: number; percent: number } {
  const ids = new Set(completedQuestIds)
  const done = course.quests.filter((q) => ids.has(q.id)).length
  const total = course.quests.length || 1
  return { done, total, percent: Math.round((done / total) * 100) }
}
