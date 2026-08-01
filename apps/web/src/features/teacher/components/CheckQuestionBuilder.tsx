/**
 * CheckQuestionBuilder — Builder cho phần "Thử tài" cuối bài học.
 *
 * WHY: Thay thế form 1 câu/3 đáp án cố định.
 * Giáo viên có thể thêm nhiều câu hỏi, mỗi câu có 2–6 đáp án tùy chọn.
 * Light theme, đồng bộ với hệ thống UI.
 */
import { useCallback, useId } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import type { CheckQuestion } from '../lib/authoring'

type Props = {
  questions: CheckQuestion[]
  onChange: (questions: CheckQuestion[]) => void
  maxQuestions?: number
  readOnly?: boolean
}

function newQuestion(index: number): CheckQuestion {
  return {
    id: `cq-${Date.now()}-${index}`,
    prompt: '',
    options: ['', '', ''],
    answer: 0,
    explain: '',
  }
}

export function CheckQuestionBuilder({ questions, onChange, maxQuestions = 10, readOnly = false }: Props) {
  const uid = useId()

  const addQuestion = useCallback(() => {
    onChange([...questions, newQuestion(questions.length)])
  }, [questions, onChange])

  const removeQuestion = useCallback((id: string) => {
    onChange(questions.filter((q) => q.id !== id))
  }, [questions, onChange])

  const updateQuestion = useCallback((id: string, patch: Partial<CheckQuestion>) => {
    onChange(questions.map((q) => q.id === id ? { ...q, ...patch } : q))
  }, [questions, onChange])

  const updateOption = useCallback((qId: string, i: number, value: string) => {
    const q = questions.find((q) => q.id === qId)
    if (!q) return
    const options = [...q.options]
    options[i] = value
    updateQuestion(qId, { options })
  }, [questions, updateQuestion])

  const addOption = useCallback((qId: string) => {
    const q = questions.find((q) => q.id === qId)
    if (!q || q.options.length >= 6) return
    updateQuestion(qId, { options: [...q.options, ''] })
  }, [questions, updateQuestion])

  const removeOption = useCallback((qId: string, i: number) => {
    const q = questions.find((q) => q.id === qId)
    if (!q || q.options.length <= 2) return
    const options = q.options.filter((_, idx) => idx !== i)
    const answer = q.answer >= options.length ? options.length - 1 : q.answer
    updateQuestion(qId, { options, answer })
  }, [questions, updateQuestion])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Đếm câu hỏi */}
      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
        {questions.length}/{maxQuestions} câu hỏi kiểm tra
      </div>

      {/* Empty state */}
      {questions.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '2rem', borderRadius: '0.875rem',
          border: '2px dashed #e2e8f0', color: '#94a3b8',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✋</div>
          <div style={{ fontSize: '0.875rem' }}>
            Chưa có câu hỏi nào. Nhấn <strong>+ Thêm câu hỏi</strong> để bắt đầu.
          </div>
        </div>
      )}

      {/* Danh sách câu hỏi */}
      {questions.map((q, qi) => {
        const isValid = q.prompt.trim().length > 0
          && q.options.length >= 2
          && q.options.every((o) => o.trim().length > 0)
          && q.answer >= 0 && q.answer < q.options.length

        return (
          <div
            key={q.id}
            style={{
              borderRadius: '0.875rem',
              border: isValid ? '1.5px solid #e2e8f0' : '1.5px solid #fed7aa',
              background: '#fff',
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
            }}
          >
            {/* Header của câu hỏi */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: '#fafafa',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#6366f1' }}>
                  #{qi + 1}
                </span>
                {!isValid && (
                  <span style={{ fontSize: '0.75rem', color: '#f97316', fontWeight: 600 }}>
                    ⚠️ Chưa đầy đủ
                  </span>
                )}
                {isValid && (
                  <Check size={14} color="#10b981" />
                )}
              </div>
              <button
                type="button"
                id={`${uid}-remove-${qi}`}
                onClick={() => removeQuestion(q.id)}
                style={{
                  padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: 'none',
                  background: '#fff0f0', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem',
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                }}
              >
                <Trash2 size={12} /> Xóa
              </button>
            </div>

            {/* Nội dung câu hỏi */}
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Câu hỏi */}
              <label style={labelStyle}>
                <span style={labelTextStyle}>Câu hỏi *</span>
                <textarea
                  id={`${uid}-prompt-${qi}`}
                  value={q.prompt}
                  onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
                  placeholder="Nhập câu hỏi kiểm tra học sinh..."
                  rows={2}
                  style={textareaStyle}
                />
              </label>

              {/* Đáp án */}
              <div>
                <div style={{ ...labelTextStyle, marginBottom: '0.5rem' }}>
                  Đáp án *{' '}
                  <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.75rem' }}>
                    (click nút tròn để chọn đáp án đúng)
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {q.options.map((opt, i) => {
                    const isCorrect = q.answer === i
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => updateQuestion(q.id, { answer: i })}
                          style={{
                            width: '1.5rem', height: '1.5rem', borderRadius: '50%', flexShrink: 0,
                            border: isCorrect ? '2px solid #10b981' : '2px solid #cbd5e1',
                            background: isCorrect ? '#10b981' : '#fff',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                          title={`Chọn đáp án ${String.fromCharCode(65 + i)} là đúng`}
                        />
                        <span style={{
                          width: '1.25rem', fontSize: '0.875rem', fontWeight: 700, flexShrink: 0,
                          color: isCorrect ? '#10b981' : '#94a3b8',
                        }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <input
                          type="text"
                          id={`${uid}-opt-${qi}-${i}`}
                          value={opt}
                          onChange={(e) => updateOption(q.id, i, e.target.value)}
                          placeholder={`Đáp án ${String.fromCharCode(65 + i)}...`}
                          style={{
                            flex: 1, padding: '0.4rem 0.625rem', borderRadius: '0.5rem',
                            border: isCorrect ? '1.5px solid #a7f3d0' : '1.5px solid #e2e8f0',
                            background: isCorrect ? '#f0fdf4' : '#fff',
                            color: '#0f172a', fontSize: '0.875rem', outline: 'none',
                          }}
                        />
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(q.id, i)}
                            style={{
                              padding: '0.3rem', borderRadius: '0.375rem', border: 'none',
                              background: '#fff0f0', color: '#ef4444', cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                  {q.options.length < 6 && (
                    <button
                      type="button"
                      onClick={() => addOption(q.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.3rem 0.75rem', borderRadius: '0.5rem',
                        border: '1.5px dashed rgba(99,102,241,0.3)',
                        background: 'transparent', color: '#6366f1',
                        fontSize: '0.8125rem', cursor: 'pointer', alignSelf: 'flex-start',
                        marginTop: '0.125rem',
                      }}
                    >
                      <Plus size={12} /> Thêm đáp án
                    </button>
                  )}
                </div>
              </div>

              {/* Giải thích */}
              <label style={labelStyle}>
                <span style={labelTextStyle}>Giải thích đáp án đúng *</span>
                <textarea
                  id={`${uid}-explain-${qi}`}
                  value={q.explain}
                  onChange={(e) => updateQuestion(q.id, { explain: e.target.value })}
                  placeholder="Giải thích tại sao đây là đáp án đúng (thân thiện với học sinh)..."
                  rows={2}
                  style={textareaStyle}
                />
              </label>
            </div>
          </div>
        )
      })}

      {/* Nút thêm câu hỏi mới */}
      {questions.length < maxQuestions && (
        <button
          type="button"
          id={`${uid}-add-check`}
          onClick={addQuestion}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            padding: '0.75rem', borderRadius: '0.75rem',
            border: '2px dashed rgba(99,102,241,0.35)',
            background: 'transparent', color: '#6366f1',
            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f5f3ff'
            e.currentTarget.style.borderColor = '#6366f1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'
          }}
        >
          <Plus size={16} /> Thêm câu hỏi
        </button>
      )}
    </div>
  )
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '0.25rem',
}
const labelTextStyle: React.CSSProperties = {
  fontSize: '0.8125rem', fontWeight: 600, color: '#475569',
}
const textareaStyle: React.CSSProperties = {
  width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
  border: '1.5px solid #e2e8f0', background: '#fff',
  color: '#0f172a', fontSize: '0.875rem', outline: 'none', resize: 'vertical',
  fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box',
}
