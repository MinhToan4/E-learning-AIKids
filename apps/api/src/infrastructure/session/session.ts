import type { FastifyReply, FastifyRequest } from 'fastify'
import type { Role } from '@aikids/domain'
import { env, SESSION_COOKIE, SESSION_DAYS } from '../../config/env.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import { createSessionToken, isSessionTokenFormat } from '../security/crypto.js'
import { getCache } from '../cache/cache.js'
import { buildSessionCookieOptions } from '../../shared/seams/storymee-compat.js'

export type AuthUser = {
  id: string
  role: Role
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

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthUser | null
  }
}

export function publicUser(u: {
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
}): AuthUser {
  return {
    id: u.id,
    role: u.role as Role,
    email: u.email,
    nickname: u.nickname,
    avatarId: u.avatarId,
    level: u.level,
    xp: u.xp,
    onboarded: u.onboarded,
    goal: u.goal,
    parentId: u.parentId,
    classId: u.classId,
  }
}

/** Session cache TTL — 5 minutes */
const SESSION_CACHE_TTL_MS = 5 * 60 * 1000

function sessionCacheKey(token: string): string {
  return `session:${token}`
}

export async function createSession(
  userId: string,
  reply: FastifyReply,
): Promise<string> {
  const token = createSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await prisma.session.create({
    data: { token, userId, expiresAt },
  })

  // Cache session user in Redis for fast lookups
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user) {
    const cache = getCache()
    await cache.set(sessionCacheKey(token), JSON.stringify(publicUser(user)), SESSION_CACHE_TTL_MS)
  }

  const cookieOpts = buildSessionCookieOptions({
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    maxAgeSeconds: SESSION_DAYS * 24 * 60 * 60,
    domain: env.cookieDomain,
  })
  reply.setCookie(SESSION_COOKIE, token, cookieOpts)
  return token
}

export async function destroySession(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const token = request.cookies[SESSION_COOKIE]
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
    // Remove from cache
    const cache = getCache()
    await cache.delete(sessionCacheKey(token))
  }
  const clearOpts = buildSessionCookieOptions({
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    maxAgeSeconds: 0,
    domain: env.cookieDomain,
  })
  reply.clearCookie(SESSION_COOKIE, {
    path: clearOpts.path,
    ...(clearOpts.domain ? { domain: clearOpts.domain } : {}),
  })
}

export async function loadUserFromRequest(
  request: FastifyRequest,
): Promise<AuthUser | null> {
  const token = request.cookies[SESSION_COOKIE]
  if (!token || !isSessionTokenFormat(token)) return null

  // 1. Try Redis cache first
  const cache = getCache()
  const cached = await cache.get(sessionCacheKey(token))
  if (cached) {
    try {
      return JSON.parse(cached) as AuthUser
    } catch {
      // Corrupted cache entry — fall through to DB
    }
  }

  // 2. Fallback to DB
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!session) return null
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } })
    return null
  }
  // Soft-disabled accounts cannot use the API
  if (session.user.active === false) {
    return null
  }

  const authUser = publicUser(session.user)

  // 3. Re-populate cache for next request
  await cache.set(sessionCacheKey(token), JSON.stringify(authUser), SESSION_CACHE_TTL_MS)

  return authUser
}

export function requireUser(request: FastifyRequest): AuthUser {
  if (!request.user) {
    const err = new Error('Unauthorized') as Error & { statusCode: number }
    err.statusCode = 401
    throw err
  }
  return request.user
}

export function requireRole(
  request: FastifyRequest,
  roles: Role[],
): AuthUser {
  const user = requireUser(request)
  if (!roles.includes(user.role)) {
    const err = new Error('Forbidden') as Error & { statusCode: number }
    err.statusCode = 403
    throw err
  }
  return user
}

