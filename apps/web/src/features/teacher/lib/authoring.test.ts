import { describe, expect, it } from 'vitest'
import {
  buildLectureGameConfig,
  courseDraftReadiness,
  createAikiRuleLearnCards,
  createFourKeysBlock,
  detectLessonFormat,
  isAikiRuleLesson,
  serializeLearnCardsForHub,
  lectureDraftReadiness,
  serializeLectureGameConfig,
  slugifyAuthoringId,
  getStageBlocks,
  type StageBlockItem,
  type LectureDraft,
} from './authoring'
import { normalizeLectureDraft, getActiveModules } from '../components/LectureDrawer'
import { FEATURE_BLOCKS_CATEGORIES } from '../pages/TeacherPage'
import { hydrateAikiRuleCard } from '../../lesson/pages/LessonPage'

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

  it('creates and validates the five ordered AIKI rule stages', () => {
    const cards = createAikiRuleLearnCards().map((card) => ({
      ...card,
      body: 'Nội dung đủ dài, gần gũi và phù hợp với trẻ trong phần này.',
      imageUrl: 'https://cdn.example.com/stage.webp',
      mee: { ...card.mee!, readText: 'AIKI đọc lời hướng dẫn ngắn gọn cho trẻ.' },
    }))
    expect(isAikiRuleLesson(cards)).toBe(true)
    expect(detectLessonFormat(cards)).toBe('aiki-rule-5steps')
    const aikiReadiness = lectureDraftReadiness({
      ...completeLecture,
      learnCards: cards,
      gameInstruction: '',
      practiceInstruction: '',
      checkQuestions: [],
      checkQuestion: '',
    })
    expect(aikiReadiness.total).toBe(2)
    expect(aikiReadiness.completed).toBe(2)
    expect(aikiReadiness.complete).toBe(true)
    expect(aikiReadiness.steps.map((step) => step.id)).toEqual(['basics', 'content'])
    expect(aikiReadiness.steps.find((step) => step.id === 'content')?.complete).toBe(true)
    expect(isAikiRuleLesson([cards[1], cards[0], ...cards.slice(2)])).toBe(false)
    expect(detectLessonFormat([cards[1], cards[0], ...cards.slice(2)])).toBe('standard')
    cards[1].optionImages = ['https://cdn.example.com/zico.webp', 'https://cdn.example.com/sonet.webp']
    cards[1].optionLabels = ['Tranh A (Zico)', 'Tranh B (Sonet)']
    cards[1].optionDescs = ['Mô tả A', 'Mô tả B']
    cards[0].dialogueLines = [{ id: 'd-1', speaker: 'zico', role: 'left', text: 'Chào!' }]
    cards[0].additionalImages = [{ id: 'img-1', url: 'https://cdn.example.com/extra.webp', alt: 'Minh họa' }]
    cards[3].compareImages = { left: 'https://cdn.example.com/ai.webp', right: 'https://cdn.example.com/kid.webp' }
    cards[3].compareData = { leftTitle: 'AI', rightTitle: 'Bé' }
    cards[0].enabledModules = ['dialogue', 'images']
    const serialized = serializeLearnCardsForHub(cards)
    expect(serialized.map((card) => card.kind)).toEqual(['concept', 'example', 'steps', 'compare', 'remember'])
    expect(serialized.every((card) => card.visualItems.some((item) => item.label === '__AIKI_RULE_STAGE__'))).toBe(true)

    const situationMeta = JSON.parse(serialized[0].visualItems.find((item) => item.label === '__AIKI_RULE_STAGE__')!.text)
    expect(situationMeta.dialogueLines).toEqual([{ id: 'd-1', speaker: 'zico', role: 'left', text: 'Chào!' }])
    expect(situationMeta.additionalImages).toEqual([{ id: 'img-1', url: 'https://cdn.example.com/extra.webp', alt: 'Minh họa' }])
    expect(situationMeta.enabledModules).toEqual(['dialogue', 'images'])

    const riddleMeta = JSON.parse(serialized[1].visualItems.find((item) => item.label === '__AIKI_RULE_STAGE__')!.text)
    expect(riddleMeta.optionImages).toEqual(['https://cdn.example.com/zico.webp', 'https://cdn.example.com/sonet.webp'])
    expect(riddleMeta.optionLabels).toEqual(['Tranh A (Zico)', 'Tranh B (Sonet)'])
    expect(riddleMeta.optionDescs).toEqual(['Mô tả A', 'Mô tả B'])

    const explanationMeta = JSON.parse(serialized[3].visualItems.find((item) => item.label === '__AIKI_RULE_STAGE__')!.text)
    expect(explanationMeta.compareImages).toEqual({ left: 'https://cdn.example.com/ai.webp', right: 'https://cdn.example.com/kid.webp' })
    expect(explanationMeta.compareData).toEqual({ leftTitle: 'AI', rightTitle: 'Bé' })

    // Verify normalizeLectureDraft restores all 6 module fields
    const normalized = normalizeLectureDraft({
      ...completeLecture,
      learnCards: serialized,
    })
    expect(normalized.learnCards[0].dialogueLines).toEqual([{ id: 'd-1', speaker: 'zico', role: 'left', text: 'Chào!' }])
    expect(normalized.learnCards[0].additionalImages).toEqual([{ id: 'img-1', url: 'https://cdn.example.com/extra.webp', alt: 'Minh họa' }])
    expect(normalized.learnCards[0].enabledModules).toEqual(['dialogue', 'images'])
    expect(normalized.learnCards[1].optionLabels).toEqual(['Tranh A (Zico)', 'Tranh B (Sonet)'])
    expect(normalized.learnCards[1].optionDescs).toEqual(['Mô tả A', 'Mô tả B'])
    expect(normalized.learnCards[3].compareData).toEqual({ leftTitle: 'AI', rightTitle: 'Bé' })
    expect(normalized.lessonFormat).toBe('aiki-rule-5steps')
    expect(normalized.learnCards.map((c) => c.kind)).toEqual(['situation', 'aiki-riddle', 'rule', 'explanation', 'closing'])
    expect(detectLessonFormat(serialized, 'aiki-rule-5steps')).toBe('aiki-rule-5steps')
    expect(detectLessonFormat(serialized, 'standard')).toBe('standard')
    expect(detectLessonFormat(serialized)).toBe('aiki-rule-5steps')

    const migratedCourseLesson = normalizeLectureDraft({
      ...completeLecture,
      id: '6390499b-0bcd-4f42-8393-c96804a444bd',
      title: 'Bài 1.2 — Bốn chiếc chìa khoá',
      lessonFormat: 'aiki-island-6steps',
      learnCards: serialized,
      sixStageJourney: undefined,
    }, 'de66602b-c9a0-4589-a04b-226ce3b31120')
    expect(migratedCourseLesson.lessonFormat).toBe('aiki-island-6steps')
    expect(migratedCourseLesson.sixStageJourney?.stage1_goal.title).toContain('Bốn chiếc chìa khoá')
    expect(migratedCourseLesson.sixStageJourney?.stage2_confirmGoal.options).toHaveLength(3)
    expect(migratedCourseLesson.learnCards[0].kind).not.toBe('situation')
    expect(migratedCourseLesson.learnCards[0].contentBlocks?.slice(0, 2).map((block) => block.type)).toEqual([
      'text',
      'layout-four-keys',
    ])
    expect(migratedCourseLesson.learnCards.every((card) =>
      !(card.contentBlocks || []).some((block) => block.type === 'voice')
    )).toBe(true)
    expect(migratedCourseLesson.learnCards.map((card) => card.id)).toEqual([
      'island-stage-1', 'island-stage-2', 'island-stage-3',
      'island-stage-4', 'island-stage-5', 'island-stage-6',
    ])
    expect(migratedCourseLesson.learnCards[1].contentBlocks?.map((block) => block.type)).toEqual([
      'text', 'layout-confirm-option', 'layout-confirm-option', 'layout-confirm-option',
    ])
    expect(migratedCourseLesson.learnCards[1].contentBlocks?.filter((block) => block.isCorrect)).toHaveLength(1)
    expect(migratedCourseLesson.learnCards.slice(2).every((card) => card.contentBlocks?.length === 0)).toBe(true)
    expect(migratedCourseLesson.learnCards.some((card) => card.title.includes('Câu đố của AIKI'))).toBe(false)

    // Verify hydrateAikiRuleCard decodes from visualItems and removes __AIKI_RULE_STAGE__
    const hydratedSituation = hydrateAikiRuleCard(serialized[0] as any)
    expect(hydratedSituation.dialogueLines).toEqual([{ id: 'd-1', speaker: 'zico', role: 'left', text: 'Chào!' }])
    expect(hydratedSituation.additionalImages).toEqual([{ id: 'img-1', url: 'https://cdn.example.com/extra.webp', alt: 'Minh họa' }])
    expect(hydratedSituation.enabledModules).toEqual(['dialogue', 'images'])
    expect(hydratedSituation.visualItems?.some((item) => item.label === '__AIKI_RULE_STAGE__')).toBe(false)

    // Verify fallback to tip when visualItems has no metadata
    const legacyCard = {
      id: 'legacy-1',
      title: 'Tình huống',
      body: 'Nội dung',
      tip: '<!--__AIKI_RULE_STAGE__:{"dialogueLines":[{"id":"d-legacy","speaker":"ai","role":"left","text":"Xin chào!"}]}-->',
      kind: 'concept',
      visualItems: [],
    }
    const hydratedLegacy = hydrateAikiRuleCard(legacyCard as any)
    expect(hydratedLegacy.dialogueLines).toEqual([{ id: 'd-legacy', speaker: 'ai', role: 'left', text: 'Xin chào!' }])
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

  it('provides feature blocks library categories and active module resolution', () => {
    // 1. Verify course-native templates are separated from generic blocks.
    expect(FEATURE_BLOCKS_CATEGORIES).toHaveLength(6)
    const categoryNames = FEATURE_BLOCKS_CATEGORIES.map((c) => c.category)
    expect(categoryNames).toEqual([
      'Khối Chuẩn Khóa Học',
      'Kể Chuyện & Bài Giảng',
      'Bố Cục & Văn Bản',
      'Game Engine Bài Học',
      'Game Engine Thực Hành',
      'Luyện Tập & Đánh Giá',
    ])

    // Verify all essential block IDs are present
    const allBlockIds = FEATURE_BLOCKS_CATEGORIES.flatMap((c) => c.items.map((i) => i.id))
    expect(allBlockIds).toContain('course-text')
    expect(allBlockIds).toContain('course-four-keys')
    expect(allBlockIds).toContain('practice-ai-studio')
    expect(allBlockIds).toContain('versus-ab')
    expect(allBlockIds).toContain('dialogue')
    expect(allBlockIds).toContain('compare')
    expect(allBlockIds).toContain('poster')
    expect(allBlockIds).toContain('gallery')
    expect(allBlockIds).toContain('video')
    expect(allBlockIds).toContain('voice')
    expect(allBlockIds).toContain('layout-text')
    expect(allBlockIds).toContain('layout-split')
    expect(allBlockIds).toContain('layout-grid')
    expect(allBlockIds).toContain('layout-callout')
    expect(allBlockIds).toContain('layout-storyboard')
    expect(allBlockIds).toContain('layout-formula')
    expect(allBlockIds).toContain('data-runner')
    expect(allBlockIds).toContain('truth-patrol')
    expect(allBlockIds).toContain('battle-math')
    expect(allBlockIds).toContain('blockly')
    expect(allBlockIds).toContain('quiz')
    expect(allBlockIds).toContain('ordering')
    expect(allBlockIds).toContain('pledge')

    // 2. Verify getActiveModules resolution with explicit enabledModules
    const cardWithExplicit: any = {
      id: 'c1',
      title: 'Tùy biến',
      body: 'Nội dung',
      tip: '',
      kind: 'concept',
      layout: 'text',
      visualItems: [],
      enabledModules: ['dialogue', 'images', 'poster'],
    }
    expect(getActiveModules(cardWithExplicit, 0)).toEqual(['dialogue', 'images', 'poster'])

    // 2.1. Verify empty enabledModules preserves empty array (triggers Empty State Dropzone)
    const cardWithEmpty: any = {
      ...cardWithExplicit,
      enabledModules: [],
    }
    expect(getActiveModules(cardWithEmpty, 0)).toEqual([])

    // 3. Verify getActiveModules resolution with implicit fallback
    const cardSituation: any = {
      id: 's1',
      title: 'Tình huống',
      body: 'Mở đầu',
      tip: '',
      kind: 'situation',
      layout: 'text',
      visualItems: [],
      videoUrl: 'https://cdn.example.com/intro.mp4',
    }
    const situationModules = getActiveModules(cardSituation, 0)
    expect(situationModules).toContain('text')
    expect(situationModules).toContain('video')
    expect(situationModules).toContain('dialogue')

    const cardRiddle: any = {
      id: 's2',
      title: 'Câu đố',
      body: 'Chọn tranh',
      tip: '',
      kind: 'aiki-riddle',
      layout: 'text',
      visualItems: [],
    }
    expect(getActiveModules(cardRiddle, 1)).toContain('versus-ab')
  })

  it('supports flexible stage content blocks: multiple textboxes and arbitrary reordering', () => {
    // 1. Initial creation from fallback
    const defaultCards = createAikiRuleLearnCards()
    const stage0 = defaultCards[0]
    const initialBlocks = getStageBlocks(stage0, 0)
    expect(initialBlocks.length).toBeGreaterThan(0)
    expect(initialBlocks.some((b) => b.type === 'dialogue')).toBe(true)

    // 2. Custom block sequence with multiple textboxes (e.g., text -> video -> text)
    const customBlocks: StageBlockItem[] = [
      {
        id: 'blk-text-top',
        type: 'text',
        title: 'Giới thiệu phần 1',
        body: 'Hôm nay chúng ta cùng khám phá một tình huống kỳ lạ.',
      },
      {
        id: 'blk-video-mid',
        type: 'video',
        videoUrl: 'https://cdn.example.com/demo.mp4',
      },
      {
        id: 'blk-text-bottom',
        type: 'text',
        title: 'Lời nhắn bổ sung ở dưới',
        body: 'Các bạn hãy chú ý chi tiết trong video vừa rồi nhé!',
      },
      {
        id: 'blk-callout',
        type: 'layout-callout',
        tip: 'Mẹo vàng: Hãy quan sát kỹ nét vẽ của nhân vật.',
      },
    ]

    const cardWithMultipleBlocks: any = {
      ...stage0,
      contentBlocks: customBlocks,
      enabledModules: ['text', 'video', 'layout-callout'],
    }

    const resolvedBlocks = getStageBlocks(cardWithMultipleBlocks, 0)
    expect(resolvedBlocks).toHaveLength(4)
    expect(resolvedBlocks[0].id).toBe('blk-text-top')
    expect(resolvedBlocks[1].id).toBe('blk-video-mid')
    expect(resolvedBlocks[2].id).toBe('blk-text-bottom')
    expect(resolvedBlocks[3].id).toBe('blk-callout')

    // 3. Reordering blocks (e.g. moving bottom textbox to the very top)
    const reorderedBlocks = [
      resolvedBlocks[2], // blk-text-bottom
      resolvedBlocks[0], // blk-text-top
      resolvedBlocks[1], // blk-video-mid
      resolvedBlocks[3], // blk-callout
    ]
    expect(reorderedBlocks[0].id).toBe('blk-text-bottom')
    expect(reorderedBlocks[1].id).toBe('blk-text-top')

    // 4. Serialization roundtrip preserves contentBlocks
    const allCards = createAikiRuleLearnCards()
    allCards[0] = {
      ...allCards[0],
      contentBlocks: reorderedBlocks,
      enabledModules: ['text', 'video', 'layout-callout'],
    }

    const serialized = serializeLearnCardsForHub(allCards)
    const stage0Serialized = serialized[0]
    expect(stage0Serialized.visualItems.some((v) => v.label === '__AIKI_RULE_STAGE__')).toBe(true)

    // Normalize back to draft
    const normalized = normalizeLectureDraft({
      ...completeLecture,
      id: 'test-lecture',
      title: 'Bài học kiểm thử',
      learnCards: serialized as any,
    })

    const normalizedStage0 = normalized.learnCards[0]
    expect(normalizedStage0.contentBlocks).toBeDefined()
    expect(normalizedStage0.contentBlocks).toHaveLength(4)
    expect(normalizedStage0.contentBlocks![0].id).toBe('blk-text-bottom')
    expect(normalizedStage0.contentBlocks![1].id).toBe('blk-text-top')
    expect(normalizedStage0.contentBlocks![2].id).toBe('blk-video-mid')
    expect(normalizedStage0.contentBlocks![3].id).toBe('blk-callout')
  })

  it('includes images at the beginning when imageUrl is set and enables images for situation stage', () => {
    const defaultCards = createAikiRuleLearnCards()
    expect(defaultCards[0].enabledModules).toEqual(['images', 'dialogue'])
    expect(defaultCards[1].optionLabels).toBeUndefined()
    expect(defaultCards[1].optionDescs).toBeUndefined()

    // Without enabledModules, imageUrl triggers images module first
    const cardWithHero: any = {
      id: 'qt1-situation',
      title: 'Tình huống',
      imageUrl: '/assets/aiki-rules/rule1_superhero_dad.jpg',
      dialogueLines: [{ id: 'd1', speaker: 'zico', role: 'left', text: 'Chào!' }],
    }
    const modules = getActiveModules(cardWithHero, 0)
    expect(modules[0]).toBe('images')
    expect(modules).toContain('dialogue')

    const blocks = getStageBlocks(cardWithHero, 0)
    expect(blocks[0].type).toBe('images')
    expect(blocks[0].imageUrl).toBe('/assets/aiki-rules/rule1_superhero_dad.jpg')
  })

  it('creates an editable four-key layout without sharing template item references', () => {
    const first = createFourKeysBlock('four-keys-a')
    const second = createFourKeysBlock('four-keys-b')

    expect(first.type).toBe('layout-four-keys')
    expect(first.visualItems?.map((item) => item.label)).toEqual([
      'Cái gì?',
      'Trông như thế nào?',
      'Đang làm gì?',
      'Ở đâu?',
    ])

    first.visualItems![0].label = 'Ai?'
    expect(second.visualItems?.[0].label).toBe('Cái gì?')
  })
})
