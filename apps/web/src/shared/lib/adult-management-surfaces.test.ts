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
    expect(shell).toContain("to: '/parent/learning', label: 'Học tập'")
    expect(shell).toContain('ParentLearningIcon')
  })

  it('makes parent learning action-oriented without creating a client-side catalog', () => {
    const learning = read('features/parent/pages/ParentLearningPage.tsx')

    expect(learning).toContain("useState<Section>('overview')")
    expect(learning).toContain("['pathway', 'Lộ trình', MapIcon]")
    expect(learning).toContain("['activity', 'Hoạt động', Activity]")
    expect(learning).toContain('Bước tiếp theo')
    expect(learning).toContain('Lịch sử gần đây')
    expect(learning).toContain('Nhịp học & thời lượng')
    expect(learning).toContain('Không dùng sao hoặc XP để suy đoán thời gian học.')
    expect(learning).toContain('Cần thêm trải nghiệm để đánh giá')
    expect(learning).toContain('Chọn chương trình cho con')
    expect(learning).toContain("'Chọn vùng học'")
    expect(learning).toContain('Đăng ký vùng này')
    expect(learning).toContain('vùng · Nâng gói')
    expect(learning).toContain('Đã đăng ký')
    expect(learning).toContain("`/api/parent/children/${studentId}/courses`")
    expect(learning).toContain("`/api/parent/children/${studentId}/progress`")
    expect(learning).toContain('learningApi.getPathway(studentId)')
    expect(learning).not.toContain('const courses = [')
  })

  it('separates child profile management from learning management', () => {
    const parent = read('features/parent/pages/ParentPage.tsx')
    const learning = read('features/parent/pages/ParentLearningPage.tsx')

    expect(parent).toContain('Quản lý danh tính, mã PIN, quyền an toàn và cách con đăng nhập')
    expect(parent).toContain('to={`/parent/learning?childId=${encodeURIComponent(k.id)}`}')
    expect(parent).not.toContain('Bấm nút <strong>“Xem tiến trình”</strong>')
    expect(learning).toContain('Trung tâm học tập')
    expect(learning).toContain("searchParams.get('childId')")
    expect(learning).toContain('Quản lý hồ sơ')
    expect(parent).toContain('Danh tính, PIN và quyền an toàn')
    expect(parent).toContain('Lộ trình, hoạt động và năng lực')
    expect(parent).not.toContain('>Vào học<')
  })

  it('presents child mode switching as a separate action, not a management page', () => {
    const shell = read('shared/components/layout/AppShell.tsx')
    const picker = read('features/family/pages/ChildPickerPage.tsx')

    expect(shell).toContain("label: 'Quản lý con'")
    expect(shell).toContain("label: 'Chuyển sang con'")
    expect(shell).toContain("action: true")
    expect(picker).toContain('Chuyển chế độ thiết bị')
    expect(picker).toContain('Chọn hồ sơ để vào học')
    expect(picker).toContain('Phần quản lý của Ba / Mẹ sẽ được ẩn')
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

  it('explains plan capacity as child profiles and open learning regions', () => {
    const parent = read('features/parent/pages/ParentPage.tsx')

    expect(parent).toContain('Gói học quyết định số hồ sơ con và số vùng học mỗi con được mở cùng lúc')
    expect(parent).toContain('Mức sử dụng của gia đình')
    expect(parent).toContain('vùng học mở cùng lúc / con')
    expect(parent).toContain('Nâng lên gói này')
    expect(parent).toContain('Hoàn tất nâng gói')
  })

  it('opens the shared authoring workspace directly from admin and teacher navigation', () => {
    const shell = read('shared/components/layout/AppShell.tsx')
    const teacher = read('features/teacher/pages/TeacherPage.tsx')

    expect(shell).toContain("to: '/teacher/courses', label: 'Biên soạn'")
    expect(shell).toContain("to: '/teacher/lectures', label: 'Trạm học'")
    expect(teacher).toContain('setSearchParams({ programId: nextProgramId, courseId: nextCourseId }, { replace: true })')
  })
})
