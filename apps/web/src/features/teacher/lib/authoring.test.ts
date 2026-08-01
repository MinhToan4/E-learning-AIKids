import { describe, expect, it } from 'vitest'
import {
  buildLectureGameConfig,
  courseDraftReadiness,
  lectureDraftReadiness,
  serializeLectureGameConfig,
  slugifyAuthoringId,
  type LectureDraft,
} from './authoring'

const gameContent = {
  lobby: {
    eyebrow: 'Xưởng AI',
    title: 'Chọn nhiệm vụ',
    description: 'Học AI bằng hành động.',
    imageUrl: '/assets/game-engines/game-lab-world.webp',
    imageAlt: 'Bản đồ xưởng AI',
  },
  catalog: [
    { type: 'data-runner', label: 'Đường đua', shortLabel: 'Chạy', description: 'Chọn dữ liệu', gameplay: 'Chạy', sceneUrl: '/assets/game-engines/data-trail-world.webp', sceneAlt: 'Đường chạy' },
    { type: 'truth-patrol', label: 'Kiểm chứng', shortLabel: 'Quét', description: 'Kiểm tra nguồn', gameplay: 'Quét', sceneUrl: '/assets/game-engines/truth-patrol-world.webp', sceneAlt: 'Bầu trời' },
  ],
  runnerLevels: [{ id: 'runner' }],
  patrolWaves: [{ id: 'patrol' }],
}

const completeLecture: LectureDraft = {
  id: 'bai-1-du-lieu-ai',
  title: 'Dữ liệu cho AI',
  skill: 'Đánh giá dữ liệu',
  hook: 'AI sẽ học gì từ dữ liệu chưa được kiểm tra?',
  practiceKind: 'journal',
  videoUrl: 'https://example.test/video',
  concept: 'AI học mẫu từ dữ liệu nên chất lượng và sự đồng ý đều quan trọng.',
  example: 'So sánh một tập dữ liệu đa dạng với một tập chỉ có ảnh lặp.',
  reward: 'Huy hiệu dữ liệu',
  duration: '25–35 phút',
  goalsText: 'Nhận ra dữ liệu sai\nBảo vệ thông tin riêng tư',
  gameType: 'data-runner',
  gameMode: 'required',
  gameAllowedTypes: ['data-runner'],
  gameDifficulty: 'steady',
  gameInstruction: 'Chạy và chọn dữ liệu phù hợp để huấn luyện AI.',
  gameOutcome: 'Giải thích được vì sao một mẫu nên dùng hoặc nên tránh.',
  gameCardsText: '',
  gameStructuredText: JSON.stringify(gameContent),
  questionCount: 6,
  practiceInstruction: 'Lập danh sách kiểm tra dữ liệu trước khi dùng cho AI.',
  product: 'Bảng kiểm dữ liệu',
  checkQuestions: [{
    id: 'cq-test-0',
    prompt: 'Dữ liệu nào phù hợp hơn để thử AI?',
    options: ['Một ảnh lặp lại', 'Nhiều mẫu có nhãn đúng', 'Mật khẩu của bạn'],
    answer: 1,
    explain: 'Dữ liệu đa dạng và đúng nhãn giúp phép thử đáng tin cậy hơn.',
  }],
  checkQuestion: 'Dữ liệu nào phù hợp hơn để thử AI?',
  checkOption1: 'Một ảnh lặp lại',
  checkOption2: 'Nhiều mẫu có nhãn đúng',
  checkOption3: 'Mật khẩu của bạn',
  correctIndex: '1',
  checkExplain: 'Dữ liệu đa dạng và đúng nhãn giúp phép thử đáng tin cậy hơn.',
}

describe('authoring ids and readiness', () => {
  it('creates a bounded safe id from Vietnamese titles', () => {
    expect(slugifyAuthoringId('  Khóa học Đạo đức AI!  ')).toBe('khoa-hoc-dao-duc-ai')
    expect(slugifyAuthoringId('Một tiêu đề rất dài '.repeat(8)).length)
      .toBeLessThanOrEqual(40)
  })

  it('keeps course validation grouped by authoring step', () => {
    const result = courseDraftReadiness({
      id: 'ai-co-ban',
      title: 'AI cơ bản',
      shortTitle: 'AI',
      tagline: 'Học AI qua nhiệm vụ',
      description: 'Khóa học AI thực hành dành cho trẻ em.',
      productLabel: 'Dự án AI',
      ageTrack: 'L1',
      courseKey: 'K1',
      durationLabel: '8 tuần',
      skillsText: 'Kiểm chứng',
      outcomesText: 'Giải thích được AI',
      credential: 'Huy hiệu AI',
      finalAssessment: 'Trình bày một dự án AI có kiểm tra và cải thiện.',
    })
    expect(result).toMatchObject({ complete: true, completed: 3, total: 3 })
  })

  it('requires DB-authored content for every enabled engine', () => {
    expect(lectureDraftReadiness(completeLecture).complete).toBe(true)
    const choiceDraft = {
      ...completeLecture,
      gameMode: 'student_choice' as const,
      gameAllowedTypes: ['data-runner', 'truth-patrol'],
      gameStructuredText: JSON.stringify({
        ...gameContent,
        patrolWaves: [],
      }),
    }
    expect(lectureDraftReadiness(choiceDraft).steps
      .find((step) => step.id === 'game')?.complete).toBe(false)
  })

  it('serializes game content without embedding policy fields', () => {
    const draft = {
      ...completeLecture,
      gameMode: 'student_choice' as const,
      gameAllowedTypes: ['data-runner', 'truth-patrol'],
      gameDifficulty: 'challenge' as const,
    }
    const config = buildLectureGameConfig(draft)
    expect(config).toMatchObject({
      selectionMode: 'student_choice',
      allowedTypes: ['data-runner', 'truth-patrol'],
      difficulty: 'challenge',
      lobby: gameContent.lobby,
    })
    expect(JSON.parse(serializeLectureGameConfig('data-runner', config)))
      .toEqual(gameContent)
  })
})
