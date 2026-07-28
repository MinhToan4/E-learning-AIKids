import { describe, expect, it } from 'vitest'
import { labelFor, replaceValue } from './GuidedConfigFields'

describe('guided production configuration form', () => {
  it('updates a nested field without mutating or dropping sibling policy data', () => {
    const source = {
      label: 'Khám phá',
      uiPolicy: {
        density: 'airy',
        largeControls: true,
      },
      status: 'draft',
    }

    const updated = replaceValue(
      source,
      ['uiPolicy', 'density'],
      'balanced',
    )

    expect(updated).toEqual({
      label: 'Khám phá',
      uiPolicy: {
        density: 'balanced',
        largeControls: true,
      },
      status: 'draft',
    })
    expect(source.uiPolicy.density).toBe('airy')
  })

  it('uses clear Vietnamese labels for operator-facing API fields', () => {
    expect(labelFor('maxChoicesPerStep')).toBe(
      'Số lựa chọn tối đa mỗi bước',
    )
    expect(labelFor('deliveryChannels')).toBe('Kênh gửi báo cáo')
    expect(labelFor('back')).toBe('Quay lại')
    expect(labelFor('submit')).toBe('Nộp bài')
  })
})
