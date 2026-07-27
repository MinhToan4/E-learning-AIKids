import { api, fetchRemoteBlob, openAuthorizedStream } from './api'
import { environment } from '@/shared/config/environment'

export type CreativeImageOutput = {
  url: string
  assetId?: string
  projectId?: string
  persisted: boolean
}

export type CreativeStoryOutput = {
  content: string
  projectId?: string
  persisted: boolean
}

type Job = {
  id?: string
  jobId?: string
  status?: string
  outputUrls?: string[] | string | null
  inputParams?: Record<string, unknown>
  errorMessage?: string | null
}

async function defaultWorkspace(): Promise<string> {
  const result = await api<{
    workspaces: Array<{ ipId: string }>
    defaultIpId?: string | null
  }>('/api/v1/account/workspaces')
  if (result.defaultIpId) return result.defaultIpId
  if (result.workspaces[0]?.ipId) return result.workspaces[0].ipId
  const created = await api<{ ipId?: string; id?: string }>(
    '/api/v1/account/workspaces',
    {
      method: 'POST',
      body: JSON.stringify({ name: 'AIKids Creative' }),
    },
  )
  const id = created.ipId ?? created.id
  if (!id) throw new Error('Không tạo được không gian sáng tạo StoryMee.')
  return id
}

function outputUrls(value: Job['outputUrls']): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value !== 'string') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []
  } catch {
    return value ? [value] : []
  }
}

async function waitForJob(jobId: string): Promise<Job> {
  try {
    return await waitForJobStream(jobId)
  } catch {
    // SSE can be interrupted by proxies or a deploy. Fall back to bounded,
    // progressively slower polling instead of the old fixed 1.5s loop.
  }
  const delays = [2_000, 3_000, 5_000, 8_000, 10_000]
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const job = await api<Job>(`/api/v1/jobs/${encodeURIComponent(jobId)}`)
    const status = String(job.status ?? '').toLowerCase()
    if (['done', 'success', 'completed'].includes(status)) return job
    if (['failed', 'error', 'cancelled', 'canceled'].includes(status)) {
      throw new Error(job.errorMessage || 'StoryMee không hoàn thành được nội dung.')
    }
    await new Promise((resolve) =>
      window.setTimeout(resolve, delays[Math.min(attempt, delays.length - 1)]),
    )
  }
  throw new Error('StoryMee đang xử lý lâu hơn dự kiến. Thử lại sau nhé.')
}

async function waitForJobStream(jobId: string): Promise<Job> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 5 * 60_000)
  try {
    const response = await openAuthorizedStream(
      `/api/v1/jobs/${encodeURIComponent(jobId)}/events`,
      controller.signal,
    )
    if (!response.body) throw new Error('Trình duyệt không hỗ trợ luồng trạng thái.')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) throw new Error('Luồng trạng thái đã đóng trước khi job hoàn tất.')
      buffer += decoder.decode(value, { stream: true })
      const frames = buffer.split(/\r?\n\r?\n/)
      buffer = frames.pop() ?? ''
      for (const frame of frames) {
        const data = frame
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trim())
          .join('\n')
        if (!data) continue
        const job = JSON.parse(data) as Job
        const status = String(job.status ?? '').toLowerCase()
        if (['done', 'success', 'completed'].includes(status)) {
          controller.abort()
          return job
        }
        if (['failed', 'error', 'cancelled', 'canceled'].includes(status)) {
          throw new Error(job.errorMessage || 'StoryMee không hoàn thành được nội dung.')
        }
      }
    }
  } finally {
    window.clearTimeout(timeout)
    controller.abort()
  }
}

async function createJob(
  jobType: 'image' | 'llm',
  inputParams: Record<string, unknown>,
) {
  const ipId = await defaultWorkspace()
  const created = await api<Job>('/api/v1/jobs', {
    method: 'POST',
    body: JSON.stringify({ jobType, ipId, inputParams }),
  })
  const id = created.id ?? created.jobId
  if (!id) throw new Error('Không nhận được Job ID từ StoryMee.')
  return waitForJob(id)
}

export async function generateCreativeImage(input: {
  prompt: string
  imageDataUrl?: string
  kind?: 'character' | 'art' | 'comic' | 'video'
  title?: string
  details?: Record<string, unknown>
}): Promise<CreativeImageOutput> {
  if (environment.isLocalApi) {
    const assetIds: string[] = []
    if (input.imageDataUrl) {
      const sketch = await api<{
        asset: { id: string; url: string }
      }>('/api/creative/sketch', {
        method: 'POST',
        body: JSON.stringify({
          title: input.title ?? 'Bản phác thảo của con',
          sketchDataUrl: input.imageDataUrl,
        }),
      })
      assetIds.push(sketch.asset.id)
    }
    const created = await api<{
      asset?: { id: string; url: string }
      project?: { id: string; url?: string }
    }>('/api/creative/create', {
      method: 'POST',
      body: JSON.stringify({
        kind: input.kind ?? 'art',
        title: input.title,
        prompt: input.prompt,
        details: input.details ?? {},
        assetIds,
      }),
    })
    const url = created.asset?.url ?? created.project?.url
    if (!url) throw new Error('Vidtory chưa trả về ảnh.')
    return {
      url,
      assetId: created.asset?.id,
      projectId: created.project?.id,
      persisted: true,
    }
  }

  const references: string[] = []
  if (input.imageDataUrl) {
    const [header, encoded = ''] = input.imageDataUrl.split(',', 2)
    const mime = header.match(/^data:([^;]+)/)?.[1] ?? 'image/png'
    const binary = atob(encoded)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }
    const blob = new Blob([bytes], { type: mime })
    const form = new FormData()
    form.append('file', blob, 'aikids-reference.png')
    form.append('temporary', '1')
    form.append('assetType', 'aikids-reference')
    const uploaded = await api<{ url?: string; imageUrl?: string }>(
      '/api/v1/media/upload?temporary=1&assetType=aikids-reference',
      { method: 'POST', body: form },
    )
    const url = uploaded.url ?? uploaded.imageUrl
    if (url) references.push(url)
  }
  const job = await createJob('image', {
    prompt: input.prompt,
    ...(references.length
      ? {
          reference_image_url: references[0],
          reference_image_urls: references,
        }
      : {}),
  })
  const url = outputUrls(job.outputUrls)[0]
  if (!url) throw new Error('StoryMee chưa trả về ảnh.')
  return { url, persisted: false }
}

export async function generateCreativeStory(
  prompt: string,
  title = 'Câu chuyện của con',
): Promise<CreativeStoryOutput> {
  if (environment.isLocalApi) {
    const created = await api<{
      content: string
      project: { id: string }
    }>('/api/creative/create', {
      method: 'POST',
      body: JSON.stringify({
        kind: 'story',
        title,
        prompt,
        details: {},
        assetIds: [],
      }),
    })
    if (!created.content?.trim()) {
      throw new Error('Vidtory chưa trả về nội dung truyện.')
    }
    return {
      content: created.content,
      projectId: created.project.id,
      persisted: true,
    }
  }

  const job = await createJob('llm', { prompt })
  const text = String(job.inputParams?.outputText ?? '').trim()
  if (!text) throw new Error('StoryMee chưa trả về nội dung truyện.')
  return { content: text, persisted: false }
}

export async function saveCreativeImage(
  output: CreativeImageOutput,
  metadata: Record<string, unknown>,
): Promise<void> {
  if (output.persisted) return
  await api('/api/media/promote', {
    method: 'POST',
    body: JSON.stringify({ url: output.url, ...metadata }),
  })
}

export async function saveCreativeStory(
  output: CreativeStoryOutput,
  metadata: Record<string, unknown>,
): Promise<void> {
  if (output.persisted) return
  await api('/api/media/promote', {
    method: 'POST',
    body: JSON.stringify({ content: output.content, ...metadata }),
  })
}

export async function fetchCreativeDownload(url: string): Promise<Blob> {
  return fetchRemoteBlob(url)
}
