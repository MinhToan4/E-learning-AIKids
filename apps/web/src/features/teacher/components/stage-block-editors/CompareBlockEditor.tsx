import React from 'react'
import { Eye } from 'lucide-react'
import type { StageBlockEditorBaseProps } from './types'

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
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Cột Trái: Kho AI */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <span className="text-xs font-black text-slate-800">Cột Trái</span>
          <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
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
          <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
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
          <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
            URL Ảnh cột trái
            <input
              type="url"
              readOnly={readOnly}
              value={card.compareData?.leftImage || card.compareImages?.left || ''}
              onChange={(event) => {
                const currentData = card.compareData || {}
                updateLearnCard(stageIndex, {
                  compareData: { ...currentData, leftImage: event.target.value },
                  compareImages: { left: event.target.value, right: card.compareImages?.right || '' },
                })
              }}
              style={{ ...inputStyle, marginTop: '0.2rem' }}
              placeholder="https://cdn.example.com/ai-warehouse.webp"
            />
          </label>
          {!readOnly && (
            <span className="mt-2 flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-extrabold text-slate-800 hover:bg-slate-100">
              <Eye size={15} className="mr-1.5" />
              {uploadingStageMedia === `${stageIndex}:compareLeft` ? 'Đang tải ảnh…' : 'Tải ảnh Cột Trái lên'}
              <input
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={uploadingStageMedia !== null}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void uploadLearnCardMedia(stageIndex, 'compareLeft', file)
                  event.currentTarget.value = ''
                }}
              />
            </span>
          )}
          {(card.compareData?.leftImage || card.compareImages?.left) && (
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 aspect-video">
              <img src={card.compareData?.leftImage || card.compareImages?.left} alt="Minh họa Cột Trái" className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            </div>
          )}
        </div>

        {/* Cột Phải: Não con */}
        <div className="rounded-xl border border-brand-200 bg-white p-3 shadow-xs">
          <span className="text-xs font-black text-brand-900">Cột Phải</span>
          <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
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
          <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
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
          <label className="mt-1.5 block text-[11px] font-extrabold text-muted">
            URL Ảnh cột phải
            <input
              type="url"
              readOnly={readOnly}
              value={card.compareData?.rightImage || card.compareImages?.right || ''}
              onChange={(event) => {
                const currentData = card.compareData || {}
                updateLearnCard(stageIndex, {
                  compareData: { ...currentData, rightImage: event.target.value },
                  compareImages: { left: card.compareImages?.left || '', right: event.target.value },
                })
              }}
              style={{ ...inputStyle, marginTop: '0.2rem' }}
              placeholder="https://cdn.example.com/kid-brain.webp"
            />
          </label>
          {!readOnly && (
            <span className="mt-2 flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-brand-300 bg-amber-50 px-3 text-xs font-extrabold text-brand-900 hover:bg-amber-100">
              <Eye size={15} className="mr-1.5" />
              {uploadingStageMedia === `${stageIndex}:compareRight` ? 'Đang tải ảnh…' : 'Tải ảnh Cột Phải lên'}
              <input
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={uploadingStageMedia !== null}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void uploadLearnCardMedia(stageIndex, 'compareRight', file)
                  event.currentTarget.value = ''
                }}
              />
            </span>
          )}
          {(card.compareData?.rightImage || card.compareImages?.right) && (
            <div className="mt-2 overflow-hidden rounded-lg border border-brand-200 aspect-video">
              <img src={card.compareData?.rightImage || card.compareImages?.right} alt="Minh họa Cột Phải" className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
