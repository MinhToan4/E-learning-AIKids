import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { env } from '../src/config/env.js'
import { requireFirebaseAdminApp } from '../src/infrastructure/firebase/firebase-admin.js'

const app = requireFirebaseAdminApp()
const report: Record<string, unknown> = {
  projectId: app.options.projectId,
  authReachable: false,
  firestoreReachable: false,
  storageConfigured: Boolean(env.firebaseStorageBucket),
  storageReachable: false,
  webPushConfigured: Boolean(env.firebaseWebVapidKey),
  pushQueueEnabled: env.firebasePushEnabled,
}

await getAuth(app).listUsers(1)
report.authReachable = true

// Do not print collection names or documents; this is an operational connectivity check.
await getFirestore(app).listCollections()
report.firestoreReachable = true

if (env.firebaseStorageBucket) {
  const [exists] = await getStorage(app).bucket(env.firebaseStorageBucket).exists()
  report.storageReachable = exists
}

console.log(JSON.stringify(report, null, 2))
