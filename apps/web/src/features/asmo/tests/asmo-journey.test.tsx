import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router'
import { describe, it, expect } from 'vitest'
import { ASMO_JOURNEY_TOPICS } from '../data/asmo-journey-topics'
import { AsmoLearningJourneyPage, ASMO_TOPIC_GROUPS } from '../pages/AsmoLearningJourneyPage'
import { AsmoQuestionCard } from '../components/AsmoQuestionCard'
import { AsmoMathVisualizer } from '../components/AsmoMathVisualizer'
import { AsmoKidsArithmeticVisualizer } from '../components/AsmoKidsArithmeticVisualizer'
import { AsmoTrigLabVisualizer } from '../components/AsmoTrigLabVisualizer'
import { AsmoExamAuditModal } from '../components/AsmoExamAuditModal'
import { ASMO_SAMPLE_EXAMS } from '../data/asmo-sample-exams'
import { autoRepairExam } from '../lib/asmo-audit-engine'

describe('ASMO 3D Learning Journey & Topics', () => {
  it('defines comprehensive Olympic topics across 3 school tiers (Primary: 12, THCS: 4, THPT: 4)', () => {
    expect(ASMO_JOURNEY_TOPICS.length).toBe(20)

    const primaryTopics = ASMO_JOURNEY_TOPICS.filter((t) => t.gradeTier === 'primary')
    const secondaryTopics = ASMO_JOURNEY_TOPICS.filter((t) => t.gradeTier === 'secondary')
    const highTopics = ASMO_JOURNEY_TOPICS.filter((t) => t.gradeTier === 'high')

    expect(primaryTopics.length).toBe(12)
    expect(secondaryTopics.length).toBe(4)
    expect(highTopics.length).toBe(4)

    const topicIds = ASMO_JOURNEY_TOPICS.map((t) => t.id)
    // 12 Primary topics
    expect(topicIds).toContain('elem-addition')
    expect(topicIds).toContain('elem-subtraction')
    expect(topicIds).toContain('elem-multiplication')
    expect(topicIds).toContain('elem-division')
    expect(topicIds).toContain('cube-cluster')
    expect(topicIds).toContain('interactive-clock')
    expect(topicIds).toContain('shaded-fractions')
    expect(topicIds).toContain('balance-scale')
    expect(topicIds).toContain('matchstick-geometry')
    expect(topicIds).toContain('grid-maze')
    expect(topicIds).toContain('cube-nets')
    expect(topicIds).toContain('elementary-arithmetic')

    // 4 THCS topics
    expect(topicIds).toContain('number-theory-divisibility')
    expect(topicIds).toContain('algebra-polynomials')
    expect(topicIds).toContain('pythagoras-geometry')
    expect(topicIds).toContain('combinatorics-probability')

    // 4 THPT topics
    expect(topicIds).toContain('trigonometry')
    expect(topicIds).toContain('exp-logarithm')
    expect(topicIds).toContain('algebra-viete')
    expect(topicIds).toContain('spatial-polyhedron')

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

  it('validates child-friendly 3-step explanation format for all elementary primary topics', () => {
    const primaryTopics = ASMO_JOURNEY_TOPICS.filter((t) => t.gradeTier === 'primary')
    expect(primaryTopics.length).toBe(12)

    primaryTopics.forEach((topic) => {
      ;([1, 2, 3] as const).forEach((lvl) => {
        const lvlData = topic.levels[lvl]
        expect(lvlData.analysisStep.title).toContain('Đề bài cho gì nhỉ?')
        expect(lvlData.methodStep.title).toContain('Mẹo của Mèo Mee')
        expect(lvlData.calcStep.title).toContain('Cùng tính nào!')
      })
    })
  })

  it('validates Elementary Arithmetic topic with 3 pedagogical levels and child-friendly explanations', () => {
    const arithTopic = ASMO_JOURNEY_TOPICS.find((t) => t.id === 'elementary-arithmetic')
    expect(arithTopic).toBeDefined()
    if (!arithTopic) return

    expect(arithTopic.gradeTier).toBe('primary')
    expect(arithTopic.icon).toBe('🔢')

    // Level 1: Make-10 pairing 1+3+5+7+9 = 25
    const l1 = arithTopic.levels[1]
    expect(l1.problem.title).toContain('Ghép Cặp 10')
    expect(l1.problem.text).toContain('1, 3, 5, 7, 9')
    expect(l1.problem.correctAnswer).toBe('B')
    expect(l1.problem.explanation).toContain('25\\text{ quả táo}')
    expect(l1.problem.meeHint).toContain('1 + 9 = 10')

    // Level 2: Mystery digit in column addition 4☐ + ☐7 = 85
    const l2 = arithTopic.levels[2]
    expect(l2.problem.title).toContain('Cột Dọc')
    expect(l2.problem.text).toContain('4\\square + \\square 7 = 85')
    expect(l2.problem.correctAnswer).toBe('C')
    expect(l2.problem.explanation).toContain('48 + 37 = 85')
    expect(l2.problem.explanation).toContain('8 + 3 = 11')

    // Level 3: Gauss consecutive sum 1+2+...+20 = 210
    const l3 = arithTopic.levels[3]
    expect(l3.problem.title).toContain('Gauss')
    expect(l3.problem.text).toContain('1 + 2 + 3 + \\dots + 19 + 20')
    expect(l3.problem.correctAnswer).toBe('C')
    expect(l3.problem.explanation).toContain('210')
  })

  it('renders AsmoKidsArithmeticVisualizer across all specialized elementary modes (Addition, Subtraction, Multiplication, Division, Make-10, Column, Gauss)', () => {
    // 1. Addition mode
    const addMarkup = renderToStaticMarkup(createElement(AsmoKidsArithmeticVisualizer, { mode: 'addition' }))
    expect(addMarkup).toContain('Giỏ A')
    expect(addMarkup).toContain('Giỏ B')
    expect(addMarkup).toContain('TỔNG SỐ TÁO TRONG CẢ 2 GIỎ')

    // 2. Subtraction mode
    const subMarkup = renderToStaticMarkup(createElement(AsmoKidsArithmeticVisualizer, { mode: 'subtraction' }))
    expect(subMarkup).toContain('Phép trừ trực quan thời gian thực')
    expect(subMarkup).toContain('Bơm Lại Bóng')

    // 3. Multiplication mode
    const mulMarkup = renderToStaticMarkup(createElement(AsmoKidsArithmeticVisualizer, { mode: 'multiplication' }))
    expect(mulMarkup).toContain('Số hàng')
    expect(mulMarkup).toContain('Số cột')
    expect(mulMarkup).toContain('Bảng nhân trực quan')

    // 4. Division mode
    const divMarkup = renderToStaticMarkup(createElement(AsmoKidsArithmeticVisualizer, { mode: 'division' }))
    expect(divMarkup).toContain('Số kẹo')
    expect(divMarkup).toContain('Số đĩa')
    expect(divMarkup).toContain('Kết quả phép chia chia đều')

    // 5. Level 1: Make-10 balloons
    const l1Markup = renderToStaticMarkup(createElement(AsmoKidsArithmeticVisualizer, { level: 1 }))
    expect(l1Markup).toContain('Bí kíp ghép cặp 10 siêu tốc')
    expect(l1Markup).toContain('1 + 3 + 5 + 7 + 9 = ?')
    expect(l1Markup).toContain('Cặp số (1 + 9)')
    expect(l1Markup).toContain('Cặp số (3 + 7)')

    // 6. Level 2: Column addition
    const l2Markup = renderToStaticMarkup(createElement(AsmoKidsArithmeticVisualizer, { level: 2 }))
    expect(l2Markup).toContain('Hàng Chục')
    expect(l2Markup).toContain('Hàng Đơn Vị')
    expect(l2Markup).toContain('Có nhớ 1')

    // 7. Level 3: Gauss rainbow sequence
    const l3Markup = renderToStaticMarkup(createElement(AsmoKidsArithmeticVisualizer, { level: 3 }))
    expect(l3Markup).toContain('Bí mật của thần đồng Gauss')
    expect(l3Markup).toContain('Công thức Gauss tổng quát')
    expect(l3Markup).toContain('210')
  })

  it('renders AsmoMathVisualizer for all advanced topics (Pythagoras, Polynomials, Polyhedrons, etc.) and primary arithmetic', () => {
    // Elementary Arithmetic
    const elemMarkup = renderToStaticMarkup(
      createElement(AsmoMathVisualizer, { topicId: 'elementary-arithmetic', level: 1 }),
    )
    expect(elemMarkup).toContain('Phép Tính Vui Nhộn &amp; Trực Quan Sư Phạm Tiểu Học')

    // Addition
    const addMarkup = renderToStaticMarkup(
      createElement(AsmoMathVisualizer, { topicId: 'elem-addition', level: 1 }),
    )
    expect(addMarkup).toContain('Cộng Táo')

    // Pythagoras & Geometry
    const pythMarkup = renderToStaticMarkup(
      createElement(AsmoMathVisualizer, { topicId: 'pythagoras-geometry', level: 1 }),
    )
    expect(pythMarkup).toContain('Cạnh góc vuông')
    expect(pythMarkup).toContain('Mô Phỏng Toán Học Tương Tác')

    // Algebraic Identities & Polynomials
    const polyMarkup = renderToStaticMarkup(
      createElement(AsmoMathVisualizer, { topicId: 'algebra-polynomials', level: 1 }),
    )
    expect(polyMarkup).toContain('Mô hình diện tích (a + b)²')
    expect(polyMarkup).toContain('(a+b)² = a² + 2ab + b²')

    // Spatial Geometry & Polyhedrons
    const polyhMarkup = renderToStaticMarkup(
      createElement(AsmoMathVisualizer, { topicId: 'spatial-polyhedron', level: 1 }),
    )
    expect(polyhMarkup).toContain('Thể tích khối chóp')
    expect(polyhMarkup).toContain('Định lý Euler đa diện')

    // Algebra & Viète
    const algMarkup = renderToStaticMarkup(
      createElement(AsmoMathVisualizer, { topicId: 'algebra-viete', level: 2 }),
    )
    expect(algMarkup).toContain('Đồ thị Parabol')

    // Exponential & Logarithm
    const expMarkup = renderToStaticMarkup(
      createElement(AsmoMathVisualizer, { topicId: 'exp-logarithm', level: 2 }),
    )
    expect(expMarkup).toContain('y = 2ˣ')
    expect(expMarkup).toContain('y = log₂x')

    // Combinatorics
    const diceMarkup = renderToStaticMarkup(
      createElement(AsmoMathVisualizer, { topicId: 'combinatorics-probability', level: 2 }),
    )
    expect(diceMarkup).toContain('Ma trận 36 biến cố')

    // Number Theory
    const numMarkup = renderToStaticMarkup(
      createElement(AsmoMathVisualizer, { topicId: 'number-theory-divisibility', level: 1 }),
    )
    expect(numMarkup).toContain('Chu kỳ tận cùng')

    // Trigonometry Lab via AsmoMathVisualizer
    const trigMarkup = renderToStaticMarkup(
      createElement(AsmoMathVisualizer, { topicId: 'trigonometry', level: 1 }),
    )
    expect(trigMarkup).toContain('Phòng Thí Nghiệm Lượng Giác ASMO')
    expect(trigMarkup).toContain('Đường Tròn Đơn Vị')
    expect(trigMarkup).toContain('Sin đứng, Cos nằm')
  })

  it('renders AsmoTrigLabVisualizer with Light Clay studio style and KaTeX special angles without raw text leaks', () => {
    const trigMarkup = renderToStaticMarkup(
      createElement(AsmoTrigLabVisualizer, { initialAngle: 30 }),
    )
    expect(trigMarkup).toContain('Phòng Thí Nghiệm Lượng Giác ASMO')
    expect(trigMarkup).toContain('Đường Tròn Đơn Vị')
    expect(trigMarkup).toContain('Góc Phần Tư I')
    expect(trigMarkup).toContain('Trục đứng')
    expect(trigMarkup).toContain('Trục ngang')
    expect(trigMarkup).toContain('Hằng đẳng thức Pythagoras')
    expect(trigMarkup).toContain('Bí kíp Mèo Mee')
    expect(trigMarkup).toContain('katex')
    // Ensure no raw unrendered (frac{pi}{6}) text leak without KaTeX wrapper
    expect(trigMarkup).not.toContain('(frac{pi}{6})')
    expect(trigMarkup).not.toContain('(frac{sqrt{3}}{2})')
  })

  it('renders AsmoLearningJourneyPage with elementary child-friendly 3-step solution tabs and category group tabs', () => {
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
    expect(markup).toContain('Khám Phá Các Chuyên Đề Trọng Điểm ASMO')
    expect(markup).toContain('Phân Nhóm Chuyên Đề Theo Khối Học')
    expect(markup).toContain('Tất Cả')
    expect(markup).toContain('🎒 Tiểu Học')
    expect(markup).toContain('🏫 THCS')
    expect(markup).toContain('🎓 THPT')
    expect(markup).toContain('Lượng Giác &amp; Hình Học')
    expect(markup).toContain('Đại Số &amp; Số Học')
    // Child-friendly 3-step section for elementary
    expect(markup).toContain('🎈 3 BƯỚC KHÁM PHÁ CÙNG MÈO MEE')
    expect(markup).toContain('🔍 1. Đề bài cho gì nhỉ?')
    expect(markup).toContain('💡 2. Mẹo của Mèo Mee')
    expect(markup).toContain('🎉 3. Cùng tính nào!')
  })

  it('renders AsmoQuestionCard with child-friendly 3-step explanation for elementary grades (grade <= 5)', () => {
    const elemQuestion = ASMO_JOURNEY_TOPICS[0].levels[1].problem
    const markup = renderToStaticMarkup(
      createElement(AsmoQuestionCard, {
        question: elemQuestion,
        selectedAnswer: 'B',
        showSolutionImmediately: true,
      }),
    )

    expect(markup).toContain('🎈 3 BƯỚC KHÁM PHÁ CÙNG MÈO MEE')
  })

  it('renders AsmoLearningJourneyPage with specific topic route param', () => {
    const markup = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/asmo/journey/elementary-arithmetic'] },
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

    expect(markup).toContain('Phép Tính Vui Nhộn')
    expect(markup).toContain('Phép Tính Vui Nhộn &amp; Trực Quan Sư Phạm Tiểu Học')
    expect(markup).toContain('Bí Kíp Ghép Cặp 10 Tính Nhẩm Thần Tốc')
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

  it('renders AsmoLearningJourneyPage with unified Visual Solver Walkthrough and Trigonometry Lab Canvas for Level 1', () => {
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

    expect(markup).toContain('TIẾN TRÌNH PHÂN TÍCH BƯỚC GIẢI LIỀN MẠCH')
    expect(markup).toContain('📌 Bước 1: Dữ kiện')
    expect(markup).toContain('⚙️ Bước 2: Phương pháp')
    expect(markup).toContain('🎯 Bước 3: Ra Đáp Án')
    expect(markup).toContain('Biểu đồ ➔ Bước 1 ➔ Bước 2 ➔ Bước 3 ➔')
    expect(markup).toContain('Phòng Thí Nghiệm Lượng Giác ASMO')
  })

  it('renders AsmoTrigLabVisualizer with externalAngle, externalTab and highlighted targets', () => {
    const markup = renderToStaticMarkup(
      createElement(AsmoTrigLabVisualizer, {
        externalAngle: 150,
        externalTab: 'circle',
        highlightTarget: 'sin',
      }),
    )

    expect(markup).toContain('Phòng Thí Nghiệm Lượng Giác ASMO')
    expect(markup).toContain('Góc Phần Tư II')
    expect(markup).toContain('ring-rose-400')
  })

  it('renders AsmoMathVisualizer for all 7 advanced topics in Light Soft Clay theme with KaTeX formulas', () => {
    const topicsToTest = [
      'algebra-viete',
      'pythagoras-geometry',
      'algebra-polynomials',
      'spatial-polyhedron',
      'exp-logarithm',
      'combinatorics-probability',
      'number-theory-divisibility',
    ]

    topicsToTest.forEach((topicId) => {
      const markup = renderToStaticMarkup(
        createElement(AsmoMathVisualizer, {
          topicId,
          level: 1,
        }),
      )

      // Soft Clay Card styling
      expect(markup).toContain('border-brand-200')
      expect(markup).toContain('shadow-clay')
      expect(markup).toContain('rounded-3xl')
      expect(markup).toContain('bg-white')
      // KaTeX formulas rendered
      expect(markup).toContain('katex')
    })
  })

  it('renders AsmoLearningJourneyPage with seamless visual walkthrough progression for all 7 remaining ASMO topics', () => {
    const testCases = [
      'algebra-viete',
      'pythagoras-geometry',
      'algebra-polynomials',
      'spatial-polyhedron',
      'exp-logarithm',
      'combinatorics-probability',
      'number-theory-divisibility',
    ]

    testCases.forEach((topic) => {
      const markup = renderToStaticMarkup(
        createElement(
          MemoryRouter,
          { initialEntries: [`/asmo/journey/${topic}`] },
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

      expect(markup).toContain('TIẾN TRÌNH PHÂN TÍCH BƯỚC GIẢI LIỀN MẠCH')
      expect(markup).toContain('📌 Bước 1: Dữ kiện')
      expect(markup).toContain('⚙️ Bước 2: Phương pháp')
      expect(markup).toContain('🎯 Bước 3: Ra Đáp Án')
      expect(markup).toContain('Lời Khuyên Từ Trợ Giảng AI')
    })
  })
})


