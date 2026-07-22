import { describe, expect, it } from 'vitest'
import { selectIsolatedTestDatabase } from './test-database-policy.js'

describe('integration database safety policy', () => {
  it('requires an explicit TEST_DATABASE_URL', () => {
    expect(
      selectIsolatedTestDatabase(undefined, 'postgresql://user@prod/db'),
    ).toBeNull()
  })

  it('rejects the application database even when connection options differ', () => {
    expect(
      selectIsolatedTestDatabase(
        'postgresql://user:other@db.example.com:5432/app?connection_limit=1',
        'postgresql://user:secret@db.example.com:5432/app?connection_limit=10',
      ),
    ).toBeNull()
  })

  it('accepts a database with a distinct database name', () => {
    const testUrl = 'postgresql://user@db.example.com:5432/aikids_test'
    expect(
      selectIsolatedTestDatabase(
        testUrl,
        'postgresql://user@db.example.com:5432/aikids_prod',
      ),
    ).toBe(testUrl)
  })
})
