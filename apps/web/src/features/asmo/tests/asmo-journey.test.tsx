import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router'
import { describe, it, expect } from 'vitest'
import { ASMO_JOURNEY_TOPICS } from '../data/asmo-journey-topics'
import { AsmoLearningJourneyPage, ASMO_TOPIC_GROUPS } from '../pages/AsmoLearningJourneyPage'
import { AsmoMathVisualizer } from '../components/AsmoMathVisualizer'
import { AsmoTrigLabVisualizer } from '../components/AsmoTrigLabVisualizer'
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

  it('validates upgraded 3-level Trigonometry questions and pedagogical KaTeX solutions', () => {
    const trigTopic = ASMO_JOURNEY_TOPICS.find((t) => t.id === 'trigonometry')
    expect(trigTopic).toBeDefined()
    if (!trigTopic) return

    // Level 1: Special angles & 4 quadrants signs
    const l1 = trigTopic.levels[1]
    expect(l1.problem.title).toContain('Góc Đặc Biệt')
    expect(l1.problem.text).toContain('150^\\circ')
    expect(l1.problem.correctAnswer).toBe('B')
    expect(l1.problem.explanation).toContain('\\cos(150^\\circ) < 0')

    // Level 2: Double angle sin(x)=1/3 -> cos(2x)=7/9
    const l2 = trigTopic.levels[2]
    expect(l2.problem.title).toContain('\\cos(2x)')
    expect(l2.problem.text).toContain('\\sin(x) = \\frac{1}{3}')
    expect(l2.problem.correctAnswer).toBe('B')
    expect(l2.problem.explanation).toContain('\\frac{7}{9}')
    expect(l2.methodStep.description).toContain('\\cos(2x) = 1 - 2\\sin^2(x)')

    // Level 3: Olympic ASMO tan(x)+cot(x)=8cos(2x) -> x = pi/24
    const l3 = trigTopic.levels[3]
    expect(l3.problem.title).toContain('Olympic')
    expect(l3.problem.text).toContain('\\tan(x) + \\cot(x) = 8\\cos(2x)')
    expect(l3.problem.correctAnswer).toBe('B')
    expect(l3.problem.explanation).toContain('\\frac{\\pi}{24}')
    expect(l3.problem.options.some((o) => o.text.includes('\\frac{\\pi}{24}'))).toBe(true)
  })

  it('renders AsmoTrigLabVisualizer with unit circle, wave grapher, and Grade 11 problem solver', () => {
    const labMarkup = renderToStaticMarkup(
      createElement(AsmoTrigLabVisualizer, { initialAngle: 45 }),
    )

    // Unit Circle checks
    expect(labMarkup).toContain('Phòng Thí Nghiệm Lượng Giác ASMO')
    expect(labMarkup).toContain('Đường Tròn Lượng Giác Động')
    expect(labMarkup).toContain('Trục tan')
    expect(labMarkup).toContain('Trục cot')
    expect(labMarkup).toContain('cos (x)')
    expect(labMarkup).toContain('sin (y)')
    expect(labMarkup).toContain('Kiểm chứng hằng đẳng thức Pythagoras')

    // Wave grapher checks
    expect(labMarkup).toContain('Máy Vẽ Sóng Lượng Giác Đồng Bộ')
    expect(labMarkup).toContain('sin(x)')
    expect(labMarkup).toContain('cos(x)')

    // Formula and Grade 11 demo checks
    expect(labMarkup).toContain('Bảng Công Thức Lượng Giác &amp; Bài Toán Lớp 11')
    expect(labMarkup).toContain('Bài Toán Lớp 11')
    expect(labMarkup).toContain('Đáp số: 7/9')
  })

  it('renders AsmoLearningJourneyPage with category group tabs and topic filters', () => {
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
    expect(markup).toContain('Phân Nhóm Chuyên Đề Trọng Tâm')
    expect(markup).toContain('Tất Cả')
    expect(markup).toContain('Lượng Giác &amp; Hình Học')
    expect(markup).toContain('Đại Số &amp; Mũ-Log')
    expect(markup).toContain('Không Gian 3D')
    expect(markup).toContain('Tổ Hợp &amp; Số Học')
  })

  it('renders AsmoLearningJourneyPage with specific topic route param', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/asmo/journey/trigonometry'] },
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

    expect(markup).toContain('9. Lượng Giác &amp; Biến Đổi')
    expect(markup).toContain('Phòng Thí Nghiệm Lượng Giác ASMO')
    expect(markup).toContain('Giá Trị Lượng Giác Góc Đặc Biệt')
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
    expect(trigMarkup).toContain('Phòng Thí Nghiệm Lượng Giác ASMO')
    expect(trigMarkup).toContain('Đường Tròn Lượng Giác Động')

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
