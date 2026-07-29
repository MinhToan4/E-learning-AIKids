import { canUsePacoPick, getIsoWeekKey, type ReactionType } from '@aikids/domain'
import { useState } from 'react'
import { REACTIONS } from '../storybook-data'

const STORAGE_KEY = 'aikids.storybook.social.v1'

type StoredSocial = {
  weekKey: string
  pacoPicks: number
  selected: Record<string, ReactionType>
}

function readState(): StoredSocial {
  const empty = { weekKey: getIsoWeekKey(), pacoPicks: 0, selected: {} }
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') as StoredSocial
    return parsed.weekKey === empty.weekKey ? parsed : empty
  } catch {
    return empty
  }
}

export function ReactionBar({ workId }: { workId: string }) {
  const [social, setSocial] = useState(readState)
  const [message, setMessage] = useState('')
  const selected = social.selected[workId]

  const react = (type: ReactionType) => {
    if (type === 'PACO_PICK' && selected !== type && !canUsePacoPick(social.pacoPicks)) {
      setMessage('Con đã dùng hết 3 Paco Pick tuần này rồi 🐾')
      return
    }
    const removing = selected === type
    const next: StoredSocial = {
      ...social,
      pacoPicks: social.pacoPicks +
        (type === 'PACO_PICK' && !removing ? 1 : 0) -
        (selected === 'PACO_PICK' ? 1 : 0),
      selected: { ...social.selected },
    }
    if (removing) delete next.selected[workId]
    else next.selected[workId] = type
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSocial(next)
    setMessage(removing ? 'Đã gỡ reaction' : 'Con vừa gửi một lời động viên!')
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5" aria-label="Gửi lời động viên">
        {REACTIONS.map((reaction) => (
          <button
            key={reaction.type}
            type="button"
            title={reaction.label}
            aria-pressed={selected === reaction.type}
            onClick={() => react(reaction.type)}
            className={`rounded-full border px-2.5 py-1.5 text-base transition ${
              selected === reaction.type
                ? 'border-brand-500 bg-brand-100 scale-110'
                : 'border-slate-200 bg-white hover:-translate-y-0.5'
            }`}
          >
            {reaction.emoji}
          </button>
        ))}
      </div>
      <p className="mt-1 min-h-4 text-[11px] font-semibold text-muted" aria-live="polite">
        {message || `Paco Pick còn ${3 - social.pacoPicks}/3 tuần này`}
      </p>
    </div>
  )
}
