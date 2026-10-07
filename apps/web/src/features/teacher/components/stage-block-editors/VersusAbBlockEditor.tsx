import React from 'react'
import { Eye } from 'lucide-react'
import type { StageBlockEditorBaseProps } from './types'

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
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Tranh A */}
        <div className="rounded-xl border border-amber-200 bg-white p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950">Phương án A</span>
            <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-800">Tranh A</span>
          </div>
          <label className="mt-2 block text-[11px] font-extrabold text-muted">
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
          <label className="mt-2 block text-[11px] font-extrabold text-muted">
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
          <label className="mt-2 block text-[11px] font-extrabold text-muted">
            URL Ảnh A
            <input
              type="url"
              readOnly={readOnly}
              value={card.optionImages?.[0] ?? ''}
              onChange={(event) => {
                const next = [...(card.optionImages || ['', ''])]
                next[0] = event.target.value
                updateLearnCard(stageIndex, { optionImages: next })
              }}
              style={{ ...inputStyle, marginTop: '0.2rem' }}
              placeholder="https://cdn.example.com/zico-hero.webp"
            />
          </label>
          {!readOnly && (
            <span className="mt-2 flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-3 text-xs font-extrabold text-amber-900 hover:bg-amber-100">
              <Eye size={15} className="mr-1.5" />
              {uploadingStageMedia === `${stageIndex}:optionImageA` ? 'Đang tải ảnh A…' : 'Tải ảnh tranh A lên'}
              <input
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={uploadingStageMedia !== null}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void uploadLearnCardMedia(stageIndex, 'optionImageA', file)
                  event.currentTarget.value = ''
                }}
              />
            </span>
          )}
          {card.optionImages?.[0] && (
            <div className="mt-2 overflow-hidden rounded-lg border border-amber-200 aspect-video">
              <img src={card.optionImages[0]} alt="Bức tranh A" className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            </div>
          )}
        </div>

        {/* Tranh B */}
        <div className="rounded-xl border border-sky-200 bg-white p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-sky-950">Phương án B</span>
            <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-black text-sky-800">Tranh B</span>
          </div>
          <label className="mt-2 block text-[11px] font-extrabold text-muted">
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
          <label className="mt-2 block text-[11px] font-extrabold text-muted">
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
          <label className="mt-2 block text-[11px] font-extrabold text-muted">
            URL Ảnh B
            <input
              type="url"
              readOnly={readOnly}
              value={card.optionImages?.[1] ?? ''}
              onChange={(event) => {
                const next = [...(card.optionImages || ['', ''])]
                next[1] = event.target.value
                updateLearnCard(stageIndex, { optionImages: next })
              }}
              style={{ ...inputStyle, marginTop: '0.2rem' }}
              placeholder="https://cdn.example.com/sonet-hero.webp"
            />
          </label>
          {!readOnly && (
            <span className="mt-2 flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-sky-300 bg-sky-50 px-3 text-xs font-extrabold text-sky-900 hover:bg-sky-100">
              <Eye size={15} className="mr-1.5" />
              {uploadingStageMedia === `${stageIndex}:optionImageB` ? 'Đang tải ảnh B…' : 'Tải ảnh tranh B lên'}
              <input
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={uploadingStageMedia !== null}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void uploadLearnCardMedia(stageIndex, 'optionImageB', file)
                  event.currentTarget.value = ''
                }}
              />
            </span>
          )}
          {card.optionImages?.[1] && (
            <div className="mt-2 overflow-hidden rounded-lg border border-sky-200 aspect-video">
              <img src={card.optionImages[1]} alt="Bức tranh B" className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
