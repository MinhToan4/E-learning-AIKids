/** Mini quizzes / puzzles between quests — Kahoot-like short rounds, kid-safe copy */

export type ChallengeQuestion = {
  id: string
  prompt: string
  options: { id: string; label: string; correct: boolean }[]
  explain: string
}

export type Challenge = {
  id: string
  afterQuestId: string
  title: string
  intro: string
  starsReward: number
  questions: ChallengeQuestion[]
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'ch-after-character',
    afterQuestId: 'character',
    title: 'Câu đố: Nhân vật',
    intro: 'Trả lời đúng để mở khóa bước “Chọn nơi chơi”!',
    starsReward: 15,
    questions: [
      {
        id: 'q1',
        prompt: 'AI vẽ theo điều gì?',
        options: [
          { id: 'a', label: 'Theo mô tả / thẻ của con', correct: true },
          { id: 'b', label: 'Theo suy nghĩ trong đầu con (không nói ra)', correct: false },
          { id: 'c', label: 'Theo bạn bè tự chọn', correct: false },
        ],
        explain: 'Đúng! Con phải nói rõ (ghép thẻ) thì AI mới hiểu.',
      },
      {
        id: 'q2',
        prompt: 'Nên dùng nhân vật nào?',
        options: [
          { id: 'a', label: 'Người nổi tiếng ngoài đời', correct: false },
          { id: 'b', label: 'Nhân vật tưởng tượng vui', correct: true },
          { id: 'c', label: 'Ảnh mặt thật của con', correct: false },
        ],
        explain: 'An toàn: chỉ nhân vật tưởng tượng.',
      },
    ],
  },
  {
    id: 'ch-after-prompt',
    afterQuestId: 'prompt-lab',
    title: 'Câu đố: Nói cho AI',
    intro: 'Kiểm tra nhanh trước khi làm Thám tử AI!',
    starsReward: 20,
    questions: [
      {
        id: 'q1',
        prompt: 'Prompt tốt cần có gì?',
        options: [
          { id: 'a', label: 'Ai + làm gì + ở đâu (+ cảm xúc, kiểu vẽ)', correct: true },
          { id: 'b', label: 'Chỉ một từ “đẹp”', correct: false },
          { id: 'c', label: 'Số điện thoại của con', correct: false },
        ],
        explain: 'Càng rõ “ai / làm gì / ở đâu”, ảnh càng đúng.',
      },
      {
        id: 'q2',
        prompt: 'AI vẽ sai thì con làm gì?',
        options: [
          { id: 'a', label: 'Buộc phải giữ ảnh sai', correct: false },
          { id: 'b', label: 'Chọn ảnh khác hoặc sửa thẻ', correct: true },
          { id: 'c', label: 'Tắt máy và bỏ cuộc', correct: false },
        ],
        explain: 'Con là chỉ huy — được chọn và sửa!',
      },
    ],
  },
  {
    id: 'ch-after-detective',
    afterQuestId: 'detective',
    title: 'Câu đố: Thám tử AI',
    intro: 'AI có thể sai — con đã nhớ chưa?',
    starsReward: 20,
    questions: [
      {
        id: 'q1',
        prompt: 'AI có luôn đúng không?',
        options: [
          { id: 'a', label: 'Luôn đúng 100%', correct: false },
          { id: 'b', label: 'Có thể sai — cần kiểm tra', correct: true },
          { id: 'c', label: 'Chỉ sai khi mất mạng', correct: false },
        ],
        explain: 'Giỏi! AI có thể vẽ chi tiết lạ — con kiểm tra.',
      },
    ],
  },
]

export function challengeAfter(questId: string): Challenge | undefined {
  return CHALLENGES.find((c) => c.afterQuestId === questId)
}

/** Short “video guide” beats — mock player with text + timing, no external API */
export const VIDEO_GUIDES: Record<
  string,
  { title: string; beats: { t: number; text: string }[] }
> = {
  prompt: {
    title: 'Hướng dẫn: Ghép thẻ tạo ảnh',
    beats: [
      { t: 0, text: 'Kéo thẻ từ khay sang 5 ô bên trái.' },
      { t: 6, text: 'Hoặc bấm Chọn trên thẻ, rồi bấm Thả thẻ vào đây.' },
      { t: 12, text: 'Đủ 5 ô → đọc câu mô tả phía dưới.' },
      { t: 18, text: 'Bấm Tạo 3 ảnh để AI vẽ.' },
      { t: 24, text: 'Sang màn sau: chọn ảnh ưng nhất.' },
    ],
  },
  comic: {
    title: 'Video: Làm truyện 4 khung',
    beats: [
      { t: 0, text: 'Chọn nhân vật trong khay.' },
      { t: 8, text: 'Đặt vào khung 1 → 2 → 3 → 4.' },
      { t: 16, text: 'Thêm bong bóng thoại ngắn.' },
      { t: 24, text: 'Xem trước rồi lưu để làm video.' },
    ],
  },
}
