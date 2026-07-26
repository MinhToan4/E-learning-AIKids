import { z } from 'zod'

export const reportSectionSchema = z.enum([
  'student',
  'courses',
  'assessments',
  'competency',
  'portfolio',
  'teacher_feedback',
  'strengths',
  'development',
  'next_steps',
  'credentials',
])

export type ReportSection = z.infer<typeof reportSectionSchema>

export function findMissingReportSections(
  snapshot: Record<string, unknown>,
  required: ReportSection[],
): ReportSection[] {
  const keyBySection: Record<ReportSection, string> = {
    student: 'student',
    courses: 'courses',
    assessments: 'assessments',
    competency: 'competency',
    portfolio: 'portfolio',
    teacher_feedback: 'teacherFeedback',
    strengths: 'strengths',
    development: 'development',
    next_steps: 'nextSteps',
    credentials: 'credentials',
  }
  return required.filter((section) => {
    const value = snapshot[keyBySection[section]]
    if (value === null || value === undefined) return true
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return value === ''
  })
}
