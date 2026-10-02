import React from 'react'
import { Clapperboard, Trash2, Plus } from 'lucide-react'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'

export interface VideoBlockEditorProps {
  video: LessonSixStageJourney['stage3_video']
  onChange: (patch: Partial<LessonSixStageJourney['stage3_video']>) => void
  readOnly?: boolean
  questId?: string
  showToast?: (message: string, tone?: 'success' | 'error' | 'info') => void
}

/**
 * VideoBlockEditor — Form soạn thảo Chặng Video Bài Học (Stage 3 / Video Block).
 * Quản lý: Tiêu đề video, đường dẫn video (YouTube/MP4), thời lượng, ảnh poster, các mốc thời gian (chapters).
 */
export function VideoBlockEditor({
  video,
  onChange,
  readOnly = false,
  questId,
  showToast,
}: VideoBlockEditorProps) {
  const timestamps = video.timestamps || []

  const handleAddTimestamp = () => {
    if (readOnly) return
    const nextTs = [...timestamps]
    nextTs.push({
      label: `Phân đoạn ${nextTs.length + 1}`,
      startSec: 0,
      endSec: 60,
    })
    onChange({ timestamps: nextTs })
    showToast?.('Đã thêm mốc phân đoạn mới!', 'success')
  }

  const handleRemoveTimestamp = (idx: number) => {
    if (readOnly) return
    const nextTs = timestamps.filter((_, i) => i !== idx)
    onChange({ timestamps: nextTs })
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="grid size-8 place-items-center rounded-lg bg-indigo-100 text-indigo-700">
          <Clapperboard size={18} />
        </span>
        <div>
          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            Video Bài Giảng (Video Block)
          </h4>
          <p className="text-[11px] font-semibold text-slate-500">
            Cung cấp nội dung kiến thức đa phương tiện trực quan qua video và mốc phân đoạn
          </p>
        </div>
      </div>

      {/* Tiêu đề video bài học */}
      <div>
        <label className="block text-xs font-black uppercase text-slate-700">
          Tiêu đề video bài học
        </label>
        <input
          type="text"
          value={video.title || ''}
          disabled={readOnly}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="VD: 4 Chìa Khóa Vàng để tạo nên bức tranh hoàn hảo"
          className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-bold text-text"
        />
      </div>

      {/* Đường dẫn video */}
      <div>
        <label className="block text-xs font-black uppercase text-slate-700">
          Đường dẫn video (YouTube embed hoặc MP4)
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            type="text"
            value={video.videoUrl || ''}
            disabled={readOnly}
            onChange={(e) => onChange({ videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/embed/... hoặc https://..."
            className="flex-1 rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text font-mono"
          />
          {!readOnly && (
            <label className="flex items-center gap-1 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 cursor-pointer shrink-0">
              <span>📹 Tải video</span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    const res = await uploadCmsCourseMedia({
                      file,
                      purpose: 'island_stage3_video',
                      questId,
                    })
                    if (res?.url) {
                      onChange({ videoUrl: res.url })
                      showToast?.('Đã tải video bài học lên thành công!', 'success')
                    }
                  } catch (err) {
                    showToast?.(
                      `Lỗi tải video: ${err instanceof Error ? err.message : 'Không xác định'}`,
                      'error'
                    )
                  }
                }}
              />
            </label>
          )}
        </div>
      </div>

      {/* Thời lượng & Ảnh bìa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black uppercase text-slate-700">
            Thời lượng (giây)
          </label>
          <input
            type="number"
            value={video.durationSec || 180}
            disabled={readOnly}
            onChange={(e) => onChange({ durationSec: parseInt(e.target.value, 10) || 180 })}
            className="mt-1.5 w-full rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase text-slate-700">
            Ảnh bìa video (Poster URL)
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              type="text"
              value={video.posterUrl || ''}
              disabled={readOnly}
              onChange={(e) => onChange({ posterUrl: e.target.value })}
              placeholder="https://... hoặc tải ảnh"
              className="flex-1 rounded-xl border border-border bg-page px-3 py-2 text-xs font-semibold text-text font-mono"
            />
            {!readOnly && (
              <label className="flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer shrink-0">
                <span>🖼️ Ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const res = await uploadCmsCourseMedia({
                        file,
                        purpose: 'island_stage3_poster',
                        questId,
                      })
                      if (res?.url) {
                        onChange({ posterUrl: res.url })
                        showToast?.('Đã tải ảnh poster lên thành công!', 'success')
                      }
                    } catch (err) {
                      showToast?.(
                        `Lỗi tải poster: ${err instanceof Error ? err.message : 'Không xác định'}`,
                        'error'
                      )
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Mốc phân đoạn video (Timestamps) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-black uppercase text-slate-700">
            Mốc phân đoạn video ({timestamps.length})
          </label>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddTimestamp}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              <Plus size={14} />
              <span>Thêm mốc</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {timestamps.map((ts, tsIdx) => (
            <div
              key={tsIdx}
              className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200"
            >
              <input
                type="text"
                value={ts.label}
                disabled={readOnly}
                onChange={(e) => {
                  const nextTs = [...timestamps]
                  nextTs[tsIdx] = { ...nextTs[tsIdx], label: e.target.value }
                  onChange({ timestamps: nextTs })
                }}
                placeholder="Tên phân đoạn..."
                className="flex-1 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold"
              />
              <input
                type="number"
                value={ts.startSec}
                disabled={readOnly}
                onChange={(e) => {
                  const nextTs = [...timestamps]
                  nextTs[tsIdx] = { ...nextTs[tsIdx], startSec: parseInt(e.target.value, 10) || 0 }
                  onChange({ timestamps: nextTs })
                }}
                className="w-16 rounded-lg border border-border bg-white px-2 py-1.5 text-xs font-semibold text-center font-mono"
                title="Giây bắt đầu"
              />
              <span className="text-xs font-bold text-muted">-</span>
              <input
                type="number"
                value={ts.endSec}
                disabled={readOnly}
                onChange={(e) => {
                  const nextTs = [...timestamps]
                  nextTs[tsIdx] = { ...nextTs[tsIdx], endSec: parseInt(e.target.value, 10) || 0 }
                  onChange({ timestamps: nextTs })
                }}
                className="w-16 rounded-lg border border-border bg-white px-2 py-1.5 text-xs font-semibold text-center font-mono"
                title="Giây kết thúc"
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveTimestamp(tsIdx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Xóa mốc"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {timestamps.length === 0 && (
            <p className="text-xs text-slate-400 italic">Chưa có mốc phân đoạn nào.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export { VideoBlockEditor as Stage3VideoEditor }
