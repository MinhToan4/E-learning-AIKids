/**
 * Structural proof that Phase 4 student surfaces wire to real API paths.
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')

function read(rel: string) {
  return readFileSync(resolve(root, 'src', rel), 'utf8')
}

describe('Phase 4 FE surfaces call shipped APIs', () => {
  it('HomePage loads streak, check-in, achievements, courses, leaderboard', () => {
    const src = read('features/home/pages/HomePage.tsx')
    expect(src).toContain('/api/gamification/streak')
    expect(src).toContain('/api/gamification/check-in')
    expect(src).toContain('/api/gamification/achievements')
    expect(src).toContain('/api/gamification/leaderboard')
    expect(src).toContain('/api/courses')
    expect(src).toContain('ageTrack')
  })

  it('Lesson ref picker is course-only (no free student photo upload)', () => {
    const lesson = read('features/lesson/pages/LessonPage.tsx')
    expect(lesson).toContain('RefMediaPicker')
    expect(lesson).toContain('assetIds')
    expect(lesson).toContain('SketchCanvas')
    expect(lesson).toContain('sketchDataUrl')
    const picker = read('features/lesson/components/RefMediaPicker.tsx')
    expect(picker).toContain('/api/media/refs')
    expect(picker).toContain('/api/media/promote')
    expect(picker).not.toContain('uploadStudentImage')
    expect(picker).toContain('không upload ảnh ngoài')
    const sketch = read('features/lesson/components/SketchCanvas.tsx')
    expect(sketch).toContain('toDataURL')
    expect(sketch).toContain('không chọn ảnh từ máy')
    const bag = read('features/backpack/pages/BackpackPage.tsx')
    expect(bag).not.toContain('uploadStudentImage')
  })

  it('AchievementsPage and NotificationBell exist with real endpoints', () => {
    const ach = read('features/achievements/pages/AchievementsPage.tsx')
    expect(ach).toContain('/api/gamification/achievements')
    const bell = read(
      'features/notifications/components/NotificationBell.tsx',
    )
    expect(bell).toContain('/api/notifications')
    expect(bell).toContain('/api/notifications/read-all')
  })

  it('ProfilePage surfaces streak + achievements APIs', () => {
    const src = read('features/profile/pages/ProfilePage.tsx')
    expect(src).toContain('/api/gamification/streak')
    expect(src).toContain('/api/gamification/achievements')
  })

  it('AdminPage wires Vidtory settings + model load-balancing UI', () => {
    const src = read('features/admin/pages/AdminPage.tsx')
    expect(src).toContain('/api/admin/settings/vidtory')
    expect(src).toContain('method: \'PUT\'')
    expect(src).toContain('saveRouting')
    expect(src).toContain('modelId')
    expect(src).toContain('weight')
    expect(src).toContain('aspectRatio')
    expect(src).not.toMatch(/vidtory_[a-z0-9]{20,}/i)
  })

  it('App routes include /achievements', () => {
    const src = read('app/App.tsx')
    expect(src).toContain('/achievements')
    expect(src).toContain('AchievementsPage')
  })
})
