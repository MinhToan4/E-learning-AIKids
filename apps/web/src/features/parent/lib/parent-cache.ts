import type { Approval, Child, HouseholdSub } from '../types/parent.types'

export interface DashboardCacheData {
  kids: Child[]
  approvals: Approval[]
  sub: HouseholdSub | null
}

const DEFAULT_TTL_MS = 60_000 // 60s TTL

let dashboardCache: {
  data: DashboardCacheData
  timestamp: number
} | null = null

const childLearningCache = new Map<
  string,
  {
    data: unknown
    timestamp: number
  }
>()

/**
 * Lấy dữ liệu Dashboard từ in-memory cache nếu còn trong hạn TTL (mặc định 60 giây).
 */
export function getDashboardCache(maxAge: number = DEFAULT_TTL_MS): DashboardCacheData | null {
  if (!dashboardCache) return null
  if (Date.now() - dashboardCache.timestamp > maxAge) {
    return null
  }
  return dashboardCache.data
}

/**
 * Lưu dữ liệu Dashboard vào in-memory cache.
 */
export function setDashboardCache(data: DashboardCacheData): void {
  dashboardCache = {
    data,
    timestamp: Date.now(),
  }
}

/**
 * Lấy dữ liệu học tập của một bé từ cache (SWR in-memory).
 */
export function getChildLearningCache<T = unknown>(
  childId: string,
  maxAge: number = DEFAULT_TTL_MS,
): T | null {
  if (!childId) return null
  const entry = childLearningCache.get(childId)
  if (!entry) return null
  if (Date.now() - entry.timestamp > maxAge) {
    return null
  }
  return entry.data as T
}

/**
 * Lưu dữ liệu học tập của một bé vào cache.
 */
export function setChildLearningCache<T = unknown>(childId: string, data: T): void {
  if (!childId) return
  childLearningCache.set(childId, {
    data,
    timestamp: Date.now(),
  })
}

/**
 * Xóa sạch toàn bộ in-memory cache phân hệ Phụ huynh
 * (khi thanh toán, thêm/xóa/đổi dữ liệu con).
 */
export function invalidateParentCache(): void {
  dashboardCache = null
  childLearningCache.clear()
}

// Tự động lắng nghe sự kiện reload dữ liệu phụ huynh trên toàn ứng dụng
if (typeof window !== 'undefined') {
  window.addEventListener('parent:reload-data', invalidateParentCache)
}
