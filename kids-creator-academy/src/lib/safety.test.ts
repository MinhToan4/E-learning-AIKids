import { describe, expect, it } from 'vitest'
import { isNicknameSafe, validateChildText } from '@/lib/safety'

describe('validateChildText', () => {
  it('allows safe imaginative text', () => {
    expect(validateChildText('có đèn vàng nhẹ').ok).toBe(true)
  })

  it('blocks email and phone PII', () => {
    expect(validateChildText('mail test@example.com').ok).toBe(false)
    expect(validateChildText('gọi 0912345678').ok).toBe(false)
  })

  it('blocks school/address and celebrities', () => {
    expect(validateChildText('trường ABC').ok).toBe(false)
    expect(validateChildText('địa chỉ 12 Lê Lợi').ok).toBe(false)
    expect(validateChildText('vẽ messi').ok).toBe(false)
  })

  it('blocks overly long free text', () => {
    expect(validateChildText('a'.repeat(81)).ok).toBe(false)
  })
})

describe('isNicknameSafe', () => {
  it('accepts short nicknames', () => {
    expect(isNicknameSafe('Mây').ok).toBe(true)
  })
})
