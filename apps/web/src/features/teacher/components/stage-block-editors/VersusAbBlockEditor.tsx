import React from 'react'
import type { StageBlockEditorBaseProps } from './types'
import { CmsImageUploader } from './CmsImageUploader'

export function VersusAbBlockEditor({
  stageIndex,
  card,
  readOnly,
  updateLearnCard,
  uploadingStageMedia,
  uploadLearnCardMedia,
  inputStyle,
}: StageBlockEditorBaseProps) {
  return (
    <div className="mt-3.5 rounded-2xl border-2 border-amber-300 bg-amber-50/80 p-4 shadow-xs">
      <div className="grid gap-4 sm:grid-cols-2 items-start">
        {/* Tranh A */}
        <div className="rounded-2xl border border-amber-200 bg-white p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-amber-100 pb-2">
            <span className="text-xs font-black text-amber-950 uppercase tracking-wide">Phương án A</span>
            <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-800">Tranh A</span>
          </div>

          <label className="block text-[11px] font-extrabold text-muted">
            Tiêu đề tranh A
            <input
              type="text"
              readOnly={readOnly}
              value={card.optionLabels?.[0] ?? 'Ảnh A: Bức tranh của Zico'}
              onChange={(event) => {
                const next = [...(card.optionLabels || ['Ảnh A: Bức tranh của Zico', 'Ảnh B: Bức tranh của Sonet'])]
                next[0] = event.target.value
                updateLearnCard(stageIndex, { optionLabels: next })
              }}
              style={{ ...inputStyle, marginTop: '0.2rem' }}
              placeholder="Ảnh A: Bức tranh của Zico"
            />
          </label>

          <label className="block text-[11px] font-extrabold text-muted">
            Mô tả tranh A
            <input
              type="text"
              readOnly={readOnly}
              value={card.optionDescs?.[0] ?? ''}
              onChange={(event) => {
                const next = [...(card.optionDescs || ['', ''])]
                next[0] = event.target.value
                updateLearnCard(stageIndex, { optionDescs: next })
              }}
              style={{ ...inputStyle, marginTop: '0.2rem' }}
              placeholder="Siêu anh hùng quen thuộc (ai cũng vẽ được)"
            />
          </label>

          <CmsImageUploader
            label="Ảnh Tranh A"
            imageUrl={card.optionImages?.[0] ?? ''}
            imageAlt="Bức tranh A"
            readOnly={readOnly}
            isUploading={uploadingStageMedia === `${stageIndex}:optionImageA`}
            tone="amber"
            aspectRatio="video"
            maxHeight="220px"
            inputStyle={inputStyle}
            onImageChange={(url) => {
              const next = [...(card.optionImages || ['', ''])]
              next[0] = url
              updateLearnCard(stageIndex, { optionImages: next })
            }}
            onUploadFile={(file) => uploadLearnCardMedia(stageIndex, 'optionImageA', file)}
            urlPlaceholder="https://cdn.example.com/zico-hero.webp"
          />
        </div>

        {/* Tranh B */}
        <div className="rounded-2xl border border-sky-200 bg-white p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-sky-100 pb-2">
            <span className="text-xs font-black text-sky-950 uppercase tracking-wide">Phương án B</span>
            <span className="rounded-lg bg-sky-100 px-2 py-0.5 text-[11px] font-black text-sky-800">Tranh B</span>
          </div>

          <label className="block text-[11px] font-extrabold text-muted">
            Tiêu đề tranh B
            <input
              type="text"
              readOnly={readOnly}
              value={card.optionLabels?.[1] ?? 'Ảnh B: Bức tranh của Sonet'}
              onChange={(event) => {
                const next = [...(card.optionLabels || ['Ảnh A: Bức tranh của Zico', 'Ảnh B: Bức tranh của Sonet'])]
                next[1] = event.target.value
                updateLearnCard(stageIndex, { optionLabels: next })
              }}
              style={{ ...inputStyle, marginTop: '0.2rem' }}
              placeholder="Ảnh B: Bức tranh của Sonet"
            />
          </label>

          <label className="block text-[11px] font-extrabold text-muted">
            Mô tả tranh B
            <input
              type="text"
              readOnly={readOnly}
              value={card.optionDescs?.[1] ?? ''}
              onChange={(event) => {
                const next = [...(card.optionDescs || ['', ''])]
                next[1] = event.target.value
                updateLearnCard(stageIndex, { optionDescs: next })
              }}
              style={{ ...inputStyle, marginTop: '0.2rem' }}
              placeholder="Siêu anh hùng bố cầm vợt muỗi (độc nhất của riêng con)"
            />
          </label>

          <CmsImageUploader
            label="Ảnh Tranh B"
            imageUrl={card.optionImages?.[1] ?? ''}
            imageAlt="Bức tranh B"
            readOnly={readOnly}
            isUploading={uploadingStageMedia === `${stageIndex}:optionImageB`}
            tone="sky"
            aspectRatio="video"
            maxHeight="220px"
            inputStyle={inputStyle}
            onImageChange={(url) => {
              const next = [...(card.optionImages || ['', ''])]
              next[1] = url
              updateLearnCard(stageIndex, { optionImages: next })
            }}
            onUploadFile={(file) => uploadLearnCardMedia(stageIndex, 'optionImageB', file)}
            urlPlaceholder="https://cdn.example.com/sonet-hero.webp"
          />
        </div>
      </div>
    </div>
  )
}
