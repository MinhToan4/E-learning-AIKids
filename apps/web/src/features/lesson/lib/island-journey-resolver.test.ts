import { describe, expect, it } from 'vitest'
import {
  computeNextIslandLessonSlug,
  isValidSixStageJourney,
  resolveIslandSixStageJourney,
  isAikiRuleJourney,
  extractRuleNumber,
  AIKI_MODULE_0_COURSE_ID,
  resolveIslandLessonJourney,
} from './island-journey-resolver'
import type { QuestDetail } from '@/shared/lib/api'

describe('island-journey-resolver', () => {
  describe('computeNextIslandLessonSlug', () => {
    it('computes next lesson in the same island', () => {
      expect(computeNextIslandLessonSlug('bai-1-1')).toBe('bai-1-2')
      expect(computeNextIslandLessonSlug('bai-1-2')).toBe('bai-1-3')
      expect(computeNextIslandLessonSlug('bai-1-3')).toBe('bai-1-4')
    })

    it('computes first lesson of next island at island boundary', () => {
      expect(computeNextIslandLessonSlug('bai-1-4')).toBe('bai-2-1')
      expect(computeNextIslandLessonSlug('bai-2-4')).toBe('bai-3-1')
      expect(computeNextIslandLessonSlug('bai-4-4')).toBe('bai-4-5')
      expect(computeNextIslandLessonSlug('bai-4-5')).toBe('bai-5-1')
    })

    it('returns undefined for the final island 5 capstone lesson', () => {
      expect(computeNextIslandLessonSlug('bai-5-4')).toBe('bai-5-5')
      expect(computeNextIslandLessonSlug('bai-5-5')).toBeUndefined()
    })
  })

  describe('isValidSixStageJourney', () => {
    it('returns true when all 6 stages are present', () => {
      const full = {
        stage1_goal: {},
        stage2_confirmGoal: {},
        stage3_video: {},
        stage4_quiz: {},
        stage5_practice: {},
        stage6_completion: {},
      }
      expect(isValidSixStageJourney(full)).toBe(true)
    })

    it('returns false when any stage is missing or invalid', () => {
      expect(isValidSixStageJourney(null)).toBe(false)
      expect(isValidSixStageJourney({})).toBe(false)
      expect(isValidSixStageJourney({ stage1_goal: {} })).toBe(false)
    })
  })

  describe('resolveIslandSixStageJourney', () => {
    const mockQuest: QuestDetail = {
      id: 'bai-1-1',
      courseId: 'dao-1',
      order: 1,
      title: 'Bài 1.1 — Một từ hay năm từ?',
      skill: 'Tạo câu lệnh chuẩn đủ 5 chi tiết',
      reward: 'Huy hiệu Mèo Mướp Béo',
      duration: '20–30 phút',
      hook: 'Tả càng rõ, AIKI vẽ càng đúng!',
      accent: '#f59e0b',
      practiceKind: 'prompt_lab',
      stage: 'learn',
      videoUrl: 'https://cdn.example.com/video1-1.mp4',
      coverImage: '/assets/aiki-islands/island1_lesson1_cat.jpg',
      coverImageAlt: 'Con mèo mướp',
      media: [],
      goals: ['Tạo câu lệnh chuẩn', 'Hiểu 5 chi tiết vàng', 'Làm chủ xưởng AIKI'],
      learnCards: [
        {
          id: 'situation',
          title: 'Tình huống',
          body: 'Mimi muốn vẽ một con mèo nhưng chỉ gõ hai chữ con mèo.',
          tip: 'Hãy miêu tả chi tiết hơn!',
          kind: 'concept',
          mee: { readText: 'Chào mừng bé đến với bài học 1.1!' },
        },
        {
          id: 'riddle',
          title: 'Câu đố',
          body: 'Câu lệnh nào giúp AI vẽ đúng con mèo?\n\nĐố bé chọn câu lệnh chuẩn xác nhất!',
          tip: '',
          kind: 'concept',
          optionDescs: ['Gõ ngắn: con mèo', 'Gõ đủ 5 chi tiết vàng'],
        },
      ],
      check: [
        {
          id: 'check-1',
          question: 'Vì sao câu lệnh dài và rõ lại tốt hơn?',
          options: ['AI hiểu rõ ý tưởng', 'AI vẽ lung tung'],
        },
      ],
      chips: null,
      sixStageJourney: undefined,
      stations: { stage: 'learn', stations: [] },
    }

    it('preserves quest.sixStageJourney for non-SSOT custom lessons when already valid', () => {
      const customJourney: any = {
        stage1_goal: { id: 'g1', title: 'Custom Goal' },
        stage2_confirmGoal: { id: 'g2' },
        stage3_video: { id: 'g3', videoUrl: 'https://cdn.example.com/custom.mp4' },
        stage4_quiz: { id: 'g4' },
        stage5_practice: { id: 'g5' },
        stage6_completion: { id: 'g6' },
      }
      const resolved = resolveIslandSixStageJourney({
        ...mockQuest,
        id: 'custom-non-island-quest',
        title: 'Bài Tùy Biến Ngoài Đảo',
        sixStageJourney: customJourney,
      })
      expect(resolved).toBe(customJourney)
      expect(resolved.stage1_goal.title).toBe('Custom Goal')
    })

    it('prioritizes SSOT registry over outdated DB sixStageJourney for island lessons while preserving custom videoUrl', () => {
      const outdatedDbJourney: any = {
        stage1_goal: { id: 'old-g1', title: 'Old Slide ASMO Title', imageUrl: '/old-asmo-slide.jpg' },
        stage2_confirmGoal: { id: 'old-g2', question: 'Old ASMO question' },
        stage3_video: { id: 'old-g3', videoUrl: 'https://cdn.example.com/custom-video.mp4' },
        stage4_quiz: { id: 'old-g4' },
        stage5_practice: { id: 'old-g5' },
        stage6_completion: { id: 'old-g6', nextLessonSlug: 'custom-next-slug' },
        stageContentBlocks: { 'stage-0': [{ id: 'extra-tip', type: 'layout-callout', tip: 'Mẹo do giáo viên thêm' }] },
        stageBlockEditorVersion: 2,
      }
      const resolved = resolveIslandSixStageJourney({
        ...mockQuest,
        videoUrl: undefined,
        sixStageJourney: outdatedDbJourney,
      })
      // SSOT title & 3D Soft Clay should prevail over outdated DB slide
      expect(resolved.stage1_goal.title).toContain('Một từ hay năm từ')
      expect(resolved.stage1_goal.imageUrl).toBe('/assets/aiki-islands/island1_lesson1_cat.jpg?v=2')
      // Custom videoUrl from DB journey is preserved
      expect(resolved.stage3_video.videoUrl).toBe('https://cdn.example.com/custom-video.mp4')
      expect(resolved.stageContentBlocks?.['stage-0']).toEqual(outdatedDbJourney.stageContentBlocks['stage-0'])
      expect(resolved.stageBlockEditorVersion).toBe(2)
    })

    it('resolves all 6 stages from SSOT registry when quest.sixStageJourney is null', () => {
      const resolved = resolveIslandSixStageJourney(mockQuest)

      // Stage 1: Goal
      expect(resolved.stage1_goal.title).toContain('Một từ hay năm từ')
      expect(resolved.stage1_goal.goalText).toBeTruthy()
      expect(resolved.stage1_goal.keyPoints.length).toBeGreaterThanOrEqual(3)

      // Stage 2: Confirm Goal (Options cụ thể từ kịch bản Google Sheets)
      expect(resolved.stage2_confirmGoal.question).toBeTruthy()
      expect(resolved.stage2_confirmGoal.options.length).toBeGreaterThanOrEqual(2)
      expect(resolved.stage2_confirmGoal.options[0].text).toContain('Dừng lại')
      expect(resolved.stage2_confirmGoal.options[1].text).toContain('Tự đoán')
      expect(resolved.stage2_confirmGoal.correctIndex).toBe(1)
      expect(resolved.stage2_confirmGoal.options[0].text).not.toContain('Phương án A')

      // Stage 3: Video
      expect(resolved.stage3_video.videoUrl).toBe(mockQuest.videoUrl)
      expect(resolved.stage3_video.timestamps?.length).toBeGreaterThanOrEqual(3)

      // Stage 4: Quiz
      expect(resolved.stage4_quiz.questions.length).toBeGreaterThanOrEqual(2)
      expect(resolved.stage4_quiz.questions[0].prompt).toBeTruthy()

      // Stage 5: Practice Studio Workspace
      expect(resolved.stage5_practice.subjectName).toBe('Chú Mèo Mướp Béo')
      expect(resolved.stage5_practice.badge).toBe('Bài 1.1')
      expect(resolved.stage5_practice.maxAttempts).toBe(6)
      expect(resolved.stage5_practice.workflowSteps.length).toBeGreaterThanOrEqual(2)
      expect(resolved.stage5_practice.workflowSteps[0].title).toBe('Thực hành 01 — Một từ')
      expect(resolved.stage5_practice.workflowSteps[1].title).toBe('Thực hành 02 — Năm điều')

      // Stage 6: Completion
      expect(resolved.stage6_completion.nextLessonSlug).toBe('bai-1-2-bon-chiec-chia-khoa')
      expect(resolved.stage6_completion.rewardBadge.xp).toBe(50)
    })

    it('identifies curriculum by UUID id and Vietnamese title keyword', () => {
      const uuidQuest: QuestDetail = {
        ...mockQuest,
        id: 'f8b1c4e2-789a-4bc1-9012-3456789abcde', // Database UUID
        title: 'Khóa 3 điểm nhận diện nhân vật Sóc Bông',
        sixStageJourney: undefined,
      }

      const resolved = resolveIslandSixStageJourney(uuidQuest)
      expect(resolved.stage5_practice.subjectName).toContain('Sóc Bông')
      expect(resolved.stage5_practice.badge).toBe('Bài 3.2')
      expect(resolved.stage2_confirmGoal.question).toContain('Để AKI vẽ đúng một nhân vật')
    })

    it('falls back to dynamic generation when quest is outside 22 island lessons', () => {
      const customQuest: QuestDetail = {
        ...mockQuest,
        id: 'custom-bonus-station-99',
        title: 'Trạm Phụ Độc Đáo Của Bé',
        sixStageJourney: undefined,
      }

      const resolved = resolveIslandSixStageJourney(customQuest)
      expect(resolved.stage1_goal.title).toBe('Trạm Phụ Độc Đáo Của Bé')
      expect(resolved.stage2_confirmGoal.options).toHaveLength(2)
      expect(resolved.stage5_practice.maxAttempts).toBe(6)
    })

    it('accurately resolves rule quests (rule-1, qt-1) to /assets/aiki-rules/ without invalid /assets/aiki-islands/ URLs', () => {
      const ruleQuest: QuestDetail = {
        ...mockQuest,
        id: 'rule-1',
        courseId: 'aiki-rules',
        title: 'Quy tắc 1: Hãy nghĩ ý tưởng của cậu',
        coverImage: undefined,
        sixStageJourney: undefined,
      }

      const resolved = resolveIslandSixStageJourney(ruleQuest)
      // Must point to rule1 superhero dad poster, NEVER island1_lessonrule-1_cat.jpg
      expect(resolved.stage1_goal.imageUrl).toBe('/assets/aiki-rules/rule1_superhero_dad.webp')
      expect(resolved.stage1_goal.imageUrl).not.toContain('lessonrule-')
      expect(resolved.stage2_confirmGoal.options[0].imageUrl).toBe('/assets/aiki-rules/rule1_opt_zico.webp')
      expect(resolved.stage2_confirmGoal.options[1].imageUrl).toBe('/assets/aiki-rules/rule1_opt_sonet.webp')
      expect(resolved.stage6_completion.nextLessonSlug).toBe('rule-2')
      expect(resolved.stage6_completion.rewardBadge.iconUrl).toBe('/assets/aiki-rules/rule1_superhero_dad.webp')
    })
  })

  describe('isAikiRuleJourney', () => {
    it('identifies aiki rule IDs correctly', () => {
      expect(isAikiRuleJourney('rule-1')).toBe(true)
      expect(isAikiRuleJourney('rule-10')).toBe(true)
      expect(isAikiRuleJourney('qt-5')).toBe(true)
      expect(isAikiRuleJourney('qt1-nghi-y-tuong')).toBe(true)
      expect(isAikiRuleJourney('aiki-rules')).toBe(true)
      expect(isAikiRuleJourney(AIKI_MODULE_0_COURSE_ID)).toBe(true)
      expect(isAikiRuleJourney('muoi-quy-tac-xuong-sang-tao')).toBe(true)
      expect(isAikiRuleJourney('QT1 — Hãy nghĩ ý tưởng của con, rồi mới chia sẻ với AIKI nhé!')).toBe(true)
      expect(isAikiRuleJourney('QT10 — Bài tập ở trường là của con, đừng bắt AIKI phải làm nhé!')).toBe(true)
      expect(isAikiRuleJourney('bai-1-1')).toBe(false)
      expect(isAikiRuleJourney(null)).toBe(false)
    })

    it('identifies aiki rule quests by courseId or title', () => {
      expect(isAikiRuleJourney({ id: 'quest-123', courseId: 'aiki-rules' })).toBe(true)
      expect(isAikiRuleJourney({ id: 'quest-123', courseId: AIKI_MODULE_0_COURSE_ID })).toBe(true)
      expect(isAikiRuleJourney({ id: '0da9d441-43a0-4d00-84d7-e8f8958e2aad', title: 'QT1 — Hãy nghĩ ý tưởng của con' })).toBe(true)
      expect(isAikiRuleJourney({ id: 'quest-123', title: '10 Quy Tắc Vàng AIKI' })).toBe(true)
      expect(isAikiRuleJourney({ id: 'quest-123', title: 'Mười quy tắc của Xưởng sáng tạo' })).toBe(true)
      expect(isAikiRuleJourney({ id: 'bai-2-1', courseId: 'dao-2' })).toBe(false)
    })
  })

  describe('extractRuleNumber', () => {
    it('extracts rule numbers from string IDs, slugs, or titles', () => {
      expect(extractRuleNumber('rule-1')).toBe(1)
      expect(extractRuleNumber('rule-10')).toBe(10)
      expect(extractRuleNumber('qt-7')).toBe(7)
      expect(extractRuleNumber('qt5-chia-viec-ra')).toBe(5)
      expect(extractRuleNumber('QT1 — Hãy nghĩ ý tưởng của con')).toBe(1)
      expect(extractRuleNumber('QT10 — Bài tập ở trường là của con')).toBe(10)
      expect(extractRuleNumber('Quy tắc 3: Sản phẩm có giá trị')).toBe(3)
    })

    it('extracts rule numbers from quest objects with UUID and QT title', () => {
      expect(extractRuleNumber({
        id: '0da9d441-43a0-4d00-84d7-e8f8958e2aad',
        title: 'QT1 — Hãy nghĩ ý tưởng của con, rồi mới chia sẻ với AIKI nhé!',
      })).toBe(1)

      expect(extractRuleNumber({
        id: '7edb9bdb-e51a-4614-aa6d-9f60f79a9b2a',
        title: 'QT10 — Bài tập ở trường là của con, đừng bắt AIKI phải làm nhé!',
      })).toBe(10)
    })
  })

  describe('resolveIslandLessonJourney', () => {
    it('resolves exactly 3 universal stages for a rule journey', () => {
      const stages = resolveIslandLessonJourney('rule-1')
      expect(stages).toHaveLength(3)

      const [videoStage, quizStage, rewardStage] = stages
      expect(videoStage.type).toBe('VIDEO')
      expect(videoStage.stepNumber).toBe(1)
      expect(videoStage.config.slides).toHaveLength(5)
      expect(videoStage.config.posterUrl).toBe('/assets/aiki-rules/rule1_superhero_dad.webp')

      expect(quizStage.type).toBe('QUIZ')
      expect(quizStage.stepNumber).toBe(2)
      expect(quizStage.config.questions).toHaveLength(2)
      expect(quizStage.config.questions[0].visualUrl).toBe('/assets/aiki-rules/rule1_q1_clay.webp')

      expect(rewardStage.type).toBe('REWARD')
      expect(rewardStage.stepNumber).toBe(3)
      expect(rewardStage.config.rewardBadge.iconUrl).toBe('/assets/aiki-rules/rule1_superhero_dad.webp')
      expect(rewardStage.config.nextLessonId).toBe('rule-2')
    })

    it('resolves 3 stages for DB UUID lesson when title matches QT1', () => {
      const stages = resolveIslandLessonJourney({
        id: '0da9d441-43a0-4d00-84d7-e8f8958e2aad',
        courseId: AIKI_MODULE_0_COURSE_ID,
        title: 'QT1 — Hãy nghĩ ý tưởng của con, rồi mới chia sẻ với AIKI nhé!',
      } as any)

      expect(stages).toHaveLength(3)
      expect(stages[0].type).toBe('VIDEO')
      expect(stages[1].type).toBe('QUIZ')
      expect(stages[2].type).toBe('REWARD')
      expect(stages[0].config.posterUrl).toBe('/assets/aiki-rules/rule1_superhero_dad.webp')
    })

    it('resolves 6 stages for standard island lessons', () => {
      const stages = resolveIslandLessonJourney('bai-1-1', 'Đừng Để AIKI Đoán Mò')
      expect(stages).toHaveLength(6)
      expect(stages.map((s) => s.type)).toEqual([
        'GOAL',
        'CONFIRM',
        'VIDEO',
        'QUIZ',
        'PRACTICE',
        'REWARD',
      ])
    })
  })
})
