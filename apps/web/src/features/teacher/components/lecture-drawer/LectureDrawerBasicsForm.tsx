import React from 'react'
import { BookOpen, Youtube, Star, Award } from 'lucide-react'
import type { LectureDraft, LessonAccessConfig } from '../../lib/authoring'
import { slugifyAuthoringId } from '../../lib/authoring'
import { cn } from '@/shared/lib/cn'
import { StudentBasicsPreview } from './PracticeWorkflowStepsAccordion'
import { inputStyle, textareaStyle, FormRow } from './lecture-drawer-constants'

export interface LectureDrawerBasicsFormProps {
  draft: LectureDraft
  deferredDraft: LectureDraft
  set: <K extends keyof LectureDraft>(key: K, value: LectureDraft[K]) => void
  updateAccess: (patch: Partial<LessonAccessConfig>) => void
  readOnly: boolean
  isIslandCourse: boolean
  showInlinePreview: boolean
  setShowInlinePreview: React.Dispatch<React.SetStateAction<boolean>>
  uid: string
}

/**
 * LectureDrawerBasicsForm — Form thông tin trạm học cơ bản (Tab "Cơ bản" / "Thông tin trạm").
 * Quản lý: Tiêu đề, slug, kỹ năng, hook, mục tiêu cốt lõi, thời lượng, huy hiệu trạm, video (legacy) & access control.
 */
export function LectureDrawerBasicsForm({
  draft,
  deferredDraft,
  set,
  updateAccess,
  readOnly,
  isIslandCourse,
  showInlinePreview,
  setShowInlinePreview,
  uid,
}: LectureDrawerBasicsFormProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Banner tiêu đề */}
      <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-xs">
            <BookOpen size={20} />
          </span>
          <div>
            <h3 className="font-display text-lg text-brand-950">Thông tin trạm học</h3>
            <p className="mt-0.5 text-xs font-semibold text-brand-800">
              Định hướng toàn bộ bài học: tiêu đề, đường dẫn, mục tiêu và kỹ năng trọng tâm.
            </p>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'w-full min-w-0 transition-all',
          showInlinePreview
            ? 'grid lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,.85fr)] items-start gap-5'
            : 'flex flex-col gap-4'
        )}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Tên trạm học */}
          <FormRow label="Tên trạm học *">
            <input
              type="text"
              id={`${uid}-title`}
              value={draft.title}
              readOnly={readOnly}
              onChange={(e) => set('title', e.target.value)}
              placeholder="VD: Bài 1.2 — Bốn chiếc chìa khoá"
              style={inputStyle}
            />
          </FormRow>

          {/* Đường dẫn (slug) */}
          <FormRow label="Đường dẫn (slug) *" hint="VD: bai-1-1-mot-tu-hay-nam-tu">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>/</span>
              <input
                type="text"
                id={`${uid}-slug`}
                value={(draft as any).slug ?? ''}
                readOnly={readOnly}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="ten-bai-hoc"
                style={{ ...inputStyle, flex: 1 }}
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => set('slug', slugifyAuthoringId(draft.title))}
                  className="rounded-lg bg-sky-100 px-2.5 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-200 transition whitespace-nowrap cursor-pointer"
                  title="Tự sinh đường dẫn không dấu từ tên trạm học"
                >
                  ⚡ Tự tạo
                </button>
              )}
            </div>
            {(draft as any).slug && !/^[a-z0-9-]{3,64}$/.test((draft as any).slug) && (
              <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                ⚠️ Chỉ dùng chữ thường, số và gạch ngang (3–64 ký tự)
              </div>
            )}
          </FormRow>

          {/* Kỹ năng trọng tâm */}
          <FormRow label="Kỹ năng trọng tâm *">
            <input
              type="text"
              value={draft.skill}
              readOnly={readOnly}
              onChange={(e) => set('skill', e.target.value)}
              placeholder="VD: Hiểu cách AI học từ dữ liệu"
              style={inputStyle}
            />
          </FormRow>

          {/* Khẩu hiệu / Lời dẫn khởi động */}
          <FormRow
            label="Khẩu hiệu / Lời dẫn khởi động *"
            hint="Khẩu hiệu ngắn gọn hoặc câu hỏi kích thích tò mò"
          >
            <textarea
              value={draft.hook}
              readOnly={readOnly}
              onChange={(e) => set('hook', e.target.value)}
              placeholder="VD: Tả càng rõ, AIKI vẽ càng đúng!"
              rows={3}
              style={textareaStyle}
            />
          </FormRow>

          {/* Mục tiêu bài học đạt được */}
          <FormRow
            label="Mục tiêu bài học đạt được *"
            hint="Hôm nay con sẽ đạt được gì? - Mỗi mục tiêu cốt lõi 1 dòng"
          >
            <textarea
              value={draft.goalsText}
              readOnly={readOnly}
              onChange={(e) => set('goalsText', e.target.value)}
              placeholder={
                'Hiểu AI học từ dữ liệu\nPhân biệt dữ liệu tốt và xấu\nBiết tại sao dữ liệu đa dạng quan trọng'
              }
              rows={4}
              style={textareaStyle}
            />
          </FormRow>

          {/* Thời lượng & Phần thưởng trạm học */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <FormRow label="Thời lượng">
              <input
                type="text"
                readOnly={readOnly}
                value={draft.duration}
                onChange={(e) => set('duration', e.target.value)}
                placeholder="VD: 30 phút"
                style={inputStyle}
              />
            </FormRow>
            <FormRow
              label="Phần thưởng trạm học"
              hint="Huy hiệu & thành tích học sinh đạt được khi hoàn thành trạm"
            >
              {(() => {
                const stationBadge = isIslandCourse
                  ? draft.sixStageJourney?.stage6_completion?.rewardBadge || {
                      name: draft.reward || 'Huy hiệu ' + draft.title,
                      stars: 3,
                      xp: 50,
                      iconUrl: '',
                    }
                  : {
                      name: draft.reward || 'Huy hiệu ' + draft.title,
                      stars: 3,
                      xp: 50,
                      iconUrl: '',
                    }
                const badgeName = stationBadge.name || draft.reward || 'Huy hiệu ' + draft.title
                const starsCount = stationBadge.stars || 3
                const xpReward = stationBadge.xp || 50
                const iconUrl =
                  stationBadge.iconUrl || draft.sixStageJourney?.stage1_goal?.imageUrl || ''

                return (
                  <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50/90 to-orange-50/60 p-3 shadow-clay-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative size-12 shrink-0 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center overflow-hidden shadow-xs">
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={badgeName}
                            className="size-full object-cover"
                            onError={(e) => {
                              ;(e.currentTarget as HTMLElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <Award size={24} className="text-amber-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-xs font-bold text-amber-900 truncate"
                            title={badgeName}
                          >
                            {badgeName}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: starsCount }).map((_, i) => (
                              <Star
                                key={i}
                                size={13}
                                className="text-amber-500 fill-amber-400"
                              />
                            ))}
                          </div>
                          <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-[10px] font-black text-amber-950">
                            +{xpReward} XP
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 text-[11px] font-semibold text-amber-700 bg-white/80 px-2 py-1 rounded-lg border border-amber-200/80">
                      🏆 Hoàn thành trạm
                    </span>
                  </div>
                )
              })()}
            </FormRow>
          </div>

          {/* Video trạm học */}
          {isIslandCourse ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 shadow-sm">
              <p className="text-xs font-bold leading-relaxed text-sky-800 flex items-start gap-2">
                <span className="text-base shrink-0">💡</span>
                <span>
                  <strong>Lưu ý:</strong> Đối với bài học Đảo AIKids, Video bài giảng, ảnh bìa và các phân đoạn mốc thời gian được biên soạn trực tiếp tại <strong>Chặng 3 (Video bài học)</strong>.
                </span>
              </p>
            </div>
          ) : (
            <FormRow label="Video bài học">
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Youtube size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                <input
                  type="url"
                  readOnly={readOnly}
                  value={draft.videoUrl}
                  onChange={(e) => set('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/..."
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
            </FormRow>
          )}

          {/* Card điều khiển Quyền truy cập & Học thử */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-amber-100 text-amber-700 font-bold text-sm">
                  🛡️
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Quyền truy cập &amp; Học thử</h4>
                  <p className="text-xs text-slate-500">
                    Cấu hình chế độ mở khóa và học thử riêng cho bài học này
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-bold',
                  (draft.access?.mode ?? 'inherit') === 'inherit' && 'bg-amber-100 text-amber-800',
                  draft.access?.mode === 'free_trial' && 'bg-emerald-100 text-emerald-800',
                  draft.access?.mode === 'plan_required' && 'bg-indigo-100 text-indigo-800',
                  draft.access?.mode === 'locked' && 'bg-rose-100 text-rose-800'
                )}
              >
                {(draft.access?.mode ?? 'inherit') === 'inherit' && '🟡 Kế thừa'}
                {draft.access?.mode === 'free_trial' && '🟢 Học thử'}
                {draft.access?.mode === 'plan_required' && '🔒 Gói 129k'}
                {draft.access?.mode === 'locked' && '⛔ Đang khóa'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 1. inherit */}
              <button
                type="button"
                disabled={readOnly}
                onClick={() => updateAccess({ mode: 'inherit', minPlanTier: 0 })}
                className={cn(
                  'flex flex-col items-start rounded-xl border-2 p-3 text-left transition cursor-pointer',
                  (draft.access?.mode ?? 'inherit') === 'inherit'
                    ? 'border-amber-400 bg-amber-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                )}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                  <span>🟡</span> Kế thừa từ Khóa học
                </div>
                <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                  Theo chính sách chung của Khóa học (Free hoặc Yêu cầu gói).
                </p>
              </button>

              {/* 2. free_trial */}
              <button
                type="button"
                disabled={readOnly}
                onClick={() =>
                  updateAccess({
                    mode: 'free_trial',
                    minPlanTier: 0,
                    trialBadge: draft.access?.trialBadge || 'Học thử',
                  })
                }
                className={cn(
                  'flex flex-col items-start rounded-xl border-2 p-3 text-left transition cursor-pointer',
                  draft.access?.mode === 'free_trial'
                    ? 'border-emerald-500 bg-emerald-50 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                )}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                  <span>🟢</span> Cho phép Học Thử Miễn Phí
                </div>
                <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                  Học sinh được học miễn phí bài này ngay cả khi chưa mua gói.
                </p>
              </button>

              {/* 3. plan_required */}
              <button
                type="button"
                disabled={readOnly}
                onClick={() => updateAccess({ mode: 'plan_required', minPlanTier: 1 })}
                className={cn(
                  'flex flex-col items-start rounded-xl border-2 p-3 text-left transition cursor-pointer',
                  draft.access?.mode === 'plan_required'
                    ? 'border-indigo-500 bg-indigo-50 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                )}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-900">
                  <span>🔒</span> Yêu cầu Gói Thuê Bao
                </div>
                <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                  Tier 1: Yêu cầu Gói Hội Viên AIKids 129k để mở khóa bài học này.
                </p>
              </button>

              {/* 4. locked */}
              <button
                type="button"
                disabled={readOnly}
                onClick={() => updateAccess({ mode: 'locked' })}
                className={cn(
                  'flex flex-col items-start rounded-xl border-2 p-3 text-left transition cursor-pointer',
                  draft.access?.mode === 'locked'
                    ? 'border-rose-400 bg-rose-50 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                )}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-900">
                  <span>⛔</span> Tạm khóa
                </div>
                <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                  Tạm khóa bài học với thông báo tùy chỉnh cho học sinh.
                </p>
              </button>
            </div>

            {/* Extra config fields based on mode */}
            {draft.access?.mode === 'free_trial' && (
              <div className="mt-3 pt-3 border-t border-emerald-100">
                <label className="block text-xs font-bold text-emerald-900 mb-1">
                  Huy hiệu học thử (Trial Badge):
                </label>
                <input
                  type="text"
                  disabled={readOnly}
                  value={draft.access?.trialBadge ?? 'Học thử'}
                  onChange={(e) => updateAccess({ trialBadge: e.target.value })}
                  placeholder="VD: Học thử, Trải nghiệm miễn phí..."
                  className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-emerald-500"
                />
              </div>
            )}

            {draft.access?.mode === 'locked' && (
              <div className="mt-3 pt-3 border-t border-rose-100">
                <label className="block text-xs font-bold text-rose-900 mb-1">
                  Lý do tạm khóa hiển thị cho học sinh:
                </label>
                <input
                  type="text"
                  disabled={readOnly}
                  value={draft.access?.lockedReason ?? ''}
                  onChange={(e) => updateAccess({ lockedReason: e.target.value })}
                  placeholder="VD: Bài học đang được giáo viên cập nhật..."
                  className="w-full rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-rose-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Live preview */}
        {showInlinePreview && (
          <StudentBasicsPreview draft={deferredDraft} onCollapse={() => setShowInlinePreview(false)} />
        )}
      </div>
    </div>
  )
}
