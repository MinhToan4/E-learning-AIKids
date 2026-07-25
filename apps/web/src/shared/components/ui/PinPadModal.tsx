import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  closeLabel = 'Hß╗ºy',
}: PinPadModalProps) {
  const { toasts, showToast, dismissToast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  // Tß╗▒ ─æß╗Öng focus v├áo ├┤ nhß║¡p PIN khi mß╗ƒ modal
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [isOpen])

  // Xß╗¡ l├╜ ph├¡m Escape ─æß╗â ─æ├│ng modal tß╗½ b├án ph├¡m
  useEffect(() => {
    if (!isOpen) return
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Xß╗¡ l├╜ thay ─æß╗òi dß╗» liß╗çu tß╗½ b├án ph├¡m thß╗▒c, b├án ph├¡m ß║úo di ─æß╗Öng hoß║╖c paste (Ctrl+V)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (busy) return
    const rawVal = e.target.value
    const digitsOnly = rawVal.replace(/\D/g, '').slice(0, 6)

    // Nß║┐u ng╞░ß╗¥i d├╣ng g├╡ chß╗» c├íi / k├╜ tß╗▒ ─æß║╖c biß╗çt, cß║únh b├ío nhß║╣ cho ng╞░ß╗¥i d├╣ng
    if (/\D/.test(rawVal)) {
      showToast('Chß╗ë ─æ╞░ß╗úc ph├⌐p nhß║¡p sß╗æ!', 'error')
    }

    setPin(digitsOnly)
    if (digitsOnly.length === 6 && digitsOnly !== pin) {
      onSubmit(digitsOnly)
    }
  }

  // Xß╗¡ l├╜ nhß║Ñn Enter ─æß╗â submit m├ú PIN
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && pin.length === 6 && !busy) {
      e.preventDefault()
      onSubmit(pin)
    }
  }

  // Xß╗¡ l├╜ bß║Ñm c├íc ph├¡m sß╗æ tr├¬n b├án ph├¡m ß║úo (UI Keypad)
  function onPinDigit(d: string) {
    if (busy || pin.length >= 6) return
    const next = (pin + d).slice(0, 6)
    setPin(next)
    inputRef.current?.focus()
    if (next.length === 6) {
      onSubmit(next)
    }
  }

  // Xß╗¡ l├╜ ph├¡m X├│a tr├¬n b├án ph├¡m ß║úo (UI Keypad)
  function onPinBack() {
    if (busy) return
    const next = pin.slice(0, -1)
    setPin(next)
    inputRef.current?.focus()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-text/40 p-0 sm:items-center sm:p-4"
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

        {/* Khung hiß╗ân thß╗ï ├┤ nhß║¡p PIN kß║┐t hß╗úp HTML input ß║⌐n ─æß╗â nhß║¡n ph├¡m/b├án ph├¡m di ─æß╗Öng/paste */}
        <div
          className="relative mb-4 flex justify-center gap-2 cursor-pointer"
          onClick={() => inputRef.current?.focus()}
          aria-label="M├ú PIN ─æ├ú nhß║¡p"
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-10"
            autoComplete="one-time-code"
            disabled={busy}
            aria-label="Nhß║¡p m├ú PIN 6 sß╗æ"
          />

          {Array.from({ length: 6 }).map((_, i) => {
            const isFilled = pin.length > i
            const isCurrentIndex = pin.length === i || (pin.length === 6 && i === 5)
            return (
              <span
                key={i}
                className={cn(
                  'flex h-11 w-9 items-center justify-center rounded-xl border-2 text-lg font-extrabold transition-all select-none',
                  isFilled
                    ? 'border-brand-500 bg-brand-50 text-brand-600'
                    : isCurrentIndex
                      ? 'border-brand-400 bg-white ring-2 ring-brand-300 ring-offset-1'
                      : 'border-border bg-white text-muted',
                )}
              >
                {isFilled ? 'ΓÇó' : ''}
              </span>
            )
          })}
        </div>

        {/* B├án ph├¡m sß╗æ tr├¬n giao diß╗çn (Visual Keypad) */}
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
                    X├│a
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
                    {busy ? 'ΓÇª' : 'V├áo'}
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
    </div>,
    document.body,
  )
}
