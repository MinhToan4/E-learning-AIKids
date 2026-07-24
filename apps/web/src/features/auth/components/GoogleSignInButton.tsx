import { useState, useRef } from 'react'
import { api, ApiError } from '@/shared/lib/api'
import type { User } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { firebaseApp } from '@/shared/lib/firebase-client'

type Props = {
  /** parent | teacher — only for brand-new Google accounts */
  role?: 'parent' | 'teacher'
  onSuccess: (user: User) => void
  onError: (message: string) => void
  className?: string
}

/**
 * Full-width Google sign-in matching our primary login button.
 * Uses Firebase Auth under the hood.
 */
export function GoogleSignInButton({
  role = 'parent',
  onSuccess,
  onError,
  className,
}: Props) {
  const [busy, setBusy] = useState(false)
  const handlers = useRef({ onSuccess, onError, role })
  handlers.current = { onSuccess, onError, role }

  async function startGoogleSignIn() {
    setBusy(true)
    try {
      const app = await firebaseApp()
      if (!app) {
        throw new Error('Firebase chưa được cấu hình.')
      }

      const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('firebase/auth')
      const auth = getAuth(app)
      const provider = new GoogleAuthProvider()
      
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()

      const data = await api<{ user: User }>('/api/auth/login/firebase', {
        method: 'POST',
        body: JSON.stringify({
          idToken,
          role: handlers.current.role,
        }),
      })
      
      handlers.current.onSuccess(data.user)
    } catch (e: any) {
      // Ignore user cancellation errors (popup closed)
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
        return
      }
      
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
  }

  return (
    <div className={cn('w-full', className)}>
      <button
        type="button"
        disabled={busy}
        onClick={() => void startGoogleSignIn()}
        className={cn(
          'ui-btn ui-btn-secondary w-full !min-h-12 gap-3',
          busy && 'opacity-70',
        )}
      >
        <GoogleGIcon className="h-5 w-5 shrink-0" />
        <span>
          {busy ? 'Đang đăng nhập…' : 'Tiếp tục với Google'}
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
