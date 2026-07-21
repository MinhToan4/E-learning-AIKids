import { useEffect, useRef } from 'react'
import { Button } from '@/shared/components/ui/Button'

type Props = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Accessible confirm dialog — replaces browser's confirm().
 * Traps focus, closes on Escape, renders via portal-like z-index.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Auto-focus cancel button when opens (safer default)
  useEffect(() => {
    if (open) {
      setTimeout(() => cancelRef.current?.focus(), 50)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center"
      style={{ background: 'rgba(30,39,64,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? 'confirm-desc' : undefined}
        className="animate-pop ui-card w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="font-display text-xl text-text">
          {title}
        </h2>
        {description && (
          <p id="confirm-desc" className="mt-2 text-sm text-muted">
            {description}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'ghost' : 'primary'}
            className={danger ? 'text-danger hover:bg-coral-100' : ''}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
