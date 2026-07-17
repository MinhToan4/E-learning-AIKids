import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Check, Sparkles, Trash2, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingCreature } from '@/components/feedback/States'
import { VideoGuideButton } from '@/components/game/VideoGuide'
import { CheerOverlay, useCheer } from '@/components/game/CheerBurst'
import { MASCOT_SRC, PROMPT_CHIPS } from '@/data/mock'
import { assemblePrompt, missingSlots, SLOT_LABELS } from '@/lib/prompt'
import { validateChildText } from '@/lib/safety'
import { generateImages } from '@/lib/generate'
import { useDemoStore } from '@/store/demo-store'
import type { PromptChip, PromptSlotKey } from '@/types'
import { cn } from '@/lib/cn'

const SLOTS: PromptSlotKey[] = [
  'character',
  'action',
  'environment',
  'mood',
  'style',
]

const SLOT_META: Record<
  PromptSlotKey,
  { emoji: string; tip: string; bar: string; soft: string; ring: string }
> = {
  character: {
    emoji: '🐱',
    tip: 'Ai là ngôi sao?',
    bar: 'bg-coral-400',
    soft: 'bg-coral-100',
    ring: 'ring-coral-400',
  },
  action: {
    emoji: '⚡',
    tip: 'Đang làm gì?',
    bar: 'bg-sky-400',
    soft: 'bg-sky-100',
    ring: 'ring-sky-400',
  },
  environment: {
    emoji: '🪐',
    tip: 'Ở đâu?',
    bar: 'bg-mint-400',
    soft: 'bg-mint-100',
    ring: 'ring-mint-400',
  },
  mood: {
    emoji: '💫',
    tip: 'Cảm xúc?',
    bar: 'bg-sun-400',
    soft: 'bg-sun-100',
    ring: 'ring-sun-400',
  },
  style: {
    emoji: '🎨',
    tip: 'Vẽ kiểu nào?',
    bar: 'bg-brand-500',
    soft: 'bg-brand-100',
    ring: 'ring-brand-500',
  },
}

/**
 * Large-touch prompt builder for ages 8–11:
 * - Big slots + big choice cards
 * - Tap chip → fills matching slot immediately (primary)
 * - Drag still works as secondary
 */
export function PromptStudioPage() {
  const navigate = useNavigate()
  const parts = useDemoStore((s) => s.selectedPromptParts)
  const setPromptChip = useDemoStore((s) => s.setPromptChip)
  const setFreeText = useDemoStore((s) => s.setFreeText)
  const setGenerationStage = useDemoStore((s) => s.setGenerationStage)
  const setGeneratedResults = useDemoStore((s) => s.setGeneratedResults)
  const generationStage = useDemoStore((s) => s.generationStage)
  const demoErrorMode = useDemoStore((s) => s.demoErrorMode)
  const addToast = useDemoStore((s) => s.addToast)
  const addStars = useDemoStore((s) => s.addStars)
  const privacy = useDemoStore((s) => s.privacy)

  const [activeChip, setActiveChip] = useState<PromptChip | null>(null)
  const [focusSlot, setFocusSlot] = useState<PromptSlotKey>('character')
  const [loading, setLoading] = useState(false)
  const [safetyMsg, setSafetyMsg] = useState<string | null>(null)
  const [showExtra, setShowExtra] = useState(false)
  const { cheer, fire } = useCheer()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
  )

  const sentence = useMemo(() => assemblePrompt(parts), [parts])
  const missing = missingSlots(parts)
  const filled = 5 - missing.length
  const ready = filled === 5

  // Chips for the slot user is filling now
  const trayChips = useMemo(
    () => PROMPT_CHIPS.filter((c) => c.slot === focusSlot),
    [focusSlot],
  )

  const place = (chip: PromptChip, slot?: PromptSlotKey) => {
    const target = slot ?? chip.slot
    if (chip.slot !== target) {
      addToast({
        type: 'info',
        title: 'Thẻ khác nhóm',
        description: `Thẻ này dành cho “${SLOT_LABELS[chip.slot]}”.`,
      })
      return
    }
    setPromptChip(target, chip)
    fire('Hay lắm!')
    addStars(3)

    // Auto-advance to next empty slot
    const simulated = { ...parts, [target]: chip }
    const next = SLOTS.find((s) => !simulated[s])
    if (next) setFocusSlot(next)
  }

  const onDragEnd = (e: DragEndEvent) => {
    setActiveChip(null)
    const chip = e.active.data.current?.chip as PromptChip | undefined
    const slot = e.over?.id as PromptSlotKey | undefined
    if (chip && slot) place(chip, slot)
  }

  const speak = () => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(
      ready
        ? `Câu của con: ${sentence}. Bấm tạo 3 ảnh nhé!`
        : `Hãy chọn ${SLOT_LABELS[focusSlot]}. ${SLOT_META[focusSlot].tip}`,
    )
    u.lang = 'vi-VN'
    window.speechSynthesis.speak(u)
  }

  const generate = async () => {
    if (!ready) {
      const first = missing[0]
      setFocusSlot(first)
      addToast({
        type: 'warning',
        title: 'Còn thiếu thẻ',
        description: `Chọn thêm: ${missing.map((m) => SLOT_LABELS[m]).join(', ')}`,
      })
      return
    }
    if (parts.freeText) {
      const check = validateChildText(parts.freeText)
      if (!check.ok) {
        setSafetyMsg(check.message ?? null)
        setShowExtra(true)
        return
      }
    }
    setLoading(true)
    try {
      const results = await generateImages(parts, {
        forceFail: demoErrorMode,
        onStage: setGenerationStage,
      })
      setGeneratedResults(results)
      setGenerationStage(null)
      addStars(25)
      fire('Siêu đỉnh!')
      navigate('/studio/compare')
    } catch {
      setGenerationStage(null)
      addToast({
        type: 'error',
        title: 'Chưa tạo được ảnh',
        description: 'Thử lại nhé — không mất điểm.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <LoadingCreature stage={generationStage} className="min-h-[280px]" />
      </div>
    )
  }

  const meta = SLOT_META[focusSlot]

  return (
    <div className="relative w-full pb-28 sm:pb-24">
      <CheerOverlay message={cheer} />

      {/* Hero */}
      <div className="mb-5 overflow-hidden rounded-[1.75rem] border-2 border-brand-100 bg-gradient-to-br from-brand-50 via-white to-sky-100 shadow-soft">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
          <img
            src={MASCOT_SRC}
            alt=""
            className="mx-auto size-24 shrink-0 sm:mx-0 sm:size-28"
            width={112}
            height={112}
          />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-sm font-bold text-brand-500">Nhiệm vụ đặc biệt</p>
            <h1 className="font-display text-3xl leading-tight text-text sm:text-4xl">
              Ghép thẻ · Tạo ảnh AI
            </h1>
            <p className="mt-2 text-base font-semibold text-muted">
              Chạm thẻ to bên dưới → thẻ nhảy vào ô. Đủ 5 ô thì bấm nút tím lớn!
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <ProgressPips filled={filled} parts={parts} focus={focusSlot} onFocus={setFocusSlot} />
              <Button variant="soft" size="sm" onClick={speak}>
                <Volume2 className="size-4" aria-hidden />
                Nghe
              </Button>
              <VideoGuideButton guideId="prompt" />
            </div>
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={(e) =>
          setActiveChip((e.active.data.current?.chip as PromptChip) ?? null)
        }
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveChip(null)}
      >
        {/* Big recipe slots */}
        <section className="mb-5">
          <h2 className="mb-3 font-display text-xl text-text sm:text-2xl">
            1. Bảng 5 ô của con
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {SLOTS.map((slot) => (
              <BigSlot
                key={slot}
                slot={slot}
                chip={parts[slot]}
                focused={focusSlot === slot}
                onFocus={() => setFocusSlot(slot)}
                onClear={() => {
                  setPromptChip(slot, undefined)
                  setFocusSlot(slot)
                }}
              />
            ))}
          </div>
        </section>

        {/* Sentence preview */}
        <div className="mb-5 rounded-2xl border-2 border-brand-200 bg-white px-4 py-4 shadow-soft sm:px-6">
          <p className="text-sm font-bold text-brand-600">Câu AI sẽ đọc</p>
          <p className="mt-1 font-display text-xl leading-snug text-text sm:text-2xl">
            {sentence}
          </p>
        </div>

        {/* Big chip picker for current slot */}
        <section className="mb-4">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-xl text-text sm:text-2xl">
                2. Chọn thẻ: {SLOT_LABELS[focusSlot]}
              </h2>
              <p className="text-base font-semibold text-muted">
                <span aria-hidden>{meta.emoji} </span>
                {meta.tip} — chạm 1 thẻ to là xong!
              </p>
            </div>
            <span
              className={cn(
                'rounded-full px-4 py-2 text-sm font-bold text-text',
                meta.soft,
              )}
            >
              {parts[focusSlot] ? 'Đã chọn ✓' : 'Chưa chọn'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {trayChips.map((chip) => (
              <BigChipCard
                key={chip.id}
                chip={chip}
                selected={parts[focusSlot]?.id === chip.id}
                onSelect={() => place(chip, focusSlot)}
              />
            ))}
          </div>
        </section>

        {/* Slot tab switcher for kids who want to jump */}
        <div className="mb-4 flex flex-wrap gap-2">
          {SLOTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFocusSlot(s)}
              className={cn(
                'min-h-12 cursor-pointer rounded-2xl px-4 text-sm font-bold transition-colors',
                focusSlot === s
                  ? 'bg-brand-500 text-white shadow-clay'
                  : parts[s]
                    ? cn(SLOT_META[s].soft, 'text-text')
                    : 'bg-white text-muted ring-1 ring-border',
              )}
            >
              <span aria-hidden>{SLOT_META[s].emoji} </span>
              {SLOT_LABELS[s]}
              {parts[s] ? ' ✓' : ''}
            </button>
          ))}
        </div>

        {privacy.allowFreeText ? (
          <div className="mb-4">
            <button
              type="button"
              className="text-sm font-bold text-brand-600 underline"
              onClick={() => setShowExtra((v) => !v)}
            >
              {showExtra ? 'Ẩn chi tiết thêm' : '+ Thêm chi tiết nhỏ (tuỳ chọn)'}
            </button>
            {showExtra ? (
              <label className="mt-2 block">
                <input
                  value={parts.freeText ?? ''}
                  maxLength={80}
                  onChange={(e) => {
                    const v = e.target.value
                    const check = validateChildText(v)
                    setSafetyMsg(!check.ok && v.trim() ? check.message ?? null : null)
                    setFreeText(v)
                  }}
                  className="min-h-14 w-full rounded-2xl border-2 border-border bg-white px-4 text-base font-semibold outline-none focus:border-brand-500"
                  placeholder="Ví dụ: có đèn vàng nhẹ"
                />
                {safetyMsg ? (
                  <p className="mt-2 text-sm font-bold text-danger" role="alert">
                    {safetyMsg}
                  </p>
                ) : null}
              </label>
            ) : null}
          </div>
        ) : null}

        <p className="mb-2 text-center text-sm font-semibold text-muted">
          An toàn: chỉ nhân vật tưởng tượng · Không tên thật / SĐT
        </p>

        <DragOverlay>
          {activeChip ? (
            <div
              className={cn(
                'rounded-2xl px-5 py-4 text-lg font-bold shadow-clay',
                SLOT_META[activeChip.slot].soft,
              )}
            >
              <span className="text-2xl" aria-hidden>
                {activeChip.emoji}{' '}
              </span>
              {activeChip.label}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Sticky generate bar — always visible, large */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-white/95 px-3 py-3 shadow-[0_-8px_30px_rgba(42,51,82,0.08)] backdrop-blur-sm safe-pb xl:left-[88px] 2xl:left-[100px]">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-sm font-bold text-text">
              {ready ? '🎉 Đủ 5 thẻ rồi!' : `Còn thiếu ${5 - filled} thẻ`}
            </p>
            <p className="truncate text-sm text-muted">{sentence}</p>
          </div>
          <Button
            size="lg"
            className="min-h-14 w-full text-lg sm:w-auto sm:min-w-[220px]"
            disabled={!ready}
            onClick={generate}
          >
            <Sparkles className="size-6" aria-hidden />
            Tạo 3 ảnh
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProgressPips({
  filled,
  parts,
  focus,
  onFocus,
}: {
  filled: number
  parts: Partial<Record<PromptSlotKey, PromptChip>>
  focus: PromptSlotKey
  onFocus: (s: PromptSlotKey) => void
}) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Đã điền ${filled} trên 5 ô`}>
      {SLOTS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onFocus(s)}
          className={cn(
            'flex size-10 cursor-pointer items-center justify-center rounded-full text-base transition-transform sm:size-11',
            parts[s]
              ? cn(SLOT_META[s].bar, 'text-white shadow-soft')
              : 'bg-white text-muted ring-2 ring-border',
            focus === s && 'scale-110 ring-2 ring-brand-500 ring-offset-2',
          )}
          aria-label={SLOT_LABELS[s]}
        >
          {parts[s] ? <Check className="size-5" aria-hidden /> : SLOT_META[s].emoji}
        </button>
      ))}
      <span className="ml-1 text-sm font-bold text-brand-600">{filled}/5</span>
    </div>
  )
}

function BigSlot({
  slot,
  chip,
  focused,
  onFocus,
  onClear,
}: {
  slot: PromptSlotKey
  chip?: PromptChip
  focused: boolean
  onFocus: () => void
  onClear: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slot })
  const meta = SLOT_META[slot]

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      onClick={onFocus}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onFocus()
      }}
      className={cn(
        'flex min-h-[7.5rem] cursor-pointer flex-col rounded-2xl border-2 p-3 text-left transition-all duration-150 sm:min-h-[8.5rem]',
        meta.soft,
        focused && `ring-4 ${meta.ring} ring-offset-2`,
        isOver && 'scale-[1.02] border-brand-500',
        chip ? 'border-transparent shadow-soft' : 'border-dashed border-black/15',
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-sm font-bold text-text">
          <span aria-hidden>{meta.emoji} </span>
          {SLOT_LABELS[slot]}
        </span>
        {chip ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClear()
            }}
            className="min-h-10 min-w-10 cursor-pointer rounded-xl bg-white/70 p-2 hover:bg-white"
            aria-label={`Xóa ${SLOT_LABELS[slot]}`}
          >
            <Trash2 className="mx-auto size-5 text-text" />
          </button>
        ) : null}
      </div>
      {chip ? (
        <div className="mt-auto">
          <p className="text-3xl" aria-hidden>
            {chip.emoji}
          </p>
          <p className="mt-1 font-display text-lg leading-tight text-text">{chip.label}</p>
        </div>
      ) : (
        <p className="mt-auto text-base font-bold text-muted">
          {focused ? '↓ Chọn thẻ bên dưới' : 'Chạm để chọn thẻ'}
        </p>
      )}
    </div>
  )
}

function BigChipCard({
  chip,
  selected,
  onSelect,
}: {
  chip: PromptChip
  selected: boolean
  onSelect: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: chip.id,
    data: { chip },
  })
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined
  const meta = SLOT_META[chip.slot]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex min-h-[5.5rem] overflow-hidden rounded-2xl border-2 shadow-soft transition-transform sm:min-h-[6.5rem]',
        meta.soft,
        selected
          ? 'border-brand-500 ring-4 ring-brand-100'
          : 'border-white/80 hover:-translate-y-0.5',
        isDragging && 'opacity-50',
      )}
    >
      <button
        type="button"
        className="flex min-h-[5.5rem] flex-1 cursor-pointer items-center gap-4 px-4 py-3 text-left sm:min-h-[6.5rem] sm:px-5"
        onClick={onSelect}
      >
        <span className="text-4xl sm:text-5xl" aria-hidden>
          {chip.emoji}
        </span>
        <span className="min-w-0">
          <span className="block font-display text-xl leading-tight text-text sm:text-2xl">
            {chip.label}
          </span>
          <span className="mt-1 block text-sm font-semibold text-muted">
            {chip.description}
          </span>
          {selected ? (
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-success">
              <Check className="size-4" aria-hidden /> Đang dùng
            </span>
          ) : (
            <span className="mt-1 block text-sm font-bold text-brand-600">Chạm để gắn →</span>
          )}
        </span>
      </button>
      {/* Optional drag handle area */}
      <button
        type="button"
        className="flex w-12 cursor-grab items-center justify-center border-l border-black/5 bg-white/40 text-xs font-bold text-muted active:cursor-grabbing sm:w-14"
        aria-label={`Kéo thẻ ${chip.label}`}
        {...listeners}
        {...attributes}
      >
        ⋮⋮
      </button>
    </div>
  )
}
