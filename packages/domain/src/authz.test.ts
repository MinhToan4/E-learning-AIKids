import { describe, expect, it } from 'vitest'
import {
  AuthzError,
  assertCan,
  can,
  parentOwnsChild,
  teacherOwnsClass,
  isAdultRole,
} from './authz.js'

describe('authz can', () => {
  it('student can write progress, not decide approvals or manage users', () => {
    expect(can('student', 'progress:write')).toBe(true)
    expect(can('student', 'approval:decide')).toBe(false)
    expect(can('student', 'user:write')).toBe(false)
    expect(can('student', 'lecture:write')).toBe(false)
  })

  it('parent can decide approvals, not write progress or lectures', () => {
    expect(can('parent', 'approval:decide')).toBe(true)
    expect(can('parent', 'progress:write')).toBe(false)
    expect(can('parent', 'lecture:write')).toBe(false)
    expect(can('parent', 'user:write')).toBe(false)
  })

  it('teacher can read/write class and lectures, not manage all users', () => {
    expect(can('teacher', 'class:read')).toBe(true)
    expect(can('teacher', 'class:write')).toBe(true)
    expect(can('teacher', 'lecture:write')).toBe(true)
    expect(can('teacher', 'course:write')).toBe(true)
    expect(can('teacher', 'approval:decide')).toBe(false)
    expect(can('teacher', 'user:write')).toBe(false)
    expect(can('teacher', 'system:read')).toBe(false)
  })

  it('admin can manage users and system, write lectures', () => {
    expect(can('admin', 'user:read')).toBe(true)
    expect(can('admin', 'user:write')).toBe(true)
    expect(can('admin', 'system:read')).toBe(true)
    expect(can('admin', 'lecture:write')).toBe(true)
    expect(can('admin', 'admin:seed')).toBe(true)
    // Admin does not submit student practice as themselves
    expect(can('admin', 'progress:write')).toBe(false)
  })

  it('assertCan throws AuthzError', () => {
    expect(() => assertCan('student', 'class:read')).toThrow(AuthzError)
    expect(() => assertCan('teacher', 'user:write')).toThrow(AuthzError)
  })
})

describe('ownership helpers', () => {
  it('parentOwnsChild matches household link', () => {
    expect(parentOwnsChild('p1', 'p1')).toBe(true)
    expect(parentOwnsChild('p1', 'p2')).toBe(false)
    expect(parentOwnsChild('p1', null)).toBe(false)
  })

  it('teacherOwnsClass matches class owner', () => {
    expect(teacherOwnsClass('t1', 't1')).toBe(true)
    expect(teacherOwnsClass('t1', 't2')).toBe(false)
    expect(teacherOwnsClass('t1', null)).toBe(false)
  })

  it('isAdultRole', () => {
    expect(isAdultRole('admin')).toBe(true)
    expect(isAdultRole('student')).toBe(false)
  })
})
