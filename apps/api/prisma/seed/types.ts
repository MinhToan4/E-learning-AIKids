export type LearnCard = {
  id: string
  title: string
  body: string
  tip: string
  kind: 'concept' | 'example' | 'safety'
}

export type CheckQuestion = {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explain: string
}

export type PromptChip = {
  id: string
  slot: string
  label: string
  emoji: string
  description?: string
}

export type PracticeKindSeed =
  | 'intro'
  | 'character'
  | 'style'
  | 'chips'
  | 'story'
  | 'detective'
  | 'comic'
  | 'video'
  | 'journal'
  | 'palette'
  | 'match'
  | 'drag'
  | 'spin'
  | 'sketch'
  | 'ai_pick'
  | 'reflect'

export type QuestSeed = {
  id: string
  order: number
  title: string
  skill: string
  reward: string
  duration: string
  hook: string
  accent: string
  practiceKind: PracticeKindSeed
  stage?: 'ideate' | 'produce'
  /** Lecture video URL stored in SQL (CDN / object storage). */
  videoUrl?: string | null
  goals: string[]
  concept: string
  example: string
  check?: CheckQuestion[]
  /** Curriculum stations JSON object */
  stations?: {
    stage: 'ideate' | 'produce'
    stations: Array<Record<string, unknown>>
  }
}

export type CourseSeed = {
  id: string
  title: string
  shortTitle: string
  tagline: string
  description: string
  coverFrom: string
  coverTo: string
  accent: string
  coverImage: string
  ageLabel: string
  ageTrack: 'L1' | 'L2'
  courseKey: 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6'
  durationLabel: string
  productLabel: string
  status: 'open' | 'soon'
  recommended: boolean
  skills: string[]
  /** What the child achieves after finishing (intro screen) */
  outcomes: string[]
  /** Honest completion issuer and framework references; never implies approval. */
  recognition: {
    issuer: string
    credential: string
    finalAssessment: string
    frameworks: Array<{ code: string; title: string }>
    disclaimer: string
  }
  sortOrder: number
  quests: QuestSeed[]
}

export function learn(
  id: string,
  concept: string,
  example: string,
): LearnCard[] {
  return [
    {
      id: `${id}-concept`,
      title: 'Ý chính',
      body: concept,
      tip: 'Làm chậm, không sao nếu thử lại.',
      kind: 'concept',
    },
    {
      id: `${id}-example`,
      title: 'Ví dụ',
      body: example,
      tip: 'Chọn đáp án vui và an toàn.',
      kind: 'example',
    },
    {
      id: `${id}-safety`,
      title: 'An toàn',
      body: 'Không dùng tên thật hay thông tin cá nhân.',
      tip: 'Biệt danh là đủ!',
      kind: 'safety',
    },
  ]
}

/** correctIndex intentionally not always 0 */
export function defaultCheck(
  q: string,
  options: string[],
  correctIndex: number,
): CheckQuestion[] {
  return [
    {
      id: 'q1',
      question: q,
      options,
      correctIndex,
      explain: 'Làm tốt lắm! Con hiểu rồi.',
    },
    {
      id: 'q2',
      question: 'Khi AI vẽ sai, con nên làm gì?',
      options: [
        'Tức giận với máy',
        'Thử lại với mô tả rõ hơn',
        'Đưa email của mình cho AI',
      ],
      correctIndex: 1,
      explain: 'AI có thể sai — con là người kiểm tra và chỉnh lại!',
    },
  ]
}

export const PROMPT_CHIPS: Record<string, PromptChip[]> = {
  character: [
    {
      id: 'c1',
      slot: 'character',
      label: 'mèo vũ trụ',
      emoji: '🐱',
      description: 'Bạn mèo đội mũ sao',
    },
    {
      id: 'c2',
      slot: 'character',
      label: 'robot mực màu',
      emoji: '🤖',
      description: 'Robot thân thiện',
    },
    {
      id: 'c3',
      slot: 'character',
      label: 'rồng kẹo',
      emoji: '🐉',
      description: 'Rồng dễ thương',
    },
  ],
  action: [
    { id: 'a1', slot: 'action', label: 'nhảy múa', emoji: '💃' },
    { id: 'a2', slot: 'action', label: 'sửa máy cầu vồng', emoji: '🔧' },
    { id: 'a3', slot: 'action', label: 'bay trên mây', emoji: '☁️' },
  ],
  environment: [
    { id: 'e1', slot: 'environment', label: 'hành tinh kẹo', emoji: '🪐' },
    { id: 'e2', slot: 'environment', label: 'thư viện mây', emoji: '📚' },
    { id: 'e3', slot: 'environment', label: 'rừng đèn lồng', emoji: '🏮' },
  ],
  mood: [
    { id: 'm1', slot: 'mood', label: 'vui vẻ', emoji: '😊' },
    { id: 'm2', slot: 'mood', label: 'tò mò', emoji: '🧐' },
    { id: 'm3', slot: 'mood', label: 'dũng cảm', emoji: '💪' },
  ],
  style: [
    { id: 's1', slot: 'style', label: 'truyện tranh', emoji: '📖' },
    { id: 's2', slot: 'style', label: 'màu nước', emoji: '🎨' },
    { id: 's3', slot: 'style', label: 'pixel dễ thương', emoji: '👾' },
  ],
}
