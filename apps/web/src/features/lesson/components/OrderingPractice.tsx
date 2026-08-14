import { ArrowDown, ArrowUp, CheckCircle2, GripVertical } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export type OrderingPracticeCard = {
  id: string
  title: string
  description: string
}

type Props = {
  prompt: string
  cards: OrderingPracticeCard[]
  order: string[]
  onChange: (order: string[]) => void
}

export function moveOrderingCard(order: string[], index: number, offset: -1 | 1) {
  const target = index + offset
  if (target < 0 || target >= order.length) return order
  const next = [...order]
  ;[next[index], next[target]] = [next[target]!, next[index]!]
  return next
}

export function isOrderingComplete(order: string[], cards: OrderingPracticeCard[]) {
  return order.length === cards.length && order.every((id, index) => id === cards[index]?.id)
}

export function OrderingPractice({ prompt, cards, order, onChange }: Props) {
  const byId = new Map(cards.map((card) => [card.id, card]))
  const correctOrder = cards.map((card) => card.id)
  const complete = isOrderingComplete(order, cards)

  function move(index: number, offset: -1 | 1) {
    onChange(moveOrderingCard(order, index, offset))
  }

  return (
    <section className="rounded-3xl border-2 border-brand-200 bg-brand-50 p-4 sm:p-5" aria-labelledby="ordering-practice-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p id="ordering-practice-title" className="font-display text-xl text-brand-900">Xưởng sắp xếp</p>
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-text">{prompt}</p>
        </div>
        <span className={cn(
          'inline-flex min-h-11 items-center gap-2 rounded-2xl border-2 px-3 py-2 text-sm font-extrabold',
          complete ? 'border-mint-300 bg-mint-100 text-mint-800' : 'border-brand-200 bg-white text-brand-700',
        )} role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          {complete ? 'Đúng thứ tự' : 'Chưa đúng thứ tự'}
        </span>
      </div>

      <ol className="mt-4 grid gap-3">
        {order.map((id, index) => {
          const card = byId.get(id)
          if (!card) return null
          const inCorrectPlace = correctOrder[index] === id
          return (
            <li key={id} className={cn(
              'grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border-2 bg-white p-3 shadow-sm',
              inCorrectPlace ? 'border-mint-200' : 'border-brand-100',
            )}>
              <span className={cn(
                'grid size-10 place-items-center rounded-xl text-sm font-black',
                inCorrectPlace ? 'bg-mint-100 text-mint-800' : 'bg-brand-100 text-brand-800',
              )} aria-label={`Vị trí ${index + 1}`}>
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-extrabold text-text"><GripVertical size={17} className="shrink-0 text-muted" aria-hidden="true" />{card.title}</p>
                <p className="mt-1 text-sm font-semibold leading-snug text-muted">{card.description}</p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="grid size-11 place-items-center rounded-xl border-2 border-border bg-white text-brand-700 disabled:opacity-30" aria-label={`Đưa ${card.title} lên`}><ArrowUp size={20} /></button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === order.length - 1} className="grid size-11 place-items-center rounded-xl border-2 border-border bg-white text-brand-700 disabled:opacity-30" aria-label={`Đưa ${card.title} xuống`}><ArrowDown size={20} /></button>
              </div>
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-sm font-bold text-muted">Dùng nút lên/xuống. Khi đúng, cả bốn vị trí sẽ chuyển sang màu xanh.</p>
    </section>
  )
}
