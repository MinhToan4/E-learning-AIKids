import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Sparkles, MousePointerClick } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingCreature, SafetyNotice } from '@/components/feedback/States'
import { PROMPT_CHIPS } from '@/data/mock'
import { assemblePrompt, missingSlotHint, missingSlots, SLOT_LABELS } from '@/lib/prompt'
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
  const privacy = useDemoStore((s) => s.privacy)

  const [activeChip, setActiveChip] = useState<PromptChip | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<PromptSlotKey>('character')
  const [safetyMsg, setSafetyMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<PromptSlotKey | 'all'>('all')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const sentence = useMemo(() => assemblePrompt(parts), [parts])
  const hint = missingSlotHint(parts)
  const chips = filter === 'all' ? PROMPT_CHIPS : PROMPT_CHIPS.filter((c) => c.slot === filter)

  const placeChip = (chip: PromptChip, slot?: PromptSlotKey) => {
    const target = slot ?? chip.slot
    if (chip.slot !== target) {
      addToast({
        type: 'info',
        title: 'Thẻ chưa khớp ô',
        description: `Thẻ “${chip.label}” dành cho ô ${SLOT_LABELS[chip.slot]}.`,
      })
      return
    }
    setPromptChip(target, chip)
    setSelectedSlot(target)
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveChip(null)
    const chip = event.active.data.current?.chip as PromptChip | undefined
    const slot = event.over?.id as PromptSlotKey | undefined
    if (!chip || !slot) return
    placeChip(chip, slot)
  }

  const generate = async () => {
    const missing = missingSlots(parts)
    if (missing.length) {
      addToast({ type: 'warning', title: 'Còn thiếu thẻ', description: hint ?? '' })
      return
    }
    if (parts.freeText) {
      const check = validateChildText(parts.freeText)
      if (!check.ok) {
        setSafetyMsg(check.message ?? null)
        return
      }
    }
    setLoading(true)
    setSafetyMsg(null)
    try {
      const results = await generateImages(parts, {
        forceFail: demoErrorMode,
        onStage: setGenerationStage,
      })
      setGeneratedResults(results)
      setGenerationStage(null)
      navigate('/studio/compare')
    } catch {
      setGenerationStage(null)
      addToast({
        type: 'error',
        title: 'Xưởng vẽ chưa hoàn thành bức tranh',
        description: 'Thử lại hoặc tắt chế độ demo lỗi trong Hồ sơ.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl">
        <LoadingCreature stage={generationStage} />
        <p className="mt-4 text-center text-sm text-muted" aria-live="polite">
          {generationStage}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">Xưởng Prompt</h1>
        <p className="text-muted">
          Kéo thẻ vào ô, hoặc chọn thẻ rồi bấm “Đặt vào ô”. Không cần gõ prompt dài.
        </p>
      </div>

      <SafetyNotice>
        AI chỉ vẽ nhân vật tưởng tượng đã duyệt. Không nhập thông tin thật của con.
      </SafetyNotice>

      <DndContext
        sensors={sensors}
        onDragStart={(e) => setActiveChip((e.active.data.current?.chip as PromptChip) ?? null)}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveChip(null)}
      >
        <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr_280px]">
          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-semibold">Khay thẻ</h2>
              <div className="flex flex-wrap gap-1">
                {(['all', ...SLOTS] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn(
                      'min-h-10 cursor-pointer rounded-full px-3 text-xs font-bold',
                      filter === f ? 'bg-brand-500 text-white' : 'bg-bg text-muted',
                    )}
                  >
                    {f === 'all' ? 'Tất cả' : SLOT_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid max-h-[420px] grid-cols-1 gap-2 overflow-auto sm:grid-cols-2">
              {chips.map((chip) => (
                <DraggableChip
                  key={chip.id}
                  chip={chip}
                  onClickAdd={() => placeChip(chip, selectedSlot === chip.slot ? selectedSlot : chip.slot)}
                />
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-xl font-semibold">Ô ghép prompt</h2>
            <p className="mt-1 text-sm text-muted">
              Ô đang chọn: <strong>{SLOT_LABELS[selectedSlot]}</strong>
            </p>
            <div className="mt-4 space-y-3">
              {SLOTS.map((slot) => (
                <DropSlot
                  key={slot}
                  slot={slot}
                  chip={parts[slot]}
                  selected={selectedSlot === slot}
                  onSelect={() => setSelectedSlot(slot)}
                  onClear={() => setPromptChip(slot, undefined)}
                />
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-brand-50 p-4">
              <p className="text-sm font-bold text-brand-600">Câu mô tả của con</p>
              <p className="mt-1 text-lg font-semibold text-text">{sentence}</p>
              {hint ? <p className="mt-2 text-sm font-semibold text-warning">{hint}</p> : null}
            </div>
            {privacy.allowFreeText ? (
              <label className="mt-4 block">
                <span className="mb-1 block text-sm font-bold">Thêm chi tiết ngắn (tuỳ chọn, ≤80)</span>
                <input
                  value={parts.freeText ?? ''}
                  maxLength={80}
                  onChange={(e) => {
                    const v = e.target.value
                    const check = validateChildText(v)
                    if (!check.ok && v.trim()) setSafetyMsg(check.message ?? null)
                    else setSafetyMsg(null)
                    setFreeText(v)
                  }}
                  className="min-h-12 w-full rounded-[var(--radius-input)] border-2 border-border px-4 font-medium outline-none focus:border-brand-500"
                  placeholder="Ví dụ: có đèn vàng nhẹ"
                />
              </label>
            ) : (
              <p className="mt-4 text-sm text-muted">Phụ huynh đã tắt nhập chữ tự do.</p>
            )}
            {safetyMsg ? (
              <p className="mt-2 text-sm font-semibold text-danger" role="alert">
                {safetyMsg}
              </p>
            ) : null}
            <Button className="mt-5" size="lg" fullWidth onClick={generate}>
              <Sparkles className="size-5" aria-hidden />
              Tạo 3 phiên bản
            </Button>
          </Card>

          <Card className="bg-gradient-to-b from-sky-50 to-white">
            <h2 className="font-display text-lg font-semibold">Trợ lý</h2>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="rounded-xl bg-white p-3 shadow-soft">
                <MousePointerClick className="mb-1 size-4 text-brand-500" aria-hidden />
                Không kéo được? Chọn thẻ rồi bấm <strong>Thêm vào ô</strong>.
              </li>
              <li className="rounded-xl bg-white p-3 shadow-soft">
                Đủ 5 ô: Nhân vật, Hành động, Bối cảnh, Cảm xúc, Phong cách.
              </li>
              <li className="rounded-xl bg-white p-3 shadow-soft">
                AI có thể sai — bước sau con sẽ làm Thám tử AI.
              </li>
            </ul>
          </Card>
        </div>

        <DragOverlay>
          {activeChip ? (
            <div className="rounded-2xl border-2 border-brand-500 bg-white px-4 py-3 font-bold shadow-clay">
              {activeChip.label}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function DraggableChip({
  chip,
  onClickAdd,
}: {
  chip: PromptChip
  onClickAdd: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: chip.id,
    data: { chip },
  })
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center justify-between gap-2 rounded-2xl border border-border bg-white p-3 shadow-soft',
        isDragging && 'opacity-40',
      )}
    >
      <button
        type="button"
        className="flex min-h-12 flex-1 cursor-grab items-center gap-2 text-left active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <span className="text-xl" aria-hidden>
          {chip.emoji}
        </span>
        <span>
          <span className="block text-sm font-bold">{chip.label}</span>
          <span className="block text-xs text-muted">{SLOT_LABELS[chip.slot]}</span>
        </span>
      </button>
      <Button size="sm" variant="soft" onClick={onClickAdd}>
        Thêm
      </Button>
    </div>
  )
}

function DropSlot({
  slot,
  chip,
  selected,
  onSelect,
  onClear,
}: {
  slot: PromptSlotKey
  chip?: PromptChip
  selected: boolean
  onSelect: () => void
  onClear: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slot })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-2xl border-2 border-dashed p-3 transition-colors',
        isOver && 'border-brand-500 bg-brand-50',
        selected && 'border-brand-500 bg-brand-50/60',
        !selected && !isOver && 'border-border bg-bg/50',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onSelect}
          className="cursor-pointer text-left text-sm font-bold text-muted"
        >
          {SLOT_LABELS[slot]}
          {!chip ? ' · kéo thẻ vào đây' : ''}
        </button>
        {chip ? (
          <Button size="sm" variant="ghost" onClick={onClear}>
            Xóa
          </Button>
        ) : null}
      </div>
      {chip ? (
        <p className="mt-1 text-base font-semibold">
          <span aria-hidden>{chip.emoji} </span>
          {chip.label}
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted">Chưa có thẻ</p>
      )}
    </div>
  )
}
