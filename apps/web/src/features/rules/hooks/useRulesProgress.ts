import { useCallback, useEffect, useState } from 'react'
import type { LearningPathway, LearningPathwayCourse } from '@/shared/lib/learning-api'
import { learningApi } from '@/shared/lib/learning-api'
import type { RulesOverallProgress, RuleUserProgress } from '../types'
import { AIKI_RULES_DATA } from '../data/rules-data'
import { calculateCourseStars, clampStationStars } from '@/shared/lib/star-progress'

const LEGACY_STORAGE_KEY = 'aikids_golden_rules_progress_v1'

function createDefaultProgress(): RulesOverallProgress {
  const rules: Record<number, RuleUserProgress> = {}
  AIKI_RULES_DATA.forEach((r, idx) => {
    rules[r.id] = {
      ruleId: r.id,
      status: idx === 0 ? 'available' : 'locked',
      completedQuestions: 0,
      starsEarned: 0,
    }
  })
  return {
    rules,
    totalStars: 0,
    totalXp: 0,
    unlockedPosters: [],
  }
}

function isRulesCourse(course: LearningPathwayCourse): boolean {
  const identity = `${course.id} ${course.shortTitle || ''} ${course.title || ''}`.toLowerCase()
  return course.id === 'aiki-rules' || course.id.startsWith('rule-') ||
    identity.includes('mười quy tắc') || identity.includes('muoi quy tac') ||
    identity.includes('10 quy tắc') || identity.includes('10 quy tac') ||
    identity.includes('module 0')
}

function stationRuleId(station: NonNullable<LearningPathwayCourse['stations']>[number]): number | null {
  const slugMatch = station.slug?.match(/rule[-_ ]?(10|[1-9])(?:\D|$)/i)
  if (slugMatch) return Number(slugMatch[1])
  return station.order >= 1 && station.order <= 10 ? station.order : null
}

/** Convert the Hub pathway projection into the Rules UI model without browser persistence. */
export function rulesProgressFromPathway(pathway: LearningPathway): RulesOverallProgress {
  const result = createDefaultProgress()
  const course = pathway.courses.find(isRulesCourse)
  if (!course?.stations?.length) return result

  for (const station of course.stations) {
    const ruleId = stationRuleId(station)
    if (!ruleId || !result.rules[ruleId]) continue
    const completed = station.status === 'completed'
    result.rules[ruleId] = {
      ruleId,
      status: completed ? 'completed' : station.status === 'locked' ? 'locked' : 'available',
      completedQuestions: completed ? 2 : 0,
      starsEarned: clampStationStars(station.stars),
    }
  }

  for (let ruleId = 1; ruleId < AIKI_RULES_DATA.length; ruleId += 1) {
    if (result.rules[ruleId]?.status === 'completed' && result.rules[ruleId + 1]?.status === 'locked') {
      result.rules[ruleId + 1] = { ...result.rules[ruleId + 1], status: 'available' }
    }
  }

  result.totalStars = calculateCourseStars(course.stations, course.totalStars).earned
  result.totalXp = course.stations.reduce((sum, station) => sum + (station.xpEarned || 0), 0)
  result.unlockedPosters = Object.values(result.rules)
    .filter((rule) => rule.status === 'completed')
    .map((rule) => rule.ruleId)
  return result
}

export function useRulesProgress() {
  const [progress, setProgress] = useState<RulesOverallProgress>(createDefaultProgress)

  useEffect(() => {
    let cancelled = false
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      // Storage can be unavailable in privacy mode; server progress still works.
    }
    void learningApi.getPathway()
      .then((pathway) => {
        if (!cancelled) setProgress(rulesProgressFromPathway(pathway))
      })
      .catch(() => {
        // Fail closed with only rule 1 available. Never resurrect stale device data.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const completeRule = useCallback((ruleId: number, confirmedStars = 3) => {
    setProgress((prev) => {
      const starsEarned = clampStationStars(confirmedStars)

      const newRules = { ...prev.rules }
      newRules[ruleId] = {
        ruleId,
        status: 'completed',
        completedQuestions: 2,
        starsEarned,
        completedAt: new Date().toISOString(),
      }

      // Unlock next rule if it exists
      const nextId = ruleId + 1
      if (nextId <= 10 && newRules[nextId] && newRules[nextId].status === 'locked') {
        newRules[nextId] = {
          ...newRules[nextId],
          status: 'available',
        }
      }

      const unlockedPosters = prev.unlockedPosters.includes(ruleId)
        ? prev.unlockedPosters
        : [...prev.unlockedPosters, ruleId].sort((a, b) => a - b)

      return {
        rules: newRules,
        totalStars: Object.values(newRules).reduce(
          (sum, rule) => sum + clampStationStars(rule.starsEarned),
          0,
        ),
        totalXp: prev.totalXp,
        unlockedPosters,
      }
    })
  }, [])

  const resetProgress = useCallback(() => {
    setProgress(createDefaultProgress())
  }, [])

  const completedCount = Object.values(progress.rules).filter((r) => r.status === 'completed').length

  return {
    progress,
    completedCount,
    totalCount: AIKI_RULES_DATA.length,
    completeRule,
    resetProgress,
  }
}
