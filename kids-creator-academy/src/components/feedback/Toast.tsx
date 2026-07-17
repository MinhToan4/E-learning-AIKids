import { useEffect } from 'react'
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react'
import { useDemoStore } from '@/store/demo-store'
import { cn } from '@/lib/cn'

const icons = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
}

export function ToastViewport() {
  const toasts = useDemoStore((s) => s.toasts)

  return (
    <div
      className="pointer-events-none fixed bottom-24 right-4 z-[200] flex w-[min(100%-2rem,22rem)] flex-col gap-2 md:bottom-6"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} />
      ))}
    </div>
  )
}

function ToastItem({
  id,
  type,
  title,
  description,
}: {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  description?: string
}) {
  const removeToast = useDemoStore((s) => s.removeToast)

  useEffect(() => {
    const t = window.setTimeout(() => removeToast(id), 4200)
    return () => window.clearTimeout(t)
  }, [id, removeToast])

  const Icon = icons[type]
  return (
    <div
      className={cn(
        'pointer-events-auto flex gap-3 rounded-[var(--radius-card)] border bg-surface p-4 shadow-clay',
        type === 'success' && 'border-mint-400/40',
        type === 'info' && 'border-sky-400/40',
        type === 'warning' && 'border-sun-400/50',
        type === 'error' && 'border-coral-400/50',
      )}
      role="status"
    >
      <Icon className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-text">{title}</p>
        {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => removeToast(id)}
        className="cursor-pointer rounded-lg p-1 text-muted hover:bg-bg"
        aria-label="Đóng thông báo"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
