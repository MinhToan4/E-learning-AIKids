import { useEffect } from 'react'
import { useQuery, type QueryClient } from '@tanstack/react-query'
import { api, ApiError, type User } from './api'
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

function requireProgressionResponse(value: unknown, source: string): ProgressionResponse {
  const record = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const totalXp = Number(record.totalXp)
  const level = Number(record.level)
  if (!Number.isFinite(totalXp) || totalXp < 0 || !Number.isFinite(level) || level < 1) {
    throw new ApiError(502, 'Dữ liệu cấp độ từ máy chủ chưa hợp lệ.', {
      code: 'INVALID_PROGRESSION_PAYLOAD',
      source,
    })
  }

  const optionalNonNegative = (key: string): number | undefined => {
    const raw = record[key]
    if (raw === undefined || raw === null || raw === '') return undefined
    const parsed = Number(raw)
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new ApiError(502, 'Dữ liệu cấp độ từ máy chủ chưa hợp lệ.', {
        code: 'INVALID_PROGRESSION_PAYLOAD',
        source,
        field: key,
      })
    }
    return parsed
  }

  return {
    ...record,
    totalXp,
    level: Math.floor(level),
    xpIntoLevel: optionalNonNegative('xpIntoLevel'),
    xpToNextLevel: optionalNonNegative('xpToNextLevel'),
    progressPercent: optionalNonNegative('progressPercent'),
    version: optionalNonNegative('version'),
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : undefined,
  }
}

export async function fetchProgressionSnapshot(userId: string): Promise<ProgressionSnapshot> {
  let response: unknown
  let source = 'progression-projection'
  try {
    response = await api<unknown>('/api/gamification/profile')
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 501)) {
      source = 'legacy-gamification-profile'
      response = await api<unknown>('/api/gamification/profile-legacy')
    } else {
      throw error
    }
  }
  const snapshot = normalizeProgression(userId, requireProgressionResponse(response, source))
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
    staleTime: 0,
  })
}

export function setProgressionSnapshot(
  client: QueryClient,
  userId: string,
  value: ProgressionResponse,
): ProgressionSnapshot {
  const snapshot = normalizeProgression(userId, value)
  client.setQueryData(progressionQueryKey(userId), snapshot)
  return snapshot
}

export function useProgression(user: User | null) {
  const client = appQueryClient
  const userId = user?.id
  const query = useQuery({
    queryKey: progressionQueryKey(userId ?? 'anonymous'),
    queryFn: () => fetchProgressionSnapshot(userId!),
    enabled: Boolean(userId),
    staleTime: 0,
    refetchOnMount: 'always',
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
