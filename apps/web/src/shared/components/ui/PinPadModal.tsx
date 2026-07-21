import { useEffect } from 'react'
import { cn } from '@/shared/lib/cn'
import { useToast } from '@/shared/hooks/useToast'
import { ToastContainer } from '@/shared/components/ui/Toast'

export type PinPadModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (pin: string) => void
  title: string
  subtitle?: string
  avatarContent?: React.ReactNode
  busy?: boolean
  error?: string | null
  pin: string
  setPin: (pin: string) => void
  closeLabel?: string
}

export function PinPadModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  avatarContent,
  busy,
  error,
  pin,
  setPin,
  closeLabel = 'Hủy',
}: PinPadModalProps) {
  const { toasts, showToast, dismissToast } = useToast()

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (busy) return
      
      if (/^\d$/.test(e.key)) {
        e.preventDefault()
        if (pin.length < 6) {
          const next = pin + e.key
          setPin(next)
          if (next.length === 6) {
            onSubmit(next)
          }
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        setPin(pin.slice(0, -1))
      } else if (e.key === 'Enter' && pin.length === 6) {
        e.preventDefault()
        onSubmit(pin)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (
        e.key.length === 1 && 
        !e.ctrlKey && 
        !e.altKey && 
        !e.metaKey && 
        /^[a-zA-Z]$/.test(e.key)
      ) {
        e.preventDefault()
        showToast('Chỉ được phép nhập số!', 'error')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, busy, pin, setPin, onSubmit, onClose, showToast])

  if (!isOpen) return null

  function onPinDigit(d: string) {
    if (busy || pin.length >= 6) return
    const next = (pin + d).slice(0, 6)
    setPin(next)
    if (next.length === 6) {
      onSubmit(next)
    }
  }

  function onPinBack() {
    setPin(pin.slice(0, -1))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-text/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-title"
    >
      <div className="ui-card w-full max-w-md rounded-t-3xl p-5 shadow-clay sm:rounded-3xl">
        <div className="mb-4 flex items-center gap-3">
          {avatarContent && (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-50 text-3xl">
              {avatarContent}
            </span>
          )}
          <div>
            <p id="pin-title" className="font-display text-2xl">
              {title}
            </p>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
        </div>

        {error && (
          <p
            className="mb-4 rounded-xl bg-coral-100 px-3 py-2 text-sm font-bold text-danger"
            role="alert"
          >
            {error}
          </p>
        )}

        <div
          className="mb-4 flex justify-center gap-2"
          aria-label="Mã PIN đã nhập"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'flex h-11 w-9 items-center justify-center rounded-xl border-2 text-lg font-extrabold',
                pin.length > i
                  ? 'border-brand-500 bg-brand-50 text-brand-600'
                  : 'border-border bg-white text-muted',
              )}
            >
              {pin.length > i ? '•' : ''}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map(
            (key) => {
              if (key === 'del') {
                return (
                  <button
                    key={key}
                    type="button"
                    className="ui-btn ui-btn-secondary !min-h-14 text-lg"
                    onClick={onPinBack}
                    disabled={busy}
                  >
                    Xóa
                  </button>
                )
              }
              if (key === 'ok') {
                return (
                  <button
                    key={key}
                    type="button"
                    className="ui-btn ui-btn-primary !min-h-14 text-lg"
                    disabled={busy || pin.length !== 6}
                    onClick={() => onSubmit(pin)}
                  >
                    {busy ? '…' : 'Vào'}
                  </button>
                )
              }
              return (
                <button
                  key={key}
                  type="button"
                  className="ui-btn ui-btn-secondary !min-h-14 font-display text-2xl"
                  onClick={() => onPinDigit(key)}
                  disabled={busy}
                >
                  {key}
                </button>
              )
            },
          )}
        </div>

        <button
          type="button"
          className="mt-4 w-full text-center text-sm font-bold text-muted"
          onClick={onClose}
          disabled={busy}
        >
          {closeLabel}
        </button>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
