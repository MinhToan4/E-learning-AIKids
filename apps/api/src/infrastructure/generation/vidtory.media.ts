/**
 * Vidtory media.upload wrapper + student tagging.
 * CURRENT STORAGE REALITY: we persist Vidtory CDN URLs on Asset rows
 * (no AIKids-owned object storage re-host yet). See docs/VIDTORY_MEDIA_*.
 */
import {
  buildVidtoryUploadMetadata,
  DEFAULT_VIDTORY_BASE_URL,
} from '@aikids/domain'
import { getVidtoryApiKey, getVidtoryRouting } from './vidtory.adapter.js'

export type UploadedMedia = {
  mediaId: string
  url: string
  fileName: string
  fileType: string
  fileSize: number
  /** Always vidtory_cdn until re-host lands */
  storageBackend: 'vidtory_cdn'
  metadata: Record<string, string>
}

export type MediaUploadClient = {
  media: {
    upload: (params: {
      file: Buffer | Blob | ArrayBuffer
      fileName?: string
      metadata?: Record<string, unknown>
      preserveFormat?: boolean
    }) => Promise<{
      id: string
      url: string
      fileName?: string
      fileType?: string
      fileSize?: number
      metadata?: Record<string, unknown>
    }>
  }
}

let mediaClientFactory: ((apiKey: string, baseURL: string) => MediaUploadClient) | null =
  null

export function setVidtoryMediaClientFactory(
  factory: ((apiKey: string, baseURL: string) => MediaUploadClient) | null,
): void {
  mediaClientFactory = factory
}

async function buildMediaClient(): Promise<{
  client: MediaUploadClient
  apiKey: string
  baseURL: string
} | null> {
  const apiKey = await getVidtoryApiKey()
  if (!apiKey) return null
  const routing = await getVidtoryRouting()
  const baseURL = routing.baseURL || DEFAULT_VIDTORY_BASE_URL
  if (mediaClientFactory) {
    return { client: mediaClientFactory(apiKey, baseURL), apiKey, baseURL }
  }
  const { VidtoryAI } = await import('@vidtory/ai-sdk')
  const client = new VidtoryAI({
    apiKey,
    baseURL,
    maxRetries: 1,
    timeout: 60_000,
  }) as unknown as MediaUploadClient
  return { client, apiKey, baseURL }
}

const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
])

export function assertImageUpload(opts: {
  mime: string
  size: number
  maxBytes?: number
}): void {
  const max = opts.maxBytes ?? 20 * 1024 * 1024
  if (opts.size <= 0 || opts.size > max) {
    throw Object.assign(new Error('File quá lớn hoặc rỗng (tối đa 20MB)'), {
      statusCode: 400,
    })
  }
  const mime = opts.mime.toLowerCase()
  if (!ALLOWED_MIME.has(mime) && !mime.startsWith('image/')) {
    throw Object.assign(new Error('Chỉ chấp nhận ảnh (png/jpeg/webp/gif)'), {
      statusCode: 400,
    })
  }
}

/**
 * Upload bytes to Vidtory merchant media with aikids_* metadata tags.
 */
export async function uploadStudentMedia(params: {
  userId: string
  file: Buffer
  fileName: string
  mime: string
  purpose?: string
  questId?: string | null
  assetId?: string | null
}): Promise<UploadedMedia> {
  assertImageUpload({ mime: params.mime, size: params.file.byteLength })

  const metadata = buildVidtoryUploadMetadata({
    userId: params.userId,
    purpose: params.purpose ?? 'student_upload',
    questId: params.questId,
    assetId: params.assetId,
  })

  const built = await buildMediaClient()
  if (!built) {
    throw Object.assign(
      new Error(
        'Chưa cấu hình Vidtory API key — admin cần nhập key trước khi upload',
      ),
      { statusCode: 503 },
    )
  }

  const res = await built.client.media.upload({
    file: params.file,
    fileName: params.fileName,
    metadata,
    preserveFormat: true,
  })

  if (!res?.id || !res?.url) {
    throw Object.assign(new Error('Upload Vidtory không trả id/url'), {
      statusCode: 502,
    })
  }

  return {
    mediaId: res.id,
    url: res.url,
    fileName: res.fileName ?? params.fileName,
    fileType: res.fileType ?? params.mime,
    fileSize: res.fileSize ?? params.file.byteLength,
    storageBackend: 'vidtory_cdn',
    metadata,
  }
}
