import { describe, expect, it } from 'vitest'
import {
  extractRuleNumber,
  isAikiRuleJourney,
  AIKI_MODULE_0_COURSE_ID,
} from './rule-journey-identifiers'

describe('extractRuleNumber', () => {
  it('extracts rule number correctly from strings', () => {
    expect(extractRuleNumber('rule-1')).toBe(1)
    expect(extractRuleNumber('rule-4')).toBe(4)
    expect(extractRuleNumber('rule-10')).toBe(10)
    expect(extractRuleNumber('qt4-chia-se-vi-sao-chon-y-tuong')).toBe(4)
    expect(extractRuleNumber('qt1-y-tuong-la-cua-minh')).toBe(1)
    expect(extractRuleNumber('QT4 — Giải thích vì sao')).toBe(4)
    expect(extractRuleNumber('trạm 5')).toBe(5)
  })

  it('prioritizes slug and title over order (0-indexed db sortOrder fix)', () => {
    // In database, QT4 has order 3 (0-indexed: QT1=0, QT2=1, QT3=2, QT4=3)
    const stationQt4 = {
      id: '33333333-2148-4373-b41a-0d0be4a4e4be',
      slug: 'qt4-chia-se-vi-sao-chon-y-tuong',
      title: 'QT4 — Giải thích vì sao',
      order: 3,
    }
    expect(extractRuleNumber(stationQt4)).toBe(4)

    const stationQt1 = {
      id: 'c0363e77-2148-4373-b41a-0d0be4a4e4be',
      slug: 'qt1-y-tuong-la-cua-minh',
      title: 'QT1 — Hãy nghĩ ý tưởng',
      order: 0,
    }
    expect(extractRuleNumber(stationQt1)).toBe(1)

    const stationQt3 = {
      id: '22222222-2148-4373-b41a-0d0be4a4e4be',
      slug: 'qt3-san-pham-co-gia-tri',
      title: 'QT3 — Có giá trị',
      order: 2,
    }
    expect(extractRuleNumber(stationQt3)).toBe(3)
  })

  it('falls back to order if slug/title do not contain rule number', () => {
    const candidateWithoutRuleInTitle = {
      id: 'some-generic-id',
      slug: 'some-lesson',
      title: 'Bài tập sáng tạo',
      order: 4,
    }
    expect(extractRuleNumber(candidateWithoutRuleInTitle)).toBe(4)
  })

  it('handles null and undefined safely', () => {
    expect(extractRuleNumber(null)).toBe(1)
    expect(extractRuleNumber(undefined)).toBe(1)
  })
})

describe('isAikiRuleJourney', () => {
  it('identifies rule journeys by course id, slug, or title', () => {
    expect(isAikiRuleJourney(AIKI_MODULE_0_COURSE_ID)).toBe(true)
    expect(isAikiRuleJourney('aiki-rules')).toBe(true)
    expect(isAikiRuleJourney('muoi-quy-tac-xuong-sang-tao')).toBe(true)
    expect(isAikiRuleJourney('rule-4')).toBe(true)
    expect(isAikiRuleJourney('qt4-chia-se-vi-sao-chon-y-tuong')).toBe(true)
    expect(isAikiRuleJourney({ slug: 'qt4-chia-se-vi-sao-chon-y-tuong' })).toBe(true)
    expect(isAikiRuleJourney({ title: 'QT4 — Giải thích vì sao' })).toBe(true)
    expect(isAikiRuleJourney({ title: '10 Quy tắc vàng sáng tạo' })).toBe(true)
    expect(isAikiRuleJourney('bai-1-1-mot-tu-hay-nam-tu')).toBe(false)
  })
})
