import { describe, expect, it } from 'vitest'
import { normalizeVietnameseSpeech } from './vietnameseSpeech'

describe('normalizeVietnameseSpeech', () => {
  it('reads arithmetic symbols as Vietnamese words', () => {
    expect(normalizeVietnameseSpeech('$48 - 13 = 35$')).toBe('48 trừ 13 bằng 35')
    expect(normalizeVietnameseSpeech('$3 \\times 4 = 12$')).toBe('3 nhân 4 bằng 12')
    expect(normalizeVietnameseSpeech('$12 \\div 3 = 4$')).toBe('12 chia 3 bằng 4')
  })

  it('reads common LaTeX fractions and comparisons without markup', () => {
    expect(normalizeVietnameseSpeech('$\\frac{3}{8} \\le 1$')).toBe('3 phần 8 nhỏ hơn hoặc bằng 1')
  })
})
