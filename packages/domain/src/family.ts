/**
 * Family / household rules: parent-owned child profiles + plan seats.
 * Pure functions only (no I/O). HTTP layer loads subscription rows then calls these.
 */

export type PlanCode = 'free' | 'plus' | 'family'

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'cancelled'
  | 'expired'

export type PlanDefinition = {
  code: PlanCode
  name: string
  tagline: string
  /** Max child profiles under one parent (household seats) */
  maxChildren: number
  /**
   * Max concurrent open-course enrollments per child.
   * Use a large number (e.g. 999) for “unlimited” in product copy.
   */
  maxOpenCoursesPerChild: number
  priceMonthly: number
  currency: string
  features: string[]
  sortOrder: number
}

/** Catalog of plans — source of truth for seed + domain checks */
export const PLAN_CATALOG: readonly PlanDefinition[] = [
  {
    code: 'free',
    name: 'Khám phá',
    tagline: '1 con · làm quen lộ trình Soft Clay',
    maxChildren: 1,
    maxOpenCoursesPerChild: 2,
    priceMonthly: 0,
    currency: 'VND',
    features: [
      '1 hồ sơ con do phụ huynh tạo',
      'Tối đa 2 khóa đang mở mỗi con',
      'Ba lô riêng tư + duyệt chia sẻ',
    ],
    sortOrder: 1,
  },
  {
    code: 'plus',
    name: 'Gia đình Plus',
    tagline: '3 con · học đầy đủ L1/L2',
    maxChildren: 3,
    maxOpenCoursesPerChild: 12,
    priceMonthly: 199_000,
    currency: 'VND',
    features: [
      'Tối đa 3 hồ sơ con',
      'Gần như đủ khóa L1 + L2',
      'Ưu tiên hỗ trợ phụ huynh',
    ],
    sortOrder: 2,
  },
  {
    code: 'family',
    name: 'Gia đình Full',
    tagline: '5 con · không giới hạn khóa mở',
    maxChildren: 5,
    maxOpenCoursesPerChild: 999,
    priceMonthly: 349_000,
    currency: 'VND',
    features: [
      'Tối đa 5 hồ sơ con',
      'Không giới hạn số khóa đang mở',
      'Phù hợp hộ nhiều con / nhiều thiết bị',
    ],
    sortOrder: 3,
  },
] as const

export function getPlanDefinition(code: string): PlanDefinition | undefined {
  return PLAN_CATALOG.find((p) => p.code === code)
}

/** Active for access: active or trialing, and not past period end when set */
export function isSubscriptionAccessActive(input: {
  status: string
  currentPeriodEnd?: Date | string | null
  now?: Date
}): boolean {
  if (input.status !== 'active' && input.status !== 'trialing') return false
  if (!input.currentPeriodEnd) return true
  const end =
    typeof input.currentPeriodEnd === 'string'
      ? new Date(input.currentPeriodEnd)
      : input.currentPeriodEnd
  if (Number.isNaN(end.getTime())) return true
  const now = input.now ?? new Date()
  return end.getTime() > now.getTime()
}

export function canAddChildProfile(input: {
  currentChildCount: number
  maxChildren: number
}): { ok: true } | { ok: false; reason: string } {
  if (input.currentChildCount >= input.maxChildren) {
    return {
      ok: false,
      reason: `Gói hiện tại chỉ thêm được tối đa ${input.maxChildren} bạn nhỏ. Ba/mẹ chọn gói lớn hơn để thêm nhé.`,
    }
  }
  return { ok: true }
}

export function canEnrollUnderPlan(input: {
  currentEnrollmentCount: number
  maxOpenCoursesPerChild: number
}): { ok: true } | { ok: false; reason: string } {
  if (input.currentEnrollmentCount >= input.maxOpenCoursesPerChild) {
    return {
      ok: false,
      reason: `Gói hiện tại cho phép tối đa ${input.maxOpenCoursesPerChild} khóa học mỗi bạn. Ba/mẹ nâng gói hoặc tạm dừng khóa khác nhé.`,
    }
  }
  return { ok: true }
}

/** 6-digit child PIN for shared devices (optional) */
export function isValidChildPin(pin: string): boolean {
  return /^\d{6}$/.test(pin)
}

export const CHILD_PIN_LENGTH = 6
