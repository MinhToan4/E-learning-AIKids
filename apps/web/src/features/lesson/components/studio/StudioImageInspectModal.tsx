import React from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2 } from 'lucide-react'
import { playInstantSound } from '../LessonInteractiveSidebar'
import { getStudioAIArtwork } from '../../lib/studio-artwork'
import type { StudioImageItem } from '../../lib/practice-parts'

export interface StudioImageInspectModalProps {
  image: StudioImageItem | null
  onClose: () => void
  onSelectForSubmit?: (image: StudioImageItem) => void
  isSelected?: boolean
  effectiveCharacterName?: string
  activePartSubject?: string
  effectiveLockedFeatures?: string[]
  illustrationType?: string
  lessonId?: string
  onDownload?: (image: StudioImageItem) => void
}

export function StudioImageInspectModal({
  image,
  onClose,
  onSelectForSubmit,
  isSelected: _isSelected,
  effectiveCharacterName = 'Nhân vật AIKI',
  activePartSubject,
  effectiveLockedFeatures = ['Hình dáng sinh động', 'Màu sắc hài hòa', 'Đúng mật mã bài học'],
  illustrationType,
  lessonId,
  onDownload: _onDownload,
}: StudioImageInspectModalProps) {
  if (!image || typeof document === 'undefined') {
    return null
  }

  const handleSelectCandidate = () => {
    playInstantSound('star')
    onSelectForSubmit?.(image)
    onClose()
  }

  return createPortal(
    <div
      data-testid="studio-inspect-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-transparent p-2 sm:p-3 md:p-5 animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-inspect-title"
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-lg min-w-0 flex-col overflow-hidden rounded-3xl border-2 border-indigo-200 bg-white text-left shadow-2xl sm:max-h-[calc(100dvh-1.5rem)] md:max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thân modal: 2 cột trên PC (md+), xếp dọc trên Mobile */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
          {/* CỘT TRÁI (56-60% trên md+): Khung tranh phóng to kích thước lớn, sắc nét */}
          <div className="flex min-h-[220px] w-full shrink-0 items-center justify-center bg-white p-2.5 sm:min-h-[280px] sm:p-4 md:min-h-0 md:w-[58%] lg:w-[62%]">
            <div className="relative flex h-full max-h-[48dvh] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-1 md:max-h-full">
              <img
                src={
                  image.url ||
                  getStudioAIArtwork(
                    illustrationType as any,
                    lessonId,
                    image.prompt || activePartSubject || effectiveCharacterName
                  )
                }
                alt={image.prompt || 'Tranh phóng to'}
                className="block max-h-full max-w-full object-contain rounded-xl select-none"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    getStudioAIArtwork(
                      illustrationType as any,
                      lessonId,
                      activePartSubject || effectiveCharacterName
                    ) || '/assets/aiki-islands/island1_lesson1_cat.jpg?v=2'
                }}
              />
            </div>
          </div>

          {/* CỘT PHẢI (40-44% trên md+): Bảng điều khiển thanh lịch */}
          <div className="flex-1 min-w-0 flex flex-col justify-between p-4 sm:p-5 md:p-6 overflow-y-auto bg-white">
            <div className="space-y-4">
              {/* Header: Lượt vẽ, giờ và nút đóng */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black mb-1">
                    <span>🎨 Lượt vẽ {image.turn}</span>
                  </div>
                  <h3 id="studio-inspect-title" className="break-words text-base font-black text-slate-900 sm:text-lg">
                    🔍 Soi Chi Tiết Tác Phẩm
                  </h3>
                  <p className="text-xs font-semibold text-slate-400">
                    Thời gian tạo: {image.time}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-black cursor-pointer transition-colors shrink-0"
                  title="Đóng modal"
                >
                  ✕
                </button>
              </div>

              {/* Checklist kiểm chứng đặc điểm */}
              <div className="bg-purple-50/70 border border-purple-200/90 rounded-2xl p-3.5 space-y-2">
                <div className="text-xs font-black text-purple-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span>🔐</span>
                  <span>Kiểm chứng mật mã đặc điểm:</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {effectiveLockedFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-bold text-purple-950">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lời tả câu lệnh của bé */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-1">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                  💬 Lời tả câu lệnh AI:
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed italic break-words">
                  "{image.prompt}"
                </p>
              </div>
            </div>

            {/* Cụm nút hành động */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold cursor-pointer transition-colors order-2 sm:order-1 text-center"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleSelectCandidate}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-black shadow-clay-sm cursor-pointer transition-all flex items-center justify-center gap-1.5 order-1 sm:order-2"
              >
                <span>Chọn bức này làm Tranh nộp bài ✨</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
