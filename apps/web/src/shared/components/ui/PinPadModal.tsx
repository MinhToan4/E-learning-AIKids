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
  closeLabel = 'Hủy',
}: PinPadModalProps) {
  const { toasts, showToast, dismissToast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)

  // Tự động focus vào ô nhập PIN khi mở modal
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [isOpen])

  // Xử lý phím Escape để đóng modal từ bàn phím
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

  // Xử lý thay đổi dữ liệu từ bàn phím thực, bàn phím ảo di động hoặc paste (Ctrl+V)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (busy) return
    const rawVal = e.target.value
    const digitsOnly = rawVal.replace(/\D/g, '').slice(0, 6)

    // Nếu người dùng gõ chữ cái / ký tự đặc biệt, cảnh báo nhẹ cho người dùng
    if (/\D/.test(rawVal)) {
      showToast('Chỉ được phép nhập số!', 'error')
    }

    setPin(digitsOnly)
    if (digitsOnly.length === 6 && digitsOnly !== pin) {
      onSubmit(digitsOnly)
    }
  }

  // Xử lý nhấn Enter để submit mã PIN
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && pin.length === 6 && !busy) {
      e.preventDefault()
      onSubmit(pin)
    }
  }

  // Xử lý bấm các phím số trên bàn phím ảo (UI Keypad)
  function onPinDigit(d: string) {
    if (busy || pin.length >= 6) return
    const next = (pin + d).slice(0, 6)
    setPin(next)
    inputRef.current?.focus()
    if (next.length === 6) {
      onSubmit(next)
    }
  }

  // Xử lý phím Xóa trên bàn phím ảo (UI Keypad)
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

        {/* Khung hiển thị ô nhập PIN kết hợp HTML input ẩn để nhận phím/bàn phím di động/paste */}
        <div
          className="relative mb-4 flex justify-center gap-2 cursor-pointer"
          onClick={() => inputRef.current?.focus()}
          aria-label="Mã PIN đã nhập"
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
            aria-label="Nhập mã PIN 6 số"
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
                {isFilled ? '•' : ''}
              </span>
            )
          })}
        </div>

        {/* Bàn phím số trên giao diện (Visual Keypad) */}
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
    </div>,
    document.body,
  )
}
