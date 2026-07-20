import type { FastifyInstance } from 'fastify'
import { ACHIEVEMENT_CATALOG } from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'
import { requireUser } from '../../infrastructure/session/session.js'
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

  app.get('/api/gamification/leaderboard', async (request) => {
    const user = requireUser(request)
    const classId =
      (request.query as { classId?: string }).classId ?? user.classId

    const where: Record<string, unknown> = { role: 'student', active: true }
    if (classId) where.classId = classId

    const topStudents = await prisma.user.findMany({
      where: where as never,
      select: {
        id: true,
        nickname: true,
        avatarId: true,
        level: true,
        xp: true,
      },
      orderBy: { xp: 'desc' },
      take: 10,
    })

    return {
      leaderboard: topStudents.map((s, i) => ({
        rank: i + 1,
        id: s.id,
        nickname: s.nickname,
        avatarId: s.avatarId,
        level: s.level,
        xp: s.xp,
        isMe: s.id === user.id,
      })),
    }
  })
}

function todayDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
