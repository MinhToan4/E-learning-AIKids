import { courseAILiteracyL1 } from '../apps/api/prisma/seed/courses/ai-literacy-l1.js'
import { courseAILiteracyL2 } from '../apps/api/prisma/seed/courses/ai-literacy-l2.js'
import { curriculumCourses } from '../apps/api/prisma/seed/courses/curriculum.js'
import type { CourseSeed, QuestSeed } from '../apps/api/prisma/seed/types.js'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

function stationsFor(quest: QuestSeed) {
  if (quest.stations?.stations?.length) {
    return quest.stations.stations.map((station, index) => {
      const raw = station as Record<string, unknown>
      return {
        key: String(raw.id ?? `${quest.id}-station-${index + 1}`),
        kind: ['video', 'game', 'practice', 'check', 'content'].includes(String(raw.kind))
          ? String(raw.kind)
          : 'content',
        title: raw.title ? String(raw.title) : undefined,
        required: true,
        content: raw,
      }
    })
  }
  return [
    {
      key: `${quest.id}-content`,
      kind: 'content',
      title: quest.title,
      required: true,
      content: {
        concept: quest.concept,
        example: quest.example,
        goals: quest.goals,
      },
    },
    {
      key: `${quest.id}-check`,
      kind: 'check',
      title: 'Kiểm tra nhanh',
      required: true,
      content: { questions: quest.check ?? [] },
    },
  ]
}

function mapCourse(seed: CourseSeed) {
  return {
    course: {
      slug: seed.id,
      title: seed.title,
      shortTitle: seed.shortTitle,
      description: seed.description,
      ageBand: seed.ageLabel,
      language: 'vi',
      accessPolicy: 'free',
      metadata: {
        sourceCourseId: seed.id,
        tagline: seed.tagline,
        coverFrom: seed.coverFrom,
        coverTo: seed.coverTo,
        accent: seed.accent,
        coverImage: seed.coverImage,
        ageTrack: seed.ageTrack,
        courseKey: seed.courseKey,
        durationLabel: seed.durationLabel,
        productLabel: seed.productLabel,
        recommended: seed.recommended,
        skills: seed.skills,
        outcomes: seed.outcomes,
        recognition: seed.recognition,
        sortOrder: seed.sortOrder,
      },
    },
    curriculum: {
      modules: [
        {
          slug: 'curriculum',
          title: seed.shortTitle,
          metadata: { sourceCourseId: seed.id },
          lessons: seed.quests.map((quest) => ({
            slug: quest.id,
            title: quest.title,
            description: quest.hook,
            lessonType: 'quest',
            xpReward: 0,
            metadata: {
              sourceQuestId: quest.id,
              order: quest.order,
              skill: quest.skill,
              reward: quest.reward,
              duration: quest.duration,
              accent: quest.accent,
              practiceKind: quest.practiceKind,
              stage: quest.stage ?? 'ideate',
              videoUrl: quest.videoUrl ?? null,
              goals: quest.goals,
              concept: quest.concept,
              example: quest.example,
              check: quest.check ?? [],
            },
            stations: stationsFor(quest),
          })),
        },
      ],
    },
  }
}

const courses = [
  ...curriculumCourses,
  courseAILiteracyL1,
  courseAILiteracyL2,
]

const json = `${JSON.stringify({
  source: 'e-learning-aikids',
  exportedAt: new Date().toISOString(),
  courses: courses.map(mapCourse),
}, null, 2)}\n`
const outIndex = process.argv.indexOf('--out')
const outFile = outIndex >= 0 ? process.argv[outIndex + 1] : undefined
if (outFile) {
  await writeFile(resolve(outFile), json, 'utf8')
  process.stdout.write(`${resolve(outFile)}\n`)
} else {
  process.stdout.write(json)
}
