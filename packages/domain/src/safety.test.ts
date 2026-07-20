import { describe, expect, it } from 'vitest'
import { isNicknameSafe, validateChildText } from './safety.js'

describe('validateChildText', () => {
  it('allows imaginative safe text', () => {
    const r = validateChildText('Mèo vũ trụ nhảy trên cầu vồng')
    expect(r.ok).toBe(true)
  })

  it('blocks email PII', () => {
    const r = validateChildText('liên hệ me@school.com')
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('pii')
  })

  it('blocks phone PII', () => {
    const r = validateChildText('gọi 0912345678 nhé')
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('pii')
  })

  it('blocks URLs', () => {
    const r = validateChildText('xem https://example.com')
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('url')
  })

  it('blocks celebrity names', () => {
    const r = validateChildText('Messi đá bóng trên mây')
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('real_person')
  })

  it('blocks unsafe themes', () => {
    const r = validateChildText('có súng trong truyện')
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('unsafe')
  })

  it('blocks too long text', () => {
    const r = validateChildText('a'.repeat(81))
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('too_long')
  })
})

describe('isNicknameSafe', () => {
  it('rejects empty', () => {
    expect(isNicknameSafe('').ok).toBe(false)
  })

  it('rejects over 16 chars', () => {
    expect(isNicknameSafe('SiêuAnhHùngVũTrụX').ok).toBe(false)
  })

  it('accepts short safe nickname', () => {
    expect(isNicknameSafe('MựcCon').ok).toBe(true)
  })
})
