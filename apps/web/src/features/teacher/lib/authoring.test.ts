import { describe, expect, it } from 'vitest'
import {
  courseDraftReadiness,
  lectureDraftReadiness,
  slugifyAuthoringId,
} from './authoring'

describe('slugifyAuthoringId', () => {
  it('creates a safe id from Vietnamese titles', () => {
    expect(slugifyAuthoringId('  Khóa học Đạo đức AI!  ')).toBe('khoa-hoc-dao-duc-ai')
  })

  it('keeps ids inside the API limit', () => {
    const id = slugifyAuthoringId('Một tiêu đề rất dài '.repeat(8))
    expect(id.length).toBeLessThanOrEqual(40)
    expect(id).not.toMatch(/-$/)
  })
})

describe('courseDraftReadiness', () => {
  const completeDraft = {
    id: 'ke-chuyen-ai',
    title: 'Kể chuyện cùng AI',
    shortTitle: 'Kể chuyện',
    tagline: 'Biến ý tưởng thành câu chuyện',
    description: 'Khóa học giúp trẻ tạo một câu chuyện an toàn và có chủ đích.',
    productLabel: 'Truyện tranh AI',
    ageTrack: 'L1',
    courseKey: 'K1',
    durationLabel: '8 tuần',
    skillsText: 'Viết prompt\nKể chuyện',
    outcomesText: 'Tạo được truyện hoàn chỉnh',
    credential: 'Huy hiệu Nhà kể chuyện',
    finalAssessment: 'Hoàn thành và trình bày một truyện có mở đầu, diễn biến và kết thúc.',
  }

  it('groups missing fields into the same three steps used by the UI', () => {
    const readiness = courseDraftReadiness({ ...completeDraft, title: '', skillsText: '' })

    expect(readiness.complete).toBe(false)
    expect(readiness.steps.map((step) => step.id)).toEqual(['basics', 'outcomes', 'recognition'])
    expect(readiness.steps[0].missing).toContain('Tên khóa học')
    expect(readiness.steps[1].missing).toContain('Kỹ năng đạt được')
    expect(readiness.steps[2].complete).toBe(true)
  })

  it('accepts a course that satisfies the API creation contract', () => {
    expect(courseDraftReadiness(completeDraft)).toMatchObject({
      complete: true,
      completed: 3,
      total: 3,
    })
  })
})

describe('lectureDraftReadiness', () => {
  const completeDraft = {
    id: 'bai-1-prompt-ro-rang',
    title: 'Prompt rõ ràng',
    skill: 'Viết hướng dẫn cho AI',
    hook: 'AI sẽ hiểu thế nào nếu hướng dẫn của em còn mơ hồ?',
    practiceKind: 'journal',
    videoUrl: 'https://www.youtube.com/watch?v=yuuWdm5tBD0',
    concept: 'Một prompt tốt nêu rõ vai trò, nhiệm vụ và kết quả mong muốn.',
    example: 'Hãy đóng vai người kể chuyện và viết ba câu về một chú mèo bay.',
    reward: 'Huy hiệu Prompt sáng',
    duration: '25–35 phút',
    goalsText: 'Nhận ra prompt mơ hồ\nViết prompt đủ ba phần',
    gameType: 'pick',
    gameInstruction: 'Chọn hướng dẫn rõ ràng nhất để nhân vật AI hoàn thành nhiệm vụ.',
    gameOutcome: 'Phân biệt được prompt rõ và prompt mơ hồ.',
    gameCardsText: 'Vẽ một con mèo\nVẽ một con mèo cam đang ngủ trên mái nhà',
    practiceInstruction: 'Viết một prompt ba phần và thử cải thiện sau khi xem kết quả.',
    product: 'Một prompt đã được cải thiện',
    checkQuestion: 'Prompt nào giúp AI hiểu nhiệm vụ rõ nhất?',
    checkOption1: 'Vẽ đẹp nhé',
    checkOption2: 'Vẽ một robot xanh đang tưới cây trong công viên',
    checkOption3: 'Làm gì đó vui',
    correctIndex: '1',
    checkExplain: 'Đáp án nêu rõ nhân vật, hành động và bối cảnh.',
  }

  it('reports station-level gaps instead of one generic error', () => {
    const readiness = lectureDraftReadiness({
      ...completeDraft,
      gameCardsText: 'Chỉ có một thẻ',
      checkOption3: '',
    })

    expect(readiness.complete).toBe(false)
    expect(readiness.steps.find((step) => step.id === 'game')?.missing).toContain('Ít nhất 2 thẻ trò chơi')
    expect(readiness.steps.find((step) => step.id === 'check')?.missing).toContain('3 lựa chọn trả lời')
  })

  it('rejects insecure video links but keeps video optional', () => {
    expect(lectureDraftReadiness({ ...completeDraft, videoUrl: 'http://example.com/video' }).steps[0].missing)
      .toContain('Liên kết video HTTPS')
    expect(lectureDraftReadiness({ ...completeDraft, videoUrl: '' }).steps[0].complete).toBe(true)
  })

  it('accepts a complete four-station lesson', () => {
    expect(lectureDraftReadiness(completeDraft)).toMatchObject({
      complete: true,
      completed: 4,
      total: 4,
    })
  })
})
