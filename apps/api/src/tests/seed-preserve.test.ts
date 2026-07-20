/**
 * Unit tests for seed CMS preservation helpers (shipped path, no mock reimplementation).
 */
import { describe, expect, it, afterEach } from 'vitest'
import {
  questUpdateData,
  seedOverwriteContent,
} from '../../prisma/seed/upsert-course.js'
import { shouldSkipSeed } from '../../prisma/seed/policy.js'
import type { CourseSeed } from '../../prisma/seed/types.js'

const sampleCourse: CourseSeed = {
  id: 'course-x',
  title: 'T',
  shortTitle: 'T',
  tagline: 't',
  description: 'd',
  coverFrom: '#000',
  coverTo: '#fff',
  accent: '#000',
  coverImage: '/x.jpg',
  ageLabel: '6–8 tuổi',
  ageTrack: 'L1',
  courseKey: 'K1',
  durationLabel: '1h',
  productLabel: 'p',
  status: 'open',
  recommended: false,
  skills: [],
  outcomes: [],
  sortOrder: 1,
  quests: [],
}

const sampleQuest = {
  id: 'q1',
  order: 1,
  title: 'Seed Title',
  skill: 'skill',
  reward: 'r',
  duration: '5m',
  hook: 'Seed hook',
  accent: '#111',
  practiceKind: 'intro' as const,
  videoUrl: 'https://cdn.example.com/seed.mp4',
  goals: ['g'],
  concept: 'c',
  example: 'e',
}

describe('seed CMS preservation', () => {
  afterEach(() => {
    delete process.env.SEED_OVERWRITE_CONTENT
    delete process.env.SEED_FORCE
  })

  it('shouldSkipSeed when courses exist unless SEED_FORCE', () => {
    delete process.env.SEED_FORCE
    expect(shouldSkipSeed(0)).toBe(false)
    expect(shouldSkipSeed(4)).toBe(true)
    process.env.SEED_FORCE = 'true'
    expect(shouldSkipSeed(4)).toBe(false)
  })

  it('questUpdateData without overwrite omits CMS fields (videoUrl/title/hook)', () => {
    delete process.env.SEED_OVERWRITE_CONTENT
    expect(seedOverwriteContent()).toBe(false)
    const update = questUpdateData(sampleCourse, sampleQuest, [], false)
    expect(update).toEqual({ order: 1, courseId: 'course-x' })
    expect(update).not.toHaveProperty('videoUrl')
    expect(update).not.toHaveProperty('title')
    expect(update).not.toHaveProperty('hook')
  })

  it('questUpdateData with overwrite includes seed videoUrl', () => {
    const update = questUpdateData(sampleCourse, sampleQuest, [], true)
    expect(update.videoUrl).toBe('https://cdn.example.com/seed.mp4')
    expect(update.title).toBe('Seed Title')
    expect(update.hook).toBe('Seed hook')
  })
})
