import { useEffect, useRef } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'

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
    <AdventureModal
      open={open}
      tone={danger ? 'guidance' : 'discovery'}
      eyebrow={danger ? 'Kiểm tra lại' : 'Xác nhận'}
      title={title}
      description={description}
      onClose={onCancel}
      className="!max-w-md"
      actions={
        <>
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
        </>
      }
    />
  )
}
