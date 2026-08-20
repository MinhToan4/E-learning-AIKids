#!/usr/bin/env node

/**
 * ASMO Question Bank Audit & Quality Gate CLI Runner
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import katex from 'katex'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_PATH = path.resolve(__dirname, '../src/features/asmo/data/asmo-sample-exams.ts')

console.log('\n=============================================================')
console.log('  🔍 OLYMPIAD ASMO QUESTION BANK AUDITOR & QUALITY GATE')
console.log('=============================================================\n')

if (!fs.existsSync(DATA_PATH)) {
  console.error(`[ERROR] Data file not found at: ${DATA_PATH}`)
  process.exit(1)
}

const rawContent = fs.readFileSync(DATA_PATH, 'utf8')
const arrayStart = rawContent.indexOf('= [\n') + 2
const arrayEnd = rawContent.lastIndexOf(']') + 1
const jsonStr = rawContent.substring(arrayStart, arrayEnd)
const exams = JSON.parse(jsonStr)

console.log(`📦 Loaded ${exams.length} exams for quality inspection.\n`)

const DUMMY_DISTRACTOR_BLACKLIST = [
  'không xác định',
  'không xác định được',
  'không có đáp án phù hợp',
  'không có đáp án đúng',
  'tất cả đều sai',
  'đáp án khác',
  'none of the above',
  'khẳng định đúng theo chuẩn asmo',
  'khẳng định chưa chính xác',
  'thiếu điều kiện cần thiết',
  'detailed solution',
  'dữ kiện chưa đủ',
  'vô nghiệm',
  'option 1',
  'option a',
  'dummy',
  'placeholder',
  'chưa cập nhật',
]

function auditSingleQuestion(q, orderIndex) {
  const issues = []
  let formulaCount = 0

  const hintText = typeof q.meeHint === 'string' ? q.meeHint : q.meeHint?.text

  const fieldsToCheck = [
    { field: 'title', text: q.title },
    { field: 'text', text: q.text },
    { field: 'explanation', text: q.explanation },
    { field: 'meeHint', text: hintText },
  ]

  if (q.options) {
    q.options.forEach((opt, idx) => {
      fieldsToCheck.push({ field: `options[${idx}].text`, text: opt.text })
    })
  }

  if (q.explanationSteps) {
    q.explanationSteps.forEach((step, idx) => {
      fieldsToCheck.push({ field: `explanationSteps[${idx}].title`, text: step.title })
      fieldsToCheck.push({ field: `explanationSteps[${idx}].description`, text: step.description })
    })
  }

  // 1. Formula & Syntax check
  for (const { field, text } of fieldsToCheck) {
    if (!text || typeof text !== 'string') continue

    const mathBlockRegex = /(?<!\\)\$\$([\s\S]+?)(?<!\\)\$\$|(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g
    const mathList = []
    let match
    while ((match = mathBlockRegex.exec(text)) !== null) {
      const content = (match[1] ?? match[2] ?? '').trim()
      if (content) mathList.push(content)
    }

    let stripped = text.replace(mathBlockRegex, '')
    stripped = stripped.replace(/\\\$/g, '')
    stripped = stripped.replace(/\$[0-9]+(?:\.[0-9]+)?/g, '')
    const remainingDollars = stripped.match(/\$/g) || []
    if (remainingDollars.length > 0) {
      issues.push({
        severity: 'error',
        category: 'formula_syntax',
        field,
        message: `Ký tự phân cách công thức toán học '$' chưa được đóng`,
      })
    }

    for (const math of mathList) {
      formulaCount++
      try {
        katex.renderToString(math, { throwOnError: true })
      } catch (err) {
        issues.push({
          severity: 'error',
          category: 'formula_syntax',
          field,
          message: `Lỗi KaTeX: ${err.message}`,
        })
      }
    }
  }

  // 2. Math consistency & Options check
  if (!q.title || !q.title.trim()) {
    issues.push({ severity: 'error', category: 'math_consistency', field: 'title', message: 'Tiêu đề câu hỏi để trống' })
  }
  if (!q.text || q.text.trim().length < 5) {
    issues.push({ severity: 'error', category: 'math_consistency', field: 'text', message: 'Nội dung đề bài quá ngắn' })
  }

  if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
    issues.push({ severity: 'error', category: 'options_distractors', field: 'options', message: 'Thiếu lựa chọn đáp án' })
  } else {
    const labels = new Set()
    const texts = new Set()

    for (let i = 0; i < q.options.length; i++) {
      const opt = q.options[i]
      const label = (opt.label || opt.id || '').trim().toUpperCase()
      const text = (opt.text || '').trim()

      if (!label) {
        issues.push({ severity: 'error', category: 'options_distractors', field: `options[${i}].label`, message: 'Thiếu label lựa chọn' })
      }
      labels.add(label)

      if (text) {
        const lower = text.toLowerCase()
        if (texts.has(lower)) {
          issues.push({ severity: 'error', category: 'options_distractors', field: `options[${i}].text`, message: `Trùng lặp đáp án: ${text}` })
        }
        texts.add(lower)

        for (const dummy of DUMMY_DISTRACTOR_BLACKLIST) {
          if (lower === dummy) {
            issues.push({ severity: 'error', category: 'options_distractors', field: `options[${i}].text`, message: `Đáp án dummy: ${text}` })
          }
        }
      }
    }

    const cleanCorrect = (q.correctAnswer || '').trim().toUpperCase()
    if (!cleanCorrect) {
      issues.push({ severity: 'error', category: 'math_consistency', field: 'correctAnswer', message: 'Chưa có đáp án đúng' })
    } else {
      const matchFound = q.options.some(
        (o) => o.id.trim().toUpperCase() === cleanCorrect || (o.label && o.label.trim().toUpperCase() === cleanCorrect)
      )
      if (!matchFound) {
        issues.push({ severity: 'error', category: 'math_consistency', field: 'correctAnswer', message: `Đáp án đúng '${cleanCorrect}' không khớp với options` })
      }
    }
  }

  // 3. Pedagogical steps check
  if (q.explanationSteps && q.explanationSteps.length > 0) {
    if (q.explanationSteps.length < 3) {
      issues.push({ severity: 'warning', category: 'pedagogical_solution', field: 'explanationSteps', message: 'Khuyến nghị tối thiểu 3 bước sư phạm' })
    }
  } else {
    if (!q.explanation || q.explanation.trim().length < 15) {
      issues.push({ severity: 'error', category: 'pedagogical_solution', field: 'explanation', message: 'Thiếu lời giải chi tiết' })
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length
  const warningCount = issues.filter((i) => i.severity === 'warning').length
  const suggestionCount = issues.filter((i) => i.severity === 'suggestion').length

  const score = Math.max(0, Math.min(100, Math.round(100 - (errorCount * 20 + warningCount * 4 + suggestionCount * 1))))
  const passed = errorCount === 0 && score >= 75

  return {
    questionId: q.id,
    orderIndex,
    score,
    passed,
    formulaCount,
    errorCount,
    warningCount,
    issues,
  }
}

function auditExam(exam) {
  const results = (exam.questions || []).map((q, idx) => auditSingleQuestion(q, idx + 1))
  const totalQuestions = results.length
  const passedQuestions = results.filter((r) => r.passed).length
  const errorCount = results.reduce((acc, r) => acc + r.errorCount, 0)
  const warningCount = results.reduce((acc, r) => acc + r.warningCount, 0)
  const formulasChecked = results.reduce((acc, r) => acc + r.formulaCount, 0)

  let qualityScore = 100
  if (totalQuestions > 0) {
    const avg = results.reduce((acc, r) => acc + r.score, 0) / totalQuestions
    qualityScore = Math.max(0, Math.min(100, Math.round(avg)))
  } else {
    qualityScore = 0
  }

  if (errorCount > 0) {
    qualityScore = Math.max(0, Math.min(qualityScore, 100 - errorCount * 4))
  }

  let status = 'pass'
  if (qualityScore < 60 || errorCount > 2) status = 'fail'
  else if (qualityScore < 85 || errorCount > 0 || warningCount > 5) status = 'warning'

  return {
    examId: exam.id,
    code: exam.code,
    title: exam.title,
    grade: exam.grade,
    subject: exam.subject,
    qualityScore,
    status,
    totalQuestions,
    passedQuestions,
    errorCount,
    warningCount,
    formulasChecked,
  }
}

let totalQuestions = 0
let totalScoreSum = 0
let passedExamsCount = 0
let warningExamsCount = 0
let failedExamsCount = 0
let totalErrors = 0
let totalWarnings = 0
let totalFormulas = 0

const examResults = []

for (const exam of exams) {
  const res = auditExam(exam)
  examResults.push(res)
  totalQuestions += res.totalQuestions
  totalScoreSum += res.qualityScore
  totalErrors += res.errorCount
  totalWarnings += res.warningCount
  totalFormulas += res.formulasChecked

  if (res.status === 'pass') passedExamsCount++
  else if (res.status === 'warning') warningExamsCount++
  else failedExamsCount++
}

const avgScore = exams.length > 0 ? (totalScoreSum / exams.length).toFixed(1) : 0

// Print summary table
console.log('-----------------------------------------------------------------------------------------')
console.log('| MÃ ĐỀ THI               | MÔN     | KHỐI | CÂU HỎI | CÔNG THỨC | LỖI | CẢNH BÁO | ĐIỂM  |')
console.log('-----------------------------------------------------------------------------------------')

for (const r of examResults.slice(0, 15)) {
  const code = r.code.padEnd(23, ' ')
  const subj = r.subject.padEnd(7, ' ')
  const grade = String(r.grade).padEnd(4, ' ')
  const questions = String(r.totalQuestions).padStart(7, ' ')
  const formulas = String(r.formulasChecked).padStart(9, ' ')
  const errors = String(r.errorCount).padStart(3, ' ')
  const warnings = String(r.warningCount).padStart(8, ' ')
  const score = `${r.qualityScore}/100`.padStart(7, ' ')

  console.log(`| ${code} | ${subj} | ${grade} | ${questions} | ${formulas} | ${errors} | ${warnings} | ${score} |`)
}

if (examResults.length > 15) {
  console.log(`| ... và ${examResults.length - 15} đề thi khác được kiểm tra toàn diện                                        |`)
}
console.log('-----------------------------------------------------------------------------------------\n')

console.log('📊 THỐNG KÊ TỔNG THỂ TOÀN BỘ NGÂN HÀNG ĐỀ THI ASMO:')
console.log(`  • Tổng số đề thi đã thẩm định:     ${exams.length}`)
console.log(`  • Tổng số câu hỏi:                 ${totalQuestions}`)
console.log(`  • Điểm chất lượng trung bình:      ${avgScore} / 100`)
console.log(`  • Số đề ĐẠT CHUẨN (Pass):          ${passedExamsCount} (${Math.round((passedExamsCount / exams.length) * 100)}%)`)
console.log(`  • Số đề CẢNH BÁO (Warning):        ${warningExamsCount}`)
console.log(`  • Số đề KHÔNG ĐẠT (Fail):          ${failedExamsCount}`)
console.log(`  • Tổng số công thức KaTeX:         ${totalFormulas}`)
console.log(`  • Tổng số lỗi nghiêm trọng:        ${totalErrors}`)
console.log(`  • Tổng số cảnh báo cần tối ưu:     ${totalWarnings}\n`)

if (totalErrors === 0 && Number(avgScore) >= 80) {
  console.log('✅ KẾT QUẢ: 100% ĐỀ THI ASMO ĐẠT CHUẨN QUALITY GATE OLYMPIAD QUỐC TẾ!')
  process.exit(0)
} else {
  console.error('❌ KẾT QUẢ: PHÁT HIỆN LỖI HOẶC ĐIỂM CHẤT LƯỢNG CHƯA ĐẠT CHUẨN!')
  process.exit(1)
}
