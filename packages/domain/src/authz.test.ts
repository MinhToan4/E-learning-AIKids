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
    expect(can('student', 'learning:annotate')).toBe(true)
    expect(can('student', 'learning:offline')).toBe(true)
    expect(can('student', 'pathway:write')).toBe(false)
  })

  it('parent can decide approvals, manage household plan, not write progress or lectures', () => {
    expect(can('parent', 'approval:decide')).toBe(true)
    expect(can('parent', 'subscription:read')).toBe(true)
    expect(can('parent', 'subscription:write')).toBe(true)
    expect(can('parent', 'progress:write')).toBe(false)
    expect(can('parent', 'lecture:write')).toBe(false)
    expect(can('parent', 'user:write')).toBe(false)
    expect(can('student', 'subscription:write')).toBe(false)
    expect(can('parent', 'pathway:read')).toBe(true)
    expect(can('parent', 'learning:annotate')).toBe(false)
  })

  it('teacher can read/write class and lectures, not manage all users', () => {
    expect(can('teacher', 'class:read')).toBe(true)
    expect(can('teacher', 'class:write')).toBe(true)
    expect(can('teacher', 'lecture:write')).toBe(true)
    expect(can('teacher', 'course:write')).toBe(true)
    expect(can('teacher', 'approval:decide')).toBe(false)
    expect(can('teacher', 'user:write')).toBe(false)
    expect(can('teacher', 'system:read')).toBe(false)
    expect(can('teacher', 'pathway:write')).toBe(true)
    expect(can('teacher', 'age-policy:write')).toBe(false)
  })

  it('admin can manage users, system, and AI settings; others cannot write settings', () => {
    expect(can('admin', 'user:read')).toBe(true)
    expect(can('admin', 'user:write')).toBe(true)
    expect(can('admin', 'system:read')).toBe(true)
    expect(can('admin', 'lecture:write')).toBe(true)
    expect(can('admin', 'settings:read')).toBe(true)
    expect(can('admin', 'settings:write')).toBe(true)
    expect(can('teacher', 'settings:write')).toBe(false)
    expect(can('student', 'settings:read')).toBe(false)
    expect(can('admin', 'admin:seed')).toBe(true)
    expect(can('admin', 'age-policy:write')).toBe(true)
    expect(can('admin', 'audit:read')).toBe(true)
    // Admin does not submit student practice as themselves
    expect(can('admin', 'progress:write')).toBe(false)
  })

  it('separates learner attempts, parent visibility, and teacher grading', () => {
    expect(can('student', 'assessment:take')).toBe(true)
    expect(can('parent', 'assessment:read')).toBe(true)
    expect(can('parent', 'assessment:take')).toBe(false)
    expect(can('student', 'grading:read')).toBe(false)
    expect(can('teacher', 'grading:write')).toBe(true)
    expect(can('teacher', 'grading:publish')).toBe(true)
    expect(can('admin', 'question-bank:write')).toBe(true)
  })

  it('keeps framework policy and revocation under admin control', () => {
    expect(can('student', 'competency:read')).toBe(true)
    expect(can('parent', 'credential:read')).toBe(true)
    expect(can('teacher', 'credential:issue')).toBe(true)
    expect(can('teacher', 'credential:revoke')).toBe(false)
    expect(can('teacher', 'competency:write')).toBe(false)
    expect(can('admin', 'competency:recalculate')).toBe(true)
    expect(can('admin', 'credential:revoke')).toBe(true)
  })

  it('allows family requests while reserving scheduling decisions for staff', () => {
    expect(can('student', 'schedule:read')).toBe(true)
    expect(can('parent', 'reschedule:request')).toBe(true)
    expect(can('parent', 'reschedule:decide')).toBe(false)
    expect(can('teacher', 'attendance:write')).toBe(true)
    expect(can('teacher', 'observation:write')).toBe(true)
    expect(can('teacher', 'schedule-policy:write')).toBe(false)
    expect(can('admin', 'placement:decide')).toBe(true)
  })

  it('separates report readership, approval, delivery, and configuration', () => {
    expect(can('parent', 'report:read')).toBe(true)
    expect(can('parent', 'report:write')).toBe(false)
    expect(can('teacher', 'report:write')).toBe(true)
    expect(can('teacher', 'report:deliver')).toBe(false)
    expect(can('admin', 'report:deliver')).toBe(true)
    expect(can('admin', 'report-config:write')).toBe(true)
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
