import React from 'react'
import { Upload, Trash2, Plus, Eye } from 'lucide-react'
import type { StageImageItem } from '../../lib/authoring'
import type { StageBlockEditorBaseProps } from './types'

export interface ImagesBlockEditorProps extends StageBlockEditorBaseProps {
  uploadAdditionalImageItem: (stageIndex: number, imgIndex: number, file: File) => Promise<void>
}

export function ImagesBlockEditor({
  stageIndex,
  card,
  readOnly,
  updateLearnCard,
  uploadingStageMedia,
  uploadLearnCardMedia,
  uploadAdditionalImageItem,
  inputStyle,
}: ImagesBlockEditorProps) {
  return (
    <div className="mt-3.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-4 shadow-xs space-y-5">
      {/* 12.1. Ảnh chính của Chặng (Hero Image) */}
      <div className="rounded-xl border-2 border-emerald-200 bg-white p-3.5 shadow-2xs">
        <div className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🖼️</span>
            <div>
              <h5 className="text-xs font-black uppercase tracking-wide text-emerald-950">
                Ảnh chính của Chặng (Hero Image)
              </h5>
              <p className="text-[10px] text-muted font-medium">
                Ảnh chủ đạo hiển thị to bản ở đầu chặng cho học sinh
              </p>
            </div>
          </div>

          {card.imageUrl && !readOnly && (
            <button
              type="button"
              onClick={() => updateLearnCard(stageIndex, { imageUrl: '' })}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/60 px-2.5 py-1 text-[11px] font-extrabold text-rose-700 hover:bg-rose-100 transition cursor-pointer shrink-0 whitespace-nowrap"
              title="Xóa ảnh chính"
            >
              <Trash2 size={13} className="shrink-0" />
              <span>Xóa ảnh</span>
            </button>
          )}
        </div>

        {card.imageUrl ? (
          <div className="mt-3 space-y-3">
            <div className="relative overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/40 p-2 text-center group/hero flex items-center justify-center min-h-[160px] max-h-[360px]">
              <img
                src={card.imageUrl}
                alt={card.imageAlt || card.title || 'Ảnh chính chặng'}
                className="w-auto max-w-full max-h-[340px] rounded-lg object-contain mx-auto shadow-2xs"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <label className="block text-[11px] font-extrabold text-muted">
                URL Ảnh chính
                <input
                  type="url"
                  readOnly={readOnly}
                  value={card.imageUrl ?? ''}
                  onChange={(e) => updateLearnCard(stageIndex, { imageUrl: e.target.value })}
                  style={{ ...inputStyle, marginTop: '0.2rem' }}
                  placeholder="https://cdn.example.com/hero-image.webp"
                />
              </label>

              {!readOnly && (
                <div className="flex items-end shrink-0">
                  <label className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3.5 text-xs font-black text-emerald-900 hover:bg-emerald-100 transition cursor-pointer shrink-0 whitespace-nowrap">
                    <Upload size={14} className="shrink-0" />
                    <span>{uploadingStageMedia === `${stageIndex}:imageUrl` ? 'Đang tải...' : 'Thay ảnh'}</span>
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={uploadingStageMedia !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) void uploadLearnCardMedia(stageIndex, 'imageUrl', file)
                        e.currentTarget.value = ''
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center">
            <p className="text-xs font-bold text-emerald-900">Chưa có ảnh chính của Chặng</p>
            <p className="mt-0.5 text-[10px] text-muted">Tải ảnh lên hoặc dán đường dẫn URL để làm ảnh chủ đạo</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {!readOnly && (
                <label className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-400 bg-emerald-600 px-3.5 text-xs font-black text-white hover:bg-emerald-700 shadow-xs transition cursor-pointer shrink-0 whitespace-nowrap">
                  <Upload size={14} className="shrink-0" />
                  <span>{uploadingStageMedia === `${stageIndex}:imageUrl` ? 'Đang tải ảnh...' : 'Tải ảnh chính lên'}</span>
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={uploadingStageMedia !== null}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void uploadLearnCardMedia(stageIndex, 'imageUrl', file)
                      e.currentTarget.value = ''
                    }}
                  />
                </label>
              )}
            </div>
            <div className="mt-2.5 max-w-md mx-auto">
              <input
                type="url"
                readOnly={readOnly}
                value={card.imageUrl ?? ''}
                onChange={(e) => updateLearnCard(stageIndex, { imageUrl: e.target.value })}
                style={{ ...inputStyle, textAlign: 'center' }}
                placeholder="Hoặc dán URL: https://cdn.example.com/hero.webp"
              />
            </div>
          </div>
        )}
      </div>

      {/* 12.2. Danh sách Ảnh minh họa bổ sung */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-t border-emerald-200/80 pt-3">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">📷</span>
            <span className="text-xs font-black uppercase tracking-wide text-emerald-950">
              Ảnh minh họa bổ sung ({(card.additionalImages || []).length})
            </span>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={() => {
                const currentList = card.additionalImages || []
                const nextItem: StageImageItem = {
                  id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  url: '',
                  alt: 'Ảnh minh họa',
                  caption: '',
                }
                updateLearnCard(stageIndex, { additionalImages: [...currentList, nextItem] })
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-extrabold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Plus size={13} className="shrink-0" /> Tải thêm ảnh
            </button>
          )}
        </div>

        {(!card.additionalImages || card.additionalImages.length === 0) ? (
          <div className="rounded-xl border border-dashed border-emerald-300 bg-white/70 p-3.5 text-center text-xs font-bold text-emerald-800">
            Chưa có ảnh bổ sung nào. Bấm "+ Tải thêm ảnh" ở trên để thêm album ảnh kèm chú thích.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {card.additionalImages.map((imgItem, imgIdx) => (
              <div key={imgItem.id || imgIdx} className="rounded-xl border border-emerald-200 bg-white p-3 shadow-2xs">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-black text-emerald-950">Ảnh minh họa #{imgIdx + 1}</span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextList = card.additionalImages?.filter((_, i) => i !== imgIdx) || []
                        updateLearnCard(stageIndex, { additionalImages: nextList })
                      }}
                      className="rounded-md p-1 text-coral-600 hover:bg-coral-50 cursor-pointer shrink-0"
                      title="Xóa ảnh này"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
                  URL Ảnh
                  <input
                    type="url"
                    readOnly={readOnly}
                    value={imgItem.url}
                    onChange={(e) => {
                      const nextList = [...(card.additionalImages || [])]
                      nextList[imgIdx] = { ...imgItem, url: e.target.value }
                      updateLearnCard(stageIndex, { additionalImages: nextList })
                    }}
                    style={{ ...inputStyle, marginTop: '0.2rem' }}
                    placeholder="https://cdn.example.com/illustration.webp"
                  />
                </label>
                {!readOnly && (
                  <span className="mt-1.5 flex min-h-9 cursor-pointer items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-bold text-emerald-900 hover:bg-emerald-100">
                    <Eye size={13} className="mr-1" />
                    {uploadingStageMedia === `${stageIndex}:additionalImage:${imgIdx}` ? 'Đang tải ảnh…' : 'Tải file ảnh lên'}
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={uploadingStageMedia !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) void uploadAdditionalImageItem(stageIndex, imgIdx, file)
                        e.currentTarget.value = ''
                      }}
                    />
                  </span>
                )}
                <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
                  Chú thích dưới ảnh (Caption)
                  <input
                    type="text"
                    readOnly={readOnly}
                    value={imgItem.caption ?? ''}
                    onChange={(e) => {
                      const nextList = [...(card.additionalImages || [])]
                      nextList[imgIdx] = { ...imgItem, caption: e.target.value }
                      updateLearnCard(stageIndex, { additionalImages: nextList })
                    }}
                    style={{ ...inputStyle, marginTop: '0.2rem' }}
                    placeholder="Chú thích ngắn gọn cho học sinh..."
                  />
                </label>
                {imgItem.url && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-emerald-100 aspect-video">
                    <img src={imgItem.url} alt={imgItem.alt || 'Ảnh'} className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
