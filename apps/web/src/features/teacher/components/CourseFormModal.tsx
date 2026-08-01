/**
 * CourseFormModal — Modal popup để tạo hoặc chỉnh sửa khóa học.
 *
 * WHY modal thay vì inline: Giáo viên không phải rời khỏi trang danh sách
 * khóa học. Có thể mở, edit, save và quay lại danh sách mượt mà.
 *
 * Fields dựa trên courseSchema từ teacher.routes.ts + authoring.ts.
 * Validation readiness từ courseDraftReadiness.
 */
import { useState, useId } from 'react'
import { X, CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { api } from '@/shared/lib/api'
import { useToast } from '@/shared/hooks/useToast'
import {
  courseDraftReadiness, slugifyAuthoringId,
  type CourseDraft,
} from '../lib/authoring'

type Props = {
  course: {
    id: string
    title: string
    shortTitle: string
    tagline: string
    description: string
    productLabel: string
    ageTrack: string
    courseKey: string
    durationLabel: string
    skillsText: string
    outcomesText: string
    credential: string
    finalAssessment: string
  } | null   // null = create mode
  onSaved: (courseId?: string) => void
  onClose: () => void
}

const AGE_TRACKS = ['6–8 tuổi', '8–10 tuổi', '10–11 tuổi', '6–11 tuổi']

function emptyDraft(): CourseDraft {
  return {
    id: '', title: '', shortTitle: '', tagline: '', description: '',
    productLabel: '', ageTrack: '', courseKey: '', durationLabel: '',
    skillsText: '', outcomesText: '', credential: '', finalAssessment: '',
  }
}

export function CourseFormModal({ course, onSaved, onClose }: Props) {
  const [draft, setDraft] = useState<CourseDraft>(() => course ? { ...course } : emptyDraft())
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basics' | 'outcomes' | 'recognition'>('basics')
  const { showToast } = useToast()
  const uid = useId()

  const isEdit = !!course
  const readiness = courseDraftReadiness(draft)

  function set<K extends keyof CourseDraft>(key: K, value: CourseDraft[K]) {
    setDraft((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'title' && !isEdit && !prev.id.trim()) {
        next.id = slugifyAuthoringId(value as string)
      }
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        id: draft.id,
        title: draft.title,
        shortTitle: draft.shortTitle || undefined,
        tagline: draft.tagline || undefined,
        description: draft.description || undefined,
        productLabel: draft.productLabel || undefined,
        ageTrack: draft.ageTrack || undefined,
        durationLabel: draft.durationLabel || undefined,
        skills: draft.skillsText.split('\n').map((s) => s.trim()).filter(Boolean),
        outcomes: draft.outcomesText.split('\n').map((s) => s.trim()).filter(Boolean),
        credential: draft.credential || undefined,
        finalAssessment: draft.finalAssessment || undefined,
      }

      if (isEdit) {
        await api(`/api/teacher/courses/${course.id}`, {
          method: 'PATCH', body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        })
        showToast('✅ Đã cập nhật khóa học!', 'success')
        onSaved()
      } else {
        await api('/api/teacher/courses', {
          method: 'POST', body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        })
        showToast('✅ Đã tạo khóa học mới!', 'success')
        onSaved(draft.id)
      }
      onClose()
    } catch (err) {
      showToast(`Lỗi: ${err instanceof Error ? err.message : 'Không thể lưu'}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const TABS = [
    { id: 'basics' as const, label: '📚 Thông tin', step: readiness.steps[0] },
    { id: 'outcomes' as const, label: '🎯 Kết quả học', step: readiness.steps[1] },
    { id: 'recognition' as const, label: '🏆 Công nhận', step: readiness.steps[2] },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)', padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '600px', maxHeight: '90vh',
        borderRadius: '1.25rem', overflow: 'hidden',
        background: '#fff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}>
          <div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }}>
              {isEdit ? '✏️ Chỉnh sửa khóa học' : '✨ Tạo khóa học mới'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>
              {readiness.completed}/{readiness.total} bước hoàn thành
            </div>
          </div>
          <button
            type="button" onClick={onClose}
            style={{ padding: '0.5rem', border: '1px solid #e2e8f0', background: '#fff', borderRadius: '0.5rem', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '0.75rem 0.5rem',
                border: 'none', background: 'transparent',
                color: activeTab === tab.id ? '#6366f1' : '#64748b',
                fontSize: '0.8125rem', fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
              }}
            >
              {tab.step?.complete
                ? <CheckCircle2 size={12} color="#10b981" />
                : <Circle size={12} color="#cbd5e1" />
              }
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
          {/* Missing fields alert */}
          {(readiness.steps.find((s) => s.id === (activeTab === 'basics' ? 'basics' : activeTab === 'outcomes' ? 'outcomes' : 'recognition'))?.missing?.length ?? 0) > 0 && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
              padding: '0.75rem 1rem', borderRadius: '0.625rem', marginBottom: '1rem',
              background: '#fff7ed', border: '1px solid #fed7aa',
              color: '#c2410c', fontSize: '0.8125rem',
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div>
                Còn thiếu:{' '}
                {readiness.steps
                  .find((s) => s.id === (activeTab === 'basics' ? 'basics' : activeTab === 'outcomes' ? 'outcomes' : 'recognition'))
                  ?.missing?.join(', ')}
              </div>
            </div>
          )}

          {/* ── BASICS ── */}
          {activeTab === 'basics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <FormField label="Tên khóa học *">
                <input type="text" value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="VD: AI Nhí — Tập 1: Khám Phá Thế Giới AI" style={inputStyle} />
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormField label="Tên ngắn *">
                  <input type="text" value={draft.shortTitle} onChange={(e) => set('shortTitle', e.target.value)} placeholder="AI Nhí T1" style={inputStyle} />
                </FormField>
                <FormField label="Đường dẫn (ID) *" hint="Auto từ tên">
                  <input type="text" value={draft.id} onChange={(e) => set('id', e.target.value)} placeholder="ai-nhi-tap-1" style={inputStyle} />
                </FormField>
              </div>
              <FormField label="Câu giới thiệu *">
                <input type="text" value={draft.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Khám phá AI cùng Mii và các bạn!" style={inputStyle} />
              </FormField>
              <FormField label="Mô tả khóa học *">
                <textarea value={draft.description} onChange={(e) => set('description', e.target.value)} placeholder="Mô tả chi tiết nội dung khóa học..." rows={4} style={textareaStyle} />
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormField label="Nhóm tuổi *">
                  <select value={draft.ageTrack} onChange={(e) => set('ageTrack', e.target.value)} style={selectStyle}>
                    <option value="">Chọn nhóm tuổi...</option>
                    {AGE_TRACKS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
                <FormField label="Thời lượng *">
                  <input type="text" value={draft.durationLabel} onChange={(e) => set('durationLabel', e.target.value)} placeholder="VD: 8 tuần · 24 tiết" style={inputStyle} />
                </FormField>
              </div>
              <FormField label="Mã lộ trình (Course Key) *" hint="Mã định danh nội bộ">
                <input type="text" value={draft.courseKey} onChange={(e) => set('courseKey', e.target.value)} placeholder="VD: AI101" style={inputStyle} />
              </FormField>
            </div>
          )}

          {/* ── OUTCOMES ── */}
          {activeTab === 'outcomes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <FormField label="Sản phẩm cuối khóa *">
                <input type="text" value={draft.productLabel} onChange={(e) => set('productLabel', e.target.value)} placeholder="VD: Bộ sưu tập 6 tác phẩm AI do học sinh tạo ra" style={inputStyle} />
              </FormField>
              <FormField label="Kỹ năng đạt được *" hint="Mỗi kỹ năng 1 dòng">
                <textarea
                  value={draft.skillsText}
                  onChange={(e) => set('skillsText', e.target.value)}
                  placeholder="Hiểu AI là gì và học thế nào&#10;Sử dụng AI an toàn và có trách nhiệm&#10;Tạo ra nội dung sáng tạo cùng AI"
                  rows={5} style={textareaStyle}
                />
              </FormField>
              <FormField label="Kết quả đầu ra *" hint="Mỗi kết quả 1 dòng">
                <textarea
                  value={draft.outcomesText}
                  onChange={(e) => set('outcomesText', e.target.value)}
                  placeholder="Học sinh có thể giải thích AI cho bạn bè&#10;Nhận biết AI trong cuộc sống hàng ngày&#10;Tạo ra ít nhất 1 sản phẩm số với AI"
                  rows={5} style={textareaStyle}
                />
              </FormField>
            </div>
          )}

          {/* ── RECOGNITION ── */}
          {activeTab === 'recognition' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <FormField label="Tên chứng nhận / Huy hiệu *">
                <input type="text" value={draft.credential} onChange={(e) => set('credential', e.target.value)} placeholder="VD: Nhà Thám Hiểm AI cấp độ 1" style={inputStyle} />
              </FormField>
              <FormField label="Yêu cầu hoàn thành cuối khóa *">
                <textarea value={draft.finalAssessment} onChange={(e) => set('finalAssessment', e.target.value)} placeholder="Hoàn thành tất cả 8 bài học và tạo ra ít nhất 5 sản phẩm..." rows={4} style={textareaStyle} />
              </FormField>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', flexShrink: 0,
          background: '#fff',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {TABS.map((tab) => (
              <div key={tab.id} style={{
                width: '0.5rem', height: '0.5rem', borderRadius: '50%',
                background: tab.step?.complete ? '#10b981' : activeTab === tab.id ? '#6366f1' : '#e2e8f0',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.625rem 1.25rem', borderRadius: '0.625rem', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}>
              Hủy
            </button>
            {/* Next tab or Save */}
            {activeTab !== 'recognition' ? (
              <button type="button" onClick={() => setActiveTab(activeTab === 'basics' ? 'outcomes' : 'recognition')} style={primaryBtnStyle}>
                Tiếp theo →
              </button>
            ) : (
              <button
                type="button"
                id={`${uid}-save-course`}
                onClick={handleSave}
                disabled={saving}
                style={{ ...primaryBtnStyle, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? '⏳ Đang lưu...' : isEdit ? '💾 Cập nhật' : '✨ Tạo khóa học'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{label}</span>
        {hint && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{hint}</span>}
      </div>
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.625rem',
  border: '1.5px solid #e2e8f0', background: '#fff',
  color: '#0f172a', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
}
const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: 'vertical', lineHeight: 1.6,
}
const selectStyle: React.CSSProperties = {
  ...inputStyle, cursor: 'pointer',
}
const primaryBtnStyle: React.CSSProperties = {
  padding: '0.625rem 1.5rem', borderRadius: '0.625rem', border: 'none',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
}
