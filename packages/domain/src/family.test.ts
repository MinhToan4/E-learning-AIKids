import { describe, expect, it } from 'vitest'
import {
  canAddChildProfile,
  canEnrollUnderPlan,
  getPlanDefinition,
  isSubscriptionAccessActive,
  isValidChildPin,
  PLAN_CATALOG,
} from './family.js'

describe('family / household plans', () => {
  it('exposes free/plus/family catalog', () => {
    expect(PLAN_CATALOG.map((p) => p.code)).toEqual(['free', 'plus', 'family'])
    expect(getPlanDefinition('plus')?.maxChildren).toBe(3)
  })

  it('subscription active rules', () => {
    expect(
      isSubscriptionAccessActive({ status: 'active', currentPeriodEnd: null }),
    ).toBe(true)
    expect(isSubscriptionAccessActive({ status: 'expired' })).toBe(false)
    const future = new Date(Date.now() + 86_400_000)
    const past = new Date(Date.now() - 86_400_000)
    expect(
      isSubscriptionAccessActive({
        status: 'active',
        currentPeriodEnd: future,
      }),
    ).toBe(true)
    expect(
      isSubscriptionAccessActive({
        status: 'active',
        currentPeriodEnd: past,
      }),
    ).toBe(false)
  })

  it('seat and enroll gates', () => {
    expect(canAddChildProfile({ currentChildCount: 0, maxChildren: 1 }).ok).toBe(
      true,
    )
    expect(canAddChildProfile({ currentChildCount: 1, maxChildren: 1 }).ok).toBe(
      false,
    )
    expect(
      canEnrollUnderPlan({
        currentEnrollmentCount: 2,
        maxOpenCoursesPerChild: 2,
      }).ok,
    ).toBe(false)
    expect(
      canEnrollUnderPlan({
        currentEnrollmentCount: 1,
        maxOpenCoursesPerChild: 2,
      }).ok,
    ).toBe(true)
  })

  it('validates 6-digit child PIN', () => {
    expect(isValidChildPin('123456')).toBe(true)
    expect(isValidChildPin('1234')).toBe(false)
    expect(isValidChildPin('12')).toBe(false)
    expect(isValidChildPin('abcdef')).toBe(false)
  })
})
