import {
  api,
  ApiError,
  uploadToStoryMeeStorage,
} from './api'

const PROFILE_AVATAR_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])
const PROFILE_AVATAR_MAX_BYTES = 5 * 1024 * 1024

export function validateProfileAvatarFile(file: File): void {
  if (!PROFILE_AVATAR_TYPES.has(file.type)) {
    throw new Error('Ảnh đại diện chỉ nhận JPG, PNG hoặc WebP.')
  }
  if (file.size <= 0 || file.size > PROFILE_AVATAR_MAX_BYTES) {
    throw new Error('Ảnh đại diện phải nhỏ hơn 5 MB.')
  }
}

type ProfileAvatarAsset = {
  id: string
  url: string
  mediaId: string
  thumbnailUrl?: string
}

type MediaProcessingStatus =
  | 'created'
  | 'uploaded'
  | 'processing'
  | 'ready'
  | 'failed'
  | 'rejected'

type ProcessingAsset = {
  id?: string
  mediaId?: string
  status?: MediaProcessingStatus
  url?: string
  displayUrl?: string
  thumbnailUrl?: string
  variants?: {
    display?: { url?: string }
    thumbnail?: { url?: string }
  }
  errorMessage?: string
}

type UploadSession = {
  uploadId: string
  mediaId: string
  uploadUrl: string
  uploadHeaders?: Record<string, string>
  expiresAt: string
}

type MediaRequest = <T>(
  path: string,
  options?: RequestInit,
) => Promise<T>

type ProfileUploadDependencies = {
  request?: MediaRequest
  upload?: (
    url: string,
    body: Blob,
    headers?: Record<string, string>,
  ) => Promise<void>
  wait?: (milliseconds: number) => Promise<void>
  onStage?: (
    stage: 'creating_session' | 'uploading' | 'processing',
  ) => void
}

function safeHttpsMediaUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.href : undefined
  } catch {
    return undefined
  }
}

function readyProfileAvatar(
  asset: ProcessingAsset,
): ProfileAvatarAsset | undefined {
  const url = safeHttpsMediaUrl(
    asset.variants?.display?.url ?? asset.displayUrl ?? asset.url,
  )
  const id = asset.id ?? asset.mediaId
  if (!id || !asset.mediaId || !url) return undefined
  return {
    id,
    mediaId: asset.mediaId,
    url,
    thumbnailUrl: safeHttpsMediaUrl(
      asset.variants?.thumbnail?.url ?? asset.thumbnailUrl,
    ),
  }
}

async function waitForProcessedAvatar(params: {
  session: UploadSession
  initialAsset: ProcessingAsset
  request: MediaRequest
  wait: (milliseconds: number) => Promise<void>
}): Promise<ProfileAvatarAsset> {
  let asset = params.initialAsset

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const ready = readyProfileAvatar(asset)
    if ((asset.status === 'ready' || !asset.status) && ready) return ready
    if (asset.status === 'failed' || asset.status === 'rejected') {
      throw new Error(
        asset.errorMessage || 'Ảnh chưa đạt yêu cầu an toàn. Hãy chọn ảnh khác.',
      )
    }

    await params.wait(1_000)
    const status = await params.request<{ asset: ProcessingAsset }>(
      `/api/v1/media/upload-sessions/${encodeURIComponent(params.session.uploadId)}`,
    )
    asset = status.asset
  }

  throw new Error('Ảnh vẫn đang được xử lý. Hãy thử lại sau ít phút.')
}

async function uploadProfileAvatarLegacy(
  file: File,
  request: MediaRequest,
): Promise<ProfileAvatarAsset> {
  const form = new FormData()
  form.append('file', file, file.name || 'profile-avatar.webp')
  form.append('permanent', '1')
  form.append('assetType', 'aikids-profile-avatar')
  form.append('purpose', 'profile_avatar')
  form.append('tags', JSON.stringify(['profile_avatar', 'private']))

  const res = await request<{
    asset: ProfileAvatarAsset
  }>('/api/media/upload', {
    method: 'POST',
    body: form,
  })

  if (!res.asset?.id || !res.asset.url) {
    throw new Error('StoryMee chưa trả về ảnh đại diện hợp lệ.')
  }
  return res.asset
}

/**
 * Preferred flow:
 * Hub creates an owner-bound session → browser PUTs directly to StoryMee
 * Storage without auth headers → Hub finalizes and returns the safe derivative.
 *
 * Legacy upload through Hub is used only while an older deployment reports
 * that upload sessions are not implemented.
 */
export async function uploadProfileAvatar(
  file: File,
  dependencies: ProfileUploadDependencies = {},
): Promise<ProfileAvatarAsset> {
  validateProfileAvatarFile(file)
  const request = dependencies.request ?? api
  const upload = dependencies.upload ?? uploadToStoryMeeStorage
  const wait = dependencies.wait ?? ((milliseconds) =>
    new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds)))

  let session: UploadSession
  try {
    dependencies.onStage?.('creating_session')
    session = await request<UploadSession>('/api/v1/media/upload-sessions', {
      method: 'POST',
      body: JSON.stringify({
        purpose: 'profile_avatar',
        fileName: file.name || 'profile-avatar.webp',
        contentType: file.type,
        size: file.size,
      }),
    })
  } catch (error) {
    const legacyHub =
      error instanceof ApiError &&
      (error.status === 404 || error.status === 405 || error.status === 501)
    if (!legacyHub) throw error
    return uploadProfileAvatarLegacy(file, request)
  }

  if (!session.uploadId || !session.mediaId || !session.uploadUrl) {
    throw new Error('StoryMee chưa tạo được phiên upload hợp lệ.')
  }

  dependencies.onStage?.('uploading')
  await upload(session.uploadUrl, file, session.uploadHeaders)

  const finalized = await request<{ asset: ProcessingAsset }>(
    `/api/v1/media/upload-sessions/${encodeURIComponent(session.uploadId)}/finalize`,
    {
      method: 'POST',
      body: JSON.stringify({ mediaId: session.mediaId }),
    },
  )
  dependencies.onStage?.('processing')
  return waitForProcessedAvatar({
    session,
    initialAsset: finalized.asset,
    request,
    wait,
  })
}

export type ProfileAvatarReference = {
  mediaId?: string
  url: string
}

export function profileAvatarUpdateBody(
  avatar: ProfileAvatarReference,
): { avatarMediaId?: string; avatarUrl: string } {
  return {
    ...(avatar.mediaId ? { avatarMediaId: avatar.mediaId } : {}),
    avatarUrl: avatar.url,
  }
}

/**
 * Transition-safe account update. New account services persist media ID;
 * older deployments receive the existing URL-only payload after a schema
 * rejection. Authentication/ownership failures always fail closed.
 */
export async function updateMyProfileAvatar(
  avatar: ProfileAvatarReference,
  request: (body: Record<string, string>) => Promise<unknown> = (body) => api(
    '/api/v1/account/family/me/avatar',
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  ),
): Promise<void> {
  try {
    await request(profileAvatarUpdateBody(avatar))
  } catch (error) {
    const canUseLegacyContract =
      avatar.mediaId &&
      error instanceof ApiError &&
      (error.status === 400 || error.status === 422)
    if (!canUseLegacyContract) throw error
    await request({ avatarUrl: avatar.url })
  }
}

/**
 * Promote a course-created asset to Vidtory media (not free photo upload).
 * Students may only use in-course drawings/generations as refs.
 */
export async function promoteCourseAsset(assetId: string): Promise<{
  id: string
  url: string
  mediaId: string
  storageBackend: string
}> {
  const res = await api<{
    asset: {
      id: string
      url: string
      mediaId: string
      storageBackend: string
    }
  }>('/api/media/promote', {
    method: 'POST',
    body: JSON.stringify({ assetId, purpose: 'course_ref_promote' }),
  })
  return res.asset
}

/** CMS-only free upload (teacher/admin). Students get 403. */
export async function uploadCmsImage(params: {
  file: File | Blob
  fileName?: string
  purpose?: string
  questId?: string | null
}): Promise<{
  id: string
  url: string
  mediaId: string
  storageBackend: string
}> {
  const fileName =
    params.fileName ||
    (params.file instanceof File ? params.file.name : 'upload.png')

  const form = new FormData()
  form.append('file', params.file, fileName)
  form.append('permanent', '1')
  form.append('assetType', 'aikids')
  form.append('tags', JSON.stringify([
    params.purpose ?? 'cms_media',
    ...(params.questId ? [`quest:${params.questId}`] : []),
  ]))

  const res = await api<{
    asset: {
      id: string
      url: string
      mediaId: string
      storageBackend: string
    }
  }>('/api/media/upload', {
    method: 'POST',
    body: form,
  })
  return res.asset
}
