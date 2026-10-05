import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, CheckCircle2, Delete, Lock, ShieldCheck, X } from 'lucide-react'
import { api, ApiError } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  isChange?: boolean
}

export function SetParentPinModal({ open, onClose, onSuccess, isChange = false }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const [success, setSuccess] = useState(false)

  const hiddenInputRef = useRef<HTMLInputElement>(null)

  const resetAll = useCallback(() => {
    setStep(1)
    setPin('')
    setConfirmPin('')
    setError(null)
    setLoading(false)
    setShake(false)
    setSuccess(false)
  }, [])

  useEffect(() => {
    if (open) {
      resetAll()
      setTimeout(() => hiddenInputRef.current?.focus(), 150)
    }
  }, [open, resetAll])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const pinRef = useRef(pin)
  pinRef.current = pin
  const confirmPinRef = useRef(confirmPin)
  confirmPinRef.current = confirmPin

  const currentPinValue = step === 1 ? pin : confirmPin

  const handleDigit = useCallback(
    (digit: string) => {
      if (loading || success) return
      setError(null)

      if (step === 1) {
        setPin((prev) => {
          if (prev.length < 4) {
            const next = prev + digit
            pinRef.current = next
            if (next.length === 4) {
              setTimeout(() => {
                setStep(2)
                setConfirmPin('')
                confirmPinRef.current = ''
                setTimeout(() => hiddenInputRef.current?.focus(), 50)
              }, 150)
            }
            return next
          }
          return prev
        })
      } else {
        setConfirmPin((prev) => {
          if (prev.length < 4) {
            const next = prev + digit
            confirmPinRef.current = next
            if (next.length === 4) {
              setTimeout(() => {
                if (next !== pinRef.current) {
                  setError('Mã PIN xác nhận không khớp. Ba / Mẹ thử lại nhé!')
                  triggerShake()
                  setConfirmPin('')
                  confirmPinRef.current = ''
                } else {
                  void submitPin(next)
                }
              }, 50)
            }
            return next
          }
          return prev
        })
      }
    },
    [loading, success, step],
  )

  const handleDelete = useCallback(() => {
    if (loading || success) return
    setError(null)
    if (step === 1) {
      setPin((prev) => prev.slice(0, -1))
    } else {
      if (confirmPin.length === 0) {
        // Back to step 1
        setStep(1)
        setPin('')
      } else {
        setConfirmPin((prev) => prev.slice(0, -1))
      }
    }
  }, [loading, success, step, confirmPin.length])

  const submitPin = async (finalPin: string) => {
    setLoading(true)
    setError(null)
    try {
      await api<{ message: string; hasParentPin: boolean }>('/api/parent/pin', {
        method: 'POST',
        body: JSON.stringify({ pin: finalPin }),
      })
      setSuccess(true)
      onSuccess?.()
      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message ?? 'Không thể lưu mã PIN. Ba / Mẹ thử lại nhé!')
      } else {
        setError('Có lỗi xảy ra, thử lại sau nhé!')
      }
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  // Handle hardware keyboard
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key)
      } else if (e.key === 'Backspace') {
        handleDelete()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose, handleDigit, handleDelete])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm safe-pt safe-pb"
      role="dialog"
      aria-modal="true"
      aria-label={isChange ? 'Đổi mã PIN Ba / Mẹ' : 'Cài đặt mã PIN Ba / Mẹ'}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border-2 border-brand-100/90 flex flex-col"
        style={{
          maxHeight: 'min(95dvh, 640px)',
          ...(shake ? { animation: 'shake 0.4s ease-in-out' } : {}),
        }}
        onClick={(e) => {
          e.stopPropagation()
          hiddenInputRef.current?.focus()
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-brand-500 via-brand-600 to-purple-600 px-6 pb-5 pt-6 text-center text-white shrink-0 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>

          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-xs">
            <ShieldCheck size={36} className="text-white" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isChange ? 'Đổi mã PIN Ba / Mẹ' : 'Cài đặt mã PIN Ba / Mẹ'}
          </h2>

          {/* Step Pill */}
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-xs font-black text-white backdrop-blur-xs">
            <span>{step === 1 ? 'Bước 1/2' : 'Bước 2/2'}:</span>
            <span>{step === 1 ? 'Nhập mã PIN 4 số mới' : 'Xác nhận lại mã PIN'}</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1 min-h-0 flex flex-col justify-between overflow-y-auto">
          {/* Hidden input for mobile keyboard / accessibility */}
          <input
            ref={hiddenInputRef}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={currentPinValue}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4)
              if (step === 1) {
                setPin(val)
                if (val.length === 4) {
                  setTimeout(() => {
                    setStep(2)
                    setConfirmPin('')
                  }, 200)
                }
              } else {
                setConfirmPin(val)
                if (val.length === 4) {
                  if (val !== pin) {
                    setError('Mã PIN xác nhận không khớp. Ba / Mẹ thử lại nhé!')
                    triggerShake()
                    setConfirmPin('')
                  } else {
                    void submitPin(val)
                  }
                }
              }
            }}
            className="sr-only opacity-0 absolute pointer-events-none"
            aria-hidden="true"
            tabIndex={-1}
          />

          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3 shadow-soft animate-bounce">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {isChange ? 'Đã đổi mã PIN thành công!' : 'Đã cài đặt mã PIN thành công!'}
              </h3>
              <p className="mt-1 text-sm text-muted">
                Ba / Mẹ có thể dùng mã PIN này để mở Cổng phụ huynh bất cứ lúc nào.
              </p>
            </div>
          ) : (
            <>
              {/* 4 PIN Dots */}
              <div className="mb-4">
                <div
                  className="flex items-center justify-center gap-3.5"
                  onClick={() => hiddenInputRef.current?.focus()}
                >
                  {[0, 1, 2, 3].map((i) => {
                    const isFilled = i < currentPinValue.length
                    const isActive = i === currentPinValue.length
                    return (
                      <div
                        key={i}
                        className={cn(
                          'flex h-13 w-12 sm:h-15 sm:w-14 items-center justify-center rounded-2xl border-2 text-2xl sm:text-3xl font-black transition-all select-none',
                          isFilled
                            ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-soft scale-105'
                            : isActive
                              ? 'border-brand-400 bg-white ring-2 ring-brand-300 ring-offset-2 animate-pulse'
                              : 'border-slate-200 bg-slate-50 text-slate-300',
                        )}
                      >
                        {isFilled ? '•' : ''}
                      </div>
                    )
                  })}
                </div>

                {/* Error message */}
                {error && (
                  <p className="mt-2.5 text-center text-xs sm:text-sm font-bold text-rose-500">
                    {error}
                  </p>
                )}
                {!error && (
                  <p className="mt-2 text-center text-xs text-muted">
                    {step === 1
                      ? 'Chọn 4 chữ số dễ nhớ nhưng bảo mật'
                      : 'Nhập lại đúng 4 chữ số vừa chọn'}
                  </p>
                )}
              </div>

              {/* On-screen Soft-Clay Numpad */}
              <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px] mx-auto select-none">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={loading}
                    onClick={() => handleDigit(String(n))}
                    className="flex h-12 sm:h-13 items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 active:scale-95 text-xl sm:text-2xl font-black text-slate-800 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {n}
                  </button>
                ))}

                {/* Bottom row */}
                {step === 2 ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setStep(1)
                      setConfirmPin('')
                      setPin('')
                      setError(null)
                    }}
                    className="flex h-12 sm:h-13 items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-black text-slate-600 shadow-2xs transition-all cursor-pointer"
                    title="Quay lại bước 1"
                  >
                    <ArrowLeft size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading || pin.length === 0}
                    onClick={() => setPin('')}
                    className="flex h-12 sm:h-13 items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-black text-slate-600 shadow-2xs transition-all cursor-pointer disabled:opacity-30"
                  >
                    Xóa hết
                  </button>
                )}

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDigit('0')}
                  className="flex h-12 sm:h-13 items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 active:scale-95 text-xl sm:text-2xl font-black text-slate-800 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                >
                  0
                </button>

                <button
                  type="button"
                  disabled={loading || currentPinValue.length === 0}
                  onClick={handleDelete}
                  className="flex h-12 sm:h-13 items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-100 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 active:scale-95 text-slate-600 shadow-2xs transition-all cursor-pointer disabled:opacity-30"
                  aria-label="Xóa 1 số"
                >
                  <Delete size={20} />
                </button>
              </div>

              {/* Step 2 Back option */}
              {step === 2 && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setConfirmPin('')
                      setPin('')
                      setError(null)
                    }}
                    className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                  >
                    ← Đổi lại mã PIN ở bước 1
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Để sau
          </button>
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Lock size={12} /> Bảo mật riêng tư
          </span>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
      `}</style>
    </div>,
    document.body,
  )
}
