import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { StageImageItem } from '../../lib/authoring'
import type { StageBlockEditorBaseProps } from './types'
import { CmsImageUploader } from './CmsImageUploader'

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
      <CmsImageUploader
        label="Ảnh chính của Chặng (Hero Image)"
        sublabel="Ảnh chủ đạo hiển thị to bản ở đầu chặng cho học sinh"
        icon="🖼️"
        imageUrl={card.imageUrl}
        imageAlt={card.imageAlt || card.title || 'Ảnh chính chặng'}
        readOnly={readOnly}
        isUploading={uploadingStageMedia === `${stageIndex}:imageUrl`}
        tone="emerald"
        inputStyle={inputStyle}
        onImageChange={(url) => updateLearnCard(stageIndex, { imageUrl: url })}
        onUploadFile={(file) => uploadLearnCardMedia(stageIndex, 'imageUrl', file)}
        urlPlaceholder="https://cdn.example.com/hero-image.webp"
      />

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
              className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition cursor-pointer shrink-0 whitespace-nowrap shadow-2xs active:scale-95"
            >
              <Plus size={13} className="shrink-0" />
              <span>+ Tải thêm ảnh</span>
            </button>
          )}
        </div>

        {(!card.additionalImages || card.additionalImages.length === 0) ? (
          <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-white/70 p-4 text-center text-xs font-bold text-emerald-800">
            Chưa có ảnh bổ sung nào. Bấm "+ Tải thêm ảnh" ở trên để thêm album ảnh kèm chú thích.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {card.additionalImages.map((imgItem, imgIdx) => (
              <div key={imgItem.id || imgIdx} className="space-y-2 rounded-2xl border border-emerald-200 bg-white p-3 shadow-2xs">
                <div className="flex items-center justify-between gap-1 border-b border-emerald-100 pb-1.5">
                  <span className="text-xs font-black text-emerald-950">Ảnh minh họa #{imgIdx + 1}</span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextList = card.additionalImages?.filter((_, i) => i !== imgIdx) || []
                        updateLearnCard(stageIndex, { additionalImages: nextList })
                      }}
                      className="rounded-lg p-1 text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0 transition"
                      title="Xóa ảnh này"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <CmsImageUploader
                  imageUrl={imgItem.url}
                  imageAlt={imgItem.alt || `Ảnh #${imgIdx + 1}`}
                  readOnly={readOnly}
                  isUploading={uploadingStageMedia === `${stageIndex}:additionalImage:${imgIdx}`}
                  tone="emerald"
                  maxHeight="220px"
                  inputStyle={inputStyle}
                  onImageChange={(url) => {
                    const nextList = [...(card.additionalImages || [])]
                    nextList[imgIdx] = { ...imgItem, url }
                    updateLearnCard(stageIndex, { additionalImages: nextList })
                  }}
                  onUploadFile={(file) => uploadAdditionalImageItem(stageIndex, imgIdx, file)}
                  urlPlaceholder="https://cdn.example.com/illustration.webp"
                />

                <label className="block text-[11px] font-extrabold text-muted">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
