import { useState, useEffect, useCallback } from 'react'
import type { RulesOverallProgress, RuleUserProgress } from '../types'
import { AIKI_RULES_DATA } from '../data/rules-data'

const STORAGE_KEY = 'aikids_golden_rules_progress_v1'

function getInitialProgress(): RulesOverallProgress {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return createDefaultProgress()
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as RulesOverallProgress
      if (parsed && parsed.rules && Object.keys(parsed.rules).length >= 10) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('Failed to load rules progress from localStorage', e)
  }
  return createDefaultProgress()
}

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

export function useRulesProgress() {
  const [progress, setProgress] = useState<RulesOverallProgress>(getInitialProgress)

  useEffect(() => {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch (e) {
      console.warn('Failed to save rules progress to localStorage', e)
    }
  }, [progress])

  const completeRule = useCallback((ruleId: number) => {
    setProgress((prev) => {
      const currentRule = prev.rules[ruleId]
      const wasCompleted = currentRule?.status === 'completed'

      const newRules = { ...prev.rules }
      newRules[ruleId] = {
        ruleId,
        status: 'completed',
        completedQuestions: 2,
        starsEarned: 3,
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

      const addedStars = wasCompleted ? 0 : 3
      const addedXp = wasCompleted ? 0 : 10

      return {
        rules: newRules,
        totalStars: prev.totalStars + addedStars,
        totalXp: prev.totalXp + addedXp,
        unlockedPosters,
      }
    })
  }, [])

  const resetProgress = useCallback(() => {
    const defaultData = createDefaultProgress()
    setProgress(defaultData)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  const completedCount = Object.values(progress.rules).filter((r) => r.status === 'completed').length

  return {
    progress,
    completedCount,
    totalCount: 10,
    completeRule,
    resetProgress,
  }
}
