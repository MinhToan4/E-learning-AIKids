import { useEffect, useRef, useState } from 'react'
import { api, ApiError } from '@/shared/lib/api'
import type { User } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: Record<string, unknown>) => void
          renderButton: (
            el: HTMLElement,
            cfg: Record<string, unknown>,
          ) => void
          prompt: (cb?: (n: { isNotDisplayed: () => boolean }) => void) => void
          cancel: () => void
        }
      }
    }
  }
}

type Props = {
  /** parent | teacher — only for brand-new Google accounts */
  role?: 'parent' | 'teacher'
  onSuccess: (user: User) => void
  onError: (message: string) => void
  className?: string
}

/**
 * Full-width Google sign-in matching our primary login button.
 * Uses GIS under the hood; UI is our secondary clay button (not the short iframe).
 */
export function GoogleSignInButton({
  role = 'parent',
  onSuccess,
  onError,
  className,
}: Props) {
  const [enabled, setEnabled] = useState(false)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [clientId, setClientId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const handlers = useRef({ onSuccess, onError, role })
  handlers.current = { onSuccess, onError, role }
  const initialized = useRef(false)
  const hiddenHost = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const fromEnv = (
        import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
      )?.trim()
      try {
        const cfg = await api<{ enabled: boolean; clientId: string | null }>(
          '/api/auth/google/config',
        )
        const id = cfg.clientId || fromEnv || null
        if (!cancelled) {
          setEnabled(Boolean(id))
          setClientId(id)
        }
      } catch {
        // API offline — still allow button if FE has client id (clearer error on click)
        if (!cancelled && fromEnv) {
          setEnabled(true)
          setClientId(fromEnv)
        }
      } finally {
        if (!cancelled) setConfigLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!enabled || !clientId) return
    let cancelled = false

    void (async () => {
      try {
        await loadGisScript()
        if (cancelled || !window.google) return

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential?: string }) => {
            const credential = response.credential
            if (!credential) {
              setBusy(false)
              handlers.current.onError(
                'Google không trả về thông tin đăng nhập.',
              )
              return
            }
            try {
              const data = await api<{ user: User }>('/api/auth/login/google', {
                method: 'POST',
                body: JSON.stringify({
                  credential,
                  role: handlers.current.role,
                }),
              })
              handlers.current.onSuccess(data.user)
            } catch (e) {
              handlers.current.onError(
                e instanceof ApiError
                  ? e.message
                  : e instanceof Error
                    ? e.message
                    : 'Không đăng nhập được bằng Google.',
              )
            } finally {
              setBusy(false)
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          // Avoid deprecated One Tap "moment" APIs that break under FedCM
          use_fedcm_for_prompt: true,
        })
        initialized.current = true
        setScriptReady(true)
      } catch {
        if (!cancelled) {
          handlers.current.onError(
            'Không tải được Google. Kiểm tra mạng rồi thử lại nhé.',
          )
        }
      }
    })()

    return () => {
      cancelled = true
      try {
        window.google?.accounts.id.cancel()
      } catch {
        /* ignore */
      }
    }
  }, [enabled, clientId])

  async function startGoogleSignIn() {
    if (!clientId || !window.google || !initialized.current) {
      onError(
        'Đăng nhập Google chưa sẵn sàng. Đợi một chút hoặc tải lại trang nhé.',
      )
      return
    }
    setBusy(true)
    // Safety: if user closes popup without completing
    window.setTimeout(() => setBusy(false), 45_000)

    // Custom full-width button → open Google via hidden official control
    // (avoids deprecated One Tap moment listeners that FedCM will remove)
    try {
      clickHiddenGisButton()
    } catch {
      setBusy(false)
      onError('Không mở được Google. Thử lại nhé.')
    }
  }

  function clickHiddenGisButton() {
    if (!window.google || !hiddenHost.current) {
      setBusy(false)
      onError('Không mở được cửa sổ Google. Thử lại nhé.')
      return
    }
    hiddenHost.current.innerHTML = ''
    window.google.accounts.id.renderButton(hiddenHost.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      width: 280,
    })
    // Programmatic click on GIS rendered control
    const clickable =
      hiddenHost.current.querySelector<HTMLElement>('[role="button"]') ||
      hiddenHost.current.querySelector<HTMLElement>('div[tabindex]') ||
      (hiddenHost.current.firstElementChild as HTMLElement | null)
    if (clickable) {
      clickable.click()
    } else {
      setBusy(false)
      onError('Không mở được cửa sổ Google. Thử lại nhé.')
    }
  }

  if (configLoaded && !enabled) {
    return (
      <button
        type="button"
        onClick={() => onError('Google chưa được cấu hình trên Account API.')}
        className={cn('ui-btn ui-btn-secondary w-full !min-h-12 gap-3', className)}
      >
        <GoogleGIcon className="h-5 w-5 shrink-0" />
        <span>Tiếp tục với Google</span>
      </button>
    )
  }

  if (!enabled) return null

  return (
    <div className={cn('w-full', className)}>
      {/* Off-screen host for GIS fallback button */}
      <div
        ref={hiddenHost}
        className="pointer-events-none fixed left-[-9999px] top-0 h-px w-px overflow-hidden opacity-0"
        aria-hidden
      />
      <button
        type="button"
        disabled={busy || !scriptReady}
        onClick={() => void startGoogleSignIn()}
        className={cn(
          'ui-btn ui-btn-secondary w-full !min-h-12 gap-3',
          (busy || !scriptReady) && 'opacity-70',
        )}
      >
        <GoogleGIcon className="h-5 w-5 shrink-0" />
        <span>
          {busy
            ? 'Đang đăng nhập…'
            : !scriptReady
              ? 'Đang tải Google…'
              : 'Tiếp tục với Google'}
        </span>
      </button>
    </div>
  )
}

function GoogleGIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-google-gis]',
  )
  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () =>
        reject(new Error('Không tải được Google')),
      )
    })
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.dataset.googleGis = '1'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Không tải được Google'))
    document.head.appendChild(s)
  })
}
