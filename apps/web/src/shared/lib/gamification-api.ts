import { api, type AchievementRow } from './api'

export const gamificationApi = {
  achievements() {
    return api<{ achievements: AchievementRow[] }>('/api/gamification/achievements')
  },
  catalog<T>(query = '') {
    return api<T>(`/api/gamification/catalog${query ? `?${query}` : ''}`)
  },
  profile<T>() {
    return api<T>('/api/gamification/profile')
  },
  storybook<T>() {
    return api<T>('/api/gamification/storybook')
  },
  equip<T>(kind: string, body: Record<string, unknown>) {
    return api<T>(`/api/gamification/rewards/equipment/${encodeURIComponent(kind)}`, {
      method: 'PUT', body: JSON.stringify(body),
    })
  },
}

export const legendStudioApi = {
  list<T>() {
    return api<T>('/api/admin/legend-studio')
  },
  create<T = unknown>(body: Record<string, unknown>) {
    return api<T>('/api/admin/legend-studio', { method: 'POST', body: JSON.stringify(body) })
  },
  importRuntimeAchievements<T = { created: number; skipped: number; failed: string[]; items: unknown[] }>(items: Array<Record<string, unknown>>) {
    return api<T>('/api/admin/legend-studio/import-runtime-achievements', {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({ items }),
    })
  },
  update<T = unknown>(id: string, body: Record<string, unknown>) {
    return api<T>(`/api/admin/legend-studio/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) })
  },
  transition<T = unknown>(id: string, action: 'publish' | 'retire') {
    return api<T>(`/api/admin/legend-studio/${encodeURIComponent(id)}/${action}`, { method: 'POST' })
  },
  archive<T = unknown>(id: string) {
    return api<T>(`/api/admin/legend-studio/${encodeURIComponent(id)}/retire`, { method: 'POST' })
  },
  revertToDraft<T = unknown>(id: string) {
    return api<T>(`/api/admin/legend-studio/${encodeURIComponent(id)}/revert-to-draft`, { method: 'POST' })
  },
  dependencies<T = unknown>(id: string) {
    return api<T>(`/api/admin/legend-studio/${encodeURIComponent(id)}/dependencies`)
  },
  audit<T = unknown>(id: string) {
    return api<T>(`/api/admin/legend-studio/${encodeURIComponent(id)}/audit`)
  },
}

export type RewardMappingStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'retired'
export type RewardRequirementType = 'xp_level' | 'action' | 'storybook_sticker' | 'event' | 'achievement'
export type RewardMapping = {
  id: string
  name: string
  status: RewardMappingStatus
  version: number
  requirement: {
    type: RewardRequirementType
    metric?: string
    operator?: 'gte' | 'eq'
    value: string | number
    chapter?: string
  }
  rewardIds: string[]
  updatedAt?: string
}

const rewardMappingPath = '/api/admin/reward-mappings'

export const rewardMappingApi = {
  list<T = { mappings: RewardMapping[] }>() {
    return api<T>(rewardMappingPath)
  },
  create<T = { mapping: RewardMapping }>(body: Omit<RewardMapping, 'id' | 'status' | 'version'>) {
    return api<T>(rewardMappingPath, { method: 'POST', body: JSON.stringify(body) })
  },
  update<T = { mapping: RewardMapping }>(id: string, body: Partial<RewardMapping>) {
    return api<T>(`${rewardMappingPath}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) })
  },
  transition<T = unknown>(id: string, action: 'review' | 'publish' | 'retire' | 'revert-to-draft') {
    return api<T>(`${rewardMappingPath}/${encodeURIComponent(id)}/${action}`, { method: 'POST' })
  },
  remove<T = unknown>(id: string) {
    return api<T>(`${rewardMappingPath}/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
  dependencies<T = unknown>(id: string) {
    return api<T>(`${rewardMappingPath}/${encodeURIComponent(id)}/dependencies`)
  },
  audit<T = unknown>(id: string) {
    return api<T>(`${rewardMappingPath}/${encodeURIComponent(id)}/audit`)
  },
}
