import { api, fetchRemoteBlob } from './api'

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
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const job = await api<Job>(`/api/v1/jobs/${encodeURIComponent(jobId)}`)
    const status = String(job.status ?? '').toLowerCase()
    if (['done', 'success', 'completed'].includes(status)) return job
    if (['failed', 'error', 'cancelled', 'canceled'].includes(status)) {
      throw new Error(job.errorMessage || 'StoryMee không hoàn thành được nội dung.')
    }
    await new Promise((resolve) => window.setTimeout(resolve, 1_500))
  }
  throw new Error('StoryMee đang xử lý lâu hơn dự kiến. Thử lại sau nhé.')
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
}): Promise<string> {
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
  return url
}

export async function generateCreativeStory(prompt: string): Promise<string> {
  const job = await createJob('llm', { prompt })
  const text = String(job.inputParams?.outputText ?? '').trim()
  if (!text) throw new Error('StoryMee chưa trả về nội dung truyện.')
  return text
}

export async function fetchCreativeDownload(url: string): Promise<Blob> {
  return fetchRemoteBlob(url)
}
