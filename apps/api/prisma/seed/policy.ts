/**
 * Whether to skip **demo user** password/recreate path.
 * Catalog upsert always runs (CMS-safe). Docker SEED_ON_START=never skips whole seed.
 */
export function shouldSkipDemoUsers(adultCount: number): boolean {
  if (process.env.SEED_FORCE === 'true') return false
  return adultCount > 0
}

/** @deprecated use shouldSkipDemoUsers — kept for test aliases */
export function shouldSkipSeed(courseCount: number): boolean {
  return shouldSkipDemoUsers(courseCount)
}
