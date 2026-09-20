import fs from 'fs'
import path from 'path'
import {
  AIKI_ISLANDS_LESSONS,
  createSixStageJourney,
} from '../../../2-MCP-Core/core-lms-api/src/curricula/aiki-islands-curriculum'

const lessonsData = AIKI_ISLANDS_LESSONS.map((lesson) => {
  const globalIndex = AIKI_ISLANDS_LESSONS.findIndex((l) => l.slug === lesson.slug)
  const nextSlug =
    globalIndex >= 0 && globalIndex < AIKI_ISLANDS_LESSONS.length - 1
      ? AIKI_ISLANDS_LESSONS[globalIndex + 1].slug
      : undefined

  const journey = createSixStageJourney(lesson, nextSlug)
  const lessonSub = lesson.lessonNumber.split('.')[1] || '1'
  const resolvedCover =
    lesson.imageUrl ||
    `/assets/aiki-islands/island${lesson.islandNumber}_lesson${lessonSub}_cat.jpg`

  return {
    id: `bai-${lesson.islandNumber}-${lessonSub}`,
    slug: lesson.slug,
    islandNumber: lesson.islandNumber,
    lessonNumber: lesson.lessonNumber,
    title: lesson.title,
    subtitle: lesson.subtitle,
    imageUrl: resolvedCover,
    objective: lesson.objective,
    skillLearned: lesson.skillLearned,
    nextLessonSlug: nextSlug,
    journey,
  }
})

const header = `// SSOT Thư viện Giáo trình 6 Chặng cho toàn bộ 22 bài học Aiki Islands (Module 1 - Module 5)
// Tự động đồng bộ và chuẩn hóa từ aiki-islands-curriculum.ts
import type { QuestDetail, LessonSixStageJourney } from '@/shared/lib/api'
import { LESSON_ENGINE_MAP } from '@/features/lesson/components/creative-engine/data/engine-presets'
import type { CreativeNotebookConfig } from '@/features/lesson/components/creative-engine/types'
import {
  DEFAULT_FOUR_KEYS_OPTIONS,
  DEFAULT_STYLE_PRISM_OPTIONS,
  DEFAULT_PROMPT_DOCTOR_CASE,
  DEFAULT_LAYER_STACKING_OPTIONS,
  DEFAULT_LOCKED_FEATURES,
  DEFAULT_EXPRESSIONS,
  DEFAULT_CARD_FORGE_OPTIONS,
} from '@/features/teacher/components/engine-editors/engine-editor-defaults'

export interface IslandCurriculumLesson {
  id: string
  slug: string
  islandNumber: number
  lessonNumber: string
  title: string
  subtitle: string
  imageUrl: string
  objective: string
  skillLearned: string
  nextLessonSlug?: string
  journey: LessonSixStageJourney
}

export const ISLAND_CURRICULUM_LESSONS: IslandCurriculumLesson[] = `

const tailPath = path.resolve(__dirname, 'island-registry-tail.ts')
const tail = fs.readFileSync(tailPath, 'utf8')

const fileContent = header + JSON.stringify(lessonsData, null, 2) + '\n\n' + tail

const targetPath = path.resolve(
  __dirname,
  '../apps/web/src/features/lesson/data/island-curriculum-registry.ts'
)
fs.writeFileSync(targetPath, fileContent, 'utf8')
console.log('Successfully written island-curriculum-registry.ts, size:', fs.statSync(targetPath).size)
