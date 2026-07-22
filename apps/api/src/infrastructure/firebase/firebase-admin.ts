import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app'
import { env } from '../../config/env.js'

const APP_NAME = 'aikids-firebase'

type ServiceAccountFile = ServiceAccount & {
  project_id?: string
  client_email?: string
  private_key?: string
}

let cachedApp: App | null | undefined

export function parseServiceAccountJsonBase64(encoded: string): ServiceAccountFile {
  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64').toString('utf8'),
    ) as ServiceAccountFile
    if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
      throw new Error('missing required service-account fields')
    }
    return parsed
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 is invalid')
  }
}

export function validateServiceAccountProject(input: {
  configuredProjectId: string
  credentialProjectId: string
}): string {
  const { configuredProjectId, credentialProjectId } = input
  if (configuredProjectId && configuredProjectId !== credentialProjectId) {
    throw new Error(
      `Firebase credential project ${credentialProjectId} does not match FIREBASE_PROJECT_ID`,
    )
  }
  return configuredProjectId || credentialProjectId
}

export function isFirebaseConfigured(): boolean {
  return env.firebaseEnabled
}

/** Lazy initialization keeps local development and tests independent of Firebase. */
export function getFirebaseAdminApp(): App | null {
  if (cachedApp !== undefined) return cachedApp
  if (!env.firebaseEnabled) {
    cachedApp = null
    return null
  }

  const existing = getApps().find((app) => app.name === APP_NAME)
  if (existing) {
    cachedApp = getApp(APP_NAME)
    return cachedApp
  }

  if (!env.firebaseServiceAccountJsonBase64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 is required when Firebase is enabled')
  }
  const raw = parseServiceAccountJsonBase64(env.firebaseServiceAccountJsonBase64)
  const projectId = validateServiceAccountProject({
    configuredProjectId: env.firebaseProjectId,
    credentialProjectId: raw.project_id!,
  })
  const credential = cert({
    projectId: raw.project_id,
    clientEmail: raw.client_email,
    privateKey: raw.private_key,
  })

  cachedApp = initializeApp(
    {
      credential,
      projectId,
      ...(env.firebaseStorageBucket
        ? { storageBucket: env.firebaseStorageBucket }
        : {}),
    },
    APP_NAME,
  )
  return cachedApp
}

export function requireFirebaseAdminApp(): App {
  const app = getFirebaseAdminApp()
  if (!app) {
    const error = new Error('Firebase is not configured') as Error & {
      statusCode: number
      logCode: string
    }
    error.statusCode = 503
    error.logCode = 'FIREBASE_NOT_CONFIGURED'
    throw error
  }
  return app
}

export function resetFirebaseAdminForTests(): void {
  cachedApp = undefined
}
