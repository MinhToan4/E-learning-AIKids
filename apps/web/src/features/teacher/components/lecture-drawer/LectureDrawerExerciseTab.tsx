import React from 'react'
import { PRACTICE_OPTIONS, type LectureDraft } from '../../lib/authoring'
import { CheckQuestionBuilder } from '../CheckQuestionBuilder'

export interface LectureDrawerExerciseTabProps {
  readOnly?: boolean
  draft: LectureDraft
  activeSubSection: 'practice' | 'check'
  onChangeDraft: <K extends keyof LectureDraft>(key: K, value: LectureDraft[K]) => void
  practicePreview?: React.ReactNode
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1.5px solid #e2e8f0',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  color: '#0f172a',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  lineHeight: 1.5,
  fontFamily: 'inherit',
}

function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.375rem' }}>
        {label}
        {hint && <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8', marginLeft: '0.5rem' }}>{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export function LectureDrawerExerciseTab({
  readOnly = false,
  draft,
  activeSubSection,
  onChangeDraft,
  practicePreview,
}: LectureDrawerExerciseTabProps) {
  if (activeSubSection === 'practice') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '0.625rem', fontSize: '0.8125rem', color: '#065f46' }}>
          <strong>Tự tay làm phải dùng kiến thức vừa học.</strong> Học sinh cần biết làm gì, tạo ra sản phẩm nào, tự kiểm tra theo tiêu chí nào và lưu sản phẩm riêng tư.
        </div>
        <FormRow label="Kiểu thực hành *">
          {!PRACTICE_OPTIONS.some((option) => option.id === draft.practiceKind) && (
            <div className="mb-3 rounded-xl border border-sun-200 bg-sun-50 px-4 py-3 text-sm font-semibold text-sun-900" role="alert">
              Kiểu cũ <strong>{draft.practiceKind}</strong> chưa có trình biên soạn dữ liệu an toàn. Hãy chọn một kiểu được hỗ trợ bên dưới trước khi lưu lại trạm.
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' }}>
            {PRACTICE_OPTIONS.map((opt) => {
              const active = draft.practiceKind === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={readOnly}
                  onClick={() => onChangeDraft('practiceKind', opt.id)}
                  style={{
                    padding: '0.625rem 0.75rem',
                    borderRadius: '0.625rem',
                    cursor: readOnly ? 'default' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    background: active ? '#ede9fe' : '#fff',
                    border: active ? '1.5px solid #8b5cf6' : '1.5px solid #e2e8f0',
                    color: active ? '#6d28d9' : '#475569',
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{opt.label}</div>
                  <div style={{ fontSize: '0.6875rem', opacity: 0.7, marginTop: '0.125rem' }}>{opt.description}</div>
                </button>
              )
            })}
          </div>
        </FormRow>

        {practicePreview}

        <FormRow label="Hướng dẫn thực hành *">
          <textarea
            readOnly={readOnly}
            value={draft.practiceInstruction}
            onChange={(e) => onChangeDraft('practiceInstruction', e.target.value)}
            placeholder="Mô tả nhiệm vụ học sinh cần làm..."
            rows={4}
            style={textareaStyle}
          />
        </FormRow>

        <FormRow label="Sản phẩm học sinh tạo ra *">
          <input
            type="text"
            readOnly={readOnly}
            value={draft.product}
            onChange={(e) => onChangeDraft('product', e.target.value)}
            placeholder="VD: Bức tranh về AI trong tương lai"
            style={inputStyle}
          />
        </FormRow>

        {draft.practiceKind === 'ordering' && (
          <FormRow label="Các thẻ cần sắp xếp *">
            <textarea
              readOnly={readOnly}
              value={draft.practiceConfigText}
              onChange={(e) => onChangeDraft('practiceConfigText', e.target.value)}
              placeholder={'Mỗi dòng theo mẫu: Tiêu đề | Mô tả\nNhận nhiều ví dụ | AI xem dữ liệu đã chuẩn bị.\nTìm mẫu | AI tìm dấu hiệu thường lặp lại.\nCon người kiểm tra | Con người xem bằng chứng trước khi dùng.'}
              rows={7}
              style={textareaStyle}
            />
            <p className="mt-2 text-xs font-semibold text-muted">Thứ tự giáo viên nhập là đáp án đúng. Học sinh sẽ nhận danh sách đã đảo và kéo thả để sắp xếp.</p>
          </FormRow>
        )}

        <FormRow label="Các bước học sinh thực hiện *">
          <textarea
            readOnly={readOnly}
            value={draft.practiceStepsText}
            onChange={(e) => onChangeDraft('practiceStepsText', e.target.value)}
            placeholder={'Mỗi dòng là một bước ngắn, ví dụ:\nNhắc lại dấu hiệu vừa học\nTạo bản đầu tiên\nĐối chiếu và sửa sản phẩm\nKiểm tra riêng tư trước khi lưu'}
            rows={6}
            style={textareaStyle}
          />
        </FormRow>

        <FormRow label="Tiêu chí sản phẩm đạt chuẩn *">
          <textarea
            readOnly={readOnly}
            value={draft.successCriteriaText}
            onChange={(e) => onChangeDraft('successCriteriaText', e.target.value)}
            placeholder={'Mỗi dòng là một tiêu chí học sinh tự kiểm tra\nSản phẩm thể hiện đúng kiến thức của trạm\nCó bằng chứng hoặc lý do lựa chọn\nKhông chứa thông tin riêng tư'}
            rows={5}
            style={textareaStyle}
          />
        </FormRow>

        <FormRow label="Câu hỏi nhìn lại *">
          <input
            type="text"
            readOnly={readOnly}
            value={draft.reflectionPrompt}
            onChange={(e) => onChangeDraft('reflectionPrompt', e.target.value)}
            placeholder="Con đã sửa điểm nào sau khi tự kiểm tra? Vì sao?"
            style={inputStyle}
          />
        </FormRow>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{
        padding: '0.75rem 1rem',
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '0.625rem',
        fontSize: '0.8125rem',
        color: '#0369a1',
      }}>
        <strong>Thử thách cuối trạm</strong> kiểm tra học sinh đã đạt đúng các mục tiêu phía trên.
        Mỗi câu hỏi có thể có từ <strong>2–6 đáp án</strong>. Câu hỏi trong game được cấu hình ở phần <strong>Thử cùng Mee</strong>.
      </div>

      <CheckQuestionBuilder
        readOnly={readOnly}
        questions={draft.checkQuestions}
        onChange={(qs) => onChangeDraft('checkQuestions', qs)}
      />
    </div>
  )
}
