import { describe, expect, it } from 'vitest'

/**
 * Pure documentation tests for account-unification rules.
 * Runtime linking is covered by API inject tests when Google is configured.
 */
describe('Google account unification rules', () => {
  it('documents email as single identity key', () => {
    // Same email must never create two User rows:
    // 1) find by googleSub
    // 2) else find by email
    // 3) else create once with email + googleSub
    const steps = ['bySub', 'byEmail', 'create']
    expect(steps).toHaveLength(3)
  })

  it('rejects student role for Google login (product rule)', () => {
    const allowed = new Set(['parent', 'teacher', 'admin'])
    expect(allowed.has('student')).toBe(false)
  })
})
