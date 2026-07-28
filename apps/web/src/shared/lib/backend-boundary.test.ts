import { globSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const sourceRoot = resolve(import.meta.dirname, '../..')
const sourceFiles = globSync('**/*.{ts,tsx}', {
  cwd: sourceRoot,
  exclude: ['**/*.test.ts', '**/*.test.tsx'],
})

// Files that legitimately call fetch() directly rather than through api():
//   shared/lib/api.ts          — the API client itself
//   features/lesson/lib/offline-learning.ts — caches media URLs into Cache API
//                                             (Service Worker pattern; not an API call)
//   features/parent/pages/ParentLearningPage.tsx — PDF/binary blob download
//                                             (api() only handles JSON; binary
//                                              downloads need raw fetch + Blob)
const FETCH_ALLOWLIST = new Set([
  'shared/lib/api.ts',
  'features/lesson/lib/offline-learning.ts',
  'features/parent/pages/ParentLearningPage.tsx',
])

describe('frontend backend boundary', () => {
  it('keeps application HTTP calls inside the shared API client', () => {
    const violations = sourceFiles.flatMap((file) => {
      const source = readFileSync(resolve(sourceRoot, file), 'utf8')
      if (!/\bfetch\s*\(/.test(source)) return []
      // Normalise path separators for Windows compatibility
      return FETCH_ALLOWLIST.has(file.replace(/\\/g, '/')) ? [] : [file]
    })

    expect(violations).toEqual([])
  })

  it('does not import database or realtime SDKs in feature code', () => {
    const forbidden =
      /(?:from\s+|import\s*\()['"'](?:@supabase\/|firebase\/firestore|firebase\/database)/
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
