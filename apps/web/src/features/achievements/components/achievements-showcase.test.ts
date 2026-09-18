import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AchievementRow } from '@/shared/lib/api'
import { classifyAchievementShelf, SHELVES_CONFIG, type SeriesRepresentativeBadge } from '../pages/AchievementsPage'
import { loadFavoriteBadges, saveFavoriteBadges, FAVORITE_BADGES_STORAGE_KEY } from './TopPodiumShowcase'
import { groupAchievementSeries } from '../achievement-inventory'

const makeBadge = (overrides: Partial<AchievementRow> = {}): AchievementRow => ({
  type: 'badge-test',
  title: 'Huy hiệu thử nghiệm',
  description: 'Mô tả thử nghiệm',
  icon: '🏅',
  requiredValue: 5,
  unlocked: true,
  unlockedAt: '2026-09-18T10:00:00Z',
  ...overrides,
})

describe('Soft Clay Shelves Classification', () => {
  it('defines exactly 5 thematic shelves with hallmark metadata', () => {
    expect(SHELVES_CONFIG).toHaveLength(5)
    expect(SHELVES_CONFIG.map((s) => s.id)).toEqual([
      'habits',
      'learning',
      'creative',
      'stars',
      'olympic',
    ])
  })

  it('classifies streak and starter badges into habits shelf', () => {
    const badge = makeBadge({ type: 'first-streak', seriesKey: 'streak', category: 'habit' })
    expect(classifyAchievementShelf(badge)).toBe('habits')
  })

  it('classifies lessons and courses into learning shelf', () => {
    const badge = makeBadge({ type: 'lessons:10', seriesKey: 'lessons', category: 'learning' })
    expect(classifyAchievementShelf(badge)).toBe('learning')
  })

  it('classifies creative and comic badges into creative shelf', () => {
    const badge = makeBadge({ type: 'creative-artist', seriesKey: 'creative', category: 'creation' })
    expect(classifyAchievementShelf(badge)).toBe('creative')
  })

  it('classifies stars, xp, and level into stars shelf', () => {
    const badge = makeBadge({ type: 'stars:50', seriesKey: 'stars', category: 'stars' })
    expect(classifyAchievementShelf(badge)).toBe('stars')
  })

  it('classifies olympic, ASMO, and challenge badges into olympic shelf', () => {
    const badge = makeBadge({ type: 'asmo-gold', seriesKey: 'olympic', category: 'challenge' })
    expect(classifyAchievementShelf(badge)).toBe('olympic')
  })
})

describe('3 Treasures Showcase localStorage persistence', () => {
  const store = new Map<string, string>()

  beforeEach(() => {
    store.clear()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns 3 null slots when storage is empty', () => {
    const slots = loadFavoriteBadges()
    expect(slots).toEqual([null, null, null])
  })

  it('saves and reloads 3 proudest treasures correctly', () => {
    saveFavoriteBadges(['badge-gold', 'badge-silver', 'badge-bronze'])
    const loaded = loadFavoriteBadges()
    expect(loaded).toEqual(['badge-gold', 'badge-silver', 'badge-bronze'])
  })

  it('handles corrupted storage gracefully with fallback', () => {
    store.set(FAVORITE_BADGES_STORAGE_KEY, 'invalid-json')
    const loaded = loadFavoriteBadges()
    expect(loaded).toEqual([null, null, null])
  })
})

describe('Series Representative Badge Aggregation (Hallmark Pokédex)', () => {
  it('consolidates multi-tier milestones into exactly 1 representative badge per series', () => {
    const multiTierLessons = [
      makeBadge({ type: 'lessons:1', seriesKey: 'lessons', title: 'Nhà thám hiểm · Mầm xanh', requiredValue: 1, unlocked: true }),
      makeBadge({ type: 'lessons:5', seriesKey: 'lessons', title: 'Nhà thám hiểm · Đồng hành', requiredValue: 5, unlocked: true }),
      makeBadge({ type: 'lessons:20', seriesKey: 'lessons', title: 'Nhà thám hiểm · Bạc sáng', requiredValue: 20, unlocked: false }),
    ]

    const multiTierStreak = [
      makeBadge({ type: 'streak:3', seriesKey: 'streak', title: 'Chăm chỉ · Mầm xanh', requiredValue: 3, unlocked: false }),
      makeBadge({ type: 'streak:7', seriesKey: 'streak', title: 'Chăm chỉ · Đồng hành', requiredValue: 7, unlocked: false }),
    ]

    const allItems = [...multiTierLessons, ...multiTierStreak]
    const seriesList = groupAchievementSeries(allItems)

    const representativeBadges = seriesList.map((series): SeriesRepresentativeBadge => {
      const unlockedMilestones = series.items.filter((item) => item.unlocked)
      const totalLevels = series.items.length
      const currentLevel = unlockedMilestones.length

      const baseItem = currentLevel > 0
        ? unlockedMilestones[unlockedMilestones.length - 1]
        : series.items[0]

      const seriesTitle = baseItem.title.includes(' · ')
        ? baseItem.title.split(' · ')[0].trim()
        : baseItem.title

      return {
        ...baseItem,
        seriesKey: series.key,
        seriesTitle,
        currentLevel,
        totalLevels,
        series,
        unlocked: currentLevel > 0,
      }
    })

    expect(representativeBadges).toHaveLength(2)

    // Lessons: reached level 2/3, representative is level 2
    const lessonRep = representativeBadges.find((b) => b.seriesKey === 'lessons')!
    expect(lessonRep).toBeDefined()
    expect(lessonRep.type).toBe('lessons:5')
    expect(lessonRep.currentLevel).toBe(2)
    expect(lessonRep.totalLevels).toBe(3)
    expect(lessonRep.seriesTitle).toBe('Nhà thám hiểm')
    expect(lessonRep.unlocked).toBe(true)

    // Streak: 0 unlocked, representative is level 1 in locked/sculpture mode
    const streakRep = representativeBadges.find((b) => b.seriesKey === 'streak')!
    expect(streakRep).toBeDefined()
    expect(streakRep.type).toBe('streak:3')
    expect(streakRep.currentLevel).toBe(0)
    expect(streakRep.totalLevels).toBe(2)
    expect(streakRep.seriesTitle).toBe('Chăm chỉ')
    expect(streakRep.unlocked).toBe(false)
  })
})

describe('Growth Evolution Track Milestones State Logic', () => {
  it('correctly partitions milestones into unlocked, in-progress, and future sculptures', () => {
    const milestones = [
      makeBadge({ type: 'lvl-1', title: 'Cấp 1', unlocked: true, requiredValue: 5 }),
      makeBadge({ type: 'lvl-2', title: 'Cấp 2', unlocked: false, requiredValue: 10 }),
      makeBadge({ type: 'lvl-3', title: 'Cấp 3', unlocked: false, requiredValue: 20 }),
    ]

    const inProgressIndex = milestones.findIndex((m) => !m.unlocked)
    expect(inProgressIndex).toBe(1) // Level 2 is in-progress

    const states = milestones.map((m, index) => {
      const isUnlocked = m.unlocked
      const isInProgress = index === inProgressIndex
      const isFuture = !isUnlocked && !isInProgress
      return { isUnlocked, isInProgress, isFuture }
    })

    expect(states[0]).toEqual({ isUnlocked: true, isInProgress: false, isFuture: false })
    expect(states[1]).toEqual({ isUnlocked: false, isInProgress: true, isFuture: false })
    expect(states[2]).toEqual({ isUnlocked: false, isInProgress: false, isFuture: true })
  })

  it('marks all milestones as completed when series is fully unlocked', () => {
    const milestones = [
      makeBadge({ type: 'lvl-1', title: 'Cấp 1', unlocked: true }),
      makeBadge({ type: 'lvl-2', title: 'Cấp 2', unlocked: true }),
    ]

    const inProgressIndex = milestones.findIndex((m) => !m.unlocked)
    expect(inProgressIndex).toBe(-1) // No locked item
  })
})
