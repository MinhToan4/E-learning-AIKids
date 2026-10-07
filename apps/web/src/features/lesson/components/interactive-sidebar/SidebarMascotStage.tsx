import React from 'react'
import {
  ChevronRight,
  RotateCcw,
  Square,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { MeeTutorAvatar, type MeeTutorPose } from '../MeeTutorAvatar'
import { MeeCatInteractiveCanvas } from '@/features/mee-rig/components/MeeCatInteractiveCanvas'
import type { Gesture } from '@/features/mee-rig/hooks/useMeeCatSpeech'

export interface SidebarMascotStageProps {
  stages?: Array<{ id: string; label: string; kind?: string }>
  currentStageIndex: number
  guideCopyTitle?: string
  liveStars: number
  isMuted: boolean
  isSpeaking: boolean
  onToggleMute: () => void
  onCollapse: () => void
  hideMascot?: boolean
  isVideoPlaying?: boolean
  dynamicPose: MeeTutorPose
  coachSpeech: string
  gesture?: Gesture
  onSpeechEnd?: () => void
  onStopSpeaking: () => void
  onSpeakText: (text: string) => void
}

export function SidebarMascotStage({
  stages,
  currentStageIndex,
  guideCopyTitle,
  liveStars,
  isMuted,
  isSpeaking,
  onToggleMute,
  onCollapse,
  hideMascot = false,
  isVideoPlaying = false,
  dynamicPose,
  coachSpeech,
  gesture,
  onSpeechEnd,
  onStopSpeaking,
  onSpeakText,
}: SidebarMascotStageProps) {
  return (
    <>
      {/* Header: Stage Title + Mute + Collapse button */}
      <div className="flex items-center justify-between gap-3 border-b-2 border-slate-100 pb-2 shrink-0">
        <div className="min-w-0 flex-1 flex items-center gap-2">
          <h2
            id="lesson-interactive-sidebar-title"
            className="font-display text-sm sm:text-base font-black text-slate-900 leading-snug truncate"
          >
            {stages?.[currentStageIndex]
              ? `Chặng ${currentStageIndex + 1}/5: ${stages[currentStageIndex].label}`
              : guideCopyTitle || `Chặng ${(currentStageIndex || 0) + 1}/5`}
          </h2>
          {liveStars > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-black text-amber-800 shadow-2xs shrink-0">
              <Star className="size-3 fill-amber-400 text-amber-500" />
              <span>{liveStars}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Nút Mute / Unmute */}
          <button
            type="button"
            onClick={onToggleMute}
            className={cn(
              'grid size-8 sm:size-9 place-items-center rounded-full border-2 transition-all cursor-pointer shadow-2xs active:scale-95',
              isMuted
                ? 'border-slate-300 bg-slate-100 text-slate-400 hover:bg-slate-200'
                : isSpeaking
                  ? 'border-brand-400 bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                  : 'border-brand-200 bg-white text-brand-700 hover:bg-brand-50',
            )}
            title={isMuted ? 'Bật tiếng AIKI (Unmute)' : 'Tắt tiếng AIKI (Mute)'}
            aria-label={isMuted ? 'Bật tiếng AIKI' : 'Tắt tiếng AIKI'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Nút Thu gọn trên desktop */}
          <button
            type="button"
            onClick={onCollapse}
            className="hidden xl:grid size-8 sm:size-9 place-items-center rounded-full border-2 border-brand-200 bg-white text-brand-700 hover:bg-brand-50 transition cursor-pointer shadow-2xs active:scale-95"
            title="Thu gọn bảng tương tác"
            aria-label="Thu gọn"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Sân khấu Mèo AIKI Live Character Rig (Ẩn khi hideMascot === true) */}
      {!hideMascot && (
        <div className="flex flex-col items-center justify-center relative w-full pt-1 pb-1 shrink-0">
          <div className="w-full h-52 sm:h-60 relative flex items-center justify-center">
            <MeeCatInteractiveCanvas
              variant="full-body"
              transparentBackground={true}
              state={
                isVideoPlaying || isSpeaking
                  ? 'talk'
                  : currentStageIndex === 4
                    ? 'celebrate'
                    : 'idle'
              }
              gesture={
                currentStageIndex === 1
                  ? 'point-left'
                  : currentStageIndex === 2
                    ? 'explain'
                    : currentStageIndex === 3
                      ? 'think'
                      : currentStageIndex === 4
                        ? 'celebrate'
                        : 'point-left'
              }
              isSpeaking={isVideoPlaying || isSpeaking}
              speechText={coachSpeech}
              className="w-full h-full drop-shadow-md select-none pointer-events-none"
            />
          </div>
          {/* Badge trạng thái Mèo AIKI */}
          <div className="-mt-2 mb-1 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-amber-200 text-xs font-black text-amber-900 shadow-2xs">
              <span
                className={cn(
                  'size-2 rounded-full',
                  isVideoPlaying || isSpeaking
                    ? 'bg-mint-500 animate-pulse'
                    : 'bg-amber-400',
                )}
              />
              {isVideoPlaying || isSpeaking
                ? 'Mèo AIKI đang giảng giải...'
                : 'Gia sư AIKI đồng hành'}
            </span>
          </div>
        </div>
      )}

      {/* Coach Speech Bubble với Avatar Mèo AIKI Mini */}
      <div className="rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-cream-50 to-orange-50/70 p-2.5 sm:p-3 shadow-2xs animate-fade-up shrink-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <div className="size-8 sm:size-9 rounded-2xl border-2 border-amber-300 bg-amber-100 shadow-2xs overflow-hidden flex items-center justify-center">
                <MeeTutorAvatar
                  pose={dynamicPose}
                  className="size-full scale-110"
                  isSpeaking={isSpeaking}
                  speechText={coachSpeech}
                  gesture={gesture}
                  onSpeechEnd={onSpeechEnd}
                />
              </div>
              {isSpeaking && (
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-mint-500 border-2 border-white shadow-2xs animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-900 leading-tight">
                Lời thoại của AIKI
              </p>
              {isSpeaking && (
                <span className="text-[10px] font-bold text-mint-600 block animate-pulse">
                  Đang trò chuyện...
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              isSpeaking ? onStopSpeaking() : onSpeakText(coachSpeech)
            }
            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:text-brand-800 bg-brand-100/80 hover:bg-brand-200/80 px-2.5 py-1 rounded-full cursor-pointer transition-colors shadow-2xs"
            title={isSpeaking ? 'Dừng đọc' : 'Nghe AIKI đọc'}
          >
            {isSpeaking ? <Square size={11} /> : <RotateCcw size={11} />}
            <span>{isSpeaking ? 'Dừng' : 'Nghe lại'}</span>
          </button>
        </div>
        <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-800 pl-0.5">
          {coachSpeech}
        </p>
      </div>
    </>
  )
}
