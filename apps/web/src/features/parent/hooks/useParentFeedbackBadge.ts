/**
 * useParentFeedbackBadge
 * WHY localStorage: No extra API endpoint needed. Typical parent has 1-3 children.
 * Trade-off: badge does not sync across devices (acceptable for MVP).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/shared/lib/api'
import { learningApi } from '@/shared/lib/learning-api'

const LS_PREFIX = 'fbd_seen_'
const POLL_INTERVAL_MS = 5 * 60 * 1000 // re-check every 5 min

type Child = { id: string; nickname: string | null }
type FeedbackItem = { publishedAt: string | null }

function lastSeenKey(childId: string) { return `${LS_PREFIX}${childId}` }

function getLastSeen(childId: string): number {
  try {
    const stored = localStorage.getItem(lastSeenKey(childId))
    return stored ? new Date(stored).getTime() : 0
  } catch { return 0 }
}

export function setFeedbackLastSeen(childId: string, timestamp: string) {
  try { localStorage.setItem(lastSeenKey(childId), timestamp) } catch { /* ignore */ }
}

export type ParentFeedbackBadge = {
  hasAny: boolean
  byChild: Record<string, boolean>
  markSeen: (childId: string) => void
}

export function useParentFeedbackBadge(userRole: string | undefined): ParentFeedbackBadge {
  const [byChild, setByChild] = useState<Record<string, boolean>>({})
  const unmounted = useRef(false)

  const check = useCallback(async () => {
    if (userRole !== 'parent') return
    try {
      const { children } = await api<{ children: Child[] }>('/api/parent/children')
      if (!children.length) return
      const results = await Promise.allSettled(
        children.map((child) =>
          learningApi.getChildTeacherFeedback<{ child: unknown; feedback: FeedbackItem[] }>(child.id)
            .then((res) => ({ childId: child.id, feedback: res.feedback })),
        ),
      )
      if (unmounted.current) return
      const next: Record<string, boolean> = {}
      for (const result of results) {
        if (result.status !== 'fulfilled') continue
        const { childId, feedback } = result.value
        if (!feedback.length) { next[childId] = false; continue }
        const latestMs = feedback.reduce<number>((max, item) => {
          if (!item.publishedAt) return max
          const t = new Date(item.publishedAt).getTime()
          return t > max ? t : max
        }, 0)
        next[childId] = latestMs > getLastSeen(childId)
      }
      setByChild(next)
    } catch { /* fail silently */ }
  }, [userRole])

  useEffect(() => {
    unmounted.current = false
    void check()
    const timer = setInterval(() => void check(), POLL_INTERVAL_MS)
    return () => { unmounted.current = true; clearInterval(timer) }
  }, [check])

  const markSeen = useCallback((childId: string) => {
    setFeedbackLastSeen(childId, new Date().toISOString())
    setByChild((prev) => ({ ...prev, [childId]: false }))
  }, [])

  return { hasAny: Object.values(byChild).some(Boolean), byChild, markSeen }
}
