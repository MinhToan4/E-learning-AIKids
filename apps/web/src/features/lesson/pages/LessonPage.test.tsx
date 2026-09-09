import { describe, expect, it } from 'vitest'
import { createAikiRuleCardsFromData } from './LessonPage'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'

describe('createAikiRuleCardsFromData', () => {
  it('generates 5 fully populated stages for rule journey', () => {
    const rule = AIKI_RULES_DATA[0]
    const cards = createAikiRuleCardsFromData(rule)

    expect(cards).toHaveLength(5)
    expect(cards[0].kind).toBe('situation')
    expect(cards[0].dialogueLines).toBeDefined()
    expect(cards[1].kind).toBe('aiki-riddle')
    expect(cards[1].optionImages).toHaveLength(2)
    expect(cards[2].kind).toBe('rule')
    expect(cards[2].imageUrl).toBe(rule.posterImage)
    expect(cards[3].kind).toBe('explanation')
    expect(cards[3].compareData).toBeDefined()
    expect(cards[4].kind).toBe('closing')
    expect(cards[4].body).toBe(rule.knightCommitment || 'Con cam kết luôn dùng ý tưởng độc đáo của riêng mình!')
  })
})
