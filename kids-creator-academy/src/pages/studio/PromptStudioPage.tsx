import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, ChoiceCard } from '@/components/ui/Card'
import { MissionBanner } from '@/components/ui/MissionBanner'
import { LoadingCreature, SafetyNotice } from '@/components/feedback/States'
import { PROMPT_CHIPS } from '@/data/mock'
import { assemblePrompt, SLOT_LABELS } from '@/lib/prompt'
import { validateChildText } from '@/lib/safety'
import { generateImages } from '@/lib/generate'
import { useDemoStore } from '@/store/demo-store'
import type { PromptChip, PromptSlotKey } from '@/types'
import { cn } from '@/lib/cn'

/** One choice screen at a time — progressive disclosure for ages 8–11 (NN/g). */
const STEPS: PromptSlotKey[] = [
  'character',
  'action',
  'environment',
  'mood',
  'style',
]

const STEP_COPY: Record<
  PromptSlotKey,
  { title: string; help: string; why: string }
> = {
  character: {
    title: 'Ai là ngôi sao?',
    help: 'Chạm 1 thẻ. Chỉ chọn một.',
    why: 'AI cần biết vẽ ai.',
  },
  action: {
    title: 'Đang làm gì?',
    help: 'Nhân vật đang làm việc gì?',
    why: 'Câu chuyện có hành động.',
  },
  environment: {
    title: 'Đang ở đâu?',
    help: 'Chọn một nơi tưởng tượng.',
    why: 'AI biết vẽ bối cảnh.',
  },
  mood: {
    title: 'Cảm xúc thế nào?',
    help: 'Chọn một cảm xúc.',
    why: 'Ảnh có hồn hơn.',
  },
  style: {
    title: 'Vẽ kiểu gì?',
    help: 'Chọn phong cách vẽ.',
    why: 'Ba ảnh cùng một kiểu.',
  },
}

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

  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<'pick' | 'review'>('pick')
  const [loading, setLoading] = useState(false)
  const [safetyMsg, setSafetyMsg] = useState<string | null>(null)

  const slot = STEPS[stepIndex]
  const chips = useMemo(
    () => PROMPT_CHIPS.filter((c) => c.slot === slot),
    [slot],
  )
  const selected = parts[slot]
  const sentence = assemblePrompt(parts)
  const filledCount = STEPS.filter((s) => parts[s]).length

  const generate = async () => {
    if (filledCount < 5) {
      addToast({
        type: 'warning',
        title: 'Còn thiếu thẻ',
        description: 'Hãy chọn đủ 5 bước nhé!',
      })
      setPhase('pick')
      setStepIndex(STEPS.findIndex((s) => !parts[s]))
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
        title: 'Xưởng vẽ chưa xong',
        description: 'Thử lại nhé — sản phẩm vẫn an toàn.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-2">
        <MissionBanner
          stepLabel="Đang vẽ…"
          doing="AI đang vẽ 3 phiên bản"
          why="Con sẽ chọn ảnh ưng nhất"
          reward="Thẻ nhân vật / cảnh truyện"
        />
        <LoadingCreature className="mt-4" stage={generationStage} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-8">
      <MissionBanner
        stepLabel={`Bài: Nói cho AI hiểu · Bước ${phase === 'review' ? 6 : stepIndex + 1}/6`}
        doing="Ghép 5 thẻ để AI vẽ 3 bức ảnh"
        why="Có ảnh đẹp để sau làm truyện tranh"
        reward="3 phiên bản ảnh an toàn"
      />

      {/* Simple progress dots */}
      <div className="flex items-center justify-center gap-1.5" aria-hidden>
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={cn(
              'h-2.5 rounded-full transition-all duration-150',
              i === stepIndex && phase === 'pick'
                ? 'w-8 bg-brand-500'
                : parts[s]
                  ? 'w-2.5 bg-mint-400'
                  : 'w-2.5 bg-border',
            )}
          />
        ))}
        <span
          className={cn(
            'h-2.5 rounded-full',
            phase === 'review' ? 'w-8 bg-brand-500' : 'w-2.5 bg-border',
          )}
        />
      </div>

      {phase === 'pick' && (
        <Card className="space-y-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl">
              {STEP_COPY[slot].title}
            </h1>
            <p className="mt-1 text-sm font-semibold text-muted sm:text-base">
              {STEP_COPY[slot].help}{' '}
              <span className="text-brand-600">({STEP_COPY[slot].why})</span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {chips.map((chip) => (
              <BigChip
                key={chip.id}
                chip={chip}
                selected={selected?.id === chip.id}
                onSelect={() => setPromptChip(slot, chip)}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="secondary"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Quay lại
            </Button>
            <Button
              size="lg"
              disabled={!selected}
              onClick={() => {
                if (!selected) return
                if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1)
                else setPhase('review')
              }}
            >
              {stepIndex < STEPS.length - 1 ? 'Tiếp theo' : 'Xem câu mô tả'}
              <ArrowRight className="size-5" aria-hidden />
            </Button>
          </div>
        </Card>
      )}

      {phase === 'review' && (
        <Card className="space-y-4">
          <h1 className="font-display text-2xl sm:text-3xl">Câu mô tả của con</h1>
          <p className="text-sm font-semibold text-muted">
            Đọc lại 1 lần. Ổn thì bấm nút tím to phía dưới.
          </p>

          <div className="rounded-2xl bg-brand-50 p-4">
            <p className="text-lg font-extrabold leading-snug text-text sm:text-xl">
              {sentence}
            </p>
          </div>

          <ul className="grid gap-2 sm:grid-cols-2">
            {STEPS.map((s) => (
              <li
                key={s}
                className="flex items-center gap-2 rounded-2xl border border-border bg-bg px-3 py-2 text-sm font-bold"
              >
                <Check className="size-4 shrink-0 text-success" aria-hidden />
                <span className="text-muted">{SLOT_LABELS[s]}:</span>
                <span className="truncate">{parts[s]?.label}</span>
                <button
                  type="button"
                  className="ml-auto cursor-pointer text-xs font-extrabold text-brand-600 underline"
                  onClick={() => {
                    setPhase('pick')
                    setStepIndex(STEPS.indexOf(s))
                  }}
                >
                  Sửa
                </button>
              </li>
            ))}
          </ul>

          {privacy.allowFreeText ? (
            <label className="block">
              <span className="mb-1 block text-sm font-extrabold">
                Thêm 1 chi tiết nhỏ? (không bắt buộc)
              </span>
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
                className="min-h-12 w-full rounded-2xl border-2 border-border px-4 font-semibold outline-none focus:border-brand-500"
                placeholder="Ví dụ: có đèn vàng nhẹ"
              />
            </label>
          ) : null}

          {safetyMsg ? (
            <p className="text-sm font-bold text-danger" role="alert">
              {safetyMsg}
            </p>
          ) : null}

          <SafetyNotice>
            Chỉ nhân vật tưởng tượng. Không ghi tên thật hay số điện thoại.
          </SafetyNotice>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" onClick={() => setPhase('pick')}>
              <ArrowLeft className="size-4" aria-hidden />
              Sửa thẻ
            </Button>
            <Button size="lg" className="flex-1" onClick={generate}>
              <Sparkles className="size-5" aria-hidden />
              Tạo 3 phiên bản ảnh
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

function BigChip({
  chip,
  selected,
  onSelect,
}: {
  chip: PromptChip
  selected: boolean
  onSelect: () => void
}) {
  return (
    <ChoiceCard
      selected={selected}
      onClick={onSelect}
      className="flex min-h-[4.5rem] items-center gap-3 p-3 sm:min-h-[5rem]"
    >
      <span className="text-3xl" aria-hidden>
        {chip.emoji}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-lg leading-tight">{chip.label}</span>
        <span className="block text-xs font-semibold text-muted">{chip.description}</span>
      </span>
      {selected ? (
        <Check className="ml-auto size-6 shrink-0 text-brand-500" aria-hidden />
      ) : null}
    </ChoiceCard>
  )
}
