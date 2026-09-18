import type { AsmoExam, AsmoGrade } from '../types'
import { ASMO_SAMPLE_EXAMS_META } from './asmo-sample-exams-meta'

// Cache loaded grades in memory so each chunk is only downloaded and parsed once
const gradeCache = new Map<number, AsmoExam[]>()

const GRADE_IMPORTERS: Record<number, () => Promise<{ default: any }>> = {
  1: () => import('./by-grade/grade-1.json'),
  2: () => import('./by-grade/grade-2.json'),
  3: () => import('./by-grade/grade-3.json'),
  4: () => import('./by-grade/grade-4.json'),
  5: () => import('./by-grade/grade-5.json'),
  6: () => import('./by-grade/grade-6.json'),
  7: () => import('./by-grade/grade-7.json'),
  8: () => import('./by-grade/grade-8.json'),
  9: () => import('./by-grade/grade-9.json'),
  10: () => import('./by-grade/grade-10.json'),
  11: () => import('./by-grade/grade-11.json'),
  12: () => import('./by-grade/grade-12.json'),
}

/**
 * Dynamically loads all exams with full questions for a specific grade.
 * Only the chunk for the requested grade is fetched from the network.
 */
export async function loadExamsForGrade(grade: number | AsmoGrade): Promise<AsmoExam[]> {
  const g = Number(grade)
  if (!g || g < 1 || g > 12) {
    return []
  }

  const cached = gradeCache.get(g)
  if (cached) {
    return cached
  }

  const importer = GRADE_IMPORTERS[g]
  if (!importer) {
    return []
  }

  try {
    const mod = await importer()
    const exams = (mod && 'default' in mod ? mod.default : mod) as AsmoExam[]
    if (Array.isArray(exams)) {
      gradeCache.set(g, exams)
      return exams
    }
  } catch (error) {
    console.error(`[asmo-grade-loader] Failed to load exams for Grade ${g}:`, error)
  }

  return []
}

/**
 * Finds which grade an examId belongs to using lightweight metadata,
 * then dynamically loads only that grade's exams.
 */
export async function loadExamById(examId: string): Promise<AsmoExam | null> {
  if (!examId) return null

  // 1. First check memory cache
  for (const exams of gradeCache.values()) {
    const found = exams.find((e) => e.id === examId)
    if (found) return found
  }

  // 2. Identify grade from metadata (only 47 KB, already loaded in memory)
  const meta = ASMO_SAMPLE_EXAMS_META.find((e) => e.id === examId)
  let targetGrade = meta ? meta.grade : undefined

  // 3. Fallback: Parse grade from examId pattern (e.g. asmo-math-g1-2020-r1 -> 1)
  if (targetGrade === undefined) {
    const match = examId.match(/-g(\d{1,2})-/i)
    if (match && match[1]) {
      targetGrade = parseInt(match[1], 10) as AsmoGrade
    }
  }

  if (targetGrade !== undefined) {
    const gradeExams = await loadExamsForGrade(targetGrade)
    const found = gradeExams.find((e) => e.id === examId)
    if (found) return found
  }

  return null
}

/**
 * Loads exams for a filter or all grades on demand.
 */
export async function loadSampleExams(grade?: number | AsmoGrade): Promise<AsmoExam[]> {
  if (grade !== undefined && grade >= 1 && grade <= 12) {
    return loadExamsForGrade(grade)
  }

  // If no grade is requested, load all grades concurrently
  const allGrades = Array.from({ length: 12 }, (_, i) => i + 1)
  const results = await Promise.all(allGrades.map((g) => loadExamsForGrade(g)))
  return results.flat()
}
