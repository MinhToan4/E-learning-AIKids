import type { FastifyReply, FastifyRequest } from 'fastify'
import type { Role } from '@aikids/domain'
import { env, SESSION_COOKIE, SESSION_DAYS } from '../../config/env.js'
import { prisma } from '../../infrastructure/database/prisma.js'
import { createSessionToken, isSessionTokenFormat } from '../security/crypto.js'

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

export async function createSession(
  userId: string,
  reply: FastifyReply,
): Promise<string> {
  const token = createSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await prisma.session.create({
    data: { token, userId, expiresAt },
  })
  reply.setCookie(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
  return token
}

export async function destroySession(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const token = request.cookies[SESSION_COOKIE]
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }
  reply.clearCookie(SESSION_COOKIE, { path: '/' })
}

export async function loadUserFromRequest(
  request: FastifyRequest,
): Promise<AuthUser | null> {
  const token = request.cookies[SESSION_COOKIE]
  if (!token || !isSessionTokenFormat(token)) return null

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
  return publicUser(session.user)
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
