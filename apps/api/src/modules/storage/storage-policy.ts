const PURPOSES = {
  avatar: {
    maxBytes: 5 * 1024 * 1024,
    mime: new Set(['image/jpeg', 'image/png', 'image/webp']),
  },
  portfolio: {
    maxBytes: 25 * 1024 * 1024,
    mime: new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'audio/mpeg',
      'audio/mp4',
    ]),
  },
  classroom: {
    maxBytes: 15 * 1024 * 1024,
    mime: new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  },
} as const

export type UploadPurpose = keyof typeof PURPOSES

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'application/pdf': 'pdf',
}

export function validateUpload(input: {
  purpose: UploadPurpose
  mime: string
  size: number
}): void {
  const policy = PURPOSES[input.purpose]
  if (!policy.mime.has(input.mime as never)) {
    throw Object.assign(new Error('Định dạng tệp chưa được hỗ trợ.'), {
      statusCode: 400,
      logCode: 'UPLOAD_MIME_REJECTED',
    })
  }
  if (!Number.isSafeInteger(input.size) || input.size <= 0 || input.size > policy.maxBytes) {
    throw Object.assign(new Error('Kích thước tệp không hợp lệ hoặc quá lớn.'), {
      statusCode: 400,
      logCode: 'UPLOAD_SIZE_REJECTED',
    })
  }
}

export function buildObjectPath(input: {
  userId: string
  objectId: string
  purpose: UploadPurpose
  mime: string
}): string {
  const safeId = /^[0-9a-f-]{36}$/i
  if (!safeId.test(input.userId) || !safeId.test(input.objectId)) {
    throw new Error('Invalid storage owner or object id')
  }
  const extension = EXTENSIONS[input.mime]
  if (!extension) throw new Error('Unsupported storage extension')
  return `users/${input.userId}/${input.purpose}/${input.objectId}.${extension}`
}

export function maxUploadBytes(purpose: UploadPurpose): number {
  return PURPOSES[purpose].maxBytes
}
