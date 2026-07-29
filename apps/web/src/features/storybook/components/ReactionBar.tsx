import type { ReactionType } from '@/shared/lib/creation/social-rules'
import { useState } from 'react'
import { api } from '@/shared/lib/api'
import { REACTIONS } from '../storybook-data'

export function ReactionBar({
  activityId,
  initialMine = null,
  initialCounts = {},
}: {
  activityId: string
  initialMine?: ReactionType | null
  initialCounts?: Record<string, number>
}) {
  const [selected, setSelected] = useState<ReactionType | null>(initialMine)
  const [counts, setCounts] = useState(initialCounts)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const react = async (type: ReactionType) => {
    if (busy) return
    const previous = selected
    const removing = previous === type
    setBusy(true)
    setSelected(removing ? null : type)
    setCounts((current) => ({
      ...current,
      ...(previous ? { [previous]: Math.max(0, Number(current[previous] ?? 0) - 1) } : {}),
      ...(!removing ? { [type]: Number(current[type] ?? 0) + 1 } : {}),
    }))
    try {
      await api(`/api/gamification/social/activities/${activityId}/reaction`, {
        method: 'PUT',
        body: JSON.stringify({ type: removing ? null : type }),
      })
      setMessage(removing ? 'Đã gỡ reaction' : 'Con vừa gửi một lời động viên!')
    } catch (error) {
      setSelected(previous)
      setCounts(initialCounts)
      setMessage(error instanceof Error ? error.message : 'Chưa gửi được reaction.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5" aria-label="Gửi lời động viên">
        {REACTIONS.map((reaction) => (
          <button
            key={reaction.type}
            type="button"
            disabled={busy}
            title={`${reaction.label} · ${counts[reaction.type] ?? 0}`}
            aria-pressed={selected === reaction.type}
            onClick={() => void react(reaction.type)}
            className={`rounded-full border px-2.5 py-1.5 text-base transition ${
              selected === reaction.type
                ? 'scale-110 border-brand-500 bg-brand-100'
                : 'border-slate-200 bg-white hover:-translate-y-0.5'
            } disabled:opacity-60`}
          >
            {reaction.emoji}<span className="ml-1 text-[10px] font-bold">{counts[reaction.type] || ''}</span>
          </button>
        ))}
      </div>
      <p className="mt-1 min-h-4 text-[11px] font-semibold text-muted" aria-live="polite">
        {message || 'Paco Pick được giới hạn 3 lần mỗi tuần'}
      </p>
    </div>
  )
}
