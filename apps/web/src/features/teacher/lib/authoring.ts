export type AuthoringStepId = 'basics' | 'outcomes' | 'recognition' | 'learn' | 'game' | 'practice' | 'check'

export type AuthoringStep = {
  id: AuthoringStepId
  label: string
  complete: boolean
  missing: string[]
}

export type AuthoringReadiness = {
  complete: boolean
  completed: number
  total: number
  steps: AuthoringStep[]
}

export type CourseDraft = {
  id: string
  title: string
  shortTitle: string
  tagline: string
  description: string
  productLabel: string
  ageTrack: string
  courseKey: string
  durationLabel: string
  skillsText: string
  outcomesText: string
  credential: string
  finalAssessment: string
}

export type LectureDraft = {
  id: string
  title: string
  skill: string
  hook: string
  practiceKind: string
  videoUrl: string
  concept: string
  example: string
  reward: string
  duration: string
  goalsText: string
  gameType: string
  gameInstruction: string
  gameOutcome: string
  gameCardsText: string
  practiceInstruction: string
  product: string
  checkQuestion: string
  checkOption1: string
  checkOption2: string
  checkOption3: string
  correctIndex: string
  checkExplain: string
}

export const PRACTICE_OPTIONS = [
  { id: 'intro', label: 'Làm quen', description: 'Khởi động nhẹ với một nhiệm vụ ngắn.' },
  { id: 'journal', label: 'Nhật ký sáng tạo', description: 'Viết và suy ngẫm theo từng bước.' },
  { id: 'sketch', label: 'Phác thảo', description: 'Vẽ nhanh ý tưởng trước khi hoàn thiện.' },
  { id: 'character', label: 'Tạo nhân vật', description: 'Xây dựng ngoại hình và tính cách nhân vật.' },
  { id: 'style', label: 'Thử phong cách', description: 'So sánh và chọn phong cách thể hiện.' },
  { id: 'chips', label: 'Ghép thành phần', description: 'Kết hợp các mảnh thông tin thành sản phẩm.' },
  { id: 'ai_pick', label: 'Chọn với AI', description: 'Đánh giá nhiều kết quả và giải thích lựa chọn.' },
  { id: 'story', label: 'Kể chuyện', description: 'Tạo câu chuyện có mở đầu, diễn biến và kết thúc.' },
  { id: 'comic', label: 'Truyện tranh', description: 'Sắp xếp nội dung thành các khung truyện.' },
  { id: 'video', label: 'Video', description: 'Lập kế hoạch hoặc tạo một video ngắn.' },
  { id: 'detective', label: 'Thám tử AI', description: 'Quan sát dấu hiệu và kiểm chứng thông tin.' },
  { id: 'palette', label: 'Bảng màu', description: 'Chọn màu phù hợp với thông điệp.' },
  { id: 'reflect', label: 'Tự đánh giá', description: 'Nhìn lại quá trình và nêu điều sẽ cải thiện.' },
  { id: 'match', label: 'Ghép cặp', description: 'Ghép khái niệm với ví dụ phù hợp.' },
  { id: 'drag', label: 'Sắp xếp', description: 'Kéo thả các bước theo đúng trình tự.' },
  { id: 'spin', label: 'Vòng quay ý tưởng', description: 'Nhận một gợi ý ngẫu nhiên để bắt đầu.' },
] as const

export const GAME_OPTIONS = [
  { id: 'pick', label: 'Chọn đáp án', description: 'So sánh các thẻ và chọn phương án tốt nhất.' },
  { id: 'detective', label: 'Thám tử', description: 'Tìm manh mối để kiểm chứng một kết quả.' },
  { id: 'match', label: 'Ghép cặp', description: 'Nối hai thẻ có mối liên hệ đúng.' },
  { id: 'sort', label: 'Phân loại', description: 'Đưa thẻ vào đúng nhóm.' },
  { id: 'order', label: 'Xếp thứ tự', description: 'Sắp xếp các bước theo trình tự hợp lý.' },
  { id: 'drag', label: 'Kéo thả', description: 'Đưa từng thẻ vào đúng vị trí.' },
  { id: 'spin', label: 'Vòng quay', description: 'Nhận thử thách ngẫu nhiên để bắt đầu.' },
] as const

function lines(value: string): string[] {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
}

function hasLength(value: string, minimum: number): boolean {
  return value.trim().length >= minimum
}

function step(id: AuthoringStepId, label: string, checks: Array<[boolean, string]>): AuthoringStep {
  const missing = checks.filter(([valid]) => !valid).map(([, message]) => message)
  return { id, label, complete: missing.length === 0, missing }
}

function readiness(steps: AuthoringStep[]): AuthoringReadiness {
  const completed = steps.filter((item) => item.complete).length
  return { complete: completed === steps.length, completed, total: steps.length, steps }
}

export function slugifyAuthoringId(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('vi-VN')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '')
}

export function courseDraftReadiness(draft: CourseDraft): AuthoringReadiness {
  return readiness([
    step('basics', 'Thông tin khóa học', [
      [/^[a-z0-9-]{3,40}$/.test(draft.id), 'Đường dẫn khóa học'],
      [hasLength(draft.title, 3), 'Tên khóa học'],
      [hasLength(draft.shortTitle, 2), 'Tên ngắn'],
      [hasLength(draft.tagline, 5), 'Câu giới thiệu'],
      [hasLength(draft.description, 10), 'Mô tả khóa học'],
      [hasLength(draft.durationLabel, 2), 'Thời lượng'],
      [hasLength(draft.ageTrack, 2), 'Nhóm tuổi'],
      [hasLength(draft.courseKey, 2), 'Mã lộ trình'],
    ]),
    step('outcomes', 'Kết quả học tập', [
      [hasLength(draft.productLabel, 3), 'Sản phẩm cuối khóa'],
      [lines(draft.skillsText).some((item) => hasLength(item, 2)), 'Kỹ năng đạt được'],
      [lines(draft.outcomesText).some((item) => hasLength(item, 2)), 'Kết quả đầu ra'],
    ]),
    step('recognition', 'Công nhận hoàn thành', [
      [hasLength(draft.credential, 3), 'Tên chứng nhận hoặc huy hiệu'],
      [hasLength(draft.finalAssessment, 10), 'Yêu cầu hoàn thành cuối khóa'],
    ]),
  ])
}

export function lectureDraftReadiness(draft: LectureDraft): AuthoringReadiness {
  const videoIsValid = !draft.videoUrl.trim() || /^https:\/\//i.test(draft.videoUrl.trim())
  const options = [draft.checkOption1, draft.checkOption2, draft.checkOption3]

  return readiness([
    step('learn', 'Khám phá', [
      [/^[a-z0-9-]{3,64}$/.test(draft.id), 'Đường dẫn bài học'],
      [hasLength(draft.title, 3), 'Tên bài học'],
      [hasLength(draft.skill, 3), 'Kỹ năng trọng tâm'],
      [hasLength(draft.hook, 5), 'Câu hỏi khởi động'],
      [lines(draft.goalsText).length > 0 && lines(draft.goalsText).every((item) => hasLength(item, 2)), 'Mục tiêu bài học'],
      [hasLength(draft.concept, 10), 'Kiến thức cốt lõi'],
      [hasLength(draft.example, 5), 'Ví dụ minh họa'],
      [videoIsValid, 'Liên kết video HTTPS'],
    ]),
    step('game', 'Trò chơi', [
      [hasLength(draft.gameType, 2), 'Kiểu trò chơi'],
      [hasLength(draft.gameInstruction, 10), 'Hướng dẫn trò chơi'],
      [hasLength(draft.gameOutcome, 5), 'Mục tiêu trò chơi'],
      [lines(draft.gameCardsText).length >= 2 && lines(draft.gameCardsText).every((item) => hasLength(item, 2)), 'Ít nhất 2 thẻ trò chơi'],
    ]),
    step('practice', 'Sáng tạo', [
      [hasLength(draft.practiceKind, 2), 'Kiểu thực hành'],
      [hasLength(draft.practiceInstruction, 10), 'Hướng dẫn thực hành'],
      [hasLength(draft.product, 3), 'Sản phẩm học sinh cần tạo'],
    ]),
    step('check', 'Thử tài', [
      [hasLength(draft.checkQuestion, 5), 'Câu hỏi kiểm tra'],
      [options.every((item) => hasLength(item, 1)), '3 lựa chọn trả lời'],
      [/^[0-2]$/.test(draft.correctIndex), 'Đáp án đúng'],
      [hasLength(draft.checkExplain, 5), 'Giải thích đáp án'],
    ]),
  ])
}
