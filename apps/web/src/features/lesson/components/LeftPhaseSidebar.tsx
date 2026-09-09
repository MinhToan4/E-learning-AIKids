import React, { useCallback, useEffect, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Circle, Lightbulb, MessageCircle, RotateCcw, Square, Target, Volume2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { LectureVideo } from '@/features/lesson/components/LectureVideo'
import { Button } from '@/shared/components/ui/Button'
import { MeeTutorAvatar, type MeeTutorPose } from './MeeTutorAvatar'
import type { Gesture } from '@/features/mee-rig/hooks/useMeeCatSpeech'

export type Phase = 'learn' | 'game' | 'practice' | 'check' | 'done'
export type PoseType = MeeTutorPose

interface Props {
  className?: string
  guideCopy: {
    eyebrow: string
    title: string
    body: string
    pose: PoseType
  }
  videoUrl?: string | null
  videoTitle?: string
  phase: Phase
  maxUnlockedPhase: Phase
  goals: string[]
  product?: string
  successCriteria?: string[]
  narrationText?: string
  hints?: string[]
  autoRead?: boolean
  gesture?: Gesture
  narrationKey?: string | number
  stages?: Array<{ id: string; label: string; kind?: string }>
  currentStageIndex?: number
  onSelectStage?: (index: number) => void
  isCollapsed?: boolean
  onToggleCollapse?: (collapsed: boolean) => void
}

const LEARNING_STEPS = [
  { id: 'learn' as const, label: 'Khám phá' },
  { id: 'game' as const, label: 'Thử cùng Mee' },
  { id: 'practice' as const, label: 'Tự tay làm' },
  { id: 'check' as const, label: 'Thử thách' },
]

const PHASE_ORDER: Phase[] = ['learn', 'game', 'practice', 'check', 'done']

export function LeftPhaseSidebar({
  className,
  guideCopy,
  videoUrl,
  videoTitle,
  phase,
  maxUnlockedPhase,
  goals,
  product,
  successCriteria = [],
  narrationText,
  hints = [],
  autoRead = false,
  gesture = 'presentation',
  narrationKey,
  stages,
  currentStageIndex,
  onSelectStage,
  isCollapsed,
  onToggleCollapse,
}: Props) {
  const [showHint, setShowHint] = useState(false)
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const collapsed = isCollapsed !== undefined ? isCollapsed : internalCollapsed
  const setCollapsed = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(collapsed) : val
    setInternalCollapsed(nextVal)
    onToggleCollapse?.(nextVal)
  }
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const currentPhaseIndex = PHASE_ORDER.indexOf(phase === 'done' ? 'check' : phase)
  const currentPhaseLabel = (stages && stages.length > 0)
    ? (stages[currentStageIndex ?? 0]?.label ?? 'Quy tắc AIKI')
    : (LEARNING_STEPS[currentPhaseIndex]?.label ?? 'Hoàn thành')
  const speechText = narrationText?.trim() || guideCopy.body
  const activeSpeechText = showHint ? (hints[hintLevel] ?? speechText) : speechText
  const stopSpeaking = useCallback(() => {
    setIsSpeaking(false)
    window.speechSynthesis?.cancel()
  }, [])

  useEffect(() => {
    setShowHint(false)
    setHintLevel(0)
    stopSpeaking()
    if (!autoRead || !speechText.trim()) return
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
    setIsSpeaking(true)
  }, [autoRead, narrationKey, speechText, stopSpeaking])

  useEffect(() => stopSpeaking, [stopSpeaking])

  const isAikiMode = Boolean(stages && stages.length > 0)

  return (
    <aside className={cn(
      'lesson-guide-panel fixed bottom-20 right-3 z-30 max-h-[calc(100dvh-7rem)] shrink-0 self-start overflow-y-auto rounded-3xl border-2 border-brand-200 bg-white p-3 shadow-clay transition-[width] duration-200 lg:sticky lg:top-4 lg:bottom-auto lg:right-auto lg:z-auto',
      collapsed ? 'w-[68px] sm:w-[76px]' : 'w-[min(22rem,calc(100vw-1.5rem))] lg:w-[300px]',
      className
    )} aria-labelledby="lesson-guide-title">
      {collapsed ? (
        <div className="flex flex-col items-center gap-2.5 py-1">
          <div
            className="relative group cursor-pointer"
            onClick={() => setCollapsed(false)}
            title="Mở rộng trợ lý Mee"
          >
            <MeeTutorAvatar
              pose={guideCopy.pose}
              className="size-12 sm:size-14 transition-transform group-hover:scale-110"
              isSpeaking={isSpeaking}
              speechText={activeSpeechText}
              gesture={gesture}
              onSpeechEnd={() => setIsSpeaking(false)}
            />
            <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-mint-500 border-2 border-white shadow-2xs" />
          </div>
          <span className="font-display text-xs sm:text-sm font-black text-brand-800">Mee</span>
          <span className="rounded-xl bg-brand-50 px-2 py-1 text-center text-[10px] sm:text-[11px] font-extrabold leading-tight text-brand-700 max-w-[64px] truncate">{currentPhaseLabel}</span>
          {isAikiMode ? (
            <div className="my-1 grid gap-2" aria-label={`Tiến trình trạm: chặng ${Math.min((currentStageIndex ?? 0) + 1, stages!.length)} trên ${stages!.length}`}>
              {stages!.map((step, index) => (
                <button
                  key={step.id || index}
                  type="button"
                  onClick={() => onSelectStage?.(index)}
                  className={cn(
                    'size-3 rounded-full border-2 transition-transform hover:scale-125 cursor-pointer',
                    index < (currentStageIndex ?? 0)
                      ? 'border-mint-500 bg-mint-500'
                      : index === (currentStageIndex ?? 0)
                        ? 'border-brand-600 bg-brand-100 ring-2 ring-brand-300'
                        : 'border-border bg-white',
                  )}
                  title={step.label}
                  aria-label={step.label}
                />
              ))}
            </div>
          ) : (
            <div className="my-1 grid gap-2" aria-label={`Tiến trình trạm: bước ${Math.min(currentPhaseIndex + 1, 4)} trên 4`}>
              {LEARNING_STEPS.map((step, index) => (
                <span
                  key={step.id}
                  className={cn(
                    'size-3 rounded-full border-2',
                    index < currentPhaseIndex || phase === 'done'
                      ? 'border-mint-500 bg-mint-500'
                      : index === currentPhaseIndex
                        ? 'border-brand-600 bg-brand-100'
                        : 'border-border bg-white',
                  )}
                  title={step.label}
                  aria-hidden="true"
                />
              ))}
            </div>
          )}
          {!isAikiMode && (
            <button
              type="button"
              onClick={() => {
                setCollapsed(false)
                setShowHint(true)
              }}
              className="grid size-11 place-items-center rounded-2xl border-2 border-sun-200 bg-sun-50 text-sun-700 hover:bg-sun-100 transition shadow-xs"
              aria-label="Mở gợi ý từ Mee"
              title="Mở gợi ý từ Mee"
            >
              <Lightbulb size={20} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="grid size-11 place-items-center rounded-2xl border-2 border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 hover:scale-105 transition shadow-xs cursor-pointer"
            aria-label="Mở rộng trợ lý Mee"
            title="Mở rộng trợ lý Mee"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
        </div>
      ) : isAikiMode ? (
        <div className="flex flex-col">
          {/* Khung 1: Bạn Mèo AIKI */}
          <div className="flex items-center gap-3 border-b-2 border-border pb-3">
            <MeeTutorAvatar
              pose={guideCopy.pose}
              className="size-16 shrink-0"
              isSpeaking={isSpeaking}
              speechText={activeSpeechText}
              gesture={gesture}
              onSpeechEnd={() => setIsSpeaking(false)}
            />
            <div className="min-w-0 flex-1 text-left">
              <p className="flex items-center gap-1 text-xs font-extrabold text-coral-600">
                <MessageCircle size={15} aria-hidden="true" /> Mee đang hỗ trợ
              </p>
              <h2 id="lesson-guide-title" className="font-display text-lg leading-tight text-text">
                {guideCopy.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="grid size-11 shrink-0 place-items-center rounded-2xl border-2 border-border bg-white text-brand-700 hover:bg-brand-50 transition shadow-xs cursor-pointer"
              aria-label="Thu gọn trợ giảng Mee"
              title="Thu gọn trợ lý Mee để mở rộng không gian học"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>

          <div
            key={guideCopy.title + guideCopy.body}
            className="mt-3 rounded-2xl bg-brand-50 p-4 text-left animate-[feedback-pop_0.4s_ease-out]"
          >
            <p className="text-xs font-extrabold text-brand-700">{guideCopy.eyebrow}</p>
            <p className="mt-1.5 text-sm font-semibold leading-relaxed text-text">
              {guideCopy.body}
            </p>
          </div>

          {/* Khung 2: Hành trình 5 chặng */}
          <section className="mt-4 border-t-2 border-border pt-4" aria-labelledby="mee-journey-title">
            <h3 id="mee-journey-title" className="font-display text-base text-text">
              Hành trình trạm
            </h3>
            <ol className="mt-2 grid gap-2">
              {stages!.map((step, index) => {
                const complete = index < (currentStageIndex ?? 0)
                const active = index === (currentStageIndex ?? 0)
                return (
                  <li
                    key={step.id || index}
                    onClick={() => onSelectStage?.(index)}
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-sm font-extrabold cursor-pointer transition',
                      active
                        ? 'border-2 border-brand-500 bg-brand-100 text-brand-900 shadow-xs'
                        : complete
                          ? 'border-2 border-transparent bg-mint-50 text-mint-800 hover:bg-mint-100'
                          : 'border-2 border-transparent bg-surface text-muted hover:bg-brand-50/50',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-7 shrink-0 place-items-center rounded-full',
                        complete
                          ? 'bg-mint-200 text-mint-700'
                          : active
                            ? 'bg-white text-brand-700 shadow-xs'
                            : 'bg-white text-muted',
                      )}
                      aria-hidden="true"
                    >
                      {complete ? <Check size={17} /> : <Circle size={13} />}
                    </span>
                    <span className="flex-1 text-left line-clamp-1">{step.label}</span>
                    <span className="ml-auto text-xs font-bold">
                      {complete ? 'Xong' : active ? 'Đang học' : 'Tiếp theo'}
                    </span>
                  </li>
                )
              })}
            </ol>
          </section>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center gap-3 border-b-2 border-border pb-3">
            <MeeTutorAvatar pose={guideCopy.pose} className="size-16 shrink-0" isSpeaking={isSpeaking} speechText={activeSpeechText} gesture={showHint ? 'idea' : gesture} onSpeechEnd={() => setIsSpeaking(false)} />
            <div className="min-w-0 flex-1 text-left">
              <p className="flex items-center gap-1 text-xs font-extrabold text-coral-600"><MessageCircle size={15} aria-hidden="true" /> Mee đang hỗ trợ</p>
              <h2 id="lesson-guide-title" className="font-display text-lg leading-tight text-text">{guideCopy.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="grid size-11 shrink-0 place-items-center rounded-2xl border-2 border-border bg-white text-brand-700 hover:bg-brand-50 transition shadow-xs cursor-pointer"
              aria-label="Thu gọn trợ giảng Mee"
              title="Thu gọn trợ lý Mee để mở rộng không gian học"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>

          <div key={guideCopy.title + guideCopy.body} className="mt-3 rounded-2xl bg-brand-50 p-4 text-left animate-[feedback-pop_0.4s_ease-out]">
            <p className="text-xs font-extrabold text-brand-700">{guideCopy.eyebrow}</p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-text">{guideCopy.body}</p>
          </div>

          {showHint && (
            <div className="mt-3 rounded-2xl border-2 border-sun-200 bg-sun-50 p-3 text-left animate-pop" role="status">
              <p className="flex items-center gap-2 text-sm font-extrabold text-sun-700"><Lightbulb size={18} aria-hidden="true" /> Mee gợi ý</p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-text">{hints[hintLevel] ?? 'Làm từng bước từ trên xuống. Sau mỗi bước, con hãy tự kiểm tra lại trước khi tiếp tục.'}</p>
            </div>
          )}

          {videoUrl && (
            <div className="mt-3 w-full animate-fade-up">
              <LectureVideo title={videoTitle || ''} url={videoUrl} />
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Button className="flex-1" variant="secondary" onClick={() => { setShowHint(true); if (showHint && hints.length > 1) setHintLevel((level) => Math.min(level + 1, hints.length - 1)) }} aria-expanded={showHint}>
              <Lightbulb size={18} aria-hidden="true" />
              {showHint && hintLevel < hints.length - 1 ? 'Gợi ý thêm' : showHint ? 'Đang gợi ý' : 'Gợi ý cho con'}
            </Button>
            <Button variant="secondary" onClick={() => isSpeaking ? stopSpeaking() : setIsSpeaking(true)} aria-label={isSpeaking ? 'Dừng Mèo Mee đọc' : 'Nghe Mèo Mee đọc'}>
              {isSpeaking ? <Square size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
              {isSpeaking ? 'Dừng' : 'Mee đọc'}
            </Button>
            {videoUrl && (
              <Button variant="ghost" onClick={() => setShowHint(false)}>
                <RotateCcw size={18} aria-hidden="true" />
                Xem lại
              </Button>
            )}
          </div>

          <section className="mt-4 border-t-2 border-border pt-4" aria-labelledby="mee-journey-title">
            <h3 id="mee-journey-title" className="font-display text-base text-text">Hành trình trạm</h3>
            <ol className="mt-2 grid gap-2">
              {LEARNING_STEPS.map((step, index) => {
                const currentIndex = PHASE_ORDER.indexOf(phase === 'done' ? 'check' : phase)
                const maxIndex = PHASE_ORDER.indexOf(maxUnlockedPhase === 'done' ? 'check' : maxUnlockedPhase)
                const complete = index < currentIndex || phase === 'done'
                const active = index === currentIndex && phase !== 'done'
                const available = index <= maxIndex
                return (
                  <li key={step.id} className={cn(
                    'flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-sm font-extrabold',
                    active ? 'bg-brand-100 text-brand-800' : complete ? 'bg-mint-50 text-mint-800' : 'bg-surface text-muted',
                    !available && 'opacity-60',
                  )}>
                    <span className={cn('grid size-7 shrink-0 place-items-center rounded-full', complete ? 'bg-mint-200' : active ? 'bg-white' : 'bg-white')} aria-hidden="true">
                      {complete ? <Check size={17} /> : <Circle size={13} />}
                    </span>
                    <span>{step.label}</span>
                    <span className="ml-auto text-xs">{complete ? 'Xong' : active ? 'Đang học' : available ? 'Đã mở' : 'Tiếp theo'}</span>
                  </li>
                )
              })}
            </ol>
          </section>

          <section className="mt-4 rounded-2xl border-2 border-mint-200 bg-mint-50 p-3 text-left" aria-labelledby="mee-goals-title">
            <h3 id="mee-goals-title" className="flex items-center gap-2 font-display text-base text-mint-800"><Target size={19} aria-hidden="true" /> Mục tiêu của con</h3>
            <ul className="mt-2 grid gap-2">
              {(phase === 'practice' && successCriteria.length > 0 ? successCriteria : goals).slice(0, 4).map((goal) => (
                <li key={goal} className="flex gap-2 text-sm font-semibold leading-snug text-text">
                  <Check size={17} className="mt-0.5 shrink-0 text-mint-700" aria-hidden="true" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
            {product && (
              <div className="mt-3 border-t border-mint-200 pt-3">
                <p className="text-xs font-extrabold uppercase text-mint-700">Con sẽ lưu</p>
                <p className="mt-1 text-sm font-bold leading-snug text-text">{product}</p>
              </div>
            )}
          </section>
        </div>
      )}
    </aside>
  )
}
