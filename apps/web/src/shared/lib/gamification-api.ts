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
  update<T = unknown>(id: string, body: Record<string, unknown>) {
    return api<T>(`/api/admin/legend-studio/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) })
  },
  transition<T = unknown>(id: string, action: 'publish' | 'retire') {
    return api<T>(`/api/admin/legend-studio/${encodeURIComponent(id)}/${action}`, { method: 'POST' })
  },
}
