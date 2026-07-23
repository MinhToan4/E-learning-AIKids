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
  it('HomePage loads private progress and courses without a public leaderboard', () => {
    const src = read('features/home/pages/HomePage.tsx')
    expect(src).toContain('/api/gamification/streak')
    expect(src).toContain('/api/gamification/check-in')
    expect(src).toContain('/api/gamification/achievements')
    expect(src).not.toContain('/api/gamification/leaderboard')
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
    expect(picker).not.toContain('/api/media/promote')
    expect(picker).not.toContain('uploadStudentImage')
    expect(picker).toContain('Sản phẩm đồng hành')
    expect(picker).not.toContain('refImageUrl')
    expect(picker).not.toContain('startImages')
    expect(picker).not.toContain('data URL')
    expect(picker).not.toContain('Vidtory')
    const sketch = read('features/lesson/components/SketchCanvas.tsx')
    expect(sketch).toContain('toDataURL')
    expect(sketch).toContain('không chọn ảnh từ máy')
    const bag = read('features/backpack/pages/BackpackPage.tsx')
    expect(bag).not.toContain('uploadStudentImage')
  })

  it('completed lesson review is read-only and stale phase is recovered', () => {
    const lesson = read('features/lesson/pages/LessonPage.tsx')
    expect(lesson).toContain('reviewMode')
    expect(lesson).toContain('Quay lại kết quả')
    expect(lesson).toContain("detail.reason !== 'phase_mismatch'")
    expect(lesson).toContain('setPhase(detail.currentPhase)')
    expect(lesson).not.toContain('Tiến trình bài học đã thay đổi')
  })

  it('lesson always tells the child the goal, product and four-step rhythm', () => {
    const lesson = read('features/lesson/pages/LessonPage.tsx')
    expect(lesson).toContain('Hôm nay con sẽ')
    expect(lesson).toContain('Sản phẩm của trạm')
    expect(lesson).toContain("label: 'Khám phá'")
    expect(lesson).toContain("label: 'Chơi'")
    expect(lesson).toContain("label: 'Tạo'")
    expect(lesson).toContain("label: 'Thử tài'")
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

  it('Progress page celebrates growth without exposing a child leaderboard', () => {
    const progress = read('features/leaderboard/pages/LeaderboardPage.tsx')
    expect(progress).toContain('/api/gamification/class-celebration')
    expect(progress).toContain('Bước tiếp theo của con')
    expect(progress).toContain('Khu vườn chung')
    expect(progress).toContain('designerAssets.chrome.adventureMap')
    expect(progress).not.toContain('Chỉ ghi nhận nỗ lực, không so sánh bạn nào')
    expect(progress).not.toContain('progress-spark')
    expect(progress).not.toContain('lucide-react')
    expect(progress).not.toContain('xếp hạng')
    expect(progress).not.toContain('nickname')
  })

  it('role shells share icon navigation on desktop and mobile', () => {
    const shell = read('shared/components/layout/AppShell.tsx')
    const kidIcons = read('shared/components/icons/KidNavIcons.tsx')
    expect(shell).toContain('ParentDashboardIcon')
    expect(shell).toContain('ParentKidsIcon')
    expect(shell).toContain('role-nav-link')
    expect(shell).toContain('role-nav-icon')
    expect(shell).toContain('role-mobile-nav')
    expect(shell).toContain('NavCreativeIcon')
    expect(shell).not.toContain("from 'lucide-react'")
    expect(kidIcons).toContain('export function NavCreativeIcon')
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

  it('creative art uses StoryMee jobs after the safe in-app sketch workflow', () => {
    const creative = read('features/creative/pages/CreativePage.tsx') +
      read('features/creative/components/WorkshopCanvas.tsx') +
      read('shared/lib/creative-api.ts')
    expect(creative).toContain('WorkshopCanvas')
    expect(creative).toContain("'/api/v1/jobs'")
    expect(creative).not.toContain('/api/creative/create')
    expect(creative).not.toContain('uploadStudentImage')
    expect(creative).not.toContain("kind: 'mee'")
    expect(creative).not.toContain('Tạo Mee')
    expect(creative).toContain('buildArtGenerationPrompt')
    expect(creative).toContain('URL.createObjectURL')
  })

  it('root rendering has a child-friendly recovery boundary', () => {
    const main = read('app/main.tsx')
    const boundary = read('shared/components/AppErrorBoundary.tsx')
    expect(main).toContain('AppErrorBoundary')
    expect(boundary).toContain('Nội dung của con vẫn được giữ an toàn')
    expect(boundary).not.toContain('componentStack}</')
  })
})
