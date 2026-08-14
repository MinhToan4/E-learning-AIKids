import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '../..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

describe('adult management surfaces', () => {
  it('keeps parent learning reachable from both route and role navigation', () => {
    const app = read('app/App.tsx')
    const shell = read('shared/components/layout/AppShell.tsx')

    expect(app).toContain('path="/parent/learning"')
    expect(shell).toContain("to: '/parent/learning'")
    expect(shell).toContain('ParentLearningIcon')
  })

  it('keeps implemented admin configuration surfaces reachable and consolidates learning configuration', () => {
    const app = read('app/App.tsx')
    const shell = read('shared/components/layout/AppShell.tsx')

    expect(app).toContain('path="/admin/billing"')
    expect(app).toContain('path="/admin/learning-config"')
    expect(app).toContain('<Navigate to="/admin/courses" replace />')
    expect(shell).toContain("to: '/admin/billing'")
    expect(shell).not.toContain("to: '/admin/learning-config'")
  })

  it('does not silently render zero child data when the parent request fails', () => {
    const parent = read('features/parent/pages/ParentPage.tsx')

    expect(parent).toContain('Chưa tải được dữ liệu của các con')
    expect(parent).toContain('<ErrorState message={error}')
  })

  it('opens the shared authoring workspace directly from admin and teacher navigation', () => {
    const shell = read('shared/components/layout/AppShell.tsx')
    const teacher = read('features/teacher/pages/TeacherPage.tsx')

    expect(shell).toContain("to: '/teacher/courses', label: 'Biên soạn'")
    expect(shell).toContain("to: '/teacher/lectures', label: 'Trạm học'")
    expect(teacher).toContain('setSearchParams({ programId: nextProgramId, courseId: nextCourseId }, { replace: true })')
  })
})
