import { useEffect, useRef, useState } from 'react'
import type { User } from '@/shared/lib/api'
import { cn } from '@/shared/lib/cn'
import { firebaseApp } from '@/shared/lib/firebase-client'
import { useAuth } from '@/shared/store/auth'
import { authFeedback } from '@/features/auth/lib/auth-feedback'

type GoogleAuthRuntime = {
  auth: import('firebase/auth').Auth
  GoogleAuthProvider: typeof import('firebase/auth').GoogleAuthProvider
  signInWithPopup: typeof import('firebase/auth').signInWithPopup
}

type Props = {
  disabled?: boolean
  className?: string
  onSuccess: (user: User) => void
  onError: (message: string) => void
}

export function GoogleSignInButton({ disabled = false, className, onSuccess, onError }: Props) {
  const [busy, setBusy] = useState(false)
  const [preparing, setPreparing] = useState(true)
  const runtime = useRef<GoogleAuthRuntime | null>(null)
  const preparationError = useRef<unknown>(null)
  const callbacks = useRef({ onSuccess, onError })
  const completeFirebaseSignIn = useAuth((state) => state.completeFirebaseSignIn)
  callbacks.current = { onSuccess, onError }

  useEffect(() => {
    let active = true
    void Promise.all([firebaseApp(), import('firebase/auth')])
      .then(([app, firebaseAuth]) => {
        if (!app) throw new Error('Firebase chưa được cấu hình.')
        if (!active) return
        runtime.current = {
          auth: firebaseAuth.getAuth(app),
          GoogleAuthProvider: firebaseAuth.GoogleAuthProvider,
          signInWithPopup: firebaseAuth.signInWithPopup,
        }
      })
      .catch((error) => {
        if (active) preparationError.current = error
      })
      .finally(() => {
        if (active) setPreparing(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function startGoogleSignIn() {
    setBusy(true)
    try {
      // Prepare Firebase before the click so Safari keeps the popup tied to the
      // user's gesture instead of opening a blank or blocked window.
      const prepared = runtime.current
      if (!prepared) throw preparationError.current ?? new Error('Google đang khởi tạo. Vui lòng thử lại.')
      const provider = new prepared.GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const credential = await prepared.signInWithPopup(prepared.auth, provider)
      const idToken = await credential.user.getIdToken()
      const user = await completeFirebaseSignIn(idToken, { role: 'parent' })
      callbacks.current.onSuccess(user)
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: unknown }).code ?? '')
        : ''
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return
      callbacks.current.onError(authFeedback(error, 'login'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || busy || preparing}
      onClick={() => void startGoogleSignIn()}
      className={cn('ui-btn ui-btn-secondary w-full !min-h-12 gap-3', className)}
    >
      <GoogleIcon className="h-5 w-5 shrink-0" />
      <span>{preparing ? 'Đang chuẩn bị Google…' : busy ? 'Đang đăng nhập…' : 'Tiếp tục với Google'}</span>
    </button>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
