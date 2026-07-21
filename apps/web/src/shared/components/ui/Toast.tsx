import { useEffect, useRef } from 'react'
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

/** Popup toast container — bottom-right, auto-dismiss 4 s */
export function ToastContainer({ toasts, onDismiss }: Props) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2"
      style={{ maxWidth: 'min(360px, calc(100vw - 2.5rem))' }}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
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

  return (
    <div
      role="alert"
      className={cn(
        'animate-fade-up flex items-start gap-3 rounded-2xl px-4 py-3 shadow-soft',
        'border-2 bg-white text-sm font-bold',
        toast.type === 'success' && 'border-mint-400 text-success',
        toast.type === 'error' && 'border-coral-400 text-danger',
        toast.type === 'info' && 'border-brand-500 text-brand-600',
      )}
    >
      <span className="mt-0.5 text-base">
        {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
      </span>
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        type="button"
        aria-label="Đóng thông báo"
        onClick={() => onDismiss(toast.id)}
        className="ml-1 rounded-lg p-1 text-muted opacity-60 transition hover:opacity-100"
      >
        ✕
      </button>
    </div>
  )
}
