import { describe, expect, it } from 'vitest'
import { adaptSixStageJourneyToStages } from './stage-adapter'
import type { LessonSixStageJourney } from '@/shared/lib/api'

const baseJourney: LessonSixStageJourney = {
  stage1_goal: {
    title: 'Mục tiêu',
    goalText: 'Học tạo tranh',
    imageUrl: 'https://example.com/goal.png',
  },
  stage2_confirmGoal: {
    question: 'Chọn câu đúng',
    options: [{ id: '1', text: 'A', isCorrect: true }],
  },
  stage3_video: {
    videoUrl: 'https://youtube.com/watch?v=123',
    timestamps: [],
  },
  stage4_quiz: {
    questions: [],
  },
  stage5_practice: {
    steps: [],
    studioMode: 'standard',
  },
  stage6_completion: {
    id: 'comp-1',
    title: 'Hoàn thành',
    congratsMessage: 'Chúc mừng',
    rewardBadge: {
      id: 'badge-1',
      name: 'Huy hiệu',
      stars: 3,
      xp: 50,
    },
  },
}

describe('adaptSixStageJourneyToStages - star allocation', () => {
  it('uses legacy default star allocation when stageStarAllocation is undefined', () => {
    const stages = adaptSixStageJourneyToStages(baseJourney)
    expect(stages).toHaveLength(6)
    expect(stages[0].awardsStar).toBeUndefined() // Goal
    expect(stages[1].awardsStar).toBeUndefined() // Confirm
    expect(stages[2].awardsStar).toBe(1) // Video
    expect(stages[3].awardsStar).toBe(2) // Quiz
    expect(stages[4].awardsStar).toBe(3) // Practice
    expect(stages[5].awardsStar).toBeUndefined() // Reward
  })

  it('allocates stars based on custom stageStarAllocation', () => {
    const customJourney: LessonSixStageJourney = {
      ...baseJourney,
      stageStarAllocation: [0, 1, 3],
    }
    const stages = adaptSixStageJourneyToStages(customJourney)
    expect(stages[0].awardsStar).toBe(1) // Goal
    expect(stages[1].awardsStar).toBe(2) // Confirm
    expect(stages[2].awardsStar).toBeUndefined() // Video
    expect(stages[3].awardsStar).toBe(3) // Quiz
    expect(stages[4].awardsStar).toBeUndefined() // Practice
    expect(stages[5].awardsStar).toBeUndefined() // Reward
  })

  it('supports reward stage in stageStarAllocation', () => {
    const customJourney: LessonSixStageJourney = {
      ...baseJourney,
      stageStarAllocation: [1, 3, 5],
    }
    const stages = adaptSixStageJourneyToStages(customJourney)
    expect(stages[0].awardsStar).toBeUndefined()
    expect(stages[1].awardsStar).toBe(1)
    expect(stages[2].awardsStar).toBeUndefined()
    expect(stages[3].awardsStar).toBe(2)
    expect(stages[4].awardsStar).toBeUndefined()
    expect(stages[5].awardsStar).toBe(3)
  })

  it('adapts custom stages dynamically from customStages array (e.g. 4 stages)', () => {
    const custom4Journey: LessonSixStageJourney = {
      ...baseJourney,
      customStages: [
        { id: 'cs-1', index: 0, title: '1. Mục tiêu mới', shortTitle: 'Mục tiêu', type: 'GOAL', iconName: 'Target' },
        { id: 'cs-2', index: 1, title: '2. Video bài giảng', shortTitle: 'Video', type: 'VIDEO', iconName: 'Film' },
        { id: 'cs-3', index: 2, title: '3. Thử tài phản xạ', shortTitle: 'Trắc nghiệm', type: 'QUIZ', iconName: 'MessageCircleQuestion' },
        { id: 'cs-4', index: 3, title: '4. Kết thúc xuất sắc', shortTitle: 'Kết thúc', type: 'REWARD', iconName: 'Trophy' },
      ],
      stageStarAllocation: [1, 2, 3],
    }

    const stages = adaptSixStageJourneyToStages(custom4Journey)
    expect(stages).toHaveLength(4)
    expect(stages[0].type).toBe('GOAL')
    expect(stages[0].title).toBe('Mục tiêu')
    expect(stages[0].awardsStar).toBeUndefined()

    expect(stages[1].type).toBe('VIDEO')
    expect(stages[1].title).toBe('Video')
    expect(stages[1].awardsStar).toBe(1)

    expect(stages[2].type).toBe('QUIZ')
    expect(stages[2].title).toBe('Trắc nghiệm')
    expect(stages[2].awardsStar).toBe(2)

    expect(stages[3].type).toBe('REWARD')
    expect(stages[3].title).toBe('Kết thúc')
    expect(stages[3].awardsStar).toBe(3)
  })

  it('clamps custom stages to maximum 7 stages', () => {
    const custom8Journey: LessonSixStageJourney = {
      ...baseJourney,
      customStages: Array.from({ length: 9 }, (_, i) => ({
        id: `cs-${i}`,
        index: i,
        title: `Chặng ${i + 1}`,
        shortTitle: `C${i + 1}`,
        type: i === 0 ? 'GOAL' : i === 1 ? 'VIDEO' : i === 2 ? 'QUIZ' : i === 3 ? 'PRACTICE' : 'REWARD',
      })),
    }

    const stages = adaptSixStageJourneyToStages(custom8Journey)
    expect(stages).toHaveLength(7)
  })
})
