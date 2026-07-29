import { describe, expect, it } from 'vitest'
import { createUuid } from './uuid'

describe('createUuid', () => {
  it('returns an RFC 4122 v4 identifier', () => {
    expect(createUuid()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
  })
})
