import { describe, expect, it } from 'vitest'
import {
  parseQuestionAuthoring,
  parseStudentResponse,
  publicQuestion,
} from './assessment-contract.js'

describe('assessment contract', () => {
  it('validates authored options and answer keys together', () => {
    expect(() =>
      parseQuestionAuthoring({
        type: 'single_choice',
        prompt: {
          stem: 'Đâu là lựa chọn an toàn?',
          options: [
            { id: 'safe', text: 'Dùng biệt danh' },
            { id: 'unsafe', text: 'Gửi địa chỉ nhà' },
          ],
        },
        answerKey: { correctOptionIds: ['missing'] },
        rubric: {},
      }),
    ).toThrow(/answer key/i)
  })

  it('never exposes the server-side answer key in a learner payload', () => {
    const item = publicQuestion({
      id: 'version-id',
      type: 'single_choice',
      promptJson: {
        stem: 'Chọn đáp án',
        options: [
          { id: 'a', text: 'A' },
          { id: 'b', text: 'B' },
        ],
      },
      answerKeyJson: { correctOptionIds: ['b'] },
      rubricJson: {},
      explanation: 'B đúng',
    })
    expect(item).toEqual({
      id: 'version-id',
      type: 'single_choice',
      prompt: {
        stem: 'Chọn đáp án',
        options: [
          { id: 'a', text: 'A' },
          { id: 'b', text: 'B' },
        ],
      },
    })
    expect(JSON.stringify(item)).not.toContain('correctOptionIds')
  })

  it('rejects response ids that were not in the published prompt', () => {
    expect(() =>
      parseStudentResponse(
        'multiple_choice',
        {
          stem: 'Chọn',
          options: [
            { id: 'a', text: 'A' },
            { id: 'b', text: 'B' },
          ],
        },
        { selectedOptionIds: ['c'] },
      ),
    ).toThrow(/published question/i)
  })
})
