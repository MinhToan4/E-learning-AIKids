// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
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

    // A notification toast should be rendered via Portal into document.body
    const toast = document.body.querySelector('[role="alert"]')
    expect(toast).toBeDefined()
    expect(toast?.textContent).toMatch(/Đã kích hoạt|Đã chuyển về bản nháp/)
  })

  it('opens and closes regulation modal and questions modal via createPortal', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    // 1. Test Regulation Modal (rendered via createPortal into document.body)
    const regButton = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Chỉnh quy chế'),
    )
    expect(regButton).toBeDefined()

    act(() => {
      regButton?.click()
    })

    expect(document.body.textContent).toContain('Chỉnh Quy Chế Phòng Thi')
    expect(document.body.textContent).toContain('Thời lượng (phút)')

    // Click 'Hủy' button to close
    const cancelButton = Array.from(document.body.querySelectorAll('button')).find(
      (btn) => btn.textContent === 'Hủy',
    )
    expect(cancelButton).toBeDefined()

    act(() => {
      cancelButton?.click()
    })

    expect(document.body.textContent).not.toContain('Chỉnh Quy Chế Phòng Thi')

    // 2. Test Question details modal (rendered via createPortal into document.body)
    const viewQuestionsButton = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Chi tiết câu hỏi'),
    )
    expect(viewQuestionsButton).toBeDefined()

    act(() => {
      viewQuestionsButton?.click()
    })

    expect(document.body.textContent).toContain('Chi Tiết Câu Hỏi & Đáp Án KaTeX')

    // Click 'Đóng' button to close
    const closeButton = Array.from(document.body.querySelectorAll('button')).find(
      (btn) => btn.textContent === 'Đóng',
    )
    expect(closeButton).toBeDefined()

    act(() => {
      closeButton?.click()
    })

    expect(document.body.textContent).not.toContain('Chi Tiết Câu Hỏi & Đáp Án KaTeX')
  })

  it('paginates exams list with 12 items per page and renders Paginator', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    // Verify pagination range info in DOM
    expect(container.textContent).toContain('1–12 / 100')
    expect(container.textContent).toContain('Hiển thị 12 / 100 đề thi')

    // Find next page button
    const nextBtn = container.querySelector('button[aria-label="Trang sau"]') as HTMLButtonElement
    expect(nextBtn).toBeDefined()

    act(() => {
      nextBtn.click()
    })

    // Now on page 2 (13-24)
    expect(container.textContent).toContain('13–24 / 100')
  })

  it('handles KaTeX quick repair and batch repair in Audit Tab', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    // Switch to audit tab
    const auditTabBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Kiểm định chất lượng'),
    )
    act(() => {
      auditTabBtn?.click()
    })

    // Verify Batch Repair Button exists
    const batchRepairBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Sửa nhanh tất cả (20 đề)'),
    )
    expect(batchRepairBtn).toBeDefined()

    // Find first single quick repair button
    const singleRepairBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Sửa nhanh KaTeX'),
    )
    expect(singleRepairBtn).toBeDefined()
  })

  it('triggers quick repair with visual spinner and transitions to repaired state with toast', async () => {
    vi.useFakeTimers()
    try {
      act(() => {
        root.render(createElement(AsmoAdminStudio))
      })

      // Switch to audit tab
      const auditTabBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('Kiểm định chất lượng'),
      )
      act(() => {
        auditTabBtn?.click()
      })

      // Find first single quick repair button
      const singleRepairBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('Sửa nhanh KaTeX'),
      )
      expect(singleRepairBtn).toBeDefined()

      // Click repair
      act(() => {
        singleRepairBtn?.click()
      })

      // Should show loading spinner state
      expect(container.textContent).toContain('Đang chuẩn hóa...')

      // Advance timers by 400ms to complete repair
      act(() => {
        vi.advanceTimersByTime(400)
      })

      // Should now show repaired checkmark state
      expect(container.textContent).toContain('Đã chuẩn hóa')

      // Portal toast should be visible in document.body
      const toast = document.body.querySelector('[role="alert"]')
      expect(toast).toBeDefined()
      expect(toast?.textContent).toContain('Đã chuẩn hóa KaTeX và lời giải 3 bước thành công')
    } finally {
      vi.useRealTimers()
    }
  })

  it('triggers batch repair of 20 exams and updates health score and state', () => {
    vi.useFakeTimers()
    try {
      act(() => {
        root.render(createElement(AsmoAdminStudio))
      })

      // Switch to audit tab
      const auditTabBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('Kiểm định chất lượng'),
      )
      act(() => {
        auditTabBtn?.click()
      })

      const batchRepairBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
        btn.textContent?.includes('Sửa nhanh tất cả (20 đề)'),
      )
      expect(batchRepairBtn).toBeDefined()

      // Click batch repair
      act(() => {
        batchRepairBtn?.click()
      })

      // Fast forward 500ms
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Toast should announce batch repair success
      const toast = document.body.querySelector('[role="alert"]')
      expect(toast).toBeDefined()
      expect(toast?.textContent).toContain('Đã chuẩn hóa KaTeX và lời giải 3 bước thành công cho toàn bộ 20 đề thi!')
    } finally {
      vi.useRealTimers()
    }
  })

  it('opens AsmoExamAuditModal via createPortal and locks/restores document.body overflow', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    // Switch to audit tab
    const auditTabBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Kiểm định chất lượng'),
    )
    act(() => {
      auditTabBtn?.click()
    })

    // Click "Xem lỗi chi tiết"
    const viewAuditBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Xem lỗi chi tiết'),
    )
    expect(viewAuditBtn).toBeDefined()

    act(() => {
      viewAuditBtn?.click()
    })

    // Modal rendered via createPortal into document.body
    expect(document.body.textContent).toContain('Thẩm Định Đề Thi ASMO')
    expect(document.body.style.overflow).toBe('hidden')

    // Click "Đóng bảng thẩm định" button
    const closeAuditBtn = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Đóng bảng thẩm định'),
    )
    expect(closeAuditBtn).toBeDefined()

    act(() => {
      closeAuditBtn?.click()
    })

    expect(document.body.textContent).not.toContain('Thẩm Định Đề Thi ASMO')
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})
