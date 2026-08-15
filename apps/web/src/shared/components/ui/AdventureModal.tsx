import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

import { AikidModalCatCharacter } from './AikidModalCatCharacter'
import { cn } from '@/shared/lib/cn'

export type AdventureModalTone = 'discovery' | 'achievement' | 'reward' | 'celebration' | 'guidance'

type Props = {
  open: boolean
  tone?: AdventureModalTone
  eyebrow?: string
  title: string
  description?: string
  artwork?: React.ReactNode
  children?: React.ReactNode
  actions?: React.ReactNode
  onClose?: () => void
  closeLabel?: string
  showMascot?: boolean
  className?: string
}

export function AdventureModal({
  open,
  tone = 'discovery',
  eyebrow,
  title,
  description,
  artwork,
  children,
  actions,
  onClose,
  closeLabel = 'Đóng',
  showMascot = true,
  className,
}: Props) {
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => {
      const firstControl = panelRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled])',
      )
      ;(firstControl ?? panelRef.current)?.focus()
    }, 30)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) onClose()
      if (event.key === 'Tab' && panelRef.current) {
        const controls = Array.from(panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ))
        if (controls.length === 0) {
          event.preventDefault()
          panelRef.current.focus()
          return
        }
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="adventure-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && onClose) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn('adventure-modal', className)}
        data-tone={tone}
      >
        <div className="adventure-modal-landscape" aria-hidden="true" />
        {onClose && (
          <button type="button" className="adventure-modal-close" onClick={onClose} aria-label={closeLabel}>
            ×
          </button>
        )}
        {showMascot && <AikidModalCatCharacter className="adventure-modal-mascot" />}
        <div className="adventure-modal-content">
          {eyebrow && <p className="adventure-modal-eyebrow">{eyebrow}</p>}
          <h2 id={titleId} className="font-display text-3xl font-extrabold leading-tight text-text sm:text-4xl">
            {title}
          </h2>
          {description && <p id={descriptionId} className="mt-2 text-base font-semibold leading-relaxed text-muted">{description}</p>}
          {artwork && <div className="adventure-modal-artwork">{artwork}</div>}
          {children && <div className="adventure-modal-body">{children}</div>}
          {actions && <div className="adventure-modal-actions">{actions}</div>}
        </div>
      </div>
    </div>,
    document.body,
  )
}
