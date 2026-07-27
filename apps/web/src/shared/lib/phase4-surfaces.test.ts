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

  it('WorldPage uses the kid icon family instead of emoji function icons', () => {
    const world = read('features/world/pages/WorldPage.tsx')
    expect(world).toContain('NavWorldIcon')
    expect(world).toContain('CourseBookIcon')
    expect(world).not.toContain('QUEST_ICONS')
    expect(world).not.toMatch(/[🗺️📋🏆🌟🧩🎨📖🎭🎬🔍🤖💡🚀🌈]/u)
  })

  it('kid journey actions use SVG icons instead of emoji controls', () => {
    const home = read('features/home/pages/HomePage.tsx')
    const lesson = read('features/lesson/pages/LessonPage.tsx')

    expect(home).toContain('<Play')
    expect(lesson).toContain('<Gamepad2')
    expect(lesson).toContain('<NavWorldIcon')
    expect(home).not.toContain('▶ {dailyMission.action.label}')
    expect(lesson).not.toContain("'🎮 Bắt đầu trò chơi'")
    expect(lesson).not.toContain("'⭐ Nộp bài & nhận sao'")
    expect(lesson).not.toContain('▶ Trạm tiếp theo')
    expect(lesson).not.toContain('🗺️ Về bản đồ')
  })

  it('role shells share icon navigation on desktop and mobile', () => {
    const shell = read('shared/components/layout/AppShell.tsx')
    const kidIcons = read('shared/components/icons/KidNavIcons.tsx')
    const parentIcons = read('shared/components/icons/ParentIcons.tsx')
    const cmsIcons = read('shared/components/icons/CmsIcons.tsx')
    expect(shell).toContain('ParentDashboardIcon')
    expect(shell).toContain('ParentKidsIcon')
    expect(shell).toContain('ParentLearningIcon')
    expect(shell).toContain('NavAssessmentIcon')
    expect(shell).toContain('CmsOperationsIcon')
    expect(shell).toContain('CmsScheduleIcon')
    expect(shell).toContain('CmsAssessmentIcon')
    expect(shell).toContain('CmsSettingsIcon')
    expect(shell).toContain('role-nav-link')
    expect(shell).toContain('role-nav-icon')
    expect(shell).toContain('student-bottom-nav')
    expect(shell).toContain('adult-bottom-nav')
    expect(shell).toContain('AdultDrawer')
    expect(shell).toContain('NavCreativeIcon')
    expect(kidIcons).toContain('export function NavCreativeIcon')
    expect(kidIcons).toContain('export function NavAssessmentIcon')
    expect(parentIcons).toContain('export function ParentLearningIcon')
    expect(cmsIcons).toContain('export function CmsOperationsIcon')
    expect(shell).not.toContain('lucide-react')
    expect(shell).not.toContain('🏡')
  })

  it('adult controls use one SVG icon language instead of emoji actions', () => {
    const adultControls = [
      read('features/admin/pages/AdminPage.tsx'),
      read('features/teacher/pages/TeacherPage.tsx'),
      read('features/parent/components/ParentGateModal.tsx'),
      read('shared/components/ui/Toast.tsx'),
      read('shared/components/ui/ErrorState.tsx'),
    ].join('\n')

    expect(adultControls).toContain('lucide-react')
    expect(adultControls).not.toMatch(/[🔍✅❌⚠️▶🗑️✏️⚙️🔒🙈👁️]/u)
  })

  it('critical adult filters and password controls have accessible names', () => {
    const admin = read('features/admin/pages/AdminPage.tsx')
    const parent = read('features/parent/pages/ParentPage.tsx')
    const phase2 = read('features/admin/pages/Phase2ConfigPage.tsx')

    expect(admin).toContain('aria-label="Tìm nhật ký đăng nhập"')
    expect(admin).toContain('aria-label="Lọc tài khoản theo vai trò"')
    expect(admin).toContain('aria-label="Lọc khóa học theo trạng thái"')
    expect(parent).toContain('aria-label="Mật khẩu hiện tại"')
    expect(parent).toContain('aria-label="Mật khẩu mới"')
    expect(phase2).toContain('aria-label="Lý do thu hồi chứng chỉ"')
  })

  it('parent operational surfaces use the shared SVG icon language', () => {
    const parent =
      read('features/parent/pages/ParentPage.tsx') +
      read('features/parent/components/ParentGateModal.tsx')

    expect(parent).toContain('Gamepad2')
    expect(parent).toContain('PartyPopper')
    expect(parent).toContain('House')
    expect(parent).not.toMatch(/[🎮👧👶📊🌱🎬🎉🔐🏡]/u)
  })

  it('scheduling uses guided lesson-plan fields instead of asking teachers for JSON', () => {
    const scheduling = read('features/teacher/pages/SchedulingPage.tsx')

    expect(scheduling).toContain('Mục tiêu buổi học')
    expect(scheduling).toContain('Hoạt động chính')
    expect(scheduling).toContain('Học liệu cần chuẩn bị')
    expect(scheduling).toContain('buildLessonPlan')
    expect(scheduling).not.toContain('Kế hoạch buổi học (JSON)')
    expect(scheduling).not.toContain('parseJsonObject')
  })

  it('teacher grading renders learner submissions without raw JSON', () => {
    const operations = read('features/teacher/pages/TeacherOperationsPage.tsx')

    expect(operations).toContain('reviewResponseSummary')
    expect(operations).not.toContain('JSON.stringify(review.response')
  })

  it('teacher operations can reopen observation drafts without exposing teacher-only writes to admin', () => {
    const operations = read('features/teacher/pages/TeacherOperationsPage.tsx')

    expect(operations).toContain(
      '/api/teacher/students/${selectedStudentId}/learning-overview',
    )
    expect(operations).toContain(
      '/api/teacher/observations/${editingObservation.id}',
    )
    expect(operations).toContain("method: 'PATCH'")
    expect(operations).toContain('Tiếp tục bản nháp')
    expect(operations).toContain('canWriteObservation')
  })

  it('admin can monitor classes without seeing teacher-owned class mutations', () => {
    const teacher = read('features/teacher/pages/TeacherPage.tsx')

    expect(teacher).toContain('canManageClass')
    expect(teacher).toContain("role === 'teacher'")
    expect(teacher).toContain('Việc thêm, gỡ học sinh và đổi mã lớp thuộc giáo viên phụ trách.')
  })

  it('assessment results remain reachable after a learner leaves the submitted attempt screen', () => {
    const assessment = read('features/assessment/pages/AssessmentPage.tsx')

    expect(assessment).toContain(
      '/api/assessment-attempts/${latestAttempt.id}/result',
    )
    expect(assessment).toContain('Xem kết quả và góp ý')
    expect(assessment).toContain('latestAttempt')
  })

  it('clears learner offline data whenever the authenticated user changes', () => {
    const auth = read('shared/store/auth.ts')
    expect(auth).toContain('clearPreviousLearnerData')
    expect(auth).toContain('clearOfflineLearningData')
  })

  it('lets learners remove notes and bookmarks with visible error feedback', () => {
    const tools = read(
      'features/lesson/components/LearningToolsPanel.tsx',
    )
    expect(tools).toContain('/api/learning/notes/${noteId}')
    expect(tools).toContain('/api/learning/bookmarks/${bookmarkId}')
    expect(tools).toContain('Không bỏ đánh dấu được.')
    expect(tools).toContain('Không xóa được ghi chú.')
    expect(tools).toContain('maxLength={80}')
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

  it('creative art uses the safe in-app sketch workflow before Vidtory generation', () => {
    const components =
      read('features/creative/pages/CreativePage.tsx') +
      read('features/creative/components/WorkshopCanvas.tsx') +
      read('features/creative/components/WorkshopCharacter.tsx') +
      read('features/creative/components/WorkshopStory.tsx')
    const client = read('shared/lib/creative-api.ts')
    expect(components).toContain('WorkshopCanvas')
    expect(client).toContain('/api/creative/sketch')
    expect(client).toContain('/api/creative/create')
    expect(client).toContain('/api/v1/jobs')
    expect(components).not.toContain('/api/media/promote')
    expect(components).not.toContain('type="file"')
    expect(components).not.toContain('new FileReader')
    expect(components).not.toContain('uploadStudentImage')
    expect(components).not.toContain("kind: 'mee'")
    expect(components).not.toContain('Tạo Mee')
  })

  it('root rendering has a child-friendly recovery boundary', () => {
    const main = read('app/main.tsx')
    const boundary = read('shared/components/AppErrorBoundary.tsx')
    expect(main).toContain('AppErrorBoundary')
    expect(boundary).toContain('Nội dung của con vẫn được giữ an toàn')
    expect(boundary).not.toContain('componentStack}</')
  })
})
