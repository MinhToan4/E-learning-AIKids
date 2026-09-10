import React from 'react'
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Video as VideoIcon,
  Cpu,
  Volume2,
  Activity,
  Power,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import { KNOWN_PROVIDERS } from './types'

export interface AiStudioProvidersTabProps {
  loading: boolean
  saving: boolean
  disabledImageProviders: string[]
  keysState: Record<string, { key: string; masked: string | null; isConfigured: boolean }>
  setKeysState: React.Dispatch<
    React.SetStateAction<Record<string, { key: string; masked: string | null; isConfigured: boolean }>>
  >
  showKeyInput: Record<string, boolean>
  setShowKeyInput: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  pingStates: Record<string, { status: 'idle' | 'pinging' | 'ok' | 'fail'; latency?: number }>
  onRefresh: () => void
  onSaveKey: (providerId: string) => Promise<void>
  onTestPing: (providerId: string) => Promise<void>
  onToggleKillSwitch: (providerId: string) => Promise<void>
}

export function AiStudioProvidersTab({
  loading,
  saving,
  disabledImageProviders,
  keysState,
  setKeysState,
  showKeyInput,
  setShowKeyInput,
  pingStates,
  onRefresh,
  onSaveKey,
  onTestPing,
  onToggleKillSwitch,
}: AiStudioProvidersTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header Banner - Compact & Clean */}
      <div className="ui-card p-3.5 sm:p-4 border-2 border-border/80 bg-gradient-to-r from-brand-50/70 via-surface to-mint-50/40 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="max-w-2xl">
            <div className="flex items-center gap-1.5 text-brand-600 font-extrabold text-[11px] uppercase tracking-wider">
              <Sparkles size={14} />
              <span>StoryMee Multi-Provider Mesh Architecture</span>
            </div>
            <h2 className="font-display text-lg sm:text-xl font-bold text-text mt-0.5">
              Danh Mục Nhà Cung Cấp &amp; Quản Trị Khóa Kết Nối
            </h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              AI Kids vận hành kiến trúc đa nhà cung cấp: API chính hãng (Google Gemini Native, Vertex AI, OpenAI) &amp; Worker Pools (Google Flow, Dreamina, Suno). Tự động xoay tua khi có sự cố.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 min-h-8 px-3 text-xs"
          >
            <RefreshCw size={14} className={cn(loading && 'animate-spin')} />
            <span>Làm mới kết nối</span>
          </Button>
        </div>
      </div>

      {/* Providers Grid - High Density 3 columns on large screens */}
      <div className="grid gap-3.5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {KNOWN_PROVIDERS.map((provider) => {
          const isDisabled = disabledImageProviders.includes(provider.id)
          const keyData = keysState[provider.id]
          const ping = pingStates[provider.id]
          const isVertex = provider.id === 'vertex'
          const isConfigured =
            provider.kind === 'cookie_pool' || isVertex
              ? true
              : keyData?.isConfigured || Boolean(keyData?.masked)

          return (
            <div
              key={provider.id}
              className={cn(
                'ui-card flex flex-col justify-between p-3.5 border-2 rounded-2xl transition-all duration-200',
                isDisabled
                  ? 'border-coral-200 bg-coral-50/20'
                  : isConfigured
                    ? 'border-border/80 bg-surface shadow-soft'
                    : 'border-sun-200 bg-sun-50/20',
              )}
            >
              <div>
                {/* Top Row: Title & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base font-bold text-text truncate">
                      {provider.displayName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <p className="text-[11px] font-mono text-muted">ID: {provider.id}</p>
                      {isVertex && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-brand-100 text-brand-700 border border-brand-200/70">
                          GCP ADC / Service Account
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {isDisabled ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-coral-100 text-coral-700 border border-coral-200">
                        <AlertTriangle size={12} />
                        Tạm tắt (Kill-switch)
                      </span>
                    ) : isConfigured ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-mint-100 text-mint-700 border border-mint-200">
                        <CheckCircle2 size={12} />
                        Đang hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-sun-100 text-sun-800 border border-sun-200">
                        <AlertCircle size={12} />
                        Chưa có khóa
                      </span>
                    )}
                  </div>
                </div>

                {/* Capabilities & Badges */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {provider.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200/60"
                    >
                      {cap === 'image' && <ImageIcon size={11} />}
                      {cap === 'video' && <VideoIcon size={11} />}
                      {cap === 'llm' && <Cpu size={11} />}
                      {cap === 'audio' && <Volume2 size={11} />}
                      {cap}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-muted bg-slate-100">
                    {provider.kind === 'api_key'
                      ? 'API Key Trực tiếp'
                      : provider.kind === 'sdk'
                        ? 'SDK Gateway'
                        : provider.kind === 'service_account'
                          ? 'GCP Service Account'
                          : 'Extension Cookie Pool'}
                  </span>
                </div>

                <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">
                  {provider.description}
                </p>

                {/* Endpoint / Model / Project Info */}
                <div className="mt-2.5 p-2 rounded-xl bg-brand-50/40 border border-border/60 text-[11px] font-mono text-muted space-y-1">
                  {isVertex ? (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text">Dự án GCP:</span>
                      <span className="font-bold text-brand-600">Project: 1091492607886 · us-central1</span>
                    </div>
                  ) : (
                    <>
                      {provider.defaultModel && (
                        <div className="flex items-center justify-between">
                          <span>Mô hình mặc định:</span>
                          <span className="font-bold text-text truncate ml-1">{provider.defaultModel}</span>
                        </div>
                      )}
                      {provider.endpoint && (
                        <div className="flex items-center justify-between truncate">
                          <span>Endpoint:</span>
                          <span className="font-semibold text-brand-600 truncate ml-1">
                            {provider.endpoint}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Key Management & Controls */}
              <div className="mt-3 pt-2.5 border-t border-border/60 flex flex-col gap-2">
                {/* Key Input / Masked hint */}
                {provider.kind !== 'cookie_pool' ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-text">
                        {isVertex ? 'GCP Credential:' : 'Khóa API / Credential:'}
                      </span>
                      {keyData?.masked && (
                        <span className="font-mono text-muted text-[11px]">{keyData.masked}</span>
                      )}
                    </div>

                    {showKeyInput[provider.id] ? (
                      <div className="flex gap-1.5">
                        <input
                          type="password"
                          placeholder={provider.keyPlaceholder || 'Nhập API key...'}
                          value={keysState[provider.id]?.key || ''}
                          onChange={(e) =>
                            setKeysState((prev) => ({
                              ...prev,
                              [provider.id]: {
                                ...(prev[provider.id] || { masked: null, isConfigured: false }),
                                key: e.target.value,
                              },
                            }))
                          }
                          className="flex-1 min-h-8 px-2.5 rounded-xl border-2 border-border font-mono text-xs bg-surface"
                        />
                        <Button
                          onClick={() => void onSaveKey(provider.id)}
                          disabled={saving}
                          className="min-h-8 px-2.5 text-xs"
                        >
                          Lưu
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setShowKeyInput((prev) => ({ ...prev, [provider.id]: false }))
                          }
                          className="min-h-8 px-2 text-xs"
                        >
                          Hủy
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setShowKeyInput((prev) => ({ ...prev, [provider.id]: true }))
                        }
                        className="text-left text-xs font-bold text-brand-600 hover:text-brand-700 underline"
                      >
                        {isConfigured
                          ? (isVertex ? 'Thay đổi Service Account / Key' : 'Thay đổi khóa API khác')
                          : '+ Thêm khóa API mới'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-muted flex items-center justify-between">
                    <span>Trạng thái Pool:</span>
                    <span className="font-bold text-success text-[11px]">Khả dụng (Worker Mesh sẵn sàng)</span>
                  </div>
                )}

                {/* Action Buttons: Ping & Kill-switch */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void onTestPing(provider.id)}
                    disabled={ping?.status === 'pinging'}
                    className="text-xs min-h-7.5 h-7 px-2.5 flex items-center gap-1.5"
                  >
                    <Activity
                      size={13}
                      className={cn(ping?.status === 'pinging' && 'animate-spin text-brand-600')}
                    />
                    <span>
                      {ping?.status === 'ok'
                        ? `${ping.latency}ms (OK)`
                        : ping?.status === 'fail'
                          ? 'Lỗi ping'
                          : 'Test Ping'}
                    </span>
                  </Button>

                  {provider.capabilities.includes('image') && (
                    <button
                      type="button"
                      onClick={() => void onToggleKillSwitch(provider.id)}
                      className={cn(
                        'inline-flex items-center gap-1 min-h-7.5 h-7 px-2.5 rounded-xl font-bold text-xs transition border-2',
                        isDisabled
                          ? 'bg-coral-100 text-coral-700 border-coral-300 hover:bg-coral-200'
                          : 'bg-surface text-muted border-border hover:bg-slate-100',
                      )}
                      title={isDisabled ? 'Bật lại' : 'Ngắt khẩn cấp'}
                    >
                      <Power size={12} className={isDisabled ? 'text-coral-600' : 'text-success'} />
                      <span>{isDisabled ? 'Đang Tắt (Bật lại)' : 'Ngắt khẩn cấp'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
