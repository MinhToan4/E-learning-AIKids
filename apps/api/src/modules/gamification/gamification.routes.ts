import type { FastifyInstance } from 'fastify'
import { ACHIEVEMENT_CATALOG } from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'
import { requireRole, requireUser } from '../../infrastructure/session/session.js'
import {
  bumpStreakOnActivity,
  evaluateAndUnlockAchievements,
} from './achievement.service.js'

export async function gamificationRoutes(app: FastifyInstance) {
  app.get('/api/gamification/streak', async (request) => {
    const user = requireUser(request)
    const streak = await prisma.dailyStreak.findUnique({
      where: { userId: user.id },
    })
    return {
      current: streak?.current ?? 0,
      longest: streak?.longest ?? 0,
      lastActiveDate: streak?.lastActiveDate ?? null,
    }
  })

  app.post('/api/gamification/check-in', async (request) => {
    const user = requireUser(request)
    const before = await prisma.dailyStreak.findUnique({
      where: { userId: user.id },
    })
    const today = todayDateString()
    const alreadyCheckedIn = before?.lastActiveDate === today

    await bumpStreakOnActivity(user.id)
    const streak = await prisma.dailyStreak.findUnique({
      where: { userId: user.id },
    })
    const newAchievements = await evaluateAndUnlockAchievements(user.id)

    return {
      current: streak?.current ?? 0,
      longest: streak?.longest ?? 0,
      alreadyCheckedIn: Boolean(alreadyCheckedIn),
      newAchievements,
    }
  })

  app.get('/api/gamification/achievements', async (request) => {
    const user = requireUser(request)
    const unlocked = await prisma.achievement.findMany({
      where: { userId: user.id },
    })
    const unlockedTypes = new Set(unlocked.map((a) => a.type))

    return {
      achievements: ACHIEVEMENT_CATALOG.map((t) => ({
        ...t,
        unlocked: unlockedTypes.has(t.type),
        unlockedAt: unlocked.find((a) => a.type === t.type)?.unlockedAt ?? null,
      })),
    }
  })

  app.get('/api/gamification/class-celebration', async (request) => {
    const user = requireRole(request, ['student'])
    const classStudents = user.classId
      ? await prisma.user.findMany({
          where: { classId: user.classId, role: 'student', active: true },
          select: { id: true, xp: true },
        })
      : [{ id: user.id, xp: user.xp }]
    const studentIds = classStudents.map((student) => student.id)
    const [completedQuests, projects] = await prisma.$transaction([
      prisma.questProgress.count({
        where: { userId: { in: studentIds }, status: 'completed' },
      }),
      prisma.project.count({ where: { userId: { in: studentIds } } }),
    ])
    const teamXp = classStudents.reduce((sum, student) => sum + student.xp, 0)
    const nextGoal = Math.max(10, Math.ceil((completedQuests + 1) / 10) * 10)

    return {
      celebration: {
        hasClass: Boolean(user.classId),
        learnerCount: classStudents.length,
        completedQuests,
        projects,
        teamXp,
        nextGoal,
        personal: {
          level: user.level,
          xp: user.xp,
        },
      },
    }
  })
  /**
   * Daily mission — generates a personalised challenge card.
   * Based on Little AI Master's daily quest pattern:
   * - If a quest is in_progress → "finish it"
   * - Else if no enrollment → "start a course"
   * - Else → "earn 3 stars on your next quest"
   */
  app.get('/api/gamification/daily-mission', async (request) => {
    const user = requireUser(request)

    const today = todayDateString()

    // Find the student's current active quest
    const inProgress = await prisma.questProgress.findFirst({
      where: { userId: user.id, status: 'in_progress' },
      include: { quest: { select: { id: true, title: true, courseId: true } } },
      orderBy: { updatedAt: 'desc' },
    })

    if (inProgress) {
      return {
        mission: {
          id: `daily-${today}-finish`,
          type: 'finish_quest',
          title: '🎯 Hoàn thành trạm hôm nay!',
          description: `Tiếp tục trạm "${inProgress.quest.title}" và nhận sao nhé!`,
          xpReward: 50,
          action: {
            label: 'Tiếp tục ngay',
            route: `/lesson/${inProgress.questId}`,
          },
        },
      }
    }

    // Find the next available quest
    const available = await prisma.questProgress.findFirst({
      where: { userId: user.id, status: 'available' },
      include: { quest: { select: { id: true, title: true } } },
      orderBy: [{ quest: { order: 'asc' } }],
    })

    if (available) {
      return {
        mission: {
          id: `daily-${today}-next`,
          type: 'start_quest',
          title: '⭐ Khám phá trạm mới!',
          description: `Hôm nay hãy thử trạm "${available.quest.title}"!`,
          xpReward: 40,
          action: {
            label: 'Bắt đầu khám phá',
            route: `/lesson/${available.questId}`,
          },
        },
      }
    }

    // No active quests — prompt to enroll
    const enrollment = await prisma.enrollment.findFirst({
      where: { userId: user.id },
    })

    return {
      mission: {
        id: `daily-${today}-enroll`,
        type: 'enroll',
        title: '🚀 Bắt đầu hành trình AI!',
        description: 'Chọn khóa học phù hợp với con và bắt đầu sáng tạo ngay hôm nay!',
        xpReward: 30,
        action: {
          label: enrollment ? 'Tiếp tục hành trình' : 'Chọn khóa học',
          route: '/',
        },
      },
    }
  })
}

function todayDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
