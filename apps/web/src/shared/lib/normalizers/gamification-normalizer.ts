import type { GatewayRequest } from './common'

export function normalizeGamificationGatewayRequest(
  path: string,
  options: RequestInit = {},
): GatewayRequest | null {
  const direct: Record<string, string> = {
    '/api/gamification/streak': '/api/v1/gamification/me/streak',
    '/api/gamification/achievements': '/api/v1/gamification/me/achievements',
    '/api/gamification/storybook': '/api/v1/gamification/me/storybook',
    '/api/gamification/social/graph': '/api/v1/gamification/me/social/graph',
    '/api/gamification/social/feed': '/api/v1/gamification/me/social/feed',
    '/api/gamification/social/discover': '/api/v1/gamification/me/social/discover',
    '/api/gamification/social/invites/pending-review': '/api/v1/gamification/me/social/invites/pending-review',
    '/api/gamification/daily-mission': '/api/v1/gamification/me/missions',
    '/api/gamification/profile': '/api/v1/gamification/me',
    '/api/gamification/class-celebration': '/api/v1/gamification/me/celebration',
    '/api/gamification/catalog': '/api/v1/gamification/catalog',
  }

  if (direct[path]) {
    return { path: direct[path], options }
  }

  if (path === '/api/gamification/check-in') {
    return {
      path: '/api/v1/gamification/me/streak',
      options: { ...options, method: 'GET', body: undefined },
    }
  }

  if (path.startsWith('/api/gamification/catalog?')) {
    return { path: path.replace('/api/gamification/catalog', '/api/v1/gamification/catalog'), options }
  }

  if (path.startsWith('/api/admin/legend-studio')) {
    return {
      path: path.replace('/api/admin/legend-studio', '/api/v1/gamification/admin/studio'),
      options,
    }
  }

  if (path.startsWith('/api/admin/reward-mappings')) {
    return {
      path: path.replace('/api/admin/reward-mappings', '/api/v1/gamification/admin/reward-mappings'),
      options,
    }
  }

  const gamificationMeAction = path.match(
    /^\/api\/gamification\/(storybook\/chapters\/[^/?]+\/claim|rewards\/equipment\/[^/?]+|social\/invites(?:\/accept)?|social\/invites\/[^/?]+\/review|social\/connections\/[^/?]+(?:\/favorite)?|social\/activities\/[^/?]+\/reaction)$/,
  )
  if (gamificationMeAction) {
    return {
      path: `/api/v1/gamification/me/${gamificationMeAction[1]}`,
      options,
    }
  }

  return null
}

export function normalizeGamificationGatewayResponse(
  path: string,
  data: unknown,
): unknown | undefined {
  if (!path.startsWith('/api/gamification')) return undefined

  const body = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const payload = (body.data && typeof body.data === 'object'
    ? body.data
    : body) as Record<string, unknown>

  if (path === '/api/gamification/profile') {
    const src = payload
    const nextLevelRewards = Array.isArray(src.nextLevelRewards)
      ? (src.nextLevelRewards as Array<Record<string, unknown>>).map((reward) => ({
          id: String(reward.id ?? ''),
          name: String(reward.name ?? ''),
          icon: String(reward.icon ?? '🎁'),
          kind: String(reward.kind ?? ''),
        }))
      : []
    return {
      totalXp: Number(src.totalXp ?? 0),
      level: Number(src.level ?? 1),
      xpIntoLevel: Number(src.xpIntoLevel ?? 0),
      xpToNextLevel: Number(src.xpToNextLevel ?? 100),
      nextLevelXp: Number(src.nextLevelXp ?? 100),
      nextLevelRewards,
    }
  }

  if (path === '/api/gamification/streak' || path === '/api/gamification/check-in') {
    return {
      current: Number(payload.currentStreak ?? 0),
      longest: Number(payload.longestStreak ?? 0),
      lastActivityDate: payload.lastActivityDate ? String(payload.lastActivityDate) : null,
    }
  }

  if (path === '/api/gamification/achievements') {
    const rows = Array.isArray(data)
      ? data
      : Array.isArray(payload.achievements)
        ? payload.achievements
        : []
    return {
      achievements: rows.map((item) => {
        const row = item as Record<string, unknown>
        const definition = (
          row.achievement && typeof row.achievement === 'object'
            ? row.achievement
            : row
        ) as Record<string, unknown>
        const unlock = (
          row.unlock && typeof row.unlock === 'object'
            ? row.unlock
            : row
        ) as Record<string, unknown>
        const metadata = (
          definition.metadata && typeof definition.metadata === 'object'
            ? definition.metadata
            : {}
        ) as Record<string, unknown>
        const milestoneDefinitions = Array.isArray(definition.milestones)
          ? definition.milestones
          : Array.isArray(metadata.milestones)
            ? metadata.milestones
            : []
        const milestones = milestoneDefinitions.length > 0
          ? milestoneDefinitions.map((item) => {
              const milestone = item as Record<string, unknown>
              return {
                threshold: Number(milestone.threshold ?? 1),
                label: milestone.label ? String(milestone.label) : undefined,
                description: milestone.description ? String(milestone.description) : undefined,
                imageUrl: milestone.imageUrl ? String(milestone.imageUrl) : undefined,
                metric: milestone.metric ? String(milestone.metric) : undefined,
                operator: milestone.operator ? String(milestone.operator) : undefined,
                points: milestone.points == null ? undefined : Number(milestone.points),
                rewardLabel: milestone.rewardLabel
                  ? String(milestone.rewardLabel)
                  : undefined,
                rewardAssetId: milestone.rewardAssetId
                  ? String(milestone.rewardAssetId)
                  : undefined,
                unlocked: milestone.unlocked === true,
                unlockedAt: milestone.unlockedAt
                  ? String(milestone.unlockedAt)
                  : null,
              }
            })
          : undefined
        return {
          type: String(definition.key ?? row.achievementKey ?? ''),
          title: String(definition.title ?? ''),
          description: String(definition.description ?? ''),
          icon: String(definition.icon ?? '🏅'),
          category: definition.category ? String(definition.category) : undefined,
          requiredValue: Number(definition.threshold ?? 1),
          currentValue: (row.currentValue ?? unlock.currentValue ?? unlock.progress) == null
            ? undefined
            : Number(row.currentValue ?? unlock.currentValue ?? unlock.progress),
          points: (definition.points ?? definition.xpReward) == null
            ? undefined
            : Number(definition.points ?? definition.xpReward),
          rewardLabel: definition.rewardLabel
            ? String(definition.rewardLabel)
            : undefined,
          rewardAssetId: definition.rewardAssetId
            ? String(definition.rewardAssetId)
            : undefined,
          seriesKey: (definition.seriesKey ?? metadata.seriesKey)
            ? String(definition.seriesKey ?? metadata.seriesKey)
            : undefined,
          milestones,
          hidden: definition.hidden === true,
          unlocked: row.unlocked === true || Boolean(row.unlockedAt),
          unlockedAt: unlock.unlockedAt ? String(unlock.unlockedAt) : null,
        }
      }),
    }
  }

  if (path === '/api/gamification/daily-mission') {
    const rows = Array.isArray(data)
      ? data
      : Array.isArray(payload.missions)
        ? payload.missions
        : []
    const daily = rows.find((item) => {
      const row = item as Record<string, unknown>
      const mission = (row.mission ?? row) as Record<string, unknown>
      return mission.cadence === 'daily'
    }) as Record<string, unknown> | undefined
    if (!daily) return { mission: null }
    const mission = (daily.mission ?? daily) as Record<string, unknown>
    const progress = Number(daily.progress ?? 0)
    const target = Math.max(1, Number(mission.target ?? 1))
    const completedAt = daily.completedAt ? String(daily.completedAt) : null
    const claimedAt = daily.claimedAt ? String(daily.claimedAt) : null
    return {
      mission: {
        key: String(mission.key ?? ''),
        periodKey: String(daily.periodKey ?? ''),
        title: String(mission.title ?? ''),
        description: String(mission.description ?? ''),
        xpReward: Number(mission.xpReward ?? 0),
        progress,
        target,
        completedAt,
        claimedAt,
        action: {
          label: completedAt ? 'Xem hành trình' : progress > 0 ? 'Tiếp tục học' : 'Học ngay',
          route: '/world',
        },
      },
    }
  }

  if (path === '/api/gamification/class-celebration') {
    return { celebration: payload }
  }

  return undefined
}
