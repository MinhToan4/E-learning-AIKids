import { globSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const sourceRoot = resolve(import.meta.dirname, '../..')
const sourceFiles = globSync('**/*.{ts,tsx}', {
  cwd: sourceRoot,
  exclude: ['**/*.test.ts', '**/*.test.tsx'],
})

describe('frontend backend boundary', () => {
  it('keeps application HTTP calls inside the shared API client', () => {
    const violations = sourceFiles.flatMap((file) => {
      const source = readFileSync(resolve(sourceRoot, file), 'utf8')
      if (!/\bfetch\s*\(/.test(source)) return []
      return file === 'shared/lib/api.ts' ? [] : [file]
    })

    expect(violations).toEqual([])
  })

  it('does not import database or realtime SDKs in feature code', () => {
    const forbidden =
      /(?:from\s+|import\s*\()['"](?:@supabase\/|firebase\/firestore|firebase\/database)/
    const violations = sourceFiles.flatMap((file) => {
      const source = readFileSync(resolve(sourceRoot, file), 'utf8')
      return forbidden.test(source) ? [file] : []
    })

    expect(violations).toEqual([])
  })

  it('keeps deployable backend origins in the environment module only', () => {
    const backendOrigin = /https:\/\/(?:dev-hub\.storymee\.com|api\.aikid\.vn)/
    const violations = sourceFiles.flatMap((file) => {
      if (file === 'shared/config/environment.ts') return []
      const source = readFileSync(resolve(sourceRoot, file), 'utf8')
      return backendOrigin.test(source) ? [file] : []
    })

    expect(violations).toEqual([])
  })
})
