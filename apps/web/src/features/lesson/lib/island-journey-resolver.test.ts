import { describe, expect, it } from 'vitest'
import {
  computeNextIslandLessonSlug,
  isValidSixStageJourney,
  resolveIslandSixStageJourney,
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
      expect(computeNextIslandLessonSlug('bai-4-4')).toBe('bai-5-1')
    })

    it('returns undefined for the final island 5 capstone lesson', () => {
      expect(computeNextIslandLessonSlug('bai-5-4')).toBeUndefined()
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
      hook: 'Tả càng rõ, AKI vẽ càng đúng!',
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

    it('preserves quest.sixStageJourney when already valid', () => {
      const customJourney: any = {
        stage1_goal: { id: 'g1', title: 'Custom Goal' },
        stage2_confirmGoal: { id: 'g2' },
        stage3_video: { id: 'g3' },
        stage4_quiz: { id: 'g4' },
        stage5_practice: { id: 'g5' },
        stage6_completion: { id: 'g6' },
      }
      const resolved = resolveIslandSixStageJourney({
        ...mockQuest,
        sixStageJourney: customJourney,
      })
      expect(resolved).toBe(customJourney)
      expect(resolved.stage1_goal.title).toBe('Custom Goal')
    })

    it('resolves all 6 stages from SSOT registry when quest.sixStageJourney is null', () => {
      const resolved = resolveIslandSixStageJourney(mockQuest)

      // Stage 1: Goal
      expect(resolved.stage1_goal.title).toContain('Một từ hay năm từ')
      expect(resolved.stage1_goal.goalText).toBeTruthy()
      expect(resolved.stage1_goal.keyPoints.length).toBeGreaterThanOrEqual(3)

      // Stage 2: Confirm Goal (Options cụ thể, TUYỆT ĐỐI KHÔNG "Phương án A/B")
      expect(resolved.stage2_confirmGoal.question).toBeTruthy()
      expect(resolved.stage2_confirmGoal.options).toHaveLength(2)
      expect(resolved.stage2_confirmGoal.options[0].text).toContain('con mèo')
      expect(resolved.stage2_confirmGoal.options[1].text).toContain('5 chi tiết')
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
      expect(resolved.stage5_practice.workflowSteps.length).toBeGreaterThanOrEqual(4)

      // Stage 6: Completion
      expect(resolved.stage6_completion.nextLessonSlug).toBe('bai-1-2')
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
      expect(resolved.stage2_confirmGoal.question).toContain('Sóc Bông')
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
  })
})
