import React from 'react'
import type { StageBlockEditorBaseProps } from './types'
import { CmsImageUploader } from './CmsImageUploader'

export function PosterBlockEditor({
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
    <div className="mt-3.5 rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-4 shadow-xs space-y-3.5">
      <div className="space-y-3">
        <label className="block text-[11px] font-extrabold text-muted">
          Thông điệp Quy tắc Vàng to bản (Poster Headline)
          <textarea
            readOnly={readOnly}
            value={card.body}
            onChange={(e) => updateLearnCard(stageIndex, { body: e.target.value })}
            rows={2}
            style={{ ...textareaStyle, marginTop: '0.2rem', minHeight: '3rem' }}
            placeholder="Nghĩ ra ý tưởng của riêng mình trước, sau đó mới dùng AI..."
          />
        </label>

        <label className="block text-[11px] font-extrabold text-muted">
          💡 Bí kíp bỏ túi của con
          <input
            type="text"
            readOnly={readOnly}
            value={card.tip}
            onChange={(e) => updateLearnCard(stageIndex, { tip: e.target.value })}
            style={{ ...inputStyle, marginTop: '0.2rem' }}
            placeholder="AI là người bạn gợi ý, con là thuyền trưởng chỉ huy!"
          />
        </label>
      </div>

      <CmsImageUploader
        label="Ảnh Poster Quy Tắc Vàng (Tùy chọn)"
        sublabel="Ảnh to bản định hướng quy tắc hiển thị ở màn hình học sinh"
        icon="📜"
        imageUrl={card.imageUrl}
        imageAlt={card.imageAlt || 'Poster'}
        readOnly={readOnly}
        isUploading={uploadingStageMedia === `${stageIndex}:imageUrl`}
        tone="amber"
        aspectRatio="video"
        inputStyle={inputStyle}
        onImageChange={(url) => updateLearnCard(stageIndex, { imageUrl: url })}
        onUploadFile={(file) => uploadLearnCardMedia(stageIndex, 'imageUrl', file)}
        urlPlaceholder="https://cdn.example.com/poster-gold.webp"
      />
    </div>
  )
}
