import { useNavigate } from 'react-router'
import { AlertCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { AikidCatCharacter, type AikidCatPose } from '@/shared/components/ui/AikidCatCharacter'
import { learnerFriendlyError } from '@/shared/lib/learner-error'
import { cn } from '@/shared/lib/cn'

export interface ErrorStateProps {
  title?: string
  message?: string
  error?: unknown
  onRetry?: () => void
  onBack?: () => void
  onHome?: () => void
  showHome?: boolean
  showBack?: boolean
  homeText?: string
  backText?: string
  homeUrl?: string
  className?: string
  /** Inline banner instead of full card */
  inline?: boolean
  /** Whether to show AIKI cat mascot (default: true for full card) */
  useMascot?: boolean
  /** Cat pose for the illustration (default: 'thinking') */
  mascotPose?: AikidCatPose
  /** Subtle helper note underneath */
  reassuranceNote?: string
}

export function ErrorState({
  title = 'Úi, có chút trục trặc nhỏ',
  message,
  error,
  onRetry,
  onBack,
  onHome,
  showHome = true,
  showBack = true,
  homeText = 'Về Trang Chủ',
  backText = 'Quay lại',
  homeUrl = '/',
  className,
  inline = false,
  useMascot = true,
  mascotPose = 'thinking',
  reassuranceNote = 'Thành tích và số sao của con luôn được giữ an toàn tuyệt đối.',
}: ErrorStateProps) {
  let navigate: ReturnType<typeof useNavigate> | null = null
  try {
    navigate = useNavigate()
  } catch {
    navigate = null
  }

  const rawError = error ?? message ?? 'Có chút trục trặc nhỏ khi tải dữ liệu.'
  const cleanMessage = learnerFriendlyError(rawError)

  const handleHome = () => {
    if (onHome) {
      onHome()
    } else if (navigate) {
      navigate(homeUrl)
    } else if (typeof window !== 'undefined') {
      window.location.href = homeUrl
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (navigate) {
      navigate(-1)
    } else if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  if (inline) {
    return (
      <div
        role="alert"
        className={cn(
          'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 to-sun-50/80 px-4 py-3 text-sm text-text shadow-2xs',
          className,
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-200/70 text-amber-800">
            <AlertCircle size={16} />
          </div>
          <p className="font-semibold text-xs sm:text-sm text-slate-800 truncate sm:whitespace-normal">
            {cleanMessage}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onRetry && (
            <Button
              type="button"
              variant="secondary"
              className="!min-h-8 !px-3 !text-xs font-bold"
              onClick={onRetry}
            >
              <RefreshCw size={13} className="mr-1 inline" /> Thử lại
            </Button>
          )}
          {showHome && (
            <Button
              type="button"
              variant="ghost"
              className="!min-h-8 !px-2.5 !text-xs font-bold text-slate-600 hover:text-slate-900"
              onClick={handleHome}
            >
              <Home size={13} className="mr-1 inline" /> Trang chủ
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      role="alert"
      className={cn(
        'relative mx-auto flex w-full max-w-lg flex-col items-center rounded-3xl border-2 border-cream-200 bg-white/95 p-6 sm:p-8 text-center shadow-clay text-text page-enter',
        className,
      )}
    >
      {/* Decorative top soft badge */}
      <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">
        🧭 Chuyến thám hiểm tạm dừng một chút
      </span>

      {/* Mascot illustration */}
      {useMascot ? (
        <div className="my-2 flex justify-center">
          <AikidCatCharacter
            pose={mascotPose}
            variant="full-body"
            className="h-28 w-28 drop-shadow-md sm:h-32 sm:w-32"
          />
        </div>
      ) : (
        <div className="my-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-inner">
          <AlertCircle size={32} />
        </div>
      )}

      {/* Friendly Title & Description */}
      <h2 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2.5 max-w-md text-sm font-semibold leading-relaxed text-slate-600 sm:text-base">
        {cleanMessage}
      </p>

      {/* Reassurance note */}
      {reassuranceNote && (
        <p className="mt-2 text-xs font-medium text-slate-600">
          🛡️ {reassuranceNote}
        </p>
      )}

      {/* Action buttons row with escape hatches */}
      <div className="mt-6 flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
        {onRetry && (
          <Button
            type="button"
            variant="primary"
            className="w-full sm:flex-1 h-11 sm:h-12 !py-0 whitespace-nowrap inline-flex items-center justify-center shadow-md"
            onClick={onRetry}
          >
            <RefreshCw size={16} className="mr-1.5 inline" /> Thử lại
          </Button>
        )}

        {showHome && (
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:flex-1 h-11 sm:h-12 !py-0 whitespace-nowrap border-2 border-slate-200 inline-flex items-center justify-center"
            onClick={handleHome}
          >
            <Home size={16} className="mr-1.5 inline" /> {homeText}
          </Button>
        )}

        {showBack && (
          <Button
            type="button"
            variant="ghost"
            className="w-full sm:w-auto sm:px-5 h-11 sm:h-12 !py-0 whitespace-nowrap text-slate-600 hover:text-slate-900 inline-flex items-center justify-center"
            onClick={handleBack}
          >
            <ArrowLeft size={16} className="mr-1 inline" /> {backText}
          </Button>
        )}
      </div>
    </div>
  )
}
