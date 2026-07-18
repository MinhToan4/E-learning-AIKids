import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Search, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, ChoiceCard } from '@/components/ui/Card'
import { useDemoStore } from '@/store/demo-store'
import { cn } from '@/lib/cn'

export function ComparePage() {
  const navigate = useNavigate()
  const results = useDemoStore((s) => s.generatedResults)
  const selectedId = useDemoStore((s) => s.selectedResultId)
  const selectResult = useDemoStore((s) => s.selectResult)
  const saveSelectedToBackpack = useDemoStore((s) => s.saveSelectedToBackpack)
  const addBadge = useDemoStore((s) => s.addBadge)
  const completeQuest = useDemoStore((s) => s.completeQuest)
  const setCurrentQuest = useDemoStore((s) => s.setCurrentQuest)
  const addStars = useDemoStore((s) => s.addStars)
  const addToast = useDemoStore((s) => s.addToast)
  const child = useDemoStore((s) => s.child)

  const [checks, setChecks] = useState({
    character: false,
    place: false,
    odd: false,
  })

  if (!results.length) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Card className="text-center">
          <p className="font-display text-xl">Chưa có ảnh để so sánh</p>
          <p className="mt-2 text-sm text-muted">
            Hãy ghép thẻ và tạo 3 ảnh trước nhé.
          </p>
          <Button className="mt-4" onClick={() => navigate('/studio/prompt')}>
            Ghép thẻ tạo ảnh
          </Button>
        </Card>
      </div>
    )
  }

  const selected = results.find((r) => r.id === selectedId)

  const useImage = () => {
    if (!selected) return
    saveSelectedToBackpack()

    // Compare screen IS the "detective" practice
    if (checks.odd || results.some((r) => r.oddDetail)) {
      addBadge('Thám tử AI')
      completeQuest('detective', 30)
      addStars(15)
    }
    completeQuest('prompt-lab', 100)
    // world-build is lightly credited on the create path; plot only after Story studio
    completeQuest('world-build', 20)
    addStars(20)
    setCurrentQuest('detective')

    addToast({
      type: 'success',
      title: 'Đã lưu ảnh!',
      description: 'Trả lời quiz vui → viết cốt truyện → mới xếp 4 khung.',
    })
    // Quiz → story outline → comic (never back to prompt; never complete plot early)
    navigate('/challenge/ch-after-prompt')
  }

  return (
    <div className="stage-shell space-y-5 pb-8">
      <div>
        <p className="text-sm font-bold text-brand-500">Bước thám tử AI</p>
        <h1 className="font-display text-2xl text-text sm:text-3xl">
          Chọn 1 trong 3 ảnh
        </h1>
        <p className="mt-1 text-base text-muted">
          {child.nickname} ơi — tìm chi tiết lạ (nếu có) rồi chọn ảnh ưng nhất.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <ChoiceCard
            key={r.id}
            selected={selectedId === r.id}
            onClick={() => selectResult(r.id)}
            className="flex flex-col p-3"
          >
            <img
              src={r.imageDataUrl}
              alt={`${r.title} — minh họa AI an toàn`}
              className="aspect-[4/3] w-full rounded-2xl border border-border object-cover"
            />
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="font-display text-lg font-semibold">{r.title}</p>
              {selectedId === r.id ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-2 py-1 text-xs font-bold text-success">
                  <Check className="size-3.5" aria-hidden />
                  Chọn
                </span>
              ) : null}
            </div>
            {r.oddDetail ? (
              <p className="mt-2 rounded-xl bg-coral-100 px-3 py-2 text-sm font-semibold text-danger">
                <Search className="mr-1 inline size-4" aria-hidden />
                Chi tiết lạ: {r.oddDetail}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">Khớp tốt với mô tả</p>
            )}
          </ChoiceCard>
        ))}
      </div>

      <Card>
        <h2 className="text-base font-bold text-text">Checklist nhanh</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(
            [
              ['character', 'Đúng nhân vật?'],
              ['place', 'Đúng bối cảnh?'],
              ['odd', 'Có chi tiết lạ?'],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className={cn(
                'flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 text-sm font-semibold',
                checks[key] ? 'border-brand-500 bg-brand-50' : 'border-border bg-white',
              )}
            >
              <input
                type="checkbox"
                className="size-5 accent-brand-500"
                checked={checks[key]}
                onChange={(e) => setChecks((c) => ({ ...c, [key]: e.target.checked }))}
              />
              {label}
            </label>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="secondary" onClick={() => navigate('/studio/prompt')}>
          <Wand2 className="size-4" aria-hidden />
          Sửa thẻ / tạo lại
        </Button>
        <Button size="lg" className="flex-1" disabled={!selected} onClick={useImage}>
          Dùng ảnh này · tiếp tục
        </Button>
      </div>
    </div>
  )
}
