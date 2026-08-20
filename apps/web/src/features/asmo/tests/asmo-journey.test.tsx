import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router'
import { describe, it, expect } from 'vitest'
import { ASMO_JOURNEY_TOPICS } from '../data/asmo-journey-topics'
import { AsmoLearningJourneyPage } from '../pages/AsmoLearningJourneyPage'
import { AsmoMathVisualizer } from '../components/AsmoMathVisualizer'
import { AsmoExamAuditModal } from '../components/AsmoExamAuditModal'
import { ASMO_SAMPLE_EXAMS } from '../data/asmo-sample-exams'
import { autoRepairExam } from '../lib/asmo-audit-engine'

describe('ASMO 3D Learning Journey & Topics', () => {
  it('defines exactly 12 core Olympic topics with 3 pedagogical levels each', () => {
    expect(ASMO_JOURNEY_TOPICS.length).toBe(12)

    const topicIds = ASMO_JOURNEY_TOPICS.map((t) => t.id)
    expect(topicIds).toContain('cube-cluster')
    expect(topicIds).toContain('interactive-clock')
    expect(topicIds).toContain('shaded-fractions')
    expect(topicIds).toContain('balance-scale')
    expect(topicIds).toContain('matchstick-geometry')
    expect(topicIds).toContain('grid-maze')
    expect(topicIds).toContain('cube-nets')
    expect(topicIds).toContain('algebra-viete')
    expect(topicIds).toContain('trigonometry')
    expect(topicIds).toContain('exp-logarithm')
    expect(topicIds).toContain('combinatorics-probability')
    expect(topicIds).toContain('number-theory-divisibility')

    ASMO_JOURNEY_TOPICS.forEach((topic) => {
      expect(topic.title).toBeTruthy()
      expect(topic.icon).toBeTruthy()
      expect(topic.subject).toBeTruthy()
      expect(topic.gradeTier).toBeTruthy()
      expect(topic.targetGrades.length).toBeGreaterThan(0)
      expect(topic.description).toBeTruthy()

      // Validate all 3 levels (1, 2, 3)
      ;([1, 2, 3] as const).forEach((lvl) => {
        const lvlData = topic.levels[lvl]
        expect(lvlData).toBeDefined()
        expect(lvlData.problem).toBeDefined()
        expect(lvlData.problem.options.length).toBeGreaterThanOrEqual(4)
        expect(lvlData.problem.correctAnswer).toBeTruthy()
        const matchingOpt = lvlData.problem.options.find(
          (o) => o.id === lvlData.problem.correctAnswer || o.label === lvlData.problem.correctAnswer,
        )
        expect(matchingOpt).toBeDefined()

        // Validate 3 pedagogical steps
        expect(lvlData.analysisStep.title).toBeTruthy()
        expect(lvlData.analysisStep.description).toBeTruthy()
        expect(lvlData.methodStep.title).toBeTruthy()
        expect(lvlData.methodStep.description).toBeTruthy()
        expect(lvlData.calcStep.title).toBeTruthy()
        expect(lvlData.calcStep.description).toBeTruthy()
        expect(lvlData.meeAdvice).toBeTruthy()
      })
    })
  })

  it('renders AsmoLearningJourneyPage with initial layout and 12 topic cards', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/asmo/journey'] },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/asmo/journey',
            element: createElement(AsmoLearningJourneyPage),
          }),
        ),
      ),
    )

    expect(markup).toContain('Chặng Học Olympic 3D')
    expect(markup).toContain('Khám Phá 12 Chuyên Đề Trọng Điểm ASMO')
    expect(markup).toContain('Đếm Khối Lập Phương 3D')
    expect(markup).toContain('Phân Tích Giải Bài 3 Bước Sư Phạm')
    expect(markup).toContain('Khởi động')
    expect(markup).toContain('Lời Khuyên Của Mèo Mee')
  })

  it('renders AsmoLearningJourneyPage with specific topic route param', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/asmo/journey/algebra-viete'] },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/asmo/journey/:topicId',
            element: createElement(AsmoLearningJourneyPage),
          }),
        ),
      ),
    )

    expect(markup).toContain('Đại Số, Phương Trình Bậc Hai')
    expect(markup).toContain('Rút Gọn Biểu Thức Hiệu Hai Bình Phương')
    expect(markup).toContain('Mô Phỏng Toán Học Tương Tác')
  })

  it('renders AsmoMathVisualizer for dynamic mathematical models', () => {
    const algMarkup = renderToStaticMarkup(
      createElement(AsmoMathVisualizer, { topicId: 'algebra-viete', level: 1 }),
    )
    expect(algMarkup).toContain('Mô Phỏng Toán Học Tương Tác')
    expect(algMarkup).toContain('algebra-viete')

    const trigMarkup = renderToStaticMarkup(
      createElement(AsmoMathVisualizer, { topicId: 'trigonometry', level: 2 }),
    )
    expect(trigMarkup).toContain('Góc quay:')
    expect(trigMarkup).toContain('sin=')

    const expMarkup = renderToStaticMarkup(
      createElement(AsmoMathVisualizer, { topicId: 'exp-logarithm', level: 2 }),
    )
    expect(expMarkup).toContain('y = 2ˣ')
    expect(expMarkup).toContain('y = log₂x')

    const diceMarkup = renderToStaticMarkup(
      createElement(AsmoMathVisualizer, { topicId: 'combinatorics-probability', level: 2 }),
    )
    expect(diceMarkup).toContain('Ma trận 36 biến cố')

    const numMarkup = renderToStaticMarkup(
      createElement(AsmoMathVisualizer, { topicId: 'number-theory-divisibility', level: 1 }),
    )
    expect(numMarkup).toContain('Chu kỳ tận cùng 2ⁿ')
  })

  it('renders AsmoExamAuditModal with updated UI/UX: single icon 🛠️ Sửa Nhanh and 100/100 standard badge', () => {
    const perfectExam = autoRepairExam(ASMO_SAMPLE_EXAMS[0])
    const markup = renderToStaticMarkup(
      createElement(AsmoExamAuditModal, {
        isOpen: true,
        onClose: () => {},
        exam: perfectExam,
      }),
    )

    expect(markup).toContain('Thẩm Định Đề Thi ASMO')
    expect(markup).toContain('Đã Đạt Chuẩn 100/100')
    expect(markup).toContain('🛠️ Sửa Nhanh')
    expect(markup).not.toContain('🛠️ Sửa Tự Động Câu Này')
  })
})
