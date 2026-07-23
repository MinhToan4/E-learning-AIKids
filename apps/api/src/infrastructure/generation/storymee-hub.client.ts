import { env } from '../../config/env.js'
import type {
  MediaUploadClient,
} from './vidtory.media.js'
import type {
  VidtoryClientLike,
} from './vidtory.adapter.js'

type HubTask = {
  task?: {
    id?: string
    error?: unknown
    media_urls?: unknown
    metadata?: { state?: string }
    response?: unknown
  }
  job_id?: string
  queue_id?: string
  error?: unknown
}

function authHeaders(extra?: HeadersInit): Headers {
  if (!env.hubApiKey) {
    throw Object.assign(
      new Error('HUB_API_KEY is required for StoryMee media routing'),
      { statusCode: 503 },
    )
  }
  const headers = new Headers(extra)
  headers.set('Authorization', `Bearer ${env.hubApiKey}`)
  return headers
}

async function hubJson(path: string, init: RequestInit): Promise<HubTask> {
  const response = await fetch(`${env.storymeeHubUrl}${path}`, {
    ...init,
    headers: authHeaders(init.headers),
    signal: AbortSignal.timeout(env.hubMediaTimeoutMs),
  })
  const data = await response.json().catch(() => ({})) as HubTask
  if (!response.ok) {
    const message = typeof data.error === 'string'
      ? data.error
      : `StoryMee Hub returned ${response.status}`
    throw Object.assign(new Error(message), { statusCode: 502 })
  }
  return data
}

function outputUrl(task: HubTask['task']): string | null {
  const urls = task?.media_urls
  if (Array.isArray(urls)) {
    const first = urls.find((item) => typeof item === 'string' && item)
    if (typeof first === 'string') return first
  }
  return null
}

async function waitForMedia(jobId: string): Promise<string> {
  const deadline = Date.now() + env.hubMediaTimeoutMs
  while (Date.now() < deadline) {
    const data = await hubJson(`/v1/media/tasks/${encodeURIComponent(jobId)}`, {
      method: 'GET',
    })
    const state = data.task?.metadata?.state
    if (state === 'SUCCEEDED') {
      const url = outputUrl(data.task)
      if (!url) throw new Error('StoryMee Hub completed without a media URL')
      return url
    }
    if (state === 'FAILED' || state === 'CANCELLED') {
      throw new Error(
        typeof data.task?.error === 'string'
          ? data.task.error
          : `StoryMee media job ${state.toLowerCase()}`,
      )
    }
    await new Promise((resolve) => setTimeout(resolve, env.hubMediaPollMs))
  }
  throw new Error('StoryMee media job timed out')
}

async function generate(
  kind: 'image' | 'video',
  params: Record<string, unknown>,
): Promise<{ id: string; result: string }> {
  const refs = [
    ...(Array.isArray(params.startImages) ? params.startImages : []),
    ...(typeof params.refImageUrl === 'string' ? [params.refImageUrl] : []),
  ].filter((item, index, rows) => typeof item === 'string' && rows.indexOf(item) === index)
  const submitted = await hubJson(`/v1/media/${kind}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: env.hubMediaProvider || 'auto',
      prompt: params.prompt,
      reference_image_url: refs[0],
      reference_image_urls: refs,
      config: {
        aspect_ratio: params.aspectRatio,
        duration_seconds: params.duration,
        resolution: params.resolution,
        model_id: params.modelId,
        generator_mode: params.mode,
      },
      num_outputs: 1,
      entity_type: 'aikids_learning',
    }),
  })
  const jobId = String(submitted.job_id ?? submitted.queue_id ?? '')
  if (!jobId) throw new Error('StoryMee Hub did not return a job id')
  return { id: jobId, result: await waitForMedia(jobId) }
}

export function createStoryMeeHubMediaClient(): VidtoryClientLike {
  return {
    models: {
      generateImage: (params) => generate('image', params),
      generateVideo: (params) => generate('video', params),
    },
  }
}

export function createStoryMeeMediaUploadClient(
  _userId: string,
): MediaUploadClient {
  return {
    media: {
      upload: async ({ file, fileName, metadata }) => {
        const source = file instanceof Blob ? await file.arrayBuffer() : file
        const view = source instanceof ArrayBuffer
          ? new Uint8Array(source)
          : new Uint8Array(source)
        const bytes = new Uint8Array(view.byteLength)
        bytes.set(view)
        const presign = await hubJson('/v1/storage/presign', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bucket: 'media-ref',
            filename: fileName ?? 'upload.bin',
          }),
        }) as Record<string, unknown>
        const uploadUrl = String(presign.upload_url ?? '')
        const objectName = String(presign.object_name ?? '')
        if (!uploadUrl || !objectName) {
          throw new Error('StoryMee Hub did not return a storage upload URL')
        }
        const uploaded = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: bytes,
          signal: AbortSignal.timeout(env.hubMediaTimeoutMs),
        })
        if (!uploaded.ok) {
          throw new Error(`StoryMee storage upload returned ${uploaded.status}`)
        }
        return {
          id: objectName,
          url: `${env.storymeeStorageUrl}/media-ref/${encodeURIComponent(objectName)}`,
          fileName: fileName ?? objectName,
          fileType: 'application/octet-stream',
          fileSize: bytes.byteLength,
          metadata,
        }
      },
    },
  }
}
