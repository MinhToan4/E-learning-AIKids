import React, { useState } from 'react'
import { Upload, Trash2, Loader2, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'

export interface CmsImageUploaderProps {
  label?: string
  sublabel?: string
  icon?: string | React.ReactNode
  imageUrl?: string | null
  imageAlt?: string
  aspectRatio?: 'video' | 'square' | '4/3' | '16/10' | 'auto'
  maxHeight?: string
  readOnly?: boolean
  isUploading?: boolean
  uploadPurpose?: string
  questId?: string
  showUrlInput?: boolean
  urlPlaceholder?: string
  compact?: boolean
  tone?: 'emerald' | 'sky' | 'amber' | 'brand' | 'slate'
  onImageChange: (url: string) => void
  onUploadFile?: (file: File) => Promise<void> | void
  showToast?: (message: string, tone?: 'success' | 'error' | 'info') => void
  inputStyle?: React.CSSProperties
  className?: string
}

/**
 * CmsImageUploader — Chuẩn hóa trải nghiệm Tải & Quản lý Ảnh trong CMS Giảng viên.
 * Đảm bảo 100% đồng bộ giao diện, nút bấm, biểu tượng Upload/Xóa và URL input
 * trên toàn bộ các khối bài học (Hero, Compare, Versus A/B, Poster, 2 Cột, Quiz, Badge...).
 */
export function CmsImageUploader({
  label,
  sublabel,
  icon = '🖼️',
  imageUrl,
  imageAlt = 'Hình ảnh minh họa',
  aspectRatio = 'auto',
  maxHeight = '320px',
  readOnly = false,
  isUploading: externalUploading = false,
  uploadPurpose = 'block_image',
  questId,
  showUrlInput = true,
  urlPlaceholder = 'https://... hoặc /assets/...',
  compact = false,
  tone = 'emerald',
  onImageChange,
  onUploadFile,
  showToast,
  inputStyle,
  className,
}: CmsImageUploaderProps) {
  const [internalUploading, setInternalUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const isUploading = externalUploading || internalUploading

  const handleProcessFile = async (file: File) => {
    if (readOnly || isUploading) return
    if (!file.type.startsWith('image/')) {
      showToast?.('Vui lòng chọn định dạng file ảnh (PNG, JPG, WEBP, GIF)', 'error')
      return
    }

    if (onUploadFile) {
      await onUploadFile(file)
      return
    }

    setInternalUploading(true)
    try {
      const res = await uploadCmsCourseMedia({
        file,
        purpose: uploadPurpose,
        questId,
      })
      if (res?.url) {
        onImageChange(res.url)
        showToast?.('Đã tải ảnh lên thành công!', 'success')
      } else {
        throw new Error('Không nhận được URL ảnh từ máy chủ')
      }
    } catch (err) {
      showToast?.(`Lỗi tải ảnh: ${err instanceof Error ? err.message : 'Không xác định'}`, 'error')
    } finally {
      setInternalUploading(false)
    }
  }

  const toneConfig = {
    emerald: {
      border: 'border-emerald-200',
      bgLight: 'bg-emerald-50/40',
      tagBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      btnSecondary: 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900',
      btnPrimary: 'border-emerald-400 bg-emerald-600 hover:bg-emerald-700 text-white',
      accent: 'text-emerald-700',
      dashed: 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-400',
    },
    sky: {
      border: 'border-sky-200',
      bgLight: 'bg-sky-50/40',
      tagBg: 'bg-sky-100 text-sky-900 border-sky-300',
      btnSecondary: 'border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-900',
      btnPrimary: 'border-sky-400 bg-sky-600 hover:bg-sky-700 text-white',
      accent: 'text-sky-700',
      dashed: 'border-sky-300 bg-sky-50/30 hover:border-sky-400',
    },
    amber: {
      border: 'border-amber-200',
      bgLight: 'bg-amber-50/40',
      tagBg: 'bg-amber-100 text-amber-900 border-amber-300',
      btnSecondary: 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900',
      btnPrimary: 'border-amber-400 bg-amber-600 hover:bg-amber-700 text-white',
      accent: 'text-amber-700',
      dashed: 'border-amber-300 bg-amber-50/30 hover:border-amber-400',
    },
    brand: {
      border: 'border-brand-200',
      bgLight: 'bg-brand-50/40',
      tagBg: 'bg-brand-100 text-brand-900 border-brand-300',
      btnSecondary: 'border-brand-300 bg-brand-50 hover:bg-brand-100 text-brand-900',
      btnPrimary: 'border-brand-400 bg-brand-600 hover:bg-brand-700 text-white',
      accent: 'text-brand-700',
      dashed: 'border-brand-300 bg-brand-50/30 hover:border-brand-400',
    },
    slate: {
      border: 'border-slate-200',
      bgLight: 'bg-slate-50/40',
      tagBg: 'bg-slate-100 text-slate-800 border-slate-300',
      btnSecondary: 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800',
      btnPrimary: 'border-slate-300 bg-slate-800 hover:bg-slate-900 text-white',
      accent: 'text-slate-700',
      dashed: 'border-slate-300 bg-slate-50/30 hover:border-slate-400',
    },
  }[tone]

  const aspectClass = {
    video: 'aspect-video',
    square: 'aspect-square',
    '4/3': 'aspect-4/3',
    '16/10': 'aspect-16/10',
    auto: 'min-h-[160px]',
  }[aspectRatio]

  // ── 1. GIAO DIỆN COMPACT (THẺ PHƯƠNG ÁN / HUY HIỆU / Ô BẢNG NHỎ) ──
  if (compact) {
    return (
      <div className={cn('relative space-y-1.5', className)}>
        {imageUrl ? (
          <div className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 min-h-[120px] max-h-[180px] flex items-center justify-center shadow-2xs">
            <img
              src={imageUrl}
              alt={imageAlt}
              className="size-full object-contain p-2"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            {!readOnly && (
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs p-2">
                <label className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-black text-slate-800 shadow-md hover:bg-slate-50 cursor-pointer active:scale-95 transition whitespace-nowrap">
                  {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  <span>{isUploading ? 'Đang tải…' : 'Đổi ảnh'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void handleProcessFile(file)
                      e.currentTarget.value = ''
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onImageChange('')}
                  className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-2.5 py-1.5 text-xs font-black text-white shadow-md hover:bg-rose-700 cursor-pointer active:scale-95 transition whitespace-nowrap"
                  title="Xóa ảnh"
                >
                  <Trash2 size={13} />
                  <span>Xóa</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          !readOnly && (
            <label className={cn(
              'flex items-center justify-center gap-2 py-2 px-3 rounded-2xl border-2 border-dashed transition cursor-pointer active:scale-95 shadow-2xs',
              toneConfig.dashed,
              isUploading && 'opacity-60 cursor-not-allowed'
            )}>
              {isUploading ? <Loader2 size={14} className="animate-spin text-brand-600" /> : <Upload size={14} className={toneConfig.accent} />}
              <span className="text-xs font-extrabold text-slate-700">
                {isUploading ? 'Đang tải lên…' : '+ Tải ảnh lên'}
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleProcessFile(file)
                  e.currentTarget.value = ''
                }}
              />
            </label>
          )
        )}
      </div>
    )
  }

  // ── 2. GIAO DIỆN STANDARD (HERO IMAGE, 2 CỘT, SO SÁNH A/B, POSTER...) ──
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        if (!readOnly && !isUploading) setIsDragOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragOver(false)
        if (readOnly || isUploading) return
        const file = e.dataTransfer.files?.[0]
        if (file) void handleProcessFile(file)
      }}
      className={cn(
        'rounded-2xl border-2 bg-white p-3.5 sm:p-4 shadow-2xs transition-all duration-150 space-y-3',
        toneConfig.border,
        isDragOver && 'border-brand-500 ring-4 ring-brand-200/50 bg-brand-50/30 scale-[1.005]',
        className
      )}
    >
      {/* Header (nếu có nhãn) */}
      {(label || sublabel) && (
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-1.5">
            {typeof icon === 'string' ? <span className="text-base">{icon}</span> : icon}
            <div>
              {label && (
                <h5 className="text-xs font-black uppercase tracking-wide text-slate-900">
                  {label}
                </h5>
              )}
              {sublabel && (
                <p className="text-[11px] text-slate-500 font-medium">
                  {sublabel}
                </p>
              )}
            </div>
          </div>

          {imageUrl && !readOnly && (
            <button
              type="button"
              onClick={() => onImageChange('')}
              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/80 px-2.5 py-1 text-[11px] font-extrabold text-rose-700 hover:bg-rose-100 transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95"
              title="Xóa ảnh này"
            >
              <Trash2 size={13} className="shrink-0" />
              <span>Xóa ảnh</span>
            </button>
          )}
        </div>
      )}

      {/* Preview hoặc Khung Tải lên Trống */}
      {imageUrl ? (
        <div className="space-y-3">
          {/* Vùng xem trước ảnh */}
          <div
            style={{ maxHeight }}
            className={cn(
              'relative overflow-hidden rounded-xl border p-2 text-center flex items-center justify-center shadow-2xs',
              toneConfig.border,
              toneConfig.bgLight,
              aspectClass
            )}
          >
            <img
              src={imageUrl}
              alt={imageAlt}
              style={{ maxHeight: `calc(${maxHeight} - 1rem)` }}
              className="w-auto max-w-full rounded-lg object-contain mx-auto shadow-2xs"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>

          {/* Dòng điều khiển: URL input & Nút Thay ảnh đồng bộ */}
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            {showUrlInput ? (
              <label className="block text-[11px] font-extrabold text-slate-600">
                <span>URL Hình ảnh</span>
                <input
                  type="url"
                  readOnly={readOnly}
                  value={imageUrl ?? ''}
                  onChange={(e) => onImageChange(e.target.value)}
                  style={{ ...inputStyle, marginTop: '0.2rem' }}
                  placeholder={urlPlaceholder}
                />
              </label>
            ) : (
              <div />
            )}

            {!readOnly && (
              <div className="flex items-end shrink-0">
                <label
                  className={cn(
                    'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border-2 px-3.5 text-xs font-black transition cursor-pointer shrink-0 whitespace-nowrap shadow-2xs active:scale-95',
                    toneConfig.btnSecondary,
                    isUploading && 'opacity-70 cursor-not-allowed'
                  )}
                >
                  {isUploading ? (
                    <Loader2 size={14} className="animate-spin shrink-0" />
                  ) : (
                    <Upload size={14} className="shrink-0" />
                  )}
                  <span>{isUploading ? 'Đang tải…' : 'Thay ảnh'}</span>
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void handleProcessFile(file)
                      e.currentTarget.value = ''
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Trạng thái chưa có ảnh (Empty Dropzone) */
        <div className={cn(
          'rounded-2xl border-2 border-dashed p-5 text-center transition-colors',
          toneConfig.dashed
        )}>
          <div className={cn('size-11 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-2xs', toneConfig.tagBg)}>
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          </div>
          <p className="text-xs font-black text-slate-800">
            {isUploading ? 'Đang tải ảnh lên hệ thống…' : 'Chưa có hình ảnh minh họa'}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
            Kéo thả file vào đây hoặc bấm nút bên dưới để chọn file từ máy tính
          </p>

          {!readOnly && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <label
                className={cn(
                  'inline-flex min-h-9.5 items-center justify-center gap-1.5 rounded-xl border-2 px-4 text-xs font-black shadow-xs transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95',
                  toneConfig.btnPrimary,
                  isUploading && 'opacity-70 cursor-not-allowed'
                )}
              >
                {isUploading ? (
                  <Loader2 size={14} className="animate-spin shrink-0" />
                ) : (
                  <Upload size={14} className="shrink-0" />
                )}
                <span>{isUploading ? 'Đang tải ảnh…' : 'Tải ảnh từ máy tính lên'}</span>
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleProcessFile(file)
                    e.currentTarget.value = ''
                  }}
                />
              </label>
            </div>
          )}

          {showUrlInput && (
            <div className="mt-2.5 max-w-md mx-auto">
              <input
                type="url"
                readOnly={readOnly}
                value={imageUrl ?? ''}
                onChange={(e) => onImageChange(e.target.value)}
                style={{ ...inputStyle, textAlign: 'center' }}
                placeholder="Hoặc dán URL: https://... hoặc /assets/..."
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
