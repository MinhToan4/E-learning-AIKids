import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/lib/cn'
import { learnerFriendlyError } from '@/shared/lib/learner-error'

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

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), 4000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.id, onDismiss])

  const displayMessage =
    toast.type === 'error' ? learnerFriendlyError(toast.message) : toast.message

  return (
    <div
      role="alert"
      className={cn(
        'animate-fade-down flex items-start gap-3 rounded-2xl px-4 py-3 shadow-clay pointer-events-auto',
        'border-2 text-sm font-bold backdrop-blur-xs',
        toast.type === 'success' && 'border-mint-400 bg-white/95 text-emerald-900',
        toast.type === 'error' && 'border-amber-300 bg-amber-50/95 text-amber-950',
        toast.type === 'info' && 'border-brand-300 bg-sky-50/95 text-slate-800',
      )}
      style={{ maxWidth: 'min(380px, calc(100vw - 2.5rem))' }}
    >
      <span className="mt-0.5 text-base shrink-0">
        {toast.type === 'success' ? '🌟' : toast.type === 'error' ? '✨' : '💡'}
      </span>
      <span className="flex-1 leading-snug">{displayMessage}</span>
      <button
        type="button"
        aria-label="Đóng thông báo"
        onClick={() => onDismiss(toast.id)}
        className="ml-1 rounded-lg p-1 text-slate-400 hover:text-slate-700 transition"
      >
        ✕
      </button>
    </div>
  )
}
