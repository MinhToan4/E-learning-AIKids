import { describe, it, expect } from 'vitest'
import katex from 'katex'
import { KATEX_MACROS, normalizeMathFormula } from '../components/AsmoFormula'
import { ASMO_SAMPLE_EXAMS } from '../data/asmo-sample-exams'

describe('ASMO KaTeX & Exam Quality Gate Audit', () => {
  it('should load all 100 exams and verify 2,784 total questions', () => {
    expect(ASMO_SAMPLE_EXAMS).toBeDefined()
    expect(ASMO_SAMPLE_EXAMS.length).toBe(100)

    const totalQuestions = ASMO_SAMPLE_EXAMS.reduce((acc, exam) => acc + (exam.questions ? exam.questions.length : 0), 0)
    expect(totalQuestions).toBe(2784)
  })

  it('should render 100% of KaTeX formulas across all 2,784 questions with 0 syntax errors', () => {
    let checkedFormulas = 0
    const errors: Array<{ examId: string; qId: string; formula: string; error: string }> = []

    for (const exam of ASMO_SAMPLE_EXAMS) {
      for (const q of exam.questions) {
        const fields: string[] = [q.title, q.text, q.explanation, q.meeHint]
        if (q.options) {
          for (const opt of q.options) {
            fields.push(opt.text)
          }
        }
        if (q.explanationSteps) {
          for (const step of q.explanationSteps) {
            fields.push(step.title)
            fields.push(step.description)
          }
        }

        for (const field of fields) {
          if (!field) continue
          const mathMatches = field.match(/(?<!\\)\$\$([\s\S]+?)(?<!\\)\$\$|(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g) || []
          for (const m of mathMatches) {
            checkedFormulas++
            const math = m.replace(/^\$\$|\$\$$|^\$|\$$/g, '').trim()
            try {
              const clean = normalizeMathFormula(math)
              katex.renderToString(clean, { throwOnError: true, macros: KATEX_MACROS, strict: false })
            } catch (err: unknown) {
              errors.push({
                examId: exam.id,
                qId: q.id,
                formula: math,
                error: err instanceof Error ? err.message : String(err),
              })
            }
          }
        }
      }
    }

    expect(checkedFormulas).toBeGreaterThan(500)
    expect(errors).toEqual([])
  })

  it('should have 0 dummy or placeholder options across all 2,784 questions', () => {
    const dummyPhrases = [
      'Không xác định',
      'Không xác định được',
      'Không có đáp án phù hợp',
      'Không có đáp án đúng',
      'Tất cả đều sai',
      'Đáp án khác',
      'None of the above',
      'Khẳng định đúng theo chuẩn ASMO',
      'Khẳng định chưa chính xác',
      'Thiếu điều kiện cần thiết',
      'DETAILED SOLUTION',
      'Dữ kiện chưa đủ',
      'Vô nghiệm',
    ]

    const violations: Array<{ examId: string; qId: string; optId: string; text: string }> = []

    for (const exam of ASMO_SAMPLE_EXAMS) {
      for (const q of exam.questions) {
        for (const opt of q.options || []) {
          const t = (opt.text || '').trim()
          for (const phrase of dummyPhrases) {
            if (t.toLowerCase() === phrase.toLowerCase()) {
              violations.push({ examId: exam.id, qId: q.id, optId: opt.id, text: t })
            }
          }
        }
      }
    }

    expect(violations).toEqual([])
  })

  it('should verify specific Grade 11 standardizations (Câu 4, Câu 20, Câu 22, Câu 25)', () => {
    const g11Exam = ASMO_SAMPLE_EXAMS.find((e) => e.id === 'asmo-math-g11-2023-r1')
    expect(g11Exam).toBeDefined()

    // 1. Grade 11 Câu 4
    const q04 = g11Exam?.questions.find((q) => q.id === 'asmo-math-g11-2023-r1-q04')
    expect(q04).toBeDefined()
    expect(q04?.text).toContain('\\sqrt{12} - \\sqrt{75} + \\sqrt{108}')
    expect(q04?.options.map((o) => o.text)).toEqual(['$3\\sqrt{3}$', '$3\\sqrt{3} + 1$', '$2\\sqrt{3}$', '$4\\sqrt{3}$'])
    expect(q04?.correctAnswer).toBe('A')

    // 2. Grade 11 Câu 20
    const q20 = g11Exam?.questions.find((q) => q.id === 'asmo-math-g11-2023-r1-q20')
    expect(q20).toBeDefined()
    expect(q20?.text).toContain('$y = x^2$')
    expect(q20?.topicCode).toBe('MATH_CALCULUS')
    expect(q20?.topicName).toBe('Giải Tích, Giới Hạn & Tích Phân')
    expect(q20?.options.find((o) => o.id === 'A')?.text).toBe('$\\frac{32}{3}$')

    // 3. Grade 11 Câu 22
    const q22 = g11Exam?.questions.find((q) => q.id === 'asmo-math-g11-2023-r1-q22')
    expect(q22).toBeDefined()
    expect(q22?.text).toContain('3^{10} + 27^5')
    expect(q22?.title).toContain('3^{10} + 27^5')
    expect(q22?.correctAnswer).toBe('A')

    // 4. Grade 11 Câu 25
    const q25 = g11Exam?.questions.find((q) => q.id === 'asmo-math-g11-2023-r1-q25')
    expect(q25).toBeDefined()
    expect(q25?.text).toContain('\\sum_{k=1}^n k^3')
    expect(q25?.options.map((o) => o.text)).toEqual([
      '$\\left(\\frac{n(n+1)}{2}\\right)^2$',
      '$\\left(\\frac{n(n+1)}{2}\\right)^2 + 1$',
      '$\\frac{n^2(n+1)}{2}$',
      '$\\frac{n(n+1)(2n+1)}{6}$',
    ])
    expect(q25?.correctAnswer).toBe('A')
  })

  it('should ensure all questions have valid, distinct options and valid answer keys', () => {
    for (const exam of ASMO_SAMPLE_EXAMS) {
      for (const q of exam.questions) {
        expect(q.options).toBeDefined()
        expect([4, 5]).toContain(q.options.length)
        expect(['A', 'B', 'C', 'D', 'E']).toContain(q.correctAnswer)

        const optionLabels = q.options.map((o) => o.label)
        if (q.options.length === 4) {
          expect(optionLabels).toEqual(['A', 'B', 'C', 'D'])
        } else {
          expect(optionLabels).toEqual(['A', 'B', 'C', 'D', 'E'])
        }

        const optionTexts = q.options.map((o) => o.text.trim())
        const uniqueTexts = new Set(optionTexts)
        expect(uniqueTexts.size).toBe(q.options.length)
      }
    }
  })
})
