import React, { useState, useMemo } from 'react'
import {
  Sliders,
  ArrowUp,
  ArrowDown,
  Power,
  Image as ImageIcon,
  Sparkles,
  Wand2,
  RefreshCw,
  Check,
  Copy,
  Video as VideoIcon,
  Cpu,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import { ART_STYLES } from '@/shared/lib/creation/creative'
import {
  KNOWN_PROVIDERS,
  DEFAULT_PROMPT_PREFIX,
  DEFAULT_PROMPT_SUFFIX,
  type ImageEngineConfig,
  type VideoEngineConfig,
  type LlmEngineConfig,
} from './types'

export interface AiStudioRoutingTabProps {
  saving: boolean
  disabledImageProviders: string[]
  imageFallbackChain: string[]
  imageConfig: ImageEngineConfig
  setImageConfig: React.Dispatch<React.SetStateAction<ImageEngineConfig>>
  videoConfig: VideoEngineConfig
  setVideoConfig: React.Dispatch<React.SetStateAction<VideoEngineConfig>>
  llmConfig: LlmEngineConfig
  setLlmConfig: React.Dispatch<React.SetStateAction<LlmEngineConfig>>
  onSaveRouting: () => Promise<void>
  onMovePriority: (index: number, direction: 'up' | 'down') => void
  onToggleKillSwitch: (providerId: string) => Promise<void>
}

export function AiStudioRoutingTab({
  saving,
  disabledImageProviders,
  imageFallbackChain,
  imageConfig,
  setImageConfig,
  videoConfig,
  setVideoConfig,
  llmConfig,
  setLlmConfig,
  onSaveRouting,
  onMovePriority,
  onToggleKillSwitch,
}: AiStudioRoutingTabProps) {
  const [isEditingPromptFrame, setIsEditingPromptFrame] = useState(false)
  const [copiedLivePrompt, setCopiedLivePrompt] = useState(false)

  // Current selected art style definition from SSOT
  const currentStyleDef = useMemo(() => {
    return (
      ART_STYLES.find((s) => s.id === imageConfig.stylePreset) ||
      ART_STYLES.find((s) => s.id === 'clay') ||
      ART_STYLES[0]
    )
  }, [imageConfig.stylePreset])

  return (
    <div className="flex flex-col gap-4">
      {/* Fallback Chain Section - Compact & Streamlined */}
      <div className="ui-card p-4 border-2 border-border/80 bg-surface shadow-soft rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-brand-600 font-extrabold text-[11px] uppercase tracking-wider">
              <Sliders size={14} />
              <span>Image Generation Fallback Chain</span>
            </div>
            <h3 className="font-display text-lg font-bold text-text mt-0.5">
              Chuỗi Dự Phòng Tạo Ảnh Tự Động (Fallback Pipeline)
            </h3>
            <p className="text-xs text-muted mt-0.5 leading-relaxed max-w-2xl">
              Khi học sinh yêu cầu tạo ảnh minh họa bài học hoặc truyện tranh, hệ thống sẽ gửi yêu cầu tới
              nhà cung cấp đứng đầu danh sách. Nếu gặp lỗi quá tải (429) hoặc timeout, bộ điều phối sẽ tự động
              chuyển tiếp sang nhà cung cấp kế tiếp trong chuỗi.
            </p>
          </div>

          <Button onClick={() => void onSaveRouting()} disabled={saving} className="min-h-9 px-4 text-xs font-bold">
            Lưu luồng điều phối
          </Button>
        </div>

        {/* Pipeline Visual Flow - Sleek 42px row height */}
        <div className="mt-4 flex flex-col gap-2">
          {imageFallbackChain.map((providerId, index) => {
            const meta = KNOWN_PROVIDERS.find((p) => p.id === providerId)
            const isDisabled = disabledImageProviders.includes(providerId)

            return (
              <div
                key={providerId}
                className={cn(
                  'flex items-center justify-between p-2.5 px-3.5 rounded-xl border-2 transition-all duration-200',
                  isDisabled
                    ? 'border-coral-200 bg-coral-50/40 opacity-75'
                    : index === 0
                      ? 'border-brand-300 bg-brand-50/40 shadow-clay'
                      : 'border-border/80 bg-surface',
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Step Number Badge */}
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center font-display font-black text-xs shrink-0',
                      index === 0
                        ? 'bg-brand-500 text-white shadow-soft'
                        : 'bg-slate-200 text-slate-700',
                    )}
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-sm text-text">
                        {meta?.displayName || providerId}
                      </span>
                      {index === 0 && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-brand-100 text-brand-700 uppercase">
                          Ưu tiên #1
                        </span>
                      )}
                      {isDisabled && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-coral-100 text-coral-700">
                          Đã ngắt (Kill-switch)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted truncate">
                      {providerId === 'gflow'
                        ? 'Miễn phí chi phí qua Chrome Worker Pool'
                        : providerId === 'gemini-native'
                          ? 'Google AI Studio Native — 1.5s latency'
                          : providerId === 'vidtory-sdk'
                            ? 'Vidtory Cloud Mesh — Dự phòng tin cậy'
                            : providerId === 'vertex'
                              ? 'GCP Vertex AI VIP Quota (1091492607886)'
                              : 'Dreamina Worker Pool'}
                    </p>
                  </div>
                </div>

                {/* Up / Down & Kill-switch Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onMovePriority(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg border-2 border-border hover:bg-brand-50 text-text disabled:opacity-30 disabled:pointer-events-none transition"
                    title="Tăng thứ tự ưu tiên"
                    aria-label={`Tăng ưu tiên cho ${providerId}`}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMovePriority(index, 'down')}
                    disabled={index === imageFallbackChain.length - 1}
                    className="p-1.5 rounded-lg border-2 border-border hover:bg-brand-50 text-text disabled:opacity-30 disabled:pointer-events-none transition"
                    title="Giảm thứ tự ưu tiên"
                    aria-label={`Giảm ưu tiên cho ${providerId}`}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void onToggleKillSwitch(providerId)}
                    className={cn(
                      'p-1.5 rounded-lg border-2 transition',
                      isDisabled
                        ? 'border-coral-300 bg-coral-100 text-coral-700'
                        : 'border-border text-muted hover:bg-slate-100',
                    )}
                    title={isDisabled ? 'Bật lại' : 'Ngắt khẩn cấp'}
                    aria-label={`Bật tắt ${providerId}`}
                  >
                    <Power size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3 Engines Grid: 🎨 Image Engine | 🎬 Video Engine | 🧠 LLM Engine */}
      <div className="grid gap-3.5 grid-cols-1 lg:grid-cols-3">
        {/* Card 1: 🎨 Image Engine */}
        <div className="ui-card p-4 border-2 border-border/80 bg-surface shadow-soft rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-brand-600 font-extrabold text-[11px] uppercase tracking-wider">
              <ImageIcon size={14} />
              <span>Cấu hình Tạo Ảnh (Image Engine)</span>
            </div>
            <h4 className="font-display text-base font-bold text-text mt-0.5">
              Động Cơ Tạo Ảnh Chính &amp; Phong Cách
            </h4>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              Thiết lập chuẩn xuất ảnh minh họa bài giảng ASMO, truyện tranh Mèo Mee.
            </p>

            <div className="mt-3.5 space-y-3">
              <label className="flex flex-col gap-1 text-xs font-bold text-text">
                Nhà cung cấp ảnh chính
                <select
                  aria-label="Nhà cung cấp ảnh chính"
                  className="min-h-9 rounded-xl border-2 border-border px-2.5 text-xs font-semibold bg-surface"
                  value={imageConfig.provider}
                  onChange={(e) => setImageConfig((prev) => ({ ...prev, provider: e.target.value }))}
                >
                  <option value="gemini-native">
                    Google Gemini Native (AI Studio - Nhanh nhất &amp; Trực tiếp)
                  </option>
                  <option value="gflow">
                    Google Flow (Worker Extension - Tiết kiệm chi phí)
                  </option>
                  <option value="vertex">
                    Google Vertex AI (Enterprise / GCP Quota lớn)
                  </option>
                  <option value="vidtory-sdk">
                    Vidtory SDK (Imagen-3 Network)
                  </option>
                  <option value="dreamina">
                    Dreamina (Worker Extension nghệ thuật)
                  </option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs font-bold text-text">
                  Tỷ lệ khung hình
                  <select
                    aria-label="Tỷ lệ khung hình ảnh"
                    className="min-h-9 rounded-xl border-2 border-border px-2 text-xs bg-surface"
                    value={imageConfig.aspectRatio}
                    onChange={(e) => setImageConfig((prev) => ({ ...prev, aspectRatio: e.target.value }))}
                  >
                    <option value="1:1">Vuông 1:1 (Ảnh bài học / Avatar)</option>
                    <option value="16:9">Ngang 16:9 (Tranh bài giảng)</option>
                    <option value="9:16">Dọc 9:16 (Truyện tranh điện thoại)</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-text">
                  Độ phân giải
                  <select
                    aria-label="Độ phân giải ảnh"
                    className="min-h-9 rounded-xl border-2 border-border px-2 text-xs bg-surface"
                    value={imageConfig.resolution}
                    onChange={(e) => setImageConfig((prev) => ({ ...prev, resolution: e.target.value }))}
                  >
                    <option value="1K">1K (1024x1024 - Khuyên dùng)</option>
                    <option value="2K">2K (Chất lượng cao)</option>
                    <option value="4K">4K (Siêu nét)</option>
                  </select>
                </label>
              </div>

              {/* Phong cách mỹ thuật - 14 SSOT Art Styles */}
              <label className="flex flex-col gap-1 text-xs font-bold text-text">
                Phong cách mỹ thuật chủ đạo
                <select
                  aria-label="Phong cách mỹ thuật"
                  className="min-h-9 rounded-xl border-2 border-border px-2.5 text-xs bg-surface font-semibold text-text"
                  value={imageConfig.stylePreset}
                  onChange={(e) => setImageConfig((prev) => ({ ...prev, stylePreset: e.target.value }))}
                >
                  {ART_STYLES.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.labelVi} — {style.tip}
                    </option>
                  ))}
                </select>
              </label>

              {/* Badge phong cách đang chọn */}
              <div className="p-2.5 rounded-xl bg-brand-50/70 border border-brand-200/80 text-xs flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="font-bold text-brand-800 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-brand-600 shrink-0" />
                    <span>{currentStyleDef.labelVi}</span>
                    <span className="text-[11px] font-medium text-brand-600">({currentStyleDef.tip})</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-brand-700 border border-brand-200">
                    ID: {currentStyleDef.id}
                  </span>
                </div>
                <p className="text-[11px] text-muted line-clamp-2 italic">
                  &ldquo;{currentStyleDef.promptDescriptor}&rdquo;
                </p>
              </div>

              {/* Checkbox Options */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="flex items-center gap-2 text-xs text-text font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={imageConfig.autoCompressWebp}
                    onChange={(e) =>
                      setImageConfig((prev) => ({ ...prev, autoCompressWebp: e.target.checked }))
                    }
                    className="w-4 h-4 rounded-md border-2 border-border text-brand-600 accent-brand-500 cursor-pointer"
                  />
                  <span>Tối ưu nén WebP cho thiếu nhi (&lt;1.5s)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-text font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={imageConfig.autoWrapPrompt}
                    onChange={(e) =>
                      setImageConfig((prev) => ({ ...prev, autoWrapPrompt: e.target.checked }))
                    }
                    className="w-4 h-4 rounded-md border-2 border-border text-brand-600 accent-brand-500 cursor-pointer"
                  />
                  <span>Tự động lồng khung prompt thiếu nhi cho app.aikid.vn &amp; play.aikid.vn</span>
                </label>
              </div>

              {/* Khối Khung Prompt Phong Cách (Prompt Framework) */}
              <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text flex items-center gap-1.5">
                    <Wand2 size={13} className="text-brand-600" />
                    Khung Prompt Phong Cách (Prompt Framework)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingPromptFrame((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 underline cursor-pointer"
                  >
                    <Sliders size={12} />
                    <span>{isEditingPromptFrame ? 'Thu gọn khung prompt' : 'Tùy biến khung prompt (Prefix & Suffix)'}</span>
                  </button>
                </div>

                {isEditingPromptFrame && (
                  <div className="flex flex-col gap-2.5 p-2.5 rounded-xl bg-brand-50/40 border border-brand-200/60 animate-in fade-in duration-150">
                    {/* Prefix */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-text flex items-center justify-between">
                        <span>Tiền tố / Base Instruction</span>
                        <span className="text-[10px] font-normal text-muted">Mô tả tác vụ phác thảo</span>
                      </label>
                      <textarea
                        aria-label="Tiền tố prompt"
                        rows={2}
                        value={imageConfig.promptPrefix}
                        onChange={(e) =>
                          setImageConfig((prev) => ({ ...prev, promptPrefix: e.target.value }))
                        }
                        className="w-full p-2 rounded-lg border-2 border-border text-[11px] font-mono leading-relaxed bg-surface"
                        placeholder="Nhập tiền tố / Base Instruction..."
                      />
                    </div>

                    {/* Slot chip phong cách */}
                    <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-xs">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
                        <Sparkles size={12} />
                        <span>Vị trí chèn phong cách</span>
                      </div>
                      <p className="font-mono text-[11px] text-amber-900 mt-1 break-words">
                        <span className="font-bold">{'{styleDescriptor}'}:</span> &ldquo;{currentStyleDef?.promptDescriptor || ''}&rdquo;
                      </p>
                    </div>

                    {/* Suffix */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-text flex items-center justify-between">
                        <span>Hậu tố An toàn &amp; Hoàn thiện</span>
                        <span className="text-[10px] font-normal text-muted">Tiêu chuẩn nét vẽ &amp; an toàn thiếu nhi</span>
                      </label>
                      <textarea
                        aria-label="Hậu tố prompt"
                        rows={3}
                        value={imageConfig.promptSuffix}
                        onChange={(e) =>
                          setImageConfig((prev) => ({ ...prev, promptSuffix: e.target.value }))
                        }
                        className="w-full p-2 rounded-lg border-2 border-border text-[11px] font-mono leading-relaxed bg-surface"
                        placeholder="Nhập hậu tố an toàn & hoàn thiện..."
                      />
                    </div>

                    {/* Reset template button */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                          setImageConfig((prev) => ({
                            ...prev,
                            promptPrefix: DEFAULT_PROMPT_PREFIX,
                            promptSuffix: DEFAULT_PROMPT_SUFFIX,
                          }))
                        }
                        className="min-h-7.5 h-7 px-2.5 text-xs flex items-center gap-1"
                      >
                        <RefreshCw size={12} />
                        <span>Khôi phục mẫu chuẩn app.aikid.vn</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Live Prompt Preview */}
                <div className="p-2.5 rounded-xl bg-slate-900 text-slate-100 border border-slate-800">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                      <Sparkles size={11} className="text-sun-400" />
                      Live Prompt Preview
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const fullPrompt = `${imageConfig.promptPrefix} ${currentStyleDef?.promptDescriptor || ''}. ${imageConfig.promptSuffix}`
                        void navigator.clipboard.writeText(fullPrompt)
                        setCopiedLivePrompt(true)
                        setTimeout(() => setCopiedLivePrompt(false), 2000)
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-300 hover:text-white transition cursor-pointer"
                      aria-label="Sao chép prompt hoàn chỉnh"
                    >
                      {copiedLivePrompt ? (
                        <>
                          <Check size={12} className="text-mint-400" />
                          <span className="text-mint-400">Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Sao chép prompt hoàn chỉnh</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div
                    className="font-mono text-[11px] leading-relaxed text-slate-200 select-all break-words max-h-24 overflow-y-auto"
                    data-testid="live-prompt-preview"
                  >
                    {`${imageConfig.promptPrefix} ${currentStyleDef?.promptDescriptor || ''}. ${imageConfig.promptSuffix}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: 🎬 Video Engine */}
        <div className="ui-card p-4 border-2 border-border/80 bg-surface shadow-soft rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-mint-600 font-extrabold text-[11px] uppercase tracking-wider">
              <VideoIcon size={14} />
              <span>Cấu hình Tạo Video (Video Engine)</span>
            </div>
            <h4 className="font-display text-base font-bold text-text mt-0.5">
              Động Cơ Video Veo &amp; Narwhal
            </h4>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              Thiết lập chuẩn xuất hoạt cảnh cho các nhân vật AI Kids và hoạt cảnh bài học ASMO.
            </p>

            <div className="mt-3.5 space-y-3">
              <label className="flex flex-col gap-1 text-xs font-bold text-text">
                Nhà cung cấp video chính
                <select
                  aria-label="Nhà cung cấp video chính"
                  className="min-h-9 rounded-xl border-2 border-border px-2.5 text-xs font-semibold bg-surface"
                  value={videoConfig.provider}
                  onChange={(e) => setVideoConfig((v) => ({ ...v, provider: e.target.value }))}
                >
                  <option value="gflow">Google Flow (Veo Extension Worker)</option>
                  <option value="dreamina">Dreamina Video Engine</option>
                  <option value="vidtory-sdk">Vidtory SDK Cloud Veo</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs font-bold text-text">
                  Tỷ lệ khung hình
                  <select
                    aria-label="Tỷ lệ khung hình video"
                    className="min-h-9 rounded-xl border-2 border-border px-2 text-xs bg-surface"
                    value={videoConfig.aspectRatio}
                    onChange={(e) => setVideoConfig((v) => ({ ...v, aspectRatio: e.target.value }))}
                  >
                    <option value="16:9">Ngang 16:9 (Máy tính / TV)</option>
                    <option value="9:16">Dọc 9:16 (Điện thoại / iPad)</option>
                    <option value="1:1">Vuông 1:1 (Avatar truyện)</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-bold text-text">
                  Độ phân giải
                  <select
                    aria-label="Độ phân giải video"
                    className="min-h-9 rounded-xl border-2 border-border px-2 text-xs bg-surface"
                    value={videoConfig.resolution}
                    onChange={(e) => setVideoConfig((v) => ({ ...v, resolution: e.target.value }))}
                  >
                    <option value="1K">1K (1080p - Mặc định)</option>
                    <option value="2K">2K HD (Sắc nét)</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1 text-xs font-bold text-text">
                Thời lượng mỗi video ({videoConfig.duration}s)
                <input
                  type="range"
                  min={4}
                  max={10}
                  step={1}
                  value={videoConfig.duration}
                  onChange={(e) => setVideoConfig((v) => ({ ...v, duration: Number(e.target.value) }))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted">
                  <span>4s (Nhanh)</span>
                  <span>6s (Chuẩn)</span>
                  <span>8s</span>
                  <span>10s (Dài)</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Card 3: 🧠 LLM & Tutor Mèo Mee */}
        <div className="ui-card p-4 border-2 border-border/80 bg-surface shadow-soft rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-brand-600 font-extrabold text-[11px] uppercase tracking-wider">
              <Cpu size={14} />
              <span>Trợ Giảng AI &amp; Mô Hình Ngôn Ngữ</span>
            </div>
            <h4 className="font-display text-base font-bold text-text mt-0.5">
              Bộ Não Sư Phạm Mèo Mee
            </h4>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              Điều phối mô hình thông minh cho đố vui, giải thích thuật toán và gợi ý bài tập ASMO.
            </p>

            <div className="mt-3.5 space-y-3">
              <label className="flex flex-col gap-1 text-xs font-bold text-text">
                Mô hình ưu tiên
                <select
                  aria-label="Mô hình ngôn ngữ ưu tiên"
                  className="min-h-9 rounded-xl border-2 border-border px-2.5 text-xs font-semibold bg-surface"
                  value={llmConfig.model}
                  onChange={(e) => setLlmConfig((l) => ({ ...l, model: e.target.value }))}
                >
                  <option value="gemini-2.5-flash">
                    🌟 Google Gemini 2.5 Flash (Nhanh, thông minh, tiết kiệm)
                  </option>
                  <option value="gpt-4o-mini">
                    ⚡ OpenAI GPT-4o Mini (Logic toán ASMO chuyên sâu)
                  </option>
                  <option value="vidtory">🔌 Vidtory AI Core</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold text-text">
                Độ sáng tạo (Temperature: {llmConfig.temperature})
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  value={llmConfig.temperature}
                  onChange={(e) => setLlmConfig((l) => ({ ...l, temperature: Number(e.target.value) }))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted">
                  <span>0.1 (Chính xác / Toán)</span>
                  <span>0.5 (Cân bằng)</span>
                  <span>1.0 (Kể chuyện)</span>
                </div>
              </label>

              <label className="flex flex-col gap-1 text-xs font-bold text-text">
                Độ dài phản hồi tối đa
                <select
                  aria-label="Độ dài phản hồi tối đa"
                  className="min-h-9 rounded-xl border-2 border-border px-2.5 text-xs bg-surface"
                  value={llmConfig.maxTokens}
                  onChange={(e) => setLlmConfig((l) => ({ ...l, maxTokens: Number(e.target.value) }))}
                >
                  <option value={512}>512 tokens (~150 từ - Gọn gàng)</option>
                  <option value={1024}>1024 tokens (~300 từ - Đầy đủ các bước giải)</option>
                  <option value={2048}>2048 tokens (~600 từ - Bài giảng chuyên sâu)</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
