/**
 * StoryMee 2-MCP-Core merge seams — pure helpers, no I/O.
 *
 * AI Kids remains a modular Fastify app. These helpers document and enforce
 * compatible shapes so we can later share session cookies / gateway mounts
 * with core-account-api without rewriting modules.
 *
 * @see docs/PRODUCTION_AND_MERGE.md
 */

/** Session cookie name used by AI Kids today */
export const AIKIDS_SESSION_COOKIE = 'aikids_session'

/**
 * Future shared cookie name when SSO is enabled with StoryMee gateway.
 * Do not flip production to this until both services agree on token format.
 */
export const STORYMEE_SESSION_COOKIE_CANDIDATE = 'storymee_session'

/** Primary public API mount (routes already include this prefix) */
export const AIKIDS_API_MOUNT = '/api'

/** Optional alias mount for gateway-style routing (env API_ALIAS_PREFIX) */
export const AIKIDS_API_ALIAS_DEFAULT = '/api/aikids'

export type StoryMeeRole =
  | 'student'
  | 'parent'
  | 'teacher'
  | 'admin'
  | 'content_editor'

export type AikidsPublicUser = {
  id: string
  role: string
  email: string | null
  nickname: string | null
  avatarId: string | null
  level: number
  xp: number
  onboarded: boolean
  goal: string | null
  parentId: string | null
  classId: string | null
}

/**
 * StoryMee-oriented account projection (core-account-api-ish).
 * Extra AI Kids fields stay under `profile` so merge stays non-destructive.
 */
export type StoryMeeAccountShape = {
  id: string
  role: StoryMeeRole
  email: string | null
  displayName: string | null
  active: true
  profile: {
    nickname: string | null
    avatarId: string | null
    level: number
    xp: number
    onboarded: boolean
    goal: string | null
    parentId: string | null
    classId: string | null
    product: 'aikids'
  }
}

const ROLE_MAP: Record<string, StoryMeeRole> = {
  student: 'student',
  parent: 'parent',
  teacher: 'teacher',
  admin: 'admin',
  content_editor: 'content_editor',
}

export function mapRoleToStoryMee(role: string): StoryMeeRole {
  return ROLE_MAP[role] ?? 'student'
}

/** Map AI Kids public user → StoryMee-compatible account DTO */
export function toStoryMeeAccount(user: AikidsPublicUser): StoryMeeAccountShape {
  return {
    id: user.id,
    role: mapRoleToStoryMee(user.role),
    email: user.email,
    displayName: user.nickname,
    active: true,
    profile: {
      nickname: user.nickname,
      avatarId: user.avatarId,
      level: user.level,
      xp: user.xp,
      onboarded: user.onboarded,
      goal: user.goal,
      parentId: user.parentId,
      classId: user.classId,
      product: 'aikids',
    },
  }
}

export type CookieSeamOptions = {
  path: string
  httpOnly: boolean
  secure: boolean
  sameSite: 'lax' | 'strict' | 'none'
  maxAge: number
  /** Optional domain for cross-subdomain SSO (e.g. .storymee.com) */
  domain?: string
}

/**
 * Build cookie options for session set/clear.
 * When COOKIE_DOMAIN is set, both AI Kids and StoryMee can share the domain.
 */
export function buildSessionCookieOptions(input: {
  secure: boolean
  sameSite: 'lax' | 'strict' | 'none'
  maxAgeSeconds: number
  domain?: string
}): CookieSeamOptions {
  const opts: CookieSeamOptions = {
    path: '/',
    httpOnly: true,
    secure: input.secure,
    sameSite: input.sameSite,
    maxAge: input.maxAgeSeconds,
  }
  const domain = input.domain?.trim()
  if (domain) opts.domain = domain
  return opts
}

/**
 * Normalize optional alias prefix (e.g. `/api/aikids` → `/api/aikids`).
 * Empty / invalid → empty string (no alias).
 */
export function normalizeApiAliasPrefix(raw: string | undefined): string {
  if (!raw) return ''
  let p = raw.trim()
  if (!p || p === '/') return ''
  if (!p.startsWith('/')) p = `/${p}`
  // Strip trailing slash
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  // Never alias the primary mount onto itself in a loop
  if (p === AIKIDS_API_MOUNT) return ''
  return p
}

/**
 * If request path is under alias prefix, rewrite to primary `/api…`.
 * Returns the rewritten path or null when no rewrite needed.
 *
 * Examples:
 *   /api/aikids/health → /api/health
 *   /api/aikids/courses/x?x=1 → /api/courses/x?x=1
 */
export function rewriteAliasToPrimaryApi(
  url: string,
  aliasPrefix: string,
): string | null {
  const prefix = normalizeApiAliasPrefix(aliasPrefix)
  if (!prefix) return null

  const q = url.indexOf('?')
  const path = q >= 0 ? url.slice(0, q) : url
  const search = q >= 0 ? url.slice(q) : ''

  if (path === prefix) {
    return `${AIKIDS_API_MOUNT}${search}`
  }
  if (path.startsWith(`${prefix}/`)) {
    const rest = path.slice(prefix.length)
    return `${AIKIDS_API_MOUNT}${rest}${search}`
  }
  return null
}

/** Module → StoryMee analog matrix (documentation + health meta) */
export const STORYMEE_MODULE_MAP = [
  {
    aikids: 'modules/auth + session cookie',
    storymee: 'core-account-api',
    strategy: 'Shared domain cookie later; token format via crypto seam',
  },
  {
    aikids: 'modules/catalog + media URLs',
    storymee: 'core-media-api / asset CDN',
    strategy: 'Store only URL in SQL; host files externally',
  },
  {
    aikids: 'Redis rate-limit + session cache',
    storymee: 'omni-stealth-gateway Redis',
    strategy: 'Same Redis, key prefix aikids:',
  },
  {
    aikids: 'Feature Fastify modules',
    storymee: 'core-*-api layout',
    strategy: 'Keep vertical modules; extract packages when needed',
  },
] as const

export function seamHealthMeta(opts: {
  cookieDomain?: string
  apiAliasPrefix?: string
}) {
  return {
    product: 'aikids' as const,
    sessionCookie: AIKIDS_SESSION_COOKIE,
    cookieDomain: opts.cookieDomain || null,
    apiMount: AIKIDS_API_MOUNT,
    apiAlias: normalizeApiAliasPrefix(opts.apiAliasPrefix) || null,
    modules: STORYMEE_MODULE_MAP,
  }
}
