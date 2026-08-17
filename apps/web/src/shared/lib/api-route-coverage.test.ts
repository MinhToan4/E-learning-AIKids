import { globSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findApiRoute } from './api-route-tree'

const sourceRoot = resolve(import.meta.dirname, '../..')
const applicationFiles = globSync('**/*.{ts,tsx}', {
  cwd: sourceRoot,
  exclude: ['**/*.test.ts', '**/*.test.tsx', 'shared/lib/api.ts', 'shared/lib/api-route-tree.ts'],
})

// Captures the stable portion of string and template-literal API paths. A
// dynamic suffix is irrelevant for registry ownership because matching is by
// bounded family prefix.
const API_PATH = /\/api\/[a-zA-Z0-9._~!&()+,;=:@%?/-]*/g

describe('application API route coverage', () => {
  it('classifies every API path referenced by frontend and CMS source', () => {
    const unknown = applicationFiles.flatMap((file) => {
      const source = readFileSync(resolve(sourceRoot, file), 'utf8')
      const paths = [...source.matchAll(API_PATH)].map(([path]) => path.replace(/[),.;]+$/, ''))
      return [...new Set(paths)]
        .filter((path) => path.length > '/api/'.length && !findApiRoute(path))
        .map((path) => `${file}: ${path}`)
    })

    expect(unknown).toEqual([])
  })

  it('keeps canonical service paths behind shared domain adapters', () => {
    const allowedCanonicalCallers = new Set([
      'shared/lib/creative-api.ts',
      'shared/lib/learning-api.ts',
      'shared/lib/media-api.ts',
      // These are already canonical contracts; move them into the matching
      // domain adapter when those feature modules are next changed.
      'features/admin/components/RewardPackAdmin.tsx',
      'features/teacher/components/TeacherFeedbackPanel.tsx',
      'features/parent/components/ParentTeacherFeedbackSection.tsx',
      'features/backpack/pages/BackpackPage.tsx',
    ])
    const violations = applicationFiles.flatMap((file) => {
      if (allowedCanonicalCallers.has(file.replace(/\\/g, '/'))) return []
      const source = readFileSync(resolve(sourceRoot, file), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
      return /\/api\/v1\//.test(source) ? [file] : []
    })

    expect(violations).toEqual([])
  })
})
