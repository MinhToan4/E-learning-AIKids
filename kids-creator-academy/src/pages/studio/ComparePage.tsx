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
  const addToast = useDemoStore((s) => s.addToast)
  const child = useDemoStore((s) => s.child)

  const [checks, setChecks] = useState({
    character: false,
    place: false,
    odd: false,
  })

  if (!results.length) {
    return (
      <Card>
        <p className="font-semibold">Chưa có kết quả AI.</p>
        <Button className="mt-4" onClick={() => navigate('/studio/prompt')}>
          Về Xưởng Prompt
        </Button>
      </Card>
    )
  }

  const selected = results.find((r) => r.id === selectedId)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">So sánh 3 phiên bản</h1>
        <p className="text-muted">
          {child.nickname} ơi, hãy làm Thám tử AI — chọn ảnh khớp ý và tìm chi tiết lạ.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
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
              className="w-full rounded-2xl border border-border"
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="font-display text-lg font-semibold">{r.title}</p>
              {selectedId === r.id ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-2 py-1 text-xs font-bold text-success">
                  <Check className="size-3.5" aria-hidden />
                  Đã chọn
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
        <h2 className="font-display text-xl font-semibold">Checklist đánh giá</h2>
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
                'flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 font-semibold',
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

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => navigate('/studio/prompt')}>
          <Wand2 className="size-4" aria-hidden />
          Sửa mô tả
        </Button>
        <Button
          size="lg"
          disabled={!selected}
          onClick={() => {
            if (!selected) return
            saveSelectedToBackpack()
            if (selected.oddDetail === undefined && results.some((r) => r.oddDetail)) {
              // chose clean image after spotting odd one
            }
            if (checks.odd || results.some((r) => r.oddDetail && r.id !== selected.id)) {
              addBadge('Thám tử AI')
              completeQuest('detective', 30)
            }
            completeQuest('prompt-lab', 100)
            addToast({
              type: 'success',
              title: 'Đã lưu Character Card!',
              description: 'Mở Xưởng truyện tranh để ghép 4 khung.',
            })
            navigate('/studio/comic')
          }}
        >
          Dùng ảnh này
        </Button>
      </div>
    </div>
  )
}
