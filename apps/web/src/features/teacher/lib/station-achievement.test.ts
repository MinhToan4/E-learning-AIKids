import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { normalizeLectureDraft, type LectureDraft } from './authoring'
import { generateStationAchievements } from '../../../../scripts/generate-station-achievements'

describe('station achievement & reward synchronization', () => {
  describe('normalizeLectureDraft reward synchronization', () => {
    it('initializes missing rewardBadge for an island lesson with draft title fallback when reward is empty', () => {
      const draft: LectureDraft = {
        id: 'bai-custom-1',
        title: 'Thử nghiệm trạm sáng tạo',
        skill: 'Tả chi tiết',
        hook: 'Tả càng rõ AI vẽ càng đúng',
        practiceKind: 'intro',
        videoUrl: 'https://youtube.com/watch?v=test',
        concept: '',
        example: '',
        learnCards: [],
        reward: '',
        duration: '30 phút',
        goalsText: 'Mục tiêu 1\nMục tiêu 2\nMục tiêu 3',
        gameType: 'data-runner',
        gameMode: 'required',
        gameAllowedTypes: ['data-runner'],
        gameDifficulty: 'steady',
        gameInstruction: 'Hướng dẫn chơi',
        gameOutcome: 'Mục tiêu chơi',
        gameCardsText: '',
        gameStructuredText: '',
        questionCount: 3,
        practiceInstruction: 'Thực hành',
        product: 'Bức tranh',
        practiceStepsText: 'Bước 1\nBước 2\nBước 3',
        successCriteriaText: 'Tiêu chí 1\nTiêu chí 2\nTiêu chí 3',
        reflectionPrompt: 'Suy ngẫm',
        practiceConfigText: '',
        checkQuestions: [],
        checkQuestion: '',
        checkOption1: '',
        checkOption2: '',
        checkOption3: '',
        correctIndex: '0',
        checkExplain: '',
        lessonFormat: 'aiki-island-6steps',
        sixStageJourney: {
          stage1_goal: { id: 'g1', title: 'Goal', goalText: 'Text', imageUrl: '', speech: '', keyPoints: [] },
          stage2_confirmGoal: { id: 'g2', question: 'Q', options: [], correctIndex: 0, explanation: '', speech: '' },
          stage3_video: { id: 'g3', title: 'Video', videoUrl: 'https://youtube.com/watch?v=test', durationSec: 100 },
          stage4_quiz: { id: 'g4', title: 'Quiz', passScore: 80, questions: [] },
          stage5_practice: { id: 'g5', title: 'Practice', subjectName: 'Sub', badge: 'B', illustrationType: 'art', lockedFeatures: [], akiMotto: '', maxAttempts: 5, workflowSteps: [] },
          stage6_completion: {
            id: 'g6',
            title: 'Kết thúc',
            congratsMessage: 'Chúc mừng',
            rewardBadge: undefined as any,
          },
        },
      }

      const normalized = normalizeLectureDraft(draft)

      // Expected: reward is populated with fallback 'Huy hiệu ' + draft.title
      expect(normalized.reward).toBe('Huy hiệu Thử nghiệm trạm sáng tạo')
      // Expected: stage6_completion has rewardBadge with default stars & xp
      expect(normalized.sixStageJourney?.stage6_completion?.rewardBadge).toBeDefined()
      expect(normalized.sixStageJourney?.stage6_completion?.rewardBadge?.name).toBe('Huy hiệu Thử nghiệm trạm sáng tạo')
      expect(normalized.sixStageJourney?.stage6_completion?.rewardBadge?.stars).toBe(3)
      expect(normalized.sixStageJourney?.stage6_completion?.rewardBadge?.xp).toBe(50)
    })

    it('uses draft.reward to initialize rewardBadge if draft.reward is provided and rewardBadge is missing', () => {
      const draft: LectureDraft = {
        id: 'bai-custom-2',
        title: 'Phiêu lưu không gian',
        skill: 'Kể chuyện',
        hook: 'Mỗi tranh là 1 câu chuyện',
        practiceKind: 'story',
        videoUrl: 'https://youtube.com/watch?v=test',
        concept: '',
        example: '',
        learnCards: [],
        reward: 'Huy hiệu Nghệ Sĩ Kể Chuyện',
        duration: '30 phút',
        goalsText: 'Mục tiêu 1\nMục tiêu 2\nMục tiêu 3',
        gameType: 'data-runner',
        gameMode: 'required',
        gameAllowedTypes: ['data-runner'],
        gameDifficulty: 'steady',
        gameInstruction: 'Hướng dẫn chơi',
        gameOutcome: 'Mục tiêu chơi',
        gameCardsText: '',
        gameStructuredText: '',
        questionCount: 3,
        practiceInstruction: 'Thực hành',
        product: 'Bức tranh',
        practiceStepsText: 'Bước 1\nBước 2\nBước 3',
        successCriteriaText: 'Tiêu chí 1\nTiêu chí 2\nTiêu chí 3',
        reflectionPrompt: 'Suy ngẫm',
        practiceConfigText: '',
        checkQuestions: [],
        checkQuestion: '',
        checkOption1: '',
        checkOption2: '',
        checkOption3: '',
        correctIndex: '0',
        checkExplain: '',
        lessonFormat: 'aiki-island-6steps',
        sixStageJourney: {
          stage1_goal: { id: 'g1', title: 'Goal', goalText: 'Text', imageUrl: '', speech: '', keyPoints: [] },
          stage2_confirmGoal: { id: 'g2', question: 'Q', options: [], correctIndex: 0, explanation: '', speech: '' },
          stage3_video: { id: 'g3', title: 'Video', videoUrl: 'https://youtube.com/watch?v=test', durationSec: 100 },
          stage4_quiz: { id: 'g4', title: 'Quiz', passScore: 80, questions: [] },
          stage5_practice: { id: 'g5', title: 'Practice', subjectName: 'Sub', badge: 'B', illustrationType: 'art', lockedFeatures: [], akiMotto: '', maxAttempts: 5, workflowSteps: [] },
          stage6_completion: {
            id: 'g6',
            title: 'Kết thúc',
            congratsMessage: 'Chúc mừng',
            rewardBadge: { name: '', stars: 3, xp: 50 },
          },
        },
      }

      const normalized = normalizeLectureDraft(draft)

      expect(normalized.reward).toBe('Huy hiệu Nghệ Sĩ Kể Chuyện')
      expect(normalized.sixStageJourney?.stage6_completion?.rewardBadge?.name).toBe('Huy hiệu Nghệ Sĩ Kể Chuyện')
    })

    it('synchronizes draft.reward from existing stage6_completion.rewardBadge.name when draft.reward is empty', () => {
      const draft: LectureDraft = {
        id: 'bai-custom-3',
        title: 'Bài học sáng tạo',
        skill: 'Sáng tạo',
        hook: 'Khám phá',
        practiceKind: 'intro',
        videoUrl: 'https://youtube.com/watch?v=test',
        concept: '',
        example: '',
        learnCards: [],
        reward: '',
        duration: '30 phút',
        goalsText: 'Mục tiêu 1\nMục tiêu 2\nMục tiêu 3',
        gameType: 'data-runner',
        gameMode: 'required',
        gameAllowedTypes: ['data-runner'],
        gameDifficulty: 'steady',
        gameInstruction: 'Hướng dẫn chơi',
        gameOutcome: 'Mục tiêu chơi',
        gameCardsText: '',
        gameStructuredText: '',
        questionCount: 3,
        practiceInstruction: 'Thực hành',
        product: 'Bức tranh',
        practiceStepsText: 'Bước 1\nBước 2\nBước 3',
        successCriteriaText: 'Tiêu chí 1\nTiêu chí 2\nTiêu chí 3',
        reflectionPrompt: 'Suy ngẫm',
        practiceConfigText: '',
        checkQuestions: [],
        checkQuestion: '',
        checkOption1: '',
        checkOption2: '',
        checkOption3: '',
        correctIndex: '0',
        checkExplain: '',
        lessonFormat: 'aiki-island-6steps',
        sixStageJourney: {
          stage1_goal: { id: 'g1', title: 'Goal', goalText: 'Text', imageUrl: '', speech: '', keyPoints: [] },
          stage2_confirmGoal: { id: 'g2', question: 'Q', options: [], correctIndex: 0, explanation: '', speech: '' },
          stage3_video: { id: 'g3', title: 'Video', videoUrl: 'https://youtube.com/watch?v=test', durationSec: 100 },
          stage4_quiz: { id: 'g4', title: 'Quiz', passScore: 80, questions: [] },
          stage5_practice: { id: 'g5', title: 'Practice', subjectName: 'Sub', badge: 'B', illustrationType: 'art', lockedFeatures: [], akiMotto: '', maxAttempts: 5, workflowSteps: [] },
          stage6_completion: {
            id: 'g6',
            title: 'Kết thúc',
            congratsMessage: 'Chúc mừng',
            rewardBadge: {
              name: 'Huy hiệu Hiệp Sĩ Rồng Vàng',
              iconUrl: 'https://cdn.example.com/badge.png',
              stars: 3,
              xp: 100,
            },
          },
        },
      }

      const normalized = normalizeLectureDraft(draft)

      expect(normalized.reward).toBe('Huy hiệu Hiệp Sĩ Rồng Vàng')
      expect(normalized.sixStageJourney?.stage6_completion?.rewardBadge?.stars).toBe(3)
      expect(normalized.sixStageJourney?.stage6_completion?.rewardBadge?.xp).toBe(100)
    })

    it('populates reward from island curriculum registry when editing standard curriculum lessons', () => {
      const draft: LectureDraft = {
        id: 'bai-1-1',
        title: 'Bài 1.1 — Một từ hay năm từ?',
        skill: '',
        hook: '',
        practiceKind: 'intro',
        videoUrl: '',
        concept: '',
        example: '',
        learnCards: [],
        reward: '',
        duration: '',
        goalsText: '',
        gameType: 'data-runner',
        gameMode: 'required',
        gameAllowedTypes: ['data-runner'],
        gameDifficulty: 'steady',
        gameInstruction: '',
        gameOutcome: '',
        gameCardsText: '',
        gameStructuredText: '',
        questionCount: 3,
        practiceInstruction: '',
        product: '',
        practiceStepsText: '',
        successCriteriaText: '',
        reflectionPrompt: '',
        practiceConfigText: '',
        checkQuestions: [],
        checkQuestion: '',
        checkOption1: '',
        checkOption2: '',
        checkOption3: '',
        correctIndex: '0',
        checkExplain: '',
        lessonFormat: 'aiki-island-6steps',
      }

      const normalized = normalizeLectureDraft(draft)

      expect(normalized.reward).toBe('Huy hiệu Bài 1.1 — Một từ hay năm từ?')
      expect(normalized.sixStageJourney?.stage6_completion?.rewardBadge?.name).toBe('Huy hiệu Bài 1.1 — Một từ hay năm từ?')
    })
  })

  describe('station-achievements.json contract & contents', () => {
    const jsonPath = path.resolve(__dirname, '../../../../data-export/station-achievements.json')
    const sqlPath = path.resolve(__dirname, '../../../../data-export/station-achievements.sql')

    it('exports 32 achievements matching the import contract', () => {
      expect(fs.existsSync(jsonPath)).toBe(true)
      const raw = fs.readFileSync(jsonPath, 'utf-8')
      const parsed = JSON.parse(raw)
      const items = Array.isArray(parsed) ? parsed : parsed.items

      // 22 island lessons + 10 golden rules = 32 achievements
      expect(items).toHaveLength(32)

      // Count island vs rules
      const islandItems = items.filter((item: any) => item.displayConfig?.category === 'station_completion' && item.displayConfig?.islandNumber > 0)
      const ruleItems = items.filter((item: any) => item.displayConfig?.category === 'station_completion' && item.displayConfig?.islandNumber === 0)

      expect(islandItems).toHaveLength(22)
      expect(ruleItems).toHaveLength(10)

      // Validate contract structure for every item
      for (const item of items) {
        expect(item.runtimeKey).toMatch(/^achievement\.station\./)
        expect(item.code).toMatch(/^station-/)
        expect(item.name).toBeTruthy()
        expect(item.description).toBeTruthy()
        expect(item.assets).toBeDefined()
        expect(typeof item.assets.icon).toBe('string')
        expect(typeof item.assets.thumbnail).toBe('string')

        expect(item.displayConfig).toBeDefined()
        expect(item.displayConfig.category).toBe('station_completion')
        expect(item.displayConfig.badgeTier).toBe('bronze')
        expect(item.displayConfig.stars).toBe(3)
        expect(item.displayConfig.xp).toBe(50)
        expect(typeof item.displayConfig.islandNumber).toBe('number')
        expect(typeof item.displayConfig.lessonNumber).toBe('string')

        expect(item.unlockRule).toBeDefined()
        expect(item.unlockRule.type).toBe('action')
        expect(item.unlockRule.metric).toBe('lesson.completed')
        expect(item.unlockRule.stationSlug).toBeTruthy()
        expect(item.unlockRule.lessonId).toBeTruthy()

        expect(item.content).toBeDefined()
        expect(item.content.migratedFrom).toBe('station_curriculum')
        expect(item.content.stationId).toBeTruthy()
        expect(item.content.slug).toBeTruthy()
        expect(item.content.xpReward).toBe(50)
        expect(item.content.stars).toBe(3)
      }
    })

    it('has a valid SQL migration file for gamification_studio_items', () => {
      expect(fs.existsSync(sqlPath)).toBe(true)
      const sql = fs.readFileSync(sqlPath, 'utf-8')
      expect(sql).toContain('INSERT INTO gamification_studio_items')
      expect(sql).toContain('station-bai-1-1-mot-tu-hay-nam-tu')
      expect(sql).toContain('station-rule-1')
      expect(sql).toContain('station-rule-10')
      expect(sql).toContain('ON CONFLICT (code, version) DO UPDATE SET')
    })

    it('matches generated output of generateStationAchievements function', () => {
      const generated = generateStationAchievements()
      expect(generated).toHaveLength(32)
      expect(generated[0].code).toBe('station-bai-1-1-mot-tu-hay-nam-tu')
      expect(generated[0].name).toBe('Huy hiệu Bài 1.1 — Một từ hay năm từ?')
      expect(generated[22].code).toBe('station-rule-1')
      expect(generated[22].name).toBe('Huy hiệu Quy tắc 1 — Nghĩ ý tưởng trước khi hỏi AI')
    })
  })
})
