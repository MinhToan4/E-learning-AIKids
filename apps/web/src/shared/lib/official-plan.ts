import { useState, useEffect, useCallback } from 'react'
import {
  DEFAULT_CATALOG_PLANS,
  getCachedBillingPlans,
  normalizePlanDef,
  type PlanDef,
} from '@/features/admin/types'
import { api } from '@/shared/lib/api'

export const AIKIDS_OFFICIAL_PLAN_ID = 'aikids_official_129k'

const PLANS_CACHE_TTL_MS = 60_000
export let cachedPlansPromise: Promise<PlanDef[]> | null = null
export let cachedPlansTimestamp: number = 0

async function fetchBillingPlansFromServer(): Promise<PlanDef[]> {
  try {
    const res = await api<PlanDef[] | { plans?: PlanDef[] }>('/api/admin/billing/plans')
    const rawList = Array.isArray(res) ? res : res?.plans
    if (Array.isArray(rawList) && rawList.length > 0) {
      const normalized = rawList.map(normalizePlanDef)
      try {
        localStorage.setItem('aikids_admin_billing_plans', JSON.stringify(normalized))
      } catch {
        /* ignore */
      }
      return normalized
    }
  } catch {
    // Fallback silently to cached / parent plans
    try {
      const parentRes = await api<{ plans?: PlanDef[] }>('/api/parent/plans')
      if (Array.isArray(parentRes?.plans) && parentRes.plans.length > 0) {
        const normalized = parentRes.plans.map(normalizePlanDef)
        return normalized
      }
    } catch {
      /* ignore */
    }
  }
  return getCachedBillingPlans()
}

export function fetchLatestOfficialPlans(): Promise<PlanDef[]> {
  const now = Date.now()
  if (cachedPlansPromise && now - cachedPlansTimestamp < PLANS_CACHE_TTL_MS) {
    return cachedPlansPromise
  }

  const promise = fetchBillingPlansFromServer()
    .then((result) => {
      cachedPlansTimestamp = Date.now()
      return result
    })
    .catch((err) => {
      cachedPlansPromise = null
      cachedPlansTimestamp = 0
      throw err
    })

  cachedPlansPromise = promise
  cachedPlansTimestamp = now
  return promise
}

if (typeof window !== 'undefined') {
  window.addEventListener('aikids:billing-plans-updated', () => {
    cachedPlansTimestamp = 0
    cachedPlansPromise = null
  })
}

/**
 * Format minor amount (VND) to display string (e.g. 129.000đ)
 */
export function formatPlanPrice(amountMinor: number): string {
  if (amountMinor <= 0) return 'Miễn phí'
  return `${amountMinor.toLocaleString('vi-VN')}đ`
}

/**
 * Resolve the canonical official AIKid learning package from available catalog plans
 */
export function getOfficialBillingPlan(plans?: PlanDef[]): PlanDef {
  const sourcePlans = plans && plans.length > 0 ? plans : getCachedBillingPlans()

  // 1. Exact match by official plan id
  const exact = sourcePlans.find((p) => p.id === AIKIDS_OFFICIAL_PLAN_ID)
  if (exact) return exact

  // 2. Match by keyword 'official' or 'chính thức' or 'aikid'
  const byKeyword = sourcePlans.find(
    (p) =>
      p.id?.toLowerCase().includes('official') ||
      p.id?.toLowerCase().includes('aikid') ||
      p.name?.toLowerCase().includes('chính thức') ||
      p.name?.toLowerCase().includes('aikid'),
  )
  if (byKeyword) return byKeyword

  // 3. Fallback to first paid plan
  const paid = sourcePlans.find((p) => p.requiresPayment && p.amountMinor > 0)
  if (paid) return paid

  // 4. Fallback to default catalog plan
  const fallback =
    DEFAULT_CATALOG_PLANS.find((p) => p.id === AIKIDS_OFFICIAL_PLAN_ID) ||
    DEFAULT_CATALOG_PLANS[2] ||
    DEFAULT_CATALOG_PLANS[0]

  return fallback
}

/**
 * React hook to access and dynamically subscribe to the official billing package.
 * Reacts immediately to changes made in Admin without requiring page reload.
 */
export function useOfficialBillingPlan() {
  const [plans, setPlans] = useState<PlanDef[]>(() => getCachedBillingPlans())

  const syncPlans = useCallback(() => {
    const cached = getCachedBillingPlans()
    setPlans(cached)
  }, [])

  useEffect(() => {
    // 1. Fetch server plans in background to refresh cache
    let isMounted = true
    const fetchLatest = async () => {
      try {
        const normalized = await fetchLatestOfficialPlans()
        if (isMounted && normalized.length > 0) {
          setPlans(normalized)
        }
      } catch {
        /* ignore */
      }
    }

    void fetchLatest()

    // 2. Listen to custom event when Admin saves a plan in PlanEditorModal
    const handlePlanUpdated = () => {
      cachedPlansTimestamp = 0
      cachedPlansPromise = null
      syncPlans()
    }

    // 3. Listen to localStorage storage events across browser tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aikids_admin_billing_plans') {
        cachedPlansTimestamp = 0
        cachedPlansPromise = null
        syncPlans()
      }
    }

    window.addEventListener('aikids:billing-plans-updated', handlePlanUpdated)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      isMounted = false
      window.removeEventListener('aikids:billing-plans-updated', handlePlanUpdated)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [syncPlans])

  const officialPlan = getOfficialBillingPlan(plans)
  const priceFormatted = formatPlanPrice(officialPlan.amountMinor)

  return {
    plans,
    officialPlan,
    priceFormatted,
    syncPlans,
  }
}
