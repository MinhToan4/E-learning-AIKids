import { api } from './api'

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
  const buf = await params.file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  const fileBase64 = btoa(binary)
  const mime = params.file.type || 'image/png'
  const fileName =
    params.fileName ||
    (params.file instanceof File ? params.file.name : 'upload.png')

  const res = await api<{
    asset: {
      id: string
      url: string
      mediaId: string
      storageBackend: string
    }
  }>('/api/media/upload', {
    method: 'POST',
    body: JSON.stringify({
      fileBase64,
      fileName,
      mime,
      purpose: params.purpose ?? 'cms_media',
      questId: params.questId ?? null,
    }),
  })
  return res.asset
}
