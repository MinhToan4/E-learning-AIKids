import {
  achievementsToUnlock,
  getAchievementMeta,
  type AchievementType,
} from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'

/**
 * Evaluate and persist newly earned achievements after progress events.
 * Idempotent via unique (userId, type).
 */
export async function evaluateAndUnlockAchievements(userId: string): Promise<
  AchievementType[]
> {
  const [completedQuests, starAgg, streak, projects, unlocked, enrollments] =
    await Promise.all([
      prisma.questProgress.count({
        where: { userId, status: 'completed' },
      }),
      prisma.questProgress.aggregate({
        where: { userId },
        _sum: { stars: true },
      }),
      prisma.dailyStreak.findUnique({ where: { userId } }),
      prisma.project.count({ where: { userId } }),
      prisma.achievement.findMany({
        where: { userId },
        select: { type: true },
      }),
      prisma.enrollment.findMany({
        where: { userId },
        select: { courseId: true },
      }),
    ])

  const courseIds = enrollments.map((enrollment) => enrollment.courseId)
  const [questTotals, completedRows] = courseIds.length === 0
    ? [[], []] as const
    : await Promise.all([
        prisma.quest.groupBy({
          by: ['courseId'],
          where: { courseId: { in: courseIds } },
          _count: { _all: true },
        }),
        prisma.questProgress.findMany({
          where: { userId, status: 'completed', quest: { courseId: { in: courseIds } } },
          select: { quest: { select: { courseId: true } } },
        }),
      ])
  const completedByCourse = new Map<string, number>()
  for (const row of completedRows) {
    completedByCourse.set(row.quest.courseId, (completedByCourse.get(row.quest.courseId) ?? 0) + 1)
  }
  const coursesCompleted = questTotals.filter(
    (row) => row._count._all > 0 && (completedByCourse.get(row.courseId) ?? 0) >= row._count._all,
  ).length

  const toUnlock = achievementsToUnlock({
    completedQuests,
    totalStars: starAgg._sum.stars ?? 0,
    streakCurrent: streak?.current ?? 0,
    coursesCompleted,
    projectCount: projects,
    alreadyUnlocked: unlocked.map((u) => u.type),
  })

  const newly: AchievementType[] = []
  for (const type of toUnlock) {
    try {
      await prisma.achievement.create({
        data: { userId, type },
      })
      const meta = getAchievementMeta(type)
      if (meta) {
        const notification = await prisma.notification.create({
          data: {
            userId,
            type: 'achievement',
            title: `🏆 ${meta.title}`,
            body: meta.description,
            data: JSON.stringify({ achievementType: type }),
          },
        })
        const { enqueueNotificationPush } = await import('../notification/push.queue.js')
        await enqueueNotificationPush(notification.id).catch(() => false)
      }
      newly.push(type)
    } catch {
      // already unlocked (unique constraint)
    }
  }
  return newly
}

/** Bump daily streak on learning activity (quest complete). */
export async function bumpStreakOnActivity(userId: string): Promise<void> {
  const today = todayDateString()
  const streak = await prisma.dailyStreak.findUnique({ where: { userId } })
  if (!streak) {
    await prisma.dailyStreak.create({
      data: {
        userId,
        current: 1,
        longest: 1,
        lastActiveDate: today,
      },
    })
    return
  }
  if (streak.lastActiveDate === today) return

  const last = new Date(streak.lastActiveDate)
  const todayDate = new Date(today)
  const diffDays = Math.floor(
    (todayDate.getTime() - last.getTime()) / 86_400_000,
  )
  const newCurrent = diffDays === 1 ? streak.current + 1 : 1
  const newLongest = Math.max(streak.longest, newCurrent)
  await prisma.dailyStreak.update({
    where: { userId },
    data: {
      current: newCurrent,
      longest: newLongest,
      lastActiveDate: today,
    },
  })
}

function todayDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
