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

let configPromise: Promise<PublicFirebaseConfig | null> | null = null

async function publicConfig(): Promise<PublicFirebaseConfig | null> {
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
