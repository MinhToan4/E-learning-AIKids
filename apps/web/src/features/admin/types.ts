export type SystemInfo = {
  service: string
  time: string
  counts: {
    courses: number
    quests: number
    classes: number
    pendingApprovals: number
    usersByRole: Record<string, number>
  }
  vidtory?: { configured: boolean; maskedHint: string | null; source: string }
}

export type AdminUser = {
  id: string
  role: string
  email: string | null
  nickname: string | null
  name?: string | null
  active: boolean
  level: number
  xp: number
  createdAt: string
  loginUsername?: string | null
  authProviders?: string[]
  isFirebaseLinked?: boolean
  isGoogleLinked?: boolean
  firebaseUid?: string | null
  googleSub?: string | null
  platformRoles?: string[]
  personas?: string[]
  guardianParent?: { id: string; name: string | null; email: string | null; childProfileId?: string } | null
  children?: Array<{ id: string | null; profileId: string; name: string }>
  childrenCount?: number
}

export type DisplayAdminUser = AdminUser & {
  isChildInFamily?: boolean
}

export function groupUsersByFamilyList(
  list: AdminUser[],
): DisplayAdminUser[] {
  const visited = new Set<string>()
  const result: DisplayAdminUser[] = []

  // 1. Nhóm các Hộ gia đình: Phụ huynh đứng đầu, các con thụt dòng
  const parentsInList = list.filter((u) => {
    if (u.role === 'parent') return true
    if (u.children && u.children.length > 0) return true
    return list.some((c) => c.guardianParent?.id === u.id)
  })

  for (const parent of parentsInList) {
    if (visited.has(parent.id)) continue
    visited.add(parent.id)
    result.push({ ...parent, isChildInFamily: false })

    const childIdsFromParent = new Set((parent.children || []).map((c) => c.id).filter(Boolean))
    const childrenInList = list.filter((c) => {
      if (c.id === parent.id || visited.has(c.id)) return false
      return c.guardianParent?.id === parent.id || childIdsFromParent.has(c.id)
    })

    for (const child of childrenInList) {
      visited.add(child.id)
      result.push({ ...child, isChildInFamily: true })
    }
  }

  // 2. Nhóm các tài khoản khác (Admin, Giáo viên, Độc lập chưa xử lý)
  for (const u of list) {
    if (!visited.has(u.id)) {
      visited.add(u.id)
      result.push({ ...u, isChildInFamily: false })
    }
  }

  return result
}

export type CourseOverview = {
  id: string
  title: string
  shortTitle?: string
  status: string
  ageLabel?: string
  ageTrack?: string
  courseKey?: string
  enrollmentCount?: number
  questCount: number
  accessPolicy?: string
  priceAmountMinor?: string
  priceCurrency?: string
  teacherGrantPolicy?: string
  visibility?: string
  quests: Array<{ id: string; order: number; title: string; videoUrl: string | null; archived?: boolean }>
}

export type CourseReadiness = {
  ready: boolean
  issues: string[]
  stations: Array<{ id: string; title: string; ready: boolean; missing: string[] }>
}

export type Analytics = {
  time: string
  users: { active: number; byRole: Record<string, number> }
  courses: { open: number; soon: number }
  quests: { active: number; archived: number }
  learning: { completedProgress: number; enrollments: number; projects: number }
  trends: Array<{
    date: string
    newUsers: number
    completedQuests: number
    projects: number
  }>
}

export type ModelRow = { modelId: string; weight: number; label?: string; enabled?: boolean; percent?: number }
export type RoutingState = {
  baseURL: string
  image: { aspectRatio: string; resolution: string; mode?: string; models: ModelRow[] }
  video: { aspectRatio: string; duration: number; mode?: string; models: ModelRow[] }
}

export const emptyRouting = (): RoutingState => ({
  baseURL: 'https://bapi.vidtory.net',
  image: {
    aspectRatio: 'IMAGE_ASPECT_RATIO_LANDSCAPE',
    resolution: '1K',
    models: [{ modelId: 'gemini-3.1-flash-image-preview', weight: 100, label: 'Gemini Flash Image', enabled: true }],
  },
  video: {
    aspectRatio: 'VIDEO_ASPECT_RATIO_LANDSCAPE',
    duration: 6,
    models: [{ modelId: 'veo-3.1-fast-generate-001', weight: 100, label: 'Veo 3.1 Fast', enabled: true }],
  },
})

// ── Billing types ─────────────────────────────────────────────
export type PlanDef = {
  id: string
  name: string
  amountMinor: number
  currency: string
  monthlyCreateCredits: number
  maxChildren: number
  maxOpenCoursesPerChild?: number
  features: string[]
  requiresPayment: boolean
  badge?: string | null
  tagline?: string | null
  isActive?: boolean
  version?: number
  sortOrder?: number
  storageBytesLimit?: number
  activeSubscribers?: number
  interval?: string
}

export type BillingStats = {
  totalPaid: number
  totalFree: number
  totalPending: number
  totalExpired: number
}

export const DEFAULT_CATALOG_PLANS: PlanDef[] = [
  {
    id: 'free',
    name: 'Miễn Phí',
    currency: 'vnd',
    amountMinor: 0,
    monthlyCreateCredits: 5,
    maxChildren: 1,
    maxOpenCoursesPerChild: 1,
    storageBytesLimit: 524288000,
    interval: 'month',
    features: [
      '5 lượt tạo AI mỗi tháng',
      'Tối đa 1 hồ sơ trẻ',
      '1 khóa học đang mở mỗi trẻ',
      '500 MB lưu trữ ảnh AI vĩnh viễn',
    ],
    requiresPayment: false,
    isActive: true,
    badge: 'Miễn phí',
    version: 1,
  },
  {
    id: 'starter',
    name: 'Starter',
    currency: 'vnd',
    amountMinor: 69000,
    monthlyCreateCredits: 20,
    maxChildren: 2,
    maxOpenCoursesPerChild: 2,
    storageBytesLimit: 524288000,
    interval: 'month',
    features: [
      '20 lượt tạo AI mỗi tháng',
      'Tối đa 2 hồ sơ trẻ',
      '2 khóa học đang mở mỗi trẻ',
      '500 MB lưu trữ ảnh AI vĩnh viễn',
      'Hỗ trợ qua email',
    ],
    requiresPayment: true,
    isActive: true,
    badge: 'Khởi đầu 69K',
    version: 1,
  },
  {
    id: 'aikids_official_129k',
    name: 'AI Kid Chính Thức',
    currency: 'vnd',
    amountMinor: 129000,
    monthlyCreateCredits: 50,
    maxChildren: 2,
    maxOpenCoursesPerChild: 999,
    storageBytesLimit: 524288000,
    interval: 'month',
    features: [
      'Mở khóa toàn bộ Khóa học chính thức AI Kid (Lộ trình 6 chặng chuẩn Quốc tế)',
      '50 lượt tạo ảnh AI sáng tạo mỗi tháng (2.000đ/lượt)',
      'Tối đa 2 hồ sơ trẻ em trong gia đình cùng học',
      'Không giới hạn bài học và bài luyện tập tương tác',
      '500 MB lưu trữ tác phẩm tranh truyện và huy hiệu AI vĩnh viễn',
      'Cấp chứng chỉ hoàn thành khóa học chính thức',
    ],
    requiresPayment: true,
    isActive: true,
    badge: 'Tiêu chuẩn 129K',
    version: 1,
  },
  {
    id: 'premium_family',
    name: 'Premium Gia Đình',
    currency: 'vnd',
    amountMinor: 149000,
    monthlyCreateCredits: 60,
    maxChildren: 4,
    maxOpenCoursesPerChild: 5,
    storageBytesLimit: 524288000,
    interval: 'month',
    features: [
      '60 lượt tạo AI mỗi tháng',
      'Tối đa 4 hồ sơ trẻ',
      '5 khóa học đang mở mỗi trẻ',
      '500 MB lưu trữ ảnh AI vĩnh viễn',
      'Ưu tiên hàng đợi tạo ảnh AI',
    ],
    requiresPayment: true,
    isActive: true,
    badge: 'Bán chạy',
    version: 1,
  },
  {
    id: 'pro',
    name: 'Pro',
    currency: 'vnd',
    amountMinor: 349000,
    monthlyCreateCredits: 200,
    maxChildren: 8,
    maxOpenCoursesPerChild: 999,
    storageBytesLimit: 524288000,
    interval: 'month',
    features: [
      '200 lượt tạo AI mỗi tháng',
      'Tối đa 8 hồ sơ trẻ',
      'Không giới hạn khóa học đang mở',
      '500 MB lưu trữ ảnh AI vĩnh viễn',
      'Hỗ trợ ưu tiên VIP',
    ],
    requiresPayment: true,
    isActive: true,
    badge: 'VIP Siêu Cấp',
    version: 1,
  },
]

export function normalizePlanDef(p: any): PlanDef {
  const id = String(p.id || p.code || p.planId || '').toLowerCase()
  const rawPrice = p.amountMinor ?? p.priceMonthly ?? p.price ?? 0
  const amountMinor = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice) || 0
  const defaultCredits = id === 'starter' ? 50 : id === 'premium_family' ? 60 : id === 'pro' ? 200 : 5
  return {
    id: id || 'custom',
    name: p.name || id,
    tagline: p.tagline || '',
    currency: (p.currency || 'vnd').toLowerCase(),
    amountMinor: isNaN(amountMinor) ? 0 : amountMinor,
    monthlyCreateCredits: p.monthlyCreateCredits ?? defaultCredits,
    maxChildren: p.maxChildren ?? (id === 'starter' ? 2 : id === 'premium_family' ? 4 : id === 'pro' ? 8 : 1),
    maxOpenCoursesPerChild: p.maxOpenCoursesPerChild ?? (id === 'starter' ? 2 : id === 'premium_family' ? 5 : id === 'pro' ? 999 : 1),
    storageBytesLimit: p.storageBytesLimit ?? 524288000,
    interval: p.interval ?? 'month',
    features: Array.isArray(p.features) ? p.features : [],
    requiresPayment: p.requiresPayment ?? (amountMinor > 0),
    isActive: p.isActive !== false,
    badge: p.badge || (id === 'starter' ? 'Phổ biến' : id === 'premium_family' ? 'Bán chạy nhất' : id === 'pro' ? 'VIP' : undefined),
    version: p.version ?? 1,
    activeSubscribers: p.activeSubscribers,
  }
}

export function getCachedBillingPlans(): PlanDef[] {
  if (typeof window === 'undefined') return DEFAULT_CATALOG_PLANS
  try {
    const raw = localStorage.getItem('aikids_admin_billing_plans')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizePlanDef)
      }
    }
  } catch { /* ignore */ }
  return DEFAULT_CATALOG_PLANS
}

export type SubscriptionRow = {
  userId: string
  email: string | null
  name: string | null
  role: string
  active: boolean
  plan: string
  status: string
  expiresAt: string | null
  monthlyCreateCredits: number
  remainingCreateCredits: number
  createdAt: string
}

export type PendingIntent = {
  id: string
  publicId: string
  provider: string
  purpose: string
  amountMinor: string
  currency: string
  status: string
  userId: string | null
  userEmail: string | null
  userName: string | null
  paymentCode: string | null
  courseTitle: string | null
  createdAt: string
}

export type LoginLogItem = {
  id: string
  userId: string | null
  email: string | null
  outcome: string
  ipAddress: string | null
  reason: string | null
  createdAt: string
}

export type LoginLogSummary = {
  total: number
  byOutcome: Record<string, number>
  windowHours: number
  purgedAt: string
}

export type AdminTab =
  | 'system'
  | 'analytics'
  | 'logs'
  | 'ai'
  | 'users'
  | 'staff'
  | 'roles'
  | 'courses'
  | 'classes'
  | 'legends'
  | 'billing'
  | 'asmo'
  | 'affiliates'

// ── Affiliate & Commission types ──────────────────────────────
export interface AffiliateRow {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  ref_code: string
  commission_rate: number
  bank_name?: string | null
  bank_account?: string | null
  bank_account_name?: string | null
  status: 'active' | 'inactive' | string
  created_at: string
  updated_at: string
  total_orders?: number
  total_revenue_minor?: number
  total_commission_minor?: number
  pending_commission_minor?: number
  approved_commission_minor?: number
  paid_commission_minor?: number
}

export interface AffiliateCommissionRow {
  id: string
  affiliate_id: string
  order_code: string
  payment_intent_id?: string | null
  customer_name?: string | null
  customer_phone?: string | null
  customer_email?: string | null
  order_total_minor: number
  commission_amount_minor: number
  status: 'pending' | 'approved' | 'paid' | 'rejected' | string
  note?: string | null
  is_self_referral?: boolean
  created_at: string
  updated_at: string
  affiliate_name?: string
  affiliate_ref_code?: string
  affiliate_email?: string | null
  affiliate_phone?: string | null
  bank_name?: string | null
  bank_account?: string | null
  bank_account_name?: string | null
}

export interface AffiliateStats {
  total_affiliates: number
  total_active_affiliates: number
  total_orders: number
  total_revenue_minor: number
  total_commission_minor: number
  pending_commission_minor: number
  approved_commission_minor: number
  paid_commission_minor: number
  rejected_commission_minor: number
}

export const STUDENT_PARENT_ROLES = ['student', 'child', 'parent'] as const
export const STAFF_ROLES = ['admin', 'curriculum_lead', 'teacher'] as const

export type RoleDefinition = {
  key: string
  name: string
  description: string
  badgeColor: string
  userCount?: number
  isSystem?: boolean
}

export type PermissionItem = {
  key: string
  name: string
  description: string
  category: 'curriculum' | 'classroom' | 'users' | 'billing' | 'system'
}

export type PermissionCategory = {
  key: 'curriculum' | 'classroom' | 'users' | 'billing' | 'system'
  name: string
  icon: string
}

export const ROLE_LABELS: Record<string, string> = {
  student: 'Học sinh',
  child: 'Học sinh',
  parent: 'Phụ huynh',
  teacher: 'Giáo viên',
  admin: 'Quản trị viên',
  curriculum_lead: 'Trưởng ban chuyên môn',
  user: 'Người dùng',
}
