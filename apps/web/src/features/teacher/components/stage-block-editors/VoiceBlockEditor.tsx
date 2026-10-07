import React from 'react'
import { Volume2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { MeeCatInteractiveCanvas } from '@/features/mee-rig/components/MeeCatInteractiveCanvas'
import { LECTURE_GESTURES, type StageBlockEditorBaseProps } from './types'

export interface VoiceBlockEditorProps extends StageBlockEditorBaseProps {
  previewAikiVoice: (index: number, text: string) => void
  previewSpeakingIndex: number | null
}

export function VoiceBlockEditor({
  stageIndex,
  card,
  readOnly,
  updateLearnCard,
  uploadingStageMedia,
  uploadLearnCardMedia,
  previewAikiVoice,
  previewSpeakingIndex,
  inputStyle,
  textareaStyle,
}: VoiceBlockEditorProps) {
  return (
    <div className="mt-3.5 rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-brand-50/80 via-sky-50/50 to-white p-4 shadow-sm">
      <div className="mb-3 flex items-start gap-2 rounded-xl bg-amber-50/90 border border-amber-200/80 p-2.5 text-xs text-amber-900">
        <span className="text-base select-none shrink-0">💡</span>
        <div>
          <p className="font-bold">Trợ lý âm thanh đồng hành (Voice Companion):</p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Lời thoại và giọng đọc của Mèo AIKI được phát ngầm hoặc thu gọn dưới dạng trợ lý âm thanh, tối ưu 100% diện tích màn hình để các bé tập trung vào bài học chính.
          </p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-stretch">
        <div className="flex flex-col justify-between gap-3">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
              Lời đọc cho bé <span className="font-semibold normal-case text-muted">(để trống AIKI sẽ đọc nội dung bài)</span>
              <textarea
                readOnly={readOnly}
                value={card.mee?.readText ?? ''}
                onChange={(event) => updateLearnCard(stageIndex, {
                  mee: {
                    ...(card.mee ?? { readText: '', gesture: 'presentation', autoRead: false }),
                    readText: event.target.value,
                    voiceProvider: 'vertex',
                    gesture: (card.mee?.gesture as any) ?? 'presentation',
                    autoRead: card.mee?.autoRead ?? false,
                  }
                })}
                rows={2}
                style={{ ...textareaStyle, marginTop: '0.25rem', minHeight: '3.25rem' }}
                placeholder="Rút gọn thành 1–2 câu dễ hiểu, vui tươi và tràn đầy năng lượng..."
              />
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700">
              Audio Vertex AI (StoryMee Hub)
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="url"
                  readOnly={readOnly}
                  value={card.mee?.audioUrl ?? ''}
                  onChange={(event) => updateLearnCard(stageIndex, {
                    mee: {
                      ...(card.mee ?? { readText: '', gesture: 'presentation', autoRead: false }),
                      audioUrl: event.target.value,
                      voiceProvider: 'vertex',
                    }
                  })}
                  style={{ ...inputStyle, marginTop: 0 }}
                  placeholder="https://cdn.example.com/aiki-voice.mp3"
                  className="flex-1 min-h-9"
                />
                {!readOnly && (
                  <label className="shrink-0 flex min-h-9 items-center justify-center gap-1 rounded-xl border-2 border-brand-200 bg-white px-2.5 text-[11px] font-black text-brand-700 hover:bg-brand-50 cursor-pointer shadow-2xs transition">
                    <Volume2 size={13} />
                    <span>{uploadingStageMedia === `${stageIndex}:audioUrl` ? 'Đang tải…' : 'Tải MP3'}</span>
                    <input
                      className="sr-only"
                      type="file"
                      accept="audio/mpeg,audio/mp4,audio/wav,audio/webm"
                      disabled={uploadingStageMedia !== null}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) void uploadLearnCardMedia(stageIndex, 'audioUrl', file)
                        event.currentTarget.value = ''
                      }}
                    />
                  </label>
                )}
              </div>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-brand-100/60">
            <label className="min-w-44 flex-1 text-[11px] font-black uppercase tracking-wider text-slate-700">
              Cử chỉ giảng dạy
              <select
                disabled={readOnly}
                value={card.mee?.gesture ?? 'presentation'}
                onChange={(event) => updateLearnCard(stageIndex, {
                  mee: {
                    ...(card.mee ?? { readText: '', gesture: 'presentation', autoRead: false }),
                    gesture: event.target.value as any,
                  }
                })}
                style={{ ...inputStyle, marginTop: '0.25rem', height: '2.4rem' }}
              >
                {LECTURE_GESTURES.map((g) => (
                  <option key={g.id} value={g.id}>{g.label}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer mt-4">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={card.mee?.autoRead ?? false}
                onChange={(event) => updateLearnCard(stageIndex, {
                  mee: {
                    ...(card.mee ?? { readText: '', gesture: 'presentation', autoRead: false }),
                    autoRead: event.target.checked,
                  }
                })}
                className="size-4 rounded text-brand-600 focus:ring-brand-400"
              />
              <span>Tự đọc khi mở chặng</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between rounded-2xl border-2 border-brand-200 bg-gradient-to-b from-brand-50 via-amber-50/60 to-white p-3 shadow-inner relative overflow-hidden">
          <div className="w-full flex items-center justify-between text-[10px] font-black text-brand-800">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Interactive Rig
            </span>
            <span className="uppercase opacity-75">
              {card.mee?.gesture ?? 'presentation'}
            </span>
          </div>

          <div className="h-44 w-full flex items-center justify-center my-1">
            <MeeCatInteractiveCanvas
              variant="half-body"
              animated={true}
              transparentBackground={true}
              state={card.mee?.gesture === 'think' ? 'look' : card.mee?.gesture === 'celebrate' || card.mee?.gesture === 'celebrate-1' ? 'celebrate' : previewSpeakingIndex === stageIndex ? 'talk' : 'idle'}
              gesture={(card.mee?.gesture as any) ?? 'presentation'}
              isSpeaking={previewSpeakingIndex === stageIndex}
              speechText={card.mee?.readText || card.body}
              className="size-full max-h-44"
            />
          </div>

          <button
            type="button"
            onClick={() => previewAikiVoice(stageIndex, card.mee?.readText?.trim() || card.body)}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-black transition active:scale-95 shadow-xs cursor-pointer shrink-0 whitespace-nowrap",
              previewSpeakingIndex === stageIndex
                ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                : "bg-brand-600 hover:bg-brand-700 text-white"
            )}
          >
            <Volume2 size={15} className="shrink-0" />
            <span>{previewSpeakingIndex === stageIndex ? 'Dừng đọc & lipsync' : '🔊 Nghe thử giọng & Lipsync'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
