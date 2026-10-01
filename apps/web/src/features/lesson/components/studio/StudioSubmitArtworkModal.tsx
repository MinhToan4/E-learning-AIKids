import React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/lib/cn'
import { playInstantSound } from '../LessonInteractiveSidebar'
import { getStudioAIArtwork } from '../../lib/studio-artwork'
import type { StudioImageItem, PracticePartDef } from '../../lib/practice-parts'

export interface StudioSubmitArtworkModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmSubmit: () => void
  selectedImage?: StudioImageItem | null
  submittedCandidate?: StudioImageItem | null
  onSelectCandidate?: (image: StudioImageItem) => void
  gallery?: StudioImageItem[]
  currentPrompt?: string
  studentStars?: number
  effectiveCharacterName?: string
  practicePartDefs?: PracticePartDef[]
  activePartSubject?: string
  illustrationType?: string
  lessonId?: string
  submittedSuccess?: boolean
}

export function StudioSubmitArtworkModal({
  isOpen,
  onClose,
  onConfirmSubmit,
  selectedImage,
  submittedCandidate,
  onSelectCandidate,
  gallery = [],
  currentPrompt: _currentPrompt,
  studentStars: _studentStars,
  effectiveCharacterName = 'Nhân vật AIKI',
  practicePartDefs = [],
  activePartSubject,
  illustrationType,
  lessonId,
  submittedSuccess = false,
}: StudioSubmitArtworkModalProps) {
  if (!isOpen || typeof document === 'undefined') {
    return null
  }

  const activeCandidate = submittedCandidate ?? selectedImage ?? (gallery.length > 0 ? gallery[gallery.length - 1] : null)

  const handleSelect = (img: StudioImageItem) => {
    onSelectCandidate?.(img)
    playInstantSound('click')
  }

  return createPortal(
    <div
      data-testid="studio-submit-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-transparent p-2 sm:p-3 md:p-5 animate-fade-in"
      onClick={() => {
        if (!submittedSuccess) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-submit-title"
        className={cn(
          'flex max-h-[calc(100dvh-1rem)] w-full min-w-0 flex-col overflow-hidden rounded-3xl border-2 border-amber-300 bg-white shadow-2xl animate-scale-up sm:max-h-[calc(100dvh-1.5rem)]',
          gallery.length <= 1 ? 'max-w-3xl' : 'max-w-4xl'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {submittedSuccess ? (
          <div className="space-y-4 p-5 text-center sm:p-6">
            <div className="size-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-4xl animate-bounce">
              🏆
            </div>
            <h3 className="text-2xl font-black text-indigo-950">
              XUẤT SẮC QUÁ CẬU ƠI!
            </h3>
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl space-y-1 text-center">
              <p className="text-sm sm:text-base font-black text-emerald-800 flex items-center justify-center gap-1.5">
                <span>🎒</span>
                <span>Bức tranh đã được cất an toàn vào Balo Sáng Tạo của con!</span>
              </p>
              <p className="text-xs font-bold text-emerald-600">
                Con nhận được 3 Sao ⭐ và mở khóa bảo bối sáng tạo mới!
              </p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-amber-100 px-4 py-3 text-left sm:px-5">
              <div className="min-w-0">
                <h3 id="studio-submit-title" className="break-words text-base font-black text-indigo-950 sm:text-xl">
                  Chọn một tranh để nộp bài
                </h3>
                <p className="mt-0.5 text-xs font-medium leading-snug text-slate-600 sm:text-sm">
                  Chạm vào ảnh để xem rõ và chọn. Các tranh khác vẫn được cất trong Ba lô.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-lg font-black text-slate-600 hover:bg-slate-100 cursor-pointer"
                aria-label="Đóng cửa sổ chọn tranh"
              >
                ×
              </button>
            </div>

            {/* Lưới Triển Lãm các tranh đã vẽ trong gallery */}
            {gallery.length > 0 ? (
              <div
                className={cn(
                  'grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-4 sm:p-5',
                  gallery.length === 1 && 'mx-auto w-full max-w-xl',
                  gallery.length === 2 && 'sm:grid-cols-2',
                  gallery.length >= 3 && 'sm:grid-cols-2 lg:grid-cols-3'
                )}
              >
                {gallery.map((img) => {
                  const isSelected = activeCandidate?.id === img.id
                  const pIdx = img.partIndex !== undefined ? img.partIndex : Math.floor((img.turn - 1) / 2)
                  const partDef = practicePartDefs[pIdx] || practicePartDefs[0]
                  const itemTitle = partDef?.title || activePartSubject || effectiveCharacterName
                  const turnNumber = img.partTurn || ((img.turn % 2 === 0 ? 2 : 1) as 1 | 2)

                  return (
                    <button
                      type="button"
                      key={img.id}
                      onClick={() => handleSelect(img)}
                      className={cn(
                        'group relative flex min-w-0 max-h-full flex-col overflow-hidden rounded-2xl border-2 p-2 text-left cursor-pointer transition-all',
                        isSelected
                          ? 'border-amber-400 bg-amber-50/90 ring-3 ring-amber-400 scale-[1.02] shadow-clay-sm'
                          : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/40 shadow-2xs'
                      )}
                    >
                      {isSelected && (
                        <span className="absolute -top-2 left-2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs uppercase tracking-wide z-10">
                          ĐANG CHỌN
                        </span>
                      )}

                      <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                        <img
                          src={img.url || getStudioAIArtwork(illustrationType as any, lessonId, img.prompt || itemTitle)}
                          alt={img.prompt}
                          className="block max-h-[52dvh] max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.01]"
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

                      <div className="shrink-0 space-y-0.5 px-0.5 pt-2">
                        <div className="text-xs font-black text-slate-800 flex min-w-0 items-center gap-1">
                          <span>{partDef?.icon || '🎨'}</span>
                          <span className="truncate">{itemTitle} · Lượt {turnNumber}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="m-4 py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-xs sm:text-sm font-bold text-slate-500">
                  Bé chưa vẽ bức tranh nào. Hãy vẽ ít nhất 1 bức tranh rồi quay lại nộp nhé!
                </p>
              </div>
            )}

            <div className="grid shrink-0 grid-cols-1 gap-2 border-t border-slate-100 bg-white px-4 py-3 sm:grid-cols-[1fr_auto] sm:px-5">
              <button
                type="button"
                data-testid="studio-confirm-submit"
                onClick={onConfirmSubmit}
                disabled={gallery.length === 0 && !activeCandidate}
                className={cn(
                  'min-h-12 rounded-2xl px-6 py-2.5 text-white font-black text-sm shadow-clay active:scale-95 cursor-pointer transition-all',
                  gallery.length === 0 && !activeCandidate
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                )}
              >
                Nộp ảnh đã chọn
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-12 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Tiếp tục xem tranh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
