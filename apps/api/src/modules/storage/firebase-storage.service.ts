import { getStorage } from 'firebase-admin/storage'
import { env } from '../../config/env.js'
import { requireFirebaseAdminApp } from '../../infrastructure/firebase/firebase-admin.js'
import { maxUploadBytes, type UploadPurpose } from './storage-policy.js'

function bucket() {
  if (!env.firebaseStorageBucket) {
    throw Object.assign(new Error('Firebase Storage bucket is not configured'), {
      statusCode: 503,
      logCode: 'FIREBASE_STORAGE_NOT_CONFIGURED',
    })
  }
  return getStorage(requireFirebaseAdminApp()).bucket(env.firebaseStorageBucket)
}

export async function createSignedUploadUrl(input: {
  objectPath: string
  mime: string
}): Promise<{ uploadUrl: string; expiresAt: string }> {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
  const [uploadUrl] = await bucket().file(input.objectPath).getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: expiresAt,
    contentType: input.mime,
  })
  return { uploadUrl, expiresAt: expiresAt.toISOString() }
}

export async function verifyUploadedObject(input: {
  objectPath: string
  expectedMime: string
  expectedSize: number
  purpose: UploadPurpose
}): Promise<{ size: number; mime: string; generation: string | null }> {
  const file = bucket().file(input.objectPath)
  const [metadata] = await file.getMetadata()
  const size = Number(metadata.size ?? 0)
  const mime = metadata.contentType ?? ''
  const valid =
    size === input.expectedSize &&
    size > 0 &&
    size <= maxUploadBytes(input.purpose) &&
    mime === input.expectedMime

  if (!valid) {
    await file.delete({ ignoreNotFound: true })
    throw Object.assign(new Error('Tệp tải lên không khớp thông tin đã đăng ký.'), {
      statusCode: 400,
      logCode: 'UPLOAD_METADATA_MISMATCH',
    })
  }
  return { size, mime, generation: metadata.generation == null ? null : String(metadata.generation) }
}

export async function createSignedReadUrl(objectPath: string): Promise<{
  url: string
  expiresAt: string
}> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
  const [url] = await bucket().file(objectPath).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: expiresAt,
  })
  return { url, expiresAt: expiresAt.toISOString() }
}
