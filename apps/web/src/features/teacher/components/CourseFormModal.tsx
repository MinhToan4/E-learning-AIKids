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
import { createPortal } from 'react-dom'
import {
  X, CheckCircle2, Circle, AlertCircle,
  Award, Check, Sparkles, ShieldCheck,
} from 'lucide-react'
import { api } from '@/shared/lib/api'
import { useToast } from '@/shared/hooks/useToast'
import { rewardBadgeThumbnail } from '../../achievements/achievement-badge-assets'
import {
  courseDraftReadiness, slugifyAuthoringId,
  type CourseDraft,
} from '../lib/authoring'

export const RECOGNITION_BADGES = [
  { id: 'badge-title-explorer', name: 'Nhà Thám Hiểm Nhí', desc: 'Dành cho bé chinh phục khám phá' },
  { id: 'badge-title-first-light', name: 'Ánh Sáng Đầu Tiên', desc: 'Bắt đầu hành trình công nghệ' },
  { id: 'badge-title-star-keeper', name: 'Người Giữ Sao', desc: 'Chăm chỉ hoàn thành xuất sắc' },
  { id: 'badge-title-firestarter', name: 'Ngọn Lửa Sáng Tạo', desc: 'Ý tưởng đột phá, truyền cảm hứng' },
  { id: 'badge-title-young-legend', name: 'Huyền Thoại Nhí', desc: 'Tinh thông kỹ năng đỉnh cao' },
  { id: 'badge-title-idea-hunter', name: 'Thợ Săn Ý Tưởng AI', desc: 'Làm chủ công cụ AI Studio' },
  { id: 'badge-title-world-architect', name: 'Kiến Trúc Sư Thế Giới', desc: 'Tạo lập dự án toàn diện' },
  { id: 'badge-title-curious-seeker', name: 'Tò Mò Học Hỏi', desc: 'Không ngừng đặt câu hỏi' },
  { id: 'badge-code-comet', name: 'Sao Chổi Lập Trình', desc: 'Tư duy logic & giải thuật' },
  { id: 'badge-kind-collaborator', name: 'Đồng Đội Tuyệt Vời', desc: 'Hợp tác & chia sẻ cùng bạn' },
] as const

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
    badgeRewardId?: string
    issuerTitle?: string
    isGatekeeper?: boolean
    accessPolicy?: 'free' | 'plan_required' | 'paid' | string
  } | null   // null = create mode
  hasExistingGatekeeper?: boolean
  onSaved: (courseId?: string) => void
  onClose: () => void
}

const AGE_TRACKS = ['6–8 tuổi', '8–10 tuổi', '10–11 tuổi', '6–11 tuổi']

function emptyDraft(): CourseDraft {
  return {
    id: '', title: '', shortTitle: '', tagline: '', description: '',
    productLabel: '', ageTrack: '', courseKey: '', durationLabel: '',
    skillsText: '', outcomesText: '', credential: '', finalAssessment: '',
    badgeRewardId: 'badge-title-explorer',
    issuerTitle: 'AI Kids Creator Academy',
  }
}

export function CourseFormModal({ course, hasExistingGatekeeper = false, onSaved, onClose }: Props) {
  const [draft, setDraft] = useState<CourseDraft>(() => course ? { ...course } : emptyDraft())
  const [accessPolicy, setAccessPolicy] = useState<'free' | 'plan_required' | 'paid'>(() => {
    const raw = (course as any)?.accessPolicy
    if (raw === 'plan_required' || raw === 'paid') return raw
    return 'free'
  })
  const [isGatekeeper, setIsGatekeeper] = useState<boolean>(() => {
    if (course?.id === 'aiki-rules' || course?.title?.toLowerCase().includes('quy tắc')) return true
    return false
  })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basics' | 'outcomes' | 'recognition'>('basics')
  const { showToast } = useToast()
  const uid = useId()

  const isEdit = !!course
  const automaticCredential = `Chứng nhận hoàn thành ${draft.shortTitle.trim() || draft.title.trim() || 'giáo trình'}`
  const defaultFinalAssessment = 'Hoàn thành tất cả các trạm bắt buộc và nộp sản phẩm cuối giáo trình.'

  // Quản lý state cho Tab 3: Hoàn thành & Vinh danh
  const [isCustomCredential, setIsCustomCredential] = useState<boolean>(() => {
    if (!course?.credential) return false
    const auto = `Chứng nhận hoàn thành ${course.shortTitle?.trim() || course.title?.trim() || 'giáo trình'}`
    return course.credential.trim() !== '' && course.credential.trim() !== auto
  })
  const [customCredential, setCustomCredential] = useState<string>(() => course?.credential || automaticCredential)
  const [badgeRewardId, setBadgeRewardId] = useState<string>(() => course?.badgeRewardId || 'badge-title-explorer')
  const [finalAssessment, setFinalAssessment] = useState<string>(() => course?.finalAssessment || defaultFinalAssessment)
  const [issuerTitle, setIssuerTitle] = useState<string>(() => course?.issuerTitle || 'AI Kids Creator Academy')

  const effectiveCredential = isCustomCredential ? (customCredential.trim() || automaticCredential) : automaticCredential

  const readiness = courseDraftReadiness({
    ...draft,
    credential: effectiveCredential,
    finalAssessment,
    badgeRewardId,
    issuerTitle,
  })

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
        credential: isCustomCredential ? customCredential : automaticCredential,
        finalAssessment,
        badgeRewardId,
        issuerTitle,
        isGatekeeper,
        accessPolicy,
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
    { id: 'basics' as const, label: 'Trang giới thiệu', step: readiness.steps[0] },
    { id: 'outcomes' as const, label: 'Mục tiêu & sản phẩm', step: readiness.steps[1] },
    { id: 'recognition' as const, label: 'Hoàn thành & Vinh danh', step: readiness.steps[2] },
  ]

  const modalContent = (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(15,23,42,0.3)', padding: '1rem',
      overflowY: 'auto',
    }}>
      <div style={{
        width: '100%', maxWidth: '720px', maxHeight: 'min(92vh, 850px)',
        borderRadius: '1.25rem', overflow: 'hidden',
        background: '#fff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
        display: 'flex', flexDirection: 'column',
        margin: 'auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', flexShrink: 0,
          background: '#f8fafc',
        }}>
          <div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }}>
              {isEdit ? 'Sửa thông tin trên trang học' : 'Tạo khung giáo trình'}
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
        <div style={{ flex: '1 1 0%', minHeight: 0, overflowY: 'auto', padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
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
              {/* Lựa chọn loại đảo theo quy định CMS */}
              <div style={{
                padding: '0.875rem', borderRadius: '0.75rem',
                background: '#f1f5f9', border: '1px solid #cbd5e1',
                marginBottom: '0.25rem',
              }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Loại Đảo / Chương Trình Học Tập *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {/* Option 1: Standard Learning Island */}
                  <button
                    type="button"
                    onClick={() => setIsGatekeeper(false)}
                    style={{
                      padding: '0.75rem', borderRadius: '0.625rem', textAlign: 'left',
                      border: !isGatekeeper ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      background: !isGatekeeper ? '#eef2ff' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>📚 Đảo Khóa Học Thường</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Các bài học khám phá, sáng tạo thông thường
                    </div>
                  </button>

                  {/* Option 2: Gatekeeper Rule Island */}
                  <button
                    type="button"
                    disabled={hasExistingGatekeeper && !isEdit}
                    onClick={() => {
                      setIsGatekeeper(true)
                      if (!isEdit) {
                        setDraft((prev) => ({
                          ...prev,
                          id: 'aiki-rules',
                          title: 'Quy tắc vàng AIKI',
                          shortTitle: '10 Quy Tắc Vàng',
                          tagline: 'Mười quy tắc của Xưởng sáng tạo AIKid',
                          description: 'Khám phá 10 bí quyết để trở thành Nhà Sáng Tạo AI nhí thông thái trước khi bước vào Xưởng sáng tạo.',
                          productLabel: 'Bộ sưu tập 10 Poster Vàng in treo bàn học',
                          ageTrack: '8–11 tuổi',
                          courseKey: 'AIKI-RULES',
                          durationLabel: '10 bài ngắn',
                          skillsText: 'Nghĩ ý tưởng trước khi hỏi AI\nViết xong nội dung mới gửi cho AI\nBảo vệ hình ảnh và thông tin cá nhân',
                          outcomesText: 'Hoàn thành 10 quy tắc vàng\nNhận Huy hiệu Hiệp Sĩ Sáng Tạo\nMở khóa toàn bộ các hòn đảo học tập',
                        }))
                      }
                    }}
                    style={{
                      padding: '0.75rem', borderRadius: '0.625rem', textAlign: 'left',
                      border: isGatekeeper ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                      background: isGatekeeper ? '#fef3c7' : (hasExistingGatekeeper && !isEdit ? '#f8fafc' : '#fff'),
                      opacity: hasExistingGatekeeper && !isEdit ? 0.6 : 1,
                      cursor: hasExistingGatekeeper && !isEdit ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#78350f', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>🛡️ Đảo Quy Tắc Vàng</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.25rem' }}>
                      {hasExistingGatekeeper && !isEdit
                        ? 'Đã có 1 Đảo Quy Tắc trong lộ trình'
                        : 'Cửa ngõ tiên quyết (Mỗi lộ trình duy nhất 1 đảo)'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Cấu hình Quyền truy cập khóa học (Access Policy) */}
              <div style={{
                padding: '0.875rem', borderRadius: '0.75rem',
                background: '#f8fafc', border: '1px solid #cbd5e1',
                marginBottom: '0.25rem',
              }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Chính Sách Quyền Truy Cập (Access Policy) *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {/* Option 1: Free */}
                  <button
                    type="button"
                    onClick={() => setAccessPolicy('free')}
                    style={{
                      padding: '0.625rem 0.5rem', borderRadius: '0.5rem', textAlign: 'center',
                      border: accessPolicy === 'free' ? '2px solid #10b981' : '1px solid #e2e8f0',
                      background: accessPolicy === 'free' ? '#ecfdf5' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#065f46' }}>
                      🎁 Miễn phí (Free)
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#047857', marginTop: '0.125rem' }}>
                      Mở tự do cho học sinh
                    </div>
                  </button>

                  {/* Option 2: Plan Required */}
                  <button
                    type="button"
                    onClick={() => setAccessPolicy('plan_required')}
                    style={{
                      padding: '0.625rem 0.5rem', borderRadius: '0.5rem', textAlign: 'center',
                      border: accessPolicy === 'plan_required' ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      background: accessPolicy === 'plan_required' ? '#eef2ff' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#3730a3' }}>
                      🔒 Gói Hội Viên
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#4338ca', marginTop: '0.125rem' }}>
                      Yêu cầu Subscription
                    </div>
                  </button>

                  {/* Option 3: Paid */}
                  <button
                    type="button"
                    onClick={() => setAccessPolicy('paid')}
                    style={{
                      padding: '0.625rem 0.5rem', borderRadius: '0.5rem', textAlign: 'center',
                      border: accessPolicy === 'paid' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                      background: accessPolicy === 'paid' ? '#fef3c7' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#92400e' }}>
                      🏷️ Mua lẻ (Paid)
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#b45309', marginTop: '0.125rem' }}>
                      Thanh toán theo khóa
                    </div>
                  </button>
                </div>

                {accessPolicy === 'plan_required' && (
                  <div style={{
                    marginTop: '0.625rem', padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                    background: '#eef2ff', border: '1px solid #c7d2fe',
                    color: '#3730a3', fontSize: '0.75rem', lineHeight: 1.5,
                  }}>
                    💡 <strong>Gợi ý Gói Hội Viên AIKids 129k:</strong> Khóa học sẽ yêu cầu học sinh đăng ký <strong>Gói Hội Viên AIKids 129k</strong> để mở khóa các bài học (ngoại trừ các bài được cấu hình Học Thử miễn phí).
                  </div>
                )}
              </div>

              <FormField label="Tên vùng/khóa học *">
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
              <FormField label="Mô tả ngắn dưới tiêu đề *">
                <input type="text" value={draft.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Khám phá AI cùng Mii và các bạn!" style={inputStyle} />
              </FormField>
              <FormField label="Giới thiệu giáo trình *">
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
              <FormField label="Sản phẩm học sinh hoàn thành *">
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
              <FormField label="Con sẽ làm được gì? *" hint="Mỗi kết quả 1 dòng">
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
              {/* 1. Tên Chứng Chỉ */}
              <div style={{
                padding: '1rem', borderRadius: '0.875rem',
                background: '#f8fafc', border: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', gap: '0.625rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    📜 Tên Chứng Chỉ Số Trao Tặng *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsCustomCredential(false)}
                      style={{
                        padding: '0.3125rem 0.625rem', borderRadius: '0.5rem',
                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                        border: !isCustomCredential ? '1.5px solid #6366f1' : '1px solid #cbd5e1',
                        background: !isCustomCredential ? '#eef2ff' : '#fff',
                        color: !isCustomCredential ? '#4338ca' : '#64748b',
                        transition: 'all 0.15s',
                      }}
                    >
                      Dùng tên tự động
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCredential(true)
                        if (!customCredential.trim()) setCustomCredential(automaticCredential)
                      }}
                      style={{
                        padding: '0.3125rem 0.625rem', borderRadius: '0.5rem',
                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                        border: isCustomCredential ? '1.5px solid #6366f1' : '1px solid #cbd5e1',
                        background: isCustomCredential ? '#eef2ff' : '#fff',
                        color: isCustomCredential ? '#4338ca' : '#64748b',
                        transition: 'all 0.15s',
                      }}
                    >
                      Tự đặt tên chứng chỉ riêng
                    </button>
                  </div>
                </div>

                {isCustomCredential ? (
                  <input
                    type="text"
                    value={customCredential}
                    onChange={(e) => setCustomCredential(e.target.value)}
                    placeholder="VD: Chứng chỉ Chuyên Gia Nhí Sáng Tạo AI"
                    style={inputStyle}
                  />
                ) : (
                  <div style={{
                    padding: '0.625rem 0.75rem', borderRadius: '0.625rem',
                    background: '#ecfdf5', border: '1px solid #a7f3d0',
                    color: '#065f46', fontSize: '0.8125rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                  }}>
                    <Check size={14} color="#059669" />
                    <span>{automaticCredential}</span>
                  </div>
                )}
              </div>

              {/* 2. Huy Hiệu Vinh Danh (Achievement Badge Picker) */}
              <div style={{
                padding: '1rem', borderRadius: '0.875rem',
                background: '#f8fafc', border: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', gap: '0.625rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Award size={16} color="#6366f1" />
                    <span>Huy Hiệu Vinh Danh (Achievement Badge) *</span>
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Huy hiệu Soft-Clay 3D chính thức
                  </span>
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(125px, 1fr))',
                  gap: '0.625rem', maxHeight: '220px', overflowY: 'auto', padding: '0.25rem',
                }}>
                  {RECOGNITION_BADGES.map((b) => {
                    const isSelected = badgeRewardId === b.id
                    const thumb = rewardBadgeThumbnail(b.id)
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBadgeRewardId(b.id)}
                        style={{
                          position: 'relative',
                          padding: '0.625rem 0.5rem',
                          borderRadius: '0.75rem',
                          border: isSelected ? '2px solid #6366f1' : '1.5px solid #e2e8f0',
                          background: isSelected ? '#eef2ff' : '#fff',
                          boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.18)' : '0 1px 2px rgba(0,0,0,0.03)',
                          cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isSelected && (
                          <div style={{
                            position: 'absolute', top: 4, right: 4,
                            width: 18, height: 18, borderRadius: '50%',
                            background: '#6366f1', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={b.name}
                            style={{ width: 44, height: 44, objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))' }}
                          />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={22} color="#6366f1" />
                          </div>
                        )}
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isSelected ? '#312e81' : '#1e293b', marginTop: '0.375rem', lineHeight: 1.25 }}>
                          {b.name}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.125rem', lineHeight: 1.25 }}>
                          {b.desc}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 3. Tiêu Chuẩn Hoàn Thành */}
              <div style={{
                padding: '1rem', borderRadius: '0.875rem',
                background: '#f8fafc', border: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', gap: '0.625rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    🎯 Tiêu Chuẩn Hoàn Thành *
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Chọn nhanh hoặc tùy chỉnh</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {[
                    { label: '100% trạm bắt buộc', text: 'Hoàn thành 100% các trạm học bắt buộc trong giáo trình.' },
                    { label: '100% trạm + 1 tác phẩm AI Studio', text: 'Hoàn thành 100% các trạm học bắt buộc và nộp ít nhất 1 tác phẩm sáng tạo từ AI Studio.' },
                    { label: '100% trạm + Test cuối khóa (≥ 80%)', text: 'Hoàn thành 100% các trạm học và đạt tối thiểu 80% điểm bài kiểm tra cuối khóa.' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFinalAssessment(preset.text)}
                      style={{
                        padding: '0.3125rem 0.625rem', borderRadius: '0.5rem',
                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                        border: finalAssessment === preset.text ? '1.5px solid #6366f1' : '1px solid #cbd5e1',
                        background: finalAssessment === preset.text ? '#eef2ff' : '#fff',
                        color: finalAssessment === preset.text ? '#4338ca' : '#475569',
                        transition: 'all 0.15s',
                      }}
                    >
                      ⚡ {preset.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={finalAssessment}
                  onChange={(e) => setFinalAssessment(e.target.value)}
                  placeholder="Nhập tiêu chuẩn hoàn thành khóa học..."
                  rows={2}
                  style={textareaStyle}
                />
              </div>

              {/* 4. Đơn Vị Cấp Chứng Nhận */}
              <FormField label="🏛️ Đơn Vị Cấp Chứng Nhận *" hint="Hiển thị trên chứng nhận số">
                <input
                  type="text"
                  value={issuerTitle}
                  onChange={(e) => setIssuerTitle(e.target.value)}
                  placeholder="AI Kids Creator Academy"
                  style={inputStyle}
                />
              </FormField>

              {/* 5. Mô Phỏng Chứng Nhận Số (Live Certificate Preview) */}
              <div style={{
                padding: '1.125rem',
                borderRadius: '1rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #f5f7ff 100%)',
                border: '2px solid #e0e7ff',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e0e7ff', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Sparkles size={16} color="#eab308" />
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6366f1' }}>
                      Chứng Nhận Số Kỹ Thuật Số (Mô Phỏng Thực Tế)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>
                    <ShieldCheck size={12} /> Đã xác thực trên hệ thống
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 68, height: 68, flexShrink: 0,
                    borderRadius: '1rem',
                    background: 'radial-gradient(circle, #f5f3ff 0%, #ede9fe 100%)',
                    border: '1.5px solid #ddd6fe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.12)',
                  }}>
                    {rewardBadgeThumbnail(badgeRewardId) ? (
                      <img
                        src={rewardBadgeThumbnail(badgeRewardId)}
                        alt="Huy hiệu vinh danh"
                        style={{ width: 52, height: 52, objectFit: 'contain' }}
                      />
                    ) : (
                      <Award size={36} color="#6366f1" />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                      Trao tặng: <span style={{ color: '#0f172a', fontWeight: 700 }}>Nguyễn Minh Triết</span> (Học sinh mẫu)
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e1b4b', marginTop: '0.125rem', lineHeight: 1.3 }}>
                      {effectiveCredential}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem', lineHeight: 1.35 }}>
                      Tiêu chuẩn: {finalAssessment}
                    </div>
                  </div>

                  <div style={{
                    width: 58, height: 58, flexShrink: 0,
                    borderRadius: '0.5rem', border: '1px solid #cbd5e1',
                    background: '#fff', padding: '3px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#334155" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="3" height="3" />
                      <rect x="18" y="18" width="3" height="3" />
                      <rect x="18" y="14" width="3" height="3" />
                      <rect x="14" y="18" width="3" height="3" />
                    </svg>
                    <span style={{ fontSize: '0.4375rem', color: '#94a3b8', marginTop: 1, fontWeight: 700 }}>QR VERIFIED</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderTop: '1px solid #e0e7ff', paddingTop: '0.5rem',
                  fontSize: '0.75rem', color: '#64748b',
                }}>
                  <div>
                    Đơn vị cấp: <strong style={{ color: '#312e81' }}>{issuerTitle || 'AI Kids Creator Academy'}</strong>
                  </div>
                  <div style={{ fontStyle: 'italic', fontSize: '0.6875rem', color: '#6366f1' }}>
                    Hệ Thống LMS AIKids Verified
                  </div>
                </div>
              </div>
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
                {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo giáo trình'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
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
