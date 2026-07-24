import { api } from './api'

const FIREBASE_APP_NAME = 'aikids-web'

type PublicFirebaseConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  vapidKey: string
}

let configPromise: Promise<PublicFirebaseConfig | null> | null = null
let authPromise: Promise<import('firebase/auth').Auth | null> | null = null

async function publicConfig(): Promise<PublicFirebaseConfig | null> {
  configPromise ??= api<{ enabled: boolean; config: PublicFirebaseConfig | null }>(
    '/api/auth/firebase/config',
  ).then((result) => result.enabled ? result.config : null)
  return configPromise
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

async function firebaseAuth(): Promise<import('firebase/auth').Auth | null> {
  if (authPromise) return authPromise
  const pending = (async () => {
    const app = await firebaseApp()
    if (!app) return null
    const { getAuth, signInWithCustomToken } = await import('firebase/auth')
    const auth = getAuth(app)
    // Always bind persisted Firebase Auth to the current httpOnly app session.
    const token = await api<{ customToken: string }>('/api/auth/firebase/custom-token', {
      method: 'POST',
    })
    await signInWithCustomToken(auth, token.customToken)
    return auth
  })()
  authPromise = pending
  void pending.catch(() => {
    if (authPromise === pending) authPromise = null
  })
  return pending
}

export async function enablePushNotifications(): Promise<boolean> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return false
  const permission = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission()
  if (permission !== 'granted') return false

  const [config, auth, messagingModule] = await Promise.all([
    publicConfig(),
    firebaseAuth(),
    import('firebase/messaging'),
  ])
  if (!config || !auth || !config.vapidKey || !(await messagingModule.isSupported())) return false

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
  const token = await messagingModule.getToken(messagingModule.getMessaging(auth.app), {
    vapidKey: config.vapidKey,
    serviceWorkerRegistration: registration,
  })
  if (!token) return false
  await api('/api/notifications/devices', {
    method: 'POST',
    body: JSON.stringify({ token, platform: 'web' }),
  })
  return true
}

/** Remove the shared-device push token before the app session changes owner. */
export async function disconnectFirebaseSession(): Promise<void> {
  const pending = authPromise
  authPromise = null
  if (!pending) return

  const auth = await pending.catch(() => null)
  if (!auth) return
  try {
    const config = await publicConfig()
    if (
      config?.vapidKey &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'granted' &&
      'serviceWorker' in navigator
    ) {
      const messagingModule = await import('firebase/messaging')
      if (await messagingModule.isSupported()) {
        const registration = await navigator.serviceWorker.getRegistration('/')
        const messaging = messagingModule.getMessaging(auth.app)
        const token = await messagingModule.getToken(messaging, {
          vapidKey: config.vapidKey,
          ...(registration ? { serviceWorkerRegistration: registration } : {}),
        })
        if (token) {
          await api('/api/notifications/devices', {
            method: 'DELETE',
            body: JSON.stringify({ token }),
          }).catch(() => undefined)
        }
        await messagingModule.deleteToken(messaging).catch(() => false)
      }
    }
  } finally {
    const { signOut } = await import('firebase/auth')
    await signOut(auth).catch(() => undefined)
  }
}

export async function listenForForegroundPush(onMessage: () => void): Promise<() => void> {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return () => undefined
  try {
    const auth = await firebaseAuth()
    const messagingModule = await import('firebase/messaging')
    if (!auth || !(await messagingModule.isSupported())) return () => undefined
    return messagingModule.onMessage(messagingModule.getMessaging(auth.app), onMessage)
  } catch {
    return () => undefined
  }
}
