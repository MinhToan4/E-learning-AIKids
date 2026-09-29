import { describe, expect, it } from 'vitest'

import { rewriteDevSessionCookie } from './dev-session-cookie'

describe('rewriteDevSessionCookie', () => {
  it('adapts the production session cookie for localhost without exposing it', () => {
    expect(
      rewriteDevSessionCookie(
        '__Host-storymee_session=opaque; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax',
      ),
    ).toBe(
      'storymee_session=opaque; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax',
    )
  })

  it('leaves unrelated cookies unchanged', () => {
    expect(rewriteDevSessionCookie('theme=soft; Path=/; SameSite=Lax')).toBe(
      'theme=soft; Path=/; SameSite=Lax',
    )
  })
})

