import type { LessonSixStageJourney } from '@/shared/lib/api'

export const AIKI_MODULE_0_COURSE_ID = '5a2221e2-91a7-42dc-8362-ac9e51d8cc5b'

type RuleCandidate =
  | string
  | { id?: string; courseId?: string; slug?: string; title?: string; order?: number }
  | LessonSixStageJourney
  | null

export function extractRuleNumber(candidate?: RuleCandidate): number {
  if (!candidate) return 1
  if (typeof candidate === 'string') {
    const match = candidate.trim().match(/(?:rule|qt)[-_]?\s*(\d+)|(?:qt|quy\s*tắc|quy\s*tac)\s*[-_–—:]?\s*(\d+)/i)
    const number = Number(match?.[1] || match?.[2])
    return number >= 1 && number <= 10 ? number : 1
  }

  const value = candidate as Record<string, unknown>
  if (typeof value.order === 'number' && value.order >= 1 && value.order <= 10) return value.order
  for (const item of [value.slug, value.id, value.title, (value.stage1_goal as { title?: unknown } | undefined)?.title]) {
    if (typeof item !== 'string') continue
    const number = extractRuleNumber(item)
    if (number !== 1 || /(?:rule|qt|quy\s*tắc|quy\s*tac).*1/i.test(item)) return number
  }
  const nextSlug = (value.stage6_completion as { nextLessonSlug?: unknown } | undefined)?.nextLessonSlug
  if (typeof nextSlug === 'string') {
    const next = nextSlug.match(/(?:rule|qt)[-_]?(\d+)/i)
    const nextNumber = Number(next?.[1])
    if (nextNumber > 1 && nextNumber <= 11) return nextNumber - 1
  }
  return 1
}

export function isAikiRuleJourney(candidate?: RuleCandidate): boolean {
  if (!candidate) return false
  if (typeof candidate === 'string') {
    const value = candidate.toLowerCase().trim()
    return value === AIKI_MODULE_0_COURSE_ID ||
      value === 'aiki-rules' ||
      value === 'muoi-quy-tac-xuong-sang-tao' ||
      /^rule[-_]?\d+/i.test(value) ||
      /^qt\s*[-_–—]?\s*\d+/i.test(value) ||
      value.includes('quy-tac') || value.includes('quy-tắc') ||
      value.includes('quy tắc') || value.includes('quy tac')
  }

  const value = candidate as Record<string, unknown>
  return [value.courseId, value.id, value.slug].some((item) => typeof item === 'string' && isAikiRuleJourney(item)) ||
    (typeof value.title === 'string' && (/^qt\s*[-_–—]?\s*\d+/i.test(value.title.trim()) || /quy\s*tắc|quy\s*tac|mười\s+quy\s+tắc/i.test(value.title))) ||
    (typeof (value.stage1_goal as { title?: unknown } | undefined)?.title === 'string' && isAikiRuleJourney((value.stage1_goal as { title: string }).title)) ||
    (typeof (value.stage6_completion as { nextLessonSlug?: unknown } | undefined)?.nextLessonSlug === 'string' && isAikiRuleJourney((value.stage6_completion as { nextLessonSlug: string }).nextLessonSlug))
}
