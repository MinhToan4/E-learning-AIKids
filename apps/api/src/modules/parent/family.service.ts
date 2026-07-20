/**
 * Household entitlement: billing parent owns plan; child profiles inherit access.
 */
import {
  canAddChildProfile,
  canEnrollUnderPlan,
  getPlanDefinition,
  isSubscriptionAccessActive,
  PLAN_CATALOG,
  type PlanCode,
} from '@aikids/domain'
import { prisma } from '../../infrastructure/database/prisma.js'

export async function ensurePlanCatalog(): Promise<void> {
  for (const p of PLAN_CATALOG) {
    await prisma.plan.upsert({
      where: { id: p.code },
      create: {
        id: p.code,
        code: p.code,
        name: p.name,
        tagline: p.tagline,
        maxChildren: p.maxChildren,
        maxOpenCoursesPerChild: p.maxOpenCoursesPerChild,
        priceMonthly: p.priceMonthly,
        currency: p.currency,
        featuresJson: JSON.stringify(p.features),
        sortOrder: p.sortOrder,
        active: true,
      },
      update: {
        name: p.name,
        tagline: p.tagline,
        maxChildren: p.maxChildren,
        maxOpenCoursesPerChild: p.maxOpenCoursesPerChild,
        priceMonthly: p.priceMonthly,
        currency: p.currency,
        featuresJson: JSON.stringify(p.features),
        sortOrder: p.sortOrder,
        active: true,
      },
    })
  }
}

/** Ensure parent has at least Free (Khám phá) — same as Khan free tier */
export async function ensureHouseholdSubscription(parentUserId: string) {
  await ensurePlanCatalog()
  const existing = await prisma.subscription.findFirst({
    where: {
      parentUserId,
      status: { in: ['active', 'trialing'] },
    },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  })
  if (existing && isSubscriptionAccessActive(existing)) {
    return existing
  }

  // Expire stale rows then create free
  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: { status: 'expired' },
    })
  }

  return prisma.subscription.create({
    data: {
      parentUserId,
      planId: 'free',
      status: 'active',
      seats: getPlanDefinition('free')!.maxChildren,
      provider: 'manual',
      currentPeriodEnd: null,
    },
    include: { plan: true },
  })
}

export type HouseholdEntitlement = {
  planCode: PlanCode
  planName: string
  status: string
  maxChildren: number
  maxOpenCoursesPerChild: number
  childCount: number
  seatsRemaining: number
  currentPeriodEnd: Date | null
  features: string[]
  subscriptionId: string
}

export async function getHouseholdEntitlement(
  parentUserId: string,
): Promise<HouseholdEntitlement> {
  const sub = await ensureHouseholdSubscription(parentUserId)
  const def = getPlanDefinition(sub.plan.code) ?? getPlanDefinition('free')!
  const childCount = await prisma.user.count({
    where: { parentId: parentUserId, role: 'student', active: true },
  })
  let features: string[] = def.features
  try {
    features = JSON.parse(sub.plan.featuresJson) as string[]
  } catch {
    /* keep def */
  }

  return {
    planCode: def.code,
    planName: sub.plan.name,
    status: sub.status,
    maxChildren: sub.plan.maxChildren,
    maxOpenCoursesPerChild: sub.plan.maxOpenCoursesPerChild,
    childCount,
    seatsRemaining: Math.max(0, sub.plan.maxChildren - childCount),
    currentPeriodEnd: sub.currentPeriodEnd,
    features,
    subscriptionId: sub.id,
  }
}

export async function assertParentCanAddChild(parentUserId: string) {
  const ent = await getHouseholdEntitlement(parentUserId)
  const gate = canAddChildProfile({
    currentChildCount: ent.childCount,
    maxChildren: ent.maxChildren,
  })
  if (!gate.ok) {
    const err = new Error(gate.reason) as Error & { statusCode: number }
    err.statusCode = 402
    throw err
  }
  return ent
}

/**
 * Resolve household entitlement for a student (via parentId).
 * Students without parent cannot enroll under family plans.
 */
export async function assertStudentCanEnroll(studentUserId: string) {
  const student = await prisma.user.findUnique({
    where: { id: studentUserId },
    select: { id: true, role: true, parentId: true, active: true },
  })
  if (!student || student.role !== 'student' || !student.active) {
    const err = new Error(
      'Tài khoản học chưa sẵn sàng. Hỏi ba/mẹ kiểm tra giúp nhé.',
    ) as Error & { statusCode: number; logCode?: string }
    err.statusCode = 403
    err.logCode = 'STUDENT_INVALID'
    throw err
  }
  if (!student.parentId) {
    const err = new Error(
      'Hồ sơ học cần ba/mẹ tạo trước. Nhờ ba/mẹ thêm con trong ứng dụng nhé.',
    ) as Error & { statusCode: number; logCode?: string }
    err.statusCode = 403
    err.logCode = 'NO_PARENT_LINK'
    throw err
  }

  const ent = await getHouseholdEntitlement(student.parentId)
  if (
    !isSubscriptionAccessActive({
      status: ent.status,
      currentPeriodEnd: ent.currentPeriodEnd,
    })
  ) {
    const err = new Error(
      'Gói học của gia đình đã hết hạn. Ba/mẹ mở lại gói để con học tiếp nhé.',
    ) as Error & { statusCode: number; logCode?: string }
    err.statusCode = 402
    err.logCode = 'SUBSCRIPTION_INACTIVE'
    throw err
  }

  const enrollmentCount = await prisma.enrollment.count({
    where: { userId: studentUserId },
  })
  const gate = canEnrollUnderPlan({
    currentEnrollmentCount: enrollmentCount,
    maxOpenCoursesPerChild: ent.maxOpenCoursesPerChild,
  })
  if (!gate.ok) {
    const err = new Error(gate.reason) as Error & { statusCode: number }
    err.statusCode = 402
    throw err
  }
  return ent
}

export async function changeHouseholdPlan(
  parentUserId: string,
  planCode: PlanCode,
) {
  await ensurePlanCatalog()
  const plan = await prisma.plan.findUnique({ where: { id: planCode } })
  if (!plan || !plan.active) {
    const err = new Error('Gói không tồn tại') as Error & { statusCode: number }
    err.statusCode = 404
    throw err
  }

  const childCount = await prisma.user.count({
    where: { parentId: parentUserId, role: 'student', active: true },
  })
  if (childCount > plan.maxChildren) {
    const err = new Error(
      `Gia đình đang có ${childCount} bạn nhỏ, trong khi gói ${plan.name} chỉ cho ${plan.maxChildren}. Ba/mẹ tạm khóa bớt hồ sơ hoặc chọn gói lớn hơn nhé.`,
    ) as Error & { statusCode: number; logCode?: string }
    err.statusCode = 400
    err.logCode = 'PLAN_DOWNGRADE_SEATS'
    throw err
  }

  // Close previous active
  await prisma.subscription.updateMany({
    where: {
      parentUserId,
      status: { in: ['active', 'trialing'] },
    },
    data: { status: 'cancelled' },
  })

  const periodEnd =
    planCode === 'free'
      ? null
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  return prisma.subscription.create({
    data: {
      parentUserId,
      planId: plan.id,
      status: planCode === 'free' ? 'active' : 'active',
      seats: plan.maxChildren,
      provider: 'manual',
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd,
    },
    include: { plan: true },
  })
}
