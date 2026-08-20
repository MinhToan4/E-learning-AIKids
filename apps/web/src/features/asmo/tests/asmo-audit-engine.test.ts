import { describe, it, expect } from 'vitest'
import {
  auditFormulaAndSyntax,
  auditMathConsistency,
  auditPedagogicalSolution,
  auditTaxonomyAndDomain,
  auditAsmoQuestion,
  auditAsmoExam,
  auditAsmoQuestionBank,
  autoRepairQuestion,
  autoRepairExam,
} from '../lib/asmo-audit-engine'
import { ASMO_SAMPLE_EXAMS } from '../data/asmo-sample-exams'
import type { AsmoExam, AsmoQuestion } from '../types'

describe('ASMO Core Audit Engine (Formula, Syntax, Consistency, Pedagogical, Taxonomy)', () => {
  // ── 1. FORMULA & SYNTAX AUDITOR ──
  describe('Formula & Syntax Auditor', () => {
    it('should pass on valid, beautifully formatted KaTeX formulas', () => {
      const validQ: AsmoQuestion = {
        id: 'test-q-01',
        subject: 'math',
        grade: 11,
        topicCode: 'MATH_CALCULUS',
        topicName: 'Giải Tích & Tích Phân',
        domainType: 'FORMULA',
        title: 'Câu 1: Tính diện tích $S = \\int_{-2}^2 (4 - x^2) \\, dx$',
        text: 'Tính giá trị tích phân: $S = \\int_{-2}^2 (4 - x^2) \\, dx$.\n(Evaluate the integral: $S = \\int_{-2}^2 (4 - x^2) \\, dx$.)',
        options: [
          { id: 'A', label: 'A', text: '$\\frac{32}{3}$' },
          { id: 'B', label: 'B', text: '$\\frac{31}{3}$' },
          { id: 'C', label: 'C', text: '$\\frac{33}{3}$' },
          { id: 'D', label: 'D', text: '$\\frac{34}{3}$' },
        ],
        correctAnswer: 'A',
        points: 4,
        explanation: 'Ta có $S = 2\\left[4x - \\frac{x^3}{3}\\right]_0^2 = \\frac{32}{3}$.',
        meeHint: 'Mèo Mee gợi ý: Con hãy áp dụng công thức Newton-Leibniz cho hàm chẵn nhé!',
        explanationSteps: [
          { stepIndex: 0, title: 'Bước 1: Phân tích', description: 'Hàm số $f(x) = 4 - x^2$ là hàm chẵn trên $[-2, 2]$.' },
          { stepIndex: 1, title: 'Bước 2: Phương pháp', description: 'Áp dụng công thức nguyên hàm cơ bản.' },
          { stepIndex: 2, title: 'Bước 3: Kết luận', description: 'Tính toán ra kết quả $S = \\frac{32}{3}$. Chọn đáp án A.' },
        ],
      }

      const { issues, formulaCount } = auditFormulaAndSyntax(validQ, 1)
      const errors = issues.filter((i) => i.severity === 'error')
      expect(errors).toHaveLength(0)
      expect(formulaCount).toBeGreaterThanOrEqual(4)
    })

    it('should catch unclosed dollar delimiters ($)', () => {
      const brokenQ: AsmoQuestion = {
        id: 'test-q-broken-dollar',
        subject: 'math',
        grade: 1,
        topicCode: 'MATH_ARITHMETIC',
        topicName: 'Số học',
        title: 'Câu 1',
        text: 'Tính giá trị: $x + y = z (thiếu dấu đóng dollar)',
        options: [
          { id: 'A', label: 'A', text: '8' },
          { id: 'B', label: 'B', text: '9' },
        ],
        correctAnswer: 'A',
        points: 4,
        explanation: 'x + y = z',
        meeHint: 'Gợi ý giải bài toán số học cơ bản',
      }


      const { issues } = auditFormulaAndSyntax(brokenQ, 1)
      const unclosedIssue = issues.find((i) => i.id.includes('unclosed-dollar'))
      expect(unclosedIssue).toBeDefined()
      expect(unclosedIssue?.severity).toBe('error')
    })

    it('should catch invalid KaTeX syntax (e.g. unclosed fraction or broken brace)', () => {
      const syntaxErrQ: AsmoQuestion = {
        id: 'test-q-katex-error',
        subject: 'math',
        grade: 10,
        topicCode: 'MATH_ALGEBRA',
        topicName: 'Đại số',
        title: 'Câu 1',
        text: 'Rút gọn biểu thức: $\\frac{1}{2 + \\sqrt{3$', // missing closing brace
        options: [
          { id: 'A', label: 'A', text: '$2 - \\sqrt{3}$' },
          { id: 'B', label: 'B', text: '$2 + \\sqrt{3}$' },
        ],
        correctAnswer: 'A',
        points: 4,
        explanation: 'Trục căn thức ở mẫu',
        meeHint: 'Mèo Mee gợi ý: Con hãy nhân cả tử và mẫu với lượng liên hợp nhé!',
      }

      const { issues } = auditFormulaAndSyntax(syntaxErrQ, 1)
      const katexErr = issues.find((i) => i.id.includes('katex-render-err'))
      expect(katexErr).toBeDefined()
      expect(katexErr?.severity).toBe('error')
    })

    it('should flag raw multi-digit exponent warning without braces (e.g. 3^10)', () => {
      const rawExpQ: AsmoQuestion = {
        id: 'test-q-raw-exp',
        subject: 'math',
        grade: 11,
        topicCode: 'MATH_EXP_LOG',
        topicName: 'Mũ & Logarit',
        title: 'Câu 1',
        text: 'Tính giá trị: $3^10 + 27^5$', // 3^10 should be 3^{10}
        options: [
          { id: 'A', label: 'A', text: '100' },
          { id: 'B', label: 'B', text: '200' },
        ],
        correctAnswer: 'A',
        points: 4,
        explanation: 'Giải bài toán lũy thừa',
        meeHint: 'Gợi ý giải bài toán lũy thừa cơ bản',
      }

      const { issues } = auditFormulaAndSyntax(rawExpQ, 1)
      const expWarn = issues.find((i) => i.id.includes('raw-exponent'))
      expect(expWarn).toBeDefined()
      expect(expWarn?.severity).toBe('warning')
    })
  })

  // ── 2. MATH CONSISTENCY & DISTRACTORS AUDITOR ──
  describe('Math Consistency & Solver Auditor', () => {
    it('should detect duplicate option texts', () => {
      const dupOptQ: AsmoQuestion = {
        id: 'test-dup-opt',
        subject: 'math',
        grade: 1,
        topicCode: 'MATH_LOGIC',
        topicName: 'Logic',
        title: 'Câu 1: How many balls?',
        text: 'Có tất cả bao nhiêu quả bóng?',
        options: [
          { id: 'A', label: 'A', text: '10' },
          { id: 'B', label: 'B', text: '10' }, // Duplicate text
          { id: 'C', label: 'C', text: '12' },
          { id: 'D', label: 'D', text: '14' },
        ],
        correctAnswer: 'A',
        points: 4,
        explanation: 'Có 10 quả bóng',
        meeHint: 'Gợi ý đếm bóng từ trái sang phải',
      }

      const issues = auditMathConsistency(dupOptQ, 1)
      const dupIssue = issues.find((i) => i.id.includes('text-duplicate'))
      expect(dupIssue).toBeDefined()
      expect(dupIssue?.severity).toBe('error')
    })

    it('should detect dummy distractor blacklist items (e.g. "Không xác định")', () => {
      const dummyQ: AsmoQuestion = {
        id: 'test-dummy-distractor',
        subject: 'math',
        grade: 2,
        topicCode: 'MATH_LOGIC',
        topicName: 'Logic',
        title: 'Câu 1: Tìm quy luật dãy số',
        text: 'Tìm số tiếp theo trong dãy số 2, 4, 6, 8, ...',
        options: [
          { id: 'A', label: 'A', text: '10' },
          { id: 'B', label: 'B', text: '12' },
          { id: 'C', label: 'C', text: 'Không xác định' }, // Dummy option
          { id: 'D', label: 'D', text: 'Tất cả đều sai' }, // Dummy option
        ],
        correctAnswer: 'A',
        points: 4,
        explanation: 'Quy luật cộng thêm 2',
        meeHint: 'Gợi ý đếm cách đều 2 đơn vị',
      }

      const issues = auditMathConsistency(dummyQ, 1)
      const dummyIssues = issues.filter((i) => i.id.includes('dummy-distractor'))
      expect(dummyIssues.length).toBeGreaterThanOrEqual(2)
      expect(dummyIssues[0].severity).toBe('error')
    })

    it('should detect mismatch when correctAnswer is not in options', () => {
      const mismatchQ: AsmoQuestion = {
        id: 'test-mismatch-ans',
        subject: 'math',
        grade: 3,
        topicCode: 'MATH_ARITHMETIC',
        topicName: 'Số học',
        title: 'Câu 1: Tính tổng',
        text: 'Tính tổng 100 + 200',
        options: [
          { id: 'A', label: 'A', text: '300' },
          { id: 'B', label: 'B', text: '400' },
          { id: 'C', label: 'C', text: '500' },
          { id: 'D', label: 'D', text: '600' },
        ],
        correctAnswer: 'E', // E is not in options!
        points: 4,
        explanation: '100 + 200 = 300',
        meeHint: 'Gợi ý cộng hàng trăm',
      }

      const issues = auditMathConsistency(mismatchQ, 1)
      const mismatchIssue = issues.find((i) => i.id.includes('correctAnswer-mismatch'))
      expect(mismatchIssue).toBeDefined()
      expect(mismatchIssue?.severity).toBe('error')
    })
  })

  // ── 3. PEDAGOGICAL SOLUTION AUDITOR ──
  describe('Pedagogical Solution Auditor', () => {
    it('should warn when explanationSteps has fewer than 3 steps', () => {
      const shortStepsQ: AsmoQuestion = {
        id: 'test-short-steps',
        subject: 'math',
        grade: 1,
        topicCode: 'MATH_LOGIC',
        topicName: 'Logic',
        title: 'Câu 1: Đếm số',
        text: 'Đếm số lượng quả táo',
        options: [
          { id: 'A', label: 'A', text: '5' },
          { id: 'B', label: 'B', text: '6' },
        ],
        correctAnswer: 'A',
        points: 4,
        explanation: 'Có 5 quả táo',
        meeHint: 'Đếm từng quả một',
        explanationSteps: [
          { stepIndex: 0, title: 'Bước 1: Đếm', description: 'Có 5 quả táo' }, // only 1 step
        ],
      }

      const issues = auditPedagogicalSolution(shortStepsQ, 1)
      const stepWarn = issues.find((i) => i.id.includes('explanationSteps-insufficient'))
      expect(stepWarn).toBeDefined()
      expect(stepWarn?.severity).toBe('warning')
    })

    it('should warn when meeHint directly gives away the answer letter', () => {
      const giveawayQ: AsmoQuestion = {
        id: 'test-giveaway-hint',
        subject: 'math',
        grade: 1,
        topicCode: 'MATH_LOGIC',
        topicName: 'Logic',
        title: 'Câu 1',
        text: 'Tính 1 + 1',
        options: [
          { id: 'A', label: 'A', text: '2' },
          { id: 'B', label: 'B', text: '3' },
        ],
        correctAnswer: 'A',
        points: 4,
        explanation: '1 + 1 = 2',
        meeHint: 'Mèo Mee gợi ý: Con hãy chọn ngay A.', // direct giveaway
      }

      const issues = auditPedagogicalSolution(giveawayQ, 1)
      const hintWarn = issues.find((i) => i.id.includes('meeHint-direct-answer'))
      expect(hintWarn).toBeDefined()
      expect(hintWarn?.severity).toBe('warning')
    })
  })

  // ── 4. TAXONOMY & DOMAIN TYPE AUDITOR ──
  describe('Taxonomy & Domain Type Auditor', () => {
    it('should warn when GEOMETRY_VISUAL question lacks visual diagram/renderSpec', () => {
      const geomNoVisualQ: AsmoQuestion = {
        id: 'test-geom-no-visual',
        subject: 'math',
        grade: 1,
        topicCode: 'MATH_GEOMETRY_3D',
        topicName: 'Hình học không gian 3D',
        domainType: 'GEOMETRY_VISUAL',
        title: 'Câu 1: Đếm số khối lập phương',
        text: 'Có bao nhiêu khối lập phương trong hình vẽ?',
        options: [
          { id: 'A', label: 'A', text: '4' },
          { id: 'B', label: 'B', text: '5' },
        ],
        correctAnswer: 'A',
        points: 4,
        explanation: 'Có 4 khối',
        meeHint: 'Gợi ý quan sát từng tầng',
        // renderSpec, svgDiagramKey, and imageUrl are missing!
      }

      const issues = auditTaxonomyAndDomain(geomNoVisualQ, 1)
      const visualWarn = issues.find((i) => i.id.includes('geometry-no-visual'))
      expect(visualWarn).toBeDefined()
      expect(visualWarn?.severity).toBe('warning')
    })
  })

  // ── 5. FULL EXAM & QUESTION BANK QUALITY GATE AUDIT ──
  describe('Full Exam & Question Bank Quality Gate', () => {
    it('should audit benchmark Grade 1 Exam (asmo-math-g1-2020-r1) with 0 errors and high score', () => {
      const g1Exam = ASMO_SAMPLE_EXAMS.find((e) => e.id === 'asmo-math-g1-2020-r1')
      expect(g1Exam).toBeDefined()

      const audit = auditAsmoExam(g1Exam!)
      expect(audit.totalQuestions).toBe(25)
      expect(audit.errorCount).toBe(0)
      expect(audit.qualityScore).toBeGreaterThanOrEqual(90)
      expect(audit.status).toBe('pass')
      expect(audit.formulasChecked).toBeGreaterThanOrEqual(50)
    })

    it('should audit benchmark Grade 11 Exam (asmo-math-g11-2023-r1) with 0 errors', () => {
      const g11Exam = ASMO_SAMPLE_EXAMS.find((e) => e.id === 'asmo-math-g11-2023-r1')
      expect(g11Exam).toBeDefined()

      const audit = auditAsmoExam(g11Exam!)
      expect(audit.totalQuestions).toBe(25)
      expect(audit.errorCount).toBe(0)
      expect(audit.qualityScore).toBeGreaterThanOrEqual(90)
    })

    it('should audit ALL 100 exams across the entire question bank and ensure 0 critical errors', () => {
      const bankSummary = auditAsmoQuestionBank(ASMO_SAMPLE_EXAMS)

      expect(bankSummary.totalExams).toBe(100)
      expect(bankSummary.totalQuestions).toBe(2784)
      expect(bankSummary.totalErrors).toBe(0)
      expect(bankSummary.averageQualityScore).toBe(100)
      expect(bankSummary.totalFormulasChecked).toBeGreaterThan(2000)
    })
  })

  // ── 6. AUTO REPAIR ENGINE (1-CLICK REPAIR) ──
  describe('Auto Repair Engine (1-Click Auto-Repair)', () => {
    it('should auto-repair a question with broken syntax, short steps and improper topic/meeHint', () => {
      const flawedQuestion: AsmoQuestion = {
        id: 'test-flawed-q',
        subject: 'math',
        grade: 11,
        topicCode: 'MATH_ALGEBRA',
        topicName: 'Phương Trình Mũ & Logarit', // Mismatched topic for quadratic equation
        domainType: 'GEOMETRY_VISUAL', // Geometry visual without renderSpec
        title: 'Câu 1: The quadratic equation $2x^2 - x - 15 = 0$ has roots $\\alpha$',
        text: 'The quadratic equation $2x^2 - x - 15 = 0$ has roots $\\alpha$ and $\\beta$. Find the sum: $3^10 + 27^5$.',
        options: [
          { id: 'A', label: 'A', text: '$\\frac{32}{3}$' },
          { id: 'B', label: 'B', text: '$\\frac{31}{3}$' },
        ],
        correctAnswer: 'A',
        points: 4,
        explanation: '$\\frac{2}{\\alpha} + \\frac{2}{\\beta} = 2*(\\alpha + \\beta)/(\\alpha * \\beta)$',
        meeHint: 'chọn ngay A.',
        explanationSteps: [
          { stepIndex: 0, title: 'Bước 1', description: 'Đếm' },
        ],
      }

      const repaired = autoRepairQuestion(flawedQuestion)

      // Verify domainType normalized to FORMULA (no 3D spec)
      expect(repaired.domainType).toBe('FORMULA')

      // Verify topic synchronized to Viète
      expect(repaired.topicCode).toBe('MATH_QUADRATIC')
      expect(repaired.topicName).toBe('Phương Trình Bậc Hai & Viète')

      // Verify MeeHint normalized without giveaway
      expect(repaired.meeHint).toContain('Viète')
      expect(repaired.meeHint).not.toContain('chọn ngay A')

      // Verify 3 Pedagogical Steps generated
      expect(repaired.explanationSteps).toHaveLength(3)
      expect(repaired.explanationSteps?.[0].title).toBe('Bước 1: Phân tích đề bài & Dữ kiện')
      expect(repaired.explanationSteps?.[1].title).toBe('Bước 2: Thiết lập phương pháp & Công thức')
      expect(repaired.explanationSteps?.[2].title).toBe('Bước 3: Thực hiện tính toán & Kết luận')

      // Verify repaired question passes audit with 100/100 score
      const auditRes = auditAsmoQuestion(repaired, 1)
      expect(auditRes.errorCount).toBe(0)
      expect(auditRes.warningCount).toBe(0)
      expect(auditRes.score).toBe(100)
    })

    it('should auto-repair an entire exam to 100/100 Quality Score', () => {
      const flawedExam: AsmoExam = {
        id: 'test-flawed-exam',
        code: 'ASMO-MATH-TEST',
        title: 'Đề Thi Thử Nghiệm',
        subject: 'math',
        grade: 11,
        year: 2024,
        round: 'School',
        durationMinutes: 60,
        passScore: 60,
        totalPoints: 100,
        description: 'Đề thi thử nghiệm chuẩn Olympic ASMO',
        questions: [
          {
            id: 'q1',
            subject: 'math',
            grade: 11,
            topicCode: 'MATH_CALCULUS',
            topicName: 'Giải Tích & Tích Phân',
            title: 'Câu 1: Tính diện tích $S = \\int_{-2}^2 (4 - x^2) \\, dx$',
            text: 'Tính giá trị: $S = \\int_{-2}^2 (4 - x^2) \\, dx$.',
            options: [
              { id: 'A', label: 'A', text: '$\\frac{32}{3}$' },
              { id: 'B', label: 'B', text: '$\\frac{31}{3}$' },
            ],
            correctAnswer: 'A',
            points: 4,
            explanation: 'Tính diện tích hình phẳng',
            meeHint: 'Gợi ý giải bài',
          },
        ],
      }

      const repairedExam = autoRepairExam(flawedExam)
      const auditRes = auditAsmoExam(repairedExam)
      expect(auditRes.errorCount).toBe(0)
      expect(auditRes.warningCount).toBe(0)
      expect(auditRes.qualityScore).toBe(100)
      expect(auditRes.status).toBe('pass')
    })
  })
})

