import type { PrismaClient } from '../../src/generated/prisma/index.js'
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
  'stage',
  'stationsJson',
] as const

export function seedOverwriteContent(): boolean {
  return process.env.SEED_OVERWRITE_CONTENT === 'true'
}

function stationsJsonFor(q: QuestSeed): string | null {
  if (q.stations) return JSON.stringify(q.stations)
  const stage = q.stage ?? (q.practiceKind === 'ai_pick' || q.practiceKind === 'chips' ? 'produce' : 'ideate')
  return JSON.stringify({
    stage,
    stations: [
      {
        id: `${q.id}-video`,
        kind: 'video',
        durationMin: 3,
        title: 'Xem video',
        videoUrl: q.videoUrl ?? null,
      },
      {
        id: `${q.id}-game`,
        kind: 'game',
        durationMin: 5,
        title: 'Game ghi nhớ',
        gameType: 'pick',
      },
      {
        id: `${q.id}-practice`,
        kind: 'practice',
        durationMin: 8,
        title: 'Thực hành',
        practiceKind: q.practiceKind,
      },
      {
        id: `${q.id}-check`,
        kind: 'check',
        durationMin: 2,
        title: 'Kiểm tra nhanh',
      },
    ],
  })
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
      stage: q.stage ?? 'ideate',
      videoUrl: q.videoUrl ?? null,
      goalsJson: JSON.stringify(q.goals),
      learnCardsJson: JSON.stringify(learn(q.id, q.concept, q.example)),
      checkJson: JSON.stringify(check),
      chipsJson: JSON.stringify(PROMPT_CHIPS),
      stationsJson: stationsJsonFor(q),
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
      ageTrack: data.ageTrack,
      courseKey: data.courseKey,
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
          ageTrack: data.ageTrack,
          courseKey: data.courseKey,
          durationLabel: data.durationLabel,
          productLabel: data.productLabel,
        }
      : {
          sortOrder: data.sortOrder,
          ageTrack: data.ageTrack,
          courseKey: data.courseKey,
          ageLabel: data.ageLabel,
        },
  })

  // Two-phase order: avoid unique(courseId, order) collisions when seed
  // re-applies after teacher reorder / partial CMS edits (Phase 5+).
  const existingInCourse = await prisma.quest.findMany({
    where: { courseId: data.id },
    select: { id: true },
  })
  if (existingInCourse.length > 0) {
    let bump = 0
    for (const row of existingInCourse) {
      await prisma.quest.update({
        where: { id: row.id },
        data: { order: 50_000 + bump },
      })
      bump += 1
    }
  }

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
        stage: q.stage ?? 'ideate',
        videoUrl: q.videoUrl ?? null,
        goalsJson: JSON.stringify(q.goals),
        learnCardsJson: JSON.stringify(learn(q.id, q.concept, q.example)),
        checkJson: JSON.stringify(check),
        chipsJson: JSON.stringify(PROMPT_CHIPS),
        stationsJson: stationsJsonFor(q),
      },
      update: questUpdateData(data, q, check, overwrite),
    })
  }
}
