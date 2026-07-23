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
