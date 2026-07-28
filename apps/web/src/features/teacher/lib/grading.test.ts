import { describe, expect, it } from 'vitest'
import { reviewResponseSummary } from './grading'

describe('reviewResponseSummary', () => {
  it('shows a short answer as readable content', () => {
    expect(
      reviewResponseSummary({
        questionType: 'short_text',
        response: { text: 'Em sẽ kiểm tra lại thông tin trước khi chia sẻ.' },
        artifact: null,
      }),
    ).toEqual({
      label: 'Câu trả lời của học viên',
      value: 'Em sẽ kiểm tra lại thông tin trước khi chia sẻ.',
    })
  })

  it('uses the immutable artifact snapshot instead of exposing an internal source id', () => {
    const summary = reviewResponseSummary({
      questionType: 'artifact',
      response: {
        sourceType: 'project',
        sourceId: '15466969-c229-4bce-b37c-df5f57b1a485',
      },
      artifact: {
        snapshotJson: {
          sourceType: 'project',
          title: 'Khu vườn robot',
          kind: 'creative_art',
        },
      },
    })

    expect(summary).toEqual({
      label: 'Tác phẩm đã nộp',
      value: 'Khu vườn robot',
      detail: 'Dự án sáng tạo',
    })
    expect(JSON.stringify(summary)).not.toContain(
      '15466969-c229-4bce-b37c-df5f57b1a485',
    )
  })
})
