import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { CircleCheck, CircleX, Info, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export type ToastItem = {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

type Props = {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

/** Popup toast container — top-right, auto-dismiss 4 s */
export function ToastContainer({ toasts, onDismiss }: Props) {
  const content = (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(content, document.body)
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem
  onDismiss: (id: string) => void
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const StatusIcon =
    toast.type === 'success'
      ? CircleCheck
      : toast.type === 'error'
        ? CircleX
        : Info

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), 4000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.id, onDismiss])

  return (
    <div
      role="alert"
      className={cn(
        'animate-fade-down flex items-start gap-3 rounded-2xl px-4 py-3 shadow-soft pointer-events-auto',
        'border-2 bg-white text-sm font-bold',
        toast.type === 'success' && 'border-mint-400 text-success',
        toast.type === 'error' && 'border-coral-400 text-danger',
        toast.type === 'info' && 'border-brand-500 text-brand-600',
      )}
      style={{ maxWidth: 'min(360px, calc(100vw - 2.5rem))' }}
    >
      <StatusIcon className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        type="button"
        aria-label="Đóng thông báo"
        onClick={() => onDismiss(toast.id)}
        className="ml-1 rounded-lg p-1 text-muted opacity-60 transition hover:opacity-100"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
