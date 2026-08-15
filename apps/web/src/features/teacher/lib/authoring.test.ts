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
  concept: 'AI học mẫu từ nhiều dữ liệu đã được chuẩn bị. Nếu dữ liệu thiếu, sai nhãn hoặc không đa dạng, kết quả dự đoán có thể không chính xác.',
  example: 'So sánh một tập dữ liệu có nhiều ảnh được gắn nhãn đúng với một tập chỉ lặp lại cùng một ảnh; tập đa dạng giúp AI kiểm tra tốt hơn.',
  learnCards: [
    { id: 'concept', title: 'Dữ liệu giúp AI học', body: 'AI tìm mẫu từ nhiều ví dụ đã được chuẩn bị và kiểm tra trước khi sử dụng.', tip: 'Dữ liệu tốt giúp kết quả đáng tin cậy hơn.', kind: 'concept', layout: 'text', visualItems: [] },
    { id: 'example', title: 'So sánh hai bộ ảnh', body: 'Một bộ ảnh đa dạng và gắn nhãn đúng giúp AI nhận ra nhiều trường hợp hơn bộ ảnh bị lặp.', tip: '', kind: 'example', layout: 'split', visualItems: [] },
  ],
  reward: 'Huy hiệu dữ liệu',
  duration: '25–35 phút',
  goalsText: 'Nhận ra dữ liệu thiếu hoặc sai\nGiải thích vì sao dữ liệu cần đa dạng\nBảo vệ thông tin riêng tư khi thực hành',
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
  practiceStepsText: 'Nhắc lại dấu hiệu dữ liệu tốt\nKiểm tra bộ dữ liệu mẫu\nSửa một điểm chưa phù hợp',
  successCriteriaText: 'Nhận ra dữ liệu thiếu\nGiải thích được lựa chọn\nKhông ghi thông tin riêng tư',
  reflectionPrompt: 'Con đã sửa điểm nào sau khi tự kiểm tra và vì sao?',
  practiceConfigText: '',
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
    const complete = lectureDraftReadiness(completeLecture)
    expect(complete.complete).toBe(true)
    expect(complete.steps.map((step) => step.id)).toEqual(['basics', 'content', 'game', 'practice', 'check'])
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

  it('validates discovery cards instead of legacy concept and example fields', () => {
    const result = lectureDraftReadiness({ ...completeLecture, concept: '', example: '' })
    expect(result.steps.find((step) => step.id === 'basics')?.complete).toBe(true)
    expect(result.steps.find((step) => step.id === 'content')?.complete).toBe(true)
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
