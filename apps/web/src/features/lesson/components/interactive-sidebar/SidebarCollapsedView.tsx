import React from 'react'
import { ChevronLeft, Lightbulb } from 'lucide-react'
import { MeeTutorAvatar, type MeeTutorPose } from '../MeeTutorAvatar'
import type { Gesture } from '@/features/mee-rig/hooks/useMeeCatSpeech'

export interface SidebarCollapsedViewProps {
  onExpand: () => void
  hideMascotAvatar?: boolean
  dynamicPose: MeeTutorPose
  isSpeaking: boolean
  coachSpeech: string
  gesture?: Gesture
  onSpeechEnd?: () => void
  liveStars: number
}

export function SidebarCollapsedView({
  onExpand,
  hideMascotAvatar,
  dynamicPose,
  isSpeaking,
  coachSpeech,
  gesture,
  onSpeechEnd,
  liveStars,
}: SidebarCollapsedViewProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onExpand}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onExpand()
        }
      }}
      className="flex flex-col items-center justify-between h-full min-h-[380px] sm:min-h-[420px] py-1 gap-3 w-full cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-2xl"
      title="Bấm để mở rộng hỗ trợ AIKI"
      aria-label="Mở rộng bảng hỗ trợ AIKI"
    >
      {/* Top: Avatar Mascot AIKI */}
      <div className="flex flex-col items-center gap-1.5 pt-1">
        <div className="relative group">
          {hideMascotAvatar ? (
            <div className="size-12 sm:size-14 rounded-2xl bg-amber-100 border-2 border-amber-300 grid place-items-center text-amber-800 shadow-xs group-hover:scale-105 transition-transform">
              <Lightbulb size={24} className="text-amber-600" />
            </div>
          ) : (
            <div className="relative">
              <MeeTutorAvatar
                pose={dynamicPose}
                className="size-12 sm:size-14 transition-transform group-hover:scale-110 drop-shadow-md"
                isSpeaking={isSpeaking}
                speechText={coachSpeech}
                gesture={gesture}
                onSpeechEnd={onSpeechEnd}
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 size-3.5 sm:size-4 rounded-full bg-mint-500 ring-2 ring-white shadow-xs"
                title="Trợ lý AIKI sẵn sàng"
              />
            </div>
          )}
        </div>

        {/* Tag nhận diện Soft Clay */}
        <span className="font-display text-[10px] sm:text-[11px] font-black text-brand-800 tracking-tight text-center whitespace-nowrap px-1.5 py-0.5 rounded-full bg-brand-50 border border-brand-100 shadow-2xs">
          Hỗ trợ AIKI
        </span>
      </div>

      {/* Middle: Khối sao tiến độ */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-amber-800 bg-amber-50 border-2 border-amber-300 px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
          <span>⭐</span>
          <span>{liveStars}/3</span>
        </div>
        <span className="text-[10px] font-bold text-slate-500 tracking-tight">Tiến độ</span>
      </div>

      {/* Bottom: Nút mở rộng ở chân (Pill Soft Clay màu brand với icon ChevronLeft kèm chữ "Mở") */}
      <div className="flex items-center justify-center gap-1 w-full py-2 px-1.5 rounded-2xl border-2 border-brand-300 bg-brand-500 text-white font-black text-xs shadow-clay group-hover:bg-brand-600 transition-colors">
        <ChevronLeft size={16} className="shrink-0" />
        <span className="tracking-wide">Mở</span>
      </div>
    </div>
  )
}
