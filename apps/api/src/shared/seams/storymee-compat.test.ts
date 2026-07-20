import { describe, expect, it } from 'vitest'
import {
  AIKIDS_API_MOUNT,
  AIKIDS_SESSION_COOKIE,
  buildSessionCookieOptions,
  mapRoleToStoryMee,
  normalizeApiAliasPrefix,
  rewriteAliasToPrimaryApi,
  seamHealthMeta,
  toStoryMeeAccount,
} from './storymee-compat.js'

describe('storymee-compat seams', () => {
  it('maps public user to StoryMee account without dropping fields', () => {
    const account = toStoryMeeAccount({
      id: 'u1',
      role: 'student',
      email: null,
      nickname: 'MựcCon',
      avatarId: 'avatar-star',
      level: 2,
      xp: 40,
      onboarded: true,
      goal: 'comic',
      parentId: 'p1',
      classId: 'c1',
    })
    expect(account.id).toBe('u1')
    expect(account.role).toBe('student')
    expect(account.displayName).toBe('MựcCon')
    expect(account.profile.product).toBe('aikids')
    expect(account.profile.xp).toBe(40)
    expect(account.profile.parentId).toBe('p1')
  })

  it('maps known roles and defaults unknown', () => {
    expect(mapRoleToStoryMee('admin')).toBe('admin')
    expect(mapRoleToStoryMee('teacher')).toBe('teacher')
    expect(mapRoleToStoryMee('weird')).toBe('student')
  })

  it('builds cookie options with optional domain', () => {
    const withDomain = buildSessionCookieOptions({
      secure: true,
      sameSite: 'lax',
      maxAgeSeconds: 120,
      domain: '.storymee.local',
    })
    expect(withDomain.httpOnly).toBe(true)
    expect(withDomain.domain).toBe('.storymee.local')
    expect(withDomain.path).toBe('/')

    const bare = buildSessionCookieOptions({
      secure: false,
      sameSite: 'strict',
      maxAgeSeconds: 60,
    })
    expect(bare.domain).toBeUndefined()
    expect(bare.sameSite).toBe('strict')
  })

  it('normalizes API alias prefix', () => {
    expect(normalizeApiAliasPrefix('')).toBe('')
    expect(normalizeApiAliasPrefix('/api')).toBe('')
    expect(normalizeApiAliasPrefix('api/aikids')).toBe('/api/aikids')
    expect(normalizeApiAliasPrefix('/api/aikids/')).toBe('/api/aikids')
  })

  it('rewrites alias paths to primary /api mount', () => {
    expect(rewriteAliasToPrimaryApi('/api/aikids/health', '/api/aikids')).toBe(
      '/api/health',
    )
    expect(
      rewriteAliasToPrimaryApi('/api/aikids/courses/x?q=1', '/api/aikids'),
    ).toBe('/api/courses/x?q=1')
    expect(rewriteAliasToPrimaryApi('/api/aikids', '/api/aikids')).toBe(
      AIKIDS_API_MOUNT,
    )
    expect(rewriteAliasToPrimaryApi('/api/health', '/api/aikids')).toBeNull()
    expect(rewriteAliasToPrimaryApi('/api/health', '')).toBeNull()
  })

  it('seam health meta is stable for ops', () => {
    const meta = seamHealthMeta({
      cookieDomain: '.example.com',
      apiAliasPrefix: '/api/aikids',
    })
    expect(meta.sessionCookie).toBe(AIKIDS_SESSION_COOKIE)
    expect(meta.apiAlias).toBe('/api/aikids')
    expect(meta.cookieDomain).toBe('.example.com')
    expect(meta.modules.length).toBeGreaterThan(0)
  })
})
