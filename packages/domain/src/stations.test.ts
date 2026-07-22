import { describe, expect, it } from 'vitest'
import {
  AGE_TRACKS,
  COURSE_KEYS,
  courseIdFor,
  defaultStationsForPractice,
  parseStationsJson,
  resolveStations,
  isPracticeKind,
} from './stations.js'

describe('stations & age tracks', () => {
  it('defines L1 6-8 and L2 9-11', () => {
    expect(AGE_TRACKS.L1.ageMin).toBe(6)
    expect(AGE_TRACKS.L1.ageMax).toBe(8)
    expect(AGE_TRACKS.L2.ageMin).toBe(9)
    expect(AGE_TRACKS.L2.ageMax).toBe(11)
    expect(COURSE_KEYS).toHaveLength(6)
  })

  it('builds stable course ids', () => {
    expect(courseIdFor('L1', 'K1', 'the-gioi')).toBe('l1-k1-the-gioi')
    expect(courseIdFor('L2', 'K4', 'truyen-tranh')).toBe('l2-k4-truyen-tranh')
  })

  it('parses curriculum stations JSON', () => {
    const raw = JSON.stringify({
      stage: 'ideate',
      stations: [
        { id: 'v1', kind: 'video', durationMin: 3 },
        {
          id: 'g1',
          kind: 'game',
          gameType: 'spin',
          instruction: 'Quay một gợi ý',
          outcome: 'Chọn được một ý tưởng',
        },
        {
          id: 'p1',
          kind: 'practice',
          practiceKind: 'journal',
          instruction: 'Viết ba từ khóa',
          product: 'Ba từ khóa an toàn',
        },
        { id: 'c1', kind: 'check' },
      ],
    })
    const parsed = parseStationsJson(raw)
    expect(parsed?.stage).toBe('ideate')
    expect(parsed?.stations).toHaveLength(4)
    expect(parsed?.stations[2].practiceKind).toBe('journal')
    expect(parsed?.stations[1].instruction).toBe('Quay một gợi ý')
    expect(parsed?.stations[2].product).toBe('Ba từ khóa an toàn')
  })

  it('falls back to default 4-station block', () => {
    const s = resolveStations(null, 'palette', null)
    expect(s.stations.map((x) => x.kind)).toEqual([
      'video',
      'game',
      'practice',
      'check',
    ])
    expect(s.stations[2].practiceKind).toBe('palette')
  })

  it('defaultStationsForPractice marks produce for ai kinds', () => {
    expect(defaultStationsForPractice('ai_pick').stage).toBe('produce')
    expect(defaultStationsForPractice('journal').stage).toBe('ideate')
  })

  it('validates practice kinds including curriculum extensions', () => {
    expect(isPracticeKind('journal')).toBe(true)
    expect(isPracticeKind('spin')).toBe(true)
    expect(isPracticeKind('hack')).toBe(false)
  })
})
