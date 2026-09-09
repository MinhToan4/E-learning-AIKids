import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ScriptCourseGeneratorModal } from './ScriptCourseGeneratorModal'

describe('ScriptCourseGeneratorModal Component', () => {
  it('returns null when isOpen is false', () => {
    const html = renderToStaticMarkup(
      <ScriptCourseGeneratorModal
        isOpen={false}
        onClose={() => {}}
        onApplyGeneratedCourse={() => {}}
      />
    )

    expect(html).toBe('')
  })

  it('renders wizard modal with title and 3-step navigation when isOpen is true', () => {
    const html = renderToStaticMarkup(
      <ScriptCourseGeneratorModal
        isOpen={true}
        onClose={() => {}}
        onApplyGeneratedCourse={() => {}}
      />
    )

    expect(html).toContain('AI Script-to-Course Studio')
    expect(html).toContain('Nhập kịch bản')
    expect(html).toContain('Review Thực thể')
    expect(html).toContain('Xem trước Lộ trình')
    expect(html).toContain('Dán kịch bản bài học')
    expect(html).toContain('Dùng kịch bản mẫu AIKids')
    expect(html).toContain('Chọn tệp tin')
    expect(html).toContain('Phân tích kịch bản bằng AI')
  })
})
