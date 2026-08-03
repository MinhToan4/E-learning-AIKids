import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('RewardPackAdmin publish workflow', () => {
  it('keeps approval and publication as separate confirmed actions', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/features/admin/components/RewardPackAdmin.tsx'), 'utf8')
    expect(source).toContain("kind: 'approve' | 'publish'")
    expect(source).toContain('ConfirmDialog')
    expect(source).toContain("pack.status === 'ready_for_review'")
    expect(source).toContain("pack.status === 'approved'")
    expect(source).toContain('/${action.pack.id}/${action.kind}')
  })
})
