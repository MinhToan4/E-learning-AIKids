// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  AsmoAdminStudio,
  validateCurriculumJson,
  generatePedagogicalTipsAndSolution,
} from './AsmoAdminStudio'

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

  function changeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
    const prototype =
      element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value')
    descriptor?.set?.call(element, value)
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
  }

  it('opens and edits a curriculum week, adding tags and saving with toast', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    // Switch to curriculum tab
    const curriculumTabBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Lộ trình học'),
    )
    act(() => {
      curriculumTabBtn?.click()
    })

    // Find and click "Sửa tuần học" on first card
    const editBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Sửa tuần học'),
    )
    expect(editBtn).toBeDefined()

    act(() => {
      editBtn?.click()
    })

    // Verify Modal rendered via Portal
    expect(document.body.textContent).toContain('Chỉnh Sửa Tuần Học')
    expect(document.body.style.overflow).toBe('hidden')

    // Find title input and change value
    const titleInput = document.body.querySelector(
      'input[placeholder*="Ví dụ: Đếm Khối"]',
    ) as HTMLInputElement
    expect(titleInput).toBeDefined()

    act(() => {
      changeValue(titleInput, 'Chuyên Đề Olympic Nâng Cao Đặc Biệt')
    })

    // Add a new competency chip
    const tagInput = document.body.querySelector(
      'input[placeholder="Thêm năng lực..."]',
    ) as HTMLInputElement
    expect(tagInput).toBeDefined()

    act(() => {
      changeValue(tagInput, 'Tư duy phản biện ASMO')
    })

    const addTagBtn = Array.from(document.body.querySelectorAll('button')).find(
      (btn) => btn.textContent === '+ Thêm',
    )
    act(() => {
      addTagBtn?.click()
    })

    expect(document.body.textContent).toContain('Tư duy phản biện ASMO')

    // Click "Lưu tuần học" button
    const saveBtn = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Lưu tuần học'),
    )
    expect(saveBtn).toBeDefined()

    act(() => {
      saveBtn?.click()
    })

    // Check modal closed and card updated
    expect(document.body.textContent).not.toContain('Chỉnh Sửa Tuần Học')
    expect(container.textContent).toContain('Chuyên Đề Olympic Nâng Cao Đặc Biệt')
    expect(container.textContent).toContain('Tư duy phản biện ASMO')

    // Check toast notification
    const toast = document.body.querySelector('[role="alert"]')
    expect(toast).toBeDefined()
    expect(toast?.textContent).toContain('Đã lưu thay đổi')
  })

  it('adds a new curriculum week and deletes an existing week', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    // Switch to curriculum tab
    const curriculumTabBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Lộ trình học'),
    )
    act(() => {
      curriculumTabBtn?.click()
    })

    // Click "+ Thêm tuần mới"
    const addWeekBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('+ Thêm tuần mới'),
    )
    expect(addWeekBtn).toBeDefined()

    act(() => {
      addWeekBtn?.click()
    })

    expect(document.body.textContent).toContain('Thêm Tuần Học Mới')

    // Enter title
    const titleInput = document.body.querySelector(
      'input[placeholder*="Ví dụ: Đếm Khối"]',
    ) as HTMLInputElement
    act(() => {
      changeValue(titleInput, 'Tuần Học Thử Nghiệm Mới 99')
    })

    // Submit new week
    const createBtn = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Tạo tuần học'),
    )
    act(() => {
      createBtn?.click()
    })

    expect(container.textContent).toContain('Tuần Học Thử Nghiệm Mới 99')

    // Find and click "Xóa tuần" on the card
    const deleteButtons = Array.from(container.querySelectorAll('button')).filter((btn) =>
      btn.textContent?.includes('Xóa tuần'),
    )
    expect(deleteButtons.length).toBeGreaterThan(0)

    act(() => {
      deleteButtons[0]?.click()
    })

    const toast = document.body.querySelector('[role="alert"]')
    expect(toast).toBeDefined()
    expect(toast?.textContent).toContain('Đã xóa tuần')
  })

  it('generates pedagogical tips and solutions for single week and batch curriculum', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    // Switch to curriculum tab
    const curriculumTabBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Lộ trình học'),
    )
    act(() => {
      curriculumTabBtn?.click()
    })

    // Click "🪄 Sinh Tips & Lời giải" on first card
    const genBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Sinh Tips & Lời giải'),
    )
    expect(genBtn).toBeDefined()

    act(() => {
      genBtn?.click()
    })

    // Verify preview modal
    expect(document.body.textContent).toContain(
      'Xem Trước & Tinh Chỉnh Bí Kíp Sư Phạm (Smart Generator)',
    )
    expect(document.body.textContent).toContain('KaTeX Live Preview')
    expect(document.body.textContent).toContain('Mèo Mee')

    // Click "Áp dụng vào tuần học"
    const applyBtn = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Áp dụng vào tuần học'),
    )
    expect(applyBtn).toBeDefined()

    act(() => {
      applyBtn?.click()
    })

    // Card should now display the Mee Tip or 3-step solution badge
    expect(container.textContent).toMatch(/Mèo Mee|Khung giải 3 bước ASMO/)
    const toast = document.body.querySelector('[role="alert"]')
    expect(toast).toBeDefined()
    expect(toast?.textContent).toContain('Đã áp dụng Bí kíp & Lời giải')

    // Test Batch Tip Generation
    const genAllBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('⚡ Sinh Tips toàn bộ lộ trình'),
    )
    expect(genAllBtn).toBeDefined()

    act(() => {
      genAllBtn?.click()
    })

    expect(document.body.textContent).toContain('Đã tự động sinh Bí kíp Mèo Mee')
  })

  it('imports and exports curriculum JSON correctly with schema validation', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    // Switch to curriculum tab
    const curriculumTabBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Lộ trình học'),
    )
    act(() => {
      curriculumTabBtn?.click()
    })

    // 1. Test Export JSON
    const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url')
    const revokeObjectURLMock = vi.fn()
    window.URL.createObjectURL = createObjectURLMock
    window.URL.revokeObjectURL = revokeObjectURLMock
    const aClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    const exportBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Xuất Lộ trình (Export JSON)'),
    )
    expect(exportBtn).toBeDefined()

    act(() => {
      exportBtn?.click()
    })

    expect(createObjectURLMock).toHaveBeenCalled()
    expect(document.body.textContent).toContain('Đã xuất')
    aClickSpy.mockRestore()

    // 2. Test Import JSON Modal
    const importBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Nhập Lộ trình (Import JSON)'),
    )
    expect(importBtn).toBeDefined()

    act(() => {
      importBtn?.click()
    })

    expect(document.body.textContent).toContain('Nhập Lộ Trình Học ASMO')

    const textarea = document.body.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea).toBeDefined()

    // Test invalid schema (syntax error)
    act(() => {
      changeValue(textarea, '{ not a valid json')
    })

    expect(document.body.textContent).toContain('Lỗi cú pháp JSON')

    // Test valid schema
    const validPayload = JSON.stringify([
      {
        week: 77,
        subject: 'math',
        grade: 2,
        title: 'Tuần Nhập Khẩu Mới Toanh 77',
        summary: 'Tóm tắt bài học nhập khẩu mới',
        keyCompetencies: ['Quy luật toán học'],
      },
    ])

    act(() => {
      changeValue(textarea, validPayload)
    })

    expect(document.body.textContent).toContain('Dữ liệu hợp lệ!')

    // Confirm import
    const confirmBtn = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Xác nhận Nhập Lộ Trình'),
    )
    expect(confirmBtn).toBeDefined()

    act(() => {
      confirmBtn?.click()
    })

    expect(container.textContent).toContain('Tuần Nhập Khẩu Mới Toanh 77')
  })

  it('resets curriculum back to default weeks', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    // Switch to curriculum tab
    const curriculumTabBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Lộ trình học'),
    )
    act(() => {
      curriculumTabBtn?.click()
    })

    const resetBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Khôi phục mặc định'),
    )
    expect(resetBtn).toBeDefined()

    act(() => {
      resetBtn?.click()
    })

    expect(document.body.textContent).toContain('Đã khôi phục lộ trình học về mặc định!')
  })

  it('removes competency tags and updates 3D lab template in Edit Week modal', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    // Switch to curriculum tab
    const curriculumTabBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Lộ trình học'),
    )
    act(() => {
      curriculumTabBtn?.click()
    })

    // Click "Sửa tuần học"
    const editBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Sửa tuần học'),
    )
    act(() => {
      editBtn?.click()
    })

    expect(document.body.textContent).toContain('Chỉnh Sửa Tuần Học')

    // Find a tag remove button (×)
    const removeButtons = Array.from(document.body.querySelectorAll('button')).filter(
      (btn) => btn.textContent === '×',
    )
    expect(removeButtons.length).toBeGreaterThan(0)
    const initialRemoveBtnCount = removeButtons.length

    act(() => {
      removeButtons[0]?.click()
    })

    const afterRemoveButtons = Array.from(document.body.querySelectorAll('button')).filter(
      (btn) => btn.textContent === '×',
    )
    expect(afterRemoveButtons.length).toBe(initialRemoveBtnCount - 1)

    // Select 3D visual template dropdown
    const selectElements = Array.from(document.body.querySelectorAll('select'))
    const templateSelect = selectElements.find((sel) =>
      Array.from(sel.options).some((opt) => opt.value === '3D_CUBE_CLUSTER'),
    )
    expect(templateSelect).toBeDefined()

    act(() => {
      if (templateSelect) {
        templateSelect.value = 'MATH_ARITHMETIC_TREE'
        templateSelect.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })

    // Save
    const saveBtn = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Lưu tuần học'),
    )
    act(() => {
      saveBtn?.click()
    })

    expect(document.body.textContent).not.toContain('Chỉnh Sửa Tuần Học')
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('handles JSON import in append mode and template download button', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    // Switch to curriculum tab
    const curriculumTabBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Lộ trình học'),
    )
    act(() => {
      curriculumTabBtn?.click()
    })

    // Mock createObjectURL & revokeObjectURL
    const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-template-url')
    const revokeObjectURLMock = vi.fn()
    window.URL.createObjectURL = createObjectURLMock
    window.URL.revokeObjectURL = revokeObjectURLMock
    const aClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    // Open import modal
    const importBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Nhập Lộ trình (Import JSON)'),
    )
    act(() => {
      importBtn?.click()
    })

    expect(document.body.textContent).toContain('Nhập Lộ Trình Học ASMO')
    expect(document.body.style.overflow).toBe('hidden')

    // Click "Tải mẫu JSON chuẩn"
    const downloadTemplateBtn = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Tải mẫu JSON chuẩn'),
    )
    expect(downloadTemplateBtn).toBeDefined()

    act(() => {
      downloadTemplateBtn?.click()
    })

    expect(createObjectURLMock).toHaveBeenCalled()
    expect(document.body.textContent).toContain('Đã tải xuống file JSON mẫu chuẩn hóa!')

    // Select append mode (radio button)
    const appendRadio = Array.from(document.body.querySelectorAll('input[type="radio"]')).find(
      (input) => (input as HTMLInputElement).value === 'append',
    ) as HTMLInputElement
    expect(appendRadio).toBeDefined()

    act(() => {
      appendRadio.click()
    })

    expect(appendRadio.checked).toBe(true)

    // Fill valid JSON
    const textarea = document.body.querySelector('textarea') as HTMLTextAreaElement
    const appendPayload = JSON.stringify([
      {
        week: 88,
        subject: 'science',
        grade: 4,
        title: 'Thực Nghiệm Quang Hợp Sinh Học 88',
        summary: 'Quan sát tế bào diệp lục',
        keyCompetencies: ['Thực nghiệm', 'Quan sát'],
      },
    ])

    act(() => {
      changeValue(textarea, appendPayload)
    })

    expect(document.body.textContent).toContain('Dữ liệu hợp lệ! Đã phát hiện 1 tuần học sẵn sàng nạp.')

    // Submit import
    const confirmBtn = Array.from(document.body.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Xác nhận Nhập Lộ Trình'),
    )
    act(() => {
      confirmBtn?.click()
    })

    expect(container.textContent).toContain('Thực Nghiệm Quang Hợp Sinh Học 88')
    expect(document.body.textContent).toContain('Đã gộp thêm 1 tuần học vào lộ trình!')
    expect(document.body.style.overflow).not.toBe('hidden')

    aClickSpy.mockRestore()
  })

  it('locks body scroll when preview generator modal is opened and unlocks on close', () => {
    act(() => {
      root.render(createElement(AsmoAdminStudio))
    })

    const curriculumTabBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Lộ trình học'),
    )
    act(() => {
      curriculumTabBtn?.click()
    })

    const genBtn = Array.from(container.querySelectorAll('button')).find((btn) =>
      btn.textContent?.includes('Sinh Tips & Lời giải'),
    )
    act(() => {
      genBtn?.click()
    })

    expect(document.body.textContent).toContain('Xem Trước & Tinh Chỉnh Bí Kíp Sư Phạm')
    expect(document.body.style.overflow).toBe('hidden')

    // Close using the close X button
    const closeBtn = document.body.querySelector('button[type="button"] .size-5')
    const closeBtnParent = closeBtn?.closest('button')
    expect(closeBtnParent).toBeDefined()

    act(() => {
      closeBtnParent?.click()
    })

    expect(document.body.textContent).not.toContain('Xem Trước & Tinh Chỉnh Bí Kíp Sư Phạm')
    expect(document.body.style.overflow).not.toBe('hidden')
  })
})

describe('validateCurriculumJson Schema Validator', () => {
  it('rejects invalid JSON syntax', () => {
    const res = validateCurriculumJson('{ invalid: json')
    expect(res.isValid).toBe(false)
    expect(res.error).toContain('Lỗi cú pháp JSON')
  })

  it('rejects non-array JSON root', () => {
    const res = validateCurriculumJson('{"week": 1, "title": "Test"}')
    expect(res.isValid).toBe(false)
    expect(res.error).toContain('phải là một mảng danh sách')
  })

  it('rejects empty array', () => {
    const res = validateCurriculumJson('[]')
    expect(res.isValid).toBe(false)
    expect(res.error).toContain('không được để trống')
  })

  it('rejects non-object elements in array', () => {
    const res = validateCurriculumJson('["string-item"]')
    expect(res.isValid).toBe(false)
    expect(res.error).toContain('Mục thứ #1 không phải là một đối tượng')
  })

  it('rejects missing or non-number week', () => {
    const res = validateCurriculumJson(
      JSON.stringify([
        {
          week: 'one',
          subject: 'math',
          grade: 1,
          title: 'Đếm hình',
        },
      ]),
    )
    expect(res.isValid).toBe(false)
    expect(res.error).toContain("thiếu hoặc sai kiểu trường 'week'")
  })

  it('rejects invalid subject not in [math, science, english]', () => {
    const res = validateCurriculumJson(
      JSON.stringify([
        {
          week: 1,
          subject: 'history',
          grade: 1,
          title: 'Lịch sử cổ đại',
        },
      ]),
    )
    expect(res.isValid).toBe(false)
    expect(res.error).toContain("trường 'subject' không hợp lệ")
  })

  it('rejects grade outside 1-12 range', () => {
    const res = validateCurriculumJson(
      JSON.stringify([
        {
          week: 1,
          subject: 'math',
          grade: 13,
          title: 'Toán cao cấp',
        },
      ]),
    )
    expect(res.isValid).toBe(false)
    expect(res.error).toContain("trường 'grade' không hợp lệ")
  })

  it('rejects missing or empty title', () => {
    const res = validateCurriculumJson(
      JSON.stringify([
        {
          week: 1,
          subject: 'math',
          grade: 2,
          title: '   ',
        },
      ]),
    )
    expect(res.isValid).toBe(false)
    expect(res.error).toContain("thiếu trường 'title'")
  })

  it('validates and normalizes complete curriculum items with defaults', () => {
    const payload = [
      {
        week: 5,
        subject: 'math',
        grade: 3,
        title: 'Toán Tư Duy Phân Số',
      },
    ]
    const res = validateCurriculumJson(JSON.stringify(payload))
    expect(res.isValid).toBe(true)
    expect(res.data).toBeDefined()
    expect(res.data?.length).toBe(1)
    expect(res.data?.[0].week).toBe(5)
    expect(res.data?.[0].topic).toBe('ASMO-MATH-G3-W5')
    expect(res.data?.[0].summary).toBe('Chuyên đề tuần 5: Toán Tư Duy Phân Số')
    expect(res.data?.[0].keyCompetencies).toEqual(['Tư duy logic'])
  })
})

describe('generatePedagogicalTipsAndSolution Smart Pedagogical Generator', () => {
  it('generates spatial cube tips and KaTeX formulas for 3D geometry topics', () => {
    const gen = generatePedagogicalTipsAndSolution({
      topic: 'ASMO-MATH-G1-W01',
      title: 'Đếm Khối Lập Phương 3D & Không Gian',
      keyCompetencies: ['Tư duy không gian', 'Đếm hình'],
      grade: 1,
      subject: 'math',
    })

    expect(gen.quote).toContain('Nhìn hình vẽ kỹ')
    expect(gen.storyAdvice).toContain('hình không gian')
    expect(gen.commonPitfall).toContain('bị che khuất')
    expect(gen.solutionSteps.length).toBe(3)
    expect(gen.solutionSteps[0]).toContain('Bước 1 (Phân tích giả thiết)')
    expect(gen.solutionSteps[1]).toContain('Bước 2 (Mô hình hóa & Công thức KaTeX)')
    expect(gen.solutionSteps[2]).toContain('Bước 3 (Tính toán chi tiết & Kết luận)')
  })

  it('generates clock angle tips and KaTeX formulas for clock topics', () => {
    const gen = generatePedagogicalTipsAndSolution({
      topic: 'ASMO-MATH-G2-W04',
      title: 'Đọc Mặt Đồng Hồ & Tính Góc Kim',
      keyCompetencies: ['Góc độ', 'Thời gian'],
      grade: 2,
      subject: 'math',
    })

    expect(gen.quote).toContain('Kim giờ kim phút')
    expect(gen.storyAdvice).toContain('360^\\circ')
    expect(gen.solutionSteps[1]).toContain('\\Delta \\theta')
    expect(gen.commonPitfall).toContain('kim giờ')
  })

  it('generates fraction tips and KaTeX formulas for fraction topics', () => {
    const gen = generatePedagogicalTipsAndSolution({
      topic: 'ASMO-MATH-G4-W08',
      title: 'Phân Số & Tỉ Số Chuyên Sâu',
      keyCompetencies: ['Phân số', 'Quy đồng'],
      grade: 4,
      subject: 'math',
    })

    expect(gen.quote).toContain('Quy đồng mẫu số')
    expect(gen.solutionSteps[1]).toContain('\\frac{a}{b}')
    expect(gen.commonPitfall).toContain('chưa quy đồng')
  })

  it('generates matchstick and sequence pattern tips for logic topics', () => {
    const gen = generatePedagogicalTipsAndSolution({
      topic: 'ASMO-MATH-G3-W06',
      title: 'Toán Que Diêm Tư Duy & Dãy Số Quy Luật',
      keyCompetencies: ['Dãy số', 'Logic'],
      grade: 3,
      subject: 'math',
    })

    expect(gen.quote).toContain('Đổi chỗ que diêm')
    expect(gen.solutionSteps[1]).toContain('u_n = u_1')
    expect(gen.commonPitfall).toContain('Vội vã kết luận')
  })

  it('generates science tips and KaTeX formulas for science topics', () => {
    const gen = generatePedagogicalTipsAndSolution({
      topic: 'ASMO-SCI-G3-W02',
      title: 'Lực Và Chuyển Động Tự Nhiên',
      keyCompetencies: ['Quan sát', 'Thí nghiệm'],
      grade: 3,
      subject: 'science',
    })

    expect(gen.quote).toContain('Quan sát thiên nhiên')
    expect(gen.solutionSteps[1]).toContain('F = m \\times a')
    expect(gen.commonPitfall).toContain('nguyên nhân và kết quả')
  })

  it('generates academic English tips for English topics', () => {
    const gen = generatePedagogicalTipsAndSolution({
      topic: 'ASMO-ENG-G4-W01',
      title: 'Academic Reading Comprehension',
      keyCompetencies: ['Keywords', 'Scanning'],
      grade: 4,
      subject: 'english',
    })

    expect(gen.quote).toContain('Bắt từ then chốt')
    expect(gen.storyAdvice).toContain('Scanning')
    expect(gen.solutionSteps[1]).toContain('\\text{Subject}')
    expect(gen.commonPitfall).toContain('word-by-word')
  })
})

