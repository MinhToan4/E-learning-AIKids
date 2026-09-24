import { api } from './api'

const FIREBASE_APP_NAME = 'aikids-web'

type PublicFirebaseConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

function staticConfig(): PublicFirebaseConfig | null {
  const runtime = typeof window !== 'undefined' ? window.__AIKIDS_RUNTIME_CONFIG__?.firebaseConfig : undefined
  if (runtime && runtime.apiKey && runtime.projectId) {
    return runtime
  }
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim()
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim()
  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || `${envProjectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() || '',
    }
  }
  return null
}

let configPromise: Promise<PublicFirebaseConfig | null> | null = null

async function publicConfig(): Promise<PublicFirebaseConfig | null> {
  const staticConf = staticConfig()
  if (staticConf) return staticConf

  configPromise ??= api<{
    enabled: boolean
    config: PublicFirebaseConfig | null
  }>('/api/auth/firebase/config').then((response) =>
    response.enabled ? response.config : null,
  )
  const config = await configPromise
  if (!config || !config.apiKey) return null
  return config
}

let appPromise: Promise<import('firebase/app').FirebaseApp | null> | null = null

export async function firebaseApp(): Promise<import('firebase/app').FirebaseApp | null> {
  if (appPromise) return appPromise
  const pending = (async () => {
    const config = await publicConfig()
    if (!config) return null
    const { getApps, initializeApp } = await import('firebase/app')
    return getApps().find((candidate) => candidate.name === FIREBASE_APP_NAME) ??
      initializeApp(config, FIREBASE_APP_NAME)
  })()
  appPromise = pending
  void pending.catch(() => {
    if (appPromise === pending) appPromise = null
  })
  return pending
}

export async function disconnectFirebaseSession(): Promise<void> {
  const app = await firebaseApp().catch(() => null)
  if (!app) return
  try {
    const { getAuth, signOut } = await import('firebase/auth')
    const auth = getAuth(app)
    await signOut(auth).catch(() => undefined)
  } finally {
    // Keep the cleanup narrow: notification delivery is app-internal now.
  }
}

async function firebaseAuth() {
  const app = await firebaseApp()
  if (!app) throw new Error('Firebase chưa được cấu hình.')
  const { getAuth } = await import('firebase/auth')
  return getAuth(app)
}

export async function signInWithFirebasePassword(
  email: string,
  password: string,
): Promise<string> {
  const auth = await firebaseAuth()
  const { signInWithEmailAndPassword } = await import('firebase/auth')
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user.getIdToken()
}

export async function registerWithFirebasePassword(
  email: string,
  password: string,
): Promise<{ idToken: string; sendVerification: () => Promise<void> }> {
  const auth = await firebaseAuth()
  const { createUserWithEmailAndPassword, sendEmailVerification } = await import('firebase/auth')
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  return {
    idToken: await credential.user.getIdToken(),
    sendVerification: () => sendEmailVerification(credential.user),
  }
}

export async function sendFirebasePasswordReset(email: string): Promise<void> {
  const auth = await firebaseAuth()
  const { sendPasswordResetEmail } = await import('firebase/auth')
  auth.languageCode = 'vi'
  await sendPasswordResetEmail(auth, email, {
    // Firebase's email template action URL must point at /reset-password.
    // This continue URL gives both the default and custom handlers a safe
    // first-party destination instead of leaving the user on firebaseapp.com.
    url: `${window.location.origin}/login`,
    handleCodeInApp: false,
  })
}

export async function verifyFirebasePasswordResetCode(actionCode: string): Promise<string> {
  const auth = await firebaseAuth()
  const { verifyPasswordResetCode } = await import('firebase/auth')
  return verifyPasswordResetCode(auth, actionCode)
}

export async function confirmFirebasePasswordReset(
  actionCode: string,
  newPassword: string,
): Promise<void> {
  const auth = await firebaseAuth()
  const { confirmPasswordReset } = await import('firebase/auth')
  await confirmPasswordReset(auth, actionCode, newPassword)
}

export async function changeFirebasePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const auth = await firebaseAuth()
  const user = auth.currentUser
  if (!user?.email) throw new Error('Tài khoản hiện tại không dùng mật khẩu email.')
  const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth')
  await reauthenticateWithCredential(
    user,
    EmailAuthProvider.credential(user.email, currentPassword),
  )
  await updatePassword(user, newPassword)
}
