/**
 * useParentFeedbackBadge
 * WHY localStorage: No extra API endpoint needed. Typical parent has 1-3 children.
 * Trade-off: badge does not sync across devices (acceptable for MVP).
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/shared/lib/api'
import { useAuth } from '@/shared/store/auth'
import { sessionGeneration } from '@/shared/lib/session-scope'

const LS_PREFIX = 'fbd_seen_'
const POLL_INTERVAL_MS = 5 * 60 * 1000 // re-check every 5 min

type FeedbackSummary = { children: Array<{ childId: string; latestPublishedAt: string | null }> }

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
  const userId = useAuth((state) => state.user?.id)
  const [byChild, setByChild] = useState<Record<string, boolean>>({})
  const unmounted = useRef(false)

  const check = useCallback(async () => {
    if (userRole !== 'parent' || document.visibilityState === 'hidden') return
    try {
      const scope = sessionGeneration
      const { children } = await api<FeedbackSummary>('/api/v1/lms/family/teacher-feedback/summary')
      if (unmounted.current || scope !== sessionGeneration) return
      const next: Record<string, boolean> = {}
      for (const child of children) {
        next[child.childId] = Boolean(child.latestPublishedAt &&
          new Date(child.latestPublishedAt).getTime() > getLastSeen(child.childId))
      }
      setByChild(next)
    } catch { /* fail silently */ }
  }, [userRole, userId])

  useEffect(() => {
    unmounted.current = false
    setByChild({})
    void check()
    const refresh = () => void check()
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('parent:reload-data', refresh)
    const timer = setInterval(() => void check(), POLL_INTERVAL_MS)
    return () => {
      unmounted.current = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('parent:reload-data', refresh)
    }
  }, [check])

  const markSeen = useCallback((childId: string) => {
    setFeedbackLastSeen(childId, new Date().toISOString())
    setByChild((prev) => ({ ...prev, [childId]: false }))
  }, [])

  return { hasAny: Object.values(byChild).some(Boolean), byChild, markSeen }
}
