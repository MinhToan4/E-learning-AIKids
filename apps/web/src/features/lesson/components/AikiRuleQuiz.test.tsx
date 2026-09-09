import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AikiRuleQuiz } from './AikiRuleQuiz'
import { AIKI_RULES_DATA } from '@/features/rules/data/rules-data'

describe('AikiRuleQuiz', () => {
  it('renders question prompt, counter, and options', () => {
    const rule = AIKI_RULES_DATA[0]
    const markup = renderToStaticMarkup(
      createElement(AikiRuleQuiz, {
        questions: rule.questions,
        ruleId: rule.id,
      })
    )

    expect(markup).toContain('data-testid="aiki-rule-quiz"')
    expect(markup).toContain('Thử tài câu hỏi ôn tập Quy tắc 1')
    expect(markup).toContain(rule.questions[0].prompt)
    expect(markup).toContain(rule.questions[0].options[0])
    expect(markup).toContain(rule.questions[0].options[1])
  })
})
