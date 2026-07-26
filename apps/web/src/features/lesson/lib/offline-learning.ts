import { api } from '@/shared/lib/api'

const CACHE_NAME = 'aikids-learning-v1'
const DEVICE_KEY = 'aikids.learning.device-id'
const GRANT_PREFIX = 'aikids.learning.offline-grant.'
const EVENT_PREFIX = 'aikids.learning.offline-events.'

export type OfflineManifest = {
  grantId: string
  questId: string
  contentVersion: number
  expiresAt: string
  lesson: {
    title: string
    hook: string
    skill: string
    learnCards: Array<Record<string, unknown>>
    stations: Array<Record<string, unknown>>
  }
  media: string[]
}

type OfflineGrantRecord = {
  grantId: string
  contentVersion: number
  expiresAt: string
}

export type OfflineProgressEvent = {
  clientEventId: string
  percent: number
  positionSeconds: number
  sectionId: string | null
  occurredAt: string
}

export function learningDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_KEY)
  if (existing) return existing
  const created = `web.${crypto.randomUUID()}`
  localStorage.setItem(DEVICE_KEY, created)
  return created
}

function offlineUrl(questId: string) {
  return new URL(`/offline-lessons/${encodeURIComponent(questId)}.json`, window.location.origin)
    .toString()
}

export async function cacheOfflineManifest(manifest: OfflineManifest) {
  if (!('caches' in window)) throw new Error('Trình duyệt chưa hỗ trợ bộ nhớ ngoại tuyến.')
  const cache = await caches.open(CACHE_NAME)
  await cache.put(
    offlineUrl(manifest.questId),
    new Response(JSON.stringify(manifest), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    }),
  )
  await Promise.allSettled(
    manifest.media.map(async (url) => {
      const response = await fetch(url, { mode: 'no-cors' })
      await cache.put(url, response)
    }),
  )
  localStorage.setItem(
    `${GRANT_PREFIX}${manifest.questId}`,
    JSON.stringify({
      grantId: manifest.grantId,
      contentVersion: manifest.contentVersion,
      expiresAt: manifest.expiresAt,
    } satisfies OfflineGrantRecord),
  )
}

export async function cachedOfflineManifest(
  questId: string,
): Promise<OfflineManifest | null> {
  if (!('caches' in window)) return null
  const response = await (await caches.open(CACHE_NAME)).match(offlineUrl(questId))
  if (!response) return null
  const manifest = (await response.json()) as OfflineManifest
  if (new Date(manifest.expiresAt).getTime() <= Date.now()) return null
  return manifest
}

export function queueOfflineProgress(
  questId: string,
  input: Omit<OfflineProgressEvent, 'clientEventId' | 'occurredAt'>,
) {
  const key = `${EVENT_PREFIX}${questId}`
  let current: OfflineProgressEvent[] = []
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown
    if (Array.isArray(parsed)) current = parsed as OfflineProgressEvent[]
  } catch {
    current = []
  }
  current.push({
    ...input,
    clientEventId: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
  })
  localStorage.setItem(key, JSON.stringify(current.slice(-100)))
}

export async function syncOfflineProgress(questId: string) {
  const grantRaw = localStorage.getItem(`${GRANT_PREFIX}${questId}`)
  const eventsRaw = localStorage.getItem(`${EVENT_PREFIX}${questId}`)
  if (!grantRaw || !eventsRaw) return { accepted: 0, duplicate: 0 }
  const grant = JSON.parse(grantRaw) as OfflineGrantRecord
  const events = JSON.parse(eventsRaw) as OfflineProgressEvent[]
  if (events.length === 0) return { accepted: 0, duplicate: 0 }
  const result = await api<{ accepted: number; duplicate: number }>(
    `/api/learning/quests/${questId}/offline-sync`,
    {
      method: 'POST',
      body: JSON.stringify({
        grantId: grant.grantId,
        deviceId: learningDeviceId(),
        contentVersion: grant.contentVersion,
        events,
      }),
    },
  )
  localStorage.removeItem(`${EVENT_PREFIX}${questId}`)
  return result
}

export function hasOfflineGrant(questId: string) {
  const raw = localStorage.getItem(`${GRANT_PREFIX}${questId}`)
  if (!raw) return false
  try {
    return new Date((JSON.parse(raw) as OfflineGrantRecord).expiresAt).getTime() > Date.now()
  } catch {
    return false
  }
}

export async function clearOfflineLearningData() {
  if ('caches' in window) await caches.delete(CACHE_NAME)
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index)
    if (
      key &&
      (key.startsWith(GRANT_PREFIX) ||
        key.startsWith(EVENT_PREFIX) ||
        key === DEVICE_KEY)
    ) {
      localStorage.removeItem(key)
    }
  }
}
