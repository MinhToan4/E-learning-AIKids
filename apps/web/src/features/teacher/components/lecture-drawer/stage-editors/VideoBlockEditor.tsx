import React from 'react'
import { Clapperboard, Trash2, Plus, Upload, Play, Clock } from 'lucide-react'
import type { LessonSixStageJourney } from '@/shared/lib/api'
import { uploadCmsCourseMedia } from '@/shared/lib/media-api'
import { resolveLectureVideo } from '@/features/lesson/lib/lecture-video'
import { CmsImageUploader } from '../../stage-block-editors/CmsImageUploader'

export interface VideoBlockEditorProps {
  video: LessonSixStageJourney['stage3_video']
  onChange: (patch: Partial<LessonSixStageJourney['stage3_video']>) => void
  readOnly?: boolean
  questId?: string
  showToast?: (message: string, tone?: 'success' | 'error' | 'info') => void
}

/**
 * VideoBlockEditor — Form soạn thảo Chặng Video Bài Học (Stage 3 / Video Block).
 * Quản lý: Tiêu đề video, xem trước player trực quan, đường dẫn video (YouTube/MP4), thời lượng, ảnh poster, các mốc thời gian (chapters).
 */
export function VideoBlockEditor({
  video,
  onChange,
  readOnly = false,
  questId,
  showToast,
}: VideoBlockEditorProps) {
  const timestamps = video.timestamps || []

  const videoSource = React.useMemo(() => {
    return video.videoUrl ? resolveLectureVideo(video.videoUrl) : null
  }, [video.videoUrl])

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
    <div className="space-y-4 rounded-3xl border-2 border-indigo-200 bg-white p-5 shadow-clay-xs">
      <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <Clapperboard size={20} />
          </span>
          <div>
            <h4 className="text-sm font-black uppercase text-slate-900 tracking-wider">
              Video Bài Giảng (Video Block)
            </h4>
            <p className="text-xs font-semibold text-slate-500">
              Nội dung bài giảng đa phương tiện trực quan kèm các mốc phân đoạn
            </p>
          </div>
        </div>
        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-black text-indigo-800">
          Chặng 3/6
        </span>
      </div>

      {/* Khung Xem Trước Video WYSIWYG Trực Quan (Interactive Video Preview 16:9 Full-Width) */}
      <div className="rounded-2xl border-2 border-indigo-200 bg-slate-900 p-2 overflow-hidden shadow-sm">
        {videoSource ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 pt-1 text-xs font-black text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Play size={13} className="text-emerald-400" />
                <span>Xem Trước Video Trực Tiếp:</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {video.durationSec ? `${Math.floor(video.durationSec / 60)}p${video.durationSec % 60}s` : '180s'}
              </span>
            </div>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-md">
              {videoSource.kind === 'youtube' ? (
                <iframe
                  className="size-full border-0"
                  src={videoSource.src}
                  title={video.title || 'Video bài giảng'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  className="size-full object-contain"
                  controls
                  playsInline
                  src={videoSource.src}
                >
                  Trình duyệt không hỗ trợ video.
                </video>
              )}
            </div>
          </div>
        ) : video.videoUrl ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 pt-1 text-xs font-black text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Play size={13} className="text-emerald-400" />
                <span>Xem Trước Video Trực Tiếp:</span>
              </span>
            </div>
            <div className="aspect-video rounded-xl bg-slate-800 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
              <p className="text-xs font-bold text-amber-400">Đường dẫn video chưa hợp lệ hoặc không bảo mật (HTTPS)</p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono break-all max-w-md">{video.videoUrl}</p>
            </div>
          </div>
        ) : video.posterUrl ? (
          <div className="relative group rounded-xl overflow-hidden aspect-video bg-slate-800 flex items-center justify-center">
            <img
              src={video.posterUrl}
              alt="Poster video"
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="size-14 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-clay-sm group-hover:scale-110 transition-transform">
                <Play size={24} className="ml-1" />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-lg text-white text-xs font-bold">
              Chưa nhập đường dẫn video (Dán URL YouTube bên dưới)
            </div>
          </div>
        ) : (
          <div className="aspect-video rounded-xl bg-slate-800 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <Clapperboard size={36} className="text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-300">Chưa có video hoặc ảnh poster bài giảng</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Dán đường dẫn YouTube hoặc tải video MP4 từ máy tính</p>
          </div>
        )}
      </div>

      {/* Tiêu đề video bài học */}
      <div>
        <label className="block text-xs font-black uppercase text-slate-700">
          Tiêu đề video bài học *
        </label>
        <input
          type="text"
          value={video.title || ''}
          disabled={readOnly}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="VD: 4 Chìa Khóa Vàng để tạo nên bức tranh hoàn hảo"
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-2xs outline-none focus:border-indigo-500 transition"
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
            Thời lượng video (giây)
          </label>
          <div className="mt-1.5 flex items-center gap-2">
            <input
              type="number"
              value={video.durationSec || 180}
              disabled={readOnly}
              onChange={(e) => onChange({ durationSec: parseInt(e.target.value, 10) || 180 })}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 shadow-2xs outline-none focus:border-indigo-500 transition font-mono"
            />
            <span className="text-xs font-bold text-slate-500 shrink-0">
              ({Math.floor((video.durationSec || 180) / 60)}p {(video.durationSec || 180) % 60}s)
            </span>
          </div>
        </div>
        <CmsImageUploader
          label="Ảnh bìa video (Poster)"
          imageUrl={video.posterUrl || ''}
          readOnly={readOnly}
          onImageChange={(url: string) => onChange({ posterUrl: url })}
          urlPlaceholder="https://... hoặc tải ảnh"
          showToast={showToast}
          uploadPurpose="island_stage3_poster"
          questId={questId}
        />
      </div>

      {/* Mốc phân đoạn video (Timestamps) */}
      <div className="rounded-2xl border-2 border-slate-200 bg-slate-50/70 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
            <Clock size={15} className="text-indigo-600" />
            <span>Mốc phân đoạn video ({timestamps.length})</span>
          </label>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddTimestamp}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-black text-indigo-700 hover:bg-indigo-100 cursor-pointer shadow-2xs transition active:scale-95"
            >
              <Plus size={13} />
              <span>Thêm mốc</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {timestamps.map((ts, tsIdx) => {
            const formatTime = (sec: number) => {
              const m = Math.floor(sec / 60)
              const s = sec % 60
              return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            }

            return (
              <div
                key={tsIdx}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs"
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="size-6 rounded-lg bg-indigo-100 text-indigo-800 font-black text-[11px] grid place-items-center">
                    {tsIdx + 1}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    {formatTime(ts.startSec)} - {formatTime(ts.endSec)}
                  </span>
                </div>

                <input
                  type="text"
                  value={ts.label}
                  disabled={readOnly}
                  onChange={(e) => {
                    const nextTs = [...timestamps]
                    nextTs[tsIdx] = { ...nextTs[tsIdx], label: e.target.value }
                    onChange({ timestamps: nextTs })
                  }}
                  placeholder="Tiêu đề phân đoạn..."
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-400 focus:bg-white transition"
                />

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                  <input
                    type="number"
                    value={ts.startSec}
                    disabled={readOnly}
                    onChange={(e) => {
                      const nextTs = [...timestamps]
                      nextTs[tsIdx] = { ...nextTs[tsIdx], startSec: parseInt(e.target.value, 10) || 0 }
                      onChange({ timestamps: nextTs })
                    }}
                    className="w-16 rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-1.5 text-xs font-bold text-center font-mono outline-none focus:border-indigo-400 focus:bg-white"
                    title="Giây bắt đầu"
                  />
                  <span className="text-xs font-bold text-slate-400">-</span>
                  <input
                    type="number"
                    value={ts.endSec}
                    disabled={readOnly}
                    onChange={(e) => {
                      const nextTs = [...timestamps]
                      nextTs[tsIdx] = { ...nextTs[tsIdx], endSec: parseInt(e.target.value, 10) || 0 }
                      onChange({ timestamps: nextTs })
                    }}
                    className="w-16 rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-1.5 text-xs font-bold text-center font-mono outline-none focus:border-indigo-400 focus:bg-white"
                    title="Giây kết thúc"
                  />
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTimestamp(tsIdx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition ml-1"
                      title="Xóa mốc này"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {timestamps.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-2">Chưa có mốc phân đoạn nào.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export { VideoBlockEditor as Stage3VideoEditor }
