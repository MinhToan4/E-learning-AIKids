import { useEffect } from 'react'
import { useQuery, type QueryClient } from '@tanstack/react-query'
import { api, type User } from './api'
import { xpRequiredForLevel } from './creation/xp-levels'
import { useAuth } from '@/shared/store/auth'
import { queryClient as appQueryClient } from './query-client'

export type ProgressionSnapshot = {
  playerId: string
  totalXp: number
  level: number
  xpIntoLevel: number
  xpToNextLevel: number
  progressPercent: number
  version: number
  updatedAt: string
}

type ProgressionResponse = Partial<Omit<ProgressionSnapshot, 'playerId'>> & {
  totalXp: number
  level: number
}

const CACHE_PREFIX = 'aiki.progression.v1.'

export function progressionQueryKey(userId: string) {
  return ['progression', userId] as const
}

function normalizeProgression(userId: string, value: ProgressionResponse): ProgressionSnapshot {
  const totalXp = Math.max(0, Number(value.totalXp) || 0)
  const level = Math.max(1, Math.floor(Number(value.level) || 1))
  const currentFloor = xpRequiredForLevel(level)
  const nextFloor = xpRequiredForLevel(level + 1)
  const xpIntoLevel = Math.max(0, value.xpIntoLevel ?? totalXp - currentFloor)
  const xpToNextLevel = Math.max(0, value.xpToNextLevel ?? nextFloor - totalXp)
  const span = Math.max(1, nextFloor - currentFloor)
  const progressPercent = Math.min(100, Math.max(0,
    value.progressPercent ?? Math.round((xpIntoLevel / span) * 100),
  ))
  return {
    playerId: userId,
    totalXp,
    level,
    xpIntoLevel,
    xpToNextLevel,
    progressPercent,
    version: Math.max(0, Number(value.version) || 0),
    updatedAt: value.updatedAt || new Date().toISOString(),
  }
}

export function readProgressionSnapshot(user: User | null): ProgressionSnapshot | undefined {
  if (!user || typeof window === 'undefined') return undefined
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${user.id}`)
    if (raw) return normalizeProgression(user.id, JSON.parse(raw) as ProgressionResponse)
  } catch {}

  const totalXp = Math.max(0, user.xp || 0)
  const level = Math.max(1, user.level || 1)
  return normalizeProgression(user.id, { totalXp, level, version: 0 })
}

export function persistProgressionSnapshot(snapshot: ProgressionSnapshot): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${CACHE_PREFIX}${snapshot.playerId}`, JSON.stringify(snapshot))
    // Compatibility while legacy surfaces are migrated.
    localStorage.setItem('aiki_last_known_xp', String(snapshot.totalXp))
    localStorage.setItem('aiki_last_known_level', String(snapshot.level))
  } catch {}
}

export async function fetchProgressionSnapshot(userId: string): Promise<ProgressionSnapshot> {
  const response = await api<ProgressionResponse>('/api/gamification/profile')
  const snapshot = normalizeProgression(userId, response)
  persistProgressionSnapshot(snapshot)
  const currentUser = useAuth.getState().user
  if (currentUser?.id === userId &&
      (currentUser.xp !== snapshot.totalXp || currentUser.level !== snapshot.level)) {
    useAuth.getState().setUser({ ...currentUser, xp: snapshot.totalXp, level: snapshot.level })
  }
  return snapshot
}

export function prefetchProgression(userId: string): Promise<ProgressionSnapshot> {
  return appQueryClient.fetchQuery({
    queryKey: progressionQueryKey(userId),
    queryFn: () => fetchProgressionSnapshot(userId),
    staleTime: 60_000,
  })
}

export function setProgressionSnapshot(
  client: QueryClient,
  userId: string,
  value: ProgressionResponse,
): ProgressionSnapshot {
  const snapshot = normalizeProgression(userId, value)
  client.setQueryData(progressionQueryKey(userId), snapshot)
  persistProgressionSnapshot(snapshot)
  return snapshot
}

export function applyConfirmedXpDelta(
  client: QueryClient,
  user: User,
  earnedXp: number,
): ProgressionSnapshot {
  const current = client.getQueryData<ProgressionSnapshot>(progressionQueryKey(user.id))
    ?? readProgressionSnapshot(user)
    ?? normalizeProgression(user.id, { totalXp: user.xp, level: user.level })
  const totalXp = current.totalXp + Math.max(0, earnedXp)
  const level = Math.max(current.level, Math.floor(totalXp / 100) + 1)
  return setProgressionSnapshot(client, user.id, {
    totalXp,
    level,
    version: current.version + 1,
    updatedAt: new Date().toISOString(),
  })
}

export function useProgression(user: User | null) {
  const client = appQueryClient
  const userId = user?.id
  const query = useQuery({
    queryKey: progressionQueryKey(userId ?? 'anonymous'),
    queryFn: () => fetchProgressionSnapshot(userId!),
    enabled: Boolean(userId),
    initialData: () => readProgressionSnapshot(user),
    initialDataUpdatedAt: 0,
  }, client)

  useEffect(() => {
    if (!userId) return
    let reconcileTimer: ReturnType<typeof setTimeout> | undefined
    const refresh = (event: Event) => {
      const detail = (event as CustomEvent<{ xp?: number; level?: number }>).detail
      if (typeof detail?.xp === 'number' && typeof detail?.level === 'number') {
        setProgressionSnapshot(client, userId, {
          totalXp: detail.xp,
          level: detail.level,
        })
        // The Hub may update its read model shortly after accepting completion.
        // Keep the confirmed value visible, then reconcile quietly in the background.
        clearTimeout(reconcileTimer)
        reconcileTimer = setTimeout(() => {
          void client.invalidateQueries({ queryKey: progressionQueryKey(userId) })
        }, 5_000)
        return
      }
      void client.invalidateQueries({ queryKey: progressionQueryKey(userId) })
    }
    window.addEventListener('aikids:xp-updated', refresh)
    return () => {
      clearTimeout(reconcileTimer)
      window.removeEventListener('aikids:xp-updated', refresh)
    }
  }, [client, userId])

  return query
}
