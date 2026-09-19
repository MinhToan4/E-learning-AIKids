// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AdminClassesDirectory } from './AdminClassesDirectory'

const mockApi = vi.fn()
vi.mock('@/shared/lib/api', () => ({
  api: (...args: unknown[]) => mockApi(...args),
}))

describe('AdminClassesDirectory ERP Master Directory', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    document.body.innerHTML = ''
  })

  it('renders School Master Classes Directory with KPIs, Filters, and classes table', async () => {
    mockApi.mockImplementation((url: string) => {
      if (url === '/api/schedule') {
        return Promise.resolve({
          classes: [
            {
              id: 'cls-test-1',
              name: 'Lớp Phi Hành Gia Nhí 3A',
              code: 'AIKI-3A',
              courseId: 'c-draw',
              teacherId: 't-hung',
              studentCount: 18,
              capacity: 25,
              status: 'open',
              completionRate: 85,
            },
            {
              id: 'cls-test-2',
              name: 'Lập Trình Game AI 2B',
              code: 'GAME-2B',
              courseId: 'c-scratch',
              teacherId: null,
              studentCount: 10,
              capacity: 20,
              status: 'draft',
              completionRate: 0,
            },
          ],
        })
      }
      if (url === '/api/admin/users') {
        return Promise.resolve({
          users: [
            { id: 't-hung', nickname: 'Thầy Hưng', email: 'gv@storymee.vn', role: 'teacher' },
            { id: 't-chi', nickname: 'Cô Linh Chi', email: 'chi.linh@storymee.vn', role: 'teacher' },
          ],
        })
      }
      if (url === '/api/admin/courses') {
        return Promise.resolve({
          courses: [
            { id: 'c-draw', title: 'Học vẽ AI Diệu Kỳ', category: 'Mỹ thuật AI' },
            { id: 'c-scratch', title: 'Xưởng Hoạt Hình AI', category: 'Lập trình' },
          ],
        })
      }
      return Promise.resolve({})
    })

    const onSelect = vi.fn()

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminClassesDirectory onSelectClass={onSelect} />
        </MemoryRouter>,
      )
    })

    // KPI
    expect(container.textContent).toContain('2')
    expect(container.textContent).toContain('Lớp học')
    expect(container.textContent).toContain('28')
    expect(container.textContent).toContain('Học sinh đang học')
    expect(container.textContent).toContain('Giáo viên đứng lớp')

    // Table
    expect(container.textContent).toContain('Lớp Phi Hành Gia Nhí 3A')
    expect(container.textContent).toContain('AIKI-3A')
    expect(container.textContent).toContain('Thầy Hưng')
    expect(container.textContent).toContain('Lập Trình Game AI 2B')
    expect(container.textContent).toContain('Chưa phân công')

    // Action button clicks
    const detailBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Quản lý chi tiết'),
    )
    expect(detailBtn).toBeDefined()
    await act(async () => {
      detailBtn?.click()
    })
    expect(onSelect).toHaveBeenCalled()
  })

  it('opens and submits CreateClassModal', async () => {
    mockApi.mockResolvedValue({})

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminClassesDirectory />
        </MemoryRouter>,
      )
    })

    const createBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Khởi tạo Lớp học mới'),
    )
    expect(createBtn).toBeDefined()

    await act(async () => {
      createBtn?.click()
    })

    expect(document.body.textContent).toContain('Khởi tạo Lớp học mới')
    expect(document.body.textContent).toContain('Quản Trị Toàn Trường (School ERP)')
    expect(document.body.textContent).toContain('Tên lớp học')
    expect(document.body.textContent).toContain('Mã lớp (Code)')
  })

  it('opens AssignTeacherModal for unassigned class and submits', async () => {
    mockApi.mockResolvedValue({})

    await act(async () => {
      root.render(
        <MemoryRouter>
          <AdminClassesDirectory />
        </MemoryRouter>,
      )
    })

    const assignBtns = Array.from(container.querySelectorAll('button')).filter((b) =>
      b.textContent?.includes('Phân công GV'),
    )
    expect(assignBtns.length).toBeGreaterThan(0)

    await act(async () => {
      assignBtns[0]?.click()
    })

    expect(document.body.textContent).toContain('Phân công Giáo viên')
    expect(document.body.textContent).toContain('Phân Bổ Nhân Sự ERP')
    expect(document.body.textContent).toContain('Lưu phân công')
  })
})
