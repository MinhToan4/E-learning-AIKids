import type { Role } from './types.js'

/**
 * Fine-grained actions enforced at API boundary via assertCan/can.
 * Keep pure (no I/O) so unit tests prove isolation without HTTP.
 */
export type Action =
  | 'course:read'
  | 'course:write'
  | 'lecture:write'
  | 'progress:read'
  | 'progress:write'
  | 'portfolio:read'
  | 'portfolio:write'
  | 'approval:request'
  | 'approval:decide'
  | 'child:create'
  | 'child:update'
  | 'child:delete'
  | 'password:change'
  | 'class:read'
  | 'class:write'
  | 'user:read'
  | 'user:write'
  | 'system:read'
  | 'admin:seed'
  | 'profile:read'
  | 'profile:write'
  | 'notification:read'
  | 'notification:write'
  | 'settings:read'
  | 'settings:write'
  | 'media:upload'
  | 'subscription:read'
  | 'subscription:write'

const ROLE_ACTIONS: Record<Role, Action[]> = {
  student: [
    'course:read',
    'progress:read',
    'progress:write',
    'portfolio:read',
    'portfolio:write',
    'approval:request',
    'notification:read',
    'notification:write',
    'media:upload',
  ],
  parent: [
    'course:read',
    'progress:read',
    'portfolio:read',
    'approval:decide',
    'child:create',
    'child:update',
    'child:delete',
    'password:change',
    'profile:read',
    'profile:write',
    'notification:read',
    'notification:write',
    'subscription:read',
    'subscription:write',
  ],
  teacher: [
    'course:read',
    'course:write',
    'lecture:write',
    'progress:read',
    'portfolio:read',
    'class:read',
    'class:write',
    'password:change',
    'profile:read',
    'profile:write',
    'notification:read',
    'notification:write',
    'media:upload',
  ],
  admin: [
    'course:read',
    'course:write',
    'lecture:write',
    'progress:read',
    'portfolio:read',
    'class:read',
    'class:write',
    'user:read',
    'user:write',
    'system:read',
    'admin:seed',
    'password:change',
    'child:create',
    'child:update',
    'child:delete',
    'profile:read',
    'profile:write',
    'notification:read',
    'notification:write',
    'settings:read',
    'settings:write',
    'media:upload',
    'subscription:read',
    'subscription:write',
  ],
}

export function can(role: Role, action: Action): boolean {
  return ROLE_ACTIONS[role]?.includes(action) ?? false
}

export function assertCan(role: Role, action: Action): void {
  if (!can(role, action)) {
    throw new AuthzError(`Role ${role} cannot ${action}`)
  }
}

export class AuthzError extends Error {
  readonly statusCode = 403
  constructor(message: string) {
    super(message)
    this.name = 'AuthzError'
  }
}

/** Parent may only act on children linked to their household. */
export function parentOwnsChild(
  parentUserId: string,
  childParentId: string | null | undefined,
): boolean {
  return Boolean(childParentId && childParentId === parentUserId)
}

/** Teacher may only manage students in a class they own. */
export function teacherOwnsClass(
  teacherUserId: string,
  classTeacherId: string | null | undefined,
): boolean {
  return Boolean(classTeacherId && classTeacherId === teacherUserId)
}

/** Valid adult roles that may register / be provisioned by admin. */
export const ADULT_ROLES: Role[] = ['parent', 'teacher', 'admin']

export function isAdultRole(role: string): role is Role {
  return role === 'parent' || role === 'teacher' || role === 'admin'
}
