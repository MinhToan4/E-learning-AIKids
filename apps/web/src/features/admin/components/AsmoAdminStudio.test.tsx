// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AsmoAdminStudio } from './AsmoAdminStudio'

describe('AsmoAdminStudio Component', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('renders AsmoAdminStudio without crashing with header and 4 metric cards', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    expect(container.textContent).toContain('Học & Thi ASMO Quốc Tế')
    expect(container.textContent).toContain('ASMO OLYMPIAD STUDIO')

    // 4 tab buttons
    expect(container.textContent).toContain('Đề thi & Phòng thi')
    expect(container.textContent).toContain('Lộ trình học')
    expect(container.textContent).toContain('Kiểm định chất lượng')
    expect(container.textContent).toContain('Báo cáo & Lịch sử')

    // 4 metric cards in exams tab
    expect(container.textContent).toContain('Tổng số đề')
    expect(container.textContent).toContain('Đang mở')
    expect(container.textContent).toContain('Bản nháp')
    expect(container.textContent).toContain('Điểm trung bình')
  })

  it('switches between all 4 tabs seamlessly', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    const buttons = Array.from(container.querySelectorAll('button'))

    // 1. Switch to 'curriculum' tab
    const curriculumTabBtn = buttons.find((btn) => btn.textContent?.includes('Lộ trình học'))
    expect(curriculumTabBtn).toBeDefined()

    act(() => {
      curriculumTabBtn?.click()
    })

    expect(container.textContent).toContain('Lộ Trình Học Chuẩn ASMO')
    expect(container.textContent).toContain('Trọng tâm:')
    expect(container.textContent).toContain('3D LAB')

    // 2. Switch to 'audit' tab
    const auditTabBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Kiểm định chất lượng'),
    )
    expect(auditTabBtn).toBeDefined()

    act(() => {
      auditTabBtn?.click()
    })

    expect(container.textContent).toContain('Chỉ số sức khỏe KaTeX & Sư phạm')
    expect(container.textContent).toContain('Cú pháp KaTeX')
    expect(container.textContent).toContain('Tính nhất quán')
    expect(container.textContent).toContain('Cấu trúc sư phạm')
    expect(container.textContent).toContain('Quét lại toàn bộ ngân hàng đề')

    // 3. Switch to 'analytics' tab
    const analyticsTabBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Báo cáo & Lịch sử'),
    )
    expect(analyticsTabBtn).toBeDefined()

    act(() => {
      analyticsTabBtn?.click()
    })

    expect(container.textContent).toContain('Lượt Nộp Bài Gần Đây Của Học Sinh')
    expect(container.textContent).toContain('Top Câu Hỏi Học Sinh Hay Làm Sai')
    expect(container.textContent).toContain('Tổng lượt nộp bài')
    expect(container.textContent).toContain('Tỷ lệ đạt chuẩn')

    // 4. Switch back to 'exams' tab
    const examsTabBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Đề thi & Phòng thi'),
    )
    expect(examsTabBtn).toBeDefined()

    act(() => {
      examsTabBtn?.click()
    })

    expect(container.textContent).toContain('Tổng số đề')
    expect(container.textContent).toContain('Đang mở')
  })

  it('filters exams by subject and grade', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    const selects = Array.from(container.querySelectorAll('select'))
    expect(selects.length).toBeGreaterThanOrEqual(3)

    // Subject select is the first select in filter bar
    const subjectSelect = selects[0]
    expect(subjectSelect).toBeDefined()

    // Filter by 'math'
    act(() => {
      subjectSelect.value = 'math'
      subjectSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(container.textContent).toContain('Toán')

    // Grade select is the second select
    const gradeSelect = selects[1]
    expect(gradeSelect).toBeDefined()

    // Filter by Grade 1
    act(() => {
      gradeSelect.value = '1'
      gradeSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(container.textContent).toContain('Lớp 1')

    // Search input
    const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement
    expect(searchInput).toBeDefined()

    act(() => {
      searchInput.value = '2020'
      searchInput.dispatchEvent(new Event('input', { bubbles: true }))
    })

    expect(container.textContent).toContain('2020')
  })

  it('toggles exam publish status correctly', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    // Find the first toggle button
    const toggleButtons = Array.from(container.querySelectorAll('button')).filter(
      (btn) => btn.textContent?.includes('Đang mở') || btn.textContent?.includes('Bản nháp'),
    )

    expect(toggleButtons.length).toBeGreaterThan(0)
    const firstToggle = toggleButtons[0]
    const initialText = firstToggle.textContent || ''

    act(() => {
      firstToggle.click()
    })

    // Text of the button should toggle
    const updatedToggle = Array.from(container.querySelectorAll('button')).filter(
      (btn) => btn.textContent?.includes('Đang mở') || btn.textContent?.includes('Bản nháp'),
    )[0]

    expect(updatedToggle.textContent).not.toEqual(initialText)

    // A notification toast should be rendered
    const toast = container.querySelector('[role="alert"]')
    expect(toast).toBeDefined()
    expect(toast?.textContent).toMatch(/Đã kích hoạt|Đã chuyển về bản nháp/)
  })

  it('opens and closes regulation modal and questions modal', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    // 1. Test Regulation Modal
    const regButton = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Chỉnh quy chế'),
    )
    expect(regButton).toBeDefined()

    act(() => {
      regButton?.click()
    })

    expect(container.textContent).toContain('Chỉnh Quy Chế Phòng Thi')
    expect(container.textContent).toContain('Thời lượng (phút)')

    // Click 'Hủy' button to close
    const cancelButton = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent === 'Hủy',
    )
    expect(cancelButton).toBeDefined()

    act(() => {
      cancelButton?.click()
    })

    expect(container.textContent).not.toContain('Chỉnh Quy Chế Phòng Thi')

    // 2. Test Question details modal
    const viewQuestionsButton = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Chi tiết câu hỏi'),
    )
    expect(viewQuestionsButton).toBeDefined()

    act(() => {
      viewQuestionsButton?.click()
    })

    expect(container.textContent).toContain('Chi Tiết Câu Hỏi & Đáp Án KaTeX')

    // Click 'Đóng' button to close
    const closeButton = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent === 'Đóng',
    )
    expect(closeButton).toBeDefined()

    act(() => {
      closeButton?.click()
    })

    expect(container.textContent).not.toContain('Chi Tiết Câu Hỏi & Đáp Án KaTeX')
  })
})
