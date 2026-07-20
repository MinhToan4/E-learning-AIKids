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
  | 'class:read'
  | 'class:write'
  | 'user:read'
  | 'user:write'
  | 'system:read'
  | 'admin:seed'

const ROLE_ACTIONS: Record<Role, Action[]> = {
  student: [
    'course:read',
    'progress:read',
    'progress:write',
    'portfolio:read',
    'portfolio:write',
    'approval:request',
  ],
  parent: [
    'course:read',
    'progress:read',
    'portfolio:read',
    'approval:decide',
  ],
  teacher: [
    'course:read',
    'course:write',
    'lecture:write',
    'progress:read',
    'portfolio:read',
    'class:read',
    'class:write',
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
