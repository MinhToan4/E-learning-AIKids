import type { PrismaClient } from '@prisma/client'
import {
  learn,
  defaultCheck,
  PROMPT_CHIPS,
  type CourseSeed,
  type QuestSeed,
} from './types.js'

/**
 * CMS-owned lecture fields (teacher/admin may edit).
 * Seed must never clobber these on update unless SEED_OVERWRITE_CONTENT=true.
 */
export const CMS_QUEST_FIELDS = [
  'title',
  'skill',
  'reward',
  'duration',
  'hook',
  'accent',
  'practiceKind',
  'videoUrl',
] as const

export function seedOverwriteContent(): boolean {
  return process.env.SEED_OVERWRITE_CONTENT === 'true'
}

/** Quest update payload: preserve CMS fields unless forced overwrite. */
export function questUpdateData(
  data: CourseSeed,
  q: QuestSeed,
  check: unknown,
  overwrite: boolean,
): Record<string, unknown> {
  if (overwrite) {
    return {
      order: q.order,
      title: q.title,
      skill: q.skill,
      reward: q.reward,
      duration: q.duration,
      hook: q.hook,
      accent: q.accent,
      practiceKind: q.practiceKind,
      videoUrl: q.videoUrl ?? null,
      goalsJson: JSON.stringify(q.goals),
      learnCardsJson: JSON.stringify(learn(q.id, q.concept, q.example)),
      checkJson: JSON.stringify(check),
      chipsJson: JSON.stringify(PROMPT_CHIPS),
      courseId: data.id,
    }
  }
  // Structural links only — title/hook/videoUrl stay as CMS left them
  return {
    order: q.order,
    courseId: data.id,
  }
}

export async function upsertCourse(
  prisma: PrismaClient,
  data: CourseSeed,
): Promise<void> {
  const overwrite = seedOverwriteContent()

  await prisma.course.upsert({
    where: { id: data.id },
    create: {
      id: data.id,
      title: data.title,
      shortTitle: data.shortTitle,
      tagline: data.tagline,
      description: data.description,
      coverFrom: data.coverFrom,
      coverTo: data.coverTo,
      accent: data.accent,
      coverImage: data.coverImage,
      ageLabel: data.ageLabel,
      durationLabel: data.durationLabel,
      productLabel: data.productLabel,
      status: data.status,
      recommended: data.recommended,
      skillsJson: JSON.stringify(data.skills),
      outcomesJson: JSON.stringify(data.outcomes),
      sortOrder: data.sortOrder,
    },
    update: overwrite
      ? {
          title: data.title,
          shortTitle: data.shortTitle,
          tagline: data.tagline,
          description: data.description,
          coverImage: data.coverImage,
          coverFrom: data.coverFrom,
          coverTo: data.coverTo,
          accent: data.accent,
          skillsJson: JSON.stringify(data.skills),
          outcomesJson: JSON.stringify(data.outcomes),
          recommended: data.recommended,
          sortOrder: data.sortOrder,
          status: data.status,
          ageLabel: data.ageLabel,
          durationLabel: data.durationLabel,
          productLabel: data.productLabel,
        }
      : {
          // Keep CMS/admin course edits; only refresh sort order from seed catalog
          sortOrder: data.sortOrder,
        },
  })

  for (const q of data.quests) {
    const check =
      q.check ??
      defaultCheck(
        `Con nhớ gì về: ${q.skill}?`,
        ['Không cần học gì cả', q.skill, 'Chỉ cần copy người khác'],
        1,
      )

    await prisma.quest.upsert({
      where: { id: q.id },
      create: {
        id: q.id,
        courseId: data.id,
        order: q.order,
        title: q.title,
        skill: q.skill,
        reward: q.reward,
        duration: q.duration,
        hook: q.hook,
        accent: q.accent,
        practiceKind: q.practiceKind,
        videoUrl: q.videoUrl ?? null,
        goalsJson: JSON.stringify(q.goals),
        learnCardsJson: JSON.stringify(learn(q.id, q.concept, q.example)),
        checkJson: JSON.stringify(check),
        chipsJson: JSON.stringify(PROMPT_CHIPS),
      },
      update: questUpdateData(data, q, check, overwrite),
    })
  }
}
