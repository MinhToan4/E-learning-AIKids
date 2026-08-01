/**
 * QuizQuestionBuilder — Editor câu hỏi trắc nghiệm cho math-kids game.
 *
 * Dual mode:
 *   - UI mode: Giao diện trực quan cho người không am hiểu công nghệ
 *   - JSON mode: Textarea JSON cho người nâng cao, có validation + highlight lỗi
 *
 * WHY dual mode: Giáo viên ít kinh nghiệm cần UI thân thiện, giáo viên kỹ thuật
 * thích bulk-edit bằng JSON. Cả hai mode luôn đồng bộ state với nhau.
 */
import { useState, useCallback, useId } from 'react'
import { Plus, Trash2, GripVertical, AlertTriangle, CheckCircle2, Code2, LayoutList } from 'lucide-react'
import type { QuestionBankItem } from '../lib/authoring'
import { QUESTION_BANK_TAGS } from '../lib/authoring'
import { ImageAssetPicker } from './ImageAssetPicker'
import { cn } from '@/shared/lib/cn'

type EditableQuestion = Omit<QuestionBankItem, 'id' | 'sortOrder'> & { id: string; sortOrder?: number }

type Props = {
  questions: EditableQuestion[]
  onChange: (questions: EditableQuestion[]) => void
  maxQuestions?: number
  readOnly?: boolean
}

const DIFFICULTY_LABELS = {
  gentle: { label: 'Nhẹ nhàng', emoji: '🌱', color: '#34d399' },
  steady: { label: 'Vừa sức', emoji: '⚡', color: '#60a5fa' },
  challenge: { label: 'Nâng cao', emoji: '🔥', color: '#f97316' },
} as const

function newQuestion(index: number): EditableQuestion {
  return {
    id: `q-${Date.now()}-${index}`,
    prompt: '',
    options: ['', '', '', ''],
    answer: 0,
    explanation: '',
    imageUrl: null,
    tags: [],
    ageMin: 6,
    ageMax: 11,
    difficulty: 'steady',
  }
}

/** Parse JSON string to questions array, return null if invalid */
function parseQuestionsJson(raw: string): EditableQuestion[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    const questions = parsed.map((item: unknown, i): EditableQuestion | null => {
      if (!item || typeof item !== 'object') return null
      const r = item as Record<string, unknown>
      const options = Array.isArray(r.options) && r.options.every((o: unknown) => typeof o === 'string')
        ? r.options as string[]
        : null
      if (!options || options.length < 2) return null
      return {
        id: typeof r.id === 'string' ? r.id : `q-${Date.now()}-${i}`,
        prompt: typeof r.prompt === 'string' ? r.prompt : '',
        options,
        answer: typeof r.answer === 'number' ? r.answer : 0,
        explanation: typeof r.explanation === 'string' ? r.explanation : '',
        imageUrl: typeof r.imageUrl === 'string' ? r.imageUrl : null,
        tags: Array.isArray(r.tags) ? r.tags.filter((t): t is string => typeof t === 'string') : [],
        ageMin: typeof r.ageMin === 'number' ? r.ageMin : 6,
        ageMax: typeof r.ageMax === 'number' ? r.ageMax : 11,
        difficulty: r.difficulty === 'gentle' ? 'gentle' : r.difficulty === 'challenge' ? 'challenge' : 'steady',
      }
    })
    const valid = questions.filter((q): q is EditableQuestion => q !== null)
    return valid.length > 0 ? valid : null
  } catch {
    return null
  }
}

export function QuizQuestionBuilder({ questions, onChange, maxQuestions = 20, readOnly = false }: Props) {
  const [mode, setMode] = useState<'ui' | 'json'>('ui')
  const [jsonText, setJsonText] = useState(() => JSON.stringify(questions, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(questions[0]?.id ?? null)
  const uid = useId()

  // Sync questions → jsonText khi mode là json
  const switchToJson = useCallback(() => {
    setJsonText(JSON.stringify(questions, null, 2))
    setJsonError(null)
    setMode('json')
  }, [questions])

  // Parse jsonText → questions và switch về ui
  const switchToUi = useCallback(() => {
    const parsed = parseQuestionsJson(jsonText)
    if (!parsed) {
      setJsonError('JSON không hợp lệ hoặc thiếu trường bắt buộc (prompt, options, answer).')
      return
    }
    onChange(parsed)
    setJsonError(null)
    setMode('ui')
  }, [jsonText, onChange])

  const handleJsonChange = useCallback((raw: string) => {
    setJsonText(raw)
    const parsed = parseQuestionsJson(raw)
    if (parsed) {
      setJsonError(null)
    } else if (raw.trim()) {
      try {
        JSON.parse(raw)
        setJsonError('Thiếu trường bắt buộc: prompt, options (>= 2), answer')
      } catch (e) {
        setJsonError(`JSON lỗi cú pháp: ${(e as Error).message}`)
      }
    } else {
      setJsonError(null)
    }
  }, [])

  const addQuestion = useCallback(() => {
    const q = newQuestion(questions.length)
    onChange([...questions, q])
    setExpandedId(q.id)
  }, [questions, onChange])

  const removeQuestion = useCallback((id: string) => {
    const next = questions.filter((q) => q.id !== id)
    onChange(next)
    if (expandedId === id) setExpandedId(next[0]?.id ?? null)
  }, [questions, onChange, expandedId])

  const updateQuestion = useCallback((id: string, patch: Partial<EditableQuestion>) => {
    onChange(questions.map((q) => q.id === id ? { ...q, ...patch } : q))
  }, [questions, onChange])

  const updateOption = useCallback((qId: string, optIndex: number, value: string) => {
    const q = questions.find((q) => q.id === qId)
    if (!q) return
    const options = [...q.options]
    options[optIndex] = value
    updateQuestion(qId, { options })
  }, [questions, updateQuestion])

  const addOption = useCallback((qId: string) => {
    const q = questions.find((q) => q.id === qId)
    if (!q || q.options.length >= 6) return
    updateQuestion(qId, { options: [...q.options, ''] })
  }, [questions, updateQuestion])

  const removeOption = useCallback((qId: string, optIndex: number) => {
    const q = questions.find((q) => q.id === qId)
    if (!q || q.options.length <= 2) return
    const options = q.options.filter((_, i) => i !== optIndex)
    const answer = q.answer >= options.length ? options.length - 1 : q.answer
    updateQuestion(qId, { options, answer })
  }, [questions, updateQuestion])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Mode toggle header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>
            {questions.length}/{maxQuestions} câu hỏi
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            id={`${uid}-ui-mode`}
            onClick={() => mode === 'json' ? switchToUi() : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: 'none',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
              background: mode === 'ui' ? '#6366f1' : '#f1f5f9',
              color: mode === 'ui' ? '#fff' : '#64748b',
              transition: 'all 0.2s',
            }}
          >
            <LayoutList size={14} /> UI
          </button>
          <button
            type="button"
            id={`${uid}-json-mode`}
            onClick={() => mode === 'ui' ? switchToJson() : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: 'none',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
              background: mode === 'json' ? '#6366f1' : '#f1f5f9',
              color: mode === 'json' ? '#fff' : '#64748b',
              transition: 'all 0.2s',
            }}
          >
            <Code2 size={14} /> JSON
          </button>
        </div>
      </div>

      {/* ── UI MODE ── */}
      {mode === 'ui' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {questions.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '2rem', borderRadius: '1rem',
              border: '2px dashed rgba(99,102,241,0.3)', color: '#6366f1',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
              <div style={{ fontSize: '0.875rem' }}>Chưa có câu hỏi nào. Nhấn <strong>+ Thêm câu hỏi</strong> để bắt đầu.</div>
            </div>
          )}
          {questions.map((q, qi) => (
            <QuestionCard
              key={q.id}
              q={q}
              index={qi}
              expanded={expandedId === q.id}
              onToggle={() => setExpandedId(expandedId === q.id ? null : q.id)}
              onUpdate={(patch) => updateQuestion(q.id, patch)}
              onRemove={() => removeQuestion(q.id)}
              onUpdateOption={(i, v) => updateOption(q.id, i, v)}
              onAddOption={() => addOption(q.id)}
              onRemoveOption={(i) => removeOption(q.id, i)}
            />
          ))}
          {questions.length < maxQuestions && (
            <button
              type="button"
              id={`${uid}-add-question`}
              onClick={addQuestion}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.75rem', borderRadius: '0.75rem', border: '2px dashed rgba(99,102,241,0.4)',
                background: 'transparent', color: '#6366f1', fontSize: '0.875rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.08)'
                e.currentTarget.style.borderColor = '#6366f1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'
              }}
            >
              <Plus size={16} /> Thêm câu hỏi
            </button>
          )}
        </div>
      )}

      {/* ── JSON MODE ── */}
      {mode === 'json' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '0.75rem',
            background: '#ede9fe', border: '1px solid #ddd6fe',
            fontSize: '0.8125rem', color: '#4f46e5', lineHeight: 1.6,
          }}>
            💡 <strong style={{ color: '#6366f1' }}>Chế độ JSON nâng cao</strong> — Mỗi câu hỏi cần có:{' '}
            <code style={{ color: '#0f172a', background: '#f1f5f9', padding: '0.1em 0.3em', borderRadius: '0.25em' }}>
              prompt, options (mảng ≥ 2 chuỗi), answer (số 0-based), explanation
            </code>.<br />
            Sau khi chỉnh xong, nhấn <strong style={{ color: '#6366f1' }}>UI</strong> để kiểm tra và lưu.
          </div>
          <div style={{ position: 'relative' }}>
            <textarea
              id={`${uid}-json-editor`}
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%', minHeight: '420px', fontFamily: 'monospace', fontSize: '0.8125rem',
                padding: '1rem', borderRadius: '0.75rem', resize: 'vertical',
                background: '#f8fafc', color: '#0f172a',
                border: jsonError ? '2px solid #f97316' : '2px solid #e2e8f0',
                outline: 'none', lineHeight: 1.7, boxSizing: 'border-box',
              }}
            />
            {jsonError && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.5rem',
                padding: '0.75rem', borderRadius: '0.5rem',
                background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
                color: '#f97316', fontSize: '0.8125rem',
              }}>
                <AlertTriangle size={14} style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                <span>{jsonError}</span>
              </div>
            )}
            {!jsonError && jsonText.trim() && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem',
                color: '#16a34a', fontSize: '0.8125rem',
              }}>
                <CheckCircle2 size={14} />
                <span>JSON hợp lệ</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={switchToUi}
            disabled={!!jsonError}
            style={{
              padding: '0.625rem 1.25rem', borderRadius: '0.625rem', border: 'none',
              background: jsonError ? '#e2e8f0' : '#6366f1',
              color: jsonError ? '#64748b' : '#fff',
              fontSize: '0.875rem', fontWeight: 600, cursor: jsonError ? 'not-allowed' : 'pointer',
            }}
          >
            ✅ Áp dụng JSON
          </button>
        </div>
      )}
    </div>
  )
}

// ─── QuestionCard component ────────────────────────────────────────────────────
type QuestionCardProps = {
  q: EditableQuestion
  index: number
  expanded: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<EditableQuestion>) => void
  onRemove: () => void
  onUpdateOption: (i: number, v: string) => void
  onAddOption: () => void
  onRemoveOption: (i: number) => void
}

function QuestionCard({
  q, index, expanded, onToggle, onUpdate, onRemove,
  onUpdateOption, onAddOption, onRemoveOption,
}: QuestionCardProps) {
  const [showImagePicker, setShowImagePicker] = useState(false)
  const isValid = q.prompt.trim().length > 0
    && q.options.length >= 2
    && q.options.every((o) => o.trim().length > 0)
    && q.answer >= 0 && q.answer < q.options.length

  return (
    <div style={{
      borderRadius: '0.875rem',
      border: isValid
        ? '1.5px solid #e2e8f0'
        : '1.5px solid #fed7aa',
      background: '#fff',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Card header — always visible */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.875rem 1rem', cursor: 'pointer',
          background: expanded ? '#f5f3ff' : 'transparent',
          transition: 'background 0.2s',
        }}
      >
        <GripVertical size={16} style={{ color: '#475569', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ color: '#6366f1' }}>#{index + 1}</span>{' '}
            {q.prompt.trim() || <span style={{ color: '#475569', fontStyle: 'italic' }}>Chưa có nội dung câu hỏi...</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '2rem',
              background: DIFFICULTY_LABELS[q.difficulty]?.color + '22',
              color: DIFFICULTY_LABELS[q.difficulty]?.color,
              border: `1px solid ${DIFFICULTY_LABELS[q.difficulty]?.color}44`,
              fontWeight: 600,
            }}>
              {DIFFICULTY_LABELS[q.difficulty]?.emoji} {DIFFICULTY_LABELS[q.difficulty]?.label}
            </span>
            {q.tags.slice(0, 2).map((tag) => {
              const tagDef = QUESTION_BANK_TAGS.find((t) => t.id === tag)
              return tagDef ? (
                <span key={tag} style={{
                  fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '2rem',
                  background: '#ede9fe', color: '#8b5cf6',
                  border: '1px solid #ddd6fe',
                }}>
                  {tagDef.emoji} {tagDef.label}
                </span>
              ) : null
            })}
            {!isValid && <span style={{ fontSize: '0.75rem', color: '#f97316', fontWeight: 600 }}>⚠️ Chưa đầy đủ</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          style={{
            padding: '0.375rem', borderRadius: '0.5rem', border: 'none',
            background: 'rgba(239,68,68,0.12)', color: '#f87171', cursor: 'pointer',
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '1rem 1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #e2e8f0' }}>
          {/* Câu hỏi */}
          <label style={labelStyle}>
            <span style={labelTextStyle}>Câu hỏi *</span>
            <textarea
              value={q.prompt}
              onChange={(e) => onUpdate({ prompt: e.target.value })}
              placeholder="Nhập câu hỏi cho học sinh..."
              rows={3}
              style={textareaStyle}
            />
          </label>

          {/* Các đáp án */}
          <div>
            <div style={{ ...labelTextStyle, marginBottom: '0.5rem' }}>
              Các đáp án * <span style={{ fontWeight: 400, color: '#64748b' }}>(click nút tròn để chọn đáp án đúng)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {q.options.map((opt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => onUpdate({ answer: i })}
                    style={{
                      width: '1.5rem', height: '1.5rem', borderRadius: '50%', flexShrink: 0,
                      border: q.answer === i ? '2px solid #16a34a' : '2px solid #cbd5e1',
                      background: q.answer === i ? '#16a34a' : '#fff',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    title={`Chọn đáp án ${String.fromCharCode(65 + i)} là đúng`}
                  />
                  <span style={{ width: '1.25rem', fontSize: '0.875rem', fontWeight: 700, color: q.answer === i ? '#16a34a' : '#64748b', flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => onUpdateOption(i, e.target.value)}
                    placeholder={`Đáp án ${String.fromCharCode(65 + i)}...`}
                    style={{
                      flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                      border: '1.5px solid #e2e8f0', background: '#fff',
                      color: '#0f172a', fontSize: '0.875rem', outline: 'none',
                      borderColor: q.answer === i ? '#bbf7d0' : undefined,
                    }}
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => onRemoveOption(i)}
                      style={{ padding: '0.375rem', borderRadius: '0.375rem', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < 6 && (
                <button
                  type="button"
                  onClick={onAddOption}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: '1.5px dashed rgba(99,102,241,0.3)',
                    background: 'transparent', color: '#6366f1', fontSize: '0.8125rem', cursor: 'pointer',
                    alignSelf: 'flex-start',
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
              value={q.explanation}
              onChange={(e) => onUpdate({ explanation: e.target.value })}
              placeholder="Giải thích tại sao đây là đáp án đúng (thân thiện với trẻ 6–11 tuổi)..."
              rows={2}
              style={textareaStyle}
            />
          </label>

          {/* Hình ảnh */}
          <div>
            <div style={labelTextStyle}>Hình minh họa (tùy chọn)</div>
            {q.imageUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <img src={q.imageUrl} alt="Minh họa" style={{ width: '4rem', height: '4rem', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} />
                <div style={{ flex: 1, fontSize: '0.8125rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.imageUrl}</div>
                <button type="button" onClick={() => onUpdate({ imageUrl: null })} style={{ padding: '0.25rem', border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer' }}>✕</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowImagePicker(true)}
                style={{
                  marginTop: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.5rem',
                  border: '1.5px dashed rgba(99,102,241,0.3)', background: 'transparent',
                  color: '#6366f1', fontSize: '0.8125rem', cursor: 'pointer',
                }}
              >
                🖼️ Chọn hình ảnh từ Assets
              </button>
            )}
            {showImagePicker && (
              <div style={{ marginTop: '0.5rem' }}>
                <ImageAssetPicker
                  value={q.imageUrl ?? null}
                  onChange={(url) => { onUpdate({ imageUrl: url }); setShowImagePicker(false) }}
                  onClose={() => setShowImagePicker(false)}
                />
              </div>
            )}
          </div>

          {/* Tags & Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Độ khó</span>
              <select
                value={q.difficulty}
                onChange={(e) => onUpdate({ difficulty: e.target.value as 'gentle' | 'steady' | 'challenge' })}
                style={selectStyle}
              >
                <option value="gentle">🌱 Nhẹ nhàng (6–8 tuổi)</option>
                <option value="steady">⚡ Vừa sức (8–10 tuổi)</option>
                <option value="challenge">🔥 Nâng cao (10–11 tuổi)</option>
              </select>
            </label>
            <label style={labelStyle}>
              <span style={labelTextStyle}>Độ tuổi</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="number" min={6} max={11} value={q.ageMin} onChange={(e) => onUpdate({ ageMin: parseInt(e.target.value) || 6 })} style={{ ...inputStyle, width: '4rem' }} />
                <span style={{ color: '#64748b' }}>–</span>
                <input type="number" min={6} max={11} value={q.ageMax} onChange={(e) => onUpdate({ ageMax: parseInt(e.target.value) || 11 })} style={{ ...inputStyle, width: '4rem' }} />
                <span style={{ color: '#64748b', fontSize: '0.8125rem' }}>tuổi</span>
              </div>
            </label>
          </div>

          {/* Tags */}
          <div>
            <div style={labelTextStyle}>Chủ đề</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
              {QUESTION_BANK_TAGS.map((tag) => {
                const active = q.tags.includes(tag.id)
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onUpdate({ tags: active ? q.tags.filter((t) => t !== tag.id) : [...q.tags, tag.id] })}
                    style={{
                      padding: '0.25rem 0.625rem', borderRadius: '2rem',
                      background: active ? '#ede9fe' : '#f8fafc',
                      color: active ? '#8b5cf6' : '#64748b',
                      fontSize: '0.8125rem', cursor: 'pointer', fontWeight: active ? 600 : 400,
                      border: active ? '1px solid #ddd6fe' : '1px solid #e2e8f0',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tag.emoji} {tag.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '0.375rem',
}
const labelTextStyle: React.CSSProperties = {
  fontSize: '0.8125rem', fontWeight: 600, color: '#475569',
}
const textareaStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.625rem',
  border: '1.5px solid #e2e8f0', background: '#fff',
  color: '#0f172a', fontSize: '0.875rem', outline: 'none', resize: 'vertical',
  fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box',
}
const inputStyle: React.CSSProperties = {
  padding: '0.5rem 0.625rem', borderRadius: '0.5rem',
  border: '1.5px solid #e2e8f0', background: '#fff',
  color: '#0f172a', fontSize: '0.875rem', outline: 'none',
}
const selectStyle: React.CSSProperties = {
  width: '100%', padding: '0.5rem 0.625rem', borderRadius: '0.5rem',
  border: '1.5px solid #e2e8f0', background: '#fff',
  color: '#0f172a', fontSize: '0.875rem', outline: 'none',
}

export type { EditableQuestion }
