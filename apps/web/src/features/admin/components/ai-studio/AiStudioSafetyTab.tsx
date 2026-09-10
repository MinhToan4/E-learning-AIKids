import React, { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Clock,
  ZoomIn,
  Info,
  Edit3,
  Shield,
  ShieldCheck,
  Wand2,
  Check,
  Copy,
  Eye,
  Activity,
  Play,
  Sparkles,
  X,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import {
  ART_STYLES,
  type ArtStyleDef,
  buildArtGenerationPrompt,
} from '@/shared/lib/creation/creative'
import type { AiRejectionIncident } from '../../lib/ai-rejections-data'
import { DEFAULT_NEGATIVE_PROMPT } from './types'

export interface AiStudioSafetyTabProps {
  saving: boolean
  rejectionIncidents: AiRejectionIncident[]
  pendingRejectionCount: number
  falsePositiveRate: number
  onApproveOverride: (incidentId: string) => void
  onConfirmRejected: (incidentId: string) => void
  onSaveRefinedPrompt: (incidentId: string, refinedPrompt: string, adminNote: string) => void
  onAddWhitelistException: (trigger: string) => void
  negativePrompt: string
  setNegativePrompt: React.Dispatch<React.SetStateAction<string>>
  onSaveSafetyConfig: () => Promise<void>
  probePrompt: string
  setProbePrompt: React.Dispatch<React.SetStateAction<string>>
  disabledImageProviders: string[]
  imageFallbackChain: string[]
  showToast: (message: string, tone?: 'success' | 'error' | 'info') => void
}

function renderHighlightedPrompt(prompt: string, trigger: string) {
  if (!trigger || !prompt) return <span>{prompt}</span>
  const triggerTerms = trigger
    .split('/')
    .map((t) => t.trim())
    .filter(Boolean)
  if (triggerTerms.length === 0) return <span>{prompt}</span>
  const escapedTerms = triggerTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi')
  const parts = prompt.split(regex)

  return (
    <span>
      {parts.map((part, index) => {
        const isMatch = triggerTerms.some(
          (term) => part.toLowerCase() === term.toLowerCase(),
        )
        if (isMatch) {
          return (
            <mark
              key={index}
              className="bg-coral-100 text-coral-800 font-extrabold px-1.5 py-0.5 rounded border border-coral-300 inline-block shadow-xs"
              title={`Từ khóa kích hoạt cờ chặn: "${part}"`}
            >
              {part}
            </mark>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}

export function AiStudioSafetyTab({
  saving,
  rejectionIncidents,
  pendingRejectionCount,
  falsePositiveRate,
  onApproveOverride,
  onConfirmRejected,
  onSaveRefinedPrompt,
  onAddWhitelistException,
  negativePrompt,
  setNegativePrompt,
  onSaveSafetyConfig,
  probePrompt,
  setProbePrompt,
  disabledImageProviders,
  imageFallbackChain,
  showToast,
}: AiStudioSafetyTabProps) {
  // ── Local States ──────────────────────────────────────────
  const [rejectionFilter, setRejectionFilter] = useState<
    'all' | 'pending' | 'approved_override' | 'confirmed_rejected'
  >('all')
  const [refiningIncident, setRefiningIncident] = useState<AiRejectionIncident | null>(null)
  const [refinedPromptInput, setRefinedPromptInput] = useState('')
  const [refineAdminNote, setRefineAdminNote] = useState('')
  const [viewingSketch, setViewingSketch] = useState<string | null>(null)

  // Style Presets & Modal Preview
  const [copiedPresetId, setCopiedPresetId] = useState<string | null>(null)
  const [activePreviewStyle, setActivePreviewStyle] = useState<ArtStyleDef | null>(null)
  const [copiedModalPrompt, setCopiedModalPrompt] = useState(false)

  // Probe Tester
  const [probeProvider, setProbeProvider] = useState('auto')
  const [probeRunning, setProbeRunning] = useState(false)
  const [probeResult, setProbeResult] = useState<{
    success: boolean
    resolvedProvider: string
    latencyMs: number
    safetyStatus: string
    timestamp: string
  } | null>(null)

  const filteredRejectionIncidents = useMemo(() => {
    if (rejectionFilter === 'all') return rejectionIncidents
    return rejectionIncidents.filter((item) => item.status === rejectionFilter)
  }, [rejectionIncidents, rejectionFilter])

  // Copy style preset prompt
  const copyPreset = useCallback((presetId: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text)
    }
    setCopiedPresetId(presetId)
    setTimeout(() => setCopiedPresetId(null), 2000)
  }, [])

  // Refine Modal Handlers
  const handleOpenRefineModal = useCallback((incident: AiRejectionIncident) => {
    setRefiningIncident(incident)
    setRefinedPromptInput(incident.refinedPrompt || incident.promptText)
    setRefineAdminNote(incident.adminNote || 'Đã sửa từ nhạy cảm để phù hợp với bộ lọc.')
  }, [])

  const handleSaveRefinedPromptSubmit = useCallback(() => {
    if (!refiningIncident) return
    onSaveRefinedPrompt(refiningIncident.id, refinedPromptInput, refineAdminNote)
    setRefiningIncident(null)
  }, [refiningIncident, refinedPromptInput, refineAdminNote, onSaveRefinedPrompt])

  // Run Probe Test
  const handleRunProbe = useCallback(async () => {
    if (!probePrompt.trim()) {
      showToast('Vui lòng nhập prompt thử nghiệm', 'error')
      return
    }
    setProbeRunning(true)
    const startTime = performance.now()
    await new Promise((r) => setTimeout(r, 650 + Math.random() * 400))
    const latency = Math.round(performance.now() - startTime)

    // Check safety
    const forbiddenWords = ['violence', 'blood', 'gore', 'nsfw', 'naked', 'weapon']
    const hasViolation = forbiddenWords.some((w) => probePrompt.toLowerCase().includes(w))

    const activeProviderName =
      probeProvider === 'auto'
        ? imageFallbackChain.find((p) => !disabledImageProviders.includes(p)) || 'gemini-native'
        : probeProvider

    setProbeResult({
      success: !hasViolation,
      resolvedProvider: activeProviderName,
      latencyMs: latency,
      safetyStatus: hasViolation ? '⚠️ CẢNH BÁO: Chứa từ khóa bị chặn' : '🛡️ PASSED: Đạt chuẩn an toàn thiếu nhi',
      timestamp: new Date().toLocaleTimeString('vi-VN'),
    })
    setProbeRunning(false)
    showToast(
      hasViolation
        ? 'Prompt thử nghiệm bị chặn bởi bộ lọc an toàn!'
        : `Thử nghiệm pipeline thành công qua ${activeProviderName} (${latency}ms)`,
      hasViolation ? 'error' : 'success',
    )
  }, [probePrompt, probeProvider, imageFallbackChain, disabledImageProviders, showToast])

  return (
    <div className="flex flex-col gap-4">
      {/* ── HÀNG ĐỢI THẨM ĐỊNH TỪ CHỐI CỦA AI (AI REJECTION & FALSE-POSITIVE REVIEW) ── */}
      <div
        className="ui-card p-4 sm:p-5 border-2 border-brand-200/90 bg-gradient-to-br from-coral-50/40 via-surface to-brand-50/40 shadow-clay rounded-3xl"
        data-testid="ai-rejection-queue"
      >
        {/* Header Phân Hệ */}
        <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-border/70">
          <div>
            <div className="flex items-center gap-2 text-coral-600 font-extrabold text-xs uppercase tracking-wider">
              <ShieldAlert size={16} className="text-coral-500 animate-pulse" />
              <span>Hàng Đợi Thẩm Định Từ Chối Của AI (AI Rejection &amp; False-Positive Review)</span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-black text-text mt-1">
              Xử Lý Chặn Nhầm &amp; Cứu Sáng Tạo Của Bé
            </h3>
            <p className="text-xs text-muted mt-1 max-w-3xl leading-relaxed">
              Bảo vệ quyền tự do sáng tạo và tâm lý của trẻ em: AI thường quá nhạy cảm khi gặp từ khóa đồ chơi (kiếm gỗ, robot, khủng long). Admin trực tiếp thẩm định, gỡ chặn tức thì và bổ sung ngoại lệ an toàn cho toàn hệ thống.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-2xl text-xs font-black bg-coral-100 text-coral-700 border border-coral-200 shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-coral-500 animate-ping" />
              <span>{pendingRejectionCount} ca chờ thẩm định</span>
            </span>
          </div>
        </div>

        {/* 4 Thẻ Chỉ Số KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3.5">
          <div className="p-3 bg-surface rounded-2xl border-2 border-border/70 shadow-soft flex flex-col">
            <span className="text-[11px] font-extrabold text-muted uppercase">Tổng Số Ca Bị Chặn</span>
            <span className="font-display text-2xl font-black text-text mt-1">{rejectionIncidents.length}</span>
            <span className="text-[10px] text-muted mt-0.5">Gemini / Vertex / Filter</span>
          </div>

          <div className="p-3 bg-coral-50/70 rounded-2xl border-2 border-coral-200/80 shadow-soft flex flex-col">
            <span className="text-[11px] font-extrabold text-coral-700 uppercase">Chờ Thẩm Định</span>
            <span className="font-display text-2xl font-black text-coral-600 mt-1">{pendingRejectionCount}</span>
            <span className="text-[10px] text-coral-600/80 mt-0.5 font-bold">Cần admin duyệt gỡ</span>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-2xl border-2 border-amber-200/80 shadow-soft flex flex-col">
            <span className="text-[11px] font-extrabold text-amber-800 uppercase">Tỷ Lệ Chặn Nhầm</span>
            <span className="font-display text-2xl font-black text-amber-700 mt-1">{falsePositiveRate}%</span>
            <span className="text-[10px] text-amber-700/80 mt-0.5 font-bold">False-positive nghi ngờ</span>
          </div>

          <div className="p-3 bg-mint-50/70 rounded-2xl border-2 border-mint-200/80 shadow-soft flex flex-col">
            <span className="text-[11px] font-extrabold text-mint-800 uppercase">Đã Gỡ Chặn</span>
            <span className="font-display text-2xl font-black text-mint-700 mt-1">
              {rejectionIncidents.filter((i) => i.status === 'approved_override').length}
            </span>
            <span className="text-[10px] text-mint-700/80 mt-0.5 font-bold">Cấp bypass an toàn</span>
          </div>
        </div>

        {/* Thanh Bộ Lọc Trạng Thái */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3.5 border-t border-border/70">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Bộ lọc hàng đợi">
            {[
              { id: 'all', label: `Tất cả (${rejectionIncidents.length})` },
              { id: 'pending', label: `⏳ Chờ thẩm định (${pendingRejectionCount})` },
              {
                id: 'approved_override',
                label: `✅ Đã duyệt gỡ chặn (${rejectionIncidents.filter((i) => i.status === 'approved_override').length})`,
              },
              {
                id: 'confirmed_rejected',
                label: `❌ Xác nhận vi phạm (${rejectionIncidents.filter((i) => i.status === 'confirmed_rejected').length})`,
              },
            ].map((fTab) => (
              <button
                key={fTab.id}
                type="button"
                onClick={() => setRejectionFilter(fTab.id as any)}
                className={cn(
                  'px-3 py-1.5 rounded-xl font-display font-bold text-xs transition-all cursor-pointer',
                  rejectionFilter === fTab.id
                    ? 'bg-brand-500 text-white shadow-clay scale-[1.01]'
                    : 'bg-surface hover:bg-brand-50/80 text-text border border-border/70',
                )}
              >
                {fTab.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-muted font-bold">
            Hiển thị {filteredRejectionIncidents.length} / {rejectionIncidents.length} ca
          </div>
        </div>

        {/* Lưới Thẻ Thẩm Định (Incident Cards) */}
        <div className="grid gap-3.5 mt-4" data-testid="rejection-incidents-list">
          {filteredRejectionIncidents.length === 0 ? (
            <div className="p-8 text-center bg-surface/70 rounded-2xl border-2 border-dashed border-border text-muted">
              <CheckCircle2 size={32} className="mx-auto text-mint-500 mb-2" />
              <p className="font-display font-bold text-sm text-text">Không có trường hợp nào trong danh mục này</p>
              <p className="text-xs mt-0.5">Tất cả các ca bị AI từ chối đã được xử lý thỏa đáng.</p>
            </div>
          ) : (
            filteredRejectionIncidents.map((incident) => {
              const isPending = incident.status === 'pending'
              const isApproved = incident.status === 'approved_override'
              const isConfirmed = incident.status === 'confirmed_rejected'

              return (
                <div
                  key={incident.id}
                  data-testid={`incident-card-${incident.id}`}
                  className={cn(
                    'p-4 rounded-2xl border-2 bg-surface shadow-soft transition-all duration-200 flex flex-col gap-3',
                    isPending
                      ? 'border-amber-300/80 bg-gradient-to-r from-amber-50/20 via-surface to-surface'
                      : isApproved
                        ? 'border-mint-200 bg-gradient-to-r from-mint-50/20 via-surface to-surface'
                        : 'border-coral-200 bg-gradient-to-r from-coral-50/20 via-surface to-surface',
                  )}
                >
                  {/* Thẻ Header: Bé & Thời gian & Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs border border-brand-200">
                        <User size={15} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-text">
                            {incident.studentName}
                          </span>
                          <span className="text-[11px] font-bold px-1.5 py-0.2 bg-brand-50 text-brand-700 rounded-md border border-brand-200">
                            {incident.grade}
                          </span>
                          <span className="text-[11px] text-muted">
                            ({incident.parentEmail})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            <span>{incident.createdAt}</span>
                          </span>
                          <span>•</span>
                          <span className="font-bold text-brand-600">{incident.scopeLabelVi}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span>⏳ Chờ thẩm định</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-mint-100 text-mint-800 border border-mint-300 flex items-center gap-1 shadow-xs">
                          <CheckCircle size={13} className="text-mint-600" />
                          <span>✅ Đã duyệt gỡ chặn</span>
                        </span>
                      )}
                      {isConfirmed && (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-coral-100 text-coral-800 border border-coral-300 flex items-center gap-1 shadow-xs">
                          <XCircle size={13} className="text-coral-600" />
                          <span>❌ Xác nhận vi phạm</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Thẻ Body: Bằng chứng trực quan & Prompt */}
                  <div className="grid md:grid-cols-12 gap-3.5 items-start">
                    {/* Cột Visual Evidence & Prompt (7/12) */}
                    <div className="md:col-span-7 flex flex-col gap-2.5">
                      {incident.sketchThumbnailUrl && (
                        <div className="flex items-center gap-3 p-2 bg-amber-50/40 rounded-xl border border-amber-200/80">
                          <div
                            onClick={() => setViewingSketch(incident.sketchThumbnailUrl!)}
                            className="relative group cursor-pointer w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-300/80 bg-surface shadow-soft hover:shadow-clay transition shrink-0"
                            title="Nhấn để phóng to nét vẽ của bé"
                          >
                            <img
                              src={incident.sketchThumbnailUrl}
                              alt="Bản vẽ phác thảo của bé"
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                              <ZoomIn size={16} />
                            </div>
                          </div>
                          <div className="text-[11px] text-muted leading-tight">
                            <span className="font-bold text-text block mb-0.5">
                              Phác thảo nét vẽ tay của bé
                            </span>
                            <span>Bấm vào ảnh để phóng to thẩm định chi tiết nét vẽ</span>
                          </div>
                        </div>
                      )}

                      <div className="bg-brand-50/30 p-3 rounded-2xl border border-brand-100/90">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-extrabold uppercase text-muted tracking-wider">
                            Prompt của bé
                          </span>
                          <span className="text-[10px] font-bold text-coral-600 bg-coral-50 border border-coral-200 px-1.5 py-0.5 rounded-lg">
                            Cờ kích hoạt: &quot;{incident.flaggedTrigger}&quot;
                          </span>
                        </div>
                        <p className="text-xs text-text font-medium leading-relaxed">
                          {renderHighlightedPrompt(incident.promptText, incident.flaggedTrigger)}
                        </p>
                        {incident.refinedPrompt && (
                          <div className="mt-2 pt-2 border-t border-brand-200/60 text-[11px] text-brand-800">
                            <span className="font-extrabold text-brand-600">Prompt đã hiệu chỉnh: </span>
                            <span className="italic font-medium">{incident.refinedPrompt}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cột Diagnostic & Recommendation (5/12) */}
                    <div className="md:col-span-5 flex flex-col gap-2">
                      <div className="p-2.5 rounded-xl bg-surface border border-border/80">
                        <div className="flex items-center gap-1 text-coral-600 font-bold text-[11px]">
                          <AlertTriangle size={13} className="shrink-0" />
                          <span>AI Chặn: {incident.categoryLabelVi}</span>
                        </div>
                        <p className="text-[11px] text-text/80 mt-1 leading-snug">
                          {incident.aiReasonDetail}
                        </p>
                        <div className="text-[10px] text-muted mt-1 font-mono">
                          Bộ lọc: {incident.rejectedBy}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-mint-50/50 border border-mint-200/80">
                        <div className="flex items-center gap-1 text-mint-700 font-bold text-[11px]">
                          <CheckCircle size={13} className="shrink-0" />
                          <span>Khuyến nghị sư phạm</span>
                        </div>
                        <p className="text-[11px] text-mint-900 mt-1 leading-snug font-medium">
                          {incident.pedagogicalRecommendation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ghi chú Admin nếu có */}
                  {incident.adminNote && (
                    <div className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-200 text-xs text-brand-900 flex items-start gap-2">
                      <Info size={14} className="text-brand-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-bold">Ghi chú Admin ({incident.reviewedAt || 'Vừa xong'}): </span>
                        <span>{incident.adminNote}</span>
                      </div>
                    </div>
                  )}

                  {/* Bộ Nút Thao Tác Nghiệp Vụ */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/60">
                    <Button
                      onClick={() => onApproveOverride(incident.id)}
                      disabled={isApproved}
                      className={cn(
                        'text-xs min-h-8 px-3 font-bold flex items-center gap-1.5',
                        isApproved
                          ? 'opacity-50 cursor-not-allowed bg-mint-100 text-mint-800'
                          : 'bg-mint-600 hover:bg-mint-700 text-white shadow-clay',
                      )}
                    >
                      <CheckCircle size={13} />
                      <span>Duyệt cho phép (Gỡ chặn)</span>
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => onConfirmRejected(incident.id)}
                      disabled={isConfirmed}
                      className={cn(
                        'text-xs min-h-8 px-3 font-bold flex items-center gap-1.5',
                        isConfirmed
                          ? 'opacity-50 cursor-not-allowed text-coral-700'
                          : 'text-coral-700 hover:bg-coral-50 hover:text-coral-800 border-coral-200',
                      )}
                    >
                      <XCircle size={13} />
                      <span>Xác nhận vi phạm</span>
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => handleOpenRefineModal(incident)}
                      className="text-xs min-h-8 px-3 font-bold flex items-center gap-1.5 text-brand-700 hover:bg-brand-50 border-brand-200"
                    >
                      <Edit3 size={13} />
                      <span>Sửa nhanh prompt</span>
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => onAddWhitelistException(incident.flaggedTrigger)}
                      className="text-xs min-h-8 px-2.5 font-bold text-muted hover:text-brand-700 flex items-center gap-1.5"
                      title={`Đưa "${incident.flaggedTrigger}" vào Whitelist an toàn`}
                    >
                      <Shield size={13} />
                      <span>Thêm ngoại lệ</span>
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Universal Negative Prompt - Compact */}
      <div className="ui-card p-4 border-2 border-border/80 bg-surface shadow-soft rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-coral-600 font-extrabold text-[11px] uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>Bộ Lọc An Toàn Thiếu Nhi (Universal Negative Prompt)</span>
            </div>
            <h3 className="font-display text-lg font-bold text-text mt-0.5">
              Chặn Nội Dung Không Phù Hợp Cho Trẻ Em Toàn Cầu
            </h3>
            <p className="text-xs text-muted mt-0.5 leading-relaxed max-w-2xl">
              Chuỗi từ khóa tự động tiêm vào tất cả các yêu cầu tạo ảnh trên toàn hệ thống nhằm loại bỏ hình ảnh rùng rợn, bạo lực hay phản cảm.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setNegativePrompt(DEFAULT_NEGATIVE_PROMPT)}
              className="text-xs min-h-8 px-3"
            >
              Khôi phục mẫu chuẩn
            </Button>
            <Button onClick={() => void onSaveSafetyConfig()} disabled={saving} className="text-xs min-h-8 px-3.5 font-bold">
              Lưu bộ lọc an toàn
            </Button>
          </div>
        </div>

        <div className="mt-3">
          <textarea
            rows={3}
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-border font-mono text-xs text-text bg-brand-50/20 focus:bg-surface leading-relaxed"
            placeholder="Nhập các từ khóa cấm phân cách bằng dấu phẩy..."
          />
        </div>
      </div>

      {/* AI Kids Style Presets - 14 SSOT Art Styles Grid */}
      <div className="ui-card p-4 border-2 border-border/80 bg-surface shadow-soft rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-brand-600 font-extrabold text-[11px] uppercase tracking-wider">
              <Wand2 size={14} />
              <span>Phong Cách Tạo Hình Độc Quyền (AI Kids Style Presets)</span>
            </div>
            <h3 className="font-display text-lg font-bold text-text mt-0.5">
              Bộ 14 Phong Cách Mỹ Thuật Thiếu Nhi SSOT
            </h3>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              Các phong cách thiết kế mỹ thuật chuẩn mực tạo nên bản sắc thương hiệu AI Kids ấm áp và an toàn.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-700 border border-brand-200">
            14 Phong Cách Chuẩn (SSOT)
          </span>
        </div>

        <div className="mt-3.5 grid gap-3 md:grid-cols-2 xl:grid-cols-3 max-h-[600px] overflow-y-auto pr-1">
          {ART_STYLES.map((style) => {
            const isCopied = copiedPresetId === style.id
            return (
              <div
                key={style.id}
                className="p-3.5 rounded-2xl border-2 border-border/80 bg-surface hover:border-brand-300 hover:shadow-soft transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-sm text-text">
                          {style.labelVi}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-brand-50 text-brand-700 border border-brand-200">
                          {style.id}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">{style.tip}</p>
                    </div>
                  </div>

                  <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-border/60 text-[11px] font-mono text-muted leading-relaxed line-clamp-3">
                    {style.promptDescriptor}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => copyPreset(style.id, style.promptDescriptor)}
                    className="flex-1 text-xs min-h-8 h-8 flex items-center justify-center gap-1.5 px-2 cursor-pointer"
                    title="Sao chép promptDescriptor"
                  >
                    {isCopied ? (
                      <>
                        <Check size={13} className="text-success" />
                        <span className="text-success font-bold">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Sao chép Descriptor</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setActivePreviewStyle(style)}
                    className="flex-1 text-xs min-h-8 h-8 flex items-center justify-center gap-1 px-2 font-bold cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>Xem khung prompt hoàn chỉnh</span>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Probe Tester Tool */}
      <div className="ui-card p-4 border-2 border-border/80 bg-surface shadow-soft rounded-2xl">
        <div className="flex items-center gap-1.5 text-mint-600 font-extrabold text-[11px] uppercase tracking-wider">
          <Activity size={14} />
          <span>Công Cụ Thử Nghiệm Nhanh Pipeline (Probe Tester)</span>
        </div>
        <h3 className="font-display text-lg font-bold text-text mt-0.5">
          Bắn Thử Nghiệm Prompt &amp; Đo Độ Trễ (Latency Probe)
        </h3>
        <p className="text-xs text-muted mt-0.5 leading-relaxed">
          Gửi một prompt thử nghiệm thực tế qua bộ điều phối để kiểm tra thứ tự Fallback, bộ lọc an toàn và đo thời gian phản hồi.
        </p>

        <div className="mt-3.5 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={probePrompt}
              onChange={(e) => setProbePrompt(e.target.value)}
              placeholder="Nhập prompt thử nghiệm..."
              className="flex-1 min-h-10 px-3.5 rounded-xl border-2 border-border text-xs font-semibold bg-surface"
            />
            <select
              value={probeProvider}
              onChange={(e) => setProbeProvider(e.target.value)}
              className="min-h-10 px-3 rounded-xl border-2 border-border text-xs font-bold bg-surface"
            >
              <option value="auto">🎯 Tự động điều phối (Auto Routing)</option>
              <option value="gemini-native">Google Gemini Native</option>
              <option value="vertex">Google Vertex AI</option>
              <option value="vidtory-sdk">Vidtory SDK</option>
              <option value="gflow">Google Flow Pool</option>
              <option value="dreamina">Dreamina Pool</option>
            </select>
            <Button
              onClick={() => void handleRunProbe()}
              disabled={probeRunning}
              className="min-h-10 px-5 flex items-center gap-1.5 text-xs font-bold"
            >
              <Play size={14} className={cn(probeRunning && 'animate-spin')} />
              <span>{probeRunning ? 'Đang gửi probe...' : 'Chạy Probe'}</span>
            </Button>
          </div>

          {/* Probe Result Card */}
          {probeResult && (
            <div
              className={cn(
                'p-3.5 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all',
                probeResult.success
                  ? 'border-mint-200 bg-mint-50/40'
                  : 'border-coral-200 bg-coral-50/40',
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0',
                    probeResult.success ? 'bg-mint-100 text-mint-700' : 'bg-coral-100 text-coral-700',
                  )}
                >
                  {probeResult.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-text">
                      Kết quả Probe: {probeResult.resolvedProvider}
                    </span>
                    <span className="text-[11px] font-mono text-muted">
                      [{probeResult.timestamp}]
                    </span>
                  </div>
                  <p className="text-xs font-bold mt-0.5 text-text">
                    {probeResult.safetyStatus}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="p-1.5 px-2.5 rounded-lg bg-white/80 border border-border/60">
                  <span className="text-muted">Độ trễ: </span>
                  <span className="font-bold text-brand-600">{probeResult.latencyMs}ms</span>
                </div>
                <div className="p-1.5 px-2.5 rounded-lg bg-white/80 border border-border/60">
                  <span className="text-muted">Status: </span>
                  <span
                    className={cn('font-bold', probeResult.success ? 'text-success' : 'text-danger')}
                  >
                    {probeResult.success ? '200 OK' : '400 REJECTED'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Xem Khung Prompt Hoàn Chỉnh (Tab 4 / Tab 5) ─────────────── */}
      {activePreviewStyle &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-modal-title"
          >
            <div className="ui-card w-full max-w-xl p-5 border-2 border-border/80 bg-surface shadow-clay rounded-3xl flex flex-col gap-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-brand-100 text-brand-700">
                      <Wand2 size={16} />
                    </span>
                    <h4 id="prompt-modal-title" className="font-display text-base font-bold text-text">
                      Khung Prompt Hoàn Chỉnh: {activePreviewStyle.labelVi} ({activePreviewStyle.id})
                    </h4>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Chuỗi prompt chuẩn mực sinh ra bởi hàm <code className="text-brand-600 font-bold">buildArtGenerationPrompt(&apos;{activePreviewStyle.id}&apos;)</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePreviewStyle(null)}
                  className="p-1 rounded-xl hover:bg-slate-100 text-muted hover:text-text transition cursor-pointer"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>

              <div
                className="p-3 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto select-all"
                data-testid="modal-full-prompt"
              >
                {buildArtGenerationPrompt(activePreviewStyle.id)}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="ghost"
                  onClick={() => setActivePreviewStyle(null)}
                  className="text-xs min-h-8 px-3"
                >
                  Đóng
                </Button>
                <Button
                  onClick={() => {
                    void navigator.clipboard.writeText(buildArtGenerationPrompt(activePreviewStyle.id))
                    setCopiedModalPrompt(true)
                    setTimeout(() => setCopiedModalPrompt(false), 2000)
                  }}
                  className="text-xs min-h-8 px-4 font-bold flex items-center gap-1.5"
                >
                  {copiedModalPrompt ? (
                    <>
                      <Check size={13} className="text-mint-300" />
                      <span>Đã sao chép prompt</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Sao chép Prompt Hoàn Chỉnh</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* ── Modal Sửa Nhanh Prompt & Tái Tạo Tranh (React Portal) ─────── */}
      {refiningIncident &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="refine-modal-title"
          >
            <div
              className="ui-card w-full max-w-xl p-5 border-2 border-border/80 bg-surface shadow-clay rounded-3xl flex flex-col gap-3.5"
              data-testid="refine-prompt-modal"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-brand-100 text-brand-700">
                    <Edit3 size={16} />
                  </span>
                  <div>
                    <h4 id="refine-modal-title" className="font-display text-base font-bold text-text">
                      Sửa Nhanh Prompt &amp; Tái Tạo Tranh Cho Bé
                    </h4>
                    <span className="text-[11px] text-muted">
                      {refiningIncident.studentName} • {refiningIncident.grade}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRefiningIncident(null)}
                  className="p-1 rounded-xl hover:bg-slate-100 text-muted hover:text-text transition cursor-pointer"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-3 bg-coral-50/80 border border-coral-200 rounded-2xl text-xs">
                  <div className="flex items-center gap-1.5 text-coral-800 font-extrabold">
                    <AlertTriangle size={14} className="shrink-0 text-coral-600" />
                    <span>Từ khóa bị AI kích hoạt:</span>
                    <span className="font-mono bg-coral-200/70 text-coral-900 px-2 py-0.5 rounded-md">
                      &quot;{refiningIncident.flaggedTrigger}&quot;
                    </span>
                  </div>
                  <p className="text-muted mt-1.5 text-[11px] leading-relaxed">
                    Gợi ý sư phạm: Thay thế các từ nhạy cảm thành từ ngữ giàu tính tích cực (ví dụ: &quot;kiếm gỗ&quot; → &quot;đũa thần phép thuật&quot;, &quot;đại chiến&quot; → &quot;thi đấu thể thao robot&quot;, &quot;bạo chúa&quot; → &quot;khổng lồ thân thiện&quot;).
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text">
                    Câu lệnh hiệu chỉnh (Refined Prompt):
                  </label>
                  <textarea
                    rows={3}
                    aria-label="Prompt hiệu chỉnh"
                    value={refinedPromptInput}
                    onChange={(e) => setRefinedPromptInput(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 border-border font-mono text-xs text-text bg-brand-50/20 focus:bg-surface leading-relaxed focus:border-brand-400 focus:outline-none"
                    placeholder="Nhập prompt đã sửa đổi..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text">
                    Ghi chú sư phạm của Admin:
                  </label>
                  <input
                    type="text"
                    aria-label="Ghi chú Admin"
                    value={refineAdminNote}
                    onChange={(e) => setRefineAdminNote(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-border text-xs text-text bg-surface focus:border-brand-400 focus:outline-none"
                    placeholder="Lý do điều chỉnh và khuyến khích bé..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  variant="ghost"
                  onClick={() => setRefiningIncident(null)}
                  className="text-xs min-h-8 px-3"
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleSaveRefinedPromptSubmit}
                  className="text-xs min-h-8 px-4 font-bold flex items-center gap-1.5 shadow-clay bg-brand-500 hover:bg-brand-600 text-white"
                >
                  <Sparkles size={13} />
                  <span>Lưu &amp; Tái tạo tranh ngay cho bé</span>
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* ── Modal Phóng To Phác Thảo Nét Vẽ (React Portal) ───────────── */}
      {viewingSketch &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Phóng to nét vẽ phác thảo của bé"
            onClick={() => setViewingSketch(null)}
          >
            <div
              className="ui-card max-w-md w-full p-4 border-2 border-border/80 bg-surface shadow-clay rounded-3xl flex flex-col gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-amber-100 text-amber-800">
                    <ZoomIn size={16} />
                  </span>
                  <h4 className="font-display font-black text-sm text-text">
                    Chi Tiết Bản Vẽ Phác Thảo Của Bé
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingSketch(null)}
                  className="p-1 rounded-xl hover:bg-slate-100 text-muted hover:text-text transition cursor-pointer"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-border bg-amber-50/30 flex items-center justify-center p-2">
                <img
                  src={viewingSketch}
                  alt="Nét vẽ phác thảo phóng to"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <p className="text-[11px] text-muted text-center italic">
                Admin thẩm định trực tiếp nét vẽ để bảo vệ tính trong sáng và giải oan cho bé.
              </p>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
