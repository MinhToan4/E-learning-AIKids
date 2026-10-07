import React from 'react'
import { Eye } from 'lucide-react'
import type { StageBlockEditorBaseProps } from './types'

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
    <div className="mt-3.5 rounded-2xl border-2 border-yellow-300 bg-yellow-50/70 p-4 shadow-xs">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-[11px] font-extrabold text-muted sm:col-span-2">
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

        <label className="text-[11px] font-extrabold text-muted">
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

        <label className="text-[11px] font-extrabold text-muted">
          URL Ảnh Poster tùy chọn
          <input
            type="url"
            readOnly={readOnly}
            value={card.imageUrl ?? ''}
            onChange={(e) => updateLearnCard(stageIndex, { imageUrl: e.target.value })}
            style={{ ...inputStyle, marginTop: '0.2rem' }}
            placeholder="https://cdn.example.com/poster-gold.webp"
          />
        </label>

        {!readOnly && (
          <span className="sm:col-span-2 flex min-h-11 cursor-pointer items-center justify-center rounded-xl border-2 border-yellow-300 bg-white px-3 text-xs font-extrabold text-yellow-900 hover:bg-yellow-100">
            <Eye size={16} className="mr-2" aria-hidden="true" />
            {uploadingStageMedia === `${stageIndex}:imageUrl` ? 'Đang tải ảnh poster…' : 'Tải file ảnh poster lên'}
            <input
              className="sr-only"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={uploadingStageMedia !== null}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void uploadLearnCardMedia(stageIndex, 'imageUrl', file)
                event.currentTarget.value = ''
              }}
            />
          </span>
        )}

        {card.imageUrl && (
          <div className="sm:col-span-2 overflow-hidden rounded-xl border border-yellow-200">
            <img src={card.imageUrl} alt={card.imageAlt || 'Poster'} className="aspect-video w-full rounded-xl object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          </div>
        )}
      </div>
    </div>
  )
}
