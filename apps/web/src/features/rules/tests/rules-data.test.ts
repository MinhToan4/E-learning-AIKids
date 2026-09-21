import { describe, it, expect } from 'vitest'
import { AIKI_RULES_DATA } from '../data/rules-data'

describe('AIKI 10 Golden Rules Data Integrity', () => {
  it('contains exactly 10 rules from QT1 to QT10', () => {
    expect(AIKI_RULES_DATA).toHaveLength(10)
    AIKI_RULES_DATA.forEach((rule, idx) => {
      expect(rule.id).toBe(idx + 1)
      expect(rule.code).toBe(`QT${idx + 1}`)
      expect(rule.title).toBeTruthy()
      expect(rule.shortTitle).toBeTruthy()
      expect(rule.goal).toBeTruthy()
      expect(rule.skill).toBeTruthy()
      expect(rule.posterImage).toBeTruthy()
      expect(rule.audioVoiceText).toBeTruthy()
      expect(rule.akiTip).toBeTruthy()
    })
  })

  it('each rule has structured video slides', () => {
    AIKI_RULES_DATA.forEach((rule) => {
      expect(rule.slides.length).toBeGreaterThanOrEqual(4)
      rule.slides.forEach((slide) => {
        expect(slide.stage).toBeTruthy()
        expect(slide.dialogue).toBeTruthy()
        expect(slide.screenAction).toBeTruthy()
      })
    })
  })

  it('each rule has exactly 2 review questions with valid options and correctIndex', () => {
    AIKI_RULES_DATA.forEach((rule) => {
      expect(rule.questions).toHaveLength(2)
      rule.questions.forEach((q) => {
        expect(q.id).toBeTruthy()
        expect(q.prompt).toBeTruthy()
        expect(q.options.length).toBeGreaterThanOrEqual(2)
        expect(q.options.length).toBeLessThanOrEqual(4)
        expect(q.correctIndex).toBeGreaterThanOrEqual(0)
        expect(q.correctIndex).toBeLessThan(q.options.length)
        expect(q.hint).toBeTruthy()
        expect(q.successFeedback).toBeTruthy()
        expect(q.retryFeedback).toBeTruthy()
      })
    })
  })

  it('100% of slides and review questions are linked to valid /assets/aiki-rules/ images', () => {
    AIKI_RULES_DATA.forEach((rule) => {
      expect(rule.posterImage).toMatch(/^\/assets\/aiki-rules\//)
      rule.slides.forEach((slide) => {
        expect(slide.image).toBeTruthy()
        expect(slide.image).toMatch(/^\/assets\/aiki-rules\//)
      })
      rule.questions.forEach((q) => {
        expect(q.visualUrl).toBeTruthy()
        expect(q.visualUrl).toMatch(/^\/assets\/aiki-rules\//)
      })
    })
  })

  it('uses warm 1:1 dialogue without script artifacts or cold 3rd-person text', () => {
    AIKI_RULES_DATA.forEach((rule) => {
      expect(rule.goal).not.toContain('Trẻ hiểu')
      expect(rule.goal).not.toContain('Trẻ biết')
      expect(rule.skill).not.toContain('Trẻ hiểu')
      expect(rule.skill).not.toContain('Trẻ biết')
      rule.slides.forEach((slide) => {
        expect(slide.dialogue).not.toContain('[gasps]')
        expect(slide.dialogue).not.toContain('Zico & Sonet:')
      })
    })
  })
})
