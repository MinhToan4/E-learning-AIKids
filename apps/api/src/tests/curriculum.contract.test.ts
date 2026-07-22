import { describe, expect, it } from 'vitest'
import { curriculumCourses } from '../../prisma/seed/courses/curriculum.js'

describe('12-course curriculum contract', () => {
  it('contains the exact 146 lessons defined by the course library', () => {
    expect(curriculumCourses).toHaveLength(12)
    expect(
      curriculumCourses.every(
        (course) => course.productLabel.trim().length > 10,
      ),
    ).toBe(true)
    expect(
      Object.fromEntries(
        curriculumCourses.map((course) => [
          `${course.ageTrack}-${course.courseKey}`,
          course.quests.length,
        ]),
      ),
    ).toEqual({
      'L1-K1': 8,
      'L1-K2': 8,
      'L1-K3': 8,
      'L1-K4': 8,
      'L1-K5': 8,
      'L1-K6': 10,
      'L2-K1': 16,
      'L2-K2': 16,
      'L2-K3': 16,
      'L2-K4': 16,
      'L2-K5': 16,
      'L2-K6': 16,
    })
  })

  it('keeps all four stations and never publishes the old sample video', () => {
    let personalizedGamePacks = 0
    for (const course of curriculumCourses) {
      for (const quest of course.quests) {
        expect(quest.videoUrl).toBeNull()
        expect(quest.stations?.stations.map((station) => station.kind)).toEqual([
          'video',
          'game',
          'practice',
          'check',
        ])
        expect(JSON.stringify(quest)).not.toContain('ForBiggerBlazes')
        const game = quest.stations?.stations.find(
          (station) => station.kind === 'game',
        )
        const cards = (game?.gameConfig as { cards?: string[] } | undefined)
          ?.cards
        if (cards && cards.length >= 2) personalizedGamePacks += 1
      }
    }
    expect(personalizedGamePacks).toBe(146)
  })

  it('states issuer, assessment, framework relationship and unique badge', () => {
    const credentials = curriculumCourses.map(
      (course) => course.recognition.credential,
    )
    expect(new Set(credentials).size).toBe(12)
    for (const course of curriculumCourses) {
      expect(course.recognition.issuer).toBe('AI Kids Creator Academy')
      expect(course.recognition.finalAssessment.length).toBeGreaterThan(10)
      expect(course.recognition.frameworks).toHaveLength(2)
      expect(course.recognition.disclaimer).toContain('không phải chứng nhận')
      expect(course.quests.at(-1)?.check?.length).toBeGreaterThanOrEqual(3)
    }
  })
})
