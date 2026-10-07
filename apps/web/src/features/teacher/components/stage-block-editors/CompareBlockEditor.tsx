import React from 'react'
import type { StageBlockEditorBaseProps } from './types'
import { CmsImageUploader } from './CmsImageUploader'

export function CompareBlockEditor({
  stageIndex,
  card,
  readOnly,
  updateLearnCard,
  uploadingStageMedia,
  uploadLearnCardMedia,
  inputStyle,
  textareaStyle,
}: StageBlockEditorBaseProps) {
  return (
    <div className="mt-3.5 rounded-2xl border-2 border-sky-300 bg-sky-50/80 p-4 shadow-xs">
      <div className="grid gap-4 sm:grid-cols-2 items-start">
        {/* Cột Trái: Kho AI */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide">Cột Trái</span>
            <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-700">So sánh 1</span>
          </div>

          <label className="block text-[11px] font-extrabold text-muted">
            Tiêu đề cột trái
            <input
              type="text"
              readOnly={readOnly}
              value={card.compareData?.leftTitle ?? 'Kho Dữ Liệu AI'}
              onChange={(e) => {
                const currentData = card.compareData || {}
                updateLearnCard(stageIndex, {
                  compareData: { ...currentData, leftTitle: e.target.value },
                })
              }}
              style={{ ...inputStyle, marginTop: '0.2rem' }}
              placeholder="Kho Dữ Liệu AI"
            />
          </label>

          <label className="block text-[11px] font-extrabold text-muted">
            Nội dung giải thích cột trái
            <textarea
              readOnly={readOnly}
              value={card.compareData?.leftText ?? ''}
              onChange={(e) => {
                const currentData = card.compareData || {}
                updateLearnCard(stageIndex, {
                  compareData: { ...currentData, leftText: e.target.value },
                })
              }}
              rows={2}
              style={{ ...textareaStyle, marginTop: '0.2rem', minHeight: '3rem' }}
              placeholder="AI chỉ lấy những hình ảnh quen thuộc trong kho mẫu có sẵn..."
            />
          </label>

          <CmsImageUploader
            label="Ảnh Cột Trái"
            imageUrl={card.compareData?.leftImage || card.compareImages?.left || ''}
            imageAlt="Minh họa Cột Trái"
            readOnly={readOnly}
            isUploading={uploadingStageMedia === `${stageIndex}:compareLeft`}
            tone="slate"
            aspectRatio="video"
            maxHeight="220px"
            inputStyle={inputStyle}
            onImageChange={(url) => {
              const currentData = card.compareData || {}
              updateLearnCard(stageIndex, {
                compareData: { ...currentData, leftImage: url },
                compareImages: { left: url, right: card.compareImages?.right || '' },
              })
            }}
            onUploadFile={(file) => uploadLearnCardMedia(stageIndex, 'compareLeft', file)}
            urlPlaceholder="https://cdn.example.com/ai-warehouse.webp"
          />
        </div>

        {/* Cột Phải: Não con */}
        <div className="rounded-2xl border border-brand-200 bg-white p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-brand-100 pb-2">
            <span className="text-xs font-black text-brand-900 uppercase tracking-wide">Cột Phải</span>
            <span className="rounded-lg bg-brand-100 px-2 py-0.5 text-[11px] font-black text-brand-800">So sánh 2</span>
          </div>

          <label className="block text-[11px] font-extrabold text-muted">
            Tiêu đề cột phải
            <input
              type="text"
              readOnly={readOnly}
              value={card.compareData?.rightTitle ?? 'Não Sáng Tạo Của Con'}
              onChange={(e) => {
                const currentData = card.compareData || {}
                updateLearnCard(stageIndex, {
                  compareData: { ...currentData, rightTitle: e.target.value },
                })
              }}
              style={{ ...inputStyle, marginTop: '0.2rem' }}
              placeholder="Não Sáng Tạo Của Con"
            />
          </label>

          <label className="block text-[11px] font-extrabold text-muted">
            Nội dung giải thích cột phải
            <textarea
              readOnly={readOnly}
              value={card.compareData?.rightText ?? ''}
              onChange={(e) => {
                const currentData = card.compareData || {}
                updateLearnCard(stageIndex, {
                  compareData: { ...currentData, rightText: e.target.value },
                })
              }}
              rows={2}
              style={{ ...textareaStyle, marginTop: '0.2rem', minHeight: '3rem' }}
              placeholder="Chỉ có con mới có kỷ niệm riêng, cảm xúc thật, gia đình..."
            />
          </label>

          <CmsImageUploader
            label="Ảnh Cột Phải"
            imageUrl={card.compareData?.rightImage || card.compareImages?.right || ''}
            imageAlt="Minh họa Cột Phải"
            readOnly={readOnly}
            isUploading={uploadingStageMedia === `${stageIndex}:compareRight`}
            tone="brand"
            aspectRatio="video"
            maxHeight="220px"
            inputStyle={inputStyle}
            onImageChange={(url) => {
              const currentData = card.compareData || {}
              updateLearnCard(stageIndex, {
                compareData: { ...currentData, rightImage: url },
                compareImages: { left: card.compareImages?.left || '', right: url },
              })
            }}
            onUploadFile={(file) => uploadLearnCardMedia(stageIndex, 'compareRight', file)}
            urlPlaceholder="https://cdn.example.com/kid-brain.webp"
          />
        </div>
      </div>
    </div>
  )
}
