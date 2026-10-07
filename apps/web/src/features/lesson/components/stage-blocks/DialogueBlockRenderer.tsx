import React from 'react'
import { MessageSquareText, Square, Volume2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import {
  type LearnCardDraft,
  type StageBlockItem,
  type ParsedDialogue,
  type DialogueLine,
  parseComicDialogue,
} from '@/features/teacher/lib/authoring'

export interface DialogueBlockRendererProps {
  block: StageBlockItem
  card: LearnCardDraft
  isNarrating: boolean
  speakingLineIndex: number
  activeSpeaker: string | null
  onPlaySituation: (dialogues: any[], fullText?: string) => void
  onStopSituationNarrator: () => void
}

export function DialogueBlockRenderer({
  block,
  card,
  isNarrating,
  speakingLineIndex,
  activeSpeaker,
  onPlaySituation,
  onStopSituationNarrator,
}: DialogueBlockRendererProps) {
  const dialogueSource = block.tip || block.body || card.tip || card.body
  const parsedDialogues = parseComicDialogue(dialogueSource)
  const defaultDialogues: ParsedDialogue[] = [
    { id: 'd-1', speaker: 'zico', speakerName: 'Zico', text: 'Của tớ đẹp hơn!' },
    { id: 'd-2', speaker: 'sonet', speakerName: 'Sonet', text: 'Không, của tớ đúng hơn!' },
    { id: 'd-3', speaker: 'aki', speakerName: 'Mèo AIKI', text: 'DỪNG LẠIIII...! Các cậu ơi, hãy giúp tớ vụ này!' },
  ]
  const lines = (block.dialogueLines && block.dialogueLines.length > 0)
    ? block.dialogueLines.map((d: DialogueLine) => ({
        id: d.id,
        speaker: d.speaker,
        speakerName:
          d.speaker === 'zico'
            ? 'Zico (áo cam)'
            : d.speaker === 'sonet'
            ? 'Sonet (áo xanh)'
            : d.speaker === 'aki'
            ? 'Mèo AIKI'
            : d.speaker === 'teacher'
            ? 'Cô giáo'
            : d.speaker,
        text: d.text,
        role: d.role || (d.speaker === 'zico' ? 'left' : d.speaker === 'sonet' ? 'right' : 'center'),
      }))
    : parsedDialogues.length > 0
    ? parsedDialogues
    : defaultDialogues

  return (
    <div
      key={block.id}
      data-testid="block-dialogue"
      className="rounded-3xl border-2 border-orange-200 bg-white/90 p-4 sm:p-5 shadow-sm text-left space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 pb-3">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-orange-800">
          <MessageSquareText size={18} className="text-orange-600" />
          {block.title || 'Kịch bản Phân vai Tình huống'}
        </div>
        <button
          type="button"
          onClick={() => {
            if (isNarrating) {
              onStopSituationNarrator()
            } else {
              onPlaySituation(lines, card.mee?.readText?.trim() || card.body)
            }
          }}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-xs font-black transition active:scale-95 shadow-xs cursor-pointer',
            isNarrating
              ? 'border-orange-500 bg-orange-500 text-white animate-pulse'
              : 'border-orange-300 bg-orange-50 text-orange-900 hover:bg-orange-100'
          )}
          aria-label={isNarrating ? 'Dừng kể tình huống' : 'Nghe AIKI kể tình huống'}
        >
          {isNarrating ? (
            <>
              <Square size={13} className="fill-current" />
              <span>⏹️ Đang kể... (Bấm để dừng)</span>
              <span className="flex items-center gap-0.5 ml-1">
                <span className="inline-block h-2 w-0.5 rounded-full bg-white animate-[bounce_0.8s_infinite_100ms]" />
                <span className="inline-block h-3 w-0.5 rounded-full bg-white animate-[bounce_0.8s_infinite_200ms]" />
                <span className="inline-block h-2 w-0.5 rounded-full bg-white animate-[bounce_0.8s_infinite_300ms]" />
              </span>
            </>
          ) : (
            <>
              <Volume2 size={15} />
              <span>🔊 Nghe AIKI kể tình huống</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-3.5 pt-1">
        {lines.map((d: ParsedDialogue, index: number) => {
          const isLeft = (d as any).role === 'left' || d.speaker === 'zico'
          const isRight = (d as any).role === 'right' || d.speaker === 'sonet'
          const isLineActive =
            isNarrating &&
            (speakingLineIndex === index || (speakingLineIndex === -1 && activeSpeaker === d.speaker))

          if (isLeft) {
            return (
              <div
                key={d.id}
                className={cn(
                  'flex items-start gap-3 max-w-[90%] sm:max-w-[80%] self-start animate-fade-up transition-all duration-300',
                  isLineActive && 'scale-[1.02]'
                )}
              >
                <div
                  className={cn(
                    'grid size-11 sm:size-12 shrink-0 place-items-center rounded-full bg-orange-100 border-2 text-xl shadow-xs transition-all',
                    isLineActive ? 'border-orange-500 ring-4 ring-orange-200 animate-bounce' : 'border-orange-300'
                  )}
                  title={d.speakerName || 'Zico'}
                >
                  👦
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 ml-1 mb-1">
                    <span className="text-xs sm:text-sm font-black uppercase text-orange-800">
                      {d.speakerName || 'Zico (áo cam)'}
                    </span>
                    {isLineActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-black text-white shadow-2xs animate-pulse">
                        <Volume2 size={10} /> Đang nói
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      'rounded-2xl rounded-tl-xs border-2 p-4 text-base sm:text-lg font-bold shadow-xs leading-relaxed transition-all',
                      isLineActive
                        ? 'border-orange-500 bg-orange-100 text-orange-950 ring-2 ring-orange-300 shadow-md'
                        : 'border-orange-200 bg-orange-50 text-orange-950'
                    )}
                  >
                    {d.text}
                  </div>
                </div>
              </div>
            )
          }

          if (isRight) {
            return (
              <div
                key={d.id}
                className={cn(
                  'flex flex-row-reverse items-start gap-3 max-w-[90%] sm:max-w-[80%] self-end animate-fade-up transition-all duration-300',
                  isLineActive && 'scale-[1.02]'
                )}
              >
                <div
                  className={cn(
                    'grid size-11 sm:size-12 shrink-0 place-items-center rounded-full bg-sky-100 border-2 text-xl shadow-xs transition-all',
                    isLineActive ? 'border-sky-500 ring-4 ring-sky-200 animate-bounce' : 'border-sky-300'
                  )}
                  title={d.speakerName || 'Sonet'}
                >
                  🧒
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mr-1 mb-1">
                    {isLineActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-black text-white shadow-2xs animate-pulse">
                        <Volume2 size={10} /> Đang nói
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-black uppercase text-sky-800">
                      {d.speakerName || 'Sonet (áo xanh)'}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'rounded-2xl rounded-tr-xs border-2 p-4 text-base sm:text-lg font-bold shadow-xs text-right leading-relaxed transition-all',
                      isLineActive
                        ? 'border-sky-500 bg-sky-100 text-sky-950 ring-2 ring-sky-300 shadow-md'
                        : 'border-sky-200 bg-sky-50 text-sky-950'
                    )}
                  >
                    {d.text}
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div
              key={d.id}
              className={cn(
                'w-full my-2 animate-pop transition-all duration-300',
                isLineActive && 'scale-[1.02]'
              )}
            >
              <div className="mx-auto flex max-w-xl flex-col items-center">
                <div
                  className={cn(
                    'mb-1.5 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs sm:text-sm font-black shadow-xs transition-all',
                    isLineActive
                      ? 'border-amber-400 bg-amber-200 text-amber-950 ring-2 ring-amber-300 animate-pulse'
                      : 'border-amber-300 bg-amber-100 text-amber-900'
                  )}
                >
                  <span>🐱</span>
                  <span>{d.speakerName || 'TIẾNG AIKI'}</span>
                  {isLineActive && (
                    <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                      <Volume2 size={9} /> Đang hô to
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    'w-full rounded-2xl border-2 p-4 sm:p-5 text-center font-black shadow-clay text-base sm:text-lg leading-relaxed transition-all',
                    isLineActive
                      ? 'border-brand-500 bg-gradient-to-r from-brand-100 via-amber-100 to-brand-100 text-brand-950 ring-2 ring-brand-300 shadow-lg'
                      : 'border-brand-300 bg-gradient-to-r from-brand-50 via-amber-50 to-brand-50 text-brand-950'
                  )}
                >
                  {d.text}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
