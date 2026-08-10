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
    expect(src).toContain('/api/enrollments')
    expect(src).toContain('lastActivityDate')
    expect(src).not.toContain('/api/gamification/check-in')
    expect(src).toContain('/api/gamification/achievements')
    expect(src).toContain("achievement.type === 'first_quest'")
    expect(src).not.toContain('/api/gamification/leaderboard')
    expect(src).toContain('claimedAt')
    expect(src).not.toContain('aikids.daily-mission-seen.')
    expect(src).toContain('Khám phá & đăng ký khóa mới')
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
    const sidebar = read('features/lesson/components/LeftPhaseSidebar.tsx')
    expect(lesson).toContain('Hôm nay con sẽ')
    expect(lesson).toContain('Sản phẩm của trạm')
    expect(sidebar).toContain("label: 'Khám phá'")
    expect(sidebar).toContain("label: 'Thử cùng Mee'")
    expect(sidebar).toContain("label: 'Tự tay làm'")
    expect(sidebar).toContain("label: 'Thử thách'")
  })

  it('supports MOCK_TEST_QUEST and visual quiz image options in Check phase', () => {
    const lesson = read('features/lesson/pages/LessonPage.tsx')
    expect(lesson).toContain('MOCK_TEST_QUEST')
    expect(lesson).toContain("questId.startsWith('test")
    expect(lesson).toContain("opt.startsWith('http')")
    expect(lesson).toContain('alt={`Option ${String.fromCharCode(65 + idx)}`}')
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
    expect(progress).toContain('Việc tiếp theo của con')
    expect(progress).toContain('Con vừa làm được gì?')
    expect(progress).toContain('Điều gì đang lớn lên?')
    expect(progress).toContain('Khu vườn chung')
    expect(progress).toContain('designerAssets.chrome.adventureMap')
    expect(progress).not.toContain('Kết quả gần nhất')
    expect(progress).not.toContain('Mã chứng nhận')
    expect(progress).not.toContain('Nhìn lại 4 tuần')
    expect(progress).not.toContain('Chỉ ghi nhận nỗ lực, không so sánh bạn nào')
    expect(progress).not.toContain('progress-spark')
    expect(progress).not.toContain('lucide-react')
    expect(progress).not.toContain('xếp hạng')
    expect(progress).not.toContain('nickname')
  })

  it('Level rewards stay contextual instead of duplicating student navigation', () => {
    const shell = read('shared/components/layout/AppShell.tsx')
    const level = read('features/level/pages/ExplorerLevelPage.tsx')
    const profile = read('features/profile/pages/ProfilePage.tsx')
    expect(shell).not.toContain("{ to: '/level'")
    expect(level).toContain('Hành trình cấp độ')
    expect(level).not.toContain('Con muốn làm gì?')
    expect(profile).toContain('to="/level"')
    expect(profile).toContain('Xem quà sắp mở và các mốc cấp tiếp theo.')
  })

  it('role shells share icon navigation on desktop and mobile', () => {
    const shell = read('shared/components/layout/AppShell.tsx')
    const parentGate = read('features/parent/components/ParentGateModal.tsx')
    const parentHomeIcon = read('shared/components/icons/ParentHomeIcon.tsx')
    const kidIcons = read('shared/components/icons/KidNavIcons.tsx')
    const cmsIcons = read('shared/components/icons/CmsIcons.tsx')
    expect(shell).toContain('ParentDashboardIcon')
    expect(shell).toContain('ParentKidsIcon')
    expect(shell).toContain('role-nav-link')
    expect(shell).toContain('role-nav-icon')
    expect(shell).toContain('adult-bottom-nav')
    expect(shell).toContain('student-bottom-nav')
    expect(shell).toContain('admin-drawer-sheet')
    expect(shell).toContain('KidCreativeImageIcon')
    expect(shell).toContain('<SidebarLogoutButton />')
    expect(shell).toContain('<MobileLogoutButton />')
    expect(shell).toContain('className="role-nav-link role-sidebar-logout"')
    expect(shell).toContain('className="student-nav-link student-rail-logout w-[4.5rem]"')
    expect(shell).toContain('className="student-drawer-item student-drawer-logout"')
    expect(cmsIcons).toContain('CmsLogoutIcon')
    expect(cmsIcons).toContain('stroke="currentColor"')
    expect(shell).not.toContain('UnifiedSwitcher')
    for (const page of [
      'features/parent/pages/ParentPage.tsx',
      'features/teacher/pages/TeacherPage.tsx',
      'features/admin/pages/AdminPage.tsx',
    ]) {
      expect(read(page)).not.toContain('Đăng xuất')
    }
    expect(shell).toContain('<ParentHomeIcon size={24} />')
    expect(shell).toContain('<ParentHomeIcon size={28} />')
    expect(parentGate).toContain('<ParentHomeIcon size={42} />')
    expect(parentGate).not.toContain('<House')
    expect(parentHomeIcon).toContain('🏠')
    expect(parentHomeIcon).not.toContain('🔒')
    expect(shell).not.toContain("from 'lucide-react'")
    expect(kidIcons).toContain('export function NavCreativeIcon')
  })

  it('login and parent hand-off use the approved adult-gate copy', () => {
    const login = read('features/auth/pages/LoginPage.tsx')
    const shell = read('shared/components/layout/AppShell.tsx')
    const parentGate = read('features/parent/components/ParentGateModal.tsx')
    expect(login).not.toContain('designerAssets.brand.mascot')
    expect(login).toContain('Chào con trở lại!')
    expect(login).toContain('Đăng nhập AIKid')
    expect(login).toContain('Phụ huynh & giáo viên')
    expect(login).not.toMatch(/Cổng người lớn|cổng này|quản trị viên/)
    for (const source of [login, shell, parentGate]) {
      expect(source).not.toMatch(/Ba\/Mẹ|Ba\/mẹ|ba\/mẹ/)
    }
    expect(shell).toContain('Ba / Mẹ')
    expect(parentGate).toContain('Ba / Mẹ ơi!')
  })

  it('ProfilePage surfaces streak + achievements APIs', () => {
    const page = read('features/profile/pages/ProfilePage.tsx')
    const overview = read('features/profile/profile-overview-api.ts')
    expect(page).toContain('loadProfileOverview')
    expect(overview).toContain('/api/gamification/streak')
    expect(overview).toContain('/api/gamification/achievements')
  })

  it('reward ownership and XP projection stay backend-authoritative', () => {
    const events = read('features/events/pages/EventsPage.tsx')
    const storybook = read('features/storybook/pages/StorybookPage.tsx')
    const backpack = read('features/backpack/pages/BackpackPage.tsx')
    const home = read('features/home/pages/HomePage.tsx')
    expect(events).toContain('ownedRewardIds.has(ticket.id)')
    expect(events).not.toContain('isRewardUnlocked(ticket')
    expect(storybook).toContain('publishedStickerIds.size')
    expect(storybook).not.toContain('/72 sticker')
    expect(backpack).toContain('/api/gamification/storybook')
    expect(backpack).toContain('Quà con đã nhận')
    expect(backpack).toContain('Ba lô của con')
    expect(backpack).toContain('Các ngăn trong Ba lô')
    expect(backpack).toContain('Đồ từ bài học')
    expect(backpack).toContain('Tác phẩm của con')
    expect(backpack).toContain('Đồ cho Hồ sơ')
    expect(backpack).toContain('Vé và quyền đặc biệt')
    expect(backpack).toContain('PROJECT_FILTERS')
    expect(backpack).not.toContain('Lọc sản phẩm trong Ba lô')
    expect(home).toContain('xpIntoLevel')
    expect(home).toContain('xpToNextLevel')
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

  it('guest profile sharing is parent-controlled and fail-closed', () => {
    const routes = read('app/App.tsx')
    const parentShare = read('features/parent/components/ProfileSharingPanel.tsx')
    const publicShare = read('features/profile/pages/PublicProfileSharePage.tsx')
    expect(routes).toContain('/share/:token')
    expect(parentShare).toContain('/api/parent/profile-shares')
    expect(parentShare).toContain('Tạo link 30 ngày')
    expect(parentShare).toContain('Ngừng chia sẻ')
    expect(parentShare).not.toContain('localStorage')
    expect(publicShare).toContain('/api/public/profile-shares/')
    expect(publicShare).toContain('noindex, nofollow, noarchive')
    expect(publicShare).not.toMatch(/profile\.(email|school|classroom|birthDate)/)
  })

  it('publishes store-review legal, support and account deletion routes', () => {
    const routes = read('app/App.tsx')
    const legal = read('features/legal/pages/LegalPage.tsx')
    for (const path of ['/privacy', '/terms', '/account/delete', '/support', '/data-safety']) {
      expect(routes).toContain(path)
    }
    expect(legal).toContain('Chính sách quyền riêng tư')
    expect(legal).toContain('Xóa tài khoản và dữ liệu')
    expect(legal).toContain('storymee.com@gmail.com')
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

  it('creative hub exposes art, character and story through StoryMee jobs', () => {
    const hub = read('features/creative/components/WorkshopHub.tsx')
    const page = read('features/creative/pages/CreativePage.tsx')
    const character = read('features/creative/components/WorkshopCharacter.tsx')
    expect(hub).toContain('Vẽ Tranh AI')
    expect(hub).toContain('Nhân Vật AI')
    expect(hub).toContain('Sáng Tác Truyện')
    expect(page).toContain('WorkshopCharacter')
    expect(character).toContain('generateCreativeImage')
    expect(character).toContain("creativeKind: 'character'")
  })

  it('root rendering has a child-friendly recovery boundary', () => {
    const main = read('app/main.tsx')
    const boundary = read('shared/components/AppErrorBoundary.tsx')
    expect(main).toContain('AppErrorBoundary')
    expect(boundary).toContain('Nội dung của con vẫn được giữ an toàn')
    expect(boundary).not.toContain('componentStack}</')
  })
})
